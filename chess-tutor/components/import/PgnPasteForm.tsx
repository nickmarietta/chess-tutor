"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PgnPasteForm() {
  const router = useRouter();
  const [pgn, setPgn] = useState("");
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
        body: JSON.stringify({ pgn, source: "pgn_paste" }),
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
      <div>
        <label htmlFor="pgn" className="text-sm font-medium text-stone-700">
          Paste PGN
        </label>
        <textarea
          id="pgn"
          rows={12}
          value={pgn}
          onChange={(e) => setPgn(e.target.value)}
          placeholder="[Event &quot;?&quot;]&#10;[White &quot;You&quot;]&#10;[Black &quot;Opponent&quot;]&#10;…&#10;1. e4 e5 2. Nf3 …"
          className="mt-2 w-full resize-y rounded-xl border border-stone-200 bg-white px-3 py-2 font-mono text-sm text-stone-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !pgn.trim()}
        className="self-start rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
      >
        {loading ? "Parsing game…" : "Import and review"}
      </button>
    </form>
  );
}
