# Video Content Strategy — Reference

The mid-tier resource for `video-content-strategy`. Load this when composing a specific shot, deciding a register, or looking up a named pattern. The load-bearing principles and the substrate doctrine live in `SKILL.md`. Project-specific validations and anchor coordinates live in `field-notes.md`.

---

## Table of Contents

1. [Worked Examples](#worked-examples) — storyboard with semantic color, complementarity pass/fail, palette options, visual quality gate
2. [The Effort Protocol — deep mechanics](#the-effort-protocol--deep-mechanics) — divergence craft, the awe/fluency spectrum, taste as uneven effort, a worked three-approach divergence, the Critic Pass expanded
3. [Style Register Library](#style-register-library) — Register A / B / C, prompt anatomy, semantic encoding, library validation
3. [Named Pattern Catalog](#named-pattern-catalog) — the production-validated patterns
4. [Layer Variance — full protocol](#layer-variance--full-protocol) — 11 axes, decoupling, asset-decoupling test, hierarchy of separation
5. [Cinema Layer Vocabularies](#cinema-layer-vocabularies) — transitions, atmosphere, 3D, hand-drawn, lens, meta-canvas, diegetic UI, recursive, video-arc drift
6. [Channel-Level Contracts](#channel-level-contracts) — Differentiation Principle, Director's Signature, Negative Cinema, Signature-Move Evolution Arc
7. [Density Rhythm — extended](#density-rhythm--extended) — planning template, cinematic density techniques
8. [Implementation Status](#implementation-status) — operational modules and Cinema Layer roadmap

---

# Worked Examples

## Storyboard with Semantic Color

**Video**: "Why Committees Make Bad Decisions"

| Timestamp | Narration Beat | Visual Layer | Color |
|---|---|---|---|
| 0:00-0:10 | "You've sat in a meeting where 12 smart people made a dumb decision." | Single brain icon, then 12 brain icons in a circle | Neutral |
| 0:10-0:25 | "Individually, each person knew the right answer..." | Each brain lights up independently | Insight (green) |
| 0:25-0:45 | "...but the group converged on the wrong one." | Brains connect with lines. Individual colors fade. All turn same color. | Tension (amber) |
| 0:45-1:30 | "This is computational offloading. Copying the herd is thermodynamically cheaper than computing independently." | Energy cost meters: independent thinking = high cost, copying = low cost. Arrow from each brain to the loudest node. | Tension for cost, System for the herd pull |
| 1:30-2:30 | "The fix isn't 'think independently' — that's like telling water to flow uphill. The fix is structural..." | Transform the circle into different configurations: anonymous voting, structured dissent roles, pre-commitment | Insight for each structural fix |
| 2:30-3:00 | "The next time you're in that meeting, watch for the moment individual signals collapse into consensus. That's the phase transition." | Replay the circle animation but freeze at the transition point. Highlight it. | Tension → Insight transition |

## Complementarity Test — Pass vs Fail

### Passing Example

**Narration**: "Capital flows to the path of least resistance."
**Visual**: An animated topographic map. Liquid (styled, not realistic) pours from the top and finds the lowest channel, pooling at the bottom. The channels are labeled with real-world examples.

**Mute test**: The visual alone communicates "something flows to the easiest path" — viewer gets the concept.
**Eyes-closed test**: The narration alone delivers the economic principle.
**Together**: The metaphor locks in permanently. The viewer will *see* the topographic map every time they think about capital allocation.

### Failing Example

**Narration**: "Capital flows to the path of least resistance."
**Visual**: A generic stock market chart going up.

**Mute test**: The chart says "markets exist" — adds nothing to the specific claim about path-of-least-resistance.
**Verdict**: Non-complementary. The visual is filler. Cut or replace.

## Palette Examples

The default palette in `SKILL.md` (steel blue / amber / cyan-green on near-black) is one of many valid options. The discipline is consistency across the series, not the specific hex codes.

### "Analytical Calm" Palette
- Background: `#1a1a2e` (deep navy-black)
- System: `#a0aec0` (cool gray)
- Tension: `#f6ad55` (warm amber)
- Insight: `#68d391` (clear green)

### "Contrast Thinker" Palette
- Background: `#0f0f0f` (near-black)
- System: `#e2e8f0` (light gray)
- Tension: `#fc8181` (soft red)
- Insight: `#63b3ed` (sky blue)

### "Warm Scholar" Palette
- Background: `#1a1625` (dark purple-black)
- System: `#cbd5e0` (silver)
- Tension: `#fbd38d` (gold)
- Insight: `#b794f4` (soft purple)

Choose one and commit across the series. Consistency builds recognition.

## Visual Quality Gate Checklist

Run before publishing any video. Strategic / content quality lives in `educational-video-scripting`'s quality gate; this is the visual-side audit.

### Visual Discipline
- [ ] No AI-generated realistic people or scenes
- [ ] Consistent color palette used semantically (system / tension / insight)
- [ ] Visuals build and transform (not appear fully formed or hard-cut)
- [ ] Complementarity test passed (mute test + eyes-closed test)
- [ ] Externalization test passed — every element holds state for the viewer, advances the argument, OR carries the channel's signature; nothing fails all three
- [ ] Key insight moment has the simplest visual on screen
- [ ] Substrate doctrine honored — no foreground-in-void shots without rationale

### Style Consistency
- [ ] Visual vocabulary consistent with previous videos
- [ ] Same icon/symbol language for recurring concepts
- [ ] Color roles unchanged from series standard
- [ ] Animation principles followed (build, transform, subtract, ambient life, spatial argument)
- [ ] Director's Sheet honored (camera pace, color temperature, grain register, transition character, typography personality, signature-move frequency)

### Cinematic Quality
- [ ] One signature cinematic move identified (Differentiation Principle)
- [ ] Negative Cinema candidate identified (1-2 per video max)
- [ ] No wallpaper Cinema-Layer effects (grain / vignette / tilt vary by register)
- [ ] No charged transition without an argument beat
- [ ] Layer variance audit passed for any rigid-feeling frame

### Effort & Awe (anchor shots)
- [ ] Each anchor shot was built in AWE mode (diverged → selected → pushed → critiqued), or explicitly justified as EASY mode in writing
- [ ] Awe Diagnostic passed for every anchor shot — a named pause-frame exists (cold open, thesis-land, act open/close, case-study intro, signature beat, closing image)
- [ ] Each anchor shot has one 120% element; the rest sit in clean supporting 80% (no flat all-80% Hologram frames)
- [ ] No anchor shot shipped on idea #0 (the first/mean idea) without it winning a real divergence
- [ ] Utility shots stayed in EASY mode (awe-effort not wasted on connective tissue)

---

# The Effort Protocol — deep mechanics

The surface tier of this protocol lives in `SKILL.md` (read first, every shot). This is the mid-tier: the *craft* behind the forcing function — how to diverge well, how to calibrate the awe band, what taste actually is mechanically, and a fully worked divergence. Load this when an anchor shot deserves real design effort and "diverge → select → push → critique" isn't yet muscle memory.

The protocol's whole purpose is to defeat a single gravity: **the pull toward the mean.** Everything below is a technique for holding a shot out of the mean long enough to find something better. None of it is about working *slower* — it's about spending the effort where it compounds (anchors) and refusing to spend it where it doesn't (utility shots).

## Why a library needs a forcing function (the diagnosis)

This skill grew deep because depth was the right investment — the catalog, the registers, the Cinema Layer vocabularies are all load-bearing. But depth created a second-order problem the depth itself can't solve:

- A **passive reference** answers the question you bring it. If you bring it "what's the standard way to reveal a parallel list," it hands you the Sequential Tile-Reveal and you ship. Correct, fast, *mean*.
- The reference cannot make you ask "is a parallel-list reveal even the most interesting thing this beat could be?" — that question has to come from *outside* the catalog. The Effort Protocol is that outside.
- The deeper the library, the stronger the pull to confirmation-read it (fetch the pattern that ratifies your first instinct) rather than challenge-read it (let it disturb your first instinct). A bigger catalog makes the lazy path *easier*, not harder. The forcing function is the counterweight.

This is why the fix for "the videos feel lazy" was never "add more patterns." More patterns would have made it worse. The fix is the small, high-priority protocol that governs *how hard you think per shot* — sitting on top of the catalog that governs *what you think about*.

## Divergence craft — how to generate three real alternatives

"Generate three approaches" fails if the three are secretly one. The mean is seductive precisely because its variations *feel* like different ideas while sharing a spine. Real divergence varies the spine. Techniques that force genuine spread:

- **Vary the primitive lens.** Approach A is built on the *diegetic stage* (a physical world the camera inhabits). Approach B is built on the *continuous-canvas thread* (an abstract geometry evolving). Approach C is built on *negation-then-reveal* (show the wrong picture, break it, reveal the right one). These produce structurally different shots, not three skins on one shot.
- **Vary the register.** Same beat as a quiet Negative-Cinema strip; as a dense swarm peak; as a single diegetic gesture. The density axis alone, pushed to both extremes, surfaces non-mean candidates.
- **Vary the metaphor substrate.** If the argument is "X compresses Y," approach A renders it as fluid finding a channel, B as a cascade of nested layers, C as an aperture the camera passes through. The metaphor *is* the idea; three metaphors are three ideas.
- **Force one deliberately "wrong" candidate.** Generate one approach you suspect is too strange or too bare. The deliberately-extreme candidate often reveals that the "safe" one was lazy — and occasionally it wins outright. (This is the design-studio trick of sketching the worst/most-humiliating option to break fixation.)

**The divergence anti-pattern:** three approaches that are "Tile-Reveal but blue / Tile-Reveal but bigger / Tile-Reveal but with grain." That is one idea at three intensities. If you can describe all three by changing adjectives on the same noun, you have not diverged — the noun is the mean, and you're decorating it.

**How many, really.** Three is the floor for an anchor shot, not a quota to perform. The point is to *break the first-idea monopoly*. If two genuinely different approaches already make the right answer obvious, you've achieved the goal. If you've written three and they're all the mean, write a fourth from a different primitive lens — the count isn't the point; the spread is.

## The awe / fluency spectrum — calibrating the band

Awe is not "maximum surprise." It's a *band*, and both edges are failure:

```
pure fluency ───────────── optimal surprise ───────────── pure noise
(instantly      (recognizable enough to parse,      (so unexpected
 recognized;     surprising enough to update;         the viewer can't
 mild, pretty,   resolves to "of course")             parse it; rejected)
 forgettable)        ▲ THE TARGET
```

- **Left edge (fluency trap):** the competent shot. The viewer's prediction is met exactly. Processing is effortless, the feeling is mild and positive, and the shot is gone from memory in seconds. *This is where laziness lands by default* — fluency is the mean's native register.
- **Right edge (noise trap):** surprise with no resolution. A wild visual that doesn't pay off into the argument. The viewer experiences confusion, not awe, and disengages. Gimmick lives here.
- **The target band:** the shot violates the viewer's expectation *just enough* to force a small schema-update, and then the update *resolves* — the new picture feels obvious in hindsight ("oh, of course a 150-year arrangement is a receipt"). The prediction error is real but immediately repaid by the argument. This is the *aha*, and it's what gets screenshotted.

**Calibration heuristics:**
- The surprise must be **earned by the argument**, not bolted on. If you can remove the surprising element and the argument is unchanged, it's right-edge noise — cut it.
- The resolution must be **fast**. If the viewer has to work for more than a beat to understand *why* the surprising image is right, you're too far right. Pull back toward legibility.
- **Defamiliarization is the engine.** Take the thing the viewer thinks they already understand, make it momentarily strange (new substrate, new angle, withheld reveal), then snap it back into focus *as the thesis*. The strange→familiar snap is the awe.
- **Emptiness is a surprise too.** When the whole video has taught the viewer to expect a rich frame, stripping to one line on black is a violated expectation that resolves into "this is the part that matters." Negative Cinema is an awe move, not an absence of one.

## Taste, mechanically — the 120/80 rule

Taste is often described as ineffable. Operationally, for this skill, it is not — it is **uneven allocation of effort**:

> A shot where every element is executed to 80% reads as *competent and flat*. A shot where **one** element is executed to 120% and the rest sit in clean 80% support reads as *authored*. Taste is choosing *which* element gets the 120% — and having the discipline to leave the rest at a deliberate, supporting 80%.

- The 120% element is the one a viewer would screen-record: the dossier that physically *lifts* off the desk on the stressed syllable; the single ink-wipe; the strip-to-silence; the one perfectly-timed match-dissolve across scales.
- Spreading the effort evenly is the trap. "Everything polished" is how you get the **Hologram** (looks impressive, feels empty) — the high-production / generic-thinking quadrant. Even polish reads as *no choice was made*.
- The 120% choice is the per-shot echo of the channel-level **Differentiation Principle**. The channel has one signature move; the shot has one 120% element. Same logic at two scales.

This is also why the protocol is *not* "make everything maximal." Maximal-everything is just 80%-everything with the volume up — still flat. Awe is *contrast*: one peak against clean support.

## A worked divergence (anchor shot)

**Beat (from a real script family):** the cold-open thesis is "modern schooling is one organ inside a ~150-year arrangement between state, capital, family, and the next generation — not education itself."

**Idea #0 (the mean, named so it can be beaten):** four labeled nodes (state / capital / family / next-gen) connected in a ring, the word "arrangement" appearing in the center. *Why it's the mean:* it's the first, safest, most-trained way to show "four things in a relationship." It passes complementarity. It fails the Awe Test — nothing updates the viewer's model; a viewer has seen a labeled relationship diagram a thousand times. Competent. Forgettable.

**Divergence — three genuinely different spines:**

1. **Diegetic-stage spine — "the receipt."** The argument's structure rendered as an *unexpected physical object*: a long itemized receipt printing out, each line a cost the arrangement extracts (16,000 classroom hours, public expenditure, parent-hours…), the four parties named as the signatories at the bottom. *Awe source:* abstract institutional argument made concrete in a substrate (a receipt) the viewer didn't expect — and it resolves instantly into "schooling is a *transaction*." This is the defamiliarize-the-familiar engine plus unexpected-substrate.
2. **Continuous-canvas spine — "the organ."** A single body-silhouette canvas where schooling is one *organ* among four, the four parties as interlocking systems keeping it alive; the camera pulls back to reveal the school was never the whole body. *Awe source:* the pull-back reframe — the viewer thought they were looking at "the school," and the frame reveals the school was a part, not the whole. Withhold-then-reveal at the composition level.
3. **Negation-then-reveal spine — "not education."** Open on the expected image (a classroom, "education"), let the viewer settle into it, then *strike it through* and reveal the arrangement underneath — the classroom was the cover story. *Awe source:* the prediction error of having the obvious answer dismissed, hard, in the first ten seconds.

**Selection:** all three beat idea #0 on the Awe Test. Pick by argument-fit: if the episode's spine is a "hardware audit" (it is), the **receipt** wins — it *is* the audit, made physical, and it seeds the recurring object for the rest of the episode (object permanence; corner-callback later). The continuous-canvas "organ" idea is logged for the act that explicitly argues the organ point.

**Push past competent (120/80):** the 120% element is the receipt *printing in real time*, line by line, word-locked to the narration, with the final total landing on the stressed syllable and the four signatories stamping in. Everything else (background desk, ambient grain, lamp) sits at a clean, dimmed 80%.

**Critic Pass:** *Mean check* — is this the first thing I'd have made? No; the first was the ring diagram (idea #0), and the receipt won a real divergence. *5-second test* — a viewer screen-records the receipt printing and the total slamming down; that's the shareable frame. *Awe check* — pause-worthy frame: the moment the total lands. *Honesty check* — shipping because it's right (it *is* the audit), not merely finished. Passes.

The whole divergence is ~15 minutes of thinking. It is the difference between a cold open a viewer scrolls past and one they send to a friend.

## The Critic Pass — expanded

The surface tier lists four checks. In practice the Critic Pass fails productively in recognizable ways — learn the failure signatures:

| Critic finding | What it means | The fix |
|---|---|---|
| "It's correct but I can't name the pause-frame." | Fluency trap — competent, no awe. | Re-diverge with a stronger metaphor substrate, or find the withhold-then-reveal in the beat. |
| "Everything's polished but it feels flat." | No 120% element — even effort, Hologram risk. | Pick the one element that earns 120%; deliberately pull the rest back to supporting 80%. |
| "The cool part doesn't connect to the argument." | Noise trap — right-edge surprise, gimmick. | Cut the surprising element or re-anchor it to the thesis until removing it would break the argument. |
| "I diverged but all three were basically the same." | False divergence — one idea, three skins. | Vary the *primitive lens* (diegetic / canvas / negation), not the adjectives. |
| "I'm calling it done because I'm tired." | Honesty failure — finished mistaken for right. | Log it as an open item; one real iteration beats shipping the mean. |

**The meta-discipline:** the Critic Pass only works if you actually switch hats. The maker is invested in the thing being done; the critic is invested in the thing being *good*. Hold them apart — diverge as the maker (defer judgment, generate freely), then converge as the critic (judge hard, no new ideas). Mixing the two collapses both: judging while generating produces safe incremental ideas; generating while judging produces scattered analysis. The strict separation is the whole game.

## When to spend this (and when not)

The protocol is a budget, not a tax. Spend it where it compounds:

- **Anchor shots get the full protocol** — cold open, thesis-land, act open/close, case-study intro, signature-move beat, closing image. These are the shots the channel is *remembered by*; mean execution here is the most expensive kind of laziness.
- **Utility shots get EASY mode, deliberately** — bridges, section breaths, parallel-list reveals whose job is to *not* draw attention. Spending awe-effort here is its own failure: it slows the work and pulls focus from the anchors. Reach for the correct standard pattern, execute cleanly, move on.
- **The ratio is the point.** A 15-minute video might have 6-10 anchor shots and dozens of utility shots. The protocol concentrates effort on the 6-10 and protects the speed of the rest. That is how you get awe-where-it-counts *and* ship on time — the two goals the user named as being in tension are reconciled by the budget, not by working harder everywhere.

---

# Style Register Library

The Style Register Library is **locked**. Three registers, each with a locked preamble that the artifact pipeline obeys.

## Register A — Dossier-Geometric

**Visual character**: Faceted low-poly geometric form, drawn-not-rendered surface treatment, museum-drawer cool diffuse light, paper-grain texture, semantic palette with role-bound amber. Reference vibe: Diderot's Encyclopédie folio meets MIT Press cover meets architectural model photography.

**Used as**: Cutout subject (chroma-key on `#FF00FF`) for era-locked recurring primitives — gates, sprites, particle atlas, anything that must read as "the same form, different era." This is the workhorse register.

**Active-accent semantic discipline (load-bearing).** The amber accent appears on EXACTLY ONE element per artifact: the answer to *"where does the restriction actually happen in this era?"* For any Register A library, the amber should encode a **single semantic dimension that varies across the family** (restriction mechanism, breakage point, decision point, etc.). Pick that dimension up-front and obey it. A viewer scanning the row of artifacts reads the amber positions as a sentence — pre-verbally, before any narration.

## Register B — Archive Plate

**Visual character**: Pure copperplate engraving in the 18th-century scientific encyclopedia tradition — line work + cross-hatching only, no solid fills, parchment background, hand-tinted amber wash on metalwork only OR a single small amber wax-seal stamp in the lower-left for portrait plates, "TAB. N" registration code in the lower-right corner.

**Used as**: Full plate composited as document object (no cutout) for one-off pre-1900 archival evidence — authority dossier cards, archival quotes, period-evidence plates the camera dwells on once.

**Anachronistic for post-1900.** Don't use for AI/internet/industrial era.

**Polygon-vocabulary as methodological signal (load-bearing).** The polygon silhouette in each dossier plate doubles as a methodological-lineage marker that pairs into school-of-thought groups. Within a Register B library, the polygon shape encodes the thinker's analytical lineage:

- **Hexagon** (6 sides) → relational sociology / field theory
- **Triangle** (3 sides) → vertical critique / acceleration theory
- **Square** (4 sides) → empirical structuralism / tacit-knowledge tradition
- **Octagon** (8 sides) → foundational integration / civilizational synthesis

When two same-family plates appear in the same montage frame, the eye reads the family pairing **pre-verbally**. The labels (`RELATIONAL` / `VERTICAL CRITIQUE` / `STRUCTURAL` / `FOUNDATIONAL`) appear as a *reveal of what the eye has already grouped* — a free prediction-error punch.

## Register C — Terminal Print (reserved)

Reserved. Will be designed when a shot first needs a modern-era evidentiary plate (leaked Slack thread, model card, security report). Same evidentiary purpose as Register B but in modern dark-editorial register.

## The deeper rule

Within a locked register, **one visual dimension is reserved as a semantic encoding channel that the rest of the library obeys consistently.** The viewer doesn't learn the encoding from any one artifact — they learn it from the *pattern across the library*. That makes the encoding free signal density once the library exists.

The two-or-three register approach is itself the strategic choice: it gives the channel a small, recognizable visual library. A viewer who sees a Register A artifact next to a Register B plate next to the dark canvas will start to recognize "this look" — the channel earns its visual signature through the *combination* of registers, not through any single register alone.

## Trust gpt-image-2 for load-bearing text (do NOT double-encode)

`gpt-image-2` renders load-bearing text — exact numbers, verbatim multi-line quotes, dense mixed-script (zh + en) editorial typography — reliably and correctly **when prompted with discipline.** Trust it. Put the quote, the data, the title directly on the plate and let the register's typography carry it. Do **not** build a "reserved blank region + SVG/code text overlay" workaround out of caution — that double-encoding is wasted effort, it fights the register's typographic character, and it signals a confidence the model has already earned (validated across the project's dossier / archive-plate / NC-typography libraries, all 1-pass).

To earn that reliability, prompt with the standard text-bearing discipline (full version in `video-generation-mcp`):

- **Quote every character verbatim, in order** — `the line reads exactly: "…"`. Don't paraphrase the content into the prompt.
- **Name the typeface class** — condensed serif, Song-ti calligraphy, JetBrains Mono identifier, heavy black sans slab.
- **Number the regions** — `(1) … (2) … (3) …` with explicit y-positions; the model treats it as a layout contract.
- **Add the anti-gibberish clause** — "every word spelled correctly, no garbled letters, no extra fake text."
- **Verify Latin→Chinese transliterations in the prompt BEFORE generating.** The model faithfully renders whatever you write — a wrong character in the prompt becomes a perfectly-rendered wrong character. That is a *prompt* error, not a glyph-fidelity failure.

The only real failure mode is YOUR prompt being wrong (a mistyped number, an unverified name). Fix it at the prompt and regenerate — never by retreating to a code overlay. Keep load-bearing text on the plate.

## Multi-asset register consistency

When composing a scene from N `gpt-image-2` generations (see Multi-Asset Scene Composition below), **all layers in one scene share the same register preamble**. The register's STYLE block is a constant; only the SUBJECT block varies per layer. This is what makes the layered scene read as one coherent visual world rather than three different visual languages stacked on top of each other.

Practically: define the register's STYLE preamble as a string constant in your prompt-construction code. Every layer in the scene inherits it. The variation per layer is in:

- **SUBJECT** (what's actually being depicted in this layer)
- **COMPOSITION HINT** (full bleed for background, centered subject for foreground, edge-only for atmosphere overlay)
- **OPACITY ROLE** (whether the prompt should yield something that reads at full strength or at low-opacity-tinting strength)

Do **not** vary palette, illumination model, geometric stylization, paper-grain, or background color across layers in one scene — those belong to the register and must stay locked.

The flip side: across *different* scenes you can shift register (Register A → Register B drift across acts; see Cross-Register Interpolation). Just never within one scene's layered composite.

## Library Validation Pattern (mandatory)

Before any new artifact library ships into production shots, build a **3-beat smoke test composition**. A single artifact can pass the per-artifact quality gate and still fail to function as a *family*. Same template validates every library — same canvas backdrop, same 3 beats, ~12s at 30fps:

1. **Hero ceremony reveal** — a single artifact at full size with the entrance choreography that beat-1 of any real ceremony shot will use (spring entrance, slight tilt, drop-shadow, slow scale-push, citation label below). Validates per-artifact correctness at full hero scale.

2. **Callback badge** — same artifact dimmed to ~55% opacity in a corner anchor at ~16-18% of frame height, with body text taking over the rest of the frame. Validates that the asset still reads at small scale and that the dimmed parchment / silhouette doesn't fight body text.

3. **Family / era montage with spatial encoding** — all N siblings visible simultaneously, arranged so the *spatial pattern itself carries argument*. Two validated layouts:
   - **Polygon-family montage** for Register B dossier libraries: plates sorted by methodological family with family labels appearing as a reveal *after* the eye has grouped the pairings. Validates the polygon-vocabulary semantic encoding.
   - **Era-staircase montage** for Register A primitive libraries: assets arrayed left-to-right with Y position encoding era (deepest era at lower y, present at higher y), threaded by a single dotted amber **migration vector** connecting asset centers. Compresses the storyboard's continuous canvas thread into a single readable frame.

If smoke test fails at beat 1 or 2, per-artifact problem — regenerate. If it fails at beat 3, the library has a *semantic encoding* hole — and no shot-level work will close it. Find this in a 1-hour smoke test, not mid-production.

Reference templates: `Migration-DossierLibraryTest.tsx`, `Migration-GateLibraryTest.tsx`. Operational details (sizing math, stagger timing, migration-curve path math, smoke-test composition checklist) live in project-level `How_images_svgs.md` §1.13.

---

# Named Pattern Catalog

The production-validated patterns. Each entry: *what it does → grammar → discipline → when not to use*. Project-specific validation cases live in `field-notes.md`.

## Diegetic Stage Pattern (full protocol)

A high-impact alternative to the "floating elements in dark void" composition. The surface intro lives in `SKILL.md`; this is the full build protocol.

### Build protocol

1. **Choose a stage that semiotically matches the argument register.** Academic argument → researcher's desk, archive drawer, library carrel. Investigative → detective's pinboard, evidence table. Industrial → control room console, factory floor schematic. Personal → kitchen table, journal on a nightstand. The stage IS doing argument work — it pre-loads the register before any text appears.

2. **Generate the stage as ONE composition-aware asset.** Top-down or 3/4 establishing view. Critical: design the asset *with* the code in mind — explicitly reserve an **empty center** (or empty zone) for the protagonist artifact that will land there. Tell the image model: *"the entire CENTER ~40% of the frame is INTENTIONALLY EMPTY — it will be a clean wooden surface; this empty center will be where a separate dossier card is composited later."*

3. **Establish the stage with a "wake" gesture.** Before any argument element appears, perform one act that brings the stage to life:
   - Lamp clicks on (warm radial gradient cone)
   - Hand placing the first object (off-screen drop-in)
   - Spotlight pivoting onto a slot
   - Page being turned

   ~10-30 frames. The wake gesture is the visual equivalent of the narrator clearing their throat.

4. **Land the protagonist artifact with a physical verb.** The main subject doesn't *appear* — it *lands*:
   - Slide-in from above + drop-shadow growing as it settles + slight overshoot bounce
   - Stamped / pressed (compression on impact)
   - Slid-across-table (horizontal entry)
   - Flipped open (page-turn rotation)

5. **Use diegetic accessories as semantic carriers.** Around the protagonist, mini-artifacts appear ONE BY ONE — each with its own physical metaphor:
   - Bibliography titles → small parchment cards with year + italic title + amber wax-seal corner, pinned at four corners around the protagonist
   - Dates → typewriter strikes
   - Citations → marginalia notes in the corner
   - Evidence → stamps with date+ID

6. **Anchor argument text to the artifact, not to the global frame.** Thesis text appears *below the dossier* (like notes a researcher would write underneath the subject), *next to the evidence card* (like an annotation), *on the dossier itself* (like writing on the document). Never centered floating in negative space.

7. **Object permanence across shots.** The protagonist artifact does not disappear, reappear, or teleport. It persists from shot to shot, may translate to a corner-callback position, but the viewer's gaze always has a stable physical anchor.

8. **Land the punchline as a physical gesture.** The signature beat is performed by the artifact itself: dossier "lifts" off the desk, page "tears free", lamp "intensifies", artifact "is pulled forward." Cinema Layer effects (light flash, dolly push) accompany — but the artifact *does the gesture*.

### Worked example: the Researcher's Desk cold open

Cold open of a sociology video. Narration: *"French sociologist Pierre Bourdieu spent his entire life proving one thing."*

- **Stage:** top-down faceted wooden archive table — brass lamp UL, ink well UR, papers + fountain pen LL, leather book LR, **empty walnut-wood center reserved for the dossier**. (Generated as one Register A asset with the explicit reservation in the prompt.)
- **WAKE (frames 12-22):** brass lamp clicks on → warm radial gradient cone with 3-frame flicker, light spreads across the desk. The world wakes up.
- **LAND (frames ~24-46):** Bourdieu dossier card slides down from above frame, lands center with bounce + drop-shadow growing as it settles. The protagonist arrives.
- **STAMP (frames ~50-200):** wax-stamp burst rings emanate from the dossier on each name character (amber on the surname proper). Then four bibliography mini-cards appear one-by-one at the four corners — each a parchment card with year + italic title + amber wax-seal corner. The lifetime accumulates physically.
- **THESIS (frames ~200-380):** thesis phrases materialize *below* the dossier, word-locked. Negation phrase dimmed and struck-through. Reveal phrase in massive amber.
- **LIFT (frame 393, "公" syllable):** light flash radial pulse from dossier center + dossier scales up 12% — "lifts off" the desk. The signature beat is the artifact performing a physical gesture.
- **Object permanence:** the dossier persists from shot 002 into shot 003 unchanged. In shot 004 it translates to upper-left as a corner-callback. The viewer's anchor is stable across the entire opening.

### Checklist (use during scene review)

- [ ] Is there a defined physical environment, not just dark void?
- [ ] Was the stage asset designed *with* the code (empty center / reserved slot)?
- [ ] Is there a "wake" gesture that brings the stage alive before content appears?
- [ ] Does the protagonist arrive via a physical verb (land/stamp/slide), not just "fade in"?
- [ ] Do accessories appear one-by-one as discrete physical objects (not as a generic list)?
- [ ] Is argument text anchored to the artifact, not floating globally?
- [ ] Does the protagonist persist across shots (object permanence)?
- [ ] Does the punchline manifest as a physical gesture by the artifact?

## Network Evolution (Continuous Canvas Thread example)

The same node-connection canvas **transforms across the entire video**. The viewer watches a single network evolve through each act of the argument. Canonical 5-act example — "The Filter":

- **Act 1**: Small isolated clusters hitting coordination boundaries (organisms, wolf packs, chimp troops)
- **Act 2**: Clusters connecting through central "filter" nodes — priests → printing press → newspapers → algorithms. Each transition is a morph, not a cut.
- **Act 3**: All nodes feeding through a single AI compression node → correlated failure (every node flashing amber simultaneously)
- **Act 4**: The hourglass — middle-layer nodes dissolving, top and bottom remaining
- **Act 5**: Multiple competing filter nodes, diverse connections, the system stabilizing in insight color

Same canvas. Same visual language. Evolving state. The viewer watches the argument compute itself.

## Polygon Dossier Reveal Family (Signature-Move Family)

A signature-move family that shares grammar but varies one axis per video — built to satisfy both the Differentiation Principle (memorable signature) and Anti-Tic Calibration (max ~3 sibling variants before the move becomes a tic).

### Grammar (constant across all members)

1. **Pre-fire (-90 → 0 frames)** — a Canvas-Layer polygon brightens via stroke opacity at the channel's locked thesis-land slot
2. **Fire frame** — `<LightFlash>` peaks (12-frame envelope, peakOpacity ~0.78), word-locked to a single sharp syllable
3. **0 → 30 frames** — `<ArtifactBlend>` cross-dissolves the polygon canvas → Register B dossier plate on identical anchor coordinates; CSS drop-shadow grows as the plate "lands"
4. **30 → 60 frames** — citation label types in below the plate (mono `THINKER NAME · DATES` + italic `Major Work · YEAR`)

### One axis of variation per video — the polygon shape

The polygon shape is *not* decoration; it doubles as the **methodological-lineage signal** from the Register B polygon vocabulary. Match the polygon family to the thinker's actual methodological lineage. (See Register B in the Style Register Library.)

### Discipline (load-bearing)

- One signature per video, fired exactly once at the canonical thesis-land beat. Corner-callback variants (see *Most-Recent Dossier Anchors the Corner*) do *not* count as signatures — they are *ambient citation context*.
- Use the **same anchor coordinates** across all family members (the channel's locked thesis-land slot). Repetition is intentional: the channel marks the *thesis-land position* with this signature.
- The lens deviation is **constant across the family** (Portrait-85mm by default). Different lens per member = different move, defeats the family signature.
- Match the polygon *family* to the *thinker's actual methodological lineage*. A square Foucault would be wrong (he's a triangle/vertical-critic). The family encoding only works if it's correct.
- The fire-syllable is the sharpest, most stressed character of the thinker's name. For Chinese names: the third character (the personal name's distinctive syllable) usually works best.

### Anti-pattern

**Lens-axis variation.** Tempting to make episode 2 use Anamorphic instead of Portrait-85mm "for variety." This breaks the family — a viewer reads "different cinematic register" rather than "same family, new thinker." Vary the polygon axis only.

For project-specific deployments, the Polygon Family Completion Meta-Moment, and the founding 4-of-4 vocabulary, see `field-notes.md`.

## Canvas Self-Citation Class (Signature-Move Class)

A second signature-move class that lives alongside the Polygon Dossier Reveal Family. Where the polygon family fires when the video has a *thinker* whose work supports the reframe, the Canvas Self-Citation Class fires when the video has a *structural argument move* WITHOUT a thinker — when the channel's own continuous-canvas thread enacts the reframe through its own geometry.

### The two classes complement each other

| Trigger | Class | What does the reveal? |
|---|---|---|
| Reframe has a thinker citation | Polygon Dossier Reveal Family | Abstract polygon (methodological-lineage marker) BECOMES the citation plate |
| Reframe is purely structural — no thinker, just argument geometry | Canvas Self-Citation Class | Channel's own continuous-canvas geometry ENACTS the argument (1 → 2 paths, direction reverses, many → 1, etc.) |

### Grammar (constant across all members)

1. **Pre-fire (-90 → 0 frames)** — a Canvas-Layer geometric element brightens at the channel's continuous-canvas anchor (NOT the polygon family's DOSSIER_SLOT — typically a separate canvas anchor that's been a thread across prior acts)
2. **Fire frame** — `<LightFlash>` peaks (12-frame envelope, peakOpacity ~0.78 — full signature energy, IDENTICAL to the polygon family for class-cousin readability)
3. **0 → 30 frames** — the geometric element ENACTS the argument move (bifurcates, inverts, collapses, merges, phases — the verb is the sibling identity)
4. **30 → 60 frames** — destination labels / cascade typography types in below

Lens locked at **Portrait-85mm** for every sibling (same as Polygon Dossier Reveal Family — the lens IS the class-cousin signal).

### The five reserved siblings

| Sibling | Verb | Geometry |
|---|---|---|
| **#1 Bifurcation Reveal** | 1 → 2 paths | Single source splits into two diverging arrows |
| **#2 Inversion Reveal** | direction reverses | Arrow rotates 180° around base vertex + gradient cross-fades insight cyan → tension amber |
| **#3 Collapse Reveal** | many → 1 | Many elements compress into a single one (reserved) |
| **#4 Merge Reveal** | 2 → 1 | Two elements unify into one (reserved) |
| **#5 Phase Reveal** | continuous → discrete | A smooth curve discretizes into stepped states (reserved) |

### Discipline (load-bearing)

- One signature per video, fired exactly once at the canonical thesis-land beat. The polygon family and the Canvas Self-Citation Class are MUTUALLY EXCLUSIVE per video.
- Use the **continuous-canvas anchor**, not the polygon family's DOSSIER_SLOT. The viewer's spatial-prediction engine reads "this signature lives where the canvas thread has lived."
- Match the *verb* to the *actual structural move*. A Bifurcation Reveal on a "many → 1" beat is wrong.
- The fire syllable is the sharpest, most stressed character of the structural-move's verbal anchor.

### Anti-pattern

**Redundant verbs.** Two siblings that could be read as the same verb collapse the class. Bifurcation (1→2) and Phase (continuous→discrete) feel similar but aren't — Bifurcation produces TWO distinct outputs from one source; Phase produces a SINGLE discretized output. Distinguish before deploying.

For deployed siblings and project-specific fire syllables, see `field-notes.md`.

## Evidentiary Plate Reveal (Sub-Signature Pattern)

A sub-signature pattern for cited evidence that deserves Register B treatment but should NOT consume the once-per-video Polygon Dossier Reveal Family budget.

### The problem it solves

A video often has multiple cited authorities — one per act-level thesis-land beat, plus one or two *section-level* keystones whose evidence compresses one slice of the argument. The Polygon Dossier Reveal Family fires *exactly once* per video. The Evidentiary Plate Reveal is the middle tier: more than a marginalia card, less than the channel's signature ceremony.

### Grammar

1. **Plate slot glows pre-fire** (~30 frames) — a dashed Register-B-style border outlines the plate slot in tension amber at rising opacity (~0.18 → 0.56). NO polygon brightening pre-fire.
2. **LightFlash fires** with a *quieter envelope* than the signature: **8-frame duration, peakOpacity 0.42** (vs the signature's 12f / 0.78).
3. **0 → ~28 frames**: ArtifactBlend cross-dissolves the blank slot → Register B plate via standard `<ArtifactBlend>`. Canvas side is a dashed outline, NOT a polygon.
4. **~30 → 60 frames**: citation label types in below the plate — same cadence as the signature.

### Distinct from Polygon Dossier Reveal Family by

- **No polygon shape pre-fire** — dashed border outline, not brightening polygon. Reads as "evidence is being placed" rather than "shape is becoming citation."
- **Quieter LightFlash** — 8f / 0.42 vs 12f / 0.78. Roughly half the energy of the signature flash.
- **No mandatory lens deviation** — the shot keeps its existing default lens.
- **Anchor at a different slot** — use a `PLATE_SLOT` slightly offset from `DOSSIER_SLOT`. Even a 60px vertical offset is enough — viewer's spatial-prediction engine reads "this is in the *evidence position*, not the *signature position*."

### Discipline (load-bearing)

- **One Evidentiary Plate Reveal per act, maximum two per video.** Same dilution risk as multiple signatures.
- **Different slot from the polygon family.** Slot consistency within the pattern matters: use the same `PLATE_SLOT` across all Evidentiary Plate Reveals in a series.
- **No polygon halo, no polygon-cross-dissolve.** Creates a fourth ambiguous family member. Dashed border IS the visual identity.
- **Lens stays at the shot's default.** No Portrait-85mm.
- **Citation label cadence is identical to the signature.** Same typography, same spring-in timing. The viewer reads "this thinker's evidence matters as much as the signature thinker's."

### When to USE / NOT use

USE for: section's evidentiary anchor (a quote/source/data point that compresses one slice of the argument); a cited authority whose work supports the section's keystone but isn't the act-level thesis-land; a pre-1900 evidentiary citation.

DON'T USE for: the section's thesis-land (use the Polygon Dossier Reveal Family signature); a brief evidentiary mention in passing (use Marginalia Card); any post-1900 evidentiary artifact (defer to Register C); an additional firing in the *same act* as the polygon-family signature.

### Anti-patterns

- Multiple Evidentiary Plate Reveals in one video (>2)
- Same anchor coordinates as the signature
- Polygon halo around the plate (creates ambiguous family member)
- Loud LightFlash (full signature envelope) — defeats the quieter sub-signature identity

## Most-Recent Dossier Anchors the Corner (Persistent Scaffolding)

A series-level rule for ambient citation context: the most-recently revealed Register B dossier persists at upper-left at ~140×200, ~0.16 opacity, for the next 1-3 shots, until a new dossier is revealed and inherits the slot.

### The rotation cycle

```
Cold Open (Thinker A signature fires)
    ↓ Thinker A persists at upper-left through subsequent shots
    ↓ Thinker A fades into ambient at end of cold open
    ↓
Act 1 (Thinker B signature fires)
    ↓ Thinker A BRIEFLY visible at upper-left ONLY DURING the new fire (the family-pairing moment)
    ↓ Immediately after, Thinker B takes over the upper-left slot
    ↓ Thinker B persists at upper-left through next 2-3 shots
    ↓ (next dossier inherits the slot when the next signature fires)
```

### Why the rotation works (substrate doctrine in action)

- **Free signal density** — the corner callback occupies <2% of frame area but does the work of "this argument is anchored in a specific authority's empirical work." The authority's *presence* persists through the argument-extension shots.
- **Family pairing moment** — when a new signature fires, briefly showing the previous dossier at the corner during the new dossier's reveal creates a methodological pairing the viewer reads pre-verbally.
- **Object permanence across shots** — the upper-left slot becomes the channel's "active citation pocket."

### Implementation

```tsx
// Inside PersistentScaffolding (rendered above shots, below post-FX):

const previousStart = SHOT_OF_NEW_SIGNATURE_START + 30;
const previousEnd   = SHOT_OF_NEW_SIGNATURE_END   - 20;
const newStart      = SHOT_OF_NEW_SIGNATURE_END   + 12;
const newEnd        = LAST_SHOT_OF_SECTION_END    - 30;

const previousP = rise(frame, previousStart, previousStart + 28) *
                  (1 - rise(frame, previousEnd - 24, previousEnd)) * 0.16;
const newP      = rise(frame, newStart, newStart + 28) *
                  (1 - rise(frame, newEnd - 30, newEnd)) * 0.18;
```

### Discipline

- **Fixed slot** — always upper-left, always 140×200, always ~0.16 opacity. Don't relocate across episodes; the slot IS the channel signature.
- **Mutually exclusive** — previous and new dossier should never both be at full ambient opacity. The brief overlap during family-pairing is the *only* time both are visible (and the previous is at lower opacity).
- **Caption format** — under each dossier, a tiny mono caption identifies the source (`— COLD OPEN`, `— § 1.3 EVIDENCE`). Single line, ~10px, `letterSpacing: 3`, `COLORS.textMuted`.
- **Suppress during Negative Cinema** — corner-callback is Cinema Layer ambient context; NC strips Cinema Layer to zero, so the callback hides during NC beats.
- **Don't use for non-dossier artifacts** — only Register B dossier plates inhabit this slot.

### Anti-patterns

- Multiple dossiers in the corner simultaneously (reads as a citation pile)
- Corner-callback at signature-reveal opacity (competes with actual signature)
- Skipping the family-pairing moment (breaks methodological-family encoding)

## Argument-Coded Subtitle (Channel-Level Persistent Treatment)

A channel-permanent running subtitle whose **emphasis runs are color-coded to the channel's semantic palette** (insight / tension / system), so the viewer reads the *argument's structural role* of any phrase before parsing the words. The subtitle is not a transcription — it is the channel's third visual signature, alongside the anchor object and the persistent canvas thread, and it does load-bearing externalization work continuously across the entire video.

### Why argument-code instead of plain caption

The strategy's semantic palette is normally the privilege of **visual primitives** (a node turning amber means "this is under tension"). A plain bottom-center caption inherits zero semantic encoding — it's a transcription that fails the externalization test (it forces the viewer to construct the argument's tension/insight structure mentally from the words alone).

Argument-coding the subtitle promotes the running text to a continuous EC channel:

| What the subtitle externalizes | How |
|---|---|
| Argument's structural role of the current clause | Emphasis-color (tension / insight / system) maps to phrase function (problem / answer / baseline) |
| Pacing of cognitive load | Single-line chunks at clause boundaries — never two lines, never a wall of text |
| Cross-modal sync | Word-locked fade-in to the chunk's first syllable |
| Reading-comfort floor on mobile | Auto-shrink ladder so no chunk ever overflows the line |

A viewer who watches three videos in this format *learns to read the colors faster than the words* — green = the answer, amber = the problem, blue = the substrate. By the third or fourth video the subtitle is operating mostly on the pre-conscious channel, and the conscious channel is freed for the actual argument.

### Mobile-first sizing math (load-bearing)

The constraining viewport is **iPhone landscape**, where a 4:3 video fills the height (~520×390pt on a 14 Pro). Scale factor from native to mobile:

```
scale = mobile_video_height / native_video_height
      ≈ 390 / 1080
      ≈ 0.36
```

Target on-screen subtitle size for sustained 50-min reading: **18-22pt** (below this readers fatigue). Working backward:

```
native_font_size = target_pt / scale
                 = 20 / 0.36
                 ≈ 56px native
```

This sets the **default size at 56px** on a 1440-wide frame — substantially larger than typical desktop YouTube (32-40px). Letter-spacing 0.04em, weight 500, single-line max ~19-20 Han characters at 78% frame width.

### Single-line constraint with auto-chunk

Long sentences split into 3-6 sequential single-line chunks at natural clause breaks (`,。：、；——`). The build pass fits each chunk to a continuous **font-size ladder** (`56 → 52 → 48 → 44 → 40px`), picking the largest size where the chunk still fits in 78% frame width. Hard cap ~28 characters; beyond, build emits an overflow warning for review.

### Emphasis classification scheme

The script's `[强调]` markers (or any equivalent emphasis convention) carry a semantic suffix the build pass reads:

- `[强调]` (or `[强调-I]`) → **insight** — the right answer / thesis advance
- `[强调-T]` → **tension** — the wrong answer / problem / negation
- `[强调-S]` → **system** — baseline / structural fact / unchanging substrate

An emphasis run extends to the next sentence terminator (`。!?` or em-dash) **or** to the next emphasis tag — whichever is closer. Commas/顿号 are *transparent* unless the next emphasis is in the same sentence (in which case they terminate, marking the multi-clause-emphasis intent). Two desirable behaviors fall out:

- Single emphasis spanning a sentence (a keystone like `[强调]每一层级联,都承载着下一层即将压缩的内容。`) emphasizes the whole sentence.
- Back-to-back emphases in one sentence (`[强调]A,[强调]B,[强调]C。`) each cover only their phrase.

### Build pipeline (offline pass)

```
narration.md  +  words/{actId}.words.json  →  subs/{actId}.subs.json
              ↓
        chunked text + emphasis ranges + frame-precise startFrame/endFrame
              ↓
            <Subtitles actId="…" inNCWindow={…} />
```

The build pass does four things:

1. **Strip non-spoken brackets** (`[强调]`, `[短暂停顿]`, etc.) from the narration; record emphasis spans by character position.
2. **Chunk** spoken text at clause boundaries, respecting the single-line + don't-split-emphasis rules.
3. **Align** each chunk's character range to the STT word table via canonical-form indexOf (normalize away decorative chars STT strips: `「」 — · 《》` etc., but preserve `, 。`).
4. **Emit** typed JSON with `startFrame/endFrame/fontSize/emphases` per chunk.

The Remotion component reads the JSON, finds the active chunk for the current frame, renders at locked specs (centered, serif body, weight 700 + semantic color on emphasis spans, soft radial scrim, 8-frame fade-in / 12-frame fade-out, hold during NC).

### Discipline (channel-permanent)

- **Position is locked.** Bottom-center, ~12% from frame bottom — below any halation cone the channel uses for its anchor object, above mobile player chrome auto-hide zone. Don't relocate per-shot; the slot IS part of the signature.
- **Single line, never wrap.** Two-line subtitles fail the constraint — re-chunk at a clause boundary instead.
- **NC behavior wires to `inNCWindow`.** During the channel's 3 NC beats (cold-open pivot / keystone / decision), the subtitle holds without fading and the scrim drops to 0. Caption-static mirrors the camera-static of the strip.
- **Emphasis is semantic, not decorative.** If a phrase doesn't structurally sit in tension/insight/system, drop the emphasis entirely. Don't emphasize "to make it look important."
- **All chunks come from the build pass.** Hand-edits to generated subs files get overwritten on re-build. Edit narration's emphasis tags or the chunking rules instead.
- **Subtitle sits above SceneStack but below post-FX.** Frame-locked (not dollied with the camera), receives the channel's grain texture from above (subtle archival fingerprint on the text).

### Anti-patterns

- **Plain transcription subtitle** — fails the state-offload test. Either argument-code the emphasis or cut subtitles entirely.
- **Subtitle inside `<DollyPush>`** — subtitles are frame-UI, not dollied content. Drift with the camera reads as instability.
- **Two-line wrap** — re-chunk; the constraint is load-bearing.
- **Hard pill / heavy scrim background** — reads as broadcast UI (CC overlay), not as cinema. Use a soft radial dim that fades to transparent.
- **Word-by-word reveal during running narration** — too busy. Word-by-word reveal reserves for moments where the narration explicitly stages a phrase (rare). Default = chunk-block fade-in.
- **Emphasis as ornament** — every emphasis must have a clear tension/insight/system reading. If unclear, default to insight or drop.

### When to use

- **Long-form (8+ min) educational content** where viewers need argument-state externalization across 50-min watch sessions.
- **Mobile-primary distribution** (Bilibili, Douyin long-form, WeChat Video) where on-device reading matters.
- **Channels with established semantic palette** — the pattern requires the channel already uses tension/insight/system color encoding on visual primitives, so the subtitle inherits a vocabulary the viewer is already learning.

### When NOT to use

- **Short-form** (<3 min) — subtitle EC compounds across runtime; short videos don't accumulate enough exposure for color-as-signal to crystallize for the viewer.
- **Channels without locked semantic palette** — emphasis colors will read as decoration.
- **Photographic / live-action register** — pattern is locked to the channel's animated-graphic register.

## Sequential Tile-Reveal (Channel Idiom for Parallel-Concept Lists)

A channel-level idiom for revealing N parallel concepts (typically 3-5) where each concept benefits from a visual anchor. Replaces the "floating SVG dashed-rect pill with text inside" anti-pattern.

### Tile grammar

Each tile = Register A icon (gpt-image-2 PNG) + Chinese label below + tiny mono EN caption.

```tsx
{items.map((s, i) => {
  if (s.p < 0.05) return null;
  const ICON = 170; // 140-180 depending on density; same value across all tiles in a row
  const TILE_W = 220;
  return (
    <div style={{
      position: "absolute",
      left: s.cx - TILE_W / 2,
      top: anchorY - ICON / 2,
      width: TILE_W,
      opacity: s.p,
      pointerEvents: "none",
    }}>
      <Img src={staticFile(s.icon)} style={{
        width: ICON, height: ICON,
        margin: "0 auto", display: "block",
        objectFit: "contain",
        filter: `drop-shadow(0 8px 14px rgba(0,0,0,${s.p * 0.5}))`,
      }} />
      <div style={{ marginTop: 8, textAlign: "center",
        fontFamily: FONT.main, fontSize: 26, fontWeight: 500,
        color: COLORS.text, letterSpacing: 5 }}>{s.label}</div>
      <div style={{ marginTop: 2, textAlign: "center",
        fontFamily: FONT.mono, fontSize: 11, color: COLORS.tension,
        letterSpacing: 4, opacity: 0.85 }}>{s.en}</div>
    </div>
  );
})}
```

### Word-locked sequencing

Each tile's `p` is `rise(localF, beat - 6, beat + 24, easeOut)` where `beat = wf(SECTION_WORDS, item.word) + SECTION_START - SHOT_START`. The anchor word is the **distinctive syllable** of the concept (the second character of a two-character noun usually works: 物理→「物」, 法律→「法」, 抖音→「抖」). Tiles enter on the syllable being spoken — the visual reveal IS the spoken word.

### Discipline (load-bearing)

- **Same icon size across the row** — even with wildly different aspect ratios. Use `objectFit: "contain"`.
- **Three-element vertical structure** — icon + Chinese label + tiny English mono caption.
- **Horizontal arrangement only** — N tiles spread evenly across the central horizontal band. Vertical or grid arrangements destroy the "parallel concepts" reading. ≥6 items: split into two rows or pick a different pattern.
- **Each tile is a unit; never share boxes** — three concepts = three tiles, not one composite.
- **Drop-shadow scales with opacity** — `drop-shadow(0 8px 14px rgba(0,0,0,${s.p * 0.5}))` — gives material weight as it lands.
- **Anchor the tile row to a horizontal datum line** — a plane line, title baseline, or section-divider rule.

### When to USE / NOT use

USE for: N parallel concepts (subjects, institutions, sources, platforms, prerequisites, principles); each concept non-trivial / benefits from visual anchor; concepts revealed sequentially on word beats.

DON'T USE for: single concept reveal (use diegetic stage hero artifact); pure abstract relationships (use Visual Vocabulary primitives); SEQUENTIAL CAUSAL concepts A→B→C (use a flow/arrow composition); ≥7 items (channel-capacity overflow).

### Anti-patterns

- SVG dashed-rect pills with text inside (the V1 default; reads as abstract widget, not encyclopedic concept)
- Mixing tile sizes within a row (one larger tile becomes de-facto hero)
- Skipping the bilingual caption

## Single-Asset Code Replication (Three-Layer Refinement)

For multiplying / cascade / fountain effects (one source → many copies), generate ONE canonical asset via `gpt-image-2` and replicate it N times in code with deterministic per-instance variation.

### The decision rule

If the visual story is "ONE press produces MANY books" (or ONE source → MANY instances), generate ONE book. The code does the multiplying — that's the whole point of the visual story.

### Asset prompt discipline

- Asset should look like **one canonical instance**, not a representative sample of "many"
- Standard 3/4 perspective (so it reads as a 3D physical object that can be tilted)
- Slight intentional rotation in the asset (~3-6°) so it reads as a photographed object, not a stock vector logo
- Magenta `#FF00FF` background, generous margin for cutout safety
- All Register A discipline (faceted low-poly, palette-locked, single amber accent)

### Replication grammar

```tsx
const NUM_INSTANCES = 12;
const ROW_SIZES = [5, 4, 3];
const ROW_SPREAD = [780, 580, 360];
const ROW_Y_OFFSET = [-280, -150, -30];

const instances = Array.from({ length: NUM_INSTANCES }).map((_, i) => {
  let row = 0, col = 0, cumulative = 0;
  for (let r = 0; r < ROW_SIZES.length; r++) {
    if (i < cumulative + ROW_SIZES[r]) { row = r; col = i - cumulative; break; }
    cumulative += ROW_SIZES[r];
  }
  const finalX = sourceX - ROW_SPREAD[row] / 2 + (col / Math.max(1, ROW_SIZES[row] - 1)) * ROW_SPREAD[row];
  const finalY = sourceY + ROW_Y_OFFSET[row];
  // DETERMINISTIC per-instance tilt — index-seeded, not Math.random()
  const tiltSeed = ((i * 73) % 41) - 20;
  const finalTilt = tiltSeed * 0.9;
  const startF = sourceBeat + i * 2;
  const localInstanceF = localF - startF;
  const p = rise(localInstanceF, 0, 32, easeOut);
  return { finalX, finalY, finalTilt, p, row };
});

{instances.map((inst, i) => {
  const x = sourceX + (inst.finalX - sourceX) * inst.p;
  const y = sourceY + (inst.finalY - sourceY) * inst.p;
  const scale = 0.18 + inst.p * 0.42;
  const tiltDeg = inst.finalTilt * inst.p;
  return <Img ... style={{ transform: `scale(${scale}) rotate(${tiltDeg}deg)`, zIndex: 100 + inst.row }} />;
})}
```

### Discipline (load-bearing)

- **Deterministic randomness only** — index-seeded modulo math. Never `Math.random()`. Remotion re-renders frames; non-deterministic positions cause flicker.
- **Stagger over a defined window** — typically 24-32 frames total for ~12 instances at stride 2.
- **Z-order encodes spatial depth** — `zIndex: 100 + inst.row`. Front rows visually occlude back rows.
- **Scale grows during animation** — instances start small at the source (~0.18), grow to full size (~0.6). Reinforces "emerging from" semantics.
- **Tilt also animates** — growing tilt feels physical; static tilt at landing feels frozen.

### When to USE / NOT use

USE for: ONE source → MANY identical-class outputs (press → books, queen → eggs, factory → products, hub → spokes); multiplication is the *story*, not just the visual.

DON'T USE for: each instance meaningfully different (use Tile-Reveal); only 2-3 instances (replication doesn't read); the "many" is conceptually a continuous mass (use particle systems).

### Anti-pattern

**Pre-composed "many" plate** — locks positions, tilts, scales, timing into the asset. Code-replication wins on flexibility, asset cleanliness (one unit of meaning per asset), and reusability.

## Multi-Asset Scene Composition (Default Workflow for Substrate-Rich Scenes)

A scene is rarely one asset. The default workflow is to compose a single scene from **N `gpt-image-2` generations + the Canvas Layer**, where each raster layer plays a distinct role in the substrate doctrine. The cost is one MCP call per layer; the gain is N independent motion tracks, N independent opacity envelopes, N independent register treatments per scene. This pattern is the *positive* form of the asset-decoupling test in Layer Variance — the Layer Variance test catches when you've over-baked; this pattern says **decompose by default, don't wait for the test to catch you**.

### The cost calculus

`gpt-image-2` is the locked image model. Treat it as **low-cost, high-fidelity, high-prompt-adherence**. The marginal cost of one additional generation:

- One MCP call (sub-second to seconds wall-clock)
- One additional asset path to manage
- Effectively zero render-time cost (a static `<Img>` is cheap)

The marginal gain of one additional layer:

- One independent motion track (Layer Variance)
- One independent opacity envelope (substrate dimming for the figure-ground principle)
- One independent register treatment (Register A vs B vs atmospheric)
- Independent anchor coordinates (free composition)
- Independent semantic role in the substrate doctrine (background / mid-ground / foreground / atmosphere)

The cost-vs-gain calculus tilts heavily toward **decompose by default**, **collapse to a composite only when the elements are ontologically one thing** (a face and the hat ON the face; a stamp and the hand stamping it).

### Layer roles

A typical substrate-rich scene composes 3-5 raster layers + the Canvas Layer:

| Layer | Role | Opacity | Register | Motion |
|---|---|---|---|---|
| **Background substrate** | Distant context, environmental establishing | 10-30% | Register A or atmospheric | Slow drift, atmospheric breath |
| **Mid-ground** | Supporting context, secondary subjects | 40-60% | Register A | Medium pace, parallax tied to camera |
| **Foreground subject** | The argument's actor — the protagonist artifact | 80-100% | Register A (or B for cited evidence) | Word-locked, gestural, full motion |
| **Atmospheric overlay** (raster) | Light, fog, particles when raster is needed instead of SVG | 5-15% multiply | Texture/atmosphere register | Continuous low-amplitude drift |
| **Canvas Layer** | Argument primitives, typography, repainting elements, ambient terrain | varies | (code/SVG) | Word-locked, repainting, primitives |

Not every scene needs all 5 layers. A diegetic stage scene may have just stage + foreground artifact + Canvas Layer. A character-in-environment scene may have horizon + figure + Canvas Layer. The pattern is the *default decomposition mindset*, not a quota.

### Workflow

1. **List the layers** before any asset generation. Each layer should have a clearly different role per the table above. If two layers play the same role, collapse them.
2. **Lock the register preamble** (Register A by default) once. Use the **same STYLE block** across all layer prompts in the scene.
3. **Generate each layer as its own `gpt-image-2` call**, varying only the SUBJECT block per layer. The model's prompt adherence is high enough that consistent register + varied subject produces a coherent visual family.
4. **Composite in Remotion** with each layer at its own opacity, motion track, and anchor. The Canvas Layer paints last (per the Three-Layer Architecture in `SKILL.md`).
5. **Apply the asset-decoupling test** as a sanity check (see Layer Variance below) — for each layer pair, can they share one asset without losing argument expressiveness? If yes, collapse them. If no, the decomposition was correct.

### When to USE

- **Substrate-rich scenes** — environments, world-building, scenes where the figure-ground relationship is doing argument work
- **Scenes with independent motion needs** — any element that should move at a different rate than its neighbors must be its own asset (Layer Variance audit at compose-time)
- **Scenes that need atmosphere** — haze, light, distance — where raster fidelity beats SVG approximations
- **Establishing shots** — where pre-conscious channel substrate is doing more work than conscious-channel argument

### When NOT to use

- **Floating Abstract scenes** — composition is intentionally minimal (Canvas + one foreground subject only)
- **Diegetic Stage anchor moments** — the stage IS the substrate by design, generated as one composition-aware asset (with the foreground reserved-empty-zone). See the Diegetic Stage Pattern.
- **Argument-only beats** — Canvas Layer is doing all the work; raster substrate would dilute the focus
- **Brief shots** — if the scene is on screen for under 2 seconds, the substrate richness has no time to land; skip the layering investment

### Discipline (load-bearing)

- **Same register preamble across layers.** Otherwise the layers look like different visual languages stacked together. Lock the STYLE block in a constant; vary only the SUBJECT.
- **Same palette discipline across layers.** All layers use the same hex codes from `STRICTLY LIMITED` palette. Different palettes between layers contaminate the figure-ground relationship.
- **Each layer's role articulable in one sentence.** "This is the *background substrate*." "This is the *mid-ground supporting subject*." If you can't say it, the layer is decoration; cut it.
- **Per-layer motion must be semantically different.** Uniform motion across all layers makes the multi-asset composition reduce to a monolayer (all the cost, none of the gain). See Layer Variance below — at minimum, motion *rate* should differ between background and foreground; ideally other axes too.
- **Opacity envelopes must respect the substrate doctrine.** Background should be visibly *dimmer* than foreground (10-30% vs 80-100%) — without the opacity differential, the figure-ground reading collapses.
- **Compose under the Canvas Layer, not over it.** All raster layers paint between background and Cinema Layer. The Canvas Layer (primitives, typography, word-locked motion) sits on top of all raster substrate. Never inverse.

### Anti-patterns

- **Baking into one composite.** Generating one big `gpt-image-2` asset that "includes" background + figure + atmosphere. Locks in positions, opacity, motion. The asset-decoupling test (see Layer Variance) catches this; the cost of having missed it is the entire shot's expressiveness.
- **Decoupling without semantic role.** N raster layers but no clear role differentiation. Reads as renderer noise. Every layer must answer a question.
- **Mixing registers within one scene.** Register A horizon + Register B figure + abstract atmosphere. The viewer reads three different visual languages stacked together rather than one coherent scene. Pick a register and stay within it across the scene's layers.
- **Forgetting the Canvas Layer.** Going all-raster. The Canvas Layer is mandatory; raster substrate composes *under* it, not *instead of* it. If you find yourself replacing the Canvas Layer with raster, you've left the architecture.
- **Decoupling everything.** N=8 layers per scene. The viewer's brain stops parsing variance as signal and starts parsing as noise (Layer Variance: layer overload). Calibrate to 3-5 raster layers per scene; six is rare; seven is wrong.
- **Ignoring the opacity envelope.** All layers at 100% opacity. Figure-ground relationship collapses; the scene reads as an exhausting busy frame instead of a deliberately layered one.

### Validated case

See `field-notes.md` § Asset decoupling — Migration shot 050 for the canonical case where splitting one composite into figure + horizon (two `gpt-image-2` calls instead of one) gave the shot's argument independent motion. The general rule the case proved: **assume your first composite asset is wrong**. Decompose into multiple raster layers by default; only collapse to a composite when explicitly required by ontology (a face + hat-on-face, a stamp + the hand stamping it, a Register A gate's facets).

## Brand-Direct Artifact Prompting

For well-known brands/logos (Baidu, Douyin/TikTok, Wikipedia, GitHub, Apple), write the brand name **directly** in the `gpt-image-2` prompt. The model knows the visual identity and will reinterpret it in your style register. Do NOT prompt around the brand by describing visual features — the brand name is denser and more accurate signal than your visual description.

### Prompt grammar

```
STYLE — [full Register A or Register B preamble, palette discipline, magenta bg, etc.]

SUBJECT — a low-poly faceted reinterpretation of the BAIDU paw-print logo
(the Chinese tech company's signature mark — a stylized animal paw-print
viewed from above, four oval toe-pads above one larger oval main pad).
The composition reads instantly as 'Baidu / Chinese search engine'.

ANTI-SLOP — NO realistic Baidu blue brand color (re-color into project palette),
NO Baidu wordmark, NO English label.
```

### Discipline (load-bearing)

- **Name the brand explicitly** in the SUBJECT block — model uses the name as primary lookup
- **Brief reminder of the visual identity** in parentheses — anchors the model's recall against ambiguity
- **Re-color into project palette** — the brand's actual brand color is irrelevant; force it via the PALETTE block
- **Anti-slop the brand wordmark** — `NO 'BAIDU' word anywhere` — the model otherwise tends to add it as a "helpful" identifier
- **Re-state in ANTI-SLOP** that the brand's realistic chromatic identity must be suppressed (e.g. TikTok's cyan/pink chromatic-aberration glow)

### When this works / fails

WORKS for: logos with recognizable silhouettes (paw, music-note, swoosh, apple, octocat); internet-famous brands seen many times in the training corpus; app icons with simple identifying shapes.

FAILS for: niche brands the model doesn't know; very generic logos (square with a letter); silhouettes too close to a generic visual category. Fall back to long-form description.

## Inverted Argumentative Pyramid (Diagnostic Shot Layout)

For diagnostic shots that reveal a system's hidden mechanism and land a verdict — composition order top→bottom: **inputs → process → verdict**.

### Composition logic

The viewer's eye moves top→bottom by default in landscape framing. An argument that reads top→bottom IS an argument the viewer parses in argument-order without effort. Top-of-frame = "givens"; mid-frame = "what happens with those givens"; bottom-of-frame = "therefore." The verdict at the bottom carries the argument's gravity.

### Spatial allocation (1920×1080 reference)

| Tier | Y range | Content | Animation timing |
|---|---|---|---|
| **Inputs** (top) | y ≈ 130-360 | 3-5 tile units (Sequential Tile-Reveal) — the prerequisites/causes | Each tile lands on its anchor word, **first** in shot timeline |
| **Process** (middle) | y ≈ 360-820 | The mechanism — planes, particles, bouncing nodes, flow arrows. The "in-between work" | Builds during inputs tier; peaks during punchline word window |
| **Verdict** (bottom) | y ≈ 880-1000 | Large punchline title (52-68pt) + small mono EN subtitle | Fires on verdict syllable, **last** in shot timeline |

### Discipline (load-bearing)

- **Tier order = argument order = reveal order in time.** Tiles first (givens), mechanism builds in middle (the work), verdict lands last (the conclusion). Inverting time order destroys pyramid logic.
- **Verdict is the largest text in the shot** — typically 1.5-2× tile labels' font size. Verdict's *visual weight* must match its *argumentative weight*.
- **Don't put any other foreground content below the verdict** — the verdict needs the bottom edge as its anchor. Persistent footers (`EraFooter`) at y ≈ height-30 are OK.
- **Middle tier can be sparse** — bouncing person nodes, particle streams, mostly-empty space. Don't try to fill the middle; the middle's role is "evidence of the process," not "additional argument."
- **One verdict per shot** — if multiple punchline candidates, pick the one that lands on the section's anchor syllable.

### Anti-pattern

**Verdict-at-top, evidence-below** — reads as "headline + supporting article" — fine for static editorial layouts, wrong for cinematic reveal. Viewer reads the conclusion before watching the mechanism.

## Audio Pre-Buffer Sign Discipline (Section-Transition Pacing)

The pre-buffer between two adjacent narration sections carries semantic meaning **in its sign**: positive adds breath; negative tightens the connection. Small mechanical constant with outsized effect on perceived narrative tightness.

### Implementation

```tsx
// Default SECTION_BREATH (e.g. 18 frames / ~0.6s) is added between every adjacent section's
// audio sequences. PRE_BUFFER_SXX is a per-section signed offset on top of that default.

const PRE_BUFFER_S12 = -8; // tighten 1.1→1.2 — the two sections are one thought
const PRE_BUFFER_S14 =  6; // small breath before the industrial-era pivot

const SHIFT_S12 = PRE_BUFFER_S12;
const SHIFT_S13 = SHIFT_S12;
const SHIFT_S14 = SHIFT_S12 + PRE_BUFFER_S14; // cumulative
const SHIFT_S15 = SHIFT_S14;
const SHIFT_S16 = SHIFT_S14;

export const S12_START = _S12_START_V1 + SHIFT_S12;
```

### The signed-buffer decision rule

| Sign | Final gap (default 18 + buffer) | Use when… |
|---|---|---|
| **−12 to −18** | 0-6 frames (~0.0-0.2s) | Two phrases that are one continuous thought; section break is editorial-only |
| **−6 to −10** | 8-12 frames (~0.27-0.40s) | Tight narrative connection — second section directly extends the first |
| **0** | 18 frames (~0.6s) | Default rhythmic breath — neutral section transition |
| **+6 to +14** | 24-32 frames (~0.8-1.07s) | Genuine breath beat — previous section ends a unit; next opens a new one |
| **+18+** | ≥36 frames (~1.2s+) | Act-level breath, never within an act. Rare; usually between acts via chapter title |

### Discipline (load-bearing)

- **Pair every audio cut with a tail fade** — `AUDIO_TAIL_FADE_FRAMES = 6` (~0.2s linear fade-out on each section's outgoing audio). Without the fade, even +14 buffer can feel "abrupt."
- **Cumulative shifts cascade** — when 1.2 is pulled forward by −8, sections 1.3+ inherit the shift. Either compensate explicitly per downstream section or accept the act ends slightly earlier.
- **Cap shot windows at the next section's start** — when buffer is negative, previous section's last shot's `SHOT_END` can collide with the next section's `SHOT_START`. Cap to eliminate visual overlap.
- **Validate by ear, not by frame count** — frame stills can't audit audio rhythm. Studio scrubbing or quick MP3 export of the relevant minute.

### Anti-pattern

**Uniform positive buffers across all transitions** — comfortable default that flattens narrative tightness. Tight phrases need negative buffers; rhythmic act-internal breaths need positive. Neutral 0 is rarely the right answer.

## Forced-Alignment Robustness (word-lock under unreliable STT)

Word-locks are only as trustworthy as the subtitle timing they read. Forced-alignment STT occasionally **scrambles a window** of chunk start-frames — repeated or similar phrases get mis-ordered, timestamps overlap, the cursor loses its place — so any visual event word-locked inside that window fires on the wrong syllable. The remedy is not to fix the alignment frame-by-frame; it's to design so the corrupt span doesn't carry a word-lock:

- **Derive `anchors.ts` only from verified-monotonic chunks.** Before binding an anchor to a chunk's start-frame, confirm the chunks around it are in order and non-overlapping. A non-monotonic run is a no-anchor zone.
- **Hard-lock only at section boundaries you've verified.** Bind the section-START banner (and any ceremony beat) to a clean, monotonic anchor at the section's first chunk. Section starts are almost always clean even when a section's interior is scrambled.
- **Let a continuous Canvas-layer object carry the corrupt span.** Across the bad window, run a non-word-locked continuous motion (a flow, an aura, a slow build) whose progress is a smooth function of `frame` rather than tied to any chunk. A continuous register makes small per-chunk misalignment invisible — the viewer never perceives a missed lock because nothing was supposed to snap.
- **Document the window in `timing.ts`.** Leave a note naming the scrambled chunk range so a later editor doesn't "fix" it by re-binding anchors into the corruption.

This is the timing-layer instance of the Receiver-Runway principle: when one channel (precise word-lock) is unreliable, lean on a channel that degrades gracefully (continuous canvas motion) so re-entry and comprehension never depend on the broken one.

## Cross-Register Interpolation

The Three-Layer Architecture is presented as discrete categories. In practice the most powerful moves treat them as a **continuum** — sliding between registers mid-shot.

### Three drift axes

**Canvas ↔ Cinema slides.** A Canvas-Layer primitive gradually acquires Cinema-Layer treatment over a defined frame window — grain rises 0 → 0.08, ColorGradeLUT eases from default to "archive" register, slight chromatic aberration creeps in. Argument: "this thing is becoming history." Used at moments where a current-state element ages into archival evidence within one shot.

**Register A ↔ B drift.** A Register A artifact gradually gains Register B parchment tint + cross-hatch texture as the timeline within the video advances. Implementation: cross-fade two pre-generated artifact variants on the same anchor coordinates, or apply Register B atmosphere stack (paper-grain + ink-wash + amber LUT) at rising intensity.

**Canvas ↔ Artifact interpolation.** A Canvas-rendered polygon silhouette cross-dissolves into its Register B dossier PNG on the same pixel coordinates. The viewer watches the *abstract shape* become the *concrete citation*. One of the highest-leverage moves in the system. Pairs naturally with the polygon-vocabulary methodological signal.

### When to use

- **Evolution beats** — something becoming something else within a single shot (era advancing, abstraction concretizing, current-state aging into history)
- **Timeline drift** — narration spans multiple eras; visual register drifts to match without cuts
- **Register reveals** — abstract Canvas placeholder gives way to concrete Artifact evidence; the *transition* IS the reveal

### Discipline (load-bearing)

- **Unidirectional within a video.** Canvas → Cinema, never reverse. Register A → B (toward parchment, toward archive, toward authority), never reverse. Canvas → Artifact, never reverse. Direction matches *argument maturation* — abstract becoming concrete, current becoming historical, structural becoming evidentiary.
- **One axis at a time.** Drifting Canvas→Cinema AND Register A→B AND Canvas→Artifact in the same shot is exhausting.
- **Drift speed encodes mood.** Slow (90+ frames) = aging. Fast (15-30 frames) = recognition. Mid (45-60 frames) = deliberate revealing.
- **Drift completes within the shot** — never leave a half-drifted element exposed at the cut.

### Register-Drift across the video

Cross-Register Interpolation is per-shot. **Register Drift** is the across-video case (see *Video-Arc Drift* in Cinema Layer Vocabularies). Continuous drift parameters spanning the whole video runtime — gate library drifting from clean Register A in the first era → warm Register B parchment-tinted in the middle era → cool Register A again in the present.

**Pairability of drifts:**
- Grain-drift + vignette-drift = OK (both atmospheric)
- Grain-drift + ColorGradeLUT-drift = OK (both register-encoding)
- All three at once = exhausting; viewer's brain stops parsing drift as signal
- Pair drifts that share a *direction* (toward warmer / toward archival / toward mature)

---

# Layer Variance — full protocol

The Three-Layer Architecture and Cross-Register Interpolation are *specific instances* of a more general principle: **a frame is not a canvas; it is a stack of independent canvases.** The art of composition is choosing which canvases to stack, and how much each one is allowed to vary from the others. The **variance itself** is the information channel — every degree of independent motion between layers is one more bit of argument the frame can carry without adding visual weight.

## The principle

When two elements move at the same rate, in the same direction, with the same curve, on the same lifecycle, they read as **one thing**. The moment their motion differs along *any* axis, the *difference itself* becomes a semantic signal. Most "rigid" frames aren't rigid because they lack motion — they lack motion *variance*. Adding more uniform animation to a monolayer doesn't fix it; only decoupling does.

## 11 axes of variance

Each is a degree of freedom you can spend on argument:

- **Rate** — fast layer over slow layer encodes urgency-vs-permanence (a body moving across a still city)
- **Direction** — opposing translations encode opposition or counter-flow (workers walking left while capital flows right)
- **Scale change** — one layer grows while another shrinks encodes inversion (rewards shrinking as effort grows)
- **Motion curve** — linear (mechanical) over spring (alive) encodes regime difference (institution-time vs human-time)
- **Phase** — same frequency offset between layers encodes call-and-response or alternation
- **Frequency** — different oscillation rates encode different temporal scales coexisting (heartbeat-fast vs civilization-slow)
- **Lifecycle** — one persists, one is transient encodes permanence vs moment (the system stays, the protagonist passes through)
- **Reference frame** — world-fixed vs camera-fixed vs narrative-fixed encodes different vantages stacked in one frame (Wendover-style label-over-pan: labels camera-fixed, map world-fixed)
- **Perspective transform** — fisheye on one layer, anamorphic on another encodes regime collision
- **Color register** — one layer in tension, another in system encodes a *semantic conflict layer* the viewer reads pre-verbally
- **Animation pipeline** — Canvas-deterministic vs Artifact-static vs Cinema-post-processed (the Three-Layer Architecture is this instance applied at the macro scale)

## Layer variance encodes argument

| Variance pattern | What the viewer reads |
|---|---|
| All layers move identically | unified thing, one organism |
| One layer moves, others still | the moving layer is the **actor**, the still layers are the **world** |
| Two layers move at different rates | relationship between two things at different temporal scales |
| Two layers move in opposite directions | conflict, opposition, counter-flow |
| Foreground fast, background slow | parallax depth — perspective from differential motion alone |
| Layers at different motion curves | different physics — different regimes coexisting |
| One layer in spring, another in decay | alive-vs-dying simultaneity |
| Layer cycles overlap then phase-shift | the reframe moment — what was synced is no longer |

## The decoupling protocol

For any new shot, before assembling the composition:

1. **Identify each element's narrative role.** Actor? World? Signal? Ambient? Witness? Ground?
2. **Assign a temporal cadence to each role.** Constant (no change), slow (atmospheric breath), medium (human breath), fast (event), word-locked (narration-tied), event-triggered (one-shot).
3. **Group elements with shared cadence into a layer.** Each layer gets its own animation logic.
4. **Decouple when grouping destroys meaning.** If an element's role demands a motion different from its neighbors, split it out.
5. **Couple when decoupling fragments meaning.** If two elements should read as ONE thing (a face and the hat ON the face, a stamp and the hand stamping it), keep them in one asset/layer.

## The asset-decoupling test (raster assets, load-bearing)

`gpt-image-2` is the locked image model — **low-cost, high-fidelity, high-prompt-adherence**. The cost of one extra asset call is roughly one MCP round-trip. The cost of an under-decomposed composite is the entire shot's expressiveness. Given this asymmetry, the **default mindset for any raster scene is "decompose, don't bake."**

This test is the *negative-form* sanity check (catches over-baked composites); the *positive-form* of the same principle is the **Multi-Asset Scene Composition** pattern above (decompose by default — list the layers before generating any of them).

Concretely, after generating any composite raster asset, ask: *which sub-elements need to move at different rates than their neighbors? Which need different opacity envelopes? Which play different substrate roles?* If any element's role demands an independent motion track, opacity, or register, it should be a SEPARATE asset, not a sub-region of a composite. **The threshold for splitting is low** — one extra MCP call per layer buys an entire degree of expressive freedom.

The general rule: **assume your first composite asset is wrong**. Run the decoupling test before committing. The question is never "is this asset good?" — it is "is this asset the right *unit of independent motion* for the shot's argument?" When in doubt, decompose; collapse to a composite only when the elements are ontologically one thing (a face and the hat ON the face, a stamp and the hand stamping it, a Register A gate whose facets are its identity).

## Hierarchy of layer separation (cheapest to deepest)

Pick the shallowest level that still earns the argument:

1. **Sibling DOM/SVG elements with different transforms.** First level of decoupling. Cheap; suitable for primitives sharing one asset's coordinate system.
2. **Separate raster assets composited together.** Each asset gets independent motion tracks. Costs an extra MCP call per split element.
3. **Different reference frames per layer.** Some layers fixed-to-camera (HUD-style), others fixed-to-world. Wendover-style label-over-pan pattern.
4. **Different rendering pipelines per layer.** Canvas (deterministic) + Artifact (static-but-dwelt-on) + Cinema (post-compositional). The Three-Layer Architecture at macro scale.
5. **Different time coordinates per layer.** Some layers in slow-time, others in normal-time, others in event-time only. Used for reflective beats where ambient continues while a single artifact is "frozen" mid-gesture.
6. **Different perspective transforms per layer.** Fisheye on one, anamorphic on another. See Cross-Register Interpolation for the per-shot case.

## Cases where coupling wins

Decoupling everything is not the answer. Keep things in one asset/layer when:

- The elements are *ontologically one thing* (a face and the hat ON the face — splitting risks the hat appearing to float independently)
- The elements participate in a *single rigid gesture* (a stamp + the hand stamping it — animating on different tracks would destroy the gesture)
- The decoupling would add complexity without adding expressiveness (no axis of independent variation that earns its way into the argument)
- The asset is a unit of *recurring identity* (a Register A gate must stay together — its facets are its identity)

## Anti-patterns

- **Monolayer composition.** Everything rendered in one coordinate system, all animations applied to the entire frame. No internal degrees of freedom. Most beginner Remotion compositions ship as monolayer. Symptom: adding more animation parameters doesn't fix the rigidity. Fix: decouple, don't decorate.
- **Layer overload.** 8+ independent motion rates simultaneously. Viewer's brain stops parsing variance as signal and starts parsing it as noise. Calibrate to **2-4 distinct motion rates per shot**, each with a clear semantic role.
- **Decoupled-but-undirected.** Splitting elements into layers that vary *randomly*. Reads as renderer noise. **Every variance must answer a question.** If you can't say "this layer moves differently *because* X," cut the variance.
- **Homogenized motion.** All layers using the same easing curve, period, amplitude — decoupled in code, coupled in feel. Reads as monolayer despite engineering cost.
- **Wrong-axis decoupling.** Splitting figure and clothing when what you needed to split was figure and *background*. The split must align with the argument's actual layer cuts, not with whatever was easiest to decompose.

## The recursive application

Layer Variance applies at every scale. The Three-Layer Architecture is the *macro* instance (Canvas / Artifact / Cinema). Within the Canvas Layer, primitives can themselves be decoupled (a node breathes at one rate, the connection it sits on pulses at another, the boundary around them shatters at a third). Within an Artifact, sub-elements can be decomposed for independent animation if the argument earns it. Within the Cinema Layer, grain, vignette, ColorGradeLUT, and atmosphere overlays each have their own drift rates.

Don't decompose more than the argument requires — but always know that you *could*, and ask whether the next decomposition would buy a degree of expression you currently lack.

---

# Cinema Layer Vocabularies

The current `MorphMode` set (`dissolve`, `zoom`, `push-left`, `push-right`, `pull-focus`, `expand`) covers neutral transitions — useful for ~70% of cuts. The Cinema Layer adds *charged* moves, each tied to a specific argument beat. Picking the right register IS picking the argument-beat label.

## Transition Vocabulary (11 charged transitions)

Format: visual character → when to use → implementation hint → example beat.

| Transition | Visual character | When to use | Implementation hint | Example beat |
|---|---|---|---|---|
| **Wipe (linear / diagonal / radial)** | Hard edge sweeps across, revealing next shot beneath | "And then…" — sequential reveal of a continuous action; argument adds a step | Animated `clip-path: inset()` or SVG `<mask>` with moving rect; diagonal = 45° rotated mask | "Rule 1 wipes off → Rule 2 wipes on" |
| **Iris-in / Iris-out** | Circular aperture closes to a point or opens from one | Ceremony — focus narrowing to a single artifact, or opening from one | `clip-path: circle(Npx at cx cy)` animated 0% → 100% | "Open on the dossier seal → iris-out reveals the full archive" |
| **Whip-pan** | Sudden horizontal motion blur sweep, ~6-10 frames | Sudden topic jump, energetic cut, "meanwhile…" | `translate3d(±100vw)` + `filter: blur(20px)` on exit, mirrored on entry | Cut from "Europe 1450" to "Beijing 1450" — same century, different continent |
| **Glitch / RGB-split** | Brief horizontal slice displacement + chromatic aberration spike | System failure, prediction-error rupture, AI-era discontinuity ONLY | SVG `feColorMatrix` channel offsets + `feDisplacementMap` flicker over 4-8 frames | "Credentialed door breaks → glitch → AI bifurcated gate replaces it" |
| **Ink-bleed / Brush-wipe** | Organic black ink spreads following a brush-shaped mask | Hand-authored register transition — entering or leaving Register B | SVG `<mask>` with PNG brush atlas + animated mask scale/translate | "Body shot dissolves to ink → ink lifts to reveal the Bourdieu plate" |
| **Paper-rip / Tear** | Frame edge tears along an irregular path, peeling to reveal next shot | Archive register entry — "the document is being opened" | SVG path mask with jagged edge + slight rotation as it peels | "Modern desk tears to reveal a 1450 woodcut underneath" |
| **Shutter / Blink** | Brief frame-wide black flash (8-14 frames), like a camera shutter | Punctuation, breath, scene reset — softer than section breath | Full-frame black `<AbsoluteFill>` with springed opacity 0 → 1 → 0 | Between act 1 and act 2 |
| **Light-flash** | Bright white/warm flash (6-12 frames) overwhelms the frame, then settles | Revelation, the click moment — *the* thesis lands | `radial-gradient` overlay with springed opacity, optional bloom + chromatic shift | "Not entertainment, not communication — *coordination infrastructure*" — flash on the reveal |
| **Particle-dissipate** | Exiting frame's elements break into ambient particles that drift and fade | System disintegration, fade into ambient | Canvas particles inheriting positions from exiting elements + drift with `springValue` | "The institution dissolves into the ambient particle field" |
| **Dolly-zoom (Vertigo)** | Background scales while foreground stays put — perceptual destabilization | Perceptual rupture, the reframe moment — "you thought you were looking at X; you're looking at Y" | Two layers with opposing scale springs (foreground 1.0→1.0, background 1.0→1.4) | "This isn't a technology story → *it's a civilization story*" |
| **Cross-zoom (push-in + pull-out simultaneously)** | Outgoing scales up and fades; incoming scales up from small and fades in | Between-act bridges — momentum carried across a major argument shift | Layer A `scale 1 → 1.4` + opacity `1 → 0`; Layer B `scale 0.7 → 1` + opacity `0 → 1` | Act 2 → Act 3 transition |

**Default rule:** if you can't justify a charged transition, use a neutral one. Charged transitions get one or two uses per video each.

**Pairing with cut-timing rules:** the Cinematic Transition Architecture rules in `SKILL.md` (mid-sentence cut, J-cut, L-cut, hard cut, section breath) tell you the *cut timing*. The Transition Vocabulary above tells you the *cut treatment*. They compose: e.g. "L-cut + ink-bleed" = new visual ink-bleeds in while old narration finishes; "hard cut + glitch" = a hard cut whose hardness is amplified by glitch.

## Atmosphere Vocabulary

Parallel to the Visual Vocabulary (6 Primitives). Where primitives compose the *foreground argument*, the Atmosphere Vocabulary composes the *background world* — the spatial, textural, lighting cues processed pre-consciously.

| Effect | Visual character | When to use | Implementation hint | Example beat |
|---|---|---|---|---|
| **Gradient mesh** | Multi-stop radial gradients overlapping at low opacity, organic color zones | Establishing shot of an act; setting mood without naming it | 3-5 SVG `<radialGradient>` layers in palette colors, each at 8-15% opacity, deliberately offset | "Open the act with a faint warm pool in lower-left, cool pool upper-right — tension already in the world" |
| **Film grain** | Animated noise texture at 4-10% opacity, ~20-40 fps cycling pattern | Register marker — quiet on Canvas-only beats, stronger on Artifact beats, intense on tension beats | SVG `<feTurbulence>` with animated `baseFrequency` + multiply blend at low opacity | "Bourdieu dossier appears → grain rises to 8% during his beat → drops back to 4% when we leave him" |
| **Geometric pattern overlay** | Faint repeating pattern (dot grid / hatch / halftone / era-specific motif) at 3-8% opacity | Era / register encoding — different patterns for different eras across the video | SVG `<pattern>` element tiled across `<AbsoluteFill>` with multiply blend | "1450 beat: copperplate hatch overlay; 2026 beat: faint dot-matrix grid" |
| **Volumetric light shaft / god-ray** | One or more soft directional gradients suggesting a single off-screen light source | Focal direction, dramatic single-source moment — "the spotlight" | Long thin `<linearGradient>` rect rotated to angle, blurred, blended at 12-20% opacity | "Hero reveal of the Bourdieu plate — single warm shaft from upper-left lights only the plate" |
| **Decorative frame border** | Persistent border treatment that signals register (copperplate, terminal, dossier) | Register cue when an Artifact takes the full frame | Per-register SVG/PNG border component wrapping the artifact slot | "Register B plate gets the copperplate frame; Register C terminal gets a dark monospace frame" |
| **Vignette dynamics** | Ambient corner darkening *breathes* — slowly intensifying on tension, opening on insight | Mood shifts that should operate below conscious attention | Animate existing radial vignette's outer-stop opacity with `springValue` over 30-60 frame windows | "Particle color shifts system → tension AND vignette tightens 8% — the viewer feels the squeeze without naming it" |
| **Paper-grain overlay** | Subtle warm-toned paper texture at 3-6% opacity over full frame | When the camera "is reading" an Artifact — extends Register B's parchment beyond the artifact's edges | SVG `<feTurbulence>` tinted with paper hue, multiply blend, optional slow drift | "Camera dwells on the Foucault plate → paper-grain bleeds onto Canvas around it" |

**Discipline:** atmosphere obeys the semantic palette. Every gradient mesh, god-ray, grain tint must use the project's `system` / `tension` / `insight` / `text` / `background` colors (or a neutral within ~5% of `background`). Saturated atmospheric color (purple, neon green, magenta) destroys the semantic encoding.

**Atmosphere intensity scale:** every atmosphere effect has a 0-100 dial.
- **Ambient** (~5-10%): viewer notices nothing consciously but the frame feels grounded
- **Charged** (~15-25%): viewer notices and the effect carries narrative weight
- **Peak** (~35-50%): one or two moments per video maximum — the effect IS the argument

## 3D / Spatial Move Vocabulary

We are not making 3D animation. **3D is seasoning, not the dish.** A few well-placed perspective moves transform a flat composition into something that reads as *photographed*; full 3D scenes destroy honest abstraction.

| Move | Visual character | When to use | Implementation hint | Example beat |
|---|---|---|---|---|
| **Perspective wrapper** | Frame (or single element) sits in CSS 3D space, tilted slightly off picture plane | Any time a single artifact deserves to read as a *physical object* the camera observes | `transform: perspective(2000px) rotateX(Nº) rotateY(Nº)` on a wrapper div with `transform-style: preserve-3d` | "Bourdieu dossier sits at 6° rotateY — reads as a card on a desk, not a sticker on a wall" |
| **Depth parallax** | 2-4 layers at different "Z depths" drift at different rates as camera virtually pans | Establishing shots, world-building moments | Each layer translates `-N * cameraX` where N encodes Z; use existing `AudioOffsetCtx` or frame-driven `cameraX` | "Pan across the migration timeline — terrain at 0.3×, mid-ground gates at 0.7×, foreground particles at 1×" |
| **Card flip** | Element rotates 180° on Y-axis, revealing back face | Register transition — Canvas-Layer placeholder flips to reveal Artifact-Layer plate | `rotateY(180deg)` with `backface-visibility: hidden` on both faces; spring the rotation | "Citation pill flips → Bourdieu dossier plate appears on back face" |
| **Page turn** | Flat element peels off-screen along a curved path, revealing what's beneath | Sequential reveal across pages of a document, era-by-era reveal | SVG `<mask>` with animated curve + perspective wrap on peeling layer | "Era 1 plate peels off → Era 2 plate beneath; the *act* of turning a page IS the argument" |
| **Tilt-on-beat** | Small (3-8°) Y or X rotation snapping in on a stressed word, settling back over 20-40 frames | Word-locked emphasis without disrupting reading | `useCurrentFrame()` + `springValue` driving `rotateY` or `rotateX` triggered by `wf("word")` | "Tilt 4° on the syllable '梯' as the migration arrow fires" |
| **Dolly push** | Whole canvas scales up smoothly (1.0 → 1.06 over 60-120 frames) | Slow intensification, drawing the viewer in across a single shot | `transform: scale()` driven by long `springValue` or `interpolate` ramp | "Slow dolly push during Bourdieu narration — frame closes in as argument tightens" |
| **Truck (lateral)** | Whole canvas translates horizontally over a slow ramp | "We are scanning across the world" — extends Continuous Canvas thread spatially | `translateX()` driven by slow `interpolate` ramp; pair with parallax for depth | "Truck right across the gate library — each gate enters from right, exits left" |
| **Pedestal (vertical)** | Whole canvas translates vertically | Reveal of something above or below — extends the era-staircase metaphor | `translateY()` driven by `interpolate` ramp | "Pedestal up from the modern desk to the historical timeline above" |
| **Crane** | Combined truck + pedestal + slight rotation/scale | Major moves between sections — the "camera arrives" feeling | Composition of the above; usually 90-150 frames | "Open the act with a crane down from the title to the establishing shot" |

**Anti-pattern: full 3D scenes.** Every element in true 3D space with lighting and camera physics is a different register. We use 3D to season *flat compositions*, not replace them. Hint: if you find yourself adding a third light source, you've left the register.

**Combination rule:** dolly push + tilt-on-beat + perspective wrapper is the canonical "Dossier Ceremony" combo. Don't reinvent; lock named combos as signature moves.

## Hand-Drawn / Organic Vocabulary

The deterministic SVG canvas can feel sterile after a few minutes. Hand-drawn vocabulary inserts organic, human-authored marks at *specific* moments to break determinism — without breaking the trust the deterministic Canvas earns.

| Element | Visual character | When to use | Implementation hint | Example beat |
|---|---|---|---|---|
| **rough.js highlight / underline / circle** | Hand-drawn marker stroke around or under a word | Word-locked emphasis on argument-bearing text — "underline this" moment | rough.js + Remotion as documented in the `remotion-article-highlight` skill — DO NOT duplicate that skill here | "Underline 'compression' as the narration says it — mark draws on the syllable" |
| **Brush-stroke reveal mask** | Organic brush-shaped mask reveals an element instead of a clean fade | Register B plate entrances; ceremony beats that need texture | SVG `<mask>` with PNG brush atlas + animated mask `transform` | "Bourdieu plate brushed in over 30 frames — brush stroke IS the entrance" |
| **Ink-wash overlay** | Single-color (warm grey or amber) ink wash texture as a tinted layer | Register B beats — "we are inside an archive" feel | PNG ink-wash texture at 8-15% opacity, multiply blend | "Behind the Foucault plate, faint amber ink wash bleeds into corners" |
| **Charcoal / sketch mode** | Element re-rendered with rough edges + cross-hatched fill, sketched | "This is a hypothesis / draft / contrast to the formal version" — explicit register choice | rough.js for outlines + SVG hatch patterns for fills | "Show the *wrong* model in charcoal sketch register → dismiss it → reveal the correct model in clean Canvas register" |

**Discipline rule (load-bearing):** **hand-drawn never decorates a Canvas-Layer primitive.** A node never gets a brush border. A connection never wobbles in rough.js style. A boundary stays an angular SVG shape. Hand-drawn lives on:

1. Artifact-Layer documents (Register B plate entrances, Register A ceremony reveals)
2. Full-frame transitions (ink-bleed, brush-wipe)
3. Negation-then-reveal "wrong answer" content (charcoal sketch mode for dismissed answer; clean Canvas for reveal)

The Canvas stays deterministic so the *argument* stays trustworthy. The Cinema Layer stays organic so the *frame* stays human. Crossing those streams collapses both.

## Lens Personality System

CSS `perspective` distance is treated in the first pass as a *parameter* — pick 2000px and move on. Treating it as a **first-class vocabulary** unlocks one of the cheapest signature axes available.

The five canonical lenses lock perspective values, distortion treatments, and per-lens use cases. Pick *one* default lens for the channel (Director's Sheet → "default lens") and earn each deviation.

| Lens | Perspective | Distortion | Personality | When to use |
|---|---|---|---|---|
| **Wide-21mm** | `perspective: 1400px` | Subtle barrel at frame edges (`feDisplacementMap` at scale 4-6 on edge mask) | Epic, panoramic, "we are somewhere" | Establishing shots, maps, scale reveals, era-staircase montages |
| **Normal-50mm** | `perspective: 2400px` | None | Documentary, neutral, the default | The 70% case — argument-bearing shots where the lens should be invisible |
| **Portrait-85mm** | `perspective: 4000px` | Compressed depth (no distortion, but parallax stack reads flatter) | Intimate, focused, "the camera cares about this single thing" | Artifact close-ups, dossier hero reveals, single-element thesis beats |
| **Fisheye-8mm** | `perspective: 700px` | Strong barrel (`feDisplacementMap` scale 12-18 across full frame) | Disorienting, ruptured, "the world has bent" | AI-era discontinuity, prediction-error ruptures, glitch-rupture pairings, ONE moment per video maximum |
| **Anamorphic** | `perspective: 2000px` | Horizontal scale 1.05 + vertical squeeze 0.97 + horizontal lens-flare bias | Cinematic register, hero scenes, "this is the show, not the homework" | Thesis landings, signature-move beats, title card and end card |

**Pairings.**
- Wide-21mm + LightLeak + crane move = epic establishing
- Portrait-85mm + Halation + DollyPush = artifact ceremony
- Fisheye-8mm + Glitch + chromatic aberration = the rupture frame
- Anamorphic + LightFlash + horizontal flare = thesis land

Each pairing is a complete sentence in lens-character grammar.

**Discipline.**
- One lens deviation per shot maximum. Mid-shot lens changes = nausea, not signature.
- Fisheye-8mm and Anamorphic are *charged* lenses — earn each use as you would a glitch transition.
- Lens character must be locked at the SceneShell wrapper level, not per-element.
- The default lens is the channel's *voice*. Drifting it drifts the channel personality — don't redefine without a reason.

## Meta-Canvas / Brechtian Vocabulary

The canvas *acknowledging itself* — visible construction, visible scaffolding, visible labelling. Brechtian theatre, applied to explainer video. High-leverage for pedagogical and methodological beats; toxic for argument-landing beats. Use surgically.

| Move | Visual character | When to use | Anti-pattern |
|---|---|---|---|
| **Visible grid reveal** | Composition grid (rule-of-thirds + power points) animates in for 30-60 frames, then dims | Marking a structural beat — "here's the architecture of what we're about to do" | Grid visible during argument beats — turns the video into a tutorial about itself |
| **Visible construction** | Diagram builds with construction scaffolding visible (anchor points, snapping indicators, measurement lines) for the build duration; scaffolding fades after | Method beats — "this is how the thinking gets assembled" | Scaffolding kept visible after the build — clutters the argument |
| **Brechtian label** | Label points at an element with stage-direction text and dissolves out as the element acquires its real treatment | Pedagogical reveals where the *act* of representation IS the lesson | Brechtian labels stacked on multiple elements simultaneously — frame becomes debug overlay |
| **Margin note** | Editorial-style commentary in the frame margin, parallel to main content (like a Kindle highlight's pencil note) | Author voice as second channel — when narrator's tone differs from canvas's tone | Margin notes that compete with narration — pick one channel for any given beat |
| **Index shot** | Single establishing shot whose only job is to be a *menu* of the next 8 shots, each numbered | Opening establishing for an act with numbered structure; act-end recap | Index shots used as a crutch for unclear narration — fix the narration first |

**The Brechtian principle.** When a Meta-Canvas move fires, the video is saying "I see myself; you should too." Powerful but specific tone — works for method, methodology, and pedagogy beats. Fatal during argument-landing beats, where the viewer must trust the canvas as world.

**Discipline.**
- Maximum one Brechtian beat per act.
- Brechtian moves are *additive* to the existing canvas — never replace canvas content, they *annotate* it.
- Brechtian text must use a clearly different typography register from the canvas's normal typography (mono if canvas uses sans; smaller; lower opacity).
- Index shots can only callback shots that have actually played — never preview unplayed content (that's a teaser, not an index).

## Environmental / Diegetic UI

UI elements that live *inside* the world, not floating over it as HUD. Viewer reads them as world-furniture, not interface — costing almost nothing of the conscious 50 bits/sec channel.

| Move | Visual character | When to use |
|---|---|---|
| **Terrain-painted progress** | Progress indicator drawn into ambient terrain silhouette itself (slight color or amplitude shift along terrain encoding shot index / video runtime) | Subliminal pacing cue across an act or video |
| **Object-attached labels** | Dossier plate moving across frame carries its label *with it*; label position follows the object's spring animation, not a fixed HUD slot | Whenever a labelled object is in motion. Static-label-on-moving-object reads as broken |
| **In-world timestamps** | Era / year markers appear as engraved marks on the migration vector line itself, not as floating UI text in a corner | Timeline shots, era progression, anywhere the time axis is geometrically visualized |
| **Diegetic decision paths** | At a bifurcation (the AI gate), decision paths render as visible terrain branches | Branching arguments, fork-in-the-road moments. The narration *names* the choice the geometry already showed |
| **Embedded measurement** | Scale bars, axis ticks, comparison rulers integrated into canvas geometry rather than overlaid as chart-chrome | Data-bearing shots where the measurement IS part of the world being measured |

**Why it works (substrate doctrine).** Floating HUD UI competes for the conscious bandwidth that argument and narration also need. Diegetic UI is parsed by the spatial-processing channel (pre-conscious, massive bandwidth, ~free). Viewer reads it as *world*, not as *interface* — and trusts world more than interface.

**Discipline.**
- Diegetic UI must survive frame-level inspection — pause on every fifth frame and ask "does this label still belong to its object?"
- Diegetic UI must move *with* the element it describes. Lag of even 2 frames reads as a HUD bug, not direction.
- Diegetic UI must obey project palette and typography. Different font breaks the world-furniture illusion.
- Diegetic UI is the *default*. HUD UI must be *justified*.

## Recursive / Self-Referential Shots

Shots that contain themselves, or reference earlier shots via self-similarity. Among the highest-leverage moves in cinema (2001, Inception, every Wes Anderson) and almost completely absent from explainer-video vocabulary. Use rarely; each use should be unmistakable.

| Move | Visual character | When to use |
|---|---|---|
| **Picture-in-picture callback** | Small inset (15-22% of frame height, corner-anchored, dimmed to ~50%) showing the *exact frame* that introduced the current concept, with thin label "as established in [shot 014]" | Whenever a current concept *requires* the viewer to recall an earlier specific frame for the argument to land. Replaces verbal "remember when we said…" with visual proof |
| **Chapter re-open** | Act-opening establishing shot revisited at act-closing beat — same camera position, same composition — but with evolved canvas state inside it | Act-end summaries. The *same shot* acquires new meaning by virtue of the act's intervening work |
| **Match-dissolve across scales** | Hexagon at macro scale dissolves to hexagon at micro scale. Shape persists; scale moves 6 orders of magnitude | Argument moves that cross scale (macro → micro, individual → systemic). The match-dissolve IS the argument that the same structure operates at every scale |
| **Video-within-video** | Screenshot of the *current* video playing inside the current video, at a moment in a meta-callback context. Used once at most across an entire series | The "this very video is an example of what we're discussing" moment. So intrusive that overuse destroys the channel's relationship with the viewer |
| **Droste frame** | Recursive inset containing the frame containing the frame, fading recursion inward | Reflexive moments — viewer is asked to think about thinking, or video is asked to think about itself. Once per series. Maybe once ever |
| **Cold Open Echo** | At the OPEN of the channel-close act, the cold open's signature artifact briefly re-fires at its original anchor (~0.55 opacity, 60-frame visible lifetime, sub-signature LightFlash 8f / 0.42). Channel literally closes its 600-year (or whatever-scope) circle | Episode-closing act's open beat, where narration explicitly says "back to where we started." Eligible only if the cold open itself fired a signature artifact at the same channel-locked anchor. Once per video maximum |
| **Closing Signature Gesture** | At the §X.3 channel-close beat, the channel's continuous-canvas thread (the protagonist geometry across all prior acts) performs ONE LAST move (typically inheriting its inverted/end state from the act's signature reveal), then COLLAPSES inward to a point at its base vertex (scale 1 → 0 over 24-30 frames). After collapse, EVERYTHING strips to Deep NC | The single most-stripped moment of the episode-close act. Pairs only with Deep NC. Once per video maximum |

**The discipline of recursion.** Recursive moves are signature-grade — each use should be plotted at the channel level (Director's Sheet → "recursion budget: 1/video for PiP callback, 1/series for video-within-video, 1/series for Droste, 1/video for Cold Open Echo, 1/video for Closing Signature Gesture"). Overuse turns recursion into a vanity tic; correct use makes the channel feel constructed by a mind, not a pipeline.

**Implementation cross-reference.** PiP callback requires a `<ShotSnapshot shotId frame>` component (planned in `recursive.tsx`).

## Video-Arc Drift

Cinema Layer parameters that change *continuously across the entire video*, not per-shot. The viewer doesn't consciously notice, but the mood arc is embedded in the physics of the frame. One of the cheapest cohesion mechanisms in the system: zero per-shot authoring cost; massive subliminal payoff.

| Drift axis | What changes | What it encodes |
|---|---|---|
| **Grain hue drift** | Film grain hue interpolates from neutral-grey at video start to warm-amber at end (or whatever direction matches argument arc) | Era accumulating; weight of evidence; "we have travelled a long way" |
| **Vignette intensity drift** | DynamicVignette baseline rises during tension acts, releases at resolution acts | Subliminal stakes — frame literally tightens as argument tightens |
| **Grade temperature arc** | ColorGradeLUT interpolates continuously from cool → neutral → warm (or vice versa) across acts | Temperature arc tied to argument arc; cool starts feel investigative, warm endings feel resolved |
| **Particle density drift** | Ambient particle count varies slowly (e.g. 22 at start → 38 mid-video → 18 at thesis-land) | World density tied to stakes — the world fills as complications mount, empties as thesis lands |
| **Lens drift** | Lens personality drifts from Wide-21mm (early, establishing) to Portrait-85mm (late, intimate) across video runtime | The camera grows closer as the argument grows more personal |

**Implementation.** All drifts are `lerp(videoProgress, startValue, endValue)` where `videoProgress = currentShotIndex / totalShots`. A single `<VideoArcProvider>` context at the composition root supplies normalized progress to every effect; each drift hook reads it. Per-shot authoring cost: zero.

**Discipline.**
- **One or two drift axes per video, maximum.** Drifting all five simultaneously is exhausting.
- **Drift direction must align with argument direction.** Grain warming over a video where the thesis is "we are growing colder" reads as renderer noise.
- **Drift completes by the second-to-last shot.** Final shot should hold its drifted state, not still be drifting.
- **Drift is invisible to per-shot review.** When reviewing individual shots, drift will look subtle to the point of imperceptibility; it only reads in full-video playback.

---

# Channel-Level Contracts

Channel-level decisions that, once made, persist across episodes. Lock them early in `DIRECTOR.md`; treat unjustified deviation as a bug.

## The Differentiation Principle

Every video must carry **one signature cinematic move** the viewer remembers — usually a Cinema-Layer choice (specific transition, specific 3D arc, specific grain treatment, specific ink-wipe), not a Canvas-Layer one. Ask, before shotlisting:

> "If a viewer screen-records 5 seconds of this video and shows it to a friend, what is the one move they'll talk about?"

If you can't answer in one sentence, the video has no Cinema-Layer thesis yet. Pick the signature before you build the shots; the rest of the Cinema-Layer choices then orbit and reinforce that one move.

### Discovery Protocol (5 tests)

Stating the principle is one thing; *finding* a real signature move is another. Run candidates through all five:

1. **Enumerate** — list 5-8 candidate moves drawn from the Cinema Layer vocabulary. Don't pre-narrow.
2. **Shareability test** — for each candidate, would a viewer screen-record 5 seconds containing this move and send it to a friend with no context? If zero candidates pass, the list is too neutral — go back and add more *charged* candidates.
3. **Consistency test** — could this move appear *once per video* across a 30-episode series without becoming a tic? A move that fails consistency must either be retired after 1 use or systematically *varied* (see Evolution Arc below).
4. **Audibility test** — does the move have a *name* you can say in one sentence? ("the warm ink-wipe to a 3D-tilted dossier hero reveal"). If you can't name it crisply, the audience can't either.
5. **Inversion test** — what would the video lose if you removed this move? "Nothing significant" → it's not yet a signature, it's an ornament. "The video would feel like another channel's video" → congratulations, you found it.

### Anti-Tic Calibration

A signature that doesn't evolve becomes parody. Lock at least three sibling variants of the canonical signature (v1 / v2 / v3) — same move, slightly different intensity, palette weighting, timing window, or anchor element. Rotate which variant fires per video. Viewer should feel "that's their move" while never being able to predict the exact frame-shape.

## The Director's Signature (channel-level)

The per-video **Differentiation Principle** picks one signature *move*. The **Director's Signature** picks the channel's directorial *personality* — a stable set of traits that persists across every video. The viewer reads "this is a Wendover video" before the title card lands not because of one move but because of consistent direction.

### Director Trait Catalog

Pick one value on each axis. The combination IS the channel:

| Axis | Values |
|---|---|
| **Camera pace** | slow / medium / fast |
| **Color temperature** | warm / neutral / cool |
| **Grain register** | clean (≤0.04) / present (0.06-0.08) / heavy (0.10-0.14) |
| **Transition character** | patient (long dissolves) / punchy (hard cuts + charged transitions) / surgical (mid-sentence cuts + L-cuts) |
| **Typography personality** | editorial (serif headlines, generous leading) / technical (mono everywhere) / humanist (sans + serif mix) |
| **Voice-over stance** | authoritative / curious / wry |
| **Signature-move frequency** | once-per-video / once-per-act / recurring-tic (tied to anchor concept) |

### The Director's Sheet

A 1-page locked table per channel, pinned in the project root (e.g. `DIRECTOR.md`), filled with this channel's value on every axis plus the canonical signature move(s). Every new episode passes a Director's Sheet diff review before render: any deviation must be *justified* (intentional evolution) or rejected (drift). This is the contract that lets a second director — or the same creator on a later video — produce an episode that reads as "same show."

### Director vs Differentiation

Director's Signature is the **constant**; per-video Differentiation Principle is the **variable**. Per video, pick a fresh signature move from the same toolbox; directorial traits stay. A channel where the director drifts but per-video moves are inventive feels like a streaming-service catalogue. A channel where the director is locked but per-video moves stay fresh feels like a body of work.

## Signature-Move Evolution Arc

The signature move is not static across a series. It matures along a predictable arc:

| Episode | What the signature does |
|---|---|
| **1** | Introduced in canonical form, carefully. Held for the longest beat the video can afford. Establishes "this is the move." |
| **2-5** | Repeated with minor variations (different beat, different anchor element, slightly different intensity). Audience learns to expect it without yet predicting the variant. |
| **6-15** | The move acquires a *vocabulary* — canonical move + 2-3 sibling variants (the Anti-Tic Calibration set). Each episode rotates which variant fires. |
| **16-30** | The move can now be **inverted** (negated to mark a moment) or **quoted** (a callback to a specific previous episode's variant) — both legible to long-time viewers. |
| **30+** | The move is so established that its **absence** is a statement (Negative Cinema). At episode 30, *not* doing the signature move on the thesis-land beat is louder than doing it. |

**Plan the arc up front.** A channel that ships its inversion at episode 4 has spent a power move it didn't yet earn the right to use.

**Anti-pattern: director drift.** Episode 14 looks nothing like episode 3 because every episode picked its directorial choices fresh. Symptom: viewers say "I love some of your videos but they feel inconsistent." Fix: lock the Director's Sheet, run the diff review, treat any unjustified deviation as a bug.

## Negative Cinema

Deliberate **absence** of the Cinema Layer as a statement. Like silence in music or whitespace in design — the *removal* IS the effect.

### When to use

Forensic / diagnostic / raw beats. The single shot in the video where:

- A primary-source quote is shown unmediated — no grade, no grain, no transition character, no atmosphere, no 3D
- Hard data is presented as evidence — flat numbers, default typography, default colors, no ceremony
- The narrator names something honestly that the video has been circling rhetorically — strip the canvas
- The reframe lands so hard it doesn't need decoration — just text on background

### What it communicates

"This is the evidence itself, un-directed." "The camera has stopped authoring; pay attention." "Trust what you're seeing now in a way the rest of the video hasn't asked for." It's an honesty signal — and like all honesty signals, only legible against a backdrop of consistent direction.

### Implementation

Take SceneShell defaults, remove all Cinema Layer overlays (no FilmGrain, no ColorGradeLUT, no DynamicVignette, no atmosphere overlays, no charged transition, no 3D wrappers, no hand-drawn touches). Use neutral `dissolve` transition with the longest fade in/out the shot can afford. Result should look almost *clinical* compared to the rest of the video — that contrast IS the effect.

**The declarative NC-window contract (validated, Ep4).** Wire NC as ONE source of truth that several independent subsystems read — not as ad-hoc per-effect conditionals. An act declares its NC windows once, as audio-relative frame pairs:

```ts
// timing.ts — one place, audio-relative frames
export const NC_BEATS: Array<[start: number, end: number]> = [[19319, 20998]];
```

That single list then drives **three independent subsystems**, each of which reads the same windows and goes quiet in lockstep:

1. **Subtitles** — the shell forwards `inNCWindow` to the renderer, which drops the scrim (`scrimAlpha = inNCWindow ? 0 : …`) and HOLDS the active chunk without fading (so the line stays lit through the silence). Wire it with one optional prop: `<SceneShell ncWindows={NC_BEATS}>`; default empty → acts without NC are wholly unaffected.
2. **Cinema post-FX** — multiply every effect's intensity by an eased gate hook: `const ncSup = useNCDriver(NC_BEATS, fadeFrames); grain = base * ncSup; vignette = v * ncSup; …`. The hook returns `1` outside windows, `0` inside, ramped across `fadeFrames` at each boundary — so the cinema layer genuinely goes dark, not abruptly cut.
3. **The persistent stage** — the same `ncSup` (or a local `fadeWindow` over the same frames) dims the substrate plates, suppresses ambient particles, and fades corner-callback emblems — but **keeps the deliberate content of the emptiest frame** (e.g. the one glowing object the NC beat is about).

Why declarative: NC is a *coordinated* silence across subtitle / cinema / stage layers. A single declared window list guarantees they strip and restore together; scattered `if (inNC) return null` conditionals drift out of sync and read as a render bug. Multiple beats are just more pairs in the list.

### Discipline

- Negative Cinema only works if the rest of the video has a coherent Cinema Layer to negate. A video with no Cinema Layer at all is just un-directed, not negative.
- One Negative Cinema beat per video, maximum two. More than that and the contrast inverts.
- Negative Cinema is not the same as a section breath. Section breath is a 20-frame darkness; Negative Cinema is a *full shot* (3-10 seconds) with all Cinema Layer effects stripped while content continues.
- After the NC beat, return to full direction. Don't half-restore — reads as the renderer breaking, not as direction.

### Anti-pattern: forgetting to negate

A video where every shot uses every Cinema Layer effect at full intensity has no quiet — and therefore no loud. The first place to check for NC slots is the thesis-land beat: paradoxically, the most important moment in the video is often best served by *removing* the cinema, not adding more.

### Deep NC variant — channel-close NC

A more extreme variant reserved for the **single most stripped close** of an entire video / series. Standard NC strips the Cinema Layer but keeps the canvas (the planes, the migration arrow, ambient terrain, etc.) and the project background color. **Deep NC strips even the canvas + scaffolding + ambient terrain + base vignette + ArchiveTexture.** What remains: pure black background + a single line of amber typography + the audio.

**When to use.**

- The episode-close beat (literal final shot, after a Closing Signature Gesture has dissolved the canvas thread)
- The single most stripped, most forensic, most direct moment of the video
- Pairs only with a Closing Signature Gesture that has visually retired the canvas thread first

**Discipline (load-bearing).**

- **Once-per-video maximum**, reserved specifically for the channel-close.
- **Pair with Closing Signature Gesture.** Deep NC requires the canvas thread visibly retired BEFORE the strip — otherwise the viewer reads "render is broken." The gesture says "this is intentional, the canvas is choosing to leave."
- **Single line of amber typography.** Not a paragraph, not a CTA, not a chapter card. ONE line, word-locked on the stressed syllables.
- **Final 60-120 frames pure silence.** Episode ends in literal black + literal silence. No music swell. No CTA voiced. The viewer's brain *needs* the silent tail to consolidate the address.

**Anti-pattern: Deep NC without canvas-retirement.** Stripping the canvas with no prior gesture reads as a render bug. The Closing Signature Gesture's collapse-to-point IS the permission to strip.

**Anti-pattern: amber typography paragraph.** More than one line dilutes the single most important moment of the video. If the address takes a paragraph, the address isn't tight enough yet.

---

# Density Rhythm — extended

The surface intro lives in `SKILL.md`. This is the act-level planning template plus the cinematic density techniques.

## Cinematic density techniques (low-poly compatible)

| Technique | Film Term | When to Use |
|---|---|---|
| Background layer of 30-40 tiny population dots drifting toward a hub | **Split-depth composition** | Hierarchy scenes (authority → populace). Makes a diagram feel like a living system. |
| 20+ animated dots traversing a structure, some getting filtered out | **Information flow / data stream** | Compression/funnel scenes. Constant motion = alive, not static. |
| Each node in a diagram gets its own 4-6 satellite nodes | **Deep canvas / establishing shot** | Thesis moments. Richest frame in the act — viewer discovers details on rewatch. |
| 50-80 varied-size nodes with traveling data dots between them | **Crowd shot / swarm** | Network/internet scenes. Individual is tiny; collective behavior IS the subject. |
| Faint horizontal lines at multiple depths behind content | **Timeline fabric** | History/timeline scenes. Suggests layered depth behind foreground structure. |

## Density audit

Count SVG elements per scene. If every scene has 10-20 elements, the rhythm is flat. Target: at least 2 scenes at 60-150 elements (peaks) and at least 2 at 5-10 elements (valleys). The contrast IS the rhythm.

## Act-level density arc planning

Before building any scene, write the density arc for the entire act using this notation. This is a planning tool — it forces you to design the rhythm before writing code.

```
Shot: 028      029        030       031       032       033       034       035
Dens: VALLEY   MODERATE   DENSE     VALLEY    PEAK-1    DENSE     MODERATE  HIGH
Elem: ~8       ~30        ~45       ~8        ~65       ~40       ~35       ~50
```

Mark each shot's density intent: **VALLEY / MODERATE / RISING / DENSE / PEAK / SETTLING / COLLAPSING** during storyboarding.

---

# Implementation Status

## Fully operational (all 5 acts)

- Semantic colors, particles, terrain, dual-layer audio/visual
- Shot config + `computeTimeline()`
- Word-level sync via `makeWf()`, `wf()`, `wfEnd()`, `estimateWordFrames()`
- AudioOffsetCtx, spring presets (standard / tension / resolve / ambient)
- Staging/focus, morph transitions, GlowFilters, SceneShell
- Continuous canvas patterns (shared geometry, shared datasets, ghost object bridging)
- Artifact layer (raster) pipeline — gpt-image-2 + chroma-key cutout via `sharp` + Remotion `<Img>` overlay
- Two locked libraries fully validated end-to-end:
  - 6-gate Register A era set with active-accent semantic encoding
  - 7-plate Register B dossier set with polygon-vocabulary methodological encoding
- Library validation smoke tests (`Migration-DossierLibraryTest`, `Migration-GateLibraryTest`)

## Implementation table

| Strategy Concept | Implementation | Module |
|---|---|---|
| Semantic Color System | `COLORS` object + `FONT` (Inter, JetBrains Mono) + `FPS` | `theme.ts` |
| Ambient aliveness | `Particles` + terrain breathing | `Particles.tsx`, `LowPoly.tsx` |
| Low-poly geometry | `polyPoints()`, `facetedBoundary()`, `terrainPoints()` | `LowPoly.tsx` |
| SVG glow hierarchy | `GlowFilters` (4 named filters) + 2 radial gradients | `LowPoly.tsx` |
| Emotional registers | Spring presets: standard, tension, resolve, ambient | `motion.ts` |
| Animation primitives | `rise`, `recede`, `fadeWindow`, `springIn`, `springOut`, `springValue`, `anticipate` | `motion.ts` |
| Subtract to emphasize | `stageFocus()` / `stageScale()` for isolation | `staging.tsx` |
| Progressive disclosure | `ProgressiveReveal` with staggered spring entries | `staging.tsx` |
| Visual hierarchy (composition) | `CompositionGrid`, `gridPos()`, `GRID` anchors | `staging.tsx` |
| Transform, don't cut | `MorphShell` with zoom/push/pull-focus/expand modes | `MorphBridge.tsx` |
| Continuous Canvas | `WorldCanvas` with camera keyframes + `WorldObject` | `WorldCanvas.tsx` |
| J/L-cut architecture | `shotConfigs[]` + `computeTimeline()` + dual-layer `Sequence` + `AudioOffsetCtx` | `ShotDuration.tsx`, `Act1-5.tsx` |
| Word-level narration sync | `wf()`, `wfEnd()`, `makeWf()`, `estimateWordFrames()` | `WordTiming.ts` |
| Per-act word timing | `SHOT_0XX` word arrays | `scenes/Act*WordTiming.ts` |
| Unified scene wrapper | `SceneShell` integrating particles, terrain, fades, morphs, audio offset, composition grid | `SceneShell.tsx` |
| Artifact-layer pipeline | gpt-image-2 prompt template + chroma-key cutout via `sharp` + Remotion `<Img>` overlay | `scripts/cutout-bg.js`, `PrimitiveSmokeTest.tsx`, `assets/<scene>/gates/*.png` |
| Register A library | 6 era-locked gate primitives at `assets/cold-open/gates-v2/` | `public/projects/the-migration/assets/cold-open/gates-v2/` |
| Register B library | 7 archival-plate dossier cards at `assets/dossiers/` | `public/projects/the-migration/assets/dossiers/` |
| Library validation smoke tests | 3-beat reusable template (ceremony → callback → family/era montage) | `DossierLibraryTest.tsx`, `GateLibraryTest.tsx`, `BourdieuPlateTest.tsx` |

## Cinema Layer modules (deferred — strategy locked, code pending)

The Cinema-Layer vocabulary above is locked across two passes. **Pass 1**: 11 charged transition modes, 7 atmosphere effects, 9 spatial moves, 4 hand-drawn elements, plus the Spatial Composition Rule and the Differentiation Principle. **Pass 2 (creative-first)**: Director's Signature contract with 7-axis trait catalog and Director's Sheet, Signature-Move Evolution Arc, Negative Cinema, Cross-Register Interpolation, Lens Personality System, Meta-Canvas / Brechtian moves, Environmental / Diegetic UI, Recursive / Self-Referential, Video-Arc Drift.

Implementation will land at `my-video/src/shared/cinematics/` (project-agnostic from day one).

| Cinema-Layer Concept | Planned Implementation | Module |
|---|---|---|
| Transition Vocabulary (11 charged modes) | Extended `MorphMode` set: `wipe-linear`, `wipe-diagonal`, `wipe-radial`, `iris-in`, `iris-out`, `whip-pan`, `glitch`, `ink-bleed`, `paper-rip`, `shutter`, `light-flash`, `particle-dissipate`, `dolly-zoom`, `cross-zoom` — each with entry+exit style functions matching existing `MorphBridge` shape | `transitions.ts` |
| Post-processing filters | `<FilmGrain>`, `<ChromaticAberration>`, `<LensFlare>`, `<LightLeak>`, `<Halation>`, `<ColorGradeLUT>` | `postfx.tsx` |
| 3D wrappers | `<Perspective3D>`, `<ParallaxStack>`, `<CardFlip>`, `<PageTurn>`, `<TiltOnBeat>`, `<DollyPush>`, `<Truck>`, `<Pedestal>`, `<Crane>` | `threeD.tsx` |
| Hand-drawn integration | rough.js + Remotion wrappers (delegates to `remotion-article-highlight` skill); `<BrushReveal>`, `<InkWashOverlay>`, `<CharcoalRender>` | `handdrawn.tsx` |
| Atmosphere overlays | `<GradientMesh>`, `<NoiseLayer>` / `<FilmGrainAmbient>`, `<PatternOverlay>`, `<GodRay>`, `<DynamicVignette>`, `<FrameBorder>` | `atmosphere.tsx` |
| Effect choreography | Named signature-move presets (`dossierCeremony`, `eraTransition`, `glitchRupture`, `archiveOpen`, `thesisLand`) | `signatureMoves.ts` |
| Director's Signature contract | `DirectorSheet` type + `useDirectorTraits()` hook + sheet-diff CI pass | `directorSignature.ts` |
| Lens Personality System | `<Lens variant>`, `LENS_PERSONALITIES` catalog; `EdgeBarrelDistortion` and `FullFrameBarrelDistortion` SVG filters | `lens.tsx` |
| Meta-Canvas / Brechtian moves | `<VisibleGrid>`, `<ConstructionReveal>`, `<BrechtianLabel>`, `<MarginNote>`, `<IndexShot>` | `metaCanvas.tsx` |
| Environmental / Diegetic UI | `<InWorldLabel>` (object-attached), `<TerrainProgressBar>`, `<InWorldTimestamp>`, embedded measurement helpers | `diegeticUI.tsx` |
| Recursive / Self-Referential | `<ShotSnapshot shotId frame>`, `<PiP>`, `<MatchDissolveAcrossScales>`, `<DrosteFrame>`; channel-level recursion budget tracking | `recursive.tsx` |
| Video-Arc Drift | `<VideoArcProvider>`, `useVideoProgress()`, drift hooks (`useGrainHueDrift`, `useVignetteDrift`, `useGradeDrift`, `useParticleDensityDrift`, `useLensDrift`) | `videoArcDrift.ts` |
| Cross-Register Interpolation | `<RegisterBlend from to>` (Canvas↔Cinema), `<ArtifactBlend canvas artifact>` (Canvas↔Artifact), `<EraDrift>` (Register A→B atmosphere stack drift); unidirectional enforcement | `registerInterpolation.ts` |

Each module follows the existing pattern (typed render-prop or styled-wrapper React components, all tunable via props, all SceneShell-compatible). Until shipped, do per-shot one-offs in the active project but keep the API shape consistent with the names above so promotion to the shared module is mechanical.
