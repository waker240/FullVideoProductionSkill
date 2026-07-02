import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Shared scaffolding for the Cinematics smoke-test compositions.
 *
 * Every smoke test (`SmokeTest`, `TextureAtomsTest`, `EraPresetsTest`)
 * uses the same BaseScene + Label + palette + per-shot duration so visual
 * comparison across tests is direct: render frame 75 of any test and the
 * underlying scene is identical, only the atom under test differs.
 *
 * Underscore prefix marks this as smoke-test-only. Production projects
 * should not import from here.
 */

// ─── Per-shot duration (load-bearing across all smoke tests) ───────────────
export const SHOT = 150;

// ─── Palette (mirrors the Migration project's semantic colors) ─────────────
export const PALETTE = {
  system: "#4A7C9B",
  tension: "#E8913A",
  insight: "#3EC9A7",
  warm: "#F2E2C0",
  bg: "#0A0E14",
  bgLight: "#11161E",
  text: "#E8E4DF",
  textDim: "#8B8780",
};

// ─── BaseScene — held-constant stage every shot renders ────────────────────
//
// Saturated polygons (color-axis atoms visible), bright accent circle
// (halation/bloom visible), text + grid (CA visible on edges), structured
// central composition (mask atoms have stable target geometry). Designed
// to make every Cinema Layer effect register clearly.

export const BaseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame * 0.04) * 0.03;
  return (
    <AbsoluteFill style={{ background: PALETTE.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 38%, ${PALETTE.bgLight} 0%, ${PALETTE.bg} 70%)`,
        }}
      />

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 80 }).map((_, i) => {
          const x = ((i * 137) % 1920);
          const y = ((i * 311) % 1080);
          const r = 1 + (i % 3);
          const op = 0.06 + ((i * 7) % 5) * 0.01;
          return <circle key={`d${i}`} cx={x} cy={y} r={r} fill={PALETTE.text} opacity={op} />;
        })}

        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={`gv${i}`}
            x1={i * 160}
            y1={0}
            x2={i * 160}
            y2={1080}
            stroke={PALETTE.textDim}
            strokeWidth={0.6}
            opacity={0.05}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`gh${i}`}
            x1={0}
            y1={i * 135}
            x2={1920}
            y2={i * 135}
            stroke={PALETTE.textDim}
            strokeWidth={0.6}
            opacity={0.05}
          />
        ))}

        <circle cx={1620} cy={220} r={28} fill={PALETTE.warm} opacity={0.95} />
        <circle cx={1620} cy={220} r={42} fill={PALETTE.warm} opacity={0.18} />

        <g transform={`translate(960, 540) scale(${1 + breathe})`}>
          <polygon points="-360,-50 -260,-50 -310,40" fill={PALETTE.tension} opacity={0.92} />
          <rect x={-160} y={-60} width={120} height={120} fill={PALETTE.system} opacity={0.92} />
          <polygon points="60,-60 130,-60 165,0 130,60 60,60 25,0" fill={PALETTE.insight} opacity={0.92} />
          <polygon points="240,-40 280,-60 320,-60 360,-40 360,40 320,60 280,60 240,40" fill={PALETTE.warm} opacity={0.85} />
        </g>

        <text
          x={960}
          y={760}
          textAnchor="middle"
          fill={PALETTE.text}
          fontFamily="Inter, system-ui, sans-serif"
          fontSize={28}
          fontWeight={500}
          letterSpacing="0.04em"
        >
          argument-bearing thesis text
        </text>
        <text
          x={960}
          y={800}
          textAnchor="middle"
          fill={PALETTE.textDim}
          fontFamily="JetBrains Mono, ui-monospace, monospace"
          fontSize={16}
          letterSpacing="0.10em"
        >
          subtitle / context line · 2026
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ─── Shot label overlay ────────────────────────────────────────────────────
export const Label: React.FC<{
  testName: string;
  shotNumber: number;
  totalShots: number;
  atomName: string;
  details?: string;
}> = ({ testName, shotNumber, totalShots, atomName, details }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 0,
        width: "100%",
        textAlign: "center",
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: 16,
        color: PALETTE.textDim,
        letterSpacing: "0.16em",
      }}
    >
      {testName}
    </div>

    <div
      style={{
        position: "absolute",
        top: 110,
        left: 0,
        width: "100%",
        textAlign: "center",
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: 38,
        fontWeight: 600,
        color: PALETTE.text,
        letterSpacing: "0.06em",
      }}
    >
      {atomName}
    </div>

    {details && (
      <div
        style={{
          position: "absolute",
          top: 168,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 18,
          color: PALETTE.tension,
          letterSpacing: "0.08em",
        }}
      >
        {details}
      </div>
    )}

    <div
      style={{
        position: "absolute",
        bottom: 56,
        left: 0,
        width: "100%",
        textAlign: "center",
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: 13,
        color: PALETTE.textDim,
        letterSpacing: "0.20em",
      }}
    >
      SHOT {shotNumber} / {totalShots}
    </div>
  </AbsoluteFill>
);

// ─── Animation helper: half-sine pulse 0 → 1 → 0 across a shot ─────────────
export const usePulse = (): number => {
  const frame = useCurrentFrame();
  return Math.sin((frame / SHOT) * Math.PI);
};
