import { Chess } from "chess.js";

export type BoardChessState = {
  /** Exact FEN on the board (chess.js normalized). */
  fen: string;
  sideToMove: "white" | "black";
  lastMoveSan: string | null;
  legalMovesSan: string[];
  ply: number;
  isAnalysis: boolean;
  anchorPly: number;
};

export function normalizeFen(fen: string): string {
  try {
    return new Chess(fen).fen();
  } catch {
    return fen;
  }
}

export function createBoardChessState(input: {
  fen: string;
  lastMoveSan?: string | null;
  ply?: number;
  isAnalysis?: boolean;
  anchorPly?: number;
}): BoardChessState {
  const chess = new Chess(input.fen);
  const fen = chess.fen();
  const turn = chess.turn();

  return {
    fen,
    sideToMove: turn === "w" ? "white" : "black",
    lastMoveSan: input.lastMoveSan ?? null,
    legalMovesSan: chess.moves(),
    ply: input.ply ?? 0,
    isAnalysis: input.isAnalysis ?? false,
    anchorPly: input.anchorPly ?? 0,
  };
}
