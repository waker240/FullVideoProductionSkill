<!-- Public portability adaptation, 2026-09-26. -->

# Eval: how to validate a translation end-to-end

Every translation should be measured. The skill ships three comparison scripts. The upstream test corpus is intentionally excluded; validate with the actual source and translated project.

## The three scripts

| Script                   | Input                       | Output                                                              |
| ------------------------ | --------------------------- | ------------------------------------------------------------------- |
| `scripts/lint_source.py` | Remotion source dir or file | JSON findings + exit code (0 clean, 1 has blockers)                 |
| `scripts/render_diff.sh` | two MP4 paths               | per-frame SSIM + JSON summary (`mean`, `min`, `p05`, `p95`, `pass`) |
| `scripts/frame_strip.sh` | two MP4 paths               | side-by-side comparison strip PNG for visual debugging              |

Run them in this order: **lint → render → diff → (if fail) strip**.

## Per-fixture flow

```bash
# Bash example; replace the three absolute paths.
R2HF_DIR="/absolute/path/to/skills/remotion-to-hyperframes"
SOURCE_DIR="/absolute/path/to/remotion-project"
TARGET_DIR="/absolute/path/to/hyperframes-project"
python3 "$R2HF_DIR/scripts/lint_source.py" "$SOURCE_DIR/src"
(cd "$SOURCE_DIR" && npm install && npx remotion render <CompositionId> out/baseline.mp4)
(cd "$TARGET_DIR" && npx --yes hyperframes@0.7.17 render --output translated.mp4)
bash "$R2HF_DIR/scripts/render_diff.sh" "$SOURCE_DIR/out/baseline.mp4" "$TARGET_DIR/translated.mp4" "$TARGET_DIR/diff"
bash "$R2HF_DIR/scripts/frame_strip.sh" "$SOURCE_DIR/out/baseline.mp4" "$TARGET_DIR/translated.mp4" "$TARGET_DIR/strip" 8
```

## Reading `diff/summary.json`

```json
{
  "frame_count": 90,
  "mean": 0.974,
  "min": 0.972,
  "max": 0.999,
  "p05": 0.972,
  "p95": 0.983,
  "threshold": 0.95,
  "pass": true
}
```

| Field         | What it tells you                                                           |
| ------------- | --------------------------------------------------------------------------- |
| `mean`        | average SSIM across all frames; the headline number                         |
| `min`         | worst frame; below threshold means at least one frame is structurally wrong |
| `p05` / `p95` | 5th / 95th percentile — most frames sit between these                       |
| `threshold`   | from `R2HF_SSIM_THRESHOLD` env var (default 0.85)                           |
| `pass`        | whether `mean >= threshold`                                                 |

## Historical upstream tier thresholds

These retained historical figures describe upstream fixtures, not validation performed by this public bundle. Recalibrate thresholds for your own project:

| Tier | Composition shape                           | Mean  | Threshold | Margin |
| ---- | ------------------------------------------- | ----- | --------- | ------ |
| T1   | single-element fade-in                      | 0.974 | 0.95      | +0.022 |
| T2   | multi-scene + spring + audio + image        | 0.985 | 0.95      | +0.016 |
| T3   | data-driven, custom subcomponents, count-up | 0.953 | 0.90      | +0.038 |

For your own fixtures, an optional `expected.json` can record:

- `ssim_threshold` — the gate for `pass`
- `validation` — the actual measured numbers from the calibration run
- `translation_notes` — what's lossy and why

## Critical: encoder config

Both Remotion and HF must output the same pixel format for SSIM to be
meaningful. Remotion's default JPEG output writes `yuvj420p` (full-range);
HF outputs `yuv420p` (limited-range). The mismatch costs ~0.05 SSIM.

Every fixture's `remotion.config.ts` sets:

```ts
Config.setVideoImageFormat("png");
Config.setColorSpace("bt709");
```

If the user's source doesn't have these, add them in the translation
step — otherwise the diff measures encoder differences, not translation
fidelity.

## What the noise floor looks like

The dominant non-translation noise is **system font fallback divergence**.
Remotion's bundled Chromium and HF's `chrome-headless-shell` interpret
`font-weight: 800` differently when there's no real font installed:

- Remotion HELLO at 160px: medium-weight stroke
- HF HELLO at 160px: heavy-weight stroke

This costs ~0.025 mean SSIM. Visible in T1's frame strip.
[fonts.md](fonts.md) covers how to mitigate (use Inter, load explicit
Google Fonts).

## Threshold rule of thumb

Set the threshold ~0.02 below measured `p05`:

- Real translation regressions drop mean by 0.05+ — caught.
- Encoder/font drift between CI runs is bounded at ~0.01 — not caught.

If a calibration run's measured mean is far above your initial threshold
guess, _don't_ tighten the threshold to fit. Leave headroom — fixtures
re-rendered on different hardware will drift.

## When the diff fails

1. **Look at `frame_strip.sh` output first.** A side-by-side strip at 6–10
   evenly-spaced timestamps shows whether the failure is structural
   (wrong scene durations, missing element) or cosmetic (different font
   weight, slight timing skew).
2. **Check `diff/ssim.log`.** Per-frame SSIM tells you _which_ frames
   failed. Cluster of bad frames in the middle of a scene = animation
   problem; bad frames at scene boundaries = sequencing problem.
3. **Re-read the relevant reference.** [timing.md](timing.md) for
   spring/easing issues, [sequencing.md](sequencing.md) for scene
   boundary issues, [media.md](media.md) for asset loading issues.

## CI integration

Run the comparison scripts against your own checked-in fixtures in a configured environment. This release does not include upstream producer/CI infrastructure or test-corpus assets. Record commands, runtime versions, source hashes and observed results for the actual translation.
