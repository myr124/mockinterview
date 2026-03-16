import type { VoiceProvider } from "./types";
import type { VoiceProviderType } from "@/types/interview";

export async function createVoiceProvider(type: VoiceProviderType): Promise<VoiceProvider> {
  if (type === "openai") {
    const { OpenAIVoiceProvider } = await import("./openai-provider");
    return new OpenAIVoiceProvider();
  } else {
    const { GeminiVoiceProvider } = await import("./gemini-provider");
    return new GeminiVoiceProvider();
  }
}
