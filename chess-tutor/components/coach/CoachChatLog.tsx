"use client";

import { useEffect, useRef } from "react";
import type { HelpMode, Reflection } from "@/types";

export type ReflectionEntry = Reflection & {
  ply: number;
  moveSan: string | null;
};

export function formatMoveContext(ply: number, moveSan: string | null): string {
  if (ply === 0) return "Starting position";
  if (!moveSan) return `Ply ${ply}`;
  const moveNum = Math.ceil(ply / 2);
  return ply % 2 === 1 ? `${moveNum}. ${moveSan}` : `${moveNum}… ${moveSan}`;
}

const HELP_MODE_LABELS: Record<HelpMode, string> = {
  hint: "Hint",
  guide: "Guide",
  answer: "Answer",
};

type CoachChatLogProps = {
  entries: ReflectionEntry[];
  selectedPly: number;
  onSelectPly: (ply: number) => void;
};

export function CoachChatLog({
  entries,
  selectedPly,
  onSelectPly,
}: CoachChatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [sorted.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="border-b border-stone-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-stone-900">Coaching log</h3>
        <p className="text-xs text-stone-500">
          {sorted.length === 0
            ? "Your questions and coach replies appear here."
            : `${sorted.length} ${sorted.length === 1 ? "entry" : "entries"} · click to jump to that move`}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-stone-400">
            Select a move, describe your thinking, and get feedback. The log
            stays here as you review the game.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sorted.map((entry) => (
              <li key={entry.id}>
                <ChatEntry
                  entry={entry}
                  isActive={entry.ply === selectedPly}
                  onSelect={() => onSelectPly(entry.ply)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ChatEntry({
  entry,
  isActive,
  onSelect,
}: {
  entry: ReflectionEntry;
  isActive: boolean;
  onSelect: () => void;
}) {
  const moveLabel = formatMoveContext(entry.ply, entry.moveSan);
  const time = new Date(entry.created_at).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left transition ${
        isActive
          ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
          : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-stone-900 px-2 py-0.5 font-mono text-xs font-medium text-white">
          {moveLabel}
        </span>
        <span className="text-xs text-stone-400">
          {HELP_MODE_LABELS[entry.help_mode]} · {time}
        </span>
      </div>

      {entry.user_text.trim() && (
        <p className="mt-2 text-sm text-stone-800">
          <span className="font-medium text-stone-500">You: </span>
          {entry.user_text}
        </p>
      )}

      {entry.coach_response && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">
          <span className="font-medium text-amber-700">Coach: </span>
          {entry.coach_response}
        </p>
      )}
    </button>
  );
}
