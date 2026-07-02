import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { rise, springIn, type MotionRegister } from "./motion";

/**
 * Returns opacity for an element based on whether it's the current focus target.
 * When focusFrame is null, all elements remain fully visible.
 * When set, the focused element stays at full opacity; others dim.
 */
export const stageFocus = (
  frame: number,
  focusFrame: number | null,
  isFocused: boolean,
  transitionFrames: number = 12,
  dimTo: number = 0.25,
): number => {
  if (focusFrame === null) return 1;
  const p = rise(frame, focusFrame, focusFrame + transitionFrames);
  return isFocused ? 1 : 1 - p * (1 - dimTo);
};

/**
 * Returns scale for an element under focus — focused grows slightly, others shrink.
 * Use alongside stageFocus for combined opacity+scale isolation.
 */
export const stageScale = (
  frame: number,
  focusFrame: number | null,
  isFocused: boolean,
  transitionFrames: number = 12,
  focusScale: number = 1.05,
  dimScale: number = 0.95,
): number => {
  if (focusFrame === null) return 1;
  const p = rise(frame, focusFrame, focusFrame + transitionFrames);
  return isFocused ? 1 + p * (focusScale - 1) : 1 - p * (1 - dimScale);
};

/** Rule-of-thirds anchor points (fractional coordinates) */
export const GRID = {
  topLeft: { x: 1 / 3, y: 1 / 3 },
  topCenter: { x: 1 / 2, y: 1 / 3 },
  topRight: { x: 2 / 3, y: 1 / 3 },
  centerLeft: { x: 1 / 3, y: 1 / 2 },
  center: { x: 1 / 2, y: 1 / 2 },
  centerRight: { x: 2 / 3, y: 1 / 2 },
  bottomLeft: { x: 1 / 3, y: 2 / 3 },
  bottomCenter: { x: 1 / 2, y: 2 / 3 },
  bottomRight: { x: 2 / 3, y: 2 / 3 },
} as const;

export type GridAnchor = keyof typeof GRID;

/** Convert a grid anchor to pixel coordinates */
export const gridPos = (
  width: number,
  height: number,
  anchor: GridAnchor,
) => ({
  x: GRID[anchor].x * width,
  y: GRID[anchor].y * height,
});

/** Place an element at a grid anchor with optional pixel offset */
export const gridStyle = (
  width: number,
  height: number,
  anchor: GridAnchor,
  offsetX: number = 0,
  offsetY: number = 0,
): React.CSSProperties => {
  const pos = gridPos(width, height, anchor);
  return {
    position: "absolute",
    left: pos.x + offsetX,
    top: pos.y + offsetY,
    transform: "translate(-50%, -50%)",
  };
};

/**
 * Development overlay showing rule-of-thirds grid and power points.
 * Set show={true} during development, remove for production renders.
 */
export const CompositionGrid: React.FC<{ show?: boolean }> = ({
  show = false,
}) => {
  const { width, height } = useVideoConfig();
  if (!show) return null;

  const x1 = width / 3;
  const x2 = (width * 2) / 3;
  const y1 = height / 3;
  const y2 = (height * 2) / 3;
  const lineProps = {
    stroke: "rgba(255,255,255,0.15)",
    strokeWidth: 1,
    strokeDasharray: "8 4",
  };

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, zIndex: 999, pointerEvents: "none" }}
    >
      <line x1={x1} y1={0} x2={x1} y2={height} {...lineProps} />
      <line x1={x2} y1={0} x2={x2} y2={height} {...lineProps} />
      <line x1={0} y1={y1} x2={width} y2={y1} {...lineProps} />
      <line x1={0} y1={y2} x2={width} y2={y2} {...lineProps} />
      {[x1, x2].flatMap((x) =>
        [y1, y2].map((y) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={4}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />
        )),
      )}
    </svg>
  );
};

/**
 * Progressive disclosure — reveals children with staggered spring entries.
 * Wraps each child in a div with spring-driven opacity and translateY.
 *
 * Accepts children via standard JSX or explicit array:
 *   <ProgressiveReveal startFrame={30}>
 *     <NodeA /> <NodeB /> <NodeC />
 *   </ProgressiveReveal>
 */
export const ProgressiveReveal: React.FC<{
  startFrame: number;
  stagger?: number;
  register?: MotionRegister;
  translateY?: number;
  children: React.ReactNode;
}> = ({
  startFrame,
  stagger = 6,
  register = "standard",
  translateY = 12,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = React.Children.toArray(children);

  return (
    <>
      {items.map((child, i) => {
        const childStart = startFrame + i * stagger;
        const p = springIn(frame, childStart, fps, register);
        return (
          <div
            key={i}
            style={{
              opacity: p,
              transform: `translateY(${(1 - p) * translateY}px)`,
            }}
          >
            {child}
          </div>
        );
      })}
    </>
  );
};
