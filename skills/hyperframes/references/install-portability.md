# Runtime setup and capability boundaries

<!-- Public portability adaptation, 2026-09-26. -->

Install all sibling directories from this release into one skills root. A bare path such as `hyperframes-core/references/timing.md` starts at that skills root. `references/`, `scripts/` or `templates/` belong to the skill being discussed; explicit Markdown links are relative to their containing file. Slash-prefixed skill names in older examples mean “load this skill,” not an absolute filesystem path. Optional skills named in upstream examples are not bundled unless their directory exists here; use the general-video route otherwise.

## Local tools

Require a local filesystem/shell, Node.js 22.20.0+, npm/npx, FFmpeg and ffprobe on `PATH`. The supplied wrappers target HyperFrames `0.7.17`; pin the version verified by your project. Initial use may download CLI/browser dependencies. Python and its script-specific dependencies are optional: music analysis uses librosa/numpy/soundfile; image inspection can use Pillow. Optional JavaScript helpers may need Puppeteer or sharp. Read the selected helper's usage; these dependencies are not vendored.

For the optional `cutout-bg.cjs` utility, run `npm install sharp` in the project before selecting chroma-key processing. The separate `--mode=imgly` route additionally needs `npm install @imgly/background-removal-node` and its model/runtime resources. Review the installed package's current license and model terms first: the [IMG.LY project](https://github.com/imgly/background-removal-js#license) documents AGPL licensing and contact for other licensing options; it is not part of this bundle's Apache grant. Neither package nor matting model is bundled. Prefer the configured generator's genuine alpha when that already satisfies the request.

Choose any writable project directory. Bash setup:

```bash
export HYPERFRAMES_DIR="/absolute/path/to/skills/hyperframes"
export HYPERFRAMES_SKIP_SKILLS=1
node "$HYPERFRAMES_DIR/scripts/scaffold.cjs" "/absolute/path/to/project"
```

PowerShell setup:

```powershell
$env:HYPERFRAMES_DIR = 'C:/path/to/skills/hyperframes'
$env:HYPERFRAMES_SKIP_SKILLS = '1'
node "$env:HYPERFRAMES_DIR/scripts/scaffold.cjs" 'C:/path/to/project'
```

Replace placeholders and read the helper's `--help`. Scaffolding does not create accounts, authorize spending or supply a personal voice.

## First local check

The package includes `scripts/doctor.cjs`, `scripts/create-smoke.cjs` and `scripts/setup-runtime.cjs` under the `hyperframes` skill. From your installation, run `node "$HYPERFRAMES_DIR/scripts/doctor.cjs"`, then `node "$HYPERFRAMES_DIR/scripts/create-smoke.cjs" "<test-project>"`. In that project run `npm install`, `npm run setup:runtime`, `npm run doctor` and `npm run render`. This two-second silent check uses no AI provider.

A scaffolded production project contains `.env.example`; copy it to a private `.env` and configure only the services you choose. Never publish the filled file.

## Audio routes

Bundled synthesis helpers implement Fish official API, not a general provider dispatcher. Configure `FISH_API_KEY` and a voice you may use through `FISH_REFERENCE_ID`; see [hyperframes-media](../../hyperframes-media/SKILL.md) and [Fish setup](../../fish-audio-api/SKILL.md). No personal voice, cookie, API key or private hosted endpoint is supplied. Secrets stay outside project data and review exports.

Respect supplied narration or a user-selected provider. Use the selected provider's supported tool/adapter separately, then import local audio through the recorded-VO procedure in [pipeline.md](pipeline.md): measured boundaries, authoritative display text and actual word timings. Do not pass unsupported providers to a Fish-only helper, silently switch voice, or label interpolated timings word-locked.

Transcription defaults to the official OpenAI API using `OPENAI_API_KEY` and Whisper word timestamps. An explicitly configured `WHISPER_API` (and optional `WHISPER_API_KEY`) may point to a compatible service. There is no private fallback. The public image adapter requires `OPENAI_API_KEY` plus an explicit `OPENAI_IMAGE_MODEL`; a desktop subscription is not API configuration. Alternatively use an available host image tool or import media. Inspect the actual helper contract before configuring an alternative.

## Optional capabilities

| Capability | Boundary and fallback |
| --- | --- |
| Image generation | Current host tool or a configured provider; the Codex ImageGen example is optional. User-supplied media also works. |
| Video generation | Separate provider/plugin/account. Record actual submission mode and inputs; generated footage is optional. |
| Music/SFX catalog | No media library is shipped. Populate a catalog or use supplied files; audition and retain rights metadata before adoption. |
| Browser/desktop | Host-supplied. CLI rendering/local inspection can cover some checks; screenshots do not prove audio listening. |
| Subagents | Use authorized host delegation or execute role packets serially. Do not bypass restrictions through another harness. |
| Remote review | Local review needs no tunnel. ngrok/hosting is separate; publish only within authorization and verify the actual URL. |

## Assets and licenses

This release excludes private project footage, credentials, historical logs, binary example images and test corpora. Example HTML that references omitted images is a code pattern: substitute your own assets before rendering. Saved prompts are examples, not generated/approved assets. Projects must supply fonts and runtime files used by their compositions.

Preserve every third-party library, font and media license. The bundle's Apache notice does not replace separate GSAP, font or media terms. Successful download or past use does not establish redistribution rights.
