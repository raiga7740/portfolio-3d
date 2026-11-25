/**
 * Mutable animation state driven by GSAP ScrollTrigger and consumed inside R3F's useFrame.
 * Using a plain object avoids React state re-renders at 60 FPS.
 */
export interface ScrollChoreographyState {
  xFactor: number;
  yFactor: number;
  zOffset: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scaleFactor: number;
  hoveredProject: string | null;
}

export const DEFAULT_ACCENT_COLOR = "#14B8A6";

export const PROJECT_ACCENT_COLORS: Record<string, string> = {
  labaku: "#10B981",
  jplearn: "#6366F1",
  "discord-community-hub": "#5865F2",
};

export const INITIAL_SCROLL_STATE: ScrollChoreographyState = {
  xFactor: 0.23,
  yFactor: 0.03,
  zOffset: 0,
  rotX: 0.18,
  rotY: 0.35,
  rotZ: 0.05,
  scaleFactor: 1.0,
  hoveredProject: null,
};

export const scrollState: ScrollChoreographyState = {
  ...INITIAL_SCROLL_STATE,
};

