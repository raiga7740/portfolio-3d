"use client";

import { Suspense, useSyncExternalStore } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import IsometricStage from "./IsometricStage";

function subscribeMobile(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("resize", callback, { passive: true });
  return () => window.removeEventListener("resize", callback);
}

function getMobileSnapshot(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.innerWidth < 768;
}

function getMobileServerSnapshot(): boolean {
  return false;
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.22} color="#ffffff" />
      <hemisphereLight args={["#ffffff", "#cbd5e1", 0.32]} />
      <directionalLight
        position={[10, 16, 6]}
        intensity={2.1}
        color="#fff9f2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={45}
      />
    </>
  );
}

export default function SceneCanvas() {
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot
  );

  return (
    <Canvas
      shadows="soft"
      dpr={isMobile ? [1, 1] : [1, 1.5]}
      camera={{ position: [6.15, 10.15, 11.45], fov: 30, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.98,
      }}
      className="pointer-events-none"
    >
      <color attach="background" args={["#F8FAFC"]} />
      <fog attach="fog" args={["#F8FAFC", 15, 34]} />

      <SceneLighting />

      <Suspense fallback={null}>
        <Environment resolution={128} frames={1}>
          {/* Bright studio dome wrapper so metallic surfaces never reflect black void */}
          <mesh scale={50}>
            <sphereGeometry />
            <meshBasicMaterial color="#F8FAFC" side={THREE.BackSide} />
          </mesh>
          {/* Large warm-neutral overhead studio softbox */}
          <Lightformer
            form="rect"
            intensity={1.6}
            color="#fffcf5"
            position={[0, 10, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[12, 12, 1]}
          />
          {/* Cool-white left fill panel */}
          <Lightformer
            form="rect"
            intensity={1.1}
            color="#f1f5f9"
            position={[-10, 4, 4]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[10, 6, 1]}
          />
          {/* Subtle bottom-right teal accent strip for bevel & coin rim sheen */}
          <Lightformer
            form="rect"
            intensity={1.5}
            color="#14B8A6"
            position={[8, 1.2, 6]}
            rotation={[0, -Math.PI / 3, 0]}
            scale={[8, 1.2, 1]}
          />
        </Environment>

        <IsometricStage />
      </Suspense>
    </Canvas>
  );
}
