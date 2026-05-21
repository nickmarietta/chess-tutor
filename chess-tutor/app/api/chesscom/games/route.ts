import { NextResponse } from "next/server";
import { fetchMonthGames } from "@/lib/chesscom/api";

export async function GET(request: Request) {
  const archiveUrl = new URL(request.url).searchParams.get("archiveUrl")?.trim();

  if (!archiveUrl?.startsWith("https://api.chess.com/")) {
    return NextResponse.json({ error: "Valid archiveUrl is required." }, { status: 400 });
  }

  try {
    const games = await fetchMonthGames(archiveUrl);
    return NextResponse.json({ games });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch games.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
