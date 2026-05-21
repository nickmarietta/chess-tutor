import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export default function HomePage() {
  return (
    <PageContainer>
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
          AI chess tutor · v1
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Learn chess by explaining your thinking
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-stone-600">
          Import a game from Chess.com or paste a PGN, step through the moves,
          and describe what you were thinking at critical moments. Your coach
          responds with hints and guidance — not just engine lines.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/import"
            className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            Import a game
          </Link>
          <Link
            href="/games"
            className="rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
          >
            View my games
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
        {[
          {
            title: "Import",
            body: "Paste any PGN or pull public games from Chess.com via their PubAPI — no scraping.",
          },
          {
            title: "Review",
            body: "Browse moves on an analysis board and pause at the positions that matter to you.",
          },
          {
            title: "Reflect",
            body: "Write what you were thinking. Choose hint, guide, or answer mode for coaching feedback.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-stone-200 bg-white p-6 text-left shadow-sm"
          >
            <h2 className="font-semibold text-stone-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.body}</p>
          </div>
        ))}
      </section>
    </PageContainer>
  );
}
