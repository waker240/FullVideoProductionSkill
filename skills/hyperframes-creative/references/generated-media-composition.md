<!-- Public portability adaptation, 2026-09-26. -->

# Generated media → directed composition

Read when a generated still or video must coexist with precise HTML/SVG/canvas content. [asset-generation.md](asset-generation.md) owns the current ImageGen call path, exact prompts, alpha and file provenance. Video generation uses the installed provider's skill and live schema; model, resolution, duration, paid budget and retry rules come from the user's current authorization, not the worked project below.

## Decide the ownership before generating

Write a compact media/composition contract before spending a generation:

```text
Scene / narration window / claim:
Generated role: material world, human performance, optical motion, environment…
Code role: exact UI, labels, counts, paths, conditional boundaries…
Source role: observed evidence or visibly qualified conceptual illustration?
Frame: aspect, usable subject scale, caption zone, maximum intended crop.
Camera: start framing → meaningful action → receiver/end framing.
Registration: screen quad / world anchors / fixed view-space overlay.
Occlusion: foreground objects that cross the code plane; owner of their mask.
Clock: source in/out, source native rate, start in scene, hold/cut policy.
Acceptance: specific motion, identity, geometry and reading tests.
```

Generated media excels at physical material and performance; code excels at exact change. Do not ask generated video to spell code, maintain a precise count, prove a measured causal chain or carry a research qualification. A visually coherent action can still invent the wrong mechanism. Keep those jobs explicitly assigned.

Prefer enough foreground, midground and background detail to support the planned view. State the physical nouns and surfaces: thin etched wafers, smoked glass, fine optical traces, controlled softbox reflections, a defocused near edge. “Premium cinematic 3D” alone does not specify a buildable world. Specify blank production surfaces and quiet text areas where needed, including what must stay empty during camera motion.

## Prompt a shot, then inspect the returned shot

For a still, request the strongest usable composition, expected crop and separable operators. For video, describe the trajectory and its consequence: for example, low camera travels along a wet port lane, near railings produce parallax, ordinary vehicles continue; or macro silicon reveals a larger fabricated skyline. Specify whether a camera is locked, dollying, tracking, revealing or changing focus. Avoid a list of incompatible moves in one short clip.

Pass an inspected local image as the real first-frame/reference input only through a supported tool mode. If upload/recovery results in a successful text-to-video submission, record **text-to-video** and treat the still and video as independent compositions. Similar appearance does not establish first-frame provenance. Preserve job IDs, submission prompts and actual returned metadata in the provider ledger.

Inspect returned images and time-sampled video frames before selection: subject identity, action continuity, readable silhouette, no unwanted morph, useful start/end framing and whether the requested camera move actually occurred. Inspect motion playback when available; do not label contact sheets a continuous watch. A better generated still can be selected over a weaker video—animation count is not a quality measure.

## Choose a composition branch

| Branch | Appropriate use | Necessary preparation |
| --- | --- | --- |
| Full-frame footage, then exact diagram/UI | World/scale first, mechanism second | A deliberate cut receiver and a factual/illustrative qualifier |
| Generated still plus layered motion | Material is strong, but exact change belongs in code | Clean plate, independent operator/occluder only where needed; no baked duplicate |
| Native-speed video plus code overlay | Material/performance continues under precise explanation | Separate media and code clocks, measured overlay registration and contrast |
| Registered screen replacement | People interacting with an exact modern IDE/dashboard | Blank stable planar screen, sampled corner track, occlusion/mask plan |
| Pure semantic SVG/DOM/canvas | Argument needs exact comparison/sequence | Purposeful choreography and scale; no decorative media obligation |

Separate wrappers by owner: `scene → media/camera world + exact world overlay + view-space captions`. If a code overlay belongs to a photographed object, it shares that object's camera parent; if it is an independent explanatory label, it stays in view space or has a calculated leader. A second full-frame camera move on top of moving generated footage can accidentally double the apparent motion. Assign ownership for each interval.

## Preserve clocks and state

For a selected clip with source start `s0` and scene entry `a`, the intended media time is `s0 + (sceneTime - a)` at native rate while it is active. Clamp to the selected out point only when a deliberate last-frame hold is part of the shot. Use framework-owned media playback and seek readiness from `hyperframes-core`; this equation specifies intent, not a license to introduce a competing player.

Do not stretch an eight-second performance across a twenty-second paragraph merely because the scene is longer. Options are: cut into an exact explanation, continue on a strong held frame while the code performs, introduce another shot, or shorten/restructure the window when authorized. After a held frame, an authored composite push may inspect the screen and a pullback may restore its human context; this remains a designed still composition, not twenty seconds of generated video.

Distinguish intentional final programme speed changes from silently slowing individual generated clips. If the user later requests a global speed change, transform the approved programme clock once according to that request and preserve the original source for future revisions. Do not accidentally use an accelerated delivery as the next version's native source.

During review-to-film retiming, keep exact action cues on the narration clock and media motion on its chosen source clock. Check the incoming frame after media ends; hidden legacy vectors, black gaps, stale poster images or prematurely exposed final diagrams often appear only at that boundary.

## Register precise foreground content

For planar screens, measure four corners in the **actual chosen output**, including `cover` crop and viewport scale. Save sampled quads with source times. Interpolate only where motion supports it; add samples at camera-direction changes. Draw the full UI into one canvas/texture and map its plane with a projective homography. Two independent affine triangles can introduce a visible diagonal bend through straight code rows.

A foreground hand crossing the screen requires occlusion. Track the actual overlap interval and mask the inserted screen content in its own coordinates; retain the underlying footage's finger. For a soft hand edge, use a limited feather appropriate to the photographed edge. Do not paint a guessed whole hand over the UI or let exact code cover the fingertip. Keep generated originals unchanged, and identify masks as composition assets.

Test registration at entry, motion extrema, last moving frame, held frame, subsequent composite push and return. Check all four borders and straight line baselines at full resolution. If a generated camera deforms the screen beyond a plane, regenerate, use a less ambitious shot, or author a suitable tracked warp; do not claim exact registration from a four-corner model that visibly fails.

For simpler overlays, map measured source points through image scale/offset and the parent camera transform. Measure leaders against the visible target, not the prompt's requested coordinates. Strong material imagery must not hide the mechanism: inspect overlay scale, separation, contrast and dwell on the final encoded frame.

## Freeze what was actually used

Along with normal prompt/provenance records, retain source in/out, playback rate, selected/rejected status, source-to-scene relation, tracked quads/masks, code/scene owner, output dimensions and hashes. Author acceptance and user choice are different fields. A reviewed generated asset is not by itself approval of every composite or scene that uses it.

For a portable implementation, record source in/out and rate in the asset manifest, tracked screen quads in project data, and narration cue times in the scene plan. Implement playback with the [core composition contract](../../hyperframes-core/SKILL.md); do not depend on a historical custom player.
