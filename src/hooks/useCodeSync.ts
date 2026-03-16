"use client";

import { useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { useInterviewStore } from "@/store/interviewStore";

// Debounce is intentionally long — we only want to sync code when the candidate
// has paused for a while, not on every keystroke. The AI should not react to
// incremental typing; it will read the current code if the candidate asks a question.
const SYNC_DEBOUNCE_MS = 10_000; // 10 seconds of inactivity

export function useCodeSync(sendCodeUpdate: (code: string) => void) {
  const { code, isVoiceActive, isAIEdit } = useInterviewStore();
  const [debouncedCode] = useDebounce(code, SYNC_DEBOUNCE_MS);
  const prevCodeRef = useRef<string>("");

  useEffect(() => {
    if (!isVoiceActive || isAIEdit) return;
    if (debouncedCode === prevCodeRef.current) return;

    prevCodeRef.current = debouncedCode;
    sendCodeUpdate(debouncedCode);
  }, [debouncedCode, isVoiceActive, isAIEdit, sendCodeUpdate]);
}
