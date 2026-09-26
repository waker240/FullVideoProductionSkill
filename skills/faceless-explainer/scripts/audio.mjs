#!/usr/bin/env node
// audio.mjs — faceless-explainer audio ADAPTER. The Fish TTS / local BGM / local
// SFX implementation
// no longer lives here: it is the shared engine at
// ../../hyperframes-media/scripts/audio.mjs. This file only (a) maps the
// explainer model (SCRIPT.md frames + STORYBOARD.md sfx) into the
// engine's neutral audio_request.json, (b) converts the engine's id-keyed
// audio_meta back into the frame-keyed shape captions.mjs / assemble-index.mjs
// already consume, and (c) keeps the local `sync-durations` pass (it rewrites
// STORYBOARD.md, which is workflow-specific).
//
// Three modes (unchanged CLI surface):
//   (default) generate — engine --only tts,bgm. TTS is Fish-only. BGM is either
//        an explicit, reviewed project-local file supplied via --bgm or absent.
//        Runs in the background during Step 4.
//   sync-durations — write real voice durations into STORYBOARD.md (local).
//   fetch-sfx      — engine --only sfx, merged into the existing meta (Step 5,
//        after the frames' `sfx:` cues exist). Names resolve only through the
//        project's reviewed local SFX manifest.
//
//   node audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json [--bgm ./assets/bgm/reviewed.mp3]
//   node audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md
//   node audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseStoryboard } from "./lib/storyboard.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ENGINE = join(HERE, "..", "..", "hyperframes-media", "scripts", "audio.mjs");

const flag = (argv, name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
const pad2 = (n) => String(n).padStart(2, "0");

// SCRIPT.md → [{ frame, text }]. `## … (Frame N)` opens a line; `**key:**` rows
// are metadata; the indented block is the spoken text (the only TTS input).
function parseScript(md) {
  const out = [];
  let cur = null;
  const flush = () => {
    if (cur && cur.text.trim()) out.push({ frame: cur.frame, text: cur.text.trim() });
    cur = null;
  };
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^#{2,3}\s+.*?\(frame\s+(\d+)\)/i);
    if (h) {
      flush();
      cur = { frame: Number(h[1]), text: "" };
      continue;
    }
    if (!cur) continue;
    if (/^\s*\*\*/.test(line)) continue;
    const m = line.match(/^(?: {4,}|\t)(.+)$/);
    if (m) cur.text += (cur.text ? " " : "") + m[1].trim();
  }
  flush();
  return out;
}

// Path of the engine's neutral meta — a stable sidecar so `--only` merges
// (generate then fetch-sfx) accumulate, while audio_meta.json holds the workflow shape.
const neutralPath = (outPath) => join(dirname(outPath), "audio_engine_meta.json");
const isInside = (root, target) => {
  const rel = relative(root, target);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
};
const requireProjectFile = ({ root, target, label }, die) => {
  let realRoot;
  try {
    realRoot = realpathSync(root);
    if (!statSync(realRoot).isDirectory()) throw new Error("project root is not a directory");
  } catch (error) {
    die(`HyperFrames project root cannot be resolved as a directory: ${root} (${error.message})`);
  }

  let realTarget;
  try {
    realTarget = realpathSync(target);
  } catch {
    die(`${label} not found at ${target}`);
  }
  if (!statSync(realTarget).isFile()) {
    die(`${label} must resolve to a regular file (received ${target})`);
  }
  if (!isInside(realRoot, realTarget)) {
    die(
      `${label} must point inside the HyperFrames project; resolved path escapes the project` +
        ` (received ${target}, resolved ${realTarget})`,
    );
  }
  return realTarget;
};

// Run the shared engine. Returns nothing; dies on a non-zero exit.
function runEngine({ request, hyperframesDir, neutral, only, extra = [] }, die) {
  const reqPath = join(hyperframesDir, "audio_request.json");
  writeFileSync(reqPath, JSON.stringify(request, null, 2));
  const engine = process.env.HF_MEDIA_ENGINE || DEFAULT_ENGINE;
  if (!existsSync(engine)) die(`media audio engine not found at ${engine} (set $HF_MEDIA_ENGINE)`);
  const args = [
    engine,
    "--request",
    reqPath,
    "--hyperframes",
    hyperframesDir,
    "--out",
    neutral,
    "--only",
    only,
    ...extra,
  ];
  const r = spawnSync("node", args, { stdio: "inherit" });
  if (r.status !== 0) die(`media audio engine exited ${r.status}`);
}

// Engine neutral meta (id-keyed) → explainer meta (frame-keyed) consumed by
// captions.mjs / assemble-index.mjs. id is the zero-padded frame number.
function toExplainerMeta(neutral) {
  const voices = (neutral.voices ?? []).map((v) => ({
    frame: Number(v.id),
    path: v.path,
    duration_s: v.duration_s,
    words: (v.words ?? []).map((w) => ({ id: w.id, text: w.text, start: w.start, end: w.end })),
  }));
  const bgm = neutral.bgm
    ? {
        path: neutral.bgm.path,
        volume: neutral.bgm.volume,
        source: neutral.bgm.source ?? null,
        duration_s: neutral.bgm.duration_s ?? null,
      }
    : null;
  const sfx = (neutral.sfx ?? []).map((s) => ({
    frame: Number(s.id),
    file: s.file ?? s.path,
    offset_s: s.offset_s ?? 0,
    duration_s: s.duration_s ?? 1,
    volume: s.volume ?? 0.35,
  }));
  // Keep the engine's warnings in the workflow-facing sidecar. They are part
  // of the shared engine contract (and, for optional local SFX, intentionally
  // non-fatal), so dropping them here would turn a partial result into an
  // apparently clean one.
  const anomalies = Array.isArray(neutral.anomalies) ? [...neutral.anomalies] : [];
  return { bgm, voices, sfx, anomalies };
}

// ── generate (TTS + BGM) ────────────────────────────────────────────────────
function runGenerate(argv) {
  const die = (m) => {
    console.error(`✗ audio generate: ${m}`);
    process.exit(1);
  };
  const hyperframesDir = resolve(flag(argv, "hyperframes", "."));
  const storyboardPath = resolve(flag(argv, "storyboard", join(hyperframesDir, "STORYBOARD.md")));
  const scriptPath = resolve(flag(argv, "script", join(hyperframesDir, "SCRIPT.md")));
  const outPath = resolve(flag(argv, "out", join(hyperframesDir, "audio_meta.json")));
  const speed = Number(flag(argv, "speed", "1.0")) || 1.0;
  const bgmArg = flag(argv, "bgm", null);
  const bgmVolume = Number(flag(argv, "bgm-volume", "0.16"));

  if (!existsSync(storyboardPath)) die(`STORYBOARD.md not found at ${storyboardPath}`);

  const lines = existsSync(scriptPath)
    ? parseScript(readFileSync(scriptPath, "utf8")).map((l) => ({
        id: pad2(l.frame),
        text: l.text,
      }))
    : [];
  if (!lines.length) console.error("· no SCRIPT.md — narration disabled");

  let bgm = null;
  if (bgmArg) {
    const candidate = resolve(hyperframesDir, bgmArg);
    const bgmPath = requireProjectFile(
      { root: hyperframesDir, target: candidate, label: "--bgm" },
      die,
    );
    if (!Number.isFinite(bgmVolume) || bgmVolume < 0 || bgmVolume > 1) {
      die(`--bgm-volume must be between 0 and 1 (received ${bgmVolume})`);
    }
    bgm = { path: bgmPath, source: "reviewed-local", volume: bgmVolume };
  }

  const request = {
    speed,
    lines,
    bgm,
  };

  const neutral = neutralPath(outPath);
  runEngine({ request, hyperframesDir, neutral, only: "tts,bgm" }, die);

  const meta = toExplainerMeta(JSON.parse(readFileSync(neutral, "utf8")));
  writeFileSync(outPath, JSON.stringify(meta, null, 2));
  console.log(
    `✓ audio generate: ${meta.voices.length} voice + ${meta.bgm ? "1 bgm" : "no bgm"} → ${outPath}`,
  );
}

// ── fetch-sfx ────────────────────────────────────────────────────────────────
function runFetchSfx(argv) {
  const die = (m) => {
    console.error(`✗ audio fetch-sfx: ${m}`);
    process.exit(1);
  };
  const hyperframesDir = resolve(flag(argv, "hyperframes", "."));
  const storyboardPath = resolve(flag(argv, "storyboard", join(hyperframesDir, "STORYBOARD.md")));
  const outPath = resolve(flag(argv, "audio-meta", join(hyperframesDir, "audio_meta.json")));
  const sfxManifestPath = resolve(
    hyperframesDir,
    flag(argv, "sfx-manifest", "assets/sfx/manifest.json"),
  );

  if (!existsSync(storyboardPath)) die(`STORYBOARD.md not found at ${storyboardPath}`);
  if (!isInside(hyperframesDir, sfxManifestPath)) {
    die(`--sfx-manifest must point inside the HyperFrames project (received ${sfxManifestPath})`);
  }
  const manifest = parseStoryboard(readFileSync(storyboardPath, "utf8"));

  // Per-frame `sfx:` cues (comma-separated) → engine lines carrying only sfx.
  const lines = [];
  for (const f of manifest.frames) {
    const names = (f.extra?.sfx ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length && f.number != null) lines.push({ id: pad2(f.number), sfx: names });
  }

  const trustedSfxManifestPath = lines.length
    ? requireProjectFile(
        { root: hyperframesDir, target: sfxManifestPath, label: "--sfx-manifest" },
        die,
      )
    : null;

  const neutral = neutralPath(outPath);
  const request = {
    lines,
    bgm: null,
    ...(lines.length ? { sfx_manifest: trustedSfxManifestPath } : {}),
  };
  // --only sfx is a MERGE, not an overwrite: the engine reads the existing neutral
  // sidecar (audio_engine_meta.json) and recomputes only the sfx section, so the
  // voices/bgm written by the earlier generate (--only tts,bgm) pass are preserved.
  runEngine({
    request,
    hyperframesDir,
    neutral,
    only: "sfx",
    extra: lines.length ? ["--sfx-manifest", trustedSfxManifestPath] : [],
  }, die);

  const meta = toExplainerMeta(JSON.parse(readFileSync(neutral, "utf8")));
  writeFileSync(outPath, JSON.stringify(meta, null, 2));
  const requested = lines.reduce((count, line) => count + line.sfx.length, 0);
  const unresolved = Math.max(0, requested - meta.sfx.length);
  if (unresolved || meta.anomalies.length) {
    console.error(
      `⚠ audio fetch-sfx: ${meta.sfx.length}/${requested} requested SFX cue(s) resolved` +
        ` · ${unresolved} unresolved · ${meta.anomalies.length} engine warning(s) → ${outPath}`,
    );
    for (const anomaly of meta.anomalies) console.error(`  - ${anomaly}`);
  } else {
    console.log(
      `✓ audio fetch-sfx: ${meta.sfx.length}/${requested} requested SFX cue(s) resolved → ${outPath}`,
    );
  }
}

// ── sync-durations (local; rewrites STORYBOARD.md) ────────────────────────────
function runSyncDurations(argv) {
  const die = (m) => {
    console.error(`✗ audio sync-durations: ${m}`);
    process.exit(1);
  };
  const hyperframesDir = resolve(flag(argv, "hyperframes", "."));
  const audioMetaPath = resolve(flag(argv, "audio-meta", join(hyperframesDir, "audio_meta.json")));
  const storyboardPath = resolve(flag(argv, "storyboard", join(hyperframesDir, "STORYBOARD.md")));
  if (!existsSync(audioMetaPath)) die(`audio_meta.json not found at ${audioMetaPath}`);

  const meta = JSON.parse(readFileSync(audioMetaPath, "utf8"));
  const durByFrame = new Map();
  for (const v of meta.voices ?? []) {
    if (v.frame != null && v.duration_s) durByFrame.set(v.frame, v.duration_s);
  }

  // Read directly and handle ENOENT here, rather than an existsSync precheck —
  // the check→write pair (write-back below) is a TOCTOU race CodeQL flags.
  let storyboardRaw = "";
  try {
    storyboardRaw = readFileSync(storyboardPath, "utf8");
  } catch {
    die(`STORYBOARD.md not found at ${storyboardPath}`);
  }
  const lines = storyboardRaw.split(/\r?\n/);
  const FRAME_RE = /^#{2,3}\s+(?:frame|beat|scene)\b.*?(\d+)/i;
  let curFrame = null;
  let updated = 0;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(FRAME_RE);
    if (h) {
      curFrame = Number(h[1]);
      continue;
    }
    if (curFrame != null && durByFrame.has(curFrame)) {
      const m = lines[i].match(/^(\s*[-*]\s+duration\s*:\s*).*/i);
      if (m) {
        lines[i] = `${m[1]}${durByFrame.get(curFrame)}s`;
        durByFrame.delete(curFrame);
        updated++;
      }
    }
  }
  writeFileSync(storyboardPath, lines.join("\n"));
  const missing = [...durByFrame.keys()];
  console.log(
    `✓ audio sync-durations: ${updated} frame duration(s) updated` +
      (missing.length ? ` · no \`- duration:\` line for frame(s) ${missing.join(", ")}` : ""),
  );
}

// ── dispatch ──────────────────────────────────────────────────────────────────
const sub = process.argv[2];
if (sub === "sync-durations") runSyncDurations(process.argv.slice(3));
else if (sub === "fetch-sfx") runFetchSfx(process.argv.slice(3));
else runGenerate(process.argv.slice(2)); // default: generate
