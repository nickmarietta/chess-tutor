"use client";

import { useCallback, useMemo, useState } from "react";
import { AnalysisLineMoves } from "@/components/board/AnalysisLineMoves";
import { ChessBoardWithEval } from "@/components/board/ChessBoardWithEval";
import { MoveList } from "@/components/board/MoveList";
import { EngineMovesPanel } from "@/components/games/EngineMovesPanel";
import { UserColorBadge } from "@/components/games/UserColorBadge";
import {
  displayableEval,
  useLiveEngineEval,
} from "@/hooks/useLiveEngineEval";
import { useAnalysisSession } from "@/hooks/useAnalysisSession";
import type { Game, MoveAnalysis, Position, UserColor } from "@/types";

type GameReviewProps = {
  game: Game;
  positions: Position[];
  analyses: MoveAnalysis[];
};

export function GameReview({ game, positions, analyses }: GameReviewProps) {
  const [gameState, setGameState] = useState(game);

  const {
    anchorPly,
    viewState,
    analysisMode,
    goToGamePly,
    enterAnalysisMode,
    exitAnalysisMode,
    makeMove,
    stepBack,
    stepForward,
    resetToGame,
    goToLineIndex,
  } = useAnalysisSession(positions);

  const boardOrientation = gameState.user_color ?? "white";
  const analysisByPositionId = useMemo(
    () => new Map(analyses.map((a) => [a.position_id, a])),
    [analyses],
  );
  const selectedAnalysis =
    (viewState.anchorPosition
      ? analysisByPositionId.get(viewState.anchorPosition.id)
      : undefined) ?? null;

  const board = viewState.board;
  const liveEngineEval = useLiveEngineEval(board);
  const barEval = displayableEval(board, liveEngineEval);

  const handleSelectPly = useCallback(
    (ply: number) => {
      if (analysisMode) exitAnalysisMode();
      goToGamePly(ply);
    },
    [analysisMode, exitAnalysisMode, goToGamePly],
  );

  const handleBoardMove = useCallback(
    (from: string, to: string) => makeMove(from, to),
    [makeMove],
  );

  async function handleColorSet(color: UserColor) {
    const res = await fetch(`/api/games/${gameState.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userColor: color }),
    });
    const data = await res.json();
    if (res.ok && data.game) setGameState(data.game);
  }

  function toggleAnalysisMode() {
    if (analysisMode) {
      exitAnalysisMode();
    } else {
      enterAnalysisMode();
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-base font-medium text-[var(--text)]">
            {gameState.white_player ?? "White"} vs{" "}
            {gameState.black_player ?? "Black"}
          </h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            {gameState.result ?? "—"}
          </p>
        </div>
        <UserColorBadge game={gameState} onColorSet={handleColorSet} />
      </header>

      <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col gap-5 overflow-y-auto border-b border-[var(--border)] p-4 lg:border-b-0 lg:border-r">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--text-subtle)]">
              Moves
            </h2>
            <div className="mt-3">
              <MoveList
                positions={positions}
                analyses={analyses}
                selectedPly={anchorPly}
                onSelectPly={handleSelectPly}
                showMistakes
              />
            </div>
          </div>
          <EngineMovesPanel
            analysis={selectedAnalysis}
            analyses={analyses}
            userColor={gameState.user_color}
          />
        </aside>

        <section className="flex min-h-0 flex-col items-center gap-5 overflow-y-auto p-6 lg:p-10">
          <ChessBoardWithEval
            fen={board.fen}
            orientation={boardOrientation}
            interactive={analysisMode}
            onMove={handleBoardMove}
            evalWhite={barEval.evalWhite}
            scoreType={barEval.scoreType}
            evalStatus={barEval.status}
          />

          <p className="text-sm text-[var(--text-muted)]">{viewState.label}</p>

          {analysisMode && viewState.line.nodes.length > 1 && (
            <AnalysisLineMoves
              line={viewState.line}
              onSelectIndex={goToLineIndex}
            />
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <NavButton
              label="←"
              disabled={!viewState.canStepBack}
              onClick={stepBack}
            />
            <NavButton
              label="→"
              disabled={!viewState.canStepForward}
              onClick={stepForward}
            />
            {analysisMode && (
              <button
                type="button"
                onClick={resetToGame}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
              >
                Reset line
              </button>
            )}
            <button
              type="button"
              onClick={toggleAnalysisMode}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-hover)]"
            >
              {analysisMode ? "Exit analysis" : "Analyze position"}
            </button>
          </div>
        </section>
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
      className="min-w-[3rem] rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-hover)] disabled:opacity-30"
    >
      {label}
    </button>
  );
}
