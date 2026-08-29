# AI 面试第一性原理知识地图

这份地图不是第 25 套学习资料，而是整个知识库的底层坐标系。K1–K8 描述面试交付场景，书籍、仓库、论文和课程提供证据；P1–P8 描述跨领域始终存在的问题原语。任何新知识先还原到原语，再决定是否值得进入题库、练习节点或长期覆盖池。

## 0. 怎样使用这张地图

遇到陌生题时，不先搜索“标准答案”，而依次问：目标是什么，信息怎样表示，什么机制和不变量产生结果，状态如何随时间变化，接口和权限边界在哪里，怎样证伪，资源与风险是什么，最终由谁作出并解释决定。

桌面应用中的第一性原理筛选与 K1–K8 能力簇可以组合：选择一个 P 原语看跨领域迁移；再选择一个 K 能力簇看它在目标岗位中的具体形态。例如 `P5 契约与边界 × K8` 会汇集 Prompt Contract、工具权限、RAG 来源边界、分布式请求语义和全栈 API contract。

## 1. 知识的最小单位

知识库的最小单位不是链接、名词或题目，而是一张可以被证伪和迁移的知识卡：

```text
问题 / 决策：需要解释或选择什么？
目标 / 证据：怎样算成功，谁来判断？
表征 / 状态：输入、输出、shape、schema、坐标或状态是什么？
机制 / 不变量：为什么成立，哪些量必须保持？
边界 / 假设：在哪些条件、权限和故障模型下成立？
评估 / 反例：什么观测支持或推翻结论？
资源 / 风险：延迟、内存、成本、安全与降级是什么？
决定 / 表达：选择什么、放弃什么、残余风险由谁承担？
```

如果一个条目只有定义或答案，没有假设、反例、证据和迁移，它只是检索材料，不是可面试知识。

### P1 · 目标与证据（GOAL）

第一问永远是“需要作出什么判断，什么可观察结果算成功”。分类 accuracy、用户体验、系统 SLO、面试评分、项目影响和行为故事看似不同，本质都是目标函数与证据契约。

- **核心问题**：受众是谁；决策是什么；成功、失败和最低可接受门槛是什么；证据由谁验证。
- **常见错误**：先选模型/框架；把完成量当能力；把 proxy、benchmark 或一次 demo 当真实目标。
- **主要投影**：K1 项目叙事、K3 指标、K8 eval/Prompt、所有系统设计。
- **完成证据**：目标—指标—决策表，含至少一个指标被优化但真实目标变差的反例。

### P2 · 表征与信息（INFO）

计算只能作用于被表示的信息。数组布局、概率分布、图、图像坐标、token、embedding、日志、消息、数据库 schema 和 Prompt 上下文都是表征选择；它们决定什么信息可见、丢失或被混淆。

- **核心问题**：对象、shape、单位、坐标、schema、来源、精度和生命周期是什么。
- **常见错误**：省略 axis/layout；把 embedding 当事实；混淆事件与当前状态；让检索数据反向改写指令。
- **主要投影**：K2 数学、K5 CV、K6 tensor/runtime、K7 数据结构、K8 token/RAG/多模态，以及 Kimi K3 中“逐 token MLA KV”与“压缩历史的 KDA state”的信息差异。
- **完成证据**：一张输入—表示—变换—输出图，以及一次替换表征后的信息损失实验。

### P3 · 机制与不变量（MECH）

高质量解释不止复述步骤，而是指出因果机制、递推关系或必须保持的不变量。Softmax 的平移不变性、binary search 的区间不变量、优化器状态更新、卷积索引、体渲染透射率和复制状态机安全性都属于这一层。

- **核心问题**：状态怎样转移；公式/算法为什么得到结果；什么在每一步保持不变；复杂度来自哪里。
- **常见错误**：背名词和流程；用相关性替代机制；代码能跑但无法解释正确性。
- **主要投影**：K2、K4、K5、K7 以及 K8 的 Transformer/分布式机制；KDA recurrence、AttnRes 深度选择和 Quantile Balancing 是同一原语的新练习面。
- **完成证据**：推导或最小实现、一个循环/状态不变量、正常与反例测试。

### P4 · 状态、时间与协调（STATE）

只要问题跨一步、跨帧、跨请求或跨节点，就必须明确状态所有权、顺序和恢复。训练/推理模式、视频时序、队列背压、缓存与记忆、数据库事务、日志复制、Agent trace 都是同一个状态问题的不同投影。

- **核心问题**：哪些状态持久/临时；谁拥有；按什么顺序变化；并发、重复、延迟、崩溃后怎样恢复。
- **常见错误**：把 timeout 当失败；忽略 stale state；把单帧/单请求正确当长程正确；混淆消息到达与副作用提交。
- **主要投影**：K4 train/eval、K5 temporal、K6 queue、K7 LRU、K8 distributed/Agent/fullstack；KDA checkpoint、MLA KV、partial rollout 与 Agent sandbox 共同训练长程状态所有权。
- **完成证据**：事件历史或状态机，覆盖 duplicate、reorder、crash、resume 中至少三种故障。

### P5 · 契约与边界（BOUNDARY）

系统可靠性来自清晰边界，而不是组件数量。函数签名、tensor contract、API schema、数据 split、Prompt Contract、工具权限、事务边界和团队 ownership 都声明“什么由谁保证，失败怎样表示”。

- **核心问题**：输入/输出、前置条件、权限、错误语义、幂等、确认、兼容和升级边界是什么。
- **常见错误**：把模型输出当授权；用文档代替控制面；只写 happy path；把 exactly-once 当组件属性。
- **主要投影**：全部能力簇，尤其 K3 leakage、K6 parity、K8 RAG/Agent/Prompt/全栈/分布式；混合 cache 共用内存池但保留不同命中与生命周期语义，是“共享实现不等于共享契约”的反例。
- **完成证据**：可执行 contract、validator、失败返回和一个越界/不兼容测试。

### P6 · 不确定性与评估（EVAL）

模型、数据和人类判断都带不确定性。评估的任务不是产出一个漂亮总分，而是用代表性样本、slice、对照和 verifier 区分假设，并决定是否发布。

- **核心问题**：随机性来自哪里；样本如何代表目标分布；指标与错误成本怎样连接；什么实验能区分竞争解释。
- **常见错误**：泄漏；只看均值/最好值；相似度代替正确性；judge 未校准；无标签时把 proxy 当真值。
- **主要投影**：K2 泛化、K3 数据/指标、K4 调参、K5 hard cases、K8 eval/Prompt/Agent；前沿报告的效率/榜单还要审计模型版本、effort、采样、Harness、工具、日期与失败分母。
- **完成证据**：冻结 eval set、失败 taxonomy、置信/方差或人工分歧，以及预先定义的接受门槛。

### P7 · 资源与风险（RESOURCE）

工程选择总是在预算与失败成本下发生。计算量、内存、带宽、p95、能耗、金钱、隐私、安全和人类注意力都属于资源；降级、回滚和人工升级用于限制残余风险。

- **核心问题**：预算是什么；瓶颈在哪里；最坏失败有多贵；何时降级、拒绝、回滚或转人工。
- **常见错误**：只报平均延迟；质量与成本分开优化；无 failure budget；把模型能力当安全边界。
- **主要投影**：K4 精度/训练、K5 产品链路、K6 Edge、K8 serving/Agent/fullstack/distributed。
- **完成证据**：resource budget、风险矩阵、故障注入、SLO 和 rollback/degrade 条件。

### P8 · 所有权与表达（OWNER）

Senior 面试最终评估的是能否在不完整信息下拥有一个决定：界定问题、协调边界、比较取舍、形成证据、处理失败并让他人复核。表达不是包装，而是把推理和责任变成可观察信号。

- **核心问题**：你作了什么决定；替代方案是什么；如何获得证据；怎样处理异议、失败和残余风险。
- **常见错误**：只说团队做了什么；结果在最后；没有弃选；把术语密度当深度。
- **主要投影**：K1 全线、K7 编码沟通、K8 架构/发布/Agent ownership。
- **完成证据**：结论先行的 90 秒答案、决策记录、最不利追问和 D+7 零提示复述。

## 2. 通用答题内核

任何技术题先压缩成七步：

1. **Goal**：重述决策、受众和成功标准。
2. **Representation**：声明输入/输出、shape、状态、来源和关键假设。
3. **Invariant**：给出公式、状态不变量或必须保持的契约。
4. **Mechanism**：从不变量推导过程，不按名词堆组件。
5. **Constraints**：加入边界、时间、资源、权限和失败模型。
6. **Evidence**：给测试、指标、反例、对照或 trace。
7. **Decision**：明确选择、弃选、降级和残余风险。

它不是固定话术。简单定义题可以压缩到 60–90 秒；系统设计和项目深挖把每一步展开为白板与证据。

### 概念与公式题

`对象/随机变量 → 定义与假设 → 机制/推导 → 反例 → 可观测实验 → 工程含义`。如果公式无法连接到 shape、单位、估计误差或失败条件，就还没有形成可迁移理解。

### 编码与算法题

`输入契约 → baseline → 不变量 → 实现 → 复杂度 → 边界测试 → 约束变化`。AC 只覆盖某些输入，不证明不变量、并发、内存上限或接口行为正确。

### 系统设计题

`目标/SLO → 数据与状态 → 最小工作路径 → contract/ownership → failure model → eval/observability → capacity/risk → rollout/rollback`。先给能工作的 baseline，再按证据增加组件。

### 项目与行为题

`影响/结论 → 情境约束 → 个人决定 → 替代方案 → 证据 → 失败/冲突 → 复盘与迁移`。STAR 是时间顺序容器；第一性原理内核负责证明判断力。

## 3. 领域只是原语的投影

同一个原语在不同领域使用不同名词。学习目标不是记住更多名词，而是能在新领域识别相同结构。

### ML / DL 投影

- P1：业务目标与 loss/metric 的关系。
- P2：样本、特征、label、batch、dtype 和分布。
- P3：模型 forward、loss、gradient、optimizer update。
- P4：参数、optimizer state、running stats、checkpoint。
- P5：split/preprocessing、train/eval 和 serving contract。
- P6：泛化、方差、slice、校准、漂移与实验。
- P7：吞吐、显存、训练预算、发布风险。
- P8：实验决定、失败归因和生产 ownership。

### CV / Edge 投影

- P2：坐标、色彩、layout、时间和场景表示。
- P3：卷积、几何、渲染、量化与算子机制。
- P4：视频状态、buffer、设备生命周期。
- P5：tensor/export/runtime parity。
- P6：hard cases、主观质量、时序与设备 slice。
- P7：p95、内存、功耗、热与 degrade。

### LLM / Agent 投影

- P1：任务成功而非“回答看起来好”。
- P2：token、message、retrieved context、memory、tool result。
- P3：Transformer、retrieval、planning/action loop。
- P4：trajectory、cache、memory、retry 和 resume。
- P5：Prompt/tool/approval/authority contract。
- P6：component、trace、end-to-end、安全和人工校准 eval。
- P7：tokens、latency、cost、越权和 fallback。
- P8：自治边界、人工升级和发布责任。

### Forward Deployed Engineering 投影

- P1：从客户诉求还原工作流、baseline、成功与失败成本。
- P2：梳理客户数据、schema、真源、缺失与 provenance。
- P3：用最小纵向切片证明机制可运行，不从组件清单开始。
- P4：协调既有系统、owner、状态、顺序、恢复和 handoff。
- P5：明确 API、IAM、合规、范围、组织和错误语义边界。
- P6：用 pilot、slice、adoption 和业务影响决定继续、调整或停止。
- P7：约束时间、预算、安全、可靠性、成本、上线和回滚。
- P8：推动 stakeholder 决策，并把 field failure 沉淀为可复用产品反馈。

### 分布式 / Fullstack 投影

- P2：event、log、row、request、response 与 schema。
- P3：WAL、majority、replication、index 与 transaction mechanism。
- P4：ordering、concurrency、lease、retry、migration 和 recovery。
- P5：API、幂等、事务、兼容与服务 ownership。
- P6：history/invariant test、SLO、trace 和故障注入。
- P7：availability、consistency、容量、安全与回滚。

### DSA 投影

- P1：要回答的是可满足的正确性和复杂度目标。
- P2：数组、链表、树、图、heap、hash 是信息组织方式。
- P3：循环/递归不变量证明算法正确。
- P4：队列、LRU、并发和 streaming 引入状态与时间。
- P5：函数签名、边界输入和 mutation contract。
- P6：反例与 property tests 比样例记忆更可靠。

## 4. 依赖图：先建立什么，后组合什么

~~~mermaid
flowchart LR
    P1["P1 目标与证据"] --> P2["P2 表征与信息"]
    P2 --> P3["P3 机制与不变量"]
    P2 --> P4["P4 状态、时间与协调"]
    P3 --> P5["P5 契约与边界"]
    P4 --> P5
    P5 --> P6["P6 不确定性与评估"]
    P7["P7 资源与风险"] -. "约束每一层" .-> P2
    P7 -.-> P3
    P7 -.-> P4
    P7 -.-> P5
    P7 -.-> P6
    P1 --> P8["P8 所有权与表达"]
    P6 --> P8
    P8 --> M["限时面试与项目证据"]
~~~

这不是严格线性课程。P7 从一开始就是约束；P8 从第一次闭卷表达开始训练。升级规则是：没有 P2 的明确信息模型，不进入复杂机制；没有 P5 的边界，不讨论可靠性；没有 P6 的证据，不宣布方案更好。

## 5. P 原语与 K 能力簇交叉表

| 能力簇 | 主原语 | 必须连接的次原语 | 核心产物 |
| --- | --- | --- | --- |
| K1 项目与 Senior 证据 | P1、P8 | P6、P7 | 结论先行故事、决策记录、失败复盘 |
| K2 数学统计与泛化 | P2、P3 | P6 | 定义/推导、反例、估计与实验 |
| K3 数据与评估 | P1、P6 | P2、P5 | split 图、metric table、漂移/泄漏实验 |
| K4 训练与优化 | P3、P6 | P4、P7 | update 推导、故障树、可复现实验 |
| K5 CV 与计算摄影 | P2、P3 | P4、P6、P7 | 坐标/渲染链、hard-case taxonomy |
| K6 Edge/C++/Runtime | P5、P7 | P2、P4、P6 | tensor contract、parity、profile/rollback |
| K7 DSA 与软件编码 | P2、P3 | P4、P5、P8 | 不变量、实现、测试、沟通记录 |
| K8 系统/LLM/Agent | P4、P5、P6 | P1、P2、P3、P7、P8 | 状态机、contract、trace eval、release card |

交叉表用于发现迁移，而不是把一个任务限制在单一格子。桌面应用对练习节点使用人工维护的多标签映射；新增节点如果没有至少一个 P 原语，就不能进入核心任务集。

## 6. 资料、题目与练习的职责分离

- **P1–P8 原语**：稳定坐标，回答“这个知识为什么存在、依赖什么”。
- **K1–K8 能力簇**：面试交付视图，回答“在哪类题和岗位中表现出来”。
- **90 题主库**：问题覆盖池，回答“面试官可能怎样提问”。
- **61 个交互节点**：核心训练集，回答“今天产生什么可检查证据”；其中 7 个 AFD 节点把 Agent 技术证据连接到 FDE 交付闭环，3 个 Kimi K3 节点连接前沿模型架构、Agent 后训练与百万上下文 serving。
- **课程/仓库/论文/PDF**：来源与补充，回答“缺口需要用什么证据修复”。
- **个人项目与 trace**：最高优先级的迁移证据，回答“你是否真的做过决定并承担结果”。

因此新增链接不会自动新增任务；新增题也不会自动进入六周主干。只有它修复了一个明确 P 原语缺口、能产生新证据且不重复现有节点，才进入核心集。

## 7. 一次完整练习协议

1. 选定题目，先标一个主 P 原语和一个需要迁移的次原语。
2. 90 秒闭卷，用七步内核作答；不会的地方标 `unknown`。
3. 从最小来源补机制或证据，不顺序通读整份资料。
4. 交付代码、图、实验卡、状态机、contract、trace 或决策记录之一。
5. 改变领域或约束：ML 指标题迁移到 Agent eval，LRU 迁移到 context cache，重试迁移到工具副作用，Agent demo 迁移到有 owner、pilot gate 与 adoption 的 FDE 交付。
6. 用 Correctness、Reasoning、Transfer、Communication、Independence 评分。
7. D+1/D+3/D+7 做无辅助变式；只有延迟迁移才算稳定。

## 8. 缺口路由

| 失败表现 | 首先检查的 P 原语 | 最小修复 |
| --- | --- | --- |
| 答案堆名词，没有判断 | P1 | 写受众、决策、成功和失败门槛 |
| 公式会背，shape/单位混乱 | P2 | 画输入/表示/输出，标 axis、单位、来源 |
| 能复述步骤，不能解释为什么 | P3 | 写不变量、递推或最小反例 |
| 单次正确，长程/并发失败 | P4 | 画状态机与事件历史，注入重复/乱序/崩溃 |
| 组件很多，责任和错误语义模糊 | P5 | 写输入输出、owner、权限、失败和恢复 contract |
| 只报一个平均分或最好值 | P6 | 冻结 eval set，补 slice、方差、反例和接受门槛 |
| 方案好看但超预算或不可发布 | P7 | 写预算、p95、风险矩阵、降级和回滚 |
| 技术正确但没有 Senior 信号 | P8 | 结论先行，补个人决定、弃选、证据和残余风险 |

连续两次修复仍失败时，缩小对象并做最小实验，不继续收集新资料。

## 9. 完成定义

- 能闭卷解释 P1–P8，并为每个原语给出 ML/CV/Agent 或分布式中的两个不同例子。
- 随机抽一道未见题，3 分钟内标出目标、表征、不变量、状态、边界、评估、资源和 ownership。
- 至少完成三次跨域迁移：例如 binary-search invariant → distributed log index，data leakage → RAG eval contamination，transaction idempotency → Agent tool side effect。
- 每个核心节点都有主 P 标签、K 能力簇、前置依赖、产物、反例和延迟复测记录。
- 新增来源必须明确修复哪个 P 原语缺口；无法回答时留在候选池，不进入核心路线。
- 全真 mock 中不依赖模板名称，仍能从目标、机制、边界、证据和决定重新组织答案。
