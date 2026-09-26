# Fish narration to captions

1. Generate a reviewed narration line through Fish official API.
2. Freeze `assets/voice/<id>.wav`.
3. Obtain `whisper-1` word timestamps through the configured transcription endpoint.
4. Normalize to `{id,text,start,end}` and compare with approved caption text.
5. Only then author word-sensitive caption motion.

```sh
node <MEDIA_DIR>/scripts/audio.mjs --request audio_request.json --hyperframes . --out audio_meta.json --only tts
```

Configure both Fish and transcription credentials first; the engine checks both before generating speech. A transcription error leaves the source WAV on disk and stops delivery. Fix/re-run the transcription separately before making another Fish request. Do not invent word timing from text length.

For long videos and local wording repairs, prefer the scaffolded paragraph workflow: `tts-fish.mjs`, narration assembly, `transcribe.cjs`, then caption compilation. Preserve authored caption lines separately from pronunciation-adjusted speech. See [transcription](transcribe.md) and [audio review](audio-review-and-revision.md).
