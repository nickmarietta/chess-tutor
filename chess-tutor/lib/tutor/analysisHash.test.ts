import { describe, expect, it } from "vitest";
import { computeAnalysisHash } from "./analysisHash";
import { makeMoveAnalysis } from "./testFixtures";

describe("computeAnalysisHash", () => {
  it("is deterministic for the same engine-derived fields", () => {
    const a = computeAnalysisHash(makeMoveAnalysis());
    const b = computeAnalysisHash(makeMoveAnalysis());
    expect(a).toBe(b);
  });

  it("is unaffected by fields that aren't engine-derived", () => {
    const a = computeAnalysisHash(makeMoveAnalysis({ id: "one", created_at: "2020-01-01" }));
    const b = computeAnalysisHash(makeMoveAnalysis({ id: "two", created_at: "2021-06-15" }));
    expect(a).toBe(b);
  });

  it("is unaffected by mistake tag order", () => {
    const a = computeAnalysisHash(
      makeMoveAnalysis({ mistake_tags: ["hanging_piece", "missed_tactic"] }),
    );
    const b = computeAnalysisHash(
      makeMoveAnalysis({ mistake_tags: ["missed_tactic", "hanging_piece"] }),
    );
    expect(a).toBe(b);
  });

  it("changes when the evaluation changes", () => {
    const a = computeAnalysisHash(makeMoveAnalysis({ eval_after: 0.3 }));
    const b = computeAnalysisHash(makeMoveAnalysis({ eval_after: -0.3 }));
    expect(a).not.toBe(b);
  });

  it("changes when the best move changes", () => {
    const a = computeAnalysisHash(makeMoveAnalysis({ best_move_san: "e4" }));
    const b = computeAnalysisHash(makeMoveAnalysis({ best_move_san: "d4" }));
    expect(a).not.toBe(b);
  });

  it("changes when mistake tags change", () => {
    const a = computeAnalysisHash(makeMoveAnalysis({ mistake_tags: [] }));
    const b = computeAnalysisHash(makeMoveAnalysis({ mistake_tags: ["hanging_piece"] }));
    expect(a).not.toBe(b);
  });
});
