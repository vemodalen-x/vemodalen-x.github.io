# 2026 Forward Deployed Engineer 求职与面试作战指南（新加坡版）

> 版本：2026-08-29。岗位、签证和面试政策会变化；每次投递前重新验证在职招聘页、地点、旅行比例、薪酬口径、AI 工具政策和 Employment Pass（EP）支持。本指南用于准备与决策，不把任何公司的通用描述当作永久流程，也不把“公司可办 EP”推断为“该岗位已确认支持你的 EP”。

## 0. 一句话结论：FDE 面试考的是交付闭环，不是 Agent 名词表

2026 年高质量 FDE 的共同内核是：**在陌生、模糊、受约束的客户环境里，找到值得解决的决策或工作流，亲手把系统接进去，用评估与生产信号证明价值，控制风险并推动采用，再把现场经验变成可复用产品能力。**

因此，备考不能只覆盖 LLM、RAG、Agent 或系统设计。完整准备面应同时包含：

1. 客户发现与问题定义；
2. Python / JavaScript / SQL / API / 数据集成与生产编码；
3. RAG、Agent、工具、上下文、评估与安全；
4. 分布式系统、可靠性、可观测性、受限部署与事故响应；
5. Pilot、ROI、采用、变更管理和高压沟通；
6. 项目证据、行为面、岗位筛选、EP、薪酬与 offer 决策。

你的最可信切入点不是宣称已有多年企业 Agent 经验，而是：**把已经证明的生产 CV、端侧部署、跨 runtime parity、hard-case 评估、发布/回滚和跨团队交付纪律迁移到企业 AI 系统；再用一个生产式 Agent 项目补齐新领域的直接证据。**

---

## 1. 2026 岗位真相：先分清你面的是哪一种“FDE”

### 1.1 当前官方岗位信号（截至 2026-08-29）

| 岗位原型 | 当前公开信号 | 面试重点 | 地点事实 |
|---|---|---|---|
| Model Lab FDE | [OpenAI Singapore FDE](https://openai.com/careers/forward-deployed-engineer-singapore-singapore/)明确覆盖 discovery、technical scoping、system design、build、production rollout；成功以生产采用、工作流影响和 eval-driven field feedback 衡量 | 强编码、全栈交付、LLM 系统、客户判断、上线采用、产品反馈 | 新加坡在招；混合办公 3 天；岗位页写明 relocation，旅行最高约 50% |
| Technical Deployment Lead | [OpenAI Singapore TDL](https://openai.com/careers/technical-deployment-lead-singapore-singapore/)负责多工作流计划、依赖/里程碑、0→1 到规模化、ROI、变更管理与可复用模式 | 技术交付领导、排序、风险、exec communication、ROI；技术流利但不是纯编码岗 | 新加坡在招；旅行约 25–50%；要求更强客户交付年限与领域可信度 |
| Applied AI / Technical Success | [OpenAI Singapore Applied AI Engineer, Cyber](https://openai.com/careers/applied-ai-engineer-cyber-singapore/)强调 discovery、原型/工作坊、pilot success criteria、工具/检索/eval/guardrail/telemetry 和可复用 field assets | 领域深度、方案设计、客户赋能、安全、pilot；编码深度按团队变化 | 新加坡在招；该例要求 cyber 领域深度，不应无证据硬投 |
| Product-platform FDSE | [Palantir FDSE](https://jobs.lever.co/palantir/c4442730-2926-41ad-8c0e-5e5a6b4d14ae)强调开放问题、数据与存储、云、前端、强编码、客户协作和独立决策 | 数据建模、全栈工程、现场问题、产品平台、交付速度 | 这是岗位原型；当前公开目录不能据此推断新加坡 FDSE 在招 |
| Enterprise Agent FDE | [Cohere FDE, Agentic Platform](https://jobs.ashbyhq.com/cohere/b0bcef37-1d20-414f-aade-c54942d63df9)强调生产 Python、RAG/Agent、敏感企业数据、private cloud/on-prem、全栈和 20–40% 旅行 | 企业集成、RAG/Agent、受限部署、安全、高速交付 | 当前示例是北美岗位，只作能力原型，不作新加坡 vacancy 证明 |
| AI Data / Evaluation FDE | [Scale AI FDE, GenAI](https://scale.com/careers/4593571005)强调客户每日协作、全栈端到端、快速实验、大规模数据与产品路线反馈 | 数据基础设施、实验、评估、全栈、客户问题翻译 | 当前示例为美国岗位，只作能力原型 |

### 1.2 角色边界：面试前必须问清

| 维度 | FDE / FDSE | Technical Deployment Lead | Solutions / Applied AI | 普通 Backend / ML Engineer |
|---|---|---|---|---|
| 第一责任 | 从问题到生产采用的技术结果 | 多工作流按期交付、ROI 与采用 | 技术策略、方案、pilot、客户成功 | 稳定产品或平台能力 |
| 编码 | 通常高，可能现场 pair build | 中到高，视团队而定 | 低到高，差异最大 | 高 |
| 客户现场 | 高 | 很高 | 高 | 通常较低 |
| 模糊问题发现 | 核心 | 核心 | 核心 | 次要 |
| 旅行 | 常见 20–50% | 常见 25–50% 或更高 | 团队相关 | 通常较低 |
| ROI / 采用 | 必须理解并推动 | 直接拥有 | 经常拥有 | 通常由产品/GTM 共同拥有 |
| 产品反馈 | 抽象现场模式并反馈 | 跨部署 pattern matching | reference asset / roadmap feedback | 内部产品迭代 |

投递前让 recruiter 给出五个答案：**一周编码比例、客户现场/旅行比例、同时服务几个客户、谁拥有 rollout/adoption/ROI、什么算入绩效。**岗位标题不回答这些问题。

---

## 2. 你的 FDE 候选人定位：Strong / Adjacent / Gap

### 2.1 证据地图

| 能力 | 当前标签 | 可用证据 | 面试表达边界 | 最小补证动作 |
|---|---|---|---|---|
| 生产 CV / perception / imaging | **Strong** | segmentation、matting、depth、detection、tracking、image processing、camera pipeline | 可以深讲 hard case、时序、质量与工程取舍 | 选一个最能展示系统影响的项目做 30 分钟 deep dive |
| 完整模型生命周期 | **Strong** | 数据、hard case、训练、量化、导出验证、替换、发布 | 强调你做出的决定、验收门槛和 residual risk | 写一份模型 release case study |
| 端侧与 runtime | **Strong** | PyTorch、TFLite、ONNX、C++、Android/NDK、GPU/device debugging | 连接到企业集成、异构环境、受限部署和 parity | 做一场陌生 repo / runtime 故障 mock |
| 评估与可靠性 | **Strong** | golden cases、batch compare、failure taxonomy、reproducibility、acceptance/rollback | 迁移到 Agent eval 时明确非确定性与 trace/outcome 差异 | 把旧 golden set 思维实现成 50–100 条 agent eval suite |
| 跨团队/客户交付 | **Strong 或 Adjacent，按证据说** | 已有跨职能、客户面对交付 | 不把内部协作夸成 enterprise executive ownership | 准备一次需求冲突、一次 adoption/交接故事 |
| Python 生产工程 | **Strong** | 主语言与 ML 工程经验 | 面试仍需证明 API、测试、并发、数据库和可维护性 | 90 分钟完成生产式 API + tests |
| 全栈 Web / TypeScript | **Adjacent** | 若只有近期项目，明确范围 | 不说成多年 production full-stack | 完成 React/TS UI + Python API 的纵向切片 |
| RAG / Agent / Harness | **Adjacent** | 已系统学习并有 agent-assisted automation / demo | 不宣称多年企业生产 ownership | 做一个真实数据、ACL、eval、trace、rollout 完整作品 |
| 企业安全、隐私、治理 | **Adjacent / Gap** | 可迁移 release discipline；需要新直接证据 | 不把安全 checklist 当实战事故经验 | threat model + approval gate + audit log + red-team cases |
| Kubernetes / hyperscale serving | **Gap** | 可能有部署相邻经验 | 不虚构集群规模或 on-call ownership | 能解释容器/K8s 核心对象并做最小部署；目标岗若强要求再加深 |
| 受限网络 / private cloud / on-prem | **Adjacent / Gap** | Edge/端侧约束可迁移 | 不等于企业 air-gapped 交付 | 为作品增加离线依赖清单、镜像、secret、升级/回滚方案 |
| Staff 级组织影响和 mentoring | **Gap，除非有直接证据** | 项目领导不自动等于 org scope | 不使用未经证实的“组织级/多人培养”表述 | 用决策、复用资产、跨团队影响说实话，不硬套职级 |

### 2.2 90 秒定位草稿

> 我的核心优势是把 AI 模型变成可发布、可诊断的生产系统。我过去的工作覆盖计算机视觉从数据和 hard cases、训练与量化，到 ONNX/TFLite/C++/Android 运行时、设备 parity、质量门槛和发布回滚。这个经历让我擅长处理 FDE 最难的一类问题：需求和环境都不完整，但必须快速找到第一个可观测边界，用最小实验定位失败，并把结果变成客户和工程团队都能执行的上线标准。
>
> 我转向 AI Agent / FDE，不是因为只学习了几个框架，而是因为 Agent 系统同样需要上下文、工具契约、评估、权限、可观测性和生产闭环。我已经具备生产可靠性与跨团队交付的直接证据，正在用一个带真实数据、ACL、trace eval、人工审批和 rollout 的生产式 Agent 项目补齐企业 RAG/Agent 的直接证据。我不会声称已有多年企业 LLM ownership，但我能清楚说明哪些能力已经证明、哪些仍要在 pilot 中验证。

### 2.3 为什么选择 FDE，而不是泛泛“转 AI”

回答结构：

1. **工作偏好**：喜欢在真实约束、用户反馈和生产信号中解决问题；
2. **已证优势**：复杂系统诊断、质量门槛、端到端 release、跨团队翻译；
3. **迁移逻辑**：CV/Edge 的异构集成与 eval discipline 可迁移到企业 AI；
4. **主动补证**：Agent/RAG、安全、全栈、客户 discovery；
5. **边界**：不把 FDE 当售前、纯 prompt 岗或免编码路线。

---

## 3. 2026 面试流程地图与每轮通过标准

[OpenAI Interview Guide](https://openai.com/interview-guide/)说明其 skills-based assessment 可能包含 pair coding、take-home 或技术测试，final 通常由多轮访谈构成；AI 工具规则按 assessment 变化，必须问 recruiter。[Anthropic Careers](https://www.anthropic.com/careers)同样强调直接证据、可查文档但仍需熟悉语法/标准库，并说明签证支持要按具体岗位判断。不要假设“2026 面试一定允许 AI”。

| 轮次 | 面试官在判断什么 | 通过证据 | 常见失败 |
|---|---|---|---|
| Recruiter screen | 地点、EP、薪酬、旅行、动机、沟通与基本匹配 | 60–90 秒定位；清楚的 role thesis；不回避硬约束 | 只讲技术；EP/薪酬到终面才提；把 FDE 说成售前 |
| Hiring manager | ownership、速度、客户判断、岗位级别 | 2 个端到端项目 + 1 个失败 + 1 个模糊问题故事 | “我们做了”但说不出个人决定；无结果或基线 |
| Coding / pair build | 生产代码、澄清、测试、协作和 AI 独立性 | 合同先行、可运行 baseline、边界测试、复杂度与迭代 | 背题式沉默；过度架构；没有测试或无法解释 AI 生成代码 |
| Existing system / debugging | 陌生代码导航、观测、假设排序、最小修复 | 复现 → 边界 → 假设 → 实验 → patch → regression | 全仓库重写；没复现；凭直觉改多处 |
| System design | 需求、数据、身份、安全、评估、可靠性、成本与 rollout | 先问业务决策；有 baseline、SLO、threat model、eval 和降级 | 从向量库或模型开始；只有 happy path；无 owner |
| Customer case / discovery | 从模糊需求到可验收 vertical slice | stakeholder/workflow/baseline/constraint/pilot gate/not-doing | 急着 demo；所有需求都接；success metric 无分母 |
| Architecture presentation | 结构化沟通、取舍、异议处理 | 一页 brief；图与数字一致；清楚 rejected alternatives | 堆技术名词；不能向业务负责人解释价值与风险 |
| Behavioral / values | ownership、冲突、失败、速度、诚实与学习 | Claim → Evidence → Decision → Result → Reflection | 虚构规模；把失败包装成优点；责怪客户/同事 |
| Executive / cross-functional | 风险、ROI、优先级、状态和坏消息 | 结论先行；options/trade-off/ask；明确 owner/date | 汇报实现细节但没有决定；隐藏风险 |
| References / offer | 证据一致性、level、EP、固定薪酬与条款 | 所有版本事实一致；清楚 fixed/variable/equity | 目标口径混乱；把口头意向当 EP 确认 |

---

## 4. FDE 统一答题骨架

### 4.1 现场 case：八步闭环

1. **Outcome**：谁要做什么决策或动作？为什么现在重要？
2. **Workflow**：当前人、系统、数据、等待与错误在哪里？
3. **Baseline**：现在的时间、成本、质量、风险和采用率是多少？
4. **Constraints**：身份、数据、合规、部署、延迟、预算、owner、deadline。
5. **Vertical slice**：最小端到端价值路径；明确不做事项与退出条件。
6. **System**：数据/身份 → 检索/模型/工具 → 状态/审批 → UI/API → telemetry。
7. **Eval & risk**：任务集、slice、outcome/trace、安全、SLO、canary、rollback。
8. **Adoption & feedback**：champion、培训、运营交接、ROI、field-to-product pattern。

### 4.2 技术题：五层回答

1. 定义 contract、shape/schema、假设和不变量；
2. 给最简单可行 baseline；
3. 解释机制与关键数据流；
4. 给 failure modes、观测与最小区分实验；
5. 给 production trade-off、测试、发布、降级和 residual risk。

### 4.3 行为题：证据链而不是形容词

使用：**Context → Stakes → My decision → Alternative rejected → Execution → Measured result → What changed**。

任何“领导力、客户影响、速度、质量”主张都要能继续回答：

- 你的具体决定是什么？
- 当时有哪些选项？
- 证据/基线/分母是什么？
- 谁不同意，为什么？
- 什么结果能证明不是巧合？
- 如果重来，哪一个系统机制会改变？

---

## 5. 230 道 FDE 面试题与对应知识准备

使用方式：不要从第 1 题顺序背到第 230 题。先按目标 JD 做 Strong / Adjacent / Gap 映射，再激活最相关的 30–50 题；每题至少留下口述、代码、图、decision record 或 mock feedback 中的一种证据。

### 5.1 Recruiter、动机与岗位判断（12 题）

**要准备的知识与材料**

- FDE、TDL、Applied AI、Solutions Architect、Backend/ML 的职责边界；
- 30 秒、90 秒、5 分钟三个定位版本；
- Singapore / hybrid / travel / EP / fixed pay 的硬约束；
- 目标公司的产品、客户、部署方式和最近公开岗位信号；
- 一条“为什么现在转”的证据链，而不是行业热度叙事。

**高分标准**：结论清楚、事实诚实、对岗位日常有现实理解；能说明为何你的旧深度可迁移，以及新缺口如何补证。

1. 用 60 秒介绍你自己，并说明为什么适合这个 FDE 岗位。
2. 为什么从 Computer Vision / Edge / ML 转向 Agent 与 FDE？
3. 为什么是 FDE，而不是 Applied Scientist、Solutions Architect 或 Backend Engineer？
4. 你认为 FDE 一周的实际工作是什么？最不吸引你的部分是什么？
5. 你如何理解“forward deployed”？它与定制外包有什么区别？
6. 为什么是我们，而不是另一家模型实验室或企业 AI 平台？
7. 你愿意多少比例面对客户、写代码、旅行和处理生产事故？
8. 你最匹配本 JD 的三项证据是什么？最大的两个 gap 是什么？
9. 你当前在新加坡的工作授权情况是什么？需要什么雇主支持？
10. 你的固定年薪目标如何定义？哪些是 fixed、bonus、equity？
11. 你能接受 25–50% 旅行和每周三天办公室吗？哪些安排不可接受？
12. 如果这个岗位实际只有 20% 编码、同时服务五个客户，你还会选择吗？为什么？

### 5.2 简历、项目深挖与 Senior 证据（12 题；累计 24）

**要准备的知识与材料**

- 两个 30 分钟项目 deep dive：一项技术纵深，一项端到端交付；
- 每个项目的时间线、架构、个人 ownership、关键 decision、rejected alternative、指标、失败与复盘；
- 一份可画出的数据流/部署图；
- 对所有数字准备分母、时间窗、测量方法和不确定性。

1. 选择一个项目，从客户/用户结果倒推到你最关键的技术决定。
2. 哪一部分是你亲自设计、实现或推动的？团队其他人做了什么？
3. 当时最模糊的约束是什么？你如何把它变成可测试假设？
4. 描述一次模型离线变好但真实产品变差的经历。
5. 描述一次 PyTorch、ONNX/TFLite 与真实设备不一致的故障。
6. 你如何建立 golden cases、failure taxonomy 和 release gate？
7. 哪个 rejected alternative 最能体现你的判断？为什么没选？
8. 哪个结果最初看似成功，后来被你发现是测量或数据问题？
9. 你做过的最困难跨团队协调是什么？冲突的目标分别是什么？
10. 如果把这个项目迁移到企业 Agent 系统，哪些机制仍然成立，哪些不成立？
11. 项目失败时你拥有哪部分责任？修复后改变了什么机制？
12. 如果让你用一页材料向 CTO 汇报，你保留哪五个信息？

### 5.3 客户发现、范围与 Pilot 设计（16 题；累计 40）

**要准备的知识**

- 业务流程建模：actor、decision、input、system、handoff、wait、error、exception；
- baseline、success metric、leading/lagging indicator、owner、time window；
- vertical slice、not-doing list、assumption log、go/no-go gate；
- 用户访谈、技术 discovery、风险 discovery 与 exec discovery 的差异。

**面试协议**：先问 5–8 个高信息量问题，再给方案；不要在未知身份、数据和成功标准时直接选模型。

1. 客户说“我们想做一个企业知识 Agent”，你的前十个问题是什么？
2. 如何从一句模糊高层目标找到真正的用户决策与工作流？
3. 谁是 buyer、exec sponsor、workflow owner、end user、security approver 和 blocker？
4. 如何画 current-state workflow，并识别最昂贵的等待、返工和错误？
5. 客户没有 baseline 数据时，你怎样定义 pilot success？
6. 客户要求六周内“覆盖所有部门”，你如何缩成可交付纵向切片？
7. 如何写 not-doing list，而不让客户感觉你在拒绝合作？
8. 两个用例：一个价值高但数据/权限复杂，一个价值中等但两周可上线。你选哪个？
9. 如何区分技术可行性 pilot、业务价值 pilot 与 adoption pilot？
10. 什么时候应该建议客户不使用 LLM 或 Agent？
11. 如何发现被忽略的 exception path、人工 workaround 和 shadow system？
12. 成功指标是“用户喜欢”，你如何把它变成有分母、时间窗和 owner 的指标？
13. 客户中途增加范围，如何保护 critical path，又不破坏关系？
14. 如何管理假设、未决问题、依赖、风险和 decision log？
15. Pilot 失败了：如何判断是模型、数据、集成、流程、采用还是错误用例？
16. 用 12 分钟主持一次 discovery 开场，并在结尾复述范围、风险与下一步。

### 5.4 Python、全栈与生产编码（20 题；累计 60）

**要准备的知识**

- Python：typing、dataclass/Pydantic、异常、context manager、generator、asyncio、并发边界、测试与 profiling；
- API：HTTP、REST、streaming、pagination、timeout、retry、idempotency、rate limit、auth；
- SQL：join、group/window、索引、事务、锁、schema migration；
- 前端：TypeScript、React state、fetch/stream、错误/加载/空态、可访问性；
- 生产纪律：contract、logging、metrics、trace、config、secret、unit/integration/e2e。

**现场协议**：复述 contract → 示例/边界 → baseline → 测试 → 复杂度 → 可观测性/生产化；允许 AI 时仍需逐行解释、修改并验证。

1. 实现一个带 timeout、指数退避、jitter 和错误分类的 API client。
2. 为有副作用的工具调用实现 idempotency key 与结果缓存。
3. 实现 bounded worker queue，支持 backpressure、取消和 graceful shutdown。
4. 实现 token-bucket 或 sliding-window rate limiter，并说明分布式版本。
5. 解析超大 JSONL/CSV，流式验证、统计错误并避免内存爆炸。
6. 实现 LRU cache，讨论 TTL、并发与缓存击穿。
7. 实现文档 chunk pipeline，保留 source、ACL、version 和 lineage。
8. 实现一个 FastAPI endpoint：提交任务、轮询状态、取消任务、幂等重试。
9. 实现 SSE/WebSocket 流式输出，处理断线重连与重复事件。
10. 设计 Pydantic schema 验证模型结构化输出，并处理部分合法结果。
11. 写 SQL：按 tenant 和 workflow 计算过去 7 天成功率、p95 延迟与人工接管率。
12. 一个查询从 200ms 变成 8s，你如何用 query plan、索引和数据分布定位？
13. 设计 job/status/event 表，支持重放、审计和 exactly-once illusion。
14. 实现工具 registry：schema、权限、timeout、side-effect class、owner、version。
15. 给一段陌生 Python 服务加 tracing、错误分类和 regression tests。
16. 修复 async 代码中的 race、资源泄漏或无限重试。
17. 在 React 中实现任务列表、详情、流式日志、取消和失败重试状态。
18. 设计前后端错误 contract，区分用户错误、依赖错误、策略拒绝和系统错误。
19. Code review：找出安全、可靠性、复杂度、测试和可维护性问题。
20. 90 分钟内完成一个可运行纵向切片；你如何切时间并决定不做什么？

### 5.5 数据建模、企业集成与身份（14 题；累计 74）

**要准备的知识**

- batch/stream、CDC、event、schema evolution、lineage、data quality；
- OAuth/OIDC、SSO、service account、RBAC/ABAC、tenant isolation；
- CRM、ticketing、document store、warehouse、Git/CI 等常见集成模式；
- webhook、polling、pagination、rate limit、partial failure、reconciliation。

1. 客户数据分散在 SharePoint、Slack、Jira、数据库和本地文件，如何建立第一版数据地图？
2. 何时使用 batch、CDC、event stream 或 request-time fetch？
3. 如何让 source ACL 贯穿 ingestion、index、retrieval、generation 和 citation？
4. 文档权限变化后，如何保证旧 embedding 不继续泄露内容？
5. 如何处理 schema evolution、backfill、双写与兼容读取？
6. 外部 API 有 rate limit、分页、429、乱序 webhook 和重复事件，如何集成？
7. 如何设计 reconciliation job，发现源系统与内部状态漂移？
8. 多租户系统如何隔离数据、缓存、日志、向量索引和密钥？
9. 用户身份、服务身份和 Agent 代理身份有何区别？
10. 何时用 delegated authorization，何时用 service account？
11. 如何做 data lineage，使每个答案和动作可追到 source/version/tool call？
12. 数据质量未知时，pilot 前做哪些 profile 和 sampling？
13. 客户不允许复制原始数据出网，架构如何变化？
14. 集成上线后 source contract 改变，如何检测、降级与通知 owner？

### 5.6 Enterprise RAG（18 题；累计 92）

**要准备的知识**

- ingestion、chunking、metadata、embedding、hybrid search、rerank、query rewrite；
- ACL-first retrieval、citation、freshness、version、deletion、multilingual；
- retrieval、context assembly、generation 分层评估；
- cache、成本、延迟、索引更新与 failure analysis。

1. 设计一个带文档级和段落级 ACL 的企业 RAG。
2. 为什么 RAG 不是“切块 + embedding + top-k”？
3. 如何按文档结构、语义、表格、代码和会话切块？
4. chunk 太大或太小分别造成什么失败？如何用实验选择？
5. dense、sparse、hybrid、metadata filter 和 reranker 如何组合？
6. 如何评估 retrieval recall，而不是只看最终回答？
7. 没有标准答案时，如何建立 query/document relevance 标注集？
8. 多语言查询和文档如何处理？何时翻译，何时跨语言 embedding？
9. 如何保证引用真的支持答案，而不是只有格式正确？
10. 文档每小时变化，如何处理 freshness、增量索引和删除？
11. 如何防止权限过滤放在 rerank 之后造成泄露？
12. RAG 回答“我不知道”的门槛如何设计与校准？
13. 如何处理 contradictory sources、版本冲突和权威来源优先级？
14. query rewrite 何时提升召回，何时破坏用户意图？
15. context packing 如何在 token 预算、去重、覆盖和顺序间取舍？
16. RAG 延迟 p95 太高，如何按 fetch/search/rerank/model 分解？
17. 如何设计 semantic cache，又不跨 tenant 或权限复用错误结果？
18. 从 50 用户 pilot 扩到 5,000 用户，索引、并发、成本和质量如何变化？

### 5.7 Agent、工具、状态与 Harness（18 题；累计 110）

**要准备的知识**

- workflow vs single agent vs multi-agent；
- plan/act/observe、tool contract、state machine、memory、checkpoint、replay；
- timeout、retry、budget、stopping condition、human approval、compensation；
- MCP/工具协议的价值与边界；
- 2026 的重点已从 prompt 单点优化转向 context、tool、harness 与 eval 的联合设计。

1. 什么时候确定性 workflow 足够，什么时候需要 Agent？
2. 为什么“最强模型 + 更多工具”不一定更好？
3. 设计一个 tool contract：哪些字段不可缺？
4. 如何让模型理解工具返回 schema、错误类别与副作用？
5. 工具调用 timeout 后结果未知，重试前如何避免重复副作用？
6. Agent state 放在 prompt、数据库、event log 还是外部 workflow engine？
7. 短期上下文、长期记忆、用户偏好与业务真源如何分开？
8. 如何做 checkpoint/replay，使一次失败可复现？
9. stopping condition 如何同时限制循环、成本、时间和风险？
10. 什么时候需要人工确认？确认界面必须展示哪些证据？
11. 工具返回不可信文本，如何防止其变成更高权限指令？
12. Agent 选择了错误工具：你如何判断是描述、context、模型还是 policy 问题？
13. 单 Agent 何时拆成多 Agent？用什么 eval 证明收益？
14. 多 Agent 如何控制通信成本、重复工作、冲突状态和故障域？
15. MCP 带来什么互操作价值？它没有自动解决哪些安全与语义问题？
16. 如何设计 model routing：质量、延迟、成本、数据策略和 fallback？
17. context window 很大时，为什么仍需要 compaction、retrieval 和状态外置？
18. 如何把一个成功 demo 重构为可维护、可测试、可运营的 harness？

### 5.8 Agent / LLM 评估（16 题；累计 126）

**要准备的知识**

- task、trial、grader、trace/trajectory、outcome、harness、suite；
- component、trajectory、end-to-end、safety、product/ROI 五层；
- deterministic checks、unit tests、human rubric、LLM judge、pairwise；
- 重复 trials、方差、confidence interval、judge calibration、saturation；
- 离线 eval、shadow、canary、A/B、production monitoring 的职责边界。

[Anthropic 2026 Agent Evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)强调不能只看最终文本：应区分完整 trace 与环境最终 outcome，并对非确定任务运行多个 trials、阅读失败 transcript、维护活的 eval suite。

1. Agent 的 task、trial、grader、trace 和 outcome 分别是什么？
2. 为什么单次成功 demo 不能证明 Agent 可上线？
3. 如何从真实工作流构建 50–100 条有分母的 eval set？
4. component、trajectory 与 end-to-end eval 各发现什么问题？
5. 最终回答正确但调用了危险工具，应如何评分？
6. Agent 声称已执行动作但数据库无变化，grader 应看什么？
7. 非确定输出为什么要多次 trials？如何报告 pass@k、成功率与方差？
8. exact match、规则 grader、unit test、LLM judge 和人工评分如何组合？
9. 如何校准 LLM judge，避免 position/style/verbosity bias？
10. 如何从 production failure 持续扩展 eval suite，又避免只追昨天的问题？
11. eval set 如何做 train/dev/test、版本和泄漏控制？
12. 如何区分模型、prompt/context、tool、harness、环境和 grader 的失败？
13. 什么时候 eval 已饱和？怎样增加难度而不制造不公平任务？
14. latency、token、cost、tool error 和人工接管率如何进入 gate？
15. offline 变好但 online adoption 下降，如何调查？
16. 为 pilot 定义 go/no-go、canary pause 和 rollback 三组门槛。

### 5.9 安全、隐私、治理与合规（18 题；累计 144）

**要准备的知识**

- threat model：asset、actor、trust boundary、entry point、abuse case、control、residual risk；
- prompt injection、sensitive disclosure、poisoning、supply chain、improper output handling、excessive agency；
- least privilege、sandbox、allowlist、egress、secret、audit、retention、deletion、DLP；
- human accountability、approval gate、policy-as-code、red team、incident response；
- [OWASP Top 10 for LLM/GenAI](https://genai.owasp.org/llm-top-10/)、[NIST GenAI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)与新加坡 [2026 Model AI Governance Framework for Agentic AI](https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/new-model-ai-governance-framework-for-agentic-ai)。新加坡框架特别要求预先限制 Agent 权力、设置有意义的人类审批、全生命周期技术控制和用户透明/培训。

1. 对一个能读邮件、查 CRM、创建退款的 Agent 做 threat model。
2. direct 与 indirect prompt injection 有何不同？
3. 为什么“在 system prompt 里说不要泄密”不是安全边界？
4. 检索文档中藏有外发指令，如何在数据、模型、工具和网络层防御？
5. 如何防止 sensitive information disclosure 和跨租户泄露？
6. 工具权限如何做到 least privilege、scoped token 和 just-in-time approval？
7. 哪些动作必须 human-in-the-loop？如何避免 rubber-stamp approval？
8. Agent 生成 SQL/shell/code 后，在哪里验证和 sandbox？
9. 如何设计 egress allowlist、network boundary 与 data residency？
10. 模型/embedding/library/tool 供应链如何锁版本、验证和回滚？
11. 如何处理日志中的 PII、secret 和完整 prompt/response？
12. audit log 必须记录哪些主体、输入、policy、tool、结果和审批信息？
13. 如何做 retention、right-to-delete、索引删除和 backup 删除？
14. red-team suite 应覆盖哪些正常、边界、恶意和组合攻击？
15. 安全误报太多导致用户绕过，如何重新设计控制？
16. Agent 做出未授权动作，事故响应前 30 分钟做什么？
17. 如何向 CISO 解释 residual risk，而不承诺“完全安全”？
18. 如何把治理要求变成可执行 release gate，而不是文档 checklist？

### 5.10 系统设计、可靠性、可观测性与成本（18 题；累计 162）

**要准备的知识**

- requirements、capacity、API、data model、consistency、queue/cache、failure domain；
- SLI/SLO/error budget、trace/metric/log、retry/circuit breaker/bulkhead、backpressure；
- canary、feature flag、shadow、rollback、degrade、DR；
- token/model/tool/data/infra cost decomposition。

1. 设计一个多租户企业知识与行动 Agent 平台。
2. 设计一个异步长任务系统，支持取消、重试、恢复、审计和 streaming。
3. 如何定义 Agent 系统的 availability：请求成功、任务成功还是业务 outcome？
4. SLI/SLO 应覆盖哪些 API、workflow、模型、工具和业务层指标？
5. 模型供应商超时或限流时，如何降级？
6. retry 何时放大故障？如何使用 timeout budget、backoff、jitter 和 circuit breaker？
7. 如何用 queue 和 backpressure 保护下游工具？
8. 如何设计 trace，使一次任务跨模型、retrieval、tool、approval 可重放？
9. 如何区分 model latency、queue、retrieval、tool 和 frontend perception？
10. 缓存哪些层：embedding、retrieval、prompt prefix、model response、tool result？各有什么失效风险？
11. 如何做 model routing 与 fallback，避免质量静默下降？
12. 部署新 prompt/model/tool schema 时如何 canary 与 rollback？
13. 如何处理部分成功：三个工具中两个成功、一个失败？
14. 如何设计 disaster recovery 与 region/data residency？
15. 多租户 noisy neighbor 如何隔离并发、token、存储和成本？
16. 每任务成本突然翻倍，如何定位 token、循环、检索、工具和重试？
17. 如何设置预算和 stopping rule，不让一个 Agent 消耗无限资源？
18. 从 100 到 100,000 日任务，架构哪些部分先变，哪些不要过早优化？

### 5.11 Private cloud、on-prem 与受限环境（10 题；累计 172）

**要准备的知识**

- connected / private cloud / on-prem / air-gapped 的不同约束；
- artifact registry、离线依赖、镜像、SBOM、secret、升级、telemetry 与支持边界；
- GPU/CPU/内存/存储容量，量化、batching、模型路由；
- 不可出网数据下的检索、评估和 incident support。

1. 客户禁止数据离开 VPC，系统如何部署与运维？
2. air-gapped 环境如何交付模型、镜像、依赖、license 与安全更新？
3. 没有外部 telemetry 时，如何观测、导出和远程支持？
4. 客户只有有限 GPU，如何在质量、吞吐、延迟与成本间取舍？
5. 如何验证本地模型与云模型的功能/质量 parity？
6. secret、certificate、key rotation 在离线环境如何管理？
7. 升级失败或新模型退化时，如何 atomic rollback？
8. 如何定义客户、你的团队、云/模型供应商的 support ownership？
9. 对数据 residency、retention 和 backup 做哪几类证据检查？
10. 哪些功能在受限环境里应明确不支持？如何提前写进 acceptance criteria？

### 5.12 Existing system、调试与事故指挥（12 题；累计 184）

**要准备的知识**

- repo/service map、request/data/control path、binary search boundary；
- incident severity、commander、scribe、stakeholder update、mitigation before root cause；
- hypothesis table、minimal discriminating experiment、timeline、postmortem；
- rollback、kill switch、data repair、replay 与 recurrence prevention。

1. 第一天进入陌生客户代码库，你前 90 分钟做什么？
2. 一个 Agent 昨天正常、今天成功率下降 20%，如何分层定位？
3. 线上错误无法本地复现，你如何固定输入、版本、state 和依赖？
4. trace 显示模型输出正常但最终动作错误，下一步检查什么？
5. 只在一个 tenant 失败，如何判断权限、数据、config、quota 或版本问题？
6. 延迟只有 p99 恶化，平均值不变，你如何调查？
7. 新索引上线后引用变差，如何安全回滚并保留证据？
8. 工具调用可能重复执行，你如何止损、对账和补偿？
9. 高优事故中何时先降级/停用，而不是继续找 root cause？
10. 每 20 分钟 exec update 应包含哪些事实、决定、风险和 ask？
11. Postmortem 如何避免“工程师更小心”这种无效 action item？
12. 如何把一次客户特有故障抽象成平台级 regression test 与 reusable control？

### 5.13 ROI、采用、变更管理与运营交接（12 题；累计 196）

**要准备的知识**

- value hypothesis、baseline、counterfactual、time saved、quality/risk/revenue；
- adoption funnel：eligible → activated → repeated use → workflow completion → retained；
- champion、training、feedback channel、SOP、support model、operational owner；
- 影子使用、selection bias、novelty effect 与 workload shift。

1. 如何为“知识 Agent”定义业务价值，而不只报回答准确率？
2. 节省时间如何测量，避免 self-report 和 novelty bias？
3. 用户登录很多但真正完成 workflow 很少，如何诊断 adoption funnel？
4. 模型质量达到 gate，但用户仍不用，可能有哪些流程和激励原因？
5. 如何选择 pilot champion，又避免 champion 样本过于理想？
6. 如何设计培训、office hours、反馈和 escalation？
7. 人工接管率下降是好事吗？可能隐藏什么风险？
8. 如何计算 ROI，同时呈现成本、风险和不确定性区间？
9. 客户要求承诺 50% 效率提升，但没有 baseline，你如何回应？
10. 什么时候应该停止 pilot，而不是继续调模型？
11. 从 20 人扩到全组织前，哪些 owner、SOP、SLO 和 support 必须就位？
12. 如何把系统交给客户运营团队，而不是永远依赖 FDE？

### 5.14 Field-to-product、复用与平台化（8 题；累计 204）

**要准备的知识**

- one-off requirement、repeated pattern、product gap、services work 的区分；
- reusable asset：connector、eval、playbook、reference architecture、policy、template；
- field signal 的频率、价值、证据、广度和 opportunity cost。

1. 如何判断客户请求应做定制、配置、平台能力还是拒绝？
2. 三个客户有相似但不相同的需求，如何抽象最小公共原语？
3. 什么样的 field evidence 足以影响产品 roadmap？
4. 如何写高质量 product feedback：用户、workflow、频率、影响、workaround、证据、proposal？
5. 如何避免把产品变成客户特例集合？
6. 哪些 eval、connector、runbook 或 demo 应做成 reusable asset？
7. 复用率如何度量？复用本身何时反而拖慢交付？
8. 描述一次你会把客户需求退回 discovery，而不是进入 build 的情况。

### 5.15 行为、领导力、冲突与客户沟通（16 题；累计 220）

**要准备的材料**

- 8 个可交叉复用但不重复的故事：最大影响、技术深度、模糊问题、冲突、失败、事故、速度、帮助他人；
- 每个故事标注个人决定、反对意见、数字证据、残余风险与后续机制；
- 技术工程师、产品负责人、CISO、业务高管四种表达版本。

1. 描述一次你在高度模糊下推进交付。
2. 描述一次你对客户或高层说“不”或缩小范围。
3. 描述一次技术方案正确但 stakeholder 没有接受，你学到什么？
4. 描述一次你与产品/研究/工程对优先级有冲突。
5. 描述一次你在时间压力下做了可逆与不可逆决定。
6. 描述一次上线事故：你如何止损、沟通和防复发？
7. 描述一次你发现自己的主张或指标错了。
8. 描述一次客户真正问题与最初请求不同。
9. 描述一次你交付了 0→1，但后来必须平台化或重构。
10. 描述一次你在没有正式 authority 时推动多方完成工作。
11. 描述一次你公开暴露坏消息或不确定性。
12. 描述一次你选择不构建某个功能。
13. 描述一次你需要快速学习陌生领域并建立可信度。
14. 如何面对强势但技术判断错误的客户 stakeholder？
15. 如何同时向工程师和 exec 解释同一个风险？
16. 你希望同事如何描述你的工作方式？给直接证据。

### 5.16 流程、AI 工具政策、EP、薪酬与 Offer（10 题；累计 230）

1. 这轮 coding/take-home 是否允许 AI、搜索或文档？允许到什么范围？
2. 如果允许 AI，你如何证明自己理解、审查并拥有最终代码？
3. 如果不允许 AI，你如何在有限时间保持语法与标准库熟练度？
4. 公司和该具体岗位是否愿意为需要 EP 的候选人申请？谁能确认？
5. offer 的 annual fixed cash 是 basic salary、固定 allowance 还是还包含 variable bonus？
6. equity 的授予单位、vesting、cliff、refresh 和流动性风险是什么？
7. 旅行时间、周末/跨时区、报销和客户 onsite 如何计算？
8. level 与 scope 如何对应？成功的前 30/60/90 天是什么？
9. 同时处理多少客户？on-call、事故、支持与交付边界是什么？
10. 如果固定薪酬、EP、旅行或岗位实质不满足硬约束，什么条件才值得战略性例外？

---

## 6. 七个必须闭卷画出的系统设计 Case

### Case A：ACL-first 企业 RAG

**题面**：为 5,000 名员工构建跨文档源问答，权限频繁变化，回答必须引用依据。

**必须覆盖**：

- SSO → identity/claims → source ACL sync → ingestion/version/delete；
- metadata + hybrid retrieval + ACL pre-filter + rerank + context assembly；
- citation entailment、abstention、conflict/freshness；
- retrieval/e2e/safety eval；
- tenant/cache/log isolation；
- p95、cost、canary、index rollback 与 adoption。

### Case B：带审批的 Agentic 文档工作流

**题面**：读取合同与工单，生成建议，必要时更新 ticket/发送邮件。

**必须覆盖**：

- deterministic workflow baseline；
- tool registry、side-effect class、scoped auth、idempotency；
- draft → evidence view → human approval → execute → reconcile；
- prompt injection、data exfiltration、audit；
- trajectory/outcome graders 与业务处理时间。

### Case C：Private cloud / on-prem 部署

**题面**：金融客户数据不得出 VPC，GPU 有限，升级窗口每季度一次。

**必须覆盖**：

- artifact/模型/依赖供应链与 SBOM；
- capacity、量化、路由、batch、fallback；
- local identity/secret/certificate；
- 离线 eval、telemetry export、support bundle；
- upgrade compatibility、atomic rollback、责任边界。

### Case D：多租户 Agent 平台

**题面**：多个业务线配置不同工具、知识源、policy 和模型。

**必须覆盖**：

- control plane / data plane；
- tenant config、policy、budget、tool allowlist；
- job/event/checkpoint、queue/backpressure；
- trace、cost allocation、noisy-neighbor protection；
- versioned rollout 与 tenant-specific canary。

### Case E：Agent Eval 平台

**题面**：多个团队希望统一评估客服、coding、数据分析 Agent。

**必须覆盖**：

- task schema、environment、trial、harness、grader、artifact；
- deterministic/human/LLM judge；
- repeated trials、seed/model/tool version；
- transcript viewer、failure taxonomy、judge calibration；
- suite ownership、CI gate、saturation 与 production feedback。

### Case F：企业 AI 生产事故

**题面**：新模型上线后 2% 的高风险任务发生未授权工具调用。

**必须覆盖**：

- kill switch / disable side effects / contain；
- affected tenant/task/version/time window；
- audit/reconcile/notification；
- model vs policy vs tool vs harness root-cause tree；
- regression eval、approval redesign、canary 与 postmortem。

### Case G：Visual Quality Incident Copilot（你的差异化 Case）

**题面**：帮助视觉团队从失败帧、设备日志、模型版本和 runbook 中定位质量回归并生成可审核处理建议。

**为什么适合你**：它把你的 CV、设备 runtime、parity、golden cases 和 release 经验连接到 RAG/Agent、工具、eval、安全、全栈与客户工作流，形成独特而可信的 FDE 证据。

---

## 7. 一个足以支撑 FDE 转型的作品：Visual Quality Incident Copilot

### 7.1 产品目标

用户不是“所有工程师”，而是处理视觉质量回归的 ML / runtime / QA 工程师。它支持的决策是：**问题最可能位于数据、模型、转换、设备 runtime、后处理还是发布配置；下一步最小区分实验是什么；是否应暂停/回滚。**

### 7.2 最小纵向切片

输入：一组失败案例、模型/构建/设备版本、关键 tensor compare、日志和 runbook。

输出：

1. 证据化 failure summary；
2. 分层假设表与下一步实验；
3. 引用到 source/version 的 runbook 建议；
4. 可审核的 issue 草稿；
5. 明确“不自动改生产、不自动回滚”的权限边界。

### 7.3 架构

```text
SSO / tenant
   → Case API + artifact store
   → metadata / ACL / versioned ingestion
   → hybrid retrieval + authoritative-source policy
   → deterministic triage workflow
   → model reasoning + tool calls (read-only first)
   → evidence / approval UI
   → issue draft or approved action
   → trace + outcome + cost + audit
```

工具至少包括：case metadata、artifact/tensor diff、build/version query、runbook search、issue draft；每个工具记录 schema、权限、timeout、error、side effect、owner 和 version。

### 7.4 评估与安全证据

- 50–100 条 task suite：数据、模型、转换、runtime、后处理、配置、unknown；
- component：retrieval relevance、citation support、tool selection、schema；
- trajectory：权限、步骤、无无效循环、失败恢复；
- outcome：是否提出正确下一实验/是否错误触发动作；
- safety：间接 injection、跨 tenant、secret、恶意 artifact、越权工具；
- product：time-to-first-valid-hypothesis、人工修订率、接管率；
- 多 trials、失败 transcript review、release/canary/rollback gate。

不要伪造“降低 40% MTTR”之类结果。作品阶段写成：**hypothesis、测量设计、synthetic/internal benchmark 结果与尚未验证的 real-world outcome**。

### 7.5 仓库必须出现的 12 份证据

1. README：用户、决策、范围、不做事项；
2. current-state workflow 与 pilot success criteria；
3. 一页 architecture diagram；
4. ADR：为什么 workflow-first，何时升级 Agent；
5. data/ACL/retention contract；
6. tool contracts；
7. threat model；
8. eval task schema 与冻结 suite；
9. transcript / failure viewer；
10. SLO、dashboard、runbook、kill switch；
11. canary/rollback 与 on-prem variant；
12. 5–8 分钟 demo + 10 分钟技术答辩稿。

---

## 8. 12 周准备路线：每周既学习，也向市场发出证据

每周只设一个主交付物；学习输入必须转成代码、图、口述、评分或外部求职动作。若面试已临近，使用后面的六周压缩版。

| 周 | 核心能力 | 学习输出 | 求职 / 外部 Ship | 退出门槛 |
|---|---|---|---|---|
| 1 | 定位与市场 | FDE/TDL/Applied AI 角色表；90 秒定位；Strong/Adjacent/Gap | 建 20 家目标公司/团队清单；更新 CV headline | 三种定位可闭卷；不虚构 Agent 年限 |
| 2 | 项目与行为证据 | 2 个 deep dive、8 个故事、数字证据表 | 请 1 位同行做 30 分钟追问；修 CV | 每个主张有个人决定、分母、弃选和复盘 |
| 3 | Python / API / SQL | 生产式 API、幂等、queue、SQL、tests | 发布最小纵向切片；投 2–3 个强匹配岗位 | 90 分钟 pair build 可运行、可测、可解释 |
| 4 | 企业数据与 RAG | ACL-first ingestion/retrieval；retrieval eval | 为目标 JD 写一份 skill mapping | 权限贯穿 source→answer；引用可验证 |
| 5 | Agent / Harness | workflow-first、tools、state、checkpoint、approval | 发布 architecture/ADR；定向联系 2 位从业者 | 能证明为何用/不用 Agent，多次失败可 replay |
| 6 | Eval | 50–100 条 suite、grader、trace viewer、release gate | 用公开 demo/文章展示 eval 方法 | 失败有分母；多 trials；读过 transcript |
| 7 | Security / Governance | threat model、OWASP、IMDA Agentic AI controls、red team | 更新作品安全文档；做一次 CISO mock | 越权、injection、泄露、副作用均有边界控制 |
| 8 | Reliability / on-prem | SLO、trace、runbook、kill switch、private-cloud variant | 投递第二批；向 recruiter 早问 EP/旅行/薪酬 | 能处理 dependency outage、rollback 和离线支持 |
| 9 | Discovery / ROI / adoption | current workflow、pilot brief、ROI/adoption dashboard | 做 2 场 customer case mock | 12 分钟内从模糊请求到有 owner 的 slice |
| 10 | System design | 七个 canonical case 各一页 | 选 3 家公司做产品/客户/岗位专项 dossier | 45 分钟图含身份、数据、eval、安全、rollout |
| 11 | 面试循环 | coding、debug、case、behavior、exec 各 2 场 | 继续精准投递与 referral；记录 funnel | 各轮 scorecard ≥3/4，无致命红旗 |
| 12 | Final / offer | 全流程 mock、AI policy、reference、negotiation | 跟进、谈 level/fixed/equity/EP/travel | 所有硬约束书面澄清；有 BATNA 与决策表 |

### 8.1 六周压缩版

| 周 | 合并内容 |
|---|---|
| 1 | 定位 + 两个项目 deep dive + 8 个行为故事 + 首批投递 |
| 2 | Python/API/SQL + existing system/debug + 生产式纵向切片 |
| 3 | 企业 RAG + Agent/Harness + tool/approval architecture |
| 4 | Eval + Security/IMDA governance + on-prem/reliability |
| 5 | Discovery + Pilot/ROI/adoption + 七个系统设计 case |
| 6 | 每日一场不同轮次 mock + 公司专项 + EP/薪酬/offer 准备 |

---

## 9. 日常与每周求职操作系统

### 9.1 每日三种档位

| 档位 | Learn | Ship | Close | 适用 |
|---|---:|---:|---:|---|
| 最小 20 分钟 | 10 | 8 | 2 | 保持连续性：一题闭卷 + 一条 follow-up |
| 标准 75 分钟 | 25 | 40 | 10 | 一项知识训练 + 一份可见产物/投递动作 |
| 深度 120 分钟 | 45 | 60 | 15 | coding/case/project 深练 + 外部动作 + 复盘 |

规则：**每天同时有 learning output 和 external shipping action。**“读了两小时”不算完成；“生成了一堆通用简历”也不算高质量 ship。

### 9.2 每周 funnel

记录：

- 新发现岗位数；
- 通过硬闸门数；
- 高拟合投递数；
- referral / recruiter conversation；
- screen / technical / final；
- reject stage 与原因；
- 每周只改变一个主要变量：岗位 lane、CV 证据顺序、outreach、coding、case 或 system design。

### 9.3 一天只推进一个 Active Role

每个 active role 的最小数据：

```text
Company / role / URL / captured date / status
Location / hybrid / travel
EP: confirmed / unverified / not supported + evidence
Fixed pay probability + evidence
JD skills: Strong / Adjacent / Gap
Fit score + top 3 proofs + top 2 gaps
Next human-confirmed action + owner + date
```

---

## 10. 岗位筛选、评分与投递闸门

### 10.1 硬闸门

1. 新加坡或明确可接受的 remote/location；
2. 需要 EP：没有官方/recruiter 证据就标 **Unverified**，不能标 confirmed；
3. fixed annual pay 目标为 **S$150k–170k**，bonus/equity 分开；明显低于 S$150k 的岗位 reject/hold，除非你明确记录战略例外；
4. vacancy 必须当前开放、可转移且不是重复/过期页面；
5. 旅行、办公、客户面对和 on-call 必须在可接受范围。

### 10.2 适配评分（通过硬闸门后）

| 维度 | 权重 | 评分问题 |
|---|---:|---|
| 已证明技术证据 | 35% | JD 的核心工作是否能由直接项目证据支撑？ |
| 生产/部署 | 20% | 是否证明真实 runtime、release、reliability、客户结果？ |
| seniority / scope | 15% | 你的 ownership 与目标 level 是否一致？ |
| transfer cost | 10% | Gap 可在多短时间补成直接证据？ |
| compensation probability | 10% | fixed 目标是否现实且已有信号？ |
| EP probability | 10% | 该岗位/公司是否有可验证支持信号？ |

推荐解释：80+ 优先；70–79 定向；60–69 仅战略性；低于 60 通常不消耗主线时间。分数不是事实，证据链接和不确定性比小数点重要。

### 10.3 Strong / Adjacent / Gap 映射模板

| JD 要求 | 标签 | 一句话证据 | 风险 | 面试前动作 |
|---|---|---|---|---|
| 生产 Python | Strong | 写真实项目、规模、职责、测试/发布 | 是否覆盖 Web/API | 做 pair build |
| Customer-facing deployment | Strong/Adjacent | 只写真实客户或跨团队交付 | executive ownership 可能不足 | 准备 discovery/adoption 故事 |
| Enterprise RAG/Agent | Adjacent | 作品与 eval 直接证据 | 企业生产年限不足 | 完成 ACL + trace + rollout |
| Kubernetes/hyperscale | Gap | 不虚构 | 可能是硬缺口 | 只在目标岗强要求时补最小实战 |

---

## 11. 新加坡 EP 与薪酬：2026 求职必须提前处理

[MOM EP Eligibility](https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility)规定 EP 是两阶段：先满足按年龄/行业递增的 qualifying salary，再在不豁免时通过 COMPASS（40 分）。当前非金融行业最低门槛从 S$5,600/月起、金融从 S$6,200/月起，且随年龄上升；2027-01-01 起新申请门槛将调整，若流程跨年要重新检查。满足你的个人薪酬目标不等于自动通过 COMPASS。[MOM EP Key Facts](https://www.mom.gov.sg/passes-and-permits/employment-pass/key-facts)说明申请由雇主或其 employment agent 提交。

### 11.1 Recruiter 首轮要问

> I am based in Singapore and would require employer support for an Employment Pass. Is this specific role open to candidates requiring EP sponsorship, and can the recruiting team confirm that before the technical loop?

中文思路：礼貌、事实化、指向**具体岗位**。公司过去办过 EP，不等于本岗位已确认；relocation 也不自动等于 EP 承诺。

### 11.2 薪酬口径

你的硬目标：**固定年薪 S$150k–170k**。谈判时拆开：

- annual basic salary；
- fixed monthly/annual allowances；
- AWS/13th month 是保证还是条件性；
- target/actual variable bonus；
- sign-on；
- equity grant、vesting、refresh；
- benefits；
- travel/on-call 现实成本。

不要把 target bonus 或未流动 equity 填进 fixed pay。S$150k–170k 固定年薪约等于 S$12.5k–14.17k/月（按 12 个月简单换算）；具体 offer 仍按合同定义。

---

## 12. 五张面试评分卡

### 12.1 Coding / pair build（各 0–4）

- Contract 与澄清；
- 正确性与边界；
- 代码结构/可读性；
- tests 与观测；
- 复杂度/性能；
- 沟通与独立解释。

**致命红旗**：无法运行、无测试、说不清 AI 生成代码、危险重试/副作用、用复杂框架掩盖基本错误。

### 12.2 Customer discovery / case（各 0–4）

- Outcome/workflow；
- baseline/metric/owner；
- constraint/risk；
- vertical slice/not-doing；
- delivery/rollout/adoption；
- 沟通与异议处理。

**致命红旗**：未澄清就选技术；没有 baseline；范围无限；不理解客户 change management。

### 12.3 System design（各 0–4）

- requirements/capacity；
- data/identity/integration；
- architecture/state/failure；
- eval/security/governance；
- reliability/cost/rollout；
- trade-off communication。

**致命红旗**：ACL 在生成后补；有副作用无审批/幂等；只有 accuracy 无 outcome；无 rollback。

### 12.4 Behavioral / executive（各 0–4）

- 个人 ownership；
- 判断与 rejected alternative；
- 冲突/客户可信度；
- 数字证据；
- 失败与机制改变；
- 结论先行的表达。

**致命红旗**：夸大规模；责怪他人；所有故事都完美成功；无法说出自己的决定。

### 12.5 总体 Readiness Gate

可以进入高强度投递，当且仅当：

- 两个项目 deep dive、八个故事可闭卷；
- 90 分钟生产 coding 连续两次 ≥3/4；
- 七个系统 case 中至少五个可在 45 分钟完成；
- 三场 discovery/live case 的 framing、delivery、communication ≥3/4；
- 作品具备 ACL、tool contract、eval、trace、approval、SLO、rollback；
- EP、薪酬、地点、旅行的提问脚本已准备；
- 所有 Gap 都诚实且有补证计划。

---

## 13. 公司专项准备卡（每家公司一页）

```text
Company / role / current URL / captured date
Role archetype: FDE / FDSE / TDL / Applied AI / Solutions
Product + primary customer + deployment model
What success means in the official JD
Coding / customer / travel / adoption proportions
Top 5 JD requirements → Strong / Adjacent / Gap
Three direct proofs from my experience
Two likely objections and honest response
One company-relevant system design case
One 90-second “why this company” answer
Five high-signal questions for interviewer
Location / hybrid / travel / EP / fixed pay status + evidence
Interview AI-tool policy + source/recruiter confirmation
```

高信号反问：

1. 最近一个成功 deployment 从 discovery 到 production adoption 经历了哪些阶段？
2. FDE 与 Product/Research/Customer Engineering/TDL 的 ownership 边界在哪里？
3. 什么现场问题应做 one-off，什么会进入 core product？
4. 失败 deployment 最常见原因是技术、数据、scope 还是 adoption？
5. 入职 90 天后，哪些可观察结果说明这个人成功？

---

## 14. 2026 月度刷新清单

每月一次，不要每天追热点：

1. 刷新目标公司官方 careers，记录 captured date 与状态；
2. 核对 Singapore/remote、travel、hybrid、level；
3. 核对 EP 官方规则与 recruiter-specific confirmation；
4. 核对 interview AI-tool policy；
5. 抽取 10 个最新 JD 的共同能力词并与当前任务覆盖比对；
6. 更新 Agent/security/governance 官方资料：IMDA、OWASP、NIST；
7. 用新模型/工具版本跑同一冻结 eval，不凭 demo 更换技术；
8. 查看 funnel：问题发生在发现、硬闸门、简历、screen、coding、case 还是 final；
9. 一次只改变一个求职变量；
10. 归档过期岗位，避免把旧页面当 2026 vacancy。

---

## 15. 从今天开始的 7 天行动表

| 天 | Learn | Ship | Close |
|---|---|---|---|
| Day 1 | 读本指南 0–4，完成 Strong/Adjacent/Gap | 写 90 秒定位与硬约束卡 | 录音一次，删掉无证据形容词 |
| Day 2 | 闭卷做简历项目题 1–6 | 完成一个 30 分钟 deep dive 图 | 找出三个数字的分母与来源 |
| Day 3 | 做 Python/API 题 1、2、8 | 提交可运行 API + tests | 记录卡住点，不用“粗心”解释 |
| Day 4 | 做 RAG 题 1、6、9、11 | 画 ACL-first RAG 一页图 | 5 分钟讲给安全负责人 |
| Day 5 | 做 Agent 题 1、3、5、10 | 写 Visual Incident Copilot 的 ADR/tool contracts | 明确三个不自动执行动作 |
| Day 6 | 做 Eval 题 1–6 | 建 20 条首版 task set + graders | 读失败 transcript，改一条 grader |
| Day 7 | 做 60 分钟 FDE live case | 建 10 个目标岗位表并通过硬闸门 | 只选一个 active role 进入下周 |

七天后的最小成果不是“学完 FDE”，而是：**一个可信定位、一个深挖项目、一段可运行代码、一张 ACL-first 架构图、一组初版 eval 和一个经过硬闸门的 active role。**

---

## 16. 官方参考与知识库路由

### 2026 岗位、面试与求职事实

- [OpenAI — Forward Deployed Engineer, Singapore](https://openai.com/careers/forward-deployed-engineer-singapore-singapore/)
- [OpenAI — Technical Deployment Lead, Singapore](https://openai.com/careers/technical-deployment-lead-singapore-singapore/)
- [OpenAI — Applied AI Engineer, Cyber, Singapore](https://openai.com/careers/applied-ai-engineer-cyber-singapore/)
- [OpenAI — Interview Guide](https://openai.com/interview-guide/)
- [Anthropic — Careers / interview and AI-use guidance](https://www.anthropic.com/careers)
- [Palantir — Forward Deployed Software Engineer](https://jobs.lever.co/palantir/c4442730-2926-41ad-8c0e-5e5a6b4d14ae)
- [Palantir — Delivering a use case](https://www.palantir.com/docs/foundry/getting-started/delivering-a-use-case)
- [Cohere — Forward Deployed Engineer, Agentic Platform](https://jobs.ashbyhq.com/cohere/b0bcef37-1d20-414f-aade-c54942d63df9)
- [Scale AI — Forward Deployed Engineer, GenAI](https://scale.com/careers/4593571005)
- [MOM — EP eligibility](https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility)
- [MOM — EP key facts](https://www.mom.gov.sg/passes-and-permits/employment-pass/key-facts)

### Agent、评估、安全与治理

- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic — Demystifying evals for AI agents (2026)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Anthropic — Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [OWASP — Top 10 for LLM and GenAI](https://genai.owasp.org/llm-top-10/)
- [NIST — AI RMF Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [IMDA — Model AI Governance Framework for Agentic AI (2026)](https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/press-releases/2026/new-model-ai-governance-framework-for-agentic-ai)

### 本知识库内的准备路由

- 定位、作品与原有六周转型线：[AI Agent / FDE 转型路线](agent-fde-transition-plan.md)
- 第一性原理：[第一性原理知识地图](first-principles-knowledge-map.md)
- Agent runtime、context、tool、eval：[深入理解 AI Agent 路线](ai-agents-in-depth-plan.md)
- 最小 Agent 实现与协议：[Hello-Agents 路线](hello-agents-plan.md)
- Repo/SPEC/机械回压：[Harness Engineering 路线](harness-engineering-plan.md)
- Prompt contract 与冻结评测：[Prompt 工程路线](prompt-engineering-method-plan.md)
- 全栈基础：[Topcoder Fullstack 路线](topcoder-fullstack-roadmap-plan.md)
- 分布式系统：[分布式系统模式路线](distributed-systems-patterns-plan.md)
- 编码模式：[AlgoNote 路线](algo-note-plan.md)与 [Blind 75 缺口](blind-75-plan.md)
- 统一六周节奏：[学习计划](study-plan.md)与[练习脉络](practice-roadmap.md)

这份指南是“岗位真相、题库、评分、作品、投递与 offer”的总控层；上述专题材料负责各知识模块的深挖。面试前应从目标 JD 反向激活，不要把全部资料平均学习。
