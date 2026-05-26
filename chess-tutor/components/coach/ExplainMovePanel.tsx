"use client";

import { useState } from "react";
import {
  buildExplainPayload,
  type CoachPositionContext,
} from "@/types/coach";
import type { ExplainResponse } from "@/types/annotations";

type ExplainMovePanelProps = {
  coachContext: CoachPositionContext;
  onExplainResult: (result: ExplainResponse) => void;
  onClear: () => void;
  hasAnnotations: boolean;
  engineBestMove: string | null;
};

export function ExplainMovePanel({
  coachContext,
  onExplainResult,
  onClear,
  hasAnnotations,
  engineBestMove,
}: ExplainMovePanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);

  const { view } = coachContext;
  const canExplainMove = !!view.moveSan;

  async function requestExplain(explainBestMove: boolean) {
    setLoading(true);
    setError(null);

    try {
      const payload = buildExplainPayload(coachContext, explainBestMove);
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        <p className="text-xs text-stone-500">{view.label}</p>
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

        {engineBestMove && engineBestMove !== view.moveSan && (
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

      {engineBestMove && (
        <p className="text-xs text-stone-500">
          Idea to try (mock):{" "}
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
