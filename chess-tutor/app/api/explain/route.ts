import { NextResponse } from "next/server";
import { generateExplain } from "@/lib/coach/explain/generateExplain";
import { getGameById } from "@/lib/supabase/games";
import type { ExplainRequest } from "@/types/annotations";
import type { HelpMode } from "@/types";

const HELP_MODES: HelpMode[] = ["hint", "guide", "answer"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExplainRequest;

    if (!body.gameId || !body.positionId) {
      return NextResponse.json(
        { error: "gameId and positionId are required." },
        { status: 400 },
      );
    }

    const helpMode = body.helpMode ?? "guide";
    if (!HELP_MODES.includes(helpMode)) {
      return NextResponse.json({ error: "Invalid help mode." }, { status: 400 });
    }

    const gameData = await getGameById(body.gameId);
    if (!gameData) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    const currentPosition = gameData.positions.find(
      (p) => p.id === body.positionId,
    );
    if (!currentPosition) {
      return NextResponse.json({ error: "Position not found." }, { status: 404 });
    }

    const parentPosition =
      currentPosition.ply > 0
        ? gameData.positions.find((p) => p.ply === currentPosition.ply - 1)
        : null;

    const reflectionForPosition = gameData.reflections.find(
      (r) => r.position_id === currentPosition.id,
    );

    const result = await generateExplain({
      fen: currentPosition.fen,
      fenBefore: parentPosition?.fen ?? null,
      ply: currentPosition.ply,
      selectedMoveSan:
        body.selectedMoveSan ?? currentPosition.move_san,
      userColor: gameData.game.user_color,
      helpMode,
      userReflection: body.userReflection ?? reflectionForPosition?.user_text,
      explainBestMove: body.explainBestMove ?? false,
      positions: gameData.positions.map((p) => ({
        ply: p.ply,
        move_san: p.move_san,
        fen: p.fen,
      })),
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate explanation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
