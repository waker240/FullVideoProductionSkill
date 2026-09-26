<!-- Public portability adaptation, 2026-09-26. -->

# HyperFrames Technique Library

A grab-bag of reusable visual techniques employed across HyperFrames builds
(`marx-ai-capital`, `wittgenstein-act1`, …). This is a **reference, not a
ruleset.** Use it to move fast and stay consistent — but you have full creative
control. Add, remove, rewrite, or ignore anything here. If you invent a
technique worth keeping, append it. If one stops being useful, delete it. The
library serves the work, not the other way around.

For the structural contract every composition obeys (template/timeline/proxy/
determinism rules), see `references/pipeline.md` and the project's own
`SCENE_CONTRACT.md` / `DESIGN.md`. This file is just the toolbox. Free GSAP
plugins (SplitText / MorphSVG / DrawSVG / MotionPath / Physics2D / ScrambleText)
can replace several hand-rolled recipes below — see `references/capability-palette.md`.

## Universal rules these snippets assume

- ONE `gsap.timeline({ paused: true })` per scene at `window.__timelines["<id>"]`,
  built synchronously; a proxy tween drives any canvas/WebGL `render(t)`.
- Determinism: **no `Date.now()`, no unseeded `Math.random()`** (use the
  `mulberry32` seeded PRNG below), no runtime network (CDN `<script>` tags are
  fine), no `repeat:-1` (use finite repeats), never animate
  `display`/`visibility` — only transform/opacity/filter/color/SVG attrs.
- **GSAP-vs-CSS transform trap:** if you animate `x/y/scale/rotation` on an
  element centered with CSS `transform: translateX(-50%)`, GSAP overwrites the
  whole transform and it jumps. Fix: drop the CSS transform, own centering in
  GSAP via `tl.set(el, { xPercent: -50 }, 0)`. (`tl.fromTo` is exempt.) Lint
  flags this as `gsap_css_transform_conflict` — it's an ERROR.
- Prefix every id with the scene (`s3-*`). Snapshot with `node scripts/snap.cjs`
  passing **absolute/GLOBAL playhead seconds on the assembled index.html**
  (`global = scene data-start + local offset`), never per-scene LOCAL time and
  never a bare scene file in isolation — only at a global second is the mount
  wired with its assets loaded, so any other mode renders empty/broken. Then
  actually look — at-rest snapshots show single-frame-peak effects (flashes,
  shakes) mid-resolve; judge those in motion.

```js
// the seeded PRNG every effect below uses — deterministic across renders
function mulberry32(a){return function(){a|=0;a=(a+0x6d2b79f5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
var rand = mulberry32(1234); // pick a per-scene seed
```

> **Anti-wallpaper discipline.** Every technique here is strong *because it's
> used sparingly and on-thesis.* A ghost glyph on every scene, a flash on every
> beat, particles everywhere — that's wallpaper, and it flattens the whole
> piece. Reach for an effect when it *argues the specific beat*, then stop.

---

## 1 — Giant ghost character (background concept glyph)

A single monumental low-opacity glyph pinned to a frame edge, drifting slowly.
Labels the scene's concept pre-verbally and fills empty background depth without
competing with the foreground. Best on abstract scenes whose foreground is a
diagram floating in void. *Skip it on scenes that already have a raster substrate
(e.g. a datacenter plate) — two background layers fight.*

```css
/* opacity: tune to your background. ~0.06 on a dark cool bg (#0a0e14);
   the wittgenstein warm-Vienna bg used 0.045. Bigger = more presence. */
#s7-ghost { position: absolute; left: -70px; top: 50%;
  font-family: "Noto Serif SC", serif; font-weight: 900; font-size: 920px;
  line-height: 1; color: rgba(232,228,223,0.06);
  z-index: 1; user-select: none; pointer-events: none; }
```

```html
<div id="s7-ghost" data-layout-allow-overflow>值</div>  <!-- one concept glyph -->
```

```js
// centering owned by GSAP (NOT CSS) so the drift tween can't clobber it
tl.set("#s7-ghost", { yPercent: -50 }, 0);
tl.fromTo("#s7-ghost", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 3.0, ease: "sine.out" }, 0.2);
tl.to("#s7-ghost", { y: "-=28", duration: 60, ease: "sine.inOut" }, 0); // slow drift over the scene
```

Marx usage: `s3→率`, `s7→值`, `s8→异`. Wittgenstein: `s1→維` (font-size 880).
Pin to whichever edge leaves the foreground clear; alternate sides scene-to-scene.

---

## 2 — Particle fields (2D canvas, seeded)

The act-wide atmosphere motif. A drifting field of dots reading as the scene's
"matter." In the Marx palette the **semantic split carries argument**: crimson
sparks RISE = living labor (warm, scarce, generative); steel dust drifts/falls =
dead labor (cold, inert). Decouple their motion so they read as opposites.

```js
var N = 96, pts = [];
for (var i = 0; i < N; i++) pts.push({
  x: rand()*1920, y: rand()*1080, r: 0.6+rand()*1.6,
  vx:(rand()-0.5)*5, vy:(rand()-0.5)*5,
  live: rand() > 0.66,            // ~1/3 living (crimson), rest dead (steel)
  ph: rand()*6.28, sp: 0.3+rand()*0.7,
});
function render(t){
  ctx.clearRect(0,0,1920,1080);
  for (var i=0;i<N;i++){ var p=pts[i];
    var x = ((p.x + p.vx*t*p.sp) % 1980 + 1980) % 1980 - 30;              // wrap, no clock
    var y = ((p.y + (p.live ? -p.vy-1.4 : p.vy)*t*p.sp) % 1140 + 1140) % 1140 - 30; // live rises
    var tw = 0.3 + 0.55*Math.abs(Math.sin(t*0.5 + p.ph));                 // twinkle
    ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.283);
    ctx.fillStyle = p.live ? "rgba(214,69,63,"+(0.28*tw)+")" : "rgba(74,124,155,"+(0.18*tw)+")";
    ctx.fill();
  }
}
```

Gate intensity off a shared state (`S.drift`, `S.snap`, …) the timeline mutates,
so the field can thin/thicken to match a beat (e.g. choke the sparks at a "value
drains to zero" moment). Drive `render(t)` from the proxy; prime it once at the
end: `var p0=window.__timelines["<id>"]; render(p0?p0.time():0);`.

---

## 3 — Word-cosmos (glyphs that condense into a thing)

A field of meaningful glyphs (not anonymous dots) that drifts as a "commons,"
then **condenses** toward a target as some force acts on it — and recolors to
encode the transformation. Marx s5: all human writing (书/码/艺/闻/语/句/诗/史…)
drifts, then condenses into the dead-labor slab, warm bone → cold steel as it's
"frozen into weights." Performs the line instead of labeling it.

```js
var WG = ["书","码","艺","闻","语","句","诗","史","图","论","词","画","声","记","文","数"];
var WC = 150, words = [];
for (var wi=0; wi<WC; wi++) words.push({
  hx: rand()*1920, hy: rand()*1080,        // home = scattered commons
  ch: WG[(rand()*WG.length)|0],
  sz: 13+rand()*22, ph: rand()*6.28, sp: 0.3+rand()*0.8,
  tx: 360+rand()*220, ty: 360+rand()*210,  // target = where it condenses
});
// in render(t), driven by S.cosmos (0 = scattered, 1 = condensed):
if (S.cosmos > 0.01) {
  ctx.save(); ctx.textAlign="center"; ctx.textBaseline="middle";
  var conv = S.cosmos*S.cosmos;            // ease the convergence
  for (var w, j=0; j<words.length; j++) { w = words[j];
    var hx = w.hx + Math.sin(t*0.3*w.sp+w.ph)*22, hy = w.hy + Math.cos(t*0.26*w.sp+w.ph)*18;
    var x = hx + (w.tx-hx)*conv, y = hy + (w.ty-hy)*conv;
    var rr=Math.round(232+(74-232)*conv), gg=Math.round(228+(124-228)*conv), bb=Math.round(223+(155-223)*conv);
    var a = S.cosmos * (0.16 + 0.5*conv) * (0.5+0.5*Math.abs(Math.sin(t*0.5+w.ph)));
    ctx.font = "700 "+w.sz.toFixed(1)+"px 'Noto Sans SC', sans-serif";
    ctx.fillStyle = "rgba("+rr+","+gg+","+bb+","+a.toFixed(3)+")"; ctx.fillText(w.ch, x, y);
  }
  ctx.restore();
}
```

**3b — Three.js word-dust cosmos (heavy variant).** For a true volumetric cosmos
(wittgenstein s2: 16,000 glyph-textured points in a sealed box, camera pulling
back to reveal it's enclosed = "all of language, sealed"), use `THREE.Points`
with a per-glyph `CanvasTexture`, bucketed by glyph, additive blending,
`depthWrite:false`; drive camera + opacity from the proxy. Only reach for WebGL
when the 2D version genuinely can't sell the volume — it's a determinism/risk
cost, and mixing it into an already-dense scene usually isn't worth it.

---

## 4 — Camcorder / dossier frame (cohesion chrome)

An optional act-wide instrument panel for a story genuinely being observed
through a dossier, terminal, or measuring device. Use it only when `DESIGN.md`
assigns the chrome real state; never invent fake telemetry or copy it into every
scene to manufacture cohesion. If selected, centralize or repeat the same
implementation consistently and let negative-cinema/evidence beats omit it.

```css
.reg   { position:absolute; top:60px; left:80px; font-family:"JetBrains Mono",monospace; font-size:21px; letter-spacing:0.20em; color:#7d8b97; text-transform:uppercase; z-index:8; opacity:0; }
.reg b { color:#4a7c9b; font-weight:700; }
.frule { position:absolute; inset:44px; border:1.5px solid rgba(74,124,155,0.16); pointer-events:none; z-index:7; opacity:0; }
.crook { position:absolute; width:30px; height:30px; border:0 solid rgba(74,124,155,0.5); z-index:8; opacity:0; }
.crook.tl{top:44px;left:44px;border-top-width:2px;border-left-width:2px;}
.crook.tr{top:44px;right:44px;border-top-width:2px;border-right-width:2px;}
.crook.bl{bottom:44px;left:44px;border-bottom-width:2px;border-left-width:2px;}
.crook.br{bottom:44px;right:44px;border-bottom-width:2px;border-right-width:2px;}
.telem { position:absolute; left:80px; bottom:64px; font-family:"JetBrains Mono",monospace; font-size:19px; letter-spacing:0.12em; color:#5f6f7d; z-index:8; opacity:0; font-variant-numeric:tabular-nums; }
.telem b { color:#e8913a; font-weight:700; } .telem .sep { color:#2f3b46; margin:0 12px; }
.coord { position:absolute; bottom:64px; right:82px; font-family:"JetBrains Mono",monospace; font-size:19px; letter-spacing:0.14em; color:#5f6f7d; text-transform:uppercase; z-index:8; opacity:0; }
```

```js
// register in over 0.3–1.2s
tl.fromTo("#s-frule", { opacity:0 }, { opacity:1, duration:1.0, ease:"power2.out" }, 0.3);
tl.fromTo(["#s-ctl","#s-ctr","#s-cbl","#s-cbr"], { opacity:0, scale:0.4 }, { opacity:1, scale:1, duration:0.5, ease:"back.out(2)", stagger:0.06 }, 0.5);
tl.fromTo("#s-reg", { opacity:0, x:-14 }, { opacity:1, x:0, duration:0.7, ease:"power2.out" }, 0.7);
tl.fromTo("#s-coord", { opacity:0 }, { opacity:1, duration:0.6 }, 1.0);
```

- **`.reg`** (top-left): `REG · §<n> ／ <SCENE LABEL>` — the section tag.
- **`.telem`** (bottom-left): a **LIVE** mono readout that *changes during the
  scene* — pick the on-thesis number (profit rate %, $/hr, capex $, seal %).
  This is the financial-terminal heartbeat; a static telem is a missed beat.
- **`.coord`** (bottom-right): mono status caps (`RATE · FALLING`).
- The `.frule` + four `.crook` corner crosshairs are the camcorder viewfinder.

---

## 5 — The crack / fracture hit (the recurring "rupture" beat)

A seeded lightning fracture that tears across the frame on a hard ease, with a
glow+core double-stroke, forks, a screen-flash, drifting shards, and a canvas
shake. The film's signature "rupture" punctuation — used at each numbered crack
beat. Land it in **amber** (the contradiction color). Precompute geometry once
(seeded) so it's deterministic.

```js
// geometry (once): main bolt sx,sy→ex,ey with perpendicular jitter + forks + shards
var crackPts=[], CN=22, sx=690, sy=120, ex=1255, ey=968;
for (var c=0;c<=CN;c++){ var u=c/CN, bx=sx+(ex-sx)*u, by=sy+(ey-sy)*u;
  var jit=(c===0||c===CN)?0:(rand()-0.5)*150; crackPts.push({x:bx+jit*-0.78, y:by+jit*0.62}); }
// length-accurate reveal: walk segments up to (totLen * progress); glow pass (amber, blur26)
// then hot-core pass (rgba(255,236,205) lineWidth 2.4). Forks fire when progress passes their anchor.
```

```js
// timeline: drive a shared S.crack 0→1 (hard in), flash, shake, shards
tl.to(S, { crack: 1, duration: 0.55, ease: "power4.in" }, 41.9);
tl.to(S, { shard: 1, duration: 1.4, ease: "power2.out" }, 42.45);
tl.fromTo("#s-flash", { opacity:0 }, { opacity:1, duration:0.1, ease:"power2.out" }, 42.45);
tl.to("#s-flash", { opacity:0, duration:0.7, ease:"power2.in" }, 42.55);
tl.fromTo("#s-crackword", { opacity:0, scale:1.22, filter:"blur(16px)" }, { opacity:1, scale:1, filter:"blur(0px)", duration:0.75, ease:"power4.out" }, 42.45);
// shake the CANVAS layer (no layout transform → matrix-safe, won't bleed black edges)
tl.fromTo("#s-canvas", { x:0 }, { x:16, duration:0.055, ease:"none", yoyo:true, repeat:7, onComplete:function(){ gsap.set("#s-canvas",{x:0}); } }, 42.45);
```

```css
#s-flash { position:absolute; inset:0; z-index:9; opacity:0; pointer-events:none; mix-blend-mode:screen;
  background: radial-gradient(60% 45% at 50% 52%, rgba(232,145,58,0.55) 0%, rgba(232,228,223,0.18) 30%, rgba(232,145,58,0) 70%); }
```

Put the fracture/shards on a **separate fx canvas above content** (z-index 7+)
and the atmosphere on a canvas behind; share one `S` state object.

---

## 6 — Light sweep across a plate

A diagonal gloss that crosses an image as it settles — turns a static plate
reveal into a cinematic one (the Marx-portrait turn in s0). The plate needs
`overflow:hidden`.

```css
.plate { position:absolute; overflow:hidden; }
.plate .sweep { position:absolute; inset:0; pointer-events:none; transform:translateX(-130%);
  background: linear-gradient(105deg, transparent 38%, rgba(232,228,223,0.32) 50%, transparent 62%); }
```

```js
tl.fromTo(".plate", { opacity:0, x:-56, scale:1.06, filter:"blur(10px)" }, { opacity:1, x:0, scale:1, filter:"blur(0px)", duration:1.6, ease:"power3.out" }, 51.6);
tl.fromTo(".sweep", { x:"-130%" }, { x:"130%", duration:1.5, ease:"power2.inOut" }, 53.0); // mark sweep with data-layout-allow-overflow
```

---

## 7 — Hero number count-up + hollow recede

A giant mono figure blurs in and counts up (the cold-open record), then **recedes
and desaturates to grey-hollow** while an amber ring spins around a darkened void
— "money spinning with nothing underneath." Count-ups run on a throwaway proxy
object (lint will warn about its anonymous target — benign).

```js
tl.fromTo("#s-num", { opacity:0, scale:1.12, filter:"blur(10px)" }, { opacity:1, scale:1, filter:"blur(0px)", duration:0.9, ease:"power3.out" }, 1.6);
tl.fromTo({ v:0 }, { v:0 }, { v:62.6, duration:3.0, ease:"power2.out", onUpdate:function(){ document.getElementById("s-digits").textContent=this.targets()[0].v.toFixed(1); } }, 1.8);
// hollow turn:
tl.to("#s-hero", { y:-78, scale:0.86, duration:1.2, ease:"power3.inOut" }, 9.3);
tl.to("#s-digits", { color:"#8c98a4", duration:1.1 }, 9.8);    // grey-hollow
tl.to(S, { hollow:1, drain:1, duration:2.0 }, 10.0);           // canvas draws ring + void + inward-spiraling motes
```

Dollar/scale figures ALWAYS in JetBrains Mono, tabular-nums (financial-terminal
register). Concepts land in Noto Serif SC (engraving register). That typographic
split *is* the old-vs-new tension.

---

## 8 — Code-recreated document / editorial cut

Recreate a real artifact (an income statement, a filing, a news item) in pure
DOM/CSS rather than screenshotting — stays on-palette, editable, and rescalable.
Hard-cut to it like cutting to evidence; scan it; highlight the load-bearing row.

- Build rows as fl\[label · value\] flex lines; mono tabular figures, ledger-gold
  for accounting (`#c8b783`), amber box on the row that matters.
- A scan sweep (a thin gradient bar tweened top→bottom) reads the document.
- **Verify any real numbers** (web-search the source filing). If you must invent
  line items to make a column add up, label the doc honestly as 节选/simplified —
  don't present fabricated figures as a real statement. (Marx s0 uses the actual
  SEC Q1-2026 Alphabet figures.)

```js
tl.set("#s-doc", { xPercent:-50 }, 0);
tl.fromTo("#s-doc", { opacity:0, scale:1.04, filter:"blur(6px)" }, { opacity:1, scale:1, filter:"blur(0px)", duration:0.5, ease:"power3.out" }, 21.2); // hard, fast
tl.to("#s-gainbox", { opacity:1, duration:0.5 }, 24.2);  // light the load-bearing row
```

---

## 9 — Diegetic mechanism diagrams (SVG)

Hand-built SVG mechanisms that *enact* the metaphor through motion, not decorate
it. The catalogue used so far:

- **Circulation loop with a hollow center** (s2): money packets travel a closed
  elliptical path (us→model over the top arc, back recolored over the bottom) —
  the empty middle = "nothing is produced." Sample the bezier with a proxy.
- **Value-decomposition bar** (s1): SVG `rect`s grow from the bottom; dead labor
  cools to recessive steel, living labor stays warm — color *is* the argument.
- **Gate-wall + locked-out crowd** (s4): bars fuse into a wall with gaps; a dense
  field of dots presses at the base, only a few rise through.
- **Convergence funnel** (s4): N source nodes accelerate (`fn²`) into a few hubs.
- **Roller flattening a landscape** (s6): a spoked wheel rolls across colored
  "positions," tamping them to a grey monotone behind it (mechanical inevitability).
- **Twin-cut / cord-sever** (s1/s3): a steel element severs a crimson cord; spark,
  recoil, darken — the saw-the-branch thesis at any scale.

Principle: show something *trying, failing, transforming* — never a final-state
diagram that merely fades in. If you can rebuild the beat as a static slide, it's
not earning the canvas.

---

## 10 — Charged-state shared object (`window.__s<n>state`)

The pattern that lets the GSAP timeline drive a canvas/SVG `render(t)` without
per-frame clocks. Declare a plain object, expose it, mutate its fields with
tweens, read them in `render`. Everything stays seek-deterministic.

```js
var S = window.__s5state = { reveal:0, crack:0, shard:0, flash:0, vamp:0, cosmos:0 };
// timeline: tl.to(S, { cosmos:1, duration:5.0, ease:"power2.inOut" }, 24.0);
// render(t): if (S.cosmos > 0.01) { ...draw using S.cosmos as 0..1... }
// canvas script must fall back if it runs first:
var S = window.__s5state || (window.__s5state = { reveal:0, crack:0, shard:0, flash:0, vamp:0, cosmos:0 });
```

---

## 11 — Pacing as a visual instrument (cross-ref)

Rhythm is a technique too. The narration can slow/breathe/hold per beat, and the
visuals re-time to match (a slow final word + a long fade; a dramatic pause
before a reveal). See `references/audio-direction.md` §1 for the TTS
split-and-splice mechanics. The point for *this* library:
when a beat needs to land, give it air on the timeline — don't crossfade
everything on the same ease at the same time. Vary density: brisk hook → steady
exposition → weighted insight beats with space around them → slowest close.

---

## 12 — Generated asset prompts

Use the configured provider or available host tool as described in [asset-generation.md](../../hyperframes-creative/references/asset-generation.md). Generated images can supply material, illustration and world architecture; exact text, counts and changing relationships may remain code-owned. Split an asset only when independent motion, occlusion, parallax or factual registration earns the extra layer. Save every prompt and output provenance in `assets/PROMPTS.md`.

For a transparent component, request real alpha when supported and inspect the actual channels and moving silhouette. A checkerboard or PNG extension is not proof of alpha. Keep source images unchanged. A precisely authored SVG/CSS mask is an alternate compositing method, not native alpha. Chroma-keying is a legacy option only when an existing asset was deliberately generated for it; inspect edge loss and spill. `scripts/cutout-bg.cjs` needs its separately installed dependencies and is not a generation service.

### Prompt anatomy (4 blocks — keep the STYLE block a constant across a scene's layers)

```
STYLE   — [the locked register preamble: stylization + lighting + palette + bg]
SUBJECT — [what THIS layer depicts, concretely]
COMPOSITION HINT — [full-bleed bg / centered foreground subject / edge-only atmosphere;
                    reserve an empty zone if a canvas element composites on top]
ANTI-SLOP — [what to suppress: no photoreal, no text/watermark, no off-palette color,
             no saturated consensus-gradient glow]
```

Lock STYLE as a string constant; vary only SUBJECT / COMPOSITION / opacity-role per layer so the layers read as **one world**. Shift register only *across* scenes, never within one composite.

### Register A — Faceted Dossier-Geometric (generated 2D artifact register)

Faceted low-poly geometric form as a **generated 2D illustration**, with a drawn-not-rendered surface, museum-drawer cool diffuse light, paper grain, and semantic palette. Reference vibe: Diderot's Encyclopédie folio × MIT Press cover × architectural-model photography. This is an optional artifact register, not permission to assemble recognizable people or animals from default WebGL primitives. Every facet must allocate information; step to a silhouette, cutout, or another register when the literal subject would look crude.

Copy-paste STYLE preamble (retune hexes to the project palette):

```
STYLE — low-poly geometric, faceted, angular, polygonal, hard edges, minimal
polygon count, drawn-not-rendered matte surface with subtle paper-grain texture,
cool diffuse museum-drawer lighting with dramatic light catching the angular
faces. STRICTLY LIMITED palette: deep void-blue background #0a0e14; steel-blue
forms #4a7c9b; bone/off-white highlights #e8e4df; a SINGLE amber accent #e8913a
used on exactly one element (the focal point). Asymmetric composition with a
clear directional force. Light reads as a CONSEQUENCE (glow escaping from strain
or a breakthrough point), never applied as decoration.
SUBJECT — [the faceted object/figure, described by its essential structure]
COMPOSITION HINT — centered subject on solid magenta #FF00FF background, generous
margin for clean cutout. [or: full-bleed establishing field for a substrate layer]
ANTI-SLOP — NO photorealism, NO realistic textures, NO text or watermarks or
labels, NO saturated neon, NO purple-to-blue "cinematic" gradient glow, NO busy
high-detail rendering (low-poly means FEWER faces, not more).
```

**Active-accent discipline:** the amber appears on EXACTLY ONE element per asset — the answer to the scene's load-bearing question (where the strain / decision / break is). Across a family of assets, keep the amber encoding the same single dimension so a row of them reads pre-verbally as a sentence.

Style keywords to keep in the prompt: `low-poly, geometric, faceted, angular, polygonal, hard edges, dark faceted surfaces, minimal geometry, dramatic lighting on angular faces`.

### Register B — Archive Plate (pre-1900 evidentiary only)

Pure copperplate engraving in the 18th-century scientific-encyclopedia tradition — **line work + cross-hatching only, no solid fills**, parchment background, hand-tinted amber wash on metalwork only OR a single small amber wax-seal in the lower-left, a `TAB. <N>` registration code lower-right. Composited as a full document (no cutout). Anachronistic for AI/internet/industrial-era subjects — don't use post-1900.

```
STYLE — 18th-century copperplate engraving, scientific-encyclopedia plate, fine
line work and cross-hatching ONLY (no solid fills, no flat shading), aged
parchment background, single hand-tinted amber wash confined to one element, a
small "TAB. IX" registration code set in the lower-right corner in engraver's
serif. Restrained, archival, authoritative.
SUBJECT — [the period figure / instrument / document being cited]
COMPOSITION HINT — full plate, centered, parchment margins; this is a document the
camera dwells on, not a cutout.
ANTI-SLOP — NO solid color fills, NO modern typography, NO photorealism, NO
saturated color (parchment + ink + one amber accent only), every rendered word
spelled correctly.
```

Polygon-silhouette-as-lineage (optional, if building a dossier family): hexagon = relational/field theory, triangle = vertical critique, square = empirical structuralism, octagon = foundational synthesis. Same shape across same-school plates so a montage groups pre-verbally.

### Register C — Terminal Print (modern evidentiary, reserve)

Modern dark-editorial register for AI/internet-era evidence (a model card, a leaked thread, a security report): dark canvas, monospace identifiers, restrained UI-chrome framing, one amber accent. Same evidentiary job as Register B but for the present era. Build its locked preamble the first time a shot needs it, then keep it constant.

### Text ownership on generated plates

Raster owns material, illustration, atmosphere, and world architecture. Code owns factual or causal labels, counts, axes, paths, transformations, and word-locked marks. A short, non-changing string may be baked only after full-resolution glyph QC; otherwise reserve a measured region and register an HTML/SVG overlay from the asset's actual pixels and applied `cover`/`contain` transform. Never trust intended prompt placement over the generated file.

### Cinematography principle — assets are subjects, not stickers

A PNG is a subject or evidence, not a disconnected sticker. Move, mask, parallax, or dissolve it only when that treatment changes meaning, reveals structure, or hands off the eye. A still evidence plate may hold while the mechanism, camera, or edit performs around it. When raster is a substrate, tune it only enough to establish figure-ground; deliberate negative cinema may use none.

---

## 13 — Vox light editorial register

The canonical Vox-light recipes, ground hygiene, duotone/cutout rules, marker typography, and asset responsibilities live in [vox-light-editorial.md](./vox-light-editorial.md). Read that file when this register is selected; do not mix its light-paper world with a dark dossier register inside one scene. Keep argument-bearing labels and word-locked marks code-native unless a short baked string passes full-resolution glyph QC.
## 14 — Cut on the curve (velocity-matched seamless cut)

Why Vox's cuts between photos/scenes feel *seamless* instead of jarring: they **cut at peak velocity, across a matched motion curve**, so the eye is moving fastest at the exact frame of the cut and never registers the seam. The motion carries through the cut instead of stopping at it. This is the moving-image cousin of our §11 pacing rule and the cross-dissolve seam in `index.html`.

The recipe (from the Vox editor's description):

1. **Keyframe object A with an ease-in/ease-out move** — it accelerates in and decelerates out (a slow-in/slow-out push, slide, or scale). Its velocity is a curve: zero → **peak in the middle** → zero.
2. **Parent object B to object A** (match B's speed + position to A) so B inherits the *same* velocity curve — both are moving at the same rate through the transition.
3. **Hard-cut at A's peak velocity** — the midpoint of the move, where speed is highest. At that frame the eye is tracking fast motion and is blind to the substitution; A becomes B with no visible seam.

In HyperFrames (one paused timeline, seek-driven) you don't have AE parenting, so implement it as **matched-velocity tweens on a shared ease, swapped at the fast midpoint**:

```js
// A is mid-move on an ease that peaks in the middle (power2.inOut peaks at its center).
// Cross-cut to B at the velocity peak: A fades out / B fades in over a SHORT window
// centered on that peak, while BOTH share the same transform velocity through it.
var T_CUT = 12.0, MOVE = 1.6;            // the move spans T_CUT-0.8 .. T_CUT+0.8; peak at T_CUT
// object A: slow-in→fast-middle→slow-out drift
tl.fromTo("#a", { x: -60 }, { x: 60, duration: MOVE, ease: "power2.inOut" }, T_CUT - MOVE/2);
// object B inherits the SAME velocity curve (same ease, same delta) so motion is continuous
tl.fromTo("#b", { x: -60 }, { x: 60, duration: MOVE, ease: "power2.inOut" }, T_CUT - MOVE/2);
// the swap happens FAST, centered on the peak (the eye is moving fastest → blind to the seam)
tl.to("#a", { opacity: 0, duration: 0.12, ease: "none" }, T_CUT - 0.06);
tl.fromTo("#b", { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none" }, T_CUT - 0.06);
```

Discipline:
- **Both objects must share the same ease and the same motion delta** through the cut window — if their velocities don't match at the seam, the swap pops. (`power2.inOut` / `power3.inOut` peak at center; a linear move has constant velocity and also works but feels less alive.)
- **Keep the opacity swap SHORT** (~0.08–0.15s) and centered exactly on the velocity peak. A long crossfade defeats it — the point is a near-hard cut hidden by motion, not a dissolve.
- **Use it for photo↔photo / scene↔scene** beats where a hard cut would feel choppy (the Vox duotone-cutout sequence). Overusing it makes everything feel like it's gliding — reserve for transitions you want invisible; use a real hard cut (or a §5 charged cut) when you *want* the seam felt (a prediction-error rupture).
- A **whip-pan** is the maximal version: a fast blurred pan out of A and into B on the same direction/velocity, cut at peak blur.

---

## 15 — Camera inspection / parallax rig (earned spatial posture)

Use this when the camera must inspect a world, reveal scale/occlusion, intensify a claim, or hand velocity into the next shot. It is not a mandatory anti-stillness layer: a mechanism changing state can fully perform while the frame holds. Uniform 1.00→1.05 pushes on every scene are another sophisticated-PowerPoint tell.

```js
// One world wrapper. If chrome is present, keep it outside this rig.
// Inspection move during an earned window tied to a claim cue.
var camera = { p: 0 };
tl.to(camera, { p: 1, duration: 1.25, ease: "power2.inOut" }, T_INSPECT);
// Parallax differs only when the difference proves depth. Drive all layers
// from the same seek-safe camera proxy:
function render(t){
  var k = camera.p;
  far.style.transform  = "translate(" + (-8*k) + "px," + (-4*k) + "px)";   // background ~1px/s
  mid.style.transform  = "translate(" + (-20*k) + "px," + (-10*k) + "px)"; // mid
  hero.style.transform = "translate(" + (-36*k) + "px," + (-18*k) + "px)"; // foreground fastest
}
```

Discipline:
- **Rates must differ per layer** — same rate = flat (this is §2's layer-variance applied to camera). Convention: far ~1×, mid ~2.5×, hero ~4×.
- **Name what the move reveals.** If the answer is only "cinematic energy," remove it and let the internal state turn perform. When used, keep the vector coherent through the beat and charge it only at an argument cue.
- **Chrome, if the design earns it, does NOT ride the rig** — it stays locked to the physical frame while the world moves inside it.
- A **dolly-zoom** (scale the rig up while widening an inner element's spacing) is the charged variant for a vertiginous "the ground shifts" beat — use once.

---

## 16 — Word-locked reveal (fire on the syllable, not the sentence)

Load-bearing visual events fire on **stressed syllables**, not mechanically at sentence boundaries. Event density follows comprehension and dramatic intent: one sustained causal transformation may carry several seconds, while a dense proof may need several word-locked hits. There is no universal events-per-second quota.

Because audio is locked and timed in `boundaries.json` / the words JSON, convert a target word's global time to scene-local and fire there:

```js
// helper: scene-local time for a beat (global word time − scene start)
function wf(globalSec){ return globalSec - SCENE_START; }   // SCENE_START from boundaries.json
// fire each element on the syllable it illustrates, not on the paragraph:
tl.fromTo("#bar-dead",  { scaleY:0 }, { scaleY:1, duration:0.5, ease:"power2.out" }, wf(95.2));  // "死劳动"
tl.fromTo("#bar-live",  { scaleY:0 }, { scaleY:1, duration:0.5, ease:"power2.out" }, wf(96.8));  // "活劳动"
tl.fromTo("#bar-surp",  { opacity:0 }, { opacity:1, duration:0.4, ease:"back.out(2)" }, wf(98.1)); // "剩余"
```

Discipline:
- **Lead the syllable by ~0.05–0.12s** so the visual lands *with* the word, not after it (perceived sync; a visual exactly on the onset reads as slightly late).
- **Anchor types:** pre-syllable lead-in (motion starts just before), on-syllable hit (the punch), post-syllable hold (label lingers). Mix them — all-on-syllable feels mechanical.
- **Don't word-lock everything** — lock the load-bearing events. Secondary motion stays finite and seek-safe, and exists only when it encodes atmosphere, depth, or state; do not add wallpaper loops to fill time.
- This is the inverse of §14: cut-on-the-curve hides a seam in *motion*; word-lock binds a hit to *the voice*. Both fight the "slideshow" failure from opposite sides.

---

## 17 — Match cut / graphic match (carry a shape across the cut)

Cut from A to B where a **shape, position, or motion in A aligns with one in B**, so the eye reads continuity and the *idea* transfers across the cut (a circle becomes a coin becomes a clock becomes a zero). The most argument-dense transition: the match itself *is* the claim ("this is that"). Cousin of §14 (which matches velocity); this matches *form*.

```js
// A's shape eases to the exact geometry B will occupy, then a fast swap at the matched frame
// e.g. the ¥ circulation ring (A) becomes the hollow "0" of value→zero (B)
tl.to("#a-ring", { attr:{ r: 120 }, x: 960, y: 470, duration: 1.0, ease: "power2.inOut" }, T-1.0);
tl.set("#b-zero", { x: 960, y: 470, scale: 120/120 }, T);   // B pre-placed on A's final geometry
tl.to("#a-ring", { opacity: 0, duration: 0.12 }, T-0.06);
tl.fromTo("#b-zero", { opacity: 0 }, { opacity: 1, duration: 0.12 }, T-0.06);
```

Discipline:
- **The shared geometry must actually align** (same center, similar radius/silhouette) at the cut frame — if it's off, it's just a dissolve. Pre-place B on A's final transform.
- **Reserve for "X is really Y" beats** — a match cut asserts equivalence; using it on unrelated shapes is a lie the eye notices. (Marx fits: circulation-ring → zero; value-bar → falling-rate curve baseline; the branch → the saw kerf.)
- Pairs with §14 (match velocity *and* form for the most invisible transition) or with a §5 flash (match form, then flash to mark the reveal as charged).

---

## 18 — Halftone overlay (tactile print texture)

A CSS/SVG halftone dot pattern can make an image feel printed—tactile, press-run, like a newspaper page. Use it only when the selected material register calls for print texture; it is not a universal quality layer and should never be added merely to make a clean frame look busier.

**The principle:** printing presses render shades as dot *density*, not continuous tone — dark = bigger denser dots, light = smaller spaced dots. Overlaying a dot pattern at low opacity restores that physicality to a purely digital render.

```css
/* Option A — pure CSS radial dot pattern (no external asset) */
.halftone-overlay {
  position: absolute; inset: 0; pointer-events: none; z-index: 3;
  /* radial-gradient makes a crisp dot; background-size controls dot pitch */
  background-image: radial-gradient(circle, rgba(10,14,20,0.18) 1.5px, transparent 1.5px);
  background-size: 6px 6px;   /* 6px pitch = dense; 10–14px = coarser, more editorial */
  mix-blend-mode: multiply;   /* multiply darkens the dots into the image; overlay for softer */
}
```

```html
<!-- drop inside any scene that needs it; tune opacity via inline style -->
<div class="halftone-overlay" style="opacity:0.55;"></div>
```

```css
/* Option B — SVG feTurbulence-driven stochastic dots (more organic, varied dot size) */
/* Useful when you want the dots to feel hand-screened rather than perfectly gridded */
.halftone-svg { position:absolute; inset:0; pointer-events:none; z-index:3; }
/* inline the SVG filter + feColorMatrix into the scene's <defs> */
```

```js
// Animate density in/out with the timeline (e.g. fade in as a plate settles)
tl.fromTo(".halftone-overlay", { opacity: 0 }, { opacity: 0.55, duration: 0.8, ease: "power2.out" }, REVEAL_T + 0.3);
```

Discipline:
- **`mix-blend-mode: multiply`** on a dark-dot pattern darkens into the image cleanly; use `overlay` or `soft-light` on very dark substrates.
- **Dot pitch vs. effect:** 4–6px = tight halftone (newsprint, tabloid); 8–12px = coarse editorial; 14–18px = visible benday (comic / Roy Lichtenstein territory). Bigger dots = more visual noise — use sparingly.
- **Scale down via `background-size`** — don't resize the overlay element. Keeping the element `inset:0` lets a future `background-size` tween vary density without layout reflow.
- **Never halftone a canvas/WebGL layer** — `mix-blend-mode` interacts unpredictably with composited layers; apply it only on top of `<img>` or `<div>` backgrounds.
- **Pairs naturally with §13 (Vox register):** the Vox light-paper ground already implies press printing; adding a halftone overlay on the paper substrate completes the signal. Also pairs with §8 (code-recreated document) — the halftone on the document plate makes it read as a scan, not a render.

---

## 19 — Layered photo substrate (dark/mixed documentary registers)

A scene background built from **2–4 real photos stacked, tinted, and dimmed** rather than a flat color — so the scene has depth, atmosphere, and documentary authority before a single animated element appears. This is the invisible trick behind why Vox's backgrounds feel *situated* (the argument is happening *somewhere* real) while a flat `#0a0e14` background floats in a void.

The core move: pull photos that support the scene's subject (the Capitol building for a politics scene, server farm for AI, archive footage for history), pre-comp them at low opacity, unify them with a tint that maps to the project palette, and push blacks to near-black (not pure black — pure black collapses depth) and whites slightly bright so contrast reads as chosen, not default.

```css
.photo-substrate { position: absolute; inset: 0; overflow: hidden; }
.photo-substrate img {
  position: absolute; width: 100%; height: 100%;
  object-fit: cover; object-position: center;
}
/* layer 1: main atmosphere photo (underneath, full bleed) */
#sub-bg   { opacity: 0.22; filter: saturate(0.3) brightness(0.7); }
/* layer 2: detail photo (blended, offset) */
#sub-mid  { opacity: 0.14; filter: saturate(0.2) brightness(0.9); mix-blend-mode: screen; }

/* tint overlay: bake the project palette into the substrate */
.substrate-tint {
  position: absolute; inset: 0;
  background: rgba(10, 14, 20, 0.62);  /* void-blue tint for dark-register scenes */
  /* light Vox uses its canonical solid cream ground instead; see §13 */
}
```

```js
// fade in the substrate before any foreground elements; it should be present before the voice starts
tl.fromTo(".photo-substrate", { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" }, 0);
// slow drift on the substrate layers (different rates = depth) — this is §15 applied to the substrate
tl.fromTo("#sub-bg",  { scale: 1.0 }, { scale: 1.04, duration: DUR, ease: "none" }, 0);
tl.fromTo("#sub-mid", { scale: 1.0, x: 0 }, { scale: 1.06, x: -14, duration: DUR, ease: "none" }, 0);
```

Key tuning:
- **Push blacks off pure black** — set `brightness(0.65–0.8)` on the substrate; a `#0a0e14` tint on top brings it dark without collapsing. Pure-black backgrounds make foreground elements float in space rather than inhabit a place.
- **Whites slightly brighter** than the default image — `brightness` > 1.0 on a dimmed layer keeps contrast without bleaching.
- **2–3 photos max** — each additional layer adds mixing complexity and GPU load with diminishing return. If you can't find 3 on-topic photos, use one full-bleed + one edge-cropped panel.
- **Hard-cut into a substrate scene, crossfade out** — the substrate gives the scene a sense of *arrival* (cutting in hard reads as "we're now here"); crossfading out lets the next scene build on top without a black flash.
- **Stock sourcing:** Pexels/Pixabay/Unsplash via `references/asset-foundry.md` §3. Save URL + license to `assets/PROMPTS.md` provenance block. For scenes that need a fictional or composite subject (a "server farm of the future"), generate a plate with the selected provider using the project's STYLE preamble (§12) and use it as the substrate — same technique, generated source.
- **Relation to §13:** Vox-light uses the solid-cream ground hygiene in `vox-light-editorial.md`; do not apply this full-bleed photo stack there. This technique belongs to dark or deliberately mixed documentary registers. Pick one ground grammar per scene.

---

## 14b — Posterized-time choppy cut (organic 12fps stutter)

An addendum to §14's velocity-matched cut. When the Vox choppy-documentary aesthetic is the register, add **posterized time** on top of the cut-on-the-curve move: render the *transition sequence* at a lower effective frame rate (12fps target) so the cut has that organic, slightly hand-cranked feel rather than a perfectly smooth digital glide.

The technique: CSS `animation-timing-function: steps(N)` (or a GSAP `ease: "steps(N)"`) applied to the transition tween turns a smooth interpolation into discrete jumps. At 12 steps per second with a 60fps timeline, each "step" holds for 5 frames before jumping — exactly the posted-time look.

```js
// posterized time on a cut-on-the-curve transition (§14):
// instead of ease:"power2.inOut" (smooth), use a stepped ease at the cut
// so both A and B move in discrete 12fps-style hops through the transition window
var STEPS = Math.round(CUT_DURATION * 12); // 12 "frames" per second of cut
tl.to("#a", { opacity: 0, duration: CUT_DURATION, ease: "steps(" + STEPS + ")" }, T_CUT - CUT_DURATION/2);
tl.fromTo("#b", { opacity: 0 }, { opacity: 1, duration: CUT_DURATION, ease: "steps(" + STEPS + ")" }, T_CUT - CUT_DURATION/2);
// KEEP the underlying motion tween smooth (power2.inOut on the transform) — only the opacity swap is stepped
// stepping the motion itself creates a jitter, not a film feel; stepping only the cut is the precision
```

```css
/* Alternatively, CSS steps() on a class applied at cut time: */
.posterized {
  /* applied only during the transition window, then removed */
  animation-timing-function: steps(1, end);
}
```

Discipline:
- **Step only the opacity swap, not the underlying motion** — posterizing the position/scale creates stutter-jitter that reads as a bug; posterizing the cut window alone reads as style.
- **12fps is the target frame rate, not the step count** — `steps = duration_in_seconds × 12`. A 0.3s cut = `steps(4)`. A 1.0s cut = `steps(12)`.
- **Reserve for the Vox editorial register (§13)** or any beat that wants handmade / archival energy. On dark-register abstract scenes (Register A), the smooth §14 cut is correct; the stutter clashes with the low-poly precision aesthetic.
- **Stack with §14's velocity matching** — find the velocity peak first (§14), *then* apply the stepped ease to the swap. The velocity match is what makes it invisible; the stepped ease is what makes it feel like film.

## 20 — Population field → chart proof

Keep entity identity while changing representation. Reserve separate lanes for the source field, extracted evidence strip, axes/plot, and live readout; never stack them in one band. Collapse agents into the evidence strip first, build axes second, then move one probe and update the value. Remove population labels before chart labels arrive. QA four states: population, transfer, settled chart, and live-value frame.

## 21 — Camera roll (Dutch tilt + barrel-roll transition)

`rotation` (GSAP's alias for CSS `rotate()`) on the §15 camera-rig wrapper is
the one axis the rest of this library skips — every other camera move here is
a push, pan, or tilt on X/Y; never a roll on Z. Two distinct uses; don't blend
them into ordinary scenes. *(New addition closing a real gap — no prior
shipped usage yet; the next build to reach for it should tighten this entry
with what actually worked.)*

**18a — Dutch tilt (the frame goes off-balance).** Roll the *whole stage* a
few degrees and hold it through the beat — the shot doesn't self-correct; the
tilt IS the argument ("the ground shifted"). Small angle (4–8°) reads as
unease; larger (12–20°) reads as disorientation. Chrome (`.reg`/`.frule`/
`.telem`) stays locked to the frame, same rule as §15.

```js
// tie to a rupture/reveal beat; settle-in, then HOLD — a Dutch tilt that
// self-corrects immediately reads as a mistake, not a directorial choice
tl.fromTo("#s-stage", { rotation: 0 }, { rotation: -6, duration: 0.8, ease: "power2.out" }, T);
// … scene continues tilted through the beat …
tl.to("#s-stage", { rotation: 0, duration: 0.6, ease: "power2.inOut" }, T_RESOLVE); // untilt ONLY at the resolution
```

**18b — Barrel-roll transition (a seam, not a scene beat).** The outgoing
scene spins a full turn while shrinking and fading; the incoming scene spins
in from the opposite direction and lands at 0°. The rotational cousin of the
whip-pan (`cinema-layer.md`) — reserve for a stylized high-energy cut (a
montage kicker, a tonal jolt between acts). Give it its own `SEAMS` entry
(`templates/index.skeleton.html`) rather than bolting it onto scene content:

```js
tl.to("#el-old", { rotation: 360, scale: 0.2, opacity: 0, duration: 0.5, ease: "power2.in" }, T);
tl.fromTo("#el-new", { rotation: -360, scale: 0.2, opacity: 0 },
  { rotation: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" }, T);
```

Discipline:
- **Roll is rare by nature** — one Dutch tilt per film, one barrel-roll
  transition per film, max. Used twice each becomes a tic; the whole point is
  the single moment it breaks the frame's usual honesty.
- Set `transformOrigin` explicitly if the element isn't already centered — a
  roll around an off-center origin reads as broken, not stylish, unless the
  off-center wobble IS the intended beat.
- Pairs with §5 (flash) at the barrel-roll's cut point, or with a fisheye /
  anamorphic lens deviation (`hyperframes-creative/references/cinema-layer.md`)
  for a charged anchor-shot version.
---

## Adding to this library

Found or built something reusable? Add a numbered section: a one-line "what it
is + when it earns its place," a minimal copy-pasteable snippet, and where it was
first used. Keep snippets real (lifted from a shipped scene), deterministic, and
palette-agnostic where possible. Prune anything that's gone stale. This file is
a living toolbox — edit freely.
