"use client";

import type { MoveAnalysis, Position } from "@/types";

type MoveListProps = {
  positions: Position[];
  analyses?: MoveAnalysis[];
  selectedPly: number;
  onSelectPly: (ply: number) => void;
  showMistakes?: boolean;
};

const QUALITY: Record<
  "inaccuracy" | "mistake" | "blunder",
  { sym: string; color: string; bg: string; label: string }
> = {
  inaccuracy: { sym: "?!", color: "#fbbf24", bg: "rgba(251,191,36,0.15)", label: "Inaccuracy" },
  mistake: { sym: "?", color: "#fb923c", bg: "rgba(251,146,60,0.15)", label: "Mistake" },
  blunder: { sym: "??", color: "#f87171", bg: "rgba(248,113,113,0.15)", label: "Blunder" },
};

function QualityBadge({ severity }: { severity: MoveAnalysis["mistake_severity"] }) {
  if (severity === "none") return null;
  const q = QUALITY[severity];
  return (
    <span
      className="inline-flex shrink-0 items-center rounded px-[5px] py-[1px] font-mono text-[0.58rem] font-bold leading-relaxed tracking-wide"
      style={{ color: q.color, backgroundColor: q.bg }}
    >
      {q.sym}
    </span>
  );
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
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => onSelectPly(0)}
        className={`rounded-md px-3 py-1.5 text-left text-sm transition ${
          selectedPly === 0
            ? "bg-[var(--accent-muted)] font-semibold text-[var(--accent)]"
            : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
        }`}
      >
        ▷ Start
      </button>

      <div className="grid grid-cols-[24px_1fr_1fr] px-2 pb-0.5 text-[0.6rem] uppercase tracking-wider text-[var(--text-subtle)]">
        <span>#</span>
        <span>White</span>
        <span>Black</span>
      </div>

      <div className="max-h-[min(32rem,calc(100vh-14rem))] overflow-y-auto">
        <div className="flex flex-col gap-px">
          {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => {
            const moveNumber = i + 1;
            const white = moves[i * 2];
            const black = moves[i * 2 + 1];
            const rowSelected =
              (white && selectedPly === white.ply) || (black && selectedPly === black.ply);

            return (
              <div
                key={moveNumber}
                className="grid grid-cols-[24px_1fr_1fr] items-center rounded-md"
                style={{
                  backgroundColor: rowSelected
                    ? "var(--accent-muted)"
                    : i % 2 === 1
                      ? "var(--border-soft)"
                      : "transparent",
                }}
              >
                <span className="py-1 pl-2 font-mono text-[0.7rem] text-[var(--text-subtle)]">
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

      {showMistakes && (
        <div className="mt-3 border-t border-[var(--border)] pt-3">
          <div className="mb-2 text-[0.6rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Legend
          </div>
          <div className="flex flex-col gap-1.5">
            {(["blunder", "mistake", "inaccuracy"] as const).map((severity) => {
              const q = QUALITY[severity];
              return (
                <div key={severity} className="flex items-center gap-2">
                  <span
                    className="w-5 font-mono text-[0.62rem] font-bold"
                    style={{ color: q.color }}
                  >
                    {q.sym}
                  </span>
                  <span className="text-[0.7rem] text-[var(--text-muted)]">{q.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
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

  return (
    <button
      type="button"
      onClick={() => onSelect(ply)}
      className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 font-mono text-[0.78rem] transition ${
        selected ? "font-semibold text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
      }`}
    >
      <span>{label}</span>
      {showMistakes && <QualityBadge severity={severity} />}
    </button>
  );
}
