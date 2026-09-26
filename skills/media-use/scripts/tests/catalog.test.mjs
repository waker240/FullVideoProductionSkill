import test from "node:test";
import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const CATALOG_SCRIPT = join(import.meta.dirname, "..", "catalog.mjs");

function fixture() {
  const workspace = mkdtempSync(join(tmpdir(), "mu-catalog-test-"));
  const catalogRoot = join(workspace, "mediaReview", "reviewed-audio");
  mkdirSync(catalogRoot, { recursive: true });
  return {
    workspace,
    catalogRoot,
    cleanup() {
      rmSync(workspace, { recursive: true, force: true });
    },
  };
}

function makeAudio(path, frequency = 440) {
  mkdirSync(dirname(path), { recursive: true });
  execFileSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=${frequency}:duration=0.12`,
      "-c:a",
      "pcm_s16le",
      "-y",
      path,
    ],
    { stdio: "pipe" },
  );
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function asset(root, overrides = {}) {
  const localPath = overrides.localPath || "sfx/01-paper-transition.wav";
  const physicalPath = join(root, localPath);
  const technicalPath = overrides.technicalPath || physicalPath;
  return {
    kind: "sfx",
    id: 101,
    title: "Paper transition",
    creator: "Example Artist",
    localPath,
    sourcePage: "https://example.test/sfx",
    individualDownloadPage: "https://example.test/sfx/101",
    intendedUse: "Evidence-board paper move and spatial canvas transition",
    license: {
      name: "Example License",
      url: "https://example.test/license",
      attribution: "Example Artist",
    },
    technical: {
      codec: "pcm_s16le",
      durationSeconds: 0.12,
      bytes: statSync(technicalPath).size,
      sha256: sha256(technicalPath),
    },
    ...overrides,
    technical: {
      codec: "pcm_s16le",
      durationSeconds: 0.12,
      bytes: statSync(technicalPath).size,
      sha256: sha256(technicalPath),
      ...(overrides.technical || {}),
    },
  };
}

function writeCatalog(root, assets) {
  const path = join(root, "catalog.json");
  writeFileSync(
    path,
    JSON.stringify({ schemaVersion: 1, reviewStatus: "shared-candidates", assets }, null, 2),
  );
  return path;
}

function run(workspace, argv = [], { fail = false } = {}) {
  const result = spawnSync(
    process.execPath,
    [CATALOG_SCRIPT, "--workspace", workspace, ...argv, "--json"],
    { encoding: "utf8" },
  );
  if (!fail && result.status !== 0) {
    throw new Error(`catalog command failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  if (fail) assert.notEqual(result.status, 0, "catalog command should fail");
  return { ...result, json: JSON.parse(result.stdout.trim()) };
}

test("discovers a verified candidate by editorial alias without mutating media state", (t) => {
  const f = fixture();
  t.after(() => f.cleanup());
  const sfxPath = join(f.catalogRoot, "sfx", "01-paper-transition.wav");
  const musicPath = join(f.catalogRoot, "music", "01-fast-bed.wav");
  makeAudio(sfxPath);
  makeAudio(musicPath, 220);
  const sfx = asset(f.catalogRoot);
  const music = asset(f.catalogRoot, {
    kind: "music",
    id: 202,
    title: "Rapid editorial bed",
    localPath: "music/01-fast-bed.wav",
    technicalPath: musicPath,
    intendedUse: "Fast-paced montage and energetic editorial passage",
  });
  delete music.technicalPath;
  const catalogPath = writeCatalog(f.catalogRoot, [sfx, music]);
  const before = readFileSync(catalogPath, "utf8");

  const { json } = run(f.workspace, [
    "--type",
    "sfx",
    "--query",
    "spatial-canvas",
    "--limit",
    "1",
  ]);

  assert.equal(json.ok, true);
  assert.equal(json.read_only, true);
  assert.equal(json.review_status, "candidate");
  assert.equal(json.resolvable, false);
  assert.equal(json.count, 1);
  const candidate = json.candidates[0];
  assert.equal(candidate.type, "sfx");
  assert.equal(candidate.review_status, "candidate");
  assert.equal(candidate.resolvable, false);
  assert.ok(candidate.aliases.includes("spatial-canvas"));
  assert.equal(candidate.validation.sha256, "verified");
  assert.equal(candidate.validation.decodable_audio, true);
  assert.equal(candidate.validation.regular_non_symlink_file, true);
  assert.ok(candidate.validation.probed_duration_seconds > 0);
  assert.ok(candidate.suggested_resolve.argv.includes("--reviewed"));
  assert.ok(candidate.suggested_resolve.argv.includes("--expected-sha256"));
  assert.ok(candidate.suggested_resolve.argv.includes("--catalog-id"));
  assert.ok(candidate.suggested_resolve.argv.includes("--review-note"));
  const projectIndex = candidate.suggested_resolve.argv.indexOf("--project");
  assert.equal(candidate.suggested_resolve.argv[projectIndex + 1], ".");
  assert.match(candidate.suggested_resolve.command, /resolve\.mjs/);
  assert.match(candidate.suggested_resolve.command, /--project \./);

  const unresolved = spawnSync(
    candidate.suggested_resolve.argv[0],
    candidate.suggested_resolve.argv.slice(1),
    { cwd: f.workspace, encoding: "utf8" },
  );
  assert.equal(unresolved.status, 2);
  assert.match(unresolved.stderr, /substantive --review-note/);
  assert.equal(existsSync(join(f.workspace, ".media")), false);
  assert.equal(readFileSync(catalogPath, "utf8"), before);
  assert.equal(existsSync(join(f.workspace, ".media")), false);

  const balanced = run(f.workspace, ["--limit", "2"]).json;
  assert.deepEqual(
    new Set(balanced.candidates.map((entry) => entry.type)),
    new Set(["sfx", "bgm"]),
  );
});

test("filters music as bgm and resolves typed or catalog ids", (t) => {
  const f = fixture();
  t.after(() => f.cleanup());
  const musicPath = join(f.catalogRoot, "music", "01-fast-bed.wav");
  makeAudio(musicPath);
  const music = asset(f.catalogRoot, {
    kind: "music",
    id: 202,
    title: "Rapid editorial bed",
    localPath: "music/01-fast-bed.wav",
    technicalPath: musicPath,
    intendedUse: "Fast-paced montage and energetic editorial passage",
  });
  delete music.technicalPath;
  writeCatalog(f.catalogRoot, [music]);

  const byQuery = run(f.workspace, ["--type", "bgm", "--query", "fast-edit"]).json;
  assert.equal(byQuery.count, 1);
  assert.equal(byQuery.candidates[0].type, "bgm");

  const typed = run(f.workspace, ["--id", "bgm:202"]).json;
  const catalog = run(f.workspace, ["--id", "reviewed-audio:bgm:202"]).json;
  assert.equal(typed.candidates[0].catalog_id, "reviewed-audio:bgm:202");
  assert.equal(catalog.candidates[0].source_id, "202");
});

test("short UI query matches semantic tokens without leaking through quiet", (t) => {
  const f = fixture();
  t.after(() => f.cleanup());
  const uiPath = join(f.catalogRoot, "music", "01-interface-pulse.wav");
  const quietPath = join(f.catalogRoot, "music", "02-silent-descent.wav");
  makeAudio(uiPath);
  makeAudio(quietPath, 220);
  const ui = asset(f.catalogRoot, {
    kind: "music",
    id: 241,
    title: "Interface pulse",
    localPath: "music/01-interface-pulse.wav",
    technicalPath: uiPath,
    intendedUse: "Clean UI and software interaction underscore",
  });
  const quiet = asset(f.catalogRoot, {
    kind: "music",
    id: 242,
    title: "Silent Descent",
    localPath: "music/02-silent-descent.wav",
    technicalPath: quietPath,
    intendedUse: "Quiet atmospheric tension and reflective descent",
  });
  delete ui.technicalPath;
  delete quiet.technicalPath;
  writeCatalog(f.catalogRoot, [quiet, ui]);

  const { json } = run(f.workspace, ["--type", "bgm", "--query", "UI"]);
  assert.equal(json.count, 1);
  assert.equal(json.candidates[0].title, "Interface pulse");
  assert.ok(json.candidates[0].aliases.includes("ui"));
  assert.ok(!json.candidates.some((candidate) => candidate.title === "Silent Descent"));
});

test("fast edits plural discovers the same tagged SFX and BGM as fast edit", (t) => {
  const f = fixture();
  t.after(() => f.cleanup());
  const sfxPath = join(f.catalogRoot, "sfx", "01-kinetic-whoosh.wav");
  const musicPath = join(f.catalogRoot, "music", "01-momentum-bed.wav");
  makeAudio(sfxPath);
  makeAudio(musicPath, 220);
  const sfx = asset(f.catalogRoot, {
    id: 271,
    title: "Kinetic whoosh",
    localPath: "sfx/01-kinetic-whoosh.wav",
    technicalPath: sfxPath,
    intendedUse: "Fast transition accent for rapid editorial cuts",
  });
  const bgm = asset(f.catalogRoot, {
    kind: "music",
    id: 272,
    title: "Momentum bed",
    localPath: "music/01-momentum-bed.wav",
    technicalPath: musicPath,
    intendedUse: "Driving fast-paced montage and energetic escalation",
  });
  delete sfx.technicalPath;
  delete bgm.technicalPath;
  writeCatalog(f.catalogRoot, [sfx, bgm]);

  const plural = run(f.workspace, ["--query", "fast edits"]).json;
  const singular = run(f.workspace, ["--query", "fast edit"]).json;
  const hyphenated = run(f.workspace, ["--query", "fast-edit"]).json;
  const ids = (result) => new Set(result.candidates.map((candidate) => candidate.catalog_id));

  assert.deepEqual(ids(plural), ids(singular));
  assert.deepEqual(ids(plural), ids(hyphenated));
  assert.deepEqual(
    new Set(plural.candidates.map((candidate) => candidate.type)),
    new Set(["sfx", "bgm"]),
  );
  assert.ok(plural.candidates.every((candidate) => candidate.aliases.includes("fast edits")));
});

test("rejects a query that normalizes to no searchable tokens", (t) => {
  const f = fixture();
  t.after(() => f.cleanup());
  const path = join(f.catalogRoot, "sfx", "tone.wav");
  makeAudio(path);
  writeCatalog(f.catalogRoot, [
    asset(f.catalogRoot, { id: 252, localPath: "sfx/tone.wav", technicalPath: path }),
  ]);

  const { status, json } = run(f.workspace, ["--query", "键盘输入"], { fail: true });
  assert.equal(status, 2);
  assert.equal(json.ok, false);
  assert.match(json.error, /at least one searchable ASCII letter or number/);
});

test("fails closed when a selected candidate's SHA-256 is stale", (t) => {
  const f = fixture();
  t.after(() => f.cleanup());
  const path = join(f.catalogRoot, "sfx", "tone.wav");
  makeAudio(path);
  writeCatalog(f.catalogRoot, [
    asset(f.catalogRoot, {
      id: 303,
      localPath: "sfx/tone.wav",
      technicalPath: path,
      technical: { sha256: "0".repeat(64) },
    }),
  ]);

  const { json } = run(f.workspace, ["--id", "303"], { fail: true });
  assert.equal(json.ok, false);
  assert.match(json.error, /SHA-256 mismatch/);
});

test("rejects traversal and symlink escapes from a catalog root", (t) => {
  const f = fixture();
  t.after(() => f.cleanup());
  const outside = join(f.workspace, "outside.wav");
  makeAudio(outside);
  writeCatalog(f.catalogRoot, [
    asset(f.catalogRoot, {
      id: 404,
      localPath: "../../outside.wav",
      technicalPath: outside,
    }),
  ]);
  let failed = run(f.workspace, ["--id", "404"], { fail: true }).json;
  assert.match(failed.error, /escapes its catalog root/);

  const link = join(f.catalogRoot, "sfx", "escaped.wav");
  mkdirSync(dirname(link), { recursive: true });
  symlinkSync(outside, link);
  writeCatalog(f.catalogRoot, [
    asset(f.catalogRoot, {
      id: 405,
      localPath: "sfx/escaped.wav",
      technicalPath: outside,
    }),
  ]);
  failed = run(f.workspace, ["--id", "405"], { fail: true }).json;
  assert.match(failed.error, /regular non-symlink file/);
});

test("rejects a symlinked default mediaReview root before scanning it", (t) => {
  const workspace = mkdtempSync(join(tmpdir(), "mu-catalog-linked-workspace-"));
  const outside = mkdtempSync(join(tmpdir(), "mu-catalog-linked-review-"));
  t.after(() => {
    rmSync(workspace, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  });
  const outsideReview = join(outside, "mediaReview");
  mkdirSync(join(outsideReview, "untrusted-audio"), { recursive: true });
  writeFileSync(join(outsideReview, "untrusted-audio", "catalog.json"), "{}\n");
  symlinkSync(outsideReview, join(workspace, "mediaReview"), "dir");

  const { json } = run(workspace, [], { fail: true });
  assert.equal(json.ok, false);
  assert.match(json.error, /mediaReview must be a regular non-symlink directory/);
});

test("rejects a hash-valid non-audio or Git LFS pointer", (t) => {
  const f = fixture();
  t.after(() => f.cleanup());
  const path = join(f.catalogRoot, "sfx", "pointer.wav");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, "version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 1\n");
  writeCatalog(f.catalogRoot, [
    asset(f.catalogRoot, { id: 505, localPath: "sfx/pointer.wav", technicalPath: path }),
  ]);

  const { json } = run(f.workspace, ["--id", "505"], { fail: true });
  assert.equal(json.ok, false);
  assert.match(json.error, /not decodable audio|positive duration/);
});
