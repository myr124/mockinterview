import { createServer } from "http";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

const GEMINI_WS_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

const SUGGEST_CODE_EDIT_TOOL = {
  functionDeclarations: [
    {
      name: "suggest_code_edit",
      description:
        "Suggest a code edit to the candidate. Use sparingly — only for syntax fixes or when explicitly asked to demonstrate.",
      parameters: {
        type: "OBJECT",
        properties: {
          newCode: { type: "STRING", description: "The complete updated code." },
          explanation: { type: "STRING", description: "Brief spoken explanation." },
        },
        required: ["newCode", "explanation"],
      },
    },
  ],
};

function safeClose(ws: WebSocket) {
  if (ws.readyState === WebSocket.CONNECTING) {
    ws.terminate();
  } else {
    ws.close();
  }
}

function connectGemini(
  clientWs: WebSocket,
  systemPrompt: string,
  apiKey: string
): WebSocket {
  const geminiWs = new WebSocket(`${GEMINI_WS_URL}?key=${apiKey}`);

  geminiWs.on("unexpected-response", (_req, res) => {
    let body = "";
    res.on("data", (chunk: Buffer) => (body += chunk));
    res.on("end", () => {
      console.error(`[gemini-ws] rejected: HTTP ${res.statusCode} — ${body.slice(0, 500)}`);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: "error", message: `Gemini rejected: HTTP ${res.statusCode}` }));
        clientWs.close();
      }
    });
  });

  geminiWs.on("open", () => {
    console.log("[gemini-ws] connected to Gemini Live");
    geminiWs.send(
      JSON.stringify({
        setup: {
          model: "models/gemini-2.5-flash-native-audio-latest",
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
            },
          },
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: [SUGGEST_CODE_EDIT_TOOL],
        },
      })
    );
  });

  geminiWs.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (clientWs.readyState !== WebSocket.OPEN) return;

      if (msg.setupComplete !== undefined) {
        console.log("[gemini-ws] setup complete");
        clientWs.send(JSON.stringify({ type: "ready" }));
        return;
      }

      const parts = msg.serverContent?.modelTurn?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("audio/pcm")) {
          clientWs.send(JSON.stringify({ type: "audio", data: part.inlineData.data }));
        }
        if (part.text) {
          clientWs.send(JSON.stringify({ type: "transcript", role: "assistant", text: part.text }));
        }
      }

      for (const fc of msg.toolCall?.functionCalls ?? []) {
        if (fc.name === "suggest_code_edit") {
          const args = typeof fc.args === "string" ? JSON.parse(fc.args) : fc.args;
          clientWs.send(JSON.stringify({ type: "code_edit", ...args }));
          geminiWs.send(
            JSON.stringify({
              toolResponse: {
                functionResponses: [
                  { id: fc.id, name: fc.name, response: { output: { success: true } } },
                ],
              },
            })
          );
        }
      }
    } catch (err) {
      console.error("[gemini-ws] message parse error:", err);
    }
  });

  geminiWs.on("error", (err) => {
    if (!err.message.includes("before the connection was established")) {
      console.error("[gemini-ws] error:", err.message);
    }
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: "error", message: err.message }));
    }
  });

  geminiWs.on("close", (code, reason) => {
    const r = reason.toString();
    console.log(`[gemini-ws] closed: ${code}${r ? ` "${r}"` : ""}`);
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
  });

  return geminiWs;
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  // Run WS server on a separate port to avoid conflicts with Next.js's
  // own upgrade handler (Turbopack HMR etc.) on the main HTTP server.
  const wsPort = parseInt(process.env.GEMINI_WS_PORT ?? "3001", 10);
  const wss = new WebSocketServer({ port: wsPort });

  wss.on("connection", (clientWs) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      clientWs.send(JSON.stringify({ type: "error", message: "GEMINI_API_KEY not configured" }));
      clientWs.close();
      return;
    }

    console.log("[client-ws] connected");
    let geminiWs: WebSocket | null = null;

    clientWs.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === "setup") {
          console.log("[client-ws] received setup, connecting to Gemini...");
          geminiWs = connectGemini(clientWs, msg.systemPrompt, apiKey);
          return;
        }

        if (!geminiWs || geminiWs.readyState !== WebSocket.OPEN) return;

        if (msg.type === "audio") {
          geminiWs.send(
            JSON.stringify({
              realtimeInput: {
                mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: msg.data }],
              },
            })
          );
        } else if (msg.type === "code_update") {
          geminiWs.send(
            JSON.stringify({
              clientContent: {
                turns: [
                  {
                    role: "user",
                    parts: [{ text: `[Code update — ${msg.language}]\n\`\`\`\n${msg.code}\n\`\`\`` }],
                  },
                ],
                turnComplete: true,
              },
            })
          );
        }
      } catch (err) {
        console.error("[client-ws] parse error:", err);
      }
    });

    clientWs.on("close", () => {
      console.log("[client-ws] disconnected");
      if (geminiWs) safeClose(geminiWs);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port} [${dev ? "dev" : "prod"}]`);
    console.log(`> Gemini WS proxy on ws://localhost:${wsPort}`);
  });
});
