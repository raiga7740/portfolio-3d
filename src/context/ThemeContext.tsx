"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { scrollState } from "@/lib/scrollState";

export type Theme = "light" | "dark";

const STORAGE_KEY = "raiga-portfolio-theme";
const THEME_CHANGE_EVENT = "raiga-portfolio-theme-change";

let memoryTheme: Theme | null = null;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // Fall back to in-memory preference if storage is restricted
  }
  return memoryTheme ?? "light";
}

function getServerTheme(): Theme {
  return "light";
}

function subscribeToTheme(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function applyThemeToDom(nextTheme: Theme) {
  if (nextTheme === "dark") {
    document.documentElement.classList.add("dark");
    scrollState.isDark = true;
  } else {
    document.documentElement.classList.remove("dark");
    scrollState.isDark = false;
  }
}

function writeStoredTheme(nextTheme: Theme) {
  memoryTheme = nextTheme;
  try {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  } catch {
    // Keep in-memory fallback when localStorage is unavailable
  }
  applyThemeToDom(nextTheme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readStoredTheme,
    getServerTheme
  );

  useEffect(() => {
    applyThemeToDom(theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    writeStoredTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = readStoredTheme();
    writeStoredTheme(current === "dark" ? "light" : "dark");
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

