import type { GameSource, ParsedGameMetadata } from "@/types";
import { createServerClient } from "./server";

export type CreateGameInput = {
  rawPgn: string;
  source: GameSource;
  sourceGameId?: string | null;
  metadata: ParsedGameMetadata;
};

export async function createGameWithPositions(input: CreateGameInput) {
  const supabase = createServerClient();
  const { metadata, rawPgn, source, sourceGameId } = input;

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      source,
      source_game_id: sourceGameId ?? null,
      white_player: metadata.whitePlayer,
      black_player: metadata.blackPlayer,
      result: metadata.result,
      played_at: metadata.playedAt,
      raw_pgn: rawPgn,
    })
    .select()
    .single();

  if (gameError || !game) {
    throw new Error(gameError?.message ?? "Failed to save game.");
  }

  const positionRows = metadata.positions.map((p) => ({
    game_id: game.id,
    ply: p.ply,
    fen: p.fen,
    move_san: p.moveSan,
  }));

  const { data: positions, error: positionsError } = await supabase
    .from("positions")
    .insert(positionRows)
    .select();

  if (positionsError) {
    throw new Error(positionsError.message);
  }

  return { game, positions: positions ?? [] };
}

export async function listGames() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getGameById(gameId: string) {
  const supabase = createServerClient();

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (gameError || !game) return null;

  const { data: positions, error: positionsError } = await supabase
    .from("positions")
    .select("*")
    .eq("game_id", gameId)
    .order("ply", { ascending: true });

  if (positionsError) throw new Error(positionsError.message);

  const { data: reflections, error: reflectionsError } = await supabase
    .from("reflections")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });

  if (reflectionsError) throw new Error(reflectionsError.message);

  return {
    game,
    positions: positions ?? [],
    reflections: reflections ?? [],
  };
}
