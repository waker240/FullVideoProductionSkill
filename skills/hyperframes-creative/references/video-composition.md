# Video Composition

Video frames are not web pages. These rules apply to every composition regardless of brand, style, or design spec.

## The Design Spec Is Brand, Not Layout

The design spec (`frame.md` or `design.md`) defines what the brand looks like: colors, fonts, personality, constraints. It does NOT define how to compose a video frame. Use brand colors at video-appropriate intensity — not at web-UI opacity.

**Strict from the current design spec:** role-bound color values, font families, weight relationships and actual user constraints. Honor an explicitly fixed light/dark canvas; a general preference is not an all-scene prohibition. Apply later approved scene variants and direction changes to the active spec before verifying, rather than reverting them to an obsolete palette. See [reference-led-direction.md](reference-led-direction.md).

**Adapt for video:** type sizes, spacing, decorative opacity, border weight, component treatments. A web UI card at `border: 1px solid #e2e3e6` with `box-shadow: 0 2px 4px rgba(0,0,0,0.06)` is invisible on video. The brand color is sacred; the application is yours.

## Density

Design a **density curve**, not an element quota. A dense proof beat may need 8–10 independently meaningful elements; a thesis landing may need one. Alternating density is what gives both states force.

For a Spatial Canvas, the complete world may be dense while each visited viewport still has one focal hierarchy. Judge density, effective text/stroke size, safe margins, and caption clearance at every authored camera pose—not against the offscreen world at overview scale.

- **Dense beats:** establish background context, the causal mechanism, and foreground evidence/readouts.
- **Sparse beats:** keep only the dominant idea and enough substrate to make the restraint feel intentional.
- **Negative cinema:** flat black, paper-white, or near-empty space is valid when absence is the argument.
- **Produced detail must earn its slot:** it carries information, recurring signature, or state the viewer would otherwise remember. Never add marks merely to hit a count.

If a scene feels empty, first ask whether its mechanism, scale, or substrate is underdeveloped. Decorative filler does not repair a weak idea.

## Color Presence

Muted is fine. Flat is not. Every scene should have at least one color that pulls the eye.

- Brand accent should be VISIBLE — not a 5% opacity glow lost in compression. 15-25% for atmospheric, full saturation for focal elements.
- **Light canvases work differently than dark.** On dark: accent glows pop naturally. On light: use readable borders, structural marks and stronger accent hits. Texture can establish material when the scene needs it; a clean comparison can remain clean. Preserve the selected register and readable figure-ground.
- **No full-screen linear gradients on dark backgrounds.** They band visibly under H.264 compression. Use a radial gradient, a solid fill, or solid + localized glow instead.
- Tint neutrals toward the brand hue. Dead gray reads as undesigned.

## Scale

Web sizes are invisible on video. Everything scales up.

| Element            | Web     | Video    |
| ------------------ | ------- | -------- |
| Headlines          | 32-48px | 64-120px |
| Body text          | 14-16px | 28-42px  |
| Labels             | 12px    | 18-24px  |
| Decorative opacity | 3-8%    | 12-25%   |
| Borders            | 1px     | 2-4px    |
| Padding            | 16-32px | 60-140px |

If you're writing a font-size under 24px in a video composition, justify it. If you're writing decorative opacity under 10%, it's invisible.

## Motion Intensity

Subtle motion can disappear after compression, but **more motion is not the cure**. Give every moving layer a semantic job: reveal state, transfer force, guide the eye, encode depth, or hand velocity into the next shot.

- Do not make every decorative element breathe, drift, pulse, or orbit. Idle loops flatten hierarchy and expose weak assets.
- Use one dominant movement current per beat, with secondary rates only when they encode a different layer or force.
- Vary timing, spacing, and physical verbs across scenes. If everything enters from `y:30, opacity:0`, the piece has no choreography.
- A sparse hold can perform through a state change, purposeful camera move, accumulating consequence or a readable conclusion under the narration. If narration owns the explanation, restrained visual guidance is enough; do not add motion merely to satisfy a motion count.

## Representation and World Coherence

Literal fidelity is not automatically sophisticated. A designed triangle versus circle can express threat versus safety better than a malformed 3D hawk and dove.

- Prefer semantic 2D geometry when shape and motion carry the argument.
- Prefer a generated 2D cutout or tactile plate when a recognizable subject needs illustration quality.
- Use 2.5D when parallax, occlusion, or a board lift adds useful depth.
- Use true 3D only when spatial causality is indispensable and the hero, materials, lighting, camera, and surrounding world can all meet the same quality bar.

A detailed plate combined with default cylinders, tubes, slabs, or an empty WebGL void is a register mismatch. Step down to a coherent 2D/2.5D treatment before shipping a renderer demo.

## Frame Composition

- **One dominant focal point per beat.** Secondary evidence may create an eye path, but it must never compete with the current meaning.
- **Use scale intentionally.** Large hero text can occupy 60–80% of frame width, but no fixed occupancy is required for a comparison, readable hold or narrative scene.
- **Choose meaningful alignment.** Shared comparison anchors, a centered thesis, or an edge-led eye path can all work. Avoid accidental floating caused by undeveloped composition.
- **Split frames.** Data panel left, content right. Top bar with metadata, full-width below. Zone-based layouts over centered stacks.
- **Structural elements.** Rules, dividers, border panels. They create visual paths and animate well (`scaleX: 0` → `1`).
- **Audit the whole trajectory.** Establish, midpoint, and resolve frames must each have a clear hierarchy; a good hero frame does not excuse an empty opening or dead late hold.
