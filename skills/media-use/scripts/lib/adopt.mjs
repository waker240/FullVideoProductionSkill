import { readdirSync, statSync, existsSync, realpathSync } from "node:fs";
import { join, extname, basename, relative } from "node:path";
import { readManifest, appendRecord, nextId } from "./manifest.mjs";
import { regenerateIndex } from "./index-gen.mjs";
import { probe } from "./probe.mjs";

const AUDIO_EXT = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac"]);
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);

const VOICE_PATH_TOKEN =
  /(^|[\/_. -])(?:voice(?:over)?s?|narrat(?:ion|or)s?|dialog(?:ue)?s?|speech(?:es)?|tts)(?:\d+)?(?=$|[\/_. -])/;

function inferType(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (AUDIO_EXT.has(ext)) {
    const lower = filePath.toLowerCase();
    if (VOICE_PATH_TOKEN.test(lower)) return null;
    if (lower.includes("/bgm/") || lower.includes("/music/") || lower.startsWith("bgm/"))
      return "bgm";
    if (lower.includes("/sfx/") || lower.includes("/sound") || lower.startsWith("sfx/"))
      return "sfx";
    return "bgm";
  }
  if (IMAGE_EXT.has(ext)) {
    if (ext === ".svg" || ext === ".ico") return "icon";
    return "image";
  }
  if (VIDEO_EXT.has(ext)) return "video";
  return null;
}

function walkDir(dir, base = "") {
  const files = [];
  if (!existsSync(dir)) return files;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...walkDir(join(dir, entry.name), rel));
    } else {
      files.push(rel);
    }
  }
  return files;
}

function isWithin(parent, child) {
  const rel = relative(parent, child);
  return (
    rel === "" ||
    (rel !== ".." && !rel.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`))
  );
}

function safeAssetsRoot(projectDir) {
  const assetsDir = join(projectDir, "assets");
  if (!existsSync(assetsDir)) return null;
  try {
    const realProject = realpathSync(projectDir);
    const realAssets = realpathSync(assetsDir);
    if (!statSync(realAssets).isDirectory() || !isWithin(realProject, realAssets)) return null;
    return { assetsDir, realAssets };
  } catch {
    return null;
  }
}

function safeAssetFiles(projectDir) {
  const root = safeAssetsRoot(projectDir);
  if (!root) return [];

  const files = [];
  for (const rel of walkDir(root.assetsDir)) {
    const fullPath = join(root.assetsDir, rel);
    try {
      const realFile = realpathSync(fullPath);
      if (!isWithin(root.realAssets, realFile) || !statSync(realFile).isFile()) continue;
      files.push({ rel, fullPath });
    } catch {
      // Broken links, permission failures, and races are not adoptable local files.
    }
  }
  return files;
}

export function scanExistingAssets(projectDir) {
  const found = [];
  for (const { rel, fullPath } of safeAssetFiles(projectDir)) {
    const type = inferType(rel);
    if (!type) continue;
    try {
      const stat = statSync(fullPath);
      const meta = probe(fullPath);
      found.push({
        relativePath: `assets/${rel}`,
        type,
        size: stat.size,
        name: basename(rel, extname(rel)),
        ...meta,
      });
    } catch {
      // A file that changes during the scan is ignored rather than partially registered.
    }
  }
  return found;
}

export function adoptExistingAssets(projectDir) {
  const existing = scanExistingAssets(projectDir);
  if (existing.length === 0) return [];

  const manifest = readManifest(projectDir);
  const knownPaths = new Set(manifest.map((r) => r.path));

  const adopted = [];
  for (const asset of existing) {
    if (knownPaths.has(asset.relativePath)) continue;

    const id = nextId(projectDir, asset.type);
    const record = {
      id,
      type: asset.type,
      path: asset.relativePath,
      source: "existing",
      description: asset.name.replace(/[-_]/g, " "),
      ...(asset.duration != null && { duration: asset.duration }),
      ...(asset.width != null && { width: asset.width }),
      ...(asset.height != null && { height: asset.height }),
      provenance: { origin: "local-file", local: true, adopted: true },
    };
    appendRecord(projectDir, record);
    adopted.push(record);
  }

  if (adopted.length > 0) regenerateIndex(projectDir);
  return adopted;
}

export function findExistingAsset(projectDir, intent, type) {
  const lower = intent.toLowerCase();
  for (const { rel } of safeAssetFiles(projectDir)) {
    const inferredType = inferType(rel);
    if (!inferredType || (type && inferredType !== type)) continue;
    const assetName = basename(rel, extname(rel));
    const name = assetName.toLowerCase().replace(/[-_]/g, " ");
    if (name.includes(lower) || lower.includes(name)) {
      return { relativePath: `assets/${rel}`, type: inferredType, name: assetName };
    }
  }
  return null;
}
