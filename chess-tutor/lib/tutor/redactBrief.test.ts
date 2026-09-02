import { describe, expect, it } from "vitest";
import { redactBriefForHelpMode } from "./redactBrief";
import type { EngineBrief } from "./engineBrief";

const FULL_BRIEF: EngineBrief = {
  sideToMove: "black",
  movePlayedSan: "Ng6",
  movePlayedUci: "e7g6",
  bestMoveSan: "Nd7",
  bestMoveUci: "e7d7",
  evalBefore: 0.3,
  evalAfter: -2.1,
  evalSwing: -2.4,
  severity: "blunder",
  mistakeTags: ["hanging_piece", "missed_tactic"],
  candidateMoves: [{ san: "Nd7", uci: "e7d7", score: 0.3, scoreType: "cp" }],
  isCritical: true,
};

describe("redactBriefForHelpMode", () => {
  it("hint reveals only that something went wrong and how badly, nothing else", () => {
    const redacted = redactBriefForHelpMode(FULL_BRIEF, "hint");
    expect(redacted).toEqual({
      sideToMove: "black",
      movePlayedSan: null,
      movePlayedUci: null,
      bestMoveSan: null,
      bestMoveUci: null,
      evalBefore: null,
      evalAfter: null,
      evalSwing: -2.4,
      severity: "blunder",
      mistakeTags: [],
      candidateMoves: [],
      isCritical: true,
    });
  });

  it("guide adds the move played, full eval, and the kind of mistake — but withholds the answer", () => {
    const redacted = redactBriefForHelpMode(FULL_BRIEF, "guide");
    expect(redacted).toEqual({
      sideToMove: "black",
      movePlayedSan: "Ng6",
      movePlayedUci: "e7g6",
      bestMoveSan: null,
      bestMoveUci: null,
      evalBefore: 0.3,
      evalAfter: -2.1,
      evalSwing: -2.4,
      severity: "blunder",
      mistakeTags: ["hanging_piece", "missed_tactic"],
      candidateMoves: [],
      isCritical: true,
    });
  });

  it("answer reveals the full brief unchanged", () => {
    expect(redactBriefForHelpMode(FULL_BRIEF, "answer")).toEqual(FULL_BRIEF);
  });

  it("never fabricates a field the source brief didn't have", () => {
    const noBestMove: EngineBrief = { ...FULL_BRIEF, bestMoveSan: null, bestMoveUci: null };
    const redacted = redactBriefForHelpMode(noBestMove, "answer");
    expect(redacted.bestMoveSan).toBeNull();
    expect(redacted.bestMoveUci).toBeNull();
  });
});
