# 参考实现（Reference Implementation）

这是可运行的 Remotion 代码，实现了 `video-motion-references`（第 4 部分：实现模块）中描述的模块地图，以及 `video-content-strategy` 中描述的三层架构（Three-Layer Architecture）。这是从某个真实项目中提取出的、正在生产环境使用的代码——请把它当作可以复制和改造的起点，而不是可以直接 `npm install` 的软件包。

## `canvas-modules/`

画布层（Canvas Layer）：承载论点的代码/SVG 基础组件。扁平文件夹，只导入 `react`、`remotion`，以及同一文件夹内的其他文件。

| 文件 | 是什么 |
|---|---|
| `theme.ts` | 语义化配色系统（`system` / `tension` / `insight` / 背景 / 文字）+ 字体栈 |
| `motion.ts` | 缓动曲线、弹簧预设（`SPRING`），以及动画基础函数：`rise`、`recede`、`fadeWindow`、`springIn`、`springOut`、`springValue`、`anticipate` |
| `staging.tsx` | `CompositionGrid`（开发模式布局叠加层）、`ProgressiveReveal`、用于"做减法以突出重点"的 `stageFocus` / `stageScale` |
| `LowPoly.tsx` | `GlowFilters`（SVG 滤镜定义）+ `terrainPoints`（用于氛围空间锚定的棱角地形轮廓生成器） |
| `Particles.tsx` | 环境粒子场（呼吸感节点，即"画面永不死寂"这一基础组件） |
| `WordTiming.ts` | 比例化的逐词时间估算，用于在没有精确时间戳时实现逐词锁定的动效 |
| `ShotDuration.tsx` | `useShotDuration` / `useAudioOffset` 上下文钩子（context hooks）—— 用于多镜头合成的 ShotDuration + AudioOffset 模式 |
| `WorldCanvas.tsx` | 连续画布摄像机（Continuous Canvas Camera）—— 在多个镜头之间保持共享的视觉对象/摄像机，实现连续画布线索（Continuous Canvas Thread）模式 |
| `MorphBridge.tsx` | 镜头之间基于形变（morph）的入场/出场转场（"变形，而非切换"这一基础组件） |
| `SceneShell.tsx` | 统一的场景包装器 —— 将地形、粒子、径向渐变、弹簧/插值淡入淡出、形变转场、音频偏移，以及开发用合成网格集成到一个组件中。绝大多数场景都渲染在它内部。 |
| `PrimitiveSmokeTest.tsx`、`DossierLibraryTest.tsx`、`GateLibraryTest.tsx` | 实操示例 / 库验证冒烟测试，用一个三拍模板（仪式 → 回调 → 家族/时代蒙太奇）演练上述各模块 —— 阅读这些文件可以看到各模块如何组合使用 |

## `cinema-layer/`

影院层（Cinema Layer）：作用于*已合成*的画布层 + 素材层画面之上的后期合成效果。扁平文件夹，只导入 `react` 和同一文件夹内的其他文件。

| 文件 | 是什么 |
|---|---|
| `tone.tsx` | `Desaturate`、`BgDimGrade` —— 调色/色调原子组件 |
| `mask.tsx` | `RegionDim`、`RegionHold`、`Spotlight` —— 注意力/遮罩原子组件 |
| `optics.tsx` | `ChromaticAberration`、`Halation`、`Bloom`、`FilmGrain`、`LightFlash`、`LightLeak` —— 镜头/光效原子组件 |
| `spatial.tsx` | `DollyPush` —— 运镜原子组件 |
| `lens.tsx` | `Lens`、`LensTransition`、`LENS_PERSONALITIES` —— 镜头质感系统 |
| `drivers.tsx` | `VideoArcProvider` + 具备论点感知能力的钩子（`useVideoProgress`、`useGrainHueDrift`、`useVignetteDrift`、`useNCDriver`），让影院层效果能够响应当前处于视频论点的哪个位置 |
| `utils.ts` | `clamp`、`lerp`、`useStableId`、`parseHex` |
| `index.ts` | 精选后的公共导出接口 —— 应最先阅读此文件 |
| `SmokeTest.tsx`、`_testHelpers.tsx` | 上述原子组件的验证测试框架 |
| `CATALOG.md` | 删减/筛选日志 —— 记录尝试过什么、删掉了什么，以及原因 |

## `scripts/cutout-bg.js`

用于素材层（Artifact-Layer）光栅生成图像的批量抠图（背景移除）工具。两种模式：`chroma`（默认 —— 针对纯色 `#FF00FF` 背景做像素级精确色键抠图，适用于 AI 生成的合成素材图）和 `imgly`（AI 抠图，适用于真实照片 —— 依据该技能自身的准则，**不要**对合成的 `gpt-image-2` 输出使用 `imgly` 模式）。需要 `sharp`。

```bash
node scripts/cutout-bg.js <inputDir> <outputDir> --mode=chroma
```

## `scripts/master_to_wav.sh`

针对旁白 WAV 文件的透明母带处理（音频母带工艺）—— 这是 `../rules/act-setup-from-audio.mdc` 在 Phase 0g 阶段调用的步骤。两遍式线性 `loudnorm`（80Hz 高通滤波 + 瞬态限制器，不做压缩/降噪），以广播级响度为目标，导出为保持时长不变的 48kHz/24-bit PCM WAV，从而可以直接替换现有 WAV 文件而不产生额外的有损生成。需要 `ffmpeg`。

```bash
TARGET_I=-14 TARGET_TP=-1 TARGET_LRA=7 ./scripts/master_to_wav.sh input.wav output.wav
```

在替换母带处理后的文件之前，务必对比输入/输出的时长——`loudnorm` 理论上是保持时长不变的，但任何构建在其之上的旁白流程（比如 `act-setup-from-audio.mdc` 中的流程）都依赖于时长精确到毫秒不变，因为字幕时间轴和合成时长都是由它推算出来的。
