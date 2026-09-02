import { describe, expect, it } from "vitest";
import { buildExplainPrompt } from "./prompt";
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
  mistakeTags: ["hanging_piece"],
  candidateMoves: [{ san: "Bc6", uci: "c8c6", score: -0.1, scoreType: "cp" }],
  isCritical: true,
};

const HINT_BRIEF: EngineBrief = {
  ...FULL_BRIEF,
  movePlayedSan: null,
  movePlayedUci: null,
  bestMoveSan: null,
  bestMoveUci: null,
  evalBefore: null,
  evalAfter: null,
  mistakeTags: [],
  candidateMoves: [],
};

describe("buildExplainPrompt", () => {
  it("includes every fact present in a full brief", () => {
    const prompt = buildExplainPrompt(FULL_BRIEF);
    expect(prompt).toContain("Ng6");
    expect(prompt).toContain("Nd7");
    expect(prompt).toContain("Bc6");
    expect(prompt).toContain("blunder");
    expect(prompt).toContain("hanging_piece".replace("_", " "));
  });

  it("never mentions a redacted field", () => {
    const prompt = buildExplainPrompt(HINT_BRIEF);
    expect(prompt).not.toContain("Ng6");
    expect(prompt).not.toContain("Nd7");
    expect(prompt).not.toContain("Bc6");
  });

  it("instructs the model not to exceed the given facts", () => {
    const prompt = buildExplainPrompt(FULL_BRIEF);
    expect(prompt.toLowerCase()).toMatch(/only|do not|must not/);
  });
});
