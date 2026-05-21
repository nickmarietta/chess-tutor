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
      className="block rounded-xl border border-stone-200 bg-white p-4 transition hover:border-amber-300 hover:shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-semibold text-stone-900">{formatPlayers(game)}</h2>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
          {game.source === "chess_com" ? "Chess.com" : "PGN"}
        </span>
      </div>
      <p className="mt-1 text-sm text-stone-500">
        {game.result ?? "—"} · {formatDate(game.played_at ?? game.created_at)}
      </p>
    </Link>
  );
}
