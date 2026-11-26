"use client";

import { Suspense, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { scrollState } from "@/lib/scrollState";
import IsometricStage from "./IsometricStage";

const LIGHT_BG_COLOR = new THREE.Color("#F1F5F9");
const DARK_BG_COLOR = new THREE.Color("#0B1120");
const LIGHT_HEMI_SKY = new THREE.Color("#ffffff");
const DARK_HEMI_SKY = new THREE.Color("#94a3b8");
const LIGHT_HEMI_GROUND = new THREE.Color("#cbd5e1");
const DARK_HEMI_GROUND = new THREE.Color("#0f172a");
const LIGHT_DIR_COLOR = new THREE.Color("#fff9f2");
const DARK_DIR_COLOR = new THREE.Color("#E2E8F0");

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
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state, delta) => {
    const isDark = scrollState.isDark;
    const themeDamp = 1 - Math.exp(-5 * Math.min(delta, 0.1));
    const targetBg = isDark ? DARK_BG_COLOR : LIGHT_BG_COLOR;

    if (state.scene.background instanceof THREE.Color) {
      state.scene.background.lerp(targetBg, themeDamp);
    }
    if (state.scene.fog instanceof THREE.Fog) {
      state.scene.fog.color.lerp(targetBg, themeDamp);
    }

    state.gl.toneMappingExposure = THREE.MathUtils.lerp(
      state.gl.toneMappingExposure,
      isDark ? 0.95 : 0.85,
      themeDamp
    );

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        isDark ? 0.15 : 0.18,
        themeDamp
      );
    }

    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.lerp(
        hemiRef.current.intensity,
        isDark ? 0.2 : 0.28,
        themeDamp
      );
      hemiRef.current.color.lerp(
        isDark ? DARK_HEMI_SKY : LIGHT_HEMI_SKY,
        themeDamp
      );
      hemiRef.current.groundColor.lerp(
        isDark ? DARK_HEMI_GROUND : LIGHT_HEMI_GROUND,
        themeDamp
      );
    }

    if (dirRef.current) {
      dirRef.current.intensity = THREE.MathUtils.lerp(
        dirRef.current.intensity,
        isDark ? 1.45 : 1.9,
        themeDamp
      );
      dirRef.current.color.lerp(
        isDark ? DARK_DIR_COLOR : LIGHT_DIR_COLOR,
        themeDamp
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.18} color="#ffffff" />
      <hemisphereLight ref={hemiRef} args={["#ffffff", "#cbd5e1", 0.28]} />
      <directionalLight
        ref={dirRef}
        position={[10, 16, 6]}
        intensity={1.9}
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
      camera={{ position: [6.15, 10.15, 11.45], fov: 30, near: 0.5, far: 100 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.85,
      }}
      className="pointer-events-none"
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <color attach="background" args={["#F1F5F9"]} />
      <fog attach="fog" args={["#F1F5F9", 15, 34]} />

      <SceneLighting />

      <Suspense fallback={null}>
        <Environment resolution={128} frames={1}>
          {/* Muted studio dome wrapper so metallic surfaces never reflect harsh glare */}
          <mesh scale={50}>
            <sphereGeometry />
            <meshBasicMaterial color="#CBD5E1" side={THREE.BackSide} />
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
          {/* Crisp back-right specular rim strip for rounded edge highlights */}
          <Lightformer
            form="rect"
            intensity={2.2}
            color="#ffffff"
            position={[6, 7, -8]}
            rotation={[0, -Math.PI * 0.75, 0]}
            scale={[10, 1.4, 1]}
          />
          {/* Warm-gold front-left accent rim for metallic disc reflections */}
          <Lightformer
            form="rect"
            intensity={1.3}
            color="#fef3c7"
            position={[-7, 3.5, 9]}
            rotation={[0, Math.PI * 0.25, 0]}
            scale={[6, 1.0, 1]}
          />
        </Environment>

        <IsometricStage />
      </Suspense>
    </Canvas>
  );
}
