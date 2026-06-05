/** Winning chances in [-1, 1]; +1 = white winning. (Lichess algorithm) */
export type WhiteWinningChances = number;

const WIN_CHANCE_MULTIPLIER = -0.00368208;

function rawWinningChances(cp: number): WhiteWinningChances {
  return 2 / (1 + Math.exp(WIN_CHANCE_MULTIPLIER * cp)) - 1;
}

function cpWinningChances(cp: number): WhiteWinningChances {
  return rawWinningChances(Math.min(Math.max(-1000, cp), 1000));
}

function mateWinningChances(mate: number): WhiteWinningChances {
  const cp = (21 - Math.min(10, Math.abs(mate))) * 100;
  const signed = cp * (mate > 0 ? 1 : -1);
  return rawWinningChances(signed);
}

/** evalWhite: pawns (cp) or signed mate moves (mate), always from White's perspective. */
export function evalToWhiteWinningChances(
  evalWhite: number | null,
  scoreType: "cp" | "mate" | null = "cp",
): WhiteWinningChances {
  if (evalWhite === null || Number.isNaN(evalWhite)) return 0;

  if (scoreType === "mate") {
    return mateWinningChances(Math.round(evalWhite));
  }

  return cpWinningChances(Math.round(evalWhite * 100));
}

export function winningChancesToWhiteRatio(chances: WhiteWinningChances): number {
  return (chances + 1) / 2;
}

export function formatEvalLabel(
  evalWhite: number | null,
  scoreType: "cp" | "mate" | null = "cp",
): string {
  if (evalWhite === null || Number.isNaN(evalWhite)) return "—";

  if (scoreType === "mate") {
    const mate = Math.round(evalWhite);
    return mate > 0 ? `#${mate}` : `#${mate}`;
  }

  const rounded =
    Math.abs(evalWhite) >= 10 ? evalWhite.toFixed(0) : evalWhite.toFixed(1);
  return `${evalWhite > 0 ? "+" : ""}${rounded}`;
}

export function formatEvalStatusLabel(
  status: "idle" | "loading" | "ready" | "error" | "stale",
): string {
  switch (status) {
    case "loading":
      return "…";
    case "error":
    case "stale":
      return "—";
    default:
      return "—";
  }
}
