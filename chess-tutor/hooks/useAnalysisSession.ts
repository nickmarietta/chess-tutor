"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  applyMove,
  createAnalysisLine,
  displayPly,
  formatAnalysisLabel,
  getCurrentNode,
  getParentNode,
  rebuildAnalysisLine,
  resetAnalysisToAnchor,
  stepAnalysis,
  type AnalysisLine,
} from "@/lib/chess/analysisLine";
import { createBoardChessState, type BoardChessState } from "@/lib/chess/boardState";
import type { Position } from "@/types";

export type AnalysisViewState = {
  line: AnalysisLine;
  fen: string;
  moveSan: string | null;
  fenBefore: string | null;
  ply: number;
  label: string;
  isAnalysis: boolean;
  anchorPosition: Position | undefined;
  canStepBack: boolean;
  canStepForward: boolean;
  /** Single source of truth for board, moves, and eval requests. */
  board: BoardChessState;
};

export function useAnalysisSession(gamePositions: Position[]) {
  const [anchorPly, setAnchorPly] = useState(0);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [line, setLine] = useState<AnalysisLine>(() => {
    const fen = gamePositions[0]?.fen ?? "";
    return createAnalysisLine(0, fen);
  });
  const lastGamePly = gamePositions[gamePositions.length - 1]?.ply ?? 0;

  const sessionRef = useRef({ anchorPly, line, analysisMode, lastGamePly });
  sessionRef.current = { anchorPly, line, analysisMode, lastGamePly };

  const anchorPosition = useMemo(
    () => gamePositions.find((p) => p.ply === anchorPly) ?? gamePositions[0],
    [gamePositions, anchorPly],
  );

  const goToGamePly = useCallback(
    (ply: number) => {
      const pos = gamePositions.find((p) => p.ply === ply);
      if (!pos) return;
      setAnchorPly(ply);
      setAnalysisMode(false);
      setLine(resetAnalysisToAnchor(ply, pos.fen));
    },
    [gamePositions],
  );

  const goToPlyInAnalysis = useCallback(
    (ply: number) => {
      const pos = gamePositions.find((p) => p.ply === ply);
      if (!pos) return;
      setAnchorPly(ply);
      setAnalysisMode(true);
      setLine(resetAnalysisToAnchor(ply, pos.fen));
    },
    [gamePositions],
  );

  const goToAdjacentGamePly = useCallback(
    (delta: number) => {
      const nextPly = Math.max(0, Math.min(lastGamePly, anchorPly + delta));
      if (nextPly === anchorPly) return;
      const pos = gamePositions.find((p) => p.ply === nextPly);
      if (!pos) return;
      setAnchorPly(nextPly);
      setAnalysisMode(false);
      setLine(resetAnalysisToAnchor(nextPly, pos.fen));
    },
    [anchorPly, gamePositions, lastGamePly],
  );

  const enterAnalysisMode = useCallback(() => {
    if (!anchorPosition) return;
    setAnalysisMode(true);
    setLine(resetAnalysisToAnchor(anchorPly, anchorPosition.fen));
  }, [anchorPly, anchorPosition]);

  const exitAnalysisMode = useCallback(() => {
    if (!anchorPosition) return;
    setAnalysisMode(false);
    setLine(resetAnalysisToAnchor(anchorPly, anchorPosition.fen));
  }, [anchorPly, anchorPosition]);

  const makeMoveOnBoard = useCallback(
    (from: string, to: string) => {
      if (!analysisMode) return false;
      const next = applyMove(line, from, to);
      if (!next) return false;
      setLine(next);
      return true;
    },
    [analysisMode, line],
  );

  const stepBack = useCallback(() => {
    const { anchorPly: a, line: l, analysisMode: am } = sessionRef.current;

    if (am) {
      if (l.cursor > 0) {
        setLine((prev) => stepAnalysis(prev, -1));
        return;
      }
      if (a > 0) {
        const pos = gamePositions.find((p) => p.ply === a - 1);
        if (pos) {
          setAnchorPly(pos.ply);
          setLine(resetAnalysisToAnchor(pos.ply, pos.fen));
        }
      }
      return;
    }

    if (a > 0) {
      goToAdjacentGamePly(-1);
    }
  }, [gamePositions, goToAdjacentGamePly]);

  const stepForward = useCallback(() => {
    const { anchorPly: a, line: l, analysisMode: am, lastGamePly: last } =
      sessionRef.current;

    if (am) {
      if (l.cursor < l.nodes.length - 1) {
        setLine((prev) => stepAnalysis(prev, 1));
        return;
      }
      if (a < last) {
        const pos = gamePositions.find((p) => p.ply === a + 1);
        if (pos) {
          setAnchorPly(pos.ply);
          setLine(resetAnalysisToAnchor(pos.ply, pos.fen));
        }
      }
      return;
    }

    if (a < last) {
      goToAdjacentGamePly(1);
    }
  }, [gamePositions, goToAdjacentGamePly]);

  const resetToGame = useCallback(() => {
    const { anchorPly: a, analysisMode: am } = sessionRef.current;
    const pos = gamePositions.find((p) => p.ply === a);
    if (!pos) return;
    setAnalysisMode(am);
    setLine(resetAnalysisToAnchor(a, pos.fen));
  }, [gamePositions]);

  const goToLineIndex = useCallback((index: number) => {
    if (!sessionRef.current.analysisMode) return;
    setLine((prev) => ({
      ...prev,
      cursor: Math.max(0, Math.min(prev.nodes.length - 1, index)),
    }));
  }, []);

  const restoreSnapshot = useCallback(
    (anchor: number, cursor: number, analysisMoves: string[] = []) => {
      const pos = gamePositions.find((p) => p.ply === anchor);
      if (!pos) return;
      setAnchorPly(anchor);
      const shouldUseAnalysisMode = analysisMoves.length > 0 || cursor > 0;
      setAnalysisMode(shouldUseAnalysisMode);

      if (shouldUseAnalysisMode && analysisMoves.length > 0) {
        setLine(rebuildAnalysisLine(anchor, pos.fen, analysisMoves, cursor));
      } else {
        setLine(resetAnalysisToAnchor(anchor, pos.fen));
      }
    },
    [gamePositions],
  );

  const viewState: AnalysisViewState = useMemo(() => {
    const current = getCurrentNode(line);
    const parent = getParentNode(line);
    const anchorIndex = gamePositions.findIndex((p) => p.ply === anchorPly);
    const previousGamePosition =
      anchorIndex > 0 ? gamePositions[anchorIndex - 1] : undefined;
    const isAnalysis = analysisMode;
    const canStepBack = isAnalysis
      ? line.cursor > 0 || anchorPly > 0
      : anchorPly > 0;
    const canStepForward = isAnalysis
      ? line.cursor < line.nodes.length - 1 || anchorPly < lastGamePly
      : anchorPly < lastGamePly;
    const moveSan = isAnalysis
      ? current.moveSan
      : (anchorPosition?.move_san ?? null);
    const fen = isAnalysis ? current.fen : (anchorPosition?.fen ?? current.fen);
    const fenBefore = isAnalysis
      ? (parent?.fen ?? null)
      : (previousGamePosition?.fen ?? null);
    const ply = isAnalysis ? displayPly(line) : anchorPly;

    const board = createBoardChessState({
      fen,
      lastMoveSan: moveSan,
      ply,
      isAnalysis,
      anchorPly,
    });

    return {
      line,
      fen: board.fen,
      moveSan,
      fenBefore,
      ply,
      label: isAnalysis
        ? line.cursor === 0
          ? `Analysis from ${anchorPly === 0 ? "start position" : `after ${anchorPosition?.move_san ?? "?"}`}`
          : formatAnalysisLabel(line)
        : moveSan
          ? `After ${moveSan}`
          : "Starting position",
      isAnalysis,
      anchorPosition,
      canStepBack,
      canStepForward,
      board,
    };
  }, [
    analysisMode,
    anchorPly,
    anchorPosition,
    gamePositions,
    lastGamePly,
    line,
  ]);

  return {
    anchorPly,
    viewState,
    analysisMode,
    goToGamePly,
    goToPlyInAnalysis,
    enterAnalysisMode,
    exitAnalysisMode,
    makeMove: makeMoveOnBoard,
    stepBack,
    stepForward,
    resetToGame,
    goToLineIndex,
    restoreSnapshot,
  };
}
