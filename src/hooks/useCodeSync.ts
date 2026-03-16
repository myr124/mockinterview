"use client";

import { useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { useInterviewStore } from "@/store/interviewStore";

export function useCodeSync(sendCodeUpdate: (code: string) => void) {
  const { code, isVoiceActive, isAIEdit } = useInterviewStore();
  const [debouncedCode] = useDebounce(code, 500);
  const prevCodeRef = useRef<string>("");

  useEffect(() => {
    // Skip if voice isn't active, or this was an AI-initiated edit (echo prevention)
    if (!isVoiceActive || isAIEdit) return;
    if (debouncedCode === prevCodeRef.current) return;

    prevCodeRef.current = debouncedCode;
    sendCodeUpdate(debouncedCode);
  }, [debouncedCode, isVoiceActive, isAIEdit, sendCodeUpdate]);
}
