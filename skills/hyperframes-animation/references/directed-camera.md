<!-- Public portability adaptation, 2026-09-26. -->

# Directed camera and composition ownership

Use for rich UI/canvas scenes, generated-media composites and narrated spatial explanations. For a persistent world with excursions, use [spatial-canvas](../blueprints/spatial-canvas.md) and its manifest. For admitted true 3D, use [authored-three-workflow.md](authored-three-workflow.md). Camera motion serves a visual question; a static readable comparison is often the right answer.

## Direct the focus before the motion

Write a short route beside the narration: **establish → inspect consequential detail → show result → restore relationship**. Name what the viewer should notice at each arrival, the word/idea that cues it, the holding time, and the next receiver. A macro-to-world reveal can be an anchor; an IDE highlight can provide all the motion a reading beat needs.

An earlier layered reference asked for a meaningful focus change roughly every 2–4 seconds. Treat that as that project's pacing intention, not a mandatory timer. A long causal process, narration-owned explanation or readable synthesis can hold longer. The useful question is whether the focus still supports the spoken thought. A pan, new card or sound every few seconds without a new purpose merely adds activity.

| Verb | The move earns its place when… | Failure to check |
| --- | --- | --- |
| Establish | It teaches the scene's relationship and active subject | Empty lead-in; all useful content waits offscreen |
| Inspect | The detail becomes readable and consequential | Zoom into already understood ornament; half a label at edge |
| Trace | A connection leads the eye to its actual receiver | Camera crosses empty space faster than comprehension |
| Compare | Invariant position/scale makes the difference obvious | Camera/layer movement disguises the comparison |
| Reveal | Occlusion or scale exposes a previously unavailable relation | World expands but says nothing new |
| Return | Accumulated states now explain the whole | Final overview is incomplete, too small or missing labels |
| Hold / release | Narration lands the qualification or conclusion | Frozen media used as filler after the mechanism has ended |

## Use explicit coordinate and transform owners

Author a finite world with known coordinates. One camera pose owns its parent; local subject changes live below it; view-space captions and evidence rails live outside it. Text attached to objects stays with those objects. Declare semantic layer ownership rather than inferring it from an arbitrary `y` threshold: a world label at `y=1600` can be a real destination, not a footer.

For a 2D viewport of width `W`, height `H`, pose `{cx, cy, zoom}` maps world point `(x,y)` to:

```text
screenX = W/2 + zoom * (x - cx)
screenY = H/2 + zoom * (y - cy)
```

Use one coupled pose and one apply function so the transform order cannot diverge. Transform aliases and allowed properties follow core/GSAP constraints. Precompute layout/anchors before animation; do not measure changing DOM bounds at tween time. Derive overlays and leader endpoints from the same coordinate mapping.

To fit a semantic bound of width `bw`, height `bh` in an available reading region `rw × rh`, start with `zoom = min(rw/bw, rh/bh)`, then verify the actual text size and crop. Include the caption rail in that available region. If zoom makes labels too small, simplify the overview, use a separate overview label level, or provide a readable semantic key in view space. Do not solve the problem by letting essential labels overflow.

For 3D, animate position, look target and any lens choice as one route. An orbit is justified by revealing topology/occlusion, not by the presence of a WebGL canvas. A dolly and a zoom have different effects on perspective; choose the one that carries the intended depth relation.

## Build arrivals and returns as states

Use route keys and explicit holds derived from the narration. Start a connection or focal cue before travel when it gives the eye a destination. Let important reading happen after arrival. Keep outgoing/incoming motion vectors compatible where the edit intends continuity; use a deliberate cut when an argument changes.

At a return, restore the exact landmark/pose or visibly reorient. Preserve accumulated state: selected code, ledger writes, revealed routes, changed condition and meaningful gaps. The final view should make those relationships readable together, not simply return to the untouched establishing screenshot.

Gate related containers and their contents together. An opaque empty panel covering city footage for several seconds is a defect even if its text arrives later. Initialize enough content to make the first frame intentional. Retire old overlays when their thought ends; a later approved plate must not reveal hidden legacy geometry at its tail.

Avoid a shared global cleanup that hides all text below a screen-space threshold. Separate `world`, `hud`, `captions`, `evidence`, and `review-only` roles explicitly. Scene-specific patches may repair old sources, but new source architecture should not require detecting footer text by its literal wording or coordinates.

## Keep review time, narration time and media time distinct

A silent candidate is a directed study; its durations are provisional. When the voice clock is available, map event anchors to actual spoken ideas and re-author local timing. Scaling the entire scene can end a computation early, expose a historical date in the opening header, or leave the final relationship outside the shot.

Generated footage normally retains the chosen native source motion while code actions follow narration. The parent camera should not duplicate the clip's camera. After a deliberate held frame, an authored push can inspect the exact screen layer, then return to context. Read `hyperframes-creative/references/generated-media-composition.md` for this branch's source clock and homography/occlusion contract.

Retiming must preserve the full argument-bearing lifecycle: first state, intervention, result, qualification and receiver. If the narration leaves insufficient time, change the composition/edit or choose another representation within the brief; do not silently drop the protected final result.

## Audit trajectories and seams

Review the actual encoded first frame, each camera arrival, extremum, local state change, return and last visible frame. Use denser sampling through long scenes or known weak windows, then play the relevant interval when supported. At every pose, check focal hierarchy, text scale, leader registration, exact qualifiers, image coverage and caption clearance.

Review outgoing and incoming frames together for all seams affected by a change. A final overview can be correct in source while clipped by the assembled wrapper. Once a camera fix is encoded, recheck its neighbors and protected benchmarks. Keep source-ready and encoded-confirmed as different states.

Observed repairs in an earlier film that make useful regression checks:

- Matrix/input calculation must run through the complete right-hand output before the cut.
- Outside-of-loop human figure must stay clear of title and subtitle at its largest/outermost pose.
- Factual dates and cost/result labels must appear with their spoken premise, including duplicate headings/HUDs.
- Four-lane overview needs readable lane titles plus its two semantic keys above the caption rail.
- A return to city footage must not display an opaque empty panel.
- A final market-condition view must show both high volatility and thin liquidity when both conditions matter.

Local examples: `shot-review/scenes/directed/director-kit.js`, `shot-review/scenes/directed/act02.js`, `final-film/runtime/finishing.js`, `finishing-late.js`, and `final-film/qa/audit-2/`. Their custom player/patches document the solved problems; current projects should implement those ownership distinctions directly under the core contract.
