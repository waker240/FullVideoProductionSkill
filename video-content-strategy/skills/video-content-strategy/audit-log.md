# Audit Log — staging ledger for self-edits

The **working ledger** for the audit loops (see `audit-loops.md`). Proposals from fresh-eyes subagents land here with a confidence level and wait. Only what passes the gate (`audit-loops.md` § Gated Write-Back) gets written into the skill. This file is where the skill's self-improvement is *in flight*; `field-notes.md` is where *applied, validated* changes get their durable rationale.

**Append-only within sections. Don't delete proposals** — when one is rejected or superseded, mark it, don't erase it. The history of what was proposed-and-rejected is itself signal (it stops the same bad idea from being re-proposed every audit).

---

## How to use this file

- **Loop B (skill audit) proposals** → log under *Skill-Edit Proposals* with confidence Low/Medium/High.
- **Loop A (output audit) defect categories** → tally under *Output-Audit Tallies*. When a category hits the recurrence threshold (default: 3 distinct videos), open a Loop-B audit and move it to a Skill-Edit Proposal carrying that evidence.
- **Applied edits** (auto or approved) → move to *Applied* with a date, the driving lenses, and the confidence at application. Cross-reference the `field-notes.md` entry.
- **Gate reminder:** auto-apply only High + subtractive/clarifying + not-load-bearing + self-logged. Everything else waits for the user. Load-bearing set (off-limits to auto-edit): the Spine's 6 regularities, Style Register Library lock, Director's Sheet contract, channel-locked anchor coordinates.

---

## Skill-Edit Proposals (in flight)

Format:

```
### [PROPOSAL-id] — YYYY-MM-DD — [confidence: Low/Medium/High] — [status: staged / surfaced / applied / rejected]
- Lens(es): which auditor(s) raised it (+ whether independent convergence)
- Target: file §section
- Type: WRONG / MISSING / BLOATED / CONTRADICTORY  (+ subtractive? yes/no)
- Problem: {concrete}
- Proposed edit: {concrete change}
- Spine/doctrine implicated: {#N or name}
- Output evidence: {Loop-A recurrence signal, if any}
- Gate check: {which gate conditions met / failed}
- Resolution: {pending | applied on DATE | rejected because X | superseded by PROPOSAL-id}
```

### [P-001] — 2026-06-22 — [confidence: Medium] — [status: REJECTED-AS-PROPOSED, INVERTED + applied]
- Lens(es): Loop-B harvest of Education Ep4 (8 scenes). Corroboration = independent convergence across acts.
- Target: `reference.md` § Style Register Library → new "Trust gpt-image-2 for load-bearing text" subsection.
- Type: MISSING
- Problem AS PROPOSED: claimed gpt-image-2 glyphs are unreliable for load-bearing text; two acts (act3 ADP data, act6 Gramsci quote) double-encoded (raster plate + SVG/code text overlay) to guarantee correctness.
- USER CORRECTION (2026-06-22): the inversion is the real lesson. gpt-image-2 CAN be trusted for load-bearing text when prompted with discipline — the double-encoding the subagents did was over-caution, not best practice. The `video-generation-mcp` skill already documents this capability (verbatim quoting, typeface naming, numbered regions, anti-gibberish clause, transliteration QA). The only failure mode is a wrong PROMPT, fixed at the prompt, not by retreating to a code overlay.
- Applied edit: added "Trust gpt-image-2 for load-bearing text (do NOT double-encode)" to § Style Register Library — teaches confidence + the prompt discipline that earns it, and explicitly forbids the reserved-blank+overlay workaround.
- Spine/doctrine implicated: Constraint 1/2 (artifact layer); cross-ref `video-generation-mcp`.
- Resolution: applied 2026-06-22 (inverted per user). Original "guaranteed-text overlay" proposal REJECTED — see Rejected/Superseded.

### [P-002] — 2026-06-22 — [confidence: Medium] — [status: surfaced]
- Lens(es): Loop-B harvest of Ep4. Convergence: NC wired identically in open/act4/act7; flagged as "deferred — code pending" in reference.md § Implementation Status.
- Target: `reference.md` § Negative Cinema → Implementation (expand the thin "Implementation" subsection).
- Type: MISSING (operationalizes existing doctrine into a reusable engineering contract)
- Problem: the skill describes NC as a concept but not the coordinated-suppression mechanism. Ep4 built a clean one worth capturing.
- Proposed edit: document the **declarative NC-window contract** — an act declares `NC_BEATS: [start,end][]` (audio-relative frames) in one place; THREE independent subsystems read the same list: (a) the subtitle renderer holds the chunk + drops the scrim (`inNCWindow`), (b) post-FX multiplies every effect by `useNCDriver(windows, fadeFrames)` (1 outside → 0 inside, eased), (c) the persistent stage dims its substrate/particles/emblems. One source of truth → coordinated silence; default empty → acts without NC are unaffected.
- Spine/doctrine implicated: Negative Cinema; Spine #6 (the emptiest frame as the awe move).
- Output evidence: open/act4/act7 all wired it from the same `ncWindows` SceneShell prop.
- Gate check: additive → surface, no auto-apply.
- Resolution: APPLIED 2026-06-22 (user-approved). Expanded `reference.md` § Negative Cinema → Implementation with "The declarative NC-window contract."

### [P-003] — 2026-06-22 — [confidence: Low-Medium] — [status: surfaced]
- Lens(es): Loop-B harvest of Ep4 (act4 documented the remedy explicitly in `timing.ts`).
- Target: `reference.md` § Word-Lock & Timing (or a short note in Receiver-Runway-adjacent craft).
- Type: MISSING (craft remedy)
- Problem: forced-alignment STT scrambles chunk start-frames in some windows; the skill has no documented remedy, so word-locks land wrong.
- Proposed edit: **forced-alignment robustness** — when an STT window is non-monotonic/overlapping, do NOT word-lock inside it. Hard-lock only the section-START banners to verified-monotonic anchors, and let a continuous (non-word-locked) Canvas-layer object carry motion across the corrupt span. Derive `anchors.ts` only from chunks you've confirmed are monotonic.
- Spine/doctrine implicated: Receiver-Runway (re-entry), word-lock discipline.
- Output evidence: act4 chunks 0008–0028; documented fix in `scenes/act4/timing.ts`.
- Gate check: additive, single source → surface.
- Resolution: APPLIED 2026-06-22 (user-approved). Added `reference.md` § Forced-Alignment Robustness (after Audio Pre-Buffer Sign Discipline).

### [P-004] — 2026-06-22 — [confidence: Low] — [status: staged] — ROUTE ELSEWHERE (not this skill)
- Lens(es): Loop-B harvest of Ep4.
- Note: these emerged but belong in OTHER docs, not the design skill:
  - **Scene-barrel Stage/Shots/PostFX file triad** + `anchors.ts`-from-subtitles → `.cursor/rules/act-setup-from-audio.mdc` (codebase convention, not design doctrine). Convergent 8/8.
  - **Analytic cubic-bezier path eval (SSR-safe, avoids `getPointAtLength`)** for frame-deterministic particle-on-path → `video-motion-references` (Remotion implementation gotcha).
  - **Code-hoist duplicated primitives** (`SectionBanner`, `FootCorner`, the `entryP`+drop+breathe+strain/spent/glow `Cutout` shape, the local `Vignette`, `ParticleColorArc`, `ProliferationGrid`) into a shared component library → codebase refactor, not a skill edit. Each is an *instance* of an already-documented doctrine (argument-state externalizer / Receiver-Runway label / "no static stickers" / particle color arc / Single-Asset Replication), so the skill already covers the *why*; only the code is duplicated.
- Resolution: noted; route to the listed docs on user request. NOT a video-content-strategy edit.

### Convergence-validation note (not a proposal — evidence the doctrine holds)
Most of the Ep4 inventory is faithful implementation of EXISTING doctrine, with 8/8 independent convergence: Diegetic Stage (§ Diegetic Stage Pattern), Continuous Canvas Thread (§ Network Evolution), Corner Anchor (§ Most-Recent Dossier Anchors the Corner), dim raster substrate (§ Multi-Asset Scene Composition), proliferation grids (§ Single-Asset Code Replication), post-FX charged-beats-not-wallpaper (§ Cinema Layer / Video-Arc Drift), particle color arc (§ Density Rhythm). Convergence at this rate is strong corroboration that these doctrines are correct and applicable — log as a health signal, not a gap.

---

## Output-Audit Tallies (recurrence tracking)

Each row is a *category* of output defect, with a count of distinct videos it appeared in. When count ≥ recurrence threshold, it graduates to a Skill-Edit Proposal.

| Defect category | Videos seen in | Count | Lenses | Spine/doctrine | Status |
|---|---|---|---|---|---|
| *(none yet)* | — | 0 | — | — | — |

---

## Applied (the audit trail of self-edits)

Every edit the loops actually wrote into the skill, newest first. This is how the human audits the auditor and can revert.

Format: `### YYYY-MM-DD — [PROPOSAL-id] — [auto-applied / approved] — driving lenses — confidence — field-notes ref`

### 2026-06-22 — [P-002] — approved — Loop-B Ep4 harvest (convergent open/act4/act7) — Medium
- `reference.md` § Negative Cinema → Implementation: added "The declarative NC-window contract" (one `NC_BEATS` list → subtitle hold+scrim drop / `useNCDriver` post-FX suppression / stage dim).

### 2026-06-22 — [P-003] — approved — Loop-B Ep4 harvest (act4 documented remedy) — Low-Medium
- `reference.md`: added § Forced-Alignment Robustness (no word-lock in scrambled STT windows; hard-lock only verified-monotonic section starts; continuous canvas carries the corrupt span).

### 2026-06-22 — [P-001 INVERTED] — approved (user-directed inversion) — Loop-B Ep4 harvest — Medium
- `reference.md` § Style Register Library: added "Trust gpt-image-2 for load-bearing text (do NOT double-encode)" — teaches confidence in the model's glyph fidelity + the prompt discipline that earns it; forbids the reserved-blank+SVG-overlay workaround. NOTE: this REVERSES the subagents' instinct; the original proposal is in Rejected/Superseded.

---

## Rejected / Superseded (don't re-propose)

Proposals that were considered and declined, with the reason — so the same idea doesn't keep resurfacing every audit cycle.

### [P-001 original] — 2026-06-22 — REJECTED (inverted)
- Original proposal: "Guaranteed-Text Plate" — never trust gpt-image-2 glyphs for load-bearing text; always reserve a blank region and overlay the quote/numbers as SVG/code.
- Why rejected (user, 2026-06-22): the premise is backwards. gpt-image-2 CAN be trusted for load-bearing text with proper prompting (verbatim quoting, typeface naming, numbered regions, anti-gibberish clause, transliteration QA — all in `video-generation-mcp`). The Ep4 double-encoding was over-caution, not a best practice to codify. Replaced by the inverted edit logged under Applied [P-001 INVERTED]. Do not re-propose the overlay-workaround on future audits.

---

## Meta — health of the audit machinery itself (recursion guard)

Track per `audit-loops.md` § "The auditor audits itself." Review when running a skill audit.

- **Audit staleness:** are recent audits producing near-identical findings? If yes → rotate wildcard harder / retire a stale core lens. Last checked: —
- **Write-back calibration:** revert rate of auto-applied edits (too high → gate too loose; nothing ever reaches High → gate too tight). Last checked: —
- **Threshold tuning:** is the recurrence threshold firing too often (noise) or never (too high)? Current: 3 distinct videos. Last tuned: —
