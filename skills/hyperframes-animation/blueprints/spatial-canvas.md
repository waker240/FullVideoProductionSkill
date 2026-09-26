# spatial-canvas — Persistent World / Cutaway / Return

**intent**: Stage a complete argument in one finite oversized world, then navigate addressable regions with one virtual camera. The world accumulates revisions; a detail may become an excursion/cutaway; the camera returns to an exact anchor and finally reframes the changed whole.

This is the compound superset of `spatial-pan-stations`. Use the stations blueprint for a one-way timeline or tour. Use this blueprint only when geography, revisitation, and synthesis carry meaning.

**roles served**

- Problem / Hook: investigation board or causal field whose hidden link is discovered.
- Product_Intro / Key_Feature: one system map revisited as layers, flows, and internal mechanisms are inspected.
- Benefits / Social_Proof: evidence archive whose local cases resolve into a global pattern.
- Explainer compound frame: concept map, process landscape, timeline, family tree, museum wall, notebook, or nested diagram.

**duration**: 10–30s for one journey; longer sequence/spine canvases keep the same grammar but use the project manifest as the route authority.

**prerequisites**

1. Read `hyperframes-creative/references/spatial-canvas.md` and pass its admission test.
2. Create `SPATIAL_CANVAS.json`; authored region bounds and visit poses are the source of truth.
3. Read `hyperframes-core/references/spatial-canvas.md`; one world/camera owner spans the journey.
4. Run the worked source `examples/spatial-canvas.html` before adapting.

For a narration-timed edit or an inherited source with crop/label/return defects, also read [directed-camera.md](../references/directed-camera.md). It covers semantic layer ownership, focus holds, final overview fit and the distinction between review time and the final voice/media clocks.

**signature move**: **return with consequence** — leave a recognizable world artifact, enter a richer detail, return to its exact camera pose, then visibly mutate the world before the synthesis pullback.

## Shot structure

The times below scale to narration; arrivals and mutations word-lock to meaning-bearing cues.

- **Orient (0–12%)** — open wide enough to show at least two landmarks and the world's organizing logic. The active path/portal becomes legible; no microscopic reading.
- **Depart + traverse (12–28%)** — a connector starts drawing or a focal vector activates just before the camera moves. The camera follows a relationship, not empty distance.
- **Arrive + activate (28–43%)** — settle on Region A with some parent context still visible. After arrival, the region performs its local BEFORE → cause → AFTER turn.
- **Excursion (43–62%, optional)** — match an artifact/shape/vector into a fixed-view cutaway or higher host composition. The parent world remains mounted and deliberately holds or evolves beneath it.
- **Rejoin + integrate (62–72%)** — return to the declared pose/landmark. Add the cutaway's consequence: a connector, annotation, classification, highlight, or changed arrangement.
- **Second relation (72–86%, optional)** — trace the new edge to Region B or inspect a consequence. Compress empty geography with a cut/reorientation.
- **Synthesize (86–100%)** — pull back/reframe to the overview. The revised world now performs the thesis; hold long enough to read the global relationship.

## Camera route

One `{cx, cy, zoom}` state and one `applyCamera()` function own the world transform. Use authored coordinates; no tween-time `getBoundingClientRect()` or async timeline construction.

| Verb | Motion | Use |
| --- | --- | --- |
| orient | wide static/slow settle | teach landmarks and axes |
| trace | pan along a drawing connector | make a relationship causal |
| inspect | push to a bounded region | reveal detail that was unavailable wide |
| rejoin | exact pose return | restore object/spatial identity |
| synthesize | pull back or lateral reframe | reveal changed global meaning |

Do not add micro-drift by default. The canvas may hold perfectly still when the viewer is reading. Shake/roll belongs on an outer jolt wrapper so return coordinates remain exact.

## World/local choreography

- **World camera** moves the `.world` wrapper only.
- **Local region state** animates descendant wrappers after arrival and remains a pure function of route time.
- **Connectors** live in the same world coordinate system as nodes; start their draw slightly before travel so the eye has a vector to follow.
- **LOD** crossfades overview/regional/detail representations while preserving identity.
- **View-space layers** contain captions, justified HUD/lens, and excursions. World labels and annotations stay under the camera.
- Keep inherited `data-layout-allow-overflow` off the world and semantic-text ancestors. Isolate intentional decorative overflow in text-free leaves; hide off-camera text through authored LOD so arrival text remains auditable.

## Excursion variants

- **Artifact match** — push into a dossier/photo/card; cutaway opens on the same rectangle and returns through it.
- **Connector-to-axis** — a world line fills the frame and becomes a chart axis; it contracts back into the same line.
- **Nested canvas** — a declared `portalId` opens a second finite world; the parent stays mounted, and the child's marked composition/host exactly owns that excursion window and its own route before satisfying the parent return ticket.
- **Hard proof cut** — hold the departure pose, hard-cut to evidence with an audio bridge, return to the pose and stamp the revision.

## Rule mapping

- world camera transform → `viewport-change`, using the authored-coordinate form in the core Spatial Canvas contract
- pose sequence / route phases → `multi-phase-camera` conceptually, without its default drift
- bounded region inspection → `coordinate-target-zoom` intent, using manifest coordinates rather than DOM measurement
- connector guidance → `svg-path-draw`
- focus hierarchy at arrival → `depth-of-field-blur`
- local arrivals/revisions → `discrete-text-sequence`, `spring-pop-entrance`, or a beat-specific rule
- excursion receiver → `card-morph-anchor`, match cut, or a host-level cutaway

## Completion gate

- Opening and closing overview differ in meaning.
- Every travel segment names its spatial proof; empty travel is cut.
- Dense reading begins after arrival.
- Every excursion has an explicit local `at` / `duration` window, an in-window cutaway `reviewAt`, a valid exact/reorient return ticket, and an integrating mutation.
- Every in-composition excursion is one direct-root native `class="clip"` with exactly matching local `data-start` / `data-duration`, a finite track, `data-hf-spatial-excursion="<canvas>:<excursion>"`, and `data-hf-spatial-space="view"`; animate its inner wrapper. External cutaways use their distinct host and no inline marker.
- Every visit and excursion `reviewAt` frame passes orientation, hierarchy, legibility, and connector registration.
- Cold seeking any review frame matches continuous playback.

Failure modes and the full audit live in `hyperframes-creative/references/spatial-canvas.md`.
