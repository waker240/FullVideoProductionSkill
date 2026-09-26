#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseStoryboard } from "./lib/storyboard.mjs";
import { hasFastPassageMarkers, resolveFastPassages } from "./lib/fast-passages.mjs";

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && index + 1 < argv.length ? argv[index + 1] : fallback;
};
const storyboardPath = resolve(flag("storyboard", "STORYBOARD.md"));

if (!existsSync(storyboardPath)) {
  console.error(`✗ check-fast-passages.mjs: STORYBOARD.md not found at ${storyboardPath}`);
  process.exit(1);
}

const manifest = parseStoryboard(readFileSync(storyboardPath, "utf8"));
if (!hasFastPassageMarkers(manifest.frames)) {
  console.log("✓ no fast passages declared");
  process.exit(0);
}

const entries = [];
const timingErrors = [];
let start = 0;
for (const frame of manifest.frames) {
  const duration = Number(frame.durationSeconds);
  const label = `frame ${frame.number ?? frame.index}${frame.title ? ` (${frame.title})` : ""}`;
  if (!Number.isFinite(duration) || duration <= 0) {
    timingErrors.push(`${label} needs a positive synced duration before fast-passage checking`);
    continue;
  }
  entries.push({ frame, start, durationSeconds: duration });
  start += duration;
}

const result = resolveFastPassages(entries);
const errors = [...timingErrors, ...result.errors];
if (errors.length) {
  console.error("✗ fast-passage contract failed:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

for (const passage of result.passages) {
  console.log(`✓ ${passage.id}: ${passage.start.toFixed(3)}–${passage.end.toFixed(3)}s (${passage.items.length} frame${passage.items.length === 1 ? "" : "s"})`);
  for (const item of passage.items) {
    const mix = item.gain === null ? "" : ` · BGM ×${item.gain} over ${item.ramp}s`;
    console.log(`  ${item.label}: ${item.role} ${item.start.toFixed(3)}–${item.end.toFixed(3)}s · ${item.entryReceiver} → ${item.exitReceiver}${mix}`);
  }
}
