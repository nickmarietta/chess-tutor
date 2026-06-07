import { StockfishPool, type StockfishAnalysis } from "@se-oss/stockfish";
import { buildEngineLineFromPv, uciToSan } from "@/lib/chess/uci";
import {
  barValueFromNormalized,
  normalizeScoreToWhite,
  type NormalizedEngineScore,
  type RawEngineScore,
} from "@/lib/engine/normalizeScore";
import type { CandidateMove, EngineLineMove } from "@/types";

type EngineScoreType = "cp" | "mate" | null;

export type PositionEngineAnalysis = {
  bestMoveUci: string | null;
  bestMoveSan: string | null;
  normalized: NormalizedEngineScore;
  /** White POV bar value: pawns (cp) or signed mate moves (mate). */
  eval: number | null;
  scoreType: EngineScoreType;
  engineLine: EngineLineMove[];
  candidateMoves: CandidateMove[];
};

type AnalyzePositionOptions = {
  depth?: number;
  multiPv?: number;
};

declare global {
  var __chessTutorStockfishPoolPromise: Promise<StockfishPool> | undefined;
}

function rawScoreFromLine(
  score: StockfishAnalysis["lines"][number]["score"] | undefined,
): RawEngineScore | null {
  if (!score) return null;
  return { value: score.value, type: score.type };
}

async function getPool(): Promise<StockfishPool> {
  if (!globalThis.__chessTutorStockfishPoolPromise) {
    globalThis.__chessTutorStockfishPoolPromise = (async () => {
      const pool = new StockfishPool(1);
      await pool.initialize();
      return pool;
    })().catch((error) => {
      globalThis.__chessTutorStockfishPoolPromise = undefined;
      throw error;
    });
  }

  return globalThis.__chessTutorStockfishPoolPromise;
}

export async function analyzePositionWithStockfish(
  fen: string,
  options: AnalyzePositionOptions = {},
): Promise<PositionEngineAnalysis> {
  const depth = options.depth ?? 10;
  const multiPv = options.multiPv ?? 3;
  const pool = await getPool();
  const engine = await pool.acquire();

  try {
    const analysis = await engine.analyze(fen, depth, multiPv);
    const primaryLine = analysis.lines[0];
    const raw = rawScoreFromLine(primaryLine?.score);
    if (!raw) {
      throw new Error("Stockfish returned no score for position");
    }
    // @se-oss/stockfish passes through raw UCI scores (side-to-move positive),
    // so we must flip the sign when it is Black's turn.
    const normalized = normalizeScoreToWhite(fen, raw, {
      assumeWhitePositive: false,
    });

    return {
      bestMoveUci: analysis.bestmove ?? null,
      bestMoveSan: uciToSan(fen, analysis.bestmove ?? null),
      normalized,
      eval: barValueFromNormalized(normalized),
      scoreType: normalized.scoreType,
      engineLine: buildEngineLineFromPv(fen, primaryLine?.pv, 5),
      candidateMoves: analysis.lines.slice(0, multiPv).map((line) => {
        const uci = line.pv.split(/\s+/)[0] ?? null;
        const lineRaw = rawScoreFromLine(line.score);
        const lineNorm = lineRaw
          ? normalizeScoreToWhite(fen, lineRaw, { assumeWhitePositive: false })
          : null;
        return {
          san: uciToSan(fen, uci),
          uci,
          score: lineNorm ? barValueFromNormalized(lineNorm) : null,
          scoreType: lineNorm?.scoreType ?? null,
        };
      }),
    };
  } finally {
    pool.release(engine);
  }
}
