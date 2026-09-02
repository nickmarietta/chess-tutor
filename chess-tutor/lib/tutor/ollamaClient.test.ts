import { describe, expect, it } from "vitest";
import { streamOllamaChat } from "./ollamaClient";

function fakeFetch(lines: string[], status = 200): typeof fetch {
  return (async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();
        for (const line of lines) {
          controller.enqueue(encoder.encode(line + "\n"));
        }
        controller.close();
      },
    });
    return new Response(status === 200 ? body : null, { status });
  }) as unknown as typeof fetch;
}

async function collect(gen: AsyncGenerator<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const chunk of gen) out.push(chunk);
  return out;
}

describe("streamOllamaChat", () => {
  it("yields each content delta from the NDJSON stream", async () => {
    const fetchImpl = fakeFetch([
      JSON.stringify({ message: { content: "Ng6 " }, done: false }),
      JSON.stringify({ message: { content: "is a blunder." }, done: false }),
      JSON.stringify({ message: { content: "" }, done: true }),
    ]);

    const chunks = await collect(
      streamOllamaChat("prompt", { baseUrl: "http://x", model: "m" }, fetchImpl),
    );

    expect(chunks).toEqual(["Ng6 ", "is a blunder."]);
  });

  it("stops at the done chunk without yielding anything after it", async () => {
    const fetchImpl = fakeFetch([
      JSON.stringify({ message: { content: "first" }, done: false }),
      JSON.stringify({ message: { content: "" }, done: true }),
      JSON.stringify({ message: { content: "should not appear" }, done: false }),
    ]);

    const chunks = await collect(
      streamOllamaChat("prompt", { baseUrl: "http://x", model: "m" }, fetchImpl),
    );

    expect(chunks).toEqual(["first"]);
  });

  it("throws when the request fails", async () => {
    const fetchImpl = fakeFetch([], 500);

    await expect(
      collect(streamOllamaChat("prompt", { baseUrl: "http://x", model: "m" }, fetchImpl)),
    ).rejects.toThrow("Ollama request failed (500)");
  });
});
