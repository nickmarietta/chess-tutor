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
  /** DB position when on the imported game line */
  positionId?: string;
  /** Current board FEN — required for analysis mode */
  fen?: string;
  fenBefore?: string | null;
  ply?: number;
  helpMode?: "hint" | "guide" | "answer";
  userReflection?: string;
  selectedMoveSan?: string | null;
  explainBestMove?: boolean;
  isAnalysis?: boolean;
  analysisMoves?: string[];
};
