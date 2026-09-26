// scripts/build-montage.cjs — assemble a DYNAMIC demo/evidence reel from video
// clips into assets/montage/<name>.mp4. Config-driven: put a montage.json next
// to this script (see MONTAGE.example below). Four movements, any subset:
//   opener — rapid full-screen hard cuts (cold-opens/slams)
//   grid   — 9 clips playing simultaneously in a 3x3 wall (dark gutters)
//   hero   — full-screen ken-burns push-in (quality dwell)
//   climax — accelerating cuts to a final punch (linear ramp dHi→dLo)
// All normalized to W×H / FPS / yuv420p, then concat with dense keyframes so
// seek-rendering stays exact.
//   node scripts/build-montage.cjs                # reads scripts/montage.json
//   node scripts/build-montage.cjs my-reel.json   # explicit config
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = path.resolve(__dirname, "..");

const MONTAGE_EXAMPLE = {
  out: "demo-reel.mp4",
  clipsDir: "assets/clips", // clip paths below are relative to this
  bg: "0x070a10",           // gutter/pad color — match DESIGN.md bg
  width: 1920, height: 1080, fps: 60,
  opener: { dur: 0.6, clips: ["a/cold-open.mp4", "b/slam.mp4"] },
  grid:   { dur: 5.0, clips: ["nine", "clips", "exactly", "...", "...", "...", "...", "...", "..."] },
  hero:   { dur: 2.0, clips: ["best-1.mp4", "best-2.mp4"] },
  climax: { dHi: 0.68, dLo: 0.3, clips: ["fast-1.mp4", "fast-2.mp4", "final-punch.mp4"] },
};

const cfgPath = path.resolve(__dirname, process.argv[2] || "montage.json");
if (!fs.existsSync(cfgPath)) {
  fs.writeFileSync(path.join(__dirname, "montage.example.json"), JSON.stringify(MONTAGE_EXAMPLE, null, 2));
  console.error(`no ${cfgPath} — wrote scripts/montage.example.json; fill it in (pick the PEAK moments, vary source projects) and rename to montage.json`);
  process.exit(1);
}
const cfg = Object.assign({ out: "demo-reel.mp4", clipsDir: "assets/clips", bg: "0x070a10", width: 1920, height: 1080, fps: 60 }, JSON.parse(fs.readFileSync(cfgPath, "utf8")));
const CLIPS = path.resolve(ROOT, cfg.clipsDir);
const OUT = path.join(ROOT, "assets/montage");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "hf-montage-"));
const FF = "ffmpeg";
const { width: W, height: H, fps: FPS, bg: BG } = cfg;
fs.mkdirSync(OUT, { recursive: true });
process.on("exit", () => {
  // TMP is always the unique directory returned by mkdtempSync above.
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch {}
});

const C = (rel) => { const p = path.join(CLIPS, rel); if (!fs.existsSync(p)) throw new Error("missing clip: " + rel); return p; };
const dur = (p) => parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${p}"`, { encoding: "utf8" }).trim());
const mid = (p, seg) => Math.max(0, Math.min(dur(p) - seg - 0.05, dur(p) * 0.3)); // punchy middle-third start
const FILL = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${FPS},format=yuv420p`;

let step = 0;
const parts = [];

// ── opener: rapid full-screen hard cuts ──
if (cfg.opener && cfg.opener.clips?.length) {
  const D = cfg.opener.dur ?? 0.6;
  for (const rel of cfg.opener.clips) {
    const src = C(rel), s = mid(src, D);
    const out = path.join(TMP, `a${String(step++).padStart(2, "0")}.mp4`);
    execSync(`${FF} -y -ss ${s.toFixed(3)} -t ${D} -i "${src}" -vf "${FILL}" -an -c:v libx264 -preset medium -crf 18 "${out}" -loglevel error`);
    parts.push(out); process.stdout.write("A");
  }
  console.log(" opener done");
}

// ── grid: 9 clips at once, 3x3, dark gutters ──
if (cfg.grid && cfg.grid.clips?.length === 9) {
  const D = cfg.grid.dur ?? 5.0;
  const cellW = W / 3, cellH = H / 3, gut = 5;
  const inputs = cfg.grid.clips.map((rel) => { const src = C(rel); return { src, s: mid(src, D) }; });
  const inFlags = inputs.map((i) => `-stream_loop -1 -ss ${i.s.toFixed(3)} -t ${D} -i "${i.src}"`).join(" ");
  const cellVf = inputs.map((_, k) =>
    `[${k}:v]scale=${cellW - 2 * gut}:${cellH - 2 * gut}:force_original_aspect_ratio=increase,crop=${cellW - 2 * gut}:${cellH - 2 * gut},` +
    `pad=${cellW}:${cellH}:${gut}:${gut}:color=${BG},setsar=1,fps=${FPS}[v${k}]`).join(";");
  const layout = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `${c * cellW}_${r * cellH}`)).join("|");
  const xstack = `${inputs.map((_, k) => `[v${k}]`).join("")}xstack=inputs=9:layout=${layout}[grid]`;
  const gridOut = path.join(TMP, "b_grid.mp4");
  execSync(`${FF} -y ${inFlags} -filter_complex "${cellVf};${xstack}" -map "[grid]" -t ${D} -an -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "${gridOut}" -loglevel error`);
  parts.push(gridOut); console.log("B grid done");
} else if (cfg.grid) console.log("(grid skipped — needs exactly 9 clips)");

// ── hero: full-screen ken-burns push-in (alternating anchor for variety) ──
if (cfg.hero && cfg.hero.clips?.length) {
  const D = cfg.hero.dur ?? 2.0;
  const ANCHORS = [
    { x: "iw/2-(iw/zoom/2)", y: "ih/2-(ih/zoom/2)" },      // center
    { x: "iw/2-(iw/zoom/2)", y: "ih*0.36-(ih/zoom/2)" },   // toward top
    { x: "iw*0.58-(iw/zoom/2)", y: "ih/2-(ih/zoom/2)" },   // toward right
  ];
  cfg.hero.clips.forEach((rel, i) => {
    const src = C(rel), s = mid(src, D), a = ANCHORS[i % ANCHORS.length];
    const out = path.join(TMP, `c${String(i).padStart(2, "0")}.mp4`);
    const zp = `zoompan=z='min(pzoom+0.0009,1.14)':d=1:x='${a.x}':y='${a.y}':s=${W}x${H}:fps=${FPS}`;
    execSync(`${FF} -y -ss ${s.toFixed(3)} -t ${D} -i "${src}" -vf "${FILL},${zp},setsar=1,format=yuv420p" -an -c:v libx264 -preset medium -crf 18 "${out}" -loglevel error`);
    parts.push(out); process.stdout.write("C");
  });
  console.log(" hero done");
}

// ── climax: accelerating cuts ──
if (cfg.climax && cfg.climax.clips?.length) {
  const dHi = cfg.climax.dHi ?? 0.68, dLo = cfg.climax.dLo ?? 0.3, n = cfg.climax.clips.length;
  cfg.climax.clips.forEach((rel, i) => {
    const d = +(dHi - (dHi - dLo) * (n > 1 ? i / (n - 1) : 1)).toFixed(3);
    const src = C(rel), s = mid(src, d);
    const out = path.join(TMP, `d${String(i).padStart(2, "0")}.mp4`);
    execSync(`${FF} -y -ss ${s.toFixed(3)} -t ${d} -i "${src}" -vf "${FILL}" -an -c:v libx264 -preset medium -crf 18 "${out}" -loglevel error`);
    parts.push(out); process.stdout.write("D");
  });
  console.log(" climax done");
}

if (!parts.length) { console.error("nothing to assemble — config has no movements"); process.exit(1); }
const listPath = path.join(TMP, "list.txt");
fs.writeFileSync(listPath, parts.map((f) => `file '${f}'`).join("\n"));
const reel = path.join(OUT, cfg.out);
// dense keyframes (-g 15) so a seek-driven render lands on exact frames
execSync(`${FF} -y -f concat -safe 0 -i "${listPath}" -c:v libx264 -preset slow -crf 18 -g 15 -keyint_min 15 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -an "${reel}" -loglevel error`);
console.log(`✓ ${cfg.out} — ${dur(reel).toFixed(2)}s (${parts.length} segments) → assets/montage/`);
