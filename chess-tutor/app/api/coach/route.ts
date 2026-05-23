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
      moveSan?: string | null;
      ply?: number;
      whitePlayer?: string | null;
      blackPlayer?: string | null;
    };

    const { gameId, positionId, userText, helpMode } = body;

    if (!gameId || !positionId) {
      return NextResponse.json(
        { error: "gameId and positionId are required." },
        { status: 400 },
      );
    }

    if (!helpMode || !HELP_MODES.includes(helpMode)) {
      return NextResponse.json({ error: "Invalid help mode." }, { status: 400 });
    }

    const gameData = await getGameById(gameId);
    if (!gameData) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    const currentPosition = gameData.positions.find((p) => p.id === positionId);
    if (!currentPosition) {
      return NextResponse.json({ error: "Position not found." }, { status: 404 });
    }

    const positions = gameData.positions.map((p) => ({
      ply: p.ply,
      move_san: p.move_san,
    }));

    const coachResponse = await generateCoachResponse(
      userText ?? "",
      helpMode,
      {
        fen: currentPosition.fen,
        moveSan: currentPosition.move_san,
        ply: currentPosition.ply,
        whitePlayer: gameData.game.white_player,
        blackPlayer: gameData.game.black_player,
        playerUsername: gameData.game.player_username,
        userColor: gameData.game.user_color,
      },
      positions,
    );

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
