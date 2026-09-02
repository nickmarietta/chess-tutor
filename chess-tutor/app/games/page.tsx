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
          <h1 className="text-3xl font-bold text-[var(--text)]">My games</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Games you have imported for review.
          </p>
        </div>
        <Link
          href="/import"
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] transition hover:opacity-90"
        >
          Import game
        </Link>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
          <p className="font-medium text-[var(--text)]">Database not configured</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-[var(--text-subtle)]">
            Add Supabase env vars and run the migration in{" "}
            <code className="rounded bg-[var(--surface-hover)] px-1">supabase/migrations</code>.
          </p>
        </div>
      )}

      {!error && games.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-[var(--text-muted)]">No games yet.</p>
          <Link
            href="/import"
            className="mt-4 inline-block text-sm font-semibold text-[var(--text)] hover:text-[var(--text-muted)]"
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
