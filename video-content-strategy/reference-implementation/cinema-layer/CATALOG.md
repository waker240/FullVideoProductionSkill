# Cinema Layer — Curated Atomic Catalog

> Source-of-truth catalog of the shared Cinema Layer atoms. Companion to the `video-content-strategy` skill's Cinema Layer Vocabularies section. Anchors the shared module at `my-video/src/shared/cinematics/`.
>
> **As of 2026-05-01:** the module holds **15 atoms + 1 provider + 4 hooks** = ~20 components across 8 implementation files. This is the curated keep set — every component listed here either is used in production today or is one short migration away from being used. Speculative inventory (an Era preset with 11 variants, 10 texture atoms, 4 reveal atoms, 2 temporal atoms, 5 signature presets, and 7 drivers) was deleted in the 2026-05-01 curation; see *Curation Log* below for the deletion record. `Lens` and `LensTransition` were lifted from project-local later that day after passing all four promote criteria (61+ usages across 11 production shot files).

---

## Doctrine

The Cinema Layer is **post-compositional**: it operates on the assembled Canvas + Artifact frame. It never replaces or repaints argument-bearing geometry. Its job is **signature** — the perceptual cues (depth, grain, breathing light, ink, lens character, paper texture, time as material) that signal "this was authored, not generated."

Five load-bearing principles:

1. **Cinema-Layer test.** Remove the atom: if the frame loses neither *information* nor *signature*, cut.
2. **Atoms are full-frame OR region-shaped.** A `RegionDim` is still an atom; the *region* is a parameter.
3. **Composition over generalization.** Channel-specific gestures live in the project's local `cinematics/`; only project-agnostic primitives live here.
4. **Channel-level discipline.** Some atoms are once-per-video by budget — the API allows free use; the discipline lives outside the API.
5. **Inventory is a liability, not an asset.** Every atom not used in production costs ongoing maintenance, navigation, and decision-overhead. The Channel Capacity Ceiling is real; build atoms only when production hand-rolls reveal them as load-bearing.

---

## Status legend

| Tag | Meaning |
|---|---|
| **SHIPPED** | Built, in production use or one migration away from production. File path cited inline. |
| **DEFERRED** | Strategy locked, not yet built; cost/value justified deferring. Build only if hand-rolled three or more times. |
| **PROJECT-LOCAL** | Lives in a project's local `cinematics/` (e.g. `my-video/src/projects/the-migration/cinematics/index.tsx`). May or may not be a future lift candidate; the burden is on the lift to demonstrate cross-channel utility. |
| **REMOVED** | Existed earlier; deleted because production never reached it. Preserved as a record of what was tried and why it didn't earn its keep. |

---

## Implementation Snapshot

Eight implementation files, ~20 components. Smoke-tested by `Cinematics-AtomsSmokeTest`.

| File | Purpose | Components |
|---|---|---|
| `tone.tsx` | Color/luma transforms | `Desaturate`, `BgDimGrade` |
| `mask.tsx` | Region-shaped effects | `RegionDim`, `RegionHold`, `Spotlight` + `Shape`, `HoldEffect` types |
| `optics.tsx` | Light / grain cues | `ChromaticAberration`, `Halation`, `Bloom`, `FilmGrain`, `LightFlash`, `LightLeak` |
| `lens.tsx` | Camera character | `Lens`, `LensTransition` + `LensVariant` type, `LENS_PERSONALITIES` catalog |
| `spatial.tsx` | Camera moves | `DollyPush` |
| `drivers.tsx` | Argument-aware hooks | `VideoArcProvider`, `useVideoProgress`, `useGrainHueDrift`, `useVignetteDrift`, `useNCDriver` |
| `utils.ts` | Internal helpers | `clamp`, `lerp`, `useStableId`, `parseHex` |
| `_testHelpers.tsx` | Smoke-test scaffolding | `BaseScene`, `Label`, `PALETTE`, `SHOT`, `usePulse` |

---

## Atoms — by axis

### Tone

| Atom | Status | Signature | What it does |
|---|---|---|---|
| `Desaturate` | SHIPPED `tone.tsx` | `{ amount: 0–1, children }` | The B&W effect. Animatable. |
| `BgDimGrade` | SHIPPED `tone.tsx` | `{ intensity, coolness, children }` | Substrate-dim treatment that ~10 production sites hand-rolled. |

### Mask

| Atom | Status | Signature | What it does |
|---|---|---|---|
| `RegionDim` | SHIPPED `mask.tsx` | `{ region: Shape, dimAmount, background }` | Everything outside the region dims. SVG mask via even-odd fill rule. |
| `RegionHold` | SHIPPED `mask.tsx` | `{ region: Shape, effect: HoldEffect, children }` | Single-mask architecture: bottom layer with effect, top layer clean masked to region. |
| `Spotlight` | SHIPPED `mask.tsx` | `{ x, y, radius, intensity, falloff, color }` | Bright radial hotspot via screen blend. |

### Optics / Light

| Atom | Status | Signature | What it does |
|---|---|---|---|
| `ChromaticAberration` | SHIPPED `optics.tsx` | `{ amount, angle, falloff, children }` | Per-channel R/G/B offset via feColorMatrix + feOffset + feBlend. |
| `Halation` | SHIPPED `optics.tsx` | `{ warmth, intensity, radius, children }` | Warm-tinted Gaussian blur + screen-blend over source. The film signature. |
| `Bloom` | SHIPPED `optics.tsx` | `{ threshold, intensity, radius, children }` | Threshold + blur + screen blend. The neutral cousin of Halation. |
| `FilmGrain` | SHIPPED `optics.tsx` | `{ intensity, hue, speed }` | Animated noise via feTurbulence. Ambient signature. |
| `LightFlash` | SHIPPED `optics.tsx` | `{ fireFrame, durationFrames, peakOpacity, color }` | Bright radial burst with half-sine envelope. |
| `LightLeak` | SHIPPED `optics.tsx` | `{ corner, intensity, color }` | Corner-anchored warm gradient with subtle drift. |

### Lens / camera character

| Atom | Status | Signature | What it does |
|---|---|---|---|
| `Lens` | SHIPPED `lens.tsx` | `{ variant?: LensVariant, children }` | Wraps children with the variant's perspective + scale. Five variants: `wide21`, `normal50` (default), `portrait85`, `fisheye8`, `anamorphic`. |
| `LensTransition` | SHIPPED `lens.tsx` | `{ from, to, startFrame, durationFrames?, children }` | Interpolates perspective + scale between two variants. Stack two transitions to chain `A → B → C`. |
| `LensVariant` | type export | — | Locked union of 5 variant names. Adding a 6th must be earned by hand-rolled production occurrences. |
| `LENS_PERSONALITIES` | const export | — | Variant → `{ perspective, scaleX, scaleY, edgeBarrel, fullBarrel }` lookup. Read at call-sites that need to interpolate manually. |

> **Note on `fisheye8`**: produces only the perspective-stretch fisheye effect, not real barrel distortion. The `fullBarrel` value in `LENS_PERSONALITIES` is currently unused by the renderer. Real `feDisplacementMap`-based barrel distortion stays DEFERRED — `fisheye8` is genuinely cinematic on perspective alone for charged AI-rupture beats, which is what the production usage exercises.

### Spatial

| Atom | Status | Signature | What it does |
|---|---|---|---|
| `DollyPush` | SHIPPED `spatial.tsx` | `{ startFrame, endFrame, fromScale, toScale, children }` | Slow scale interpolation — "the camera moves toward the subject" beat. |

### Drivers

| Driver | Status | What it returns |
|---|---|---|
| `VideoArcProvider` | SHIPPED `drivers.tsx` | Context provider; accepts direct `progress` OR `totalShots + currentShotIndex`. |
| `useVideoProgress` | SHIPPED `drivers.tsx` | `0–1` from context (returns 0 if no provider mounted). |
| `useGrainHueDrift(start, end)` | SHIPPED `drivers.tsx` | Hex color lerped over video progress. |
| `useVignetteDrift(start, end)` | SHIPPED `drivers.tsx` | Number lerped over video progress. |
| `useNCDriver(ncWindows, fadeFrames?)` | SHIPPED `drivers.tsx` | Multiplier: 1 outside windows, 0 inside, optional smooth fade. Used in `Act4V2/framing.tsx`. |

### Region shape vocabulary (shared across mask atoms)

```ts
export type Shape =
  | { type: 'rect'; x: number; y: number; w: number; h: number; cornerRadius?: number }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'polygon'; points: [number, number][] }
  | { type: 'path'; d: string };
```

---

## Curation Log — 2026-05-01

The module previously held **52 components across 13 implementation files** plus 6 smoke tests (~4,700 lines). Production usage was 1 hook in 1 file — a Hologram (high catalog EC, near-zero hardware backing). The 2026-05-01 curation deleted speculative inventory; what remains is the load-bearing core.

### Removed

| Component / file | REMOVED — reasoning |
|---|---|
| `Sepia`, `Posterize`, `Tint`, `Duotone` (tone.tsx) | Existed only to power the Era preset. None hand-rolled outside Era. |
| `Era` preset + 11 variants (era.tsx) | Symmetric inventory. Production needs 0-1 era at most; rebuild leaner inside `the-migration/cinematics/` if the channel ever wants an era register. |
| Texture atoms × 10 (texture.tsx) | Existed to power Era. With Era removed, all became orphaned. `PaperGrain`, `Halftone`, `Scanlines`, `WoodcutHatch`, `Engraving`, `Riso`, `VHSWobble`, `FilmDamage`, `JPEGArtifact`, `EmulsionDecay`. |
| Reveal atoms × 4 (reveal.tsx) | `WipeReveal`, `Iris`, `InkBleed`, `BrushReveal`. None hand-rolled. Existing `MorphShell` modes covered the production cases. |
| Temporal atoms × 2 (temporal.tsx) | `MotionTrails`, `FreezeFrame`. Once-per-video signature atoms with no production beat lined up. |
| Lens atoms × 2 (lens.tsx) | `TiltShift`, `LensFlare`. Speculative; LensFlare was borderline-cinematic but unjustified by need. |
| Signature presets × 5 (signatureMoves.tsx) | `DossierCeremony`, `EraTransition`, `GlitchRupture`, `ArchiveOpen`, `ThesisLand`. Channel-specific gestures masquerading as project-agnostic presets. Build channel-locked versions in the project when actually authored. |
| Drivers × 7 (drivers.tsx) | `useFrameProgress`, `useShotProgress`, `useFireEnvelope`, `useWindowDriver`, `useStopDrift`, `useNumberStopDrift`, `useHexStopDrift`. None hand-rolled. `useWindowDriver`'s logic was inlined into the kept `useNCDriver`. |
| Smoke tests × 5 | `TextureAtomsTest`, `EraPresetsTest`, `SignatureMovesTest`, `SignaturePresetsTest`, `DriversTest`. Tests for deleted atoms have no purpose. |

### What this curation taught the catalog

- The catalog can produce **inventory pressure** (each shipped axis pulls the others toward symmetry). This is a Distortion Allocation failure: the catalog's structural beauty is a soft-tier regularity; what scenes actually need is a hard-tier regularity. Optimal: build atoms when 3+ hand-rolled occurrences appear in production.
- "Strategy locked" is not the same as "implementation justified." The catalog can stage a long deferred list without paying the implementation cost.
- The Irreversibility Tax bites in reverse for unused code: every atom that stays "in case we need it" costs ongoing decision overhead. Delete now is cheaper than delete later.

### Lifted (post-curation)

| Component | From | Lifted | Reasoning |
|---|---|---|---|
| `Lens` | `the-migration/cinematics/index.tsx` | 2026-05-01 | 61+ usages across 11 production shot files; 5 variants are real cinematography names; project-agnostic. Project-local re-exports from shared so existing imports keep working. |
| `LensTransition` | `the-migration/cinematics/index.tsx` | 2026-05-01 | Pairs with `Lens`; same lift criteria. Easing rewired from project-local `easeInOut` to Remotion's `Easing.inOut(Easing.cubic)` so shared stays project-agnostic. |

---

## Decision framework — promote, defer, or reject

Apply before adding any new atom:

### Promote to shared when ALL FOUR are true

1. **Hand-rolled 3+ times** in real production code with minor numeric variation.
2. **Purpose-stable.** Same argument-job regardless of which shot calls it.
3. **Parameterizable in ≤4 numbers** without losing identity.
4. **Useful across channels**, not just one. Channel-specific compositions stay in project-local `cinematics/`.

### Defer when ANY is true

1. Specified by catalog symmetry, not by production need.
2. Once-per-video budget — build the specific gesture inline when the specific shot needs it.
3. The composition is the gesture's *identity*; turning it into a generic preset destroys the channel-specific timing that made it work.
4. Existing atoms cover the case via composition.

### Reject (and remove if accidentally promoted)

1. Atoms that exist only to power a composed preset.
2. Atoms whose maintenance cost exceeds their plausible production utility.
3. Drivers that wrap a single-line computation `useCurrentFrame()` already exposes.

---

## Depth — the next axis to build

The 2026-05-01 curation removed inventory but exposed the genuine cinematic gap: **the keep set is still primitives. None of it adds depth.** Flat 2D compositions read as diagrams, not cinema. This axis is intentionally NOT yet built — design proposed, implementation deferred until a production shot hand-rolls the first depth treatment.

### Proposed atoms

| Atom | Signature | What it does |
|---|---|---|
| `<ZLayer z={N}>` | `{ z: number, children }` | Wraps a subtree, tags it with a Z depth (typical range -5 to +5). Other depth atoms read this. |
| `<ParallaxStack cameraX={fn} cameraY={fn}>` | `{ cameraX?: number\|(frame)=>number, cameraY?: number\|(frame)=>number, children }` | Internal `<ZLayer>` children translate at rates proportional to their `z` and the virtual camera position. Slow camera pan reveals real depth. |
| `<DepthBlur focalZ={N} strength={S}>` | `{ focalZ: number, strength: number, children }` | Internal `<ZLayer>` children get blurred proportional to `|childZ - focalZ|`. Out-of-focus background; in-focus subject. |
| `<RackFocus from={Z} to={Z} startFrame={N} durationFrames={N}>` | `{ from, to, startFrame, durationFrames, children }` | Animates `focalZ` between two Z values over a window. The "focus shifts from background to foreground" thesis-landing move. |
| `<DollyZoom anchorZ={N} fov={fn}>` | `{ anchorZ, fov: (frame) => number, children }` | Hitchcock zoom: foreground anchored, background scales. Once-per-video charged register. |

### Why depth matters more than another tone atom

Pre-conscious bandwidth processing (the substrate-doctrine channel) reads **spatial cues with near-zero conscious cost**. A scene with real depth registers as "cinematic" before any other element lands. Currently every Migration shot is a flat composition with at most a 1.06 dolly push — reading as *infographic*, not *photographed*.

The 5 atoms above unlock four high-leverage gestures the channel currently can't do:

- **The slow truck-with-parallax establishing shot** (ZLayer + ParallaxStack) — virtual camera pans across the timeline, foreground polygons drift faster than background terrain. Reads as a real space the viewer is moving through.
- **The dossier-ceremony rack focus** (RackFocus) — when an artifact reveal fires, focus snaps from background (defocused canvas) to the artifact (sharp). Hand-tuned today via opacity hacks; the depth atom does it once correctly.
- **The compression-funnel depth burst** (DepthBlur during convergence beats) — as elements converge to a focal point, the rest of the frame defocuses. Eye is *forcibly* directed.
- **The thesis-land DollyZoom** (once per video) — the canonical "this isn't a technology story → it's a civilization story" rupture. Currently impossible to express; adds the channel's most charged spatial move.

### Build trigger (when to ship the depth axis)

Don't build until ONE of these is true:

1. A production shot is hand-rolling parallax via per-element `translateX` proportional to a hand-coded camera variable (= second occurrence: it's already wanted).
2. A shot needs the dossier-ceremony rack focus and the team is opacity-hacking around it.
3. The Migration channel's `DIRECTOR.md` LOOK contract upgrades from "flat with subtle dolly" to "depth-by-default" and the shots need the vocabulary.

The depth design is locked but the implementation is gated on this trigger. This is the same discipline that the curation log enforced retroactively: build atoms when production reveals them, not when the catalog wants them.

---

## How this catalog evolves

- **Status flips, not deletions.** When an atom ships, flip its status from `DEFERRED` to `SHIPPED` with the file path; do not delete the row. Same with `REMOVED` — the deletion log is the catalog's memory of what didn't earn its keep.
- **The decision framework gates promotions.** Every new atom passes all four "promote" criteria or it doesn't ship. Catalog symmetry is not a sufficient justification.
- **Discipline rules are sticky.** A discipline rule should only relax with a documented case study (same pattern as `video-content-strategy/field-notes.md`).
- **Channel-level signature moves reference this catalog.** When a channel locks a signature move (e.g. Migration's `BourdieuHexagonReveal`), the catalog provides the atom dependencies — but the gesture's timing and binding stay in the project's `DIRECTOR.md` and project-local `cinematics/`.

When validated patterns from this catalog stabilize, backport them into `~/.cursor/skills/video-content-strategy/reference.md` § Cinema Layer Vocabularies. The skill stays the strategic doctrine; this file stays the implementation truth.
