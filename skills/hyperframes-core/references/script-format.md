<!-- Public portability adaptation, 2026-09-26. -->

# `SCRIPT.md` — locked narration (optional)

The **locked narration** for a project: the final spoken lines + voice + delivery. It is an _optional_ plan-layer file — a video with no narration (bgm-only, silent overlay) has none. The storyboard's per-frame `voiceover` is the lighter, editable _guide_; `SCRIPT.md` is the _commit_. (Storyboard format → `references/storyboard-format.md`.)

This file defines the SCRIPT.md **shape** only. Synthesizing the spoken lines into audio is a capability owned by `hyperframes-media` → `references/tts.md`.

Free-form markdown — there is no strict parser; the Studio renders it read-only beside the Storyboard board, and the TTS step extracts the indented spoken lines.

## Shape

A header block, then one section per spoken line.

| Part                            | Holds                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Header                          | `**Voice:**` (selected provider/voice or recorded speaker), `**Voice settings:**` (non-secret profile choices), `**Voice direction:**` (overall delivery)   |
| `## Line N — <label> (Frame N)` | one spoken line, tied to its storyboard frame                                                                                           |
| `**Time:**`                     | the board's rough window — a _guide_, not authoritative (real timing comes from TTS word timestamps)                                    |
| `**Delivery:**`                 | per-line delivery note                                                                                                                  |
| indented block                  | the **spoken text** — the only part fed to TTS                                                                                          |

## Example

```markdown
# SCRIPT — acme-launch

**Voice:** Selected project voice or recorded speaker
**Voice settings:** See `scripts/narration.json`; provider setup: `hyperframes-media`
**Voice direction:** Confident, warm, a little playful.

---

## Line 1 — Hook (Frame 1)

**Time:** 0.0 – 3.0s
**Delivery:** Land the promise on the beat.

    Ship a launch video in an afternoon.

## Line 2 — The problem (Frame 2)

**Time:** 3.0 – 7.0s
**Delivery:** Wry, a touch tired.

    The old way? Prompt, wait twenty minutes, get something that misses.
```

## To TTS

Move each line's spoken text into `scripts/narration.json` and retain the selected voice/provider. For the bundled Fish route, configure packaged Fish setup and run `node scripts/tts-fish.mjs`; secrets stay in the environment or private provider configuration. Alternatively import supplied/selected-provider audio through [pipeline.md](../../hyperframes/references/pipeline.md). Obtain actual word timing after synthesis/import; storyboard times are provisional.