"use client";

import { useState } from "react";
import { normalizeFen, type BoardChessState } from "@/lib/chess/boardState";
import { buildEngineBrief } from "@/lib/tutor/engineBrief";
import { renderDeterministicExplanation } from "@/lib/tutor/explainRenderer";
import type { LiveEngineEval } from "@/types/engineEval";
import type { MoveAnalysis, UserColor } from "@/types";

type DebugPanelProps = {
  board: BoardChessState;
  liveEval: LiveEngineEval;
  userColor: UserColor | null;
  cachedAnalysis: MoveAnalysis | null;
};

function Row({
  label,
  value,
  mono = true,
  status,
}: {
  label: string;
  value: string;
  mono?: boolean;
  status?: "ok" | "warn" | "error";
}) {
  const statusClass =
    status === "ok"
      ? "text-green-400"
      : status === "warn"
        ? "text-yellow-400"
        : status === "error"
          ? "text-red-400"
          : "text-[var(--text)]";
  return (
    <tr className="align-top">
      <td className="py-0.5 pr-3 whitespace-nowrap text-[var(--text-subtle)]">
        {label}
      </td>
      <td className={`py-0.5 break-all ${mono ? "font-mono" : ""} ${statusClass}`}>
        {value}
      </td>
    </tr>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
        {title}
      </p>
      <table className="w-full text-[11px]">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function DebugPanel({
  board,
  liveEval,
  userColor,
  cachedAnalysis,
}: DebugPanelProps) {
  const [open, setOpen] = useState(false);

  const evalFen = liveEval.evaluatedFen;
  const fenMatch =
    evalFen != null &&
    normalizeFen(evalFen) === normalizeFen(board.fen);

  const headerStatus = fenMatch
    ? "ok"
    : liveEval.status === "loading"
      ? "warn"
      : "error";

  const headerLabel = fenMatch
    ? "✓ FEN match"
    : liveEval.status === "loading"
      ? "… loading"
      : liveEval.status === "idle"
        ? "idle"
        : "✗ FEN mismatch";

  const headerColor =
    headerStatus === "ok"
      ? "text-green-400"
      : headerStatus === "warn"
        ? "text-yellow-400"
        : "text-red-400";

  const evalStatusIndicator =
    liveEval.status === "ready"
      ? "ok"
      : liveEval.status === "loading"
        ? "warn"
        : liveEval.status === "idle"
          ? undefined
          : "error";

  const rawScore = liveEval.rawScore
    ? `${liveEval.rawScore.value} (${liveEval.rawScore.type})`
    : "—";

  const normalizedEval =
    liveEval.evalWhite !== null
      ? `${liveEval.evalWhite > 0 ? "+" : ""}${liveEval.evalWhite.toFixed(2)} pawns (White)`
      : "—";

  const deterministicExplanation = cachedAnalysis
    ? renderDeterministicExplanation(buildEngineBrief(cachedAnalysis))
    : null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[440px] max-h-[72vh] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] font-mono text-[11px] shadow-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[var(--surface-hover)]"
      >
        <span className="text-[var(--text-muted)]">
          Debug
          <span className={`ml-2 ${headerColor}`}>{headerLabel}</span>
        </span>
        <span className="text-[var(--text-subtle)]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="divide-y divide-[var(--border)] overflow-y-auto max-h-[calc(72vh-36px)]">
          <div className="space-y-4 p-3">
            <Section title="Board">
              <Row label="FEN" value={board.fen} />
              <Row label="Side to move" value={board.sideToMove} />
              <Row label="User color" value={userColor ?? "—"} />
              <Row label="Last move" value={board.lastMoveSan ?? "—"} />
              <Row label="Ply" value={String(board.ply)} />
              <Row
                label="Mode"
                value={
                  board.isAnalysis
                    ? `analysis (anchor ply ${board.anchorPly})`
                    : "game"
                }
                mono={false}
              />
            </Section>

            <Section title="Engine eval">
              <Row
                label="Status"
                value={liveEval.status}
                mono={false}
                status={evalStatusIndicator}
              />
              <Row label="FEN sent" value={normalizeFen(board.fen)} />
              <Row label="FEN evaluated" value={evalFen ?? "—"} />
              <Row
                label="FEN match"
                value={
                  evalFen != null ? (fenMatch ? "✓ yes" : "✗ no") : "—"
                }
                mono={false}
                status={evalFen != null ? (fenMatch ? "ok" : "error") : undefined}
              />
              <Row label="Raw score" value={rawScore} />
              <Row label="Normalized eval" value={normalizedEval} />
              <Row label="Score type" value={liveEval.scoreType ?? "—"} />
              <Row
                label="STM-converted"
                value={liveEval.convertedFromSideToMove ? "yes (Black flipped)" : "no"}
                mono={false}
              />
              {liveEval.errorMessage && (
                <Row
                  label="Error"
                  value={liveEval.errorMessage}
                  mono={false}
                  status="error"
                />
              )}
            </Section>

            <Section title="Legal moves">
              <Row
                label="Count"
                value={String(board.legalMovesSan.length)}
              />
              <Row
                label="Moves"
                value={
                  board.legalMovesSan.length > 0
                    ? board.legalMovesSan.join("  ")
                    : "—"
                }
              />
            </Section>

            {cachedAnalysis ? (
              <Section title="Cached analysis (import)">
                <Row
                  label="Best move"
                  value={cachedAnalysis.best_move_san ?? "—"}
                />
                <Row
                  label="Best UCI"
                  value={cachedAnalysis.best_move_uci ?? "—"}
                />
                <Row
                  label="Eval before"
                  value={
                    cachedAnalysis.eval_before != null
                      ? String(cachedAnalysis.eval_before)
                      : "—"
                  }
                />
                <Row
                  label="Eval after"
                  value={
                    cachedAnalysis.eval_after != null
                      ? String(cachedAnalysis.eval_after)
                      : "—"
                  }
                />
                <Row
                  label="Eval swing"
                  value={
                    cachedAnalysis.eval_swing != null
                      ? String(cachedAnalysis.eval_swing)
                      : "—"
                  }
                />
                <Row
                  label="Severity"
                  value={cachedAnalysis.mistake_severity ?? "—"}
                  mono={false}
                />
                <Row
                  label="Tags"
                  value={cachedAnalysis.mistake_tags.join(", ") || "—"}
                  mono={false}
                />
              </Section>
            ) : (
              <Section title="Cached analysis (import)">
                <Row label="Status" value="none for this position" mono={false} />
              </Section>
            )}

            <Section title="Deterministic explanation (no LLM)">
              <Row
                label="Text"
                value={deterministicExplanation ?? "no move analysis for this position"}
                mono={false}
              />
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}
