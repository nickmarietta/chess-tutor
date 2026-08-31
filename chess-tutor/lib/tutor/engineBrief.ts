import type {
  CandidateMove,
  MistakeSeverity,
  MistakeTag,
  MoveAnalysis,
  UserColor,
} from "@/types";

export type EngineBrief = {
  sideToMove: UserColor;
  movePlayedSan: string | null;
  bestMoveSan: string | null;
  bestMoveUci: string | null;
  evalBefore: number | null;
  evalAfter: number | null;
  evalSwing: number | null;
  severity: MistakeSeverity;
  mistakeTags: MistakeTag[];
  candidateMoves: CandidateMove[];
  isCritical: boolean;
};

/**
 * Extracts the chess facts an explanation is allowed to reference from a
 * stored move analysis. Both the deterministic renderer and (later) the LLM
 * validator treat this as the full set of legal claims — nothing outside it.
 *
 * Deliberately a different field set from computeAnalysisHash (./analysisHash):
 * this is "what may be rendered", that is "what changing should invalidate a
 * cached explanation" — a superset. If a field starts being rendered here,
 * confirm it's also covered there.
 */
export function buildEngineBrief(analysis: MoveAnalysis): EngineBrief {
  return {
    sideToMove: analysis.side_to_move,
    movePlayedSan: analysis.move_played_san,
    bestMoveSan: analysis.best_move_san,
    bestMoveUci: analysis.best_move_uci,
    evalBefore: analysis.eval_before,
    evalAfter: analysis.eval_after,
    evalSwing: analysis.eval_swing,
    severity: analysis.mistake_severity,
    mistakeTags: analysis.mistake_tags,
    candidateMoves: analysis.candidate_moves,
    isCritical: analysis.is_critical,
  };
}
