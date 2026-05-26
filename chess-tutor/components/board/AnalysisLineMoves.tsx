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
    <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
      <p className="text-xs font-medium text-violet-800">Your analysis line</p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onSelectIndex(0)}
          className={`rounded px-2 py-0.5 font-mono text-xs ${
            line.cursor === 0
              ? "bg-violet-300 text-violet-950"
              : "bg-white text-violet-800 hover:bg-violet-100"
          }`}
        >
          •
        </button>
        {moves.map((san, i) => (
          <button
            key={`${san}-${i}`}
            type="button"
            onClick={() => onSelectIndex(i + 1)}
            className={`rounded px-2 py-0.5 font-mono text-xs ${
              line.cursor === i + 1
                ? "bg-violet-300 text-violet-950"
                : "bg-white text-violet-800 hover:bg-violet-100"
            }`}
          >
            {san}
          </button>
        ))}
      </div>
    </div>
  );
}
