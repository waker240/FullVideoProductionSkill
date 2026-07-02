import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp, lerp } from "./utils";

/**
 * Lens / camera-character atoms.
 *
 * `Lens` declares a shot's perspective + scale character; `LensTransition`
 * interpolates between two Lens variants over a frame window. Promoted to
 * shared 2026-05-01 after meeting all four promote criteria (61+ usages
 * across 11 production shot files in The Migration of Restriction; purpose-
 * stable; ≤4 props; the 5 lens variants are real cinematography names
 * usable for any project).
 *
 * The variant set is locked. Adding a 6th variant should be earned the same
 * way the existing 5 were — by hand-rolled production occurrences of a
 * perspective/scale combination not covered by the existing variants.
 *
 * Note on the `fisheye8` "lie": the `fullBarrel` value is currently unused
 * by the rendering — `Lens.fisheye8` produces only the perspective-stretch
 * fisheye effect, not real barrel distortion. Real barrel distortion via
 * SVG `feDisplacementMap` is deferred (see CATALOG.md). Until then,
 * `fisheye8` is genuinely cinematic on perspective alone for charged AI-
 * rupture beats.
 */

// ─── Variant catalog ───────────────────────────────────────────────────────
//
// Five canonical lens characters mapped to perspective + scale parameters.
// Each variant is named for a real photographic focal length so the call
// site reads as cinematography vocabulary.

export type LensVariant =
  | "wide21"
  | "normal50"
  | "portrait85"
  | "fisheye8"
  | "anamorphic";

export const LENS_PERSONALITIES: Record<
  LensVariant,
  {
    perspective: number;
    scaleX: number;
    scaleY: number;
    edgeBarrel: number;
    fullBarrel: number;
  }
> = {
  wide21:     { perspective: 1400, scaleX: 1.00, scaleY: 1.00, edgeBarrel: 5,  fullBarrel: 0  },
  normal50:   { perspective: 2400, scaleX: 1.00, scaleY: 1.00, edgeBarrel: 0,  fullBarrel: 0  },
  portrait85: { perspective: 4000, scaleX: 1.00, scaleY: 1.00, edgeBarrel: 0,  fullBarrel: 0  },
  fisheye8:   { perspective: 700,  scaleX: 1.00, scaleY: 1.00, edgeBarrel: 0,  fullBarrel: 14 },
  anamorphic: { perspective: 2000, scaleX: 1.05, scaleY: 0.97, edgeBarrel: 0,  fullBarrel: 0  },
};

// ─── Lens ──────────────────────────────────────────────────────────────────
//
// Wraps children with the variant's perspective + scale. Default `normal50`
// is the channel-permanent base register; deviation must be charged
// (signature move, rupture beat, hero close-up).

export const Lens: React.FC<{
  variant?: LensVariant;
  children: React.ReactNode;
}> = ({ variant = "normal50", children }) => {
  const cfg = LENS_PERSONALITIES[variant];
  return (
    <div
      style={{
        perspective: `${cfg.perspective}px`,
        transform: `scale(${cfg.scaleX}, ${cfg.scaleY})`,
        transformOrigin: "center",
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
      }}
    >
      {children}
    </div>
  );
};

// ─── LensTransition ────────────────────────────────────────────────────────
//
// Interpolates perspective + scale between `from` and `to` variants over
// `[startFrame, startFrame + durationFrames]`. Easing is fixed to
// `Easing.inOut(Easing.cubic)` — empirically the curve that lands lens
// shifts as cinematic moves rather than abrupt warps.
//
// Stack two transitions to chain `A → B → C` (e.g. `normal50 → anamorphic
// → portrait85` for a thesis-build-and-land beat).

export const LensTransition: React.FC<{
  from: LensVariant;
  to: LensVariant;
  startFrame: number;
  durationFrames?: number;
  children: React.ReactNode;
}> = ({ from, to, startFrame, durationFrames = 30, children }) => {
  const frame = useCurrentFrame();
  const a = LENS_PERSONALITIES[from];
  const b = LENS_PERSONALITIES[to];
  const t = clamp(
    interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    }),
  );
  const persp = lerp(a.perspective, b.perspective, t);
  const sx = lerp(a.scaleX, b.scaleX, t);
  const sy = lerp(a.scaleY, b.scaleY, t);
  return (
    <div
      style={{
        perspective: `${persp}px`,
        transform: `scale(${sx}, ${sy})`,
        transformOrigin: "center",
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
      }}
    >
      {children}
    </div>
  );
};
