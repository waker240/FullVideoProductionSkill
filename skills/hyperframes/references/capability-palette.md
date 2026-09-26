<!-- Public portability adaptation, 2026-09-26. -->

# Capability Palette — the whole browser is the camera department

HyperFrames renders HTML on one seekable timeline, so anything the web platform can draw deterministically is a legal shot. This is the menu to *think with* when shotlisting — pick the treatment that argues the beat, not the first one that compiles. Depth of implementation: `references/technique-library.md` (snippets) and `hyperframes-animation` (adapters/rules/blueprints).

## The one law: seek-determinism

A frame must render identically from a cold seek. Adapters that make any library legal:

- **Proxy tween** — `tl.to(proxy,{t:DUR,ease:"none",onUpdate:()=>render(proxy.t)},0)`; all canvas/WebGL/Lottie state is a pure function of `t` (+ tween-driven `S.*`).
- **Seeded PRNG** — mulberry32 per scene; never `Math.random()`/`Date.now()`.
- **Pre-bake** — anything iterative/stochastic (physics steps, force layouts, fluid sims) runs ONCE offline (node script or a build step) → keyframes/JSON → the timeline just plays it. Simulation at build time, playback at render time.
- **CDN pins** — `<script>` tags with exact versions are fine; **no runtime data fetches** — vendor data (topojson, csv, lottie json) into `assets/`.
- **Framework-owned media** — `<video>/<audio>` as tracks with `data-*`; never self-playing loops.

## Runtimes (pinned; load inside the scene template)

| Library | Pin | Reach for it when |
| --- | --- | --- |
| **GSAP** | `gsap@3.14.2` | Always — the one paused timeline per scene. |
| **GSAP plugins** (ALL free since 3.13) | same CDN, `/dist/<Plugin>.min.js` | **SplitText** per-char/word kinetic type · **DrawSVGPlugin** line-draw diagrams · **MorphSVGPlugin** shape morphs = match cuts ("this becomes that") · **MotionPathPlugin** path-following elements/camera · **Physics2DPlugin** deterministic ballistics (particles/debris as pure f(t) — seek-safe physics without a sim) · **ScrambleTextPlugin** decode/terminal reveals · **CustomEase/CustomWiggle/CustomBounce** signature motion. Register after loading; verify the CDN file loaded before leaning on it. |
| **Three.js** | `three@0.181.2` | Only after `hyperframes-animation/adapters/three.md`'s visual admission gate: depth is causal, hero assets are authored, the world/material/light/camera grammar is coherent, and the paused frame beats 2D/2.5D. Never use crude literal primitive models as a fidelity substitute. |
| **D3** | `d3@7` | Real data-viz from real numbers: scales/axes/shapes, count-ups, `d3-geo` maps, force layouts (**pre-run ticks seeded, then animate positions**), `d3-interpolate` for path/color tweens. |
| **topojson-client** + vendored atlas | `topojson-client@3` | Maps: vendor world/china topojson into `assets/geo/`; project with d3-geo; animate strokes/points/arcs. (Raster basemaps: `motion-graphics/categories/maps/bake-basemap.mjs`.) |
| **flubber** | `flubber@0.4.2` | Buttery organic path interpolation when MorphSVG's mapping fights you. |
| **rough.js** | `roughjs@4` | Hand-drawn/annotation register (deterministic with `seed` option) — sketchy circles, underlines, arrows over evidence. |
| **lottie-web** | `lottie-web@5.12.2` | Pre-made vector animation; drive with `anim.goToAndStop(f, true)` from the proxy — never autoplay. See `hyperframes-animation/adapters/lottie.md`. |
| **matter.js** (or any sim) | build-time only | Physics that Physics2D can't fake (stacking, collisions): pre-bake to keyframe JSON, play it back. |
| **Canvas 2D** | native | Seeded particle fields, word-cosmos, fractures, trails — the workhorse (technique-library §2/3/5). |
| **SVG filters** | native | feTurbulence+feDisplacementMap (heat/glitch/paper), feGaussianBlur glow, masks/clipPaths for reveals, filter morphs. Cheap post-fx that stays vector-crisp. |
| **CSS 3D** | native | `perspective` stages, card flips, room/parallax rigs, dolly illusions — lightest 3D. |

## Cinematic capabilities (treatment picker)

| The beat needs… | Treatments (cheap → charged) |
| --- | --- |
| **Presence/atmosphere** | seeded particle field · giant ghost glyph · generated substrate dimmed 10–50% · Three.js volumetric points |
| **A number that matters** | mono count-up + hollow recede (§7) · D3 axis growing under it · counting-punch on the syllable |
| **Evidence ("this is real")** | code-recreated document + scan sweep (§8) · Vox duotone cutout + marker type (§13) · real chart PNG dimmed + live D3 overlay tracing it · stock/own footage plate, graded |
| **Process/mechanism** | diegetic SVG mechanism that *tries, fails, transforms* (§9) · DrawSVG line-draw · animated flow with MotionPath |
| **Transformation ("X becomes Y")** | match cut / MorphSVG · word-cosmos condensation (§3) · palette recolor as the argument |
| **Rupture/turn** | seeded fracture + flash + shake (§5) · hard cut with SFX · dolly-zoom (once per film) |
| **Scale/depth** | earned camera inspection + parallax (§15) · layered fg/mid/bg plates · admitted Three.js pull-back when volume/topology is the proof |
| **Relationships need geography/revisitation** | **Spatial Canvas** — finite persistent world → addressable region → optional excursion/cutaway + consequential return/revision → synthesis pullback (`hyperframes-creative/references/spatial-canvas.md`); simple one-way tour → `spatial-pan-stations` |
| **Speed/energy** | admitted bounded arc in `FAST_PASSAGES.json`: baseline → escalation → peak → release (`hyperframes-creative/references/fast-paced-editing.md`) · montage reel · accelerating or velocity-matched cuts (§14) · kinetic type via SplitText |
| **The human voice landing** | serif landing line + air (slow TTS + trailing silence) · caption emphasis role doing the work — resist adding anything |
| **Sync with music** | precomputed bands (`hyperframes-creative/scripts/extract-audio-data.py`) or beatgrid (`music-to-video/scripts/analyze-beatgrid.py`) → drive S.* from the data, never live WebAudio |

## The cut — every seam is a choice, never the fallback

A project has N−1 scene-to-scene seams and the skeleton ships one fallback (`crossfade`) — that's a placeholder for an unnamed seam, not a design. Uniform crossfades are the single biggest reason a film with great scenes still reads as "a well-made PPT": the seams are where a viewer's eye actually tracks editing. Pick per seam from the skeleton's `SEAMS` library or the full catalog in `hyperframes-animation/transitions/` (~40 CSS/shader types), by what the cut should DO, not by what's already wired:

| The seam should… | Reach for |
| --- | --- |
| Feel like "this continues" | crossfade / blur-crossfade |
| Feel like "next point" | push-slide / squeeze |
| Be FELT — a break in the argument | hard cut (X≈0.08) |
| Be invisible — motion carries through the cut | velocity-matched cut (§14) |
| Assert "this IS that" | match cut / graphic match (§17) |
| Land a jolt or a stylized high-energy beat | roll / barrel-roll (§21) |
| Mark an anchor (cold open / thesis / close) | a charged `cinema-layer.md` transition — earned, not default |

Lock a seam grammar once at Phase 2: name the relationship and receiver for each cut, then repeat or vary treatment only when that relationship changes. Clean cuts may dominate; neither uniform effects nor transition variety is a quality proxy.

For a marked fast-paced passage, lock the complete baseline → escalation → peak → release arc in `FAST_PASSAGES.json` before choosing individual seams. The musical grid supports the cut; story, emotion, eye-trace, and intelligibility decide it. Full doctrine → `hyperframes-creative/references/fast-paced-editing.md`.

Spatial Canvas and fast-paced passages are **admissions, not quotas**. Record `PASS` when persistent geography or local acceleration would not clarify the argument; forcing either grammar flattens its value.

## The sound layer — discover, audition, freeze

Search the workspace's curated review catalogs with `npm run audio:discover -- --type bgm --query "<semantic job>"` or its `--type sfx` form. Treat every result as an unapproved candidate: inspect its source/license/hash, audition it against voice and picture, then explicitly resolve and freeze the selection through `/media-use`. Only the project-local frozen copy may enter `<audio>` tracks. A fast passage should escalate picture and sound together; a Spatial Canvas may use restrained region cues or bridge sounds to preserve object permanence, but neither earns wallpaper effects.

Direction doctrine for anchor beats (cold open / thesis / close): run the Effort Protocol and pick Cinema-Layer treatments — `hyperframes-creative/references/cinematic-direction.md` + `cinema-layer.md`. If a built piece feels like elegant slides: `visual-storytelling.md` (intensity curve, value-turn audit, cut on the idea).

## Asset classes (sourcing → `references/asset-foundry.md`)

**Generated** (ImageGen registers, verified-alpha cutouts, layered depth) · **Stock** (Pexels/Pixabay/Unsplash — keys in `.env`, provenance always) · **Own-render clips** (the growing `assets/clips` evidence library + montage reels) · **Captured** (site/App screenshots via headless Chrome) · **Data** (real filings/charts — verify numbers, label simplifications honestly) · **Fonts** (vendored woff2; sans/serif/mono semantic trio).

## Honest costs (pick with eyes open)

Three.js = determinism risk + review cost — earn it. WebGL shaders (GLSL via a tiny quad) are powerful but hard to review — prefer SVG filters until a beat demands more. Every CDN dependency is a render-time network trust — pin versions, and if the render env is offline, vendor the .min.js into `assets/js/`. The palette is a menu, not a quota: a film that uses four treatments superbly beats one that samples twelve.
