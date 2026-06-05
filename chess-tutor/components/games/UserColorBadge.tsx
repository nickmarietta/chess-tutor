"use client";

import type { Game, UserColor } from "@/types";

type UserColorBadgeProps = {
  game: Game;
  onColorSet?: (color: UserColor) => void;
};

export function UserColorBadge({ game, onColorSet }: UserColorBadgeProps) {
  if (game.user_color) {
    const label = game.user_color === "white" ? "White" : "Black";
    return (
      <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs text-[var(--text-muted)]">
        You played {label}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[var(--text-muted)]">You played</span>
      {(["white", "black"] as const).map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onColorSet?.(color)}
          className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs capitalize text-[var(--text)] hover:bg-[var(--surface-hover)]"
        >
          {color}
        </button>
      ))}
    </div>
  );
}
