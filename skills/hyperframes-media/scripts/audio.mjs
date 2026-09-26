#!/usr/bin/env node
// audio.mjs — the shared Fish-only / local-asset HyperFrames audio engine.
//
// Usage:
//   node <MEDIA_DIR>/scripts/audio.mjs \
//     --request ./audio_request.json --hyperframes . --out ./audio_meta.json
//
// audio_request.json:
//   {
//     "lang": "en",
//     "speed": 1,
//     "fish": {
//       "reference_id": "<Fish voice model id>",
//       "transport": "official-api",
//       "model": "s2.1-pro-free",
//       "request": { "prosody": { "speed": 1 }, "normalize": true }
//     },
//     "lines": [
//       { "id": "01", "text": "...", "sfx": [
//         "whoosh",
//         { "name": "typing", "path": "library/typing.wav", "offset_s": 0.2 }
//       ] }
//     ],
//     "bgm": { "path": "library/underscore.mp3", "source": "curated", "volume": 0.18 },
//     "sfx_manifest": "library/sfx-manifest.json"
//   }
//
// Fish configuration: FISH_API_KEY, FISH_REFERENCE_ID, optional FISH_MODEL.
// The project .env is loaded; existing environment values win. Word timestamps
// use OpenAI whisper-1 or an explicitly configured compatible WHISPER_API.
//
// Output:
//   { tts_provider:"fish-audio", voice_id, fish_model, bgm,
//     voices:[{id,path,duration_s,words:[{id,text,start,end}]}],
//     sfx:[{id,name,file,source,offset_s,duration_s,volume}],
//     total_duration_s, anomalies }
//
// --only tts,bgm,sfx runs a subset and merges it into an existing --out. Fields
// belonging to capabilities not selected remain unchanged. There are no
// provider, retrieval, generation, auth-preflight, or pending-job flags.

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import {
  ffprobeDuration,
  loadProjectEnv,
  resolveFishConfig,
  synthesizeOne,
  transcribeWav,
  validateFishModel,
  validateTranscriptionConfig,
  withWordIds,
} from "./lib/tts.mjs";
import { resolveSfx } from "./lib/sfx.mjs";

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && index + 1 < argv.length ? argv[index + 1] : fallback;
};
const fail = (message) => {
  console.error(`✗ audio engine: ${message}`);
  process.exit(1);
};
const r3 = (value) => Number(value.toFixed(3));

const hyperframesDir = resolve(flag("hyperframes", "."));
loadProjectEnv(hyperframesDir);
const requestPath = resolve(flag("request", join(hyperframesDir, "audio_request.json")));
const outPath = resolve(flag("out", join(hyperframesDir, "audio_meta.json")));
const only = new Set(
  String(flag("only", "tts,bgm,sfx"))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const unknownCapabilities = [...only].filter((value) => !["tts", "bgm", "sfx"].includes(value));
if (unknownCapabilities.length) fail(`unknown --only capability: ${unknownCapabilities.join(", ")}`);

if (!existsSync(requestPath)) fail(`audio_request.json not found at ${requestPath}`);
let request;
try {
  request = JSON.parse(readFileSync(requestPath, "utf8"));
} catch (error) {
  fail(`audio_request.json parse: ${error.message}`);
}
if (!request || typeof request !== "object" || Array.isArray(request)) {
  fail("audio_request.json root must be an object");
}
const lines = Array.isArray(request.lines) ? request.lines : [];
const lang = String(request.lang || "en");

let previous = {};
if (existsSync(outPath)) {
  try {
    previous = JSON.parse(readFileSync(outPath, "utf8"));
  } catch (error) {
    fail(`existing audio_meta.json parse: ${error.message}`);
  }
}
if (!previous || typeof previous !== "object" || Array.isArray(previous)) {
  fail("existing audio_meta.json root must be an object");
}

const CAPABILITIES = ["tts", "bgm", "sfx"];
const emptyAnomalyGroups = () => ({ tts: [], bgm: [], sfx: [], other: [] });
const classifyAnomaly = (message) => {
  if (/^line\b/i.test(message)) return "tts";
  if (/^bgm\b/i.test(message)) return "bgm";
  if (/^sfx\b/i.test(message)) return "sfx";
  return "other";
};
const loadAnomalyGroups = (metadata) => {
  const groups = emptyAnomalyGroups();
  if (metadata.anomalies_by_capability != null) {
    const stored = metadata.anomalies_by_capability;
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
      fail("existing anomalies_by_capability must be an object of string arrays");
    }
    for (const capability of [...CAPABILITIES, "other"]) {
      if (stored[capability] == null) continue;
      if (
        !Array.isArray(stored[capability]) ||
        !stored[capability].every((item) => typeof item === "string")
      ) {
        fail(`existing anomalies_by_capability.${capability} must be a string array`);
      }
      groups[capability] = [...stored[capability]];
    }
    return groups;
  }
  if (metadata.anomalies != null && !Array.isArray(metadata.anomalies)) {
    fail("existing anomalies must be a string array");
  }
  for (const anomaly of metadata.anomalies ?? []) {
    if (typeof anomaly !== "string") fail("existing anomalies must contain strings only");
    groups[classifyAnomaly(anomaly)].push(anomaly);
  }
  return groups;
};

const anomalyGroups = loadAnomalyGroups(previous);
for (const capability of only) anomalyGroups[capability] = [];
const addAnomaly = (capability, message) => anomalyGroups[capability].push(message);

function inside(root, target) {
  const rel = relative(root, target);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function localFrozenAsset(value, directory, label) {
  if (typeof value !== "string" || !value.trim()) fail(`${label} must have a local path`);
  if (isAbsolute(value) || /^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    fail(`${label} must use a project-relative local path`);
  }
  const directoryRoot = resolve(hyperframesDir, directory);
  const absolute = resolve(hyperframesDir, value);
  if (!inside(directoryRoot, absolute)) fail(`${label} must stay under ${directory}/`);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) fail(`${label} local file is missing`);
  const realProject = realpathSync(hyperframesDir);
  const realDirectory = realpathSync(directoryRoot);
  const canonical = realpathSync(absolute);
  if (!inside(realProject, canonical)) fail(`${label} local file escapes the project through a link`);
  if (!inside(realDirectory, canonical)) {
    fail(`${label} local file escapes ${directory}/ through a link`);
  }
  return canonical;
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

function unitInterval(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 1;
}

function validReferenceId(value) {
  return Boolean(
    (typeof value === "string" && value.trim()) ||
    (Array.isArray(value) &&
      value.length > 0 &&
      value.every((item) => typeof item === "string" && item.trim()))
  );
}

function validatePreservedTts(metadata) {
  const preservedVoices = metadata.voices ?? [];
  if (!Array.isArray(preservedVoices)) fail("preserved TTS voices must be an array");
  const provider = metadata.tts_provider ?? null;
  const voice = metadata.voice_id ?? null;
  const model = metadata.fish_model ?? null;
  const transport = metadata.fish_transport ?? "official-api";
  const hasTts = provider != null || voice != null || model != null || preservedVoices.length > 0;
  if (!hasTts) return;
  if (provider !== "fish-audio") {
    fail(`preserved TTS provider must be fish-audio, received ${String(provider)}`);
  }
  if (transport !== "official-api") fail("preserved Fish TTS transport must be official-api in this public package");
  if (!validReferenceId(voice)) fail("preserved Fish TTS requires a non-empty voice_id");
  try {
    validateFishModel(model);
  } catch (error) {
    fail(`preserved Fish TTS: ${error.message}`);
  }
  const ids = new Set();
  for (const entry of preservedVoices) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      fail("preserved TTS voice entries must be objects");
    }
    const id = String(entry.id ?? "").trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id) || ids.has(id)) {
      fail(`preserved TTS has an invalid or duplicate voice id "${id}"`);
    }
    ids.add(id);
    if (typeof entry.path !== "string" || !entry.path.toLowerCase().endsWith(".wav")) {
      fail(`preserved TTS voice ${id} must be a frozen WAV`);
    }
    const absolute = localFrozenAsset(entry.path, "assets/voice", `preserved TTS voice ${id}`);
    if (!positiveNumber(ffprobeDuration(absolute))) {
      fail(`preserved TTS voice ${id} must contain a positive-duration audio stream`);
    }
    if (!positiveNumber(entry.duration_s)) fail(`preserved TTS voice ${id} needs positive duration_s`);
    if (!Array.isArray(entry.words)) fail(`preserved TTS voice ${id} words must be an array`);
  }
}

function validatePreservedBgm(metadata) {
  for (const [field, value] of Object.entries(metadata)) {
    if (!field.startsWith("bgm_")) continue;
    if (value != null && value !== false) fail(`preserved BGM contains unsupported field ${field}`);
  }
  const preservedBgm = metadata.bgm ?? null;
  if (preservedBgm == null) return;
  if (typeof preservedBgm !== "object" || Array.isArray(preservedBgm)) {
    fail("preserved BGM must be null or a local asset object");
  }
  if (preservedBgm.mode !== "local") fail("preserved BGM mode must be local");
  const absolute = localFrozenAsset(preservedBgm.path, "assets/bgm", "preserved BGM");
  if (!positiveNumber(ffprobeDuration(absolute))) {
    fail("preserved BGM must contain a positive-duration audio stream");
  }
  if (!positiveNumber(preservedBgm.duration_s)) fail("preserved BGM needs positive duration_s");
  if (!unitInterval(preservedBgm.volume)) fail("preserved BGM volume must be between 0 and 1");
}

function validatePreservedSfx(metadata) {
  const preservedSfx = metadata.sfx ?? [];
  if (!Array.isArray(preservedSfx)) fail("preserved SFX must be an array");
  const durationByPath = new Map();
  for (const [index, cue] of preservedSfx.entries()) {
    if (!cue || typeof cue !== "object" || Array.isArray(cue)) {
      fail(`preserved SFX cue ${index} must be an object`);
    }
    const absolute = localFrozenAsset(cue.file, "assets/sfx", `preserved SFX cue ${index}`);
    let duration = durationByPath.get(absolute);
    if (duration == null) {
      duration = ffprobeDuration(absolute);
      durationByPath.set(absolute, duration);
    }
    if (!positiveNumber(duration)) {
      fail(`preserved SFX cue ${index} must contain a positive-duration audio stream`);
    }
    if (!String(cue.id ?? "").trim()) fail(`preserved SFX cue ${index} requires an id`);
    if (!String(cue.name ?? "").trim()) fail(`preserved SFX cue ${index} requires a name`);
    if (!positiveNumber(cue.duration_s)) fail(`preserved SFX cue ${index} needs positive duration_s`);
    if (!unitInterval(cue.volume)) fail(`preserved SFX cue ${index} volume must be between 0 and 1`);
    const offset = Number(cue.offset_s);
    if (!Number.isFinite(offset) || offset < 0) {
      fail(`preserved SFX cue ${index} offset_s must be zero or positive`);
    }
  }
}

if (!only.has("tts")) validatePreservedTts(previous);
if (!only.has("bgm")) validatePreservedBgm(previous);
if (!only.has("sfx")) validatePreservedSfx(previous);

function validatedTtsLines(inputLines) {
  const normalized = [];
  const ids = new Set();
  for (const line of inputLines) {
    const id = String(line?.id ?? "").trim();
    if (!id) fail("each TTS line requires a non-empty id");
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) {
      fail(`line id "${id}" is unsafe; use letters, numbers, dot, underscore, or hyphen`);
    }
    if (ids.has(id)) fail(`duplicate TTS line id "${id}"`);
    ids.add(id);
    normalized.push({ id, text: String(line?.text ?? "") });
  }
  return normalized;
}

const ttsLines = only.has("tts") ? validatedTtsLines(lines) : [];

let voices = previous.voices ?? [];
let ttsProvider = previous.tts_provider ?? null;
let voiceId = previous.voice_id ?? null;
let fishModel = previous.fish_model ?? null;
let fishTransport = previous.fish_transport ?? null;
let fishDefaults = previous.fish_defaults ?? null;
if (only.has("tts")) {
  voices = [];
  ttsProvider = ttsLines.length ? "fish-audio" : null;
  voiceId = null;
  fishModel = null;
  fishTransport = null;
  fishDefaults = null;
  if (ttsLines.length) {
    let config;
    try {
      config = resolveFishConfig({ fish: request.fish, speed: request.speed });
      validateTranscriptionConfig();
    } catch (error) {
      fail(error.message);
    }
    voiceId = config.referenceId;
    fishModel = config.model;
    fishTransport = config.transport;
    fishDefaults = null;
    console.error(`· tts: Fish Audio · ${fishTransport} · ${fishModel} · ${ttsLines.length} line(s)`);

    for (const { id, text } of ttsLines) {
      if (!text.trim()) {
        addAnomaly("tts", `line ${id}: empty text — skipped`);
        continue;
      }
      const relative = `assets/voice/${id}.wav`;
      const absolute = join(hyperframesDir, relative);
      try {
        await synthesizeOne({ text, config, wavAbs: absolute });
      } catch (error) {
        fail(`line ${id}: ${error.message}; no fallback provider is configured`);
      }
      const duration = ffprobeDuration(absolute);
      if (!Number.isFinite(duration) || duration <= 0) {
        fail(`line ${id}: Fish returned a WAV whose duration ffprobe could not validate`);
      }
      let transcript;
      try { transcript = await transcribeWav({ wavRel: relative, lang, hyperframesDir }); }
      catch (error) { fail(`line ${id}: ${error.message}; raw voice remains at ${relative}`); }
      const words = withWordIds(transcript || []);
      if (!transcript) {
        addAnomaly("tts", `line ${id}: transcription failed; words is empty`);
      } else if (words.length === 0) {
        addAnomaly("tts", `line ${id}: transcription returned no usable words; words is empty`);
      }
      voices.push({ id, path: relative, duration_s: r3(duration), words });
      console.error(`  voice ${id}: ${relative} (${r3(duration)}s, ${words.length} words)`);
    }
  }
}
const totalDuration = r3(voices.reduce((sum, voice) => sum + Number(voice.duration_s || 0), 0));

function resolveLocalInput(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return null;
  if (isAbsolute(value)) return resolve(value);
  const projectRelative = resolve(hyperframesDir, value);
  if (existsSync(projectRelative)) return projectRelative;
  return resolve(dirname(requestPath), value);
}

let bgm = previous.bgm ?? null;
if (only.has("bgm")) {
  bgm = null;
  if (request.bgm != null) {
    if (typeof request.bgm !== "object" || Array.isArray(request.bgm)) {
      fail("bgm must be null or an object with a local path/source");
    }
    const configuredPath = request.bgm.path ?? request.bgm.source;
    const sourcePath = resolveLocalInput(configuredPath);
    if (!sourcePath || !existsSync(sourcePath) || !statSync(sourcePath).isFile()) {
      addAnomaly(
        "bgm",
        "bgm: explicit local path/source is missing or is not a local file — skipped",
      );
    } else {
      const canonicalSource = realpathSync(sourcePath);
      const probed = ffprobeDuration(canonicalSource);
      if (!Number.isFinite(probed) || probed <= 0) {
        addAnomaly(
          "bgm",
          "bgm: explicit local file has no positive-duration audio stream — skipped",
        );
      } else {
        const extension = extname(canonicalSource).toLowerCase();
        const stem =
          basename(canonicalSource, extname(canonicalSource))
            .replace(/-[a-f0-9]{12}$/i, "")
            .replace(/[^A-Za-z0-9._-]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 72) || "music";
        const contentSuffix = createHash("sha256")
          .update(readFileSync(canonicalSource))
          .digest("hex")
          .slice(0, 12);
        const destinationRelative = `assets/bgm/${stem}-${contentSuffix}${extension}`;
        const destination = join(hyperframesDir, destinationRelative);
        mkdirSync(dirname(destination), { recursive: true });
        if (resolve(canonicalSource) !== resolve(destination)) {
          copyFileSync(canonicalSource, destination);
        }
        const rawDeclaredDuration = request.bgm.duration_s;
        const hasDeclaredDuration =
          rawDeclaredDuration != null &&
          !(typeof rawDeclaredDuration === "string" && rawDeclaredDuration.trim() === "");
        const declared = hasDeclaredDuration ? Number(rawDeclaredDuration) : NaN;
        const duration = Number.isFinite(declared) && declared > 0 ? declared : probed;
        const volumeValue = Number(request.bgm.volume ?? 0.18);
        const volume = Number.isFinite(volumeValue)
          ? Math.max(0, Math.min(1, volumeValue))
          : 0.18;
        bgm = {
          path: destinationRelative,
          source: request.bgm.path ? String(request.bgm.source || "local") : "local",
          volume: r3(volume),
          mode: "local",
          duration_s: r3(duration),
        };
        console.error(`· bgm: ${destinationRelative} (local)`);
      }
    }
  } else {
    console.error("· bgm: none requested");
  }
}

let sfx = previous.sfx ?? [];
if (only.has("sfx")) {
  const lineCues = lines.flatMap((line) =>
    (Array.isArray(line?.sfx) ? line.sfx : []).map((cue) => ({ id: String(line.id), cue })),
  );
  const topLevelCues = (Array.isArray(request.sfx) ? request.sfx : []).map((cue) => ({
    id: String(cue?.id ?? ""),
    cue,
  }));
  const manifestValue = flag("sfx-manifest", request.sfx_manifest || null);
  const manifestPath = manifestValue
    ? resolveLocalInput(manifestValue)
    : join(hyperframesDir, "assets", "sfx", "manifest.json");
  const resolved = await resolveSfx({
    cues: [...lineCues, ...topLevelCues],
    hyperframesDir,
    manifestPath,
    requestDirectory: dirname(requestPath),
  });
  sfx = resolved.sfx;
  for (const anomaly of resolved.anomalies) addAnomaly("sfx", anomaly);
  console.error(`· sfx: ${sfx.length} local cue(s) resolved`);
}

const anomaliesByCapability = Object.fromEntries(
  [...CAPABILITIES, "other"].map((capability) => [capability, [...anomalyGroups[capability]]]),
);
const anomalies = [...CAPABILITIES, "other"].flatMap(
  (capability) => anomaliesByCapability[capability],
);

const meta = {
  tts_provider: ttsProvider,
  voice_id: voiceId,
  fish_model: fishModel,
  fish_transport: fishTransport,
  fish_defaults: fishDefaults,
  bgm,
  voices,
  sfx,
  total_duration_s: totalDuration,
  anomalies,
  anomalies_by_capability: anomaliesByCapability,
};
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(meta, null, 2)}\n`);

console.log(`✓ audio engine → ${outPath}`);
console.log(`  ran: ${[...only].join(",")} · voices: ${voices.length} · bgm: ${bgm ? "local" : "none"} · sfx: ${sfx.length}`);
console.log(`  total voice duration: ${totalDuration}s`);
if (anomalies.length) {
  console.log("anomalies (non-fatal):");
  for (const anomaly of anomalies) console.log(`  - ${anomaly}`);
}
