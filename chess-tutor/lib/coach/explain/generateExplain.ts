import { createCoachProvider } from "../providers";
import {
  buildExplainPrompt,
  mockExplainText,
  type ExplainCoachInput,
} from "./prompt";
import type { ExplainResponse } from "@/types/annotations";
import {
  buildBoardAnnotations,
  buildContinuationFromPositions,
} from "@/lib/chess/moveAnnotations";
import { getMockEngineContext } from "@/lib/engine/mockEngine";
import type { HelpMode, UserColor } from "@/types";

export type GenerateExplainInput = {
  fen: string;
  fenBefore: string | null;
  ply: number;
  selectedMoveSan: string | null;
  userColor: UserColor | null;
  helpMode: HelpMode;
  userReflection?: string;
  explainBestMove?: boolean;
  positions: { ply: number; move_san: string | null; fen: string }[];
};

function summarizeAnnotations(response: Pick<ExplainResponse, "highlights" | "arrows" | "variation">): string {
  const lines: string[] = [];
  for (const h of response.highlights) {
    lines.push(`- Highlight ${h.square} (${h.type})`);
  }
  for (const a of response.arrows) {
    lines.push(`- Arrow ${a.from}→${a.to} (${a.type})`);
  }
  if (response.variation.length > 0) {
    lines.push(
      `- Variation: ${response.variation.map((v) => v.san).join(" ")}`,
    );
  }
  return lines.join("\n") || "- (none)";
}

export async function generateExplain(
  input: GenerateExplainInput,
): Promise<ExplainResponse> {
  const engine = getMockEngineContext(
    input.positions,
    input.ply,
    input.fenBefore,
  );

  const moveToExplain = input.explainBestMove
    ? engine.bestMoveSan
    : input.selectedMoveSan;

  const continuation = input.explainBestMove
    ? buildContinuationFromPositions(input.positions, input.ply, 3)
    : engine.variation;

  const { highlights, arrows, variation } = buildBoardAnnotations({
    fenBefore: input.fenBefore,
    moveSan: moveToExplain,
    bestMoveSan: engine.bestMoveSan,
    continuation,
  });

  const annotationsSummary = summarizeAnnotations({
    highlights,
    arrows,
    variation,
  });

  const coachInput: ExplainCoachInput = {
    fen: input.fen,
    fenBefore: input.fenBefore,
    ply: input.ply,
    selectedMoveSan: moveToExplain,
    userColor: input.userColor,
    helpMode: input.helpMode,
    userReflection: input.userReflection,
    engine,
    annotationsSummary,
  };

  let explanation: string;
  try {
    const provider = createCoachProvider();
    if (provider.id === "mock") {
      explanation = mockExplainText(coachInput);
    } else {
      const prompt = buildExplainPrompt(coachInput);
      explanation = await provider.complete(prompt);
    }
  } catch {
    explanation = mockExplainText(coachInput);
  }

  return { explanation, highlights, arrows, variation };
}
