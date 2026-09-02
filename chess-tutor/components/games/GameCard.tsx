import Link from "next/link";
import type { Game } from "@/types";

type GameCardProps = {
  game: Game;
};

function formatPlayers(game: Game) {
  const white = game.white_player ?? "White";
  const black = game.black_player ?? "Black";
  return `${white} vs ${black}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "Unknown date";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.id}`}
      className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--border-strong)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-semibold text-[var(--text)]">{formatPlayers(game)}</h2>
        <span className="rounded-full bg-[var(--surface-raised)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
          {game.source === "chess_com" ? "Chess.com" : "PGN"}
        </span>
      </div>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        {game.result ?? "—"} · {formatDate(game.played_at ?? game.created_at)}
        {game.user_color && (
          <span className="ml-2 text-[var(--text-subtle)]">
            · You: {game.user_color === "white" ? "White" : "Black"}
          </span>
        )}
      </p>
    </Link>
  );
}
