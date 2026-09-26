# Spatial Canvas — composition contract

Technical contract for a persistent oversized world navigated by a virtual camera. Read the direction/admission guide first: `hyperframes-creative/references/spatial-canvas.md`.

“Spatial Canvas” is a staging grammar, independent of renderer. The world may be DOM/SVG, Canvas 2D, a hybrid, or admitted Three.js. It is always finite, authored, and deterministic.

## Ownership invariant

One canvas id has one geometry source, one camera owner, and one composition owner.

- Keep an exact overview → visit → optional excursion/return → synthesis journey in one long-lived composition.
- For a sequence, mount that world composition for the full sequence. Put external cutaways on higher host tracks while the world remains mounted underneath; keep inline excursions as exact-window native clips inside the world composition.
- Split only at an intentional act-level orientation reset. Independent files must not recreate the same world by eye.
- A nested canvas is a separate composition with its own id and route; the parent stays mounted and supplies the return ticket.

This is the narrow exception to the ordinary “one file per section” shape. It is not permission to put unrelated film scenes, media, captions, and cutaways into one giant file.

## Project contract

When selected:

1. Create project-root `SPATIAL_CANVAS.json` from `hyperframes/templates/SPATIAL_CANVAS.example.json`; use safe 2–64 character ids (`A–Z`, `a–z`, digits, `_`, `-`, beginning with a letter).
2. Mark the composition root `data-hf-spatial-canvas="<canvas-id>"`, transformed world `data-hf-spatial-world="<canvas-id>"`, and each declared semantic object once as `data-hf-spatial-region|landmark|connector|portal="<canvas-id>:<object-id>"`. An in-composition excursion additionally has one direct-root native `class="clip"` owner marked `data-hf-spatial-excursion="<canvas-id>:<excursion-id>"`.
3. Run `node scripts/check-spatial-canvas.cjs` as part of validation before route snapshots and the spatial gate.
4. Give every visit a local `at` / `duration` / `reviewAt`, and every excursion its own local visibility `at` / `duration` / `reviewAt`; visit review samples stay outside excursion visibility windows. Route tools convert them to global time at the unique direct-root `index.html` host, whose id/src/dimensions and explicit finite start/duration/track satisfy the native sub-composition contract. The only hostless case is a `scope: "scene"` root owner whose manifest `composition` is `index.html`; sequence/spine may never self-mount `index.html`.

The manifest viewport must equal the marked root and mounted host `data-width` / `data-height`; the checker uses those same dimensions for region and landmark visibility. The first visit is an `orient` overview at local zero, the final visit is a `synthesize` overview whose endpoint equals the marked root duration, and both show at least two declared landmarks.

The root/world/semantic markers are metadata for validation/discovery. An inline excursion deliberately combines its Spatial Canvas marker with native clip timing so HyperFrames owns its real visibility window. `SPATIAL_CANVAS.json` declares the backend (`dom-transform`, `svg-viewbox`, `canvas2d`, `hybrid`, or admitted `threejs`), world bounds, regions, visits, and excursions.

The v1 topology floor is two bounded regions with focal `anchorX/anchorY`, two persistent point landmarks, one typed connector (`type`, `from`, `to`, `meaning`) whose endpoints name regions/landmarks, and filled `lod.overview` / `lod.regional` / `lod.detail` responsibilities. Optional portals name a source region and another declared canvas id. This keeps orientation and relationship semantics explicit instead of hidden in drawing code.

An optional nested-canvas portal uses this manifest shape and one matching DOM marker in the parent world. The target is another complete entry in `canvases[]`; the parent remains mounted while the child owns its own route. Exactly one parent excursion names the portal with `portalId`, sets `cutawayComposition` to the target canvas composition, and gives the child host the exact globalized excursion window.

```json
{
  "portals": [
    {
      "id": "ledger-door",
      "region": "link",
      "targetCanvas": "ledger-detail",
      "purpose": "Enter the account history without losing the parent relationship."
    }
  ]
}
```

```html
<button data-hf-spatial-portal="investigation:ledger-door"></button>
```

```json
{
  "excursions": [
    {
      "id": "open-ledger",
      "at": 5.6,
      "duration": 5.0,
      "reviewAt": 8.2,
      "portalId": "ledger-door",
      "cutawayComposition": "compositions/ledger-detail.html",
      "departVisit": "inspect-link",
      "returnVisit": "return-link",
      "returnMode": "exact",
      "returnMutation": "The account-history path is now confirmed."
    }
  ]
}
```

## Layer topology

Use separate transform owners:

```text
composition root
├─ full-bleed fill                     fixed; never camera-transformed
├─ viewport (overflow:hidden)
│  └─ jolt rig                         optional shake/roll owner
│     └─ world                         sole camera transform owner; no broad audit exemption
│        ├─ substrate / parallax layers decorative-only; narrow exemptions allowed here
│        ├─ world-space SVG connectors
│        ├─ regions / landmarks / portals
│        └─ world-space labels + annotations
├─ in-composition excursion clip       fixed view space; native local start/duration
└─ justified HUD / lens / local chrome fixed view space
```

Film captions, BGM, narration, host media, and external cutaway sub-compositions remain direct children of the host root per their normal contracts.

Never put inherited `data-layout-allow-overflow` on the world, viewport, root, or another ancestor of semantic region text: it suppresses descendant layout checks at every camera stop. If a decorative substrate or connector intentionally exceeds its box, make it a separate text-free leaf/layer and exempt only that object. Use LOD opacity windows so off-camera text is not audit-visible during travel, while arrival and overview text remains fully checked.

## Canonical DOM camera

Author region bounds and camera poses as constants. Do not discover them with per-frame DOM measurements.

```html
<template>
  <style>
    #root { position:absolute; inset:0; overflow:hidden; }
    .fill { position:absolute; inset:0; background:#171512; }
    .viewport { position:absolute; inset:0; overflow:hidden; }
    .jolt { position:absolute; inset:0; }
    .world {
      position:absolute;
      width:4800px;
      height:3000px;
      transform-origin:0 0;
      will-change:transform;
    }
    .fixed-overlay { position:absolute; inset:0; pointer-events:none; }
  </style>

  <div id="root" data-composition-id="s2-s5-canvas" data-width="1920" data-height="1080"
       data-duration="20" data-hf-spatial-canvas="investigation">
    <div class="fill"></div>
    <div class="viewport">
      <div class="jolt" id="investigation-jolt">
        <div class="world" id="investigation-world" data-hf-spatial-world="investigation">
          <div class="world-substrate" data-layout-allow-overflow><!-- text-free decoration only --></div>
          <!-- This marker set matches SPATIAL_CANVAS.example.json. -->
          <section id="investigation-origin" data-hf-spatial-region="investigation:origin"><!-- authored region --></section>
          <section id="investigation-link" data-hf-spatial-region="investigation:link"><!-- authored region --></section>
          <div data-hf-spatial-landmark="investigation:origin-pin"><!-- persistent cue --></div>
          <div data-hf-spatial-landmark="investigation:ledger-tab"><!-- persistent cue --></div>
          <svg data-hf-spatial-connector="investigation:evidence-path"><!-- registered path --></svg>
        </div>
      </div>
    </div>
    <div class="fixed-overlay"><!-- HUD only; timed excursion pattern below --></div>
  </div>

  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    const world = document.getElementById("investigation-world");
    const VW = 1920, VH = 1080;
    const focus = { x: VW / 2, y: 480 }; // optical center above caption rail
    const cam = { cx: 2400, cy: 1500, zoom: 0.36 };

    function applyCamera() {
      world.style.transform =
        `translate3d(${focus.x - cam.cx * cam.zoom}px,` +
        `${focus.y - cam.cy * cam.zoom}px,0) scale(${cam.zoom})`;
    }
    applyCamera();

    tl.to(cam, {
      cx: 1260, cy: 920, zoom: 0.92,
      duration: 1.8, ease: "power3.inOut", onUpdate: applyCamera
    }, 2.2);
    tl.fromTo("#investigation-origin", { opacity: 0.35 }, {
      opacity: 1, duration: 0.5, ease: "power2.out"
    }, 4.0);

    window.__timelines["s2-s5-canvas"] = tl;
  </script>
</template>
```

With transform origin `(0,0)`, world point `(cx, cy)` lands at the optical focus:

```text
screenX = worldX × zoom + focusX − cx × zoom
screenY = worldY × zoom + focusY − cy × zoom
```

All camera tweens mutate the same `cam` object and call the same writer. Shake or roll uses the outer `jolt` wrapper so it cannot corrupt an exact return pose. Parallax layers derive from `cam`; they do not invent independent cameras.

For `svg-viewbox`, the authored visit poses map to viewBox bounds. For Canvas 2D, keep the bitmap viewport-sized and redraw every seek from logical world state plus the camera matrix; never rely on accumulated prior drawing. For a hybrid, DOM/SVG labels and Canvas imagery must share the same authored coordinates. For admitted `threejs`, v1 deliberately keeps the route planar: one adapter maps `{cx,cy,zoom}` to a rig with fixed orientation and fixed FOV (for example, `cx/cy` → ground-plane target and `zoom` → deterministic dolly distance). The manifest pose remains authoritative, the marked world wrapper owns the renderer, and exact returns pass through that same adapter. Do not animate hidden yaw/pitch/roll/FOV degrees outside the route contract; use an ordinary 3D scene or a future schema when free-orbit perspective is essential. The normal true-3D quality/admission gate still applies.

## Regions, LOD, and local state

- Absolute `left/top` is correct for static world registration. Animate local objects through child wrappers with transforms/opacity; the camera owns the world wrapper transform.
- Put connectors and their subjects in the same coordinate space. Precompute SVG paths or control points.
- World revision is a pure function of timeline time. A region never depends on an event-driven `visited` boolean or prior playback.
- Overview/regional/detail LOD can crossfade through opacity at authored zoom phases. Preserve object identity; do not swap to an unrelated drawing.
- Raster source dimensions must cover their largest on-screen size at the deepest visit zoom.
- Dense text enters or becomes readable after arrival. During travel, use landmarks, silhouettes, paths, and short labels.

## In-composition excursions

An inline excursion omits `cutawayComposition`, is a direct child of the composition root, and uses the native clip lifecycle. Its `data-start` / `data-duration` exactly equal the manifest excursion's local `at` / `duration`; `data-track-index` is finite and non-conflicting. Mark the clip with `data-hf-spatial-excursion="<canvas-id>:<excursion-id>"` and `data-hf-spatial-space="view"`. Animate opacity/transforms on an inner wrapper, never on the lifecycle owner itself:

```html
<div id="dossier-excursion" class="clip"
     data-start="5.6" data-duration="5" data-track-index="2"
     data-hf-spatial-excursion="investigation:origin-dossier"
     data-hf-spatial-space="view">
  <div id="dossier-excursion-inner" class="fixed-overlay"><!-- cutaway proof --></div>
</div>
```

This keeps the world mounted while HyperFrames makes the overlay genuinely active only for the declared window. Faceless compound frames use this form. Do not add an inline excursion marker for an external cutaway; its sibling host owns the window instead.

## Host-level excursions

For a cutaway that deserves its own composition, set a distinct `cutawayComposition`, add no inline excursion marker, keep the canvas slot mounted for the whole sequence, and mount the cutaway above it:

```html
<div id="canvas-slot" data-hf-spatial-host="investigation"
     data-composition-id="s2-s5-canvas"
     data-composition-src="compositions/s2-s5-canvas.html"
     data-start="18" data-duration="20" data-track-index="1"
     data-width="1920" data-height="1080"
     style="position:absolute;inset:0;z-index:0"></div>

<div id="detail-slot" data-composition-id="s3-detail"
     data-composition-src="compositions/s3-detail.html"
     data-start="23.6" data-duration="5" data-track-index="2"
     data-width="1920" data-height="1080"
     style="position:absolute;inset:0;z-index:10"></div>
```

Track index governs temporal overlap, not paint order; set z-index explicitly. The main timeline owns any fade on host slots because a child timeline cannot animate a sibling slot. The canvas may hold during the excursion or advance intentionally, but that behavior is authored on its own deterministic timeline.

Every excursion declares a local `at` / `duration` visibility window, an in-window `reviewAt`, `returnMode`, and `returnMutation`. It starts inside the departure visit window and ends no later than the return visit begins; its departure/return revisions differ. Visit review samples remain outside that window so a cutaway cannot hide their evidence. For an external cutaway, exactly one distinct direct-root native host—with the cutaway root's exact composition id and dimensions plus explicit timing/track—must cover the full globalized interval, not only the review frame. When that composition is another declared Spatial Canvas, the parent excursion must name its portal with `portalId`; ordinary cutaway compositions do not. `returnMode: "exact"` is the default: the return visit uses verb `rejoin`, the same region, and the departure `{cx,cy,zoom}` within optional `returnTolerance.center` / `.zoom`. Use `returnMode: "reorient"` only with a filled `returnReason`; the route must visibly restore orientation rather than pretending the pose matched.

Host video/audio still follows the direct-root-child media rule. Do not hide media inside the canvas template.

## Validation

`check-spatial-canvas.cjs` verifies manifest shape, one-owner markers, host location/count, viewport/root/host dimensions, finite bounds and poses, semantic orient/synthesize endpoints and landmark visibility, visit/excursion windows and review times, referenced regions, focus visibility, composition/host coverage, exact native inline-clip ownership, distinct full-window external cutaways, bidirectional nested portal/child linkage, excursion references, and exact-return tolerance or declared reorientation. It intentionally does not judge taste.

Then run the normal `lint` / `validate` / `inspect`. Oversized off-camera content makes a single inspect verdict incomplete, so also snapshot:

- opening overview;
- every visit's `reviewAt` arrival/hold and every excursion's cutaway `reviewAt`;
- deepest zoom;
- both sides of every excursion and return;
- final synthesis.

At each stop, inspect visible-region clipping, caption clearance, text at effective camera scale, connector registration, one dominant focus, and cold-seek equivalence. Review the same route samples again on the encoded master.
