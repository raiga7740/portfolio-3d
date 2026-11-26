"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "@/context/ThemeContext";
import { scrollState } from "@/lib/scrollState";
import type { GalleryItem } from "@/data/portfolio";

const LIGHT_FRAME_COLOR = new THREE.Color("#ffffff");
const DARK_FRAME_COLOR = new THREE.Color("#1E293B");
const LIGHT_PLACEHOLDER_COLOR = new THREE.Color("#e2e8f0");
const DARK_PLACEHOLDER_COLOR = new THREE.Color("#1E293B");

export interface StepCommand {
  delta: number;
  seq: number;
}

export interface GalleryCarousel3DProps {
  items: readonly GalleryItem[];
  stepCommand: StepCommand;
  isActive: boolean;
  onActiveIndexChange: (index: number) => void;
  onSelectItem: (item: GalleryItem) => void;
}

interface PanelGeometryBundle {
  panelGeo: THREE.PlaneGeometry;
  frameGeo: THREE.PlaneGeometry;
  width: number;
  height: number;
}

function createCurvedPlaneGeometry(
  width: number,
  height: number,
  curveRadius: number
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(width, height, 24, 1);
  const pos = geometry.attributes.position;

  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const theta = x / curveRadius;
    pos.setX(i, Math.sin(theta) * curveRadius);
    pos.setZ(i, (Math.cos(theta) - 1) * curveRadius);
  }

  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function computePanelDimensions(
  itemWidth: number,
  itemHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  const aspect = itemWidth / itemHeight;
  if (aspect >= maxWidth / maxHeight) {
    return { width: maxWidth, height: maxWidth / aspect };
  }
  return { width: maxHeight * aspect, height: maxHeight };
}

interface CarouselRigProps {
  items: readonly GalleryItem[];
  stepCommand: StepCommand;
  onActiveIndexChange: (index: number) => void;
  onSelectItem: (item: GalleryItem) => void;
  onHoverPanelChange: (hovering: boolean) => void;
  dragDistanceRef: React.MutableRefObject<number>;
  targetRotationRef: React.MutableRefObject<number>;
}

function CarouselRig({
  items,
  stepCommand,
  onActiveIndexChange,
  onSelectItem,
  onHoverPanelChange,
  dragDistanceRef,
  targetRotationRef,
}: CarouselRigProps) {
  const carouselGroupRef = useRef<THREE.Group>(null);
  const panelRefs = useRef<(THREE.Group | null)[]>([]);
  const frameMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const placeholderMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const currentRotationRef = useRef(0);
  const hoveredIndexRef = useRef<number | null>(null);
  const lastReportedIndexRef = useRef(0);
  const lastProcessedSeqRef = useRef(0);

  const [textures, setTextures] = useState<Record<string, THREE.Texture>>({});

  const { theme } = useTheme();
  const { viewport, gl, invalidate } = useThree();
  const isMobile = viewport.width < 6;

  useEffect(() => {
    invalidate();
  }, [theme, invalidate]);

  const count = items.length;
  const angleStep = (Math.PI * 2) / count;
  const radius = isMobile ? 1.68 : 4.35;
  const maxWidth = isMobile ? 1.24 : 2.05;
  const maxHeight = isMobile ? 1.46 : 1.95;

  // Load all gallery WebP textures via THREE.TextureLoader inside useEffect and dispose on unmount
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const loadedTextures: THREE.Texture[] = [];
    const maxAnisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());

    items.forEach((item) => {
      loader.load(
        item.image,
        (texture) => {
          if (cancelled) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = maxAnisotropy;
          texture.needsUpdate = true;
          loadedTextures.push(texture);

          setTextures((prev) => ({
            ...prev,
            [item.id]: texture,
          }));
          invalidate();
        },
        undefined,
        () => {
          // Ignore individual texture failures cleanly so other artworks still render
        }
      );
    });

    return () => {
      cancelled = true;
      loadedTextures.forEach((tex) => tex.dispose());
    };
  }, [items, gl, invalidate]);

  // Build aspect-preserved curved geometries and dispose when layout mode changes or on unmount
  const geometryBundles = useMemo<PanelGeometryBundle[]>(() => {
    return items.map((item) => {
      const { width, height } = computePanelDimensions(
        item.width,
        item.height,
        maxWidth,
        maxHeight
      );
      const panelGeo = createCurvedPlaneGeometry(width, height, radius);
      const frameGeo = createCurvedPlaneGeometry(
        width + (isMobile ? 0.065 : 0.095),
        height + (isMobile ? 0.065 : 0.095),
        radius - 0.018
      );
      return { panelGeo, frameGeo, width, height };
    });
  }, [items, isMobile, maxWidth, maxHeight, radius]);

  useEffect(() => {
    return () => {
      geometryBundles.forEach((bundle) => {
        bundle.panelGeo.dispose();
        bundle.frameGeo.dispose();
      });
    };
  }, [geometryBundles]);

  // Apply external Prev/Next button step commands
  useEffect(() => {
    if (stepCommand.seq === 0 || stepCommand.seq === lastProcessedSeqRef.current) {
      return;
    }
    lastProcessedSeqRef.current = stepCommand.seq;
    const currentSlot = Math.round(-targetRotationRef.current / angleStep);
    const nextSlot = currentSlot + stepCommand.delta;
    targetRotationRef.current = -nextSlot * angleStep;

    const normalizedIndex = ((nextSlot % count) + count) % count;
    if (normalizedIndex !== lastReportedIndexRef.current) {
      lastReportedIndexRef.current = normalizedIndex;
      onActiveIndexChange(normalizedIndex);
    }
    invalidate();
  }, [
    stepCommand,
    angleStep,
    count,
    onActiveIndexChange,
    invalidate,
    targetRotationRef,
  ]);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    const rotDamp = 1 - Math.exp(-8.5 * safeDelta);
    const hoverDamp = 1 - Math.exp(-10 * safeDelta);
    const camDamp = 1 - Math.exp(-6 * safeDelta);
    const themeDamp = 1 - Math.exp(-6 * safeDelta);
    const elapsed = state.clock.getElapsedTime();
    const isDark = scrollState.isDark;
    const targetFrameColor = isDark ? DARK_FRAME_COLOR : LIGHT_FRAME_COLOR;
    const targetPlaceholderColor = isDark
      ? DARK_PLACEHOLDER_COLOR
      : LIGHT_PLACEHOLDER_COLOR;

    let needsThemeFrame = false;
    for (let i = 0; i < count; i += 1) {
      const frameMat = frameMatRefs.current[i];
      if (frameMat) {
        frameMat.color.lerp(targetFrameColor, themeDamp);
        if (
          Math.abs(frameMat.color.r - targetFrameColor.r) > 0.002 ||
          Math.abs(frameMat.color.g - targetFrameColor.g) > 0.002 ||
          Math.abs(frameMat.color.b - targetFrameColor.b) > 0.002
        ) {
          needsThemeFrame = true;
        }
      }
      const placeholderMat = placeholderMatRefs.current[i];
      if (placeholderMat) {
        placeholderMat.color.lerp(targetPlaceholderColor, themeDamp);
      }
    }
    if (needsThemeFrame) {
      invalidate();
    }

    // Responsive camera Z distance so mobile frames 1 center card + peeking edges
    const desiredCamZ = isMobile ? 5.65 : 8.45;
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      desiredCamZ,
      camDamp
    );

    currentRotationRef.current = THREE.MathUtils.lerp(
      currentRotationRef.current,
      targetRotationRef.current,
      rotDamp
    );

    if (carouselGroupRef.current) {
      carouselGroupRef.current.rotation.y = currentRotationRef.current;
    }

    const nearestSlot = Math.round(-currentRotationRef.current / angleStep);
    const nearestIndex = ((nearestSlot % count) + count) % count;
    if (nearestIndex !== lastReportedIndexRef.current) {
      lastReportedIndexRef.current = nearestIndex;
      onActiveIndexChange(nearestIndex);
    }

    for (let i = 0; i < count; i += 1) {
      const panelGroup = panelRefs.current[i];
      if (!panelGroup) continue;

      const baseAngle = i * angleStep;
      const isHovered = hoveredIndexRef.current === i;
      const targetRadius = radius + (isHovered ? (isMobile ? 0.14 : 0.24) : 0);
      const targetScale = isHovered ? 1.06 : 1.0;

      const sinA = Math.sin(baseAngle);
      const cosA = Math.cos(baseAngle);
      const floatY = Math.sin(elapsed * 0.9 + i * 0.85) * 0.025;

      panelGroup.position.x = THREE.MathUtils.lerp(
        panelGroup.position.x,
        sinA * targetRadius,
        hoverDamp
      );
      panelGroup.position.z = THREE.MathUtils.lerp(
        panelGroup.position.z,
        cosA * targetRadius,
        hoverDamp
      );
      panelGroup.position.y = THREE.MathUtils.lerp(
        panelGroup.position.y,
        floatY,
        hoverDamp
      );

      const nextScale = THREE.MathUtils.lerp(
        panelGroup.scale.x,
        targetScale,
        hoverDamp
      );
      panelGroup.scale.setScalar(nextScale);
    }
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>, index: number) => {
    event.stopPropagation();
    hoveredIndexRef.current = index;
    onHoverPanelChange(true);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>, index: number) => {
    event.stopPropagation();
    if (hoveredIndexRef.current === index) {
      hoveredIndexRef.current = null;
      onHoverPanelChange(false);
    }
  };

  const handlePanelClick = (event: ThreeEvent<MouseEvent>, item: GalleryItem) => {
    event.stopPropagation();
    if (dragDistanceRef.current < 8) {
      onSelectItem(item);
    }
  };

  return (
    <group ref={carouselGroupRef}>
      {items.map((item, index) => {
        const angle = index * angleStep;
        const bundle = geometryBundles[index];
        const texture = textures[item.id];

        return (
          <group
            key={item.id}
            ref={(el) => {
              panelRefs.current[index] = el;
            }}
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            rotation={[0, angle, 0]}
          >
            {/* Exhibition backing frame (smoothly transitions between Light and Dark) */}
            <mesh geometry={bundle.frameGeo} position={[0, 0, -0.018]}>
              <meshStandardMaterial
                ref={(el) => {
                  frameMatRefs.current[index] = el;
                }}
                color="#ffffff"
                roughness={0.55}
                metalness={0.04}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Artwork curved display surface */}
            <mesh
              geometry={bundle.panelGeo}
              onPointerOver={(e) => handlePointerOver(e, index)}
              onPointerOut={(e) => handlePointerOut(e, index)}
              onClick={(e) => handlePanelClick(e, item)}
            >
              {texture ? (
                <meshBasicMaterial
                  map={texture}
                  toneMapped={false}
                  side={THREE.DoubleSide}
                />
              ) : (
                <meshStandardMaterial
                  ref={(el) => {
                    placeholderMatRefs.current[index] = el;
                  }}
                  color="#e2e8f0"
                  roughness={0.8}
                  side={THREE.DoubleSide}
                />
              )}
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function GalleryCarousel3D({
  items,
  stepCommand,
  isActive,
  onActiveIndexChange,
  onSelectItem,
}: GalleryCarousel3DProps) {
  const isDraggingRef = useRef(false);
  const startPointerXRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const targetRotationRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringPanel, setIsHoveringPanel] = useState(false);

  const angleStep = (Math.PI * 2) / items.length;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    startPointerXRef.current = event.clientX;
    lastPointerXRef.current = event.clientX;
    dragDistanceRef.current = 0;
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = event.clientX - lastPointerXRef.current;
    lastPointerXRef.current = event.clientX;
    dragDistanceRef.current += Math.abs(deltaX);

    // Drag left rotates next right-side item forward; drag right brings previous left-side item
    targetRotationRef.current += deltaX * 0.0048;
  };

  const finishDrag = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    // Gently snap to nearest slot when user dragged meaningfully
    if (dragDistanceRef.current >= 8) {
      const snappedSlot = Math.round(-targetRotationRef.current / angleStep);
      targetRotationRef.current = -snappedSlot * angleStep;
    }
  };

  const cursorClass = isDragging
    ? "cursor-grabbing"
    : isHoveringPanel
      ? "cursor-pointer"
      : "cursor-grab";

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onPointerLeave={finishDrag}
      style={{ touchAction: "pan-y" }}
      className={`h-full w-full select-none ${cursorClass}`}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop={isActive ? "always" : "demand"}
        camera={{ position: [0, 0, 8.45], fov: 36, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={1.15} color="#ffffff" />
        <directionalLight position={[4, 6, 8]} intensity={0.85} color="#ffffff" />
        <directionalLight position={[-4, -2, 4]} intensity={0.35} color="#e2e8f0" />

        <CarouselRig
          items={items}
          stepCommand={stepCommand}
          onActiveIndexChange={onActiveIndexChange}
          onSelectItem={onSelectItem}
          onHoverPanelChange={setIsHoveringPanel}
          dragDistanceRef={dragDistanceRef}
          targetRotationRef={targetRotationRef}
        />
      </Canvas>
    </div>
  );
}

