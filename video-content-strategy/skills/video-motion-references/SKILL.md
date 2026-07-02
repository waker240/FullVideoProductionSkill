---
name: video-motion-references
description: >-
  Motion-design reference library and Remotion animation implementation system for animated explainer videos. Covers channel technique analysis (Kurzgesagt, 3Blue1Brown, Wendover, PolyMatter, Johnny Harris, etc.), the 12 animation principles applied to motion graphics, a Remotion pattern library (spring presets, entry/emphasis/transition/exit/ambient patterns, ShotDuration/AudioOffset context, word-level timestamp sync), multi-shot composition (J-cuts, L-cuts, ghost object bridging, continuous canvas thread, particle color arcs), and Cinema-Layer effects (charged transitions, post-processing filters, 3D wrappers, hand-drawn integration, lens personalities, diegetic UI, video-arc drift) with per-effect performance budgets. Use when making motion-design decisions, choosing animation styles, building Remotion components, assembling multi-shot compositions, implementing word-level narration sync, picking a cinematic register per shot, implementing Cinema-Layer effects, or reviewing scenes for cinematic quality.
---

# Video Motion References

Motion design reference library and implementation system for animated explainer video production. Two parts:

1. **Channel References** — what to study and steal from proven channels
2. **Remotion Animation System** — comprehensive motion pattern library for implementation

**Companion skills:**
- `video-content-strategy` — what to create and why
- `video-creation-prompts` — production-level prompt engineering

## The Extraction Framework

Don't copy aesthetics. Study these dimensions across any reference channel:

| Dimension | What to Watch For |
|---|---|
| **Timing** | How many ms do elements hold? When do transitions fire relative to narration beats? |
| **Information layering** | How many elements on screen simultaneously? When does complexity add vs. subtract? |
| **Transition vocabulary** | Cut? Morph? Pan? Zoom? How does concept A become concept B visually? |
| **Typography as animation** | How does text appear, emphasize, exit? Typed? Faded? Snapped? |
| **Color as signal** | Do palette shifts signal argument shifts? Watch for hue changes at tension vs. resolution. |
| **Audio-visual sync** | What visual events land on narration emphasis words? |

## Channel-to-Layer Mapping

Each channel's primary technique mapped to Thinking Canvas layers:

| Channel | Primary Steal | Target Layer |
|---|---|---|
| **Kurzgesagt** | Closed visual system + ambient aliveness | Vocabulary Layer |
| **3Blue1Brown** | Transform-don't-cut + animation AS proof | Insight Layer |
| **Wendover** | Utilitarian complementarity + data-driven beats | Evidence Layer |
| **PolyMatter** | Icon choreography + spatial argument layout | Structure Layer |
| **Johnny Harris** | Register shifts + layered evidence accumulation | Pacing / Canvas-building |
| **Fireship** | Information density + typographic animation | Density / Timing |
| **Real Engineering** | Engineering diagrams that animate + register shifts | Structure Layer |
| **Exurb1a** | Visual texture as emotional channel | Insight Layer (mood) |
| **Melodysheep** | Three-channel independence (voice + music + visual) | Composition |
| **Primer** | Simulation-as-explanation + extreme minimalism | Structure Layer (simulation) |
| **Reducible** | Consistent node/edge vocabulary across videos | Vocabulary Layer |

## Motion Signature Quick Reference

### Kurzgesagt
- Smooth organic easing — nothing snaps, elements drift with gentle weight
- Constant ambient motion — particles, breathing backgrounds, subtle loops; frame never static
- Transitions via camera movement within continuous space, not scene cuts
- Hold times: 2-4 seconds per key visual state (slower than expected)

### 3Blue1Brown
- Precise mathematical easing — every trajectory intentional, no approximation
- Simultaneous coordinated motion — multiple elements transform in mathematically related ways
- Long unbroken transformation sequences (10-15s) — state A smoothly becomes state B
- Speed: slow for key transformation, quick summary moves to reset

### Wendover
- Clean utilitarian motion — no flourish, elements exist purely to carry information
- Map animations: routes trace at speaking pace, regions fill from center, scale reveals via zoom
- Chart builds: axes first, then data populates, then comparison element
- Speed: precisely matched to measured narration cadence

### PolyMatter
- Snappy precise easing — fast entrance with slight settle
- Staggered icon choreography — groups appear in quick succession (not all-at-once, not one-at-a-time)
- Panel transitions — screen reorganizes spatial structure smoothly
- Emphasis via relative scale — important grows, surrounding dims/shrinks

### Johnny Harris
- Kinetic and restless — constant slow pushes, lateral drifts, subtle zooms; frame never still
- Layering transitions — new elements slide ON TOP of existing ones; canvas accumulates
- Wide speed variation — rapid-fire context-setting, deliberate slow insight moments
- Tactile quality — drop shadows, paper textures, physical presence in abstract elements

### Fireship
- Aggressive snap timing — zero dead frames, every visual change is a beat
- Typography as primary animation element — text pops, slides, highlights in sync with rapid narration
- Speed: fastest of all channels listed; maximum information per second

### Real Engineering
- Clean technical precision — diagrams build methodically
- Register shifts between real footage (context) and animated schematic (explanation)
- Arrows and labels timed to narration, not front-loaded

### Exurb1a
- Dreamlike — slow dissolves, layered compositions, contemplative holds
- Visual texture (grain, color shifts, glitch) as emotional channel separate from narration
- Proves slow pacing is magnetic when signal density is high

### Primer
- Extreme minimalism — no decoration, zero unnecessary elements, every pixel is load-bearing
- Agent-based simulation: colored dots follow rules, emergent behavior unfolds on screen
- The visualization IS the proof — the viewer watches the system produce the result, not a diagram of the result
- Color used purely to distinguish agents/states, nothing decorative
- Mathematical precision without flourish — closest to raw information transfer

## The Synthesis Formula

For animated Thinking Canvas format (no face, voice-over, analytical essays):

> **Primer's simulation-as-proof** + **Kurzgesagt's system discipline** + **3Blue1Brown's transformational philosophy** + **PolyMatter's spatial argument structure** + **Johnny Harris's dynamic speed variation**

The viewer watches networks evolve — not illustrations of concepts, but computational models running on screen.

## Universal Motion Rules

1. **Everything enters with purpose, nothing enters by default.** If an element appears, the viewer should understand why it appeared at that moment.
2. **Timing mirrors narration rhythm.** Fast narration = snappier transitions. Pause = visual hold or slow morph. The visual track breathes with the voice.
3. **Motion implies physics.** Even abstract shapes should feel like they have mass, momentum, and friction. Weightless = lifeless.
4. **Asymmetry of attention.** Entrances need more energy than exits. The eye tracks what arrives; it releases what fades.
5. **One motion focus at a time.** If everything moves, nothing moves. Direct the eye by animating the signal while the context holds still.
6. **Density oscillation.** A video that stays at the same visual density throughout is monotonous — like music at one volume. Alternate between SPARSE frames (3 elements, vast emptiness) and DENSE frames (100+ elements, overwhelming complexity). The contrast between them is what communicates scale, creates visual rhythm, and prevents adaptation.

### Visual Density as a Compositional Tool

Density is not decoration — it IS the argument. When the narration says "fifty million," a frame with 55 nodes is not enough. The viewer should feel the scale viscerally through **density crescendo**: start with a small cluster, then FLOOD the frame with nodes until individual elements blur into a field.

**Cinematic terms for density:**

| Technique | Description | When to Use |
|---|---|---|
| **Density crescendo** | Progressive buildup from sparse to overwhelming | Scaling arguments ("troops → cities → empires") |
| **Tableau** | Complex, composed frame with many simultaneous elements | Peak-complexity moments that need to feel "full" |
| **Sparse anchor** | Deliberate near-empty frame | Immediately before or after dense moments (contrast) |
| **Background population** | Dim, small, distant clusters behind primary elements | "Every living thing" — universality through quantity |
| **Density shrink** | Many elements compress to smaller sizes as count increases | Suggesting scale beyond what can be rendered (millions) |

**Implementation patterns:**
- **Foreground nodes**: full size (7-8px), full opacity (0.85-0.9), glow filters
- **Background population nodes**: smaller (4-5px), dimmer (0.25-0.35 opacity), no boundary, later stagger timing
- **Density flood nodes**: even smaller (4-5px), moderate opacity (0.5-0.7), fast cascade stagger (0.3-0.8 frame offset per node)
- Use `shrink = 1 - densityPhase * 0.3` so nodes get smaller as more appear — implies continuation beyond the frame

**Density profile for a typical 3-minute act:**
- 2-3 sparse anchors (3-5 elements): emptiness as contrast
- 5-7 moderate density shots (15-50 elements): the baseline
- 2-3 dense peaks (80-200+ elements): scale, crescendo, culmination
- The densest frame should be 10-20x more complex than the sparsest

---

## Part 2: Remotion Animation System

A comprehensive motion pattern library for building animated explainer videos in Remotion. Organized by foundational principles, emotional registers, pattern categories, and scene composition.

### Foundational Principles

Six principles adapted from Disney's 12, UI motion design, and cinematic grammar — filtered for what matters in explainer animation:

**1. Anticipation → Action → Settle**
Every meaningful motion has three phases. A node about to move should *coil* slightly first (anticipation), execute the move (action), then overshoot and settle (follow-through). Without anticipation, motion feels robotic. Without settle, it feels unfinished.

**2. Squash & Stretch for Speed**
Objects compress along their movement axis when fast, stretch when decelerating. This is how the SVG skill's `scaleX: 0.05, scaleY: 4` trick works — asymmetric scaling implies velocity. Use subtly (5-15% deformation) for non-cartoony content.

**3. Secondary Action**
The primary motion (a node sliding into position) should trigger secondary reactions (connected arrows flex, nearby labels nudge slightly, a subtle ripple). Secondary action makes the scene feel *interconnected* rather than composed of independent elements.

**4. Staging**
The viewer's eye should always know where to look. Achieve this through contrast: the active element is bright/moving/large while everything else is dim/still/small. Before introducing a new element, *clear the stage* by settling or dimming current elements.

**5. Arc Motion**
Organic objects move in arcs, not straight lines. A diagram node flying from off-screen should curve slightly rather than travel in a perfect line. Straight-line motion reads as mechanical; arced motion reads as natural.

**6. Slow In, Slow Out**
Objects accelerate from rest and decelerate to rest. Never constant velocity (except for deliberate mechanical/robotic feel). In Remotion, this is handled by spring physics and easing — but be conscious of it when using `interpolate()` with custom ranges.

### Visual Property Encoding

Two principles for encoding meaning through visual properties rather than labels:

**Line Properties as Semantic Encoding**: A connection line's visual properties — width, dash pattern, opacity, glow, animation — should encode its NATURE, not just its existence. Validated examples from production:

| Visual Property | Encodes | Example |
|---|---|---|
| Thick line (3.5-5px) + edgeGlow | Amplified, powerful, dominant | "act" channel (4.5px, glow, traveling dots) |
| Thin line (1-1.6px) + dashed | Suppressed, invisible, dying | "ignore" channel (1.6px, dashed, fading gradient) |
| Wavy/sine path | Distortion, interpretation, transformation | "interpret" channel (wavy polyline) |
| Pulsing width (throbbing) | Emotional amplification, fear, urgency | "fear" channel (3.6px * throb) |
| Traveling dots along line | Active data flow, energy transfer | "act" channel (3 dots, fast speed) |
| No dots, zero dotSpeed | Dead channel, no energy flowing | "ignore" channel (dotSpeed: 0) |

**Shape Semantics**: When representing different regime types, node shapes, or institutional characters, assign polygon shapes deliberately. The shape encodes the institution's nature:

| Shape | Encodes | Example |
|---|---|---|
| Triangle (3 sides) | Hierarchical, spiritual, top-down | Religion hub |
| Square (4 sides) | Rigid, structured, rule-based | Law hub |
| Pentagon (5 sides) | Organic, independent, diverse | Philosopher nodes, dissenter nodes |
| Hexagon (6 sides) | Stable, distributed, mechanical | Currency hub, bank nodes, totem |
| Heptagon (7 sides) | Complex, centralized, multi-faceted | Priest hub (centralizing many roles) |
| Octagon (8 sides) | Machine, algorithmic, engineered | Algorithm hub, AI node |

The shape vocabulary compounds across videos — viewers learn to read institutional character from polygon count alone.

### Emotional Registers

Three spring presets mapped to narrative function. Use consistently so viewers internalize the motion language:

| Register | Narrative Role | Spring Character | Duration Feel |
|---|---|---|---|
| **Standard** | Normal builds, Structure Layer, neutral exposition | Moderate damping, moderate stiffness. Slight overshoot, smooth settle. | ~800ms-1.2s |
| **Tension** | Problem reveals, prediction errors, conflict, surprise | Low damping, high stiffness. Fast attack, visible overshoot/bounce. | ~400-700ms |
| **Resolve** | Insight delivery, reframe, resolution, the "click" | High damping, low stiffness. Slow, controlled, no bounce. Gravity. | ~1.2-2s |

A fourth register for special use:

| Register | Narrative Role | Character |
|---|---|---|
| **Ambient** | Background breathing, particle drift, idle loops | Very low stiffness, very high damping. Continuous, never fully settles. Keeps the frame alive. |

### Motion Pattern Library

#### Entry Patterns (How elements arrive)

| Pattern | Description | Use For |
|---|---|---|
| **Build-in** | Element enters from off-screen with physics (arced path, squash/stretch, settle) | Diagram nodes, icons, key visual elements |
| **Materialize** | Scale from 0 → 1 with slight overshoot, optionally with opacity | Elements appearing "in place" — labels, annotations, highlights |
| **Draw-on** | SVG stroke animates from 0% → 100% | Arrows, connections, flow lines, underlines |
| **Typewrite** | Characters appear sequentially | Key phrases, data labels, quotes |
| **Unfold** | Element expands from a line/point into its full form | Panels, comparison boxes, detail expansions |
| **Cascade** | Multiple elements enter in staggered sequence, each triggering the next | Lists, node groups, step-by-step sequences |
| **Emerge** | Slow opacity + slight upward drift from background | Ambient elements, background context, mood-setters |
| **Typography reframe** | Wrong text + strikethrough + dim, then larger correct text with spring resolve + glow + upward slide | Major argument pivots, reframes ("technology story" → "civilization story") |

#### Emphasis Patterns (How elements demand attention)

| Pattern | Description | Use For |
|---|---|---|
| **Pulse** | Brief scale up (105-110%) and return | Highlighting an element during narration reference |
| **Color shift** | Hue/saturation transition to semantic color | Signaling role change (neutral → tension, neutral → insight) |
| **Isolate** | Everything EXCEPT the target dims/shrinks/blurs | "Look at this" — the staging principle in action |
| **Outline flash** | Brief stroke/border appears and fades | Subtle pointer without breaking composition |
| **Scale contrast** | Target grows while surroundings shrink proportionally | Importance hierarchy — PolyMatter technique |
| **Shake/tremble** | Micro-jitter (1-2px random offset, 3-5 frames) | Instability, tension, "this is about to break" |
| **Strikethrough dismiss** | Tension line scaleX 0→1 across text, then text dims 70% | Wrong answers in negation-then-reveal, dismissed concepts |
| **Failed strikethrough** | Strikethrough starts drawing but dissolves before completing | Items that resist deletion — "the filter tried and couldn't" |
| **Boundary state shift** | Boundary transitions: dashed (soft limit) → solid (hard ceiling) → pulsing (pressure) → shatter (phase transition) | Encoding constraint evolution — the boundary's visual state IS the story |
| **Constraint tightening** | Feedback loop radius shrinks, vignette darkens, frame itself constrains | Entropy traps, tightening control loops, narrowing output space |

#### Transition Patterns (How concepts connect)

| Pattern | Description | Use For |
|---|---|---|
| **Morph** | Element A smoothly transforms shape/position into element B | Showing that A and B are related forms of the same thing |
| **Pan/Track** | Camera moves to reveal adjacent content in continuous space | Sequential concepts that coexist spatially |
| **Zoom drill** | Camera pushes into a detail, which becomes the next scene | Macro → micro narrative zoom |
| **Zoom reveal** | Camera pulls back to show element was part of larger whole | Micro → macro reframe (Kurzgesagt signature) |
| **Cross-dissolve** | Opacity crossfade between states | Soft time passage, state changes |
| **Layout reflow** | Elements reorganize their spatial arrangement | Argument structure shifts (comparison → synthesis) |
| **Wipe/reveal** | A surface sweeps across revealing new content beneath | Before/after, then/now contrasts |
| **Label crossfade** | Two labels rendered simultaneously with inverse opacity, transitioning over ~40 frames | "Transform, don't cut" applied to text — "SELECTING" smoothly becomes "INTERPRETING" |
| **Scale anchors** | Fixed-position number labels OUTSIDE the camera zoom transform | Grounding density crescendos in concrete scale ("50" → "50,000" → "50 Million") |

#### Exit Patterns (How elements leave)

| Pattern | Description | Use For |
|---|---|---|
| **Dissolve** | Opacity fade to 0 | Elements becoming irrelevant, gentle cleanup |
| **Collapse** | Scale to 0 (reverse of materialize) | Deliberate removal, "subtract to emphasize" |
| **Drift-out** | Gentle movement off-screen | Scene transitions, making room |
| **Absorb** | Element shrinks and moves into another element | Showing consolidation, things becoming part of something |
| **Dim-to-context** | Opacity drops to 20-30%, stays visible as background | Element is done being primary but remains as reference |
| **Extended silence** | Visual holds 3-5s after narration ends, no fadeOut, vignette intensifies | Video closers — the final frame IS what the viewer carries away |

#### Ambient Patterns (Background life)

| Pattern | Description | Use For |
|---|---|---|
| **Particle drift** | Small dots/shapes floating with slow random motion | Background atmosphere, Kurzgesagt aliveness |
| **Breathe** | Subtle scale oscillation (98-102%) on loop | Keeping elements alive when not actively animating |
| **Parallax** | Layered depth motion on camera move (foreground fast, background slow) | Depth illusion in 2D compositions |
| **Gradient shift** | Slow background color/gradient rotation | Mood evolution over long segments |
| **Scan line / grain** | Subtle noise or texture overlay | Exurb1a-style emotional texture |
| **Visual absence** | Render connections/structures that dissolve, reach but snap short, or exist only as ghost traces | Showing what ISN'T there — missing social layer, failed coordination, invisible infrastructure |

#### Pacing Patterns (How rhythm accelerates and decelerates)

| Pattern | Description | Use For |
|---|---|---|
| **Accelerating montage** | Pattern repeats N times with compressing intervals (1.8s → 1.4s → 1.0s → 0.7s → 0.5s). Later instances arrive "pre-doomed" — born dimmer, less ceremony, ghost of the outcome visible from frame 0 | Market learning, cascading consequences, inevitability |
| **Contagion wave** | Expanding circle that illuminates/converts nodes as it reaches them, ring by ring. Wave color matches the concept spreading | Consensus spreading, belief propagation, infection |
| **Cascade failure** | Chain reaction from a trigger node — each node dims/dies in order of proximity. Wave takes 40-60 frames to cross the canvas. Distinct from implosion (which is simultaneous) | Domino effects, contagion collapse, systemic failure |
| **Variable word spacing** | Words appear one at a time with MUSICAL intervals — shorter gaps for common words, longest holds for the key words. Deceleration toward the final word builds gravity | Closing statements, thesis lines, bookend typography |

### Timing Reference

| Action | Duration | Notes |
|---|---|---|
| Micro-interaction (pulse, flash) | 150-250ms | Must feel instant but not invisible |
| Element entry (build-in, materialize) | 400-1200ms | Depends on emotional register |
| Complex transformation (morph, reflow) | 800-2000ms | Viewer needs time to track the change |
| Scene transition (pan, zoom, wipe) | 600-1500ms | Faster = energetic, slower = contemplative |
| Stagger offset between cascade items | 50-150ms | Tighter = mechanical, wider = organic |
| Hold after entry before next action | 500-2000ms | Give the eye time to register. Minimum 500ms. |
| Element exit (dissolve, collapse) | 300-800ms | Exits faster than entries — asymmetry of attention |

### Scene Composition Patterns

How to orchestrate multiple patterns into coherent scenes:

**The Build Scene** (Structure Layer)
```
1. Background establishes (emerge, ambient)
2. Primary element enters (build-in, standard register)
3. Hold 1-2s for recognition
4. Connected elements cascade in (stagger, draw-on for connections)
5. Labels materialize near their elements
6. Brief hold for the complete picture
```

**The Tension Scene** (Problem/Conflict)
```
1. Current state visible (from previous scene, dimmed to context)
2. Disrupting element enters hard (build-in, tension register)
3. Existing elements react (shake, color shift to tension color)
4. Connections break or distort (draw-on in reverse, or stroke turns dashed)
5. Isolate the core conflict
```

**The Insight Scene** (Resolution)
```
1. Strip the canvas (collapse/dissolve non-essential elements)
2. The insight element materializes slowly (resolve register)
3. Long hold — simplest visual at highest signal moment
4. Color shifts to insight palette
5. New connections draw on, showing the resolution
6. Optional: zoom reveal to show bigger picture
```

**The Comparison Scene** (Evidence Layer)
```
1. Layout reflows into split/panel structure
2. Left side builds (cascade, standard register)
3. Right side builds (cascade, standard register)
4. Emphasis highlights the key difference (color shift, scale contrast)
5. Optional: morph both sides into a unified conclusion
```

**The Network Evolution Scene** (Signature Technique — carries across entire videos)
```
1. Existing network visible from previous scene (dim-to-context)
2. Transformation trigger: new element enters or a rule changes
3. Nodes rewire — connections dissolve and redraw to new targets (morph, draw-on)
4. Color shifts propagate through the network (cascade of color shifts)
5. New equilibrium: network settles into its new state
6. Labels update to name the new configuration
```

**The Dense Canvas Scene** (Visual Crescendo Peak)
```
1. Background establishes with elevated particle count (25-30)
2. Timeline/fabric lines draw at low opacity (depth scaffolding)
3. Primary hub elements build (standard register)
4. Each hub spawns 4-6 satellite population nodes (staggered cascade)
5. Population nodes connect to hubs with faint spokes (0.5px, 25% opacity)
6. Traveling flow dots animate along connections (constant motion)
7. Pattern-reveal overlay materializes on trigger word (dashed circles, vertical connections)
8. Hold the full density — this is the "screenshot frame"
```

The most information-dense frame in the act. Used for thesis moments, pattern-recognition beats, and establishing shots. Requires that adjacent scenes are significantly sparser — the contrast IS the impact.

**The Swarm Scene** (Crowd Shot)
```
1. 50-80 nodes cascade in rapidly (tight stagger, 0.3-0.5 frame offset)
2. Node sizes vary (3-8px range, hash-based) — NOT uniform
3. Mesh connections draw between nearby nodes (distance threshold)
4. 10-15 traveling data dots orbit between connected nodes along edges
5. Select nodes (every 7th) get faint ring orbits (rotating dashed circles)
6. Particle count elevated (28-30), particle color = insight cyan
7. No labels, no typography — the system IS the subject
```

The mesh should feel teeming with activity. Every element is small; the collective pattern is what the viewer reads. This is Primer's agent-simulation technique at macro scale.

**Ambient Spatial Anchoring** (Background layer for any scene)
```
1. Generate 2-3 layers of angular terrain/geometry at frame edges (bottom, sides)
2. Each layer uses pseudo-random vertex positions — angular, faceted, low-poly
3. Layer at decreasing opacity: front ~12%, mid ~8%, back ~5%
4. Use same geometric DNA as foreground (straight edges, angular vertices)
5. Optional: faint edge lines on front layer at ~20% opacity for faceted feel
6. Optional: nested low-poly shapes (pentagons, hexagons) as geometric scaffolding behind content
```

This operates below conscious attention — the viewer's brain uses it for spatial grounding (depth, ground plane, "I am somewhere") at zero conscious bandwidth cost. Removes the "floating in void" problem. Every scene benefits from this layer.

**The Contagion Wave Scene** (Consensus Spreading / Belief Propagation)
```
1. Central token/totem (insight hexagon) with breathing animation at center
2. 30-40 stranger nodes arranged in 3-4 concentric rings (r=120/220/340/440)
   — initially dim system-colored, unconnected
3. Expanding wave: 3 concentric circles ripple outward from center
4. When wave reaches a ring of nodes, those nodes illuminate (color shift to insight)
   and connections draw from center to each converted node
5. Concept rotation labels cycle above the token (e.g., "GOD" → "LAW" → "CURRENCY")
   — token color changes with each concept
6. Progressive density: inner ring first (6 nodes), then mid (10), then outer (14)
   — the network grows organically as the consensus spreads
```

The wave IS the consensus spreading — each ring of strangers converts when the belief reaches them. The progressive ring-by-ring illumination lets the viewer feel the expanding reach of shared fiction.

**The Cascade Failure Scene** (Sequential Collapse / Domino Effect)
```
1. 40-50 nodes visible (inherited from previous scene), all tension-colored
2. Single trigger node (top-left or edge position) dims first
3. Chain reaction propagates by PROXIMITY — each node dims in order of
   distance from trigger. Wave takes 40-60 frames to cross the full canvas
4. As each node dims: arrow fades, connections to that node snap (brief white flash)
5. The network goes dark region by region, not all at once
6. One element remains bright through the collapse (the filter/cause)
7. Final state: dark canvas, surviving element at center, ghost nodes at 8%
```

Distinct from Implosion (which is simultaneous contraction). Cascade is SEQUENTIAL — the viewer watches death spread through the network like a wave. The proximity-ordered propagation makes the failure feel physical, not abstract.

**The Attempted Formation Scene** (Hardware Ceiling / Structural Impossibility)
```
1. Sparse field of isolated nodes, each with a halo, drifting independently
2. Ghost structures attempt to form around/between nodes:
   — Grid lines build around a node then FADE before completing
   — Boundary fragments try to enclose 2+ nodes but DISSOLVE
   — Connection lines reach between nodes but SNAP SHORT at 40-50% reach
3. Each attempt uses fadeWindow() — ramps up, holds briefly, ramps down
4. Stagger attempts 40-60 frames apart for rhythm (cities → nations → economies)
5. After all attempts fail: nodes pulse larger (intelligence exists) but at desynchronized
   rates (each node's halo pulses at a different frequency — visible incoherence)
6. No text overlay for the failures — the visual impossibility IS the argument
```

Distinct from negation-then-reveal: those dismiss wrong ANSWERS (text). This dismisses wrong STRUCTURES — geometry that physically tries to form but can't because the hardware doesn't support it. The reach parameter (42% in production) should be precisely calibrated to feel like the connection ALMOST made it.

**The Convergence-to-Beam Scene** (Lightbulb → Laser / Power Consolidation)
```
1. 40-60 scattered fragments across the left portion of the frame
   — varied sizes (2.5-9px), varied polygon sides (3-5), hash-based positioning
   — "far" fragments smaller and dimmer (18+ of them)
2. All fragments move toward convergence point via interpolated progress
3. Fragments SHRINK by 40% as convergeProg increases (density compresses)
4. Fragments DIM to 10% opacity when convergence > 0.9 (individual identity dissolves)
5. Central power node grows at convergence point (tension-colored, edgeGlow)
6. Two expanding pulse rings around the power node
7. Output beam (thick insight line, 5px, edgeGlow) extends rightward from convergence
8. Final state: scattered energy → single focused beam
```

The literal lightbulb-to-laser animation. The fragment shrinking is key — it's not just repositioning, it's the individual nodes losing their identity as they join the collective. The beam emerges only after the convergence is near-complete. Use for any argument about power consolidation, attention routing, or coherence.

**The Bidirectional Flow Scene** (Accountability / Healthy System Dynamics)
```
1. 3 filter hubs at top (y=26%), each with pulse ring and label
2. 30-40 population nodes in columns below (y=50-74%), staggered entry
3. Social mesh: vertical (within-column) + horizontal (bridge) connections
4. DOWNWARD info flow: dashed lines + flow dots streaming from hubs to population
5. UPWARD accountability arrows: thick insight lines with arrowheads growing from
   population toward hubs. 3 verb labels: "argue", "pressure", "vote"
6. Rising flow dots travel upward along accountability arrows
7. Push pulse: on trigger word, all upward arrows pulse brighter and thicker
8. The bidirectionality IS the healthy state — two-way system with feedback
```

When only one direction remains (downward only), the system breaks. This scene establishes the "warm human world" baseline so that later scenes where the upward flow disappears hit harder.

**The Negation-Then-Reveal Scene** (Prediction Error Engine)
```
1. Wrong answer(s) appear with spring entry (system color, 38-48px)
2. Each wrong answer gets a tension-colored strikethrough (scaleX 0→1, 12-16 frames)
   — stagger strikethroughs 6-8 frames apart, NOT simultaneous
3. Each struck-through label dims to 30% but remains faintly visible
4. Brief pause (8-12 frames) — the canvas is emptied of wrong answers
5. Correct answer detonates: insight color, 56-96px, spring "resolve",
   scale 0.88→1.0, glow shadow, upward slide from 20px
6. Optional: expanding insight rings (3 concentric circles) on the reveal
```

The dismissed elements MUST stay dimly visible — the contrast between wrong and right IS the argument. Used for reframes ("technology story" → "civilization story"), suspense builds ("not fire, not weapons, not language" → "fiction"), and corrections.

**Variant — Failed Strikethrough**: For items that resist deletion (e.g., "physical work", "goal-setting", "accountability" in the hourglass act), the strikethrough line starts drawing but dissolves at 60-80% completion. The glow filter activates during the attempt. Visual argument: these things resist compression.

**The Typography Reframe Scene** (Argument Pivot)
```
1. Near-empty canvas (6-10 elements max, no terrain)
2. "Old frame" text appears: system color, 44-48px, weight 400
3. Tension strikethrough animates across (scaleX left→right, 12 frames)
4. Old text dims to 30%
5. "New frame" text reveals below with spring "resolve":
   — insight color, 56-62px, weight 300
   — upward slide from 20px
   — glow shadow (textShadow: 0 0 40px insightDim)
6. Font size escalation (48→62px) signals: this is bigger
7. Optional ghost from previous scene at 6% opacity for continuity
```

Validated across 6 instances in production: "technology story" → "civilization story", "manipulative" → "structural", "technology story" → "economics story", "better" → (dismissed), and others.

**The Crowd with Arrows Scene** (Diversity/Consensus Visualization)
```
1. 45-50 nodes scattered pseudo-randomly (hash-based positioning, 8-92% coverage)
2. Each node: polygon (3-6 sides), varied size (3-7px), unique angle
3. Each node has a directional arrow: line + arrowhead at unique angle
4. Staggered spring entry (1.0-1.5 frame intervals)
5. Ambient drift: each node moves slowly in its arrow's direction (0.2-0.3px/frame)
6. HEALTHY STATE: all arrows point different directions — diversity IS the thesis
7. THREAT STATE: arrows rotate toward consensus angle — diversity dying
8. Node color shifts system→tension as arrows align
9. Optional contrarian: one node (insight-colored) keeps its unique arrow, does NOT align
10. Optional error correction: opposing-arrow pairs briefly flash connections
```

The crowd's state encodes the argument: diverse arrows = healthy system, aligned arrows = correlated failure, one contrarian = the value of being differently wrong. Used for the capitalism thesis (errors cancel when diverse, compound when correlated).

**The Information Flow Scene** (Compression/Funnel)
```
1. Input dots stream from left edge (8-18 dots, system-colored, varied y-positions)
2. Processing stages appear left-to-right, each narrower (compression visible)
3. Filter membranes between stages (dashed tension lines, low opacity)
4. Traveling flow dots traverse the funnel — some get filtered out at each stage
5. Surviving dots change color/size as they pass through stages
6. Final stage spotlight: brightens while earlier stages dim
7. Stage labels appear below on narration trigger words
```

The visible compression — fewer dots surviving each stage — IS the argument. No chart needed. Used for media compression (newspapers → television → 3 networks), language processing, and attention routing.

**The Implosion Scene** (Correlated Failure)
```
1. N nodes arranged in a circle (r=160), all identical appearance
2. Shared constraint ring (dashed, inside the circle) connects all nodes
3. On trigger word: constraint ring pulses — all connected nodes pulse simultaneously
4. Nodes physically pull toward center (spring tension, r=160 → r=40, 25 frames)
5. Connections crumple. Nodes overlap and merge into dense mass at center
6. Collapse flash: expanding tension ring bursts outward from implosion point
7. Aftermath: single mass at center, 3 faint shockwave rings expanding
```

The simultaneity IS the argument — correlated means synchronized. The visual proves that identical inputs produce identical outputs.

---

## Part 3: Multi-Shot Composition & Cinematic Editing

Techniques for assembling individual scene components into a continuous, flowing composition. This is where the difference between a slideshow and a cinematic video lives.

### The Core Principle: Decouple Audio from Visual

Mediocre videos lock each shot as a unit: Audio N starts and ends with Visual N. The viewer's brain detects this "slideshow" rhythm within 30 seconds and engagement drops.

Cinematic videos treat audio and visual as **two independent layers**:
- **Audio layer**: narration clips placed sequentially at absolute frame positions (no gaps except deliberate section breaks)
- **Visual layer**: scenes positioned with offsets — some starting before their audio (L-cut), some after (J-cut), some mid-sentence

In Remotion, this means using explicit `<Sequence from={N}>` positioning instead of `<Series>`. Audio clips at their sequential positions, visual components at offset positions.

### Cinematic Transition Vocabulary

| Technique | What Happens | When to Use | Remotion Implementation |
|---|---|---|---|
| **J-Cut** | Audio of NEXT shot starts before visual transition | Temporal shifts, new context ("For most of history...") | `visualOffset: +6` — visual starts 6 frames after its audio |
| **L-Cut** | Visual of NEXT shot appears before audio transition | Visual foreshadowing, cause→effect ("the filter" → filter diagram) | `visualOffset: -14` — visual starts 14 frames before its audio |
| **Mid-Sentence Cut** | Visual changes on a stressed word inside a sentence | Continuous argument ("...you can personally track" → wolf pack) | `visualOffset: -12` — visual of next shot starts during final word of current audio |
| **Hard Cut** | Audio and visual switch together | Deliberate contrast, prediction errors, reframes | `visualOffset: 0` |
| **Section Breath** | Brief gap in audio timeline (15-20 frames) | Topic shifts between major argument sections | Gap in audio positions, visual fades through the gap |
| **Breathing Hold** | Visual holds static after audio ends | Key reveals that need time to land | `visualPad: 16-30` frames of extra visual duration after audio |

### Decision Framework: Which Cut Where

Not every transition should be the same. Match the cut to the narrative function:

- **Argument continues** (same idea, next example) → **L-cut** or **mid-sentence cut**. The visual change is the argument advancing.
- **New topic or reframe** → **Hard cut**. The clean break signals "we're changing direction."
- **Temporal shift** ("then...", "for most of history...") → **J-cut**. The voice leads the viewer's mind before the eye catches up.
- **Section boundary** (act change, topic category shift) → **Section breath**. Brief silence + visual fade gives the brain a processing beat.
- **Key insight landing** → **Breathing hold**. The visual stays static while the idea settles.

### Remotion Multi-Shot Architecture

#### The ShotDuration Context Pattern

When composing multiple shots into a single Remotion `<Composition>`, `useVideoConfig().durationInFrames` returns the TOTAL composition duration, not each shot's local duration. This breaks all duration-relative calculations (fadeOuts, animation phases, normalization).

**Solution:** React Context that overrides durationInFrames per shot:

```tsx
// ShotDuration.tsx
import { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";

export const ShotDurationCtx = createContext<number | undefined>(undefined);

export const useShotDuration = () => {
  const override = useContext(ShotDurationCtx);
  const { durationInFrames } = useVideoConfig();
  return override ?? durationInFrames;
};
```

Every scene wrapper (AtmoShell, CanvasShell, standalone components) should use `useShotDuration()` instead of destructuring `durationInFrames` from `useVideoConfig()`. When rendered standalone, the context is absent and falls back to the composition's duration. When inside a multi-shot composition, the Provider supplies the correct per-shot duration.

#### Composition Structure

```tsx
const Act1: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
    {/* Audio layer: clips at absolute positions */}
    {timeline.map((shot) => (
      <Sequence from={shot.audioStart} durationInFrames={shot.audioLen}>
        <Audio src={staticFile(`audio/${shot.audio}`)} />
      </Sequence>
    ))}

    {/* Visual layer: scenes at offset positions */}
    {timeline.map((shot) => (
      <Sequence from={shot.visualStart} durationInFrames={shot.visualDur}>
        <ShotDurationCtx.Provider value={shot.visualDur}>
          <AudioOffsetCtx.Provider value={shot.ao}>
            <shot.Component />
          </AudioOffsetCtx.Provider>
        </ShotDurationCtx.Provider>
      </Sequence>
    ))}
  </AbsoluteFill>
);
```

Two visual `<Sequence>` elements that overlap in time (by 6-15 frames) create a natural **cross-dissolve**: the outgoing scene fades out (opacity decreasing in its last 8 frames) while the incoming scene fades in (first 10 frames). Since both scenes share the same dark background color, the blend is seamless — no black gaps, no white flash.

#### The AudioOffset Context Pattern

When audio and visual layers are decoupled, each scene component needs to know: "how far into my audio has already played when my visual starts?" This offset determines where word-synced animations fire.

```tsx
// In the scene file
export const AudioOffsetCtx = createContext<number>(0);

// In the shell/wrapper component
const audioOffset = useContext(AudioOffsetCtx);
// Pass to children render function as `ao`
```

The `ao` value tells the scene:
- `ao > 0` → visual starts BEFORE audio (visual lead-in: atmosphere builds before voice)
- `ao < 0` → audio already in progress when visual starts (J-cut: past words already resolved)
- `ao = 0` → synchronized

For J-cuts, negative `ao` means `wf("word") + ao` returns a negative frame for words spoken before the visual started — those animations resolve to `prog = 1` at frame 0, meaning they're already complete when the visual appears. This is correct: the viewer heard those words during the previous visual.

#### Word-Level Timestamp Pipeline

For frame-perfect narration sync, transcribe each audio clip with word-level timestamps:

1. **Transcribe** via STT with `word_timestamps: true` — produces `[{word, start, end}]` per clip
2. **Store** as typed arrays in a timing data file (`Act2WordTiming.ts`)
3. **Look up** with the `wf()` helper: `wf(SHOT_016, "priests")` returns the frame when "priests" is spoken
4. **Apply audio offset** with the `makeWf()` wrapper:

```tsx
const makeWf = (words: WordTiming[], offset: number) =>
  (target: string) => wf(words, target) + offset;

// In scene:
const w = makeWf(SHOT_017, ao);
const fChurch = w("Catholic");  // frame when "Catholic" is spoken, adjusted for J-cut offset
```

This replaces hardcoded frame numbers (`rise(frame, 60, 90)`) with narration-synced timing. Every visual beat fires exactly when the narrator says the triggering word.

### Transition Timing Guidelines

| Element | Recommended | Notes |
|---|---|---|
| FadeIn duration | 10-12 frames (0.33-0.4s) | Snappy entrance |
| FadeOut duration | 12-14 frames (0.4-0.47s) | Slightly longer than fadeIn (exit = release) |
| L-cut overlap | 10-14 frames (0.33-0.47s) | Visual leads audio by half a second |
| J-cut delay | 6-8 frames (0.2-0.27s) | Audio leads visual by a quarter second |
| Section breath | 15-20 frames (0.5-0.67s) | Gap in audio timeline between major sections |
| Post-audio padding | 12 frames standard, 30 frames at section boundaries | Settling time after narration ends |

### Minimum Sizing at 1920x1080

At full HD, small elements become invisible. These are validated minimums:

| Element | Minimum Size | Notes |
|---|---|---|
| Monospace labels (shot tags) | 22px | Was 15-18px, too small for TV/fullscreen viewing |
| Semantic verb labels | 28-44px | Scale by importance hierarchy (act > fear > see > ignore) |
| Body text (quotes, phrases) | 28px minimum | Italic text needs larger size due to thin strokes |
| Large typography (reframes, reveals) | 56-96px | Scale words are the primary visual |
| Network nodes (SVG polygons) | 7px radius minimum | Below 5px, nodes vanish at normal viewing distance |
| Connection lines | 1.4px stroke minimum | Below 1px, lines disappear on many displays |
| Dim text opacity | 0.45 minimum for COLORS.textDim | Below 0.3, text is unreadable on dark backgrounds |
| Label opacity | 0.7 minimum | Labels at 0.5-0.6 look ghostly; 0.7+ reads as "subtle but present" |

### Scene Review Methodology

When reviewing a shot for cinematic quality, run these checks:

**1. Word-Level Visual Alignment**
Does each stressed word in the narration have a corresponding visual micro-event? In the best explainers, visual events fire on nearly every emphasized syllable. If the visual holds static for more than 2-3 seconds while the narrator is speaking, add an intermediate beat.

**2. Negation-Then-Reveal Pattern**
The most effective visual prediction error: show the wrong answer, dismiss it (strikethrough, dim, collapse), then reveal the correct answer with more visual ceremony. Works for reframes, corrections, and suspense builds.

**3. Internal Scene Arc**
Every scene should have its own micro-narrative — something tries and fails, builds to a threshold, or evolves through stages. A scene that shows a final state without a journey to get there is a diagram, not an animation.

**4. Complementarity Test**
Mute the audio: does the visual advance the argument on its own? Close your eyes: does the narration stand alone? Both should be yes. If the visual is just a shape with no semantic meaning, it fails.

**5. Dead Time Audit**
Calculate the ratio of static-frame time to total shot duration. If more than 30% of a shot's frames show a fully-built, unchanging visual, the shot needs more animation phases or a shorter duration.

### Proportional Word-Timing Estimation

When exact word-level timestamps aren't available (e.g., MCP transcription not feasible for local files), use proportional character-based analysis to estimate when specific words are spoken in a TTS narration clip:

1. **Split narration by sentences** (period, question mark) and by clauses (commas).
2. **Estimate pause durations**: ~0.3-0.5s for periods, ~0.15-0.25s for commas. TTS systems insert these consistently.
3. **Distribute remaining time** proportionally by character count within each sentence.
4. **Calculate cumulative character positions** to approximate word start times.
5. **Convert to frames**: `wordFrame = Math.round(estimatedSeconds * fps)`.

The key principle for animation timing: visuals should **lead audio by 0.3-0.8 seconds** (10-24 frames at 30fps). The viewer sees the symbol, then hears the word — the recognition "click" of prediction confirmed. Leading by 2+ seconds is too early; lagging behind audio is worse (the visual illustrates instead of anticipates).

For TTS audio specifically, pacing is very consistent within a sentence but varies between sentences. The proportional model is accurate to within ~0.5s for most words, which is sufficient for the 0.3-0.8s visual lead window.

### Ghost Object Bridging

The most reliable technique for visual continuity across hard cuts. The previous shot's key geometry persists into the next shot at low opacity, then fades as the new shot's content takes over.

**Opacity guidelines (validated from production):**

| Ghost Duration | Opacity | Use Case |
|---------------|---------|----------|
| First 20-40 frames | 15-25% | Strong bridge — viewer consciously sees the ghost (processing box → filter plane) |
| First 30-60 frames | 5-8% | Continuous thread — viewer subconsciously feels continuity (hourglass ghost across 8 shots) |
| Persistent | 3-6% | Canvas memory — faint ghost remains entire shot (ghost clusters recalling earlier acts) |

**Implementation pattern:**

```tsx
// Ghost of previous shot's geometry, fading out over 40 frames
const ghostOpacity = Math.max(0, 1 - rise(frame, 0, 40)) * 0.20;

<rect
  x={cx - ghostW / 2} y={cy - ghostH / 2}
  width={ghostW} height={ghostH}
  fill="none" stroke={COLORS.tension}
  strokeWidth={1} opacity={ghostOpacity}
/>
```

**Ghost object types validated in production:**
- **Geometry ghosts**: Previous shot's key shape (rect, boundary, hub) at reduced opacity
- **Network ghosts**: Previous shot's node positions at 5-8% opacity, fading in first 20 frames
- **Morphing ghosts**: Ghost that slides/reshapes from previous shot's form to next shot's form over 35 frames (e.g., processing box morphing into filter plane)
- **Callback ghosts**: Elements from much earlier (2+ acts ago) briefly flashing at 15-25% to trigger pattern recognition
- **Seed forward**: Subliminal hint of the NEXT act's content planted at 8% opacity in the final 30 frames of the current act (e.g., "who?" ghost text seeding Act 5's question from Act 4's ending). Complementary to backward-looking ghosts

### Continuous Canvas Thread

The most powerful technique for narrative cohesion. A single visual object evolves across multiple shots, carrying the argument forward. The viewer watches the SAME thing change meaning over time.

**Three validated implementations:**

**1. Evolving object** (Act 3: filter plane across 12 shots):
- Shot 028: Seed rect (4px wide, insight)
- Shot 029: Ghost of seed at 15% inside processing box
- Shot 030: Processing box morphs into tall filter plane
- Shot 035: Filter plane widens, becomes "the lens"
- Shot 039: Lens descends onto the crowd as compression layer
- Shot 042: Lens becomes civilization-spanning shadow at 8% opacity

Same visual DNA (tall rect at center), evolving width/color/opacity. The object IS the argument.

**2. Shared geometry function** (Act 4: hourglass across 8 shots):

```tsx
const hourglassPoints = (cx: number, height: number) => {
  // Returns consistent hourglass shape vertices
  // Every shot renders this at 4-6% opacity as a ghost
};

// In each shot:
const hgPts = hourglassPoints(cx, height);
<polyline points={hgPts} fill="none" stroke={COLORS.system} opacity={0.05} />
```

The hourglass appears as a ghost in every shot, taking on new meaning: network pinch → job loss bottleneck → attention aperture → economic stack. Same shape, new interpretation.

**3. Shared dataset** (Act 5: ecosystem nodes across 5 shots):

```tsx
const ecoNodes = () => [
  { id: "priests", shape: "triangle", color: COLORS.tension, x: 0.2, y: 0.3 },
  { id: "philosophers", shape: "pentagon", color: COLORS.system, x: 0.4, y: 0.25 },
  // ... 4 more nodes
];
const ECO_CONNECTIONS = [[0, 1], [1, 2], [2, 3], ...]; // 10 connections

// Every shot from 052-056 renders the same nodes and connections
// The canvas is never abandoned — it evolves through the conclusion
```

The ecosystem forms (052), demonstrates error correction (053), gets crushed by gravity (054), rebuilds with new diversity (055), and survives a final stress test (056). One canvas, five transformations.

### Particle Color Arc

Shift ambient particle color across shots to signal emotional phase changes below conscious attention. Plan the arc per act alongside the density arc.

**Act-level planning template:**

```
Shot: 043    044     045     046     047     048     049     050
Part: system tension system  tension tension tension insight tensionDim
Emo:  neutral strain  healthy danger   strain  strain  break   settling
```

The viewer FEELS the mood change without consciously noticing the particles shifted from steel blue to amber. Key transitions:
- `system → tension`: danger approaching, strain building
- `tension → insight`: breakthrough, resolution, hope
- `insight → tensionDim`: settling after insight, lingering unease
- Any sudden shift: emotional punctuation

**Implementation:** Pass `particleColor` to `SceneShell` (or the particles component):

```tsx
<SceneShell particleColor={COLORS.tension} particleCount={22}>
```

For detailed per-channel breakdowns, see [reference.md](reference.md).

---

## Part 4: Implementation Modules

All cinematic utilities are implemented as shared modules in `my-video/src/projects/the-filter/`. Import from these instead of defining local copies per scene.

### Module Map

| Module | Exports | Purpose |
|--------|---------|---------|
| `motion.ts` | `rise`, `recede`, `fadeWindow`, `springIn`, `springOut`, `springValue`, `anticipate`, `SPRING`, easing functions | Centralized animation primitives + spring presets for 3 emotional registers |
| `staging.tsx` | `stageFocus`, `stageScale`, `CompositionGrid`, `ProgressiveReveal`, `gridPos`, `gridStyle`, `GRID` | Focus direction, composition grid, progressive disclosure |
| `MorphBridge.tsx` | `morphEntry`, `morphExit`, `morphStyles`, `MorphShell` | Scene transition morphs (zoom, push, pull-focus, expand, dissolve) |
| `WorldCanvas.tsx` | `WorldCanvas`, `WorldObject`, `shotsToKeyframes` | Continuous canvas with camera panning/zooming between shots |
| `ShotDuration.tsx` | `ShotDurationCtx`, `useShotDuration`, `AudioOffsetCtx`, `useAudioOffset` | Per-shot duration + audio offset contexts (shared across all Acts) |
| `WordTiming.ts` | `WordTiming`, `wf`, `wfEnd`, `makeWf`, `estimateWordFrames` | Word-level narration sync utilities |
| `SceneShell.tsx` | `SceneShell` | Unified atmospheric wrapper integrating all of the above |

**Cinema Layer modules (planned — `my-video/src/shared/cinematics/`, project-agnostic, implementation pending):**

| Module | Planned Exports | Purpose |
|--------|-----------------|---------|
| `transitions.ts` | Extended `MorphMode` set: `wipe-linear`, `wipe-diagonal`, `wipe-radial`, `iris-in`, `iris-out`, `whip-pan`, `glitch`, `ink-bleed`, `paper-rip`, `shutter`, `light-flash`, `particle-dissipate`, `dolly-zoom`, `cross-zoom` — same entry/exit-style shape as `MorphBridge` | 11 charged transition modes for argument-beat cuts. See **Part 5.1** |
| `postfx.tsx` | `<FilmGrain>`, `<ChromaticAberration>`, `<LensFlare>`, `<LightLeak>`, `<Halation>`, `<ColorGradeLUT>` | Post-compositional SVG/CSS filter overlays. See **Part 5.2** |
| `threeD.tsx` | `<Perspective3D>`, `<ParallaxStack>`, `<CardFlip>`, `<PageTurn>`, `<TiltOnBeat>`, `<DollyPush>`, `<Truck>`, `<Pedestal>`, `<Crane>` | CSS-3D and camera-move wrappers. See **Part 5.3** |
| `handdrawn.tsx` | rough.js wrappers (delegates to `remotion-article-highlight` skill), `<BrushReveal>`, `<InkWashOverlay>`, `<CharcoalRender>` | Organic / hand-authored marks. See **Part 5.4** |
| `atmosphere.tsx` | `<GradientMesh>`, `<NoiseLayer>` / `<FilmGrainAmbient>`, `<PatternOverlay>`, `<GodRay>`, `<DynamicVignette>`, `<FrameBorder>` (per-register) | Background atmospheric overlays. See **Part 5.5** |
| `signatureMoves.ts` | `dossierCeremony`, `eraTransition`, `glitchRupture`, `archiveOpen`, `thesisLand` | Named choreography presets composing the above. See **Part 5.6** |
| `directorSignature.ts` | `DirectorSheet` type, `useDirectorTraits()` hook, sheet-diff CI helper | Channel-level directorial trait enforcement. See `video-content-strategy` → "The Director's Signature" |
| `lens.tsx` | `<Lens variant>`, `LENS_PERSONALITIES`, `EdgeBarrelDistortion`, `FullFrameBarrelDistortion` | First-class lens vocabulary — 5 canonical lenses. See **Part 5.8** |
| `metaCanvas.tsx` | `<VisibleGrid>`, `<ConstructionReveal>`, `<BrechtianLabel>`, `<MarginNote>`, `<IndexShot>` | Brechtian / self-acknowledging moves. See **Part 5.9** |
| `diegeticUI.tsx` | `<InWorldLabel>`, `<TerrainProgressBar>`, `<InWorldTimestamp>` | World-embedded UI. See **Part 5.10** |
| `recursive.tsx` | `<ShotSnapshot>`, `<PiP>`, `<MatchDissolveAcrossScales>`, `<DrosteFrame>` | Self-referential composition. See **Part 5.11** |
| `videoArcDrift.ts` | `<VideoArcProvider>`, `useVideoProgress()`, drift hooks (grain hue / vignette / grade / particle density / lens) | Continuous cross-video parameter drift. See **Part 5.12** |
| `registerInterpolation.ts` | `<RegisterBlend>`, `<ArtifactBlend>`, `<EraDrift>` (unidirectional enforcement) | Cross-register mid-shot slides. See **Part 5.13** |

Until these ship, build per-shot one-offs in the active project against the API names above so promotion is mechanical.

### Spring Presets (Emotional Registers)

Implemented in `motion.ts`. Use `springIn(frame, start, fps, register)` instead of `rise()` for entries that need physical weight.

```tsx
import { springIn, springOut, springValue, SPRING } from "./motion";

// Standard: diagram builds, neutral exposition (~800ms-1.2s)
const nodeEntry = springIn(frame, 30, fps, "standard");

// Tension: problem reveals, surprise, conflict (~400-700ms)
const shakeEntry = springIn(frame, 60, fps, "tension");

// Resolve: insight delivery, reframes (~1.2-2s)
const insightEntry = springIn(frame, 90, fps, "resolve");

// Ambient: background breathing, particle drift
const drift = springValue(frame, 0, fps, -2, 2, "ambient");
```

### Staging (Focus Direction)

Implemented in `staging.tsx`. Use `stageFocus()` to dim non-focal elements during key narration beats.

```tsx
import { stageFocus, stageScale } from "./staging";

// When focusFrame activates, "hub" stays bright; everything else dims to 25%
const focusFrame = frame > 60 ? 60 : null;
<polygon opacity={stageFocus(frame, focusFrame, id === "hub")} ... />
<polygon opacity={stageFocus(frame, focusFrame, id === "spoke")} ... />
```

### Morph Transitions

Implemented in `MorphBridge.tsx`. Replaces opacity-only crossfades with spatial morphs during scene overlaps.

Available modes: `dissolve`, `zoom`, `push-left`, `push-right`, `pull-focus`, `expand`.

```tsx
import { morphStyles } from "./MorphBridge";

// In a shell: compute combined entry/exit styles
const ms = morphStyles(frame, dur, 12, 10, fps, "zoom", "push-left");
<div style={{ opacity: ms.opacity, transform: ms.transform, filter: ms.filter }}>
  {/* scene content */}
</div>
```

### WorldCanvas (Continuous Canvas Camera)

Implemented in `WorldCanvas.tsx`. Wraps scenes in a world-space coordinate system with camera interpolation.

```tsx
import { WorldCanvas, WorldObject, shotsToKeyframes } from "./WorldCanvas";

<WorldCanvas keyframes={[
  { frame: 0,   x: 0,    y: 0,   scale: 1 },
  { frame: 90,  x: 1920, y: 0,   scale: 1 },     // pan right to scene B
  { frame: 180, x: 1920, y: 1080, scale: 1.5 },   // pan down + zoom into scene C
]}>
  <WorldObject x={0} y={0} width={1920} height={1080}>
    <SceneA />
  </WorldObject>
  <WorldObject x={1920} y={0} width={1920} height={1080}>
    <SceneB />
  </WorldObject>
</WorldCanvas>
```

### SceneShell (Unified Wrapper)

Implemented in `SceneShell.tsx`. Replaces per-file AtmoShell/CanvasShell/Act2Shell for new scenes.

```tsx
import { SceneShell } from "./SceneShell";

export const MyScene: React.FC = () => (
  <SceneShell
    particleColor={COLORS.tension}
    springFade
    fadeRegister="resolve"
    entryMode="zoom"
    exitMode="push-left"
    entryOverlap={12}
    exitOverlap={10}
  >
    {({ frame, width, height, dur, fps, ao }) => (
      <>
        {/* Scene content using frame, ao for word-synced timing */}
      </>
    )}
  </SceneShell>
);
```

### AudioOffset (Universal Narration Sync)

All three Acts now provide `AudioOffsetCtx`. Scenes access it via `useAudioOffset()`.

```tsx
import { useAudioOffset } from "./ShotDuration";
import { makeWf } from "./WordTiming";
import { SHOT_028 } from "./scenes/Act3WordTiming"; // when STT data exists

const ao = useAudioOffset();
const w = makeWf(SHOT_028, ao);
const buildFrame = w("monopoly"); // frame when "monopoly" is spoken, adjusted for J/L-cut
```

For scenes without STT data, use `estimateWordFrames()` for proportional timing:

```tsx
import { estimateWordFrames, makeWf } from "./WordTiming";

const narration = "Every transition followed the same pattern.";
const words = estimateWordFrames(narration, 3.22, 30);
const w = makeWf(words, ao);
```

### SVG Filter System (GlowFilters)

Implemented in `LowPoly.tsx`. Four named SVG filters for emphasis hierarchy plus two radial gradients. Include `<GlowFilters />` inside any SVG that uses glow effects.

```tsx
import { GlowFilters } from "./LowPoly";

<svg width={width} height={height}>
  <GlowFilters />
  <polygon points="..." fill={COLORS.tension} filter="url(#nodeGlow)" />
</svg>
```

| Filter ID | stdDeviation | Use For |
|-----------|-------------|---------|
| `nodeGlow` | 2 | Primary nodes — key actors, hubs, central elements |
| `edgeGlow` | 3.5 | Important connections, output beams, emphasis lines |
| `connGlow` | 1.5 | Connections, subtle emphasis, bypass arcs, aperture edges |
| `subtleGlow` | 5 | Background glow effects, breaker nodes, soft halos |

Radial gradients: `centerGlow` (system blue, 40% center → 0% edge) and `tensionGlow` (amber, 30% → 0%). Apply via `fill="url(#centerGlow)"` on circles for hub glow effects.

Also in `LowPoly.tsx`:

```tsx
import { polyPoints, facetedBoundary, terrainPoints } from "./LowPoly";

// Low-poly polygon node (angular, jittered vertices)
const pts = polyPoints(cx, cy, radius, sides, rotation, seed);
<polygon points={pts} fill={color} />

// Faceted boundary (angular constraint ring around a cluster)
const boundary = facetedBoundary(cx, cy, radius, sides);
// Returns [{x, y}, ...] — connect with line segments

// Terrain silhouette (angular pseudo-random terrain line)
const terrain = terrainPoints(width, baseY, segments, amplitude, seed);
// Returns [{x, y}, ...] — connect with path for angular terrain fill
```

### Scene Utility Functions

Common helpers used across scenes. Define these at the top of scene files or extract to a shared utilities module.

```tsx
// Breathing oscillation — keeps nodes alive
const breathe = (frame: number, speed = 0.04, amp = 3) =>
  Math.sin(frame * speed) * amp;

// Pulsing opacity — ambient life for connections and rings
const pulseOp = (frame: number, base = 0.6, amp = 0.3, speed = 0.05) =>
  base + Math.sin(frame * speed) * amp;

// Deterministic pseudo-random hash — stable per-node positioning
const hash = (i: number) => ((i + 1) * 2654435761) >>> 0;

// Hash-based scatter positions — distribute nodes across the frame
const scatterPos = (i: number, w: number, h: number, margin = 0.08) => ({
  x: margin * w + ((hash(i) % 10000) / 10000) * w * (1 - 2 * margin),
  y: margin * h + ((hash(i * 7 + 3) % 10000) / 10000) * h * (1 - 2 * margin),
});

// Cloud positions — cluster nodes around a center point
const cloudPositions = (
  cx: number, cy: number, count: number, spread: number, seed: number,
) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + seed;
    const r = spread * (0.4 + 0.6 * ((hash(seed * 100 + i) % 100) / 100));
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
```

### Shot Config + Timeline Template

The declarative shot config system is the backbone of every act. Copy this template to start a new act composition.

```tsx
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ShotDurationCtx, AudioOffsetCtx } from "./ShotDuration";
import { COLORS } from "./theme";

const AUDIO_DIR = "projects/<project>/assets/audio";
const FPS = 30;
const SECTION_GAP = 20;

type ShotConfig = {
  id: string;
  Component: React.FC;
  audioSec: number;
  audio: string;
  visualOffset: number;   // negative = L-cut (visual leads), positive = J-cut (audio leads)
  visualPad: number;       // extra visual frames after audio ends
  sectionEnd?: boolean;    // adds SECTION_GAP after this shot
  postGap?: number;        // additional audio gap (e.g. dramatic pause)
};

const shotConfigs: ShotConfig[] = [
  // L-cut: filter diagram fades in before narration
  { id: "shot-001", Component: MyScene, audioSec: 11.8, audio: "shot-001.wav",
    visualOffset: -14, visualPad: 12 },
  // J-cut: narration plays over lingering previous visual
  { id: "shot-002", Component: NextScene, audioSec: 7.8, audio: "shot-002.wav",
    visualOffset: 8, visualPad: 12 },
  // Hard cut: reframe needs clean break
  { id: "shot-003", Component: Reframe, audioSec: 11.5, audio: "shot-003.wav",
    visualOffset: 0, visualPad: 18, sectionEnd: true },
];

type ComputedShot = ShotConfig & {
  audioStart: number; audioLen: number;
  visualStart: number; visualDur: number; ao: number;
};

function computeTimeline(configs: ShotConfig[]): ComputedShot[] {
  let cursor = 0;
  return configs.map((cfg) => {
    const audioStart = cursor;
    const audioLen = Math.ceil(cfg.audioSec * FPS);
    const visualStart = audioStart + cfg.visualOffset;
    const visualDur = audioLen + cfg.visualPad - cfg.visualOffset;
    const ao = -cfg.visualOffset;
    cursor += audioLen;
    if (cfg.postGap) cursor += cfg.postGap;
    if (cfg.sectionEnd) cursor += SECTION_GAP;
    return { ...cfg, audioStart, audioLen, visualStart, visualDur, ao };
  });
}

const timeline = computeTimeline(shotConfigs);

export const ACT_DURATION = Math.max(
  ...timeline.map((s) => s.audioStart + s.audioLen),
  ...timeline.map((s) => s.visualStart + s.visualDur),
);

export const MyAct: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
    {/* Audio layer */}
    {timeline.map((shot) => (
      <Sequence key={`a-${shot.id}`} from={shot.audioStart} durationInFrames={shot.audioLen}>
        <Audio src={staticFile(`${AUDIO_DIR}/${shot.audio}`)} />
      </Sequence>
    ))}
    {/* Visual layer */}
    {timeline.map((shot) => (
      <Sequence key={`v-${shot.id}`} from={shot.visualStart} durationInFrames={shot.visualDur}>
        <AbsoluteFill>
          <ShotDurationCtx.Provider value={shot.visualDur}>
            <AudioOffsetCtx.Provider value={shot.ao}>
              <shot.Component />
            </AudioOffsetCtx.Provider>
          </ShotDurationCtx.Provider>
        </AbsoluteFill>
      </Sequence>
    ))}
  </AbsoluteFill>
);
```

Key relationships:
- `visualStart = audioStart + visualOffset` — when the visual Sequence begins
- `visualDur = audioLen + visualPad - visualOffset` — total visual duration
- `ao = -visualOffset` — stored in context so scenes know their audio offset
- Negative `visualOffset` = L-cut (visual starts early, `ao` is positive in context)
- Positive `visualOffset` = J-cut (audio starts early, `ao` is negative in context)
- `sectionEnd` inserts silence between major argument sections
- `postGap` inserts a dramatic pause after a single shot

---

## Part 5: Cinematic Effects Implementation

The *how* layer for the Cinema-Layer vocabulary locked in `video-content-strategy`. Companion to Part 4. Each effect has a code sketch, performance note, composition pattern (where it sits in the SceneShell / Canvas / Artifact stack), and a cross-reference to the strategy section that justifies it.

All target paths are `my-video/src/shared/cinematics/` (project-agnostic from day one). Until the shared module ships, do per-shot one-offs in the active project using the API names below — promotion is mechanical when the module lands.

The 6 strategy primitives still apply: every Cinema-Layer effect must pass the extended complementarity test ("does removing this lose information OR signature?"). Decoration is forbidden. See `video-content-strategy` → "The Three-Layer Architecture" → "Cinema-Layer complementarity test."

### 5.1 Transitions (planned `transitions.ts`)

The current `MorphMode` set in `MorphBridge.tsx` covers 6 *neutral* transitions (`dissolve`, `zoom`, `push-left`, `push-right`, `pull-focus`, `expand`). Part 5.1 specifies the 11 *charged* transitions added by `transitions.ts`. Each function follows the existing `morphEntry(frame, overlapFrames, fps, mode, register)` and `morphExit(frame, dur, overlapFrames, fps, mode, register)` shape so it drops into the existing `MorphShell` and `SceneShell` props.

**Default rule:** if you can't justify a charged transition, use a neutral one. Charged transitions earn one or two uses per video each. See `video-content-strategy` → "Transition Vocabulary" for the full when-to-use table.

#### 5.1.1 Wipe (linear / diagonal / radial)

```tsx
// Entry: clip-path wipes from edge to edge revealing the new shot
case "wipe-linear": {
  const x = (1 - p) * 100;       // 100% → 0% (right-to-left wipe-in)
  return { opacity: 1, transform: "none",
           clipPath: `inset(0 ${x}% 0 0)` };
}
case "wipe-diagonal": {
  const a = (1 - p) * 141;       // 141% covers a 45° diagonal at any aspect
  return { opacity: 1, transform: "none",
           clipPath: `polygon(0 0, ${100-a}% 0, ${-a}% 100%, 0 100%)` };
}
case "wipe-radial": {
  const r = p * 75;              // 0% → 75% expanding circle
  return { opacity: 1, transform: "none",
           clipPath: `circle(${r}% at 50% 50%)` };
}
```

- **Performance:** `clip-path` is GPU-cheap. Safe at 30fps for full-frame wipes.
- **Composition:** Apply to the *entering* shot's root `<AbsoluteFill>`. The exiting shot doesn't need a matching clip — the new one paints over it.
- **Strategy:** *video-content-strategy* → Transition Vocabulary → Wipe row.

#### 5.1.2 Iris (in / out)

```tsx
case "iris-in": {                 // closing aperture (focus narrowing to a point)
  const r = (1 - p) * 75;        // 75% → 0%
  return { opacity: 1, transform: "none",
           clipPath: `circle(${r}% at 50% 50%)` };
}
case "iris-out": {                // opening aperture (reveal from a point)
  const r = p * 90;              // 0% → 90%
  return { opacity: 1, transform: "none",
           clipPath: `circle(${r}% at 50% 50%)` };
}
```

- **Performance:** GPU-cheap (same as wipe).
- **Composition:** Iris-out on hero artifact entrances (Bourdieu plate appears from a point at the seal); iris-in to dismiss a shot toward a single artifact that then carries forward.
- **Strategy:** Iris row.

#### 5.1.3 Whip-pan

```tsx
// 6-10 frame combined translate + blur sweep
case "whip-pan": {
  const sign = direction === "right" ? 1 : -1;
  const x = (1 - p) * 100 * sign;   // entering from off-screen
  const blur = (1 - p) * 24;        // motion blur peaks at start of entry
  return { opacity: p, transform: `translateX(${x}vw)`,
           filter: blur > 0.1 ? `blur(${blur}px)` : "none" };
}
// Mirror on exit: translate the outgoing shot the opposite direction with matching blur
```

- **Performance:** `filter: blur()` is the expensive part — limit overlap window to ≤10 frames.
- **Composition:** Pair entry+exit with `entryOverlap === exitOverlap` so the blur peaks line up. The whip-pan IS the cut — surrounding shots can be otherwise neutral.
- **Strategy:** Whip-pan row.

#### 5.1.4 Glitch / RGB-split

```tsx
// Combine SVG feColorMatrix channel offsets + feDisplacementMap flicker
const Glitch: React.FC<{ frame: number; intensity: number }> = ({ frame, intensity }) => (
  <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <defs>
      <filter id="rgbSplit">
        <feOffset in="SourceGraphic" dx={intensity * 4} dy="0" result="r" />
        <feOffset in="SourceGraphic" dx={-intensity * 4} dy="0" result="b" />
        <feColorMatrix in="r" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rOnly" />
        <feColorMatrix in="b" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bOnly" />
        <feMerge><feMergeNode in="rOnly" /><feMergeNode in="bOnly" /></feMerge>
      </filter>
    </defs>
  </svg>
);
// Triggered as 4-8 frame burst with rapidly oscillating intensity (use Math.sin(frame * 3))
```

- **Performance:** Heavy. Limit to 4-8 frame bursts only — never sustained.
- **Composition:** Apply as an overlay layer above the entire frame during the rupture window. Reset to none immediately after.
- **Strategy:** Glitch row. Use ONLY on prediction-error ruptures, AI-era discontinuity, or system-failure beats.

#### 5.1.5 Ink-bleed / Brush-wipe

```tsx
// SVG mask with PNG brush atlas — animate the mask transform
<svg style={{ position: "absolute", inset: 0 }}>
  <defs>
    <mask id="brushMask">
      <image href={staticFile("cinematics/brush-atlas-1.png")}
             x={(1 - p) * -100} y="0" width={width * 1.4} height={height}
             preserveAspectRatio="xMidYMid slice" />
    </mask>
  </defs>
  <foreignObject x="0" y="0" width={width} height={height} mask="url(#brushMask)">
    {/* the entering shot rendered inside */}
  </foreignObject>
</svg>
```

- **Performance:** `<mask>` with PNG image is moderate; pre-cache the brush atlas in `staticFile`. Safe for 20-30 frame windows.
- **Composition:** The brush atlas is a single PNG with multiple stroke shapes (generated once via gpt-image-2 with a STYLE block matching Register B's ink character). Reusable across the whole project.
- **Strategy:** Ink-bleed row. Pairs with Register B plate entrances. Cross-reference: §5.4 (hand-drawn) for the brush atlas generation.

#### 5.1.6 Paper-rip / Tear

```tsx
// Animated SVG path mask with jagged edge
const tearPath = (p: number, height: number) => {
  // p drives the rip's horizontal advance; jagged y-offsets are deterministic per-y
  const seg = 18;
  const pts: string[] = [];
  for (let i = 0; i <= seg; i++) {
    const y = (i / seg) * height;
    const jitter = ((i * 7919) >>> 0) % 30 - 15;
    const x = p * 100 + jitter;     // % across the frame
    pts.push(`${x}% ${y}px`);
  }
  return `polygon(0 0, ${pts.join(", ")}, 0 100%)`;
};

// Apply as clip-path on the outgoing shot; entering shot beneath it
const styles = { clipPath: tearPath(rise(frame, 0, overlap), height) };
```

- **Performance:** GPU-cheap (clip-path with polygon).
- **Composition:** The torn-off layer can also slightly rotate as it peels (`rotate(${p * 3}deg)`) for paper-physics feel.
- **Strategy:** Paper-rip row. Pairs with archive-register entry.

#### 5.1.7 Shutter / Blink

```tsx
// Brief frame-wide black flash
case "shutter": {
  // p ramps 0→1 over overlap window; we want 0→1→0 inside that window
  const flash = Math.sin(p * Math.PI);  // 0 → 1 → 0
  return { opacity: 1, transform: "none", filter: "none",
           overlay: `rgba(0,0,0,${flash})` };  // applied as separate <AbsoluteFill> layer
}
```

- **Performance:** Trivial. Just an `<AbsoluteFill>` with springed opacity.
- **Composition:** Shutter is *softer* than a section breath — it's a visible blink, not 20 frames of darkness. Use between minor topic shifts.
- **Strategy:** Shutter row.

#### 5.1.8 Light-flash

```tsx
// Bright radial overlay, peaks then fades
const flash = Math.sin(p * Math.PI);  // 0 → 1 → 0
return (
  <AbsoluteFill style={{
    background: `radial-gradient(circle at 50% 50%,
                  rgba(255, 245, 220, ${flash * 0.85}) 0%,
                  rgba(255, 245, 220, ${flash * 0.4}) 30%,
                  rgba(255, 245, 220, 0) 70%)`,
    mixBlendMode: "screen",
    pointerEvents: "none",
  }} />
);
```

- **Performance:** Trivial CSS gradient.
- **Composition:** Pair with mild `chromaticAberration` for 4-6 frames at the peak (light-bloom + lens character). Use the project's warm tone, not pure white, to stay on-palette.
- **Strategy:** Light-flash row. THE THESIS-LANDING transition. One or two per video maximum.

#### 5.1.9 Particle-dissipate

```tsx
// Inherit positions from the exiting frame's elements; drift them outward and fade
type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string };
const seedFromExitingScene = (sceneNodes: NodeRef[]): Particle[] => sceneNodes.map(n => ({
  x: n.x, y: n.y,
  vx: (hash(n.id) - 0.5) * 8,        // -4 to 4 px/frame drift
  vy: (hash(n.id + "y") - 0.5) * 8,
  size: n.size * 0.4,
  color: n.color,
}));
// Render as <circle> elements with springValue(frame, 0, fps, 1, 0) opacity
```

- **Performance:** Cheap if the exiting scene has <50 nodes. For dense scenes, sample down.
- **Composition:** This requires the exiting scene to expose its node positions (a per-scene `useImperativeHandle` or a shared scene-state context). For one-offs, hand-author 20-40 particle seeds at scene-end positions.
- **Strategy:** Particle-dissipate row.

#### 5.1.10 Dolly-zoom (Vertigo)

```tsx
// Two layers with opposing scale springs — foreground stays put, background scales
<AbsoluteFill style={{
  transform: `scale(${1 + p * 0.4})`,  // background scales up 40%
}}>
  <BackgroundLayer />
</AbsoluteFill>
<AbsoluteFill style={{
  transform: `scale(${1 - p * 0.04})`, // foreground compensates slightly
}}>
  <ForegroundLayer />
</AbsoluteFill>
```

- **Performance:** GPU-cheap (just scale transforms).
- **Composition:** Requires a foreground/background split — usually a single hero element vs the rest of the canvas. Not all shots have this; reserve dolly-zoom for shots structured for it.
- **Strategy:** Dolly-zoom row. THE REFRAME transition.

#### 5.1.11 Cross-zoom

```tsx
// Outgoing layer scales up + fades out; incoming layer scales up from small + fades in
const exitStyle = {
  transform: `scale(${1 + p * 0.4})`,
  opacity: 1 - p,
};
const entryStyle = {
  transform: `scale(${0.7 + p * 0.3})`,
  opacity: p,
};
// Both layers rendered in same Sequence overlap window
```

- **Performance:** GPU-cheap.
- **Composition:** Best between major argument sections (act-to-act bridges). The momentum carried across a charged scale gives the "we're going somewhere" feel.
- **Strategy:** Cross-zoom row.

### 5.2 Post-processing (planned `postfx.tsx`)

Each post-fx component is an `<AbsoluteFill>` overlay with `pointerEvents: none` that sits ABOVE the SceneShell content but BELOW the transition layer. Composition order in `SceneShell`:

```
<SceneShell>
  Canvas + Artifact (children)        ← argument & era
  <PostFXStack>                       ← grain, aberration, halation, color grade
    <FilmGrain intensity={...} />
    <ColorGradeLUT register={...} />
    <Halation intensity={...} />
  </PostFXStack>
  <Transition mode={...} />           ← wipe / iris / etc, top of stack
</SceneShell>
```

#### 5.2.1 Film grain (SVG turbulence)

```tsx
const FilmGrain: React.FC<{ intensity?: number; speed?: number }> = ({
  intensity = 0.06, speed = 1,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame * speed) % 100;
  return (
    <svg style={{ position: "absolute", inset: 0, pointerEvents: "none",
                  mixBlendMode: "overlay", opacity: intensity }}>
      <filter id={`grain-${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9"
                      numOctaves="2" seed={seed} />
        <feColorMatrix values="0 0 0 0 0.5
                                0 0 0 0 0.5
                                0 0 0 0 0.5
                                0 0 0 1 0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
    </svg>
  );
};
```

- **Performance:** Moderate. `feTurbulence` is the most expensive SVG primitive — keep `intensity` ≤ 0.10 and pre-render if doing batch exports. For ambient grain, regenerate seed every 2-4 frames (not every frame) to reduce cost.
- **Composition:** Wrap above SceneShell content. Tie intensity to particle color arc — `system` beats use 0.04, `tension` beats 0.08, peak ruptures 0.10.
- **Strategy:** *video-content-strategy* → Atmosphere Vocabulary → Film grain row + intensity scale.

#### 5.2.2 Chromatic aberration

```tsx
const ChromaticAberration: React.FC<{ offset?: number }> = ({ offset = 2 }) => (
  <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <defs>
      <filter id="ca">
        <feOffset in="SourceGraphic" dx={offset} dy="0" result="r" />
        <feOffset in="SourceGraphic" dx={-offset} dy="0" result="b" />
        <feColorMatrix in="r" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" result="rO" />
        <feColorMatrix in="b" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 0.5 0" result="bO" />
        <feMerge><feMergeNode in="rO" /><feMergeNode in="SourceGraphic" /><feMergeNode in="bO" /></feMerge>
      </filter>
    </defs>
  </svg>
);
// Note: actual aberration needs a target — apply via filter property on a wrapper,
// or use CSS filter approach: filter: drop-shadow(2px 0 red) drop-shadow(-2px 0 blue)
// The CSS approach is far cheaper for full-frame use.
```

- **Performance:** SVG approach is heavy. Use the **CSS approach** for full-frame: `filter: drop-shadow(${offset}px 0 rgba(255,0,0,0.3)) drop-shadow(-${offset}px 0 rgba(0,100,255,0.3))` on the SceneShell wrapper.
- **Composition:** Animate offset 0 → 4 → 0 over a glitch beat (4-8 frames). Never sustained.
- **Strategy:** Glitch / RGB-split row (5.1.4) and per-shot rupture beats.

#### 5.2.3 Halation (warm bloom around bright areas)

```tsx
// SVG filter: blur the bright pixels, tint warm, composite back
<filter id="halation">
  <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   1 1 1 0 -2"
                 result="bright" />
  <feGaussianBlur in="bright" stdDeviation="8" result="blurred" />
  <feColorMatrix in="blurred"
                 values="1 0 0 0 0.6   0 0 0 0 0.3   0 0 0 0 0.1   0 0 0 0.6 0"
                 result="warm" />
  <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="warm" /></feMerge>
</filter>
```

- **Performance:** Heavy (Gaussian blur over the full frame). Use sparingly — light-flash beats and hero artifact reveals only.
- **Composition:** Apply as a `filter:` on a wrapper around the artifact (not the whole frame) when possible — much cheaper.
- **Strategy:** Light-flash row (5.1.8); Atmosphere → god-ray.

#### 5.2.4 Light leak

```tsx
// Animated radial gradient at frame edge, warm tones, drifts slowly
const LightLeak: React.FC<{ corner?: "tl" | "tr" | "bl" | "br"; intensity?: number }> = ({
  corner = "tl", intensity = 0.18,
}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.01) * 5;
  const positions = {
    tl: `circle at ${0 + drift}% ${0 - drift}%`,
    tr: `circle at ${100 - drift}% ${0 + drift}%`,
    bl: `circle at ${0 + drift}% ${100 - drift}%`,
    br: `circle at ${100 - drift}% ${100 + drift}%`,
  };
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(${positions[corner]},
                    rgba(232, 145, 58, ${intensity}) 0%,
                    rgba(232, 145, 58, 0) 40%)`,
      mixBlendMode: "screen",
      pointerEvents: "none",
    }} />
  );
};
```

- **Performance:** Trivial. CSS gradient with `mixBlendMode: screen`.
- **Composition:** Use the project's `tension` color (`#E8913A`) for warm leaks, never raw orange or yellow. One per scene maximum or it becomes wallpaper.
- **Strategy:** Atmosphere → god-ray row.

#### 5.2.5 Color-grade LUT (CSS filter chain)

```tsx
const REGISTER_GRADES = {
  default:   { hueRotate: 0,    saturate: 1.0, contrast: 1.0, brightness: 1.0 },
  archive:   { hueRotate: -8,   saturate: 0.85, contrast: 1.05, brightness: 0.95 },  // Register B (warm sepia)
  terminal:  { hueRotate: 4,    saturate: 0.9,  contrast: 1.15, brightness: 0.92 },  // Register C (cool digital)
  rupture:   { hueRotate: 0,    saturate: 1.3,  contrast: 1.2,  brightness: 1.05 },  // glitch / tension peak
  insight:   { hueRotate: 8,    saturate: 1.1,  contrast: 1.05, brightness: 1.05 },  // resolution beat
};

const ColorGradeLUT: React.FC<{ register: keyof typeof REGISTER_GRADES; transitionFrames?: number }> = ({
  register, transitionFrames = 30,
}) => {
  const g = REGISTER_GRADES[register];
  return { filter: `hue-rotate(${g.hueRotate}deg) saturate(${g.saturate})
                    contrast(${g.contrast}) brightness(${g.brightness})` };
};
```

- **Performance:** CSS `filter` chain is GPU-accelerated and cheap. Safe for full-frame use throughout.
- **Composition:** Apply as the wrapper style on SceneShell. Animate between registers when shot transitions cross a register boundary (interpolate each value).
- **Strategy:** *video-content-strategy* → Cinema Layer ownership rules → "Color grading."

### 5.3 3D wrappers (planned `threeD.tsx`)

All components rely on CSS `transform-style: preserve-3d` and `perspective`. Default perspective distance: 2000px (subtle, photographic). Lower values (800-1200px) feel more dramatic and toy-like.

#### 5.3.1 Perspective3D — wrapper for tilt-on-axis

```tsx
const Perspective3D: React.FC<{
  rotateX?: number; rotateY?: number; rotateZ?: number;
  perspective?: number; children: React.ReactNode;
}> = ({ rotateX = 0, rotateY = 0, rotateZ = 0, perspective = 2000, children }) => (
  <div style={{ perspective: `${perspective}px`, perspectiveOrigin: "center" }}>
    <div style={{
      transformStyle: "preserve-3d",
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
    }}>
      {children}
    </div>
  </div>
);
```

- **Performance:** GPU-cheap.
- **Composition:** Wrap individual artifact elements (not the whole frame). The "this card sits on a desk" feel comes from `rotateY={6} rotateX={-3}` — small angles read as photographed; large angles read as toys.
- **Strategy:** *video-content-strategy* → 3D / Spatial Move Vocabulary → Perspective wrapper row.

#### 5.3.2 ParallaxStack — multi-Z depth drift

```tsx
const ParallaxStack: React.FC<{
  layers: Array<{ z: number; children: React.ReactNode }>;
  cameraX?: number; cameraY?: number;
}> = ({ layers, cameraX = 0, cameraY = 0 }) => (
  <>
    {layers.map((l, i) => (
      <AbsoluteFill key={i} style={{
        transform: `translate3d(${-cameraX * l.z}px, ${-cameraY * l.z}px, 0)`,
        zIndex: Math.round(l.z * 10),
      }}>
        {l.children}
      </AbsoluteFill>
    ))}
  </>
);

// Usage: drive cameraX from frame
const cameraX = interpolate(frame, [0, dur], [0, 200]);
// terrain at z=0.3, mid-ground at z=0.7, foreground at z=1.0 — closer = moves more
```

- **Performance:** Trivial (just translates).
- **Composition:** Pair with `<DollyPush>` or `<Truck>` for natural camera moves. The ParallaxStack handles the depth; the camera component handles the move.
- **Strategy:** Depth parallax row.

#### 5.3.3 CardFlip — register transition

```tsx
const CardFlip: React.FC<{
  flipFrame: number;       // when to start the flip
  duration?: number;       // frames to complete
  front: React.ReactNode;  // shown 0° → 90°
  back: React.ReactNode;   // shown 90° → 180°
}> = ({ flipFrame, duration = 24, front, back }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, flipFrame, fps, "standard");
  const angle = p * 180;
  return (
    <div style={{ perspective: 1600 }}>
      <div style={{
        transformStyle: "preserve-3d",
        transform: `rotateY(${angle}deg)`,
      }}>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>{front}</div>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden",
                       transform: "rotateY(180deg)" }}>{back}</div>
      </div>
    </div>
  );
};
```

- **Performance:** Cheap. Spring-driven `rotateY` is GPU.
- **Composition:** Use to flip a Canvas-Layer placeholder card to its Artifact-Layer back face — the *act* of flipping IS the register transition.
- **Strategy:** Card flip row.

#### 5.3.4 PageTurn — sequential reveal across pages

```tsx
// More physics than a CardFlip — uses an animated curve mask + perspective wrap
// For first-pass: approximate with CardFlip + a brief curl shadow overlay
const PageTurn: React.FC<{ flipFrame: number; front: React.ReactNode; back: React.ReactNode }> = (props) => (
  // Same as CardFlip but with: (1) a CSS shadow gradient that animates across the front
  // face as it lifts, suggesting the page curl, and (2) origin set to the page edge
  // (transformOrigin: "left center") rather than center
  ...
);
```

- **Performance:** Same as CardFlip with one extra layer for the curl shadow.
- **Composition:** Use for era-by-era reveal of a series of plates — each page turn IS one era advancing.
- **Strategy:** Page turn row.

#### 5.3.5 TiltOnBeat — word-locked tilt

```tsx
const TiltOnBeat: React.FC<{
  beatFrame: number;            // when to fire — usually from wf("word")
  axis?: "x" | "y";
  angle?: number;               // peak rotation
  settleFrames?: number;        // frames to return to 0
  children: React.ReactNode;
}> = ({ beatFrame, axis = "y", angle = 4, settleFrames = 30, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Fast spring up, slow settle
  const peak = springIn(frame, beatFrame, fps, "tension");           // 0 → 1 fast
  const settle = 1 - rise(frame, beatFrame + 4, beatFrame + settleFrames);  // 1 → 0 slow
  const a = peak * settle * angle;
  const rot = axis === "y" ? `rotateY(${a}deg)` : `rotateX(${a}deg)`;
  return (
    <div style={{ perspective: 2000 }}>
      <div style={{ transformStyle: "preserve-3d", transform: rot }}>{children}</div>
    </div>
  );
};

// Usage:
// const wf = makeWf(SHOT_028);
// <TiltOnBeat beatFrame={wf("梯")} angle={6}>...</TiltOnBeat>
```

- **Performance:** GPU-cheap.
- **Composition:** Tie to `wf(word)` from the existing word-timing pipeline. Small angles (3-6°) only — large angles disrupt reading.
- **Strategy:** Tilt-on-beat row.

#### 5.3.6 DollyPush, Truck, Pedestal, Crane

```tsx
// All are simple wrappers around a transform interpolation:
const DollyPush: React.FC<{ from?: number; to?: number; children }> = ({
  from = 1, to = 1.06, children,
}) => {
  const frame = useCurrentFrame();
  const dur = useShotDuration();
  const scale = interpolate(frame, [0, dur], [from, to], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>{children}</div>;
};

// Truck: translateX between values
// Pedestal: translateY between values
// Crane: composition of Truck + Pedestal + slight scale, usually 90-150 frames
```

- **Performance:** Trivial.
- **Composition:** Apply to whole-shot wrappers (one Sequence = one camera move). For per-element pushes, wrap just that element.
- **Strategy:** Dolly push / Truck / Pedestal / Crane rows.

### 5.4 Hand-drawn (planned `handdrawn.tsx`)

**Important:** rough.js + Remotion patterns are documented in the existing `remotion-article-highlight` skill. Do NOT duplicate the cookbook here. `handdrawn.tsx` will export thin wrappers around that skill's patterns, plus the three additional components below.

#### 5.4.1 rough.js wrappers (delegated)

The shared module will export:

```tsx
// Thin wrapper over the remotion-article-highlight skill's RoughHighlight component
// Adds: word-locked firing via wf(), project palette enforcement
import { RoughHighlight, RoughUnderline, RoughCircle } from "./roughDelegate";
```

See the `remotion-article-highlight` skill for the full cookbook (canvas/SVG mode choice, seed determinism, multi-pass strokes).

#### 5.4.2 BrushReveal — mask reveal with brush atlas

```tsx
const BrushReveal: React.FC<{
  startFrame: number;
  duration?: number;
  brushAtlas?: string;   // staticFile path; defaults to project's brush-atlas-1.png
  children: React.ReactNode;
}> = ({ startFrame, duration = 30, brushAtlas = "cinematics/brush-atlas-1.png", children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = rise(frame, startFrame, startFrame + duration);
  const maskScale = 0.2 + p * 1.4;  // brush sweeps from small to covering
  return (
    <svg style={{ position: "absolute", inset: 0 }}>
      <defs>
        <mask id="brushMask" maskUnits="userSpaceOnUse">
          <image href={staticFile(brushAtlas)}
                 x={width * (1 - p)} y="0"
                 width={width * maskScale} height={height}
                 preserveAspectRatio="xMidYMid slice" />
        </mask>
      </defs>
      <foreignObject x="0" y="0" width={width} height={height} mask="url(#brushMask)">
        {children}
      </foreignObject>
    </svg>
  );
};
```

- **Brush atlas generation:** one PNG with 4-6 stroke shapes, generated once via gpt-image-2 with a STYLE block matching the project's ink character (Register B-aligned for the migration project). Cache in `public/cinematics/brush-atlas-1.png`. Reusable across the whole project.
- **Performance:** Moderate (`<mask>` + `<foreignObject>` is non-trivial). Use only for hero artifact entrances, not throughout.
- **Composition:** Pairs naturally with Register B plate entrances (see ink-bleed transition 5.1.5).
- **Strategy:** *video-content-strategy* → Hand-Drawn / Organic Vocabulary → Brush-stroke reveal mask row.

#### 5.4.3 InkWashOverlay

```tsx
const InkWashOverlay: React.FC<{
  texture?: string;       // staticFile path; defaults to ink-wash-warm.png
  intensity?: number;     // 0.05 - 0.20
  blendMode?: React.CSSProperties["mixBlendMode"];
}> = ({ texture = "cinematics/ink-wash-warm.png", intensity = 0.12, blendMode = "multiply" }) => (
  <AbsoluteFill style={{
    backgroundImage: `url(${staticFile(texture)})`,
    backgroundSize: "cover",
    opacity: intensity,
    mixBlendMode: blendMode,
    pointerEvents: "none",
  }} />
);
```

- **Texture generation:** PNG generated once via gpt-image-2 — warm grey or amber ink wash with paper grain. Cache in `public/cinematics/`.
- **Performance:** Trivial (just a background image).
- **Composition:** Apply as the topmost atmosphere layer during Register B beats. Pairs with paper-grain overlay (5.5.6).
- **Strategy:** Ink-wash overlay row.

#### 5.4.4 CharcoalRender — sketch register for "wrong answer" content

```tsx
// Combine rough.js stroke + SVG hatch fill on a wrapper
const CharcoalRender: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ filter: "url(#charcoalRoughen) saturate(0.3) brightness(0.95)" }}>
    {/* SVG <defs> with feTurbulence + feDisplacementMap for edge roughening */}
    {/* + hatch pattern overlay at multiply blend, low opacity */}
    {children}
  </div>
);
```

- **Performance:** Moderate (SVG filter on a large area). Use for individual elements, not the whole frame.
- **Composition:** Wrap negation-then-reveal "wrong answer" content. The dismissed answer renders in charcoal; the reveal renders in the clean Canvas register. The contrast IS the argument.
- **Strategy:** Charcoal / sketch mode row.

### 5.5 Atmosphere (planned `atmosphere.tsx`)

All atmosphere components are `<AbsoluteFill>` overlays with `pointerEvents: none`. They sit between the SceneShell's existing radial-gradient backdrop and the children content (or above, depending on the effect). Composition order:

```
SceneShell:
  radial-gradient backdrop          (existing)
  <PatternOverlay />                (era encoding, if applicable)
  <GradientMesh />                  (mood)
  Particles                          (existing)
  Terrain SVG                        (existing)
  <GodRay />                        (focal, if applicable)
  children (Canvas + Artifact)
  <DynamicVignette />               (above content for darkening)
  <FrameBorder register={...} />    (per-register cue)
```

#### 5.5.1 GradientMesh

```tsx
const GradientMesh: React.FC<{
  pools?: Array<{ x: string; y: string; r: string; color: string; intensity: number }>;
}> = ({ pools = DEFAULT_POOLS }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {pools.map((p, i) => (
      <AbsoluteFill key={i} style={{
        background: `radial-gradient(circle at ${p.x} ${p.y},
                      ${p.color}${Math.round(p.intensity * 255).toString(16).padStart(2, "0")} 0%,
                      transparent ${p.r})`,
      }} />
    ))}
  </AbsoluteFill>
);

const DEFAULT_POOLS = [
  { x: "20%", y: "30%", r: "55%", color: COLORS.system,  intensity: 0.10 },
  { x: "80%", y: "70%", r: "45%", color: COLORS.tension, intensity: 0.07 },
];
```

- **Performance:** Trivial (3-5 CSS gradients).
- **Composition:** Place ABOVE the existing radial-gradient backdrop, BELOW particles. Pool colors must be from project palette only.
- **Strategy:** Atmosphere → Gradient mesh row.

#### 5.5.2 NoiseLayer / FilmGrainAmbient

Same as 5.2.1 (FilmGrain) — the `atmosphere.tsx` export is just an alias with the ambient defaults locked (`intensity: 0.05, speed: 0.5`).

#### 5.5.3 PatternOverlay (era encoding catalog)

```tsx
const PATTERNS = {
  copperplate: { kind: "hatch", angle: 45, spacing: 4, opacity: 0.06 },
  dotMatrix:   { kind: "dots", spacing: 8, size: 1, opacity: 0.05 },
  halftone:    { kind: "dots", spacing: 6, size: 1.5, opacity: 0.07 },
  parchment:   { kind: "noise", baseFreq: 1.2, opacity: 0.04 },
  terminal:    { kind: "scanlines", spacing: 3, opacity: 0.08 },
};

const PatternOverlay: React.FC<{ pattern: keyof typeof PATTERNS }> = ({ pattern }) => {
  const cfg = PATTERNS[pattern];
  // Render via SVG <pattern> or <feTurbulence> depending on cfg.kind
  ...
};
```

- **Performance:** Cheap for `<pattern>` (hatch / dots / scanlines); moderate for `noise`.
- **Composition:** Use to encode era across the video. The viewer learns "1450 = copperplate hatch, 2026 = dot matrix" pre-verbally.
- **Strategy:** Atmosphere → Geometric pattern overlay row.

#### 5.5.4 GodRay

```tsx
const GodRay: React.FC<{
  angle?: number;       // degrees from horizontal
  origin?: { x: string; y: string };
  intensity?: number;
  warmth?: number;      // 0 = neutral, 1 = full project tension warmth
}> = ({ angle = -25, origin = { x: "20%", y: "0%" }, intensity = 0.15, warmth = 0.6 }) => {
  const tone = `rgba(232, 145, 58, ${intensity})`;  // tension warm
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(${angle + 90}deg, ${tone} 0%, transparent 35%)`,
      mixBlendMode: "screen",
      pointerEvents: "none",
    }} />
  );
};
```

- **Performance:** Trivial.
- **Composition:** Use ONCE per scene maximum. The angle should suggest a single off-screen light source. Pair with `<Halation>` on the lit artifact for the full bloom.
- **Strategy:** Atmosphere → Volumetric light shaft row.

#### 5.5.5 DynamicVignette

```tsx
const DynamicVignette: React.FC<{
  baseIntensity?: number;
  pulseAmplitude?: number;
  pulseSpeed?: number;
  shiftToTension?: boolean;   // tighten when tension rises
}> = ({ baseIntensity = 0.4, pulseAmplitude = 0.06, pulseSpeed = 0.012, shiftToTension = false }) => {
  const frame = useCurrentFrame();
  const breath = Math.sin(frame * pulseSpeed) * pulseAmplitude;
  const intensity = baseIntensity + breath + (shiftToTension ? 0.12 : 0);
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 50%,
                    transparent 30%,
                    rgba(10, 14, 20, ${intensity}) 100%)`,
      pointerEvents: "none",
    }} />
  );
};
```

- **Performance:** Trivial.
- **Composition:** Replaces the SceneShell's static vignette when active. Tie `shiftToTension` to the particle color arc — when particles shift to `tension`, the vignette tightens 12% as a non-conscious mood signal.
- **Strategy:** Atmosphere → Vignette dynamics row.

#### 5.5.6 FrameBorder (per-register)

```tsx
const FRAME_BORDERS = {
  copperplate: { src: "cinematics/border-copperplate.png", inset: 24 },
  terminal:    { src: "cinematics/border-terminal.png",    inset: 16 },
  dossier:     { src: "cinematics/border-dossier.png",     inset: 32 },
};

const FrameBorder: React.FC<{ register: keyof typeof FRAME_BORDERS }> = ({ register }) => {
  const cfg = FRAME_BORDERS[register];
  return <Img src={staticFile(cfg.src)}
              style={{ position: "absolute", inset: 0,
                       width: "100%", height: "100%", pointerEvents: "none" }} />;
};
```

- **Asset generation:** each border PNG generated once via gpt-image-2 with the corresponding register's STYLE preamble. Transparent center, decorative edge only.
- **Performance:** Trivial (single PNG overlay).
- **Composition:** Wrap full-frame Artifact shots only. Don't apply during Canvas-only beats — the border IS the register cue.
- **Strategy:** Atmosphere → Decorative frame border row.

### 5.6 Effect Choreography Catalog (planned `signatureMoves.ts`)

Five named signature moves composing the building blocks above. These are the *recurring charged moments* the channel earns its visual signature through. Lock these once per project; the viewer learns to expect them.

#### 5.6.1 Dossier Ceremony (Artifact hero reveal)

The canonical Register B plate entrance. Used for the first appearance of any cited-thinker dossier.

```
Beat -8 → 0   (8 frames):  particles dim 100% → 70%, dynamic vignette tightens 8%
Beat 0  → 20 (20 frames):  ink-bleed transition from black; brush atlas sweeps L→R
Beat 0  → 60 (60 frames):  Perspective3D wrapper at rotateY(6) rotateX(-3)
                            DollyPush 1.00 → 1.06
Beat 8  → 30:              GodRay at angle -25° from upper-left, intensity 0.18
Beat 8  → 90:              Halation on the plate itself
Beat 30 → 90:              Citation label types in below the plate (existing typography pattern)
Beat 60 → 90:              Particles return to 100%, vignette releases
```

- **Composition:** Wrap the Register B `<Img>` in `<Perspective3D>` inside `<DollyPush>` inside `<BrushReveal>`. Atmosphere `<GodRay>` and `<Halation>` sit above.
- **Strategy:** *video-content-strategy* → "Cinematography principle" + Differentiation Principle.

#### 5.6.2 Era Transition (Register A primitive swap across centuries)

Transition between two Register A artifact eras.

```
Beat 0 → 8:    whip-pan exit on outgoing era's gate
Beat 4 → 12:   shutter flash mid-pan (8 frames black peak)
Beat 8 → 24:   paper-rip reveals incoming era beneath
Beat 0 → 24:   PatternOverlay swaps from outgoing era to incoming era
                (e.g. copperplate → halftone for 1450 → 1880)
Beat 12 → 30:  ColorGradeLUT animates between register grades
Beat 24 → 50:  new era's gate enters with neutral dissolve at full position
```

- **Composition:** This is THE charged transition for between-act bridges. Reserve for major era jumps (3-5 per video). The combination of whip-pan + shutter + paper-rip is dense — don't dilute it with smaller era hops.
- **Strategy:** Whip-pan, shutter, paper-rip rows; PatternOverlay; ColorGradeLUT.

#### 5.6.3 Glitch Rupture (prediction-error or AI-era discontinuity)

The strongest charged transition. Use ONLY on rupture beats — system failure, the AI-era discontinuity, the moment the conventional model breaks.

```
Beat -4 → 0:    chromatic aberration ramps 0 → 4px offset
Beat 0  → 6:    glitch transition (RGB-split + feDisplacementMap flicker, 6 frames)
Beat 0  → 6:    FilmGrain intensity 0.06 → 0.12 → 0.06 (peak)
Beat 6  → 18:   chromatic aberration releases 4 → 0
Beat 6  → 30:   ColorGradeLUT eases to "rupture" register, then settles to new register
```

- **Composition:** The cleanest pairing is hard cut + glitch + rupture grade. Surrounding shots should be otherwise neutral so the rupture lands.
- **Strategy:** Glitch row; chromatic aberration; rupture color-grade register.

#### 5.6.4 Archive Open (entering Register B context)

The "we are inside an archive" entry — used when the camera enters a Register B beat from a Canvas-Layer flow.

```
Beat 0 → 30:   ink-bleed transition (Register B's character)
Beat 0 → 60:   InkWashOverlay fades in to intensity 0.12
Beat 0 → 60:   PatternOverlay swaps to "parchment"
Beat 0 → 60:   ColorGradeLUT eases to "archive" register
Beat 0 → 30:   FrameBorder fades in (register: dossier)
Beat 30 → ∞:   Register B plate or content appears within the framed area
```

- **Composition:** The whole shot becomes "inside the archive" — vignette, color, texture, border all aligned. Use whenever Register B carries a beat longer than 3 seconds.
- **Strategy:** Multiple Atmosphere rows + InkWashOverlay + ColorGradeLUT.

#### 5.6.5 Thesis Land (the click moment)

THE signature move. The reveal where the conventional model breaks and the new model snaps into place. One per video, maximum two.

```
Beat -20 → -4:  Canvas dims 100% → 60%; particles dim to 50%; vignette tightens 15%
Beat -4 → 0:    section breath (4 frames silent darkness)
Beat 0  → 8:    light-flash (warm radial bloom, peak 1.0 at frame 4)
Beat 4  → 8:    chromatic aberration spike at light-flash peak
Beat 0  → 30:   thesis text types in (existing typography pattern), centered
Beat 8  → 60:   Halation around the thesis text
Beat 30 → 90:   particles return to 100% in `insight` color (color arc shift)
Beat 30 → 120:  vignette releases; world reopens
```

- **Composition:** This combines the section breath (existing), light-flash, chromatic aberration, halation, and particle color arc shift. The light-flash IS the click; everything else braces it.
- **Strategy:** *video-content-strategy* → Differentiation Principle. THIS is usually the "one signature move" the viewer remembers. Lock the variant for your project (warmer light? cooler light? longer hold? sharper rise?) and use it consistently.

### 5.7 Effect Performance Budget (1920×1080 @ 30fps)

| Effect | Cost | Safe at 30fps | Notes |
|---|---|---|---|
| `clip-path` (wipe / iris / paper-rip) | Cheap | Always | GPU-accelerated. Use freely. |
| CSS `transform` (3D wrappers, dolly, truck) | Cheap | Always | GPU-accelerated. |
| CSS `filter: hue-rotate / saturate / contrast / brightness` | Cheap | Always | GPU-accelerated. Color-grade LUTs essentially free. |
| CSS `filter: drop-shadow` (chromatic aberration via 2x drop-shadow) | Moderate | Yes for ≤2 stacked | Cheaper than SVG feColorMatrix for full-frame. |
| CSS `mix-blend-mode` (light leaks, gradient mesh) | Cheap | Always | |
| Linear / radial gradients (LightLeak, GradientMesh, GodRay) | Cheap | Always | |
| SVG `<pattern>` (hatch, dots, scanlines via PatternOverlay) | Cheap | Always | Tile once, reuse. |
| SVG `<mask>` with `<image>` (BrushReveal) | Moderate | Yes for hero shots | Pre-cache the brush atlas via `staticFile`. |
| SVG `<feTurbulence>` (FilmGrain, parchment noise) | Heavy | Yes if seed regenerates every 2-4 frames, not every frame | The most expensive SVG primitive. Pre-render for batch exports. |
| SVG `<feGaussianBlur>` (Halation, motion blur on whip-pan) | Heavy | Yes for ≤8 frame windows | Limit blur to specific elements, not full frame. |
| SVG `<feDisplacementMap>` (Glitch) | Heavy | Yes for 4-8 frame bursts only | Never sustained. |
| SVG `<feColorMatrix>` channel offsets (RGB-split) | Moderate | Yes | Cheaper than displacement map. |
| Composed signature moves (Dossier Ceremony, Thesis Land) | Heavy at peak | Yes for 1-2 second peaks | Pre-render long sustained effects (full-act dolly + parallax) to MP4 segments if frame budget tight. |

**Render-killer warnings:**
- **`feTurbulence` regenerated every frame** — pre-cache by seeding with `Math.floor(frame / 3)` instead of `frame`.
- **`feGaussianBlur` on full-frame source** — apply on individual elements (the artifact) not the whole `<svg>` root.
- **Stacked SVG filters on full-frame** (e.g. grain + halation + glitch simultaneously) — split into separate `<svg>` overlays so the renderer can handle each independently.
- **`<foreignObject>` with React content inside `<mask>`** — works in Remotion but slower than flat SVG. Acceptable for hero beats, expensive at scale.

**Safe stack at 30fps full-frame:**
- ColorGradeLUT (always)
- 1× FilmGrain at intensity ≤ 0.08 with seed cycling every 3 frames
- 1× LightLeak / GodRay (CSS gradient)
- 1× DynamicVignette
- 1× PatternOverlay
- Per-element 3D wrappers, dolly push, tilt-on-beat (unlimited count)

**Stack to avoid simultaneously:**
- BrushReveal + Glitch + Halation simultaneously (3 heavy SVG filters at once — drop frames likely).
- Full-frame Halation on every shot (use only on hero artifacts and light-flash beats).
- `feTurbulence` regenerating every single frame (always cycle seed every 2-4).

For long sustained effects (e.g. a 5-second Dolly Push + Parallax + GradientMesh), pre-render to MP4 once and composite via `<OffthreadVideo>`. Cheaper than re-rendering every frame in Remotion.

---

### 5.8 Lens Personality (planned `lens.tsx`)

Five canonical lenses locked at the wrapper level. The Director's Sheet picks one default; per-shot deviation is a directorial decision. See `video-content-strategy` → "Lens Personality System" for the strategy.

```tsx
type LensVariant = "wide21" | "normal50" | "portrait85" | "fisheye8" | "anamorphic";

const LENS_PERSONALITIES: Record<LensVariant, {
  perspective: number;
  scaleX: number;
  scaleY: number;
  edgeBarrel: number;     // feDisplacementMap scale at frame edges (0 = none)
  fullFrameBarrel: number; // feDisplacementMap scale across whole frame (0 = none)
}> = {
  wide21:     { perspective: 1400, scaleX: 1.00, scaleY: 1.00, edgeBarrel: 5,  fullFrameBarrel: 0  },
  normal50:   { perspective: 2400, scaleX: 1.00, scaleY: 1.00, edgeBarrel: 0,  fullFrameBarrel: 0  },
  portrait85: { perspective: 4000, scaleX: 1.00, scaleY: 1.00, edgeBarrel: 0,  fullFrameBarrel: 0  },
  fisheye8:   { perspective: 700,  scaleX: 1.00, scaleY: 1.00, edgeBarrel: 0,  fullFrameBarrel: 14 },
  anamorphic: { perspective: 2000, scaleX: 1.05, scaleY: 0.97, edgeBarrel: 0,  fullFrameBarrel: 0  },
};

const Lens: React.FC<{ variant?: LensVariant; children: React.ReactNode }> = ({
  variant = "normal50", children,
}) => {
  const cfg = LENS_PERSONALITIES[variant];
  return (
    <div style={{
      perspective: `${cfg.perspective}px`,
      transform: `scale(${cfg.scaleX}, ${cfg.scaleY})`,
      transformOrigin: "center",
      width: "100%", height: "100%",
    }}>
      {cfg.edgeBarrel > 0 && <EdgeBarrelDistortion scale={cfg.edgeBarrel} />}
      {cfg.fullFrameBarrel > 0 && <FullFrameBarrelDistortion scale={cfg.fullFrameBarrel} />}
      {children}
    </div>
  );
};
```

Edge / full-frame barrel distortion uses SVG `feDisplacementMap` with a radial gradient as the displacement source — pixels deflect outward proportionally to their distance from frame center.

- **Performance:** `transform: scale` and `perspective` are GPU-cheap. `feDisplacementMap` is heavy — only the charged lenses (`fisheye8`) use it full-frame, and only for the duration of the rupture beat. The `wide21` edge barrel can be applied as a CSS mask gradient instead of a real SVG filter for the cheap version
- **Composition:** `<Lens>` wraps the whole SceneShell content. Anamorphic should be combined with `chromaticAberration` peaks on horizontal axis for the full anamorphic-flare character. Fisheye should be combined with `chromaticAberration` and `Glitch` for the rupture combo
- **Strategy:** *video-content-strategy* → "Lens Personality System" (table of 5 lenses + pairings + discipline)

**Charged lens budget:** Fisheye-8mm and Anamorphic each get 1 use per video maximum. Wide-21mm and Portrait-85mm are *neutral deviations* from Normal-50mm and can be used freely whenever the shot earns them.

### 5.9 Meta-Canvas / Brechtian (planned `metaCanvas.tsx`)

The canvas acknowledging itself. Five components — visible-grid, construction-reveal, Brechtian-label, margin-note, index-shot.

```tsx
// 5.9.1 VisibleGrid — composition grid as a charged moment, not dev-only
const VisibleGrid: React.FC<{ beatFrame: number; durationFrames?: number }> = ({
  beatFrame, durationFrames = 60,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeWindow(frame, beatFrame, beatFrame + 8,
                              beatFrame + durationFrames - 16, beatFrame + durationFrames);
  // Reuse the existing CompositionGrid component but with animated opacity
  return <CompositionGrid show={opacity > 0.01} opacityOverride={opacity} />;
};

// 5.9.2 ConstructionReveal — diagram builds with scaffolding visible, then scaffolding fades
const ConstructionReveal: React.FC<{
  buildFrame: number;
  scaffoldHoldFrames?: number;
  scaffoldFadeFrames?: number;
  children: { scaffold: React.ReactNode; final: React.ReactNode };
}> = ({ buildFrame, scaffoldHoldFrames = 30, scaffoldFadeFrames = 24, children }) => {
  const frame = useCurrentFrame();
  const scaffoldOpacity = fadeWindow(frame, buildFrame, buildFrame + 8,
                                      buildFrame + scaffoldHoldFrames,
                                      buildFrame + scaffoldHoldFrames + scaffoldFadeFrames);
  return (<>
    {children.final}
    <div style={{ opacity: scaffoldOpacity, position: "absolute", inset: 0 }}>
      {children.scaffold}
    </div>
  </>);
};

// 5.9.3 BrechtianLabel — stage-direction text pointing at an element, dissolves out
const BrechtianLabel: React.FC<{
  targetX: number; targetY: number;
  text: string;
  fireFrame: number;
  holdFrames?: number;
}> = ({ targetX, targetY, text, fireFrame, holdFrames = 60 }) => {
  const frame = useCurrentFrame();
  const opacity = fadeWindow(frame, fireFrame, fireFrame + 12,
                              fireFrame + holdFrames - 16, fireFrame + holdFrames);
  return (
    <div style={{
      position: "absolute", left: targetX + 30, top: targetY - 12,
      opacity, fontFamily: "JetBrains Mono", fontSize: 14, color: COLORS.textDim,
      pointerEvents: "none",
    }}>
      ↳ {text}
    </div>
  );
};

// 5.9.4 MarginNote — editorial-style margin commentary
// 5.9.5 IndexShot — numbered menu of upcoming shots
// (sketched similarly; see strategy doc Meta-Canvas table for visual character)
```

- **Performance:** All trivial (no SVG filters, just opacity + positioning).
- **Composition:** Brechtian moves SIT ABOVE all canvas content but BELOW the transition layer. Their typography register MUST be visibly different from the canvas's normal typography (smaller mono, lower opacity, different color).
- **Strategy:** *video-content-strategy* → "Meta-Canvas / Brechtian Vocabulary."

**Discipline (load-bearing):** maximum one Brechtian beat per act. Brechtian moves never replace canvas content — they *annotate* it. Brechtian beats fire during method/pedagogy beats, NEVER during argument-landing beats.

### 5.10 Environmental / Diegetic UI (planned `diegeticUI.tsx`)

UI elements that live inside the world, not over it. Three core components — `<InWorldLabel>`, `<TerrainProgressBar>`, `<InWorldTimestamp>` — plus principle hooks for object-attached and embedded patterns.

```tsx
// 5.10.1 InWorldLabel — label that follows its target's animation
const InWorldLabel: React.FC<{
  targetRef: React.RefObject<{ x: number; y: number }>; // or use a position function
  position: (t: number) => { x: number; y: number }; // function of frame for moving objects
  text: string;
  offset?: { x: number; y: number };
  appearFrame?: number;
}> = ({ position, text, offset = { x: 0, y: -28 }, appearFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pos = position(frame);
  const opacity = springIn(frame, appearFrame, fps, "standard");
  return (
    <div style={{
      position: "absolute", left: pos.x + offset.x, top: pos.y + offset.y,
      transform: "translateX(-50%)",
      opacity, fontFamily: "JetBrains Mono", fontSize: 13, color: COLORS.text,
      pointerEvents: "none",
    }}>
      {text}
    </div>
  );
};
// Critical: position(frame) MUST use the SAME spring/interpolate function the target uses.
// A 2-frame lag between object and label = HUD bug, not direction.

// 5.10.2 TerrainProgressBar — progress encoded as a color/amplitude shift along terrain
const TerrainProgressBar: React.FC<{
  progress: number;        // 0..1, e.g. videoProgress from VideoArcProvider
  terrainPts: { x: number; y: number }[];
  baseColor: string;
  filledColor: string;
}> = ({ progress, terrainPts, baseColor, filledColor }) => {
  const splitX = terrainPts[terrainPts.length - 1].x * progress;
  // Render two terrain paths — one "filled" segment up to splitX in filledColor, one rest in baseColor
  // The viewer reads the terrain color shift as world ambience, not as a chart
  return (...);
};

// 5.10.3 InWorldTimestamp — engraved marks on the migration vector itself
const InWorldTimestamp: React.FC<{
  vectorPath: string;       // SVG path d-string of the migration vector
  positionAlongPath: number; // 0..1, where on the path the timestamp sits
  year: string;
  era: string;
  appearFrame: number;
}> = ({ vectorPath, positionAlongPath, year, era, appearFrame }) => {
  // Use SVG path geometry to compute the (x, y) at positionAlongPath
  // Render a short tick mark on the path + label below in canvas typography
  return (...);
};
```

- **Performance:** Trivial (positioned divs + small SVG path math).
- **Composition:** Diegetic UI lives on the SAME layer as the elements it describes (NOT in a HUD overlay). Default is diegetic; HUD must be justified.
- **Strategy:** *video-content-strategy* → "Environmental / Diegetic UI."

**Discipline test:** pause every 5th frame and confirm each label still belongs to its object. A label that lags by even 2 frames behind its object reads as a HUD bug, not as direction.

### 5.11 Recursive / Self-Referential (planned `recursive.tsx`)

Shots that contain themselves or reference earlier shots. Highest-leverage moves in cinema; almost absent from explainer video.

```tsx
// 5.11.1 ShotSnapshot — render any earlier shot at any frame, used as PiP inset
// Two implementation strategies:
//
// (A) Live re-render (precise but expensive):
//     Mount the earlier shot's Component inside a <Sequence> with a fixed frame override.
//     Wrap in a clipping div sized to the inset slot.
//
// (B) Pre-rendered PNG snapshot (cheap, what we'll usually use):
//     During a pre-render pass, save a PNG of every shot at every "snapshot-eligible" frame.
//     ShotSnapshot just becomes <Img src={`shots/${shotId}/f${frame}.png`} />
//
// We ship (B) as the default; (A) is reserved for moments where the snapshot animates.

const ShotSnapshot: React.FC<{
  shotId: string; frame: number;
  width: number; height: number;
  dim?: number;        // opacity dim, default 0.5
  label?: string;      // "as established in shot 014"
}> = ({ shotId, frame, width, height, dim = 0.5, label }) => (
  <div style={{ width, height, position: "relative" }}>
    <Img src={staticFile(`shots/${shotId}/f${String(frame).padStart(4, "0")}.png`)}
         style={{ width: "100%", height: "100%", opacity: dim,
                  border: `1px solid ${COLORS.textDim}` }} />
    {label && <div style={{ position: "absolute", bottom: -20, left: 0,
                             fontFamily: "JetBrains Mono", fontSize: 11,
                             color: COLORS.textDim }}>{label}</div>}
  </div>
);

// 5.11.2 PiP — corner-anchored picture-in-picture wrapper
const PiP: React.FC<{
  position?: "tl" | "tr" | "bl" | "br";
  insetSize?: { w: number; h: number };
  margin?: number;
  appearFrame: number;
  children: React.ReactNode;
}> = ({ position = "tr", insetSize = { w: 384, h: 216 }, margin = 64,
       appearFrame, children }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const opacity = springIn(frame, appearFrame, fps, "standard");
  const pos = {
    tl: { left: margin, top: margin },
    tr: { right: margin, top: margin },
    bl: { left: margin, bottom: margin },
    br: { right: margin, bottom: margin },
  }[position];
  return (
    <div style={{ position: "absolute", ...pos,
                  width: insetSize.w, height: insetSize.h,
                  opacity, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
      {children}
    </div>
  );
};

// 5.11.3 MatchDissolveAcrossScales — same shape, different scale, cross-dissolved
const MatchDissolveAcrossScales: React.FC<{
  fromScale: number; toScale: number;
  dissolveFrames?: number;
  shape: (scale: number) => React.ReactNode; // takes scale, returns the shape render
  fireFrame: number;
}> = ({ fromScale, toScale, dissolveFrames = 24, shape, fireFrame }) => {
  const frame = useCurrentFrame();
  const p = rise(frame, fireFrame, fireFrame + dissolveFrames);
  return (<>
    <div style={{ opacity: 1 - p }}>{shape(fromScale)}</div>
    <div style={{ position: "absolute", inset: 0, opacity: p }}>{shape(toScale)}</div>
  </>);
};

// 5.11.4 DrosteFrame — recursive inset (sparingly)
const DrosteFrame: React.FC<{ depth?: number; scale?: number; children: React.ReactNode }> = ({
  depth = 4, scale = 0.6, children,
}) => {
  if (depth === 0) return null;
  return (
    <>
      {children}
      <div style={{ position: "absolute", inset: "20%",
                    transform: `scale(${scale})`,
                    opacity: 0.6 ** (5 - depth) }}>
        <DrosteFrame depth={depth - 1} scale={scale}>{children}</DrosteFrame>
      </div>
    </>
  );
};
```

- **Performance:** ShotSnapshot via pre-rendered PNG: trivial. Live re-render: heavy — the renderer is rendering two shots simultaneously, expect 2x render time. PiP / MatchDissolveAcrossScales / DrosteFrame: trivial.
- **Composition:** PiP appears ABOVE all scene content, BELOW the transition layer. ShotSnapshot inside the PiP. Match-dissolve replaces the entire shot's primary content for its duration.
- **Strategy:** *video-content-strategy* → "Recursive / Self-Referential Shots."

**Recursion budget (load-bearing, channel-level):**
- PiP callback: max 1 per video
- Video-within-video: max 1 per series
- Droste frame: max 1 per series, possibly once ever

These are signature-grade moves. Track usage at the channel level (Director's Sheet → "recursion budget"); each use is a directorial decision, not a per-shot reach.

### 5.12 Video-Arc Drift (planned `videoArcDrift.ts`)

Continuous Cinema Layer parameter drift across the entire video. Zero per-shot authoring cost; massive subliminal cohesion payoff.

```tsx
// 5.12.1 VideoArcProvider — context supplying normalized 0..1 video progress
type VideoArc = { progress: number; totalShots: number; currentShotIndex: number; };
const VideoArcCtx = React.createContext<VideoArc>({ progress: 0, totalShots: 1, currentShotIndex: 0 });

const VideoArcProvider: React.FC<{
  totalShots: number;
  currentShotIndex: number;
  children: React.ReactNode;
}> = ({ totalShots, currentShotIndex, children }) => {
  // For finer resolution use frame-level progress; for shot-level use index/total
  const progress = currentShotIndex / Math.max(1, totalShots - 1);
  return (
    <VideoArcCtx.Provider value={{ progress, totalShots, currentShotIndex }}>
      {children}
    </VideoArcCtx.Provider>
  );
};

const useVideoProgress = () => React.useContext(VideoArcCtx).progress;

// 5.12.2 Drift hooks — composed into existing post-fx/atmosphere components
const useGrainHueDrift = (startHue = "#808080", endHue = "#a88560") => {
  const p = useVideoProgress();
  return interpolateHue(startHue, endHue, p);
};

const useVignetteDrift = (startIntensity = 0.4, endIntensity = 0.55) => {
  const p = useVideoProgress();
  return startIntensity + (endIntensity - startIntensity) * p;
};

const useGradeDrift = (startRegister: keyof typeof REGISTER_GRADES,
                       endRegister: keyof typeof REGISTER_GRADES) => {
  const p = useVideoProgress();
  // Interpolate each LUT axis between the two register grades
  return interpolateLUT(REGISTER_GRADES[startRegister], REGISTER_GRADES[endRegister], p);
};

const useParticleDensityDrift = (startCount = 22, endCount = 18) => {
  const p = useVideoProgress();
  return Math.round(startCount + (endCount - startCount) * p);
};

const useLensDrift = (startVariant: LensVariant, endVariant: LensVariant) => {
  const p = useVideoProgress();
  // Interpolate each LENS_PERSONALITIES axis between the two lenses
  return interpolateLensConfig(LENS_PERSONALITIES[startVariant],
                                LENS_PERSONALITIES[endVariant], p);
};

// Usage at the SceneShell / FilmGrain / DynamicVignette / etc. component level:
// const grainHue = useGrainHueDrift();      // automatically drifts across video
// const vignetteI = useVignetteDrift();
// const grade = useGradeDrift("default", "archive");
```

- **Performance:** Trivial. The drift is just a context lookup + lerp; the underlying components do the rendering work they were already doing.
- **Composition:** `<VideoArcProvider>` wraps the entire composition root (the same Sequence / shotConfigs structure used today). Drift hooks consumed inside Cinema-Layer effect components, never at the per-shot scene component level.
- **Strategy:** *video-content-strategy* → "Video-Arc Drift" + Cross-Register Interpolation across-video case.

**Discipline.**
- One or two drift axes per video maximum. Drifting all five simultaneously is exhausting and unreadable
- Drift direction must align with argument direction. A grain warming over a thesis "we are growing colder" reads as renderer noise
- Drift completes by the second-to-last shot — the final shot holds, doesn't still drift
- Drift is invisible on per-shot review. Only judge on full-video playback

### 5.13 Cross-Register Interpolation (planned `registerInterpolation.ts`)

Mid-shot slides between Canvas/Cinema, Register A/B, and Canvas/Artifact. Per-shot version of Video-Arc Drift.

```tsx
// 5.13.1 RegisterBlend — slide between Canvas and Cinema treatment over a shot window
const RegisterBlend: React.FC<{
  from: "canvas" | "cinema";
  to: "canvas" | "cinema";
  blendFrame: number;
  blendDuration?: number;
  children: React.ReactNode;
}> = ({ from, to, blendFrame, blendDuration = 60, children }) => {
  const frame = useCurrentFrame();
  const p = rise(frame, blendFrame, blendFrame + blendDuration);
  // Direction enforcement: only canvas->cinema is allowed
  if (from === "cinema" && to === "canvas") {
    throw new Error("Cross-Register Interpolation is unidirectional: canvas->cinema only");
  }
  // Apply Cinema-Layer effects at intensity p when going canvas -> cinema
  return (
    <div style={{
      filter: `contrast(${1 + p * 0.05}) saturate(${1 - p * 0.1})
               sepia(${p * 0.15})`,
      // Plus dynamic FilmGrain at intensity p * 0.08
      // Plus chromaticAberration at p * 1px offset
    }}>
      {children}
    </div>
  );
};

// 5.13.2 ArtifactBlend — Canvas placeholder cross-dissolves to Artifact PNG on same coords
const ArtifactBlend: React.FC<{
  blendFrame: number;
  blendDuration?: number;
  canvas: React.ReactNode;       // the abstract Canvas-Layer placeholder (e.g. polygon silhouette)
  artifact: { src: string; alt: string }; // the concrete Register B PNG
  anchor: { x: number; y: number; w: number; h: number };
}> = ({ blendFrame, blendDuration = 45, canvas, artifact, anchor }) => {
  const frame = useCurrentFrame();
  const p = rise(frame, blendFrame, blendFrame + blendDuration);
  return (
    <div style={{ position: "absolute", left: anchor.x, top: anchor.y,
                  width: anchor.w, height: anchor.h }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - p }}>{canvas}</div>
      <Img src={staticFile(artifact.src)} alt={artifact.alt}
           style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                    opacity: p }} />
    </div>
  );
};

// 5.13.3 EraDrift — Register A artifact gradually acquires Register B atmosphere
const EraDrift: React.FC<{
  artifactSrc: string;
  driftStart: number;
  driftDuration?: number;
  toRegister?: "B" | "A"; // direction enforced by the SystemA->B unidirectional rule
  children?: React.ReactNode;
}> = ({ artifactSrc, driftStart, driftDuration = 90, toRegister = "B" }) => {
  const frame = useCurrentFrame();
  const p = rise(frame, driftStart, driftStart + driftDuration);
  return (
    <div style={{ position: "relative" }}>
      <Img src={staticFile(artifactSrc)} style={{ width: "100%", height: "100%" }} />
      {/* Register B atmosphere stack at rising intensity p:
            paper-grain overlay at p * 0.06,
            ink-wash-warm overlay at p * 0.12,
            ColorGradeLUT eased toward "archive" register at progress p */}
      <PaperGrainOverlay intensity={p * 0.06} />
      <InkWashOverlay intensity={p * 0.12} />
    </div>
  );
};
```

- **Performance:** All three components are GPU-cheap (filters + opacity + cross-fade). The Cinema-Layer effects they layer in (FilmGrain, paper-grain) carry their own performance cost — see §5.2 and §5.4.
- **Composition:** Cross-register components wrap their target element, NOT the whole frame. Multiple targets in a shot can drift independently.
- **Strategy:** *video-content-strategy* → "Cross-Register Interpolation" + "Register-Drift across the video."

**Discipline (load-bearing).**
- Unidirectional: Canvas → Cinema only; Register A → B only; Canvas → Artifact only. The components throw if asked to reverse
- One axis per shot. Don't drift Canvas→Cinema AND Register A→B AND Canvas→Artifact in the same shot
- Drift speed encodes mood: slow (90+ frames) = aging; fast (15-30) = recognition; mid (45-60) = deliberate revealing
- Drift completes within the shot — never leave a half-drifted element exposed at the cut

---

**End of Part 5.** All cinematic vocabulary from `video-content-strategy` now has an implementation cookbook — the original 7 subsections plus 6 creative-pass additions (Lens Personality, Meta-Canvas, Diegetic UI, Recursive, Video-Arc Drift, Cross-Register Interpolation). Until `my-video/src/shared/cinematics/` ships, build per-shot one-offs against the API names above so promotion is mechanical.
