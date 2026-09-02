export type ColorSchemeId = "dark" | "light" | "oled";

export type BoardTheme = { id: string; name: string; light: string; dark: string };
export type UiAccent = { id: string; name: string; hex: string };
export type ColorScheme = { id: ColorSchemeId; name: string; icon: string };

export const BOARD_THEMES: BoardTheme[] = [
  { id: "classic", name: "Classic", light: "#f0d9b5", dark: "#b58863" },
  { id: "green", name: "Green", light: "#eeeed2", dark: "#769656" },
  { id: "blue", name: "Blue", light: "#dee3e6", dark: "#8ca2ad" },
  { id: "purple", name: "Purple", light: "#e8d8f0", dark: "#7e57c2" },
  { id: "walnut", name: "Walnut", light: "#d4c4a8", dark: "#8b5e3c" },
  { id: "dark", name: "Dark", light: "#606060", dark: "#303030" },
];

export const UI_ACCENTS: UiAccent[] = [
  { id: "indigo", name: "Indigo", hex: "#5b73e8" },
  { id: "emerald", name: "Emerald", hex: "#10b981" },
  { id: "rose", name: "Rose", hex: "#f43f5e" },
  { id: "amber", name: "Amber", hex: "#f59e0b" },
  { id: "cyan", name: "Cyan", hex: "#06b6d4" },
  { id: "violet", name: "Violet", hex: "#8b5cf6" },
];

export const COLOR_SCHEMES: ColorScheme[] = [
  { id: "dark", name: "Dark", icon: "☾" },
  { id: "light", name: "Light", icon: "☀" },
  { id: "oled", name: "OLED", icon: "⬛" },
];

export const DEFAULT_BOARD_THEME_ID = "classic";
export const DEFAULT_ACCENT_ID = "indigo";

export function findBoardTheme(id: string): BoardTheme {
  return BOARD_THEMES.find((t) => t.id === id) ?? BOARD_THEMES[0];
}

export function findAccent(id: string): UiAccent {
  return UI_ACCENTS.find((a) => a.id === id) ?? UI_ACCENTS[0];
}
