import { GameReview } from "@/components/games/GameReview";
import { PageContainer } from "@/components/layout/PageContainer";
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
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not load game.";
  }

  if (error) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
        <Link href="/games" className="mt-4 inline-block text-sm text-amber-700">
          ← Back to games
        </Link>
      </PageContainer>
    );
  }

  if (!data) notFound();

  const { game, positions, reflections } = data;

  return (
    <PageContainer>
      <Link
        href="/games"
        className="mb-6 inline-block text-sm font-medium text-stone-500 hover:text-stone-800"
      >
        ← All games
      </Link>
      <GameReview game={game} positions={positions} reflections={reflections} />
    </PageContainer>
  );
}
