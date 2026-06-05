import { GameReview } from "@/components/games/GameReview";
import { ensureGameAnalysis } from "@/lib/analysis/service";
import { getGameById } from "@/lib/supabase/games";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function GameReviewPage({ params }: PageProps) {
  const { gameId } = await params;

  let data: Awaited<ReturnType<typeof getGameById>> = null;
  let error: string | null = null;

  try {
    data = await getGameById(gameId);
    if (
      data &&
      (data.game.analysis_status !== "completed" ||
        data.analyses.length !== Math.max(0, data.positions.length - 1))
    ) {
      data = await ensureGameAnalysis(gameId);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load game.";
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
        <Link
          href="/games"
          className="mt-4 inline-block text-sm text-[var(--text-muted)]"
        >
          ← All games
        </Link>
      </div>
    );
  }

  if (!data) notFound();

  const { game, positions, analyses } = data;

  return (
    <GameReview game={game} positions={positions} analyses={analyses} />
  );
}
