"use strict";
// Public REST adapters. Node >=22.20; no SDK, browser cookies, or private service.
const fs = require("node:fs");
const path = require("node:path");
const FISH_URL = "https://api.fish.audio/v1/tts";
const TRANSCRIBE_URL = "https://api.openai.com/v1/audio/transcriptions";
const IMAGE_URL = "https://api.openai.com/v1/images/generations";
const FISH_MODELS = new Set(["s1", "s2-pro", "s2.1-pro", "s2.1-pro-free"]);

function loadProjectEnv(directory) {
  const file = path.resolve(directory, ".env");
  if (!fs.existsSync(file)) return;
  if (typeof process.loadEnvFile !== "function") throw new Error("Node >=22.20 is required to load a project .env file.");
  try { process.loadEnvFile(file); }
  catch { throw new Error("Cannot read project .env; check its syntax and permissions (values withheld)."); }
}
function object(value, label) {
  if (value == null) return {};
  if (typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value;
}
function nonEmpty(value) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function rejectCredentials(value, label = "configuration") {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const name = key.toLowerCase().replace(/[^a-z]/g, "");
    if (/^(auth|authentication|authorization|bearer|cookie|cookies|key|passwd)$/.test(name) || /(apikey|credential|credentials|password|privatekey|secret|token)$/.test(name)) {
      throw new Error(`${label} contains a credential-like field; use environment variables or the untracked project .env.`);
    }
    rejectCredentials(child, label);
  }
}
function envJson(name) {
  if (!process.env[name]) return {};
  try { return object(JSON.parse(process.env[name]), name); }
  catch { throw new Error(`${name} must contain a JSON object (values withheld).`); }
}
function endpoint(raw, canonical, flag) {
  let url;
  try { url = new URL(raw || canonical); } catch { throw new Error("API endpoint must be an absolute URL (value withheld)."); }
  if (url.username || url.password || url.search || url.hash) throw new Error("API endpoint cannot contain credentials, query parameters, or a fragment.");
  if (url.href === canonical) return canonical;
  const loopback = ["127.0.0.1", "localhost", "[::1]", "::1"].includes(url.hostname);
  if (process.env[flag] === "1" && loopback && ["http:", "https:"].includes(url.protocol)) return url.href;
  throw new Error(`Official API endpoint is pinned; ${flag}=1 allows only loopback mock URLs.`);
}
function validateFishModel(value) {
  const model = nonEmpty(value);
  if (!FISH_MODELS.has(model)) throw new Error("Unsupported Fish model; choose s1, s2-pro, s2.1-pro, or s2.1-pro-free. No automatic model fallback.");
  return model;
}
function validReference(value) {
  const valid = (entry) => nonEmpty(entry) && !/^(<|REPLACE_|YOUR_)/i.test(entry);
  return Boolean(valid(value) || (Array.isArray(value) && value.length > 0 && value.every(valid)));
}
function resolveFishConfig({ fish, speed } = {}) {
  const environment = envJson("FISH_TTS_CONFIG");
  const file = object(fish, "fish");
  rejectCredentials(environment, "FISH_TTS_CONFIG"); rejectCredentials(file, "fish");
  const transport = file.transport ?? environment.transport ?? process.env.FISH_TRANSPORT ?? "official-api";
  if (transport !== "official-api") throw new Error("This public package supports Fish official-api only; browser-cookie proxies are not included.");
  if (file.backend != null || environment.backend != null) throw new Error("Fish official-api uses model, not website backend.");
  const apiKey = nonEmpty(process.env.FISH_API_KEY);
  if (!apiKey) throw new Error("Set FISH_API_KEY in the environment or untracked project .env before TTS.");
  const referenceId = file.reference_id ?? file.referenceId ?? environment.reference_id ?? environment.referenceId ?? process.env.FISH_REFERENCE_ID;
  if (!validReference(referenceId)) throw new Error("Set FISH_REFERENCE_ID or fish.reference_id to a voice you may use; no personal voice is bundled.");
  const model = validateFishModel(file.model ?? environment.model ?? process.env.FISH_MODEL ?? "s2.1-pro-free");
  if (Array.isArray(referenceId) && referenceId.length > 1 && model === "s1") throw new Error("Multiple Fish reference IDs require an S2 model.");
  const request = { ...object(environment.request, "FISH_TTS_CONFIG.request"), ...object(file.request, "fish.request") };
  if (environment.request?.prosody || file.request?.prosody) request.prosody = { ...environment.request?.prosody, ...file.request?.prosody };
  if (speed != null && request.prosody?.speed == null) request.prosody = { ...request.prosody, speed: Number(speed) };
  for (const reserved of ["text", "reference_id", "references", "format", "backend"]) {
    if (reserved in request) throw new Error(`fish.request.${reserved} is adapter-owned.`);
  }
  const apiUrl = endpoint(file.apiUrl ?? file.api_url ?? environment.apiUrl ?? environment.api_url ?? process.env.FISH_API_URL, FISH_URL, "HYPERFRAMES_TEST_ALLOW_FISH_LOOPBACK");
  return { transport, apiUrl, apiKey, referenceId, model, request };
}
async function post(url, options, label, fetchImpl = globalThis.fetch) {
  let response;
  try { response = await fetchImpl(url, { ...options, method: "POST", redirect: "error", signal: AbortSignal.timeout(20 * 60 * 1000) }); }
  catch { throw new Error(`${label} network request failed or timed out; details withheld. POST was not retried. Check provider usage before rerunning.`); }
  if (!response.ok) {
    // Error bodies can echo prompts, keys, or provider diagnostics. Never print them.
    try { await response.body?.cancel(); } catch {}
    throw new Error(`${label} HTTP ${response.status}; response body withheld. POST was not retried. Check provider usage before rerunning.`);
  }
  return response;
}
function writeAtomic(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.part-${process.pid}-${Math.random().toString(16).slice(2)}`;
  try { fs.writeFileSync(temporary, bytes, { flag: "wx" }); fs.renameSync(temporary, file); }
  finally { fs.rmSync(temporary, { force: true }); }
}
async function synthesizeOne({ text, config, wavAbs, fetchImpl }) {
  if (!nonEmpty(text)) throw new Error("Fish narration text must be nonempty.");
  if (config.transport !== "official-api" || !nonEmpty(config.apiKey) || !validReference(config.referenceId)) throw new Error("Valid Fish official-api configuration is required.");
  const apiUrl = endpoint(config.apiUrl, FISH_URL, "HYPERFRAMES_TEST_ALLOW_FISH_LOOPBACK");
  const request = object(config.request, "Fish request"); rejectCredentials(request);
  const response = await post(apiUrl, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}`, model: validateFishModel(config.model) },
    body: JSON.stringify({ ...request, text, reference_id: config.referenceId, format: "wav" }),
  }, "Fish TTS", fetchImpl);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 44 || !["RIFF", "RF64"].includes(bytes.toString("ascii", 0, 4)) || bytes.toString("ascii", 8, 12) !== "WAVE") throw new Error("Fish returned invalid WAV bytes; output not saved and POST not retried.");
  writeAtomic(wavAbs, bytes);
  return { path: wavAbs };
}
function resolveTranscriptionConfig() {
  const model = process.env.OPENAI_TRANSCRIPTION_MODEL || "whisper-1";
  if (model !== "whisper-1") throw new Error("This adapter requires whisper-1 word timestamps; other transcription models are not drop-in replacements.");
  if (process.env.WHISPER_API) {
    let url; try { url = new URL(process.env.WHISPER_API); } catch { throw new Error("WHISPER_API must be an absolute URL (value withheld)."); }
    const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || (url.protocol !== "https:" && !(url.protocol === "http:" && loopback))) throw new Error("WHISPER_API requires HTTPS, or loopback HTTP, without URL credentials/query/fragment.");
    // Never forward the OpenAI account key to a user-provided host.
    return { apiUrl: url.href, apiKey: process.env.WHISPER_API_KEY || null, model, custom: true };
  }
  const apiKey = nonEmpty(process.env.OPENAI_API_KEY);
  if (!apiKey) throw new Error("Set OPENAI_API_KEY for word timestamps, or explicitly configure an OpenAI-compatible WHISPER_API endpoint.");
  return { apiKey, model, custom: false, apiUrl: endpoint(process.env.OPENAI_TRANSCRIBE_URL, TRANSCRIBE_URL, "HYPERFRAMES_TEST_ALLOW_OPENAI_LOOPBACK") };
}
function languageCode(value) {
  const code = String(value || "").trim().toLowerCase();
  return ({ chinese: "zh", english: "en", japanese: "ja", korean: "ko" })[code] || code;
}
async function transcribeAudio({ file, language, config = resolveTranscriptionConfig(), fetchImpl }) {
  if (!fs.existsSync(file)) throw new Error("Transcription input file does not exist.");
  if (fs.statSync(file).size > 25 * 1024 * 1024) throw new Error("Transcription input exceeds 25 MiB; split or compress it before upload.");
  const form = new FormData();
  form.set("model", config.model); form.set("response_format", "verbose_json"); form.append("timestamp_granularities[]", "word");
  if (languageCode(language)) form.set("language", languageCode(language));
  const mime = path.extname(file).toLowerCase() === ".mp3" ? "audio/mpeg" : "audio/wav";
  form.set("file", new Blob([fs.readFileSync(file)], { type: mime }), path.basename(file));
  const response = await post(config.apiUrl, { headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}, body: form }, "Transcription", fetchImpl);
  let result; try { result = await response.json(); } catch { throw new Error("Transcription returned invalid JSON (body withheld). POST was not retried."); }
  if (!Array.isArray(result.words) || !result.words.length || result.words.some(w => typeof (w.word ?? w.text) !== "string" || !Number.isFinite(w.start) || !Number.isFinite(w.end) || w.start < 0 || w.end < w.start)) throw new Error("Transcription did not return valid nonempty word timestamps; inspect/split the audio before deliberate retry.");
  return { text: typeof result.text === "string" ? result.text : "", words: result.words.map(w => ({ word: String(w.word ?? w.text), start: w.start, end: w.end })) };
}
function resolveImageConfig(model) {
  const apiKey = nonEmpty(process.env.OPENAI_API_KEY);
  if (!apiKey) throw new Error("Set OPENAI_API_KEY in the environment or untracked project .env before image generation.");
  model = nonEmpty(model ?? process.env.OPENAI_IMAGE_MODEL);
  if (!model || !/^gpt-image-[a-z0-9.-]+$/.test(model)) throw new Error("Choose a GPT Image model available to your account via OPENAI_IMAGE_MODEL or --model. No image model is selected automatically.");
  return { apiKey, model, apiUrl: endpoint(process.env.OPENAI_IMAGES_URL, IMAGE_URL, "HYPERFRAMES_TEST_ALLOW_OPENAI_LOOPBACK") };
}
async function generateImages({ prompt, config = resolveImageConfig(), size = "1024x1024", n = 1, fetchImpl }) {
  if (!nonEmpty(prompt)) throw new Error("Image prompt must be nonempty.");
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error("Image count must be an integer from 1 to 10.");
  if (!["auto", "1024x1024", "1536x1024", "1024x1536"].includes(size)) throw new Error("Use auto, 1024x1024, 1536x1024, or 1024x1536 for this GPT Image adapter.");
  const response = await post(config.apiUrl, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` }, body: JSON.stringify({ model: config.model, prompt, size, n, output_format: "png" }) }, "Image generation", fetchImpl);
  let result; try { result = await response.json(); } catch { throw new Error("Image generation returned invalid JSON (body withheld). POST was not retried."); }
  if (!Array.isArray(result.data) || result.data.length !== n) throw new Error("Image generation returned an unexpected image count; POST was not retried.");
  return result.data.map(entry => {
    if (typeof entry.b64_json !== "string") throw new Error("Expected GPT Image base64 output; no remote URL fallback is used.");
    const bytes = Buffer.from(entry.b64_json, "base64");
    if (!bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error("Image output was not PNG; no file was saved.");
    return bytes;
  });
}
module.exports = { loadProjectEnv, resolveFishConfig, validateFishModel, synthesizeOne, resolveTranscriptionConfig, transcribeAudio, resolveImageConfig, generateImages, writeAtomic, rejectCredentials };
