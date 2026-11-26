import SceneWrapper from "@/components/three/SceneWrapper";
import PortfolioExperience from "@/components/PortfolioExperience";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#F1F5F9] text-[#0F172A] dark:bg-[#0B1120] dark:text-[#F8FAFC] transition-colors duration-500">
      {/* Layer 0: Fixed 3D R3F Canvas (Client-only via next/dynamic ssr:false) */}
      <SceneWrapper />

      {/* Layer 1: Scrollable Editorial UI & Lenis + GSAP ScrollTrigger */}
      <PortfolioExperience />
    </div>
  );
}
