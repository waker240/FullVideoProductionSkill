# Sound effects — explicit local files and manifests

Sound effects are local-only. A cue either names a file directly or resolves deterministically against a supplied/project-local manifest. The engine never searches a catalog or generates an effect.

## Direct local cue

```jsonc
{
  "lines": [{
    "id": "03",
    "text": "The result appears.",
    "sfx": [{
      "name": "soft confirmation",
      "path": "library/confirmation.wav",
      "source": "curated-local",
      "offset_s": 0.25,
      "volume": 0.28
    }]
  }]
}
```

`path` / `file` must resolve locally. The engine requires `ffprobe` to find a positive-duration audio stream even when the cue or manifest declares a duration, then copies the file into `assets/sfx/`.

## Manifest cue

Set `sfx_manifest` in the request, pass `--sfx-manifest`, or place a manifest at the project default `assets/sfx/manifest.json`:

```jsonc
{
  "whoosh": {
    "file": "whoosh.wav",
    "duration": 0.57,
    "source": "curated-local",
    "volume": 0.3
  },
  "typing": {
    "file": "typing.mp3",
    "duration": 2.4
  }
}
```

Manifest paths are relative to the manifest directory. A manifest may also be an array whose entries contain `id` / `name` plus `path` / `file`. String cues such as `"whoosh"` resolve by manifest key, name, id, filename, or normalized slug.

The output cue is:

```jsonc
{
  "id": "03",
  "name": "whoosh",
  "file": "assets/sfx/whoosh-3f2c9a7d8e11.wav",
  "source": "curated-local",
  "offset_s": 0,
  "duration_s": 0.57,
  "volume": 0.35
}
```

## Rules

- Keep SFX under narration; `0.2–0.35` is a useful starting range.
- Name the physical event precisely so reviewers can verify semantic fit.
- A missing or non-audio cue logs an anomaly and is skipped. It never blocks the render or triggers an online fallback.
- Keep source page, license, creator, and attribution with every curated asset.
- Reuse one reviewed asset for repeated semantic events unless variation is intentional.
- Review both excess and missing action coverage. Removing rejected whooshes must not silence all interface activations, typing, checkpoints or data-state changes. Record a retained, replaced or intentionally silent decision for meaningful cues; individual rejections override a liked aggregate palette. See [review and revision](audio-review-and-revision.md).
- Frozen filenames include a short content hash. Repeated cues from the same source share that file; distinct sources cannot overwrite each other even when their names slug identically.
