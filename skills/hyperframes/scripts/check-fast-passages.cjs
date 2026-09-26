#!/usr/bin/env node
"use strict";

const path = require("node:path");
const { checkFastPassages } = require("./lib/fast-passages.cjs");

function usage() {
  return [
    "Usage: node scripts/check-fast-passages.cjs [--root <project>] [--strict] [--sync-clock] [--json]",
    "",
    "Checks the opt-in FAST_PASSAGES.json contract against DESIGN.md, the locked audio clock,",
    "index duration, and mounted composition ownership. --sync-clock writes only the two clock",
    "digests, and only after every non-clock check passes.",
  ].join("\n");
}

function parseArgs(argv) {
  const parsed = { json: false, root: null, strict: false, syncClock: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--json") parsed.json = true;
    else if (arg === "--strict") parsed.strict = true;
    else if (arg === "--sync-clock") parsed.syncClock = true;
    else if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--root") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) throw new Error("--root requires a project path");
      parsed.root = value;
      index += 1;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return parsed;
}

let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(`check-fast-passages: ${error.message}`);
  console.error(usage());
  process.exit(2);
}

if (args.help) {
  console.log(usage());
  process.exit(0);
}

const root = args.root
  ? path.resolve(process.cwd(), args.root)
  : path.resolve(__dirname, "..");
const result = checkFastPassages({ root, strict: args.strict, syncClock: args.syncClock });

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  for (const warning of result.warnings) console.warn(`! ${warning}`);
  if (result.ok && result.skipped) {
    const detail = result.admission.decision === "PASS"
      ? `admission PASS — ${result.admission.rationale}`
      : "legacy project with no declared fast passage";
    console.log(`✓ no fast passages declared (${detail})`);
  } else if (result.ok) {
    if (result.synced) console.log("✓ FAST_PASSAGES.json clock hashes synchronized");
    for (const passage of result.passages) {
      console.log(`✓ ${passage.id}: ${passage.start.toFixed(3)}–${passage.end.toFixed(3)}s · ${passage.intent} · ${passage.phases.length} phases`);
    }
  } else {
    console.error("✗ fast-passage contract failed:");
    for (const error of result.errors) console.error(`  - ${error}`);
  }
}

process.exit(result.ok ? 0 : 1);
