// scripts/skill-doctor.cjs — health check for the skill's self-improvement loop.
// Zero deps. Run from anywhere: node .agents/skills/hyperframes/scripts/skill-doctor.cjs
// Public portability adaptation: historical learnings inboxes are optional.
// Checks: (1) prose budgets on the build read-surface, (2) optional LEARNINGS inbox size
// and staleness, (3) entry format. Advisory by default; --strict exits 1 on warnings.
// --budgets-only runs canonical checks without opening the learnings inbox.
"use strict";
const fs = require("fs");
const path = require("path");
const SKILL = path.resolve(__dirname, "..");
const strict = process.argv.includes("--strict");
const budgetsOnly = process.argv.includes("--budgets-only");
let warnings = 0;
const warn = (m) => { warnings++; console.log("  ⚠ " + m); };
const ok = (m) => console.log("  ✓ " + m);

// ── 1 · budgets (keep in sync with references/self-improvement.md §4) ──
const LINE_BUDGETS = {
  "SKILL.md": 170,
  "references/pipeline.md": 230,
  "references/audio-direction.md": 190,
  "references/capability-palette.md": 170,
  "references/asset-foundry.md": 130,
  "references/direction-and-audit.md": 150,
};
const SIZE_BUDGETS = { "references/technique-library.md": 52 * 1024 };

console.log("== budgets ==");
for (const [rel, cap] of Object.entries(LINE_BUDGETS)) {
  const p = path.join(SKILL, rel);
  if (!fs.existsSync(p)) { warn(`${rel} MISSING`); continue; }
  const n = fs.readFileSync(p, "utf8").split("\n").length;
  n > cap ? warn(`${rel} over budget: ${n}/${cap} lines — tighten before adding more`)
          : ok(`${rel} ${n}/${cap} lines`);
}
for (const [rel, cap] of Object.entries(SIZE_BUDGETS)) {
  const p = path.join(SKILL, rel);
  if (!fs.existsSync(p)) { warn(`${rel} MISSING`); continue; }
  const b = fs.statSync(p).size;
  b > cap ? warn(`${rel} over budget: ${(b / 1024).toFixed(1)}/${cap / 1024} KB — prune stale sections`)
          : ok(`${rel} ${(b / 1024).toFixed(1)}/${cap / 1024} KB`);
}
const canonicalMd = ["SKILL.md", ...walkMd(path.join(SKILL, "references")), ...walkMd(path.join(SKILL, "templates"))];
const conflicts = canonicalMd.filter((rel) => /^\s*(<<<<<<<|=======|>>>>>>>)\s*.*$/m.test(fs.readFileSync(path.join(SKILL, rel), "utf8")));
conflicts.length ? warn(`merge-conflict marker(s): ${conflicts.join(", ")}`) : ok("no merge-conflict markers in canonical markdown");

if (budgetsOnly) {
  console.log("== budgets-only: learnings inbox not read ==");
  finish();
}

// ── 2 · learnings inbox ──
console.log("== learnings inbox ==");
const lp = path.join(SKILL, "LEARNINGS.md");
if (!fs.existsSync(lp)) { ok("optional historical inbox absent; keep new retrospectives in the project"); finish(); }
const lines = fs.readFileSync(lp, "utf8").split(/\r?\n/);
const marker = lines.findIndex((line) => /entries below/i.test(line));
const inboxLines = marker >= 0 ? lines.slice(marker + 1) : lines;
const ENTRY = /^- \[(new|promoted|rejected)\] (\d{4}-\d{2}-\d{2}) · [^·]+ · (trap|technique|tuning|asset|voice) · .+ · evidence: .+$/;
const candidates = inboxLines.filter((line) => /^- /.test(line) || /^#{1,6}\s+\S/.test(line) || /^\d{4}-\d{2}-\d{2}\b/.test(line));
const parsed = candidates.map((line) => line.match(ENTRY)).filter(Boolean);
const bad = candidates.length - parsed.length;
if (bad) warn(`${bad} malformed inbox entr${bad > 1 ? "ies" : "y"} (every post-marker bullet/date line must match the full one-line format)`);
const byStatus = { new: 0, promoted: 0, rejected: 0 };
const now = Date.now();
let stale = 0;
for (const m of parsed) {
  byStatus[m[1]]++;
  if (m[1] === "new" && now - Date.parse(m[2]) > 60 * 86400e3) stale++;
}
ok(`${parsed.length} entries — new:${byStatus.new} promoted:${byStatus.promoted} rejected:${byStatus.rejected}`);
if (byStatus.new >= 40) warn(`inbox FULL (${byStatus.new}/40 pending) — consolidate NOW (references/self-improvement.md)`);
else if (byStatus.new >= 12) warn(`${byStatus.new} pending learnings — run a consolidation pass soon`);
if (stale) warn(`${stale} pending entr${stale > 1 ? "ies" : "y"} older than 60 days — promote or delete`);
if (byStatus.promoted + byStatus.rejected > 5) warn(`${byStatus.promoted + byStatus.rejected} settled entries lingering — delete them (git is the archive)`);

finish();
function walkMd(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMd(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(path.relative(SKILL, full));
  }
  return out;
}
function finish() {
  console.log(warnings ? `\n${warnings} warning(s).` : "\nhealthy — nothing to do.");
  process.exit(strict && warnings ? 1 : 0);
}
