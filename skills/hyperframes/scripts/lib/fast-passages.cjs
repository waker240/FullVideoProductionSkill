"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { parseAttrs, portable } = require("./spatial-canvas.cjs");

const MANIFEST_NAME = "FAST_PASSAGES.json";
const SCAFFOLD_META_NAME = ".hyperframes-scaffold.json";
const SCHEMA = "hf-fast-passages/v1";
const CLOCK_PATHS = Object.freeze({
  boundaries: "scripts/boundaries.json",
  words: "assets/words/narration.words.json",
});
const CLOCK_HASH_FIELDS = Object.freeze({
  boundaries: "boundariesSha256",
  words: "wordsSha256",
});
const INTENTS = new Set(["momentum", "temporal-compression", "overwhelm", "panic-rupture"]);
const ROLE_ORDER = new Map([
  ["baseline", 0],
  ["compress", 1],
  ["escalate", 2],
  ["peak", 3],
  ["release", 4],
]);
const ID_RE = /^[A-Za-z][A-Za-z0-9_-]{1,63}$/;
const SHA256_RE = /^[a-f0-9]{64}$/;
const EPSILON = 1e-6;
// Fish/Whisper can emit brief timestamp jitter while preserving transcript
// token order. Reject gross reversals without invalidating canonical clocks.
const WORD_START_JITTER_SECONDS = 0.35;

function normalizeHeading(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‐‑‒–—―-]+/g, " ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isFastAdmissionHeading(value) {
  const normalized = normalizeHeading(value);
  if (!normalized.includes("admission")) return false;
  return normalized.includes("fast paced")
    || normalized.includes("fast passage")
    || normalized.includes("fast passaged")
    || normalized.includes("fast editing");
}

function markdownSections(source) {
  const headings = [...String(source || "").matchAll(/^(#{1,6})[ \t]+(.+?)\s*$/gm)].map((match) => ({
    level: match[1].length,
    title: match[2].replace(/[ \t]+#+[ \t]*$/, "").trim(),
    start: match.index,
    contentStart: match.index + match[0].length,
  }));
  return headings.map((heading, index) => {
    let end = String(source || "").length;
    for (let cursor = index + 1; cursor < headings.length; cursor += 1) {
      if (headings[cursor].level <= heading.level) {
        end = headings[cursor].start;
        break;
      }
    }
    return { ...heading, body: String(source || "").slice(heading.contentStart, end) };
  });
}

function cleanMarkdown(value) {
  return String(value || "")
    .replace(/<!--?[\s\S]*?-->/g, " ")
    .replace(/[`*_~]/g, "")
    .replace(/^\s*[-:–—|]+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isFilledText(value, minimum = 8) {
  const cleaned = cleanMarkdown(value);
  if (cleaned.length < minimum) return false;
  if (/[<>]/.test(cleaned)) return false;
  if (/\b(?:tbd|todo|placeholder|fill\s+(?:this|me)|lorem\s+ipsum|(?:decide|choose)(?:\s+(?:one|this))?\s+later)\b/i.test(cleaned)) return false;
  return /[\p{L}\p{N}]/u.test(cleaned);
}

function normalizedReceiver(value) {
  return cleanMarkdown(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function stripHtmlInertBlocks(value) {
  const source = String(value || "");
  const inertNames = "pre|code|textarea|title|iframe|xmp|noembed|noframes|noscript|plaintext|script|style";
  const openingPattern = new RegExp(`<!--|<(${inertNames})\\b[^>]*>`, "i");
  let output = "";
  let cursor = 0;
  while (cursor < source.length) {
    const rest = source.slice(cursor);
    const opening = openingPattern.exec(rest);
    if (!opening) {
      output += rest;
      break;
    }
    const start = cursor + opening.index;
    output += source.slice(cursor, start);
    let end = source.length;
    if (opening[0].startsWith("<!--")) {
      const close = source.indexOf("-->", start + opening[0].length);
      if (close >= 0) end = close + 3;
    } else if (opening[1].toLowerCase() === "plaintext") {
      // HTML has no closing plaintext tag; everything after the opener is
      // text, even if a literal `</plaintext>` appears later.
      end = source.length;
    } else {
      const closePattern = new RegExp(`<\\/${opening[1]}\\s*>`, "gi");
      closePattern.lastIndex = start + opening[0].length;
      const close = closePattern.exec(source);
      if (close) end = close.index + close[0].length;
    }
    // Preserve newlines so block structure remains stable while every inert
    // character, including an unterminated HTML block body, disappears.
    output += source.slice(start, end).replace(/[^\r\n]/g, " ");
    cursor = end;
  }
  return output;
}

function stripHtmlTemplateBlocks(value) {
  // Raw-text blocks and comments must be stripped first so a literal
  // `</template>` inside them cannot prematurely expose inert template text.
  const source = String(value || "");
  let output = "";
  let cursor = 0;
  while (cursor < source.length) {
    const opening = /<template\b[^>]*>/i.exec(source.slice(cursor));
    if (!opening) {
      output += source.slice(cursor);
      break;
    }
    const start = cursor + opening.index;
    output += source.slice(cursor, start);
    const templatePattern = /<\s*(\/?)\s*template\b[^>]*>/gi;
    templatePattern.lastIndex = start + opening[0].length;
    let depth = 1;
    let end = source.length;
    let templateMatch;
    while ((templateMatch = templatePattern.exec(source))) {
      if (templateMatch[1] === "/") depth -= 1;
      else if (!/\/\s*>$/.test(templateMatch[0])) depth += 1;
      if (depth === 0) {
        end = templateMatch.index + templateMatch[0].length;
        break;
      }
    }
    output += source.slice(start, end).replace(/[^\r\n]/g, " ");
    cursor = end;
  }
  return output;
}

function visibleMarkdown(value) {
  const source = stripHtmlTemplateBlocks(stripHtmlInertBlocks(value));
  const lines = source.split(/\r?\n/);
  let fence = null;
  return lines.map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (!fence && marker) {
      fence = { character: marker[1][0], length: marker[1].length };
      return "";
    }
    if (fence) {
      const candidate = line.trim();
      const closes = candidate.length >= fence.length
        && [...candidate].every((character) => character === fence.character);
      if (closes) fence = null;
      return "";
    }
    // CommonMark indented code is documentation/example text. Do not let a
    // copied `Decision:` line inside it satisfy the production admission.
    if (/^(?: {4}|\t)/.test(line)) return "";
    return line;
  }).join("\n");
}

function fastHtmlTags(value) {
  const source = stripHtmlInertBlocks(value);
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  const rawTextTags = new Set(["iframe", "noembed", "noframes", "noscript", "script", "style", "textarea", "title", "xmp"]);
  const stack = [];
  const records = [];
  const token = /<\s*(\/?)\s*([a-zA-Z][\w:-]*)\b([^<>]*?)>/g;
  let match;
  while ((match = token.exec(source))) {
    const closing = match[1] === "/";
    const name = match[2].toLowerCase();
    if (closing) {
      // An unmatched close tag must not pop unrelated ancestors. In
      // particular, text such as `</div>` inside a template cannot escape
      // that inert template and forge a live root or mount.
      const openIndex = stack.findLastIndex((record) => record.name === name);
      if (openIndex >= 0) stack.length = openIndex;
      continue;
    }

    const record = { name, attrs: parseAttrs(match[3]), parent: stack.at(-1) || null };
    records.push(record);

    // These elements do not expose their contents as live composition HTML.
    // Skip through the matching end tag; an unterminated block is inert
    // through EOF. HTML's plaintext element has no recognized end tag.
    if (name === "plaintext") break;
    if (rawTextTags.has(name)) {
      const closePattern = new RegExp(`<\\s*\\/\\s*${name}\\s*>`, "ig");
      closePattern.lastIndex = token.lastIndex;
      const close = closePattern.exec(source);
      if (!close) break;
      token.lastIndex = close.index + close[0].length;
      continue;
    }

    if (!voidTags.has(name) && !/\/\s*$/.test(match[3])) stack.push(record);
  }
  return records;
}

function parseFastAdmission(source) {
  const errors = [];
  const visibleSource = visibleMarkdown(source);
  const sections = markdownSections(visibleSource).filter((section) => isFastAdmissionHeading(section.title));
  if (sections.length === 0) {
    return {
      valid: false,
      decision: null,
      rationale: "",
      section: null,
      errors: ["DESIGN.md needs a Fast-paced passage admission section with an explicit PASS or USE decision"],
    };
  }
  if (sections.length > 1) {
    errors.push("DESIGN.md must contain exactly one Fast-paced passage admission section");
  }

  const section = sections[0];
  const decisionMatches = [...section.body.matchAll(/^\s*(?:\*\*)?Decision\s*:(?:\*\*)?\s*(PASS|USE)\b([^\r\n]*)$/gim)];
  if (decisionMatches.length !== 1) {
    errors.push("Fast-paced passage admission needs exactly one explicit `Decision: PASS` or `Decision: USE`");
  }
  const decision = decisionMatches.length ? decisionMatches[0][1].toUpperCase() : null;
  const decisionTail = decisionMatches.length ? decisionMatches[0][2] : "";
  const whyMatch = section.body.match(/^\s*(?:\*\*)?Why\s*:(?:\*\*)?\s*([^\r\n]+)$/im);
  const inlineWhyMatch = decisionTail.match(/\*\*Why:\*\*\s*([^\r\n]+)/i);
  const rationaleSource = whyMatch?.[1] || inlineWhyMatch?.[1] || decisionTail;
  const rationale = cleanMarkdown(rationaleSource);
  const oppositeDecision = decision === "PASS" ? "USE" : decision === "USE" ? "PASS" : null;
  const explicitOpposite = oppositeDecision
    && new RegExp(`\\b${oppositeDecision}\\b`).test(section.body);
  const delimiterOpposite = oppositeDecision && new RegExp(
    `(?:^|->|=>|[\\[({|/+→]|\\b(?:or|and)\\b|[,;:—–-])\\s*[\\]})*_~]*\\s*${oppositeDecision}\\b`,
    "i",
  ).test(decisionTail);
  const whyStartsAsOpposite = oppositeDecision && new RegExp(
    `^\\s*[\\[({*_~]*${oppositeDecision}\\b\\s*(?:[\\]})*_~]*\\s*)?(?:->|=>|[—–:;,+/|→-]|$|because\\b|(?:is|was|remains?|keeps?|preserves?|provides?|allows?|means?|offers?|would|will|can|should|needs?|wins?|works?|fits?)\\b)`,
    "i",
  ).test(rationaleSource);
  // Uppercase option markers remain unambiguous anywhere, while lowercase
  // prose is legal unless delimiter syntax makes it another choice.
  if (explicitOpposite || delimiterOpposite || whyStartsAsOpposite) {
    errors.push("Fast-paced passage admission still contains both template options; choose one decision");
  }
  if (decision && !isFilledText(rationale, 10)) {
    errors.push("Fast-paced passage admission needs a concrete, non-placeholder rationale after the decision or in `Why:`");
  }

  return {
    valid: Boolean(decision) && errors.length === 0,
    decision,
    rationale,
    section: { heading: section.title, body: section.body },
    errors,
  };
}

function safeProjectPath(value) {
  const raw = String(value || "").replace(/\\/g, "/");
  if (!raw || raw.includes("\0") || raw.includes("?") || raw.includes("#")) return false;
  if (path.posix.isAbsolute(raw) || /^[A-Za-z]:\//.test(raw)) return false;
  if (raw.split("/").includes("..")) return false;
  return Boolean(portable(raw));
}

function regularProjectFile(root, relativePath) {
  if (!safeProjectPath(relativePath)) return null;
  const lexicalRoot = path.resolve(root);
  const candidate = path.resolve(lexicalRoot, portable(relativePath));
  const lexicalRelative = path.relative(lexicalRoot, candidate);
  if (lexicalRelative === ".." || lexicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(lexicalRelative)) return null;
  try {
    const stat = fs.lstatSync(candidate);
    if (stat.isSymbolicLink() || !stat.isFile()) return null;
    const physicalRoot = fs.realpathSync(lexicalRoot);
    const physicalCandidate = fs.realpathSync(candidate);
    const physicalRelative = path.relative(physicalRoot, physicalCandidate);
    if (physicalRelative === ".." || physicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(physicalRelative)) return null;
    return physicalCandidate;
  } catch { return null; }
}

function pathEntryExists(filePath) {
  try { fs.lstatSync(filePath); return true; }
  catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
    throw error;
  }
}

function validateProjectRoot(root) {
  try {
    const stat = fs.lstatSync(root);
    if (stat.isSymbolicLink()) return "project root must be an existing real directory, not a symlink";
    if (!stat.isDirectory()) return "project root must be an existing real directory, not a regular file or special entry";
    fs.realpathSync(root);
    return null;
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return "project root does not exist or is not a directory";
    return `project root cannot be inspected: ${error.message}`;
  }
}

function readJsonFile(filePath, label, errors, snapshotOut = null) {
  let snapshot;
  try {
    snapshot = stableFileSnapshot(filePath, label);
  } catch (error) {
    errors.push(`${label} cannot be read: ${error.message}`);
    return null;
  }
  try {
    const parsed = JSON.parse(snapshot.text);
    if (snapshotOut) snapshotOut.value = snapshot;
    return parsed;
  } catch (error) {
    errors.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function sameFileIdentity(left, right) {
  if (!left || !right || left.dev !== right.dev) return false;
  if (left.ino || right.ino) return left.ino === right.ino;
  return left.birthtimeMs === right.birthtimeMs;
}

function stableFileSnapshot(filePath, label) {
  const before = fs.lstatSync(filePath);
  if (before.isSymbolicLink() || !before.isFile()) throw new Error(`${label} must be a regular non-symlink file`);
  const bytes = fs.readFileSync(filePath);
  const after = fs.lstatSync(filePath);
  if (!sameFileIdentity(before, after)
    || before.size !== after.size
    || before.mtimeMs !== after.mtimeMs) {
    throw new Error(`${label} changed while it was being read`);
  }
  return {
    dev: after.dev,
    ino: after.ino,
    birthtimeMs: after.birthtimeMs,
    mode: after.mode,
    size: after.size,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
    text: bytes.toString("utf8"),
  };
}

function sameFileSnapshot(left, right) {
  return sameFileIdentity(left, right)
    && left.size === right.size
    && left.sha256 === right.sha256;
}

function assertFileSnapshotUnchanged(filePath, expected, label) {
  const current = stableFileSnapshot(filePath, label);
  if (!sameFileIdentity(current, expected)) throw new Error(`${label} was replaced after validation`);
  if (!sameFileSnapshot(current, expected)) throw new Error(`${label} changed after validation`);
  return current;
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function closeEnough(left, right) {
  return Math.abs(left - right) <= EPSILON;
}

function formatTime(value) {
  return Number.isFinite(value) ? `${Number(value.toFixed(6))}s` : String(value);
}

function rootComposition(indexSource, errors) {
  const roots = fastHtmlTags(indexSource).filter((tag) => tag.name === "div" && tag.attrs["data-composition-id"]
    && (tag.parent == null || tag.parent.name === "body"));
  if (roots.length !== 1) {
    errors.push(`index.html must contain exactly one live top-level div data-composition-id root (found ${roots.length})`);
    return { tag: null, duration: NaN };
  }
  const duration = Number(roots[0].attrs["data-duration"]);
  if (!Number.isFinite(duration) || duration <= 0) {
    errors.push("index.html top-level composition needs a finite positive data-duration");
  }
  return { tag: roots[0], duration };
}

function compositionMounts(indexSource) {
  const tags = fastHtmlTags(indexSource);
  const roots = tags.filter((tag) => tag.name === "div" && tag.attrs["data-composition-id"]
    && (tag.parent == null || tag.parent.name === "body"));
  const root = roots.length === 1 ? roots[0] : null;
  return tags
    .filter((tag) => root && tag.name === "div" && tag.parent === root && tag.attrs["data-composition-src"])
    .map((tag) => ({
      source: portable(tag.attrs["data-composition-src"]),
      start: Number(tag.attrs["data-start"]),
      duration: Number(tag.attrs["data-duration"]),
      id: String(tag.attrs["data-composition-id"] || ""),
      width: Number(tag.attrs["data-width"]),
      height: Number(tag.attrs["data-height"]),
      trackIndex: Number(tag.attrs["data-track-index"]),
    }));
}

function directTemplateCompositionRoots(source) {
  return fastHtmlTags(source).filter((tag) => {
    const template = tag.parent;
    const topLevelTemplate = template?.name === "template"
      && (template.parent == null || template.parent.name === "body");
    return tag.name === "div" && Boolean(tag.attrs["data-composition-id"]) && topLevelTemplate;
  });
}

function readScaffoldStrictness(root) {
  const metaPath = path.join(root, SCAFFOLD_META_NAME);
  if (!pathEntryExists(metaPath)) return { strict: false, error: null };
  const safeMetaPath = regularProjectFile(root, SCAFFOLD_META_NAME);
  if (!safeMetaPath) {
    return { strict: false, error: `${SCAFFOLD_META_NAME} must be a regular non-symlink file physically contained in the project` };
  }
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(safeMetaPath, "utf8"));
  } catch (error) {
    return { strict: false, error: `${SCAFFOLD_META_NAME} is unreadable or invalid: ${error.message}` };
  }
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return { strict: false, error: `${SCAFFOLD_META_NAME} root must be an object` };
  }
  const recognizedShape = meta.schemaVersion === 2
    && typeof meta.provider === "string" && meta.provider.trim().toLowerCase() === "fish"
    && Array.isArray(meta.files) && meta.files.length > 0
    && meta.files.every((entry) => entry && typeof entry === "object" && !Array.isArray(entry)
      && typeof entry.target === "string" && entry.target.trim().length > 0
      && typeof entry.source === "string" && entry.source.trim().length > 0
      && typeof entry.managed === "boolean");
  if (!recognizedShape) {
    return {
      strict: false,
      error: `${SCAFFOLD_META_NAME} must be a recognized schemaVersion 2 Fish scaffold with non-empty files metadata`,
    };
  }
  if (Object.hasOwn(meta, "ambitionContractVersion")) {
    const version = meta.ambitionContractVersion;
    if (!Number.isInteger(version) || version < 1) {
      return {
        strict: false,
        error: `${SCAFFOLD_META_NAME} ambitionContractVersion must be a positive integer when present`,
      };
    }
    return { strict: version >= 2, error: null };
  }
  return { strict: false, error: null };
}

function validateClockSources(root, manifest, nonClockErrors) {
  const sources = {};
  const clock = manifest?.clock;
  if (!clock || typeof clock !== "object" || Array.isArray(clock)) {
    nonClockErrors.push("FAST_PASSAGES.json clock must be an object");
    return sources;
  }
  for (const [key, requiredPath] of Object.entries(CLOCK_PATHS)) {
    if (clock[key] !== requiredPath) {
      nonClockErrors.push(`clock.${key} must be exactly ${JSON.stringify(requiredPath)}`);
      continue;
    }
    const abs = regularProjectFile(root, requiredPath);
    if (!abs) {
      nonClockErrors.push(`clock.${key} must name a regular non-symlink project file: ${requiredPath}`);
      continue;
    }
    const snapshot = {};
    const parsed = readJsonFile(abs, `clock.${key} file ${requiredPath}`, nonClockErrors, snapshot);
    if (parsed === null) continue;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      nonClockErrors.push(`clock.${key} file ${requiredPath} must contain a JSON object`);
      continue;
    }
    sources[key] = { abs, requiredPath, parsed, snapshot: snapshot.value };
  }
  return sources;
}

function validateFastManifest({ root, manifest, syncClock = false }) {
  const nonClockErrors = [];
  const clockErrors = [];
  const warnings = [];
  const passagesOut = [];

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return {
      ok: false,
      errors: ["FAST_PASSAGES.json root must be an object"],
      nonClockErrors: ["FAST_PASSAGES.json root must be an object"],
      clockErrors,
      warnings,
      passages: passagesOut,
      clockSources: {},
    };
  }
  if (manifest.$schema !== SCHEMA) {
    nonClockErrors.push(`FAST_PASSAGES.json must declare \"$schema\": \"${SCHEMA}\"`);
  }

  const clockSources = validateClockSources(root, manifest, nonClockErrors);
  const indexPath = path.join(root, "index.html");
  let indexSource = "";
  const safeIndexPath = pathEntryExists(indexPath) ? regularProjectFile(root, "index.html") : null;
  if (!safeIndexPath) {
    nonClockErrors.push("index.html must be a regular non-symlink project file to validate exact fast-passage ownership");
  } else {
    try { indexSource = fs.readFileSync(safeIndexPath, "utf8"); }
    catch (error) { nonClockErrors.push(`index.html cannot be read: ${error.message}`); }
  }
  const rootInfo = indexSource ? rootComposition(indexSource, nonClockErrors) : { duration: NaN };
  const mounts = indexSource ? compositionMounts(indexSource) : [];
  const boundariesDuration = clockSources.boundaries?.parsed?.totalSec;
  const wordsDuration = clockSources.words?.parsed?.durationSec;
  if (!finiteNumber(boundariesDuration) || boundariesDuration <= 0) nonClockErrors.push("scripts/boundaries.json needs a finite positive numeric totalSec");
  if (!finiteNumber(wordsDuration) || wordsDuration <= 0) nonClockErrors.push("narration.words.json needs a finite positive numeric durationSec");
  const words = clockSources.words?.parsed?.words;
  if (!Array.isArray(words) || words.length === 0) {
    nonClockErrors.push("narration.words.json needs a non-empty words array for word-locked fast editing");
  } else {
    let priorStart = -Infinity;
    let invalidWord = false;
    let meaningfulWordCount = 0;
    for (const word of words) {
      const valid = word && typeof word === "object" && !Array.isArray(word)
        && typeof word.word === "string" && word.word.length > 0
        && finiteNumber(word.start) && finiteNumber(word.end)
        && word.start >= 0 && word.end >= word.start
        && (!finiteNumber(wordsDuration) || wordsDuration <= 0 || word.end <= wordsDuration + 0.01)
        && word.start >= priorStart - WORD_START_JITTER_SECONDS - EPSILON;
      if (!valid) invalidWord = true;
      if (word && typeof word.word === "string" && word.word.trim()) meaningfulWordCount += 1;
      if (word && finiteNumber(word.start)) priorStart = Math.max(priorStart, word.start);
    }
    if (invalidWord || meaningfulWordCount === 0) {
      nonClockErrors.push(`narration.words.json words need text plus numeric non-negative start/end times inside durationSec, with no source-order reversal beyond ${WORD_START_JITTER_SECONDS}s`);
    }
  }
  if (finiteNumber(boundariesDuration) && boundariesDuration > 0 && finiteNumber(wordsDuration) && wordsDuration > 0
    && Math.abs(boundariesDuration - wordsDuration) > 0.01) {
    nonClockErrors.push(`audio clocks disagree: boundaries totalSec ${formatTime(boundariesDuration)} vs words durationSec ${formatTime(wordsDuration)}`);
  }
  if (Number.isFinite(rootInfo.duration) && finiteNumber(boundariesDuration) && boundariesDuration > 0
    && Math.abs(rootInfo.duration - boundariesDuration) > 0.01) {
    nonClockErrors.push(`index.html duration ${formatTime(rootInfo.duration)} must match locked boundaries totalSec ${formatTime(boundariesDuration)}`);
  }

  if (!Array.isArray(manifest.passages) || manifest.passages.length === 0) {
    nonClockErrors.push("FAST_PASSAGES.json passages must be a non-empty array when admission is USE");
  }

  const passageIds = new Set();
  const sortedWindows = [];
  for (const [passageIndex, passage] of (Array.isArray(manifest.passages) ? manifest.passages : []).entries()) {
    const fallback = `passage #${passageIndex + 1}`;
    if (!passage || typeof passage !== "object" || Array.isArray(passage)) {
      nonClockErrors.push(`${fallback} must be an object`);
      continue;
    }
    const label = ID_RE.test(passage.id || "") ? `passage ${passage.id}` : fallback;
    if (!ID_RE.test(passage.id || "")) {
      nonClockErrors.push(`${label}: id must be a safe 2–64 character identifier`);
    } else if (passageIds.has(passage.id)) {
      nonClockErrors.push(`${label}: duplicate passage id`);
    } else {
      passageIds.add(passage.id);
    }
    if (!INTENTS.has(passage.intent)) {
      nonClockErrors.push(`${label}: intent must be momentum, temporal-compression, overwhelm, or panic-rupture`);
    }
    for (const field of ["primaryFamily", "accent", "soundPlan", "legibility"]) {
      if (!isFilledText(passage[field], 8)) {
        nonClockErrors.push(`${label}: ${field} must be concrete and non-placeholder`);
      }
    }

    const start = passage.start;
    const duration = passage.duration;
    if (!finiteNumber(start) || start < 0) nonClockErrors.push(`${label}: start must be a finite non-negative global time`);
    if (!finiteNumber(duration) || duration <= 0) nonClockErrors.push(`${label}: duration must be a finite positive number`);
    const end = finiteNumber(start) && finiteNumber(duration) ? start + duration : NaN;
    if (Number.isFinite(end)) {
      sortedWindows.push({ id: passage.id || fallback, start, end });
      if (Number.isFinite(rootInfo.duration) && end > rootInfo.duration + EPSILON) {
        nonClockErrors.push(`${label}: window ends at ${formatTime(end)}, beyond index.html duration ${formatTime(rootInfo.duration)}`);
      }
    }

    if (!Array.isArray(passage.phases) || passage.phases.length < 3) {
      nonClockErrors.push(`${label}: phases must contain at least baseline, peak, and release`);
      continue;
    }
    const roleCounts = new Map();
    const phaseIds = new Set();
    let priorOrder = -1;
    let priorEnd = null;
    let priorExit = null;
    const phasesOut = [];
    for (const [phaseIndex, phase] of passage.phases.entries()) {
      const phaseLabel = `${label}/phase #${phaseIndex + 1}`;
      if (!phase || typeof phase !== "object" || Array.isArray(phase)) {
        nonClockErrors.push(`${phaseLabel} must be an object`);
        continue;
      }
      if (phase.id != null) {
        if (!ID_RE.test(phase.id || "")) nonClockErrors.push(`${phaseLabel}: optional id must be a safe 2–64 character identifier`);
        else if (phaseIds.has(phase.id)) nonClockErrors.push(`${phaseLabel}: duplicate phase id ${phase.id}`);
        else phaseIds.add(phase.id);
      }
      const role = String(phase.role || "").toLowerCase();
      if (!ROLE_ORDER.has(role)) {
        nonClockErrors.push(`${phaseLabel}: role must be baseline, compress, escalate, peak, or release`);
      } else {
        const order = ROLE_ORDER.get(role);
        if (order < priorOrder) nonClockErrors.push(`${phaseLabel}: role order must progress baseline → compress → escalate → peak → release`);
        priorOrder = Math.max(priorOrder, order);
        roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
      }

      if (!finiteNumber(phase.at) || phase.at < 0) {
        nonClockErrors.push(`${phaseLabel}: at must be a finite non-negative global time`);
      }
      if (!finiteNumber(phase.duration) || phase.duration <= 0) {
        nonClockErrors.push(`${phaseLabel}: duration must be a finite positive number`);
      }
      const phaseEnd = finiteNumber(phase.at) && finiteNumber(phase.duration) ? phase.at + phase.duration : NaN;
      if (phaseIndex === 0 && Number.isFinite(start) && finiteNumber(phase.at) && !closeEnough(phase.at, start)) {
        nonClockErrors.push(`${phaseLabel}: first phase must start exactly at passage start ${formatTime(start)}`);
      }
      if (priorEnd !== null && finiteNumber(phase.at) && !closeEnough(phase.at, priorEnd)) {
        nonClockErrors.push(`${phaseLabel}: phases must be contiguous; expected ${formatTime(priorEnd)}, got ${formatTime(phase.at)}`);
      }
      if (Number.isFinite(phaseEnd)) priorEnd = phaseEnd;
      if (Number.isFinite(start) && Number.isFinite(end) && finiteNumber(phase.at) && Number.isFinite(phaseEnd)
        && (phase.at < start - EPSILON || phaseEnd > end + EPSILON)) {
        nonClockErrors.push(`${phaseLabel}: phase window must stay inside ${formatTime(start)}–${formatTime(end)}`);
      }

      const owner = portable(phase.owner);
      if (!safeProjectPath(phase.owner) || (owner !== "index.html" && !/^compositions\/.+\.html$/i.test(owner))) {
        nonClockErrors.push(`${phaseLabel}: owner must be index.html or a safe compositions/*.html path`);
      } else {
        const ownerPath = regularProjectFile(root, owner);
        if (!ownerPath) {
          nonClockErrors.push(`${phaseLabel}: owner must exist as a regular non-symlink project file: ${owner}`);
        } else if (owner !== "index.html" && finiteNumber(phase.at) && Number.isFinite(phaseEnd)) {
          const covering = mounts.filter((mount) => mount.source === owner
            && Number.isFinite(mount.start) && mount.start >= 0
            && Number.isFinite(mount.duration) && mount.duration > 0
            && mount.start <= phase.at + EPSILON
            && mount.start + mount.duration >= phaseEnd - EPSILON);
          if (covering.length !== 1) {
            nonClockErrors.push(`${phaseLabel}: ${owner} needs exactly one index.html mount covering ${formatTime(phase.at)}–${formatTime(phaseEnd)} (found ${covering.length})`);
          } else {
            const mount = covering[0];
            const ownerRoots = directTemplateCompositionRoots(fs.readFileSync(ownerPath, "utf8"));
            const ownerDuration = Number(ownerRoots[0]?.attrs["data-duration"]);
            const localStart = phase.at - mount.start;
            const localEnd = phaseEnd - mount.start;
            if (ownerRoots.length !== 1 || !Number.isFinite(ownerDuration) || ownerDuration <= 0) {
              nonClockErrors.push(`${phaseLabel}: ${owner} needs exactly one direct template composition root with finite positive data-duration`);
            } else if (mount.id !== ownerRoots[0].attrs["data-composition-id"]) {
              nonClockErrors.push(`${phaseLabel}: covering mount data-composition-id must equal owner root id ${ownerRoots[0].attrs["data-composition-id"]}`);
            } else if (!Number.isFinite(mount.width) || mount.width <= 0
              || !Number.isFinite(mount.height) || mount.height <= 0) {
              nonClockErrors.push(`${phaseLabel}: covering mount needs finite positive data-width/data-height`);
            } else if (!Number.isInteger(mount.trackIndex) || mount.trackIndex < 0) {
              nonClockErrors.push(`${phaseLabel}: covering mount data-track-index must be a non-negative integer`);
            } else if (localStart < -EPSILON || localEnd > ownerDuration + EPSILON) {
              nonClockErrors.push(`${phaseLabel}: ${owner} local window ${formatTime(localStart)}–${formatTime(localEnd)} exceeds owner duration ${formatTime(ownerDuration)}`);
            }
          }
        }
      }
      if (!isFilledText(phase.entry, 3)) nonClockErrors.push(`${phaseLabel}: entry must name the incoming focal receiver`);
      if (!isFilledText(phase.exit, 3)) nonClockErrors.push(`${phaseLabel}: exit must name the outgoing focal receiver or release landmark`);
      const currentEntry = normalizedReceiver(phase.entry);
      const admittedPeakRupture = passage.intent === "panic-rupture" && role === "peak";
      if (priorExit && currentEntry && currentEntry !== priorExit && !admittedPeakRupture) {
        nonClockErrors.push(`${phaseLabel}: entry must exactly inherit the previous phase exit receiver (${JSON.stringify(priorExit)})`);
      }
      priorExit = normalizedReceiver(phase.exit) || null;
      phasesOut.push({ id: phase.id || null, role, at: phase.at, duration: phase.duration, end: phaseEnd, owner });
    }

    for (const required of ["baseline", "peak", "release"]) {
      if (roleCounts.get(required) !== 1) nonClockErrors.push(`${label}: needs exactly one ${required} phase`);
    }
    if (String(passage.phases[0]?.role || "").toLowerCase() !== "baseline") nonClockErrors.push(`${label}: first phase must be baseline`);
    if (String(passage.phases.at(-1)?.role || "").toLowerCase() !== "release") nonClockErrors.push(`${label}: final phase must be release`);
    if (Number.isFinite(end) && priorEnd !== null && !closeEnough(priorEnd, end)) {
      nonClockErrors.push(`${label}: phases must cover the full passage exactly; expected end ${formatTime(end)}, got ${formatTime(priorEnd)}`);
    }

    passagesOut.push({
      id: passage.id,
      intent: passage.intent,
      start,
      duration,
      end,
      phases: phasesOut,
    });
  }

  sortedWindows.sort((left, right) => left.start - right.start || left.end - right.end);
  for (let index = 1; index < sortedWindows.length; index += 1) {
    const previous = sortedWindows[index - 1];
    const current = sortedWindows[index];
    if (current.start < previous.end - EPSILON) {
      nonClockErrors.push(`passages ${previous.id} and ${current.id} overlap (${formatTime(current.start)} < ${formatTime(previous.end)})`);
    }
  }

  if (!syncClock) {
    for (const [key, hashField] of Object.entries(CLOCK_HASH_FIELDS)) {
      const declared = manifest.clock?.[hashField];
      if (!SHA256_RE.test(declared || "")) {
        clockErrors.push(`clock.${hashField} must be a lowercase SHA-256 digest; run check-fast-passages.cjs --sync-clock`);
        continue;
      }
      if (!clockSources[key]) continue;
      const actual = sha256File(clockSources[key].abs);
      if (declared !== actual) {
        clockErrors.push(`clock.${hashField} is stale for ${CLOCK_PATHS[key]}; run check-fast-passages.cjs --sync-clock`);
      }
    }
  }

  return {
    ok: nonClockErrors.length === 0 && clockErrors.length === 0,
    errors: [...nonClockErrors, ...clockErrors],
    nonClockErrors,
    clockErrors,
    warnings,
    passages: passagesOut,
    clockSources,
  };
}

function syncClockHashes({ root, manifest, manifestSnapshot = null, validation, randomBytes = crypto.randomBytes }) {
  if (validation.nonClockErrors.length) {
    return { synced: false, errors: ["clock hashes were not written because non-clock validation failed"] };
  }
  let temporaryPath = null;
  let temporaryCreated = false;
  let operationError = null;
  let cleanupError = null;
  let nextManifest = null;
  try {
    const manifestPath = path.join(root, MANIFEST_NAME);
    const baselineManifest = manifestSnapshot
      ? assertFileSnapshotUnchanged(manifestPath, manifestSnapshot, MANIFEST_NAME)
      : stableFileSnapshot(manifestPath, MANIFEST_NAME);
    let parsedBaseline;
    try { parsedBaseline = JSON.parse(baselineManifest.text); }
    catch (error) { throw new Error(`${MANIFEST_NAME} became invalid JSON before synchronization: ${error.message}`); }
    if (JSON.stringify(parsedBaseline) !== JSON.stringify(manifest)) {
      throw new Error(`${MANIFEST_NAME} content no longer matches the validated manifest`);
    }

    const nextHashes = {};
    const baselineClocks = {};
    for (const [key, hashField] of Object.entries(CLOCK_HASH_FIELDS)) {
      if (!validation.clockSources[key]) {
        return { synced: false, errors: [`clock hashes were not written because ${CLOCK_PATHS[key]} is unavailable`] };
      }
      const expected = validation.clockSources[key].snapshot;
      if (!expected) throw new Error(`${CLOCK_PATHS[key]} has no validated file snapshot`);
      baselineClocks[key] = assertFileSnapshotUnchanged(
        validation.clockSources[key].abs,
        expected,
        CLOCK_PATHS[key],
      );
      nextHashes[hashField] = baselineClocks[key].sha256;
    }
    const mode = baselineManifest.mode & 0o7777;
    nextManifest = { ...manifest, clock: { ...manifest.clock, ...nextHashes } };
    const token = randomBytes(12).toString("hex");
    if (!/^[a-f0-9]{24}$/.test(token)) throw new Error("temporary-file token source returned an invalid value");
    temporaryPath = path.join(root, `.${MANIFEST_NAME}.${process.pid}-${token}.tmp`);
    const fd = fs.openSync(temporaryPath, "wx", mode);
    temporaryCreated = true;
    try {
      fs.writeFileSync(fd, `${JSON.stringify(nextManifest, null, 2)}\n`, "utf8");
      fs.fchmodSync(fd, mode);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    assertFileSnapshotUnchanged(manifestPath, baselineManifest, MANIFEST_NAME);
    for (const [key, clockSource] of Object.entries(validation.clockSources)) {
      assertFileSnapshotUnchanged(clockSource.abs, baselineClocks[key], CLOCK_PATHS[key]);
    }
    fs.renameSync(temporaryPath, manifestPath);
    temporaryCreated = false;
  } catch (error) {
    operationError = error;
  } finally {
    if (temporaryCreated && temporaryPath) {
      try { fs.unlinkSync(temporaryPath); }
      catch (error) { cleanupError = error; }
    }
  }
  if (operationError || cleanupError) {
    return {
      synced: false,
      errors: [
        operationError ? `clock hashes could not be written safely: ${operationError.message}` : null,
        cleanupError ? `clock-hash temporary cleanup failed: ${cleanupError.message}` : null,
      ].filter(Boolean),
    };
  }
  Object.assign(manifest.clock, nextManifest.clock);
  return { synced: true, errors: [] };
}

function checkFastPassages(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const rootError = validateProjectRoot(root);
  if (rootError) {
    return {
      ok: false,
      skipped: false,
      strict: Boolean(options.strict),
      root,
      manifestPresent: false,
      admission: parseFastAdmission(""),
      errors: [rootError],
      warnings: [],
      passages: [],
      synced: false,
    };
  }
  const manifestPath = path.join(root, MANIFEST_NAME);
  const designPath = path.join(root, "DESIGN.md");
  const errors = [];
  const warnings = [];
  const manifestPresent = pathEntryExists(manifestPath);
  const safeManifestPath = manifestPresent ? regularProjectFile(root, MANIFEST_NAME) : null;
  const scaffold = readScaffoldStrictness(root);
  const strict = Boolean(options.strict) || scaffold.strict;
  if (scaffold.error) errors.push(scaffold.error);

  let designSource = "";
  if (pathEntryExists(designPath)) {
    const safeDesignPath = regularProjectFile(root, "DESIGN.md");
    if (!safeDesignPath) errors.push("DESIGN.md must be a regular non-symlink file physically contained in the project");
    else {
      try { designSource = fs.readFileSync(safeDesignPath, "utf8"); }
      catch (error) { errors.push(`DESIGN.md cannot be read: ${error.message}`); }
    }
  }
  const admission = parseFastAdmission(designSource);

  if (!manifestPresent) {
    if (admission.decision === "USE") {
      errors.push(...admission.errors);
      errors.push("Fast-paced passage admission is USE but FAST_PASSAGES.json is missing");
    } else if (strict) {
      errors.push(...admission.errors);
    } else if (!admission.valid && admission.section) {
      errors.push(...admission.errors);
    } else if (!admission.valid) {
      warnings.push("legacy project has no FAST_PASSAGES.json and no filled fast-passage admission; structural check skipped");
    }
    return {
      ok: errors.length === 0,
      skipped: errors.length === 0,
      strict,
      root,
      manifestPresent,
      admission,
      errors,
      warnings,
      passages: [],
      synced: false,
    };
  }

  if (!safeManifestPath) {
    errors.push(`${MANIFEST_NAME} must be a regular non-symlink file physically contained in the project`);
    return {
      ok: false,
      skipped: false,
      strict,
      root,
      manifestPresent,
      admission,
      errors,
      warnings,
      passages: [],
      synced: false,
    };
  }

  if (!admission.valid) errors.push(...admission.errors);
  if (admission.decision === "PASS") {
    errors.push("FAST_PASSAGES.json exists but Fast-paced passage admission is PASS; remove the manifest or change the admission to USE with rationale");
  } else if (admission.decision !== "USE") {
    errors.push("FAST_PASSAGES.json requires Fast-paced passage admission `Decision: USE`");
  }

  const manifestParseErrors = [];
  const manifestSnapshot = {};
  const manifest = readJsonFile(safeManifestPath, MANIFEST_NAME, manifestParseErrors, manifestSnapshot);
  errors.push(...manifestParseErrors);
  if (manifest === null) {
    return {
      ok: false,
      skipped: false,
      strict,
      root,
      manifestPresent,
      admission,
      errors,
      warnings,
      passages: [],
      synced: false,
    };
  }

  const validation = validateFastManifest({ root, manifest, syncClock: Boolean(options.syncClock) });
  errors.push(...validation.nonClockErrors);
  warnings.push(...validation.warnings);
  let synced = false;
  if (options.syncClock) {
    if (errors.length === 0) {
      const syncResult = syncClockHashes({ root, manifest, manifestSnapshot: manifestSnapshot.value, validation });
      errors.push(...syncResult.errors);
      synced = syncResult.synced;
    }
  } else {
    errors.push(...validation.clockErrors);
  }

  return {
    ok: errors.length === 0,
    skipped: false,
    strict,
    root,
    manifestPresent,
    admission,
    errors,
    warnings,
    passages: validation.passages,
    synced,
  };
}

module.exports = {
  CLOCK_HASH_FIELDS,
  CLOCK_PATHS,
  EPSILON,
  ID_RE,
  INTENTS,
  MANIFEST_NAME,
  ROLE_ORDER,
  SCHEMA,
  SHA256_RE,
  checkFastPassages,
  isFastAdmissionHeading,
  parseFastAdmission,
  safeProjectPath,
  sha256File,
  syncClockHashes,
  validateFastManifest,
};
