import type { CoachProvider, CoachProviderId } from "../types";
import { createGeminiProvider } from "./gemini";
import { createMockProvider } from "./mock";
import { createOllamaProvider } from "./ollama";
import { createOpenRouterProvider } from "./openrouter";

export type CoachProviderConfig = {
  provider: CoachProviderId;
  model: string;
  geminiApiKey?: string;
  openRouterApiKey?: string;
  ollamaBaseUrl: string;
};

function parseProviderId(value: string | undefined): CoachProviderId {
  if (value === "ollama") return "ollama";
  if (value === "openrouter") return "openrouter";
  if (value === "gemini") return "gemini";
  return "mock";
}

/** Read provider selection from env. Swap models by changing COACH_PROVIDER / COACH_MODEL. */
export function getCoachProviderConfig(): CoachProviderConfig {
  return {
    provider: parseProviderId(process.env.COACH_PROVIDER),
    model: process.env.COACH_MODEL ?? "llama3.2",
    geminiApiKey: process.env.GEMINI_API_KEY,
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
  };
}

export function createCoachProvider(
  config: CoachProviderConfig = getCoachProviderConfig(),
): CoachProvider {
  switch (config.provider) {
    case "ollama":
      return createOllamaProvider(config.ollamaBaseUrl, config.model);
    case "openrouter": {
      if (!config.openRouterApiKey) {
        console.warn(
          "COACH_PROVIDER=openrouter but OPENROUTER_API_KEY is missing — falling back to mock.",
        );
        return createMockProvider(config.model);
      }
      return createOpenRouterProvider(config.openRouterApiKey, config.model);
    }
    case "gemini": {
      if (!config.geminiApiKey) {
        console.warn(
          "COACH_PROVIDER=gemini but GEMINI_API_KEY is missing — falling back to mock.",
        );
        return createMockProvider(config.model);
      }
      return createGeminiProvider(config.geminiApiKey, config.model);
    }
    default:
      return createMockProvider(config.model);
  }
}
