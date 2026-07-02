import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { GlowFilters, terrainPoints } from "./LowPoly";
import { Particles } from "./Particles";
import { useShotDuration, useAudioOffset } from "./ShotDuration";
import { COLORS } from "./theme";
import {
  rise,
  springIn,
  springOut,
  type MotionRegister,
} from "./motion";
import {
  morphStyles,
  type MorphMode,
} from "./MorphBridge";
import { CompositionGrid } from "./staging";

export type SceneContext = {
  frame: number;
  width: number;
  height: number;
  dur: number;
  fps: number;
  ao: number;
};

/**
 * SceneShell — unified atmospheric wrapper with all cinematic capabilities.
 *
 * Integrates: terrain, particles, radial gradient, spring-based fades,
 * morph transitions, audio offset, and development composition grid.
 *
 * Replaces per-file AtmoShell / CanvasShell / Act2Shell for new scenes.
 * Existing shells remain compatible — migrate scenes gradually.
 */
export const SceneShell: React.FC<{
  children: (ctx: SceneContext) => React.ReactNode;

  particleColor?: string;
  particleCount?: number;

  fadeInFrames?: number;
  fadeOutFrames?: number;
  /** Use spring physics for fades (overshoot + settle). Default: false (interpolate-based). */
  springFade?: boolean;
  fadeRegister?: MotionRegister;

  entryMode?: MorphMode;
  exitMode?: MorphMode;
  entryOverlap?: number;
  exitOverlap?: number;

  terrainSeed1?: number;
  terrainSeed2?: number;

  showGrid?: boolean;
}> = ({
  children,
  particleColor = COLORS.system,
  particleCount = 22,
  fadeInFrames = 12,
  fadeOutFrames = 14,
  springFade = false,
  fadeRegister = "standard",
  entryMode = "dissolve",
  exitMode = "dissolve",
  entryOverlap = 0,
  exitOverlap = 0,
  terrainSeed1 = 29,
  terrainSeed2 = 67,
  showGrid = false,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const dur = useShotDuration();
  const ao = useAudioOffset();

  const fadeIn = springFade
    ? springIn(frame, 0, fps, fadeRegister)
    : fadeInFrames > 0
      ? rise(frame, 0, fadeInFrames)
      : 1;

  const fadeOut = springFade
    ? frame > dur - fadeOutFrames
      ? springOut(frame, dur - fadeOutFrames, fps, fadeRegister)
      : 1
    : fadeOutFrames > 0
      ? 1 - rise(frame, dur - fadeOutFrames, dur)
      : 1;

  const morph =
    entryOverlap > 0 || exitOverlap > 0
      ? morphStyles(frame, dur, entryOverlap, exitOverlap, fps, entryMode, exitMode)
      : null;

  const terrain = useMemo(() => {
    const layers = [
      { y: height * 0.84, amp: 38, segments: 18, seed: terrainSeed1, color: COLORS.system },
      { y: height * 0.91, amp: 22, segments: 22, seed: terrainSeed2, color: COLORS.systemDim },
    ];
    return layers.map((l) => ({
      ...l,
      pts: terrainPoints(width, l.y, l.segments, l.amp, l.seed),
    }));
  }, [width, height, terrainSeed1, terrainSeed2]);

  const baseOpacity = fadeIn * fadeOut;
  const finalOpacity = morph ? morph.opacity : baseOpacity;
  const finalTransform = morph ? morph.transform : "none";
  const finalFilter = morph ? morph.filter : "none";

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: COLORS.background,
        position: "relative",
        overflow: "hidden",
        opacity: finalOpacity,
        transform: finalTransform,
        filter: finalFilter,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 38%, ${COLORS.backgroundLight} 0%, ${COLORS.background} 72%)`,
        }}
      />

      <Particles
        count={particleCount}
        color={particleColor}
        sizeMin={2}
        sizeMax={5}
        opacityMin={0.02}
        opacityMax={0.1}
        fadeInFrames={28}
      />

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      >
        <GlowFilters />
        {terrain.map((layer, i) => {
          const breathe = Math.sin(frame * 0.007 + i * 1.4) * 2;
          const pathD =
            `M 0 ${height} ` +
            layer.pts.map((p) => `L ${p.x} ${p.y + breathe}`).join(" ") +
            ` L ${width} ${height} Z`;
          return (
            <path
              key={`t-${i}`}
              d={pathD}
              fill={layer.color}
              opacity={0.14 - i * 0.05}
            />
          );
        })}
        {terrain[0].pts.map((p, i) => {
          if (i === 0) return null;
          const prev = terrain[0].pts[i - 1];
          const breathe = Math.sin(frame * 0.007) * 2;
          return (
            <line
              key={`te-${i}`}
              x1={prev.x}
              y1={prev.y + breathe}
              x2={p.x}
              y2={p.y + breathe}
              stroke={COLORS.system}
              strokeWidth={0.7}
              opacity={0.16}
            />
          );
        })}
      </svg>

      {children({ frame, width, height, dur, fps, ao })}

      <CompositionGrid show={showGrid} />
    </div>
  );
};
