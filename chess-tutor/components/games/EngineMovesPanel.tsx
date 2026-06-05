"use client";

import type { MoveAnalysis } from "@/types";
import { resolveReviewFocus } from "@/lib/analysis/perspective";
import type { UserColor } from "@/types";

function formatEval(value: number | null) {
  if (value === null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

type EngineMovesPanelProps = {
  analysis: MoveAnalysis | null;
  analyses: MoveAnalysis[];
  userColor: UserColor | null;
};

export function EngineMovesPanel({
  analysis,
  analyses,
  userColor,
}: EngineMovesPanelProps) {
  const focus = resolveReviewFocus(analysis, analyses, userColor);
  const detail = focus?.focusAnalysis ?? analysis;

  if (!analysis || !detail) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h3 className="text-sm font-medium text-[var(--text)]">
          Engine recommendations
        </h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Select a move to see the engine&apos;s best lines and candidates.
        </p>
      </section>
    );
  }

  const isOpportunity = focus?.usesReplyContext ?? false;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="text-sm font-medium text-[var(--text)]">
        Engine recommendations
      </h3>
      {isOpportunity && (
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          After opponent&apos;s{" "}
          <span className="font-mono">{analysis.move_played_san}</span>, best
          ways to punish:
        </p>
      )}

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">
            Best move
          </p>
          <p className="mt-1 font-mono text-lg text-[var(--text)]">
            {detail.best_move_san ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">
            Principal line
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">
            {detail.engine_line.map((m) => m.san).join(" ") || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-subtle)]">
            Candidates
          </p>
          <ul className="mt-2 space-y-2">
            {detail.candidate_moves.length === 0 ? (
              <li className="text-sm text-[var(--text-muted)]">None cached</li>
            ) : (
              detail.candidate_moves.map((c) => (
                <li
                  key={c.uci ?? c.san}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2"
                >
                  <span className="font-mono text-sm text-[var(--text)]">
                    {c.san ?? c.uci}
                  </span>
                  <span className="text-xs text-[var(--text-subtle)]">
                    {formatEval(c.score)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-[var(--text-subtle)]">Eval before</p>
            <p className="font-mono text-[var(--text)]">
              {formatEval(analysis.eval_before)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-subtle)]">Eval after</p>
            <p className="font-mono text-[var(--text)]">
              {formatEval(analysis.eval_after)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
