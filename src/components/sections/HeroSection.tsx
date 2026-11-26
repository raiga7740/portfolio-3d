"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowDownRight, Download, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { PORTFOLIO_DATA } from "@/data/portfolio";

interface HeroSectionProps {
  onNavigate?: (href: string) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from("[data-hero-enter]", {
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-screen w-full items-center pt-20 pb-16 pointer-events-none"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 sm:px-10 lg:grid-cols-12 lg:gap-8 lg:px-16">
        {/* Left Column (50%): Editorial copy & CTAs */}
        <div className="lg:col-span-6 pointer-events-auto">
          <div
            data-hero-enter
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-1.5 shadow-sm backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
              {PORTFOLIO_DATA.hero.status[lang]}
            </span>
          </div>

          <h1
            data-hero-enter
            className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-[#0F172A] sm:text-5xl lg:text-[3.35rem]"
          >
            {PORTFOLIO_DATA.hero.headline[lang]}
          </h1>

          <p
            data-hero-enter
            className="mt-6 max-w-xl text-base leading-relaxed text-[#64748B] sm:text-lg"
          >
            {PORTFOLIO_DATA.hero.subheadline[lang]}
          </p>

          <div
            data-hero-enter
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href={PORTFOLIO_DATA.hero.primaryCta.href}
              onClick={(e) =>
                handleAnchorClick(e, PORTFOLIO_DATA.hero.primaryCta.href)
              }
              className="inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              <span>{PORTFOLIO_DATA.hero.primaryCta.label[lang]}</span>
              <ArrowDownRight className="h-4 w-4" />
            </a>

            <a
              href={PORTFOLIO_DATA.hero.secondaryCta.href}
              onClick={(e) =>
                handleAnchorClick(e, PORTFOLIO_DATA.hero.secondaryCta.href)
              }
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/65 px-7 py-3.5 text-sm font-semibold text-[#0F172A] shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white/90"
            >
              <Mail className="h-4 w-4 text-[#64748B]" />
              <span>{PORTFOLIO_DATA.hero.secondaryCta.label[lang]}</span>
            </a>

            <a
              href={PORTFOLIO_DATA.cvUrl}
              download="CV_Gayuh_Raiguna.pdf"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/65 px-6 py-3.5 text-sm font-semibold text-[#0F172A] shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white/90"
            >
              <Download className="h-4 w-4 text-[#64748B]" />
              <span>{PORTFOLIO_DATA.hero.cvCta.label[lang]}</span>
            </a>
          </div>
        </div>

        {/* Right Column (50%): Open negative space dedicated to the 3D frosted sculpture */}
        <div
          aria-hidden="true"
          className="min-h-[260px] lg:col-span-6 lg:min-h-[540px] pointer-events-none"
        />
      </div>
    </section>
  );
}

