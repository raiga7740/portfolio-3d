"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PORTFOLIO_DATA } from "@/data/portfolio";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from("[data-tech-badge]", {
        y: 14,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: "[data-tech-stack]",
          start: "top 90%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full py-24 sm:py-36 pointer-events-none"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 sm:px-10 lg:grid-cols-12 lg:px-16">
        {/* Left Column: Bio & Tech Stack Badges inside light frosted surface */}
        <div
          data-reveal="about"
          className="lg:col-span-6 pointer-events-auto rounded-3xl border border-slate-200/80 bg-white/60 p-8 shadow-sm backdrop-blur-md sm:p-10"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#64748B]">
              {PORTFOLIO_DATA.about.eyebrow}
            </span>
            <span className="h-px w-10 bg-slate-300" />
          </div>

          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            {PORTFOLIO_DATA.about.title}
          </h2>

          <p className="mt-6 text-base leading-relaxed text-[#64748B] sm:text-lg">
            {PORTFOLIO_DATA.about.bio}
          </p>

          <div className="mt-10 border-t border-slate-200/70 pt-7">
            <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-[#64748B]">
              {PORTFOLIO_DATA.about.stackTitle}
            </h3>

            <div data-tech-stack className="flex flex-wrap gap-2.5">
              {PORTFOLIO_DATA.about.techStack.map((tech) => (
                <span
                  key={tech}
                  data-tech-badge
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 font-mono text-xs font-medium text-[#0F172A] shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>{tech}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Open negative space for the 3D frosted sculpture */}
        <div
          aria-hidden="true"
          className="hidden lg:block lg:col-span-6 lg:min-h-[420px] pointer-events-none"
        />
      </div>
    </section>
  );
}

