import type { CoachPrompt, CoachProvider } from "../types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type OpenRouterResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

export function createOpenRouterProvider(
  apiKey: string,
  model: string,
): CoachProvider {
  return {
    id: "openrouter",
    model,
    async complete(prompt: CoachPrompt): Promise<string> {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
          "X-Title": "Chess Tutor",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
          temperature: 0.5,
          max_tokens: 350,
        }),
      });

      const data = (await res.json()) as OpenRouterResponse;

      if (!res.ok) {
        const message =
          data.error?.message ?? `OpenRouter request failed (${res.status}).`;
        throw new Error(message);
      }

      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new Error("OpenRouter returned an empty coaching response.");
      }

      return text;
    },
  };
}
