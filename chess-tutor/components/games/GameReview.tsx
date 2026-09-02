"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnalysisLineMoves } from "@/components/board/AnalysisLineMoves";
import { ChessBoardWithEval } from "@/components/board/ChessBoardWithEval";
import { MoveList } from "@/components/board/MoveList";
import { EngineMovesPanel } from "@/components/games/EngineMovesPanel";
import { PlayerStrip, resultForColor } from "@/components/games/PlayerStrip";
import { TutorExplain } from "@/components/games/TutorExplain";
import { UserColorBadge } from "@/components/games/UserColorBadge";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  displayableEval,
  useLiveEngineEval,
} from "@/hooks/useLiveEngineEval";
import { useAnalysisSession } from "@/hooks/useAnalysisSession";
import { splitUci } from "@/lib/chess/uci";
import { countMistakes } from "@/lib/analysis/mistakeCounts";
import { buildBoardAnnotations } from "@/lib/tutor/boardAnnotations";
import { buildEngineBrief } from "@/lib/tutor/engineBrief";
import type { Game, MoveAnalysis, Position, UserColor } from "@/types";
import type { BoardAnnotations } from "@/types/annotations";

type GameReviewProps = {
  game: Game;
  positions: Position[];
  analyses: MoveAnalysis[];
};

export function GameReview({ game, positions, analyses }: GameReviewProps) {
  const [gameState, setGameState] = useState(game);
  const { boardTheme } = useTheme();

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

  const [showSuggestions, setShowSuggestions] = useState(false);

  const mistakeCounts = useMemo(() => countMistakes(analyses), [analyses]);
  const lastPly = positions[positions.length - 1]?.ply ?? 0;
  const moveCount = positions.filter((p) => p.move_san).length;

  const suggestionAnnotations = useMemo((): BoardAnnotations | null => {
    if (!showSuggestions) return null;
    const arrows: BoardAnnotations["arrows"] = [];

    if (analysisMode) {
      // Use live engine best move — only when eval is confirmed for the current FEN.
      if (liveEngineEval.status !== "ready" || !liveEngineEval.bestMoveUci) return null;
      const bestUci = liveEngineEval.bestMoveUci;
      if (bestUci.length >= 4) {
        const best = splitUci(bestUci);
        arrows.push({ from: best.from, to: best.to, type: "best" });
      }
      for (const c of liveEngineEval.candidateMoves) {
        if (!c.uci || c.uci === bestUci || c.uci.length < 4) continue;
        const move = splitUci(c.uci);
        arrows.push({ from: move.from, to: move.to, type: "idea" });
      }
    } else {
      // Use cached analysis from import.
      if (!selectedAnalysis) return null;
      const bestUci = selectedAnalysis.best_move_uci;
      if (bestUci && bestUci.length >= 4) {
        const best = splitUci(bestUci);
        arrows.push({ from: best.from, to: best.to, type: "best" });
      }
      for (const c of selectedAnalysis.candidate_moves) {
        if (!c.uci || c.uci === bestUci || c.uci.length < 4) continue;
        const move = splitUci(c.uci);
        arrows.push({ from: move.from, to: move.to, type: "idea" });
      }
    }

    return arrows.length > 0 ? { highlights: [], arrows } : null;
  }, [showSuggestions, analysisMode, liveEngineEval, selectedAnalysis]);

  const mistakeAnnotations = useMemo((): BoardAnnotations | null => {
    // selectedAnalysis is pinned to the anchor position, not the board the
    // user is currently viewing — once analysis mode steps away from the
    // anchor, its squares no longer correspond to what's on screen.
    if (analysisMode || !selectedAnalysis) return null;
    const result = buildBoardAnnotations(buildEngineBrief(selectedAnalysis));
    return result.highlights.length > 0 || result.arrows.length > 0 ? result : null;
  }, [analysisMode, selectedAnalysis]);

  const boardAnnotations = useMemo((): BoardAnnotations | null => {
    if (!mistakeAnnotations && !suggestionAnnotations) return null;
    return {
      highlights: [
        ...(mistakeAnnotations?.highlights ?? []),
        ...(suggestionAnnotations?.highlights ?? []),
      ],
      arrows: [
        ...(mistakeAnnotations?.arrows ?? []),
        ...(suggestionAnnotations?.arrows ?? []),
      ],
    };
  }, [mistakeAnnotations, suggestionAnnotations]);

  // Hold the last confirmed eval so the bar doesn't snap to center while loading.
  const lastBarEvalRef = useRef<{ evalWhite: number | null; scoreType: "cp" | "mate" | null }>({
    evalWhite: null,
    scoreType: null,
  });
  if (barEval.status === "ready" && barEval.evalWhite !== null) {
    lastBarEvalRef.current = { evalWhite: barEval.evalWhite, scoreType: barEval.scoreType };
  }
  const displayEvalWhite =
    barEval.status === "loading" ? lastBarEvalRef.current.evalWhite : barEval.evalWhite;
  const displayScoreType =
    barEval.status === "loading" ? lastBarEvalRef.current.scoreType : barEval.scoreType;

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

  const topColor: "white" | "black" = boardOrientation === "white" ? "black" : "white";
  const bottomColor: "white" | "black" = boardOrientation === "white" ? "white" : "black";
  const nameFor = (color: "white" | "black") =>
    color === "white" ? (gameState.white_player ?? "White") : (gameState.black_player ?? "Black");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col overflow-hidden bg-[var(--bg)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2 sm:px-6">
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-[var(--text)]">
            {gameState.white_player ?? "White"}{" "}
            <span className="font-normal text-[var(--accent)]">vs</span>{" "}
            {gameState.black_player ?? "Black"}
          </h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {gameState.result ?? "—"} · {moveCount} moves
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label: "Blunders", n: mistakeCounts.blunders, color: "#f87171" },
            { label: "Mistakes", n: mistakeCounts.mistakes, color: "#fb923c" },
            { label: "Inaccuracies", n: mistakeCounts.inaccuracies, color: "#fbbf24" },
          ].map(({ label, n, color }) => (
            <div key={label} className="text-center">
              <div className="text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">
                {label}
              </div>
              <div className="font-mono text-sm font-bold" style={{ color }}>
                {n}
              </div>
            </div>
          ))}
          <UserColorBadge game={gameState} onColorSet={handleColorSet} />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[252px_minmax(0,1fr)_288px]">
        <aside className="flex min-h-0 flex-col gap-1 overflow-y-auto border-b border-[var(--border)] bg-[var(--bg)] p-3 lg:border-b-0 lg:border-r">
          <div className="px-1 pb-1">
            <SectionLabel>Moves</SectionLabel>
          </div>
          <MoveList
            positions={positions}
            analyses={analyses}
            selectedPly={anchorPly}
            onSelectPly={handleSelectPly}
            showMistakes
          />
        </aside>

        <section className="flex min-h-0 flex-col items-center gap-2 overflow-y-auto p-6 lg:p-8">
          <div className="w-full max-w-[500px]">
            <PlayerStrip
              name={nameFor(topColor)}
              color={topColor}
              isUser={gameState.user_color === topColor}
              result={resultForColor(gameState.result, topColor)}
            />
          </div>

          <div className="w-full max-w-[500px]">
            <ChessBoardWithEval
              fen={board.fen}
              orientation={boardOrientation}
              interactive={analysisMode}
              onMove={handleBoardMove}
              evalWhite={displayEvalWhite}
              scoreType={displayScoreType}
              evalStatus={barEval.status}
              annotations={boardAnnotations}
              boardTheme={boardTheme}
            />
          </div>

          <div className="w-full max-w-[500px]">
            <PlayerStrip
              name={nameFor(bottomColor)}
              color={bottomColor}
              isUser={gameState.user_color === bottomColor}
              result={resultForColor(gameState.result, bottomColor)}
            />
          </div>

          <p className="mt-1 font-mono text-xs tracking-wide text-[var(--text-muted)]">
            {viewState.label}
          </p>

          {analysisMode && viewState.line.nodes.length > 1 && (
            <AnalysisLineMoves line={viewState.line} onSelectIndex={goToLineIndex} />
          )}

          <Toolbar
            canStepBack={viewState.canStepBack}
            canStepForward={viewState.canStepForward}
            ply={anchorPly}
            lastPly={lastPly}
            onJumpStart={() => handleSelectPly(0)}
            onJumpEnd={() => handleSelectPly(lastPly)}
            onStepBack={stepBack}
            onStepForward={stepForward}
            showSuggestions={showSuggestions}
            onToggleSuggestions={() => setShowSuggestions((v) => !v)}
            analysisMode={analysisMode}
            onToggleAnalysisMode={toggleAnalysisMode}
            onResetLine={resetToGame}
          />
        </section>

        <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-t border-[var(--border)] bg-[var(--bg)] p-4 lg:border-l lg:border-t-0">
          {!analysisMode && (
            <TutorExplain
              key={selectedAnalysis?.position_id ?? "none"}
              gameId={gameState.id}
              positionId={selectedAnalysis?.position_id ?? null}
            />
          )}
          <EngineMovesPanel
            analysis={selectedAnalysis}
            analyses={analyses}
            userColor={gameState.user_color}
            analysisMode={analysisMode}
            liveEval={liveEngineEval}
            mistakeCounts={mistakeCounts}
          />
        </aside>
      </div>

      {process.env.NODE_ENV === "development" && (
        <DebugPanel
          board={board}
          liveEval={liveEngineEval}
          userColor={gameState.user_color}
          cachedAnalysis={selectedAnalysis}
        />
      )}
    </div>
  );
}

function Toolbar({
  canStepBack,
  canStepForward,
  ply,
  lastPly,
  onJumpStart,
  onJumpEnd,
  onStepBack,
  onStepForward,
  showSuggestions,
  onToggleSuggestions,
  analysisMode,
  onToggleAnalysisMode,
  onResetLine,
}: {
  canStepBack: boolean;
  canStepForward: boolean;
  ply: number;
  lastPly: number;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  showSuggestions: boolean;
  onToggleSuggestions: () => void;
  analysisMode: boolean;
  onToggleAnalysisMode: () => void;
  onResetLine: () => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
      <ToolbarIconButton title="Jump to start" onClick={onJumpStart} disabled={!canStepBack}>
        <svg width="15" height="13" viewBox="0 0 15 13">
          <rect x="0" y="0" width="2.5" height="13" fill="currentColor" />
          <polygon points="15,0 15,13 3.5,6.5" fill="currentColor" />
        </svg>
      </ToolbarIconButton>
      <ToolbarIconButton title="Previous (←)" onClick={onStepBack} disabled={!canStepBack}>
        <svg width="13" height="13" viewBox="0 0 13 13">
          <polygon points="13,0 13,13 0,6.5" fill="currentColor" />
        </svg>
      </ToolbarIconButton>

      <div className="min-w-[64px] text-center font-mono text-sm font-bold text-[var(--text)]">
        {ply === 0 ? "Start" : `${ply} / ${lastPly}`}
      </div>

      <ToolbarIconButton title="Next (→)" onClick={onStepForward} disabled={!canStepForward}>
        <svg width="13" height="13" viewBox="0 0 13 13">
          <polygon points="0,0 0,13 13,6.5" fill="currentColor" />
        </svg>
      </ToolbarIconButton>
      <ToolbarIconButton title="Jump to end" onClick={onJumpEnd} disabled={!canStepForward}>
        <svg width="15" height="13" viewBox="0 0 15 13">
          <polygon points="0,0 0,13 11.5,6.5" fill="currentColor" />
          <rect x="12.5" y="0" width="2.5" height="13" fill="currentColor" />
        </svg>
      </ToolbarIconButton>

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      {analysisMode && (
        <button
          type="button"
          onClick={onResetLine}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)]"
        >
          Reset line
        </button>
      )}

      <button
        type="button"
        onClick={onToggleSuggestions}
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
          showSuggestions
            ? "border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--accent-muted)] text-[var(--accent)]"
            : "border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text)]"
        }`}
      >
        {showSuggestions ? "✓ Suggestions on" : "Show suggestions"}
      </button>

      <button
        type="button"
        onClick={onToggleAnalysisMode}
        className="rounded-lg border border-transparent bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-fg)] transition hover:opacity-90"
      >
        {analysisMode ? "Exit analysis" : "Analyze position"}
      </button>
    </div>
  );
}

function ToolbarIconButton({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-muted)] transition hover:text-[var(--text)] disabled:opacity-30"
    >
      {children}
    </button>
  );
}
