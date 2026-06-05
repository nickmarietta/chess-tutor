/** Side to move from a FEN string. */
export function sideToMoveFromFen(fen: string): "white" | "black" {
  return fen.trim().split(/\s+/)[1] === "b" ? "black" : "white";
}
