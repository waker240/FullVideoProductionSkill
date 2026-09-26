"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const SCRIPT = path.resolve(__dirname, "..", "scaffold.cjs");
const CANONICAL_TTS = path.resolve(__dirname, "..", "tts-fish.mjs");
const CANONICAL_FAST = path.resolve(__dirname, "..", "lib", "fast-passages.cjs");
const PUBLIC_MEDIA_API = path.resolve(__dirname, "..", "..", "..", "fish-audio-api", "scripts", "public-media-api.cjs");

test("later acts inherit reusable prior-act tooling without act-specific state", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf scaffold "));
  try {
    const episode = path.join(temporaryRoot, "episode with space");
    const act1 = path.join(episode, "act1");
    const act2 = path.join(episode, "act2");
    makeReferenceAct(act1);

    runScaffold([act2], temporaryRoot);

    assert.equal(read(path.join(act2, "scripts", "build-subs.cjs")), "// reference build-subs v1\n");
    assert.equal(read(path.join(act2, "scripts", "tts-fish.mjs")), read(CANONICAL_TTS));
    assert.equal(fs.existsSync(path.join(act2, "scripts", "tts-edge.js")), false);
    assert.equal(fs.existsSync(path.join(act2, "scripts", "tts-manbo.js")), false);
    assert.equal(fs.existsSync(path.join(act2, "scripts", "build-project.cjs")), false);
    assert.equal(fs.existsSync(path.join(act2, "scripts", "check-spatial-canvas.cjs")), true);
    assert.equal(fs.existsSync(path.join(act2, "scripts", "check-fast-passages.cjs")), true);
    assert.equal(fs.existsSync(path.join(act2, "scripts", "audio-discover.cjs")), true);
    assert.equal(fs.existsSync(path.join(act2, "scripts", "lib", "spatial-canvas.cjs")), true);
    assert.equal(fs.existsSync(path.join(act2, "scripts", "lib", "fast-passages.cjs")), true);
    assert.match(read(path.join(act2, "scripts", "check.cjs")), /runSpatialCanvasCheck/);
    assert.match(read(path.join(act2, "scripts", "check.cjs")), /runFastPassagesCheck/);
    assert.doesNotMatch(read(path.join(act2, "scripts", "check.cjs")), /stale reference checker/);
    assert.equal(fs.existsSync(path.join(act2, "scripts", "boundaries.json")), false);
    assert.equal(read(path.join(act2, "fonts", "series.woff2")), "font-v1");
    assert.equal(read(path.join(act2, "vendor", "gsap-3.14.2.min.js")), "// gsap-local\n");
    assert.doesNotMatch(read(path.join(act2, "index.html")), /cdn\.jsdelivr/);
    assert.match(read(path.join(act2, "index.html")), /vendor\/gsap-3\.14\.2\.min\.js/);

    const narration = json(path.join(act2, "scripts", "narration.json"));
    assert.equal(narration.voice.referenceId, "reference-voice");
    assert.equal(narration.voice.model, "s2.1-pro-free");
    assert.equal(narration.voice.transport, "official-api");
    assert.equal(narration.voice.backend, undefined);
    assert.equal(narration.voice.sampler, undefined);
    assert.equal(narration.voice.sampleRate, 48000);
    assert.equal(narration.voice.temperature, 0.7);
    assert.equal(narration.voice.prosody.volume, 5);
    assert.equal(Object.prototype.hasOwnProperty.call(narration.voice, "apiKey"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(narration.voice.prosody, "token"), false);
    assert.equal(narration.requireSpelledOutNumbers, true);
    assert.equal(narration.sections.length, 1);
    assert.notEqual(narration.sections[0].title, "Act One content");

    const pkg = json(path.join(act2, "package.json"));
    assert.equal(pkg.name, "act2");
    assert.equal(pkg.type, "module");
    assert.equal(pkg.engines.node, ">=22.20.0");
    assert.equal(pkg.scripts.tts, "node scripts/tts-fish.mjs");
    assert.match(pkg.scripts.audio, /node scripts\/master\.cjs/);
    assert.equal(pkg.scripts["audio:discover"], "node scripts/audio-discover.cjs");
    assert.equal(pkg.scripts["fast:check"], "node scripts/check-fast-passages.cjs");
    assert.match(pkg.scripts.render, /--fps 60/);
    assert.equal(pkg.scripts.build, undefined);
    assert.deepEqual(pkg.devDependencies, { "series-tool": "1.2.3" });

    const manifest = json(path.join(act2, ".hyperframes-scaffold.json"));
    assert.equal(manifest.referenceMode, "auto-previous-act");
    assert.equal(manifest.provider, "fish");
    assert.equal(manifest.ambitionContractVersion, 2);
    assert.ok(manifest.intentionallyNotInherited.includes("scripts/build-project.cjs"));
    assert.ok(manifest.intentionallyNotInherited.includes("SPATIAL_CANVAS.json"));
    assert.ok(manifest.intentionallyNotInherited.includes("FAST_PASSAGES.json"));
    assert.equal(fs.existsSync(path.join(act2, "SPATIAL_CANVAS.json")), false);
    assert.equal(fs.existsSync(path.join(act2, "FAST_PASSAGES.json")), false);
    assert.equal(fs.existsSync(path.join(act2, "SPATIAL_CANVAS.example.json")), true);
    assert.equal(fs.existsSync(path.join(act2, "FAST_PASSAGES.example.json")), true);
    assert.match(read(path.join(act2, "DESIGN.md")), /Spatial Canvas admission/);
    assert.match(read(path.join(act2, "DESIGN.md")), /Fast-paced passage admission/);
    assert.match(read(path.join(act2, "DESIGN.md")), /Sound palette — discover, audition, freeze/);
    assert.match(read(path.join(act2, "DIRECTION.md")), /Fast-passage trajectory review/);
    assert.match(read(path.join(act2, "DIRECTION.md")), /Sound-mix review/);
    assert.match(read(path.join(act2, "index.html")), /Earned SFX example/);

    // Default reruns and safe refreshes preserve a locally edited managed file.
    fs.writeFileSync(path.join(act2, "scripts", "build-subs.cjs"), "// local customization\n");
    fs.writeFileSync(path.join(act1, "scripts", "build-subs.cjs"), "// reference build-subs v2\n");
    fs.writeFileSync(path.join(act1, "scripts", "tts-fish.mjs"), "// reference fish v2\n");
    runScaffold([act2], temporaryRoot);
    assert.equal(read(path.join(act2, "scripts", "build-subs.cjs")), "// local customization\n");
    assert.equal(read(path.join(act2, "scripts", "tts-fish.mjs")), read(CANONICAL_TTS));

    runScaffold([act2, "--refresh-scripts"], temporaryRoot);
    assert.equal(read(path.join(act2, "scripts", "build-subs.cjs")), "// local customization\n");
    assert.equal(read(path.join(act2, "scripts", "tts-fish.mjs")), read(CANONICAL_TTS));
    const refreshed = json(path.join(act2, ".hyperframes-scaffold.json"));
    assert.equal(refreshed.files.find((entry) => entry.target === "scripts/build-subs.cjs").action, "kept-customized");

    delete refreshed.ambitionContractVersion;
    fs.writeFileSync(path.join(act2, ".hyperframes-scaffold.json"), `${JSON.stringify(refreshed, null, 2)}\n`);
    runScaffold([act2], temporaryRoot);
    assert.equal(Object.prototype.hasOwnProperty.call(json(path.join(act2, ".hyperframes-scaffold.json")), "ambitionContractVersion"), false);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("canonical scaffolds are Fish-only, compatibility flag is narrow, and dry-run writes nothing", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-canonical-"));
  try {
    const destination = path.join(temporaryRoot, "standalone");
    runScaffold([destination, "--canonical"], temporaryRoot);
    assert.equal(fs.existsSync(path.join(destination, "scripts", "tts-fish.mjs")), true);
    assert.equal(fs.existsSync(path.join(destination, "scripts", "tts-edge.js")), false);
    assert.equal(fs.existsSync(path.join(destination, "scripts", "tts-manbo.js")), false);
    assert.doesNotMatch(read(path.join(destination, "index.html")), /cdn\.jsdelivr/);
    assert.match(read(path.join(destination, "index.html")), /vendor\/gsap-3\.14\.2\.min\.js/);
    assert.equal(read(path.join(destination, "scripts", "public-media-api.cjs")), read(PUBLIC_MEDIA_API));
    for (const helper of ["doctor.cjs", "setup-runtime.cjs"]) {
      assert.equal(fs.existsSync(path.join(destination, "scripts", helper)), true);
    }
    const envExample = read(path.join(destination, ".env.example"));
    for (const key of ["FISH_API_KEY", "FISH_REFERENCE_ID", "OPENAI_API_KEY", "OPENAI_IMAGE_MODEL"]) {
      assert.match(envExample, new RegExp(`^${key}=\\s*$`, "m"));
    }
    assert.equal(fs.existsSync(path.join(destination, ".env")), false);
    const gitignore = read(path.join(destination, ".gitignore"));
    assert.match(gitignore, /^\.env\r?$/m);
    assert.match(gitignore, /^\.env\.\*\r?$/m);
    assert.match(gitignore, /^!\.env\.example\r?$/m);
    assert.match(gitignore, /^node_modules\/\r?$/m);
    const narration = json(path.join(destination, "scripts", "narration.json"));
    assert.equal(narration.voice.provider, "Fish Audio");
    assert.equal(narration.voice.transport, "official-api");
    assert.equal(narration.voice.referenceId, null);
    assert.equal(narration.voice.apiUrl, undefined);
    assert.equal(narration.voice.backend, undefined);
    assert.equal(narration.voice.model, null);
    assert.equal(narration.voice.format, "wav");
    assert.equal(narration.voice.sampleRate, 44100);
    assert.equal(narration.voice.temperature, 0.7);
    assert.equal(narration.voice.sampler, undefined);
    assert.equal(narration.voice.prosody.volume, 0);
    assert.match(narration.note, /fish-audio-api/);
    assert.match(narration.note, /FISH_REFERENCE_ID and FISH_MODEL/);
    assert.equal(Object.prototype.hasOwnProperty.call(narration.voice, "apiKey"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(narration.voice, "cookie"), false);
    const pkg = json(path.join(destination, "package.json"));
    assert.equal(pkg.scripts.tts, "node scripts/tts-fish.mjs");
    assert.equal(json(path.join(destination, ".hyperframes-scaffold.json")).provider, "fish");

    const dryRun = path.join(temporaryRoot, "dry-run");
    runScaffold([dryRun, "--canonical", "--provider=fish", "--dry-run"], temporaryRoot);
    assert.equal(fs.existsSync(dryRun), false);

    for (const unsupported of ["edge", "manbo", "auto"]) {
      const rejected = spawnSync(process.execPath, [SCRIPT, path.join(temporaryRoot, unsupported), `--provider=${unsupported}`], {
        cwd: temporaryRoot, encoding: "utf8", env: { ...process.env, HYPERFRAMES_SKIP_ACL: "1" },
      });
      assert.notEqual(rejected.status, 0);
      assert.match(rejected.stderr, /only accepts fish/i);
    }

    const legacyReference = path.join(temporaryRoot, "legacy-reference");
    const inherited = path.join(temporaryRoot, "inherited");
    makeReferenceAct(legacyReference);
    fs.writeFileSync(path.join(legacyReference, "scripts", "narration.json"), `${JSON.stringify({
      voice: "legacy-non-fish-voice", provider: "legacy-provider", fps: 30,
      sections: [{ id: "s0", paragraphs: [{ tts: "Do not inherit.", lines: ["Do not inherit."] }] }],
    }, null, 2)}\n`);
    runScaffold([inherited, "--from-act", legacyReference], temporaryRoot);
    const inheritedNarration = json(path.join(inherited, "scripts", "narration.json"));
    assert.equal(inheritedNarration.voice.provider, "Fish Audio");
    assert.equal(inheritedNarration.voice.referenceId, null);
    assert.equal(inheritedNarration.voice.model, null);
    assert.equal(inheritedNarration.voice.transport, "official-api");
    assert.equal(inheritedNarration.voice.backend, undefined);
    assert.equal(inheritedNarration.fps, 30);
    assert.equal(fs.existsSync(path.join(inherited, "scripts", "tts-fish.mjs")), true);
    assert.equal(fs.existsSync(path.join(inherited, "scripts", "tts-edge.js")), false);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("official profiles keep settings without credentials; legacy proxy inheritance is rejected before writing", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-proxy-"));
  try {
    const act1 = path.join(temporaryRoot, "act1");
    const act2 = path.join(temporaryRoot, "act2");
    runScaffold([act1, "--canonical"], temporaryRoot);
    const sourcePath = path.join(act1, "scripts", "narration.json");
    const source = json(sourcePath);
    source.voice.prosody.speed = 1.08;
    source.voice.temperature = 0.65;
    source.voice.apiKey = "TEST_CREDENTIAL";
    source.voice.cookie = "TEST_CREDENTIAL";
    fs.writeFileSync(sourcePath, JSON.stringify(source));
    runScaffold([act2], temporaryRoot);
    const result = json(path.join(act2, "scripts", "narration.json"));
    assert.equal(result.voice.transport, "official-api");
    assert.equal(result.voice.apiUrl, undefined);
    assert.equal(result.voice.prosody.speed, 1.08);
    assert.equal(result.voice.temperature, 0.65);
    assert.equal(result.voice.apiKey, undefined);
    assert.equal(result.voice.sampler, undefined);
    assert.equal(result.voice.cookie, undefined);
    assert.equal(result.voice.model, null);
    assert.equal(result.voice.sampleRate, 44100);
    source.voice.transport = "local-proxy";
    source.voice.apiUrl = "http://127.0.0.1:9099/tts";
    fs.writeFileSync(sourcePath, JSON.stringify(source));
    const fresh = path.join(temporaryRoot, "legacy-destination");
    const rejected = rejectScaffold([fresh, "--from-act", act1], temporaryRoot);
    assert.match(rejected.stderr, /legacy proxy or website profile/);
    assert.equal(fs.existsSync(fresh), false);
    const automatic = path.join(temporaryRoot, "act3");
    const proxyAct2 = path.join(act2, "scripts", "narration.json");
    fs.writeFileSync(proxyAct2, JSON.stringify(source));
    assert.match(rejectScaffold([automatic], temporaryRoot).stderr, /legacy proxy or website profile/);
    assert.equal(fs.existsSync(automatic), false);
    const existingBefore = fs.readFileSync(proxyAct2, "utf8");
    assert.match(rejectScaffold([act2, "--refresh-scripts"], temporaryRoot).stderr, /legacy proxy or website profile/);
    assert.equal(fs.readFileSync(proxyAct2, "utf8"), existingBefore);
  } finally { fs.rmSync(temporaryRoot, { recursive: true, force: true }); }
});

test("reruns backfill missing commands, preserve unrelated package content, and reject command conflicts", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-package-backfill-"));
  try {
    const destination = path.join(temporaryRoot, "legacy-fish-project");
    runScaffold([destination, "--canonical"], temporaryRoot);

    const legacyPackage = json(path.join(destination, "package.json"));
    delete legacyPackage.scripts.tts;
    delete legacyPackage.scripts["audio:discover"];
    delete legacyPackage.scripts["fast:check"];
    legacyPackage.scripts.inspect = "node tools/custom-inspect.mjs";
    legacyPackage.hyperframesLocal = { owner: "editor", preserve: ["all", "values"] };
    fs.writeFileSync(path.join(destination, "package.json"), `${JSON.stringify(legacyPackage, null, 2)}\n`);

    runScaffold([destination], temporaryRoot);
    const backfilled = json(path.join(destination, "package.json"));
    assert.equal(backfilled.scripts.tts, "node scripts/tts-fish.mjs");
    assert.equal(backfilled.scripts["audio:discover"], "node scripts/audio-discover.cjs");
    assert.equal(backfilled.scripts["fast:check"], "node scripts/check-fast-passages.cjs");
    assert.equal(backfilled.scripts.inspect, "node tools/custom-inspect.mjs");
    assert.deepEqual(backfilled.hyperframesLocal, legacyPackage.hyperframesLocal);
    assert.equal(
      json(path.join(destination, ".hyperframes-scaffold.json")).files.find((entry) => entry.target === "package.json").action,
      "backfilled-scripts",
    );

    backfilled.scripts["fast:check"] = "node tools/custom-fast-check.mjs";
    delete backfilled.scripts["audio:discover"];
    const conflictingPackageBytes = `${JSON.stringify(backfilled, null, 2)}\n`;
    fs.writeFileSync(path.join(destination, "package.json"), conflictingPackageBytes);
    const manifestBeforeConflict = read(path.join(destination, ".hyperframes-scaffold.json"));
    const conflict = rejectScaffold([destination, "--refresh-scripts"], temporaryRoot);
    assert.match(conflict.stderr, /conflicting package script fast:check/i);
    assert.equal(read(path.join(destination, "package.json")), conflictingPackageBytes);
    assert.equal(read(path.join(destination, ".hyperframes-scaffold.json")), manifestBeforeConflict);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("refresh keeps the manifest-pinned reference act and the Fish invariant", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-pinned-"));
  try {
    const episode = path.join(temporaryRoot, "episode");
    const act1 = path.join(episode, "act1");
    const act2 = path.join(episode, "act2");
    const act3 = path.join(episode, "act3");
    makeReferenceAct(act1);
    makeReferenceAct(act2);
    fs.writeFileSync(path.join(act2, "scripts", "tts-fish.mjs"), "// wrong auto-neighbor\n");

    runScaffold([act3, "--from-act", act1], temporaryRoot);
    fs.writeFileSync(path.join(act1, "scripts", "tts-fish.mjs"), "// pinned act one v2\n");
    fs.writeFileSync(path.join(act1, "scripts", "narration.json"), `${JSON.stringify({
      voice: "legacy-non-fish-voice", provider: "legacy-provider", fps: 60, sttLanguage: "english",
      sections: [{ id: "s0", paragraphs: [{ tts: "Changed legacy metadata.", lines: ["Changed legacy metadata."] }] }],
    }, null, 2)}\n`);

    runScaffold([act3, "--refresh-scripts"], temporaryRoot);
    assert.equal(read(path.join(act3, "scripts", "tts-fish.mjs")), read(CANONICAL_TTS));
    assert.equal(fs.existsSync(path.join(act3, "scripts", "tts-edge.js")), false);
    const manifest = json(path.join(act3, ".hyperframes-scaffold.json"));
    assert.equal(manifest.provider, "fish");
    assert.equal(path.resolve(act3, manifest.referenceActRelativeToProject), path.resolve(act1));

    const unsupportedProvider = spawnSync(process.execPath, [SCRIPT, act3, "--provider=edge"], {
      cwd: temporaryRoot, encoding: "utf8", env: { ...process.env, HYPERFRAMES_SKIP_ACL: "1" },
    });
    assert.notEqual(unsupportedProvider.status, 0);
    assert.match(unsupportedProvider.stderr, /only accepts fish/i);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("populated legacy destinations are rejected before any Fish relabel or write", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-legacy-"));
  try {
    const withoutManifest = path.join(temporaryRoot, "legacy-no-manifest");
    fs.mkdirSync(path.join(withoutManifest, "scripts"), { recursive: true });
    const legacyNarration = `${JSON.stringify({
      voice: "legacy-voice", provider: "legacy-provider",
      sections: [{ id: "s0", paragraphs: [{ tts: "Legacy.", lines: ["Legacy."] }] }],
    }, null, 2)}\n`;
    fs.writeFileSync(path.join(withoutManifest, "scripts", "narration.json"), legacyNarration);

    const unmanifested = rejectScaffold([withoutManifest], temporaryRoot);
    assert.match(unmanifested.stderr, /populated destination without a valid Fish scaffold manifest/i);
    assert.equal(read(path.join(withoutManifest, "scripts", "narration.json")), legacyNarration);
    assert.equal(fs.existsSync(path.join(withoutManifest, "scripts", "tts-fish.mjs")), false);
    assert.equal(fs.existsSync(path.join(withoutManifest, ".hyperframes-scaffold.json")), false);

    const legacyManifest = path.join(temporaryRoot, "legacy-manifest");
    fs.mkdirSync(legacyManifest, { recursive: true });
    const manifestText = `${JSON.stringify({ schemaVersion: 1, provider: "legacy-provider", files: [] }, null, 2)}\n`;
    fs.writeFileSync(path.join(legacyManifest, ".hyperframes-scaffold.json"), manifestText);
    const manifested = rejectScaffold([legacyManifest], temporaryRoot);
    assert.match(manifested.stderr, /Refusing to relabel a populated legacy-provider project as Fish/i);
    assert.equal(read(path.join(legacyManifest, ".hyperframes-scaffold.json")), manifestText);
    assert.deepEqual(fs.readdirSync(legacyManifest), [".hyperframes-scaffold.json"]);

    const staleFishManifest = path.join(temporaryRoot, "stale-fish-manifest");
    fs.mkdirSync(staleFishManifest, { recursive: true });
    fs.writeFileSync(path.join(staleFishManifest, ".hyperframes-scaffold.json"), `${JSON.stringify({
      schemaVersion: 1, provider: "fish", files: [],
    })}\n`);
    const stale = rejectScaffold([staleFishManifest], temporaryRoot);
    assert.match(stale.stderr, /Fish manifest is stale or structurally invalid/i);
    assert.deepEqual(fs.readdirSync(staleFishManifest), [".hyperframes-scaffold.json"]);

    const invalidContractVersion = path.join(temporaryRoot, "invalid-contract-version");
    runScaffold([invalidContractVersion, "--canonical"], temporaryRoot);
    const invalidContractManifestPath = path.join(invalidContractVersion, ".hyperframes-scaffold.json");
    const invalidContractManifest = json(invalidContractManifestPath);
    invalidContractManifest.ambitionContractVersion = "oops";
    fs.writeFileSync(invalidContractManifestPath, `${JSON.stringify(invalidContractManifest, null, 2)}\n`);
    const invalidVersion = rejectScaffold([invalidContractVersion], temporaryRoot);
    assert.match(invalidVersion.stderr, /Fish manifest is stale or structurally invalid/i);
    assert.equal(json(invalidContractManifestPath).ambitionContractVersion, "oops");

    const inconsistent = path.join(temporaryRoot, "inconsistent-fish-manifest");
    fs.mkdirSync(path.join(inconsistent, "scripts"), { recursive: true });
    fs.writeFileSync(path.join(inconsistent, ".hyperframes-scaffold.json"), `${JSON.stringify({
      schemaVersion: 2,
      provider: "fish",
      files: [{ target: "scripts/narration.json", source: "legacy", managed: false }],
    })}\n`);
    fs.writeFileSync(path.join(inconsistent, "scripts", "narration.json"), legacyNarration);
    const inconsistentResult = rejectScaffold([inconsistent], temporaryRoot);
    assert.match(inconsistentResult.stderr, /narration is not configured for Fish Audio/i);
    assert.equal(fs.existsSync(path.join(inconsistent, "scripts", "tts-fish.mjs")), false);

    const mixed = path.join(temporaryRoot, "mixed-routes");
    runScaffold([mixed, "--canonical"], temporaryRoot);
    fs.writeFileSync(path.join(mixed, "scripts", "tts-edge.js"), "// retired route\n");
    const retiredHelper = rejectScaffold([mixed], temporaryRoot);
    assert.match(retiredHelper.stderr, /retired TTS helpers or local music generators: tts-edge\.js/i);
    fs.unlinkSync(path.join(mixed, "scripts", "tts-edge.js"));

    const mixedPackage = json(path.join(mixed, "package.json"));
    mixedPackage.scripts.tts = "node custom/tts-fish.mjs";
    fs.writeFileSync(path.join(mixed, "package.json"), `${JSON.stringify(mixedPackage, null, 2)}\n`);
    const noncanonicalEntry = rejectScaffold([mixed], temporaryRoot);
    assert.match(noncanonicalEntry.stderr, /package tts command is not the canonical Fish entry point/i);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("reruns reject a locally replaced Fish helper before writes and require an explicit force refresh", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-tts-contract-"));
  try {
    const destination = path.join(temporaryRoot, "fish-project");
    runScaffold([destination, "--canonical"], temporaryRoot);
    const manifestPath = path.join(destination, ".hyperframes-scaffold.json");
    const manifestBefore = read(manifestPath);
    const helperPath = path.join(destination, "scripts", "tts-fish.mjs");
    const replacement = "// locally replaced Fish helper\n";
    fs.writeFileSync(helperPath, replacement);

    for (const args of [[destination], [destination, "--refresh-scripts"]]) {
      const rejected = rejectScaffold(args, temporaryRoot);
      assert.match(rejected.stderr, /Refusing to preserve a noncanonical scripts\/tts-fish\.mjs/i);
      assert.equal(read(helperPath), replacement);
      assert.equal(read(manifestPath), manifestBefore);
    }

    const unmanagedManifest = json(manifestPath);
    const unmanagedRecord = unmanagedManifest.files.find((entry) => entry.target === "scripts/tts-fish.mjs");
    unmanagedRecord.managed = false;
    unmanagedRecord.managedSha256 = sha256Text(replacement);
    fs.writeFileSync(manifestPath, `${JSON.stringify(unmanagedManifest, null, 2)}\n`);
    const unmanagedBefore = read(manifestPath);
    const unmanagedRefresh = rejectScaffold([destination, "--refresh-scripts"], temporaryRoot);
    assert.match(unmanagedRefresh.stderr, /Refusing to preserve a noncanonical scripts\/tts-fish\.mjs/i);
    assert.equal(read(helperPath), replacement);
    assert.equal(read(manifestPath), unmanagedBefore);

    runScaffold([destination, "--force-refresh-scripts"], temporaryRoot);
    assert.equal(read(helperPath), read(CANONICAL_TTS));
    const restored = json(manifestPath);
    assert.equal(restored.files.find((entry) => entry.target === "scripts/tts-fish.mjs").action, "force-refreshed");

    const previousCanonical = "// previous audited canonical Fish helper\n";
    fs.writeFileSync(helperPath, previousCanonical);
    const previousManifest = json(manifestPath);
    const previousRecord = previousManifest.files.find((entry) => entry.target === "scripts/tts-fish.mjs");
    previousRecord.managedSha256 = sha256Text(previousCanonical);
    previousRecord.targetSha256 = sha256Text(previousCanonical);
    fs.writeFileSync(manifestPath, `${JSON.stringify(previousManifest, null, 2)}\n`);

    runScaffold([destination, "--refresh-scripts"], temporaryRoot);
    assert.equal(read(helperPath), read(CANONICAL_TTS));
    assert.equal(json(manifestPath).files.find((entry) => entry.target === "scripts/tts-fish.mjs").action, "refreshed");
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("Fish helper symlinks are rejected before force refresh can touch an external file", { skip: process.platform === "win32" }, () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-tts-symlink-"));
  try {
    const destination = path.join(temporaryRoot, "fish-project");
    runScaffold([destination, "--canonical"], temporaryRoot);
    const manifestPath = path.join(destination, ".hyperframes-scaffold.json");
    const manifestBefore = read(manifestPath);
    const helperPath = path.join(destination, "scripts", "tts-fish.mjs");
    const outsidePath = path.join(temporaryRoot, "outside-helper.mjs");
    const outsideBytes = "// must remain untouched\n";
    fs.writeFileSync(outsidePath, outsideBytes);
    fs.unlinkSync(helperPath);
    fs.symlinkSync(outsidePath, helperPath);

    for (const args of [[destination], [destination, "--force-refresh-scripts"]]) {
      const rejected = rejectScaffold(args, temporaryRoot);
      assert.match(rejected.stderr, /Refusing to update non-regular scripts\/tts-fish\.mjs/i);
      assert.equal(read(outsidePath), outsideBytes);
      assert.equal(fs.lstatSync(helperPath).isSymbolicLink(), true);
      assert.equal(read(manifestPath), manifestBefore);
    }

    fs.unlinkSync(helperPath);
    runScaffold([destination, "--force-refresh-scripts"], temporaryRoot);
    assert.equal(fs.lstatSync(helperPath).isFile(), true);
    assert.equal(fs.lstatSync(helperPath).isSymbolicLink(), false);
    assert.equal(read(helperPath), read(CANONICAL_TTS));
    assert.equal(read(outsidePath), outsideBytes);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("dangling retired TTS helper entries fail closed before any scaffold write", { skip: process.platform === "win32" }, () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-retired-dangling-"));
  try {
    const destination = path.join(temporaryRoot, "fish-project");
    runScaffold([destination, "--canonical"], temporaryRoot);
    const manifestPath = path.join(destination, ".hyperframes-scaffold.json");
    const manifestBefore = read(manifestPath);
    const retiredNames = ["tts-edge.js", "tts-kokoro.mjs", "musicgen.py"];
    const retiredEntries = retiredNames.map((name) => ({
      path: path.join(destination, "scripts", name),
      missingTarget: path.join(temporaryRoot, "external", `missing-${name}`),
    }));
    fs.mkdirSync(path.join(temporaryRoot, "external"));
    for (const entry of retiredEntries) fs.symlinkSync(entry.missingTarget, entry.path);

    for (const args of [[destination], [destination, "--force-refresh-scripts"]]) {
      const rejected = rejectScaffold(args, temporaryRoot);
      assert.match(rejected.stderr, /retired TTS helpers or local music generators: musicgen\.py, tts-edge\.js, tts-kokoro\.mjs/i);
      for (const entry of retiredEntries) {
        assert.equal(fs.lstatSync(entry.path).isSymbolicLink(), true);
        assert.equal(fs.existsSync(entry.missingTarget), false);
      }
      assert.equal(read(manifestPath), manifestBefore);
    }
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("invalid package roots and retired local audio package routes fail before helper backfill", () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-package-preflight-"));
  try {
    const invalidRoot = path.join(temporaryRoot, "invalid-root");
    runScaffold([invalidRoot, "--canonical"], temporaryRoot);
    const invalidRootManifest = path.join(invalidRoot, ".hyperframes-scaffold.json");
    const invalidRootManifestBefore = read(invalidRootManifest);
    const invalidRootHelper = path.join(invalidRoot, "scripts", "audio-discover.cjs");
    fs.unlinkSync(invalidRootHelper);
    fs.writeFileSync(path.join(invalidRoot, "package.json"), "[]\n");
    const invalid = rejectScaffold([invalidRoot], temporaryRoot);
    assert.match(invalid.stderr, /package JSON root is not an object/i);
    assert.equal(fs.existsSync(invalidRootHelper), false);
    assert.equal(read(path.join(invalidRoot, "package.json")), "[]\n");
    assert.equal(read(invalidRootManifest), invalidRootManifestBefore);

    const retiredPackage = path.join(temporaryRoot, "retired-package");
    runScaffold([retiredPackage, "--canonical"], temporaryRoot);
    const retiredManifestPath = path.join(retiredPackage, ".hyperframes-scaffold.json");
    const retiredManifestBefore = read(retiredManifestPath);
    const retiredHelper = path.join(retiredPackage, "scripts", "audio-discover.cjs");
    fs.unlinkSync(retiredHelper);
    const pkg = json(path.join(retiredPackage, "package.json"));
    pkg.scripts["music:generate"] = "python scripts/musicgen.py";
    pkg.devDependencies = { ...(pkg.devDependencies || {}), "kokoro-js": "1.0.0" };
    const retiredPackageBytes = `${JSON.stringify(pkg, null, 2)}\n`;
    fs.writeFileSync(path.join(retiredPackage, "package.json"), retiredPackageBytes);
    const retired = rejectScaffold([retiredPackage, "--force-refresh-scripts"], temporaryRoot);
    assert.match(retired.stderr, /retired local voice\/music package routes/i);
    assert.match(retired.stderr, /scripts\.music:generate/i);
    assert.match(retired.stderr, /devDependencies\.kokoro-js/i);
    assert.equal(fs.existsSync(retiredHelper), false);
    assert.equal(read(path.join(retiredPackage, "package.json")), retiredPackageBytes);
    assert.equal(read(retiredManifestPath), retiredManifestBefore);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("a symlinked scripts directory is rejected before any managed helper can escape the project", { skip: process.platform === "win32" }, () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-scripts-symlink-"));
  try {
    const destination = path.join(temporaryRoot, "fish-project");
    runScaffold([destination, "--canonical"], temporaryRoot);
    const manifestPath = path.join(destination, ".hyperframes-scaffold.json");
    const manifestBefore = read(manifestPath);
    const scriptsPath = path.join(destination, "scripts");
    const originalScripts = path.join(temporaryRoot, "original-scripts");
    const outsideScripts = path.join(temporaryRoot, "outside-scripts");
    fs.renameSync(scriptsPath, originalScripts);
    fs.mkdirSync(outsideScripts);
    const outsideHelper = path.join(outsideScripts, "tts-fish.mjs");
    const outsideBytes = "// external scripts directory must remain untouched\n";
    fs.writeFileSync(outsideHelper, outsideBytes);
    fs.symlinkSync(outsideScripts, scriptsPath, "dir");

    const rejected = rejectScaffold([destination, "--force-refresh-scripts"], temporaryRoot);
    assert.match(rejected.stderr, /scripts path is a symlink or non-directory/i);
    assert.equal(read(outsideHelper), outsideBytes);
    assert.equal(fs.lstatSync(scriptsPath).isSymbolicLink(), true);
    assert.equal(read(manifestPath), manifestBefore);

    fs.unlinkSync(scriptsPath);
    fs.renameSync(originalScripts, scriptsPath);
    runScaffold([destination, "--refresh-scripts"], temporaryRoot);
    assert.equal(read(path.join(scriptsPath, "tts-fish.mjs")), read(CANONICAL_TTS));
    assert.equal(read(outsideHelper), outsideBytes);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("nested managed targets reject leaf, ancestor, dangling, and non-regular filesystem entries", { skip: process.platform === "win32" }, () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-target-safety-"));
  try {
    const destination = path.join(temporaryRoot, "fish-project");
    runScaffold([destination, "--canonical"], temporaryRoot);
    const manifestPath = path.join(destination, ".hyperframes-scaffold.json");
    const manifestBefore = read(manifestPath);

    const fastPath = path.join(destination, "scripts", "lib", "fast-passages.cjs");
    const outsideFast = path.join(temporaryRoot, "outside-fast.cjs");
    const outsideFastBytes = "// external fast contract must remain untouched\n";
    fs.writeFileSync(outsideFast, outsideFastBytes);
    fs.unlinkSync(fastPath);
    fs.symlinkSync(outsideFast, fastPath);
    const leafRejected = rejectScaffold([destination, "--force-refresh-scripts"], temporaryRoot);
    assert.match(leafRejected.stderr, /scripts\/lib\/fast-passages\.cjs.*target is a symlink/i);
    assert.equal(read(outsideFast), outsideFastBytes);
    assert.equal(read(manifestPath), manifestBefore);

    fs.unlinkSync(fastPath);
    fs.mkdirSync(fastPath);
    const nonRegularRejected = rejectScaffold([destination, "--force-refresh-scripts"], temporaryRoot);
    assert.match(nonRegularRejected.stderr, /scripts\/lib\/fast-passages\.cjs.*not a regular file/i);
    assert.equal(read(outsideFast), outsideFastBytes);
    assert.equal(read(manifestPath), manifestBefore);
    fs.rmdirSync(fastPath);
    fs.copyFileSync(CANONICAL_FAST, fastPath);

    const libPath = path.join(destination, "scripts", "lib");
    const savedLib = path.join(temporaryRoot, "saved-lib");
    const outsideLib = path.join(temporaryRoot, "outside-lib");
    fs.renameSync(libPath, savedLib);
    fs.mkdirSync(outsideLib);
    const outsideSpatial = path.join(outsideLib, "spatial-canvas.cjs");
    const outsideSpatialBytes = "// external ancestor must remain untouched\n";
    fs.writeFileSync(outsideSpatial, outsideSpatialBytes);
    fs.symlinkSync(outsideLib, libPath, "dir");
    const ancestorRejected = rejectScaffold([destination, "--force-refresh-scripts"], temporaryRoot);
    assert.match(ancestorRejected.stderr, /scripts\/lib\/spatial-canvas\.cjs.*ancestor scripts\/lib is a symlink/i);
    assert.equal(read(outsideSpatial), outsideSpatialBytes);
    assert.equal(read(manifestPath), manifestBefore);
    fs.unlinkSync(libPath);
    fs.renameSync(savedLib, libPath);

    fs.renameSync(libPath, savedLib);
    fs.writeFileSync(libPath, "not a directory\n");
    const nonDirectoryAncestorRejected = rejectScaffold([destination, "--force-refresh-scripts"], temporaryRoot);
    assert.match(nonDirectoryAncestorRejected.stderr, /scripts\/lib\/spatial-canvas\.cjs.*ancestor scripts\/lib is not a directory/i);
    assert.equal(read(manifestPath), manifestBefore);
    fs.unlinkSync(libPath);
    fs.renameSync(savedLib, libPath);

    const discoveryPath = path.join(destination, "scripts", "audio-discover.cjs");
    const danglingTarget = path.join(temporaryRoot, "outside", "must-not-be-created.cjs");
    fs.mkdirSync(path.dirname(danglingTarget));
    fs.unlinkSync(discoveryPath);
    fs.symlinkSync(danglingTarget, discoveryPath);
    for (const args of [[destination], [destination, "--force-refresh-scripts"]]) {
      const danglingRejected = rejectScaffold(args, temporaryRoot);
      assert.match(danglingRejected.stderr, /scripts\/audio-discover\.cjs.*target is a symlink/i);
      assert.equal(fs.existsSync(danglingTarget), false);
      assert.equal(fs.lstatSync(discoveryPath).isSymbolicLink(), true);
      assert.equal(read(manifestPath), manifestBefore);
    }
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("target preflight rejects a late unsafe script before refreshing an earlier managed file", { skip: process.platform === "win32" }, () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-preflight-"));
  try {
    const reference = path.join(temporaryRoot, "reference");
    const destination = path.join(temporaryRoot, "fish-project");
    makeReferenceAct(reference);
    runScaffold([destination, "--from-act", reference], temporaryRoot);
    const earlierManagedPath = path.join(destination, "scripts", "build-subs.cjs");
    const earlierManagedBefore = read(earlierManagedPath);
    const manifestPath = path.join(destination, ".hyperframes-scaffold.json");
    const manifestBefore = read(manifestPath);
    fs.writeFileSync(path.join(reference, "scripts", "build-subs.cjs"), "// reference build-subs v2\n");

    const discoveryPath = path.join(destination, "scripts", "audio-discover.cjs");
    const outsideDiscovery = path.join(temporaryRoot, "external", "audio-discover.cjs");
    fs.mkdirSync(path.dirname(outsideDiscovery));
    const outsideBytes = "// external discovery wrapper must remain untouched\n";
    fs.writeFileSync(outsideDiscovery, outsideBytes);
    fs.unlinkSync(discoveryPath);
    fs.symlinkSync(outsideDiscovery, discoveryPath);

    const rejected = rejectScaffold([destination, "--refresh-scripts"], temporaryRoot);
    assert.match(rejected.stderr, /scripts\/audio-discover\.cjs.*target is a symlink/i);
    assert.equal(read(earlierManagedPath), earlierManagedBefore);
    assert.equal(read(manifestPath), manifestBefore);
    assert.equal(read(outsideDiscovery), outsideBytes);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("manifest and package symlinks are rejected before scaffold metadata or package backfills can escape", { skip: process.platform === "win32" }, () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hf-scaffold-metadata-safety-"));
  try {
    const destination = path.join(temporaryRoot, "fish-project");
    runScaffold([destination, "--canonical"], temporaryRoot);
    const manifestPath = path.join(destination, ".hyperframes-scaffold.json");
    const outsideManifest = path.join(temporaryRoot, "outside-manifest.json");
    const outsideManifestBytes = read(manifestPath);
    fs.writeFileSync(outsideManifest, outsideManifestBytes);
    fs.unlinkSync(manifestPath);
    fs.symlinkSync(outsideManifest, manifestPath);
    const manifestRejected = rejectScaffold([destination], temporaryRoot);
    assert.match(manifestRejected.stderr, /scaffold manifest is a symlink or non-regular file/i);
    assert.equal(read(outsideManifest), outsideManifestBytes);

    fs.unlinkSync(manifestPath);
    fs.writeFileSync(manifestPath, outsideManifestBytes);
    const packagePath = path.join(destination, "package.json");
    const outsidePackage = path.join(temporaryRoot, "outside-package.json");
    const outsidePackageObject = json(packagePath);
    delete outsidePackageObject.scripts["audio:discover"];
    const outsidePackageBytes = `${JSON.stringify(outsidePackageObject, null, 2)}\n`;
    fs.writeFileSync(outsidePackage, outsidePackageBytes);
    fs.unlinkSync(packagePath);
    fs.symlinkSync(outsidePackage, packagePath);
    const packageRejected = rejectScaffold([destination], temporaryRoot);
    assert.match(packageRejected.stderr, /package\.json symlink or non-regular file/i);
    assert.equal(read(outsidePackage), outsidePackageBytes);
  } finally {
    assert.ok(path.resolve(temporaryRoot).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

function makeReferenceAct(root) {
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(root, "fonts"), { recursive: true });
  fs.mkdirSync(path.join(root, "vendor"), { recursive: true });
  fs.writeFileSync(path.join(root, "scripts", "build-subs.cjs"), "// reference build-subs v1\n");
  fs.writeFileSync(path.join(root, "scripts", "check.cjs"), "// stale reference checker\n");
  fs.writeFileSync(path.join(root, "scripts", "tts-fish.mjs"), "// reference fish v1\n");
  fs.writeFileSync(path.join(root, "scripts", "build-project.cjs"), "throw new Error('act one only');\n");
  fs.writeFileSync(path.join(root, "scripts", "boundaries.json"), "{\"totalSec\":123}\n");
  fs.writeFileSync(path.join(root, "scripts", "narration.json"), `${JSON.stringify({
    voice: {
      provider: "Fish Audio", referenceId: "reference-voice", model: "s2.1-pro-free", format: "wav", sampleRate: 48000,
      temperature: 0.7, topP: 0.7, normalize: true, chunkLength: 300, minChunkLength: 50,
      conditionOnPreviousChunks: true, maxNewTokens: 1024, repetitionPenalty: 1.2, earlyStopThreshold: 1, latency: "normal",
      prosody: { speed: 1, volume: 5, normalize_loudness: true, token: "TEST_CREDENTIAL" }, apiKey: "TEST_CREDENTIAL",
    },
    fps: 60, language: "en", sttLanguage: "english", requireSpelledOutNumbers: true,
    captionStyle: { font: "Series Sans", roles: { proof: "#00aaff" } },
    sections: [{ id: "s0", title: "Act One content", paragraphs: [{ tts: "Do not copy me.", lines: ["Do not copy me."] }] }],
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({
    name: "episode-act1", private: true, type: "module",
    engines: { node: ">=18" },
    devDependencies: { "series-tool": "1.2.3" },
    scripts: {
      tts: "node scripts/tts-fish.mjs",
      render: "npx --yes hyperframes@0.7.17 render",
      build: "node scripts/build-project.cjs",
    },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "hyperframes.json"), "{\"paths\":{\"blocks\":\"compositions\"}}\n");
  fs.writeFileSync(path.join(root, "fonts", "series.woff2"), "font-v1");
  fs.writeFileSync(path.join(root, "vendor", "gsap-3.14.2.min.js"), "// gsap-local\n");
}

function runScaffold(args, cwd) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd, encoding: "utf8", env: { ...process.env, HYPERFRAMES_SKIP_ACL: "1" },
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function rejectScaffold(args, cwd) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd, encoding: "utf8", env: { ...process.env, HYPERFRAMES_SKIP_ACL: "1" },
  });
  assert.notEqual(result.status, 0, result.stdout);
  return result;
}

function read(file) { return fs.readFileSync(file, "utf8"); }
function json(file) { return JSON.parse(read(file)); }
function sha256Text(value) { return crypto.createHash("sha256").update(value, "utf8").digest("hex"); }
