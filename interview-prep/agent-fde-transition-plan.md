# AI Agent 与 Forward Deployed Engineer 转型面试路线

这条路线解决的不是“再学几个 Agent 框架”，而是把现有 AI/CV/Edge 工程能力改造成两类岗位都认可的交付证据。AI Agent Engineer 负责让模型、工具、状态、评测和控制面可靠协作；Forward Deployed Engineer（FDE）负责在陌生客户环境中发现高价值问题，把方案接入既有系统，推进上线、采用和复用。两者共享同一条主干：**从模糊业务问题到可度量、可运行、可审计的生产系统**。

岗位名称变化很快。这里把 OpenAI 的 FDE / AI Deployment Engineer、Anthropic 的 Forward Deployed / Applied AI Engineer、Palantir 的 Forward Deployed Software Engineer 视为相邻但不完全相同的岗位族；申请时仍要逐条映射具体 JD。本路线依据 2026-08-02 可访问的官方岗位与面试资料建立，不把招聘页当永久规范。

## 0. 先给结论

你的目标不应是同时准备两套简历，而应建立一个 T 型候选人模型：

- **纵向深度**：生产级 Agent 系统——任务契约、工具、上下文、状态、eval、安全、延迟/成本和发布。
- **横向交付**：FDE 全周期——发现、范围、原型、集成、上线、采用、反馈和复用。
- **已有差异化**：把 CV、Edge、模型评估和设备/生产约束作为行业深度，而不是在转型时丢掉。

一句候选人定位可以是：

> 我是能把模型能力放进真实工作流的 AI 工程师：既能下钻 Agent 的工具、状态、评测与安全，也能和客户共同定义成功指标，在既有系统约束下完成从原型到生产采用的闭环。

这句话只是待验证假设。它必须由一个端到端作品、两个真实项目故事、一次陌生代码库修改和多次限时 case 共同证明。

## 1. 两类岗位分别在解决什么问题

### 1.1 AI Agent Engineer

核心问题是：当模型可以多轮决策并调用工具时，怎样使整个系统在不确定环境下持续完成任务，同时控制错误、权限、成本和影响半径。

面试信号通常包括：

- 能解释何时固定 workflow 比 Agent 更合适，而不是默认增加自治。
- 能设计 model–tool–environment loop、状态机、上下文预算和终止条件。
- 能写出清晰工具 contract，处理认证、幂等、超时、重试、补偿和审批。
- 能建立 component、trace、end-to-end、safety、latency、cost 分层 eval。
- 能从失败 trace 形成最小复现、回归集、修复和发布门槛。
- 能把 prompt injection、越权、数据外泄和高影响操作放进控制面，而非只依赖模型自律。

### 1.2 Forward Deployed Engineer

核心问题是：在客户目标、数据、组织、旧系统、合规和时间都不完整的情况下，怎样选中值得做的问题并交付可持续采用的系统。

OpenAI 当前 FDE 岗位把职责写成 discovery、technical scoping、system design、build、production rollout，并用生产采用、工作流影响和 eval 驱动反馈衡量成功；AI Deployment Engineer 还明确要求处理集成、可靠性、可观测性、安全、隐私、治理、性能与成本。换言之，FDE 不是“会演示 API 的售前”，也不是“客户说什么就定制什么”的外包开发。

面试信号通常包括：

- 能从用户抱怨还原角色、决策、现有流程、失败成本与可观察成功标准。
- 能砍范围，先交付最小但可验证的垂直切片。
- 能在陌生代码库、API、数据和权限体系中形成假设并快速验证。
- 能写生产代码，也能向工程师、安全负责人、产品负责人和高管改变证据顺序。
- 能管理 adoption、培训、runbook、owner 和 handoff，而不是上线后离开。
- 能把一次部署中重复出现的问题沉淀为产品反馈、工具、模板或 playbook。

### 1.3 共享主干

两类岗位都要求：高 agency、快速学习、生产工程、模糊问题分解、清晰沟通和端到端 ownership。真正的共同交付链是：

`发现高价值工作流 → 明确成功/失败 → 选择最简单架构 → 做垂直切片 → 建 eval → 接入生产约束 → 小流量发布 → 证明采用 → 抽象复用`

### 1.4 不同侧重点

| 维度 | AI Agent Engineer | FDE |
| --- | --- | --- |
| 第一责任 | Agent 行为与平台可靠性 | 客户结果与端到端部署 |
| 深挖重点 | tool/state/context/eval/control plane | discovery/scope/integration/adoption/field feedback |
| 常见编码 | runtime、tooling、eval harness、backend/platform | full-stack vertical slice、integration、debug、accelerator |
| 主要受众 | AI/平台/产品工程团队 | 客户工程、业务、安全、管理层和内部产品团队 |
| 失败定义 | 任务失败、越权、不可复现或无法安全发布 | demo 无法上线、无人采用、影响不可测或一次性定制不可复用 |

因此，准备策略不是二选一：先完成 Agent 工程纵深，再用 FDE case 把它放进真实客户交付周期。

## 2. 第一性原理能力模型

| 原语 | Agent 面试中的问题 | FDE 面试中的问题 | 必须留下的证据 |
| --- | --- | --- | --- |
| P1 目标与证据 | 什么才算任务成功 | 哪个工作流值得改变，业务影响如何测 | baseline、success metric、adoption/impact |
| P2 表征与信息 | message、context、tool result 如何组织 | 客户数据、schema、真源和数据损失 | data map、schema、provenance |
| P3 机制与不变量 | loop、routing、state transition 如何工作 | 垂直切片怎样从输入走到行动 | state machine、关键不变量、可运行代码 |
| P4 状态与协调 | memory、retry、并发、恢复 | 多系统/多 stakeholder 的 owner、顺序和 handoff | sequence、owner、runbook |
| P5 契约与边界 | tool schema、权限、终止和错误语义 | API、IAM、合规、组织和范围边界 | contract、RBAC、假设清单 |
| P6 不确定性与评估 | trace/e2e/safety eval 与回归 | pilot 是否真的改善流程 | eval set、slice、canary、人工校准 |
| P7 资源与风险 | token、延迟、成本、blast radius | 预算、时间、安全、上线与回滚 | budget、threat model、SLO、rollback |
| P8 所有权与表达 | 为什么这样设计，失败后改了什么 | 如何推动决策、冲突、采用与复用 | decision record、stakeholder memo、复盘 |

## 3. 官方岗位信号快照

| 一手来源 | 当前信号 | 对备考的直接影响 |
| --- | --- | --- |
| [OpenAI FDE](https://openai.com/careers/forward-deployed-engineer-%28fde%29-seattle-seattle/) | discovery 到 production rollout；生产采用、工作流影响、field feedback；全栈代码与高压判断 | 必须练客户 case、范围取舍、上线和可复用反馈，不能只练 Agent 架构 |
| [OpenAI AI Deployment Engineer](https://openai.com/careers/ai-deployment-engineer-enterprise-san-francisco/) | 架构、实现计划、eval、可靠性、可观测性、安全、治理、延迟和成本；成功不是 demo | 作品集必须有 eval harness、生产约束、adoption 和 business outcome |
| [OpenAI Interview Guide](https://openai.com/interview-guide/) | assessment 可能是 pair coding、take-home 或技术测试；最终轮强调设计、代码质量、性能、测试、沟通 | 同时准备 DSA、可维护代码、测试、项目深挖与合作式思考 |
| [Anthropic Applied AI Engineer](https://job-boards.greenhouse.io/anthropic/jobs/5343697008) | eval、harness hill-climbing、Agent 原型、pair programming、代码贡献、教学与生态工具 | 需要 builder credibility、现场共同开发、技术讲解和 1→N 复用 |
| [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | 从最简单方案开始；workflow 与 Agent 分开；复杂性必须由效果证明 | 系统设计先给非 Agent / workflow baseline，再证明自治必要性 |
| [Anthropic Agent Evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 多轮 Agent 要评估完整轨迹和环境结果，不能只看末尾文本 | 准备可重放环境、trace grader、单测/状态检查和失败 taxonomy |
| [Palantir 工程面试指南](https://www.palantir.com/careers/getting-hired/) | coding、效率、开放题、技术问题和既有系统；要求讲清思路与澄清 | 增加陌生代码库修改、开放式 case、复杂度和协作式白板 |
| [Palantir 既有系统能力](https://www.palantir.com/careers/getting-hired/working-inside-existing-systems/) | 不重写一切；在不完整理解下形成假设、定位并干净修改 | 每周做一次 repo orientation → minimal patch → regression |

## 4. 你当前最值得迁移的资产

按现有知识库的 CV、Edge ML、模型评估和生产系统方向，以下能力不应在转型时被“Agent 框架词汇”覆盖：

- **不确定性与评估**：hard case、slice、离线/在线指标和发布门槛可以直接迁移到 Agent eval。
- **端侧与系统约束**：延迟、内存、功耗、降级和 parity 思维可以迁移到模型路由、tool latency 和成本预算。
- **多模态与真实输入**：图像、视频、设备日志和非结构化数据能形成比通用聊天机器人更有差异化的场景。
- **训练/部署故障诊断**：现象 → 假设 → 最小实验 → 修复 → 回归是 FDE 现场排障的核心协议。
- **Senior 项目证据**：如果已有跨团队发布或设备落地经验，应改写为客户工作流、决策、采用和复用证据。

## 5. 转型的真实缺口

不要用“懂 RAG”“用过 LangChain”标记完成。逐项检查下面的行为证据：

| 缺口 | 通过标准 | 失败信号 |
| --- | --- | --- |
| Agent runtime | 能不用重框架写最小 loop、tool registry、state、termination | 只能画框架 logo 或调用预制 Agent |
| Eval engineering | 至少 50 条冻结案例、失败 taxonomy、trace/e2e/safety 指标 | 只展示三个成功例子或 LLM judge 总分 |
| Full-stack delivery | Browser/API/service/DB/worker 可运行，有测试和迁移 | 只有 notebook、CLI 或静态 demo |
| Enterprise integration | OAuth/RBAC、secret、audit、PII、rate limit、observability | “生产时再加安全与监控” |
| Existing systems | 60 分钟内完成陌生 repo map、假设、patch 和回归 | 第一反应是重写；必须读完整仓库才敢行动 |
| Discovery/scoping | 15 分钟把模糊诉求转成 workflow、metric、约束、MVP | 一听需求就开始选模型和画架构 |
| Adoption/ownership | 有 owner、培训、SOP、usage 和 impact 指标 | 上线或 demo 即宣布完成 |
| Executive communication | 同一事实能分别对工程、安全、业务讲清决策 | 技术细节多，但不能回答“为什么值得做” |

## 6. 先判断你是否真的适合 FDE

FDE 不是纯技术升级。申请前写下明确答案：

- 你是否愿意频繁与客户共同工作，而不是长期只在内部平台上开发？
- 你能否接受需求不完整、现场优先级变化和“先交付可工作版本”的节奏？
- 你是否愿意承担旅行、时区、行业合规或客户现场限制？具体比例以每个 JD 为准。
- 你是否享受教学、写文档、推进 adoption 和处理非技术阻力？
- 你能否在客户定制与平台复用之间主动设边界？

如果前两项长期不匹配，优先申请 Agent Engineer / Applied AI Engineer / Agent Platform；如果技术构建和客户推进都能持续提供能量，再把 FDE 作为主目标。

## 7. 唯一主作品：生产视觉质量事件 Agent

用已有 CV/Edge 背景建立差异化，而不是做第 N 个旅行规划 Agent。推荐作品题目：

> 为移动影像或视觉产品团队构建“生产质量事件 Agent”：读取脱敏后的设备遥测、版本、图像质量指标、告警、工单和 SOP；调用查询/分析工具定位可能根因，生成带证据的处置建议；任何发布、回滚或外部通知都必须人工确认。

### 7.1 工作流与非 Agent baseline

先画当前人工流程：谁发现、查哪些系统、怎样判断、何时升级、平均耗时、误判成本。然后实现固定检索 + 规则化诊断 workflow，记录任务成功率、处理时长和人工步骤。只有当开放式诊断或动态工具选择显著改善结果时才引入 Agent。

### 7.2 最小生产架构

`Web UI → API → orchestrator → model gateway → tool registry → data adapters → state/event store → eval/trace store`

至少实现：

- Python 服务和一个 TypeScript/JavaScript 操作界面。
- 三个真实但沙箱化工具：指标查询、版本/设备切片、SOP/工单检索。
- typed schema、timeout、retry、idempotency、permission scope 和审计日志。
- session state 与可恢复执行；高影响动作走 approval gate。
- provider/model 可替换，不把业务 contract 绑死在单一框架。

### 7.3 Eval 包

建立 50–100 条脱敏或合成案例：normal、edge、ambiguous、unanswerable、tool failure、prompt injection、权限不足和高影响操作。分层记录：

- component：retrieval、tool 参数、schema、grounding。
- trace：工具选择、顺序、重试、终止和无效循环。
- end-to-end：是否找到正确证据并给出可执行、安全的建议。
- product：处理时长、人工步骤、adoption、override 和 escalation。
- system：p50/p95、token/调用成本、错误率、恢复时间。

冻结 release gate；不要等候选版本跑完后再修改门槛。

### 7.4 企业与安全层

必须展示 RBAC、least privilege、secret management、PII/redaction、tenant boundary、audit、retention、prompt injection 防护、人工审批和 rollback。写一页 threat model，并通过故障注入证明拒绝、降级和恢复路径。

### 7.5 FDE 交付包

除了代码，还要有：

- 一页 discovery memo：用户、流程、痛点、baseline、成功指标和不做什么。
- 一页 architecture decision record：方案、弃选、残余风险。
- pilot plan：范围、数据、owner、培训、canary、监控与退出条件。
- stakeholder update：工程版与高管版各一份。
- runbook、incident timeline 和 handoff 文档。
- field-to-product memo：哪些问题应做成平台能力，哪些保持客户配置。

### 7.6 十分钟演示协议

1. 60 秒：现有流程和可量化痛点。
2. 90 秒：为什么先做 workflow baseline，何时升级成 Agent。
3. 3 分钟：正常 case、模糊 case、工具失败和越权 case。
4. 2 分钟：eval、延迟/成本、安全和 release gate。
5. 90 秒：pilot/adoption 结果或尚未验证的假设。
6. 60 秒：失败、改动与可复用平台反馈。

不能公开真实指标时，明确哪些是脱敏、区间、合成或待验证，不编造客户结果。

## 8. 预期面试轮次与准备产物

### 8.1 动机与岗位定位

准备 30 秒、2 分钟和 5 分钟三个版本：为什么从当前方向转向 Agent/FDE；为什么不是解决方案顾问、纯研究或普通后端；现有深度如何迁移；还缺什么证据。

### 8.2 编码与复杂度

继续执行 DSA 主干，但把一半练习改成生产代码任务：分页/限流、LRU/TTL、异步 worker、幂等请求、schema validation、并发队列和测试。评分同时看正确性、复杂度、可读性和测试。

### 8.3 陌生代码库

给自己 60 分钟：10 分钟 repo map，10 分钟复现，10 分钟提出两个假设，20 分钟最小修改，10 分钟回归与说明。禁止重写；记录第一次错误假设和更快的定位方式。

### 8.4 Agent 系统设计

按 `目标 → baseline → architecture → tool/state → eval → safety → SLO/cost → rollout` 回答。面试官增加数据污染、工具超时、权限提升、模型降级或流量十倍时，必须指出哪个不变量先失效。

### 8.5 FDE discovery case

前 10–15 分钟只做澄清：用户、决策、频率、现有步骤、系统、数据、错误成本、owner、约束和成功指标。随后给三档范围：两周 vertical slice、六周 pilot、规模化平台；明确不做什么。

### 8.6 Live build / take-home

练习在 90–180 分钟内交付一个可运行垂直切片：README、启动命令、测试、已知限制和下一步必须完整。优先完成可验证主路径，再补 polish；不要用大量生成代码掩盖无法解释的依赖。

### 8.7 项目深挖

准备回答：你个人写了什么；最关键决定；为什么不用更简单方案；失败分母；eval 如何构建；哪个客户/用户反馈改变了设计；上线和采用怎样证明；什么被抽象为复用组件。

### 8.8 行为与 stakeholder

至少准备六个故事：模糊中交付、反对不合理范围、生产事故、与安全/业务冲突、推动 adoption、把一次性工作产品化。每个故事要有个人决定、异议、可观察结果和之后改变的机制。

## 9. 桌面练习节点

| 节点 | 训练目标 | 必须产物 |
| --- | --- | --- |
| AFD-0 定位与证据迁移 | 建立 Agent/FDE 候选人论点 | 30 秒/2 分钟定位 + 三条证据链 |
| AFD-1 Discovery 与 scoping | 从抱怨得到可验证 MVP | workflow map + success metric + not-doing list |
| AFD-2 Agent 架构选择 | 证明 workflow/Agent 取舍 | baseline + state/tool/eval 决策图 |
| AFD-3 既有系统修改 | 在不完整理解下干净交付 | repo map + patch + regression + 复盘 |
| AFD-4 Eval-driven pilot | 用失败分母决定是否继续 | frozen eval + failure taxonomy + pilot gate |
| AFD-5 Production rollout | 处理企业约束与采用 | RBAC/threat/SLO/runbook/rollback/adoption |
| AFD-6 Live case | 在 60 分钟内完成 discovery 到 rollout | 一页 solution brief + 10 分钟答辩 |

## 10. 六周替换式计划

不要把它叠加到现有 8–10 小时周预算上；用下面任务替换重复泛读与通用白板。

| 周 | 主线 | 替换的旧练习 | 周末交付 |
| --- | --- | --- | --- |
| 1 | AFD-0；JD/简历差距；全栈环境跑通 | 一次泛化行为题和一篇岗位文章 | 定位、scorecard、作品 discovery memo |
| 2 | AFD-2；最小 workflow/Agent；tool contract | 两次框架横评或 Agent 泛读 | 可运行 baseline、state/tool 图、单测 |
| 3 | AFD-3；API/DB/worker；陌生 repo patch | 一场重复 DSA 和一次泛化 full-stack 阅读 | 垂直切片、patch 记录、CI/测试 |
| 4 | AFD-4；trace/e2e/safety eval；failure injection | 一场泛化 ML system design | 50+ eval、失败 taxonomy、release gate |
| 5 | AFD-1/5；IAM、审计、SLO、pilot/adoption | 一场普通 Agent 白板和重复 Prompt 阅读 | threat model、runbook、pilot plan |
| 6 | AFD-6；公司定向；四类 mock | 所有新资料扩张 | live case、10 分钟 demo、最终证据包 |

每周保留一场 DSA/生产编码；FDE 不是免编码通道。

## 11. 高频问题池

### 11.1 转型与角色

1. 为什么从 CV/Edge/ML 转向 Agent 与 FDE？什么能力可迁移，什么必须重建？
2. 为什么你更适合 FDE，而不是 Solutions Architect、Applied Scientist 或普通 Backend Engineer？
3. 讲一次你在需求不完整时仍推进交付的经历。
4. 讲一次你主动砍掉客户/产品要求的经历；怎样获得认同？
5. 你如何判断一个客户问题值得产品化而不是继续定制？

### 11.2 Discovery 与产品判断

6. 客户说“我们需要一个 Agent 自动处理所有工单”，你前十个问题是什么？
7. 如何建立当前人工流程 baseline？如果客户没有可靠数据怎么办？
8. 两周只能交一个 vertical slice，你保留和删除什么？
9. 业务 sponsor、最终用户、安全团队和工程 owner 的成功定义冲突时怎么办？
10. pilot 指标很好但使用率低，你怎样区分产品、流程、信任和培训问题？

### 11.3 Agent 架构

11. 何时不用 Agent？workflow、单 Agent 和多 Agent 怎样逐级证明必要性？
12. 设计一个能查数据、生成建议并提交审批的 Agent；状态和权限边界在哪里？
13. 工具 schema 如何影响模型行为？哪些错误必须由确定性控制面处理？
14. context 过长、事实冲突和跨会话恢复怎样处理？
15. 如何避免 Agent 循环、重复副作用、错误终止或过早宣布完成？

### 11.4 Eval 与生产

16. 如何从零建立 Agent eval，而不是从成功 demo 倒推指标？
17. 最终答案正确但调用了错误工具或读取了越权数据，算成功吗？
18. LLM judge 与人工不一致时怎样校准、分 slice 和决定发布？
19. 新模型质量更高但成本翻倍、p95 回归，怎样做路由和 canary？
20. 生产中没有即时 ground truth，怎样监控 Agent silent failure？

### 11.5 Enterprise 与安全

21. 如何接入客户 OAuth、RBAC、审计和 secret 管理？
22. 检索文档含 prompt injection 并诱导外发数据，怎样分层防护？
23. 一个工具调用可能产生真实付款，approval、幂等和补偿怎样设计？
24. 客户要求训练数据不离开私有环境，你给出哪些架构选项和取舍？
25. 事故发生后，怎样恢复服务、保留证据并安全重新开放能力？

### 11.6 编码、既有系统与交付

26. 在陌生服务中增加 rate limit 或 idempotency，你怎样定位最小修改点？
27. 队列重复投递且第三方 API 非幂等，怎样防止重复副作用？
28. 一个 async Agent worker 的任务状态、lease、retry 和 dead letter queue 怎样设计？
29. 你会怎样测试一个 tool registry 和多轮 orchestrator？
30. 讲一次从 field failure 到回归测试、平台改动和 playbook 的完整闭环。

## 12. 三个答题内核

### 12.1 FDE case

`用户/决策 → 当前 workflow/baseline → 成功与失败成本 → 约束/owner → 最小范围 → 架构与集成 → pilot/eval → rollout/adoption → 复用反馈`

### 12.2 Agent design

`任务契约 → 非 Agent baseline → model/tool/environment loop → state/termination → eval → permissions/safety → latency/cost → release/rollback`

### 12.3 事故诊断

`影响与止血 → 时间线/变更 → 可观察信号 → 假设排序 → 最小复现 → 修复/回归 → 安全恢复 → 机制改进`

## 13. 统一评分卡

每次 mock 按 0–4 评分：

1. **Problem framing**：是否先确定用户、决策、baseline、成功与失败。
2. **Technical depth**：工具、状态、数据、代码和不变量能否被追问。
3. **Evaluation**：是否有冻结分母、slice、trace/e2e、安全和上线门槛。
4. **Production judgment**：可靠性、权限、可观测性、延迟/成本、回滚是否具体。
5. **Delivery**：范围、owner、时间、风险、adoption 和 handoff 是否闭环。
6. **Communication**：是否结论先行、会澄清、会取舍，并能面向不同 stakeholder 表达。

任何一项低于 3 都不能用其余平均分掩盖；高风险权限题中 Production judgment 低于 3 直接判未通过。

## 14. 简历与申请材料

每个主项目最多保留三条 bullet，按下面顺序：

1. **Outcome**：改变了哪个工作流，规模、采用或结果是什么。
2. **Decision**：你个人做了什么关键判断，为什么弃选其他方案。
3. **Reliability/learning**：eval、故障、安全、发布或复用机制怎样降低风险。

作品链接至少包含 README、架构图、eval 报告、failure log、threat model、runbook 和三分钟 demo。不要把 provider、framework 和模型名堆成技能清单；只有能在代码、trace 或决策记录中被验证的技术才写入。

## 15. 公司定向模板

每个 JD 只填一页：

```text
公司/团队：
岗位族：Agent Engineer / Applied AI / FDE / Deployment / Platform
客户与工作流：
官方职责中的五个动词：
必须编码栈：
生产/安全约束：
客户面对程度与旅行：
我的三条直接证据：
最大的两个缺口：
本周替换任务：
六轮可能面试：
要问面试官的三个问题：
```

招聘页会变化，申请前重新核对地点、经验、旅行、签证、技术栈和面试说明。

## 16. 完成定义

满足以下条件才称为“可以投递”，不是看完路线：

- 一个生产式 Agent vertical slice 可从干净环境启动，主路径与失败路径都有测试。
- 至少 50 条冻结 eval；能解释失败分母、judge 校准和一次阻断发布的回归。
- 完成一次 OAuth/RBAC/audit 或等价企业集成，并有 threat model、runbook 和 rollback。
- 三次陌生 repo 限时修改；至少两次在 60 分钟内完成定位、patch 与回归。
- 三场 FDE discovery/live case，Problem framing、Delivery、Communication 均达到 3/4。
- 两场 Agent system design，Technical depth、Evaluation、Production judgment 均达到 3/4。
- 六个行为故事经三层追问仍能区分个人决定、团队贡献、结果和残余风险。
- 能明确回答是否接受目标岗位的客户面对、旅行和现场约束。

如果作品没有真实用户，必须把 adoption 标记为未验证，并通过五次外部试用或模拟 stakeholder review 收集证据；不能把自己的 demo 次数当采用。

## 17. 仍然需要真实 JD 校准的部分

- 不同公司对 FDE、Deployment Engineer、Applied AI Engineer、Solutions Architect 的编码深度与商业职责划分不同。
- 官方招聘页能证明当前职责，不保证具体团队的面试题型；招聘方提供的 prep 优先级更高。
- 本路线没有替你证明客户沟通偏好、旅行适配或行业可信度，这些必须用真实经历和申请反馈验证。
- Agent 框架和模型能力变化很快；长期稳定的是任务契约、工具/状态边界、eval、控制面、生产约束和客户结果。
