# AI 工程师面试准备包

这套材料按当前简历中的目标方向定制：Senior AI Engineer、Computer Vision、Edge ML、Computational Photography、Multimodal / Agentic AI。

## 交付内容

- [Interview Learning OS Desktop](learning-os.html)：可从桌面快捷方式直接启动的本地学习应用，提供预算化任务包、延迟无辅助复测、八簇知识目录、全库离线检索、分层提示、锚定评分、草稿恢复和证据日志。首次安装快捷方式运行 `install-desktop-shortcut.ps1`；也可双击 `launch-learning-os.cmd`。
- [Learning OS V3 设计与验证契约](learning-experience-v3.md)：说明 V3 如何修复即时迁移冒充延迟能力、默认评分偏差、队列超预算和草稿丢失，并定义状态迁移、验证标准与下一轮实验。
- [Learning OS V2 设计评审](learning-experience-v2.md)：保留为历史设计记录，涵盖自适应学习系统的初版差距分析、学习科学依据和 AI 教练契约。
- [统一练习脉络](practice-roadmap.md)：按八个能力簇组织全部题库和资料，定义原理 → 实现 → 诊断 → 系统 → mock 的依赖关系、六周唯一激活路径和缺口路由。先从这里开始。
- [90 题核心题库](question-bank.md)：项目深挖、ML 基础、CV、端侧部署、系统设计、GenAI、编码与行为面试。
- [6 周备考方案](study-plan.md)：每周目标、每日训练、复习间隔、自测量表和临场策略。
- [AlgoNote 算法学习路线](algo-note-plan.md)：从高频题单中筛出的 32 道 AI/CV/Edge 岗位核心题，以及 Python/C++ 训练方法。
- [Chip Huyen《Machine Learning Interviews》学习路线](ml-interviews-book-plan.md)：面试流程、Senior 信号、数学/数值、ML workflow、训练与 CV 的定向阅读和 20 道补充诊断题。
- [Tech Interview Handbook 定向学习路线](tech-interview-handbook-plan.md)：编码面试操作协议与四维评分、Senior 行为故事库、自我介绍、简历/JD 映射和模拟复盘模板。
- [Reflection_Summary 定向学习路线](reflection-summary-plan.md)：从中文经典 ML 笔记中抽取八条深度追问链，加入反例检查和一手来源验证，但不扩张 90 题主库。
- [Deep Learning Tuning Playbook 定向学习路线](tuning-playbook-plan.md)：训练 baseline、scientific/nuisance/fixed 参数、搜索空间、实验方差、训练故障、checkpoint 和实验追踪的面试化实践。
- [Datawhale《钥匙书》定向学习路线](key-book-plan.md)：PAC、复杂度、泛化界、稳定性、一致性、收敛率和遗憾界的面试化理论路线，以及 12 道深挖题。
- [LeetCode Blind 75 覆盖与补充路线](blind-75-plan.md)：与 AlgoNote 32 题去重后的覆盖审计、12 道 P0 缺口题、P1 hard 校准题和模式迁移训练。
- [Deep-ML 机器学习实现题路线](deep-ml-plan.md)：从 100+ 道 ML coding challenge 中筛出 14 道 P0，覆盖数值、经典 ML、CV 张量、优化器与 Transformer 算子，并加入边界测试和生产化追问。
- [Vincent Sitzmann 前沿 CV 学习路线](vincent-sitzmann-cv-plan.md)：把 MIT 课程、SRN、SIREN、Light Field Networks 和世界模型研究组织为几何 → 神经场 → 可微渲染 → 新视角 → 感知—行动的实践链。
- [《深入理解 AI Agent》面试化学习路线](ai-agents-in-depth-plan.md)：把 307 页中文 PDF 压缩成 8 个核心 Session、3 个岗位选修和 1 个 capstone，覆盖 Harness、上下文/记忆、工具、Coding Agent、评估与多 Agent。
- [Harness Engineering 面试化学习路线](harness-engineering-plan.md)：把 Coding Agent 的仓库环境拆成 8 个 Session，覆盖 repo-as-record、SPEC/WORKFLOW、Guides × Sensors、Agent 可读性、合并经济学、熵管理与行为正确性。
- [《探秘 Claude Code，搞懂 Agent Harness》听辨与实践路线](agent-harness-podcast-plan.md)：把 48 分钟播客转成“会跑、跑久、跑稳”三层图、主张—证据矩阵和真实 Agent 故障实验，区分访谈观点、官方事实与自己的验证。

## 桌面应用与知识检索

- Windows 首次使用：双击 [install-desktop-shortcut.cmd](install-desktop-shortcut.cmd)，桌面会创建应用快捷方式。也可直接双击 [launch-learning-os.cmd](launch-learning-os.cmd)。应用使用本机 Chrome/Edge 的独立窗口，不需要服务器。
- “知识库”按 K1–K8 和学习系统元资料聚类；当前索引覆盖全部 18 份 Markdown、328 个标题章节，并与 38 个交互练习节点联合检索。`Ctrl/⌘ + K` 可从任意位置聚焦搜索。
- 知识正文来自仓库内 Markdown，搜索索引是可再生文件。新增或修改资料后，运行 `node scripts/build-knowledge-index.cjs`；构建器会在有文件未被纳入元数据时直接失败，避免静默漏检。
- 学习状态继续保存在浏览器本地。更新索引或应用文件不会清空进度；换浏览器或迁移电脑前先在应用中导出状态。

## 推荐使用顺序

1. 从桌面“AI 面试学习”快捷方式打开 [Interview Learning OS Desktop](learning-os.html)，选择角色、面试轮次和当天预算；第一次 Session 只形成候选证据，不把即时正确当作延迟掌握。
2. 再用[统一练习脉络](practice-roadmap.md)完成第 0 天闭卷基线，并核对系统推荐是否覆盖真实薄弱项。
3. 只激活脉络中本周的能力簇、15 道 DSA 主干和对应 Deep-ML 题；其他题目先留在覆盖池。
4. CV、3D、Computational Photography 或 world-model 岗命中时，用[Vincent Sitzmann 路线](vincent-sitzmann-cv-plan.md)深化 V5/V6/V13/V14；核心只做坐标网络对照与新视角系统设计，世界模型和“3D 会过时吗”按 JD 选修。
5. 按缺口路由调用 ML Interviews、Reflection、钥匙书或 Tuning Playbook；Agent 岗或 K8 失分时先使用[《深入理解 AI Agent》路线](ai-agents-in-depth-plan.md)，用[播客听辨路线](agent-harness-podcast-plan.md)形成三层总图，Coding Agent / Agent Infra 岗再接 [Harness Engineering 路线](harness-engineering-plan.md)。
6. 每道题都要产生口述、代码/测试、图或 mock 记录；真实项目证据必须包含决策、指标、失败和权衡。
7. 拿到具体 JD 后，再从覆盖池加入公司定向题；新增任务必须服从每周 8–10 小时上限。

## 题库来源与取舍

- [andrewekhalel/MLQuestions](https://github.com/andrewekhalel/MLQuestions)：适合 ML/CV 基础概念热身；题目覆盖较散，部分答案过短或表述陈旧，因此只把它当问题索引，不直接背答案。
- [alirezadir/Machine-Learning-Interviews](https://github.com/alirezadir/Machine-Learning-Interviews)：覆盖编码、ML 基础、系统设计、LLM、Multimodal 和行为面试，是当前主索引。
- [chiphuyen/machine-learning-systems-design](https://github.com/chiphuyen/machine-learning-systems-design)：适合练开放式 ML 系统设计；用更新的生产经验补充其较早内容。
- [khangich/machine-learning-interview](https://github.com/khangich/machine-learning-interview)：适合检查统计、编码、ML 基础和系统设计是否漏项；部分链接较旧。
- [alirezadir/Agentic-AI-Systems](https://github.com/alirezadir/Agentic-AI-Systems)：补足 Agentic system design、评估、安全、成本和失败处理。
- 李博杰《深入理解 AI Agent：设计原理与工程实践》中文 PDF v1.2（2026-07-23；[配套代码](https://github.com/bojieli/ai-agent-book)）：作为 Agent 工程主教材，覆盖 Agent/Harness、上下文与记忆、工具、Coding Agent、评估、后训练、自我进化、多模态和多 Agent。本准备包按[面试化路线](ai-agents-in-depth-plan.md)定向学习，不把通读 307 页当成完成。
- [deusyu/harness-engineering](https://github.com/deusyu/harness-engineering)：中文优先的 Harness Engineering 学习档案，用概念、思考、实践和工具材料组织 repo-as-record、机械约束、Agent 可读性、吞吐与熵管理。它是持续更新的二次整理，不是规范；本准备包按[面试化路线](harness-engineering-plan.md)回查其引用的[一手案例](https://openai.com/zh-Hans-CN/index/harness-engineering/)，并保留个人/遗留/高风险场景下的适用性反证。
- [十字路口《探秘 Claude Code，搞懂 Agent Harness》](https://podcasts.apple.com/cn/podcast/%E6%8E%A2%E7%A7%98-claude-code-%E6%90%9E%E6%87%82-agent-harness-%E5%AF%B9%E8%B0%88%E6%9D%A5%E6%96%B0%E7%92%90/id1729552193?i=1000766263837)：用执行、状态、治理三层建立口语化总图。节目中的 CLI、memory、模型能力与行业预测属于嘉宾观点；按[听辨路线](agent-harness-podcast-plan.md)用 Learn Claude Code、官方文档和实验交叉验证。
- [Vincent Sitzmann](https://www.vincentsitzmann.com/) 与 [MIT Scene Representation Group](https://www.scenerepresentations.org/)：用于补足相机/多视图几何、神经场、SIREN、可微渲染、新视角合成、视频生成和具身视觉。主页展示的是动态研究选集，不是完整基础课；本准备包按[定向路线](vincent-sitzmann-cv-plan.md)使用 2026 课程与一手项目页交叉验证，并把“3D 会过时”保留为有范围和反例的研究观点。

### Transformer 可视化辅助

- [The Transformer Architecture: A Visual Guide](https://www.hendrik-erz.de/post/the-transformer-architecture-a-visual-guide-pdf-download)（[单页 PDF](https://www.hendrik-erz.de/storage/app/media/pdf/Transformers_v1.1.pdf)）：适合建立原始 encoder–decoder Transformer、scaled dot-product attention、multi-head attention、残差连接和 FFN 的整体图景。它主要解释 2017 年原始架构，不代替对现代 decoder-only LLM、KV cache、GQA、RoPE 和推理优化的学习。

### 交互式练习平台

- [Codemia](https://codemia.io/)：用于系统设计、DSA、OOD、Agentic AI 和模拟面试的主动练习，提供交互白板与反馈。对本题库最有价值的是第 4 周系统设计和第 5 周 Agentic AI 演练。平台上的通用软件设计题需要主动补上 ML/AI 特有的数据、模型、离线/在线评估、漂移、发布和回滚，不把参考解当成唯一架构。

### 算法与数据结构

- [itcharge/AlgoNote](https://github.com/itcharge/AlgoNote)（[在线阅读](https://algo.itcharge.cn/)）：中文算法与数据结构教程，包含按类别题单、高频 100/200 题及大量 Python 题解。本准备包不要求顺序刷完整仓库，而使用[定制的 32 题路线](algo-note-plan.md)覆盖数组/矩阵、哈希、二分、链表、栈/队列、树/图、回溯与基础 DP。
- [LeetCode Blind 75](https://leetcode.com/problem-list/oizxjoit/)：作为 AlgoNote 32 题的覆盖审计，而不是第二套完整刷题任务。已有 14 道完全重合、3 组模式相邻；只新增位运算、经典 DP、图复制、反向可达、BST 和 Trie 等 12 道 P0 缺口题。执行时使用[补充路线](blind-75-plan.md)。

### ML 面试基础与盲区诊断

- [Chip Huyen《Introduction to Machine Learning Interviews Book》](https://huyenchip.com/ml-interviews-book/)：两部分分别解释岗位/面试流程和 200+ 分层知识问题，覆盖数学、计算机基础、数据、ML workflow、算法与训练。它适合巩固已有知识、发现盲区，不当作 ML 教材或面试捷径；出版时间较早，现代 LLM、Multimodal 和 Agentic AI 由本准备包 G 模块补充。执行时使用[定向学习路线](ml-interviews-book-plan.md)。
- [sladesha/Reflection_Summary](https://github.com/sladesha/Reflection_Summary)（现重定向到 `nosuggest/Reflection_Summary`）：经典数学、数据处理、ML、深度学习、NLP 和推荐的中文连续追问库。只用它加深 bias–variance、MLE/MAP、线性代数、数据质量、LR、树模型、归一化和 attention；部分答案存在过度简化或版本过期风险，必须用反例、推导和一手资料验证。执行时使用[定向学习路线](reflection-summary-plan.md)。

### 机器学习实现题

- [Deep-ML Problems](https://www.deep-ml.com/problems)（[开源题库](https://github.com/Open-Deep-ML/DML-OpenProblem)）：用于把协方差、PCA、梯度下降、K-Means、Conv2D、Adam、BatchNorm 和 attention 等公式写成可测试的 Python/NumPy 代码。只执行[筛选后的 14 题路线](deep-ml-plan.md)；与 C1/C3/C5/M7/M8/G1 重合的题直接替代对应 coding 练习。网站 AC 之后仍须补 shape、数值稳定性、自建边界测试和生产扩展。

### 深度学习训练与实验设计

- [google-research/tuning_playbook](https://github.com/google-research/tuning_playbook)：面向工程师和研究人员的深度学习调参与实验流程，覆盖初始配置、科学调参、训练步数、输入管线、评估、checkpoint、实验追踪、BatchNorm、多机和优化不稳定。它是作者经验总结而非 Google 官方支持产品；本准备包用它强化 M7、M8、M11、M12 和 CV 训练复盘，不把验证集调优等同于完整 ML 产品流程。执行时使用[定向学习路线](tuning-playbook-plan.md)。

### 机器学习理论基础

- [Datawhale《钥匙书》](https://datawhalechina.github.io/key-book/)（[开源仓库](https://github.com/datawhalechina/key-book)）：《机器学习理论研究导引》的伴读笔记，覆盖可学性、复杂度、泛化界、稳定性、一致性、收敛率和遗憾界。当前路线只要求掌握 PAC、VC/Rademacher、泛化/稳定性和收敛的假设与直觉；详细不可学性证明和在线遗憾算法按研究/在线学习 JD 选修。具体定理需回查原书或标准来源。执行时使用[定向学习路线](key-book-plan.md)。

### 通用软件面试执行与求职流程

- [yangshun/tech-interview-handbook](https://github.com/yangshun/tech-interview-handbook)（[在线版](https://www.techinterviewhandbook.org/)）：用于把知识和解题能力转化为可观察的面试信号，重点学习编码面试的沟通/求解/实现/测试量表、Senior 行为面试、自我介绍和模拟复盘。算法内容继续使用 AlgoNote，ML 系统设计继续使用本题库与 Codemia，不重复刷 Grind 75。执行时使用[定向学习路线](tech-interview-handbook-plan.md)。

## 优先级

- **P0**：目标岗位高概率题，必须达到可独立、结构化、带项目证据回答。
- **P1**：岗位或公司相关题，P0 稳定后补齐。

不要追求把所有题背成固定稿。面试的目标是：同一知识点换一种问法，仍能从原理、权衡、证据和失败模式重新组织答案。
