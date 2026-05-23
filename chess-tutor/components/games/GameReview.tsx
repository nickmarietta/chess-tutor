"use client";

import { useCallback, useMemo, useState } from "react";
import { AnalysisBoard } from "@/components/board/AnalysisBoard";
import { MoveList } from "@/components/board/MoveList";
import { VariationPreview } from "@/components/board/VariationPreview";
import {
  CoachChatLog,
  type ReflectionEntry,
} from "@/components/coach/CoachChatLog";
import { ExplainMovePanel } from "@/components/coach/ExplainMovePanel";
import { ReflectionPanel } from "@/components/coach/ReflectionPanel";
import { UserColorBadge } from "@/components/games/UserColorBadge";
import { getMockEngineContext } from "@/lib/engine/mockEngine";
import type { ExplainResponse } from "@/types/annotations";
import type { Game, Position, Reflection, UserColor } from "@/types";

type GameReviewProps = {
  game: Game;
  positions: Position[];
  reflections: Reflection[];
};

function enrichReflections(
  reflections: Reflection[],
  positions: Position[],
): ReflectionEntry[] {
  const byId = new Map(positions.map((p) => [p.id, p]));
  return reflections
    .map((r) => {
      const pos = byId.get(r.position_id);
      if (!pos) return null;
      return { ...r, ply: pos.ply, moveSan: pos.move_san };
    })
    .filter((r): r is ReflectionEntry => r !== null);
}

export function GameReview({ game, positions, reflections }: GameReviewProps) {
  const [selectedPly, setSelectedPly] = useState(0);
  const [gameState, setGameState] = useState(game);
  const [chatEntries, setChatEntries] = useState<ReflectionEntry[]>(() =>
    enrichReflections(reflections, positions),
  );
  const [explainResult, setExplainResult] = useState<ExplainResponse | null>(
    null,
  );
  const [variationPreviewIndex, setVariationPreviewIndex] = useState(-1);

  const currentPosition = useMemo(
    () => positions.find((p) => p.ply === selectedPly) ?? positions[0],
    [positions, selectedPly],
  );

  const parentPosition = useMemo(
    () =>
      currentPosition && currentPosition.ply > 0
        ? positions.find((p) => p.ply === currentPosition.ply - 1)
        : null,
    [positions, currentPosition],
  );

  const pliesWithReflections = useMemo(
    () => new Set(chatEntries.map((e) => e.ply)),
    [chatEntries],
  );

  const boardOrientation = gameState.user_color ?? "white";

  const mockEngine = useMemo(() => {
    if (!currentPosition) return null;
    return getMockEngineContext(
      positions,
      currentPosition.ply,
      parentPosition?.fen ?? null,
    );
  }, [positions, currentPosition, parentPosition]);

  const boardFen = useMemo(() => {
    if (
      variationPreviewIndex >= 0 &&
      explainResult?.variation[variationPreviewIndex]
    ) {
      return explainResult.variation[variationPreviewIndex].fenAfter;
    }
    return currentPosition?.fen ?? "";
  }, [variationPreviewIndex, explainResult, currentPosition]);

  const boardAnnotations =
    explainResult && variationPreviewIndex === -1
      ? {
          highlights: explainResult.highlights,
          arrows: explainResult.arrows,
        }
      : null;

  const handleReflectionAdded = useCallback(
    (reflection: Reflection) => {
      if (!currentPosition) return;
      setChatEntries((prev) => [
        ...prev,
        {
          ...reflection,
          ply: currentPosition.ply,
          moveSan: currentPosition.move_san,
        },
      ]);
    },
    [currentPosition],
  );

  const handleSelectPly = useCallback((ply: number) => {
    setSelectedPly(ply);
    setExplainResult(null);
    setVariationPreviewIndex(-1);
  }, []);

  const handleExplainResult = useCallback((result: ExplainResponse) => {
    setExplainResult(result);
    setVariationPreviewIndex(-1);
  }, []);

  const handleClearAnnotations = useCallback(() => {
    setExplainResult(null);
    setVariationPreviewIndex(-1);
  }, []);

  async function handleColorSet(color: UserColor) {
    const res = await fetch(`/api/games/${gameState.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userColor: color }),
    });
    const data = await res.json();
    if (res.ok && data.game) {
      setGameState(data.game);
    }
  }

  if (!currentPosition) {
    return <p className="text-stone-600">No positions found for this game.</p>;
  }

  const moveLabel = currentPosition.move_san
    ? `After ${currentPosition.move_san}`
    : "Starting position";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
      <div className="flex flex-col gap-4 lg:sticky lg:top-6">
        <AnalysisBoard
          fen={boardFen}
          orientation={boardOrientation}
          annotations={boardAnnotations}
        />

        {explainResult && explainResult.variation.length > 0 && (
          <VariationPreview
            variation={explainResult.variation}
            previewIndex={variationPreviewIndex}
            onPreviewIndexChange={setVariationPreviewIndex}
          />
        )}

        <p className="text-sm text-stone-500">
          Ply {currentPosition.ply} · {moveLabel}
        </p>

        <ExplainMovePanel
          game={gameState}
          position={currentPosition}
          onExplainResult={handleExplainResult}
          onClear={handleClearAnnotations}
          hasAnnotations={!!explainResult}
          engineBestMove={mockEngine?.bestMoveSan ?? null}
        />

        <div className="flex gap-2">
          <NavButton
            label="← Prev"
            disabled={selectedPly <= 0}
            onClick={() => handleSelectPly(Math.max(0, selectedPly - 1))}
          />
          <NavButton
            label="Next →"
            disabled={selectedPly >= positions.length - 1}
            onClick={() =>
              handleSelectPly(
                Math.min(positions.length - 1, selectedPly + 1),
              )
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-stone-900">
              {gameState.white_player ?? "White"} vs{" "}
              {gameState.black_player ?? "Black"}
            </h2>
            <UserColorBadge game={gameState} onColorSet={handleColorSet} />
          </div>
          <p className="mt-1 text-sm text-stone-500">
            {gameState.result ?? "—"} ·{" "}
            {gameState.source === "chess_com" ? "Chess.com" : "PGN import"}
          </p>
        </div>

        <MoveList
          positions={positions}
          selectedPly={selectedPly}
          onSelectPly={handleSelectPly}
          highlightedPlies={pliesWithReflections}
        />
      </div>

      <div className="flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm lg:sticky lg:top-6">
        <CoachChatLog
          entries={chatEntries}
          selectedPly={selectedPly}
          onSelectPly={handleSelectPly}
        />
        <ReflectionPanel
          game={gameState}
          position={currentPosition}
          onReflectionAdded={handleReflectionAdded}
        />
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
