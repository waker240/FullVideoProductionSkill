// scripts/check.cjs — run lint + validate + inspect with the heavy narration
// audio temporarily neutralized, so headless Chrome's 10s navigation timeout
// isn't blocked by the multi-MB audio download. The audio element is a single
// known-good continuous track; validate/inspect examine DOM + timeline + layout,
// not the audio payload. Restores index.html afterward (always).
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const ROOT = path.resolve(__dirname, "..");
const idx = path.join(ROOT, "index.html");
const lock = path.join(ROOT, ".hyperframes-audio-wrapper.lock");
let lockFd = null;
let lockOwnership = null;
const HF_VERSION = process.env.HF_VERSION || "0.7.17";
if (!isSemverLike(HF_VERSION)) {
  console.error("HF_VERSION must be a semver-like version string");
  process.exit(2);
}
try { assertSafeIndexFile(); }
catch (error) {
  console.error(`Refusing to run HyperFrames checks: ${error.message}`);
  process.exit(2);
}
runSpatialCanvasCheck();
runFastPassagesCheck();
acquireLock("check");
let orig;
let indexMode;
try {
  const indexStat = assertSafeIndexFile();
  indexMode = indexStat.mode & 0o777;
  orig = fs.readFileSync(idx, "utf8");
} catch (error) {
  releaseLock();
  console.error(`Refusing to run HyperFrames checks: ${error.message}`);
  process.exit(2);
}

// For headless validate/inspect, REMOVE the audio element entirely. Proven:
// the compositions validate clean ("No console errors") without it, but the
// harness's navigation condition won't settle while ANY <audio> is mounted
// (independent of file size — even a 4KB silent clip blocks it). The narration
// is a single known-good continuous track, verified separately via ffprobe and
// played by the framework in preview/render. Lint still runs on the real file.
// Strip EVERY <audio> element (narration, bgm, sfx tracks — headless nav cannot
// settle while ANY <audio> is mounted). Comment markers are left so a diff is obvious.
const AUDIO_RE = /<audio\b[^>]*>[\s\S]*?<\/audio\s*>/gi;
const audioCount = (orig.match(AUDIO_RE) || []).length;
const stripped = orig.replace(AUDIO_RE, "<!-- audio omitted for headless checks -->");

function run(args) {
  const npxArgs = ["--yes", `hyperframes@${HF_VERSION}`, ...args];
  const runner = npxRunner(npxArgs);
  try { console.log(execFileSync(runner.file, runner.args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], windowsHide: true })); return true; }
  catch (e) { console.log((e.stdout || "") + (e.stderr || "")); return false; }
}

let ok = true;
try {
  // lint sees the REAL file (catches media issues on the actual audio element)
  console.log("=== lint ===");     ok = run(["lint"]) && ok;
  // validate + inspect run on the audio-stripped DOM (headless nav can't settle
  // with an <audio> mounted; structure/timeline/layout are unaffected)
  writeIndexAtomic(stripped, indexMode);
  console.log("=== validate ==="); ok = run(["validate", "--timeout", "6000"]) && ok;
  console.log("=== inspect ===");  ok = run(["inspect"]) && ok;
} finally {
  try {
    writeIndexAtomic(orig, indexMode); // ALWAYS restore the real audio
    const now = (fs.readFileSync(idx, "utf8").match(AUDIO_RE) || []).length;
    if (now !== audioCount) { console.error(`✗ AUDIO RESTORE FAILED — expected ${audioCount} <audio>, found ${now}. Restore index.html from git NOW.`); ok = false; }
    else console.log(`\n(index.html restored — ${now} audio track(s) intact)`);
  } catch (error) {
    console.error(`✗ AUDIO RESTORE FAILED — ${error.message}. Restore index.html from git NOW.`);
    ok = false;
  } finally {
    releaseLock();
  }
}
process.exit(ok ? 0 : 1);

function isSemverLike(value) {
  return typeof value === "string"
    && value.length <= 128
    && /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(value);
}

function npxRunner(args) {
  if (process.platform !== "win32") return { file: "npx", args };
  // .cmd shims need cmd.exe on Windows. Every token is independently
  // allowlisted before it enters cmd's single command-string argument.
  if (!args.every((arg) => /^[0-9A-Za-z@._+=-]+$/.test(arg))) {
    throw new Error("Refusing unsafe npx argument on Windows");
  }
  return {
    file: process.env.ComSpec || process.env.COMSPEC || "cmd.exe",
    args: ["/d", "/s", "/c", ["npx.cmd", ...args].join(" ")],
  };
}

function assertSafeIndexFile() {
  const relative = path.relative(ROOT, idx);
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error("index.html must be lexically contained in the project");
  }

  const segments = relative.split(path.sep).filter(Boolean);
  const paths = [ROOT];
  let current = ROOT;
  for (const segment of segments) {
    current = path.join(current, segment);
    paths.push(current);
  }
  let leafStat = null;
  for (let i = 0; i < paths.length; i++) {
    const candidate = paths[i];
    let stat;
    try { stat = fs.lstatSync(candidate); }
    catch (error) {
      if (error.code === "ENOENT") throw new Error(`${path.relative(ROOT, candidate) || "project root"} does not exist`);
      throw error;
    }
    const leaf = i === paths.length - 1;
    const label = path.relative(ROOT, candidate) || "project root";
    if (stat.isSymbolicLink()) throw new Error(`${label} must not be a symlink`);
    if (leaf) {
      if (!stat.isFile()) throw new Error(`${label} must be a regular non-symlink file`);
      leafStat = stat;
    } else if (!stat.isDirectory()) {
      throw new Error(`${label} must be a directory, not a special filesystem entry`);
    }
  }

  const physicalRoot = fs.realpathSync(ROOT);
  const physicalIndex = fs.realpathSync(idx);
  const physicalRelative = path.relative(physicalRoot, physicalIndex);
  if (physicalRelative === ".." || physicalRelative.startsWith(`..${path.sep}`) || path.isAbsolute(physicalRelative)) {
    throw new Error("index.html physically escapes the project");
  }
  return leafStat;
}

function writeIndexAtomic(text, mode) {
  assertSafeIndexFile();
  const temporary = path.join(ROOT, `.index.html.hf-check-${process.pid}-${crypto.randomBytes(8).toString("hex")}.tmp`);
  try {
    fs.writeFileSync(temporary, text, { encoding: "utf8", flag: "wx", mode });
    const tempStat = fs.lstatSync(temporary);
    if (tempStat.isSymbolicLink() || !tempStat.isFile()) throw new Error("atomic index temporary is not a regular file");
    const physicalRoot = fs.realpathSync(ROOT);
    const physicalTemp = fs.realpathSync(temporary);
    const relative = path.relative(physicalRoot, physicalTemp);
    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error("atomic index temporary physically escapes the project");
    }
    assertSafeIndexFile();
    fs.renameSync(temporary, idx);
  } finally {
    try { fs.unlinkSync(temporary); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
}

function acquireLock(command) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      lockFd = fs.openSync(lock, "wx+");
      const token = crypto.randomBytes(16).toString("hex");
      lockOwnership = { token, stat: fs.fstatSync(lockFd), initialized: false };
      fs.writeFileSync(lockFd, JSON.stringify({ pid: process.pid, command, token, startedAt: new Date().toISOString() }));
      fs.fsyncSync(lockFd);
      lockOwnership.stat = fs.fstatSync(lockFd);
      lockOwnership.initialized = true;
      return;
    } catch (error) {
      if (error.code !== "EEXIST") {
        releaseLock();
        throw error;
      }
      const snapshot = inspectExistingLock();
      if (snapshot.changed) continue;
      if (snapshot.unsafe) {
        console.error(`Refusing unsafe audio-wrapper lock: ${snapshot.unsafe}. Remove it manually after inspection.`);
        process.exit(2);
      }
      const { owner, stat } = snapshot;
      const ageMs = Date.now() - stat.mtimeMs;
      if ((owner.pid && !pidAlive(owner.pid)) || (!owner.pid && ageMs > 30000)) {
        if (unlinkMatchingLock(snapshot)) continue;
        continue;
      }
      console.error(`Another audio-stripping wrapper is active (${owner.command || "unknown"}, PID ${owner.pid || "unknown"}). Run check/snapshot sequentially; both temporarily edit index.html.`);
      process.exit(2);
    }
  }
  console.error("Could not acquire the audio-wrapper lock after stale-lock recovery. Refusing to edit index.html.");
  process.exit(2);
}
function pidAlive(pid) { try { process.kill(Number(pid), 0); return true; } catch { return false; } }
function releaseLock() {
  try {
    if (lockFd != null && lockOwnership) {
      let pathStat = null;
      try { pathStat = fs.lstatSync(lock); } catch {}
      if (pathStat && pathStat.isFile() && !pathStat.isSymbolicLink()
        && sameFilesystemEntry(pathStat, lockOwnership.stat)) {
        const owner = readLockOwnerFromFd(lockFd, fs.fstatSync(lockFd).size);
        if (!lockOwnership.initialized || owner?.token === lockOwnership.token) {
          try { fs.unlinkSync(lock); } catch {}
        }
      }
    }
  } finally {
    try { if (lockFd != null) fs.closeSync(lockFd); } catch {}
  }
  lockFd = null;
  lockOwnership = null;
}

function readLockOwnerFromFd(fd, size) {
  try {
    const byteLength = Math.min(Math.max(Number(size) || 0, 0), 8192);
    const buffer = Buffer.alloc(byteLength);
    const read = byteLength ? fs.readSync(fd, buffer, 0, byteLength, 0) : 0;
    return JSON.parse(buffer.subarray(0, read).toString("utf8"));
  } catch { return null; }
}

function sameFilesystemEntry(left, right) {
  if (!left || !right) return false;
  if (left.ino || right.ino) return left.dev === right.dev && left.ino === right.ino;
  return left.dev === right.dev && left.size === right.size && left.birthtimeMs === right.birthtimeMs;
}

function inspectExistingLock() {
  let before;
  try { before = fs.lstatSync(lock); }
  catch (error) {
    if (error.code === "ENOENT") return { changed: true };
    throw error;
  }
  if (before.isSymbolicLink() || !before.isFile()) {
    return { unsafe: "lock path is a symlink or non-regular filesystem entry", changed: false };
  }
  let owner = {};
  try { owner = JSON.parse(fs.readFileSync(lock, "utf8")); } catch {}
  let after;
  try { after = fs.lstatSync(lock); }
  catch (error) {
    if (error.code === "ENOENT") return { changed: true };
    throw error;
  }
  if (!sameFilesystemEntry(before, after)) return { changed: true };
  return { owner, stat: after, changed: false, unsafe: null };
}

function unlinkMatchingLock(snapshot) {
  let current;
  try { current = fs.lstatSync(lock); }
  catch (error) {
    if (error.code === "ENOENT") return true;
    throw error;
  }
  if (current.isSymbolicLink() || !current.isFile() || !sameFilesystemEntry(current, snapshot.stat)) return false;
  if (snapshot.owner.token) {
    let currentOwner = null;
    try { currentOwner = JSON.parse(fs.readFileSync(lock, "utf8")); } catch {}
    if (currentOwner?.token !== snapshot.owner.token) return false;
  }
  try { fs.unlinkSync(lock); return true; }
  catch (error) { return error.code === "ENOENT"; }
}

function runSpatialCanvasCheck() {
  const checker = path.join(__dirname, "check-spatial-canvas.cjs");
  const indexWithoutComments = pathEntryExists(idx)
    ? fs.readFileSync(idx, "utf8").replace(/<!--[\s\S]*?(?:-->|$)/g, "")
    : "";
  const declared = pathEntryExists(path.join(ROOT, "SPATIAL_CANVAS.json"))
    || /data-hf-spatial-(?:canvas|world|host|region|landmark|connector|portal)\s*=/.test(indexWithoutComments);
  if (!fs.existsSync(checker)) {
    if (declared) {
      console.error("Spatial Canvas is declared but scripts/check-spatial-canvas.cjs is missing. Refresh the managed HyperFrames scripts.");
      process.exit(1);
    }
    return;
  }
  try {
    console.log(execFileSync(process.execPath, [checker], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
  } catch (error) {
    console.log((error.stdout || "") + (error.stderr || ""));
    process.exit(error.status || 1);
  }
}

function runFastPassagesCheck() {
  const checker = path.join(__dirname, "check-fast-passages.cjs");
  const manifestPath = path.join(ROOT, "FAST_PASSAGES.json");
  const scaffoldPath = path.join(ROOT, ".hyperframes-scaffold.json");
  const designPath = path.join(ROOT, "DESIGN.md");
  // existsSync follows symlinks, so a dangling control-file symlink otherwise
  // looks absent and can silently disable a missing checker. lstat preserves
  // the existence of every directory entry, including broken symlinks.
  const declared = pathEntryExists(manifestPath);
  const scaffoldState = inspectFastScaffold(scaffoldPath);
  const designState = inspectFastDesign(designPath);
  const strict = scaffoldState.strict;
  if (!fs.existsSync(checker)) {
    if (declared || scaffoldState.invalid || strict || designState.declared || designState.invalid) {
      console.error("Fast-passage admission is required or declared but scripts/check-fast-passages.cjs is missing. Refresh the managed HyperFrames scripts.");
      process.exit(1);
    }
    return;
  }
  try {
    const args = [checker, "--root", ROOT];
    if (strict) args.push("--strict");
    console.log(execFileSync(process.execPath, args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
  } catch (error) {
    console.error((error.stdout || "") + (error.stderr || ""));
    process.exit(error.status || 1);
  }
}

function visibleControlMarkdown(value) {
  const source = String(value || "")
    .replace(/<!--[\s\S]*?(?:-->|$)/g, "")
    .replace(/<(pre|code)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, "");
  let fence = null;
  return source.split(/\r?\n/).map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (!fence && marker) {
      fence = { character: marker[1][0], length: marker[1].length };
      return "";
    }
    if (fence) {
      const candidate = line.trim();
      if (candidate.length >= fence.length
        && [...candidate].every((character) => character === fence.character)) fence = null;
      return "";
    }
    if (/^(?: {4}|\t)/.test(line)) return "";
    return line;
  }).join("\n");
}

function inspectFastDesign(file) {
  if (!pathEntryExists(file)) return { declared: false, invalid: false };
  try {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile()) return { declared: true, invalid: true };
    const visible = visibleControlMarkdown(fs.readFileSync(file, "utf8"));
    const headings = [...visible.matchAll(/^#{1,6}[ \t]+(.+?)\s*$/gm)].map((match) => match[1]
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]+/g, " ")
      .replace(/[–—_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim());
    const declared = headings.some((heading) => heading.includes("admission")
      && (heading.includes("fast paced") || heading.includes("fast passage") || heading.includes("fast editing")));
    return { declared, invalid: false };
  } catch {
    return { declared: true, invalid: true };
  }
}

function pathEntryExists(file) {
  try {
    fs.lstatSync(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
    throw error;
  }
}

function inspectFastScaffold(file) {
  if (!pathEntryExists(file)) return { strict: false, invalid: false };
  try {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile()) return { strict: false, invalid: true };
    const scaffold = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!scaffold || typeof scaffold !== "object" || Array.isArray(scaffold)) {
      return { strict: false, invalid: true };
    }
    const recognizedShape = scaffold.schemaVersion === 2
      && typeof scaffold.provider === "string" && scaffold.provider.trim().toLowerCase() === "fish"
      && Array.isArray(scaffold.files) && scaffold.files.length > 0
      && scaffold.files.every((entry) => entry && typeof entry === "object" && !Array.isArray(entry)
        && typeof entry.target === "string" && entry.target.trim().length > 0
        && typeof entry.source === "string" && entry.source.trim().length > 0
        && typeof entry.managed === "boolean");
    if (!recognizedShape) return { strict: false, invalid: true };
    if (Object.hasOwn(scaffold, "ambitionContractVersion")
      && (!Number.isInteger(scaffold.ambitionContractVersion) || scaffold.ambitionContractVersion < 1)) {
      return { strict: false, invalid: true };
    }
    return { strict: Number(scaffold.ambitionContractVersion || 0) >= 2, invalid: false };
  } catch {
    return { strict: false, invalid: true };
  }
}
