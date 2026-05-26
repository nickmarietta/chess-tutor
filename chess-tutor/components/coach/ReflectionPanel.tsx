"use client";

import { useState } from "react";
import { HelpModeSelector } from "./HelpModeSelector";
import { allAnalysisMovesSan } from "@/lib/chess/analysisLine";
import {
  buildCoachPayload,
  type ChatEntry,
  type CoachPositionContext,
} from "@/types/coach";
import type { HelpMode, Reflection } from "@/types";

type ReflectionPanelProps = {
  coachContext: CoachPositionContext;
  onEntryAdded: (entry: ChatEntry) => void;
};

export function ReflectionPanel({
  coachContext,
  onEntryAdded,
}: ReflectionPanelProps) {
  const [userText, setUserText] = useState("");
  const [helpMode, setHelpMode] = useState<HelpMode>("guide");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { view } = coachContext;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = buildCoachPayload(coachContext, userText, helpMode);
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Coaching request failed.");

      const reflection = data.reflection as Reflection | null;
      const analysisMoves = allAnalysisMovesSan(view.line);
      const entry: ChatEntry = reflection
        ? {
            ...reflection,
            ply: view.ply,
            moveSan: view.moveSan,
            label: view.label,
            isAnalysis: view.isAnalysis,
            anchorPly: view.line.anchorPly,
            lineCursor: view.line.cursor,
            analysisMoves: view.isAnalysis ? analysisMoves : undefined,
          }
        : {
            id: `local-${Date.now()}`,
            game_id: coachContext.game.id,
            position_id: null,
            user_text: userText.trim(),
            help_mode: helpMode,
            coach_response: data.coachResponse,
            created_at: new Date().toISOString(),
            ply: view.ply,
            moveSan: view.moveSan,
            label: view.label,
            isAnalysis: view.isAnalysis,
            anchorPly: view.line.anchorPly,
            lineCursor: view.line.cursor,
            analysisMoves: view.isAnalysis ? analysisMoves : undefined,
          };

      onEntryAdded(entry);
      setUserText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border-t border-stone-200 bg-white p-4"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Ask your coach
        </p>
        <p className="mt-0.5 text-sm font-medium text-stone-800">{view.label}</p>
        {view.isAnalysis && (
          <p className="mt-0.5 text-xs text-violet-600">Analysis mode</p>
        )}
      </div>

      <div>
        <label htmlFor="reflection" className="sr-only">
          Ask about this position
        </label>
        <textarea
          id="reflection"
          rows={3}
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="What do you think about this position? Ask about a move or plan…"
          className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <HelpModeSelector value={helpMode} onChange={setHelpMode} />

      <button
        type="submit"
        disabled={loading || !userText.trim()}
        className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
      >
        {loading ? "Coach is thinking…" : "Ask coach"}
      </button>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
