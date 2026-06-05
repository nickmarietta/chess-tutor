import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export default function HomePage() {
  return (
    <PageContainer>
      <section className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="text-3xl font-medium tracking-tight text-[var(--text)] sm:text-4xl">
          Review your chess games
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--text-muted)]">
          Import a game, step through the moves, and see Stockfish evaluation
          on every position.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/import"
            className="rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
          >
            Import a game
          </Link>
          <Link
            href="/games"
            className="rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface-hover)]"
          >
            Past games
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
