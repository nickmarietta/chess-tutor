import { NextResponse } from "next/server";
import { normalizeFen } from "@/lib/chess/boardState";
import { analyzePositionWithStockfish } from "@/lib/engine/stockfish";
import { barValueFromNormalized } from "@/lib/engine/normalizeScore";
import type { EngineEvalApiResponse } from "@/types/engineEval";

export async function POST(request: Request) {
  let fen: string | undefined;
  try {
    const body = (await request.json()) as { fen?: string };
    fen = body.fen;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!fen || typeof fen !== "string") {
    return NextResponse.json({ error: "fen is required" }, { status: 400 });
  }

  const normalizedFen = normalizeFen(fen);

  try {
    const result = await analyzePositionWithStockfish(normalizedFen, {
      depth: 14,
      multiPv: 1,
    });

    if (!result.normalized) {
      return NextResponse.json(
        { error: "Engine returned no score" },
        { status: 502 },
      );
    }

    const n = result.normalized;
    const payload: EngineEvalApiResponse = {
      fen: normalizedFen,
      sideToMove: n.sideToMove,
      rawScore: n.rawScore,
      evalWhitePawns: n.evalWhitePawns,
      mateIn: n.mateIn,
      scoreType: n.scoreType,
      convertedFromSideToMove: n.convertedFromSideToMove,
    };

    return NextResponse.json({
      ...payload,
      evalWhite: barValueFromNormalized(n),
    });
  } catch (error) {
    console.error("[api/eval]", error);
    return NextResponse.json(
      { error: "Engine evaluation failed" },
      { status: 500 },
    );
  }
}
