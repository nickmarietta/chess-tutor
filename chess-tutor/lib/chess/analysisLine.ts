import { Chess } from "chess.js";

export type AnalysisNode = {
  fen: string;
  moveSan: string | null;
};

export type AnalysisLine = {
  /** Index into the imported game (0 = start). */
  anchorPly: number;
  nodes: AnalysisNode[];
  cursor: number;
};

export function createAnalysisLine(anchorPly: number, fen: string): AnalysisLine {
  return {
    anchorPly,
    nodes: [{ fen, moveSan: null }],
    cursor: 0,
  };
}

export function getCurrentNode(line: AnalysisLine): AnalysisNode {
  return line.nodes[line.cursor] ?? line.nodes[0]!;
}

export function getParentNode(line: AnalysisLine): AnalysisNode | null {
  if (line.cursor <= 0) return null;
  return line.nodes[line.cursor - 1] ?? null;
}

export function isAnalysisBranch(line: AnalysisLine, gamePositions: { ply: number; move_san: string | null }[]): boolean {
  if (line.nodes.length <= 1) return false;

  for (let i = 1; i < line.nodes.length; i++) {
    const node = line.nodes[i]!;
    const expectedGamePly = line.anchorPly + i;
    const gameMove = gamePositions.find((p) => p.ply === expectedGamePly);
    if (!gameMove?.move_san || gameMove.move_san !== node.moveSan) {
      return true;
    }
  }
  return line.cursor < line.nodes.length - 1 && line.nodes.length > 1;
}

export function tryMove(
  fen: string,
  from: string,
  to: string,
): { san: string; fen: string } | null {
  const chess = new Chess(fen);
  try {
    const move = chess.move({ from, to, promotion: "q" });
    if (!move) return null;
    return { san: move.san, fen: chess.fen() };
  } catch {
    return null;
  }
}

export function applyMove(line: AnalysisLine, from: string, to: string): AnalysisLine | null {
  const current = getCurrentNode(line);
  const result = tryMove(current.fen, from, to);
  if (!result) return null;

  const kept = line.nodes.slice(0, line.cursor + 1);
  kept.push({ fen: result.fen, moveSan: result.san });

  return {
    ...line,
    nodes: kept,
    cursor: kept.length - 1,
  };
}

export function stepAnalysis(line: AnalysisLine, delta: number): AnalysisLine {
  const next = Math.max(0, Math.min(line.nodes.length - 1, line.cursor + delta));
  return { ...line, cursor: next };
}

export function resetAnalysisToAnchor(
  anchorPly: number,
  fen: string,
): AnalysisLine {
  return createAnalysisLine(anchorPly, fen);
}

export function buildAnalysisHistorySan(line: AnalysisLine): string[] {
  return line.nodes
    .slice(1, line.cursor + 1)
    .map((n) => n.moveSan)
    .filter((s): s is string => !!s);
}

/** Full SAN list for the analysis branch (not truncated to cursor). */
export function allAnalysisMovesSan(line: AnalysisLine): string[] {
  return line.nodes
    .slice(1)
    .map((n) => n.moveSan)
    .filter((s): s is string => !!s);
}

export function rebuildAnalysisLine(
  anchorPly: number,
  startFen: string,
  moves: string[],
  cursor: number,
): AnalysisLine {
  let line = createAnalysisLine(anchorPly, startFen);
  for (const san of moves) {
    const fen = getCurrentNode(line).fen;
    const chess = new Chess(fen);
    try {
      const move = chess.move(san, { strict: false });
      if (!move) break;
      line = {
        anchorPly,
        nodes: [
          ...line.nodes,
          { fen: chess.fen(), moveSan: move.san },
        ],
        cursor: line.nodes.length,
      };
    } catch {
      break;
    }
  }
  return {
    ...line,
    cursor: Math.max(0, Math.min(cursor, line.nodes.length - 1)),
  };
}

/** Ply label for display — game ply + analysis extension. */
export function displayPly(line: AnalysisLine): number {
  return line.anchorPly + line.cursor;
}

export function formatAnalysisLabel(line: AnalysisLine): string {
  const moves = buildAnalysisHistorySan(line);
  if (moves.length === 0) {
    return line.anchorPly === 0 ? "Starting position" : `Game move ${line.anchorPly}`;
  }
  return `Analysis: ${moves.join(" ")}`;
}
