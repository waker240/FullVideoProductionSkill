<!-- Public portability adaptation, 2026-09-26. -->

# <PROJECT> — Production Bible

> Single-act HyperFrames video. ~<M:SS> (<total>s). <Language> narration via <voice>. 1920×1080 @ 60fps. One project; normally one scene file per script section under `compositions/`, except one admitted persistent Spatial Canvas owner may span one continuous host window. <One sentence: what this film IS.>

## The anchor (one idea the viewer leaves with)

**<The single sentence a viewer should be able to repeat afterward.>** Every scene must feel like <the world/texture the whole film lives inside — e.g. "looking inside a working render pipeline at night", "a museum drawer of evidence", "a financial terminal watching itself">.

Stance: **<the narrator's posture — builder showing the rig / prosecutor laying out evidence / teacher at a blackboard>.** Not <the failure posture to avoid>.

## Emotional arc → register (fill one row per section)

| § | Beat | Register |
| --- | --- | --- |
| s0 | Hook: <claim> | <cold-open confident, big & slow> |
| s1 | <beat> | <register: brisk/steady/weighted/slowest> |
| … | … | … |
| sN | Close: <turn> | <slowest, let it ring> |

The registers must NOT all be the same — plan where the voice and picture breathe, rush, land, hold. (Pacing plan feeds narration.json `rate`/`speed`.)

## Semantic color system (LOCKED — never improvise)

The argument in color: **<one sentence mapping colors to the thesis — e.g. "fuel (gold) poured into machinery (violet) produces a system that works (cyan), given to the community (coral)">.**

| Role | Hex | Meaning |
| --- | --- | --- |
| `bg` | `#______` | ground of every scene |
| `bg2` / `panel` | `#______` | raised panel / card fill |
| `bone` | `#______` | primary text, neutral matter |
| `dim` | `#______` | secondary text |
| `<accent-1>` | `#______` | **<semantic role — THE hero concept>** |
| `<accent-2>` | `#______` | **<semantic role>** |
| `<accent-3>` | `#______` | **<semantic role>** |
| `mute` / `mute-dim` | `#______` | chrome, telemetry, registration marks |

Caption emphasis roles (must match narration.json `emphasis` + `captionStyle.roles`): `<role-a>` = <accent hex> (<meaning>), `<role-b>` = …, `<role-c>` = … Plain exposition gets no color.

## Typography (fonts vendored in `fonts/`)

- **<Sans — e.g. Noto Sans SC>** — captions + UI labels. Weights: 300/400/700/900.
- **<Serif — e.g. Noto Serif SC>** — the human voice: hero landing lines, the close.
- **<Mono — e.g. JetBrains Mono>** — ALL numbers, ids, code, paths, telemetry. Tabular nums, letter-spacing 0.12–0.30em, uppercase chrome.

Numbers/ids/code ALWAYS mono. The typographic split IS part of the argument.

## Cohesion chrome (optional; earn each component)

- **Default: none.** Add frame chrome only when the story is genuinely viewed through an instrument, dossier, map, or measuring system.
- Optional `.reg`: a section/argument-state tag when that state helps re-entry.
- Optional `.frule` / `.crook`: only when a physical viewfinder is part of the register—not generic sophistication garnish.
- Optional `.telem`: only for a live on-thesis quantity; never invent a readout.
- Optional `.coord`: only for a real coordinate/status the viewer should retain.

Chrome may recede or disappear for negative-cinema landings. Cohesion comes from recurring meaning and material grammar, not mandatory HUD density.

## Recurring motifs (the visual vocabulary — choose the smallest useful set)

- **<motif 1>** — <meaning> (e.g. gold token motes burning/rising = the spent fuel)
- **<motif 2>** — <meaning>
- **<motif 3>** — <meaning>

## Spatial Canvas admission (decide; do not default)

**Decision:** <PASS | USE>. **Why:** <if PASS, why independent scenes are clearer; if USE, name the canvas id/scope and the adjacency, distance, direction, enclosure, accumulation, or revisitation that carries meaning>.

If `USE`, create project-root `SPATIAL_CANVAS.json` from the skill template before scene workers begin, then lock:

- **Spatial thesis + semantic geometry:** <what x/y, distance, enclosure, overlap, scale, and connector styles mean>.
- **World:** <finite bounds · backend: dom-transform/svg-viewbox/canvas2d/hybrid/threejs (admitted) · regions + persistent landmarks + typed connectors>.
- **Route character:** <orient → meaningful travel → arrive/activate → optional excursion/return → synthesis; where travel compresses to a cut>.
- **LOD + return grammar:** <overview/regional/detail identity; portal/match/vector; what visibly mutates on return>.

## Fast-paced passage admission (decide; do not default)

**Decision:** <PASS | USE>. **Why:** <if PASS, why ordinary rhythm is clearer; if USE, what bounded idea earns directed compression>. Fast pacing is local contrast, not the film-wide default. Read `hyperframes-creative/references/fast-paced-editing.md` before filling any `USE` row.

| window + intent | baseline → escalation → peak → release/reorient | primary family + one accent | eye-trace / orientation | sound + legibility restraint |
| --- | --- | --- | --- | --- |
| <GLOBAL/section window · momentum/temporal-compression/overwhelm/panic-rupture> | <stable start → channels added one by one → named peak → way back> | <hard/action/match/montage/etc. + optional charged accent> | <focal exit→entry path; receiver/landmark after rupture> | <bridge/hits/silence; voice/captions; flash restraint> |

Use exact locked times once audio exists. Micro-edits may outnumber conceptual beats, but the passage carries one comprehensible idea at a time.

If `USE`, create project-root `FAST_PASSAGES.json` from the skill template after timing and ownership lock. Its clock hashes, passage windows, phase arc, owners, entry/exit receivers, sound plan, and legibility restraint are the machine-checkable handoff; run `npm run fast:check -- --sync-clock`, then `npm run fast:check`, after every narration/timing/ownership change.

## Sound palette — discover, audition, freeze

Candidate discovery is read-only: run `npm run audio:discover -- --type bgm --query "<mood/role>"` or `--type sfx --query "<event/transition>"`. Audition candidates one by one, verify the stated rights, then explicitly ingest the chosen file with the printed `/media-use` command. Discovery is **not** approval; never render from `mediaReview/` or a shared catalog path.

**BGM decision:** <USE | SILENCE>. **Why:** <if USE, the score's narrative job; if SILENCE, why deliberate silence serves the film>.

**SFX decision:** <PASS | USE>. **Why:** <if PASS, why no beat earns an effect; if USE, what visual events earn one>.

- **BGM role + mix arc:** <reviewed frozen project path + source/license; opening level → ducks/swells → release/out; how voice remains dominant>.

For `SFX: USE`, one row per earned cue. A cue id must match the root `<audio>` element's `id` when present; only an element without `id` may use its `data-hf-id` instead. Timing is global and the selected path/rights must be project-local and reviewable.

| cue id | exact event / global window | semantic job | reviewed frozen path + source/license | mix / bridge / restraint |
| --- | --- | --- | --- | --- |
| `<cue-id>` | `<visible cause> · <start–end>s` | <what the sound makes legible> | `<project-local path>` · <source/license> | <level; bridge/hit/silence; voice/caption protection> |

## Motion / technique toolbox (reach for these — never default to flat)

- **Representation ladder** — <where semantic 2D, generated cutouts, 2.5D, and authored true 3D each earn their place>. Every true-3D scene needs a filled `DIRECTION.md` admission row.
- **D3 / SVG** — <the data-viz beats: which real numbers come alive>
- **Canvas 2D** — <the deterministic field/simulation/mechanism beats; particles only when they encode entities or state>
- **generated plates** — material, illustration, evidence, or world architecture; split fg/mid/bg only when separate control proves depth or state; save every prompt to `assets/PROMPTS.md`.
- **Video plates / montage** — <clips reused as evidence, the reel if any>
- **BGM** — use the locked decision and mix arc above; never substitute an unreviewed catalog candidate.
- **Seam grammar** — <the recurring receiver/vector or clean-cut logic that joins the film>. Which beat, if any, earns a charged transition, and why? See `references/capability-palette.md` → The cut.

## Scene / owner map

Normally assign one file per section. For an admitted sequence/spine Spatial Canvas, mark every section inside its continuous host window `shared canvas owner`—including intervening cutaway sections where the world remains underneath. Keep external excursion cutaways in separate files; list compact internal excursions as exact-window native clips owned by the canvas file.

| File | § | Beat + state turn | representation | density | ~dur |
| --- | --- | --- | --- | --- | --- |
| `s0-<slug>.html` | 0 | <BEFORE → cause → AFTER → handoff> | <2D/cutout/2.5D/admitted 3D> | <valley/build/peak/release> | <s> |
| … | … | … | … | … | … |
| `captions.html` | — | word-locked caption rail (generated) | overlay | — | full |

## Quality gate (per beat, before "done")

1. Does the visual perform the exact narration at that instant—especially `0.00–3.00`? 2. Is there one clear focus and a visible state turn? 3. Is the representation/world coherent, with no crude literal primitives? 4. Do establish/midpoint/resolve all work? 5. Does motion argue rather than decorate? If any "no" → redesign. Protect benchmark scenes before improvement passes.
