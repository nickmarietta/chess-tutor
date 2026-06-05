"use client";

import type { AnalysisLine } from "@/lib/chess/analysisLine";
import { buildAnalysisHistorySan } from "@/lib/chess/analysisLine";

type AnalysisLineMovesProps = {
  line: AnalysisLine;
  onSelectIndex: (index: number) => void;
};

export function AnalysisLineMoves({ line, onSelectIndex }: AnalysisLineMovesProps) {
  const moves = buildAnalysisHistorySan(line);
  if (moves.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] px-4 py-3">
      <p className="text-xs text-[var(--text-subtle)]">Analysis line</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onSelectIndex(0)}
          className={`rounded-lg px-2 py-1 font-mono text-xs ${
            line.cursor === 0
              ? "bg-[var(--accent-muted)] text-[var(--text)]"
              : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          •
        </button>
        {moves.map((san, i) => (
          <button
            key={`${san}-${i}`}
            type="button"
            onClick={() => onSelectIndex(i + 1)}
            className={`rounded-lg px-2 py-1 font-mono text-xs ${
              line.cursor === i + 1
                ? "bg-[var(--accent-muted)] text-[var(--text)]"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {san}
          </button>
        ))}
      </div>
    </div>
  );
}
