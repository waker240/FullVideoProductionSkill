<!-- Public portability adaptation, 2026-09-26. -->

# Asset Foundry — generated · stock · captured · reused

How raw visual material gets made, found, and tracked. Cinematic depth comes from **layers** (fg/mid/bg at different parallax rates, dimmed substrates under live signal layers) — the foundry produces those layers. Batch production is prime subagent work (`references/direction-and-audit.md`).

## 1 · Generated plates, cutouts and substrates

Use [asset-generation.md](../../hyperframes-creative/references/asset-generation.md) with the selected provider or available host image tool. It covers optional Codex invocation, saved-file provenance, actual dimension/alpha checks and compositing alternatives. No generation server is included.

- **Selected B-paper / editorial paper theatre:** read `hyperframes-creative/references/paper-theatre.md` before shotlisting or generating. It covers actual storyboard-image references, paper material, clean plates, separate operators, physical folds, text registration, semantic sound and encoded review. Its prompt companion supplies reusable requests and a worked scene.
- **Ownership:** raster owns material, illustration and stage architecture; code owns changeable factual labels, counts, paths and word-locked marks. Baked static text needs exact quoted strings and full-resolution glyph QC.
- **Decomposition:** split only for independent motion, occlusion, parallax, recoloring or registration. Preserve a rich unified plate when splitting buys no control. A moving operator needs a clean stage beneath it, not a duplicate baked into the background.
- **Cutouts:** request actual transparency with the selected generator when supported and preserve generated alpha. Inspect channels and edges; a drawn checkerboard is not alpha. Label an RGB plate with an authored mask honestly and inspect its moving boundary.
- **Registration:** map overlays from measured output pixels through actual image scale/crop and camera transforms. Prompted placement is not geometry.
- **Provenance:** save exact prompts, input roles and hashes, returned originals, selected project-local copies, dimensions/mode, component regions, revisions and review records. Render dependencies live inside the project.
- **Cinematography:** use masks, camera and layering to reveal a mechanism. Material-rich evidence can remain still while attention moves. A texture over unrelated card UI does not reproduce an approved illustration style.

For a mixed technology film, use `hyperframes-creative`'s layered-direction guidance. Generate the material, character, environmental action or shot whose craft code cannot economically supply, then retain precise UI/labels/causality in code. A detailed reference image does not approve a weak procedural foreground; compare actual full-size and thumbnail frames before a batch.

For authorized video generation, read the installed provider skill (in this workspace `dreamina-canvas-cli`). Save actual submitted mode/model/resolution/duration, input IDs, prompt, request/job IDs, status, cost reservation and returned original; the planned mode is not the submitted mode. Poll/recover stable IDs before retrying ambiguous jobs. Probe and watch outputs, choose or mute embedded audio explicitly, and label hypothetical scenes appropriately. Native-rate moving plates, exact masks and synchronized overlays are distinct layers; generating a clip never completes its composition. Do not carry the case's Seedance mini/720p/2000-credit limits into a new job without current instruction.

## 2 · Stock (Pexels · Pixabay · Unsplash — keys already in `.env`)

Full API guide: repo `stock-assets-pexels-pixabay-unsplash.md` (same content: `hyperframes-media/references/stock-media-apis.md`). Operating rules:

- **Routing:** video/4K/general photo → Pexels · illustrations/vectors/category or duration filters → Pixabay · modern lifestyle photo → Unsplash (images only; MUST hit `links.download_location` + credit "Photo by X on Unsplash").
- Pexels auth is a **bare** key header (not Bearer); Pexels video duration is filtered client-side; **Pixabay URLs expire — download immediately**; same query = same top result (change keywords, don't retry).
- **Provenance or it didn't happen:** store `{provider, creator, source_url, license}` per asset (an `assets/STOCK.md` or sidecar json) — needed for credits and licensing proof.
- Grade stock into the palette (duotone/dim/overlay) so it reads as *chosen*, not pasted; footage plates obey the same "subjects, not stickers" law.

## 3 · Own-render clips + the montage reel

`assets/clips/` reuses peak moments from past renders (the evidence library — extract more with `ffmpeg -ss <s> -t <d> -i render.mp4 …`, named `<Project>-<Act>_<frames>_<slug>.mp4`). For a fast-cut reel: `node scripts/build-montage.cjs` with a `scripts/montage.json` (movements: opener hard-cuts · 3×3 grid wall · ken-burns hero dwells · accelerating climax; it writes `montage.example.json` to start from). Mount the reel as an `index.html` video track (framework-owned), overlay scene riding above it.

## 4 · Screenshots / captured UI

Real product/site frames: headless Chrome (`npx playwright screenshot` or the repo's capture tooling) at exact 1920×1080 or 2× for push-ins. Recreate small UI in DOM when it must animate (code-recreated document, technique-library §8); screenshot when authenticity IS the argument.

## 5 · Fonts & charts

- Fonts vendored per project (`fonts/*.woff2`, `@font-face` inside every scene template). The semantic trio (sans=captions/UI, serif=human voice, mono=numbers/telemetry) is load-bearing — don't collapse it.
- Charts: keep the REAL chart PNG as a dimmed substrate and rebuild the data as live D3/SVG on top (verified numbers only; label simplifications honestly).
