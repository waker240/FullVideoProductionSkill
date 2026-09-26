# source phase — reviewed local assets

Runs **only when `shot-plan.json.asset_needs` is non-empty** (form categories never reach here). Each need must end as a reviewed, frozen project-local file plus provenance in the media ledger. `/media-use` adopts and inventories those files; it does not search, download, or generate them.

## Acceptable inputs

- A user-supplied image, icon, logo, SVG, screenshot, audio file, or clip.
- An already-reviewed file in the project or approved local library.
- An item found or captured with a separate, authorized research/capture capability, after reviewing the exact source, usage terms, and candidate quality.

Never accept a remote URL, an unreviewed first result, an unreviewed generated placeholder, or a name-only audio cue as the final composition asset. Freeze the selected bytes under `assets/` before design begins.

## Per asset need

- `image / icon / logo / svg` → keep the chosen source file and provenance; optional treatment may use `hyperframes-media` for background removal or other deterministic asset preparation.
- `news / web / tweet` → preserve the source URL, capture date, usage rationale, and the exact reviewed screenshot or local media file. A failed specific need is dropped, not silently broadened into unrelated imagery.
- `bgm / sfx` → use only an individually reviewed audio file. Normalize it deliberately when required, probe the result, and keep its source/license metadata. Do not invoke a retrieval or music-generation engine.

## Steps

1. Read `asset_needs` from `shot-plan.json`.
2. For each need, inspect user/project/library candidates or perform separately authorized research/capture.
3. Review candidates as `use / maybe / reject`; selection is the hard part. Confirm source and usage terms for the selected item.
4. Freeze each selected file under the project's `assets/` directory. Never leave a network URL in the composition.
5. Adopt all frozen files:

   ```bash
   (cd "$PROJECT_DIR" && node <MEDIA_USE_DIR>/scripts/resolve.mjs --adopt --project .)
   ```

6. Read `.media/index.md` and add any project-specific source/license notes the generic probe could not infer.
7. For `asset-fusion`, also capture the asset's measurable geometry so Director Part 2 can set `element_positions`, plus an eyedropper palette.

## Degrade gracefully

If no reviewed file satisfies a need, mark it unmet in `context.log`; the category falls back to asset-free where possible (for example, a news treatment becomes a typographic headline without an image). Stop clearly when the requested treatment fundamentally depends on the missing asset.
