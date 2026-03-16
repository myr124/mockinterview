import type { Language, VoiceStatus, Turn, CodeEditSuggestion } from "@/types/interview";

export interface VoiceConfig {
  provider: "openai" | "gemini";
  systemPrompt: string;
  onTranscript: (turn: Turn) => void;
  onCodeEdit: (suggestion: CodeEditSuggestion) => void;
  onStatusChange: (status: VoiceStatus) => void;
}

export interface VoiceProvider {
  connect(config: VoiceConfig): Promise<void>;
  disconnect(): void;
  sendCodeUpdate(code: string, language: Language): void;
  getStatus(): VoiceStatus;
}
