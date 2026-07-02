import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { rise, springIn, type MotionRegister } from "./motion";
import { useShotDuration } from "./ShotDuration";

export type MorphMode =
  | "dissolve"
  | "zoom"
  | "push-left"
  | "push-right"
  | "pull-focus"
  | "expand";

type TransitionStyle = {
  opacity: number;
  transform: string;
  filter: string;
};

/**
 * Computes entry transform styles for a scene during its overlap window.
 * Apply to the scene's root element for the entry portion of a morph.
 */
export const morphEntry = (
  frame: number,
  overlapFrames: number,
  fps: number,
  mode: MorphMode = "dissolve",
  register: MotionRegister = "standard",
): TransitionStyle => {
  if (overlapFrames <= 0) return { opacity: 1, transform: "none", filter: "none" };

  const p = springIn(frame, 0, fps, register);

  switch (mode) {
    case "zoom": {
      const scale = 0.92 + 0.08 * p;
      const blur = (1 - p) * 6;
      return {
        opacity: p,
        transform: `scale(${scale})`,
        filter: blur > 0.1 ? `blur(${blur}px)` : "none",
      };
    }
    case "push-left": {
      const x = (1 - p) * 120;
      return { opacity: p, transform: `translateX(${x}px)`, filter: "none" };
    }
    case "push-right": {
      const x = (1 - p) * -120;
      return { opacity: p, transform: `translateX(${x}px)`, filter: "none" };
    }
    case "pull-focus": {
      const blur = (1 - p) * 10;
      const scale = 1 + (1 - p) * 0.03;
      return {
        opacity: Math.min(1, p * 1.5),
        transform: `scale(${scale})`,
        filter: blur > 0.1 ? `blur(${blur}px)` : "none",
      };
    }
    case "expand": {
      const scale = 0.85 + 0.15 * p;
      return { opacity: p, transform: `scale(${scale})`, filter: "none" };
    }
    default:
      return { opacity: p, transform: "none", filter: "none" };
  }
};

/**
 * Computes exit transform styles for a scene during its overlap window.
 * Apply to the scene's root element for the exit portion of a morph.
 */
export const morphExit = (
  frame: number,
  dur: number,
  overlapFrames: number,
  fps: number,
  mode: MorphMode = "dissolve",
  register: MotionRegister = "standard",
): TransitionStyle => {
  if (overlapFrames <= 0) return { opacity: 1, transform: "none", filter: "none" };

  const exitStart = dur - overlapFrames;
  const p = rise(frame, exitStart, dur);

  switch (mode) {
    case "zoom": {
      const scale = 1 + p * 0.08;
      const blur = p * 6;
      return {
        opacity: 1 - p,
        transform: `scale(${scale})`,
        filter: blur > 0.1 ? `blur(${blur}px)` : "none",
      };
    }
    case "push-left": {
      const x = p * -120;
      return { opacity: 1 - p, transform: `translateX(${x}px)`, filter: "none" };
    }
    case "push-right": {
      const x = p * 120;
      return { opacity: 1 - p, transform: `translateX(${x}px)`, filter: "none" };
    }
    case "pull-focus": {
      const blur = p * 10;
      const scale = 1 - p * 0.03;
      return {
        opacity: 1 - p,
        transform: `scale(${scale})`,
        filter: blur > 0.1 ? `blur(${blur}px)` : "none",
      };
    }
    case "expand": {
      const scale = 1 + p * 0.15;
      return { opacity: 1 - p, transform: `scale(${scale})`, filter: "none" };
    }
    default:
      return { opacity: 1 - p, transform: "none", filter: "none" };
  }
};

/**
 * Combined entry+exit morph styles for a scene that knows its overlap windows.
 * During the entry window: applies entry transform.
 * During the exit window: applies exit transform.
 * Between: returns identity (no transform).
 */
export const morphStyles = (
  frame: number,
  dur: number,
  entryOverlap: number,
  exitOverlap: number,
  fps: number,
  entryMode: MorphMode = "dissolve",
  exitMode: MorphMode = "dissolve",
  register: MotionRegister = "standard",
): TransitionStyle => {
  if (frame < entryOverlap) {
    return morphEntry(frame, entryOverlap, fps, entryMode, register);
  }
  if (frame > dur - exitOverlap) {
    return morphExit(frame, dur, exitOverlap, fps, exitMode, register);
  }
  return { opacity: 1, transform: "none", filter: "none" };
};

/**
 * MorphShell — wraps a scene with configurable entry/exit morph transitions.
 * Drop-in enhancement for existing shells (AtmoShell, CanvasShell, Act2Shell).
 *
 * Usage:
 *   <MorphShell entryMode="zoom" exitMode="push-left" entryOverlap={12} exitOverlap={10}>
 *     {(styles) => <div style={{ ...styles }}>...scene content...</div>}
 *   </MorphShell>
 */
export const MorphShell: React.FC<{
  entryMode?: MorphMode;
  exitMode?: MorphMode;
  entryOverlap?: number;
  exitOverlap?: number;
  register?: MotionRegister;
  children: (style: React.CSSProperties) => React.ReactNode;
}> = ({
  entryMode = "dissolve",
  exitMode = "dissolve",
  entryOverlap = 12,
  exitOverlap = 12,
  register = "standard",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = useShotDuration();

  const ms = morphStyles(
    frame,
    dur,
    entryOverlap,
    exitOverlap,
    fps,
    entryMode,
    exitMode,
    register,
  );

  return (
    <AbsoluteFill>
      {children({
        opacity: ms.opacity,
        transform: ms.transform,
        filter: ms.filter,
      })}
    </AbsoluteFill>
  );
};
