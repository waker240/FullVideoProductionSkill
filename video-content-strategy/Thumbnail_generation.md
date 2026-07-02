# Thumbnail Generation Playbook (gpt-image-2 via MCP)

> **Who this is for**: the next agent in this workspace asked to "generate candidate
> thumbnails" for a video. This is the end-to-end, copy-paste-ready process —
> model, MCP call mechanics, prompt template, the 4:3 trick, the iteration loop,
> and file conventions. Validated 2026-06 on video #7 (education-ep3, Socrates)
> and video #8 (predictive-processing).

This doc covers the **generated-PNG** thumbnail path (gpt-image-2 renders the whole
thumbnail, text baked in). For the alternative **Remotion-composition** path (SVG +
HTML text rendered via `remotion still`) and frame-extraction fallback, see
`video-content-strategy/thumbnail-extraction.md`. The generated-PNG path is faster
to iterate and what was used for the recent videos.

---

## 0. TL;DR — the loop

1. **Read the video** — narration (`*-narration-plain.md`), `theme.ts`, 2-3 scene
   files. Extract the thesis + the strongest hooks + the established visual motifs.
2. **Design 3-4 concepts**, each a *different hook* (not variations of one). Map
   each to a distinct angle: cold-open hook / thesis / mechanism / payoff.
3. **Write one `req-*.json` per concept** (5-block prompt, locked palette, 4:3).
4. **Fire all in parallel** via `curl` to the local MCP server (4 calls, one per
   Shell tool call, in a single message). Each takes ~50-65s.
5. **Read the output PNGs**, check text correctness + palette + composition.
6. **Save** the keepers to `my-video/public/projects/<slug>/thumbnails/` with
   descriptive names; clean up the temp `req-*.json`.
7. **Iterate** on the user's favorite (subtler visual / bigger text / different
   angle) — same loop, 1-2 new variants.

---

## 1. The model — `openai/gpt-image-2` ONLY

This project locks image generation to `openai/gpt-image-2`. It is the only model
in the kit that nails **multi-script typography (correct Chinese characters)**,
**exact hex-palette obedience**, **strict layout adherence**, and **low-poly
stylization** all at once. Do NOT use Imagen / Flux / Grok for thumbnails — they
garble Chinese glyphs and drift on palette.

Full model rationale: `.cursor/skills/video-generation-mcp/SKILL.md` and
`How_images_svgs.md` (project root).

---

## 2. MCP call mechanics

The media-generation MCP server runs **locally** at `http://localhost:3105/mcp`
(JSON-RPC 2.0). Two ways to call it; **curl is the validated path for thumbnails**
because the prompts contain Chinese characters and many quotes — building a JSON
file and POSTing it with `--data-binary` avoids all shell-escaping pain.

### 2.1 Verify the server is up first

```bash
curl -s -X POST http://localhost:3105/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data-binary '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | head -c 400
```

If it returns a `generate_image` / `generate_video` tool list, you're good. If it's
not running, the `CallMcpTool` tool (server id `project-0-Rem1-mediaGeneration`,
tool `generate_image`) is the fallback — but curl is preferred here.

### 2.2 The request JSON shape

Write one file per concept (e.g. `req-A.json`):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "generate_image",
    "arguments": {
      "model": "openai/gpt-image-2",
      "size": "1024x768",
      "output_dir": "/Users/jingyu/python/1WORKAGENTS/Remotion1/my-video/out/thumb-<slug>",
      "prompt": "<the full 5-block prompt — see §4>"
    }
  }
}
```

- `output_dir` **must be an absolute path**. Use a per-batch scratch dir under
  `my-video/out/` (e.g. `out/thumb-pp/`, `out/thumb-ep3/`). The server writes
  `<uuid>.png` there and returns the path.
- Chinese characters can be inlined directly OR as `\uXXXX` escapes — both work in
  the JSON file. Inlining is fine and more readable.

### 2.3 Fire the call

```bash
curl -s -X POST http://localhost:3105/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  --data-binary @req-A.json | tail -c 500
```

The response (SSE `event: message`) ends with:

```json
{"image_paths":["/Users/.../my-video/out/thumb-<slug>/<uuid>.png"]}
```

### 2.4 Parallelism

Send **4 curl calls in a single assistant message** (4 separate Shell tool calls).
The MCP server processes them concurrently — 4 images land in ~60s total instead of
~4 minutes sequentially. Set each Shell call's `block_until_ms` to ~180000 (3 min)
for headroom; each actually returns in ~50-65s.

---

## 3. Size & aspect ratio — the 4:3 trick

The channel's videos are **4:3** (1440×1080). So thumbnails should be 4:3 too.

- **Documented sizes** for gpt-image-2 are `1024x1024`, `1024x1536`, `1536x1024`.
- **The REAL constraint (validated 2026-06): the server accepts ANY size where BOTH
  width and height are divisible by 16** — not just the three documented sizes. The
  server rejects non-multiples with: `Invalid size '1920x1080'. Width and height
  must both be divisible by 16.` (`1080 / 16 = 67.5` → fails.)
- **`1024x768` (true 4:3) WORKS** (both ÷16) — verified output was 1024×768.
  **Use `1024x768` for 4:3 thumbnails** so they need no cropping.
- **`1536x864` (true 16:9) WORKS** (1536÷16=96, 864÷16=54, ratio exactly 16:9) —
  generate 16:9 thumbnails natively at this size, no cropping. `1920x1080` does
  NOT work (1080 not ÷16); upscale `1536x864` if you need 1080p.
- If you ever fall back to a non-matching aspect, add a **safe-region** instruction
  to the prompt (keep all content in the middle ~75-88% width, treat the edges as
  disposable margin) and crop manually. But prefer generating the exact aspect
  directly via a ÷16 size.

**Always verify the actual output dimensions** after generating:

```bash
sips -g pixelWidth -g pixelHeight <uuid>.png 2>/dev/null | grep pixel
```

---

## 4. The prompt template — 5 blocks

Every thumbnail prompt uses the same structure. Copy this skeleton and fill the
SUBJECT + COMPOSITION (text) per concept; keep STYLE / PALETTE / ANTI-SLOP nearly
verbatim across all concepts in a batch so the set reads as siblings.

```
ASPECT RATIO — this is a true 4:3 landscape frame (width:height = 4:3). Compose
full-bleed for 4:3, edge to edge, no letterboxing, no disposable margins.

TEXT IS THE HERO — the Chinese headline must DOMINATE, covering at least 55-60%
of the frame. The illustration is restrained atmosphere, never competing.

STYLE — sophisticated minimalist editorial low-poly thumbnail. Faceted geometric
forms, 120-180 visible flat polygon facets, hard edges, matte drawn-not-rendered
surface, faint paper grain, cool diffuse museum light. NO smooth curves, NO 3D
glossy shading, NO Pixar softness, NO mobile-game cleanness, NO loud glow.

PALETTE — strictly limited. Background = #0A0E14 near-black. <neutral subject> =
#4A7C9B steel blue with #1a1f28 shadows. <tension/problem element> = #E8913A
amber. <insight/resolution element> = #3EC9A7 cyan-green. Headline = #E8E4DF
warm off-white, accent line = #3EC9A7. NO purple, NO neon bloom, NO rainbow,
NO gold gradient.

SUBJECT — <the low-poly illustration, kept to the LEFT ~30-35% of the frame at
low visual weight. Describe the metaphor concretely. Assign palette roles by
meaning: steel-blue = neutral/baseline, amber = the problem/void/tension,
cyan-green = the insight/guess/resolution.>

BACKGROUND — full-bleed #0A0E14, very faint angular grid at 3% opacity, one soft
low-opacity radial seating the text. Generous dark negative space.

COMPOSITION — <subject> hugs the left; GIANT text owns the rest. Bold heavy black
Chinese sans-serif slab. Line 1 reads exactly "<line 1>" and line 2 reads exactly
"<line 2>", both ENORMOUS in #E8E4DF off-white, each character bold and
commanding, stacked center-right. A clearly smaller third line below in #3EC9A7
reads exactly "<kicker>". <Optionally: tint one key word #E8913A or #3EC9A7 for
emphasis.> Dark drop-shadow for legibility only, no colored glow.

ANTI-SLOP — every Chinese character spelled correctly, no garbled glyphs, no extra
fake text, NO watermark, NO signature, NO logos, NO English text (except literal
"AI" if needed), NO border, NO chart axes, NO photographic realism, <+ subject-
specific exclusions, e.g. NO realistic anatomy, NO robot mascot, NO glossy chrome>.
```

### 4.1 The LOCKED palette (memorize / copy exactly)

| Role | Hex | Use for |
|---|---|---|
| Background | `#0A0E14` | near-black ground |
| System / neutral | `#4A7C9B` | steel blue — baseline subject, the head/skull, current state |
| Tension / problem | `#E8913A` | amber — the void, the crack, the strain, what's breaking |
| Insight / resolution | `#3EC9A7` | cyan-green — the guess, the fill, the thesis, the fix |
| Text | `#E8E4DF` | warm off-white headline |
| Shadow facets | `#1a1f28` | warm near-black |

These are the project-wide semantic colors (from `the-filter/theme`). **Color is
structural, not decorative** — a void is amber because it's the *problem*; the
brain's guess is cyan because it's the *insight*. Never recolor for prettiness.

---

## 5. Design process — choosing the 3-4 concepts

Don't generate 4 variations of one idea. Generate **4 different hooks**, so the set
is a real A/B-test spread. Mine the narration for these angle types:

| Angle | What it is | Example (video #8) |
|---|---|---|
| **Cold-open hook** | The most concrete/visceral/verifiable claim | "你眼睛里有个黑洞，你却从没见过它" (blind spot) |
| **Thesis** | The core reframe the video installs | "你脑子里没有作者，只有一个旁白" |
| **Mechanism** | The how-it-works image | "你看到的世界，是大脑猜出来的" (skull guessing) |
| **Payoff / mirror** | The closing twist that recontextualizes everything | "你嘲笑 AI 只会猜下一个字，你的大脑也一样" |

For each concept:
1. Pick the **strongest 1-2 line headline** (the title text IS 55%+ of the frame).
2. Pick a **visual metaphor from the video's own motifs** — read the scene files so
   the thumbnail rhymes with the actual animation (e.g. #8 already had a dark skull,
   a blind-spot void, a split-brain, an AI mirror; #7 had a divergence curve and a
   low-poly Socrates bust). Reuse those, don't invent unrelated imagery.
3. Assign palette roles **by meaning** (see §4.1).
4. Keep the illustration to the **left ~30-35%**, text dominant on the right.

### Headline craft

- **2 hero lines max**, plus an optional smaller kicker line.
- Hero lines **ENORMOUS** — must read at 320px-wide thumbnail scale on mobile.
- Tint ONE key word in amber or cyan for a focal pop (e.g. "黑洞" amber, "猜" cyan,
  "旁白" cyan). Don't tint more than one.
- Quote every character **verbatim and in order** in the prompt (`reads exactly
  "..."`). The model renders exactly what you write — a typo in the prompt becomes a
  perfectly-rendered wrong character.

### 5.1 Style registers — diverge beyond the house low-poly look

The §4 template (low-poly editorial on `#0A0E14`) is the **house default** — safe,
on-brand, the right call when the thumbnail should rhyme with the video's own
animation. But it is one register, not the only one. For a hook that lives in a
*recognizable real-world artifact* (a job ad, a chat, a leaked file), a native
medium-mimic thumbnail can out-CTR the editorial look because it reads as **real**
before the viewer registers it as content — near-zero decoding cost. Validated
2026-06 on video #12 (education-ep5).

When a concept's hook IS an artifact, generate it in that artifact's register
instead of forcing it into low-poly. Candidate registers (each validated):

| Register | What it mimics | Best for | Key prompt levers |
|---|---|---|---|
| **Real recruitment board** | A printed 招聘 flyer / paper notice pinned to a board, or a glowing LED dot-matrix job-fair sign | Absurd-contradiction memes (e.g. `招应届生 / 要十年经验`); the two-line gag IS the frame | Aged paper `#F4EDE0` + rusty tacks + slight skew; OR black LED panel with dot-matrix characters, amber line 1 / hot-red line 2. Strip to ONLY the two contradictory lines. |
| **WeChat group-chat screenshot** | A dark-mode WeChat chat: a shared job-ad card + a deadpan mic-drop reply | Self-relevant social hooks; maximum native virality | Chat bg `#191919`, grey `#3A3A3A` bubble (other) with LEFT avatar, green `#07C160` bubble (you) right-aligned with NO right avatar; bubble tails sell authenticity. **Zoom in ~2× so two bubbles fill the frame** — keeps text legible at 320px while still reading as a real screenshot. |
| **Low-poly editorial** | The house default — faceted forms on near-black | Thumbnails that should rhyme with the video's own animation / motifs | The full §4 template. The "safe" pick; still the right default for most episodes. |
| **Depth-first** | A dense, layered, 3D scene with strong receding perspective and cinematic depth-of-field — the *treatment*, not a subject. The subject can be ANYTHING (a faceted object, a device, a diagram, stacked planes, a particle/word field, a crowd, an architectural space); the point is many parallax layers, near-field blur → sharp mid → vanishing-point dust, and an overwhelming sense of depth and density. Headline stays razor-sharp and frontmost over the blurred field | "Overwhelming," maximalist, big-idea episodes where scale/density/depth IS the message; thumbnails that should feel three-dimensional and rich rather than flat-editorial | Inverts the §4 "restrained illustration" rule — the dense layered field IS the spectacle, but text stays crisp & frontmost. See the dedicated callout below. |
| **Redacted classified document** | A photocopied/leaked file with heavy black redaction bars + a diagonal `机密` / "CLASSIFIED" stamp | "Someone hid this" provocation hooks (suppression, hidden sorting) | Yellowed photocopy paper, dense opaque black bars over the subject, amber stamp at ~60% opacity, slight scan skew (0.5-1°). The hero line is "the part the censors missed." |
| **Loud clickbait face** (Bilibili/MrBeast register) | ONE giant exaggerated FACE 怼到镜头极近 (cropped at edges), manic expression, ≤6-char slogan slapped on | Maximum-arousal, broad-reach episodes; when you want raw stop-the-scroll energy over sophistication | See the dedicated callout below — this register has hard rules. |

Other registers explored and on the table when the hook calls for them:
**Soviet constructivist polemic poster** (blood-dark, hot red-orange, propaganda
energy), **accusatory white-glare** (overexposed near-white bg, stark silhouette —
maximum contrast-difference in a dark feed), **street-art spray stencil** (concrete
wall, drips, protest urgency), **thermal/X-ray scan** (translucent subject, internal
mechanism visible-but-fuzzy).

Discipline for non-default registers:
- **Still verify the Chinese.** Medium-mimics (LED dot-matrix, weathered/ink-bleed
  paper, zoomed screenshots) are the HIGHEST risk for malformed glyphs — read the
  output and regenerate if any character is off.
- **The artifact must carry the argument**, not just be a skin. A chat screenshot
  works because the *reply* reframes the joke; a redaction works because the hidden
  thing IS the thesis. If the medium is pure costume, use the house low-poly instead.
- **One register per concept in an A/B batch** — generate the SAME hook across 3-4
  registers (realistic → stylized) to see which medium lands, then iterate on the winner.
- **Palette can leave the house system** for these registers (WeChat green, LED red,
  photocopy yellow are medium-authentic) — but keep amber/red reserved for the
  punchline element so the eye still lands where the argument wants it.

#### The Depth-first register — levers (subject-agnostic)

A *treatment*, not a subject. Use when the thumbnail should feel three-dimensional,
layered, and overwhelmingly dense rather than flat-editorial — when depth/scale/density
itself sells the big idea. The subject is whatever the episode needs (a faceted object,
a device, an exploded diagram, stacked translucent planes, a particle/word field, a
crowd, an architectural interior receding to a vanishing point). Validated 2026-06 on
video #13 (Wittgenstein — warm→cold layered word-planes). The levers (each load-bearing):

- **Many parallax depth layers, not one plane.** Explicitly call for a near field, a
  mid field, and a far field receding to a vanishing point / to dust at the edges.
  "Dozens of layers," "tens of thousands of particles," "receding stack" — name the
  density. A single flat layer kills the register.
- **Cinematic depth-of-field is the core trick.** Near field slightly BLURRED, a mid
  plane in SHARP focus, far field dissolving into haze/black. This is what reads as
  "3D / photographed-in-space" instead of "vector illustration." Always request it.
- **The headline is exempt from the blur — crisp & frontmost.** The dense field lives
  *behind* the text. State that the headline is razor-sharp, frontmost, and the ONLY
  large readable text; everything in the field is tiny/abstract texture. This is how
  you get "overwhelming" without sacrificing legibility at 320px.
- **Depth can carry the argument via a gradient through the layers.** A transition
  *across* the depth axis is on-message gold: warm/human in the near field → cold/
  machine in the far field (video #13), or known→unknown, present→history, one→many.
  The viewer's eye travels the z-axis and reads the thesis.
- **Keep the locked palette + the depth doing the work.** Still `#0A0E14` ground,
  semantic amber/cyan, drawn-not-rendered faceted surfaces, faint grain. NO smooth
  glossy 3D, NO Pixar softness, NO mobile-game cleanness, NO neon bloom — depth comes
  from layering + DOF + perspective, not from glossy render or glow.
- **Generate at the exact ÷16 aspect** (1536×864 for 16:9, 1024×768 for 4:3). The
  narrower 4:3 frame packs the layers tighter and reads even denser — generate the
  aspect you need rather than cropping, since cropping eats the receding edges.
- **Still verify the Chinese** — the busy field tempts the model to sneak fake glyph-
  text into the readable zone; confirm the headline characters are exact and that the
  field stays abstract/tiny.

#### The Loud Clickbait Face register (Bilibili/MrBeast) — hard rules

The opposite pole from the house editorial look: maximum arousal, minimum elements.
Use when the goal is raw reach and stop-the-scroll pull over sophistication.
Validated 2026-06 on video #12 (gazelle / shocked-graduate / wild-dog / bursting-
diploma set). The rules (each load-bearing — break one and it reads as a weak
editorial thumbnail instead of a loud one):

- **One subject,怼到镜头极近.** Push the subject so close to the lens it's slightly
  CROPPED at the frame edges (近大远小). Heavy bold black outline, extreme contrast,
  exaggerated to the point it barely fits.
- **The subject is almost always a FACE.** Faces are the highest-arousal visual
  carrier. Exaggerated expression — manic grin, 鬼畜, bulging eyes, dropped jaw,
  bright white eye-highlights, faint speed-lines / motion-blur for energy. Animal
  faces (the episode's gazelle / wild dog) and food/object close-ups also work; a
  destroyed object (a bursting diploma) is the object-version of a screaming face.
- **PROJECT CONSTRAINT — no photoreal humans.** The channel bans photoreal people
  (see `How_images_svgs.md`). So render human faces as **exaggerated BOLD CARTOON**
  or low-poly, never photographic. Animals/objects from the video's own motif set
  are the safest loud subjects. This is the one place the loud register bends to a
  hard project rule — do not generate a photoreal human face.
- **Text ≤ 6 characters, 黑体, NO art font.** Once the text is huge there's only
  room for ONE subject. Dead-simple heavy sans-serif so anyone reads it instantly
  (e.g. `装不出来`, `白读了`, `换一个`, `废纸一张`). NO 艺术字, NO decorative styling.
- **大红 / 大黄 / 大白, hard contrast, NO gradients.** Flat blazing fills (red
  `#E60012`, yellow `#FFD400`, white `#FFFFFF`), text in one solid color with a
  thick contrasting outline (red-on-yellow with white stroke; yellow-on-red with
  black stroke). NO 小清新 gradients, NO neon bloom.
- **Still verify the Chinese** — big 黑体 blocks are usually clean, but 4-character
  slogans can still drop a malformed stroke. Read and regenerate if off.



These come directly from iterating with the user on videos #7 and #8.

- **Text dominance is non-negotiable.** When the user says "larger text," they mean
  it should *dominate*. Push hero lines bigger and shrink/relocate the illustration.
- **"Subtle / sophisticated" ≠ literal diagram.** When asked to make a visual
  subtler, express the idea **abstractly** (opposing faceted forces, a void, a
  particle drift) rather than a labeled chart or a line graph. The user explicitly
  rejected literal divergence *lines* in favor of abstract opposing forces.
- **No glow trap.** Dark drop-shadow for legibility ONLY. The semantic colors
  already pop on `#0A0E14`; adding colored glow looks like a mobile-game ad. Always
  include "no colored glow" + "NO neon bloom" in the prompt.
- **Low-poly is the DEFAULT, not a law.** For the house editorial register, always
  include "120-180 visible flat polygon facets," "drawn-not-rendered," and the full
  set of NO-clauses (NO 3D glossy, NO Pixar, NO mobile-game) — without them the model
  drifts to smooth render. BUT when a concept's hook is a real-world artifact (job ad,
  chat, leaked file), switch to that artifact's register instead (see §5.1) — don't
  force low-poly onto a thumbnail whose whole power is reading as *real*.
- **Anti-slop block every time.** "every Chinese character spelled correctly, no
  garbled glyphs, no extra fake text" measurably reduces glyph errors. Add
  subject-specific exclusions (NO realistic anatomy, NO robot mascot, etc.).
- **Verify the render.** Always `Read` the output PNG and check: (a) Chinese is
  correct and not garbled, (b) palette held (or the register's intended palette), (c)
  text is dominant, (d) dimensions match the target aspect. Regenerate if any fail.
  Medium-mimic registers (LED dot-matrix, weathered paper, zoomed screenshots) are the
  highest glyph-slop risk — scrutinize the Chinese hardest there.

---

## 7. File & naming conventions

- **Scratch dir** (temp, can be wiped): `my-video/out/thumb-<slug>/` — holds the
  `req-*.json` and the raw `<uuid>.png` outputs.
- **Delivery dir** (committed): `my-video/public/projects/<project-folder>/thumbnails/`
  — copy keepers here with **descriptive names**: `candidate-<n>-<concept>.png`
  (e.g. `candidate-1-blind-spot.png`, `candidate-4-ai-mirror.png`).
- **Clean up** the temp `req-*.json` after the batch (`rm -f .../req-*.json`). Leave
  the raw uuid PNGs in scratch or delete them; only the named copies in
  `thumbnails/` matter.

---

## 8. Worked example (video #8 — predictive-processing, 2026-06)

1. Read `predictive-narration-plain.md` → thesis: the brain is a guessing machine;
   perception (blind spot, chair), decision (Libet), and the self (split-brain
   "interpreter"/旁白) are post-hoc; AI ("just guessing the next word") is the mirror.
   Read `theme.ts` (confirmed locked palette + 4:3) and `DarkSkull.tsx` /
   `BlindSpot.tsx` (motifs: dark skull, cyan ghost-world from a thin amber signal;
   amber-ringed void filled by cyan ghost).
2. Four concepts → four hooks: A blind-spot, B no-author/旁白, C skull-guessing,
   D AI-mirror.
3. Wrote `out/thumb-pp/req-A..D.json`, `size: "1024x768"`, locked palette, the §4
   template with each concept's metaphor + verbatim headline.
4. Fired 4 parallel curls → 4 PNGs in ~60s.
5. `Read` each, verified correct Chinese + palette + 1024×768.
6. Copied to `public/projects/8-predictive_processing/thumbnails/candidate-{1..4}-*.png`,
   removed `req-*.json`.

The exact prompts used are reproducible from this template; the only per-concept
deltas were the SUBJECT metaphor and the two headline lines.

---

## 9. Cross-references

- `video-generation-mcp/SKILL.md` — full MCP tool docs (image/video/transcribe).
- `How_images_svgs.md` (project root) — locked Register A/B/C library, 5-block
  anatomy, cutout pipeline, palette discipline.
- `video-content-strategy/thumbnail-extraction.md` — the *other* thumbnail path
  (Remotion-composition + frame extraction) and the YouTube A/B design principles
  (text covers 50%+, the glow trap, opacity calibration).
- `video-content-strategy/SKILL.md` — visual identity, three-layer architecture.
- `VideosCompiled.md` (project root) — where title / description / tags metadata for
  every video lives (write the chosen title + description there after thumbnails).
