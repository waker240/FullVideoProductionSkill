import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

export type CameraKeyframe = {
  frame: number;
  x: number;
  y: number;
  scale: number;
};

/**
 * Interpolates between camera keyframes using eased transitions.
 * Returns the camera state at a given frame.
 */
const interpolateCamera = (
  frame: number,
  keyframes: CameraKeyframe[],
): { x: number; y: number; scale: number } => {
  if (keyframes.length === 0) return { x: 0, y: 0, scale: 1 };
  if (keyframes.length === 1) return keyframes[0];

  if (frame <= keyframes[0].frame) return keyframes[0];
  if (frame >= keyframes[keyframes.length - 1].frame) {
    return keyframes[keyframes.length - 1];
  }

  let before = keyframes[0];
  let after = keyframes[1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (frame >= keyframes[i].frame && frame < keyframes[i + 1].frame) {
      before = keyframes[i];
      after = keyframes[i + 1];
      break;
    }
  }

  const p = interpolate(
    frame,
    [before.frame, after.frame],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  return {
    x: before.x + (after.x - before.x) * p,
    y: before.y + (after.y - before.y) * p,
    scale: before.scale + (after.scale - before.scale) * p,
  };
};

/**
 * WorldCanvas — continuous canvas with camera movement.
 *
 * Treats the scene as one large world space. Children are positioned
 * in world coordinates. The camera pans, zooms, and tracks between
 * keyframe positions, creating Kurzgesagt-style continuous flow.
 *
 * Camera (x, y) = the world-space point centered on screen.
 * Camera scale = zoom level (1 = normal, >1 = zoomed in).
 *
 * Usage:
 *   <WorldCanvas keyframes={[
 *     { frame: 0,   x: 0,    y: 0,   scale: 1 },
 *     { frame: 90,  x: 400,  y: 0,   scale: 1 },   // pan right
 *     { frame: 180, x: 400,  y: 300, scale: 1.5 },  // pan down + zoom
 *   ]}>
 *     <WorldObject x={0} y={0}>...scene A content...</WorldObject>
 *     <WorldObject x={400} y={0}>...scene B content...</WorldObject>
 *     <WorldObject x={400} y={300}>...scene C content...</WorldObject>
 *   </WorldCanvas>
 */
export const WorldCanvas: React.FC<{
  keyframes: CameraKeyframe[];
  children: React.ReactNode;
}> = ({ keyframes, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = interpolateCamera(frame, keyframes);

  const tx = width / 2 - cam.x * cam.scale;
  const ty = height / 2 - cam.y * cam.scale;

  return (
    <div
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${cam.scale})`,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * WorldObject — positions content at a fixed point in world space.
 * Use inside WorldCanvas. The camera movement reveals/hides these objects.
 */
export const WorldObject: React.FC<{
  x: number;
  y: number;
  width?: number;
  height?: number;
  children: React.ReactNode;
}> = ({ x, y, width, height, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: width ?? "auto",
      height: height ?? "auto",
    }}
  >
    {children}
  </div>
);

/**
 * Utility: generates camera keyframes from a shot timeline.
 * Each shot gets a world position; the camera pans between them.
 *
 * Usage with existing Act architecture:
 *   const keyframes = shotsToKeyframes(timeline, (shot) => ({
 *     x: shot.index * 1920,
 *     y: 0,
 *     scale: 1,
 *   }));
 */
export const shotsToKeyframes = <T extends { visualStart: number }>(
  shots: T[],
  positionFn: (shot: T, index: number) => { x: number; y: number; scale: number },
): CameraKeyframe[] =>
  shots.map((shot, i) => ({
    frame: shot.visualStart,
    ...positionFn(shot, i),
  }));
