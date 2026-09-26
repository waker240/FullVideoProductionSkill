# v2 验证记录

验证日期：2026-09-26。下面区分实际执行的检查与发布后的检查，不把本地通过写成远程仓库已经发布。

## 范围与规范

- 按 [Agent Skills 规范](https://agentskills.io/specification) 整理 `skills/<name>/SKILL.md`；校验名称、描述、YAML frontmatter、目录和资源引用。
- 安装验证使用 [Vercel Skills CLI](https://github.com/vercel-labs/skills) 的固定版本 `skills@1.7.0`；用户 README 保留常规 `npx skills add` 用法。
- 开发者 API 只以本地模拟响应验证请求、错误与文件行为，没有使用真实 Key 调用付费接口。
- CI 配置了 Windows/Ubuntu、Node.js 22.20.0 的维护检查；本次实际执行环境为 Windows。GitHub Actions 的运行结果须在发布后查看，不能据此声称已经在 Linux 完成执行。

## 已执行：不需要 Key 的渲染

在工作区以外的新临时目录，通过 `create-smoke.cjs` 创建示例，安装项目依赖，再执行 `setup:runtime`、`doctor --stage render` 和 `npm run render`。

结果：HyperFrames 0.7.17 成功导出 H.264 MP4，1280 × 720，30 fps，60 帧，时长 2.000 秒。FFprobe 检查和 FFmpeg 全片解码通过；已查看抽取画面。示例使用本地 GSAP 3.14.2、文字和程序图形，没有 TTS、AI 素材或外部字体。

首次安装 npm 包和渲染依赖需要网络。这项检查验证渲染链路，不代表任意外部素材、账号、声音或模型都可用。

## 已执行：Skills CLI 完整安装

使用 `skills@1.7.0` 对本地发行目录执行 `--list`，发现 13 个技能。随后在独立临时工作区执行 `--skill '*' --agent codex --copy --yes`，成功安装全部 13 个技能，没有全局安装，也未写入实际使用中的技能目录。

最终快照核验于 2026-09-26 19:42:56 UTC 完成：安装目录的 446 个技能文件与发行目录逐一 SHA-256 相同，安装后的格式、资源引用和敏感扫描为零问题。从安装目录执行脚手架，成功创建公共媒体 helper、官方 API 配置占位、`.env.example` 和 `.gitignore`；没有生成真实 `.env`。

## 已执行：原有音频和时间线回归

```bash
node --test skills/hyperframes/scripts/tests/audio-pipeline.test.cjs skills/hyperframes/scripts/tests/subtitles.test.cjs skills/hyperframes/scripts/tests/fast-passages-contract.test.cjs skills/hyperframes/scripts/tests/spatial-canvas.test.cjs
```

69 项：63 通过，6 项为 Windows 环境下跳过的符号链接用例，0 失败。覆盖音频拼接、母带处理、原稿字幕对齐、快速剪辑与空间画布契约。

## 可重复执行的公开包检查

```bash
npm ci
npm run validate
npm test
npm run test:local
```

`validate` 检查技能格式、资源引用、危险配置文件和凭据模式。扫描只报告规则与文件位置，不打印疑似密钥值。`test` 覆盖配置读取、脚手架保护、媒体接口模拟和审阅保存等实际行为；以终端输出和 CI 为准。

`test:local` 还运行 `test:media`，需要 FFmpeg/FFprobe；GitHub CI 默认只运行不依赖这些系统二进制的 `npm test`。私有原配置中的长凭据值也进行了不显示内容的本地逐字比对，公开包未命中；该专用比对不随发布包分发。

本次最终结果：

| 检查 | 结果 |
| --- | --- |
| `npm test` | 97 项：82 通过、15 项 Windows 平台跳过、0 失败 |
| `npm run test:media` | 52 项：50 通过、2 项 Windows 平台跳过、0 失败 |
| 合计 | 149 项：132 通过、17 项跳过、0 失败 |
| Fish、转录、图片和素材发现专项 | 上述总数中包含 40 项媒体专项，全部通过；本地 HTTP 模拟与真实 FFmpeg，无付费请求 |

跳过项是当前 Windows 测试环境未执行的符号链接用例，不能计为通过。公开包另带 Windows/Ubuntu CI 供发布后复验。

扫描不能证明所有未来新增内容都不含敏感信息。提交前应审阅实际 Git 暂存区，尤其是配置、日志、个人声音和第三方素材。

## 发布后的检查

本次不会推送 GitHub，也不会运行 `npm publish`。由维护者把此目录的内容放到目标仓库后，再运行：

```bash
npx skills add waker240/FullVideoProductionSkill --list
```

然后在独立项目里安装并验证。详见 [发布指南](PUBLISHING.md)。
