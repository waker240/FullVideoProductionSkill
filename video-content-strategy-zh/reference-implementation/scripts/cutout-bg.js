/**
 * Background-removal batch utility.
 *
 * Two modes:
 *   --mode=chroma  (DEFAULT, recommended for AI-generated primitives)
 *     Pixel-exact chroma-key on a solid background color (default #FF00FF magenta).
 *     Best for synthetic images with flat color backgrounds. Includes edge despill
 *     so colored fringe pixels don't keep magenta tint.
 *
 *   --mode=imgly
 *     Uses @imgly/background-removal-node (rembg port). AI matting, trained on
 *     natural photographs. AVOID for synthetic flat-color renders — it makes
 *     wrong foreground/background decisions and leaves holes inside subjects.
 *     Use only for photographs of real objects/people on natural backgrounds.
 *
 * Usage:
 *   node scripts/cutout-bg.js <inputDir> <outputDir> [options]
 *
 * Options:
 *   --mode=chroma|imgly        Removal strategy (default: chroma)
 *   --key=#RRGGBB              Chroma key color (default: #FF00FF magenta)
 *   --tol=<0..255>             Chroma tolerance — pixels within this RGB distance
 *                              of the key go fully transparent (default: 60)
 *   --feather=<0..255>         Edge feather distance — pixels within (tol+feather)
 *                              get partial alpha for soft edges (default: 25)
 *   --despill=<0..1>           How aggressively to remove key-color tint from
 *                              edge pixels (default: 0.85; 0 = off, 1 = max)
 *   --overwrite                Re-process existing outputs
 *
 * Example:
 *   node scripts/cutout-bg.js \
 *     out/migration-primitives-v1 \
 *     public/projects/the-migration/assets/cold-open/gates
 */

const path = require("node:path");
const fs = require("node:fs/promises");
const { existsSync, mkdirSync } = require("node:fs");
const sharp = require("sharp");

function parseHex(hex) {
  const m = hex.replace(/^#/, "").match(/^([0-9a-f]{6})$/i);
  if (!m) throw new Error(`Invalid hex color: ${hex}`);
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function parseArg(args, name, def) {
  const prefix = `--${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : def;
}

async function chromaKey(inputPath, outputPath, opts) {
  const { keyR, keyG, keyB, tol, feather, despill } = opts;

  const img = sharp(inputPath).ensureAlpha();
  const { data, info } = await img
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.from(data);

  const tolSq = tol * tol;
  const featherTotal = tol + feather;
  const featherTotalSq = featherTotal * featherTotal;

  for (let i = 0; i < out.length; i += channels) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const dr = r - keyR;
    const dg = g - keyG;
    const db = b - keyB;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq <= tolSq) {
      // Fully background → transparent
      out[i + 3] = 0;
    } else if (distSq <= featherTotalSq) {
      // Edge band → partial alpha based on distance into feather zone
      const dist = Math.sqrt(distSq);
      const t = (dist - tol) / feather; // 0..1
      out[i + 3] = Math.round(255 * t);
      // Despill: pull the pixel away from the key color proportionally to how
      // close it is to the key. Replaces magenta fringe with a neutral color.
      if (despill > 0) {
        const spillStrength = (1 - t) * despill;
        // Move toward the average of non-key channels (for magenta key,
        // suppress R+B and lift toward G for neutral grey).
        const neutral = Math.round((r + g + b) / 3);
        out[i] = Math.round(r + (neutral - r) * spillStrength);
        out[i + 1] = Math.round(g + (neutral - g) * spillStrength);
        out[i + 2] = Math.round(b + (neutral - b) * spillStrength);
      }
    } else {
      // Full subject — leave alpha at 255
      out[i + 3] = 255;
    }
  }

  await sharp(out, {
    raw: { width, height, channels },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function imglyKey(inputPath, outputPath) {
  const { removeBackground } = require("@imgly/background-removal-node");
  const fileBuf = await fs.readFile(inputPath);
  const inputBlob = new Blob([fileBuf], { type: "image/png" });
  const blob = await removeBackground(inputBlob);
  const buf = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(outputPath, buf);
}

async function main() {
  const args = process.argv.slice(2);
  const overwrite = args.includes("--overwrite");
  const positional = args.filter((a) => !a.startsWith("--"));
  if (positional.length < 2) {
    console.error("Usage: node scripts/cutout-bg.js <inputDir> <outputDir> [options]");
    process.exit(1);
  }
  const [inputDir, outputDir] = positional.map((p) => path.resolve(p));

  const mode = parseArg(args, "mode", "chroma");
  const keyHex = parseArg(args, "key", "#FF00FF");
  const tol = parseInt(parseArg(args, "tol", "60"), 10);
  const feather = parseInt(parseArg(args, "feather", "25"), 10);
  const despill = parseFloat(parseArg(args, "despill", "0.85"));
  const key = parseHex(keyHex);

  if (!existsSync(inputDir)) {
    console.error(`Input dir does not exist: ${inputDir}`);
    process.exit(1);
  }
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  const entries = await fs.readdir(inputDir);
  const pngs = entries.filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  if (pngs.length === 0) {
    console.error(`No images found in ${inputDir}`);
    process.exit(1);
  }

  console.log(`Cutting out ${pngs.length} image(s)`);
  console.log(`  mode:    ${mode}`);
  if (mode === "chroma") {
    console.log(`  key:     ${keyHex}  (rgb ${key.r},${key.g},${key.b})`);
    console.log(`  tol:     ${tol}     (full-transparent threshold)`);
    console.log(`  feather: ${feather} (soft-edge zone width)`);
    console.log(`  despill: ${despill} (key-color tint suppression)`);
  }
  console.log(`  output:  ${outputDir}\n`);

  let done = 0;
  let skipped = 0;
  let failed = 0;
  const t0 = Date.now();

  for (const file of pngs) {
    const outName = file.replace(/\.(jpe?g|webp)$/i, ".png");
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, outName);

    if (existsSync(outputPath) && !overwrite) {
      console.log(`  skip   ${file}  (exists; pass --overwrite to redo)`);
      skipped++;
      continue;
    }

    const ts = Date.now();
    try {
      if (mode === "chroma") {
        await chromaKey(inputPath, outputPath, {
          keyR: key.r,
          keyG: key.g,
          keyB: key.b,
          tol,
          feather,
          despill,
        });
      } else if (mode === "imgly") {
        await imglyKey(inputPath, outputPath);
      } else {
        throw new Error(`Unknown mode: ${mode}`);
      }
      const dt = ((Date.now() - ts) / 1000).toFixed(2);
      const inMb = ((await fs.stat(inputPath)).size / 1e6).toFixed(2);
      const outMb = ((await fs.stat(outputPath)).size / 1e6).toFixed(2);
      console.log(`  done   ${file}  (${inMb}MB → ${outMb}MB, ${dt}s)`);
      done++;
    } catch (err) {
      console.error(`  FAIL   ${file}  →  ${err.message}`);
      failed++;
    }
  }

  const dt = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`\n${done} done, ${skipped} skipped, ${failed} failed in ${dt}s`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
