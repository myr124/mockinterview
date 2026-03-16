"use client";

import { VoiceController } from "@/components/voice/VoiceController";
import { TranscriptView } from "@/components/voice/TranscriptView";
import { ProviderSwitcher } from "@/components/voice/ProviderSwitcher";
import { Button } from "@/components/ui/button";
import { useInterviewStore } from "@/store/interviewStore";
import { Trash2 } from "lucide-react";

export function VoicePanel() {
  const { clearTurns, isVoiceActive } = useInterviewStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <span className="text-sm font-medium text-muted-foreground">Voice</span>
        <div className="flex-1" />
        <ProviderSwitcher />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={clearTurns}
          title="Clear transcript"
          disabled={isVoiceActive}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <TranscriptView />
      </div>

      <div className="p-3 border-t">
        <VoiceController />
      </div>
    </div>
  );
}
