import { ChessComImport } from "@/components/import/ChessComImport";
import { PgnPasteForm } from "@/components/import/PgnPasteForm";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ImportPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-[var(--text)]">Import a game</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Start with a pasted PGN, or import from a public Chess.com username.
        </p>

        <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Paste PGN</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Works with any standard PGN — from Chess.com, Lichess exports, or databases.
          </p>
          <div className="mt-6">
            <PgnPasteForm />
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text)]">Chess.com import</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Uses the public Chess.com PubAPI only. No scraping.
          </p>
          <div className="mt-6">
            <ChessComImport />
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
