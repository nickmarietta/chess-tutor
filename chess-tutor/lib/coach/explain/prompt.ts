import type { ExplainResponse } from "@/types/annotations";
import type { HelpMode, UserColor } from "@/types";
import type { EngineContext } from "@/types/annotations";
import { formatBoardForPrompt, describePositionFromFen } from "@/lib/chess/describePosition";

export type ExplainCoachInput = {
  fen: string;
  fenBefore: string | null;
  ply: number;
  selectedMoveSan: string | null;
  userColor: UserColor | null;
  helpMode: HelpMode;
  userReflection?: string;
  engine: EngineContext;
  annotationsSummary: string;
};

const SYSTEM = `You explain chess moves briefly for a student. You receive pre-computed board annotations — do NOT invent moves, squares, or variations.

Rules:
- Maximum 3–4 sentences (~80 words).
- Explain the IDEA behind the move being discussed.
- Reference squares only if they appear in the annotations summary.
- Do not output JSON, arrows, or SAN lines — prose only.
- Coach the student on their color when known.`;

export function buildExplainPrompt(input: ExplainCoachInput): {
  system: string;
  user: string;
} {
  const snapshot = describePositionFromFen(input.fen);
  const studentColor = input.userColor
    ? input.userColor === "white"
      ? "White"
      : "Black"
    : "unknown";

  const user = [
    `Student color: ${studentColor}`,
    `Ply: ${input.ply}`,
    `Move to explain: ${input.selectedMoveSan ?? "(none)"}`,
    input.engine.bestMoveSan &&
    input.engine.bestMoveSan !== input.selectedMoveSan
      ? `Mock engine suggestion: ${input.engine.bestMoveSan}`
      : null,
    input.userReflection?.trim()
      ? `Student note: ${input.userReflection.trim()}`
      : null,
    "",
    formatBoardForPrompt(snapshot),
    "",
    "Annotations (already on board — do not change):",
    input.annotationsSummary,
    "",
    `Help mode: ${input.helpMode}`,
    "Write the explanation only.",
  ]
    .filter(Boolean)
    .join("\n");

  return { system: SYSTEM, user };
}

export function mockExplainText(input: ExplainCoachInput): string {
  const move = input.selectedMoveSan ?? "this move";
  const best = input.engine.bestMoveSan;
  const differs = best && best !== input.selectedMoveSan;

  if (differs) {
    return `${move} achieves a concrete purpose in this position, but ${best} was another idea worth weighing. Focus on king safety, piece activity, and whether your move matches the plan you stated. The highlighted squares show the key landing square and the engine's alternative target.`;
  }

  return `${move} fits the demands of this position — the highlighted squares show where the piece landed and which square it left. Ask whether this move improved your worst piece or addressed your opponent's last threat.`;
}

export type ExplainGenerationResult = ExplainResponse;
