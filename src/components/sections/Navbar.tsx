"use client";

import { PORTFOLIO_DATA } from "@/data/portfolio";

interface NavbarProps {
  onNavigate?: (href: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <a
          href="#hero"
          onClick={(e) => handleAnchorClick(e, "#hero")}
          className="group inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-[#0F172A] transition-opacity hover:opacity-80"
        >
          <span>{PORTFOLIO_DATA.brand}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-teal-600 transition-transform duration-300 group-hover:scale-125" />
        </a>

        <nav
          aria-label="Primary Navigation"
          className="flex items-center gap-0.5 sm:gap-2"
        >
          {PORTFOLIO_DATA.navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href)}
              className="rounded-full px-2.5 py-1.5 text-xs font-medium text-[#64748B] transition-colors duration-200 hover:bg-white/80 hover:text-[#0F172A] sm:px-3.5 sm:text-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

