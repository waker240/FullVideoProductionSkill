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
 * Dossier-library smoke test.
 *
 * Validates the 3 production patterns the cited-thinker plates need to
 * support across the video:
 *   Beat 1 (0—90)    Hero ceremony reveal — single plate as document object
 *   Beat 2 (90—180)  Callback badge — same plate dims and shrinks to a
 *                    corner anchor; the body text takes over
 *   Beat 3 (180—360) Family montage — all 7 plates land in a horizontal
 *                    row grouped by polygon family. Polygon vocabulary
 *                    doubles as methodological signal.
 *
 * Hexagons   = relational sociology     (Bourdieu, Xiang Biao)
 * Triangles  = vertical critique        (Foucault, Rosa)
 * Squares    = empirical structuralism  (Polanyi, He Bingdi)
 * Octagon    = foundational integration (Fei Xiaotong)
 */

export const DOSSIER_LIBRARY_TEST_DURATION = 360;

const BEAT1_END = 90;
const BEAT2_END = 180;
const BEAT3_END = 360;

type DossierEntry = {
  id: string;
  src: string;
  family: "hexagon" | "triangle" | "square" | "octagon";
  tab: string;
  shortName: string; // for badge subtitle in beat 3
};

// Ordered for beat-3 layout: family-grouped, then by TAB number within family.
const DOSSIERS: DossierEntry[] = [
  { id: "bourdieu", src: "01-bourdieu.png", family: "hexagon", tab: "II", shortName: "BOURDIEU" },
  { id: "xiangbiao", src: "05-xiang-biao.png", family: "hexagon", tab: "VI", shortName: "XIANG BIAO" },
  { id: "foucault", src: "02-foucault.png", family: "triangle", tab: "III", shortName: "FOUCAULT" },
  { id: "rosa", src: "06-rosa.png", family: "triangle", tab: "VII", shortName: "ROSA" },
  { id: "polanyi", src: "03-polanyi.png", family: "square", tab: "IV", shortName: "POLANYI" },
  { id: "hebingdi", src: "04-he-bingdi.png", family: "square", tab: "V", shortName: "HE BINGDI" },
  { id: "fei", src: "07-fei-xiaotong.png", family: "octagon", tab: "VIII", shortName: "FEI XIAOTONG" },
];

const FAMILY_LABEL: Record<DossierEntry["family"], string> = {
  hexagon: "RELATIONAL",
  triangle: "VERTICAL CRITIQUE",
  square: "STRUCTURAL",
  octagon: "FOUNDATIONAL",
};

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

const dossierPath = (src: string) => staticFile(`projects/the-migration/assets/dossiers/${src}`);

export const DossierLibraryTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // ─── Beat 1 + 2: hero plate (Foucault) is the focal artifact.
  // Beat 1 entrance.
  const heroEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 90 },
  });
  // Beat 2: hero retreats to corner badge (frames 90—120 = transition).
  const heroBadgeT = interpolate(frame, [BEAT1_END, BEAT1_END + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Beat 3: hero exits before the montage (frames 170—185).
  const heroExitT = interpolate(frame, [BEAT2_END - 10, BEAT2_END + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hero geometry — interpolates from full-plate ceremony to corner badge.
  const heroPlateHeightFull = height * 0.72;
  const heroPlateHeightBadge = height * 0.18;
  const heroPlateHeight = interpolate(heroBadgeT, [0, 1], [heroPlateHeightFull, heroPlateHeightBadge]);
  const heroPlateWidth = heroPlateHeight * (1024 / 1536);
  const heroCenterXFull = width / 2;
  const heroCenterXBadge = 110 + heroPlateWidth / 2; // upper-left badge anchor
  const heroCenterX = interpolate(heroBadgeT, [0, 1], [heroCenterXFull, heroCenterXBadge]);
  const heroCenterYFull = height / 2 - height * 0.04;
  const heroCenterYBadge = 110 + heroPlateHeight / 2;
  const heroCenterY = interpolate(heroBadgeT, [0, 1], [heroCenterYFull, heroCenterYBadge]);
  const heroOpacity =
    interpolate(heroEntrance, [0, 1], [0, 1]) *
    interpolate(heroBadgeT, [0, 1], [1, 0.55]) *
    (1 - heroExitT);
  const heroTilt =
    interpolate(heroEntrance, [0, 1], [-2.2, -0.6]) *
    interpolate(heroBadgeT, [0, 1], [1, 0]);
  const heroBreathe = 1 + Math.sin(frame * 0.04) * 0.004 * (1 - heroBadgeT);

  // ─── Beat 1 citation label.
  const beat1LabelOp = interpolate(frame, [55, 80], [0, 1], { extrapolateRight: "clamp" }) *
    interpolate(frame, [BEAT1_END - 10, BEAT1_END + 5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ─── Beat 2 callback subtitle (next to badge).
  const beat2BodyOp = interpolate(frame, [BEAT1_END + 25, BEAT1_END + 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * (1 - heroExitT);

  // ─── Beat 3 family montage.
  // Layout math: 7 plates in a single horizontal row, family-grouped.
  const beat3Start = BEAT2_END;
  // Per-plate stagger: 6 frames each → all 7 land within ~42 frames.
  const STAGGER = 6;

  // Sizing pass — assumes 3 internal pair-gaps (within hexagon, triangle,
  // square pairs) and 3 family-separator gaps (hexagon→triangle, triangle→
  // square, square→octagon).
  const PAIR_GAP = 18;
  const FAMILY_GAP = 64;
  const sideMargin = 60;
  // Internal pair gaps: 3 (one per hex/tri/square pair); family separators: 3.
  const totalGaps = 3 * PAIR_GAP + 3 * FAMILY_GAP;
  const montagePlateW = (width - 2 * sideMargin - totalGaps) / 7;
  const montagePlateH = montagePlateW * (1536 / 1024);

  // Compute x-positions per plate using family grouping.
  const plateXs = useMemo(() => {
    const xs: number[] = [];
    let cursor = sideMargin;
    let prevFamily: DossierEntry["family"] | null = null;
    for (let i = 0; i < DOSSIERS.length; i++) {
      const d = DOSSIERS[i];
      if (prevFamily !== null) {
        cursor += d.family !== prevFamily ? FAMILY_GAP : PAIR_GAP;
      }
      xs.push(cursor);
      cursor += montagePlateW;
      prevFamily = d.family;
    }
    return xs;
  }, [montagePlateW]);

  const montageY = (height - montagePlateH) / 2 - height * 0.02;

  // Headline at top of beat 3.
  const beat3HeadlineOp = interpolate(frame, [beat3Start + 10, beat3Start + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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

      {/* ─── Hero plate (beats 1 & 2) ─── */}
      <div
        style={{
          position: "absolute",
          left: heroCenterX - heroPlateWidth / 2,
          top: heroCenterY - heroPlateHeight / 2,
          width: heroPlateWidth,
          height: heroPlateHeight,
          transform: `scale(${heroBreathe}) rotate(${heroTilt}deg)`,
          transformOrigin: "center center",
          opacity: heroOpacity,
          filter: `drop-shadow(0 ${interpolate(heroBadgeT, [0, 1], [28, 12])}px ${interpolate(
            heroBadgeT,
            [0, 1],
            [48, 18]
          )}px rgba(0, 0, 0, ${interpolate(heroBadgeT, [0, 1], [0.65, 0.45])}))`,
        }}
      >
        <Img
          src={dossierPath("02-foucault.png")}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      </div>

      {/* ─── Beat 1 citation label ─── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: height * 0.05,
          textAlign: "center",
          opacity: beat1LabelOp,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 14,
            color: COLORS.textDim,
            letterSpacing: 2,
            marginBottom: 6,
          }}
        >
          {"FOUCAULT \u00b7 1926\u20141984"}
        </div>
        <div
          style={{
            fontFamily: FONT.main,
            fontSize: 22,
            color: COLORS.text,
            fontWeight: 400,
          }}
        >
          {"\u300a\u89c4\u8bad\u4e0e\u60e9\u7f5a\u300b \u00b7 \u300a\u77e5\u8bc6\u8003\u53e4\u5b66\u300b"}
        </div>
      </div>

      {/* ─── Beat 2 callback body — appears beside the dimmed badge ─── */}
      <div
        style={{
          position: "absolute",
          left: 110 + heroPlateWidth + 32,
          top: 110,
          width: width * 0.55,
          opacity: beat2BodyOp,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            color: COLORS.textDim,
            letterSpacing: 2,
            marginBottom: 14,
          }}
        >
          {"\u2014 CALLBACK \u00b7 CITATION ACTIVE"}
        </div>
        <div
          style={{
            fontFamily: FONT.main,
            fontSize: 38,
            color: COLORS.text,
            fontWeight: 300,
            lineHeight: 1.35,
            letterSpacing: 0.3,
          }}
        >
          {"\u8fd9\u79cd\u201c\u53ef\u89c1\u7684\u538b\u5236\u201d\uff0c"}
          <br />
          {"\u53ea\u662f\u8fc1\u5f99\u7684\u7b2c\u4e00\u5c42\u3002"}
        </div>
      </div>

      {/* ─── Beat 3 family montage ─── */}
      {DOSSIERS.map((d, i) => {
        const enterFrame = beat3Start + i * STAGGER + 10;
        const localT = spring({
          frame: frame - enterFrame,
          fps,
          config: { damping: 16, stiffness: 95 },
        });
        const yOffset = interpolate(localT, [0, 1], [180, 0]);
        const opacity = interpolate(localT, [0, 0.4, 1], [0, 0.7, 1], { extrapolateRight: "clamp" });
        const scale = interpolate(localT, [0, 1], [0.9, 1.0]);

        // Subtle breathing once landed.
        const isLanded = frame > enterFrame + 30;
        const breathe = isLanded ? 1 + Math.sin((frame + i * 23) * 0.03) * 0.005 : 1;

        return (
          <div
            key={d.id}
            style={{
              position: "absolute",
              left: plateXs[i],
              top: montageY + yOffset,
              width: montagePlateW,
              height: montagePlateH,
              opacity,
              transform: `scale(${scale * breathe})`,
              transformOrigin: "center bottom",
              filter: "drop-shadow(0 14px 22px rgba(0, 0, 0, 0.5))",
            }}
          >
            <Img
              src={dossierPath(d.src)}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </div>
        );
      })}

      {/* ─── Beat 3 family labels (under each pair) ─── */}
      {(() => {
        // Group plates by family to compute pair centers and labels.
        type Group = { family: DossierEntry["family"]; left: number; right: number };
        const groups: Group[] = [];
        let g: Group | null = null;
        DOSSIERS.forEach((d, i) => {
          if (!g || g.family !== d.family) {
            if (g) groups.push(g);
            g = { family: d.family, left: plateXs[i], right: plateXs[i] + montagePlateW };
          } else {
            g.right = plateXs[i] + montagePlateW;
          }
        });
        if (g) groups.push(g);

        return groups.map((grp, gi) => {
          const labelOp = interpolate(
            frame,
            [beat3Start + DOSSIERS.length * STAGGER + 25, beat3Start + DOSSIERS.length * STAGGER + 50],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const cx = (grp.left + grp.right) / 2;
          return (
            <div
              key={`label-${gi}`}
              style={{
                position: "absolute",
                left: cx - 200,
                width: 400,
                top: montageY + montagePlateH + 22,
                textAlign: "center",
                opacity: labelOp,
              }}
            >
              <div
                style={{
                  height: 1,
                  background: COLORS.systemDim,
                  width: Math.min(grp.right - grp.left - 40, 220),
                  margin: "0 auto 10px",
                }}
              />
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 13,
                  color: COLORS.textDim,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {FAMILY_LABEL[grp.family]}
              </div>
            </div>
          );
        });
      })()}

      {/* ─── Beat 3 headline ─── */}
      <div
        style={{
          position: "absolute",
          top: 80,
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
          {"\u2014 THE CITATION CHORUS \u00b7 REGISTER B"}
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
          {"\u4e03\u4f4d\u601d\u60f3\u5bb6 \u00b7 \u56db\u4e2a\u8c31\u7cfb"}
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
          ? "BEAT 2 \u00b7 CALLBACK BADGE"
          : "BEAT 3 \u00b7 FAMILY MONTAGE"}
      </div>
    </AbsoluteFill>
  );
};
