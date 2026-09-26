// Deterministic local SFX resolution for the shared audio engine.
//
// A cue either points at a local file or names an entry in an explicitly
// supplied/project-local manifest. Nothing in this module searches a network,
// generates audio, installs dependencies, or falls back to a provider.

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { basename, dirname, extname, isAbsolute, join, resolve } from "node:path";
import { ffprobeDuration } from "./tts.mjs";

const DEFAULT_VOLUME = 0.35;
const r3 = (value) => Number(value.toFixed(3));
const slug = (value) =>
  String(value || "effect")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "effect";

function localPath(value, base, fallbackBase = null) {
  if (typeof value !== "string" || !value.trim()) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return null;
  if (isAbsolute(value)) return resolve(value);
  const primary = resolve(base, value);
  if (existsSync(primary) || !fallbackBase) return primary;
  return resolve(fallbackBase, value);
}

function loadManifest(manifestPath) {
  if (!manifestPath || !existsSync(manifestPath)) return { records: [], error: null };
  try {
    const parsed = JSON.parse(readFileSync(manifestPath, "utf8"));
    const records = Array.isArray(parsed)
      ? parsed.map((entry, index) => ({ key: entry?.name ?? entry?.id ?? String(index), ...entry }))
      : Object.entries(parsed).map(([key, entry]) => ({ ...(entry || {}), key }));
    return { records, error: null };
  } catch (error) {
    return { records: [], error: `SFX manifest parse failed: ${error.message}` };
  }
}

function manifestLookup(records) {
  const keys = new Map();
  const exact = new Map();
  const aliases = new Map();

  // Install manifest keys first and keep them in their own map. A later slug
  // alias must never replace an exact key such as "soft-click".
  for (const record of records) {
    if (record.key != null) keys.set(String(record.key), record);
  }
  for (const record of records) {
    const file = record.path ?? record.file;
    if (typeof file !== "string" || !file.trim()) continue;
    for (const key of [record.name, record.id, basename(file), basename(file, extname(file))]) {
      if (!key) continue;
      if (!exact.has(String(key))) exact.set(String(key), record);
    }
    for (const key of [
      record.key,
      record.name,
      record.id,
      basename(file),
      basename(file, extname(file)),
    ]) {
      if (!key) continue;
      if (!aliases.has(slug(key))) aliases.set(slug(key), record);
    }
  }
  return { keys, exact, aliases };
}

function findManifestRecord(lookup, requestedName) {
  return (
    lookup.keys.get(requestedName) ??
    lookup.exact.get(requestedName) ??
    lookup.aliases.get(slug(requestedName)) ??
    null
  );
}

function cueRecord(raw) {
  if (typeof raw === "string") return { name: raw };
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return { ...raw };
  return null;
}

function numberOr(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// cues: [{ id, cue }] where cue is either a manifest name or
// {name, path|file, source?, offset_s?, duration_s?, volume?}.
export async function resolveSfx({ cues, hyperframesDir, manifestPath, requestDirectory = null }) {
  const sfx = [];
  const anomalies = [];
  const destinationDirectory = join(hyperframesDir, "assets", "sfx");
  const manifest = loadManifest(manifestPath);
  if (manifest.error) anomalies.push(manifest.error);
  const lookup = manifestLookup(manifest.records);
  const manifestDirectory = manifestPath ? dirname(manifestPath) : hyperframesDir;

  const frozenBySource = new Map();
  for (const input of cues) {
    const cue = cueRecord(input.cue);
    if (!cue) {
      anomalies.push(`sfx cue for id ${input.id}: expected a name or local-path object — skipped`);
      continue;
    }
    const requestedName = String(cue.name ?? cue.id ?? cue.path ?? cue.file ?? "effect").trim();
    let record = null;
    let sourcePath = localPath(cue.path ?? cue.file, hyperframesDir, requestDirectory);
    if (!sourcePath) {
      record = findManifestRecord(lookup, requestedName);
      if (record) sourcePath = localPath(record.path ?? record.file, manifestDirectory);
    }

    if (!sourcePath || !existsSync(sourcePath) || !statSync(sourcePath).isFile()) {
      const reason = cue.path || cue.file ? "local file does not exist" : "not found in local manifest";
      anomalies.push(`sfx "${requestedName}" (id ${input.id}): ${reason} — skipped`);
      continue;
    }

    const canonicalSource = realpathSync(sourcePath);
    let frozen = frozenBySource.get(canonicalSource);
    if (!frozen) {
      const probedDuration = ffprobeDuration(canonicalSource);
      if (!Number.isFinite(probedDuration) || probedDuration <= 0) {
        anomalies.push(
          `sfx "${requestedName}" (id ${input.id}): local file has no positive-duration audio stream — skipped`,
        );
        continue;
      }
      const extension = (extname(canonicalSource) || ".wav").toLowerCase();
      const sourceStem = basename(canonicalSource, extname(canonicalSource)).replace(
        /-[a-f0-9]{12}$/i,
        "",
      );
      const contentSuffix = createHash("sha256")
        .update(readFileSync(canonicalSource))
        .digest("hex")
        .slice(0, 12);
      frozen = {
        destinationRelative: `assets/sfx/${slug(sourceStem)}-${contentSuffix}${extension}`,
        probedDuration,
      };
      frozenBySource.set(canonicalSource, frozen);
    }
    const { destinationRelative, probedDuration } = frozen;
    const destination = join(hyperframesDir, destinationRelative);
    mkdirSync(destinationDirectory, { recursive: true });
    if (resolve(canonicalSource) !== resolve(destination)) copyFileSync(canonicalSource, destination);

    const declaredDuration = numberOr(cue.duration_s ?? record?.duration_s ?? record?.duration, NaN);
    const duration = Number.isFinite(declaredDuration) && declaredDuration > 0
      ? declaredDuration
      : probedDuration;
    const volume = Math.max(0, Math.min(1, numberOr(cue.volume ?? record?.volume, DEFAULT_VOLUME)));
    const offset = Math.max(0, numberOr(cue.offset_s ?? record?.offset_s, 0));
    sfx.push({
      id: String(input.id),
      name: requestedName,
      file: destinationRelative,
      source: String(cue.source ?? record?.source ?? "local"),
      offset_s: r3(offset),
      duration_s: r3(duration),
      volume: r3(volume),
    });
  }

  return { sfx, anomalies };
}
