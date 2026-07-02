import React from "react";
import { COLORS } from "./theme";

export const polyPoints = (
  cx: number,
  cy: number,
  r: number,
  sides: number,
  rotation: number,
  seed: number,
) => {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2 + rotation;
    const jitter = 1 + 0.13 * Math.sin(seed * 137.5 + i * 47.3);
    return `${cx + r * jitter * Math.cos(angle)},${cy + r * jitter * Math.sin(angle)}`;
  }).join(" ");
};

export const facetedBoundary = (
  cx: number,
  cy: number,
  r: number,
  sides: number,
) => {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2;
    const jitter = 1 + 0.04 * Math.sin(i * 91.3 + 17);
    return {
      x: cx + r * jitter * Math.cos(angle),
      y: cy + r * jitter * Math.sin(angle),
    };
  });
};

export const terrainPoints = (
  width: number,
  baseY: number,
  segments: number,
  amplitude: number,
  seed: number,
) => {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const h = ((seed + i * 7919) * 2654435761) >>> 0;
    const y = baseY - ((h % 1000) / 1000) * amplitude;
    pts.push({ x, y });
  }
  return pts;
};

export const GlowFilters: React.FC = () => (
  <defs>
    <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="edgeGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="connGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="subtleGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={COLORS.system} stopOpacity="0.4" />
      <stop offset="100%" stopColor={COLORS.system} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="tensionGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={COLORS.tension} stopOpacity="0.3" />
      <stop offset="100%" stopColor={COLORS.tension} stopOpacity="0" />
    </radialGradient>
  </defs>
);
