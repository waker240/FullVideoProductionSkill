import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { clamp, parseHex } from "./utils";

/**
 * Attention / Mask atoms.
 *
 * Region-shaped effects. The single biggest gap the existing toolkit was
 * missing: most shipped atoms are full-frame; this file adds atoms that
 * take a `Shape` parameter and apply effects only inside or only outside
 * the region.
 *
 * See `CATALOG.md` § Axis C — Attention / Mask for discipline rules and
 * the brush-recolor reveal signature move (which composes RegionHold +
 * BrushReveal — BrushReveal lands in Tier 3).
 */

// ─── Shape vocabulary ──────────────────────────────────────────────────────
//
// The region parameter for every mask atom. Tier 1 supports rect, circle,
// polygon, and raw SVG path. Brush (animated brush mask) and element-tracking
// (follows a DOM element's bbox) are deferred to Tier 2/3.

export type Shape =
  | { type: "rect"; x: number; y: number; w: number; h: number; cornerRadius?: number }
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "polygon"; points: [number, number][] }
  | { type: "path"; d: string };

// ─── Internal: shape → SVG path data ───────────────────────────────────────
//
// Convert any shape to a single SVG path "d" string. This keeps mask
// generation uniform and lets us combine an outer-frame path with an
// inner-region path using fill-rule="evenodd" — which produces the
// "everything except this region" mask without needing nested <mask>
// elements (cheaper to encode in a data URI).

const shapeToPathD = (shape: Shape): string => {
  switch (shape.type) {
    case "rect": {
      const { x, y, w, h, cornerRadius: cr = 0 } = shape;
      if (cr <= 0) {
        return `M${x},${y} h${w} v${h} h${-w} z`;
      }
      const r = Math.min(cr, w / 2, h / 2);
      return (
        `M${x + r},${y} ` +
        `h${w - 2 * r} ` +
        `a${r},${r} 0 0 1 ${r},${r} ` +
        `v${h - 2 * r} ` +
        `a${r},${r} 0 0 1 ${-r},${r} ` +
        `h${-(w - 2 * r)} ` +
        `a${r},${r} 0 0 1 ${-r},${-r} ` +
        `v${-(h - 2 * r)} ` +
        `a${r},${r} 0 0 1 ${r},${-r} z`
      );
    }
    case "circle": {
      const { cx, cy, r } = shape;
      return (
        `M${cx - r},${cy} ` +
        `A${r},${r} 0 1 0 ${cx + r},${cy} ` +
        `A${r},${r} 0 1 0 ${cx - r},${cy} z`
      );
    }
    case "polygon": {
      if (shape.points.length === 0) return "";
      const [first, ...rest] = shape.points;
      return `M${first[0]},${first[1]} ${rest.map((p) => `L${p[0]},${p[1]}`).join(" ")} z`;
    }
    case "path":
      return shape.d;
  }
};

const buildInsideMaskSVG = (width: number, height: number, region: Shape): string =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' width='${width}' height='${height}'>` +
  `<path d='${shapeToPathD(region)}' fill='white'/>` +
  `</svg>`;

const buildOutsideMaskSVG = (width: number, height: number, region: Shape): string => {
  const outer = `M0,0 H${width} V${height} H0 z`;
  const inner = shapeToPathD(region);
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' width='${width}' height='${height}'>` +
    `<path d='${outer} ${inner}' fill='white' fill-rule='evenodd'/>` +
    `</svg>`
  );
};

const maskUrl = (svg: string): string => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

// Common CSS mask shorthand for both unprefixed and -webkit forms
const maskStyles = (image: string): React.CSSProperties => ({
  WebkitMaskImage: image,
  maskImage: image,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "0 0",
  maskPosition: "0 0",
});

// ─── RegionDim ─────────────────────────────────────────────────────────────
//
// Everything OUTSIDE the region dims to a configurable level. The "spotlight
// negative" — eye is forced to the region without changing any geometry.
//
// `dimAmount` controls how dark the outside gets (0 = no dim, 1 = solid black).
// `background` overrides the dim color (default near-black matches the
// project's COLORS.background register).

export const RegionDim: React.FC<{
  region: Shape;
  dimAmount?: number;
  background?: string;
}> = ({ region, dimAmount = 0.6, background = "rgba(10, 14, 20, 1)" }) => {
  const { width, height } = useVideoConfig();
  const image = maskUrl(buildOutsideMaskSVG(width, height, region));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background,
        opacity: clamp(dimAmount),
        pointerEvents: "none",
        ...maskStyles(image),
      }}
    />
  );
};

// ─── RegionHold ────────────────────────────────────────────────────────────
//
// Effect applied OUTSIDE the region; INSIDE keeps full clarity. The region's
// shape becomes a "color is held inside this shape" reveal — pairs with
// negation-then-reveal beats and is the foundation for the brush-recolor
// signature move (once BrushReveal lands in Tier 3).
//
// Renders children TWICE — once unaffected, masked to inside; once with the
// effect applied, masked to outside. Cost: 2x the children's render. Avoid
// wrapping heavy subtrees; wrap a single artifact / canvas, not the entire
// composition.

export type HoldEffect =
  | { type: "desat"; strength?: number }
  | { type: "blur"; pixels?: number }
  | { type: "dim"; amount?: number };

const holdEffectToFilter = (e: HoldEffect): string => {
  switch (e.type) {
    case "desat":
      return `saturate(${1 - clamp(e.strength ?? 1)})`;
    case "blur":
      return `blur(${e.pixels ?? 8}px)`;
    case "dim":
      return `brightness(${1 - clamp(e.amount ?? 0.5)})`;
  }
};

export const RegionHold: React.FC<{
  region: Shape;
  effect: HoldEffect;
  children: React.ReactNode;
}> = ({ region, effect, children }) => {
  const { width, height } = useVideoConfig();
  const insideImage = maskUrl(buildInsideMaskSVG(width, height, region));
  const filter = holdEffectToFilter(effect);
  // Bottom layer: children with the effect applied, no mask (full frame).
  // Top layer: clean children, masked to ONLY the region.
  // The single inside-mask handles boundary anti-aliasing correctly: as the
  // mask alpha fades to 0 at the region edge, the unaffected top layer
  // smoothly reveals the effect-applied bottom layer underneath. No
  // double-coverage artifact at AA pixels.
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          filter,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          ...maskStyles(insideImage),
        }}
      >
        {children}
      </div>
    </>
  );
};

// ─── Spotlight ─────────────────────────────────────────────────────────────
//
// Bright radial hotspot at any (x, y). The inverse of vignette — argument-
// bearing focus that brightens the eye-attractor instead of dimming the
// periphery. Pairs with RegionDim for thesis-land; the spotlight brightens
// while the region-dim darkens everything else.
//
// `falloff`: 0 = hard edge (sharp dot), 1 = very soft (wide gradient).
// `color`: hex or rgba string. Default warm-white matches LightFlash.

const parseColorToRGB = (color: string): { r: number; g: number; b: number } => {
  if (color.startsWith("#")) return parseHex(color);
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) {
    return { r: parseInt(m[1], 10), g: parseInt(m[2], 10), b: parseInt(m[3], 10) };
  }
  return { r: 255, g: 245, b: 220 };
};

export const Spotlight: React.FC<{
  x: number;
  y: number;
  radius?: number;
  intensity?: number;
  falloff?: number;
  color?: string;
}> = ({
  x,
  y,
  radius,
  intensity = 0.5,
  falloff = 0.5,
  color = "#FFF5DC",
}) => {
  const { width, height } = useVideoConfig();
  const r = radius ?? Math.hypot(width, height) * 0.3;
  const i = clamp(intensity);
  const f = clamp(falloff);
  const { r: cr, g: cg, b: cb } = parseColorToRGB(color);
  const peak = i;
  const mid = i * 0.4;
  const innerStop = 30 + f * 30;
  return (
    <AbsoluteFill
      style={{
        background:
          `radial-gradient(circle ${r}px at ${x}px ${y}px, ` +
          `rgba(${cr}, ${cg}, ${cb}, ${peak}) 0%, ` +
          `rgba(${cr}, ${cg}, ${cb}, ${mid}) ${innerStop}%, ` +
          `rgba(${cr}, ${cg}, ${cb}, 0) 100%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};
