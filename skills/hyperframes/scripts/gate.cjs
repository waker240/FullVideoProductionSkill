// scripts/gate.cjs — the AMBITION gate (Phase 7.5, before "done").
//
// check.cjs validates CORRECTNESS (determinism, layout, audio). This validates
// AMBITION — the two phases a fast agent skips under momentum (asset foundry +
// audit loops) and the visual-register floor that separates cinema from slides.
// It does NOT re-judge taste; it enforces that the work HAPPENED (or was
// consciously, loggably declined) so "0 errors" can never again mean "flat".
//
//   node scripts/gate.cjs            # report; exits non-zero if a hard gate fails
//   node scripts/gate.cjs --json     # machine-readable
//
// Artistic omissions and missing review evidence can be WAIVED with a one-line
// reason in DIRECTION.md. Admissions, malformed manifests, unsafe paths, stale
// timing hashes, and broken media wiring are structural and never waivable.
"use strict";
const crypto = require("node:crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { parseFastAdmission } = require("./lib/fast-passages.cjs");
const rootArgIndex = process.argv.indexOf("--root");
if (rootArgIndex >= 0 && (!process.argv[rootArgIndex + 1] || process.argv[rootArgIndex + 1].startsWith("-"))) {
  console.error("gate: --root requires a project path");
  process.exit(2);
}
const ROOT = rootArgIndex >= 0 ? path.resolve(process.cwd(), process.argv[rootArgIndex + 1]) : path.resolve(__dirname, "..");
const onlyArgIndex = process.argv.indexOf("--only");
if (onlyArgIndex >= 0 && (!process.argv[onlyArgIndex + 1] || process.argv[onlyArgIndex + 1].startsWith("-"))) {
  console.error("gate: --only requires a gate id");
  process.exit(2);
}
const ONLY = onlyArgIndex >= 0 ? process.argv[onlyArgIndex + 1] : null;
const rd = (p) => { try { return fs.readFileSync(path.join(ROOT, p), "utf8"); } catch { return null; } };
const ls = (p) => { try { return fs.readdirSync(path.join(ROOT, p)); } catch { return []; } };
const walkFiles = (rel) => {
  const abs = path.join(ROOT, rel);
  try {
    return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
      const child = path.join(rel, entry.name);
      return entry.isDirectory() ? walkFiles(child) : entry.isFile() ? [child] : [];
    });
  } catch { return []; }
};
const JSON_MODE = process.argv.includes("--json");
const htmlRawTextContainerTags = ["script", "style", "textarea", "title", "iframe", "xmp", "noembed", "noframes", "noscript"];
const htmlInertContainerTags = new Set(["template", "plaintext", ...htmlRawTextContainerTags]);

// Control files can change admission, strictness, topology, and review evidence.
// Inspect them physically before reading so a symlink cannot inject state from
// outside the project (and a dangling entry cannot masquerade as "absent").
const controlErrors = [];
function controlText(relative) {
  const state = inspectRegularProjectFile(path.join(ROOT, relative), relative);
  if (!state.exists) return { state, text: null };
  if (!state.ok) {
    controlErrors.push(state.error);
    return { state, text: null };
  }
  try { return { state, text: fs.readFileSync(state.physical, "utf8") }; }
  catch (error) {
    controlErrors.push(`${relative} cannot be read safely: ${error.message}`);
    return { state, text: null };
  }
}

const scaffoldControl = controlText(".hyperframes-scaffold.json");
const scaffoldExists = scaffoldControl.state.exists;
const scaffoldManifest = scaffoldControl.state.ok && scaffoldControl.text != null
  ? readJsonText(scaffoldControl.text)
  : null;
const scaffoldPathInvalid = scaffoldExists && !scaffoldControl.state.ok;
const scaffoldRecognized = scaffoldManifest && typeof scaffoldManifest === "object" && !Array.isArray(scaffoldManifest)
  && scaffoldManifest.schemaVersion === 2
  && scaffoldManifest.provider === "fish"
  && Array.isArray(scaffoldManifest.files)
  && scaffoldManifest.files.length > 0
  && scaffoldManifest.files.every((entry) => entry && typeof entry === "object"
    && typeof entry.target === "string" && entry.target.length > 0
    && typeof entry.source === "string" && entry.source.length > 0
    && typeof entry.managed === "boolean");
const scaffoldShapeInvalid = scaffoldExists
  && !scaffoldPathInvalid
  && !scaffoldRecognized;
const scaffoldContractVersion = scaffoldManifest?.ambitionContractVersion;
const scaffoldVersionInvalid = scaffoldExists && !scaffoldShapeInvalid
  && !scaffoldPathInvalid
  && Object.hasOwn(scaffoldManifest, "ambitionContractVersion")
  && (!Number.isInteger(scaffoldContractVersion) || scaffoldContractVersion <= 0);
const SCAFFOLD_ERROR = scaffoldPathInvalid
  ? scaffoldControl.state.error
  : scaffoldShapeInvalid
    ? ".hyperframes-scaffold.json is not a recognized Fish scaffold manifest (schemaVersion 2 with provider fish and nonempty managed file records)"
    : scaffoldVersionInvalid
      ? ".hyperframes-scaffold.json ambitionContractVersion must be a positive integer when present"
      : null;
if (SCAFFOLD_ERROR && !controlErrors.includes(SCAFFOLD_ERROR)) controlErrors.push(SCAFFOLD_ERROR);
const STRICT = process.argv.includes("--strict") || Boolean(SCAFFOLD_ERROR)
  || (Number.isInteger(scaffoldContractVersion) && scaffoldContractVersion >= 2);

// ── DIRECTION.md is the director's log: it carries the register declaration,
//    the anchor-beat direction notes, the audit-loop scores, and any waivers.
//    Its existence + required sections ARE the "you engaged the doctrine" proof.
const directionControl = controlText("DIRECTION.md");
const designControl = controlText("DESIGN.md");
const indexControl = controlText("index.html");
const spatialPlanControl = controlText("SPATIAL_CANVAS.json");
const fastManifestControl = controlText("FAST_PASSAGES.json");
const direction = visibleMarkdown(directionControl.text || "");
const design = visibleMarkdown(designControl.text || "");
const waivers = {};
for (const line of direction.split(/\r?\n/)) {
  const match = line.match(/^WAIVER\s*[:·]\s*([a-z_]+)\s*[—-]\s*(.+)$/i);
  if (match && useful(match[2])) waivers[match[1].trim().toLowerCase()] = match[2].trim();
}

const results = [];
function gate(id, ok, detail, fix, { waivable = true } = {}) {
  const controlFailure = controlErrors.length > 0;
  const effectiveOk = controlFailure ? false : ok;
  const effectiveWaivable = controlFailure ? false : waivable;
  const waived = !effectiveOk && effectiveWaivable && waivers[id.toLowerCase()];
  results.push({
    id, status: waived ? "waived" : effectiveOk ? "pass" : "fail",
    detail: controlFailure ? `${[...new Set(controlErrors)].slice(0, 3).join("; ")}; ${detail}` : detail,
    fix, waiver: waived || null, waivable: Boolean(effectiveWaivable),
  });
}
function tableCells(line) {
  if (!/^\s*\|/.test(line)) return [];
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}
function filledCells(cells, count) {
  return cells.length >= count && cells.slice(0, count).every((cell) => cell
    && !/[<>]/.test(cell)
    && !/^[-:]+$/.test(cell)
    && !/^(?:…|\.\.\.)$/.test(cell)
    && !/\b(todo|tbd|placeholder)\b/i.test(cell));
}
function substantiveReviewRow(cells, count) {
  if (!filledCells(cells, count)) return false;
  if (!cells.slice(1, count - 1).every((cell) => useful(cell))) return false;
  const action = cells[count - 1].match(/^\s*(PROTECT|POLISH|REBUILD)\s*(?:→|->)\s*(.+)$/i);
  return Boolean(action && useful(action[2]));
}
const SFX_WINDOW_TOLERANCE_SEC = 0.001;
function exactGlobalWindow(value) {
  const text = String(value || "");
  if (/\b(?:about|approx(?:imately)?|around|roughly)\b|[~≈]/i.test(text)) return null;
  const matches = [...text.matchAll(/(?:^|[^\d.])(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)\s*s\b/gi)];
  if (matches.length !== 1) return null;
  const start = Number(matches[0][1]);
  const end = Number(matches[0][2]);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) return null;
  return { start, end, duration: end - start };
}
function sectionFor(pattern) {
  return design.match(new RegExp(`##\\s*${pattern}[\\s\\S]*?(?=\\n##\\s|$)`, "i"))?.[0] || "";
}
function sectionHeadingCount(pattern) {
  return [...design.matchAll(new RegExp(`^\\s*##\\s*${pattern}\\s*#*\\s*$`, "gim"))].length;
}
function directionSectionFor(pattern) {
  return direction.match(new RegExp(`##\\s*${pattern}[\\s\\S]*?(?=\\n##\\s|$)`, "i"))?.[0] || "";
}
function useful(value) {
  return typeof value === "string" && value.trim().length >= 8
    && !/[<>]/.test(value) && !/\b(?:todo|tbd|placeholder)\b/i.test(value);
}
function admission(section, label = "Decision", allowed = ["PASS", "USE"]) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Canonical Markdown is `**Decision:** PASS`: the colon lives inside the
  // bold span, so consume the optional closing `**` after the colon.
  const lines = [...section.matchAll(new RegExp(`^\\s*(?:\\*\\*)?${escaped}\\s*:(?:\\*\\*)?\\s*(.+)$`, "gim"))];
  const line = lines.length === 1 ? lines[0][1] : "";
  const choicePattern = allowed.map((choice) => choice.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const selected = line.match(new RegExp(`^\\s*(?:\\*\\*)?\\s*(${choicePattern})\\b`, "i"));
  const tail = selected ? line.slice(selected[0].length) : "";
  const otherChoices = selected ? allowed.filter((choice) => choice.toUpperCase() !== selected[1].toUpperCase()) : [];
  const afterDecision = lines.length === 1 ? section.slice(lines[0].index + lines[0][0].length) : "";
  const followingWhy = afterDecision.match(/^\s*\r?\n\s*(?:\*\*)?Why\s*:(?:\*\*)?\s*([^\r\n]+)/i)?.[1] || "";
  const inlineWhy = line.match(/\*\*Why:\*\*\s*(.+)$/i)?.[1] || "";
  const rationaleText = inlineWhy || followingWhy;
  const controlText = `${line}\n${followingWhy}`;
  const ambiguous = otherChoices.some((choice) => {
    // Uppercase tokens are option markers anywhere in this decision/rationale.
    // Lowercase prose remains legal ("We use steady pacing"), while explicit
    // delimiter forms such as `or use`, `[USE]`, `+ USE`, and `→ USE` fail.
    const explicitMarker = new RegExp(`\\b${choice}\\b`).test(controlText);
    const unresolvedSyntax = new RegExp(
      `(?:^|[\\[({|/+→]|\\b(?:or|and)\\b|[,;:—–-])\\s*[\\]})*_~]*\\s*${choice}\\b`, "i").test(tail);
    const whyStartsAsChoice = new RegExp(
      `^\\s*[\\[({*_~]*${choice}\\b\\s*(?:[\\]})*_~]*\\s*)?(?:[—–:;-]|$|because\\b|(?:is|was|remains?|keeps?|preserves?|provides?|allows?|means?|offers?|would|will|can|should|needs?|wins?|works?|fits?)\\b)`,
      "i",
    ).test(rationaleText);
    return explicitMarker || unresolvedSyntax || whyStartsAsChoice;
  });
  const why = rationaleText
    || tail.replace(/^\s*[.·:;—–-]+\s*/, "");
  const value = selected && !ambiguous && !/[<>]/.test(line) ? selected[1].toUpperCase() : null;
  return { value, why: useful(why) ? why.trim() : null, line, count: lines.length };
}
function parseAttrs(source) {
  const attrs = {};
  for (const match of String(source).matchAll(/([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = match[1].toLowerCase();
    if (!Object.hasOwn(attrs, name)) attrs[name] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}
function stripHtmlInertRawText(source) {
  let cleaned = String(source || "").replace(/<!--[\s\S]*?(?:-->|$)/g, "");
  for (const tag of htmlRawTextContainerTags) {
    cleaned = cleaned.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?(?:<\\/${tag}\\s*>|$)`, "gi"), "");
  }
  return cleaned.replace(/<plaintext\b[^>]*>[\s\S]*$/i, "");
}
function isLiveHtmlTag(record) {
  for (let current = record; current; current = current.parent) {
    if (htmlInertContainerTags.has(current.name)) return false;
  }
  return Boolean(record);
}
function htmlTags(source) {
  const cleaned = stripHtmlInertRawText(source);
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
function visibleMarkdown(value) {
  const uncommented = stripHtmlInertRawText(value)
    .replace(/<!--[\s\S]*?(?:-->|$)/g, "")
    .replace(/<(pre|code|template)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, "");
  let fence = null;
  return uncommented.split(/\r?\n/).map((line) => {
    if (fence) {
      const closing = line.match(/^ {0,3}(`{3,}|~{3,})[\t ]*$/);
      if (closing && closing[1][0] === fence.character && closing[1].length >= fence.length) fence = null;
      return "";
    }
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})(?:[^\r\n]*)$/);
    if (opening) {
      fence = { character: opening[1][0], length: opening[1].length };
      return "";
    }
    if (/^(?: {4}|\t)/.test(line)) return "";
    return line;
  }).join("\n");
}
function inspectRegularProjectFile(file, label) {
  const lexicalRoot = path.resolve(ROOT);
  const absolute = path.resolve(file);
  const lexicalRelative = path.relative(lexicalRoot, absolute);
  if (lexicalRelative === ".." || lexicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(lexicalRelative)) {
    return { exists: true, ok: false, error: `${label} lies outside the project` };
  }
  let stat;
  try { stat = fs.lstatSync(absolute); }
  catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return { exists: false, ok: false, error: null };
    return { exists: true, ok: false, error: `${label} cannot be inspected safely: ${error.message}` };
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    return { exists: true, ok: false, error: `${label} must be a regular non-symlink file physically contained in the project` };
  }
  try {
    const physicalRoot = fs.realpathSync(lexicalRoot);
    const physical = fs.realpathSync(absolute);
    const physicalRelative = path.relative(physicalRoot, physical);
    if (physicalRelative === ".." || physicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(physicalRelative)) {
      return { exists: true, ok: false, error: `${label} resolves outside the project` };
    }
    return { exists: true, ok: true, physical };
  } catch (error) {
    return { exists: true, ok: false, error: `${label} cannot be resolved safely: ${error.message}` };
  }
}
function safeLocalPath(value) {
  const raw = String(value || "").replace(/\\/g, "/").split(/[?#]/)[0];
  if (!raw || path.posix.isAbsolute(raw) || /^[A-Za-z]:\//.test(raw) || /^[a-z]+:/i.test(raw) || raw.split("/").includes("..")) return null;
  const normalized = path.posix.normalize(raw.replace(/^\.\//, ""));
  const absolute = path.resolve(ROOT, normalized);
  const relative = path.relative(ROOT, absolute);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return null;
  return { relative: normalized, absolute };
}
const audioValidationCache = new Map();
function validateAudioPath(value) {
  const resolved = safeLocalPath(value);
  if (!resolved) return { ok: false, reason: `unsafe or non-local src ${JSON.stringify(value)}` };
  if (resolved.relative.split("/").some((segment) => segment.toLowerCase() === "mediareview")) {
    return { ok: false, reason: `${resolved.relative} points into the review catalog; resolve and freeze it into the project before rendering` };
  }
  if (audioValidationCache.has(resolved.relative)) return audioValidationCache.get(resolved.relative);
  const state = inspectRegularProjectFile(resolved.absolute, resolved.relative);
  if (!state.exists) {
    const result = { ok: false, reason: `missing local file ${resolved.relative}` };
    audioValidationCache.set(resolved.relative, result);
    return result;
  }
  if (!state.ok) {
    const result = { ok: false, reason: state.error };
    audioValidationCache.set(resolved.relative, result);
    return result;
  }
  const probed = spawnSync("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name:format=duration", "-of", "json", state.physical], { encoding: "utf8", timeout: 5000 });
  if (probed.error || probed.status !== 0) {
    const result = { ok: false, reason: `${resolved.relative} is not decodable audio` };
    audioValidationCache.set(resolved.relative, result);
    return result;
  }
  try {
    const info = JSON.parse(probed.stdout || "{}");
    const duration = Number(info.format?.duration);
    if (!info.streams?.[0]?.codec_name || !Number.isFinite(duration) || duration <= 0) throw new Error("no positive audio stream");
    const result = { ok: true, path: resolved.relative, duration };
    audioValidationCache.set(resolved.relative, result);
    return result;
  } catch {
    const result = { ok: false, reason: `${resolved.relative} has no positive audio stream` };
    audioValidationCache.set(resolved.relative, result);
    return result;
  }
}
function concreteMetadata(value, minLength = 3) {
  if (typeof value !== "string" && typeof value !== "number") return false;
  const text = String(value).trim();
  return text.length >= minLength && !/[<>]/.test(text)
    && !/\b(?:todo|tbd|placeholder|pending|unknown)\b/i.test(text)
    && !/describe\s+completed/i.test(text);
}
function webUrl(value) {
  return concreteMetadata(value, 8) && /^https?:\/\/[^\s]+$/i.test(String(value).trim());
}
function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
function loadMediaManifest() {
  const manifestPath = path.join(ROOT, ".media", "manifest.jsonl");
  const state = inspectRegularProjectFile(manifestPath, ".media/manifest.jsonl");
  if (!state.exists) return { records: [], errors: ["missing .media/manifest.jsonl"] };
  if (!state.ok) return { records: [], errors: [state.error] };
  try {
    const records = [];
    const errors = [];
    for (const [index, line] of fs.readFileSync(state.physical, "utf8").split(/\r?\n/).entries()) {
      if (!line.trim()) continue;
      try {
        const record = JSON.parse(line);
        if (!record || typeof record !== "object" || Array.isArray(record)) throw new Error("record must be an object");
        records.push(record);
      } catch (error) {
        errors.push(`.media/manifest.jsonl line ${index + 1} is invalid: ${error.message}`);
      }
    }
    if (!records.length && !errors.length) errors.push(".media/manifest.jsonl contains no records");
    return { records, errors };
  } catch (error) {
    return { records: [], errors: [`.media/manifest.jsonl cannot be read safely: ${error.message}`] };
  }
}
function manifestErrorsForAudio(src, type, manifestState) {
  if (!STRICT) return [];
  const resolved = safeLocalPath(src);
  if (!resolved) return [];
  if (manifestState.errors.length) return manifestState.errors.slice();
  const matches = manifestState.records.filter((record) => record.path === resolved.relative && record.type === type);
  if (!matches.length) return [`${resolved.relative} has no exact ${type} record in .media/manifest.jsonl`];
  const errors = [];
  for (const record of matches) {
    const provenance = record.provenance;
    if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
      errors.push(`${resolved.relative}: manifest provenance must be an object`);
      continue;
    }
    if (provenance.provider != null && provenance.provider !== "local") {
      errors.push(`${resolved.relative}: manifest names non-local provider ${JSON.stringify(provenance.provider)}`);
    }
    const currentLocal = provenance.origin === "local-file" && provenance.local === true;
    const legacyLocal = provenance.provider === "local" && provenance.adopted === true;
    if (!currentLocal && !legacyLocal) errors.push(`${resolved.relative}: manifest lacks trusted local provenance`);
    if (![provenance.license, provenance.rights, provenance.rights_marker, provenance.license_url, provenance.attribution]
      .some((value) => concreteMetadata(value))) {
      errors.push(`${resolved.relative}: manifest needs a substantive license/rights marker`);
    }
    const catalogRecord = /catalog/i.test(String(record.source || ""))
      || ["catalog_id", "expected_sha256", "source_id", "review_note"]
        .some((field) => Object.hasOwn(provenance, field));
    if (catalogRecord) {
      if (provenance.reviewed !== true) errors.push(`${resolved.relative}: catalog record must set reviewed:true`);
      if (!concreteMetadata(provenance.catalog_id, 5)) errors.push(`${resolved.relative}: catalog record needs catalog_id`);
      if (!concreteMetadata(provenance.source_id)) errors.push(`${resolved.relative}: catalog record needs source_id`);
      if (!webUrl(provenance.source_page)) errors.push(`${resolved.relative}: catalog record needs an absolute source_page URL`);
      if (!concreteMetadata(provenance.license)) errors.push(`${resolved.relative}: catalog record needs license`);
      if (!webUrl(provenance.license_url)) errors.push(`${resolved.relative}: catalog record needs an absolute license_url`);
      if (!concreteMetadata(provenance.review_note, 12)) errors.push(`${resolved.relative}: catalog record needs a substantive review_note`);
      const expected = String(provenance.expected_sha256 || "").toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(expected)) errors.push(`${resolved.relative}: catalog record needs expected_sha256`);
      else {
        const state = inspectRegularProjectFile(resolved.absolute, resolved.relative);
        if (!state.exists) errors.push(`${resolved.relative}: catalog hash cannot verify a missing local file`);
        else if (!state.ok) errors.push(`${resolved.relative}: catalog hash refused unsafe path: ${state.error}`);
        else {
          try {
            const actual = sha256File(state.physical);
            if (actual !== expected) errors.push(`${resolved.relative}: catalog expected_sha256 does not match actual bytes`);
          } catch (error) {
            errors.push(`${resolved.relative}: catalog hash could not be verified: ${error.message}`);
          }
        }
      }
    }
  }
  return errors;
}
function readJsonText(source) {
  try { return JSON.parse(source); }
  catch { return null; }
}
function runJsonChecker(script, args = []) {
  if (!fs.existsSync(script)) return { ok: false, errors: [`missing managed checker ${path.basename(script)}`] };
  const child = spawnSync(process.execPath, [script, "--root", ROOT, "--json", ...args], { cwd: ROOT, encoding: "utf8", timeout: 15000 });
  try {
    const parsed = JSON.parse(child.stdout || "{}");
    if (child.status !== 0) parsed.ok = false;
    return parsed;
  } catch {
    return { ok: false, errors: [`${path.basename(script)} did not return valid JSON: ${(child.stderr || child.stdout || "unknown error").trim()}`] };
  }
}

// 1 — ASSET PROVENANCE: when generated imagery is used, prompts are on record.
//     Asset count is not an ambition proxy; a vector/canvas film may need none.
const assetDirs = ["assets/plates", "assets/cutouts", "assets/substrate", "assets/generated"];
const generatedAssets = assetDirs.flatMap(walkFiles).filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file));
const genCount = generatedAssets.length;
const prompts = rd("assets/PROMPTS.md") || "";
const missingPromptAssets = generatedAssets.filter((file) => {
  const normalized = file.replace(/\\/g, "/");
  return !prompts.includes(normalized) && !prompts.includes(path.basename(file));
});
gate("assets",
  missingPromptAssets.length === 0,
  `${genCount} generated raster asset(s); ${missingPromptAssets.length ? `${missingPromptAssets.length} missing prompt record(s)` : "provenance complete"}`,
  `Record every generated raster's path, purpose, size, and full prompt in assets/PROMPTS.md. Missing: ${missingPromptAssets.slice(0, 4).join(", ")}`);

// 2 — SEMANTIC-VISUAL FLOOR: at least one authored representation/mechanism
//     exists beyond unperformed layout. The toolbox is a menu, not a quota.
const indexSource = indexControl.text || "";
const mountedSceneFiles = [...indexSource.matchAll(/data-composition-src\s*=\s*["']([^"']+\.html)["']/gi)]
  .map((match) => match[1].replace(/\\/g, "/").replace(/^\.\//, ""))
  .filter((file) => file.startsWith("compositions/") && !/captions?|subtitles?/i.test(file));
const legacySceneFiles = ls("compositions").filter((f) => /^(?:a\d+)?s\d.*\.html$/i.test(f)).map((f) => `compositions/${f}`);
const sceneFiles = [...new Set([...mountedSceneFiles, ...legacySceneFiles])];
const scenesSrc = sceneFiles.map((f) => rd(f) || "").join("\n").replace(/<!--[\s\S]*?-->/g, "");
const liveIndexSource = indexSource.replace(/<!--[\s\S]*?-->/g, "");
const registers = {
  "generated-plate": /<img[^>]+(plates|cutouts|substrate)\//i.test(scenesSrc),
  "d3-dataviz": /d3(@|\.min|\.scale|\.select)/i.test(scenesSrc),
  "threejs-3d": /three[^"'<>\s]*\.js/i.test(scenesSrc)
    || /from\s*["']three["']/i.test(scenesSrc)
    || /window\.THREE\b|\bTHREE\s*\.|WebGLRenderer/.test(scenesSrc)
    || /getContext\(\s*["']webgl/i.test(scenesSrc),
  "recreated-document": /(scan|doc-?wrap|order\.png|dossier|newsprint)/i.test(scenesSrc),
  "duotone-cutout": /(duotone|cutouts\/|vox-|rim-light)/i.test(scenesSrc),
  "svg-mechanism": /<svg[\s\S]*<(path|rect|circle|line)/i.test(scenesSrc),
  "canvas-simulation": /<canvas\b|getContext\(\s*["']2d/i.test(scenesSrc),
  "spatial-canvas": /data-hf-spatial-canvas\s*=/i.test(scenesSrc) || /data-hf-spatial-canvas\s*=/i.test(liveIndexSource),
  "kinetic-type": /SplitText|per-char|ScrambleText/i.test(scenesSrc),
};
const activeRegisters = Object.entries(registers).filter(([, v]) => v).map(([k]) => k);
gate("registers",
  activeRegisters.length >= 1,
  `${activeRegisters.length} register(s): ${activeRegisters.join(", ") || "none detected"}`,
  "Build at least one semantic visual mechanism or authored artifact register; vary representation only when the argument needs it. A technique count cannot repair a scene with no state turn.");

// 2b — SPATIAL CANVAS: explicit admission → structural contract → rendered
//      route review. PASS is a directed choice, not silent non-consideration.
const spatialPlanExists = spatialPlanControl.state.exists;
const spatialPlanText = spatialPlanControl.text;
let spatialPlan = null;
let spatialPlanError = null;
if (spatialPlanExists) {
  if (!spatialPlanControl.state.ok) spatialPlanError = spatialPlanControl.state.error;
  else if (typeof spatialPlanText !== "string") spatialPlanError = "manifest cannot be read";
  else {
  try { spatialPlan = JSON.parse(spatialPlanText); }
  catch (error) { spatialPlanError = error.message; }
  }
}
const spatialDetected = registers["spatial-canvas"] || spatialPlanExists
  || /data-hf-spatial-(?:canvas|world|host|region|landmark|connector|portal)\s*=/i.test(`${liveIndexSource}\n${scenesSrc}`);
const spatialChoice = admission(sectionFor("Spatial[- ]Canvas admission"));
const spatialStructuralErrors = [];
if (SCAFFOLD_ERROR) spatialStructuralErrors.push(SCAFFOLD_ERROR);
if (STRICT && sectionHeadingCount("Spatial[- ]Canvas admission") !== 1) {
  spatialStructuralErrors.push("DESIGN.md must contain exactly one Spatial Canvas admission heading");
}
if (STRICT && (!spatialChoice.value || !spatialChoice.why)) {
  spatialStructuralErrors.push("DESIGN.md needs a filled Spatial Canvas PASS/USE decision and Why rationale");
}
if (spatialChoice.value === "PASS" && spatialDetected) {
  spatialStructuralErrors.push("DESIGN.md says Spatial Canvas PASS, but a manifest or live spatial marker exists");
}
if (spatialChoice.value === "USE" && !spatialDetected) {
  spatialStructuralErrors.push("DESIGN.md says Spatial Canvas USE, but SPATIAL_CANVAS.json/live markers are missing");
}
const spatialChecked = controlErrors.length
  ? { ok: false, errors: controlErrors.slice() }
  : runJsonChecker(path.join(__dirname, "check-spatial-canvas.cjs"));
if (!spatialChecked.ok) spatialStructuralErrors.push(...(spatialChecked.errors || ["Spatial Canvas structural checker failed"]));
const spatialSection = direction.match(/##\s*spatial[- ]canvas review[\s\S]*?(?=\n##\s|$)/i)?.[0] || "";
const plannedReviews = [];
let spatialRouteShapeValid = true;
if (Array.isArray(spatialPlan?.canvases)) {
  for (const canvas of spatialPlan.canvases) {
    const excursions = canvas?.excursions == null ? [] : canvas.excursions;
    if (!canvas || typeof canvas !== "object" || typeof canvas.id !== "string"
      || !Array.isArray(canvas.visits) || !Array.isArray(excursions)) {
      spatialRouteShapeValid = false;
      continue;
    }
    for (const visit of canvas.visits) {
      if (!visit || typeof visit !== "object" || typeof visit.id !== "string") spatialRouteShapeValid = false;
      else plannedReviews.push(`${canvas.id}:${visit.id}`);
    }
    for (const excursion of excursions) {
      if (!excursion || typeof excursion !== "object" || typeof excursion.id !== "string") spatialRouteShapeValid = false;
      else plannedReviews.push(`${canvas.id}:excursion-${excursion.id}`);
    }
  }
}
const spatialPlanShapeValid = Array.isArray(spatialPlan?.canvases) && spatialPlan.canvases.length > 0
  && spatialRouteShapeValid && plannedReviews.length >= 3;
const reviewedVisitKeys = new Set(spatialSection.split(/\r?\n/).map(tableCells)
  .filter((cells) => STRICT ? substantiveReviewRow(cells, 5) : filledCells(cells, 5))
  .filter((cells) => !(cells[0].trim().toLowerCase() === "canvas:visit"
    && /orientation.*landmark/i.test(cells[1])
    && /focal.*hierarchy/i.test(cells[2])
    && /spatial proof.*revision/i.test(cells[3])
    && cells[4].trim().toLowerCase() === "result"))
  .map((cells) => cells[0].replace(/^`+|`+$/g, "").trim())
  .filter((key) => /^[A-Za-z][\w-]*:[A-Za-z][\w-]*$/.test(key)));
const missingReviews = plannedReviews.filter((key) => !reviewedVisitKeys.has(key));
const spatialDirected = !spatialDetected || (!spatialPlanError
  && spatialPlanShapeValid
  && /orientation/i.test(spatialSection)
  && /spatial proof/i.test(spatialSection)
  && missingReviews.length === 0);
if (spatialStructuralErrors.length) {
  gate("spatial_canvas", false, spatialStructuralErrors.slice(0, 3).join("; "),
    "Repair the DESIGN admission/manifest/DOM ownership contract, then run `node scripts/check-spatial-canvas.cjs`.",
    { waivable: false });
} else {
  gate("spatial_canvas",
    spatialDirected,
    !spatialDetected ? `${spatialChoice.value || "legacy"} — no Spatial Canvas implementation`
      : spatialPlanError ? `invalid SPATIAL_CANVAS.json: ${spatialPlanError}`
        : !spatialPlanShapeValid ? "SPATIAL_CANVAS.json has no valid canvas route/review keys"
        : missingReviews.length ? `${missingReviews.length} route review row(s) missing: ${missingReviews.slice(0, 4).join(", ")}`
          : "USE — structure passes and every planned visit/excursion has direction-review evidence",
    "Run the manifest route with `node scripts/snap.cjs --spatial`; log one filled DIRECTION.md review row per visit (`<canvas-id>:<visit-id>`) and excursion (`<canvas-id>:excursion-<excursion-id>`), covering orientation, focal hierarchy, spatial proof/revision, and action taken.");
}

// 2c — FAST PASSAGES: an optional local intensity contrast with an exact
//      final-audio clock and a complete baseline→peak→release trajectory.
const fastDeclared = fastManifestControl.state.exists;
const fastManifestText = fastManifestControl.text;
const parsedFastAdmission = parseFastAdmission(design);
const fastChoice = {
  value: parsedFastAdmission.valid ? parsedFastAdmission.decision : null,
  why: parsedFastAdmission.valid ? parsedFastAdmission.rationale : null,
};
const fastStructuralErrors = [];
if (SCAFFOLD_ERROR) fastStructuralErrors.push(SCAFFOLD_ERROR);
if (!parsedFastAdmission.valid && (STRICT || parsedFastAdmission.section || fastDeclared)) {
  fastStructuralErrors.push(...parsedFastAdmission.errors);
}
if (fastChoice.value === "PASS" && fastDeclared) {
  fastStructuralErrors.push("DESIGN.md says fast passages PASS, but FAST_PASSAGES.json exists");
}
if (fastChoice.value === "USE" && !fastDeclared) {
  fastStructuralErrors.push("DESIGN.md says fast passages USE, but FAST_PASSAGES.json is missing");
}
let fastPlan = null;
if (fastDeclared) {
  if (!fastManifestControl.state.ok) fastStructuralErrors.push(fastManifestControl.state.error);
  else if (typeof fastManifestText !== "string") fastStructuralErrors.push("FAST_PASSAGES.json cannot be read");
  else {
    try { fastPlan = JSON.parse(fastManifestText); }
    catch (error) { fastStructuralErrors.push(`invalid FAST_PASSAGES.json: ${error.message}`); }
  }
}
const fastChecked = controlErrors.length
  ? { ok: false, errors: controlErrors.slice() }
  : runJsonChecker(path.join(__dirname, "check-fast-passages.cjs"), STRICT ? ["--strict"] : []);
if (!fastChecked.ok) fastStructuralErrors.push(...(fastChecked.errors || ["fast-passage structural checker failed"]));
const fastIds = Array.isArray(fastPlan?.passages)
  ? fastPlan.passages.map((passage) => passage?.id).filter((id) => typeof id === "string")
  : [];
const fastReviewSection = directionSectionFor("Fast-passage trajectory review");
const fastReviewed = new Set(fastReviewSection.split(/\r?\n/).map(tableCells)
  .filter((cells) => STRICT ? substantiveReviewRow(cells, 6) : filledCells(cells, 6))
  .map((cells) => cells[0].replace(/^`+|`+$/g, "").trim())
  .filter((id) => /^[A-Za-z][\w-]*$/.test(id) && id.toLowerCase() !== "passage-id"));
const missingFastReviews = fastIds.filter((id) => !fastReviewed.has(id));
if (fastStructuralErrors.length) {
  gate("fast_passages", false, [...new Set(fastStructuralErrors)].slice(0, 3).join("; "),
    "Repair the admission and FAST_PASSAGES.json clock/arc/owner contract, then run `npm run fast:check`.",
    { waivable: false });
} else {
  gate("fast_passages", !fastDeclared || missingFastReviews.length === 0,
    !fastDeclared ? `${fastChoice.value || "legacy"} — no fast passage implementation`
      : missingFastReviews.length ? `${missingFastReviews.length} final-audio trajectory review row(s) missing: ${missingFastReviews.slice(0, 4).join(", ")}`
        : `USE — ${fastIds.length} clock-locked passage(s), structurally valid and reviewed`,
    "Watch every manifest passage with final audio from lead-in through release; add its exact id to DIRECTION.md's Fast-passage trajectory review table.");
}

// 3 — ANCHOR-BEAT DIRECTION PASS: the cold open, thesis, and close each got a
//     documented Effort-Protocol pass (Gaze/Dream/Create or an AWE/EASY call).
const dirLC = direction.toLowerCase();
const hasAnchorNotes = /(effort protocol|awe mode|\bawe\b|gaze|dream|create|120%|signature move)/.test(dirLC)
  && (direction.match(/^\s*(#{1,4}\s*)?(s0|s\d+|cold open|thesis|close|hook)\b/gim) || []).length >= 2;
gate("direction",
  hasAnchorNotes,
  hasAnchorNotes ? "DIRECTION.md logs anchor-beat direction" : "no anchor-beat direction notes found",
  "Run the cinematic-direction Effort Protocol on the cold open / thesis / close; log each in DIRECTION.md (the signature move + the 120% element + AWE/EASY per anchor).");

// 4 — FIRST THREE SECONDS: the opening is mapped to the words actually spoken,
//     with visible state changes and a velocity receiver into the next shot.
const openingSection = direction.match(/##\s*first[- ]three[- ]second proof[\s\S]*?(?=\n##\s|$)/i)?.[0] || "";
const openingRows = openingSection.split(/\r?\n/).map(tableCells)
  .filter((cells) => filledCells(cells, 4) && !/^narration\b/i.test(cells[0]));
const hasOpeningProof = /narration cue/i.test(openingSection)
  && /visible action/i.test(openingSection)
  && /exit vector/i.test(openingSection)
  && openingRows.length >= 1;
gate("opening",
  hasOpeningProof,
  hasOpeningProof ? "first-three-second narration/action/handoff map logged" : "cold-open semantic map missing or still placeholder-only",
  "Map 0.00–3.00 in DIRECTION.md: exact narration cue → visible action/state change → dominant focus → outgoing velocity receiver. Do not visualize a later thesis early.");

// 5 — TRUE-3D ADMISSION: if Three/WebGL is present, the director records why
//     depth is causal and how hero + world quality beats the 2D/2.5D fallback.
const threeDetected = registers["threejs-3d"];
const threeSection = direction.match(/##\s*3d admission[\s\S]*?(?=\n##\s|$)/i)?.[0] || "";
const filledThreeRows = threeSection.split(/\r?\n/).map(tableCells)
  .filter((cells) => filledCells(cells, 5) && !/^scene\b/i.test(cells[0]));
const threeAdmitted = !threeDetected || (/causal spatial need/i.test(threeSection)
  && /why 2d\/2\.5d is weaker/i.test(threeSection)
  && filledThreeRows.length >= 1);
gate("three",
  threeAdmitted,
  !threeDetected ? "no true Three.js/WebGL scene detected" : threeAdmitted ? "true-3D admission row logged" : "true 3D detected without a filled quality/admission row",
  "Before using Three.js, fill DIRECTION.md's 3D admission row: causal depth, authored hero assets, coherent world/material/light/camera, and why 2D/2.5D is weaker. Otherwise step down.");

// 6 — AUDIT LOOPS: ≥2 passes logged with per-scene scores + what was redesigned.
const auditHeads = [...direction.matchAll(/^###?\s*audit\s*(?:pass|loop)\s*\d[^\n]*$/gim)];
let auditPassesWithUnassessedSound = 0;
const auditPasses = auditHeads.filter((head, index) => {
  const section = direction.slice(head.index, auditHeads[index + 1]?.index ?? direction.length);
  // A technical/visual audit cannot invent auditory perception. Require an
  // explicit per-pass disclosure when only the Sound score is unavailable.
  const soundDisclosure = section.replace(/\*\*/g, "").match(
    /^Subjective sound:\s*UNASSESSED\s*[—–-]\s*(.+)$/im);
  const soundUnassessed = Boolean(soundDisclosure && useful(soundDisclosure[1]));
  const scoredRows = section.split(/\r?\n/).map(tableCells).filter((cells) =>
    cells.length >= 8
    && cells[0] && !/[<>…]/.test(cells[0])
    && cells.slice(1, 6).every((cell) => /^[1-5]$/.test(cell))
    && (/^[1-5]$/.test(cells[6]) || (soundUnassessed && /^(?:null|unassessed)$/i.test(cells[6])))
    && cells[7] && !/[<>…]/.test(cells[7]));
  const hasProof = section.split(/\r?\n/).some((line) => {
    if (!/(redesigned this pass|verdict)\s*:/i.test(line)) return false;
    const value = line.replace(/^.*?:/, "").replace(/\*/g, "").trim();
    return value.length >= 8 && !/[<>…]/.test(value) && !/\b(todo|tbd)\b/i.test(value);
  });
  const complete = scoredRows.length > 0 && hasProof;
  if (complete && scoredRows.some((cells) => !/^[1-5]$/.test(cells[6]))) auditPassesWithUnassessedSound++;
  return complete;
}).length;
gate("audit",
  auditPasses >= 2,
  `${auditPasses} audit pass(es) logged${auditPassesWithUnassessedSound ? `; ${auditPassesWithUnassessedSound} with subjective Sound UNASSESSED (not listening approval)` : ""}`,
  "Run ≥2 audit→elevation loops; log per-scene scores and repairs. If Sound is null/UNASSESSED, each pass needs `Subjective sound: UNASSESSED — <actual limitation and technical evidence>`. This gate checks logging, not full-film coverage or listening quality.");

// 7 — SOUND PLAN: discover is read-only; each selected file must be frozen,
//     globally wired, semantically earned, rights-recorded, and mix-reviewed.
const soundSection = sectionFor("Sound palette");
const bgmChoice = admission(soundSection, "BGM decision", ["USE", "SILENCE"]);
const sfxChoice = admission(soundSection, "SFX decision", ["PASS", "USE"]);
const cueRows = soundSection.split(/\r?\n/).map(tableCells)
  .filter((cells) => filledCells(cells, 5))
  .filter((cells) => !/^cue id$/i.test(cells[0]))
  .map((cells) => ({ id: cells[0].replace(/^`+|`+$/g, "").trim(), cells }));
const executableIndexSource = liveIndexSource
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^[\t ]*\/\/.*$/gm, "");
const indexTagRecords = htmlTags(indexSource);
const indexCompositionRoots = indexTagRecords.filter((tag) => isLiveHtmlTag(tag) && tag.attrs["data-composition-id"]
  && (tag.parent == null || tag.parent.name === "body"));
const liveCompositionRoot = indexCompositionRoots.length === 1 ? indexCompositionRoots[0] : null;
const audioTags = indexTagRecords
  .filter((tag) => liveCompositionRoot && isLiveHtmlTag(tag) && tag.name === "audio" && tag.parent === liveCompositionRoot)
  .map((tag) => tag.attrs);
const topLevelCompositionDuration = Number(liveCompositionRoot?.attrs["data-duration"]);
const tagIdentity = (attrs) => attrs.id || attrs["data-hf-id"] || "";
function identityDescriptor(value) {
  const identity = String(value || "").trim();
  const classes = [];
  if (/(?:^|[-_])narration(?:[-_]|$)/i.test(identity)) classes.push("narration");
  if (/(?:^|[-_])bgm(?:[-_]|$)/i.test(identity)) classes.push("bgm");
  const cue = cueRows.find((row) => identity === row.id
    || new RegExp(`(?:^|[-_])sfx[-_]${row.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i").test(identity));
  if (/(?:^|[-_])sfx(?:[-_]|$)/i.test(identity) || cue) classes.push("sfx");
  return { classes: [...new Set(classes)], cue: cue?.id || null };
}
const classifiedAudio = audioTags.map((attrs) => {
  const id = typeof attrs.id === "string" && attrs.id.trim() ? attrs.id.trim() : null;
  const hfId = typeof attrs["data-hf-id"] === "string" && attrs["data-hf-id"].trim() ? attrs["data-hf-id"].trim() : null;
  const primary = identityDescriptor(id || hfId);
  const secondary = id && hfId ? identityDescriptor(hfId) : null;
  const consistencyErrors = [];
  if (id && hfId && id !== hfId) {
    const sameSingleClass = primary.classes.length === 1 && secondary.classes.length === 1
      && primary.classes[0] === secondary.classes[0];
    const sameCue = primary.classes[0] !== "sfx" || (primary.cue && primary.cue === secondary.cue);
    if (!sameSingleClass || !sameCue) {
      consistencyErrors.push(`direct-root audio id ${JSON.stringify(id)} conflicts with data-hf-id ${JSON.stringify(hfId)}`);
    }
  }
  const source = String(attrs.src || "").replace(/\\/g, "/").split(/[?#]/)[0];
  const sourceClasses = [];
  if (/(?:^|\/)voice\//i.test(source)) sourceClasses.push("narration");
  if (/(?:^|\/)bgm\//i.test(source)) sourceClasses.push("bgm");
  if (/(?:^|\/)sfx\//i.test(source)) sourceClasses.push("sfx");
  return { attrs, classes: [...new Set([...primary.classes, ...sourceClasses])], consistencyErrors };
});
const audioClassificationErrors = classifiedAudio.flatMap(({ attrs, classes, consistencyErrors }) => [
  ...consistencyErrors,
  ...(classes.length === 1 ? []
    : [`direct-root audio ${JSON.stringify(tagIdentity(attrs) || attrs.src || "<anonymous>")} must have exactly one explicit narration/BGM/SFX identity (found ${classes.length})`]),
]);
const bgmTags = classifiedAudio.filter((entry) => entry.classes.length === 1 && entry.classes[0] === "bgm").map((entry) => entry.attrs);
const sfxTags = classifiedAudio.filter((entry) => entry.classes.length === 1 && entry.classes[0] === "sfx").map((entry) => entry.attrs);
const mediaManifest = loadMediaManifest();
function trackCoverageErrors(attrs, label, audio) {
  const errors = [];
  const start = Number(attrs["data-start"]);
  const duration = Number(attrs["data-duration"]);
  const mediaStartRaw = attrs["data-media-start"];
  const mediaStart = mediaStartRaw == null ? 0 : Number(mediaStartRaw);
  const trackIndexRaw = attrs["data-track-index"];
  const trackIndex = Number(trackIndexRaw);
  if (trackIndexRaw == null || String(trackIndexRaw).trim() === ""
    || !Number.isFinite(trackIndex) || !Number.isInteger(trackIndex) || trackIndex < 0) {
    errors.push(`${label}: data-track-index must be an explicit nonnegative integer`);
  }
  if (mediaStartRaw != null && (String(mediaStartRaw).trim() === "" || !Number.isFinite(mediaStart) || mediaStart < 0)) {
    errors.push(`${label}: data-media-start must be an explicit finite nonnegative value when present`);
  }
  if (!Number.isFinite(topLevelCompositionDuration) || topLevelCompositionDuration <= 0) {
    errors.push(`${label}: top-level index composition needs a finite positive data-duration`);
  } else if (Number.isFinite(start) && Number.isFinite(duration) && duration > 0
    && start + duration > topLevelCompositionDuration + 0.001) {
    errors.push(`${label}: global data-start + data-duration exceeds top-level composition duration ${topLevelCompositionDuration}s`);
  }
  if (audio.ok && Number.isFinite(mediaStart) && mediaStart >= 0
    && Number.isFinite(duration) && duration > 0 && mediaStart + duration > audio.duration + 0.05) {
    errors.push(`${label}: source data-media-start + data-duration exceeds decoded file duration ${audio.duration.toFixed(3)}s`);
  }
  return errors;
}
const soundReviewSection = directionSectionFor("Sound-mix review");
const soundReviewRows = soundReviewSection.split(/\r?\n/).map(tableCells)
  .filter((cells) => STRICT ? substantiveReviewRow(cells, 6) : filledCells(cells, 6))
  .map((cells) => ({ id: cells[0].replace(/^`+|`+$/g, "").trim(), cells }))
  .filter((row) => row.id && !/^channel\s*\/\s*cue id$/i.test(row.id));
const soundReviewIds = new Set(soundReviewRows.map((row) => row.id));
const soundStructuralErrors = [];
if (SCAFFOLD_ERROR) soundStructuralErrors.push(SCAFFOLD_ERROR);
if (STRICT) {
  if (sectionHeadingCount("Sound palette(?:\\s*[—–-].*)?") !== 1) soundStructuralErrors.push("DESIGN.md must contain exactly one Sound palette heading");
  if (!bgmChoice.value || !bgmChoice.why) soundStructuralErrors.push("DESIGN.md needs a filled BGM USE/SILENCE decision and Why rationale");
  if (!sfxChoice.value || !sfxChoice.why) soundStructuralErrors.push("DESIGN.md needs a filled SFX PASS/USE decision and Why rationale");
  soundStructuralErrors.push(...audioClassificationErrors);
}
const bgmRole = soundSection.match(/BGM role\s*\+\s*mix arc:\*\*\s*(.+)$/im)?.[1] || "";
if (bgmChoice.value === "USE" && !useful(bgmRole)) soundStructuralErrors.push("BGM USE needs a filled role, frozen path/rights, and mix arc");
if (bgmChoice.value === "USE" && bgmTags.length !== 1) {
  soundStructuralErrors.push(`BGM USE needs exactly one live audio direct child of the sole top-level index composition root (found ${bgmTags.length})`);
}
if (bgmChoice.value === "USE" && bgmTags.length === 1) {
  const audio = validateAudioPath(bgmTags[0].src);
  soundStructuralErrors.push(...trackCoverageErrors(bgmTags[0], "BGM", audio));
  soundStructuralErrors.push(...manifestErrorsForAudio(bgmTags[0].src, "bgm", mediaManifest));
  const roleText = bgmRole.replace(/`/g, "");
  if (audio.path && (!roleText.includes(audio.path) || roleText.trim().length < audio.path.length + 4)) {
    soundStructuralErrors.push("BGM role/mix arc must name the exact frozen src and its source/license");
  }
  const review = soundReviewRows.find((row) => row.id === "bgm");
  const reviewRights = review?.cells[4]?.replace(/`/g, "") || "";
  if (audio.path && review && (!reviewRights.includes(audio.path) || reviewRights.trim().length < audio.path.length + 4)) {
    soundStructuralErrors.push("BGM encoded review must recheck the exact frozen src and its source/license");
  }
}
if (bgmChoice.value === "SILENCE" && (bgmTags.length || /["']#bgm["']/.test(executableIndexSource))) {
  soundStructuralErrors.push("BGM SILENCE contradicts a live BGM element or #bgm automation");
}
if (sfxChoice.value === "PASS" && sfxTags.length) soundStructuralErrors.push("SFX PASS contradicts live SFX audio cues");
if (sfxChoice.value === "USE" && (!cueRows.length || !sfxTags.length)) {
  soundStructuralErrors.push("SFX USE needs at least one filled DESIGN cue row and one live root audio cue");
}
const cueIds = new Set();
for (const row of cueRows) {
  if (!/^[A-Za-z][\w-]*$/.test(row.id)) soundStructuralErrors.push(`unsafe SFX cue id ${JSON.stringify(row.id)}`);
  if (cueIds.has(row.id)) soundStructuralErrors.push(`duplicate SFX cue id ${row.id}`);
  row.window = exactGlobalWindow(row.cells[1]);
  if (!row.window) {
    soundStructuralErrors.push(`${row.id || "<missing-id>"}: DESIGN cue needs one exact canonical numeric global window such as 0.500–0.800s`);
  }
  cueIds.add(row.id);
}
for (const attrs of sfxTags) {
  const id = tagIdentity(attrs);
  const row = cueRows.find((candidate) => candidate.id === id);
  if (!row) { soundStructuralErrors.push(`live SFX cue ${id || "<missing-id>"} has no matching DESIGN row`); continue; }
  const numeric = ["data-start", "data-duration", "data-track-index", "data-volume"];
  for (const attr of numeric) if (attrs[attr] == null || attrs[attr].trim() === "" || !Number.isFinite(Number(attrs[attr]))) {
    soundStructuralErrors.push(`${id}: ${attr} must be an explicit finite global value`);
  }
  if (Number(attrs["data-start"]) < 0 || Number(attrs["data-duration"]) <= 0
    || Number(attrs["data-volume"]) < 0 || Number(attrs["data-volume"]) > 1) {
    soundStructuralErrors.push(`${id}: cue timing/volume lies outside the valid range`);
  }
  const liveStart = Number(attrs["data-start"]);
  const liveDuration = Number(attrs["data-duration"]);
  if (row.window && Number.isFinite(liveStart) && Number.isFinite(liveDuration)
    && (Math.abs(liveStart - row.window.start) > SFX_WINDOW_TOLERANCE_SEC
      || Math.abs(liveDuration - row.window.duration) > SFX_WINDOW_TOLERANCE_SEC)) {
    soundStructuralErrors.push(`${id}: live data-start/data-duration ${liveStart}s/${liveDuration}s does not match DESIGN global window ${row.window.start}–${row.window.end}s`);
  }
  const audio = validateAudioPath(attrs.src);
  soundStructuralErrors.push(...manifestErrorsForAudio(attrs.src, "sfx", mediaManifest).map((error) => `${id}: ${error}`));
  if (!audio.ok) soundStructuralErrors.push(`${id}: ${audio.reason}`);
  soundStructuralErrors.push(...trackCoverageErrors(attrs, id, audio));
  const rightsCell = row.cells[3].replace(/`/g, "");
  if (audio.path && (!rightsCell.includes(audio.path) || rightsCell.trim().length < audio.path.length + 4)) {
    soundStructuralErrors.push(`${id}: DESIGN row must name the exact frozen src and its source/license`);
  }
  const review = soundReviewRows.find((candidate) => candidate.id === id);
  const reviewRights = review?.cells[4]?.replace(/`/g, "") || "";
  if (audio.path && review && (!reviewRights.includes(audio.path) || reviewRights.trim().length < audio.path.length + 4)) {
    soundStructuralErrors.push(`${id}: encoded review must recheck the exact frozen src and its source/license`);
  }
}
if (sfxChoice.value === "USE") {
  for (const row of cueRows) {
    const matches = sfxTags.filter((attrs) => tagIdentity(attrs) === row.id);
    if (matches.length !== 1) {
      soundStructuralErrors.push(`DESIGN cue ${row.id} must bind exactly one live root audio element (found ${matches.length})`);
    }
  }
}
const requiredSoundReviews = [
  ...(bgmChoice.value === "USE" ? ["bgm"] : []),
  ...(sfxChoice.value === "USE" ? cueRows.map((row) => row.id) : []),
];
const missingSoundReviews = requiredSoundReviews.filter((id) => !soundReviewIds.has(id));
if (soundStructuralErrors.length) {
  gate("sound_plan", false, [...new Set(soundStructuralErrors)].slice(0, 4).join("; "),
    "Fill the sound admissions, explicitly ingest/freeze reviewed candidates, and repair exact root-track wiring and cue provenance.",
    { waivable: false });
} else {
  gate("sound_plan", missingSoundReviews.length === 0,
    !STRICT && !bgmChoice.value && !sfxChoice.value ? "legacy project — no v2 sound admission required"
      : missingSoundReviews.length ? `encoded sound-mix review row(s) missing: ${missingSoundReviews.join(", ")}`
        : `${bgmChoice.value || "legacy BGM"} / SFX ${sfxChoice.value || "legacy"}; selected channels are wired and reviewed`,
    "Review the encoded master and add one DIRECTION.md Sound-mix review row for BGM and every admitted SFX cue.");
}

// 8 — BGM delivery: a real, decodable local root track, or deliberate silence
//     with an explicit waiver. A waiver cannot hide a broken/stale element.
const bgmWiringErrors = [];
let validBgm = null;
if (bgmTags.length > 1) bgmWiringErrors.push(`expected at most one BGM root track; found ${bgmTags.length}`);
if (bgmTags.length === 1) {
  const attrs = bgmTags[0];
  const numeric = ["data-start", "data-duration", "data-track-index", "data-volume"];
  for (const attr of numeric) if (attrs[attr] == null || attrs[attr].trim() === "" || !Number.isFinite(Number(attrs[attr]))) {
    bgmWiringErrors.push(`BGM ${attr} must be an explicit finite global value`);
  }
  if (Number(attrs["data-start"]) < 0 || Number(attrs["data-duration"]) <= 0
    || Number(attrs["data-volume"]) < 0 || Number(attrs["data-volume"]) > 1) {
    bgmWiringErrors.push("BGM timing/volume lies outside the valid range");
  }
  const audio = validateAudioPath(attrs.src);
  bgmWiringErrors.push(...manifestErrorsForAudio(attrs.src, "bgm", mediaManifest));
  const coverageErrors = trackCoverageErrors(attrs, "BGM", audio);
  bgmWiringErrors.push(...coverageErrors);
  if (!audio.ok) bgmWiringErrors.push(audio.reason);
  else if (coverageErrors.length === 0) validBgm = audio;
}
if (bgmChoice.value === "USE" && !bgmTags.length) bgmWiringErrors.push("BGM USE has no live root audio track");
if (bgmChoice.value === "SILENCE" && bgmTags.length) bgmWiringErrors.push("BGM SILENCE still has a live root audio track");
if (!bgmTags.length && /["']#bgm["']/.test(executableIndexSource)) bgmWiringErrors.push("#bgm automation remains without a BGM element");
if (bgmWiringErrors.length) {
  gate("bgm", false, [...new Set(bgmWiringErrors)].join("; "),
    "Repair or remove the BGM root element and its #bgm automation; point USE at one decodable frozen local file.",
    { waivable: false });
} else {
  gate("bgm", Boolean(validBgm),
    validBgm ? `wired decodable local BGM (${validBgm.path}, ${validBgm.duration.toFixed(2)}s)`
      : bgmChoice.value === "SILENCE" ? "deliberate silence declared; BGM element/automation absent"
        : "no BGM root track",
    "Wire one reviewed frozen BGM root track, or declare SILENCE and add `WAIVER: bgm — <why silence is the deliberate choice>`.");
}

// ── report ──
const reported = ONLY ? results.filter((result) => result.id === ONLY) : results;
if (ONLY && reported.length === 0) {
  console.error(`Unknown gate id: ${ONLY}`);
  process.exit(2);
}
const fails = reported.filter((r) => r.status === "fail");
const waived = reported.filter((r) => r.status === "waived");
if (JSON_MODE) {
  console.log(JSON.stringify({ ok: fails.length === 0, results: reported }, null, 2));
} else {
  const icon = { pass: "✓", waived: "⊘", fail: "✗" };
  console.log("\n  AMBITION GATE (Phase 7.5) — did the elevation work happen?\n");
  for (const r of reported) {
    console.log(`  ${icon[r.status]} ${r.id.padEnd(15)} ${r.detail}`);
    if (r.status === "waived") console.log(`      ⊘ waived: ${r.waiver}`);
    if (r.status === "fail") {
      console.log(`      → ${r.fix}`);
      if (!r.waivable) console.log("      ! structural contract: waiver unavailable");
    }
  }
  console.log(`\n  ${reported.filter(r=>r.status==="pass").length} pass · ${waived.length} waived · ${fails.length} fail`);
  console.log(fails.length === 0
    ? "  ◇ gate OPEN — ambition floor met (or consciously waived). Proceed to final render.\n"
    : "  ◆ gate CLOSED — repair structural failures; artistic/review failures may use a documented WAIVER where offered.\n");
}
process.exit(fails.length ? 1 : 0);
