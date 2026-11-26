"use client";

import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { PORTFOLIO_DATA, type Language } from "@/data/portfolio";

interface NavbarProps {
  onNavigate?: (href: string) => void;
}

const LANGUAGE_OPTIONS: { code: Language; label: string; ariaLabel: string }[] = [
  { code: "id", label: "ID", ariaLabel: "Ganti ke Bahasa Indonesia" },
  { code: "en", label: "EN", ariaLabel: "Switch to English" },
];

export default function Navbar({ onNavigate }: NavbarProps) {
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#") && onNavigate) {
      event.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-slate-200/80 bg-[#F1F5F9]/80 backdrop-blur-md transition-colors duration-500 dark:border-slate-800/80 dark:bg-[#0B1120]/75 pointer-events-auto">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-10 lg:px-16">
        <a
          href="#hero"
          onClick={(e) => handleAnchorClick(e, "#hero")}
          className="group inline-flex shrink-0 items-center gap-2 font-display text-base font-bold tracking-tight text-[#0F172A] transition-colors duration-500 hover:opacity-80 dark:text-[#F8FAFC] sm:text-lg"
        >
          <span>{PORTFOLIO_DATA.brand}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-teal-600 transition-transform duration-300 group-hover:scale-125 dark:bg-teal-400" />
        </a>

        <div className="flex items-center gap-1.5 sm:gap-3.5">
          <nav
            aria-label="Primary Navigation"
            className="flex items-center gap-0.5 sm:gap-1.5"
          >
            {PORTFOLIO_DATA.navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="rounded-full px-2 py-1.5 text-[11px] font-medium text-[#475569] transition-colors duration-300 hover:bg-white/80 hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-slate-800/80 dark:hover:text-[#F8FAFC] sm:px-3.5 sm:text-sm"
              >
                {item.label[lang]}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div
              role="group"
              aria-label={
                lang === "id" ? "Pilih bahasa situs" : "Select site language"
              }
              className="pointer-events-auto inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-200/65 p-0.5 transition-colors duration-500 dark:border-slate-800 dark:bg-slate-900/80"
            >
              {LANGUAGE_OPTIONS.map((option) => {
                const isActive = lang === option.code;
                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => setLang(option.code)}
                    aria-label={option.ariaLabel}
                    aria-pressed={isActive}
                    className={`rounded-full px-2 py-1 font-mono text-[10px] font-semibold tracking-wider transition-all duration-200 sm:px-2.5 sm:text-[11px] ${
                      isActive
                        ? "bg-[#0F172A] text-white shadow-xs dark:bg-teal-500 dark:text-slate-950"
                        : "text-[#475569] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={isDark}
              aria-label={
                isDark
                  ? lang === "id"
                    ? "Ganti ke mode terang"
                    : "Switch to light mode"
                  : lang === "id"
                    ? "Ganti ke mode gelap"
                    : "Switch to dark mode"
              }
              className="pointer-events-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100/85 text-[#0F172A] shadow-xs transition-colors duration-300 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-amber-300 dark:hover:bg-slate-800"
            >
              {isDark ? (
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
