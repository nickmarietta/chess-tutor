export type HelpMode = "hint" | "guide" | "answer";

export type GameSource = "pgn_paste" | "chess_com";

export interface ParsedPosition {
  ply: number;
  fen: string;
  moveSan: string | null;
}

export interface ParsedGameMetadata {
  whitePlayer: string | null;
  blackPlayer: string | null;
  result: string | null;
  playedAt: string | null;
  event?: string | null;
  positions: ParsedPosition[];
}

export interface ParsedGame {
  rawPgn: string;
  metadata: ParsedGameMetadata;
  positions: ParsedPosition[];
}
