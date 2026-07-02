# AI Generation Archive

> **⚠ DEPRECATED — preserved for historical reference only.**
>
> This file documents a **deprecated** multi-model AI generation pipeline (Imagen, Flux, Grok Imagine for stills; KlingAI, Veo, Wan, Seedance for motion) that was used in the early hybrid Code+AI workflow.
>
> **The active pipeline as of 2026-04** uses a single image model — `openai/gpt-image-2` — for raster artifacts only, with all motion handled by **Remotion** (code-generated animation). See `SKILL.md` § Three-Layer Architecture for the current operational reference.
>
> Do not use the model recommendations, prompt templates, or pipeline guidance below as live guidance. They are kept as a record of what was tried and replaced. If AI-generated motion layers are ever reintroduced, the patterns here may be a useful starting point — but should be re-evaluated against current model capabilities first.

---

## Original archive note

Content stashed from `video-content-strategy/SKILL.md` — covers the AI image/video generation pipeline that was part of the hybrid Code+AI workflow. Preserved here for reference if AI-generated layers are reintroduced.

---

## The Hybrid Principle (Original)

The structural backbone is **code-generated animation** (Remotion). The atmospheric flesh is **AI-generated content** composited into the code canvas. Neither alone produces the result — the hybrid delivers both precision and cinematic energy.

**AI generation handles organic energy:**
- Atmospheric backgrounds and textures — particle fields, gradient shifts, ambient motion
- Flat animation sequences (Kurzgesagt-style) — smooth organic movement that code struggles to replicate
- Abstract 3D visualizations (Primer-style) — geometric shapes with natural motion physics
- Cinematic establishing shots and transitions — environmental mood, production value
- Metaphor visualizations — specific conceptual images or short animations

**The composition:** Remotion is the master canvas. AI-generated clips composite into it as background layers, texture overlays, and visual assets. Code controls timing, layout, text, and structural elements on top.

---

## AI Generation: Where It Excels

AI generation handles what code cannot efficiently produce — organic motion, cinematic texture, atmospheric energy. Use it for everything EXCEPT text, data, and precision-timed structural elements.

**1. Atmospheric backgrounds** — Cinematic textures, ambient particle fields, gradient environments. Composite at 30-70% opacity beneath coded elements. The background breathes while the foreground communicates.

**2. Flat animation sequences** — Kurzgesagt-style organic motion: smooth easing, ambient aliveness, stylized object transitions. AI excels at the fluid, living quality that makes hand-coded SVG animation feel stiff by comparison. Prompt with style locks and the semantic color palette.

**3. Abstract 3D visualizations** — Primer-style geometric shapes with natural motion physics. Simple transformations, agent-like behavior, organic settling. No complex choreography or math required.

**4. Cinematic transitions and establishing shots** — Short atmospheric bridge clips between acts. Environmental mood shifts, abstract energy, visual palette transitions. Wendover/PolyMatter-style production value.

**5. Metaphor assets** — When the script invokes a concrete metaphor, generate a flat geometric illustration or short animation. Style-locked to semantic palette.

**6. Design-phase exploration** — Generate concepts to explore visual directions. Iterate. Keep what works, rebuild what needs precision in code.

**What AI CANNOT handle for us:**
- Text of any kind (garbled rendering)
- Specific numbers, data, or labels
- Complex multi-element choreography with precise timing
- Mathematical animations or physics simulations
- Frame-synced transitions matching narration beats

---

## The Image-First Pipeline

Image generation produces significantly higher quality and better style adherence than text-to-video alone. A single frame gives the video model a resolved subject, composition, palette, and style — eliminating most of the cognitive budget guesswork.

**The pipeline: Image → Image-to-Video**

1. **Generate a style-locked image** (Imagen, Flux, or Grok Imagine) — this is where you invest prompting effort. The image anchors everything.
2. **Feed the image to a video model** (Veo i2v, KlingAI i2v, Wan i2v) — prompt only the motion/action. The style, color, composition are already locked by the image.

This produces dramatically more consistent results than text-to-video because the image resolves visual ambiguity before the video model allocates any attention to it. The image is a visual "Tier 0" — it answers subject, style, color, and framing before the video prompt even begins.

**When to use image-first vs text-to-video:**

| Use Image-First | Use Text-to-Video |
|---|---|
| Style consistency matters (branded assets, series) | Quick exploration, mood discovery |
| Flat animation / graphic style (Kurzgesagt) | Atmospheric backgrounds, simple ambient motion |
| Specific composition or metaphor visualization | Abstract textures where exact framing doesn't matter |
| Multiple clips that must feel like the same universe | One-off cinematic transitions |

**Style-locking rule**: Every AI generation prompt MUST include:
- Semantic palette colors (steel blue/cyan, amber/orange, dark background)
- "No text, no watermarks, no realistic human faces"

---

## Energy-First Prompting

**CRITICAL — Describe ENERGY, not STRUCTURE:**

The single most common failure mode is prompting like an engineer instead of a visual thinker. Describing structure produces diagrams. Describing energy produces art.

| Dead Prompt (structure) | Alive Prompt (energy) |
|---|---|
| "30 blue circles connected by lines with dashed amber boundary on dark background" | "A dense luminous cluster pulses with trapped energy, pressing outward against an invisible barrier. Edges glow hot amber where shapes strain against the limit." |
| "Flat vector illustration, no gradients, no glow, no shadows" | "Bold abstract animation frame. Dramatic internal glow. Striking, cinematic." |
| "Information flowing through a network" | "Thousands of amber light threads stream past a solitary cyan point — a mind alone in an ocean of noise" |

The prompt must convey what the viewer should FEEL, not what a graph renderer should draw. Glow, gradients, and dramatic lighting are energy — removing them produces dead frames.

---

## Low-Poly Prompting Style

**Validated visual identity: Low-Poly Geometric**

The style is **low-poly** — faceted geometric surfaces, hard angular edges, minimal polygon count. This is EIF's "laser" made visual: every polygon is a deliberate allocation of information. No wasted geometry. Maximum signal per face. The form is compressed to its essential structure.

Why low-poly works for us:
- **Low entropy = organized energy** — each facet is intentional, nothing is decorative noise
- **Inherently abstract** — cannot be mistaken for photorealism, honest about being a representation
- **Anti-consensus** — most AI content maximizes detail. Low-poly goes opposite: compressed, essential, deliberate.
- **Dramatic lighting** — hard geometric edges catch and reflect light in sharp, striking ways
- **AI-generation friendly** — models handle clean geometric shapes reliably
- **i2v friendly** — clean edges and flat faces animate smoothly without artifacts

Key properties from validated frames:
- **Dark faceted surfaces** with amber/orange glow at stress points and cyan/teal at breakthrough moments
- **Asymmetric composition** — directional force, energy has a vector
- **Focal point = concept** — the brightest pixel is where the argument lives
- **Light as consequence** — glow escapes FROM strain or breakthrough, not applied as decoration
- **Fragments and particles** at impact/fracture points sell dynamism in a static frame

**Style keywords for prompting:** low-poly, geometric, faceted, angular, polygonal, hard edges, dark faceted surfaces, minimal geometry, dramatic lighting on angular faces.

Use `google/imagen-4.0-ultra-generate-001` as the default for hero frames.

**MANDATORY: Run Gaze/Dream/Create** (from `video-creation-prompts`) before writing any generation prompt. Never skip directly to prompting.

---

## MCP Generation Reference

Use the `video-generation-mcp` skill's `generate_image` and `generate_video` MCP tools. Model selection by use case:

### Image Generation (style anchoring, metaphor assets)

| Use Case | Model | Key Params |
|---|---|---|
| Highest quality single frame | `google/imagen-4.0-ultra-generate-001` | `aspectRatio: "16:9"` |
| Fast iteration / exploration | `google/imagen-4.0-generate-001` | `aspectRatio: "16:9"` |
| Flat vector / graphic style | `bfl/flux-2-pro` | `aspectRatio: "16:9"` |
| Creative style variations | `xai/grok-imagine-image-pro` | `aspectRatio: "16:9"` (no `size` param) |

Generate multiple variants with `n: 2` or `n: 3` to pick the best frame.

### Video Generation (KlingAI only)

Feed the generated image as the `image` param. Prompt the motion with FROM-TO directionality, include low-poly style context. See `video-creation-prompts` "Image-to-Video Motion Prompts" for the full prompt structure.

| Use Case | Model | Key Params |
|---|---|---|
| **Default i2v** | `klingai/kling-v3.0-i2v` | `duration: 10`, `aspectRatio: "16:9"`, `providerOptions: "{\"klingai\":{\"mode\":\"pro\",\"cfgScale\":0.7}}"` |
| Camera control | `klingai/kling-v2.6-i2v` | cameraControl in providerOptions (see MCP skill) |
| First+last frame | `klingai/kling-v2.6-i2v` | imageTail in providerOptions |
| Multi-shot storyboard | `klingai/kling-v3.0-i2v` | multiShot + multiPrompt in providerOptions |
| t2v (skip image-first) | `klingai/kling-v3.0-t2v` | `duration: 10` — include full low-poly style in prompt |

i2v motion prompt — describe FROM-TO with force, include style context:
> *"Low-poly geometric fragments lift FROM the faceted terrain and accelerate upward INTO the central cyan beam, converging as they ascend. Each angular fragment rotates slowly, hard geometric faces catching dramatic amber and cyan light. The dark low-poly terrain remains static. Slow camera push toward the beam."*

### Prompt Templates (Energy-First, Low-Poly)

**Image generation (hero frame for i2v pipeline):**

> Bold abstract animation frame. Low-poly geometric style. [Describe the concept as a lived visual experience — what ENERGY does it convey? What does the viewer FEEL?]. Dark faceted angular surfaces. Dramatic lighting on hard geometric faces, [cyan/teal and amber/orange palette], deep dark background. Striking, bold composition. No text, no watermarks.

**Example — The Prison (coordination ceiling):**

> Bold abstract animation frame. Low-poly geometric style. A massive dark faceted sphere of angular polygonal surfaces sits in vast empty space. Amber light glows through the cracks between geometric faces — internal pressure building. A single point on the surface fractures, brilliant cyan light beginning to escape. The sphere is monumental, oppressive, beautiful. Dramatic side-lighting catches each angular face at a different angle. Deep dark background, vast negative space. Striking, tense, cinematic. No text, no watermarks.

**i2v motion prompt (for animating the hero frame):**

> Low-poly geometric style. [CORE MOTION: subject moves FROM origin TO destination, driven by specific force]. [AUXILIARY: compatible secondary motions — rotating, catching light]. [CONSTRAINTS: what stays static — terrain, background, surrounding elements]. [CAMERA: movement relative to subject]. Dark faceted surfaces, angular polygonal shapes, amber and cyan palette.

**Example — The Laser (coherence beam):**

> Low-poly geometric style. Dark angular fragments lift FROM the faceted terrain surface and accelerate upward INTO the central cyan beam of light, converging and aligning as they ascend. Each fragment rotates slowly, hard polygonal faces catching dramatic amber light on one side and cyan on the other. The fragments begin scattered and chaotic near the ground, becoming organized and aligned as they approach the beam. The low-poly terrain remains completely static. Slow camera push forward toward the base of the beam. The beam pulses gently, growing slightly brighter as more fragments join it.

### Key MCP Rules

- `providerOptions` must be a JSON **string**: `"{\"klingai\":{\"mode\":\"pro\",\"cfgScale\":0.7}}"`
- Always include `negativePrompt: "text, watermark, blurry, smooth surfaces, realistic human faces"` in providerOptions
- `cfgScale: 0.7` for detailed motion prompts (v3.0+ only) — increases prompt adherence
- xAI image generation: use `aspectRatio`, NOT `size`
- Video generation takes minutes — this is normal
- Always include low-poly style keywords in BOTH image and video prompts

See `video-generation-mcp` skill for full KlingAI parameter reference (camera control, motion brush, multi-shot, first+last frame).

---

## Related Companion Skills (AI Generation)

- `video-generation-mcp` — MCP tools for `generate_image` and `generate_video`. The execution layer. Use this to actually generate AI images and video clips via Imagen, Flux, Veo, KlingAI, Wan, Seedance, Grok. Read this skill FIRST before making any MCP generation calls.
- `video-creation-prompts` — prompt engineering, cognitive budget, iteration protocol, Gaze/Dream/Create pipeline. Use for crafting effective generation prompts.
