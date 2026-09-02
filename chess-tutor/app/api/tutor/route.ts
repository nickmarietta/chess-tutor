import { NextResponse } from "next/server";
import { isAiEnabled } from "@/lib/config/featureFlags";
import { explainMove } from "@/lib/tutor/explainMove";
import { listMoveAnalyses } from "@/lib/supabase/analysis";
import type { HelpMode } from "@/types";

const HELP_MODES: HelpMode[] = ["hint", "guide", "answer"];

export async function POST(request: Request) {
  if (!isAiEnabled()) {
    return NextResponse.json(
      { error: "The AI tutor is currently disabled." },
      { status: 403 },
    );
  }

  let body: { gameId?: string; positionId?: string; helpMode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { gameId, positionId, helpMode } = body;
  if (!gameId || !positionId) {
    return NextResponse.json(
      { error: "gameId and positionId are required." },
      { status: 400 },
    );
  }
  if (!helpMode || !HELP_MODES.includes(helpMode as HelpMode)) {
    return NextResponse.json(
      { error: `helpMode must be one of: ${HELP_MODES.join(", ")}.` },
      { status: 400 },
    );
  }

  let analyses;
  try {
    analyses = await listMoveAnalyses(gameId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load move analysis.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const analysis = analyses.find((a) => a.position_id === positionId);
  if (!analysis) {
    return NextResponse.json(
      { error: "No move analysis found for this position." },
      { status: 404 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let first = true;
        for await (const sentence of explainMove(analysis, helpMode as HelpMode)) {
          controller.enqueue(encoder.encode((first ? "" : " ") + sentence));
          first = false;
        }
      } catch (err) {
        // explainMove already falls back internally for LLM/validation
        // failures; anything that reaches here is a genuine bug, and the
        // client should see the stream simply end rather than hang.
        console.error("Unexpected error while streaming tutor explanation:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
