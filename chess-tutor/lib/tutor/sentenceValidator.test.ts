import { describe, expect, it } from "vitest";
import { extractCompleteSentences, validateSentence } from "./sentenceValidator";
import type { EngineBrief } from "./engineBrief";

const BRIEF: EngineBrief = {
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

describe("extractCompleteSentences", () => {
  it("extracts sentences terminated by punctuation followed by whitespace", () => {
    const { sentences, remainder } = extractCompleteSentences(
      "Ng6 is a blunder. The engine preferred Nd7. This los",
    );
    expect(sentences).toEqual(["Ng6 is a blunder.", "The engine preferred Nd7."]);
    expect(remainder).toBe("This los");
  });

  it("does not split on a decimal point inside a number", () => {
    const { sentences, remainder } = extractCompleteSentences(
      "The evaluation moved from +0.3 to -2.1. That is a big swing. ",
    );
    expect(sentences).toEqual([
      "The evaluation moved from +0.3 to -2.1.",
      "That is a big swing.",
    ]);
    expect(remainder).toBe("");
  });

  it("returns no sentences and the full buffer as remainder when nothing is complete yet", () => {
    const { sentences, remainder } = extractCompleteSentences("Ng6 is a blun");
    expect(sentences).toEqual([]);
    expect(remainder).toBe("Ng6 is a blun");
  });

  it("holds a trailing sentence with no following whitespace as remainder, not as complete", () => {
    // Mid-stream, punctuation with nothing after it yet could still be an
    // abbreviation or continue after the next chunk arrives — only the
    // caller, once the stream truly ends, knows to flush this as final.
    const { sentences, remainder } = extractCompleteSentences(
      "Ng6 is a blunder. The engine preferred Nd7.",
    );
    expect(sentences).toEqual(["Ng6 is a blunder."]);
    expect(remainder).toBe("The engine preferred Nd7.");
  });
});

describe("validateSentence", () => {
  it("accepts a sentence that only references the move played", () => {
    expect(validateSentence("Ng6 is a blunder.", BRIEF)).toBe(true);
  });

  it("accepts a sentence referencing the best move and a candidate move", () => {
    expect(
      validateSentence("The engine preferred Nd7, and Bc6 was also reasonable.", BRIEF),
    ).toBe(true);
  });

  it("rejects a sentence asserting a move not present in the brief", () => {
    expect(validateSentence("Qh5 would have won on the spot.", BRIEF)).toBe(false);
  });

  it("rejects a sentence with a check/capture move not in the brief even if similar", () => {
    expect(validateSentence("Nxd7 wins a piece.", BRIEF)).toBe(false);
  });

  it("allows a bare square reference that is not a move claim", () => {
    expect(
      validateSentence("The knight now controls the e4 square.", BRIEF),
    ).toBe(true);
  });

  it("allows a bare square reference even when it coincides with an unrelated pawn push", () => {
    // "e4" is not one of the brief's known moves at all here, but as a bare
    // square token it must still be allowed through — this is the documented
    // trap: a bare [a-h][1-8] token is ambiguous with a pawn move in SAN, and
    // the design choice is to always treat it as a square reference.
    expect(validateSentence("White is strong on e4.", BRIEF)).toBe(true);
  });

  it("accepts an eval number that matches the brief", () => {
    expect(validateSentence("The evaluation swung to -2.1.", BRIEF)).toBe(true);
  });

  it("rejects an eval number that does not match the brief", () => {
    expect(validateSentence("The evaluation is now -9.9 for Black.", BRIEF)).toBe(false);
  });

  it("accepts prose with no move-like or eval-like tokens at all", () => {
    expect(
      validateSentence("This move left a piece hanging on the kingside.", BRIEF),
    ).toBe(true);
  });

  it("rejects a move claim when the brief has redacted that field to null", () => {
    const hintBrief: EngineBrief = { ...BRIEF, bestMoveSan: null, movePlayedSan: null };
    expect(validateSentence("The engine preferred Nd7.", hintBrief)).toBe(false);
  });
});
