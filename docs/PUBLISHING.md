# v2 发布指南

发布目标：`https://github.com/waker240/FullVideoProductionSkill`。本地打包不会自动提交、推送或发布该仓库。

## 发布布局

把 `bilibili-release/v2` **里面的内容**放到目标仓库根目录：

```text
FullVideoProductionSkill/
  README.md
  LICENSE
  THIRD_PARTY_NOTICES.md
  .env.example
  .gitignore
  package.json
  package-lock.json
  .github/workflows/validate.yml
  docs/
  scripts/
  skills/
    hyperframes/SKILL.md
    fish-audio-api/SKILL.md
    ...
```

不要在仓库根再放一个总 `SKILL.md`，也不要额外包一层 `v2/` 后仍使用相同的安装指令。旧版可保留在 Git 历史或版本标签；避免把旧版技能目录与本版并列，导致安装器列出两套同名或过时技能。

实际 Skill 安装时只复制各技能目录，所以不能让运行脚本依赖这个仓库根目录的 `.env`、`node_modules` 或维护脚本。项目脚手架自带公开 `.env.example`，用户在视频项目里填写真实配置。

## 本地验证

在发布目录运行 `npm ci`、`npm run validate`、`npm test`。格式与扫描通过后，用 Skills CLI 检查发现：

```bash
npx skills@1.7.0 add ./ --list
```

再在一个**新建的临时工作区**中，使用发布目录的绝对路径完整安装：

```bash
npx skills@1.7.0 add /absolute/path/to/v2 --skill '*' --agent codex --copy --yes
```

Windows 路径有空格时使用引号。不要加 `-g` 或 `--all`，以免修改全局技能或给所有 agent 安装。Skills CLI 没有用于该任务的 `--dry-run`；`--list` 是只读发现，临时目录安装才验证实际复制结果。

按 README 在临时工作区运行环境检查、脚手架和两秒检查片。真实 API 不属于无凭据验证范围；采用自己的 Key 做测试时，先理解对应服务的计费。

## 上传前

- 只发布 `v2` 内的发行文件；不要复制 `v2-maintenance`、整个原工作区、临时安装目录、生成片或本机日志。
- 打包时包含 `.github`、`.gitignore` 和 `.env.example` 等点文件，排除 `node_modules`、真实 `.env`、Cookie、缓存、私有审阅数据。
- 敏感扫描只能发现已定义的模式；检查 Git 暂存区与最终压缩包，尤其是你自己额外添加的配置与素材。
- 保留上游许可证、第三方文件头和来源声明。
- 上传后再运行 `npx skills add waker240/FullVideoProductionSkill --list`，确认远程显示本版 13 个技能。

无需把这个仓库发布成 npm 包。`npx skills` 运行的是安装器，技能来源是 GitHub 仓库。
