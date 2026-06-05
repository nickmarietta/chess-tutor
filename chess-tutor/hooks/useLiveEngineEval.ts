"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeFen } from "@/lib/chess/boardState";
import type { BoardChessState } from "@/lib/chess/boardState";
import type { EngineEvalApiResponse, LiveEngineEval } from "@/types/engineEval";

const DEV = process.env.NODE_ENV === "development";

function logEvalDebug(
  board: BoardChessState,
  evaluatedFen: string | null,
  payload: EngineEvalApiResponse | null,
  status: string,
) {
  if (!DEV) return;
  const row = {
    status,
    boardFen: board.fen,
    evaluatedFen,
    fenMatch:
      evaluatedFen != null && normalizeFen(board.fen) === normalizeFen(evaluatedFen),
    sideToMove: board.sideToMove,
    lastMoveSan: board.lastMoveSan,
    rawScore: payload?.rawScore ?? null,
    scoreType: payload?.scoreType ?? null,
    evalWhite:
      payload?.scoreType === "mate"
        ? payload.mateIn
        : payload?.evalWhitePawns ?? null,
    convertedFromSideToMove: payload?.convertedFromSideToMove ?? null,
  };
  console.log("[eval-bar]", row);
}

const emptyEval = (boardFen: string): LiveEngineEval => ({
  status: "idle",
  boardFen,
  evaluatedFen: null,
  sideToMove: null,
  lastMoveSan: null,
  rawScore: null,
  evalWhite: null,
  scoreType: null,
  convertedFromSideToMove: false,
  errorMessage: null,
});

/**
 * Live Stockfish eval for the exact board FEN. Never uses cached ply evals.
 */
export function useLiveEngineEval(board: BoardChessState): LiveEngineEval {
  const boardFen = board.fen;
  const normalizedBoardFen = useMemo(
    () => normalizeFen(boardFen),
    [boardFen],
  );
  const requestSeq = useRef(0);
  const [state, setState] = useState<LiveEngineEval>(() =>
    emptyEval(normalizedBoardFen),
  );

  useEffect(() => {
    const seq = ++requestSeq.current;
    setState({
      status: "loading",
      boardFen: normalizedBoardFen,
      evaluatedFen: null,
      sideToMove: board.sideToMove,
      lastMoveSan: board.lastMoveSan,
      rawScore: null,
      evalWhite: null,
      scoreType: null,
      convertedFromSideToMove: false,
      errorMessage: null,
    });

    logEvalDebug(board, null, null, "loading");

    const controller = new AbortController();

    void (async () => {
      try {
        const res = await fetch("/api/eval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fen: normalizedBoardFen }),
          signal: controller.signal,
        });

        if (seq !== requestSeq.current) return;

        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          setState({
            ...emptyEval(normalizedBoardFen),
            status: "error",
            sideToMove: board.sideToMove,
            lastMoveSan: board.lastMoveSan,
            errorMessage: err.error ?? "Engine evaluation failed",
          });
          logEvalDebug(board, null, null, "error");
          return;
        }

        const data = (await res.json()) as EngineEvalApiResponse & {
          evalWhite?: number;
        };
        const evaluatedFen = normalizeFen(data.fen);
        const currentFen = normalizeFen(board.fen);

        if (seq !== requestSeq.current) return;

        if (evaluatedFen !== normalizedBoardFen || evaluatedFen !== currentFen) {
          setState({
            ...emptyEval(normalizedBoardFen),
            status: "stale",
            sideToMove: board.sideToMove,
            lastMoveSan: board.lastMoveSan,
            errorMessage: "Eval FEN does not match board",
          });
          logEvalDebug(board, evaluatedFen, data, "stale-fen-mismatch");
          return;
        }

        const evalWhite =
          data.scoreType === "mate"
            ? (data.mateIn ?? data.evalWhite ?? 0)
            : (data.evalWhitePawns ?? data.evalWhite ?? 0);

        setState({
          status: "ready",
          boardFen: normalizedBoardFen,
          evaluatedFen,
          sideToMove: data.sideToMove,
          lastMoveSan: board.lastMoveSan,
          rawScore: data.rawScore,
          evalWhite,
          scoreType: data.scoreType,
          convertedFromSideToMove: data.convertedFromSideToMove,
          errorMessage: null,
        });

        logEvalDebug(board, evaluatedFen, data, "ready");
      } catch (e) {
        if (controller.signal.aborted || seq !== requestSeq.current) return;
        setState({
          ...emptyEval(normalizedBoardFen),
          status: "error",
          sideToMove: board.sideToMove,
          lastMoveSan: board.lastMoveSan,
          errorMessage: e instanceof Error ? e.message : "Eval request failed",
        });
        logEvalDebug(board, null, null, "error");
      }
    })();

    return () => {
      controller.abort();
    };
  }, [normalizedBoardFen, board.sideToMove, board.lastMoveSan, board.fen]);

  const fenMatches =
    state.evaluatedFen != null &&
    normalizeFen(state.evaluatedFen) === normalizedBoardFen;

  if (state.status === "ready" && !fenMatches) {
    return { ...state, status: "stale", evalWhite: null };
  }

  return state;
}

/** Eval safe to render: only when FEN matches and engine returned a score. */
export function displayableEval(
  board: BoardChessState,
  live: LiveEngineEval,
): Pick<LiveEngineEval, "evalWhite" | "scoreType" | "status"> {
  const boardFen = normalizeFen(board.fen);
  const matches =
    live.status === "ready" &&
    live.evaluatedFen != null &&
    normalizeFen(live.evaluatedFen) === boardFen;

  if (!matches) {
    return {
      status: live.status === "loading" ? "loading" : live.status,
      evalWhite: null,
      scoreType: null,
    };
  }

  return {
    status: "ready",
    evalWhite: live.evalWhite,
    scoreType: live.scoreType,
  };
}
