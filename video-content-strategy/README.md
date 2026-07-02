# Video Content Strategy — Cursor Skill Package

This is a self-contained release of the **Video Content Strategy** skill for Cursor: the visual-translation layer that turns a script (thesis + persona + density rhythm, established by whatever scripting process you use) into concrete visual decisions for an animated, code-first, Remotion-based explainer video.

Everything needed to actually *use* the skill — not just read about it — lives in this one folder: the skill docs, a real reference implementation of the Remotion component layer it describes, and the MCP server that gives the agent an actual `generate_image` / `generate_video` tool.

This package is intentionally **framework-agnostic Remotion** — nothing here depends on HyperFrames or any other video-authoring framework.

## What's inside

```
video-content-strategy/
├── Thumbnail_generation.md         ← end-to-end thumbnail playbook (gpt-image-2 via the MCP server below)
├── references/                     ← Visual Storytelling Tier 1-3 — the book-knowledge base under the skill's doctrine
├── skills/
│   ├── video-content-strategy/     ← the main skill (this is what you invoke)
│   └── video-motion-references/    ← companion skill: motion patterns + Remotion implementation modules
├── rules/
│   ├── act-setup-from-audio.mdc    ← end-to-end workflow: raw per-act audio → TTS/STT → subtitles → scaffolded compositions
│   └── subtitles.mdc               ← the Argument-Coded Subtitle architecture (types/data/renderer contract)
├── reference-implementation/
│   ├── canvas-modules/             ← SceneShell, motion, staging, theme, primitives — the Canvas Layer, working code
│   ├── cinema-layer/               ← post-compositional Cinema Layer (grain, aberration, lens, transitions, drivers)
│   └── scripts/
│       ├── cutout-bg.js            ← chroma-key cutout pipeline for gpt-image-2 artifacts
│       └── master_to_wav.sh        ← transparent two-pass loudnorm mastering, MP3/WAV in → PCM WAV out
└── mcp-servers/
    └── media-generation/           ← MCP server exposing generate_image / generate_video
```

## What's deliberately NOT included

- **The scripting/thinking-layer skill** (topic selection, persona design, 5-phase script structure). This package assumes you already have a script with a thesis, persona, and density rhythm — bring your own scripting process, or write scripts by hand. `video-content-strategy`'s SKILL.md still references it by name in a few places; those are just pointers to a process you'll need to supply yourself.
- **A full Remotion project scaffold** (no `package.json`/`remotion.config.ts` at the root, no `Root.tsx`). This is a component library + doctrine, not a turnkey video project. Drop the reference implementation into your own Remotion project.
- Any HyperFrames-related material.

## Setup

### 1. Install the skills into Cursor

Copy the two folders under `skills/` into wherever Cursor loads skills from — either your global skills folder (`~/.cursor/skills/`) or a project-local one (`.agents/skills/` or `.cursor/skills/` at your project root). Cursor picks them up automatically; invoke with `/video-content-strategy`.

### 2. Set up the media-generation MCP server

This gives the agent the `generate_image` / `generate_video` tools the skill assumes exist (referred to in the docs generically as "`gpt-image-2`" — the server itself is model-agnostic and routes through the Vercel AI Gateway, so you can point it at Imagen, Flux, Grok Imagine, or other image/video models).

```bash
cd mcp-servers/media-generation
npm install
cp .env.example .env
# edit .env and add your own Vercel AI Gateway key (https://vercel.com/docs/ai-gateway)
npm start   # starts on http://localhost:3105/mcp by default
```

Then register it in your project's `.cursor/mcp.json` (or Cursor's global MCP settings) as a streamable-HTTP MCP server pointing at `http://localhost:3105/mcp`.

### 3. Drop the reference implementation into your Remotion project

`reference-implementation/canvas-modules/` and `reference-implementation/cinema-layer/` are each flat, self-contained folders — every file only imports from `react`, `remotion`, or a sibling file in the same folder. Copy each folder as-is into your Remotion project's `src/` (e.g. `src/shared/canvas/` and `src/shared/cinematics/`), then fix up the two or three import paths if you place them somewhere other than side-by-side.

Requires `remotion` + `react` as peer dependencies (whatever versions your project already uses). `scripts/cutout-bg.js` additionally requires `sharp`; `scripts/master_to_wav.sh` requires `ffmpeg` on your `PATH`.

### 4. Install the rules

Copy the two `.mdc` files under `rules/` into your project's `.cursor/rules/` folder. They're project rules, not skills — Cursor applies them contextually rather than via `/invoke`.

- **`act-setup-from-audio.mdc`** is the full pipeline for standing up a new episode from raw per-act audio (or a written script via TTS): transcribe → build frame-accurate subtitles → fix transcription errors → scaffold per-act compositions → register → verify. It names several project-specific template scripts (e.g. `tts-<project>.js`, `build-<project>-subs.js`, `transcribe-<project>.js`) as things to adapt from a reference project — those per-project scripts aren't bundled here, only the workflow doc and the one genuinely reusable piece, the mastering script.
- **`subtitles.mdc`** is the Argument-Coded Subtitle architecture the pipeline scaffolds into every act: the types/data/renderer split, phrase-level emphasis rules, the semantic color roles, the font-size ladder, and the locked renderer contract (position, fade timing, NC-window handling).
- **`scripts/master_to_wav.sh`** is the mastering step both rules assume exists: a transparent two-pass `loudnorm` chain (highpass + transient limiter, no compression/denoise) that takes an MP3 or WAV and exports a duration-preserving 48kHz/24-bit PCM WAV at a target LUFS/dBTP/LRA. Usage: `TARGET_I=-14 TARGET_TP=-1 TARGET_LRA=7 ./master_to_wav.sh input.mp3 output.wav`.

### 5. Thumbnail generation

`Thumbnail_generation.md` (package root) is the copy-paste-ready playbook for the **generated-PNG** thumbnail path: the locked `openai/gpt-image-2` model choice, the exact MCP request shape for the `media-generation` server above, the 4:3 / 16:9 "divisible by 16" sizing trick, the 5-block prompt template with the locked semantic palette, seven style registers (house low-poly, WeChat-screenshot, redacted-document, depth-first, loud-clickbait-face, and more) with their hard rules, and file-naming conventions. It cross-references two files by their original in-repo relative paths that map onto this package as follows:

| Doc says | In this package |
|---|---|
| `video-content-strategy/thumbnail-extraction.md` | `skills/video-content-strategy/thumbnail-extraction.md` (bundled — the alternative Remotion-composition + frame-extraction thumbnail path) |
| `video-content-strategy/SKILL.md` | `skills/video-content-strategy/SKILL.md` (bundled) |
| `.cursor/skills/video-generation-mcp/SKILL.md`, `How_images_svgs.md` | **not bundled** — general MCP tool docs and the broader Register A/B/C asset-generation library, referenced for context but not required to run the thumbnail playbook itself |

### 6. Read the references (no install — just background)

`references/` is a three-tier book-knowledge base underneath `video-content-strategy` and `video-motion-references` — the "why" behind their doctrine, distilled from twelve books on visual storytelling craft:

| File | Books | Owns |
|---|---|---|
| `VISUAL_STORYTELLING_TIER1.md` | Bruce Block (*The Visual Story*), Walter Murch (*In the Blink of an Eye*), Williams (*Animator's Survival Kit*) + Thomas & Johnston (*Illusion of Life*), Scott McCloud (*Understanding Comics*) | The four load-bearing axes: visual structure over time, the cut, motion itself, sequence of stills |
| `VISUAL_STORYTELLING_TIER2.md` | Mateu-Mestre (*Framed Ink*), Molly Bang (*Picture This*), David Mamet (*On Directing Film*), Steven Katz (*Film Directing: Shot by Shot*) | Staging and meaning — what goes inside a single frame, and how frames chain into a designed path for the eye |
| `VISUAL_STORYTELLING_TIER3.md` | Joseph Mascelli (*The Five C's of Cinematography*), Ondaatje & Murch (*The Conversations*), Robert McKee (*Story*) | Reference-grade depth: technical camera grammar, the long-form editing philosophy, and structure/argument-as-story |

Each tier ends with a synthesis table + concrete next-moves mapped onto Remotion + static-image work — read it as a diagnostic ("why does this scene feel like elegant PPT?") rather than a summary to read once. Tier 1 explicitly names `video-motion-references` as already encoding much of the Williams→Remotion mapping (spring presets, the 12 animation principles in code) — these books supply the taste to know *when and why* to reach for it.

## Recommended order of operations

1. Write or otherwise obtain your script (thesis, persona, density rhythm already decided).
2. Invoke the `video-content-strategy` skill to make per-shot visual decisions (Canvas vs. Artifact vs. Cinema split, primitives, color, density/particle arc, the Effort Protocol for anchor shots).
3. Reach for `video-motion-references` during build for motion-pattern lookup, spring presets, and the Remotion implementation API shapes (`SceneShell`, `motion.ts`, `staging.tsx`, shot-config + timeline templates).
4. If you're standing up a new project from raw audio or a TTS'd narration, follow `act-setup-from-audio.mdc` end to end — it produces the frame-accurate subtitle data that `subtitles.mdc`'s `<EduSubtitles>` renderer consumes, and it calls `master_to_wav.sh` at the audio-mastering step.
5. Use the `media-generation` MCP server for any Artifact-Layer raster generation the plan calls for; run `cutout-bg.js` to chroma-key cutouts before compositing as `<Img>` layers.
6. Implement the Canvas Layer using `reference-implementation/canvas-modules/` as a starting point, and the Cinema Layer using `reference-implementation/cinema-layer/` for post-compositional effects.
7. Once the video's motifs and palette are locked, follow `Thumbnail_generation.md` to generate and iterate on 3-4 candidate thumbnails through the same MCP server.
