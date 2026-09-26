'use strict';
// Copy this template to a project; keep feedback/ outside the dedicated public/ directory.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function start({ root = __dirname, port = Number(process.env.REVIEW_PORT || 18840) } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('REVIEW_PORT must be an integer from 0 to 65535');
  root = path.resolve(root);
  const publicRoot = path.join(root, 'public');
  const stateDir = path.join(root, 'feedback');
  const stateFile = path.join(stateDir, 'review-state.json');
  const manifest = JSON.parse(fs.readFileSync(path.join(publicRoot, 'manifest.json'), 'utf8').replace(/^\uFEFF/, ''));
  const idPattern = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
  const safeId = value => idPattern.test(value || '') && !Object.hasOwn(Object.prototype, value);
  if (manifest.schema !== 1 || !safeId(manifest.projectId) || !safeId(manifest.edition) || !Array.isArray(manifest.items)) throw Error('Invalid manifest schema, projectId or edition');
  const ids = new Map();
  const frozen = new Map();
  const editionPrefix = `editions/${manifest.edition}/`;
  function realPublic(relative) {
    if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.split('/').some(x => x === '..' || x === '.') || path.isAbsolute(relative)) throw Error('Invalid public path');
    const resolved = fs.realpathSync(path.join(publicRoot, relative));
    if (!resolved.startsWith(fs.realpathSync(publicRoot) + path.sep)) throw Error('Path escapes public root');
    return resolved;
  }
  function snapshot(relative) {
    const absolute = realPublic(relative);
    const stat = fs.statSync(absolute);
    if (!stat.isFile()) throw Error(`Expected file: ${relative}`);
    const hash = crypto.createHash('sha256');
    const fd = fs.openSync(absolute, 'r');
    try {
      const buffer = Buffer.alloc(1024 * 1024);
      let n;
      while ((n = fs.readSync(fd, buffer, 0, buffer.length, null))) hash.update(buffer.subarray(0, n));
    } finally { fs.closeSync(fd); }
    frozen.set(relative, { absolute, size: stat.size, mtimeMs: stat.mtimeMs, ctimeMs: stat.ctimeMs, sha256: hash.digest('hex') });
  }
  function walk(relative) {
    const absolute = realPublic(relative);
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink()) throw Error('Symlinks are not allowed in an edition');
      const child = `${relative}/${entry.name}`;
      if (entry.isDirectory()) walk(child);
      else snapshot(child);
    }
  }
  for (const item of manifest.items) {
    if (!safeId(item.id) || ids.has(item.id) || !['scene', 'audio'].includes(item.kind) || typeof item.title !== 'string') throw Error('Invalid or duplicate item');
    if (!Array.isArray(item.variants) || (item.kind === 'scene' ? item.variants.length !== 2 : item.variants.length !== 1)) throw Error('Scenes need exactly A and B; audio items need one candidate');
    for (const [i, variant] of item.variants.entries()) {
      if (item.kind === 'scene' && variant.id !== ['A', 'B'][i]) throw Error('Scene variants must be ordered A, B');
      if (!safeId(variant.id) || !safeId(variant.version) || !['video', 'audio', 'html', 'image'].includes(variant.kind) || typeof variant.src !== 'string' || !variant.src.startsWith(editionPrefix)) throw Error('Invalid candidate or source outside edition');
      if (item.kind === 'audio' && variant.kind !== 'audio') throw Error('Audio item must contain audio');
      realPublic(variant.src);
    }
    ids.set(item.id, item);
  }
  if (manifest.items.length) walk(editionPrefix.slice(0, -1));
  const fingerprint = crypto.createHash('sha256').update(JSON.stringify(manifest)).update(JSON.stringify([...frozen].map(([src, x]) => [src, x.sha256]))).digest('hex');
  fs.mkdirSync(stateDir, { recursive: true });
  const lockFile = path.join(stateDir, 'server.lock');
  let lock;
  try {
    lock = fs.openSync(lockFile, 'wx');
    fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    fs.closeSync(lock);
  } catch (error) {
    if (lock !== undefined) { try { fs.closeSync(lock); } catch {} fs.rmSync(lockFile, { force: true }); }
    throw error;
  }
  let released = false;
  const releaseLock = () => { if (!released) { released = true; fs.rmSync(lockFile, { force: true }); } };
  let db;
  try {
    db = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : { schema: 1, projectId: manifest.projectId, editions: {} };
    if (db.projectId !== manifest.projectId) throw Error('Feedback belongs to another project');
    const previous = db.editions[manifest.edition];
    if (previous && previous.manifestHash !== fingerprint && Object.keys(previous.items).length) throw Error('Reviewed edition changed. Publish a new edition; never overwrite approved candidates.');
    if (!previous || previous.manifestHash !== fingerprint) db.editions[manifest.edition] = { manifestHash: fingerprint, manifest: structuredClone(manifest), files: Object.fromEntries([...frozen].map(([src, x]) => [src, { sha256: x.sha256, bytes: x.size }])), revision: 0, items: {}, requests: {} };
  } catch (error) { releaseLock(); throw error; }
  function persist() {
    const tmp = stateFile + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2) + '\n');
    fs.renameSync(tmp, stateFile);
  }
  try { persist(); } catch (error) { releaseLock(); throw error; }
  const current = () => db.editions[manifest.edition];
  const blank = () => ({ choice: 'unreviewed', notes: '', version: 0 });
  const view = () => ({ schema: 1, projectId: manifest.projectId, edition: manifest.edition, manifestHash: fingerprint, revision: current().revision, items: current().items });
  function unchanged(entries = frozen) {
    for (const [src, frozenFile] of entries) {
      let stat;
      try { stat = fs.statSync(frozenFile.absolute); } catch { throw Error(`Candidate file removed: ${src}. Publish a new edition.`); }
      if (stat.size !== frozenFile.size || stat.mtimeMs !== frozenFile.mtimeMs || stat.ctimeMs !== frozenFile.ctimeMs) throw Error(`Candidate file changed: ${src}. Publish a new edition.`);
    }
  }
  function json(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(JSON.stringify(body));
  }
  function validate(change) {
    const item = ids.get(change.id);
    const choices = item?.kind === 'scene' ? ['unreviewed', 'A', 'B', 'both', 'neither'] : ['unreviewed', 'favorite', 'shortlist', 'reject'];
    if (!item || !choices.includes(change.choice) || typeof change.notes !== 'string' || change.notes.length > 12000 || !Number.isInteger(change.baseVersion) || change.baseVersion < 0) throw Error('Invalid feedback');
  }
  function mutate(payload, batch) {
    if (payload.edition !== manifest.edition || payload.manifestHash !== fingerprint) return [409, { error: 'This page uses a different edition. Reload it before reviewing.' }];
    if (typeof payload.requestId !== 'string' || !/^[A-Za-z0-9_-]{8,100}$/.test(payload.requestId)) throw Error('Invalid requestId');
    const changes = batch ? payload.entries : [payload];
    if (!Array.isArray(changes) || changes.length < 1 || changes.length > 500 || new Set(changes.map(x => x.id)).size !== changes.length) throw Error('Invalid batch');
    changes.forEach(validate);
    const requestHash = crypto.createHash('sha256').update(JSON.stringify({ batch, changes: changes.map(({ id, choice, notes, baseVersion }) => ({ id, choice, notes, baseVersion })) })).digest('hex');
    const prior = Object.hasOwn(current().requests, payload.requestId) ? current().requests[payload.requestId] : null;
    if (prior) return prior.hash === requestHash ? [200, { ...prior.result, replayed: true }] : [409, { error: 'requestId was reused with different content' }];
    unchanged();
    const conflicts = changes.filter(c => c.baseVersion !== (current().items[c.id]?.version || 0)).map(c => ({ id: c.id, current: current().items[c.id] || blank() }));
    if (conflicts.length) return [409, { error: 'Updated elsewhere. Your draft was kept; choose which version to save.', conflicts }];
    const previous = structuredClone(current());
    const savedAt = new Date().toISOString();
    const entries = {};
    for (const change of changes) {
      const item = ids.get(change.id);
      const entry = { choice: change.choice, notes: change.notes, version: change.baseVersion + 1, updatedAt: savedAt, candidates: item.variants.map(({ id, version }) => ({ id, version })) };
      entries[change.id] = entry;
      current().items[change.id] = entry;
    }
    current().revision++;
    const result = { ok: true, revision: current().revision, entries };
    current().requests[payload.requestId] = { hash: requestHash, result };
    try { persist(); } catch (error) { db.editions[manifest.edition] = previous; throw error; }
    return [200, result];
  }
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.vtt': 'text/vtt', '.srt': 'text/plain', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream' };
  const server = http.createServer((req, res) => {
    let route;
    try { route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { return json(res, 400, { error: 'Malformed path' }); }
    if (route === '/health' && req.method === 'GET') return json(res, 200, { ok: true, edition: manifest.edition });
    if (route === '/manifest.json' && ['GET', 'HEAD'].includes(req.method)) {
      if (req.method === 'HEAD') { res.writeHead(200, { 'Content-Type': mime['.json'], 'Cache-Control': 'no-store' }); return res.end(); }
      return json(res, 200, { ...manifest, manifestHash: fingerprint });
    }
    if (route === '/api/review' || route === '/api/import') {
      if (req.method === 'GET' && route === '/api/review') return json(res, 200, view());
      if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
      let origin;
      try { origin = new URL(req.headers.origin); } catch { return json(res, 403, { error: 'Same-origin request required' }); }
      if (!['http:', 'https:'].includes(origin.protocol) || origin.host !== req.headers.host) return json(res, 403, { error: 'Same-origin request required' });
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) return json(res, 415, { error: 'JSON required' });
      let bytes = 0, tooLarge = false; const chunks = [];
      req.on('data', chunk => { bytes += chunk.length; if (bytes > 8 * 1024 * 1024) { if (!tooLarge) json(res, 413, { error: 'Payload too large' }); tooLarge = true; } else chunks.push(chunk); });
      req.on('end', () => {
        if (tooLarge) return;
        try { const [status, result] = mutate(JSON.parse(Buffer.concat(chunks)), route === '/api/import'); json(res, status, result); }
        catch (error) { json(res, 400, { error: error.message }); }
      });
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: 'Method not allowed' });
    try {
      const relative = route === '/' ? 'index.html' : route.slice(1);
      const contentType = mime[path.extname(relative).toLowerCase()];
      if (!contentType || relative.split('/').some(x => x.startsWith('.'))) return json(res, 404, { error: 'Not found' });
      const absolute = realPublic(relative);
      if (relative.startsWith('editions/')) {
        if (!frozen.has(relative)) return json(res, 404, { error: 'Not in the current frozen edition' });
        unchanged([[relative, frozen.get(relative)]]);
      }
      const stat = fs.statSync(absolute);
      if (!stat.isFile()) return json(res, 404, { error: 'Not found' });
      let start = 0, end = stat.size - 1, status = 200;
      if (req.headers.range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (!match || (!match[1] && !match[2]) || !stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }); return res.end(); }
        if (match[1]) { start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end; }
        else start = Math.max(0, stat.size - Number(match[2]));
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }); return res.end(); }
        status = 206;
      }
      const headers = { 'Content-Type': contentType, 'Content-Length': stat.size ? end - start + 1 : 0, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
      if (status === 206) headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
      res.writeHead(status, headers);
      if (req.method === 'HEAD' || stat.size === 0) return res.end();
      const stream = fs.createReadStream(absolute, { start, end });
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch (error) { json(res, error.message.startsWith('Candidate file') ? 409 : 404, { error: error.message.startsWith('Candidate file') ? error.message : 'Not found' }); }
  });
  server.on('close', releaseLock);
  server.on('error', error => { releaseLock(); if (require.main === module) { console.error(error.message); process.exitCode = 1; } });
  try { server.listen(port, '127.0.0.1', () => console.log(`Review workbench: http://127.0.0.1:${server.address().port} (${manifest.edition})`)); }
  catch (error) { releaseLock(); throw error; }
  return server;
}
if (require.main === module) {
  let server;
  try { server = start(); } catch (error) { console.error(error.message); process.exitCode = 1; }
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { if (server) server.close(() => process.exit()); else process.exit(); });
}
module.exports = { start };
