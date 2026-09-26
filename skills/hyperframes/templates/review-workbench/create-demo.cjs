'use strict';
// Optional populated fixture. No existing review package is read or modified.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'review-workbench-demo-'));
const publicDir = path.join(root, 'public');
const edition = path.join(publicDir, 'editions', 'r1');
fs.mkdirSync(edition, { recursive: true });
fs.copyFileSync(path.join(__dirname, 'server.cjs'), path.join(root, 'server.cjs'));
for (const file of ['index.html', 'review.js', 'review.css']) fs.copyFileSync(path.join(__dirname, file), path.join(publicDir, file));
for (const variant of ['A', 'B']) {
  fs.writeFileSync(path.join(edition, `${variant}.html`), `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:#101827;color:#d8eee5;font:28px system-ui;overflow:hidden}.stage{height:100%;display:grid;place-content:center;text-align:center}.bar{width:280px;height:10px;background:#76bd9f;transform-origin:left;margin:24px auto}.label{font-size:14px;opacity:.7}</style></head><body><div class="stage"><div>Candidate ${variant}</div><div class="bar"></div><div class="label">Functional demo · shared absolute time</div><output>0.00s</output></div><script>window.addEventListener('message',event=>{if(event.source!==parent||event.origin!==location.origin)return;const{type,time}=event.data||{};if(type==='review:seek'&&Number.isFinite(time)){document.querySelector('.bar').style.transform='scaleX('+Math.max(0,Math.min(1,time/6))+')';document.querySelector('output').textContent=time.toFixed(2)+'s';}});</script></body></html>`);
}
// A brief quiet test tone, clearly labelled; this is not production music or SFX.
const rate = 24000, count = Math.round(rate * .18), wav = Buffer.alloc(44 + count * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(count * 2, 40);
for (let i = 0; i < count; i++) wav.writeInt16LE(Math.round(Math.sin(2 * Math.PI * 660 * i / rate) * Math.sin(Math.PI * i / count) ** 2 * 1600), 44 + i * 2);
fs.writeFileSync(path.join(edition, 'audition.wav'), wav);
const manifest = {
  schema: 1, projectId: 'demo-review', edition: 'r1', title: 'Review workbench / functional demo',
  description: 'A populated temporary package for testing review interactions. These are test assets, not a film-quality benchmark.',
  items: [
    { id: 'scene01', kind: 'scene', title: '01 · Compare two directions', narration: 'Scrub, play, choose A/B and leave a note.', ancestry: 'Two new demonstration candidates; neither is approved.', variants: ['A', 'B'].map(id => ({ id, version: 'v1', kind: 'html', label: `Direction ${id}`, src: `editions/r1/${id}.html`, duration: 6, seekProtocol: true })) },
    { id: 'audio01', kind: 'audio', title: 'Audio · Quiet test tone', variants: [{ id: 'audio', version: 'v1', kind: 'audio', src: 'editions/r1/audition.wav', description: 'Audition-control fixture only. Not an approved production asset.' }] }
  ]
};
fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Created isolated populated fixture: ${root}\nLaunch: node "${path.join(root, 'server.cjs')}"\nOpen: http://127.0.0.1:18840/\nKeep any feedback only as demo data.`);
