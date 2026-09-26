"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const CHECKER = path.resolve(__dirname, "..", "check-fast-passages.cjs");
const LIB = path.resolve(__dirname, "..", "lib", "fast-passages.cjs");
const TEMPLATE = path.resolve(__dirname, "..", "..", "templates", "FAST_PASSAGES.example.json");
const {
  checkFastPassages,
  parseFastAdmission,
  sha256File,
  syncClockHashes,
  validateFastManifest,
} = require(LIB);

test("legacy absence skips, while contract-v2 and --strict require a filled admission", () => {
  withProject((root) => {
    write(root, "index.html", '<div data-composition-id="main" data-duration="8"></div>\n');
    const legacy = checkFastPassages({ root });
    assert.equal(legacy.ok, true);
    assert.equal(legacy.skipped, true);
    assert.match(legacy.warnings.join("\n"), /legacy project/);

    const strict = checkFastPassages({ root, strict: true });
    assert.equal(strict.ok, false);
    assert.match(strict.errors.join("\n"), /needs a Fast-paced passage admission section/);

    writeJson(root, ".hyperframes-scaffold.json", scaffoldMeta(2));
    const versioned = checkFastPassages({ root });
    assert.equal(versioned.ok, false);
    assert.equal(versioned.strict, true);
  });
});

test("a recognized pre-v2 scaffold remains legacy-compatible", () => {
  withProject((root) => {
    write(root, "index.html", '<div data-composition-id="main" data-duration="8"></div>\n');
    writeJson(root, ".hyperframes-scaffold.json", scaffoldMeta());
    const result = run(root);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(result.json.skipped, true);
    assert.equal(result.json.strict, false);
  });
});

test("project root must be an existing real directory before legacy-skip evaluation", { skip: process.platform === "win32" }, () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "hf-fast-root-contract-"));
  try {
    const missing = run(path.join(parent, "missing-project"));
    assert.equal(missing.status, 1);
    assert.match(missing.json.errors.join("\n"), /project root does not exist/i);

    const fileRoot = path.join(parent, "project-file");
    fs.writeFileSync(fileRoot, "not a directory\n");
    const file = run(fileRoot);
    assert.equal(file.status, 1);
    assert.match(file.json.errors.join("\n"), /project root must be an existing real directory/i);

    const realRoot = path.join(parent, "real-project");
    const linkedRoot = path.join(parent, "linked-project");
    fs.mkdirSync(realRoot);
    fs.symlinkSync(realRoot, linkedRoot);
    const linked = run(linkedRoot);
    assert.equal(linked.status, 1);
    assert.match(linked.json.errors.join("\n"), /project root.*not a symlink/i);
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});

test("legacy compatibility does not excuse an explicitly malformed admission", () => {
  withProject((root) => {
    write(root, "DESIGN.md", "## Fast-paced passage admission\n\n**Decision:** PASS / USE. **Why:** <choose later>\n");
    const result = run(root);
    assert.equal(result.status, 1);
    assert.equal(result.json.skipped, false);
    assert.match(result.json.errors.join("\n"), /both template options|concrete.*rationale/i);
  });
});

test("corrupt scaffold metadata fails closed instead of downgrading the admission contract", () => {
  withProject((root) => {
    write(root, "index.html", '<div data-composition-id="main" data-duration="8"></div>\n');
    write(root, "DESIGN.md", design("PASS", "Ordinary pacing keeps the causal explanation readable and leaves room for its landing."));
    write(root, ".hyperframes-scaffold.json", "{not-json\n");
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /scaffold\.json is unreadable or invalid/i);
  });
});

test("empty or truncated scaffold metadata fails closed instead of impersonating legacy", () => {
  for (const metadata of [
    {},
    { schemaVersion: 2, provider: "fish" },
    { ...scaffoldMeta(), provider: "unrecognized-provider" },
  ]) {
    withProject((root) => {
      write(root, "index.html", '<div data-composition-id="main" data-duration="8"></div>\n');
      write(root, "DESIGN.md", design("PASS", "Ordinary pacing keeps the causal explanation readable and leaves room for its landing."));
      writeJson(root, ".hyperframes-scaffold.json", metadata);
      const result = run(root);
      assert.notEqual(result.status, 0);
      assert.match(result.json.errors.join("\n"), /recognized schemaVersion 2.*scaffold.*non-empty files/i);
    });
  }
});

test("PASS without a manifest is clean and both supported admission headings parse", () => {
  withProject((root) => {
    writeJson(root, ".hyperframes-scaffold.json", scaffoldMeta(2));
    write(root, "DESIGN.md", design("PASS", "Ordinary pacing keeps this explanation clearer and gives its landing room."));
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.json.ok, true);
    assert.equal(result.json.skipped, true);
    assert.equal(result.json.admission.decision, "PASS");

    const alternate = parseFastAdmission([
      "## Fast-passaged editing — admission",
      "",
      "**Decision:** USE — A bounded pressure sequence must compress repeated operations into one causal run.",
    ].join("\n"));
    assert.equal(alternate.valid, true);
    assert.equal(alternate.decision, "USE");

    const ordinaryVerb = parseFastAdmission([
      "## Fast-paced passage admission",
      "",
      "**Decision:** PASS — We use steady pacing because the causal explanation needs room.",
    ].join("\n"));
    assert.equal(ordinaryVerb.valid, true, ordinaryVerb.errors.join("\n"));

    const ordinaryWhyVerb = parseFastAdmission([
      "## Fast-paced passage admission",
      "",
      "Decision: PASS",
      "Why: We use steady pacing because the causal explanation needs room.",
    ].join("\n"));
    assert.equal(ordinaryWhyVerb.valid, true, ordinaryWhyVerb.errors.join("\n"));

    for (const ambiguous of [
      "PASS or USE",
      "PASS / USE",
      "PASS | USE",
      "PASS — or USE",
      "PASS, USE",
      "PASS — USE",
      "PASS **or USE**",
      "PASS [USE]",
      "PASS and USE",
      "PASS + USE",
      "PASS → USE",
      "USE because PASS remains available",
      "PASS or use",
      "PASS [use]",
      "PASS and use",
      "PASS + use",
      "PASS → use",
      "USE or pass",
    ]) {
      const rejected = parseFastAdmission(`## Fast-paced passage admission\n\n**Decision:** ${ambiguous} — choose one later.\n`);
      assert.equal(rejected.valid, false, ambiguous);
      assert.match(rejected.errors.join("\n"), /both template options/);
    }

    for (const misleading of [
      "## Fast-paced passage admission\n\nNonDecision: PASS — ordinary pacing remains clearer.\n",
      "## Fast-paced passage admission\n\n```md\nDecision: PASS — this fenced example is inert.\n```\n",
      "## Fast-paced passage admission\n\n````md\nDecision: PASS — this longer fenced example is inert.\n````\n",
      "## Fast-paced passage admission\n\n~~~~md\nDecision: PASS — this tilde-fenced example is inert.\n~~~~\n",
      "## Fast-paced passage admission\n\n    Decision: PASS — this indented code example is inert.\n",
      "## Fast-paced passage admission\n\n\tDecision: PASS — this tab-indented code example is inert.\n",
      "## Fast-paced passage admission\n\n<pre>\nDecision: PASS — this HTML pre example is inert.\n</pre>\n",
      "## Fast-paced passage admission\n\n<PRE class=\"example\">Decision: PASS — this inline pre example is inert.</PRE>\n",
      "## Fast-paced passage admission\n\n<code>Decision: PASS — this inline code example is inert.</code>\n",
      "## Fast-paced passage admission\n\n<code>\nDecision: PASS — this code block example is inert.\n</code>\n",
      "## Fast-paced passage admission\n\n<code>Decision: PASS — this unclosed code example stays inert through EOF.\n",
      "## Fast-paced passage admission\n\n<!-- Decision: PASS — this unclosed comment stays inert through EOF.\n",
      "## Fast-paced passage admission\n\nDecision: PASS — decide later after the edit.\n",
    ]) {
      const rejected = parseFastAdmission(misleading);
      assert.equal(rejected.valid, false, misleading);
    }

    for (const contradiction of [
      "## Fast-paced passage admission\n\nDecision: PASS\nWhy: USE — A bounded sequence needs compression.\n",
      "## Fast-paced passage admission\n\nDecision: USE\nWhy: PASS — Ordinary pacing is clearer throughout.\n",
      "## Fast-paced passage admission\n\nDecision: PASS\nWhy: use — A bounded sequence remains another option.\n",
      "## Fast-paced passage admission\n\nDecision: USE\nWhy: pass — Ordinary pacing remains another option.\n",
      "## Fast-paced passage admission\n\nDecision: use\nWhy: pass because ordinary pacing remains clearer.\n",
      "## Fast-paced passage admission\n\nDecision: pass\nWhy: use because compression remains another option.\n",
      "## Fast-paced passage admission\n\nDecision: use\nWhy: pass remains the clearer alternative for this explanation.\n",
      "## Fast-paced passage admission\n\nDecision: pass\nWhy: use provides the stronger pressure arc for this sequence.\n",
    ]) {
      const rejected = parseFastAdmission(contradiction);
      assert.equal(rejected.valid, false, contradiction);
      assert.match(rejected.errors.join("\n"), /both template options/i);
    }
  });
});

test("raw-text, RCDATA, and inert HTML cannot supply a fast admission decision", () => {
  const inertTags = [
    "textarea", "title", "iframe", "xmp", "noembed", "noframes", "noscript",
    "plaintext", "script", "style", "template",
  ];
  for (const tag of inertTags) {
    for (const closed of [true, false]) {
      const source = [
        "## Fast-paced passage admission",
        "",
        `<${tag} class="example">`,
        "Decision: PASS — Ordinary pacing keeps the causal explanation clear and readable.",
        closed ? `</${tag}>` : "",
      ].join("\n");
      const result = parseFastAdmission(source);
      assert.equal(result.valid, false, `${tag} (${closed ? "closed" : "unclosed"}) admitted an inert decision`);
      assert.match(result.errors.join("\n"), /exactly one explicit|needs a Fast-paced passage admission/i, tag);
    }
  }

  const nestedTemplate = parseFastAdmission([
    "## Fast-paced passage admission",
    "",
    "<template><!-- </template> is inert comment text --><template>",
    "Decision: USE — A bounded pressure sequence needs a compressed causal run.",
    "</template></template>",
  ].join("\n"));
  assert.equal(nestedTemplate.valid, false, "nested template content admitted an inert decision");
});

test("USE without a manifest and PASS with a manifest are contradictions", () => {
  withProject((root) => {
    write(root, "DESIGN.md", design("USE", "One bounded failure run needs directed compression before a readable recovery."));
    const missing = run(root);
    assert.notEqual(missing.status, 0);
    assert.match(missing.json.errors.join("\n"), /USE but FAST_PASSAGES\.json is missing/);

    makeValidProject(root);
    write(root, "DESIGN.md", design("PASS", "Ordinary rhythm is clearer throughout this film, so no local fast arc is needed."));
    const contradiction = run(root);
    assert.notEqual(contradiction.status, 0);
    assert.match(contradiction.json.errors.join("\n"), /exists but .* admission is PASS/);
  });
});

test("a valid USE manifest syncs the exact audio-clock hashes and then passes", () => {
  withProject((root) => {
    const manifest = makeValidProject(root, { hashes: "unsynced" });
    const before = fs.readFileSync(path.join(root, "FAST_PASSAGES.json"), "utf8");
    assert.match(before, /unsynced/);

    const synced = run(root, "--sync-clock");
    assert.equal(synced.status, 0, synced.stdout + synced.stderr);
    assert.equal(synced.json.synced, true);
    const after = JSON.parse(fs.readFileSync(path.join(root, "FAST_PASSAGES.json"), "utf8"));
    assert.equal(after.clock.boundariesSha256, sha256File(path.join(root, "scripts", "boundaries.json")));
    assert.equal(after.clock.wordsSha256, sha256File(path.join(root, "assets", "words", "narration.words.json")));
    assert.notEqual(after.clock.boundariesSha256, manifest.clock.boundariesSha256);

    const valid = run(root);
    assert.equal(valid.status, 0, valid.stdout + valid.stderr);
    assert.equal(valid.json.passages[0].id, "pressure-run");
    assert.equal(valid.json.passages[0].start, 2);
    assert.equal(valid.json.passages[0].end, 7);

    writeJson(root, "scripts/boundaries.json", { totalSec: 12, sections: [{ id: "s0", startSec: 0, endSec: 12 }], revision: 2 });
    const stale = run(root);
    assert.notEqual(stale.status, 0);
    assert.match(stale.json.errors.join("\n"), /boundariesSha256 is stale/);
  });
});

test("clock sync preserves manifest mode and never removes a colliding temporary", { skip: process.platform === "win32" }, () => {
  withProject((root) => {
    let manifest = makeValidProject(root, { hashes: "unsynced" });
    const manifestPath = path.join(root, "FAST_PASSAGES.json");
    fs.chmodSync(manifestPath, 0o640);
    const synced = run(root, "--sync-clock");
    assert.equal(synced.status, 0, synced.stdout + synced.stderr);
    assert.equal(fs.statSync(manifestPath).mode & 0o777, 0o640);

    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.clock.boundariesSha256 = "unsynced";
    manifest.clock.wordsSha256 = "unsynced";
    writeJson(root, "FAST_PASSAGES.json", manifest);
    const before = fs.readFileSync(manifestPath, "utf8");
    const validation = validateFastManifest({ root, manifest, syncClock: true });
    assert.equal(validation.nonClockErrors.length, 0, validation.nonClockErrors.join("\n"));
    const tokenBytes = Buffer.alloc(12, 0xab);
    const collision = path.join(root, `.FAST_PASSAGES.json.${process.pid}-${tokenBytes.toString("hex")}.tmp`);
    fs.writeFileSync(collision, "pre-existing collision\n");
    const failed = syncClockHashes({ root, manifest, validation, randomBytes: () => tokenBytes });
    assert.equal(failed.synced, false);
    assert.match(failed.errors.join("\n"), /could not be written safely.*exist/i);
    assert.equal(fs.readFileSync(collision, "utf8"), "pre-existing collision\n");
    assert.equal(fs.readFileSync(manifestPath, "utf8"), before);
  });
});

test("clock sync refuses concurrent manifest replacement and clock mutation", () => {
  withProject((root) => {
    let manifest = makeValidProject(root, { hashes: "unsynced" });
    let validation = validateFastManifest({ root, manifest, syncClock: true });
    const manifestPath = path.join(root, "FAST_PASSAGES.json");
    const replacementPath = path.join(root, ".concurrent-manifest.json");
    const replacement = { ...manifest, concurrentWriter: "must survive" };
    const replaced = syncClockHashes({
      root,
      manifest,
      validation,
      randomBytes() {
        writeJson(root, ".concurrent-manifest.json", replacement);
        fs.renameSync(replacementPath, manifestPath);
        return Buffer.alloc(12, 0xcd);
      },
    });
    assert.equal(replaced.synced, false);
    assert.match(replaced.errors.join("\n"), /FAST_PASSAGES\.json was replaced after validation/i);
    assert.equal(JSON.parse(fs.readFileSync(manifestPath, "utf8")).concurrentWriter, "must survive");

    manifest = makeValidProject(root, { hashes: "unsynced" });
    validation = validateFastManifest({ root, manifest, syncClock: true });
    const beforeManifest = fs.readFileSync(manifestPath, "utf8");
    const changedClock = syncClockHashes({
      root,
      manifest,
      validation,
      randomBytes() {
        writeJson(root, "scripts/boundaries.json", {
          totalSec: 12,
          sections: [{ id: "s0", startSec: 0, endSec: 12 }],
          concurrentRevision: 2,
        });
        return Buffer.alloc(12, 0xef);
      },
    });
    assert.equal(changedClock.synced, false);
    assert.match(changedClock.errors.join("\n"), /scripts\/boundaries\.json changed after validation/i);
    assert.equal(fs.readFileSync(manifestPath, "utf8"), beforeManifest);
  });
});

test("phase topology must be ordered, contiguous, exact, legible, and inside the index", () => {
  withProject((root) => {
    const manifest = makeValidProject(root);
    manifest.passages[0].phases[1].role = "release";
    manifest.passages[0].phases[1].at = 3.1;
    manifest.passages[0].phases[2].entry = "<ENTRY>";
    manifest.passages[0].phases.at(-1).duration = 1;
    manifest.passages[0].duration = 11;
    writeJson(root, "FAST_PASSAGES.json", manifest);

    const result = run(root);
    assert.notEqual(result.status, 0);
    const errors = result.json.errors.join("\n");
    assert.match(errors, /role order must progress/);
    assert.match(errors, /phases must be contiguous/);
    assert.match(errors, /entry must name the incoming focal receiver/);
    assert.match(errors, /phases must cover the full passage exactly/);
    assert.match(errors, /beyond index\.html duration/);
    assert.match(errors, /needs exactly one release phase/);
  });
});

test("each fast phase inherits the exact focal receiver emitted by the prior phase", () => {
  withProject((root) => {
    const manifest = makeValidProject(root);
    manifest.passages[0].phases[2].entry = "an unrelated lower-right target";
    writeJson(root, "FAST_PASSAGES.json", manifest);
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /entry must exactly inherit the previous phase exit receiver/i);
  });
});

test("panic-rupture may deliberately break focal continuity only on its named peak", () => {
  withProject((root) => {
    const manifest = makeValidProject(root);
    manifest.passages[0].intent = "panic-rupture";
    manifest.passages[0].phases[3].entry = "full-frame red rupture receiver";
    writeJson(root, "FAST_PASSAGES.json", manifest);
    const result = run(root);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });
});

test("subcomposition phases require one real covering mount", () => {
  withProject((root) => {
    makeValidProject(root, { owner: "compositions/fast-owner.html" });
    const valid = run(root);
    assert.equal(valid.status, 0, valid.stdout + valid.stderr);

    const index = fs.readFileSync(path.join(root, "index.html"), "utf8")
      .replace('data-start="2" data-duration="5"', 'data-start="5" data-duration="2"');
    write(root, "index.html", index);
    const uncovered = run(root);
    assert.notEqual(uncovered.status, 0);
    assert.match(uncovered.json.errors.join("\n"), /needs exactly one index\.html mount covering/);

    makeValidProject(root, { owner: "compositions/fast-owner.html" });
    write(root, "index.html", [
      '<div data-composition-id="main" data-duration="12">',
      '  <section><div data-composition-id="fast-owner" data-composition-src="compositions/fast-owner.html" data-start="2" data-duration="5" data-width="1920" data-height="1080" data-track-index="1"></div></section>',
      "</div>",
    ].join("\n"));
    const nested = run(root);
    assert.notEqual(nested.status, 0);
    assert.match(nested.json.errors.join("\n"), /needs exactly one index\.html mount covering/);

    const manifest = JSON.parse(fs.readFileSync(path.join(root, "FAST_PASSAGES.json"), "utf8"));
    manifest.passages[0].phases[0].owner = "../outside.html";
    writeJson(root, "FAST_PASSAGES.json", manifest);
    const unsafe = run(root);
    assert.notEqual(unsafe.status, 0);
    assert.match(unsafe.json.errors.join("\n"), /owner must be index\.html or a safe compositions/);
  });
});

test("subcomposition owners and their live native mounts satisfy the core cross-file contract", () => {
  withProject((root) => {
    const invalidCases = [
      {
        mutate() {
          write(root, "index.html", fs.readFileSync(path.join(root, "index.html"), "utf8")
            .replace('data-composition-id="fast-owner"', 'data-composition-id="wrong-owner"'));
        },
        error: /mount data-composition-id must equal owner root id/i,
      },
      {
        mutate() {
          write(root, "index.html", fs.readFileSync(path.join(root, "index.html"), "utf8")
            .replace(' data-width="1920"', ""));
        },
        error: /finite positive data-width\/data-height/i,
      },
      {
        mutate() {
          write(root, "index.html", fs.readFileSync(path.join(root, "index.html"), "utf8")
            .replace('data-track-index="1"', 'data-track-index="1.5"'));
        },
        error: /data-track-index must be a non-negative integer/i,
      },
      {
        mutate() {
          write(root, "compositions/fast-owner.html", '<div data-composition-id="fast-owner" data-duration="5"></div>\n');
        },
        error: /exactly one direct template composition root/i,
      },
      {
        mutate() {
          write(root, "compositions/fast-owner.html", '<template><template><div data-composition-id="fast-owner" data-duration="5"></div></template></template>\n');
        },
        error: /exactly one direct template composition root/i,
      },
      {
        mutate() {
          write(root, "index.html", fs.readFileSync(path.join(root, "index.html"), "utf8")
            .replace('<div data-composition-id="fast-owner"', '<template data-composition-id="fast-owner"')
            .replace('data-track-index="1"></div>', 'data-track-index="1"></template>'));
        },
        error: /exactly one index\.html mount covering/i,
      },
      {
        mutate() {
          write(root, "index.html", [
            '<div data-composition-id="main" data-duration="12">',
            '  <!-- <div data-composition-id="fast-owner" data-composition-src="compositions/fast-owner.html" data-start="2" data-duration="5" data-width="1920" data-height="1080" data-track-index="1"></div>',
          ].join("\n"));
        },
        error: /exactly one index\.html mount covering/i,
      },
    ];
    for (const invalidCase of invalidCases) {
      makeValidProject(root, { owner: "compositions/fast-owner.html" });
      invalidCase.mutate();
      const result = run(root);
      assert.notEqual(result.status, 0);
      assert.match(result.json.errors.join("\n"), invalidCase.error);
    }
  });
});

test("raw-text and inert ancestors cannot forge fast roots, mounts, or owners", () => {
  withProject((root) => {
    const inertTags = [
      "textarea", "title", "iframe", "xmp", "noembed", "noframes", "plaintext",
      "script", "style", "template", "noscript",
    ];
    const mount = '<div data-composition-id="fast-owner" data-composition-src="compositions/fast-owner.html" data-start="2" data-duration="5" data-width="1920" data-height="1080" data-track-index="1"></div>';
    const ownerRoot = '<template><div data-composition-id="fast-owner" data-duration="5"></div></template>';

    for (const tag of inertTags) {
      makeValidProject(root, { owner: "compositions/fast-owner.html" });
      write(root, "index.html", `<${tag}></div><div data-composition-id="main" data-duration="12">${mount}</div></${tag}>\n`);
      const forgedMount = run(root);
      assert.notEqual(forgedMount.status, 0, `${tag} forged a live index root/mount`);
      assert.match(forgedMount.json.errors.join("\n"), /exactly one live top-level div data-composition-id root/i, tag);

      makeValidProject(root, { owner: "compositions/fast-owner.html" });
      write(root, "compositions/fast-owner.html", `<${tag}></div>${ownerRoot}</${tag}>\n`);
      const forgedOwner = run(root);
      assert.notEqual(forgedOwner.status, 0, `${tag} forged a live owner root`);
      assert.match(forgedOwner.json.errors.join("\n"), /exactly one direct template composition root/i, tag);
    }
  });
});

test("index ownership requires one live top-level div root", () => {
  withProject((root) => {
    for (const index of [
      '<template data-composition-id="main" data-duration="12"></template>\n',
      '<section data-composition-id="main" data-duration="12"></section>\n',
      '<template><div data-composition-id="main" data-duration="12"></div></template>\n',
    ]) {
      makeValidProject(root);
      write(root, "index.html", index);
      const result = run(root);
      assert.notEqual(result.status, 0);
      assert.match(result.json.errors.join("\n"), /exactly one live top-level div data-composition-id root/i);
    }
  });
});

test("passage ids are unique, windows do not overlap, and semantics are filled", () => {
  withProject((root) => {
    const manifest = makeValidProject(root);
    const second = structuredClone(manifest.passages[0]);
    second.primaryFamily = "<PRIMARY FAMILY>";
    manifest.passages.push(second);
    writeJson(root, "FAST_PASSAGES.json", manifest);
    const result = run(root);
    assert.notEqual(result.status, 0);
    const errors = result.json.errors.join("\n");
    assert.match(errors, /duplicate passage id/);
    assert.match(errors, /passages pressure-run and pressure-run overlap/);
    assert.match(errors, /primaryFamily must be concrete and non-placeholder/);
  });
});

test("--sync-clock never writes through a non-clock contract failure", () => {
  withProject((root) => {
    const manifest = makeValidProject(root, { hashes: "keep-me" });
    manifest.passages[0].phases[2].at = 4.25;
    writeJson(root, "FAST_PASSAGES.json", manifest);
    const before = fs.readFileSync(path.join(root, "FAST_PASSAGES.json"), "utf8");
    const result = run(root, "--sync-clock");
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /phases must be contiguous/);
    assert.equal(fs.readFileSync(path.join(root, "FAST_PASSAGES.json"), "utf8"), before);
  });
});

test("clock sources must carry matching positive durations and real word timings", () => {
  withProject((root) => {
    makeValidProject(root);
    writeJson(root, "scripts/boundaries.json", { totalSec: 11, sections: [] });
    writeJson(root, "assets/words/narration.words.json", { durationSec: 10, words: [] });
    const result = run(root, "--sync-clock");
    assert.notEqual(result.status, 0);
    const errors = result.json.errors.join("\n");
    assert.match(errors, /non-empty words array/);
    assert.match(errors, /audio clocks disagree/);
    assert.match(errors, /index\.html duration .* locked boundaries/i);
  });
});

test("clock synchronization rejects coerced durations and out-of-order words", () => {
  withProject((root) => {
    makeValidProject(root, { hashes: "unsynced" });
    writeJson(root, "scripts/boundaries.json", { totalSec: "12", sections: [] });
    writeJson(root, "assets/words/narration.words.json", {
      durationSec: 12,
      words: [
        { word: "later", start: 2, end: 2.5 },
        { word: "earlier", start: 1.5, end: 2.2 },
      ],
    });
    const result = run(root, "--sync-clock");
    assert.notEqual(result.status, 0);
    const errors = result.json.errors.join("\n");
    assert.match(errors, /positive numeric totalSec/);
    assert.match(errors, /source-order reversal/);
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "FAST_PASSAGES.json"), "utf8"));
    assert.equal(manifest.clock.boundariesSha256, "unsynced");
    assert.equal(manifest.clock.wordsSha256, "unsynced");
  });
});

test("word timings may overlap or round to zero length when their start order remains monotonic", () => {
  withProject((root) => {
    makeValidProject(root, { hashes: "unsynced" });
    writeJson(root, "assets/words/narration.words.json", {
      durationSec: 12,
      words: [
        { word: "near", start: 2, end: 2.5 },
        { word: "overlap", start: 2.2, end: 2.4 },
        { word: ".", start: 2.4, end: 2.4 },
        { word: " ", start: 2.4, end: 2.45 },
      ],
    });
    const result = run(root, "--sync-clock");
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });
});

test("word clock accepts brief producer jitter while rejecting gross source-order reversal", () => {
  withProject((root) => {
    makeValidProject(root, { hashes: "unsynced" });
    writeJson(root, "assets/words/narration.words.json", {
      durationSec: 12,
      words: [
        { word: "rounded", start: 2.26, end: 2.26 },
        { word: "jitter", start: 1.96, end: 2.38 },
      ],
    });
    const result = run(root, "--sync-clock");
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });
});

test("FAST_PASSAGES.json itself must not be a symlink", { skip: process.platform === "win32" }, () => {
  withProject((root) => {
    makeValidProject(root);
    const manifestPath = path.join(root, "FAST_PASSAGES.json");
    const outside = path.join(os.tmpdir(), `hf-fast-outside-${process.pid}-${Date.now()}.json`);
    const bytes = fs.readFileSync(manifestPath, "utf8");
    fs.writeFileSync(outside, bytes);
    fs.unlinkSync(manifestPath);
    fs.symlinkSync(outside, manifestPath);
    try {
      const result = run(root, "--sync-clock");
      assert.notEqual(result.status, 0);
      assert.match(result.json.errors.join("\n"), /regular non-symlink file/i);
      assert.equal(fs.readFileSync(outside, "utf8"), bytes);
      assert.equal(fs.lstatSync(manifestPath).isSymbolicLink(), true);
    } finally {
      fs.unlinkSync(outside);
    }
  });
});

test("all fast control inputs must be regular project-local files", { skip: process.platform === "win32" }, () => {
  withProject((root) => {
    makeValidProject(root);
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "hf-fast-control-outside-"));
    try {
      const externalIndex = path.join(outside, "index.html");
      fs.copyFileSync(path.join(root, "index.html"), externalIndex);
      fs.unlinkSync(path.join(root, "index.html"));
      fs.symlinkSync(externalIndex, path.join(root, "index.html"));
      let result = run(root);
      assert.notEqual(result.status, 0);
      assert.match(result.json.errors.join("\n"), /index\.html must be a regular non-symlink/i);

      fs.unlinkSync(path.join(root, "index.html"));
      fs.copyFileSync(externalIndex, path.join(root, "index.html"));
      const externalDesign = path.join(outside, "DESIGN.md");
      fs.copyFileSync(path.join(root, "DESIGN.md"), externalDesign);
      fs.unlinkSync(path.join(root, "DESIGN.md"));
      fs.symlinkSync(externalDesign, path.join(root, "DESIGN.md"));
      result = run(root);
      assert.notEqual(result.status, 0);
      assert.match(result.json.errors.join("\n"), /DESIGN\.md must be a regular non-symlink/i);

      fs.unlinkSync(path.join(root, "DESIGN.md"));
      fs.copyFileSync(externalDesign, path.join(root, "DESIGN.md"));
      fs.unlinkSync(path.join(root, ".hyperframes-scaffold.json"));
      fs.symlinkSync(path.join(outside, "missing-scaffold.json"), path.join(root, ".hyperframes-scaffold.json"));
      result = run(root);
      assert.notEqual(result.status, 0);
      assert.match(result.json.errors.join("\n"), /scaffold\.json must be a regular non-symlink/i);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test("the example manifest exposes the complete v1 vocabulary", () => {
  const template = JSON.parse(fs.readFileSync(TEMPLATE, "utf8"));
  assert.equal(template.$schema, "hf-fast-passages/v1");
  assert.deepEqual(Object.keys(template.clock), ["boundaries", "boundariesSha256", "words", "wordsSha256"]);
  assert.deepEqual(template.passages[0].phases.map((phase) => phase.role), ["baseline", "compress", "escalate", "peak", "release"]);
  for (const key of ["intent", "primaryFamily", "accent", "soundPlan", "legibility", "start", "duration"]) {
    assert.ok(Object.hasOwn(template.passages[0], key), key);
  }
});

test("library validation reports clock errors separately for gate integration", () => {
  withProject((root) => {
    const manifest = makeValidProject(root, { hashes: "bad" });
    const result = validateFastManifest({ root, manifest });
    assert.equal(result.nonClockErrors.length, 0, result.nonClockErrors.join("\n"));
    assert.equal(result.clockErrors.length, 2);
    assert.match(result.clockErrors.join("\n"), /lowercase SHA-256 digest/);
  });
});

test("malformed ambition contract metadata fails closed instead of downgrading to legacy mode", () => {
  withProject((root) => {
    writeJson(root, ".hyperframes-scaffold.json", scaffoldMeta("two"));
    write(root, "DESIGN.md", design("PASS", "Ordinary scene rhythm keeps this explanation easier to follow."));
    const result = run(root);
    assert.equal(result.status, 1);
    assert.equal(result.json.ok, false);
    assert.match(result.json.errors.join("\n"), /ambitionContractVersion must be a positive integer/i);
  });
});

function design(decision, rationale) {
  return [
    "# Production Bible",
    "",
    "## Fast-paced passage admission (decide; do not default)",
    "",
    `**Decision:** ${decision} — ${rationale}`,
    "",
  ].join("\n");
}

function makeValidProject(root, options = {}) {
  const owner = options.owner || "index.html";
  writeJson(root, ".hyperframes-scaffold.json", scaffoldMeta(2));
  write(root, "DESIGN.md", design("USE", "A bounded repeated-operation sequence needs compression, one failure peak, and a readable recovery."));
  writeJson(root, "scripts/boundaries.json", { totalSec: 12, sections: [{ id: "s0", startSec: 0, endSec: 12 }] });
  writeJson(root, "assets/words/narration.words.json", { durationSec: 12, words: [{ word: "pressure", start: 2, end: 2.4 }] });
  write(root, "compositions/fast-owner.html", '<template><div data-composition-id="fast-owner" data-duration="5"></div></template>\n');
  write(root, "index.html", [
    '<div data-composition-id="main" data-duration="12">',
    '  <div data-composition-id="fast-owner" data-composition-src="compositions/fast-owner.html" data-start="2" data-duration="5" data-width="1920" data-height="1080" data-track-index="1"></div>',
    "</div>",
  ].join("\n"));

  const hashValue = options.hashes === undefined ? null : options.hashes;
  const manifest = {
    $schema: "hf-fast-passages/v1",
    clock: {
      boundaries: "scripts/boundaries.json",
      boundariesSha256: hashValue ?? sha256File(path.join(root, "scripts", "boundaries.json")),
      words: "assets/words/narration.words.json",
      wordsSha256: hashValue ?? sha256File(path.join(root, "assets", "words", "narration.words.json")),
    },
    passages: [{
      id: "pressure-run",
      intent: "temporal-compression",
      start: 2,
      duration: 5,
      primaryFamily: "hard action cuts through one repeated operation",
      accent: "one brief interruption at the named failure peak",
      soundPlan: "three semantic impacts build into a vacuum before release",
      legibility: "voice stays primary and each cut inherits one focal receiver",
      phases: [
        { id: "stable", role: "baseline", at: 2, duration: 1, owner, entry: "stable center control", exit: "repeated right control" },
        { id: "compress", role: "compress", at: 3, duration: 0.75, owner, entry: "repeated right control", exit: "growing center queue" },
        { id: "escalate", role: "escalate", at: 3.75, duration: 1, owner, entry: "growing center queue", exit: "warning mark above queue" },
        { id: "peak", role: "peak", at: 4.75, duration: 0.5, owner, entry: "warning mark above queue", exit: "failed operation at center" },
        { id: "release", role: "release", at: 5.25, duration: 1.75, owner, entry: "failed operation at center", exit: "restored left landmark" },
      ],
    }],
  };
  writeJson(root, "FAST_PASSAGES.json", manifest);
  return manifest;
}

function scaffoldMeta(ambitionContractVersion) {
  const metadata = {
    schemaVersion: 2,
    provider: "fish",
    files: [{ target: "index.html", source: "templates/index.skeleton.html", managed: false }],
  };
  if (ambitionContractVersion !== undefined) metadata.ambitionContractVersion = ambitionContractVersion;
  return metadata;
}

function run(root, ...args) {
  const result = spawnSync(process.execPath, [CHECKER, "--root", root, "--json", ...args], { encoding: "utf8" });
  let json = null;
  try { json = JSON.parse(result.stdout); }
  catch (error) { assert.fail(`checker did not return JSON: ${error.message}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`); }
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, json };
}

function withProject(callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hf-fast-passages-"));
  try { callback(root); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
}

function write(root, relative, value) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
}

function writeJson(root, relative, value) {
  write(root, relative, `${JSON.stringify(value, null, 2)}\n`);
}
