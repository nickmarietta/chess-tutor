import { NextResponse } from "next/server";
import { fetchArchives } from "@/lib/chesscom/api";

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json({ error: "username is required." }, { status: 400 });
  }

  try {
    const archives = await fetchArchives(username);
    return NextResponse.json({ archives });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch archives.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
