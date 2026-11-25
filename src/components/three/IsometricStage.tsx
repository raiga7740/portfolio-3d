"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid, RoundedBox } from "@react-three/drei";
import {
  DEFAULT_ACCENT_COLOR,
  PROJECT_ACCENT_COLORS,
  scrollState,
} from "@/lib/scrollState";

const DISC_RADIUS = 0.26;

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

export default function IsometricStage() {
  const stageGroupRef = useRef<THREE.Group>(null);
  const block1Ref = useRef<THREE.Group>(null);
  const block2Ref = useRef<THREE.Group>(null);
  const block3Ref = useRef<THREE.Group>(null);
  const block4Ref = useRef<THREE.Group>(null);

  const glowMat1Ref = useRef<THREE.MeshBasicMaterial>(null);
  const glowMat2Ref = useRef<THREE.MeshBasicMaterial>(null);
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

  // Closed curved track weaving cleanly around the 4 blocks
  const { tubeGeometry, curve, curveLength } = useMemo(() => {
    const points = [
      new THREE.Vector3(0.0, 0.04, 0.22),
      new THREE.Vector3(2.55, 0.04, 0.22),
      new THREE.Vector3(2.65, 0.04, -2.1),
      new THREE.Vector3(-0.45, 0.04, -2.45),
      new THREE.Vector3(-2.55, 0.04, -2.05),
      new THREE.Vector3(-2.55, 0.04, 0.05),
      new THREE.Vector3(-2.35, 0.04, 2.25),
      new THREE.Vector3(0.0, 0.04, 2.35),
      new THREE.Vector3(0.0, 0.04, 1.15),
    ];
    const spline = new THREE.CatmullRomCurve3(points, true, "centripetal");
    const geometry = new THREE.TubeGeometry(spline, 180, 0.032, 12, true);
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

    // Update teal underglow materials and short-range bounce point lights
    if (glowMat1Ref.current) {
      glowMat1Ref.current.color.copy(currentAccentColor);
    }
    if (glowMat2Ref.current) {
      glowMat2Ref.current.color.copy(currentAccentColor);
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

    // Kinetic loop: blend smoothly between track rolling (orbLift=0) and hovering orbit (orbLift=1)
    const speedMultiplier = isHovered ? 1.25 : 1.0;
    const deltaProgress =
      0.065 * trackSpeedRef.current * speedMultiplier * safeDelta;
    progressRef.current = (progressRef.current + deltaProgress) % 1;

    curve.getPointAt(progressRef.current, trackPosVec);
    curve.getTangentAt(progressRef.current, tangentVec).normalize();

    trackPosVec.y += DISC_RADIUS + 0.02;
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

    // Stage offset, rotation, and mobile scaling
    if (stageGroupRef.current) {
      desiredStagePosVec.set(
        isMobile ? 0 : scrollState.stageOffset.x,
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
      {/* Continuous Matte Architectural Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>

      {/* Architectural Tile Grid */}
      <Grid
        position={[0, 0.004, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.55}
        cellColor="#e2e8f0"
        sectionSize={4}
        sectionThickness={1.0}
        sectionColor="#cbd5e1"
        fadeDistance={22}
        fadeStrength={1.6}
        infiniteGrid
      />

      {/* Scalable Isometric Architectural Stage */}
      <group ref={stageGroupRef}>
        {/* Block 1: Primary wide plinth with recessed teal underglow */}
        <group ref={block1Ref} position={[1.05, 0.34, -1.05]}>
          <RoundedBox
            args={[2.1, 0.42, 1.4]}
            radius={0.06}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.7}
              metalness={0.03}
            />
          </RoundedBox>
          <mesh position={[0, -0.215, 0]}>
            <boxGeometry args={[1.92, 0.035, 1.22]} />
            <meshBasicMaterial
              ref={glowMat1Ref}
              color={DEFAULT_ACCENT_COLOR}
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
            radius={0.06}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.7}
              metalness={0.03}
            />
          </RoundedBox>
          <mesh position={[0, -0.465, 0]}>
            <boxGeometry args={[1.08, 0.035, 1.08]} />
            <meshBasicMaterial
              ref={glowMat2Ref}
              color={DEFAULT_ACCENT_COLOR}
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
            radius={0.06}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.7}
              metalness={0.03}
            />
          </RoundedBox>
        </group>

        {/* Block 4: Secondary architectural block */}
        <group ref={block4Ref} position={[-1.45, 0.38, -1.25]}>
          <RoundedBox
            args={[1.05, 0.56, 1.3]}
            radius={0.06}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.7}
              metalness={0.03}
            />
          </RoundedBox>
        </group>

        {/* Closed Curved Physical Track */}
        <mesh geometry={tubeGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.45}
            metalness={0.35}
          />
        </mesh>

        {/* Rolling / Hovering Champagne-Gold Metallic Disc */}
        <group ref={discCarrierRef}>
          <group ref={discSpinRef}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
              <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, 0.075, 48]} />
              <meshPhysicalMaterial
                color="#e5c17b"
                metalness={0.9}
                roughness={0.18}
                clearcoat={0.4}
                clearcoatRoughness={0.15}
              />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}
