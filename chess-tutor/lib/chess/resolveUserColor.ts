export type UserColor = "white" | "black";

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Match the importing player's username/name against PGN White/Black headers.
 */
export function resolveUserColor(
  whitePlayer: string | null | undefined,
  blackPlayer: string | null | undefined,
  playerUsername: string | null | undefined,
): UserColor | null {
  const username = playerUsername?.trim();
  if (!username) return null;

  const needle = normalize(username);
  const white = whitePlayer ? normalize(whitePlayer) : null;
  const black = blackPlayer ? normalize(blackPlayer) : null;

  if (white === needle) return "white";
  if (black === needle) return "black";

  return null;
}

/** Whether the last move at this ply was played by the student. */
export function isStudentMove(ply: number, userColor: UserColor | null): boolean | null {
  if (ply <= 0 || !userColor) return null;
  const whiteMovedLast = ply % 2 === 1;
  return userColor === "white" ? whiteMovedLast : !whiteMovedLast;
}

export function formatUserColorLabel(userColor: UserColor | null): string {
  if (userColor === "white") return "White";
  if (userColor === "black") return "Black";
  return "Unknown";
}
