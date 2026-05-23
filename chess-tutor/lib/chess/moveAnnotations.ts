import { Chess } from "chess.js";
import type { BoardArrow, BoardHighlight, VariationMove } from "@/types/annotations";

export function getMoveSquares(
  fen: string,
  san: string,
): { from: string; to: string } | null {
  const chess = new Chess(fen);
  try {
    const move = chess.move(san, { strict: false });
    if (!move) return null;
    return { from: move.from, to: move.to };
  } catch {
    return null;
  }
}

export function buildVariationFromFens(
  moves: { san: string; fenAfter: string }[],
): VariationMove[] {
  return moves.map((m) => ({ san: m.san, fenAfter: m.fenAfter }));
}

type BuildAnnotationsInput = {
  fenBefore: string | null;
  moveSan: string | null;
  bestMoveSan?: string | null;
  continuation?: VariationMove[];
};

/** Derive highlights/arrows/variation from parsed chess data — never from LLM output. */
export function buildBoardAnnotations(input: BuildAnnotationsInput): {
  highlights: BoardHighlight[];
  arrows: BoardArrow[];
  variation: VariationMove[];
} {
  const highlights: BoardHighlight[] = [];
  const arrows: BoardArrow[] = [];
  const seenSquares = new Set<string>();

  function addHighlight(square: string, type: BoardHighlight["type"]) {
    const key = `${square}:${type}`;
    if (seenSquares.has(key)) return;
    seenSquares.add(key);
    highlights.push({ square, type });
  }

  if (input.fenBefore && input.moveSan) {
    const played = getMoveSquares(input.fenBefore, input.moveSan);
    if (played) {
      arrows.push({ from: played.from, to: played.to, type: "idea" });
      addHighlight(played.to, "important");
      addHighlight(played.from, "control");
    }
  }

  if (input.fenBefore && input.bestMoveSan && input.bestMoveSan !== input.moveSan) {
    const best = getMoveSquares(input.fenBefore, input.bestMoveSan);
    if (best) {
      arrows.push({ from: best.from, to: best.to, type: "best" });
      addHighlight(best.to, "target");
    }
  }

  return {
    highlights,
    arrows,
    variation: input.continuation ?? [],
  };
}

export function sideToMoveFromFen(fen: string): "white" | "black" {
  return fen.trim().split(/\s+/)[1] === "b" ? "black" : "white";
}

/** Simple v1 mock: prefer checks, then captures, else first legal move. */
export function pickMockBestMove(fen: string): string | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const check = moves.find((m) => m.san.includes("+"));
  if (check) return check.san;

  const capture = moves.find((m) => m.san.includes("x"));
  if (capture) return capture.san;

  return moves[0]?.san ?? null;
}

export function buildContinuationFromPositions(
  positions: { ply: number; move_san: string | null; fen: string }[],
  fromPly: number,
  maxPlies = 3,
): VariationMove[] {
  const out: VariationMove[] = [];
  for (const p of positions) {
    if (p.ply <= fromPly || !p.move_san) continue;
    if (out.length >= maxPlies) break;
    out.push({ san: p.move_san, fenAfter: p.fen });
  }
  return out;
}
