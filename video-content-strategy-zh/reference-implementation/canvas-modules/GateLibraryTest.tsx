import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Img,
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
 * Gate-library smoke test.
 *
 * Validates the 6-gate Register A library against the cold-open's three
 * production patterns:
 *
 *   Beat 1 (0—90)    Single-gate ceremony reveal — chained codex hero
 *   Beat 2 (90—180)  Migration moment — codex dissolves, press materialises
 *                    one stratum higher with the migration arrow firing.
 *                    The argument the storyboard makes via the migration
 *                    vector is shown in compressed form here.
 *   Beat 3 (180—360) Era timeline — all 6 gates arranged left→right with
 *                    upper-plane staircase descending from y≈42% (1450) to
 *                    y≈22% (AI). The visual grammar of shot 003 in compressed
 *                    library form. Era labels appear under each gate.
 *
 * The era→y mapping mirrors the storyboard's shot 003 stair pattern.
 */

export const GATE_LIBRARY_TEST_DURATION = 360;

const BEAT1_END = 90;
const BEAT2_END = 180;

type GateEntry = {
  id: string;
  src: string;
  era: string;          // short Chinese tag for label
  eraEn: string;        // mono diagnostic tag
  yFraction: number;    // upper-plane stair-y in beat 3 (proportional)
};

// Storyboard shot 003 staircase: y=42% → 38% → 36% → 32% → 28% → 22%.
const GATES: GateEntry[] = [
  { id: "codex",        src: "01-chained-codex-v2.png",      era: "抄本",       eraEn: "MANUSCRIPT",        yFraction: 0.42 },
  { id: "press",        src: "02-printing-press-v2.png",     era: "印刷",       eraEn: "PRINT · 1450",      yFraction: 0.38 },
  { id: "keju",         src: "03-keju-door-v2.png",          era: "科举",       eraEn: "KEJU · 1000+",      yFraction: 0.36 },
  { id: "credential",   src: "04-credentialed-door-v2.png",  era: "凭证",       eraEn: "CREDENTIAL · 1850", yFraction: 0.32 },
  { id: "feed",         src: "05-feed-stack-v2.png",         era: "推荐",       eraEn: "FEED · 2010",       yFraction: 0.28 },
  { id: "ai",           src: "06-ai-bifurcated-v2.png",      era: "AI",         eraEn: "AI · 2024",         yFraction: 0.22 },
];

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 42%, ${COLORS.backgroundLight} 0%, ${COLORS.background} 72%)`,
      pointerEvents: "none",
    }}
  />
);

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

const gatePath = (src: string) => staticFile(`projects/the-migration/assets/cold-open/gates-v2/${src}`);

export const GateLibraryTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // ─── Beat 1: chained codex hero
  const heroEntrance = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  // Beat 2 transition: hero exits as migration fires
  const heroExitT = interpolate(frame, [BEAT1_END - 5, BEAT1_END + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Beat 2 close: press gate materialises higher up
  const pressEntranceT = spring({
    frame: frame - (BEAT1_END + 20),
    fps,
    config: { damping: 18, stiffness: 95 },
  });
  // Beat 3: gates timeline mode
  const beat3T = interpolate(frame, [BEAT2_END - 8, BEAT2_END + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hero (codex) sizing
  const heroSize = height * 0.55;
  const heroX = width / 2;
  const heroY = height / 2 - height * 0.04;
  const heroOpacity = interpolate(heroEntrance, [0, 1], [0, 1]) * (1 - heroExitT);
  const heroScale = interpolate(heroEntrance, [0, 1], [0.88, 1.0]);

  // Migration arrow that fires during Beat 2
  const arrowT = interpolate(frame, [BEAT1_END, BEAT1_END + 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arrowOpacity = arrowT * (1 - interpolate(frame, [BEAT2_END - 8, BEAT2_END + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // Beat 2 press gate position (clearly higher and to the right of where codex was,
  // so the migration arrow has visual real estate to draw between them)
  const pressSize = height * 0.36;
  const pressX = width / 2 + width * 0.18;
  const pressY = height / 2 - height * 0.22;
  const pressOpacity = pressEntranceT * (1 - beat3T);
  const pressScale = interpolate(pressEntranceT, [0, 1], [0.85, 1.0]);

  // Beat 3 layout: 6 gates left→right, each at its era staircase y position.
  const sideMargin = 70;
  const gateGap = 38;
  const gateBoxW = (width - 2 * sideMargin - 5 * gateGap) / 6;
  const gateBoxH = gateBoxW; // 1:1
  const gateXs = useMemo(
    () => GATES.map((_, i) => sideMargin + i * (gateBoxW + gateGap)),
    [gateBoxW]
  );

  // Headline at top of beat 3
  const beat3HeadlineOp = interpolate(frame, [BEAT2_END + 10, BEAT2_END + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Migration vector (dotted curve through the 6 staircase positions) timing
  const migrationCurveT = interpolate(
    frame,
    [BEAT2_END + GATES.length * 5 + 30, BEAT2_END + GATES.length * 5 + 80],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Compute migration-curve waypoints from gate centers
  const migrationPoints = GATES.map((g, i) => ({
    x: gateXs[i] + gateBoxW / 2,
    y: height * g.yFraction,
  }));
  const migrationPathD = useMemo(() => {
    if (migrationPoints.length === 0) return "";
    let d = `M ${migrationPoints[0].x} ${migrationPoints[0].y}`;
    for (let i = 1; i < migrationPoints.length; i++) {
      const prev = migrationPoints[i - 1];
      const curr = migrationPoints[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` Q ${cx} ${prev.y} ${curr.x} ${curr.y}`;
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

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

      {/* ─── Beat 1 hero codex ─── */}
      <div
        style={{
          position: "absolute",
          left: heroX - heroSize / 2,
          top: heroY - heroSize / 2,
          width: heroSize,
          height: heroSize,
          opacity: heroOpacity,
          transform: `scale(${heroScale})`,
          transformOrigin: "center center",
          filter: "drop-shadow(0 28px 48px rgba(0, 0, 0, 0.65))",
        }}
      >
        <Img
          src={gatePath("01-chained-codex-v2.png")}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      </div>

      {/* ─── Beat 1 era anchor below hero ─── */}
      <div
        style={{
          position: "absolute",
          bottom: height * 0.07,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [40, 70], [0, 1], { extrapolateRight: "clamp" }) * (1 - heroExitT),
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 13,
            color: COLORS.textDim,
            letterSpacing: 3,
            marginBottom: 8,
          }}
        >
          {"GATE 01 \u00b7 MANUSCRIPT \u00b7 PRE-1450"}
        </div>
        <div
          style={{
            fontFamily: FONT.main,
            fontSize: 28,
            color: COLORS.text,
            fontWeight: 300,
            letterSpacing: 0.4,
          }}
        >
          {"\u4e00\u4efd\u62c4\u672c\uff0c\u4e00\u5e74\u4e00\u4efd\u3002"}
        </div>
      </div>

      {/* ─── Beat 2 migration arrow + press gate ─── */}
      {arrowOpacity > 0.01 && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: arrowOpacity }}>
          {(() => {
            // Arrow leaves the codex from its UPPER-RIGHT and arrives at the
            // press from its LOWER-LEFT. Both endpoints sit OUTSIDE the
            // respective subject silhouettes so the curve is fully visible.
            const startX = heroX + heroSize * 0.32;
            const startY = heroY - heroSize * 0.45;
            const endX = pressX - pressSize * 0.42;
            const endY = pressY + pressSize * 0.32;
            const midY = Math.min(startY, endY) - 40;
            const drawT = arrowT;
            // Easing the path drawing — animate stroke-dashoffset
            const pathD = `M ${startX} ${startY} Q ${(startX + endX) / 2} ${midY} ${endX} ${endY}`;
            const dashLength = 600;
            const dashOffset = dashLength * (1 - drawT);
            return (
              <g>
                <path
                  d={pathD}
                  stroke={COLORS.tension}
                  strokeWidth={2.5}
                  fill="none"
                  strokeDasharray={`${dashLength} ${dashLength}`}
                  strokeDashoffset={dashOffset}
                  opacity={0.85}
                />
                {/* Arrowhead at end — points up-and-right toward press */}
                {drawT > 0.92 && (
                  <polygon
                    points={`${endX - 12},${endY + 6} ${endX - 4},${endY - 8} ${endX + 8},${endY - 2}`}
                    fill={COLORS.tension}
                    opacity={(drawT - 0.92) * 12}
                  />
                )}
              </g>
            );
          })()}
        </svg>
      )}

      <div
        style={{
          position: "absolute",
          left: pressX - pressSize / 2,
          top: pressY - pressSize / 2,
          width: pressSize,
          height: pressSize,
          opacity: pressOpacity,
          transform: `scale(${pressScale})`,
          transformOrigin: "center center",
          filter: "drop-shadow(0 22px 36px rgba(0, 0, 0, 0.6))",
        }}
      >
        <Img
          src={gatePath("02-printing-press-v2.png")}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      </div>

      {/* ─── Beat 2 caption ─── */}
      <div
        style={{
          position: "absolute",
          bottom: height * 0.07,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity:
            interpolate(frame, [BEAT1_END + 30, BEAT1_END + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
            (1 - beat3T),
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 13,
            color: COLORS.tension,
            letterSpacing: 3,
            marginBottom: 8,
          }}
        >
          {"\u2014 MIGRATION FIRES \u00b7 GATE RELOCATES"}
        </div>
        <div
          style={{
            fontFamily: FONT.main,
            fontSize: 28,
            color: COLORS.text,
            fontWeight: 300,
            letterSpacing: 0.4,
          }}
        >
          {"\u95e8\u69db\u4ece\u672a\u6d88\u5931\u3002\u53ea\u662f\uff0c\u632a\u52a8\u4e86\u3002"}
        </div>
      </div>

      {/* ─── Beat 3 timeline gates ─── */}
      {GATES.map((g, i) => {
        const enterFrame = BEAT2_END + i * 5 + 8;
        const localT = spring({
          frame: frame - enterFrame,
          fps,
          config: { damping: 16, stiffness: 95 },
        });
        const yOffset = interpolate(localT, [0, 1], [120, 0]);
        const opacity = interpolate(localT, [0, 0.4, 1], [0, 0.7, 1], { extrapolateRight: "clamp" });
        const scale = interpolate(localT, [0, 1], [0.85, 1.0]);
        const breathe = frame > enterFrame + 30 ? 1 + Math.sin((frame + i * 23) * 0.03) * 0.005 : 1;
        const cx = gateXs[i] + gateBoxW / 2;
        const cy = height * g.yFraction;

        return (
          <div
            key={`gate-${g.id}`}
            style={{
              position: "absolute",
              left: cx - gateBoxW / 2,
              top: cy - gateBoxH / 2 + yOffset,
              width: gateBoxW,
              height: gateBoxH,
              opacity,
              transform: `scale(${scale * breathe})`,
              transformOrigin: "center center",
              filter: "drop-shadow(0 12px 18px rgba(0, 0, 0, 0.55))",
            }}
          >
            <Img
              src={gatePath(g.src)}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </div>
        );
      })}

      {/* ─── Beat 3 era labels under each gate (anchored to lower plane) ─── */}
      {GATES.map((g, i) => {
        const enterFrame = BEAT2_END + i * 5 + 28;
        const opacity = interpolate(frame, [enterFrame, enterFrame + 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const cx = gateXs[i] + gateBoxW / 2;
        const labelY = height * 0.78;

        return (
          <div
            key={`label-${g.id}`}
            style={{
              position: "absolute",
              left: cx - 140,
              top: labelY,
              width: 280,
              textAlign: "center",
              opacity,
            }}
          >
            <div
              style={{
                height: 1,
                background: COLORS.systemDim,
                width: 90,
                margin: "0 auto 12px",
              }}
            />
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                color: COLORS.textDim,
                letterSpacing: 2.5,
                marginBottom: 6,
              }}
            >
              {g.eraEn}
            </div>
            <div
              style={{
                fontFamily: FONT.main,
                fontSize: 22,
                color: COLORS.text,
                fontWeight: 300,
              }}
            >
              {g.era}
            </div>
          </div>
        );
      })}

      {/* ─── Beat 3 migration vector — dotted curve through staircase ─── */}
      {migrationCurveT > 0.01 && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <path
            d={migrationPathD}
            stroke={COLORS.tension}
            strokeWidth={1.8}
            fill="none"
            strokeDasharray="6 8"
            opacity={0.55}
            pathLength={1}
            strokeDashoffset={1 - migrationCurveT}
            style={{
              strokeDasharray: `${migrationCurveT * 1000} 1000`,
            }}
          />
          {migrationCurveT > 0.95 && (
            <g>
              {migrationPoints.map((p, i) => (
                <circle
                  key={`mp-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill={COLORS.tension}
                  opacity={(migrationCurveT - 0.95) * 20}
                />
              ))}
            </g>
          )}
        </svg>
      )}

      {/* ─── Beat 3 headline ─── */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: beat3HeadlineOp,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 13,
            color: COLORS.textDim,
            letterSpacing: 3,
            marginBottom: 10,
          }}
        >
          {"\u2014 SIX GATES \u00b7 SIX HUNDRED YEARS \u00b7 ONE MIGRATION VECTOR"}
        </div>
        <div
          style={{
            fontFamily: FONT.main,
            fontSize: 30,
            color: COLORS.text,
            fontWeight: 300,
            letterSpacing: 0.5,
          }}
        >
          {"\u540c\u4e00\u4e2a\u95e8\u69db \u00b7 \u516d\u4e2a\u5e74\u4ee3\u7684\u5316\u8eab"}
        </div>
      </div>

      {/* ─── Diagnostic top-right beat marker ─── */}
      <div
        style={{
          position: "absolute",
          top: 32,
          right: 48,
          fontFamily: FONT.mono,
          fontSize: 12,
          color: COLORS.textDim,
          letterSpacing: 1.5,
          opacity: 0.45,
        }}
      >
        {frame < BEAT1_END
          ? "BEAT 1 \u00b7 CEREMONY"
          : frame < BEAT2_END
          ? "BEAT 2 \u00b7 MIGRATION FIRES"
          : "BEAT 3 \u00b7 ERA TIMELINE"}
      </div>
    </AbsoluteFill>
  );
};
