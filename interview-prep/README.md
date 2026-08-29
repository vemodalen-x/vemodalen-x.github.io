# AI 工程师面试准备包

这套材料按当前简历中的目标方向定制：Senior AI Engineer、Computer Vision、Edge ML、Computational Photography、Multimodal / Agentic AI，以及 AI Agent / Forward Deployed Engineering。

## 交付内容

- [Interview Learning OS Desktop](learning-os.html)：可从桌面快捷方式直接启动的本地学习应用，提供 P1–P8 第一性原理 × K1–K8 能力簇双轴目录、预算化任务包、延迟无辅助复测、全库离线检索、分层提示、锚定评分、草稿恢复和证据日志。首次安装快捷方式运行 `install-desktop-shortcut.ps1`；也可双击 `launch-learning-os.cmd`。
- [Learning OS V3 设计与验证契约](learning-experience-v3.md)：说明 V3 如何修复即时迁移冒充延迟能力、默认评分偏差、队列超预算和草稿丢失，并定义状态迁移、验证标准与下一轮实验。
- [Learning OS V2 设计评审](learning-experience-v2.md)：保留为历史设计记录，涵盖自适应学习系统的初版差距分析、学习科学依据和 AI 教练契约。
- [第一性原理知识地图](first-principles-knowledge-map.md)：用目标、表征、机制、状态、边界、评估、资源和 ownership 八个原语重组全部知识，并提供通用答题内核、P×K 交叉表和缺口路由。先用它确定坐标。
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
- [Hugging Face Smol Course 后训练路线](smol-course-plan.md)：把 Chat Template、SFT、LoRA、目标任务评测、DPO 和 VLM 组织为三个可验证的面试产物，并处理课程锁定版本与当前 TRL 文档的差异。
- [SenseNova-U1 原生统一多模态路线](sensenova-u1-plan.md)：围绕 near-lossless visual interface、MoT、CE + pixel-flow、分阶段训练、四层评测与理解—生成解耦推理建立前沿 VLM 面试证据。
- [Kimi K3 架构、技术报告与 Agent 系统路线](kimi-k3-plan.md)：用 sequence/depth/width/modality 四轴学习 KDA–MLA、AttnRes、Stable LatentMoE，再连接多教师 on-policy 蒸馏、可验证 Agent 环境、百万上下文训练与混合缓存 serving。
- [《深入理解 AI Agent》面试化学习路线](ai-agents-in-depth-plan.md)：把 307 页中文 PDF 压缩成 8 个核心 Session、3 个岗位选修和 1 个 capstone，覆盖 Harness、上下文/记忆、工具、Coding Agent、评估与多 Agent。
- [Hello-Agents 实践路线](hello-agents-plan.md)：把 16 章教程压缩为三范式故障实验、最小 Agent runtime、工具/上下文/协议边界、三层评测和单 Agent 优先的项目答辩。
- [Harness Engineering 面试化学习路线](harness-engineering-plan.md)：把 Coding Agent 的仓库环境拆成 8 个 Session，覆盖 repo-as-record、SPEC/WORKFLOW、Guides × Sensors、Agent 可读性、合并经济学、熵管理与行为正确性。
- [《探秘 Claude Code，搞懂 Agent Harness》听辨与实践路线](agent-harness-podcast-plan.md)：把 48 分钟播客转成“会跑、跑久、跑稳”三层图、主张—证据矩阵和真实 Agent 故障实验，区分访谈观点、官方事实与自己的验证。
- [Topcoder Fullstack 产品交付路线](topcoder-fullstack-roadmap-plan.md)：把 Web 路线图压缩为浏览器 → TypeScript → Node/Express → PostgreSQL → React/Next → 测试/安全/发布的 8 个 Session，并用一个纵向项目形成生产证据。
- [Martin Fowler 分布式系统模式路线](distributed-systems-patterns-plan.md)：把 30 个模式聚成日志、复制/共识、成员协调、时钟/版本、分区、请求语义与 2PC 七个问题簇，并用确定性故障注入训练系统推理。
- [高质量 Prompt 工程路线](prompt-engineering-method-plan.md)：把五段式模板、v0–v3 和参数建议逐条审计，升级为任务契约、不可信上下文、冻结评测、版本发布与回滚的 6 个 Session。
- [AI Agent / FDE 转型面试路线](agent-fde-transition-plan.md)：把 Agent 技术纵深与 FDE 的 discovery、集成、上线、采用和反馈闭环合成一条 T 型路线，包含岗位差异、作品集、面试轮次、30 道高信号问题、7 个评分节点与六周替换计划。

## 桌面应用与知识检索

- Windows 首次使用：双击 [install-desktop-shortcut.cmd](install-desktop-shortcut.cmd)，桌面会创建应用快捷方式。也可直接双击 [launch-learning-os.cmd](launch-learning-os.cmd)。应用使用本机 Chrome/Edge 的独立窗口，不需要服务器。
- “知识库”先按 P1–P8 第一性原理建立稳定坐标，再与 K1–K8/META 面试视图交叉筛选；当前索引覆盖全部 27 份 Markdown、575 个标题章节，并与 61 个多标签交互练习节点联合检索。`Ctrl/⌘ + K` 可从任意位置聚焦搜索。
- 知识正文来自仓库内 Markdown，搜索索引是可再生文件。新增或修改资料后，运行 `node scripts/build-knowledge-index.cjs`；构建器会在有文件未被纳入元数据时直接失败，避免静默漏检。
- 学习状态继续保存在浏览器本地。更新索引或应用文件不会清空进度；换浏览器或迁移电脑前先在应用中导出状态。

## 推荐使用顺序

1. 从桌面“AI 面试学习”快捷方式打开 [Interview Learning OS Desktop](learning-os.html)，选择角色、面试轮次和当天预算；第一次 Session 只形成候选证据，不把即时正确当作延迟掌握。
2. 先用[第一性原理知识地图](first-principles-knowledge-map.md)把一道熟悉题和一道陌生题还原为目标、表征、不变量、状态、边界、评估、资源与 ownership；再用[统一练习脉络](practice-roadmap.md)完成第 0 天闭卷基线。
3. 只激活脉络中本周的能力簇、15 道 DSA 主干和对应 Deep-ML 题；其他题目先留在覆盖池。
4. CV、3D、Computational Photography 或 world-model 岗命中时，用[Vincent Sitzmann 路线](vincent-sitzmann-cv-plan.md)深化 V5/V6/V13/V14；核心只做坐标网络对照与新视角系统设计，世界模型和“3D 会过时吗”按 JD 选修。
5. LLM 后训练或多模态岗位命中时，在 Transformer 基础后使用 [Smol Course 路线](smol-course-plan.md)：SFT、评测为核心，DPO/VLM 按 JD 激活；不把 notebook 跑通或 train loss 下降当成掌握。
6. 多模态生成、VLM Infra 或前沿架构岗位命中时，再用 [SenseNova-U1 路线](sensenova-u1-plan.md)比较典型 VLM 与原生统一模型；它替换一个通用 VLM 设计和一个重复系统白板，不叠加课时。
7. 前沿 LLM 架构、Agent 模型、训练 Infra 或 Serving JD 命中时，在 G1 Transformer 与 Agent eval 基础后使用 [Kimi K3 路线](kimi-k3-plan.md)：核心只激活架构、Agent 训练、Serving 审计三个评分节点，替换一次 Transformer 泛化白板、一次 Agent 后训练白板和一次系统设计，不额外叠加。
8. 按缺口路由调用 ML Interviews、Reflection、钥匙书或 Tuning Playbook；Agent 岗或 K8 失分时先使用[《深入理解 AI Agent》路线](ai-agents-in-depth-plan.md)建立原理，用 [Hello-Agents 实践路线](hello-agents-plan.md)完成三范式/最小运行时和评测项目，用[播客听辨路线](agent-harness-podcast-plan.md)形成三层总图，Coding Agent / Agent Infra 岗再接 [Harness Engineering 路线](harness-engineering-plan.md)。
9. 目标命中 AI Agent、Applied AI、Deployment 或 FDE 时，选择桌面端 `AI Agent / Forward Deployed` 角色并执行[转型路线](agent-fde-transition-plan.md)：先做 AFD-0 定位，再用一个生产式 Agent 作品串起 discovery、既有系统、eval、rollout 与 live case；这些任务替换普通 Agent 白板和成功 demo，不额外叠加。
10. Fullstack、Frontend、Backend 或 AI Product Engineer 岗命中，或项目只能讲模型不能讲交付时，用 [Topcoder Fullstack 路线](topcoder-fullstack-roadmap-plan.md)完成一个纵向切片；它替换一次泛化系统设计和多个随机 demo，不叠加课时。
11. Backend、Platform、Infra、Data、ML Platform 或 Agent Infra 岗命中，或系统设计只会列组件时，用[分布式系统模式路线](distributed-systems-patterns-plan.md)完成复制日志与幂等写两个故障实验；它替换两场泛化白板，不顺序背 30 个模式。
12. LLM、Agent 或 AI Product 岗需要解释 Prompt 设计，或真实系统出现不稳定输出时，用[高质量 Prompt 工程路线](prompt-engineering-method-plan.md)完成任务契约与冻结评测两个交互节点；它替换重复 Prompt 博客阅读，不背角色/参数配方。
13. 每道题都要产生口述、代码/测试、图或 mock 记录；真实项目证据必须包含决策、指标、失败和权衡。
14. 拿到具体 JD 后，再从覆盖池加入公司定向题；新增任务必须服从每周 8–10 小时上限。

## 题库来源与取舍

- [andrewekhalel/MLQuestions](https://github.com/andrewekhalel/MLQuestions)：适合 ML/CV 基础概念热身；题目覆盖较散，部分答案过短或表述陈旧，因此只把它当问题索引，不直接背答案。
- [alirezadir/Machine-Learning-Interviews](https://github.com/alirezadir/Machine-Learning-Interviews)：覆盖编码、ML 基础、系统设计、LLM、Multimodal 和行为面试，是当前主索引。
- [chiphuyen/machine-learning-systems-design](https://github.com/chiphuyen/machine-learning-systems-design)：适合练开放式 ML 系统设计；用更新的生产经验补充其较早内容。
- [khangich/machine-learning-interview](https://github.com/khangich/machine-learning-interview)：适合检查统计、编码、ML 基础和系统设计是否漏项；部分链接较旧。
- [alirezadir/Agentic-AI-Systems](https://github.com/alirezadir/Agentic-AI-Systems)：补足 Agentic system design、评估、安全、成本和失败处理。
- 李博杰《深入理解 AI Agent：设计原理与工程实践》中文 PDF v1.2（2026-07-23；[配套代码](https://github.com/bojieli/ai-agent-book)）：作为 Agent 工程主教材，覆盖 Agent/Harness、上下文与记忆、工具、Coding Agent、评估、后训练、自我进化、多模态和多 Agent。本准备包按[面试化路线](ai-agents-in-depth-plan.md)定向学习，不把通读 307 页当成完成。
- [datawhalechina/hello-agents](https://github.com/datawhalechina/hello-agents)（[在线版](https://datawhalechina.github.io/hello-agents/)；本次审计固定到 `6c616938`，2026-07-10）：用 ReAct、Plan-and-Solve、Reflection、最小框架、记忆/上下文、MCP/A2A/ANP、评测与综合案例把 Agent 原理变成实现证据。本准备包按[实践路线](hello-agents-plan.md)只激活 HA-1/2/6/7；低代码、框架横评、Agentic RL 与多 Agent 仿真按 JD 选修。仓库根许可为 CC BY-NC-SA 4.0，章节示例跨多个 `hello-agents` 版本；公开复用前检查归属/非商业/相同方式共享，实验必须锁版本，附录面试答案只作问题索引。
- [deusyu/harness-engineering](https://github.com/deusyu/harness-engineering)：中文优先的 Harness Engineering 学习档案，用概念、思考、实践和工具材料组织 repo-as-record、机械约束、Agent 可读性、吞吐与熵管理。它是持续更新的二次整理，不是规范；本准备包按[面试化路线](harness-engineering-plan.md)回查其引用的[一手案例](https://openai.com/zh-Hans-CN/index/harness-engineering/)，并保留个人/遗留/高风险场景下的适用性反证。
- [十字路口《探秘 Claude Code，搞懂 Agent Harness》](https://podcasts.apple.com/cn/podcast/%E6%8E%A2%E7%A7%98-claude-code-%E6%90%9E%E6%87%82-agent-harness-%E5%AF%B9%E8%B0%88%E6%9D%A5%E6%96%B0%E7%92%90/id1729552193?i=1000766263837)：用执行、状态、治理三层建立口语化总图。节目中的 CLI、memory、模型能力与行业预测属于嘉宾观点；按[听辨路线](agent-harness-podcast-plan.md)用 Learn Claude Code、官方文档和实验交叉验证。
- [Vincent Sitzmann](https://www.vincentsitzmann.com/) 与 [MIT Scene Representation Group](https://www.scenerepresentations.org/)：用于补足相机/多视图几何、神经场、SIREN、可微渲染、新视角合成、视频生成和具身视觉。主页展示的是动态研究选集，不是完整基础课；本准备包按[定向路线](vincent-sitzmann-cv-plan.md)使用 2026 课程与一手项目页交叉验证，并把“3D 会过时”保留为有范围和反例的研究观点。
- [Hugging Face Smol Course](https://huggingface.co/smol-course)（[v2 仓库](https://github.com/huggingface/smol-course)）：用于小模型 instruction tuning、DPO 与 VLM 实践。当前 v2 实际发布的是 Unit 1–3，Unit 4 仍为 Coming Soon，评测分散在单元练习中；本准备包用[后训练路线](smol-course-plan.md)补齐先评测后训练的闭环，并明确区分课程 lock 与当前 TRL API。默认不创建付费 Job、不上传模型/数据、不公开结果。
- [OpenSenseNova/SenseNova-U1 中文 README](https://github.com/OpenSenseNova/SenseNova-U1/blob/main/README_CN.md)（[技术报告](https://arxiv.org/abs/2605.12500)）：用于学习无预训练 VE/VAE 的视觉接口、理解—生成 MoT、文本 CE + pixel flow、联合训练与生产推理。README、论文和 demo 属于作者证据；本准备包按[定向路线](sensenova-u1-plan.md)回查代码、评测脚本与已知限制，并明确“near-lossless、unified、8B、低显存”各自的精确定义和反例。默认不下载大型权重、不调用付费 judge。
- [MoonshotAI/Kimi-K3](https://github.com/MoonshotAI/Kimi-K3)（[技术报告](https://arxiv.org/abs/2607.24653)、[视频领读](https://www.bilibili.com/video/BV1KZ8X6uEPL/)）：用于学习 hybrid KDA–MLA、Attention Residuals、Stable LatentMoE、多教师 on-policy 蒸馏、原生视觉、百万 token Agent RL 与 serving co-design。架构数字和实验结论以官方报告为真源；视频用于论文谱系和第二解释，截至 2026-08-29 无公开字幕/章节，不猜时间轴或讲者原话。执行时使用[面试化路线](kimi-k3-plan.md)，并把约 2.5× scaling efficiency、榜单和系统数字保留为带设置与限制的发布方证据。
- [Topcoder Fullstack Roadmap](https://topcoderfullstack.com/roadmap)（[40+ 项目页](https://topcoderfullstack.com/projects)）：嵌入式 XMind 适合发现原生 Web、浏览器、Git/Docker、Node/Express、数据库、React/Next 和视觉开发主题；页面显示约一年前更新，并以六个月训练营为背景，不是版本化规范或掌握证明。本准备包按[产品交付路线](topcoder-fullstack-roadmap-plan.md)补入 TypeScript、PostgreSQL、测试、OWASP、安全、可访问性、可观测性与发布/回滚；框架/API 事实以当前官方文档为准。
- [Catalog of Patterns of Distributed Systems](https://martinfowler.com/articles/patterns-of-distributed-systems/)：Unmesh Joshi 在 Martin Fowler 站点发布的 30 个模式短摘要，适合建立分布式存储与协调的模式地图；深入内容主要链接到书籍章节，不是形式化证明或完整目录。本准备包按[故障推理路线](distributed-systems-patterns-plan.md)回查 Paxos、Raft、Spanner 与 Dynamo 一手论文，并补足故障模型、fencing、读语义、幂等副作用、可观测性与确定性故障注入。
- 用户提供的《高质量 Prompt 是怎么写出来的？》方法稿：保留任务分类、结构化、迭代和场景测试，纠正“默认索取思维链”、固定 temperature/top_p 配方、上下文越多越好和相似度即质量等不稳结论。本准备包按[工程化路线](prompt-engineering-method-plan.md)用 [OpenAI 当前模型指导](https://developers.openai.com/api/docs/guides/latest-model)校准，但所有参数与能力仍以实际供应商、模型快照和 API 为准。

### AI Agent / FDE 岗位与面试信号

- [OpenAI FDE](https://openai.com/careers/forward-deployed-engineer-%28fde%29-seattle-seattle/) 与 [AI Deployment Engineer](https://openai.com/careers/ai-deployment-engineer-enterprise-san-francisco/)：用来校准 discovery、technical scoping、系统设计、实现、eval、生产上线、采用和业务结果这条完整交付链；[OpenAI Interview Guide](https://openai.com/interview-guide/)补充 coding、take-home、设计、测试和沟通信号。
- [Anthropic Applied AI Engineer](https://job-boards.greenhouse.io/anthropic/jobs/5343697008)、[Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) 与 [Agent Evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)：用来校准 pair building、eval/harness、从简单 workflow 开始和轨迹/环境结果评估。
- [Palantir 工程面试指南](https://www.palantir.com/careers/getting-hired/)与[既有系统能力](https://www.palantir.com/careers/getting-hired/working-inside-existing-systems/)：用来校准开放式问题、思路表达，以及在陌生既有系统中形成假设、做最小可靠改动而非先重写。岗位定义会变化，具体申请仍以当次 JD 和招聘方说明为准。

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
