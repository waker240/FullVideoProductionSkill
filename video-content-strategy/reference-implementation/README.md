# Reference Implementation

Working Remotion code implementing the module map described in `video-motion-references` (Part 4: Implementation Modules) and the Three-Layer Architecture described in `video-content-strategy`. This is real, in-production code pulled from one project — treat it as a starting point to copy and adapt, not a package to `npm install`.

## `canvas-modules/`

The Canvas Layer: code/SVG primitives that carry the argument. Flat folder, imports only `react`, `remotion`, and siblings in this same folder.

| File | What it is |
|---|---|
| `theme.ts` | The semantic color system (`system` / `tension` / `insight` / background / text) + font stacks |
| `motion.ts` | Easing curves, spring presets (`SPRING`), and the animation-primitive functions: `rise`, `recede`, `fadeWindow`, `springIn`, `springOut`, `springValue`, `anticipate` |
| `staging.tsx` | `CompositionGrid` (dev-mode layout overlay), `ProgressiveReveal`, `stageFocus` / `stageScale` for subtract-to-emphasize |
| `LowPoly.tsx` | `GlowFilters` (SVG filter defs) + `terrainPoints` (angular terrain-silhouette generator for ambient spatial anchoring) |
| `Particles.tsx` | Ambient particle field (breathing nodes, the "frame is never dead" primitive) |
| `WordTiming.ts` | Proportional word-timing estimation for word-locked motion when exact timestamps aren't available |
| `ShotDuration.tsx` | `useShotDuration` / `useAudioOffset` context hooks — the ShotDuration + AudioOffset patterns for multi-shot compositions |
| `WorldCanvas.tsx` | The Continuous Canvas Camera — persists a shared visual object/camera across shots for the Continuous Canvas Thread pattern |
| `MorphBridge.tsx` | Morph-based entry/exit transitions between shots (the "transform, don't cut" primitive) |
| `SceneShell.tsx` | The unified scene wrapper — integrates terrain, particles, radial gradient, spring/interpolate fades, morph transitions, audio offset, and the dev composition grid into one component. This is what most scenes render inside of. |
| `PrimitiveSmokeTest.tsx`, `DossierLibraryTest.tsx`, `GateLibraryTest.tsx` | Worked examples / library-validation smoke tests exercising the primitives above in a 3-beat template (ceremony → callback → family/era montage) — read these to see the modules composed together |

## `cinema-layer/`

The Cinema Layer: post-compositional effects that operate on the *assembled* Canvas + Artifact frame. Flat folder, imports only `react` and siblings.

| File | What it is |
|---|---|
| `tone.tsx` | `Desaturate`, `BgDimGrade` — grade/tone atoms |
| `mask.tsx` | `RegionDim`, `RegionHold`, `Spotlight` — attention/mask atoms |
| `optics.tsx` | `ChromaticAberration`, `Halation`, `Bloom`, `FilmGrain`, `LightFlash`, `LightLeak` — lens/light atoms |
| `spatial.tsx` | `DollyPush` — camera-move atom |
| `lens.tsx` | `Lens`, `LensTransition`, `LENS_PERSONALITIES` — lens-character system |
| `drivers.tsx` | `VideoArcProvider` + argument-aware hooks (`useVideoProgress`, `useGrainHueDrift`, `useVignetteDrift`, `useNCDriver`) that let Cinema-Layer effects respond to where you are in the video's argument |
| `utils.ts` | `clamp`, `lerp`, `useStableId`, `parseHex` |
| `index.ts` | The curated public export surface — read this first |
| `SmokeTest.tsx`, `_testHelpers.tsx` | Validation harness for the atoms above |
| `CATALOG.md` | Deletion/curation log — what was tried and cut, and why |

## `scripts/cutout-bg.js`

Batch background-removal utility for Artifact-Layer raster generations. Two modes: `chroma` (default — pixel-exact chroma-key on a solid `#FF00FF` background, for AI-generated synthetic primitives) and `imgly` (AI matting for real photographs — per the skill's own discipline, do **not** use `imgly` mode on synthetic `gpt-image-2` output). Requires `sharp`.

```bash
node scripts/cutout-bg.js <inputDir> <outputDir> --mode=chroma
```

## `scripts/master_to_wav.sh`

Transparent audio mastering for narration WAVs — the step `../rules/act-setup-from-audio.mdc` calls at Phase 0g. Two-pass linear `loudnorm` (highpass 80Hz + transient limiter, no compression/denoise) targeting a broadcast loudness, exported as duration-preserving 48kHz/24-bit PCM WAV so it can replace an existing WAV without an extra lossy generation. Requires `ffmpeg`.

```bash
TARGET_I=-14 TARGET_TP=-1 TARGET_LRA=7 ./scripts/master_to_wav.sh input.wav output.wav
```

Always diff the input/output durations before swapping a mastered file in — `loudnorm` is duration-preserving in theory, but any narration pipeline built on top of this (like `act-setup-from-audio.mdc`'s) depends on the duration staying exact to the millisecond, since subtitle timing and composition length are both derived from it.
