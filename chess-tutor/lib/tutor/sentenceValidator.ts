import type { EngineBrief } from "./engineBrief";

/** Matches SAN-shaped tokens: castling, piece moves/captures, pawn pushes/captures, promotions, checks. */
const SAN_TOKEN =
  /O-O-O|O-O|[KQRBN][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|[a-h]x[a-h][1-8](?:=[QRBN])?[+#]?|[a-h][1-8](?:=[QRBN])?[+#]?/g;

/** A bare two-character square token, e.g. "e4" — ambiguous with a pawn push in SAN. */
const BARE_SQUARE = /^[a-h][1-8]$/;

/** Signed decimal numbers, e.g. "+0.3", "-2.1" — the shape an eval claim takes in prose. */
const EVAL_NUMBER = /[+-]\d+(?:\.\d+)?/g;

const EVAL_TOLERANCE = 0.05;

/**
 * Splits a streaming text buffer into complete sentences plus whatever
 * incomplete text remains. A sentence is complete once its terminal
 * punctuation is followed by whitespace — which also means a decimal point
 * (never followed by whitespace, e.g. "0.3") is never mistaken for one.
 */
export function extractCompleteSentences(buffer: string): {
  sentences: string[];
  remainder: string;
} {
  const sentences: string[] = [];
  let rest = buffer;
  const boundary = /[.!?]+(?=\s)/;

  while (true) {
    const match = boundary.exec(rest);
    if (!match) break;
    const end = match.index + match[0].length;
    sentences.push(rest.slice(0, end).trim());
    rest = rest.slice(end).replace(/^\s+/, "");
  }

  return { sentences, remainder: rest };
}

function allowedSans(brief: EngineBrief): Set<string> {
  const sans = [
    brief.movePlayedSan,
    brief.bestMoveSan,
    ...brief.candidateMoves.map((c) => c.san),
  ].filter((san): san is string => san !== null);
  return new Set(sans);
}

function allowedEvalNumbers(brief: EngineBrief): number[] {
  return [
    brief.evalBefore,
    brief.evalAfter,
    brief.evalSwing,
    ...brief.candidateMoves.map((c) => c.score),
  ].filter((n): n is number => n !== null);
}

/**
 * A bare square token (e.g. "e4") is only unambiguously a location
 * reference — not a move claim — when the surrounding words say so: "on e4",
 * "at e4", or "e4 square". Without that signal it's treated as a move claim
 * like any other, because in practice an LLM will also use the bare-square
 * shape to state a move directly ("the move played was e4", "d3 instead of
 * e4 would have won") — and that claim must be held to the same standard as
 * "Nf6" or "Qxd5+". Erring toward validating too much here is deliberate:
 * a false rejection just triggers the deterministic fallback, but a false
 * exemption lets an unverified move claim reach the user unchallenged.
 */
function isSquareReference(sentence: string, index: number, token: string): boolean {
  const before = sentence.slice(0, index);
  const after = sentence.slice(index + token.length);
  return /\b(?:on|at)\s*$/i.test(before) || /^\s*square\b/i.test(after);
}

/**
 * The trust boundary: a sentence may only claim a move or eval number that
 * is present in the (already help_mode-redacted) brief. Nothing else about
 * the position may be asserted, since the LLM never sees the board — only
 * the brief's facts, and it must not exceed them.
 */
export function validateSentence(sentence: string, brief: EngineBrief): boolean {
  const sans = allowedSans(brief);

  for (const match of sentence.matchAll(SAN_TOKEN)) {
    const token = match[0];
    if (BARE_SQUARE.test(token) && isSquareReference(sentence, match.index, token)) {
      continue;
    }
    if (!sans.has(token)) return false;
  }

  const evals = allowedEvalNumbers(brief);
  for (const match of sentence.match(EVAL_NUMBER) ?? []) {
    const value = Number.parseFloat(match);
    const isKnown = evals.some((allowed) => Math.abs(allowed - value) < EVAL_TOLERANCE);
    if (!isKnown) return false;
  }

  return true;
}
