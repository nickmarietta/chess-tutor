"use client";

import { useState } from "react";
import { formatMoveContext } from "@/components/coach/CoachChatLog";
import type { ExplainResponse } from "@/types/annotations";
import type { Game, HelpMode, Position } from "@/types";

type ExplainMovePanelProps = {
  game: Game;
  position: Position;
  onExplainResult: (result: ExplainResponse) => void;
  onClear: () => void;
  hasAnnotations: boolean;
  engineBestMove: string | null;
};

export function ExplainMovePanel({
  game,
  position,
  onExplainResult,
  onClear,
  hasAnnotations,
  engineBestMove,
}: ExplainMovePanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);

  const moveLabel = formatMoveContext(position.ply, position.move_san);
  const canExplainMove = position.ply > 0 && position.move_san;

  async function requestExplain(explainBestMove: boolean) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          positionId: position.id,
          ply: position.ply,
          selectedMoveSan: position.move_san,
          explainBestMove,
          helpMode: "guide" as HelpMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Explain request failed.");

      onExplainResult(data as ExplainResponse);
      setLastExplanation(data.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold text-stone-900">Explain move</h3>
        <p className="text-xs text-stone-500">{moveLabel}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || !canExplainMove}
          onClick={() => requestExplain(false)}
          className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {loading ? "Explaining…" : "Explain this move"}
        </button>

        {engineBestMove &&
          engineBestMove !== position.move_san &&
          position.ply > 0 && (
            <button
              type="button"
              disabled={loading}
              onClick={() => requestExplain(true)}
              className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-900 hover:bg-green-100 disabled:opacity-50"
            >
              Explain {engineBestMove}
            </button>
          )}

        {hasAnnotations && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setLastExplanation(null);
            }}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
          >
            Clear annotations
          </button>
        )}
      </div>

      {engineBestMove && position.ply > 0 && (
        <p className="text-xs text-stone-500">
          Suggested line (mock):{" "}
          <span className="font-mono font-medium text-stone-700">
            {engineBestMove}
          </span>
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {lastExplanation && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
          {lastExplanation}
        </p>
      )}
    </div>
  );
}
