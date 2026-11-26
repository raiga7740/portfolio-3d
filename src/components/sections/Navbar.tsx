"use client";

import { useLanguage } from "@/context/LanguageContext";
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
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-slate-200/70 bg-[#F8FAFC]/75 backdrop-blur-md pointer-events-auto">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-10 lg:px-16">
        <a
          href="#hero"
          onClick={(e) => handleAnchorClick(e, "#hero")}
          className="group inline-flex shrink-0 items-center gap-2 font-display text-base font-bold tracking-tight text-[#0F172A] transition-opacity hover:opacity-80 sm:text-lg"
        >
          <span>{PORTFOLIO_DATA.brand}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-teal-600 transition-transform duration-300 group-hover:scale-125" />
        </a>

        <div className="flex items-center gap-1.5 sm:gap-4">
          <nav
            aria-label="Primary Navigation"
            className="flex items-center gap-0.5 sm:gap-1.5"
          >
            {PORTFOLIO_DATA.navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="rounded-full px-2 py-1.5 text-[11px] font-medium text-[#64748B] transition-colors duration-200 hover:bg-white/80 hover:text-[#0F172A] sm:px-3.5 sm:text-sm"
              >
                {item.label[lang]}
              </a>
            ))}
          </nav>

          <div
            role="group"
            aria-label={
              lang === "id" ? "Pilih bahasa situs" : "Select site language"
            }
            className="pointer-events-auto inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-100/80 p-0.5"
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
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
