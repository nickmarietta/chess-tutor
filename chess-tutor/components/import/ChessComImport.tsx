"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChessComArchiveGame } from "@/types";
import { extractGameIdFromUrl } from "@/lib/chesscom/api";

export function ChessComImport() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [archives, setArchives] = useState<string[]>([]);
  const [selectedArchive, setSelectedArchive] = useState("");
  const [games, setGames] = useState<ChessComArchiveGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadArchives(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setArchives([]);
    setGames([]);
    setSelectedArchive("");

    try {
      const res = await fetch(
        `/api/chesscom/archives?username=${encodeURIComponent(username.trim())}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load archives.");
      setArchives(data.archives ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load archives.");
    } finally {
      setLoading(false);
    }
  }

  async function loadGames(archiveUrl: string) {
    setSelectedArchive(archiveUrl);
    setLoading(true);
    setError(null);
    setGames([]);

    try {
      const res = await fetch(
        `/api/chesscom/games?archiveUrl=${encodeURIComponent(archiveUrl)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load games.");
      setGames((data.games ?? []).reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load games.");
    } finally {
      setLoading(false);
    }
  }

  async function importGame(game: ChessComArchiveGame) {
    setImportingId(game.url);
    setError(null);

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pgn: game.pgn,
          source: "chess_com",
          sourceGameId: extractGameIdFromUrl(game.url),
          playerUsername: username.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed.");

      router.push(`/games/${data.game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImportingId(null);
    }
  }

  function formatArchiveLabel(url: string) {
    const match = url.match(/(\d{4})\/(\d{2})$/);
    if (!match) return url;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[Number(match[2]) - 1]} ${match[1]}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={loadArchives} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="username" className="text-sm font-medium text-stone-700">
            Chess.com username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. hikaru"
            className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-60"
        >
          {loading && !selectedArchive ? "Loading…" : "Find games"}
        </button>
      </form>

      {archives.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">Recent months</p>
          <div className="flex flex-wrap gap-2">
            {archives.slice(0, 12).map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => loadGames(url)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  selectedArchive === url
                    ? "bg-amber-100 font-medium text-amber-900"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {formatArchiveLabel(url)}
              </button>
            ))}
          </div>
        </div>
      )}

      {games.length > 0 && (
        <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
          {games.map((game) => (
            <li
              key={game.url}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="text-sm">
                <span className="font-medium text-stone-900">
                  {game.white.username} vs {game.black.username}
                </span>
                <span className="ml-2 text-stone-500">{game.result}</span>
                {game.time_control && (
                  <span className="ml-2 text-stone-400">{game.time_control}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => importGame(game)}
                disabled={importingId === game.url}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {importingId === game.url ? "Importing…" : "Import"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
