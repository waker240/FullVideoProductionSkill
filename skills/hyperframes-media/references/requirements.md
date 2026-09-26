# Public media requirements

The release requires Node >=22.20 for `fetch`, `FormData`, `Blob` and project `.env` loading. FFmpeg and ffprobe are required for audio conversion, validation and mixing. No private MCP service, Railway service or browser-session proxy is installed.

| Capability | User configuration | Behavior when absent |
|---|---|---|
| Fish narration | `FISH_API_KEY`, `FISH_REFERENCE_ID`; optional `FISH_MODEL` defaults to `s2.1-pro-free` | Fail before making a request. No bundled voice. |
| Word timestamps | `OPENAI_API_KEY`; `OPENAI_TRANSCRIPTION_MODEL=whisper-1` | Fail before upload; shared engine preflights this before TTS. |
| Self-hosted transcription | Explicit `WHISPER_API`, optional `WHISPER_API_KEY` | Never selected automatically. Must accept OpenAI multipart format and return `words`. |
| GPT Image generation | `OPENAI_API_KEY`, explicit `OPENAI_IMAGE_MODEL` or CLI `--model` | Optional; fail before request. Native agent image tools may be used separately when available. |
| BGM/SFX | User-owned/reviewed local files, optionally `MEDIA_CATALOG` | No library is bundled; missing files are reported. |
| Media cache | Optional `MEDIA_USE_GLOBAL_CACHE_DIR` | User cache defaults to `~/.media`. No author cache is included. |
| Discovery helper | Installed `.agents/skills/media-use`, or `MEDIA_USE_SKILL_DIR` | Explain how to configure the local skill. |

Copy [env.example](../../fish-audio-api/env.example) to the video project's `.env`, then fill it locally and keep it untracked. Existing environment values win. Non-secret per-project Fish settings override environment defaults. `FISH_TTS_CONFIG` may carry a JSON settings object; credentials remain in `FISH_API_KEY`. Only `FISH_TRANSPORT=official-api` is supported here.

The copied studio helpers load `.env` beside the project, except `genimg.cjs` and `audio-discover.cjs`, which should be run from the project root. The shared engine uses `--hyperframes` as that root. `media-use` can use `MEDIA_USE_GLOBAL_CACHE_DIR` in the process environment; its standalone resolver does not read `.env` itself.

Official endpoint overrides are disabled in production. Tests alone may set `HYPERFRAMES_TEST_ALLOW_FISH_LOOPBACK=1` with `FISH_API_URL`, or `HYPERFRAMES_TEST_ALLOW_OPENAI_LOOPBACK=1` with `OPENAI_TRANSCRIBE_URL`/`OPENAI_IMAGES_URL`. Only loopback hosts are accepted. `WHISPER_API` is an explicit user-chosen compatible service: HTTPS is required off localhost; the OpenAI account key is never forwarded there. Do not add credentials to URLs.

Image/video plugins, Codex native image tools, Dreamina/Seedance workflows, stock APIs and background-removal models are optional external capabilities. Their installation, login, model access, quotas and licenses are not included. Background-removal references may need `onnxruntime-node`/models or `sharp`; install only the chosen optional path. Stock API examples require their own keys and current provider terms. Local rendering and local asset ingestion do not require paid media APIs.
