<!-- Public portability adaptation, 2026-09-26. -->

# Direction & Audit — delegation, elevation loops, done-ness

The main agent is the **director**: it owns the design language, cross-scene consistency, pacing, and final assembly. Well-scoped execution is delegated. Nothing ships until the audit loop says the *weakest* beat passes.

For user review stages, follow [review-driven-production.md](review-driven-production.md). Author QA, root/director review, user approval and final encoded review are separate evidence. A study can be ready for user review while final timing and assembly remain pending; do not claim a full film or stop authorized improvement because of negative feedback.

---

## 1 · Delegation protocol (keep the director's context clean)

Delegate when a task is specific, specialized, and scoped to one goal: batch-generating assets from finalized prompts, transcribing/word-locking a chunk, building ONE scene from a locked spec, sourcing stock, building the montage. An admitted Spatial Canvas journey is one ownership unit: one builder reads the locked manifest and owns its world geometry, camera, revisions, and return tickets; delegate separate excursion compositions, never independent regions of “the same” world. A `FAST_PASSAGES.json` passage is one edit trajectory: phase builders may own declared windows, but one director owns its baseline → escalation → peak → release, focal handoffs, and picture/sound arc. Do NOT delegate: DESIGN.md admissions, pacing decisions, seam/transition design, sound selection approval, final assembly, or self-only audits.

A subagent sees none of your history. Every brief is standalone:

```
ROLE: Build one HyperFrames scene file (or: generate N assets / source stock / …)
PROJECT: <absolute-project-directory>  — work only in this tree.
READ FIRST: SCENE_CONTRACT.md, DESIGN.md, scripts/boundaries.json (your section),
  assets/words/narration.words.json (word-lock times),
  compositions/s0-*.html (reference chrome + proxy pattern), plus the relevant
  SPATIAL_CANVAS.json route or FAST_PASSAGES.json phase when admitted.
YOUR SCOPE: compositions/s4-voice.html — section s4, GLOBAL 117.624→136.968
  (LOCAL 0→19.34). Script lines: <paste the paragraphs + lines>.
BEAT INTENT: <2–4 sentences: what this scene argues, the register, the motif,
  which treatment(s) from the shotlist — e.g. "three voices as three waveform
  instruments; candid register; cyan=working system">.
STATE TURN: <BEFORE → visible operator/cause → AFTER → outgoing handoff>.
REPRESENTATION: <semantic 2D | generated cutout/plate | 2.5D | admitted true 3D>;
  if true 3D, cite the filled DIRECTION.md admission row.
HARD RULES: the structural contract (template/one paused timeline/proxy/
  determinism/prefix ids s4-*); palette hexes ONLY from DESIGN.md; keep clear
  of the caption rail (y>900); word-lock the load-bearing hits.
DELIVER: the scene file + `node scripts/check.cjs` clean + snapshots at
  <3–5 GLOBAL secs> read by you + a 3-line self-report (what argues the beat,
  what you're least sure of).
```

Run scene-builders one at a time or in small batches; after each, the director diffs against the contract before accepting. Give asset subagents the exact prompts + sizes + output paths and require PROMPTS.md updates.

Before mass expansion, accept representative **moving** benchmarks against the actual reference. For A/B work, delegate distinct concept exploration, then give builders the selected mechanism, current edition, protected source/window, required change and incoming/outgoing context. Do not accept a self-report as a visual review. “Approved A” is edition-specific; a previous B may become the protected A baseline next round.

For a Spatial Canvas brief, also include: canvas id/backend/world bounds; immutable regions/landmarks/connectors; the assigned local route window and revisions; deepest zoom; incoming/outgoing landmark/vector; every excursion return ticket; and local visit/excursion `reviewAt` samples. The builder verifies its source contract; after the director mounts the host, the director runs `node scripts/check-spatial-canvas.cjs` and `node scripts/snap.cjs --spatial`.

For a fast-passage brief, also include: passage id/intent; exact global phase window and owner; incoming/exit focal receivers; baseline density; the single primary edit family; assigned escalation channel; sound/bridge cues; caption restraint; peak; and release/reorientation. Builders do not change neighboring phases. The director runs `npm run fast:check`, assembles the complete passage, and watches it with final audio/fps before approval.

## 2 · The audit → elevation loop (run ≥2 full passes, autonomously)

Before editing an existing film, classify every scene **PROTECT / POLISH / REBUILD** and nominate 2–3 benchmark grammars to preserve. Per pass: (1) `node scripts/check.cjs` clean → (2) snapshot **establish / midpoint / resolve** for every scene at absolute/GLOBAL playhead seconds on index.html (`global = scene data-start + local offset`, never local time or a bare scene file), READ the contact sheet and weakest full-resolution PNGs → (3) sample the cold open at cue boundaries inside `0.00–3.00` → (4) watch/render end-to-end, including each Spatial route and complete fast-passage lead-in→release with final mix → (5) score every scene/trajectory → (6) redesign the 2–3 weakest beats → (7) re-validate. Stop only when a fresh pass finds no beat below 3.

For long scenes, add a ≤15–20s cadence sweep so a strong three-frame sample cannot hide a dead interval. Diff narration cue starts against semantic events: reject a load-bearing line more than ~4s from a visual operation, or a reveal shown before the narration earns it. Inspect every initially hidden semantic container for a container-level reveal—not only child tweens.

Every full-film pass covers all adjacent seams, including act boundaries. Log note → visible failure → repair → encoded confirmation for every finding, then recheck both neighbors. Typical repairs include missing world labels, blank lead-ins, early facts, cropped camera views, incomplete overview returns and repeated footage. A rerender for consistency is not a redesign; a three-frame contact sheet is not evidence of continuous playback.

Rubric (score 1–5 each; any 1–2 = redesign):

| Axis | Failing smell | Passing looks like |
| --- | --- | --- |
| **Argument** | decorates the line; could be a slide | motion/form performs the claim; value turns (confusion→clarity…) |
| **Craft** | flat layout, default eases, uniform crossfades, crude literal primitives, plate/prop mismatch, empty renderer void | coherent representation/world; depth or camera only when it proves, inspects, or hands off; seams named and budgeted |
| **Pacing** | same tempo as every other scene; events only at sentence bounds | rhythm follows comprehension and value turns; load-bearing hits word-locked; air where it lands |
| **Cohesion** | off-palette color, mismatched world/material, new fonts | DESIGN.md law held; optional chrome carries real state; benchmark motifs recur meaningfully |
| **Density** | no visible state turn/dead late hold, or wallpaper effects everywhere | an intentional density curve; sparse and dense states both perform; effects only where they argue |
| **Sound** | candidate treated as approved; missing provenance; flat/too loud; silence accidental | reviewed frozen sources; declared arc honored; SFX earned; voice wins |

Also verify mechanically each pass: caption-rail collisions, `boundaries.json` ↔ `index.html` duration sync, requested audio tracks intact, frozen-source provenance, fonts loading, and a deliberate tail after the last word. Read every seam as a relationship: its receiver/vector, clean cut, or charged treatment must match the argument; repetition is allowed and random variety is not a score. For scenes that use a camera rig, verify the move reveals spatial proof, changes meaning, or hands off velocity. Scenes without an earned camera move should not contain a decorative rig. For Spatial Canvas, score every manifest visit/excursion/return—not the persistent file as one scene—and require the final synthesis view to communicate more than the opening overview. For every fast passage, score baseline clarity, escalation, eye trace, peak, caption/voice intelligibility, and release/reorientation as one trajectory; log the matching passage id and action in `DIRECTION.md`.

After final render, run `node scripts/review-master.cjs --video <master.mp4>` (add `--spatial` whenever `SPATIAL_CANVAS.json` exists) and repeat the three-state review on the encoded file, with extra frames at seams, protected benchmarks, every canvas route sample, and every `FAST_PASSAGES.json` window through its release. Decode the entire video and audio; source snapshots and lint cannot prove the delivered mux.

## 3 · Done-ness + completion report

"Done" = final render plays end-to-end with every requested media track at mastered loudness, full video/audio decode passes, encoded establish/midpoint/resolve plus admitted Spatial/fast trajectory review is complete, validate/inspect are clean, and the rubric is ≥3 everywhere. Then report, briefly: what was built, voice + BGM/SFX source/license/catalog provenance, asset regeneration pointers, the weakest-remaining-beat verdict, and any narration folds/subs added.

State verification limits precisely: if no actual sound listening occurred, mark Sound `null` / `UNASSESSED` and add each pass's `Subjective sound: UNASSESSED — <actual limitation and technical evidence>` disclosure. Never invent a numeric listening score. Multi-native assemblies need complete scene/seam evidence plus per-project validation; document any single-root scanner limitation narrowly. Review-package completion, a localized repair and cleanup use their current scope, not an invented new full-film audit. Preserve prior evidence and identify what the change invalidated. No waiver overrides explicit user-required work or replaces missing full audit coverage.

## 4 · Feed the loop back

Write up to five proven findings in the project's `RETROSPECTIVE.md`. A separate [maintenance task](self-improvement.md) may promote them into scripts/templates or concise guidance.