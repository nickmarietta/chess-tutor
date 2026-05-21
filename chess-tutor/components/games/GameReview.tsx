"use client";

import { useMemo, useState } from "react";
import { AnalysisBoard } from "@/components/board/AnalysisBoard";
import { MoveList } from "@/components/board/MoveList";
import { ReflectionPanel } from "@/components/coach/ReflectionPanel";
import type { Game, Position, Reflection } from "@/types";

type GameReviewProps = {
  game: Game;
  positions: Position[];
  reflections: Reflection[];
};

export function GameReview({ game, positions, reflections }: GameReviewProps) {
  const [selectedPly, setSelectedPly] = useState(0);

  const currentPosition = useMemo(
    () => positions.find((p) => p.ply === selectedPly) ?? positions[0],
    [positions, selectedPly],
  );

  const reflectionForPosition = useMemo(
    () =>
      reflections.find((r) => r.position_id === currentPosition?.id) ??
      undefined,
    [reflections, currentPosition],
  );

  if (!currentPosition) {
    return <p className="text-stone-600">No positions found for this game.</p>;
  }

  const moveLabel = currentPosition.move_san
    ? `After ${currentPosition.move_san}`
    : "Starting position";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,480px)_1fr]">
      <div className="flex flex-col gap-4">
        <AnalysisBoard fen={currentPosition.fen} />
        <p className="text-sm text-stone-500">
          Ply {currentPosition.ply} · {moveLabel}
        </p>
        <div className="flex gap-2">
          <NavButton
            label="← Prev"
            disabled={selectedPly <= 0}
            onClick={() => setSelectedPly((p) => Math.max(0, p - 1))}
          />
          <NavButton
            label="Next →"
            disabled={selectedPly >= positions.length - 1}
            onClick={() =>
              setSelectedPly((p) => Math.min(positions.length - 1, p + 1))
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            {game.white_player ?? "White"} vs {game.black_player ?? "Black"}
          </h2>
          <p className="text-sm text-stone-500">
            {game.result ?? "—"} · {game.source === "chess_com" ? "Chess.com" : "PGN import"}
          </p>
        </div>

        <MoveList
          positions={positions}
          selectedPly={selectedPly}
          onSelectPly={setSelectedPly}
        />

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-stone-900">
            Reflect on this position
          </h3>
          <ReflectionPanel
            key={currentPosition.id}
            game={game}
            position={currentPosition}
            existingReflection={reflectionForPosition}
          />
        </div>
      </div>
    </div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40"
    >
      {label}
    </button>
  );
}
