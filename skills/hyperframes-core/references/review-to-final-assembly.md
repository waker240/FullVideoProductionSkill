<!-- Public portability adaptation, 2026-09-26. -->

# From approved studies to a narration-locked film

Read when turning independently playable review scenes into a final film, or repairing an assembled long-form film. The interactive review host and deterministic render host have different responsibilities. Reuse artwork and pure scene functions; do not render a browser review UI or depend on iframe playback.

## Freeze and clock ownership

Freeze selected edition/candidate, source and recursively used module/asset hashes, user notes, protected intervals, narration text/audio and word alignment. Write a scene plan linking original source beats to the selected scene and its final start/end. Preserve source/global/act-local/scene-local/media-source clocks explicitly.

Quantize shared boundaries once to integer video frames and audio samples. Derive adjacent durations from the same boundary table; repeatedly rounding independent durations causes long-film drift. A final 60 fps/48 kHz programme has 800 samples per frame; at other rates calculate from rational frame rate and sample rate. Verify zero PTS, frame counts, sample counts, duration, captions and chapters in the encoded output.

## Re-author timing

Study duration is not spoken duration. Map meaningful source events to verified narration anchors, then direct anticipation, action, inspection, hold and release. Keep exact code and labels legible. A long paragraph may need additional details/returns or a changed shot boundary; uniformly slowing a 12-second study into a 40-second paragraph is not a timing solution.

A piecewise mapping can reuse pure source scene functions:

```js
// final local second -> original study second; illustrative, authored per scene
const points = [{time:0, source:0}, {time:4, source:4},
  {time:10, source:6}, {time:14, source:10}];
```

Camera and semantic state may use that mapping, but a source video window can be inferred only across a monotonic unit-slope segment. A repeated source interval or a hold makes inversion ambiguous. Give footage an explicit final start, trim, duration and native rate; cut/hold/extend the surrounding semantic composition rather than stretching generated action. If the source segment has embedded sound, explicitly choose whether it is used or muted.

## Native render bridge

- Register one paused timeline per composition synchronously. Drive SVG/DOM/canvas/Three state and camera from absolute time. No accumulated deltas or wall clocks.
- Mount video/audio as direct root children with native timing attributes and unique IDs. The framework injects/plays media; render code does not call `play()` or seek videos itself. Layer code-authored labels and masks relative to actual root media geometry.
- Put full-frame backgrounds on a full-bleed child. Preserve stage dimensions, transform origins, camera layers, font loading and alpha behavior. A review-host `#stage` lookup needs deliberate adaptation to the native local stage.
- A persistent relational world has one geometry/state/camera owner and exact return poses. Review each visit and the completed overview; don't use per-region rebuilds that erase geography or history.
- Validate both source and assembled host. Cache renders by full dependency hash, timing map, asset trim, font, runtime/render settings and captions. A source-file-only hash misses shared camera/module changes.

Use the ordinary modular composition contract in [sub-compositions.md](sub-compositions.md). A custom adapter should bind exact narration windows, preserve one timeline owner per scene, preload its project-local assets, and expose deterministic seek behavior. Treat adapter code as project implementation, not a private dependency required by this pack.

## Assembly and audit evidence

Direct every neighboring seam: outgoing/incoming focal object and screen position, movement vector, retained state, narration continuation, sound lead/tail and caption continuity. A hard cut can be the correct relationship; decorative transitions cannot repair an unrelated pair of compositions.

When scenes render as separate native projects, validate each native project, then validate the actual assembled file and a coverage manifest over all selected scenes/seams. Generic single-root scanners may report zero assets/registers when they do not descend into native projects. Record that precise applicability limitation and equivalent evidence; do not fake an unused root composition or waive malformed media/timing. Parser exceptions never excuse missing review work or an explicit user requirement.

Each required full audit loop records the encoded file/hash, exact timebase and sampled windows, every scene and adjacent seam, observed weakness, repair/source change and re-encoded confirmation. Use denser trajectories for long scenes and all major camera turns; three pleasant stills cannot prove a whole shot. Mark subjective sound unassessed when it was not heard. Preserve compact evidence and hashes when bulky intermediate review renders are later removed.

For a speed revision, retain a zero-origin original-speed picture master. Transform picture, speech and synchronized effects together, preserving speech pitch if requested; only then add music at its requested independent rate. Retime captions/chapters from the authoritative transform. For independent act delivery use exact decoded frame spans and re-encode where a boundary is not independently decodable; `-c copy` at an arbitrary timestamp can retain leading GOP content. Check the first/last several decoded frames against the complete master, audio boundaries, first IDR and browser seek behavior.

For a localized narration repair, retain the timing window when feasible, verify unchanged PCM outside the patch and unchanged picture packets when picture is untouched. Rebuild affected subtitle text only if the authoritative wording changes. Regenerate and verify the complete and affected act downloads and update their hashes; reuse valid unrelated verification with an explicit scope instead of claiming a fresh whole-film perceptual audit.
