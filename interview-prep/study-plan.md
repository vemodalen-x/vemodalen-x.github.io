# 6 周 AI 工程师面试备考方案

默认投入：每周 8–10 小时。若面试少于 3 周，按文末压缩方案执行；单日可在 Learning OS 中选择 30/45/60/90 分钟预算。

本文件的周主题由[统一练习脉络](practice-roadmap.md)统筹。完整题库是覆盖池；默认六周只激活脉络中的 15 道 DSA 主干、Deep-ML 14 题和每周概念/项目锚点，避免把所有补充资料误算为并行必做任务。

## 核心原则

1. **先闭卷输出，再补知识。** 阅读产生熟悉感，面试考的是提取和组织。
2. **项目证据优先于百科全书。** Senior 候选人需要展示决策、指标、失败和交付。
3. **答案分三层。** 30 秒结论、3 分钟标准答案、15–45 分钟深挖。
4. **题库不是课程目录。** 只补答题暴露出的缺口，不从头重读整本书或整门课。
5. **用间隔复习，但区分即时与延迟证据。** D+1、D+3、D+7、D+14 是初始基线；系统根据评分、提示和延迟复测结果调整下一次日期。只有到期后的零提示变式复测才计入北极星。
6. **按面试官能观察的信号训练。** 编码题不只记录是否 AC，还要分别评估沟通、问题求解、技术实现和测试。

## 评分量表

- **0**：不知道或明显错误。
- **1**：会给定义，但不能解释机制。
- **2**：机制基本正确，有简单例子。
- **3**：能比较方案、讲失败模式，并连接真实项目。
- **4**：Senior bar；先澄清目标，给指标/约束，做明确决策，说明弃选方案、上线与复盘。

过关标准：P0 题至少 80% 达到 3 分，且没有连续三个同模块 P0 低于 3 分。

## 每日证据回路

以下是 90 分钟完整模板；30/45/60 分钟时由 [Learning OS V3](learning-os.html)组合更小任务包，不把超出预算的节点算作今日任务。

- 10 分钟：到期节点先做延迟闭卷检索 + 作答前信心预测，不看历史答案；新节点做首次基线。
- 5 分钟：从 [Learning OS](learning-os.html) 查看推荐理由；可以人工改选，但记录原因。
- 25 分钟：productive struggle，完成口述、代码、图、debug 或决策；不索取完整答案。
- 15 分钟：按 rubric 接收反馈；卡住时只使用 L1/L2/L3 分级提示。
- 25 分钟：换约束做迁移题，然后关闭帮助完成无辅助 exit ticket。
- 10 分钟：用非默认的锚定量表保存五维评分、提示依赖、信心校准、证据和动态复习日期。

AI 教练必须遵守 [Learning OS V3 的证据契约](learning-experience-v3.md)：先问后答、一次处理一个最大误差、区分事实与推断，并要求最终无辅助作答；同一 Session 内的即时正确不能包装成延迟掌握。

周末安排一次 60–90 分钟模拟面试，并留下录音、白板或代码记录。

算法训练采用 [AlgoNote 32 题路线](algo-note-plan.md)：每周 3 次、每次 45–60 分钟。它替代泛刷题，不替代 C1–C6 的 ML/CV coding 专项。

每道算法题执行 [Tech Interview Handbook 定向路线](tech-interview-handbook-plan.md)中的固定协议：澄清与例子 → baseline/优化与复杂度 → 边写边解释 → 边界测试与复盘。

[Blind 75 补充路线](blind-75-plan.md)提供 12 道缺口题，默认六周只激活统一脉络指定的 238、133、208；其余进入公司定向或随机 mock 覆盖池。总量仍受每周三次算法训练上限约束。

[Deep-ML 实现路线](deep-ml-plan.md)使用原有 ML/CV coding 时段，不另加刷题时长。与 C1、C3、C5、M7、M8、G1 重合的 Deep-ML 题直接计入对应交付；平台 AC 后仍须补自建边界测试、复杂度、数值稳定性和生产化追问。

## 第 0 天：建立基线

完成题库末尾的 60 分钟基线抽题。把问题分成四类：

- **知识缺口**：概念/机制不知道。
- **证据缺口**：知道理论，但没有项目例子或数字。
- **结构缺口**：内容很多，但答案没有先后顺序。
- **表达缺口**：过长、术语堆积、结论不清或英文表达不稳。

不要根据“看过没有”判断掌握度，只记录闭卷评分。

## 第 1 周：个人叙事 + ML 基础

覆盖池：R1–R10、M1–M12、B1–B8。本周主动锚点只做 R1、B1、M1、M2、M4、M7；其他题仅作为追问或在 Learning OS 判定缺口时进入队列。

Chip Huyen 配套：完成 [ML Interviews Book 定向路线](ml-interviews-book-plan.md)的“面试流程与 Senior 信号”，并开始数学/概率补充题 1–8。

通用面试配套：完成 [Tech Interview Handbook 定向路线](tech-interview-handbook-plan.md)的自我介绍和 Senior 故事库部分。

经典基础深挖：完成 [Reflection_Summary 定向路线](reflection-summary-plan.md)的追问链 1、2、5。仓库只提供追问角度，答案必须经推导、反例和一手资料验证。

训练实验配套：学习 [Deep Learning Tuning Playbook 定向路线](tuning-playbook-plan.md)的核心闭环和 scientific/nuisance/fixed hyperparameters，用 M7、M11、M12 做一次 3 分钟口述。

理论基础配套：完成 [Datawhale《钥匙书》定向路线](key-book-plan.md)的第一次和第二次学习，掌握集中链、PAC、VC/Rademacher 与经验/泛化风险；不追逐完整证明。

本周交付：

- 一版 30 秒和 2 分钟英文/中文自我介绍。
- 一个最强项目架构图；另外两个项目只写一句定位和证据索引，后续按岗位再展开。
- M1、M2、M4、M7 的 90 秒答案卡；M3/M5/M6/M8 留作变式追问。
- 一个“离线好、设备失败”的完整复盘故事。
- 两个 Senior 母故事骨架；其中一个练到可承受三层追问。其余故事由后续 mock 暴露的证据缺口驱动。
- 完成 Deep-ML 10 Covariance Matrix、23 Softmax；分别检查输入方向、样本分母、max subtraction 和 softmax axis。
- 算法主干：LC 1 Two Sum、LC 704 Binary Search、LC 206 Reverse Linked List。

重点不是重学所有 ML，而是恢复定义、机制、诊断顺序和指标选择。

## 第 2 周：CV + 计算摄影深挖

覆盖池：V1–V14、R2、R5、R7。本周主动锚点为 V1、V2、V3、V10；V4–V9 作为 bokeh/CV mock 的追问，V14 在 3D、新视角或 computational photography 岗激活，V11–V13 按实际失分或 JD 激活。

Chip Huyen 配套：完成补充题 15–20，重点补齐 1×1/depthwise convolution、upsampling、输入分辨率迁移和训练诊断。

Reflection_Summary 配套：完成追问链 3、7，把线性代数、归一化和残差结构连接到 CV 训练与数值稳定；不展开推荐和经典 NLP 目录。

Tuning Playbook 配套：选择一个真实 CV 项目填写实验设计卡，至少明确目标、三类 hyperparameter、搜索空间、trial 预算、曲线诊断、复跑和采纳门槛。

钥匙书配套：把假设空间复杂度、样本量和泛化的直觉连接到模型容量、augmentation、pretraining 和 CV hard cases；明确经典 worst-case bound 不能完整解释现代过参数化网络。

前沿 CV 配套：按 [Vincent Sitzmann 路线](vincent-sitzmann-cv-plan.md)先做 VSCV-0/1，再完成 VSCV-4 坐标网络对照与 VSCV-5 新视角系统设计。它们替换一次泛读和一次重复 CV coding，不叠加时长；Diffusion Forcing、world model 与“3D 会过时吗”留给第 5 周的目标岗位选修。

本周交付：

- 手算 5 组输出尺寸和 receptive field。
- 画出 segmentation/matting、depth、optical flow/tracking、bokeh 四条链路。
- 建立一张 hard-case taxonomy：现象、可能根因、检测方式、修复手段、发布门槛。
- 完成 ReLU、positional features、SIREN 三种坐标网络的公平对照，或先交付可运行伪代码、shape 与实验表。
- 画出 `camera → ray → field/Gaussian → renderer → image loss`，并给 held-out trajectory、pose noise 和动态主体测试。
- 做一次 30 分钟 CV depth mock。
- 算法主干：LC 48 Rotate Image、LC 54 Spiral Matrix、LC 239 Sliding Window Maximum。
- 完成 Deep-ML 41 Conv2D、73 Dice、115 BatchNorm；分别计入 C1、C3 指标和 M8 的实现训练，不作为额外三题。

每道题都要回答“如果放进视频/相机产品，会新增什么问题”，避免只谈静态 benchmark。

## 第 3 周：Edge AI + C++/编码

覆盖池：E1–E12、C1–C10、R4、R6、R8。本周主动锚点为 M8、E2、E4、E5、E8、C1、C5，并从 C2/C3/C6 中选一个迁移实现。

Chip Huyen 配套：复习数值稳定性、浮点精度、模型内存与计算量估算，并把结论连接到量化和端侧 profiling。

Tuning Playbook 配套：复习 input pipeline、BatchNorm、多设备状态和训练不稳定；把训练复现与模型转换/设备 parity 分成两个验证关口。

钥匙书配套：只用收敛率和集中不等式帮助解释优化/统计误差，不用理论量级替代真实 profiler、学习曲线和设备实验。

本周交付：

- 一张模型转换与 parity test 清单。
- 一张端到端 latency budget 和 profiling 决策树。
- 完成 C1、C5，并从 C2、C3、C6 中选一道专项实现；每题包含测试和复杂度。
- 算法主干：LC 215 Kth Largest、LC 146 LRU、LC 912 Sort Array；至少一题用 C++，完整 17–24 组留在覆盖池。
- 完成 Deep-ML 15 Linear Regression GD、17 K-Means、49 Adam、160 Mixed Precision；15/17 共同计入 C5，49/160 连接 M7、Edge 精度与 Tuning Playbook。
- 一个量化精度下降或设备集成故障的 STAR/技术混合故事。

编码练习采用：5 分钟澄清与方案、20–30 分钟实现、5–10 分钟测试和优化。不要一开始追求最优解。

每周至少选择一场编码练习，使用 handbook 的四维评分卡复盘；仅代码正确但沟通或测试低于 3 分，仍视为未过关。

## 第 4 周：ML 系统设计 + 评估

覆盖池：S1–S10、M5、M6、M10、M12、B4–B6。本周主动锚点为 M5、M6、M10、M12、S4、S6；其余作为系统设计追问。

交互练习：[Codemia](https://codemia.io/) 的系统设计白板可用于限时演练。每做一道通用系统题，都额外补齐 ML 层：数据/标签、baseline、模型、offline/online metrics、漂移、实验、模型发布和回滚。

Chip Huyen 配套：从其开放式 ML system design exercises 中选择 2 题，用本题库的八步系统设计框架做 35–45 分钟模拟。

Reflection_Summary 配套：用追问链 4 检查数据缺失、异常、类别不平衡、切分泄漏和分布变化；仓库中的指标名称必须落到业务错误成本与验证实验。

Tuning Playbook 配套：把 trial variance、study variance、data sampling variance、最佳 checkpoint 和 experiment tracking 纳入系统设计的实验平台部分。

钥匙书配套：完成泛化界与稳定性学习，把验证集复用、uniform convergence、algorithmic stability 与 Tuning Playbook 的 retrain variance 区分开。

本周交付：

- 2 套 35–45 分钟设计：移动端人像虚化，以及多模态评估平台或模型发布与监控二选一；其余进入覆盖池。
- 每套设计至少包含：目标/SLO、数据、离线/在线指标、架构、三项深挖、五个失败模式、发布/回滚。
- 至少做一次粗略容量或成本估算。
- 整理“决策记录”：选择、弃选方案、判断依据、残余风险。
- 算法主干：LC 200 Number of Islands、LC 210 Course Schedule II、LC 322 Coin Change。
- 完成 Deep-ML 18 K-Fold、19 PCA，并各补一个 leakage 或错误实验设计反例。

练习时先给简单可工作的 baseline，再逐步加组件。面试官更关心判断力，不是图中框的数量。

## 第 5 周：Multimodal / LLM / Agentic

覆盖池：G1–G14、R9、S3。本周主动锚点为 G1、G7、G11、G12；G2、G14 作为强制追问，其余由目标 JD 和 mock 激活。

视觉预习：[The Transformer Architecture: A Visual Guide](https://www.hendrik-erz.de/post/the-transformer-architecture-a-visual-guide-pdf-download)（[单页 PDF](https://www.hendrik-erz.de/storage/app/media/pdf/Transformers_v1.1.pdf)）。先沿图口述原始 encoder–decoder 数据流；随后明确它与现代 decoder-only LLM 的差异，不要把这张图当成 KV cache、GQA、RoPE 或 serving optimization 的完整资料。

经典追问补充：只使用 [Reflection_Summary 路线](reflection-summary-plan.md)的 attention 追问链检查公式、shape、缩放和位置编码；跳过其早期 BERT/NLP 实现细节，现代推理仍使用本题库与更新资料。

LLM/VLM 后训练：使用 [Smol Course 路线](smol-course-plan.md)完成 SC-1、SC-2、SC-4，产出 chat-template/token/mask parity test、SFT 前后对照和三层评测矩阵。它替换一次泛读和一个重复的通用练习，不增加本周总时间。岗位明确要求 preference alignment 或 VLM 时，再从 SC-5/6 选择一个；课程复现环境与当前 TRL 环境分开，不混用依赖版本。

统一多模态定向：仅当 JD 命中多模态生成、VLM Infra 或前沿模型架构时，使用 [SenseNova-U1 路线](sensenova-u1-plan.md)完成两个 Session：先解释视觉 patch、MoT/mask 和 CE+flow，再设计理解/生成/编辑/交错评测与 LightLLM/LightX2V 部署。它替换一个通用 VLM 设计和一个重复系统白板；其他岗位只在 G8 追问中做 90 秒架构比较。

Agent 工程主线：使用[《深入理解 AI Agent》面试化路线](ai-agents-in-depth-plan.md)完成 AID-1、AID-2、AID-4、AID-6，分别产出 Harness 边界图、context budget、工具 contract/异步状态机和 eval matrix。这四项替换泛读与重复练习，不增加本周总时间。Agent 岗再激活 AID-5、AID-7 和 AID-8；模型后训练、自我进化、多模态章节按 JD 选修。

Coding Agent / Agent Infra 定向：接着用 [Harness Engineering 路线](harness-engineering-plan.md)完成 HE-1、HE-3、HE-6，产出仓库地图、Guides × Sensors 矩阵和行为验证阶梯。这三项替换一次 Codemia 白板、重复 Agent 阅读和一次泛化系统设计，不增加本周总时间；通用 ML/CV 岗不默认激活。

听觉总图：在 AID-1/2 后使用[《探秘 Claude Code，搞懂 Agent Harness》路线](agent-harness-podcast-plan.md)完成 AHP-1；只精听 01:52–38:52 的技术段并产出三层图。Agent/Coding 岗再做 AHP-2，它替换一次重复 Harness 阅读，不叠加时长。

Agentic 白板：未激活 Harness Engineering 时，使用 [Codemia](https://codemia.io/) 的 Agentic AI 题做一次限时训练；已激活时，Codemia 只作为第 6 周随机 mock，不与 HE-1/3/6 同周叠加。平台反馈之后，再用本题库 G11–G14 检查 workflow/agent 选择、工具副作用、安全、trace-level eval 和成本是否遗漏。

本周交付：

- 一页 Transformer inference 速查：attention、KV cache、prefill/decode、GQA、quantization。
- 一份 SFT evidence card：训练前 baseline、template/token/mask 单测、held-out 与 regression 指标、资源预算；DPO/VLM 岗再附 preference-pair audit 或 image ablation。
- 多模态生成/infra 岗再交一张 SenseNova-U1 主张—机制—证据矩阵，以及统一模型/解耦运行时架构卡；它替换上述一套泛化系统设计，不新增时长。
- 一张 Agent loop/Harness 边界图和一份 context budget，能解释缓存、压缩、记忆与恢复。
- 一套完整设计：Enterprise RAG 或多工具 Agentic workflow 二选一；另一题只做 15 分钟架构骨架并在 mock 失分时展开。
- 一张 RAG/Agent eval matrix，覆盖 component、end-to-end、trace、safety、latency 和 cost。
- Coding Agent / Agent Infra 岗再交付一份仓库地图、2 个机械检查和一层经人工校准的关键旅程评测；它替换上述一次白板练习，不新增时长。
- 回答清楚四个关键取舍：RAG vs fine-tune；workflow vs agent；single vs multi-agent；small vs large model routing。
- 完成 Deep-ML 53 Self-Attention、107 Masked Self-Attention、109 LayerNorm；闭卷画出每一步 shape、softmax axis 与 mask broadcast。
- 算法主干：LC 238 Product Except Self、LC 133 Clone Graph、LC 208 Trie；其余 Blind 75 缺口题留作公司定向或随机 mock。

把自己的多模态评估、结构化输出、供应商路由、retry/fallback、trace 和 release gate 经验嵌入答案；这比背框架名称更有说服力。

## 第 6 周：公司定向 + 全真模拟

拿具体 JD 做关键词映射：

```text
JD 要求 → 简历证据 → 题库题号 → 当前评分 → 缺口动作
```

本周至少完成：

- 1 次简历/行为 mock。
- 1 次技术 breadth/depth mock。
- 1 次系统设计 mock。
- 1 次编码 mock。
- 最后只复习错题、薄弱项目证据和公司特定内容，不再扩张资料源。

算法 mock 从 AlgoNote 32 + Blind 75 新增 12 题中随机抽取；不按题单顺序，也不把“曾经 AC”视为掌握。

另从 Deep-ML 14 道 P0 中随机抽 1 道做 35 分钟离线 implementation mock：只给函数签名，不打开题解；随后用 10 分钟补边界测试并口述生产扩展。

所有 mock 使用 [handbook 复盘模板](tech-interview-handbook-plan.md#模拟面试复盘模板)。编码 mock 分别记录沟通、问题求解、技术实现、测试；行为 mock 额外记录影响范围、决策框架和故事的最不利解读。

同时准备 5 个反问：团队成功指标、模型到产品的 ownership、当前最大失败模式、评估/发布流程、未来 6–12 个月的关键技术挑战。

## 学习资料的使用规则

题库仓库只用来发现问题；答案优先回到教材、论文、官方文档和自己的实验记录验证。建议主线：

- ML/CV：课程讲义、原论文、自己的训练/评估记录。
- 端侧：所用运行时官方文档、模型转换日志、真实设备 profiler/trace。
- 系统设计：生产案例和设计复盘，不背唯一架构。
- LLM/Agent：模型/框架官方文档、原论文、自己的 traces 与 evals。

对于 SenseNova-U1，把 README/demo、arXiv 报告、仓库实现与自己的复现分成四层证据；尤其核对 checkpoint 身份、总/激活参数、分辨率、steps/CFG、judge/cache 和硬件，不能用“8B、near-lossless、统一、低显存”替代精确定义。

对于 Reflection_Summary 这类个人总结仓库，额外执行“重写诱导性问题 → 补全符号/shape → 找反例 → 查一手来源 → 做最小实验”的验证协议，不把仓库答案原样复制到答案卡。

对于 Tuning Playbook，区分“作者建议”和“目标项目的已验证结论”。批大小、优化器、搜索算法和训练步数的建议都要结合自己的数据、架构、资源预算和部署约束验证。

对于《钥匙书》，每个定理先记录随机对象、全部假设、expectation/high-probability 结论和量级，再回查原书或标准来源；网页公式缺失或条件不清时，不把结论写入答案卡。

遇到一道不会的题，最多新增 1–2 个资料来源。资料越多不等于准备越好。

## 模拟面试自检表

技术题：

- 是否先给一句直接结论？
- 是否解释机制，而不只是列名词？
- 是否给适用条件、权衡和失败模式？
- 是否连接真实项目，且不泄露机密？

编码题：

- 是否复述题意并澄清至少 2–3 个关键约束，而不是直接开写？
- 是否先讨论 baseline、优化方案、正确性直觉和时空复杂度？
- 是否边实现边解释不变量，并能正确吸收面试官提示？
- 是否主动 dry run 正常与边界用例，修复问题后再宣布完成？

系统设计：

- 是否先确认用户、规模、SLO、隐私和成本？
- 是否定义 offline、online、serving、business 四层指标？
- 是否给 baseline、深挖、故障检测、降级、发布和回滚？
- 是否做至少一个数量级估算？

Senior/行为题：

- 是否明确“我”做了什么和“我们”如何协作？
- 是否说明决策依据、影响范围和可量化结果？
- 是否展示冲突处理、取舍和复盘后的系统性改进？

## 少于 3 周的压缩方案

不再尝试线性刷完 68 道 P0。先做基线，再围绕目标公司的面试轮次建立 18–24 个主动锚点：

- 第 1–3 天：R1/B1、M1/M2/M4/M7；完成一个项目故事、DML 10/23 和三道 DSA 基线。
- 第 4–7 天：V1/V2/V3/V10、E2/E4/E5/E8；完成 DML 41/73/115、parity/latency 图和一次 CV/Edge mock。
- 第 8–10 天：M5/M6/M10/M12、S4/S6；完成一套 45 分钟系统设计和一次随机 coding mock。
- 第 11–13 天：G1/G7/G11/G12，强制追问 G2/G14；完成 DML 53/107/109 和一套 RAG/Agent 设计骨架。
- 最后 2–3 天：行为、技术、系统设计三场全真 mock；只修复 unaided transfer 失败和公司特定缺口。

每天至少保留一次闭卷检索、一次无辅助迁移和一次证据更新。AI/资料只能在首次尝试后介入；时间短更不能把全部时间变成阅读或答案消费。

## 面试前 48 小时

- 只看自己的答案卡、架构图、错题和项目证据。
- 重做自我介绍、三个项目故事、两个系统设计框架和四道编码热身。
- 确认视频/白板/IDE/网络环境和时区。
- 保持正常睡眠；不临时开新主题。
