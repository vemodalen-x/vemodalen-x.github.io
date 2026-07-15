# Reflection_Summary 定向学习路线

来源：[sladesha/Reflection_Summary](https://github.com/sladesha/Reflection_Summary)（仓库现重定向到 `nosuggest/Reflection_Summary`）。

## 它在准备体系中的角色

这个仓库的优势不是体系完整或内容最新，而是“连续追问”：从定义继续问公式、假设、比较、失败条件和使用经验。它适合把现有题库的短答案向下钻深一到三层。

- **现有 90 题**仍是主问题索引，不增加总题数。
- **Chip Huyen 路线**仍负责数学、数据、workflow 和训练的系统诊断。
- **Reflection_Summary**只提供经典 ML/数学的追问角度和中文口述热身。
- **论文、教材、官方文档和自己的实验**负责验证结论；仓库答案不能直接作为标准答案。

这份资料对经典 ML、推荐/NLP 面试更贴近，对当前 Senior AI/CV/Edge/Agentic 目标只选取共同基础。推荐、风控、CRF/LDA、早期 BERT 工程细节只有在 JD 明确要求时才展开。

## 为什么不能直接背仓库答案

抽查后发现，仓库中存在过度简化、混淆假设和版本相关表述。例如：

- “同分布增加数据不能解决高方差”过于绝对；更多独立同分布数据通常正是降低估计方差的常见手段，是否有效取决于学习曲线、噪声、模型和采样覆盖。
- 逻辑回归不要求每个类别下的特征必须服从高斯分布；不要把由生成模型可推导出线性 log-odds 的充分条件，说成判别式逻辑回归的必要假设。
- `sklearn` 的 solver、默认值和兼容关系属于版本相关知识，必须按面试使用的当前版本查官方文档。
- 一些推导依赖外部图片，图片失效后上下文可能不完整；只看结论容易丢失符号定义和适用条件。

因此把仓库中的每个结论视为“待验证假设”，而不是记忆卡答案。

## 一条概念的五层追问法

从仓库选一个主题后，闭卷完成五层输出：

1. **定义**：30 秒内说清它解决什么问题。
2. **公式与形状**：写出公式、每个符号、tensor/matrix shape 和量纲。
3. **假设与适用条件**：哪些条件成立时结论才成立？
4. **比较、反例与失败模式**：换方案会怎样？给一个能推翻绝对化说法的反例。
5. **项目证据**：在哪个真实项目中出现过，如何检测、决策和验证？

评分沿用准备包 0–4 分量表。只会复述仓库答案最多记 1 分；能修正不严谨表述并给验证实验才可能达到 3–4 分。

## P0：八条必练追问链

### 1. 偏差、方差与学习曲线

映射：题库 M1、M3、M11；Chip 补充题 13、19、20。

- 对平方损失写出 bias–variance–noise 分解；每个期望对什么随机变量取？
- 高训练误差、高验证误差和二者差距大分别意味着什么？
- 增加数据、减小容量、正则化、数据增强分别主要改变什么，什么时候无效？
- Bagging 为何通常降低方差？Boosting 是否永远只降低偏差？
- 给一个“离线看似过拟合，实际是训练/验证统计口径不同”的例子。

### 2. 概率、Bayes、MLE 与 MAP

映射：题库 M9；Chip 补充题 5、6、9。

- 区分 probability、likelihood、prior、posterior 和 evidence。
- 从 Bernoulli likelihood 推导二分类交叉熵；从 Gaussian noise 推导 MSE。
- MAP 中 Gaussian/Laplace prior 如何连接 L2/L1？这个联系依赖什么尺度参数？
- 用低基准率事件解释为什么高准确率检测器仍可能有较低 posterior precision。
- 说出 MLE/MAP 的点估计局限，以及何时需要不确定性估计。

### 3. 线性代数与数值直觉

映射：Chip 补充题 1–4、7、8。

- 把矩阵解释成线性变换；rank、null space、可逆性和信息丢失如何关联？
- 区分 vector norm、induced matrix norm 和 Frobenius norm。
- 什么时候能做 eigen decomposition？SVD 为什么更普遍？
- PCA 与 SVD 如何连接？数据为何要中心化，量纲差异为何可能要求 scaling？
- condition number 会怎样影响最小二乘、梯度下降和低精度推理？

### 4. 数据质量、划分和预处理

映射：题库 M2、M4、M6、M10、M12；Chip 补充题 10–14。

- 缺失是 MCAR、MAR 还是 MNAR？填充会引入什么偏差？
- 类别不平衡时，重采样、class weight、focal loss 和阈值移动各改变什么？
- normalization、standardization、whitening 分别是什么；哪些模型敏感，哪些相对不敏感？
- 异常点究竟是错误、罕见真样本还是新分布？删除前如何判断？
- 同用户、同视频帧、同设备和时间数据如何防止 split leakage？

### 5. 线性回归与逻辑回归

映射：题库 M3、M5、M9、M12。

- 线性回归的 Gauss–Markov 条件、MLE 条件和“可以训练”条件有什么区别？
- 为什么逻辑回归建模 log-odds？Sigmoid 是怎样从这个参数化得到的？
- 交叉熵相对平方损失在二分类优化中有什么性质；不要只回答“梯度更大”。
- 多重共线性会怎样影响系数稳定性、可解释性和预测？正则化能修复哪些问题？
- 预测排序、概率校准和决策阈值是三个不同问题，分别用什么指标/方法验证？

### 6. 树、Bagging、Boosting 与梯度提升

映射：题库 M1、M3、M11、M12。

- ID3、C4.5、CART 的划分目标和任务类型有什么不同？
- 决策树为什么不需要常规 feature scaling，又为什么仍可能对数据扰动敏感？
- Random Forest 的样本随机性和特征随机性分别降低什么相关性？
- 用函数空间的梯度下降解释 GBDT 为什么拟合损失对当前预测的负梯度。
- learning rate、tree depth、subsampling 和树数量如何共同影响 bias、variance、成本？
- XGBoost/LightGBM 的具体实现差异只在 JD 需要时学习，并以当前官方文档验证。

### 7. 正则化、归一化与残差结构

映射：题库 M3、M7、M8、V1；Chip 补充题 19、20。

- L1/L2、weight decay、dropout、augmentation、early stopping 的作用对象是否相同？
- BatchNorm 训练与推理分别使用什么统计量；小 batch、分布漂移和模型导出如何出错？
- LayerNorm 为什么更适合 sequence/Transformer；归一化的轴是什么？
- 残差连接怎样改变优化路径和梯度传播？不能只回答“防止梯度消失”。
- 如何用 overfit-one-batch、关闭增强/正则、检查 running stats 来定位训练问题？

### 8. Attention 与现代 Transformer 衔接

映射：题库 G1、G2、G9；Transformer 可视化资料。

- 写出 `softmax(QKᵀ/√d_k)V`，逐项给出 batch、head、sequence、channel shape。
- 为什么除以 `√d_k`；维度增大时点积方差和 softmax 饱和如何变化？
- self-attention 本身如何获得顺序信息？没有位置编码会发生什么？
- 比较 RNN、CNN 和 self-attention 的依赖路径、并行性、计算/内存复杂度。
- 原始 encoder–decoder attention 与现代 decoder-only causal attention 有何差异？
- 仓库只能作为基础追问；KV cache、RoPE、GQA、FlashAttention 和 serving 继续使用现代资料。

## P1：按 JD 才展开

### SVM 与经典优化

适用于强调数学推导、传统视觉或小数据分类的岗位：margin、软间隔、primal/dual、KKT、kernel trick、核矩阵条件，以及为何大规模问题常优先线性/近似方法。

### 推荐系统

只有 JD 涉及召回、排序、广告或推荐时，再读 DIN、DeepFM、YouTubeNet、negative sampling 和 hard negative。阅读时补充当前 two-tower、ANN retrieval、counterfactual bias、在线实验和 feedback loop，不停留在模型结构背诵。

### 经典 NLP

Word2Vec、GloVe、CRF、LDA、TextCNN 只在岗位需要时复习。当前 Multimodal/LLM 岗位优先投入 Transformer、评估、RAG/Agent、推理和系统设计。

### AutoML、风控与其他目录

不作为当前主线。只有目标公司明确涉及 HPO/NAS、反欺诈或评分卡时才抽题。

## 答案验证协议

每次从仓库取一个问题，按以下顺序验证：

1. **重写问题**：删除诱导性前提，把绝对问题改成“在什么条件下”。
2. **符号检查**：写清随机变量、条件、shape、求和/期望范围和单位。
3. **反例检查**：主动找一个反例；找不到不等于命题正确。
4. **一手来源**：算法查原论文/教材，API 和默认参数查当前官方文档。
5. **最小实验**：能用小数据证明的结论，设计一个控制变量实验或数值例子。
6. **项目映射**：补上数据规模、指标、失败模式和真实决策，不停留在课堂推导。

记录格式：

```text
主题 / 对应题号：
仓库提出的追问：
我的 30 秒结论：
公式、shape 与假设：
反例或边界：
验证来源：
最小实验：
项目证据：
当前评分 / 下次复习：
```

## 三次学习安排

不要顺序浏览整个仓库，完成三次 60–90 分钟的定向训练即可。

### 第一次：数学和泛化

- 闭卷完成追问链 1–3。
- 手推一次 MLE→cross-entropy、MAP→regularization、PCA↔SVD。
- 把所有“必然、一定、没有影响”的表述改写为带条件的命题。

### 第二次：数据和经典 ML

- 完成追问链 4–6。
- 选择自己的一个分类项目，比较 LR、tree ensemble 和当前深度模型的适用条件。
- 设计一个数据泄漏、类别不平衡或分布变化的最小诊断实验。

### 第三次：深度学习共同基础

- 完成追问链 7–8。
- 手写 BN 训练/推理、LayerNorm 和 multi-head attention 的公式与 shape。
- 把回答连接到 CV 训练、端侧导出和现代 Transformer 推理中的真实失败模式。

## 嵌入六周计划

- **第 1 周**：用追问链 1、2、5 加深 M1、M3、M5、M9，不新增独立题目。
- **第 2 周**：用追问链 3、7 支撑 CV 训练与数值问题。
- **第 3 周**：只复习与量化、归一化、数值稳定和端侧 parity 相关的部分。
- **第 4 周**：用追问链 4 和指标部分审查系统设计的数据与评估。
- **第 5 周**：只保留追问链 8；跳过仓库中早期 BERT/NLP 实现细节。
- **第 6 周**：停止读仓库，只复习自己验证过的答案卡和错题。

## 完成标准

- 八条 P0 追问链都能在 30 秒、3 分钟和白板推导三种深度下回答。
- 每条链至少给一个适用条件、一个反例/失败模式和一个项目证据。
- 所有版本相关结论都有当前官方文档记录；所有数学结论符号完整。
- 仓库中发现的可疑表述没有进入自己的答案卡。
- 没有因为新增资料而增加核心题库数量或打乱六周主线。

达到这些标准后停止扩展 Reflection_Summary；它的价值已经通过追问深度被吸收。
