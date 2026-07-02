export const COLORS = {
  background: "#0A0E14",
  backgroundLight: "#121820",
  system: "#4A7C9B",
  systemDim: "rgba(74, 124, 155, 0.3)",
  tension: "#E8913A",
  tensionDim: "rgba(232, 145, 58, 0.3)",
  insight: "#3EC9A7",
  insightDim: "rgba(62, 201, 167, 0.3)",
  text: "#E8E4DF",
  textDim: "rgba(232, 228, 223, 0.45)",
  textMuted: "rgba(232, 228, 223, 0.12)",
} as const;

// Font stacks are designed so:
//   - ASCII glyphs use the design fonts (Inter / JetBrains Mono).
//   - CJK glyphs cascade to a deliberate Chinese face. Chrome's
//     character-by-character fallback means an "Inter, ..., Microsoft YaHei"
//     stack picks Inter for "PHYSICS" and Microsoft YaHei for "物理"
//     within a single text node, which is exactly what we want.
//   - Multiple OS-native CJK candidates are listed (Windows / macOS /
//     designer-installed Source Han / Linux Noto / WenQuanYi) so that
//     the project renders identically on a Mac, on a Windows render
//     box, and on a CI Linux container without bundling a font file.
//   - Mono Chinese is rare in the wild, so the mono stack falls back to
//     the same CJK sans candidates rather than to a default monospace
//     (which would render Chinese in a generic system font with no
//     letter-spacing control).
export const FONT = {
  main:
    "'Inter', 'Microsoft YaHei UI', 'Microsoft YaHei', " +
    "'PingFang SC', 'Hiragino Sans GB', " +
    "'Source Han Sans SC', 'Source Han Sans CN', " +
    "'Noto Sans SC', 'Noto Sans CJK SC', 'WenQuanYi Micro Hei', " +
    "'Segoe UI', system-ui, -apple-system, sans-serif",
  mono:
    "'JetBrains Mono', 'Cascadia Code', 'SF Mono', " +
    "'Microsoft YaHei UI', 'Microsoft YaHei', " +
    "'PingFang SC', 'Hiragino Sans GB', " +
    "'Source Han Sans SC', 'Noto Sans SC', " +
    "ui-monospace, Consolas, monospace",
} as const;

export const FPS = 30;
