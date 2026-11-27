"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import RaigaLogo from "@/components/RaigaLogo";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const updateProgress = (rawValue: number) => {
        const clamped = Math.max(0, Math.min(100, rawValue));
        const rounded = Math.round(clamped);

        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${clamped / 100})`;
        }
        if (percentRef.current) {
          percentRef.current.textContent = `${rounded}%`;
        }
        if (trackRef.current) {
          trackRef.current.setAttribute("aria-valuenow", String(rounded));
        }
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        updateProgress(100);
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            onCompleteRef.current?.();
          },
        });
        return;
      }

      const counter = { value: 0 };
      const tl = gsap.timeline();

      tl.from(
        "[data-splash-logo], [data-splash-name], [data-splash-subtitle], [data-splash-loader]",
        {
          y: 16,
          opacity: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
        }
      )
        .to(counter, {
          value: 100,
          duration: 1.45,
          ease: "power2.inOut",
          onUpdate: () => {
            updateProgress(counter.value);
          },
        })
        .to(
          contentRef.current,
          {
            y: -14,
            opacity: 0,
            duration: 0.35,
            ease: "power2.in",
          },
          "+=0.2"
        )
        .to(rootRef.current, {
          opacity: 0,
          duration: 0.45,
          ease: "power2.inOut",
          onComplete: () => {
            onCompleteRef.current?.();
          },
        });
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#F1F5F9] text-[#0F172A] dark:bg-[#0B1120] dark:text-[#F8FAFC] select-none"
    >
      {/* Subtle ambient radial washes matching SceneWrapper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 right-[12%] h-[420px] w-[420px] rounded-full bg-slate-200/45 blur-[120px] transition-colors duration-500 dark:bg-teal-950/30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-120px] left-[8%] h-[380px] w-[380px] rounded-full bg-sky-100/50 blur-[120px] transition-colors duration-500 dark:bg-slate-900/50"
      />

      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <div
          data-splash-logo
          className="mb-4 flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC]"
        >
          <RaigaLogo size={56} showWordmark={false} />
        </div>

        <h2
          data-splash-name
          className="font-display text-3xl font-bold uppercase tracking-[0.22em] sm:text-4xl"
        >
          RAIGA
        </h2>

        <p
          data-splash-subtitle
          className="mt-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#475569] dark:text-[#94A3B8]"
        >
          Full-Stack Web Developer
        </p>

        <div data-splash-loader className="mt-8 w-64 sm:w-80">
          <div className="mb-2.5 flex items-center justify-between font-mono text-xs">
            <span className="uppercase tracking-[0.2em] text-[#475569] dark:text-[#94A3B8]">
              Loading
            </span>
            <span
              ref={percentRef}
              className="tabular-nums font-semibold text-[#0F172A] dark:text-teal-400"
            >
              0%
            </span>
          </div>

          <div
            ref={trackRef}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            aria-label="Loading portfolio"
            className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-800/90"
          >
            <div
              ref={barRef}
              className="h-full w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#0F172A] via-teal-600 to-teal-500 dark:from-teal-500 dark:to-teal-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

