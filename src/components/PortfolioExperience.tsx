"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  INITIAL_SCROLL_STATE,
  resetScrollState,
  scrollState,
} from "@/lib/scrollState";
import { LanguageProvider } from "@/context/LanguageContext";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import GallerySection from "@/components/sections/GallerySection";
import AboutSection from "@/components/sections/AboutSection";
import ContactFooterSection from "@/components/sections/ContactFooterSection";

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    if (!isSplashDone) {
      document.body.style.overflow = "hidden";
      lenisRef.current?.stop();
    } else {
      document.body.style.overflow = "";
      lenisRef.current?.start();
      ScrollTrigger.refresh();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSplashDone]);

  useEffect(() => {
    // Reset scroll choreography to hero defaults on mount
    resetScrollState();

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
      // Phase 0 -> Phase 1: Hero -> Selected Projects (pan left behind cards + tiered steps)
      const projectsTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#projects",
          start: "top bottom",
          end: "top 25%",
          scrub: 1.2,
        },
      });
      projectsTl
        .fromTo(
          scrollState,
          {
            sectionIndex: INITIAL_SCROLL_STATE.sectionIndex,
            stageRotY: INITIAL_SCROLL_STATE.stageRotY,
            blockSpread: INITIAL_SCROLL_STATE.blockSpread,
            blockElevation: INITIAL_SCROLL_STATE.blockElevation,
            trackSpeed: INITIAL_SCROLL_STATE.trackSpeed,
            orbLift: INITIAL_SCROLL_STATE.orbLift,
            glowIntensity: INITIAL_SCROLL_STATE.glowIntensity,
          },
          {
            sectionIndex: 1,
            stageRotY: 0.22,
            blockSpread: 0.15,
            blockElevation: 1,
            trackSpeed: 1.6,
            orbLift: 0,
            glowIntensity: 1.4,
            ease: "none",
            immediateRender: false,
          },
          0
        )
        .fromTo(
          scrollState.cameraPos,
          { ...INITIAL_SCROLL_STATE.cameraPos },
          { x: 11.4, y: 7.9, z: 7.4, ease: "none", immediateRender: false },
          0
        )
        .fromTo(
          scrollState.cameraLookAt,
          { ...INITIAL_SCROLL_STATE.cameraLookAt },
          { x: 2.05, y: 0.35, z: -1.65, ease: "none", immediateRender: false },
          0
        )
        .fromTo(
          scrollState.stageOffset,
          { ...INITIAL_SCROLL_STATE.stageOffset },
          { x: -0.25, y: 0, z: 0.2, ease: "none", immediateRender: false },
          0
        );

      // Phase 1 -> Phase 1.5: Projects -> Visual Gallery (recede calmly behind 3D exhibition)
      const galleryTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#gallery",
          start: "top bottom",
          end: "center center",
          scrub: 1.2,
        },
      });
      galleryTl
        .fromTo(
          scrollState,
          {
            sectionIndex: 1,
            stageRotY: 0.22,
            blockSpread: 0.15,
            blockElevation: 1,
            trackSpeed: 1.6,
            orbLift: 0,
            glowIntensity: 1.4,
          },
          {
            sectionIndex: 2,
            stageRotY: -0.1,
            blockSpread: 0.45,
            blockElevation: 0.4,
            trackSpeed: 0.85,
            orbLift: 0.35,
            glowIntensity: 0.9,
            ease: "none",
            immediateRender: false,
          },
          0
        )
        .fromTo(
          scrollState.cameraPos,
          { x: 11.4, y: 7.9, z: 7.4 },
          { x: 10.2, y: 11.8, z: 9.2, ease: "none", immediateRender: false },
          0
        )
        .fromTo(
          scrollState.cameraLookAt,
          { x: 2.05, y: 0.35, z: -1.65 },
          { x: 0.4, y: 0.45, z: 0.2, ease: "none", immediateRender: false },
          0
        )
        .fromTo(
          scrollState.stageOffset,
          { x: -0.25, y: 0, z: 0.2 },
          { x: 0, y: 0, z: 0, ease: "none", immediateRender: false },
          0
        );

      // Phase 1.5 -> Phase 2: Gallery -> About (orbit ~45deg right, exploded blocks, hovering disc)
      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about",
          start: "top bottom",
          end: "center center",
          scrub: 1.2,
        },
      });
      aboutTl
        .fromTo(
          scrollState,
          {
            sectionIndex: 2,
            stageRotY: -0.1,
            blockSpread: 0.45,
            blockElevation: 0.4,
            trackSpeed: 0.85,
            orbLift: 0.35,
            glowIntensity: 0.9,
          },
          {
            sectionIndex: 3,
            stageRotY: -0.35,
            blockSpread: 1,
            blockElevation: 0.55,
            trackSpeed: 1.0,
            orbLift: 1,
            glowIntensity: 1.25,
            ease: "none",
            immediateRender: false,
          },
          0
        )
        .fromTo(
          scrollState.cameraPos,
          { x: 10.2, y: 11.8, z: 9.2 },
          { x: 8.85, y: 7.35, z: 3.15, ease: "none", immediateRender: false },
          0
        )
        .fromTo(
          scrollState.cameraLookAt,
          { x: 0.4, y: 0.45, z: 0.2 },
          { x: -0.35, y: 0.95, z: 2.15, ease: "none", immediateRender: false },
          0
        )
        .fromTo(
          scrollState.stageOffset,
          { x: 0, y: 0, z: 0 },
          { x: 0.15, y: 0, z: -0.15, ease: "none", immediateRender: false },
          0
        );

      // Phase 2 -> Phase 3: About -> Contact (bird's-eye pull back + calm return to rest)
      const contactTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#contact",
          start: "top bottom",
          end: "center center",
          scrub: 1.2,
        },
      });
      contactTl
        .fromTo(
          scrollState,
          {
            sectionIndex: 3,
            stageRotY: -0.35,
            blockSpread: 1,
            blockElevation: 0.55,
            trackSpeed: 1.0,
            orbLift: 1,
            glowIntensity: 1.25,
          },
          {
            sectionIndex: 4,
            stageRotY: 0,
            blockSpread: 0,
            blockElevation: 0,
            trackSpeed: 0.5,
            orbLift: 0,
            glowIntensity: 0.6,
            ease: "none",
            immediateRender: false,
          },
          0
        )
        .fromTo(
          scrollState.cameraPos,
          { x: 8.85, y: 7.35, z: 3.15 },
          { x: 7.5, y: 15.8, z: 10.5, ease: "none", immediateRender: false },
          0
        )
        .fromTo(
          scrollState.cameraLookAt,
          { x: -0.35, y: 0.95, z: 2.15 },
          { x: 0, y: 0.35, z: 0, ease: "none", immediateRender: false },
          0
        )
        .fromTo(
          scrollState.stageOffset,
          { x: 0.15, y: 0, z: -0.15 },
          { x: 0, y: 0, z: 0, ease: "none", immediateRender: false },
          0
        );

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
    <LanguageProvider>
      {!isSplashDone && (
        <SplashScreen onComplete={() => setIsSplashDone(true)} />
      )}
      <div ref={containerRef} className="relative z-10 pointer-events-none">
        <Navbar onNavigate={handleNavigate} />
        <main>
          <HeroSection onNavigate={handleNavigate} />
          <ProjectsSection />
          <GallerySection />
          <AboutSection />
          <ContactFooterSection />
        </main>
      </div>
    </LanguageProvider>
  );
}
