# MIT MAS.S60 How2AI Spring 2025 8 周自学计划

Source: https://mit-mi.github.io/how2ai-course/spring2025/schedule/

节奏建议：每周 6-8 小时。每周至少完成 2 篇精读、2-4 篇泛读、1 个可执行输出。优先使用课程 schedule 中的 readings，不额外扩展资料，避免路线发散。

## 第 1 周：研究方法、工具链与数据/表示基础

- 学习目标：建立读论文、设实验、调模型的工作流，并理解数据/目标/表示与泛化的关系。
- 推荐阅读：
  - must-read：[Representation Learning: A Review and New Perspectives](https://arxiv.org/abs/1206.5538)
  - must-read：[A Recipe for Training Neural Networks](https://karpathy.github.io/2019/04/25/recipe/)
  - recommended：[Machine learning: Trends, Perspectives, and Prospects](https://www.science.org/doi/abs/10.1126/science.aaa8415)
  - optional：[MAS.S60 Pytorch Introduction](https://colab.research.google.com/drive/1SoTu6gvYcLNDqPwNPTWmsSYF-l-UfHPx?usp=sharing)
  - recommended：[Learning the Bitter Lesson](https://arxiv.org/pdf/2410.09649)
  - recommended：[Unifying Grokking and Double Descent](https://arxiv.org/pdf/2303.06173)
  - recommended：[Generalization in Neural Networks](https://arxiv.org/pdf/2209.01610)
  - recommended：[Textbooks are all you Need](https://arxiv.org/pdf/2306.11644)
- 本周输出：搭建一个最小 PyTorch/Hugging Face 训练模板，记录 overfit small batch、学习率扫描、数据检查三类 debug 结果。
- 检查点：能用自己的话解释本周主题在“数据 -> 表示 -> 架构 -> 多模态/大模型 -> 生成/agent”路线中的位置。

## 第 2 周：模型架构与结构归纳偏置

- 学习目标：理解 Transformer、ViT、Deep Sets、GNN/GAT 如何把不同结构数据 token 化或结构化。
- 推荐阅读：
  - must-read：[Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478)
  - must-read：[An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale](https://arxiv.org/abs/2010.11929)
  - must-read：[Attention Is All You Need](https://arxiv.org/abs/1706.03762)
  - must-read：[Deep Sets](https://arxiv.org/abs/1703.06114)
  - must-read：[Graph Attention Networks](https://arxiv.org/abs/1710.10903)
  - must-read：[Inductive Representation Learning on Large Graphs](https://arxiv.org/abs/1706.02216)
  - recommended：[Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473)
  - recommended：[Scaling Laws for Generative Mixed-Modal Models](https://arxiv.org/abs/2301.03728)
- 本周输出：选择一个小数据集，比较 CNN/ViT 或 Deep Sets/MLP 的结构假设差异。
- 检查点：能用自己的话解释本周主题在“数据 -> 表示 -> 架构 -> 多模态/大模型 -> 生成/agent”路线中的位置。

## 第 3 周：多模态 alignment

- 学习目标：掌握 contrastive alignment、image-text relation 与共享表示空间的基本问题。
- 推荐阅读：
  - must-read：[Foundations and Trends in Multimodal Machine Learning: Principles, Challenges, and Open Questions](https://arxiv.org/abs/2209.03430)
  - must-read：[Multimodal Machine Learning: A Survey and Taxonomy](https://arxiv.org/abs/1705.09406)
  - must-read：[What Makes for Good Views for Contrastive Learning?](https://arxiv.org/abs/2005.10243)
  - must-read：[Ten Myths of Multimodal Interaction](https://dl.acm.org/doi/pdf/10.1145/319382.319398)
  - must-read：[Quantifying & Modeling Multimodal Interactions: An Information Decomposition Framework](https://arxiv.org/abs/2302.12247)
  - must-read：[Does my multimodal model learn cross-modal interactions? It’s harder to tell than you might think!](https://aclanthology.org/2020.emnlp-main.62/)
  - must-read：[Learning Transferable Visual Models From Natural Language Supervision?](https://arxiv.org/pdf/2103.00020)
  - recommended：[Characterization and classification of semantic image-text relations](https://link.springer.com/article/10.1007/s13735-019-00187-6)
- 本周输出：做一个图文检索或图像-文本 embedding 可视化实验，分析正负样本和 view 设计。
- 检查点：能用自己的话解释本周主题在“数据 -> 表示 -> 架构 -> 多模态/大模型 -> 生成/agent”路线中的位置。

## 第 4 周：多模态 interaction、fusion 与 transfer

- 学习目标：区分 alignment、fusion、translation/transfer 的适用场景，并学会设计多模态 ablation。
- 推荐阅读：
  - must-read：[Foundations and Trends in Multimodal Machine Learning: Principles, Challenges, and Open Questions](https://arxiv.org/abs/2209.03430)
  - must-read：[Multimodal Machine Learning: A Survey and Taxonomy](https://arxiv.org/abs/1705.09406)
  - must-read：[What Makes for Good Views for Contrastive Learning?](https://arxiv.org/abs/2005.10243)
  - must-read：[Ten Myths of Multimodal Interaction](https://dl.acm.org/doi/pdf/10.1145/319382.319398)
  - must-read：[Quantifying & Modeling Multimodal Interactions: An Information Decomposition Framework](https://arxiv.org/abs/2302.12247)
  - must-read：[Does my multimodal model learn cross-modal interactions? It’s harder to tell than you might think!](https://aclanthology.org/2020.emnlp-main.62/)
  - must-read：[Learning Transferable Visual Models From Natural Language Supervision?](https://arxiv.org/pdf/2103.00020)
  - recommended：[Characterization and classification of semantic image-text relations](https://link.springer.com/article/10.1007/s13735-019-00187-6)
- 本周输出：构造单模态 baseline、late fusion、cross-attention fusion 三组实验，检查模型是否真的使用跨模态信息。
- 检查点：能用自己的话解释本周主题在“数据 -> 表示 -> 架构 -> 多模态/大模型 -> 生成/agent”路线中的位置。

## 第 5 周：Large foundation models 工程

- 学习目标：理解 scaling laws、instruction tuning、LoRA、quantization、MoE 与视觉指令微调。
- 推荐阅读：
  - must-read：[Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556)
  - must-read：[LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
  - must-read：[Masked Autoencoders Are Scalable Vision Learners](https://arxiv.org/abs/2111.06377)
  - recommended：[Fine-tuning a Code LLM on Custom Code on a single GPU](https://colab.research.google.com/drive/1EDsjYRrAiujUew0GRJ_hyVoNMsSDnlnx?usp=sharing)
  - recommended：[When and why vision-language models behave like bags-of-words, and what to do about it?](https://arxiv.org/abs/2210.01936)
  - recommended：[DreamLLM: Synergistic Multimodal Comprehension and Creation](https://arxiv.org/abs/2309.11499)
  - recommended：[Kosmos-2: Grounding Multimodal Large Language Models to the World](https://arxiv.org/abs/2306.14824)
  - recommended：[MM1: Methods, Analysis and Insights from Multimodal LLM Pre-training](https://link.springer.com/chapter/10.1007/978-3-031-73397-0_18)
- 本周输出：在小模型上做 LoRA 微调，记录 rank、显存、吞吐、验证集指标和人工样例质量。
- 检查点：能用自己的话解释本周主题在“数据 -> 表示 -> 架构 -> 多模态/大模型 -> 生成/agent”路线中的位置。

## 第 6 周：Large multimodal models

- 学习目标：理解把 LLM 扩展到视觉/多模态的架构选择：projector、adapter、early fusion、grounding、any-to-any。
- 推荐阅读：
  - must-read：[Foundations and Trends in Multimodal Machine Learning: Principles, Challenges, and Open Questions](https://arxiv.org/abs/2209.03430)
  - must-read：[Multimodal Machine Learning: A Survey and Taxonomy](https://arxiv.org/abs/1705.09406)
  - must-read：[What Makes for Good Views for Contrastive Learning?](https://arxiv.org/abs/2005.10243)
  - must-read：[Ten Myths of Multimodal Interaction](https://dl.acm.org/doi/pdf/10.1145/319382.319398)
  - must-read：[Quantifying & Modeling Multimodal Interactions: An Information Decomposition Framework](https://arxiv.org/abs/2302.12247)
  - must-read：[Does my multimodal model learn cross-modal interactions? It’s harder to tell than you might think!](https://aclanthology.org/2020.emnlp-main.62/)
  - must-read：[Learning Transferable Visual Models From Natural Language Supervision?](https://arxiv.org/pdf/2103.00020)
  - must-read：[Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556)
- 本周输出：写一页架构对比表：LLaVA/PaLI/Kosmos/Chameleon/MM1/NExT-GPT 各自的输入输出、融合位置和训练目标。
- 检查点：能用自己的话解释本周主题在“数据 -> 表示 -> 架构 -> 多模态/大模型 -> 生成/agent”路线中的位置。

## 第 7 周：Generative models 与 AIGC

- 学习目标：理解 DiT、latent flow matching、rectified flow、媒体生成模型的主线和工程权衡。
- 推荐阅读：
  - must-read：[Scalable Diffusion Models with Transformers](https://arxiv.org/abs/2212.09748)
  - must-read：[Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747)
  - recommended：[Flow Matching in Latent Space](https://arxiv.org/abs/2307.08698)
  - recommended：[Scaling Rectified Flow Transformers for High-Resolution Image Synthesis](https://arxiv.org/abs/2403.03206)
  - recommended：[Movie Gen: A Cast of Media Foundation Models](https://arxiv.org/abs/2410.13720)
  - recommended：[Large Language Diffusion Models](https://arxiv.org/pdf/2502.09992)
  - recommended：[Compositional Generative Modeling: A Single Model is Not All You Need](https://arxiv.org/pdf/2402.01103)
  - recommended：[Flow Matching Guide and Code](https://arxiv.org/abs/2412.06264)
- 本周输出：复现一个 toy diffusion 或 flow matching demo，比较采样步数、训练稳定性和条件控制方式。
- 检查点：能用自己的话解释本周主题在“数据 -> 表示 -> 架构 -> 多模态/大模型 -> 生成/agent”路线中的位置。

## 第 8 周：Interactive agents、HAI 与总复盘

- 学习目标：理解偏好优化、reasoning RL、reward failure、multimodal agent evaluation 和 Human-AI design guidelines。
- 推荐阅读：
  - must-read：[Deep reinforcement learning from human preferences](https://arxiv.org/abs/1706.03741)
  - must-read：[Direct preference optimization: Your language model is secretly a reward model](https://arxiv.org/abs/2305.18290)
  - must-read：[Guidelines for Human-AI Interaction](https://dl.acm.org/doi/abs/10.1145/3290605.3300233)
  - recommended：[Deepseek-r1: Incentivizing reasoning capability in LLMs via reinforcement learning](https://arxiv.org/abs/2501.12948)
  - recommended：[Faulty reward functions in the wild](https://openai.com/index/faulty-reward-functions/)
  - recommended：[Interactive Sketchpad: A Multimodal Tutoring System for Collaborative, Visual Problem-Solving](https://arxiv.org/abs/2503.16434)
  - recommended：[VideoWebArena: Evaluating Multimodal Agents on Video Understanding Web Tasks](https://arxiv.org/abs/2410.19100)
  - recommended：[OpenVLA: An Open-Source Vision-Language-Action Model](https://arxiv.org/abs/2406.09246)
- 本周输出：输出最终 synthesis：选择一个 AI/CV/AIGC 项目，写清数据、模型、训练、评测、交互和安全闭环。
- 检查点：能用自己的话解释本周主题在“数据 -> 表示 -> 架构 -> 多模态/大模型 -> 生成/agent”路线中的位置。

## 最终交付建议

- 一份 3-5 页技术综述：明确主线、关键论文、工程影响和未解决问题。
- 一个最小 reproduction repo：包含 README、数据说明、训练脚本、评测脚本、失败案例和 ablation。
- 一张模型设计决策表：数据、目标、backbone、预训练/微调、部署、评测、安全风险。
