import { splitUci } from "@/lib/chess/uci";
import type { BoardAnnotations, HighlightType, MistakeTag } from "@/types";
import type { EngineBrief } from "./engineBrief";

// EngineBrief carries no board/FEN data (by design — see engineBrief.ts), so
// the only squares available to anchor a highlight on are the move played
// and the engine's best move. Tags are categorized by the kind of problem
// they represent rather than pointing at a piece-accurate square, which
// would need the position itself to compute. missed_tactic is the one tag
// that gets a more precise anchor: the best move's destination, since that's
// exactly the square the missed tactic played out on.
const TAG_HIGHLIGHT_TYPE: Record<MistakeTag, HighlightType> = {
  missed_tactic: "target",
  hanging_piece: "weakness",
  bad_trade: "weakness",
  premature_attack: "weakness",
  opening_principle_violation: "weakness",
  ignored_opponent_threat: "important",
  weak_king_safety: "important",
  poor_piece_activity: "control",
  passive_defense: "control",
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

  const best = brief.bestMoveUci ? splitUci(brief.bestMoveUci) : null;
  const played = brief.movePlayedUci ? splitUci(brief.movePlayedUci) : null;

  if (best && brief.bestMoveUci !== brief.movePlayedUci) {
    arrows.push({ from: best.from, to: best.to, type: "best" });
  }

  for (const tag of brief.mistakeTags) {
    const square = tag === "missed_tactic" && best ? best.to : played?.to;
    if (!square) continue;
    highlights.push({ square, type: TAG_HIGHLIGHT_TYPE[tag] });
  }

  return { highlights, arrows };
}
