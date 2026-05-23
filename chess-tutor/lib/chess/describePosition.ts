import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";

const PIECE_NAMES: Record<PieceSymbol, string> = {
  k: "King",
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
  p: "Pawn",
};

const ASCII_PIECES: Record<string, string> = {
  wp: "P",
  wn: "N",
  wb: "B",
  wr: "R",
  wq: "Q",
  wk: "K",
  bp: "p",
  bn: "n",
  bb: "b",
  br: "r",
  bq: "q",
  bk: "k",
};

export type PositionSnapshot = {
  sideToMove: "white" | "black";
  asciiBoard: string;
  whitePieces: string[];
  blackPieces: string[];
  materialSummary: string;
  absentPieces: string;
};

function pieceLabel(color: Color, type: PieceSymbol, square: Square): string {
  const colorName = color === "w" ? "White" : "Black";
  return `${colorName} ${PIECE_NAMES[type]} on ${square}`;
}

function countPieces(
  pieces: { type: PieceSymbol }[],
): Record<PieceSymbol, number> {
  const counts: Record<PieceSymbol, number> = {
    k: 0,
    q: 0,
    r: 0,
    b: 0,
    n: 0,
    p: 0,
  };
  for (const p of pieces) counts[p.type]++;
  return counts;
}

function formatSideMaterial(
  color: Color,
  counts: Record<PieceSymbol, number>,
): string {
  const label = color === "w" ? "White" : "Black";
  const parts: string[] = [];
  if (counts.q) parts.push(`${counts.q} queen${counts.q > 1 ? "s" : ""}`);
  if (counts.r) parts.push(`${counts.r} rook${counts.r > 1 ? "s" : ""}`);
  if (counts.b) parts.push(`${counts.b} bishop${counts.b > 1 ? "s" : ""}`);
  if (counts.n) parts.push(`${counts.n} knight${counts.n > 1 ? "s" : ""}`);
  if (counts.p) parts.push(`${counts.p} pawn${counts.p > 1 ? "s" : ""}`);
  parts.push("king");
  return `${label}: ${parts.join(", ")}`;
}

function formatAbsentPieces(
  whiteCounts: Record<PieceSymbol, number>,
  blackCounts: Record<PieceSymbol, number>,
): string {
  const absent: string[] = [];
  if (whiteCounts.q === 0 && blackCounts.q === 0) {
    absent.push("no queens on the board");
  } else {
    if (whiteCounts.q === 0) absent.push("White has no queen");
    if (blackCounts.q === 0) absent.push("Black has no queen");
  }
  return absent.length > 0 ? absent.join("; ") : "All standard pieces may still be present.";
}

function buildAsciiBoard(chess: Chess): string {
  const board = chess.board();
  const lines: string[] = [];

  for (let rank = 7; rank >= 0; rank--) {
    const row = board[rank]!;
    const squares = row.map((cell) => {
      if (!cell) return ".";
      return ASCII_PIECES[`${cell.color}${cell.type}`] ?? "?";
    });
    lines.push(`${rank + 1} | ${squares.join(" ")}`);
  }

  lines.push("  +-----------------");
  lines.push("    a b c d e f g h");
  return lines.join("\n");
}

/** Parse FEN into explicit board state small models can follow without reading FEN. */
export function describePositionFromFen(fen: string): PositionSnapshot {
  const chess = new Chess(fen);
  const board = chess.board();

  const whitePieces: string[] = [];
  const blackPieces: string[] = [];
  const whiteRaw: { type: PieceSymbol }[] = [];
  const blackRaw: { type: PieceSymbol }[] = [];

  for (const row of board) {
    for (const cell of row) {
      if (!cell) continue;
      const label = pieceLabel(cell.color, cell.type, cell.square);
      if (cell.color === "w") {
        whitePieces.push(label);
        whiteRaw.push({ type: cell.type });
      } else {
        blackPieces.push(label);
        blackRaw.push({ type: cell.type });
      }
    }
  }

  const whiteCounts = countPieces(whiteRaw);
  const blackCounts = countPieces(blackRaw);

  return {
    sideToMove: chess.turn() === "w" ? "white" : "black",
    asciiBoard: buildAsciiBoard(chess),
    whitePieces,
    blackPieces,
    materialSummary: [
      formatSideMaterial("w", whiteCounts),
      formatSideMaterial("b", blackCounts),
    ].join(" | "),
    absentPieces: formatAbsentPieces(whiteCounts, blackCounts),
  };
}

export type MoveHistoryEntry = {
  ply: number;
  move_san: string | null;
};

/** Format SAN history up to a ply, emphasizing recent moves in long games. */
export function formatMoveHistory(
  positions: MoveHistoryEntry[],
  upToPly: number,
  maxRecentHalfMoves = 14,
): string {
  const moves = positions
    .filter((p) => p.ply > 0 && p.ply <= upToPly && p.move_san)
    .sort((a, b) => a.ply - b.ply);

  if (moves.length === 0) return "No moves played yet.";

  const full = formatSanMoveList(moves);

  if (moves.length <= maxRecentHalfMoves + 6) {
    return full;
  }

  const recent = moves.slice(-maxRecentHalfMoves);
  const opening = formatSanMoveList(moves.slice(0, 4));
  const recentText = formatSanMoveList(recent);

  return [
    `Opening: ${opening}`,
    `… (${moves.length - 4 - maxRecentHalfMoves} half-moves omitted) …`,
    `Recent: ${recentText}`,
  ].join("\n");
}

function formatSanMoveList(
  moves: { ply: number; move_san: string | null }[],
): string {
  const parts: string[] = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i]!;
    if (move.ply % 2 === 1) {
      parts.push(`${Math.ceil(move.ply / 2)}. ${move.move_san}`);
    } else {
      parts.push(move.move_san!);
    }
  }
  return parts.join(" ");
}

export function formatBoardForPrompt(snapshot: PositionSnapshot): string {
  return [
    "BOARD STATE (ground truth — only reference pieces listed here):",
    "",
    snapshot.asciiBoard,
    "",
    "White pieces:",
    snapshot.whitePieces.length > 0
      ? snapshot.whitePieces.map((p) => `- ${p}`).join("\n")
      : "- (none)",
    "",
    "Black pieces:",
    snapshot.blackPieces.length > 0
      ? snapshot.blackPieces.map((p) => `- ${p}`).join("\n")
      : "- (none)",
    "",
    `Material: ${snapshot.materialSummary}`,
    `Notable: ${snapshot.absentPieces}`,
    `Side to move: ${snapshot.sideToMove}`,
  ].join("\n");
}
