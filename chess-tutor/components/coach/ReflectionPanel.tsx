"use client";

import { useState } from "react";
import { HelpModeSelector } from "./HelpModeSelector";
import type { Game, HelpMode, Position, Reflection } from "@/types";

type ReflectionPanelProps = {
  game: Game;
  position: Position;
  existingReflection?: Reflection;
};

export function ReflectionPanel({
  game,
  position,
  existingReflection,
}: ReflectionPanelProps) {
  const [userText, setUserText] = useState(existingReflection?.user_text ?? "");
  const [helpMode, setHelpMode] = useState<HelpMode>(
    existingReflection?.help_mode ?? "guide",
  );
  const [coachResponse, setCoachResponse] = useState(
    existingReflection?.coach_response ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      setCoachResponse(data.coachResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="reflection"
          className="text-sm font-medium text-stone-700"
        >
          What were you thinking here?
        </label>
        <textarea
          id="reflection"
          rows={4}
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Describe your plan, what you considered, and what worried you…"
          className="mt-2 w-full resize-y rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <HelpModeSelector value={helpMode} onChange={setHelpMode} />

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
      >
        {loading ? "Coach is thinking…" : "Get coaching feedback"}
      </button>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {coachResponse && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <h3 className="text-sm font-semibold text-stone-800">Coach</h3>
          <div className="prose prose-sm mt-2 max-w-none whitespace-pre-wrap text-stone-700">
            {coachResponse}
          </div>
        </div>
      )}
    </form>
  );
}
