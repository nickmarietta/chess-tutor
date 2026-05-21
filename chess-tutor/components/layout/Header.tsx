import Link from "next/link";

const nav = [
  { href: "/import", label: "Import" },
  { href: "/games", label: "My games" },
];

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-sm text-white">
            ♞
          </span>
          Chess Tutor
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
