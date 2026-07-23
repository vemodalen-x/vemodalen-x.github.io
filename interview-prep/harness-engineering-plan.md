# Harness Engineering 面试化学习路线

资料：[deusyu/harness-engineering](https://github.com/deusyu/harness-engineering)；概念源头与案例对照：[OpenAI《工程技术：在智能体优先的世界中利用 Codex》](https://openai.com/zh-Hans-CN/index/harness-engineering/)。

这条路线研究的不是“怎样再写一层 prompt”，而是怎样设计仓库、约束、工具、反馈和评估，使 Coding Agent 能发现正确上下文、执行可验证工作，并把失败沉淀成下一次可复用的系统能力。

## 先消除两个 Harness 的歧义

| 层次 | 关键问题 | 当前准备包中的位置 |
| --- | --- | --- |
| Agent 运行时 Harness | 模型怎样接收上下文、调用工具、循环、授权、恢复和终止？ | [《深入理解 AI Agent》AID-1/2/4/6](ai-agents-in-depth-plan.md) |
| 仓库工程 Harness | 仓库怎样表达意图、暴露状态、强制不变量、提供反馈并清理漂移？ | 本路线 HE-0–HE-7 |
| 模型能力 | 模型本身能否推理、生成、遵循指令和使用工具？ | 模型替换实验；不要把模型问题和 Harness 问题混为一谈 |

推荐依赖是 `AID-1 -> AID-5 -> HE-1 -> HE-3 -> HE-6`。前者解释 Agent 如何运行，后者解释怎样让真实代码仓库成为可持续的执行环境；两者不是重复阅读。

## 来源层级与适用边界

- OpenAI 文章是一支团队从零构建、极高 Agent 吞吐环境中的案例，不是所有团队的通用定律。仓库中的概念页、思考页和 Demo 是作者对多份材料的中文整理、扩展与质疑，应继续回查其引用的一手来源。
- “约 100 行 AGENTS.md”“等待成本高于纠错成本”等是特定环境中的设计选择，不是硬指标。个人项目、遗留系统、低测试覆盖或高风险发布应重新计算收益与风险。
- 测试、linter 和 LLM judge 都不能单独证明用户意图已满足。行为正确性、产品判断和高风险决策仍需要可校准的人类验证。
- 仓库会持续更新；学习完成度按自己的可检查产物与延迟复测计算，不按目录篇数、star 或 commit 数计算。

## 8 个递进 Session

每次先闭卷审计 8–10 分钟，再定向阅读 15–20 分钟，最后修改一个真实仓库或最小示例。只写摘要不算完成。

### HE-0 · 定义、边界与基线

- **阅读**：`concepts/00-overview.md`、`concepts/06-harness-definition.md`。
- **问题**：`Agent = Model + Harness` 中哪些能力在模型外？运行时 Harness 与仓库工程 Harness 分别控制什么？
- **输出**：对一个真实任务画出 Model / Harness / Repository / Human 四层边界；记录当前一次完成率、返工次数、验证时间和最常见失败。
- **过关**：面对失败，能提出区分模型、上下文、工具、仓库和评测缺陷的对照实验。

### HE-1 · Repo as System of Record：地图而非手册

- **阅读**：`AGENTS.md`、`concepts/01-repo-as-source-of-truth.md`，并与 OpenAI 原文的“记录系统”和“渐进式披露”部分对照。
- **问题**：Agent 看不到的架构决策、产品约束、运行命令和验收标准在哪里？什么应该进入入口地图，什么应该下沉到专题文档？
- **输出**：建立一份紧凑 `AGENTS.md` 地图，链接架构、规范、执行计划、验证命令和所有权；列出至少 5 项隐藏在聊天、外部文档或个人记忆中的 dark knowledge。
- **迁移**：把任务交给一个没有对话历史的新 Agent；记录它第一次走错的位置并修复导航，不直接给临时提示。
- **过关**：入口短而稳定、链接可达、信息有唯一真源；新 Agent 能逐层发现完成任务所需的上下文。

### HE-2 · Spec as Product：把意图变成可验证接口

- **阅读**：`concepts/07-spec-as-product.md`。
- **问题**：SPEC 应固定问题、边界和可观察行为到什么程度，又该为实现保留多少自由？哪些隐性人工流程需要写成 WORKFLOW？
- **输出**：为一个功能写 SPEC + WORKFLOW：用户旅程、输入输出、非目标、不变量、失败语义、验收示例和升级点；不指定无必要的库或内部实现。
- **迁移**：让两种实现或两个独立 Agent 按同一 SPEC 工作；把分歧归因为规范歧义、实现错误或缺失验证。
- **过关**：验收标准能区分“测试通过”与“用户意图满足”，同时没有把 SPEC 写成逐行实现说明。

### HE-3 · Guides × Sensors：把品味编码成回压

- **阅读**：`concepts/02-mechanical-enforcement.md`、`concepts/06-harness-definition.md`、`scripts/check-consistency.sh`。
- **问题**：哪些问题应在行动前由 guide 预防，哪些应在行动后由 sensor 检出？什么时候用确定性检查，什么时候才值得用推理型评审？
- **输出**：完成四象限矩阵：计算型 guide、推理型 guide、计算型 sensor、推理型 sensor；为自己的仓库实现 2 个确定性检查，例如依赖方向、文档一致性、边界解析或关键流程 smoke test。
- **设计约束**：失败消息必须包含规则、证据位置和修复办法；高频、确定性的规则广泛执行，昂贵或主观评审只用于高风险 slice。
- **过关**：能把一条重复出现的 review comment 转成机械约束，并证明它不会误伤合法实现。

### HE-4 · Agent Readability 与 Harnessability

- **阅读**：`concepts/04-agent-readability.md`、`tools/00-overview.md`。
- **问题**：Agent 能否在独立 worktree 启动系统、读取 UI/日志/指标/trace、定位失败并重跑验证？技术选择的隐藏知识和验证成本有多高？
- **输出**：用 context pressure、promptability、exploration convergence、state entanglement、dark knowledge、verification cost 六维审计一个子系统；补一条最短可复现路径和一个可查询观察信号。
- **过关**：另一个无历史 Agent 能在限定时间内复现故障、找到证据并验证修复；不能只靠“常用技术”或代码行数声称系统可驾驭。

### HE-5 · 吞吐、合并经济学与熵管理

- **阅读**：`concepts/03-entropy-and-garbage-collection.md`、`concepts/05-throughput-changes-merge.md`、`thinking/harness-for-solo-developers.md`。
- **问题**：在你的发布风险、返工成本和 Agent 吞吐下，等待成本真的高于纠错成本吗？哪些坏模式会被 Agent 复制并放大？
- **输出**：定义 merge gate 分级；建立 entropy register，记录漂移模式、检测信号、自动修复、owner、复发率和退役条件。
- **迁移**：分别为高吞吐团队、个人项目和高风险系统选择不同门禁；不能照搬“短 PR、快速合并”。
- **过关**：用实际数据说明该加门、移门还是把规则转为后台维护，而不是只引用案例数字。

### HE-6 · 行为正确性、评估与人类校准

- **阅读**：`thinking/evaluation-elephant-in-the-room.md`、`practice/01-ralph-demo/README.md`，回查 AID-6。
- **问题**：为什么单元测试、结构检查、模型自评和 LLM judge 都可能给出虚假安全感？谁验证最终结果确实满足用户意图？
- **输出**：建立验证阶梯：静态不变量 → 单元/集成 → 关键用户旅程 → 对抗案例 → 人工校准；为每层定义失败归因、上线门槛和升级条件。
- **迁移**：注入“所有测试通过但用户旅程错误”的样本，以及“自评完成但缺少交付物”的样本；验证 Harness 会拒绝结束。
- **过关**：结构质量与行为正确性分别报告；LLM judge 有人工标注集、分歧 slice 和抽检策略。

### HE-7 · Capstone：把一个仓库改造成 Agent 可工作的环境

- **任务**：选择一个真实小仓库，先让陌生 Agent 完成一次中等改动并记录失败；随后只改 Harness，不换模型，再做等难度任务。
- **必须包含**：入口地图、SPEC/WORKFLOW、任务包、可运行环境、2 个确定性 sensor、行为验收、观察信号、停止/升级条件、entropy register。
- **对照**：记录首次正确率、定位时间、无效工具调用、返工次数、人工介入和行为测试通过率；明确样本很小时只能作为方向性证据。
- **故障注入**：过期文档、错误成功信号、隐性依赖、并行冲突、flaky test、结构正确但用户行为错误。
- **证据**：before/after trace、最小 patch、评估表、10 分钟讲解录音和一次 D+7 零提示复测。

## 两周内的最小激活路径

| 日程 | 动作 | 交付物 |
| --- | --- | --- |
| Day 1 | AID-1 + HE-0 | 两类 Harness 边界与基线 |
| Day 2 | AID-5 + HE-1 | Coding Agent trace + 仓库地图 |
| Day 3 | HE-2 | SPEC + WORKFLOW |
| Day 4 | HE-3 | Guides × Sensors 矩阵 + 第一个检查 |
| Day 5 | HE-3 | 第二个检查 + 误报测试 |
| Day 6 | HE-4 | 可运行/可观察性审计 |
| Day 7 | D+1/D+3 复测 | 陌生任务导航与故障复现 |
| Day 8 | HE-5 | merge gate + entropy register |
| Day 9 | AID-6 + HE-6 | 行为验证阶梯 |
| Day 10–12 | HE-7 | before/after capstone |
| Day 13 | 45 分钟 system design mock | 评分卡与最大误差 |
| Day 14 | 随机故障注入 | 延迟无辅助迁移证据 |

嵌入原六周计划时，Agent/Coding Agent 岗只激活 HE-1、HE-3、HE-6；它们替换一次 Codemia 白板、重复的 Agent 阅读和一次泛化系统设计，不增加第 5 周总时长。HE-2/4/5/7 在明确命中 Agent infra、Developer Productivity 或 Coding Agent JD 时激活。

## 面试追问池

1. 为什么大型 AGENTS.md 会降低而不是提高 Agent 表现？怎样验证入口地图是否有效？
2. 一条架构原则何时应保留为文档，何时应升级为 linter 或结构测试？
3. Guide 与 sensor、计算型与推理型检查分别适合什么失败？给一个放错位置的反例。
4. 为什么错误消息也是 Harness 的一部分？怎样让它既能定位又能提供安全修复路径？
5. worktree 可运行、日志可查询、UI 可驱动分别消除什么验证瓶颈？
6. 哪些条件下“等待成本高于纠错成本”不成立？高风险系统如何调整 merge gate？
7. Agent 为什么会放大仓库中的坏模式？熵清理怎样避免变成无休止重构？
8. 测试全绿但用户意图未满足时，验证链缺了哪一层？
9. 如何校准 LLM judge，避免模型自评与同源 judge 共同过度乐观？
10. 怎样用固定模型的 before/after 任务证明 Harness 改进，而不是任务更简单或偶然成功？

## 完成定义

- HE-1、HE-3、HE-6 各完成一次即时练习和一次 D+1/D+3 零提示变式复测。
- 至少一个真实仓库拥有可检查的入口地图、SPEC/WORKFLOW、2 个机械检查和行为验收。
- 能明确区分上游案例事实、仓库作者的综合判断与自己的实验结论。
- 能说出这套方法不适用或需降级的场景，并用团队规模、发布风险、验证成本和吞吐解释。
- Capstone 在固定模型、近似难度任务下留下 before/after 证据；没有足够样本时不宣称因果提升。
