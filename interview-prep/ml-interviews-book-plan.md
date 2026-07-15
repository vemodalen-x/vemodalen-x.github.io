# Chip Huyen《Machine Learning Interviews》定向学习路线

主站：[Introduction to Machine Learning Interviews Book](https://huyenchip.com/ml-interviews-book/)。

## 这本书在准备体系中的位置

书的第一部分解释 ML 岗位、公司类型、面试流程、问题类型、招聘信号和准备方法；第二部分用 200+ 道按难度标注的问题覆盖数学、计算机基础、数据、ML workflow、经典/深度学习与训练。作者明确把它定位为巩固知识和寻找盲区的工具，而不是教材或“速成答案”。

对当前目标岗位，最有价值的是：

- **Senior 信号**：相似生产经验、公开证据、系统设计判断和沟通能力。
- **数学用于诊断**：矩阵、概率和优化不是为了推公式表演，而是为了选型、debug、效率和解释性能。
- **数值与规模意识**：复杂度、浮点稳定性、精度、显存/内存和多设备训练。
- **数据与 workflow**：采样、标签质量、selection bias、split、metric 和 production gap。
- **CV/训练深度**：卷积结构、upsampling、depthwise convolution、训练曲线和梯度问题。

限制：书的主体形成于 2021 年前后。Transformer 新推理机制、LLM post-training、RAG、Multimodal 和 Agentic AI 仍按题库 G1–G14 学习。

## 推荐阅读顺序

### 第 1 次：先理解面试，而不是先做题（约 2 小时）

阅读：

- [不同 ML 岗位与公司类型](https://huyenchip.com/ml-interviews-book/contents/chapter-1.-ml-jobs.html)
- [Junior 与 Senior 的差异](https://huyenchip.com/ml-interviews-book/contents/2.1.1.4-junior-vs-senior-roles.html)
- [公司寻找哪些信号](https://huyenchip.com/ml-interviews-book/contents/2.1.3-what-signals-companies-look-for-in-candidates.html)
- [问题类型](https://huyenchip.com/ml-interviews-book/contents/2.3-types-of-questions.html)

输出：

1. 一张岗位矩阵：Research / Applied / MLE / ML Platform / Forward-Deployed AI，各自与你的匹配度和证据。
2. 一张信号清单：生产经验、项目页面、GitHub、论文、系统设计、跨团队影响；每项附可验证链接或故事。
3. 一张面试轮次矩阵：recruiter、hiring manager、coding、ML breadth/depth、system design、behavior 各准备什么。

### 第 2 次：数学、概率与数值（分 3 次，每次 60–90 分钟）

定向阅读：

- [矩阵](https://huyenchip.com/ml-interviews-book/contents/5.1.2-matrices.html)
- [降维](https://huyenchip.com/ml-interviews-book/contents/5.1.3-dimensionality-reduction.html)
- [微积分与凸优化](https://huyenchip.com/ml-interviews-book/contents/5.1.4-calculus-and-convex-optimization.html)
- [概率问题](https://huyenchip.com/ml-interviews-book/contents/5.2.1.2-questions.html)
- [统计问题](https://huyenchip.com/ml-interviews-book/contents/5.2.2-stats.html)
- [复杂度与数值分析](https://huyenchip.com/ml-interviews-book/contents/6.2-complexity-and-numerical-analysis.html)

目标不是做完全部公式题，而是闭卷回答本页补充题 1–8，并能连接自己的量化、训练和端侧经历。

### 第 3 次：数据、workflow 与评估（分 2 次，每次 60–90 分钟）

定向阅读：

- [Data](https://huyenchip.com/ml-interviews-book/contents/6.3-data.html)
- [ML workflow basics](https://huyenchip.com/ml-interviews-book/contents/7.1-basics.html)
- [Sampling and creating training data](https://huyenchip.com/ml-interviews-book/contents/7.2-sampling-and-creating-training-data.html)
- [Objective functions, metrics, and evaluation](https://huyenchip.com/ml-interviews-book/contents/7.3-objective-functions%2C-metrics%2C-and-evaluation.html)

闭卷回答补充题 9–14。每题至少包含一种错误实验设计、一种验证方法和一个生产例子。

### 第 4 次：CV 与训练（分 2 次，每次 60–90 分钟）

定向阅读：

- [Computer vision](https://huyenchip.com/ml-interviews-book/contents/8.2.2-computer-vision.html)
- [Training neural networks](https://huyenchip.com/ml-interviews-book/contents/8.3-training-neural-networks.html)

闭卷回答补充题 15–20。优先讲参数量/FLOPs、shape、数值行为和真实 failure，不只背架构名称。

### 第 5 次：开放式系统设计

使用 [Machine Learning Systems Design](https://huyenchip.com/machine-learning-systems-design/toc.html) 的 exercises。先选 2 题：

1. 5 分钟澄清用户、约束、SLO 和成功指标。
2. 8 分钟给 baseline 和高层架构。
3. 15 分钟深挖数据、模型、评估或 serving。
4. 7 分钟讲失败、监控、发布、回滚和成本。
5. 5 分钟总结决策、最大风险和下一步。

## 20 道补充诊断题

这些题补现有 90 题的薄弱处，不把核心题库膨胀成另一份百科全书。

### A. 数学、概率与数值（1–8）

1. 为什么矩阵可以视为线性变换？可逆性、秩和信息丢失有什么关系？
2. covariance matrix 与 Gram matrix 分别描述什么？在 embedding/feature 分析中何时使用？
3. 区分 derivative、gradient、Jacobian；给定 batch 和多维输出时如何检查 Jacobian shape？
4. PCA 与 SVD 的关系是什么？特征量纲不同为什么要先处理 scaling？
5. 用罕见病检测解释 base rate、false positive/negative 和 Bayes posterior。
6. 正确解释 frequentist 95% confidence interval；它不代表什么？
7. softmax、log、除法、累加分别可能产生哪些数值问题？如何用 max subtraction、log-sum-exp、epsilon 或稳定求和处理？
8. 估算训练/推理内存时，为什么不能只看参数量？列出 weights、activations、gradients、optimizer state、workspace、batch 和精度。

### B. 数据、workflow 与评估（9–14）

9. 什么是 empirical risk minimization？“empirical”意味着哪些泛化风险？
10. 从跨用户、跨设备、跨时间的大型未标注视频集中抽取 10 万帧标注，你会怎样分层、去重并保留 hard cases？
11. “被人工挑选处理过的图片质量更高，因此处理功能有效”可能有哪些 selection bias？
12. 如何判断 train、validation、test 与 production 是否来自同一分布？统计检验和模型判别法各有什么局限？
13. 给出 train/valid loss 的四种典型异常形态，并为每种提出最小诊断实验。
14. 测试集很好但线上很差时，如何把假设按数据、实现、环境、反馈和指标错位分类，并逐个证伪？

### C. CV 与训练（15–20）

15. filter size、padding、stride 与 dilation 如何共同影响 receptive field、shape、参数量和 aliasing？
16. 1×1 convolution 和 depthwise-separable convolution 各解决什么问题？手算一次参数量/FLOPs 变化。
17. ImageNet 预训练模型怎样适配不同输入分辨率和长宽比？哪些层/位置编码/预处理需要注意？
18. 比较 nearest/bilinear、transposed convolution、resize-convolution 和 pixel shuffle；checkerboard artifact 从何而来？
19. 为什么训练新网络时先尝试 overfit 一个很小的 batch？如果做不到，排查顺序是什么？
20. validation loss 低于 training loss 可能由哪些因素造成？考虑 augmentation、dropout、BatchNorm、loss 统计口径和数据难度。

## 学习记录格式

```text
题号：
首次闭卷评分（0–4）：
一句话结论：
机制/公式/shape：
生产例子：
最容易犯的错误：
验证或诊断实验：
复习日期：D+1 / D+3 / D+7 / D+14
```

## 完成标准

- 能用 5 分钟说明目标岗位与公司类型的匹配逻辑。
- 20 道补充题至少 16 道达到 3 分。
- 至少 6 道题能连接自己的训练、量化、端侧或评估案例。
- 完成 2 次 ML system design 模拟，并包含数据、指标、serving、失败、监控和成本。
- 能明确指出书中哪些基础仍有效、哪些现代 GenAI 内容需要由其他资料补充。
