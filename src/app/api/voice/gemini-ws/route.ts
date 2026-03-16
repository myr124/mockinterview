// Gemini Live WebSocket proxy
// Next.js 15 App Router doesn't natively support WebSocket upgrades,
// so this route handles the signaling via a Server-Sent Events or
// returns instructions to use a standalone WS server.
// For production, use a separate WebSocket server or Edge Runtime with WebSocket support.

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message:
        "Gemini WebSocket proxy requires a standalone WS server. See /api/voice/gemini-ws/README.",
    },
    { status: 200 }
  );
}
