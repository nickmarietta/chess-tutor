"use client";

import { useEffect, useRef } from "react";
import type { HelpMode } from "@/types";
import type { ChatEntry } from "@/types/coach";

const HELP_MODE_LABELS: Record<HelpMode, string> = {
  hint: "Hint",
  guide: "Guide",
  answer: "Answer",
};

type CoachChatLogProps = {
  entries: ChatEntry[];
  activeLabel: string;
  onSelectEntry: (entry: ChatEntry) => void;
};

export function CoachChatLog({
  entries,
  activeLabel,
  onSelectEntry,
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
            ? "Drag pieces to try moves, then ask your coach about ideas."
            : `${sorted.length} ${sorted.length === 1 ? "entry" : "entries"} · click to revisit`}
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-stone-400">
            Make moves on the board to explore lines, then ask questions about
            plans and candidates. Your conversation stays here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sorted.map((entry) => (
              <li key={entry.id}>
                <ChatEntry
                  entry={entry}
                  isActive={entry.label === activeLabel}
                  onSelect={() => onSelectEntry(entry)}
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
  entry: ChatEntry;
  isActive: boolean;
  onSelect: () => void;
}) {
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
        <span
          className={`rounded-md px-2 py-0.5 font-mono text-xs font-medium ${
            entry.isAnalysis
              ? "bg-violet-700 text-white"
              : "bg-stone-900 text-white"
          }`}
        >
          {entry.label}
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

/** @deprecated use ChatEntry label field */
export function formatMoveContext(ply: number, moveSan: string | null): string {
  if (ply === 0) return "Starting position";
  if (!moveSan) return `Ply ${ply}`;
  const moveNum = Math.ceil(ply / 2);
  return ply % 2 === 1 ? `${moveNum}. ${moveSan}` : `${moveNum}… ${moveSan}`;
}

export type { ChatEntry };
