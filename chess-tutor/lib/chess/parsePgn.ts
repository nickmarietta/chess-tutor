import { Chess } from "chess.js";
import type { ParsedGameMetadata, ParsedPosition } from "@/types";

function parsePlayedAt(headers: Record<string, string | null>): string | null {
  const date = headers.Date;
  if (!date || date === "????.??.??") return null;
  const time = headers.UTCTime ?? "12:00:00";
  const iso = `${date.replace(/\./g, "-")}T${time}Z`;
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

export function parsePgn(rawPgn: string): ParsedGameMetadata {
  const trimmed = rawPgn.trim();
  if (!trimmed) {
    throw new Error("PGN is empty.");
  }

  const replay = new Chess();
  try {
    replay.loadPgn(trimmed, { strict: false });
  } catch {
    throw new Error("Could not parse PGN. Check the format and try again.");
  }

  if (replay.history().length === 0 && !trimmed.includes("1.")) {
    throw new Error("Could not parse PGN. Check the format and try again.");
  }

  const headers = replay.header();
  const verboseMoves = replay.history({ verbose: true });

  const positions: ParsedPosition[] = [];
  const board = new Chess();

  positions.push({
    ply: 0,
    fen: board.fen(),
    moveSan: null,
  });

  for (const move of verboseMoves) {
    board.move(move.san);
    positions.push({
      ply: positions.length,
      fen: board.fen(),
      moveSan: move.san,
    });
  }

  return {
    whitePlayer: headers.White ?? null,
    blackPlayer: headers.Black ?? null,
    result: headers.Result ?? null,
    playedAt: parsePlayedAt(headers),
    positions,
  };
}
