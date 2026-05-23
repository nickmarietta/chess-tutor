import type { CoachInput, CoachPrompt } from "./types";
import type { HelpMode } from "@/types";
import {
  describePositionFromFen,
  formatBoardForPrompt,
  formatMoveHistory,
} from "@/lib/chess/describePosition";
import { isStudentMove } from "@/lib/chess/resolveUserColor";

const SYSTEM_PROMPT = `You are a chess tutor giving brief positional feedback — not a chat partner.

This is NOT a conversation. Give immediate, focused feedback on the student's thinking in THIS position. Do not interview them.

CRITICAL — student identity:
- The STUDENT section tells you which color the student played.
- Always coach the student using "you/your" for THEIR pieces and plans.
- Refer to the other side as "your opponent" — never confuse whose plan you are evaluating.
- If the student asks about their plan, judge THEIR move/plan, not the opponent's.

CRITICAL — board accuracy:
- The BOARD STATE section lists every piece on the board right now. It is the ONLY source of truth.
- Do NOT mention any piece that is not listed there.
- Do NOT assume pieces from earlier in the game still exist — only what is listed now.
- Ignore the FEN string for piece placement; use the board diagram and piece lists.

Core rules:
- Maximum 4–6 sentences OR 3 short bullets total. Never exceed 120 words.
- Lead with a direct reaction to what the student said (agree, push back, or refine their idea).
- Tie every point to concrete chess factors using ONLY pieces that are on the board.
- If they ask "was this correct?" or similar, give a clear verdict first: yes / partly / no — then one reason.
- Do NOT open with "Let's take a closer look" or "Here are some questions to consider."
- Do NOT list multiple questions. At most ONE short question, only in hint mode.
- No variation trees, no engine scores, no "As an AI…"

Help mode behavior:
- hint: Brief nudge on what's overlooked. Do NOT fully answer whether their plan works. Do NOT name the best move.
- guide: Judge their plan (on track / risky / flawed) and name 1–2 better chess ideas. Do NOT name the single best move.
- answer: Direct verdict, what they missed, main idea they should have played toward. Plain language only.`;

const MODE_OUTPUT: Record<HelpMode, string> = {
  hint: `Format (hint mode):
1. One sentence on what their idea gets right or overlooks.
2. One sentence pointing at a concrete factor using pieces actually on the board.
Optional: one short question only if essential.`,
  guide: `Format (guide mode):
1. Verdict on their plan in one sentence (on track / partly / flawed).
2. One or two sentences on the key positional factor here.
3. One bullet: the main chess idea to reconsider.`,
  answer: `Format (answer mode):
1. Direct answer to their question or plan in one sentence.
2. What they missed — one or two sentences, concrete, only real pieces.
3. One sentence: the better chess idea for this position.`,
};

function formatStudentSection(input: CoachInput): string {
  const { context } = input;
  const studentMove = isStudentMove(context.ply, context.userColor);

  if (!context.userColor) {
    return [
      "STUDENT:",
      "- Color unknown — ask which side they played if needed, but still give brief general feedback.",
    ].join("\n");
  }

  const colorLabel = context.userColor === "white" ? "White" : "Black";
  const opponentColor = context.userColor === "white" ? "Black" : "White";
  const studentName =
    context.userColor === "white"
      ? context.whitePlayer
      : context.blackPlayer;

  const lines = [
    "STUDENT (coach this player only):",
    `- Playing as: ${colorLabel}${studentName ? ` (${studentName})` : ""}`,
    context.playerUsername
      ? `- Username/name: ${context.playerUsername}`
      : null,
    `- Opponent: ${opponentColor}`,
  ];

  if (context.ply > 0 && studentMove !== null) {
    lines.push(
      studentMove
        ? "- Last move was YOURS — evaluate the student's plan/move."
        : "- Last move was OPPONENT'S — coach what the student should do next.",
    );
  }

  return lines.filter(Boolean).join("\n");
}

function formatPositionSection(input: CoachInput): string {
  const { context, positions } = input;
  const snapshot = describePositionFromFen(context.fen);
  const boardBlock = formatBoardForPrompt(snapshot);

  const lastMove =
    context.moveSan != null
      ? `Last move played: ${context.moveSan} (ply ${context.ply})`
      : context.ply === 0
        ? "Starting position (ply 0)"
        : `Ply ${context.ply}`;

  const history = formatMoveHistory(positions, context.ply);

  return [
    boardBlock,
    "",
    "Game:",
    `- ${context.whitePlayer ?? "White"} vs ${context.blackPlayer ?? "Black"}`,
    `- ${lastMove}`,
    "",
    "Move history:",
    history,
  ].join("\n");
}

function formatReflectionSection(userText: string): string {
  const trimmed = userText.trim();
  if (!trimmed) {
    return "Student reflection: (none — in one sentence, name the most important factor in this board state.)";
  }
  return `Student reflection: ${trimmed}`;
}

export function buildCoachPrompt(input: CoachInput): CoachPrompt {
  const user = [
    formatStudentSection(input),
    "",
    formatPositionSection(input),
    "",
    formatReflectionSection(input.userText),
    "",
    MODE_OUTPUT[input.helpMode],
    "",
    "Respond now. Stay under 120 words. Coach the student on their color only.",
  ].join("\n");

  return { system: SYSTEM_PROMPT, user };
}
