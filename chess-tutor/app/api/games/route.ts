import { NextResponse } from "next/server";
import { tryAcquireAnalysis, releaseAnalysis } from "@/lib/analysis/semaphore";
import { analyzeGameNow } from "@/lib/analysis/service";
import { parsePgn } from "@/lib/chess/parsePgn";
import { resolveUserColor } from "@/lib/chess/resolveUserColor";
import { createGameWithPositions, listGames } from "@/lib/supabase/games";
import type { GameSource, UserColor } from "@/types";

const MAX_PGN_CHARS = 50_000;

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

    if (pgn.length > MAX_PGN_CHARS) {
      return NextResponse.json(
        { error: `PGN must be under ${MAX_PGN_CHARS.toLocaleString()} characters.` },
        { status: 400 },
      );
    }

    if (!tryAcquireAnalysis()) {
      return NextResponse.json(
        { error: "An analysis is already running. Please wait a moment and try again." },
        { status: 503 },
      );
    }

    try {
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

      await analyzeGameNow(game.id);

      return NextResponse.json({ game }, { status: 201 });
    } finally {
      releaseAnalysis();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to import game.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
