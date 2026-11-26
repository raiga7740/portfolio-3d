/**
 * Mutable animation state driven by GSAP ScrollTrigger and consumed inside R3F's useFrame.
 * Using a plain object avoids React state re-renders at 60 FPS.
 */
export interface Vec3State {
  x: number;
  y: number;
  z: number;
}

export interface ScrollChoreographyState {
  sectionIndex: number;
  cameraPos: Vec3State;
  cameraLookAt: Vec3State;
  stageOffset: Vec3State;
  stageRotY: number;
  blockSpread: number;
  blockElevation: number;
  trackSpeed: number;
  orbLift: number;
  glowIntensity: number;
  hoveredProject: string | null;
}

export const DEFAULT_ACCENT_COLOR = "#14B8A6";

export const PROJECT_ACCENT_COLORS: Record<string, string> = {
  labaku: "#10B981",
  jplearn: "#6366F1",
  "saung-sunda": "#F59E0B",
  slekbew: "#0EA5E9",
  "discord-community-hub": "#5865F2",
};

export const INITIAL_SCROLL_STATE: ScrollChoreographyState = {
  sectionIndex: 0,
  cameraPos: { x: 6.15, y: 10.15, z: 11.45 },
  cameraLookAt: { x: -1.85, y: 0.15, z: 1.45 },
  stageOffset: { x: 0, y: 0, z: 0 },
  stageRotY: 0,
  blockSpread: 0,
  blockElevation: 0.2,
  trackSpeed: 1,
  orbLift: 0,
  glowIntensity: 0.8,
  hoveredProject: null,
};

export const scrollState: ScrollChoreographyState = {
  ...INITIAL_SCROLL_STATE,
  cameraPos: { ...INITIAL_SCROLL_STATE.cameraPos },
  cameraLookAt: { ...INITIAL_SCROLL_STATE.cameraLookAt },
  stageOffset: { ...INITIAL_SCROLL_STATE.stageOffset },
};

/**
 * Resets mutable scrollState to Hero defaults without mutating INITIAL_SCROLL_STATE.
 */
export function resetScrollState(): void {
  scrollState.sectionIndex = INITIAL_SCROLL_STATE.sectionIndex;
  Object.assign(scrollState.cameraPos, INITIAL_SCROLL_STATE.cameraPos);
  Object.assign(scrollState.cameraLookAt, INITIAL_SCROLL_STATE.cameraLookAt);
  Object.assign(scrollState.stageOffset, INITIAL_SCROLL_STATE.stageOffset);
  scrollState.stageRotY = INITIAL_SCROLL_STATE.stageRotY;
  scrollState.blockSpread = INITIAL_SCROLL_STATE.blockSpread;
  scrollState.blockElevation = INITIAL_SCROLL_STATE.blockElevation;
  scrollState.trackSpeed = INITIAL_SCROLL_STATE.trackSpeed;
  scrollState.orbLift = INITIAL_SCROLL_STATE.orbLift;
  scrollState.glowIntensity = INITIAL_SCROLL_STATE.glowIntensity;
  scrollState.hoveredProject = INITIAL_SCROLL_STATE.hoveredProject;
}
