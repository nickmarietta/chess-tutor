export type EngineEvalApiResponse = {
  fen: string;
  sideToMove: "white" | "black";
  rawScore: { value: number; type: "cp" | "mate" };
  evalWhitePawns: number;
  mateIn: number | null;
  scoreType: "cp" | "mate";
  convertedFromSideToMove: boolean;
  error?: string;
};

export type EngineEvalStatus = "idle" | "loading" | "ready" | "error" | "stale";

export type LiveEngineEval = {
  status: EngineEvalStatus;
  boardFen: string;
  evaluatedFen: string | null;
  sideToMove: "white" | "black" | null;
  lastMoveSan: string | null;
  rawScore: { value: number; type: "cp" | "mate" } | null;
  evalWhite: number | null;
  scoreType: "cp" | "mate" | null;
  convertedFromSideToMove: boolean;
  errorMessage: string | null;
};
