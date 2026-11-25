import SceneWrapper from "@/components/three/SceneWrapper";
import PortfolioExperience from "@/components/PortfolioExperience";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Layer 0: Fixed 3D R3F Canvas (Client-only via next/dynamic ssr:false) */}
      <SceneWrapper />

      {/* Layer 1: Scrollable Editorial UI & Lenis + GSAP ScrollTrigger */}
      <PortfolioExperience />
    </div>
  );
}
