# AI 时代的人机学习操作系统

这不是一份新增课程，而是现有面试知识库的执行协议。目标不是比 AI 读得更多、写得更快，而是让人保留问题定义、领域判断、验证、取舍和责任，同时把检索、比较、生成变式、搭脚手架和机械执行交给 Agent。

适用范围：Senior AI Engineer、CV / Edge ML、Applied AI、AI Agent 与 Forward Deployed Engineer。完整岗位路线仍由[统一练习脉络](practice-roadmap.md)和[FDE 执行索引](fde-2026-practice-index.md)决定；本文件只改变“怎样学”。

## 1. 北极星：Human Leverage，不是内容吞吐量

把学习目标写成一个方向性公式：

> **Human Leverage = 问题质量 × 领域判断 × 验证能力 × Agent 编排 × 结果所有权 ÷ 反馈周期**

这个公式不是可精确测量的分数，而是决策检查表。AI 可以缩短反馈周期、扩大并行度；如果问题定义、验收标准和审计能力接近零，速度只会更快地产生错误或伪熟练。

真正要优化的不是“今天看了多少”，而是：

- 能否在没有 AI 时解释、实现、诊断和做决定；
- 能否把目标、上下文、边界和验收条件交给 Agent；
- 能否发现 Agent 结果中的错误、遗漏、权限与风险；
- 能否把一次成功沉淀成测试、评测集、runbook 或可复用机制；
- 能否在新的题目、客户或约束下再次完成。

## 2. 同时维护两本能力账

### 人的基础账户

记录无辅助能力：闭卷解释、白板推导、独立编码、故障定界、取舍、反驳、客户沟通。它决定你是否理解问题、能否承担最终判断。

### Agent 杠杆账户

记录增强能力：任务分解、上下文选择、工具契约、并行委托、验收测试、trace 审计、失败恢复和产物沉淀。它决定你是否能把个人能力放大为团队与系统能力。

两本账不能互相冒充。Agent 生成了正确答案，不等于人的基础账户升级；人能手写一个 demo，也不等于会设计可靠的 Agent 工作流。Learning OS 会要求记录本次最高 AI / Agent 介入；旧记录保守显示为“AI 未记录”，不能追溯性地充当无辅助证据。

## 3. 四阶段人机学习回路

每个主题、题目和项目都执行 H0 → A1 → H2 → T3。Learning OS 的六阶段 Session 是这四步的界面展开。

| 阶段 | AI 状态 | 你要做什么 | 必须留下的证据 |
| --- | --- | --- | --- |
| H0 Human Baseline | **AI OFF** | 预测、闭卷作答、列未知、写信心 | 首次答案、假设、不确定性地图 |
| A1 Agent Leverage | **AI ON，先给契约** | 让 Agent 比较、质疑、生成变式或搭建最小实现 | 委托契约、产物、引用或 trace |
| H2 Human Audit | **人负责，AI 可作对手** | 用测试、真源、反例、安全和成本检查结果 | 测试结果、失败分类、修订决定 |
| T3 Delayed Transfer | **AI OFF** | 隔天或到期后，在新约束下重做并解释 | 无辅助变式、评分、下一复习日 |

### H0：先暴露真实状态

在任何搜索、总结或代码生成前，用 5–15 分钟写：结论、机制、一个最小反例、最大未知和作答前信心。不会时写 `unknown`，不要用漂亮语言掩盖空白。

### A1：Agent 用于扩大搜索空间

Agent 最有价值的角色是对手、研究助理、实现者和测试生成器。不要只问“给我答案”，而要指定：目标、已知上下文、限制、非目标、输出格式、验收测试、权限和停止条件。

### H2：人承担验证和发布判断

不接受“看起来合理”。至少检查一个真源、一个正常测试、一个边界测试和一个失败模式。涉及工具副作用、客户数据、身份权限或生产发布时，再检查审批、审计、回滚和 owner。

### T3：延迟迁移才结算

看过答案后的复述只算候选证据。D+1、D+3、D+7 或系统到期时关闭 AI，改变数据、规模、设备、客户、错误成本或角色后重做。只有记录 `AI 未使用`、没有请求内置提示，且 Transfer 与 Independence 都达到 3，才算进入稳定账户；使用 AI 的复测仍可留下诊断证据，但不计入无辅助通过。

## 4. Session 中何时开关 AI

| Learning OS 阶段 | 默认策略 | 允许的 AI 行为 | 禁止替代的人的行为 |
| --- | --- | --- | --- |
| Orient | **先定义** | 帮你检查目标是否可验证 | 替你决定目标与成功标准 |
| Retrieve | **AI OFF** | 不使用 | 预测、闭卷回答、标未知 |
| Construct | **AI OPTIONAL** | 契约后生成脚手架、比较方案、补测试 | 核心判断、关键实现解释、验收 |
| Challenge | **AI AS CRITIC** | 生成反例、约束变化、追问 | 接受批评或修订的决定 |
| Feedback | **HUMAN VERIFIES** | 提供第二评分和证据缺口 | 最终评分与能力归因 |
| Consolidate | **AI OFF** | 不使用 | exit ticket 与延迟迁移 |

如果公司面试明确禁止 AI，模拟时整场 AI OFF；如果允许 AI，必须记录使用范围，并能逐行解释、修改和测试所有产物。

## 5. 学什么：五级优先过滤器

新内容只有通过上层过滤器，才进入当天计划：

1. **72 小时内真实面试**：先修该轮次的硬缺口。
2. **当前唯一激活岗位的 Top Gap**：不是同时准备五种身份。
3. **证据缺口**：知道概念但没有代码、trace、指标、故事或决策记录。
4. **可复用生产机制**：eval、ACL、tool contract、rollback、observability、incident、adoption。
5. **新奇内容**：模型新闻、框架更新、论文和新课程排在最后。

每天只能有一个主缺口。新增材料必须替换同等时长的低优先事项，不能把知识库无限扩成待办清单。

## 6. 停止清单：主动删除低回报学习

- 不按仓库、课程或 PDF 目录顺序学完；只取当前缺口所需章节。
- 不把每日模型新闻追踪当主线；每周最多一个 30 分钟情报窗口。
- 不收藏没有对应产物的 AI 摘要。
- 不接受没有测试、引用、trace 或失败分母的生成结果。
- 不先学框架 API 再找问题；先定义 workflow、状态、工具和验收。
- 不把题数、连续打卡、观看时长或页面停留当掌握。
- 不同时激活多个真实岗位；每次只围绕一个 JD 配置练习。

## 7. 个人化内容结构：守住壁垒，再完成迁移

### 继续复利的强项

保留并深化生产 CV、模型生命周期、PyTorch / TFLite / ONNX、Runtime C++ / Android / NDK、golden cases、failure taxonomy、release gates、跨团队与客户交付。这些不是旧时代包袱，而是 Agent 可靠性最稀缺的工程直觉来源。

### 把旧壁垒翻译成 Agent / FDE 语言

| 已有能力 | Agent / FDE 迁移表达 | 面试产物 |
| --- | --- | --- |
| Golden cases / hard cases | Agent eval suite / adversarial slices | 评测集、失败分母、release gate |
| 训练—端侧 parity | model / tool / Harness parity | 固定模型与 Harness 消融、trace 对照 |
| 设备延迟与内存预算 | token、latency、cost、sandbox budget | admission policy、降级和容量表 |
| 模型发布门槛 | canary、rollback、kill switch | production-readiness card |
| 现场失败分类 | trace replay、failure taxonomy | incident timeline、可重放失败样本 |
| 跨团队产品发布 | discovery、pilot、adoption、handoff | value hypothesis、pilot memo、runbook |

### 必须补齐的窄缺口

优先补企业身份与数据边界、ACL-first RAG、tool/state contracts、Agent eval 与安全、受限/本地部署、discovery、ROI 与采用。Kubernetes 和 hyperscale serving 先学到能设计、诊断和沟通边界；没有生产证据时不要包装成多年 owner 经验。

## 8. 每日模式：Learn + Ship + Close

### 最小 20 分钟

- 10 分钟 Learn：6 分钟 AI OFF 基线，4 分钟查一个最小真源。
- 8 分钟 Ship：完成一个测试、反例、图、答案卡或 story delta。
- 2 分钟 Close：写最大误差、证据位置和下次日期。

### 标准 75 分钟

- 25 分钟 Learn：8 分钟 AI OFF 基线；10 分钟 Agent 质疑/补缺；7 分钟 AI OFF 重构。
- 40 分钟 Ship：20 分钟 Agent 辅助构建；15 分钟人工测试与审计；5 分钟把产物包装为可复用证据。
- 10 分钟 Close：记录最重要错误、当前岗位、证据状态和下一次到期复测。

### 深度 120 分钟

- 45 分钟 Learn：完整机制、真源和对照。
- 60 分钟 Ship：实现、故障注入、评测、修订和运行记录。
- 15 分钟 Close：2 分钟口述、证据账本、岗位映射和下周复用点。

任何模式都不能省略 AI OFF 基线和人工审计。时间不足时缩小任务，不删除验证。

## 9. 每周节奏：从理解到可雇用证据

| 日 | 主动作 | 典型证据 |
| --- | --- | --- |
| 周一 | 机制与闭卷基线 | 90 秒解释、原语图、未知清单 |
| 周二 | 最小实现 | 可运行切片、测试、README |
| 周三 | 故障注入 | 失败 trace、taxonomy、修复假设 |
| 周四 | 跨域迁移 | CV→Agent、Edge→Serving、发布→Pilot 对照 |
| 周五 | 表达与外部 Ship | case memo、作品更新、定向 outreach |
| 周六 | 端到端 mock | coding / system / FDE case 录音或记录 |
| 周日 | 证据与求职漏斗复盘 | 到期任务、Top Gap、岗位 go/hold/reject |

如果没有真实面试流程，周五仍要 Ship 一个可被外部观察的结果；不自动发送申请或消息，最终外部动作由人确认。

## 10. 能力阶梯：只有 Transfer 之后才叫掌握

1. **Familiar**：见过术语。
2. **Explain**：能说清目标、机制、假设和反例。
3. **Build**：能产出最小实现或结构化决策。
4. **Break**：能设计失败、测试与诊断路径。
5. **Transfer**：新约束下无辅助完成。
6. **Defend**：能应对追问、反对意见和替代方案。
7. **Ship**：能在真实边界中发布、观测、回滚并承担结果。

知识库章节只能帮助 Familiar / Explain；交互任务帮助 Build / Break；延迟复测验证 Transfer；mock 和真实项目才可能支持 Defend / Ship。

## 11. Agent 委托契约

每次调用 Agent 前，尽量写清以下九项：

1. **Goal**：这次要改变哪个可观察结果？
2. **Context**：最小且高信号的背景、文件、样例和真源是什么？
3. **Constraints**：时间、技术、数据、部署、风格和兼容性限制。
4. **Non-goals**：明确不做什么，防止范围漂移。
5. **Output contract**：文件、表格、代码、图、trace 或答案的格式。
6. **Acceptance tests**：哪些测试和指标通过才算完成？
7. **Authority**：允许读、写、运行、联网、发布或联系谁？
8. **Stop conditions**：何时必须暂停并请求人类决定？
9. **Evidence**：需要返回哪些来源、命令结果、diff、日志或剩余风险？

## 12. 人工审计清单

接收 Agent 产物时逐项回答：

- 关键事实能否追溯到真源？哪些只是推断？
- 隐含假设、数据范围、版本和时间点是什么？
- 正常、边界、失败与回归测试是否真的运行？
- 是否遗漏权限、注入、PII、secret、租户隔离或副作用？
- latency、cost、capacity、fallback 和 rollback 是否可接受？
- 另一个人能否凭文件、版本、命令和 trace 重放？
- 最终决定、风险接受和对外承诺由谁承担？

无法回答时，产物只能标为 draft，不能进入个人证据库或面试强主张。

## 13. 面试中的人机协作信号

面试官真正想观察的不是你能否按下 AI 按钮，而是：

- 是否先澄清问题和验收标准；
- 是否知道该给 Agent 什么上下文、该保留什么判断；
- 是否能发现生成代码和架构中的错误；
- 是否用工具缩短实现时间但不牺牲测试与安全；
- 是否能在 Agent 失败、超时、循环或越权时恢复；
- 是否对最终答案和客户结果负责。

准备时同时保留一场全程 AI OFF mock 和一场允许 AI 的透明协作 mock。后者记录 Agent 做了什么、你否决了什么、验证了什么。

## 14. 未来七天启动方案

这套启动方案与[统一练习脉络的第一个七天](practice-roadmap.md#第一个七天直接照此开始)是同一条路线，不是额外任务。

### Day 0：双账户与真实基线

选择当前唯一岗位；完成 `HL-1`（30 分钟）和 45 分钟闭卷基线。记录 AI OFF 分数、未知和作答前信心，不读答案。

### Day 1：委托契约与个人定位

完成 `HL-2`（35 分钟），把一个现有任务改写为九项契约；再用 40 分钟完成 30 秒/2 分钟定位和一个母故事。

### Day 2：ML 基础的完整人机回路

闭卷回答 M1，完成 Deep-ML 10；在 Agent 补缺后人工检查 orientation、分母、边界和实现，再关闭 AI 重构答案。

### Day 3：对抗审计与编码

完成 `HL-3`（40 分钟）。再做 Two Sum，把 AI 生成或建议的实现当待审计输入，不因题简单跳过沟通与边界测试。

### Day 4：数值稳定与诚实缩减

闭卷回答 M2/M4，完成 Deep-ML 23 并测试大 logits。到 75 分钟仍未验证完，就移动 M4，不用压缩测试伪装完成。

### Day 5：迁移个人壁垒

完成 Binary Search；再把一个 CV / Edge 项目的 golden cases→Agent eval、parity→Harness 消融、release gate→canary/rollback 写成三列映射。

### Day 6：双模式模拟

完成 Reverse Linked List，再做 35–40 分钟 breadth + story mock。至少一半时间 AI OFF；若使用 Agent，记录它做了什么、你否决和验证了什么。

### Day 7：延迟迁移与删减

完成 `HL-4` 和到期 D+1/D+3 复测。关闭 AI 重做一个变式；删除下周一个低回报阅读任务，把时间让给本周最大的迁移缺口。

## 15. 每周复盘只看七个问题

1. 本周唯一激活岗位是什么？
2. 最大能力缺口和最大证据缺口分别是什么？
3. 哪项工作在 AI OFF 时仍能完成？
4. Agent 把哪项工作加速了，代价和错误是什么？
5. 哪个输出经过了真源、测试、失败和安全审计？
6. 哪个能力通过了延迟、变式、无辅助迁移？
7. 下周要删除什么，而不是继续增加什么？

## 16. 证据来源与边界

- [OpenAI：Harness engineering](https://openai.com/index/harness-engineering/)提供“人设计环境、意图和反馈回路，Agent 执行”的生产案例；它是特定团队经验，不自动适用于所有仓库和组织。
- [Anthropic：Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)强调上下文是有限资源，应保留最小高信号信息并设计工具与状态管理。
- [Anthropic：Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)用于建立任务、轨迹、结果与失败分类的评测语言。
- [METR：Measuring AI Ability to Complete Long Tasks](https://metr.org/time-horizons/)的时间跨度衡量的是任务对人类的难度，不应误读为 Agent 按同样墙钟时间工作。
- [METR：2025 experienced open-source developers RCT](https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf)显示特定样本和工具条件下使用 AI 反而更慢；[2026 更新](https://metr.org/blog/2026-02-24-uplift-update/)提示工具与选择效应正在变化，但证据仍需谨慎解释。
- [Microsoft Research：Rethinking AI in knowledge work](https://www.microsoft.com/en-us/research/articles/rethinking-ai-in-knowledge-work-from-assistant-to-tool-for-thought/)提示纯自动化交互可能压缩思考与保留，应把 AI 设计成促进判断的认知工具。

这些来源支持的是操作原则，不是“AI 一定更快”或“人一定更好”的普遍结论。最终策略要由你自己的任务、错误率、延迟迁移和真实面试结果校准。
