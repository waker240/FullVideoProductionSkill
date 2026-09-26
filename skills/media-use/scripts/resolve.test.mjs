import { strict as assert } from "node:assert";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
  copyFileSync,
  linkSync,
  symlinkSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { appendRecord, readManifest } from "./lib/manifest.mjs";
import { contentHash, cachePut } from "./lib/cache.mjs";

const RESOLVE_SCRIPT = join(import.meta.dirname, "resolve.mjs");
let tmp;
let projectDir;
let cacheDir;
let previousCacheDir;

function setup() {
  tmp = mkdtempSync(join(tmpdir(), "mu-resolve-test-"));
  projectDir = join(tmp, "project");
  cacheDir = join(tmp, "global-cache");
  mkdirSync(projectDir, { recursive: true });
  previousCacheDir = process.env.MEDIA_USE_GLOBAL_CACHE_DIR;
  process.env.MEDIA_USE_GLOBAL_CACHE_DIR = cacheDir;
}

function cleanup() {
  if (previousCacheDir == null) delete process.env.MEDIA_USE_GLOBAL_CACHE_DIR;
  else process.env.MEDIA_USE_GLOBAL_CACHE_DIR = previousCacheDir;
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  tmp = null;
}

function localRecord(overrides = {}) {
  return {
    id: "bgm_001",
    type: "bgm",
    path: ".media/audio/bgm/bgm_001.wav",
    source: "local-source",
    description: "soft minimal ambient",
    provenance: {
      origin: "local-file",
      local: true,
      prompt: "test prompt",
    },
    ...overrides,
  };
}

function createProjectRecord(record, bytes = "local media bytes") {
  appendRecord(projectDir, record);
  const filePath = join(projectDir, record.path);
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, bytes);
  return filePath;
}

function runResolve(argv, { fail = false, env = {} } = {}) {
  try {
    const stdout = execFileSync(process.execPath, [RESOLVE_SCRIPT, ...argv], {
      encoding: "utf8",
      stdio: "pipe",
      env: { ...process.env, ...env },
    });
    if (fail) assert.fail("command should have failed");
    return { status: 0, stdout, stderr: "" };
  } catch (error) {
    if (!fail) throw error;
    return {
      status: error.status,
      stdout: String(error.stdout || ""),
      stderr: String(error.stderr || ""),
    };
  }
}

function jsonResolve(argv, options) {
  const result = runResolve([...argv, "--json"], options);
  return { ...result, json: JSON.parse(result.stdout.trim()) };
}

function writeHistoricalCacheRecord(record, bytes = "historical cached bytes") {
  const source = join(tmp, `${record.id}.wav`);
  writeFileSync(source, bytes);
  const sha = contentHash(source);
  const entryDir = join(cacheDir, `mu-v1-${sha.slice(0, 16)}`);
  mkdirSync(entryDir, { recursive: true });
  const cachedPath = join(entryDir, `${record.id}.wav`);
  copyFileSync(source, cachedPath);
  writeFileSync(join(entryDir, ".hf-complete"), "");
  appendRecord(cacheDir, { ...record, sha, reusable: true, cached_path: cachedPath });
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test("project manifest resolves exact prompt", () => {
  setup();
  createProjectRecord(
    localRecord({ provenance: { origin: "local-file", local: true, prompt: "cached query" } }),
  );

  const { json } = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "cached query",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json.id, "bgm_001");
  assert.equal(json._source, "cached");
  cleanup();
});

test("read-only hits and misses ignore an unrelated unsafe index write target", () => {
  setup();
  createProjectRecord(
    localRecord({ provenance: { origin: "local-file", local: true, prompt: "read-only hit" } }),
  );
  const manifestBefore = readFileSync(join(projectDir, ".media", "manifest.jsonl"), "utf8");
  const outsideIndex = join(tmp, "outside-index.md");
  writeFileSync(outsideIndex, "outside index sentinel");
  symlinkSync(outsideIndex, join(projectDir, ".media", "index.md"));

  const hit = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "read-only hit",
    "--project",
    projectDir,
  ]).json;
  assert.equal(hit.ok, true);
  assert.equal(hit._source, "cached");

  const miss = jsonResolve(
    ["--type", "sfx", "--intent", "read-only miss", "--project", projectDir],
    { fail: true },
  );
  assert.equal(miss.status, 1);
  assert.match(miss.json.error, /no reviewed local sfx matched/);
  assert.equal(readFileSync(outsideIndex, "utf8"), "outside index sentinel");
  assert.equal(readFileSync(join(projectDir, ".media", "manifest.jsonl"), "utf8"), manifestBefore);
  cleanup();
});

test("legacy adopted-local project audio remains reusable", () => {
  setup();
  createProjectRecord(
    localRecord({
      provenance: {
        provider: "local",
        adopted: true,
        prompt: "legacy adopted project audio",
        license: "CC0-1.0",
      },
    }),
  );

  const { json } = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "legacy adopted project audio",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json.id, "bgm_001");
  assert.equal(json.provenance.license, "CC0-1.0");
  cleanup();
});

test("project manifest resolves by id and path", () => {
  setup();
  const record = localRecord();
  createProjectRecord(record);

  const byId = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    record.id,
    "--project",
    projectDir,
  ]).json;
  const byPath = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    record.path,
    "--project",
    projectDir,
  ]).json;
  assert.equal(byId.id, record.id);
  assert.equal(byPath.id, record.id);
  cleanup();
});

test("project matching prioritizes id over path and prompt regardless of manifest order", () => {
  setup();
  createProjectRecord(
    localRecord({
      id: "bgm_prompt",
      path: ".media/audio/bgm/prompt.wav",
      provenance: { origin: "local-file", local: true, prompt: "priority-key" },
    }),
  );
  createProjectRecord(
    localRecord({
      id: "bgm_path",
      path: "priority-key",
      provenance: { origin: "local-file", local: true, prompt: "other" },
    }),
  );
  createProjectRecord(
    localRecord({
      id: "priority-key",
      path: ".media/audio/bgm/id.wav",
      provenance: { origin: "local-file", local: true, prompt: "other" },
    }),
  );

  const { json } = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "priority-key",
    "--project",
    projectDir,
  ]);
  assert.equal(json.id, "priority-key");
  cleanup();
});

test("project matching prioritizes path over prompt", () => {
  setup();
  createProjectRecord(
    localRecord({
      id: "bgm_prompt",
      path: ".media/audio/bgm/prompt.wav",
      provenance: { origin: "local-file", local: true, prompt: "assets/chosen.wav" },
    }),
  );
  createProjectRecord(
    localRecord({
      id: "bgm_path",
      path: "assets/chosen.wav",
      provenance: { origin: "local-file", local: true, prompt: "other" },
    }),
  );

  const { json } = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "assets/chosen.wav",
    "--project",
    projectDir,
  ]);
  assert.equal(json.id, "bgm_path");
  cleanup();
});

test("malformed project records fail closed without hiding a later valid hit", () => {
  setup();
  mkdirSync(join(projectDir, ".media"), { recursive: true });
  writeFileSync(
    join(projectDir, ".media", "manifest.jsonl"),
    [
      "null",
      '"unrelated"',
      '{"type":"bgm","path":{"not":"a path"},"provenance":{"prompt":"safe query"}}',
      '{"type":"bgm","path":"missing.wav","provenance":17}',
    ].join("\n") + "\n",
  );
  createProjectRecord(
    localRecord({ provenance: { origin: "local-file", local: true, prompt: "safe query" } }),
  );

  const { json } = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "safe query",
    "--project",
    projectDir,
  ]);
  assert.equal(json.id, "bgm_001");
  cleanup();
});

test("historical remote project audio is ignored in favor of a later local record", () => {
  setup();
  createProjectRecord(
    localRecord({
      id: "bgm_001",
      path: ".media/audio/bgm/bgm_001.wav",
      source: "search",
      provenance: { provider: "remote.catalog", adopted: true, prompt: "same prompt" },
    }),
  );
  createProjectRecord(
    localRecord({
      id: "bgm_002",
      path: ".media/audio/bgm/bgm_002.wav",
      provenance: { origin: "local-file", local: true, prompt: "same prompt" },
    }),
  );

  const { json } = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "same prompt",
    "--project",
    projectDir,
  ]);
  assert.equal(json.id, "bgm_002");
  cleanup();
});

test("--source freezes and registers a reviewed local file", () => {
  setup();
  const source = join(tmp, "reviewed-whoosh.wav");
  writeFileSync(source, "reviewed local sound");

  const { json } = jsonResolve([
    "--type",
    "sfx",
    "--intent",
    "soft whoosh",
    "--source",
    source,
    "--source-page",
    "https://example.test/assets/reviewed-whoosh",
    "--license",
    "CC0-1.0",
    "--license-url",
    "https://creativecommons.org/publicdomain/zero/1.0/",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json._source, "local-source");
  assert.equal(json.provenance.origin, "local-file");
  assert.equal(json.provenance.local, true);
  assert.equal(json.provenance.license, "CC0-1.0");
  assert.match(json.provenance.source_page, /^https:\/\//);
  assert.equal(readFileSync(join(projectDir, json.path), "utf8"), "reviewed local sound");
  assert.equal(readManifest(projectDir).length, 1);
  cleanup();
});

test("--source verifies a catalog hash and preserves review provenance", () => {
  setup();
  const source = join(tmp, "reviewed-catalog-whoosh.wav");
  writeFileSync(source, "reviewed catalog sound");
  const expectedSha256 = contentHash(source);

  const { json } = jsonResolve([
    "--type",
    "sfx",
    "--intent",
    "canvas return whoosh",
    "--source",
    source,
    "--reviewed",
    "--expected-sha256",
    expectedSha256,
    "--source-page",
    "https://example.test/sfx/1474",
    "--license",
    "CC0-1.0",
    "--license-url",
    "https://creativecommons.org/publicdomain/zero/1.0/",
    "--creator",
    "Example Artist",
    "--source-id",
    "1474",
    "--catalog-id",
    "reviewed-audio:sfx:1474",
    "--review-note",
    "Auditioned against the canvas return and approved",
    "--project",
    projectDir,
  ]);

  assert.equal(json.ok, true);
  assert.equal(json.provenance.reviewed, true);
  assert.equal(json.provenance.expected_sha256, expectedSha256);
  assert.equal(json.provenance.creator, "Example Artist");
  assert.equal(json.provenance.source_id, "1474");
  assert.equal(json.provenance.catalog_id, "reviewed-audio:sfx:1474");
  assert.match(json.provenance.review_note, /Auditioned/);
  assert.equal(readFileSync(join(projectDir, json.path), "utf8"), "reviewed catalog sound");
  cleanup();
});

test("catalog ingestion does not require creator or attribution metadata", () => {
  setup();
  const source = join(tmp, "anonymous-catalog-whoosh.wav");
  writeFileSync(source, "reviewed anonymous catalog sound");

  const { json } = jsonResolve([
    "--type",
    "sfx",
    "--intent",
    "anonymous reviewed whoosh",
    "--source",
    source,
    "--reviewed",
    "--expected-sha256",
    contentHash(source),
    "--source-id",
    "anonymous-1",
    "--catalog-id",
    "reviewed-audio:sfx:anonymous-1",
    "--review-note",
    "Auditioned against the cut and approved at final mix level",
    "--source-page",
    "https://example.test/sfx/anonymous-1",
    "--license",
    "CC0-1.0",
    "--license-url",
    "https://creativecommons.org/publicdomain/zero/1.0/",
    "--project",
    projectDir,
  ]);

  assert.equal(json.ok, true);
  assert.equal(json.provenance.creator, undefined);
  assert.equal(json.provenance.attribution, undefined);
  cleanup();
});

test("--catalog-id fails preflight unless every approval and provenance field is supplied", () => {
  setup();
  const source = join(tmp, "catalog-candidate.wav");
  writeFileSync(source, "catalog candidate bytes");
  const complete = [
    "--type",
    "sfx",
    "--intent",
    "reviewed transition",
    "--source",
    source,
    "--reviewed",
    "--expected-sha256",
    contentHash(source),
    "--source-id",
    "candidate-17",
    "--catalog-id",
    "reviewed-audio:sfx:candidate-17",
    "--review-note",
    "Auditioned in context and approved for the transition",
    "--source-page",
    "https://example.test/sfx/candidate-17",
    "--license",
    "CC0-1.0",
    "--license-url",
    "https://creativecommons.org/publicdomain/zero/1.0/",
    "--project",
    projectDir,
  ];

  const required = [
    ["--source", true],
    ["--reviewed", false],
    ["--expected-sha256", true],
    ["--source-id", true],
    ["--source-page", true],
    ["--license", true],
    ["--license-url", true],
    ["--review-note", true],
  ];
  for (const [flag, takesValue] of required) {
    const index = complete.indexOf(flag);
    const incomplete = [
      ...complete.slice(0, index),
      ...complete.slice(index + (takesValue ? 2 : 1)),
    ];
    const failed = runResolve(incomplete, { fail: true });
    assert.equal(failed.status, 2, `${flag} should fail catalog preflight`);
    assert.match(failed.stderr, new RegExp(flag.replaceAll("-", "\\-")));
  }
  assert.equal(readManifest(projectDir).length, 0);
  assert.equal(existsSync(join(projectDir, ".media")), false);
  cleanup();
});

test("--catalog-id rejects placeholder and insubstantial review notes", () => {
  setup();
  const source = join(tmp, "catalog-candidate.wav");
  writeFileSync(source, "catalog candidate bytes");
  const common = [
    "--type",
    "sfx",
    "--intent",
    "reviewed transition",
    "--source",
    source,
    "--reviewed",
    "--expected-sha256",
    contentHash(source),
    "--source-id",
    "candidate-17",
    "--catalog-id",
    "reviewed-audio:sfx:candidate-17",
    "--source-page",
    "https://example.test/sfx/candidate-17",
    "--license",
    "CC0-1.0",
    "--license-url",
    "https://creativecommons.org/publicdomain/zero/1.0/",
    "--project",
    projectDir,
  ];

  for (const note of ["<describe completed editorial review>", "approved"]) {
    const failed = runResolve([...common, "--review-note", note], { fail: true });
    assert.equal(failed.status, 2);
    assert.match(failed.stderr, /substantive --review-note/);
  }
  assert.equal(readManifest(projectDir).length, 0);
  assert.equal(existsSync(join(projectDir, ".media")), false);
  cleanup();
});

test("catalog ingestion re-hashes frozen bytes and removes a mismatched destination", () => {
  setup();
  const source = join(tmp, "race-source.wav");
  writeFileSync(source, "reviewed bytes before copy");
  const preload = join(tmp, "mutate-copy.mjs");
  writeFileSync(
    preload,
    [
      'import fs from "node:fs";',
      'import { syncBuiltinESMExports } from "node:module";',
      "const originalCopyFileSync = fs.copyFileSync;",
      "fs.copyFileSync = (source, destination, ...rest) => {",
      "  originalCopyFileSync(source, destination, ...rest);",
      '  fs.appendFileSync(destination, "tampered after source verification");',
      "};",
      "syncBuiltinESMExports();",
    ].join("\n"),
  );

  const { status, json } = jsonResolve(
    [
      "--type",
      "sfx",
      "--intent",
      "race checked transition",
      "--source",
      source,
      "--reviewed",
      "--expected-sha256",
      contentHash(source),
      "--source-id",
      "race-1",
      "--catalog-id",
      "reviewed-audio:sfx:race-1",
      "--review-note",
      "Auditioned in context and approved before ingestion",
      "--source-page",
      "https://example.test/sfx/race-1",
      "--license",
      "CC0-1.0",
      "--license-url",
      "https://creativecommons.org/publicdomain/zero/1.0/",
      "--project",
      projectDir,
    ],
    { fail: true, env: { NODE_OPTIONS: `--import=${preload}` } },
  );

  assert.equal(status, 1);
  assert.equal(json.ok, false);
  assert.match(json.error, /frozen destination SHA-256 mismatch/);
  assert.equal(existsSync(join(projectDir, ".media", "audio", "sfx", "sfx_001.wav")), false);
  assert.equal(readManifest(projectDir).length, 0);
  cleanup();
});

test("--source fails before copying when the expected catalog hash is stale", () => {
  setup();
  const source = join(tmp, "changed-after-review.wav");
  writeFileSync(source, "changed bytes");

  const { status, json } = jsonResolve(
    [
      "--type",
      "sfx",
      "--intent",
      "reviewed click",
      "--source",
      source,
      "--expected-sha256",
      "0".repeat(64),
      "--project",
      projectDir,
    ],
    { fail: true },
  );

  assert.equal(status, 1);
  assert.equal(json.ok, false);
  assert.match(json.error, /SHA-256 mismatch/);
  assert.equal(readManifest(projectDir).length, 0);
  assert.equal(existsSync(join(projectDir, ".media")), false);
  cleanup();
});

test("--source rejects a symlinked .media boundary before writing outside the project", () => {
  setup();
  const source = join(tmp, "reviewed-source.wav");
  writeFileSync(source, "reviewed source bytes");
  const outsideMedia = join(tmp, "outside-media");
  mkdirSync(outsideMedia, { recursive: true });
  const marker = join(outsideMedia, "keep.txt");
  writeFileSync(marker, "outside must remain unchanged");
  symlinkSync(outsideMedia, join(projectDir, ".media"));

  const { status, json } = jsonResolve(
    [
      "--type",
      "sfx",
      "--intent",
      "boundary test",
      "--source",
      source,
      "--project",
      projectDir,
    ],
    { fail: true },
  );

  assert.equal(status, 1);
  assert.equal(json.ok, false);
  assert.match(json.error, /unsafe project write path.*symbolic link/);
  assert.equal(readFileSync(marker, "utf8"), "outside must remain unchanged");
  assert.equal(existsSync(join(outsideMedia, "audio")), false);
  assert.equal(existsSync(join(outsideMedia, "manifest.jsonl")), false);
  assert.equal(existsSync(join(outsideMedia, "index.md")), false);
  cleanup();
});

test("--source rejects symlinked manifest and destination files without mutating targets", () => {
  setup();
  const source = join(tmp, "reviewed-source.wav");
  writeFileSync(source, "reviewed source bytes");
  mkdirSync(join(projectDir, ".media"), { recursive: true });
  const outsideManifest = join(tmp, "outside-manifest.jsonl");
  writeFileSync(outsideManifest, "outside manifest sentinel\n");
  symlinkSync(outsideManifest, join(projectDir, ".media", "manifest.jsonl"));

  const manifestAttempt = jsonResolve(
    ["--type", "sfx", "--intent", "manifest boundary", "--source", source, "--project", projectDir],
    { fail: true },
  );
  assert.equal(manifestAttempt.status, 1);
  assert.match(manifestAttempt.json.error, /manifest\.jsonl.*symbolic link|symbolic link.*manifest\.jsonl/);
  assert.equal(readFileSync(outsideManifest, "utf8"), "outside manifest sentinel\n");
  assert.equal(existsSync(join(projectDir, ".media", "audio")), false);

  rmSync(join(projectDir, ".media", "manifest.jsonl"));
  mkdirSync(join(projectDir, ".media", "audio", "sfx"), { recursive: true });
  const outsideDestination = join(tmp, "outside-destination.wav");
  writeFileSync(outsideDestination, "outside destination sentinel");
  symlinkSync(
    outsideDestination,
    join(projectDir, ".media", "audio", "sfx", "sfx_001.wav"),
  );

  const destinationAttempt = jsonResolve(
    ["--type", "sfx", "--intent", "destination boundary", "--source", source, "--project", projectDir],
    { fail: true },
  );
  assert.equal(destinationAttempt.status, 1);
  assert.match(destinationAttempt.json.error, /sfx_001\.wav.*symbolic link|symbolic link.*sfx_001\.wav/);
  assert.equal(readFileSync(outsideDestination, "utf8"), "outside destination sentinel");
  assert.equal(existsSync(join(projectDir, ".media", "manifest.jsonl")), false);
  assert.equal(existsSync(join(projectDir, ".media", "index.md")), false);
  cleanup();
});

test("--source rejects a hard-linked destination without mutating the outside alias", () => {
  setup();
  const source = join(tmp, "reviewed-source.wav");
  writeFileSync(source, "reviewed source bytes");
  mkdirSync(join(projectDir, ".media", "audio", "sfx"), { recursive: true });
  const outsideDestination = join(tmp, "outside-hard-link.wav");
  writeFileSync(outsideDestination, "outside hard-link sentinel");
  linkSync(outsideDestination, join(projectDir, ".media", "audio", "sfx", "sfx_001.wav"));

  const { status, json } = jsonResolve(
    ["--type", "sfx", "--intent", "hard-link boundary", "--source", source, "--project", projectDir],
    { fail: true },
  );
  assert.equal(status, 1);
  assert.equal(json.ok, false);
  assert.match(json.error, /hard-linked file/);
  assert.equal(readFileSync(outsideDestination, "utf8"), "outside hard-link sentinel");
  assert.equal(existsSync(join(projectDir, ".media", "manifest.jsonl")), false);
  assert.equal(existsSync(join(projectDir, ".media", "index.md")), false);
  cleanup();
});

test("mediaReview audio cannot bypass the reviewed catalog handoff", () => {
  setup();
  const collectionRoot = join(tmp, "mediaReview", "reviewed-audio");
  const source = join(collectionRoot, "sfx", "candidate.wav");
  mkdirSync(join(collectionRoot, "sfx"), { recursive: true });
  writeFileSync(source, "review-library candidate bytes");
  const sha = contentHash(source);
  writeFileSync(
    join(collectionRoot, "catalog.json"),
    JSON.stringify({
      schemaVersion: 1,
      reviewStatus: "shared-candidates",
      assets: [
        {
          kind: "sfx",
          id: 101,
          title: "Candidate transition",
          creator: null,
          localPath: "sfx/candidate.wav",
          sourcePage: "https://example.test/sfx/101",
          intendedUse: "Reviewed transition candidate",
          license: {
            name: "Example License",
            url: "https://example.test/license",
            attribution: null,
          },
          technical: { sha256: sha },
        },
      ],
    }),
  );

  const bypass = jsonResolve(
    ["--type", "sfx", "--intent", "candidate transition", "--source", source, "--project", projectDir],
    { fail: true },
  );
  assert.equal(bypass.status, 1);
  assert.match(bypass.json.error, /mediaReview audio.*reviewed resolve command/);
  assert.equal(existsSync(join(projectDir, ".media")), false);

  for (const launderingType of ["image", "icon", "brand"]) {
    const laundered = jsonResolve(
      [
        "--type",
        launderingType,
        "--intent",
        "candidate transition",
        "--source",
        source,
        "--project",
        projectDir,
      ],
      { fail: true },
    );
    assert.equal(laundered.status, 1);
    assert.match(laundered.json.error, new RegExp(`declared as sfx.*ingested as ${launderingType}`));
    assert.equal(existsSync(join(projectDir, ".media")), false);
  }

  const reviewedArgs = [
    "--type",
    "sfx",
    "--intent",
    "candidate transition",
    "--source",
    source,
    "--reviewed",
    "--expected-sha256",
    sha,
    "--source-id",
    "101",
    "--catalog-id",
    "reviewed-audio:sfx:101",
    "--review-note",
    "Auditioned under narration and approved for the transition",
    "--source-page",
    "https://example.test/sfx/101",
    "--license",
    "Example License",
    "--license-url",
    "https://example.test/license",
    "--project",
    projectDir,
  ];
  const wrongCatalog = [...reviewedArgs];
  wrongCatalog[wrongCatalog.indexOf("--catalog-id") + 1] = "reviewed-audio:sfx:999";
  const mismatch = jsonResolve(wrongCatalog, { fail: true });
  assert.equal(mismatch.status, 1);
  assert.match(mismatch.json.error, /--catalog-id does not (?:uniquely )?match/);
  assert.equal(existsSync(join(projectDir, ".media")), false);

  const accepted = jsonResolve(reviewedArgs).json;
  assert.equal(accepted.ok, true);
  assert.equal(accepted.provenance.catalog_id, "reviewed-audio:sfx:101");
  assert.equal(accepted.provenance.expected_sha256, sha);
  cleanup();
});

test("an unrelated workspace mediaReview catalog still requires the exact handoff", () => {
  setup();
  const collectionRoot = join(tmp, "unrelated-workspace", "mediaReview", "other-audio");
  const source = join(collectionRoot, "sfx", "candidate.wav");
  mkdirSync(join(collectionRoot, "sfx"), { recursive: true });
  writeFileSync(source, "unrelated review-library bytes");
  writeFileSync(
    join(collectionRoot, "catalog.json"),
    JSON.stringify({
      schemaVersion: 1,
      reviewStatus: "shared-candidates",
      assets: [
        {
          kind: "sfx",
          id: 301,
          localPath: "sfx/candidate.wav",
          sourcePage: "https://example.test/sfx/301",
          license: { name: "Example License", url: "https://example.test/license" },
          technical: { sha256: contentHash(source) },
        },
      ],
    }),
  );

  const { status, json } = jsonResolve(
    ["--type", "sfx", "--intent", "unrelated candidate", "--source", source, "--project", projectDir],
    { fail: true },
  );
  assert.equal(status, 1);
  assert.match(json.error, /mediaReview audio.*reviewed resolve command/);
  assert.equal(existsSync(join(projectDir, ".media")), false);
  cleanup();
});

test("an ordinary mediaReview directory without the catalog schema marker is not authoritative", () => {
  setup();
  const collectionRoot = join(tmp, "ordinary-files", "mediaReview", "recordings");
  const source = join(collectionRoot, "sfx", "personal.wav");
  mkdirSync(join(collectionRoot, "sfx"), { recursive: true });
  writeFileSync(source, "ordinary personal recording");
  writeFileSync(
    join(collectionRoot, "catalog.json"),
    JSON.stringify({
      reviewStatus: "personal-notes",
      assets: [
        {
          kind: "sfx",
          id: 1,
          localPath: "sfx/personal.wav",
          sourcePage: "https://example.test/personal/1",
          license: { name: "Personal", url: "https://example.test/personal-license" },
          technical: { sha256: contentHash(source) },
        },
      ],
    }),
  );

  const { json } = jsonResolve([
    "--type",
    "sfx",
    "--intent",
    "personal recording",
    "--source",
    source,
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json.provenance.catalog_id, undefined);
  assert.equal(readFileSync(join(projectDir, json.path), "utf8"), "ordinary personal recording");
  cleanup();
});

test("a stale catalog row cannot mask a later valid exact id and path", () => {
  setup();
  const collectionRoot = join(tmp, "mediaReview", "stale-audio");
  const source = join(collectionRoot, "sfx", "valid.wav");
  mkdirSync(join(collectionRoot, "sfx"), { recursive: true });
  writeFileSync(source, "later valid catalog bytes");
  const sha = contentHash(source);
  const entry = (id, localPath) => ({
    kind: "sfx",
    id,
    localPath,
    sourcePage: `https://example.test/sfx/${id}`,
    license: { name: "Example License", url: "https://example.test/license" },
    technical: { sha256: sha },
  });
  writeFileSync(
    join(collectionRoot, "catalog.json"),
    JSON.stringify({
      schemaVersion: 1,
      reviewStatus: "shared-candidates",
      assets: [entry(501, "sfx/missing.wav"), entry(502, "sfx/valid.wav")],
    }),
  );

  const { json } = jsonResolve([
    "--type",
    "sfx",
    "--intent",
    "later valid cue",
    "--source",
    source,
    "--reviewed",
    "--expected-sha256",
    sha,
    "--source-id",
    "502",
    "--catalog-id",
    "stale-audio:sfx:502",
    "--review-note",
    "Auditioned in context and approved for the later exact cue",
    "--source-page",
    "https://example.test/sfx/502",
    "--license",
    "Example License",
    "--license-url",
    "https://example.test/license",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json.provenance.catalog_id, "stale-audio:sfx:502");
  cleanup();
});

test("duplicate catalog entries sharing a file require one exact id and path handoff", () => {
  setup();
  const collectionRoot = join(tmp, "mediaReview", "duplicate-audio");
  const source = join(collectionRoot, "sfx", "shared.wav");
  mkdirSync(join(collectionRoot, "sfx"), { recursive: true });
  writeFileSync(source, "shared candidate bytes");
  const sha = contentHash(source);
  const entry = (id) => ({
    kind: "sfx",
    id,
    localPath: "sfx/shared.wav",
    sourcePage: `https://example.test/sfx/${id}`,
    license: { name: "Example License", url: "https://example.test/license" },
    technical: { sha256: sha },
  });
  writeFileSync(
    join(collectionRoot, "catalog.json"),
    JSON.stringify({
      schemaVersion: 1,
      reviewStatus: "shared-candidates",
      assets: [entry(401), entry(402)],
    }),
  );

  const ambiguous = jsonResolve(
    ["--type", "sfx", "--intent", "shared candidate", "--source", source, "--project", projectDir],
    { fail: true },
  );
  assert.equal(ambiguous.status, 1);
  assert.match(ambiguous.json.error, /multiple catalog entries/);

  const exactArgs = [
    "--type",
    "sfx",
    "--intent",
    "shared candidate",
    "--source",
    source,
    "--reviewed",
    "--expected-sha256",
    sha,
    "--source-id",
    "402",
    "--catalog-id",
    "duplicate-audio:sfx:402",
    "--review-note",
    "Auditioned in context and approved for this exact cue",
    "--source-page",
    "https://example.test/sfx/402",
    "--license",
    "Example License",
    "--license-url",
    "https://example.test/license",
    "--project",
    projectDir,
  ];
  const wrongSourceId = [...exactArgs];
  wrongSourceId[wrongSourceId.indexOf("--source-id") + 1] = "401";
  const mismatched = jsonResolve(wrongSourceId, { fail: true });
  assert.equal(mismatched.status, 1);
  assert.match(mismatched.json.error, /--source-id does not match catalog entry/);
  assert.equal(existsSync(join(projectDir, ".media")), false);

  const accepted = jsonResolve(exactArgs).json;
  assert.equal(accepted.ok, true);
  assert.equal(accepted.provenance.catalog_id, "duplicate-audio:sfx:402");
  assert.equal(accepted.provenance.source_id, "402");
  cleanup();
});

test("catalog ingestion accepts a substantive CJK editorial review note", () => {
  setup();
  const source = join(tmp, "reviewed-catalog-source.wav");
  writeFileSync(source, "reviewed catalog bytes");
  const { json } = jsonResolve([
    "--type",
    "sfx",
    "--intent",
    "reviewed transition",
    "--source",
    source,
    "--reviewed",
    "--expected-sha256",
    contentHash(source),
    "--source-id",
    "candidate-zh-1",
    "--catalog-id",
    "reviewed-audio:sfx:candidate-zh-1",
    "--review-note",
    "已在旁白下完整试听并确认转场尾音干净",
    "--source-page",
    "https://example.test/sfx/candidate-zh-1",
    "--license",
    "CC0-1.0",
    "--license-url",
    "https://creativecommons.org/publicdomain/zero/1.0/",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json.provenance.review_note, "已在旁白下完整试听并确认转场尾音干净");
  cleanup();
});

test("trusted global cache audio copies into the project", () => {
  setup();
  const source = join(tmp, "trusted.wav");
  writeFileSync(source, "trusted global media");
  cachePut(
    source,
    localRecord({ provenance: { origin: "local-file", local: true, prompt: "global query" } }),
  );

  const { json } = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "global query",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json._source, "reused");
  assert.ok(existsSync(join(projectDir, json.path)));
  cleanup();
});

test("legacy adopted-local cache audio remains reusable with license metadata", () => {
  setup();
  const source = join(tmp, "legacy-trusted.wav");
  writeFileSync(source, "legacy trusted global media");
  cachePut(
    source,
    localRecord({
      provenance: {
        provider: "local",
        adopted: true,
        prompt: "legacy global query",
        license: "CC-BY-4.0",
        attribution: "Example Artist",
      },
    }),
  );

  const { json } = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "legacy global query",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json._source, "reused");
  assert.equal(json.provenance.license, "CC-BY-4.0");
  assert.equal(json.provenance.attribution, "Example Artist");
  cleanup();
});

test("historical provider audio cache is not reused", () => {
  setup();
  writeHistoricalCacheRecord(
    localRecord({
      source: "search",
      provenance: { provider: "remote.catalog", adopted: true, prompt: "legacy remote" },
    }),
  );

  const { status, json } = jsonResolve(
    ["--type", "bgm", "--intent", "legacy remote", "--project", projectDir],
    { fail: true },
  );
  assert.equal(status, 1);
  assert.equal(json.ok, false);
  assert.equal(readManifest(projectDir).length, 0);
  cleanup();
});

test("an invalid historical cache record does not mask a later trusted record", () => {
  setup();
  writeHistoricalCacheRecord(
    localRecord({
      id: "bgm_old",
      source: "search",
      provenance: { provider: "remote.catalog", prompt: "shared cache prompt" },
    }),
    "old remote bytes",
  );
  const source = join(tmp, "trusted-later.wav");
  writeFileSync(source, "trusted later bytes");
  cachePut(
    source,
    localRecord({
      id: "bgm_new",
      provenance: { origin: "local-file", local: true, prompt: "shared cache prompt" },
    }),
  );

  const { json } = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "shared cache prompt",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json._source, "reused");
  cleanup();
});

test("corrupt and directory cache records do not mask a later valid hit", () => {
  setup();
  appendRecord(cacheDir, {
    id: "bgm_corrupt",
    type: "bgm",
    reusable: true,
    sha: { invalid: true },
    cached_path: 42,
    provenance: {
      origin: "local-file",
      local: true,
      prompt: "resilient cache query",
    },
  });

  const directorySource = join(tmp, "directory-source.wav");
  writeFileSync(directorySource, "directory record bytes");
  const directorySha = contentHash(directorySource);
  const entryDir = join(cacheDir, `mu-v1-${directorySha.slice(0, 16)}`);
  mkdirSync(entryDir, { recursive: true });
  writeFileSync(join(entryDir, ".hf-complete"), "");
  appendRecord(cacheDir, {
    id: "bgm_directory",
    type: "bgm",
    reusable: true,
    sha: directorySha,
    cached_path: entryDir,
    provenance: {
      origin: "local-file",
      local: true,
      prompt: "resilient cache query",
    },
  });

  const validSource = join(tmp, "valid-later.wav");
  writeFileSync(validSource, "valid later cache bytes");
  cachePut(
    validSource,
    localRecord({
      id: "bgm_valid",
      provenance: { origin: "local-file", local: true, prompt: "resilient cache query" },
    }),
  );

  const { json } = jsonResolve([
    "--type",
    "bgm",
    "--intent",
    "resilient cache query",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json._source, "reused");
  assert.equal(readFileSync(join(projectDir, json.path), "utf8"), "valid later cache bytes");
  cleanup();
});

test("resolve adopts a matching unregistered project asset", () => {
  setup();
  mkdirSync(join(projectDir, "assets", "sfx"), { recursive: true });
  writeFileSync(join(projectDir, "assets", "sfx", "paper-rustle.wav"), "local sfx");

  const { json } = jsonResolve([
    "--type",
    "sfx",
    "--intent",
    "paper rustle",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json.path, "assets/sfx/paper-rustle.wav");
  assert.equal(json._source, "existing");
  assert.equal(json.provenance.local, true);
  cleanup();
});

test("resolving a staged audio asset retains explicit review and rights provenance", () => {
  setup();
  mkdirSync(join(projectDir, "assets", "sfx"), { recursive: true });
  writeFileSync(join(projectDir, "assets", "sfx", "reviewed-paper-rustle.wav"), "local sfx");

  const { json } = jsonResolve([
    "--type",
    "sfx",
    "--intent",
    "reviewed paper rustle",
    "--reviewed",
    "--source-page",
    "https://example.test/sfx/paper-rustle",
    "--license",
    "CC-BY-4.0",
    "--license-url",
    "https://creativecommons.org/licenses/by/4.0/",
    "--attribution",
    "Example Recordist",
    "--review-note",
    "Auditioned in context and approved below narration",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json._source, "existing");
  assert.equal(json.provenance.reviewed, true);
  assert.equal(json.provenance.license, "CC-BY-4.0");
  assert.equal(json.provenance.license_url, "https://creativecommons.org/licenses/by/4.0/");
  assert.equal(json.provenance.source_page, "https://example.test/sfx/paper-rustle");
  assert.equal(json.provenance.attribution, "Example Recordist");
  assert.match(json.provenance.review_note, /Auditioned/);
  cleanup();
});

test("--adopt ignores voice-like files", () => {
  setup();
  mkdirSync(join(projectDir, "assets", "bgm"), { recursive: true });
  mkdirSync(join(projectDir, "assets", "voice"), { recursive: true });
  writeFileSync(join(projectDir, "assets", "bgm", "track.mp3"), "music");
  writeFileSync(join(projectDir, "assets", "voice", "narration.wav"), "narration");

  const { json } = jsonResolve(["--adopt", "--project", projectDir]);
  assert.equal(json.adopted, 1);
  assert.equal(json.assets[0].type, "bgm");
  assert.ok(!readManifest(projectDir).some((record) => record.path.includes("narration")));
  cleanup();
});

test("--adopt rejects a symlinked .media boundary before writing outside the project", () => {
  setup();
  mkdirSync(join(projectDir, "assets", "sfx"), { recursive: true });
  writeFileSync(join(projectDir, "assets", "sfx", "paper.wav"), "local sfx");
  const outsideMedia = join(tmp, "outside-adopt-media");
  mkdirSync(outsideMedia, { recursive: true });
  const marker = join(outsideMedia, "keep.txt");
  writeFileSync(marker, "outside adopt sentinel");
  symlinkSync(outsideMedia, join(projectDir, ".media"));

  const { status, json } = jsonResolve(["--adopt", "--project", projectDir], { fail: true });
  assert.equal(status, 1);
  assert.equal(json.ok, false);
  assert.match(json.error, /unsafe project write path.*symbolic link/);
  assert.equal(readFileSync(marker, "utf8"), "outside adopt sentinel");
  assert.equal(existsSync(join(outsideMedia, "manifest.jsonl")), false);
  assert.equal(existsSync(join(outsideMedia, "index.md")), false);
  cleanup();
});

test("--adopt ignores plural and numbered voice-like paths", () => {
  setup();
  const voicePaths = [
    ["voiceovers", "host.wav"],
    ["narrations", "chapter.wav"],
    ["dialogues", "scene.wav"],
    ["speeches", "keynote.wav"],
    ["audio", "narration2.wav"],
  ];
  for (const [dir, name] of voicePaths) {
    mkdirSync(join(projectDir, "assets", dir), { recursive: true });
    writeFileSync(join(projectDir, "assets", dir, name), "voice");
  }
  mkdirSync(join(projectDir, "assets", "music"), { recursive: true });
  writeFileSync(join(projectDir, "assets", "music", "underscore.wav"), "music");

  const { json } = jsonResolve(["--adopt", "--project", projectDir]);
  assert.equal(json.adopted, 1);
  assert.equal(json.assets[0].path, "assets/music/underscore.wav");
  cleanup();
});

test("assets adoption and matching ignore symlink escapes", () => {
  setup();
  mkdirSync(join(projectDir, "assets", "sfx"), { recursive: true });
  const outside = join(tmp, "outside-whoosh.wav");
  writeFileSync(outside, "outside project bytes");
  symlinkSync(outside, join(projectDir, "assets", "sfx", "escaped-whoosh.wav"));

  const adopted = jsonResolve(["--adopt", "--project", projectDir]).json;
  assert.equal(adopted.adopted, 0);

  const matched = jsonResolve(
    ["--type", "sfx", "--intent", "escaped whoosh", "--project", projectDir],
    { fail: true },
  );
  assert.equal(matched.status, 1);
  assert.equal(matched.json.ok, false);
  assert.equal(readManifest(projectDir).length, 0);
  cleanup();
});

test("plain DESIGN.md resolves as a local brand record", () => {
  setup();
  writeFileSync(join(projectDir, "DESIGN.md"), "# Brand direction\n\nUse quiet editorial spacing.\n");

  const { json } = jsonResolve([
    "--type",
    "brand",
    "--intent",
    "project brand",
    "--project",
    projectDir,
  ]);
  assert.equal(json.ok, true);
  assert.equal(json._source, "local-brand");
  assert.equal(json.provenance.source_file, "DESIGN.md");
  assert.equal(json.provenance.origin, "local-file");
  assert.equal(
    readFileSync(join(projectDir, json.path), "utf8"),
    readFileSync(join(projectDir, "DESIGN.md"), "utf8"),
  );
  cleanup();
});

test("CRLF frame frontmatter is parsed into local brand metadata", () => {
  setup();
  writeFileSync(
    join(projectDir, "frame.md"),
    '---\r\nprimary: "#123abc"\r\ntypography: "Inter"\r\nlogo: assets/logo.svg\r\n---\r\n# Frame\r\n',
  );

  const { json } = jsonResolve([
    "--type",
    "brand",
    "--intent",
    "frame tokens",
    "--project",
    projectDir,
  ]);
  assert.deepEqual(json.provenance.colors, [{ name: "primary", hex: "#123abc" }]);
  assert.equal(json.provenance.font, "Inter");
  assert.equal(json.provenance.logo, "assets/logo.svg");
  cleanup();
});

test("voice is not an advertised or resolvable type", () => {
  setup();
  const help = runResolve(["--help"]).stdout;
  assert.doesNotMatch(help, /Types:.*\bvoice\b/);

  const failed = runResolve(
    ["--type", "voice", "--intent", "narration", "--project", projectDir],
    { fail: true },
  );
  assert.equal(failed.status, 2);
  assert.match(failed.stderr, /unsupported media type/);
  cleanup();
});

test("a local miss returns staging instructions without mutating the project", () => {
  setup();
  const { status, json } = jsonResolve(
    ["--type", "sfx", "--intent", "missing click", "--project", projectDir],
    { fail: true },
  );
  assert.equal(status, 1);
  assert.equal(json.ok, false);
  assert.match(json.error, /stage one under/);
  assert.match(json.error, /--source <local-file>/);
  assert.equal(readManifest(projectDir).length, 0);
  cleanup();
});

test("runtime contains no network acquisition layer", () => {
  const skillDir = join(import.meta.dirname, "..");
  const removed = [
    "bgm-provider.mjs",
    "sfx-provider.mjs",
    "image-provider.mjs",
    "providers.mjs",
  ];
  for (const name of removed) {
    assert.equal(existsSync(join(import.meta.dirname, "lib", name)), false, `${name} must be absent`);
  }

  const runtime = [
    join(import.meta.dirname, "resolve.mjs"),
    join(import.meta.dirname, "lib", "freeze.mjs"),
  ]
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  assert.doesNotMatch(runtime, /\bfetch\s*\(/);
  assert.doesNotMatch(runtime, /https?:\/\//);
  assert.ok(existsSync(join(skillDir, "SKILL.md")));
});

test("one-line output preserves the compact contract", () => {
  setup();
  createProjectRecord(
    localRecord({ provenance: { origin: "local-file", local: true, prompt: "format test" } }),
  );
  const output = runResolve([
    "--type",
    "bgm",
    "--intent",
    "format test",
    "--project",
    projectDir,
  ]).stdout;
  assert.match(output.trim(), /^resolved bgm_001 → .media\/audio\/bgm\/bgm_001\.wav \(bgm/);
  cleanup();
});

async function main() {
  console.log("media-use · local resolver tests\n");
  let passed = 0;
  let failed = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      passed++;
      console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    } catch (error) {
      failed++;
      console.log(`  \x1b[31m✗\x1b[0m ${name}`);
      console.log(`    ${error.message}`);
    } finally {
      if (tmp) cleanup();
    }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
