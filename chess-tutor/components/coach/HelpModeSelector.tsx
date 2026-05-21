"use client";

import type { HelpMode } from "@/types";

const MODES: { value: HelpMode; label: string; description: string }[] = [
  { value: "hint", label: "Hint", description: "Questions only — no best move" },
  { value: "guide", label: "Guide", description: "Structured coaching prompts" },
  { value: "answer", label: "Answer", description: "More direct feedback" },
];

type HelpModeSelectorProps = {
  value: HelpMode;
  onChange: (mode: HelpMode) => void;
};

export function HelpModeSelector({ value, onChange }: HelpModeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-stone-700">Help mode</span>
      <div className="grid gap-2 sm:grid-cols-3">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={`rounded-xl border px-3 py-3 text-left transition ${
              value === mode.value
                ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <span className="block text-sm font-semibold text-stone-900">
              {mode.label}
            </span>
            <span className="mt-0.5 block text-xs text-stone-500">
              {mode.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
