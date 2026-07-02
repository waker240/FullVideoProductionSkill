import React from "react";
import { clamp } from "./utils";

/**
 * Tone / Grade atoms — the small set production actually uses.
 *
 * Two atoms: `Desaturate` for tonal removal, `BgDimGrade` for the substrate-
 * dim treatment ~10 sites in the Migration project hand-roll. Other tone
 * atoms (Sepia, Posterize, Tint, Duotone) were removed during the
 * 2026-05-01 curation — they existed only to power the Era preset, which
 * itself was removed for being symmetric inventory.
 */

// ─── Desaturate ────────────────────────────────────────────────────────────
//
// The B&W effect, parameterized.
//   amount = 0  → full color
//   amount = 1  → pure mono
// Animatable: drive `amount` from a `wf()` envelope to fade color in/out
// on a stressed syllable.

export const Desaturate: React.FC<{
  amount?: number;
  children: React.ReactNode;
}> = ({ amount = 1, children }) => {
  const a = clamp(amount);
  return (
    <div
      style={{
        filter: `saturate(${1 - a})`,
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
};

// ─── BgDimGrade ────────────────────────────────────────────────────────────
//
// The exact "subtle cool-shift desat dim" treatment that ~10 sites in the
// Migration project hand-roll for substrate / background-layer dimming.
//
// Replaces inline filters like:
//   filter: "hue-rotate(-8deg) saturate(0.70) brightness(0.72)"
//
// `intensity` 0 → identity, 1 → full dim. Default 0.7 matches the most
// common values observed in production shots.
//
// `coolness` flips the hue-shift direction:
//   +1 = shift toward cool (canonical, what existing shots use)
//    0 = no hue shift, pure desat-dim
//   -1 = shift toward warm (use for archive-register backgrounds)

export const BgDimGrade: React.FC<{
  intensity?: number;
  coolness?: number;
  children: React.ReactNode;
}> = ({ intensity = 0.7, coolness = 1, children }) => {
  const i = clamp(intensity);
  const c = clamp(coolness, -1, 1);
  const hueShift = -10 * i * c;
  const sat = 1 - 0.4 * i;
  const bright = 1 - 0.32 * i;
  return (
    <div
      style={{
        filter: `hue-rotate(${hueShift}deg) saturate(${sat}) brightness(${bright})`,
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
};
