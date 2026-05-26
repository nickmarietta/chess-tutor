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
  isAnalysis?: boolean;
  analysisMoves?: string[];
};

export type CoachInput = {
  userText: string;
  helpMode: HelpMode;
  context: CoachContext;
  /** Game move history up to anchor — used to build move history for the model. */
  positions: MoveHistoryEntry[];
  /** Analysis line SAN moves when exploring variations. */
  analysisMoves?: string[];
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
