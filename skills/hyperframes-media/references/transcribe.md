# Word timestamps

The public helpers use OpenAI `whisper-1`: `POST /v1/audio/transcriptions`, multipart `model=whisper-1`, `response_format=verbose_json`, and `timestamp_granularities[]=word`. Set `OPENAI_API_KEY`. `OPENAI_TRANSCRIPTION_MODEL` may be omitted or `whisper-1`; this adapter rejects other models because the word-timestamp contract differs.

The narration template sets `sttLanguage` to `zh`. Use ISO language codes (`en`, `zh`, `ja`); legacy `chinese`/`english` strings are normalized. Each uploaded file must be under the adapter's 25 MiB limit. The studio path converts individual sections to mono MP3; split unusually long sections before upload.

```sh
node scripts/transcribe.cjs
node scripts/transcribe.cjs s0 s2
```

The studio helper reads `scripts/boundaries.json` and section audio/chunk manifests. It writes `assets/transcripts/<section>.txt` and master `assets/words/narration.words.json`, adding section offsets. A partial run replaces only selected time ranges and preserves the intervening sections.

The shared audio engine transcribes each frozen Fish WAV and normalizes each word to `{id,text,start,end}` in `audio_meta.json`. Word timestamps remain approximate: compare them with the waveform, correct recognition errors against approved caption text, and check the tail before using word-driven motion. Empty/malformed word arrays fail; no synthetic alignment is substituted.

A user may explicitly set `WHISPER_API` to an OpenAI-compatible transcription service, with a separate `WHISPER_API_KEY` if needed. It must accept the same multipart request and return nonempty `words: [{word,start,end}]`. The OpenAI account key is not sent to custom endpoints. This package does not deploy a transcription service. Every POST is sent once, without automatic retries.

Optional alternative: separately install and configure a local transcription tool (such as the HyperFrames transcription CLI) and supply its reviewed JSON. That path is not automatically selected or downloaded by the public helper; it remains a user's explicit setup choice.

Official reference: [OpenAI file transcription](https://developers.openai.com/api/docs/guides/speech-to-text), checked 2026-09-26.
