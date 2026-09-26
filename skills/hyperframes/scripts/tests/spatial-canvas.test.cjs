"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const CHECKER = path.resolve(__dirname, "..", "check-spatial-canvas.cjs");
const GATE = path.resolve(__dirname, "..", "gate.cjs");
const REVIEW_MASTER = path.resolve(__dirname, "..", "review-master.cjs");
const SPATIAL_LIB = path.resolve(__dirname, "..", "lib", "spatial-canvas.cjs");
const FACELESS = path.resolve(__dirname, "..", "..", "..", "faceless-explainer", "scripts");
const ASSEMBLER = path.join(FACELESS, "assemble-index.mjs");
const SYNC = path.join(FACELESS, "sync-spatial-canvas.mjs");
const TEMPLATE = path.resolve(__dirname, "..", "..", "templates", "SPATIAL_CANVAS.example.json");
const { spatialHostStart, spatialReviewTimes } = require(SPATIAL_LIB);

test("ordinary projects no-op while orphan markers fail", () => {
  withProject((root) => {
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"></div>\n<!-- <div data-hf-spatial-host="CANVAS_ID"></div> -->\n');
    const clean = run(CHECKER, root);
    assert.equal(clean.status, 0);
    assert.equal(clean.json.skipped, true);

    write(root, "index.html", '<div data-hf-spatial-host="case"></div>\n');
    const orphan = run(CHECKER, root);
    assert.notEqual(orphan.status, 0);
    assert.match(orphan.json.errors.join("\n"), /SPATIAL_CANVAS\.json is missing/);
  });
});

test("unclosed HTML comments cannot inject Spatial Canvas markers", () => {
  withProject((root) => {
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"></div>\n<!-- <div data-hf-spatial-host="case"></div>\n');
    const result = run(CHECKER, root);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(result.json.skipped, true);
    assert.throws(
      () => spatialHostStart('<!-- <div data-hf-spatial-host="case" data-start="0" data-track-index="1"></div>', "case", "sequence", "compositions/world.html"),
      /no data-hf-spatial-host/i,
    );
    assert.throws(
      () => spatialHostStart('<template data-composition-id="main"><div data-hf-spatial-host="case" data-start="0" data-track-index="1"></div></template>', "case", "sequence", "compositions/world.html"),
      /no data-hf-spatial-host/i,
    );
  });
});

test("dangling and symlinked Spatial Canvas manifests fail closed", { skip: process.platform === "win32" }, () => {
  withProject((root) => {
    write(root, "index.html", '<div data-composition-id="main" data-duration="2"></div>\n');
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "hf-spatial-outside-plan-"));
    try {
      const external = path.join(outside, "SPATIAL_CANVAS.json");
      fs.writeFileSync(external, '{"$schema":"hf-spatial-canvas/v1","canvases":[]}\n');
      fs.symlinkSync(external, path.join(root, "SPATIAL_CANVAS.json"));
      const linked = run(CHECKER, root);
      assert.notEqual(linked.status, 0);
      assert.match(linked.json.errors.join("\n"), /regular non-symlink file physically contained/i);

      fs.unlinkSync(path.join(root, "SPATIAL_CANVAS.json"));
      fs.symlinkSync(path.join(outside, "missing.json"), path.join(root, "SPATIAL_CANVAS.json"));
      const dangling = run(CHECKER, root);
      assert.notEqual(dangling.status, 0);
      assert.match(dangling.json.errors.join("\n"), /regular non-symlink file physically contained/i);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test("valid sequence manifest links non-sN world, route, host, and excursion", () => {
  withProject((root) => {
    makeValidProject(root);
    const result = run(CHECKER, root);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(result.json.ok, true);
    assert.deepEqual(result.json.errors, []);
  });
});

test("nested portal excursion owns one declared child canvas for the exact window", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    const parent = plan.canvases[0];
    parent.portals = [{ id: "ledger-door", region: "link", targetCanvas: "ledger-detail", purpose: "Enter the ledger history without losing the parent relationship." }];
    parent.excursions[0].portalId = "ledger-door";
    parent.excursions[0].cutawayComposition = "compositions/ledger-detail.html";
    plan.canvases.push({
      id: "ledger-detail", scope: "scene", backend: "dom-transform", composition: "compositions/ledger-detail.html",
      spatialThesis: "Moving from ledger entry to account exposes the nested payment path.",
      viewport: { width: 1920, height: 1080, focusX: 960, focusY: 480 },
      world: { width: 2000, height: 1200 },
      regions: [
        { id: "entry", x: 100, y: 100, width: 700, height: 500, anchorX: 450, anchorY: 350, claim: "The initiating ledger entry." },
        { id: "account", x: 1100, y: 400, width: 700, height: 500, anchorX: 1450, anchorY: 650, claim: "The beneficiary account." },
      ],
      landmarks: [
        { id: "entry-tab", x: 450, y: 350, purpose: "Keeps the entry cluster recognizable." },
        { id: "account-pin", x: 1450, y: 650, purpose: "Keeps the account cluster recognizable." },
      ],
      connectors: [{ id: "ledger-edge", type: "transaction", from: "entry", to: "account", meaning: "The ledger entry resolves to the beneficiary account." }],
      lod: { overview: "Both entries and their edge remain legible.", regional: "Account headings remain legible.", detail: "Transaction annotations become readable after arrival." },
      visits: [
        { id: "orient", at: 0, duration: 0.2, region: null, camera: { cx: 1000, cy: 600, zoom: 0.8 }, verb: "orient", purpose: "Establish the ledger map.", revision: "open", reviewAt: 0.1 },
        { id: "inspect-entry", at: 0.2, duration: 0.4, region: "entry", camera: { cx: 450, cy: 350, zoom: 1 }, verb: "inspect", purpose: "Read the initiating entry.", revision: "entry-confirmed", reviewAt: 0.4 },
        { id: "synthesis", at: 0.6, duration: 0.4, region: null, camera: { cx: 1000, cy: 600, zoom: 0.8 }, verb: "synthesize", purpose: "Resolve the nested payment path.", revision: "resolved", reviewAt: 0.8 },
      ],
    });
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const parentHtml = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8")
      .replace('<div data-hf-spatial-connector="case:evidence-edge"></div>', '<div data-hf-spatial-connector="case:evidence-edge"></div><button data-hf-spatial-portal="case:ledger-door"></button>');
    write(root, "compositions/worldboard.html", parentHtml);
    write(root, "compositions/ledger-detail.html", '<template><div data-composition-id="ledger-detail" data-width="1920" data-height="1080" data-duration="1" data-hf-spatial-canvas="ledger-detail"><div data-hf-spatial-world="ledger-detail"><div data-hf-spatial-region="ledger-detail:entry"></div><div data-hf-spatial-region="ledger-detail:account"></div><div data-hf-spatial-landmark="ledger-detail:entry-tab"></div><div data-hf-spatial-landmark="ledger-detail:account-pin"></div><div data-hf-spatial-connector="ledger-detail:ledger-edge"></div></div></div></template>\n');
    const index = fs.readFileSync(path.join(root, "index.html"), "utf8")
      .replace('<div data-composition-id="detail" data-composition-src="compositions/detail.html" data-start="4" data-duration="1.5" data-width="1920" data-height="1080" data-track-index="2"></div>', '<div data-hf-spatial-host="ledger-detail" data-composition-id="ledger-detail" data-composition-src="compositions/ledger-detail.html" data-start="4" data-duration="1" data-width="1920" data-height="1080" data-track-index="2"></div>');
    write(root, "index.html", index);
    const valid = run(CHECKER, root);
    assert.equal(valid.status, 0, valid.stdout + valid.stderr);

    parent.excursions[0].cutawayComposition = "compositions/./ledger-detail.html";
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const aliasedValid = run(CHECKER, root);
    assert.equal(aliasedValid.status, 0, aliasedValid.stdout + aliasedValid.stderr);

    plan.canvases[0].excursions[0].portalId = "missing-door";
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const unlinked = run(CHECKER, root);
    assert.notEqual(unlinked.status, 0);
    assert.match(unlinked.json.errors.join("\n"), /portalId must name a declared portal/);
  });
});

test("canonical manifest template passes when its declared compositions are mounted", () => {
  withProject((root) => {
    const plan = JSON.parse(fs.readFileSync(TEMPLATE, "utf8"));
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    write(root, "compositions/s2-s5-canvas.html", '<template><div data-composition-id="s2-s5-canvas" data-width="1920" data-height="1080" data-duration="20" data-hf-spatial-canvas="investigation"><div data-hf-spatial-world="investigation"><div data-hf-spatial-region="investigation:origin"></div><div data-hf-spatial-region="investigation:link"></div><div data-hf-spatial-landmark="investigation:origin-pin"></div><div data-hf-spatial-landmark="investigation:ledger-tab"></div><div data-hf-spatial-connector="investigation:evidence-path"></div></div></div></template>\n');
    write(root, "compositions/s3-detail.html", '<template><div data-composition-id="s3-detail" data-width="1920" data-height="1080" data-duration="5"></div></template>\n');
    write(root, "index.html", '<div data-composition-id="main" data-duration="20"><div data-hf-spatial-host="investigation" data-composition-id="s2-s5-canvas" data-composition-src="compositions/s2-s5-canvas.html" data-start="0" data-duration="20" data-width="1920" data-height="1080" data-track-index="1"></div><div data-composition-id="s3-detail" data-composition-src="compositions/s3-detail.html" data-start="5.6" data-duration="5" data-width="1920" data-height="1080" data-track-index="2"></div></div>\n');
    const result = run(CHECKER, root);
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });
});

test("checker rejects an itinerary pose that cannot see its declared region", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].visits[1].camera = { cx: 3400, cy: 1900, zoom: 1.2 };
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const result = run(CHECKER, root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /region origin is not visible/);
  });
});

test("checker ties viewport math to the marked root and mounted host dimensions", () => {
  withProject((root) => {
    makeValidProject(root);
    const world = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8")
      .replace('data-width="1920"', 'data-width="1280"');
    write(root, "compositions/worldboard.html", world);
    const rootMismatch = run(CHECKER, root);
    assert.notEqual(rootMismatch.status, 0);
    assert.match(rootMismatch.json.errors.join("\n"), /manifest viewport 1920×1080 must match composition root 1280×1080/);

    makeValidProject(root);
    const index = fs.readFileSync(path.join(root, "index.html"), "utf8")
      .replace('data-width="1920" data-height="1080" data-track-index="1"', 'data-width="1280" data-height="720" data-track-index="1"');
    write(root, "index.html", index);
    const hostMismatch = run(CHECKER, root);
    assert.notEqual(hostMismatch.status, 0);
    assert.match(hostMismatch.json.errors.join("\n"), /host data-width\/data-height must match manifest viewport/);
  });
});

test("checker enforces orient and synthesis overview semantics", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].visits[0].verb = "inspect";
    plan.canvases[0].visits[0].camera = { cx: 800, cy: 600, zoom: 2 };
    plan.canvases[0].visits.at(-1).verb = "hold";
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const result = run(CHECKER, root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /first visit must be an orient overview/);
    assert.match(result.json.errors.join("\n"), /orient overview must show at least two declared landmarks/);
    assert.match(result.json.errors.join("\n"), /final visit must be a synthesize overview/);
  });
});

test("final synthesis must carry a changed revision", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].visits.at(-1).revision = plan.canvases[0].visits[0].revision.toUpperCase();
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const result = run(CHECKER, root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /final synthesis revision must differ/);
  });
});

test("checker rejects an unowned dead hold after the final visit", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].visits.at(-1).duration = 1.5;
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const result = run(CHECKER, root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /final visit must cover the composition/);
  });
});

test("an earlier long visit cannot mask a short final synthesis", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].visits.find((visit) => visit.id === "inspect-origin").duration = 7;
    plan.canvases[0].visits.at(-1).duration = 1;
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const result = run(CHECKER, root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /final visit must cover the composition/);
  });
});

test("checker rejects an exact excursion that does not restore its departure pose", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].visits.find((visit) => visit.id === "return-origin").camera.cx += 20;
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const result = run(CHECKER, root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /exact return pose exceeds tolerance/);

    const unchanged = makeValidProject(root);
    const depart = unchanged.canvases[0].visits.find((visit) => visit.id === "inspect-origin");
    unchanged.canvases[0].visits.find((visit) => visit.id === "return-origin").revision = depart.revision.toUpperCase();
    writeJson(root, "SPATIAL_CANVAS.json", unchanged);
    const unchangedReturn = run(CHECKER, root);
    assert.notEqual(unchangedReturn.status, 0);
    assert.match(unchangedReturn.json.errors.join("\n"), /return visit revision must differ/);
  });
});

test("visit review samples cannot be hidden by an excursion clip", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].visits.find((visit) => visit.id === "inspect-origin").reviewAt = 4.5;
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const result = run(CHECKER, root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /visit reviewAt must lie outside excursion/);
  });
});

test("checker rejects duplicate world ownership and uncovered external cutaways", () => {
  withProject((root) => {
    makeValidProject(root);
    write(root, "compositions/duplicate.html", '<div data-hf-spatial-canvas="case"><div data-hf-spatial-world="case"></div></div>\n');
    const duplicate = run(CHECKER, root);
    assert.notEqual(duplicate.status, 0);
    assert.match(duplicate.json.errors.join("\n"), /one-owner invariant/);

    fs.rmSync(path.join(root, "compositions", "duplicate.html"));
    const index = fs.readFileSync(path.join(root, "index.html"), "utf8").replace('data-start="4" data-duration="1.5"', 'data-start="0" data-duration="1"');
    write(root, "index.html", index);
    const uncovered = run(CHECKER, root);
    assert.notEqual(uncovered.status, 0);
    assert.match(uncovered.json.errors.join("\n"), /exactly one native host covering the full excursion window/);
  });
});

test("root, world, and semantic markers follow the camera ownership topology", () => {
  withProject((root) => {
    makeValidProject(root);
    const original = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8");

    write(root, "compositions/worldboard.html", original
      .replace(' data-hf-spatial-world="case"', "")
      .replace("</template>", '<div data-hf-spatial-world="case"></div></template>'));
    const detachedWorld = run(CHECKER, root);
    assert.notEqual(detachedWorld.status, 0);
    assert.match(detachedWorld.json.errors.join("\n"), /world must be a live descendant/);

    write(root, "compositions/worldboard.html", original
      .replace('<div data-hf-spatial-connector="case:evidence-edge"></div>', "")
      .replace("    </div>\n  </div>", '    </div>\n    <div data-hf-spatial-connector="case:evidence-edge"></div>\n  </div>'));
    const detachedSemantic = run(CHECKER, root);
    assert.notEqual(detachedSemantic.status, 0);
    assert.match(detachedSemantic.json.errors.join("\n"), /connector marker must be a live descendant/);

    write(root, "compositions/worldboard.html", original
      .replace("<template>\n  <div", "<template>\n  <main>\n  <div")
      .replace("  </div>\n</template>", "  </div>\n  </main>\n</template>"));
    const nestedRoot = run(CHECKER, root);
    assert.notEqual(nestedRoot.status, 0);
    assert.match(nestedRoot.json.errors.join("\n"), /div composition root directly under exactly one top-level template/);
  });
});

test("world, semantic, portal, and excursion evidence cannot hide in inert descendants", () => {
  withProject((root) => {
    let plan = makeValidProject(root);
    let world = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8");
    write(root, "compositions/worldboard.html", world
      .replace('<div data-hf-spatial-world="case">', '<template><div data-hf-spatial-world="case">')
      .replace("    </div>\n  </div>", "    </div></template>\n  </div>"));
    const inertWorld = run(CHECKER, root);
    assert.notEqual(inertWorld.status, 0);
    assert.match(inertWorld.json.errors.join("\n"), /world must be a live descendant.*inert template\/noscript boundary/i);

    plan = makeValidProject(root);
    world = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8");
    write(root, "compositions/worldboard.html", world.replace(
      '<div data-hf-spatial-region="case:origin"></div>',
      '<template><div data-hf-spatial-region="case:origin"></div></template>',
    ));
    const inertRegion = run(CHECKER, root);
    assert.notEqual(inertRegion.status, 0);
    assert.match(inertRegion.json.errors.join("\n"), /region marker must be a live descendant.*inert template\/noscript boundary/i);

    plan = makeValidProject(root);
    plan.canvases[0].portals = [{
      id: "door", region: "origin", targetCanvas: "child", purpose: "Enter a nested evidence world through the origin artifact.",
    }];
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    world = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8");
    write(root, "compositions/worldboard.html", world.replace(
      '<div data-hf-spatial-region="case:origin"></div>',
      '<div data-hf-spatial-region="case:origin"></div><template data-hf-spatial-portal="case:door"></template>',
    ));
    const inertPortal = run(CHECKER, root);
    assert.notEqual(inertPortal.status, 0);
    assert.match(inertPortal.json.errors.join("\n"), /portal marker must be a live descendant.*inert template\/noscript boundary/i);

    plan = makeValidProject(root);
    delete plan.canvases[0].excursions[0].cutawayComposition;
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    world = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8");
    write(root, "compositions/worldboard.html", world.replace(
      "    </div>\n  </div>",
      '    </div>\n    <template class="clip" data-start="4" data-duration="1" data-track-index="2" data-hf-spatial-excursion="case:dossier" data-hf-spatial-space="view"></template>\n  </div>',
    ));
    const inertExcursion = run(CHECKER, root);
    assert.notEqual(inertExcursion.status, 0);
    assert.match(inertExcursion.json.errors.join("\n"), /inline excursion marker must be live composition content.*inert template\/noscript boundary/i);
  });
});

test("raw-text and RCDATA containers cannot supply Spatial Canvas DOM", () => {
  withProject((root) => {
    const containers = ["script", "style", "textarea", "title", "iframe", "xmp", "noembed", "noframes", "noscript", "plaintext"];
    for (const container of containers) {
      makeValidProject(root);
      const world = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8");
      write(root, "compositions/worldboard.html", world
        .replace('<div data-hf-spatial-world="case">', `<${container}><div data-hf-spatial-world="case">`)
        .replace("    </div>\n  </div>", `    </div></${container}>\n  </div>`));
      const result = run(CHECKER, root);
      assert.notEqual(result.status, 0, `${container} unexpectedly supplied a spatial world`);
      assert.match(result.json.errors.join("\n"), /must contain exactly one data-hf-spatial-world="case" marker \(found 0\)/i);

      const inertIndex = `<div data-composition-id="main"><${container}><div data-hf-spatial-host="case" data-start="0" data-track-index="1"></div></${container}></div>`;
      assert.throws(
        () => spatialHostStart(inertIndex, "case", "sequence", "compositions/world.html"),
        /no data-hf-spatial-host/i,
        `${container} unexpectedly supplied a route-sampling host`,
      );
    }

    assert.throws(
      () => spatialHostStart('<div data-composition-id="main"><template><div data-hf-spatial-host="case" data-start="0" data-track-index="1"></div></template></div>', "case", "sequence", "compositions/world.html"),
      /no data-hf-spatial-host/i,
    );
  });
});

test("composition walking and declared cutaways reject escaping symlinks", { skip: process.platform === "win32" }, () => {
  withProject((root) => {
    makeValidProject(root);
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "hf-spatial-external-compositions-"));
    try {
      fs.cpSync(path.join(root, "compositions"), outside, { recursive: true });
      fs.rmSync(path.join(root, "compositions"), { recursive: true });
      fs.symlinkSync(outside, path.join(root, "compositions"), "dir");
      const result = run(CHECKER, root);
      assert.notEqual(result.status, 0);
      assert.match(result.json.errors.join("\n"), /compositions must be a regular non-symlink directory physically contained/i);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });

  withProject((root) => {
    makeValidProject(root);
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "hf-spatial-external-cutaway-"));
    try {
      const externalCutaway = path.join(outside, "detail.html");
      fs.copyFileSync(path.join(root, "compositions", "detail.html"), externalCutaway);
      fs.unlinkSync(path.join(root, "compositions", "detail.html"));
      fs.symlinkSync(externalCutaway, path.join(root, "compositions", "detail.html"));
      const result = run(CHECKER, root);
      assert.notEqual(result.status, 0);
      const detail = result.json.errors.join("\n");
      assert.match(detail, /compositions\/detail\.html must not be a symlink|cutawayComposition must be a regular non-symlink file physically contained/i);
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});

test("spatial and cutaway roots use one live div directly under one top-level template", () => {
  withProject((root) => {
    makeValidProject(root);
    const world = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8");

    write(root, "compositions/worldboard.html", world
      .replace('<div data-composition-id="worldboard"', '<section data-composition-id="worldboard"')
      .replace("  </div>\n</template>", "  </section>\n</template>"));
    const nonDiv = run(CHECKER, root);
    assert.notEqual(nonDiv.status, 0);
    assert.match(nonDiv.json.errors.join("\n"), /one div composition root directly under exactly one top-level template/i);

    write(root, "compositions/worldboard.html", world
      .replace("<template>\n", "<template>\n  <template>\n")
      .replace("</template>\n", "  </template>\n</template>\n"));
    const nestedTemplate = run(CHECKER, root);
    assert.notEqual(nestedTemplate.status, 0);
    assert.match(nestedTemplate.json.errors.join("\n"), /not a nested template or element/i);

    write(root, "compositions/worldboard.html", `${world}<template><div data-composition-id="extra"></div></template>\n`);
    const duplicateTemplate = run(CHECKER, root);
    assert.notEqual(duplicateTemplate.status, 0);
    assert.match(duplicateTemplate.json.errors.join("\n"), /exactly one top-level template/i);

    makeValidProject(root);
    const cutaway = fs.readFileSync(path.join(root, "compositions", "detail.html"), "utf8");
    for (const invalidCutaway of [
      cutaway.replace("<div ", "<section ").replace("</div>", "</section>"),
      cutaway.replace("<template>", "<template><template>").replace("</template>", "</template></template>"),
      `${cutaway}<template><div data-composition-id="extra"></div></template>`,
    ]) {
      write(root, "compositions/detail.html", invalidCutaway);
      const result = run(CHECKER, root);
      assert.notEqual(result.status, 0);
      assert.match(result.json.errors.join("\n"), /external cutaway .* one live div composition root directly under exactly one top-level template/i);
    }
  });
});

test("an index-owned Spatial Canvas root is one live top-level div", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].scope = "scene";
    plan.canvases[0].composition = "index.html";
    write(root, "compositions/worldboard.html", '<template><div data-composition-id="worldboard" data-duration="9"></div></template>\n');
    const liveIndex = '<div data-composition-id="main" data-width="1920" data-height="1080" data-duration="9" data-hf-spatial-canvas="case"><div data-hf-spatial-world="case"><div data-hf-spatial-region="case:origin"></div><div data-hf-spatial-region="case:link"></div><div data-hf-spatial-landmark="case:origin-pin"></div><div data-hf-spatial-landmark="case:link-tab"></div><div data-hf-spatial-connector="case:evidence-edge"></div></div><div data-composition-id="detail" data-composition-src="compositions/detail.html" data-start="4" data-duration="1.5" data-width="1920" data-height="1080" data-track-index="2"></div></div>\n';
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    write(root, "index.html", liveIndex);
    assert.equal(run(CHECKER, root).status, 0);

    for (const tag of ["template", "main"]) {
      write(root, "index.html", liveIndex
        .replace(/^<div /, `<${tag} `)
        .replace(/<\/div>\n$/, `</${tag}>\n`));
      const result = run(CHECKER, root);
      assert.notEqual(result.status, 0);
      assert.match(result.json.errors.join("\n"), /sole live top-level div composition root/i);
    }
  });
});

test("native hosts require exact ids, explicit numerics, and one external covering owner", () => {
  withProject((root) => {
    makeValidProject(root);
    let index = fs.readFileSync(path.join(root, "index.html"), "utf8")
      .replace('data-composition-id="worldboard"', 'data-composition-id="wrong-world"');
    write(root, "index.html", index);
    const wrongId = run(CHECKER, root);
    assert.notEqual(wrongId.status, 0);
    assert.match(wrongId.json.errors.join("\n"), /host data-composition-id must equal/);

    makeValidProject(root);
    index = fs.readFileSync(path.join(root, "index.html"), "utf8")
      .replace('data-hf-spatial-host="case" data-composition-id="worldboard" data-composition-src="compositions/worldboard.html" data-start="0"', 'data-hf-spatial-host="case" data-composition-id="worldboard" data-composition-src="compositions/worldboard.html" data-start=""');
    write(root, "index.html", index);
    const emptyStart = run(CHECKER, root);
    assert.notEqual(emptyStart.status, 0);
    assert.match(emptyStart.json.errors.join("\n"), /data-start must be finite/);

    makeValidProject(root);
    index = fs.readFileSync(path.join(root, "index.html"), "utf8")
      .replace(/\n<\/div>\n$/, '\n  <div data-composition-id="detail" data-composition-src="compositions/detail.html" data-start="4" data-duration="1.5" data-width="1920" data-height="1080" data-track-index="3"></div>\n</div>\n');
    write(root, "index.html", index);
    const duplicateCover = run(CHECKER, root);
    assert.notEqual(duplicateCover.status, 0);
    assert.match(duplicateCover.json.errors.join("\n"), /exactly one native host covering/);

    makeValidProject(root);
    index = fs.readFileSync(path.join(root, "index.html"), "utf8")
      .replace('data-composition-id="detail" data-composition-src="compositions/detail.html" data-start="4" data-duration="1.5" data-width="1920"', 'data-composition-id="detail" data-composition-src="compositions/detail.html" data-start="4" data-duration="1.5"');
    write(root, "index.html", index);
    const missingDimensions = run(CHECKER, root);
    assert.notEqual(missingDimensions.status, 0);
    assert.match(missingDimensions.json.errors.join("\n"), /matching finite positive data-width/);
  });
});

test("checker rejects using the persistent canvas as its own cutaway", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].excursions[0].cutawayComposition = plan.canvases[0].composition;
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const result = run(CHECKER, root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /cutawayComposition must be distinct/);

    plan.canvases[0].excursions[0].cutawayComposition = "compositions/./worldboard.html";
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const aliased = run(CHECKER, root);
    assert.notEqual(aliased.status, 0);
    assert.match(aliased.json.errors.join("\n"), /cutawayComposition must be distinct/);
  });
});

test("inline excursions require one direct native clip with the exact local window", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    delete plan.canvases[0].excursions[0].cutawayComposition;
    writeJson(root, "SPATIAL_CANVAS.json", plan);

    const missing = run(CHECKER, root);
    assert.notEqual(missing.status, 0);
    assert.match(missing.json.errors.join("\n"), /inline excursion requires exactly one/);

    write(root, "compositions/detail.html", '<template><div data-composition-id="detail" data-duration="1.5"><div id="wrong-owner" class="clip" data-start="4" data-duration="1" data-track-index="2" data-hf-spatial-excursion="case:dossier" data-hf-spatial-space="view"></div></div></template>\n');
    const wrongOwner = run(CHECKER, root);
    assert.notEqual(wrongOwner.status, 0);
    assert.match(wrongOwner.json.errors.join("\n"), /in compositions\/worldboard\.html/);

    write(root, "compositions/detail.html", '<template><div data-composition-id="detail" data-duration="1.5"></div></template>\n');
    const source = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8")
      .replace("    </div>\n  </div>", '    </div>\n    <div id="dossier" class="clip" data-start="4.25" data-duration="1" data-track-index="2" data-hf-spatial-excursion="case:dossier" data-hf-spatial-space="view"></div>\n  </div>');
    write(root, "compositions/worldboard.html", source);
    const wrongWindow = run(CHECKER, root);
    assert.notEqual(wrongWindow.status, 0);
    assert.match(wrongWindow.json.errors.join("\n"), /must exactly match manifest window/);

    write(root, "compositions/worldboard.html", source.replace('data-start="4.25"', 'DATA-START=0 data-start="4"'));
    const duplicateTiming = run(CHECKER, root);
    assert.notEqual(duplicateTiming.status, 0);
    assert.match(duplicateTiming.json.errors.join("\n"), /duplicate Spatial Canvas contract attribute/);

    write(root, "compositions/worldboard.html", source.replace('data-start="4.25"', 'data-start="4"'));
    const valid = run(CHECKER, root);
    assert.equal(valid.status, 0, valid.stdout + valid.stderr);
  });
});

test("host markers live only in index and nested canvas cutaways require a portal", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    const source = fs.readFileSync(path.join(root, "compositions", "worldboard.html"), "utf8")
      .replace("    </div>\n  </div>", '    </div>\n    <div data-hf-spatial-host="case"></div>\n  </div>');
    write(root, "compositions/worldboard.html", source);
    const strayHost = run(CHECKER, root);
    assert.notEqual(strayHost.status, 0);
    assert.match(strayHost.json.errors.join("\n"), /may appear only in index\.html/);

    makeValidProject(root);
    plan.canvases.push({ ...plan.canvases[0], id: "child", composition: "compositions/child.html", excursions: [] });
    plan.canvases[0].excursions[0].cutawayComposition = "compositions/child.html";
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    write(root, "compositions/child.html", '<template><div data-composition-id="child" data-width="1920" data-height="1080" data-duration="9" data-hf-spatial-canvas="child"><div data-hf-spatial-world="child"><div data-hf-spatial-region="child:origin"></div><div data-hf-spatial-region="child:link"></div><div data-hf-spatial-landmark="child:origin-pin"></div><div data-hf-spatial-landmark="child:link-tab"></div><div data-hf-spatial-connector="child:evidence-edge"></div></div></div></template>\n');
    const index = fs.readFileSync(path.join(root, "index.html"), "utf8")
      .replace(/\n<\/div>\n$/, '<div data-hf-spatial-host="child" data-composition-id="child" data-composition-src="compositions/child.html" data-start="4" data-duration="1" data-width="1920" data-height="1080" data-track-index="3"></div>\n</div>\n');
    write(root, "index.html", index);
    const missingPortal = run(CHECKER, root);
    assert.notEqual(missingPortal.status, 0);
    assert.match(missingPortal.json.errors.join("\n"), /nested-canvas excursions require portalId/);
  });
});

test("checker reports a null manifest as structured validation failure", () => {
  withProject((root) => {
    write(root, "SPATIAL_CANVAS.json", "null\n");
    const result = run(CHECKER, root);
    assert.notEqual(result.status, 0);
    assert.match(result.json.errors.join("\n"), /root must be an object/);
  });
});

test("scene mounts offset visit and excursion review samples to global time", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].scope = "scene";
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const index = fs.readFileSync(path.join(root, "index.html"), "utf8").replace('data-start="0" data-duration="9"', 'data-start="12" data-duration="9"');
    write(root, "index.html", index);
    assert.deepEqual(spatialReviewTimes(root), [13, 15.5, 16.5, 17.75, 19.8]);
  });
});

test("only an index-owned scene canvas may omit a host marker", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].scope = "scene";
    plan.canvases[0].composition = ".\\index.html";
    write(root, "compositions/worldboard.html", '<template><div data-composition-id="worldboard" data-duration="9"></div></template>\n');
    write(root, "index.html", '<div data-composition-id="main" data-width="1920" data-height="1080" data-duration="9" data-hf-spatial-canvas="case"><div data-hf-spatial-world="case"><div data-hf-spatial-region="case:origin"></div><div data-hf-spatial-region="case:link"></div><div data-hf-spatial-landmark="case:origin-pin"></div><div data-hf-spatial-landmark="case:link-tab"></div><div data-hf-spatial-connector="case:evidence-edge"></div></div><div data-composition-id="detail" data-composition-src="compositions/detail.html" data-start="4" data-duration="1.5" data-width="1920" data-height="1080" data-track-index="2"></div></div>\n');
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const result = run(CHECKER, root);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(spatialReviewTimes(root)[0], 1);

    plan.canvases[0].scope = "sequence";
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    const recursiveIndex = fs.readFileSync(path.join(root, "index.html"), "utf8")
      .replace("</div>\n", '<div data-hf-spatial-host="case" data-composition-id="main-recursive" data-composition-src="index.html" data-start="0" data-duration="9" data-width="1920" data-height="1080" data-track-index="3"></div></div>\n');
    write(root, "index.html", recursiveIndex);
    const recursive = run(CHECKER, root);
    assert.notEqual(recursive.status, 0);
    assert.match(recursive.json.errors.join("\n"), /only scope "scene" may own index\.html/);
  });
});

test("route tools reject malformed nested routes without raw exceptions", () => {
  withProject((root) => {
    const plan = makeValidProject(root);
    plan.canvases[0].visits = {};
    writeJson(root, "SPATIAL_CANVAS.json", plan);
    write(root, "DIRECTION.md", directionLog(true));
    assert.throws(() => spatialReviewTimes(root), /visits must be an array/);
    const gated = run(GATE, root);
    assert.notEqual(gated.status, 0);
    assert.equal(gated.json.results.find((item) => item.id === "spatial_canvas").status, "fail");

    const negative = makeValidProject(root);
    negative.canvases[0].visits[0].reviewAt = -1;
    writeJson(root, "SPATIAL_CANVAS.json", negative);
    assert.throws(() => spatialReviewTimes(root), /reviewAt must be finite and non-negative/);
  });
});

test("ambition gate discovers mounted world files and requires every route review row", () => {
  withProject((root) => {
    makeValidProject(root);
    write(root, "DIRECTION.md", directionLog(true));
    const passing = run(GATE, root);
    assert.equal(passing.status, 0, passing.stdout + passing.stderr);
    const spatial = passing.json.results.find((item) => item.id === "spatial_canvas");
    const registers = passing.json.results.find((item) => item.id === "registers");
    assert.equal(spatial.status, "pass");
    assert.match(registers.detail, /spatial-canvas/);

    write(root, "DIRECTION.md", directionLog(false));
    const failing = run(GATE, root);
    assert.notEqual(failing.status, 0);
    const failedSpatial = failing.json.results.find((item) => item.id === "spatial_canvas");
    assert.equal(failedSpatial.status, "fail");
    assert.match(failedSpatial.detail, /route review row.*missing/i);

    const headerPlan = makeValidProject(root);
    headerPlan.canvases[0].id = "canvas";
    headerPlan.canvases[0].visits[0].id = "visit";
    writeJson(root, "SPATIAL_CANVAS.json", headerPlan);
    for (const file of ["index.html", "compositions/worldboard.html"]) {
      write(root, file, fs.readFileSync(path.join(root, file), "utf8").replaceAll("case", "canvas"));
    }
    const headerOnly = directionLog(true)
      .replace(/\| case:orient \|[^\n]*\n/, "")
      .replaceAll("case:", "canvas:");
    write(root, "DIRECTION.md", headerOnly);
    const headerResult = run(GATE, root);
    assert.notEqual(headerResult.status, 0);
    const headerSpatial = headerResult.json.results.find((item) => item.id === "spatial_canvas");
    assert.equal(headerSpatial.status, "fail");
    assert.match(headerSpatial.detail, /canvas:visit/);

    write(root, "DIRECTION.md", `${headerOnly}\n| canvas:visit | orientation clear | one focus | spatial proof: opening map reviewed | protect |\n`);
    const legitimateSameKey = run(GATE, root);
    assert.equal(legitimateSameKey.status, 0, legitimateSameKey.stdout + legitimateSameKey.stderr);
  });
});

test("faceless timing sync and assembler preserve one mounted nonzero-start canvas", () => {
  withProject((root) => {
    write(root, "STORYBOARD.md", `---
format: landscape
---

## Frame 1: Hook
- duration: 2s
- status: animated
- src: compositions/frames/01-hook.html

## Frame 2: Board
- duration: 8.1234s
- status: animated
- src: compositions/frames/02-board.html
- canvas_id: fraud-board
`);
    write(root, "compositions/frames/01-hook.html", '<template><div data-composition-id="01-hook" data-duration="2"></div></template>\n');
    write(root, "compositions/frames/02-board.html", '<template><div data-composition-id="02-board" data-width="1920" data-height="1080" data-duration="8.123" data-hf-spatial-canvas="fraud-board"><div data-hf-spatial-world="fraud-board"><div data-hf-spatial-region="fraud-board:supplier"></div><div data-hf-spatial-region="fraud-board:shell"></div><div data-hf-spatial-landmark="fraud-board:supplier-pin"></div><div data-hf-spatial-landmark="fraud-board:shell-tab"></div><div data-hf-spatial-connector="fraud-board:payment-edge"></div></div><div id="invoice-excursion" class="clip" data-start="3.2492" data-duration="1.6246" data-track-index="2" data-hf-spatial-excursion="fraud-board:invoice" data-hf-spatial-space="view"><div></div></div></div></template>\n');
    const plan = {
      $schema: "hf-spatial-canvas/v1",
      canvases: [{
        id: "fraud-board", scope: "scene", backend: "dom-transform",
        composition: "compositions/frames/02-board.html",
        spatialThesis: "The route proves the supplier and shell account are one system.",
        viewport: { width: 1920, height: 1080, focusX: 960, focusY: 480 },
        world: { width: 4000, height: 2400 },
        regions: [
          { id: "supplier", x: 400, y: 300, width: 800, height: 600, anchorX: 800, anchorY: 600, claim: "Supplier evidence" },
          { id: "shell", x: 2600, y: 1200, width: 900, height: 650, anchorX: 3000, anchorY: 1500, claim: "Shell-account evidence" },
        ],
        landmarks: [
          { id: "supplier-pin", x: 800, y: 600, purpose: "Keeps the supplier cluster recognizable." },
          { id: "shell-tab", x: 3000, y: 1500, purpose: "Keeps the account cluster recognizable." },
        ],
        connectors: [{ id: "payment-edge", type: "evidentiary", from: "supplier", to: "shell", meaning: "The invoice resolves to the shell account." }],
        lod: { overview: "Regions and edge remain legible.", regional: "Hero artifacts and headings remain legible.", detail: "Invoice annotations become readable after arrival." },
        visits: [
          { id: "orient", at: 0, duration: 2, region: null, camera: { cx: 2000, cy: 1200, zoom: 0.4 }, verb: "orient", purpose: "Establish the board.", revision: "open", reviewAt: 1 },
          { id: "inspect", at: 2, duration: 2, region: "supplier", camera: { cx: 800, cy: 600, zoom: 1 }, verb: "inspect", purpose: "Read the invoice.", revision: "found", reviewAt: 3 },
          { id: "return", at: 6, duration: 1, region: "supplier", camera: { cx: 800, cy: 600, zoom: 1 }, verb: "rejoin", purpose: "Restore the anchor.", revision: "annotated", reviewAt: 6.5 },
          { id: "synthesis", at: 7, duration: 3, region: null, camera: { cx: 2000, cy: 1200, zoom: 0.4 }, verb: "synthesize", purpose: "Reveal the whole.", revision: "resolved", reviewAt: 8.5 },
        ],
        excursions: [{ id: "invoice", at: 4, duration: 2, departVisit: "inspect", returnVisit: "return", reviewAt: 5, returnMode: "exact", returnMutation: "The shell-account edge appears." }],
      }],
    };
    writeJson(root, "SPATIAL_CANVAS.json", plan);

    const synced = spawnSync(process.execPath, [SYNC, "--storyboard", "STORYBOARD.md", "--manifest", "SPATIAL_CANVAS.json"], { cwd: root, encoding: "utf8" });
    assert.equal(synced.status, 0, synced.stdout + synced.stderr);
    const updated = JSON.parse(fs.readFileSync(path.join(root, "SPATIAL_CANVAS.json"), "utf8"));
    const canvas = updated.canvases[0];
    assert.equal(Math.max(...canvas.visits.map((visit) => visit.at + visit.duration)), 8.123);
    assert.equal(canvas.excursions[0].at, 3.2492);
    assert.equal(canvas.excursions[0].duration, 1.6246);
    assert.equal(canvas.excursions[0].reviewAt, 4.0615);

    const assembled = spawnSync(process.execPath, [ASSEMBLER, "--storyboard", "STORYBOARD.md", "--hyperframes", root], { cwd: root, encoding: "utf8" });
    assert.equal(assembled.status, 0, assembled.stdout + assembled.stderr);
    const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
    assert.match(index, /data-hf-spatial-host="fraud-board"/);
    assert.match(index, /data-hf-spatial-host="fraud-board"[\s\S]*data-start="2"/);
    assert.match(index, /data-hf-spatial-host="fraud-board"[\s\S]*data-duration="8\.123"/);
    assert.match(fs.readFileSync(path.join(root, "compositions", "frames", "02-board.html"), "utf8"), /data-hf-spatial-excursion="fraud-board:invoice"/);
    const checked = run(CHECKER, root);
    assert.equal(checked.status, 0, checked.stdout + checked.stderr);
    assert.equal(spatialReviewTimes(root)[0], 2.8123);

    canvas.excursions = {};
    writeJson(root, "SPATIAL_CANVAS.json", updated);
    const malformed = spawnSync(process.execPath, [SYNC, "--storyboard", "STORYBOARD.md", "--manifest", "SPATIAL_CANVAS.json"], { cwd: root, encoding: "utf8" });
    assert.notEqual(malformed.status, 0);
    assert.match(malformed.stderr, /excursions must be an array/);
    assert.doesNotMatch(malformed.stderr, /TypeError|at sync-spatial-canvas/);

    canvas.visits = [null];
    canvas.excursions = [];
    writeJson(root, "SPATIAL_CANVAS.json", updated);
    const nullVisit = spawnSync(process.execPath, [SYNC, "--storyboard", "STORYBOARD.md", "--manifest", "SPATIAL_CANVAS.json"], { cwd: root, encoding: "utf8" });
    assert.notEqual(nullVisit.status, 0);
    assert.match(nullVisit.stderr, /every visit must be an object/);
    assert.doesNotMatch(nullVisit.stderr, /TypeError|at sync-spatial-canvas/);

    canvas.visits = plan.canvases[0].visits;
    canvas.excursions = [null];
    writeJson(root, "SPATIAL_CANVAS.json", updated);
    const nullExcursion = spawnSync(process.execPath, [SYNC, "--storyboard", "STORYBOARD.md", "--manifest", "SPATIAL_CANVAS.json"], { cwd: root, encoding: "utf8" });
    assert.notEqual(nullExcursion.status, 0);
    assert.match(nullExcursion.stderr, /every excursion must be an object/);
    assert.doesNotMatch(nullExcursion.stderr, /TypeError|at sync-spatial-canvas/);
  });
});

test("encoded-master spatial review works without a scene plan and honors start offset", () => {
  withProject((root) => {
    makeValidProject(root);
    const video = path.join(root, "master.mp4");
    const encoded = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=black:s=160x90:r=2:d=11", "-c:v", "mpeg4", "-pix_fmt", "yuv420p", video], { encoding: "utf8" });
    assert.equal(encoded.status, 0, encoded.stdout + encoded.stderr);
    const reviewed = spawnSync(process.execPath, [REVIEW_MASTER, "--root", root, "--video", "master.mp4", "--spatial", "--start-offset", "2", "--out", "review/spatial"], { cwd: root, encoding: "utf8" });
    assert.equal(reviewed.status, 0, reviewed.stdout + reviewed.stderr);
    const report = JSON.parse(fs.readFileSync(path.join(root, "review", "spatial", "review-manifest.json"), "utf8"));
    assert.deepEqual(report.groups, []);
    assert.deepEqual(report.extraFrames.map((frame) => frame.timeSec), [3, 5.5, 6.5, 7.75, 9.8]);
  });
});

function makeValidProject(root) {
  write(root, "index.html", `
<div data-composition-id="main" data-duration="9">
  <div data-hf-spatial-host="case" data-composition-id="worldboard" data-composition-src="compositions/worldboard.html" data-start="0" data-duration="9" data-width="1920" data-height="1080" data-track-index="1"></div>
  <div data-composition-id="detail" data-composition-src="compositions/detail.html" data-start="4" data-duration="1.5" data-width="1920" data-height="1080" data-track-index="2"></div>
</div>\n`);
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
</template>\n`);
  write(root, "compositions/detail.html", '<template><div data-composition-id="detail" data-width="1920" data-height="1080" data-duration="1.5"></div></template>\n');
  const plan = {
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
      lod: { overview: "Both regions and their edge remain legible.", regional: "Cluster headings and hero evidence remain legible.", detail: "Artifact annotations become readable after arrival." },
      visits: [
        { id: "orient", at: 0, duration: 2, region: null, camera: { cx: 2000, cy: 1200, zoom: 0.4 }, verb: "orient", purpose: "Establish both landmarks.", revision: "open", reviewAt: 1 },
        { id: "inspect-origin", at: 2, duration: 3, region: "origin", camera: { cx: 800, cy: 600, zoom: 1 }, verb: "inspect", purpose: "Read the initiating evidence.", revision: "origin-confirmed", reviewAt: 3.5 },
        { id: "return-origin", at: 5, duration: 1.5, region: "origin", camera: { cx: 800, cy: 600, zoom: 1 }, verb: "rejoin", purpose: "Restore the exact anchor.", revision: "origin-annotated", reviewAt: 5.75 },
        { id: "synthesis", at: 6.5, duration: 2.5, region: null, camera: { cx: 2000, cy: 1200, zoom: 0.4 }, verb: "synthesize", purpose: "Reveal the changed whole.", revision: "resolved", reviewAt: 7.8 },
      ],
      excursions: [{ id: "dossier", at: 4, duration: 1, cutawayComposition: "compositions/detail.html", departVisit: "inspect-origin", returnVisit: "return-origin", reviewAt: 4.5, returnMode: "exact", returnMutation: "Confirmed edge appears." }],
    }],
  };
  writeJson(root, "SPATIAL_CANVAS.json", plan);
  return plan;
}

function directionLog(includeAllVisits) {
  return `# Direction

## Spatial-canvas review

| canvas:visit | orientation + landmark | focal hierarchy | spatial proof + revision | result |
| --- | --- | --- | --- | --- |
| case:orient | orientation clear | one focus | spatial proof: map opens | protect |
| case:inspect-origin | landmark retained | evidence readable | spatial proof: origin confirmed | protect |
| case:excursion-dossier | anchor retained | proof readable | spatial proof: confirmed edge to integrate | protect |
| case:return-origin | orientation restored | anchor matches | spatial proof: mutation integrated | protect |
${includeAllVisits ? "| case:synthesis | orientation restored | relationship leads | spatial proof: resolved revision | protect |" : ""}

WAIVER: direction — fixture omits anchor-direction prose.
WAIVER: opening — fixture omits a narrated cold open.
WAIVER: audit — fixture isolates the Spatial Canvas gate.
WAIVER: bgm — fixture has no rendered audio.
`;
}

function run(script, root) {
  const result = spawnSync(process.execPath, [script, "--root", root, "--json"], { encoding: "utf8" });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, json: JSON.parse(result.stdout) };
}

function withProject(callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hf-spatial-canvas-"));
  try { callback(root); }
  finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())));
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function write(root, rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
function writeJson(root, rel, value) { write(root, rel, `${JSON.stringify(value, null, 2)}\n`); }
