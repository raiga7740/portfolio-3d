"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { PORTFOLIO_DATA } from "@/data/portfolio";

export default function ContactFooterSection() {
  const { lang } = useLanguage();
  return (
    <section
      id="contact"
      className="relative w-full pt-24 pb-12 sm:pt-32 sm:pb-16 pointer-events-none"
    >
      <div className="mx-auto w-full max-w-4xl px-6 sm:px-10">
        {/* Centered Frosted Glass Conversion Card */}
        <div
          data-reveal="contact"
          className="pointer-events-auto rounded-3xl border border-slate-200/80 bg-white/65 p-9 text-center shadow-sm backdrop-blur-xl sm:p-14"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-[#64748B]">
            {PORTFOLIO_DATA.contact.eyebrow[lang]}
          </div>

          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            {PORTFOLIO_DATA.contact.headline[lang]}
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#64748B] sm:text-lg">
            {PORTFOLIO_DATA.contact.subtext[lang]}
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href={PORTFOLIO_DATA.contact.primaryButton.href}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#0F172A] px-8 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md sm:text-base"
            >
              <Mail className="h-4 w-4" />
              <span>{PORTFOLIO_DATA.contact.primaryButton.label[lang]}</span>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-slate-200/70 pt-6">
            {PORTFOLIO_DATA.contact.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F172A]"
              >
                <span>{social.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="mt-16 text-center pointer-events-auto">
          <p className="font-mono text-xs tracking-wide text-[#64748B]">
            {PORTFOLIO_DATA.footer[lang]}
          </p>
        </footer>
      </div>
    </section>
  );
}

