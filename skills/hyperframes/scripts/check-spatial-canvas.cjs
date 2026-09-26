#!/usr/bin/env node
// Structural validation for the opt-in Spatial Canvas composition contract.
// This deliberately validates explicit manifest/DOM linkage instead of
// guessing from words such as "camera", transforms, or a literal <canvas>.
"use strict";

const fs = require("fs");
const path = require("path");

const rootArgIndex = process.argv.indexOf("--root");
if (rootArgIndex >= 0 && (!process.argv[rootArgIndex + 1] || process.argv[rootArgIndex + 1].startsWith("-"))) {
  console.error("check-spatial-canvas: --root requires a project path");
  process.exit(2);
}
const ROOT = rootArgIndex >= 0 ? path.resolve(process.cwd(), process.argv[rootArgIndex + 1]) : path.resolve(__dirname, "..");
const PLAN_PATH = path.join(ROOT, "SPATIAL_CANVAS.json");
const JSON_MODE = process.argv.includes("--json");
const errors = [];
const warnings = [];
const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

const read = (rel) => {
  try {
    const physical = regularProjectFile(path.join(ROOT, rel));
    return physical ? fs.readFileSync(physical, "utf8") : "";
  }
  catch { return ""; }
};
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const positive = (value) => finite(value) && value > 0;
const attrNumber = (attrs, name) => {
  const raw = attrs?.[name];
  return typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
};
const useful = (value) => typeof value === "string" && value.trim().length >= 3 && !/[<>]/.test(value);
const identifier = (value) => typeof value === "string" && /^[A-Za-z][A-Za-z0-9_-]{1,63}$/.test(value);
const slashed = (value) => String(value || "").replace(/\\/g, "/");
const portable = (value) => {
  const raw = slashed(value);
  if (!raw) return "";
  const normalized = path.posix.normalize(raw.replace(/^(\.\/)+/, ""));
  return normalized === "." ? "" : normalized;
};
const safeProjectPath = (value) => {
  const raw = slashed(value);
  return Boolean(raw)
    && !path.posix.isAbsolute(raw)
    && !/^[A-Za-z]:\//.test(raw)
    && !raw.split("/").includes("..")
    && Boolean(portable(raw));
};
function pathEntryExists(file) {
  try { fs.lstatSync(file); return true; }
  catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
    return true;
  }
}
function regularProjectFile(file) {
  try {
    const lexicalRoot = path.resolve(ROOT);
    const lexicalFile = path.resolve(file);
    const lexicalRelative = path.relative(lexicalRoot, lexicalFile);
    if (lexicalRelative === ".." || lexicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(lexicalRelative)) return null;
    const stat = fs.lstatSync(lexicalFile);
    if (stat.isSymbolicLink() || !stat.isFile()) return null;
    const physicalRoot = fs.realpathSync(lexicalRoot);
    const physical = fs.realpathSync(lexicalFile);
    const relative = path.relative(physicalRoot, physical);
    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return null;
    return physical;
  } catch { return null; }
}
function regularProjectDirectory(directory) {
  try {
    const lexicalRoot = path.resolve(ROOT);
    const lexicalDirectory = path.resolve(directory);
    const lexicalRelative = path.relative(lexicalRoot, lexicalDirectory);
    if (lexicalRelative === ".." || lexicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(lexicalRelative)) return null;
    const stat = fs.lstatSync(lexicalDirectory);
    if (stat.isSymbolicLink() || !stat.isDirectory()) return null;
    const physicalRoot = fs.realpathSync(lexicalRoot);
    const physical = fs.realpathSync(lexicalDirectory);
    const relative = path.relative(physicalRoot, physical);
    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return null;
    return physical;
  } catch { return null; }
}
const PLAN_PRESENT = pathEntryExists(PLAN_PATH);
const SAFE_PLAN_PATH = PLAN_PRESENT ? regularProjectFile(PLAN_PATH) : null;

function walkHtml(rel) {
  const abs = path.join(ROOT, rel);
  if (!pathEntryExists(abs)) return [];
  const physicalDirectory = regularProjectDirectory(abs);
  if (!physicalDirectory) {
    fail(`${portable(rel)} must be a regular non-symlink directory physically contained in the project`);
    return [];
  }
  return fs.readdirSync(physicalDirectory, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(rel, entry.name);
    if (entry.isSymbolicLink()) {
      fail(`${portable(child)} must not be a symlink in the walked compositions tree`);
      return [];
    }
    if (entry.isDirectory()) return walkHtml(child);
    if (entry.isFile() && entry.name.endsWith(".html")) {
      if (!regularProjectFile(path.join(ROOT, child))) {
        fail(`${portable(child)} must be a regular non-symlink file physically contained in the project`);
        return [];
      }
      return [portable(child)];
    }
    if (!entry.isFile()) fail(`${portable(child)} must be a regular file or directory in the walked compositions tree`);
    return [];
  });
}

function parseAttrs(source) {
  const attrs = {};
  const duplicates = [];
  for (const match of String(source).matchAll(/([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (Object.hasOwn(attrs, name)) duplicates.push(name);
    else attrs[name] = value; // HTML names are case-insensitive; browsers keep the first duplicate
  }
  Object.defineProperty(attrs, "__duplicates", { value: duplicates, enumerable: false });
  return attrs;
}

const rawTextContainerTags = ["script", "style", "textarea", "title", "iframe", "xmp", "noembed", "noframes", "noscript"];
function stripInertRawText(source) {
  let cleaned = String(source).replace(/<!--[\s\S]*?(?:-->|$)/g, "");
  for (const tag of rawTextContainerTags) {
    cleaned = cleaned.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?(?:<\\/${tag}\\s*>|$)`, "gi"), "");
  }
  return cleaned.replace(/<plaintext\b[^>]*>[\s\S]*$/i, "");
}
function tags(source) {
  const cleaned = stripInertRawText(source);
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  const stack = [];
  const records = [];
  for (const match of cleaned.matchAll(/<\s*(\/?)\s*([a-zA-Z][\w:-]*)\b([^<>]*?)>/g)) {
    const closing = match[1] === "/";
    const name = match[2].toLowerCase();
    if (closing) {
      while (stack.length) if (stack.pop().name === name) break;
      continue;
    }
    const record = { name, attrs: parseAttrs(match[3]), parent: stack.at(-1) || null };
    records.push(record);
    if (!voidTags.has(name) && !/\/\s*$/.test(match[3])) stack.push(record);
  }
  return records;
}

function topLevelTemplates(records) {
  return records.filter((tag) => tag.name === "template" && (tag.parent == null || tag.parent.name === "body"));
}

function liveIndexCompositionRoots(records) {
  return records.filter((tag) => tag.name === "div" && tag.attrs["data-composition-id"]
    && (tag.parent == null || tag.parent.name === "body"));
}

function directTemplateComposition(records) {
  const templates = topLevelTemplates(records);
  const roots = templates.length === 1
    ? records.filter((tag) => tag.name === "div" && tag.attrs["data-composition-id"] && tag.parent === templates[0])
    : [];
  return { templates, roots };
}

function tagged(source, attr, value) {
  return tags(source).filter((tag) => tag.attrs[attr] === value);
}

const inertContainerTags = new Set(["template", "plaintext", ...rawTextContainerTags]);
function isLiveTag(record) {
  return Boolean(record) && !inertContainerTags.has(record.name);
}
function hasLiveAncestorMarker(record, attr, value) {
  if (!isLiveTag(record)) return false;
  for (let parent = record?.parent; parent; parent = parent.parent) {
    if (inertContainerTags.has(parent.name)) return false;
    if (parent.attrs?.[attr] === value) return true;
  }
  return false;
}

const htmlFiles = ["index.html", ...walkHtml("compositions")]
  .filter((file) => Boolean(regularProjectFile(path.join(ROOT, file))));
const htmlByFile = new Map(htmlFiles.map((file) => [file, read(file)]));
const markerAttrs = ["data-hf-spatial-canvas", "data-hf-spatial-world", "data-hf-spatial-host"];
const semanticMarkerAttrs = ["data-hf-spatial-region", "data-hf-spatial-landmark", "data-hf-spatial-connector", "data-hf-spatial-portal"];
const excursionMarkerAttr = "data-hf-spatial-excursion";
const markerIds = new Set();
const markerOccurrences = new Map();
const semanticMarkerOccurrences = new Map();
const excursionMarkerOccurrences = new Map();
const duplicateContractAttrs = [];
const contractAttrs = new Set([
  "class", "data-start", "data-duration", "data-track-index", "data-width", "data-height",
  "data-composition-id", "data-composition-src", "data-hf-spatial-canvas", "data-hf-spatial-world",
  "data-hf-spatial-host", "data-hf-spatial-region", "data-hf-spatial-landmark",
  "data-hf-spatial-connector", "data-hf-spatial-portal", "data-hf-spatial-excursion", "data-hf-spatial-space",
]);
for (const [file, source] of htmlByFile.entries()) {
  for (const tag of tags(source)) {
    const duplicated = tag.attrs.__duplicates.filter((attr) => contractAttrs.has(attr));
    if (duplicated.length) duplicateContractAttrs.push(`${file}: <${tag.name}> repeats ${duplicated.join(", ")}`);
    for (const attr of markerAttrs) if (tag.attrs[attr]) {
      const id = tag.attrs[attr];
      markerIds.add(id);
      const key = `${attr}:${id}`;
      if (!markerOccurrences.has(key)) markerOccurrences.set(key, []);
      markerOccurrences.get(key).push(file);
    }
    for (const attr of semanticMarkerAttrs) if (tag.attrs[attr]) {
      const key = `${attr}:${tag.attrs[attr]}`;
      if (!semanticMarkerOccurrences.has(key)) semanticMarkerOccurrences.set(key, []);
      semanticMarkerOccurrences.get(key).push(file);
    }
    if (tag.attrs[excursionMarkerAttr]) {
      const key = `${excursionMarkerAttr}:${tag.attrs[excursionMarkerAttr]}`;
      if (!excursionMarkerOccurrences.has(key)) excursionMarkerOccurrences.set(key, []);
      excursionMarkerOccurrences.get(key).push(file);
    }
  }
}

if (!PLAN_PRESENT && markerIds.size === 0 && semanticMarkerOccurrences.size === 0 && excursionMarkerOccurrences.size === 0) finish("no Spatial Canvas declared; structural check skipped");
if (!PLAN_PRESENT) {
  const declarations = [...markerIds, ...semanticMarkerOccurrences.keys(), ...excursionMarkerOccurrences.keys()];
  fail(`Spatial Canvas marker(s) found for ${declarations.join(", ")} but SPATIAL_CANVAS.json is missing`);
  finish();
}
if (!SAFE_PLAN_PATH) {
  fail("SPATIAL_CANVAS.json must be a regular non-symlink file physically contained in the project");
  finish();
}

let plan;
try { plan = JSON.parse(fs.readFileSync(SAFE_PLAN_PATH, "utf8")); }
catch (error) {
  fail(`SPATIAL_CANVAS.json is invalid JSON: ${error.message}`);
  finish();
}

if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
  fail("SPATIAL_CANVAS.json root must be an object");
  finish();
}

if (plan.$schema !== "hf-spatial-canvas/v1") fail('SPATIAL_CANVAS.json must declare "$schema": "hf-spatial-canvas/v1"');
for (const duplicate of duplicateContractAttrs) fail(`duplicate Spatial Canvas contract attribute: ${duplicate}`);
if (!Array.isArray(plan.canvases) || plan.canvases.length === 0) {
  fail("SPATIAL_CANVAS.json canvases must be a non-empty array");
  finish();
}

const canvasIds = new Set();
const canvasDefinitions = new Map();
for (const canvas of plan.canvases) {
  if (identifier(canvas?.id) && !canvasDefinitions.has(canvas.id)) canvasDefinitions.set(canvas.id, canvas);
}
const portalRefs = [];
const declaredSemanticMarkers = new Set();
const declaredExcursionMarkers = new Set();
const scopes = new Set(["scene", "sequence", "spine"]);
const backends = new Set(["dom-transform", "svg-viewbox", "canvas2d", "hybrid", "threejs"]);

for (const [canvasIndex, canvas] of plan.canvases.entries()) {
  const label = identifier(canvas?.id) ? `canvas ${canvas.id}` : `canvas #${canvasIndex + 1}`;
  if (!identifier(canvas?.id)) { fail(`${label}: id must be a safe 2–64 character identifier`); continue; }
  if (canvasIds.has(canvas.id)) fail(`${label}: duplicate canvas id`);
  canvasIds.add(canvas.id);
  if (!scopes.has(canvas.scope)) fail(`${label}: scope must be scene, sequence, or spine`);
  if (!backends.has(canvas.backend)) fail(`${label}: unsupported backend ${JSON.stringify(canvas.backend)}`);
  if (!useful(canvas.spatialThesis)) fail(`${label}: spatialThesis must state what geography proves`);

  const composition = portable(canvas.composition);
  if (!safeProjectPath(canvas.composition)) {
    fail(`${label}: composition must be a safe project-relative path`);
    continue;
  }
  if (composition === "index.html" && canvas.scope !== "scene") {
    fail(`${label}: only scope "scene" may own index.html; sequence/spine would recursively mount the project root`);
  }
  const compositionPath = path.join(ROOT, composition);
  if (!pathEntryExists(compositionPath)) { fail(`${label}: composition does not exist: ${composition}`); continue; }
  const physicalComposition = regularProjectFile(compositionPath);
  if (!physicalComposition) {
    fail(`${label}: composition must be a regular non-symlink file physically contained in the project: ${composition}`);
    continue;
  }
  let compositionSource;
  try { compositionSource = fs.readFileSync(physicalComposition, "utf8"); }
  catch (error) { fail(`${label}: composition cannot be read safely: ${error.message}`); continue; }
  const compositionTags = tags(compositionSource);
  const roots = compositionTags.filter((tag) => tag.attrs["data-hf-spatial-canvas"] === canvas.id);
  const worlds = compositionTags.filter((tag) => tag.attrs["data-hf-spatial-world"] === canvas.id);
  if (roots.length !== 1) fail(`${label}: ${composition} must contain exactly one data-hf-spatial-canvas="${canvas.id}" marker (found ${roots.length})`);
  if (worlds.length !== 1) fail(`${label}: ${composition} must contain exactly one data-hf-spatial-world="${canvas.id}" marker (found ${worlds.length})`);
  if (roots.length === 1) {
    if (composition === "index.html") {
      const liveRoots = liveIndexCompositionRoots(compositionTags);
      if (liveRoots.length !== 1 || roots[0] !== liveRoots[0]) {
        fail(`${label}: data-hf-spatial-canvas must mark the sole live top-level div composition root in index.html, not a template or nested element`);
      }
    } else {
      const templateComposition = directTemplateComposition(compositionTags);
      if (templateComposition.templates.length !== 1 || templateComposition.roots.length !== 1
        || roots[0] !== templateComposition.roots[0]) {
        fail(`${label}: data-hf-spatial-canvas must mark one div composition root directly under exactly one top-level template, not a nested template or element`);
      }
    }
  }
  if (worlds.length === 1 && !hasLiveAncestorMarker(worlds[0], "data-hf-spatial-canvas", canvas.id)) {
    fail(`${label}: data-hf-spatial-world must be a live descendant of its marked composition root without an inert template/noscript boundary`);
  }
  const globalRoots = markerOccurrences.get(`data-hf-spatial-canvas:${canvas.id}`) || [];
  const globalWorlds = markerOccurrences.get(`data-hf-spatial-world:${canvas.id}`) || [];
  if (globalRoots.length !== 1) fail(`${label}: one-owner invariant requires exactly one canvas root across the project (found ${globalRoots.length}: ${globalRoots.join(", ") || "none"})`);
  if (globalWorlds.length !== 1) fail(`${label}: one-owner invariant requires exactly one transformed world across the project (found ${globalWorlds.length}: ${globalWorlds.join(", ") || "none"})`);

  const requireSemanticMarkers = (attr, kind, ids) => {
    for (const id of ids) {
      const value = `${canvas.id}:${id}`;
      const markerKey = `${attr}:${value}`;
      declaredSemanticMarkers.add(markerKey);
      const local = tagged(compositionSource, attr, value);
      const global = semanticMarkerOccurrences.get(markerKey) || [];
      if (local.length !== 1) fail(`${label}/${id}: ${composition} must contain exactly one ${attr}="${value}" marker (found ${local.length})`);
      if (local.length === 1 && !hasLiveAncestorMarker(local[0], "data-hf-spatial-world", canvas.id)) {
        fail(`${label}/${id}: ${kind} marker must be a live descendant of data-hf-spatial-world="${canvas.id}" without an inert template/noscript boundary`);
      }
      if (global.length !== 1) fail(`${label}/${id}: ${kind} marker must have one project owner (found ${global.length}: ${global.join(", ") || "none"})`);
    }
  };

  const viewport = canvas.viewport || {};
  const world = canvas.world || {};
  if (!positive(viewport.width) || !positive(viewport.height)) fail(`${label}: viewport width/height must be finite positive numbers`);
  if (!finite(viewport.focusX) || !finite(viewport.focusY)) fail(`${label}: viewport focusX/focusY must be finite numbers`);
  if (finite(viewport.focusX) && (viewport.focusX < 0 || viewport.focusX > viewport.width)) fail(`${label}: viewport focusX lies outside the viewport`);
  if (finite(viewport.focusY) && (viewport.focusY < 0 || viewport.focusY > viewport.height)) fail(`${label}: viewport focusY lies outside the viewport`);
  if (!positive(world.width) || !positive(world.height)) fail(`${label}: world width/height must be finite positive numbers`);
  if (positive(world.width) && positive(viewport.width) && world.width / viewport.width > 20) warn(`${label}: world is more than 20 viewport-widths wide; review DOM/performance and navigation cost`);
  if (positive(world.height) && positive(viewport.height) && world.height / viewport.height > 20) warn(`${label}: world is more than 20 viewport-heights tall; review DOM/performance and navigation cost`);
  if (roots.length === 1) {
    const rootAttrs = roots[0].attrs;
    if (!rootAttrs["data-composition-id"]) fail(`${label}: data-hf-spatial-canvas must be on the composition root with data-composition-id`);
    const rootWidth = attrNumber(rootAttrs, "data-width");
    const rootHeight = attrNumber(rootAttrs, "data-height");
    if (!positive(rootWidth) || !positive(rootHeight)) fail(`${label}: marked composition root needs finite positive data-width/data-height`);
    else if (rootWidth !== viewport.width || rootHeight !== viewport.height) {
      fail(`${label}: manifest viewport ${viewport.width}×${viewport.height} must match composition root ${rootWidth}×${rootHeight}`);
    }
  }

  const regions = Array.isArray(canvas.regions) ? canvas.regions : [];
  const regionIds = new Set();
  if (regions.length < 2) fail(`${label}: define at least two regions; otherwise use an ordinary camera move`);
  for (const region of regions) {
    if (!identifier(region?.id)) { fail(`${label}: every region needs a safe identifier`); continue; }
    if (regionIds.has(region.id)) fail(`${label}: duplicate region id ${region.id}`);
    regionIds.add(region.id);
    if (![region.x, region.y, region.width, region.height].every(finite) || region.width <= 0 || region.height <= 0) {
      fail(`${label}/${region.id}: x/y/width/height must be finite and size positive`);
      continue;
    }
    if (region.x < 0 || region.y < 0 || region.x + region.width > world.width || region.y + region.height > world.height) {
      fail(`${label}/${region.id}: region bounds lie outside the declared world`);
    }
    if (!finite(region.anchorX) || !finite(region.anchorY)
      || region.anchorX < region.x || region.anchorX > region.x + region.width
      || region.anchorY < region.y || region.anchorY > region.y + region.height) {
      fail(`${label}/${region.id}: anchorX/anchorY must lie inside the region bounds`);
    }
    if (!useful(region.claim)) fail(`${label}/${region.id}: claim must name the region's semantic job`);
  }
  requireSemanticMarkers("data-hf-spatial-region", "region", regionIds);

  const landmarks = Array.isArray(canvas.landmarks) ? canvas.landmarks : [];
  const landmarkIds = new Set();
  if (landmarks.length < 2) fail(`${label}: define at least two persistent landmarks for orientation`);
  for (const landmark of landmarks) {
    if (!identifier(landmark?.id)) { fail(`${label}: every landmark needs a safe identifier`); continue; }
    if (landmarkIds.has(landmark.id) || regionIds.has(landmark.id)) fail(`${label}: duplicate region/landmark id ${landmark.id}`);
    landmarkIds.add(landmark.id);
    if (!finite(landmark.x) || !finite(landmark.y) || landmark.x < 0 || landmark.x > world.width || landmark.y < 0 || landmark.y > world.height) {
      fail(`${label}/${landmark.id}: landmark x/y must lie inside the world`);
    }
    if (!useful(landmark.purpose)) fail(`${label}/${landmark.id}: landmark purpose must explain its orientation role`);
  }
  requireSemanticMarkers("data-hf-spatial-landmark", "landmark", landmarkIds);

  const connectors = Array.isArray(canvas.connectors) ? canvas.connectors : [];
  const connectorIds = new Set();
  const spatialNodeIds = new Set([...regionIds, ...landmarkIds]);
  if (connectors.length < 1) fail(`${label}: define at least one semantic connector`);
  for (const connector of connectors) {
    if (!identifier(connector?.id)) { fail(`${label}: every connector needs a safe identifier`); continue; }
    if (connectorIds.has(connector.id)) fail(`${label}: duplicate connector id ${connector.id}`);
    connectorIds.add(connector.id);
    if (!spatialNodeIds.has(connector.from) || !spatialNodeIds.has(connector.to) || connector.from === connector.to) {
      fail(`${label}/${connector.id}: connector from/to must name two distinct regions or landmarks`);
    }
    if (!useful(connector.meaning)) fail(`${label}/${connector.id}: connector meaning must state the relationship`);
    if (!identifier(connector.type)) fail(`${label}/${connector.id}: connector type must be a safe semantic relationship id`);
  }
  requireSemanticMarkers("data-hf-spatial-connector", "connector", connectorIds);

  const lod = canvas.lod || {};
  for (const level of ["overview", "regional", "detail"]) {
    if (!useful(lod[level])) fail(`${label}: lod.${level} must define what remains legible at that scale`);
  }

  const portals = canvas.portals == null ? [] : canvas.portals;
  const portalIds = new Set();
  const portalById = new Map();
  const portalUseCount = new Map();
  if (!Array.isArray(portals)) fail(`${label}: portals must be an array when present`);
  else for (const portal of portals) {
    if (!identifier(portal?.id)) { fail(`${label}: every portal needs a safe identifier`); continue; }
    if (portalIds.has(portal.id)) fail(`${label}: duplicate portal id ${portal.id}`);
    portalIds.add(portal.id);
    portalById.set(portal.id, portal);
    portalUseCount.set(portal.id, 0);
    if (!regionIds.has(portal.region)) fail(`${label}/${portal.id}: portal region must name a declared region`);
    if (!identifier(portal.targetCanvas) || portal.targetCanvas === canvas.id) fail(`${label}/${portal.id}: targetCanvas must name a different canvas id`);
    if (!useful(portal.purpose)) fail(`${label}/${portal.id}: portal purpose must explain the nested journey`);
    portalRefs.push({ label: `${label}/${portal.id}`, target: portal.targetCanvas });
  }
  requireSemanticMarkers("data-hf-spatial-portal", "portal", portalIds);

  const visits = Array.isArray(canvas.visits) ? canvas.visits : [];
  const visitIds = new Set();
  const visitById = new Map();
  if (visits.length < 3) fail(`${label}: route needs at least orient/visit/synthesis poses`);
  let priorAt = -Infinity;
  let maxEnd = 0;
  const poseKeys = new Set();
  for (const visit of visits) {
    if (!identifier(visit?.id)) { fail(`${label}: every visit needs a safe identifier`); continue; }
    if (visitIds.has(visit.id)) fail(`${label}: duplicate visit id ${visit.id}`);
    visitIds.add(visit.id);
    visitById.set(visit.id, visit);
    if (!finite(visit.at) || visit.at < 0 || !positive(visit.duration)) fail(`${label}/${visit.id}: at must be >=0 and duration finite positive`);
    if (finite(visit.at) && visit.at < priorAt) fail(`${label}/${visit.id}: visits must be ordered by at time`);
    if (finite(visit.at)) priorAt = visit.at;
    if (finite(visit.at) && positive(visit.duration)) maxEnd = Math.max(maxEnd, visit.at + visit.duration);
    if (!useful(visit.verb) || !useful(visit.purpose) || !useful(visit.revision)) fail(`${label}/${visit.id}: verb, purpose, and revision must be filled`);
    if (!finite(visit.reviewAt) || (finite(visit.at) && positive(visit.duration) && (visit.reviewAt < visit.at || visit.reviewAt > visit.at + visit.duration))) {
      fail(`${label}/${visit.id}: reviewAt must fall inside the visit window`);
    }
    const camera = visit.camera || {};
    if (!finite(camera.cx) || !finite(camera.cy) || !positive(camera.zoom)) {
      fail(`${label}/${visit.id}: camera cx/cy must be finite and zoom finite positive`);
    } else {
      poseKeys.add(`${camera.cx}|${camera.cy}|${camera.zoom}`);
      if (camera.cx < 0 || camera.cx > world.width || camera.cy < 0 || camera.cy > world.height) warn(`${label}/${visit.id}: camera center lies outside the world`);
      if (visit.region != null) {
        if (!regionIds.has(visit.region)) fail(`${label}/${visit.id}: unknown region ${visit.region}`);
        else if (positive(viewport.width) && positive(viewport.height)) {
          const region = regions.find((item) => item.id === visit.region);
          const rx = region.anchorX;
          const ry = region.anchorY;
          const left = camera.cx - viewport.focusX / camera.zoom;
          const right = camera.cx + (viewport.width - viewport.focusX) / camera.zoom;
          const top = camera.cy - viewport.focusY / camera.zoom;
          const bottom = camera.cy + (viewport.height - viewport.focusY) / camera.zoom;
          if (rx < left || rx > right || ry < top || ry > bottom) fail(`${label}/${visit.id}: declared region ${visit.region} is not visible from the planned pose`);
        }
      }
    }
  }
  if (poseKeys.size < 2) fail(`${label}: route must contain at least two distinct camera poses`);

  const firstVisit = visits[0];
  const finalVisit = visits.at(-1);
  if (!firstVisit || String(firstVisit.verb || "").toLowerCase() !== "orient" || firstVisit.region != null || firstVisit.at !== 0) {
    fail(`${label}: first visit must be an orient overview at local 0 with region null`);
  }
  if (!finalVisit || String(finalVisit.verb || "").toLowerCase() !== "synthesize" || finalVisit.region != null) {
    fail(`${label}: final visit must be a synthesize overview with region null`);
  }
  if (firstVisit && finalVisit
    && String(firstVisit.revision || "").trim().toLowerCase() === String(finalVisit.revision || "").trim().toLowerCase()) {
    fail(`${label}: final synthesis revision must differ from the opening revision`);
  }
  const visibleLandmarkCount = (visit) => {
    const camera = visit?.camera || {};
    if (!positive(viewport.width) || !positive(viewport.height) || !finite(camera.cx) || !finite(camera.cy) || !positive(camera.zoom)) return 0;
    const left = camera.cx - viewport.focusX / camera.zoom;
    const right = camera.cx + (viewport.width - viewport.focusX) / camera.zoom;
    const top = camera.cy - viewport.focusY / camera.zoom;
    const bottom = camera.cy + (viewport.height - viewport.focusY) / camera.zoom;
    return landmarks.filter((landmark) => finite(landmark.x) && finite(landmark.y)
      && landmark.x >= left && landmark.x <= right && landmark.y >= top && landmark.y <= bottom).length;
  };
  if (firstVisit && visibleLandmarkCount(firstVisit) < 2) fail(`${label}: orient overview must show at least two declared landmarks`);
  if (finalVisit && visibleLandmarkCount(finalVisit) < 2) fail(`${label}: synthesize overview must show at least two declared landmarks`);

  const rootDuration = attrNumber(roots[0]?.attrs, "data-duration");
  const finalEnd = finite(finalVisit?.at) && positive(finalVisit?.duration) ? finalVisit.at + finalVisit.duration : NaN;
  if (!positive(rootDuration)) fail(`${label}: marked composition root needs a finite positive data-duration`);
  else if (maxEnd > rootDuration + 1e-6) fail(`${label}: route ends at ${maxEnd}s, beyond composition duration ${rootDuration}s`);
  else if (!finite(finalEnd) || Math.abs(rootDuration - finalEnd) > 0.05) fail(`${label}: final visit must cover the composition through ${rootDuration}s (final visit currently ends at ${finite(finalEnd) ? finalEnd : "an invalid time"})`);

  const indexSource = read("index.html");
  const indexTags = tags(indexSource);
  const indexRoots = liveIndexCompositionRoots(indexTags);
  const isDirectIndexChild = (tag) => indexRoots.length === 1 && isLiveTag(tag) && tag.parent === indexRoots[0];
  const hosts = indexTags.filter((tag) => tag.attrs["data-hf-spatial-host"] === canvas.id);
  const globalHosts = markerOccurrences.get(`data-hf-spatial-host:${canvas.id}`) || [];
  const rootOwnedScene = canvas.scope === "scene" && composition === "index.html";
  const expectedHostCount = rootOwnedScene ? 0 : 1;
  if (globalHosts.some((file) => file !== "index.html")) {
    fail(`${label}: data-hf-spatial-host may appear only in index.html (found ${globalHosts.join(", ")})`);
  }
  if (globalHosts.length !== expectedHostCount) {
    fail(`${label}: ${rootOwnedScene ? "root-owned scene" : "mounted canvas"} requires ${expectedHostCount} project host marker(s) (found ${globalHosts.length})`);
  }
  if (hosts.some((host) => !isDirectIndexChild(host))) {
    fail(`${label}: Spatial Canvas host must be a direct child of the top-level index composition root`);
  }
  let canvasHostStart = 0;
  if (canvas.scope !== "scene") {
    if (hosts.length !== 1) fail(`${label}: ${canvas.scope} scope requires exactly one index.html data-hf-spatial-host="${canvas.id}" (found ${hosts.length})`);
    else {
      const host = hosts[0].attrs;
      canvasHostStart = attrNumber(host, "data-start");
      if (!finite(canvasHostStart) || canvasHostStart < 0) fail(`${label}: host data-start must be finite and non-negative`);
      if (!finite(attrNumber(host, "data-track-index"))) fail(`${label}: host data-track-index must be explicit and finite`);
      if (!host["data-composition-id"] || host["data-composition-id"] !== roots[0]?.attrs?.["data-composition-id"]) {
        fail(`${label}: host data-composition-id must equal the marked owner composition id ${roots[0]?.attrs?.["data-composition-id"] || "<missing>"}`);
      }
      if (portable(host["data-composition-src"]) !== composition) fail(`${label}: host data-composition-src must equal ${composition}`);
      const hostDuration = attrNumber(host, "data-duration");
      if (!positive(hostDuration) || hostDuration + 1e-6 < maxEnd) fail(`${label}: host duration must cover the full local route (${maxEnd}s)`);
      const hostWidth = attrNumber(host, "data-width");
      const hostHeight = attrNumber(host, "data-height");
      if (!positive(hostWidth) || !positive(hostHeight) || hostWidth !== viewport.width || hostHeight !== viewport.height) {
        fail(`${label}: host data-width/data-height must match manifest viewport ${viewport.width}×${viewport.height}`);
      }
    }
  } else if (composition === "index.html") {
    if (hosts.length !== 0) fail(`${label}: root-owned scene canvas must not also declare a host marker`);
  } else if (hosts.length !== 1) fail(`${label}: mounted scene scope requires exactly one index.html data-hf-spatial-host="${canvas.id}" (found ${hosts.length})`);
  else {
    const host = hosts[0].attrs;
    canvasHostStart = attrNumber(host, "data-start");
    if (!finite(canvasHostStart) || canvasHostStart < 0) fail(`${label}: scene host data-start must be finite and non-negative`);
    if (!finite(attrNumber(host, "data-track-index"))) fail(`${label}: scene host data-track-index must be explicit and finite`);
    if (!host["data-composition-id"] || host["data-composition-id"] !== roots[0]?.attrs?.["data-composition-id"]) {
      fail(`${label}: scene host data-composition-id must equal the marked owner composition id ${roots[0]?.attrs?.["data-composition-id"] || "<missing>"}`);
    }
    if (portable(host["data-composition-src"]) !== composition) fail(`${label}: scene host data-composition-src must equal ${composition}`);
    const hostDuration = attrNumber(host, "data-duration");
    if (!positive(hostDuration) || hostDuration + 1e-6 < maxEnd) fail(`${label}: scene host duration must cover the full local route (${maxEnd}s)`);
    const hostWidth = attrNumber(host, "data-width");
    const hostHeight = attrNumber(host, "data-height");
    if (!positive(hostWidth) || !positive(hostHeight) || hostWidth !== viewport.width || hostHeight !== viewport.height) {
      fail(`${label}: scene host data-width/data-height must match manifest viewport ${viewport.width}×${viewport.height}`);
    }
  }

  const excursions = canvas.excursions == null ? [] : canvas.excursions;
  if (!Array.isArray(excursions)) fail(`${label}: excursions must be an array`);
  else {
    const excursionIds = new Set();
    for (const excursion of excursions) {
      if (!identifier(excursion?.id)) { fail(`${label}: every excursion needs a safe identifier`); continue; }
      if (excursionIds.has(excursion.id)) fail(`${label}: duplicate excursion id ${excursion.id}`);
      excursionIds.add(excursion.id);
      const excursionMarkerValue = `${canvas.id}:${excursion.id}`;
      const excursionMarkerKey = `${excursionMarkerAttr}:${excursionMarkerValue}`;
      declaredExcursionMarkers.add(excursionMarkerKey);
      const localExcursionMarkers = tagged(compositionSource, excursionMarkerAttr, excursionMarkerValue);
      const globalExcursionMarkers = excursionMarkerOccurrences.get(excursionMarkerKey) || [];
      const depart = visitById.get(excursion.departVisit);
      const returning = visitById.get(excursion.returnVisit);
      if (!depart) fail(`${label}/${excursion.id}: unknown departVisit ${excursion.departVisit}`);
      if (!returning) fail(`${label}/${excursion.id}: unknown returnVisit ${excursion.returnVisit}`);
      if (depart && returning && returning.at <= depart.at) fail(`${label}/${excursion.id}: returnVisit must occur after departVisit`);
      if (depart && returning
        && String(depart.revision || "").trim().toLowerCase() === String(returning.revision || "").trim().toLowerCase()) {
        fail(`${label}/${excursion.id}: return visit revision must differ from the departure revision`);
      }
      if (!useful(excursion.returnMutation)) fail(`${label}/${excursion.id}: returnMutation must make the excursion consequential`);
      if (excursion.portalId != null) {
        if (!identifier(excursion.portalId) || !portalById.has(excursion.portalId)) {
          fail(`${label}/${excursion.id}: portalId must name a declared portal on this canvas`);
        } else {
          const portal = portalById.get(excursion.portalId);
          portalUseCount.set(excursion.portalId, portalUseCount.get(excursion.portalId) + 1);
          const targetCanvas = canvasDefinitions.get(portal.targetCanvas);
          if (!targetCanvas) fail(`${label}/${excursion.id}: portal target canvas ${portal.targetCanvas} is not declared`);
          else if (!excursion.cutawayComposition || portable(excursion.cutawayComposition) !== portable(targetCanvas.composition)) {
            fail(`${label}/${excursion.id}: portal excursion cutawayComposition must equal target canvas composition ${portable(targetCanvas.composition)}`);
          }
        }
      }
      const excursionEnd = Number(excursion.at) + Number(excursion.duration);
      const validExcursionWindow = finite(excursion.at) && excursion.at >= 0 && positive(excursion.duration);
      if (!validExcursionWindow) {
        fail(`${label}/${excursion.id}: at must be >=0 and duration finite positive`);
      } else {
        if (depart && (excursion.at < depart.at || excursion.at > depart.at + depart.duration)) {
          fail(`${label}/${excursion.id}: excursion must start inside its departVisit window`);
        }
        if (returning && excursionEnd > returning.at + 1e-6) {
          fail(`${label}/${excursion.id}: excursion must end at or before its returnVisit begins`);
        }
      }
      if (!finite(excursion.reviewAt) || (validExcursionWindow && (excursion.reviewAt < excursion.at || excursion.reviewAt > excursionEnd))) {
        fail(`${label}/${excursion.id}: reviewAt must fall inside the excursion window`);
      }
      if (validExcursionWindow) {
        for (const visit of visits) {
          if (finite(visit.reviewAt) && visit.reviewAt >= excursion.at - 1e-6 && visit.reviewAt <= excursionEnd + 1e-6) {
            fail(`${label}/${visit.id}: visit reviewAt must lie outside excursion ${excursion.id}'s visibility window`);
          }
        }
      }
      if (excursion.cutawayComposition == null) {
        if (localExcursionMarkers.length !== 1) {
          fail(`${label}/${excursion.id}: inline excursion requires exactly one ${excursionMarkerAttr}="${excursionMarkerValue}" in ${composition} (found ${localExcursionMarkers.length})`);
        }
        if (globalExcursionMarkers.length !== 1) {
          fail(`${label}/${excursion.id}: inline excursion marker must have one project owner in ${composition} (found ${globalExcursionMarkers.length}: ${globalExcursionMarkers.join(", ") || "none"})`);
        }
        if (localExcursionMarkers.length === 1) {
          const markerRecord = localExcursionMarkers[0];
          const marker = markerRecord.attrs;
          const markerClasses = String(marker.class || "").split(/\s+/).filter(Boolean);
          const markerAt = attrNumber(marker, "data-start");
          const markerDuration = attrNumber(marker, "data-duration");
          const markerTrack = attrNumber(marker, "data-track-index");
          if (!markerClasses.includes("clip")) {
            fail(`${label}/${excursion.id}: inline excursion marker must be a native class="clip" lifecycle owner`);
          }
          if (!hasLiveAncestorMarker(markerRecord, "data-hf-spatial-canvas", canvas.id)) {
            fail(`${label}/${excursion.id}: inline excursion marker must be live composition content without an inert template/noscript boundary`);
          }
          if (markerRecord.parent?.attrs?.["data-hf-spatial-canvas"] !== canvas.id) {
            fail(`${label}/${excursion.id}: inline excursion clip must be a direct child of the marked composition root`);
          }
          if (marker["data-hf-spatial-space"] !== "view") {
            fail(`${label}/${excursion.id}: inline excursion marker must declare data-hf-spatial-space="view"`);
          }
          if (!finite(markerAt) || !positive(markerDuration) || !finite(markerTrack)) {
            fail(`${label}/${excursion.id}: inline excursion clip needs finite data-start/data-track-index and positive data-duration`);
          } else if (validExcursionWindow && (Math.abs(markerAt - excursion.at) > 1e-6 || Math.abs(markerDuration - excursion.duration) > 1e-6)) {
            fail(`${label}/${excursion.id}: inline excursion marker window ${markerAt}–${markerAt + markerDuration}s must exactly match manifest window ${excursion.at}–${excursionEnd}s`);
          }
        }
      } else if (globalExcursionMarkers.length > 0) {
        fail(`${label}/${excursion.id}: external excursion must be owned by its mounted cutaway host, not an inline ${excursionMarkerAttr} marker`);
      }
      const returnMode = excursion.returnMode || "exact";
      if (!new Set(["exact", "reorient"]).has(returnMode)) fail(`${label}/${excursion.id}: returnMode must be exact or reorient`);
      if (returnMode === "exact" && depart && returning) {
        const tolerance = excursion.returnTolerance || {};
        const centerTolerance = tolerance.center == null ? 1 : tolerance.center;
        const zoomTolerance = tolerance.zoom == null ? 0.001 : tolerance.zoom;
        if (!finite(centerTolerance) || centerTolerance < 0 || !finite(zoomTolerance) || zoomTolerance < 0) {
          fail(`${label}/${excursion.id}: returnTolerance center/zoom must be finite non-negative numbers`);
        } else {
          if (depart.region !== returning.region) fail(`${label}/${excursion.id}: exact return must restore the departure region`);
          if (String(returning.verb || "").toLowerCase() !== "rejoin") fail(`${label}/${excursion.id}: exact return visit verb must be rejoin`);
          const dx = Number(returning.camera?.cx) - Number(depart.camera?.cx);
          const dy = Number(returning.camera?.cy) - Number(depart.camera?.cy);
          const dz = Math.abs(Number(returning.camera?.zoom) - Number(depart.camera?.zoom));
          if (!Number.isFinite(dx) || !Number.isFinite(dy) || Math.hypot(dx, dy) > centerTolerance || !Number.isFinite(dz) || dz > zoomTolerance) {
            fail(`${label}/${excursion.id}: exact return pose exceeds tolerance (center ${centerTolerance}, zoom ${zoomTolerance})`);
          }
        }
      } else if (returnMode === "reorient" && !useful(excursion.returnReason)) {
        fail(`${label}/${excursion.id}: reorient return requires returnReason`);
      }
      if (excursion.cutawayComposition != null) {
        const cutaway = portable(excursion.cutawayComposition);
        const nestedTarget = [...canvasDefinitions.values()].find((candidate) => candidate.id !== canvas.id && portable(candidate.composition) === cutaway);
        if (nestedTarget && excursion.portalId == null) {
          fail(`${label}/${excursion.id}: cutawayComposition belongs to Spatial Canvas ${nestedTarget.id}; nested-canvas excursions require portalId`);
        }
        const cutawayPath = path.join(ROOT, cutaway);
        const cutawayPresent = safeProjectPath(excursion.cutawayComposition) && pathEntryExists(cutawayPath);
        const physicalCutaway = cutawayPresent ? regularProjectFile(cutawayPath) : null;
        if (cutaway === composition) fail(`${label}/${excursion.id}: cutawayComposition must be distinct from the persistent canvas composition`);
        else if (!cutawayPresent) fail(`${label}/${excursion.id}: cutawayComposition does not exist`);
        else if (!physicalCutaway) fail(`${label}/${excursion.id}: cutawayComposition must be a regular non-symlink file physically contained in the project`);
        else if (validExcursionWindow) {
          let cutawaySource = "";
          try { cutawaySource = fs.readFileSync(physicalCutaway, "utf8"); }
          catch (error) { fail(`${label}/${excursion.id}: cutawayComposition cannot be read safely: ${error.message}`); }
          const cutawayComposition = directTemplateComposition(tags(cutawaySource));
          const cutawayRoots = cutawayComposition.roots;
          if (cutawayComposition.templates.length !== 1 || cutawayRoots.length !== 1) {
            fail(`${label}/${excursion.id}: external cutaway ${cutaway} needs one live div composition root directly under exactly one top-level template`);
          }
          const cutawayHosts = indexTags.filter((tag) => portable(tag.attrs["data-composition-src"]) === cutaway);
          if (cutawayHosts.some((host) => !isDirectIndexChild(host))) {
            fail(`${label}/${excursion.id}: external cutaway host must be a direct child of the top-level index composition root`);
          }
          const windowStartGlobal = canvasHostStart + excursion.at;
          const windowEndGlobal = canvasHostStart + excursionEnd;
          const coveringHosts = cutawayHosts.filter((tag) => {
            const start = attrNumber(tag.attrs, "data-start");
            const duration = attrNumber(tag.attrs, "data-duration");
            const track = attrNumber(tag.attrs, "data-track-index");
            return isDirectIndexChild(tag) && finite(start) && positive(duration) && finite(track)
              && start <= windowStartGlobal + 1e-6
              && start + duration >= windowEndGlobal - 1e-6;
          });
          if (coveringHosts.length !== 1) {
            fail(`${label}/${excursion.id}: ${cutaway} needs exactly one native host covering the full excursion window ${windowStartGlobal}–${windowEndGlobal}s (found ${coveringHosts.length})`);
          } else {
            const covering = coveringHosts[0].attrs;
            const cutawayRoot = cutawayRoots[0]?.attrs;
            if (!covering["data-composition-id"] || covering["data-composition-id"] !== cutawayRoot?.["data-composition-id"]) {
              fail(`${label}/${excursion.id}: external cutaway host data-composition-id must equal ${cutawayRoot?.["data-composition-id"] || "the cutaway root id"}`);
            }
            const hostWidth = attrNumber(covering, "data-width");
            const hostHeight = attrNumber(covering, "data-height");
            const cutawayWidth = attrNumber(cutawayRoot, "data-width");
            const cutawayHeight = attrNumber(cutawayRoot, "data-height");
            if (!positive(hostWidth) || !positive(hostHeight) || !positive(cutawayWidth) || !positive(cutawayHeight)
              || hostWidth !== cutawayWidth || hostHeight !== cutawayHeight) {
              fail(`${label}/${excursion.id}: external cutaway root and covering host need matching finite positive data-width/data-height`);
            }
          }
          if (excursion.portalId && portalById.has(excursion.portalId)) {
            const targetId = portalById.get(excursion.portalId).targetCanvas;
            const childHosts = indexTags.filter((tag) => tag.attrs["data-hf-spatial-host"] === targetId);
            if (childHosts.length !== 1) fail(`${label}/${excursion.id}: portal target ${targetId} needs exactly one Spatial Canvas host`);
            else {
              const childStart = attrNumber(childHosts[0].attrs, "data-start");
              const childDuration = attrNumber(childHosts[0].attrs, "data-duration");
              if (!finite(childStart) || !positive(childDuration)
                || Math.abs(childStart - windowStartGlobal) > 1e-6
                || Math.abs(childDuration - excursion.duration) > 1e-6) {
                fail(`${label}/${excursion.id}: portal target host must exactly match excursion window ${windowStartGlobal}–${windowEndGlobal}s`);
              }
            }
          }
        }
      }
    }
    for (const [portalId, uses] of portalUseCount) {
      if (uses !== 1) fail(`${label}/${portalId}: every declared portal must be used by exactly one excursion (found ${uses})`);
    }
  }
}

for (const portal of portalRefs) if (!canvasIds.has(portal.target)) fail(`${portal.label}: unknown targetCanvas ${portal.target}`);
for (const key of semanticMarkerOccurrences.keys()) if (!declaredSemanticMarkers.has(key)) fail(`orphan Spatial Canvas semantic marker ${key} has no manifest entry`);
for (const key of excursionMarkerOccurrences.keys()) if (!declaredExcursionMarkers.has(key)) fail(`orphan Spatial Canvas excursion marker ${key} has no manifest entry`);

for (const markerId of markerIds) if (!canvasIds.has(markerId)) fail(`orphan Spatial Canvas marker id ${markerId} has no manifest entry`);
for (const canvasId of canvasIds) if (!markerIds.has(canvasId)) fail(`manifest canvas ${canvasId} has no linked HTML marker`);

finish();

function finish(note = "") {
  const result = { ok: errors.length === 0, skipped: note.includes("skipped"), note, errors, warnings };
  if (JSON_MODE) console.log(JSON.stringify(result, null, 2));
  else {
    console.log("\n  SPATIAL CANVAS CHECK\n");
    if (note) console.log(`  ${result.ok ? "✓" : "✗"} ${note}`);
    for (const message of warnings) console.log(`  ⚠ ${message}`);
    for (const message of errors) console.log(`  ✗ ${message}`);
    if (!note) console.log(`\n  ${errors.length ? "FAILED" : "passed"} · ${errors.length} error(s) · ${warnings.length} warning(s)`);
    console.log("");
  }
  process.exit(errors.length ? 1 : 0);
}
