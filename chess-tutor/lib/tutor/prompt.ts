import { formatEval, type EngineBrief } from "./engineBrief";

function factLines(brief: EngineBrief): string[] {
  const lines: string[] = [`- Side to move: ${brief.sideToMove}`];

  if (brief.movePlayedSan) lines.push(`- Move played: ${brief.movePlayedSan}`);
  lines.push(`- This move was rated: ${brief.severity}`);

  const before = formatEval(brief.evalBefore);
  const after = formatEval(brief.evalAfter);
  if (before !== null && after !== null) {
    lines.push(`- Evaluation before: ${before}, after: ${after}`);
  }

  const swing = formatEval(brief.evalSwing);
  if (swing !== null) lines.push(`- Evaluation swing: ${swing}`);

  if (brief.mistakeTags.length > 0) {
    lines.push(
      `- Problems with this move: ${brief.mistakeTags.map((t) => t.replace(/_/g, " ")).join(", ")}`,
    );
  }

  if (brief.bestMoveSan) lines.push(`- Best move: ${brief.bestMoveSan}`);

  const alternatives = brief.candidateMoves
    .map((c) => c.san)
    .filter((san): san is string => san !== null && san !== brief.bestMoveSan);
  if (alternatives.length > 0) {
    lines.push(`- Other reasonable moves: ${alternatives.join(", ")}`);
  }

  if (brief.isCritical) lines.push("- This was a critical moment in the game.");

  return lines;
}

/**
 * Builds the explain-move prompt from an already help_mode-redacted brief.
 * The prompt text itself never changes between hint/guide/answer — only the
 * facts available to it do, per the confirmed design (redaction, not prompt
 * instruction, enforces the ladder).
 */
export function buildExplainPrompt(brief: EngineBrief): string {
  const facts = factLines(brief).join("\n");

  return [
    "You are a chess coach explaining a single move to a club-level player (roughly 1000-1600 rating).",
    "",
    "Here are the ONLY facts you may reference. Do not invent, guess, or reference any other move, square, piece, or evaluation number beyond these:",
    facts,
    "",
    "Write a short, natural explanation (2-4 sentences) in a warm, direct coaching tone, using only the facts above. If a best move or evaluation isn't listed above, do not speculate about what it might be — talk instead about the kind of problem the move has.",
  ].join("\n");
}
