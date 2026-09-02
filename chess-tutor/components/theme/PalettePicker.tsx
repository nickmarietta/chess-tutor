"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { BOARD_THEMES, COLOR_SCHEMES, UI_ACCENTS } from "@/lib/theme/palette";

function BoardSwatch({ light, dark, size = 10 }: { light: string; dark: string; size?: number }) {
  return (
    <div
      className="grid overflow-hidden rounded-[2px]"
      style={{
        width: size,
        height: size,
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
      }}
    >
      <div style={{ backgroundColor: light }} />
      <div style={{ backgroundColor: dark }} />
      <div style={{ backgroundColor: dark }} />
      <div style={{ backgroundColor: light }} />
    </div>
  );
}

export function PalettePicker() {
  const { scheme, setScheme, accentId, setAccentId, accent, boardThemeId, setBoardThemeId, boardTheme } =
    useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Change theme"
        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition ${
          open
            ? "border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--accent-muted)] text-[var(--accent)]"
            : "border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <BoardSwatch light={boardTheme.light} dark={boardTheme.dark} />
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accent.hex }}
          />
        </span>
        Theme
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <PickerSection label="Color scheme">
            <div className="flex gap-1.5">
              {COLOR_SCHEMES.map((s) => {
                const selected = scheme === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScheme(s.id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-1 py-1.5 text-xs transition ${
                      selected
                        ? "border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--accent-muted)] font-medium text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-muted)]"
                    }`}
                  >
                    <span>{s.icon}</span>
                    {s.name}
                  </button>
                );
              })}
            </div>
          </PickerSection>

          <PickerSection label="Board">
            <div className="grid grid-cols-6 gap-2">
              {BOARD_THEMES.map((t) => {
                const selected = boardThemeId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBoardThemeId(t.id)}
                    title={t.name}
                    className="flex flex-col items-center gap-1"
                  >
                    <span
                      className="block rounded-[5px] p-[2px]"
                      style={{
                        outline: selected ? "2px solid var(--accent)" : "2px solid transparent",
                        outlineOffset: 1,
                      }}
                    >
                      <BoardSwatch light={t.light} dark={t.dark} size={22} />
                    </span>
                  </button>
                );
              })}
            </div>
          </PickerSection>

          <PickerSection label="Accent" last>
            <div className="grid grid-cols-6 gap-2">
              {UI_ACCENTS.map((a) => {
                const selected = accentId === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAccentId(a.id)}
                    title={a.name}
                    className="flex items-center justify-center"
                  >
                    <span
                      className="block h-[22px] w-[22px] rounded-full"
                      style={{
                        backgroundColor: a.hex,
                        outline: selected ? "2px solid var(--text)" : "2px solid transparent",
                        outlineOffset: 2,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </PickerSection>
        </div>
      )}
    </div>
  );
}

function PickerSection({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "" : "mb-4"}>
      <div className="mb-2 text-[0.6rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </div>
      {children}
    </div>
  );
}
