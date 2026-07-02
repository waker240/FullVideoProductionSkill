import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT } from "./theme";
import { GlowFilters, terrainPoints } from "./LowPoly";
import { Particles } from "./Particles";

/**
 * Smoke test for AI-generated low-poly primitive PNGs (cutout, transparent BG)
 * sitting on top of the same canvas backdrop as the cold open:
 *   • dark base + radial vignette
 *   • ambient terrain (preconscious spatial anchor)
 *   • systemDim particles
 *   • SVG migration arrow (the channel-vocabulary primitive)
 *
 * Tests:
 *   1. Do the cutouts read cleanly against the dark canvas? (alpha edges)
 *   2. Do the colors of the PNGs sit naturally next to system/tension/insight palette?
 *   3. Does the artifact survive a slow camera push without revealing seams?
 *   4. Does an overlaid SVG primitive (migration arrow) compose on top correctly?
 *
 * Layout: each gate gets a 90-frame "card" (3s @ 30fps) with:
 *   • 12-frame fade-in
 *   • 78-frame hold with slow scale-push 1.00 → 1.06 + drift
 *   • 12-frame cross-fade out (overlapping next gate's fade-in for L-cut)
 *   • Era label types in below
 *   • Migration arrow rises during the hold
 *
 * Total duration: 4 cards × 78 frames + 12-frame tails = ~360 frames (12s).
 */

export const PRIMITIVE_SMOKE_TEST_DURATION = 360;

const GATES = [
  {
    file: "01-chained-codex.png",
    eraLabel: "Manuscript · pre-1450",
    gateLabel: "Gate form 1 — chained codex",
  },
  {
    file: "02-gutenberg-press.png",
    eraLabel: "Print · 1450",
    gateLabel: "Gate form 2 — printing press",
  },
  {
    file: "03-keju-gate.png",
    eraLabel: "科举 · ~1000+",
    gateLabel: "Gate form 3 — exam hall",
  },
  {
    file: "04-ai-bifurcated-gate.png",
    eraLabel: "AI · 2024",
    gateLabel: "Gate form 6 — bifurcated AI",
  },
];

// Vignette layer (matches ColdOpen)
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 42%, ${COLORS.backgroundLight} 0%, ${COLORS.background} 72%)`,
      pointerEvents: "none",
    }}
  />
);

// Ambient terrain (matches ColdOpen)
const AmbientTerrain: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const terrain = useMemo(() => {
    const layers = [
      { y: height * 0.84, amp: 38, segments: 18, seed: 29, color: COLORS.system, op: 0.1 },
      { y: height * 0.91, amp: 22, segments: 22, seed: 67, color: COLORS.systemDim, op: 0.08 },
    ];
    return layers.map((l) => ({
      ...l,
      pts: terrainPoints(width, l.y, l.segments, l.amp, l.seed),
    }));
  }, [width, height]);
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <GlowFilters />
      {terrain.map((layer, i) => {
        const breathe = Math.sin(frame * 0.007 + i * 1.4) * 2;
        const d =
          `M 0 ${height} ` +
          layer.pts.map((p) => `L ${p.x} ${p.y + breathe}`).join(" ") +
          ` L ${width} ${height} Z`;
        return <path key={i} d={d} fill={layer.color} opacity={layer.op} />;
      })}
    </svg>
  );
};

// One gate card: gate PNG + era label + migration arrow + gate label
const GateCard: React.FC<{ gate: (typeof GATES)[number]; cardDur: number }> = ({ gate, cardDur }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [cardDur - 18, cardDur], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  // Slow scale push: 1.00 → 1.06 across the hold
  const scale = interpolate(frame, [0, cardDur], [1.0, 1.06]);
  // Subtle vertical drift downward by 8px (settling)
  const yDrift = interpolate(frame, [0, cardDur], [-4, 4]);

  // Gate PNG centered, ~52% of frame height
  const gateHeight = height * 0.52;

  // Migration arrow: spring-in starting at frame 30
  const arrowSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 18, stiffness: 110 },
  });
  const arrowOpacity = interpolate(arrowSpring, [0, 1], [0, 0.85]);
  const arrowYOffset = interpolate(arrowSpring, [0, 1], [60, 0]);

  // Era label types in
  const labelOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Migration arrow — SVG primitive on TOP of the PNG to verify layering */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: arrowOpacity }}
      >
        <defs>
          <marker id="arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.tension} />
          </marker>
        </defs>
        {/* Vertical migration arrow to the right of the gate */}
        <line
          x1={width * 0.78}
          y1={height * 0.72 + arrowYOffset}
          x2={width * 0.78}
          y2={height * 0.32 + arrowYOffset}
          stroke={COLORS.tension}
          strokeWidth={3}
          strokeLinecap="round"
          markerEnd="url(#arrow-head)"
        />
        {/* "迁移" label next to arrow */}
        <text
          x={width * 0.79}
          y={height * 0.5 + arrowYOffset}
          fill={COLORS.tension}
          fontSize={22}
          fontFamily={FONT.main}
          fontWeight={500}
          opacity={0.7}
        >
          迁移
        </text>
      </svg>

      {/* Gate PNG centered */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${yDrift}px) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile(`projects/the-migration/assets/cold-open/gates/${gate.file}`)}
          style={{
            height: gateHeight,
            width: "auto",
            // No filter / no shadow — let the cutout speak for itself first.
            // (Optionally, a subtle drop shadow could be added: filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.55))")
          }}
        />
      </div>

      {/* Bottom-left: era label (mono) */}
      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 96,
          opacity: labelOpacity,
          fontFamily: FONT.mono,
          fontSize: 18,
          color: COLORS.textDim,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {gate.eraLabel}
      </div>

      {/* Bottom-left under era label: gate label (sans) */}
      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 56,
          opacity: labelOpacity,
          fontFamily: FONT.main,
          fontSize: 28,
          color: COLORS.text,
          fontWeight: 500,
        }}
      >
        {gate.gateLabel}
      </div>
    </AbsoluteFill>
  );
};

export const PrimitiveSmokeTest: React.FC = () => {
  const cardDur = 90;
  // Overlap each card by 12 frames for L-cut transitions
  const stride = cardDur - 12;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, overflow: "hidden" }}>
      <Vignette />
      <Particles
        count={10}
        color={COLORS.systemDim}
        sizeMin={2}
        sizeMax={5}
        opacityMin={0.02}
        opacityMax={0.08}
        fadeInFrames={20}
      />
      <AmbientTerrain />

      {GATES.map((gate, i) => (
        <Sequence key={gate.file} from={i * stride} durationInFrames={cardDur}>
          <GateCard gate={gate} cardDur={cardDur} />
        </Sequence>
      ))}

      {/* Top-right: smoke test marker so we know what we're looking at */}
      <div
        style={{
          position: "absolute",
          top: 32,
          right: 48,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 14,
          color: COLORS.textDim,
          letterSpacing: 1.5,
          opacity: 0.5,
        }}
      >
        SMOKE TEST · primitives v1
      </div>
    </AbsoluteFill>
  );
};
