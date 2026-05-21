import { NextResponse } from "next/server";
import { generateCoachResponse } from "@/lib/coach/generateResponse";
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

    const coachResponse = generateCoachResponse(userText ?? "", helpMode, {
      fen: body.fen ?? "",
      moveSan: body.moveSan ?? null,
      ply: body.ply ?? 0,
      whitePlayer: body.whitePlayer ?? null,
      blackPlayer: body.blackPlayer ?? null,
    });

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
