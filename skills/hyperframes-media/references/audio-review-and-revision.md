# Audio review and revision

Read for narrated films with audition choices, repeated sound feedback, speed changes or surgical voice fixes. Simple clips can use the normal audio request directly. This workflow supplements the engine; it does not add CLI options or allow the engine to fetch or generate music/effects.

## Establish the current direction

Read the current request, saved review data and last delivered manifest before treating an earlier plan as authoritative. Keep a brief sound contract: narration source/text, voice direction, SFX roles and exclusions, whether BGM is requested, program speed, music speed, output clock, and the release being revised.

Distinguish the user's choices from the editor's assembly: `favorite` identifies a preferred candidate, `shortlist` permits consideration within delegated selection, `reject` excludes it, and a final cue sheet records actual use. Do not infer shortlist permission when the user reserved final selection. Existing explicit instructions to choose/finish autonomously are sufficient; do not add a new approval round. An individual's rejection overrides an aggregate palette preference. Preserve an immutable snapshot/hash of the review revision used by a mix.

## Prepare comparisons that answer a decision

Use the project's HTML review surface when the user wants auditioning or the direction is still being explored. Reuse the common review/publishing workflow in `hyperframes`; keep audio metadata in a separate catalog.

For a long film with unsettled sound taste, compare a representative palette early enough that rejected timbres can be replaced before full cue placement. When the user rejects an existing palette and asks for more options, provide genuinely different source hashes and broader roles, not the old sounds renamed. Technical audio validation does not establish a listener’s taste; audition alternative palettes before full placement.

| Material | Useful comparison | Preserve |
| --- | --- | --- |
| Narration | Original dry passage with context, plus a small set of deliberate voice/punctuation variants | Exact text differences, request, raw take, duration, audition processing and hashes |
| SFX | Candidates grouped by physical/semantic role, plus the same short sequence rendered with alternative palettes | Original, excerpt start/duration, gain/fades, candidate ids behind each palette and source/license |
| BGM | Same-length excerpts grouped by narrative role, plus a few representative narration-under-music previews | Native source regions, levels, preview mix settings, source/license and hashes |

Use enough alternatives to test different directions; counts and durations are project choices. For a longer film, group candidate effects by visible action, compare a few short multi-event palettes, and test music excerpts under representative narration. Choose counts and excerpt lengths for the uncertainty you need to resolve; they are not quotas.

For narration, fixed gain comparisons avoid loudness dominating a voice decision. Keep raw generations unchanged; log the gain and any peak cap, and verify sample count/duration do not change. Do not silently compress, limit, denoise or time-stretch a supposedly dry comparison. SFX excerpts should expose attack, body and release, with full originals available privately for editorial inspection. A numerical strongest-sample window is provisional and cannot prove that a timbre or edit sounds good.

No autoplay. Show choice and notes per stable candidate id, role, original/excerpt distinction and source/license links. Save to the server with revision/conflict handling, preserve unsynced browser edits, and offer JSON export/import. QA must use a separate feedback file and leave live choices intact. Publish only UI assets and explicitly allowed audition files; keep full licensed sources, credentials and the feedback database off static routes. See the `hyperframes` review workflow for serving and ngrok.

The case's user also permitted generated music/effects as an option, but the final reviewed sound sources were local catalog files. Permission is not evidence of use. If a later project explicitly chooses an available generation capability, perform that as a separate upstream step with its own request, budget and output provenance, then review/freeze the local result. The shared audio engine still performs no music/SFX generation or provider fallback.

## Say exactly what was reviewed

File existence, a browser Play click, waveform inspection, ASR and loudness measurements do not establish auditory perception. Use actual audio input when available, or the user's audition choices. If the user delegates completion and the runtime cannot hear, a conservative technical/source selection may be documented as such; do not fabricate an audition note or claim subjective listening. `--reviewed` alone does not convey this distinction: write it into the substantive review note and project evidence.

Keep three conclusions separate: selected asset, technically verified mix, and subjectively heard final mix. Hearing a 40-second sample does not mean the 21-minute final mix has been heard. Report the actual coverage without blocking already authorized work merely because a subjective review is unavailable.

## Turn selections into directed cues

Freeze the selected exact source through `media-use`, retaining original and audition hashes and the review revision. Render from the frozen source or an explicitly recorded derivative, not a temporary audition/library path.

SFX cues should state the visible event and its local shot time: a click at a real activation, a short typing phrase, a warning at a demonstrated failure, or a material event at contact. Keep a cue decision ledger with `keep`, `replace` or `silent` and a reason when revising an existing film. Silence generic transitions when the user rejects them, then inspect for useful action cues lost as collateral damage. Avoid both an effect at every cut and an inaudible, overly sparse soundtrack. Judge event density against the actual action; a cue count is an audit observation, not a target for future films.

BGM follows the argument. Write a cue sheet with film start/end, native source start/end, narrative purpose, gain, fades and explicit rests. A preferred track may serve as the main theme with selected alternatives for pressure, explanation or closure. Favor phrase boundaries and leave space after consequential lines. Keep source reuse and any loop joins explicit.

## Independent stems and speed order

Keep voice, SFX and BGM independently rebuildable. Every stem declares sample rate, decoded sample count, intended duration and source clock. A practical long-form output is 48 kHz stereo PCM; follow the project's selected format.

When the user asks to accelerate the program but keep music at native speed:

1. Freeze the original picture clock and build original-speed voice and SFX. Validate each act against its decoded source sample count before a documented sub-frame tail pad/trim.
2. Export or retain a picture-only, zero-based 1x source. It prevents a later revision from mistaking the accelerated delivery for an original-speed input.
3. Apply the requested speed once to picture and voice/SFX; preserve speech pitch. Reset timestamps before speed conversion. Compute final frames, samples, subtitles and chapters from one declared picture clock, including final rounding.
4. Assemble BGM at 1.0x on that final clock. Do not speed or pitch-shift it as a side effect of changing the program.
5. Duck music gently from a separate accelerated voice-only sidechain. SFX should not trigger dialogue ducking. Match stem length exactly; apply final mastering once and measure both PCM and encoded output.

The case used `1.15x`, 60 fps and 48 kHz, producing 75,686 frames and 60,548,800 samples. These parameters are case evidence, not defaults. A measured fixed video start offset is different from drift; check both instead of compensating by guesswork.

Do not adopt a universal LUFS target from this case. Use the project's delivery target and validate after limiting and AAC encoding, since limiting changes integrated loudness and encoding can raise true peaks. Preserve the actual filter arguments, measurements and final source hashes.

## Local narration repair

For a pronunciation or wording fix, preserve the user's scope. Identify the exact dry-voice interval, authorized spoken text, displayed caption text and protected surrounding samples. Generate with the existing Fish voice and only the needed request override. For example, explicit Chinese digit spelling and `normalize: false` fixed one date; this was per-request, not a change to every number or server default.

Freeze the raw take and request. Fit the approved sentence(s) to existing windows while checking natural pauses and boundary levels. Verify transcription against authorized text and inspect timing; retain raw ASR errors instead of quietly treating a machine transcript as perfect. Update both burned and external captions only if wording/time actually changes. A pronunciation-only fix may leave display text and timing intact.

When a narrowly scoped final patch must leave everything else identical, compare decoded PCM outside the interval. Rerunning a time-stretch algorithm over the whole program can change later samples because of phase/window decisions, even when source edits are local. Build the candidate with the existing mix parameters, then splice the necessary final-clock region back into the current lossless master with a documented seam in a natural pause. Verify unchanged samples outside the seam, unchanged picture packets when remuxing only audio, and hashes of unaffected chapter files. Keep the new lossless master as the next revision's authoritative source.

## Review after assembly

Review first for selection, cue fit/coverage, rejected assets, voice text, caption alignment and processing order. Then inspect the real encoded output for decoded frames/samples, PTS, loudness/true peak, chapter metadata and content boundaries. Recheck changed regions and their neighboring cuts. Independent chapter files should be decoded from exact frame spans and re-encoded when necessary; input-seek plus H.264 stream copy may lose preroll despite plausible metadata. A file count or frame count alone does not prove the opening content is present.

Keep unresolved subjective listening separate from passed technical checks. Publish the revision only through the authorized delivery workflow, preserving the previous release and the sources required to rebuild it.

## Project evidence to retain

Keep the project’s audition readme, revisioned decisions, cue sheets, source/license ledger, mix settings and listening audit with its delivery. Use project-relative paths; do not depend on an author’s private project or review database.
