"use client";

import { useEffect, useState } from "react";
import {
  getStoredPlayerUsername,
  setStoredPlayerUsername,
} from "@/lib/user/playerUsername";

type PlayerUsernameFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
};

export function PlayerUsernameField({
  id = "player-username",
  value,
  onChange,
  hint = "Used to detect which color you played in imported games.",
}: PlayerUsernameFieldProps) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && !value) {
      const stored = getStoredPlayerUsername();
      if (stored) onChange(stored);
    }
    setInitialized(true);
  }, [initialized, onChange, value]);

  function handleChange(next: string) {
    onChange(next);
    setStoredPlayerUsername(next);
  }

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-stone-700">
        Your Chess.com username or PGN name
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="e.g. bloodbro23"
        className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
      />
      <p className="mt-1 text-xs text-stone-500">{hint}</p>
    </div>
  );
}
