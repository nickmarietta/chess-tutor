import { GameCard } from "@/components/games/GameCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { listGames } from "@/lib/supabase/games";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  let games: Awaited<ReturnType<typeof listGames>> = [];
  let error: string | null = null;

  try {
    games = await listGames();
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load games.";
  }

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">My games</h1>
          <p className="mt-1 text-stone-600">
            Games you have imported for review and coaching.
          </p>
        </div>
        <Link
          href="/import"
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Import game
        </Link>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Database not configured</p>
          <p className="mt-1 text-amber-800">{error}</p>
          <p className="mt-2 text-amber-700">
            Add Supabase env vars and run the migration in{" "}
            <code className="rounded bg-amber-100 px-1">supabase/migrations</code>.
          </p>
        </div>
      )}

      {!error && games.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-stone-600">No games yet.</p>
          <Link
            href="/import"
            className="mt-4 inline-block text-sm font-semibold text-amber-700 hover:text-amber-800"
          >
            Import your first game →
          </Link>
        </div>
      )}

      {!error && games.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {games.map((game) => (
            <li key={game.id}>
              <GameCard game={game} />
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
