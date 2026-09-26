# Design Adherence

Post-authoring verification that the composition follows the current design direction. Run it after building, before serving the preview. Resolve later user instructions and revision-specific choices before reading an older spec as authority. For reference-led or iterative work, use [reference-led-direction.md](reference-led-direction.md)'s protected intervals and repair acceptance tests.

If a design spec (`frame.md` / `design.md`) exists, read the HTML and check:

1. **Colors** — code-owned role colors match the active palette and approved scene variants. Flag arbitrary role/color drift; do not treat pixels in generated material/footage as unlisted palette violations.
2. **Typography** — font families and weights match the spec's type spec. No substitutions.
3. **Corners** — border-radius values match the declared corner style, if specified.
4. **Spacing** — padding and gap values fall within the declared density range, if specified.
5. **Depth** — shadow usage matches the declared depth level, if specified (flat = none, subtle = light, layered = glows).
6. **Avoidance rules** — if the spec has a section listing things to avoid (commonly "What NOT to Do", "Don'ts", "Anti-patterns", or "Do's and Don'ts"), verify none are present.

Report violations as a checklist. Fix each one before serving.

If no design spec exists (house-style-only path), verify:

1. **Palette consistency** — semantic roles and the chosen visual registers remain coherent. A planned dark/light or material/UI change is allowed; arbitrary per-scene color invention is not.
2. **No lazy defaults** — check the composition against `house-style.md`'s "Lazy Defaults to Question" list. If any appear, they must be a deliberate choice for the content, not a default.

## Rendered trajectory gate

Source review cannot satisfy this gate. After the first rough render of **each act**, extract establish / midpoint / resolve frames for every semantic scene. For the cold open also sample cue boundaries around `0.3`, `0.8`, `1.5`, and `2.5s`. Review the contact sheet, then open the weakest frames at full resolution.

Accept only when every scene has:

- agreement with the narration and its evidence boundaries at that instant; when the voice carries the explanation, visuals may guide attention rather than independently restate the whole argument;
- one active focal point and, where the scene explains a mechanism, a visible `BEFORE → cause → AFTER` turn; a reference/qualification/large-text comparison can use an intentional readable hold;
- coherent representation and world quality—no crude literal primitives, plate/prop mismatch, or empty renderer void;
- caption/safe-area integrity, no blank/placeholder state, and no dead late hold;
- preserved benchmark frames in improvement passes.

Repeat the same review on the encoded master at transitions and protected benchmarks; compression and host-timeline seams can differ from HTML snapshots. Use `hyperframes/scripts/review-master.cjs` where available.

For inherited animated studies, add the first visible state, every factual reveal, last complete result and final overview at the **actual narration clock**. Inspect long holds more densely and review affected neighboring seams. A source fix or mechanical seek PASS stays separate from encoded confirmation. Audit records identify revision, source/output hash, scene and time, observed problem, repair and verified result; preserve protected successful intervals. Sound may remain explicitly unassessed when no subjective listen occurred rather than receiving an invented score.
