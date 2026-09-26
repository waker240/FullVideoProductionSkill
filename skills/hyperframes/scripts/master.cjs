#!/usr/bin/env node
// Cross-platform two-pass narration mastering. Duration drift above 10 ms is
// rejected before the source is replaced; playback MP3 is regenerated from the
// mastered WAV.
//
//   node scripts/master.cjs assets/voice/narration.wav [out.wav]
//   TARGET_I=-14 TARGET_TP=-1 TARGET_LRA=7 node scripts/master.cjs <in> [out]
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const input = process.argv[2];
if (!input || input === "--help" || input === "-h") usage(input ? 0 : 1);
const source = path.resolve(input);
const output = path.resolve(process.argv[3] || input);
if (!fs.existsSync(source)) fail(`input does not exist: ${source}`);

const targetI = finiteEnv("TARGET_I", -14);
const targetTp = finiteEnv("TARGET_TP", -1);
const targetLra = finiteEnv("TARGET_LRA", 7);
const chain = "highpass=f=80,alimiter=limit=0.7:level=disabled";
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "hf-master-"));
const temporaryWav = path.join(temporaryDirectory, "master.wav");
const temporaryMp3 = path.join(temporaryDirectory, "master.mp3");

try {
  const before = duration(source);
  const measured = measure(source);
  const filter = `${chain},loudnorm=I=${targetI}:TP=${targetTp}:LRA=${targetLra}` +
    `:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}` +
    `:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}` +
    `:offset=${measured.target_offset}:linear=true`;
  run("ffmpeg", [
    "-hide_banner", "-y", "-i", source, "-af", filter,
    "-ar", "48000", "-c:a", "pcm_s24le", temporaryWav, "-loglevel", "error",
  ]);

  const after = duration(temporaryWav);
  const drift = Math.abs(before - after);
  if (drift > 0.01) fail(`DURATION DRIFT ${drift.toFixed(4)}s (>0.01) — source was not replaced.`);
  const mp3 = /\.wav$/i.test(output) ? output.replace(/\.wav$/i, ".mp3") : `${output}.mp3`;
  // Complete both encodes before replacing either delivered file. An encoder
  // failure therefore leaves the existing WAV/MP3 pair untouched.
  run("ffmpeg", ["-y", "-i", temporaryWav, "-c:a", "libmp3lame", "-b:a", "192k", temporaryMp3, "-loglevel", "error"]);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.copyFileSync(temporaryWav, output);
  fs.copyFileSync(temporaryMp3, mp3);
  console.log(`✓ mastered → ${output} (Δdur=${drift.toFixed(4)}s) + regenerated ${mp3}`);
} finally {
  // This is the exact unique directory returned by mkdtempSync above.
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}

function measure(file) {
  const result = spawnSync("ffmpeg", [
    "-hide_banner", "-nostats", "-i", file,
    "-af", `${chain},loudnorm=I=${targetI}:TP=${targetTp}:LRA=${targetLra}:print_format=json`,
    "-f", "null", "-",
  ], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) fail(result.stderr || "ffmpeg loudness measurement failed");
  const matches = String(result.stderr || "").match(/\{[\s\S]*?\}/g);
  if (!matches?.length) fail("ffmpeg did not return loudnorm measurement JSON");
  let parsed;
  try { parsed = JSON.parse(matches[matches.length - 1]); }
  catch { fail("could not parse ffmpeg loudnorm measurement JSON"); }
  for (const key of ["input_i", "input_tp", "input_lra", "input_thresh", "target_offset"]) {
    if (!Number.isFinite(Number(parsed[key]))) fail(`invalid loudnorm measurement: ${key}=${parsed[key]}`);
  }
  return parsed;
}

function duration(file) {
  const value = Number(execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", file,
  ], { encoding: "utf8" }).trim());
  if (!(value > 0)) fail(`could not probe duration: ${file}`);
  return value;
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) fail(result.stderr || `${command} failed`);
}

function finiteEnv(name, fallback) {
  if (process.env[name] == null || process.env[name] === "") return fallback;
  const value = Number(process.env[name]);
  if (!Number.isFinite(value)) fail(`${name} must be numeric.`);
  return value;
}

function fail(message) { throw new Error(`master: ${message}`); }
function usage(code) {
  console.log("usage: node scripts/master.cjs <in.wav> [out.wav]");
  process.exit(code);
}
