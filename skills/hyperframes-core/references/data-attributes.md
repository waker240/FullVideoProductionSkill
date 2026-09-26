# Data Attributes Reference

Every HyperFrames composition uses `data-*` attributes to declare timing and structure to the framework. This is the full attribute table — pair with `tracks-and-clips.md` for the rules behind `data-track-index`.

## Composition Root

Every renderable composition needs one root element:

| Attribute                    | Required | Meaning                                                                          |
| ---------------------------- | -------- | -------------------------------------------------------------------------------- |
| `data-composition-id`        | Yes      | Unique ID. Must match the animation registry key on `window.__timelines`.        |
| `data-width` / `data-height` | Yes      | Pixel frame size. Common values: `1920x1080`, `1080x1920`, `1080x1080`.          |
| `data-duration`              | Yes      | Duration in seconds. This is the render duration, not the GSAP timeline length.  |
| `data-fps`                   | No       | Optional frame rate hint. CLI render flags can override output fps.              |
| `data-composition-variables` | No       | JSON array of variable declarations (on `<html>`). See `variables-and-media.md`. |

The root should be `position: relative`, have explicit pixel dimensions, and hide overflow unless intentionally composing outside the frame.

## Clip Attributes

Timed child elements are clips. **`class="clip"` is required on visible timed elements** (`<div>`, `<img>`, etc.) — without it the runtime keeps the element visible for the whole composition, ignoring `data-start` / `data-duration`. Omit on `<video>` (framework manages visibility directly) and `<audio>` (no visual).

**Clips must be DIRECT children of the composition root.** A clip nested inside a wrapper `<div>` is not registered — most visibly, a `<video>` in a wrapper is never seeked/decoded and renders black. To wrap/transform a clip, put the wrapper _inside_ the clip, or animate the clip element itself; do not wrap the clip. (`<video>`/`<audio>` additionally must be at the **host** root, never in a sub-comp `<template>` — see `variables-and-media.md`.)

| Attribute          | Required                                        | Meaning                                                                                                                           |
| ------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | Yes                                             | Stable DOM ID for linting, timeline targets, and debugging.                                                                       |
| `data-start`       | Yes                                             | Start time in seconds, or a supported clip-time reference.                                                                        |
| `data-duration`    | Required for `div`, `img`, and sub-compositions | Duration in seconds. Video/audio can default to media duration when known.                                                        |
| `data-track-index` | Yes                                             | Timeline track. Clips on the same track must not overlap.                                                                         |
| `data-media-start` | No                                              | Offset into the media source, in seconds.                                                                                         |
| `data-volume`      | No                                              | Static audio volume, `0` to `1`, default `1`. For fades, animate `volume` on the timeline instead (see `variables-and-media.md`). |
| `data-has-audio`   | No (`<video>` only)                             | `"true"` to declare the video carries an audio track when auto-detection would miss it.                                           |

**Visibility window is inclusive of both ends.** A clip shows while `start ≤ t ≤ start + duration` — it still renders at exactly `t = start + duration`, so the final frame holds the animation's resolved end state (the runtime does not hide it one frame early). A reveal/entrance that lands on `data-duration` is therefore visible on the last frame; you do not need to finish it _before_ `data-duration` just to guarantee the end state renders. (Climax-dwell guidance in `/hyperframes-animation` is about pacing, not this boundary.)

## Sub-Composition Host Attributes

When a clip is a sub-composition host (loads another composition file):

| Attribute                    | Required | Meaning                                                                |
| ---------------------------- | -------- | ---------------------------------------------------------------------- |
| `data-composition-id`        | Yes      | The internal composition ID of the loaded file.                        |
| `data-composition-src`       | Yes      | Path to the sub-composition HTML file.                                 |
| `data-width` / `data-height` | Yes      | Render dimensions for the sub-composition instance.                    |
| `data-variable-values`       | No       | Per-instance variable overrides as JSON. See `variables-and-media.md`. |

See `sub-compositions.md` for the full wiring pattern.

## Authoring Hints

- `id="root"` — template convention used by scaffolds and the transition catalog so CSS can target the composition root with `#root` instead of `[data-composition-id="main"]`. Not required by the runtime, but consistent with the rest of the ecosystem.
- `class="clip"` — required runtime visibility marker on visible timed elements (`<div>`, `<img>`, …). See Clip Attributes above.
- `data-layout-allow-overflow` — tells `hyperframes inspect` that overflow on this element (or its descendants) is intentional. Notes:
  - `inspect` measures `getBoundingClientRect` at sampled timestamps, not rendered pixels — `overflow: hidden` clips the visual but does **not** suppress an `inspect` overflow finding. This attribute is the escape hatch; CSS overflow is not.
  - Can be set on the composition **root** as well as on any child. When the cited offender is `div.<comp>-root inside div.<comp>-root` (the root reports its own children's union as overflowing), the fix goes on the root, not on individual text descendants — shrinking font sizes will not converge.
  - In a multi-scene `group_wN.html` (continue runs), every scene-local element stays in the DOM during the other scenes' time windows; the layout-box union almost always overflows the canvas during morph seams. Mark the root and every scene-local primary/supporting element with this attribute **at construction**, not after `inspect` flags it.
  - **Blast radius — it silences more than `inspect`.** The attribute is inherited down the subtree (the perception probe walks ancestors), so it suppresses rendered-perception checks such as `text-clipping` and `content-cramped-container` for every descendant. Putting it on a persistent panel that also hosts real foreground content disables those checks on that content for the panel's whole lifetime. Prefer the narrowest opt-out: scope it to the smallest decorative wrapper, or use per-element `data-layout-bleed="true"` for one intentional primary-text crop. `primary-offscreen` and `foreground-over-panel` deliberately still run under allow-overflow, so it cannot hide a wordmark sliced by the frame or text bleeding onto a panel edge.
- `data-layout-ignore` — exclude this element from layout audits entirely.

### Spatial Canvas authoring metadata

These attributes link Spatial Canvas semantics to code. All are consumed by the project-local `check-spatial-canvas.cjs`; the inline-excursion marker also sits on a native HyperFrames clip:

| Attribute | Place it on | Meaning |
| --- | --- | --- |
| `data-hf-spatial-canvas="<id>"` | the persistent composition root | links the composition to `SPATIAL_CANVAS.json` |
| `data-hf-spatial-world="<id>"` | the sole camera-transformed world | declares camera-transform ownership |
| `data-hf-spatial-host="<id>"` | the unique direct child slot under the top-level `index.html` composition root | maps explicit local host timing to the assembled global timeline; its native composition id/src/dimensions/start/duration/track must match the owner, and it is omitted only for `scope: "scene"` when the marked composition itself is `index.html` |
| `data-hf-spatial-region="<id>:<region-id>"` | each declared region wrapper | links semantic bounds/claim to one code-owned object |
| `data-hf-spatial-landmark="<id>:<landmark-id>"` | each persistent orientation cue | proves the itinerary's landmark has one visual owner |
| `data-hf-spatial-connector="<id>:<connector-id>"` | each relationship path/group | links the manifest relationship to registered world geometry |
| `data-hf-spatial-portal="<id>:<portal-id>"` | each nested-world entry artifact | links an optional portal to its source region and target canvas |
| `data-hf-spatial-excursion="<id>:<excursion-id>"` | a direct-root `class="clip"` with matching local `data-start`, `data-duration`, finite `data-track-index`, and `data-hf-spatial-space="view"` | gives an in-composition cutaway one real, uniquely owned visibility window; external cutaways use their host instead |

Use only after the Spatial Canvas admission and follow `references/spatial-canvas.md`. Never put inherited `data-layout-allow-overflow` on the world/root/viewport or any semantic-text ancestor. Isolate intentional overflow in the narrowest text-free decorative leaf so readable arrival text still receives the full layout audit.

## Legacy / Removed Attributes

These names appear in older projects and examples. Use the current names when authoring or editing:

| Legacy name  | Use instead        |
| ------------ | ------------------ |
| `data-layer` | `data-track-index` |
| `data-end`   | `data-duration`    |
