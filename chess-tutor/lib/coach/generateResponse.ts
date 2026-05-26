import { buildCoachPrompt } from "./prompt";
import { createCoachProvider } from "./providers";
import type { CoachContext, CoachInput } from "./types";
import type { MoveHistoryEntry } from "@/lib/chess/describePosition";
import type { HelpMode } from "@/types";

export type { CoachContext, CoachInput, CoachPrompt } from "./types";
export { buildCoachPrompt } from "./prompt";

/**
 * Generates coaching feedback via the configured LLM provider.
 * Prompt content is provider-neutral; only transport differs per model.
 */
export async function generateCoachResponse(
  userText: string,
  helpMode: HelpMode,
  context: CoachContext,
  positions: MoveHistoryEntry[] = [],
  analysisMoves?: string[],
): Promise<string> {
  const input: CoachInput = {
    userText,
    helpMode,
    context,
    positions,
    analysisMoves,
  };
  const prompt = buildCoachPrompt(input);
  const provider = createCoachProvider();
  return provider.complete(prompt);
}
