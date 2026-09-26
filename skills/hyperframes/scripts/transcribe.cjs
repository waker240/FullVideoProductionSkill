#!/usr/bin/env node
"use strict";
// Per-section word timestamps: official OpenAI whisper-1 or explicit compatible
// WHISPER_API. Never sends audio to an author's private transcription service.
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const helper = fs.existsSync(path.join(__dirname, "public-media-api.cjs"))
  ? "./public-media-api.cjs" : "../../fish-audio-api/scripts/public-media-api.cjs";
const { loadProjectEnv, resolveTranscriptionConfig, transcribeAudio, writeAtomic } = require(helper);
function run(args) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error("FFmpeg failed preparing transcription audio; check local input paths and FFmpeg installation.");
}
function mergeSelectedWords(existing, replacement, sections) {
  return existing.filter(word => !sections.some(section => word.start >= section.startSec && word.start < section.endSec))
    .concat(replacement).sort((a,b) => a.start - b.start);
}
async function main(args = process.argv.slice(2)) {
  if (args.includes("--help") || args.includes("-h")) { console.log("Usage: node scripts/transcribe.cjs [s0 s2 ...] — reads narration.json and boundaries.json beside this script."); return; }
  const root = path.resolve(__dirname, "..");
  loadProjectEnv(root);
  const config = resolveTranscriptionConfig();
  const narration = JSON.parse(fs.readFileSync(path.join(__dirname, "narration.json"), "utf8"));
  const boundaries = JSON.parse(fs.readFileSync(path.join(__dirname, "boundaries.json"), "utf8"));
  const sections = args.length ? boundaries.sections.filter(section => args.includes(section.id)) : boundaries.sections;
  if (!sections.length || args.some(id => !sections.some(section => section.id === id))) throw new Error("Unknown or empty section selection.");
  for (const section of sections) {
    if (!/^[a-zA-Z0-9_-]+$/.test(section.id) || !Number.isFinite(section.startSec) || !Number.isFinite(section.endSec) || section.endSec <= section.startSec) throw new Error("Invalid section ID or time range in boundaries.json.");
  }
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "hf-stt-"));
  const wordsDir = path.join(root, "assets", "words");
  const transcriptsDir = path.join(root, "assets", "transcripts");
  const allWords = [];
  try {
    for (const section of sections) {
      const mp3 = path.join(temporary, `${section.id}.mp3`);
      const direct = [section.audioPath, section.audio, section.file].filter(Boolean).map(file => path.resolve(root, file)).find(file => fs.existsSync(file));
      if (direct) run(["-y", "-i", direct, "-ac", "1", "-b:a", "64k", mp3]);
      else {
        const directory = path.join(root, "assets", "tts_chunks", section.id);
        const chunks = JSON.parse(fs.readFileSync(path.join(directory, "chunks.json"), "utf8"));
        const list = path.join(temporary, `${section.id}.txt`);
        const escape = file => file.replace(/\\/g, "/").replace(/'/g, "'\\''");
        const sources = chunks.map(chunk => path.resolve(directory, chunk.file));
        if (!sources.length || sources.some(file => !fs.existsSync(file))) throw new Error("Section has missing narration chunks.");
        fs.writeFileSync(list, sources.map(file => `file '${escape(file)}'`).join("\n"));
        run(["-y", "-f", "concat", "-safe", "0", "-i", list, "-ac", "1", "-b:a", "64k", mp3]);
      }
      console.log(`${section.id}: transcribing via ${config.custom ? "configured compatible endpoint" : "OpenAI whisper-1"}`);
      const result = await transcribeAudio({ file: mp3, language: narration.sttLanguage || "zh", config });
      writeAtomic(path.join(transcriptsDir, `${section.id}.txt`), result.text);
      for (const word of result.words) allWords.push({ word: word.word, start: +(word.start + section.startSec).toFixed(3), end: +(word.end + section.startSec).toFixed(3) });
      const gap = section.endSec - section.startSec - result.words.at(-1).end;
      console.log(`${section.id}: ${result.words.length} words${gap > 1.5 ? "; review the final silent/tail gap" : ""}`);
    }
    const output = path.join(wordsDir, "narration.words.json");
    const existing = args.length && fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, "utf8")).words : [];
    const words = args.length ? mergeSelectedWords(existing, allWords, sections) : allWords;
    writeAtomic(output, JSON.stringify({ source: "narration.wav", durationSec: boundaries.totalSec, wordCount: words.length, alignedAgainst: "narration.json", words }, null, 2) + "\n");
    console.log(`wrote ${path.relative(root, output)} (${words.length} words)`);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}
if (require.main === module) main().catch(error => { console.error(`transcribe: ${error.message}`); process.exitCode = 1; });
module.exports = { main, mergeSelectedWords };
