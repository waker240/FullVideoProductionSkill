#!/usr/bin/env node
// Resumable paragraph-level Fish Audio TTS through the official public API.
// Keys and the selected voice come from the project .env or environment.
//
//   node scripts/tts-fish.mjs
//   node scripts/tts-fish.mjs --section s3 --para 2 --force
//   node scripts/tts-fish.mjs --section=s3,s4

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const cli = parseCli(process.argv.slice(2));
if (cli.help) usage(0);
const require = createRequire(import.meta.url);
const helperPath = fs.existsSync(path.join(here, "public-media-api.cjs"))
  ? "./public-media-api.cjs" : "../../fish-audio-api/scripts/public-media-api.cjs";
const { loadProjectEnv, resolveFishConfig, synthesizeOne, rejectCredentials } = require(helperPath);
loadProjectEnv(root);
let narration;
try { narration = JSON.parse(fs.readFileSync(path.join(here, "narration.json"), "utf8")); }
catch { fail("Cannot read scripts/narration.json; check the saved project profile."); }
if (!narration.voice || typeof narration.voice !== "object" || Array.isArray(narration.voice)) fail("narration.json voice must be an object.");
rejectCredentials(narration.voice, "voice");
const voice = {
  ...narration.voice,
  referenceId: narration.voice.referenceId || process.env.FISH_REFERENCE_ID,
  model: narration.voice.model || process.env.FISH_MODEL || "s2.1-pro-free",
  prosody: { ...narration.voice.prosody },
};
const transport = voice.transport || "official-api";
if (transport !== "official-api") fail("The public package uses Fish official-api. Refresh the project profile from narration.example.json.");
if (!isFishProvider(voice.provider)) fail("voice.provider must be Fish Audio.");
if (voice.format !== "wav") fail("This pipeline requires voice.format=wav.");
validateVoice(voice);
let fishConfig;
try { fishConfig = resolveFishConfig({ fish: { transport, apiUrl: voice.apiUrl, referenceId: voice.referenceId, model: voice.model, request: payload() } }); }
catch (error) { fail(error.message); }
const apiUrl = fishConfig.apiUrl;
const requireSpelledOutNumbers = narration.requireSpelledOutNumbers === true || voice.requireSpelledOutNumbers === true;
const pronunciationSubs = Array.isArray(narration.ttsSubs) ? narration.ttsSubs : [];
const sha = (value) => crypto.createHash("sha256").update(String(value), "utf8").digest("hex");
const signatureProfile = transport === "official-api" && !voice.transport
  ? { ...voice, apiUrl } : { ...voice, transport, apiUrl };
const voiceSignature = sha(JSON.stringify(signatureProfile));

const requestedSections = cli.sections
  ? narration.sections.filter((section) => cli.sections.has(section.id))
  : narration.sections;
if (!requestedSections.length) fail(`No narration sections matched: ${[...(cli.sections || [])].join(", ")}`);
if (cli.sections) {
  const found = new Set(requestedSections.map((section) => section.id));
  const missing = [...cli.sections].filter((id) => !found.has(id));
  if (missing.length) fail(`Unknown section id(s): ${missing.join(", ")}`);
}
if (cli.paragraph != null) {
  if (!cli.sections || cli.sections.size !== 1) fail("--para requires exactly one --section so a surgical run cannot touch several sections.");
  const section = requestedSections[0];
  if (cli.paragraph >= section.paragraphs.length) fail(`${section.id}: paragraph ${cli.paragraph} is out of range (0-${section.paragraphs.length - 1}).`);
}

const generationPath = path.join(root, "assets", "tts_chunks", "generation-manifest.json");
const previousGeneration = readJson(generationPath, { sections: [] });
const generationBySection = new Map((previousGeneration.sections || []).map((section) => [section.sectionId, section]));

for (const section of requestedSections) {
  const directory = path.join(root, "assets", "tts_chunks", section.id);
  const manifestPath = path.join(directory, "chunks.json");
  fs.mkdirSync(directory, { recursive: true });
  const previous = readJson(manifestPath, []);
  if (!Array.isArray(previous)) fail(`Invalid chunk manifest: ${manifestPath}`);
  const chunks = [];

  for (let index = 0; index < section.paragraphs.length; index += 1) {
    const paragraph = section.paragraphs[index];
    const prior = previous.find((item) => item.index === index);
    const stem = `chunk-${String(index).padStart(3, "0")}`;
    const raw = path.join(directory, `${stem}.src.wav`);
    const mp3 = path.join(directory, `${stem}.mp3`);

    if (cli.paragraph != null && index !== cli.paragraph) {
      if (!prior || !fs.existsSync(raw) || !fs.existsSync(mp3)) {
        fail(`${section.id}/${index} is missing; a --para run requires every unselected paragraph to exist already.`);
      }
      chunks.push(prior);
      continue;
    }

    const isSilence = paragraph.silence != null;
    const text = isSilence ? "" : spokenText(paragraph.tts);
    if (!isSilence && !text) fail(`${section.id}/${index}: paragraph needs tts text or a silence duration.`);
    if (isSilence && (!(Number(paragraph.silence) > 0) || !Number.isFinite(Number(paragraph.silence)))) {
      fail(`${section.id}/${index}: silence must be a positive number of seconds.`);
    }
    if (!isSilence && requireSpelledOutNumbers && /\d/.test(text)) {
      fail(`${section.id}/${index}: TTS text contains a numeric digit; spell numbers out before synthesis.`);
    }

    const gapAfter = finiteNonNegative(paragraph.gapAfter, `${section.id}/${index}.gapAfter`);
    const sourceKey = isSilence ? `[silence:${Number(paragraph.silence)}]` : text;
    const textSha256 = sha(sourceKey);
    const reusable = !cli.force && fs.existsSync(raw) && fs.existsSync(mp3)
      && prior?.textSha256 === textSha256 && prior?.voiceSignature === voiceSignature
      && prior?.gapAfter === gapAfter;

    if (!reusable) {
      process.stdout.write(`${section.id}/${index}: ${isSilence ? "silence" : "generating"}… `);
      if (isSilence) createSilence(raw, Number(paragraph.silence));
      else await requestFish(text, raw);
      normalizeAudio(raw, mp3, gapAfter);
      console.log("done");
    } else {
      console.log(`${section.id}/${index}: reuse`);
    }

    const metadata = probe(mp3);
    if (!(metadata.durationSec > 0)) fail(`${section.id}/${index}: generated audio has no measurable duration.`);
    chunks.push({
      index, kind: isSilence ? "silence" : "speech", file: `${stem}.mp3`, source: `${stem}.src.wav`,
      textSha256, voiceSignature, gapAfter, durationSec: metadata.durationSec,
      codec: metadata.codec, sampleRate: metadata.sampleRate, channels: metadata.channels,
    });
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(chunks, null, 2)}\n`, "utf8");
  generationBySection.set(section.id, { sectionId: section.id, chunks });
}

const orderedSections = narration.sections
  .map((section) => generationBySection.get(section.id))
  .filter(Boolean);
const generation = {
  provider: voice.provider, transport,
  model: voice.model,
  referenceId: voice.referenceId,
  voiceSignature, apiUrl: redactUrl(apiUrl), generatedAt: new Date().toISOString(),
  partialRun: Boolean(cli.sections || cli.paragraph != null),
  selectedSections: requestedSections.map((section) => section.id),
  sections: orderedSections,
};
fs.mkdirSync(path.dirname(generationPath), { recursive: true });
fs.writeFileSync(generationPath, `${JSON.stringify(generation, null, 2)}\n`, "utf8");
console.log(`wrote ${path.relative(root, generationPath)}`);

function spokenText(raw) {
  let text = String(raw ?? "").trim();
  for (const pair of pronunciationSubs) {
    if (!Array.isArray(pair) || pair.length < 2) continue;
    text = text.split(String(pair[0])).join(String(pair[1]));
  }
  return text;
}

function payload() {
  return {
    sample_rate: voice.sampleRate, temperature: voice.temperature, top_p: voice.topP,
    normalize: voice.normalize, chunk_length: voice.chunkLength,
    min_chunk_length: voice.minChunkLength, condition_on_previous_chunks: voice.conditionOnPreviousChunks,
    max_new_tokens: voice.maxNewTokens, repetition_penalty: voice.repetitionPenalty,
    early_stop_threshold: voice.earlyStopThreshold, latency: voice.latency, prosody: voice.prosody,
  };
}

async function requestFish(text, output) {
  const partial = `${output}.validated-${process.pid}.wav`;
  try {
    await synthesizeOne({ text, config: fishConfig, wavAbs: partial });
    if (!(probe(partial).durationSec > 0.05)) throw new Error("Fish WAV was empty or truncated; POST was not retried.");
    fs.renameSync(partial, output);
  } catch (error) {
    fail(error.message);
  } finally { fs.rmSync(partial, { force: true }); }
}

function createSilence(output, durationSec) {
  run("ffmpeg", ["-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", String(durationSec), "-c:a", "pcm_s16le", output]);
}

function normalizeAudio(raw, mp3, gapAfter) {
  const args = ["-y", "-i", raw];
  if (gapAfter > 0) args.push("-af", `apad=pad_dur=${gapAfter}`);
  args.push("-ar", "48000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "192k", mp3);
  run("ffmpeg", args);
}

function probe(file) {
  const result = spawnSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration:stream=codec_name,sample_rate,channels", "-of", "json", file,
  ], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || `ffprobe failed: ${file}`);
  let data;
  try { data = JSON.parse(result.stdout); }
  catch { throw new Error(`ffprobe returned invalid JSON for ${file}`); }
  return {
    durationSec: Number(data.format?.duration), codec: data.streams?.[0]?.codec_name || null,
    sampleRate: Number(data.streams?.[0]?.sample_rate) || null,
    channels: Number(data.streams?.[0]?.channels) || null,
  };
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`);
}

function finiteNonNegative(value, label) {
  if (value == null) return 0;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) fail(`${label} must be a non-negative number.`);
  return number;
}

function validateVoice(value) {
  boolean(value.normalize, "voice.normalize");
  boolean(value.conditionOnPreviousChunks, "voice.conditionOnPreviousChunks");
  bounded(value.temperature, "voice.temperature", 0, 1);
  bounded(value.topP, "voice.topP", 0, 1);
  integerInRange(value.chunkLength, "voice.chunkLength", 100, 300);
  integerInRange(value.minChunkLength, "voice.minChunkLength", 0, 100);
  positiveInteger(value.sampleRate, "voice.sampleRate");
  positiveInteger(value.maxNewTokens, "voice.maxNewTokens");
  bounded(value.earlyStopThreshold, "voice.earlyStopThreshold", 0, 1);
  bounded(value.prosody.speed, "voice.prosody.speed", 0.5, 2);
  finite(value.prosody.volume, "voice.prosody.volume");
  boolean(value.prosody.normalize_loudness, "voice.prosody.normalize_loudness");
  finitePositive(value.repetitionPenalty, "voice.repetitionPenalty");
  if (!["low", "normal", "balanced"].includes(value.latency)) fail("voice.latency must be low, normal, or balanced.");
}

function isFishProvider(value) {
  const provider = String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  return ["fish", "fish audio", "fish audio raw api"].includes(provider);
}

function boolean(value, label) {
  if (typeof value !== "boolean") fail(`${label} must be true or false.`);
  return value;
}

function bounded(value, label, min, max) {
  const number = finite(value, label);
  if (number < min || number > max) fail(`${label} must be between ${min} and ${max}.`);
  return number;
}

function integerInRange(value, label, min, max) {
  const number = bounded(value, label, min, max);
  if (!Number.isInteger(number)) fail(`${label} must be an integer.`);
  return number;
}

function positiveInteger(value, label) {
  const number = finitePositive(value, label);
  if (!Number.isInteger(number)) fail(`${label} must be an integer.`);
  return number;
}

function finitePositive(value, label) {
  const number = finite(value, label);
  if (number <= 0) fail(`${label} must be greater than zero.`);
  return number;
}

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) fail(`${label} must be numeric.`);
  return number;
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}

function redactUrl(value) {
  try {
    const url = new URL(value);
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString();
  }
  catch { return value; }
}

function parseCli(args) {
  const parsed = { sections: null, paragraph: null, force: false, help: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--force") parsed.force = true;
    else if (arg === "--section") parsed.sections = sectionSet(args[++i], "--section");
    else if (arg.startsWith("--section=")) parsed.sections = sectionSet(arg.slice(10), "--section");
    else if (arg === "--para") parsed.paragraph = paragraphIndex(args[++i]);
    else if (arg.startsWith("--para=")) parsed.paragraph = paragraphIndex(arg.slice(7));
    else fail(`Unknown option: ${arg}`);
  }
  return parsed;
}

function sectionSet(value, option) {
  if (!value) fail(`${option} requires one or more comma-separated section ids.`);
  return new Set(String(value).split(",").map((item) => item.trim()).filter(Boolean));
}

function paragraphIndex(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) fail("--para must be a zero-based non-negative integer.");
  return number;
}

function fail(message) { console.error(`tts-fish: ${message}`); process.exit(1); }
function usage(code) {
  console.log("usage: node scripts/tts-fish.mjs [--section s0,s1] [--para 2] [--force]");
  process.exit(code);
}
