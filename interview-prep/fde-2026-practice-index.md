# FDE 2026 一页式执行索引

> 这是 [FDE 2026 求职与面试指南](fde-2026-job-search-guide.md) 的执行入口。完整指南负责解释，本文负责回答：**今天练什么、为什么、留下什么证据、什么时候算过关。**

---

## 0. 使用规则：不要把 230 题变成新的拖延方式

1. 同一时间只激活一个真实岗位；没有当前、可转移的岗位页面，就不做公司专项。
2. 先过地点、EP、固定薪酬、岗位实质、旅行/on-call 五个硬闸门，再花时间定制。
3. 练习顺序是 `闭卷回答 → 可检查产物 → 追问/换约束 → 评分 → 延迟复测`。
4. 每天必须同时完成 `Learn + Ship + Close`；阅读和搜索本身不算完成。
5. 所有经历按 `Strong / Adjacent / Gap` 表述，不把作品经历写成企业生产年限。
6. 面试前从本索引激活 30–50 题，而不是按顺序背完 230 题。

本文的稳定检索词：

- `FDE26`：九个交互练习；
- `FDE-CORE`：核心题单与通过门槛；
- `FDE-72H`：面试在 72 小时内的应急路线；
- `FDE-Q001`–`FDE-Q230`：单题永久编号；
- `Visual Quality Incident Copilot`：差异化作品集；
- `Employment Pass`：EP、薪酬和 Offer 核验。

---

## 1. 先选入口，不要先选资料

| 当前情形 | 入口 | 今日完成定义 |
|---|---|---|
| 还没有目标岗位 | 市场定位入口 | 建 10 个当前岗位候选；只留通过地点/岗位实质闸门的角色 |
| 有岗位，还没投 | JD 激活入口 | Strong/Adjacent/Gap 表 + 三条证据 + 两个 gap 动作 + 一版 CV opening |
| Recruiter 在 72 小时内 | `FDE-72H` | 定位、项目、硬约束、岗位问题四张卡；完成一次录音 mock |
| Coding/Pair Build 在 72 小时内 | `FDE26-2` | 90 分钟可运行纵向切片；tests、错误 contract、README、复盘 |
| Case/System Design 在 72 小时内 | `FDE26-4/5/6/7` | 一页架构图 + 风险/评估/rollout + 10 分钟讲解 + 追问 |
| Final/Offer 在 72 小时内 | 行为与决策入口 | 八个故事、五个 interviewer questions、EP/固定薪酬/旅行书面核验表 |
| 暂无面试但要转型 | 六周主线 | 每周一个可公开/可复用证据，并保持精准投递和反馈闭环 |

最小启动动作：在桌面应用选择 `AI Agent / Forward Deployed`，搜索 `FDE26`，打开当前阶段对应的 Session。

---

## 2. 230 题永久编号地图

每题在完整指南中具有唯一编号。记录练习、错题、mock 和公司专项时只使用该编号，不再写“RAG 第 6 题”这类会失去上下文的名字。

| 永久编号 | 能力簇 | 数量 | 主要面试轮次 |
|---|---|---:|---|
| FDE-Q001–Q012 | Recruiter、动机、岗位判断 | 12 | Recruiter / Hiring Manager |
| FDE-Q013–Q024 | 简历、项目与 Senior 证据 | 12 | Hiring Manager / Technical Deep Dive |
| FDE-Q025–Q040 | Discovery、范围、Pilot | 16 | Live Case / Customer Round |
| FDE-Q041–Q060 | Python、全栈、生产编码 | 20 | Pair Build / Coding |
| FDE-Q061–Q074 | 数据、身份、企业集成 | 14 | Integration / System Design |
| FDE-Q075–Q092 | Enterprise RAG | 18 | Applied AI / System Design |
| FDE-Q093–Q110 | Agent、工具、状态、Harness | 18 | Agent Architecture / Build |
| FDE-Q111–Q126 | Agent / LLM Evaluation | 16 | Eval / Technical Deep Dive |
| FDE-Q127–Q144 | 安全、隐私、治理 | 18 | Security / System Design |
| FDE-Q145–Q162 | 可靠性、可观测性、成本 | 18 | System Design / Production |
| FDE-Q163–Q172 | Private cloud / on-prem | 10 | Deployment / Enterprise |
| FDE-Q173–Q184 | 调试、Incident Command | 12 | Debug / Production Round |
| FDE-Q185–Q196 | ROI、采用、变更管理 | 12 | Customer / Executive |
| FDE-Q197–Q204 | Field-to-Product | 8 | Product / Leadership |
| FDE-Q205–Q220 | 行为、领导力、冲突 | 16 | Behavioral / Final |
| FDE-Q221–Q230 | AI 工具、EP、薪酬、Offer | 10 | Process / Offer |

---

## 3. FDE-CORE：先过核心 60，再按 JD 加题

核心 60 不是“最常考猜题”，而是覆盖完整交付闭环的最低可用集合。每个编号都要留下一个可检查证据。

### 3.1 硬约束与定位（10）

`Q001 Q002 Q003 Q007 Q008 Q009 Q010 Q011 Q224 Q225`

产物：

- 60 秒和 90 秒两版定位；
- 当前岗位的三项直接证据、两个 gap；
- 地点、旅行、EP、固定薪酬的 recruiter 问题卡；
- 不把 bonus/equity 混入 fixed pay 的决策表。

### 3.2 已验证项目与判断（10）

`Q013–Q022`

产物：两个 30 分钟项目 deep dive packet，每个包含 workflow、架构、ownership、关键决策、被拒方案、指标分母、失败与复盘。

### 3.3 Discovery 与生产式构建（15）

`Q025 Q026 Q027 Q028 Q029 Q030 Q031 Q032 Q033 Q034 Q041 Q042 Q043 Q048 Q060`

产物：

- 一页 current-state workflow；
- baseline / success / owner / time window；
- vertical slice 与 not-doing list；
- 90 分钟 API/job/stream 纵向切片，含 tests、幂等、取消、错误分类。

### 3.4 企业 AI 主干（15）

`Q061 Q063 Q064 Q066 Q069 Q075 Q079 Q080 Q083 Q085 Q093 Q095 Q097 Q101 Q103`

产物：ACL-first RAG 图、tool registry、状态/checkpoint 设计、审批证据视图和一次错误工具选择的 failure tree。

### 3.5 Evaluation、治理与生产（10）

`Q111 Q112 Q113 Q114 Q127 Q130 Q145 Q148 Q163 Q174`

产物：20–50 条 task suite、trajectory/outcome grader、威胁模型、SLI/SLO、受限部署变体和一次事故分层诊断。

### 3.6 核心 60 通过标准

- 每题可在 90 秒内先给结论，再解释机制和取舍；
- 至少 30 题完成一次不看资料的追问；
- Coding、Discovery、System Design 各连续两次评分不低于 3/4；
- 所有项目数字能说明分母、时间窗、数据来源和个人 ownership；
- Agent 作品明确哪些是 synthetic/internal benchmark，哪些 real-world outcome 尚未验证；
- 延迟 7 天后，无提示迁移通过率达到 70% 以上，才进入公司专项扩展。

---

## 4. 关键 12：不通过就不能进入 Final

这 12 题专门检查高压沟通、采用、坏消息、产品判断和 Offer 决策：

`Q185 Q187 Q190 Q195 Q197 Q199 Q205 Q206 Q210 Q211 Q224 Q230`

通过标准：

- 回答里同时出现用户/业务结果、技术证据和人的 ownership；
- 能说出一个被拒方案和为什么；
- 不隐瞒不确定性，也不把风险推给“让用户注意”；
- 能在不满足 EP、固定薪酬、旅行或岗位实质时做明确 Hold/Reject 决策。

---

## 5. 按面试轮次激活题单

| 面试轮次 | 必选题 | 对应 Session | 结束时必须留下 |
|---|---|---|---|
| Recruiter | Q001–Q012、Q224–Q230 | FDE26-1、FDE26-9 | 定位、硬约束、五个岗位问题 |
| Hiring Manager | Q013–Q024、Q205–Q220 | AFD-0、FDE26-7 | 两个项目包、八个故事、两个 gap 回应 |
| Pair Build | Q041–Q060 | FDE26-2 | 可运行代码、tests、README、time-box 复盘 |
| Existing System / Debug | Q061–Q074、Q173–Q184 | AFD-3、FDE26-3、FDE26-6 | service map、hypothesis table、mitigation、postmortem |
| RAG / Agent | Q075–Q110 | FDE26-4、AFD-2 | ACL、tool、state、approval、checkpoint、fallback 图 |
| Evaluation / Safety | Q111–Q144 | AFD-4、FDE26-4/6 | task suite、grader、failure taxonomy、threat model |
| System Design | Q145–Q172 | AFD-5/6、FDE26-5 | 容量、身份、数据、故障、SLO、成本、rollout、rollback |
| Customer / Executive | Q025–Q040、Q185–Q204 | AFD-1、FDE26-7/8 | pilot brief、ROI/adoption、field-to-product memo |
| Final / Offer | Q205–Q230 | FDE26-9 | 行为故事、反向问题、EP/薪酬/level 决策表 |

---

## 6. FDE-72H：面试在 72 小时内

### T-72h：建立“岗位真相”，不要继续泛读

- 固定官方 JD 快照、地点、发布日期/状态、hybrid、travel、level；
- 每项要求标 `Strong / Adjacent / Gap`；
- EP 保持 `Unverified`，直到招聘方或官方材料确认；
- 选择三个最强直接证据和一个诚实 gap；
- 激活对应轮次题单，不超过 30 题。

输出：一页 company dossier 与一页 evidence map。

### T-48h：做一次真实时间限制的模拟

- Recruiter/HM：录制 30 分钟；
- Coding：完整 90 分钟，不暂停计时；
- Case/System Design：45 分钟设计 + 15 分钟追问；
- 评分只看 Correctness、Reasoning、Transfer、Communication、Independence。

输出：最大两个错误、一个修复动作、第二天复测题。

### T-24h：关闭资料，完成迁移

- 只复测错题、公司 why、项目数字和关键约束；
- 完成五个高信号 interviewer questions；
- 明确面试 AI 工具政策；未获允许就按禁用准备；
- 检查时间、地点、设备、网络、共享屏幕和备用方案；
- 停止新增主题，保留睡眠和表达状态。

### T-2h：最小检查

- 60 秒定位；
- 两个项目各一句 outcome、ownership、decision、failure；
- 一张 system design opening checklist；
- 一句 EP 说明和一句 fixed-pay 口径；
- 第一轮反问。

---

## 7. 六周执行矩阵：Learn + Ship + Close

| 周 | 学习主线 | 交互 Session | 对外可用 Ship | Exit Gate |
|---|---|---|---|---|
| 1 | 定位、项目、硬闸门 | FDE26-1、AFD-0 | CV opening、90 秒定位、10 家当前岗位表 | 不虚构 Agent 年限；只留通过硬闸门岗位 |
| 2 | Python/API/SQL、陌生系统 | FDE26-2、AFD-3 | 生产式纵向切片 + tests + README | 90 分钟可运行、可测、可解释 |
| 3 | 企业集成、ACL-first RAG | FDE26-3、FDE26-4 | 数据/身份图、retrieval eval、skill mapping | 权限贯穿 source→answer；引用可验证 |
| 4 | Agent/Harness、Eval、安全 | AFD-2/4、FDE26-6 | tool contracts、task suite、threat model | 多 trials、可 replay、有审批和 kill switch |
| 5 | Discovery、ROI、采用 | AFD-1、FDE26-7 | pilot brief、adoption funnel、exec update | 有 baseline、owner、go/no-go 和运营交接 |
| 6 | on-prem、系统设计、平台复用、Offer | FDE26-5/8/9、AFD-6 | 七图题、company dossier、EP/offer 卡 | 三轮 mock ≥3/4；硬约束有书面证据 |

每周只改变一个求职变量：岗位 lane、CV opening、证据顺序、outreach、coding 或 case。不要同时重写全部系统。

---

## 8. 按岗位原型加题

### 8.1 产品/模型公司 FDE

在核心 60 上增加：`Q035–Q040 Q104–Q110 Q114–Q126 Q197–Q204`。

重点：模型/产品反馈、可复用平台能力、eval-driven rollout、客户采用和高质量 field signal。

### 8.2 Technical Deployment Lead / 交付负责人

增加：`Q025–Q040 Q185–Q204 Q205–Q220`。

重点：多工作流计划、依赖、风险、champion、培训、ROI、exec update 和 operational handoff。不要把它准备成纯 system design。

### 8.3 Enterprise / Private Cloud FDE

增加：`Q061–Q074 Q127–Q172 Q173–Q184`。

重点：身份、权限、数据边界、供应链、受限网络、容量、升级/回滚、支持责任和事故证据。

### 8.4 FDSE / 数据平台型

增加：`Q041–Q074 Q145–Q162 Q173–Q184`。

重点：SQL、schema、CDC/event、异步任务、可靠性、可观测性和真实客户代码库。算法题按目标公司的明确流程另行激活。

### 8.5 Applied AI / CV 相邻岗位

增加：`Q013–Q024 Q075–Q126 Q145–Q162`，并从 CV、Edge、量化、parity、golden cases 和 release gate 提取直接证据。

重点是诚实迁移：你的生产可靠性与评估纪律是 Strong；多年企业 LLM/RAG ownership 仍是 Adjacent/Gap。

---

## 9. Visual Quality Incident Copilot：证据目录

这个作品不是为了证明“会调用模型”，而是把你已有的 CV/Edge/runtime/eval 证据迁移到企业 Agent 交付。

| 证据 | 对应题目 | 可检查标准 |
|---|---|---|
| Current workflow + pilot brief | Q025–Q040 | 用户、决策、baseline、owner、slice、not-doing、go/no-go |
| Architecture + ADR | Q093–Q110、Q145–Q162 | workflow-first、状态、失败域、成本与被拒方案 |
| Data/ACL/retention contract | Q061–Q092、Q127–Q144 | source ACL、version/delete、tenant isolation、日志边界 |
| Tool contracts | Q095–Q103 | schema、权限、timeout、错误、副作用、owner、version |
| Frozen eval suite | Q111–Q126 | task/trial/grader/trace/outcome，多次 trial 与失败分类 |
| Threat model + approvals | Q127–Q144 | injection、泄露、越权、副作用、egress、human approval |
| SLO/runbook/kill switch | Q145–Q184 | 观测、降级、回滚、事故角色、对账和防复发 |
| Demo + technical defense | Q013–Q024、Q205–Q220 | 5–8 分钟 demo，10 分钟追问，不夸大真实业务结果 |

作品状态只使用：`Planned → Runnable → Measured → Defended → Published`。没有冻结评测和失败证据，不得标记为 Measured。

---

## 10. 公司专项一页卡

```text
Company / role / official URL / captured date / current status
Location / hybrid / travel / customer-facing / on-call
EP: confirmed / unverified / not supported + exact evidence
Fixed pay: confirmed / estimated / unknown; bonus/equity separate
Role archetype: FDE / FDSE / TDL / Applied AI / Solutions

Top 5 requirements:
1. Requirement → Strong/Adjacent/Gap → direct evidence → interview action
...

Three strongest proofs:
- outcome + ownership + decision + metric source

Two objections:
- honest boundary + transferable mechanism + proof-building action

Activated questions: FDE-Q___ ...
Selected system case:
Why company in 90 seconds:
Five interviewer questions:
Next human-confirmed action / owner / date:
```

只有官方当前岗位页面、招聘方书面信息或合同可把 volatile 字段从 unknown/unverified 改为 confirmed。

---

## 11. 证据账本与复测

每次练习只记录最大的误差，不写流水账：

```text
Date / company / stage / FDE-Q ID
First answer confidence: __/100
Evidence produced: voice / code / diagram / decision / mock
Scores: correctness / reasoning / transfer / communication / independence
Largest error:
Smallest repair:
New constraint for retest:
Due: +1 / +3 / +7 / +14 / +30 days
Unaided transfer: pass / fail
```

题目“完成”不等于掌握。只有换问法、换约束、延迟并关闭资料后仍达到 rubric，才计入无辅助迁移。

---

## 12. 每周求职漏斗

只追踪能改变下一步的指标：

- Qualified roles added；
- Applications submitted；
- Relevant conversations started；
- Interview drills recorded；
- Follow-ups completed by due date；
- Recruiter / technical / final conversion；
- Rejection stage 与可行动信号；
- 下周只改变的一个变量。

状态流：`Discovered → Gated → Ready → Submitted → Conversation → Interview → Offer/Closed`。

`Gated` 前不定制；`Ready` 必须已有证据映射；外部投递、消息和承诺必须由你确认。

---

## 13. 下一次打开应用时做什么

1. 选择 `AI Agent / Forward Deployed`。
2. 没有临近面试：搜索 `FDE-CORE`，完成核心 60 的第一个未过关输出。
3. 面试在 72 小时内：搜索 `FDE-72H`，只激活对应轮次。
4. 想做可评分练习：搜索 `FDE26`，打开九个 Session 之一。
5. 想查单题：搜索完整编号，例如 `FDE-Q111`。
6. 想推进作品：搜索 `Visual Quality Incident Copilot`。
7. 想核验签证和 Offer：搜索 `Employment Pass`。
8. 收尾时导出本地学习状态，并给唯一 active role 写明下一动作和日期。

