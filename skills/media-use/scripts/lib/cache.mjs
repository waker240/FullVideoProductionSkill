import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  copyFileSync,
  statSync,
  realpathSync,
} from "node:fs";
import { join, basename, resolve, relative } from "node:path";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { readManifest, appendRecord } from "./manifest.mjs";

const SCHEMA_PREFIX = "mu-v1-";
const KEY_HEX_CHARS = 16;
const COMPLETE_SENTINEL = ".hf-complete";

export function globalMediaDir(env = process.env) {
  return resolve(env.MEDIA_USE_GLOBAL_CACHE_DIR || join(homedir(), ".media"));
}

export function contentHash(filePath) {
  const bytes = readFileSync(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}

function cacheEntryDir(rootDir, sha) {
  return join(rootDir, SCHEMA_PREFIX + sha.slice(0, KEY_HEX_CHARS));
}

function isComplete(entryDir) {
  return existsSync(join(entryDir, COMPLETE_SENTINEL));
}

function markComplete(entryDir) {
  writeFileSync(join(entryDir, COMPLETE_SENTINEL), "", "utf8");
}

function readGlobalManifest() {
  try {
    return readManifest(globalMediaDir());
  } catch {
    return [];
  }
}

function isWithin(parent, child) {
  const rel = relative(parent, child);
  return (
    rel === "" ||
    (rel !== ".." && !rel.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`))
  );
}

export function isTrustedLocalRecord(record) {
  if (!isRecord(record)) return false;
  if (!["bgm", "sfx"].includes(record.type)) return true;

  const provenance = record.provenance;
  if (!isRecord(provenance)) return false;

  // Any named provider on an audio record must say local. This prevents a
  // malformed record from combining current local flags with remote provenance.
  if (provenance.provider != null && provenance.provider !== "local") return false;

  const current = provenance.local === true && provenance.origin === "local-file";
  const legacyAdoption = provenance.provider === "local" && provenance.adopted === true;
  return current || legacyAdoption;
}

function validateCacheHit(match) {
  try {
    if (!isRecord(match) || typeof match.sha !== "string") return null;
    if (!/^[0-9a-f]{64}$/i.test(match.sha) || !isTrustedLocalRecord(match)) return null;
    if (typeof match.cached_path !== "string" || match.cached_path.length === 0) return null;

    const root = globalMediaDir();
    const entryDir = cacheEntryDir(root, match.sha);
    if (!isComplete(entryDir) || !existsSync(match.cached_path)) return null;

    const realRoot = realpathSync(root);
    const expectedEntry = realpathSync(entryDir);
    const cachedFile = realpathSync(match.cached_path);
    if (!isWithin(realRoot, expectedEntry) || !isWithin(expectedEntry, cachedFile)) return null;

    const cachedStat = statSync(cachedFile);
    if (!cachedStat.isFile() || cachedStat.size === 0) return null;
    if (contentHash(cachedFile) !== match.sha) return null;
    return match;
  } catch {
    // Cache records are an index, not authority. Skip corrupt/racy entries and
    // let callers continue to a later valid record.
    return null;
  }
}

export function cacheGet(prompt, type) {
  for (const record of readGlobalManifest()) {
    if (!isRecord(record) || record.reusable !== true) continue;
    if (!isRecord(record.provenance) || record.provenance.prompt !== prompt) continue;
    if (type != null && record.type !== type) continue;
    const valid = validateCacheHit(record);
    if (valid) return valid;
  }
  return null;
}

export function cacheGetByEntity(entity, type) {
  if (typeof entity !== "string") return null;
  const lower = entity.toLowerCase();
  for (const record of readGlobalManifest()) {
    if (!isRecord(record) || record.reusable !== true) continue;
    if (typeof record.entity !== "string" || record.entity.toLowerCase() !== lower) continue;
    if (type != null && record.type !== type) continue;
    const valid = validateCacheHit(record);
    if (valid) return valid;
  }
  return null;
}

export function cachePut(filePath, record) {
  if (!isTrustedLocalRecord(record)) {
    throw new Error(
      `refusing to cache ${isRecord(record) && record.type ? record.type : "media"} without local-origin provenance`,
    );
  }
  const sha = contentHash(filePath);
  const dir = globalMediaDir();
  const entryDir = cacheEntryDir(dir, sha);
  mkdirSync(entryDir, { recursive: true });

  const dest = join(entryDir, basename(filePath));
  copyFileSync(filePath, dest);
  markComplete(entryDir);

  const globalRecord = {
    ...record,
    sha,
    reusable: true,
    cached_path: dest,
  };
  appendRecord(globalMediaDir(), globalRecord);
  return { sha, cached_path: dest };
}

export function importFromCache(cacheRecord, projectDir, localId, localPath) {
  const valid = validateCacheHit(cacheRecord);
  if (!valid) return null;

  const sha = valid.sha;
  const cachedFile = cacheRecord.cached_path;

  mkdirSync(join(projectDir, ".media"), { recursive: true });
  const fullDest = join(projectDir, localPath);
  mkdirSync(join(fullDest, ".."), { recursive: true });
  copyFileSync(cachedFile, fullDest);

  const projectRecord = {
    ...cacheRecord,
    id: localId,
    path: localPath,
    provenance: {
      ...cacheRecord.provenance,
      imported_from: sha,
    },
  };
  delete projectRecord.sha;
  delete projectRecord.reusable;
  delete projectRecord.cached_path;

  return projectRecord;
}

export function promote(projectDir, id) {
  const records = readManifest(projectDir);
  const record = records.find((r) => isRecord(r) && r.id === id);
  if (!record) throw new Error(`asset not found in project manifest: ${id}`);
  if (typeof record.path !== "string" || record.path.length === 0) {
    throw new Error(`asset record has no valid local path: ${id}`);
  }

  const filePath = join(projectDir, record.path);
  if (!existsSync(filePath)) throw new Error(`asset file not found: ${filePath}`);

  return cachePut(filePath, record);
}

function isRecord(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
