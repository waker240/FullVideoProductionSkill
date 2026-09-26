# Spatial Canvas Composition

A **Spatial Canvas** is a finite authored world larger than the output frame. Its regions, paths, and accumulated state carry part of the argument; the viewport becomes a choreographed camera moving through that world. This is a scene grammar, not the HTML `<canvas>` API and not the Canvas lane in Canvas · Artifact · Cinema. DOM/SVG, Canvas 2D, CSS 2.5D, or admitted Three.js may render it.

The detective evidence wall is one skin. The same grammar can stage a timeline, system map, archive table, family tree, causal network, city, notebook, museum wall, or nested world.

## Vocabulary

- **World** — the finite oversized layout.
- **Region** — an addressable semantic cluster with bounds and a focal anchor.
- **Landmark** — a persistent orientation cue visible from several camera poses.
- **Connector** — a typed relationship registered in world space.
- **Route** — the time-coded camera itinerary.
- **World revision** — the cumulative visible state at a point in the route.
- **Excursion** — a cutaway or nested-world visit away from the parent world.
- **Return ticket** — the exact departure/return continuity contract for an excursion.
- **LOD** — overview, regional, and detail treatments appropriate to camera scale.

## Admission — geography must argue

Choose Spatial Canvas when adjacency, distance, direction, enclosure, scale, accumulation, or revisitation makes the idea easier to understand. It is especially strong when the viewer must repeatedly answer “where does this detail belong in the whole?”

Use ordinary scenes when regions could be rearranged without changing meaning, the material is merely a list, or the camera would only tour a large static illustration. A one-way sequence of stops with no return or global revision is the simpler `spatial-pan-stations` blueprint.

Three useful scopes:

- **Scene** — one compact overview → inspection → synthesis journey.
- **Sequence** — one world remains mounted across several narration sections while cutaways appear above it.
- **Spine** — the film repeatedly returns to one world, with deliberate act-level orientation resets.

Spatial does not imply 3D. Crisp authored 2D/SVG is the default; 2.5D is useful for material depth and occlusion. True 3D still needs the normal admission gate.

## Plan before shotlisting

When admitted, instantiate `hyperframes/templates/SPATIAL_CANVAS.example.json` as project-root `SPATIAL_CANVAS.json`. It is the topology and route contract consumed by `scripts/check-spatial-canvas.cjs`. Lock these decisions before scene workers begin:

1. **Spatial thesis** — one sentence naming what geography proves that normal cuts would not.
2. **Semantic geometry** — what x/y, distance, enclosure, overlap, scale, and connector styles mean. Meanings stay stable.
3. **World map** — finite bounds, regions, landmarks, connector routes, portals, and LOD responsibilities.
4. **Route** — authored camera poses, timing, verb, purpose, active region, world revision, settle, and review sample.
5. **Return tickets** — departure visit, cutaway `at` / `duration` / `reviewAt`, return visit, exact pose tolerance (default) or explicit reorientation reason, and the mutation that integrates the discovery.
6. **Resolution budget** — maximum inspection zoom for every raster; factual labels, connectors, and mutable state remain code-owned.

Add the admission decision and canvas id/scope to `DESIGN.md`; log itinerary review in `DIRECTION.md`. A canvas journey has one owner. Independent scene workers must not recreate “the same” world from prose.

## Spatial semantics

Declare only dimensions that matter to the argument. Examples:

| Device | Possible meaning |
| --- | --- |
| x-axis | chronology, process order, causal direction |
| y-axis | hierarchy, abstraction, confidence, depth of cause |
| distance | relationship strength or separation |
| enclosure | ownership, jurisdiction, containment |
| overlap | conflict, shared responsibility, ambiguity |
| connector style/direction | causal, temporal, evidentiary, contradictory |
| camera scale | level of inspection, not importance by default |

The opening wide view should establish at least two landmarks and the world's organizing logic. The closing wide view must mean more than the opening because revisions, connections, or classifications now make the thesis visible.

## Journey grammar

Orient and Synthesize are mandatory bookends. Choose the useful middle beats from this menu; do not force travel or an excursion that adds no proof:

| Beat | Camera/action | Semantic job |
| --- | --- | --- |
| **Orient** | establish the world and landmarks | teach the geography |
| **Depart** | lock onto a connector, portal, or vector | make the reason for travel visible |
| **Traverse** | survey, trace, truck, or push | reveal a relationship en route |
| **Arrive** | settle with some parent context retained | preserve orientation |
| **Activate** | region performs BEFORE → cause → AFTER | make the visit change understanding |
| **Excursion** | enter a dossier, chart, reenactment, or nested world | deepen one artifact |
| **Rejoin** | satisfy the return ticket | recover object and spatial identity |
| **Integrate** | add an edge, annotation, category, or changed state | make the excursion consequential |
| **Synthesize** | pull back or reframe | reveal the changed whole |

Camera verbs are semantic: **orient, survey, trace, traverse, inspect, rejoin, synthesize, hold**. Empty travel is compressed with a cut and a brief reorientation. Constant-speed tourism is not a route.

## Excursions and return tickets

An excursion may be an overlay inside the canvas composition or a higher host-level sub-composition. The parent world remains mounted beneath it. Every return ticket records:

- departure pose and world revision;
- visible portal/landmark and outgoing screen vector;
- cutaway entry receiver;
- return pose and recognizable anchor;
- integrating mutation on return.

Manifest each ticket with a local visibility window (`at`, `duration`, and an in-window `reviewAt`), `returnMode: "exact" | "reorient"`, and `returnMutation`. The excursion starts within its departure visit and ends no later than the return visit begins. A nested-world excursion also names the parent `portalId`; its `cutawayComposition` and exact host window belong to the declared target canvas. Exact returns reuse region/camera pose and a `rejoin` visit; deliberate breaks carry `returnReason` and visibly re-establish the geography.

Useful bridges include object match, connector-to-axis match, velocity match, material/color match, and audio bridge. Returning to the same picture is not enough: the learned detail should visibly alter the parent world.

When spatial continuity must break for emotion, break it deliberately, then reorient with a landmark or overview. Do not fake continuity by rebuilding a similar-looking board in another file.

## Legibility and rhythm

- World density may be high; **viewport density may not**. Judge hierarchy at each planned camera stop.
- Text is sized for the pose where it is read. At overview scale, use shapes, short labels, and landmarks rather than microscopic body copy.
- Dense reading starts after arrival. During travel, let paths, silhouettes, and changing relationships carry comprehension.
- Give arrivals and returns a settle. Use faster cuts for empty distance and slower moves when traversal itself reveals causality.
- Keep one active focal point per pose. Supporting regions may remain visible only as orientation context.
- Keep captions, justified HUD, lens effects, and film-level chrome in view space. Labels, connectors, evidence, and annotations that belong to the world move with it.

## Material and asset direction

A generated plate may supply paper, terrain, wall texture, or an artifact. It must not flatten the whole board into one immutable raster. Keep factual labels, connectors, changing highlights, and revision state as DOM/SVG/Canvas layers. Source every raster for its deepest planned zoom; a texture acceptable at overview can collapse during inspection.

Use tactile depth when it clarifies registration: shadows under cards, tape, pins, overlapping documents, foreground edges, and controlled parallax. Keep all layers driven by the same camera state so labels and connectors cannot drift from their subjects.

## Audit the route, not one hero frame

Sample the exact `reviewAt` time for every visit and excursion in `SPATIAL_CANVAS.json`; departure and return visits provide both sides of the cutaway. A passing canvas answers yes:

- Does geography carry meaning a slide sequence could not?
- Can the viewer locate the active region relative to a landmark?
- Does every move reveal, prove, trace, or hand off?
- Does each arrival settle before dense reading?
- Does every excursion return to a recognizable pose and revision?
- Does the discovery visibly mutate the world?
- Do overview/regional/detail LOD states preserve object identity?
- Does the final synthesis reveal more than the opening overview?
- Is every sampled frame identical from a cold seek?

Failure smells: Ken Burns over a giant image; arbitrary detective-board strings; camera tourism; unreadable overview text; zoom without new information; travel across empty territory; independent transforms drifting apart; screen-fixed labels pretending to be world-fixed; raster blur; a cutaway that resets the parent world; or a final pullback indistinguishable from the opening.

Implementation and ownership contract → `hyperframes-core/references/spatial-canvas.md`. Compound motion recipe → `hyperframes-animation/blueprints/spatial-canvas.md`; simple one-way stations → `hyperframes-animation/blueprints/spatial-pan-stations.md`.
