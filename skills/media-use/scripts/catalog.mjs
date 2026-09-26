#!/usr/bin/env node

import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const CATALOG_SCRIPT = fileURLToPath(import.meta.url);
const RESOLVE_SCRIPT = join(dirname(CATALOG_SCRIPT), "resolve.mjs");
const VALID_TYPES = new Set(["all", "bgm", "sfx"]);
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export function discover(argv = process.argv.slice(2)) {
  const args = parseCli(argv);
  if (args.help) return { help: true, text: helpText() };

  const workspace = resolve(args.workspace || ".");
  const type = args.type || "all";
  if (!VALID_TYPES.has(type)) {
    throw new UsageError(`--type must be one of: ${[...VALID_TYPES].join(", ")}`);
  }

  const limit = parseLimit(args.limit);
  if (args.query != null && normalizeText(args.query) === "") {
    throw new UsageError(
      "--query must contain at least one searchable ASCII letter or number",
    );
  }
  const catalogPaths = resolveCatalogPaths(workspace, args.catalog || []);
  if (catalogPaths.length === 0) {
    throw new Error(
      `no curated audio catalogs found under ${join(workspace, "mediaReview", "*", "catalog.json")}`,
    );
  }

  const catalogs = catalogPaths.map(readCatalog);
  let entries = catalogs.flatMap((catalog) => catalog.entries);
  if (type !== "all") entries = entries.filter((entry) => entry.type === type);
  if (args.id) entries = entries.filter((entry) => matchesId(entry, args.id));
  if (args.query) entries = rankQuery(entries, args.query);
  else if (type === "all" && !args.id) entries = interleaveTypes(entries);
  else entries = entries.sort(defaultSort);

  const selected = entries.slice(0, limit).map(validateCandidate);
  return {
    ok: true,
    read_only: true,
    review_status: "candidate",
    resolvable: false,
    workspace,
    filters: {
      type,
      ...(args.query && { query: args.query }),
      ...(args.id && { id: args.id }),
      limit,
    },
    catalogs: catalogs.map((catalog) => ({
      path: catalog.path,
      name: catalog.name,
      declared_review_status: catalog.reviewStatus,
    })),
    count: selected.length,
    candidates: selected,
    next_step:
      "Audition and approve a candidate editorially; only then run its suggested explicit resolve command.",
  };
}

function parseCli(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      workspace: { type: "string", short: "w" },
      catalog: { type: "string", multiple: true },
      type: { type: "string", short: "t" },
      query: { type: "string", short: "q" },
      id: { type: "string" },
      limit: { type: "string", short: "l" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
    allowPositionals: false,
  });
  return values;
}

function helpText() {
  return `media-use catalog — discover reviewed local audio candidates (read-only)

Usage:
  node catalog.mjs [--workspace <repo>] [--type bgm|sfx|all] [--query <terms>]
  node catalog.mjs --catalog <catalog.json> [--id <catalog-or-source-id>]

Options:
  --workspace, -w  Workspace whose mediaReview/*/catalog.json files are scanned
                   (default: current directory)
  --catalog        Explicit catalog.json path; repeat to search several catalogs
  --type, -t       Candidate type: bgm, sfx, or all (default: all)
  --query, -q      Search title, creator, intended use, path, and editorial aliases
  --id             Exact catalog id, typed source id, or source id
  --limit, -l      Maximum results (default: ${DEFAULT_LIMIT}; max: ${MAX_LIMIT})
  --json           Emit machine-readable JSON
  --help, -h       Show this help

Discovery never copies, registers, approves, downloads, or renders an asset.`;
}

function parseLimit(raw) {
  if (raw == null) return DEFAULT_LIMIT;
  if (!/^\d+$/.test(raw)) throw new UsageError("--limit must be a positive integer");
  const limit = Number(raw);
  if (limit < 1 || limit > MAX_LIMIT) {
    throw new UsageError(`--limit must be between 1 and ${MAX_LIMIT}`);
  }
  return limit;
}

function resolveCatalogPaths(workspace, explicitCatalogs) {
  if (explicitCatalogs.length > 0) {
    return [...new Set(explicitCatalogs.map((path) => resolve(workspace, path)))].sort();
  }

  const reviewDir = join(workspace, "mediaReview");
  let reviewInfo;
  try {
    reviewInfo = lstatSync(reviewDir);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  if (reviewInfo.isSymbolicLink() || !reviewInfo.isDirectory()) {
    throw new Error(`workspace mediaReview must be a regular non-symlink directory: ${reviewDir}`);
  }

  const physicalWorkspace = realpathSync(workspace);
  const physicalReviewDir = realpathSync(reviewDir);
  if (!isWithin(physicalWorkspace, physicalReviewDir)) {
    throw new Error(`workspace mediaReview resolves outside its physical workspace: ${reviewDir}`);
  }

  const catalogs = [];
  for (const entry of readdirSync(reviewDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
    const catalogRoot = join(reviewDir, entry.name);
    const physicalCatalogRoot = realpathSync(catalogRoot);
    if (!isWithin(physicalWorkspace, physicalCatalogRoot)) {
      throw new Error(`catalog root resolves outside its physical workspace: ${catalogRoot}`);
    }
    const catalogPath = join(physicalCatalogRoot, "catalog.json");
    if (existsSync(catalogPath)) catalogs.push(catalogPath);
  }
  return catalogs.sort();
}

function readCatalog(catalogPath) {
  assertPlainFile(catalogPath, "catalog");
  let document;
  try {
    document = JSON.parse(readFileSync(catalogPath, "utf8"));
  } catch (error) {
    throw new Error(`invalid catalog JSON at ${catalogPath}: ${error.message}`);
  }
  if (!isRecord(document) || !Array.isArray(document.assets)) {
    throw new Error(`catalog must be an object with an assets array: ${catalogPath}`);
  }
  if (typeof document.reviewStatus !== "string" || document.reviewStatus.trim() === "") {
    throw new Error(`catalog reviewStatus must be a non-empty string: ${catalogPath}`);
  }

  const catalogRoot = dirname(catalogPath);
  const name = basename(catalogRoot);
  const seen = new Set();
  const entries = document.assets.map((asset, index) => {
    const entry = normalizeAsset(asset, { catalogPath, catalogRoot, name, index });
    if (seen.has(entry.catalogId)) {
      throw new Error(`duplicate catalog asset id ${entry.catalogId} in ${catalogPath}`);
    }
    seen.add(entry.catalogId);
    return entry;
  });

  return {
    path: catalogPath,
    root: catalogRoot,
    name,
    reviewStatus: document.reviewStatus,
    entries,
  };
}

function normalizeAsset(asset, catalog) {
  const where = `${catalog.catalogPath} assets[${catalog.index}]`;
  if (!isRecord(asset)) throw new Error(`${where} must be an object`);
  const type = asset.kind === "music" || asset.kind === "bgm" ? "bgm" : asset.kind;
  if (!["bgm", "sfx"].includes(type)) {
    throw new Error(`${where}.kind must be music, bgm, or sfx`);
  }
  requireText(asset.title, `${where}.title`);
  requireText(asset.localPath, `${where}.localPath`);
  requireText(asset.intendedUse, `${where}.intendedUse`);
  requireText(asset.sourcePage, `${where}.sourcePage`);
  if (asset.id == null || String(asset.id).trim() === "") {
    throw new Error(`${where}.id must be present`);
  }
  if (!isRecord(asset.license)) throw new Error(`${where}.license must be an object`);
  requireText(asset.license.name, `${where}.license.name`);
  requireText(asset.license.url, `${where}.license.url`);
  if (!isRecord(asset.technical)) throw new Error(`${where}.technical must be an object`);
  if (!/^[0-9a-f]{64}$/i.test(asset.technical.sha256 || "")) {
    throw new Error(`${where}.technical.sha256 must be a SHA-256 hex digest`);
  }
  if (!(Number(asset.technical.durationSeconds) > 0)) {
    throw new Error(`${where}.technical.durationSeconds must be positive`);
  }

  const sourceId = String(asset.id);
  const catalogId = `${catalog.name}:${type}:${sourceId}`;
  const aliases = editorialAliases(asset);
  return {
    catalogId,
    sourceId,
    type,
    title: asset.title,
    creator: typeof asset.creator === "string" && asset.creator.trim() ? asset.creator : null,
    intendedUse: asset.intendedUse,
    aliases,
    recordedLocalPath: asset.localPath,
    catalogPath: catalog.catalogPath,
    catalogRoot: catalog.catalogRoot,
    sourcePage: asset.sourcePage,
    individualDownloadPage:
      typeof asset.individualDownloadPage === "string" ? asset.individualDownloadPage : null,
    license: {
      name: asset.license.name,
      url: asset.license.url,
      attribution:
        typeof asset.license.attribution === "string" ? asset.license.attribution : null,
    },
    technical: { ...asset.technical },
  };
}

function editorialAliases(asset) {
  const text = normalizeText(`${asset.title} ${asset.intendedUse}`);
  const aliases = new Set();
  if (
    /evidence|investigat|document|dossier|paper|board|clue|connection|analyt|mystery|camera pan|spatial canvas/.test(
      text,
    )
  ) {
    aliases.add("spatial-canvas");
    aliases.add("spatial canvas");
    aliases.add("evidence-board");
  }
  if (
    /fast|rapid|accelerat|kinetic|montage|momentum|sweep|transition|whoosh|glitch|impact|pulse|escalat|energetic|driving|rewind/.test(
      text,
    )
  ) {
    aliases.add("fast-edit");
    aliases.add("fast edit");
    aliases.add("fast edits");
    aliases.add("fast-paced");
  }
  if (
    /transition|whoosh|swoosh|sweep|rewind|swell|slide|cutback|camera pan/.test(text)
  ) {
    aliases.add("transition");
    aliases.add("transitions");
    aliases.add("cut");
  }
  if (
    /\bui\b|interface|typing|keyboard|click|notification|software|button|menu|tab|system|device|computer|data processing/.test(
      text,
    )
  ) {
    aliases.add("ui");
    aliases.add("user-interface");
    aliases.add("interface");
  }
  return [...aliases].sort();
}

function rankQuery(entries, query) {
  const normalized = normalizeText(query);
  const tokens = searchTokens(normalized);
  return entries
    .map((entry) => {
      const title = normalizeText(entry.title);
      const intendedUse = normalizeText(entry.intendedUse);
      const creator = normalizeText(entry.creator || "");
      const aliases = entry.aliases.map(normalizeText);
      const path = normalizeText(entry.recordedLocalPath);
      const ids = [entry.catalogId, `${entry.type}:${entry.sourceId}`, entry.sourceId].map(
        normalizeText,
      );
      const fields = [title, intendedUse, creator, ...aliases, path, ...ids];
      const availableTokens = new Set(fields.flatMap(searchTokens));
      if (!tokens.every((token) => availableTokens.has(token))) return null;

      let score = 1;
      if (title === normalized) score += 100;
      else if (containsTokenPhrase(title, normalized)) score += 50;
      if (aliases.some((alias) => containsTokenPhrase(alias, normalized))) score += 35;
      if (containsTokenPhrase(intendedUse, normalized)) score += 20;
      if (ids.some((id) => containsTokenPhrase(id, normalized))) score += 15;
      const titleTokens = new Set(searchTokens(title));
      score += tokens.filter((token) => titleTokens.has(token)).length * 5;
      return { entry, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || defaultSort(a.entry, b.entry))
    .map(({ entry }) => entry);
}

function searchTokens(value) {
  return String(value || "").split(" ").filter(Boolean);
}

function containsTokenPhrase(haystack, needle) {
  if (!needle) return false;
  return ` ${haystack} `.includes(` ${needle} `);
}

function matchesId(entry, requested) {
  const id = String(requested).toLowerCase();
  return [entry.catalogId, `${entry.type}:${entry.sourceId}`, entry.sourceId]
    .map((value) => value.toLowerCase())
    .includes(id);
}

function defaultSort(a, b) {
  return (
    a.type.localeCompare(b.type) ||
    a.title.localeCompare(b.title) ||
    a.catalogId.localeCompare(b.catalogId)
  );
}

function interleaveTypes(entries) {
  const sfx = entries.filter((entry) => entry.type === "sfx").sort(defaultSort);
  const bgm = entries.filter((entry) => entry.type === "bgm").sort(defaultSort);
  const interleaved = [];
  const count = Math.max(sfx.length, bgm.length);
  for (let index = 0; index < count; index++) {
    if (sfx[index]) interleaved.push(sfx[index]);
    if (bgm[index]) interleaved.push(bgm[index]);
  }
  return interleaved;
}

function validateCandidate(entry) {
  const localPath = resolveCatalogAsset(
    entry.catalogRoot,
    entry.recordedLocalPath,
    entry.catalogId,
  );
  const actualSha256 = sha256(localPath);
  const expectedSha256 = entry.technical.sha256.toLowerCase();
  if (actualSha256 !== expectedSha256) {
    throw new Error(
      `${entry.catalogId} SHA-256 mismatch: expected ${expectedSha256}, received ${actualSha256}`,
    );
  }
  const fileStat = statSync(localPath);
  if (entry.technical.bytes != null && Number(entry.technical.bytes) !== fileStat.size) {
    throw new Error(
      `${entry.catalogId} byte-size mismatch: expected ${entry.technical.bytes}, received ${fileStat.size}`,
    );
  }
  const audio = probeAudio(localPath, entry.catalogId);
  const resolveArgv = suggestedResolveArgv(entry, localPath, actualSha256);

  return {
    catalog_id: entry.catalogId,
    source_id: entry.sourceId,
    type: entry.type,
    title: entry.title,
    creator: entry.creator,
    intended_use: entry.intendedUse,
    aliases: entry.aliases,
    review_status: "candidate",
    resolvable: false,
    local_path: localPath,
    catalog_path: entry.catalogPath,
    source: {
      page: entry.sourcePage,
      individual_download_page: entry.individualDownloadPage,
    },
    license: entry.license,
    technical: entry.technical,
    validation: {
      sha256: "verified",
      regular_non_symlink_file: true,
      decodable_audio: true,
      probed_duration_seconds: audio.duration,
      probed_codec: audio.codec,
    },
    suggested_resolve: {
      argv: resolveArgv,
      command: resolveArgv.map(shellQuote).join(" "),
      requires_editorial_review: true,
    },
  };
}

function resolveCatalogAsset(catalogRoot, recordedPath, catalogId) {
  if (isAbsolute(recordedPath)) {
    throw new Error(`${catalogId} localPath must be relative to its catalog root`);
  }
  const lexicalRoot = resolve(catalogRoot);
  const candidate = resolve(lexicalRoot, recordedPath);
  if (!isWithin(lexicalRoot, candidate)) {
    throw new Error(`${catalogId} localPath escapes its catalog root: ${recordedPath}`);
  }
  assertPlainFile(candidate, `${catalogId} asset`);
  const physicalRoot = realpathSync(lexicalRoot);
  const physicalCandidate = realpathSync(candidate);
  if (!isWithin(physicalRoot, physicalCandidate)) {
    throw new Error(`${catalogId} asset resolves outside its catalog root: ${recordedPath}`);
  }
  return physicalCandidate;
}

function assertPlainFile(path, label) {
  if (!existsSync(path)) throw new Error(`${label} file does not exist: ${path}`);
  const info = lstatSync(path);
  if (info.isSymbolicLink() || !info.isFile()) {
    throw new Error(`${label} must be a regular non-symlink file: ${path}`);
  }
}

function isWithin(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function probeAudio(path, catalogId) {
  let document;
  try {
    const raw = execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "a:0",
        "-show_entries",
        "stream=codec_type,codec_name,duration:format=duration",
        "-of",
        "json",
        path,
      ],
      { encoding: "utf8", timeout: 10000, stdio: ["ignore", "pipe", "pipe"] },
    );
    document = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${catalogId} is not decodable audio: ${error.message}`);
  }
  const stream = document.streams?.find((candidate) => candidate.codec_type === "audio");
  const duration = Number(document.format?.duration || stream?.duration);
  if (!stream || !stream.codec_name || !(duration > 0)) {
    throw new Error(`${catalogId} must contain a decodable audio stream with positive duration`);
  }
  return { codec: stream.codec_name, duration: Math.round(duration * 1000) / 1000 };
}

function suggestedResolveArgv(entry, localPath, sha) {
  const argv = [
    process.execPath,
    RESOLVE_SCRIPT,
    "--type",
    entry.type,
    "--intent",
    entry.intendedUse,
    "--source",
    localPath,
    "--reviewed",
    "--expected-sha256",
    sha,
    "--source-id",
    entry.sourceId,
    "--catalog-id",
    entry.catalogId,
    "--review-note",
    "<describe completed editorial review>",
    "--source-page",
    entry.individualDownloadPage || entry.sourcePage,
    "--license",
    entry.license.name,
    "--license-url",
    entry.license.url,
  ];
  if (entry.creator) argv.push("--creator", entry.creator);
  if (entry.license.attribution) argv.push("--attribution", entry.license.attribution);
  argv.push("--project", ".");
  return argv;
}

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:@%+=,-]+$/.test(text)) return text;
  return `'${text.replaceAll("'", `'"'"'`)}'`;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function isRecord(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function printText(result) {
  console.log(
    `audio candidates: ${result.count} (read-only; status=candidate; directly resolvable=false)`,
  );
  for (const candidate of result.candidates) {
    console.log(`\n${candidate.catalog_id} · ${candidate.title} [${candidate.type}]`);
    console.log(`  use: ${candidate.intended_use}`);
    console.log(`  file: ${candidate.local_path}`);
    console.log(
      `  rights: ${candidate.license.name} · ${candidate.license.url}` +
        (candidate.license.attribution ? ` · ${candidate.license.attribution}` : ""),
    );
    console.log(`  source: ${candidate.source.individual_download_page || candidate.source.page}`);
    console.log(
      `  technical: ${candidate.technical.codec}; ${candidate.validation.probed_duration_seconds}s; sha256 verified`,
    );
    console.log(`  after review: ${candidate.suggested_resolve.command}`);
  }
  console.log(`\n${result.next_step}`);
}

class UsageError extends Error {}

export function main(argv = process.argv.slice(2)) {
  const jsonRequested = argv.includes("--json");
  try {
    const result = discover(argv);
    if (result.help) console.log(result.text);
    else if (jsonRequested) console.log(JSON.stringify(result));
    else printText(result);
  } catch (error) {
    if (jsonRequested) console.log(JSON.stringify({ ok: false, error: error.message }));
    else console.error(`error: ${error.message}`);
    process.exitCode = error instanceof UsageError ? 2 : 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === CATALOG_SCRIPT) main();
