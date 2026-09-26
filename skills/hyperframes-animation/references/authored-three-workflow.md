<!-- Public portability adaptation, 2026-09-26. -->

# Authored Three.js: fabrication, light and absolute-time motion

Read after [the Three.js adapter](../adapters/three.md) admits true 3D. This reference preserves useful methods from earlier film builds even though the finished film discarded much of their visual language. A superseded palette or metaphor does not invalidate fabrication, lighting, camera and seek techniques. Conversely, technical sophistication does not establish that a shot belongs in the film.

## Separate the fabrication kit from the shot

Keep a small shared kit for materials, geometry, studio light, camera evaluation and resource cleanup. Each shot owns subject, spatial mechanism, motion phases and composition. Avoid a universal machine factory that forces every concept into the same gear, slab, cable or rotating display.

Use role names such as `housing`, `edgeMetal`, `activeSignal`, `recess`, `glass` and `labelInk`. The historical dark migration retained names like `ivory` and `brass` while changing their actual materials; that compatibility trick kept old choreography running but makes future direction harder to inspect. In a new kit, express the actual material role and version the palette separately.

## Fabricate a designed object

| Technique | Useful outcome | Craft / semantic check |
| --- | --- | --- |
| `Shape` + `ExtrudeGeometry` with rounded outline and bevel | Machined housing, panel, aperture rim, custom silhouette | Radius and bevel scale fit the object; intentional silhouette before microdetail |
| Shape holes | Actual opening that can reveal a route or interior | It must remain a hole in silhouette/occlusion, not a dark disc painted on a solid face |
| `LatheGeometry` from an authored profile | Collar, bearing, rim, knob or circular cutaway | Profile carries the design; avoid default torus as a universal solution |
| Endpoint-oriented cylinder/rod | A structural connection between known points | Length, midpoint and quaternion follow endpoints; do not use rods as arbitrary graphic decoration |
| Curve + `TubeGeometry` | A cable/path where physical routing matters | Cross-section, attachment and bend radius fit the scene; exact causal route stays legible |
| Separate child groups | Hinge, layer lift, plug, moving gate | Pivot at the physical joint; moving part does not drag unrelated geometry |
| Canvas textures / local generated maps | Fine etched surface, material variation, diegetic label | Fixed seed; sufficient texel scale at the closest camera pose; text remains exact |

Primitives are construction inputs, not a forbidden API. The visual failure is presenting an unstyled default cylinder/box as a finished recognizable hero. Authored abstract geometry can be a strong final subject when shape and motion explain the idea. Make the still-frame comparison against the simpler representation before investing in hundreds of fine parts.

Model topology is also a factual choice. A connected cable implies connection; an absent latch implies physically available removal; a spring graph implies a response model. Keep those claims within the script's actual scope. Label a conceptual response instead of inventing measured force from a decorative spring animation.

## Make material read through illumination

The retained `act01-craft.js` built an environment from large emissive softbox planes, converted it through `PMREMGenerator`, and combined it with key/fill/rim lights. That makes metal and glass reflect a designed studio rather than a blank environment. The reusable method is:

1. Choose the substrate/background and camera scale with the hero in place.
2. Place broad key reflections to describe major faces, narrow edge reflections to separate silhouettes, and restrained fill to keep dark surfaces readable.
3. Use roughness, metalness, clearcoat/transmission and microdetail to separate material roles. Bump/roughness maps use data color space; color textures use the renderer's color-texture convention.
4. Tune contact and cast shadows at representative near/wide poses. Avoid acne, detached hover shadows and flat-black cavities hiding the mechanism.
5. Evaluate tone mapping and exposure on the actual output frame. Do not solve a weak silhouette by adding more glow or a brighter background everywhere.

Seeded brushed and micro-bump maps should be subtle enough to survive changes of scale without shimmering. Preserve a deterministic seed and generate them once during setup. Pin output dimensions and pixel ratio. Share geometry/materials where practical; dispose of owned geometries, materials, textures, environment targets and renderer when a review candidate is unmounted.

The historical kit used a 35° perspective lens, ACES tone mapping, VSM shadows and specific light values. Those are observed choices, not universal defaults or current API promises. Use the project's pinned installed Three.js version and validate its supported settings.

## Evaluate movement from time

Build/load resources before render-critical seeking, then use `renderAt(localTime)` to reconstruct every animated property. Three-dimensional geometry and camera state should not depend on which frame was rendered previously. Use pure phase functions or one synchronously constructed paused timeline, according to the adapter/core contract.

- **Camera:** author time keys with position and target together. Clamp before/after the route, give arrival holds explicit intervals, guard zero-length spans and keep lens changes deliberate. Update projection when FOV/aspect changes.
- **Mechanical stop:** if a rotor decelerates after a cue, derive its accumulated angle from an analytic piecewise function of time. Do not integrate angular velocity from frame deltas.
- **Deforming cable:** retain fixed tube topology; derive its control points from time, compute the curve and Frenet frames, rewrite vertex positions from those frames, then update normals and bounds. Do not allocate a new geometry every frame or iteratively deform the previous frame.
- **State branches:** at every seek, explicitly assign all properties touched by a phase, including visibility/opacity/material state in later-to-earlier transitions. A conditional `if (t > cue) set…` without the earlier-state assignment fails reverse seeking.
- **Projected labels:** project the actual world anchor through the current camera after the camera is set; apply screen dimensions and any composition crop. Keep captions separate. A label must follow its object throughout the move, with safe placement that does not cross another causal label.

`compileAsync` or representative warm-up frames may reduce first-seek stalls in a supported pinned runtime; they are readiness work, not animation construction. Finish readiness by restoring the initial state and performing a real first-frame render. Do not let warm-up history become the state source.

## Prove quality and determinism independently

Technical checks: load readiness, deterministic seed, identical cold/reverse/forward samples, fixed render resolution, no time-dependent remote assets, no growing resource count across candidate mounts. Inspect at least the mechanism's start, peak intervention and result; choose extra times where the geometry/topology changes.

Visual checks: hero silhouette/material, coherent world, contact/occlusion, readable mechanism and labels, camera arrival/return, and the fallback comparison. A source-matched proof only proves which source was sampled. A technical PASS must not stand in for the director looking at those actual frames.

For a long narrated scene, audit the re-timed encoded result again. A good 12-second 3D study can become a slow orbit around a finished diagram when stretched. Cut, re-stage, switch representation or add a meaningful consequence according to the narration; do not preserve the renderer merely because its construction was expensive.

## Portable implementation references

Use the bundled [Three.js adapter](../adapters/three.md) and [directed camera](directed-camera.md) guidance. Build the material factory, camera keys and any projected annotations inside the project; preserve deterministic seeds and disposal. No historical project source is required or included. Technical sophistication and candidate existence do not establish final approval.
