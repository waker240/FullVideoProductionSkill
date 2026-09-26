#!/usr/bin/env node
// Reconcile faceless-explainer compound-canvas route timing after narration
// has locked STORYBOARD.md frame durations. Pure Node; no provider calls.

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseStoryboard } from "./lib/storyboard.mjs";

const flag = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
};
const storyboardPath = resolve(flag("storyboard", "STORYBOARD.md"));
const manifestPath = resolve(flag("manifest", "SPATIAL_CANVAS.json"));
const fail = (message) => { console.error(`✗ sync-spatial-canvas: ${message}`); process.exit(1); };
const r6 = (value) => Number(value.toFixed(6));
const r3 = (value) => Math.round(value * 1000) / 1000;

if (!existsSync(storyboardPath)) fail(`storyboard not found: ${storyboardPath}`);
const storyboard = parseStoryboard(readFileSync(storyboardPath, "utf8"));
const canvasFrames = storyboard.frames.filter((frame) => String(frame.extra?.canvas_id || "").trim());
if (!canvasFrames.length) {
  console.log("✓ sync-spatial-canvas: no canvas_id frames; skipped");
  process.exit(0);
}
if (!existsSync(manifestPath)) fail(`canvas_id is present but manifest is missing: ${manifestPath}`);

let plan;
try { plan = JSON.parse(readFileSync(manifestPath, "utf8")); }
catch (error) { fail(`manifest parse: ${error.message}`); }
if (!plan || typeof plan !== "object" || plan.$schema !== "hf-spatial-canvas/v1" || !Array.isArray(plan.canvases)) {
  fail('manifest must use "$schema": "hf-spatial-canvas/v1" and contain canvases[]');
}

const canvases = new Map();
for (const canvas of plan.canvases) {
  if (!canvas?.id || canvases.has(canvas.id)) fail(`missing or duplicate manifest canvas id: ${canvas?.id || "<empty>"}`);
  canvases.set(canvas.id, canvas);
}
const frameIds = new Set();

for (const frame of canvasFrames) {
  const id = String(frame.extra.canvas_id).trim();
  if (frameIds.has(id)) fail(`canvas_id ${id} is assigned to more than one storyboard frame`);
  frameIds.add(id);
  if (!Number.isFinite(frame.durationSeconds) || frame.durationSeconds <= 0) fail(`frame ${frame.number ?? frame.index}/${id} has no synced positive duration`);
  if (!frame.src) fail(`frame ${frame.number ?? frame.index}/${id} has no src`);
  const canvas = canvases.get(id);
  if (!canvas) fail(`canvas_id ${id} has no manifest entry`);
  if (canvas.scope !== "scene") fail(`${id}: faceless compound canvas scope must be scene`);
  if (String(canvas.composition || "").replace(/^\.\//, "") !== String(frame.src).replace(/^\.\//, "")) {
    fail(`${id}: composition must equal storyboard src ${frame.src}`);
  }
  if (!Array.isArray(canvas.visits) || !canvas.visits.length) fail(`${id}: visits[] is empty`);
  for (const visit of canvas.visits) {
    if (!visit || typeof visit !== "object" || !visit.id) fail(`${id}: every visit must be an object with an id`);
  }
  const excursions = canvas.excursions == null ? [] : canvas.excursions;
  if (!Array.isArray(excursions)) fail(`${id}: excursions must be an array when present`);
  for (const excursion of excursions) {
    if (!excursion || typeof excursion !== "object" || !excursion.id) fail(`${id}: every excursion must be an object with an id`);
    if (excursion.cutawayComposition) fail(`${id}/${excursion.id}: faceless cutaways must be in-composition overlays; remove cutawayComposition`);
  }
  const currentEnd = Math.max(...canvas.visits.map((visit) => Number(visit.at) + Number(visit.duration)));
  if (!Number.isFinite(currentEnd) || currentEnd <= 0) fail(`${id}: route timing is invalid`);
  // assemble-index.mjs writes frame/host durations at millisecond precision.
  // Lock the manifest route to that same target so host coverage cannot drift.
  const target = r3(frame.durationSeconds);
  const scale = target / currentEnd;
  for (const visit of canvas.visits) {
    if (![visit.at, visit.duration, visit.reviewAt].every(Number.isFinite)) fail(`${id}/${visit.id}: at/duration/reviewAt must be finite before sync`);
    visit.at = r6(visit.at * scale);
    visit.duration = r6(visit.duration * scale);
    visit.reviewAt = r6(visit.reviewAt * scale);
  }
  for (const excursion of excursions) {
    if (![excursion.at, excursion.duration, excursion.reviewAt].every(Number.isFinite) || excursion.duration <= 0) {
      fail(`${id}/${excursion.id}: excursion at/duration/reviewAt must define a finite positive window before sync`);
    }
    excursion.at = r6(excursion.at * scale);
    excursion.duration = r6(excursion.duration * scale);
    excursion.reviewAt = r6(excursion.reviewAt * scale);
  }
  const last = canvas.visits.reduce((winner, visit) => visit.at + visit.duration > winner.at + winner.duration ? visit : winner);
  last.duration = r6(last.duration + target - (last.at + last.duration));
  canvas.timing = {
    mode: "storyboard-synced",
    duration: target,
    sourceFrame: frame.number ?? frame.index,
  };
  console.log(`  ${id}: ${currentEnd}s → ${target}s (×${scale.toFixed(6)})`);
}

for (const id of canvases.keys()) if (!frameIds.has(id)) fail(`manifest canvas ${id} has no storyboard canvas_id owner`);
const tempPath = `${manifestPath}.tmp-${process.pid}`;
writeFileSync(tempPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
renameSync(tempPath, manifestPath);
console.log(`✓ sync-spatial-canvas: wrote ${manifestPath}`);
