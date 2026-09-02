"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_ACCENT_ID,
  DEFAULT_BOARD_THEME_ID,
  findAccent,
  findBoardTheme,
  type BoardTheme,
  type ColorSchemeId,
  type UiAccent,
} from "@/lib/theme/palette";

type ThemeContextValue = {
  scheme: ColorSchemeId;
  setScheme: (scheme: ColorSchemeId) => void;
  accentId: string;
  setAccentId: (id: string) => void;
  accent: UiAccent;
  boardThemeId: string;
  setBoardThemeId: (id: string) => void;
  boardTheme: BoardTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const SCHEME_KEY = "chess-tutor-theme";
const ACCENT_KEY = "chess-tutor-accent";
const BOARD_THEME_KEY = "chess-tutor-board-theme";

function applyScheme(scheme: ColorSchemeId) {
  document.documentElement.setAttribute("data-scheme", scheme);
  document.documentElement.classList.toggle("dark", scheme !== "light");
  document.documentElement.style.colorScheme = scheme === "light" ? "light" : "dark";
}

function applyAccent(hex: string) {
  document.documentElement.style.setProperty("--accent", hex);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorSchemeId>("dark");
  const [accentId, setAccentIdState] = useState(DEFAULT_ACCENT_ID);
  const [boardThemeId, setBoardThemeIdState] = useState(DEFAULT_BOARD_THEME_ID);

  useEffect(() => {
    const storedScheme = localStorage.getItem(SCHEME_KEY) as ColorSchemeId | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialScheme: ColorSchemeId =
      storedScheme === "dark" || storedScheme === "light" || storedScheme === "oled"
        ? storedScheme
        : prefersDark
          ? "dark"
          : "light";
    setSchemeState(initialScheme);
    applyScheme(initialScheme);

    const storedAccent = localStorage.getItem(ACCENT_KEY) ?? DEFAULT_ACCENT_ID;
    setAccentIdState(storedAccent);
    applyAccent(findAccent(storedAccent).hex);

    const storedBoardTheme = localStorage.getItem(BOARD_THEME_KEY) ?? DEFAULT_BOARD_THEME_ID;
    setBoardThemeIdState(storedBoardTheme);
  }, []);

  const setScheme = useCallback((next: ColorSchemeId) => {
    setSchemeState(next);
    localStorage.setItem(SCHEME_KEY, next);
    applyScheme(next);
  }, []);

  const setAccentId = useCallback((id: string) => {
    setAccentIdState(id);
    localStorage.setItem(ACCENT_KEY, id);
    applyAccent(findAccent(id).hex);
  }, []);

  const setBoardThemeId = useCallback((id: string) => {
    setBoardThemeIdState(id);
    localStorage.setItem(BOARD_THEME_KEY, id);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        scheme,
        setScheme,
        accentId,
        setAccentId,
        accent: findAccent(accentId),
        boardThemeId,
        setBoardThemeId,
        boardTheme: findBoardTheme(boardThemeId),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
