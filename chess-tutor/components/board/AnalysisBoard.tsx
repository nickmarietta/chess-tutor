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
};

export function AnalysisBoard({
  fen,
  orientation = "white",
  annotations,
  interactive = true,
  onMove,
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
    <div className="aspect-square w-full max-w-[480px] overflow-hidden rounded-xl border border-stone-200 shadow-sm">
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
            borderRadius: "0.75rem",
          },
        }}
      />
    </div>
  );
}
