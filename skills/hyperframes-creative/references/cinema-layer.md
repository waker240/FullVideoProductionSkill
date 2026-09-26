# Cinema Layer — vocabularies

The **post-compositional** layer: the camera and lens observing the assembled Canvas + Artifact frame. It owns transitions, post-fx, 3D/spatial moves, atmosphere, and hand-drawn organics. It operates on the *assembled* frame; it never repaints the layers beneath.

Read this after [`cinematic-direction.md`](./cinematic-direction.md) (the doctrine) when you're choosing the *treatment* of a specific shot or picking the video's signature move. Every implementation hint here is HyperFrames-native — HTML/CSS/SVG filters/GSAP on the single paused `tl`, with Three.js/WebGL where real 3D earns it (see `hyperframes-animation/adapters/three.md`).

**Two gates before reaching in here:**
- **Cinema-Layer complementarity test:** *if I remove this effect, does the frame lose **information** or **signature**? If neither, cut.*
- **The Differentiation Principle:** you get **one signature move per video**. Reach into these vocabularies to find *that one*, then stop. Browsing all of them per shot is the overload anti-pattern — it produces fussy, incoherent frames.

**Seek-safety (non-negotiable).** Every effect here rides the paused GSAP timeline (`window.__timelines[...]`). No bare `gsap.to()`, no CSS `animation` loops with `repeat:-1`, no wall-clock time. Animate SVG-filter attributes and CSS vars *through GSAP tweens on `tl`* so they scrub deterministically. (See `motion-principles.md` → Load-Bearing GSAP Rules.)

---

## Transition Vocabulary (11 charged transitions)

Neutral cuts (dissolve / push / cover / blur — see `hyperframes-animation/transitions/`) cover ~70% of cuts. Charged transitions are tied to a specific argument beat; each gets one or two uses per video.

Format: visual character → when to use → HyperFrames implementation hint.

| Transition | Visual character | When to use | Implementation hint |
|---|---|---|---|
| **Wipe (linear/diagonal/radial)** | Hard edge sweeps across, revealing next shot | Sequential reveal; argument adds a step | Tween `clip-path: inset()` (or a moving SVG `<mask>` rect) on `tl`; 45° rotated mask for diagonal |
| **Iris in/out** | Circular aperture closes to / opens from a point | Ceremony — focus narrowing to one artifact | Tween `clip-path: circle(Npx at cx cy)` 0→100% |
| **Whip-pan** | Sudden horizontal motion-blur sweep (~6–10 frames) | Sudden topic jump, "meanwhile…" | `x: ±100vw` + `filter: blur(20px)` on exit, mirrored on entry |
| **Glitch / RGB-split** | Brief slice displacement + chromatic spike | System failure, prediction-error rupture, AI discontinuity ONLY | SVG `feColorMatrix` channel offsets + `feDisplacementMap` flicker over 4–8 frames, driven by GSAP on the filter attrs |
| **Ink-bleed / brush-wipe** | Organic black ink spreads along a brush mask | Hand-authored register transition | SVG `<mask>` with a brush-PNG atlas; tween mask scale/translate |
| **Paper-rip / tear** | Frame edge tears along an irregular path | Archive-register entry — "the document opens" | SVG path mask with jagged edge + slight rotation as it peels |
| **Shutter / blink** | Brief frame-wide black flash (8–14 frames) | Punctuation, breath, scene reset — softer than a section breath | Full-frame black div, tween opacity 0→1→0 |
| **Light-flash** | Bright warm/white flash overwhelms then settles | Revelation — *the* thesis lands | `radial-gradient` overlay, tween opacity; optional bloom + chromatic shift |
| **Particle-dissipate** | Exiting elements break into drifting particles | System disintegration, fade into ambient | Canvas/WebGL particles inheriting exiting element positions, drifting on `tl` |
| **Dolly-zoom (Vertigo)** | Background scales while foreground holds | Perceptual rupture — "you thought X; it's Y" | Two layers, opposing scale tweens (fg 1.0→1.0, bg 1.0→1.4); or a true Three.js dolly-zoom |
| **Cross-zoom** | Outgoing scales up + fades; incoming scales up from small + fades in | Between-act bridges carrying momentum | Layer A `scale 1→1.4` opacity `1→0`; Layer B `scale 0.7→1` opacity `0→1` |

**Default rule:** if you can't justify a charged transition, use a neutral one. **Pairs with cut-timing** (`cinematic-direction.md` → Cut-timing): timing tells you *when* to cut, this tells you *how* — "L-cut + ink-bleed", "hard cut + glitch". For *which relationship* a cut expresses (moment / action / subject / scene / aspect) and the **Rule of Six** cut-decision test, see [`visual-storytelling.md`](./visual-storytelling.md) → Layer 5 + the six panel transitions.

Full-frame black/light flashes are isolated punctuation, never a repeated rhythm. In rapid passages, prefer cuts, motion, masks, palette changes, and sound hits; inspect any luminance spike at final fps under [`fast-paced-editing.md`](./fast-paced-editing.md)'s motion-review rules.

---

## Atmosphere Vocabulary

Where primitives compose the *foreground argument*, atmosphere composes the *background world* — spatial/textural/lighting cues processed pre-consciously. Every one obeys the semantic palette (`system`/`tension`/`insight`/`text`/`background` or a neutral within ~5% of background); saturated atmospheric color destroys the encoding.

| Effect | Visual character | When to use | Implementation hint |
|---|---|---|---|
| **Gradient mesh** | Overlapping low-opacity radial gradients, organic color zones | Establishing an act; mood without naming it | 3–5 SVG `<radialGradient>` layers in palette colors, 8–15% each, deliberately offset. (Avoid full-screen *linear* gradients on dark — they band under H.264; radial is safe.) |
| **Film grain** | Animated noise at 4–10% opacity | Register marker; rises on tension beats | SVG `<feTurbulence>` with GSAP-tweened `baseFrequency` + multiply blend |
| **Geometric pattern overlay** | Faint repeating motif (dot grid / hatch / halftone) at 3–8% | Era/register encoding across the video | SVG `<pattern>` tiled across the frame, multiply blend |
| **Volumetric light shaft / god-ray** | Soft directional gradient(s) from an off-screen source | Focal direction, "the spotlight" | Long thin `<linearGradient>` rect, rotated, blurred, 12–20% |
| **Decorative frame border** | Persistent register-signalling border | When an Artifact takes the full frame | Per-register SVG/PNG border wrapping the artifact slot |
| **Vignette dynamics** | Corner darkening *breathes* — tightens on tension, opens on insight | Mood shifts below conscious attention | Tween a radial-vignette overlay's outer-stop opacity over 30–60 frame windows |
| **Paper-grain overlay** | Subtle warm paper texture at 3–6% | When the camera "is reading" an Artifact | Tinted `<feTurbulence>`, multiply blend, optional slow drift |

**Intensity scale:** Ambient (~5–10%, felt not seen) · Charged (~15–25%, carries weight) · Peak (~35–50%, one or two moments per video — the effect IS the argument).

---

## 3D / Spatial Move Vocabulary

**In HyperFrames, 3D is available—not automatically deserved.** Use CSS-3D or Three.js only when perspective, occlusion, volume, topology, or a camera reveal carries information that a stronger 2D/2.5D treatment cannot. Before choosing true 3D, pass `hyperframes-animation/adapters/three.md`'s visual admission gate.

The paused frame must already look authored. A recognizable subject assembled from default primitives, a detailed generated plate paired with crude tubes/slabs, or a hero floating in an empty WebGL void fails even if the camera move is smooth. Use semantic abstract geometry, an authored model, or a generated cutout plane; design the surrounding world, materials, light, and camera to the same standard as the hero.

| Move | Visual character | When to use | Implementation hint |
|---|---|---|---|
| **Perspective wrapper** | A single element sits in 3D space, tilted off the picture plane | Any artifact that should read as a *physical object* | `transform: perspective(2000px) rotateX/Y(Nº)` on a wrapper div (`transform-style: preserve-3d`); tween via GSAP |
| **Depth parallax** | 2–4 layers at different Z drift at different rates | Establishing shots, world-building | CSS: tween each layer's `x` at a depth rate on `tl`. True 3D: textured planes at different `z` in Three.js, move the camera, seek via `hf-seek` |
| **Card flip** | Element rotates 180° on Y, revealing its back | Register transition — placeholder flips to reveal a plate | `rotateY(180deg)` + `backface-visibility:hidden` on both faces; tween the rotation |
| **Page turn** | Flat element peels off along a curved path | Sequential era-by-era reveal | SVG `<mask>` with animated curve + perspective wrap on the peeling layer |
| **Tilt-on-beat** | Small (3–8°) rotation snaps in on a stressed word, settles over 20–40 frames | Word-locked emphasis without disrupting reading | GSAP tween on `rotateY/X` positioned at the word's time on `tl` |
| **Dolly push** | Whole canvas scales up smoothly (1.0→1.06 over 60–120 frames) | Slow intensification across a shot | `scale` tween on a wrapper; or a real Three.js camera dolly |
| **Truck (lateral)** | Whole canvas translates horizontally | "Scanning across the world"; extends the continuous thread | `translateX` ramp; pair with parallax for depth |
| **Pedestal (vertical)** | Whole canvas translates vertically | Reveal above/below | `translateY` ramp |
| **Crane** | Truck + pedestal + slight rotation/scale | Major section moves — "the camera arrives" | Compose the above, ~90–150 frames; or a Three.js camera path |

**Anti-pattern:** treating true 3D as a sophistication badge. If the still reads like a renderer demo, step down to coherent 2D/2.5D. **Canonical lightweight combo (lock as a signature):** dolly-push + tilt-on-beat + perspective wrapper = the "Artifact Ceremony."

---

## Hand-Drawn / Organic Vocabulary

The deterministic SVG canvas can feel sterile after minutes. Hand-drawn marks break determinism at *specific* moments without breaking the trust the canvas earns.

| Element | Visual character | When to use | Implementation hint |
|---|---|---|---|
| **rough.js highlight / underline / circle** | Hand-drawn marker stroke around/under a word | Word-locked emphasis on argument-bearing text | rough.js drawing into an SVG overlay; reveal the stroke via `stroke-dashoffset` tween on `tl` |
| **Brush-stroke reveal mask** | Organic brush mask reveals an element instead of a clean fade | Plate entrances, ceremony beats needing texture | SVG `<mask>` with a brush-PNG atlas; tween mask `transform` |
| **Ink-wash overlay** | Single-color (warm grey/amber) ink-wash tint layer | "We're inside an archive" beats | PNG ink-wash at 8–15%, multiply blend |
| **Charcoal / sketch mode** | Element re-rendered with rough edges + cross-hatch fill | "This is the wrong/draft version" — contrast to the formal one | rough.js outlines + SVG hatch `<pattern>` fills |

**Discipline (load-bearing):** hand-drawn **never** decorates a Canvas-Layer primitive (a node never gets a brush border; a connection never wobbles). It lives on Artifact-Layer documents, full-frame transitions (ink-bleed, brush-wipe), and negation-then-reveal "wrong answer" content. The Canvas stays deterministic so the *argument* stays trustworthy; the Cinema Layer stays organic so the *frame* stays human. Crossing the streams collapses both.

---

## Lens Personality System

CSS `perspective` distance (and, in true 3D, the camera FOV) is a *first-class signature axis*, not just a parameter. Pick **one default lens** for the channel and earn each deviation.

| Lens | Perspective / FOV | Distortion | Personality | When to use |
|---|---|---|---|---|
| **Wide-21mm** | `perspective: 1400px` | Subtle edge barrel (`feDisplacementMap` scale 4–6 on an edge mask) | Epic, panoramic | Establishing shots, maps, scale reveals |
| **Normal-50mm** | `perspective: 2400px` | None | Documentary, neutral — the default | The 70% case; argument-bearing shots where the lens is invisible |
| **Portrait-85mm** | `perspective: 4000px` | Compressed depth (parallax reads flatter) | Intimate, focused | Artifact close-ups, single-element thesis beats |
| **Fisheye-8mm** | `perspective: 700px` | Strong barrel (`feDisplacementMap` scale 12–18 full-frame) | Disorienting, ruptured | AI-era discontinuity, prediction-error ruptures — ONE moment/video max |
| **Anamorphic** | `perspective: 2000px` | Horizontal scale 1.05 + vertical squeeze 0.97 + flare bias | Cinematic, hero | Thesis landings, signature beats, title/end cards |

**Pairings** (each a complete sentence in lens grammar): Wide-21mm + light-leak + crane = epic establishing · Portrait-85mm + halation + dolly-push = artifact ceremony · Fisheye-8mm + glitch + chromatic aberration = the rupture frame · Anamorphic + light-flash + horizontal flare = thesis land.

**Discipline:** one lens deviation per shot max (mid-shot lens changes = nausea, not signature); Fisheye and Anamorphic are *charged* — earn each use; lock lens character at the scene wrapper, not per-element; the default lens is the channel's voice — don't drift it without a reason.

---

## Post-FX cookbook (SVG filters + WebGL)

All of these are HyperFrames-native. SVG filters cover most; for film-grade grain/aberration/bloom over live content, capture the DOM as a texture and run a GLSL pass (`hyperframes-animation/adapters/html-in-canvas-patterns.md`, `adapters/typegpu.md`).

- **Film grain** — `<feTurbulence type="fractalNoise">` + `feColorMatrix` to desaturate, composited at 4–10% multiply. Tween `baseFrequency`/`seed` on `tl` for animation.
- **Chromatic aberration** — offset R/B channels via `feOffset` on separated channels recombined with `feBlend`, or a GLSL sample-offset pass. Spike it 2–4px on rupture beats only.
- **Halation / bloom** — `feGaussianBlur` the bright regions + `feMerge` back over the source; warm-tint the blurred copy. Peak on the thesis-land flash.
- **Light leak** — an animated warm `radial-gradient`/`linearGradient` overlay in `screen` blend, drifting across the frame.
- **Color-grade LUT** — `feColorMatrix` for a global tone shift (cool→warm), or a GLSL LUT texture lookup for precise grades. Drive the shift across the video (see Video-Arc Drift).
- **Dynamic vignette** — a radial overlay whose outer stop opacity is tweened; tighten on tension, open on insight.

Discipline: post-fx is signature, not wallpaper—vary it only when tied to register, argument beat, or an explicit semantic color arc. Identical grain on every shot is decoration; particles are never required.

---

## Environmental / Diegetic UI

UI that lives *inside* the world, not floating over it as HUD — read as world-furniture, costing almost nothing of the conscious ~50 bits/sec channel.

- **Terrain-painted progress** — a progress cue drawn into the ambient terrain silhouette (color/amplitude shift encoding runtime), not a bar in the corner.
- **Object-attached labels** — a moving plate carries its label *with it* (label follows the object's tween, not a fixed slot). Static-label-on-moving-object reads as broken.
- **In-world timestamps** — era/year markers as engraved marks on the timeline vector itself, not floating corner text.
- **Diegetic decision paths** — at a bifurcation, decision paths render as visible terrain branches; narration *names* the choice the geometry already showed.
- **Embedded measurement** — scale bars / axis ticks integrated into canvas geometry, not overlaid chart-chrome.

**Why (substrate doctrine):** floating HUD competes for the conscious bandwidth argument + narration need; diegetic UI is parsed by the pre-conscious spatial channel (~free) and trusted as *world*. **Discipline:** diegetic UI is the *default*, HUD must be justified; it must move *with* its element (2-frame lag reads as a bug); it must obey project palette + typography.

---

## Meta-Canvas / Brechtian Vocabulary

The canvas acknowledging itself — visible construction, scaffolding, labelling. High-leverage for *pedagogy/method* beats; **toxic during argument-landing beats** (the viewer must trust the canvas as world). Use surgically — max one Brechtian beat per act.

- **Visible grid reveal** — the composition grid animates in for 30–60 frames then dims, marking a structural beat.
- **Visible construction** — a diagram builds with scaffolding (anchor points, measurement lines) visible during the build, fading after.
- **Brechtian label** — a stage-direction label points at an element, then dissolves as the element acquires its real treatment.
- **Margin note** — editorial commentary in the frame margin (author voice as a second channel).
- **Index shot** — a single establishing shot that is a *menu* of the next N shots, numbered (only callback shots that have actually played).

Brechtian text must use a clearly different type register (mono if the canvas is sans; smaller; lower opacity) and *annotate*, never replace, canvas content.

---

## Recursive / Self-Referential Shots

Shots that contain or reference themselves. Among cinema's highest-leverage moves and almost absent from explainer video. Signature-grade — budget each at the channel level.

- **Picture-in-picture callback** — a small dimmed inset (15–22% frame height, corner-anchored) showing the *exact frame* that introduced the current concept ("as established in [shot 14]"). Replaces verbal "remember when…" with visual proof. Max 1/video.
- **Chapter re-open** — an act-opening establishing shot revisited at act-close, same camera, but with evolved canvas state inside.
- **Match-dissolve across scales** — a hexagon at macro scale dissolves to a hexagon at micro scale; shape persists, scale moves orders of magnitude. The dissolve IS the argument that the same structure operates at every scale.
- **Video-within-video** — a screenshot of the current video playing inside itself. So intrusive that overuse destroys the channel — max 1/series.
- **Droste frame** — recursive inset containing the frame containing the frame. Once/series. Maybe once ever.

Plot the recursion budget on the Director's Sheet ("1/video PiP callback, 1/series video-within-video, 1/series Droste"). Correct use makes the channel feel constructed by a mind, not a pipeline; overuse makes it a vanity tic.

---

## Video-Arc Drift

Cinema-Layer parameters that change *continuously across the whole video*, not per-shot. The viewer doesn't consciously notice, but the mood arc is embedded in the physics of the frame — the cheapest cohesion mechanism in the system (zero per-shot cost).

| Drift axis | What changes | What it encodes |
|---|---|---|
| **Grain hue drift** | Grain hue neutral-grey → warm-amber across the video | Era accumulating; "we've travelled far" |
| **Vignette intensity drift** | Vignette baseline rises in tension acts, releases at resolution | Subliminal stakes — the frame tightens as the argument tightens |
| **Grade temperature arc** | LUT interpolates cool → neutral → warm across acts | Cool starts feel investigative; warm endings feel resolved |
| **Particle density drift** | Ambient particle count varies slowly (22 → 38 → 18) | World fills as complications mount, empties as the thesis lands |
| **Lens drift** | Lens personality drifts Wide-21mm (early) → Portrait-85mm (late) | The camera grows closer as the argument grows personal |

**Implementation:** one composition-root value `videoProgress = currentShot / totalShots`, and each drift is `lerp(videoProgress, start, end)` read by the relevant effect. Since the whole timeline is seekable, compute drift from the playhead's normalized position so it scrubs correctly.

**Discipline:** one or two drift axes per video max (drifting all five is exhausting); drift direction must match argument direction; drift completes by the second-to-last shot (the final shot holds its drifted state); drift is invisible to per-shot review — it only reads in full playback.

---

## Channel-Level Contracts (lock early, treat drift as a bug)

- **The Differentiation Principle** — every video carries **one signature move** the viewer remembers, usually a Cinema-Layer choice. Ask before shotlisting: *"if a viewer screen-records 5s and shows a friend, what one move do they talk about?"* If you can't answer in a sentence, the video has no Cinema-Layer thesis yet. Pick the signature first; the rest orbit it.
- **The Director's Sheet** — lock, per channel: default lens · signature transition(s) · grain/atmosphere register · palette · recursion budget · the one signature move's evolution across episodes. Unjustified deviation across a series is a bug.
- **Negative Cinema** — the thesis-land beat is often best served by stripping the Cinema Layer to *zero* (the emptiest frame), not piling on. Don't forget to negate.

## See also

- [`cinematic-direction.md`](./cinematic-direction.md) — the doctrine this vocabulary serves (Spine, Effort Protocol, three-layer architecture, diagnostics).
- `hyperframes-animation/transitions/` — the neutral transition catalog + the CSS-driven transition contract.
- `hyperframes-animation/adapters/three.md` · `adapters/html-in-canvas-patterns.md` · `adapters/typegpu.md` — real 3D, DOM-as-texture, and GPU post-fx.
- `motion-principles.md` — Load-Bearing GSAP Rules (seek-safety; every effect here obeys them).
