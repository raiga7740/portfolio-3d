"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { INITIAL_SCROLL_STATE, scrollState } from "@/lib/scrollState";
import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactFooterSection from "@/components/sections/ContactFooterSection";

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Reset scroll choreography to hero defaults on mount
    Object.assign(scrollState, INITIAL_SCROLL_STATE);

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Choreography 1: Hero (right) -> Selected Projects (left)
      gsap.fromTo(
        scrollState,
        {
          xFactor: INITIAL_SCROLL_STATE.xFactor,
          yFactor: INITIAL_SCROLL_STATE.yFactor,
          zOffset: INITIAL_SCROLL_STATE.zOffset,
          rotX: INITIAL_SCROLL_STATE.rotX,
          rotY: INITIAL_SCROLL_STATE.rotY,
          rotZ: INITIAL_SCROLL_STATE.rotZ,
          scaleFactor: INITIAL_SCROLL_STATE.scaleFactor,
        },
        {
          xFactor: -0.24,
          yFactor: -0.02,
          zOffset: -0.2,
          rotX: 0.34,
          rotY: 2.35,
          rotZ: -0.1,
          scaleFactor: 0.92,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: "#projects",
            start: "top bottom",
            end: "top 25%",
            scrub: 1,
          },
        }
      );

      // Choreography 2: Selected Projects (left) -> About & Tech Stack (right)
      gsap.to(scrollState, {
        xFactor: 0.24,
        yFactor: 0.02,
        zOffset: 0.1,
        rotX: -0.18,
        rotY: 4.85,
        rotZ: 0.14,
        scaleFactor: 1.04,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "#about",
          start: "top bottom",
          end: "center center",
          scrub: 1,
        },
      });

      // Choreography 3: About (right) -> Contact & Footer (subtle upper-center)
      gsap.to(scrollState, {
        xFactor: 0,
        yFactor: 0.17,
        zOffset: -0.7,
        rotX: 0.15,
        rotY: 7.2,
        rotZ: 0,
        scaleFactor: 0.78,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "#contact",
          start: "top bottom",
          end: "center center",
          scrub: 1,
        },
      });

      // Subtle card & section reveal animations without hiding content permanently
      const revealEls = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      revealEls.forEach((el) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          duration: 0.75,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });
    }, containerRef);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const handleNavigate = useCallback((href: string) => {
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -24 });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div ref={containerRef} className="relative z-10 pointer-events-none">
      <Navbar onNavigate={handleNavigate} />
      <main>
        <HeroSection onNavigate={handleNavigate} />
        <ProjectsSection />
        <AboutSection />
        <ContactFooterSection />
      </main>
    </div>
  );
}

