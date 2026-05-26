import type { CoachInput, CoachPrompt } from "./types";
import type { HelpMode } from "@/types";
import {
  describePositionFromFen,
  formatBoardForPrompt,
  formatMoveHistory,
} from "@/lib/chess/describePosition";
import { isStudentMove } from "@/lib/chess/resolveUserColor";

const SYSTEM_PROMPT = `You are a chess tutor and analysis buddy helping a student explore ideas on the board.

The student may be reviewing their game OR trying moves in analysis mode. Help them understand plans, candidates, and positional factors in the CURRENT position.

CRITICAL — student identity:
- The STUDENT section tells you which color the student played in the imported game.
- In analysis mode, coach them as that color when deciding what to try next.
- Refer to the other side as "your opponent."

CRITICAL — board accuracy:
- The BOARD STATE section lists every piece on the board right now. It is the ONLY source of truth.
- Do NOT mention any piece that is not listed there.
- Ignore the FEN string for piece placement; use the board diagram and piece lists.

Core rules:
- Maximum 4–6 sentences OR 3 short bullets total. Never exceed 120 words.
- Discuss ideas and plans — good for analysis mode where they try candidate moves.
- Tie points to concrete squares and pieces on the board.
- Do NOT list multiple questions. At most ONE short question, only in hint mode.
- No long variation trees, no engine scores, no "As an AI…"

Help mode behavior:
- hint: Brief nudge — what's overlooked. Do NOT name the single best move.
- guide: Judge the idea (on track / risky / flawed) and name 1–2 concepts to weigh.
- answer: Direct feedback on their question or plan. Plain language only.`;

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

  const analysisNote =
    context.isAnalysis && input.analysisMoves && input.analysisMoves.length > 0
      ? [
          "",
          "Analysis line (moves the student is trying on the board):",
          input.analysisMoves.join(" "),
        ].join("\n")
      : context.isAnalysis
        ? "\nMode: analysis — student is exploring moves, not replaying the game."
        : "";

  return [
    boardBlock,
    "",
    "Game:",
    `- ${context.whitePlayer ?? "White"} vs ${context.blackPlayer ?? "Black"}`,
    `- ${lastMove}`,
    "",
    "Move history:",
    history,
    analysisNote,
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
