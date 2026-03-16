import type { VoiceProvider, VoiceConfig } from "./types";
import type { Language, VoiceStatus } from "@/types/interview";

const SUGGEST_CODE_EDIT_TOOL = {
  type: "function",
  name: "suggest_code_edit",
  description:
    "Suggest a code edit to the candidate. Use sparingly — only for syntax fixes or when explicitly asked to demonstrate.",
  parameters: {
    type: "object",
    properties: {
      newCode: {
        type: "string",
        description: "The complete updated code to replace the editor contents.",
      },
      explanation: {
        type: "string",
        description: "Brief spoken explanation of what was changed and why.",
      },
    },
    required: ["newCode", "explanation"],
  },
};

export class OpenAIVoiceProvider implements VoiceProvider {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private status: VoiceStatus = "idle";
  private config: VoiceConfig | null = null;

  getStatus(): VoiceStatus {
    return this.status;
  }

  private setStatus(s: VoiceStatus) {
    this.status = s;
    this.config?.onStatusChange(s);
  }

  async connect(config: VoiceConfig): Promise<void> {
    this.config = config;
    this.setStatus("connecting");

    try {
      // 1. Get ephemeral token
      const tokenRes = await fetch("/api/voice/token", { method: "POST" });
      if (!tokenRes.ok) throw new Error("Failed to get voice token");
      const { client_secret } = await tokenRes.json();
      const ephemeralKey = client_secret.value;

      // 2. Set up RTCPeerConnection
      this.pc = new RTCPeerConnection();

      // 3. Audio output
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      this.pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      // 4. Mic input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => this.pc!.addTrack(t, stream));

      // 5. Data channel
      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.onopen = () => this.onDataChannelOpen();
      this.dc.onmessage = (e) => this.handleServerEvent(JSON.parse(e.data));

      // 6. SDP exchange
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const sdpRes = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      );
      if (!sdpRes.ok) throw new Error("SDP exchange failed");

      const answerSdp = await sdpRes.text();
      await this.pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (err) {
      console.error("OpenAI voice connect error:", err);
      this.setStatus("error");
      throw err;
    }
  }

  private onDataChannelOpen() {
    if (!this.dc || !this.config) return;

    // Configure session
    this.dc.send(
      JSON.stringify({
        type: "session.update",
        session: {
          instructions: this.config.systemPrompt,
          voice: "alloy",
          input_audio_transcription: { model: "whisper-1" },
          tools: [SUGGEST_CODE_EDIT_TOOL],
          tool_choice: "auto",
        },
      })
    );

    this.setStatus("connected");
  }

  private handleServerEvent(event: Record<string, unknown>) {
    if (!this.config) return;

    switch (event.type) {
      case "conversation.item.input_audio_transcription.completed": {
        const transcript = event.transcript as string;
        if (transcript?.trim()) {
          this.config.onTranscript({
            id: crypto.randomUUID(),
            role: "user",
            text: transcript,
            timestamp: Date.now(),
          });
        }
        break;
      }

      case "response.audio_transcript.done": {
        const transcript = event.transcript as string;
        if (transcript?.trim()) {
          this.config.onTranscript({
            id: crypto.randomUUID(),
            role: "assistant",
            text: transcript,
            timestamp: Date.now(),
          });
        }
        break;
      }

      case "response.function_call_arguments.done": {
        const name = event.name as string;
        const callId = event.call_id as string;
        if (name === "suggest_code_edit") {
          try {
            const args = JSON.parse(event.arguments as string);
            this.config.onCodeEdit(args);

            // Send function output back to model
            this.dc?.send(
              JSON.stringify({
                type: "conversation.item.create",
                item: {
                  type: "function_call_output",
                  call_id: callId,
                  output: JSON.stringify({ success: true }),
                },
              })
            );
            this.dc?.send(JSON.stringify({ type: "response.create" }));
          } catch (err) {
            console.error("Failed to parse suggest_code_edit args:", err);
          }
        }
        break;
      }
    }
  }

  sendCodeUpdate(code: string, language: Language): void {
    if (!this.dc || this.dc.readyState !== "open") return;

    this.dc.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: `[Code update — ${language}]\n\`\`\`${language}\n${code}\n\`\`\``,
            },
          ],
        },
      })
    );
  }

  disconnect(): void {
    this.dc?.close();
    this.pc?.close();
    this.dc = null;
    this.pc = null;
    this.setStatus("idle");
  }
}
