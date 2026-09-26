<!-- Public portability adaptation, 2026-09-26. -->

# Vox Light Editorial — style recipe

Light-theme news explainer: clean paper ground, marker type, duotone evidence, real charts. Use when the film should feel like a **Sunday-paper desk**, not a dark terminal.

This is an optional light editorial collage register, not a required visual style. The patterns below are self-contained; supply your own licensed assets.

---

## Spine (hold these)

| Layer | Rule |
| --- | --- |
| Ground | Clean warm cream `#f4f0e6` — **solid fill only**. No full-bleed aged-newsprint PNG, no torn-edge plate, no full-frame color flash |
| Ink | Bone `#1a1a1a` primary · dim `#5c564c` secondary |
| Accents | **Red** = risk/selloff/regulation · **Teal** = systems that work · **Gold** = capital · **Marker yellow `#f4c400`** = title voice only (local bars, never a screen wash) |
| Type | Sans = UI/captions · Serif = landing lines/mastheads · Mono = numbers/tickers/chrome |
| Chrome | Light mute registration (REG / frame / live telem / status) — never dark-void chrome |

**Signature moves (pick 2–4, reuse):** animated highlighter swipe · flat-3D evidence card · duotone cutout + offset rim-light (in DOM) · one real data-viz punch · capital-flow / value-turn.

**Do not mix** this register with dark low-poly/abstract in the same scene.

---

## Palette (lock early)

```
bg        #f4f0e6   paper ground (solid)
panel     #fffdf8   cards / documents
bone      #1a1a1a   primary ink
dim       #5c564c   dek / secondary
ink-red   #c44b3c   risk, selloff, pressure
ink-teal  #1a6b5c   working systems, winners
ink-gold  #b8860b   capital, funding, IPO
marker    #f4c400   highlighter (one operative phrase)
steel     #4a7c9b   duotone shadow tone
mute      #9a9286   chrome
```

Captions on paper: dark ink + **paper-white halo** — never the default dark-theme shadow.

```json
"captionStyle": {
  "color": "#1a1a1a",
  "textShadow": "0 1px 0 #fffdf8, 0 0 0 10px rgba(255,253,248,0.92), 0 2px 18px rgba(244,240,230,0.98)",
  "roles": { "system": "#1a6b5c", "tension": "#c44b3c", "capital": "#b8860b" }
}
```

---

## Ground hygiene (do not skip)

These look like “editorial texture” in theory and **ugly yellow/red paper overlays** in practice. Do not ship them:

| Avoid | Why |
| --- | --- |
| Full-frame flash (`#f4c400` / `#c44b3c` / teal at opacity 0.2–0.5 over the whole stage) | Reads as a dirty color wash, not a hit |
| Full-bleed aged-newsprint / torn-edge substrate PNG | Warm cast + red torn edge dominates every frame |
| Dense canvas grain / colored speckles | Same — dirty paper, not atmosphere |

**Do instead:** solid `#f4f0e6` fill. Optional: very sparse dark-only dots at α ≤ 0.04, or none. Texture lives on **cards and cutouts**, not as a screen filter.

Punctuation on load-bearing hits: **stage shake only** (`x` yoyo, 4–8 repeats, 0.04–0.06s). No full-frame color flash.

---

## The signature beat: card lands → highlighter swipes

This is the move viewers screen-record. **Static yellow boxes are not enough** — the bar must *draw* as the VO says the phrase.

### 1 · Flat-but-3D card land

Paper evidence, not a UI modal. Parent stage gets `perspective`; card **enters** tilted, then **settles fully flat**.

```css
#sN-stage { perspective: 1600px; }
#sN-doc {
  box-sizing: border-box;
  background: #fffdf8;
  box-shadow: 0 40px 80px rgba(26,26,26,0.18), 0 2px 0 rgba(255,255,255,0.8) inset;
  transform-style: preserve-3d;
  /* height must fit content + padding — see Card layout below */
  display: flex;
  flex-direction: column;
  padding: 44px 52px 72px; /* generous bottom padding — last row must clear the border */
}
```

```js
// Own all transforms in GSAP (no CSS transform + GSAP conflict)
tl.fromTo("#sN-doc", {
  opacity: 0, x: -60, y: 40,
  rotateX: 10, rotateY: -6, rotateZ: -2, z: -40
}, {
  opacity: 1, x: 0, y: 0,
  rotateX: 0, rotateY: 0, rotateZ: 0, z: 0,  // MUST settle to 0
  duration: 0.65, ease: "power3.out"
}, tEnter);
```

**Resting tilt is a trap.** Leaving `rotateX`/`rotateZ` at 1–3° foreshortens the card face so the last ledger row **clips through the bottom border**. Entrance may tilt; **at rest all of rotateX/Y/Z = 0**.

### Card layout (overflow)

`border-box` + fixed `height` + padding eats the content box. If the last row touches or crosses the white edge:

1. Prefer `height: auto` with `min-height`, **or** a fixed height tall enough that `height − padding-top − padding-bottom` > content.
2. Bottom padding **≥ 56–72px** (not equal to top).
3. Use `display: flex; flex-direction: column` so rows don’t collapse into the edge.
4. Snapshot the card after the settle (not mid-entrance) and confirm clear air under the last line.

### 2 · Animated highlighter swipe (word-locked)

One operative phrase per swipe — never a full sentence. Bar sits *behind* the text and draws L→R on the syllable from `narration.words.json`.

```html
<span class="hl">
  <span class="hl-bar" id="sN-hl-key"></span>
  <span class="hl-txt">前沿公司</span>
</span>
```

```css
.hl { position: relative; display: inline-block; white-space: nowrap; }
.hl-bar {
  position: absolute; left: -8px; right: -8px; top: 12%; bottom: 8%;
  background: rgba(244,196,0,0.82); /* marker yellow, translucent */
  transform-origin: left center; z-index: 0;
}
.hl-bar.red  { background: rgba(196,75,60,0.35); }  /* risk phrases */
.hl-bar.teal { background: rgba(26,107,92,0.30); }  /* systems / winners */
.hl-txt { position: relative; z-index: 1; }
```

```js
tl.set("#sN-hl-key", { scaleX: 0 }, 0);
// wf(g) = g - SCENE_START  (GLOBAL word time → LOCAL)
tl.fromTo("#sN-hl-key", { scaleX: 0 }, {
  scaleX: 1, duration: 0.38, ease: "power2.out"
}, wf(wordStartSec - 0.08)); // lead the syllable slightly
```

**Timing:** card lands first (~0.4–0.7s), then swipe fires on the VO phrase. If the card and swipe land together, it reads as a static stamp, not a highlight.

**Ledger-row variant:** full-row bar behind a mono line (`CAPITAL INJECT · $2.5B`) when the number is the argument — same `scaleX` recipe, slightly lower alpha (`rgba(244,196,0,0.35)`).

Marker yellow is **local to the phrase bar only**. Never a full-stage overlay.

---

## Scale floors (anti-"elegant slides")

Mid-size cards floating in cream = the failure mode. Push size and break the frame.

| Element | Floor (1920×1080) | Notes |
| --- | --- | --- |
| Open marker type | ≥120–148px | Solid yellow rect, slight rotate, overshoot ease |
| Evidence card | ≥680×520 content, **+ bottom pad** | One hero card, not three tidy equals |
| Duotone cutout | ≥700px tall | `right: -40px` ok — sticker breaks the edge |
| Hero number | ≥100–120px mono | Count-up on the syllable; may sit *outside* the card |
| Chart panel | ≥1200×600 | Path stroke ≥5–6px; crash % ≥100px |
| Landing serif | ≥64–80px | One line that resolves the film |

When a camera push is earned by inspection or intensification, make it legible (**1.08–1.14**, not an imperceptible 1.04). Do not add it to every scene; an internal card/mechanism turn may perform while the frame holds. Cutouts may drift on their own depth rate. Do **not** parallax a full-bleed warm substrate (see Ground hygiene).

---

## Treatments that earn their place

1. **Marker title (open)** — solid yellow rectangle, heavy black sans, slight rotate; ghost theme behind. Slam with `back.out` + optional stage shake (no color flash).
2. **Highlighter swipe (above)** — the channel's title voice. One phrase, word-locked.
3. **Duotone cutout** — steel/bone on magenta → `cutout-bg.cjs`; rim-light in DOM: `filter: drop-shadow(12px 12px 0 #b8860b)` (gold) or `#c44b3c` (risk). Rim-light is a **sticker edge on the subject**, not a screen wash.
4. **Recreated doc** — masthead + serif hed + mono ledger rows; flat-3D land (settle to 0°) + swipe.
5. **Data punch** — D3/SVG path draws on the syllable; red ink for selloffs; shake on the number (no red flash overlay).
6. **Value turn** — red "from" → teal "to", gold particles/arrow as capital in motion.
7. **Stacked evidence cards** — later cards partially cover earlier ones (opacity 0.4–0.55, scale 0.9); not a neat equal row.

One screen-recordable beat per film (usually the data rupture or the rotation turn). Everything else supports it.

---

## Seams & intensity

| Seam | Duration | Use |
| --- | --- | --- |
| Hard punch | 0.08–0.12s + scale enter 1.06–1.10 | Into body, into rupture, into turn |
| Velocity-matched | 0.25–0.35s, both scenes scale through the cut | Bridges that should feel continuous |
| Soft settle | 0.35–0.45s | Into the close |

Intra-scene: **hard wipe** between phases (doc → ROI chips, chart → cause card, split-screen → landing). Fade-everything-softly is the PPT tell.

BGM: restrained editorial pulse, `data-volume` ~0.15–0.18; **duck hard under the rupture** (~0.06) and the close landing.

---

## Scene rhythm (news weekly pattern)

| Beat | Register | Highlighter targets (examples) |
| --- | --- | --- |
| Open | Marker slam, brisk | Whole title is the marker stamp (no swipe needed) |
| Evidence / funding | Flat card + cutout + mono stamp | Company name, $ amount, headcount |
| Policy / tension | Stacked cards, red compliance | IPO, Superapp, regulation phrase |
| Rupture (data) | Chart crash, red ink, hard seam in | The % itself is the punch (shake, not screen flash) |
| Turn | Flow diagram, teal winners | Thesis phrase ("结构轮动"), landing claim |
| Close | Two-column tension → serif landing | Product name, warning label, final thesis |

---

## Prompt spines (retune SUBJECT / TITLE only)

**Ground:** use solid `#f4f0e6` in CSS. Do **not** generate a full-bleed aged newsprint plate as the scene background (torn edges and warm casts read as a dirty overlay). If you need paper texture, keep it on a **card** or a small local element, pale and low-contrast.

**Marker title card (open hero only — not a background):**
```
Vox-style title card on aged newsprint with halftone/scan grain. Big bold
black sans words inside a solid YELLOW highlighter rectangle, slightly
rotated. Words read exactly: "[TITLE]". Faint grey ghosted theme behind.
No photoreal, no watermark, no gibberish. 16:9.
```

**Duotone cutout (then chroma-key):**
```
Vox-style flat TWO-TONE duotone (shadows steel-blue #4a7c9b, highlights
bone #e8e4df), posterized, subtle halftone texture across the fill,
crisp silhouette. SUBJECT — [figure/object], clear silhouette, documentary pose.
SOLID MAGENTA #FF00FF background, generous margin. No full-color photo,
no text, no shadow, no extra colors.
```
→ `node scripts/cutout-bg.cjs assets/cutouts_raw assets/cutouts --tol=70 --feather=30`

**Editorial document:** prefer a **DOM card** + live highlighter swipe (timed to VO). Baked plates with a pre-drawn yellow swipe cannot word-lock.

Rim-light and **highlighter bars animate in code** — do not bake the swipe into the PNG if you need it timed to narration.

---

## Word-lock & audio clock

- Display text is authoritative from `narration.json` `lines`; Whisper is timing only.
- Load-bearing events (swipe, count-up, chart end, color flip) fire at word `startSec` from `assets/words/narration.words.json`, leading by ~0.05–0.12s.
- User-supplied VO: `atempo` → master (−14 LUFS, Δdur ≤0.01s) → align sections → build-subs/captions. Do not invent TTS pacing on top of locked audio.
- Find phrase times by walking the char stream (CJK-safe), not by hoping STT tokens match Latin brand names.

---

## Caveats

- **Light ground is a commitment.** Whole film, or hard-cut evidence beats only. Crossfading dark→light reads as a mistake.
- **No screen washes.** Full-frame yellow/red/teal flashes and warm newsprint plates are banned (Ground hygiene).
- **Settle cards flat.** Resting `rotateX`/`rotateZ` ≠ 0 clips ledger text through the bottom border.
- **One accent phrase per swipe.** Full sentences in marker yellow = slide deck.
- **Unintended empty cream is the enemy.** If a still looks like a print layout with a small card in the corner, scale up or cut; intentional negative cinema may use empty cream when absence is the beat.
- **Inspect false positives:** highlighter bars under text trigger `content_overlap` — intentional; mark `data-layout-allow-overlap` / `data-layout-allow-overflow` on stages that break the frame.
- **Duotone subjects:** public figures/objects only; frame machines/systems as actors when safety filters trip.
- **Density:** 0.5–1.0 on-thesis events/sec. Grain/particles stay low-alpha wallpaper or off.
- **BGM follows the sound plan**: use an auditioned project-local track if selected, with space under rupture and close. If none is available, preserve intentional silence or report the missing input; never wire a nonexistent asset.

---

## Agent checklist (before "done")

- [ ] Ground is solid `#f4f0e6` — no full-bleed newsprint plate, no full-frame color flash
- [ ] ≥1 card land with perspective **entrance**, settle `rotateX/Y/Z = 0`
- [ ] Last ledger row has clear air under it (bottom pad ≥56px; snapshot-checked)
- [ ] ≥3 highlighter swipes word-locked to VO phrases (not static yellow spans; not screen washes)
- [ ] Cutout or plate large enough to break or dominate a half-frame
- [ ] One data or number punch that argues the beat (shake ok; no red flash overlay)
- [ ] Seams vary (hard into rupture; not uniform 0.45s fades)
- [ ] Caption `textShadow` is paper-halo, ink is `#1a1a1a`
- [ ] Any camera move is meaning-bearing and legible; scenes without one still visibly turn state
- [ ] `check.cjs` clean; snapshots read for empty-cream / mid-size cards / clipped card text / color wash
