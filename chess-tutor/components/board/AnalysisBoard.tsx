"use client";

import { Chessboard } from "react-chessboard";

type AnalysisBoardProps = {
  fen: string;
  orientation?: "white" | "black";
};

export function AnalysisBoard({ fen, orientation = "white" }: AnalysisBoardProps) {
  return (
    <div className="aspect-square w-full max-w-[480px] overflow-hidden rounded-xl border border-stone-200 shadow-sm">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: false,
          boardStyle: {
            borderRadius: "0.75rem",
          },
        }}
      />
    </div>
  );
}
