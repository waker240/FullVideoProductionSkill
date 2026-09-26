<!-- Public portability adaptation, 2026-09-26. -->

# Audio Direction — voice, music, effects, mastering

The audio layer is directed, not generated. This file covers: directing TTS rhythm, the Fish voice contract, mastering, STT, the explicit **BGM decision** (bed by default, intentional silence allowed), and SFX (earned).

For requested audition pages, replacing disliked SFX, a later BGM decision, programme speed changes or localized voice repairs, read `hyperframes-media/references/audio-review-and-revision.md`. New explicit review choices supersede old no-BGM notes; favorite/shortlist/reject and actual final usage are distinct. Use [review-publishing.md](review-publishing.md) for cross-device HTML/ngrok delivery. Do not claim listening quality from ASR, decode or loudness measurements.

---

## 1 · You are the director of rhythm

**TTS pacing is a creative instrument, not a fixed setting.** Before generating a single chunk, read the whole script and decide where the voice should **breathe, rush, land, and hold** — exactly as you'd direct a human VO artist. Match rhythm to each scene's job: hook (brisk, clipped) → exposition (steady) → insight/crack beats (slow, weighted, air around them) → close (slowest, let it ring). A fixed-tempo read is the tell of a lazy build.

Levers (all recorded in `narration.json` so the read is reproducible):

- **Plain-text direction** — punctuation, sentence length, and paragraph boundaries do most of the work. Keep synthesis text plain; do not inject unsupported markup.
- **Profile-level prosody** — when the whole read needs a different cadence, change the explicit non-secret `voice` profile in `narration.json`. Start from `/fish-audio-api`; record the deliberate project value instead of relying on a hidden runtime default.
- **Sentence-internal pacing** — make clauses separate paragraphs/chunks and use `gapAfter` or an explicit silence paragraph before concatenation:

In `narration.json`, a normal lead-in, half-second beat, and landing line becomes:

```json
{
  "paragraphs": [
    { "tts": "这些机器，", "lines": ["这些机器，"], "gapAfter": 0.5 },
    { "tts": "该归谁？", "lines": ["该归谁？"] }
  ]
}
```

```bash
node scripts/tts-fish.mjs --section s9
node scripts/concat.js
```

- **Dramatic silence** — `apad=pad_dur=N` (trailing air), an `anullsrc` gap clip, or a `{"silence": N}` paragraph. Direct the silence as deliberately as the speech.
- When pacing changes, the scene re-times with it — run the Cascade (pipeline.md).

## 2 · Voice contract (record in narration.json)

The bundled synthesis helper implements Fish. Use the configured Fish transport and voice, or honor an explicitly selected alternative by generating/importing its audio through the pipeline's recorded-VO path. Follow [hyperframes-media](../../hyperframes-media/SKILL.md) for current setup; no personal voice or hosted service is assumed. Inspect a failed generation before retrying because it may have consumed provider credits.

Keep the project profile explicit so builds stay reproducible. The public adapter uses the official Fish API with `FISH_API_KEY` and a selected `FISH_REFERENCE_ID`; it does not include the historical local website-cookie proxy. Model/voice configuration and supported parameters are documented in [Fish setup](../../fish-audio-api/SKILL.md). No automatic provider or transport fallback occurs. Retain source WAVs, validate completed audio and keep credentials out of narration, logs and review manifests.

## 3 · Mastering (after concat, before STT)

Probe the actual source loudness; synthesis output varies by provider and voice. `node scripts/master.cjs assets/voice/narration.wav` → a cross-platform transparent chain (highpass 80 Hz + limiter + two-pass **linear** loudnorm; no compression/denoise — they kill clean TTS), targets `I=−14 LUFS / TP=−1 / LRA=7`, **refuses to swap on >0.01s drift**, and regenerates the playback `narration.mp3`. Verify the actual output against the requested target instead of treating a historical measurement as a guarantee. Verify: `ffprobe … stream=start_time` → `N/A`.

## 4 · STT (Whisper — timing only, never text)

`node scripts/transcribe.cjs` transcribes **per-section** (short clips dodge the >100MB cap AND the long-file tail-truncation trap), offsets words to the master timeline, and prints a `⚠ TAIL-GAP` when `wordsEnd` lags the section by
>1.5s (could also be your own deliberate trailing silence — confirm before
"fixing"). Mishearings (slowed/dramatic lines come back as homophones): add a **same-character-length fold** to `narration.json` `folds` and rebuild subs + captions; verify the folded lines' `startSec` against `narration.words.json`.

## 5 · BGM — decide at design time (never a bolt-on)

Record `USE` or intentional `SILENCE` with a reason in DESIGN.md at Phase 2. For `USE`, plan the mood/function arc (e.g. "restrained tech pulse; swells at the data beat; near-silent under the close"), then select a local track:

1. **User-supplied track** — it wins. Freeze a copy inside the project and record source/license provenance.
2. **Already approved project/cache asset** — resolve the selected file individually with `/media-use` and preserve its review/rights fields. Bulk `--adopt` is inventory only; an audio record is render-ready only after its rights provenance is filled.
3. **Workspace review catalog** — run `npm run audio:discover -- --type bgm --query "<mood/function>"`. The results are candidates, not approvals: inspect source/license/hash, audition one under the voice, then ingest that exact reviewed file through `/media-use` and preserve the catalog metadata in provenance.
4. **Nothing suitable is local** — keep the bed unwired and retain the explicit `SILENCE` decision or pending local-asset requirement. If the user has requested or authorized a provider/source, use it with provenance and audition. Otherwise state the missing input; do not silently substitute music.

Discovery is read-only and never a render dependency. Fit the reviewed frozen track to length (loop with a fade seam, or trim) and wire its actual project-local path in `index.html`:

```bash
# loop a reviewed project-local seed up to TOTAL seconds, fade in + out
TOTAL=<total_sec>
ffmpeg -y -stream_loop -1 -i assets/bgm/bgm_loop.wav -t $TOTAL \
  -af "afade=t=in:st=0:d=2,afade=t=out:st=$(echo "$TOTAL-2"|bc):d=2" \
  -c:a libmp3lame -b:a 192k assets/bgm/bgm.mp3
```

**Mix contract** (all on the main timeline as GSAP volume tweens — see the index skeleton): base `data-volume` **0.15–0.22** under narration (0.8–0.9 only for unnarrated films); ~2s ease-in at the open; **duck to 0.06–0.10** under the most weighted reveals/silences; ~1.6s fade-out into the final breath. Voice always wins; if a viewer notices the music before the voice, it's too loud. Instrumental only — lyrics fight narration. Record source + license/provenance in the completion report.

## 6 · SFX — only where a beat earns it

Record SFX `USE` or `PASS` with a reason in DESIGN.md. Reserve `USE` for charged punctuation: the rupture, the stamp, a whoosh under a velocity cut, the register-in tick of the chrome. Use only cues whose visible cause and semantic job can be named; an effect on every beat is wallpaper.

When the user requests sound for all animations, inventory consequential actions (UI pop, typing, transfer, warning, physical contact) and give each a reviewed cue or a reasoned quiet treatment. Audit actual event coverage across the whole film; one token effect per scene can be too sparse. Avoid repeated generic transition whooshes, and honor item-level rejections even if the enclosing palette is favored. Count cues to find omissions, not to impose the case's 150-event density on new films.

- **Discovery:** `npm run audio:discover -- --type sfx --query "<event + texture + duration>"` searches local review catalogs. Inspect and audition results one by one; discovery does not approve, copy, or wire them.
- **Sourcing:** resolve/freeze only the explicitly reviewed candidate through `/media-use`, then record its catalog id/hash, source page, license, attribution, and review note. No runtime search, retrieval, or sound generation.
- **Missing cue:** skip it or log the desired cue in the sound plan for later local staging; never let a missing effect block the picture edit or trigger a provider fallback.
- **Placement:** one root `<audio>` track per planned cue (`data-start` at the cue, `data-volume` ≈ **0.35** under voice+BGM). This keeps cue identity, timing, rights, and rendered review auditable. Lead visual impacts by ~30–60ms so sound and picture land as one event.
