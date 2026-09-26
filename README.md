# Full Video Production Skills · v2

从脚本、参考拆解、动态样片和逐镜审阅，到配音、字幕、合成、声音试听与最终检查的一套视频制作技能。用 HyperFrames 把 HTML、CSS、JavaScript 和媒体素材编排为视频，让人能在制作过程中比较版本、提出具体修改、保留已认可的结果。

v2 将原来的 Remotion 视觉策略包扩展为 **13 个可安装的 Agent Skills**，附带项目脚手架、审阅网页、媒体接口和检查脚本。它提供制作方法与工具，不固定成片风格，也不保证一次提示就得到满意结果。

## 安装

先安装 **Node.js 22.20.0 或更新版本**、npm 和 Git。在你准备制作视频的工作区运行：

```bash
npx skills add waker240/FullVideoProductionSkill
```

这是交互式安装。推荐选中本仓库全部技能，因为主技能会按任务调用同目录下的创意、合成、动画和媒体技能。安装器不会根据正文引用自动补装依赖。

以 Codex 为例，一次安装全套到当前项目：

```bash
npx skills add waker240/FullVideoProductionSkill --skill '*' --agent codex --copy --yes
```

其他支持的 agent 可替换 `--agent codex`，例如 `claude-code` 或 `cursor`。想先看可安装列表：

```bash
npx skills add waker240/FullVideoProductionSkill --list
```

这些命令针对本仓库发布后的内容。维护者在发布前用本地目录测试的方法见 [发布指南](docs/PUBLISHING.md)。`--copy` 避免依赖符号链接权限；没有加 `-g`，因此不会修改全局技能。已有同名技能的用户应先保留自己的定制内容，再决定是否更新。

安装技能不会安装系统工具、配置 API 账户或消耗生成额度。FFmpeg 和 FFprobe 用于音频处理、素材探测与成片检查；请安装后加入 `PATH`。字体、参考视频和音乐由你自行准备。

## 先做一次不需要 Key 的验证

下面以 Codex 的项目安装路径 `.agents/skills` 为例；其他客户端请使用其实际安装目录。

```bash
node .agents/skills/hyperframes/scripts/doctor.cjs
node .agents/skills/hyperframes/scripts/create-smoke.cjs videos/install-check
cd videos/install-check
npm install
npm run setup:runtime
npm run doctor
npm run render
```

这会创建并渲染一个两秒静音检查片，不调用 AI。首次使用会由 HyperFrames 获取所需渲染依赖。它验证安装与渲染链路，不是视频品质示范。

项目模板固定 `hyperframes@0.7.17` 和 GSAP 3.14.2。技能安装规范与渲染器版本分开维护；不要为了版本号较新而直接替换已验证的合成协议。

## 开始制作

让 agent 使用 `hyperframes` 技能，例如：

> 用 hyperframes 做这份 script.md。先研究论点、观众和参考。先交几个有代表性的动态样片，再搭一个可保存批注的 A/B 审阅页。解释每个方案的表达思路。等我审阅后再展开；已选中的版本要保留。素材生成预算和声音方案先列清楚。

也可以先建立项目：

```bash
node .agents/skills/hyperframes/scripts/scaffold.cjs videos/my-film
cd videos/my-film
npm install
npm run setup:runtime
```

脚手架包含 `DESIGN.md`、`DIRECTION.md`、`SCENE_CONTRACT.md`、旁白与场景模板、媒体与检查脚本，以及 `.env.example`。这些模板需要 agent 根据你的内容填写；它们不是一部已经完成的电影。

把项目里的 `.env.example` 复制为 `.env`，按需要填写，再用 `npm run doctor -- --stage tts` 等命令检查。真实 `.env` 被忽略，脚手架不会生成或复制真实 Key。

制作流程通常是：

1. **内容与参考**：明确脚本要讲什么；把参考片拆成分镜、素材、运动、色彩和声音的具体作用。
2. **小规模验证**：先看真实动态效果，再决定是否批量展开。静态方向图不能代表动画已成立。
3. **逐镜审阅**：比较 A/B，留下版本、选择和批注；修改后重新检查，未审阅不算认可。
4. **素材与实现**：生成素材承担材质、人物和情境；准确的文字、数据、界面与关系由代码控制。
5. **旁白与时间线**：生成配音，取得词级时序，字幕回到原稿校对，再按真实口播重排镜头。
6. **声音和成片审核**：单独试听并在语境中比较音乐、音效和补录；检查镜头内部、相邻切口和最终编码文件。

工作阶段由你的请求决定。只要求分镜时，不会把“必须交付完整视频”当成继续生成的授权。技术检查也不替代人的审美取舍。

## 配置哪些凭据

| 能力 | 使用方式 | 需要的配置 |
|---|---|---|
| 代码动画、分镜、本地审阅、渲染 | HyperFrames + 本地文件 | 无 AI Key；需要对应系统工具 |
| Fish 旁白 | 本包的官方开发者 API 适配器 | `FISH_API_KEY`、`FISH_REFERENCE_ID`；模型由 `FISH_MODEL` 指定 |
| 词级转录 | 官方 OpenAI Whisper 接口 | `OPENAI_API_KEY`；默认兼容 `whisper-1` |
| 自建转录服务 | 你显式配置的兼容端点 | `WHISPER_API`，需要鉴权时加 `WHISPER_API_KEY` |
| API 图片生成 | 本包公开接口脚本 | `OPENAI_API_KEY`、账户可用的 `OPENAI_IMAGE_MODEL` |
| agent 内建图像工具 | 当前客户端已提供的工具 | 遵循客户端配置；与 API Key 路径分开 |
| Seedance 等视频素材 | 已安装的工具／服务，或导入已有素材 | 对应服务自己的账户与配置 |
| Gemini 网页参考分析 | 上传有权使用的参考视频，带回分析结果 | 使用者自己的网页账户；本包不代管登录态 |
| 音乐和音效 | 你提供并确认可用的本地素材与目录 | 无共享私有素材库；见 `media-use` |
| 跨设备公网审阅 | 可选 ngrok | 自己的 ngrok 配置；本地审阅无需它 |

ChatGPT/Codex 网页订阅与开发者 API 是不同的凭据和计费方式。安装技能不附送任何服务的 Key、Cookie、声音身份或额度。图片模型名由用户配置，不把某个客户端显示的模型名当成所有 API 都可调用的 ID。

项目 `.env` 只在实际运行相应脚本时读取；已有环境变量优先。日志与检查报告不输出凭据。生成请求不会因为超时自动反复提交；先核对服务端是否已生成，再决定是否重试。

有关接口细节见 [Fish 公共版说明](skills/fish-audio-api/SKILL.md)、[媒体工作流](skills/hyperframes-media/SKILL.md) 和 [安装与能力边界](skills/hyperframes/references/install-portability.md)。

## 技能目录

| 技能 | 用途 |
|---|---|
| `hyperframes` | 主入口、制作流程、脚手架、审阅和最终审核 |
| `hyperframes-core` | HTML 合成协议、媒体所有权、时间与分幕组装 |
| `hyperframes-animation` | 动画、运镜、空间画布、转场和运行时适配 |
| `hyperframes-creative` | 视觉叙事、设计、分镜、素材分层与参考转译 |
| `hyperframes-media` | 配音、转录、字幕、声音和素材接入 |
| `hyperframes-registry` | HyperFrames 组件与注册表安装 |
| `fish-audio-api` | 官方 Fish API 配置与公共媒体适配器 |
| `media-use` | 本地素材发现、审阅、冻结和来源记录 |
| `general-video` | 自定义长片与多场景视频 |
| `faceless-explainer` | 短篇无真人出镜解说 |
| `motion-graphics` | 以图形、文字和运动传达信息的短片 |
| `music-to-video` | 按音乐节拍和能量组织视频 |
| `remotion-to-hyperframes` | 用户明确要求时迁移 Remotion 项目 |

每个目录都有有效的 `SKILL.md`，其脚本和必要资源位于技能内部。根目录的 README、配置样例、维护校验和 CI 用于仓库管理，不依赖安装器将这些根文件复制到 agent 的技能目录。

## 审阅网页

`hyperframes/templates/review-workbench/` 提供场景 A/B 与声音试听的共用起点，包含服务器持久保存、版本锁定、批注、导出／导入、并发冲突处理和媒体拖动。先在本机检查，再在明确需要跨设备访问时配置隧道。不要把整个工作区或含 `.env` 的目录作为公开静态目录。

可运行其中的 `create-demo.cjs` 建立独立临时演示。详见 [审阅工作台用法](skills/hyperframes/templates/review-workbench/USAGE.md)。

## 从 v1 升级

v1 主要是 Remotion 视觉策略、组件参考和旧媒体 MCP；v2 增加了 HyperFrames 全流程及审阅、声音、交付工具。旧视频不会自动迁移，v1 的模板也不应直接套上 v2 的时间与合成协议。需要迁移时单独使用 `remotion-to-hyperframes`。

v2 没有沿用作者的 Fish 网站 Cookie 代理、私人转录地址、个人声音默认值和本地素材库。你需要填写自己的公共配置。外部图像／视频工具没有随技能安装而获得账号能力；可以选择你的可用工具或导入现成素材。

## 维护与许可

仓库维护者在根目录执行：

```bash
npm ci
npm run validate
npm test
```

验证覆盖技能格式、资源引用、敏感文件／凭据模式和实际辅助脚本行为；付费接口使用本地模拟服务测试。安装和渲染的具体验证记录见 [验证记录](docs/VALIDATION.md)。

已安装 FFmpeg/FFprobe 的维护环境可再运行 `npm run test:local`，包括媒体处理回归。默认 GitHub CI 运行不依赖这些系统二进制的检查。

主体保留 Apache-2.0 许可；GSAP 等第三方内容保留自己的条款。详见 [LICENSE](LICENSE) 与 [第三方来源说明](THIRD_PARTY_NOTICES.md)。生成素材与用户提供素材的权利和许可需在各项目中单独记录。
