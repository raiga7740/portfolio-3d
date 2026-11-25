"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import HeroSculpture from "./HeroSculpture";

export default function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      {/* Bright studio lighting tailored for Clean Light Mode (#F8FAFC) */}
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 8, 6]} intensity={1.35} color="#ffffff" />
      <directionalLight
        position={[-6, -4, 4]}
        intensity={0.55}
        color="#e2e8f0"
      />
      <directionalLight
        position={[-3, 4, -5]}
        intensity={0.4}
        color="#14B8A6"
      />

      <Suspense fallback={null}>
        <Environment preset="studio" />
        <HeroSculpture />
      </Suspense>

      <ContactShadows
        position={[0, -2.35, 0]}
        opacity={0.2}
        scale={12}
        blur={2.8}
        far={5}
        color="#64748b"
      />
    </Canvas>
  );
}

