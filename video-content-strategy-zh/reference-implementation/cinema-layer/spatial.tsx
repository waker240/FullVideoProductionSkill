import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * Spatial / camera-move atoms.
 *
 * Wrappers that apply scale / translate / perspective to children to
 * simulate camera movement. Distinct from the Lens axis (which models
 * lens-character) — Spatial is about how the *camera* moves through the
 * scene.
 *
 * Tier 4 will expand this with Truck, Pedestal, Crane, ParallaxStack,
 * Perspective3D, TiltOnBeat. Today: just DollyPush, lifted from project-
 * local cinematics where it had been operating one-off.
 */

// ─── DollyPush ─────────────────────────────────────────────────────────────
//
// Slow scale interpolation — the "camera moves toward the subject" beat.
// Default 1.00 → 1.06 over the configured frame range; conservative push
// because aggressive zooms read as music-video, not documentary.
//
// Use for argument-tightening across a single shot, or as part of the
// DossierCeremony / ThesisLand presets.

export const DollyPush: React.FC<{
  startFrame?: number;
  endFrame: number;
  fromScale?: number;
  toScale?: number;
  children: React.ReactNode;
}> = ({ startFrame = 0, endFrame, fromScale = 1.0, toScale = 1.06, children }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [startFrame, endFrame], [fromScale, toScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center",
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
      }}
    >
      {children}
    </div>
  );
};
