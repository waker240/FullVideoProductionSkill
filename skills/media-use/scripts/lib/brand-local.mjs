import { readFileSync, existsSync, realpathSync, statSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

function parseFrontmatter(content) {
  const normalized = content.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!match) return {};

  const tokens = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^\s*(\w[\w-]*):\s*(.+)/);
    if (item) tokens[item[1]] = item[2].trim().replace(/^["']|["']$/g, "");
  }
  return tokens;
}

function extractColors(tokens) {
  return Object.entries(tokens)
    .filter(([, value]) => typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value))
    .map(([name, hex]) => ({ name, hex }));
}

function isWithin(parent, child) {
  const rel = relative(parent, child);
  return (
    rel === "" ||
    (rel !== ".." && !rel.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`))
  );
}

function metadataFromTokens(tokens) {
  const colors = extractColors(tokens);
  const font = tokens.font || tokens.typography;
  return {
    ...(colors.length > 0 && { colors }),
    ...(font && { font }),
    ...(tokens.logo && { logo: tokens.logo }),
  };
}

export function findLocalBrandAsset(projectDir) {
  let realProject;
  let projectEntries;
  try {
    realProject = realpathSync(projectDir);
    projectEntries = new Set(readdirSync(projectDir));
  } catch {
    return null;
  }

  for (const name of ["frame.md", "FRAME.md", "design.md", "DESIGN.md"]) {
    // Preserve the real on-disk spelling even on case-insensitive filesystems.
    if (!projectEntries.has(name)) continue;
    const path = join(projectDir, name);
    if (!existsSync(path)) continue;

    try {
      const realFile = realpathSync(path);
      if (!isWithin(realProject, realFile) || !statSync(realFile).isFile()) continue;
      const tokens = parseFrontmatter(readFileSync(realFile, "utf8"));
      return { path, name, metadata: metadataFromTokens(tokens) };
    } catch {
      // Try the next conventional design-spec filename.
    }
  }
  return null;
}
