"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Code2, Layers } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { PORTFOLIO_DATA } from "@/data/portfolio";
import { scrollState } from "@/lib/scrollState";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = prefersReducedMotion
      ? null
      : gsap.context(() => {
          const cards = gsap.utils.toArray<HTMLElement>("[data-project-card]");
          cards.forEach((card) => {
            gsap.from(card, {
              y: 26,
              opacity: 0,
              duration: 0.7,
              ease: "power2.out",
              clearProps: "transform,opacity",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                once: true,
              },
            });
          });
        }, sectionRef);

    return () => {
      scrollState.hoveredProject = null;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative w-full py-24 sm:py-32 pointer-events-none"
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Section Heading */}
        <div className="mb-14 max-w-xl pointer-events-auto">
          <div className="mb-3 flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#475569] transition-colors duration-500 dark:text-[#94A3B8]">
              {PORTFOLIO_DATA.projectsSection.eyebrow[lang]}
            </span>
            <span className="h-px w-10 bg-slate-300 transition-colors duration-500 dark:bg-slate-700" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A] transition-colors duration-500 dark:text-[#F8FAFC] sm:text-4xl">
            {PORTFOLIO_DATA.projectsSection.title[lang]}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#475569] transition-colors duration-500 dark:text-[#94A3B8]">
            {PORTFOLIO_DATA.projectsSection.subtitle[lang]}
          </p>
        </div>

        {/* Asymmetric Split: Left open negative space for 3D sculpture, Right glassmorphism cards */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div
            aria-hidden="true"
            className="hidden lg:block lg:col-span-5 pointer-events-none"
          />

          <div className="flex flex-col gap-7 lg:col-span-7">
            {PORTFOLIO_DATA.projects.map((project, index) => (
              <article
                key={project.id}
                data-project-card
                onMouseEnter={() => {
                  scrollState.hoveredProject = project.id;
                }}
                onMouseLeave={() => {
                  if (scrollState.hoveredProject === project.id) {
                    scrollState.hoveredProject = null;
                  }
                }}
                className={`pointer-events-auto group rounded-2xl border border-slate-200/80 bg-white/75 p-7 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-slate-300/90 hover:bg-white/90 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-900/85 sm:p-9 ${
                  index % 2 === 1 ? "lg:ml-6" : ""
                }`}
              >
                {/* Project Screenshot / Clean Gradient Preview */}
                <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100/80 transition-colors duration-500 dark:border-slate-800/80 dark:bg-slate-950/60">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={`${project.title} preview`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50/85 to-teal-50/75 transition-all duration-500 ease-out group-hover:scale-105 dark:from-slate-900 dark:via-indigo-950/70 dark:to-teal-950/60">
                      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-200/40 blur-2xl dark:bg-indigo-500/20" />
                      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-200/40 blur-2xl dark:bg-teal-500/20" />
                      <div className="relative flex flex-col items-center gap-2.5 px-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/80 shadow-xs backdrop-blur-sm transition-colors duration-500 dark:border-slate-700/80 dark:bg-slate-800/80">
                          <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-mono text-xs font-medium uppercase tracking-widest text-[#475569] transition-colors duration-500 dark:text-[#94A3B8]">
                          {project.category[lang]}
                        </span>
                        <span className="font-display text-lg font-semibold text-[#0F172A] transition-colors duration-500 dark:text-[#F8FAFC]">
                          {project.title}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-medium uppercase tracking-wider text-teal-700 transition-colors duration-500 dark:text-teal-400">
                      {project.category[lang]}
                    </span>
                    <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#0F172A] transition-colors duration-500 dark:text-[#F8FAFC]">
                      {project.title}
                    </h3>
                  </div>
                  <span className="rounded-lg border border-slate-200/80 bg-white/80 px-2.5 py-1 font-mono text-xs font-medium text-[#475569] transition-colors duration-500 dark:border-slate-700/80 dark:bg-slate-800/75 dark:text-[#94A3B8]">
                    {project.number}
                  </span>
                </div>

                <p className="mb-2 text-sm font-medium text-[#0F172A]/85 transition-colors duration-500 dark:text-slate-200/90">
                  {project.subtitle[lang]}
                </p>

                <p className="mb-6 text-sm leading-relaxed text-[#475569] transition-colors duration-500 dark:text-[#94A3B8] sm:text-base">
                  {project.description[lang]}
                </p>

                {/* Tech Tags */}
                <div className="mb-7 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200/80 bg-slate-100/85 px-3 py-1 font-mono text-xs font-medium text-[#0F172A] transition-colors duration-500 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex flex-wrap items-center gap-6 border-t border-slate-200/70 pt-5 transition-colors duration-500 dark:border-slate-800/80">
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] transition-colors duration-300 hover:text-teal-700 dark:text-[#F8FAFC] dark:hover:text-teal-400"
                  >
                    <span>{PORTFOLIO_DATA.projectsSection.liveDemoLabel[lang]}</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>

                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#475569] transition-colors duration-300 hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                  >
                    <Code2 className="h-4 w-4" />
                    <span>{PORTFOLIO_DATA.projectsSection.githubLabel[lang]}</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
