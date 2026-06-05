import { Chess } from "chess.js";
import type { EngineLineMove } from "@/types";

function splitUci(uci: string) {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4, 5) : undefined,
  };
}

export function sanToUci(fen: string, san: string | null): string | null {
  if (!san) return null;
  const chess = new Chess(fen);

  try {
    const move = chess.move(san, { strict: false });
    if (!move) return null;
    return `${move.from}${move.to}${move.promotion ?? ""}`;
  } catch {
    return null;
  }
}

export function uciToSan(fen: string, uci: string | null): string | null {
  if (!uci) return null;
  const chess = new Chess(fen);

  try {
    const move = chess.move(splitUci(uci));
    return move?.san ?? null;
  } catch {
    return null;
  }
}

export function buildEngineLineFromPv(
  fen: string,
  pv: string | null | undefined,
  maxMoves = 5,
): EngineLineMove[] {
  if (!pv) return [];

  const chess = new Chess(fen);
  const uciMoves = pv.trim().split(/\s+/).filter(Boolean).slice(0, maxMoves);
  const line: EngineLineMove[] = [];

  for (const uci of uciMoves) {
    try {
      const move = chess.move(splitUci(uci));
      if (!move) break;
      line.push({
        san: move.san,
        uci,
        fenAfter: chess.fen(),
      });
    } catch {
      break;
    }
  }

  return line;
}
