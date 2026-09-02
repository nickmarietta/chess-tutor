import { describe, expect, it, vi } from "vitest";
import { explainMove } from "./explainMove";
import { makeMoveAnalysis } from "./testFixtures";

async function* deltas(...chunks: string[]) {
  for (const chunk of chunks) yield chunk;
}

async function collect(gen: AsyncGenerator<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const chunk of gen) out.push(chunk);
  return out;
}

const ANALYSIS = makeMoveAnalysis({
  side_to_move: "black",
  move_played_san: "Ng6",
  move_played_uci: "e7g6",
  best_move_san: "Nd7",
  best_move_uci: "e7d7",
  eval_before: 0.3,
  eval_after: -2.1,
  eval_swing: -2.4,
  mistake_severity: "blunder",
  mistake_tags: ["hanging_piece"],
  candidate_moves: [],
  is_critical: true,
});

function baseDeps(overrides: Parameters<typeof explainMove>[2] = {}) {
  return {
    findCachedExplanation: vi.fn().mockResolvedValue(null),
    saveCoachExplanation: vi.fn().mockResolvedValue(undefined),
    getOllamaConfig: vi.fn().mockReturnValue({ baseUrl: "http://x", model: "test-model" }),
    streamOllamaChat: vi.fn(),
    ...overrides,
  };
}

describe("explainMove", () => {
  it("returns the cached response without calling Ollama", async () => {
    const deps = baseDeps({
      findCachedExplanation: vi.fn().mockResolvedValue({ coach_response: "Cached text." }),
    });

    const chunks = await collect(explainMove(ANALYSIS, "answer", deps));

    expect(chunks).toEqual(["Cached text."]);
    expect(deps.streamOllamaChat).not.toHaveBeenCalled();
  });

  it("streams validated sentences and caches the complete response", async () => {
    const deps = baseDeps({
      streamOllamaChat: vi
        .fn()
        .mockReturnValue(deltas("Ng6 is a blunder. ", "The engine preferred Nd7. ")),
    });

    const chunks = await collect(explainMove(ANALYSIS, "answer", deps));

    expect(chunks).toEqual(["Ng6 is a blunder.", "The engine preferred Nd7."]);
    expect(deps.saveCoachExplanation).toHaveBeenCalledWith(
      expect.objectContaining({
        coachResponse: "Ng6 is a blunder. The engine preferred Nd7.",
        modelProvider: "ollama",
        modelName: "test-model",
      }),
    );
  });

  it("falls back to the deterministic explanation when the first sentence is invalid, without caching", async () => {
    const deps = baseDeps({
      streamOllamaChat: vi.fn().mockReturnValue(deltas("Qh5 wins on the spot. ")),
    });

    const chunks = await collect(explainMove(ANALYSIS, "answer", deps));

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toContain("blunder");
    expect(deps.saveCoachExplanation).not.toHaveBeenCalled();
  });

  it("stops after a later invalid sentence, keeping the earlier valid one and not caching", async () => {
    const deps = baseDeps({
      streamOllamaChat: vi
        .fn()
        .mockReturnValue(deltas("Ng6 is a blunder. ", "Qh5 wins on the spot. ")),
    });

    const chunks = await collect(explainMove(ANALYSIS, "answer", deps));

    expect(chunks).toEqual(["Ng6 is a blunder."]);
    expect(deps.saveCoachExplanation).not.toHaveBeenCalled();
  });

  it("falls back to the deterministic explanation when Ollama is unreachable", async () => {
    const deps = baseDeps({
      streamOllamaChat: vi.fn().mockImplementation(() => {
        throw new Error("connect ECONNREFUSED");
      }),
    });

    const chunks = await collect(explainMove(ANALYSIS, "answer", deps));

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toContain("blunder");
    expect(deps.saveCoachExplanation).not.toHaveBeenCalled();
  });

  it("respects help_mode redaction end to end — a hint-mode response can't validate a move sentence", async () => {
    const deps = baseDeps({
      streamOllamaChat: vi.fn().mockReturnValue(deltas("The engine preferred Nd7. ")),
    });

    const chunks = await collect(explainMove(ANALYSIS, "hint", deps));

    // Nd7 is redacted away at hint level, so this sentence must fail
    // validation and fall back — never leaking the answer through a hint.
    expect(chunks).toHaveLength(1);
    expect(deps.saveCoachExplanation).not.toHaveBeenCalled();
  });
});
