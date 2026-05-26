import { NextResponse } from "next/server";
import { generateExplain } from "@/lib/coach/explain/generateExplain";
import { getGameById } from "@/lib/supabase/games";
import type { ExplainRequest } from "@/types/annotations";
import type { HelpMode } from "@/types";

const HELP_MODES: HelpMode[] = ["hint", "guide", "answer"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExplainRequest;

    if (!body.gameId) {
      return NextResponse.json({ error: "gameId is required." }, { status: 400 });
    }

    const helpMode = body.helpMode ?? "guide";
    if (!HELP_MODES.includes(helpMode)) {
      return NextResponse.json({ error: "Invalid help mode." }, { status: 400 });
    }

    const gameData = await getGameById(body.gameId);
    if (!gameData) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    const dbPosition = body.positionId
      ? gameData.positions.find((p) => p.id === body.positionId)
      : null;

    const fen = body.fen ?? dbPosition?.fen;
    if (!fen) {
      return NextResponse.json(
        { error: "fen or valid positionId is required." },
        { status: 400 },
      );
    }

    const parentFromDb =
      dbPosition && dbPosition.ply > 0
        ? gameData.positions.find((p) => p.ply === dbPosition.ply - 1)
        : null;

    const fenBefore =
      body.fenBefore !== undefined
        ? body.fenBefore
        : (parentFromDb?.fen ?? null);

    const reflectionForPosition = dbPosition
      ? gameData.reflections.find((r) => r.position_id === dbPosition.id)
      : undefined;

    const result = await generateExplain({
      fen,
      fenBefore,
      ply: body.ply ?? dbPosition?.ply ?? 0,
      selectedMoveSan: body.selectedMoveSan ?? dbPosition?.move_san ?? null,
      userColor: gameData.game.user_color,
      helpMode,
      userReflection: body.userReflection ?? reflectionForPosition?.user_text,
      explainBestMove: body.explainBestMove ?? false,
      positions: gameData.positions.map((p) => ({
        ply: p.ply,
        move_san: p.move_san,
        fen: p.fen,
      })),
      analysisMoves: body.analysisMoves,
      isAnalysis: body.isAnalysis ?? false,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate explanation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
