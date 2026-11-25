"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import {
  DEFAULT_ACCENT_COLOR,
  PROJECT_ACCENT_COLORS,
  scrollState,
} from "@/lib/scrollState";

/*
 * ============================================================================
 * CARA MENGGANTI OBJEK PROSEDURAL DENGAN MODEL .GLB CUSTOM (useGLTF)
 * ============================================================================
 * 1. Letakkan file model 3D Anda di `public/models/raiga-sculpture.glb`.
 * 2. Import `useGLTF` dari `@react-three/drei`:
 *      import { Float, MeshTransmissionMaterial, useGLTF } from "@react-three/drei";
 * 3. Di dalam komponen HeroSculpture, muat model dan pasang ke dalam <Float>:
 *      const { nodes, materials } = useGLTF("/models/raiga-sculpture.glb");
 *
 *      // Contoh render mesh dari .glb:
 *      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.45}>
 *        <primitive object={nodes.Scene ?? Object.values(nodes)[0]} scale={1} />
 *      </Float>
 *
 *      // Atau terapkan MeshTransmissionMaterial ke geometry tertentu dari .glb:
 *      <mesh geometry={(nodes.Sculpture as THREE.Mesh).geometry}>
 *        <MeshTransmissionMaterial ... />
 *      </mesh>
 * 4. Tambahkan preload di luar komponen agar aset dimuat lebih cepat:
 *      useGLTF.preload("/models/raiga-sculpture.glb");
 * ============================================================================
 */

export default function HeroSculpture() {
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const hoverScaleRef = useRef(1);
  const spinSpeedRef = useRef(0.14);
  const accumulatedSpinRef = useRef(0);
  const ringSpinRef = useRef(0);
  const { viewport } = useThree();

  // Match transmission refraction background with page's #F8FAFC off-white canvas
  const bgColor = useMemo(() => new THREE.Color("#F8FAFC"), []);
  const targetColor = useMemo(() => new THREE.Color(DEFAULT_ACCENT_COLOR), []);
  const currentAccentColor = useMemo(
    () => new THREE.Color(DEFAULT_ACCENT_COLOR),
    []
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -(event.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  useFrame((state, delta) => {
    const group = outerGroupRef.current;
    if (!group) return;

    const isMobile = viewport.width < 7;
    const safeDelta = Math.min(delta, 0.1);
    const damp = Math.min(1, safeDelta * 5.2);
    const colorDamp = Math.min(1, safeDelta * 4.5);
    const elapsed = state.clock.getElapsedTime();

    const hoveredId = scrollState.hoveredProject;
    const isHovered = hoveredId !== null;
    const targetHex =
      (hoveredId && PROJECT_ACCENT_COLORS[hoveredId]) || DEFAULT_ACCENT_COLOR;
    targetColor.set(targetHex);
    currentAccentColor.lerp(targetColor, colorDamp);

    hoverScaleRef.current = THREE.MathUtils.lerp(
      hoverScaleRef.current,
      isHovered ? 1.05 : 1.0,
      damp
    );

    // Responsive placement & scale using viewport dimensions so text never gets covered on mobile
    const targetX = isMobile ? 0 : scrollState.xFactor * viewport.width;
    const targetY = isMobile
      ? viewport.height * 0.19
      : scrollState.yFactor * viewport.height;
    const targetZ = isMobile ? -1.35 : scrollState.zOffset;

    const baseScale = isMobile
      ? Math.min(viewport.width / 7.8, 0.62)
      : Math.min(viewport.width / 11.8, 1.0);
    const targetScale =
      baseScale * scrollState.scaleFactor * hoverScaleRef.current;

    // Combine scroll choreography with slow organic drift and subtle pointer parallax
    const parallaxY = pointerRef.current.x * (isMobile ? 0.15 : 0.34);
    const parallaxX = -pointerRef.current.y * (isMobile ? 0.12 : 0.24);

    spinSpeedRef.current = THREE.MathUtils.lerp(
      spinSpeedRef.current,
      isHovered ? 0.36 : 0.14,
      damp
    );
    accumulatedSpinRef.current += spinSpeedRef.current * safeDelta;

    const targetRotX =
      scrollState.rotX + Math.sin(elapsed * 0.35) * 0.08 + parallaxX;
    const targetRotY = scrollState.rotY + accumulatedSpinRef.current + parallaxY;
    const targetRotZ = scrollState.rotZ + Math.cos(elapsed * 0.28) * 0.05;

    group.position.x = THREE.MathUtils.lerp(group.position.x, targetX, damp);
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, damp);
    group.position.z = THREE.MathUtils.lerp(group.position.z, targetZ, damp);

    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, damp);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, damp);
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetRotZ, damp);

    const nextScale = THREE.MathUtils.lerp(group.scale.x, targetScale, damp);
    group.scale.setScalar(nextScale);

    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.x = elapsed * 0.22;
      innerCoreRef.current.rotation.y = -elapsed * 0.3;
    }

    ringSpinRef.current += (isHovered ? 0.42 : 0.18) * safeDelta;
    if (ringRef.current) {
      ringRef.current.rotation.z = ringSpinRef.current;
    }

    if (ringMaterialRef.current) {
      ringMaterialRef.current.color.copy(currentAccentColor);
      ringMaterialRef.current.emissive.copy(currentAccentColor);
      ringMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        ringMaterialRef.current.emissiveIntensity,
        isHovered ? 0.55 : 0.28,
        colorDamp
      );
      ringMaterialRef.current.opacity = THREE.MathUtils.lerp(
        ringMaterialRef.current.opacity,
        isHovered ? 0.82 : 0.6,
        colorDamp
      );
    }

    if (rimLightRef.current) {
      rimLightRef.current.color.copy(currentAccentColor);
      rimLightRef.current.intensity = THREE.MathUtils.lerp(
        rimLightRef.current.intensity,
        isHovered ? 1.85 : 1.0,
        colorDamp
      );
    }
  });

  return (
    <group ref={outerGroupRef} position={[1.8, 0.1, 0]}>
      <pointLight
        ref={rimLightRef}
        position={[1.8, 1.4, -1.6]}
        intensity={1.0}
        distance={8}
        decay={2}
        color={DEFAULT_ACCENT_COLOR}
      />
      <Float speed={1.5} rotationIntensity={0.22} floatIntensity={0.42}>
        {/* Primary procedural frosted-glass TorusKnot sculpture */}
        <mesh castShadow receiveShadow>
          <torusKnotGeometry args={[1.05, 0.34, 220, 40, 2, 3]} />
          <MeshTransmissionMaterial
            background={bgColor}
            transmission={0.92}
            thickness={1.4}
            roughness={0.14}
            ior={1.45}
            chromaticAberration={0.03}
            anisotropy={0.2}
            distortion={0.1}
            distortionScale={0.24}
            temporalDistortion={0.08}
            clearcoat={1}
            clearcoatRoughness={0.1}
            color="#ffffff"
            attenuationColor="#cbd5e1"
            attenuationDistance={2.0}
            resolution={512}
            samples={6}
          />
        </mesh>

        {/* Inner matte ceramic/silver faceted icosahedron for crisp refracted depth */}
        <mesh ref={innerCoreRef}>
          <icosahedronGeometry args={[0.5, 2]} />
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.28}
            metalness={0.6}
          />
        </mesh>

        {/* Minimalist metallic orbit ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
          <torusGeometry args={[1.88, 0.014, 16, 120]} />
          <meshStandardMaterial
            ref={ringMaterialRef}
            color={DEFAULT_ACCENT_COLOR}
            emissive={DEFAULT_ACCENT_COLOR}
            emissiveIntensity={0.28}
            roughness={0.28}
            metalness={0.65}
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>
    </group>
  );
}

