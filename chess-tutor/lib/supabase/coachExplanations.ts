import { createServerClient } from "./server";
import type { BoardAnnotations, CoachExplanation, HelpMode } from "@/types";

export async function findCachedExplanation(params: {
  gameId: string;
  positionId: string;
  helpMode: HelpMode;
  analysisHash: string;
}): Promise<CoachExplanation | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("coach_explanations")
    .select("*")
    .eq("game_id", params.gameId)
    .eq("position_id", params.positionId)
    .eq("explanation_type", "explain_move")
    .eq("help_mode", params.helpMode)
    .eq("analysis_hash", params.analysisHash)
    .is("user_reflection_hash", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CoachExplanation | null) ?? null;
}

/**
 * Best-effort cache write for a freshly-generated, fully-validated
 * explanation. Never called for the deterministic fallback — that's never
 * persisted, per the confirmed design. A conflict here (a concurrent
 * request already cached the same key) is swallowed rather than surfaced:
 * this request's caller already has its own valid response regardless of
 * whether the write succeeds.
 */
export async function saveCoachExplanation(params: {
  gameId: string;
  positionId: string;
  helpMode: HelpMode;
  analysisHash: string;
  coachResponse: string;
  boardAnnotations: BoardAnnotations;
  modelProvider: string;
  modelName: string;
}): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("coach_explanations").insert({
    game_id: params.gameId,
    position_id: params.positionId,
    explanation_type: "explain_move",
    help_mode: params.helpMode,
    analysis_hash: params.analysisHash,
    coach_response: params.coachResponse,
    board_annotations: params.boardAnnotations,
    model_provider: params.modelProvider,
    model_name: params.modelName,
  });

  if (error && error.code !== "23505") {
    // 23505 = unique_violation — a concurrent request already cached this
    // exact key. Anything else is worth knowing about, even though it
    // shouldn't fail the request that already has its answer.
    console.error("Failed to cache coach explanation:", error.message);
  }
}
