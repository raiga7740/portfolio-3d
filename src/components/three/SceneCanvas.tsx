"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import IsometricStage from "./IsometricStage";

function SceneLighting() {
  const isMobile = useThree((state) => state.viewport.width < 6);
  const shadowMapSize = isMobile ? 1024 : 2048;

  return (
    <>
      <ambientLight intensity={0.45} color="#ffffff" />
      <hemisphereLight args={["#ffffff", "#cbd5e1", 0.55]} />
      <directionalLight
        key={isMobile ? "sun-mobile" : "sun-desktop"}
        position={[11, 12, -4]}
        intensity={1.8}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={40}
      />
    </>
  );
}

export default function SceneCanvas() {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      camera={{ position: [6.15, 10.15, 11.45], fov: 30, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      className="pointer-events-none"
    >
      <color attach="background" args={["#F8FAFC"]} />
      <fog attach="fog" args={["#F8FAFC", 15, 34]} />

      <SceneLighting />

      <Suspense fallback={null}>
        <Environment preset="studio" environmentIntensity={0.45} />
        <IsometricStage />
      </Suspense>
    </Canvas>
  );
}
