import { afterEach, describe, expect, it, vi } from "vitest";

const {
  getGameById,
  analyzePositionWithStockfish,
  updateGameAnalysisState,
  replaceMoveAnalyses,
  upsertUserMistakeStats,
} = vi.hoisted(() => ({
  getGameById: vi.fn(),
  analyzePositionWithStockfish: vi.fn(),
  updateGameAnalysisState: vi.fn(),
  replaceMoveAnalyses: vi.fn(),
  upsertUserMistakeStats: vi.fn(),
}));

vi.mock("@/lib/supabase/games", () => ({ getGameById }));
vi.mock("@/lib/engine/stockfish", () => ({ analyzePositionWithStockfish }));
vi.mock("@/lib/supabase/analysis", () => ({
  updateGameAnalysisState,
  replaceMoveAnalyses,
  upsertUserMistakeStats,
}));

const { analyzeGameNow } = await import("./service");

afterEach(() => {
  delete process.env.ANALYSIS_ENABLED;
  vi.clearAllMocks();
});

describe("analyzeGameNow", () => {
  it("skips analysis and returns the game unchanged when ANALYSIS_ENABLED is false", async () => {
    process.env.ANALYSIS_ENABLED = "false";
    const data = { game: {}, positions: [], analyses: [] };
    getGameById.mockResolvedValue(data);

    const result = await analyzeGameNow("g1");

    expect(result).toBe(data);
    expect(analyzePositionWithStockfish).not.toHaveBeenCalled();
    expect(updateGameAnalysisState).not.toHaveBeenCalled();
    expect(replaceMoveAnalyses).not.toHaveBeenCalled();
    expect(upsertUserMistakeStats).not.toHaveBeenCalled();
  });

  it("throws when the game is not found, regardless of the flag", async () => {
    process.env.ANALYSIS_ENABLED = "false";
    getGameById.mockResolvedValue(null);

    await expect(analyzeGameNow("missing")).rejects.toThrow("Game not found.");
  });
});
