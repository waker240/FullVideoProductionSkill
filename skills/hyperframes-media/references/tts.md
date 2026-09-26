# Fish official API configuration

Read [fish-audio-api](../../fish-audio-api/SKILL.md) first. The public edition has one transport: `official-api`. It sends a Bearer API key and the model header to the pinned Fish endpoint. Configure `FISH_API_KEY`, `FISH_REFERENCE_ID` and optionally `FISH_MODEL` in the project environment or untracked `.env`.

The shared engine's request is:

```json
{
  "fish": {
    "transport": "official-api",
    "request": {
      "temperature": 0.7,
      "top_p": 0.7,
      "normalize": true,
      "prosody": { "speed": 1, "volume": 0, "normalize_loudness": true }
    }
  },
  "lines": [{ "id": "s0", "text": "待试听的短句。" }]
}
```

Use `fish.reference_id` or `fish.model` only when pinning an intentional project override. The studio template uses camel-case profile fields (`referenceId`, `sampleRate`, `topP`, etc.); `tts-fish.mjs` translates them to the official API fields. Shared-engine `fish.request` already uses API snake_case. Do not copy browser backend/sampler settings into either profile.

The adapter defaults to `s2.1-pro-free`, rejects unknown models, disables redirects and does not retry POST requests. A rejected or interrupted response is not proof the provider did no work; inspect usage before a manual rerun. HTTP error bodies are withheld. No secret is stored in narration JSON, manifests, or logs.

For revisions, keep stable section/paragraph IDs. The studio script uses text/profile hashes to reuse exact matches; an explicit `--force` regenerates the selected scope. Listen to pronunciation, pacing, breath and edit continuity before rebuilding captions. The shared engine's `--only tts` does not offer that paragraph cache.

Official contract: [Fish TTS API](https://docs.fish.audio/api-reference/endpoint/openapi-v1/text-to-speech), checked 2026-09-26. Access to a voice and model is determined by the user's account, not this package.
