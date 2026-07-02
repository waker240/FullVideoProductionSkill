import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const fragmentPoints = (
  cx: number,
  cy: number,
  size: number,
  sides: number,
  rotation: number,
  seed: number,
) => {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2 + rotation;
    const jitter = 1 + 0.2 * Math.sin(seed * 137.5 + i * 47.3);
    return `${cx + size * jitter * Math.cos(angle)},${cy + size * jitter * Math.sin(angle)}`;
  }).join(" ");
};

export const Particles: React.FC<{
  count?: number;
  color?: string;
  sizeMin?: number;
  sizeMax?: number;
  opacityMin?: number;
  opacityMax?: number;
  fadeInFrames?: number;
}> = ({
  count = 40,
  color = "#E8913A",
  sizeMin = 1,
  sizeMax = 4,
  opacityMin = 0.05,
  opacityMax = 0.2,
  fadeInFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const globalOpacity = interpolate(frame, [0, fadeInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  const specs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const h = ((i + 1) * 2654435761) >>> 0;
        const h2 = ((i + 1) * 1597334677) >>> 0;
        return {
          x0: (h % 10000) / 10000,
          y0: (h2 % 10000) / 10000,
          r: sizeMin + ((h % 7) / 6) * (sizeMax - sizeMin),
          sides: 3 + (h % 2) as 3 | 4,
          speed: 0.3 + ((h % 11) / 10) * 0.7,
          px: ((h * 31) % 628) / 100,
          py: ((h * 47) % 628) / 100,
          amp: 15 + (h % 50),
          op: opacityMin + ((h2 % 9) / 8) * (opacityMax - opacityMin),
          rotBase: ((h * 13) % 628) / 100,
          seed: h,
        };
      }),
    [count, sizeMin, sizeMax, opacityMin, opacityMax],
  );

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, opacity: globalOpacity }}
    >
      {specs.map((p, i) => {
        const cx =
          p.x0 * width + Math.sin(frame * 0.007 * p.speed + p.px) * p.amp;
        const cy =
          p.y0 * height +
          Math.cos(frame * 0.005 * p.speed + p.py) * p.amp * 0.7;
        const o =
          p.op * (0.6 + 0.4 * Math.sin(frame * 0.018 * p.speed + p.px));
        const rotation = p.rotBase + frame * 0.003 * p.speed;
        return (
          <polygon
            key={i}
            points={fragmentPoints(cx, cy, p.r, p.sides, rotation, p.seed)}
            fill={color}
            opacity={o}
          />
        );
      })}
    </svg>
  );
};
