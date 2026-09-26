#!/usr/bin/env node
// Stand up a single-act HyperFrames project from the maintained skill scripts.
// A preceding sibling act can supply series-local tool/config defaults without
// leaking its narration, timings, scene map, or generated output into the new act.
//
//   node .agents/skills/hyperframes/scripts/scaffold.cjs hyperframesProjects/show/act2
//   node .agents/skills/hyperframes/scripts/scaffold.cjs hyperframesProjects/show/act2 --from-act hyperframesProjects/show/act1
//   node .agents/skills/hyperframes/scripts/scaffold.cjs hyperframesProjects/show/act2 --provider fish  # compatibility only
//   node .agents/skills/hyperframes/scripts/scaffold.cjs hyperframesProjects/show/act2 --refresh-scripts
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const SKILL = path.resolve(__dirname, "..");
const CWD = process.cwd();
const TTS_SCRIPT = "tts-fish.mjs";
const REQUIRED_PROJECT_SCRIPTS = Object.freeze({
  tts: "node scripts/tts-fish.mjs",
  "audio:discover": "node scripts/audio-discover.cjs",
  "fast:check": "node scripts/check-fast-passages.cjs",
});
const RETIRED_AUDIO_ROUTE_PARTS = new Set([
  "heygen", "elevenlabs", "kokoro", "musicgen", "lyria", "manbo",
  "minimax", "doubao", "volcengine", "suno", "udio",
]);
const RETIRED_AUDIO_ROUTE_COMPACT = [
  "edgetts", "ttsedge", "ttsmanbo", "waitbgm", "bgmpending", "ttswittgenstein",
  "musicgen", "kokoro",
];
const options = parseArgs(process.argv.slice(2));
if (options.help) usage(0);
if (!options.destination) usage(1, "A destination project directory is required.");

const PROJECT = path.resolve(CWD, options.destination);
const previousManifest = readJson(path.join(PROJECT, ".hyperframes-scaffold.json"), null);
validateDestinationBeforeWrite(PROJECT, previousManifest);
const reference = resolveReferenceAct(PROJECT, options, previousManifest);
if (reference) validatePublicVoice(readJson(path.join(reference.path, "scripts", "narration.json"), null)?.voice);
const provider = "fish";
const slug = projectSlug(PROJECT);
const previousFiles = new Map((previousManifest?.files || []).map((entry) => [entry.target, entry]));
const records = [];

const COMMON_SCRIPTS = [
  "lib/spatial-canvas.cjs",
  "lib/fast-passages.cjs",
  "concat.js", "master.cjs", "transcribe.cjs", "build-subs.cjs", "build-captions.cjs",
  "build-montage.cjs", "check.cjs", "check-spatial-canvas.cjs", "check-fast-passages.cjs",
  "audio-discover.cjs", "snap.cjs", "review-master.cjs", "gate.cjs",
  "genimg.cjs", "cutout-bg.cjs", "doctor.cjs", "setup-runtime.cjs", "public-media-api.cjs",
];
const CANONICAL_CONTRACT_SCRIPTS = new Set([
  "lib/spatial-canvas.cjs", "lib/fast-passages.cjs", "check.cjs", "check-spatial-canvas.cjs",
  "check-fast-passages.cjs", "audio-discover.cjs",
  "snap.cjs", "review-master.cjs", "gate.cjs", "tts-fish.mjs", "public-media-api.cjs",
  "transcribe.cjs", "genimg.cjs", "doctor.cjs", "setup-runtime.cjs",
]);
const ACT_SPECIFIC_EXCLUSIONS = [
  "scripts/build-project.cjs", "scripts/sync-caption-lines.cjs", "scripts/narration.json",
  "scripts/boundaries.json", "scene-plan.json", "SPATIAL_CANVAS.json", "FAST_PASSAGES.json", "index.html", "meta.json",
];

const TREE = [
  "compositions", "scripts", "fonts", "vendor", "snapshots", "review",
  "assets/voice", "assets/tts_chunks", "assets/words", "assets/subs", "assets/transcripts",
  "assets/bgm", "assets/sfx", "assets/plates", "assets/cutouts", "assets/cutouts_raw",
  "assets/substrate", "assets/clips", "assets/montage", "assets/charts",
];
preflightScaffoldPaths(reference);
for (const directory of TREE) makeDirectory(path.join(PROJECT, directory));

for (const name of [...COMMON_SCRIPTS, TTS_SCRIPT]) {
  const source = scriptSource(name, reference);
  installFile(source, `scripts/${name}`, { managed: true });
}

// Series-local fonts and browser runtimes are reusable. Missing files remain a
// deliberate manual step for a first/canonical act.
if (reference) {
  installTree(path.join(reference.path, "fonts"), "fonts", { managed: true });
  installTree(path.join(reference.path, "vendor"), "vendor", { managed: true });
}

installNarrationSeed(reference);
installSeed("templates/DESIGN.md", "DESIGN.md");
installSeed("templates/SCENE_CONTRACT.md", "SCENE_CONTRACT.md");
installSeed("templates/DIRECTION.md", "DIRECTION.md");
installSeed("templates/.env.example", ".env.example");
installSeed("templates/project.gitignore", ".gitignore");
installSeed("templates/SPATIAL_CANVAS.example.json", "SPATIAL_CANVAS.example.json");
installSeed("templates/FAST_PASSAGES.example.json", "FAST_PASSAGES.example.json");
installSeed("templates/scene.skeleton.html", "compositions/s0-hook.html");
installIndexSeed();
installProjectConfig(reference, slug);
installPromptLedger();

if (!options.dryRun) {
  const manifest = {
    schemaVersion: 2,
    ...(!previousManifest
      ? { ambitionContractVersion: 2 }
      : Object.prototype.hasOwnProperty.call(previousManifest, "ambitionContractVersion")
        ? { ambitionContractVersion: previousManifest.ambitionContractVersion }
        : {}),
    provider,
    referenceAct: reference ? portablePath(reference.path) : null,
    referenceActRelativeToProject: reference ? portableRelative(path.relative(PROJECT, reference.path)) : null,
    referenceMode: reference?.mode || "canonical",
    files: records.sort((a, b) => a.target.localeCompare(b.target)),
    intentionallyNotInherited: ACT_SPECIFIC_EXCLUSIONS,
  };
  const manifestPath = path.join(PROJECT, ".hyperframes-scaffold.json");
  assertSafeFileTarget(manifestPath, ".hyperframes-scaffold.json");
  writeTextAtomic(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  grantCurrentUser(manifestPath);
  for (const directory of ["scripts", "compositions", "assets", "snapshots", "review", "fonts", "vendor"]) {
    grantCurrentUser(path.join(PROJECT, directory), true);
  }
  for (const file of ["DESIGN.md", "SCENE_CONTRACT.md", "DIRECTION.md", "SPATIAL_CANVAS.example.json", "FAST_PASSAGES.example.json", "index.html", "package.json", "hyperframes.json", "meta.json"]) {
    grantCurrentUser(path.join(PROJECT, file));
  }
}

const diverged = records.filter((entry) => entry.managed && !entry.inSync);
console.log(`\n✓ ${options.dryRun ? "planned" : "scaffolded"} ${options.destination}`);
console.log("  TTS: Fish Audio (the bundled TTS adapter)");
console.log(`  tool source: ${reference ? `${portablePath(reference.path)} (${reference.mode})` : "canonical skill"}`);
if (diverged.length) console.log(`  protected local edits: ${diverged.map((entry) => entry.target).join(", ")}`);
console.log("  act-specific files intentionally excluded: build-project.cjs, narration/timings, scene/canvas/fast plans, index, metadata");
console.log(`next:
  1. Replace the placeholder sections in scripts/narration.json with this act's normalized spoken copy and authoritative caption lines.
  2. Fill the Spatial Canvas, fast-passage, BGM, and SFX PASS/USE admissions in DESIGN.md; create optional manifests only for features marked USE.
  3. Discover candidate music/SFX with npm run audio:discover, audition and explicitly freeze selected files, then record exact cues and rights in DESIGN.md.
  4. Author SCENE_CONTRACT.md, DIRECTION.md, scenes, and project builder/config; never reuse another act's scene map unchanged.
  5. Confirm fonts/vendor are present, configure Fish per /fish-audio-api without copying credentials into the project, then run the audio chain in references/pipeline.md.`);

function parseArgs(argv) {
  const parsed = {
    destination: null, fromAct: null, provider: null, canonical: false,
    refreshScripts: false, forceRefreshScripts: false, dryRun: false, help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--canonical") parsed.canonical = true;
    else if (arg === "--refresh-scripts") parsed.refreshScripts = true;
    else if (arg === "--force-refresh-scripts") { parsed.refreshScripts = true; parsed.forceRefreshScripts = true; }
    else if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--from-act") parsed.fromAct = requireValue(argv, ++i, "--from-act");
    else if (arg.startsWith("--from-act=")) parsed.fromAct = arg.slice("--from-act=".length);
    else if (arg === "--provider") parsed.provider = requireValue(argv, ++i, "--provider");
    else if (arg.startsWith("--provider=")) parsed.provider = arg.slice("--provider=".length);
    else if (arg.startsWith("-")) usage(1, `Unknown option: ${arg}`);
    else if (!parsed.destination) parsed.destination = arg;
    else usage(1, `Unexpected argument: ${arg}`);
  }
  if (parsed.canonical && parsed.fromAct) usage(1, "--canonical and --from-act cannot be used together.");
  if (parsed.provider && parsed.provider !== "fish") usage(1, "--provider only accepts fish; this scaffold supplies the Fish Audio adapter.");
  return parsed;
}

function requireValue(argv, index, option) {
  const value = argv[index];
  if (!value || value.startsWith("-")) usage(1, `${option} requires a value.`);
  return value;
}

function validateDestinationBeforeWrite(destination, manifest) {
  if (!fs.existsSync(destination)) return;
  const destinationStat = fs.lstatSync(destination);
  if (destinationStat.isSymbolicLink() || !destinationStat.isDirectory()) {
    usage(1, `Destination is a symlink or not a directory: ${destination}`);
  }

  const entries = fs.readdirSync(destination)
    .filter((entry) => ![".DS_Store", ".gitkeep", "Thumbs.db"].includes(entry));
  if (!entries.length) return;

  const manifestPath = path.join(destination, ".hyperframes-scaffold.json");
  const manifestStat = lstatOrNull(manifestPath);
  if (manifestStat && (manifestStat.isSymbolicLink() || !manifestStat.isFile())) {
    usage(1, "Refusing to scaffold a destination whose Fish scaffold manifest is a symlink or non-regular file.");
  }
  if (!manifestStat || !manifest) {
    usage(1, "Refusing to scaffold a populated destination without a valid Fish scaffold manifest. Automatic provider migration is unsafe; use a fresh destination or migrate narration, package scripts, helpers, and generated TTS state together before scaffolding.");
  }
  if (String(manifest.provider || "").toLowerCase() !== "fish") {
    usage(1, `Refusing to relabel a populated ${manifest.provider || "legacy"} project as Fish. Automatic provider migration is unsafe; use a fresh destination or complete an explicit atomic migration first.`);
  }
  const structurallyValidManifest = manifest.schemaVersion === 2
    && Array.isArray(manifest.files)
    && manifest.files.length > 0
    && (!Object.prototype.hasOwnProperty.call(manifest, "ambitionContractVersion")
      || (Number.isInteger(manifest.ambitionContractVersion) && manifest.ambitionContractVersion >= 1))
    && manifest.files.every((entry) => entry && typeof entry.target === "string"
      && typeof entry.source === "string" && typeof entry.managed === "boolean");
  if (!structurallyValidManifest) {
    usage(1, "Refusing to scaffold a populated destination whose Fish manifest is stale or structurally invalid. Use a fresh destination or repair the migration atomically before scaffolding.");
  }

  const scriptsDirectory = path.join(destination, "scripts");
  let scriptsStat = null;
  try { scriptsStat = fs.lstatSync(scriptsDirectory); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (scriptsStat && (!scriptsStat.isDirectory() || scriptsStat.isSymbolicLink())) {
    usage(1, "Refusing to update a project whose scripts path is a symlink or non-directory. Restore a real project-local scripts directory before scaffolding.");
  }

  const retiredHelpers = findRetiredAudioHelpers(scriptsDirectory);
  if (retiredHelpers.length) {
    usage(1, `Refusing to update a project that still contains retired TTS helpers or local music generators: ${retiredHelpers.join(", ")}. Remove the legacy route as part of an explicit migration first.`);
  }

  const installedTts = path.join(destination, "scripts", TTS_SCRIPT);
  let installedStat = null;
  try { installedStat = fs.lstatSync(installedTts); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (installedStat) {
    if (!installedStat.isFile() || installedStat.isSymbolicLink()) {
      usage(1, `Refusing to update non-regular scripts/${TTS_SCRIPT}. Remove the symlink or special filesystem entry inside the project before restoring the canonical helper.`);
    }
    const canonicalTts = path.join(SKILL, "scripts", TTS_SCRIPT);
    const installedHash = sha256(installedTts);
    const canonicalHash = sha256(canonicalTts);
    if (installedHash !== canonicalHash) {
      const managedRecord = manifest.files.find((entry) => entry.target === `scripts/${TTS_SCRIPT}`);
      const safeRefresh = options.refreshScripts
        && managedRecord?.managed === true
        && /^[a-f0-9]{64}$/i.test(String(managedRecord.managedSha256 || ""))
        && installedHash === managedRecord.managedSha256;
      if (!safeRefresh && !options.forceRefreshScripts) {
        usage(1, `Refusing to preserve a noncanonical scripts/${TTS_SCRIPT} in a Fish scaffold. No files were changed. Review the local replacement, then use --force-refresh-scripts to restore the audited canonical helper.`);
      }
    }
  }

  const narrationPath = path.join(destination, "scripts", "narration.json");
  const narrationStat = lstatOrNull(narrationPath);
  if (narrationStat && (narrationStat.isSymbolicLink() || !narrationStat.isFile())) {
    usage(1, `Refusing to update non-regular scripts/narration.json. Restore a regular project-local narration file before scaffolding.`);
  }
  if (narrationStat) {
    const narration = readJson(narrationPath, null);
    if (!narration) usage(1, `Refusing to update a populated Fish project with invalid narration JSON: ${narrationPath}`);
    if (!isFishVoice(narration.voice)) {
      usage(1, "Refusing to relabel a populated project whose narration is not configured for Fish Audio. Migrate narration, package scripts, helpers, and generated TTS state together before scaffolding.");
    }
    validatePublicVoice(narration.voice);
  }

  const packagePath = path.join(destination, "package.json");
  const packageStat = lstatOrNull(packagePath);
  if (packageStat && (packageStat.isSymbolicLink() || !packageStat.isFile())) {
    usage(1, "Refusing to update a package.json symlink or non-regular file. Restore a regular project-local package.json before scaffolding.");
  }
  if (packageStat) {
    const pkg = readJson(packagePath, null);
    if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) {
      usage(1, `Refusing to update a populated Fish project whose package JSON root is not an object: ${packagePath}`);
    }
    const ttsCommand = pkg.scripts?.tts;
    if (ttsCommand != null && String(ttsCommand).trim() !== "node scripts/tts-fish.mjs") {
      usage(1, "Refusing to relabel a populated project whose package tts command is not the canonical Fish entry point. Complete an explicit atomic migration first.");
    }
    validateRequiredProjectScripts(pkg);
    validateNoRetiredPackageRoutes(pkg);
  }
}

function isFishVoice(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const provider = String(value.provider || "").trim().toLowerCase().replace(/\s+/g, " ");
  return ["fish", "fish audio", "fish audio raw api"].includes(provider);
}

function validatePublicVoice(voice) {
  if (!isFishVoice(voice)) return;
  if ((voice.transport && voice.transport !== "official-api") || voice.backend || voice.sampler
      || (voice.apiUrl && voice.apiUrl !== "https://api.fish.audio/v1/tts")) {
    usage(1, "This public scaffold supports Fish official-api profiles. The reference/destination uses a legacy proxy or website profile. No files were changed. Use --canonical with a new destination, or explicitly migrate the profile and generated audio state first; website cookies are not API keys.");
  }
}

function resolveReferenceAct(destination, parsed, manifest) {
  if (parsed.canonical) return null;
  if (parsed.fromAct) {
    const explicit = path.resolve(CWD, parsed.fromAct);
    validateReference(explicit, destination, "explicit");
    return { path: explicit, mode: "explicit" };
  }
  if (manifest) {
    if (!manifest.referenceAct && !manifest.referenceActRelativeToProject) return null;
    const recorded = manifest.referenceActRelativeToProject
      ? path.resolve(destination, manifest.referenceActRelativeToProject)
      : path.resolve(CWD, manifest.referenceAct);
    if (!fs.existsSync(recorded)) {
      usage(1, `The scaffold manifest's pinned reference act is missing: ${recorded}. Choose a replacement with --from-act or opt into canonical scripts with --canonical.`);
    }
    validateReference(recorded, destination, "manifest");
    return { path: recorded, mode: manifest.referenceMode || "manifest-pinned" };
  }
  const match = path.basename(destination).match(/^act(\d+)(?:[-_].*)?$/i);
  if (!match || Number(match[1]) < 2) return null;
  const targetNumber = Number(match[1]);
  const parent = path.dirname(destination);
  if (!fs.existsSync(parent)) return null;
  const candidates = fs.readdirSync(parent, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ entry, match: entry.name.match(/^act(\d+)(?:[-_].*)?$/i) }))
    .filter(({ match: found }) => found && Number(found[1]) < targetNumber)
    .sort((a, b) => Number(b.match[1]) - Number(a.match[1]));
  for (const candidate of candidates) {
    const found = path.join(parent, candidate.entry.name);
    if (fs.existsSync(path.join(found, "scripts"))) return { path: found, mode: "auto-previous-act" };
  }
  return null;
}

function validateReference(referencePath, destination, mode) {
  if (path.resolve(referencePath) === path.resolve(destination)) usage(1, "The reference act cannot be the destination.");
  if (!fs.existsSync(referencePath) || !fs.statSync(referencePath).isDirectory()) usage(1, `Reference act does not exist: ${referencePath}`);
  if (!fs.existsSync(path.join(referencePath, "scripts"))) usage(1, `Reference act has no scripts directory: ${referencePath}`);
  if (mode === "explicit" && (isInside(destination, referencePath) || isInside(referencePath, destination))) {
    usage(1, "The destination and reference act must not contain one another.");
  }
}

function scriptSource(name, referenceAct) {
  if (name === "public-media-api.cjs") {
    const adapter = path.join(SKILL, "..", "fish-audio-api", "scripts", name);
    if (!fs.existsSync(adapter)) throw new Error("Install the companion fish-audio-api skill; the public adapter is required by this scaffold. Install this collection with --skill '*'.");
    return adapter;
  }
  const local = !CANONICAL_CONTRACT_SCRIPTS.has(name) && referenceAct && path.join(referenceAct.path, "scripts", name);
  if (local && fs.existsSync(local)) return local;
  const canonical = path.join(SKILL, "scripts", name);
  if (!fs.existsSync(canonical)) throw new Error(`Missing canonical ${name}`);
  return canonical;
}

function installFile(source, targetRelative, settings = {}) {
  const target = path.join(PROJECT, targetRelative);
  assertSafeFileTarget(target, targetRelative);
  const sourceHash = sha256(source);
  const exists = Boolean(lstatOrNull(target));
  const currentHash = exists ? sha256(target) : null;
  const prior = previousFiles.get(portableRelative(targetRelative));
  let action = "current";
  let managedHash = prior?.managed === true && /^[a-f0-9]{64}$/i.test(String(prior.managedSha256 || ""))
    ? prior.managedSha256
    : null;

  if (!exists) {
    action = "installed";
    if (!options.dryRun) {
      makeDirectory(path.dirname(target));
      copyFileAtomic(source, target);
      grantCurrentUser(target);
    }
    if (settings.managed) managedHash = sourceHash;
  } else if (currentHash === sourceHash) {
    if (settings.managed) managedHash = sourceHash;
  } else if (settings.managed && options.refreshScripts) {
    const safeToRefresh = Boolean(managedHash && currentHash === managedHash);
    if (safeToRefresh || options.forceRefreshScripts) {
      action = options.forceRefreshScripts && !safeToRefresh ? "force-refreshed" : "refreshed";
      if (!options.dryRun) copyFileAtomic(source, target);
      managedHash = sourceHash;
    } else {
      action = "kept-customized";
    }
  } else {
    action = settings.managed ? "kept" : "kept-seed";
  }

  const targetHash = options.dryRun
    ? (action === "installed" || action.endsWith("refreshed") ? sourceHash : currentHash)
    : sha256(target);
  records.push({
    target: portableRelative(targetRelative), source: portablePath(source), action,
    managed: Boolean(settings.managed), managedSha256: settings.managed ? managedHash : null,
    sourceSha256: sourceHash, targetSha256: targetHash, inSync: sourceHash === targetHash,
  });
  console.log(`  ${symbol(action)} ${targetRelative}  [${action}; ${displaySource(source, reference)}]`);
}

function installText(text, targetRelative, sourceLabel, settings = {}) {
  const target = path.join(PROJECT, targetRelative);
  assertSafeFileTarget(target, targetRelative);
  const sourceHash = sha256Text(text);
  if (!lstatOrNull(target)) {
    if (!options.dryRun) {
      makeDirectory(path.dirname(target));
      writeTextAtomic(target, text);
      grantCurrentUser(target);
    }
    records.push({
      target: portableRelative(targetRelative), source: sourceLabel, action: "installed",
      managed: Boolean(settings.managed), managedSha256: settings.managed ? sourceHash : null,
      sourceSha256: sourceHash, targetSha256: sourceHash, inSync: true,
    });
    console.log(`  + ${targetRelative}  [installed; ${sourceLabel}]`);
    return;
  }
  const targetHash = sha256(target);
  records.push({
    target: portableRelative(targetRelative), source: sourceLabel, action: "kept-seed",
    managed: false, managedSha256: null, sourceSha256: sourceHash, targetSha256: targetHash,
    inSync: sourceHash === targetHash,
  });
  console.log(`  = ${targetRelative}  [kept-seed]`);
}

function installTree(sourceRoot, targetRoot, settings) {
  for (const entry of enumerateTreeFiles(sourceRoot, targetRoot)) {
    installFile(entry.source, entry.targetRelative, settings);
  }
}

function installSeed(sourceRelative, targetRelative) {
  installFile(path.join(SKILL, sourceRelative), targetRelative, { managed: false });
}

function installNarrationSeed(referenceAct) {
  const canonicalPath = path.join(SKILL, "templates", "narration.example.json");
  if (!referenceAct) {
    installFile(canonicalPath, "scripts/narration.json", { managed: false });
    return;
  }

  const sourcePath = path.join(referenceAct.path, "scripts", "narration.json");
  const source = readJson(sourcePath, null);
  if (!source) {
    installNarrationSeed(null);
    return;
  }
  const seed = readJson(canonicalPath, null);
  if (!seed) throw new Error(`Invalid canonical narration template: ${canonicalPath}`);
  for (const key of ["fps", "language", "sttLanguage", "captionStyle", "requireSpelledOutNumbers", "numberWords"]) {
    if (Object.prototype.hasOwnProperty.call(source, key)) seed[key] = source[key];
  }
  const inheritedVoice = sanitizeFishVoice(source.voice);
  if (inheritedVoice) {
    seed.voice = {
      ...inheritedVoice,
      prosody: inheritedVoice.prosody === null ? null : { ...(inheritedVoice.prosody || {}) },
    };
  }
  seed.note = `Fish Audio and reusable non-secret voice/caption settings inherited from ${path.basename(referenceAct.path)}. See fish-audio-api/SKILL.md. The official-api adapter reads credentials from the untracked project .env or environment. Replace the placeholder section; do not copy another act's narration or timing data.`;
  seed.ttsSubs = [];
  seed.folds = [];
  seed.emphasis = [];
  seed.sections = placeholderSections();
  installText(`${JSON.stringify(seed, null, 2)}\n`, "scripts/narration.json", `derived:${portablePath(sourcePath)}`);
}

function sanitizeFishVoice(value) {
  if (!isFishVoice(value)) return null;
  const allowed = [
    "provider", "transport", "referenceId", "model", "format", "temperature", "topP", "normalize",
    "sampleRate", "chunkLength", "minChunkLength", "conditionOnPreviousChunks", "maxNewTokens",
    "repetitionPenalty", "earlyStopThreshold", "latency", "prosody", "requireSpelledOutNumbers",
  ];
  const clean = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(value, key)) clean[key] = value[key];
  }
  if (clean.prosody && typeof clean.prosody === "object" && !Array.isArray(clean.prosody)) {
    clean.prosody = Object.fromEntries(
      ["speed", "volume", "normalize_loudness"]
        .filter((key) => Object.prototype.hasOwnProperty.call(clean.prosody, key))
        .map((key) => [key, clean.prosody[key]]),
    );
  }
  clean.transport = "official-api";
  clean.provider = "Fish Audio";
  return clean;
}

function placeholderSections() {
  return [{
    id: "s0", title: "Opening beat",
    paragraphs: [{ tts: "Replace with normalized spoken text.", lines: ["Replace with an authoritative caption line."] }],
  }];
}

function installIndexSeed() {
  const source = path.join(SKILL, "templates", "index.skeleton.html");
  let text = fs.readFileSync(source, "utf8");
  const localGsap = path.join(PROJECT, "vendor", "gsap-3.14.2.min.js");
  if (fs.existsSync(localGsap) || (options.dryRun && reference && fs.existsSync(path.join(reference.path, "vendor", "gsap-3.14.2.min.js")))) {
    text = text.replace("https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js", "vendor/gsap-3.14.2.min.js");
  }
  installText(text, "index.html", portablePath(source));
}

function installProjectConfig(referenceAct, projectName) {
  const canonicalPackage = readJson(path.join(SKILL, "templates", "package.json"), {});
  const sourcePackagePath = referenceAct && path.join(referenceAct.path, "package.json");
  const sourcePackage = sourcePackagePath && fs.existsSync(sourcePackagePath) ? readJson(sourcePackagePath, {}) : {};
  const pkg = { ...canonicalPackage };
  for (const key of ["packageManager", "dependencies", "devDependencies", "optionalDependencies", "overrides", "resolutions"]) {
    if (Object.prototype.hasOwnProperty.call(sourcePackage, key)) pkg[key] = sourcePackage[key];
  }
  pkg.dependencies = { ...(canonicalPackage.dependencies || {}), ...(sourcePackage.dependencies || {}) };
  pkg.name = projectName;
  pkg.private = true;
  pkg.type = "module";
  pkg.engines = { ...(sourcePackage.engines || {}), node: ">=22.20.0" };
  pkg.scripts = { ...(canonicalPackage.scripts || {}) };
  pkg.scripts.tts = `node scripts/${TTS_SCRIPT}`;
  pkg.scripts.audio = "node scripts/concat.js && node scripts/master.cjs assets/voice/narration.wav";
  Object.assign(pkg.scripts, REQUIRED_PROJECT_SCRIPTS);
  pkg.scripts.render = ensureFps(pkg.scripts.render || "npx --yes hyperframes@0.7.17 render", 60);
  installPackageConfig(pkg, sourcePackagePath && fs.existsSync(sourcePackagePath) ? `derived:${portablePath(sourcePackagePath)}` : "templates/package.json");

  const sourceHyperframes = referenceAct && path.join(referenceAct.path, "hyperframes.json");
  installFile(sourceHyperframes && fs.existsSync(sourceHyperframes) ? sourceHyperframes : path.join(SKILL, "templates", "hyperframes.json"), "hyperframes.json", { managed: false });

  const meta = { id: projectName, name: projectName, createdAt: new Date().toISOString() };
  installText(`${JSON.stringify(meta, null, 2)}\n`, "meta.json", "generated:project-identity");
}

function ensureFps(command, fps) {
  return /(?:^|\s)--fps(?:=|\s)/.test(command) ? command : `${command} --fps ${fps}`;
}

function installPackageConfig(generatedPackage, sourceLabel) {
  const targetRelative = "package.json";
  const target = path.join(PROJECT, targetRelative);
  assertSafeFileTarget(target, targetRelative);
  if (!lstatOrNull(target)) {
    installText(`${JSON.stringify(generatedPackage, null, 2)}\n`, targetRelative, sourceLabel);
    return;
  }

  const existing = readJson(target, null);
  if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
    usage(1, `Refusing to update invalid package JSON: ${target}`);
  }
  validateRequiredProjectScripts(existing);
  validateNoRetiredPackageRoutes(existing);
  const required = REQUIRED_PROJECT_SCRIPTS;
  const scripts = { ...(existing.scripts || {}) };
  const added = [];
  for (const [name, command] of Object.entries(required)) {
    if (!Object.prototype.hasOwnProperty.call(scripts, name)) {
      scripts[name] = command;
      added.push(name);
    }
  }
  if (!added.length) {
    installText(`${JSON.stringify(generatedPackage, null, 2)}\n`, targetRelative, sourceLabel);
    return;
  }

  const updatedText = `${JSON.stringify({ ...existing, scripts }, null, 2)}\n`;
  const sourceText = `${JSON.stringify(generatedPackage, null, 2)}\n`;
  if (!options.dryRun) writeTextAtomic(target, updatedText);
  const targetHash = options.dryRun ? sha256Text(updatedText) : sha256(target);
  records.push({
    target: targetRelative, source: sourceLabel, action: "backfilled-scripts",
    managed: false, managedSha256: null, sourceSha256: sha256Text(sourceText),
    targetSha256: targetHash, inSync: sha256Text(sourceText) === targetHash,
  });
  console.log(`  + ${targetRelative}  [backfilled ${added.join(", ")}; ${sourceLabel}]`);
}

function installPromptLedger() {
  installText(`# Asset Generation Prompts — ${path.basename(PROJECT)}\n\nSave every generation prompt here under a per-asset heading (file, dimensions, purpose, and provenance).\n`, "assets/PROMPTS.md", "generated:prompt-ledger");
}

function projectSlug(projectPath) {
  const parts = path.resolve(projectPath).split(path.sep);
  const projectIndex = parts.findIndex((part) => part.toLowerCase() === "hyperframesprojects");
  const selected = projectIndex >= 0 ? parts.slice(projectIndex + 1) : [path.basename(projectPath)];
  return selected.join("-").toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "hyperframes-project";
}

function makeDirectory(directory) {
  if (options.dryRun) return;
  assertSafeDirectoryTarget(directory);
  fs.mkdirSync(directory, { recursive: true });
}

function preflightScaffoldPaths(referenceAct) {
  for (const directory of TREE) assertSafeDirectoryTarget(path.join(PROJECT, directory), directory);

  const targets = [
    ...[...COMMON_SCRIPTS, TTS_SCRIPT].map((name) => `scripts/${name}`),
    "scripts/narration.json",
    "DESIGN.md", "SCENE_CONTRACT.md", "DIRECTION.md",
    "SPATIAL_CANVAS.example.json", "FAST_PASSAGES.example.json",
    "compositions/s0-hook.html", "index.html", "package.json", "hyperframes.json", "meta.json",
    "assets/PROMPTS.md", ".hyperframes-scaffold.json", ".env.example", ".gitignore",
  ];
  if (referenceAct) {
    for (const entry of enumerateTreeFiles(path.join(referenceAct.path, "fonts"), "fonts")) targets.push(entry.targetRelative);
    for (const entry of enumerateTreeFiles(path.join(referenceAct.path, "vendor"), "vendor")) targets.push(entry.targetRelative);
  }
  for (const targetRelative of new Set(targets.map(portableRelative))) {
    assertSafeFileTarget(path.join(PROJECT, targetRelative), targetRelative);
  }
}

function enumerateTreeFiles(sourceRoot, targetRoot) {
  if (!fs.existsSync(sourceRoot)) return [];
  const files = [];
  const walk = (directory, relative = "") => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const source = path.join(directory, entry.name);
      const childRelative = path.join(relative, entry.name);
      if (entry.isDirectory()) walk(source, childRelative);
      else if (entry.isFile()) files.push({ source, targetRelative: path.join(targetRoot, childRelative) });
    }
  };
  walk(sourceRoot);
  return files;
}

function validateRequiredProjectScripts(pkg) {
  if (pkg.scripts != null && (typeof pkg.scripts !== "object" || Array.isArray(pkg.scripts))) {
    usage(1, "Refusing to backfill package commands because package.json scripts is not an object.");
  }
  for (const [name, requiredCommand] of Object.entries(REQUIRED_PROJECT_SCRIPTS)) {
    if (!Object.prototype.hasOwnProperty.call(pkg.scripts || {}, name)) continue;
    const installedCommand = pkg.scripts[name];
    if (typeof installedCommand !== "string" || installedCommand.trim() !== requiredCommand) {
      usage(1, `Refusing to preserve conflicting package script ${name}. Expected \"${requiredCommand}\"; rename the custom command before rerunning the scaffold.`);
    }
  }
}

function findRetiredAudioHelpers(scriptsRoot) {
  if (!lstatOrNull(scriptsRoot)?.isDirectory()) return [];
  const found = [];
  const walk = (directory, relative = "") => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const childRelative = path.join(relative, entry.name);
      const absolute = path.join(directory, entry.name);
      if (isRetiredAudioRouteName(entry.name)) found.push(portableRelative(childRelative));
      const stat = lstatOrNull(absolute);
      if (stat?.isDirectory() && !stat.isSymbolicLink()) walk(absolute, childRelative);
    }
  };
  walk(scriptsRoot);
  return [...new Set(found)].sort();
}

function validateNoRetiredPackageRoutes(pkg) {
  const found = [];
  for (const [name, command] of Object.entries(pkg.scripts || {})) {
    if (isRetiredAudioRouteName(`${name} ${typeof command === "string" ? command : ""}`)) {
      found.push(`scripts.${name}`);
    }
  }
  for (const section of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies", "overrides", "resolutions"]) {
    collectRetiredPackageNames(pkg[section], section, found);
  }
  if (found.length) {
    usage(1, `Refusing to preserve retired local voice/music package routes: ${[...new Set(found)].sort().join(", ")}. Remove them before rerunning the Fish-only scaffold.`);
  }
}

function collectRetiredPackageNames(value, location, found) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  for (const [name, nested] of Object.entries(value)) {
    const childLocation = `${location}.${name}`;
    if (isRetiredAudioRouteName(name)) found.push(childLocation);
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      collectRetiredPackageNames(nested, childLocation, found);
    }
  }
}

function isRetiredAudioRouteName(value) {
  const lower = String(value || "").toLowerCase();
  const parts = lower.split(/[^a-z0-9]+/).filter(Boolean);
  if (parts.some((part) => RETIRED_AUDIO_ROUTE_PARTS.has(part))) return true;
  const compact = parts.join("");
  return RETIRED_AUDIO_ROUTE_COMPACT.some((token) => compact.includes(token));
}

function assertSafeFileTarget(target, targetLabel = path.relative(PROJECT, target)) {
  assertSafeProjectPath(target, "file", targetLabel);
}

function assertSafeDirectoryTarget(target, targetLabel = path.relative(PROJECT, target)) {
  assertSafeProjectPath(target, "directory", targetLabel);
}

function assertSafeProjectPath(target, leafKind, targetLabel) {
  const absolute = path.resolve(target);
  const relative = path.relative(PROJECT, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    usage(1, `Refusing to write outside the project: ${targetLabel}`);
  }

  const segments = relative ? relative.split(path.sep).filter(Boolean) : [];
  let current = PROJECT;
  const paths = [PROJECT];
  for (const segment of segments) {
    current = path.join(current, segment);
    paths.push(current);
  }

  for (let index = 0; index < paths.length; index++) {
    const candidate = paths[index];
    const stat = lstatOrNull(candidate);
    if (!stat) return;
    const leaf = index === paths.length - 1;
    if (stat.isSymbolicLink()) {
      const location = leaf ? "target" : `ancestor ${portableRelative(path.relative(PROJECT, candidate) || ".")}`;
      usage(1, `Refusing to update ${portableRelative(targetLabel)} because its ${location} is a symlink.`);
    }
    if (leaf && leafKind === "file" && !stat.isFile()) {
      usage(1, `Refusing to update ${portableRelative(targetLabel)} because its target is not a regular file.`);
    }
    if ((!leaf || leafKind === "directory") && !stat.isDirectory()) {
      const location = leaf ? "target" : `ancestor ${portableRelative(path.relative(PROJECT, candidate) || ".")}`;
      usage(1, `Refusing to update ${portableRelative(targetLabel)} because its ${location} is not a directory.`);
    }
  }
}

function lstatOrNull(target) {
  try { return fs.lstatSync(target); }
  catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return null;
    throw error;
  }
}

function copyFileAtomic(source, target) {
  assertSafeFileTarget(target);
  const temporary = atomicSibling(target);
  try {
    fs.copyFileSync(source, temporary, fs.constants.COPYFILE_EXCL);
    fs.renameSync(temporary, target);
  } finally {
    try { fs.unlinkSync(temporary); } catch (error) { if (error.code !== "ENOENT") throw error; }
  }
}

function writeTextAtomic(target, text) {
  assertSafeFileTarget(target);
  const temporary = atomicSibling(target);
  try {
    fs.writeFileSync(temporary, text, { encoding: "utf8", flag: "wx" });
    fs.renameSync(temporary, target);
  } finally {
    try { fs.unlinkSync(temporary); } catch (error) { if (error.code !== "ENOENT") throw error; }
  }
}

function atomicSibling(target) {
  const token = crypto.randomBytes(8).toString("hex");
  return path.join(path.dirname(target), `.${path.basename(target)}.scaffold-${process.pid}-${token}.tmp`);
}

function grantCurrentUser(target, recursive = false) {
  if (options.dryRun || process.env.HYPERFRAMES_SKIP_ACL === "1" || process.platform !== "win32" || !fs.existsSync(target)) return;
  const user = process.env.USERNAME;
  const domain = process.env.USERDOMAIN;
  if (!user || !domain) return;
  const account = `${domain}\\${user}`;
  const grant = recursive ? `${account}:(OI)(CI)(M)` : `${account}:(M)`;
  const args = recursive ? [target, "/grant", grant, "/T"] : [target, "/grant", grant];
  try { execFileSync("icacls", args, { stdio: "ignore" }); } catch {}
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function sha256Text(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function portableRelative(value) { return String(value).split(path.sep).join("/"); }
function portablePath(value) {
  const absolute = path.resolve(value);
  const relative = path.relative(CWD, absolute);
  return portableRelative(relative && !relative.startsWith("..") ? relative : absolute);
}
function displaySource(source, referenceAct) {
  if (referenceAct && isInside(source, referenceAct.path)) return `reference:${path.relative(referenceAct.path, source)}`;
  if (isInside(source, SKILL)) return `canonical:${path.relative(SKILL, source)}`;
  return portablePath(source);
}
function isInside(candidate, parent) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
function symbol(action) {
  if (action === "installed") return "+";
  if (action.includes("refreshed")) return "↑";
  if (action === "kept-customized") return "!";
  return "=";
}

function usage(code, message) {
  if (message) console.error(`scaffold: ${message}\n`);
  console.log(`usage: node scaffold.cjs <projectDir> [options]

options:
  --from-act <dir>          inherit reusable scripts/config/runtime from this act
  --canonical               disable automatic previous-act discovery
  --provider fish          accepted for backward-compatible invocations; Fish is always used
  --refresh-scripts         update only manifest-managed, unmodified scripts
  --force-refresh-scripts   overwrite managed scripts even when locally modified
  --dry-run                 show the source/action plan without writing

For destinations named act2, act3, and so on, the nearest preceding sibling act
is selected automatically. Act-specific builders, narration, timings, scene maps,
index files, and metadata are never inherited.`);
  process.exit(code);
}
