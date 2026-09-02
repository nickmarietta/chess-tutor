import type { EngineBrief } from "./engineBrief";
import type { HelpMode } from "@/types";

/**
 * Enforces the hint/guide/answer ladder by redacting fields out of the brief
 * — never by prompt instruction — so a compromised or ignored prompt still
 * can't leak more than the requested help_mode allows. The LLM (and the
 * deterministic fallback) only ever sees what survives this redaction.
 *
 * - hint: confirms something went wrong and how badly, nothing else — no
 *   move, no absolute eval, no mistake type. The player has to find it.
 * - guide: adds the move played, the full eval, and the kind of mistake —
 *   enough to point at the problem without stating the fix.
 * - answer: the full brief, unredacted.
 */
export function redactBriefForHelpMode(
  brief: EngineBrief,
  helpMode: HelpMode,
): EngineBrief {
  if (helpMode === "answer") return brief;

  const hintLevel: EngineBrief = {
    sideToMove: brief.sideToMove,
    movePlayedSan: null,
    movePlayedUci: null,
    bestMoveSan: null,
    bestMoveUci: null,
    evalBefore: null,
    evalAfter: null,
    evalSwing: brief.evalSwing,
    severity: brief.severity,
    mistakeTags: [],
    candidateMoves: [],
    isCritical: brief.isCritical,
  };

  if (helpMode === "hint") return hintLevel;

  return {
    ...hintLevel,
    movePlayedSan: brief.movePlayedSan,
    movePlayedUci: brief.movePlayedUci,
    evalBefore: brief.evalBefore,
    evalAfter: brief.evalAfter,
    mistakeTags: brief.mistakeTags,
  };
}
