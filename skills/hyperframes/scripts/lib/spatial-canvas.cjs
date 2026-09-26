"use strict";

const fs = require("node:fs");
const path = require("node:path");

function stripHtmlComments(source) {
  return String(source).replace(/<!--[\s\S]*?(?:-->|$)/g, "");
}

const rawTextContainerTags = ["script", "style", "textarea", "title", "iframe", "xmp", "noembed", "noframes", "noscript"];
const inertContainerTags = new Set(["template", "plaintext", ...rawTextContainerTags]);
function stripInertRawText(source) {
  let cleaned = stripHtmlComments(source);
  for (const tag of rawTextContainerTags) {
    cleaned = cleaned.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?(?:<\\/${tag}\\s*>|$)`, "gi"), "");
  }
  return cleaned.replace(/<plaintext\b[^>]*>[\s\S]*$/i, "");
}

function parseAttrs(source) {
  const attrs = {};
  for (const match of String(source).matchAll(/([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (!Object.hasOwn(attrs, name)) attrs[name] = value;
  }
  return attrs;
}

function portable(value) {
  const raw = String(value || "").replace(/\\/g, "/");
  if (!raw) return "";
  const normalized = path.posix.normalize(raw.replace(/^(\.\/)+/, ""));
  return normalized === "." ? "" : normalized;
}

function attrNumber(attrs, name) {
  const raw = attrs?.[name];
  return typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
}

function htmlTags(source) {
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

function spatialHostStart(source, id, scope, composition) {
  const tags = htmlTags(source);
  const live = (tag) => {
    for (let current = tag; current; current = current.parent) if (inertContainerTags.has(current.name)) return false;
    return true;
  };
  const roots = tags.filter((tag) => live(tag) && tag.attrs["data-composition-id"]
    && (tag.parent == null || tag.parent.name === "body"));
  const hosts = tags.filter((tag) => live(tag) && tag.attrs["data-hf-spatial-host"] === id);
  if (hosts.length > 1) throw new Error(`duplicate data-hf-spatial-host="${id}" markers in index.html`);
  if (hosts.length === 1) {
    if (roots.length !== 1 || hosts[0].parent !== roots[0]) throw new Error(`Spatial Canvas host ${id} must be a direct child of the top-level index composition root`);
    const start = attrNumber(hosts[0].attrs, "data-start");
    if (!Number.isFinite(start) || start < 0) throw new Error(`invalid data-start on Spatial Canvas host ${id}`);
    const track = attrNumber(hosts[0].attrs, "data-track-index");
    if (!Number.isFinite(track)) throw new Error(`invalid data-track-index on Spatial Canvas host ${id}`);
    return start;
  }
  if (scope === "scene" && portable(composition) === "index.html") return 0;
  throw new Error(`no data-hf-spatial-host="${id}" found in index.html`);
}

function spatialReviewTimes(root) {
  const planPath = path.join(root, "SPATIAL_CANVAS.json");
  if (!fs.existsSync(planPath)) throw new Error("--spatial requires SPATIAL_CANVAS.json");
  let plan;
  try { plan = JSON.parse(fs.readFileSync(planPath, "utf8")); }
  catch (error) { throw new Error(`invalid SPATIAL_CANVAS.json: ${error.message}`); }
  if (!plan || typeof plan !== "object" || !Array.isArray(plan.canvases)) {
    throw new Error("invalid SPATIAL_CANVAS.json: root must contain canvases[]");
  }
  const indexPath = path.join(root, "index.html");
  const indexSource = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : "";
  const times = [];
  for (const canvas of plan.canvases) {
    if (!canvas || typeof canvas !== "object") throw new Error("invalid SPATIAL_CANVAS.json: canvas entry must be an object");
    if (typeof canvas.id !== "string" || !canvas.id) throw new Error("invalid SPATIAL_CANVAS.json: every canvas needs an id");
    const hostStart = spatialHostStart(indexSource, canvas.id, canvas.scope, canvas.composition);
    if (!Array.isArray(canvas.visits)) throw new Error(`invalid SPATIAL_CANVAS.json: canvas ${canvas.id} visits must be an array`);
    const excursions = canvas.excursions == null ? [] : canvas.excursions;
    if (!Array.isArray(excursions)) throw new Error(`invalid SPATIAL_CANVAS.json: canvas ${canvas.id} excursions must be an array`);
    for (const visit of canvas.visits) {
      if (!visit || typeof visit !== "object") throw new Error(`invalid SPATIAL_CANVAS.json: canvas ${canvas.id} visit entry must be an object`);
      if (!Number.isFinite(visit.reviewAt) || visit.reviewAt < 0) throw new Error(`invalid SPATIAL_CANVAS.json: canvas ${canvas.id}/${visit.id || "visit"} reviewAt must be finite and non-negative`);
      times.push(Number((hostStart + visit.reviewAt).toFixed(6)));
    }
    for (const excursion of excursions) {
      if (!excursion || typeof excursion !== "object") throw new Error(`invalid SPATIAL_CANVAS.json: canvas ${canvas.id} excursion entry must be an object`);
      if (!Number.isFinite(excursion.reviewAt) || excursion.reviewAt < 0) throw new Error(`invalid SPATIAL_CANVAS.json: canvas ${canvas.id}/${excursion.id || "excursion"} reviewAt must be finite and non-negative`);
      times.push(Number((hostStart + excursion.reviewAt).toFixed(6)));
    }
  }
  if (!times.length) throw new Error("SPATIAL_CANVAS.json contains no finite visit reviewAt times");
  return [...new Set(times)].sort((a, b) => a - b);
}

module.exports = { htmlTags, parseAttrs, portable, spatialHostStart, spatialReviewTimes, stripHtmlComments };
