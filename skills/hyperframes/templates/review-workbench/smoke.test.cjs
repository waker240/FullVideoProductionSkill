'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { once } = require('node:events');
const { start } = require('./server.cjs');

test('isolated workbench: media, persistent review, conflicts, import and immutable editions', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'review-workbench-test-'));
  const publicDir = path.join(root, 'public');
  const editionDir = path.join(publicDir, 'editions', 'r1');
  fs.mkdirSync(editionDir, { recursive: true });
  for (const name of ['index.html', 'review.js', 'review.css']) fs.copyFileSync(path.join(__dirname, name), path.join(publicDir, name));
  const source = Buffer.from('0123456789abcdef');
  fs.writeFileSync(path.join(editionDir, 'A.mp4'), source);
  fs.writeFileSync(path.join(editionDir, 'B.mp4'), source);
  fs.writeFileSync(path.join(editionDir, 'click.wav'), source);
  fs.writeFileSync(path.join(root, 'private.json'), '{"secret":"test-only"}');
  const manifest = { schema: 1, projectId: 'fixture', edition: 'r1', title: 'Fixture', items: [
    { id: 'shot01', kind: 'scene', title: 'Scene', variants: [{ id: 'A', version: 'v1', kind: 'video', src: 'editions/r1/A.mp4' }, { id: 'B', version: 'v1', kind: 'video', src: 'editions/r1/B.mp4' }] },
    { id: 'sfx01', kind: 'audio', title: 'Click', variants: [{ id: 'audio', version: 'v1', kind: 'audio', src: 'editions/r1/click.wav' }] }
  ] };
  const manifestFile = path.join(publicDir, 'manifest.json');
  fs.writeFileSync(manifestFile, JSON.stringify(manifest));
  let server;
  async function launch() { server = start({ root, port: 0 }); await once(server, 'listening'); return `http://127.0.0.1:${server.address().port}`; }
  async function close() { if (server?.listening) { const done = once(server, 'close'); server.close(); server.closeAllConnections(); await done; } }
  try {
    let origin = await launch();
    const manifestResult = await (await fetch(origin + '/manifest.json')).json();
    const common = { edition: 'r1', manifestHash: manifestResult.manifestHash };
    const get = async () => (await fetch(origin + '/api/review')).json();
    async function post(body, route = '/api/review', suppliedOrigin = origin) { const response = await fetch(origin + route, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: suppliedOrigin }, body: JSON.stringify(body) }); return { status: response.status, data: await response.json() }; }
    assert.equal((await get()).revision, 0);
    assert.throws(() => start({ root, port: 0 }), /EEXIST/);
    assert.equal((await fetch(origin + '/')).status, 200);
    assert.equal((await fetch(origin + '/private.json')).status, 404);
    assert.equal((await fetch(origin + '/feedback/review-state.json')).status, 404);
    assert.equal((await fetch(origin + '/%2e%2e%5cprivate.json')).status, 404);
    const head = await fetch(origin + '/editions/r1/A.mp4', { method: 'HEAD' });
    assert.equal(head.headers.get('content-length'), '16'); assert.equal((await head.arrayBuffer()).byteLength, 0);
    const ranged = await fetch(origin + '/editions/r1/A.mp4', { headers: { Range: 'bytes=4-7' } });
    assert.equal(ranged.status, 206); assert.equal(ranged.headers.get('content-range'), 'bytes 4-7/16'); assert.equal(await ranged.text(), '4567');
    assert.equal(await (await fetch(origin + '/editions/r1/A.mp4', { headers: { Range: 'bytes=-3' } })).text(), 'def');
    assert.equal(await (await fetch(origin + '/editions/r1/A.mp4', { headers: { Range: 'bytes=12-' } })).text(), 'cdef');
    assert.equal((await fetch(origin + '/editions/r1/A.mp4', { headers: { Range: 'bytes=16-' } })).status, 416);
    assert.equal((await fetch(origin + '/editions/r1/A.mp4', { headers: { Range: 'bytes=0-1,4-5' } })).status, 416);
    const first = { ...common, id: 'shot01', choice: 'A', notes: 'Keep the causal reveal', baseVersion: 0, requestId: 'first-request' };
    const competing = { ...first, choice: 'B', notes: 'Other browser draft', requestId: 'other-request' };
    const [a, b] = await Promise.all([post(first), post(competing)]);
    assert.deepEqual([a.status, b.status].sort(), [200, 409]);
    const accepted = a.status === 200 ? first : competing;
    const acceptedResult = a.status === 200 ? a : b;
    assert.equal(acceptedResult.data.entries.shot01.version, 1);
    const retry = await post(accepted); assert.equal(retry.status, 200); assert.equal(retry.data.replayed, true); assert.equal((await get()).revision, 1);
    assert.equal((await post({ ...accepted, notes: 'Different request body' })).status, 409);
    assert.equal((await post({ ...common, id: 'sfx01', choice: 'favorite', notes: '', baseVersion: 0, requestId: 'audio-request' })).status, 200);
    const importBody = { ...common, requestId: 'import-request', entries: [{ id: 'shot01', choice: 'both', notes: 'Keep two', baseVersion: 1 }, { id: 'sfx01', choice: 'reject', notes: 'Stale', baseVersion: 0 }] };
    assert.equal((await post(importBody, '/api/import')).status, 409); assert.equal((await get()).items.shot01.version, 1);
    importBody.entries[1].baseVersion = 1;
    assert.equal((await post(importBody, '/api/import')).status, 200);
    assert.equal((await get()).items.shot01.choice, 'both'); assert.equal((await get()).items.sfx01.choice, 'reject');
    assert.equal((await post(accepted)).data.replayed, true); assert.equal((await get()).items.shot01.version, 2); // Old retry never reverts newer data.
    assert.equal((await post({ ...common, id: 'shot01', choice: 'favorite', notes: '', baseVersion: 2, requestId: 'invalid-choice' })).status, 400);
    assert.equal((await post({ ...common, id: 'not-an-item', choice: 'A', notes: '', baseVersion: 0, requestId: 'invalid-item' })).status, 400);
    assert.equal((await post(first, '/api/review', 'https://unrelated.example')).status, 403);
    const wrongEdition = await post({ ...first, edition: 'r0', requestId: 'wrong-edition' }); assert.equal(wrongEdition.status, 409);
    const retained = fs.readFileSync(path.join(root, 'feedback', 'review-state.json'), 'utf8');
    await close(); origin = await launch(); assert.equal((await get()).items.shot01.version, 2);
    fs.writeFileSync(path.join(editionDir, 'A.mp4'), 'changed');
    assert.equal((await fetch(origin + '/editions/r1/A.mp4')).status, 409);
    assert.equal((await post({ ...common, id: 'shot01', choice: 'A', notes: '', baseVersion: 2, requestId: 'changed-media' })).status, 400);
    assert.equal(fs.readFileSync(path.join(root, 'feedback', 'review-state.json'), 'utf8'), retained);
    await close();
    assert.throws(() => start({ root, port: 0 }), /Reviewed edition changed/);
    assert.equal(fs.existsSync(path.join(root, 'feedback', 'server.lock')), false);
    fs.renameSync(editionDir, path.join(publicDir, 'editions', 'r2'));
    manifest.edition = 'r2'; manifest.items.forEach(item => item.variants.forEach(v => { v.src = v.src.replace('/r1/', '/r2/'); v.version = 'v2'; }));
    fs.writeFileSync(manifestFile, JSON.stringify(manifest));
    origin = await launch(); assert.deepEqual((await get()).items, {});
    const archived = JSON.parse(fs.readFileSync(path.join(root, 'feedback', 'review-state.json'), 'utf8'));
    assert.equal(archived.editions.r1.items.shot01.version, 2); assert.ok(archived.editions.r2);
    assert.equal(archived.editions.r1.manifest.items[0].variants[0].src, 'editions/r1/A.mp4');
    assert.match(archived.editions.r1.files['editions/r1/A.mp4'].sha256, /^[a-f0-9]{64}$/);
  } finally {
    await close();
    // Only delete the exact fixture created above, after confirming it is under the temp directory.
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));
    assert.ok(path.basename(root).startsWith('review-workbench-test-'));
    fs.rmSync(root, { recursive: true, force: true });
  }
});
