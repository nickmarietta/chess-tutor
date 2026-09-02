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

  async function loadArchives(e: React.SubmitEvent<HTMLFormElement>) {
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
    if (!game.pgn) {
      setError("This game has no PGN data and cannot be imported.");
      return;
    }

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
          <label htmlFor="username" className="text-sm font-medium text-[var(--text)]">
            Chess.com username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. hikaru"
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-hover)] disabled:opacity-60"
        >
          {loading && !selectedArchive ? "Loading…" : "Find games"}
        </button>
      </form>

      {archives.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--text)]">Recent months</p>
          <div className="flex flex-wrap gap-2">
            {archives.slice(0, 12).map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => loadGames(url)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  selectedArchive === url
                    ? "bg-[var(--accent-muted)] font-medium text-[var(--accent)]"
                    : "bg-[var(--surface-raised)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {formatArchiveLabel(url)}
              </button>
            ))}
          </div>
        </div>
      )}

      {games.length > 0 && (
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {games.map((game) => (
            <li
              key={game.url}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="text-sm">
                <span className="font-medium text-[var(--text)]">
                  {game.white.username} vs {game.black.username}
                </span>
                <span className="ml-2 text-[var(--text-muted)]">
                  {game.white.result === "win" ? "1-0" : game.black.result === "win" ? "0-1" : game.white.result ? "½-½" : null}
                </span>
                {game.time_control && (
                  <span className="ml-2 text-[var(--text-subtle)]">{game.time_control}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => importGame(game)}
                disabled={importingId === game.url}
                className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-fg)] transition hover:opacity-90 disabled:opacity-60"
              >
                {importingId === game.url ? "Importing…" : "Import"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>
      )}
    </div>
  );
}
