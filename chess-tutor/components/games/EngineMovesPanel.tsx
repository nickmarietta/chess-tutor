"use client";

import type { MoveAnalysis, UserColor } from "@/types";
import type { LiveEngineEval } from "@/types/engineEval";
import { resolveReviewFocus } from "@/lib/analysis/perspective";
import { formatEvalLabel } from "@/lib/chess/evalBar";

function formatEval(value: number | null, scoreType?: "cp" | "mate" | null) {
  if (value === null) return "—";
  return formatEvalLabel(value, scoreType ?? "cp");
}

type EngineMovesPanelProps = {
  analysis: MoveAnalysis | null;
  analyses: MoveAnalysis[];
  userColor: UserColor | null;
  analysisMode?: boolean;
  liveEval?: LiveEngineEval;
};

export function EngineMovesPanel({
  analysis,
  analyses,
  userColor,
  analysisMode = false,
  liveEval,
}: EngineMovesPanelProps) {
  if (analysisMode && liveEval) {
    return <LivePanel liveEval={liveEval} />;
  }

  return <CachedPanel analysis={analysis} analyses={analyses} userColor={userColor} />;
}

function LivePanel({ liveEval }: { liveEval: LiveEngineEval }) {
  const isReady = liveEval.status === "ready";

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="text-sm font-medium text-[var(--text)]">Engine recommendations</h3>

      {!isReady ? (
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {liveEval.status === "loading" ? "Evaluating position…" : "No engine data."}
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">Best move</p>
            <p className="mt-1 font-mono text-lg text-[var(--text)]">
              {liveEval.bestMoveSan ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">Principal line</p>
            <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">
              {liveEval.engineLine.length > 0
                ? liveEval.engineLine.map((m) => m.san).join(" ")
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">Candidates</p>
            <ul className="mt-2 space-y-2">
              {liveEval.candidateMoves.length === 0 ? (
                <li className="text-sm text-[var(--text-muted)]">None</li>
              ) : (
                liveEval.candidateMoves.map((c) => (
                  <li
                    key={c.uci ?? c.san}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2"
                  >
                    <span className="font-mono text-sm text-[var(--text)]">{c.san ?? c.uci}</span>
                    <span className="text-xs text-[var(--text-subtle)]">
                      {formatEval(c.score, c.scoreType)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <p className="text-xs text-[var(--text-subtle)]">Eval (White)</p>
            <p className="font-mono text-sm text-[var(--text)]">
              {formatEval(liveEval.evalWhite, liveEval.scoreType)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function CachedPanel({
  analysis,
  analyses,
  userColor,
}: {
  analysis: MoveAnalysis | null;
  analyses: MoveAnalysis[];
  userColor: UserColor | null;
}) {
  const focus = resolveReviewFocus(analysis, analyses, userColor);
  const detail = focus?.focusAnalysis ?? analysis;

  if (!analysis || !detail) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="text-sm font-medium text-[var(--text)]">Engine recommendations</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Select a move to see the engine&apos;s best lines and candidates.
        </p>
      </section>
    );
  }

  const isOpportunity = focus?.usesReplyContext ?? false;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="text-sm font-medium text-[var(--text)]">Engine recommendations</h3>
      {isOpportunity && (
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          After opponent&apos;s{" "}
          <span className="font-mono">{analysis.move_played_san}</span>, best ways to punish:
        </p>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">Best move</p>
          <p className="mt-1 font-mono text-lg text-[var(--text)]">
            {detail.best_move_san ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">Principal line</p>
          <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">
            {detail.engine_line.map((m) => m.san).join(" ") || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">Candidates</p>
          <ul className="mt-2 space-y-2">
            {detail.candidate_moves.length === 0 ? (
              <li className="text-sm text-[var(--text-muted)]">None cached</li>
            ) : (
              detail.candidate_moves.map((c) => (
                <li
                  key={c.uci ?? c.san}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2"
                >
                  <span className="font-mono text-sm text-[var(--text)]">{c.san ?? c.uci}</span>
                  <span className="text-xs text-[var(--text-subtle)]">
                    {formatEval(c.score, c.scoreType)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-[var(--text-subtle)]">Eval before</p>
            <p className="font-mono text-[var(--text)]">{formatEval(analysis.eval_before)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-subtle)]">Eval after</p>
            <p className="font-mono text-[var(--text)]">{formatEval(analysis.eval_after)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
