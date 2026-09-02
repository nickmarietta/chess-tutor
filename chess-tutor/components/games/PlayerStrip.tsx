type PlayerStripProps = {
  name: string;
  color: "white" | "black";
  isUser: boolean;
  result: "win" | "loss" | "draw" | null;
};

/** Derives a side's outcome from a PGN result string ("1-0", "0-1", "1/2-1/2"). */
export function resultForColor(
  pgnResult: string | null | undefined,
  color: "white" | "black",
): "win" | "loss" | "draw" | null {
  if (!pgnResult) return null;
  if (pgnResult === "1/2-1/2") return "draw";
  if (pgnResult === "1-0") return color === "white" ? "win" : "loss";
  if (pgnResult === "0-1") return color === "black" ? "win" : "loss";
  return null;
}

export function PlayerStrip({ name, color, isUser, result }: PlayerStripProps) {
  const pieceSymbol = color === "white" ? "♙" : "♟";
  const scoreLabel = result === "win" ? "1" : result === "draw" ? "½" : result === "loss" ? "0" : "—";
  const scoreColor =
    result === "win" ? "#4ade80" : result === "draw" ? "#fbbf24" : "var(--text-subtle)";

  return (
    <div className="flex items-center gap-2.5 px-1 py-1.5">
      <span
        className="text-[1.15rem] leading-none"
        style={{
          color: color === "white" ? "#fffef5" : "#1a0e00",
          textShadow:
            color === "white"
              ? "-1px -1px 0 #888, 1px -1px 0 #888, -1px 1px 0 #888, 1px 1px 0 #888"
              : "-1px -1px 0 rgba(255,255,255,0.3), 1px -1px 0 rgba(255,255,255,0.3), -1px 1px 0 rgba(255,255,255,0.3), 1px 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        {pieceSymbol}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-[var(--text)]">{name}</span>
          {isUser && (
            <span className="rounded bg-[var(--accent-muted)] px-[5px] py-px text-[0.58rem] font-bold uppercase tracking-wide text-[var(--accent)]">
              You
            </span>
          )}
        </div>
        <div className="mt-px text-[0.68rem] text-[var(--text-muted)]">
          {color === "white" ? "White" : "Black"}
        </div>
      </div>
      <div className="font-mono text-[0.7rem] font-bold" style={{ color: scoreColor }}>
        {scoreLabel}
      </div>
    </div>
  );
}
