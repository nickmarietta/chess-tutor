import { sideToMoveFromFen } from "@/lib/chess/moveAnnotations";

export type RawEngineScore = {
  value: number;
  type: "cp" | "mate";
};

export type NormalizedEngineScore = {
  /** Centipawns from White's perspective when scoreType is cp. */
  evalWhiteCp: number;
  /** Pawns from White's perspective when scoreType is cp (+ = White better). */
  evalWhitePawns: number;
  /** Signed full moves to mate from White's perspective when scoreType is mate. */
  mateIn: number | null;
  scoreType: "cp" | "mate";
  rawScore: RawEngineScore;
  sideToMove: "white" | "black";
  /** True when score was converted from side-to-move UCI convention. */
  convertedFromSideToMove: boolean;
};

/**
 * Normalize engine output to White's perspective.
 * @se-oss/stockfish passes through raw UCI scores (side-to-move positive),
 * so callers must set assumeWhitePositive=false.
 */
export function normalizeScoreToWhite(
  fen: string,
  raw: RawEngineScore,
  options: { assumeWhitePositive?: boolean } = {},
): NormalizedEngineScore {
  const assumeWhitePositive = options.assumeWhitePositive ?? true;
  const sideToMove = sideToMoveFromFen(fen);
  const stmIsWhite = sideToMove === "white";

  let whiteValue = raw.value;
  let convertedFromSideToMove = false;

  if (!assumeWhitePositive) {
    whiteValue = stmIsWhite ? raw.value : -raw.value;
    convertedFromSideToMove = true;
  }

  if (raw.type === "mate") {
    return {
      evalWhiteCp: 0,
      evalWhitePawns: 0,
      mateIn: whiteValue,
      scoreType: "mate",
      rawScore: raw,
      sideToMove,
      convertedFromSideToMove,
    };
  }

  const evalWhiteCp = whiteValue;
  return {
    evalWhiteCp,
    evalWhitePawns: evalWhiteCp / 100,
    mateIn: null,
    scoreType: "cp",
    rawScore: raw,
    sideToMove,
    convertedFromSideToMove,
  };
}

/** Value used by the eval bar: pawns for cp, signed mate distance for mate. */
export function barValueFromNormalized(score: NormalizedEngineScore): number {
  if (score.scoreType === "mate" && score.mateIn != null) {
    return score.mateIn;
  }
  return score.evalWhitePawns;
}
