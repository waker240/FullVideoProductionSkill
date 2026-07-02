# AI 生成归档（AI Generation Archive）

> **⚠ 已废弃——仅作历史参考保留。**
>
> 本文件记录的是一套**已废弃**的多模型 AI 生成流水线（静态图使用 Imagen、Flux、Grok Imagine；动态部分使用 KlingAI、Veo、Wan、Seedance），该流水线曾用于早期的 Code+AI 混合工作流。
>
> **截至 2026-04 的现行流水线**仅使用单一图像模型——`openai/gpt-image-2`——用于生成栅格素材，所有动效均由 **Remotion**（代码生成动画）负责。当前的操作参考请见 `SKILL.md` 中的"三层架构"（Three-Layer Architecture）一节。
>
> 请勿将下文的模型建议、提示词模板或流水线指引当作现行指导使用。它们仅作为已尝试并已被替代的方案存档保留。如果未来重新引入 AI 生成的动效层，这里的模式或许可作为一个有用的起点——但应先根据当前的模型能力重新评估。

---

## 原始归档说明（Original archive note）

内容取自 `video-content-strategy/SKILL.md`——涵盖了曾属于 Code+AI 混合工作流一部分的 AI 图像/视频生成流水线。若未来重新引入 AI 生成层，此处保留以供参考。

---

## 混合原则（原始版本）（The Hybrid Principle (Original)）

结构骨架是**代码生成动画（code-generated animation）**（Remotion）。氛围血肉是合成进代码画布中的 **AI 生成内容**。二者单独都无法达成效果——混合方案才能同时兼具精确性与电影感的能量。

**AI 生成负责有机能量：**
- 氛围背景与质感——粒子场、渐变变化、环境运动
- 扁平动画序列（Kurzgesagt 风格）——代码难以复现的流畅有机运动
- 抽象 3D 可视化（Primer 风格）——具备自然运动物理规律的几何形体
- 电影感的建立镜头与转场——环境氛围、制作价值感
- 隐喻可视化——具体的概念图像或短动画

**合成方式：** Remotion 是主画布。AI 生成的片段作为背景层、质感叠加层和视觉素材合成进画布。代码负责控制时间线、布局、文字以及叠加其上的结构性元素。

---

## AI 生成的优势领域（AI Generation: Where It Excels）

AI 生成负责代码无法高效产出的部分——有机运动、电影质感、氛围能量。除文字、数据和精确计时的结构性元素外，其他一切都可以交给它。

**1. 氛围背景**——电影质感的纹理、环境粒子场、渐变环境。以 30-70% 的不透明度合成在代码元素之下。背景在"呼吸"，前景在"表达"。

**2. 扁平动画序列**——Kurzgesagt 风格的有机运动：平滑缓动、环境层面的生动感、风格化的物体转换。AI 擅长呈现那种流动、鲜活的质感，相比之下手写的 SVG 动画会显得僵硬。提示词中需锁定风格并使用语义调色板。

**3. 抽象 3D 可视化**——Primer 风格、具备自然运动物理规律的几何形体。只需简单的变换、类似智能体（agent-like）的行为、有机的落定过程，无需复杂编排或数学运算。

**4. 电影感转场与建立镜头**——幕与幕之间的短氛围过渡片段。环境氛围的转变、抽象能量、调色板的过渡。达到 Wendover/PolyMatter 式的制作价值感。

**5. 隐喻素材**——当脚本引用了一个具体的隐喻时，生成一段扁平几何插画或短动画，并锁定语义调色板风格。

**6. 设计阶段探索**——生成概念图以探索视觉方向。反复迭代。保留有效的方案，把需要精确性的部分改用代码重建。

**AI 无法为我们胜任的部分：**
- 任何形式的文字（渲染会乱码）
- 具体的数字、数据或标签
- 需要精确计时的复杂多元素编排
- 数学动画或物理仿真
- 与旁白节拍精确对齐的帧同步转场

---

## 图像优先流水线（The Image-First Pipeline）

图像生成的质量和风格一致性明显优于单独使用文本生成视频（text-to-video）。一帧确定好的图像能为视频模型提供已经解决好的主体、构图、调色板和风格——从而消除大部分认知预算上的猜测成本。

**流水线：图像 → 图生视频（Image-to-Video）**

1. **生成一张风格锁定的图像**（Imagen、Flux 或 Grok Imagine）——这是值得投入提示词精力的地方。这张图像是一切的锚点。
2. **将该图像输入视频模型**（Veo i2v、KlingAI i2v、Wan i2v)——只需为运动/动作写提示词。风格、色彩、构图已由图像锁定。

这种方式比纯文本生成视频能产出显著更一致的结果，因为图像在视频模型分配任何注意力之前就已经解决了视觉上的歧义。这张图像相当于视觉上的"第 0 层（Tier 0）"——在视频提示词开始之前，它就已经回答了主体、风格、色彩和取景的问题。

**何时使用图像优先，何时使用纯文本生成视频：**

| 使用图像优先（Image-First） | 使用纯文本生成视频（Text-to-Video） |
|---|---|
| 风格一致性很重要（品牌素材、系列内容） | 快速探索、寻找氛围基调 |
| 扁平动画/图形风格（Kurzgesagt） | 氛围背景、简单的环境运动 |
| 具体构图或隐喻可视化 | 抽象质感、精确取景无关紧要的场景 |
| 多个片段必须让人感觉属于同一个视觉宇宙 | 一次性的电影感转场 |

**风格锁定规则**：每一条 AI 生成提示词都**必须**包含：
- 语义调色板色彩（钢蓝色/青色、琥珀色/橙色、深色背景）
- "无文字、无水印、无写实人脸"（No text, no watermarks, no realistic human faces）

---

## 能量优先的提示词写法（Energy-First Prompting）

**关键——描述"能量"，而非"结构"：**

最常见的失败模式是像工程师而不是像视觉思考者那样写提示词。描述结构会产出图表，描述能量才会产出艺术。

| 死气沉沉的提示词（结构导向） | 鲜活的提示词（能量导向） |
|---|---|
| "深色背景上用线条连接的 30 个蓝色圆圈，带虚线琥珀色边界" | "一团密集发光的簇状物在被困能量的驱动下向外挤压，抵着一道无形的屏障。棱边处泛出灼热的琥珀色光芒，那是形状挣扎着突破极限的地方。" |
| "扁平矢量插画，无渐变，无发光，无阴影" | "大胆的抽象动画画面。戏剧性的内部光晕。醒目、具有电影感。" |
| "信息在一个网络中流动" | "成千上万条琥珀色光线从一个孤独的青色光点旁掠过——那是身处噪声海洋中的一个孤独心灵" |

提示词必须传达观众应该"感受到"什么，而不是一个图表渲染器应该"画出"什么。发光、渐变和戏剧性的打光就是能量——去掉它们只会产出死气沉沉的画面。

---

## 低多边形提示词风格（Low-Poly Prompting Style）

**经过验证的视觉识别系统：低多边形几何风格（Low-Poly Geometric）**

该风格是**低多边形（low-poly）**——多面几何表面、硬朗的棱角边缘、最少的多边形数量。这是 EIF（Energy-Information Framework）中"激光（laser）"概念的视觉化呈现：每一个多边形都是一次刻意的信息分配。没有浪费的几何形体。每一个面都承载最大信号量。形体被压缩到其最本质的结构。

低多边形风格为何对我们有效：
- **低熵 = 有组织的能量**——每一个面都是刻意为之，没有任何一处是装饰性的噪声
- **本质上是抽象的**——不会被误认为是写实照片，坦诚地承认自己是一种表现手法
- **反共识（Anti-consensus）**——大多数 AI 生成内容都在追求细节最大化。低多边形反其道而行之：压缩、本质、克制。
- **戏剧性的打光**——硬朗的几何棱边能以尖锐、醒目的方式捕捉并反射光线
- **对 AI 生成友好**——模型能够可靠地处理干净的几何形体
- **对图生视频（i2v）友好**——干净的边缘和平整的面能够顺畅地动起来，不易产生瑕疵

从已验证画面中提炼出的关键特性：
- **深色多面表面**，在承压点泛出琥珀色/橙色光芒，在突破点泛出青色/蓝绿色光芒
- **非对称构图**——具有方向性的力，能量有一个明确的矢量方向
- **焦点即概念**——最亮的像素点，就是论点所在之处
- **光是结果，而非装饰**——光晕是从紧张或突破中"逸出"的，而不是作为装饰附加上去的
- **冲击/断裂点处的碎片与粒子**能在静态画面中营造出动态感

**用于提示词的风格关键词：** low-poly（低多边形）、geometric（几何）、faceted（多面）、angular（棱角）、polygonal（多边形）、hard edges（硬边缘）、dark faceted surfaces（深色多面表面）、minimal geometry（极简几何）、dramatic lighting on angular faces（棱角面上的戏剧性打光）。

默认使用 `google/imagen-4.0-ultra-generate-001` 生成主视觉帧（hero frame）。

**强制要求：在撰写任何生成提示词之前，先运行"凝视/梦想/创造"（Gaze/Dream/Create，出自 `video-creation-prompts`）流程。** 切勿跳过这一步直接写提示词。

---

## MCP 生成参考（MCP Generation Reference）

使用 `video-generation-mcp` 技能中的 `generate_image` 和 `generate_video` 这两个 MCP 工具。按使用场景选择模型：

### 图像生成（风格锚定、隐喻素材）（Image Generation (style anchoring, metaphor assets)）

| 使用场景 | 模型 | 关键参数 |
|---|---|---|
| 最高质量的单帧图像 | `google/imagen-4.0-ultra-generate-001` | `aspectRatio: "16:9"` |
| 快速迭代/探索 | `google/imagen-4.0-generate-001` | `aspectRatio: "16:9"` |
| 扁平矢量/图形风格 | `bfl/flux-2-pro` | `aspectRatio: "16:9"` |
| 创意风格变体 | `xai/grok-imagine-image-pro` | `aspectRatio: "16:9"`（无 `size` 参数） |

用 `n: 2` 或 `n: 3` 生成多个变体，从中挑选最佳画面。

### 视频生成（仅限 KlingAI）（Video Generation (KlingAI only)）

将生成的图像作为 `image` 参数输入。用 FROM-TO（从……到……）的方向性描述来提示运动，并包含低多边形风格的上下文。完整的提示词结构请参见 `video-creation-prompts` 中的"图生视频运动提示词"（Image-to-Video Motion Prompts）一节。

| 使用场景 | 模型 | 关键参数 |
|---|---|---|
| **默认图生视频（i2v）** | `klingai/kling-v3.0-i2v` | `duration: 10`、`aspectRatio: "16:9"`、`providerOptions: "{\"klingai\":{\"mode\":\"pro\",\"cfgScale\":0.7}}"` |
| 摄影机控制 | `klingai/kling-v2.6-i2v` | providerOptions 中的 cameraControl（详见 MCP 技能说明） |
| 首尾帧 | `klingai/kling-v2.6-i2v` | providerOptions 中的 imageTail |
| 多镜头分镜脚本 | `klingai/kling-v3.0-i2v` | providerOptions 中的 multiShot + multiPrompt |
| 文生视频（t2v，跳过图像优先步骤） | `klingai/kling-v3.0-t2v` | `duration: 10`——提示词中需包含完整的低多边形风格描述 |

图生视频运动提示词——用力的方向描述 FROM-TO，并包含风格上下文：
> *"低多边形几何碎片从多面地形上升起，加速向上飞入中央的青色光束，随着上升逐渐汇聚。每个棱角碎片缓慢旋转，坚硬的几何面捕捉到戏剧性的琥珀色和青色光线。深色的低多边形地形保持静止。摄影机缓慢推向光束。"* （原文："Low-poly geometric fragments lift FROM the faceted terrain and accelerate upward INTO the central cyan beam, converging as they ascend. Each angular fragment rotates slowly, hard geometric faces catching dramatic amber and cyan light. The dark low-poly terrain remains static. Slow camera push toward the beam."）

### 提示词模板（能量优先、低多边形）（Prompt Templates (Energy-First, Low-Poly)）

**图像生成（用于 i2v 流水线的主视觉帧）：**

> Bold abstract animation frame. Low-poly geometric style. [将该概念描述为一种切身的视觉体验——它传达出怎样的能量？观众会有怎样的感受？]. Dark faceted angular surfaces. Dramatic lighting on hard geometric faces, [cyan/teal and amber/orange palette], deep dark background. Striking, bold composition. No text, no watermarks.

**示例——"牢笼"（协调上限）（The Prison (coordination ceiling)）：**

> Bold abstract animation frame. Low-poly geometric style. A massive dark faceted sphere of angular polygonal surfaces sits in vast empty space. Amber light glows through the cracks between geometric faces — internal pressure building. A single point on the surface fractures, brilliant cyan light beginning to escape. The sphere is monumental, oppressive, beautiful. Dramatic side-lighting catches each angular face at a different angle. Deep dark background, vast negative space. Striking, tense, cinematic. No text, no watermarks.

**图生视频运动提示词（用于为主视觉帧添加动效）：**

> Low-poly geometric style. [核心运动：主体从起点 FROM 移动到终点 TO，由特定的力驱动]. [辅助运动：与之协调的次要运动——旋转、捕捉光线]. [约束条件：哪些部分保持静止——地形、背景、周围元素]. [摄影机：相对于主体的运动方式]. Dark faceted surfaces, angular polygonal shapes, amber and cyan palette.

**示例——"激光"（连贯性光束）（The Laser (coherence beam)）：**

> Low-poly geometric style. Dark angular fragments lift FROM the faceted terrain surface and accelerate upward INTO the central cyan beam of light, converging and aligning as they ascend. Each fragment rotates slowly, hard polygonal faces catching dramatic amber light on one side and cyan on the other. The fragments begin scattered and chaotic near the ground, becoming organized and aligned as they approach the beam. The low-poly terrain remains completely static. Slow camera push forward toward the base of the beam. The beam pulses gently, growing slightly brighter as more fragments join it.

### MCP 关键规则（Key MCP Rules）

- `providerOptions` 必须是一个 JSON **字符串**：`"{\"klingai\":{\"mode\":\"pro\",\"cfgScale\":0.7}}"`
- 务必在 providerOptions 中包含 `negativePrompt: "text, watermark, blurry, smooth surfaces, realistic human faces"`
- 对于精细的运动提示词，使用 `cfgScale: 0.7`（仅限 v3.0 及以上版本）——可提升提示词遵从度
- xAI 图像生成：使用 `aspectRatio`，**不要**使用 `size`
- 视频生成需要几分钟时间——这是正常现象
- 图像和视频提示词中都要始终包含低多边形风格关键词

完整的 KlingAI 参数参考（摄影机控制、运动笔刷、多镜头、首尾帧）请参见 `video-generation-mcp` 技能。

---

## 相关配套技能（AI 生成）（Related Companion Skills (AI Generation)）

- `video-generation-mcp` —— 用于 `generate_image` 和 `generate_video` 的 MCP 工具，是执行层。用它通过 Imagen、Flux、Veo、KlingAI、Wan、Seedance、Grok 实际生成 AI 图像和视频片段。在进行任何 MCP 生成调用之前，请**先**阅读该技能。
- `video-creation-prompts` —— 提示词工程、认知预算、迭代协议、"凝视/梦想/创造"（Gaze/Dream/Create）流水线。用于撰写有效的生成提示词。
