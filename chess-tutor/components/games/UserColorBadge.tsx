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
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
        You played {label}
      </span>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
      <p className="font-medium">Which color did you play?</p>
      <div className="mt-2 flex gap-2">
        {(["white", "black"] as const).map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorSet?.(color)}
            className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold capitalize hover:bg-amber-100"
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
}
