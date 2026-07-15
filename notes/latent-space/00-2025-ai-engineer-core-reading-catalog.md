---
title: 2025 AI Engineer 核心阅读目录：50 项论文到实验
date: 2026-07-14
type: reading-catalog
status: active
source: https://www.latent.space/p/2025-papers
summary: 将 Latent.Space 的十个 AI 工程方向补齐为 50 个可检索入口，并为每项标注优先级、个人判断和最低阅读产出。
tags:
  - AI工程
  - 论文阅读
  - 研究目录
  - 实验
---

# 2025 AI Engineer 核心阅读目录：50 项论文到实验

## 如何使用

这不是需要从头到尾背完的书单。每次只选一个正在发生的问题，阅读一项，并交付一个能被检查的产出。

- **P0**：直接改善个人知识助手、评测、RAG、智能体或代码工作流，优先精读和实验。
- **P1**：建立完整工程判断，需要时精读，至少保留一页结构化笔记。
- **P2**：扩展视野或适用于特定方向，先读摘要、图表、限制和结论。

完整机器可读数据位于 `knowledge/latent-space-paper-catalog.json`。本文的中文判断与实验建议为个人知识库重新整理，不复制原文说明。模型、工具和接口会变化，实践前需核对一手来源。

## 1. 前沿 LLM

| 优先级 | 核心入口 | 为什么读 | 最低产出 |
| --- | --- | --- | --- |
| P1 | [GPT-4 Technical Report](https://arxiv.org/abs/2303.08774) | 理解闭源模型报告公开了哪些能力、安全与扩展证据，又隐去了哪些训练细节。 | “公开证据 / 未公开信息 / 仍需自测”三栏表。 |
| P1 | [Claude 3 Model Card](https://assets.anthropic.com/m/61e7d27f8c8f5919/original/Claude-3-Model-Card.pdf) | 学会在能力、速度、成本和安全之间选择模型层级。 | 三类任务的模型选择矩阵。 |
| P1 | [The Llama 3 Herd of Models](https://arxiv.org/abs/2407.21783) | 理解开放模型从数据、预训练、后训练到安全评测的完整栈。 | 模型生命周期图和可控制环节。 |
| P0 | [DeepSeek-R1](https://arxiv.org/abs/2501.12948) | 理解强化学习、冷启动数据、蒸馏与推理行为之间的关系。 | 十道任务的直接回答与推理模式对照。 |
| P2 | [LLM Post-Training](https://www.youtube.com/watch?v=XCgWoLu-zK8) | 区分 SFT、偏好优化与强化学习的目标和代价。 | 一页后训练方法对照表。 |

## 2. 基准与评测

| 优先级 | 核心入口 | 为什么读 | 最低产出 |
| --- | --- | --- | --- |
| P1 | [MMLU](https://arxiv.org/abs/2009.03300) | 认识通用知识基准的价值、饱和和数据污染边界。 | 一个公开指标与三个产品盲区。 |
| P1 | [Michelangelo / MRCR](https://arxiv.org/abs/2409.12640) | 长上下文不只是找针，还要测试结构、多跳关系与干扰。 | 五个跨文档多跳问题。 |
| P2 | [MATH](https://arxiv.org/abs/2103.03874) | 区分最终答案正确和推理过程可靠。 | 答案、步骤、自检三维评分规程。 |
| P0 | [IFEval](https://arxiv.org/abs/2311.07911) | 把格式、长度和关键词约束变成可自动检查的评测。 | 十条知识助手自动验收规则。 |
| P2 | [ARC-AGI](https://arcprize.org/arc-agi) | 区分知识记忆与面对陌生规则时的归纳迁移。 | 三个陌生规则任务的假设修正记录。 |

## 3. 提示词与上下文

| 优先级 | 核心入口 | 为什么读 | 最低产出 |
| --- | --- | --- | --- |
| P0 | [The Prompt Report](https://arxiv.org/abs/2406.06608) | 用统一分类理解提示技巧，不再收藏零散“咒语”。 | 提示技巧基线、变化、收益和回归表。 |
| P1 | [Chain-of-Thought](https://arxiv.org/abs/2201.11903) | 判断中间推理何时提升多步任务，何时只增加成本。 | 直接、分步、工具辅助三方案对照。 |
| P2 | [Tree of Thoughts](https://arxiv.org/abs/2305.10601) | 理解候选搜索、评价和回溯适合哪些规划任务。 | 单路径与三候选方案的成功率和调用数。 |
| P2 | [Prompt Tuning](https://aclanthology.org/2021.emnlp-main.243/) | 理解可学习软提示与人工文字提示的边界。 | 是否值得训练适配的判断条件。 |
| P0 | [Automatic Prompt Engineering](https://arxiv.org/abs/2211.01910) | 自动生成提示必须由稳定评测集选择，否则只是追逐噪声。 | 五个候选提示的固定评测选优。 |

## 4. RAG 与检索

| 优先级 | 核心入口 | 为什么读 | 最低产出 |
| --- | --- | --- | --- |
| P0 | [Introduction to Information Retrieval](https://nlp.stanford.edu/IR-book/information-retrieval-book.html) | RAG 首先是召回、排序和评价问题。 | 十个问题的 Recall@5 与 MRR 基线。 |
| P0 | [Original RAG](https://arxiv.org/abs/2005.11401) | 理解参数记忆与可更新外部证据如何结合。 | 查询到引用的数据流与失败点。 |
| P1 | [MTEB](https://arxiv.org/abs/2210.07316) | embedding 排名不能替代中文、专名与私有语料测试。 | 关键词、向量、混合检索对照。 |
| P1 | [GraphRAG](https://arxiv.org/abs/2404.16130) | 判断全局关系问题是否真的值得承担构图与维护成本。 | 五个普通 RAG 失败的全局问题。 |
| P0 | [RAGAS](https://arxiv.org/abs/2309.15217) | 分开定位上下文相关性、答案忠实度与回答相关性。 | 三十道题的召回、忠实、引用评分。 |

## 5. 智能体

| 优先级 | 核心入口 | 为什么读 | 最低产出 |
| --- | --- | --- | --- |
| P0 | [SWE-bench](https://arxiv.org/abs/2310.06770) | 真实仓库任务比孤立代码生成更接近智能体的端到端能力。 | 五个仓库任务的步骤和人工干预记录。 |
| P0 | [ReAct](https://arxiv.org/abs/2210.03629) | 理解推理、行动和工具观察的基本循环。 | 一个只读工具的三步可观测流程。 |
| P1 | [MemGPT](https://arxiv.org/abs/2310.08560) | 把有限上下文视为工作内存，设计长期记忆的写入与纠错。 | 会话、长期记忆、归档三层规则。 |
| P2 | [Voyager](https://arxiv.org/abs/2305.16291) | 理解自动课程、技能库和环境反馈如何支持持续学习。 | 三项可复用技能的输入、输出和失败条件。 |
| P0 | [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | 优先使用链式、路由、并行、协调者和评估器等简单模式。 | 删除一个无法证明价值的自主循环。 |

## 6. 代码生成

| 优先级 | 核心入口 | 为什么读 | 最低产出 |
| --- | --- | --- | --- |
| P1 | [The Stack](https://arxiv.org/abs/2211.15533) | 代码数据的许可、去重、治理和退出机制会影响能力与风险。 | 一张代码语料数据卡。 |
| P1 | [Qwen2.5-Coder](https://arxiv.org/abs/2409.12186) | 从训练目标和任务覆盖理解开放代码模型，不只看单项分数。 | 三个仓库任务的模型对照。 |
| P1 | [Codex / HumanEval](https://arxiv.org/abs/2107.03374) | 理解 pass@k 和测试驱动的代码评测，同时认识其短任务边界。 | 五个函数任务的隐藏测试。 |
| P0 | [AlphaCodium](https://arxiv.org/abs/2401.08500) | 从单次提示升级到理解、测试、实现、运行和修复的反馈流程。 | 一次五步代码生成工作流。 |
| P0 | [CriticGPT 官方说明](https://openai.com/index/finding-gpt4s-mistakes-with-gpt-4/) / [论文](https://cdn.openai.com/llm-critics-help-catch-llm-bugs-paper.pdf) | 模型批评器能扩大审查覆盖，但也会生成无依据问题。 | 十个补丁的人、模型、人机结合审查对照。 |

## 7. 视觉

| 优先级 | 核心入口 | 为什么读 | 最低产出 |
| --- | --- | --- | --- |
| P2 | [YOLO](https://arxiv.org/abs/1506.02640) | 区分实时目标检测与泛化图像描述任务。 | 类别、业务错误和延迟预算。 |
| P1 | [CLIP](https://arxiv.org/abs/2103.00020) | 理解图文共享表示、零样本迁移及空间和计数边界。 | 自有图片集的语义检索测试。 |
| P0 | [MMVP](https://arxiv.org/abs/2401.06209) | 用成对反例识别语言先验掩盖的视觉缺陷。 | 十组成对图片的视觉依据测试。 |
| P1 | [SAM 2](https://arxiv.org/abs/2408.00714) | 理解提示式图像与视频分割，以及遮挡和漂移风险。 | 图片与视频的可用率和修正次数。 |
| P2 | [Chameleon](https://arxiv.org/abs/2405.09818) | 理解多模态早期融合与后期融合的架构差异。 | 两类融合方案的数据流对照图。 |

## 8. 语音

| 优先级 | 核心入口 | 为什么读 | 最低产出 |
| --- | --- | --- | --- |
| P0 | [Whisper](https://arxiv.org/abs/2212.04356) | 理解大规模弱监督带来的跨语言和噪声鲁棒性。 | 十分钟真实录音集及关键字段正确率。 |
| P1 | [AudioPaLM](https://arxiv.org/abs/2306.12925) | 理解文本语言能力如何迁移到语音理解与生成。 | 识别、翻译、声音保持三组指标。 |
| P2 | [NaturalSpeech](https://arxiv.org/abs/2205.04421) | 学会用统计意义上的主观评测判断 TTS 质量。 | 二十句盲听测试。 |
| P0 | [Moshi](https://arxiv.org/abs/2410.00037) | 理解全双工语音、低延迟、重叠说话和打断。 | 首字延迟、打断、重叠和恢复测试。 |
| P1 | [Realtime API: The Missing Manual](https://www.latent.space/p/realtime-api) | 从事件协议、流式音频和会话状态理解实时语音工程。 | 客户端到工具调用的事件时序图。 |

## 9. 图像与视频生成

| 优先级 | 核心入口 | 为什么读 | 最低产出 |
| --- | --- | --- | --- |
| P0 | [Latent Diffusion](https://arxiv.org/abs/2112.10752) | 理解潜空间扩散为何降低高分辨率生成成本。 | VAE、潜变量、去噪和条件编码作用图。 |
| P1 | [DALL-E 2](https://arxiv.org/abs/2204.06125) | 理解文本语义表示如何连接图像生成和编辑。 | 语义、构图、文字、编辑四维测试。 |
| P1 | [Imagen](https://arxiv.org/abs/2205.11487) | 理解强文本编码器对图文一致性的贡献。 | 组合关系、数量和否定提示集。 |
| P1 | [Consistency Models](https://arxiv.org/abs/2303.01469) | 理解一步或少步生成的速度与质量权衡。 | 不同采样步数的时延与质量表。 |
| P2 | [Sora](https://openai.com/index/sora/) | 关注视频的时间一致性、物理错误与可控编辑，而非演示效果。 | 五段视频的连续性与物理评分表。 |

## 10. 微调

| 优先级 | 核心入口 | 为什么读 | 最低产出 |
| --- | --- | --- | --- |
| P0 | [LoRA](https://arxiv.org/abs/2106.09685) / [QLoRA](https://arxiv.org/abs/2305.14314) | 理解低秩适配和量化如何降低训练成本，以及它们不能解决的数据问题。 | 样本、显存、成本与基线估算。 |
| P1 | [DPO](https://arxiv.org/abs/2305.18290) | 理解如何直接使用偏好对优化模型及其数据依赖。 | 二十组一致、可解释的偏好对。 |
| P2 | [ReFT](https://arxiv.org/abs/2404.03592) | 认识通过干预隐藏表示进行参数高效适配的路径。 | LoRA 与 ReFT 对照实验设计。 |
| P1 | [Orca-AgentInstruct](https://www.microsoft.com/en-us/research/blog/orca-agentinstruct-agentic-flows-can-be-effective-synthetic-data-generators/) | 合成数据的价值取决于任务设计、验证、去重和人工抽检。 | 五十条候选数据的三道质量门。 |
| P1 | [Let's Verify Step by Step](https://arxiv.org/abs/2305.20050) | 理解过程监督与结果监督的差异和成本。 | 十个任务的结果分、步骤分和不一致分析。 |

已完成精读：[QLoRA：在有限显存下进行参数高效微调](01-qlora-efficient-finetuning-study.md)。笔记包含技术机制、数据与评测结论、论文边界，以及面向本机 RTX 4090 24GB 的最小对照实验。

## 精读模板

```markdown
## 研究问题

这项工作解决什么问题？现有基线为什么不够？

## 核心主张

用一句可被反驳的话表达，不复述摘要。

## 证据

- 数据与任务：
- 对照组：
- 指标：
- 关键结果：

## 边界

- 数据分布：
- 成本与延迟：
- 安全与隐私：
- 未公开信息：

## 与我的任务连接

- 可改变的当前决策：
- 半天到两天的最小实验：
- 成功或停止标准：
- 复盘日期：
```

## 推荐起步顺序

个人知识助手先读：IFEval -> 信息检索教材 -> 原始 RAG -> RAGAS -> ReAct -> Building Effective Agents -> CriticGPT。

代码与产品助手先读：SWE-bench -> AlphaCodium -> CriticGPT -> IFEval -> 自动提示工程 -> DeepSeek-R1。

多模态创作先读：CLIP -> MMVP -> Whisper -> Moshi -> Latent Diffusion -> Consistency Models。
