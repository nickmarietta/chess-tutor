import { describe, expect, it } from "vitest";
import { buildEngineBrief } from "./engineBrief";
import { renderDeterministicExplanation } from "./explainRenderer";
import { makeMoveAnalysis } from "./testFixtures";

function render(overrides: Parameters<typeof makeMoveAnalysis>[0]) {
  return renderDeterministicExplanation(buildEngineBrief(makeMoveAnalysis(overrides)));
}

describe("renderDeterministicExplanation", () => {
  it("renders a neutral sentence for a non-mistake move", () => {
    const text = render({
      move_played_san: "e4",
      mistake_severity: "none",
      mistake_tags: [],
      eval_before: 0.2,
      eval_after: 0.25,
      best_move_san: "e4",
    });

    expect(text).toContain("e4 holds the position.");
    expect(text).not.toContain("preferred");
  });

  it("names the severity for inaccuracy/mistake/blunder", () => {
    expect(
      render({ move_played_san: "Bd3", mistake_severity: "inaccuracy" }),
    ).toContain("Bd3 is an inaccuracy.");
    expect(
      render({ move_played_san: "Bd3", mistake_severity: "mistake" }),
    ).toContain("Bd3 is a mistake.");
    expect(
      render({ move_played_san: "Bd3", mistake_severity: "blunder" }),
    ).toContain("Bd3 is a blunder.");
  });

  it("reports the eval swing when both evals are known", () => {
    const text = render({ eval_before: 0.5, eval_after: -1.5 });
    expect(text).toContain("The evaluation moved from +0.50 to -1.50.");
  });

  it("omits the eval sentence when an eval is missing", () => {
    const text = render({ eval_before: null, eval_after: -1.5 });
    expect(text).not.toContain("The evaluation moved");
  });

  it("describes every mistake tag present", () => {
    const text = render({
      mistake_tags: ["hanging_piece", "ignored_opponent_threat"],
    });
    expect(text).toContain("left a piece hanging");
    expect(text).toContain("overlooked the opponent's threat");
  });

  it("omits the tag sentence when there are no tags", () => {
    const text = render({ mistake_tags: [] });
    expect(text).not.toContain("This move");
  });

  it("suggests the engine's best move when it differs from the move played", () => {
    const text = render({ move_played_san: "Nf6", best_move_san: "d5" });
    expect(text).toContain("The engine preferred d5 instead.");
  });

  it("does not suggest a best move that matches the move played", () => {
    const text = render({ move_played_san: "e4", best_move_san: "e4" });
    expect(text).not.toContain("preferred");
  });

  it("does not suggest a best move when none is known", () => {
    const text = render({ move_played_san: "e4", best_move_san: null });
    expect(text).not.toContain("preferred");
  });

  it("falls back to a generic subject when no move was played", () => {
    const text = render({ move_played_san: null, mistake_severity: "none" });
    expect(text).toContain("This move holds the position.");
  });
});
