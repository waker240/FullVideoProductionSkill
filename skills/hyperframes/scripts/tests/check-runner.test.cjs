"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const CHECK_SOURCE = path.resolve(__dirname, "..", "check.cjs");
const SNAP_SOURCE = path.resolve(__dirname, "..", "snap.cjs");
const SPATIAL_LIB_SOURCE = path.resolve(__dirname, "..", "lib", "spatial-canvas.cjs");

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function fixture(indexSource) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hf-check-runner-"));
  const scripts = path.join(root, "scripts");
  const bin = path.join(root, "fake-bin");
  fs.mkdirSync(path.join(scripts, "lib"), { recursive: true });
  fs.mkdirSync(bin);
  fs.copyFileSync(CHECK_SOURCE, path.join(scripts, "check.cjs"));
  fs.copyFileSync(SNAP_SOURCE, path.join(scripts, "snap.cjs"));
  fs.copyFileSync(SPATIAL_LIB_SOURCE, path.join(scripts, "lib", "spatial-canvas.cjs"));
  if (indexSource != null) fs.writeFileSync(path.join(root, "index.html"), indexSource);

  const log = path.join(root, "npx-argv.log");
  const stateLog = path.join(root, "npx-index-state.jsonl");
  const fakeRunner = path.join(bin, "fake-npx.cjs");
  fs.writeFileSync(fakeRunner, `"use strict";
const fs = require("node:fs");
const path = require("node:path");
const argv = process.argv.slice(2);
fs.appendFileSync(process.env.HF_TEST_LOG, argv.join(" ") + "\\n");
if (process.env.HF_TEST_REPLACE_LOCK === "1") {
  const marker = path.join(process.cwd(), ".replacement-lock-installed");
  if (!fs.existsSync(marker)) {
    const lock = path.join(process.cwd(), ".hyperframes-audio-wrapper.lock");
    try { fs.unlinkSync(lock); } catch {}
    fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, command: "replacement", token: "TEST_CREDENTIAL" }));
    fs.writeFileSync(marker, "done");
  }
}
const source = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
const command = argv.find((value) => ["lint", "validate", "inspect", "snapshot"].includes(value)) || "unknown";
fs.appendFileSync(process.env.HF_TEST_STATE_LOG, JSON.stringify({ command, audioCount: (source.match(/<audio\\b/gi) || []).length, source }) + "\\n");
`);
  if (process.platform === "win32") {
    fs.writeFileSync(path.join(bin, "npx.cmd"), `@echo off\r\n"${process.execPath}" "${fakeRunner}" %*\r\n`);
  } else {
    const fakeNpx = path.join(bin, "npx");
    fs.writeFileSync(fakeNpx, `#!/bin/sh\nexec ${shellQuote(process.execPath)} ${shellQuote(fakeRunner)} "$@"\n`);
    fs.chmodSync(fakeNpx, 0o755);
  }
  return {
    root,
    log,
    stateLog,
    script: path.join(scripts, "check.cjs"),
    snapScript: path.join(scripts, "snap.cjs"),
  };
}

function runScript(fx, script, args, hfVersion, extraEnv = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: fx.root,
    encoding: "utf8",
    env: {
      ...process.env,
      HF_VERSION: hfVersion,
      HF_TEST_LOG: fx.log,
      HF_TEST_STATE_LOG: fx.stateLog,
      PATH: `${path.join(fx.root, "fake-bin")}${path.delimiter}${process.env.PATH || ""}`,
      ...extraEnv,
    },
  });
}

function runCheck(fx, hfVersion) {
  return runScript(fx, fx.script, [], hfVersion);
}

function readStates(fx) {
  return fs.readFileSync(fx.stateLog, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
}

test("invokes npx with fixed argv for a valid semver-like HF_VERSION and restores index.html", () => {
  const original = "<!doctype html>\n<body>\n  <audio id=\"narration\"><source src=\"assets/narration.wav\"></audio>\n</body>\n";
  const fx = fixture(original);
  try {
    const result = runCheck(fx, "1.2.3-beta.1+build.7");
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.deepEqual(
      fs.readFileSync(fx.log, "utf8").trim().split(/\r?\n/),
      [
        "--yes hyperframes@1.2.3-beta.1+build.7 lint",
        "--yes hyperframes@1.2.3-beta.1+build.7 validate --timeout 6000",
        "--yes hyperframes@1.2.3-beta.1+build.7 inspect",
      ],
    );
    assert.equal(fs.readFileSync(path.join(fx.root, "index.html"), "utf8"), original);
    assert.equal(fs.existsSync(path.join(fx.root, ".hyperframes-audio-wrapper.lock")), false);
    assert.deepEqual(
      fs.readdirSync(fx.root).filter((name) => name.includes(".hf-check-") && name.endsWith(".tmp")),
      [],
    );
  } finally {
    fs.rmSync(fx.root, { recursive: true, force: true });
  }
});

test("strips byte-zero and same-line audio elements independently, then restores both", () => {
  const original = "<audio id=\"first\"></audio><span>keep me</span><audio id=\"second\"><source src=\"two.wav\"></audio>\n<p>tail</p>\n";
  const expectedStripped = "<!-- audio omitted for headless checks --><span>keep me</span><!-- audio omitted for headless checks -->\n<p>tail</p>\n";
  const fx = fixture(original);
  try {
    const result = runCheck(fx, "0.7.17");
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const states = readStates(fx);
    assert.deepEqual(states.map(({ command, audioCount }) => ({ command, audioCount })), [
      { command: "lint", audioCount: 2 },
      { command: "validate", audioCount: 0 },
      { command: "inspect", audioCount: 0 },
    ]);
    assert.equal(states[0].source, original);
    assert.equal(states[1].source, expectedStripped);
    assert.equal(states[2].source, expectedStripped);
    assert.match(result.stdout, /index\.html restored — 2 audio track\(s\) intact/);
    assert.equal(fs.readFileSync(path.join(fx.root, "index.html"), "utf8"), original);
  } finally {
    fs.rmSync(fx.root, { recursive: true, force: true });
  }
});

test("snapshot strips byte-zero and same-line audio elements independently, then restores both", () => {
  const original = "<audio id=\"first\"></audio><span>keep me</span><audio id=\"second\"></audio>\n<p>tail</p>\n";
  const expectedStripped = "<!-- audio omitted for snapshot --><span>keep me</span><!-- audio omitted for snapshot -->\n<p>tail</p>\n";
  const fx = fixture(original);
  try {
    const result = runScript(fx, fx.snapScript, ["0"], "0.7.17");
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.deepEqual(fs.readFileSync(fx.log, "utf8").trim().split(/\r?\n/), [
      "--yes hyperframes@0.7.17 snapshot --at 0",
    ]);
    const states = readStates(fx);
    assert.equal(states.length, 1);
    assert.deepEqual({ command: states[0].command, audioCount: states[0].audioCount }, { command: "snapshot", audioCount: 0 });
    assert.equal(states[0].source, expectedStripped);
    assert.match(result.stdout, /index\.html restored — 2 audio track\(s\) intact/);
    assert.equal(fs.readFileSync(path.join(fx.root, "index.html"), "utf8"), original);
  } finally {
    fs.rmSync(fx.root, { recursive: true, force: true });
  }
});

test("rejects a shell-injection HF_VERSION before npx, locking, or index mutation", { skip: process.platform === "win32" }, () => {
  const original = "<!doctype html>\n<body>safe</body>\n";
  const fx = fixture(original);
  const sentinel = path.join(fx.root, "injection-ran");
  try {
    const result = runCheck(fx, "0.7.17;touch injection-ran;#");
    assert.equal(result.status, 2, result.stdout + result.stderr);
    assert.match(result.stdout + result.stderr, /HF_VERSION must be a semver-like version string/);
    assert.equal(fs.existsSync(sentinel), false);
    assert.equal(fs.existsSync(fx.log), false);
    assert.equal(fs.existsSync(path.join(fx.root, ".hyperframes-audio-wrapper.lock")), false);
    assert.equal(fs.readFileSync(path.join(fx.root, "index.html"), "utf8"), original);
  } finally {
    fs.rmSync(fx.root, { recursive: true, force: true });
  }
});

test("refuses a symlinked index.html without overwriting its external target", { skip: process.platform === "win32" }, () => {
  const fx = fixture(null);
  const external = path.join(path.dirname(fx.root), `${path.basename(fx.root)}-external-index.html`);
  const externalSource = "external file must remain untouched\n";
  try {
    fs.writeFileSync(external, externalSource);
    fs.symlinkSync(external, path.join(fx.root, "index.html"));
    const result = runCheck(fx, "0.7.17");
    assert.equal(result.status, 2, result.stdout + result.stderr);
    assert.match(result.stdout + result.stderr, /index\.html must not be a symlink/);
    assert.equal(fs.readFileSync(external, "utf8"), externalSource);
    assert.equal(fs.lstatSync(path.join(fx.root, "index.html")).isSymbolicLink(), true);
    assert.equal(fs.existsSync(fx.log), false);
    assert.equal(fs.existsSync(path.join(fx.root, ".hyperframes-audio-wrapper.lock")), false);
  } finally {
    fs.rmSync(fx.root, { recursive: true, force: true });
    fs.rmSync(external, { force: true });
  }
});

test("corrupt fast control JSON cannot silently disable a missing fast checker", () => {
  for (const [controlFile, contents] of [
    [".hyperframes-scaffold.json", "{not-json\n"],
    [".hyperframes-scaffold.json", "{}\n"],
    [".hyperframes-scaffold.json", '{"schemaVersion":2,"provider":"fish"}\n'],
    [".hyperframes-scaffold.json", '{"schemaVersion":2,"provider":"unrecognized-provider","files":[{"target":"index.html","source":"template","managed":false}]}\n'],
    ["FAST_PASSAGES.json", "{not-json\n"],
  ]) {
    const fx = fixture("<!doctype html>\n<body>safe</body>\n");
    try {
      fs.writeFileSync(path.join(fx.root, controlFile), contents);
      const result = runCheck(fx, "0.7.17");
      assert.equal(result.status, 1, `${controlFile}\n${result.stdout}${result.stderr}`);
      assert.match(result.stdout + result.stderr, /Fast-passage admission is required or declared.*check-fast-passages\.cjs is missing/i);
      assert.equal(fs.existsSync(fx.log), false);
    } finally {
      fs.rmSync(fx.root, { recursive: true, force: true });
    }
  }
});

test("dangling fast control symlinks cannot silently disable a missing fast checker", { skip: process.platform === "win32" }, () => {
  for (const controlFile of [".hyperframes-scaffold.json", "FAST_PASSAGES.json"]) {
    const fx = fixture("<!doctype html>\n<body>safe</body>\n");
    try {
      fs.symlinkSync(path.join(fx.root, `missing-${controlFile}`), path.join(fx.root, controlFile));
      const result = runCheck(fx, "0.7.17");
      assert.equal(result.status, 1, `${controlFile}\n${result.stdout}${result.stderr}`);
      assert.match(result.stdout + result.stderr, /Fast-passage admission is required or declared.*check-fast-passages\.cjs is missing/i);
      assert.equal(fs.existsSync(fx.log), false);
      assert.equal(fs.lstatSync(path.join(fx.root, controlFile)).isSymbolicLink(), true);
    } finally {
      fs.rmSync(fx.root, { recursive: true, force: true });
    }
  }
});

test("an explicit DESIGN fast admission requires the missing fast checker without other sentinels", () => {
  const declared = fixture('<div data-composition-id="main" data-duration="2"></div>\n');
  try {
    fs.writeFileSync(path.join(declared.root, "DESIGN.md"), [
      "# Design",
      "",
      "## Fast-paced passage admission",
      "",
      "Decision: USE — A bounded pressure sequence needs compression and a readable release.",
      "",
    ].join("\n"));
    const result = runCheck(declared, "0.7.17");
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout + result.stderr, /check-fast-passages\.cjs is missing/i);
    assert.equal(fs.existsSync(declared.log), false);
  } finally {
    fs.rmSync(declared.root, { recursive: true, force: true });
  }

  const inert = fixture('<div data-composition-id="main" data-duration="2"></div>\n');
  try {
    fs.writeFileSync(path.join(inert.root, "DESIGN.md"), [
      "# Design",
      "",
      "<code>",
      "## Fast-paced passage admission",
      "Decision: USE — this example is inert.",
      "</code>",
      "",
    ].join("\n"));
    const result = runCheck(inert, "0.7.17");
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(fs.existsSync(inert.log), true);
  } finally {
    fs.rmSync(inert.root, { recursive: true, force: true });
  }
});

test("dangling Spatial Canvas manifest requires its missing checker, while an unclosed comment marker stays inert", { skip: process.platform === "win32" }, () => {
  const dangling = fixture("<!doctype html>\n<body>safe</body>\n");
  try {
    fs.symlinkSync(path.join(dangling.root, "missing-spatial.json"), path.join(dangling.root, "SPATIAL_CANVAS.json"));
    const result = runCheck(dangling, "0.7.17");
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout + result.stderr, /Spatial Canvas is declared.*check-spatial-canvas\.cjs is missing/i);
    assert.equal(fs.existsSync(dangling.log), false);
  } finally {
    fs.rmSync(dangling.root, { recursive: true, force: true });
  }

  const commented = fixture('<div data-composition-id="main" data-duration="2"></div>\n<!-- data-hf-spatial-canvas="hidden"\n');
  try {
    const result = runCheck(commented, "0.7.17");
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(fs.existsSync(commented.log), true);
  } finally {
    fs.rmSync(commented.root, { recursive: true, force: true });
  }
});

test("check and snapshot never release a replacement process's lock", () => {
  for (const kind of ["check", "snapshot"]) {
    const fx = fixture('<div data-composition-id="main" data-duration="2"></div>\n');
    try {
      const result = kind === "check"
        ? runScript(fx, fx.script, [], "0.7.17", { HF_TEST_REPLACE_LOCK: "1" })
        : runScript(fx, fx.snapScript, ["0"], "0.7.17", { HF_TEST_REPLACE_LOCK: "1" });
      assert.equal(result.status, 0, `${kind}\n${result.stdout}${result.stderr}`);
      const replacement = JSON.parse(fs.readFileSync(path.join(fx.root, ".hyperframes-audio-wrapper.lock"), "utf8"));
      assert.equal(replacement.token, "TEST_CREDENTIAL");
    } finally {
      fs.rmSync(fx.root, { recursive: true, force: true });
    }
  }
});

test("audio-wrapper lock paths must be regular files and are never followed", { skip: process.platform === "win32" }, () => {
  const fx = fixture('<div data-composition-id="main" data-duration="2"></div>\n');
  const external = path.join(path.dirname(fx.root), `${path.basename(fx.root)}-external-lock`);
  try {
    fs.writeFileSync(external, "external lock target\n");
    fs.symlinkSync(external, path.join(fx.root, ".hyperframes-audio-wrapper.lock"));
    const result = runCheck(fx, "0.7.17");
    assert.equal(result.status, 2, result.stdout + result.stderr);
    assert.match(result.stdout + result.stderr, /Refusing unsafe audio-wrapper lock/i);
    assert.equal(fs.readFileSync(external, "utf8"), "external lock target\n");
    assert.equal(fs.existsSync(fx.log), false);
  } finally {
    fs.rmSync(fx.root, { recursive: true, force: true });
    fs.rmSync(external, { force: true });
  }
});
