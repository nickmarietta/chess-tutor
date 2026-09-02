"use client";

import { Chessboard } from "react-chessboard";
import {
  annotationsToArrows,
  annotationsToSquareStyles,
} from "@/lib/chess/boardStyles";
import type { BoardAnnotations } from "@/types/annotations";

type AnalysisBoardProps = {
  fen: string;
  orientation?: "white" | "black";
  annotations?: BoardAnnotations | null;
  interactive?: boolean;
  onMove?: (from: string, to: string) => boolean;
  boardTheme?: { light: string; dark: string };
};

export function AnalysisBoard({
  fen,
  orientation = "white",
  annotations,
  interactive = true,
  onMove,
  boardTheme,
}: AnalysisBoardProps) {
  const squareStyles = annotationsToSquareStyles(annotations?.highlights);
  const arrows = annotationsToArrows(annotations?.arrows);

  function handlePieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }): boolean {
    if (!interactive || !onMove || !targetSquare) return false;
    return onMove(sourceSquare, targetSquare);
  }

  return (
    <div className="aspect-square h-full w-full overflow-hidden bg-[var(--surface)]">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: interactive,
          squareStyles,
          arrows,
          clearArrowsOnPositionChange: false,
          onPieceDrop: handlePieceDrop,
          boardStyle: {
            borderRadius: 0,
          },
          ...(boardTheme
            ? {
                darkSquareStyle: { backgroundColor: boardTheme.dark },
                lightSquareStyle: { backgroundColor: boardTheme.light },
              }
            : {}),
        }}
      />
    </div>
  );
}
