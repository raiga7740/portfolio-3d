"use client";

import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { PORTFOLIO_DATA, type Language } from "@/data/portfolio";
import RaigaLogo from "@/components/RaigaLogo";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setIsMenuOpen(false);
    if (href.startsWith("#") && onNavigate) {
      event.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <>
      {isMenuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-20 bg-slate-950/15 backdrop-blur-[2px] md:hidden pointer-events-auto"
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-30 border-b border-slate-200/85 bg-white/88 shadow-2xs backdrop-blur-xl transition-colors duration-500 dark:border-slate-800/85 dark:bg-[#0B1120]/88 pointer-events-auto">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-10 lg:px-16">
          <a
            href="#hero"
            aria-label={PORTFOLIO_DATA.brand}
            onClick={(e) => handleAnchorClick(e, "#hero")}
            className="group inline-flex shrink-0 items-center text-[#0F172A] transition-colors duration-500 hover:opacity-80 dark:text-[#F8FAFC]"
          >
            <RaigaLogo size={28} />
          </a>

          <div className="flex items-center gap-2 sm:gap-3.5">
            <nav
              aria-label="Primary Navigation"
              className="hidden items-center gap-1.5 md:flex"
            >
              {PORTFOLIO_DATA.navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors duration-300 hover:bg-slate-100 hover:text-[#0F172A] dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white"
                >
                  {item.label[lang]}
                </a>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <div
                role="group"
                aria-label={
                  lang === "id" ? "Pilih bahasa situs" : "Select site language"
                }
                className="pointer-events-auto inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-200/75 p-0.5 transition-colors duration-500 dark:border-slate-700/80 dark:bg-slate-900/90"
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
                      className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider transition-all duration-200 ${
                        isActive
                          ? "bg-[#0F172A] text-white shadow-xs dark:bg-teal-500 dark:text-slate-950"
                          : "text-slate-600 hover:text-[#0F172A] dark:text-slate-300 dark:hover:text-[#F8FAFC]"
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
                className="pointer-events-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100/90 text-[#0F172A] shadow-xs transition-colors duration-300 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-amber-300 dark:hover:bg-slate-800"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-nav-menu"
                aria-label={
                  lang === "id"
                    ? isMenuOpen
                      ? "Tutup menu navigasi"
                      : "Buka menu navigasi"
                    : isMenuOpen
                      ? "Close navigation menu"
                      : "Open navigation menu"
                }
                className="pointer-events-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100/90 text-[#0F172A] shadow-xs transition-colors duration-300 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-[#F8FAFC] dark:hover:bg-slate-800 md:hidden"
              >
                {isMenuOpen ? (
                  <X className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Menu className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div
            id="mobile-nav-menu"
            className="mx-auto max-w-7xl px-4 pb-4 pt-2 md:hidden"
          >
            <nav
              aria-label="Mobile Navigation"
              className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-2.5 shadow-lg backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/90 dark:bg-slate-900/95"
            >
              {PORTFOLIO_DATA.navLinks.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/90 px-3.5 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-white active:scale-[0.99] dark:border-slate-800 dark:bg-slate-800/75 dark:text-[#F8FAFC] dark:hover:bg-slate-800"
                >
                  <span>{item.label[lang]}</span>
                  <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
