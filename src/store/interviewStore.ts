import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProblemDetail } from "@/types/leetcode";
import type {
  Language,
  VoiceStatus,
  VoiceProviderType,
  Turn,
  CodeEditSuggestion,
} from "@/types/interview";

interface InterviewState {
  // Problem
  currentProblem: ProblemDetail | null;
  setCurrentProblem: (problem: ProblemDetail) => void;

  // Editor
  code: string;
  language: Language;
  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;
  isAIEdit: boolean;
  setIsAIEdit: (v: boolean) => void;

  // Voice
  voiceProvider: VoiceProviderType;
  setVoiceProvider: (p: VoiceProviderType) => void;
  voiceStatus: VoiceStatus;
  setVoiceStatus: (s: VoiceStatus) => void;
  isVoiceActive: boolean;
  setIsVoiceActive: (v: boolean) => void;

  // Transcript
  turns: Turn[];
  addTurn: (turn: Turn) => void;
  clearTurns: () => void;

  // Code edit suggestion
  pendingCodeEdit: CodeEditSuggestion | null;
  setPendingCodeEdit: (suggestion: CodeEditSuggestion | null) => void;

  // Reset session
  resetSession: () => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      currentProblem: null,
      setCurrentProblem: (problem) => set({ currentProblem: problem }),

      code: "",
      language: "python3",
      setCode: (code) => set({ code }),
      setLanguage: (language) => set({ language }),
      isAIEdit: false,
      setIsAIEdit: (v) => set({ isAIEdit: v }),

      voiceProvider: "openai",
      setVoiceProvider: (voiceProvider) => set({ voiceProvider }),
      voiceStatus: "idle",
      setVoiceStatus: (voiceStatus) => set({ voiceStatus }),
      isVoiceActive: false,
      setIsVoiceActive: (isVoiceActive) => set({ isVoiceActive }),

      turns: [],
      addTurn: (turn) => set((s) => ({ turns: [...s.turns, turn] })),
      clearTurns: () => set({ turns: [] }),

      pendingCodeEdit: null,
      setPendingCodeEdit: (pendingCodeEdit) => set({ pendingCodeEdit }),

      resetSession: () =>
        set({
          code: "",
          turns: [],
          voiceStatus: "idle",
          isVoiceActive: false,
          isAIEdit: false,
          pendingCodeEdit: null,
        }),
    }),
    {
      name: "interview-store",
      partialize: (state) => ({
        voiceProvider: state.voiceProvider,
        language: state.language,
      }),
    }
  )
);
