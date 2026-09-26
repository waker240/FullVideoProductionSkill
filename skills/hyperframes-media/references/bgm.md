# Background music — frozen local files only

The shared audio engine does not search for or generate music. Choose, license, download, and review a track as a separate curation step, then point `audio_request.json` at the frozen local file.

```jsonc
{
  "bgm": {
    "path": "library/documentary-pulse.mp3",
    "source": "curated-local",
    "volume": 0.18
  }
}
```

- `path` may be absolute or relative to the HyperFrames project/request directory.
- `source` is optional provenance metadata. When `path` is absent, `source` may itself hold the local path for compact adapters.
- `volume` is optional, clamped to `0–1`, and defaults to `0.18`.
- `duration_s` may be declared as editorial metadata, but it never bypasses validation. `ffprobe` must still find a positive-duration audio stream.

The engine copies the file into `assets/bgm/` using `<stem>-<content-hash>.<ext>`, writes `mode: "local"`, and returns only after the file is present. Hashing prevents equal basenames from overwriting each other and makes refreezing the same content deterministic. `bgm: null` or an omitted field means no music. A missing or non-audio file is omitted with an anomaly; it never causes retrieval, generation, package installation, or a pending job.

## Editorial rules

- Use one coherent musical direction; a long argument may need several reviewed tracks, deliberate silence and phrase-aligned entries. A cue sheet should record each source region, film interval, fade, level and narrative reason. Do not loop a track over the whole film merely because it was favored.
- Duck under narration and audit on headphones plus laptop speakers.
- When the user requests faster picture/narration with original-speed music, retime the picture, voice and synchronous SFX first; construct the BGM on the final clock at its native speed. Drive dialogue ducking with a separate voice-only stem so effects do not pump the music. See [review and revision](audio-review-and-revision.md).
- Record the source page, license, creator, and attribution alongside the frozen asset.
- Freeze the exact reviewed file; do not render from a remote URL.
- Prefer silence over an unlicensed or semantically wrong track.
