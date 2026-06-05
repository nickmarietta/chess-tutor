"use client";

import {
  evalToWhiteWinningChances,
  formatEvalLabel,
  formatEvalStatusLabel,
  winningChancesToWhiteRatio,
} from "@/lib/chess/evalBar";
import type { EngineEvalStatus } from "@/types/engineEval";

type EvalBarProps = {
  evalWhite: number | null;
  scoreType?: "cp" | "mate" | null;
  status?: EngineEvalStatus;
  orientation?: "white" | "black";
  className?: string;
};

export function EvalBar({
  evalWhite,
  scoreType = "cp",
  status = "idle",
  orientation = "white",
  className = "",
}: EvalBarProps) {
  const canShowEval = status === "ready" && evalWhite !== null;
  const chances = canShowEval
    ? evalToWhiteWinningChances(evalWhite, scoreType)
    : 0;
  const whiteRatio = canShowEval ? winningChancesToWhiteRatio(chances) : 0.5;
  const whitePct = `${whiteRatio * 100}%`;
  const label = canShowEval
    ? formatEvalLabel(evalWhite, scoreType)
    : status === "loading"
      ? "…"
      : formatEvalStatusLabel(status);
  const fillFromBottom = orientation === "white";
  const statusText =
    status === "loading"
      ? "Evaluating position"
      : status === "error"
        ? "No engine eval"
        : status === "stale"
          ? "Eval stale"
          : canShowEval
            ? `Engine evaluation ${label}`
            : "No eval";

  return (
    <div
      className={`relative w-8 shrink-0 overflow-hidden bg-[var(--eval-black,#1c1c1c)] ${className}`}
      aria-label={statusText}
    >
      {canShowEval && (
        <div
          className="absolute inset-x-0 bg-[var(--eval-white,#f4f4f4)] transition-[height] duration-300 ease-out"
          style={
            fillFromBottom
              ? { bottom: 0, height: whitePct }
              : { top: 0, height: whitePct }
          }
        />
      )}
      <div className="relative z-10 flex h-full flex-col justify-between py-2">
        <span className="px-1 text-center text-[9px] font-bold leading-none text-[var(--text-muted)]">
          {orientation === "white" ? "♚" : "♔"}
        </span>
        <span
          className={`px-0.5 text-center text-[10px] font-semibold leading-tight tabular-nums ${
            canShowEval ? "text-[var(--text)]" : "text-[var(--text-subtle)]"
          }`}
          style={{ textShadow: "0 0 4px var(--surface)" }}
        >
          {label}
        </span>
        <span className="px-1 text-center text-[9px] font-bold leading-none text-[var(--text-muted)]">
          {orientation === "white" ? "♔" : "♚"}
        </span>
      </div>
    </div>
  );
}
