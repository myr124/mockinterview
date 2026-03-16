import type { VoiceProvider, VoiceConfig } from "./types";
import type { Language, VoiceStatus } from "@/types/interview";

export class GeminiVoiceProvider implements VoiceProvider {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private status: VoiceStatus = "idle";
  private config: VoiceConfig | null = null;
  private playbackContext: AudioContext | null = null;

  // Scheduler state — replaces the queue + onended chain
  private nextPlayTime = 0;         // AudioContext clock time for next chunk
  private readonly SCHEDULE_AHEAD = 0.1; // seconds to schedule ahead of current time

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
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsPort = process.env.NEXT_PUBLIC_GEMINI_WS_PORT ?? "3001";
      const wsUrl = `${wsProtocol}//${window.location.hostname}:${wsPort}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => this.onWsOpen();
      this.ws.onmessage = (e) => this.handleServerMessage(e);
      this.ws.onerror = () => this.setStatus("error");
      this.ws.onclose = () => {
        if (this.status !== "idle") this.setStatus("idle");
      };
    } catch (err) {
      console.error("Gemini voice connect error:", err);
      this.setStatus("error");
      throw err;
    }
  }

  private async onWsOpen() {
    if (!this.ws || !this.config) return;

    this.ws.send(JSON.stringify({ type: "setup", systemPrompt: this.config.systemPrompt }));

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext({ sampleRate: 48000 });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // ScriptProcessor for downsampling 48kHz → 16kHz
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.scriptProcessor.onaudioprocess = (e) => this.processAudioChunk(e);
      source.connect(this.scriptProcessor);
      // Connect to destination so the node stays active (output is silent — input-only)
      this.scriptProcessor.connect(this.audioContext.destination);

      this.playbackContext = new AudioContext({ sampleRate: 24000 });
      this.nextPlayTime = 0;
      this.setStatus("connected");
    } catch (err) {
      console.error("Microphone access failed:", err);
      this.setStatus("error");
    }
  }

  private processAudioChunk(e: AudioProcessingEvent) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const inputData = e.inputBuffer.getChannelData(0);
    // Downsample 48kHz → 16kHz (3:1)
    const downsampled = new Int16Array(Math.floor(inputData.length / 3));
    for (let i = 0; i < downsampled.length; i++) {
      const sample = inputData[i * 3];
      downsampled[i] = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
    }

    // Use Uint8Array view to avoid spread overflow on large buffers
    const bytes = new Uint8Array(downsampled.buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    this.ws.send(JSON.stringify({ type: "audio", data: btoa(binary) }));
  }

  private scheduleChunk(rawBuffer: ArrayBuffer) {
    const ctx = this.playbackContext;
    if (!ctx) return;

    // Decode PCM 16-bit LE → Float32
    const int16 = new Int16Array(rawBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

    const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
    audioBuffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    // Schedule at precise clock time — no gaps between chunks
    const now = ctx.currentTime;
    const startAt = Math.max(now + this.SCHEDULE_AHEAD, this.nextPlayTime);
    source.start(startAt);

    // Next chunk starts exactly when this one ends
    this.nextPlayTime = startAt + audioBuffer.duration;
  }

  private handleServerMessage(e: MessageEvent) {
    if (!this.config) return;

    try {
      const msg = JSON.parse(e.data);

      if (msg.type === "audio" && this.playbackContext) {
        const binary = atob(msg.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        this.scheduleChunk(bytes.buffer);
      } else if (msg.type === "transcript") {
        this.config.onTranscript({
          id: crypto.randomUUID(),
          role: msg.role,
          text: msg.text,
          timestamp: Date.now(),
        });
      } else if (msg.type === "code_edit") {
        this.config.onCodeEdit(msg);
      }
    } catch (err) {
      console.error("Gemini message parse error:", err);
    }
  }

  sendCodeUpdate(code: string, language: Language): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: "code_update", code, language }));
  }

  disconnect(): void {
    this.scriptProcessor?.disconnect();
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    this.audioContext?.close();
    this.playbackContext?.close();
    this.ws?.close();

    this.ws = null;
    this.audioContext = null;
    this.playbackContext = null;
    this.mediaStream = null;
    this.scriptProcessor = null;
    this.nextPlayTime = 0;

    this.setStatus("idle");
  }
}
