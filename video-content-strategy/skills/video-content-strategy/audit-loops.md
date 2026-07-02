# Audit Loops — the skill's feedback machinery

The self-improvement tier. This file is the **substrate, dimmed**: not read on a normal invocation, loaded only when running an audit. It defines how `video-content-strategy` gets fresh-eyes critique — of its *outputs* and of *itself* — and how those critiques become validated edits without degrading the skill.

> **Why this exists (Spine + EIF).** A system without a feedback loop is open-loop — it "uses the environment to fetch expected information, not to revise its plan" (the exact failure that produced the lazy default in the first place). And a maker cannot see their own blind spots: the context that built a thing is the context least able to critique it. The fix is *fresh-eyes nodes in clean contexts* — subagents that never saw the maker's reasoning, each carrying a different lens, whose disagreement is the signal. This is Algorithmic Complementarity (different nodes handling the class of computation they do best) applied to quality control.

> **The recursion that makes this skill self-improving.** Most skills are static reference. This one closes the loop: it can audit its own outputs, feed those findings into an audit of *itself*, and write validated improvements back — under a gate that prevents the self-edit from being its own new source of slop. The skill becomes an evolutionary computation, not a frozen artifact.

---

## The two loops (they compose into one system)

```
        ┌─────────────────────────────────────────────────────────┐
        │                                                         │
        ▼                                                         │
  [ built scene/video ]                                          │
        │                                                         │
        │  LOOP A · OUTPUT AUDIT                                  │
        │  fresh-eyes subagents critique the deliverable          │
        ▼                                                         │
  [ output findings ] ──┐                                        │
        │               │ patterns that recur across videos      │
        │               │ (a finding that keeps appearing isn't   │
        │               │  an output bug — it's a SKILL gap)      │
        ▼               ▼                                         │
  fix the video    [ skill-gap signal ]                          │
                        │                                         │
                        │  LOOP B · SKILL AUDIT                   │
                        │  fresh-eyes subagents critique the SKILL │
                        ▼                                         │
                  [ proposed edits → audit-log.md ]              │
                        │                                         │
                        │  GATED WRITE-BACK                       │
                        ▼                                         │
                  [ validated edits applied to skill ] ──────────┘
                        │
                        ▼
              next video is built by a better skill
```

**Loop A — Output Audit.** Fresh-eyes subagents review a *built* scene or video and report what's weak. Their job is the deliverable. Output of the loop: concrete fixes for *this* video, plus a tally of *which kinds* of weakness recurred.

**Loop B — Skill Audit.** Fresh-eyes subagents review the *skill itself* (SKILL.md / reference.md / field-notes.md) and propose edits. Triggered either on a cadence, on demand, or — most importantly — when Loop A surfaces the **same** weakness across multiple videos. A recurring output defect is rarely a one-off mistake; it is evidence the skill *taught* the mistake (or failed to prevent it). That is a skill gap, and it routes to Loop B.

**The composition is the whole point.** Loop A alone fixes videos forever, one at a time (open-loop — the skill never learns). Loop B alone risks editing the skill on theory with no contact with real output (Hologram risk — plausible edits that don't improve videos). Wired together: real output failures become the evidence base for skill edits, and skill edits are validated by whether the *next* output audit stops flagging that failure. That closed loop is the difference between a skill that drifts and one that compounds.

---

## Invariants (true for both loops)

- **Clean context, always.** Every audit subagent starts fresh — it must NOT inherit the maker's reasoning, the chat history, or the other auditors' findings. The maker's context is the contaminated context; the audit's value is that it doesn't share it. (When spawning, give the subagent only: the artifact under audit + its single lens mandate + the relevant skill excerpt. Never paste "here's what I was going for.")
- **Lenses run in parallel and independent.** Spawn all lenses for a given audit at once, each isolated. Convergence between independent lenses is the strongest signal; if you let them see each other's notes first, they collapse toward one view (the audit itself regresses to a mean — see anti-patterns).
- **Disagreement is data, not noise.** When the Cinematographer loves a shot the Naive Viewer found confusing, that tension *is* the finding. Don't average it away; surface it.
- **Findings are specific or they're discarded.** "Act 2 feels weak" is useless. "Shot 037's thesis-land has no pause-frame; the dossier and the city move at the same rate so it reads as one flat plane" is actionable. Reject vague findings the way the skill rejects filler shots.
- **Every finding names the Spine line or doctrine it implicates.** A finding that doesn't trace to a Spine regularity (#1-6) or a named doctrine is probably taste, not signal — log it low-confidence.

---

## The lens roster (hybrid: fixed core + one rotating wildcard)

Each audit run spawns the **fixed core** (always) plus **one wildcard** drawn from the pool (rotates every run). The core gives consistency and coverage of the load-bearing axes; the wildcard keeps the audit itself from regressing to a mean — a fixed roster, run forever, eventually has predictable blind spots the maker learns to pre-satisfy.

### Fixed core (always run)

Each lens is a complete persona with a single obsession. The subagent *becomes* the lens — it does not "consider" the lens, it embodies it to the point of being unfair to everything else. (Unfairness is the point: a balanced auditor is a weak auditor.)

| Lens | Obsession | The one question it asks | Implicates |
|---|---|---|---|
| **The Naive Viewer** | "I don't already know this. Did you lose me?" | At every moment: *do I know what this is about, what's being argued, and where we are?* Flags confusion, unexplained jargon, lost-the-thread moments. | Receiver-Runway (re-entry cost), externalization, segmenting |
| **The Skeptic / Anti-Slop** | "This is generic. Prove it isn't." | *Is this the mean — the safest, most-trained move? Could any channel have made this exact frame?* Hunts decoration, consensus aesthetics, idea-#0 shots that didn't win a divergence. | Effort Protocol, Apex vs Hologram, "What We Don't Do" |
| **The Cognitive Scientist** | "The viewer has one fixed-bandwidth brain." | *Where does this overload working memory, duplicate a channel (redundancy), or fail dual-channel complementarity?* Audits against Mayer/Sweller. | Spine #2 (bandwidth), #3 (externalize), complementarity |
| **The Cinematographer** | "Is this *authored* or *assembled*?" | *Where's the signature? Is there a pause-frame? Does the camera have a point of view, or is this wallpaper?* Audits awe, the 120% element, Cinema-Layer discipline. | Awe Diagnostic, Differentiation Principle, Spine #6 |
| **The Editor / Compressionist** | "Cut everything that doesn't earn its runtime." | *What can be removed with zero loss? Where does pacing sag? What's the EC/KC — signal vs. fill?* Audits density rhythm, runtime discipline, the complexity-fragility limit. | Spine #1 (coherence), density rhythm, Catalog Discipline |

These five map cleanly onto the Spine: every load-bearing regularity has at least one lens whose job is to catch its violation. That's the coverage guarantee.

### Wildcard pool (rotate one per run — pick by `date +%j` mod pool-size, or deliberately when a run has a known focus)

The wildcard is *adversarial freshness*. It is allowed to be strange. Pool:

1. **The Domain Expert** — embodies a specialist in the video's actual subject (the economist, the historian, the cognitive scientist *of the topic*). "Is the visual metaphor actually *true* to the mechanism, or is it a pretty lie?" Catches metaphors that mislead.
2. **The Mobile Viewer at 0.5× attention** — watching on a phone, half-distracted, sound sometimes off. "Does this survive a 4-inch screen and divided attention?" Brutal on small text, subtitle sizing, anything that needs sound to parse.
3. **The Rewatcher** — has seen this video three times and every prior episode. "What did I miss the first time? Is there a reward for rewatching? Does this contradict or compound the series' established vocabulary?" Audits depth-layering and series consistency.
4. **The EIF Auditor** — runs the framework's own protocol on the artifact: hardware-first, EC/KC, quadrant placement, channel-capacity, runway. "Where's the energy going; what's the coherence; which quadrant is this in?" (This is the lens used to derive the Spine — keep it in rotation so the skill stays EIF-coherent.)
5. **The Hostile Commenter** — the smartest, meanest person in the comment section. "What's the dunk? Where would a clever viewer screenshot this to mock it?" Catches unintentional comedy, pretension, over-reach, the frame that reads wrong out of context.
6. **The Competitor's Director** — the director of the single best channel in this space (Kurzgesagt / 3Blue1Brown / Wendover, picked to fit the video). "What would I have done here that you didn't?" Benchmarks against the genre ceiling.
7. **The Five-Years-Later Viewer** — watching after the field has moved. "What here is dated, trend-chasing, or Lindy-incompatible? What will still hold?" Audits timelessness (Constraint 1's Lindy claim).
8. **The Accessibility Auditor** — color-blind, or relies on captions. "Does the semantic color system survive deuteranopia? Does meaning collapse without the color channel?" Catches over-reliance on hue for argument-coding.

**Wildcard discipline:** exactly one per run. Two wildcards dilute the core's signal and make the audit a committee. The wildcard's findings are weighted the same as a core lens — freshness isn't a discount.

---

## Running Loop A — Output Audit

**Trigger:** an anchor scene is built; an act is assembled; a full video is render-complete; or on demand ("audit this scene").

**Procedure:**

1. **Assemble the artifact for fresh eyes.** Export what the auditor will actually judge: rendered MP4 (or a strip of stills at the shot's key frames) + the narration text for that span. Auditors judge the *output*, not the code. (A lens reading source code is auditing the wrong layer.)
2. **Spawn the fixed core + one wildcard in parallel**, each in a clean context, each with the prompt template below. Do not let them see each other.
3. **Collect findings**, deduplicate, and tag each: which lens(es) raised it, which Spine line / doctrine it implicates, severity (⚠️ breaks the shot / ⚡ weakens it / 💡 polish).
4. **Fix the video** for ⚠️ and ⚡ findings.
5. **Tally for Loop B.** Append each finding's *category* to `audit-log.md` under "output-audit tallies." When a category crosses the recurrence threshold (see Write-Back), it graduates to a Loop-B skill-gap candidate.

### Loop A subagent prompt template

```
You are THE {LENS NAME}. {one-line persona}. Your single obsession: {obsession}.

You are reviewing a scene from an educational essay-video. You did NOT make it and
you do NOT know what the maker intended — judge only what is on screen and in the
narration. Be unfair: your job is to catch what your specific lens catches, not to
be balanced.

ARTIFACT: {path to MP4 / stills}
NARRATION (this span): {text}

Ask your lens's one question relentlessly. Then report ONLY specific, located findings:

  - [SEVERITY ⚠️/⚡/💡] [timestamp or shot id] — {what is wrong, concretely} —
    {which Spine line #1-6 or named doctrine it violates} — {the smallest fix}

If a finding isn't specific enough to act on, discard it. If the scene is genuinely
strong on your axis, say so in one line and stop — do not invent problems to seem useful.
Return 0-6 findings. Quality over quantity.
```

---

## Running Loop B — Skill Audit (the self-edit)

**Trigger (any of):**
- **Cadence** — every N videos shipped (default: every 3), or a calendar cadence the user sets.
- **On demand** — "audit the skill," "fresh-eyes pass on the skill."
- **Recurrence escalation from Loop A** — a defect category crossed the recurrence threshold (the strongest trigger; it means real output is failing a way the skill permits).
- **Post-mortem** — a shipped video underperformed or a specific shot failed; audit what the skill should have caught.

**Procedure:**

1. **Define the audit's question.** Either open ("where is this skill weakest / most bloated / most internally contradictory?") or targeted (carrying the Loop-A recurrence signal: "videos keep failing re-entry cost in mid-act — what in the skill fails to prevent this?").
2. **Spawn the fixed core + one wildcard in parallel**, clean contexts, each given the relevant skill file(s) + the prompt template below. The EIF Auditor wildcard is a good default here.
3. **Each lens proposes edits** — not just complaints. A complaint without a proposed edit is logged but can't graduate.
4. **Converge:** collect proposals into `audit-log.md` as hypotheses with confidence (see Write-Back). Note where lenses *agree* (consensus → higher confidence) and where they *conflict* (conflict → stays low-confidence, needs human judgment).
5. **Apply the gate.** Only what passes the gate is written to the skill; everything else stays staged.

### Loop B subagent prompt template

```
You are THE {LENS NAME}. {one-line persona}. Your single obsession: {obsession}.

You are auditing a SKILL document that teaches an AI how to design educational videos.
You did NOT write it. Read it with fresh, unfair eyes through your lens ONLY.

SKILL EXCERPT(S): {paste SKILL.md and/or the relevant section(s)}
{if escalation:} TRIGGERING SIGNAL: real videos keep failing this way: {recurrence signal}

Through your lens, find where this skill is:
  - WRONG (teaches something that doesn't hold up on your axis)
  - MISSING (a gap your lens would never let pass)
  - BLOATED / INCOHERENT (EC overload — too much to apply, near the complexity-fragility limit)
  - CONTRADICTORY (two parts that fight)

For each, propose a SPECIFIC edit:

  - [WRONG/MISSING/BLOATED/CONTRADICTORY] [file §section] — {the problem} —
    PROPOSED EDIT: {concrete change — add this line / cut this section / reword to X} —
    {why this improves coherence-transfer-per-viewer-energy, the skill's core objective}

Bias toward COMPRESSION, not addition — this skill is already near its complexity-fragility
limit; "add another pattern" is usually the wrong answer. An edit that removes or merges
without losing signal is worth more than one that adds. Return 0-6 proposals.
```

---

## Gated Write-Back (the self-edit, made safe)

The danger of a self-editing skill is obvious: **the self-edit becomes its own new source of slop.** An auditor's plausible-sounding proposal, auto-applied, can degrade a load-bearing skill faster than any single bad video. So write-back is *gated* — borrowing the EIF Framework Evolution Protocol's confidence model wholesale (propose-as-hypothesis; promote only on evidence).

### Confidence levels (assigned when a proposal lands in `audit-log.md`)

| Level | Meaning | Default action |
|---|---|---|
| **Low** | One lens raised it; no corroboration; or it's taste, not traceable to a Spine line. | Stage in `audit-log.md`. Do not apply. Revisit if it recurs. |
| **Medium** | 2+ independent lenses converged on it, OR one lens + a Loop-A recurrence signal backing it. Traceable to a Spine line/doctrine. | Stage + **surface to the user** with the proposed edit. Apply on approval. |
| **High** | 3+ lenses converged, OR medium + confirmed by a real output failure the edit would have prevented, AND the edit is a *compression/clarification* (not a new pattern). | **Auto-apply eligible** (see gate). |

### The gate — what may auto-apply vs. what must wait

Auto-apply is deliberately narrow. A change auto-applies ONLY if ALL hold:

1. **High confidence** (per table above).
2. **It's subtractive or clarifying, not additive.** Cuts, merges, rewordings, fixed contradictions, corrected errors → eligible. *New patterns / new sections / new vocabulary → never auto-apply* (additions raise EC and maintenance cost; they always wait for human judgment, per Catalog Discipline).
3. **It touches SKILL.md/reference.md prose, not the locked load-bearing set.** The Spine's six regularities, the Style Register Library lock, the Director's Sheet contract, and channel-locked anchor coordinates in field-notes are **off-limits to auto-edit** — these are the load-bearing walls (cf. EIF's "do not touch the 6 Core Pillars"). Proposals against them are always surfaced to the user, never auto-applied, no matter the confidence.
4. **It records itself.** Any auto-applied edit appends a dated line to `audit-log.md` (what changed, which lenses drove it, the confidence) so the human can audit the auditor and revert.

Everything not meeting all four → stays staged in `audit-log.md` for the user. Default posture is **stage, don't apply**: when unsure, the proposal waits.

### Promotion flow

```
lens proposal ──▶ audit-log.md (Low)
                      │ another lens / another video corroborates
                      ▼
                 audit-log.md (Medium) ──▶ surfaced to user ──▶ applied on approval
                      │ third corroboration + output-failure evidence + is-subtractive
                      ▼
                 audit-log.md (High) ──▶ [GATE] ──▶ auto-applied + logged
                                              │ fails any gate condition
                                              ▼
                                         surfaced to user
```

### Mirroring on every write-back

Any applied edit (auto or approved) must be written **identically to both skill copies** (`~/.cursor/skills/video-content-strategy/` and project `.kiro/skills/video-content-strategy/`), which are byte-identical by contract. After applying, verify with `diff`. An edit that lands in only one copy is a corruption, not an improvement.

### The auditor audits itself (recursion guard)

Per EIF's recursive rule: the audit machinery is itself a node in the system and must be audited. Two self-checks:

- **Is the audit regressing to a mean?** If the last several audits produced near-identical findings, the lens roster has gone stale — rotate the wildcard more aggressively, or retire a core lens that keeps finding nothing. A predictable auditor is a satisfied blind spot.
- **Is write-back over-firing?** If auto-applied edits are frequently reverted by the user, the gate is too loose — raise the bar (require an output-failure citation for every High). If nothing ever reaches High, the gate is too tight — check whether lenses are proposing edits at all, or just complaining.

---

## Cadence — when to run what

| Trigger | Loop | Scope |
|---|---|---|
| Anchor scene built | A (Output) | That scene. Lightweight — core lenses on the stills. |
| Act assembled | A (Output) | The act. Full core + wildcard on rendered MP4. |
| Video render-complete | A (Output) | Whole video. Full audit; this is the richest output-audit moment. |
| Every 3 videos shipped (default) | B (Skill) | Open audit of the skill. |
| Loop-A category crosses recurrence threshold | B (Skill) | Targeted audit carrying the recurrence signal. **Highest-value trigger.** |
| Shipped video underperformed | B (Skill) | Post-mortem: what should the skill have caught? |
| User says "audit the skill / fresh eyes" | B (Skill) | On demand. |

**Recurrence threshold (default):** the same output-defect category flagged in **3 distinct videos** (or 2 videos + 2 lenses agreeing within one). Tune in `audit-log.md` if it fires too often (noise) or never (set too high).

**Don't over-audit.** Auditing is itself energy expenditure (subagent calls, human review time) — it obeys the same coherence budget as everything else. Audit anchor outputs and skill-cadence, not every utility shot. An audit that runs on everything trains the team to ignore it (alarm fatigue = the audit's own regression to noise).

---

## Anti-patterns (the audit failing as a system)

- **Contaminated context.** Spawning auditors with the maker's reasoning in scope. They'll ratify, not challenge. The whole value is the clean-room context — protect it.
- **Serial, peeking lenses.** Running lenses one-by-one with each seeing the last's notes. They converge to one view; you lose the independent-convergence signal. Parallel + isolated always.
- **The balanced auditor.** A lens that tries to be fair finds nothing sharp. Each lens must be *unfair* — obsessed with one axis to the exclusion of all else. Balance happens at convergence, not within a lens.
- **Complaint without proposal (Loop B).** "This section is confusing" can't graduate. Require a concrete proposed edit, or it stays a Low note forever.
- **Additive drift.** Auditors love proposing new patterns; new patterns raise EC toward the complexity-fragility limit. Bias hard toward compression; gate additions behind human approval always.
- **Auto-apply creep.** Loosening the gate "because the auditors are usually right." The gate's narrowness is the safety. The cost of a missed good edit (it waits for approval) is tiny; the cost of an auto-applied bad edit to a load-bearing skill is large. Asymmetric — keep the gate tight.
- **Audit theater.** Running the loop to *look* rigorous, then ignoring the findings (or rubber-stamping every proposal). Either makes the loop noise. Findings must change the video or the skill, or the audit shouldn't have run.
- **The audit regressing to a mean.** The deepest failure: the audit roster itself becomes predictable, the maker pre-satisfies it, and it stops catching anything real. Countered by the rotating wildcard and the self-check above — but stay alert: an audit that always passes is an audit that has stopped working.

---

## Where this connects

- **The Spine** (`SKILL.md`) — every lens traces its findings to a Spine line; the Spine is the audit's rubric.
- **The Effort Protocol / Critic Pass** (`SKILL.md`) — the Critic Pass is the *maker's own* fast self-audit (one mind, switching hats); the Output Audit is the *fresh-eyes* version (many clean-context minds). Critic Pass before declaring a shot done; Output Audit after building anchor work.
- **`audit-log.md`** — the staging ledger where proposals live with confidence levels before promotion.
- **`field-notes.md`** — when a Loop-B edit is applied, the *rationale* and validation status are recorded there (the durable record); `audit-log.md` is the *working* ledger (proposals in flight).
- **EIF Framework Evolution Protocol** — the confidence/hypotheses/promotion model is borrowed directly; if that protocol updates, mirror the change here.


