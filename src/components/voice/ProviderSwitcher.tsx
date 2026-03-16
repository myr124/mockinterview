"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInterviewStore } from "@/store/interviewStore";
import type { VoiceProviderType } from "@/types/interview";

export function ProviderSwitcher() {
  const { voiceProvider, setVoiceProvider, isVoiceActive } = useInterviewStore();

  return (
    <Tabs
      value={voiceProvider}
      onValueChange={(v) => {
        if (!isVoiceActive) setVoiceProvider(v as VoiceProviderType);
      }}
    >
      <TabsList className="h-7">
        <TabsTrigger
          value="openai"
          disabled={isVoiceActive}
          className="text-xs px-3 h-6"
        >
          OpenAI
        </TabsTrigger>
        <TabsTrigger
          value="gemini"
          disabled={isVoiceActive}
          className="text-xs px-3 h-6"
        >
          Gemini
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
