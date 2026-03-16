"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInterviewStore } from "@/store/interviewStore";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { useCodeSync } from "@/hooks/useCodeSync";
import { cn } from "@/lib/utils";

export function VoiceController() {
  const { voiceStatus, isVoiceActive } = useInterviewStore();
  const { toggle, sendCodeUpdate } = useVoiceSession();

  useCodeSync(sendCodeUpdate);

  const isConnecting = voiceStatus === "connecting";

  return (
    <Button
      onClick={toggle}
      size="lg"
      variant={isVoiceActive ? "destructive" : "default"}
      className={cn(
        "w-full gap-2",
        isVoiceActive && "animate-pulse"
      )}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Connecting...
        </>
      ) : isVoiceActive ? (
        <>
          <MicOff className="h-5 w-5" />
          End Session
        </>
      ) : (
        <>
          <Mic className="h-5 w-5" />
          Start Interview
        </>
      )}
    </Button>
  );
}
