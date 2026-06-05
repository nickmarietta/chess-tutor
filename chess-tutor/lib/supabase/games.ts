import {
  listMoveAnalyses,
  replaceMoveAnalyses,
  syncMoveAnalysesUserColor,
  updateGameAnalysisState,
  upsertUserMistakeStats,
} from "./analysis";
import type {
  GameSource,
  ParsedGameMetadata,
  UserColor,
} from "@/types";
import { createServerClient } from "./server";

export type CreateGameInput = {
  rawPgn: string;
  source: GameSource;
  sourceGameId?: string | null;
  metadata: ParsedGameMetadata;
  playerUsername?: string | null;
  userColor?: UserColor | null;
};

const SCHEMA_MIGRATION_HINT =
  "Run supabase/migrations/20240520100000_game_user_color.sql in the Supabase SQL editor.";

function isMissingUserColorColumns(message: string | undefined): boolean {
  if (!message) return false;
  return (
    message.includes("player_username") ||
    message.includes("user_color") ||
    message.includes("schema cache")
  );
}

export async function createGameWithPositions(input: CreateGameInput) {
  const supabase = createServerClient();
  const { metadata, rawPgn, source, sourceGameId } = input;

  const baseRow = {
    source,
    source_game_id: sourceGameId ?? null,
    white_player: metadata.whitePlayer,
    black_player: metadata.blackPlayer,
    result: metadata.result,
    played_at: metadata.playedAt,
    raw_pgn: rawPgn,
    analysis_status: "pending",
    analysis_error: null,
    analysis_completed_at: null,
  };

  const fullRow = {
    ...baseRow,
    player_username: input.playerUsername ?? null,
    user_color: input.userColor ?? null,
  };

  let { data: game, error: gameError } = await supabase
    .from("games")
    .insert(fullRow)
    .select()
    .single();

  if (gameError && isMissingUserColorColumns(gameError.message)) {
    console.warn(
      `games.user_color columns missing — ${SCHEMA_MIGRATION_HINT}`,
    );
    ({ data: game, error: gameError } = await supabase
      .from("games")
      .insert(baseRow)
      .select()
      .single());
  }

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

  const analyses = await listMoveAnalyses(gameId);

  return {
    game,
    positions: positions ?? [],
    analyses,
  };
}

export async function updateGameUserColor(
  gameId: string,
  userColor: UserColor,
  playerUsername?: string | null,
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("games")
    .update({
      user_color: userColor,
      ...(playerUsername !== undefined ? { player_username: playerUsername } : {}),
    })
    .eq("id", gameId)
    .select()
    .single();

  if (error && isMissingUserColorColumns(error.message)) {
    throw new Error(
      `Cannot save your color yet. ${SCHEMA_MIGRATION_HINT}`,
    );
  }

  if (error) throw new Error(error.message);
  await syncMoveAnalysesUserColor(gameId, userColor);
  return data;
}
