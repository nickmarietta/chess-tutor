import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CoachPrompt, CoachProvider } from "../types";

export function createGeminiProvider(
  apiKey: string,
  model: string,
): CoachProvider {
  const client = new GoogleGenerativeAI(apiKey);

  return {
    id: "gemini",
    model,
    async complete(prompt: CoachPrompt): Promise<string> {
      const modelWithSystem = client.getGenerativeModel({
        model,
        systemInstruction: prompt.system,
      });

      const result = await modelWithSystem.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt.user }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      });

      const text = result.response.text()?.trim();
      if (!text) {
        throw new Error("Gemini returned an empty coaching response.");
      }
      return text;
    },
  };
}
