import type { MoveAnalysis } from "@/types";

export type MistakeCounts = { blunders: number; mistakes: number; inaccuracies: number };

export function countMistakes(analyses: MoveAnalysis[]): MistakeCounts {
  return analyses.reduce(
    (acc, a) => {
      if (a.mistake_severity === "blunder") acc.blunders++;
      else if (a.mistake_severity === "mistake") acc.mistakes++;
      else if (a.mistake_severity === "inaccuracy") acc.inaccuracies++;
      return acc;
    },
    { blunders: 0, mistakes: 0, inaccuracies: 0 },
  );
}
