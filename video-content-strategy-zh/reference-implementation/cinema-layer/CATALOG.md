# 影院层 —— 精选原子组件目录（Cinema Layer — Curated Atomic Catalog）

> 共享影院层（Cinema Layer）原子组件的权威目录（source-of-truth catalog）。是 `video-content-strategy` 技能中"影院层词汇表"章节的配套文档。锚定于位于 `my-video/src/shared/cinematics/` 的共享模块。
>
> **截至 2026-05-01：** 该模块共有 **15 个原子组件 + 1 个 provider + 4 个 hooks** = 跨 8 个实现文件、约 20 个组件。这是经过筛选后保留的核心集合 —— 此处列出的每个组件要么已在生产环境中使用，要么距离投入使用只差一次迁移。推测性的库存（一个含 11 个变体的 Era 预设、10 个纹理原子组件、4 个揭示原子组件、2 个时间性原子组件、5 个签名预设，以及 7 个驱动器）已在 2026-05-01 的筛选中删除；删除记录见下文的*筛选日志*。`Lens` 和 `LensTransition` 在当天晚些时候通过全部四条晋升标准（跨 11 个生产镜头文件、61 次以上的使用）后，从项目本地代码中被提升到共享层。

---

## 教义（Doctrine）

影院层是**后期合成的（post-compositional）**：它作用于已合成的画布层（Canvas）+ 素材层（Artifact）画面之上。它绝不替换或重绘承载论点的几何图形。它的职责是**签名感（signature）**——那些标示"这是被创作出来的，而不是生成出来的"的感知线索（深度、颗粒感、呼吸般的光线、墨迹、镜头质感、纸张纹理、作为材质的时间）。

五条支撑性原则：

1. **影院层测试。** 移除该原子组件：如果画面既不损失*信息*也不损失*签名感*，就删掉它。
2. **原子组件要么是全画幅的，要么是区域形状的。** `RegionDim` 仍然是一个原子组件；*区域*只是一个参数。
3. **组合优于泛化。** 频道专属的手法应保留在项目本地的 `cinematics/` 中；只有与项目无关的基础组件才放在这里。
4. **频道级别的自律。** 有些原子组件按预算是"每个视频只用一次"——API 层面允许自由使用，但这种自律存在于 API 之外。
5. **库存是负债，不是资产。** 每一个未在生产环境中使用的原子组件，都会持续产生维护、导航和决策方面的开销。频道容量上限（Channel Capacity Ceiling）是真实存在的；只有当生产中的手写代码反复暴露出某种模式确实承重时，才构建对应的原子组件。

---

## 状态图例

| 标签 | 含义 |
|---|---|
| **SHIPPED（已上线）** | 已构建，正在生产环境中使用，或距投入使用只差一次迁移。文件路径直接标注在行内。 |
| **DEFERRED（延后）** | 策略已锁定，尚未构建；成本/价值权衡后决定延后。只有当手写代码出现三次及以上时才构建。 |
| **PROJECT-LOCAL（项目本地）** | 存在于某个项目本地的 `cinematics/` 中（例如 `my-video/src/projects/the-migration/cinematics/index.tsx`）。可能是也可能不是未来的提升候选；举证责任在于证明其跨频道的实用性。 |
| **REMOVED（已移除）** | 曾经存在；因为生产环境始终没有用到而被删除。保留作为"尝试过什么、为何没能保住位置"的记录。 |

---

## 实现快照（Implementation Snapshot）

八个实现文件，约 20 个组件。由 `Cinematics-AtomsSmokeTest` 进行冒烟测试。

| 文件 | 用途 | 组件 |
|---|---|---|
| `tone.tsx` | 颜色/亮度变换 | `Desaturate`、`BgDimGrade` |
| `mask.tsx` | 区域形状效果 | `RegionDim`、`RegionHold`、`Spotlight` + `Shape`、`HoldEffect` 类型 |
| `optics.tsx` | 光线 / 颗粒感线索 | `ChromaticAberration`、`Halation`、`Bloom`、`FilmGrain`、`LightFlash`、`LightLeak` |
| `lens.tsx` | 镜头质感 | `Lens`、`LensTransition` + `LensVariant` 类型、`LENS_PERSONALITIES` 目录 |
| `spatial.tsx` | 运镜 | `DollyPush` |
| `drivers.tsx` | 具备论点感知能力的钩子 | `VideoArcProvider`、`useVideoProgress`、`useGrainHueDrift`、`useVignetteDrift`、`useNCDriver` |
| `utils.ts` | 内部辅助函数 | `clamp`、`lerp`、`useStableId`、`parseHex` |
| `_testHelpers.tsx` | 冒烟测试脚手架 | `BaseScene`、`Label`、`PALETTE`、`SHOT`、`usePulse` |

---

## 原子组件 —— 按轴分类

### 色调（Tone）

| 原子组件 | 状态 | 签名参数 | 作用 |
|---|---|---|---|
| `Desaturate` | SHIPPED `tone.tsx` | `{ amount: 0–1, children }` | 黑白效果。可动画化。 |
| `BgDimGrade` | SHIPPED `tone.tsx` | `{ intensity, coolness, children }` | 约 10 个生产场景手写实现过的底层调暗处理。 |

### 遮罩（Mask）

| 原子组件 | 状态 | 签名参数 | 作用 |
|---|---|---|---|
| `RegionDim` | SHIPPED `mask.tsx` | `{ region: Shape, dimAmount, background }` | 区域之外的一切都会调暗。通过奇偶填充规则实现 SVG 遮罩。 |
| `RegionHold` | SHIPPED `mask.tsx` | `{ region: Shape, effect: HoldEffect, children }` | 单遮罩架构：底层带效果，顶层保持干净并遮罩到该区域。 |
| `Spotlight` | SHIPPED `mask.tsx` | `{ x, y, radius, intensity, falloff, color }` | 通过屏幕混合模式实现的明亮径向光斑。 |

### 光学 / 光效（Optics / Light）

| 原子组件 | 状态 | 签名参数 | 作用 |
|---|---|---|---|
| `ChromaticAberration` | SHIPPED `optics.tsx` | `{ amount, angle, falloff, children }` | 通过 feColorMatrix + feOffset + feBlend 实现的分通道 R/G/B 偏移。 |
| `Halation` | SHIPPED `optics.tsx` | `{ warmth, intensity, radius, children }` | 暖色调高斯模糊 + 叠加在原片上的屏幕混合。胶片的标志性效果。 |
| `Bloom` | SHIPPED `optics.tsx` | `{ threshold, intensity, radius, children }` | 阈值 + 模糊 + 屏幕混合。Halation 的中性版本。 |
| `FilmGrain` | SHIPPED `optics.tsx` | `{ intensity, hue, speed }` | 通过 feTurbulence 实现的动态噪点。环境氛围的标志性效果。 |
| `LightFlash` | SHIPPED `optics.tsx` | `{ fireFrame, durationFrames, peakOpacity, color }` | 带半正弦包络的明亮径向爆闪。 |
| `LightLeak` | SHIPPED `optics.tsx` | `{ corner, intensity, color }` | 角落锚定的暖色渐变，带轻微漂移。 |

### 镜头 / 摄影机质感（Lens / camera character）

| 原子组件 | 状态 | 签名参数 | 作用 |
|---|---|---|---|
| `Lens` | SHIPPED `lens.tsx` | `{ variant?: LensVariant, children }` | 用该变体对应的透视 + 缩放包装子元素。共五种变体：`wide21`、`normal50`（默认）、`portrait85`、`fisheye8`、`anamorphic`。 |
| `LensTransition` | SHIPPED `lens.tsx` | `{ from, to, startFrame, durationFrames?, children }` | 在两个变体之间对透视 + 缩放做插值。可叠加两个转场以实现 `A → B → C` 的连锁效果。 |
| `LensVariant` | 类型导出 | — | 锁定的 5 种变体名称联合类型。新增第 6 种必须通过生产环境中手写出现的实际需求来论证。 |
| `LENS_PERSONALITIES` | 常量导出 | — | 变体 → `{ perspective, scaleX, scaleY, edgeBarrel, fullBarrel }` 的查找表。供需要手动插值的调用点读取。 |

> **关于 `fisheye8` 的说明**：它只产生透视拉伸式的鱼眼效果，而非真正的桶形畸变。`LENS_PERSONALITIES` 中的 `fullBarrel` 值目前未被渲染器使用。基于真正 `feDisplacementMap` 的桶形畸变仍处于 DEFERRED 状态 —— 仅凭透视效果，`fisheye8` 对于强化的 AI 断裂感 beat 就已经足够具有电影感，这也正是生产环境中实际使用它的场景。

### 空间（Spatial）

| 原子组件 | 状态 | 签名参数 | 作用 |
|---|---|---|---|
| `DollyPush` | SHIPPED `spatial.tsx` | `{ startFrame, endFrame, fromScale, toScale, children }` | 缓慢的缩放插值 —— "镜头推向主体"的 beat。 |

### 驱动器（Drivers）

| 驱动器 | 状态 | 返回内容 |
|---|---|---|
| `VideoArcProvider` | SHIPPED `drivers.tsx` | Context provider；接受直接传入的 `progress`，或 `totalShots + currentShotIndex`。 |
| `useVideoProgress` | SHIPPED `drivers.tsx` | 从 context 中读取的 `0–1` 数值（如果没有挂载 provider 则返回 0）。 |
| `useGrainHueDrift(start, end)` | SHIPPED `drivers.tsx` | 随视频进度插值的十六进制颜色。 |
| `useVignetteDrift(start, end)` | SHIPPED `drivers.tsx` | 随视频进度插值的数值。 |
| `useNCDriver(ncWindows, fadeFrames?)` | SHIPPED `drivers.tsx` | 乘数：窗口外为 1，窗口内为 0，可选平滑淡入淡出。用于 `Act4V2/framing.tsx`。 |

### 区域形状词汇表（遮罩类原子组件共用）

```ts
export type Shape =
  | { type: 'rect'; x: number; y: number; w: number; h: number; cornerRadius?: number }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'polygon'; points: [number, number][] }
  | { type: 'path'; d: string };
```

---

## 筛选日志 —— 2026-05-01

该模块此前共有 **13 个实现文件、52 个组件**，外加 6 个冒烟测试（约 4700 行代码）。生产环境中的实际使用量是：1 个文件中的 1 个 hook —— 一个"全息投影式"的高目录 EC（Existence Cost，存在成本）、近乎零硬件支撑的状态。2026-05-01 的这次筛选删除了推测性库存；保留下来的是真正承重的核心部分。

### 已移除

| 组件 / 文件 | REMOVED（已移除）—— 原因 |
|---|---|
| `Sepia`、`Posterize`、`Tint`、`Duotone`（tone.tsx） | 仅为支撑 Era 预设而存在。除 Era 之外没有任何一个被手写复现过。 |
| `Era` 预设 + 11 个变体（era.tsx） | 对称性驱动的库存。生产环境最多需要 0-1 个 era；如果频道未来真的想要一个 era 寄存器，应在 `the-migration/cinematics/` 内部更精简地重建。 |
| 10 个纹理原子组件（texture.tsx） | 为支撑 Era 而存在。Era 被移除后，全部沦为孤儿代码。包括：`PaperGrain`、`Halftone`、`Scanlines`、`WoodcutHatch`、`Engraving`、`Riso`、`VHSWobble`、`FilmDamage`、`JPEGArtifact`、`EmulsionDecay`。 |
| 4 个揭示原子组件（reveal.tsx） | `WipeReveal`、`Iris`、`InkBleed`、`BrushReveal`。没有一个被手写复现过。现有的 `MorphShell` 模式已覆盖生产环境的实际用例。 |
| 2 个时间性原子组件（temporal.tsx） | `MotionTrails`、`FreezeFrame`。属于"每个视频只用一次"的签名性原子组件，但没有排上任何生产环境中的 beat。 |
| 2 个镜头原子组件（lens.tsx） | `TiltShift`、`LensFlare`。推测性组件；LensFlare 在电影感上算是勉强合格，但没有实际需求作为支撑。 |
| 5 个签名预设（signatureMoves.tsx） | `DossierCeremony`、`EraTransition`、`GlitchRupture`、`ArchiveOpen`、`ThesisLand`。这些是伪装成与项目无关的预设，实则是频道专属的手法。真正被创作出来时，应在项目内部构建频道锁定的版本。 |
| 7 个驱动器（drivers.tsx） | `useFrameProgress`、`useShotProgress`、`useFireEnvelope`、`useWindowDriver`、`useStopDrift`、`useNumberStopDrift`、`useHexStopDrift`。没有一个被手写复现过。`useWindowDriver` 的逻辑已被内联进保留下来的 `useNCDriver` 中。 |
| 5 个冒烟测试 | `TextureAtomsTest`、`EraPresetsTest`、`SignatureMovesTest`、`SignaturePresetsTest`、`DriversTest`。针对已删除原子组件的测试已失去存在意义。 |

### 这次筛选给目录带来的教训

- 目录会产生**库存压力**（每一个已上线的轴都会把其他轴拉向对称）。这是一种"扭曲分配"（Distortion Allocation）失误：目录的结构美感是一种软层级的规律性；而场景真正需要的是硬层级的规律性。最优做法是：只有当生产环境中出现 3 次及以上的手写实例时，才构建对应的原子组件。
- "策略已锁定"不等于"实现有正当理由"。目录可以先摆出一份长长的延后清单，而不必付出实现的成本。
- 对于未被使用的代码，不可逆性税（Irreversibility Tax）会反向作用：每一个"以防万一留着"的原子组件，都会持续产生决策开销。现在删除比以后删除更便宜。

### 提升记录（筛选之后）

| 组件 | 来源 | 提升日期 | 理由 |
|---|---|---|---|
| `Lens` | `the-migration/cinematics/index.tsx` | 2026-05-01 | 跨 11 个生产镜头文件、61 次以上的使用；5 个变体都是真实的摄影学术语；与具体项目无关。项目本地代码从共享层重新导出，使现有的 import 保持可用。 |
| `LensTransition` | `the-migration/cinematics/index.tsx` | 2026-05-01 | 与 `Lens` 配套；提升标准相同。缓动函数从项目本地的 `easeInOut` 重新接入 Remotion 的 `Easing.inOut(Easing.cubic)`，使共享层保持与具体项目无关。 |

---

## 决策框架 —— 晋升、延后或拒绝

在新增任何原子组件之前应用以下标准：

### 满足全部四条时，晋升到共享层

1. **手写复现 3 次及以上**，且都是带轻微数值差异的真实生产代码。
2. **用途稳定。** 无论哪个镜头调用它，承担的都是同一个论点性职责。
3. **可用不超过 4 个数字参数化**，且不失其特征。
4. **跨频道可用**，而不仅限于一个频道。频道专属的组合应留在项目本地的 `cinematics/` 中。

### 满足任意一条时，延后

1. 由目录的对称性驱动而非生产环境的实际需求驱动。
2. 每个视频只用一次的预算型效果 —— 应在具体镜头需要时就地内联实现该手法。
3. 该手法的"组合方式"本身就是它的*身份特征*；将其变成通用预设会破坏使其奏效的频道专属时机。
4. 现有原子组件已经可以通过组合覆盖该用例。

### 拒绝（如果不慎被晋升，则应移除）

1. 仅为支撑某个组合型预设而存在的原子组件。
2. 维护成本超过其可能带来的生产价值的原子组件。
3. 仅仅是对 `useCurrentFrame()` 已经暴露出的单行计算做包装的驱动器。

---

## 深度 —— 下一个待构建的轴

2026-05-01 的这次筛选移除了库存，但也暴露出一个真正的电影感缺口：**保留下来的核心集合仍然只是一些基础组件。其中没有一个能带来深度。** 平面的二维合成看起来像图表，而不是电影。这个轴目前刻意**尚未**构建——设计已经提出，但实现被延后，直到某个生产镜头手写出第一个深度处理手法为止。

### 拟议中的原子组件

| 原子组件 | 签名参数 | 作用 |
|---|---|---|
| `<ZLayer z={N}>` | `{ z: number, children }` | 包装一个子树，为其标注 Z 深度（典型范围 -5 到 +5）。其他深度类原子组件会读取这个标注。 |
| `<ParallaxStack cameraX={fn} cameraY={fn}>` | `{ cameraX?: number\|(frame)=>number, cameraY?: number\|(frame)=>number, children }` | 内部的 `<ZLayer>` 子元素会按照与其 `z` 值以及虚拟摄像机位置成比例的速率平移。缓慢的摄像机横摇能呈现出真实的深度感。 |
| `<DepthBlur focalZ={N} strength={S}>` | `{ focalZ: number, strength: number, children }` | 内部的 `<ZLayer>` 子元素会按照 `|childZ - focalZ|` 成比例地被模糊化。背景失焦，主体清晰。 |
| `<RackFocus from={Z} to={Z} startFrame={N} durationFrames={N}>` | `{ from, to, startFrame, durationFrames, children }` | 在一个时间窗口内，让 `focalZ` 在两个 Z 值之间做动画过渡。即"焦点从背景转移到前景"这一论点落地时刻的手法。 |
| `<DollyZoom anchorZ={N} fov={fn}>` | `{ anchorZ, fov: (frame) => number, children }` | 希区柯克式变焦：前景锚定不动，背景缩放变化。每个视频只用一次的强化效果。 |

### 为什么深度比再造一个色调原子组件更重要

前意识带宽处理（substrate-doctrine 频道）会以**近乎零意识成本**去解读**空间线索**。一个具有真实深度感的场景，会在其他任何元素落地之前就先被感知为"有电影感"。目前 Migration 频道的每一个镜头都是平面合成，顶多带一个 1.06 的推镜——读起来像*信息图表*，而不像*被拍摄下来的画面*。

上述 5 个原子组件将解锁频道目前无法实现的四种高杠杆手法:

- **带视差的缓慢摇镜建立镜头**（ZLayer + ParallaxStack）—— 虚拟摄像机沿时间线横摇，前景多边形比背景地形漂移得更快。会被感知为观众正在其中移动的真实空间。
- **档案仪式式的甩焦**（RackFocus）—— 当一个素材揭示触发时，焦点从背景（失焦画布）瞬间切换到该素材（清晰对焦）。今天是靠透明度小技巧手动调出来的；这个深度原子组件可以一次性正确地完成它。
- **压缩漏斗式的深度爆发**（汇聚 beat 期间的 DepthBlur）—— 当元素汇聚到一个焦点时，画面其余部分失焦。视线被*强制*引导。
- **论点落地的 DollyZoom**（每个视频一次）—— 那个标志性的"这不是一个科技故事 → 这是一个文明故事"式的断裂时刻。目前完全无法表现；将为频道增添最具冲击力的空间手法。

### 构建触发条件(何时该上线深度这个轴)

在满足以下任意一条之前不要构建:

1. 某个生产镜头正在通过按元素做与一个手写摄像机变量成比例的 `translateX` 来手写视差效果(= 第二次出现:说明它已经是真实需求了)。
2. 某个镜头需要档案仪式式的甩焦，而团队正在用透明度小技巧勉强凑合。
3. Migration 频道 `DIRECTOR.md` 中的 LOOK 契约从"平面、带轻微推镜"升级为"默认带深度",且各镜头需要相应的词汇表。

深度的设计已经锁定，但实现被这个触发条件所门控。这与筛选日志中回溯性地强制执行的自律是同一种：当生产环境揭示出需求时才构建原子组件，而不是当目录本身"想要"时就构建。

---

## 这份目录如何演进

- **状态翻转，而非删除。** 当一个原子组件上线时，把它的状态从 `DEFERRED` 翻转为 `SHIPPED` 并标注文件路径；不要删除这一行。`REMOVED` 状态同理——删除日志是这份目录关于"什么没能保住位置"的记忆。
- **决策框架为晋升把关。** 每一个新原子组件都必须通过全部四条"晋升"标准才能上线。目录的对称性本身不构成充分理由。
- **自律规则是有粘性的。** 一条自律规则只应在有文档记录的案例研究支撑下才能放松(与 `video-content-strategy/field-notes.md` 遵循同样的模式)。
- **频道级别的签名手法引用这份目录。** 当一个频道锁定一个签名手法时(例如 Migration 频道的 `BourdieuHexagonReveal`),这份目录提供该手法所依赖的原子组件——但该手法的时机和绑定方式仍留在项目的 `DIRECTOR.md` 和项目本地的 `cinematics/` 中。

当这份目录中经过验证、趋于稳定的模式出现时，将它们回植到 `~/.cursor/skills/video-content-strategy/reference.md` 的"影院层词汇表"章节中。这份技能文档始终是战略层面的教义；这份文件始终是实现层面的事实真相。
