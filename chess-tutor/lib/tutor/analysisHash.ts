import { createHash } from "node:crypto";
import type { MoveAnalysis } from "@/types";

/**
 * Hashes the engine-derived fields of a move analysis so cached tutor output
 * can be invalidated whenever re-analysis (e.g. a depth bump) changes them,
 * without tracking a separate analysis-pipeline version number.
 */
export function computeAnalysisHash(analysis: MoveAnalysis): string {
  const canonical = JSON.stringify({
    fenBefore: analysis.fen_before,
    fenAfter: analysis.fen_after,
    evalBefore: analysis.eval_before,
    evalAfter: analysis.eval_after,
    evalSwing: analysis.eval_swing,
    bestMoveSan: analysis.best_move_san,
    bestMoveUci: analysis.best_move_uci,
    engineLine: analysis.engine_line,
    candidateMoves: analysis.candidate_moves,
    mistakeSeverity: analysis.mistake_severity,
    mistakeTags: [...analysis.mistake_tags].sort(),
    movePlayedSan: analysis.move_played_san,
    movePlayedUci: analysis.move_played_uci,
  });

  return createHash("sha256").update(canonical).digest("hex");
}
