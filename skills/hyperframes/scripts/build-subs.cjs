// scripts/build-subs.cjs — align narration `lines` (authoritative display
// text) against the master words.json (timing only) → assets/subs/narration.subs.json.
//
// Display text NEVER comes from STT. We walk a char-stream cursor over the
// word timings and match each caption chunk's normalized chars. Same-length
// homophone folds rewrite the STT chars so the cursor lands on the right word.
// Recorded-VO / section-only boundaries use section-local LCS + interpolation.
//
//   node scripts/build-subs.cjs
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");


const narration = JSON.parse(fs.readFileSync(path.join(__dirname, "narration.json"), "utf8"));
const wordsData = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/words/narration.words.json"), "utf8"));
const boundaries = JSON.parse(fs.readFileSync(path.join(__dirname, "boundaries.json"), "utf8"));
const FPS = narration.fps || 60;
// section→paragraph exact startSec (measured from mp3 durations) for cursor snapping.
const PARA_START = {};
for (const s of boundaries.sections) { PARA_START[s.id] = {}; for (const p of (s.paras || [])) PARA_START[s.id][p.idx] = p.startSec; }

// ── Same-length homophone folds: STT form → narration form (timing-only). ──
// Each pair MUST be equal character length so the char→time map is preserved.
// Home: narration.json `folds: [["STT字","真字"],…]` (append as mishearings are found).
const FOLDS = narration.folds || [];

// ── normalize: keep CJK + latin + digits; drop punctuation/spaces; lowercase latin ──
const KEEP = /[\u3400-\u9fff0-9A-Za-z]/;
const ENGLISH = /^(en|english)/i.test(String(narration.language || narration.sttLanguage || ""));
const NUMBER_WORD_OVERRIDES = narration.numberWords || {};
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = [[1e12, "trillion"], [1e9, "billion"], [1e6, "million"], [1e3, "thousand"]];
const ORDINALS = {
  zero: "zeroth", one: "first", two: "second", three: "third", four: "fourth",
  five: "fifth", six: "sixth", seven: "seventh", eight: "eighth", nine: "ninth",
  ten: "tenth", eleven: "eleventh", twelve: "twelfth", thirteen: "thirteenth",
  fourteen: "fourteenth", fifteen: "fifteenth", sixteen: "sixteenth",
  seventeen: "seventeenth", eighteen: "eighteenth", nineteen: "nineteenth",
  twenty: "twentieth", thirty: "thirtieth", forty: "fortieth", fifty: "fiftieth",
  sixty: "sixtieth", seventy: "seventieth", eighty: "eightieth", ninety: "ninetieth",
  hundred: "hundredth", thousand: "thousandth", million: "millionth",
  billion: "billionth", trillion: "trillionth",
};

function integerWords(value) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) return String(value);
  if (number < 20) return ONES[number];
  if (number < 100) return `${TENS[Math.floor(number / 10)]}${number % 10 ? ` ${ONES[number % 10]}` : ""}`;
  if (number < 1000) return `${ONES[Math.floor(number / 100)]} hundred${number % 100 ? ` ${integerWords(number % 100)}` : ""}`;
  for (const [size, label] of SCALES) {
    if (number >= size) return `${integerWords(Math.floor(number / size))} ${label}${number % size ? ` ${integerWords(number % size)}` : ""}`;
  }
  return String(value);
}

function yearWords(numberText) {
  const number = Number(numberText);
  if (!/^\d{4}$/.test(numberText) || number < 1900 || number > 2099) return null;
  if (number >= 2000 && number <= 2009) return `two thousand${number % 2000 ? ` ${integerWords(number % 2000)}` : ""}`;
  const first = Math.floor(number / 100);
  const last = number % 100;
  if (last > 0 && last < 10) return `${integerWords(first)} oh ${integerWords(last)}`;
  return `${integerWords(first)}${last ? ` ${integerWords(last)}` : " hundred"}`;
}

function ordinalize(words) {
  const parts = words.trim().split(/\s+/);
  const last = parts.pop();
  parts.push(ORDINALS[last] || `${last}th`);
  return parts.join(" ");
}

function numericWords(token, ordinalSuffix, percent) {
  const normalizedToken = token.replace(/,/g, "");
  const overrideKey = `${token}${ordinalSuffix || ""}${percent || ""}`;
  const override = NUMBER_WORD_OVERRIDES[overrideKey] ?? NUMBER_WORD_OVERRIDES[normalizedToken];
  if (override != null) return String(override);
  const [whole, fraction] = normalizedToken.split(".");
  let words = yearWords(whole) || integerWords(whole);
  if (fraction != null) words += ` point ${[...fraction].map((digit) => ONES[Number(digit)]).join(" ")}`;
  if (ordinalSuffix) words = ordinalize(words);
  if (percent) words += " percent";
  return words;
}

function normChars(value) {
  let text = String(value).toLowerCase();
  if (ENGLISH) {
    text = text.replace(/\d[\d,]*(?:\.\d+)?(st|nd|rd|th)?(%?)/gi, (match, ordinal, percent) => {
      const number = match.slice(0, match.length - (ordinal?.length || 0) - (percent?.length || 0));
      return numericWords(number, ordinal, percent);
    });
  }
  return [...text].filter((character) => KEEP.test(character));
}

// ── Build a flat char-timeline from the word stream (timing only), then apply
//    same-length homophone folds ON THE CHAR STREAM (STT segments chars
//    individually, so folds must run post-explosion, overwriting .ch in place
//    and preserving each char's timestamp). ──
function buildCharStream(words) {
  const stream = [];
  for (const w of words) {
    const chars = normChars(w.word);
    if (!chars.length) continue;
    const span = Math.max(0.0001, w.end - w.start);
    const per = span / chars.length;
    for (let k = 0; k < chars.length; k++) {
      stream.push({ ch: chars[k], start: w.start + k * per, end: w.start + (k + 1) * per });
    }
  }
  // apply folds: find STT form as a contiguous run, overwrite chars with target
  const flat = stream.map((s) => s.ch).join("");
  for (const [from, to] of FOLDS) {
    const f = normChars(from), t = normChars(to);
    if (f.length !== t.length) { console.error(`FOLD length mismatch: ${from} → ${to}`); continue; }
    let pos = 0;
    while (true) {
      const i = flat.indexOf(f.join(""), pos);
      if (i < 0) break;
      for (let k = 0; k < t.length; k++) stream[i + k].ch = t[k];
      pos = i + f.length;
    }
  }
  return stream;
}

const stream = buildCharStream(wordsData.words);

// time (sec) → nearest stream index (for snapping the cursor to a known offset)
function timeToIndex(t) {
  // binary search on start times
  let lo = 0, hi = stream.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (stream[mid].start < t) lo = mid + 1; else hi = mid; }
  return lo;
}

// ── Anchor-based alignment (robust, no overshoot cascade). For each line we
//    locate its first few chars (the anchor) near the cursor for a reliable
//    START, then advance the cursor by the line's OWN length so a sprawling
//    interior match can never push later lines out of range. END is derived
//    from the next line's start in the emit loop. ──
function findAnchor(target, cursor) {
  const anchorLen = Math.min(5, target.length);
  const anchor = target.slice(0, anchorLen);
  const lo = Math.max(0, cursor - 30);
  const hi = Math.min(stream.length, cursor + 130);
  let best = null;
  let bestFull = null;
  for (let s = lo; s < hi; s++) {
    let ti = 0, si = s, m = 0, consec = 0;
    while (ti < anchor.length && si < stream.length && consec <= 2) {
      if (stream[si].ch === anchor[ti]) { m++; ti++; si++; consec = 0; }
      else { si++; consec++; }
    }
    // prefer close-to-cursor matches; light penalty either side
    const dist = s < cursor ? (cursor - s) * 0.03 : (s - cursor) * 0.008;
    const score = m - dist;
    if (!best || score > best.score) best = { s, m, score };
    if (m === anchor.length && (!bestFull || score > bestFull.score)) bestFull = { s, m, score };
  }
  if (bestFull) return bestFull;
  if (best && best.m >= Math.max(2, anchor.length - 1)) return best;
  return null;
}

// ── Emphasis: phrase-level, semantic; longest-first, non-overlapping. ──
// Home: narration.json `emphasis: [["phrase","role"],…]` — roles are the DESIGN.md
// semantic caption roles (e.g. system / tension / labor). Colors live in build-captions.
const EMPHASIS = narration.emphasis || [];
function tagEmphases(text) {
  const chars = [...text];
  const taken = new Array(chars.length).fill(false);
  const out = [];
  const sorted = EMPHASIS.slice().sort((a, b) => b[0].length - a[0].length);
  for (const [kw, type] of sorted) {
    let from = 0;
    while (true) {
      const idx = text.indexOf(kw, from);
      if (idx < 0) break;
      const end = idx + kw.length;
      let free = true;
      for (let i = idx; i < end; i++) if (taken[i]) { free = false; break; }
      if (free) { for (let i = idx; i < end; i++) taken[i] = true; out.push({ startInChunk: idx, endInChunk: end, type }); }
      from = idx + kw.length;
    }
  }
  return out.sort((a, b) => a.startInChunk - b.startInChunk);
}

// ── Font size by line length (1920 frame, slot ~1500px) ──
function fontSize(text) {
  const n = normChars(text).length;
  const configured = narration.captionStyle?.fontSizeStops;
  const stops = Array.isArray(configured) && configured.length
    ? configured
    : /[\u3400-\u9fff]/.test(text)
      ? [[8, 66], [12, 60], [16, 56], [20, 52], [26, 46], [Infinity, 42]]
      : [[16, 66], [24, 62], [32, 58], [40, 54], [48, 50], [Infinity, 46]];
  for (const stop of stops) {
    const max = Number(Array.isArray(stop) ? stop[0] : stop.max);
    const size = Number(Array.isArray(stop) ? stop[1] : stop.size);
    if (n <= max && Number.isFinite(size)) return size;
  }
  return 42;
}

// ── Recorded/section-only fallback: LCS-align whole sections, then interpolate misses. ──
function sectionLines(section) {
  const lines = [];
  for (const para of (section.paragraphs || [])) {
    for (const line of (para.lines || [])) {
      const text = String(line).replace(/\s*\u2014\s*/g, " \u2014 ").trim();
      const chars = normChars(line);
      if (!chars.length) continue;
      lines.push({ text, chars, charLen: chars.length, section: section.id });
    }
  }
  return lines;
}

function alignSectionLcs(lines, secStream) {
  const display = [];
  for (let li = 0; li < lines.length; li++) {
    for (const ch of lines[li].chars) display.push({ ch, line: li });
  }
  const n = display.length;
  const m = secStream.length;
  const starts = new Array(lines.length).fill(null);
  if (!n || !m) return starts;

  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = 1; i <= n; i++) {
    const prev = dp[i - 1];
    const cur = dp[i];
    const want = display[i - 1].ch;
    for (let j = 1; j <= m; j++) {
      cur[j] = want === secStream[j - 1].ch ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
  }

  const dToS = new Int32Array(n).fill(-1);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (display[i - 1].ch === secStream[j - 1].ch) {
      dToS[i - 1] = j - 1;
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  for (let di = 0; di < n; di++) {
    const si = dToS[di];
    const li = display[di].line;
    if (si >= 0 && starts[li] == null) starts[li] = +secStream[si].start.toFixed(2);
  }
  return starts;
}

function interpolateStarts(lines, starts, secStart, secEnd) {
  const out = starts.slice();
  let i = 0;
  while (i < out.length) {
    if (out[i] != null) { i++; continue; }
    const runStart = i;
    while (i < out.length && out[i] == null) i++;
    const runEnd = i - 1;
    const lo = runStart > 0 && out[runStart - 1] != null ? out[runStart - 1] : secStart;
    const hi = i < out.length && out[i] != null ? out[i] : secEnd;
    let total = 0;
    for (let k = runStart; k <= runEnd; k++) total += lines[k].charLen + 1;
    let acc = 0;
    for (let k = runStart; k <= runEnd; k++) {
      const frac = total ? acc / total : 0;
      out[k] = +(lo + Math.max(0, hi - lo) * frac).toFixed(2);
      acc += lines[k].charLen + 1;
    }
  }

  for (let k = 0; k < out.length; k++) {
    if (!Number.isFinite(out[k])) out[k] = secStart;
    out[k] = Math.min(Math.max(out[k], secStart), secEnd);
    if (k > 0 && out[k] <= out[k - 1]) out[k] = Math.min(secEnd, +(out[k - 1] + 0.1).toFixed(2));
  }
  return out;
}

function buildBySectionLcs() {
  const chunks = [];
  let chunkIndex = 0;
  let missCount = 0;
  for (const section of narration.sections) {
    const secMeta = boundaries.sections.find((b) => b.id === section.id);
    if (!secMeta) continue;
    const lines = sectionLines(section);
    const secStream = stream.filter((s) => s.start >= secMeta.startSec - 0.05 && s.start < secMeta.endSec + 0.05);
    const matchedStarts = alignSectionLcs(lines, secStream);
    missCount += matchedStarts.filter((s) => s == null).length;
    const starts = interpolateStarts(lines, matchedStarts, secMeta.startSec, secMeta.endSec);
    for (let i = 0; i < lines.length; i++) {
      const cur = lines[i];
      const startSec = +starts[i].toFixed(2);
      const hardEnd = i + 1 < starts.length ? starts[i + 1] - 0.04 : secMeta.endSec;
      const naturalEnd = startSec + cur.charLen * 0.22 + 0.8;
      let endSec = +Math.min(secMeta.endSec, hardEnd, naturalEnd).toFixed(2);
      if (endSec <= startSec) endSec = +Math.min(secMeta.endSec, startSec + 0.7).toFixed(2);
      if (endSec <= startSec) endSec = +(startSec + 0.4).toFixed(2);
      chunks.push({
        text: cur.text, startSec, endSec,
        startFrame: Math.round(startSec * FPS), endFrame: Math.round(endSec * FPS),
        fontSize: fontSize(cur.text), emphases: tagEmphases(cur.text),
        section: cur.section, chunkId: `${cur.section}-${String(chunkIndex).padStart(4, "0")}`,
      });
      chunkIndex++;
    }
  }
  return { chunks, missCount };
}

function writeSubs(chunks, missCount, mode) {
  sanitizeChunks(chunks);
  const out = { fps: FPS, generatedAt: new Date().toISOString(), totalSec: wordsData.durationSec, chunkCount: chunks.length, chunks };
  writeSubtitleFiles(out);
  console.log(`wrote ${chunks.length} chunks  misses=${missCount}  mode=${mode}  -> assets/subs/narration.subs.json`);
}

function sanitizeChunks(chunks) {
  const total = Number(wordsData.durationSec);
  if (!(total > 0) || !Number.isFinite(total)) throw new Error(`Invalid master duration: ${wordsData.durationSec}`);
  if (!chunks.length) return;
  const epsilon = Math.min(0.02, total / (chunks.length + 1));
  const round = (value) => +value.toFixed(6);

  // First establish increasing starts, then walk backward so a crowded terminal
  // run fits before the decoded master endpoint without producing zero-length cues.
  for (let i = 0; i < chunks.length; i++) {
    const current = chunks[i];
    const candidate = Number(current.startSec);
    const clamped = Number.isFinite(candidate) ? Math.max(0, Math.min(total - epsilon, candidate)) : 0;
    current.startSec = round(i ? Math.max(clamped, chunks[i - 1].startSec + epsilon) : clamped);
  }
  for (let i = chunks.length - 1; i >= 0; i--) {
    const latest = total - epsilon * (chunks.length - i);
    const beforeNext = i + 1 < chunks.length ? chunks[i + 1].startSec - epsilon : latest;
    chunks[i].startSec = round(Math.max(0, Math.min(chunks[i].startSec, latest, beforeNext)));
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const nextStart = i + 1 < chunks.length ? chunks[i + 1].startSec : total;
    const candidateEnd = Number(chunk.endSec);
    const desiredEnd = Number.isFinite(candidateEnd) ? candidateEnd : chunk.startSec + 0.4;
    chunk.endSec = round(Math.min(total, nextStart, Math.max(chunk.startSec + epsilon, desiredEnd)));
    if (!(chunk.endSec > chunk.startSec)) chunk.endSec = round(nextStart);
    chunk.startFrame = Math.round(chunk.startSec * FPS);
    chunk.endFrame = Math.round(chunk.endSec * FPS);
  }
}

function srtTime(seconds) {
  const ms = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

function writeSubtitleFiles(out) {
  const canonicalPath = path.join(ROOT, "assets/subs/narration.subs.json");
  const flatJsonPath = path.join(ROOT, "assets/subs.json");
  const srtPath = path.join(ROOT, "assets/subs.srt");
  const json = `${JSON.stringify(out, null, 2)}\n`;
  const srt = out.chunks.map((chunk, index) => [
    String(index + 1), `${srtTime(chunk.startSec)} --> ${srtTime(chunk.endSec)}`, chunk.text,
  ].join("\n")).join("\n\n") + "\n";
  fs.mkdirSync(path.dirname(canonicalPath), { recursive: true });
  fs.writeFileSync(canonicalPath, json, "utf8");
  fs.writeFileSync(flatJsonPath, json, "utf8");
  fs.writeFileSync(srtPath, srt, "utf8");
}

const USE_SECTION_LCS = narration.alignment === "pre-recorded" || boundaries.sections.some((s) => !Array.isArray(s.paras));
if (USE_SECTION_LCS) {
  const { chunks, missCount } = buildBySectionLcs();
  writeSubs(chunks, missCount, "section-lcs");
  process.exit(0);
}

// TTS path: walk every section/paragraph/line and snap to paragraph starts.
const raw = []; // { text, startSec|null, charLen, section, idx, pStart, pEnd }
let cursor = 0, missCount = 0, idx = 0;
for (let si = 0; si < narration.sections.length; si++) {
  const section = narration.sections[si];
  const secMeta = boundaries.sections.find((b) => b.id === section.id);
  for (let pi = 0; pi < section.paragraphs.length; pi++) {
    const para = section.paragraphs[pi];
    const pStart = (PARA_START[section.id] && PARA_START[section.id][pi]) ?? null;
    // paragraph end = next paragraph start, or section end
    const pMeta = secMeta && (secMeta.paras || [])[pi];
    const pEnd = pMeta ? pMeta.endSec : (secMeta ? secMeta.endSec : wordsData.durationSec);
    if (pStart != null) cursor = timeToIndex(pStart);
    for (const line of (para.lines || [])) {
      const rawLine = String(line ?? "");
      const target = normChars(rawLine);
      if (!target.length) continue;
      const cleaned = rawLine.replace(/\s*—\s*/g, " \u2014 ").trim();
      let startSec = null;
      const a = findAnchor(target, cursor);
      if (a) {
        startSec = +stream[a.s].start.toFixed(2);
        cursor = Math.min(stream.length - 1, a.s + target.length);
      } else {
        missCount++;
        if (process.env.DEBUG_MISS) console.error(`  MISS ${section.id} cur=${cursor}: ${line}`);
        cursor = Math.min(stream.length - 1, cursor + target.length);
      }
      raw.push({ text: cleaned, startSec, charLen: target.length, section: section.id, idx, pStart, pEnd });
      idx++;
    }
  }
}

// Back-fill missed starts by interpolation between the nearest KNOWN anchors,
// distributing proportionally by char length and clamping into [pStart, pEnd].
for (let i = 0; i < raw.length; i++) {
  if (raw[i].startSec != null) continue;
  // find previous known start (j) and next known start (k)
  let j = i - 1; while (j >= 0 && raw[j].startSec == null) j--;
  let k = i + 1; while (k < raw.length && raw[k].startSec == null) k++;
  const lo = j >= 0 ? raw[j].startSec : raw[i].pStart ?? 0;
  const hi = k < raw.length && raw[k].startSec != null ? raw[k].startSec : raw[i].pEnd;
  // weight by char length across the missed run [j+1 .. k-1]
  const runStart = j + 1, runEnd = (k < raw.length ? k : raw.length) - 1;
  let totalChars = 0; for (let m = runStart; m <= runEnd; m++) totalChars += raw[m].charLen + 1;
  let acc = 0;
  for (let m = runStart; m <= runEnd; m++) {
    const frac = totalChars ? acc / totalChars : 0;
    raw[m].startSec = +(lo + (hi - lo) * frac).toFixed(2);
    acc += raw[m].charLen + 1;
  }
}

// ── Minimum-visibility guard: some captions collapse to ~0.08s when a run of
//    STT-missed lines (English / model names) bunch to nearly identical starts.
//    Detect any PARAGRAPH whose lines can't each get a readable slice and
//    redistribute that paragraph's starts evenly by char-weight across its real
//    audio window [pStart,pEnd]. Well-anchored paragraphs are left fully intact
//    (word-lock preserved); only broken English-heavy ones are relaxed.
const MIN_SLOT = 0.5;
{
  let g = 0;
  while (g < raw.length) {
    let h = g;
    const key = raw[g].section + "|" + raw[g].pStart;
    while (h < raw.length && (raw[h].section + "|" + raw[h].pStart) === key) h++;
    const grp = raw.slice(g, h);
    const pS = grp[0].pStart, pE = grp[0].pEnd;
    if (pS != null && pE != null && pE > pS && grp.length > 0) {
      let broken = false;
      for (let m = 0; m < grp.length; m++) {
        const st = grp[m].startSec;
        const nx = (m + 1 < grp.length) ? grp[m + 1].startSec : pE;
        if (st == null || nx - st < MIN_SLOT) { broken = true; break; }
        if (st < pS - 0.10 || st > pE) { broken = true; break; }
      }
      if (broken) {
        const totalChars = grp.reduce((s, r) => s + r.charLen + 1, 0);
        let acc = 0;
        for (let m = 0; m < grp.length; m++) {
          const frac = totalChars ? acc / totalChars : 0;
          raw[g + m].startSec = +(pS + (pE - pS) * frac).toFixed(2);
          acc += grp[m].charLen + 1;
        }
      }
    }
    g = h;
  }
}
const chunks = [];
idx = 0;
for (let i = 0; i < raw.length; i++) {
  const cur = raw[i];
  const next = raw[i + 1];
  // end = a hair before the next line starts (so one caption is visible at a time),
  // but never longer than a natural reading time for this line.
  let endSec = next ? +(next.startSec - 0.04).toFixed(2) : +(cur.startSec + cur.charLen * 0.18 + 0.6).toFixed(2);
  const maxHold = cur.startSec + cur.charLen * 0.30 + 1.2;
  if (endSec > maxHold) endSec = +maxHold.toFixed(2);
  endSec = Math.min(endSec, cur.pEnd ?? wordsData.durationSec, wordsData.durationSec);
  if (endSec <= cur.startSec) endSec = +Math.min(cur.pEnd ?? wordsData.durationSec, wordsData.durationSec, cur.startSec + 0.7).toFixed(2);
  chunks.push({
    text: cur.text, startSec: cur.startSec, endSec,
    startFrame: Math.round(cur.startSec * FPS), endFrame: Math.round(endSec * FPS),
    fontSize: fontSize(cur.text), emphases: tagEmphases(cur.text),
    section: cur.section, chunkId: `${cur.section}-${String(idx).padStart(4, "0")}`,
  });
  idx++;
}

const out = { fps: FPS, generatedAt: new Date().toISOString(), totalSec: wordsData.durationSec, chunkCount: chunks.length, chunks };
sanitizeChunks(chunks);
writeSubtitleFiles(out);
console.log(`✓ ${chunks.length} chunks  misses=${missCount}  → assets/subs/narration.subs.json`);
