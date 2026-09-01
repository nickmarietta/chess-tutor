import { describe, expect, it } from "vitest";
import { buildBoardAnnotations } from "./boardAnnotations";
import { buildEngineBrief } from "./engineBrief";
import { makeMoveAnalysis } from "./testFixtures";
import type { MistakeTag } from "@/types";

function annotationsFor(overrides: Parameters<typeof makeMoveAnalysis>[0]) {
  return buildBoardAnnotations(buildEngineBrief(makeMoveAnalysis(overrides)));
}

describe("buildBoardAnnotations", () => {
  it("returns no annotations at all for a non-mistake move", () => {
    const result = annotationsFor({
      mistake_severity: "none",
      mistake_tags: [],
      move_played_uci: "e7e5",
      best_move_uci: "d7d5",
    });

    expect(result).toEqual({ highlights: [], arrows: [] });
  });

  it("adds a best-move arrow when the engine preferred a different move", () => {
    const result = annotationsFor({
      mistake_severity: "mistake",
      move_played_uci: "g8f6",
      best_move_uci: "d7d5",
    });

    expect(result.arrows).toContainEqual({ from: "d7", to: "d5", type: "best" });
  });

  it("omits the best-move arrow when the move played was already best", () => {
    const result = annotationsFor({
      mistake_severity: "mistake",
      move_played_uci: "g8f6",
      best_move_uci: "g8f6",
    });

    expect(result.arrows).toEqual([]);
  });

  it("omits the best-move arrow when no best move is known", () => {
    const result = annotationsFor({
      mistake_severity: "mistake",
      move_played_uci: "g8f6",
      best_move_uci: null,
    });

    expect(result.arrows).toEqual([]);
  });

  it.each<[MistakeTag, "target" | "weakness" | "important" | "control"]>([
    ["missed_tactic", "target"],
    ["hanging_piece", "weakness"],
    ["bad_trade", "weakness"],
    ["premature_attack", "weakness"],
    ["opening_principle_violation", "weakness"],
    ["ignored_opponent_threat", "important"],
    ["weak_king_safety", "important"],
    ["poor_piece_activity", "control"],
    ["passive_defense", "control"],
  ])("highlights the tag as %s -> %s", (tag, type) => {
    const result = annotationsFor({
      mistake_severity: "mistake",
      move_played_uci: "e7e5",
      best_move_uci: "e2e4",
      mistake_tags: [tag],
    });

    const expectedSquare = tag === "missed_tactic" ? "e4" : "e5";
    expect(result.highlights).toContainEqual({ square: expectedSquare, type });
  });

  it("anchors missed_tactic on the best move's square, not the move played", () => {
    const result = annotationsFor({
      mistake_severity: "blunder",
      move_played_uci: "e7e5",
      best_move_uci: "d7d5",
      mistake_tags: ["missed_tactic"],
    });

    expect(result.highlights).toContainEqual({ square: "d5", type: "target" });
  });

  it("falls back to the played square for missed_tactic when no best move is known", () => {
    const result = annotationsFor({
      mistake_severity: "blunder",
      move_played_uci: "e7e5",
      best_move_uci: null,
      mistake_tags: ["missed_tactic"],
    });

    expect(result.highlights).toContainEqual({ square: "e5", type: "target" });
  });

  it("adds one highlight per mistake tag present", () => {
    const result = annotationsFor({
      mistake_severity: "blunder",
      move_played_uci: "e7e5",
      mistake_tags: ["hanging_piece", "ignored_opponent_threat"],
    });

    expect(result.highlights).toHaveLength(2);
  });

  it("adds no highlights when there are no mistake tags, even if severity is set", () => {
    const result = annotationsFor({
      mistake_severity: "inaccuracy",
      move_played_uci: "e7e5",
      mistake_tags: [],
    });

    expect(result.highlights).toEqual([]);
  });

  it("adds no highlights when the played move is unknown", () => {
    const result = annotationsFor({
      mistake_severity: "blunder",
      move_played_uci: null,
      mistake_tags: ["hanging_piece"],
    });

    expect(result.highlights).toEqual([]);
  });
});
