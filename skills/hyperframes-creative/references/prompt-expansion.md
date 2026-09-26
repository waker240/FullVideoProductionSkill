# Prompt Expansion

Run on every composition. Expansion is not about lengthening a short prompt — it's about grounding the user's intent against the design spec (`frame.md` or `design.md`) and `house-style.md` and producing a consistent intermediate that every downstream agent reads the same way.

Runs AFTER design direction is established (Step 1). The expansion consumes the design spec (`frame.md` or `design.md`, if present) and produces output that cites its exact values.

## Prerequisites

Read before generating:

- the design spec — `frame.md` → `design.md` → `DESIGN.md` (read the first that exists) — extract brand colors, fonts, mood, and constraints. The expansion cites these exact values (hex codes, font names); it does not invent new ones.
- `references/beat-direction.md` — per-beat planning format (concept, mood, choreography verbs, transitions, depth layers, rhythm). The expansion outputs each scene using this format.
- `references/video-composition.md` — video-medium rules for density, scale, and color presence. The expansion applies these automatically.
- `house-style.md` — its figure-ground, color, motion, and typography rules apply to every scene. The expansion writes output that conforms to them without inventing an element quota.

If no design spec (`frame.md` or `design.md`) exists yet, run Step 1 (Design system) first. Expansion without a design context produces generic scene breakdowns that later agents ignore.

## Why always run it

**The expansion is never pass-through.** Every user prompt — no matter how detailed — is a _seed_. The expansion's job is to enrich it into a fully-realized per-scene production spec that the scene subagents can build from directly.

Even a detailed 7-scene brief lacks things only the expansion adds:

- **A figure-ground decision per scene** — choose deliberate void or only the substrate cues that establish place, material, state, or eye travel. Never add atmosphere to repair an underdesigned mechanism.
- **Semantic behavior for every moving element** — motion must reveal depth, change state, carry causality, or hand off the eye. An intentionally still substrate is allowed.
- **Earned micro-details that make a scene specific** — registration marks, tick indicators, coordinate labels, or grid patterns only when they belong to the world or hold useful state. Generic production garnish is not richness.
- **Transition choreography at the object level** — not "crossfade" but "X expands outward and becomes Y". Specific duration, ease, and morph source/target.
- **Pacing beats within each scene** — where tension builds, where a hold lets the viewer breathe, where the accent word lands.
- **Exact hex values, typography parameters, ease choices** from the design spec — no vagueness left for the scene subagent to guess.

Expansion's job on a detailed prompt is not to summarize or pass through — it's to **take what the user wrote and make it more performable**. The user's content stays; state turns, representation choices, density, world logic, and earned detail are designed around it. That's what makes the difference between a scene that matches the brief and a scene that feels alive.

The quality gap between a single-pass composition and a multi-scene-pipeline composition comes from this step. Expansion front-loads the richness so every scene subagent builds from a rich brief, not a terse one.

**Do not skip. Do not pass through.** Single-scene compositions and trivial edits are the only exceptions.

## What to generate

Expand into a full production prompt with these sections:

1. **Title + style block** — cite the design spec's exact hex values, font names, and mood. Do NOT invent a palette — quote what the design provides.

2. **Rhythm declaration** — name the scene rhythm before detailing any scene. Example: `hook-PUNCH-breathe-CTA` or `slow-build-BUILD-PEAK-breathe-CTA`. Use `references/beat-direction.md` for rhythm templates by video type.

3. **Global rules** — density curve, representation ladder, semantic motion law, and transition grammar. Add parallax or micro-motion only where it proves depth or state. Match energy to mood (calm → slow eases, high → snappy eases).

4. **Per-scene beats** — for each scene, use the beat-direction format:
   - **Concept** — the big idea in 2-3 sentences. What visual WORLD? What metaphor? What should the viewer FEEL?
   - **Mood direction** — cultural/design references, not hex codes. ("Bauhaus color studies", "cinematic title sequence", "editorial calm")
   - **Figure-ground + density** — name the substrate, content, and foreground layers that are actually needed; state whether the beat is sparse, medium, or dense and why.
   - **Animation choreography** — specific semantic verbs for moving elements and the visible state turn they cause. Intentionally static evidence/substrate is allowed. If a moving element has no semantic verb, cut or redesign it.
   - **Transition out** — name the outgoing object, vector, or state that carries the eye into the next scene. Specify a treatment only when the argument earns one; a clean cut may be correct.

5. **Recurring motifs** — visual threads across scenes from the brand palette.

6. **Negative prompt** — what to avoid, informed by the design spec's constraints if present.

## Output

Write the expanded prompt to `.hyperframes/expanded-prompt.md` in the project directory. Do NOT dump it into the chat — it will be hundreds of lines.

Tell the user:

> "I've expanded your prompt into a full production breakdown. Review it here: `.hyperframes/expanded-prompt.md`
>
> It has [N] scenes across [duration] seconds with specific visual elements, transitions, and pacing. Edit anything you want, then let me know when you're ready to proceed."

Only move to construction after the user approves or says to continue.
