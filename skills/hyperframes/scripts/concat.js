// scripts/concat.js — stitch all paragraph mp3s (in section/para order) into
// one master mp3 + delay-free master WAV, recording paragraph & section offsets.
// Writes:
//   assets/voice/narration.mp3   (composition playback)
//   assets/voice/narration.wav   (timing/transcription/mastering source; start_time must be N/A)
//   scripts/boundaries.json      ({ totalSec, sections:[{id,startSec,endSec,paras:[{idx,startSec,endSec,lines}]}] })
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const narration = JSON.parse(readFileSync(resolve(__dirname, "narration.json"), "utf8"));

const ffdur = (file) => parseFloat(execFileSync("ffprobe", [
  "-v", "error", "-show_entries", "format=duration",
  "-of", "default=noprint_wrappers=1:nokey=1", file,
], { encoding: "utf8" }).trim());
const ffconcatEntry = (file) => `file '${pathForFfconcat(file)}'`;

const voiceDir = resolve(root, "assets/voice");
mkdirSync(voiceDir, { recursive: true });

// Build ordered chunk list + boundary metadata (durations measured from mp3s).
const orderedFiles = [];
const sections = [];
let cum = 0;
for (const section of narration.sections) {
  const secStart = cum;
  const paras = [];
  for (let p = 0; p < section.paragraphs.length; p++) {
    const file = resolve(root, "assets/tts_chunks", section.id, `chunk-${String(p).padStart(3, "0")}.mp3`);
    if (!existsSync(file)) throw new Error("missing chunk: " + file);
    const d = ffdur(file);
    orderedFiles.push(file);
    paras.push({ idx: p, startSec: +cum.toFixed(3), endSec: +(cum + d).toFixed(3), lines: section.paragraphs[p].lines });
    cum += d;
  }
  sections.push({ id: section.id, title: section.title, startSec: +secStart.toFixed(3), endSec: +cum.toFixed(3), paras });
}

// Concat via ffmpeg demuxer.
const listPath = resolve(voiceDir, "_concat.txt");
writeFileSync(listPath, orderedFiles.map(ffconcatEntry).join("\n"));
const mp3Out = resolve(voiceDir, "narration.mp3");
const wavOut = resolve(voiceDir, "narration.wav");
execFileSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", mp3Out, "-loglevel", "error"]);
execFileSync("ffmpeg", ["-y", "-i", mp3Out, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", wavOut, "-loglevel", "error"]);

const startTime = execFileSync("ffprobe", [
  "-v", "error", "-show_entries", "stream=start_time",
  "-of", "default=noprint_wrappers=1:nokey=1", wavOut,
], { encoding: "utf8" }).trim();
const wavDur = ffdur(wavOut);

// Encoded MP3 frames can make the sum of probed chunks a few milliseconds
// longer than the decoded, delay-free WAV used as the timing authority.
if (sections.length) {
  const lastSection = sections[sections.length - 1];
  lastSection.endSec = +wavDur.toFixed(3);
  if (lastSection.paras.length) lastSection.paras[lastSection.paras.length - 1].endSec = +wavDur.toFixed(3);
}

writeFileSync(resolve(__dirname, "boundaries.json"), JSON.stringify({
  totalSec: +wavDur.toFixed(3), generatedAt: new Date().toISOString(), sections,
}, null, 2));

console.log(`master wav: ${wavDur.toFixed(2)}s  start_time=${startTime}`);
console.log(`sections: ${sections.map((s) => `${s.id}=${(s.endSec - s.startSec).toFixed(1)}s`).join("  ")}`);
console.log(`wrote scripts/boundaries.json`);

function pathForFfconcat(file) {
  // ffconcat accepts forward slashes on every platform. Backslash-escape the
  // only delimiter that matters inside a single-quoted entry.
  return resolve(file).replace(/\\/g, "/").replace(/'/g, "'\\''");
}
