import { describe, expect, it } from "vitest";
import { buildEngineBrief } from "./engineBrief";
import { makeMoveAnalysis } from "./testFixtures";

describe("buildEngineBrief", () => {
  it("extracts exactly the chess facts an explanation may reference", () => {
    const analysis = makeMoveAnalysis({
      side_to_move: "black",
      move_played_san: "Nf6",
      best_move_san: "d5",
      best_move_uci: "d7d5",
      eval_before: 0.4,
      eval_after: -1.3,
      eval_swing: -1.7,
      mistake_severity: "blunder",
      mistake_tags: ["hanging_piece", "missed_tactic"],
      candidate_moves: [{ san: "d5", uci: "d7d5", score: 0.4, scoreType: "cp" }],
      is_critical: true,
    });

    expect(buildEngineBrief(analysis)).toEqual({
      sideToMove: "black",
      movePlayedSan: "Nf6",
      bestMoveSan: "d5",
      bestMoveUci: "d7d5",
      evalBefore: 0.4,
      evalAfter: -1.3,
      evalSwing: -1.7,
      severity: "blunder",
      mistakeTags: ["hanging_piece", "missed_tactic"],
      candidateMoves: [{ san: "d5", uci: "d7d5", score: 0.4, scoreType: "cp" }],
      isCritical: true,
    });
  });

  it("passes through null fields untouched", () => {
    const analysis = makeMoveAnalysis({
      move_played_san: null,
      best_move_san: null,
      best_move_uci: null,
      eval_before: null,
      eval_after: null,
      eval_swing: null,
    });

    const brief = buildEngineBrief(analysis);

    expect(brief.movePlayedSan).toBeNull();
    expect(brief.bestMoveSan).toBeNull();
    expect(brief.bestMoveUci).toBeNull();
    expect(brief.evalBefore).toBeNull();
    expect(brief.evalAfter).toBeNull();
    expect(brief.evalSwing).toBeNull();
  });
});
