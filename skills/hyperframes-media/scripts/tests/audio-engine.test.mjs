import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { resolveSfx } from "../lib/sfx.mjs";
import { resolveFishConfig, synthesizeOne } from "../lib/tts.mjs";

const AUDIO_SCRIPT = fileURLToPath(new URL("../audio.mjs", import.meta.url));
const TEST_LOOPBACK_FLAG = "HYPERFRAMES_TEST_ALLOW_FISH_LOOPBACK";
const FISH_ENV_KEYS = [
  "FISH_API_KEY",
  "FISH_API_URL",
  "FISH_MODEL",
  "FISH_TRANSPORT",
  "FISH_REFERENCE_ID",
  "FISH_TTS_CONFIG",
  TEST_LOOPBACK_FLAG,
];

async function withFishEnv(values, callback) {
  const before = new Map(FISH_ENV_KEYS.map((key) => [key, process.env[key]]));
  for (const key of FISH_ENV_KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(values)) {
    if (value != null) process.env[key] = String(value);
  }
  try {
    return await callback();
  } finally {
    for (const [key, value] of before) {
      if (value == null) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function tempDirectory(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

function writeExecutable(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  chmodSync(path, 0o755);
}

function wavBytes(seed = 0, durationSeconds = 0.08) {
  const sampleRate = 8_000;
  const sampleCount = Math.max(1, Math.round(sampleRate * durationSeconds));
  const dataSize = sampleCount * 2;
  const bytes = Buffer.alloc(44 + dataSize);
  bytes.write("RIFF", 0, "ascii");
  bytes.writeUInt32LE(36 + dataSize, 4);
  bytes.write("WAVE", 8, "ascii");
  bytes.write("fmt ", 12, "ascii");
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24);
  bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36, "ascii");
  bytes.writeUInt32LE(dataSize, 40);
  for (let index = 0; index < sampleCount; index++) {
    bytes.writeInt16LE(((index * (seed + 17)) % 4_000) - 2_000, 44 + index * 2);
  }
  return bytes;
}

function writeWav(path, seed = 0) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, wavBytes(seed));
}

const validFfprobeScript = (duration = 7.25) => `#!/bin/sh
printf '%s\\n' '{"streams":[{"index":0,"duration":"${duration}"}],"format":{"duration":"${duration}"}}'
`;

function runProcess(command, args, options) {
  return new Promise((resolve) => {
    const child = spawn(command, args, options);
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => resolve({ status: -1, stdout, stderr, error }));
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

test("SFX cues keep repeated events, share one source, and never collide across sources", async () => {
  const root = tempDirectory("hf-sfx-events-");
  try {
    const first = join(root, "library-a", "click.wav");
    const second = join(root, "library-b", "click.wav");
    mkdirSync(dirname(first), { recursive: true });
    mkdirSync(dirname(second), { recursive: true });
    writeWav(first, 1);
    writeWav(second, 2);

    const result = await resolveSfx({
      hyperframesDir: root,
      manifestPath: null,
      cues: [
        { id: "scene", cue: { name: "click", path: first, offset_s: 0.1, duration_s: 0.2 } },
        { id: "scene", cue: { name: "click", path: first, offset_s: 0.9, duration_s: 0.2 } },
        { id: "scene", cue: { name: "click", path: second, offset_s: 1.2, duration_s: 0.2 } },
        { id: "scene", cue: { name: "alternate", path: first, offset_s: 1.8, duration_s: 0.2 } },
      ],
    });

    assert.equal(result.sfx.length, 4);
    assert.deepEqual(result.sfx.map((cue) => cue.offset_s), [0.1, 0.9, 1.2, 1.8]);
    assert.equal(result.sfx[0].file, result.sfx[1].file);
    assert.equal(result.sfx[0].file, result.sfx[3].file);
    assert.notEqual(result.sfx[0].file, result.sfx[2].file);
    assert.match(result.sfx[0].file, /click-[a-f0-9]{12}\.wav$/);
    assert.deepEqual(readFileSync(join(root, result.sfx[0].file)), readFileSync(first));
    assert.deepEqual(readFileSync(join(root, result.sfx[2].file)), readFileSync(second));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("an exact SFX manifest key wins over a colliding slug alias", async () => {
  const root = tempDirectory("hf-sfx-manifest-");
  try {
    const manifestDirectory = join(root, "library");
    mkdirSync(manifestDirectory, { recursive: true });
    writeWav(join(manifestDirectory, "exact.wav"), 3);
    writeWav(join(manifestDirectory, "alias.wav"), 4);
    const manifestPath = join(manifestDirectory, "manifest.json");
    writeFileSync(
      manifestPath,
      JSON.stringify({
        "soft-click": { key: "misleading-entry-key", path: "exact.wav", duration_s: 1 },
        "soft click": { path: "alias.wav", duration_s: 2 },
      }),
    );

    const result = await resolveSfx({
      hyperframesDir: root,
      manifestPath,
      cues: [{ id: "scene", cue: "soft-click" }],
    });
    assert.equal(result.sfx.length, 1);
    assert.equal(result.sfx[0].duration_s, 1);
    assert.deepEqual(
      readFileSync(join(root, result.sfx[0].file)),
      readFileSync(join(manifestDirectory, "exact.wav")),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("relative SFX paths resolve project-first, then relative to an external request", () => {
  const root = tempDirectory("hf-sfx-request-base-");
  try {
    const project = join(root, "project");
    const requestDirectory = join(root, "requests", "episode");
    mkdirSync(join(project, "library"), { recursive: true });
    mkdirSync(join(requestDirectory, "library"), { recursive: true });

    writeWav(join(project, "library", "project-first.wav"), 5);
    writeWav(join(requestDirectory, "library", "project-first.wav"), 6);
    writeWav(join(requestDirectory, "library", "request-only.wav"), 7);
    const requestPath = join(requestDirectory, "audio_request.json");
    writeFileSync(
      requestPath,
      JSON.stringify({
        lines: [],
        sfx: [
          {
            id: "project",
            name: "project-first",
            path: "library/project-first.wav",
            duration_s: 0.2,
          },
          {
            id: "request",
            name: "request-only",
            path: "library/request-only.wav",
            duration_s: 0.3,
          },
        ],
      }),
    );

    const result = spawnSync(
      process.execPath,
      [
        AUDIO_SCRIPT,
        "--hyperframes",
        project,
        "--request",
        requestPath,
        "--only",
        "sfx",
      ],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const metadata = JSON.parse(readFileSync(join(project, "audio_meta.json"), "utf8"));
    assert.equal(metadata.sfx.length, 2);
    assert.deepEqual(
      readFileSync(join(project, metadata.sfx.find((cue) => cue.id === "project").file)),
      readFileSync(join(project, "library", "project-first.wav")),
    );
    assert.deepEqual(
      readFileSync(join(project, metadata.sfx.find((cue) => cue.id === "request").file)),
      readFileSync(join(requestDirectory, "library", "request-only.wav")),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("null and empty BGM durations are probed instead of becoming zero", () => {
  for (const declaredDuration of [null, " "]) {
    const root = tempDirectory("hf-bgm-duration-");
    try {
      const bin = join(root, "bin");
      writeExecutable(join(bin, "ffprobe"), validFfprobeScript(7.25));
      writeFileSync(join(root, "music.mp3"), wavBytes(0, 7.25));
      writeFileSync(
        join(root, "audio_request.json"),
        JSON.stringify({
          lines: [],
          bgm: { path: "music.mp3", duration_s: declaredDuration },
        }),
      );

      const result = spawnSync(
        process.execPath,
        [AUDIO_SCRIPT, "--hyperframes", root, "--only", "bgm"],
        {
          cwd: root,
          encoding: "utf8",
          env: { ...process.env },
        },
      );
      assert.equal(result.status, 0, result.stderr);
      const metadata = JSON.parse(readFileSync(join(root, "audio_meta.json"), "utf8"));
      assert.equal(metadata.bgm.duration_s, 7.25);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test("declared durations cannot make non-audio BGM or SFX valid", () => {
  const root = tempDirectory("hf-reject-non-audio-");
  try {
    const bin = join(root, "bin");
    writeExecutable(
      join(bin, "ffprobe"),
      "#!/bin/sh\nprintf '%s\\n' '{\"streams\":[],\"format\":{\"duration\":\"9\"}}'\n",
    );
    writeFileSync(join(root, "music.mp3"), "not audio");
    writeFileSync(join(root, "effect.wav"), "not audio either");
    writeFileSync(
      join(root, "audio_request.json"),
      JSON.stringify({
        lines: [],
        bgm: { path: "music.mp3", duration_s: 99 },
        sfx: [{ id: "scene", name: "effect", path: "effect.wav", duration_s: 99 }],
      }),
    );

    const result = spawnSync(
      process.execPath,
      [AUDIO_SCRIPT, "--hyperframes", root, "--only", "bgm,sfx"],
      {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env },
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const metadata = JSON.parse(readFileSync(join(root, "audio_meta.json"), "utf8"));
    assert.equal(metadata.bgm, null);
    assert.deepEqual(metadata.sfx, []);
    assert.match(metadata.anomalies_by_capability.bgm[0], /no positive-duration audio stream/);
    assert.match(metadata.anomalies_by_capability.sfx[0], /no positive-duration audio stream/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("BGM freezes by content hash so equal basenames cannot overwrite", () => {
  const root = tempDirectory("hf-bgm-hash-");
  try {
    const bin = join(root, "bin");
    writeExecutable(join(bin, "ffprobe"), validFfprobeScript(3));
    const first = join(root, "library-a", "underscore.mp3");
    const second = join(root, "library-b", "underscore.mp3");
    mkdirSync(dirname(first), { recursive: true });
    mkdirSync(dirname(second), { recursive: true });
    writeFileSync(first, wavBytes(1));
    writeFileSync(second, wavBytes(2));

    const paths = [];
    for (const source of [first, second]) {
      writeFileSync(
        join(root, "audio_request.json"),
        JSON.stringify({ lines: [], bgm: { path: source } }),
      );
      const result = spawnSync(
        process.execPath,
        [AUDIO_SCRIPT, "--hyperframes", root, "--only", "bgm"],
        {
          cwd: root,
          encoding: "utf8",
          env: { ...process.env },
        },
      );
      assert.equal(result.status, 0, result.stderr);
      paths.push(JSON.parse(readFileSync(join(root, "audio_meta.json"), "utf8")).bgm.path);
    }

    assert.notEqual(paths[0], paths[1]);
    assert.match(paths[0], /^assets\/bgm\/underscore-[a-f0-9]{12}\.mp3$/);
    assert.match(paths[1], /^assets\/bgm\/underscore-[a-f0-9]{12}\.mp3$/);
    assert.deepEqual(readFileSync(join(root, paths[0])), wavBytes(1));
    assert.deepEqual(readFileSync(join(root, paths[1])), wavBytes(2));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("partial merges reject non-Fish TTS and non-local preserved media", () => {
  const cases = [
    {
      name: "TTS",
      only: "sfx",
      metadata: {
        tts_provider: "legacy-provider",
        voice_id: "legacy-voice",
        voices: [],
        bgm: null,
        sfx: [],
      },
      error: /preserved TTS provider must be fish-audio/,
    },
    {
      name: "BGM",
      only: "sfx",
      metadata: {
        tts_provider: null,
        voices: [],
        bgm: {
          path: "assets/bgm/legacy.mp3",
          mode: "retrieve",
          duration_s: 1,
          volume: 0.2,
        },
        sfx: [],
      },
      error: /preserved BGM mode must be local/,
    },
    {
      name: "SFX",
      only: "bgm",
      metadata: {
        tts_provider: null,
        voices: [],
        bgm: null,
        sfx: [
          {
            id: "scene",
            name: "legacy",
            file: "https://example.com/legacy.wav",
            duration_s: 1,
            volume: 0.3,
            offset_s: 0,
          },
        ],
      },
      error: /preserved SFX cue 0 must use a project-relative local path/,
    },
    {
      name: "BGM stream",
      only: "sfx",
      files: [["assets/bgm/not-audio.wav", "declared duration is not enough"]],
      metadata: {
        tts_provider: null,
        voices: [],
        bgm: {
          path: "assets/bgm/not-audio.wav",
          mode: "local",
          duration_s: 5,
          volume: 0.2,
        },
        sfx: [],
      },
      error: /preserved BGM must contain a positive-duration audio stream/,
    },
    {
      name: "SFX stream",
      only: "bgm",
      files: [["assets/sfx/not-audio.wav", "declared duration is not enough"]],
      metadata: {
        tts_provider: null,
        voices: [],
        bgm: null,
        sfx: [
          {
            id: "scene",
            name: "invalid",
            file: "assets/sfx/not-audio.wav",
            duration_s: 5,
            volume: 0.3,
            offset_s: 0,
          },
        ],
      },
      error: /preserved SFX cue 0 must contain a positive-duration audio stream/,
    },
  ];

  for (const fixture of cases) {
    const root = tempDirectory(`hf-preserved-${fixture.name.toLowerCase()}-`);
    try {
      for (const [relativePath, contents] of fixture.files ?? []) {
        const absolute = join(root, relativePath);
        mkdirSync(dirname(absolute), { recursive: true });
        writeFileSync(absolute, contents);
      }
      writeFileSync(join(root, "audio_request.json"), JSON.stringify({ lines: [], bgm: null }));
      writeFileSync(join(root, "audio_meta.json"), JSON.stringify(fixture.metadata));
      const result = spawnSync(
        process.execPath,
        [AUDIO_SCRIPT, "--hyperframes", root, "--only", fixture.only],
        { cwd: root, encoding: "utf8" },
      );
      assert.notEqual(result.status, 0, `${fixture.name} metadata should fail closed`);
      assert.match(result.stderr, fixture.error);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test("partial merges preserve unselected anomaly groups and replace the selected group", () => {
  const root = tempDirectory("hf-merge-anomalies-");
  try {
    const voicePath = join(root, "assets", "voice", "01.wav");
    const bgmPath = join(root, "assets", "bgm", "underscore.wav");
    writeWav(voicePath, 10);
    writeWav(bgmPath, 11);
    const prior = {
      tts_provider: "fish-audio",
      voice_id: "voice-id",
      fish_model: "s2.1-pro",
      voices: [{ id: "01", path: "assets/voice/01.wav", duration_s: 0.08, words: [] }],
      bgm: {
        path: "assets/bgm/underscore.wav",
        source: "local",
        mode: "local",
        duration_s: 0.08,
        volume: 0.2,
      },
      sfx: [],
      anomalies: ["line 01: prior transcript warning", "bgm: prior warning", "sfx: stale"],
      anomalies_by_capability: {
        tts: ["line 01: prior transcript warning"],
        bgm: ["bgm: prior warning"],
        sfx: ["sfx: stale"],
        other: ["legacy general warning"],
      },
    };
    writeFileSync(join(root, "audio_meta.json"), JSON.stringify(prior));
    writeFileSync(
      join(root, "audio_request.json"),
      JSON.stringify({ lines: [{ id: "01", sfx: ["missing"] }] }),
    );

    const result = spawnSync(
      process.execPath,
      [AUDIO_SCRIPT, "--hyperframes", root, "--only", "sfx"],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const metadata = JSON.parse(readFileSync(join(root, "audio_meta.json"), "utf8"));
    assert.deepEqual(metadata.anomalies_by_capability.tts, [
      "line 01: prior transcript warning",
    ]);
    assert.deepEqual(metadata.anomalies_by_capability.bgm, ["bgm: prior warning"]);
    assert.equal(metadata.anomalies_by_capability.sfx.length, 1);
    assert.match(metadata.anomalies_by_capability.sfx[0], /not found in local manifest/);
    assert.deepEqual(metadata.anomalies_by_capability.other, ["legacy general warning"]);
    assert.doesNotMatch(metadata.anomalies.join("\n"), /sfx: stale/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("duplicate TTS ids fail before the first Fish request", async () => {
  const root = tempDirectory("hf-duplicate-tts-");
  let requests = 0;
  const server = createServer((_request, response) => {
    requests += 1;
    response.writeHead(500);
    response.end("unexpected request");
  });
  try {
    writeFileSync(
      join(root, "audio_request.json"),
      JSON.stringify({
        fish: { reference_id: "voice-id", model: "s2.1-pro-free" },
        lines: [
          { id: "same", text: "First paid line." },
          { id: "same", text: "Duplicate line." },
        ],
      }),
    );
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const result = await runProcess(
      process.execPath,
      [AUDIO_SCRIPT, "--hyperframes", root, "--only", "tts"],
      {
        cwd: root,
        env: {
          ...process.env,
          FISH_API_KEY: "test-key",
          FISH_API_URL: `http://127.0.0.1:${address.port}/v1/tts`,
          FISH_TTS_CONFIG: "{}",
          [TEST_LOOPBACK_FLAG]: "1",
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /duplicate TTS line id "same"/);
    assert.equal(requests, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    rmSync(root, { recursive: true, force: true });
  }
});

test("shared engine preflights transcription before Fish and then writes real word timing from loopback", async () => {
  const root=tempDirectory("hf-public-engine-");
  const requests=[];
  const server=createServer(async(request,response)=>{
    const chunks=[];for await(const chunk of request)chunks.push(chunk);
    requests.push({url:request.url,headers:request.headers,body:Buffer.concat(chunks).toString()});
    if(request.url==="/tts"){response.setHeader("Content-Type","audio/wav");response.end(wavBytes(1,0.2));}
    else {response.setHeader("Content-Type","application/json");response.end(JSON.stringify({text:"sample",words:[{word:"sample",start:0,end:0.2}]}));}
  });
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  try {
    writeFileSync(join(root,"audio_request.json"),JSON.stringify({lang:"en",lines:[{id:"s0",text:"sample"}]}));
    const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>!/^(FISH_|OPENAI_|WHISPER_|HYPERFRAMES_TEST_)/.test(key)));
    Object.assign(env,{FISH_API_KEY:"TEST_FISH_CREDENTIAL",FISH_REFERENCE_ID:"test-voice",FISH_API_URL:`http://127.0.0.1:${server.address().port}/tts`,HYPERFRAMES_TEST_ALLOW_FISH_LOOPBACK:"1"});
    let result=await runProcess(process.execPath,[AUDIO_SCRIPT,"--hyperframes",root,"--only","tts"],{cwd:root,env,stdio:["ignore","pipe","pipe"]});
    assert.notEqual(result.status,0);assert.match(result.stderr,/OPENAI_API_KEY/);assert.equal(requests.length,0);
    Object.assign(env,{OPENAI_API_KEY:"TEST_OPENAI_CREDENTIAL",OPENAI_TRANSCRIBE_URL:`http://127.0.0.1:${server.address().port}/transcribe`,HYPERFRAMES_TEST_ALLOW_OPENAI_LOOPBACK:"1"});
    result=await runProcess(process.execPath,[AUDIO_SCRIPT,"--hyperframes",root,"--only","tts"],{cwd:root,env,stdio:["ignore","pipe","pipe"]});
    assert.equal(result.status,0,result.stderr);assert.deepEqual(requests.map(r=>r.url),["/tts","/transcribe"]);
    const raw=readFileSync(join(root,"audio_meta.json"),"utf8");const metadata=JSON.parse(raw);
    assert.equal(metadata.fish_transport,"official-api");assert.deepEqual(metadata.voices[0].words,[{id:"w0",text:"sample",start:0,end:0.2}]);assert.doesNotMatch(raw,/TEST_FISH_CREDENTIAL|TEST_OPENAI_CREDENTIAL/);
  } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));rmSync(root,{recursive:true,force:true});}
});

