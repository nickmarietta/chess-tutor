import type { ChessComArchiveGame } from "@/types";

const CHESS_COM_API = "https://api.chess.com/pub";

export async function fetchArchives(username: string): Promise<string[]> {
  const res = await fetch(
    `${CHESS_COM_API}/player/${encodeURIComponent(username)}/games/archives`,
    { next: { revalidate: 300 } },
  );

  if (res.status === 404) {
    throw new Error(`Chess.com player "${username}" not found.`);
  }
  if (!res.ok) {
    throw new Error(`Chess.com API error (${res.status}).`);
  }

  const data = (await res.json()) as { archives?: string[] };
  return (data.archives ?? []).reverse();
}

export async function fetchMonthGames(
  archiveUrl: string,
): Promise<ChessComArchiveGame[]> {
  const res = await fetch(archiveUrl, { next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error(`Could not load games from archive (${res.status}).`);
  }

  const data = (await res.json()) as { games?: ChessComArchiveGame[] };
  return data.games ?? [];
}

export function extractGameIdFromUrl(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1] ?? url;
}
