<!-- Public portability adaptation, 2026-09-26. -->

# Paper theatre — from storyboard to encoded film

Use for an explicitly selected **B-paper / 纸上机制剧场** direction, or when matching an approved editorial paper storyboard. This is a style option, not HyperFrames' universal palette. Its authority comes from material, silhouette, typography and a physical mechanism that changes on screen; adding grain to a generic card layout does not establish it.

Read this workflow before shotlisting or rebuilding a paper-style film. Use [paper-theatre-prompts.md](paper-theatre-prompts.md) when writing image prompts; [asset-generation.md](asset-generation.md) owns the current ImageGen invocation and file/alpha checks. Existing core, narration, passage and audit contracts still apply.

## 1. Establish the material reference

When an approved storyboard exists, open its **actual images**, exact prompts and shot rationale before choosing assets. Compare reference and proposed composite at equal display size. Extract a compact project style record:

| Property | B-paper example | What to preserve in production |
| --- | --- | --- |
| Substrate | Warm cream `#F3ECD9` rag paper | Fine fibres and pigment variation across the image, luminous cream rather than brown weathering |
| Structure | Charcoal `#24221F` | Decisive printed masses, elegant cut silhouettes, physical paper planes |
| Active change | Vermilion `#D5422C` | Dense dyed paper, folded underplanes, exposed pale core; price, attention or opportunity changes travel through this material |
| Supporting relation | Cobalt `#315AA6` | Small deliberate counterpoint; semantic role recorded per project |
| Cut edge / secondary ink | `#FFF3D8` / `#645C4E` | Raised paper thickness and quieter secondary labels that remain readable |
| Light | Warm directional light, tight contact shadows | Consistent direction and separation between touching, lifted and distant planes |
| Type | Authoritative Chinese Song-style display serif; clean sans for qualifications | Large editorial hierarchy, correct glyphs, readable at the delivery size |

Palette values are semantic anchors, not an instruction to flatten generated pigment into exact uniform pixels. Match the reference's red density, cream brightness, silhouette and shadow character together. If the entire scene feels washed out or cheap, revisit the generated material or composition before applying global saturation filters.

Without an approved reference, use the existing **Gaze → Dream → Create** process: inspect relevant visual material; devise different mechanisms for the key argument; generate complete candidate keyframes; select the direction that communicates the claim and supports animation. Selection can be the director's when the user has granted discretion. Save the chosen images and the reason for the choice; future acts inherit those originals rather than an increasingly distant chain of derivative references.

**Ready to shotlist:** the style record identifies material, lighting, type, a recurring physical object, and the specific reference images. The reference images visibly support that description.

## 2. Write shots as changes to physical relationships

Start with the narration's argument. Describe **what stays fixed, what moves, and what the move proves**. A paragraph is a voiced scene owner, not necessarily one camera setup; split its thought into close-up, action, consequence and release as needed. Keep script and research qualifications attached to the visible claim.

Useful paper verbs: fold an offer shorter; peel a label into a roof; slide a ticket into a hinge; open an aperture; expose roots beneath a school; pull three layers from one seam; unfold a route toward a threshold; stop a feedback ribbon at a gap. Choose verbs whose physical meaning fits the idea.

| Narration mechanism | Paper action | Invariant / honest boundary |
| --- | --- | --- |
| The same object receives a different valuation | Fixed identical bottles beneath differently folded price labels | Bottle shape, quantity and contents stay identical |
| A name helps access resources | Ticket engages a portal; routes unfold toward engineer, customer and funding thresholds | Access is expected, not guaranteed success |
| Prior conditions complicate a school comparison | Camera retreats from the gate to reveal roots already beneath the applicant | Roots precede entry; school does not create them retroactively |
| Status changes attention to an old work | Old page stays unchanged while a paper aperture redirects a few reading paths | Preserve small/temporary/conditional effect instead of an exploding citation chart |
| Resources can feed later achievement | Ribbon visits evaluation, resources and results; return bridge has a visible gap | Feedback requires conditions; the gap survives the climax |
| Social arrangements can become visible | Opening price tag lifts as a roof over trust, routes and institutional entrances | Revealing or widening an entrance does not depict guaranteed outcomes |

For each shot, record the narration cue/window, invariant, operator, resulting state, camera/focal receiver, asset layers, exact text, sound action and next-shot handoff. Example:

```text
Claim: a prestigious name can connect a company to expected resources.
Fixed: the same company and its underlying product.
Operator: a named ticket slides into a paper gate's receiving hinge.
Turn: three paths become visible; camera visits their endpoints.
Boundary: paths end at thresholds; “预期更容易触达 · 不保证结果” is readable.
Handoff: the final route exits right; the next scene receives that direction.
```

Sketch an intensity curve across the act. A sparse immutable-paper scene can deliberately reset attention after a dense opportunity montage. Keep one main thing for the eye to follow even when the frame is rich. Do not translate each noun into an equal-sized card or animate all layers simultaneously.

**Ready for assets:** the viewer can understand the state change from the shot description without relying on the narrator to explain a decorative picture. The first three seconds and any admitted fast passage have their existing cue/trajectory plans.

## 3. Build an ImageGen material foundry

Generate the forms whose texture and silhouette establish the reference's quality. Let DOM/SVG own changeable factual text, counts, live paths and research qualifiers. A complete generated storyboard may contain excellent model-rendered Chinese; production usually benefits from clean, text-free plates so those words can move and remain exact.

Production image references are valuable. Inspect each local reference with `view_image`, then pass its actual path to the configured image tool. Name the role of each input: original style anchor, matching production stage, or edit target. State which qualities to retain and which objects/text to replace. The concrete prompts and call path are in the two linked references above.

| Asset | Generate / retain | Why it is separate |
| --- | --- | --- |
| Substrate | Clean cream paper, fine fibres, consistent light, no lettering or scenery | Full-bleed stable world; fills newly exposed regions |
| Clean stage / back plate | Architecture, landscape or paper structure with deliberate typography space | Rich scene composition; removes objects that will move independently |
| Operator | Ticket, hand, stamp, roof, label, aperture or fold | Its action carries the argument |
| Receivers | People, destinations, cups, pages, gates | Independent reveal or occlusion; choose shared plate when no independent control is needed |
| Foreground / underside | Torn strip, raised core, lip, wall face or roof underside | Makes lifting, passing behind and reveals physically legible |
| Code layer | Exact text, routes, measured marks, conditional breaks | Factual precision and narration-locked changes |

A stage that still contains a baked copy of its moving operator produces a ghost underneath the animation. Request a **clean-plate edit** before building that move. A fixed rich plate may support a closer camera observation, but a change in scale alone cannot substitute for the argument's required action.

Ask for **true transparent PNG** on isolated assets, including internal holes and detached components. Inspect actual channels and full-resolution edges; a checkerboard painted into RGB is not transparency. Preserve original generated alpha. If an extraction fails, make a focused ImageGen edit of the inspected original. A carefully authored SVG/CSS mask over an RGB component is an acceptable compositing alternative when its actual boundary can be traced; record it as **masked RGB**, not RGBA, and inspect the entire moving edge on the actual substrate. Read the general asset reference for this branch.

Small component sheets are useful for a consistent family. Give each object its own gutter and enough resolution for its closest shot. Accept no overlaps, clipped extremities, connected silhouettes or neighbor slivers. Many complex objects may deserve separate calls. Record atlas coordinates from the actual output, not the prompt's proposed grid.

Save exact prompts, original output paths and copies, input references/hashes, dimensions, mode, layer roles, revisions and acceptance/rejection evidence. Every render dependency must be a project-local file; preserve original output independently of masks or browser composition.

**Ready to build:** a reference-sized composite has the intended material/color authority, layers separate cleanly, and the planned move will not expose a duplicate object or unpainted hole.

## 4. Stage, typography and deterministic motion

Use a hierarchy such as `scene → paper substrate + camera world + captions`, with `camera world → back plate + receivers + operator wrapper + foreground occluder`. Put the moving object's art and its attached text inside the same wrapper. Put camera motion on their parent; use an inner image only for internal changes. Separate transform ownership prevents an entrance tween from fighting a camera or fold tween.

- **Physical shadows:** grounded objects keep tight contact shadows; a lifted roof reveals a warmer, broader shadow and pale underside. Keep the lighting direction coherent. Reuse generated shadow where appropriate; do not add a second opaque rectangular shadow around an atlas crop.
- **Parallax:** the foreground can travel farther than the back plane when the camera passes it. Hold the logical anchor still during a comparison. Fit movement amplitude to visible depth and narration, rather than perpetual floating.
- **A real fold:** set a hinge at the paper edge, move separate front/underside planes with coordinated transforms and occlusion, and expose meaningful content underneath. A single strip squeezed with `scaleY` reads as shrinking, not peeling a roof.
- **Paths:** register live SVG routes to measured points on the actual image. A cream cut-edge stroke, restrained ink shadow and seeded fibre treatment can bridge code lines into the paper world. Keep the endpoint, arrow direction and conditional gap semantically exact.
- **Typography on paper:** size and angle text for the usable face inside the *actual generated object*. Move it with the object. Test fit at the smallest scale, largest tilt and fastest crop; a text box fitting the canvas says nothing about whether it fits the ticket. Reserve quiet caption space before filling the stage.
- **Display type:** roughly 110–150 px at a 1920-wide frame worked for a Chinese explainer's dominant headlines, but use measured fit and reading distance rather than a fixed rule. Secondary qualifications need enough contrast and dwell to be read; they must appear while the associated claim is visible, including the first frame of a closing qualification.
- **Evidence:** distinguish literal data from conceptual scenery. Show relative probability as relative probability; use illustrative monetary examples only with labels; preserve comparison populations and uncertainty. Invented axes, fake scan imagery and citation microtext can turn an accurate voiceover into a false visual claim.

Build under `hyperframes-core`: one synchronously constructed paused timeline per scene, matching IDs, explicitly initialized local states, finite motion, deterministic seeds and framework-owned media. Use `fromTo` for cold-seek-safe state changes and static authored dimensions. Timeline length does not set scene duration. Load `hyperframes-animation` for allowed properties and runtime details; paper treatment does not excuse a technical exception.

**Ready for sequence review:** the scene produces the same frame when sought cold, its labels stay attached and readable throughout their visible lives, and each occlusion or camera movement reveals the intended state.

## 5. Fast cuts and sound that belong to the paper world

Use the project's edit references and the existing fast-passage direction/manifest contract. Acceleration is a sequence with a release, not an effect applied to every scene. The following are options to choose for a specific thought:

| Edit | Picture direction | Sound / reading constraint |
| --- | --- | --- |
| Match cut on a fold | A price-label crease becomes a contract crease at the same screen angle | A short fold or cut transient bridges the idea |
| Object wipe | Near-field red strip crosses the frame and reveals the receiving stage | Paper sweep follows its crossing, with a clear receiver after it |
| Macro snap | Jump from full mechanism to hinge, clause or price detail | Impact marks the explanatory detail; essential text gets a readable hold |
| Accelerating insert run | Progressively shorter views of distinct resource endpoints | Layer dry clicks/scrapes only as density builds; release into a quiet wider view |
| Occlusion cut | Door or roof briefly covers the lens; next state emerges underneath | Hinge/tear makes the occlusion physical; avoid hiding an essential claim |
| Graphic substitution | Same-position title/label changes while invariant object stays fixed | A dry stamp or paper tap marks the relabeling, not a new physical object |
| Conditional stop | Route reaches a broken bridge and movement stops | A short arrested sound followed by room for the qualification |

Build the clock from directed narration using the selected voice/provider, then transcription and word timing. Land action at spoken ideas, preserving sentence rhythm; do not accelerate narration just to fit an arbitrary shot grid. Pronunciation repairs must flow through the narration/timing pipeline. Generate acts at the user's requested limit using natural argument boundaries and measured audio duration; retain individual project ownership.

Choose SFX by mechanism and material: ticket slide, hinge click, paper fold, stamp pressure, fingertip tap, brief friction scrape, torn transition. Use a palette of compatible sounds and purposeful variations. Follow media discovery → audition/review → resolve/freeze; retain rights and source/hash records. Design transient density to support the voice; an impactful cut does not require a louder sound every time. A quiet pause can carry the strongest reversal.

Music follows the user's brief. One production used **no BGM**; that is a project choice, not an attribute of paper style. When the user explicitly requests no BGM, record that choice and keep music tracks absent. Otherwise follow the studio's existing music workflow. Measure the final encoded mix and listen to representative speech/transient passages; numerical loudness does not establish listening quality.

## 6. Elevate and deliver the actual render

Run the studio's existing audit/elevation passes. Compare original reference, browser composite and **decoded final MP4**: an attractive preview is not final evidence. Review every scene's establish → change → resolve; include fast passage release, actual cut boundaries, cold open and closing qualification. Sample the full visible life of troublesome text, masks and occluders, then play the relevant interval. Keep visual observation, listening, waveform/codec checks and functional playback claims distinct.

Use each elevation pass to fix observed weaknesses: missing paper core, dull vermilion, lifeless operator, overlarge shadow, unreadable rotated label, leftover baked heading, mask fringe, identical transition cadence, or too little recovery after a dense run. Recheck changes at their actual narration windows and on the new encode. Review records should identify the source and final-file hash so approval cannot silently refer to a superseded render.

For a multi-act film, verify duration limits, chapter starts, caption offsets and seam audio on the final assembled file. Retain picture packets when compatible to avoid unnecessary video recompression; mix from lossless sources when changing audio. Check actual frame/sample clocks rather than summing rounded displayed durations. These are delivery decisions, not a mandate to copy a historical custom renderer.

Follow the user's current completion checklist for loudness, covers, publishing copy and cleanup. Use the bundled [completion checklist](../../hyperframes/references/completion-checklist.md) as a scope template. When text-only cover generation is explicitly required, generate each requested format independently and inspect the original; do not manufacture an alternate format by cropping or overlays. Preserve prompts, outcomes and gallery/download mapping.

Verify approved retained files before cleanup, remove only explicitly identified superseded artifacts, preserve editable sources/provenance and compact review evidence, then recheck hashes, links and playback. Never report an unauditioned waveform check as listening or a set of frame samples as continuous viewing.

## Local worked project

