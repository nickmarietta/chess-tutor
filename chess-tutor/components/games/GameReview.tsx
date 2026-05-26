"use client";

import { useCallback, useMemo, useState } from "react";
import { AnalysisBoard } from "@/components/board/AnalysisBoard";
import { AnalysisLineMoves } from "@/components/board/AnalysisLineMoves";
import { MoveList } from "@/components/board/MoveList";
import { VariationPreview } from "@/components/board/VariationPreview";
import { CoachChatLog } from "@/components/coach/CoachChatLog";
import { ExplainMovePanel } from "@/components/coach/ExplainMovePanel";
import { ReflectionPanel } from "@/components/coach/ReflectionPanel";
import { UserColorBadge } from "@/components/games/UserColorBadge";
import { useAnalysisSession } from "@/hooks/useAnalysisSession";
import { formatMoveContext } from "@/components/coach/CoachChatLog";
import { getMockEngineContext } from "@/lib/engine/mockEngine";
import type { ChatEntry } from "@/types/coach";
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
): ChatEntry[] {
  const byId = new Map(positions.map((p) => [p.id, p]));
  const entries: ChatEntry[] = [];
  for (const r of reflections) {
    const pos = byId.get(r.position_id);
    if (!pos) continue;
    entries.push({
      ...r,
      ply: pos.ply,
      moveSan: pos.move_san,
      label: formatMoveContext(pos.ply, pos.move_san),
      isAnalysis: false,
      anchorPly: pos.ply,
      lineCursor: 0,
    });
  }
  return entries;
}

export function GameReview({ game, positions, reflections }: GameReviewProps) {
  const [gameState, setGameState] = useState(game);
  const [chatEntries, setChatEntries] = useState<ChatEntry[]>(() =>
    enrichReflections(reflections, positions),
  );
  const [explainResult, setExplainResult] = useState<ExplainResponse | null>(
    null,
  );
  const [variationPreviewIndex, setVariationPreviewIndex] = useState(-1);

  const {
    anchorPly,
    viewState,
    goToGamePly,
    makeMove,
    stepBack,
    stepForward,
    resetToGame,
    goToLineIndex,
    restoreSnapshot,
  } = useAnalysisSession(positions);

  const coachContext = useMemo(
    () => ({ game: gameState, view: viewState }),
    [gameState, viewState],
  );

  const pliesWithReflections = useMemo(
    () => new Set(chatEntries.filter((e) => !e.isAnalysis).map((e) => e.ply)),
    [chatEntries],
  );

  const boardOrientation = gameState.user_color ?? "white";

  const mockEngine = useMemo(() => {
    return getMockEngineContext(
      positions,
      viewState.ply,
      viewState.fenBefore,
    );
  }, [positions, viewState.ply, viewState.fenBefore]);

  const boardFen = useMemo(() => {
    if (
      variationPreviewIndex >= 0 &&
      explainResult?.variation[variationPreviewIndex]
    ) {
      return explainResult.variation[variationPreviewIndex].fenAfter;
    }
    return viewState.fen;
  }, [variationPreviewIndex, explainResult, viewState.fen]);

  const boardAnnotations =
    explainResult && variationPreviewIndex === -1
      ? {
          highlights: explainResult.highlights,
          arrows: explainResult.arrows,
        }
      : null;

  const clearBoardExtras = useCallback(() => {
    setExplainResult(null);
    setVariationPreviewIndex(-1);
  }, []);

  const handleSelectGamePly = useCallback(
    (ply: number) => {
      goToGamePly(ply);
      clearBoardExtras();
    },
    [goToGamePly, clearBoardExtras],
  );

  const handleBoardMove = useCallback(
    (from: string, to: string) => {
      const ok = makeMove(from, to);
      if (ok) clearBoardExtras();
      return ok;
    },
    [makeMove, clearBoardExtras],
  );

  const handleEntryAdded = useCallback((entry: ChatEntry) => {
    setChatEntries((prev) => [...prev, entry]);
  }, []);

  const handleSelectChatEntry = useCallback(
    (entry: ChatEntry) => {
      if (entry.anchorPly !== undefined) {
        restoreSnapshot(
          entry.anchorPly,
          entry.lineCursor ?? 0,
          entry.analysisMoves ?? [],
        );
        clearBoardExtras();
      }
    },
    [restoreSnapshot, clearBoardExtras],
  );

  const handleExplainResult = useCallback((result: ExplainResponse) => {
    setExplainResult(result);
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

  const showAnalysisLine =
    viewState.isAnalysis || viewState.line.nodes.length > 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
      <div className="flex flex-col gap-4 lg:sticky lg:top-6">
        <AnalysisBoard
          fen={boardFen}
          orientation={boardOrientation}
          annotations={boardAnnotations}
          interactive
          onMove={handleBoardMove}
        />

        <p className="text-xs text-stone-500">
          Drag pieces to try moves · analysis mode
        </p>

        {showAnalysisLine && (
          <AnalysisLineMoves
            line={viewState.line}
            onSelectIndex={goToLineIndex}
          />
        )}

        {explainResult && explainResult.variation.length > 0 && (
          <VariationPreview
            variation={explainResult.variation}
            previewIndex={variationPreviewIndex}
            onPreviewIndexChange={setVariationPreviewIndex}
          />
        )}

        <p className="text-sm text-stone-600">
          {viewState.label}
          {viewState.isAnalysis && (
            <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
              Analysis
            </span>
          )}
        </p>

        <ExplainMovePanel
          coachContext={coachContext}
          onExplainResult={handleExplainResult}
          onClear={clearBoardExtras}
          hasAnnotations={!!explainResult}
          engineBestMove={mockEngine?.bestMoveSan ?? null}
        />

        <div className="flex flex-wrap gap-2">
          <NavButton
            label="← Back"
            disabled={!viewState.canStepBack}
            onClick={() => {
              stepBack();
              clearBoardExtras();
            }}
          />
          <NavButton
            label="Forward →"
            disabled={!viewState.canStepForward}
            onClick={() => {
              stepForward();
              clearBoardExtras();
            }}
          />
          {showAnalysisLine && (
            <NavButton
              label="Back to game"
              disabled={false}
              onClick={() => {
                resetToGame();
                clearBoardExtras();
              }}
            />
          )}
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
          selectedPly={anchorPly}
          onSelectPly={handleSelectGamePly}
          highlightedPlies={pliesWithReflections}
        />
      </div>

      <div className="flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm lg:sticky lg:top-6">
        <CoachChatLog
          entries={chatEntries}
          activeLabel={viewState.label}
          onSelectEntry={handleSelectChatEntry}
        />
        <ReflectionPanel
          coachContext={coachContext}
          onEntryAdded={handleEntryAdded}
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
