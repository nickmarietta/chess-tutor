import type { Game, HelpMode } from "@/types";
import type { AnalysisViewState } from "@/hooks/useAnalysisSession";

export type CoachPositionContext = {
  game: Game;
  view: AnalysisViewState;
};

export type ChatEntry = {
  id: string;
  game_id: string;
  position_id: string | null;
  user_text: string;
  help_mode: HelpMode;
  coach_response: string | null;
  created_at: string;
  ply: number;
  moveSan: string | null;
  label: string;
  isAnalysis: boolean;
  anchorPly?: number;
  lineCursor?: number;
  analysisMoves?: string[];
};

export function buildCoachPayload(
  ctx: CoachPositionContext,
  userText: string,
  helpMode: HelpMode,
) {
  const { game, view } = ctx;
  const analysisMoves = view.line.nodes
    .slice(1, view.line.cursor + 1)
    .map((n) => n.moveSan)
    .filter((s): s is string => !!s);

  return {
    gameId: game.id,
    positionId: view.isAnalysis ? undefined : view.anchorPosition?.id,
    userText,
    helpMode,
    fen: view.fen,
    fenBefore: view.fenBefore,
    moveSan: view.moveSan,
    ply: view.ply,
    whitePlayer: game.white_player,
    blackPlayer: game.black_player,
    isAnalysis: view.isAnalysis,
    analysisMoves,
  };
}

export function buildExplainPayload(
  ctx: CoachPositionContext,
  explainBestMove: boolean,
) {
  const { game, view } = ctx;
  const analysisMoves = view.line.nodes
    .slice(1, view.line.cursor + 1)
    .map((n) => n.moveSan)
    .filter((s): s is string => !!s);

  return {
    gameId: game.id,
    positionId: view.isAnalysis ? undefined : view.anchorPosition?.id,
    fen: view.fen,
    fenBefore: view.fenBefore,
    ply: view.ply,
    selectedMoveSan: view.moveSan,
    explainBestMove,
    isAnalysis: view.isAnalysis,
    analysisMoves,
    helpMode: "guide" as HelpMode,
  };
}
