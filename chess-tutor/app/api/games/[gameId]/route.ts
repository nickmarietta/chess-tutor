import { NextResponse } from "next/server";
import { getGameById } from "@/lib/supabase/games";

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
