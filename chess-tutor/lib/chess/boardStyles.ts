import type { CSSProperties } from "react";
import type {
  ArrowType,
  BoardAnnotations,
  HighlightType,
} from "@/types/annotations";

type ChessboardArrow = {
  startSquare: string;
  endSquare: string;
  color: string;
};

export type BoardAnnotationsProps = {
  highlights?: BoardAnnotations["highlights"];
  arrows?: BoardAnnotations["arrows"];
};

const HIGHLIGHT_STYLES: Record<HighlightType, CSSProperties> = {
  important: { backgroundColor: "rgba(251, 191, 36, 0.55)" },
  weakness: { backgroundColor: "rgba(248, 113, 113, 0.5)" },
  target: { backgroundColor: "rgba(74, 222, 128, 0.45)" },
  control: { backgroundColor: "rgba(96, 165, 250, 0.35)" },
};

const ARROW_COLORS: Record<ArrowType, string> = {
  idea: "rgba(217, 119, 6, 0.9)",
  threat: "rgba(220, 38, 38, 0.9)",
  best: "rgba(22, 163, 74, 0.9)",
};

export function annotationsToSquareStyles(
  highlights: BoardAnnotationsProps["highlights"],
): Record<string, CSSProperties> {
  if (!highlights?.length) return {};
  const styles: Record<string, CSSProperties> = {};
  for (const h of highlights) {
    styles[h.square] = {
      ...styles[h.square],
      ...HIGHLIGHT_STYLES[h.type],
    };
  }
  return styles;
}

export function annotationsToArrows(
  arrows: BoardAnnotationsProps["arrows"],
): ChessboardArrow[] {
  if (!arrows?.length) return [];
  return arrows.map((a) => ({
    startSquare: a.from,
    endSquare: a.to,
    color: ARROW_COLORS[a.type],
  }));
}
