import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const mediaDirectory = path.resolve(here, "..", "..", "..", "hyperframes-media");
const engine = path.join(mediaDirectory, "scripts", "audio.mjs");
const ttsModule = await import(pathToFileURL(path.join(mediaDirectory, "scripts", "lib", "tts.mjs")).href);

test("Fish REST is the sole TTS path and freezes returned WAV bytes", async () => {
  const root = temporaryRoot("hf-fish-engine-");
  const requests = [];
  const wav = minimalWav();
  const server = http.createServer((request, response) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      requests.push({ headers: request.headers, body: JSON.parse(Buffer.concat(chunks)) });
      response.writeHead(200, { "Content-Type": "audio/wav" });
      response.end(wav);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const original = snapshotEnv();
  try {
    const address = server.address();
    process.env.FISH_API_KEY = "test-only";
    process.env.FISH_API_URL = `http://127.0.0.1:${address.port}/v1/tts`;
    process.env.HYPERFRAMES_TEST_ALLOW_FISH_LOOPBACK = "1";
    delete process.env.FISH_TTS_CONFIG;
    delete process.env.FISH_REFERENCE_ID;
    delete process.env.FISH_MODEL;
    const config = ttsModule.resolveFishConfig({
      fish: {
        reference_id: "voice-one",
        model: "s2.1-pro-free",
        request: { normalize: true, prosody: { volume: 3 } },
      },
      speed: 1.05,
    });
    const output = path.join(root, "voice.wav");
    await ttsModule.synthesizeOne({ text: "Test narration.", config, wavAbs: output });

    assert.deepEqual(readFileSync(output), wav);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].headers.authorization, "Bearer test-only");
    assert.equal(requests[0].headers.model, "s2.1-pro-free");
    assert.deepEqual(requests[0].body, {
      normalize: true,
      prosody: { volume: 3, speed: 1.05 },
      text: "Test narration.",
      reference_id: "voice-one",
      format: "wav",
    });
  } finally {
    restoreEnv(original);
    await new Promise((resolve) => server.close(resolve));
    removeRoot(root);
  }
});

test("Fish configuration fails closed without a key and never chooses a fallback", () => {
  const original = snapshotEnv();
  try {
    delete process.env.FISH_API_KEY;
    delete process.env.FISH_TTS_CONFIG;
    assert.throws(
      () =>
        ttsModule.resolveFishConfig({
          fish: { reference_id: "voice-one", model: "s2.1-pro-free" },
        }),
      /FISH_API_KEY/,
    );
  } finally {
    restoreEnv(original);
  }
});

test("--only merges explicit local BGM and SFX without touching voice metadata", () => {
  const root = temporaryRoot("hf-local-audio-");
  try {
    write(root, "library/bed.mp3", minimalWav());
    write(root, "library/click.wav", minimalWav());
    write(root, "assets/voice/scene-1.wav", minimalWav());
    writeJson(root, "library/sfx.json", {
      click: { file: "click.wav", duration: 0.25, source: "reviewed-library" },
    });
    writeJson(root, "audio_request.json", {
      lines: [
        {
          id: "scene-1",
          text: "Preserved because TTS is not selected.",
          sfx: ["click", { name: "direct hit", path: "library/click.wav", duration_s: 0.2 }],
        },
      ],
      bgm: { path: "library/bed.mp3", source: "reviewed-library", volume: 0.2, duration_s: 12 },
      sfx_manifest: "library/sfx.json",
    });
    writeJson(root, "audio_meta.json", {
      tts_provider: "fish-audio",
      voice_id: "voice-one",
      fish_model: "s2.1-pro-free",
      voices: [{ id: "scene-1", path: "assets/voice/scene-1.wav", duration_s: 1, words: [] }],
      bgm: null,
      sfx: [],
      total_duration_s: 1,
    });

    const environment = { ...process.env };
    delete environment.FISH_API_KEY;
    environment.FISH_API_URL = "http://127.0.0.1:1/must-not-be-called";
    const result = spawnSync(
      process.execPath,
      [engine, "--hyperframes", root, "--request", path.join(root, "audio_request.json"), "--out", path.join(root, "audio_meta.json"), "--only", "bgm,sfx"],
      { encoding: "utf8", env: environment },
    );
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);

    const meta = json(root, "audio_meta.json");
    assert.equal(meta.tts_provider, "fish-audio");
    assert.equal(meta.voices.length, 1);
    assert.match(meta.bgm.path, /^assets\/bgm\/bed-[a-f0-9]{12}\.mp3$/);
    assert.deepEqual(
      { ...meta.bgm, path: "<content-hashed>" },
      {
        path: "<content-hashed>",
        source: "reviewed-library",
        volume: 0.2,
        mode: "local",
        duration_s: 12,
      },
    );
    assert.deepEqual(
      meta.sfx.map((cue) => [cue.name, cue.source, cue.duration_s]),
      [
        ["click", "reviewed-library", 0.25],
        ["direct hit", "local", 0.2],
      ],
    );
    assert.equal(existsSync(path.join(root, meta.bgm.path)), true);
    assert.equal(meta.sfx[0].file, meta.sfx[1].file);
    assert.match(meta.sfx[0].file, /^assets\/sfx\/click-[a-f0-9]{12}\.wav$/);
    assert.equal(existsSync(path.join(root, meta.sfx[0].file)), true);
    assert.equal("bgm_pending" in meta, false);
  } finally {
    removeRoot(root);
  }
});

test("missing or remote local assets are skipped with no search or generation fallback", () => {
  const root = temporaryRoot("hf-no-audio-fallback-");
  try {
    writeJson(root, "audio_request.json", {
      lines: [{ id: "scene-1", text: "No TTS pass.", sfx: ["missing effect"] }],
      bgm: { path: "https://example.invalid/track.mp3" },
    });
    const result = spawnSync(
      process.execPath,
      [engine, "--hyperframes", root, "--only", "bgm,sfx"],
      { encoding: "utf8", env: { ...process.env, FISH_API_URL: "http://127.0.0.1:1/never" } },
    );
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const meta = json(root, "audio_meta.json");
    assert.equal(meta.bgm, null);
    assert.deepEqual(meta.sfx, []);
    assert.match(meta.anomalies.join("\n"), /not a local file/);
    assert.match(meta.anomalies.join("\n"), /not found in local manifest/);
    assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /pending|download|retrieve|generate/i);
  } finally {
    removeRoot(root);
  }
});

function minimalWav() {
  const dataBytes = 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(8000, 24);
  buffer.writeUInt32LE(16000, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);
  return buffer;
}

function temporaryRoot(prefix) {
  return path.resolve(os.tmpdir(), path.basename(path.join(os.tmpdir(), prefix + Math.random().toString(16).slice(2))));
}

function write(root, relative, content) {
  const target = path.join(root, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function writeJson(root, relative, value) {
  write(root, relative, `${JSON.stringify(value, null, 2)}\n`);
}

function json(root, relative) {
  return JSON.parse(readFileSync(path.join(root, relative), "utf8"));
}

function snapshotEnv() {
  return Object.fromEntries(
    ["FISH_API_KEY", "FISH_API_URL", "FISH_TTS_CONFIG", "FISH_REFERENCE_ID", "FISH_MODEL"].map(
      (name) => [name, process.env[name]],
    ),
  );
}

function restoreEnv(snapshot) {
  for (const [name, value] of Object.entries(snapshot)) {
    if (value == null) delete process.env[name];
    else process.env[name] = value;
  }
}

function removeRoot(root) {
  assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())));
  rmSync(root, { recursive: true, force: true });
}
