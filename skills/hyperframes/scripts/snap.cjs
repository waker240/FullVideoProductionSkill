// scripts/snap.cjs — snapshot frames with the narration audio stripped in-memory
// (headless nav can't settle with <audio> mounted). ALWAYS restores index.html.
//   node scripts/snap.cjs 595 635 770 1005 1105
//   node scripts/snap.cjs --spatial   # every manifest visit/excursion global reviewAt
//
// TIMES ARE ABSOLUTE (GLOBAL) SECONDS on the assembled index.html timeline.
// Use the real playhead second you'd scrub to in the full film — the same
// numbers you'd give `render`. This is the ONLY mode that renders correctly:
// at a global second every scene mount, its assets (plates/cutouts/clips/BGM)
// and its proxy `t` are all positioned and loaded. Do NOT pass per-scene LOCAL
// seconds (a beat's offset from its own scene start) or snapshot a bare scene
// file in isolation — the mount's assets won't be wired at that context and
// the frame renders empty/broken. Convert a local beat to global first:
//   global = scene data-start + local offset.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { spatialReviewTimes } = require("./lib/spatial-canvas.cjs");
const argv = process.argv.slice(2);
let rootOption = null;
let spatial = false;
const manualTimes = [];
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === "--root") {
    if (!argv[i + 1] || argv[i + 1].startsWith("-")) { console.error("snapshot --root requires a project path"); process.exit(2); }
    rootOption = argv[++i];
  } else if (arg === "--spatial") spatial = true;
  else if (arg.startsWith("-")) { console.error(`unknown snapshot argument: ${arg}`); process.exit(2); }
  else manualTimes.push(Number(arg));
}
const ROOT = rootOption ? path.resolve(process.cwd(), rootOption) : path.resolve(__dirname, "..");
const idx = path.join(ROOT, "index.html");
const lock = path.join(ROOT, ".hyperframes-audio-wrapper.lock");
let lockFd = null;
let lockOwnership = null;
if (manualTimes.some((value) => !Number.isFinite(value) || value < 0)) {
  console.error("snapshot times must be finite, non-negative GLOBAL seconds");
  process.exit(1);
}
let routeTimes = [];
try { if (spatial) routeTimes = spatialReviewTimes(ROOT); }
catch (error) { console.error(error.message); process.exit(1); }
const times = [...new Set([...manualTimes, ...routeTimes])].sort((a, b) => a - b);
if (!times.length) { console.error("usage: node scripts/snap.cjs [--root <project>] [--spatial] <GLOBAL_sec> [GLOBAL_sec...]  (absolute playhead seconds on index.html; NOT per-scene local time)"); process.exit(1); }
if (spatial) console.log(`Spatial Canvas review samples (GLOBAL): ${routeTimes.join(", ")}`);
acquireLock("snapshot");
const orig = fs.readFileSync(idx, "utf8");

const AUDIO_RE = /<audio\b[^>]*>[\s\S]*?<\/audio\s*>/gi;
const audioCount = (orig.match(AUDIO_RE) || []).length;
const stripped = orig.replace(AUDIO_RE, "<!-- audio omitted for snapshot -->");
let ok = true;
try {
  fs.writeFileSync(idx, stripped);
  const hfVersion = process.env.HF_VERSION || "0.7.17";
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(hfVersion)) throw new Error("HF_VERSION must be a semver-like version string");
  const npxArgs = ["--yes", `hyperframes@${hfVersion}`, "snapshot", "--at", times.join(",")];
  const runner = process.platform === "win32"
    ? [process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", ["npx.cmd", ...npxArgs].join(" ")]]
    : ["npx", npxArgs];
  console.log(execFileSync(runner[0], runner[1], { cwd: ROOT, encoding: "utf8", windowsHide: true }));
} catch (e) {
  console.log((e.stdout || "") + (e.stderr || ""));
  ok = false;
} finally {
  fs.writeFileSync(idx, orig);
  const now = (fs.readFileSync(idx, "utf8").match(AUDIO_RE) || []).length;
  if (now === audioCount) console.log(`(index.html restored — ${now} audio track(s) intact)`);
  else { console.log(`✗ AUDIO RESTORE FAILED (${now}/${audioCount}) — restore from git NOW`); ok = false; }
  releaseLock();
}
process.exit(ok ? 0 : 1);

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
