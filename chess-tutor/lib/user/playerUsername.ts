const STORAGE_KEY = "chess-tutor-player-username";

export function getStoredPlayerUsername(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function setStoredPlayerUsername(username: string): void {
  if (typeof window === "undefined") return;
  const trimmed = username.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
