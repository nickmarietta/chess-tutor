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

  // Single RPC call — the SQL function handles atomic increments via
  // ON CONFLICT against the coalesce expression index.
  const { error } = await supabase.rpc("upsert_mistake_stats", {
    p_stats: rows.map((row) => ({
      user_id: row.userId ?? null,
      player_key: row.playerKey ?? null,
      mistake_tag: row.mistakeTag,
      count: row.count,
      last_seen_at: row.lastSeenAt,
    })),
  });

  if (error) throw new Error(error.message);
}

export type { UserMistakeStat };
