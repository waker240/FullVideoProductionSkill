import { Easing, interpolate, spring } from "remotion";

export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOutExp = Easing.out(Easing.exp);
export const easeOutBack = Easing.out(Easing.back(1.5));

export const SPRING = {
  standard: { damping: 14, stiffness: 100, mass: 1, overshootClamping: false },
  tension: { damping: 8, stiffness: 200, mass: 1, overshootClamping: false },
  resolve: { damping: 20, stiffness: 60, mass: 1, overshootClamping: false },
  ambient: { damping: 30, stiffness: 30, mass: 1, overshootClamping: false },
} as const;

export type MotionRegister = keyof typeof SPRING;

/** 0→1 ramp with easing (centralized — replaces per-file copies) */
export const rise = (
  frame: number,
  start: number,
  end: number,
  easing: (input: number) => number = easeOut,
) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** 1→0 ramp (inverse of rise — dims, exits, recedes) */
export const recede = (
  frame: number,
  start: number,
  end: number,
  easing: (input: number) => number = easeOut,
) =>
  interpolate(frame, [start, end], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Four-knot envelope: fade in → hold → fade out */
export const fadeWindow = (
  frame: number,
  inS: number,
  inE: number,
  outS: number,
  outE: number,
) =>
  interpolate(frame, [inS, inE, outS, outE], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Spring-based 0→1 entry with emotional register */
export const springIn = (
  frame: number,
  start: number,
  fps: number,
  register: MotionRegister = "standard",
) =>
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: SPRING[register],
  });

/** Spring-based 1→0 exit with emotional register */
export const springOut = (
  frame: number,
  start: number,
  fps: number,
  register: MotionRegister = "standard",
) =>
  1 -
  spring({
    frame: Math.max(0, frame - start),
    fps,
    config: SPRING[register],
  });

/** Spring-interpolated value between two endpoints */
export const springValue = (
  frame: number,
  start: number,
  fps: number,
  from: number,
  to: number,
  register: MotionRegister = "standard",
) => {
  const p = spring({
    frame: Math.max(0, frame - start),
    fps,
    config: SPRING[register],
  });
  return from + (to - from) * p;
};

/** Anticipation→Action→Settle: slight coil before entry */
export const anticipate = (
  frame: number,
  start: number,
  fps: number,
  coilFrames: number = 4,
  register: MotionRegister = "standard",
) => {
  if (frame < start) return 0;
  if (frame < start + coilFrames) {
    return interpolate(frame, [start, start + coilFrames], [0, -0.05], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  return spring({
    frame: frame - start - coilFrames,
    fps,
    config: SPRING[register],
    from: -0.05,
    to: 1,
  });
};
