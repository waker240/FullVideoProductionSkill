<!-- Public portability adaptation, 2026-09-26. -->

# Scene Build Contract — <PROJECT> (read in full before building any scene)

You are building ONE composition-owner file for a single-act HyperFrames video. Normally it owns one section; an admitted sequence/spine Spatial Canvas owner may span its one locked continuous host window beneath intervening cutaways. Follow this contract EXACTLY. Consistency across scenes is the whole game — every scene is one panel of the same instrument.

## Read first
- `DESIGN.md` — locked palette, semantic color, typography, motifs, toolbox.
- `SPATIAL_CANVAS.json` — conditional: required when this file owns an admitted Spatial Canvas route.
- `FAST_PASSAGES.json` — conditional: required when this file owns any phase of an admitted fast passage.
- `compositions/s0-<slug>.html` — the reference scene: chrome + canvas proxy + fonts.
- `scripts/boundaries.json` — per-paragraph GLOBAL timing (`startSec`/`endSec`).

## Structural contract (HyperFrames — violating = broken render)
1. Sub-composition: root wrapped in `<template>`, `<style>` + `<script>` INSIDE it. NO `<head>` styles.
2. Root: `<div id="root" data-composition-id="<COMP_ID>" data-width="1920" data-height="1080" data-duration="<DUR>">`.
3. Exactly ONE `gsap.timeline({ paused: true })` at `window.__timelines["<COMP_ID>"]`, built synchronously.
4. **Owner-local time**: normally timeline 0 = this section's audio onset, so subtract the section's GLOBAL start. For a sequence/spine Spatial Canvas owner, timeline 0 = its persistent host's GLOBAL start; subtract that one host start from every covered paragraph/section cue. Time every beat LOCAL to the owner—never reset the canvas clock at a section boundary.
5. Canvas/WebGL driven by a proxy tween: `tl.to(proxy,{t:DUR,duration:DUR,ease:"none",onUpdate:...},0)`; expose `window.__<prefix>render`; prime at end with `render(p0?p0.time():0)`.
6. Determinism: NO `Date.now()`, NO unseeded `Math.random()` (use mulberry32), NO runtime data fetches (CDN `<script>` tags are fine), NO `repeat:-1`, NEVER animate `display`/`visibility`.
7. Animate only transform / opacity / filter / color / SVG attrs.
8. **GSAP-vs-CSS transform trap**: element centered via CSS `transform: translateX(-50%)` + a GSAP `y`/`scale` tween = jump (GSAP overwrites the whole transform). Fix: drop the CSS transform, own centering in GSAP via `tl.set(el,{xPercent:-50},0)`. (`fromTo` is exempt.) Lint flags this as `gsap_css_transform_conflict` — it is an ERROR.
9. All ids unique + PREFIXED with the scene (`s3-*`). Every id referenced in JS must exist.
10. NO `<br>` in body/caption text (titles/landing lines MAY use `<br/>`).
11. Full-bleed fill on a `position:absolute; inset:0` CHILD (`#<prefix>-fill`), never the root bg.
12. Three.js only after the project's `DIRECTION.md` 3D-admission row is filled: depth is causal, hero assets/geometry are authored, and world/material/light/camera quality is coherent. Load the pinned runtime INSIDE the template after the timeline script.
13. Video plates: `<video>` with `data-hf-id` / framework-owned playback — set them as tracks in `index.html`, not free-running loops inside a scene (a raw looping `<video>` blocks headless checks). Inside a scene, prefer a poster still or a pre-built reel segment.
14. Spatial Canvas only: put `data-hf-spatial-canvas="<id>"` on the composition root whose width/height equal the manifest viewport; exactly one world marker `data-hf-spatial-world="<id>"`; exactly one `<id>:<object-id>` region/landmark/connector/portal marker per manifest object; finite authored coordinates/poses; one camera object + one transform writer; camera/world/view overlays on separate wrappers. Static world registration may use `left/top`; motion stays transform/opacity. No tween-time DOM measurement, event-driven “visited” state, incremental Canvas drawing, or independent region cameras.
15. A Spatial Canvas sequence stays one long-lived world composition beneath sibling cutaways. One builder owns the whole route; do not recreate the board per section. Never put inherited `data-layout-allow-overflow` on the world/root/viewport or semantic-text ancestors; isolate intentional overflow on the narrowest text-free decorative leaf. An inline excursion is a direct-root native `class="clip"` with exact manifest-local start/duration, a finite track, `data-hf-spatial-excursion`, and a view-space marker; animate an inner wrapper. Captions/HUD remain view-space; labels/connectors/revisions remain world-space.

## CREATIVE MANDATE — overdeliver; never a flashy PowerPoint
Choose the strongest representation you can finish beautifully: semantic SVG/canvas geometry → generated illustration/cutout → layered 2.5D → authored true 3D. A designed triangle/circle system is better than a crude literal creature or prop. Never use default cylinders, tubes, slabs, spheres, cones, or an empty WebGL void as recognizable hero models. If true 3D cannot sustain equal quality across hero, substrate, materials, lighting, and camera, step down immediately.

Reach for the full toolbox WHERE IT SERVES THE ARGUMENT: D3/SVG (real data-viz, morphs), GSAP (timeline, eases, staggers, SplitText/DrawSVG/MorphSVG/Physics2D), canvas 2D, layered generated plates, and admitted Three.js. Camera motion is earned by a reveal, force, or spatial proof—not mandatory wallpaper. Vary density, let beats breathe, then hit. Know your in/out seam types (DESIGN.md's signature seams, wired in index.html) and build the scene's first/last frame to read cold into them—don't assume a fade will cover a weak entrance or exit.

The visuals must **performatively ARGUE the story**: <one sentence — this film's thesis>. Recurring motifs: <from DESIGN.md>. Find the visual metaphor for your beat and let MOTION carry meaning. If your scene could be a static slide, redesign it. For `s0`, the first three seconds must perform the exact words spoken in those three seconds, with a visible state change and an outgoing velocity handoff—never a later thesis shown early.

## Visual law (from DESIGN.md — do not improvise color)
- <paste the locked hexes + their semantic meanings here>
- Numbers/ids/code/paths → mono, tabular-nums. Landing lines → serif. Captions/UI → sans.
- Fonts via `@font-face` inside `<style>` (copy the block from s0).

## Caption awareness (DO NOT duplicate the running captions)
A channel-permanent rail renders narration at the bottom (`bottom: <92>px`, full width). Keep scene elements above ~y=900 OR fade before bottom-heavy moments. Do NOT re-print narration sentences as scene text; the scene VISUALIZES/argues the line with short labels + at most one landing line per beat.

## Word-lock (fire on the syllable, not the sentence)
Load-bearing events (the number, the reveal, the color flip) fire at the word's time from `assets/words/narration.words.json` (global→local), leading the syllable by ~0.05–0.12s. Secondary motion stays finite, seek-safe, and meaningful; do not add idle breathing/orbits merely to avoid stillness. Target ~0.5–1.0 on-thesis conceptual events/sec in active passages, with deliberate sparse holds where the value turn needs them. A `DESIGN.md`-admitted fast passage may carry more micro-edits, but each follows its locked baseline/escalation/peak/release role, preserves the named eye-trace, and intensifies one comprehensible idea rather than inventing a concept per cut. Pre-bake raw-footage speed/time/stutter/reverse/datamosh effects into frozen clips; framework-owned media playback stays untouched.

## Chrome (follow DESIGN.md; copy from s0 only when the register uses it)
- top-left `.reg` → `REG · §<n> ／ <SHORT TAG>`
- `.frule` inset frame + 4 `.crook` crosshairs (register in 0.3–0.9s)
- bottom-left `.telem` mono LIVE readout (the scene's on-thesis number)
- bottom-right `.coord` mono status caps

Do not invent telemetry or retain HUD chrome in negative-cinema landings merely for density. Cohesion may come from the recurring mechanism/material instead.

## Validation (REQUIRED before "done")
From the project dir:
- `node scripts/check.cjs` → lint OK, validate "No console errors", inspect 0 errors.
- Spatial Canvas, after its host is assembled: `node scripts/check.cjs` includes the structural checker; also run `node scripts/snap.cjs --spatial` and inspect every visit/excursion/return/synthesis sample from the manifest.
- Fast passage, after its owners are assembled: `node scripts/check.cjs` includes the structural checker; also run `npm run fast:check`, then watch the full lead-in → release at final fps with final sound.
- `node scripts/snap.cjs <globalSec> …` → snapshot at least **establish / midpoint / resolve** using absolute/GLOBAL playhead seconds on index.html (`global = your scene's data-start + local offset`, e.g. `595 635 770`), READ the full-resolution PNGs, and fix weak/overlapping/flat beats. A strong hero frame does not excuse an empty opening or dead late hold. Never pass per-scene LOCAL seconds or snapshot the scene file in isolation—only at a global second is the mount wired with its assets loaded. (Judge flashes/shakes in motion.)
- Confirm every `<audio>` survived (`node scripts/check.cjs` verifies and shouts if not).
