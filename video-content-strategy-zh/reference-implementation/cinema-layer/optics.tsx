import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { clamp, parseHex, useStableId } from "./utils";

/**
 * Optics / Lens atoms.
 *
 * Per-camera character — what kind of eye is observing the frame. Each atom
 * builds an SVG <filter> with a stable ID and applies it via CSS filter:
 * url(#id). Children render once (unlike RegionHold's two-layer approach),
 * so these are cheap to use widely.
 *
 * See `CATALOG.md` § Axis D — Optics / Lens for charged compositions
 * (Glitch + Fisheye + CA, Anamorphic + LightFlash + horizontal flare,
 * Halation hero) and discipline rules.
 */

// ─── ChromaticAberration ───────────────────────────────────────────────────
//
// Per-channel R/G/B offset. The cheap "real lens" cue. Splits red, green,
// and blue channels by `amount` pixels along `angle` degrees:
//   R channel offset by (-dx, -dy)
//   G channel stays put
//   B channel offset by (+dx, +dy)
// Blended together with screen blend mode so each channel reads as light
// through a separate ray path.
//
// Tier 1 ships `falloff: "uniform"` only. `falloff: "edge"` (CA stronger at
// frame corners, like a cheap zoom lens) is reserved for Tier 2 — accepting
// the prop now so the API doesn't change when it lands.

export const ChromaticAberration: React.FC<{
  amount?: number;
  angle?: number;
  falloff?: "uniform" | "edge";
  children: React.ReactNode;
}> = ({ amount = 3, angle = 0, falloff = "uniform", children }) => {
  const id = useStableId("ca");
  const rad = (angle * Math.PI) / 180;
  const dx = amount * Math.cos(rad);
  const dy = amount * Math.sin(rad);

  if (falloff === "edge") {
    // Reserved — Tier 2 will mask the CA-filtered layer with a radial
    // gradient so center stays sharp and edges get full split. For now,
    // fall through to uniform so callers don't crash.
  }

  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
            {/* Extract R, offset negative */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="rChannel"
            />
            <feOffset in="rChannel" dx={-dx} dy={-dy} result="rOffset" />

            {/* Extract G, no offset */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="gChannel"
            />

            {/* Extract B, offset positive */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="bChannel"
            />
            <feOffset in="bChannel" dx={dx} dy={dy} result="bOffset" />

            {/* Screen-blend the three channels back together */}
            <feBlend in="rOffset" in2="gChannel" mode="screen" result="rgBlend" />
            <feBlend in="rgBlend" in2="bOffset" mode="screen" />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          filter: `url(#${id})`,
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </>
  );
};

// ─── Halation ──────────────────────────────────────────────────────────────
//
// Warm light bleeds out of bright regions. Real-film signature. Implemented
// as: blur the source, tint the blur warm, screen-blend over the source.
//
// `warmth`   0 = neutral white halo, 1 = amber/orange halo
// `intensity` 0 = no halo, 1 = strong halo (alpha multiplier on the blur)
// `radius`   px stdDeviation for the gaussian blur (12 = subtle, 24 = lush)

export const Halation: React.FC<{
  warmth?: number;
  intensity?: number;
  radius?: number;
  children: React.ReactNode;
}> = ({ warmth = 0.7, intensity = 0.5, radius = 12, children }) => {
  const id = useStableId("halation");
  const w = clamp(warmth);
  const i = clamp(intensity);
  // Warm matrix: boost R, dampen G + B proportionally to warmth.
  const rMul = 1 + w * 0.4;
  const gMul = 1 - w * 0.3;
  const bMul = 1 - w * 0.7;
  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={radius} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values={`
                ${rMul} 0 0 0 0
                0 ${gMul} 0 0 0
                0 0 ${bMul} 0 0
                0 0 0 ${i} 0
              `}
              result="warmBlur"
            />
            <feBlend in="SourceGraphic" in2="warmBlur" mode="screen" />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          filter: `url(#${id})`,
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </>
  );
};

// ─── Bloom ─────────────────────────────────────────────────────────────────
//
// The neutral cousin of Halation. Blurs the source and screen-blends it
// over itself — bright pixels overflow into their neighbors without the
// warm tint. Cleaner / more clinical than Halation; pairs with smartphone
// register (mild bloom signals "consumer optics") or AI-clean (subtle
// bloom on text edges signals over-rendered cleanliness).
//
// `threshold` 0 = bloom everything (washed look), 1 = only pure highlights.
// Implemented via per-channel feComponentTransfer linear cutoff before
// the blur stage.

export const Bloom: React.FC<{
  threshold?: number;
  intensity?: number;
  radius?: number;
  children: React.ReactNode;
}> = ({ threshold = 0.6, intensity = 0.5, radius = 14, children }) => {
  const id = useStableId("bloom");
  const t = clamp(threshold);
  const i = clamp(intensity);
  // Linear cutoff: y = clamp(slope * x + intercept, 0, 1).
  // We want zero below threshold and full above. slope = 1/(1-t), intercept = -t/(1-t).
  const slope = 1 / Math.max(0.01, 1 - t);
  const intercept = -t / Math.max(0.01, 1 - t);
  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
            <feComponentTransfer in="SourceGraphic" result="thresholded">
              <feFuncR type="linear" slope={slope} intercept={intercept} />
              <feFuncG type="linear" slope={slope} intercept={intercept} />
              <feFuncB type="linear" slope={slope} intercept={intercept} />
            </feComponentTransfer>
            <feGaussianBlur in="thresholded" stdDeviation={radius} result="blur" />
            <feComponentTransfer in="blur" result="scaled">
              <feFuncA type="linear" slope={i} />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="scaled" mode="screen" />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          filter: `url(#${id})`,
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </>
  );
};

// ─── FilmGrain ─────────────────────────────────────────────────────────────
//
// Animated noise overlay via feTurbulence. The seed cycles every 3 frames
// to avoid the per-frame turbulence cost — viewer reads it as continuous
// grain anyway. Configurable hue (project-agnostic; pass project palette
// values for warm/cool drift) and speed.
//
// Kept API-compatible with the existing per-project FilmGrain in
// `the-migration/cinematics/index.tsx` so projects can switch imports
// mechanically once they're ready.

export const FilmGrain: React.FC<{
  intensity?: number;
  hue?: string;
  speed?: number;
}> = ({ intensity = 0.06, hue = "#808080", speed = 1 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor((frame * speed) / 3);
  const { r, g, b } = parseHex(hue);
  const fr = r / 255;
  const fg = g / 255;
  const fb = b / 255;
  const filterId = `grain-${seed}`;
  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        mixBlendMode: "overlay",
        opacity: intensity,
      }}
    >
      <defs>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} />
          <feColorMatrix
            values={`0 0 0 0 ${fr}
                     0 0 0 0 ${fg}
                     0 0 0 0 ${fb}
                     0 0 0 1 0`}
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
};

// ─── LightFlash ────────────────────────────────────────────────────────────
//
// Bright radial burst at `fireFrame`, peaking mid-window, fading out by
// the end of `durationFrames`. The cheap "thesis lands" punch — pairs with
// LensFlare for fully-charged thesis-land beats; standalone for cleaner
// argument-revelation moments.
//
// The atom returns `null` outside its window so cost is zero except during
// the ~12-frame burst.

export const LightFlash: React.FC<{
  fireFrame: number;
  durationFrames?: number;
  peakOpacity?: number;
  color?: string;
}> = ({ fireFrame, durationFrames = 12, peakOpacity = 0.85, color = "#FFF5DC" }) => {
  const frame = useCurrentFrame();
  if (frame < fireFrame || frame > fireFrame + durationFrames) return null;
  const t = (frame - fireFrame) / durationFrames;
  const flash = Math.sin(t * Math.PI) * peakOpacity;
  const { r, g, b } = parseHex(color);
  return (
    <AbsoluteFill
      style={{
        background:
          `radial-gradient(circle at 50% 50%, ` +
          `rgba(${r}, ${g}, ${b}, ${flash}) 0%, ` +
          `rgba(${r}, ${g}, ${b}, ${flash * 0.4}) 30%, ` +
          `rgba(${r}, ${g}, ${b}, 0) 70%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

// ─── LightLeak ─────────────────────────────────────────────────────────────
//
// Soft warm gradient anchored at one corner with subtle drift. Cheap film-
// camera signature — pairs with smartphone register (intimate handheld feel)
// and found-footage register (recovered reel atmosphere).
//
// Kept API-compatible with the existing per-project LightLeak.

export const LightLeak: React.FC<{
  corner?: "tl" | "tr" | "bl" | "br";
  intensity?: number;
  color?: string;
}> = ({ corner = "tl", intensity = 0.16, color }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.01) * 4;
  const { r, g, b } = parseHex(color ?? "#E8913A");
  const positions: Record<string, string> = {
    tl: `circle at ${0 + drift}% ${0 - drift}%`,
    tr: `circle at ${100 - drift}% ${0 + drift}%`,
    bl: `circle at ${0 + drift}% ${100 - drift}%`,
    br: `circle at ${100 - drift}% ${100 + drift}%`,
  };
  return (
    <AbsoluteFill
      style={{
        background:
          `radial-gradient(${positions[corner]}, ` +
          `rgba(${r}, ${g}, ${b}, ${intensity}) 0%, ` +
          `rgba(${r}, ${g}, ${b}, 0) 40%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};
