# Deep-ML 机器学习实现题路线

主站：[Deep-ML Problems](https://www.deep-ml.com/problems)。开源题库：[Open-Deep-ML/DML-OpenProblem](https://github.com/Open-Deep-ML/DML-OpenProblem)。

## 它在准备体系中的位置

Deep-ML 用浏览器内的 Python 题和测试用例训练“把公式写成可运行代码”。它补的是 ML implementation gap，不替代三类训练：

- LeetCode / AlgoNote 继续训练通用数据结构、复杂度和白板解题。
- 90 题主库继续训练原理、项目证据、系统设计和 Senior 判断。
- Tuning Playbook 继续训练实验设计、训练诊断和可复现性。

截至本路线审计的开源仓库快照，除模板外共有 164 道题：80 easy、64 medium、20 hard。题目以 Machine Learning、Deep Learning 和 Linear Algebra 为主，也包括 NLP、RL、概率、统计、CV 与 MLOps。网站目录会持续更新，所以执行时以题号加标题搜索，不依赖排序位置。

网站的 Computer Vision 标签当前只有亮度和对比度两道基础题；更有面试价值的 Conv2D、Dice、BatchNorm、CNN backprop 等分布在 Deep Learning 或 Machine Learning 分类中。因此本路线按目标岗位选题，不按网站分类顺刷。

## 与现有材料去重

| 已有训练 | Deep-ML 对应题 | 处理方式 |
| --- | --- | --- |
| C1：二维卷积 | 41 Simple Convolutional 2D Layer | 同一次训练，Deep-ML AC 即完成 Python baseline；仍需自己补 dilation、batch/channel 和复杂度 |
| C3：IoU、NMS | 73 Dice Score | 只补 Dice 与空集合约定；NMS 仍按 C3 独立实现 |
| C5：logistic regression 或 k-means | 15 Linear Regression GD、17 K-Means、104 Logistic Regression | 核心做 15、17；104 不重复，除非 JD 明确要求经典 ML coding |
| M7：SGD、Momentum、Adam | 47 GD Variants、49 Adam | 核心只做 49；47 作为优化器岗位选修 |
| M8：BatchNorm | 115 BatchNorm for BCHW | 用代码验证归一化轴；另外口述 running statistics、train/eval 与导出问题 |
| ML Interviews 数学补充 | 10 Covariance、19 PCA | 用实现验证 orientation、centering、scaling、eigenvector 排序与 sign ambiguity |
| G1：Transformer block | 53 Self-Attention、107 Masked Self-Attention、109 LayerNorm | 作为第 5 周公式、shape 和 mask 的代码证据 |

结论：Deep-ML 不扩张 90 题主库，也不另开每日时段。与 C1、C3、C5、M7、M8、G1 重合的题直接占用原有专项 coding 时间。

## P0：14 道核心题

### 第 1 周：数值基础

| ID | 题目 | 必须补上的面试深度 |
| --- | --- | --- |
| 10 | Calculate Covariance Matrix | 明确输入是 feature-first 还是 sample-first；区分总体/样本协方差；检查 n 小于 2、常量特征、对称性和复杂度 |
| 23 | Softmax Activation Function | 必须使用 max subtraction；说明 axis、overflow/underflow、概率和为 1，以及为什么训练常直接用 log-softmax / fused CE |

### 第 2 周：CV 张量与指标

| ID | 题目 | 必须补上的面试深度 |
| --- | --- | --- |
| 41 | Simple Convolutional 2D Layer | 手算输出 shape；覆盖 padding、stride、非方形输入；网站题完成后扩展到 BCHW、多通道、dilation 和 groups |
| 73 | Calculate Dice Score | 解释 set Dice 与 soft Dice；明确双空 mask 的约定、epsilon、macro/micro、threshold 和类别不平衡 |
| 115 | Batch Normalization for BCHW Input | 归一化轴应为 N/H/W、每通道保留统计量；补充 running mean/variance、biased/unbiased variance、train/eval 与 fold/fuse |

### 第 3 周：经典 ML、优化与低精度

| ID | 题目 | 必须补上的面试深度 |
| --- | --- | --- |
| 15 | Linear Regression Using Gradient Descent | 检查 intercept 是否已并入 X、梯度中的 2/n、学习率发散、停止条件、feature scaling 和 closed-form 对照 |
| 17 | K-Means Clustering | 定义距离与 tie-breaking；处理空 cluster、重复点、初始化敏感、停止容差和随机种子；说明 k-means++ |
| 49 | Implement Adam Optimization Algorithm | 正确实现一阶/二阶矩与 bias correction；说明 epsilon 位置、step 从 1 开始、AdamW 与 L2 的差异及状态内存 |
| 160 | Mixed Precision Training | 区分计算 dtype、master weights 和梯度累加 dtype；解释 loss scaling、overflow 检测、动态 scale，以及精度/吞吐/显存取舍 |

### 第 4 周：数据切分与降维

| ID | 题目 | 必须补上的面试深度 |
| --- | --- | --- |
| 18 | Implement K-Fold Cross-Validation | 除索引正确外，解释 shuffle/seed、stratified/group/time split；预处理只能在每个 train fold 内拟合 |
| 19 | PCA Implementation | 先中心化并判断是否需要标准化；解释 covariance eigendecomposition 与 SVD 的关系、排序、sign ambiguity、n 小于 d 和 explained variance |

### 第 5 周：Transformer 核心算子

| ID | 题目 | 必须补上的面试深度 |
| --- | --- | --- |
| 53 | Implement Self-Attention Mechanism | 写清 Q/K/V shape、转置、缩放因子和 softmax axis；估算时间与 activation memory |
| 107 | Implement Masked Self-Attention | 区分 causal 与 padding mask；检查 broadcast shape、全 mask 行、负无穷与低精度数值问题 |
| 109 | Layer Normalization for Sequence Data | 对最后一个 feature 维归一化；区分 LayerNorm、RMSNorm 和 BatchNorm；说明 epsilon、gamma/beta broadcast |

## P1：按岗位选择，不要求全做

| 触发条件 | 题目 |
| --- | --- |
| 想理解反向传播/autograd | 25 Single Neuron with Backpropagation；26 Basic Autograd Operations |
| 优化器或训练平台岗位 | 47 Gradient Descent Variants |
| Transformer / LLM 深挖 | 94 Multi-Head Attention；128 Dynamic Tanh；151 SwiGLU |
| CV research / training 深挖 | 130 Simple CNN Training with Backpropagation；137 Dense Block |
| 经典 ML / Data Scientist JD | 20 Decision Tree；38 AdaBoost；104 Logistic Regression；138 Best Gini Split；140 Bernoulli Naive Bayes；173 KNN；186 Gaussian Process |
| RL / post-training JD | 101 GRPO Objective；122 REINFORCE；133 Q-Learning；157 Bellman Value Iteration |
| MoE / large-model systems JD | 123 MoE Efficiency；124 Noisy Top-K Gating；125 Sparse MoE Layer |
| MLOps / data platform JD | 187 Simple ETL Pipeline |

P1 每家公司最多选 2–3 道。题号 188 Gradient Checkpointing 的当前题面只是简化的 forward 模拟，不能证明理解真正的 activation recomputation、backward graph、RNG state 和计算/显存取舍；可做热身，但不计核心完成度。

## 每题固定训练协议

### 1. 闭卷建模，5–8 分钟

提交代码前先写下：

- 输入/输出 shape、axis、dtype、是否 in-place。
- 核心公式或循环不变量。
- 正常例子和至少两个边界例子。
- 预期时间、空间复杂度和数值风险。

### 2. 独立实现，20–30 分钟

- 第一遍不看 Learn 和 Solution。
- 先写正确且可测的 baseline，再做向量化。
- 失败后先读错误输出并缩小反例；25 分钟后才允许看 Learn，45 分钟后才允许对照 Solution。
- 网站 AC 只表示通过现有测试，不表示完成面试题。

### 3. 对抗测试，10 分钟

每题至少自行增加三类测试：

1. 最小/空/退化输入，例如单样本、全零、常量特征、空正类。
2. 数值极端，例如很大的 logits、很小的 variance、float16 overflow。
3. shape 与语义陷阱，例如轴交换、非方形张量、mask broadcast、重复 centroid。

能用 NumPy 或 PyTorch 的可信实现做 parity check 时，固定 seed、容差和 dtype，并解释差异来源。

### 4. 面试化复盘，5–10 分钟

闭卷回答：

- 一句话说明算法做什么。
- 为什么实现正确，关键不变量是什么。
- 哪个边界最容易错。
- 如何从教学实现扩展到 batch、GPU、distributed 或 production。
- 在自己的 CV、端侧或多模态项目中，它出现在哪里。

## 平台题面的四个常见陷阱

1. **通过测试不等于规格完整。** 测试可能没有覆盖 NaN、Inf、空输入、tie、axis、dtype 或随机性。
2. **教学简化不等于生产实现。** 例如 BatchNorm 题可能只计算当前 batch，完整推理还需要 running statistics；attention 题也不等于高效 KV-cache serving。
3. **题目损失不一定是最佳建模选择。** 例如 sigmoid neuron 配 MSE 可用于练 chain rule，但二分类通常应比较 BCE；面试时要指出这个选择。
4. **rounding 是判题契约，不是数值算法。** 内部计算保留精度，只在要求的输出边界舍入，并说明容差。

参考解只能用于比较思路。若参考解与 shape、数值稳定性或边界定义冲突，以数学推导、框架官方行为和自己构造的测试为准。

## Python 与 C++ 桥接

P0 先使用 Python/NumPy完成；随后只重写两题，避免重复劳动：

- 41 Conv2D：C++ 实现 contiguous buffer 版本，解释 NCHW index、cache locality、边界和 SIMD/线程化方向。
- 17 K-Means：C++ 实现 assignment/update，说明内存布局、并行 reduction、空 cluster 和 deterministic testing。

若岗位高度偏 Edge，再加 115 BatchNorm inference/folding；不要把 Python 题全部机械翻译为 C++。

## 六周嵌入方式

| 周次 | Deep-ML | 与原计划关系 |
| --- | --- | --- |
| 第 1 周 | 10、23 | 占用每日 20 分钟 coding 中的两次；连接 ML Interviews 的矩阵/数值题 |
| 第 2 周 | 41、73、115 | 41 计入 C1，73 计入 C3 的指标部分，115 连接 M8；不是三道额外任务 |
| 第 3 周 | 15、17、49、160 | 15/17 共同完成 C5；49/160 连接 M7、Edge 精度与 Tuning Playbook |
| 第 4 周 | 18、19 | 连接数据切分、leakage、评估与泛化；各自补一个错误实验设计 |
| 第 5 周 | 53、107、109 | 沿 Transformer 图口述 shape 后闭卷实现；连接 G1 和推理数值问题 |
| 第 6 周 | 从 14 道中随机抽 1 道 | 35 分钟离线 mock：只给函数签名，不打开网站；10 分钟测试和口述 |

若某周已超出 8–10 小时预算，优先保留岗位最相关的 41、49、53、107、109、115、160；其余顺延，不挤占 mock、项目故事和睡眠。

## 学习记录模板

    Deep-ML ID / 标题：
    首次用时 / 提交次数：
    输入输出 shape 与 dtype：
    核心公式 / 不变量：
    自建边界测试：
    时间 / 空间复杂度：
    数值稳定性：
    与 NumPy / PyTorch parity：
    教学实现缺少的生产要素：
    90 秒口述评分（0–4）：
    复习：D+1 / D+3 / D+7 / D+14

## 完成标准

- 14 道 P0 全部在不复制参考解的情况下通过；至少 10 道首次独立完成。
- 每题有 3 个自建边界测试；不能只保存平台的 happy path。
- 41、17 完成 C++ 重写，并能解释与 NumPy 版本的复杂度、内存和数值差异。
- 14 道中至少 11 道能在 90 秒内说清公式、shape、边界和生产扩展，评分达到 3。
- 第 6 周随机实现 mock 在 35 分钟内得到正确 baseline，且主动测试而不是等面试官提醒。
- 能明确说明 Deep-ML、LeetCode、主题库和 Tuning Playbook 各自训练什么，不把 AC 数量当作面试准备进度。
