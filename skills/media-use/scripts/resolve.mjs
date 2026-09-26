#!/usr/bin/env node

import {
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
  statSync,
  unlinkSync,
} from "node:fs";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { parseArgs } from "node:util";
import {
  appendRecord,
  nextId,
  readManifest,
  typeSubdir,
} from "./lib/manifest.mjs";
import { regenerateIndex } from "./lib/index-gen.mjs";
import {
  cacheGet,
  cacheGetByEntity,
  contentHash,
  importFromCache,
  isTrustedLocalRecord,
} from "./lib/cache.mjs";
import { freezeLocalFile } from "./lib/freeze.mjs";
import { findExistingAsset } from "./lib/adopt.mjs";
import { findLocalBrandAsset } from "./lib/brand-local.mjs";
import { probe } from "./lib/probe.mjs";

export const RESOLVABLE_TYPES = Object.freeze(["bgm", "sfx", "image", "icon", "brand"]);

const { values: args } = parseArgs({
  options: {
    type: { type: "string", short: "t" },
    intent: { type: "string", short: "i" },
    entity: { type: "string", short: "e" },
    source: { type: "string" },
    "source-page": { type: "string" },
    license: { type: "string" },
    "license-url": { type: "string" },
    attribution: { type: "string" },
    reviewed: { type: "boolean", default: false },
    "expected-sha256": { type: "string" },
    creator: { type: "string" },
    "source-id": { type: "string" },
    "catalog-id": { type: "string" },
    "review-note": { type: "string" },
    project: { type: "string", short: "p", default: "." },
    adopt: { type: "boolean", default: false },
    json: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  strict: true,
});

if (args.help) {
  console.log(`media-use resolve — register or reuse reviewed local media

Usage:
  node resolve.mjs --type <type> --intent "<description-or-id>" [--project <dir>]
  node resolve.mjs --type <type> --intent "<description>" --source <local-file> [--project <dir>]

Types: ${RESOLVABLE_TYPES.join(", ")}

Options:
  --type, -t      Media type (required)
  --intent, -i    Description, manifest id, or manifest path (required)
  --entity, -e    Entity name for exact local matching (optional)
  --source        Reviewed local file to freeze and register
  --source-page   Source-page URL retained as audit metadata
  --license       License name or identifier retained as audit metadata
  --license-url   License URL retained as audit metadata
  --attribution   Required attribution text retained as audit metadata
  --reviewed      Record that this source was explicitly reviewed before ingestion
  --expected-sha256
                  Refuse ingestion unless the local source has this SHA-256
  --creator       Creator retained as audit metadata
  --source-id     Source provider's asset identifier retained as audit metadata
  --catalog-id    Local review-catalog identifier retained as audit metadata
  --review-note   Human review note retained as audit metadata
  --project, -p   Project directory (default: .)
  --adopt         Register supported files already under assets/
  --json          Output JSON instead of one-line result
  --help, -h      Show this help`);
  process.exit(0);
}

validateCatalogIngestion();

if (args.adopt) {
  try {
    const { adoptExistingAssets } = await import("./lib/adopt.mjs");
    const projectDir = resolve(args.project);
    preflightProjectWrites(projectDir, [
      { path: join(projectDir, ".media", "audio", "bgm"), kind: "directory" },
      { path: join(projectDir, ".media", "audio", "sfx"), kind: "directory" },
      { path: join(projectDir, ".media", "images"), kind: "directory" },
      { path: join(projectDir, ".media", "video"), kind: "directory" },
    ]);
    const adopted = adoptExistingAssets(projectDir);
    if (args.json) {
      console.log(JSON.stringify({ ok: true, adopted: adopted.length, assets: adopted }));
    } else if (adopted.length === 0) {
      console.log("no new assets to adopt (assets/ empty, unsupported, or already registered)");
    } else {
      console.log(`adopted ${adopted.length} asset${adopted.length === 1 ? "" : "s"} from assets/`);
      for (const record of adopted) {
        console.log(`  ${record.id} → ${record.path} (${record.type})`);
      }
    }
  } catch (error) {
    reportRuntimeError(error);
  }
  process.exit(0);
}

if (!args.type || !args.intent) {
  console.error("error: --type and --intent are required");
  process.exit(2);
}

if (!RESOLVABLE_TYPES.includes(args.type)) {
  console.error(
    `error: unsupported media type "${args.type}"; expected one of: ${RESOLVABLE_TYPES.join(", ")}`,
  );
  process.exit(2);
}

if (args["expected-sha256"] && !args.source) {
  console.error("error: --expected-sha256 requires --source");
  process.exit(2);
}

if (args["expected-sha256"] && !/^[0-9a-f]{64}$/i.test(args["expected-sha256"])) {
  console.error("error: --expected-sha256 must be exactly 64 hexadecimal characters");
  process.exit(2);
}

const projectDir = resolve(args.project);
const type = args.type;
const intent = args.intent;
const entity = args.entity || null;

function validateCatalogIngestion() {
  if (args["catalog-id"] == null) return;

  const required = [
    ["--catalog-id", args["catalog-id"]],
    ["--source", args.source],
    ["--expected-sha256", args["expected-sha256"]],
    ["--source-id", args["source-id"]],
    ["--source-page", args["source-page"]],
    ["--license", args.license],
    ["--license-url", args["license-url"]],
    ["--review-note", args["review-note"]],
  ];
  const missing = required
    .filter(([, value]) => typeof value !== "string" || value.trim() === "")
    .map(([flag]) => flag);
  if (!args.reviewed) missing.push("--reviewed");

  if (missing.length > 0) {
    console.error(
      `error: --catalog-id ingestion requires ${missing.join(", ")}`,
    );
    process.exit(2);
  }

  if (!isSubstantiveReviewNote(args["review-note"])) {
    console.error(
      "error: --catalog-id ingestion requires a substantive --review-note describing the completed editorial review; placeholders are not accepted",
    );
    process.exit(2);
  }
}

function isSubstantiveReviewNote(value) {
  const note = typeof value === "string" ? value.trim() : "";
  const words =
    note.match(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]|[\p{L}\p{N}]+/gu,
    ) || [];
  if (Array.from(note).length < 12 || words.length < 3) return false;
  return !(
    /[<>]/.test(note) ||
    /\b(?:todo|tbd|placeholder|pending|replace[ -]?me|lorem ipsum)\b/i.test(note) ||
    /describe\s+(?:the\s+)?completed\s+editorial\s+review/i.test(note) ||
    /(?:待办|占位|稍后填写|待补充|请描述.*(?:审核|审阅|试听))/u.test(note)
  );
}

async function run() {
  // An explicit local file is an intentional ingestion operation, not discovery.
  if (args.source) {
    const sourcePath = resolve(args.source);
    validateReviewLibrarySource(sourcePath, projectDir, type);
    return ingestLocalFile(sourcePath, {
      type,
      intent,
      entity,
      projectDir,
      source: "local-source",
      provenance: {
        local: true,
        ingestion: "explicit-source",
        ...rightsProvenance(),
      },
    });
  }

  // 1. Existing project ledger: id, path, exact prompt, then optional entity.
  const projectHit = findProjectHit(projectDir, intent, type);
  if (projectHit) return result(projectHit, "cached");

  if (entity) {
    const lowerEntity = entity.toLowerCase();
    const entityHit = readManifest(projectDir).find((record) => {
      if (!isRecord(record) || record.type !== type || typeof record.entity !== "string") {
        return false;
      }
      return (
        record.entity.toLowerCase() === lowerEntity &&
        isTrustedLocalRecord(record) &&
        projectFilePath(projectDir, record.path) != null
      );
    });
    if (entityHit) return result(entityHit, "cached");
  }

  // 2. Unregistered project asset.
  const existingAsset = findExistingAsset(projectDir, intent, type);
  if (existingAsset) {
    const metadata = probe(join(projectDir, existingAsset.relativePath));
    preflightProjectWrites(projectDir, [
      {
        path: join(projectDir, ".media", typeSubdir(existingAsset.type)),
        kind: "directory",
      },
    ]);
    const record = {
      id: nextId(projectDir, type),
      type: existingAsset.type,
      path: existingAsset.relativePath,
      source: "existing",
      description: existingAsset.name.replace(/[-_]/g, " "),
      ...presentMetadata(metadata),
      ...(entity && { entity }),
      provenance: {
        origin: "local-file",
        local: true,
        adopted: true,
        prompt: intent,
        ...rightsProvenance(),
      },
    };
    appendRecord(projectDir, record);
    regenerateIndex(projectDir);
    return result(record, "existing");
  }

  // A design spec is the only special-case local brand source.
  if (type === "brand") {
    const brandAsset = findLocalBrandAsset(projectDir);
    if (brandAsset) {
      return ingestLocalFile(brandAsset.path, {
        type,
        intent,
        entity,
        projectDir,
        source: "local-brand",
        description: `Brand tokens from ${brandAsset.name}`,
        extension: ".md",
        provenance: {
          local: true,
          ingestion: "design-spec",
          source_file: brandAsset.name,
          ...brandAsset.metadata,
        },
      });
    }
  }

  // 3. Trusted frozen cache. Audio records fail closed on local provenance.
  const cacheHit = cacheGet(intent, type);
  if (cacheHit) {
    const imported = importCacheHit(cacheHit);
    if (imported) return result(imported, "reused");
  }

  if (entity) {
    const entityCacheHit = cacheGetByEntity(entity, type);
    if (entityCacheHit) {
      const imported = importCacheHit(entityCacheHit);
      if (imported) return result(imported, "reused");
    }
  }

  const message =
    `no reviewed local ${type} matched "${intent}"; ` +
    `stage one under ${join(projectDir, "assets")} or retry with --source <local-file>`;
  if (args.json) console.log(JSON.stringify({ ok: false, error: message }));
  else console.error(`error: ${message}`);
  process.exit(1);
}

function findProjectHit(dir, requested, requestedType) {
  const requestedAbsolute = isAbsolute(requested) ? resolve(requested) : resolve(dir, requested);
  const records = readManifest(dir);

  // Resolve each key class separately so manifest order can never let a prompt
  // shadow a more explicit id or path request.
  const matchers = [
    (record) => typeof record.id === "string" && record.id === requested,
    (record) =>
      typeof record.path === "string" &&
      (record.path === requested || resolve(dir, record.path) === requestedAbsolute),
    (record) =>
      isRecord(record.provenance) && record.provenance.prompt === requested,
  ];

  for (const matches of matchers) {
    for (const record of records) {
      if (!isRecord(record) || record.type !== requestedType || !matches(record)) continue;
      if (!isTrustedLocalRecord(record)) continue;
      if (projectFilePath(dir, record.path) != null) return record;
    }
  }
  return null;
}

function projectFilePath(dir, recordedPath) {
  if (typeof recordedPath !== "string" || recordedPath.length === 0) return null;
  try {
    const projectRoot = resolve(dir);
    const candidate = resolve(projectRoot, recordedPath);
    const lexicalRelative = relative(projectRoot, candidate);
    if (
      lexicalRelative === ".." ||
      lexicalRelative.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
      !existsSync(candidate)
    ) {
      return null;
    }

    const realRoot = realpathSync(projectRoot);
    const realCandidate = realpathSync(candidate);
    const physicalRelative = relative(realRoot, realCandidate);
    if (
      physicalRelative === ".." ||
      physicalRelative.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
      !statSync(realCandidate).isFile()
    ) {
      return null;
    }
    return realCandidate;
  } catch {
    return null;
  }
}

function importCacheHit(cacheRecord) {
  preflightProjectWrites(projectDir, [
    { path: join(projectDir, ".media", typeSubdir(type)), kind: "directory" },
  ]);
  const id = nextId(projectDir, type);
  const ext = extname(cacheRecord.cached_path || "") || defaultExt(type);
  const localPath = `.media/${typeSubdir(type)}/${id}${ext}`;
  const fullPath = join(projectDir, localPath);
  const boundary = preflightProjectWrites(projectDir, [
    { path: fullPath, kind: "file" },
  ]);
  const imported = importFromCache(cacheRecord, projectDir, id, localPath);
  if (!imported) return null;
  assertSafeProjectPath(boundary, fullPath, "file", { mustExist: true });
  appendRecord(projectDir, imported);
  regenerateIndex(projectDir);
  return imported;
}

function ingestLocalFile(
  sourcePath,
  {
    type: ingestType,
    intent: ingestIntent,
    entity: ingestEntity,
    projectDir: ingestProjectDir,
    source,
    description = ingestIntent,
    extension,
    provenance = {},
  },
) {
  if (!existsSync(sourcePath) || !statSync(sourcePath).isFile()) {
    throw new Error(`local source is not a regular file: ${sourcePath}`);
  }

  if (args["expected-sha256"]) {
    const expected = args["expected-sha256"].toLowerCase();
    const actual = contentHash(sourcePath).toLowerCase();
    if (actual !== expected) {
      throw new Error(
        `local source SHA-256 mismatch: expected ${expected}, received ${actual}`,
      );
    }
  }

  preflightProjectWrites(ingestProjectDir, [
    { path: join(ingestProjectDir, ".media", typeSubdir(ingestType)), kind: "directory" },
  ]);
  const id = nextId(ingestProjectDir, ingestType);
  const ext = extension || extname(sourcePath) || defaultExt(ingestType);
  const localPath = `.media/${typeSubdir(ingestType)}/${id}${ext}`;
  const fullPath = join(ingestProjectDir, localPath);
  const boundary = preflightProjectWrites(ingestProjectDir, [
    { path: fullPath, kind: "file" },
  ]);
  freezeLocalFile(sourcePath, fullPath);
  assertSafeProjectPath(boundary, fullPath, "file", { mustExist: true });

  if (args["expected-sha256"]) {
    const expected = args["expected-sha256"].toLowerCase();
    const frozenActual = contentHash(fullPath).toLowerCase();
    if (frozenActual !== expected) {
      unlinkProjectFileSafely(boundary, fullPath);
      throw new Error(
        `frozen destination SHA-256 mismatch: expected ${expected}, received ${frozenActual}`,
      );
    }
  }

  const metadata = probe(fullPath);
  const record = {
    id,
    type: ingestType,
    path: localPath,
    source,
    description,
    ...presentMetadata(metadata),
    ...(ingestEntity && { entity: ingestEntity }),
    provenance: {
      origin: "local-file",
      local: true,
      prompt: ingestIntent,
      source_path: localSourceLabel(ingestProjectDir, sourcePath),
      ...provenance,
    },
  };

  appendRecord(ingestProjectDir, record);
  regenerateIndex(ingestProjectDir);
  return result(record, source);
}

function localSourceLabel(dir, sourcePath) {
  const rel = relative(dir, sourcePath);
  if (rel && rel !== ".." && !rel.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`)) {
    return rel;
  }
  return basename(sourcePath);
}

function presentMetadata(metadata) {
  return {
    ...(metadata.duration != null && { duration: metadata.duration }),
    ...(metadata.width != null && { width: metadata.width }),
    ...(metadata.height != null && { height: metadata.height }),
    ...(metadata.codec != null && { codec: metadata.codec }),
  };
}

function rightsProvenance() {
  return {
    ...(args["source-page"] && { source_page: args["source-page"] }),
    ...(args.license && { license: args.license }),
    ...(args["license-url"] && { license_url: args["license-url"] }),
    ...(args.attribution && { attribution: args.attribution }),
    ...(args.reviewed && { reviewed: true }),
    ...(args["expected-sha256"] && {
      expected_sha256: args["expected-sha256"].toLowerCase(),
    }),
    ...(args.creator && { creator: args.creator }),
    ...(args["source-id"] && { source_id: args["source-id"] }),
    ...(args["catalog-id"] && { catalog_id: args["catalog-id"] }),
    ...(args["review-note"] && { review_note: args["review-note"] }),
  };
}

function result(record, source) {
  if (args.json) {
    console.log(JSON.stringify({ ok: true, ...record, _source: source }));
  } else {
    console.log(`resolved ${record.id} → ${record.path} (${formatMeta(record, source)})`);
  }
  return record;
}

function formatMeta(record, source) {
  const parts = [record.type];
  if (record.duration != null) parts.push(`${record.duration}s`);
  if (record.width && record.height) parts.push(`${record.width}×${record.height}`);
  if (record.transparent) parts.push("transparent");
  if (source === "reused") parts.push("reused");
  return parts.join(", ");
}

const DEFAULT_EXT = {
  bgm: ".wav",
  sfx: ".wav",
  image: ".jpg",
  icon: ".svg",
  brand: ".md",
};

function defaultExt(mediaType) {
  return DEFAULT_EXT[mediaType] || ".bin";
}

function isRecord(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function preflightProjectWrites(projectPath, targets = []) {
  const lexicalRoot = resolve(projectPath);
  let rootStat;
  let realRoot;
  try {
    rootStat = lstatSync(lexicalRoot);
    realRoot = realpathSync(lexicalRoot);
  } catch (error) {
    throw new Error(`unsafe project write boundary: project directory is unavailable: ${error.message}`);
  }
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new Error("unsafe project write boundary: project path must be a real directory");
  }

  const boundary = { lexicalRoot, realRoot };
  const controlPaths = [
    { path: join(lexicalRoot, ".media"), kind: "directory" },
    { path: join(lexicalRoot, ".media", "manifest.jsonl"), kind: "file" },
    { path: join(lexicalRoot, ".media", "index.md"), kind: "file" },
  ];
  for (const target of [...controlPaths, ...targets]) {
    assertSafeProjectPath(boundary, target.path, target.kind);
  }
  return boundary;
}

function assertSafeProjectPath(boundary, targetPath, kind, { mustExist = false } = {}) {
  const absolute = resolve(targetPath);
  if (!isWithin(boundary.lexicalRoot, absolute)) {
    throw new Error(`unsafe project write path escapes project root: ${absolute}`);
  }

  const rel = relative(boundary.lexicalRoot, absolute);
  const segments = rel === "" ? [] : rel.split(sep);
  let current = boundary.lexicalRoot;
  let foundMissing = false;

  for (let index = 0; index < segments.length; index++) {
    current = join(current, segments[index]);
    const isLeaf = index === segments.length - 1;
    const stat = lstatOrNull(current);
    if (!stat) {
      foundMissing = true;
      continue;
    }
    if (foundMissing) {
      throw new Error(`unsafe project write path has an inconsistent ancestor: ${current}`);
    }
    if (stat.isSymbolicLink()) {
      throw new Error(`unsafe project write path contains a symbolic link: ${current}`);
    }
    if (isLeaf && kind === "file") {
      if (!stat.isFile()) {
        throw new Error(`unsafe project write path is not a regular file: ${current}`);
      }
      if (stat.nlink !== 1) {
        throw new Error(`unsafe project write path is a hard-linked file: ${current}`);
      }
    } else if (!stat.isDirectory()) {
      throw new Error(`unsafe project write ancestor is not a directory: ${current}`);
    }

    let realCurrent;
    try {
      realCurrent = realpathSync(current);
    } catch (error) {
      throw new Error(`unsafe project write path cannot be resolved: ${current}: ${error.message}`);
    }
    if (!isWithin(boundary.realRoot, realCurrent)) {
      throw new Error(`unsafe project write path physically escapes project root: ${current}`);
    }
  }

  if (mustExist && foundMissing) {
    throw new Error(`unsafe project write destination was not created: ${absolute}`);
  }
}

function lstatOrNull(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw new Error(`unsafe project write path cannot be inspected: ${path}: ${error.message}`);
  }
}

function unlinkProjectFileSafely(boundary, filePath) {
  try {
    assertSafeProjectPath(boundary, filePath, "file", { mustExist: true });
    unlinkSync(filePath);
  } catch {
    // Cleanup is best-effort and may only remove the verified in-project file.
  }
}

function validateReviewLibrarySource(sourcePath, projectPath, mediaType) {
  let realSource;
  let realProject;
  try {
    if (!statSync(sourcePath).isFile()) return;
    realSource = realpathSync(sourcePath);
    realProject = realpathSync(projectPath);
  } catch {
    return;
  }

  const reviewRoot = findAncestorReviewRoot(realProject, realSource);
  if (!reviewRoot) return;
  const entries = findReviewCatalogEntries(reviewRoot, realSource);
  if (entries == null) return;
  if (entries.length === 0) {
    throw new Error(
      "audio source is inside an ancestor mediaReview tree but is not a matching catalog entry; use audio:discover and its reviewed resolve command",
    );
  }

  let entry;
  if (args["catalog-id"]) {
    const matches = entries.filter((candidate) => candidate.catalogId === args["catalog-id"]);
    if (matches.length !== 1) {
      throw new Error(
        `mediaReview audio --catalog-id does not uniquely match the cataloged source path; expected one of ${entries.map((candidate) => candidate.catalogId).join(", ")}`,
      );
    }
    entry = matches[0];
  } else if (entries.length === 1) {
    entry = entries[0];
  } else {
    throw new Error(
      `mediaReview audio source has multiple catalog entries; use one exact reviewed resolve command (${entries.map((candidate) => candidate.catalogId).join(", ")})`,
    );
  }

  if (mediaType !== entry.type) {
    throw new Error(
      `mediaReview catalog entry ${entry.catalogId} is declared as ${entry.type} and cannot be ingested as ${mediaType}`,
    );
  }

  const missing = [];
  if (!args.reviewed) missing.push("--reviewed");
  for (const [flag, value] of [
    ["--catalog-id", args["catalog-id"]],
    ["--expected-sha256", args["expected-sha256"]],
    ["--source-id", args["source-id"]],
    ["--source-page", args["source-page"]],
    ["--license", args.license],
    ["--license-url", args["license-url"]],
    ["--review-note", args["review-note"]],
  ]) {
    if (typeof value !== "string" || value.trim() === "") missing.push(flag);
  }
  if (entry.creator && !args.creator) missing.push("--creator");
  if (entry.attribution && !args.attribution) missing.push("--attribution");
  if (missing.length > 0) {
    throw new Error(
      `mediaReview audio requires the catalog's reviewed resolve command; missing ${missing.join(", ")}`,
    );
  }
  if (!isSubstantiveReviewNote(args["review-note"])) {
    throw new Error("mediaReview audio requires a substantive completed --review-note");
  }

  const expected = {
    "--catalog-id": entry.catalogId,
    "--expected-sha256": entry.sha256,
    "--source-id": entry.sourceId,
    "--source-page": entry.sourcePage,
    "--license": entry.license,
    "--license-url": entry.licenseUrl,
    ...(entry.creator && { "--creator": entry.creator }),
    ...(entry.attribution && { "--attribution": entry.attribution }),
  };
  const actual = {
    "--catalog-id": args["catalog-id"],
    "--expected-sha256": args["expected-sha256"]?.toLowerCase(),
    "--source-id": args["source-id"],
    "--source-page": args["source-page"],
    "--license": args.license,
    "--license-url": args["license-url"],
    "--creator": args.creator,
    "--attribution": args.attribution,
  };
  for (const [flag, value] of Object.entries(expected)) {
    if (actual[flag] !== value) {
      throw new Error(`mediaReview audio ${flag} does not match catalog entry ${entry.catalogId}`);
    }
  }
}

function findAncestorReviewRoot(realProject, realSource) {
  let sourceAncestor = dirname(realSource);
  while (true) {
    if (basename(sourceAncestor) === "mediaReview") return sourceAncestor;
    const parent = dirname(sourceAncestor);
    if (parent === sourceAncestor) break;
    sourceAncestor = parent;
  }

  const starts = new Set([realProject]);
  for (const candidate of [process.cwd(), resolve(import.meta.dirname, "../../../..")]) {
    try {
      starts.add(realpathSync(candidate));
    } catch {
      // An unavailable optional workspace hint contributes no review root.
    }
  }

  const visited = new Set();
  for (const start of starts) {
    let ancestor = start;
    while (true) {
      if (!visited.has(ancestor)) {
        visited.add(ancestor);
        const candidate = join(ancestor, "mediaReview");
        try {
          const realCandidate = realpathSync(candidate);
          if (statSync(realCandidate).isDirectory() && isWithin(realCandidate, realSource)) {
            return realCandidate;
          }
        } catch {
          // This ancestor has no usable review tree; continue upward.
        }
      }
      const parent = dirname(ancestor);
      if (parent === ancestor) break;
      ancestor = parent;
    }
  }
  return null;
}

function findReviewCatalogEntries(reviewRoot, realSource) {
  const rel = relative(reviewRoot, realSource);
  const collection = rel.split(sep)[0];
  if (!collection || collection === "..") return [];
  const collectionRoot = join(reviewRoot, collection);
  const catalogPath = join(collectionRoot, "catalog.json");
  let catalogStat;
  try {
    catalogStat = lstatSync(catalogPath);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    return null;
  }
  if (catalogStat.isSymbolicLink() || !catalogStat.isFile()) return null;
  let document;
  try {
    document = JSON.parse(readFileSync(catalogPath, "utf8"));
  } catch {
    return null;
  }
  if (
    !isRecord(document) ||
    document.schemaVersion !== 1 ||
    !Array.isArray(document.assets) ||
    typeof document.reviewStatus !== "string" ||
    document.reviewStatus.trim() === ""
  ) {
    return null;
  }

  const matches = [];
  for (const asset of document.assets) {
    if (!isRecord(asset) || typeof asset.localPath !== "string") continue;
    const type = asset.kind === "music" || asset.kind === "bgm" ? "bgm" : asset.kind;
    if (!["bgm", "sfx"].includes(type) || asset.id == null) continue;
    const assetPath = resolve(collectionRoot, asset.localPath);
    if (!isWithin(collectionRoot, assetPath)) continue;
    try {
      const assetStat = lstatSync(assetPath);
      if (assetStat.isSymbolicLink() || !assetStat.isFile()) continue;
      if (realpathSync(assetPath) !== realSource) continue;
    } catch {
      // One stale catalog row cannot mask a later valid exact path/id match.
      continue;
    }
    const sha256 = asset.technical?.sha256;
    if (!/^[0-9a-f]{64}$/i.test(sha256 || "")) continue;
    const sourcePage = asset.individualDownloadPage || asset.sourcePage;
    if (
      typeof sourcePage !== "string" ||
      typeof asset.license?.name !== "string" ||
      typeof asset.license?.url !== "string"
    ) {
      continue;
    }
    matches.push({
      catalogId: `${collection}:${type}:${String(asset.id)}`,
      sourceId: String(asset.id),
      type,
      sourcePage,
      license: asset.license.name,
      licenseUrl: asset.license.url,
      sha256: sha256.toLowerCase(),
      creator: typeof asset.creator === "string" && asset.creator.trim() ? asset.creator : null,
      attribution:
        typeof asset.license.attribution === "string" && asset.license.attribution.trim()
          ? asset.license.attribution
          : null,
    });
  }
  return matches;
}

function isWithin(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`));
}

function reportRuntimeError(error) {
  if (args.json) console.log(JSON.stringify({ ok: false, error: error.message }));
  else console.error(`error: ${error.message}`);
  process.exit(1);
}

run().catch((err) => {
  reportRuntimeError(err);
});
