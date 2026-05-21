"use client";

import type { Position } from "@/types";

type MoveListProps = {
  positions: Position[];
  selectedPly: number;
  onSelectPly: (ply: number) => void;
};

export function MoveList({ positions, selectedPly, onSelectPly }: MoveListProps) {
  const moves = positions.filter((p) => p.move_san);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onSelectPly(0)}
        className={`rounded-lg px-3 py-2 text-left text-sm transition ${
          selectedPly === 0
            ? "bg-amber-100 font-medium text-amber-900"
            : "text-stone-600 hover:bg-stone-100"
        }`}
      >
        Start position
      </button>
      <div className="max-h-64 overflow-y-auto rounded-lg border border-stone-200 bg-stone-50 p-2">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-1 text-sm">
          {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => {
            const moveNumber = i + 1;
            const white = moves[i * 2];
            const black = moves[i * 2 + 1];

            return (
              <div key={moveNumber} className="contents">
                <span className="px-1 text-stone-400">{moveNumber}.</span>
                {white ? (
                  <MoveButton
                    label={white.move_san!}
                    ply={white.ply}
                    selectedPly={selectedPly}
                    onSelect={onSelectPly}
                  />
                ) : (
                  <span />
                )}
                {black ? (
                  <MoveButton
                    label={black.move_san!}
                    ply={black.ply}
                    selectedPly={selectedPly}
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

function MoveButton({
  label,
  ply,
  selectedPly,
  onSelect,
}: {
  label: string;
  ply: number;
  selectedPly: number;
  onSelect: (ply: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(ply)}
      className={`rounded px-2 py-1 text-left font-mono transition ${
        selectedPly === ply
          ? "bg-amber-200 text-amber-950"
          : "text-stone-700 hover:bg-stone-200"
      }`}
    >
      {label}
    </button>
  );
}
