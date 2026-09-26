#!/usr/bin/env node
// Extract establish / midpoint / resolve frames from an ENCODED master.
// Accepts one or more scene plans; plans are concatenated in argument order.
// Supported JSON: {scenes:[{id,startSec,endSec|semanticEndSec}],durationSec},
// {sections:[...]}, or a direct array. With no --plan, uses boundaries.json.
//
//   node scripts/review-master.cjs --video renders/final/master.mp4
//   node scripts/review-master.cjs --video master.mp4 --plan act1/scene-plan.json --plan act2/scene-plan.json
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { spatialReviewTimes } = require("./lib/spatial-canvas.cjs");

// Project-local copies resolve beside their scripts. The skill copy can still
// be invoked directly from a project directory because the skill root has no
// index.html of its own.
const LOCAL_ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const plans = [];
let video = null;
let out = null;
let startOffset = 0;
let limit = Infinity;
const extraTimes = [];
let spatial = false;
let rootOption = null;

for (let i = 0; i < args.length; i++) {
  const key = args[i];
  const value = args[i + 1];
  if (key === "--video") { video = value; i++; }
  else if (key === "--plan") { plans.push(value); i++; }
  else if (key === "--out") { out = value; i++; }
  else if (key === "--start-offset") { startOffset = Number(value); i++; }
  else if (key === "--limit") { limit = Number(value); i++; }
  else if (key === "--at") { extraTimes.push(...String(value).split(",").map(Number)); i++; }
  else if (key === "--spatial") { spatial = true; }
  else if (key === "--root") {
    if (!value || value.startsWith("-")) usage(1, "--root requires a project path");
    rootOption = value; i++;
  }
  else if (key === "--help" || key === "-h") usage(0);
  else { console.error(`Unknown argument: ${key}`); usage(1); }
}

if (rootOption == null && args.includes("--root")) usage(1, "--root requires a project path");
const ROOT = rootOption
  ? path.resolve(process.cwd(), rootOption)
  : fs.existsSync(path.join(LOCAL_ROOT, "index.html")) ? LOCAL_ROOT : process.cwd();
if (!video) usage(1, "--video is required");
const videoPath = path.resolve(ROOT, video);
if (!fs.existsSync(videoPath)) fail(`Video not found: ${videoPath}`);
if (!Number.isFinite(startOffset) || startOffset < 0) fail("--start-offset must be >= 0");
if (!(limit === Infinity || (Number.isFinite(limit) && limit > 0))) fail("--limit must be > 0");
if (spatial) {
  try { extraTimes.push(...spatialReviewTimes(ROOT).map((time) => Number((startOffset + time).toFixed(6)))); }
  catch (error) { fail(error.message); }
}
if (extraTimes.some((time) => !Number.isFinite(time) || time < 0)) fail("--at values must be non-negative seconds");

if (!plans.length) {
  const fallback = path.join(ROOT, "scripts", "boundaries.json");
  if (fs.existsSync(fallback)) plans.push(fallback);
  else if (!extraTimes.length) fail("No --plan supplied, scripts/boundaries.json is missing, and no --at/--spatial samples were requested");
}

const output = path.resolve(ROOT, out || "review/master");
fs.mkdirSync(output, { recursive: true });
const duration = probeDuration(videoPath);
const geometry = probeVideoGeometry(videoPath);
const hasDrawtext = ffmpegHasFilter("drawtext");
const manifest = { video: videoPath, durationSec: duration, ...geometry, generatedAt: new Date().toISOString(), groups: [] };
let globalOffset = startOffset;
let sampled = 0;

for (let groupIndex = 0; groupIndex < plans.length && sampled < limit; groupIndex++) {
  const planPath = path.resolve(ROOT, plans[groupIndex]);
  if (!fs.existsSync(planPath)) fail(`Plan not found: ${planPath}`);
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const sourceScenes = Array.isArray(plan) ? plan : plan.scenes || plan.sections;
  if (!Array.isArray(sourceScenes) || !sourceScenes.length) fail(`Plan has no scenes/sections: ${planPath}`);

  const scenes = sourceScenes.map((scene, index) => normalizeScene(scene, index));
  const planDuration = finite(plan.durationSec) || Math.max(...scenes.map((scene) => scene.endSec));
  const groupName = safeName(path.basename(path.dirname(planPath)) || `group-${groupIndex + 1}`);
  const groupOut = path.join(output, `${String(groupIndex + 1).padStart(2, "0")}-${groupName}`);
  fs.mkdirSync(groupOut, { recursive: true });
  const rows = [];
  const groupRecord = { plan: planPath, offsetSec: globalOffset, durationSec: planDuration, scenes: [] };

  for (const scene of scenes) {
    if (sampled >= limit) break;
    const span = Math.max(0.1, scene.endSec - scene.startSec);
    const localTimes = [
      scene.startSec + Math.min(1.5, span * 0.12),
      scene.startSec + span * 0.52,
      scene.endSec - Math.min(1.2, span * 0.10),
    ].map((time) => Math.max(scene.startSec, Math.min(scene.endSec - 0.001, time)));
    const globalTimes = localTimes.map((time) => globalOffset + time);
    if (globalTimes.some((time) => time < 0 || time > duration + 0.05)) {
      fail(`${scene.id} samples exceed video duration (${globalTimes.map((n) => n.toFixed(3)).join(", ")} vs ${duration.toFixed(3)}s)`);
    }

    const frames = [];
    for (let state = 0; state < 3; state++) {
      const frame = path.join(groupOut, `${safeName(scene.id)}-${["establish", "mid", "resolve"][state]}.png`);
      ffmpeg(["-hide_banner", "-loglevel", "error", "-y", "-ss", globalTimes[state].toFixed(6), "-i", videoPath,
        "-frames:v", "1", frame]);
      frames.push(frame);
    }

    const row = path.join(groupOut, `${safeName(scene.id)}-contact.png`);
    const label = escapeDrawtext(scene.id);
    const thumbWidth = geometry.width >= geometry.height ? 480 : 270;
    const thumbHeight = geometry.width >= geometry.height ? 270 : 480;
    const thumb = `scale=${thumbWidth}:${thumbHeight}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${thumbWidth}:${thumbHeight}:(ow-iw)/2:(oh-ih)/2:color=black`;
    const rowFilter = `[0:v]${thumb}[a];[1:v]${thumb}[b];[2:v]${thumb}[c];[a][b][c]hstack=inputs=3` +
      (hasDrawtext ? `,drawtext=text='${label}':fontcolor=white:fontsize=22:box=1:boxcolor=black@0.72:boxborderw=7:x=10:y=10` : "");
    ffmpeg(["-hide_banner", "-loglevel", "error", "-y", "-i", frames[0], "-i", frames[1], "-i", frames[2],
      "-filter_complex", rowFilter,
      "-frames:v", "1", row]);
    rows.push(row);
    groupRecord.scenes.push({ ...scene, localTimes, globalTimes, frames, contact: row });
    sampled++;
  }

  if (rows.length) {
    const sheet = path.join(output, `${String(groupIndex + 1).padStart(2, "0")}-${groupName}-contact.png`);
    if (rows.length === 1) fs.copyFileSync(rows[0], sheet);
    else {
      const inputs = rows.flatMap((row) => ["-i", row]);
      const labels = rows.map((_, index) => `[${index}:v]`).join("");
      ffmpeg(["-hide_banner", "-loglevel", "error", "-y", ...inputs, "-filter_complex", `${labels}vstack=inputs=${rows.length}`, "-frames:v", "1", sheet]);
    }
    groupRecord.contactSheet = sheet;
  }
  manifest.groups.push(groupRecord);
  globalOffset += planDuration;
}

manifest.sampledScenes = sampled;
manifest.extraFrames = [];
if (extraTimes.length) {
  const extraOut = path.join(output, "extra");
  fs.mkdirSync(extraOut, { recursive: true });
  for (const time of extraTimes) {
    if (time > duration + 0.05) fail(`Extra sample ${time}s exceeds video duration ${duration.toFixed(3)}s`);
    const frame = path.join(extraOut, `at-${time.toFixed(3).replace(".", "_")}s.png`);
    ffmpeg(["-hide_banner", "-loglevel", "error", "-y", "-ss", time.toFixed(6), "-i", videoPath,
      "-frames:v", "1", frame]);
    manifest.extraFrames.push({ timeSec: time, frame });
  }
}
manifest.sampledFrames = sampled * 3 + manifest.extraFrames.length;
fs.writeFileSync(path.join(output, "review-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Master review: ${output}`);
console.log(`Scenes: ${sampled}; frames: ${manifest.sampledFrames}; video: ${duration.toFixed(3)}s`);

function normalizeScene(scene, index) {
  const startSec = finite(scene.startSec) ?? finite(scene.start) ?? finite(scene.globalStartSec);
  const endSec = finite(scene.semanticEndSec) ?? finite(scene.endSec) ?? finite(scene.end) ??
    (startSec != null && finite(scene.durationSec) != null ? startSec + Number(scene.durationSec) : null);
  if (startSec == null || endSec == null || endSec <= startSec) fail(`Invalid scene timing at index ${index}`);
  return { id: String(scene.id || scene.sectionId || `scene-${index + 1}`), startSec, endSec };
}

function finite(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function probeDuration(file) {
  const text = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], { encoding: "utf8" }).trim();
  const value = Number(text);
  if (!Number.isFinite(value) || value <= 0) fail(`Could not probe duration: ${file}`);
  return value;
}

function probeVideoGeometry(file) {
  const text = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", file], { encoding: "utf8" });
  const stream = JSON.parse(text).streams?.[0] || {};
  const width = Number(stream.width);
  const height = Number(stream.height);
  if (!(width > 0 && height > 0)) fail(`Could not probe video geometry: ${file}`);
  return { width, height };
}

function ffmpegHasFilter(name) {
  try {
    const filters = execFileSync("ffmpeg", ["-hide_banner", "-filters"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return new RegExp(`\\b${name}\\b`).test(filters);
  } catch {
    return false;
  }
}

function ffmpeg(callArgs) {
  try { execFileSync("ffmpeg", callArgs, { stdio: ["ignore", "ignore", "pipe"], maxBuffer: 16 * 1024 * 1024 }); }
  catch (error) { fail((error.stderr || error.message || String(error)).toString()); }
}

function safeName(value) { return String(value).replace(/[^a-z0-9._-]+/gi, "-").replace(/^-|-$/g, "") || "scene"; }
function escapeDrawtext(value) { return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/:/g, "\\:"); }
function fail(message) { console.error(`review-master: ${message}`); process.exit(1); }
function usage(code, message) {
  if (message) console.error(message);
  console.log("usage: node scripts/review-master.cjs [--root <project>] --video <master.mp4> [--plan <scene-plan.json> ...] [--out <dir>] [--start-offset <sec>] [--limit <n>] [--at 0.3,0.8,1.5,2.5] [--spatial]");
  process.exit(code);
}
