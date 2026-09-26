#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const PROJECT = process.cwd();
// Load only the user's project configuration, never an author's private library.
const envFile = path.join(PROJECT, ".env");
if (fs.existsSync(envFile)) {
  try { process.loadEnvFile(envFile); } catch { fail("Cannot load project .env (values withheld); use Node >=22.20."); }
}
const forwarded = process.argv.slice(2);
const CATALOG_RELATIVE = path.join(".agents", "skills", "media-use", "scripts", "catalog.mjs");

if (forwarded.includes("--help") || forwarded.includes("-h")) {
  console.log(`HyperFrames audio discovery — inspect local review-catalog candidates

Usage:
  npm run audio:discover -- [--type bgm|sfx|all] [--query <terms>]
  node scripts/audio-discover.cjs [--type bgm|sfx|all] [--query <terms>]

Options:
  --type, -t   Candidate type: bgm, sfx, or all
  --query, -q  Semantic job, event, texture, or editorial alias
  --id         Exact catalog, typed-source, or source id
  --catalog    Explicit workspace-local catalog.json; repeatable
  --limit, -l  Maximum results
  --json       Emit machine-readable JSON
  --help, -h   Show this project-facing help

The wrapper manages the workspace automatically. Discovery is read-only and never approves,
copies, or wires media; audition one candidate, then complete its explicit reviewed resolve handoff.`);
  process.exit(0);
}

if (forwarded.some(isWorkspaceOverride)) {
  fail("--workspace is managed by the HyperFrames wrapper; run this command from the project you want to inspect.");
}

const discovery = process.env.MEDIA_USE_SKILL_DIR
  ? explicitSkill(process.env.MEDIA_USE_SKILL_DIR)
  : findCatalog([PROJECT, __dirname]);
if (!discovery) {
  fail([
    "Could not find .agents/skills/media-use/scripts/catalog.mjs.",
    `Searched upward from the current project (${PROJECT}) and wrapper (${__dirname}).`,
    "Install the media-use skill in .agents/skills or set MEDIA_USE_SKILL_DIR to its directory. Supply your own reviewed catalog; none is bundled.",
  ].join("\n"));
}
if (process.env.MEDIA_CATALOG && !forwarded.some(arg => arg === "--catalog" || arg.startsWith("--catalog="))) forwarded.push("--catalog", process.env.MEDIA_CATALOG);
const safeForwarded = secureExplicitCatalogs(forwarded, discovery.workspace);

const result = spawnSync(
  process.execPath,
  [discovery.catalog, "--workspace", discovery.workspace, ...safeForwarded],
  {
    cwd: PROJECT,
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  },
);

if (result.error) {
  fail(`Unable to run media-use catalog discovery: ${result.error.message}`);
}
if (result.signal) {
  fail(`Media catalog discovery was terminated by ${result.signal}.`);
}
process.exitCode = Number.isInteger(result.status) ? result.status : 1;

function findCatalog(starts) {
  const visited = new Set();
  for (const start of starts) {
    let directory = path.resolve(start);
    while (!visited.has(directory)) {
      visited.add(directory);
      const found = inspectManagedCatalog(directory);
      if (found) return found;
      const parent = path.dirname(directory);
      if (parent === directory) break;
      directory = parent;
    }
  }
  return null;
}

function explicitSkill(directory) {
  const candidate = path.resolve(directory, "scripts", "catalog.mjs");
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) fail("MEDIA_USE_SKILL_DIR must contain scripts/catalog.mjs.");
  // The explicitly chosen tool may live outside the project; reviewed media
  // and catalogs still remain constrained to this project workspace.
  return { catalog: fs.realpathSync(candidate), workspace: fs.realpathSync(PROJECT) };
}

function inspectManagedCatalog(workspace) {
  const catalog = path.join(workspace, CATALOG_RELATIVE);
  try {
    const info = fs.lstatSync(catalog);
    if (info.isSymbolicLink() || !info.isFile()) return null;

    const physicalWorkspace = fs.realpathSync(workspace);
    const physicalCatalog = fs.realpathSync(catalog);
    const expectedPhysicalCatalog = path.join(physicalWorkspace, CATALOG_RELATIVE);
    if (physicalCatalog !== expectedPhysicalCatalog || !isWithin(physicalWorkspace, physicalCatalog)) {
      return null;
    }
    return { workspace: physicalWorkspace, catalog: physicalCatalog };
  } catch (error) {
    if (["ENOENT", "ENOTDIR", "ELOOP"].includes(error.code)) return null;
    throw error;
  }
}

function secureExplicitCatalogs(args, workspace) {
  const secured = [];
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === "--catalog") {
      const supplied = args[++index];
      if (supplied == null || supplied === "") fail("--catalog requires a path inside the managed workspace.");
      secured.push("--catalog", secureCatalogPath(workspace, supplied));
    } else if (argument.startsWith("--catalog=")) {
      const supplied = argument.slice("--catalog=".length);
      if (!supplied) fail("--catalog requires a path inside the managed workspace.");
      secured.push("--catalog", secureCatalogPath(workspace, supplied));
    } else {
      secured.push(argument);
    }
  }
  return secured;
}

function secureCatalogPath(workspace, supplied) {
  const physicalWorkspace = fs.realpathSync(workspace);
  const candidate = path.resolve(physicalWorkspace, supplied);
  if (!isWithin(physicalWorkspace, candidate)) {
    fail(`--catalog must stay inside the managed workspace: ${supplied}`);
  }

  const relativePath = path.relative(physicalWorkspace, candidate);
  let cursor = physicalWorkspace;
  for (const component of relativePath.split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, component);
    let info;
    try {
      info = fs.lstatSync(cursor);
    } catch (error) {
      if (["ENOENT", "ENOTDIR", "ELOOP"].includes(error.code)) {
        fail(`--catalog must name an existing regular non-symlink file: ${supplied}`);
      }
      throw error;
    }
    if (info.isSymbolicLink()) {
      fail(`--catalog paths may not contain symlinks: ${supplied}`);
    }
  }

  const info = fs.lstatSync(candidate);
  if (!info.isFile()) {
    fail(`--catalog must name an existing regular non-symlink file: ${supplied}`);
  }
  const physicalCandidate = fs.realpathSync(candidate);
  if (!isWithin(physicalWorkspace, physicalCandidate)) {
    fail(`--catalog resolves outside the managed workspace: ${supplied}`);
  }
  return physicalCandidate;
}

function isWorkspaceOverride(argument) {
  return argument === "--workspace" || argument.startsWith("--workspace=") || /^-w/.test(argument);
}

function isWithin(root, candidate) {
  const relativePath = path.relative(root, candidate);
  return relativePath === "" || (
    relativePath !== ".." &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

function fail(message) {
  console.error(`audio:discover: ${message}`);
  process.exit(1);
}
