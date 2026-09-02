import { Chess, type Square } from "chess.js";
import { isAnalysisEnabled } from "@/lib/config/featureFlags";
import { sideToMoveFromFen } from "@/lib/chess/moveAnnotations";
import { sanToUci } from "@/lib/chess/uci";
import { analyzePositionWithStockfish } from "@/lib/engine/stockfish";
import {
  replaceMoveAnalyses,
  updateGameAnalysisState,
  upsertUserMistakeStats,
} from "@/lib/supabase/analysis";
import { getGameById } from "@/lib/supabase/games";
import type {
  Game,
  MistakeSeverity,
  MistakeTag,
  MoveAnalysis,
  Position,
  UserColor,
} from "@/types";

type MaterialCount = Record<UserColor, number>;

const PIECE_VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
} as const;

const ANALYSIS_DEPTH = 10;
const ANALYSIS_MULTIPV = 3;

function toMoverPerspective(value: number | null, sideToMove: UserColor) {
  if (value === null) return null;
  return sideToMove === "white" ? value : -value;
}

function roundEval(value: number | null) {
  if (value === null || Number.isNaN(value)) return null;
  return Number(value.toFixed(2));
}

function materialCount(fen: string): MaterialCount {
  const chess = new Chess(fen);
  const counts: MaterialCount = { white: 0, black: 0 };

  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece) continue;
      counts[piece.color === "w" ? "white" : "black"] += PIECE_VALUES[piece.type];
    }
  }

  return counts;
}

function undevelopedMinorPieces(fen: string, color: UserColor) {
  const chess = new Chess(fen);
  const starts: Square[] =
    color === "white"
      ? ["b1", "g1", "c1", "f1"]
      : ["b8", "g8", "c8", "f8"];

  return starts.reduce((count, square) => {
    const piece = chess.get(square);
    if (!piece) return count;
    if ((piece.color === "w" ? "white" : "black") !== color) return count;
    return piece.type === "n" || piece.type === "b" ? count + 1 : count;
  }, 0);
}

function describePhase(ply: number) {
  if (ply <= 12) return "opening";
  if (ply <= 40) return "middlegame";
  return "endgame";
}

function getImmediateThreats(fen: string) {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  const checks = moves.filter((move) => move.san.includes("+") || move.san.includes("#"));
  const captures = moves.filter((move) => !!move.captured);

  return {
    hasCheck: checks.length > 0,
    strongestCapture:
      captures
        .map((move) => PIECE_VALUES[move.captured!])
        .sort((a, b) => b - a)[0] ?? 0,
  };
}

function classifySeverity(evalSwing: number | null): MistakeSeverity {
  const drop = evalSwing === null ? 0 : -evalSwing;
  if (drop >= 2.5) return "blunder";
  if (drop >= 1.2) return "mistake";
  if (drop >= 0.5) return "inaccuracy";
  return "none";
}

function classifyMistakeTags(input: {
  fenBefore: string;
  fenAfter: string;
  ply: number;
  moveSan: string | null;
  bestMoveSan: string | null;
  sideToMove: UserColor;
  evalSwing: number | null;
  materialBefore: MaterialCount;
  materialAfter: MaterialCount;
}): MistakeTag[] {
  const tags = new Set<MistakeTag>();
  const drop = input.evalSwing === null ? 0 : -input.evalSwing;
  if (!input.moveSan) return [];

  const before = new Chess(input.fenBefore);
  let move:
    | ReturnType<Chess["move"]>
    | null = null;

  try {
    move = before.move(input.moveSan, { strict: false });
  } catch {
    move = null;
  }

  const opponentThreats = getImmediateThreats(input.fenAfter);
  const movingSideMaterialBefore = input.materialBefore[input.sideToMove];
  const movingSideMaterialAfter = input.materialAfter[input.sideToMove];
  const materialLoss = movingSideMaterialAfter - movingSideMaterialBefore;
  const phase = describePhase(input.ply);
  const undeveloped = undevelopedMinorPieces(input.fenBefore, input.sideToMove);
  const movedPiece = move?.piece ?? null;
  const isFlankPawnPush =
    movedPiece === "p" && ["a", "b", "g", "h"].includes(move?.from[0] ?? "");

  if (drop >= 1.2 && input.bestMoveSan && /[x+#]/.test(input.bestMoveSan)) {
    tags.add("missed_tactic");
  }

  if (drop >= 1 && opponentThreats.strongestCapture >= 3) {
    tags.add("hanging_piece");
    tags.add("ignored_opponent_threat");
  }

  if (input.moveSan.includes("x") && (materialLoss <= -1 || drop >= 1)) {
    tags.add("bad_trade");
  }

  if (
    movedPiece &&
    ["n", "b", "r", "q"].includes(movedPiece) &&
    drop >= 0.5 &&
    move &&
    (["a", "h"].includes(move.to[0]) ||
      (input.sideToMove === "white" ? move.to[1] === "1" : move.to[1] === "8"))
  ) {
    tags.add("poor_piece_activity");
  }

  if (
    drop >= 0.7 &&
    opponentThreats.hasCheck &&
    !input.moveSan.includes("+") &&
    !input.moveSan.includes("x")
  ) {
    tags.add("ignored_opponent_threat");
  }

  if (
    phase === "opening" &&
    drop >= 0.5 &&
    ((movedPiece === "q" && undeveloped >= 2) ||
      (movedPiece === "r" && undeveloped >= 2) ||
      isFlankPawnPush)
  ) {
    tags.add("opening_principle_violation");
  }

  if (
    drop >= 0.7 &&
    phase !== "endgame" &&
    ((movedPiece === "k" && input.moveSan !== "O-O" && input.moveSan !== "O-O-O") ||
      (movedPiece === "p" && ["f", "g", "h"].includes(move?.from[0] ?? "")))
  ) {
    tags.add("weak_king_safety");
  }

  if (
    phase !== "endgame" &&
    drop >= 0.7 &&
    (movedPiece === "q" || movedPiece === "r") &&
    (input.moveSan.includes("+") || input.moveSan.includes("x") || isFlankPawnPush) &&
    undeveloped >= 2
  ) {
    tags.add("premature_attack");
  }

  if (
    drop >= 0.6 &&
    move &&
    ["n", "b", "r", "q", "k"].includes(move.piece) &&
    (input.sideToMove === "white" ? move.to[1] < move.from[1] : move.to[1] > move.from[1])
  ) {
    tags.add("passive_defense");
  }

  return [...tags];
}

function isCriticalMove(input: {
  evalSwing: number | null;
  mistakeSeverity: MistakeSeverity;
  materialBefore: MaterialCount;
  materialAfter: MaterialCount;
  sideToMove: UserColor;
}) {
  const drop = input.evalSwing === null ? 0 : -input.evalSwing;
  const materialDelta =
    input.materialAfter[input.sideToMove] - input.materialBefore[input.sideToMove];

  return (
    drop >= 1.2 ||
    input.mistakeSeverity === "mistake" ||
    input.mistakeSeverity === "blunder" ||
    materialDelta <= -2
  );
}

async function analyzeFen(fen: string) {
  return analyzePositionWithStockfish(fen, {
    depth: ANALYSIS_DEPTH,
    multiPv: ANALYSIS_MULTIPV,
  });
}

async function analyzePositions(
  game: Game,
  positions: Position[],
): Promise<Omit<MoveAnalysis, "id" | "created_at">[]> {
  const analyses: Omit<MoveAnalysis, "id" | "created_at">[] = [];

  for (let index = 1; index < positions.length; index += 1) {
    const current = positions[index];
    const previous = positions[index - 1];
    if (!current || !previous) continue;

    const fenBefore = previous.fen;
    const fenAfter = current.fen;
    const sideToMove = sideToMoveFromFen(fenBefore);
    const [beforeEngine, afterEngine] = await Promise.all([
      analyzeFen(fenBefore),
      analyzeFen(fenAfter),
    ]);

    const evalBefore = roundEval(beforeEngine.eval);
    const evalAfter = roundEval(afterEngine.eval);
    const moverBefore = toMoverPerspective(evalBefore, sideToMove);
    const moverAfter = toMoverPerspective(evalAfter, sideToMove);
    const evalSwing =
      moverBefore === null || moverAfter === null
        ? null
        : roundEval(moverAfter - moverBefore);

    const beforeMaterial = materialCount(fenBefore);
    const afterMaterial = materialCount(fenAfter);
    const mistakeSeverity = classifySeverity(evalSwing);
    const mistakeTags = classifyMistakeTags({
      fenBefore,
      fenAfter,
      ply: current.ply,
      moveSan: current.move_san,
      bestMoveSan: beforeEngine.bestMoveSan,
      sideToMove,
      evalSwing,
      materialBefore: beforeMaterial,
      materialAfter: afterMaterial,
    });

    analyses.push({
      game_id: game.id,
      position_id: current.id,
      ply: current.ply,
      fen_before: fenBefore,
      fen_after: fenAfter,
      move_played_san: current.move_san,
      move_played_uci: sanToUci(fenBefore, current.move_san),
      user_color: game.user_color,
      side_to_move: sideToMove,
      eval_before: evalBefore,
      eval_after: evalAfter,
      eval_swing: evalSwing,
      best_move_san: beforeEngine.bestMoveSan,
      best_move_uci: beforeEngine.bestMoveUci,
      engine_line: beforeEngine.engineLine,
      candidate_moves: beforeEngine.candidateMoves,
      mistake_severity: mistakeSeverity,
      mistake_tags: mistakeTags,
      is_critical: isCriticalMove({
        evalSwing,
        mistakeSeverity,
        materialBefore: beforeMaterial,
        materialAfter: afterMaterial,
        sideToMove,
      }),
    });
  }

  return analyses;
}

async function updateMistakeStats(game: Game, analyses: MoveAnalysis[]) {
  const relevant = game.user_color
    ? analyses.filter((analysis) => analysis.side_to_move === game.user_color)
    : analyses;

  const subject = {
    userId: game.user_id,
    playerKey: game.player_username,
  };

  if (!subject.userId && !subject.playerKey) return;

  const counts = new Map<MistakeTag, number>();
  for (const analysis of relevant) {
    for (const tag of analysis.mistake_tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  await upsertUserMistakeStats(
    [...counts.entries()].map(([mistakeTag, count]) => ({
      userId: subject.userId,
      playerKey: subject.playerKey,
      mistakeTag,
      count,
      lastSeenAt: new Date().toISOString(),
    })),
  );
}

export async function analyzeGameNow(gameId: string) {
  const data = await getGameById(gameId);
  if (!data) {
    throw new Error("Game not found.");
  }

  if (!isAnalysisEnabled()) {
    return data;
  }

  const expectedMoves = Math.max(0, data.positions.length - 1);
  if (
    data.game.analysis_status === "completed" &&
    data.analyses.length === expectedMoves
  ) {
    return data;
  }

  await updateGameAnalysisState(gameId, "analyzing");

  try {
    const analyses = await analyzePositions(data.game, data.positions);
    const stored = await replaceMoveAnalyses(gameId, analyses);
    await updateMistakeStats(data.game, stored);
    await updateGameAnalysisState(gameId, "completed");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Game analysis failed.";
    await updateGameAnalysisState(gameId, "failed", message);
    throw error;
  }

  const refreshed = await getGameById(gameId);
  if (!refreshed) {
    throw new Error("Game disappeared after analysis.");
  }

  return refreshed;
}

export async function ensureGameAnalysis(gameId: string) {
  return analyzeGameNow(gameId);
}
