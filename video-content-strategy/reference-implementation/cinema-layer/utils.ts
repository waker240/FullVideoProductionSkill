import React from "react";

/**
 * Project-agnostic helpers for the shared cinematics module.
 *
 * Kept dependency-free (only React + standard math) so atoms remain portable
 * across projects. Project-specific extensions (semantic colors, motion
 * presets, polygon helpers) live in each project's local cinematics folder.
 */

export const clamp = (v: number, lo = 0, hi = 1): number =>
  Math.max(lo, Math.min(hi, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * SVG-safe stable ID per component instance.
 *
 * React's useId returns IDs containing colons (":r0:") which break SVG
 * `url(#...)` references. Sanitize once at the hook boundary so atoms can
 * use the result anywhere.
 */
export const useStableId = (prefix: string): string => {
  const raw = React.useId();
  return `${prefix}-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
};

/**
 * Parse a hex color "#RRGGBB" or "#RGB" into {r, g, b} (0-255).
 * Returns a neutral gray for malformed input rather than throwing — atoms
 * should degrade gracefully.
 */
export const parseHex = (hex: string): { r: number; g: number; b: number } => {
  const fallback = { r: 128, g: 128, b: 128 };
  if (!hex || hex[0] !== "#") return fallback;
  const body = hex.slice(1);
  if (body.length === 3) {
    const r = parseInt(body[0] + body[0], 16);
    const g = parseInt(body[1] + body[1], 16);
    const b = parseInt(body[2] + body[2], 16);
    if ([r, g, b].some(Number.isNaN)) return fallback;
    return { r, g, b };
  }
  if (body.length === 6) {
    const r = parseInt(body.slice(0, 2), 16);
    const g = parseInt(body.slice(2, 4), 16);
    const b = parseInt(body.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return fallback;
    return { r, g, b };
  }
  return fallback;
};
