"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const FACELESS = path.resolve(__dirname, "..", "..", "..", "faceless-explainer", "scripts");
const CHECK = path.join(FACELESS, "check-fast-passages.mjs");
const ASSEMBLER = path.join(FACELESS, "assemble-index.mjs");
const TRANSITIONS = path.join(FACELESS, "transitions.mjs");

test("faceless fast passages resolve synced windows and root BGM cues", () => {
  withProject((root) => {
    const storyboard = makeStoryboard();
    write(root, "STORYBOARD.md", storyboard);

    const checked = run(CHECK, ["--storyboard", path.join(root, "STORYBOARD.md")]);
    assert.equal(checked.status, 0, checked.stdout + checked.stderr);
    assert.match(checked.stdout, /overload: 0\.000–6\.000s \(3 frames\)/);
    assert.match(checked.stdout, /frame 3 \(Release\): release 4\.000–6\.000s.*BGM ×0 over 0\.08s/);

    for (const [stem, id] of [["01-base", "01-base"], ["02-peak", "02-peak"], ["03-release", "03-release"]]) {
      write(root, `compositions/frames/${stem}.html`, `<template><div data-composition-id="${id}" data-duration="2"></div></template>\n`);
    }
    write(root, "assets/bgm.mp3", "fixture");
    write(root, "audio_meta.json", JSON.stringify({ bgm: { path: "assets/bgm.mp3", volume: 0.8 }, voices: [], sfx: [] }));

    const assembled = run(ASSEMBLER, [
      "--storyboard", path.join(root, "STORYBOARD.md"),
      "--hyperframes", root,
      "--audio-meta", path.join(root, "audio_meta.json"),
    ]);
    assert.equal(assembled.status, 0, assembled.stdout + assembled.stderr);
    assert.match(assembled.stdout, /fast passages:\s+1/);
    assert.match(assembled.stdout, /fast BGM cues:\s+3/);

    const injected = run(TRANSITIONS, [
      "inject",
      "--storyboard", path.join(root, "STORYBOARD.md"),
      "--hyperframes", root,
      "--index", path.join(root, "index.html"),
    ]);
    assert.equal(injected.status, 0, injected.stdout + injected.stderr);
    assert.match(injected.stdout, /1 transition\(s\) stamped/);

    const verified = run(TRANSITIONS, [
      "verify",
      "--storyboard", path.join(root, "STORYBOARD.md"),
      "--index", path.join(root, "index.html"),
    ]);
    assert.equal(verified.status, 0, verified.stdout + verified.stderr);

    const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
    assert.match(index, /const tl = gsap\.timeline\(\{ paused: true \}\)/);
    assert.match(index, /tl\.to\("#el-bgm", \{ volume: 0, duration: 0\.08, ease: "power1\.inOut" \}, 4\)/);
    assert.match(index, /frame transitions \(injected by transitions\.mjs\)/);
  });
});

test("faceless fast passage checker rejects incomplete and noncontiguous arcs", () => {
  withProject((root) => {
    const invalid = makeStoryboard()
      .replace("- fast_passage: overload\n- fast_role: peak", "- fast_role: peak")
      .replace("- fast_role: release", "- fast_role: escalate");
    write(root, "STORYBOARD.md", invalid);
    const checked = run(CHECK, ["--storyboard", path.join(root, "STORYBOARD.md")]);
    assert.notEqual(checked.status, 0);
    assert.match(checked.stderr, /fast-passage fields but no fast_passage id/);
    assert.match(checked.stderr, /needs exactly one peak frame|needs exactly one release frame|must end with release/);
  });
});

function makeStoryboard() {
  return `---
format: 1920x1080
---

## Frame 1 — Baseline
- duration: 2s
- status: animated
- src: compositions/frames/01-base.html
- transition_in: cut
- fast_passage: overload
- fast_role: baseline
- fast_entry: centered alert
- fast_exit: alert exits right
- fast_bgm_gain: 0.75
- fast_bgm_ramp: 0.25

Stable orientation.

## Frame 2 — Peak
- duration: 2s
- status: animated
- src: compositions/frames/02-peak.html
- transition_in: crossfade
- fast_passage: overload
- fast_role: peak
- fast_entry: alert enters left
- fast_exit: cursor drops center
- fast_bgm_gain: 1
- fast_bgm_ramp: 0.1

Pressure peaks.

## Frame 3 — Release
- duration: 2s
- status: animated
- src: compositions/frames/03-release.html
- transition_in: cut
- fast_passage: overload
- fast_role: release
- fast_entry: cursor holds center
- fast_exit: clear wide frame
- fast_bgm_gain: 0

Silence resolves the passage.
`;
}

function withProject(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hf-fast-paced-"));
  try {
    fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function write(root, rel, content) {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
}
