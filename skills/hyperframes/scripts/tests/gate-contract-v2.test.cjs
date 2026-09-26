"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const GATE = path.resolve(__dirname, "..", "gate.cjs");
const MARKDOWN_INERT_CONTAINERS = [
  "script", "style", "textarea", "title", "iframe", "xmp", "noembed", "noframes", "noscript", "plaintext", "template",
];

test("audit records can report unheard Sound without fabricating a listening score", () => {
  withProject((root) => {
    base(root);
    const audit = (sound, disclosure = "", visual = "4", proof = true) => [1, 2].map((n) =>
      `## Audit pass ${n}\n${disclosure}\n| s0 | ${visual} | 4 | 4 | 4 | 4 | ${sound} | Enlarged the return labels and checked the encoded neighbor. |\n`
      + (proof ? "Redesigned this pass: Reframed the overview and verified the new encoded output.\n" : "")
    ).join("\n");
    const disclosure = "Subjective sound: UNASSESSED — Runtime cannot hear the final mix; decode and measured loudness are recorded separately.";

    write(root, "DIRECTION.md", audit("4"));
    assertGate(root, "audit", "pass");
    write(root, "DIRECTION.md", audit("null", disclosure));
    assert.match(assertGate(root, "audit", "pass").detail, /not listening approval/);
    write(root, "DIRECTION.md", audit("UNASSESSED", disclosure));
    assertGate(root, "audit", "pass");
    for (const invalid of [
      audit("null"),
      audit("", disclosure),
      audit("null", "Subjective sound: UNASSESSED — TODO evidence"),
      audit("null", `<!-- ${disclosure} -->`),
      audit("null", disclosure, "null"),
      audit("null", disclosure, "4", false),
    ]) {
      write(root, "DIRECTION.md", invalid);
      assertGate(root, "audit", "fail");
    }
  });
});

test("v2 Spatial Canvas admission requires an explicit non-placeholder PASS or USE", () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", spatial("PASS", "Independent scenes use clearer cuts and preserve the causal order."));
    assertGate(root, "spatial_canvas", "pass");

    write(root, "DESIGN.md", "# Design\n\n## Spatial Canvas admission\n\n**Decision:** <PASS | USE>. **Why:** <decide>.\n");
    write(root, "DIRECTION.md", "WAIVER: spatial_canvas — ignore the missing decision.\n");
    const missing = assertGate(root, "spatial_canvas", "fail");
    assert.equal(missing.waivable, false);
    assert.match(missing.detail, /PASS\/USE decision/i);

    write(root, "DESIGN.md", `<!--\n${spatial("PASS", "Hidden prose must not satisfy a required admission.")}`);
    const unclosedComment = assertGate(root, "spatial_canvas", "fail");
    assert.equal(unclosedComment.waivable, false);
    assert.match(unclosedComment.detail, /PASS\/USE decision/i);

    write(root, "DESIGN.md", `<pre>\n${spatial("PASS", "Code examples must not satisfy a required admission.")}\n</pre>\n`);
    const preAdmission = assertGate(root, "spatial_canvas", "fail");
    assert.equal(preAdmission.waivable, false);
    assert.match(preAdmission.detail, /PASS\/USE decision/i);

    for (const hidden of [
      `<template>\n${spatial("PASS", "Template content must not satisfy a required admission.")}\n</template>\n`,
      `<template>\n${spatial("PASS", "An unterminated template must stay inert through EOF.")}\n`,
    ]) {
      write(root, "DESIGN.md", hidden);
      const templateAdmission = assertGate(root, "spatial_canvas", "fail");
      assert.equal(templateAdmission.waivable, false);
      assert.match(templateAdmission.detail, /PASS\/USE decision/i);
    }

    write(root, "DESIGN.md", spatial("USE", "Distance between evidence clusters carries the proof."));
    const missingManifest = assertGate(root, "spatial_canvas", "fail");
    assert.equal(missingManifest.waivable, false);
    assert.match(missingManifest.detail, /missing/i);
  });
});

test("Spatial Canvas PASS cannot conceal live markers or a broken structural contract", () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", spatial("PASS", "Independent scenes preserve the causal order more clearly."));
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><div data-hf-spatial-host="case"></div></div>\n');
    write(root, "DIRECTION.md", "WAIVER: spatial_canvas — pretend the marker is absent.\n");
    const result = assertGate(root, "spatial_canvas", "fail");
    assert.equal(result.waivable, false);
    assert.match(result.detail, /says Spatial Canvas PASS/i);
  });
});

test("strict Spatial Canvas review rows require substantive evidence and an action decision", () => {
  withProject((root) => {
    base(root);
    makeSpatialReviewProject(root);
    write(root, "DIRECTION.md", spatialReview("substantive"));
    assertGate(root, "spatial_canvas", "pass");

    write(root, "DIRECTION.md", spatialReview("fillers"));
    const fillers = assertGate(root, "spatial_canvas", "fail");
    assert.equal(fillers.waivable, true);
    assert.match(fillers.detail, /route review row\(s\) missing/i);

    write(root, "DIRECTION.md", spatialReview("bare-result"));
    assertGate(root, "spatial_canvas", "fail");
  });
});

test("commented, fenced, indented, and unclosed-comment review evidence is inert", () => {
  withProject((root) => {
    base(root);
    makeSpatialReviewProject(root);
    const review = spatialReview("substantive");
    const hiddenVariants = [
      `<!--\n${review}\n-->\n`,
      `\`\`\`markdown\n${review}\n\`\`\`\n`,
      review.split(/\r?\n/).map((line) => `    ${line}`).join("\n"),
      `<!--\n${review}\n`,
      `<pre>\n${review}\n</pre>\n`,
      `<code>\n${review}\n</code>\n`,
      `<pre>\n${review}\n`,
    ];
    for (const hidden of hiddenVariants) {
      write(root, "DIRECTION.md", hidden);
      const result = assertGate(root, "spatial_canvas", "fail");
      assert.match(result.detail, /route review row\(s\) missing/i);
    }
  });
});

test("raw-text, RCDATA, and template containers cannot supply review evidence", () => {
  withProject((root) => {
    base(root);
    makeSpatialReviewProject(root);
    const review = spatialReview("substantive");
    for (const container of MARKDOWN_INERT_CONTAINERS) {
      const hiddenVariants = container === "plaintext"
        ? [`<plaintext>\n${review}\n`]
        : [
          `<${container}>\n${review}\n</${container}>\n`,
          `<${container}>\n${review}\n`,
        ];
      for (const hidden of hiddenVariants) {
        write(root, "DIRECTION.md", hidden);
        const result = assertGate(root, "spatial_canvas", "fail");
        assert.match(result.detail, /route review row\(s\) missing/i, `${container}: ${hidden.endsWith(`</${container}>\n`) ? "closed" : "EOF"}`);
      }
    }
  });
});

test("a fenced waiver is inert until a valid closing fence", () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", sound({ bgm: "SILENCE", sfx: "PASS" }));
    write(root, "DIRECTION.md", `\`\`\`text
\`\`\` trailing text is code, not a closing fence
WAIVER: bgm — silence gives the final claim room to land.
\`\`\`
`);
    const result = assertGate(root, "bgm", "fail");
    assert.equal(result.waiver, null);

    for (const hidden of [
      "<pre>WAIVER: bgm — silence gives the final claim room to land.</pre>\n",
      "<code>WAIVER: bgm — silence gives the final claim room to land.</code>\n",
      "<code>WAIVER: bgm — silence gives the final claim room to land.\n",
    ]) {
      write(root, "DIRECTION.md", hidden);
      const inert = assertGate(root, "bgm", "fail");
      assert.equal(inert.waiver, null);
    }

    for (const container of MARKDOWN_INERT_CONTAINERS) {
      const hiddenVariants = container === "plaintext"
        ? ["<plaintext>WAIVER: bgm — silence gives the final claim room to land.\n"]
        : [
          `<${container}>WAIVER: bgm — silence gives the final claim room to land.</${container}>\n`,
          `<${container}>WAIVER: bgm — silence gives the final claim room to land.\n`,
        ];
      for (const hidden of hiddenVariants) {
        write(root, "DIRECTION.md", hidden);
        const inert = assertGate(root, "bgm", "fail");
        assert.equal(inert.waiver, null, `${container}: waiver must stay inert`);
      }
    }
  });
});

test("zero-byte Spatial Canvas and fast-passage manifests cannot hide behind PASS", () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", spatial("PASS", "Independent scenes preserve the causal order more clearly."));
    write(root, "SPATIAL_CANVAS.json", "");
    const spatialResult = assertGate(root, "spatial_canvas", "fail");
    assert.equal(spatialResult.waivable, false);
    assert.match(spatialResult.detail, /says Spatial Canvas PASS/i);

    write(root, "DESIGN.md", `# Design

## Fast-paced passage admission

**Decision:** PASS. **Why:** This argument needs a steady cadence and no bounded compression passage.
`);
    write(root, "FAST_PASSAGES.json", "");
    const fastResult = assertGate(root, "fast_passages", "fail");
    assert.equal(fastResult.waivable, false);
    assert.match(fastResult.detail, /says fast passages PASS/i);
  });
});

test("malformed ambitionContractVersion fails closed instead of downgrading the contract", () => {
  withProject((root) => {
    base(root);
    write(root, ".hyperframes-scaffold.json", '{"schemaVersion":2,"ambitionContractVersion":"2","provider":"fish","files":[{"target":"index.html","source":"templates/index.skeleton.html","managed":true}]}\n');
    write(root, "DESIGN.md", spatial("PASS", "Independent scenes preserve the causal order more clearly."));
    const result = assertGate(root, "spatial_canvas", "fail");
    assert.equal(result.waivable, false);
    assert.match(result.detail, /ambitionContractVersion must be a positive integer/i);
  });
});

test("unrecognized scaffold metadata cannot downgrade strict gates", () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", spatial("PASS", "Independent scenes preserve the causal order more clearly."));
    for (const manifest of ["{}\n", '{"schemaVersion":2,"provider":"fish"}\n']) {
      write(root, ".hyperframes-scaffold.json", manifest);
      const result = assertGate(root, "spatial_canvas", "fail");
      assert.equal(result.waivable, false);
      assert.match(result.detail, /not a recognized Fish scaffold manifest/i);
    }
  });
});

test("scaffold symlinks and dangling scaffold entries fail closed", { skip: process.platform === "win32" }, () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", spatial("PASS", "Independent scenes preserve the causal order more clearly."));
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "hf-gate-outside-scaffold-"));
    try {
      const external = path.join(outside, "scaffold.json");
      fs.writeFileSync(external, '{"schemaVersion":2,"provider":"fish","files":[{"target":"index.html","source":"template","managed":true}]}\n');
      fs.unlinkSync(path.join(root, ".hyperframes-scaffold.json"));
      fs.symlinkSync(external, path.join(root, ".hyperframes-scaffold.json"));
      assert.match(assertGate(root, "spatial_canvas", "fail").detail, /regular non-symlink file/i);

      fs.unlinkSync(path.join(root, ".hyperframes-scaffold.json"));
      fs.symlinkSync(path.join(outside, "missing.json"), path.join(root, ".hyperframes-scaffold.json"));
      assert.match(assertGate(root, "spatial_canvas", "fail").detail, /regular non-symlink file/i);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test("unsafe control files cannot inject or hide gate evidence", { skip: process.platform === "win32" }, () => {
  withProject((root) => {
    base(root);
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "hf-gate-outside-control-"));
    try {
      const externalDesign = path.join(outside, "DESIGN.md");
      fs.writeFileSync(externalDesign, spatial("PASS", "External prose must never control this project's admission."));
      fs.symlinkSync(externalDesign, path.join(root, "DESIGN.md"));
      assert.match(assertGate(root, "spatial_canvas", "fail").detail, /DESIGN\.md must be a regular non-symlink file/i);
      fs.unlinkSync(path.join(root, "DESIGN.md"));

      write(root, "DESIGN.md", spatial("PASS", "Independent scenes preserve the causal order more clearly."));
      fs.rmSync(path.join(root, "DIRECTION.md"));
      fs.mkdirSync(path.join(root, "DIRECTION.md"));
      assert.match(assertGate(root, "spatial_canvas", "fail").detail, /DIRECTION\.md must be a regular non-symlink file/i);
      fs.rmSync(path.join(root, "DIRECTION.md"), { recursive: true });

      const externalIndex = path.join(outside, "index.html");
      fs.writeFileSync(externalIndex, '<div data-composition-id="main" data-duration="2"></div>\n');
      fs.unlinkSync(path.join(root, "index.html"));
      fs.symlinkSync(externalIndex, path.join(root, "index.html"));
      assert.match(assertGate(root, "spatial_canvas", "fail").detail, /index\.html must be a regular non-symlink file/i);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test("dangling Spatial Canvas and fast-passage manifests remain declared and fail closed", { skip: process.platform === "win32" }, () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", spatial("PASS", "Independent scenes preserve the causal order more clearly."));
    fs.symlinkSync(path.join(root, "missing-spatial.json"), path.join(root, "SPATIAL_CANVAS.json"));
    assert.match(assertGate(root, "spatial_canvas", "fail").detail, /SPATIAL_CANVAS\.json must be a regular non-symlink file/i);
    fs.unlinkSync(path.join(root, "SPATIAL_CANVAS.json"));

    write(root, "DESIGN.md", "# Design\n\n## Fast-paced passage admission\n\n**Decision:** PASS. **Why:** A steady cadence keeps the explanation clear without compression.\n");
    fs.symlinkSync(path.join(root, "missing-fast.json"), path.join(root, "FAST_PASSAGES.json"));
    assert.match(assertGate(root, "fast_passages", "fail").detail, /FAST_PASSAGES\.json must be a regular non-symlink file/i);
  });
});

test("admissions reject punctuation ambiguity and duplicate visible declarations", () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", "# Design\n\n## Spatial Canvas admission\n\n**Decision:** PASS — or USE. **Why:** This line deliberately leaves both choices visible.\n");
    assert.equal(assertGate(root, "spatial_canvas", "fail").waivable, false);

    write(root, "DESIGN.md", `${spatial("PASS", "Independent scenes preserve the causal order more clearly.")}\n## Spatial Canvas admission\n\n**Decision:** PASS. **Why:** This duplicate must not silently be ignored.\n`);
    const duplicate = assertGate(root, "spatial_canvas", "fail");
    assert.equal(duplicate.waivable, false);
    assert.match(duplicate.detail, /exactly one Spatial Canvas admission heading/i);

    write(root, "DESIGN.md", "# Design\n\n## Fast-paced passage admission\n\n**Decision:** PASS, USE. **Why:** This deliberately leaves both choices visible.\n");
    const fast = assertGate(root, "fast_passages", "fail");
    assert.equal(fast.waivable, false);
    assert.match(fast.detail, /both (?:PASS and USE|template options)|PASS\/USE decision/i);

    write(root, "DESIGN.md", "# Design\n\n## Fast-paced passage admission\n\n**Decision:** PASS → use. **Why:** This deliberately leaves both choices visible.\n");
    assert.equal(assertGate(root, "fast_passages", "fail").waivable, false);

    write(root, "DESIGN.md", "# Design\n\n## Fast-paced passage admission\n\nDecision: use\nWhy: pass because ordinary pacing remains the unresolved alternative.\n");
    assert.equal(assertGate(root, "fast_passages", "fail").waivable, false);

    write(root, "DESIGN.md", `${sound({ bgm: "SILENCE", sfx: "PASS" })}\n**BGM decision:** USE. **Why:** A duplicate decision cannot override the first declaration.\n`);
    assert.equal(assertGate(root, "sound_plan", "fail").waivable, false);

    write(root, "DESIGN.md", "# Design\n\n## Spatial Canvas admission\n\nDecision: PASS\nWhy: USE — A bounded spatial route is still under consideration.\n");
    assert.equal(assertGate(root, "spatial_canvas", "fail").waivable, false);

    write(root, "DESIGN.md", "# Design\n\n## Spatial Canvas admission\n\nDecision: pass\nWhy: use because a bounded spatial route remains another option.\n");
    assert.equal(assertGate(root, "spatial_canvas", "fail").waivable, false);

    write(root, "DESIGN.md", sound({ bgm: "SILENCE", sfx: "PASS" })
      .replace("Unscored space makes the spoken argument more direct.", "USE — The score option remains unresolved."));
    assert.equal(assertGate(root, "sound_plan", "fail").waivable, false);

    write(root, "DESIGN.md", sound({ bgm: "SILENCE", sfx: "PASS" })
      .replace("Unscored space makes the spoken argument more direct.", "use because the score option remains unresolved."));
    assert.equal(assertGate(root, "sound_plan", "fail").waivable, false);

    write(root, "DESIGN.md", sound({ bgm: "SILENCE", sfx: "PASS" })
      .replace("No visual event earns an effect in this deliberately spare passage.", "USE — The effects option remains unresolved."));
    assert.equal(assertGate(root, "sound_plan", "fail").waivable, false);

    write(root, "DESIGN.md", sound({ bgm: "SILENCE", sfx: "PASS" })
      .replace("No visual event earns an effect in this deliberately spare passage.", "use provides the unresolved effects alternative."));
    assert.equal(assertGate(root, "sound_plan", "fail").waivable, false);

    write(root, "DESIGN.md", sound({ bgm: "SILENCE", sfx: "PASS" })
      .replace("Unscored space makes the spoken argument more direct.", "We use unscored space to make the spoken argument more direct.")
      .replace("No visual event earns an effect in this deliberately spare passage.", "We use no effects because no visual event earns one."));
    assertGate(root, "sound_plan", "pass");
  });
});

test("sound admissions make deliberate silence explicit and accept uppercase waiver ids", () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", sound({ bgm: "SILENCE", sfx: "PASS" }));
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"></div><script>\n// tl.to("#bgm", {volume: 0}, 0); example only\n</script>\n');
    write(root, "DIRECTION.md", "WAIVER: BGM — <why silence is the deliberate choice>\n");
    const placeholder = assertGate(root, "bgm", "fail");
    assert.equal(placeholder.waivable, true);

    write(root, "DIRECTION.md", "<!--\nWAIVER: BGM — silence gives the final claim room to land.\n-->\n");
    assertGate(root, "bgm", "fail");

    write(root, "DIRECTION.md", "WAIVER: BGM — silence gives the final claim room to land.\n");
    assertGate(root, "sound_plan", "pass");
    assertGate(root, "bgm", "waived");
  });
});

test("missing sound decisions and stale BGM wiring are nonwaivable", () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", "# Design\n\n## Sound palette — discover, audition, freeze\n\n**BGM decision:** <USE | SILENCE>. **Why:** <decide>.\n\n**SFX decision:** <PASS | USE>. **Why:** <decide>.\n");
    write(root, "DIRECTION.md", "WAIVER: sound_plan — skip it.\nWAIVER: bgm — skip it.\n");
    assert.equal(assertGate(root, "sound_plan", "fail").waivable, false);

    write(root, "DESIGN.md", sound({ bgm: "USE", sfx: "PASS" }));
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="bgm" src="assets/bgm/missing.wav" data-start="0" data-duration="2" data-track-index="11" data-volume="0.2"></audio></div>\n');
    const broken = assertGate(root, "bgm", "fail");
    assert.equal(broken.waivable, false);
    assert.match(broken.detail, /missing local file/);
  });
});

test("BGM gate requires the live root reference to be real decodable local audio", () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", sound({ bgm: "USE", sfx: "PASS" }));
    tone(path.join(root, "assets", "bgm", "score.wav"));
    registerAudio(root, "assets/bgm/score.wav", "bgm");
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="bgm" src="assets/bgm/score.wav" data-start="0" data-duration="2" data-track-index="11" data-volume="0.2"></audio></div>\n');
    write(root, "DIRECTION.md", soundReview(["bgm"]));
    const result = assertGate(root, "bgm", "pass");
    assert.match(result.detail, /decodable local BGM/);
  });
});

test("BGM gate rejects a project-local path whose parent symlink escapes the project", { skip: process.platform === "win32" }, () => {
  withProject((root) => {
    base(root);
    write(root, "DESIGN.md", sound({ bgm: "USE", sfx: "PASS" }));
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "hf-gate-outside-audio-"));
    try {
      tone(path.join(outside, "score.wav"));
      fs.mkdirSync(path.join(root, "assets"), { recursive: true });
      fs.symlinkSync(outside, path.join(root, "assets", "bgm"), "dir");
      registerAudio(root, "assets/bgm/score.wav", "bgm", {
        reviewed: true,
        catalog_id: "reviewed-audio:bgm:escape",
        expected_sha256: sha256(path.join(outside, "score.wav")),
        source_id: "escape",
        source_page: "https://example.test/audio/escape",
        license: "CC0-1.0",
        license_url: "https://creativecommons.org/publicdomain/zero/1.0/",
        review_note: "This external fixture must never be read through a project parent symlink.",
      });
      write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="bgm" src="assets/bgm/score.wav" data-start="0" data-duration="2" data-track-index="11" data-volume="0.2"></audio></div>\n');
      write(root, "DIRECTION.md", soundReview(["bgm"]));
      const result = assertGate(root, "bgm", "fail");
      assert.equal(result.waivable, false);
      assert.match(result.detail, /resolves outside the project/i);
      assert.match(result.detail, /catalog hash refused unsafe path/i);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test("SFX USE binds one rights-recorded cue row, exact root track, and encoded review", () => {
  withProject((root) => {
    base(root);
    tone(path.join(root, "assets", "sfx", "paper-hit.wav"));
    registerAudio(root, "assets/sfx/paper-hit.wav", "sfx");
    write(root, "DESIGN.md", `${sound({ bgm: "SILENCE", sfx: "USE" })}\n| paper-hit | card lands · 0.5–0.8s | confirms the evidence landing | assets/sfx/paper-hit.wav · CC0 source page reviewed | quiet hit below narration |\n`);
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="paper-hit" data-hf-id="paper-hit" src="assets/sfx/paper-hit.wav" data-start="0.5" data-duration="0.3" data-track-index="12" data-volume="0.2"></audio></div>\n');
    write(root, "DIRECTION.md", soundReview(["paper-hit"]));
    assertGate(root, "sound_plan", "pass");

    write(root, "DIRECTION.md", `# Direction

## Sound-mix review

| channel / cue id | rendered event + exact window | semantic synchronization | voice / caption separation | frozen path + rights rechecked | result → action |
| --- | --- | --- | --- | --- | --- |
| paper-hit | x | x | x | x | PROTECT → x |
`);
    const weakReview = assertGate(root, "sound_plan", "fail");
    assert.equal(weakReview.waivable, true);
    assert.match(weakReview.detail, /sound-mix review row.*missing/i);
    write(root, "DIRECTION.md", soundReview(["paper-hit"]));

    const cue = '<audio id="paper-hit" data-hf-id="paper-hit" src="assets/sfx/paper-hit.wav" data-start="0.5" data-duration="0.3" data-track-index="12" data-volume="0.2"></audio>';
    write(root, "index.html", `<div data-composition-id="main" data-duration="2">${cue}${cue}</div>\n`);
    const duplicateTrack = assertGate(root, "sound_plan", "fail");
    assert.equal(duplicateTrack.waivable, false);
    assert.match(duplicateTrack.detail, /must bind exactly one live root audio element \(found 2\)/i);
    write(root, "index.html", `<div data-composition-id="main" data-duration="2">${cue}</div>\n`);

    write(root, "DESIGN.md", sound({ bgm: "SILENCE", sfx: "PASS" }));
    write(root, "DIRECTION.md", "WAIVER: sound_plan — ignore contradictory cue.\n");
    const contradiction = assertGate(root, "sound_plan", "fail");
    assert.equal(contradiction.waivable, false);
    assert.match(contradiction.detail, /SFX PASS contradicts/i);
  });
});

test("SFX USE requires a canonical global cue window that matches live start and duration", () => {
  withProject((root) => {
    base(root);
    tone(path.join(root, "assets", "sfx", "paper-hit.wav"));
    registerAudio(root, "assets/sfx/paper-hit.wav", "sfx");
    write(root, "DESIGN.md", `${sound({ bgm: "SILENCE", sfx: "USE" })}\n| paper-hit | card lands · 0.500–0.800s | confirms the evidence landing | assets/sfx/paper-hit.wav · CC0 source page reviewed | quiet hit below narration |\n`);
    write(root, "DIRECTION.md", soundReview(["paper-hit"]));

    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="paper-hit" data-hf-id="paper-hit" src="assets/sfx/paper-hit.wav" data-start="0.5005" data-duration="0.2995" data-track-index="12" data-volume="0.2"></audio></div>\n');
    assertGate(root, "sound_plan", "pass");

    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="paper-hit" data-hf-id="paper-hit" src="assets/sfx/paper-hit.wav" data-start="0.52" data-duration="0.28" data-track-index="12" data-volume="0.2"></audio></div>\n');
    const mismatch = assertGate(root, "sound_plan", "fail");
    assert.equal(mismatch.waivable, false);
    assert.match(mismatch.detail, /does not match DESIGN global window/i);

    write(root, "DESIGN.md", `${sound({ bgm: "SILENCE", sfx: "USE" })}\n| paper-hit | card lands on the final beat | confirms the evidence landing | assets/sfx/paper-hit.wav · CC0 source page reviewed | quiet hit below narration |\n`);
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="paper-hit" data-hf-id="paper-hit" src="assets/sfx/paper-hit.wav" data-start="0.5" data-duration="0.3" data-track-index="12" data-volume="0.2"></audio></div>\n');
    const noncanonical = assertGate(root, "sound_plan", "fail");
    assert.equal(noncanonical.waivable, false);
    assert.match(noncanonical.detail, /canonical numeric global window/i);
  });
});

test("BGM and SFX media offsets and global windows stay inside their source and composition", () => {
  withProject((root) => {
    base(root);
    tone(path.join(root, "assets", "sfx", "paper-hit.wav"));
    registerAudio(root, "assets/sfx/paper-hit.wav", "sfx");
    write(root, "DESIGN.md", `${sound({ bgm: "SILENCE", sfx: "USE" })}\n| paper-hit | card lands · 0.500–0.800s | confirms the evidence landing | assets/sfx/paper-hit.wav · CC0 source page reviewed | quiet hit below narration |\n`);
    write(root, "DIRECTION.md", soundReview(["paper-hit"]));

    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="paper-hit" data-hf-id="paper-hit" src="assets/sfx/paper-hit.wav" data-start="0.5" data-duration="0.3" data-media-start="1.7" data-track-index="12" data-volume="0.2"></audio></div>\n');
    assertGate(root, "sound_plan", "pass");

    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="paper-hit" data-hf-id="paper-hit" src="assets/sfx/paper-hit.wav" data-start="0.5" data-duration="0.3" data-media-start="1.7" data-track-index="12.5" data-volume="0.2"></audio></div>\n');
    const fractionalTrack = assertGate(root, "sound_plan", "fail");
    assert.equal(fractionalTrack.waivable, false);
    assert.match(fractionalTrack.detail, /data-track-index must be an explicit nonnegative integer/i);

    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="paper-hit" data-hf-id="paper-hit" src="assets/sfx/paper-hit.wav" data-start="0.5" data-duration="0.3" data-media-start="NaN" data-track-index="12" data-volume="0.2"></audio></div>\n');
    const nonfinite = assertGate(root, "sound_plan", "fail");
    assert.equal(nonfinite.waivable, false);
    assert.match(nonfinite.detail, /data-media-start must be an explicit finite nonnegative value/i);

    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="paper-hit" data-hf-id="paper-hit" src="assets/sfx/paper-hit.wav" data-start="0.5" data-duration="0.3" data-media-start="1.8" data-track-index="12" data-volume="0.2"></audio></div>\n');
    const sourceOverflow = assertGate(root, "sound_plan", "fail");
    assert.equal(sourceOverflow.waivable, false);
    assert.match(sourceOverflow.detail, /data-media-start \+ data-duration exceeds decoded file duration/i);

    tone(path.join(root, "assets", "bgm", "score.wav"));
    registerAudio(root, "assets/bgm/score.wav", "bgm");
    write(root, "DESIGN.md", sound({ bgm: "USE", sfx: "PASS" }));
    write(root, "DIRECTION.md", soundReview(["bgm"]));
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="bgm" src="assets/bgm/score.wav" data-start="0.5" data-duration="1.6" data-media-start="0.2" data-track-index="11" data-volume="0.2"></audio></div>\n');
    const compositionOverflow = assertGate(root, "bgm", "fail");
    assert.equal(compositionOverflow.waivable, false);
    assert.match(compositionOverflow.detail, /data-start \+ data-duration exceeds top-level composition duration/i);
    assert.equal(assertGate(root, "sound_plan", "fail").waivable, false);
  });
});

test("strict audio wiring requires trusted local manifest provenance and verified catalog bytes", () => {
  withProject((root) => {
    base(root);
    const relative = "assets/bgm/score.wav";
    const absolute = path.join(root, relative);
    tone(absolute);
    write(root, "DESIGN.md", sound({ bgm: "USE", sfx: "PASS" }));
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="bgm" src="assets/bgm/score.wav" data-start="0" data-duration="2" data-track-index="11" data-volume="0.2"></audio></div>\n');
    write(root, "DIRECTION.md", soundReview(["bgm"]));

    const missing = assertGate(root, "sound_plan", "fail");
    assert.equal(missing.waivable, false);
    assert.match(missing.detail, /missing \.media\/manifest\.jsonl/i);
    assert.equal(assertGate(root, "bgm", "fail").waivable, false);

    registerAudio(root, relative, "bgm", { provider: "remote-catalog" }, { replace: true });
    const remote = assertGate(root, "sound_plan", "fail");
    assert.equal(remote.waivable, false);
    assert.match(remote.detail, /non-local provider/i);

    registerAudio(root, relative, "bgm", {
      reviewed: true,
      catalog_id: "reviewed-audio:bgm:202",
      expected_sha256: "0".repeat(64),
      source_id: "202",
      source_page: "https://example.test/audio/202",
      license: "CC0-1.0",
      license_url: "https://creativecommons.org/publicdomain/zero/1.0/",
      review_note: "Auditioned against the final edit and approved for this mix.",
    }, { replace: true });
    const staleCatalog = assertGate(root, "sound_plan", "fail");
    assert.equal(staleCatalog.waivable, false);
    assert.match(staleCatalog.detail, /expected_sha256 does not match actual bytes/i);

    registerAudio(root, relative, "bgm", {
      reviewed: true,
      catalog_id: "reviewed-audio:bgm:202",
      expected_sha256: sha256(absolute),
      source_id: "202",
      source_page: "https://example.test/audio/202",
      license: "CC0-1.0",
      license_url: "https://creativecommons.org/publicdomain/zero/1.0/",
      review_note: "Auditioned against the final edit and approved for this mix.",
    }, { replace: true });
    assertGate(root, "sound_plan", "pass");
    assertGate(root, "bgm", "pass");
  });
});

test("template, script/style literal, and nested audio cannot satisfy live root wiring", () => {
  withProject((root) => {
    base(root);
    tone(path.join(root, "assets", "bgm", "score.wav"));
    registerAudio(root, "assets/bgm/score.wav", "bgm");
    write(root, "DESIGN.md", sound({ bgm: "USE", sfx: "PASS" }));
    write(root, "DIRECTION.md", soundReview(["bgm"]));
    const inert = '<audio id="bgm" src="assets/bgm/score.wav" data-start="0" data-duration="2" data-track-index="11" data-volume="0.2"></audio>';
    write(root, "index.html", `<div data-composition-id="main" data-duration="2"><template>${inert}</template><script>const example = ${JSON.stringify(inert)};</script><style>.example{content:${JSON.stringify(inert)}}</style><div data-composition-id="nested-scene">${inert}</div></div>\n`);
    const soundResult = assertGate(root, "sound_plan", "fail");
    assert.equal(soundResult.waivable, false);
    assert.match(soundResult.detail, /direct child of the sole top-level index composition root/i);
    const bgmResult = assertGate(root, "bgm", "fail");
    assert.equal(bgmResult.waivable, false);
    assert.match(bgmResult.detail, /no live root audio track/i);
  });
});

test("a template element cannot masquerade as the live top-level composition root", () => {
  withProject((root) => {
    base(root);
    tone(path.join(root, "assets", "bgm", "score.wav"));
    registerAudio(root, "assets/bgm/score.wav", "bgm");
    write(root, "DESIGN.md", sound({ bgm: "USE", sfx: "PASS" }));
    write(root, "DIRECTION.md", soundReview(["bgm"]));
    write(root, "index.html", '<template data-composition-id="main" data-duration="2"><audio id="bgm" src="assets/bgm/score.wav" data-start="0" data-duration="2" data-track-index="11" data-volume="0.2"></audio></template>\n');
    const result = assertGate(root, "sound_plan", "fail");
    assert.equal(result.waivable, false);
    assert.match(result.detail, /direct child of the sole top-level index composition root \(found 0\)/i);
  });
});

test("raw-text and RCDATA containers cannot supply a live root or audio track", () => {
  withProject((root) => {
    base(root);
    tone(path.join(root, "assets", "bgm", "score.wav"));
    registerAudio(root, "assets/bgm/score.wav", "bgm");
    write(root, "DESIGN.md", sound({ bgm: "USE", sfx: "PASS" }));
    write(root, "DIRECTION.md", soundReview(["bgm"]));
    const audio = '<audio id="bgm" src="assets/bgm/score.wav" data-start="0" data-duration="2" data-track-index="11" data-volume="0.2"></audio>';
    const containers = ["script", "style", "textarea", "title", "iframe", "xmp", "noembed", "noframes", "noscript", "plaintext"];
    for (const container of containers) {
      write(root, "index.html", `<div data-composition-id="main" data-duration="2"><${container}>${audio}</${container}></div>\n`);
      const nested = assertGate(root, "sound_plan", "fail");
      assert.equal(nested.waivable, false);
      assert.match(nested.detail, /live audio direct child.*\(found 0\)/i, container);
    }

    write(root, "index.html", `<textarea data-composition-id="main" data-duration="2">${audio}</textarea>\n`);
    const inertRoot = assertGate(root, "sound_plan", "fail");
    assert.equal(inertRoot.waivable, false);
    assert.match(inertRoot.detail, /sole top-level index composition root \(found 0\)/i);
  });
});

test("direct-root audio must have one consistent explicit channel identity", () => {
  withProject((root) => {
    base(root);
    tone(path.join(root, "assets", "audio", "score.wav"));
    write(root, "DESIGN.md", sound({ bgm: "SILENCE", sfx: "PASS" }));
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="score" src="assets/audio/score.wav" data-start="0" data-duration="2" data-track-index="11" data-volume="0.2"></audio></div>\n');
    const unclassified = assertGate(root, "sound_plan", "fail");
    assert.equal(unclassified.waivable, false);
    assert.match(unclassified.detail, /exactly one explicit narration\/BGM\/SFX identity \(found 0\)/i);

    tone(path.join(root, "assets", "bgm", "score.wav"));
    registerAudio(root, "assets/bgm/score.wav", "bgm");
    write(root, "DESIGN.md", sound({ bgm: "USE", sfx: "PASS" }));
    write(root, "DIRECTION.md", soundReview(["bgm"]));
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="bgm" data-hf-id="sfx-hit" src="assets/bgm/score.wav" data-start="0" data-duration="2" data-track-index="11" data-volume="0.2"></audio></div>\n');
    const conflict = assertGate(root, "sound_plan", "fail");
    assert.equal(conflict.waivable, false);
    assert.match(conflict.detail, /id "bgm" conflicts with data-hf-id "sfx-hit"/i);
  });
});

test("review-catalog files are never accepted as live render dependencies", () => {
  withProject((root) => {
    base(root);
    tone(path.join(root, "mediaReview", "candidate.wav"));
    registerAudio(root, "mediaReview/candidate.wav", "bgm");
    write(root, "DESIGN.md", sound({ bgm: "USE", sfx: "PASS" }).replaceAll("assets/bgm/score.wav", "mediaReview/candidate.wav"));
    write(root, "DIRECTION.md", soundReview(["bgm"]).replaceAll("assets/bgm/score.wav", "mediaReview/candidate.wav"));
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"><audio id="bgm" src="mediaReview/candidate.wav" data-start="0" data-duration="2" data-track-index="11" data-volume="0.2"></audio></div>\n');
    const result = assertGate(root, "bgm", "fail");
    assert.equal(result.waivable, false);
    assert.match(result.detail, /points into the review catalog/i);
  });
});

test("fast-passage gate requires a valid clock-locked arc and exact rendered review id", () => {
  withProject((root) => {
    base(root);
    makeFastProject(root);
    write(root, "DIRECTION.md", `# Direction

## Fast-passage trajectory review

| passage id | rendered window + final clock | comprehension / one idea | eye trace + release orientation | picture + sound + caption result | result → action |
| --- | --- | --- | --- | --- | --- |
| pressure-run | 1–3s; hashes current | repeated operation remains clear | center queue returns to left landmark | earned peak; voice and captions remain clear | PROTECT → keep verified trajectory |
`);
    assertGate(root, "fast_passages", "pass");

    write(root, "DIRECTION.md", `# Direction

## Fast-passage trajectory review

| passage id | rendered window + final clock | comprehension / one idea | eye trace + release orientation | picture + sound + caption result | result → action |
| --- | --- | --- | --- | --- | --- |
| pressure-run | 1–3s; hashes current | repeated operation remains clear | center queue returns to left landmark | earned peak; voice and captions remain clear | |
`);
    const actionMissing = assertGate(root, "fast_passages", "fail");
    assert.equal(actionMissing.waivable, true);
    assert.match(actionMissing.detail, /trajectory review row\(s\) missing/i);

    write(root, "DIRECTION.md", `# Direction

## Fast-passage trajectory review

| passage id | rendered window + final clock | comprehension / one idea | eye trace + release orientation | picture + sound + caption result | result → action |
| --- | --- | --- | --- | --- | --- |
| pressure-run | x | x | x | x | PROTECT → x |
`);
    const fillerReview = assertGate(root, "fast_passages", "fail");
    assert.equal(fillerReview.waivable, true);
    assert.match(fillerReview.detail, /trajectory review row\(s\) missing/i);

    write(root, "DIRECTION.md", `# Direction

## Fast-passage trajectory review

| passage id | rendered window + final clock | comprehension / one idea | eye trace + release orientation | picture + sound + caption result | result → action |
| --- | --- | --- | --- | --- | --- |
| pressure-run | 1–3s; hashes current | repeated operation remains clear | center queue returns to left landmark | earned peak; voice and captions remain clear | protect |
`);
    assertGate(root, "fast_passages", "fail");

    write(root, "DIRECTION.md", "WAIVER: fast_passages — final-audio review is deferred for this fixture.\n");
    assertGate(root, "fast_passages", "waived");

    write(root, "scripts/boundaries.json", '{"totalSec":8,"revision":2}\n');
    const stale = assertGate(root, "fast_passages", "fail");
    assert.equal(stale.waivable, false);
    assert.match(stale.detail, /stale/i);
  });
});

function base(root) {
  write(root, ".hyperframes-scaffold.json", '{"schemaVersion":2,"ambitionContractVersion":2,"provider":"fish","files":[{"target":"index.html","source":"templates/index.skeleton.html","managed":true}]}\n');
  write(root, "index.html", '<div data-composition-id="main" data-duration="2"></div>\n');
  write(root, "DIRECTION.md", "# Direction\n");
}

function spatial(decision, why) {
  return `# Design\n\n## Spatial Canvas admission\n\n**Decision:** ${decision}. **Why:** ${why}\n`;
}

function sound({ bgm, sfx }) {
  return `# Design

## Sound palette — discover, audition, freeze

**BGM decision:** ${bgm}. **Why:** ${bgm === "USE" ? "The restrained score carries momentum without masking speech." : "Unscored space makes the spoken argument more direct."}

**SFX decision:** ${sfx}. **Why:** ${sfx === "USE" ? "One visible evidence landing earns a restrained tactile cue." : "No visual event earns an effect in this deliberately spare passage."}

- **BGM role + mix arc:** assets/bgm/score.wav · CC0 source reviewed; low opening pulse, duck under speech, clean release.

| cue id | exact event / global window | semantic job | reviewed frozen path + source/license | mix / bridge / restraint |
| --- | --- | --- | --- | --- |
`;
}

function soundReview(ids) {
  return `# Direction

## Sound-mix review

| channel / cue id | rendered event + exact window | semantic synchronization | voice / caption separation | frozen path + rights rechecked | result → action |
| --- | --- | --- | --- | --- | --- |
${ids.map((id) => `| ${id} | encoded event at exact final time | sound confirms the visible cause | voice and captions remain clear | ${id === "bgm" ? "assets/bgm/score.wav" : `assets/sfx/${id}.wav`} · CC0 source rechecked | PROTECT → retain verified mix |`).join("\n")}
`;
}

function tone(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const made = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=2", "-c:a", "pcm_s16le", file], { encoding: "utf8" });
  assert.equal(made.status, 0, made.stderr);
}

function registerAudio(root, relative, type, provenance = {}, { replace = false } = {}) {
  const record = {
    id: `${type}_fixture`,
    type,
    path: relative,
    source: "local-source",
    description: `${type} fixture`,
    provenance: {
      origin: "local-file",
      local: true,
      license: "CC0-1.0",
      ...provenance,
    },
  };
  const manifest = path.join(root, ".media", "manifest.jsonl");
  fs.mkdirSync(path.dirname(manifest), { recursive: true });
  if (replace) fs.writeFileSync(manifest, `${JSON.stringify(record)}\n`);
  else fs.appendFileSync(manifest, `${JSON.stringify(record)}\n`);
  return record;
}

function makeSpatialReviewProject(root) {
  write(root, "DESIGN.md", spatial("USE", "Distance and camera return make the hidden relationship legible as one persistent world."));
  write(root, "index.html", `
<div data-composition-id="main" data-duration="9">
  <div data-hf-spatial-host="case" data-composition-id="worldboard" data-composition-src="compositions/worldboard.html" data-start="0" data-duration="9" data-width="1920" data-height="1080" data-track-index="1"></div>
  <div data-composition-id="detail" data-composition-src="compositions/detail.html" data-start="4" data-duration="1.5" data-width="1920" data-height="1080" data-track-index="2"></div>
</div>
`);
  write(root, "compositions/worldboard.html", `
<template>
  <div data-composition-id="worldboard" data-width="1920" data-height="1080" data-duration="9" data-hf-spatial-canvas="case">
    <div data-hf-spatial-world="case">
      <div data-hf-spatial-region="case:origin"></div>
      <div data-hf-spatial-region="case:link"></div>
      <div data-hf-spatial-landmark="case:origin-pin"></div>
      <div data-hf-spatial-landmark="case:link-tab"></div>
      <div data-hf-spatial-connector="case:evidence-edge"></div>
    </div>
  </div>
</template>
`);
  write(root, "compositions/detail.html", '<template><div data-composition-id="detail" data-width="1920" data-height="1080" data-duration="1.5"></div></template>\n');
  write(root, "SPATIAL_CANVAS.json", `${JSON.stringify({
    $schema: "hf-spatial-canvas/v1",
    canvases: [{
      id: "case",
      scope: "sequence",
      backend: "dom-transform",
      composition: "compositions/worldboard.html",
      spatialThesis: "Distance and the connector expose one hidden relationship.",
      viewport: { width: 1920, height: 1080, focusX: 960, focusY: 480 },
      world: { width: 4000, height: 2400 },
      regions: [
        { id: "origin", x: 400, y: 300, width: 800, height: 600, anchorX: 800, anchorY: 600, claim: "Origin evidence" },
        { id: "link", x: 2600, y: 1200, width: 900, height: 650, anchorX: 3000, anchorY: 1500, claim: "Relationship evidence" },
      ],
      landmarks: [
        { id: "origin-pin", x: 800, y: 600, purpose: "Keeps the origin cluster recognizable." },
        { id: "link-tab", x: 3000, y: 1500, purpose: "Keeps the relationship cluster recognizable." },
      ],
      connectors: [{ id: "evidence-edge", type: "evidentiary", from: "origin", to: "link", meaning: "The evidence links the two clusters." }],
      lod: {
        overview: "Both regions and their edge remain legible.",
        regional: "Cluster headings and hero evidence remain legible.",
        detail: "Artifact annotations become readable after arrival.",
      },
      visits: [
        { id: "orient", at: 0, duration: 2, region: null, camera: { cx: 2000, cy: 1200, zoom: 0.4 }, verb: "orient", purpose: "Establish both landmarks.", revision: "open", reviewAt: 1 },
        { id: "inspect-origin", at: 2, duration: 3, region: "origin", camera: { cx: 800, cy: 600, zoom: 1 }, verb: "inspect", purpose: "Read the initiating evidence.", revision: "origin-confirmed", reviewAt: 3.5 },
        { id: "return-origin", at: 5, duration: 1.5, region: "origin", camera: { cx: 800, cy: 600, zoom: 1 }, verb: "rejoin", purpose: "Restore the exact anchor.", revision: "origin-annotated", reviewAt: 5.75 },
        { id: "synthesis", at: 6.5, duration: 2.5, region: null, camera: { cx: 2000, cy: 1200, zoom: 0.4 }, verb: "synthesize", purpose: "Reveal the changed whole.", revision: "resolved", reviewAt: 7.8 },
      ],
      excursions: [{ id: "dossier", at: 4, duration: 1, cutawayComposition: "compositions/detail.html", departVisit: "inspect-origin", returnVisit: "return-origin", reviewAt: 4.5, returnMode: "exact", returnMutation: "Confirmed edge appears." }],
    }],
  }, null, 2)}\n`);
}

function spatialReview(mode) {
  const keys = ["case:orient", "case:inspect-origin", "case:excursion-dossier", "case:return-origin", "case:synthesis"];
  const row = (key) => mode === "fillers"
    ? `| ${key} | x | x | x | PROTECT → x |`
    : `| ${key} | orientation remains anchored to a named landmark | one dominant evidence cluster remains readable | spatial proof reveals a changed relationship revision | ${mode === "bare-result" ? "protect" : "PROTECT → retain the verified camera route"} |`;
  return `# Direction

## Spatial-canvas review

| canvas:visit | orientation + landmark | focal hierarchy / legibility | spatial proof + world revision | result → action |
| --- | --- | --- | --- | --- |
${keys.map(row).join("\n")}
`;
}

function makeFastProject(root) {
  write(root, "DESIGN.md", `# Design

## Fast-paced passage admission

**Decision:** USE. **Why:** A bounded repeated-operation run needs compression, one failure peak, and a readable release.
`);
  write(root, "scripts/boundaries.json", '{"totalSec":8}\n');
  write(root, "assets/words/narration.words.json", '{"durationSec":8,"words":[{"word":"pressure","start":1,"end":1.3}]}\n');
  const boundaries = path.join(root, "scripts", "boundaries.json");
  const words = path.join(root, "assets", "words", "narration.words.json");
  write(root, "index.html", '<div data-composition-id="main" data-duration="8"></div>\n');
  write(root, "FAST_PASSAGES.json", `${JSON.stringify({
    $schema: "hf-fast-passages/v1",
    clock: {
      boundaries: "scripts/boundaries.json",
      boundariesSha256: sha256(boundaries),
      words: "assets/words/narration.words.json",
      wordsSha256: sha256(words),
    },
    passages: [{
      id: "pressure-run", intent: "temporal-compression", start: 1, duration: 2,
      primaryFamily: "hard action cuts through one repeated operation",
      accent: "one brief interruption at the named failure peak",
      soundPlan: "two semantic impacts build into a vacuum before release",
      legibility: "voice stays primary and each cut inherits one focal receiver",
      phases: [
        { role: "baseline", at: 1, duration: 1, owner: "index.html", entry: "stable center control", exit: "growing center queue" },
        { role: "peak", at: 2, duration: 0.5, owner: "index.html", entry: "growing center queue", exit: "failed center operation" },
        { role: "release", at: 2.5, duration: 0.5, owner: "index.html", entry: "failed center operation", exit: "restored left landmark" },
      ],
    }],
  }, null, 2)}\n`);
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function assertGate(root, id, status) {
  const result = spawnSync(process.execPath, [GATE, "--root", root, "--only", id, "--json"], { encoding: "utf8" });
  assert.doesNotThrow(() => JSON.parse(result.stdout), `${result.stdout}\n${result.stderr}`);
  const parsed = JSON.parse(result.stdout);
  const item = parsed.results.find((entry) => entry.id === id);
  assert.ok(item, result.stdout);
  assert.equal(item.status, status, `${result.stdout}\n${result.stderr}`);
  assert.equal(result.status, status === "fail" ? 1 : 0, result.stdout);
  return item;
}

function withProject(callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hf-gate-v2-"));
  try { callback(root); }
  finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
