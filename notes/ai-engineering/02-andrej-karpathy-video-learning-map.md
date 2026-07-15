---
title: Andrej Karpathy 视频学习地图：从反向传播到 LLM 工具链
date: 2026-07-15
type: channel-study
status: active
source: https://www.youtube.com/@AndrejKarpathy/videos
summary: 将 Andrej Karpathy 频道当前 17 个公开视频整理为神经网络基础、GPT 训练工程、LLM 系统与应用三条主线，并为 12 个长课程建立依赖顺序、实践产物和复习问题。
tags:
  - AndrejKarpathy
  - ZeroToHero
  - 神经网络
  - 反向传播
  - 语言模型
  - GPT
  - Tokenizer
  - LLM工程
  - AI工具
---

# Andrej Karpathy 视频学习地图：从反向传播到 LLM 工具链

## 一句话结论

这个频道提供了一条少见的完整学习链：**先用标量计算图理解反向传播，再用字符语言模型学习概率、张量、数据集和训练诊断，接着从注意力搭出 GPT、从 Unicode 搭出 BPE Tokenizer、从空文件复现 GPT-2，最后把模型放回预训练、后训练、推理、工具和产品生态中理解。**

正确学习方式不是按频道上传时间倒序观看，也不是把 25 小时视频当播客听完。应按概念依赖逐步手写代码，每个阶段留下可运行产物、数值断言和失败记录。

## 来源、范围与版权边界

- 频道：[Andrej Karpathy / Videos](https://www.youtube.com/@AndrejKarpathy/videos)
- 官方课程页：[Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html)
- 课程代码：[karpathy/nn-zero-to-hero](https://github.com/karpathy/nn-zero-to-hero)
- 相关代码：[micrograd](https://github.com/karpathy/micrograd)、[makemore](https://github.com/karpathy/makemore)、[nanoGPT](https://github.com/karpathy/nanoGPT)、[minbpe](https://github.com/karpathy/minbpe)、[build-nanogpt](https://github.com/karpathy/build-nanogpt)
- 目录快照：2026-07-15，共 17 个公开视频。

本笔记依据频道公开元数据、作者提供的章节目录、视频描述、官方课程页和代码仓库提炼。它不保存或镜像完整字幕，不代替观看原视频和亲手完成练习。产品名称、模型能力、价格和界面会变化，使用时需重新核验。

## 内容总览

| 主线 | 视频 | 时长 | 目标 |
| --- | ---: | ---: | --- |
| 神经网络基础 | micrograd + makemore 1-5 | 约 10.45 小时 | 建立反向传播、语言建模、训练诊断和深层网络直觉 |
| GPT 与训练工程 | GPT from scratch + Tokenizer + GPT-2 reproduction | 约 8.19 小时 | 理解 Transformer、BPE 与单机/多 GPU 训练优化 |
| LLM 系统与应用 | Intro + Deep Dive + How I use LLMs | 约 6.71 小时 | 理解预训练、后训练、推理、工具、安全与实际工作流 |
| 生成实验 | 5 个 Stable Diffusion 演示 | 约 0.55 小时 | 观察提示条件下的噪声空间插值，不作为主课程 |

12 个长课程合计约 25.35 小时。若包含暂停、手写、调试和练习，实际学习投入应按观看时长的 2 到 3 倍安排。

## 推荐顺序

```text
先看 2023 Intro 建立全貌
  ↓
micrograd：标量自动微分
  ↓
makemore 1-2：语言模型、张量、MLP、训练/验证
  ↓
makemore 3-4：激活、梯度、初始化、BatchNorm、手写反传
  ↓
makemore 5：层级上下文、WaveNet、torch.nn 工程化
  ↓
GPT from scratch：因果注意力与 Transformer
  ↓
GPT Tokenizer：Unicode、BPE、特殊 token
  ↓
GPT-2 reproduction：速度、优化、数据、分布式与评测
  ↓
2025 Deep Dive：预训练到后训练的系统心智模型
  ↓
How I use LLMs：模型、上下文、工具与多模态工作流
```

2023 年的 Intro 可先看作地图；2025 年 Deep Dive 更完整，但最好在完成 GPT 与 Tokenizer 后观看，届时许多概念不再只是名词。

## 12 个课程逐项学习

### 0. [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g)｜2023-11-23｜约 60 分钟

主题：LLM 推理与训练、助手微调、RLHF、扩展规律、工具、多模态、LLM OS、安全、越狱、提示注入和数据投毒。

最低产出：画一张“基础模型 → 助手模型 → 工具增强系统”的三层图，并把参数、上下文、工具和权限分别标出。

边界：这是 2023 年的全景讲座。产品例子和未来预测应视为历史快照，安全部分是风险地图，不是完整防护规范。

### 1. [Building micrograd](https://www.youtube.com/watch?v=VMj-3S1tku0)｜2022-08-16｜约 146 分钟

主题：导数、动态计算图、局部梯度、链式法则、反向拓扑遍历、梯度累加、神经元、MLP、损失和手写梯度下降。

最重要的理解：反向传播不是神秘的全局公式，而是每个运算保存局部导数，并沿计算图反向应用链式法则；同一节点被多次使用时，梯度必须累加而不是覆盖。

最低产出：自己实现 `Value` 的 `+`、`*`、`tanh` 和 `backward()`，用有限差分和 PyTorch 对照至少五个表达式。

### 2. [Building makemore：Bigram](https://www.youtube.com/watch?v=PaCmpygFfXo)｜2022-09-07｜约 118 分钟

主题：字符级 bigram、计数模型、采样、负对数似然、平滑、one-hot、矩阵乘法、softmax、向量化、反向传播与更新。

最重要的连接：计数模型与单层神经网络可以表达相近的条件概率问题；计数平滑和权重正则化都在抑制过度自信，但参数化方式不同。

最低产出：同时实现计数版和神经网络版 bigram，比较验证 NLL、采样结果和正则强度。

### 3. [Building makemore Part 2：MLP](https://www.youtube.com/watch?v=TCH_1BHY58I)｜2022-09-12｜约 76 分钟

主题：embedding、上下文窗口、隐藏层、交叉熵、mini-batch、学习率、train/dev/test、欠拟合与过拟合。

最低产出：先过拟合一个 batch，再比较隐藏层宽度、embedding 维度和上下文长度；所有实验使用固定数据切分和随机种子。

### 4. [Building makemore Part 3：Activations, Gradients, BatchNorm](https://www.youtube.com/watch?v=P6sfmUTpUmc)｜2022-10-04｜约 116 分钟

主题：初始损失、tanh 饱和、Kaiming 初始化、BatchNorm、激活和梯度分布、参数梯度、更新量与参数量比值。

最重要的方法：训练失败不能只看总 loss。应观察激活是否饱和、梯度是否消失或爆炸、不同层更新比例是否失衡，并检查初始 loss 是否接近可推导基线。

最低产出：为每层绘制激活分布、梯度分布和 update/data ratio，对一次错误初始化做定位和修复。

### 5. [Building makemore Part 4：Backprop Ninja](https://www.youtube.com/watch?v=q8SA3rM6ckI)｜2022-10-11｜约 115 分钟

主题：不用 `loss.backward()`，手工反传 cross entropy、线性层、tanh、BatchNorm、embedding，并与 autograd 对齐。

最低产出：每一层手写梯度，使用 `torch.allclose` 与 autograd 对照；不一致时记录最大绝对误差及出错算子。

这节不适合被动观看。价值来自亲自卡住、提出局部导数假设、再用参考结果修正。

### 6. [Building makemore Part 5：WaveNet](https://www.youtube.com/watch?v=t3YJ5hKiMQ0)｜2022-11-21｜约 56 分钟

主题：扩大上下文、层级聚合、WaveNet 式结构、`torch.nn`、BatchNorm 维度错误、实验脚手架和代码工程化。

最低产出：建立一份 tensor shape ledger，在每个层级记录输入输出形状；用断言捕获 BatchNorm 维度错误。

### 7. [Let’s build GPT from scratch](https://www.youtube.com/watch?v=kCc8FmEb1nY)｜2023-01-17｜约 116 分钟

主题：从 bigram 基线到加权聚合、自注意力、因果遮罩、位置编码、多头、前馈、残差、LayerNorm、dropout 和 GPT 预训练/微调。

核心心智模型：attention 是 token 之间按内容动态计算的通信；因果遮罩定义谁能读取谁；位置需要显式注入；Transformer block 将通信与逐 token 计算交替堆叠。

最低产出：从 bigram 开始逐次加入组件，每一步保留验证 loss；加入“未来 token 变化不影响过去输出”的测试。

### 8. [Let’s build the GPT Tokenizer](https://www.youtube.com/watch?v=zduSFxRajkE)｜2024-02-20｜约 134 分钟

主题：Unicode、UTF-8、Byte Pair Encoding、pair count/merge、encode/decode、regex 预切分、特殊 token、词表大小、多语言与多模态 tokenization。

关键判断：Tokenizer 是独立训练、独立数据和独立算法的压缩层。它改变序列长度、计算成本和模型看到的原子单位，也会制造拼写、计数、非英语文本和特殊 token 处理问题。

最低产出：用 [minbpe](https://github.com/karpathy/minbpe) 在中英混合的非敏感知识库样本上训练小词表，检查 round-trip、压缩率、中文/英文 token 比和特殊 token 权限。

### 9. [Let’s reproduce GPT-2 (124M)](https://www.youtube.com/watch?v=l8pRSuU81PU)｜2024-06-09｜约 241 分钟

主题：GPT-2 架构与公开权重、训练 loop、单 batch 过拟合、weight tying、初始化、TF32/BF16、`torch.compile`、FlashAttention、AdamW、梯度裁剪、warmup/cosine、梯度累积、DDP、FineWeb、验证和 HellaSwag。

最重要的工程结构：

```text
先证明正确
  → 过拟合单 batch
  → 建立验证与采样
  → 逐项测量性能瓶颈
  → 混合精度 / compile / FlashAttention
  → 优化器与调度器
  → 累积有效 batch
  → 多 GPU 扩展
  → 基准与失败分析
```

最低产出：在本机先做缩小版速度与正确性实验，记录每项优化前后的 tokens/sec、显存和验证 loss。不要把视频中的云端多 GPU 复现时间直接套到单张 RTX 4090。

### 10. [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI)｜2025-02-05｜约 211 分钟

主题：互联网预训练数据、tokenization、神经网络 I/O 与内部、推理、GPT-2/Llama、后训练对话数据、幻觉、工具、知识与工作记忆、自我知识、推理 token、锯齿状能力、SFT、RL、DeepSeek-R1、AlphaGo、RLHF。

最有用的系统分层：

- 参数保存从训练数据压缩出的统计模式和能力，不是可查询数据库。
- 上下文是当前任务的工作记忆，容量有限且内容可能不可信。
- 生成 token 提供串行计算轨迹，但更多 token 不保证结论正确。
- 工具负责搜索、计算和行动，需要权限、结果校验与停止条件。
- 能力呈锯齿状：某些复杂任务惊艳，某些看似简单任务失败，不能用整体“聪明程度”替代逐任务评测。

最低产出：选三个真实任务，分别判断失败来自参数知识、上下文、推理、工具还是评测，并设计对应修复，而不是统一换更大模型。

### 11. [How I use LLMs](https://www.youtube.com/watch?v=EWvNQjAaOHw)｜2025-02-27｜约 131 分钟

主题：模型与价格层级、thinking models、搜索、deep research、文件上下文、Python、数据分析与图表、Artifacts、代码工具、语音、NotebookLM、图像、视频、memory 和 custom instructions。

可迁移结论：LLM 产品应被看作“模型 + 上下文 + 工具 + 界面 + 状态”的工具箱。具体品牌会变，但选择流程可以稳定：

1. 先定义任务和风险。
2. 选择足够而非最贵的模型。
3. 提供最小充分上下文。
4. 给模型可验证的工具。
5. 对外部事实、代码和高风险动作保留检查。
6. 把成功流程固化为模板或工作流。

最低产出：对同一个知识库任务，比较纯提示、文件上下文、搜索、Python 和结构化工作流，记录质量、速度、成本与失败类型。

## 5 个 Stable Diffusion 演示

| 日期 | 视频 | 观察重点 |
| --- | --- | --- |
| 2022-08-16 | [Steam punk neural networks](https://www.youtube.com/watch?v=Jv1ayv-04H4) | 提示条件生成与噪声空间连续移动 |
| 2022-08-16 | [Blueberry spaghetti](https://www.youtube.com/watch?v=vEnetcj_728) | 单一提示下的样本空间多样性 |
| 2022-08-16 | [Tattoos](https://www.youtube.com/watch?v=sM9bozW295Q) | 输出过滤和生成内容边界 |
| 2022-08-17 | [Steampunk brains](https://www.youtube.com/watch?v=2oKjtvYslMY) | 长时间批量生成与人工选择 |
| 2022-08-19 | [Psychedelic faces](https://www.youtube.com/watch?v=kVpDARqZdrQ) | 球面插值带来的连续视觉过渡 |

这些视频可以帮助形成“生成模型在条件分布中采样”的直觉，但没有对提示遵循、身份一致性、审美质量或安全进行严格评测，不应从视觉连续性推导模型理解能力。

## 跨视频的八个核心方法

### 1. 从最小可计算对象逐层抽象

标量 `Value` → Tensor → 字符概率 → MLP → 深层网络 → attention → GPT → 训练系统。每一层都保留上一层的因果解释，只把重复计算交给更高层抽象。

### 2. 先推导可预期基线

随机分类、均匀词表和初始 NLL 都有可估计范围。初始结果偏离基线时，优先检查数据、初始化、损失和标签，而不是继续训练等待奇迹。

### 3. 先过拟合单 batch

若模型不能拟合一个极小 batch，问题通常在计算图、标签、优化器或容量。先关闭复杂正则和增强，证明端到端梯度链可用，再扩大数据。

### 4. 同时观察 loss、激活、梯度和更新比例

总 loss 是滞后且压缩的信息。激活饱和、梯度分布和 update/data ratio 能更早指出坏初始化、层间失衡和数值问题。

### 5. 手写一次，再依赖框架

手写反向传播、BPE 和 attention 不是为了永久替代成熟库，而是获得调试时能下钻的能力。理解后应回到经过测试的高性能实现。

### 6. 正确性与速度分阶段优化

先建立可复现 baseline，再逐项加入混合精度、compile、融合 kernel、梯度累积和 DDP；每次只改变一个杠杆，并同时记录吞吐、显存和质量。

### 7. 将 LLM 失败定位到正确层

缺事实看检索和上下文；逻辑链不足看任务拆分与推理预算；算术和执行看工具；格式或稳定行为看提示和微调；高风险动作看权限与人工确认。

### 8. 对“聪明”保持任务级怀疑

LLM 能力不平滑。展示样例和总体印象无法替代覆盖正常、边界、诱导和不可接受错误的私有评测集。

## 与 LLMs-from-scratch 的互补

Raschka 的 [LLMs-from-scratch 学习路线](01-llms-from-scratch-learning-path.md) 更像结构清晰的教材：从文本到预训练、分类和指令微调，适合系统完成。Karpathy 的视频更像现场推导和调试过程：它展示如何从一个最小模型逐步发现问题、看统计量、修 bug、做性能实验和形成工程直觉。

建议顺序：先用 Karpathy micrograd/makemore 建立反向传播和调试直觉，再以 Raschka 主线补齐结构化章节与微调任务；GPT-2 reproduction 作为训练工程进阶。

## 面向本机的七周学习计划

本机 RTX 4090 24GB、Python 3.10.12、PyTorch 2.8.0 + CUDA 12.8 足以完成 micrograd、makemore、tiny GPT、Tokenizer 和缩小版 GPT-2 训练。完整 GPT-2 复现的视频配置包含多 GPU 扩展，单卡应先缩小 token 预算和 batch，并实测时间与显存。

| 周 | 内容 | 验收产物 |
| --- | --- | --- |
| 1 | Intro + micrograd | 自动微分引擎；有限差分与 PyTorch 梯度测试 |
| 2 | makemore Bigram + MLP | 两种 bigram 对照；固定 train/dev/test；单 batch 过拟合 |
| 3 | 激活、梯度、BatchNorm + 手写反传 | 激活/梯度/update ratio 图；逐层梯度对照 |
| 4 | WaveNet + GPT from scratch | shape ledger；bigram 到 GPT 的逐步 loss 表 |
| 5 | GPT Tokenizer | 中英混合 BPE；round-trip、压缩率和特殊 token 测试 |
| 6 | GPT-2 reproduction | 正确性 baseline；TF32/BF16/compile/FlashAttention 对照 |
| 7 | Deep Dive + How I use LLMs | 三个个人任务的模型/上下文/推理/工具诊断矩阵 |

建议为每周保留 6 到 10 小时。没有完成验收产物时，不因“视频已播放完”进入下一阶段。

## Windows 实验入口

本次只完成知识整理，没有克隆仓库或修改现有 Python 环境。后续建议建立独立环境：

```powershell
Set-Location 'C:\Users\User\Documents'
git clone --depth 1 https://github.com/karpathy/nn-zero-to-hero.git
git clone --depth 1 https://github.com/karpathy/minbpe.git
git clone --depth 1 https://github.com/karpathy/build-nanogpt.git

& 'D:\Env\miniconda\Scripts\conda.exe' create -n karpathy-lab python=3.11 -y
```

随后应根据当前 PyTorch 官方安装方式给 `karpathy-lab` 配置 CUDA 版本，再安装 JupyterLab、NumPy、Matplotlib 和 Graphviz。每个阶段先运行最小测试，不直接启动长训练。

## 个人知识库实验

选择非敏感、自己有权处理的笔记标题与摘要，建立一个纯教育用途的 `Karpathy Lab`：

1. 用 micrograd 对一个小型二分类任务验证梯度。
2. 用 makemore 对知识卡标题做字符建模，只观察概率和过拟合，不期待实用文本质量。
3. 用 minbpe 比较中文、英文和代码片段的 token 压缩率与异常切分。
4. 用 tiny GPT 验证因果遮罩、训练曲线和采样参数。
5. 用现有个人知识助手做真实任务对照，证明“理解底层”与“产品可靠”是两个不同层次。

所有训练数据继续留在本机，不把私人笔记上传到公共 Notebook 或第三方训练服务。

## 复习问题

1. micrograd 为什么必须按反向拓扑顺序执行局部 backward？
2. 同一个 `Value` 被多次使用时，为什么梯度必须累加？
3. 计数 bigram 的平滑与神经网络权重正则有什么联系？
4. 为什么训练深网时只看 loss 不够？
5. “先过拟合一个 batch”能排除哪些问题，不能排除哪些问题？
6. 因果 attention 中，信息通信、位置和遮罩分别解决什么？
7. Tokenizer 为什么是独立模型阶段，而不只是字符串工具？
8. BF16、`torch.compile` 和 FlashAttention 分别优化哪一层开销？
9. 参数知识与上下文工作记忆有什么区别？
10. 为什么增加推理 token 可能有帮助，却不能保证正确？
11. 如何把一次 LLM 失败定位到模型、上下文、推理、工具或权限？
12. Stable Diffusion 的连续插值展示了什么，又没有证明什么？

## 最终判断

Karpathy 频道最值得学习的不是某段代码，而是一种工程认知方式：从可计算的最小对象出发，保留张量和梯度的可解释性；先建立基线和不变量，再逐项增加复杂度；发现问题时查看数据和内部统计，而不是只调超参数；理解模型后仍把评测、工具、安全和产品工作流视为独立系统。

