import { splitUci } from "@/lib/chess/uci";
import type { BoardAnnotations, HighlightType, MistakeTag } from "@/types";
import type { EngineBrief } from "./engineBrief";

const TAG_HIGHLIGHT_TYPE: Record<MistakeTag, HighlightType> = {
  missed_tactic: "target",
  hanging_piece: "weakness",
  poor_piece_activity: "weakness",
  bad_trade: "weakness",
  ignored_opponent_threat: "weakness",
  premature_attack: "weakness",
  weak_king_safety: "weakness",
  passive_defense: "weakness",
  opening_principle_violation: "weakness",
};

/**
 * Derives board highlights and arrows purely from an engine brief — no LLM
 * involvement, per the tutor design's trust boundary: an arrow or highlight
 * is a chess claim, so it must come from engine data, never generated prose.
 *
 * Returns no annotations at all when the move wasn't a mistake, matching the
 * "explain what went wrong" purpose of this feature (distinct from the
 * existing move-suggestion arrows, which suggest good moves regardless).
 */
export function buildBoardAnnotations(brief: EngineBrief): BoardAnnotations {
  if (brief.severity === "none") {
    return { highlights: [], arrows: [] };
  }

  const highlights: BoardAnnotations["highlights"] = [];
  const arrows: BoardAnnotations["arrows"] = [];

  if (brief.bestMoveUci && brief.bestMoveUci !== brief.movePlayedUci) {
    const best = splitUci(brief.bestMoveUci);
    arrows.push({ from: best.from, to: best.to, type: "best" });
  }

  if (brief.movePlayedUci) {
    const played = splitUci(brief.movePlayedUci);
    for (const tag of brief.mistakeTags) {
      highlights.push({ square: played.to, type: TAG_HIGHLIGHT_TYPE[tag] });
    }
  }

  return { highlights, arrows };
}
