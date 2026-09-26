# Review decisions and derivative provenance

Read when assets have multiple versions, audition choices, generated material or final-release reuse. The resolver remains a local ingestion tool. Its manifest proves what was frozen; an editorial record proves why it was chosen and where it is used.

## Preserve distinct states

Keep the source catalog, user decisions, asset review and release use separate:

| Record | Answers |
| --- | --- |
| Candidate catalog | What files exist, where they came from, and what they might be used for |
| Review decision | Which revision/user selected, shortlisted or rejected an exact candidate |
| Asset inspection | What was actually viewed/heard/measured, its limitations, and permitted role |
| Frozen manifest | Which local source bytes, rights and review note were ingested |
| Composition/cue map | Which scene/variant uses which frozen asset or derivative |
| Release manifest | What actually entered the current rendered delivery |

A candidate catalog may still say `CANDIDATE_UNREVIEWED` after a later user choice. Preserve it as the original inventory; link the separate decision revision instead of rewriting history. Conversely, a selection in an old generation manifest is only selection for that revision, not proof that the file survives in the final release. Trace the current scene configuration or cue sheet to current encoded delivery before claiming final use.

Individual rejections take precedence over a favored montage or sound palette containing that item. Check source hashes as well as ids so a rejected source cannot reenter through another filename or cache record. Keep a shortlisted-but-unused asset's exclusion reason when useful; a shortlist is not a requirement to use everything.

Do not infer subjective review from `reviewed: true`, a successful decode or a played browser element. Record the real basis: user audition, supported audio perception, visual sample inspection or technical/source-only review under delegated selection. The last category must retain its limitations without inventing heard qualities.

## Track derivatives without losing originals

Retain originals unchanged. An audition excerpt, alpha cutout, crop, graded still, proxy video, speed-adjusted clip or mixed cue is a derivative with its own hash. In a project-side JSON record, keep at least:

```jsonc
{
  "assetId": "candidate-stable-id",
  "source": { "file": "private/source.wav", "sha256": "..." },
  "review": { "record": "review-snapshot.json", "revision": 3, "choice": "favorite", "basis": "user audition" },
  "frozen": { "file": ".media/sfx/source.wav", "sha256": "...", "manifestId": "sfx_001" },
  "derivative": {
    "file": "assets/sfx/short-action.wav",
    "sha256": "...",
    "transform": { "sourceStartSeconds": 0.2, "durationSeconds": 0.8, "gainDb": -9, "fadeOutSeconds": 0.06 },
    "commandRecord": "processing.json"
  },
  "uses": [{ "sceneId": "act02-sc03", "variant": "A", "role": "visible switch activation", "release": "r3" }]
}
```

This is an editorial-record example, not a new required resolver schema. Use the resolver's supported review/source/license/hash flags, then join its returned record to this richer project metadata. Keep arguments as structured arrays or files so rebuilds preserve exact processing. Verify frozen source hash before deriving, derivative hash after processing, and intended duration/format before wiring.

## Generated image and video handoff

Creation belongs to the available image/video generation skill or tool. After authorized generation, save the prompt, references, actual tool/provider, returned model if known, job/resource ids, output dimensions/duration, original filename, hash and review result. Record budget reservation separately from actual reported or settled credits. A pending job or a local file alone is not reviewed material.

Use `image` ingestion for supported local raster assets. This resolver's current types do **not** include `video`; preserve reviewed clips in a project-local generated-asset manifest and freeze/copy them with explicit hashes rather than inventing a `--type video` invocation. Never render from a pending provider job or a remote temporary output URL.

Keep the asset's role specific:

- A rich stage image is a substrate, not a finished causal scene. Exact text, counts, code, topology and state changes remain authored/checkable layers.
- A generated image with baked lighting/perspective is not a transparent cutout or an orbitable 3D world. Record alpha reality and safe crop/parallax range; calibrate overlays to the depicted plane.
- A generated video may be a continuous background, a deliberate cut-in or an unused alternate. Do not pretend an unmatched text-to-video result is a seamless continuation of a still.
- Preserve the actual submission mode separately from the planned mode. A text-to-video submission that only describes a reference image is not an image-to-video submission; retain the actual submitted fields and input hashes.
- Review generated motion at the intended clip speed. Avoid slowing short footage merely to fill a narration window when it produces visible stepping; trim/cut, hold a purposeful still or continue authored layers instead. The user preferred native-speed footage in `act08-sc08`; a later explicit whole-program speed change is a separate operation.
- Generated video may contain an unrequested audio stream. Inspect the stream and explicitly mute or separately review it; do not let unreviewed embedded music/SFX bypass the sound workflow.
- Inspect beginning, middle, end and any action discontinuity; record identity, object-count, camera and material consistency. State sampled coverage honestly. Generated demonstrations are conceptual footage, not documentation of an actual event.
- If the image tool exposes no exact model selector/version, record that uncertainty. A requested marketing model name is not proof of the model used.

Keep unselected outputs when they preserve useful research or avoid a repeat generation, but do not adopt them just to increase asset count or spend the remaining budget. For example, a generated video may be reviewed and rejected because a layered still has clearer detail. Mark generated, reviewed, selected and final-release-used as separate states.

For each project, maintain asset manifests for generated images/video and reviewed music, with source hashes, actual submission modes, review decisions, derivative history and final shot references. These records belong to that project; no private reference project is required.
