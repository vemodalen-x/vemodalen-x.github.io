---
title: LLMs-from-scratch：从文本数据到指令微调的可执行学习路线
date: 2026-07-15
type: repository-study
status: active
source: https://github.com/rasbt/LLMs-from-scratch
summary: 将 Sebastian Raschka 的 GPT-2 风格教学仓库整理为一条可运行、可检查、可迁移的 LLM 学习主线，重点理解数据、注意力、模型、损失、生成和微调之间的因果关系。
tags:
  - LLM
  - GPT
  - Transformer
  - PyTorch
  - 注意力机制
  - 预训练
  - 指令微调
  - 从零实现
  - AI工程
---

# LLMs-from-scratch：从文本数据到指令微调的可执行学习路线

## 一句话结论

这个仓库最有价值的地方不是提供另一个可直接部署的聊天模型，而是让人亲手打通一条完整因果链：**文本怎样变成训练样本，样本怎样经过因果注意力和 Transformer block 产生词表 logits，交叉熵怎样更新参数，预训练模型又怎样被改造成分类器和指令模型。**

学习完成的标准不是“运行过七个 Notebook”，而是能在不看答案时解释每个张量的形状、信息边界、损失目标和失败原因，并能独立修改一个组件后用实验判断结果。

## 来源与定位

- 主仓库：[rasbt/LLMs-from-scratch](https://github.com/rasbt/LLMs-from-scratch)
- 配套书：Sebastian Raschka, *Build a Large Language Model (From Scratch)*, Manning, 2024
- 许可证：Apache License 2.0
- 主线：用 PyTorch 实现、预训练并微调 GPT-2 风格语言模型
- 扩展：BPE、不同注意力实现、KV Cache、现代模型架构、LoRA、DPO、数据生成和模型评测等
- 阅读快照：2026-07-15。仓库仍在更新，现代架构和依赖版本使用前应回到主仓库核验。

仓库当前有很高的 GitHub 关注度，但 Star 只能说明传播和社区兴趣，不能替代代码审计、实验复现或对自己目标的适配判断。

## “From Scratch”到底意味着什么

这里的“从零”是**不依赖 Transformers 等高级 LLM 框架来隐藏模型主干**，而不是不用任何库：

- 使用 PyTorch 提供张量、自动微分、优化器和神经网络基础组件。
- 主线使用 `tiktoken` 的 GPT-2 tokenizer；真正从头训练 BPE tokenizer 属于第 2 章扩展材料。
- 使用 NumPy、Pandas、Matplotlib、Jupyter 等通用工具。
- 第 5 章可加载公开 GPT-2 权重，相关旧 checkpoint 转换代码使用 TensorFlow。

因此，这个项目适合建立底层心智模型，不适合证明“完全不借助生态也能重建现代大模型”。

## 一条完整计算链

```text
原始文本
  ↓ tokenizer
token ids
  ↓ 滑动窗口；target 比 input 左移一个 token
(input_ids, target_ids)
  ↓ token embedding + position embedding
序列表示 [batch, tokens, embedding]
  ↓ N 个 Transformer blocks
Pre-LayerNorm
  → masked multi-head self-attention
  → residual connection
  → Pre-LayerNorm
  → feed-forward network
  → residual connection
  ↓ final norm + output projection
每个位置的 vocabulary logits
  ↓ cross entropy against next token
训练损失
  ↓ backward + AdamW
参数更新
  ↓ autoregressive generation
下一个 token 追加回上下文，循环生成
```

这条链必须从形状、信息流和优化目标三个角度同时理解。

## 七章主线与最低学习产出

| 阶段 | 核心问题 | 关键代码对象 | 最低产出 | 必须检查的事实 |
| --- | --- | --- | --- | --- |
| Ch 1 概览 | LLM 开发由哪些阶段构成？ | 无主代码 | 画出预训练、微调、评测关系图 | 教学模型不等于产品级 ChatGPT |
| Ch 2 文本数据 | 文本怎样变成监督样本？ | tokenizer、`GPTDatasetV1`、DataLoader | 打印一个 batch 的 input/target 对齐表 | target 必须是 input 的下一 token |
| Ch 3 注意力 | token 怎样只使用过去信息？ | Q/K/V、causal mask、multi-head attention | 手算一个小矩阵并核对 PyTorch 结果 | 未来位置权重为 0，维度可还原 |
| Ch 4 GPT 模型 | 组件怎样组成 decoder-only 模型？ | LayerNorm、GELU、FFN、residual、`GPTModel` | 输出每层张量形状和参数量 | 残差两侧形状一致，logits 覆盖词表 |
| Ch 5 预训练 | 下一词预测怎样变成可学习目标？ | cross entropy、AdamW、train/val loss、generation | 在小数据上完成训练、验证和采样 | 训练损失下降不等于泛化或事实正确 |
| Ch 6 分类微调 | 如何把生成模型改造成判别任务？ | 标签数据、分类头、冻结/解冻层 | 垃圾信息分类器与独立测试集 | 类别分布、数据泄漏和冻结策略 |
| Ch 7 指令微调 | 如何让模型学习指令到回答的映射？ | 指令模板、padding mask、response loss、评测 | 完成一组留出指令的生成与评分 | padding 不应贡献损失，格式分不等于内容分 |

附录承担四种补充：PyTorch 基础、参考资料、练习答案、训练循环增强和 LoRA。先完成主线，再按真实问题进入附录和 bonus。

## 关键理解一：语言模型训练是大规模“下一类分类”

对长度为 `T` 的 token 序列，模型在每个位置输出一个覆盖整个词表的 logits 向量，目标是预测下一个 token。代码把 `[batch, tokens, vocab]` 的 logits 和 `[batch, tokens]` 的目标展平后计算交叉熵。

重要推论：

- 一个训练窗口同时产生多个监督位置，不是一段文本只产生一个标签。
- 困惑度来自平均负对数似然，但低损失不自动意味着回答真实、安全或符合任务格式。
- 数据切分必须先于滑窗或至少按文档边界隔离，否则相邻重叠窗口会造成验证泄漏。
- “看过多少 epoch”不如“看过多少 token、验证损失怎样变化”更有解释力。

## 关键理解二：因果遮罩定义了模型允许知道什么

自注意力先将输入投影为 Query、Key、Value，通过缩放点积产生注意力分数。上三角 causal mask 把未来位置设为负无穷，softmax 后其权重为 0。

它不是性能优化，而是训练目标成立的前提。若位置 `t` 能看到目标 token `t+1`，模型可以作弊，低损失将失去意义。

最低测试：

1. 使用 3 到 5 个 token 的可读小矩阵。
2. 输出 mask 前后的 attention scores。
3. 断言所有未来位置权重接近 0。
4. 改变未来 token，确认较早位置的输出不受影响。

## 关键理解三：多头注意力是多个表示子空间，不是多个模型

代码将投影后的 embedding 维度拆为 `num_heads × head_dim`，各头独立计算注意力，再拼接并通过输出投影。头数变化必须保持总输出维度和残差路径兼容。

需要区分：

- 多头注意力增加不同关系模式的表示机会。
- 它不保证每个头都有清晰、稳定、可解释的语言功能。
- 头数更多不等于模型必然更强；参数、计算、数据和训练配置共同决定结果。

## 关键理解四：残差、归一化和前馈层共同维持深层训练

仓库主线采用 GPT-2 风格的 pre-norm block：先归一化，再进入注意力或前馈层，最后与 shortcut 相加。前馈层对每个 token 独立地做非线性变换，注意力负责 token 间的信息混合。

一个实用的调试顺序：

```text
形状是否一致
  → 数值是否 finite
  → mask 是否正确
  → 单 batch 能否过拟合
  → 训练/验证损失是否分离
  → 生成是否受采样参数影响
```

先证明计算图正确，再调学习率、深度或采样温度。

## 关键理解五：训练和生成是两套不同但相连的过程

训练通常一次并行计算整个序列的 next-token loss；生成则循环执行：裁剪到 context window、取最后位置 logits、选择下一个 token、追加到序列。

仓库从 greedy decoding 逐步加入 temperature 和 top-k：

- `temperature = 0` 或 greedy 较确定，但可能重复和僵化。
- 较高 temperature 增加随机性，也增加失真风险。
- top-k 限制候选集合，减少采到极低概率 token 的机会。
- 采样质量不能反推训练质量；必须固定随机种子和输入做可比实验。

## 关键理解六：预训练、分类微调和指令微调改变的是任务接口

| 阶段 | 输入 | 目标 | 主要变化 |
| --- | --- | --- | --- |
| 预训练 | 自然文本窗口 | 每个位置的下一 token | 学习一般语言分布 |
| 分类微调 | 文本 | 离散类别 | 更换或使用分类输出，选择冻结层 |
| 指令微调 | instruction + optional input | response tokens | 用格式化样本学习任务遵循 |

指令微调的数据整理尤其重要。仓库的 collate 函数负责动态 padding、输入目标错位和将多余 padding 标成 `ignore_index`。一个 padding mask 错误就可能让模型大量学习“如何预测 padding”。

## 关键理解七：加载公开权重也是一次架构审计

第 5 章把公开 GPT-2 checkpoint 中的权重逐层映射到手写模型。只有层数、embedding 维度、头数、Q/K/V 排列、bias 和权重转置规则一致，形状才能匹配。

这一步的价值是验证“我写的模块在语义和形状上是否真的是 GPT-2”，不只是节约训练时间。任何 shape mismatch 都应追查架构含义，而不是直接 reshape 到能运行。

## 主线没有覆盖的现代生产问题

核心章节刻意保持简洁，因此不能把完成主线等同于掌握现代 LLM 全栈：

- 主模型是 GPT-2 风格，不是当前主流聊天模型的完整架构。
- 核心没有系统展开 RoPE、RMSNorm、SwiGLU、GQA/MQA、KV Cache、FlashAttention、MoE 和分布式训练。
- 小数据教学训练不覆盖大规模数据清洗、去重、许可、污染和数据治理。
- 指令微调不等于完整对齐；安全评测、偏好优化、红队和上线监控仍是独立工作。
- 单机 Notebook 不覆盖容错、检查点分片、推理服务、吞吐、延迟和成本治理。

仓库 bonus 已为 KV Cache、现代架构、LoRA、DPO、数据生成和评测提供入口，但应该在主线跑通后按瓶颈选择，不要一开始全部展开。

## 作者建议的学习循环

作者建议按章节顺序学习，因为后续章节依赖前文。每章采用五步：

1. 第一遍只读全貌，不运行代码。
2. 第二遍亲手输入并运行代码，记录版本、随机种子和设备差异。
3. 先独立完成练习，再查看答案。
4. 回顾疑点并将自己的解释写入笔记。
5. 把一个概念用于小项目或替换实验。

我在此基础上增加一条验收规则：**每章必须留下一个可运行产物、一个断言或对照实验、一个仍无法解释的问题。**

## 面向本机的四周路线

本机已核验：Windows、Python 3.10.12、PyTorch 2.8.0 + CUDA 12.8、RTX 4090 24GB。Python 与 GPU 足以完成主线；当前 Miniconda 环境缺少 `tiktoken` 和 JupyterLab，因此正式运行应使用独立环境，不直接污染现有知识库运行环境。

### 第 1 周：数据与注意力

- Ch 1-2：完成 tokenizer、滑窗数据集和 input/target 对齐检查。
- Ch 3：从单头写到多头，加入“未来 token 不影响过去输出”的测试。
- 产物：`tensor-shape-ledger.md`，记录每一步形状、含义和断言。

### 第 2 周：模型与预训练

- Ch 4：实现 GPTModel，计算参数量和单次 forward 的显存。
- Ch 5：先让极小模型过拟合一个 batch，再运行完整小语料训练。
- 对比 greedy、temperature 和 top-k 的可复现实验。
- 产物：训练/验证 loss 曲线、三个固定 prompt 的生成对照。

### 第 3 周：任务微调

- Ch 6：实现分类微调，对比只训输出层、解冻后层和全量微调。
- Ch 7：检查 instruction template、padding、ignore index 和留出集。
- 产物：同一基础权重在分类与生成任务上的接口对照表。

### 第 4 周：迁移到个人知识库任务

- 选择一个窄任务，例如“把知识卡分到六个专题”，不要训练万能助手。
- 使用公开或自己有权使用的数据，保留独立测试集。
- 对比规则基线、传统分类器、GPT 微调；记录质量、延迟和维护成本。
- 只选择一个扩展实验：LoRA、KV Cache 或 RMSNorm vs LayerNorm。
- 产物：一份可复现报告和继续、改变、停止决定。

## 推荐的 Windows 隔离环境

以下命令是后续运行入口，本次学习整理没有修改现有 Python 环境：

```powershell
Set-Location 'C:\Users\User\Documents'
git clone --depth 1 https://github.com/rasbt/LLMs-from-scratch.git
Set-Location '.\LLMs-from-scratch'

& 'D:\Env\miniconda\Scripts\conda.exe' create -n llms-scratch python=3.10 -y
& 'D:\Env\miniconda\Scripts\conda.exe' run -n llms-scratch python -m pip install -r requirements.txt
& 'D:\Env\miniconda\Scripts\conda.exe' run -n llms-scratch python setup\02_installing-python-libraries\python_environment_check.py
& 'D:\Env\miniconda\Scripts\conda.exe' run -n llms-scratch jupyter lab
```

注意：仓库依赖会继续更新。若 CUDA PyTorch 安装或 GPU 检测失败，应先根据当时的 PyTorch 官方安装方式修正环境，再运行章节代码；不要为了“环境检查全绿”随意覆盖当前可工作的 CUDA 环境。

## 与现有知识库的连接

- **输出式学习**：每章以可运行工件和断言验收，不以观看或收藏计数。
- **任务契约**：理解模型底层后，仍要先定义真实任务、输入、输出、质量和失败处理。
- **私有评测**：loss、perplexity 和公开基准不能替代自己的分类或指令留出集。
- **QLoRA**：本仓库先建立全量训练、LoRA 和模型权重的底层概念，再理解 QLoRA 如何分离存储精度、计算精度和可训练参数。
- **RAG**：模型内部原理不会改变知识更新问题；需要最新事实和引用时仍应使用检索。
- **代码工程**：Notebook 能运行只是起点，还需要测试、版本记录、数据许可和回滚。

## 复习卡

1. 为什么 input 和 target 只相差一个 token？
2. causal mask 若写反，会出现什么“虚假的好结果”？
3. Q、K、V 的张量形状如何从单头变为多头再合并？
4. attention 和 feed-forward 分别负责哪一类信息变换？
5. 为什么训练损失下降不能证明生成内容真实？
6. greedy、temperature 和 top-k 分别改变什么？
7. padding token 为什么要在 target 中使用 `ignore_index`？
8. 加载 GPT-2 权重时，shape mismatch 可能暴露哪些架构差异？
9. “from scratch”在这个仓库里包含和不包含什么？
10. 哪些现代生产问题不应从这个教学模型直接外推？

## 最终判断

这是一个优秀的 LLM 底层学习主干：范围清楚、章节依赖合理、代码足够小，且从模型结构一直连接到微调。正确用法是顺序打通主线、给关键不变量写测试，再从 bonus 中选择一个与真实问题相关的扩展。它能显著提高模型调试和技术判断能力，但不会自动产出有竞争力的通用模型，也不能替代数据、评测、安全和部署工程。

