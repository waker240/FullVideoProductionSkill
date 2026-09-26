<!-- Public portability adaptation, 2026-09-26. -->

# Paper theatre — prompt and shot examples

Read [paper-theatre.md](paper-theatre.md) for the directing workflow and [asset-generation.md](asset-generation.md) for actual built-in tool calls, image inspection and saved output handling. These prompts are adaptable examples. Preserve the selected reference's material language; change the mechanism, composition and factual boundary to match the script.

## A complete storyboard keyframe

Use this for an initial concept image when no approved B-paper image exists. Generate one complete image rather than a contact sheet, so image authority and reading order can be judged at video scale. Baked Chinese is appropriate here; read every character in the result.

```text
Use case: stylized-concept.
Asset type: one complete 16:9 Chinese documentary storyboard keyframe.
Primary request: show that physically identical objects can receive different valuations.
Style/medium: sophisticated editorial silkscreen and sculptural cut-paper theatre. Warm cream handmade rag paper, dense printed silhouettes, visible fine fibres, sharp cut edges with pale exposed paper core, deliberate planar folds and tight warm contact shadows. Mature, decisive, tactile.
Palette: cream substrate #F3ECD9; charcoal objects #24221F; active folded paper #D5422C; tiny supporting cobalt #315AA6; raised edges #FFF3D8. Preserve rich vermilion pigment and luminous cream.
Subject: two exactly identical charcoal cut-paper wine bottles, same dimensions, contents and blank label. They stand on one restrained ink baseline. Above them a single broad vermilion price ribbon is folded into two different heights; an elegant charcoal paper hand raises only the ribbon at the right. The bottles stay physically unchanged.
Composition: one asymmetric full-frame landscape, 16:9, preferably 1536x864. Giant headline in the upper-left; the folded ribbon crosses the upper-right and middle with its pale core visible. The identical bottles anchor the lower half. Sparse enough to understand immediately; paper material fills the whole background.
Text (verbatim): “同样的东西” and “为什么估值不同？”. These are the only strings, without quotation marks. Bold, sharply drawn Chinese Song-style display type. Maintain comfortable edge clearance.
Constraints: one scene, no panels, no grid. No invented numbers, additional lettering, logos or watermark. No photographic glass, plastic, metallic gloss, cute mascot or neon light. Folded paper, not a rising data chart; valuation changes, not bottle quality.
```

After selection, save this image as an original style anchor. For production, pass that actual inspected image as a reference. Prompt-only recollection loses its material, light and edge character across acts.

## A reusable substrate

Inputs: the inspected original opening and closing storyboard images. The prompt identifies their role; the tool call passes their absolute paths.

```text
Use case: style-transfer.
Asset type: opaque full-frame paper substrate for an animated documentary.
Input image 1 and input image 2 are references for the exact cream paper and lighting only.
Create a clean continuous expanse of their warm #F3ECD9 handmade rag paper, with the same fine mottling, delicate fibres, pigment variation and luminous warm light. Match the material at ordinary viewing distance; avoid coarse stains or repetitive noise.
Composition: 16:9 landscape, texture extending edge to edge. This is the stage behind moving foreground objects. Keep the whole surface usable, with no vignette or bright spotlight.
Remove all subjects, ribbons, labels, shadows belonging to objects, printed marks and text. Return only the matched opaque paper substrate. No transparent background, frame or decoration.
```

## A production stage: access to resources

Input: inspected original storyboard reference showing the same mechanism. This stage provides coherent material and geometry. Components and a clean version permit independent actions later.

```text
Use case: stylized-concept.
Asset type: premium full-frame 16:9 animation stage with no text.
Input image 1 is the strict material, palette, silhouette and composition reference. Preserve its saturated vermilion paper, charcoal cut architecture, cream rag-paper fibres, pale cut edges and warm contact shadows. Recompose the following mechanism as one coherent dimensional paper world.
Scene: a monumental folded charcoal portal near the left third. A broad vermilion paper road passes its hinge, then splits into three sweeping bridges across the right two-thirds at different heights. Each bridge has a pale torn edge, visible folded underplane and tight contact shadow. The upper bridge approaches a refined paper engineer at a drafting plane, the middle approaches two business hands preparing to shake, and the lower approaches a blank cream funding folio and plain vermilion disc. The three routes stop at thresholds: expected access rather than achieved outcomes.
Composition: asymmetric wide stage, high resolution, 16:9. Strong foreground/middle/background separation. Leave a usable area left of the hinge for a separately animated ticket and hand. Leave small organic cream spaces beside the three destinations for later typography. Keep essential subjects clear of the lower caption area; it remains quiet paper.
Palette: #F3ECD9 cream, #D5422C vermilion, #24221F charcoal, only a short #315AA6 cobalt connector. Raised paper cores #FFF3D8.
Lighting/material: consistent warm directional light, dense dyed paper, tiny fibre and pigment variation, elegant adult silhouettes, physical cut depth. No glossy or photoreal objects.
Text: none anywhere. Blank ticket surfaces and pages; no Chinese, English, numbers, faux microtype, logos or stamps with symbols. No victory stars, crowns, money shower or guaranteed-success imagery.
```

If the resulting stage contains an unwanted ticket, hand, glyph or duplicate receiver, make a targeted edit with the inspected generated stage as the edit target:

```text
Edit target: input image 1. Remove only the large ticket and attached foreground hand from the left. Reconstruct the matching uninterrupted cream substrate and the portal edge behind them. Keep all other architecture, bridge geometry, paper material, colors, lighting and destination objects unchanged. Do not add any text or new objects. This clean plate will sit behind separately moving ticket and hand layers.
```

## A component sheet with true alpha

Inputs: original approved reference and matching production stage. Choose a small useful family instead of cramming a whole act into one sheet.

```text
Use case: stylized-concept.
Asset type: animation components on a genuinely transparent PNG background.
Input image 1 is the original material reference; input image 2 supplies the matching production angle and form. Preserve their rich vermilion, charcoal paper, cream exposed cores, fine fibres and warm immediate edge shadows.
Create four completely separate objects, all fully visible with generous transparent gutters: (1) a blank vermilion ticket with small semicircular notches and pale inset border, no hand attached; (2) a thick folded charcoal receiving hinge with an open slit; (3) one broad vermilion bridge with a gentle upward fold and pale cut underside; (4) two refined charcoal business hands facing one another but not yet touching, treated as a single component. Consistent slightly elevated three-quarter viewpoint.
Background: actual transparent alpha around every silhouette and through the hinge slit. No white, cream or drawn checkerboard outside the objects. Keep soft shadow only immediately adjacent to each object's physical edge.
No labels, grid, numbers, glyphs, logos or watermark. Preserve rich paper texture and sharp cut silhouettes. No clipping, connected components, leather, metal, plastic or glossy 3D shading. High-resolution PNG, enough room to crop each object independently.
```

If the file is RGB with a painted checkerboard, retain it as a rejected attempt and send a short extraction edit. Elaborate style paragraphs can distract from the requested correction:

```text
Remove the background. Keep the four paper shapes unchanged, isolated on a genuinely transparent background. Preserve their exact layout, outlines, vermilion and charcoal texture, pale cut edges and folds. Clear the hinge opening too. Output a transparent PNG with actual alpha; no drawn checkerboard.
```

Read the resulting file's alpha channel; this prompt is a request, not proof of transparency. If using a mask over RGB instead, retain and name that fact. The component's sharp silhouette, internal holes and moving edge must survive the chosen method.

## Worked voiced scene: ticket → hinge → three opportunities

This is the portable design behind an earlier explainer's credit-pass scene. The times below are an illustrative **30-second** layout, not a substitute for actual narration word timing. Rebind every cue to the actual narration.

| Window | Narration idea | Picture and type | Edit / sound |
| --- | --- | --- | --- |
| 0–5 s | A top institution appears on the shareholder list | Close view: same company + large ticket, “股东名单” on its face; institution name stamps in | Ticket settles with friction and one restrained stamp |
| 5–9 s | That name becomes a credit pass | Company comparison retreats; ticket's attached type changes to “信用通行证”; ticket enters hinge | Match-position label substitution, then dry hinge click |
| 9–16 s | The name connects to resources | Camera pulls back. Upper, middle and lower paper routes unfold in sequence, each to a closed threshold | Fold sounds follow the moving edge; density rises without masking speech |
| 16–24 s | Engineers, customers, later investors become easier to reach | Three progressively quicker camera visits. Each gate opens enough to reveal its receiver and exact label | Snap to a new focal receiver at each spoken item; one material transient per earned action |
| 24–28 s | Expectations about future value | Wider return reveals all routes together; “预期更容易触达 · 不保证结果” rests on quiet cream | Sound releases; give the qualification reading time |
| 28–30 s | Next argument | Final red route exits right into the receiving shot's red fold | Object-led wipe with short paper sweep |

**Optional microcut burst:** after the ticket and three resource destinations are already established, compress familiar details into a bounded sequence: ticket notch **0.6 s** → hinge pressure **0.4 s** → upper route **0.25 s** → middle route **0.25 s** → lower route **0.25 s**, then a **1.5–2 s** wide payoff/release. Maintain a common red edge or screen-position anchor through the cuts; a near-field paper fold can briefly occlude each change. Couple dry friction/click transients to the action, then drop density on the wide return. These are example durations to rebind to measured narration word timing, not a quota. Essential new claims and qualifications live in readable holds outside the blinks. Use the burst where the narration conveys multiplying access or mounting speed; it would misrepresent a modest, limited attention effect. See [fast-paced-editing.md](fast-paced-editing.md) for further direction.

**Layer implementation:** stable substrate; stage regions behind moving receivers; separate portal/hinge; ticket wrapper containing art and its words; live exact labels; foreground outgoing strip. If the stage is RGB, trace route-region masks from actual pixel coordinates and record them as masked stage regions. Retain the full stage as its original, not a pretended transparent asset.

**Motion ownership:** the world wrapper owns camera scale/translation. The ticket wrapper owns entry/insertion. Inner words own local opacity/translation during relabeling. The hinge owns its fold. A parent camera move therefore carries art, text and endpoints together. Build one paused GSAP timeline, initialize every animated state, register it under the exact composition ID, and let the framework own voice/SFX clips.

**Registration example:** for an image with intrinsic `Iw × Ih` rendered with `contain` inside `W × H`, `s=min(W/Iw,H/Ih)`, `ox=(W-s*Iw)/2`, `oy=(H-s*Ih)/2`. An observed image anchor `(px,py)` becomes `(ox+s*px, oy+s*py)`. For `cover`, use `max` and the actual object-position offset. Place the path and its receiver under the same camera parent. Read the real dimensions first.

**Elevation questions:** Does “信用通行证” fit inside the ticket after tilt and macro crop? Is there a baked duplicate beneath it? Are all three endpoints readable, while no route promises success? Does the camera return visibly release the fast passage? Do the exact final MP4 frames retain paper fibres, red density and cream edges without checker fringes? Review all those windows, not only the attractive fully opened stage.

## Covers when the completion checklist requires text-only generation

The cover branch has a different input rule from production assets. Read the user's current checklist for count and deliverables. If the user requests 15 concepts in two formats, that means 30 independent originals; other counts follow the brief. For an explicitly text-only branch, use the configured generator without reference inputs. Omit both reference-input fields. All graphics and Chinese typography must be produced in the same image-generation call; correction means a new text-prompt generation, not an image edit or an overlay.

Describe this style in text so the cover belongs to the film while composing a distinct hook. Do not use video-frame extraction, crops or a 16:9 image as a reference to manufacture 4:3. Write separate composition directions for each aspect, and inspect every output's actual ratio; request a fresh generation if wrong. Keep the accepted original PNG unchanged.

Example shared concept:

```text
Use case: ads-marketing.
Asset type: one complete Chinese documentary thumbnail, entirely generated including typography.
Hook: identical goods, dramatically different valuation.
Style: premium editorial paper theatre. Luminous warm cream rag-paper background #F3ECD9, fine fibres, bold charcoal #24221F cut silhouettes, one dense vermilion #D5422C folded price ribbon, pale #FFF3D8 paper cores and tight warm physical contact shadows. Authoritative oversized Chinese Song-style headline. Mature and tactile, strong figure-ground, no decorative interface.
Subject: exactly two identical charcoal cut-paper wine bottles with identical blank labels and levels. One broad red label ribbon folds to unequal heights above the pair. Bottle form and quality remain unchanged; do not use different bottle sizes to suggest the difference.
Text (verbatim): “同样的东西” and “凭什么更贵？”. Only these strings, correct Chinese, no quotation marks, no fine print. Type must remain immediately readable when the image is small. Give the silhouette and text confident edge clearance.
Constraints: no fabricated prices or statistics, no additional text, logos, watermark, photographic glass, neon or glossy cartoon materials. This is one complete image, not a grid or storyboard sheet.
```

Append one of these **different compositions** to two separate prompts:

- **16:9:** “Wide 16:9 composition, preferably 1536×864. Two giant headline lines command the left; identical bottles stand on the right below a bold diagonal folded ribbon. Bring the ribbon across the center as the visual hinge between question and subject. Compose edge to edge for the wide frame.”
- **4:3:** “Native 4:3 composition, preferably 1280×960. Headline spans the upper area in two decisive lines. The bottle pair occupies the lower central field, with its folded ribbon passing behind the second line. Rebalance all elements for this taller canvas with sufficient lower-edge clearance.”

The concept pair shares meaning and materials, not a crop. Inspect spelling, exact object counts, physical consistency, misleading implications, hierarchy, edge clearance and legibility at thumbnail size. Retain exact prompts, tool/output provenance and individual acceptance notes; expose full-image previews and original downloads in the paired gallery. Publishing titles and descriptions should communicate different grounded hooks while preserving the script's study qualifications.
