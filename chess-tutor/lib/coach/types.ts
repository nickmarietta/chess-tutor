import type { HelpMode, UserColor } from "@/types";
import type { MoveHistoryEntry } from "@/lib/chess/describePosition";

export type CoachContext = {
  fen: string;
  moveSan: string | null;
  ply: number;
  whitePlayer: string | null;
  blackPlayer: string | null;
  playerUsername: string | null;
  userColor: UserColor | null;
};

export type CoachInput = {
  userText: string;
  helpMode: HelpMode;
  context: CoachContext;
  /** Positions up to current ply — used to build move history for the model. */
  positions: MoveHistoryEntry[];
};

/** Provider-neutral prompt — every model receives the same content. */
export type CoachPrompt = {
  system: string;
  user: string;
};

export type CoachProviderId = "ollama" | "openrouter" | "gemini" | "mock";

export interface CoachProvider {
  id: CoachProviderId;
  model: string;
  complete(prompt: CoachPrompt): Promise<string>;
}
