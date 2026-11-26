"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Grid, RoundedBox } from "@react-three/drei";
import {
  DEFAULT_ACCENT_COLOR,
  PROJECT_ACCENT_COLORS,
  scrollState,
} from "@/lib/scrollState";

const DISC_RADIUS = 0.26;
const HERO_STAGE_OFFSET_X = 1.65;

const LIGHT_ACCENT_COLOR = "#0D9488";
const DARK_ACCENT_COLOR = "#2DD4BF";

const LIGHT_FLOOR_COLOR = new THREE.Color("#E2E8F0");
const DARK_FLOOR_COLOR = new THREE.Color("#0F172A");
const LIGHT_GRID_CELL = new THREE.Color("#cbd5e1");
const DARK_GRID_CELL = new THREE.Color("#1E293B");
const LIGHT_GRID_SECTION = new THREE.Color("#94a3b8");
const DARK_GRID_SECTION = new THREE.Color("#334155");
const LIGHT_BLOCK_COLOR = new THREE.Color("#FFFFFF");
const DARK_BLOCK_COLOR = new THREE.Color("#1E293B");
const LIGHT_TRACK_COLOR = new THREE.Color("#94A3B8");
const DARK_TRACK_COLOR = new THREE.Color("#64748B");
const LIGHT_COIN_COLOR = new THREE.Color("#D9A84E");
const DARK_COIN_COLOR = new THREE.Color("#F5D07A");
const LIGHT_COIN_EMISSIVE = new THREE.Color("#5c4314");
const DARK_COIN_EMISSIVE = new THREE.Color("#8a6418");

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
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.78)");
  gradient.addColorStop(0.45, "rgba(255, 255, 255, 0.34)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

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

function isOverInteractiveHtml(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "a, button, input, textarea, select, [role='button'], [data-interactive]"
      )
    )
  );
}

function isDragBlockedTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "a, button, input, textarea, select, [role='button'], [data-interactive], canvas"
      )
    )
  );
}

export default function IsometricStage() {
  const stageGroupRef = useRef<THREE.Group>(null);
  const block1Ref = useRef<THREE.Group>(null);
  const block2Ref = useRef<THREE.Group>(null);
  const block3Ref = useRef<THREE.Group>(null);
  const block4Ref = useRef<THREE.Group>(null);

  const floorMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const gridMeshRef = useRef<THREE.Mesh>(null);
  const blockMat1Ref = useRef<THREE.MeshPhysicalMaterial>(null);
  const blockMat2Ref = useRef<THREE.MeshPhysicalMaterial>(null);
  const blockMat3Ref = useRef<THREE.MeshPhysicalMaterial>(null);
  const blockMat4Ref = useRef<THREE.MeshPhysicalMaterial>(null);
  const trackMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const discMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

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
  const coinGlowLightRef = useRef<THREE.PointLight>(null);

  const cursorAuraRef = useRef<THREE.Mesh>(null);
  const cursorAuraMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const cursorLightRef = useRef<THREE.PointLight>(null);

  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerActiveRef = useRef(false);
  const cursorAuraAlphaRef = useRef(0);
  const progressRef = useRef(0);
  const hoverSpinRef = useRef(0);
  const themeBlendRef = useRef(0);
  const coinHoveredRef = useRef(false);
  const coinHoverBlendRef = useRef(0);
  const coinBoostRef = useRef(0);
  const coinJumpRef = useRef(0);

  // Interactive 4-block state
  const hoveredBlockRef = useRef<number | null>(null);
  const blockHoverBlendRef = useRef<[number, number, number, number]>([0, 0, 0, 0]);
  const blockPulseRef = useRef<[number, number, number, number]>([0, 0, 0, 0]);
  const stageGlowPulseRef = useRef(0);

  // Drag-to-rotate stage state
  const pointerDownRef = useRef(false);
  const isDraggingStageRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragLastXRef = useRef(0);
  const dragMovedRef = useRef(false);
  const dragRotOffsetRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const returningToScrollRef = useRef(false);

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
    raycaster: new THREE.Raycaster(),
    floorPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    pointerNdc: new THREE.Vector2(),
    cursorHitVec: new THREE.Vector3(),
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

  const syncCursor = useCallback(() => {
    if (isDraggingStageRef.current) {
      document.body.style.cursor = "grabbing";
    } else if (coinHoveredRef.current || hoveredBlockRef.current !== null) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "";
    }
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointerActiveRef.current = true;

      if (pointerDownRef.current) {
        const dx = event.clientX - dragLastXRef.current;
        const totalDx = Math.abs(event.clientX - dragStartXRef.current);
        if (totalDx > 5 && !isDraggingStageRef.current) {
          isDraggingStageRef.current = true;
          dragMovedRef.current = true;
          returningToScrollRef.current = false;
          syncCursor();
        }
        if (isDraggingStageRef.current) {
          const deltaRot = dx * 0.0065;
          dragRotOffsetRef.current += deltaRot;
          dragVelocityRef.current = deltaRot;
        }
        dragLastXRef.current = event.clientX;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button === 0 && !isDragBlockedTarget(event.target)) {
        pointerDownRef.current = true;
        dragMovedRef.current = false;
        dragStartXRef.current = event.clientX;
        dragLastXRef.current = event.clientX;
        dragVelocityRef.current = 0;
      }
    };

    const handlePointerUp = () => {
      if (pointerDownRef.current || isDraggingStageRef.current) {
        pointerDownRef.current = false;
        isDraggingStageRef.current = false;
        syncCursor();
      }
    };

    const handlePointerLeave = () => {
      pointerActiveRef.current = false;
    };

    const handleScroll = () => {
      if (
        Math.abs(dragRotOffsetRef.current) > 0.001 ||
        Math.abs(dragVelocityRef.current) > 0.0001
      ) {
        returningToScrollRef.current = true;
        dragVelocityRef.current = 0;
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    document.documentElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
      { passive: true }
    );
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );
      window.removeEventListener("scroll", handleScroll);
      coinHoveredRef.current = false;
      hoveredBlockRef.current = null;
      isDraggingStageRef.current = false;
      document.body.style.cursor = "";
    };
  }, [syncCursor]);

  const handleCoinPointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (isDraggingStageRef.current || isOverInteractiveHtml(e.nativeEvent.target)) {
        if (coinHoveredRef.current) {
          coinHoveredRef.current = false;
          syncCursor();
        }
        return;
      }
      e.stopPropagation();
      coinHoveredRef.current = true;
      syncCursor();
    },
    [syncCursor]
  );

  const handleCoinPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (isDraggingStageRef.current || isOverInteractiveHtml(e.nativeEvent.target)) {
        if (coinHoveredRef.current) {
          coinHoveredRef.current = false;
          syncCursor();
        }
        return;
      }
      e.stopPropagation();
      if (!coinHoveredRef.current) {
        coinHoveredRef.current = true;
        syncCursor();
      }
    },
    [syncCursor]
  );

  const handleCoinPointerOut = useCallback(() => {
    coinHoveredRef.current = false;
    syncCursor();
  }, [syncCursor]);

  const handleCoinClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (dragMovedRef.current || isOverInteractiveHtml(e.nativeEvent.target)) {
      return;
    }
    e.stopPropagation();
    coinBoostRef.current = Math.min(coinBoostRef.current + 1.0, 2.2);
    coinJumpRef.current = 1.0;
  }, []);

  const handleBlockPointerOver = useCallback(
    (index: number, e: ThreeEvent<PointerEvent>) => {
      if (isDraggingStageRef.current || isOverInteractiveHtml(e.nativeEvent.target)) {
        if (hoveredBlockRef.current === index) {
          hoveredBlockRef.current = null;
          syncCursor();
        }
        return;
      }
      e.stopPropagation();
      hoveredBlockRef.current = index;
      syncCursor();
    },
    [syncCursor]
  );

  const handleBlockPointerMove = useCallback(
    (index: number, e: ThreeEvent<PointerEvent>) => {
      if (isDraggingStageRef.current || isOverInteractiveHtml(e.nativeEvent.target)) {
        if (hoveredBlockRef.current === index) {
          hoveredBlockRef.current = null;
          syncCursor();
        }
        return;
      }
      e.stopPropagation();
      if (hoveredBlockRef.current !== index) {
        hoveredBlockRef.current = index;
        syncCursor();
      }
    },
    [syncCursor]
  );

  const handleBlockPointerOut = useCallback(
    (index: number) => {
      if (hoveredBlockRef.current === index) {
        hoveredBlockRef.current = null;
        syncCursor();
      }
    },
    [syncCursor]
  );

  const handleBlockClick = useCallback(
    (index: number, e: ThreeEvent<MouseEvent>) => {
      if (dragMovedRef.current || isOverInteractiveHtml(e.nativeEvent.target)) {
        return;
      }
      e.stopPropagation();
      blockPulseRef.current[index] = 1.0;
      for (let j = 0; j < 4; j += 1) {
        if (j !== index) {
          blockPulseRef.current[j] = Math.max(blockPulseRef.current[j], 0.35);
        }
      }
      stageGlowPulseRef.current = 1.0;
    },
    []
  );

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
      raycaster,
      floorPlane,
      pointerNdc,
      cursorHitVec,
    } = scratchRef.current;

    const safeDelta = Math.min(delta, 0.1);
    const damp = 1 - Math.exp(-5 * safeDelta);
    const colorDamp = 1 - Math.exp(-4.5 * safeDelta);
    const themeDamp = 1 - Math.exp(-5 * safeDelta);
    const elapsed = state.clock.getElapsedTime();
    const isMobile = viewport.width < 6;
    const isDark = scrollState.isDark;

    themeBlendRef.current = THREE.MathUtils.lerp(
      themeBlendRef.current,
      isDark ? 1 : 0,
      themeDamp
    );
    const darkBlend = themeBlendRef.current;

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
    const defaultAccentHex = isDark ? DARK_ACCENT_COLOR : LIGHT_ACCENT_COLOR;
    const targetHex =
      (hoveredId && PROJECT_ACCENT_COLORS[hoveredId]) || defaultAccentHex;
    targetColor.set(targetHex);
    currentAccentColor.lerp(targetColor, colorDamp);

    // Smoothly interpolate floor, grid, blocks, track, and gold coin materials between Light and Dark presets
    if (floorMatRef.current) {
      floorMatRef.current.color.lerp(
        isDark ? DARK_FLOOR_COLOR : LIGHT_FLOOR_COLOR,
        themeDamp
      );
    }

    if (
      gridMeshRef.current &&
      gridMeshRef.current.material instanceof THREE.ShaderMaterial
    ) {
      const uniforms = gridMeshRef.current.material.uniforms;
      if (uniforms.cellColor?.value instanceof THREE.Color) {
        uniforms.cellColor.value.lerp(
          isDark ? DARK_GRID_CELL : LIGHT_GRID_CELL,
          themeDamp
        );
      }
      if (uniforms.sectionColor?.value instanceof THREE.Color) {
        uniforms.sectionColor.value.lerp(
          isDark ? DARK_GRID_SECTION : LIGHT_GRID_SECTION,
          themeDamp
        );
      }
    }

    const blockMats = [
      blockMat1Ref.current,
      blockMat2Ref.current,
      blockMat3Ref.current,
      blockMat4Ref.current,
    ];
    for (let i = 0; i < blockMats.length; i += 1) {
      const mat = blockMats[i];
      if (!mat) continue;
      mat.color.lerp(isDark ? DARK_BLOCK_COLOR : LIGHT_BLOCK_COLOR, themeDamp);
      mat.roughness = THREE.MathUtils.lerp(
        mat.roughness,
        isDark ? 0.48 : 0.42,
        themeDamp
      );
      mat.metalness = THREE.MathUtils.lerp(
        mat.metalness,
        isDark ? 0.08 : 0.04,
        themeDamp
      );
      mat.clearcoat = THREE.MathUtils.lerp(
        mat.clearcoat,
        isDark ? 0.15 : 0.22,
        themeDamp
      );
    }

    if (trackMatRef.current) {
      trackMatRef.current.color.lerp(
        isDark ? DARK_TRACK_COLOR : LIGHT_TRACK_COLOR,
        themeDamp
      );
      trackMatRef.current.metalness = THREE.MathUtils.lerp(
        trackMatRef.current.metalness,
        isDark ? 0.7 : 0.55,
        themeDamp
      );
      trackMatRef.current.roughness = THREE.MathUtils.lerp(
        trackMatRef.current.roughness,
        isDark ? 0.25 : 0.32,
        themeDamp
      );
    }

    // Smoothly interpolate coin hover, boost energy, and parabolic jump arc
    coinHoverBlendRef.current = THREE.MathUtils.lerp(
      coinHoverBlendRef.current,
      coinHoveredRef.current ? 1 : 0,
      1 - Math.exp(-9 * safeDelta)
    );
    coinBoostRef.current *= Math.exp(-2.2 * safeDelta);
    if (coinBoostRef.current < 0.001) {
      coinBoostRef.current = 0;
    }
    coinJumpRef.current = Math.max(0, coinJumpRef.current - safeDelta * 1.8);
    const coinHoverBlend = coinHoverBlendRef.current;
    const coinBoost = coinBoostRef.current;
    const jumpArc = Math.sin(coinJumpRef.current * Math.PI);

    if (discMatRef.current) {
      discMatRef.current.color.lerp(
        isDark ? DARK_COIN_COLOR : LIGHT_COIN_COLOR,
        themeDamp
      );
      discMatRef.current.metalness = THREE.MathUtils.lerp(
        discMatRef.current.metalness,
        isDark ? 0.82 : 0.78,
        themeDamp
      );
      discMatRef.current.roughness = THREE.MathUtils.lerp(
        discMatRef.current.roughness,
        isDark ? 0.18 : 0.22,
        themeDamp
      );
      discMatRef.current.emissive.lerp(
        isDark ? DARK_COIN_EMISSIVE : LIGHT_COIN_EMISSIVE,
        themeDamp
      );
      const targetCoinEmissive =
        (isDark ? 0.15 : 0.06) + coinHoverBlend * 0.35 + coinBoost * 0.45;
      discMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        discMatRef.current.emissiveIntensity,
        targetCoinEmissive,
        1 - Math.exp(-8 * safeDelta)
      );
    }

    if (coinGlowLightRef.current) {
      coinGlowLightRef.current.intensity =
        (coinHoverBlend * 0.9 + coinBoost * 1.4) *
        THREE.MathUtils.lerp(0.8, 1.3, darkBlend);
    }

    // Update 4-block hover blends, tactile click spring pulses, and stage glow ripple
    stageGlowPulseRef.current *= Math.exp(-3.2 * safeDelta);
    if (stageGlowPulseRef.current < 0.001) {
      stageGlowPulseRef.current = 0;
    }
    const stageGlowPulse = stageGlowPulseRef.current;
    const blockHoverDamp = 1 - Math.exp(-9 * safeDelta);
    const blockHoverBlends = blockHoverBlendRef.current;
    const blockPulses = blockPulseRef.current;

    for (let i = 0; i < 4; i += 1) {
      blockHoverBlends[i] = THREE.MathUtils.lerp(
        blockHoverBlends[i],
        hoveredBlockRef.current === i ? 1 : 0,
        blockHoverDamp
      );
      blockPulses[i] = Math.max(0, blockPulses[i] - safeDelta * 2.1);
    }

    if (blockMat3Ref.current) {
      const b3Energy = blockHoverBlends[2] * 0.22 + blockPulses[2] * 0.35;
      blockMat3Ref.current.emissive.copy(currentAccentColor);
      blockMat3Ref.current.emissiveIntensity = b3Energy;
    }

    // Update radial floor glow opacity, emissive strips, and bounce point lights
    const baseFloorOpacity = THREE.MathUtils.lerp(0.42, 0.68, darkBlend);
    const glowFactor =
      THREE.MathUtils.clamp(glowRef.current / 0.8, 0.75, 1.35) *
      (isHovered ? 1.15 : 1.0);
    const floorGlowOpacity = THREE.MathUtils.clamp(
      baseFloorOpacity * glowFactor,
      0.3,
      0.88
    );
    const baseStripIntensity = THREE.MathUtils.lerp(1.25, 1.95, darkBlend);
    const stripEmissiveIntensity = Math.max(
      1.1,
      baseStripIntensity * (glowRef.current / 0.8) * (isHovered ? 1.25 : 1.0)
    );

    const floorGlowTargets = [
      { mat: floorGlowMat1Ref.current, idx: 0 },
      { mat: floorGlowMat2Ref.current, idx: 1 },
      { mat: floorGlowMat4Ref.current, idx: 3 },
    ];
    for (let i = 0; i < floorGlowTargets.length; i += 1) {
      const { mat, idx } = floorGlowTargets[i];
      if (mat) {
        const boost =
          blockHoverBlends[idx] * 0.22 +
          blockPulses[idx] * 0.26 +
          stageGlowPulse * 0.1;
        mat.color.copy(currentAccentColor);
        mat.opacity = THREE.MathUtils.clamp(floorGlowOpacity + boost, 0.3, 0.96);
      }
    }

    const stripTargets = [
      { mat: stripMat1Ref.current, idx: 0 },
      { mat: stripMat2Ref.current, idx: 1 },
      { mat: stripMat4Ref.current, idx: 3 },
    ];
    for (let i = 0; i < stripTargets.length; i += 1) {
      const { mat, idx } = stripTargets[i];
      if (mat) {
        const boost =
          blockHoverBlends[idx] * 0.85 +
          blockPulses[idx] * 1.1 +
          stageGlowPulse * 0.35;
        mat.color.copy(currentAccentColor);
        mat.emissive.copy(currentAccentColor);
        mat.emissiveIntensity = stripEmissiveIntensity + boost;
      }
    }

    const targetGlowIntensity =
      glowRef.current *
      THREE.MathUtils.lerp(0.85, 1.35, darkBlend) *
      (isHovered ? 1.3 : 1.0);
    if (glowLight1Ref.current) {
      glowLight1Ref.current.color.copy(currentAccentColor);
      glowLight1Ref.current.intensity = THREE.MathUtils.lerp(
        glowLight1Ref.current.intensity,
        targetGlowIntensity +
          blockHoverBlends[0] * 0.85 +
          blockPulses[0] * 1.1 +
          stageGlowPulse * 0.35,
        colorDamp
      );
    }
    if (glowLight2Ref.current) {
      glowLight2Ref.current.color.copy(currentAccentColor);
      glowLight2Ref.current.intensity = THREE.MathUtils.lerp(
        glowLight2Ref.current.intensity,
        targetGlowIntensity +
          blockHoverBlends[1] * 0.85 +
          blockPulses[1] * 1.1 +
          stageGlowPulse * 0.35,
        colorDamp
      );
    }

    // Apply tiered elevation, exploded spread, hover lift, tactile bounce, and wave breathing across the 4 blocks
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

      const pulse = blockPulses[i];
      const bounceY = -Math.sin(pulse * Math.PI * 2) * pulse * 0.22;

      const targetX = cfg.baseX + spreadRef.current * cfg.spreadX + driftX;
      const targetY =
        cfg.baseY +
        elevationRef.current * cfg.elevationTier +
        waveY +
        blockHoverBlends[i] * 0.18 +
        bounceY;
      const targetZ = cfg.baseZ + spreadRef.current * cfg.spreadZ + driftZ;

      block.position.x = THREE.MathUtils.lerp(block.position.x, targetX, damp);
      block.position.y = THREE.MathUtils.lerp(block.position.y, targetY, damp);
      block.position.z = THREE.MathUtils.lerp(block.position.z, targetZ, damp);
      block.scale.setScalar(
        1 + blockHoverBlends[i] * 0.025 + Math.max(0, bounceY) * 0.12
      );
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
    const speedMultiplier = (isHovered ? 1.25 : 1.0) * (1 + coinBoost * 2.4);
    const deltaProgress =
      0.065 * trackSpeedRef.current * speedMultiplier * safeDelta;
    progressRef.current = (progressRef.current + deltaProgress) % 1;

    curve.getPointAt(progressRef.current, trackPosVec);
    curve.getTangentAt(progressRef.current, tangentVec).normalize();

    trackPosVec.y += DISC_RADIUS + 0.04;
    hoverPosVec.set(0, 2.05 + Math.sin(elapsed * 1.6) * 0.14, 0);
    blendedPosVec.copy(trackPosVec).lerp(hoverPosVec, orbLiftRef.current);
    blendedPosVec.y += coinHoverBlend * 0.24 + jumpArc * 0.65;

    hoverSpinRef.current += safeDelta * (0.95 + coinBoost * 3.8);
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
      discCarrierRef.current.scale.setScalar(
        1 + coinHoverBlend * 0.08 + jumpArc * 0.1
      );
    }

    if (discSpinRef.current) {
      const distanceTraveled = deltaProgress * curveLength;
      discSpinRef.current.rotation.x +=
        (distanceTraveled / DISC_RADIUS + coinBoost * safeDelta * 4.5) *
        (1 - orbLiftRef.current);
    }

    // Stage offset (shift slightly right on Hero desktop for safe text negative space), drag rotation + auto-reset, and mobile scaling
    if (!isDraggingStageRef.current) {
      if (returningToScrollRef.current) {
        dragRotOffsetRef.current = THREE.MathUtils.lerp(
          dragRotOffsetRef.current,
          0,
          1 - Math.exp(-4.5 * safeDelta)
        );
        if (Math.abs(dragRotOffsetRef.current) < 0.002) {
          dragRotOffsetRef.current = 0;
          returningToScrollRef.current = false;
        }
      } else if (Math.abs(dragVelocityRef.current) > 0.0001) {
        dragRotOffsetRef.current += dragVelocityRef.current;
        dragVelocityRef.current *= Math.exp(-6 * safeDelta);
      } else {
        dragVelocityRef.current = 0;
      }
    }

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
      const targetStageRotY =
        (isMobile ? scrollState.stageRotY * 0.65 : scrollState.stageRotY) +
        dragRotOffsetRef.current;
      stageGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        stageGroupRef.current.rotation.y,
        targetStageRotY,
        isDraggingStageRef.current ? 1 - Math.exp(-16 * safeDelta) : damp
      );
      const targetScale = isMobile ? 0.65 : 1.0;
      const nextScale = THREE.MathUtils.lerp(
        stageGroupRef.current.scale.x,
        targetScale,
        damp
      );
      stageGroupRef.current.scale.setScalar(nextScale);
    }

    // Cursor floor aura & light raycast onto world y = 0 plane
    cursorAuraAlphaRef.current = THREE.MathUtils.lerp(
      cursorAuraAlphaRef.current,
      pointerActiveRef.current && !isMobile ? 1 : 0,
      1 - Math.exp(-6 * safeDelta)
    );
    pointerNdc.set(pointerRef.current.x, pointerRef.current.y);
    raycaster.setFromCamera(pointerNdc, state.camera);
    if (raycaster.ray.intersectPlane(floorPlane, cursorHitVec)) {
      const clampedX = THREE.MathUtils.clamp(cursorHitVec.x, -12, 12);
      const clampedZ = THREE.MathUtils.clamp(cursorHitVec.z, -12, 12);
      const auraLerp = 1 - Math.exp(-12 * safeDelta);
      if (cursorAuraRef.current) {
        cursorAuraRef.current.position.x = THREE.MathUtils.lerp(
          cursorAuraRef.current.position.x,
          clampedX,
          auraLerp
        );
        cursorAuraRef.current.position.z = THREE.MathUtils.lerp(
          cursorAuraRef.current.position.z,
          clampedZ,
          auraLerp
        );
      }
      if (cursorLightRef.current) {
        cursorLightRef.current.position.x = THREE.MathUtils.lerp(
          cursorLightRef.current.position.x,
          clampedX,
          auraLerp
        );
        cursorLightRef.current.position.z = THREE.MathUtils.lerp(
          cursorLightRef.current.position.z,
          clampedZ,
          auraLerp
        );
      }
    }
    if (cursorAuraMatRef.current) {
      cursorAuraMatRef.current.color.copy(currentAccentColor);
      cursorAuraMatRef.current.opacity =
        cursorAuraAlphaRef.current * THREE.MathUtils.lerp(0.32, 0.52, darkBlend);
    }
    if (cursorLightRef.current) {
      cursorLightRef.current.color.copy(currentAccentColor);
      cursorLightRef.current.intensity =
        cursorAuraAlphaRef.current * THREE.MathUtils.lerp(0.65, 1.35, darkBlend);
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
          ref={floorMatRef}
          color="#E2E8F0"
          roughness={0.9}
          metalness={0.02}
          roughnessMap={floorMicroTexture}
          bumpMap={floorMicroTexture}
          bumpScale={0.006}
        />
      </mesh>

      {/* Architectural Tile Grid */}
      <Grid
        ref={gridMeshRef}
        position={[0, 0.004, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#cbd5e1"
        sectionSize={4}
        sectionThickness={1.0}
        sectionColor="#94a3b8"
        fadeDistance={22}
        fadeStrength={1.6}
        infiniteGrid
      />

      {/* Cursor-following floor aura and accent bounce light */}
      {radialGlowTexture && (
        <mesh
          ref={cursorAuraRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
        >
          <planeGeometry args={[3.4, 3.4]} />
          <meshBasicMaterial
            ref={cursorAuraMatRef}
            map={radialGlowTexture}
            color={LIGHT_ACCENT_COLOR}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      )}
      <pointLight
        ref={cursorLightRef}
        position={[0, 0.55, 0]}
        color={LIGHT_ACCENT_COLOR}
        intensity={0}
        distance={5}
        decay={2}
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
                color={LIGHT_ACCENT_COLOR}
                transparent
                opacity={0.42}
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
                color={LIGHT_ACCENT_COLOR}
                transparent
                opacity={0.42}
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
                color={LIGHT_ACCENT_COLOR}
                transparent
                opacity={0.42}
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
            onPointerOver={(e) => handleBlockPointerOver(0, e)}
            onPointerMove={(e) => handleBlockPointerMove(0, e)}
            onPointerOut={() => handleBlockPointerOut(0)}
            onClick={(e) => handleBlockClick(0, e)}
          >
            <meshPhysicalMaterial
              ref={blockMat1Ref}
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
              color={LIGHT_ACCENT_COLOR}
              emissive={LIGHT_ACCENT_COLOR}
              emissiveIntensity={1.25}
              roughness={0.25}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            ref={glowLight1Ref}
            position={[0, -0.26, 0]}
            color={LIGHT_ACCENT_COLOR}
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
            onPointerOver={(e) => handleBlockPointerOver(1, e)}
            onPointerMove={(e) => handleBlockPointerMove(1, e)}
            onPointerOut={() => handleBlockPointerOut(1)}
            onClick={(e) => handleBlockClick(1, e)}
          >
            <meshPhysicalMaterial
              ref={blockMat2Ref}
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
              color={LIGHT_ACCENT_COLOR}
              emissive={LIGHT_ACCENT_COLOR}
              emissiveIntensity={1.25}
              roughness={0.25}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            ref={glowLight2Ref}
            position={[0, -0.5, 0]}
            color={LIGHT_ACCENT_COLOR}
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
            onPointerOver={(e) => handleBlockPointerOver(2, e)}
            onPointerMove={(e) => handleBlockPointerMove(2, e)}
            onPointerOut={() => handleBlockPointerOut(2)}
            onClick={(e) => handleBlockClick(2, e)}
          >
            <meshPhysicalMaterial
              ref={blockMat3Ref}
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
            onPointerOver={(e) => handleBlockPointerOver(3, e)}
            onPointerMove={(e) => handleBlockPointerMove(3, e)}
            onPointerOut={() => handleBlockPointerOut(3)}
            onClick={(e) => handleBlockClick(3, e)}
          >
            <meshPhysicalMaterial
              ref={blockMat4Ref}
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
              color={LIGHT_ACCENT_COLOR}
              emissive={LIGHT_ACCENT_COLOR}
              emissiveIntensity={1.25}
              roughness={0.25}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Closed Curved Brushed-Silver Physical Track */}
        <mesh geometry={tubeGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            ref={trackMatRef}
            color="#94A3B8"
            metalness={0.55}
            roughness={0.32}
            roughnessMap={brushedMetalTexture}
          />
        </mesh>

        {/* Rolling / Hovering Brushed Champagne-Gold Metallic Disc */}
        <group ref={discCarrierRef}>
          <pointLight
            ref={coinGlowLightRef}
            color="#F5D07A"
            intensity={0}
            distance={2.6}
            decay={2}
          />
          <mesh
            onPointerOver={handleCoinPointerOver}
            onPointerMove={handleCoinPointerMove}
            onPointerOut={handleCoinPointerOut}
            onClick={handleCoinClick}
          >
            <sphereGeometry args={[DISC_RADIUS * 1.45, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <group ref={discSpinRef}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
              <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, 0.075, 48]} />
              <meshPhysicalMaterial
                ref={discMatRef}
                color="#D9A84E"
                metalness={0.78}
                roughness={0.22}
                emissive="#5c4314"
                emissiveIntensity={0.06}
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
