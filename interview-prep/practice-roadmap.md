# AI 面试统一练习脉络

这是整个准备包的总入口。其他文件保存完整题库和资料细节；本文件决定当前练什么、先后依赖、何时升级，以及哪些内容只是缺口补充。

交互入口：[Interview Learning OS V3](learning-os.html)。当前证据契约：[Learning OS V3](learning-experience-v3.md)；历史依据：[V2 评审](learning-experience-v2.md)。六周表是 curriculum guardrail；每天的下一步由能力证据、到期风险、时间预算和目标岗位共同决定。

默认目标：Senior AI Engineer / Computer Vision / Edge ML / Multimodal & Agentic AI，六周、每周 8–10 小时。

## 一条主线，而不是十份资料

所有练习统一走五级阶梯：

1. **基线诊断**：闭卷回答或实现，记录具体缺口。
2. **原理解释**：说清定义、机制、公式/shape、假设和反例。
3. **手写实现**：用 Python/NumPy、C++ 或白板把原理变成代码。
4. **诊断与系统应用**：连接数据、训练、设备、指标、发布和失败模式。
5. **限时面试**：在无资料环境下完成，并用评分卡复盘。

阅读本身不推进级别；只有产生可检查的口述、代码、测试、图、实验卡或 mock 记录才算推进。

~~~mermaid
flowchart LR
    B["基线诊断"] --> F["数学、数据与 ML 原理"]
    B --> N["项目叙事与 Senior 证据"]
    B --> A["DSA 与编码协议"]
    F --> I["ML / DL 手写实现"]
    I --> C["CV 与训练诊断"]
    I --> G["Transformer / Multimodal"]
    C --> E["Edge、C++ 与运行时"]
    C --> S["ML 系统设计与评估"]
    G --> S
    A --> E
    A --> S
    N --> M["公司定向全真模拟"]
    E --> M
    S --> M
~~~

## 自适应交互回路

五级能力阶梯描述“学到哪里”；每次练习实际执行六步：

1. **Orient**：确认目标、时间、前置能力和本次产物。
2. **Retrieve**：闭卷预测/作答，先暴露真实状态。
3. **Construct**：口述、编码、画图、debug 或做取舍。
4. **Challenge**：改变数据、约束、设备、角色或错误成本，做迁移。
5. **Feedback**：按 rubric 反馈；只有卡住时逐级给提示。
6. **Consolidate**：关闭帮助做 exit ticket，记录证据、信心和下次复习。

推荐下一题使用透明启发式：35% 掌握缺口 + 25% JD 相关性 + 20% 遗忘风险 + 15% 前置解锁 + 5% 交互形式多样性。推荐必须说明理由，学习者可以改选；不要把规则分数伪装成精确的学习概率。

每个节点同时评估 Correctness、Reasoning、Transfer、Communication、Independence。Transfer 或 Independence 低于 3 时，即使平均分高，也不能晋级“可面试”。详细设计见 [Learning OS V2](learning-experience-v2.md)。

### AI 教练的边界

- 前 15–25 分钟不提供完整答案；先问预测、机制和最小反例。
- 提示按“检查维度 → 模式/不变量 → 部分 worked example”三级展开。
- 看过答案后必须完成新变式和无辅助 exit ticket。
- AI 负责提问、反馈和生成变式，不替代作答、决策或项目证据。
- 不输入雇主机密、客户数据、PII、密钥或未公开项目细节。

## 资料总表：每个来源只承担一个主职责

| 层级 | 主材料 | 在练习链中的职责 | 不做什么 |
| --- | --- | --- | --- |
| 核心问题 | [90 题主库](question-bank.md) | 定义面试官可能追问的原理、项目、系统和行为问题 | 不把短答案背成固定稿 |
| 算法覆盖池 | [AlgoNote 32](algo-note-plan.md) + [Blind 75 补充 12](blind-75-plan.md) | 提供 44 道去重后的 DSA 模式池 | 六周默认不要求刷完 44 道 |
| ML 实现 | [Deep-ML 14](deep-ml-plan.md) | 把公式、shape、数值稳定性变成可测试代码 | 不用 AC 代替生产理解 |
| 面试与盲区诊断 | [ML Interviews Book](ml-interviews-book-plan.md) | 在核心题失分时补数学、数据、workflow、CV 盲区 | 20 道补充题不是第二套必刷主库 |
| 经典概念追问 | [Reflection_Summary 路线](reflection-summary-plan.md) | 为偏差方差、MLE/MAP、数据、经典 ML、归一化和 attention 加深追问 | 不直接背个人总结答案 |
| 理论加深 | [钥匙书路线](key-book-plan.md) | 为 PAC、复杂度、泛化、稳定性和收敛补假设与边界 | 不用 worst-case bound 预测产品效果 |
| 训练实验 | [Tuning Playbook 路线](tuning-playbook-plan.md) | 把 M7/M8/M11/M12 变成 baseline、搜索、方差和故障诊断 | 不把经验建议当普适定律 |
| 前沿 CV 表征 | [Vincent Sitzmann 路线](vincent-sitzmann-cv-plan.md) | 把几何、神经场、可微渲染、新视角与世界模型接成可实验的 CV 深挖链 | 不把项目演示、作者预测或论文列表当掌握 |
| LLM/VLM 后训练 | [Smol Course 路线](smol-course-plan.md) | 把 template、SFT/LoRA、评测、DPO 和 VLM 接成版本化实验闭环 | 不把 notebook、train loss 或 leaderboard 当掌握 |
| 统一多模态架构 | [SenseNova-U1 路线](sensenova-u1-plan.md) | 用 NEO-unify/MoT 案例连接视觉接口、联合目标、评测与推理系统 | 不把“无 VE/VAE、统一、8B、低显存”宣传词当精确定义 |
| 面试执行 | [Tech Interview Handbook 路线](tech-interview-handbook-plan.md) | 统一编码、行为、自我介绍和 mock 的操作协议 | 不另开一套算法题单 |
| 视觉辅助 | [Transformer Visual Guide](https://www.hendrik-erz.de/post/the-transformer-architecture-a-visual-guide-pdf-download) | 建立原始 encoder–decoder Transformer 的空间图景 | 不代替 decoder-only、KV cache、GQA、RoPE |
| 白板与模拟 | [Codemia](https://codemia.io/) | 承载系统设计、Agentic AI 与 mock 练习 | 平台反馈不能代替 ML 数据/评估/发布检查表 |
| Agent 工程主线 | [《深入理解 AI Agent》路线](ai-agents-in-depth-plan.md) | 用 Harness、上下文、工具、Coding Agent、评估和多 Agent 建立原理到系统的证据链 | 不顺序通读 307 页；后训练/多模态按 JD 选修 |
| Agent 实现实验 | [Hello-Agents 路线](hello-agents-plan.md) | 用三范式对照、最小 runtime、故障注入、分层评测和 capstone 把原理变成代码/trace | 不顺序做完 16 章；框架 API、社区答案和 demo 不能替代版本锁与任务证据 |
| Agent 仓库工程 | [Harness Engineering 路线](harness-engineering-plan.md) | 把仓库变成 Agent 可导航、可执行、可验证、可持续清理的环境 | 案例结论不直接泛化；仅 Agent/Coding/DevProd 岗默认激活 |
| Agent Harness 听辨 | [播客实践路线](agent-harness-podcast-plan.md) | 用会跑、跑久、跑稳形成三层总图，并训练观点校验 | 不把嘉宾观点、泄露解读或未来预测当官方事实 |
| 全栈产品交付 | [Topcoder Fullstack 路线](topcoder-fullstack-roadmap-plan.md) | 把浏览器、API、事务、React 和发布接成一个可重放纵向切片 | 不学完 40+ demo；3D/Wasm/实时按 JD 选修 |
| 分布式系统模式 | [Martin Fowler 模式路线](distributed-systems-patterns-plan.md) | 用日志、复制、时钟、分区、幂等和 2PC 建立故障推理链 | 不背 30 个名词；目录摘要不能替代论文、实现与故障实验 |
| Prompt 工程 | [高质量 Prompt 路线](prompt-engineering-method-plan.md) | 把模糊需求写成可验证任务契约，并用冻结评测、版本和发布门槛迭代 | 不背角色模板、隐藏思维链要求或跨模型参数配方 |

仓库型题库只负责“发现问题”；答案仍要回到一手资料、自己的实验/trace/profiler 和项目证据验证。

## 八个能力簇

### K1. 项目叙事与 Senior 证据

- **核心题**：R1–R10、B1–B8。
- **支持材料**：ML Interviews 的 Senior signals；Handbook 的自我介绍、行为故事与 JD 映射。
- **练习链**：30 秒定位 → 2 分钟项目故事 → 技术三层追问 → 冲突/失败追问 → hiring-manager mock。
- **产物**：两版自我介绍、六个母故事、三个项目架构图、每个故事的证据与最不利解读。
- **过关**：先说影响和个人决策；至少承受三轮 why/why not/what failed，不泄露机密。

### K2. 数学、统计与泛化

- **核心题**：M1、M3、M9；ML Interviews 补充 1–8；钥匙书 12 道理论题中的 PAC/复杂度/稳定性部分。
- **实现锚点**：Deep-ML 10 Covariance、19 PCA、23 Softmax。
- **支持材料**：Reflection 追问链 1–3、5；钥匙书只在假设或界限不清时展开。
- **练习链**：直觉 → 公式与随机对象 → shape/数值实现 → 反例 → 泛化或产品解释。
- **产物**：一页公式/shape 卡和三段“理论结论不能说明什么”的反例。
- **过关**：公式、假设和工程直觉一致；不会把相关性、上界或训练收敛说成因果/真实风险保证。

### K3. 数据、经典 ML 与评估

- **核心题**：M2、M4–M6、M10–M12、S4、S5、S7。
- **实现锚点**：Deep-ML 15 Linear Regression GD、17 K-Means、18 K-Fold、73 Dice。
- **支持材料**：ML Interviews 9–14；Reflection 4–6；钥匙书的稳定性；Tuning Playbook 的 variance。
- **练习链**：数据生成过程 → split/leakage → baseline → metric/error cost → failure taxonomy → online feedback loop。
- **产物**：一张数据切分图、一张 metric decision table、一个“离线好线上差”的证伪树。
- **过关**：能为用户/设备/时间数据选择 split；指标与错误成本相连；每个诊断都有最小实验。

### K4. 深度学习训练、优化与数值

- **核心题**：M7、M8、M11、M12。
- **实现锚点**：Deep-ML 49 Adam、115 BatchNorm、160 Mixed Precision。
- **支持材料**：Tuning Playbook 全线；Reflection 7；ML Interviews 的训练与数值题。
- **练习链**：可靠 baseline → scientific/nuisance/fixed 参数 → 搜索空间 → 曲线/方差诊断 → checkpoint/复跑 → 采纳门槛。
- **产物**：实验设计卡、搜索空间审计、训练故障决策树、一次真实项目复盘。
- **过关**：不凭单次最好值下结论；能区分代码/数据问题、优化不稳定、trial variance 和 study variance。

### K5. Computer Vision 与计算摄影

- **核心题**：V1–V14，优先 V1–V11。
- **实现锚点**：C1–C4；Deep-ML 41 Conv2D、73 Dice、115 BatchNorm；VSCV-4 坐标网络对照。
- **支持材料**：ML Interviews 15–20；[Vincent Sitzmann 路线](vincent-sitzmann-cv-plan.md)的 VSCV-0–5；自己的相机、视频与 hard-case 记录。
- **练习链**：算子/shape → loss/metric → 单帧模型 → 相机/多视图 → neural field/renderer → 视频时序 → 产品链路 → hard cases 与发布门槛。
- **产物**：segmentation/matting、depth、flow/tracking、bokeh 四条图；坐标网络对照；新视角系统图；hard-case taxonomy；CV depth mock。
- **过关**：所有答案回到坐标、色彩、边界、时序、表示、渲染、设备和主观质量；能区分论文结果与自己的实验，不只报 benchmark。

### K6. Edge、C++ 与运行时

- **核心题**：E1–E12，优先 E1–E9；C6、C8–C10。
- **实现锚点**：Deep-ML 160；C++ 重写 Conv2D、K-Means；算法簇中的 matrix、bit、queue、LRU、sort。
- **支持材料**：目标 runtime 的官方文档、真实转换日志、device trace/profiler。
- **练习链**：tensor contract → 导出/转换 → 三层 parity → profiling → 并发/ownership → canary/rollback/degrade。
- **产物**：parity checklist、latency budget、profiling 决策树、量化或设备故障故事。
- **过关**：用 p95/trace/内存和持续性能证明判断；能明确同步、拷贝、layout、生命周期与降级路径。

### K7. DSA 与软件编码

- **覆盖池**：AlgoNote 32 + Blind 75 新增 12，共 44 道去重题。
- **执行协议**：Handbook 的澄清 → baseline/优化 → 边写边解释 → 测试/复盘。
- **全栈补充**：仅在 Fullstack/AI Product JD 或项目交付证据薄弱时，使用 [Topcoder Fullstack 路线](topcoder-fullstack-roadmap-plan.md)的 FS-1/2/3/4/5；沿 Browser → API → Service → DB → Response 写一个 strict TypeScript 纵向切片，不新增算法题量。
- **六周主干**：只激活下方 15 道；其余是公司定向、随机 mock 或六周后的覆盖池。
- **练习链**：识别模式 → 写不变量 → 正确 baseline → 复杂度 → 边界测试 → Python/C++ 迁移。
- **过关**：独立实现、四维评分均至少 3/4；看过题解后必须从空文件重写。

### K8. ML 系统、LLM、Multimodal 与 Agent

- **核心题**：S1–S10、G1–G14。
- **实现锚点**：Deep-ML 53 Self-Attention、107 Masked Attention、109 LayerNorm。
- **支持材料**：Transformer visual guide、[Smol Course 路线](smol-course-plan.md)、[SenseNova-U1 路线](sensenova-u1-plan.md)、[《深入理解 AI Agent》路线](ai-agents-in-depth-plan.md)、[Hello-Agents 实践路线](hello-agents-plan.md)、[Harness 播客听辨路线](agent-harness-podcast-plan.md)、[Harness Engineering 路线](harness-engineering-plan.md)、[Topcoder Fullstack 路线](topcoder-fullstack-roadmap-plan.md)、[分布式系统模式路线](distributed-systems-patterns-plan.md)、[Prompt 工程路线](prompt-engineering-method-plan.md)、Codemia 和自己的 traces/evals。
- **练习链**：WAL/recovery → majority/replicated log → membership/lease → clock/version → partition/read semantics → retry/idempotency → 2PC boundary → Transformer shape → chat/data/eval contract → Prompt Contract/frozen eval → SFT/LoRA → DPO/VLM → 原生统一理解—生成 → RAG/tool contract → Agent Harness/eval → Browser/API/DB 纵向切片 → safety/release。
- **产物**：复制日志 trace、幂等请求状态机、分布式故障矩阵、Transformer inference 卡、Prompt Contract/eval set、template parity test、SFT eval matrix、NEO-unify 架构/runtime card、Agent loop/Harness 图、context budget、工具 contract、分层 eval、仓库地图、全栈 release pack 和系统设计。
- **过关**：先给简单 baseline；设计包含数据、离线/在线指标、故障、安全、成本、发布和回滚。

## 六周唯一激活路径

完整题库是覆盖池。默认六周只按本表激活任务；各资料文件中的更多题目只有在失分、JD 命中或提前完成时才进入队列。周表决定主题边界，不强制日顺序；同一周内优先做 Learning OS 推荐的到期、高相关、能解锁下游节点的任务。

| 周 | 概念/项目锚点 | ML 实现 | DSA 主干 | 周末验证 |
| --- | --- | --- | --- | --- |
| 0 | 60 分钟基线；给缺口打知识/证据/结构/表达标签 | 不补题 | 不热身 | 建立评分和复习日期 |
| 1 基础与叙事 | R/B 母故事；M1、M2、M4、M7 | DML 10、23 | LC 1 Two Sum、LC 704 Binary Search、LC 206 Reverse List | 60 分钟 breadth + story mock |
| 2 CV | V1、V2、V3、V10、V14；VSCV-4/5 替换同等时长泛读；hard-case taxonomy | DML 41、73、115 | LC 48 Rotate Image、LC 54 Spiral Matrix、LC 239 Sliding Window Max | 30 分钟 CV depth + 30 分钟神经场/代码复盘 |
| 3 Training + Edge | M8；E2、E4、E5、E8；parity/latency 图 | DML 15、17、49、160 | LC 215 Kth Largest、LC 146 LRU、LC 912 Sort Array；至少一题 C++ | 45 分钟 coding + Edge follow-up |
| 4 Data + System | M5、M6、M10、M12；S4、S6；两套系统设计 | DML 18、19 | LC 200 Number of Islands、LC 210 Course Schedule II、LC 322 Coin Change | 45 分钟 ML system design mock |
| 5 LLM + Agent | G1、G7、G11、G12；PE-0/1/3/4、SC-1/2/4、AID-1/2/4/6 按岗位替换重复阅读；SNU1 两节点仅多模态生成/infra JD 激活 | DML 53、107、109 | LC 238 Product Except Self、LC 133 Clone Graph、LC 208 Trie | 45 分钟 Prompt、后训练、统一多模态或 RAG/Agent mock 四选一 |
| 6 公司定向 | JD → 证据 → 题号 → 当前评分 → 缺口动作 | 从 14 道中随机 1 道离线实现 | 从 44 道覆盖池随机 1–2 道 | 行为、技术、系统、编码各 1 场全真 mock |

这 15 道 DSA 是六周平衡主干，不代表其余 29 道无价值。若目标公司明显 coding-heavy，每周从 Blind 75 缺口或 hard 校准池追加 1–2 道；新增时等量减少阅读，不突破总时长。

若 JD 命中 Fullstack、Frontend、Backend 或 AI Product Engineer，第 6 周用 Topcoder FS-5/6/7 和两个交互节点替换一场泛化系统设计与多个随机 demo；其他岗位不默认激活。

若 JD 命中 Backend、Platform、Infra、Data、ML Platform 或 Agent Infra，第 4 周用分布式模式 PDS-0/1/2/6 和两个交互节点替换两场泛化白板；Paxos 证明、完整 Raft、CRDT 与拜占庭容错留在长期池。

若 JD 命中 LLM、Agent、AI Product、Applied AI 或 Prompt/Eval，第 5 周用 PE-0/1/3/4 和两个 Prompt 交互节点替换重复框架阅读；RAG/Agent 追加 PE-2，生产/平台岗位追加 PE-5，但都必须等量删减其他选修。

## 每周 8–10 小时预算

| 训练类型 | 默认数量 | 时间 |
| --- | --- | --- |
| 概念/项目答案卡 | 4 个主锚点，其他作为追问 | 100–120 分钟 |
| DSA | 3 道 | 135–180 分钟 |
| Deep-ML | 2–4 道，按周表 | 90–180 分钟 |
| 项目图、实验卡或系统设计 | 1 个主要产物 | 60–90 分钟 |
| 周末 mock + 复盘 | 1 场 | 75–90 分钟 |
| 到期复习 | 分散执行 | 45–60 分钟 |

超预算时的删除顺序：新增资料 → P1/证明细节 → 覆盖池扩展题 → 重复阅读。不能删除闭卷输出、边界测试、项目证据或 mock 复盘。

## 单一练习单元

每次训练只建立一条记录，避免在多个文件重复打卡：

    日期 / 能力簇：
    主锚点（题号或产物）：
    当前级别：0 未见 / 1 学习 / 2 可独立 / 3 可面试 / 4 稳定
    首次闭卷结果：
    具体缺口：知识 / 证据 / 结构 / 表达 / 实现 / 测试
    本次最小补充来源：
    输出证据：答案卡 / 代码 / 测试 / 图 / trace / mock
    D+1 / D+3 / D+7 / D+14：
    五维评分：Correctness / Reasoning / Transfer / Communication / Independence
    作答前信心（0–100）/ 校准误差：
    使用提示层级：0 / L1 / L2 / L3
    下一步：

### 晋级规则

- **概念题**：闭卷 90 秒回答达到 3/4，D+7 换问法仍达到 3，且 Transfer/Independence 均达到 3，才进入“可面试”。
- **编码题**：不看答案独立完成，主动测试，复杂度正确；48 小时后用新输入/约束重写核心，才进入“可面试”。
- **系统设计**：35–45 分钟内覆盖目标/SLO、数据、指标、架构、故障、成本、发布/回滚，才进入“可面试”。
- **行为故事**：结论和影响在前，个人决策清楚，并通过三层反向追问，才进入“可面试”。
- **稳定**：随机 mock 中再次达到 3，而不是因为刚复习过。

## 缺口路由：什么时候打开哪份资料

| 失败表现 | 只打开这个补充源 | 修复动作 |
| --- | --- | --- |
| 定义会说但数学/shape 模糊 | ML Interviews 或 Reflection 对应链 | 补一页推导 + 一个反例，不重读整章 |
| 泛化、稳定性或收敛条件说不清 | 钥匙书对应章节 | 写出随机对象、全部假设、结论类型和不能推出什么 |
| 优化/训练回答像经验列表 | Tuning Playbook | 填一张实验卡，设计最小诊断实验 |
| 公式会说但写不成代码 | Deep-ML 对应 ID | 闭卷实现 + 三个对抗测试 + production extension |
| 代码能 AC 但沟通/测试弱 | Handbook 协议与四维评分卡 | 录一场 45 分钟 mock，不继续刷相似题 |
| 系统设计框很多但没有 ML 闭环 | 90 题 S 模块 + Codemia | 强制补数据、指标、反馈、发布和回滚 |
| Transformer 结构没有空间图景 | Visual Guide | 沿图口述一次，再回到 G1/G2 与 DML 53/107 |
| SFT loss 下降但任务收益说不清 | Smol Course SC-0/1/2/4 | 冻结 baseline/eval，检查 template、token、mask 和 split；比较 prompt/RAG baseline |
| DPO/VLM 只会复述 notebook | Smol Course SC-5/6 | 审计 preference pair/reference/β；做 image shuffle、occlusion 与 text-only 反事实 |
| “统一多模态”只会复述宣传词 | SenseNova-U1 SNU1-0/1/2/3 | 画接口、token mask、共享/解耦边界和 CE/flow 双目标；为每条主张设计反例 |
| 多模态榜单高但无法发布 | SenseNova-U1 SNU1-7/8/9/10 | 拆理解/生成/编辑/交错评测，审计 judge/cache/failure，并按 SLO 选择 separate/colocate |
| Agent 回答停留在框架名或 demo | 《深入理解 AI Agent》AID-1/2/4/6 | 补 Harness 边界、context budget、工具 contract 和可行动 eval；不通读全书 |
| Agent 原理会讲但不会实现/比较 | Hello-Agents HA-1/2 | 用 fake model/tool 实现三范式和最小 runtime；注入循环、格式、超时与停止故障，并与固定 workflow 公平比较 |
| Agent 项目只有截图和主观“效果好” | Hello-Agents HA-6/7 | 建 30 条小集和 component/trace/E2E 矩阵；补 baseline、消融、高风险 slice、成本、发布门槛和回滚 |
| Coding Agent 只会“搜索、改代码、跑测试” | Harness Engineering HE-1/3 | 补仓库地图、唯一真源和 Guides × Sensors；实现 2 个带修复指令的机械检查 |
| 测试全绿但用户意图仍可能错 | Harness Engineering HE-2/6 | 写行为契约与关键旅程，加入对抗样本、人工校准和错误完成阻断 |
| 全栈回答只会列框架或展示多个 demo | Topcoder FS-1/3/4/5 | 沿 Browser → API → Service → DB 交付一个 strict TypeScript 纵向切片，测试重复提交与慢网 |
| 项目能跑但不能安全发布 | Topcoder FS-6/7 | 补 test matrix、threat model、SLO/trace、CI、migration、canary、runbook 与 rollback |
| 分布式系统回答只会列 CAP、Paxos、Kafka 等名词 | Distributed PDS-0/1/2 | 写 safety/liveness、故障模型和作用域；用 WAL/majority/commit/applied trace 注入 partition 与 stale leader |
| 把 timeout 当失败或承诺笼统 exactly-once | Distributed PDS-6/7 | 实现 dedupe 状态机与 crash 测试；区分 delivery、业务幂等、atomic commit、consensus 与补偿 |
| Prompt 只会套角色/五段式或凭单次结果调词 | Prompt PE-0/1/3/4 | 写六字段任务契约，冻结模型与 20–30 条 eval set；每版只修一个已观测失败并同集回归 |
| Prompt demo 很好但线上不稳或不可信 | Prompt PE-2/4/5 | 加来源层级、注入/无答案/本地化 slice、validator、trace、canary、人工升级和回滚 |
| multi-agent 只会列角色 | 《深入理解 AI Agent》AID-7 | 先做单 Agent baseline，再证明隔离/并行/专业化收益与独立验证 |
| 项目答案没有 Senior 信号 | R/B 模块 + Handbook 故事库 | 补个人决策、弃选、影响、失败和复盘 |

同一缺口最多增加 1–2 个来源。连续两次仍失败，缩小问题或做最小实验；不要继续收藏链接。

## 第一个七天：直接照此开始

1. **Day 0**：做 60 分钟基线，只评分，不读答案。
2. **Day 1**：完成 30 秒/2 分钟自我介绍和一个母故事；练 R1、B1。
3. **Day 2**：闭卷回答 M1；完成 Deep-ML 10；写协方差 orientation 与分母反例。
4. **Day 3**：完成 Two Sum；按四维评分卡复盘，不因题简单跳过沟通和测试。
5. **Day 4**：闭卷回答 M2、M4；完成 Deep-ML 23，并测试大 logits。
6. **Day 5**：完成 Binary Search；固定一种区间不变量并做空数组/单元素测试。
7. **Day 6**：完成 Reverse Linked List；随后做 60 分钟 breadth + story mock，生成下一周唯一缺口清单。

Day 7 只做 D+1/D+3 到期复习和整理，不新增资料。之后进入第 2 周 CV 簇。

## 完成定义

六周结束不是“看完资料”，而是：

- 15 道 DSA 主干完成并通过随机 mock；完整 44 道仍作为公司定向覆盖池。
- Deep-ML 14 道 P0 完成，每题有自建边界测试和生产化追问。
- 每周概念锚点形成可复用答案卡；支持资料只修复实际失分。
- 至少六个项目/行为母故事、三个系统设计、两张工程决策图可直接用于面试。
- 完成第 1–5 周各 1 场主题 mock，以及第 6 周行为、技术、系统、编码四类全真 mock；所有结果都有评分与下一步。
- 能沿“原理 → 实现 → 诊断 → 系统 → 项目证据”回答同一主题，而不是按资料来源回忆答案。
- 随机延迟、换问法且无 AI/资料帮助时仍能通过；完成量不能替代 unaided transfer。
