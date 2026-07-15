# Deep Learning Tuning Playbook 定向学习路线

来源：[google-research/tuning_playbook](https://github.com/google-research/tuning_playbook)。

## 它在准备体系中的角色

这份 playbook 解决的是“模型已经能训练，接下来如何科学、可复现地提高性能”。它最适合补强 Senior AI/CV 面试中的训练诊断、超参数实验、资源权衡和团队实验规范。

- **现有题库 M1、M3、M7、M8、M11、M12**负责提出面试问题。
- **Chip Huyen 路线**负责数学、数据、workflow 和 ML 系统全局视角。
- **Tuning Playbook**负责把训练改进变成有目标、有公平对照、有方差意识的实验流程。
- **自己的训练日志和 profiler**负责提供项目证据。

作者明确说明它不是 Google 官方支持的产品，而且内容代表作者写作时的经验和观点，不是客观真理。把它当作高质量实验方法论，而不是必须照搬的调参教条。

## 适用边界

Playbook 默认已经具备：可运行的训练/评估管线、基本正确的数据与问题定义、能够代表部署目标的指标，以及进行多次训练实验的资源。

它不完整覆盖：

- 问题定义、标签策略、数据清洗和产品价值判断。
- 在线实验、分布漂移、发布、回滚和长期监控的全部细节。
- 端侧 latency、memory、energy 和设备兼容性的联合优化。
- LLM 预训练/对齐、RL、Agent 或超大规模分布式训练的专门配方。

面试时要主动补上这些层，不能把“验证集最优”当作最终产品目标。

## 核心闭环

```text
定义部署效用与约束
  → 建立简单、快速、合理的初始配置
  → 为下一轮实验选择一个窄而明确的目标
  → 区分 scientific / nuisance / fixed hyperparameters
  → 设计搜索空间、预算、指标和停止条件
  → 运行并检查训练曲线、搜索边界和失败试验
  → 分析 trial / study / data variance
  → 复跑候选配置，判断收益是否超过新增复杂度
  → 更新 baseline、记录结论，进入下一轮
```

这是回答“你如何调优一个模型”的主干。先讲闭环，再根据追问深入学习率、批大小、优化器、正则化或训练故障。

## 一、建立初始配置

### 先复现可靠 baseline

- 优先选择同类任务中成熟、常用且有参考实现的模型家族。
- 初始配置要简单、训练较快、资源消耗可控，但验证表现明显优于随机或朴素规则。
- 先用常数学习率和较小模型跑通；复杂 schedule、额外模块和高级正则化以后用实验逐项加入。
- baseline 不只是一个数字，还包括数据版本、代码提交、完整配置、环境、随机种子、训练曲线和 checkpoint。

### 优化器选择

- 没有跨任务和架构都最优的优化器；从该任务类型常用、可靠的优化器开始。
- 比较优化器时，不能只给 SGD 和 Adam 同一个学习率；各自的学习率、momentum/betas、weight decay 等 nuisance hyperparameters 要得到公平调优。
- 优化器越复杂，搜索空间和公平比较成本越高。项目早期可先固定部分次要参数，明确结论的适用边界。

### 批大小是系统与优化的耦合变量

Playbook 建议主要用批大小控制训练速度和资源，而不是直接把它当作提升验证集表现的旋钮。面试中要说明这是一条有前提的实践建议：

- 先测不同 batch size 的 examples/s、time/step、显存和 total steps，不只比较 step latency。
- `training time = time/step × total steps`；`resource cost = cost/step × total steps`。
- 加大 batch 后必须重新调学习率、momentum 和正则化，不能保持其他配置不变后直接下结论。
- 批大小受关键批大小、硬件饱和、泛化、BatchNorm 统计、数据多样性和显存共同限制。
- gradient accumulation 可以模拟较大的有效 batch，但不会自动提高吞吐；它仍可能因显存限制、通信策略或优化稳定性而有必要。

## 二、把“调参”变成科学实验

### 每轮只回答一个窄问题

坏目标：

> 尝试新 backbone、增大分辨率、换 AdamW、加 augmentation，看看能不能更好。

好目标：

> 在固定数据版本和输入分辨率的条件下，判断 backbone B 是否比 A 改善夜间人像边界质量，并控制相同设备 latency 上限。

一轮同时改变多个因素，即使指标提升也很难知道原因，更难决定保留哪些复杂度。

### 三类 hyperparameter

| 类型 | 含义 | CV 实验示例 |
| --- | --- | --- |
| Scientific | 本轮希望测量其影响的变量 | backbone A/B、是否加入新 loss、输入分辨率 |
| Nuisance | 为了公平比较 scientific 变量，需要分别调优的变量 | learning rate、weight decay、augmentation strength |
| Fixed | 本轮固定、不打算优化的变量 | 数据快照、训练步数、某个已验证预处理 |

分类取决于实验问题，不是参数的固有属性。固定变量会限制结论外推范围；与 scientific 变量交互越强的参数，越不应该随意固定。

### 实验设计卡

```text
问题 / 假设：
部署目标和 guardrails：
Scientific hyperparameters：
Nuisance hyperparameters：
Fixed hyperparameters：
已知交互：
搜索分布与边界：
trial 数量 / 并行度 / 计算预算：
主指标 / 分层指标 / 失败判定：
训练步数与评估间隔：
需要保存的预测、曲线和 checkpoint：
采纳门槛：效果量、方差、成本、复杂度：
结论的适用范围：
```

## 三、探索、搜索空间与结果解释

### 先探索，再利用

- 探索阶段优先获得问题洞察：合理范围在哪里、哪些参数交互、哪里会发散、什么故障限制性能。
- Quasi-random search 便于均匀、可复现、非自适应地探索空间，也便于事后换指标重新分析。
- 搜索空间和重要参数稳定后，最终 exploitation 阶段才更适合用 Bayesian optimization 等方法寻找单个最佳配置。
- 不要把自动搜索算法当作实验设计的替代品；搜索空间本身决定它能找到什么。

### 搜索空间审计

每轮 study 结束后检查：

- 最优点是否贴近某个边界？若是，边界可能过窄。
- 大量 trial 是否 NaN、发散、损失极差或运行失败？若是，空间可能包含过多不可行区域。
- “好区域”是否只被一两个幸运 trial 命中？若是，采样可能太稀。
- scientific 参数的每个取值是否都获得同等质量的 nuisance 参数搜索？
- learning rate、weight decay 等跨数量级参数是否使用合适的尺度和分布？
- 是否因固定交互参数而无意偏向某个模型？

### 不能把一个 trial 压成一个数字

至少检查最佳若干 trial 的 train/validation curve：

- validation error 后期上升：可能存在 problematic overfitting；先公平调正则，再比较容量。
- 后期 step-to-step variance 大：检查 batch variance、验证集大小、后期学习率和指标统计。
- 训练结束时仍持续改善：可能 compute-bound，应考虑更多 steps 或不同 schedule。
- 很早饱和：可能训练预算浪费，或优化/容量/数据已经成为瓶颈。
- training loss 反常上升、周期性波动或突然发散：先排查实现、数据顺序和优化稳定性。

## 四、怎样判断一个改动真的有效

Playbook 区分三类主要不确定性：

1. **Trial/retrain variance**：同一配置因初始化、shuffle、augmentation、dropout 和并行数值顺序产生的差异。
2. **Study/search variance**：同一搜索空间因搜索种子和有限 trial 命中不同配置而产生的差异。
3. **Data sampling variance**：训练/验证/测试划分和数据收集过程带来的差异。

采纳新配置前：

- 至少对最有希望的配置做多 seed 复跑，估计 trial variance；重大管线变化后重新估计。
- 比较效果量和分布，不只看一次最优值或一个显著性检验。
- 检查提升是否来自幸运 checkpoint、验证集反复适配或不公平的 nuisance 参数。
- 收益要覆盖新增计算、latency、内存、维护、回归风险和调试复杂度。
- 通过门槛后将它升为新 baseline；不要要求不现实的绝对确定性，也不要保留证据薄弱的复杂组件。

Senior 信号是能解释“为什么这组证据足以决策”和“还剩什么不确定性”，而不是声称某个数字证明一切。

## 五、训练步数、评估与 checkpoint

### 训练步数

- 同一 study 内固定 `max_train_steps`，不要让它成为随 trial 改变的搜索变量，否则比较口径会混乱。
- 非 compute-bound 时宁可先训练稍久，并通过回溯式最优 checkpoint 选择观察最佳 step 分布。
- 若最佳 checkpoint 总在前 10%，预算可能过长；若经常落在最后 25%，可能需要更多 steps 并重新调 schedule。
- 架构、数据增强、dropout 或优化器改变后，合理训练步数也可能改变。

### 周期性评估

- 按固定 step 间隔评估，不按墙上时钟间隔；这样曲线更容易比较，也更容易发现周期性数据/实现问题。
- 推理不保存反向激活，evaluation batch 通常可以不小于 training batch，但仍需受内存和评估逻辑约束。
- 周期性评估只是离线/在线指标的代理；抽样集要足够快、足够稳定，并与完整评估集核对偏差。
- 类别极不平衡时，除了比例指标还记录稀有类样本数和正确数，避免“一例变化”看起来像巨大提升。
- 保存部分逐样本预测、切片指标和必要 artifact，便于事后诊断。

### Checkpoint 与追踪

- 保存训练过程中表现最好的 N 个 checkpoint，不默认最后一步最好。
- 记录 study 名、配置链接、实验说明、trial 数、最佳验证表现、代码提交、数据版本、复现命令和未提交改动。
- 没有可复现记录的实验，不能成为上线决策证据。

## 六、训练失败诊断顺序

### 先确认是优化不稳定，不是数据或代码问题

1. 检查 NaN/Inf、标签、loss reduction、mask、增强、数据 shuffle、train/eval mode。
2. 尝试 overfit 一个小 batch，确认模型和反向传播能学习。
3. 做 learning-rate sweep，找到当前最佳学习率和发散边界。
4. 检查略高于最佳学习率的训练曲线；若出现 loss 上升/突增，稳定性可能限制了有效学习率。
5. 怀疑早期不稳定时，用短 run 在最初数百 step 高频记录 loss、gradient norm 和 update norm。

### 干预顺序

- 早期不稳定：尝试 learning-rate warmup。
- 早期或中途尖峰：根据 gradient/update norm 设计 clipping，并确认阈值不会长期压扁正常更新。
- 检查初始化、残差路径和 normalization 放置。
- 比较更稳健的优化器，但必须重新调其 nuisance 参数。
- 降低学习率作为最后的稳定方案，因为过低学习率可能只是掩盖故障并损害有限预算下的优化。

每次只改一个故障假设，并保留对照，避免把 warmup、clipping、优化器和 normalization 一次全部加入。

## 七、输入管线、BatchNorm 与多机陷阱

### 输入管线

- 用 profiler 证明 input-bound，不凭 GPU utilization 单一指标猜测。
- 检查远程 I/O、昂贵在线预处理、无意同步 barrier、prefetch 不足、未使用字段和 worker 数量。
- 优化后同时报告 examples/s、time/step、资源使用和数据语义一致性；更快但改变样本分布不算成功。

### BatchNorm

- 区分总 gradient batch、per-device batch 和用于 BN 统计的 examples 数量。
- 多设备统计未同步、Ghost BatchNorm 切分错误、EMA 未同步或 checkpoint 只保存单设备状态，都可能导致训练/推理不一致。
- 改变 batch size 或 host 数量时，重新做 BN 统计与推理 parity 验证。
- 不能简单得出“LayerNorm 总能替代 BatchNorm”；CV 架构、预训练权重、部署算子和精度都可能限制替换。

### 多机

检查 RNG 是否跨 host 正确独立/可复现、数据是否正确 sharding、指标 reduction 是否带权、只由一个 host 写日志/checkpoint，以及保存前需要同步的模型/优化器/BN 状态。

## 八、面试回答模板

当被问“模型效果不够好，你怎么调参？”时，使用以下 3 分钟结构：

1. **目标**：先确认线上效用、离线代理指标、数据切片、latency/成本和时间预算。
2. **健康检查**：验证数据/评估/训练管线，建立简单可复现 baseline，先排除实现故障。
3. **实验问题**：一轮只回答一个问题，区分 scientific、nuisance、fixed parameters。
4. **搜索设计**：说明范围、尺度、trial 数、并行度、训练步数、评估频率和失败判定。
5. **结果解释**：检查曲线、边界、不可行 trial、切片指标和三类方差。
6. **决策**：多 seed 复跑；收益超过复杂度和资源成本才升级 baseline。
7. **交付**：锁定配置和数据版本，做完整离线/设备/线上验证、发布门槛和回滚。

不要一上来列“调 learning rate、batch size、optimizer”。先展示实验设计和诊断顺序，具体超参只是其中一层。

## 九、四个定向练习

### 练习 1：CV backbone 比较

为人像分割比较两个 backbone。列出 scientific/nuisance/fixed 参数，说明如何公平调 learning rate、weight decay 和 augmentation，并加入设备 latency guardrail。

### 练习 2：输入分辨率提升是否真实有效

比较 256、384、512 输入时，区分模型精度、数据 crop 策略、batch size、训练 steps、吞吐和端侧内存的交互。设计可接受预算内的 study，而不是只跑三次单点实验。

### 练习 3：新 loss 带来 0.3% 提升

判断是否采纳：估计 trial variance、study variance 和切片稳定性；检查最佳 checkpoint、重新调 nuisance 参数、复跑 seeds，并计算新增训练/推理复杂度。

### 练习 4：训练中途突然发散

从数据/实现/数值/优化四类假设出发，设计 learning-rate sweep、早期高频日志、gradient/update norm 和最小复现实验；按证据决定 warmup、clipping 或架构修正。

## 十、嵌入六周计划

- **第 1 周**：学习核心闭环和三类 hyperparameter；用 M7、M11、M12 做一次 3 分钟口述。
- **第 2 周**：选择一个 CV 项目完成实验设计卡和训练曲线诊断；连接 M1、M3、M8。
- **第 3 周**：复习 input pipeline、BatchNorm、多设备和数值稳定，连接端侧 parity 与训练复现。
- **第 4 周**：把 trial/study/data variance、checkpoint 和 experiment tracking 放入 ML 系统设计。
- **第 5 周**：只有涉及 fine-tuning 时才复用该流程；不将其误当作 LLM/Agent 系统设计资料。
- **第 6 周**：完成一次“效果提升是否真实”的训练实验 mock，不再扩展调参技巧清单。

## 完成标准

- 能在 3 分钟内用核心闭环回答“如何系统调优深度模型”。
- 能正确区分 scientific、nuisance、fixed hyperparameters，并说明固定变量限制结论外推。
- 能从 training curves、搜索边界、不可行 trial 和三类方差判断实验是否可信。
- 能设计包含目标、搜索空间、预算、评估、复跑和采纳门槛的 study。
- 能把训练提升连接到 CV hard cases、端侧 latency/memory、发布和回滚，而不只报告验证集数字。
- 至少有一个自己的真实项目案例，能说明一次失败实验、诊断证据和最终决策。

完成这些输出后停止继续搜调参技巧，把时间投入到真实日志复盘、闭卷口述和实验设计模拟。
