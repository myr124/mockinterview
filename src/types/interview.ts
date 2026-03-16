export type Language =
  | "python3"
  | "javascript"
  | "typescript"
  | "java"
  | "cpp"
  | "go"
  | "rust";

export type VoiceStatus = "idle" | "connecting" | "connected" | "error";

export type VoiceProviderType = "openai" | "gemini";

export interface Turn {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

export interface CodeEditSuggestion {
  newCode: string;
  explanation: string;
}
