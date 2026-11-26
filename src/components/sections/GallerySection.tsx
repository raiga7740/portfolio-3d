"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { PORTFOLIO_DATA, type GalleryItem } from "@/data/portfolio";
import type { StepCommand } from "@/components/three/GalleryCarousel3D";

const GalleryCarousel3D = dynamic(
  () => import("@/components/three/GalleryCarousel3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-3xl border border-slate-200/80 bg-white/50 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#0F172A]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#64748B]">
            Loading 3D Gallery...
          </span>
        </div>
      </div>
    ),
  }
);

export default function GallerySection() {
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepCommand, setStepCommand] = useState<StepCommand>({
    delta: 0,
    seq: 0,
  });
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const items = PORTFOLIO_DATA.galleryItems;
  const activeItem = items[activeIndex] ?? items[0];

  // Pause 3D render loop when user scrolls outside the Gallery section
  useEffect(() => {
    const target = stageContainerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      {
        threshold: 0.05,
        rootMargin: "120px 0px",
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Close Lightbox modal on Escape key
  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem]);

  const handleStep = useCallback((delta: number) => {
    setStepCommand((prev) => ({
      delta,
      seq: prev.seq + 1,
    }));
  }, []);

  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <section
      id="gallery"
      className="relative w-full py-24 sm:py-32 pointer-events-none"
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Section Heading */}
        <div
          data-reveal="gallery"
          className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end pointer-events-auto"
        >
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#64748B]">
                {PORTFOLIO_DATA.gallerySection.eyebrow}
              </span>
              <span className="h-px w-10 bg-slate-300" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              {PORTFOLIO_DATA.gallerySection.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#64748B]">
              {PORTFOLIO_DATA.gallerySection.subtitle}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 font-mono text-xs text-[#64748B] shadow-xs backdrop-blur-md md:self-auto">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            <span>Drag / Swipe atau Klik Karya</span>
          </div>
        </div>

        {/* Isolated 3D Curved Carousel Stage */}
        <div
          ref={stageContainerRef}
          className="pointer-events-auto relative h-[520px] md:h-[600px] w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/45 shadow-sm backdrop-blur-md"
        >
          {/* Subtle floor & top radial lighting wash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.85)_0%,rgba(241,245,249,0.25)_70%)]"
          />

          <GalleryCarousel3D
            items={items}
            stepCommand={stepCommand}
            isActive={isInView && selectedItem === null}
            onActiveIndexChange={handleActiveIndexChange}
            onSelectItem={setSelectedItem}
          />

          {/* Top-right expand button for active artwork */}
          <button
            type="button"
            onClick={() => setSelectedItem(activeItem)}
            aria-label={`Perbesar ${activeItem.title}`}
            className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/85 px-3.5 py-2 text-xs font-semibold text-[#0F172A] shadow-xs backdrop-blur-md transition-all hover:bg-white hover:shadow-sm sm:top-6 sm:right-6"
          >
            <Expand className="h-3.5 w-3.5 text-[#64748B]" />
            <span>Preview</span>
          </button>
        </div>

        {/* Accessible Controls & Active Artwork Metadata */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/65 px-5 py-4 shadow-xs backdrop-blur-md sm:flex-row pointer-events-auto">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 font-mono text-xs font-semibold text-[#0F172A]">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-teal-700">
                {activeItem.category}
              </p>
              <h3 className="font-display text-sm font-bold text-[#0F172A] sm:text-base">
                {activeItem.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              aria-label="Karya sebelumnya"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-[#0F172A] shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleStep(1)}
              aria-label="Karya berikutnya"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/90 text-[#0F172A] shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clean Light Mode Lightbox Modal */}
      {selectedItem && (
        <div
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedItem(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 p-4 backdrop-blur-xl sm:p-8 pointer-events-auto"
        >
          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-teal-700">
                  {selectedItem.category}
                </span>
                <h3 className="mt-0.5 font-display text-xl font-bold text-[#0F172A] sm:text-2xl">
                  {selectedItem.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Tutup pratinjau"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[#0F172A] transition-colors hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-2xl bg-slate-50/80 p-2 sm:p-4">
              <Image
                src={selectedItem.image}
                alt={selectedItem.title}
                width={selectedItem.width}
                height={selectedItem.height}
                className="max-h-[68vh] w-auto rounded-xl object-contain shadow-md"
                priority
              />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#64748B]">
              {selectedItem.description}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

