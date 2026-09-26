# SFX Prompting Guide

How to write effective text prompts for AI sound-effect generation (Adobe Firefly Text to Sound Effects / Voice to Sound Effects). The same principles transfer to most text-to-SFX models.

Source: [Adobe Firefly — Writing effective text prompts for sound effects generation](https://helpx.adobe.com/firefly/web/work-with-audio-and-video/work-with-audio/writing-effective-text-prompts-for-sound-effects-generation.html) (last updated Oct 1, 2025).

---

## The core idea

Describe **what the sound actually sounds like**, not the scene around it. Prompts should be clear, concise, and direct, emphasizing the auditory characteristics of the sound itself. The model generates **one sound at a time** for maximum quality and control — layer multiple generations to build soundscapes.

---

## 5 rules

### 1. Describe the sound directly

Lead with the sound. Drop framing phrases like "the sound of…" and avoid over-literal, wordy descriptions.

| ✅ Do | ❌ Don't |
| --- | --- |
| `lion roaring` | `the sound of a lion roaring` |
| `heavy rain on a metal roof` | `the pitter-patter sound made by raindrops falling onto a corrugated iron rooftop` |
| `crackling campfire` | `the sound of wood burning in a fire pit with occasional pops and hisses` |

### 2. Use adjectives and verbs

Adjectives describe the **quality** of the sound; verbs convey the **action or behavior**. Together they steer the detailed character of the output. Adjectives also let you generate opposite variations of the same source.

✅ Do:
- `Very loud explosion` *or* `Soft explosion`
- `Forceful ocean waves crashing on the shore` *or* `ocean waves gently lapping on the shore`
- `Porcelain cup dragged over a wooden table`

### 3. Add commas to include multiple descriptions

Use comma-separated keywords to quickly stack multiple characteristics onto a single sound while staying concise.

✅ Do:
- `Robot, scifi, futuristic`
- `Cinematic impact, sharp attack`
- `Orchestra hit, low pitch, dramatic trailer`

### 4. Describe one sound at a time

The generator is built to produce **one sound per prompt**. For a soundscape that combines several sounds, generate each separately and layer them on multiple audio tracks. Use post-generation edits to fine-tune timing and volume, and download each sound for use in your project.

| ✅ Do (generate separately) | ❌ Don't (one prompt) |
| --- | --- |
| `footsteps on snow` | `footsteps on snow with desert wind in the background followed by bird calls` |
| `desert wind` | |
| `bird calls` | |

### 5. Use general descriptions for ambiences

For ambient soundscapes, **broad descriptions beat highly specific ones**. Overly detailed prompts can produce outputs that feel less organic or too literal.

✅ Do:
- `Forest ambience`
- `Chatter of people in a restaurant`
- `Room tone`
- `Traffic in a busy city`

---

## Quick reference

- **Be direct** — name the sound, skip "the sound of."
- **Use adjectives + verbs** — quality (`soft`, `forceful`, `metallic`) + action (`crashing`, `dragged`, `roaring`).
- **Comma-stack traits** — `cinematic impact, sharp attack`.
- **One sound per prompt** — layer multiples on separate tracks for soundscapes.
- **Stay broad for ambience** — `forest ambience`, not a paragraph.

## Prompt formula

```
[adjective(s)] [sound source] [verb / action], [extra trait], [extra trait]
```

Examples:
- `soft explosion, distant, muffled`
- `porcelain cup dragged over a wooden table`
- `metallic door slamming, reverberant, industrial`

## Bonus: pairing with a voice guide

Voice to Sound Effects lets you combine a text prompt with a recorded voice performance: the **text prompt defines what it sounds like**, while your **voice performance drives the timing and energy**. Useful when you need a sound hit on a precise beat or with a specific rhythmic dynamic.
