import type { CoachPrompt, CoachProvider } from "../types";

export function createMockProvider(model = "mock"): CoachProvider {
  return {
    id: "mock",
    model,
    async complete(prompt: CoachPrompt): Promise<string> {
      return [
        "_Mock provider — set `COACH_PROVIDER=gemini` and `GEMINI_API_KEY` for live coaching._",
        "",
        "**Would have sent to model:**",
        "",
        "### System",
        prompt.system.slice(0, 280) + (prompt.system.length > 280 ? "…" : ""),
        "",
        "### User",
        prompt.user,
      ].join("\n");
    },
  };
}
