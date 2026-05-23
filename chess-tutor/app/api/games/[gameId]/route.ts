import { NextResponse } from "next/server";
import { getGameById, updateGameUserColor } from "@/lib/supabase/games";
import type { UserColor } from "@/types";

type RouteContext = { params: Promise<{ gameId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { gameId } = await context.params;
    const data = await getGameById(gameId);

    if (!data) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load game.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { gameId } = await context.params;
    const body = (await request.json()) as {
      userColor?: UserColor;
      playerUsername?: string;
    };

    if (body.userColor !== "white" && body.userColor !== "black") {
      return NextResponse.json({ error: "userColor must be white or black." }, { status: 400 });
    }

    const game = await updateGameUserColor(
      gameId,
      body.userColor,
      body.playerUsername?.trim(),
    );

    return NextResponse.json({ game });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update game.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
