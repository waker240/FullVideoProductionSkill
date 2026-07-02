/**
 * Shared Cinema Layer — curated keep set (2026-05-01).
 *
 * 13 atoms + 1 provider + 4 hooks. Every component listed here either is
 * used in production today or is one short migration away from being used.
 * Speculative inventory was deleted in the 2026-05-01 curation; see
 * `CATALOG.md` for the deletion log and reasoning.
 *
 * Project-specific atoms (Migration's `BourdieuHexagonReveal`,
 * `GlitchTransition`, etc.) stay in their project's local `cinematics/`
 * folder. Shared lives here only when "useful across channels" passes.
 */

// ─── Tone / Grade ──────────────────────────────────────────────────────────
export { Desaturate, BgDimGrade } from "./tone";

// ─── Attention / Mask ──────────────────────────────────────────────────────
export type { Shape, HoldEffect } from "./mask";
export { RegionDim, RegionHold, Spotlight } from "./mask";

// ─── Optics / Lens / Light ─────────────────────────────────────────────────
export {
  ChromaticAberration,
  Halation,
  Bloom,
  FilmGrain,
  LightFlash,
  LightLeak,
} from "./optics";

// ─── Spatial / camera moves ────────────────────────────────────────────────
export { DollyPush } from "./spatial";

// ─── Lens / camera character ───────────────────────────────────────────────
export type { LensVariant } from "./lens";
export { Lens, LensTransition, LENS_PERSONALITIES } from "./lens";

// ─── Drivers (argument-aware hooks) ────────────────────────────────────────
export {
  VideoArcProvider,
  useVideoProgress,
  useGrainHueDrift,
  useVignetteDrift,
  useNCDriver,
} from "./drivers";

// ─── Utilities (for advanced callers + atom builders) ──────────────────────
export { clamp, lerp, useStableId, parseHex } from "./utils";
