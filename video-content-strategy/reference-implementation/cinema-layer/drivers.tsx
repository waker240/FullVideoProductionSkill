import React from "react";
import { useCurrentFrame } from "remotion";
import { clamp, parseHex } from "./utils";

/**
 * Drivers — the small set production actually uses.
 *
 * Five hooks total: a context provider, three video-arc readers, and
 * the NC suppression driver that replaces inline `if (inNC) return null`
 * patterns with multiplied-opacity fades.
 *
 * Other drivers (useFrameProgress, useShotProgress, useFireEnvelope,
 * useWindowDriver, useStopDrift, useNumberStopDrift, useHexStopDrift)
 * were removed during the 2026-05-01 curation. None had production
 * users; the channel-capacity cost of keeping them dominated their
 * speculative value.
 */

// ─── Video-arc context ─────────────────────────────────────────────────────
//
// Two ways to construct the provider:
//   1. Static  : pass `progress` directly (0-1)
//   2. By-shot : pass `totalShots` + `currentShotIndex` (the project-local
//                pattern: each act sets its own shot-index relative to the
//                full video's shot count)

type VideoArc = {
  progress: number;
  totalShots: number;
  currentShotIndex: number;
};

const VideoArcCtx = React.createContext<VideoArc>({
  progress: 0,
  totalShots: 1,
  currentShotIndex: 0,
});

export const VideoArcProvider: React.FC<{
  progress?: number;
  totalShots?: number;
  currentShotIndex?: number;
  children: React.ReactNode;
}> = ({ progress, totalShots = 1, currentShotIndex = 0, children }) => {
  const computed = progress ?? currentShotIndex / Math.max(1, totalShots - 1);
  const value = { progress: clamp(computed), totalShots, currentShotIndex };
  return <VideoArcCtx.Provider value={value}>{children}</VideoArcCtx.Provider>;
};

// ─── Video-arc readers ─────────────────────────────────────────────────────

/**
 * 0-1 progress through the video, from the VideoArcProvider context. Returns
 * 0 if no provider is mounted.
 */
export const useVideoProgress = (): number => React.useContext(VideoArcCtx).progress;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const lerpHex = (a: string, b: string, t: number): string => {
  const ha = parseHex(a);
  const hb = parseHex(b);
  const r = Math.round(lerp(ha.r, hb.r, t));
  const g = Math.round(lerp(ha.g, hb.g, t));
  const blue = Math.round(lerp(ha.b, hb.b, t));
  return (
    "#" +
    [r, g, blue].map((v) => v.toString(16).padStart(2, "0")).join("")
  );
};

/**
 * Drift a hex color across video progress. Pairs with FilmGrain.hue for
 * the "channel-arc grain warming" signature.
 */
export const useGrainHueDrift = (
  startHue: string = "#808080",
  endHue: string = "#A88560",
): string => {
  const p = useVideoProgress();
  return lerpHex(startHue, endHue, p);
};

/**
 * Drift vignette intensity across video progress. Tied to argument-arc
 * tension; the frame literally tightens as the argument tightens.
 */
export const useVignetteDrift = (startIntensity = 0.4, endIntensity = 0.55): number => {
  const p = useVideoProgress();
  return lerp(startIntensity, endIntensity, p);
};

// ─── NC suppression driver ────────────────────────────────────────────────
//
// Returns 1 outside Negative-Cinema windows, 0 inside, and (with `fadeFrames > 0`)
// linearly fades between the two over the configured boundary zone.
//
// Use case: multiply against any Cinema-Layer effect's intensity prop so the
// effect uniformly fades into and out of NC instead of hard-cutting:
//   const sup = useNCDriver([[NC_START, NC_END]], 8);
//   <FilmGrain intensity={baseGrain * sup} ...>
//
// Replaces the 20+ inline `if (inNC) return null` patterns scattered across
// project shot files. Validated 2026-04-30 in Migration's framing.tsx.

export const useNCDriver = (
  ncWindows: Array<[start: number, end: number]>,
  fadeFrames = 0,
): number => {
  const frame = useCurrentFrame();
  for (const [start, end] of ncWindows) {
    if (frame >= start && frame < end) {
      return 0;
    }
    if (fadeFrames > 0) {
      // Fade out into the window
      if (frame >= start - fadeFrames && frame < start) {
        const t = (frame - (start - fadeFrames)) / fadeFrames;
        return 1 - t;
      }
      // Fade in out of the window
      if (frame >= end && frame < end + fadeFrames) {
        const t = (frame - end) / fadeFrames;
        return t;
      }
    }
  }
  return 1;
};
