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

export type BoardAnnotations = {
  highlights: BoardHighlight[];
  arrows: BoardArrow[];
};
