<!-- Public portability adaptation, 2026-09-26. -->

# Cinematic Direction — the awe layer

> **This is the difference between a composition that is *correct* and one a viewer screen-records and sends to a friend.** `house-style.md` and `video-composition.md` stop you shipping web-page-looking output. This file is the layer above: how to *direct* a shot so it commands attention **and** transfers structure — the doctrine of the awe-inspiring, overwhelmingly-good video.

Adapted from a battle-tested directorial skill originally written for a frame-based renderer. HyperFrames removes that renderer's technical ceiling: everything below is expressed in plain **HTML / CSS / SVG / GSAP**, and advanced runtimes are available. That does not make authored subjects, coherent worlds, or good visual judgment cheap. See *The HyperFrames Unlock* below.

**Read this when** the piece is an anchor: a cold open, a thesis reveal, a hero product beat, an act open/close, a closing image, or any composition where "competent" is not the goal. Skip it for a one-line edit or a utility bridge.

**Prerequisites:** the `hyperframes-core` contract (single paused timeline, `data-duration` governs length, deterministic seek — no `Math.random`/`Date.now`, no `repeat:-1`). Everything here composes *on top* of that contract; none of it overrides it.

For a supplied reference or repeated user review, first resolve the active direction through [reference-led-direction.md](reference-led-direction.md). A narrated explanation may deliberately use simple guidance, a readable comparison or a still hold. These craft lenses do not require independent visual exposition, continuous movement, or a single representation throughout a film. For generated material with exact UI, use [generated-media-composition.md](generated-media-composition.md).

> **Companion lens:** this file argues from cognitive science. [`visual-storytelling.md`](./visual-storytelling.md) argues the same target from the traditional film-craft canon (Block, Murch, Williams/Disney, McCloud, Mamet, Katz, Mascelli, McKee) — visual-intensity curve, the Rule of Six + flinch test, timing-vs-spacing, the six panel transitions, shape-to-emotion, the value-turn audit. When a piece feels like "elegant slides" despite passing the checks here, read it.

---

## The Spine — six regularities (hold these; reconstruct the rest)

This file is deep. Hold *these six*. If a decision doesn't trace to one of them, it's probably decoration. Each is anchored to a cognitive-science regularity, not taste.

1. **Design = coherence transfer per unit of viewer energy.** Not "looking good." A video re-encodes a high-structure idea into a signal cheap enough for a depleting viewer to rebuild as durable structure. Every technique below either raises the structure transferred or lowers the energy it costs. (Empirical: short videos retain because brevity *forced* compression — Guo 2014, 6.9M sessions.)
2. **Assign useful jobs to voice and image.** Narration can carry the explanation while the image guides attention, holds a relationship or makes a contrast legible. Avoid competing streams of dense information. Captions and deliberately repeated key words can support access and comprehension; they are not a failure of visual authorship.
3. **Externalize state, or the viewer holds it.** Working memory is ~4±1 chunks. Every bookkeeping item the frame doesn't hold, the viewer must — stealing a slot from the thesis. The frame's job is to hold argument-state in pixels.
4. **Intentional figure-ground makes the foreground legible.** A subject in an accidental renderer void reads thin; a subject on a coherent substrate reads as chosen from a world. Deliberate negative cinema is also valid when the absence itself carries the claim.
5. **The receiver is a depleting engine — extend its runway.** Median engagement collapses past ~12 min (Guo). On long-form, design's quiet first job is making *re-entry cost* (seconds + WM slots to know "where are we") near zero.
6. **One Apex move per anchor shot.** Coherence with no attention = correct-but-ignored. Attention with no coherence = impressive-but-empty. Anchor shots hit both: one element at 120% that captures attention *and* transfers structure.

---

## The Content Quadrant — the diagnostic map

Map any shot / act / video by two **measurable** quantities, not vague "quality":

- **Narrative Gravity** — would a viewer stop scrolling, screenshot, send it on? (Rate of capturing attention bandwidth.)
- **Thermodynamic Coherence** — after watching, does the viewer's model actually update? (How much on screen is structured signal they can rebuild as a chunk.)

|  | High coherence | Low coherence |
|---|---|---|
| **High gravity** | **Apex** — commands attention AND transfers structure. The target. | **Hologram** — impressive, empty. *Over-polished slop lands here.* |
| **Low gravity** | **Silent Generator** — correct but ignored. *The lazy/competent default lands here.* | **Entropy Trap / slop** — dead on arrival. |

"Is this shot good?" becomes "**which quadrant, and what's the vector to Apex?**" Silent Generator needs gravity added (the 120% element); Hologram needs coherence added (cut the empty polish). The quadrant applies fractally — to a shot, an act, a whole video, a channel.

---

## The Effort Protocol (read first, every anchor shot)

> A library is passive — it answers questions you ask but doesn't make you ask hard ones. This section is the part that makes you ask. The rest of this file is rich, validated vocabulary; that richness is also its failure mode. Faced with a deep catalog, the path of least resistance is to grab the nearest pattern, drop it in, and call the shot done. That produces *competent* video — and competent is the ceiling of laziness.

Three measurable failure modes to catch yourself in:

- **Regression to the mean.** Ungoverned, generation drifts to the statistically-average move. The first idea that arrives is almost always the mean.
- **Confirmation-reading.** The lazy use of a catalog is to fetch the pattern that *confirms* the shot you already pictured. The right use is to let it *disturb* the shot you pictured.
- **Premature convergence.** The first workable composition is a floor, not a target. You can't select the best option if you generated only one.

### Two modes — declare one per shot (silence is not allowed)

| Mode | What it is | Legitimate for |
|---|---|---|
| **AWE** | Diverge → select → push past competent → self-critique. The shot is *designed*. | The DEFAULT for any anchor: cold open, thesis-land, act open/close, hero beat, closing image, any keystone shot. |
| **EASY** | Reach for the correct standard pattern, execute cleanly, move on. Honest and fast. | Transitional / utility / connective shots — a 2s bridge, a list reveal, a section breath. Shots whose job is to *not* draw attention. |

**The gate:** Give an anchor a deliberate choice between spectacle and clarity. AWE is useful for a signature reveal; EASY can be the right choice for a thesis or closing synthesis whose force comes from comprehension and restraint. Write the shot's purpose and why its treatment serves it. Do not interpret an easy-to-read composition as permission to neglect craft, or an anchor label as a requirement to add spectacle against the brief.

### AWE mode — the forcing function (in order, before writing any code)

1. **Diverge — three before one.** Generate three *genuinely different* visual approaches, not three intensities of one idea (e.g. a diegetic-stage treatment vs. a continuous-canvas-thread treatment vs. a negation-then-reveal treatment). One line each. If all three are variations on the same instinct, the instinct is the mean. *(Stuck generating only near-copies? Run the **Gaze → Dream → Create** ideation pipeline below — it's the engine that produces real divergence.)*
2. **Interrogate the obvious one.** Your first idea is idea #0 — the mean. State it and ask: what makes it the expected move, and what's the unexpected-but-right move? #0 may still win — but only by surviving, not by arriving first.
3. **Apply the Awe Test** (below) to each candidate; select the one with the most *earned* surprise that stays legible.
4. **Push the winner past competent — the 120/80 question:** which single element will be executed to 120% — the one detail a viewer would screen-record? Everything at 80% is competent and forgettable. Taste is uneven on purpose: one element at 120%, the rest in clean support.
5. **Critic Pass** before declaring done.

### The Awe Test (screens *wonder in*, where complementarity screens *filler out*)

Complementarity asks "does this advance the argument?" It does **not** ask "does this create wonder?" A shot can pass complementarity perfectly and still be inert. Awe is a different axis: **competent design = processing fluency** (recognized instantly → pretty, forgettable); **awe = optimal cognitive surprise** (the form violates expectation *just enough* to require a small schema-update, then resolves into "oh, *of course* it looks like that"). Awe is a managed prediction error — too little = wallpaper, too much = noise.

> **The Awe Test:** does this shot make the viewer's model update — visually — in a way they didn't see coming but immediately accept? Is there a single frame they'd pause on, screenshot, or rewind to? If the honest answer is "no, but it's correct" → competent, not awe. For an anchor, that's a fail.

Three reliable generators of *earned* surprise:
- **Abstract → unexpected concrete substrate** — the argument's structure rendered as a physical thing the viewer didn't expect (a 150-year arrangement as a *receipt*; compression as a *cascade*; a filter as an aperture the camera passes through).
- **Defamiliarize the familiar** — show the thing they think they understand from the angle that makes it strange, then resolve the strangeness into the thesis.
- **Withhold, then reveal** — negation-then-reveal, subtract-to-emphasize, strip-to-silence. The surprise is in the *timing of understanding*. Often the most awe-inducing frame is the emptiest one.

### The Critic Pass (before any shot is declared done)

Switch from maker to critic:
- **The mean check:** is this the first/safest thing I'd have made without this protocol? Did it actually win a divergence, or did I skip step 1?
- **The 5-second test:** if a viewer screen-recorded 5s and sent it to a friend, what one thing would they point at? If nothing — wallpaper.
- **The awe check:** where exactly is the pause-worthy frame?
- **The honesty check:** am I calling this done because it's *right*, or because it's *finished*?

### What this protocol is NOT

- Not a mandate to make every shot maximal. Restraint is often the awe move (the emptiest frame). AWE = *deliberate design*, not *more stuff*.
- Not a reason to slow utility shots. EASY mode exists so connective tissue stays fast. Spend the saved effort on anchors.
- Not a replacement for any other discipline. It sits on top — complementarity, substrate, externalization, density, layer-variance still apply. This governs *how hard you think per shot*.

### The Gaze → Dream → Create ideation pipeline (the divergence engine)

The Effort Protocol *demands* three genuinely different candidates (step 1) but doesn't say how to produce them without collapsing to three near-copies of the mean. This three-phase pipeline is that engine. It works by **separating observation from ideation from implementation** — the collapse happens when you do all three at once, because the first plausible implementation strangles the idea before it's explored. Run each phase as a distinct pass (a fresh reasoning turn, or literally a separate subagent for a hero shot), feeding each forward.

**Phase 1 — GAZE (observe before inventing).** Before generating anything, sit with the raw material — the script beat, the argument it must land, any reference or sketch. Describe, with feeling, not clinically: *what is this beat actually saying? What's its emotional register? What must the viewer feel/understand by the end of it? What's the argument's shape — a collapse, a reveal, a fork, an accumulation? What does this beat WANT to become — a diegetic stage, a data-cascade, a single word on black?* Gaze is the substrate the other two phases draw on; skipping it is why ideation regresses to the mean (you're ideating on a thin reading).

**Cold-open constraint:** Gaze only at what is actually spoken in the first three seconds. Write a cue-by-cue mapping from each clause to a visible action and state change, then design the outgoing velocity handoff. Do not visualize a later thesis early merely because it is easier or more spectacular; semantic mismatch spends the hook before the argument begins.

**Phase 2 — DREAM (ideate wild, then focus).** From the Gaze, let it run, then crystallize. Push for: *what KIND of shot is this — the vibe, the world it lives in? The visual identity — specific register, palette moment, texture. The feeling — what does the viewer feel in the first second? The magic moment — the one detail that makes them stop (the 120% element, named early)? 3–5 bold ideas that could elevate it past generic — an unexpected substrate, a defamiliarizing angle, a withhold-then-reveal, a signature camera move.* Dream is where the three divergent candidates are born — force them to sit in *different worlds*, not different intensities of one.

**Phase 3 — CREATE (implement the chosen vision faithfully).** Only now select (via the Awe Test) and build. Carry the Gaze reading and the Dream vision into the build so every choice — palette, motion, the 120% element, the Cinema-Layer treatment — serves the vision rather than drifting toward whatever's easiest to code. Then run the Critic Pass.

**Why phase-separation works (and the discipline):** doing all three at once lets the nearest implementable idea (the mean) win by default. Separating them protects the wild idea long enough to be evaluated on merit. For a channel-defining hero shot, run Gaze/Dream/Create as **three isolated subagents** (clean contexts) and let their independent readings converge or clash — clash is data. For an ordinary anchor, three honest passes in sequence is enough. **This pipeline is for anchors only** — utility shots stay in EASY mode; running a three-phase ideation on a 2-second bridge is its own waste.

> Note: this is a *reasoning* process (how you think toward a shot), distinct from the `gpt-image-2` *asset*-generation workflow in [`asset-generation.md`](./asset-generation.md) (how you produce a PNG once you know what you want). Gaze/Dream/Create decides the shot; asset-generation executes any raster it needs.

---

## The HyperFrames Unlock — you have no renderer ceiling

The doctrine below was forged on a frame-based React renderer whose motion, 3D, and library ecosystem were constrained. **HyperFrames removes that technical ceiling.** A composition is HTML/CSS/JS driven by one seekable, paused GSAP timeline, so the whole browser platform is available. Implementation access is cheaper; art direction is not. Abstraction remains a positive representation choice, not a symptom of missing runtime support.

| The doctrine assumed… | In HyperFrames you can actually… | Reach for |
|---|---|---|
| 3D is "seasoning, fake it with CSS perspective" | Run **real Three.js / WebGL** scenes when depth is causal and the authored hero + world pass the admission gate—seeked frame-perfect via `hf-seek` | `hyperframes-animation/adapters/three.md` |
| Charts must be hand-built in SVG (no D3/Chart.js) | Use **D3 / any dataviz lib** for the geometry, then animate it on the timeline | `hyperframes-animation` + a viz lib on the paused `tl` |
| Camera moves are CSS-transform approximations | Do CSS-3D **and** true WebGL camera dollies/cranes/parallax | [Three](../../hyperframes-animation/adapters/three.md), [GSAP](../../hyperframes-animation/adapters/gsap.md) |
| Post-fx = SVG filters only | SVG filters **plus** WebGL/GLSL post-processing on live DOM captured as texture | [HTML in Canvas](../../hyperframes-animation/adapters/html-in-canvas-patterns.md), [TypeGPU](../../hyperframes-animation/adapters/typegpu.md) |
| Every visual must be LLM-invented abstraction | Layer **real stock footage, website screenshots/highlights, video, audio** as first-class media | `hyperframes-media`, `/media-use`, [composition-patterns.md](composition-patterns.md) |
| Raster artifacts are static PNGs the camera observes | Same — plus **Lottie** (After Effects timelines), **Anime.js**, **WAAPI**, CSS keyframes, all seek-synced | `hyperframes-animation` adapters |
| Depth = a few dimmed SVG terrain layers | **gpt-image-2 foreground/mid/background PNGs parallaxed** with real perspective + WebGL | *Multi-layer depth* below + `three.md` |

**The strategic consequence:** the source skill's two hardest constraints (*Abstract Graphics Only*, *no chart libraries*) were **renderer limitations dressed as taste**. In HyperFrames they become **register choices**, not laws. Honest abstraction is still a *great* register — often the right one for concept explainers — but "cinematic photoreal composite," "real dataviz," "screen-capture tour," and "3D product hero" are all now on the table. Pick the register the *content* wants; don't inherit a ceiling that no longer exists.

**What does NOT change** (these are cognition laws, not renderer limits, so they survive the port intact): the Spine's six regularities, the complementarity test, the substrate/externalization/receiver-runway doctrines, density rhythm, layer variance, and the Effort Protocol. Bandwidth and working memory don't care what library drew the frame.

---

## Two Foundational Constraints (reframed for HyperFrames)

### Constraint 1 — Define the film's visual registers and their jobs

The source skill mandated *abstract graphics only* (no photoreal people/scenes) because its renderer + trust model demanded it. In HyperFrames, define the project's allowed registers and transitions; a directed mix can be consistent:

- **Honest-abstraction register** — code/SVG primitives + stylized `gpt-image-2` artifacts, no photoreal humans. Best for concept explainers, systems arguments, anything where trust must stay on the voice. Ages well (Lindy-compatible — never pretended to be real).
- **Photoreal / mixed-media register** — real stock footage, product shots, website captures, generated photoreal imagery. Best for product launches, site tours, documentary-feel pieces.
- **Composite register** — real media *layered with* abstract canvas primitives (a real screenshot with SVG callouts and diegetic arrows over it).

Keep semantic colors, evidence boundaries and material quality coherent across the chosen registers. A material macro can establish scale, a modern IDE explain the mechanism, a clay character show human stakes, and a relationship canvas synthesize them. An incoherent hero/prop/world mixture is a failure, not variety itself. When a recognizable person, animal, or object is needed, choose a representation the team can finish well: semantic 2D, an authored/generated cutout, layered 2.5D or an authored 3D model. A materialized triangle and circle can communicate more clearly than an unconvincing modeled hawk and dove.

### Constraint 2 — Complementary roles

Every visual and audio element should support comprehension, attention, material/world identity or retained state. Run the test:

> **With the narration playing, does the image help the viewer follow this thought? Muted, is the image's intended action or relationship legible and honest?** The image need not restate the full explanation independently when narration intentionally carries it.

Avoid a second dense block of running explanation that competes with the voice. Word-aligned captions, exact quotations, a requested large-type comparison and a short repeated key phrase can all be useful. Diagnose whether a weak visual lacks a clear job, withholds required context or overloads the viewer; do not automatically add objects or motion because the narration does more of the explaining.

---

## The Three-Lane Architecture: Canvas · Artifact · Cinema

Code-first does not mean code-only. These are three ownership lanes, not a layer quota. A frame uses the smallest subset that carries its argument and world:

```
┌─────────────────────────────────────────────────────┐
│ Cinema Layer  — post + atmo + 3D + transitions       │  signature & feel
├─────────────────────────────────────────────────────┤
│ Artifact Layer — gpt-image-2 PNGs, stock, screenshots│  era / texture / reality
├─────────────────────────────────────────────────────┤
│ Canvas Layer  — code/SVG/GSAP primitives + repaints  │  argument structure
└─────────────────────────────────────────────────────┘
```

The **Canvas** carries deterministic argument structure. The **Artifact** carries material, era, or real-world evidence. The **Cinema** carries only the camera/transition treatment the beat earns. Deliberate negative cinema may use almost nothing; authorship is visible in the decision, not the layer count.

### Canvas Layer (usually the argument carrier) — SVG + GSAP on the paused `tl`

The world the camera moves through. Code/SVG primitives that:
- **Repaint to track the argument** (a plane shifting `tension → insight` mid-shot via a color tween on `tl`).
- **Word-lock to narration** (an element fires on a specific syllable — tie the tween's position to the caption/word timing, see `hyperframes-creative/references/narration.md` + the beat map).
- **Form the continuous canvas thread** (one visual object evolving across the whole video).
- **Render only the visual primitives the claim needs** and animate argument-bearing typography that types out, dims, or recolors. Terrain, particles, and vignette are optional treatments, never filler.
- **Execute morph transitions** (a chart *becomes* a gauge *becomes* a map).

The canvas is parameterized, deterministic, seek-perfect, cheap to iterate. Non-negotiable: it stays code so the *argument* stays trustworthy.

### Artifact Layer (optional) — decompose only when independent control earns it

Discrete objects the camera observes: `gpt-image-2` PNGs, **real stock footage, website screenshots, product shots, video, audio**.

**The cost calculus for generated assets.** `gpt-image-2` (full workflow in [`asset-generation.md`](./asset-generation.md)) can supply high-fidelity material and illustration. Separate an element when it needs independent motion, occlusion, parallax, recoloring, or factual registration. Keep a coherent plate unified when splitting it would create decorative motion, visual seams, or registration risk.

Use raster/media when the element is: **era-locked** (a woodcut stays a woodcut, won't repaint to insight), **shape-grammar-heavy** (a faceted dossier that'd take hours in SVG), **composite-rich** (a faux dossier card: portrait + dates + citation pills + grain in one piece), a **particle/sprite atlas** (one PNG, many code-replicated instances), a **substrate/depth layer** (background/mid-ground that wants its own motion), or **real-world evidence** (a screenshot, a stock clip, a real product).

Pipeline (full detail in [`asset-generation.md`](./asset-generation.md)): prompt from the selected style and actual approved references → generate through the configured image tool → inspect material, dimensions and genuine alpha for cutouts → copy the selected original into the project and compose it. **Save exact prompts and provenance** beside the assets. For an approved editorial paper storyboard, read [`paper-theatre.md`](./paper-theatre.md) for clean plates, separate operators and physical layer choreography.

> **Preserve the generated cut edge.** Request genuine alpha with the configured image tool, inspect the actual channels and silhouette, and use a focused ImageGen extraction edit when needed. Follow `asset-generation.md` for an honestly labeled masked-RGB alternative; photographic matting and legacy chroma scripts are not the default synthetic-art route.

### The Cinematography Principle (load-bearing) — artifacts are not stickers

When an artifact needs active treatment, choose the smallest move that reveals its role:
1. **Camera motion** — slow scale push `1.00 → 1.06` over the beat, parallax, pan, slight rotation (GSAP on a wrapper div — see the two-transform rule in `motion-principles.md`).
2. **Mask reveal** — wipe-in / iris-in / particle-dissolve (animated `clip-path` on `tl`).
3. **Composition layering** — SVG canvas built around it (terrain below, arrow on top, label types in).
4. **Dissolve into the canvas** at the end of its beat.

A static PNG may hold evidence, material, or place while the surrounding mechanism, edit, or camera performs. Do not add one of the treatments above merely to satisfy a quota; register the artifact to the world and give the viewer a reason to inspect it.

### Cinema Layer (post-compositional) — see `cinema-layer.md`

The camera + lens observing the assembled Canvas + Artifact frame: transitions, post-fx (grain, chromatic aberration, halation, LUTs, vignette), 3D/spatial moves, atmospheric overlays, hand-drawn organics. **Post-compositional** — it operates on the assembled frame; it never repaints the layers beneath. Full vocabularies with HTML/CSS/SVG/GSAP/Three.js implementation hints live in [`cinema-layer.md`](./cinema-layer.md).

### Anti-patterns (refuse)

- Replacing Canvas primitives with PNGs. The 6 primitives + the continuous thread stay code.
- Photoreal people **in an abstraction-register project**. If a figure is needed, use designed semantic geometry, a strong silhouette, or a generated cutout that matches the register—never a crude low-poly literal substitute.
- Saturated palettes on generated artifacts (use the project's semantic palette + a forbidden-color clause in the prompt).
- Treating a painted checkerboard as transparency; use the current cutout inspection/edit path in `asset-generation.md`.
- Cinema-Layer effects applied to one layer instead of the composited frame.
- Wallpaper Cinema (same grain on every shot is decoration, not signature).
- Hand-drawn touches on Canvas-Layer primitives (Canvas stays deterministic).

---

## The Visual Vocabulary

### 6 Primitives — the alphabet

Every canvas visual composes from six elements. All scenes are sentences in this language; shape semantics compound across a series until viewers read institutional character from polygon count alone.

| Primitive | Visual | Meaning |
|---|---|---|
| **Node** | Low-poly polygon, semantically colored. Sides encode character: triangle=hierarchical, square=rigid, hexagon=stable, octagon=machine | Any actor: organism, person, company, algorithm, model |
| **Connection** | Line whose properties encode its nature: thick+glow=amplified, thin+dashed=suppressed, wavy=distorted, traveling dots=active flow | Relationship, data flow, dependency |
| **Boundary** | Dashed/solid angular shape. Dashed=soft limit, solid=hard ceiling, pulsing=under pressure, shattering=phase transition | Constraint, ceiling, system edge |
| **Field** | Subtle radial gradient zone | Influence, gravity, jurisdiction |
| **Flow** | Animated path with moving dots | Energy or information traveling |
| **Absence** | Ghost structures at 2–5% opacity, connections that snap short | What isn't there — missing coordination, invisible infrastructure |

### Semantic Color System

Three colors + background, used **structurally**, not decoratively. Color shifts ARE narrative beats — a node going system→tension IS the argument saying "this is under strain," read before the narration says it.

| Role | Hex | Purpose |
|---|---|---|
| **System** | `#4A7C9B` steel blue | Baseline, conventional view, current state |
| **Tension** | `#E8913A` amber | Problem, strain, prediction error, what's breaking |
| **Insight** | `#3EC9A7` cyan-green | Resolution, thesis, what fixes it |
| **Background** | `#0A0E14` near-black | Dark canvas — colors pop, premium feel |
| **Text** | `#E8E4DF` warm off-white | Primary text; dim to 45% for secondary |

This is one validated palette for the honest-abstraction register. A project with a `frame.md`/`design.md` uses **its** brand tokens instead — but keeps the *structural* discipline (one baseline, one tension, one resolution color; shifts as beats). Alternative semantic palettes live in `house-style.md`'s palette table. Pick one and commit across the series.

### Animation Principles (canvas-level)

- **Build, don't reveal.** Elements construct in sync with narration; never appear fully-formed.
- **Transform, don't cut.** Morph between concepts — the morph IS the insight.
- **Simulate, don't illustrate.** Let a system *run* (agents behaving, network evolving), not a static labelled diagram.
- **Subtract to emphasize.** At the key insight, strip the canvas. Simplest visual = highest-signal moment.
- **Mechanism life.** Something meaningful changes: a cause acts, evidence accumulates, a camera inspects, or a state turns. Do not make nodes breathe or connections pulse merely to avoid stillness; an intentionally static substrate may hold while the mechanism performs. (All motion attaches to the seekable `tl` — never bare `gsap.to()` — or it won't render; see `motion-principles.md`.)
- **Spatial argument.** Layout encodes logic — comparisons split the screen, syntheses merge elements. The arrangement IS the reasoning.

---

## The Substrate Doctrine (figure-ground discipline)

> **The more intentional the figure-ground relationship, the more pronounced the foreground.**

A foreground element in an accidental empty renderer reads thin, isolated, and weightless. The same element in a materially coherent world reads deliberate and authored. But a deliberate void can be the world: use negative cinema when absence, isolation, or compression is the argument, and make the active mechanism unmistakable.

**Operational tools:**

- **Spatial anchoring, when a world is needed.** Use only enough background geometry to ground the subject without competing: perhaps one terrain silhouette, horizon line, or structural scaffold. Do not add a layer because a count says the frame is under-dressed.
- **Ghost object bridging, when continuity is the claim.** A previous shot's key geometry may persist briefly into the next. A clean hard cut is equally valid when rupture, contradiction, or compression is the argument.
- **Continuous canvas thread.** One visual object evolves across an act or the whole video — never abandoned, always evolving through the argument.
- **Visual absence as argument.** Deliberately render what isn't there: ghost connections that dissolve, lines that snap short at 42%, structures at 2.5% opacity. The gap registers viscerally.
- **Line weight as encoding.** A connection's width/dash/glow/animation encodes the *nature* of the relationship, not just its existence. The line IS the definition.
- **Layered raster substrate (the HyperFrames depth unlock).** When the shot needs a material world, extend the substrate to the Artifact Layer: distant cityscapes, environmental textures, or atmospheric plates generated as separate PNGs behind the foreground. Give a layer its own motion envelope only when the difference encodes depth or state. See *Multi-layer depth* below.

When a frame feels "rigid," "thin," or "exhausting" despite passing every other check, audit the substrate *first*: is there pre-conscious richness behind the foreground, or is it floating in void?

### Multi-layer depth — parallax with generated + real assets (HyperFrames-native)

When the beat requires spatial proof, stack only the layers needed to establish near/mid/far relationships—some may be generated PNGs, real media, or SVG canvas—and move them only while a virtual camera actually inspects the world:

| Layer role | Source | Depth rate | Opacity |
|---|---|---|---|
| Far background | gpt-image-2 (dim, atmospheric) | 0.2–0.3× | 10–30% |
| Mid-ground | gpt-image-2 / stock | 0.5–0.7× | 40–70% |
| Foreground subject | ImageGen cutout (verified alpha) / SVG | 1.0× | 100% |
| Canvas overlay | SVG primitives + labels | camera-fixed | full |
| Atmosphere | grain / god-ray / vignette | drift | 5–20% |

Two ways to build it, both seek-safe:
- **CSS/GSAP parallax** — each layer is a wrapper div; tween each layer's `x` (or `scale`) at its depth rate on the paused `tl`. Cheapest; good for 2.5D.
- **Real 3D** — place layers as textured planes at different `z` in a Three.js scene, move the camera, seek via `hf-seek`. Use for genuine depth-of-field, dolly-zoom, orbit. See `hyperframes-animation/adapters/three.md`.

Discipline: parallax rate must encode depth *consistently* (farther = slower); a foreground that drifts slower than its background reads as broken. Keep it to the layer count the argument needs — depth is substrate, not spectacle.

---

## The Externalization Doctrine

> **The video is externalized cognition handed from creator to viewer.** Every element either holds state for the viewer's working memory — or asks the viewer to hold it themselves.

WM is ~4±1 chunks. Every concept the viewer must keep loaded to follow the next sentence consumes a slot that could hold the *thesis*. The frame's job is to move bookkeeping load from WM into pixels.

> **The diagnostic:** for every element, *what state does this hold that the viewer would otherwise hold in WM? If nothing — cut.*

Most of the vocabulary already externalizes: the **6 primitives** hold the ontology; **semantic color** holds argumentative role; the **continuous thread** holds "what is this about"; the **substrate** holds context; **word-locked motion** holds audio-visual binding; **ghost bridging** holds inter-shot continuity. Three extensions worth piloting:

1. **Argument-state externalization.** A viewer 7 min into a 12-min essay must hold "we established A, refuted B, are setting up C." A persistent low-opacity indicator (the argument's phase structure with the current phase active) externalizes that — in the dimmed periphery, never competing with foreground.
2. **Viewer-question externalization.** When about to address an emergent "but wait — what about X?", show the question on-frame for 1–2s *as the viewer's question* before answering. It flushes the viewer's spawned sub-process and raises resonance.
3. **Primitive-naming (compounding).** Name the 6 primitives, 3 semantic colors, and signature patterns on-screen at least once across the first ~5 episodes of a series. A pattern *named* transfers from screen into the viewer's own thinking; this is how a lens compounds across episodes.

Applies fractally: within-frame (substrate) → within-shot (layer variance) → across-shots (ghost bridging, continuous thread) → across-runtime (argument-coded subtitle) → across-acts (argument-state indicator) → across-videos (primitive-naming). When a frame feels "exhausting" or "academic" despite passing other checks, audit one tier up: *what state is the viewer holding that the frame should hold for them?*

---

## The Receiver-Runway Doctrine (the viewer is a depleting engine)

> The substrate doctrine governs the frame the viewer is looking at. This governs the fact that the viewer keeps looking *away* — and must cheaply come back.

The hard regularity (Guo 2014, 6.9M sessions): median engagement is ~100% under 6 min, ~50% at 9–12 min, **~20% past 12 min** — regardless of how good your act 4 is. A 15–60 min piece is not watched once; it's watched as dozens of micro-sessions stitched by re-entries.

> **Minimize re-entry cost.** For any moment past ~min 6, ask: *if the viewer's attention just snapped back, how many seconds and WM slots does it cost to know where we are?* The lower that cost, the more re-entries convert to continued watching.

Several existing tools are secretly *runway extenders* — deploy them for re-entry, not just aesthetics: the **argument-coded subtitle** (returning viewer reads tension/insight/system *color* in <1s), **most-recent-evidence corner anchor** (what's in play now), the **continuous thread** (what the video is about), the **stable diegetic stage** (no need to rebuild the scene's frame of reference), and **density valleys / section breaths** (scheduled runway resets where overloaded WM flushes).

Add: **segment like structure is load-bearing** (a 50-min video should feel like 6–9 clean ~5–8 min segments, each act boundary an engineered reset); **build one re-entry checkpoint per act** (a frame that, alone, tells a cold-returning viewer the act's current claim); **audit re-entry on the act's *worst* moment** (the mid-act, high-density point — if *that* can't cheaply re-seat a returning viewer, the act leaks there).

Discipline: runway extension is *not* dumbing down (the thesis stays hard; the on-ramp back stays cheap); don't pay runway cost on short-form (<6 min the viewer rarely leaves); a checkpoint is *ambient and free* (the continuous viewer never notices it) — if it interrupts, it's a recap, redesign it into the substrate.

---

## The Diegetic Stage Pattern

A high-impact alternative to "floating elements in dark void." Instead of abstract black space, **establish a physical scene** the viewer inhabits — and let every element behave as a real object in it.

| Floating Abstract (default) | Diegetic Stage |
|---|---|
| Particles/glyphs in dark void | A specific environment (desk, drafting table, vault, control room) |
| Elements "appear" / "transition" | Elements "land", "click on", "engrave", "stamp", "lift off" |
| Generic composition repeated | Same world evolving — stable spatial anchor |
| Exhausting after ~30s | Cinematic, memorable |

Use for anchor moments (cold open, thesis reveal, case-study intro, closing image); use Floating Abstract for fast argument beats. A typical video alternates: 5–12s Diegetic to anchor → 30–60s fast Floating Abstract → 5–12s Diegetic to land.

**The wake / land / stamp / lift verb sequence:** WAKE (establish the stage — lamp clicks on, spotlight pivots) → LAND (protagonist artifact arrives via physical verb — slid across the desk, stamped) → STAMP (accessories accumulate as discrete objects — dates as typewriter strikes, citations as marginalia) → LIFT (the punchline is a physical gesture by the artifact — it lifts off the desk, a page tears free). Cinema-Layer effects accompany, but the *artifact* does the gesture.

**Composition-aware asset generation:** when generating the stage as one `gpt-image-2` asset, explicitly reserve an empty zone for the artifact composited later — tell the model *"the entire CENTER ~40% of the frame is INTENTIONALLY EMPTY, a clean surface where a separate card will be composited."*

**Discipline:** anchor argument text to the artifact, not the global frame; object permanence across shots (the artifact persists, may translate to a corner-callback, never teleports); the stage matches the argument register (academic → researcher's desk; investigative → detective's pinboard) — the stage pre-loads the register before any text appears.

---

## Density Rhythm

Just as narration alternates fast exposition and slow insight beats, visuals must alternate **dense** and **sparse** frames. Uniform density is a monotone — the viewer's engine settles and engagement bleeds. Complexity *contrast* makes both dense and sparse shots hit harder: a rich layered frame followed by a single word on black creates perceptual compression that mirrors the argument.

**Density arc for a typical act:** `seed → rich world → rupture → DENSE FLOW → PEAK (thesis) → swarm → collapse → silence`.

Rules validated in production:
- Plot a **density curve** against the argument; do not hold one constant information load.
- Let peaks coincide with proof or rupture and valleys buy comprehension or emphasis. The contrast is the impact; neither state has an element quota.
- A section breath may be darkness, a held artifact, a sparse mechanism, or a clean cut. Choose the reset the story earns.
- End the act on the state and velocity the next act needs, not on a prescribed density.

**Semantic color arc, when useful.** A substrate, field, or recurring object may change role-bound color across an act. Ambient particles are never required; use the simplest persistent carrier the viewer can actually track.

---

## Critical Scene Review — diagnostics (in order)

Each catches a different failure mode. Run them as the review pass.

### Visual rhythm
Word-lock load-bearing events rather than mechanically firing at sentence boundaries. If a shot feels dead, count its meaningful state changes and inspect whether the mechanism has stopped performing; do not chase a universal events-per-second number. A sustained causal transformation or intentional hold may carry several seconds.

### Three categories of scene failure

| Category | Symptom | Fix |
|---|---|---|
| **Diagram** | Final state without journey. Parsed in 2s, then nothing. | Add an internal arc — something tries/fails, builds to threshold, evolves. |
| **Hologram** | Impressive but neither guides the spoken thought nor establishes a useful world/state. | Give it a clear complementary job or replace it with a simpler meaningful visual. |
| **Slideshow** | Each shot is an isolated audio+visual unit. Hard cuts, mechanical rhythm. | Decouple audio and visual — J-cuts, L-cuts, mid-sentence cuts. |

### Representation and world-coherence check
Judge the paused frame before rewarding its motion. Do the subject, substrate, materials, lighting, and camera belong to one authored world? Default primitives posing as recognizable subjects, detailed plates paired with crude WebGL props, or an empty dark void around a hero are automatic redesigns. Use true 3D only when depth itself proves the mechanism and the shot passes the admission gate in `hyperframes-animation/adapters/three.md`; otherwise choose semantic 2D, generated illustration, or 2.5D.

### Negation-then-reveal
The most reliable visual prediction-error engine: show the wrong answer, dismiss it (strikethrough/dim/collapse — but keep it *faintly visible*), reveal the correct answer with more ceremony. The contrast IS the argument.

### Cut-timing (transitions fire at argument beats, not sentence boundaries)
- Next sentence gives an *example* of the current concept → **mid-sentence cut**
- Next sentence *extends* the idea → **L-cut** (new visual foreshadows under old narration)
- Next sentence *reframes/contradicts* → **hard cut** (the break IS the prediction error)
- Next sentence *shifts time* → **J-cut** (voice carries before the eye catches up)
- Argument *changes topic* → **section breath** (brief darkness)

These govern cut *timing*. The Transition Vocabulary in `cinema-layer.md` governs cut *treatment*. They compose ("L-cut + ink-bleed", "hard cut + glitch").

### Layer variance
When a frame feels rigid despite passing every other check, audit: **how many independent motion rates does it contain, and what does each *encode*?** When two elements move at the same rate/direction/curve/lifecycle they read as one thing; the moment they differ along any axis, the *difference* becomes a semantic signal.
- **One rate or a static hold** can serve a clear comparison, exact reading or narration-led explanation. Decouple only when distinct motion would convey a needed relationship.
- **Several rates with distinct semantic roles** can make depth, simultaneous processes or an intervention legible.
- **Many competing rates** warrant an overload check; reduce movement if the eye cannot identify the active subject.
- **Rates nameable but roles not** → decoupled-but-undirected; fix the *why* first.

Axes available for the argument: rate, direction, scale-change, motion-curve, phase, frequency, lifecycle, reference-frame, perspective and color-register. Choose the few that make the relationship legible; there is no motion-layer quota.

### Awe diagnostic (anchor shots only)
The other diagnostics catch *defects*; this catches *mere competence*. **Name the single frame a viewer would screenshot, rewind to, or send a friend.** No pause-frame → fluency trap, re-diverge. Everything polished but flat → no 120% element, pick one. A striking element that doesn't serve the argument → noise/gimmick, re-anchor it or cut. Skip this for utility shots by design.

### Complementarity (final pass, extended)
For every element: *if I remove this, does the frame lose **information**, **signature**, or **state held for the viewer**? If none, cut.* Three valid reasons to earn a slot — advances the argument (complementarity), carries the channel's feel (signature), or holds bookkeeping (externalization). Decoration fails all three.

---

## What We Don't Do (negative space)

- No photoreal people **in an abstraction-register project** (register is a project decision; mixing registers mid-breath without an argument reason is the failure).
- No decoration — every element passes the complementarity test (information, signature, OR state-offload).
- No generic particle effects as primary content (ambient particles are 3–10% background texture, never the visual).
- No consensus aesthetics (purple-to-blue gradients, neon glow, "cinematic" hand-waving) unless the content genuinely calls for it.
- Mechanism diagrams need an understandable change; reference frames, comparisons and synthesis can deliberately hold while narration develops the thought.
- No PNG primitives where SVG/code is correct (Canvas Layer stays code).
- No disconnected static PNG stickers used as decoration. A still artifact is valid evidence when the mechanism, camera, or edit performs around it.
- Cutout integrity follows `asset-generation.md`: verify alpha/edges, preserve originals, and label any masked-RGB alternative honestly.
- No wallpaper Cinema-Layer effects (same grain on every shot is decoration).
- No hand-drawn touches on Canvas-Layer primitives (Canvas stays deterministic).
- No 3D for the sake of 3D. Depth must prove something, and hero geometry, world, materials, light, and camera must clear the same quality bar; otherwise step down to 2D/2.5D.
- No charged transition without an argument beat.
- Avoid competing blocks of running explanation; preserve requested captions, exact quotations and purposeful short repetition.

---

## Production Workflow (where this sits)

1. Establish thesis / persona / density upstream (script). 2. Plan the **density arc + semantic color arc, if any** per act. 3. Define the allowed visual registers and each one's job from the active reference/brief. 4. Per shot, decide the smallest **Canvas / Artifact / Cinema** subset (primitives + repainting + word-locked motion stay code; material-rich / real-world elements may be raster or media). 5. **Declare AWE or EASY** per shot and run the Effort Protocol where a new anchor direction needs divergence. 6. Pick only the cinematic treatment the beat earns from [`cinema-layer.md`](./cinema-layer.md). 7. Build with SVG + GSAP on the paused `tl` (+ Three.js / Lottie / etc. only as the shot earns); generate raster per [`asset-generation.md`](./asset-generation.md) **and save every prompt**. 8. Run this file's diagnostics plus the rendered trajectory gate at the final narration clock.

## See also

- [`visual-storytelling.md`](./visual-storytelling.md) — the film-craft companion lens (visual-intensity curve, Rule of Six + flinch test, timing-vs-spacing, six panel transitions, shape-to-emotion, value-turn audit). Read when a piece feels like "elegant slides."
- [`cinema-layer.md`](./cinema-layer.md) — the Cinema Layer vocabularies (transitions, atmosphere, 3D, lens, hand-drawn, diegetic UI, recursive, video-arc drift) with HyperFrames implementation hints.
- `video-composition.md` · `house-style.md` — the video-medium floor (density, scale, color presence) this layer builds on.
- `motion-principles.md` — GSAP quality rules + the load-bearing seek-safety rules (two-transform trap, `fromTo` over `from`, ambient-on-`tl`).
- `hyperframes-animation` — atomic rules, blueprints, transitions, and the 7 runtime adapters (GSAP / Three.js / Lottie / Anime.js / CSS / WAAPI / TypeGPU).
- `hyperframes-media` · `/media-use` — real footage, stock, screenshots, TTS, BGM.
- [`asset-generation.md`](./asset-generation.md) — the self-contained gpt-image-2 workflow for HyperFrames (built-in tool call, prompt structure, alpha, sizing, pitfalls) + the **save-every-prompt** prime directive.
