# Motion Principles

> **The *taste* behind these mechanics** — timing-vs-spacing, anticipation/follow-through/arcs, the moving hold, weight-via-timing (Williams + Disney's 12 principles) — lives in [`visual-storytelling.md`](./visual-storytelling.md) → Layer 4. This file is the seek-safe GSAP *implementation*; read that for *when and why* to deploy each.

## Contents

- Guardrails
- What you do not do without being told
- Visual composition
- Image motion treatment
- Load-bearing GSAP rules

## Guardrails

You know these rules but you violate them. Stop.

- **Ease follows force.** Reuse one easing family when objects share material and physics; change it only when force, weight, or emotional intent changes. Ease-name variety is not motion design.
- **Duration follows comprehension and distance.** Similar operations may share timing; make a beat faster or slower only when the viewer's task or the object's travel demands it. There is no scene-speed ratio quota.
- **Entrance vector follows origin.** Elements from the same system may enter together; vary direction, scale, opacity, or spacing only when the spatial source or semantic role differs.
- **Stagger follows order.** Derive it from hierarchy, causality, or reading sequence. A recurring rhythm may correctly recur.
- **Ambient motion is optional.** Add a pan, rotation, scale push, or color shift only when it encodes depth, state, or eye travel. Stillness after motion—and a still substrate around an active mechanism—is powerful.
- **Define t=0 deliberately.** Establish a deterministic visible substrate immediately. A cold-open action may begin at frame zero when the narration does; later utility scenes may hold 0.1–0.3s when the incoming seam needs a receiver.

## What You Don't Do Without Being Told

### Easing is emotion, not technique

The transition is the verb. The easing is the adverb. A slide-in with `expo.out` = confident. With `sine.inOut` = dreamy. With `elastic.out` = playful. Same motion, different meaning. Choose the adverb deliberately.

**Direction rules — these are not optional:**

- `.out` for elements entering. Starts fast, decelerates. Feels responsive. This is your default.
- `.in` for elements leaving. Starts slow, accelerates away. Throws them off.
- `.inOut` for elements moving between positions.

You get this backwards constantly. Ease-in for entrances feels sluggish. Ease-out for exits feels reluctant.

### Speed communicates weight

- Fast (0.15-0.3s) — energy, urgency, confidence
- Medium (0.3-0.5s) — professional, most content
- Slow (0.5-0.8s) — gravity, luxury, contemplation
- Very slow (0.8-2.0s) — cinematic, emotional, atmospheric

### Scene structure: state A / cause / state B

Every scene must visibly turn a value. Establish the starting state, let a causal operation change it, then resolve on evidence of the new state. Build/breathe/resolve percentages are optional pacing tools, not a template; a long middle must keep performing through consequence or accumulation, not an idle ambient loop.

### Transitions are meaning

- **Crossfade** = "this continues"
- **Hard cut** = "wake up" / disruption
- **Slow dissolve** = "drift with me"

You crossfade everything. Use hard cuts for disruption and register shifts.

### Choreography is hierarchy

The element that moves first is perceived as most important. Stagger in order of importance, not DOM order. Don't wait for completion — overlap entries. Total stagger sequence under 500ms regardless of item count.

### Asymmetry

Entrances need longer than exits. A card takes 0.4s to appear but 0.25s to disappear.

## Visual Composition

You build for the web. Video frames are not pages.

- **One dominant focal point per beat.** Secondary evidence may create an eye path, but it must not compete with the current meaning. A single object in intentional negative space is valid.
- **Fill the frame.** Hero text: 60-80% of width. You will try to use web-sized elements. Don't.
- **Use as many layers as the argument needs.** Rich mechanisms often want foreground/midground/background; negative-cinema landings may intentionally collapse to one plane.
- **Background is authored, not automatically busy.** Use substrate, evidence, or world architecture when it carries context. Pure black or paper-white is valid when emptiness is the argument.
- **Anchor to edges.** Pin content to left/top or right/bottom. Centered-and-floating is a web pattern.
- **Split frames.** Data panel on the left, content on the right. Top bar with metadata, full-width below. Zone-based layouts, not centered stacks.
- **Use structural elements.** Rules, dividers, border panels. They create paths for the eye and animate well (scaleX from 0).

## Image Motion Treatment

Treat an image as an artifact the camera observes, not a sticker. Use a motion/layering treatment when it adds meaning; a static evidence image may hold when the surrounding mechanism and cut are performing.

- **Perspective tilt**: use `gsap.set(el, { transformPerspective: 1200, rotationY: -8 })` + `box-shadow` — creates depth. Do NOT use CSS `transform: perspective(...)` as GSAP will overwrite it.
- **Slow zoom (Ken Burns)**: GSAP `scale: 1` → `1.04` over beat duration — makes photos cinematic
- **Device frame**: Wrap in a laptop/phone shape using CSS `border-radius` and `box-shadow`
- **Floating UI**: Extract a key element and animate it at a different z-depth for parallax
- **Scroll reveal**: Clip the image to a viewport window and animate `y` position

## Load-Bearing GSAP Rules

Rules below came out of two independent website capture builds (2026-04-20) where compositions lint-clean and still ship broken — elements that never appear, ambient motion that doesn't scrub, entrance tweens that silently kill their target. The linter cannot catch these; the rules must be followed by the author.

- **No iframes for captured content.** Iframes do not seek deterministically with the timeline — the capture engine cannot scrub inside them, so they appear frozen (or blank) in the rendered output. If the source you're stylizing is a live web app, use the screenshots from `capture/` as stacked panels or layered images, not live embeds.

- **Never stack two transform tweens on the same element.** A common failure: a `y` entrance plus a `scale` Ken Burns on the same `<img>`. The second tween's `immediateRender: true` writes the element's initial state at construction time, overwriting whatever the first tween set — leaving the element invisible or offscreen with no lint warning. A secondary mechanism: `tl.from()` resets to its declared "from" state when the playhead is seeked past the timeline's end, so an element that looked correct in linear playback vanishes in the capture engine's non-linear seek. Fix one of two ways:

  ```html
  <!-- BAD: two transforms on one element -->
  <img class="hero" src="..." />
  <script>
    tl.from(".hero", { y: 50, opacity: 0, duration: 0.6 }, 0);
    tl.to(".hero", { scale: 1.04, duration: beat }, 0); // kills the entrance
  </script>

  <!-- GOOD option A: combine into one tween -->
  <script>
    tl.fromTo(
      ".hero",
      { y: 50, opacity: 0, scale: 1.0 },
      { y: 0, opacity: 1, scale: 1.04, duration: beat, ease: "none" },
      0,
    );
  </script>

  <!-- GOOD option B: split across parent + child -->
  <div class="hero-wrap"><img class="hero" src="..." /></div>
  <script>
    tl.from(".hero-wrap", { y: 50, opacity: 0, duration: 0.6 }, 0); // entrance on parent
    tl.to(".hero", { scale: 1.04, duration: beat }, 0); // Ken Burns on child
  </script>
  ```

- **Prefer `tl.fromTo()` over `tl.from()` inside `.clip` scenes.** `gsap.from()` sets `immediateRender: true` by default, which writes the "from" state at timeline construction — before the `.clip` scene's `data-start` is active. Elements can flash visible, start from the wrong position, or skip their entrance entirely when the scene is seeked non-linearly (which the capture engine does). Explicit `fromTo` makes the state at every timeline position deterministic:

  ```js
  // BRITTLE: immediateRender interacts badly with scene boundaries
  tl.from(el, { opacity: 0, y: 50, duration: 0.6 }, t);

  // DETERMINISTIC: state is defined at both ends, no immediateRender surprise
  tl.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6 }, t);
  ```

- **Ambient pulses must attach to the seekable `tl`, never bare `gsap.to()`.** Auras, shimmers, gentle float loops, logo breathing — all of these must be added to the scene's timeline, not fired standalone. Standalone tweens run on wallclock time and do not scrub with the capture engine, so the effect is absent in the rendered video even though it looks correct in the studio preview:

  ```js
  // BAD: lives outside the timeline, never renders in capture
  gsap.to(".aura", { scale: 1.08, yoyo: true, repeat: 5, duration: 1.2 });

  // GOOD: seekable, deterministic, renders
  tl.to(".aura", { scale: 1.08, yoyo: true, repeat: 5, duration: 1.2 }, 0);
  ```

- **CSS position is the rest position; GSAP `x`/`y` is a delta.** Never paste an absolute screen coordinate into `x` or `y` for an element already placed with `top`/`left`; compute `target - rest`, or animate a wrapper. Large same-axis CSS + GSAP values are a double-offset warning.

- **World-registered layers share one camera wrapper.** Canvas particles, SVG routes, object labels, and plate-registered marks belong inside the same transformed stage as the world they annotate. Keep only fixed chrome and caption overlays outside; otherwise camera motion makes overlays drift off their anchors.

- **Hard-kill every scene boundary, not just captions.** Any element whose presence changes at a beat boundary needs a deterministic opacity `tl.set()` after its fade, because later tweens on the same element (or `immediateRender` from a sibling tween) can resurrect it. Apply to every element with an exit animation:

  ```js
  tl.to(el, { opacity: 0, duration: 0.3 }, beatEnd);
  tl.set(el, { opacity: 0 }, beatEnd + 0.3); // deterministic opacity kill
  ```

These are the exact rules with the exact code examples — don't summarize or shorten them. They exist because compositions that lint clean still ship broken without them.
