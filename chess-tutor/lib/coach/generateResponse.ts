import type { HelpMode } from "@/types";

export type CoachContext = {
  fen: string;
  moveSan: string | null;
  ply: number;
  whitePlayer: string | null;
  blackPlayer: string | null;
};

/**
 * Placeholder coaching — swap this for an LLM API call later.
 * Intentionally avoids naming the best move in hint/guide modes.
 */
export function generateCoachResponse(
  userText: string,
  helpMode: HelpMode,
  context: CoachContext,
): string {
  const thinking =
    userText.trim() ||
    "(You did not describe your thinking yet — try explaining plans, candidate moves, or what worried you.)";

  const positionNote = context.moveSan
    ? `We're looking at the position after ${context.moveSan} (ply ${context.ply}).`
    : `We're at the starting position.`;

  const prompts: Record<HelpMode, string> = {
    hint: [
      `**Hint mode** — ${positionNote}`,
      "",
      "You wrote:",
      `> ${thinking}`,
      "",
      "Questions to sharpen your thinking:",
      "- What was your plan for the next 2–3 moves?",
      "- Which opponent threats did you check before moving?",
      "- Can you name two candidate moves and why you rejected one?",
      "",
      "_I won't name the best move here — work through the questions first._",
    ].join("\n"),

    guide: [
      `**Guide mode** — ${positionNote}`,
      "",
      "You wrote:",
      `> ${thinking}`,
      "",
      "Coaching notes:",
      "- Compare your plan to concrete threats: checks, captures, and loose pieces.",
      "- Ask whether your last move improved worst-placed piece or king safety.",
      "- If you were attacking, did you calculate a forcing line one move deeper?",
      "",
      "Next step: pick one candidate move and list pros/cons before playing it.",
    ].join("\n"),

    answer: [
      `**Answer mode** — ${positionNote}`,
      "",
      "You wrote:",
      `> ${thinking}`,
      "",
      "Direct feedback (v1 placeholder — engine + AI coming later):",
      "- Your explanation is a good start; tie it to **concrete squares and threats**.",
      "- Revisit whether the move you played matched your stated plan.",
      "- If you felt unsure, that often signals a missing calculation step before the move.",
      "",
      "_Full move-quality analysis will use an engine + tutor model in a future release._",
    ].join("\n"),
  };

  return prompts[helpMode];
}
