"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Grid, RoundedBox } from "@react-three/drei";
import {
  DEFAULT_ACCENT_COLOR,
  PROJECT_ACCENT_COLORS,
  scrollState,
} from "@/lib/scrollState";

const DISC_RADIUS = 0.26;
const HERO_STAGE_OFFSET_X = 1.65;

interface BlockChoreographyConfig {
  baseX: number;
  baseY: number;
  baseZ: number;
  spreadX: number;
  spreadZ: number;
  elevationTier: number;
  wavePhase: number;
  waveSpeed: number;
  waveAmp: number;
  driftX?: number;
  driftZ?: number;
}

const BLOCK_CONFIGS: BlockChoreographyConfig[] = [
  {
    baseX: 1.05,
    baseY: 0.34,
    baseZ: -1.05,
    spreadX: 0.9,
    spreadZ: -0.85,
    elevationTier: 1.15,
    wavePhase: 0,
    waveSpeed: 0.85,
    waveAmp: 0.06,
    driftX: 0.035,
  },
  {
    baseX: -1.25,
    baseY: 0.58,
    baseZ: 1.05,
    spreadX: -0.95,
    spreadZ: 0.9,
    elevationTier: 1.55,
    wavePhase: 1.4,
    waveSpeed: 0.72,
    waveAmp: 0.08,
  },
  {
    baseX: 1.35,
    baseY: 0.22,
    baseZ: 1.35,
    spreadX: 0.95,
    spreadZ: 0.95,
    elevationTier: 0.38,
    wavePhase: 2.7,
    waveSpeed: 0.95,
    waveAmp: 0.05,
    driftZ: 0.03,
  },
  {
    baseX: -1.45,
    baseY: 0.38,
    baseZ: -1.25,
    spreadX: -0.95,
    spreadZ: -0.95,
    elevationTier: 0.78,
    wavePhase: 4.1,
    waveSpeed: 0.78,
    waveAmp: 0.065,
  },
];

function createRadialGlowTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") {
    return null;
  }

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const center = size / 2;
  const gradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center
  );
  gradient.addColorStop(0, "rgba(20, 184, 166, 0.55)");
  gradient.addColorStop(0.45, "rgba(20, 184, 166, 0.24)");
  gradient.addColorStop(1, "rgba(20, 184, 166, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a lightweight deterministic plaster/ceramic micro-grain texture
 * for subtle roughness and bump variation without external image assets.
 */
function createPlasterMicroTexture(
  repeatX: number,
  repeatY: number
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") {
    return null;
  }

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Deterministic PRNG for consistent matte grain without runtime flicker
  let seed = 1337;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < data.length; i += 4) {
    const grain = Math.floor(220 + nextRand() * 35);
    data[i] = grain;
    data[i + 1] = grain;
    data[i + 2] = grain;
    data[i + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates fine directional brushed-metal streaks for metallic roughness variation.
 */
function createBrushedMetalTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") {
    return null;
  }

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  ctx.fillStyle = "rgb(225, 225, 225)";
  ctx.fillRect(0, 0, size, size);

  let seed = 4242;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let y = 0; y < size; y += 1) {
    const v = Math.floor(192 + nextRand() * 63);
    ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
    ctx.fillRect(0, y, size, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export default function IsometricStage() {
  const stageGroupRef = useRef<THREE.Group>(null);
  const block1Ref = useRef<THREE.Group>(null);
  const block2Ref = useRef<THREE.Group>(null);
  const block3Ref = useRef<THREE.Group>(null);
  const block4Ref = useRef<THREE.Group>(null);

  const floorGlow1Ref = useRef<THREE.Mesh>(null);
  const floorGlow2Ref = useRef<THREE.Mesh>(null);
  const floorGlow4Ref = useRef<THREE.Mesh>(null);
  const floorGlowMat1Ref = useRef<THREE.MeshBasicMaterial>(null);
  const floorGlowMat2Ref = useRef<THREE.MeshBasicMaterial>(null);
  const floorGlowMat4Ref = useRef<THREE.MeshBasicMaterial>(null);

  const stripMat1Ref = useRef<THREE.MeshStandardMaterial>(null);
  const stripMat2Ref = useRef<THREE.MeshStandardMaterial>(null);
  const stripMat4Ref = useRef<THREE.MeshStandardMaterial>(null);
  const glowLight1Ref = useRef<THREE.PointLight>(null);
  const glowLight2Ref = useRef<THREE.PointLight>(null);

  const discCarrierRef = useRef<THREE.Group>(null);
  const discSpinRef = useRef<THREE.Group>(null);

  const pointerRef = useRef({ x: 0, y: 0 });
  const progressRef = useRef(0);
  const hoverSpinRef = useRef(0);

  // Smoothed scalar choreography refs to keep transitions fluid across 60Hz and 120Hz displays
  const spreadRef = useRef(scrollState.blockSpread);
  const elevationRef = useRef(scrollState.blockElevation);
  const orbLiftRef = useRef(scrollState.orbLift);
  const glowRef = useRef(scrollState.glowIntensity);
  const trackSpeedRef = useRef(scrollState.trackSpeed);
  const currentTargetRef = useRef(
    new THREE.Vector3(
      scrollState.cameraLookAt.x,
      scrollState.cameraLookAt.y,
      scrollState.cameraLookAt.z
    )
  );

  const { viewport } = useThree();

  // Pre-allocated math objects stored in a ref to avoid per-frame allocations and satisfy react-hooks/immutability
  const scratchRef = useRef({
    trackPosVec: new THREE.Vector3(),
    hoverPosVec: new THREE.Vector3(),
    blendedPosVec: new THREE.Vector3(),
    tangentVec: new THREE.Vector3(),
    desiredTargetVec: new THREE.Vector3(),
    desiredCamPosVec: new THREE.Vector3(),
    camOffsetVec: new THREE.Vector3(),
    desiredStagePosVec: new THREE.Vector3(),
    trackEuler: new THREE.Euler(),
    hoverEuler: new THREE.Euler(),
    trackQuat: new THREE.Quaternion(),
    hoverQuat: new THREE.Quaternion(),
    targetColor: new THREE.Color(DEFAULT_ACCENT_COLOR),
    currentAccentColor: new THREE.Color(DEFAULT_ACCENT_COLOR),
  });

  // Procedural textures stored in useMemo and disposed cleanly on unmount
  const {
    radialGlowTexture,
    floorMicroTexture,
    blockMicroTexture,
    brushedMetalTexture,
  } = useMemo(
    () => ({
      radialGlowTexture: createRadialGlowTexture(),
      floorMicroTexture: createPlasterMicroTexture(14, 14),
      blockMicroTexture: createPlasterMicroTexture(3, 3),
      brushedMetalTexture: createBrushedMetalTexture(),
    }),
    []
  );

  useEffect(() => {
    return () => {
      radialGlowTexture?.dispose();
      floorMicroTexture?.dispose();
      blockMicroTexture?.dispose();
      brushedMetalTexture?.dispose();
    };
  }, [
    radialGlowTexture,
    floorMicroTexture,
    blockMicroTexture,
    brushedMetalTexture,
  ]);

  // Closed curved track with >= 0.4-unit safe clearance around all 4 architectural blocks
  const { tubeGeometry, curve, curveLength } = useMemo(() => {
    const points = [
      new THREE.Vector3(0.02, 0.055, 0.22),
      new THREE.Vector3(2.75, 0.055, 0.22),
      new THREE.Vector3(2.8, 0.055, -2.2),
      new THREE.Vector3(-0.45, 0.055, -2.6),
      new THREE.Vector3(-2.75, 0.055, -2.25),
      new THREE.Vector3(-2.9, 0.055, 0.05),
      new THREE.Vector3(-2.92, 0.055, 1.3),
      new THREE.Vector3(-2.55, 0.055, 2.55),
      new THREE.Vector3(-0.02, 0.055, 2.55),
      new THREE.Vector3(-0.02, 0.055, 1.15),
    ];
    const spline = new THREE.CatmullRomCurve3(points, true, "centripetal");
    const geometry = new THREE.TubeGeometry(spline, 200, 0.055, 16, true);
    return {
      tubeGeometry: geometry,
      curve: spline,
      curveLength: spline.getLength(),
    };
  }, []);

  useEffect(() => {
    return () => {
      tubeGeometry.dispose();
    };
  }, [tubeGeometry]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  useFrame((state, delta) => {
    const {
      trackPosVec,
      hoverPosVec,
      blendedPosVec,
      tangentVec,
      desiredTargetVec,
      desiredCamPosVec,
      camOffsetVec,
      desiredStagePosVec,
      trackEuler,
      hoverEuler,
      trackQuat,
      hoverQuat,
      targetColor,
      currentAccentColor,
    } = scratchRef.current;

    const safeDelta = Math.min(delta, 0.1);
    const damp = 1 - Math.exp(-5 * safeDelta);
    const colorDamp = 1 - Math.exp(-4.5 * safeDelta);
    const elapsed = state.clock.getElapsedTime();
    const isMobile = viewport.width < 6;

    // Smoothly interpolate choreography scalars
    spreadRef.current = THREE.MathUtils.lerp(
      spreadRef.current,
      scrollState.blockSpread,
      damp
    );
    elevationRef.current = THREE.MathUtils.lerp(
      elevationRef.current,
      scrollState.blockElevation,
      damp
    );
    orbLiftRef.current = THREE.MathUtils.lerp(
      orbLiftRef.current,
      scrollState.orbLift,
      damp
    );
    glowRef.current = THREE.MathUtils.lerp(
      glowRef.current,
      scrollState.glowIntensity,
      damp
    );
    trackSpeedRef.current = THREE.MathUtils.lerp(
      trackSpeedRef.current,
      scrollState.trackSpeed,
      damp
    );

    const hoveredId = scrollState.hoveredProject;
    const isHovered = hoveredId !== null;
    const targetHex =
      (hoveredId && PROJECT_ACCENT_COLORS[hoveredId]) || DEFAULT_ACCENT_COLOR;
    targetColor.set(targetHex);
    currentAccentColor.lerp(targetColor, colorDamp);

    // Update radial floor glow opacity, bloom-ready emissive strips (> 1.1), and bounce point lights
    const floorGlowOpacity = THREE.MathUtils.clamp(
      glowRef.current * (isHovered ? 1.05 : 0.85),
      0.25,
      1.0
    );
    const stripEmissiveIntensity = Math.max(
      1.15,
      glowRef.current * (isHovered ? 1.95 : 1.55)
    );

    const floorGlowMats = [
      floorGlowMat1Ref.current,
      floorGlowMat2Ref.current,
      floorGlowMat4Ref.current,
    ];
    for (let i = 0; i < floorGlowMats.length; i += 1) {
      const mat = floorGlowMats[i];
      if (mat) {
        mat.opacity = floorGlowOpacity;
      }
    }

    const stripMats = [
      stripMat1Ref.current,
      stripMat2Ref.current,
      stripMat4Ref.current,
    ];
    for (let i = 0; i < stripMats.length; i += 1) {
      const mat = stripMats[i];
      if (mat) {
        mat.color.copy(currentAccentColor);
        mat.emissive.copy(currentAccentColor);
        mat.emissiveIntensity = stripEmissiveIntensity;
      }
    }

    const targetGlowIntensity = glowRef.current * (isHovered ? 1.3 : 1.0);
    if (glowLight1Ref.current) {
      glowLight1Ref.current.color.copy(currentAccentColor);
      glowLight1Ref.current.intensity = THREE.MathUtils.lerp(
        glowLight1Ref.current.intensity,
        targetGlowIntensity,
        colorDamp
      );
    }
    if (glowLight2Ref.current) {
      glowLight2Ref.current.color.copy(currentAccentColor);
      glowLight2Ref.current.intensity = THREE.MathUtils.lerp(
        glowLight2Ref.current.intensity,
        targetGlowIntensity,
        colorDamp
      );
    }

    // Apply tiered elevation, exploded spread, and staggered wave breathing across the 4 blocks
    const blockRefs = [block1Ref, block2Ref, block3Ref, block4Ref];
    for (let i = 0; i < blockRefs.length; i += 1) {
      const block = blockRefs[i].current;
      const cfg = BLOCK_CONFIGS[i];
      if (!block) continue;

      const waveY =
        Math.sin(elapsed * cfg.waveSpeed + cfg.wavePhase) * cfg.waveAmp;
      const driftX = cfg.driftX
        ? Math.cos(elapsed * 0.55 + cfg.wavePhase) * cfg.driftX
        : 0;
      const driftZ = cfg.driftZ
        ? Math.sin(elapsed * 0.6 + cfg.wavePhase) * cfg.driftZ
        : 0;

      const targetX = cfg.baseX + spreadRef.current * cfg.spreadX + driftX;
      const targetY =
        cfg.baseY + elevationRef.current * cfg.elevationTier + waveY;
      const targetZ = cfg.baseZ + spreadRef.current * cfg.spreadZ + driftZ;

      block.position.x = THREE.MathUtils.lerp(block.position.x, targetX, damp);
      block.position.y = THREE.MathUtils.lerp(block.position.y, targetY, damp);
      block.position.z = THREE.MathUtils.lerp(block.position.z, targetZ, damp);
    }

    // Keep floor radial underglow planes pinned on the floor beneath Blocks 1, 2, and 4
    if (floorGlow1Ref.current && block1Ref.current) {
      floorGlow1Ref.current.position.set(
        block1Ref.current.position.x,
        0.015,
        block1Ref.current.position.z
      );
    }
    if (floorGlow2Ref.current && block2Ref.current) {
      floorGlow2Ref.current.position.set(
        block2Ref.current.position.x,
        0.015,
        block2Ref.current.position.z
      );
    }
    if (floorGlow4Ref.current && block4Ref.current) {
      floorGlow4Ref.current.position.set(
        block4Ref.current.position.x,
        0.015,
        block4Ref.current.position.z
      );
    }

    // Kinetic loop: blend smoothly between track rolling (orbLift=0) and hovering orbit (orbLift=1)
    const speedMultiplier = isHovered ? 1.25 : 1.0;
    const deltaProgress =
      0.065 * trackSpeedRef.current * speedMultiplier * safeDelta;
    progressRef.current = (progressRef.current + deltaProgress) % 1;

    curve.getPointAt(progressRef.current, trackPosVec);
    curve.getTangentAt(progressRef.current, tangentVec).normalize();

    trackPosVec.y += DISC_RADIUS + 0.04;
    hoverPosVec.set(0, 2.05 + Math.sin(elapsed * 1.6) * 0.14, 0);
    blendedPosVec.copy(trackPosVec).lerp(hoverPosVec, orbLiftRef.current);

    hoverSpinRef.current += safeDelta * 0.95;
    const trackYaw = Math.atan2(tangentVec.x, tangentVec.z);
    trackEuler.set(0, trackYaw, 0);
    hoverEuler.set(0.28, hoverSpinRef.current, Math.PI * 0.38);
    trackQuat.setFromEuler(trackEuler);
    hoverQuat.setFromEuler(hoverEuler);

    if (discCarrierRef.current) {
      discCarrierRef.current.position.copy(blendedPosVec);
      discCarrierRef.current.quaternion
        .copy(trackQuat)
        .slerp(hoverQuat, orbLiftRef.current);
    }

    if (discSpinRef.current) {
      const distanceTraveled = deltaProgress * curveLength;
      discSpinRef.current.rotation.x +=
        (distanceTraveled / DISC_RADIUS) * (1 - orbLiftRef.current);
    }

    // Stage offset (shift slightly right on Hero desktop for safe text negative space), rotation, and mobile scaling
    const heroOffsetX = isMobile
      ? 0
      : Math.max(0, 1 - scrollState.sectionIndex) * HERO_STAGE_OFFSET_X;

    if (stageGroupRef.current) {
      desiredStagePosVec.set(
        isMobile ? 0 : scrollState.stageOffset.x + heroOffsetX,
        scrollState.stageOffset.y,
        isMobile ? 0 : scrollState.stageOffset.z
      );
      stageGroupRef.current.position.lerp(desiredStagePosVec, damp);
      stageGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        stageGroupRef.current.rotation.y,
        isMobile ? scrollState.stageRotY * 0.65 : scrollState.stageRotY,
        damp
      );
      const targetScale = isMobile ? 0.65 : 1.0;
      const nextScale = THREE.MathUtils.lerp(
        stageGroupRef.current.scale.x,
        targetScale,
        damp
      );
      stageGroupRef.current.scale.setScalar(nextScale);
    }

    // Camera choreography + subtle cursor parallax (max ~2-3 degrees) + mobile framing
    const lookX = isMobile
      ? scrollState.cameraLookAt.x * 0.25
      : scrollState.cameraLookAt.x;
    const lookY = scrollState.cameraLookAt.y + (isMobile ? 0.45 : 0);
    const lookZ = isMobile
      ? scrollState.cameraLookAt.z * 0.25
      : scrollState.cameraLookAt.z;

    desiredTargetVec.set(lookX, lookY, lookZ);
    currentTargetRef.current.lerp(desiredTargetVec, damp);

    camOffsetVec.set(
      scrollState.cameraPos.x - scrollState.cameraLookAt.x,
      scrollState.cameraPos.y - scrollState.cameraLookAt.y,
      scrollState.cameraPos.z - scrollState.cameraLookAt.z
    );
    if (isMobile) {
      camOffsetVec.multiplyScalar(1.28);
    }

    const parallaxX = pointerRef.current.x * (isMobile ? 0.14 : 0.42);
    const parallaxY = -pointerRef.current.y * (isMobile ? 0.1 : 0.28);
    const parallaxZ = -pointerRef.current.x * (isMobile ? 0.1 : 0.3);

    desiredCamPosVec.set(
      desiredTargetVec.x + camOffsetVec.x + parallaxX,
      desiredTargetVec.y + camOffsetVec.y + parallaxY,
      desiredTargetVec.z + camOffsetVec.z + parallaxZ
    );

    state.camera.position.lerp(desiredCamPosVec, damp);
    state.camera.lookAt(currentTargetRef.current);
  });

  return (
    <>
      {/* Continuous Matte Plaster Floor for crisp contrast against white ceramic blocks */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#E8EEF5"
          roughness={0.9}
          metalness={0.02}
          roughnessMap={floorMicroTexture}
          bumpMap={floorMicroTexture}
          bumpScale={0.006}
        />
      </mesh>

      {/* Architectural Tile Grid */}
      <Grid
        position={[0, 0.004, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#d5dde8"
        sectionSize={4}
        sectionThickness={1.0}
        sectionColor="#cbd5e1"
        fadeDistance={22}
        fadeStrength={1.6}
        infiniteGrid
      />

      {/* Scalable Isometric Architectural Stage */}
      <group ref={stageGroupRef}>
        {/* Baked Soft Contact Shadows replacing heavy real-time N8AO */}
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.22}
          scale={14}
          blur={2.2}
          far={3}
          frames={1}
          resolution={256}
          color="#334155"
        />

        {/* Procedural Teal Radial Floor Underglows (Light Mode Contrast Layer) */}
        {radialGlowTexture && (
          <>
            <mesh
              ref={floorGlow1Ref}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[1.05, 0.015, -1.05]}
            >
              <planeGeometry args={[2.9, 2.2]} />
              <meshBasicMaterial
                ref={floorGlowMat1Ref}
                map={radialGlowTexture}
                color="#ffffff"
                transparent
                opacity={0.75}
                depthWrite={false}
              />
            </mesh>

            <mesh
              ref={floorGlow2Ref}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[-1.25, 0.015, 1.05]}
            >
              <planeGeometry args={[2.1, 2.1]} />
              <meshBasicMaterial
                ref={floorGlowMat2Ref}
                map={radialGlowTexture}
                color="#ffffff"
                transparent
                opacity={0.75}
                depthWrite={false}
              />
            </mesh>

            <mesh
              ref={floorGlow4Ref}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[-1.45, 0.015, -1.25]}
            >
              <planeGeometry args={[1.9, 2.15]} />
              <meshBasicMaterial
                ref={floorGlowMat4Ref}
                map={radialGlowTexture}
                color="#ffffff"
                transparent
                opacity={0.75}
                depthWrite={false}
              />
            </mesh>
          </>
        )}

        {/* Block 1: Primary wide plinth with recessed teal underglow */}
        <group ref={block1Ref} position={[1.05, 0.34, -1.05]}>
          <RoundedBox
            args={[2.1, 0.42, 1.4]}
            radius={0.08}
            smoothness={6}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color="#FFFFFF"
              roughness={0.42}
              metalness={0.04}
              clearcoat={0.22}
              clearcoatRoughness={0.25}
              roughnessMap={blockMicroTexture}
              bumpMap={blockMicroTexture}
              bumpScale={0.006}
            />
          </RoundedBox>
          <mesh position={[0, -0.215, 0]}>
            <boxGeometry args={[1.92, 0.035, 1.22]} />
            <meshStandardMaterial
              ref={stripMat1Ref}
              color={DEFAULT_ACCENT_COLOR}
              emissive={DEFAULT_ACCENT_COLOR}
              emissiveIntensity={1.55}
              roughness={0.25}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            ref={glowLight1Ref}
            position={[0, -0.26, 0]}
            color={DEFAULT_ACCENT_COLOR}
            intensity={0.8}
            distance={4}
            decay={2}
          />
        </group>

        {/* Block 2: Tall architectural monolith with recessed teal underglow */}
        <group ref={block2Ref} position={[-1.25, 0.58, 1.05]}>
          <RoundedBox
            args={[1.25, 0.92, 1.25]}
            radius={0.08}
            smoothness={6}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color="#FFFFFF"
              roughness={0.42}
              metalness={0.04}
              clearcoat={0.22}
              clearcoatRoughness={0.25}
              roughnessMap={blockMicroTexture}
              bumpMap={blockMicroTexture}
              bumpScale={0.006}
            />
          </RoundedBox>
          <mesh position={[0, -0.465, 0]}>
            <boxGeometry args={[1.08, 0.035, 1.08]} />
            <meshStandardMaterial
              ref={stripMat2Ref}
              color={DEFAULT_ACCENT_COLOR}
              emissive={DEFAULT_ACCENT_COLOR}
              emissiveIntensity={1.55}
              roughness={0.25}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            ref={glowLight2Ref}
            position={[0, -0.5, 0]}
            color={DEFAULT_ACCENT_COLOR}
            intensity={0.8}
            distance={4}
            decay={2}
          />
        </group>

        {/* Block 3: Low stepping slab */}
        <group ref={block3Ref} position={[1.35, 0.22, 1.35]}>
          <RoundedBox
            args={[1.55, 0.28, 1.1]}
            radius={0.08}
            smoothness={6}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color="#FFFFFF"
              roughness={0.42}
              metalness={0.04}
              clearcoat={0.22}
              clearcoatRoughness={0.25}
              roughnessMap={blockMicroTexture}
              bumpMap={blockMicroTexture}
              bumpScale={0.006}
            />
          </RoundedBox>
        </group>

        {/* Block 4: Secondary architectural block with recessed teal underglow */}
        <group ref={block4Ref} position={[-1.45, 0.38, -1.25]}>
          <RoundedBox
            args={[1.05, 0.56, 1.3]}
            radius={0.08}
            smoothness={6}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color="#FFFFFF"
              roughness={0.42}
              metalness={0.04}
              clearcoat={0.22}
              clearcoatRoughness={0.25}
              roughnessMap={blockMicroTexture}
              bumpMap={blockMicroTexture}
              bumpScale={0.006}
            />
          </RoundedBox>
          <mesh position={[0, -0.285, 0]}>
            <boxGeometry args={[0.9, 0.035, 1.12]} />
            <meshStandardMaterial
              ref={stripMat4Ref}
              color={DEFAULT_ACCENT_COLOR}
              emissive={DEFAULT_ACCENT_COLOR}
              emissiveIntensity={1.55}
              roughness={0.25}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Closed Curved Brushed-Silver Physical Track */}
        <mesh geometry={tubeGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.65}
            roughness={0.28}
            roughnessMap={brushedMetalTexture}
          />
        </mesh>

        {/* Rolling / Hovering Brushed Champagne-Gold Metallic Disc */}
        <group ref={discCarrierRef}>
          <group ref={discSpinRef}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
              <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, 0.075, 48]} />
              <meshPhysicalMaterial
                color="#F6D88C"
                metalness={0.68}
                roughness={0.2}
                emissive="#8a6d28"
                emissiveIntensity={0.12}
                roughnessMap={brushedMetalTexture}
                clearcoat={0.6}
                clearcoatRoughness={0.14}
                envMapIntensity={1.4}
              />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}
