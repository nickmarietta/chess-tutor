import type { EngineContext } from "@/types/annotations";
import {
  buildContinuationFromPositions,
  pickMockBestMove,
} from "@/lib/chess/moveAnnotations";

type PositionRow = {
  ply: number;
  move_san: string | null;
  fen: string;
};

/**
 * v1 mock engine — uses legal moves + game continuation only.
 * Replace with Stockfish / external engine later.
 */
export function getMockEngineContext(
  positions: PositionRow[],
  ply: number,
  fenBefore: string | null,
): EngineContext {
  const bestMoveSan = fenBefore ? pickMockBestMove(fenBefore) : null;
  const continuation = buildContinuationFromPositions(positions, ply, 3);

  const playedSan = positions.find((p) => p.ply === ply)?.move_san ?? null;
  const evalBefore = null;
  const evalAfter = null;

  // Placeholder eval hint when best differs from played
  const mockEvalBefore = 0;
  const mockEvalAfter =
    bestMoveSan && playedSan && bestMoveSan !== playedSan ? 0.4 : 0;

  return {
    bestMoveSan,
    variation: continuation,
    evalBefore: evalBefore ?? mockEvalBefore,
    evalAfter: evalAfter ?? mockEvalAfter,
  };
}
