"use client";

import { useRef, useCallback } from "react";
import { useInterviewStore } from "@/store/interviewStore";
import { createVoiceProvider } from "@/lib/voice/factory";
import { buildSystemPrompt } from "@/lib/prompts/interviewer";
import type { VoiceProvider } from "@/lib/voice/types";
import { toast } from "sonner";

export function useVoiceSession() {
  const providerRef = useRef<VoiceProvider | null>(null);
  const store = useInterviewStore();

  const start = useCallback(async () => {
    if (!store.currentProblem) {
      toast.error("No problem loaded");
      return;
    }

    try {
      const provider = await createVoiceProvider(store.voiceProvider);
      providerRef.current = provider;

      const systemPrompt = buildSystemPrompt(
        store.currentProblem,
        store.code,
        store.language
      );

      await provider.connect({
        provider: store.voiceProvider,
        systemPrompt,
        onTranscript: (turn) => store.addTurn(turn),
        onCodeEdit: (suggestion) => {
          store.setIsAIEdit(true);
          store.setCode(suggestion.newCode);
          store.setPendingCodeEdit(suggestion);
          toast.info(suggestion.explanation, {
            duration: 5000,
            description: "AI suggested a code edit",
          });
          // Clear AI edit flag after 1s to prevent echo
          setTimeout(() => store.setIsAIEdit(false), 1000);
        },
        onStatusChange: (status) => {
          store.setVoiceStatus(status);
          if (status === "error") {
            toast.error("Voice connection error");
            store.setIsVoiceActive(false);
          }
        },
      });

      store.setIsVoiceActive(true);
    } catch (err) {
      console.error("Voice session start failed:", err);
      toast.error("Failed to start voice session");
      store.setIsVoiceActive(false);
    }
  }, [store]);

  const stop = useCallback(() => {
    providerRef.current?.disconnect();
    providerRef.current = null;
    store.setIsVoiceActive(false);
    store.setVoiceStatus("idle");
  }, [store]);

  const toggle = useCallback(() => {
    if (store.isVoiceActive) {
      stop();
    } else {
      start();
    }
  }, [store.isVoiceActive, start, stop]);

  const sendCodeUpdate = useCallback(
    (code: string) => {
      providerRef.current?.sendCodeUpdate(code, store.language);
    },
    [store.language]
  );

  return { start, stop, toggle, sendCodeUpdate };
}
