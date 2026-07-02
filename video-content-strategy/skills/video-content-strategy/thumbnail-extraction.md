# Thumbnails for YouTube A/B Testing

## Design Principles (Hard-Won)

A thumbnail is a **single-frame filter** competing against 20 others for ~50 bits/sec of conscious bandwidth at ~320x180 effective pixels. Every design choice must pass through this constraint.

### Text IS the Thumbnail

Text covers **50%+ of the frame**. Not a label on the image — the text IS the primary visual element. The background visual is atmosphere, not content.

- **2 lines maximum.** One hero phrase, one supporting line. If you need 3+ lines, the copy is wrong — simplify.
- **Hero text: 450-600px** at 2560x1440 canvas. It must be readable when the thumbnail is 320px wide (that's ~55-75px effective — the minimum for instant recognition).
- **Supporting text: 100-130px** at 2560x1440. Readable but secondary.
- **Weight contrast creates hierarchy**, not size alone. Hero at 900 weight, support at 500-600.

### The Glow Trap

The single most common failure mode. Each iteration adds more `text-shadow` layers trying to make text "pop" until the result looks like a mobile game ad.

**What NOT to do:**
```css
/* This looks cheap — radioactive neon bloom */
textShadow: "0 0 60px cyan, 0 0 120px cyan, 0 0 200px cyan80"
```

**What to do:**
```css
/* Dark drop shadow for legibility only. The COLOR does the work. */
textShadow: "0 4px 20px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.95), 0 0 60px #0A0E14"
```

The semantic colors (insight cyan `#3EC9A7`, tension amber `#E8913A`) already pop against the dark background (`#0A0E14`). Adding color glow on top makes it garish. Let the color contrast do the work.

### Visuals as Atmosphere, Not Content

Background visuals (nodes, connections, arrows) serve ONE purpose: they signal "this video has structured visual content" and create depth. They must NOT compete with the text.

**Opacity calibration** (validated through iteration):
- **Too dim (< 20%)**: Visuals disappear. Thumbnail looks like text on black. Cheap in the "bland" direction.
- **Too bright (> 60%)**: Visuals compete with text. Busy and cluttered.
- **Sweet spot (35-55%)**: Visuals are clearly present, create atmosphere and depth, but text reads cleanly over them.

**One ambient gradient** behind the text area creates depth without glow effects. A soft radial gradient from the accent color at 12-18% opacity, centered behind the text:
```tsx
<radialGradient id="spot" cx="50%" cy="45%" r="55%">
  <stop offset="0%" stopColor={accentColor} stopOpacity="0.14" />
  <stop offset="70%" stopColor={accentColor} stopOpacity="0.02" />
  <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
</radialGradient>
```
This creates a subtle "lit space" where the text sits — not a glow, but a sense that the text exists in the scene rather than being pasted on top.

### Motion Encoding in Static Frames

Since animation is unavailable, encode "structured energy" through:
- **Motion trails**: 3-4 copies of each moving element, offset in the direction of travel, each at decreasing opacity (0.1 → 0.025). This is cheaper and more controlled than SVG blur filters.
- **Speed lines**: Thin lines (1-2px, 6-12% opacity) in the direction of movement scattered across the background. Encodes directional energy subconsciously.
- **Directional alignment**: Elements arranged along a clear visual axis. The viewer's eye follows the direction, creating implied motion.

### The Cheap Spectrum

Thumbnails can look cheap in TWO opposite directions:

| Too Much | Sweet Spot | Too Little |
|---|---|---|
| Multiple glow layers, neon bloom, WebkitTextStroke, saturated everything | Clean text + dark shadow, visible but non-competing visuals, one subtle ambient gradient | Flat text on black, ghosted visuals, no depth, no atmosphere |
| Mobile game ad aesthetic | Professional, premium feel | MS Paint aesthetic |
| "I used every CSS effect I know" | "Every element earns its place" | "I was afraid to add anything" |

### Compositional Rules

- **Text centered, visuals behind** — not side-by-side. The text IS the composition; visuals provide texture and context.
- **SVG viewBox at 1280x720**, rendered at 2560x1440. Use `width="100%" height="100%"` on the SVG element so it scales to fill the composition. Font sizes in CSS are relative to the composition size (2560x1440), NOT the SVG viewBox.
- **One color dominates the hero text** — the insight or tension color from your palette. Don't mix hero colors.
- **Supporting text in a contrasting palette color** — if hero is insight (cyan), support line in tension (amber) or text (white). Creates visual distinction between the two lines.
- **Terrain and particles at low opacity** (10-18%) — ambient grounding, same as in the video. Just enough to avoid pure void.

## Technical Implementation

### Composition Registration

```tsx
// In Root.tsx — single frame, 2x YouTube resolution
<Composition id="Thumb-Filter" component={ThumbFilter}
  durationInFrames={1} fps={1} width={2560} height={1440} />
```

`durationInFrames={1}` and `fps={1}` — it's a still, not video. 2560x1440 is 2x YouTube's 1280x720 for retina sharpness.

### Rendering

```bash
npx remotion still Thumb-Filter "out/thumbnails/thumb-filter.png"
```

Uses `remotion still` (not `render`). Output is PNG at the composition resolution.

### Architecture

One `Thumbnails.tsx` file exports all thumbnail components. Each is standalone — no dependencies on act shot code. Shares only `theme.ts` (colors, fonts), `LowPoly.tsx` (polyPoints, GlowFilters, terrainPoints).

Structure of each composition:
1. `AbsoluteFill` with background color
2. SVG layer (position: absolute) — visuals: terrain, nodes, connections, motion trails, ambient gradient
3. HTML div layer (position: absolute) — text: hero phrase + supporting line

The SVG and HTML layers are independent. SVG uses viewBox coordinates (1280x720). HTML text uses composition-size pixels (2560x1440). They overlay naturally via AbsoluteFill stacking.

### Text Helper Pattern

```tsx
const txt = (
  size: number, color: string, weight = 800,
  extra: React.CSSProperties = {},
): React.CSSProperties => ({
  fontFamily: FONT.main,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.0,
  letterSpacing: "-0.025em",
  textShadow: `0 4px 20px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.95), 0 0 60px ${COLORS.background}`,
  ...extra,
});
```

Single helper, dark shadow only. Accent color comes from the `color` prop, not from shadow effects.

---

## Fallback: Frame Extraction

When a dedicated composition isn't built yet, extract frames from rendered video as a starting point.

### Setup

```bash
npm install --save-dev @ffmpeg-installer/ffmpeg
```

```js
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
```

### Extract a Frame

```bash
ffmpeg -ss <seconds> -i <video.mp4> -frames:v 1 -q:v 2 <output.jpg> -y
```

`-ss` before `-i` for fast seeking. `-q:v 2` is near-lossless JPEG.

### Timestamp Calculation

1. Read `act*-scenes.md` for shot durations (e.g., "11.8s / ~354 frames")
2. Sum preceding shot durations to get target shot start time
3. Add percentage offset into shot for desired moment (peak density ~60%)
4. Verify with `ffmpeg -i <video.mp4> -hide_banner` for total duration

### Frame Selection by Title Strategy

| Title Mechanism | Best Frame | Why |
|---|---|---|
| **Contrarian reframe** | Scene visualizing the reframe concept | Frame IS the title |
| **Stakes/threat** | Peak alignment or correlated failure | Visual pattern reads as "danger" |
| **Pattern/history** | Dense network or scale progression | Complexity signals depth |
| **Personal hook** | Filter/intermediary with input→output flow | Viewer sees themselves |

**Limitation**: Extracted frames will always be suboptimal for thumbnails — they're designed for temporal processing, not static 320px recognition. Use as reference, then build a dedicated composition.
