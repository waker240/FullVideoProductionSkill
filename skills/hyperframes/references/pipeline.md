<!-- Public portability adaptation, 2026-09-26. -->

# The Script→Film Pipeline (single-act, audio-locked)

End-to-end workflow for turning **a narration script into a finished, captioned, mastered film with its directed sound plan**. Every phase has an exit gate; times are examples, not rules. New explicit instructions and versioned review choices supersede old design/state notes. For review-first work, enter [review-driven-production.md](review-driven-production.md), prove moving benchmarks and deliver the requested review stage before assembly; final-film gates do not define that stage's completion.

The audio is the clock. Everything downstream is timed off it:

```
scripts/narration.json  (THE source of truth: sections → paragraphs {tts, lines, gapAfter, silence})
   │ bundled Fish route: tts-fish.mjs (or import selected-provider audio)
   ▼ assets/tts_chunks/<section>/chunk-NNN.mp3  (+ chunks.json manifest per section)
   │ concat.js                          → stitch in order
   ▼ assets/voice/narration.wav + scripts/boundaries.json  (GLOBAL startSec/endSec per section/para)
   │ master.cjs                         → −14 LUFS broadcast loudness, DURATION-PRESERVING, regenerates narration.mp3
   ▼ assets/voice/narration.{wav,mp3}   (mp3 is what index.html plays)
   │ transcribe.cjs                     → Whisper word timings per section, offset to master timeline
   ▼ assets/words/narration.words.json
   │ build-subs.cjs                     → align authoritative display lines to word timings (folds fix mishearings)
   ▼ assets/subs/narration.subs.json
   │ build-captions.cjs                 → the channel-permanent caption rail
   ▼ compositions/captions.html
   then: admissions → assets + reviewed local audio → scenes → index.html + mix → validate → GATE → audit → render
```

> **Golden rule:** display text is **authoritative from the script**, never from STT. Whisper supplies **timing only**. Mishearings are mapped (folds), not shown.

---

## Phase 1 — Scaffold

Set `HYPERFRAMES_DIR` as described in [install-portability.md](install-portability.md). The Fish helper is one implemented route, not a restriction on the user's provider. For a different selected provider, generate through its own supported tool and use the recorded-VO import below; do not pass unsupported providers to this scaffold.

```bash
node "$HYPERFRAMES_DIR/scripts/scaffold.cjs" "<project>"

# Later acts: reusable helpers/config/fonts/vendor come from the prior act.
node "$HYPERFRAMES_DIR/scripts/scaffold.cjs" "<series>/act2" \
  --from-act "<series>/act1"
```

The bundled scaffold installs canonical `tts-fish.mjs` and a non-secret Fish profile. The public adapter supports the official Fish API; set `FISH_API_KEY` and `FISH_REFERENCE_ID`, and any supported model choice, using the packaged [Fish setup](../../fish-audio-api/SKILL.md). A null project voice/model selects the configured environment value; no personal voice is shipped. A provider failure does not trigger fallback. The scaffold also installs read-only `audio:discover`; configure a project catalog before use. A prior act can contribute allowlisted configuration/fonts/runtime files and generic helpers, never credentials or replacement TTS code.

Destinations named `act2`, `act3` and later can inherit the preceding act, or use explicit `--from-act`. Narration/timings, scenes and act-specific assets do not transfer. The manifest records source provenance/hashes; `--refresh-scripts` updates only managed unmodified helpers. Review drift before any explicit force refresh. Use real project-local directories, not symlinks or special files. The scaffold does not migrate an existing provider configuration automatically: use a fresh project or perform an explicit migration of narration, package routes and generated state together.

**Gate:** tree exists; `scripts/narration.json` seeded; fonts vendored into `fonts/` (woff2 — subset if huge; every scene declares `@font-face` inside its own `<template>`).

## Phase 2 — Script study & beat map (before any TTS)

Read the script END TO END. Then write the two project bibles from templates:

For a reference-driven or repeatedly revised film, first make the two-column narration/visual plan and a small moving benchmark set. Compare generated reference pixels to actual execution; verify silhouette, hierarchy, material, causality and camera before scaling. Merge related comparison beats while retaining exact source coverage. Preserve approved concepts and protected windows. See `review-driven-production.md` for feedback semantics and HTML review.

- `DESIGN.md` — the anchor sentence, the emotional arc → register table (this is your **pacing plan**), the **semantic color system** (colors = the argument, LOCKED), typography trio (sans/serif/mono roles), cohesion chrome, 2–4 recurring motifs, the scene map, and the BGM/SFX sound palette.
- `SCENE_CONTRACT.md` — the hard per-scene contract (fill the thesis + palette).

Run the **Spatial Canvas admission** before locking the scene map: would persistent geography, revisitation, or macro↔detail return make the argument clearer than independent cuts? Record `USE` or `PASS` with a reason in `DESIGN.md`. If `USE`, read `hyperframes-creative/references/spatial-canvas.md`, instantiate `templates/SPATIAL_CANVAS.example.json` as project-root `SPATIAL_CANVAS.json`, and lock its spatial thesis, finite bounds, regions/landmarks/connectors, route proportions, revisions, excursions/return tickets, LOD, and review samples. Absolute local seconds remain provisional until narration locks in Phase 3. “Spatial” does not imply Canvas 2D or true 3D.

Run the **fast-paced passage admission** too: does any bounded passage need `momentum`, `temporal-compression`, `overwhelm`, or `panic-rupture` to perform the argument? Record `USE` or `PASS` with a reason in `DESIGN.md`. If `USE`, read `hyperframes-creative/references/fast-paced-editing.md` and lock a prose plan for each passage: exact intent enum, provisional narrative window, baseline, escalation phases, expected owner/focal handoffs, peak, release/reorientation, primary edit family, sound plan, and legibility restraint. Do not create the live `FAST_PASSAGES.json` while its clock or ownership is provisional; Phase 3 creates the machine handoff. Fast is a local arc, never the default register for the whole film.

Run the **sound-palette admission** at design time: BGM is `USE` or intentional `SILENCE`; SFX is `USE` or `PASS`, each with a reason. Search the configured local review library with `npm run audio:discover -- --type bgm --query "<mood/function>"` and the equivalent `--type sfx`. This command only reveals candidates and their source/license/technical metadata—it does not approve, copy, or wire them. Audition each candidate, then explicitly resolve/freeze a chosen file through `/media-use`; a catalog path is never a render dependency.

Chunk the script into `narration.json`: sections (`s0…sN`) → paragraphs. Chunk at the **paragraph** level — over-chunking sounds disjointed once stitched. Add `ttsSubs` (pronunciation fixes: 多音字 → single-reading homophones, bare Latin initials written out), `emphasis` (phrase → semantic caption role), and plan punctuation, `gapAfter`, and explicit silence per the register table. A `{"silence": N}` paragraph is a narration gap (montage, breath before a reveal).

**Gate:** DESIGN.md registers are NOT uniform; Spatial Canvas, fast-passage, BGM, and SFX decisions are explicit and reasoned. `PASS` is valid—these are admissions, not quotas. Any admitted canvas manifest and fast-passage prose plan are fully authored; every section has an id, every paragraph has `lines` a viewer can read in one glance (~8–20 chars for zh).

## Phase 3 — Voice (directed, not flat) → lock the clock

You are the **director of rhythm** — see `audio-direction.md` for the Fish voice contract, per-beat pacing direction, the split-and-splice recipe for sentence-internal pacing, and every TTS trap. Then:

```bash
node scripts/tts-fish.mjs           # bundled Fish route; configure the selected transport first
node scripts/concat.js              # → narration.wav + boundaries.json
node scripts/master.cjs assets/voice/narration.wav  # −14 LUFS, duration-guarded, regenerates the mp3
node scripts/transcribe.cjs         # → words.json (per-section, offset; tail-gap warning built in)
node scripts/build-subs.cjs && node scripts/build-captions.cjs
```

**Recorded VO shortcut:** if the user supplies final act/section audio, skip TTS. Probe each supplied file for duration, write `boundaries.json` with section `audioPath` plus `startSec`/`endSec`, concatenate/master the narration track, set `narration.alignment` to `"pre-recorded"`, then run `transcribe.cjs`, `build-subs.cjs`, and `build-captions.cjs`. Do not call captions word-locked if any start had to be interpolated; spot-check the first, middle, and final captions in `narration.subs.json`.

**Gate:** verify duration preservation (`Δdur ≤ 0.01s` for the supplied mastering helper), investigate any tail-gap warning, and spot-check caption starts against actual word timing. Rebuild captions after a repair. The Fish helper can regenerate an exact selected paragraph using `--section s9 --para 4 --force`; then run the full downstream Cascade. Its supported transport is official API, with environment-only credentials and no automatic provider fallback. Read [Fish setup](../../fish-audio-api/SKILL.md) for supported options and model values; keep secrets out of project files and logs.

For an admitted Spatial Canvas, now convert the provisional route proportions to local seconds inside its locked host window from `boundaries.json`. Retime every visit and excursion `at` / `duration` / `reviewAt` together; exact departure/return poses and semantic order do not change. The marked composition duration must equal the final synthesis endpoint; its mounted host may equal or cover that route. Retimed internal excursions also update their native clip `data-start` / `data-duration` exactly.

For every admitted fast passage, first materialize its exact `index.html` duration/mount ownership map and owner composition shells; final visual assembly still happens later. Then instantiate `templates/FAST_PASSAGES.example.json` as project-root `FAST_PASSAGES.json`, replacing the Phase 2 prose anchors with exact global windows from `boundaries.json` and load-bearing word times from `narration.words.json`. Preserve intent and phase order; lock phase owners/receivers, micro-edit windows, SFX/bridge cues, peak, release/reorientation, and root BGM-volume cues together. Run `npm run fast:check -- --sync-clock`, then `npm run fast:check`; no fast-passage timing, ownership, or audio-clock hash remains approximate before builders receive it.

## Phase 4 — Asset foundry (delegatable)

With the clock locked, produce the visual raw material per `asset-foundry.md`: generated plates/cutouts/substrates (layered for parallax depth; **save every prompt** to `assets/PROMPTS.md`), stock photos/footage (keys in `.env`; store provenance), reused render clips, charts, and the montage reel (`build-montage.cjs`) if the film has one. Audition the sound-palette candidates now and ingest only the reviewed selections through `/media-use`, preserving catalog id/hash, source page, license, attribution, and review note. Batch work goes to subagents with standalone briefs (`direction-and-audit.md`).

For Spatial Canvas, raster supplies material/artifacts—not flattened topology. Source for the deepest manifest zoom; keep factual labels, connectors, region identity, and revisions code-owned and registered to world coordinates.

**Gate:** every generated asset's prompt is in PROMPTS.md; cutout channels and moving edges are verified; substrates serve their intended background role at an opacity that preserves the selected material reference.

Generated video is an optional material/action source when authorized: use the installed provider skill, persist exact submitted job/model/settings and credit reservations, recover ambiguous jobs before retrying, and inspect the returned motion. Exact text/topology stays code-owned. Requested image-model names are not verified model identities unless the tool reports them; planned first-frame generation is not evidence that a submitted job used that image. Keep native footage speed and final media windows explicit.

## Phase 5 — Scene builds (the long middle; delegatable per scene)

Normally one HTML file per section under `compositions/` — **never one giant file**. The narrow exception is an admitted Spatial Canvas sequence: one owner builds one persistent world composition spanning the contiguous route. External detail cutaways remain separate files/host media; a compact internal excursion is a direct-root exact-window native clip in the owner. Do not split its regions among independent scene workers or recreate the world per section. Every builder reads `SCENE_CONTRACT.md` + `DESIGN.md` + its timing window first; the canvas owner also reads `SPATIAL_CANVAS.json` and the core Spatial Canvas contract. A builder participating in an admitted fast passage reads `FAST_PASSAGES.json` and owns only its declared phase/window/focal handoff; micro-edits intensify one idea rather than minting one concept per cut. Choose each beat's treatment from `capability-palette.md`; implement with `technique-library.md` snippets; word-lock load-bearing events to `narration.words.json`. Anchor beats (cold open, thesis, close) get the full direction pass: `hyperframes-creative` → `cinematic-direction.md` (Effort Protocol) + `cinema-layer.md` before shotlisting. Map the cold open's first three seconds cue-by-cue in `DIRECTION.md`; true 3D additionally requires the documented admission row before code.

**Gate per scene:** contract checklist and source-level composition review pass; timing, markers, assets, and timeline IDs agree with the locked plan. Do not run host-dependent snapshots before assembly. `node scripts/check.cjs`, establish/midpoint/resolve snapshots, and every Spatial Canvas visit/excursion/return sample run after the mounts exist in Phase 7.

Selected review studies enter through `hyperframes-core/references/review-to-final-assembly.md`: freeze sources/choices, re-author internal events to words, separate camera/semantic time from native footage, and convert the interactive host to native root-owned media. Never fill a paragraph by uniformly slowing a study or generated clip.

## Phase 6 — Orchestrate + sound (the audio decision is part of the build)

Assemble `index.html` from the skeleton: scene mounts at each section's GLOBAL start (alternating track-index so overlapping seams composite correctly), captions overlay, narration audio, and the declared sound palette. For BGM `USE`, wire the bed; for intentional `SILENCE`, keep it absent and preserve the reason/waiver:

- Discover candidates with `npm run audio:discover` if needed; audition, explicitly resolve/freeze through `/media-use`, record provenance, loop/trim the reviewed local track to total length, and wire its actual frozen path. Discovery itself never selects an asset, and no retrieval/generation path exists.
- For BGM `USE`, mix at `data-volume` ≈ **0.15–0.22** under narration; fade in ~2s at the open; duck to ~0.06–0.10 under weighted silence/reveal beats; fade out ~1.6s into the final breath to black. All via GSAP volume tweens on the main timeline.
- SFX only where a beat **earns** it (a rupture, a stamp, a whoosh under a charged cut) — every cue comes from the filled sound plan and a reviewed frozen local asset; use the ~0.35 volume rule.

**Name every seam relationship—never leave it on an unnamed fallback.** State whether each cut continues, ruptures, compresses, contradicts, or transforms the idea, then choose the smallest treatment that performs that relationship. Clean/hard cuts may dominate. A velocity-matched or match cut can make continuity or equivalence visible; a charged `cinema-layer.md` treatment belongs only on a beat whose argument earns it. Repetition is coherent when the same relationship recurs; random variety is not direction.

For every admitted fast passage, assemble the locked baseline → escalation → peak → release arc across picture and sound. Story/action and eye-trace decide cuts before the musical grid; add density channels progressively, keep voice/captions intelligible, and pre-bake raw-footage speed ramps/time remaps/stutters/reverses/datamosh into frozen clips rather than mutating framework-owned playback.

For a Spatial Canvas sequence, mount the marked world host once for its full duration (`data-hf-spatial-host="<id>"`, base z-index). Mount each **external** excursion as one sibling sub-composition on a higher track and explicit z-index; an internal excursion instead stays in the owner as its one exact-window direct-root native clip. Track index is temporal, not paint order. The world stays deterministically sought beneath cutaways; each return satisfies its manifest ticket and integrates a revision.

**Gate:** every global scene/media/host `data-duration`/`data-start` matches `boundaries.json`; every inline Spatial Canvas excursion clip matches its manifest-local `at`/`duration`; every marked fast passage matches its locked windows, focal handoffs, sound arc, and release; the declared audio plan is present and voice wins any mix; the tail after the final word is deliberate; every seam has a named relationship and a fitting receiver/cut/treatment.

## Phase 7 — Validate + snapshot + motion review

```bash
node scripts/check.cjs                    # includes Spatial/fast contracts + lint/validate/inspect; restores ALL audio
node scripts/snap.cjs 595 635 770 1005 …  # ABSOLUTE/GLOBAL playhead seconds on index.html → snapshots/ + contact-sheet.jpg
node scripts/snap.cjs --spatial           # all Spatial Canvas visit + excursion reviewAt samples, converted to GLOBAL time
npx --yes hyperframes@0.7.17 render . --output review/preview.mp4 --gpu --quality high --resolution 1080p --fps 60  # optional iteration/section-range preview
# REQUIRED when BGM or SFX is USE; render the full duration with no range flags:
npx --yes hyperframes@0.7.17 render . --output review/sound-review-master.mp4 --gpu --quality high --resolution 1080p --fps 60 --strict
```

- The `node scripts/check.cjs` run must end validate **0 errors** / inspect **0 layout issues** (file-size and benign tween-overlap WARNINGS are OK) and print `audio track(s) intact`.
- Pass **absolute/GLOBAL playhead seconds** (the real second on the assembled `index.html`, same numbers you'd give `render`), never per-scene LOCAL time. Only at a global second is the correct scene mounted with its assets (plates/cutouts/clips) loaded and its proxy `t` set; local seconds or an isolated bare-scene snapshot render an empty/broken frame. Convert: `global = scene data-start + local offset`.
- READ the snapshot PNGs — judge each beat against the caption rail, palette, density. At-rest snapshots show flashes/shakes mid-resolve; judge those in a rendered clip.
- Watch (or render + skim) the full piece once end-to-end before any audit verdict — pacing failures are invisible in stills.
- Watch every `FAST_PASSAGES.json` passage at final fps with final audio from its lead-in through its complete release/reorientation. Record one matching trajectory-review row in `DIRECTION.md`: story comprehension, eye-trace/reorientation, picture/sound interaction, caption/voice intelligibility, result, and action. Midpoint snapshots cannot approve the passage.
- When BGM or SFX is `USE`, the optional preview/range render is iteration only. Decode the complete encoded `review/sound-review-master.mp4` and review its mix; listen when supported, otherwise mark subjective sound UNASSESSED and distinguish user auditions from technical checks. Fill the exact `bgm` / SFX-id rows against the current file. A mix change needs a new encoded master and updated affected evidence; a local repair can retain explicitly scoped, still-valid prior review after verifying unchanged regions. Follow `hyperframes-media/references/audio-review-and-revision.md`; never claim full listening from decode/LUFS or invent gate scores.

## Phase 7.5 — Ambition readiness (the floor `check.cjs` cannot see)

`check.cjs` proves the film is **correct** (deterministic, laid-out, audio intact) but not whether it is directed. Opening proof, representation judgment, sound selection/provenance, and rendered audit are exactly what a fast agent drops under momentum, yielding a 0-error "elegant slides." Keep filling `DIRECTION.md` now. `node scripts/gate.cjs` is useful as a readiness report here, but its `audit` item is expected to remain closed until Phase 8; do not waive it merely to advance. Before audit loops, run `node scripts/gate.cjs --only spatial_canvas` and `node scripts/gate.cjs --only fast_passages` when admitted. Run `node scripts/gate.cjs --only sound_plan` only after every admitted BGM/SFX mix row comes from the current full encoded sound-review master; structural/admission contradictions must be fixed, not waived.

Fresh scaffolds declare ambition contract v2, so Spatial Canvas, fast-passage, BGM, and SFX admissions are strict even when the answer is `PASS` or `SILENCE`. Legacy projects keep opt-in compatibility; use `node scripts/gate.cjs --strict` to apply the same admission floor before upgrading.

The full gate has ten checks. Directional evidence may use a one-line `WAIVER: <id> — <reason>` in `DIRECTION.md` only where the gate allows it; structural/admission contradictions are non-waivable:

- **assets** — if generated assets exist, every prompt is in `PROMPTS.md`; zero generated assets is legal when the representation plan does not need them.
- **registers** — at least one semantic mechanism or authored artifact register exists; technique variety is not a quota.
- **direction** — anchor beats got a documented Effort-Protocol pass in `DIRECTION.md` (AWE/EASY + 120% element).
- **opening** — `0.00–3.00` has an exact narration → visible action/state → velocity-handoff map.
- **three** — any true Three.js/WebGL scene has a filled visual-admission row; absent true 3D passes automatically.
- **spatial_canvas** — when explicitly marked, structural manifest validation passed and every planned visit/excursion/return sample has a filled direction-review row.
- **fast_passages** — `PASS` needs no manifest; `USE` requires a clock-locked valid manifest plus one filled trajectory-review row per passage.
- **sound_plan** — BGM `USE`/`SILENCE` and SFX `USE`/`PASS` are reasoned; every admitted SFX cue resolves to reviewed frozen local audio and provenance.
- **audit** — ≥2 elevation passes logged in `DIRECTION.md` with per-scene scores.
- **bgm** — a bed exists (or a waiver).

`DIRECTION.md` (scaffolded) is the director's log the gate reads — fill it *as you direct*. **Gate CLOSED → do the work or waive; never edit the gate to pass.**

**Readiness gate:** correctness checks pass, and any representation-specific gate needed to audit the piece (including `--only spatial_canvas`) is open.

## Phase 8 — Audit → elevation loops (autonomous; ≥2 passes)

Classify every scene **PROTECT / POLISH / REBUILD** before touching an existing film, then run the rubric in `direction-and-audit.md` per scene. A persistent Spatial Canvas is also scored per visit/excursion/return—orientation, focal hierarchy, spatial proof, revision continuity, and final synthesis—so one good overview cannot hide dead travel. A marked fast passage is scored as one complete trajectory from baseline through release, so one exciting cut cannot hide incoherent escalation or a missing way back. Find the weakest 2–3 beats and **redesign them** (pacing is a redesign lever — re-pace TTS and cascade if a beat needs air), re-validate, re-snapshot. Repeat until the weakest beat passes the gate, not until you're tired. **Log each pass in `DIRECTION.md`**, then run `node scripts/gate.cjs`; it must exit 0 (all checks passed or consciously waived) before the final render.

## Phase 9 — Ship (+ retro, + optional packaging)

Final render; confirm audio present in the output (`ffprobe` streams), decode the complete video+audio, and extract establish / midpoint / resolve frames from the **encoded master** with `node scripts/review-master.cjs --video <master.mp4> --at 0.3,0.8,1.5,2.5` (add `--spatial` for every canvas route sample). Inspect seams and protected benchmarks at full resolution, and rewatch every marked fast passage with its lead-in/release and final mix. Only then write the completion report (what was built, weakest-link verdict, BGM/SFX provenance, regen instructions). Reconcile every requested item against actual files in the designated completion checklist read at intake (use [completion-checklist.md](completion-checklist.md) when none is supplied). Use `thumbnail-generation.md` for current cover generation; distinguish numerical audio checks from listening quality, and preserve required publishing/cleanup evidence.

For multiple native scene projects, record each source/render hash and complete scene/seam coverage; a single-root gate cannot discover all assets automatically. Document only the specific scanner mismatch with equivalent evidence, never waive broken timing/media or missing user-required audits. For public delivery, use `review-publishing.md`; after replacements/cleanup verify current manifests, file/Range routes, chapter playback and downloads. Preserve an original-speed picture master before programme-speed revisions; audio clock/mix details live in `hyperframes-media/references/audio-review-and-revision.md`.

**Retro:** save up to five proven findings in the project's `RETROSPECTIVE.md`; reusable skill changes belong to a separate [maintenance task](self-improvement.md).

---

## The Cascade (any pacing/audio change ripples — run IN ORDER)

1. Regenerate/splice the changed chunk(s) (`--section sX --para N --force`).
2. `node scripts/concat.js` → new wav + new `boundaries.json`.
3. `node scripts/master.cjs assets/voice/narration.wav` (re-checks duration, regenerates mp3).
4. `node scripts/transcribe.cjs sX` for changed section(s).
5. `node scripts/build-subs.cjs && node scripts/build-captions.cjs` (add new folds if STT misheard).
6. Update durations/starts: `index.html` (main total, moved scenes, captions, audio, BGM/SFX, final-fade) + the changed scene's `data-duration` + proxy `t` + beats timed to shifted narration. Later sections move only if an EARLIER one changed length.
7. If a Spatial Canvas host only moved globally, update its host start; keep local route timing unchanged. If its local duration or pacing changed, retime every manifest visit/excursion `at` / `duration` / `reviewAt`, composition duration, and host duration together before rebuilding route snapshots.
8. Reconcile every affected `FAST_PASSAGES.json` window against the new boundaries/word times; move phases/owners, seams, micro-edits, SFX/audio bridges, peak/release, and root BGM-volume cues as one edit; run `npm run fast:check -- --sync-clock`, then `npm run fast:check`.
9. `node scripts/check.cjs` + re-snapshot the changed beats; rerender/rewatch the full affected fast passage because stills cannot validate pacing.

## Known traps (each has bitten a real build)

- **Audio-strip gotcha** — check/snap strip ALL `<audio>` for headless runs and restore in `finally`; if they shout `AUDIO RESTORE FAILED`, restore index.html from git before anything else.
- **Stale playback mp3** — the composition plays `narration.mp3`; regenerate it after any re-concat/re-master (`master.cjs` does) or the render plays old audio.
- **VBR mp3 headers lie** — always read durations from the WAV via ffprobe.
- **Mixed concat formats truncate plausibly** — normalize every supplied act/section stem to one channel count, sample rate, and sample format before concat; require output duration ≈ sum of input durations.
- **Whisper tail-truncation** — long sections lose the last sentence; the per-section transcribe avoids it, `⚠ TAIL-GAP` flags it. Fix: transcribe the final chunk alone and splice (offset = wavDur − chunkDur, computed fresh).
- **GSAP-vs-CSS transform conflict** — lint ERROR; own centering in GSAP.
- **One giant file** — unreviewable, unfixable. Normally use one section per file. The only cross-section owner is an admitted persistent Spatial Canvas route; it contains that one world and its local state, while unrelated scenes, host media, captions, and external cutaways remain separate.
- **Render-time `.html` backups** — never leave them inside a composition root; strict discovery can treat a backup as a second root composition.
- **Markup in synthesis text** — unsupported tags can be spoken literally. Keep Fish input plain; split clauses and use `gapAfter`/silence.
- **Fixed-tempo narration** — the tell of a lazy build. Direct the rhythm.
- **Wallpaper effects** — an effect on every beat flattens the film. On-thesis, then stop.
- **Silent skip of the representation plan + audit (flat-build trap)** — momentum runs "validate clean" → render, dropping planned assets/mechanisms and rendered review. Result: 0-error "elegant slides." Phase 7.5's `gate.cjs` blocks the silent skip.
- **Uniform-crossfade seams** — the eye's version of fixed-tempo narration. The skeleton's `SEAMS.crossfade` fallback is a placeholder for an unnamed seam, not a design; shipping it on every cut is the "well-made-PPT" tell even when every scene inside is excellent. Name each seam's type (Phase 6).
- **Recorded audio without paragraphs** — supplied section audio does not create `boundaries.sections[*].paras`; set `narration.alignment` to `"pre-recorded"` and let `build-subs.cjs` use section-LCS plus interpolation instead of the paragraph anchor path.
- **Windows scaffold ACLs** — if copied scripts/assets throw `EPERM`, re-run scaffold or grant the project tree to the current user with `icacls <project> /grant "%USERDOMAIN%\\%USERNAME%:(OI)(CI)(M)" /T`; the canonical scaffold now applies this best-effort.
- **False CLI capability probes** — an unsupported `check --help` can still exit 0 on pinned versions; probe the real subcommand or use the pinned lint/validate/inspect fallback.
- **Poster-pan masquerading as Spatial Canvas** — one giant raster plus camera tourism has no semantic geography, local revision, or consequential return; use ordinary shots or redesign the world.
- **Canvas recreated per section** — tiny coordinate/state differences destroy object permanence. Keep one world owner mounted beneath cutaways and validate every return ticket.
- **Fast edits as permanent register** — nonstop density erases escalation and comprehension. Admit bounded passages only; enforce baseline → peak → release in `FAST_PASSAGES.json` and watch the whole trajectory.
- **Catalog path wired into a render** — discovery output is a review lead, not an approved asset. Audition, verify rights/hash, resolve/freeze through `/media-use`, and render only the project-local copy.
