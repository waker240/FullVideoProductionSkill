# Fast-Paced Editing — directed compression, not constant noise

Use this when a passage must create **momentum**, **compress time**, **stage overwhelm**, or **rupture control**. Fast pacing is a local passage mode, not a whole-film style token. It gains force from the baseline before it and the release after it.

The governing arc is:

**orient / baseline → compress → escalate one channel at a time → peak / rupture → release / reorient**

A passage that begins at maximum density has nowhere to go. A passage that never releases becomes wallpaper.

## Admission and plan

Mark a fast passage in `DESIGN.md` only when speed performs a story function. Record:

- **Window + intent:** momentum, temporal compression, overwhelm, or panic/rupture.
- **Baseline:** what stable image, rhythm, geography, or sound lets the viewer orient first.
- **Escalation:** which channel changes at each step—shot length, motion, layers, text, color, or sound. Add one channel at a time so the rise is legible.
- **Peak:** the single highest-pressure beat and the idea it lands.
- **Release:** silence, a long/static shot, affinity, wide view, resolved phrase, or another deliberate reorientation.
- **Eye-trace:** where the focal point exits and where the next one arrives. Fast cuts still need one dominant focal path.
- **Primary family + accent:** choose one recurring edit family and at most one charged accent. Variety is not the goal.
- **Sound + legibility:** what leads picture, what hits, where narration/captions need air, and what accessibility restraint applies.

If those fields cannot be stated, use ordinary pacing. “Make it energetic” is not an admission reason.

### Machine handoff — `FAST_PASSAGES.json` v1

Phase 2 records the admission and prose plan; create the live manifest only after the narration clock and `index.html` ownership windows are exact. Start from `hyperframes/templates/FAST_PASSAGES.example.json` and keep `$schema` exactly `hf-fast-passages/v1`.

- `clock` names `scripts/boundaries.json` and `assets/words/narration.words.json` with their SHA-256 fields.
- Every passage has a unique `id`; exact global `start`/`duration`; one exact `intent` enum—`momentum`, `temporal-compression`, `overwhelm`, or `panic-rupture`; and concrete `primaryFamily`, `accent`, `soundPlan`, and `legibility` fields.
- `phases` contiguously cover the whole passage with roles drawn from `baseline`, `compress`, `escalate`, `peak`, and `release` in that order. Exactly one first `baseline`, one `peak`, and one final `release` are required; `compress` / `escalate` are optional and repeatable. Every phase names its exact global `at`/`duration`, real owner (`index.html` or mounted `compositions/*.html`), and incoming `entry` / outgoing `exit` focal receiver. Normally each `entry` exactly inherits the prior `exit`; only a `panic-rupture` passage may break that chain at its named `peak`, and its incoming receiver plus later release landmark must still be explicit.

After audio lock—and after every narration, boundary, word-timing, or ownership change—validate the structure and stamp the current clocks, then verify the frozen handoff:

```bash
npm run fast:check -- --sync-clock
npm run fast:check
```

Clock sync writes hashes only after the rest of the manifest is valid. Builders receive the second command's clean result, never provisional times.

Fresh contract-v2 scaffolds require the explicit PASS/USE admission even when no manifest exists. Legacy opt-in behavior and the `--strict` migration check are documented in `hyperframes/references/pipeline.md` § Phase 7.5.

## Four intent routes

| Intent | Build the passage with | Preserve |
| --- | --- | --- |
| **Momentum** | cutting on action, directional cuts, motion/velocity matches, punch-ins, audio bridges, short hard cuts | continuous direction, compatible eye-trace, a readable destination |
| **Temporal compression** | jump cuts, insert bursts, rapid montage, omitted entrances/exits/pauses, selected pre-baked speed changes | causal order and the few moments the viewer must actually understand |
| **Overwhelm** | cross-cutting, panels, notification/element stacking, kinetic type, increasing shot/layer density | one dominant focal path; subordinate panels act as evidence or texture |
| **Panic / rupture** | discontinuity, stutter, repetition, smash cut, brief freeze, hard audio cut, sudden silence | rarity, narrative cause, and an explicit reorientation afterward |

These routes may combine, but one intent leads. “Everything at once” is not a fifth route.

## Cutting law

Cut on the **idea or action first**; use the musical grid as support. Emotion and story outrank beat synchronization. A cut that lands on percussion but arrives before comprehension is mistimed.

- **Hard cut:** immediacy, continuation, percussive lists, or comedy.
- **Smash cut:** a deliberate contrast in image, sound, place, scale, or mood. Give the incoming shot a strong receiver.
- **Jump cut:** elapsed time or impatience inside one setup. Preserve enough framing identity that the fracture reads as intentional.
- **Insert burst:** close evidence—hands, clocks, screens, machinery, details—between load-bearing shots. Inserts intensify one idea; they do not introduce a new argument per frame.
- **Cut on incomplete action:** forward pull. The next image must finish the vector or exploit the denied completion.
- **Match / graphic match:** continuity through form, color, position, or meaning. Use only when the equivalence is true.
- **Motion / directional match:** continuity through shared vector and velocity. Cut near peak velocity when the seam should disappear.
- **Cross-cut:** parallel actions approaching a collision. Each return must advance its strand.
- **Punch-in:** abrupt emphasis inside one image. Change scale decisively; weak digital nudges read as accidents.

Accelerating shot lengths should form a perceptible curve toward a named peak. Metric montage—durations chosen independent of content—is allowed only as a deliberate pressure device; it never overrides comprehension, eye-trace, or the value turn.

The normal `SCENE_CONTRACT.md` cadence counts **load-bearing conceptual events**. A marked fast passage may contain more micro-edits, but it still carries one comprehensible idea at a time.

## Escalation and overload

Escalate by changing one controllable dimension per step:

1. shorten holds or remove dead transit;
2. strengthen directional motion or cut on action;
3. add one secondary panel/layer/channel;
4. tighten the cut rhythm or text cadence;
5. add the one charged visual or sound accent at the peak;
6. release and reorient.

Split screens and layered UI are not permission for competing heroes. Sequence attention: brighten, move, or enlarge one panel while the others remain context. Notification stacking must reveal accumulation, pressure, or contradiction—not decorate empty space.

Kinetic text bursts use short, comprehensible copy. “Flash” means appear/clear or a hard state change, not repeated high-luminance full-frame flashing. Keep the channel-permanent captions stable while scene typography changes around them.

## Sound law

Fast picture needs a shaped sound arc, not indiscriminate loudness.

- Let an audio bridge lead the next image when it creates pull or continuity.
- Place impacts, clicks, snaps, whooshes, and risers only on earned structural beats.
- Add sound channels progressively; narration remains intelligible and voice wins the mix.
- Treat overlapping dialogue, alarms, music, notifications, and impacts as a rare narrative collision—not a default stack.
- A hard audio cut or sudden silence is a release/rupture with its own meaning. Give it visual room.
- Beat-synced edits are useful when the beat already supports the story/emotion; syncopation can create nervous energy, but it does not excuse arbitrary cuts.

## HyperFrames implementation map

| Editorial move | HyperFrames mechanism |
| --- | --- |
| hard / smash / jump / insert / punch-in | exact scene or direct-root native-clip windows; name the seam relationship in the host |
| velocity match / whip / directional cut | `hyperframes/references/technique-library.md` §14 + `hyperframes-animation/transitions/` |
| match / graphic match | technique library §17; MorphSVG or aligned DOM/SVG forms when the match itself is the claim |
| rapid footage montage | optional `hyperframes/scripts/build-montage.cjs`; its sample durations/grid are configurable examples, not doctrine |
| kinetic text barrage | `hyperframes-animation/blueprints/kinetic-type-beats.md` and its mapped atomic rules |
| increasing surround/pressure | `hyperframes-animation/blueprints/overwhelm-surround.md`, adapted to one focal path |
| code-native stutter / posterized transition | authored discrete states or technique library §14b on the paused timeline |
| raw-footage speed ramp, time remap, frame skip, reverse, stutter, datamosh | pre-bake offline to a frozen project clip, then mount it as framework-owned media |
| rapid reframing / crash or snap zoom | GSAP transform on an inner visual/camera wrapper; clip lifecycle owners keep native timing untouched |
| aspect-ratio jolt | matte/mask inside the fixed composition viewport; root dimensions never change mid-film |
| picture/sound lead-lag | exact video/audio track starts and finite timeline cues; never self-play or mutate media playback state |

Do not implement raw-media time effects with `currentTime`, `playbackRate`, autoplay, or render-time frame integration. HyperFrames owns media playback; iterative or codec-dependent effects are pre-baked, frozen, and registered like any other asset.

There is deliberately no universal fast-edit HTML template. A fixed preset would hard-code tempo and style while hiding the editorial question. Future workflows author passage-specific HTML from the locked plan and reuse the mechanisms above.

## Spatial Canvas

Fast editing may compress a Spatial Canvas route, but it does not suspend object permanence:

- keep the one world owner mounted beneath external cutaways;
- use rapid inline/external excursions and inserts only at exact declared windows;
- preserve the return ticket—exact pose or named reorientation—and the visible revision;
- let a landmark, connector, shared vector, or brief overview restore geography after deliberate disorientation;
- final synthesis still means more than the opening overview.

Inside-world travel is camera choreography. Cut across it only when the compression is intentional and the arrival remains legible.

## Accessibility and review

Prefer hard cuts, motion blur, scale, palette changes, masks, and sound hits over repeated full-frame luminance or color flashes. Keep any isolated flash brief, rare, and subordinate to meaning; avoid strobe grammar. Preserve readable text bursts, stable captions, and a focal point that can be reacquired after every deliberate rupture.

Still snapshots cannot approve fast pacing. For every marked passage:

1. Render at the final fps with final sound, including lead-in and the complete release/reorientation.
2. Watch once for story/comprehension, once for eye-trace, and once for picture/sound interaction at normal speed.
3. Confirm the peak is later/stronger than the baseline, the viewer can state the one carried idea, narration and captions remain intelligible, and orientation is restored when promised.
4. Inspect the encoded master, not only the source preview; fix → rerender → rewatch the same complete window.

Fastness passes when the viewer feels acceleration **and** retains the argument. Confusion is permitted only when it is the authored feeling—and even then, the film owes the viewer a way back.
