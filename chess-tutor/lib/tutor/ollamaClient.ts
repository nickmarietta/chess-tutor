export type OllamaConfig = {
  baseUrl: string;
  model: string;
};

export function getOllamaConfig(): OllamaConfig {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
    model: process.env.COACH_MODEL ?? "qwen2.5:7b-instruct",
  };
}

/**
 * Streams a chat completion from Ollama's /api/chat endpoint, yielding each
 * incremental content delta as it arrives. Ollama streams newline-delimited
 * JSON objects; the last one carries `done: true`.
 *
 * `fetchImpl` is injectable for testing — defaults to the global fetch.
 */
export async function* streamOllamaChat(
  prompt: string,
  config: OllamaConfig,
  fetchImpl: typeof fetch = fetch,
): AsyncGenerator<string> {
  const response = await fetchImpl(`${config.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Ollama request failed (${response.status}).`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const parsed = JSON.parse(line) as {
        message?: { content?: string };
        done?: boolean;
      };
      if (parsed.message?.content) yield parsed.message.content;
      if (parsed.done) return;
    }
  }
}
