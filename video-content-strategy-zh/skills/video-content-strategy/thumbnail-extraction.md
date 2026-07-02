# 用于 YouTube A/B 测试的缩略图（Thumbnails）

## 设计原则（用血泪换来的经验）

缩略图是一个**单帧过滤器（single-frame filter）**，要在约 320x180 有效像素下，与其他 20 个缩略图争夺观众约 50 比特/秒的有意识带宽。每一个设计选择都必须经受住这个约束的考验。

### 文字即缩略图（Text IS the Thumbnail）

文字覆盖**画面的 50% 以上**。它不是贴在图片上的标签——文字本身就是主要的视觉元素。背景画面只是氛围，不是内容。

- **最多 2 行。** 一条主标题短语，一条辅助行。如果需要 3 行以上，说明文案本身有问题——请简化。
- **主标题文字：在 2560x1440 画布上为 450-600px。** 缩略图缩小到 320px 宽时仍需可读（对应约 55-75px 的有效尺寸——这是瞬间识别所需的最小值）。
- **辅助文字：在 2560x1440 画布上为 100-130px。** 可读但处于次要地位。
- **字重对比制造层级**，而不是单纯靠字号。主标题用 900 字重，辅助文字用 500-600。

### 发光陷阱（The Glow Trap）

这是最常见的失败模式。每一轮迭代都会叠加更多 `text-shadow` 层，试图让文字"跳出来"，结果却做成了手游广告的样子。

**不要这样做：**
```css
/* 这看起来很廉价——像放射性的霓虹光晕 */
textShadow: "0 0 60px cyan, 0 0 120px cyan, 0 0 200px cyan80"
```

**应该这样做：**
```css
/* 深色投影仅用于保证可读性。真正起作用的是颜色本身。 */
textShadow: "0 4px 20px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.95), 0 0 60px #0A0E14"
```

语义色（洞察青色 `#3EC9A7`、张力琥珀色 `#E8913A`）在深色背景（`#0A0E14`）上本就足够醒目。在此基础上再加彩色光晕反而会显得俗气。让色彩对比本身来发挥作用。

### 视觉元素作为氛围，而非内容（Visuals as Atmosphere, Not Content）

背景画面（节点、连线、箭头）只服务于一个目的：向观众传达"这个视频有结构化的视觉内容"并制造纵深感。它们绝不能与文字争夺注意力。

**不透明度校准**（经迭代验证）：
- **过暗（< 20%）**：画面元素消失。缩略图看起来就是黑底白字，会朝"平淡"的方向显得廉价。
- **过亮（> 60%）**：画面元素会与文字抢眼球。显得杂乱拥挤。
- **最佳区间（35-55%）**：画面元素清晰可见，营造出氛围和纵深，同时文字依然清晰易读。

**文字区域后方的一层环境渐变（ambient gradient）**可以在不使用发光效果的情况下制造纵深感。一个从主题色出发、不透明度为 12-18% 的柔和径向渐变，居中置于文字后方：
```tsx
<radialGradient id="spot" cx="50%" cy="45%" r="55%">
  <stop offset="0%" stopColor={accentColor} stopOpacity="0.14" />
  <stop offset="70%" stopColor={accentColor} stopOpacity="0.02" />
  <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
</radialGradient>
```
这会营造出一种微妙的"被照亮的空间"感，文字仿佛置身其中——不是发光，而是让人感觉文字存在于场景之内，而非贴在画面之上。

### 静态画面中的运动编码（Motion Encoding in Static Frames）

由于动画不可用，可以通过以下方式编码出"结构化能量"感：
- **运动拖影（motion trails）**：每个运动元素复制 3-4 份，沿运动方向偏移，每份的不透明度依次递减（0.1 → 0.025）。这比 SVG 模糊滤镜更廉价、也更可控。
- **速度线（speed lines）**：沿运动方向散布在背景中的细线（1-2px，不透明度 6-12%）。在潜意识层面编码出方向性能量。
- **方向性排列（directional alignment）**：元素沿一条清晰的视觉轴排列。观众的视线会顺着方向移动，从而产生隐含的运动感。

### 廉价感的两极光谱（The Cheap Spectrum）

缩略图可能在两个相反的方向上显得廉价：

| 用力过猛 | 恰到好处 | 用力不足 |
|---|---|---|
| 多层发光叠加、霓虹光晕、WebkitTextStroke、一切都饱和度拉满 | 干净的文字配深色阴影、画面可见但不喧宾夺主、一层微妙的环境渐变 | 黑底扁平文字、画面元素虚化到几乎看不见、没有纵深、没有氛围 |
| 手游广告的既视感 | 专业、高级的质感 | MS Paint 的既视感 |
| "我把会的 CSS 效果都用上了" | "每个元素都有存在的理由" | "我不敢加任何东西" |

### 构图规则（Compositional Rules）

- **文字居中，画面元素置于其后**——而非左右并排。文字本身即构图；画面元素只提供质感和语境。
- **SVG viewBox 设为 1280x720**，渲染分辨率为 2560x1440。在 SVG 元素上使用 `width="100%" height="100%"`，使其能够缩放填满整个合成画面。CSS 中的字号是相对于合成画面尺寸（2560x1440）而言的，**不是**相对于 SVG viewBox。
- **主标题文字以一种颜色为主导**——即调色板中的洞察色或张力色。不要混用多种主标题颜色。
- **辅助文字使用调色板中的对比色**——如果主标题是洞察色（青色），辅助行就用张力色（琥珀色）或文字色（白色）。这样两行之间会产生视觉区分。
- **地形和粒子元素保持低不透明度**（10-18%）——作为环境衬底，与视频正片中的处理方式一致。刚好足以避免画面变成纯粹的虚空。

## 技术实现

### 合成注册（Composition Registration）

```tsx
// 在 Root.tsx 中——单帧，2 倍 YouTube 分辨率
<Composition id="Thumb-Filter" component={ThumbFilter}
  durationInFrames={1} fps={1} width={2560} height={1440} />
```

`durationInFrames={1}` 和 `fps={1}`——这是一张静帧，不是视频。2560x1440 是 YouTube 1280x720 分辨率的 2 倍，用于保证视网膜屏下的清晰度。

### 渲染（Rendering）

```bash
npx remotion still Thumb-Filter "out/thumbnails/thumb-filter.png"
```

使用 `remotion still`（而非 `render`）。输出为该合成分辨率下的 PNG 图片。

### 架构（Architecture）

一个 `Thumbnails.tsx` 文件导出所有缩略图组件。每个组件都是独立的——不依赖任何幕次镜头代码。仅共享 `theme.ts`（颜色、字体）和 `LowPoly.tsx`（polyPoints、GlowFilters、terrainPoints）。

每个合成的结构：
1. 带背景色的 `AbsoluteFill`
2. SVG 图层（position: absolute）——画面元素：地形、节点、连线、运动拖影、环境渐变
3. HTML div 图层（position: absolute）——文字：主标题短语 + 辅助行

SVG 图层和 HTML 图层相互独立。SVG 使用 viewBox 坐标（1280x720）。HTML 文字使用合成尺寸像素（2560x1440）。二者通过 AbsoluteFill 的层叠自然重叠。

### 文字辅助函数模式（Text Helper Pattern）

```tsx
const txt = (
  size: number, color: string, weight = 800,
  extra: React.CSSProperties = {},
): React.CSSProperties => ({
  fontFamily: FONT.main,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.0,
  letterSpacing: "-0.025em",
  textShadow: `0 4px 20px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.95), 0 0 60px ${COLORS.background}`,
  ...extra,
});
```

单一辅助函数，只做深色阴影。主题色来自 `color` 参数，而不是来自阴影效果。

---

## 兜底方案：帧提取（Fallback: Frame Extraction）

当专用合成尚未搭建完成时，可以从已渲染的视频中提取帧作为起点。

### 环境准备（Setup）

```bash
npm install --save-dev @ffmpeg-installer/ffmpeg
```

```js
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
```

### 提取一帧（Extract a Frame）

```bash
ffmpeg -ss <seconds> -i <video.mp4> -frames:v 1 -q:v 2 <output.jpg> -y
```

`-ss` 放在 `-i` 之前可以实现快速定位（seeking）。`-q:v 2` 接近无损 JPEG 质量。

### 时间戳计算（Timestamp Calculation）

1. 阅读 `act*-scenes.md` 获取镜头时长（例如"11.8s / 约 354 帧"）
2. 累加目标镜头之前所有镜头的时长，得到该镜头的起始时间
3. 根据镜头内所需时刻（密度峰值约在 60% 处）加上百分比偏移量
4. 用 `ffmpeg -i <video.mp4> -hide_banner` 核对总时长

### 按标题机制选择画面策略（Frame Selection by Title Strategy）

| 标题机制 | 最佳画面 | 原因 |
|---|---|---|
| **反常识重构（Contrarian reframe）** | 呈现该重构概念的场景 | 画面即标题本身 |
| **风险/威胁（Stakes/threat）** | 峰值对齐或相关性失效的时刻 | 视觉模式会被解读为"危险" |
| **规律/历史（Pattern/history）** | 密集网络或规模递进的画面 | 复杂度暗示深度 |
| **个人代入感（Personal hook）** | 具有输入→输出流程的过滤器/中介画面 | 观众在其中看到自己 |

**局限性**：提取出的帧在用作缩略图时永远是次优的——它们的设计初衷是服务于时间维度上的连续观看，而非静态 320px 下的瞬间识别。可将其作为参考，随后再搭建专用合成。
