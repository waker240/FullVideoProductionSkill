# 审计日志(Audit Log) — 自我修改的暂存台账

审计循环(见 `audit-loops.md`)的**工作台账**。来自全新视角子智能体的提议会带着置信度等级落地于此并等待。只有通过关卡的内容(`audit-loops.md` § 有门槛的写回)才会被写入该技能。这份文件记录的是该技能自我改进*进行中*的状态;`field-notes.md` 记录的是*已应用、已验证*的变更及其持久依据。

**各章节内只追加,不删除。不要删除提议**——当某条提议被拒绝或被取代时,标记它,而不是抹去它。"曾被提议又被拒绝"这段历史本身就是信号(它能阻止同一个坏想法在每次审计中被重新提出)。

---

## 如何使用这份文件

- **Loop B(技能审计)提议** → 记录在"技能修改提议"下,带 Low/Medium/High 置信度。
- **Loop A(输出审计)缺陷类别** → 统计在"输出审计统计"下。当某类别达到复发阈值(默认:3 个不同视频)时,开启一次 Loop B 审计,并将其转为一条携带该证据的技能修改提议。
- **已应用的修改**(自动或经批准)→ 移动到"已应用"部分,附带日期、驱动该修改的视角、应用时的置信度。交叉引用对应的 `field-notes.md` 条目。
- **关卡提醒:** 只有 High + 减法性/澄清性 + 非承重 + 自我记录在案的内容才可自动应用。其余一律等待用户。承重集合(禁止自动编辑):主干的 6 条规律、Style Register Library(风格register库)锁定、导演单契约、频道锁定锚点坐标。

---

## 技能修改提议(在途)

格式:

```
### [PROPOSAL-id] — YYYY-MM-DD — [confidence: Low/Medium/High] — [status: staged / surfaced / applied / rejected]
- Lens(es): which auditor(s) raised it (+ whether independent convergence)
- Target: file §section
- Type: WRONG / MISSING / BLOATED / CONTRADICTORY  (+ subtractive? yes/no)
- Problem: {concrete}
- Proposed edit: {concrete change}
- Spine/doctrine implicated: {#N or name}
- Output evidence: {Loop-A recurrence signal, if any}
- Gate check: {which gate conditions met / failed}
- Resolution: {pending | applied on DATE | rejected because X | superseded by PROPOSAL-id}
```

### [P-001] — 2026-06-22 — [置信度:Medium] — [状态:已按反转版本拒绝原提议并应用]
- 视角:对 Education Ep4(8 个场景)的 Loop-B 汇总审查。印证 = 跨幕独立收敛。
- 目标:`reference.md` § Style Register Library → 新增"对承重文字信任 gpt-image-2"小节。
- 类型:MISSING(缺失)
- 提议时的问题描述:声称 gpt-image-2 生成的字形对承重文字不可靠;两幕(第 3 幕 ADP 数据、第 6 幕葛兰西引文)采用了双重编码(栅格牌卡 + SVG/代码文字叠加)以确保正确性。
- 用户纠正(2026-06-22):真正的教训是相反的。只要提示写得有纪律,gpt-image-2 完全*可以*被信任用于承重文字——子智能体所做的双重编码是过度谨慎,而不是最佳实践。`video-generation-mcp` 技能已经记录了这种能力(逐字引用、字体命名、编号区域、反乱码条款、音译质检)。唯一的失败模式是提示词写错了,应该在提示词层面修复,而不是退回到代码叠加。
- 已应用的修改:在 § Style Register Library 中新增"信任 gpt-image-2 处理承重文字(不要双重编码)"——教授信心以及赢得这种信心所需的提示纪律,并明确禁止"预留空白+叠加"这种权宜做法。
- 牵涉的主干/教条:约束一/二(artifact层);交叉引用 `video-generation-mcp`。
- 解决方案:已于 2026-06-22 应用(按用户指示反转)。原始的"保证文字叠加"提议已被**拒绝**——见"已拒绝/已取代"部分。

### [P-002] — 2026-06-22 — [置信度:Medium] — [状态:已呈报]
- 视角:对 Ep4 的 Loop-B 汇总审查。收敛点:NC 在开场/第 4 幕/第 7 幕中被以相同方式接入;在 reference.md § Implementation Status 中被标记为"延后——代码待定"。
- 目标:`reference.md` § Negative Cinema(负电影) → Implementation(扩充这个单薄的"实现"小节)。
- 类型:MISSING(将既有教条操作化为一份可复用的工程契约)
- 问题:该技能描述了 NC 这一概念,但没有描述其协调性抑制机制。Ep4 构建了一份值得记录的干净实现。
- 提议的修改:记录**声明式 NC 窗口契约**——一幕在一处声明 `NC_BEATS: [start,end][]`(相对于音频的帧区间);**三个**独立子系统读取同一份列表:(a) 字幕渲染器保持字幕块不变并让渐晕降为 0(`inNCWindow`),(b) 后期特效通过 `useNCDriver(windows, fadeFrames)` 对每个效果做乘法抑制(窗口外为 1 → 窗口内为 0,带缓动),(c) 常驻舞台让其底材/粒子/徽标一并变暗。单一事实来源 → 协调一致的静默;默认值为空 → 没有 NC 的幕不受影响。
- 牵涉的主干/教条:Negative Cinema(负电影);主干 #6(最空的一帧即为惊艳动作)。
- 输出证据:开场/第 4 幕/第 7 幕全部接入了同一个 `ncWindows` SceneShell 属性。
- 关卡检查:新增性 → 呈报,不自动应用。
- 解决方案:已于 2026-06-22 应用(用户已批准)。在 `reference.md` § Negative Cinema → Implementation 中扩充了"声明式 NC 窗口契约"。

### [P-003] — 2026-06-22 — [置信度:Low-Medium] — [状态:已呈报]
- 视角:对 Ep4 的 Loop-B 汇总审查(第 4 幕在 `timing.ts` 中明确记录了补救方案)。
- 目标:`reference.md` § Word-Lock & Timing(逐词锁定与时序)(或在 Receiver-Runway 相邻的手法说明中加一条简短说明)。
- 类型:MISSING(手法层面的补救措施)
- 问题:强制对齐(forced-alignment)STT 在某些窗口中会打乱字幕块的起始帧;该技能没有记录任何补救措施,导致逐词锁定错位。
- 提议的修改:**强制对齐鲁棒性**——当某个 STT 窗口非单调/存在重叠时,不要在该窗口内做逐词锁定。只对已验证为单调的锚点做段落起始横幅的硬锁定,让一个连续(非逐词锁定)的画布层对象在损坏区间内承载运动。仅从已确认为单调的字幕块推导 `anchors.ts`。
- 牵涉的主干/教条:Receiver-Runway(重新进入)、逐词锁定纪律。
- 输出证据:第 4 幕第 0008-0028 号字幕块;修复方案已记录在 `scenes/act4/timing.ts` 中。
- 关卡检查:新增性,单一来源 → 呈报。
- 解决方案:已于 2026-06-22 应用(用户已批准)。在 `reference.md` 中新增了 § Forced-Alignment Robustness(强制对齐鲁棒性)(位于 Audio Pre-Buffer Sign Discipline 之后)。

### [P-004] — 2026-06-22 — [置信度:Low] — [状态:staged] — 路由到别处(不属于本技能)
- 视角:对 Ep4 的 Loop-B 汇总审查。
- 说明:以下内容虽然浮现出来,但应归入*其他*文档,而非本设计技能:
  - **场景桶装的 Stage/Shots/PostFX 文件三件套** + 从字幕推导 `anchors.ts` → `.cursor/rules/act-setup-from-audio.mdc`(代码库约定,而非设计教条)。收敛度 8/8。
  - **解析式三次贝塞尔路径求值(SSR 安全,避免 `getPointAtLength`)**,用于帧确定性的路径上粒子运动 → `video-motion-references`(Remotion 实现层的坑)。
  - **将重复的原语提取为代码**(`SectionBanner`、`FootCorner`、带 `entryP`+drop+breathe+strain/spent/glow 的 `Cutout` 形状、局部的 `Vignette`、`ParticleColorArc`、`ProliferationGrid`)整合进共享组件库 → 属于代码库重构,而非技能修改。每一项都只是某个已被记录教条(论证状态外化器 / Receiver-Runway 标签 / "不做静态贴纸" / 粒子色彩弧线 / 单素材复制)的一个*实例*,所以该技能已经覆盖了*为什么*;只是代码本身重复了。
- 解决方案:已记录;按用户请求路由到上述文档。**不是**一次 video-content-strategy 的修改。

### 收敛验证说明(不是提议——是教条成立的证据)
Ep4 的清单中,大多数内容都是对**既有**教条的忠实实现,收敛度为 8/8:Diegetic Stage(叙境内舞台)(§ Diegetic Stage Pattern)、Continuous Canvas Thread(连续画布线索)(§ Network Evolution)、Corner Anchor(角落锚点)(§ Most-Recent Dossier Anchors the Corner)、暗淡的栅格底材(§ Multi-Asset Scene Composition)、增殖网格(§ Single-Asset Code Replication)、后期特效"充能节拍而非壁纸"(§ Cinema Layer / Video-Arc Drift)、粒子色彩弧线(§ Density Rhythm)。如此高的收敛率是这些教条正确且适用的有力印证——将其记录为一个健康信号,而非一个缺口。

---

## 输出审计统计(复发跟踪)

每一行是一个输出缺陷的*类别*,附带其出现过的不同视频计数。当计数 ≥ 复发阈值时,它就晋升为一条技能修改提议。

| 缺陷类别 | 出现于哪些视频 | 计数 | 视角 | 主干/教条 | 状态 |
|---|---|---|---|---|---|
| *(暂无)* | — | 0 | — | — | — |

---

## 已应用(自我修改的审计轨迹)

循环实际写入该技能的每一次修改,按最新排序在前。这是人类审计这个审计者、并能够撤回修改的方式。

格式:`### YYYY-MM-DD — [PROPOSAL-id] — [auto-applied / approved] — driving lenses — confidence — field-notes ref`

### 2026-06-22 — [P-002] — 已批准 — Loop-B Ep4 汇总审查(开场/第 4 幕/第 7 幕收敛) — Medium
- `reference.md` § Negative Cinema → Implementation:新增"声明式 NC 窗口契约"(一份 `NC_BEATS` 列表 → 字幕保持+渐晕降为 0 / `useNCDriver` 后期特效抑制 / 舞台变暗)。

### 2026-06-22 — [P-003] — 已批准 — Loop-B Ep4 汇总审查(第 4 幕已记录补救方案) — Low-Medium
- `reference.md`:新增 § Forced-Alignment Robustness(强制对齐鲁棒性)(在打乱的 STT 窗口中不做逐词锁定;只对已验证单调的段落起始做硬锁定;连续画布承载损坏区间)。

### 2026-06-22 — [P-001 反转版] — 已批准(用户指示反转) — Loop-B Ep4 汇总审查 — Medium
- `reference.md` § Style Register Library:新增"信任 gpt-image-2 处理承重文字(不要双重编码)"——教授对该模型字形保真度的信心以及赢得这种信心所需的提示纪律;禁止"预留空白+SVG叠加"这种权宜做法。**注意:** 这与子智能体的直觉**相反**;原始提议见"已拒绝/已取代"部分。

---

## 已拒绝 / 已取代(不要重新提议)

被考虑过但最终否决的提议,附带原因——以免同一个想法在每个审计周期里反复浮现。

### [P-001 原始版] — 2026-06-22 — 已拒绝(已反转)
- 原始提议:"保证文字牌卡"(Guaranteed-Text Plate)——永远不要信任 gpt-image-2 的字形来承载承重文字;始终预留一块空白区域,把引文/数字以 SVG/代码形式叠加上去。
- 拒绝原因(用户,2026-06-22):前提是反的。只要提示得当(逐字引用、字体命名、编号区域、反乱码条款、音译质检——均已记录在 `video-generation-mcp` 中),gpt-image-2 完全可以被信任用于承重文字。Ep4 的双重编码是过度谨慎,而不是应被固化的最佳实践。已被"已应用"下记录的反转版修改取代 [P-001 反转版]。未来审计中不要重新提议这种叠加式权宜做法。

---

## 元 — 审计机制自身的健康状况(递归防护)

依据 `audit-loops.md` § "审计者审计自己"进行跟踪。运行技能审计时应审阅本节。

- **审计陈旧度:** 近期审计是否产出了几乎相同的发现?若是 → 更激进地轮换通配符 / 淘汰陈旧的核心视角。上次检查:—
- **写回校准:** 自动应用修改的撤回率(过高 → 关卡太松;从未达到 High → 关卡太紧)。上次检查:—
- **阈值调优:** 复发阈值是触发过于频繁(噪声)还是从不触发(太高)?当前值:3 个不同视频。上次调整:—
