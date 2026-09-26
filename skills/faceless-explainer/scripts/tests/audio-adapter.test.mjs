import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ADAPTER = resolve(HERE, "..", "audio.mjs");

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "hf-faceless-audio-"));
  mkdirSync(join(root, "assets", "bgm"), { recursive: true });
  mkdirSync(join(root, "assets", "sfx"), { recursive: true });
  writeFileSync(join(root, "assets", "bgm", "reviewed.mp3"), "reviewed track");
  writeFileSync(join(root, "assets", "sfx", "whoosh.wav"), "reviewed sfx");
  writeFileSync(
    join(root, "assets", "sfx", "manifest.json"),
    JSON.stringify({ whoosh: { file: "whoosh.wav", duration: 0.4 } }),
  );
  writeFileSync(
    join(root, "STORYBOARD.md"),
    "---\nmessage: adapter test\nmusic: never auto-source this mood\n---\n\n## Frame 1 — Test\n- duration: 2s\n- sfx: whoosh\n",
  );
  writeFileSync(
    join(root, "SCRIPT.md"),
    "## Narration (Frame 1)\n\n    Fish is the only narration path.\n",
  );
  const stub = join(root, "engine-stub.mjs");
  writeFileSync(
    stub,
    `import {readFileSync,writeFileSync,existsSync} from "node:fs";
const argv=process.argv.slice(2); const flag=(n)=>argv[argv.indexOf("--"+n)+1];
const request=JSON.parse(readFileSync(flag("request"),"utf8"));
const out=flag("out"); const only=new Set(flag("only").split(","));
const meta=existsSync(out)?JSON.parse(readFileSync(out,"utf8")):{voices:[],bgm:null,sfx:[]};
if(only.has("tts")) meta.voices=request.lines.map((l)=>({id:l.id,path:"assets/voice/"+l.id+".wav",duration_s:1,words:[]}));
if(only.has("bgm")) meta.bgm=request.bgm?{path:"assets/bgm/reviewed.mp3",source:request.bgm.source,volume:request.bgm.volume,duration_s:8}:null;
if(only.has("sfx")) {
  meta.anomalies=[];
  meta.sfx=request.lines.flatMap((l)=>(l.sfx||[]).flatMap((name)=>name==="missing"?(meta.anomalies.push('sfx "missing" (id '+l.id+'): no local manifest entry — skipped'),[]):[{id:l.id,name,file:"assets/sfx/whoosh.wav",duration_s:.4,volume:.35}]));
}
writeFileSync(out,JSON.stringify(meta)); writeFileSync(out+".request.json",JSON.stringify(request));
`,
  );
  return { root, stub };
}

test("adapter emits Fish-only request with explicit local BGM and local-manifest SFX", () => {
  const { root, stub } = fixture();
  const env = { ...process.env, HF_MEDIA_ENGINE: stub };
  execFileSync(
    process.execPath,
    [
      ADAPTER,
      "--hyperframes",
      root,
      "--storyboard",
      join(root, "STORYBOARD.md"),
      "--script",
      join(root, "SCRIPT.md"),
      "--out",
      join(root, "audio_meta.json"),
      "--bgm",
      "assets/bgm/reviewed.mp3",
    ],
    { env, stdio: "pipe" },
  );

  const neutral = join(root, "audio_engine_meta.json");
  const generateRequest = JSON.parse(readFileSync(`${neutral}.request.json`, "utf8"));
  assert.equal(generateRequest.provider, undefined);
  assert.equal(generateRequest.voice, undefined);
  assert.deepEqual(generateRequest.lines, [
    { id: "01", text: "Fish is the only narration path." },
  ]);
  assert.equal(
    generateRequest.bgm.path,
    realpathSync(join(root, "assets", "bgm", "reviewed.mp3")),
  );
  assert.equal(generateRequest.bgm.source, "reviewed-local");

  execFileSync(
    process.execPath,
    [
      ADAPTER,
      "fetch-sfx",
      "--hyperframes",
      root,
      "--storyboard",
      join(root, "STORYBOARD.md"),
      "--audio-meta",
      join(root, "audio_meta.json"),
      "--sfx-manifest",
      "assets/sfx/manifest.json",
    ],
    { env, stdio: "pipe" },
  );
  const sfxRequest = JSON.parse(readFileSync(`${neutral}.request.json`, "utf8"));
  assert.equal(sfxRequest.provider, undefined);
  assert.equal(sfxRequest.bgm, null);
  assert.equal(
    sfxRequest.sfx_manifest,
    realpathSync(join(root, "assets", "sfx", "manifest.json")),
  );
  assert.deepEqual(sfxRequest.lines, [{ id: "01", sfx: ["whoosh"] }]);
});

test("adapter rejects BGM outside the project", () => {
  const { root, stub } = fixture();
  const outside = `${root}-outside-reviewed.mp3`;
  writeFileSync(outside, "outside");
  const run = spawnSync(
    process.execPath,
    [
      ADAPTER,
      "--hyperframes",
      root,
      "--storyboard",
      join(root, "STORYBOARD.md"),
      "--script",
      join(root, "SCRIPT.md"),
      "--bgm",
      outside,
    ],
    { env: { ...process.env, HF_MEDIA_ENGINE: stub }, encoding: "utf8" },
  );
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /must point inside the HyperFrames project/);
});

test("adapter rejects an in-project BGM symlink that resolves outside the project", () => {
  const { root, stub } = fixture();
  const outside = `${root}-outside-symlinked-bgm.mp3`;
  writeFileSync(outside, "outside");
  symlinkSync(outside, join(root, "assets", "bgm", "escape.mp3"));

  const run = spawnSync(
    process.execPath,
    [
      ADAPTER,
      "--hyperframes",
      root,
      "--storyboard",
      join(root, "STORYBOARD.md"),
      "--script",
      join(root, "SCRIPT.md"),
      "--bgm",
      "assets/bgm/escape.mp3",
    ],
    { env: { ...process.env, HF_MEDIA_ENGINE: stub }, encoding: "utf8" },
  );

  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /--bgm must point inside the HyperFrames project/);
  assert.match(run.stderr, /resolved path escapes the project/);
});

test("adapter rejects an in-project SFX manifest symlink that resolves outside the project", () => {
  const { root, stub } = fixture();
  const outside = `${root}-outside-sfx-manifest.json`;
  writeFileSync(outside, JSON.stringify({ whoosh: { file: "whoosh.wav" } }));
  symlinkSync(outside, join(root, "assets", "sfx", "escape-manifest.json"));

  const run = spawnSync(
    process.execPath,
    [
      ADAPTER,
      "fetch-sfx",
      "--hyperframes",
      root,
      "--storyboard",
      join(root, "STORYBOARD.md"),
      "--audio-meta",
      join(root, "audio_meta.json"),
      "--sfx-manifest",
      "assets/sfx/escape-manifest.json",
    ],
    { env: { ...process.env, HF_MEDIA_ENGINE: stub }, encoding: "utf8" },
  );

  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /--sfx-manifest must point inside the HyperFrames project/);
  assert.match(run.stderr, /resolved path escapes the project/);
});

test("storyboard music prose never triggers automatic BGM", () => {
  const { root, stub } = fixture();
  execFileSync(
    process.execPath,
    [
      ADAPTER,
      "--hyperframes",
      root,
      "--storyboard",
      join(root, "STORYBOARD.md"),
      "--script",
      join(root, "SCRIPT.md"),
    ],
    { env: { ...process.env, HF_MEDIA_ENGINE: stub }, stdio: "pipe" },
  );
  const request = JSON.parse(
    readFileSync(join(root, "audio_engine_meta.json.request.json"), "utf8"),
  );
  assert.equal(request.bgm, null);
  assert.equal(request.provider, undefined);
});

test("missing optional SFX remain nonfatal but preserve anomalies and report partial counts", () => {
  const { root, stub } = fixture();
  writeFileSync(
    join(root, "STORYBOARD.md"),
    "## Frame 1 — Test\n- duration: 2s\n- sfx: whoosh, missing\n",
  );
  writeFileSync(
    join(root, "assets", "sfx", "manifest.json"),
    JSON.stringify({ whoosh: { file: "whoosh.wav", duration: 0.4 } }),
  );

  const run = spawnSync(
    process.execPath,
    [
      ADAPTER,
      "fetch-sfx",
      "--hyperframes",
      root,
      "--storyboard",
      join(root, "STORYBOARD.md"),
      "--audio-meta",
      join(root, "audio_meta.json"),
      "--sfx-manifest",
      "assets/sfx/manifest.json",
    ],
    { env: { ...process.env, HF_MEDIA_ENGINE: stub }, encoding: "utf8" },
  );

  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stderr, /1\/2 requested SFX cue\(s\) resolved/);
  assert.match(run.stderr, /1 unresolved/);
  assert.match(run.stderr, /1 engine warning\(s\)/);
  assert.doesNotMatch(run.stdout, /✓ audio fetch-sfx/);

  const meta = JSON.parse(readFileSync(join(root, "audio_meta.json"), "utf8"));
  assert.equal(meta.sfx.length, 1);
  assert.deepEqual(meta.anomalies, [
    'sfx "missing" (id 01): no local manifest entry — skipped',
  ]);
});
