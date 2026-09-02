import type { BoardAnnotations } from "./annotations";

export type HelpMode = "hint" | "guide" | "answer";

export type ExplanationType =
  | "explain_move"
  | "hint"
  | "better_idea"
  | "quiz"
  | "engine_move"
  | "reflection";

export type CoachExplanation = {
  id: string;
  game_id: string;
  position_id: string | null;
  explanation_type: ExplanationType;
  help_mode: HelpMode;
  user_reflection_hash: string | null;
  coach_response: string;
  board_annotations: BoardAnnotations;
  model_provider: string | null;
  model_name: string | null;
  analysis_hash: string | null;
  created_at: string;
};
