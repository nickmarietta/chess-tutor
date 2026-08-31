import type { MistakeTag } from "@/types";
import type { EngineBrief } from "./engineBrief";

const MISTAKE_TAG_PHRASES: Record<MistakeTag, string> = {
  missed_tactic: "missed a tactical opportunity",
  hanging_piece: "left a piece hanging",
  poor_piece_activity: "sent a piece to a passive square",
  bad_trade: "made an unfavorable trade",
  ignored_opponent_threat: "overlooked the opponent's threat",
  premature_attack: "attacked before finishing development",
  weak_king_safety: "weakened king safety",
  passive_defense: "retreated instead of finding an active defense",
  opening_principle_violation: "broke a basic opening principle",
};

function formatEval(value: number | null): string | null {
  if (value === null) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

function severityHeadline(brief: EngineBrief): string {
  const move = brief.movePlayedSan ?? "This move";
  switch (brief.severity) {
    case "blunder":
      return `${move} is a blunder.`;
    case "mistake":
      return `${move} is a mistake.`;
    case "inaccuracy":
      return `${move} is an inaccuracy.`;
    default:
      return `${move} holds the position.`;
  }
}

function evalSentence(brief: EngineBrief): string | null {
  const before = formatEval(brief.evalBefore);
  const after = formatEval(brief.evalAfter);
  if (before === null || after === null) return null;
  return `The evaluation moved from ${before} to ${after}.`;
}

function mistakeTagSentence(brief: EngineBrief): string | null {
  if (brief.mistakeTags.length === 0) return null;
  const phrases = brief.mistakeTags.map((tag) => MISTAKE_TAG_PHRASES[tag]);
  return `This move ${phrases.join(" and ")}.`;
}

function bestMoveSentence(brief: EngineBrief): string | null {
  if (!brief.bestMoveSan || brief.bestMoveSan === brief.movePlayedSan) {
    return null;
  }
  return `The engine preferred ${brief.bestMoveSan} instead.`;
}

/**
 * Turns an engine brief into plain-language prose with zero LLM involvement.
 * This is the always-available floor: never persisted, and used as the
 * fallback whenever the LLM path is unavailable or fails validation.
 */
export function renderDeterministicExplanation(brief: EngineBrief): string {
  const sentences = [
    severityHeadline(brief),
    evalSentence(brief),
    mistakeTagSentence(brief),
    bestMoveSentence(brief),
  ].filter((sentence): sentence is string => sentence !== null);

  return sentences.join(" ");
}
