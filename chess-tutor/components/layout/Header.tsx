import Link from "next/link";
import { PalettePicker } from "@/components/theme/PalettePicker";

const nav = [
  { href: "/import", label: "Import" },
  { href: "/games", label: "Games" },
];

export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg leading-none text-[var(--accent)]">♟</span>
          <span className="text-sm font-bold tracking-tight text-[var(--text)]">
            Chess Tutor
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          ))}
          <PalettePicker />
        </div>
      </div>
    </header>
  );
}
