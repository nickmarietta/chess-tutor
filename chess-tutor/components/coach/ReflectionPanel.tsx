"use client";

import { useState } from "react";
import { HelpModeSelector } from "./HelpModeSelector";
import { formatMoveContext } from "./CoachChatLog";
import type { Game, HelpMode, Position, Reflection } from "@/types";

type ReflectionPanelProps = {
  game: Game;
  position: Position;
  onReflectionAdded: (reflection: Reflection) => void;
};

export function ReflectionPanel({
  game,
  position,
  onReflectionAdded,
}: ReflectionPanelProps) {
  const [userText, setUserText] = useState("");
  const [helpMode, setHelpMode] = useState<HelpMode>("guide");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moveLabel = formatMoveContext(position.ply, position.move_san);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          positionId: position.id,
          userText,
          helpMode,
          fen: position.fen,
          moveSan: position.move_san,
          ply: position.ply,
          whitePlayer: game.white_player,
          blackPlayer: game.black_player,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Coaching request failed.");

      onReflectionAdded(data.reflection);
      setUserText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-stone-200 bg-white p-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Ask about this position
        </p>
        <p className="mt-0.5 font-mono text-sm font-medium text-stone-800">
          {moveLabel}
        </p>
      </div>

      <div>
        <label htmlFor="reflection" className="sr-only">
          What were you thinking here?
        </label>
        <textarea
          id="reflection"
          rows={3}
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="What were you thinking here?"
          className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <HelpModeSelector value={helpMode} onChange={setHelpMode} />

      <button
        type="submit"
        disabled={loading || !userText.trim()}
        className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
      >
        {loading ? "Coach is thinking…" : "Get coaching feedback"}
      </button>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </form>
  );
}
