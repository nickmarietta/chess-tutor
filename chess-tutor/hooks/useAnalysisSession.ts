"use client";

import { useCallback, useMemo, useState } from "react";
import {
  applyMove,
  createAnalysisLine,
  displayPly,
  formatAnalysisLabel,
  getCurrentNode,
  getParentNode,
  isAnalysisBranch,
  rebuildAnalysisLine,
  resetAnalysisToAnchor,
  stepAnalysis,
  type AnalysisLine,
} from "@/lib/chess/analysisLine";
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
};

export function useAnalysisSession(gamePositions: Position[]) {
  const [anchorPly, setAnchorPly] = useState(0);
  const [line, setLine] = useState<AnalysisLine>(() => {
    const fen = gamePositions[0]?.fen ?? "";
    return createAnalysisLine(0, fen);
  });

  const anchorPosition = useMemo(
    () => gamePositions.find((p) => p.ply === anchorPly) ?? gamePositions[0],
    [gamePositions, anchorPly],
  );

  const goToGamePly = useCallback(
    (ply: number) => {
      const pos = gamePositions.find((p) => p.ply === ply);
      if (!pos) return;
      setAnchorPly(ply);
      setLine(resetAnalysisToAnchor(ply, pos.fen));
    },
    [gamePositions],
  );

  const makeMoveOnBoard = useCallback(
    (from: string, to: string) => {
      const next = applyMove(line, from, to);
      if (!next) return false;
      setLine(next);
      return true;
    },
    [line],
  );

  const stepBack = useCallback(() => {
    setLine((prev) => stepAnalysis(prev, -1));
  }, []);

  const stepForward = useCallback(() => {
    setLine((prev) => stepAnalysis(prev, 1));
  }, []);

  const resetToGame = useCallback(() => {
    if (!anchorPosition) return;
    setLine(resetAnalysisToAnchor(anchorPly, anchorPosition.fen));
  }, [anchorPly, anchorPosition]);

  const goToLineIndex = useCallback((index: number) => {
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
      if (analysisMoves.length > 0) {
        setLine(rebuildAnalysisLine(anchor, pos.fen, analysisMoves, cursor));
      } else {
        setLine({ ...resetAnalysisToAnchor(anchor, pos.fen), cursor });
      }
    },
    [gamePositions],
  );

  const viewState: AnalysisViewState = useMemo(() => {
    const current = getCurrentNode(line);
    const parent = getParentNode(line);
    const isAnalysis = isAnalysisBranch(line, gamePositions);

    return {
      line,
      fen: current.fen,
      moveSan: current.moveSan,
      fenBefore: parent?.fen ?? null,
      ply: displayPly(line),
      label: isAnalysis
        ? formatAnalysisLabel(line)
        : current.moveSan
          ? `After ${current.moveSan}`
          : anchorPly === 0
            ? "Starting position"
            : `After ${anchorPosition?.move_san ?? "?"}`,
      isAnalysis,
      anchorPosition,
      canStepBack: line.cursor > 0,
      canStepForward: line.cursor < line.nodes.length - 1,
    };
  }, [line, gamePositions, anchorPly, anchorPosition]);

  return {
    anchorPly,
    viewState,
    goToGamePly,
    makeMove: makeMoveOnBoard,
    stepBack,
    stepForward,
    resetToGame,
    goToLineIndex,
    restoreSnapshot,
  };
}
