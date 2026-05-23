import { NextResponse } from "next/server";
import { parsePgn } from "@/lib/chess/parsePgn";
import { resolveUserColor } from "@/lib/chess/resolveUserColor";
import { createGameWithPositions, listGames } from "@/lib/supabase/games";
import type { GameSource, UserColor } from "@/types";

export async function GET() {
  try {
    const games = await listGames();
    return NextResponse.json({ games });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load games.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pgn?: string;
      source?: GameSource;
      sourceGameId?: string;
      playerUsername?: string;
      userColor?: UserColor;
    };

    const pgn = body.pgn?.trim();
    if (!pgn) {
      return NextResponse.json({ error: "PGN is required." }, { status: 400 });
    }

    const metadata = parsePgn(pgn);
    const source: GameSource = body.source ?? "pgn_paste";
    const playerUsername = body.playerUsername?.trim() || null;

    const userColor =
      body.userColor ??
      resolveUserColor(
        metadata.whitePlayer,
        metadata.blackPlayer,
        playerUsername,
      );

    const { game } = await createGameWithPositions({
      rawPgn: pgn,
      source,
      sourceGameId: body.sourceGameId ?? null,
      metadata,
      playerUsername,
      userColor,
    });

    return NextResponse.json({ game }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to import game.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
