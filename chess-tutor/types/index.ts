export type GameSource = "pgn_paste" | "chess_com";

export type HelpMode = "hint" | "guide" | "answer";

export type ParsedPosition = {
  ply: number;
  fen: string;
  moveSan: string | null;
};

export type ParsedGameMetadata = {
  whitePlayer: string | null;
  blackPlayer: string | null;
  result: string | null;
  playedAt: string | null;
  positions: ParsedPosition[];
};

export type Game = {
  id: string;
  source: GameSource;
  source_game_id: string | null;
  white_player: string | null;
  black_player: string | null;
  result: string | null;
  played_at: string | null;
  raw_pgn: string;
  created_at: string;
};

export type Position = {
  id: string;
  game_id: string;
  ply: number;
  fen: string;
  move_san: string | null;
  created_at: string;
};

export type Reflection = {
  id: string;
  game_id: string;
  position_id: string;
  user_text: string;
  help_mode: HelpMode;
  coach_response: string | null;
  created_at: string;
};

export type ChessComArchiveGame = {
  url: string;
  pgn: string;
  time_control: string | null;
  end_time: number | null;
  rated: boolean;
  white: { username: string; rating?: number };
  black: { username: string; rating?: number };
  result: string;
};
