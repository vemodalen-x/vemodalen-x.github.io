# AI 工程师面试准备包

这套材料按当前简历中的目标方向定制：Senior AI Engineer、Computer Vision、Edge ML、Computational Photography、Multimodal / Agentic AI。

## 交付内容

- [Interview Learning OS](learning-os.html)：本地交互式学习工作台，提供可解释的下一步推荐、六步 session、分层提示、迁移挑战、五维评分、信心校准和证据日志。
- [Learning OS V2 设计评审](learning-experience-v2.md)：评估当前方案与自适应新交互学习系统的差距、学习科学依据、AI 教练契约、指标和两周验证实验。
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

## 推荐使用顺序

1. 先打开[统一练习脉络](practice-roadmap.md)，完成第 0 天的 60 分钟闭卷基线。
2. 只激活脉络中本周的能力簇、15 道 DSA 主干和对应 Deep-ML 题；其他题目先留在覆盖池。
3. 按缺口路由调用 ML Interviews、Reflection、钥匙书或 Tuning Playbook，不按来源顺序通读。
4. 每道题都要产生口述、代码/测试、图或 mock 记录；真实项目证据必须包含决策、指标、失败和权衡。
5. 拿到具体 JD 后，再从覆盖池加入公司定向题；新增任务必须服从每周 8–10 小时上限。

## 题库来源与取舍

- [andrewekhalel/MLQuestions](https://github.com/andrewekhalel/MLQuestions)：适合 ML/CV 基础概念热身；题目覆盖较散，部分答案过短或表述陈旧，因此只把它当问题索引，不直接背答案。
- [alirezadir/Machine-Learning-Interviews](https://github.com/alirezadir/Machine-Learning-Interviews)：覆盖编码、ML 基础、系统设计、LLM、Multimodal 和行为面试，是当前主索引。
- [chiphuyen/machine-learning-systems-design](https://github.com/chiphuyen/machine-learning-systems-design)：适合练开放式 ML 系统设计；用更新的生产经验补充其较早内容。
- [khangich/machine-learning-interview](https://github.com/khangich/machine-learning-interview)：适合检查统计、编码、ML 基础和系统设计是否漏项；部分链接较旧。
- [alirezadir/Agentic-AI-Systems](https://github.com/alirezadir/Agentic-AI-Systems)：补足 Agentic system design、评估、安全、成本和失败处理。

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
