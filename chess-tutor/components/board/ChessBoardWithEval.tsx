"use client";

import { AnalysisBoard } from "@/components/board/AnalysisBoard";
import { EvalBar } from "@/components/board/EvalBar";
import type { BoardAnnotations } from "@/types/annotations";
import type { EngineEvalStatus } from "@/types/engineEval";

type ChessBoardWithEvalProps = {
  fen: string;
  orientation?: "white" | "black";
  annotations?: BoardAnnotations | null;
  interactive?: boolean;
  onMove?: (from: string, to: string) => boolean;
  evalWhite: number | null;
  scoreType?: "cp" | "mate" | null;
  evalStatus?: EngineEvalStatus;
  boardTheme?: { light: string; dark: string };
};

export function ChessBoardWithEval({
  evalWhite,
  scoreType,
  evalStatus,
  orientation = "white",
  fen,
  ...boardProps
}: ChessBoardWithEvalProps) {
  return (
    <div className="flex w-full max-w-[min(680px,92vmin)] items-stretch overflow-hidden rounded-lg shadow-[0_24px_64px_rgba(0,0,0,0.35)] ring-1 ring-[var(--border)]">
      <EvalBar
        evalWhite={evalWhite}
        scoreType={scoreType}
        status={evalStatus}
        orientation={orientation}
        className="border-0 border-r border-[var(--border)]"
      />
      <div className="min-w-0 flex-1">
        <AnalysisBoard fen={fen} orientation={orientation} {...boardProps} />
      </div>
    </div>
  );
}
