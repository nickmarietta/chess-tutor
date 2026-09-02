"use client";

import type { MoveAnalysis, UserColor } from "@/types";
import type { LiveEngineEval } from "@/types/engineEval";
import { resolveReviewFocus } from "@/lib/analysis/perspective";
import { formatEvalLabel } from "@/lib/chess/evalBar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { MistakeCounts } from "@/lib/analysis/mistakeCounts";

function formatEval(value: number | null, scoreType?: "cp" | "mate" | null) {
  if (value === null) return "—";
  return formatEvalLabel(value, scoreType ?? "cp");
}

function evalColor(value: number | null) {
  if (value === null) return "var(--text)";
  if (value > 0.15) return "#4ade80";
  if (value < -0.15) return "#f87171";
  return "#fbbf24";
}

type EngineMovesPanelProps = {
  analysis: MoveAnalysis | null;
  analyses: MoveAnalysis[];
  userColor: UserColor | null;
  analysisMode?: boolean;
  liveEval?: LiveEngineEval;
  mistakeCounts: MistakeCounts;
};

export function EngineMovesPanel({
  analysis,
  analyses,
  userColor,
  analysisMode = false,
  liveEval,
  mistakeCounts,
}: EngineMovesPanelProps) {
  return (
    <>
      {analysisMode && liveEval ? (
        <LivePanel liveEval={liveEval} />
      ) : (
        <CachedPanel analysis={analysis} analyses={analyses} userColor={userColor} />
      )}
      <GameSummary counts={mistakeCounts} />
    </>
  );
}

function PanelCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5">
      {children}
    </div>
  );
}

function LivePanel({ liveEval }: { liveEval: LiveEngineEval }) {
  const isReady = liveEval.status === "ready";

  return (
    <div>
      <SectionLabel>Engine Analysis</SectionLabel>
      <div className="mt-2.5">
        <PanelCard>
          {!isReady ? (
            <p className="text-sm text-[var(--text-muted)]">
              {liveEval.status === "loading" ? "Evaluating position…" : "No engine data."}
            </p>
          ) : (
            <div className="space-y-3">
              <Row label="Best move">
                <span className="font-mono text-lg text-[var(--text)]">
                  {liveEval.bestMoveSan ?? "—"}
                </span>
              </Row>
              <Row label="Principal line">
                <span className="font-mono text-sm leading-relaxed text-[var(--text-muted)]">
                  {liveEval.engineLine.length > 0
                    ? liveEval.engineLine.map((m) => m.san).join(" ")
                    : "—"}
                </span>
              </Row>
              <div>
                <p className="text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">
                  Candidates
                </p>
                <CandidateList
                  candidates={liveEval.candidateMoves}
                  formatEval={formatEval}
                />
              </div>
              <Row label="Eval (White)">
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: evalColor(liveEval.evalWhite) }}
                >
                  {formatEval(liveEval.evalWhite, liveEval.scoreType)}
                </span>
              </Row>
            </div>
          )}
        </PanelCard>
      </div>
    </div>
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
      <div>
        <SectionLabel>Engine Analysis</SectionLabel>
        <div className="mt-2.5">
          <PanelCard>
            <p className="text-sm text-[var(--text-muted)]">
              Select a move to see the engine&apos;s best lines and candidates.
            </p>
          </PanelCard>
        </div>
      </div>
    );
  }

  const isOpportunity = focus?.usesReplyContext ?? false;

  return (
    <div>
      <SectionLabel>Engine Analysis</SectionLabel>
      <div className="mt-2.5">
        <PanelCard>
          {isOpportunity && (
            <p className="mb-3 text-sm text-[var(--text-muted)]">
              After opponent&apos;s{" "}
              <span className="font-mono text-[var(--text)]">{analysis.move_played_san}</span>,
              best ways to punish:
            </p>
          )}

          <div className="space-y-3">
            <Row label="Best move">
              <span className="font-mono text-lg text-[var(--text)]">
                {detail.best_move_san ?? "—"}
              </span>
            </Row>

            <Row label="Principal line">
              <span className="font-mono text-sm leading-relaxed text-[var(--text-muted)]">
                {detail.engine_line.map((m) => m.san).join(" ") || "—"}
              </span>
            </Row>

            <div>
              <p className="text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">
                Candidates
              </p>
              <CandidateList candidates={detail.candidate_moves} formatEval={formatEval} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">
                  Eval before
                </p>
                <p className="font-mono text-[var(--text)]">{formatEval(analysis.eval_before)}</p>
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">
                  Eval after
                </p>
                <p className="font-mono text-[var(--text)]">{formatEval(analysis.eval_after)}</p>
              </div>
            </div>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function CandidateList({
  candidates,
  formatEval,
}: {
  candidates: { uci: string | null; san: string | null; score: number | null; scoreType?: "cp" | "mate" | null }[];
  formatEval: (value: number | null, scoreType?: "cp" | "mate" | null) => string;
}) {
  if (candidates.length === 0) {
    return <p className="mt-2 text-sm text-[var(--text-muted)]">None</p>;
  }
  return (
    <ul className="mt-2 space-y-1.5">
      {candidates.map((c) => (
        <li
          key={c.uci ?? c.san}
          className="flex items-center justify-between rounded-md border border-[var(--border)] px-2.5 py-1.5"
        >
          <span className="font-mono text-sm text-[var(--text)]">{c.san ?? c.uci}</span>
          <span className="text-xs text-[var(--text-subtle)]">
            {formatEval(c.score, c.scoreType)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function GameSummary({ counts }: { counts: MistakeCounts }) {
  const rows = [
    { label: "Blunders", n: counts.blunders, color: "#f87171" },
    { label: "Mistakes", n: counts.mistakes, color: "#fb923c" },
    { label: "Inaccuracies", n: counts.inaccuracies, color: "#fbbf24" },
  ];
  return (
    <div className="mt-auto border-t border-[var(--border)] pt-3.5">
      <SectionLabel>Game Summary</SectionLabel>
      <div className="mt-2.5 flex flex-col gap-1.5">
        {rows.map(({ label, n, color }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm text-[var(--text-muted)]">{label}</span>
            </div>
            <span className="font-mono text-sm font-bold" style={{ color }}>
              {n}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
