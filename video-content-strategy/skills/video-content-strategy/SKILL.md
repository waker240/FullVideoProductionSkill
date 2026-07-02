---
name: video-content-strategy
description: Visual-translation layer for Remotion-based animated explainer videos: given a script with an established thesis, persona, and density rhythm, decides visual design, composition, cinematic register, and figure-ground discipline. Covers the Canvas/Artifact/Cinema three-layer architecture, the 6 visual primitives, the semantic color system, the complementarity test, the substrate and externalization doctrines, density rhythm, the Effort Protocol for anchor shots, and named patterns (Multi-Asset Scene Composition, Argument-Coded Subtitle, Style Register Library) — full catalog in reference.md, case studies in field-notes.md. Use when composing visuals for a script, deciding code vs. raster vs. Cinema-Layer treatment for an asset, planning a multi-layer raster scene, picking a per-shot cinematic register, designing a cold open or anchor moment, designing a long-form subtitle treatment, diagnosing why a frame feels rigid, thin, or exhausting, or reviewing scenes for cinematic quality.
---

# Video Content Strategy

The **visual translation layer**. Given a script with thesis, persona, density rhythm, and citation discipline already established upstream by `educational-video-scripting`, this skill answers a single question: *what visual decisions follow?*

> Run `educational-video-scripting` first. Don't duplicate strategy work here.

---

## The Spine (six regularities — everything else is a corollary)

This skill is large. Hold *these six*; reconstruct the rest from them. If a decision doesn't trace back to one of these, it's probably decoration. (Derived from an EIF analysis of educational video — see `field-notes.md` 2026-06-08; each line is anchored to a hard cognitive-science regularity, not taste.)

1. **Design = coherence transfer per unit of viewer energy.** Not "looking good." A video is a high-structure idea in the creator's mind, re-encoded into a signal cheap enough for a depleting receiver to rebuild as durable structure. Every technique below either raises the structure transferred or lowers the energy it costs the viewer. (EIF: EC/KC coherence. Empirical: short videos retain because brevity *forced* compression — Guo 2014, 6.9M sessions.)
2. **Two channels, not one — use both at full, non-redundant bandwidth.** Visual and verbal are separate pipes in the viewer's head (dual-channel, Paivio/Baddeley). Non-redundant pipes ≈ 2× bandwidth; duplicated pipes (on-screen text that just repeats narration) ≈ ½ bandwidth. This is the *mechanism* under the complementarity test. (Mayer: dual-channel, redundancy, modality.)
3. **Externalize state, or the viewer holds it.** Working memory is ~4±1 chunks. Every bookkeeping item the frame doesn't hold, the viewer must — stealing a slot from the thesis. The frame's job is to hold argument-state in pixels. (EIF: Bandwidth Externalization; the compounding version is Chunk Crystallization — name your primitives so they transfer.)
4. **Rich-but-dimmed substrate makes the foreground legible.** A subject in void reads thin; the same subject on structured-but-dimmed context reads as *chosen from richness*. Foreground legibility is bought with background structure. (EIF: Perceptual Coherence; the substrate doctrine.)
5. **The receiver is a depleting engine — extend its runway.** Median engagement collapses to ~20% past 12 min (Guo); your channel ships 15-60 min. The viewer constantly disengages and re-boards. Design's quiet first job on long-form is making *re-entry cost* (seconds + WM slots to know "where are we in the argument") near zero. (EIF: Energy Runway; Channel Capacity Ceiling. See *The Receiver-Runway Doctrine*.)
6. **One Apex move per anchor shot.** Coherence with no narrative gravity is correct-but-ignored (Silent Generator); gravity with no coherence is impressive-but-empty (Hologram). Anchor shots must hit both — one element at 120% that captures attention *and* transfers structure. (EIF: Apex Node; the Effort Protocol operationalizes the move.)

Everything in this file and `reference.md` is a corollary of these six. When the catalog feels overwhelming, return here.

---

## Where things live

| File | Tier | What it holds | When to load |
|---|---|---|---|
| `SKILL.md` (this file) | Surface | The Spine (6 load-bearing regularities), the Effort Protocol (forcing function against lazy default), the substrate / externalization / receiver-runway doctrines, the visual vocabulary, scene-review diagnostics | Every invocation |
| `reference.md` | Mid | Named pattern catalog, Cinema Layer vocabularies, channel-level contracts (Director's Signature, Negative Cinema), worked examples | When composing a specific shot or making a register choice |
| `field-notes.md` | Deep | Project-specific validations, anchor coordinates, anti-pattern post-mortems, dated case studies | When debugging a decision against precedent |
| `audit-loops.md` | Meta | The self-improvement machinery — fresh-eyes audit subagents (output + skill), the lens roster, gated write-back | When running an audit of a built video OR of the skill itself |
| `audit-log.md` | Meta | Staging ledger — audit proposals with confidence levels, recurrence tallies, the self-edit trail | When proposing/promoting a self-edit |
| `thumbnail-extraction.md` | — | YouTube thumbnail composition reference | When designing thumbnails |
| `ai-generation-archive.md` | — | Archived prompt/pipeline content | Rarely |

## Companion skills

- `educational-video-scripting` — the *thinking layer* (topic, persona, script architecture, density, citation, cultural adaptation). **Run before this skill.**
- `video-motion-references` — the *implementation layer* (motion patterns, Remotion templates, shot-config + timeline architecture, SVG filters, utility functions). **Reach for it during build.**

---

## Core Thesis

In a world where AI collapsed video production cost to near zero, the only scarce resource is **original thinking**. Production energy is commodity; cognitive energy is the moat.

Two corollaries set the tone for everything below:

1. **Win by signal density, not production volume.** Every second earns attention rather than borrowing it. Viewers subscribe to *minds*, not topics — a consistent analytical lens applied across domains.
2. **Ambient richness is load-bearing.** A foreground subject in pure void reads as thin and ungrounded; the same subject against a richly-structured-but-dimmed substrate reads as *chosen from richness*. The substrate isn't the message — the substrate is what makes the message legible *as* a message. This principle (the **substrate doctrine**) governs everything from per-frame composition to channel-level design discipline. See *The Substrate Doctrine* below.

---

## The Effort Protocol (read first, every shot)

> **This skill is a deep library. A library is passive — it answers questions you ask, but it does not make you ask hard ones. This section is the part that makes you ask.**

The rest of this skill is doctrine and vocabulary: rich, validated, large. That richness is also its failure mode. Faced with a deep catalog, the path of least resistance is to **reach for the nearest pattern, drop it in, and call the shot done.** That produces *competent* video — fluent, palette-correct, complementarity-passing — and *competent is the ceiling of laziness*. The goal here is not competent. The goal is shots that make a viewer sit up.

This protocol exists because of a measurable tendency, not a motivational one. Three failure modes, named so you can catch yourself in them:

- **Regression to the mean.** Left ungoverned, generation drifts to the statistically-average move — the most-trained, most-expected, safest composition. The first idea that arrives is almost always the mean. (Galton's Law: extremes don't persist without a force holding them out.)
- **Confirmation-reading.** When you open `reference.md`, the lazy use is to *fetch the pattern that confirms the shot you already pictured*. The right use is to let the catalog *challenge* the shot you pictured. A reference read to confirm is wasted; a reference read to disturb is leverage.
- **Premature convergence.** Picking the first workable composition and building it. The first workable composition is a floor, not a target. You cannot select the best option if you generated only one.

### The two modes (declare one per shot — silence is not allowed)

Every shot is built in exactly one of two modes, and **the mode is a conscious, logged decision** — never a default that happens by inattention.

| Mode | What it is | Legitimate for |
|---|---|---|
| **AWE mode** | Diverge → select → push past competent → self-critique. The shot is *designed*, not assembled. | The DEFAULT for any **anchor shot**: cold open, thesis-land, act open/close, case-study intro, the signature-move beat, any closing image, any shot the script marks as a keystone. |
| **EASY mode** | Reach for the correct standard pattern, execute it cleanly, move on. Honest and fast. | Transitional / utility / connective shots — a 2-second bridge, a parallel-list reveal, a section breath. Shots whose job is to *not* draw attention. |

**The gate:** AWE mode is the default for anchor shots. To build an anchor shot in EASY mode, you must write one sentence justifying it ("this is a utility bridge, not an anchor — easy mode because X"). If you can't write that sentence honestly, the shot is an anchor and gets AWE mode. **Laziness is permitted; silent laziness is not.** The user can always override downward ("just get this one done") — but you may never quietly choose down on their behalf.

### AWE mode — the forcing function (do this, in order, before writing any code for the shot)

1. **Diverge first — three before one.** Generate **three genuinely different visual approaches** to the shot before committing to any. Not three intensities of one idea — three *different ideas* (e.g. a diegetic-stage treatment vs. a continuous-canvas-thread treatment vs. a negation-then-reveal treatment). If all three are variations on the same instinct, you have not diverged; the instinct is the mean. Write them as one line each.
2. **Interrogate the obvious one.** The first idea you had is idea #0 — the mean. State it explicitly and ask: *what makes this the expected move, and what would the unexpected-but-right move be?* Idea #0 may still win — but only after it survives the other two, not by arriving first.
3. **Apply the Awe Test** (below) to each candidate. Select the one that creates the most *earned* cognitive surprise without breaking legibility.
4. **Push the winner past competent.** Take the selected approach and ask the **120/80 question**: *which single element of this shot will be executed to 120% — the one detail a viewer would screen-record?* A shot where everything is at 80% is competent and forgettable. Taste is uneven on purpose: one element at 120%, the rest in clean support. (This is the per-shot instance of the channel-level Differentiation Principle.)
5. **Self-critique before declaring done** (the Critic Pass, below).

### The Awe Test (the missing screen — runs alongside complementarity, not instead of it)

The complementarity test screens *filler out* ("does this advance the argument?"). It does **not** screen *wonder in*. A shot can pass complementarity perfectly and still be inert — correct, legible, and forgettable. Awe is a different axis.

The psychology: **competent design = processing fluency** (the viewer recognizes the form instantly → mild, pretty, forgettable). **Awe = optimal cognitive surprise** (the form violates the viewer's expectation *just enough* to require a small schema-update → then resolves into something that feels obvious in hindsight → "oh, *of course* it looks like that"). Awe is a managed prediction error. Too little surprise = wallpaper; too much = noise the viewer rejects. The target is the narrow band where the surprise is *earned by the argument*.

> **The Awe Test:** *Does this shot make the viewer's model of the topic update — visually — in a way they didn't see coming but immediately accept? Is there a single frame here a viewer would pause on, screenshot, or rewind to?*
>
> If the honest answer is "no, but it's correct" → the shot is competent, not awe. For an anchor shot, that is a fail. Diverge again, or find the surprise.

Three reliable generators of *earned* surprise (not gimmick):
- **Make the abstract concrete in an unexpected substrate** — the argument's structure rendered as a physical thing the viewer didn't expect it to be (a 150-year arrangement as a *receipt*; compression as a *cascade*; a filter as a literal narrowing aperture the camera passes through).
- **Defamiliarize the familiar** — take the thing the viewer thinks they understand and show it from the angle that makes it strange again, then resolve the strangeness into the thesis.
- **Withhold, then reveal** — negation-then-reveal, subtract-to-emphasize, the strip-to-silence. The surprise is in the *timing of understanding*, not in visual busyness. (Often the most awe-inducing frame is the emptiest one — see Negative Cinema.)

### The Critic Pass (before any shot is declared done)

Switch hats from maker to critic and answer honestly — laziness hides in skipping this:

- **The mean check:** "Is this the first/safest thing I'd have made without this protocol? If yes — did it actually win a divergence, or did I skip step 1?"
- **The 5-second test:** "If a viewer screen-recorded 5 seconds of this shot and sent it to a friend, what's the one thing they'd point at?" If nothing — it's wallpaper.
- **The awe check:** "Is there a pause-worthy frame? Where exactly?"
- **The honesty check:** "Am I calling this done because it's *right*, or because it's *finished*?" Finished ≠ right.

If the Critic Pass surfaces a real problem, **iterate — do not ship the first draft to avoid the work.** One real iteration on an anchor shot beats three new mediocre shots.

### What this protocol is NOT

- Not a mandate to make every shot maximal. Restraint is often the awe move (the emptiest frame). AWE mode is about *deliberate design*, not *more stuff*.
- Not a reason to slow utility shots. EASY mode exists precisely so connective tissue stays fast. Spend the saved effort on the anchors.
- Not a replacement for any existing discipline. It sits *on top* — complementarity, substrate, externalization, density, layer-variance all still apply. This protocol governs *how hard you think per shot*; they govern *what you think about*.

### Catalog Discipline (this skill is near its own complexity-fragility limit)

This skill is *deep* — and depth past a point becomes its own failure mode (EIF Pillar 5: when maintenance cost exceeds the energy available to apply it, coherence drops). The agent's read-and-apply budget per shot is fixed; the catalog is not. So the lazy path under a huge catalog is **confirmation-reading** — grab the nearest pattern that ratifies your first instinct. That is the same laziness the Effort Protocol exists to kill, arriving through a different door. Guard rails:

- **The Spine is the seed.** Reconstruct from the six regularities; don't try to hold all ~15 patterns + 5 Cinema vocabularies + 11 transition modes in mind at once. If a move doesn't trace to a Spine line, you probably don't need it for this shot.
- **The Cinema Layer is gated behind the Differentiation Principle.** You get *one* signature move per video. So reach into the Cinema vocabularies to find *that one*, then stop — do not browse all 11 transitions / 5 lenses / 9 spatial moves per shot. Browsing the whole catalog per shot is the EC-overload anti-pattern; it produces fussy, incoherent frames.
- **Layer Variance pays rent at ~4 axes, not 11.** The 11 axes in `reference.md` are a *menu of what's possible*, not a per-shot checklist. In practice, rate / direction / lifecycle / color carry almost all the load. Reach for a fifth axis only when the argument names it.
- **More is not the upgrade path.** When this skill feels insufficient, the fix is almost never "add another pattern." It is "compress to the Spine and apply it harder." New patterns get added to `reference.md` only after a field-notes validation proves they earn their maintenance cost.

---

## The Content Quadrant

Map by two **measurable energy/information quantities** — not vague "quality." The axes are:

- **Narrative Gravity** (Information / does it command attention?) — would a viewer stop scrolling, screenshot, or send it on? This is the rate at which the shot captures the receiver's attention bandwidth.
- **Thermodynamic Coherence** (Energy / does it actually transfer structure?) — after watching, does the viewer's model of the topic actually update? This is EC/KC: how much of what's on screen is structured signal the viewer can rebuild as a chunk vs. noise.

| | High coherence (transfers structure) | Low coherence (transfers nothing) |
|---|---|---|
| **High narrative gravity** | **Apex** — commands attention AND transfers structure. Magnetic, compounds. The target. | **Hologram** — impressive, feels empty. *Over-polished slop lands here.* Guaranteed to disappoint on the rewatch. |
| **Low narrative gravity** | **Silent Generator** — correct but ignored. *The "competent/lazy default" lands here* — real coherence, zero pull. | **Entropy Trap** / **AI Slop** — dead on arrival. |

Target: **Apex**. Acceptable start: **Raw Signal** (rough but honest — a Silent Generator you'll push up-and-right).

**Why measurable axes matter (it diagnoses both failure modes at once).** The two complaints this skill exists to fix are now the same map: the **lazy default** (chat 1) is the *Silent Generator* — coherent, ignored; **over-polished slop** is the *Hologram* — gravity, empty. The fix in both cases is a *vector toward Apex*: Silent Generator needs narrative gravity added (the Apex move / 120% element); Hologram needs coherence added (cut the empty polish, transfer real structure). "Is this shot good?" becomes "**which quadrant is it in, and what's the vector to Apex?**" — a question with a direction, not a vibe.

This quadrant applies fractally: to a single shot, an act, a whole video, and the channel.

---

## Two Foundational Constraints

### Constraint 1 — Abstract Graphics Only

No photorealistic people or scenes. Animated graphics are *honest abstraction* — transparently representational, so trust stays on the voice and argument. Lindy-compatible: the format ages well because it never pretended to be real.

"Abstract" does **not** mean "code-only." Carefully prompted **stylized raster artifacts** generated by `gpt-image-2` (low-poly illustrations, woodcut-style documents, ink-wash compositions, faceted dossier cards) qualify under this constraint when they live as artifacts the camera observes — never as the canvas itself, and never carrying the cinematic post-treatment that the camera applies on top. The Three-Layer Architecture below enforces this discipline.

### Constraint 2 — Complementary-Only

Every visual and audio element must advance the argument. Run the test:

> **Mute the audio: does this visual advance the argument on its own? Close your eyes: does the narration stand alone?**

Both should be **yes**. Audio and visual are two independent compressions of the same argument. Together they hit 100%+. If a visual fails the mute test, it's filler. Cut.

The test extends in the Cinema Layer (below) to admit *signature* as a second valid reason an element earns its slot — but decoration remains forbidden.

#### Why this is a bandwidth law, not a taste rule (Spine #2)

The complementarity test is usually taught as "cut filler." Its real mechanism is **channel-capacity doubling**, and understanding the mechanism tells you *how* to pass it, not just *whether*.

The viewer has **two independent processing pipes** — visual and verbal (dual-channel; Paivio, Baddeley, Mayer's CTML). They run in parallel. So:

- **Two pipes, non-redundant content ≈ 2× total bandwidth.** Visual carries one compression of the argument; narration carries a *different* compression. The viewer reconstructs from both. This is the *point* of complementarity — it's not "don't waste a channel," it's "you have two channels, run both full with different cargo."
- **Two pipes, duplicated content ≈ ½ bandwidth.** On-screen text that just repeats the narration makes both pipes carry the *same* signal — you've thrown away a whole channel. This is Mayer's **redundancy effect**, empirically one of the most damaging multimedia errors. *Forbidden by default:* never put the narration's words on screen as running text. (The **Argument-Coded Subtitle** is the principled exception precisely because it does NOT duplicate — it carries the *structural role* of each phrase via emphasis-color, which the audio cannot transmit. It adds a channel; it doesn't echo one.)

The hard-tier names for the rules already woven through this skill (so they're arguable as regularities, not preferences):

| Mayer / Sweller principle | What it requires | Where this skill already does it |
|---|---|---|
| **Modality** | Put words in the *audio* pipe, not the visual pipe, so the visual pipe is free for graphics | Narration-driven; on-screen text reserved for labels/typography beats |
| **Redundancy** | Don't duplicate narration as on-screen running text (halves bandwidth) | Forbidden; Argument-Coded Subtitle is the non-duplicating exception |
| **Signaling** | Cue the eye to the element that matters *now* | Word-locked motion, semantic color shift, the 120% element |
| **Coherence / Weeding** | Remove anything extraneous — it competes for the limited pipe | The complementarity cut + "no decoration" |
| **Spatial / Temporal contiguity** | Put related visual + verbal together in space and time | Word-locked builds; object-attached labels (diegetic UI) |
| **Segmenting** | Chunk into viewer-resettable segments | Density valleys, section breaths — and see the Receiver-Runway Doctrine |

When a shot fails complementarity, diagnose it as a *bandwidth* fault: is a pipe idle (visual adding nothing), or are both pipes carrying the same cargo (redundancy)? The fix differs by fault.

---

## The Three-Layer Architecture: Canvas, Artifact, Cinema

Code-first does not mean code-only. The frame is composed of three distinct layers with different ownership rules and different jobs.

```
┌─────────────────────────────────────────────────────┐
│ Cinema Layer  — post + atmo + 3D + ink + transitions │  signature & feel
├─────────────────────────────────────────────────────┤
│ Artifact Layer — gpt-image-2 PNGs (style registers) │  era shape grammar
├─────────────────────────────────────────────────────┤
│ Canvas Layer  — code/SVG primitives + repaints      │  argument structure
└─────────────────────────────────────────────────────┘
```

The **Canvas** carries the argument. The **Artifact** carries the era. The **Cinema** carries the signature — the perceptual cues (depth, grain, breathing light, ink, lens character, paper texture) that signal "this was authored, not generated."

### Canvas Layer (mandatory)

The world the camera moves through. Code/SVG primitives that:

- **Repaint to track the argument** (a plane shifting `tension → insight` mid-shot)
- **Word-lock to narration** (an arrow firing on a specific syllable via `wf()` / `makeWf()`)
- **Form the continuous canvas thread** (a single visual object evolving across an entire act or video)
- **Render the 6 visual primitives** (below)
- **Carry ambient terrain, particles, vignette, GlowFilters** (preconscious spatial anchoring)
- **Animate all typography** that needs to type out, dim, recolor, or animate per-character
- **Execute morph transitions** (a chart becoming a gauge becoming a map)

The canvas is parameterized, deterministic, frame-perfect, and cheap to iterate. None of these properties is negotiable.

### Artifact Layer (optional, but generously used)

Discrete objects the camera observes.

**The cost calculus.** `gpt-image-2` is the locked image model. Treat it as a **low-cost, high-fidelity, high-prompt-adherence tool**. One generation costs roughly the time of a single MCP call and effectively zero render-time cost (a static `<Img>` is cheap). The default instinct should be: *if a scene element isn't on the Canvas Layer, generate it as its own asset rather than baking it into a composite.* The marginal cost of one extra `gpt-image-2` call is negligible relative to the design payoff of that element having its own motion track, opacity envelope, register treatment, and substrate role. **Decompose by default; collapse to a composite only when the elements are ontologically one thing.** (See the Substrate Doctrine, Layer Variance, and `reference.md` § Multi-Asset Scene Composition for what this enables.)

Use raster when:

- The artifact is **era-locked** (a chained codex stays a chained codex; doesn't repaint to insight)
- It requires **shape-grammar fidelity** that pure SVG would take 4+ hours per object
- It's **composite-rich** (a faux dossier card with portrait + dates + citation pills + paper grain in one piece)
- It's a **particle/sprite atlas** (one PNG, many code-replicated instances)
- It's a **substrate layer** for a multi-asset scene (background, mid-ground, atmospheric raster) that benefits from independent motion, opacity, or register treatment — even when one composite generation could "include" it. Splitting buys N independent motion tracks at the cost of N − 1 extra MCP calls. Almost always the right trade.

Pipeline: choose a register from the locked Style Register Library → prompt with that register's preamble → cutout (chroma-key on `#FF00FF`) or composite as document → drop into Remotion `<Img>`.

The **Style Register Library** (locked):

- **Register A — Dossier-Geometric.** Faceted low-poly, drawn-not-rendered, paper-grain. Used as cutout subject for era-locked recurring primitives. The workhorse register.
- **Register B — Archive Plate.** Copperplate engraving, parchment background, single amber accent. Full plate as document for pre-1900 evidentiary citations.
- **Register C — Terminal Print.** Reserved for modern-era evidentiary plates when first needed.

See `reference.md` § Style Register Library for prompt anatomy, palette discipline, semantic encoding (active-accent for Register A; polygon-vocabulary for Register B), and the library validation pattern.

### The Cinematography Principle (load-bearing)

**Artifacts are not stickers.** Every PNG dropped into a shot must have at least one of:

1. Camera motion (slow scale push 1.00 → 1.06 over 90 frames, parallax, pan, slight rotation)
2. Mask reveal (wipe-in, iris-in, particle dissolve)
3. Composition layering (SVG canvas built around it — terrain below, migration arrow on top, era label types in)
4. Dissolve into the canvas at the end of its beat

A static PNG dropped into a moving canvas is a dead frame. The artifact is a **subject the camera observes**, with the same animated treatment a photographic subject would receive in cinema.

### Cinema Layer (post-compositional)

The camera and lens observing the assembled Canvas + Artifact frame. Owns:

- **Transitions** — the way one shot becomes the next (wipe, iris, whip-pan, glitch, ink-bleed, paper-rip, shutter, light-flash, particle-dissipate, dolly-zoom, cross-zoom)
- **Post-fx** — film grain, chromatic aberration, lens flare, light leak, halation, color-grade LUTs, dynamic vignette
- **3D / spatial moves** — perspective wrappers, depth parallax, card flips, page turns, tilt-on-beat, dolly push, truck, pedestal, crane
- **Atmospheric overlays** — gradient meshes, noise/grain, geometric patterns, god-rays, frame borders, paper-grain layers
- **Hand-drawn / organic** — rough.js highlights/circles/underlines, brush-stroke reveal masks, ink-wash overlays, charcoal/sketch register

Cinema is **post-compositional**. It operates on the assembled Canvas + Artifact frame; it never replaces or repaints them. Same complementarity discipline as the basic test, with one extension:

> **Cinema-Layer test:** "If I remove this effect, does the frame lose *information* OR *signature*? If neither, cut."

See `reference.md` for the full vocabularies (Transitions, Atmosphere, 3D, Hand-Drawn, Lens Personality, Meta-Canvas/Brechtian, Diegetic UI, Recursive, Video-Arc Drift), the Differentiation Principle (one signature move per video), the Director's Signature contract (channel-level), Negative Cinema (deliberate-absence statement), and Cross-Register Interpolation (mid-shot drift between layers).

### Anti-patterns (refuse)

- **Replacing primitives with PNGs.** The 6 primitives stay code. The continuous canvas thread stays code. No exceptions.
- **Photoreal anything-with-people.** No real-person photography. If a human figure is needed, low-poly geometric figure (raster or SVG) at 5-12 facets.
- **Saturated palettes.** Generated artifacts must use the project's semantic palette with `STRICTLY LIMITED` palette block + forbidden-color clauses.
- **AI matting on synthetic images.** Use chroma-key on `#FF00FF` only. AI matting models (`@imgly/background-removal-node` etc.) are trained on photographs and will strip parts of synthetic subjects.
- **Cinema-Layer effects on the Canvas alone.** Cinema composites over the *assembled* frame, not over individual layers (with the deliberate exception of artifact-only register markers like Register B's parchment border).
- **Wallpaper Cinema effects.** Same grain on every shot is decoration, not signature. Cinema effects must vary across the video tied to register / argument beat / particle color arc.
- **Hand-drawn touches on Canvas-Layer primitives.** Canvas stays deterministic SVG so the *argument* stays trustworthy. Hand-drawn lives on Artifacts and full-frame transitions only.

---

## The Visual Vocabulary

### 6 Primitives — the alphabet

Every visual on the canvas composes from six elements. These are the alphabet — all scenes are sentences written in this language.

| Primitive | Visual | Meaning |
|---|---|---|
| **Node** | Low-poly polygon (5-8px), semantically colored. Polygon sides encode character: triangle=hierarchical, square=rigid, hexagon=stable, octagon=machine | Any actor: organism, person, company, algorithm, model |
| **Connection** | Line whose properties encode its nature: thick+glow=amplified, thin+dashed=suppressed, wavy=distorted, traveling dots=active flow. Width 1-5px | Relationship, data flow, dependency |
| **Boundary** | Dashed/solid angular shape. Dashed=soft limit, solid=hard ceiling, pulsing=under pressure, shattering=phase transition | Constraint, ceiling, system edge |
| **Field** | Subtle radial gradient zone | Influence, gravity, jurisdiction |
| **Flow** | Animated path with moving dots | Energy or information traveling |
| **Absence** | Ghost structures at 2-5% opacity, connections that snap short | What isn't there — missing coordination, invisible infrastructure |

Shape semantics compound across videos — viewers learn to read institutional character from polygon count alone.

### Semantic Color System

Three colors plus background, used **structurally**, not decoratively. The viewer learns to read the argument from color alone.

| Role | Hex | Purpose |
|---|---|---|
| **System** | `#4A7C9B` (steel blue) | Baseline, conventional view, current state |
| **Tension** | `#E8913A` (amber) | Problem, strain, prediction error, what's breaking |
| **Insight** | `#3EC9A7` (cyan-green) | Resolution, thesis, what fixes it |
| **Background** | `#0A0E14` (near-black) | Dark canvas — colors pop, premium feel |
| **Text** | `#E8E4DF` (warm off-white) | Primary text. Dim to 45% for secondary |

Color shifts ARE narrative beats. A node changing from system to tension IS the argument saying "this is under strain." The viewer reads the color before they hear the narration.

Alternative palettes (Analytical Calm, Contrast Thinker, Warm Scholar) in `reference.md`. Pick one and commit across the series.

### Animation Principles

- **Build, don't reveal.** Elements construct on screen in sync with narration. Never appear fully formed.
- **Transform, don't cut.** Morph between concepts. A chart *becomes* a gauge *becomes* a map. The morph IS the insight.
- **Simulate, don't illustrate.** When showing a system, let it run. Show agents behaving and networks evolving, not static diagrams with labels. (Primer's core technique.)
- **Subtract to emphasize.** At the key insight, strip the canvas. Simplest visual = highest signal moment.
- **Ambient life.** Nodes breathe (subtle scale oscillation). Connections pulse faintly. The frame is never dead. A still frame = a dead argument.
- **Spatial argument.** Layout encodes logic. Comparisons split the screen. Syntheses merge elements. The arrangement IS the reasoning. (PolyMatter's core technique.)

---

## The Externalization Doctrine

> **The video is externalized cognition handed from creator to viewer.** Every scene element either holds state for the viewer's working memory — or asks the viewer to hold it themselves.

The viewer's working memory is bandwidth-limited (~4±1 chunks). Every concept the viewer must keep loaded to follow the next sentence consumes a slot that could be holding the *thesis*. The frame's job is to take bookkeeping load off the viewer's WM and put it in pixels — so the WM stays free for the argument that's actually being made.

This is not an addition to the strategy. It is the mechanism that explains why the strategy works at all. (Formal account in EIF: Bandwidth Externalization, the primary mitigation of the Channel Capacity Ceiling. Compounds across episodes via Chunk Crystallization — repeated naming of patterns turns them into transferable handles the viewer can redeploy in their own thinking.)

### The diagnostic question

> **For every scene element: what state does this hold for the viewer that they would otherwise have to hold in working memory? If nothing — cut.**

The externalization-aware extension of the complementarity test. An element earns its slot if it does *any* of:

- advances the argument *(complementarity)*,
- carries the channel's signature *(Cinema-Layer test)*,
- externalizes state the viewer would otherwise allocate WM to maintain *(this test)*.

Decoration is still forbidden. Mere ornament fails all three.

### What the strategy already externalizes

Most of the visual vocabulary is doing externalization work. Under this lens:

| Element | What it externalizes for the viewer |
|---|---|
| **6 visual primitives** | The ontological skeleton (nodes/connections/boundaries/fields/flows/absences) — viewer doesn't construct ontology in WM |
| **Semantic colors** | Argumentative role of each element — viewer doesn't track "is this good or bad" |
| **Continuous canvas thread** | "What is this video about" — viewer doesn't carry topic across acts |
| **Substrate doctrine** | Pre-conscious context — wide pre-conscious channel does work conscious channel doesn't |
| **Diegetic stage** | Spatial frame of reference — viewer doesn't construct the world each scene |
| **Most-recent dossier corner anchor** | Prior evidence — viewer doesn't hold past references in WM |
| **Particle color arc** | Emotional state — viewer doesn't track mood internally |
| **Density rhythm** | Pacing of WM load — peaks and valleys prevent buffer overflow |
| **Layer variance** | Multiple semantic dimensions in distinct motion rates — each parses pre-attentively |
| **Negation-then-reveal** | The wrong answer — viewer doesn't construct + reject it mentally |
| **Word-locked motion** | Cross-modal binding — viewer doesn't align audio + visual themselves |
| **Ghost object bridging** | Inter-shot continuity — viewer doesn't reconstruct relationship between shots |
| **Argument-coded subtitle** | Argument's structural role of the current clause — viewer reads tension/insight/system from emphasis color before parsing the words. Continuous EC channel running the full video runtime. (See `reference.md` § Argument-Coded Subtitle.) |

Reading the strategy this way reveals it as a formalized externalization protocol for animated argument. The substrate doctrine is its within-frame instance; the continuous canvas thread is its across-act instance. The strategy is well-designed because it offloads precisely the categories of state that would otherwise consume the viewer's WM and leave none for the thesis.

### Three extensions the lens surfaces

The lens's diagnostic value is what it surfaces that the strategy doesn't yet do consistently.

**1. Argument-state externalization.** The strategy externalizes argument *elements* (nodes, evidence) but rarely *position in the argument*. A viewer 7 minutes into a 12-minute essay must hold "we established A, refuted B, are setting up C" entirely in WM. The most-recent-dossier-corner-anchor does this for evidence; nothing does it for thesis path. A persistent low-opacity argument-state indicator — the 5-phase structure shown subtly with the current phase active — would externalize that bookkeeping. Must respect substrate discipline: richly-dimmed periphery, never competing with foreground. Risk: done badly it kills pacing and feels academic. Pilot before adopting at channel level.

**2. Viewer-question externalization.** When a thoughtful viewer encounters a claim, the brain spawns "but wait — what about X?" sub-processes that consume WM until resolved. The script methodology addresses this implicitly via prediction-error discipline. The visual extension: when about to address an emergent question, *show the question on-frame for 1–2s as the viewer's question* ("you might be thinking: X"). This externalizes the receiver's spawned process before answering, and functions as a checksum-validation — viewer recognizes their own question being seen, raising bandwidth resonance with the creator.

**3. Primitive-naming for cognitive-infrastructure transfer.** The vocabulary's deepest payoff is at the channel level: each video deposits chunks the viewer can redeploy externally, and chunks crystallize via repeated use *plus naming*. A pattern recurringly used but never named stays implicit; the viewer with the *name* of a pattern carries it and can deploy it in their own thinking. Operational: name the 6 primitives, 3 semantic colors, and signature-move patterns explicitly on-screen at least once across the first ~5 episodes of a series. This is the mechanism behind "Build a lens, not a topic list" — it's how the lens migrates from the screen into the viewer's own thinking, and how the channel's EC compounds across episodes.

### Recursive application

Externalization applies fractally:

- **within-frame** → substrate doctrine (rich-but-dimmed pre-conscious context)
- **within-shot** → layer variance with semantic encoding
- **across-shots** → ghost object bridging, continuous canvas thread
- **across-runtime** (continuous channel) → argument-coded subtitle — emphasis color externalizes structural role of every clause, full-video duration
- **across-acts** → most-recent-dossier corner anchor, argument-state HUD (extension 1)
- **across-videos** → primitive-naming, Director's Sheet (extension 3)
- **across-series** → channel-level Signature-Move Evolution Arc

When a frame, scene, act, or video feels "exhausting," "thin," or "academic" despite passing all other discipline checks, audit one tier up: *what state is the viewer holding internally that the frame should be holding for them?*

---

## The Substrate Doctrine (Figure-Ground Discipline)

> **The richer the background that is dimmed, the more pronounced the foreground.**

A foreground element on **empty void** reads as thin, isolated, weightless — the receiver's pre-conscious channel registers no contextual signal. The same element on a **rich-but-dimmed substrate** reads as deliberate, weighty, authored — the substrate is *evidence that a choice was made from richness*.

This is the highest-leverage move available because it operates on the receiver's wide pre-conscious channel (low conscious cost, high perceived information). The formal account lives in EIF as the Perceptual Coherence hypothesis: structured information becomes legible to a finite-bandwidth receiver in proportion to how the signal is organized for perception, not just to how much signal is present. Hierarchy, contrast, depth, rhythm, negative space, and proportion are the operational tools.

### Five operational tools

**Ambient Spatial Anchoring (8-15% opacity).** Background geometry that grounds the scene without competing for attention.

- *Terrain silhouettes* — 2-3 layers of angular line segments at frame bottom, decreasing opacity (50% / 35% / 20%). Three layers = near/mid/far depth from three data points.
- *Faceted horizon lines* — angular geometric lines at 8-15% setting spatial scale.
- *Geometric scaffolding* — faint nested polygons / angular grids behind foreground content.

Calibration is angular pseudo-random variation: interesting enough to stay in peripheral awareness, simple enough to never demand focus. Too uniform → invisible. Too complex → competes with foreground.

**Ghost Object Bridging (5-25%).** When cutting between shots, render the previous shot's key geometry at low opacity in the first 20-40 frames of the next. The viewer's brain registers continuity without consciously seeing the ghost. Hard cuts without ghosts feel like separate videos; with them, every shot feels like the same evolving argument. Ghosts at 5-8% are subconscious; at 15-25% they're consciously visible bridges.

**Continuous Canvas Thread.** A single visual object (shape, network, geometry) evolves across an entire act or video. Three implementation strategies:

1. An evolving object that changes width/color/opacity shot by shot
2. A shared geometry function every shot renders as a faint ghost
3. A shared dataset multiple shots render and transform

The canvas is never abandoned — it evolves through the argument. (See `reference.md` § Network Evolution for the canonical 5-act example.)

**Visual Absence as Argument.** Deliberately render what isn't there. Ghost connections that dissolve. Lines that reach toward nodes but snap short at 42%. Structures at 2.5% opacity. Absence is harder to animate than presence, but the gap registers viscerally — the viewer feels the missing structure.

**Line Weight as Encoding.** A connection's visual properties (width, dash, glow, animation) encode the *nature* of the relationship, not just its existence. Thick + glow + traveling dots = "amplified, active, powerful." Thin + dashed fading to nothing = "suppressed, invisible, dying." Wavy = "distorted." The line IS the definition.

**Layered Raster Substrate (Artifact-Layer counterpart).** The first five tools are Canvas-Layer (SVG/code) techniques — they cost render time but no MCP calls. The substrate doctrine extends to the Artifact Layer because `gpt-image-2` is cheap: distant cityscapes, environmental textures, atmospheric layers, mid-ground supporting elements can each be generated as **their own raster PNG at low opacity (10-50%) behind the foreground subject**. Each substrate layer is its own asset call with its own register preamble, motion envelope, and opacity register. This is operationally cheap (one extra MCP call per layer) and unlocks the figure-ground relationship at full strength: the dimmed-but-real raster substrate carries pre-conscious EC that thin SVG terrain alone cannot reach. A typical substrate-rich scene composes 3-5 raster layers + the Canvas Layer. See `reference.md` § Multi-Asset Scene Composition for the workflow, layer-role table, and discipline.

### Recursive application

The substrate doctrine applies fractally — to per-frame composition, to per-shot density rhythm, to per-act argument structure, to channel-level design discipline, to the documentation you're reading now. (This skill applies it to itself: surface tier visible in `SKILL.md`, mid tier dimmed in `reference.md`, deep tier dimmed further in `field-notes.md`.)

When you sense a frame is "rigid," "thin," "ungrounded," or "exhausting" despite hitting all the other discipline checks, the first thing to audit is the substrate: *is there pre-conscious-channel richness behind the foreground signal, or is the foreground floating in empty void?*

---

## The Receiver-Runway Doctrine (the viewer is a depleting engine)

> **The substrate doctrine governs the frame the viewer is looking at. The receiver-runway doctrine governs the fact that the viewer keeps looking away — and must be able to cheaply come back.**

Most of this skill optimizes the *transmitter*: how to compress the argument into a dense, beautiful, complementary signal. That is necessary and not sufficient. The binding constraint on long-form educational video is not the quality of the signal — it is the **energy state of the receiver.**

### The hard regularity (anchor, not opinion)

Across 6.9M MOOC sessions (Guo 2014), median engagement is ~100% for videos under 6 min, ~50% at 9-12 min, and **~20% past 12 min**. The maximum median engagement for a video *of any length* was 6 minutes. This is a Tier-2 (biological/attention) regularity — it does not care how good your act 4 is.

Our channel ships **15-60 min** essays. So the operating reality is blunt: **the median viewer's attention runs out before the thesis lands.** The viewer is an engine with a limited attention reserve, a steady burn rate, and a near-certainty of disengaging — *and then re-engaging* — many times across the runtime. A 15-minute video is not watched once; it is watched as dozens of micro-sessions stitched together by re-entries.

### The reframe: design's quiet first job on long-form is **runway extension**

Awe captures the *start* of the runway (the hook is an energy-capture event that buys the rest of the video — if it fails, nothing downstream is watched). But across the long middle, where Guo's curve says you are bleeding viewers, the dominant design job is different and currently unnamed in this skill:

> **Minimize re-entry cost.** For any moment past ~minute 6, ask: *if a viewer's attention just snapped back right now, how many seconds and how many WM slots does it cost them to know where we are in the argument?* The lower that cost, the more re-entries convert to continued watching instead of drop-off.

Re-entry cost is the receiver-side dual of externalization. Externalization asks "what state is the frame making the viewer hold?" Runway asks "when the viewer returns having held *nothing*, can the frame re-seat them for free?"

### What this skill already has — re-filed as runway infrastructure

Several existing tools are *secretly* runway extenders. Naming them as such is the point — it tells you to deploy them *for re-entry*, not just for aesthetics:

| Tool (lives elsewhere in skill) | Its runway function |
|---|---|
| **Argument-Coded Subtitle** | The single strongest re-entry device. A returning viewer reads tension/insight/system *color* before parsing words — argument-state recovered in <1s, zero WM. On long-form this is its *primary* job, not "third signature." |
| **Most-Recent Dossier Anchors the Corner** | The "active citation pocket" tells a returning viewer what evidence is currently in play, at a glance. |
| **Continuous Canvas Thread** | The persisting object answers "what is this video even about" without the viewer reconstructing it. |
| **Substrate / diegetic stage** | A stable spatial world means re-entry doesn't require rebuilding the scene's frame of reference. |
| **Density valleys + section breaths** | Not just pacing — they are *scheduled runway resets* where an overloaded WM can flush and re-initialize cheaply. |

### What to add — runway as a first-class design move

1. **Segment like the structure is load-bearing, because it is.** The segmentation literature is unanimous: chunked, clearly-bounded, navigable structure is the biggest single retention lever for long content. Treat each act boundary as an engineered **Reset phase** (EIF lifecycle): let WM flush, re-state where we are in one cheap beat, re-initialize. A 50-minute video should feel like 6-9 coherent ~5-8 minute segments with clean seams, not one undifferentiated wall.
2. **Build a re-entry checkpoint into each act.** Once per act, past the opening, there should be a frame that — on its own, with no memory of the prior 4 minutes — tells a cold-returning viewer the act's current claim. The argument-state externalization extension (a low-opacity 5-phase indicator with the current phase active) is the canonical implementation; pilot it before channel-adopting.
3. **Audit re-entry cost on the act's *worst* moment, not its best.** The mid-act, high-density, deep-in-a-sub-argument frame is where a returning viewer is most lost. If *that* frame can't cheaply re-seat them, the act leaks viewers there. Find it; lower its re-entry cost.

### The runway diagnostic (run per act on long-form)

> **Pick the moment ~60% through the act — the deepest, densest point. Cover the prior 4 minutes from your mind. Can you, from this frame alone, recover (a) what the video is about, (b) what this act is arguing, and (c) what the current claim is? If recovering all three costs more than a couple seconds or more than ~1 WM slot, the act is leaking viewers here.** Fix with the re-filed tools above before adding any new content.

### Discipline / anti-patterns

- **Runway extension is not dumbing down.** It does not lower the argument's depth; it lowers the *cost of re-boarding* the depth. The thesis stays hard; the on-ramp back to it stays cheap.
- **Don't pay runway cost on short-form.** Under ~6 min the viewer rarely leaves; re-entry infrastructure is wasted bandwidth there (and the argument-coded subtitle's color-as-signal hasn't had runtime to crystallize). This doctrine is a long-form doctrine.
- **Don't confuse a re-entry checkpoint with a recap.** A recap *re-narrates* (costs runtime, bores the continuous viewer). A checkpoint is *ambient and free* — the continuous viewer never notices it; only the returning viewer cashes it in. If your checkpoint interrupts the continuous viewer, it's a recap; redesign it into the substrate.

---

## The Diegetic Stage Pattern

A high-impact alternative to the default "floating elements in dark void" composition. Instead of placing components in abstract black space, **establish a physical scene** that the viewer inhabits — and let every element behave as a real object inside that space.

| Floating Abstract (default) | Diegetic Stage |
|---|---|
| Particles, glyphs, hexagons in dark void | A specific physical environment (desk, drafting table, museum drawer, vault, control room) |
| Elements "appear" / "transition" | Elements "land", "click on", "engrave", "stamp", "lift off" |
| Generic floating composition repeated shot-to-shot | Same world, evolving — viewer has stable spatial anchor |
| Exhausting after ~30 seconds | Cinematic, memorable, feels like a discovery |

**When to use.** Argument-anchor moments — cold open, thesis reveal, case-study introduction, closing image. Use Floating Abstract for fast-cut argument beats. A typical video alternates: 5-12s Diegetic to anchor → 30-60s fast Floating Abstract to deliver argument → 5-12s Diegetic to land.

### The wake / land / stamp / lift verb sequence

1. **WAKE** — establish the stage with one act that brings it to life (lamp clicks on, hand placing first object, spotlight pivoting). ~10-30 frames.
2. **LAND** — protagonist artifact arrives via physical verb (slide-in + drop-shadow growing as it settles, stamped, slid-across-table, flipped open).
3. **STAMP** — accessories accumulate one-by-one as discrete physical objects (bibliography mini-cards, dates as typewriter strikes, citations as marginalia).
4. **LIFT** — punchline manifests as physical gesture by the artifact itself (lifts off the desk, page tears free, lamp intensifies, artifact pulled forward). Cinema Layer effects accompany — but the artifact *does the gesture*.

### Composition-aware asset generation

When generating the stage as one `gpt-image-2` asset, **explicitly reserve an empty center** (or empty zone) for the protagonist artifact that will be composited later. The asset and the on-canvas elements are designed *together*, not separately. Tell the image model: *"the entire CENTER ~40% of the frame is INTENTIONALLY EMPTY — it will be a clean wooden surface; this empty center will be where a separate dossier card is composited later."*

### Discipline rules

- **Anchor argument text to the artifact, not to the global frame.** Thesis text appears below the dossier, next to the evidence card, on the dossier itself — never centered floating in negative space.
- **Object permanence across shots.** The protagonist artifact does not disappear, reappear, or teleport. It persists from shot to shot, may translate to a corner-callback position.
- **Stage matches argument register.** Academic argument → researcher's desk, archive drawer. Investigative → detective's pinboard. Industrial → control room console. The stage IS doing argument work — it pre-loads the register before any text appears.

See `reference.md` § Diegetic Stage Pattern for the worked example (Researcher's Desk cold open) and the related Persistent Scaffolding pattern (Most-Recent Dossier Anchors the Corner).

---

## Density Rhythm

Just as narration alternates between fast exposition and slow insight beats, visuals must alternate between **dense** and **sparse** frames. Uniform visual density is a monotone — the viewer's processing engine settles and engagement bleeds.

> Complexity contrast makes both dense and sparse shots hit harder. A rich layered frame followed by a single word on black creates perceptual compression that mirrors the argument's structure.

**Density arc for a typical act:**

```
seed → rich world → rupture → DENSE FLOW → PEAK (thesis) → swarm → collapse → silence
```

**Rules validated in production:**

- Every act has **two density peaks**; the second is the argument's climax
- A **valley** (5-10 elements) immediately precedes at least one peak — the contrast IS the impact
- **Section breaths** (~20 frames of darkness) align with density valleys
- The act ends at MODERATE-HIGH density (settling), not at a peak

### Particle color arc

Plan alongside density. Shift ambient particle color to signal emotional phases below conscious attention.

```
Shot: 043     044      045      046      047      048      049       050
Part: system  tension  system   tension  tension  tension  insight   tensionDim
Emo:  neutral strain   healthy  danger   strain   strain   break     settling
```

`system` for historical/neutral, `insight` for democratic/hopeful/breakthrough, `tension` for machine/algorithmic/strain. The shift operates below conscious attention — the viewer FEELS the mood change.

See `reference.md` § Density Rhythm for the act-level density planning template (notation format for storyboarding) and the cinematic density techniques table (split-depth composition, information flow, swarm, timeline fabric).

---

## Critical Scene Review

When reviewing scenes, apply these diagnostics in order. Each catches a different failure mode.

### The Visual Rhythm Diagnostic

**Word-locked pacing**, not sentence-locked. Visual events fire on stressed syllables, not on full narration blocks. The viewer's brain never gets a chance to settle because there's always a new micro-event demanding interpretation.

Diagnostic: count distinct visual events in a shot, divide by shot duration in seconds. If ratio < 0.5 events/sec, under-animated. If < 0.3, dead frame. Target: 0.5-1.0 events/sec for essay-style content.

### The Three Categories of Scene Failure

| Category | Symptom | Fix |
|---|---|---|
| **Diagram** | Final state without journey. Viewer parses in 2s, then nothing. | Add internal scene arc — something tries and fails, builds to threshold, evolves through stages. |
| **Hologram** | Looks impressive, communicates nothing without audio. Complementarity fails. | Replace abstract shapes with semantic visuals carrying meaning independently. |
| **Slideshow** | Each shot is an isolated audio+visual unit. Hard cuts. Mechanical rhythm. | Decouple audio and visual. J-cuts, L-cuts, mid-sentence cuts. |

### The Negation-Then-Reveal Pattern

The most reliable visual prediction-error engine. Show the wrong answer, dismiss it (strikethrough, dim, collapse), reveal the correct answer with more visual ceremony. Use for reframes, suspense builds, corrections.

The dismissed elements should DIM but remain faintly visible — the contrast between the wrong answers and the reveal IS the argument.

### Cinematic Transition Architecture (timing rules)

Visuals don't transition at sentence boundaries. They transition at **argument beats** — where the visual change IS the argument advancing.

- **Next sentence gives example of current concept** → mid-sentence cut
- **Next sentence extends the same idea** → L-cut (new visual foreshadows)
- **Next sentence reframes / contradicts** → hard cut (the break IS the prediction error)
- **Next sentence shifts time** → J-cut (voice carries before the eye catches up)
- **Argument changes topic** → section breath (brief darkness)

These rules govern cut **timing**. The Cinema Layer Transition Vocabulary in `reference.md` governs cut **treatment** (which charged transition or neutral mode). They compose: e.g. "L-cut + ink-bleed" = new visual ink-bleeds in while old narration finishes; "hard cut + glitch" = a hard cut whose hardness is amplified by the glitch.

### Layer Variance Audit

When a frame feels rigid despite hitting all other discipline checks (palette, primitives, narration timing, signature move, density), the first thing to audit is **layer variance**:

> **How many independent motion rates does this frame contain, and what does each one *encode*?**

A frame is not a canvas; it is a stack of independent canvases. When two elements move at the same rate, in the same direction, with the same curve, on the same lifecycle, they read as **one thing**. The moment their motion differs along *any* axis, the *difference itself* becomes a semantic signal.

- **0-1 rates** → monolayer; rigidity is structural — adding uniform animation won't fix it. Decouple.
- **2-4 rates with clear semantic role for each** → properly layered.
- **5+ rates** → layer overload; viewer parses variance as noise, not as signal.
- **Rates nameable but roles not** → decoupled-but-undirected. Fix the *why* before the *how*.

See `reference.md` § Layer Variance for the 11 axes of variance (rate / direction / scale / curve / phase / frequency / lifecycle / reference frame / perspective / color / pipeline), the decoupling protocol, the asset-decoupling test (when to split a composite raster into independent layers), the 6-step hierarchy of layer separation, the cases where coupling wins, and the recursive application across all scales.

### The Awe Diagnostic (anchor shots only)

The other diagnostics catch *defects* — rigidity, filler, hard cuts, exhausting frames. None of them catch the most common failure of an anchor shot: **being merely competent.** A shot can pass every check above and still be forgettable. For anchor shots (cold open, thesis-land, act open/close, case-study intro, signature beat, closing image), run the Awe Diagnostic:

> **Where is the pause-frame? Name the single frame a viewer would screenshot, rewind to, or send a friend. If you can't point to one, the shot is competent, not awe — and for an anchor that's a fail.**

- **No pause-frame** → fluency trap. Re-diverge (three different primitive lenses), or find the withhold-then-reveal / unexpected-substrate / defamiliarization move the beat is hiding. See `reference.md` § The Effort Protocol — deep mechanics.
- **Everything polished, still flat** → no 120% element. Pick the one element that earns 120%; pull the rest back to clean supporting 80%.
- **A striking element that doesn't serve the argument** → noise trap (gimmick). Re-anchor it to the thesis until removing it would break the argument — or cut it.

This diagnostic is *skipped for utility shots by design* — they're built in EASY mode and their job is to not draw attention. Applying it everywhere is its own anti-pattern (see The Effort Protocol). Run it only where the channel is remembered.

### The Complementarity Test (extended for signature and state-offload)

Final review pass. For every element on screen:

> "If I remove this, does the frame lose **information**, **signature**, or **state held for the viewer**? If none, cut."

Three valid reasons an element earns its slot — extending the original mute/eyes-closed test:

- **Information** *(complementarity)* — advances the argument independent of the other channel
- **Signature** *(Cinema-Layer test)* — carries the channel's authored feel
- **State-offload** *(Externalization Doctrine)* — holds bookkeeping the viewer would otherwise allocate WM to maintain

Decoration is still forbidden. An element that fails all three is ornament, no matter how attractive.

---

## What We Don't Do

A negative-space anti-list. The skill's "no" set is part of its surface tier — these are the lines that, if crossed, break the system.

- No photorealism of people or scenes
- No real photographs of cited thinkers (use low-poly polygon silhouettes or generated faceted dossier cards)
- No decoration — every element passes the complementarity test (information, signature, OR state-offload)
- No generic particle effects as primary content (ambient particles are background texture at 3-10% opacity, never the visual)
- No consensus aesthetics (purple-to-blue gradients, neon glow, "cinematic" hand-waving)
- No diagrams without journeys (every scene has an internal arc — something builds, fails, transforms, or evolves)
- No PNG primitives where SVG/code is correct (Canvas Layer stays code)
- No PNG static stickers (every artifact moves — see Cinematography Principle)
- No AI-matting on synthetic images (chroma-key only)
- No wallpaper Cinema-Layer effects (same grain on every shot is decoration, not signature)
- No hand-drawn touches on Canvas-Layer primitives (Canvas stays deterministic)
- No 3D for the sake of 3D (every spatial move tied to a word, beat, or register shift)
- No charged transition without an argument beat
- No director drift across a series (lock the Director's Sheet — see `reference.md`)
- No lens deviation without reason (default lens is the channel's voice)
- No Brechtian moves during argument-landing beats (method/pedagogy register only — see `reference.md`)
- No HUD where diegetic UI works (see `reference.md` § Environmental / Diegetic UI)
- No recursive overuse (PiP callback max 1/video; video-within-video max 1/series; Droste max 1/series)
- No skipping Negative Cinema (the thesis-land beat is often best served by stripping the Cinema Layer to zero, not by piling more on top)

---

## Voice Strategy

**Your voice, not AI voice.** In a sea of AI-generated voices, a real human voice is a scarcity signal. It communicates: a real person with skin in the game thought this through. If uncomfortable on camera: voice-over with animated visuals is the optimal format.

Persona design (frequency × stance, hardware audit, credibility floor, compression-engine-vs-expert reframe) lives upstream in `educational-video-scripting`. Don't duplicate here.

---

## Production Workflow

1. **Run `educational-video-scripting`'s Topic Selection Protocol** to choose and validate the topic.
2. **Write the script** using `educational-video-scripting`'s 5-Phase Structure with density and depth annotation.
3. **Adapt for target platforms** using `educational-video-scripting`'s cross-platform checklists.
4. **Plan density arc + particle color arc per act** using the templates in this skill (see Density Rhythm).
5. **Consult `video-motion-references`** for animation style, scene composition patterns, and timing.
6. **Decide canvas vs artifact split per shot** using the Three-Layer Architecture above. Primitives + repainting elements + word-locked motion stay in code; era-locked artifacts, dossier cards, faux documents, dense typography, particle sprites can be raster via `gpt-image-2`.
7. **Pick the cinematic register per shot** using the Cinema Layer vocabularies in `reference.md`. Most shots leave most choices on default; deviate only when the deviation IS the argument beat.
8. **Build Remotion compositions** using `SceneShell` + `motion.ts` + `staging.tsx` + shot config template; for raster artifacts follow project-level `How_images_svgs.md`; for Cinema-Layer effects build per-shot one-offs against the planned `my-video/src/shared/cinematics/` API names until that module ships.
9. **Apply this skill's diagnostics** as the review pass: complementarity (extended for signature and state-offload), substrate doctrine, externalization doctrine, density rhythm, scene failure categories, layer variance, transition architecture.

For implementation modules already in the codebase, the Cinema Layer module roadmap, and the channel-level signature-move planning checklist, see `reference.md` § Implementation Status and § Channel-Level Contracts.

For thumbnails: `thumbnail-extraction.md`.

---

## Series & Compounding Strategy

**Build a lens, not a topic list.** Develop a recognizable analytical framework you apply across domains — every new topic becomes content because the audience wants to see *your lens* applied to it. The mechanism by which the lens compounds: each video uses *and names* the same primitives until those primitives crystallize into chunks the viewer can redeploy in their own thinking (see § The Externalization Doctrine, extension 3). Repeated naming is the operational lever — a pattern used but never named stays implicit; a pattern named transfers from screen into the viewer's mental toolkit. (Lens design itself happens upstream in `educational-video-scripting`'s Persona and Topic Generation Template.)

**Micro-gravity engineering.** First 10-20 videos: dense, shareable, aimed at a specific audience (not "everyone"). A small activated audience that shares creates initial gravitational pull (Matthew Effect).

**The feedback loop.** Publish → observe which frames resonate → refine the compression algorithm → repeat. The content strategy is itself an evolutionary computation.

This loop is operationalized — the skill can audit its own outputs *and itself* with fresh eyes. See *Self-Audit* below.

---

## Self-Audit (the skill's feedback machinery)

A system without a feedback loop is open-loop, and a maker cannot see their own blind spots — the context that builds a thing is the context least able to critique it. So this skill carries machinery to critique itself with **fresh-eyes subagents in clean contexts**, and to write validated improvements back under a gate. Full protocol in `audit-loops.md`; staging ledger in `audit-log.md`. The two loops:

- **Loop A — Output Audit.** Spawn the fixed lens core (Naive Viewer / Skeptic / Cognitive Scientist / Cinematographer / Editor) + one rotating wildcard, each in an isolated context, to critique a *built* scene or video. Independent convergence is the signal; disagreement is data. Run after building anchor work.
- **Loop B — Skill Audit.** Spawn the same hybrid roster to critique *this skill* and propose edits. Triggered on cadence (every ~3 videos), on demand ("audit the skill"), or — strongest — when Loop A flags the **same** defect across multiple videos (a recurring output failure is a *skill* gap, not a one-off).

**The composition is the point:** real output failures become the evidence base for skill edits, and skill edits are validated by whether the next output audit stops flagging that failure. Closed loop = a skill that compounds instead of drifts.

**Gated write-back (safety).** Self-edits don't apply freely — that would make the self-edit its own source of slop. Proposals land in `audit-log.md` with a confidence level (borrowed from EIF's Framework Evolution Protocol). **Auto-apply is narrow:** only High-confidence, *subtractive/clarifying* (never new-pattern-additive), *non-load-bearing* edits, self-logged. The load-bearing set — the Spine's six regularities, the Style Register Library lock, the Director's Sheet contract, channel-locked anchor coordinates — is **off-limits to auto-edit** and always surfaced to the user. Default posture: stage, don't apply. Every applied edit mirrors to both skill copies and is logged for the human to revert.

> When you invoke this skill to *run an audit* (of a video or of itself), read `audit-loops.md` first — it has the lens roster, the subagent prompt templates, the cadence, and the gate. Don't improvise the audit; the discipline (clean contexts, parallel isolation, unfair single-axis lenses, gated write-back) is what keeps the audit from regressing to a mean itself.

**Consistency builds compounding EC.** One lens, one palette, one signature move per video, one Director's Sheet locked early, one signature-move evolution arc planned across episodes. See `reference.md` § Channel-Level Contracts (Director's Signature with 7-axis trait catalog, Signature-Move Evolution Arc episodes 1 / 2-5 / 6-15 / 16-30 / 30+, Negative Cinema, Video-Arc Drift).

---

## Where to go next

- **`reference.md`** — the named pattern catalog (Polygon Dossier Reveal Family, Canvas Self-Citation Class, Evidentiary Plate Reveal, Most-Recent-Dossier-Anchors-the-Corner, **Argument-Coded Subtitle**, Sequential Tile-Reveal, Single-Asset Code Replication, Multi-Asset Scene Composition, Brand-Direct, Inverted Argumentative Pyramid, Audio Pre-Buffer Sign Discipline, Cross-Register Interpolation, Layer Variance protocol). Cinema Layer vocabularies (Transitions, Atmosphere, 3D, Hand-Drawn, Lens, Meta-Canvas, Diegetic UI, Recursive, Video-Arc Drift). Channel-level contracts (Director's Signature, Negative Cinema, Signature-Move Evolution Arc). Worked examples and implementation status.

- **`field-notes.md`** — project-specific validations and anti-pattern post-mortems. Migration channel anchor coordinates, polygon vocabulary completion meta-moment, library validation cases, dated debugging notes. Read when debugging a specific decision against precedent.

- **`audit-loops.md`** — the self-improvement machinery. Fresh-eyes audit subagents (Output Audit + Skill Audit), the hybrid lens roster (fixed core + rotating wildcard), subagent prompt templates, gated write-back. Read when running an audit of a built video or of the skill itself. Staging ledger lives in **`audit-log.md`**.

- **`video-motion-references`** — motion implementation. Reach for it during build.

- **`educational-video-scripting`** — script-level thinking. Run before this skill.
