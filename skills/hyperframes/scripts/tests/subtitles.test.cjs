"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const SCRIPTS = path.resolve(__dirname, "..");

test("English numeric STT aligns to spelled-out copy and emits JSON, SRT, and configurable captions", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hf-subs-test-"));
  try {
    fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
    fs.mkdirSync(path.join(root, "assets", "words"), { recursive: true });
    fs.copyFileSync(path.join(SCRIPTS, "build-subs.cjs"), path.join(root, "scripts", "build-subs.cjs"));
    fs.copyFileSync(path.join(SCRIPTS, "build-captions.cjs"), path.join(root, "scripts", "build-captions.cjs"));

    const narration = {
      fps: 60, language: "en", sttLanguage: "english",
      captionStyle: {
        roles: { proof: "#44aaff" }, color: "#ffffff", font: "Atlas",
        fontFallback: '"Atlas Fallback", sans-serif', fontWeight: 650,
        lineHeight: 1.2, letterSpacing: "0.01em", w400: "", w700: "",
      },
      emphasis: [["fifty percent", "proof"]], folds: [],
      sections: [{
        id: "s0", title: "numbers", paragraphs: [
          { tts: "In twenty twenty-six, fifty percent changed.", lines: ["In twenty twenty-six", "   ", "fifty percent changed"] },
          { tts: "Two hundred people responded.", lines: ["Two hundred people responded"] },
        ],
      }],
    };
    const boundaries = {
      totalSec: 3.125,
      sections: [{ id: "s0", startSec: 0, endSec: 3.125, paras: [
        { idx: 0, startSec: 0, endSec: 1.9, lines: narration.sections[0].paragraphs[0].lines },
        { idx: 1, startSec: 2, endSec: 3.125, lines: narration.sections[0].paragraphs[1].lines },
      ] }],
    };
    const words = {
      durationSec: 3.125,
      words: [
        { word: "In", start: 0.02, end: 0.12 },
        { word: "2026,", start: 0.15, end: 0.65 },
        { word: "50%", start: 0.8, end: 1.1 },
        { word: "changed.", start: 1.12, end: 1.65 },
        // An 80 ms early phoneme should stay word-locked instead of forcing a redistribution.
        { word: "200", start: 1.92, end: 2.2 },
        { word: "people", start: 2.22, end: 2.52 },
        { word: "responded.", start: 2.55, end: 3.0 },
      ],
    };
    writeJson(path.join(root, "scripts", "narration.json"), narration);
    writeJson(path.join(root, "scripts", "boundaries.json"), boundaries);
    writeJson(path.join(root, "assets", "words", "narration.words.json"), words);

    run(path.join(root, "scripts", "build-subs.cjs"), root);
    const nested = json(path.join(root, "assets", "subs", "narration.subs.json"));
    const flat = json(path.join(root, "assets", "subs.json"));
    assert.deepEqual(flat, nested);
    assert.equal(nested.chunks.length, 3);
    assert.equal(nested.chunks[0].startSec, 0.02);
    assert.equal(nested.chunks[1].startSec, 0.8);
    assert.equal(nested.chunks[2].startSec, 1.92);
    assert.ok(nested.chunks.every((chunk) => chunk.endSec <= 3.125));
    assert.ok(nested.chunks.every((chunk) => chunk.endSec > chunk.startSec));
    assert.match(fs.readFileSync(path.join(root, "assets", "subs.srt"), "utf8"), /00:00:00,800 -->/);

    run(path.join(root, "scripts", "build-captions.cjs"), root);
    const captions = fs.readFileSync(path.join(root, "compositions", "captions.html"), "utf8");
    assert.match(captions, /<html lang="en">/);
    assert.match(captions, /data-duration="3\.125"/);
    assert.match(captions, /font-family: "Atlas", "Atlas Fallback", sans-serif/);
    assert.match(captions, /font-weight: 650/);
    assert.match(captions, /line-height: 1\.2/);
    assert.match(captions, /letter-spacing: 0\.01em/);
    assert.doesNotMatch(captions, /@font-face/);
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("Chinese caption defaults remain Chinese and do not inherit the English skin", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hf-captions-zh-"));
  try {
    fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
    fs.mkdirSync(path.join(root, "assets", "subs"), { recursive: true });
    fs.copyFileSync(path.join(SCRIPTS, "build-captions.cjs"), path.join(root, "scripts", "build-captions.cjs"));
    writeJson(path.join(root, "scripts", "narration.json"), {
      fps: 60, sttLanguage: "chinese", captionStyle: { w400: "", w700: "" },
    });
    writeJson(path.join(root, "assets", "subs", "narration.subs.json"), {
      totalSec: 1.237, chunks: [{ text: "两百首歌", startSec: 0, endSec: 1, fontSize: 60, emphases: [] }],
    });
    run(path.join(root, "scripts", "build-captions.cjs"), root);
    const captions = fs.readFileSync(path.join(root, "compositions", "captions.html"), "utf8");
    assert.match(captions, /<html lang="zh">/);
    assert.match(captions, /font-weight: 400/);
    assert.match(captions, /line-height: 1\.4/);
    assert.match(captions, /letter-spacing: 0/);
    assert.match(captions, /data-duration="1\.237"/);
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("terminal caption collisions are pulled inside the decoded master without zero-length cues", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hf-subs-terminal-"));
  try {
    fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
    fs.mkdirSync(path.join(root, "assets", "words"), { recursive: true });
    fs.copyFileSync(path.join(SCRIPTS, "build-subs.cjs"), path.join(root, "scripts", "build-subs.cjs"));
    const lines = ["Alpha", "Beta", "Gamma"];
    writeJson(path.join(root, "scripts", "narration.json"), {
      fps: 60, language: "en", sttLanguage: "english", folds: [],
      sections: [{ id: "s0", paragraphs: [{ tts: "Alpha beta gamma.", lines }] }],
    });
    writeJson(path.join(root, "scripts", "boundaries.json"), {
      totalSec: 0.06,
      sections: [{ id: "s0", startSec: 0, endSec: 0.06, paras: [{ idx: 0, startSec: 0, endSec: 0.06, lines }] }],
    });
    writeJson(path.join(root, "assets", "words", "narration.words.json"), {
      durationSec: 0.06,
      words: [
        { word: "Alpha", start: 0.04, end: 0.05 },
        { word: "beta", start: 0.05, end: 0.055 },
        { word: "gamma", start: 0.055, end: 0.06 },
      ],
    });

    run(path.join(root, "scripts", "build-subs.cjs"), root);
    const chunks = json(path.join(root, "assets", "subs.json")).chunks;
    assert.equal(chunks.length, 3);
    for (let index = 0; index < chunks.length; index++) {
      assert.ok(chunks[index].endSec > chunks[index].startSec);
      assert.ok(chunks[index].endSec <= 0.06);
      if (index) assert.ok(chunks[index].startSec > chunks[index - 1].startSec);
    }
    assert.equal(chunks.at(-1).endSec, 0.06);
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("early two-thousands STT expands to the spoken year instead of twenty-five", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hf-subs-year-"));
  try {
    fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
    fs.mkdirSync(path.join(root, "assets", "words"), { recursive: true });
    fs.copyFileSync(path.join(SCRIPTS, "build-subs.cjs"), path.join(root, "scripts", "build-subs.cjs"));
    writeJson(path.join(root, "scripts", "narration.json"), {
      fps: 60, language: "en", sttLanguage: "english", folds: [],
      sections: [{ id: "s0", paragraphs: [{ tts: "Two thousand five.", lines: ["Two thousand five"] }] }],
    });
    writeJson(path.join(root, "scripts", "boundaries.json"), {
      totalSec: 1,
      sections: [{ id: "s0", startSec: 0, endSec: 1, paras: [{ idx: 0, startSec: 0, endSec: 1, lines: ["Two thousand five"] }] }],
    });
    writeJson(path.join(root, "assets", "words", "narration.words.json"), {
      durationSec: 1, words: [{ word: "2005", start: 0.1, end: 0.7 }],
    });

    run(path.join(root, "scripts", "build-subs.cjs"), root);
    const chunks = json(path.join(root, "assets", "subs.json")).chunks;
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0].startSec, 0.1);
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(root, { recursive: true, force: true });
  }
});

function run(script, cwd) {
  const result = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
function json(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
