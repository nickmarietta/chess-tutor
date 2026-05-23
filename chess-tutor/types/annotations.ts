/** Shared board annotation types for tutor explain feature */

export type HighlightType = "important" | "weakness" | "target" | "control";

export type ArrowType = "idea" | "threat" | "best";

export type BoardHighlight = {
  square: string;
  type: HighlightType;
};

export type BoardArrow = {
  from: string;
  to: string;
  type: ArrowType;
};

export type VariationMove = {
  san: string;
  fenAfter: string;
};

export type BoardAnnotations = {
  highlights: BoardHighlight[];
  arrows: BoardArrow[];
};

export type ExplainResponse = {
  explanation: string;
  highlights: BoardHighlight[];
  arrows: BoardArrow[];
  variation: VariationMove[];
};

export type EngineContext = {
  bestMoveSan: string | null;
  variation: VariationMove[];
  evalBefore: number | null;
  evalAfter: number | null;
};

export type ExplainRequest = {
  gameId: string;
  positionId: string;
  ply: number;
  helpMode?: "hint" | "guide" | "answer";
  userReflection?: string;
  /** Move to explain (defaults to move that reached this position) */
  selectedMoveSan?: string | null;
  /** Explain engine best move instead of the played move */
  explainBestMove?: boolean;
};
