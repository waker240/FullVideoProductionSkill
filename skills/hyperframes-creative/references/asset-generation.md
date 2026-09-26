<!-- Public portability adaptation, 2026-09-26. -->

# Asset generation for HyperFrames

Use generated images for illustrations, stages, cutouts, substrates and material-rich components. Keep code-native factual text, counts, paths and word-locked changes where they benefit from precise timing. An image's role determines its decomposition; asset count is not a quality target. For an approved **B-paper / paper-theatre** direction, read [paper-theatre.md](paper-theatre.md) and its prompt companion before generation.

For generated video, rich material/character plates with exact overlays, or screen replacement, read [generated-media-composition.md](generated-media-composition.md) before prompting. It defines the shot/asset contract, separate media and narration clocks, measured registration and occlusion, and honest first-frame versus text-to-video provenance.

## Current tool path

Use the user's selected image provider or an available host image tool. This pack installs neither. In a Codex session exposing `image_gen`, follow its installed imagegen instructions and live schema. Else use a configured provider's supported API or supplied images. The legacy `genimg.cjs` adapter only works with a separately configured compatible local service; it is not the default or a bundled server.

Optional Codex functions-orchestrator example (only when these exact tools are available):

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 1000}
const result = await tools.image_gen__imagegen({
  prompt: "Use case: stylized-concept. Asset type: ... Full exact prompt here."
});
generatedImage(result);
```

For local references or an edit, first inspect **every target/reference** with `view_image` in an earlier call, then name the input roles in the prompt:

```javascript
// Inspect this before the image-generation invocation.
const seen = await tools.view_image({path: "/absolute/project/storyboard/approved.png"});
image(seen.image_url);
```

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 1000}
const result = await tools.image_gen__imagegen({
  prompt: "Input image 1 is the approved paper-material reference. Create ...",
  referenced_image_paths: ["/absolute/project/storyboard/approved.png"]
});
generatedImage(result);
```

Use `referenced_image_paths` when all target images have local paths. When some target has no local path, use the smallest permitted `num_last_images_to_include` that includes every intended target. Never pass both mechanisms; omit both for a new text-only image. For an edit, state the edit target, requested change and invariants. For reference-led generation, state what to borrow (material, identity, palette or geometry) and what to redesign.

The built-in does **not** expose `model`, `size`, `n`, `background`, `quality` or `output_dir` fields in this schema. Describe intended aspect, resolution and genuine transparency in the prompt, then inspect the actual output. Do not claim a requested model or size was verified unless tool metadata or the file establishes it. Many distinct assets/variants mean separate prompts and calls. If a call yields a running cell, resume it with the documented wait mechanism; return the result through `generatedImage` when complete.

Use the actual file path or save mechanism returned by the provider. Copy the accepted returned local file into the project's asset directory, preserving its original pixels and alpha. The render must not depend on the tool's private output path. If the tool supplies only displayed media and no local file path, use its documented output/save mechanism; do not invent a source path.

## Prompt construction

Use only the blocks that help the request. A repeatable project prompt normally specifies:

```text
Use case / asset type — storyboard frame, background, clean stage, isolated component, atlas.
Input roles — which image is the original style anchor, stage reference or edit target.
Style / material / lighting — concrete surface, edge, texture and lighting behavior.
Palette — color-to-role mapping, including the active operator and supporting relations.
Subject / mechanism — exact object, invariant, action and result; evidence boundaries.
Composition / background — view, hierarchy, frame aspect, empty text zones, alpha or opaque substrate.
Text / constraints — exact quoted static strings or completely blank production surfaces; relevant exclusions.
```

Lock a concise material/palette preamble across a series, but change composition and mechanism for each thought. Specific visual nouns and actions matter more than repeating “premium.” For an edit, emphasize what stays fixed and make one targeted correction at a time.

Keep argument-bearing text code-native when it must change, align to narration or remain numerically precise. A complete storyboard or thumbnail can use generated Chinese typography: quote the exact strings, name the hierarchy, specify that no other words appear, and inspect the resulting glyphs at full resolution. Strong text capability still requires verification.

## Save prompts and provenance

Save every generation's exact prompt beside its assets (`PROMPTS.md`, `_prompts.md` or `prompts/` following the project convention), keyed to the output. Include:

- asset role/scene and accepted project-local filename;
- tool route, requested model if relevant, and reported model metadata when available;
- exact input roles, reference/target paths and hashes;
- requested aspect/resolution and actual dimensions/color mode;
- returned original output path, copied-file hash, revisions and acceptance/rejection notes;
- component regions, masks and compositing method when used.

Append revisions rather than overwriting the history. Keep the accepted original PNG unchanged and separate from browser masks or composited previews. Preserve failed attempts when needed to explain a decision until the project's explicit cleanup pass; compact review records should survive their removal.

## True alpha, clean plates and masks

Ask the selected generator for **actual transparent alpha** outside isolated silhouettes and through internal holes. Preserve its generated alpha. A checker pattern visible in the image or an `.png` extension proves nothing. Inspect channels and edges before treating it as a cutout. A read-only Pillow check is sufficient for the channel test:

```python
from PIL import Image
im = Image.open("/absolute/project/assets/component.png")
print(im.size, im.mode)
if "A" in im.getbands():
    alpha = im.getchannel("A")
    histogram = alpha.histogram()
    print("alpha range", alpha.getextrema(), "transparent fraction", histogram[0] / (im.width * im.height))
else:
    print("No alpha channel: this is not an RGBA cutout")
```

This numerical test does not establish edge quality: an RGBA file may have transparent gutters but painted checkerboard inside holes. View the asset against the scene's actual cream/dark substrate, inspect interiors and moving boundaries, and record both results. Use the selected provider's supported extraction/edit path when the background remains baked in, following host tool policies and the user's requested method.

An **RGB plate with an authored SVG/CSS mask** is an honest alternate compositing method when its actual contours can be traced cleanly. Keep the RGB original, record the mask and crop geometry, and inspect edge slivers, inner holes and any baked shadow across the full movement. It is not a native transparent output. Do not replace the current built-in transparent route with a mandatory magenta/chroma-key workflow inherited from older projects.

When an operator will move independently, the underlying stage needs a clean plate. Remove its baked duplicate with the selected image-editing tool before animating the separate component, preserving stage geometry and material. Generate a distinct underside or foreground lip when a fold/peel must reveal thickness. Decompose only for independent motion, occlusion, parallax or factual registration.

## Size, registration and integration

Measure the returned image's true dimensions. Request enough detail for its largest on-screen size and intended camera push; inspect that actual crop for softness. Preserve aspect using proportional dimensions or `object-fit`; do not stretch an output to the requested box.

Map overlays from observed image coordinates through the applied `cover`/`contain` scale, offset and camera parent. Prompted placement is not measured geometry. For atlases, inspect each component, record true visible bounds and use additional masks when rectangular regions capture a neighbor. A tighter sheet is not better if it loses clean separation or resolution.

Treat an asset as an object in the scene. Put camera, entrance and internal motion on appropriate nested wrappers. A static evidence plate can hold while its surrounding mechanism changes; giving every cutout a perpetual float usually weakens physical credibility. Follow `hyperframes-core` and the animation adapters for seek-safe timelines and framework-owned media.

## Per-pass completion

An asset pass is ready when prompts/provenance are saved, selected files are project-local, actual dimensions and any alpha are verified, the reference-sized composite preserves the selected style, and the planned motion exposes no duplicate object, empty hole or fringe. Correct a material/composition failure at its source instead of spreading it across scenes.

See [cinematic-direction.md](cinematic-direction.md) for Canvas/Artifact/Cinema ownership, [paper-theatre.md](paper-theatre.md) for B-paper staging, and `hyperframes-media` / `media-use` for reviewed non-generated sources.
