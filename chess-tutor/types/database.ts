import type { GameSource, HelpMode } from "./chess";

export interface GameRow {
  id: string;
  user_id: string | null;
  source: GameSource;
  source_game_id: string | null;
  white_player: string | null;
  black_player: string | null;
  result: string | null;
  played_at: string | null;
  raw_pgn: string;
  created_at: string;
}

export interface PositionRow {
  id: string;
  game_id: string;
  ply: number;
  fen: string;
  move_san: string | null;
  created_at: string;
}

export interface ReflectionRow {
  id: string;
  game_id: string;
  position_id: string;
  user_text: string;
  help_mode: HelpMode;
  coach_response: string | null;
  mistake_category: string | null;
  created_at: string;
}

export interface GameWithPositionCount extends GameRow {
  position_count?: number;
}

export interface GameDetail extends GameRow {
  positions: PositionRow[];
  reflections: ReflectionRow[];
}
