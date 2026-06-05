import { createServerClient } from "./server";
import type {
  MoveAnalysis,
  UserMistakeStat,
  UserColor,
  AnalysisStatus,
  MistakeTag,
} from "@/types";

type StoredMoveAnalysis = Omit<MoveAnalysis, "id" | "created_at">;

type UserMistakeStatUpsert = {
  userId?: string | null;
  playerKey?: string | null;
  mistakeTag: MistakeTag;
  count: number;
  lastSeenAt: string;
};

export async function listMoveAnalyses(gameId: string): Promise<MoveAnalysis[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("move_analyses")
    .select("*")
    .eq("game_id", gameId)
    .order("ply", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as MoveAnalysis[] | null) ?? [];
}

export async function replaceMoveAnalyses(
  gameId: string,
  analyses: StoredMoveAnalysis[],
) {
  const supabase = createServerClient();

  const { error: deleteError } = await supabase
    .from("move_analyses")
    .delete()
    .eq("game_id", gameId);

  if (deleteError) throw new Error(deleteError.message);

  if (analyses.length === 0) return [];

  const { data, error } = await supabase
    .from("move_analyses")
    .insert(analyses)
    .select()
    .order("ply", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as MoveAnalysis[] | null) ?? [];
}

export async function updateGameAnalysisState(
  gameId: string,
  status: AnalysisStatus,
  errorMessage?: string | null,
) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("games")
    .update({
      analysis_status: status,
      analysis_error: errorMessage ?? null,
      analysis_completed_at:
        status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", gameId);

  if (error) throw new Error(error.message);
}

export async function syncMoveAnalysesUserColor(
  gameId: string,
  userColor: UserColor,
) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("move_analyses")
    .update({ user_color: userColor })
    .eq("game_id", gameId);

  if (error) throw new Error(error.message);
}

export async function upsertUserMistakeStats(
  rows: UserMistakeStatUpsert[],
): Promise<void> {
  if (rows.length === 0) return;

  const supabase = createServerClient();

  for (const row of rows) {
    let query = supabase
      .from("user_mistake_stats")
      .select("*")
      .eq("mistake_tag", row.mistakeTag)
      .limit(1);

    query = row.userId ? query.eq("user_id", row.userId) : query.is("user_id", null);
    query = row.playerKey
      ? query.eq("player_key", row.playerKey)
      : query.is("player_key", null);

    const { data: existing, error: selectError } = await query.maybeSingle();
    if (selectError) throw new Error(selectError.message);

    if (existing) {
      const { error: updateError } = await supabase
        .from("user_mistake_stats")
        .update({
          count: (existing.count as number) + row.count,
          last_seen_at: row.lastSeenAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) throw new Error(updateError.message);
      continue;
    }

    const { error: insertError } = await supabase.from("user_mistake_stats").insert({
      user_id: row.userId ?? null,
      player_key: row.playerKey ?? null,
      mistake_tag: row.mistakeTag,
      count: row.count,
      last_seen_at: row.lastSeenAt,
    });

    if (insertError) throw new Error(insertError.message);
  }
}

export type { UserMistakeStat };
