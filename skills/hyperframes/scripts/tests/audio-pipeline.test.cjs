"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const test = require("node:test");

const SCRIPTS = path.resolve(__dirname, "..");

test("concat is path-safe and clamps terminal boundaries to the decoded WAV", { skip: !hasCommand("ffmpeg") || !hasCommand("ffprobe") }, () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-audio-'quote-"));
  try {
    const scripts = path.join(temporaryRoot, "scripts");
    fs.mkdirSync(path.join(temporaryRoot, "assets", "tts_chunks", "s0"), { recursive: true });
    fs.mkdirSync(path.join(temporaryRoot, "assets", "tts_chunks", "s1"), { recursive: true });
    fs.mkdirSync(scripts, { recursive: true });
    fs.copyFileSync(path.join(SCRIPTS, "concat.js"), path.join(scripts, "concat.js"));
    fs.writeFileSync(path.join(temporaryRoot, "package.json"), "{\"type\":\"module\"}\n");
    fs.writeFileSync(path.join(scripts, "narration.json"), `${JSON.stringify({
      sections: [
        { id: "s0", title: "one", paragraphs: [{ lines: ["one"] }] },
        { id: "s1", title: "two", paragraphs: [{ lines: ["two"] }] },
      ],
    }, null, 2)}\n`);

    makeMp3(path.join(temporaryRoot, "assets", "tts_chunks", "s0", "chunk-000.mp3"), 0.137, 330);
    makeMp3(path.join(temporaryRoot, "assets", "tts_chunks", "s1", "chunk-000.mp3"), 0.211, 550);
    const result = spawnSync(process.execPath, [path.join(scripts, "concat.js")], { cwd: temporaryRoot, encoding: "utf8" });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);

    const boundaries = JSON.parse(fs.readFileSync(path.join(scripts, "boundaries.json"), "utf8"));
    const wavDuration = probe(path.join(temporaryRoot, "assets", "voice", "narration.wav"));
    const lastSection = boundaries.sections.at(-1);
    const lastParagraph = lastSection.paras.at(-1);
    assert.ok(Math.abs(boundaries.totalSec - wavDuration) <= 0.001);
    assert.equal(lastSection.endSec, boundaries.totalSec);
    assert.equal(lastParagraph.endSec, boundaries.totalSec);
    assert.equal(boundaries.sections[0].endSec, boundaries.sections[1].startSec);
    assert.ok(boundaries.sections.every((section) => section.startSec < section.endSec));
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("cross-platform master preserves duration and regenerates playback MP3", { skip: !hasCommand("ffmpeg") || !hasCommand("ffprobe") }, () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-master-test-"));
  try {
    const input = path.join(temporaryRoot, "narration.wav");
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i",
      "sine=frequency=440:sample_rate=48000:duration=1.25", "-c:a", "pcm_s16le", input,
    ]);
    const before = probe(input);
    const result = spawnSync(process.execPath, [path.join(SCRIPTS, "master.cjs"), input], { encoding: "utf8" });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const after = probe(input);
    assert.ok(Math.abs(before - after) <= 0.01);
    assert.equal(fs.existsSync(path.join(temporaryRoot, "narration.mp3")), true);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("master failure cleans its private temp directory and preserves the delivered pair", { skip: !hasCommand("ffmpeg") || !hasCommand("ffprobe") }, () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-master-failure-"));
  try {
    const input = path.join(temporaryRoot, "narration.wav");
    const mp3 = path.join(temporaryRoot, "narration.mp3");
    const taskTemp = path.join(temporaryRoot, "private-temp");
    fs.mkdirSync(taskTemp, { recursive: true });
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i",
      "sine=frequency=440:sample_rate=48000:duration=0.4", "-c:a", "pcm_s16le", input,
    ]);
    fs.writeFileSync(mp3, "existing-playback-file");
    const originalWav = fs.readFileSync(input);
    const originalMp3 = fs.readFileSync(mp3);

    const result = spawnSync(process.execPath, [path.join(SCRIPTS, "master.cjs"), input], {
      encoding: "utf8",
      env: { ...process.env, TARGET_I: "999", TMP: taskTemp, TEMP: taskTemp, TMPDIR: taskTemp },
    });
    assert.notEqual(result.status, 0);
    assert.deepEqual(fs.readFileSync(input), originalWav);
    assert.deepEqual(fs.readFileSync(mp3), originalMp3);
    assert.deepEqual(fs.readdirSync(taskTemp), []);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

function makeMp3(output, duration, frequency) {
  execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i",
    `sine=frequency=${frequency}:sample_rate=48000:duration=${duration}`,
    "-ac", "1", "-c:a", "libmp3lame", "-b:a", "192k", output,
  ]);
}

function probe(file) {
  return Number(execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", file,
  ], { encoding: "utf8" }).trim());
}

function hasCommand(command) {
  const result = spawnSync(command, ["-version"], { stdio: "ignore" });
  return result.status === 0;
}
