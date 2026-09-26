# House Style

Creative direction for compositions when no design spec (`frame.md` or `design.md`) is provided. These are starting points — override anything that doesn't serve the content. When a design spec exists, its brand values take precedence; house-style fills gaps.

## Before Writing HTML

1. **Interpret the prompt.** Generate real content. A recipe lists real ingredients. A HUD has real readouts.
2. **Pick a palette.** Light or dark? Declare bg, fg, accent before writing code.
3. **Pick typefaces.** Run the font discovery script in [typography.md](./typography.md) — or pick a font you already know that fits the theme. The script broadens your options; it's not the only source.

## Lazy Defaults to Question

These patterns are AI design tells — the first thing every LLM reaches for. If you're about to use one, pause and ask: is this a deliberate choice for THIS content, or am I defaulting?

- Gradient text (`background-clip: text` + gradient)
- Left-edge accent stripes on cards/callouts
- Cyan-on-dark / purple-to-blue gradients / neon accents
- Pure `#000` or `#fff` (tint toward your accent hue instead)
- Identical card grids (same-size cards repeated)
- Everything centered with equal weight (lead the eye somewhere)
- Banned fonts (see [typography.md](./typography.md) for full list)

If the content genuinely calls for one of these — centered layout for a solemn closing, cards for a real product UI mockup, a banned font because it's the perfect thematic match — use it. The goal is intentionality, not avoidance.

## Color

- Choose light/dark from the content and reference; category associations are starting points, not a requirement.
- Define a small role-bound palette. A single background/accent is a useful fast default; a directed film may use approved dark/light or representation-specific variants while preserving semantic color roles. Do not mistake a theme preference for a ban the user did not state.
- Tint neutrals toward your accent (even subtle warmth/coolness beats dead gray).
- **Contrast:** enforced by `hyperframes validate` (WCAG AA). Text must be readable with decoratives removed.
- Declare palette up front. Don't invent colors per-element.

## Background Layer

Build intentional figure-ground. A background may be materially rich, quietly structured, or deliberately empty; blankness is valid when absence, clarity, or a thesis landing is the point.

Possible substrate layers, used only when they support the beat:

- Radial light that directs focus or encodes a state change
- Ghost evidence or prior-scene geometry that preserves context
- Accent lines that define a path, boundary, or measurement
- Grain/noise overlay, geometric shapes, grid patterns
- Thematic architecture that makes the world specific

Do not impose a decorative count or animate substrate merely to prove the frame is alive. Motion must reveal state, encode depth/force, guide the eye, or carry velocity across a cut. If the world still feels thin, improve its material grammar or causal mechanism before adding filler.

## Motion

See [motion-principles.md](./motion-principles.md) for full rules. Quick: 0.3–0.6s, choose eases by intent, combine transforms on entrances, overlap entries.

## Typography

See [typography.md](./typography.md) for full rules. Quick: 700-900 headlines / 300-400 body, serif + sans (not two sans), 60px+ headlines / 20px+ body.

## Palettes

Declare one background, one foreground, one accent before writing HTML.

| Category          | Use for                                       | File                                                       |
| ----------------- | --------------------------------------------- | ---------------------------------------------------------- |
| Bold / Energetic  | Product launches, social media, announcements | [bold-energetic.md](../palettes/bold-energetic.md)   |
| Warm / Editorial  | Storytelling, documentaries, case studies     | [warm-editorial.md](../palettes/warm-editorial.md)   |
| Dark / Premium    | Tech, finance, luxury, cinematic              | [dark-premium.md](../palettes/dark-premium.md)       |
| Clean / Corporate | Explainers, tutorials, presentations          | [clean-corporate.md](../palettes/clean-corporate.md) |
| Nature / Earth    | Sustainability, outdoor, organic              | [nature-earth.md](../palettes/nature-earth.md)       |
| Neon / Electric   | Gaming, tech, nightlife                       | [neon-electric.md](../palettes/neon-electric.md)     |
| Pastel / Soft     | Fashion, beauty, lifestyle, wellness          | [pastel-soft.md](../palettes/pastel-soft.md)         |
| Jewel / Rich      | Luxury, events, sophisticated                 | [jewel-rich.md](../palettes/jewel-rich.md)           |
| Monochrome        | Dramatic, typography-focused                  | [monochrome.md](../palettes/monochrome.md)           |

Or derive from OKLCH — pick a hue, build bg/fg/accent at different lightnesses, tint everything toward that hue.
