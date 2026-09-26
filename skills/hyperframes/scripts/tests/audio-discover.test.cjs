"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const WRAPPER = path.resolve(__dirname, "..", "audio-discover.cjs");

test("project .env configures a user-owned skill and catalog without a private media library", () => {
  withTemporaryRoot("hf explicit media setup ", root => {
    const project = path.join(root, "project");
    const skill = path.join(root, "installed-skill");
    fs.mkdirSync(project, {recursive:true}); fs.mkdirSync(path.join(skill,"scripts"), {recursive:true});
    fs.writeFileSync(path.join(skill,"scripts","catalog.mjs"), "process.stdout.write(JSON.stringify(process.argv.slice(2)));");
    fs.writeFileSync(path.join(project,"catalog.json"), "[]");
    fs.writeFileSync(path.join(project,".env"), `MEDIA_USE_SKILL_DIR=${skill.replace(/\\/g,"/")}\nMEDIA_CATALOG=catalog.json\n`);
    const environment = {...process.env}; delete environment.MEDIA_USE_SKILL_DIR; delete environment.MEDIA_CATALOG;
    const result=spawnSync(process.execPath,[WRAPPER,"--type","sfx"],{cwd:project,env:environment,encoding:"utf8"});
    assert.equal(result.status,0,result.stderr);
    assert.deepEqual(JSON.parse(result.stdout),["--workspace",fs.realpathSync(project),"--type","sfx","--catalog",fs.realpathSync(path.join(project,"catalog.json"))]);
  });
});

test("discovers media-use from the project workspace and forwards arguments without a shell", () => {
  withTemporaryRoot("hf audio discovery ", (root) => {
    const project = path.join(root, "hyperframesProjects", "project with spaces");
    fs.mkdirSync(project, { recursive: true });
    installFakeCatalog(root, `
      process.stdout.write(JSON.stringify({ argv: process.argv.slice(2), cwd: process.cwd() }));
    `);

    const query = "keyboard typing; not a shell command";
    const result = run(WRAPPER, ["--type", "sfx", "--query", query, "--limit", "4"], project);
    assert.equal(result.status, 0, result.stderr);
    const received = JSON.parse(result.stdout);
    assert.deepEqual(received.argv, [
      "--workspace", fs.realpathSync(root),
      "--type", "sfx",
      "--query", query,
      "--limit", "4",
    ]);
    assert.equal(received.cwd, fs.realpathSync(project));
  });
});

test("a scaffolded copy falls back to its script location and preserves the caller project", () => {
  withTemporaryRoot("hf wrapper fallback ", (root) => {
    const project = path.join(root, "show", "act one");
    const scripts = path.join(project, "scripts");
    const unrelatedCwd = fs.mkdtempSync(path.join(os.tmpdir(), "hf unrelated cwd "));
    try {
      fs.mkdirSync(scripts, { recursive: true });
      fs.copyFileSync(WRAPPER, path.join(scripts, "audio-discover.cjs"));
      installFakeCatalog(root, `
        process.stdout.write(JSON.stringify({ argv: process.argv.slice(2), cwd: process.cwd() }));
      `);

      const result = run(path.join(scripts, "audio-discover.cjs"), ["--id", "ui-click"], unrelatedCwd);
      assert.equal(result.status, 0, result.stderr);
      const received = JSON.parse(result.stdout);
      assert.deepEqual(received.argv, ["--workspace", fs.realpathSync(root), "--id", "ui-click"]);
      assert.equal(received.cwd, fs.realpathSync(unrelatedCwd));
    } finally {
      fs.rmSync(unrelatedCwd, { recursive: true, force: true });
    }
  });
});

test("normalizes repeatable explicit catalogs only after proving they are workspace-local plain files", () => {
  withTemporaryRoot("hf explicit catalogs ", (root) => {
    const project = path.join(root, "project");
    const first = path.join(root, "mediaReview", "first", "catalog.json");
    const second = path.join(root, "mediaReview", "second", "catalog.json");
    fs.mkdirSync(project, { recursive: true });
    fs.mkdirSync(path.dirname(first), { recursive: true });
    fs.mkdirSync(path.dirname(second), { recursive: true });
    fs.writeFileSync(first, "{}\n");
    fs.writeFileSync(second, "{}\n");
    installFakeCatalog(root, `
      process.stdout.write(JSON.stringify({ argv: process.argv.slice(2), cwd: process.cwd() }));
    `);

    const result = run(WRAPPER, [
      "--catalog", path.relative(root, first),
      `--catalog=${fs.realpathSync(second)}`,
      "--type", "sfx",
    ], project);
    assert.equal(result.status, 0, result.stderr);
    const received = JSON.parse(result.stdout);
    assert.deepEqual(received.argv, [
      "--workspace", fs.realpathSync(root),
      "--catalog", fs.realpathSync(first),
      "--catalog", fs.realpathSync(second),
      "--type", "sfx",
    ]);
  });
});

test("rejects outside, symlinked, dangling, and non-file explicit catalogs before execution", () => {
  withTemporaryRoot("hf unsafe catalogs ", (root) => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "hf outside catalogs "));
    try {
      const project = path.join(root, "project");
      const marker = path.join(root, "catalog-executed");
      const outsideCatalog = path.join(outside, "catalog.json");
      const insideDirectory = path.join(root, "mediaReview", "unsafe");
      fs.mkdirSync(project, { recursive: true });
      fs.mkdirSync(insideDirectory, { recursive: true });
      fs.writeFileSync(outsideCatalog, "{}\n");
      installFakeCatalog(root, `
        import { writeFileSync } from "node:fs";
        writeFileSync(${JSON.stringify(marker)}, "executed");
      `);

      const outsideResult = run(WRAPPER, ["--catalog", outsideCatalog], project);
      assert.equal(outsideResult.status, 1);
      assert.match(outsideResult.stderr, /must stay inside the managed workspace/);

      const linked = path.join(insideDirectory, "linked.json");
      fs.symlinkSync(outsideCatalog, linked);
      const linkedResult = run(WRAPPER, ["--catalog", path.relative(root, linked)], project);
      assert.equal(linkedResult.status, 1);
      assert.match(linkedResult.stderr, /may not contain symlinks/);

      const dangling = path.join(insideDirectory, "dangling.json");
      fs.symlinkSync(path.join(outside, "missing.json"), dangling);
      const danglingResult = run(WRAPPER, ["--catalog", path.relative(root, dangling)], project);
      assert.equal(danglingResult.status, 1);
      assert.match(danglingResult.stderr, /may not contain symlinks/);

      const directoryResult = run(WRAPPER, ["--catalog", path.relative(root, insideDirectory)], project);
      assert.equal(directoryResult.status, 1);
      assert.match(directoryResult.stderr, /regular non-symlink file/);
      assert.equal(fs.existsSync(marker), false);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test("rejects a discovery executable reached through a symlinked expected path", () => {
  withTemporaryRoot("hf linked discovery ", (root) => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "hf discovery outside "));
    try {
      const project = path.join(root, "project");
      const scripts = path.join(project, "scripts");
      const outsideAgents = path.join(outside, ".agents");
      const outsideCatalog = path.join(outsideAgents, "skills", "media-use", "scripts", "catalog.mjs");
      const marker = path.join(root, "discovery-executed");
      fs.mkdirSync(scripts, { recursive: true });
      fs.mkdirSync(path.dirname(outsideCatalog), { recursive: true });
      fs.copyFileSync(WRAPPER, path.join(scripts, "audio-discover.cjs"));
      fs.writeFileSync(outsideCatalog, `
        import { writeFileSync } from "node:fs";
        writeFileSync(${JSON.stringify(marker)}, "executed");
      `);
      fs.symlinkSync(outsideAgents, path.join(root, ".agents"), "dir");

      const result = run(path.join(scripts, "audio-discover.cjs"), [], project);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Could not find \.agents\/skills\/media-use\/scripts\/catalog\.mjs/);
      assert.equal(fs.existsSync(marker), false);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test("reserves long and short workspace overrides and propagates catalog failures", () => {
  withTemporaryRoot("hf wrapper failures ", (root) => {
    const project = path.join(root, "project");
    fs.mkdirSync(project, { recursive: true });
    installFakeCatalog(root, "process.exit(7);");

    const failedCatalog = run(WRAPPER, ["--type", "music"], project);
    assert.equal(failedCatalog.status, 7);

    const overridden = run(WRAPPER, ["--workspace", "/tmp/not-the-workspace"], project);
    assert.equal(overridden.status, 1);
    assert.match(overridden.stderr, /--workspace is managed by the HyperFrames wrapper/);

    const shortOverride = run(WRAPPER, ["-w", "/tmp/not-the-workspace"], project);
    assert.equal(shortOverride.status, 1);
    assert.match(shortOverride.stderr, /--workspace is managed by the HyperFrames wrapper/);

    const attachedShortOverride = run(WRAPPER, ["-w/tmp/not-the-workspace"], project);
    assert.equal(attachedShortOverride.status, 1);
    assert.match(attachedShortOverride.stderr, /--workspace is managed by the HyperFrames wrapper/);
  });
});

test("reports a useful error when neither project nor wrapper belongs to a media-use workspace", () => {
  withTemporaryRoot("hf wrapper missing ", (root) => {
    const isolated = path.join(root, "isolated", "scripts");
    fs.mkdirSync(isolated, { recursive: true });
    const isolatedWrapper = path.join(isolated, "audio-discover.cjs");
    fs.copyFileSync(WRAPPER, isolatedWrapper);

    const result = run(isolatedWrapper, [], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Could not find \.agents\/skills\/media-use\/scripts\/catalog\.mjs/);
    assert.match(result.stderr, /Searched upward from the current project/);
  });
});

test("help is project-facing and does not advertise an unavailable catalog script", () => {
  const result = run(WRAPPER, ["--help"], process.cwd());
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /npm run audio:discover/);
  assert.match(result.stdout, /node scripts\/audio-discover\.cjs/);
  assert.doesNotMatch(result.stdout, /node catalog\.mjs/);
  assert.doesNotMatch(result.stdout, /--workspace, -w/);
});

function installFakeCatalog(root, source) {
  const directory = path.join(root, ".agents", "skills", "media-use", "scripts");
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "catalog.mjs"), source, "utf8");
}

function run(script, args, cwd) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8",
    env: process.env,
  });
}

function withTemporaryRoot(prefix, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  try {
    callback(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
