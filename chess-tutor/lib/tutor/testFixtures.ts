import type { MoveAnalysis } from "@/types";

export function makeMoveAnalysis(overrides: Partial<MoveAnalysis> = {}): MoveAnalysis {
  return {
    id: "analysis-1",
    game_id: "game-1",
    position_id: "position-1",
    ply: 10,
    fen_before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen_after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    move_played_san: "e4",
    move_played_uci: "e2e4",
    user_color: "white",
    side_to_move: "white",
    eval_before: 0.2,
    eval_after: 0.3,
    eval_swing: 0.1,
    best_move_san: "e4",
    best_move_uci: "e2e4",
    engine_line: [],
    candidate_moves: [],
    mistake_severity: "none",
    mistake_tags: [],
    is_critical: false,
    created_at: "2026-08-31T00:00:00.000Z",
    ...overrides,
  };
}
