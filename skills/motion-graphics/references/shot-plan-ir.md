# shot-plan IR

The single contract between Director and Builder. One file: `PROJECT_DIR/shot-plan.json`.

```jsonc
{
  // ── envelope (every category) ──
  "category": "kinetic-type | stat | charts | logo-reveal | lower-thirds | webpage | news | tweet | asset-fusion",
  "duration_s": 6,
  "fps": 30,
  "canvas": { "w": 1080, "h": 1920, "aspect": "9:16" },
  "style": "free-form visual direction (mood / energy / reference)",
  "palette": ["#…"], // or "derive-from-asset"
  "font": "<HF embed-list font>",
  "beats": [0.4, 1.233], // optional accent times, always composition-local seconds
  "export": "mp4", // or "alpha-overlay" (transparent webm/mov)
  "fast_passage": null, // optional; use only for an intentionally high-velocity arc
  // or: { "intent": "momentum|compression|overwhelm|rupture",
  //       "phase_refs": { "baseline": "beat:0|scene:<id>", "escalation": ["beat:1"],
  //                       "peak": "beat:2", "release": "scene:<id>" }, "eye_trace": "…",
  //       "primary_family": "…", "accent": "…", "sound": "…", "legibility": "…" }

  // ── sourcing seam (Director Part 1) — [] means skip the source phase ──
  "asset_needs": [
    {
      "role": "hero",
      "kind": "image|icon|logo|svg|news|web|tweet",
      "query": "…",
      "source": "…",
      "treatment": "cutout|recolor|vectorize|none",
    },
  ],

  // ── build directive (Director Part 2, reuse-first) ──
  "block": "<catalog block id, e.g. data-chart | caption-kinetic-slam>", // optional
  "customize": {
    /* what to change on the block: data, text, palette, positions */
  },

  // ── category-specific content ──
  "content": {
    /* shape varies by category, below */
  },
}
```

**Per-category `content` shapes:**

- `kinetic-type` → `scenes[]` `{ id, start, end, text, emphasis_words[], emotion, motion, beats[] }`
- `stat` → `{ value, prefix, suffix, label, ring: bool }`
- `charts` → `{ type: bar|line|pie|race|pct, data[], labels[], headline, axes: bool }`
- `logo-reveal` → `{ logo: <asset path>, tagline, url }`
- `lower-thirds` → `{ name, role, position, brand_colors[] }`
- `webpage` → `{ url, capture, highlights: [ { selector|region, label } ] }` (step-highlight a real captured page)
- `news` → `{ outlet, headline, body, keyword, layout: A|B, logo?, date?, subject? }` (article-highlight: lay text out readable — **no zoom** — then sweep a marker band over the keyword in place. Layout **A** = centered-emphasis 9:16 text-only; **B** = full article 16:9 with `logo` + `date` + `subject` (a person photo → `remove-background` cutout))
- `tweet` → `{ author, handle, avatar, text, metrics }`
- `asset-fusion` → `{ data_type, asset: <path>, affordance, element_positions: {center, extent, safe[], avoid[]}, derived_palette[], connectors[] }`

**Invariants:** top-level `beats` and per-scene `start`/`end` are composition-local seconds · `scenes` (if present) partition `[0, duration_s]` with no gaps/overlaps · empty `asset_needs` ⇒ Step 2 (source) is skipped · a named `block` ⇒ the Builder reuses + customizes it rather than hand-authoring · every `fast_passage.phase_refs` target resolves to an existing `beat:<zero-based-index>` or `scene:<id>`, so it never becomes a second clock.
