import type { UserColor } from "./index";

export type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

export type MistakeSeverity = "none" | "inaccuracy" | "mistake" | "blunder";

export type MistakeTag =
  | "missed_tactic"
  | "hanging_piece"
  | "poor_piece_activity"
  | "bad_trade"
  | "ignored_opponent_threat"
  | "premature_attack"
  | "weak_king_safety"
  | "passive_defense"
  | "opening_principle_violation";

export type CandidateMove = {
  san: string | null;
  uci: string | null;
  score: number | null;
  scoreType: "cp" | "mate" | null;
};

export type EngineLineMove = {
  san: string;
  uci: string;
  fenAfter: string;
};

export type MoveAnalysis = {
  id: string;
  game_id: string;
  position_id: string;
  ply: number;
  fen_before: string;
  fen_after: string;
  move_played_san: string | null;
  move_played_uci: string | null;
  user_color: UserColor | null;
  side_to_move: UserColor;
  eval_before: number | null;
  eval_after: number | null;
  eval_swing: number | null;
  best_move_san: string | null;
  best_move_uci: string | null;
  engine_line: EngineLineMove[];
  candidate_moves: CandidateMove[];
  mistake_severity: MistakeSeverity;
  mistake_tags: MistakeTag[];
  is_critical: boolean;
  created_at: string;
};

export type UserMistakeStat = {
  id: string;
  user_id: string | null;
  player_key: string | null;
  mistake_tag: MistakeTag;
  count: number;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
};
