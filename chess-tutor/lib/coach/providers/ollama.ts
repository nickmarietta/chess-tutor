import type { CoachPrompt, CoachProvider } from "../types";

type OllamaChatResponse = {
  message?: { content?: string };
  error?: string;
};

export function createOllamaProvider(
  baseUrl: string,
  model: string,
): CoachProvider {
  const chatUrl = `${baseUrl.replace(/\/$/, "")}/api/chat`;

  return {
    id: "ollama",
    model,
    async complete(prompt: CoachPrompt): Promise<string> {
      let res: Response;
      try {
        res = await fetch(chatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: prompt.system },
              { role: "user", content: prompt.user },
            ],
            stream: false,
            options: {
              temperature: 0.5,
              num_predict: 350,
            },
          }),
        });
      } catch {
        throw new Error(
          `Could not reach Ollama at ${baseUrl}. Start it with \`ollama serve\` and pull your model with \`ollama pull ${model}\`.`,
        );
      }

      const data = (await res.json()) as OllamaChatResponse;

      if (!res.ok) {
        const message =
          data.error ?? `Ollama request failed (${res.status}).`;
        throw new Error(message);
      }

      const text = data.message?.content?.trim();
      if (!text) {
        throw new Error(
          `Ollama returned an empty response. Is the model "${model}" pulled? Run: ollama pull ${model}`,
        );
      }

      return text;
    },
  };
}
