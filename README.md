# 视频内容策略 — Cursor Skill 包

这是 Cursor 的 **视频内容策略（Video Content Strategy）** skill 的独立发布版本：这个视觉转译层负责把一份脚本（论点 + 人设 + 密度节奏，由你自己的脚本流程建立）转化为一部动画的、代码优先的、基于 Remotion 的解说视频的具体视觉决策。

真正*使用*这个 skill（而不只是阅读它）所需的一切，都放在这一个文件夹里：skill 文档、它所描述的 Remotion 组件层的一份真实参考实现，以及为 agent 提供真正的 `generate_image` / `generate_video` 工具的 MCP 服务器。

这个包刻意保持**框架无关的 Remotion**风格——这里的所有内容都不依赖 HyperFrames 或任何其他视频创作框架。

## 包含内容

```
video-content-strategy/
├── Thumbnail_generation.md         ← 端到端封面图制作手册（通过下方的 MCP 服务器调用 gpt-image-2）
├── references/                     ← 视觉叙事 Tier 1-3 —— 这套 skill 的理论体系所依据的书本知识库
├── skills/
│   ├── video-content-strategy/     ← 主 skill（这是你要调用的那个）
│   └── video-motion-references/    ← 配套 skill：运动模式 + Remotion 实现模块
├── rules/
│   ├── act-setup-from-audio.mdc    ← 端到端工作流：原始分幕音频 → TTS/STT → 字幕 → 搭建好的合成
│   └── subtitles.mdc               ← 论点编码字幕（Argument-Coded Subtitle）架构（类型/数据/渲染器契约）
├── reference-implementation/
│   ├── canvas-modules/             ← SceneShell、motion、staging、theme、primitives —— 画布层（Canvas Layer）的可运行代码
│   ├── cinema-layer/               ← 合成后处理的影院层（Cinema Layer）（颗粒、色差、镜头、转场、驱动器）
│   └── scripts/
│       ├── cutout-bg.js            ← 针对 gpt-image-2 产出物的色键抠图流水线
│       └── master_to_wav.sh        ← 透明双通道响度母带处理，输入 MP3/WAV，输出 PCM WAV
└── mcp-servers/
    └── media-generation/           ← 暴露 generate_image / generate_video 的 MCP 服务器
```

## 刻意未包含的内容

- **脚本创作/思维层 skill**（选题、人设设计、五阶段脚本结构）。这个包假定你已经有一份确定了论点、人设和密度节奏的脚本——请自带脚本创作流程，或手动撰写脚本。`video-content-strategy` 的 SKILL.md 在一些地方仍会按名字引用它；那些只是指向一个你需要自行提供的流程的指针。
- **完整的 Remotion 项目脚手架**（根目录没有 `package.json`/`remotion.config.ts`，也没有 `Root.tsx`）。这是一个组件库加理论体系，不是一个开箱即用的视频项目。请把参考实现放进你自己的 Remotion 项目里。
- 任何与 HyperFrames 相关的材料。

## 安装设置

### 1. 把 skill 安装进 Cursor

把 `skills/` 下的两个文件夹复制到 Cursor 加载 skill 的位置——可以是你的全局 skill 文件夹（`~/.cursor/skills/`），也可以是项目本地的（项目根目录下的 `.agents/skills/` 或 `.cursor/skills/`）。Cursor 会自动识别它们；用 `/video-content-strategy` 调用。

### 2. 设置 media-generation MCP 服务器

这会给 agent 提供 skill 所假定存在的 `generate_image` / `generate_video` 工具（文档中通常泛称为「`gpt-image-2`」——服务器本身与模型无关，通过 Vercel AI Gateway 路由，所以你可以把它指向 Imagen、Flux、Grok Imagine 或其他图像/视频模型）。

```bash
cd mcp-servers/media-generation
npm install
cp .env.example .env
# 编辑 .env，加入你自己的 Vercel AI Gateway 密钥 (https://vercel.com/docs/ai-gateway)
npm start   # 默认在 http://localhost:3105/mcp 上启动
```

然后在你项目的 `.cursor/mcp.json`（或 Cursor 的全局 MCP 设置）里，把它注册为一个指向 `http://localhost:3105/mcp` 的可流式 HTTP MCP 服务器。

### 3. 把参考实现放进你的 Remotion 项目

`reference-implementation/canvas-modules/` 和 `reference-implementation/cinema-layer/` 各自是扁平的、自包含的文件夹——每个文件只从 `react`、`remotion`，或同一文件夹内的相邻文件导入。把每个文件夹原样复制进你的 Remotion 项目的 `src/`（例如 `src/shared/canvas/` 和 `src/shared/cinematics/`），如果你把它们放在非并排的位置，再修正那两三处导入路径即可。

需要 `remotion` + `react` 作为 peer dependency（你项目已在用的任意版本均可）。`scripts/cutout-bg.js` 还额外需要 `sharp`；`scripts/master_to_wav.sh` 需要你的 `PATH` 中有 `ffmpeg`。

### 4. 安装规则（rules）

把 `rules/` 下的两个 `.mdc` 文件复制到你项目的 `.cursor/rules/` 文件夹里。它们是项目规则，不是 skill——Cursor 会按上下文自动应用它们，而不是通过 `/invoke` 调用。

- **`act-setup-from-audio.mdc`** 是从原始分幕音频（或经 TTS 生成的书面脚本）搭建一集新节目的完整流水线：转写 → 构建帧级精确的字幕 → 修正转写错误 → 搭建各幕的合成 → 注册 → 校验。它按名字提到了若干项目专属的模板脚本（例如 `tts-<project>.js`、`build-<project>-subs.js`、`transcribe-<project>.js`），作为可以从某个参考项目改编而来的示例——这些逐项目脚本本身并没有打包在这里，只有工作流文档和真正可复用的那一部分，即母带处理脚本。
- **`subtitles.mdc`** 是这条流水线在每一幕中搭建出的论点编码字幕架构：类型/数据/渲染器的拆分、短语级强调规则、语义色彩角色、字号阶梯，以及锁定的渲染器契约（位置、淡入淡出时机、NC 窗口处理）。
- **`scripts/master_to_wav.sh`** 是两条规则都假定已经存在的母带处理步骤：一条透明的双通道 `loudnorm` 链（高通滤波 + 瞬态限制器，不做压缩/降噪），输入 MP3 或 WAV，导出一个保持原时长、48kHz/24-bit 的 PCM WAV，达到目标的 LUFS/dBTP/LRA。用法：`TARGET_I=-14 TARGET_TP=-1 TARGET_LRA=7 ./master_to_wav.sh input.mp3 output.wav`。

### 5. 封面图生成

`Thumbnail_generation.md`（包根目录）是**生成式 PNG**封面图路径的可直接复制粘贴使用的手册：锁定的 `openai/gpt-image-2` 模型选择、针对上面 `media-generation` 服务器的确切 MCP 请求格式、4:3 / 16:9「能被 16 整除」的尺寸技巧、带锁定语义调色板的五段式提示词模板、七种风格register（自研低多边形风、微信截图风、涂黑文件风、纵深优先风、大声量标题党脸风等等）及其硬性规则，以及文件命名约定。它通过原始仓库内的相对路径交叉引用了两个文件，这些路径与本包的对应关系如下：

| 文档中写的路径 | 在本包中的路径 |
|---|---|
| `video-content-strategy/thumbnail-extraction.md` | `skills/video-content-strategy/thumbnail-extraction.md`（已打包——另一条基于 Remotion 合成 + 帧提取的封面图路径） |
| `video-content-strategy/SKILL.md` | `skills/video-content-strategy/SKILL.md`（已打包） |
| `.cursor/skills/video-generation-mcp/SKILL.md`、`How_images_svgs.md` | **未打包**——通用的 MCP 工具文档，以及更广泛的 Register A/B/C 素材生成库，仅作背景参考，运行封面图手册本身并不需要它们 |

### 6. 阅读参考资料（无需安装——仅作背景知识）

`references/` 是 `video-content-strategy` 与 `video-motion-references` 之下的三层书本知识库——它们理论体系背后的「为什么」，从十二本关于视觉叙事技艺的书中提炼而来：

| 文件 | 参考书目 | 覆盖内容 |
|---|---|---|
| `VISUAL_STORYTELLING_TIER1.md` | Bruce Block（《The Visual Story》）、Walter Murch（《In the Blink of an Eye》）、Williams（《Animator's Survival Kit》）+ Thomas & Johnston（《Illusion of Life》）、Scott McCloud（《Understanding Comics》） | 四根承重轴：随时间展开的视觉结构、剪切点、运动本身、静帧的序列 |
| `VISUAL_STORYTELLING_TIER2.md` | Mateu-Mestre（《Framed Ink》）、Molly Bang（《Picture This》）、David Mamet（《On Directing Film》）、Steven Katz（《Film Directing: Shot by Shot》） | 场面调度与含义——单一画面内部装了什么，以及画面如何串联成一条为眼睛设计好的路径 |
| `VISUAL_STORYTELLING_TIER3.md` | Joseph Mascelli（《The Five C's of Cinematography》）、Ondaatje & Murch（《The Conversations》）、Robert McKee（《Story》） | 参考级的深度：技术性的摄影机语法、长篇剪辑哲学，以及结构/论证即故事 |

每一层的结尾都有一张综合表格，加上映射到 Remotion + 静态图像工作的具体下一步动作——把它当作一种诊断工具来读（「为什么这一场戏感觉像是精致的 PPT？」），而不是只读一遍的摘要。Tier 1 明确指出 `video-motion-references` 已经把 Williams→Remotion 的映射大量编码进了代码（弹簧预设、代码化的十二条动画原则）——这些书提供的是判断*何时、为何*该用它的品味。

## 推荐操作顺序

1. 撰写或以其他方式获得你的脚本（论点、人设、密度节奏均已确定）。
2. 调用 `video-content-strategy` skill 来做出逐镜头的视觉决策（画布层 vs. 素材层 vs. 影院层的划分、图元、色彩、密度/粒子曲线、锚点镜头的努力协议（Effort Protocol））。
3. 在构建过程中查阅 `video-motion-references`，用于运动模式查找、弹簧预设，以及 Remotion 实现的 API 形态（`SceneShell`、`motion.ts`、`staging.tsx`、镜头配置 + 时间轴模板）。
4. 如果你要从原始音频或经 TTS 生成的旁白从零搭建一个新项目，从头到尾遵循 `act-setup-from-audio.mdc`——它会产出 `subtitles.mdc` 的 `<EduSubtitles>` 渲染器所消费的帧级精确字幕数据，并在音频母带处理这一步调用 `master_to_wav.sh`。
5. 对于方案中要求的任何素材层（Artifact Layer）光栅生成，使用 `media-generation` MCP 服务器；在合成为 `<Img>` 图层之前，运行 `cutout-bg.js` 做色键抠图。
6. 以 `reference-implementation/canvas-modules/` 为起点实现画布层，以 `reference-implementation/cinema-layer/` 实现合成后处理效果的影院层。
7. 一旦视频的主题动机与调色板已经锁定，遵循 `Thumbnail_generation.md`，通过同一个 MCP 服务器生成并迭代出 3-4 个候选封面图。
