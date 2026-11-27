"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import RaigaLogo from "@/components/RaigaLogo";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null);
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
          barRef.current.style.width = `${clamped}%`;
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
        gsap.set("[data-splash-loader]", { opacity: 0 });
        gsap.set(
          "[data-splash-logo], [data-splash-name], [data-splash-subtitle]",
          { opacity: 1 }
        );
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            onCompleteRef.current?.();
          },
        });
        return;
      }

      const counter = { value: 0 };
      const tl = gsap.timeline();

      // Stage 1: Smooth loading bar entrance and 0% -> 100% progress
      tl.fromTo(
        "[data-splash-loader]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
        0
      )
        .to(
          counter,
          {
            value: 100,
            duration: 1.85,
            ease: "power3.inOut",
            onUpdate: () => {
              updateProgress(counter.value);
            },
          },
          0.1
        )
        // Stage 2: Loader recedes smoothly as RAIGA logo and name pop up
        .to(
          "[data-splash-loader]",
          {
            opacity: 0,
            y: -8,
            scale: 0.96,
            duration: 0.35,
            ease: "power2.inOut",
          },
          2.0
        )
        .fromTo(
          "[data-splash-logo]",
          { opacity: 0, scale: 0.65, y: 18 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
          2.15
        )
        .fromTo(
          "[data-splash-name], [data-splash-subtitle]",
          { opacity: 0, y: 14, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.1,
            ease: "power3.out",
          },
          2.3
        )
        // Stage 3: Smooth exit reveal into the portfolio
        .to(
          "[data-splash-brand]",
          {
            opacity: 0,
            y: -14,
            scale: 1.03,
            duration: 0.45,
            ease: "power3.inOut",
          },
          3.3
        )
        .to(
          rootRef.current,
          {
            opacity: 0,
            duration: 0.55,
            ease: "power3.inOut",
            onComplete: () => {
              onCompleteRef.current?.();
            },
          },
          3.45
        );
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

      <div className="relative z-10 grid place-items-center px-6">
        {/* Stage 1: Centered Loading Bar */}
        <div
          data-splash-loader
          className="w-64 sm:w-80 [grid-area:1/1] will-change-transform"
        >
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
            className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-800/90"
          >
            <div
              ref={barRef}
              style={{ width: "0%" }}
              className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-[#0F172A] via-teal-600 to-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.55)] dark:from-teal-500 dark:via-teal-400 dark:to-teal-200"
            >
              <span
                aria-hidden="true"
                className="animate-splash-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/55 to-transparent"
              />
            </div>
          </div>
        </div>

        {/* Stage 2: Centered Logo & Name Popup */}
        <div
          data-splash-brand
          className="flex flex-col items-center text-center [grid-area:1/1] will-change-transform"
        >
          <div
            data-splash-logo
            className="mb-4 flex items-center justify-center text-[#0F172A] opacity-0 dark:text-[#F8FAFC]"
          >
            <RaigaLogo size={60} showWordmark={false} />
          </div>

          <h2
            data-splash-name
            className="font-display text-3xl font-bold uppercase tracking-[0.22em] opacity-0 sm:text-4xl"
          >
            RAIGA
          </h2>

          <p
            data-splash-subtitle
            className="mt-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#475569] opacity-0 dark:text-[#94A3B8]"
          >
            Full-Stack Web Developer
          </p>
        </div>
      </div>
    </div>
  );
}
