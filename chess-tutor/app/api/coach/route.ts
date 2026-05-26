import { NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/coach/generateResponse";
import { getGameById } from "@/lib/supabase/games";
import { createServerClient } from "@/lib/supabase/server";
import type { HelpMode } from "@/types";

const HELP_MODES: HelpMode[] = ["hint", "guide", "answer"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      gameId?: string;
      positionId?: string;
      userText?: string;
      helpMode?: HelpMode;
      fen?: string;
      fenBefore?: string | null;
      moveSan?: string | null;
      ply?: number;
      whitePlayer?: string | null;
      blackPlayer?: string | null;
      isAnalysis?: boolean;
      analysisMoves?: string[];
    };

    const { gameId, positionId, userText, helpMode } = body;

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required." }, { status: 400 });
    }

    if (!helpMode || !HELP_MODES.includes(helpMode)) {
      return NextResponse.json({ error: "Invalid help mode." }, { status: 400 });
    }

    const gameData = await getGameById(gameId);
    if (!gameData) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    const dbPosition = positionId
      ? gameData.positions.find((p) => p.id === positionId)
      : null;

    const fen = body.fen ?? dbPosition?.fen;
    if (!fen) {
      return NextResponse.json(
        { error: "fen or valid positionId is required." },
        { status: 400 },
      );
    }

    const positions = gameData.positions.map((p) => ({
      ply: p.ply,
      move_san: p.move_san,
    }));

    const coachResponse = await generateCoachResponse(
      userText ?? "",
      helpMode,
      {
        fen,
        moveSan: body.moveSan ?? dbPosition?.move_san ?? null,
        ply: body.ply ?? dbPosition?.ply ?? 0,
        whitePlayer: gameData.game.white_player,
        blackPlayer: gameData.game.black_player,
        playerUsername: gameData.game.player_username,
        userColor: gameData.game.user_color,
        isAnalysis: body.isAnalysis ?? false,
        analysisMoves: body.analysisMoves,
      },
      positions,
      body.analysisMoves,
    );

    if (!positionId || body.isAnalysis) {
      return NextResponse.json({
        coachResponse,
        reflection: null,
      });
    }

    const supabase = createServerClient();
    const { data: reflection, error } = await supabase
      .from("reflections")
      .insert({
        game_id: gameId,
        position_id: positionId,
        user_text: userText?.trim() ?? "",
        help_mode: helpMode,
        coach_response: coachResponse,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coachResponse, reflection });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate coaching.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
