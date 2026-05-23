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
};

export function AnalysisBoard({
  fen,
  orientation = "white",
  annotations,
}: AnalysisBoardProps) {
  const squareStyles = annotationsToSquareStyles(annotations?.highlights);
  const arrows = annotationsToArrows(annotations?.arrows);

  return (
    <div className="aspect-square w-full max-w-[480px] overflow-hidden rounded-xl border border-stone-200 shadow-sm">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: false,
          squareStyles,
          arrows,
          clearArrowsOnPositionChange: false,
          boardStyle: {
            borderRadius: "0.75rem",
          },
        }}
      />
    </div>
  );
}
