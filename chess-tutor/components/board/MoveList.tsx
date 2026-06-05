"use client";

import type { MoveAnalysis, Position } from "@/types";

type MoveListProps = {
  positions: Position[];
  analyses?: MoveAnalysis[];
  selectedPly: number;
  onSelectPly: (ply: number) => void;
  showMistakes?: boolean;
};

function severityDot(severity: MoveAnalysis["mistake_severity"]) {
  if (severity === "blunder") return "bg-red-500";
  if (severity === "mistake") return "bg-orange-500";
  if (severity === "inaccuracy") return "bg-amber-500";
  return null;
}

export function MoveList({
  positions,
  analyses = [],
  selectedPly,
  onSelectPly,
  showMistakes = true,
}: MoveListProps) {
  const moves = positions.filter((p) => p.move_san);
  const analysisByPly = new Map(analyses.map((a) => [a.ply, a]));

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => onSelectPly(0)}
        className={`rounded-lg px-3 py-2 text-left text-sm transition ${
          selectedPly === 0
            ? "bg-[var(--accent-muted)] font-medium text-[var(--text)]"
            : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
        }`}
      >
        Start
      </button>
      <div className="max-h-[min(32rem,calc(100vh-14rem))] overflow-y-auto">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-sm">
          {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => {
            const moveNumber = i + 1;
            const white = moves[i * 2];
            const black = moves[i * 2 + 1];

            return (
              <div key={moveNumber} className="contents">
                <span className="py-1.5 text-[var(--text-subtle)]">
                  {moveNumber}.
                </span>
                {white ? (
                  <MoveCell
                    label={white.move_san!}
                    ply={white.ply}
                    analysis={analysisByPly.get(white.ply)}
                    selected={selectedPly === white.ply}
                    showMistakes={showMistakes}
                    onSelect={onSelectPly}
                  />
                ) : (
                  <span />
                )}
                {black ? (
                  <MoveCell
                    label={black.move_san!}
                    ply={black.ply}
                    analysis={analysisByPly.get(black.ply)}
                    selected={selectedPly === black.ply}
                    showMistakes={showMistakes}
                    onSelect={onSelectPly}
                  />
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MoveCell({
  label,
  ply,
  analysis,
  selected,
  showMistakes,
  onSelect,
}: {
  label: string;
  ply: number;
  analysis?: MoveAnalysis;
  selected: boolean;
  showMistakes: boolean;
  onSelect: (ply: number) => void;
}) {
  const severity = analysis?.mistake_severity ?? "none";
  const dot = showMistakes ? severityDot(severity) : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(ply)}
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 font-mono text-left transition ${
        selected
          ? "bg-[var(--accent-muted)] text-[var(--text)]"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />}
      <span>{label}</span>
    </button>
  );
}
