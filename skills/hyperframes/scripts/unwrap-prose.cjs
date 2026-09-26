// One-off / maintenance: join hard-wrapped prose lines in skill markdown.
"use strict";
const fs = require("fs");
const path = require("path");

const SKILL = path.resolve(__dirname, "..");
const SKIP = new Set(["LEARNINGS.md", "references/technique-library.md"]);

function unwrap(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  let body = normalized;
  let fm = "";
  const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---\n/);
  if (fmMatch) {
    fm = fmMatch[0];
    body = normalized.slice(fm.length);
  }

  const lines = body.split("\n");
  const out = [];
  let inCode = false;
  let buf = [];

  const flush = () => {
    if (!buf.length) return;
    out.push(buf.join(" ").replace(/\s+/g, " ").trim());
    buf = [];
  };

  const kind = (line) => {
    const t = line.trim();
    if (!t) return "blank";
    if (t.startsWith("```")) return "code";
    if (/^#{1,6}\s/.test(t)) return "heading";
    if (t.startsWith("|")) return "table";
    if (/^[-*+]\s/.test(t)) return "list";
    if (/^\d+\.\s/.test(t)) return "list";
    if (t.startsWith(">")) return "quote";
    if (/^-{3,}$/.test(t)) return "hr";
    if (/^\s{2,}\S/.test(line) && out.length) return "cont";
    return "prose";
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flush();
      inCode = !inCode;
      out.push(line);
      continue;
    }
    if (inCode) {
      out.push(line);
      continue;
    }

    const k = kind(line);
    if (k === "cont") {
      flush();
      const prev = out.pop();
      out.push(`${prev} ${line.trim()}`.replace(/\s+/g, " ").trim());
      continue;
    }
    if (k === "quote") {
      flush();
      const t = line.trim();
      if (out.length && out[out.length - 1].trim().startsWith(">")) {
        const prev = out.pop();
        out.push(`${prev} ${t.replace(/^>\s*/, "")}`.replace(/\s+/g, " ").trim());
      } else {
        out.push(t);
      }
      continue;
    }
    if (k === "prose") {
      buf.push(line.trim());
      continue;
    }
    flush();
    out.push(line);
  }
  flush();
  const unwrapped = out.join("\n").replace(/\n{3,}/g, "\n\n");
  return fm ? fm + unwrapped : unwrapped;
}

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name.endsWith(".md")) acc.push(p);
  }
  return acc;
}

const targets = process.argv.slice(2);
const files = targets.length
  ? targets.map((f) => path.resolve(f))
  : walk(SKILL);

if (require.main === module) {
for (const file of files) {
  const rel = path.relative(SKILL, file).replace(/\\/g, "/");
  if (!targets.length && SKIP.has(rel)) continue;
  if (!fs.existsSync(file)) { console.warn(`skip missing: ${file}`); continue; }
  const before = fs.readFileSync(file, "utf8");
  const after = unwrap(before);
  if (after !== before) {
    fs.writeFileSync(file, after.endsWith("\n") ? after : after + "\n");
    const dl = before.split("\n").length - after.split("\n").length;
    const label = targets.length ? path.relative(process.cwd(), file) : rel;
    console.log(`${label}: ${before.split("\n").length} → ${after.split("\n").length} lines (${dl > 0 ? "-" : "+"}${Math.abs(dl)})`);
  }
}
}

module.exports = { unwrap };
