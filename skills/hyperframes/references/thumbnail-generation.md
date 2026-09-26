<!-- Public portability adaptation, 2026-09-26. -->

# Thumbnail generation

Use for complete generated-PNG covers, including typography. Read the user's requested format/count and any designated completion checklist first. The register catalog below contains earlier project treatments; the selected film direction and current brief take precedence over their example defaults.

## 0. Workflow

1. Read the script, research qualifications and project design, then identify distinct hooks: question, mechanism, contradiction, consequence or useful payoff.
2. Design the requested concept set. Keep a common selected style when that is the brief; change the visual argument, not merely colors or headline placement.
3. Save a separate exact prompt per concept and format. If a checklist requires **text-only generation**, pass no input images and generate all typography with the image.
4. Use one configured image-generation call per independent composition. Follow [asset-generation.md](../../hyperframes-creative/references/asset-generation.md) for the current schema, inspection and saved-file/provenance workflow.
5. Inspect every original at full resolution and thumbnail size: exact text, object counts, factual implications, anatomy, hierarchy, edge clearance and actual aspect ratio. Correct failures through the route allowed by the brief.
6. Retain accepted original PNGs, exact prompts and generation/review records in the current project's cover directory. Deliver the requested gallery and original downloads; cleanup comes only after verified delivery files are recorded.

Cover counts, aspect ratios and text-only restrictions come from the current brief or checklist. Generate independent compositions where requested; record original versus derived images honestly. Prompt examples are in [paper-theatre-prompts.md](../../hyperframes-creative/references/paper-theatre-prompts.md).

For later requests for more styles/hooks, append stable concept IDs and retain the previous accepted set. Preserve exact requested Chinese hooks; vary the visual concept as well as the treatment. Keep both format originals, prompts, inspected outcomes and title pairings in the gallery manifest. One earlier cover set's later apocalypse/robot direction added concepts 16–28 (26 images), so the final retained set was 56 images; the original completion paragraph still said 30. Derive delivery/cleanup counts from current manifests and files, not an earlier report. Illustrative cover drama must not silently rewrite the film's qualified claims into factual certainty.

## 1. Tool route and model reporting

Use the selected provider or available host image tool. [asset-generation.md](../../hyperframes-creative/references/asset-generation.md) includes an optional Codex example; its live schema is authoritative. Model, size and output parameters differ by provider. Record the requested model separately from metadata actually returned; do not invent unsupported arguments.

Chinese typography, exact counts and palette fidelity still require visual verification. Do not promise a model will produce them correctly without inspecting the outputs.

## 2. Prompt-only call

Optional Codex invocation, only when the session exposes these tools:

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 1000}
const result = await tools.image_gen__imagegen({
  prompt: "One complete 16:9 Chinese video cover. ... Exact full prompt ..."
});
generatedImage(result);
```

Omitting both `referenced_image_paths` and `num_last_images_to_include` makes this a new image with no image inputs. For a text-only brief, describe style in words even if production used referenced artwork. A second format is another prompt-only generation with a purpose-built composition, not an edit of the first output. Copy the returned accepted original into the project; preserve prompts and actual output metadata.

## 3. Aspect and composition

Use the requested destination aspect, not a presumed channel-wide ratio. Describe the frame shape and desired resolution in the prompt, then verify the returned dimensions. Examples for separately composed counterparts are **1536×864 (16:9)** and **1280×960 (4:3)**; these are requested examples, not guaranteed built-in dimensions or API fields.

A wide frame may place headline and subject in left/right tension; its taller counterpart may place the headline above a compact mechanism. Rebalance text, depth and edge clearance for each. If the brief requires original native-format images, regenerate a wrong ratio rather than cropping or stretching it. Outside that branch, any allowed derivation must still be described honestly and preserve legibility.

## 4. Historical dark-editorial prompt example

This is an earlier dark low-poly register example, not a required style. Adapt the material, palette, text hierarchy and frame to the selected project direction. B-paper uses its own prompt companion. Within one selected direction, keep material/palette blocks consistent while changing the hook and composition.

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

### 4.1 Palette for the selected dark-editorial register

| Role | Hex | Use for |
|---|---|---|
| Background | `#0A0E14` | near-black ground |
| System / neutral | `#4A7C9B` | steel blue — baseline subject, the head/skull, current state |
| Tension / problem | `#E8913A` | amber — the void, the crack, the strain, what's breaking |
| Insight / resolution | `#3EC9A7` | cyan-green — the guess, the fill, the thesis, the fix |
| Text | `#E8E4DF` | warm off-white headline |
| Shadow facets | `#1a1f28` | warm near-black |

These colors belonged to the historical `the-filter/theme` dark-editorial project. Within that selected register, amber marks the problem and cyan marks the insight. Preserve that semantic mapping when reusing this specific treatment.

---

## 5. Historical dark-editorial batch — four hook examples

The earlier dark-editorial batch explored **four distinct hooks**. The table shows the angles used in that batch; the current brief sets the concept count under §0.

| Angle | What it is | Example (video #8) |
|---|---|---|
| **Cold-open hook** | The most concrete/visceral/verifiable claim | "你眼睛里有个黑洞，你却从没见过它" (blind spot) |
| **Thesis** | The core reframe the video installs | "你脑子里没有作者，只有一个旁白" |
| **Mechanism** | The how-it-works image | "你看到的世界，是大脑猜出来的" (skull guessing) |
| **Payoff / mirror** | The closing twist that recontextualizes everything | "你嘲笑 AI 只会猜下一个字，你的大脑也一样" |

For each concept in that dark-editorial batch:
1. Pick the **strongest 1-2 line headline** (the title text IS 55%+ of the frame).
2. Pick a **visual metaphor from the video's own motifs** — read the scene files so the thumbnail rhymes with the actual animation (e.g. #8 already had a dark skull, a blind-spot void, a split-brain, an AI mirror; #7 had a divergence curve and a low-poly Socrates bust). Reuse those, don't invent unrelated imagery.
3. Assign palette roles **by meaning** (see §4.1).
4. Keep the illustration to the **left ~30-35%**, text dominant on the right.

### Headline craft within the dark-editorial register

- **2 hero lines max**, plus an optional smaller kicker line.
- Hero lines **ENORMOUS** — must read at 320px-wide thumbnail scale on mobile.
- Tint ONE key word in amber or cyan for a focal pop (e.g. "黑洞" amber, "猜" cyan, "旁白" cyan). Don't tint more than one.
- Quote every character **verbatim and in order** in the prompt (`reads exactly "..."`). The model renders exactly what you write — a typo in the prompt becomes a perfectly-rendered wrong character.

### 5.1 Other selectable style registers

The §4 template matched the dark low-poly videos used in those earlier projects. For a hook carried by a recognizable artifact (a job ad, a chat, a leaked file), its medium can make the argument directly readable. The following catalog records alternatives explored in education-ep5 and other projects; choose a treatment that fits the current film's selected visual direction.

When a concept's hook IS an artifact, generate it in that artifact's register instead of forcing it into low-poly. Candidate registers (each validated):

| Register | What it mimics | Best for | Key prompt levers |
|---|---|---|---|
| **Real recruitment board** | A printed 招聘 flyer / paper notice pinned to a board, or a glowing LED dot-matrix job-fair sign | Absurd-contradiction memes (e.g. `招应届生 / 要十年经验`); the two-line gag IS the frame | Aged paper `#F4EDE0` + rusty tacks + slight skew; OR black LED panel with dot-matrix characters, amber line 1 / hot-red line 2. Strip to ONLY the two contradictory lines. |
| **WeChat group-chat screenshot** | A dark-mode WeChat chat: a shared job-ad card + a deadpan mic-drop reply | Self-relevant social hooks; maximum native virality | Chat bg `#191919`, grey `#3A3A3A` bubble (other) with LEFT avatar, green `#07C160` bubble (you) right-aligned with NO right avatar; bubble tails sell authenticity. **Zoom in ~2× so two bubbles fill the frame** — keeps text legible at 320px while still reading as a real screenshot. |
| **Low-poly editorial** | Faceted forms on near-black | Films whose selected direction already uses dark faceted imagery | The historical §4 template and its color roles, used when this register is selected. |
| **Depth-first** | A dense, layered, 3D scene with strong receding perspective and cinematic depth-of-field — the *treatment*, not a subject. The subject can be ANYTHING (a faceted object, a device, a diagram, stacked planes, a particle/word field, a crowd, an architectural space); the point is many parallax layers, near-field blur → sharp mid → vanishing-point dust, and an overwhelming sense of depth and density. Headline stays razor-sharp and frontmost over the blurred field | "Overwhelming," maximalist, big-idea episodes where scale/density/depth IS the message; thumbnails that should feel three-dimensional and rich rather than flat-editorial | Inverts the §4 "restrained illustration" rule — the dense layered field IS the spectacle, but text stays crisp & frontmost. See the dedicated callout below. |
| **Redacted classified document** | A photocopied/leaked file with heavy black redaction bars + a diagonal `机密` / "CLASSIFIED" stamp | "Someone hid this" provocation hooks (suppression, hidden sorting) | Yellowed photocopy paper, dense opaque black bars over the subject, amber stamp at ~60% opacity, slight scan skew (0.5-1°). The hero line is "the part the censors missed." |
| **Loud clickbait face** (Bilibili/MrBeast register) | ONE giant exaggerated FACE 怼到镜头极近 (cropped at edges), manic expression, ≤6-char slogan slapped on | Maximum-arousal, broad-reach episodes; when you want raw stop-the-scroll energy over sophistication | See the dedicated callout below — this register has hard rules. |

Other registers explored and on the table when the hook calls for them: **Soviet constructivist polemic poster** (blood-dark, hot red-orange, propaganda energy), **accusatory white-glare** (overexposed near-white bg, stark silhouette — maximum contrast-difference in a dark feed), **street-art spray stencil** (concrete wall, drips, protest urgency), **thermal/X-ray scan** (translucent subject, internal mechanism visible-but-fuzzy).

When selecting one of these registers:
- **Still verify the Chinese.** Medium-mimics (LED dot-matrix, weathered/ink-bleed paper, zoomed screenshots) are the HIGHEST risk for malformed glyphs — read the output and regenerate if any character is off.
- **The artifact must carry the argument**, not just be a skin. A chat screenshot works because the *reply* reframes the joke; a redaction works because the hidden thing IS the thesis. If the medium is pure costume, choose one that clarifies the mechanism.
- **Style exploration when direction is still open** — compare the same hook across a few registers, then select a coherent direction. An already selected paper style uses its own material language across the requested concept set.
- **Palette follows the selected medium** (for example WeChat green, LED red or photocopy yellow). Give the argument-bearing accent a clear role within that palette.

#### The Depth-first register — levers (subject-agnostic)

A *treatment*, not a subject. Use when the thumbnail should feel three-dimensional, layered, and overwhelmingly dense rather than flat-editorial — when depth/scale/density itself sells the big idea. The subject is whatever the episode needs (a faceted object, a device, an exploded diagram, stacked translucent planes, a particle/word field, a crowd, an architectural interior receding to a vanishing point). Validated 2026-06 on video #13 (Wittgenstein — warm→cold layered word-planes). The levers (each load-bearing):

- **Many parallax depth layers, not one plane.** Explicitly call for a near field, a mid field, and a far field receding to a vanishing point / to dust at the edges. "Dozens of layers," "tens of thousands of particles," "receding stack" — name the density. A single flat layer kills the register.
- **Cinematic depth-of-field is the core trick.** Near field slightly BLURRED, a mid plane in SHARP focus, far field dissolving into haze/black. This is what reads as "3D / photographed-in-space" instead of "vector illustration." Always request it.
- **The headline is exempt from the blur — crisp & frontmost.** The dense field lives *behind* the text. State that the headline is razor-sharp, frontmost, and the ONLY large readable text; everything in the field is tiny/abstract texture. This is how you get "overwhelming" without sacrificing legibility at 320px.
- **Depth can carry the argument via a gradient through the layers.** A transition *across* the depth axis is on-message gold: warm/human in the near field → cold/ machine in the far field (video #13), or known→unknown, present→history, one→many. The viewer's eye travels the z-axis and reads the thesis.
- **Keep the locked palette + the depth doing the work.** Still `#0A0E14` ground, semantic amber/cyan, drawn-not-rendered faceted surfaces, faint grain. NO smooth glossy 3D, NO Pixar softness, NO mobile-game cleanness, NO neon bloom — depth comes from layering + DOF + perspective, not from glossy render or glow.
- **Request the intended aspect** (for example 1536×864 for 16:9, 1280×960 for 4:3), then verify the returned dimensions. The narrower 4:3 frame packs the layers tighter and reads even denser — compose for the aspect you need, since cropping eats the receding edges.
- **Still verify the Chinese** — the busy field tempts the model to sneak fake glyph- text into the readable zone; confirm the headline characters are exact and that the field stays abstract/tiny.

#### The Loud Clickbait Face register (Bilibili/MrBeast) — hard rules

The opposite pole from the house editorial look: maximum arousal, minimum elements. Use when the goal is raw reach and stop-the-scroll pull over sophistication. Validated 2026-06 on video #12 (gazelle / shocked-graduate / wild-dog / bursting- diploma set). The rules (each load-bearing — break one and it reads as a weak editorial thumbnail instead of a loud one):

- **One subject, 怼到镜头极近.** Push the subject so close to the lens it's slightly CROPPED at the frame edges (近大远小). Heavy bold black outline, extreme contrast, exaggerated to the point it barely fits.
- **The subject is almost always a FACE.** Faces are the highest-arousal visual carrier. Exaggerated expression — manic grin, 鬼畜, bulging eyes, dropped jaw, bright white eye-highlights, faint speed-lines / motion-blur for energy. Animal faces (the episode's gazelle / wild dog) and food/object close-ups also work; a destroyed object (a bursting diploma) is the object-version of a screaming face.
- **PROJECT CONSTRAINT — no photoreal humans.** The channel bans photoreal people (see `How_images_svgs.md`). So render human faces as **exaggerated BOLD CARTOON** or low-poly, never photographic. Animals/objects from the video's own motif set are the safest loud subjects. This is the one place the loud register bends to a hard project rule — do not generate a photoreal human face.
- **Text ≤ 6 characters, 黑体, NO art font.** Once the text is huge there's only room for ONE subject. Dead-simple heavy sans-serif so anyone reads it instantly (e.g. `装不出来`, `白读了`, `换一个`, `废纸一张`). NO 艺术字, NO decorative styling.
- **大红 / 大黄 / 大白, hard contrast, NO gradients.** Flat blazing fills (red `#E60012`, yellow `#FFD400`, white `#FFFFFF`), text in one solid color with a thick contrasting outline (red-on-yellow with white stroke; yellow-on-red with black stroke). NO 小清新 gradients, NO neon bloom.
- **Still verify the Chinese** — big 黑体 blocks are usually clean, but 4-character slogans can still drop a malformed stroke. Read and regenerate if off.

---

## 6. Feedback & Lesson Learned Levers

These come directly from iterating with the user on videos #7 and #8.

- **For a text-led cover, text must dominate.** When the user says "larger text," they mean it should *dominate*. Push hero lines bigger and shrink/relocate the illustration.
- **"Subtle / sophisticated" ≠ literal diagram.** When asked to make a visual subtler, express the idea **abstractly** (opposing faceted forces, a void, a particle drift) rather than a labeled chart or a line graph. The user explicitly rejected literal divergence *lines* in favor of abstract opposing forces.
- **No glow trap.** Dark drop-shadow for legibility ONLY. The semantic colors already pop on `#0A0E14`; adding colored glow looks like a mobile-game ad. Always include "no colored glow" + "NO neon bloom" in the prompt.
- **Low-poly is one earlier register.** For the house editorial register, always include "120-180 visible flat polygon facets," "drawn-not-rendered," and the full set of NO-clauses (NO 3D glossy, NO Pixar, NO mobile-game) — without them the model drifts to smooth render. BUT when a concept's hook is a real-world artifact (job ad, chat, leaked file), switch to that artifact's register instead (see §5.1) — don't force low-poly onto a thumbnail whose whole power is reading as *real*.
- **Anti-slop block every time.** "every Chinese character spelled correctly, no garbled glyphs, no extra fake text" measurably reduces glyph errors. Add subject-specific exclusions (NO realistic anatomy, NO robot mascot, etc.).
- **Verify the render.** Always `Read` the output PNG and check: (a) Chinese is correct and not garbled, (b) palette held (or the register's intended palette), (c) text is dominant, (d) dimensions match the target aspect. Regenerate if any fail. Medium-mimic registers (LED dot-matrix, weathered paper, zoomed screenshots) are the highest glyph-slop risk — scrutinize the Chinese hardest there.

---

## 7. File conventions

Use the current project's delivery directory, for example `thumbnails/concept-01-16x9.png` and `concept-01-4x3.png`, with exact prompts under `thumbnails/prompts/` and individual review/provenance records. Keep accepted original PNGs unchanged. A paired HTML gallery should show each whole image, allow full-image inspection and link to the original download. Follow the current checklist for publishing copy and cleanup, and retain compact evidence when rejected drafts are removed.

---

## 8. Historical concept example (video #8 — predictive-processing, 2026-06)

The following records an earlier project. Its local-MCP mechanics and deleted scratch requests are historical; use the current built-in route and retained prompt records above.

1. Read `predictive-narration-plain.md` → thesis: the brain is a guessing machine; perception (blind spot, chair), decision (Libet), and the self (split-brain "interpreter"/旁白) are post-hoc; AI ("just guessing the next word") is the mirror. Read `theme.ts` (confirmed locked palette + 4:3) and `DarkSkull.tsx` / `BlindSpot.tsx` (motifs: dark skull, cyan ghost-world from a thin amber signal; amber-ringed void filled by cyan ghost).
2. Four concepts → four hooks: A blind-spot, B no-author/旁白, C skull-guessing, D AI-mirror.
3. Wrote `out/thumb-pp/req-A..D.json`, `size: "1024x768"`, locked palette, the §4 template with each concept's metaphor + verbatim headline.
4. Fired 4 parallel curls → 4 PNGs in ~60s.
5. `Read` each, verified correct Chinese + palette + 1024×768.
6. Copied to `public/projects/8-predictive_processing/thumbnails/candidate-{1..4}-*.png`, removed `req-*.json`.

The concept levers were the SUBJECT metaphor and the two headline lines. Current work should save its exact prompts rather than claim reconstruction from a template is the original prompt.

---

## 8b. The Vox light-editorial photo-cutout register (optional example)

A **bright, light** counterpart to the dark §4 house look and a refinement of the §5.1 registers. This register combines — aged/clean newsprint + hand-cut photo-collage objects + a giant black slab headline with a rough yellow marker highlight. Use it for **explainer/documentary episodes with a print-journalism feel** (finance, history, economics), especially when the series' established thumbnails already read as editorial collage.

For a self-contained material/hierarchy prompt recipe, see [paper-theatre-prompts.md](../../hyperframes-creative/references/paper-theatre-prompts.md). Supply any original reference image yourself and identify its rights and role.

### The register's load-bearing rules (each learned from user iteration)

- **BRIGHT, not brown.** Background is clean off-white / pale magazine stock (`#F7F4EC`–`#FBF9F3`), NOT a dark or muddy-brown aged wash. Only *faint ghosted* newsprint columns at low opacity so it stays light and open with lots of luminous negative space. (v1 came out too dark/brown — the explicit "bright, NOT brown, keep it luminous" language fixed it.)
- **Text DOMINATES and OVERLAPS.** Hero lines must own 60%+ of the frame and are layered **ON TOP of** the collage where they meet (over dial tops, wave crests, domino tops) — text and collage do **not** need to be strictly separated into left/right zones. Put a **crisp white halo / thin outline** behind the black type where it overlaps a cutout so it stays razor-legible.
- **Real photo-cutout feel.** Objects are hand-cut magazine photos: **rough torn WHITE borders + soft realistic drop shadows**, pasted onto the paper. Not low-poly, not flat vector, not 3D render.
- **Palette.** Off-white paper `#F7F4EC`, black ink headline `#141414`, ONE rough hand-painted **yellow marker-highlight** `#F5C518` behind the single key phrase, accent cutouts in vintage印钞 red `#B23A2E` and brass/gold `#C9A24B`. NO purple/neon/rainbow, NO muddy brown.
- **Example headline grammar.** Line 1 = the visceral payload (huge black). Line 2 = the mechanism/reframe (still large black) with the yellow marker on the ONE key phrase. Small kicker line = the series tag (muted red `#B23A2E`), e.g. `学校没教的经济学第三课`. Quote every character `reads exactly "..."`.
- **Request the aspect required by the current brief** and **inspect every original + verify the Chinese** — the busy collage tempts fake glyphs.
- **A/B by metaphor, not by style.** Keep STYLE/PALETTE/COMPOSITION blocks near-verbatim across the batch; vary only the SUBJECT collage metaphor (e.g. ep3: rate-dial+torn-bills / moon+tide / banknote-dominoes / restamped-%+map) so the set is a real hook spread that reads as siblings.
- **Persist the prompts.** Save exact prompt text and returned generation metadata in the project's `thumbnails/prompts/` folder; §7 preserves them for every register.

## 9. Cross-references

- [paper-theatre-prompts.md](../../hyperframes-creative/references/paper-theatre-prompts.md) — portable paper-material prompt recipes.