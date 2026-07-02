# Video Content Strategy — Field Notes

The deep-tier resource. Project-specific validation cases, anchor coordinates, dated debugging notes, anti-pattern post-mortems. Read this when you need to debug a specific decision against precedent, or when authoring a new pattern and want to know what's already been tried.

The load-bearing principles live in `SKILL.md`. The named pattern catalog and Cinema Layer vocabularies live in `reference.md`. This file is the iceberg below the surface — visibly available, visibly subordinate.

**Append-only.** New validations and post-mortems go at the bottom of the relevant section with a date stamp. Don't delete history; it's how the channel learns what holds up.

---

## The Migration of Restriction (channel)

The first project that established the validated patterns now in `reference.md`. Episode 1 ran April 23-27, 2026.

### Channel-locked anchor coordinates

| Slot | Coordinate | Used by |
|---|---|---|
| `DOSSIER_SLOT` | `(cx=960, cy=540, w=380, h=540)` | Polygon Dossier Reveal Family signature |
| `PLATE_SLOT` | `(cx=960, cy=600, w=...)` | Evidentiary Plate Reveal sub-signature |
| Corner-callback slot | upper-left, 140×200 px, ~0.16 opacity | Most-Recent Dossier Anchors the Corner |
| Continuous-canvas anchor | (varies per act, but distinct from DOSSIER_SLOT) | Canvas Self-Citation Class signatures |

The 60px vertical offset between `DOSSIER_SLOT` (y=540) and `PLATE_SLOT` (y=600) is small in absolute terms but the viewer's spatial-prediction engine reads it as "this is the *evidence position*, not the *signature position*." The slot consistency is what makes the sub-signature legible across episodes.

### Polygon Vocabulary — founding 4-of-4

Polygon vocabulary is **COMPLETE at 4-of-4 founding shapes** as of episode 1. Episodes 2+ recur within these 4 founding families (e.g. a new hexagon Anna Tsing, a new triangle Hannah Arendt, a new square Jane Jacobs, a new octagon Karl Jaspers). Pentagon, Heptagon, Rhombus, etc. are unspoken and stay unspoken — adding a 5th founding family would dilute the methodological-encoding semantic.

| Polygon | Methodological family | Founding thinker | Episode 1 deployment |
|---|---|---|---|
| **Hexagon** (6 sides) | Relational sociology / field theory | Bourdieu | Cold Open V3 — Bourdieu Hexagon Reveal |
| **Triangle** (3 sides) | Vertical critique / acceleration theory | Foucault | Act 2 V2 — Foucault Triangle Reveal |
| **Square** (4 sides) | Empirical structuralism / tacit-knowledge | He Bingdi | Act 1 V2 — He Bingdi Square Reveal |
| **Octagon** (8 sides) | Foundational integration / civilizational synthesis | Fei Xiaotong | Act 4 V2 — Fei Xiaotong Octagon Reveal |

Additional thinker plates in the Register B library: Polanyi (square), Xiang Biao (hexagon), Rosa (triangle). The vocabulary supports ~30 thinkers × 4 polygon families = decades of variations from one move family.

**The fire-syllable rule.** For each thinker, the LightFlash fires on the sharpest, most stressed character of the thinker's name. For Chinese names: the *third character* (the personal name's distinctive syllable) usually works best — e.g. 「棣」 of 何炳棣.

### Polygon Family Completion META-MOMENT (channel-permanent gesture)

Fired ONCE per channel — at Act 4 V2 shot 062 (Fei Octagon Reveal). The 4 founding shapes co-appear briefly around the final founding polygon's plate, then shrink inward into it as the founding vocabulary "lands as a single visible thing."

**Status: SPENT.** This gesture is RESERVED for the moment a channel completes its founding vocabulary; it is NEVER reused. Future channels may have their own once-per-channel completion gestures, but the Migration channel has spent its budget.

### Canvas Self-Citation Class — deployed siblings

Episode 1 deployed 2-of-5 reserved siblings. The remaining 3 stay unspoken until a future video has the right argument shape.

| Sibling | Episode 1 fire | Fire syllable | Outcome |
|---|---|---|---|
| **#1 Bifurcation Reveal** (1 → 2 paths) | Act 3 V2 shot 039 — AI gate brightens, two arrows split (向上 → compute / 横向向下 → AI-uncomputable) | 「移」 of «迁移» | DEPLOYED |
| **#2 Inversion Reveal** (direction reverses) | Act 5 V2 shot 067 — migration arrow inverts; typography below: «不是'尽管', 是'因为'» | 「因」 of «因为» | DEPLOYED |
| **#3 Collapse Reveal** (many → 1) | — | — | RESERVED |
| **#4 Merge Reveal** (2 → 1) | — | — | RESERVED |
| **#5 Phase Reveal** (continuous → discrete) | — | — | RESERVED |

Sibling repetition across episodes is intentional; the class compounds via *consistent grammar with new structural verbs*. Bifurcation can re-fire in any future video with a "1 path becomes 2" structural move.

### Cold Open Echo — episode 1 deployment

Validated 2026-04-25 in Act 5 V2 shot 064v2. The Bourdieu plate from Cold Open V3 briefly re-appears at PLATE_SLOT (~0.55 opacity, 60-frame visible lifetime, sub-signature LightFlash 8f / 0.42) at the OPEN of the channel-close act, where the narration explicitly says "back to where we started." Channel literally closes its 600-year circle.

Once per video maximum; eligible only because Cold Open V3 fired a signature artifact at the same channel-locked anchor.

### Closing Signature Gesture + Deep NC — episode 1 deployment

Validated 2026-04-25 in Act 5 V2 shot 075v2 phase 2-3. The migration arrow's final beat dissolves on syllable 「这」 of 「这一次」 (the channel's continuous-canvas thread performs ONE LAST move — inheriting its inverted/end state from the act's signature reveal — then COLLAPSES inward to a point at its base vertex over 24-30 frames).

After the collapse, EVERYTHING strips to **Deep NC** (phase 3): the channel-close beat «你得自己,把它找出来。» types in word-locked on syllables 「自己」 and 「找」 against literal black. The only frame in the entire 16-minute video with NO canvas, NO Cinema Layer, NO scaffolding.

**Pairing discipline confirmed.** Deep NC requires the canvas thread to be visibly retired BEFORE the strip — otherwise the viewer reads "render is broken." The Closing Signature Gesture's collapse-to-point IS the permission to strip — without it, the strip is theft.

**Final 60-120 frames pure silence.** Episode ends in literal black + literal silence. No music swell. No CTA voiced. The viewer's brain *needs* the silent tail to consolidate the address.

---

## Library validation cases

### Register A — 6-gate era set (validated 2026-04-23)

6 era-locked gate primitives at `assets/cold-open/gates-v2/0N-*-v2.png`:

| Era | Gate | Amber accent (active-accent semantic) |
|---|---|---|
| Manuscript | chained codex | lock + chain |
| Print | press | screw + platen |
| Keju | exam-hall door | lock-plate + seal |
| Credentialed | modern door | brass nameplate |
| Algorithmic | feed stack | selection-ring + cursor |
| AI | bifurcated gate | bifurcation pivot |

A viewer scanning the row of gates reads the amber positions as a sentence — the mechanism gets more abstract as the era advances, the geometry tells the audience this before any narration arrives.

**5/5 newly-added gates passed first generation** with the locked preamble + explicit `AMBER restriction mechanism is ONLY ...` SUBJECT clause. Generalizable rule: explicit per-artifact specification of the active-accent location is what makes the family-level encoding survive.

### Register B — 7-plate dossier library (validated 2026-04-23)

7 archival-plate dossier cards at `assets/dossiers/0N-*.png`:

| Thinker | Polygon family | School |
|---|---|---|
| Bourdieu | hexagon | Relational sociology |
| Foucault | triangle | Vertical critique |
| Polanyi | square | Empirical structuralism |
| He Bingdi | square | Empirical structuralism (Keju historian) |
| Xiang Biao | hexagon | Relational sociology (悬浮 / suspension) |
| Rosa | triangle | Acceleration theory |
| Fei Xiaotong | octagon | Foundational integration |

When two same-family plates appear in the same montage frame (e.g. Bourdieu + Xiang Biao both hexagons), the eye reads the family pairing pre-verbally. The labels (`RELATIONAL` / `VERTICAL CRITIQUE` / `STRUCTURAL` / `FOUNDATIONAL`) appear as a *reveal of what the eye has already grouped* — a free prediction-error punch.

### Library validation smoke tests

Reference templates: `Migration-DossierLibraryTest.tsx`, `Migration-GateLibraryTest.tsx`, `BourdieuPlateTest.tsx`. Output MP4s at `out/smoke-test/dossier-library.mp4` and `out/smoke-test/gate-library.mp4` are the canonical references for library-level production patterns.

The 3-beat smoke test composition (ceremony → callback → family/era montage) caught one library-level semantic-encoding hole in an earlier draft (a polygon assignment that didn't pair) before any production shot consumed the library. ~1 hour of smoke-test work prevented an estimated 2-3 days of mid-production rework.

---

## Anti-pattern post-mortems

### imgly background removal on synthetic images (failed 2026-04-23)

**What happened.** Tried `@imgly/background-removal-node` on the gpt-image-2 era-locked gate primitives (Register A, magenta `#FF00FF` background). The model is trained on photographs and treats flat-color synthetic images as ambiguous. Specific failures observed:

- **Stripped the lower half of the printing press.** The model interpreted the press's lower facets as background.
- **Made keju doors semi-transparent.** The model treated the geometric facets as semi-translucent foreground material.
- **Kept magenta inside the bifurcated AI gate.** The model failed to recognize internal magenta as background to remove.

**Why this happened.** Photo-trained AI matting expects soft edges, photographic gradients, and natural-image foreground/background statistics. Synthetic flat-color images violate every assumption.

**The fix.** Use `sharp`-based chroma-key on `#FF00FF` exclusively for synthetic subjects. The chroma-key approach has zero learning component — it removes any pixel within tolerance of the magenta, full stop. No interpretation, no ambiguity.

**The general rule.** Any pipeline that uses learned models trained on natural images will fail on synthetic flat-color renders. Stick to deterministic chroma-key when the input is generated.

### Brand-Direct vs feature-description (validated 2026-04-24)

**Round 2 (failed).** Over-described Baidu / Douyin via visual features:

```
SUBJECT — a paw-print mark with four oval toe-pads above one larger oval main pad,
viewed from above.
```

Result: generic paw-print, no recognizable Baidu identity.

**Round 3 (succeeded).** Wrote the brand name directly:

```
SUBJECT — a low-poly faceted reinterpretation of the BAIDU paw-print logo
(the Chinese tech company's signature mark — a stylized animal paw-print
viewed from above, four oval toe-pads above one larger oval main pad).
```

Result: instantly recognizable Register A reinterpretation.

**The rule.** For well-known brands, the brand name is denser and more accurate signal than visual feature description. The model knows the brand identity and will reinterpret it in your style register. (See `reference.md` § Brand-Direct Artifact Prompting.)

### Audio pre-buffer round-2 vs round-3 (validated 2026-04-24)

**Round 2.** Set all pre-buffers to `+14` frames uniformly. User flagged the 1.1→1.2 gap ("…1450年." → "古腾堡, …") as "too long."

**Round 3.** Set that buffer to `−8` frames. The two phrases now read as one continuous thought.

**The rule that emerged.** The pre-buffer's *sign* carries semantic meaning — positive adds breath; negative tightens the connection. Tight phrases (a date that introduces the next event, a question whose answer follows immediately, a setup whose punchline lands across the section break) need negative buffers; rhythmic act-internal breaths need positive. Neutral 0 is rarely the right answer.

This is now codified as the Audio Pre-Buffer Sign Discipline in `reference.md`.

### Asset decoupling — Migration shot 050 (validated 2026-04-27)

**Round 1 (rigid).** Generated a single combined gpt-image-2 asset: faceted migrant-worker figure + Pearl River Delta industrial horizon together. The combined asset had ONE rigid posture and ONE coupled motion — bouncing the figure bounced the city too. The shot's argument («身体一直在移动,生活,却从来落不到地上») couldn't enact itself because the body and the city were the same unit of motion.

**Round 2 (alive).** Split the same composition into two independent assets (figure-only + horizon-only). The argument suddenly *enacted itself*:

- The body keeps moving (bounce + sway + breath + reach gesture on the punchline)
- The city stays put (atmospheric breath only)
- The amber ground line types in beneath both as a third independent layer

The split-asset architecture is what gave the figure its independent life. Cost was one extra gpt-image-2 call; gain was the entire visual verdict.

**The general rule the case proved.** Assume your first composite asset is wrong. Run the asset-decoupling test before committing. The question is never "is this asset good?" — it is "is this asset the right *unit of independent motion* for the shot's argument?" (Now codified as the Asset-Decoupling Test in `reference.md` § Layer Variance.)

---

## Cross-shot consistency cases

### Sequential Tile-Reveal — 5 Act 1 V2 shots (validated 2026-04-24)

The Sequential Tile-Reveal Pattern was deployed across 5 Act 1 V2 shots in episode 1, each with different content but identical grammar:

| Shot | Concepts | Anchor syllables |
|---|---|---|
| Subjects | 物理 / 医学 / 法律 / 金融 | 「物」 / 「医」 / 「法」 / 「金」 |
| Institutions | Bell Labs / Manhattan / Ivy / Med-Assoc | (English anchors) |
| Sources | Wikipedia / OpenSource / MOOC | (English anchors) |
| Platforms | Baidu / Douyin | 「百」 / 「抖」 |
| Prerequisites | 有地 / 有文化 / 有家学 | 「地」 / 「化」 / 「家」 |

The **cross-shot consistency IS the channel signature.** A viewer who watched 3 of these shots learns the pattern grammar and reads the 4th instantly: icon + Chinese label + tiny mono EN caption, horizontal arrangement, word-locked entry. By shot 5, the pattern has compounded into channel vocabulary — the viewer's prediction engine fires "ah, parallel concepts coming" before the first tile lands.

**Lesson.** Cross-shot consistency is what converts a one-off composition pattern into a channel signature. The discipline of using *exactly the same icon size / typography / entry timing / drop-shadow profile* across all 5 shots was the load-bearing choice. Even small deviations (tile labels at slightly different font sizes, varying tile spacing) would have broken the cross-shot legibility.

### Single-Asset Code Replication — Gutenberg fountain (validated 2026-04-24)

Act 1 V2 shot 007: "the Gutenberg press → 12 books fountain." Replaced an earlier pre-composed "books cascade" plate that had locked positions, tilts, and timing baked in.

**The replacement.** Generated ONE canonical book asset via gpt-image-2, replicated 12 times in code with deterministic per-instance variation. The story IS "ONE press produces MANY books," so the code does the multiplying.

**Replication parameters that worked:**
- 3 rows: 5 / 4 / 3 books (front to back)
- Row spreads: 780 / 580 / 360 px (back row narrowest, simulating perspective)
- Row Y offsets: -280 / -150 / -30 px above the press
- Stagger: 2 frames per instance, 24-frame total emergence window
- Tilt: index-seeded `((i * 73) % 41) - 20` for deterministic variation
- Scale animation: 0.18 → 0.6 (small at source, growing as it travels)

**Z-order discipline.** `zIndex: 100 + inst.row` — back-row books render first (behind), front-row books render last (front). Front row visually occludes back row, giving 3D depth from a 2D pipeline.

This is now codified as the Single-Asset Code Replication Pattern in `reference.md`.

---

## Open questions / pending validations

These are patterns that exist in the catalog but have not yet been deployed in production. When they ship, append validation notes here.

- **Register C — Terminal Print.** Reserved for first modern-era evidentiary citation (model card, Slack thread, security report). Not yet designed.
- **Canvas Self-Citation Class siblings #3-#5** — Collapse Reveal, Merge Reveal, Phase Reveal. Reserved for future episodes with the matching structural verb.
- **Polygon Family Completion META-MOMENT for non-Migration channels** — the Migration channel spent its budget; future channels may have their own once-per-channel completion gesture, but no precedent yet.
- **Director's Sheet diff review** — the contract is locked but the actual CI / diff-review workflow is not yet shipped. Currently enforced by manual review.
- **Video-Arc Drift `<VideoArcProvider>`** — the strategy is locked but the implementation lives at `my-video/src/shared/cinematics/videoArcDrift.ts` (planned, not shipped). Per-shot one-offs are acceptable until shipped.

---

## Append new field notes below

Format: `### YYYY-MM-DD — [shot-id or pattern-name] — [verdict]` followed by a short paragraph. Don't delete history; if a pattern is later invalidated, append a new entry rather than rewriting.

### 2026-05-06 — Argument-Coded Subtitle (The Cascade · Episode 1) — VALIDATED, channel-permanent

First production deployment of the **Argument-Coded Subtitle** pattern (now in `reference.md`). Built end-to-end across cold open + Acts 1-4 of The Cascade, ~50 min total runtime, **1,169 chunks** generated.

**Locked specs (from cascade `DIRECTOR.md` §17, channel-permanent):**

- Native font 56px (≈20pt on iPhone landscape, the constraining viewport at 0.36× scale)
- Position `(720, 950)` of 1080 frame — bottom 12%, below the bulb halation cone, above mobile player chrome
- Auto-shrink ladder `56 → 52 → 48 → 44 → 40px`; ~95% of chunks render at default 56px, ~5% need shrink
- Single-line max ~19-20 Han characters; long sentences chunk at clause boundaries into 3-6 sequential blocks
- Soft radial scrim (78%×18% ellipse, 0.62 peak opacity, no hard edge)
- 8-frame fade-in starting 6 frames before chunk's first syllable; 12-frame fade-out 6 frames after last syllable
- NC behavior: hold without fading, scrim drops to 0 (caption-static during the 3 NC strips: cold-open pivot / 1.7 keystone / 4.3 decision)

**Emphasis distribution after manual classification (513 emphases across all acts):**

- insight: 65.6% (right answer / thesis advance)
- tension: 23.2% (wrong answer / problem / negation)
- system: 11.2% (baseline / structural fact)

This distribution turned out to be the natural balance for an essay that follows the standard error-management arc: most emphasized phrases are advancing the answer, a meaningful minority mark the rejected alternatives, and a small group establish baseline facts. Future channels can use this as a sanity-check distribution; large deviations (e.g., >40% tension) suggest the script is over-weighted toward critique-without-resolution and warrants an editing pass.

**Validation observations:**

- **The dual emphasis-end rule was non-obvious.** First implementation made all punctuation terminate emphasis (so the keystone `[强调]每一层级联,都承载着下一层即将压缩的内容。` got truncated at the comma to just `每一层级联`). Second iteration made commas always transparent (which broke back-to-back patterns like `[强调]A,[强调]B`). Final rule: **commas are transparent unless the next emphasis tag is in the same sentence**. Single-emphasis sentences emphasize the whole sentence; multi-emphasis sentences each cover their own phrase. This rule is now in the pattern spec.
- **STT alignment requires canonical normalization.** Whisper / Fish-Audio strips silent decorations (`「」 — · 《》`) from word table while the narration markdown preserves them. The build pass normalizes both sides to a canonical form, finds the block in the canonical concat via indexOf, then maps positions back via parallel index tables. Without this normalization step, alignment fails on every block containing decorative punctuation — which is most of them.
- **Mobile sizing dominates desktop sizing.** Designing at 32-40px (typical desktop YouTube subtitle size) reads as ~12-14pt on iPhone landscape, below the comfort floor for sustained reading. The 56px native size felt "too big" on the desktop preview but reads correctly on phone. **Always design subtitles against the constraining viewport.**
- **The subtitle becomes a third visual signature.** During render review, the channel's identity-recognition test (would a friend recognize this as the cascade from a 5-second clip?) was passing on bulb + column alone, but adding the argument-coded subtitle made the recognition fire faster — the color-coded text is reading from the lower-third before any content lands. The subtitle has earned a slot in §16 of the Director's Sheet review.

**Artifacts:**

- `subtitle-options.html` — initial design comparison (4 options: Field-Notes / Specimen Plate / Argument-Coded / Cinema Mute)
- `subtitle-spec.html` — locked Specimen Plate option B with mobile-sizing rationale and chunking rules visualized
- `scripts/build-cascade-subs.js` — the offline build pass (~470 LOC)
- `scenes/_subtitles.tsx` — the Remotion component (~250 LOC)
- `cascade-narration.md` — emphasis tags upgraded to semantic-suffix form (`[强调-T]`, `[强调-S]`, default `[强调]` = insight)

**Why "channel-permanent":** future Cascade episodes inherit identical specs (pattern is locked in DIRECTOR.md §17). The bilingual / cross-platform versions (Bilibili, Douyin long-form) reuse the same component with their own narration + STT word table — the build pipeline is parameterized by `actId`, so adding a new project is one config row + one narration file + one words table.

### 2026-06-08 — The Effort Protocol (skill-level intervention) — RATIONALE + DESIGN BASIS

Added a new surface-tier section to `SKILL.md` (**The Effort Protocol**, placed second, right after Core Thesis so it's read every invocation) plus a deep-mechanics companion in `reference.md` and an Awe Diagnostic wired into the scene-review pass and the Visual Quality Gate. This entry records *why*, so the choice can be debugged against precedent if it's ever questioned.

**The presenting problem (user, 2026-06-08).** The skill "too often appears quite lazy and doesn't always think very hard about each shot — a default easy mode where it just slaps on something and calls it a day." Videos come out *competent* but not *awe-inspiring* unless the user pushes repeatedly, which "misses the point." The user pointed at the Huashu-Design system as a possible source of borrowed ideas but explicitly left the approach open.

**The diagnosis (the non-obvious part).** The skill was NOT lacking depth — it is already encyclopedic (three tiers, validated patterns, full Cinema Layer vocabularies). Adding more catalog would have made the problem *worse*. The actual failure is structural and matches three documented LLM tendencies:

1. **Regression to the mean (Galton's Law of Mediocrity, arXiv:2509.25767).** Without a targeted forcing function, generation drifts to the statistically-average move. The first idea is almost always the mean. Structured signals partially counter this; passive references do not.
2. **Confirmation-reading over the environment ("Agents Explore but Agents Ignore," arXiv:2604.17609 — agents "use the environment to fetch expected information, not to revise their plan").** A deep reference gets read to *confirm* the agent's first instinct, not to *challenge* it. The deeper the catalog, the easier the lazy path.
3. **Premature convergence (design-thinking divergence/convergence literature).** Picking the first workable composition. You can't select the best option if you generated only one.

And the **awe gap** specifically: the existing complementarity test screens *filler out* but never screened *wonder in*. Aesthetics research (processing-fluency vs. optimal-cognitive-surprise; "Beauty as an Emotion," Sage 10.1037/a0012558; "Designing Awe," ACM 10.1145/3773699.3776530; defamiliarization fMRI work) is clear: competent design = fluency (mild, forgettable); awe = a *managed prediction error* that resolves into "of course." Nothing in the skill asked "does this shot produce that?"

**The intervention (why this shape).** A *forcing function*, not more doctrine. Small, high-priority, sits on top of the existing discipline:

- **Two explicit modes (AWE / EASY) with a no-silence gate.** Per user decision (2026-06-08): AWE is the *default for anchor shots*; EASY is legitimate for utility/connective shots but must be *consciously declared* — "laziness is permitted; silent laziness is not." This reconciles the user's own tension ("fast is good, but awe is the goal") via a *budget*: concentrate effort on the 6-10 anchor shots, protect the speed of the dozens of utility shots.
- **The divergence forcing function (three-before-one).** Directly counters regression-to-the-mean and premature convergence. Emphasis on varying the *primitive lens* (diegetic / canvas / negation), not adjectives, because false divergence (one idea, three skins) is the predictable cheat.
- **The Awe Test + Awe Diagnostic.** The missing screen — runs *alongside* complementarity. Names the pause-frame; if none exists for an anchor shot, it's a fail.
- **The 120/80 rule.** Makes "taste" mechanical: uneven effort (one 120% element, rest clean 80%) instead of flat all-80% polish (the Hologram quadrant).
- **The Critic Pass.** Forces a maker→critic hat-switch with a failure-signature table, countering "finished mistaken for right."

**On Huashu-Design.** Read it in full. It's a strong *HTML-design* system (anti-slop discipline, Junior-Designer show-early loop, three-parallel-subagent fallback for vague briefs, brand-asset protocol). Deliberately did NOT import its mechanics — different medium (HTML prototypes/decks vs. Remotion argument-video), and our skill already has richer domain doctrine. What was *worth borrowing at the top level* was its underlying spirit, which converged with the research: (a) **never ship the mean / anti-slop as protecting identity**, (b) **give variations, not one answer** (→ our three-before-one divergence), (c) **show-early / critique loop** (→ our Critic Pass), (d) **embody the role, don't assemble** (→ AWE mode's "designed, not assembled"). The elevation is medium-native, not a port.

**Status: SHIPPED, unvalidated in production.** The protocol is logically sound and research-grounded but has not yet been run through a real episode. Append a validation note here after the first video built under it — specifically: did the three-before-one divergence actually produce non-mean anchor shots, and did the AWE/EASY budget hold the timeline? Watch for the predicted failure mode: the agent performing divergence theater (writing three approaches that are secretly idea #0 three times) to satisfy the step without breaking the mean. If that appears, the fix is sharper divergence craft (force the primitive-lens variation), not abandoning the protocol.

**Mirroring.** All four edits (SKILL.md §Effort Protocol + §Awe Diagnostic, reference.md §deep-mechanics + Visual Quality Gate checklist, this note) applied identically to both skill copies (`~/.cursor/skills/` and project `.kiro/skills/`), which are byte-identical by contract.

### 2026-06-08 — EIF audit of the skill + Receiver-Runway doctrine — RATIONALE + DESIGN BASIS

Ran the Energy-Information Framework against two questions: (1) *what is design supposed to be for our educational video content?* and (2) *audit `video-content-strategy` against that derivation.* This entry records the analysis and the five edits it produced, so they can be debugged against precedent.

**The recursive caveat (logged honestly).** The skill was already partly built on EIF (externalization doctrine, substrate-as-perceptual-coherence, channel-capacity references). So this was EIF auditing its own offspring — confirmation-gravity risk. Countered by anchoring every claim to a *hard-tier external regularity* (Mayer CTML, Sweller CLT, Guo 2014 MOOC engagement data — Tier 1-2), not to EIF's internal consistency. Where the skill merely renamed a cognitive-science result in EIF vocabulary, it was flagged as decoration, not tooling.

**What EIF derived design to BE (the hardware audit).** An educational video is a **coupled two-engine system**: creator (transmitter, burns compression energy) + viewer (receiver, a fixed-bandwidth, energy-*depleting* channel). Design = **coherence transfer per unit of viewer energy** (EC/KC raised, viewer cost lowered). The Guo finding — short videos retain because brevity *forced* meticulous compression — is the empirical confirmation of the skill's own Core Thesis ("cognitive energy is the moat"), now anchored to 6.9M sessions rather than asserted.

**The headline finding (the genuine prediction-error against the skill).** The skill is a world-class *transmitter*-optimization system that **under-models the receiver as a depleting engine.** The binding constraint on long-form retention is not signal quality — it's the receiver's attention runway. Hard regularity: median engagement ~100% under 6 min → ~20% past 12 min (Guo); our channel ships 15-60 min. So the median viewer's attention empties before the thesis lands, and a long video is really dozens of micro-sessions stitched by *re-entries*. The skill had scattered mitigations (argument-coded subtitle, corner-dossier anchor, continuous canvas thread, density valleys) but never named **re-entry cost** as the organizing problem or **runway extension** as design's first job on long-form. → New **Receiver-Runway Doctrine** added to SKILL.md, re-filing those existing tools under one measurable objective + adding the per-act runway diagnostic.

**The coherence audit of the skill itself (EIF Pillar 5).** SKILL.md was ~606 lines, reference.md ~1499 — the skill is **near its own complexity-fragility limit.** The agent's per-shot apply-budget is fixed; the catalog isn't; so past criticality, *more catalog lowers coherence* by inviting confirmation-reading (grab nearest pattern). This is the same lazy-default the Effort Protocol fights, arriving through a different door. → Two compression moves rather than growth: (a) a one-screen **Spine** (6 load-bearing regularities) at the very top as a low-KC seed everything reconstructs from; (b) a **Catalog Discipline** note gating the Cinema Layer behind the Differentiation Principle (one signature move/video, don't browse all 11 transitions per shot) and noting Layer Variance pays rent at ~4 axes not 11.

**The five edits:**
1. **SKILL.md §The Spine** — 6 regularities (coherence-transfer / dual-channel bandwidth / externalize-state / substrate / receiver-runway / one-Apex-move-per-anchor), each anchored to a hard-tier citation. The compression seed.
2. **SKILL.md §The Receiver-Runway Doctrine** — the depleting-engine lens, re-entry cost, existing tools re-filed as runway infrastructure, segmenting-as-Reset-phase, the per-act runway diagnostic. *The one genuinely new organizing idea.*
3. **SKILL.md §Constraint 2 (Complementary-Only)** — reframed from anti-filler to **channel-capacity doubling** (two non-redundant pipes ≈ 2× bandwidth; duplicated pipes ≈ ½ — Mayer redundancy effect); imported the hard-tier names (modality / redundancy / signaling / coherence / contiguity / segmenting) mapped to what the skill already does. Makes the rules arguable as regularities, not taste.
4. **SKILL.md §The Content Quadrant** — upgraded fuzzy "Originality × Production" to **measurable Narrative Gravity × Thermodynamic Coherence.** Unifies both reported failures on one map: lazy default = Silent Generator (coherent, ignored); over-polished slop = Hologram (gravity, empty). "Is it good?" → "which quadrant, what's the vector to Apex?"
5. **SKILL.md §Catalog Discipline** (under the Effort Protocol) — the EC-overload guard rails (Spine-as-seed, Cinema gated behind Differentiation, Layer Variance ~4 axes, "more is not the upgrade path").

**What was deliberately NOT changed.** The core vocabulary, the three-tier structure (good rate-distortion engineering already), the substrate/externalization doctrines (validated EIF tooling), and the Effort Protocol (correct counter to regression-to-the-mean) — all kept. Per EIF Pillar 5, the move was *compress-then-add-one-lens*, not add-more-patterns.

**Status: SHIPPED, unvalidated in production.** Validation to append after the first long-form (15+ min) episode built under the runway doctrine: (a) did naming re-entry cost actually change act-level decisions, or did it stay theoretical? (b) did the per-act runway diagnostic catch a real leak? (c) did the Spine reduce confirmation-reading, or did the agent ignore it and dive into the catalog anyway? Predicted failure mode to watch: the Spine becomes *ornamental* (read once, never used as the reconstruction seed) — if so, the fix is to make a Spine-trace mandatory in the per-shot decision, not to delete it.

**Mirroring.** All edits applied identically to both skill copies (`~/.cursor/skills/` and project `.kiro/skills/`), byte-identical by contract; verified by diff.

### 2026-06-08 — Audit Loops (self-improvement machinery) — RATIONALE + DESIGN BASIS

Added a feedback-loop tier so the skill can audit its own outputs *and itself* with fresh-eyes subagents, and write validated improvements back under a gate. New files: `audit-loops.md` (the protocol) + `audit-log.md` (the staging ledger). Compact pointer (`§Self-Audit`) added to SKILL.md; "Where things live" + "Where to go next" updated.

**The ask (user, 2026-06-08).** "As with any good system, feedback loop is critical, especially with fresh eyes and varying perspectives — add various audit loops / audit subagents so the skill can automate its own edit using a fresh lens when needed."

**Design decisions (confirmed with user):**
- **Both loops, composed.** Loop A (Output Audit — fresh eyes on a built scene/video) + Loop B (Skill Audit — fresh eyes on the skill, proposing edits). The composition is load-bearing: a recurring Loop-A defect across multiple videos is the evidence that escalates to a Loop-B skill edit; Loop-B edits are validated by whether the next Loop-A audit stops flagging the defect. Closed loop = compounding, not drift. Loop A alone is open-loop (skill never learns); Loop B alone is Hologram-risk (edits on theory, no output contact).
- **Hybrid lens roster.** Fixed core (Naive Viewer / Skeptic-Anti-Slop / Cognitive Scientist / Cinematographer / Editor) — chosen so every Spine regularity has a lens that catches its violation (coverage guarantee) — PLUS one rotating wildcard per run from an 8-lens pool (Domain Expert / Mobile-0.5×-attention / Rewatcher / EIF Auditor / Hostile Commenter / Competitor's Director / Five-Years-Later / Accessibility). Hybrid because: fixed-only develops predictable blind spots the maker pre-satisfies (the audit itself regresses to a mean); rotating-only loses coverage consistency.
- **Gated write-back.** Borrowed EIF's Framework Evolution Protocol wholesale (propose-as-hypothesis with Low/Medium/High confidence; promote only on corroboration). Auto-apply is deliberately narrow — High + subtractive/clarifying (never new-pattern-additive, per Catalog Discipline / EC-overload) + non-load-bearing + self-logged. Load-bearing set is off-limits to auto-edit (the Spine's 6 regularities, Style Register lock, Director's Sheet, channel-locked anchors — the equivalent of EIF's untouchable 6 Core Pillars). Default posture: stage, don't apply.

**Why this shape and not a simpler one.** The obvious risk of a self-editing skill is that the self-edit becomes its own new slop source — degrading a load-bearing skill faster than any single bad video could. The asymmetry the gate exploits: cost of a missed-good-edit (it waits for approval) is tiny; cost of an auto-applied-bad-edit to a load-bearing skill is large. So the gate is intentionally tight, and additions (which raise EC toward the complexity-fragility limit identified in the prior EIF audit) can NEVER auto-apply. This keeps the feedback loop from violating the very finding that motivated last session's compression pass.

**Recursion guards built in.** Per EIF's recursive rule (audit the analyzer), `audit-loops.md` and `audit-log.md` both carry self-checks: audit-staleness detection (rotate wildcard / retire stale core lens if findings go repetitive), write-back calibration (revert-rate too high → gate too loose; nothing reaches High → too tight), and recurrence-threshold tuning. The audit machinery is itself a node subject to phase-transition-into-noise (alarm fatigue, audit theater) and the anti-patterns section names those explicitly.

**EC discipline applied to the addition itself.** This is an *additive* change to a skill flagged last session as near its complexity-fragility limit — exactly the kind of move the Catalog Discipline warns against. Mitigated by tiering: the machinery lives in `audit-loops.md` (Meta tier, dimmed substrate — loaded only when actually running an audit), with only a compact pointer in the surface tier. SKILL.md grew by ~one section, not by the full protocol. The substrate doctrine applied to the skill's own documentation.

**Status: SHIPPED, unrun in production.** The loops have not yet executed against a real video or a real skill audit (`audit-log.md` is empty by design). Validation to append after first real run: (a) did independent lenses actually *converge* on real defects, or did they scatter (roster mis-calibrated)? (b) did any proposal legitimately reach High and auto-apply, and was it a good edit? (c) did the gate correctly hold back additions/load-bearing edits? Predicted failure modes to watch: audit theater (running the loop then ignoring findings), additive drift (auditors proposing new patterns the gate has to keep rejecting), and contaminated context (spawning auditors with maker reasoning in scope — kills the whole value).

**Mirroring.** Both new files + SKILL.md + this note applied identically to both skill copies; verified by diff.
