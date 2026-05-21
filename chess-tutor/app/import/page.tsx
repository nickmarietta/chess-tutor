import { ChessComImport } from "@/components/import/ChessComImport";
import { PgnPasteForm } from "@/components/import/PgnPasteForm";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ImportPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-stone-900">Import a game</h1>
        <p className="mt-2 text-stone-600">
          Start with a pasted PGN, or import from a public Chess.com username.
        </p>

        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Paste PGN</h2>
          <p className="mt-1 text-sm text-stone-500">
            Works with any standard PGN — from Chess.com, Lichess exports, or databases.
          </p>
          <div className="mt-6">
            <PgnPasteForm />
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Chess.com import</h2>
          <p className="mt-1 text-sm text-stone-500">
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
