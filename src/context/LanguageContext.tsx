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
import type { Language } from "@/data/portfolio";

const STORAGE_KEY = "raiga-portfolio-lang";
const LANG_CHANGE_EVENT = "raiga-portfolio-lang-change";

let memoryLang: Language | null = null;

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

function readStoredLang(): Language {
  if (typeof window === "undefined") {
    return "id";
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "id") {
      return saved;
    }
  } catch {
    // Fall back to in-memory preference if storage is restricted
  }
  return memoryLang ?? "id";
}

function getServerLang(): Language {
  return "id";
}

function subscribeToLang(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(LANG_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LANG_CHANGE_EVENT, callback);
  };
}

function writeStoredLang(nextLang: Language) {
  memoryLang = nextLang;
  try {
    window.localStorage.setItem(STORAGE_KEY, nextLang);
  } catch {
    // Keep in-memory fallback when localStorage is unavailable
  }
  document.documentElement.lang = nextLang;
  window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(
    subscribeToLang,
    readStoredLang,
    getServerLang
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((nextLang: Language) => {
    writeStoredLang(nextLang);
  }, []);

  const toggleLang = useCallback(() => {
    const current = readStoredLang();
    writeStoredLang(current === "id" ? "en" : "id");
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, toggleLang }),
    [lang, setLang, toggleLang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
