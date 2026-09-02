"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

type TutorExplainProps = {
  gameId: string;
  positionId: string | null;
};

type Status = "idle" | "loading" | "streaming" | "done" | "error";

export function TutorExplain({ gameId, positionId }: TutorExplainProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function explain() {
    if (!positionId) return;
    setStatus("loading");
    setText("");
    setError(null);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, positionId, helpMode: "answer" }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Could not get an explanation.");
        setStatus("error");
        return;
      }

      setStatus("streaming");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }

      setStatus("done");
    } catch {
      setError("Could not reach the tutor.");
      setStatus("error");
    }
  }

  return (
    <div>
      <SectionLabel>Explain This Move</SectionLabel>
      <div className="mt-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5">
        {status === "idle" && (
          <button
            type="button"
            onClick={explain}
            disabled={!positionId}
            className="w-full rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Explain this move
          </button>
        )}

        {status === "loading" && (
          <p className="text-sm text-[var(--text-muted)]">Thinking…</p>
        )}

        {status === "error" && (
          <p className="text-sm text-[var(--text-muted)]">{error}</p>
        )}

        {(status === "streaming" || status === "done") && (
          <p className="text-sm leading-relaxed text-[var(--text)]">
            {text}
            {status === "streaming" && (
              <span className="ml-0.5 animate-pulse text-[var(--text-muted)]">▍</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
