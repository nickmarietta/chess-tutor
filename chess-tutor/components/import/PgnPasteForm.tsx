"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlayerUsernameField } from "./PlayerUsernameField";

export function PgnPasteForm() {
  const router = useRouter();
  const [pgn, setPgn] = useState("");
  const [playerUsername, setPlayerUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pgn,
          source: "pgn_paste",
          playerUsername: playerUsername.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed.");

      router.push(`/games/${data.game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PlayerUsernameField
        id="pgn-username"
        value={playerUsername}
        onChange={setPlayerUsername}
        hint="Must match the White or Black name in the PGN headers."
      />
      <div>
        <label htmlFor="pgn" className="text-sm font-medium text-[var(--text)]">
          Paste PGN
        </label>
        <textarea
          id="pgn"
          rows={12}
          value={pgn}
          onChange={(e) => setPgn(e.target.value)}
          placeholder="[Event &quot;?&quot;]&#10;[White &quot;You&quot;]&#10;[Black &quot;Opponent&quot;]&#10;…&#10;1. e4 e5 2. Nf3 …"
          className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)]"
        />
      </div>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !pgn.trim()}
        className="self-start rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Parsing game…" : "Import and review"}
      </button>
    </form>
  );
}
