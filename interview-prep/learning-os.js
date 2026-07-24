(function () {
  'use strict';

  var STORAGE_KEY = 'interview-learning-os-v3';
  var LEGACY_STORAGE_KEYS = ['interview-learning-os-v2'];
  var VERSION = 3;
  var DAY = 24 * 60 * 60 * 1000;
  var SCORE_DIMENSIONS = ['correctness', 'reasoning', 'transfer', 'communication', 'independence'];

  var CLUSTERS = {
    K1: { title: '项目叙事与 Senior 证据', short: 'Narrative', description: '影响、个人决策、失败与领导力证据', color: '#d96647' },
    K2: { title: '数学、统计与泛化', short: 'Theory', description: '公式、shape、假设、反例与边界', color: '#5f5ab8' },
    K3: { title: '数据、经典 ML 与评估', short: 'Data', description: 'split、leakage、指标与线上闭环', color: '#a76617' },
    K4: { title: '训练、优化与数值', short: 'Training', description: 'baseline、方差、稳定性与低精度', color: '#356f8d' },
    K5: { title: 'CV 与计算摄影', short: 'Vision', description: '算子、边界、时序、链路与 hard cases', color: '#a34662' },
    K6: { title: 'Edge、C++ 与运行时', short: 'Edge', description: '转换、parity、profiling、并发与降级', color: '#39745a' },
    K7: { title: 'DSA 与软件编码', short: 'Coding', description: '模式、不变量、复杂度与边界测试', color: '#3d63a8' },
    K8: { title: '系统、LLM 与 Agent', short: 'Systems', description: '上下文、Harness、工具、评估、协作与发布', color: '#755197' }
  };
  var KNOWLEDGE = window.INTERVIEW_KNOWLEDGE || { documents: [], sections: [], sourceCount: 0, sectionCount: 0 };

  var ROLE_WEIGHTS = {
    balanced: { K1: 0.9, K2: 0.75, K3: 0.9, K4: 0.9, K5: 0.9, K6: 0.85, K7: 0.75, K8: 0.85 },
    cv: { K1: 0.75, K2: 0.8, K3: 0.85, K4: 0.95, K5: 1, K6: 0.9, K7: 0.7, K8: 0.55 },
    edge: { K1: 0.75, K2: 0.7, K3: 0.75, K4: 0.95, K5: 0.9, K6: 1, K7: 0.85, K8: 0.55 },
    agent: { K1: 0.8, K2: 0.75, K3: 0.85, K4: 0.75, K5: 0.65, K6: 0.55, K7: 0.7, K8: 1 }
  };

  var MODE_WEIGHTS = {
    balanced: { explain: 0.85, code: 0.85, debug: 0.85, design: 0.85, story: 0.85 },
    coding: { explain: 0.55, code: 1, debug: 0.9, design: 0.45, story: 0.35 },
    system: { explain: 0.75, code: 0.45, debug: 0.75, design: 1, story: 0.7 },
    depth: { explain: 1, code: 0.75, debug: 0.95, design: 0.8, story: 0.55 }
  };

  var REVIEW_VARIANTS = [
    { label: '约束反转', prompt: '把原题中最宽松的约束改成最严格约束；指出原结论从哪一步开始失效。' },
    { label: '最小反例', prompt: '构造一个最小反例或边界输入，迫使你修改原方案，并说明如何用测试捕获。' },
    { label: '规模迁移', prompt: '把数据量、流量、序列长度或团队规模扩大 10 倍；重新判断瓶颈、指标和取舍。' },
    { label: '故障注入', prompt: '假设一个关键依赖静默失败或指标发生漂移；给出检测、降级和恢复路径。' },
    { label: '角色切换', prompt: '把答案分别讲给 code reviewer 与业务负责人；保留同一事实，但改变证据顺序和决策语言。' }
  ];

  var TASKS = [
    {
      id: 'k1-positioning', cluster: 'K1', title: '30 秒定位：你为何适合这个 Senior AI 角色？', kind: 'story', duration: 30, week: 1, prereqs: [],
      goal: '建立清晰、可验证、与岗位相关的候选人定位。', output: '30 秒版本 + 2 分钟版本 + 一条证据链。',
      prompt: '不用看简历：用 30 秒说明你是谁、解决什么高价值问题、有什么差异化证据，以及为什么是现在。',
      construct: '写出 30 秒和 2 分钟两个版本。每个关键主张后标注证据：项目、指标、范围或可公开链接。',
      transfer: '目标从 Computer Vision 改成 Agentic AI 平台团队。哪些证据保留，哪些必须换？不要只替换关键词。',
      hints: ['检查是否先给角色定位，而不是从工作年限开始。', '使用“领域 + 规模/约束 + 可验证结果”构造差异化。', '部分框架：一句定位 → 两项证据 → 与岗位连接；请自己填充内容。'],
      rubric: ['30 秒内出现清晰定位和价值。', '个人贡献与团队成果区分。', '至少一项可验证证据。', '换岗位时能重新选择证据，而非套模板。'],
      exit: '关闭前文，用两句话重新说定位，并删掉所有不能被追问验证的形容词。'
    },
    {
      id: 'k1-project-depth', cluster: 'K1', title: '项目深挖：从影响倒推关键技术决定', kind: 'story', duration: 45, week: 1, prereqs: ['k1-positioning'],
      goal: '把项目介绍从流水账升级为 Senior 决策证据。', output: '影响 → 约束 → 决策 → 弃选 → 结果 → 复盘。',
      prompt: '选择一个最强项目。先说最终影响，再说明你做出的一个关键决定如何改变结果。',
      construct: '画出项目架构或用文本列出数据、模型、运行时、指标和发布。标出你拥有的决策点与弃选方案。',
      transfer: '面试官认为结果主要来自团队和现成模型，而不是你的判断。你用什么证据回应，又承认哪些边界？',
      hints: ['先找一个可量化结果和一个具体决定。', '区分“我决定/实现/推动”和“团队共同完成”。', '用 decision record：context、options、choice、evidence、residual risk。'],
      rubric: ['影响在前，技术细节服务于判断。', '个人 ownership 清楚。', '有弃选方案和判断依据。', '能面对不利解读而不防御。'],
      exit: '用 90 秒重新讲项目，只保留一个决定、一个失败风险和一个量化结果。'
    },
    {
      id: 'k1-failure', cluster: 'K1', title: '失败故事：从局部修复到系统性改进', kind: 'story', duration: 45, week: 1, prereqs: ['k1-project-depth'],
      goal: '展示诚实、诊断、责任和组织级学习。', output: '失败时间线 + 检测信号 + 修复 + 防复发机制。',
      prompt: '讲一个由你的判断不完整、沟通不足或验证缺口造成的失败。你何时发现，影响是什么？',
      construct: '写出时间线，并区分直接原因、促成条件和系统性根因。列出短期修复与长期机制改进。',
      transfer: '如果同类失败发生在一个没有即时 ground truth 的 Agentic workflow，你如何更早检测？',
      hints: ['避免把失败伪装成优点。', '寻找“为什么现有流程允许它发生”。', '长期改进应能改变系统默认行为，而不只是提醒大家小心。'],
      rubric: ['明确承认自己的判断缺口。', '影响和检测信号具体。', '根因不止停留在个人失误。', '长期机制能迁移到新场景。'],
      exit: '一句话说你学到了什么，再给一个能证明该学习已经落地的机制。'
    },
    {
      id: 'k2-bias-variance', cluster: 'K2', title: 'Bias–variance：从学习曲线到最小诊断实验', kind: 'explain', duration: 35, week: 1, prereqs: [],
      goal: '从定义转向可执行诊断。', output: '90 秒解释 + 四种曲线模式 + 下一步实验。',
      prompt: '解释 bias–variance trade-off。训练误差和验证误差的不同组合分别说明什么？',
      construct: '列出至少四种学习曲线模式，为每种写一个最小诊断实验；不要直接列正则化名词。',
      transfer: '一个过参数化模型训练误差接近 0，验证性能仍随数据增加持续改善。经典直觉哪些仍有用，哪些说法过度简化？',
      hints: ['先区分可观测信号和潜在原因。', '增加数据、增加容量、改变正则的作用方向不同。', '用“现象 → 假设 → 可区分实验”，不要用现象直接等同原因。'],
      rubric: ['定义和曲线关系正确。', '知道相同曲线可有多个原因。', '实验能区分假设。', '不把经典分解机械套到所有深网现象。'],
      exit: '给定“训练高、验证高”，只用三句话说诊断顺序和第一个实验。'
    },
    {
      id: 'k2-covariance', cluster: 'K2', title: 'Deep-ML 10：协方差矩阵与输入方向', kind: 'code', duration: 45, week: 1, prereqs: [],
      goal: '把统计定义转成 shape 安全的实现。', output: 'NumPy/Python 实现 + 3 个对抗测试。',
      prompt: '闭卷写协方差矩阵。先声明输入是 sample-first 还是 feature-first，并说明分母。',
      construct: '实现后测试：单样本、常量特征、交换特征顺序。检查对称性、dtype 和 n<2。',
      transfer: '数据变成流式输入，不能保存全部样本。如何在线更新均值和协方差？数值风险是什么？',
      hints: ['先写中心化矩阵的 shape。', '样本协方差通常使用 n-1；先明确契约。', '向量化形式可从 centered @ centered.T 或其转置推导。'],
      rubric: ['orientation 和分母明确。', '实现对称且 shape 正确。', '退化输入有定义或明确报错。', '能解释在线更新与数值稳定性。'],
      exit: '不看代码，写出矩阵形式、shape 和两个最危险的边界。'
    },
    {
      id: 'k2-softmax', cluster: 'K2', title: 'Deep-ML 23：稳定 Softmax 与 log-sum-exp', kind: 'code', duration: 40, week: 1, prereqs: [],
      goal: '掌握 axis、overflow 和 fused loss 的数值逻辑。', output: '稳定实现 + 极端 logits 测试。',
      prompt: '实现支持 batch 的 softmax。先写出输入 shape、归一化 axis 和稳定化步骤。',
      construct: '用很大正/负 logits、相同 logits 和 float16 测试。比较概率和、NaN/Inf，并说明何时使用 log-softmax。',
      transfer: '在 decoder attention 中某一行全部被 mask。直接 softmax 会发生什么？你如何定义安全行为？',
      hints: ['减去每行最大值不改变 softmax。', 'keepdims 能避免错误 broadcast。', '全 mask 行需要显式策略；负无穷与低精度组合要单独测试。'],
      rubric: ['max subtraction 和 axis 正确。', 'batch broadcast 正确。', '测试覆盖极端值。', '能迁移到 masked attention 与 fused CE。'],
      exit: '用一句公式和一句工程解释说明为什么要减最大值。'
    },
    {
      id: 'k3-leakage', cluster: 'K3', title: '数据切分：识别隐蔽 leakage', kind: 'debug', duration: 40, week: 4, prereqs: ['k2-bias-variance'],
      goal: '从数据生成过程决定 split 和预处理边界。', output: 'leakage checklist + 正确 split 图。',
      prompt: '同一用户有多段视频，帧级随机切分得到很高指标。列出至少四种可能泄漏。',
      construct: '重新设计 group/time/device split。标出 sampling、augmentation、normalization、feature selection 在何处拟合。',
      transfer: '上线后新设备和新地区占比上升，但 label 延迟两周。你如何区分 leakage、shift 和 metric lag？',
      hints: ['先画出样本之间的共享来源。', '任何利用全数据统计量的预处理都可能泄漏。', '把 identity、time、device、scene 和 post-event information 分开审计。'],
      rubric: ['从生成过程而不是文件名判断独立性。', '预处理只在 train 内拟合。', 'split 与目标泛化场景一致。', '能区分泄漏、漂移与标签延迟。'],
      exit: '给出一个“看起来合理但错误”的 split，并用一句话指出泄漏路径。'
    },
    {
      id: 'k3-metrics', cluster: 'K3', title: '指标选择：从 accuracy 到错误成本', kind: 'design', duration: 40, week: 4, prereqs: [],
      goal: '让离线指标与产品决策和失败成本对齐。', output: 'metric decision table + threshold policy。',
      prompt: '一个少数类失败会严重伤害体验的视觉模型，为什么 accuracy 不够？你怎样选择 metric 和 threshold？',
      construct: '列出 offline、serving、UX、business 四层指标；写出 FP/FN 成本、slice 和 acceptance gate。',
      transfer: '模型 A PR-AUC 更高，模型 B 校准更好且 p95 更低。移动端自动触发功能应选谁？还缺什么实验？',
      hints: ['先定义决策和错误成本，不先选指标。', '排序指标、校准、阈值点指标解决不同问题。', '全局指标之外至少检查高风险 slice 和置信区间。'],
      rubric: ['指标与具体决策相连。', '区分排序、校准和阈值表现。', '覆盖 slice 与不确定性。', '能在质量、延迟和产品成本间做决定。'],
      exit: '用四行写出 offline、serving、UX、business 指标各一个。'
    },
    {
      id: 'k3-drift', cluster: 'K3', title: '线上无真值：漂移与 silent failure', kind: 'design', duration: 45, week: 4, prereqs: ['k3-leakage', 'k3-metrics'],
      goal: '设计无即时标签时的质量监控与数据闭环。', output: '监控层级 + 告警/降级/回标策略。',
      prompt: '区分 covariate shift、label shift、concept drift。线上暂时没有 ground truth 时，各自如何检测？',
      construct: '设计输入、embedding、prediction、行为 proxy、系统健康和延迟标签六层监控；说明阈值与误报成本。',
      transfer: '模型输出影响用户行为，新的反馈数据被选择性采集。如何避免把反馈闭环变成自我强化偏差？',
      hints: ['可观测 proxy 不等于真实质量。', '比较分布前先检查采样和 instrumentation 是否改变。', '保留 exploration、随机审计集或独立标注通道。'],
      rubric: ['三种 shift 定义正确。', '监控层级与局限清楚。', '有告警、降级和回标闭环。', '识别反馈选择偏差。'],
      exit: '没有 ground truth 时，写出你最信任和最不信任的两个 proxy，并说明原因。'
    },
    {
      id: 'k4-adam', cluster: 'K4', title: 'Deep-ML 49：Adam、bias correction 与 AdamW', kind: 'code', duration: 45, week: 3, prereqs: ['k2-bias-variance'],
      goal: '从公式实现优化器并解释状态与失败模式。', output: 'Adam update + 数值测试 + AdamW 对比。',
      prompt: '闭卷写 Adam 更新。说明 m、v、step、bias correction 和 epsilon 的位置。',
      construct: '在一维二次函数上测试；比较 SGD。检查 step 从 1 开始、状态初始化、epsilon 与参数 dtype。',
      transfer: '端侧训练或巨大 embedding 使 optimizer state 成为内存瓶颈。你会改变什么，如何验证质量影响？',
      hints: ['m 和 v 的零初始化造成早期偏差。', 'bias correction 的指数使用当前 step。', 'AdamW 的 weight decay 与把 L2 加进梯度并不总等价。'],
      rubric: ['更新公式和 step 正确。', 'bias correction 正确。', '能解释 AdamW。', '能迁移到状态内存与低精度。'],
      exit: '不看公式，按顺序写出 Adam 一步更新的五个动作。'
    },
    {
      id: 'k4-batchnorm', cluster: 'K4', title: 'Deep-ML 115：BCHW BatchNorm 与 train/eval', kind: 'code', duration: 45, week: 2, prereqs: [],
      goal: '掌握归一化轴、运行统计和部署差异。', output: 'BCHW 实现 + framework parity。',
      prompt: '输入 NCHW/BCHW 时，BatchNorm 对哪些轴统计？gamma/beta 的 shape 是什么？',
      construct: '实现当前 batch 归一化，并用框架对照。补充 running mean/variance、momentum、train/eval 和 fuse 的说明。',
      transfer: 'batch=1 的实时视频模型在设备上闪烁，离线验证正常。BatchNorm 可能如何参与，怎样证伪？',
      hints: ['每个 channel 独立，统计 N/H/W。', '教学实现只覆盖当前 batch，不等于推理行为。', '检查 running stats、导出模式、fold 精度和输入分布。'],
      rubric: ['统计轴与 broadcast 正确。', '区分 batch stats 和 running stats。', '理解 train/eval/export。', '能连接小 batch 与视频稳定性。'],
      exit: '用 shape 说明 NCHW BatchNorm 的 mean、variance、gamma、beta。'
    },
    {
      id: 'k4-mixed-precision', cluster: 'K4', title: 'Deep-ML 160：Mixed Precision 与 loss scaling', kind: 'debug', duration: 45, week: 3, prereqs: ['k4-adam'],
      goal: '理解计算、累加、master state 和 overflow 的 dtype 边界。', output: '低精度训练流程图 + overflow 测试。',
      prompt: '为什么 mixed precision 不是把所有 tensor 直接 cast 成 float16？',
      construct: '写出 forward、scaled loss、backward、unscale、overflow check、optimizer step 的顺序。标注每一步 dtype。',
      transfer: '训练不 NaN，但最终精度慢慢下降。除了 overflow，还要检查哪些低精度误差和算子？',
      hints: ['区分计算 dtype、参数 master copy 和累加 dtype。', '必须先 unscale 再做 clipping/overflow decision。', '关注 reduction、normalization、softmax 和小梯度 underflow。'],
      rubric: ['流程顺序正确。', 'dtype 边界明确。', 'loss scaling 与 overflow 处理正确。', '能诊断 silent accuracy loss。'],
      exit: '用六步列出动态 loss scaling 的一次成功更新和一次 overflow 更新。'
    },
    {
      id: 'k4-training-debug', cluster: 'K4', title: '训练故障：先证伪代码和数据，再调参', kind: 'debug', duration: 45, week: 3, prereqs: ['k2-bias-variance'],
      goal: '建立最小、可区分的训练诊断顺序。', output: '故障树 + 三个最小实验。',
      prompt: '新网络无法 overfit 一个很小的 batch。你的排查顺序是什么？',
      construct: '按 data/label、forward/loss、gradient/update、state/mode、precision/distributed 分类；每类给一个最小实验。',
      transfer: '单卡可 overfit，小 batch 多卡训练失败。你如何区分 BatchNorm、loss reduction、seed/state 和通信问题？',
      hints: ['先固定一个 batch、seed 和 deterministic path。', '逐层检查数值、梯度是否存在以及参数是否真的更新。', '多卡问题先做 1 device → 2 device 的最小差分。'],
      rubric: ['排查顺序减少变量。', '每个假设有可区分实验。', '避免先盲调学习率。', '能处理单卡/多卡差异。'],
      exit: '如果只能做三个实验，写出顺序和每个实验能排除什么。'
    },
    {
      id: 'k5-conv', cluster: 'K5', title: 'Deep-ML 41 / C1：Conv2D shape 与实现', kind: 'code', duration: 50, week: 2, prereqs: [],
      goal: '连接卷积公式、张量布局、代码与复杂度。', output: '多通道 Conv2D baseline + shape tests。',
      prompt: '给定 NCHW 输入、OICH kernel、stride/padding/dilation，先写输出 shape，再实现 baseline。',
      construct: '测试非方形输入、stride>1、padding、dilation 和多通道。说明时间复杂度与内存访问。',
      transfer: '设备 runtime 只支持 NHWC 且 depthwise conv 有专用 kernel。你如何改变 layout、groups 和验证策略？',
      hints: ['先只写单样本单输出位置的索引公式。', 'effective kernel = dilation × (kernel-1) + 1。', '把 N/O/H/W、C/I/KH/KW 的循环和 layout 分开考虑。'],
      rubric: ['输出 shape 正确。', '索引、padding、channel reduction 正确。', '测试覆盖非方阵与 dilation。', '能迁移到 layout/groups/runtime。'],
      exit: '不看代码，写出 output H/W 公式和一次输出的 reduction 维度。'
    },
    {
      id: 'k5-dice', cluster: 'K5', title: 'Deep-ML 73：Dice、soft Dice 与空 mask', kind: 'code', duration: 35, week: 2, prereqs: [],
      goal: '把 segmentation 指标与训练 loss、阈值和边界场景区分。', output: 'Dice 实现 + 空集合约定 + slice tests。',
      prompt: '实现 binary Dice。双空 mask 应返回什么？先明确产品和评估约定。',
      construct: '比较 hard Dice、soft Dice、per-image/micro/macro。测试全空、全正、细目标和 threshold 变化。',
      transfer: '总体 Dice 提升，但发丝边界主观变差。你会增加什么 loss、metric 和人工评估？',
      hints: ['2TP/(2TP+FP+FN) 与集合形式等价。', 'epsilon 的位置会影响双空和小目标。', '区域 overlap 指标不能完整描述边界和感知质量。'],
      rubric: ['公式与空集合约定明确。', '区分 hard/soft 与聚合方式。', '测试小目标和阈值。', '能连接边界/主观质量。'],
      exit: '写出 Dice 的 confusion-matrix 形式，并说明一个它看不见的失败。'
    },
    {
      id: 'k5-bokeh', cluster: 'K5', title: '系统链路：Depth-aware Bokeh', kind: 'design', duration: 50, week: 2, prereqs: ['k5-conv', 'k5-dice'],
      goal: '把模型输出放回相机、视频、渲染和发布系统。', output: '端到端链路图 + failure taxonomy。',
      prompt: '设计实时移动端人像虚化：从输入、segmentation/depth 到渲染、时序和发布。',
      construct: '包含色彩/坐标、边缘处理、散景核、时序、延迟预算、fallback、golden set 和 rollout。',
      transfer: '夜景逆光多人视频出现 halo、闪烁和发热。你按什么顺序定位并选择降级？',
      hints: ['先定义体验目标和 SLO，再选模型。', '分开模型错误、坐标/色彩错误、渲染错误和时序错误。', '为每类 failure 定义可观察信号和降级。'],
      rubric: ['端到端链路完整。', '边缘/时序/色彩问题具体。', '有 latency/thermal 预算。', '有发布、监控、回滚和降级。'],
      exit: '用八个框画出最小可工作的 bokeh pipeline，并指出最危险的两个接口。'
    },
    {
      id: 'k5-temporal', cluster: 'K5', title: '视频时序：单帧好为何仍会闪烁？', kind: 'debug', duration: 40, week: 2, prereqs: ['k5-bokeh'],
      goal: '从模型、输入、关联、后处理和渲染诊断 temporal failure。', output: '时序指标 + 最小诊断实验。',
      prompt: '逐帧 segmentation 指标很好，但视频明显闪烁。列出根因层级和可观测信号。',
      construct: '设计 temporal consistency 指标、光流/warp 检查、静态场景测试、状态重置测试和主观评审。',
      transfer: '加入 temporal smoothing 后闪烁下降，但快速运动拖影。如何设计自适应策略和 acceptance gate？',
      hints: ['先区分输入抖动、模型输出、tracking/state 和渲染。', '单帧 GT 不足以度量时间稳定性。', '平滑有延迟和 ghosting 代价，应随运动/置信度变化。'],
      rubric: ['根因层级完整。', '指标与实验能区分原因。', '理解稳定性与响应性的权衡。', '有场景化 gate。'],
      exit: '给出一个不依赖人工标签的 temporal proxy，并说明它可能误导的情况。'
    },
    {
      id: 'k5-neural-fields', cluster: 'K5', title: 'VSCV-4：坐标网络、SIREN 与频率偏置', kind: 'code', duration: 50, week: 2, prereqs: ['k5-conv'],
      goal: '把 neural field 从论文名还原为可测试的 coordinate-to-signal 函数。', output: '三种坐标 MLP 对照 + 频谱/导数误差解释。',
      prompt: '用 fθ(x, y) → RGB 表示一张图。普通 ReLU、positional features 和 sine activation 会怎样影响高频拟合与优化？',
      construct: '固定参数量、采样、训练步数和 seed，比较 ReLU MLP、ReLU + Fourier features、SIREN；检查平滑区、细纹理、锐边和噪声，记录 PSNR、时间、频谱与梯度误差。',
      transfer: '模型训练 PSNR 很高，但未采样坐标插值出现振铃，图像梯度也不稳定。你如何区分表示、初始化、频率上限、采样和过拟合？',
      hints: ['先写清输入坐标范围、输出范围和采样协议。', '高频表达能力不等于更好的泛化；观察频域与导数。', 'SIREN 的激活、频率参数和初始化必须一起讨论。'],
      rubric: ['coordinate field 与 shape 明确。', '对照公平且有 slice。', '能解释 spectral bias、初始化和噪声。', '结论来自自己的实验或明确标记为待验证。'],
      exit: '用表示、架构、forward map、generalization 四轴解释 neural field，并给一个 SIREN 可能不占优的场景。'
    },
    {
      id: 'k5-view-synthesis', cluster: 'K5', title: 'VSCV-5：神经场新视角合成系统', kind: 'design', duration: 50, week: 2, prereqs: ['k5-neural-fields'],
      goal: '连接相机几何、场景表示、可微渲染、评估和部署取舍。', output: 'camera-to-renderer 系统图 + 表示决策表 + failure tests。',
      prompt: '设计一个从手机多视角视频生成可交互新视角的系统；先给最小 baseline，再选择 NeRF、Gaussian、mesh、light field 或 hybrid。',
      construct: '标出内外参、ray、sample/query、volume/raster rendering、loss 和 gradient path；加入 held-out trajectory、pose noise、动态主体、反光/透明、PSNR/LPIPS/人工评审、训练与渲染预算。',
      transfer: 'PSNR 提升但几何更差，且移动端首帧和显存超预算。如何证明问题来自表示、pose、renderer、采样还是评估泄漏，并选择降级？',
      hints: ['体渲染先解释 T、alpha、color，再谈加速。', '相邻帧随机切分会夸大 novel-view 泛化。', '固定 renderer 换表示、固定表示扰动 pose/采样，做可区分消融。'],
      rubric: ['坐标与可微路径完整。', '表示选择对应产品约束。', '评估能发现几何错误和泄漏。', '覆盖失败、部署、回退与回滚。'],
      exit: '比较 radiance field、Gaussian 和 light field：每种给一个优势、一个硬代价和一个最小验证。'
    },
    {
      id: 'k6-parity', cluster: 'K6', title: '三层 Parity：训练、转换、设备', kind: 'debug', duration: 45, week: 3, prereqs: ['k5-conv'],
      goal: '定位导出和运行时差异，而不是只比较最终输出。', output: 'tensor contract + layer-wise parity checklist。',
      prompt: 'PyTorch 正常，ONNX 接近，真实设备明显变差。如何建立三层 parity test？',
      construct: '标出输入预处理、layout、resize/padding、关键中间 tensor、后处理、容差、版本与 golden cases。',
      transfer: '设备后端融合了算子，无法导出每层中间结果。你如何缩小问题范围？',
      hints: ['先冻结输入 bytes 和所有预处理参数。', '从第一个偏离的可观测边界开始二分。', '可插入临时 identity/output taps，或分段构建子图。'],
      rubric: ['输入契约明确。', '比较关键中间层而非只看终值。', '容差考虑 dtype/量化。', '能在不可观测后端中做二分。'],
      exit: '写出 parity checklist 的前五项，按执行顺序排列。'
    },
    {
      id: 'k6-latency', cluster: 'K6', title: '端到端 Latency Budget 与 Profiling', kind: 'design', duration: 45, week: 3, prereqs: ['k6-parity'],
      goal: '用 trace 证明系统瓶颈，并管理 p95 和持续性能。', output: 'latency budget + profiler 决策树。',
      prompt: '把实时相机功能的延迟拆到采集、预处理、推理、后处理、渲染和 UI。为什么平均值不够？',
      construct: '定义 p50/p95、warmup、thermal、queueing、copy/sync 和 dropped frames。列出所需 trace。',
      transfer: '模型 FLOPs 降低 40%，端到端延迟只降 5%。给出假设优先级和验证方式。',
      hints: ['先区分 compute、bandwidth、copy、sync、queue 和 thermal。', '测量必须有同一 workload、warmup 和设备状态。', 'FLOPs 不包含所有 kernel launch、layout conversion 和 memory traffic。'],
      rubric: ['预算覆盖端到端。', '使用分位数和持续性能。', '假设由 trace 验证。', '能解释 FLOPs 与 latency 脱钩。'],
      exit: '只用四类证据判断系统是 compute-bound 还是 memory/sync-bound。'
    },
    {
      id: 'k6-queue', cluster: 'K6', title: '实时流：背压、丢帧与关闭协议', kind: 'code', duration: 45, week: 3, prereqs: [],
      goal: '将队列实现与实时体验、线程安全和生命周期连接。', output: '固定容量 queue 伪代码 + 状态机测试。',
      prompt: '生产者快于消费者时，比较 blocking、drop newest、drop oldest 和处理旧帧的后果。',
      construct: '实现或写出线程安全 bounded queue；覆盖 close、timeout、spurious wakeup、double close 和 producer/consumer 退出。',
      transfer: '视频 pipeline 需要低延迟且必须保留关键帧。如何设计优先级和丢弃策略？',
      hints: ['先定义 queue 的状态：open、closing、closed。', '条件变量应在 while predicate 中等待。', '低延迟流通常关心最新数据，但关键事件可能需要单独通道。'],
      rubric: ['策略与产品语义一致。', '关闭协议无死锁/丢通知。', '测试并发边界。', '能设计关键帧例外。'],
      exit: '用一个状态机说明 close 后 push/pop 分别应该怎样表现。'
    },
    {
      id: 'k7-binary-search', cluster: 'K7', title: 'LC 704：固定一种 Binary Search 不变量', kind: 'code', duration: 35, week: 1, prereqs: [],
      goal: '用区间不变量消除 off-by-one。', output: '实现 + 空/单/重复/边界测试。',
      prompt: '选择闭区间或半开区间模板。先说循环中区间代表什么，再写代码。',
      construct: '实现 exact search，再改写 lower_bound。测试空数组、单元素、目标不存在和重复值。',
      transfer: '条件不再是数组值，而是一个昂贵的单调可行性函数。如何控制调用次数和防止溢出？',
      hints: ['先写 invariant，再决定 while 条件。', 'mid 计算考虑整数溢出。', 'lower_bound 寻找第一个满足 predicate 的位置。'],
      rubric: ['区间语义自洽。', '更新不会漏解或死循环。', '测试边界充分。', '能迁移到 answer search。'],
      exit: '不看代码，写出你的 invariant、循环条件和左右更新。'
    },
    {
      id: 'k7-lru', cluster: 'K7', title: 'LC 146：LRU、并发与内存上限', kind: 'code', duration: 50, week: 3, prereqs: [],
      goal: '把哈希 + 双链表实现连接到 ownership 和并发。', output: 'O(1) get/put + 结构不变量 + tests。',
      prompt: '先说明 map 和双向链表分别保存什么，哪些操作必须 O(1)。',
      construct: '实现 get/put/evict。测试 capacity=0/1、更新已有 key、重复访问。说明 C++ ownership 与并发锁粒度。',
      transfer: 'value 很大且加载昂贵，多个线程同时 miss 同一个 key。如何避免 cache stampede？',
      hints: ['使用 dummy head/tail 可简化边界。', 'map 指向 node；每次访问移动到 MRU。', '并发 miss 可用 single-flight、per-key future 或请求合并。'],
      rubric: ['数据结构和不变量正确。', '所有核心操作 O(1)。', '边界测试完整。', '能扩展到并发和大 value。'],
      exit: '用三句话证明 get 和 put 为什么是 O(1)，并指出最常见的指针错误。'
    },
    {
      id: 'k7-graph', cluster: 'K7', title: '图模式：Number of Islands → Clone Graph', kind: 'code', duration: 50, week: 4, prereqs: [],
      goal: '掌握 visited、深拷贝映射、环和大图内存。', output: 'BFS/DFS 实现 + 图不变量。',
      prompt: '比较网格 connected components 与一般图 clone：visited 分别保存什么？',
      construct: '先实现 Number of Islands，再写 Clone Graph 的 old→new map。测试空图、自环、断连、共享邻居。',
      transfer: '图是一个计算 DAG，但节点可共享 tensor，且部分边形成控制循环。clone 语义应如何定义？',
      hints: ['网格 visited 可以原地标记；clone 必须保存映射。', '创建新节点后立刻登记，再递归/入队。', '先定义深拷贝哪些对象、共享哪些资源。'],
      rubric: ['visited/mapping 语义正确。', '处理环和共享节点。', '复杂度按 V+E。', '能讨论 production clone contract。'],
      exit: '解释为什么 clone 中必须“先登记、后递归”。'
    },
    {
      id: 'k8-transformer', cluster: 'K8', title: 'G1 / DML 53：Transformer block 与 Attention shape', kind: 'explain', duration: 45, week: 5, prereqs: ['k2-softmax'],
      goal: '用 shape、数值和 residual path 走完 Transformer block。', output: '数据流图 + Q/K/V shape + 复杂度。',
      prompt: '完整走一遍 pre-norm Transformer block。为什么 attention score 除以 sqrt(dk)？',
      construct: '写出 batch、sequence、heads、head_dim 的 shape 变化；标出 softmax axis、residual 和 FFN。',
      transfer: 'sequence 长度增长 4 倍。训练 activation、prefill 和 decode 的主要成本分别如何变化？',
      hints: ['先从 B×T×D 投影到 heads。', 'score shape 是 B×H×Tq×Tk。', '训练全序列 attention 与增量 decode 的计算/缓存行为不同。'],
      rubric: ['block 顺序和 residual 正确。', 'shape 与 softmax axis 正确。', '缩放解释正确。', '能区分训练、prefill、decode。'],
      exit: '只用 shape 和三个动词走完一次 self-attention。'
    },
    {
      id: 'k8-masked-attention', cluster: 'K8', title: 'DML 107：Causal / Padding Mask 与全 mask 行', kind: 'code', duration: 45, week: 5, prereqs: ['k8-transformer'],
      goal: '实现 mask broadcast 并处理低精度边界。', output: 'masked attention + shape tests。',
      prompt: '实现 causal masked self-attention。mask 在 softmax 前还是后，为什么？',
      construct: '测试 causal、padding、组合 mask、不同 batch 和全 mask 行。检查 float16 的负大数和 NaN。',
      transfer: 'KV cache decode 每次 query 长度为 1。mask 与 position 如何变化？',
      hints: ['mask 应阻止被屏蔽位置参与归一化。', '明确 bool mask 的 True 是 keep 还是 block。', 'decode 时 key 长度增长，query 对应当前绝对位置。'],
      rubric: ['mask 时机和语义正确。', 'broadcast shape 正确。', '处理全 mask/低精度。', '能迁移到 KV cache decode。'],
      exit: '说明 causal mask、padding mask 和 attention score 三者的 shape 与组合方式。'
    },
    {
      id: 'k8-smol-sft', cluster: 'K8', title: 'Smol Course SC-1/2/4：Chat Template、SFT 与评测', kind: 'debug', duration: 50, week: 5, prereqs: ['k8-transformer', 'k3-metrics'],
      goal: '把后训练拆成可验证的数据、token、loss mask、更新和行为评测闭环。', output: 'template parity test + SFT smoke plan + 三层 eval matrix。',
      prompt: '同一 conversation 怎样变成训练 token 与生成 prompt？add_generation_prompt、EOS、assistant/completion mask 错误分别会怎样失败？',
      construct: '选择窄任务，冻结 base/instruct baseline 与 held-out slices；展开一条样本的 token 和 loss mask，审计 split/近重复；设计 16–64 条 overfit、LoRA smoke、目标/回归/资源评测和停止门槛。',
      transfer: 'Train loss 持续下降，但任务成功率不升、拒答变差且输出更长。按数据、template/mask、表示容量、优化和评测泄漏设计可区分实验。',
      hints: ['Chat model 仍在预测 token，role/content 必须落到控制 token。', '先 overfit 小样本证明 update path，再扩大训练。', '必须比较 prompt/RAG baseline，证明 SFT 确有必要。'],
      rubric: ['训练/推理 template 与 token 契约明确。', 'loss mask 可逐 token 解释。', '有 frozen baseline、slice 和 regression。', '结论包含版本、资源和失败样本。'],
      exit: '用 90 秒解释为什么 notebook 跑通和 loss 降低都不等于后训练成功。'
    },
    {
      id: 'k8-smol-dpo', cluster: 'K8', title: 'Smol Course SC-5：DPO、Reference 与偏好陷阱', kind: 'explain', duration: 50, week: 5, prereqs: ['k8-smol-sft'],
      goal: '从 log-probability margin 理解 DPO，并验证 preference data 是否代表目标。', output: 'DPO 公式推导 + pair audit + β 对照实验。',
      prompt: '给定同一 prompt 的 chosen/rejected 和 reference policy，写出 DPO margin 与 loss；β、reference 分别控制什么？',
      construct: '审计 preference pair 的 prompt/template 一致性、长度/风格 proxy、agreement、tie、事实/安全冲突；固定数据做 SFT-only 与三档 β 对照，记录 reward margin、chosen/rejected log-prob、目标胜率、长度与回归。',
      transfer: 'DPO reward accuracy 上升，但 chosen 绝对概率下降、回答更短且事实性变差。为什么可能发生，怎样决定回滚、修数据或改目标？',
      hints: ['比较的是 policy 相对 reference 的 chosen/rejected margin。', 'DPO 不保证 chosen 的绝对概率一定上升。', '当前 TRL 定义中更高 β 表示更少偏离 reference。'],
      rubric: ['公式、符号和 reference 正确。', 'β 方向与版本来源明确。', '能识别偏好捷径和噪声。', '评测同时覆盖目标、事实、安全与通用回归。'],
      exit: '不看资料写出 DPO loss，并给一个 reward margin 上升但产品质量下降的反例。'
    },
    {
      id: 'k8-smol-vlm', cluster: 'K8', title: 'Smol Course SC-6：VLM Processor、LoRA 与视觉证据', kind: 'design', duration: 50, week: 5, prereqs: ['k8-smol-sft'],
      goal: '把文本后训练协议扩展到图像/视频输入，并证明模型确实使用视觉证据。', output: 'VLM data/processor contract + LoRA 边界 + slice/ablation eval。',
      prompt: 'VLM 的 processor、multimodal chat template、视觉 token、vision encoder/projector/LM 各负责什么？训练时哪些部分冻结或适配？',
      construct: '设计小规模 VLM SFT：锁定 resize/crop/normalization、processor/template revision、image-text alignment、LoRA target 和 max-length；加入文字密集、细小目标、计数、遮挡、低照、无关图与不可回答 slices。',
      transfer: 'VQA 分数提高，但图像置换后答案几乎不变；另有样本因截断丢掉 image token。如何定位语言先验、collator、processor、template 和训练目标问题？',
      hints: ['多模态 template 通常在 processor，而不只在 tokenizer。', '图像占位符会扩展为视觉 token，截断前必须验证。', '做图像置换、遮挡、text-only 和反事实对照。'],
      rubric: ['图像到 token 的数据流完整。', '冻结/LoRA/量化边界有资源依据。', '评测能区分视觉证据与语言先验。', '覆盖坏图、截断、部署 parity 与回退。'],
      exit: '给出三个能证明 VLM 使用图像而非只靠问题先验的对照实验。'
    },
    {
      id: 'k8-sensenova-unified', cluster: 'K8', title: 'SenseNova-U1 SNU1-1/2/3：NEO-unify、MoT 与联合目标', kind: 'explain', duration: 50, week: 5, prereqs: ['k8-transformer', 'k8-smol-vlm'],
      goal: '从视觉接口、token 路由、attention mask 和训练目标解释“原生统一”的精确边界。', output: '典型 VLM vs NEO-unify 对照图 + 三类 token mask + 双目标诊断卡。',
      prompt: 'SenseNova-U1 去掉 VE/VAE 后，pixels/text 怎样进入同一序列？理解流与生成流共享什么、解耦什么？',
      construct: '画 stride-32 patch interface、time/height/width RoPE、clean/noise token 的 MoT 路由与 attention block；写 L=λtext·CE+λvision·flow-MSE，并列出两条流各自的观测指标和干扰实验。',
      transfer: '联合训练总 loss 下降，但 OCR/理解保持稳定、编辑 preservation 退化。怎样区分数据比例、loss scale、错误 mask、CFG、容量与评测问题？',
      hints: ['Near-lossless 是待验证主张，不是数学无损。', '统一序列/attention 不代表 projection、norm、FFN 全共享。', 'clean token 不应读取 noise token；总 loss 要拆开看。'],
      rubric: ['视觉接口与典型 VE/VAE 路线比较准确。', '三类 token mask 和因果边界正确。', '共享/解耦与参数名义说清。', 'CE/flow 指标和干扰实验可执行。'],
      exit: '用 90 秒解释 SenseNova-U1 统一了什么、没有统一什么，并给一个可证伪实验。'
    },
    {
      id: 'k8-sensenova-eval-runtime', cluster: 'K8', title: 'SenseNova-U1 SNU1-7/8/9/10：评测、显存与解耦推理', kind: 'design', duration: 50, week: 5, prereqs: ['k8-sensenova-unified', 'k3-metrics'],
      goal: '把统一多模态 checkpoint 变成可复现、可扩缩、可回退的理解—生成服务。', output: '四层 eval matrix + resource card + LightLLM/LightX2V 部署决策。',
      prompt: '为什么统一模型在生产上仍拆理解与生成引擎？怎样为理解、T2I、编辑和交错生成定义不同 SLO 与验收？',
      construct: '给定流量比例和硬件，比较 separate/colocate、full/GGUF/offload；记录 GPU/host RAM、H2D、首 token/每步/E2E；设计 exact/OCR/VLM-judge/人工四类评测、cache hash、失败分母和 release gate。',
      transfer: 'Q4+balanced 可在 16 GB GPU 启动，但 p95 变差、host RAM 紧张；榜单又因 judge/cache 配置变化而上升。你如何定位、重跑、降级或回滚？',
      hints: ['8B-MoT 总权重约 17.552B；active、total 和 runtime memory 分开。', '理解和生成有不同并行、batch 与扩缩工作点。', 'judge、分辨率、seed、失败忽略和 cache 都属于评测版本。'],
      rubric: ['四种任务的指标与 SLO 分开。', '资源核算包含 host/transfer/activation。', '部署选择由流量和故障域驱动。', 'judge 校准、失败分母、版本与回滚完整。'],
      exit: '给出一个“模型更统一但运行时更解耦”的发布方案，并说明三项阻断发布的证据。'
    },
    {
      id: 'k8-rag-eval', cluster: 'K8', title: 'RAG：拆开检索与生成评估', kind: 'design', duration: 50, week: 5, prereqs: ['k3-metrics'],
      goal: '建立 component、end-to-end、citation 和 abstention 评估。', output: 'RAG eval matrix + release gate。',
      prompt: '设计企业 RAG 的评估：如何分别判断 retrieval 和 generation 的问题？',
      construct: '定义 recall@k/MRR/nDCG、faithfulness、answer relevance、citation correctness、abstention、latency/cost 和 slice。',
      transfer: 'reranker 提高 retrieval metric，但最终答案变差且更慢。你如何定位并决定是否发布？',
      hints: ['先建立带 evidence 的 query set 和 unanswerable cases。', '检索命中不等于生成使用了证据。', '检查 context ordering、distractors、prompt、latency 和 threshold。'],
      rubric: ['组件与端到端评估分开。', '包含不可回答和 citation。', '有 slice、成本和延迟。', '能处理 metric 冲突并做发布决策。'],
      exit: '用一个 2×3 矩阵列出 retrieval、generation、end-to-end 的离线与线上信号。'
    },
    {
      id: 'k8-agent-loop', cluster: 'K8', title: 'Agent Book Ch1：ReAct 循环与 Harness 边界', kind: 'explain', duration: 40, week: 5, prereqs: [],
      goal: '把 Agent 从“会调工具的模型”拆成可控制、可验证的运行系统。', output: 'ReAct 轨迹图 + 模型面/控制面职责表。',
      prompt: '闭卷解释 Agent = LLM + 上下文 + 工具。静态前缀、运行轨迹、循环控制和验证分别解决什么问题？',
      construct: '画出 LLM → action → tool/environment → observation → LLM；再标出 Harness 的模型访问、上下文组装、工具执行、循环控制与验证职责。',
      transfer: '把任务改成严格合规的付款操作。哪些决定可以留给模型，哪些必须进入确定性控制面？',
      hints: ['先区分模型生成提议与系统授权执行。', '上下文不仅是用户 prompt，还包含工具定义、历史与结果。', '用失败模式说明每个 Harness 职责为什么存在。'],
      rubric: ['三大组成与 ReAct 轨迹正确。', '模型面和控制面边界清楚。', '能说明 workflow/autonomy 的连续谱。', '每个架构组件对应可观察失败。'],
      exit: '用 90 秒解释为什么更强模型仍不能替代 Harness。'
    },
    {
      id: 'k8-hello-agent-patterns', cluster: 'K8', title: 'Hello-Agents HA-1/2：三范式与最小运行时故障实验', kind: 'debug', duration: 55, week: 5, prereqs: ['k8-agent-loop'],
      goal: '用可重放实验比较 ReAct、Plan-and-Solve、Reflection 与固定 workflow，而不是按框架名称选型。', output: '四方案 trace 对照 + 最小 runtime contract + 故障矩阵。',
      prompt: '同一窄任务中，三种 Agent 范式分别在哪里保存计划、选择行动、使用观察、纠错和停止？什么证据能证明它优于固定 workflow？',
      construct: '用 fake model、两个无副作用工具和 12 条本地样本实现可重放状态机；记录 state/action/observation/error/stop_reason，并注入格式错误、未知工具、超时、空结果、重复观察、计划过期、反思无增益与最大步数。比较成功率、步骤、无效调用、循环和成本。',
      transfer: 'Reflection 版本在简单题得分更高，但高风险任务中重复放大了第一步错误。怎样用 verifier、反思增益、次数上限和失败关闭重设计？何时应退回固定 workflow？',
      hints: ['先冻结任务、样本、工具和停止门槛，再比较范式。', 'Message、Agent、Model adapter、ToolRegistry 和 trace store 是 contract；框架 API 只是实现。', '计划、观察和反思都可能错；每一步都需要可观察状态与确定性边界。'],
      rubric: ['四方案在同一任务分布上公平比较。', 'runtime contract 可替换模型/工具且可重放。', '故障注入覆盖循环、格式、工具和终止。', '结论包含失败分母、成本与退回 workflow 的条件。'],
      exit: '闭卷画出最小 Agent runtime，并用一条失败 trace 解释为什么选某种范式或不用 Agent。'
    },
    {
      id: 'k8-context-harness', cluster: 'K8', title: 'Agent Book Ch2-3：上下文预算、缓存、记忆与压缩', kind: 'design', duration: 50, week: 5, prereqs: ['k8-agent-loop'],
      goal: '在正确性、缓存、时效、隐私和恢复之间设计上下文。', output: 'context budget + memory/RAG 生命周期图。',
      prompt: '系统/工具静态前缀、状态栏、用户输入、模型响应、工具结果和长期记忆应如何组织？哪些内容可以压缩或隔离？',
      construct: '为每类信息列 token、变化频率、可信边界、缓存影响、淘汰/压缩策略和恢复来源；再画记忆写入、检索、更新、删除与审计链。',
      transfer: '一个跨会话任务必须保留审计轨迹，但每轮写入当前时间会破坏缓存。怎样同时保持时间感知、可恢复性与稳定前缀？',
      hints: ['静态前缀与动态轨迹分层。', '摘要不是原始事实的可靠替代；保留可追溯来源。', '区分会话状态、用户记忆、组织知识与可执行规则。'],
      rubric: ['消息/轨迹组成完整。', '解释 KV/Prompt Cache 约束。', '压缩有信息损失与恢复策略。', '覆盖时效、隐私、注入和删除。'],
      exit: '给出四类信息的保留、压缩、外置或删除决策，并说明一个反例。'
    },
    {
      id: 'k8-harness-three-layers', cluster: 'K8', title: '播客 AHP-1/2：Harness 会跑、跑久、跑稳', kind: 'design', duration: 50, week: 5, prereqs: ['k8-agent-loop', 'k8-context-harness'],
      goal: '用执行、状态、治理三层定位 Agent 失败，并校验节目中的强主张。', output: '三层架构图 + 主张—证据矩阵 + 故障路由。',
      prompt: '闭卷解释“会跑、跑久、跑稳”：每层拥有什么状态、暴露什么接口、出现什么失败、由谁验证？',
      construct: '为真实 Agent 填写三层的组件/状态/接口/失败信号/验证者；再校验 Model+Harness、Bash/CLI、more context less control、memory 自迭代四条主张。',
      transfer: '把任务改成高风险付款：哪些自由度可交给强模型，哪些权限、幂等、行为验收和人工升级必须确定性执行？',
      hints: ['节目框架用于定位，不是行业标准。', 'CLI 与 MCP 要在相同任务和权限约束下比较。', '指导性 context 不能替代 hook、sandbox 或 permission enforcement。'],
      rubric: ['三层边界与状态所有权清楚。', '观点、事实和实验结论分开。', '至少有一个公平对照和一个反例。', '高风险控制面不随模型能力被误删。'],
      exit: '用 90 秒给出一个从失败信号到层级归因、最小实验和 Harness 修复的完整例子。'
    },
    {
      id: 'k8-coding-agent', cluster: 'K8', title: 'Agent Book Ch5：Coding Agent 的搜索-编辑-验证闭环', kind: 'debug', duration: 50, week: 5, prereqs: ['k8-context-harness'],
      goal: '用可恢复轨迹解释 Coding Agent，而不是把它缩减成代码生成。', output: '仓库任务 trace + 故障恢复协议。',
      prompt: '为什么“生成正确代码”不足以构成可靠 Coding Agent？搜索、文件编辑、命令执行、测试和停止条件如何闭环？',
      construct: '选择一个小仓库任务，记录每次搜索依据、最小 patch、验证结果和错误恢复；标注权限、工作区所有权与回滚点。',
      transfer: '两个 Agent 并行修改共享文件，其中一个测试失败、另一个已经基于旧文件继续工作。如何检测冲突并安全交接？',
      hints: ['先把最终结果与过程可靠性分开。', '每次编辑都需要可验证假设和最小作用域。', '共享文件系统需要 ownership、版本或显式消息契约。'],
      rubric: ['搜索-编辑-执行-验证闭环完整。', '失败后能恢复而非盲重试。', '权限与回滚边界明确。', '能处理并发冲突和过期上下文。'],
      exit: '列出一次安全代码修改从定位到提交前验证的六个证据点。'
    },
    {
      id: 'k8-harness-repo-map', cluster: 'K8', title: 'Harness Eng HE-1：仓库地图与渐进式披露', kind: 'design', duration: 45, week: 5, prereqs: ['k8-agent-loop'],
      goal: '让无对话历史的 Agent 从短入口找到任务所需的意图、结构和验证。', output: '仓库知识图 + 紧凑 AGENTS.md + dark-knowledge 清单。',
      prompt: '为什么“给 Agent 一本完整手册”通常不如“给一张可验证的地图”？哪些信息必须版本化进入仓库？',
      construct: '审计一个真实仓库：标出架构、SPEC、WORKFLOW、执行计划、验证命令与 owner；把至少 5 项外部或隐性知识路由到唯一真源，并检查链接。',
      transfer: '把任务交给一个没有聊天历史的新 Agent。它第一次走错时，只修复导航或真源，不追加一次性提示。',
      hints: ['入口负责路由，不承载全部细节。', 'Agent 无法发现的信息等同于不存在。', '为文档定义唯一真源、新鲜度和机械一致性检查。'],
      rubric: ['运行时与仓库 Harness 边界清楚。', '入口短、稳定且链接可达。', '隐性知识有归宿和 owner。', '用陌生 Agent 的导航证据验证。'],
      exit: '用 90 秒解释地图、真源和渐进式披露如何减少上下文浪费与知识腐烂。'
    },
    {
      id: 'k8-harness-backpressure', cluster: 'K8', title: 'Harness Eng HE-3：Guides × Sensors 与机械回压', kind: 'debug', duration: 50, week: 5, prereqs: ['k8-coding-agent', 'k8-harness-repo-map'],
      goal: '把高频、确定性的评审意见变成可执行、可修复的系统约束。', output: 'Guides × Sensors 矩阵 + 2 个机械检查。',
      prompt: '一个架构约束应放进文档、脚手架、linter、结构测试还是 AI review？请按行动前后与确定性分配。',
      construct: '选择两条重复 review comment，实现 linter/结构/一致性/行为检查；失败消息必须给规则、证据位置和修复方式，并用合法反例测试误报。',
      transfer: '面对“测试通过但关键用户旅程错误”，补哪类 sensor？为什么不能继续增加同类单元测试或只信模型自评？',
      hints: ['Guide 在行动前缩小搜索空间，sensor 在行动后验证。', '确定性检查广泛运行，推理型检查用于高风险 slice。', '回压必须阻止虚假完成并提供修复路径。'],
      rubric: ['四象限分类有依据。', '检查可重复且错误信息可行动。', '覆盖误报和逃逸样本。', '结构正确性与行为正确性分开。'],
      exit: '把一条主观 review 意见改写成可机械验证的不变量、失败证据和修复指令。'
    },
    {
      id: 'k8-agent-evaluation', cluster: 'K8', title: 'Agent Book Ch6：从总分到可行动的 Agent Eval', kind: 'design', duration: 55, week: 5, prereqs: ['k8-agent-loop', 'k3-metrics'],
      goal: '用可重复评估区分模型、上下文、工具和 Harness 缺陷。', output: 'eval matrix + model-swap/ablation 实验。',
      prompt: '如何为多工具 Agent 设计评估环境、任务数据集、verifier 和指标，使失败能路由到具体组件？',
      construct: '覆盖端到端成功、step/trace、工具选择与参数、终止、人工升级、延迟、成本、安全和高风险 slice；定义固定 Harness 换模型与固定模型做消融。',
      transfer: 'LLM judge 总分上升，但人工发现高风险 slice 的越权轨迹更多。如何校准 judge、抽检并设置上线阻断？',
      hints: ['先定义任务分布和可验证结果。', '最终成功可能掩盖危险或低效轨迹。', '模型替换定位模型问题，组件消融定位 Harness 贡献。'],
      rubric: ['环境、数据集、verifier 分开。', '端到端与过程指标完整。', '有 slice、不确定性和接受门槛。', '结果能映射到模型或 Harness 改动。'],
      exit: '用两组对照实验说明如何区分模型不足与 Harness 缺陷。'
    },
    {
      id: 'k8-hello-agent-capstone', cluster: 'K8', title: 'Hello-Agents HA-6/7：评测驱动的 Agent Capstone', kind: 'design', duration: 60, week: 6, prereqs: ['k8-hello-agent-patterns', 'k8-agent-evaluation', 'k8-agent-safety'],
      goal: '把教程项目压缩成单 Agent 优先、可复现、可故障注入和可面试答辩的系统证据。', output: '30 条 eval set + component/trace/E2E 矩阵 + 项目答辩包。',
      prompt: '为一个带检索与工具调用的窄任务定义非 Agent、固定 workflow 和单 Agent baseline。如何证明增加自治或第二个 Agent 确实改善目标，而不是只让 demo 更复杂？',
      construct: '建立 simple/multiple/parallel/irrelevance/unanswerable/注入/部分失败样本；分别验证工具 schema/参数、轨迹恢复/权限/终止、最终任务/延迟/成本。固定 Harness 换模型，再固定模型消融范式、工具描述、context policy 和 stop rule；交付锁定依赖、trace schema、三条失败 trace 与回滚条件。',
      transfer: '公开 benchmark 与 LLM judge 上升，但人工发现恶意来源 slice 越权增多，p95 和成本也超门槛。怎样校准 judge、补确定性 verifier、设置发布阻断，并判断修 Harness、换模型还是退回 workflow？',
      hints: ['公开 benchmark 只证明对应任务和版本，不替代产品验收。', '先交单 Agent baseline；只有隔离、并行或专业化收益可验证才增加 Agent。', '成功截图不是证据；保留版本、失败分母、trace、资源与残余风险。'],
      rubric: ['component、trace、end-to-end 指标分层。', '基线、消融、slice 与接受门槛预先定义。', '工具副作用、注入、人工校准与回滚完整。', '能用 12 分钟讲清问题、决策、失败、证据和下一实验。'],
      exit: '随机加入一个新故障，45 分钟内给出归因、最小复现、测试、修复和残余风险。'
    },
    {
      id: 'k8-harness-feedback', cluster: 'K8', title: 'Harness Eng HE-5/6：反馈飞轮、熵与行为正确性', kind: 'design', duration: 50, week: 5, prereqs: ['k8-harness-backpressure', 'k8-agent-evaluation'],
      goal: '让失败转化为下一次可复用的仓库能力，同时避免指标与测试制造虚假安全感。', output: '验证阶梯 + entropy register + 分级 merge gate。',
      prompt: 'Agent 吞吐提高后，哪些反馈应转成文档、机械规则、行为测试或周期清理？什么时候快速合并反而不成立？',
      construct: '建立静态不变量→单元/集成→关键旅程→对抗样本→人工校准的验证阶梯；记录漂移模式、检测、修复、owner、复发率和退役条件。',
      transfer: '分别为高吞吐团队、个人项目和高风险系统设计 merge gate；注入“测试全绿但用户意图错误”与“自评完成但缺交付物”。',
      hints: ['先计算等待、纠错和错误外溢成本。', 'Agent 会复制仓库中已有的好坏模式。', 'LLM judge 需要人工标注集、分歧 slice 和抽检。'],
      rubric: ['反馈能路由到明确系统改动。', '门禁随风险与吞吐变化。', '熵清理有信号、owner 与退役。', '行为正确性有人类校准。'],
      exit: '给出一个从用户 bug 到 SPEC、sensor、评估集与周期清理的完整反馈闭环。'
    },
    {
      id: 'k8-agent-safety', cluster: 'K8', title: 'Agent 工具调用：副作用、安全与 trace eval', kind: 'design', duration: 50, week: 5, prereqs: ['k8-rag-eval'],
      goal: '把 agent 从 demo 变成可审计、可降级的系统。', output: 'tool contract + permission model + trace rubric。',
      prompt: '一个 agent 可以发邮件、改日历和调用内部 API。如何设计权限、确认、幂等、重试和审计？',
      construct: '定义 read/write 边界、参数 schema、approval、idempotency key、timeout、compensation、sandbox 和人工升级。',
      transfer: 'prompt injection 藏在检索文档中，诱导 agent 外发敏感数据。控制面、模型面和监控面分别怎么防？',
      hints: ['把模型输出视为不可信提议，不是已授权操作。', '副作用操作需要最小权限、明确确认和幂等语义。', '评估不仅看最终成功，还看工具选择、参数、轨迹、终止和成本。'],
      rubric: ['模型与控制面边界清楚。', '副作用有授权/幂等/补偿。', '覆盖 injection 与数据外泄。', 'trace-level eval 可执行。'],
      exit: '列出任何有副作用工具都必须满足的六个 contract 字段。'
    },
    {
      id: 'k8-multi-agent', cluster: 'K8', title: 'Agent Book Ch10：单 Agent 与多 Agent 的证据化选择', kind: 'design', duration: 50, week: 5, prereqs: ['k8-agent-evaluation', 'k8-agent-safety'],
      goal: '只在隔离、并行或专业化收益可验证时引入多 Agent。', output: '拓扑决策表 + 通信/故障域设计。',
      prompt: '对同一复杂任务，比较单 Agent、共享上下文角色转换、管理者模式和独立上下文协作。何时多 Agent 真正占优？',
      construct: '标出任务可分解性、上下文是否共享、消息 contract、所有权、验证者、终止、成本和错误传播路径；先给单 Agent baseline。',
      transfer: '并行子 Agent 共享文件系统且上游事实错误。如何检测并发冲突、阻止错误级联并保留独立验证？',
      hints: ['多角色不一定等于多 Agent。', '隔离减少上下文污染，也会造成信息损失和重复成本。', '为每个子任务定义可独立验证的交付契约。'],
      rubric: ['先证明多 Agent 的必要性。', '上下文与拓扑选择有依据。', '通信、所有权和终止清楚。', '覆盖并发冲突、错误级联和成本。'],
      exit: '给出三个“不该用多 Agent”的判据和一个确实值得使用的场景。'
    }
  ];

  var state = loadState();
  var activeTask = null;
  var activePhase = 0;
  var highestPhase = 0;
  var sessionStartedAt = null;
  var timerHandle = null;
  var hintLevel = 0;
  var activeSessionMode = 'learn';
  var activeReviewLagDays = 0;
  var activeVariant = null;
  var activePlannedMinutes = 0;
  var selectedOverride = null;
  var clusterFilter = null;
  var knowledgeState = { cluster: 'ALL', documentId: null, query: '' };

  var els = {};

  function defaultState() {
    return {
      version: VERSION,
      profile: { role: 'balanced', mode: 'balanced', minutes: 90 },
      nodes: {},
      evidence: [],
      draft: null,
      lastCluster: null,
      updatedAt: new Date().toISOString()
    };
  }

  function loadState() {
    var fallback = defaultState();
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        LEGACY_STORAGE_KEYS.some(function (key) {
          raw = localStorage.getItem(key);
          return Boolean(raw);
        });
      }
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return fallback;
      parsed.profile = Object.assign({}, fallback.profile, parsed.profile || {});
      parsed.nodes = parsed.nodes || {};
      parsed.evidence = Array.isArray(parsed.evidence) ? parsed.evidence.map(function (item) {
        return Object.assign({ isDelayedReview: false, unaidedTransfer: false }, item);
      }) : [];
      parsed.draft = parsed.draft && parsed.draft.taskId ? parsed.draft : null;
      parsed.version = VERSION;
      return parsed;
    } catch (error) {
      return fallback;
    }
  }

  function saveState() {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.warn('Learning OS state could not be saved.', error);
      return false;
    }
  }

  function nodeState(id) {
    var defaults = {
      mastery: 0,
      confidence: null,
      attempts: 0,
      hintLevel: 0,
      evidenceCount: 0,
      reviews: 0,
      unaidedTransferPasses: 0,
      lastAt: null,
      lastReviewAt: null,
      nextDue: null,
      scores: null
    };
    var current = Object.assign(defaults, state.nodes[id] || {});
    state.nodes[id] = current;
    return current;
  }

  function cacheElements() {
    [
      'profile-role', 'profile-mode', 'profile-minutes', 'metric-mastery', 'metric-due',
      'metric-transfer', 'metric-hints', 'next-cluster', 'next-meta', 'next-kind',
      'next-title', 'next-summary', 'next-reasons', 'alternative-list', 'cluster-grid',
      'queue-list', 'evidence-list', 'cluster-filter-note', 'clear-cluster-filter', 'plan-summary',
      'resume-strip', 'resume-title', 'resume-meta', 'north-star-detail',
      'session-dialog', 'session-cluster', 'session-title', 'session-subtitle',
      'session-mode', 'session-guardrail',
      'session-timer', 'phase-nav', 'orient-goal', 'orient-output', 'orient-time',
      'orient-prereqs', 'orient-mode', 'retrieve-prompt', 'confidence-input', 'confidence-value',
      'retrieve-response', 'construct-brief', 'construct-response', 'hint-status',
      'request-hint', 'hint-message', 'transfer-prompt', 'transfer-response',
      'rubric-list', 'feedback-notes', 'exit-prompt', 'exit-response',
      'session-preview', 'previous-phase', 'next-phase', 'session-status', 'toast',
      'state-file', 'knowledge-source-count', 'knowledge-section-count', 'knowledge-task-count',
      'knowledge-search', 'knowledge-clear', 'knowledge-cluster-list', 'knowledge-document-grid',
      'knowledge-results', 'knowledge-result-summary', 'knowledge-context-label', 'knowledge-context-title',
      'knowledge-reset-document', 'knowledge-dialog', 'knowledge-reader-source', 'knowledge-reader-title',
      'knowledge-reader-breadcrumb', 'knowledge-reader-content', 'knowledge-open-source'
    ].forEach(function (id) {
      els[id] = document.getElementById(id);
    });
  }

  function taskById(id) {
    return TASKS.find(function (task) { return task.id === id; });
  }

  function daysUntil(dateString) {
    if (!dateString) return null;
    return Math.ceil((new Date(dateString).getTime() - Date.now()) / DAY);
  }

  function prereqScore(task) {
    if (!task.prereqs.length) return 1;
    var values = task.prereqs.map(function (id) { return nodeState(id).mastery || 0; });
    var average = values.reduce(function (a, b) { return a + b; }, 0) / values.length;
    return average >= 2 ? 1 : Math.max(0.12, average / 2);
  }

  function taskPriority(task) {
    var progress = nodeState(task.id);
    var gap = 1 - Math.min(4, progress.mastery || 0) / 4;
    var role = ROLE_WEIGHTS[state.profile.role] || ROLE_WEIGHTS.balanced;
    var relevance = role[task.cluster] || 0.5;
    var dueDays = daysUntil(progress.nextDue);
    var forgetting = progress.attempts === 0 ? 0.7 : (dueDays <= 0 ? 1 : Math.max(0.1, 1 - dueDays / 14));
    var unlock = prereqScore(task);
    var variety = state.lastCluster && state.lastCluster === task.cluster ? 0 : 1;
    var modeMap = MODE_WEIGHTS[state.profile.mode] || MODE_WEIGHTS.balanced;
    var modeFit = modeMap[task.kind] || 0.6;
    var timeFit = task.duration <= Number(state.profile.minutes) ? 1 : 0.35;
    var score = 0.35 * gap + 0.25 * relevance + 0.20 * forgetting + 0.10 * unlock + 0.05 * variety + 0.03 * modeFit + 0.02 * timeFit;
    if (progress.attempts > 0 && dueDays !== null && dueDays <= 0) score += 0.30;
    if (selectedOverride === task.id) score += 0.6;
    return {
      task: task,
      score: score,
      gap: gap,
      relevance: relevance,
      forgetting: forgetting,
      unlock: unlock,
      variety: variety,
      modeFit: modeFit,
      dueDays: dueDays,
      progress: progress
    };
  }

  function rankedTasks() {
    var pool = clusterFilter ? TASKS.filter(function (task) { return task.cluster === clusterFilter; }) : TASKS.slice();
    return pool.map(taskPriority).sort(function (a, b) { return b.score - a.score; });
  }

  function reviewVariant(task, attempts) {
    var clusterOffset = Math.max(0, Number(task.cluster.slice(1)) - 1);
    return REVIEW_VARIANTS[(Number(attempts || 0) + clusterOffset) % REVIEW_VARIANTS.length];
  }

  function sessionContext(item) {
    var isReview = item.progress.attempts > 0 && item.dueDays !== null && item.dueDays <= 0;
    var plannedMinutes = isReview ? Math.max(20, Math.round(item.task.duration * 0.55)) : item.task.duration;
    var label = isReview ? 'DELAYED REVIEW' : (item.progress.attempts ? 'GUIDED PRACTICE' : 'NEW EVIDENCE');
    return {
      mode: isReview ? 'review' : 'learn',
      label: label,
      plannedMinutes: plannedMinutes,
      reviewLagDays: isReview ? Math.max(0, -Number(item.dueDays || 0)) : 0,
      variant: reviewVariant(item.task, item.progress.attempts)
    };
  }

  function buildDailyPlan() {
    var budget = Math.max(15, Number(state.profile.minutes) || 90);
    var used = 0;
    var items = [];
    rankedTasks().some(function (item) {
      var context = sessionContext(item);
      var minutes = context.plannedMinutes;
      if (!items.length && minutes > budget) {
        minutes = budget;
        context = Object.assign({}, context, { plannedMinutes: minutes, sprint: true });
      }
      if (used + minutes <= budget) {
        items.push(Object.assign({}, item, { session: context }));
        used += minutes;
      }
      return items.length >= 4 || used >= budget;
    });
    return { items: items, used: used, budget: budget, remaining: Math.max(0, budget - used) };
  }

  function priorityReasons(item) {
    var reasons = [];
    if (item.progress.attempts === 0) reasons.push('尚无能力证据');
    if (item.progress.attempts > 0 && item.dueDays !== null && item.dueDays <= 0) reasons.push('延迟复测已到期');
    if (item.gap > 0.6) reasons.push('掌握缺口较大');
    if (item.relevance >= 0.9) reasons.push('目标岗位高相关');
    if (item.unlock >= 0.9 && item.task.prereqs.length) reasons.push('前置条件已满足');
    if (item.modeFit >= 0.9) reasons.push('匹配当前面试轮次');
    if (item.task.duration > Number(state.profile.minutes)) reasons.push('超出今日单次时间');
    if (!reasons.length) reasons.push('适合作为迁移复测');
    return reasons.slice(0, 4);
  }

  function render() {
    renderProfile();
    renderMetrics();
    renderDraft();
    renderRecommendation();
    renderClusters();
    renderKnowledge();
    renderQueue();
    renderEvidence();
  }

  function renderProfile() {
    els['profile-role'].value = state.profile.role;
    els['profile-mode'].value = state.profile.mode;
    els['profile-minutes'].value = String(state.profile.minutes);
  }

  function renderMetrics() {
    var attempted = TASKS.map(function (task) { return nodeState(task.id); }).filter(function (item) { return item.attempts > 0; });
    var mastery = attempted.length ? attempted.reduce(function (sum, item) { return sum + Number(item.mastery || 0); }, 0) / attempted.length : 0;
    var due = attempted.filter(function (item) { return item.nextDue && new Date(item.nextDue).getTime() <= Date.now(); }).length;
    var delayedReviews = state.evidence.filter(function (item) { return item.isDelayedReview; });
    var unaidedTransfers = delayedReviews.filter(function (item) { return item.unaidedTransfer; });
    var transferRate = delayedReviews.length ? Math.round(100 * unaidedTransfers.length / delayedReviews.length) + '%' : '--';
    var hintAverage = state.evidence.length ? (state.evidence.reduce(function (sum, item) { return sum + Number(item.hintLevel || 0); }, 0) / state.evidence.length).toFixed(1) : '--';
    els['metric-mastery'].textContent = mastery.toFixed(1);
    els['metric-due'].textContent = String(due);
    els['metric-transfer'].textContent = transferRate;
    els['metric-hints'].textContent = hintAverage;
    els['north-star-detail'].textContent = delayedReviews.length ?
      unaidedTransfers.length + '/' + delayedReviews.length + ' 次延迟复测在零提示下通过 Transfer 与 Independence 门槛。' :
      '尚无延迟复测证据；同一 Session 内的即时迁移不会计入北极星指标。';
  }

  function renderDraft() {
    var draft = state.draft;
    var task = draft && taskById(draft.taskId);
    if (!draft || !task) {
      els['resume-strip'].hidden = true;
      return;
    }
    els['resume-strip'].hidden = false;
    els['resume-title'].textContent = '继续：' + task.title;
    els['resume-meta'].textContent = '已保存到阶段 ' + (Number(draft.activePhase || 0) + 1) + '/6 · ' + formatDate(draft.savedAt) + ' · 仅本机';
  }

  function renderRecommendation() {
    var plan = buildDailyPlan();
    var ranked = rankedTasks();
    if (!plan.items.length) return;
    var item = plan.items[0];
    var task = item.task;
    var cluster = CLUSTERS[task.cluster];
    var context = item.session;
    els['next-cluster'].textContent = task.cluster + ' · ' + cluster.short;
    els['next-meta'].textContent = context.plannedMinutes + ' 分钟 · ' + context.label;
    els['next-kind'].textContent = task.kind.toUpperCase() + ' · ' + (context.mode === 'review' ? 'DELAYED RETRIEVE → NEW VARIANT' : 'RETRIEVE → TRANSFER');
    els['next-title'].textContent = task.title;
    els['next-summary'].textContent = task.goal;
    els['next-reasons'].innerHTML = priorityReasons(item).map(function (reason) {
      return '<span>' + escapeHtml(reason) + '</span>';
    }).join('');
    document.getElementById('start-next').dataset.taskId = task.id;
    document.getElementById('hero-start').dataset.taskId = task.id;

    els['alternative-list'].innerHTML = ranked.slice(1, 5).map(function (alternative) {
      var alt = alternative.task;
      return '<button class="alternative-item" type="button" data-task-id="' + escapeHtml(alt.id) + '">' +
        '<strong>' + escapeHtml(alt.title) + '</strong>' +
        '<span>' + escapeHtml(alt.duration + ' min') + '</span>' +
        '<small>' + escapeHtml(CLUSTERS[alt.cluster].short + ' · ' + priorityReasons(alternative)[0]) + '</small>' +
        '</button>';
    }).join('');
    els['clear-cluster-filter'].hidden = !clusterFilter;
  }

  function clusterStats(clusterId) {
    var tasks = TASKS.filter(function (task) { return task.cluster === clusterId; });
    var states = tasks.map(function (task) { return nodeState(task.id); });
    var average = states.length ? states.reduce(function (sum, item) { return sum + Number(item.mastery || 0); }, 0) / states.length : 0;
    var due = states.filter(function (item) { return item.attempts > 0 && item.nextDue && new Date(item.nextDue).getTime() <= Date.now(); }).length;
    var attempted = states.filter(function (item) { return item.attempts > 0; }).length;
    return { average: average, due: due, attempted: attempted, total: tasks.length };
  }

  function renderClusters() {
    els['cluster-grid'].innerHTML = Object.keys(CLUSTERS).map(function (id) {
      var cluster = CLUSTERS[id];
      var stats = clusterStats(id);
      var width = Math.round(stats.average / 4 * 100);
      return '<button class="cluster-card' + (clusterFilter === id ? ' active' : '') + '" type="button" data-cluster="' + id + '" style="--cluster-color:' + cluster.color + '">' +
        '<span class="cluster-card-top"><span class="cluster-index">' + id + '</span><span class="cluster-due">' + (stats.due ? stats.due + ' 到期' : '无到期') + '</span></span>' +
        '<h3>' + escapeHtml(cluster.title) + '</h3>' +
        '<p>' + escapeHtml(cluster.description) + '</p>' +
        '<span class="mastery-bar"><span style="width:' + width + '%"></span></span>' +
        '<span class="cluster-foot"><span>' + stats.attempted + '/' + stats.total + ' 已建立证据</span><span>' + stats.average.toFixed(1) + '/4</span></span>' +
        '</button>';
    }).join('');
    els['cluster-filter-note'].textContent = clusterFilter ? '当前：' + CLUSTERS[clusterFilter].title : '当前：全部能力簇';
  }

  function renderQueue() {
    var plan = buildDailyPlan();
    els['plan-summary'].textContent = plan.items.length + ' 个 Session · ' + plan.used + '/' + plan.budget + ' 分钟' + (plan.remaining ? ' · 余 ' + plan.remaining + ' 分钟' : '');
    els['queue-list'].innerHTML = plan.items.map(function (item, index) {
      var task = item.task;
      return '<button class="queue-item" type="button" data-task-id="' + escapeHtml(task.id) + '">' +
        '<span class="queue-rank">0' + (index + 1) + '</span>' +
        '<span class="queue-title"><strong>' + escapeHtml(task.title) + '</strong><small>' + task.cluster + ' · ' + escapeHtml(item.session.label) + ' · mastery ' + Number(item.progress.mastery || 0).toFixed(1) + '</small></span>' +
        '<span class="queue-reason">' + escapeHtml(priorityReasons(item).slice(0, 2).join(' · ')) + '</span>' +
        '<span class="queue-time">' + item.session.plannedMinutes + ' min</span>' +
        '<span class="queue-score">' + Math.round(Math.min(1, item.score) * 100) + '</span>' +
        '</button>';
    }).join('');
  }

  function renderEvidence() {
    if (!state.evidence.length) {
      els['evidence-list'].innerHTML = '<div class="empty-evidence"><div><strong>还没有能力证据</strong><p>完成第一个 Session 后，这里会出现 mastery、迁移、提示和校准记录。</p></div></div>';
      return;
    }
    els['evidence-list'].innerHTML = state.evidence.slice(0, 7).map(function (item) {
      var task = taskById(item.taskId);
      var title = task ? task.title : item.taskId;
      var summary = item.exit || item.notes || '已完成一次练习';
      var flags = [
        '<span class="evidence-flag">' + (item.isDelayedReview ? '延迟复测' : '即时练习') + '</span>',
        item.unaidedTransfer ? '<span class="evidence-flag pass">无辅助迁移通过</span>' : '',
        item.isDelayedReview && !item.unaidedTransfer ? '<span class="evidence-flag">尚未无辅助通过</span>' : ''
      ].join('');
      return '<article class="evidence-item">' +
        '<strong>' + escapeHtml(title) + '</strong>' +
        '<span class="evidence-score">' + Number(item.mastery || 0).toFixed(1) + '/4</span>' +
        '<small>' + escapeHtml(formatDate(item.at)) + ' · L' + Number(item.hintLevel || 0) + ' 提示 · 校准误差 ' + Number(item.calibration || 0).toFixed(1) + '</small>' +
        '<div class="evidence-flags">' + flags + '</div>' +
        '<p>' + escapeHtml(truncate(summary, 150)) + '</p>' +
        '</article>';
    }).join('');
  }

  function knowledgeClusterLabel(id) {
    if (id === 'ALL') return { title: '全部知识', short: 'ALL', description: '全部路线、题库、计划与系统说明' };
    if (id === 'META') return { title: '学习系统与方法', short: 'META', description: 'Learning OS 的设计、验证与使用说明' };
    return CLUSTERS[id] || { title: id, short: id, description: '' };
  }

  function documentMatchesCluster(document, cluster) {
    return cluster === 'ALL' || (document.clusters || []).indexOf(cluster) >= 0;
  }

  function sectionMatchesCluster(section, cluster) {
    return cluster === 'ALL' || (section.clusters || []).indexOf(cluster) >= 0;
  }

  function normalizeKnowledgeText(value) {
    var text = String(value || '').toLowerCase();
    return text.normalize ? text.normalize('NFKC') : text;
  }

  function knowledgeMatchScore(query, title, body) {
    var normalizedQuery = normalizeKnowledgeText(query).trim();
    if (!normalizedQuery) return 1;
    var tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    var normalizedTitle = normalizeKnowledgeText(title);
    var normalizedBody = normalizeKnowledgeText(body);
    var haystack = normalizedTitle + ' ' + normalizedBody;
    if (!tokens.every(function (token) { return haystack.indexOf(token) >= 0; })) return 0;
    var score = normalizedTitle.indexOf(normalizedQuery) >= 0 ? 30 : 0;
    tokens.forEach(function (token) {
      if (normalizedTitle.indexOf(token) >= 0) score += 12;
      var occurrences = normalizedBody.split(token).length - 1;
      score += Math.min(6, occurrences);
    });
    return score + Math.max(0, 5 - normalizedTitle.length / 40);
  }

  function knowledgeDocumentById(id) {
    return KNOWLEDGE.documents.find(function (document) { return document.id === id; });
  }

  function knowledgeSectionById(id) {
    return KNOWLEDGE.sections.find(function (section) { return section.id === id; });
  }

  function knowledgeResults() {
    var query = knowledgeState.query.trim();
    var sections = KNOWLEDGE.sections.filter(function (section) {
      if (!sectionMatchesCluster(section, knowledgeState.cluster)) return false;
      return !knowledgeState.documentId || section.documentId === knowledgeState.documentId;
    }).map(function (section) {
      var document = knowledgeDocumentById(section.documentId);
      var body = [document ? document.title : '', document ? document.kind : '', document ? document.description : '', section.breadcrumb.join(' '), section.content, section.clusters.join(' ')].join(' ');
      return { type: 'section', item: section, score: knowledgeMatchScore(query, section.title, body) };
    }).filter(function (result) {
      if (query) return result.score > 0;
      if (knowledgeState.documentId) return true;
      return result.item.level <= 2;
    });

    var tasks = [];
    if (query && !knowledgeState.documentId && knowledgeState.cluster !== 'META') {
      tasks = TASKS.filter(function (task) {
        return knowledgeState.cluster === 'ALL' || task.cluster === knowledgeState.cluster;
      }).map(function (task) {
        var body = [task.goal, task.output, task.prompt, task.construct, task.transfer, task.exit, task.hints.join(' '), task.rubric.join(' ')].join(' ');
        return { type: 'task', item: task, score: knowledgeMatchScore(query, task.title, body) + 4 };
      }).filter(function (result) { return result.score > 0; });
    }

    return sections.concat(tasks).sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.title.localeCompare(b.item.title, 'zh-CN');
    });
  }

  function renderKnowledge() {
    if (!els['knowledge-cluster-list']) return;
    els['knowledge-source-count'].textContent = String(KNOWLEDGE.sourceCount || KNOWLEDGE.documents.length);
    els['knowledge-section-count'].textContent = String(KNOWLEDGE.sectionCount || KNOWLEDGE.sections.length);
    els['knowledge-task-count'].textContent = String(TASKS.length);
    if (els['knowledge-search'].value !== knowledgeState.query) els['knowledge-search'].value = knowledgeState.query;

    var clusterIds = ['ALL'].concat(Object.keys(CLUSTERS)).concat(['META']);
    els['knowledge-cluster-list'].innerHTML = clusterIds.map(function (id) {
      var cluster = knowledgeClusterLabel(id);
      var count = KNOWLEDGE.documents.filter(function (document) { return documentMatchesCluster(document, id); }).length;
      return '<button class="catalog-tree-item' + (knowledgeState.cluster === id ? ' active' : '') + '" type="button" data-knowledge-cluster="' + id + '" aria-pressed="' + (knowledgeState.cluster === id) + '">' +
        '<span>' + escapeHtml(cluster.short) + '</span><strong>' + escapeHtml(cluster.title) + '</strong><small>' + count + ' 份</small></button>';
    }).join('');

    var cluster = knowledgeClusterLabel(knowledgeState.cluster);
    var activeDocument = knowledgeDocumentById(knowledgeState.documentId);
    els['knowledge-context-label'].textContent = activeDocument ? activeDocument.kind : cluster.short + ' · DIRECTORY';
    els['knowledge-context-title'].textContent = activeDocument ? activeDocument.title : cluster.title;
    els['knowledge-reset-document'].hidden = !activeDocument;

    var documents = KNOWLEDGE.documents.filter(function (document) {
      return documentMatchesCluster(document, knowledgeState.cluster);
    });
    els['knowledge-document-grid'].innerHTML = documents.map(function (document) {
      var tags = document.clusters.slice(0, 4).map(function (id) { return '<span>' + escapeHtml(id) + '</span>'; }).join('');
      return '<button class="resource-card' + (knowledgeState.documentId === document.id ? ' active' : '') + '" type="button" data-document-id="' + escapeHtml(document.id) + '">' +
        '<span class="resource-kind">' + escapeHtml(document.kind) + '</span>' +
        '<strong>' + escapeHtml(document.title) + '</strong>' +
        '<p>' + escapeHtml(document.description) + '</p>' +
        '<span class="resource-meta"><span>' + document.sectionCount + ' 节</span><span>' + Math.round(document.characterCount / 1000) + 'k 字符</span></span>' +
        '<span class="resource-tags">' + tags + '</span></button>';
    }).join('');

    var results = knowledgeResults();
    var visibleResults = results.slice(0, 80);
    var scope = activeDocument ? '当前资料' : (knowledgeState.cluster === 'ALL' ? '全库' : cluster.title);
    els['knowledge-result-summary'].textContent = knowledgeState.query ? scope + '找到 ' + results.length + ' 项' : (activeDocument ? activeDocument.sectionCount + ' 个章节' : scope + '章节索引');
    if (!visibleResults.length) {
      els['knowledge-results'].innerHTML = '<div class="knowledge-empty"><strong>没有匹配结果</strong><p>减少关键词、切换能力簇，或返回全部资料再搜索。</p></div>';
      return;
    }
    els['knowledge-results'].innerHTML = visibleResults.map(function (result) {
      if (result.type === 'task') {
        var task = result.item;
        return '<button class="knowledge-result task-result" type="button" data-knowledge-task-id="' + escapeHtml(task.id) + '">' +
          '<span class="knowledge-result-type">练习 · ' + escapeHtml(task.cluster) + ' · ' + task.duration + ' min</span>' +
          '<strong>' + escapeHtml(task.title) + '</strong><p>' + escapeHtml(task.goal) + '</p><span class="knowledge-result-action">开始 Session →</span></button>';
      }
      var section = result.item;
      var document = knowledgeDocumentById(section.documentId);
      return '<button class="knowledge-result" type="button" data-section-id="' + escapeHtml(section.id) + '">' +
        '<span class="knowledge-result-type">' + escapeHtml(document ? document.kind : section.path) + ' · ' + escapeHtml(section.clusters.join(' / ')) + '</span>' +
        '<strong>' + escapeHtml(section.title) + '</strong><p>' + escapeHtml(section.snippet || '打开章节查看完整内容。') + '</p>' +
        '<span class="knowledge-result-source">' + escapeHtml(document ? document.title : section.path) + '</span></button>';
    }).join('');
  }

  function inlineKnowledgeMarkdown(value) {
    var html = escapeHtml(value);
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
      return '<a href="' + href.replace(/&amp;/g, '&') + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
    });
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return html;
  }

  function renderKnowledgeMarkdown(content) {
    var lines = String(content || '').replace(/\r\n/g, '\n').split('\n');
    var html = [];
    var index = 0;
    while (index < lines.length) {
      var line = lines[index];
      if (!line.trim()) { index += 1; continue; }
      if (/^```/.test(line.trim())) {
        var language = line.trim().slice(3);
        var code = [];
        index += 1;
        while (index < lines.length && !/^```/.test(lines[index].trim())) { code.push(lines[index]); index += 1; }
        if (index < lines.length) index += 1;
        html.push('<pre><code data-language="' + escapeHtml(language) + '">' + escapeHtml(code.join('\n')) + '</code></pre>');
        continue;
      }
      if (/^\|.*\|\s*$/.test(line) && index + 1 < lines.length && /^\|?\s*:?-+/.test(lines[index + 1])) {
        var rows = [];
        while (index < lines.length && /^\|.*\|\s*$/.test(lines[index])) {
          rows.push(lines[index].replace(/^\||\|$/g, '').split('|').map(function (cell) { return cell.trim(); }));
          index += 1;
        }
        if (rows.length > 1) rows.splice(1, 1);
        html.push('<div class="knowledge-table-wrap"><table>' + rows.map(function (row, rowIndex) {
          var cellTag = rowIndex === 0 ? 'th' : 'td';
          return '<tr>' + row.map(function (cell) { return '<' + cellTag + '>' + inlineKnowledgeMarkdown(cell) + '</' + cellTag + '>'; }).join('') + '</tr>';
        }).join('') + '</table></div>');
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        var bullets = [];
        while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
          bullets.push(lines[index].replace(/^\s*[-*]\s+/, ''));
          index += 1;
        }
        html.push('<ul>' + bullets.map(function (item) { return '<li>' + inlineKnowledgeMarkdown(item) + '</li>'; }).join('') + '</ul>');
        continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        var numbers = [];
        while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
          numbers.push(lines[index].replace(/^\s*\d+\.\s+/, ''));
          index += 1;
        }
        html.push('<ol>' + numbers.map(function (item) { return '<li>' + inlineKnowledgeMarkdown(item) + '</li>'; }).join('') + '</ol>');
        continue;
      }
      if (/^>\s?/.test(line)) {
        var quotes = [];
        while (index < lines.length && /^>\s?/.test(lines[index])) { quotes.push(lines[index].replace(/^>\s?/, '')); index += 1; }
        html.push('<blockquote>' + inlineKnowledgeMarkdown(quotes.join(' ')) + '</blockquote>');
        continue;
      }
      if (/^---+$/.test(line.trim())) { html.push('<hr>'); index += 1; continue; }
      var paragraph = [line.trim()];
      index += 1;
      while (index < lines.length && lines[index].trim() && !/^(\s*[-*]\s+|\s*\d+\.\s+|```|\||>\s?|---+$)/.test(lines[index])) {
        paragraph.push(lines[index].trim());
        index += 1;
      }
      html.push('<p>' + inlineKnowledgeMarkdown(paragraph.join(' ')) + '</p>');
    }
    return html.join('');
  }

  function openKnowledgeSection(sectionId) {
    var section = knowledgeSectionById(sectionId);
    if (!section) return;
    var document = knowledgeDocumentById(section.documentId);
    els['knowledge-reader-source'].textContent = document ? document.kind + ' · ' + document.title : section.path;
    els['knowledge-reader-title'].textContent = section.title;
    els['knowledge-reader-breadcrumb'].textContent = section.breadcrumb.join('  /  ');
    els['knowledge-reader-content'].innerHTML = renderKnowledgeMarkdown(section.content || '本节没有正文，请打开完整原文。');
    els['knowledge-open-source'].href = section.path;
    els['knowledge-dialog'].showModal();
  }

  function openSession(taskId, resumeExisting) {
    activeTask = taskById(taskId);
    if (!activeTask) return;
    var draft = state.draft;
    var shouldResume = Boolean(resumeExisting || (draft && draft.taskId === taskId));
    if (draft && draft.taskId !== taskId && !resumeExisting) {
      if (!window.confirm('另一个 Session 有自动保存的草稿。开始新节点会替换它，是否继续？')) {
        activeTask = null;
        return;
      }
      state.draft = null;
      saveState();
    }
    var item = taskPriority(activeTask);
    var context = sessionContext(item);
    activeSessionMode = shouldResume && draft ? draft.sessionMode : context.mode;
    activeReviewLagDays = shouldResume && draft ? Number(draft.reviewLagDays || 0) : context.reviewLagDays;
    activeVariant = shouldResume && draft && draft.variant ? draft.variant : context.variant;
    activePlannedMinutes = shouldResume && draft ? Number(draft.plannedMinutes || context.plannedMinutes) : context.plannedMinutes;
    activePhase = shouldResume && draft ? Number(draft.activePhase || 0) : 0;
    highestPhase = shouldResume && draft ? Number(draft.highestPhase || activePhase) : 0;
    hintLevel = shouldResume && draft ? Number(draft.hintLevel || 0) : 0;
    sessionStartedAt = shouldResume && draft ? Date.now() - Number(draft.elapsedSeconds || 0) * 1000 : Date.now();
    clearSessionInputs();
    fillSessionContent();
    if (shouldResume && draft) restoreDraft(draft);
    setPhase(activePhase);
    if (typeof els['session-dialog'].showModal === 'function') {
      els['session-dialog'].showModal();
    } else {
      els['session-dialog'].setAttribute('open', 'open');
    }
    startTimer();
    saveDraft();
  }

  function clearSessionInputs() {
    ['retrieve-response', 'construct-response', 'transfer-response', 'feedback-notes', 'exit-response'].forEach(function (id) {
      els[id].value = '';
    });
    els['confidence-input'].value = '50';
    els['confidence-value'].textContent = '50';
    els['hint-message'].hidden = true;
    els['hint-message'].textContent = '';
    els['hint-status'].textContent = '尚未使用提示';
    els['request-hint'].textContent = '请求 L1 提示';
    document.querySelectorAll('[data-score]').forEach(function (select) { select.value = ''; });
    els['session-preview'].textContent = '完成锚定评分后将显示 mastery、校准误差和建议复习间隔。';
  }

  function restoreDraft(draft) {
    var responses = draft.responses || {};
    ['retrieve-response', 'construct-response', 'transfer-response', 'feedback-notes', 'exit-response'].forEach(function (id) {
      els[id].value = responses[id] || '';
    });
    els['confidence-input'].value = String(draft.confidence === undefined ? 50 : draft.confidence);
    els['confidence-value'].textContent = els['confidence-input'].value;
    var scores = draft.scores || {};
    document.querySelectorAll('[data-score]').forEach(function (select) {
      select.value = scores[select.dataset.score] === undefined ? '' : String(scores[select.dataset.score]);
    });
    if (hintLevel > 0) {
      els['hint-message'].textContent = 'L' + hintLevel + ' · ' + activeTask.hints[hintLevel - 1];
      els['hint-message'].hidden = false;
      els['hint-status'].textContent = '已使用 L' + hintLevel;
      els['request-hint'].textContent = hintLevel < activeTask.hints.length ? '请求 L' + (hintLevel + 1) + ' 提示' : '提示已用完';
    }
    updateSessionPreview();
  }

  function saveDraft() {
    if (!activeTask) return;
    var responses = {};
    ['retrieve-response', 'construct-response', 'transfer-response', 'feedback-notes', 'exit-response'].forEach(function (id) {
      responses[id] = els[id].value;
    });
    state.draft = {
      taskId: activeTask.id,
      activePhase: activePhase,
      highestPhase: highestPhase,
      hintLevel: hintLevel,
      startedAt: sessionStartedAt,
      elapsedSeconds: Math.max(0, Math.round((Date.now() - sessionStartedAt) / 1000)),
      savedAt: new Date().toISOString(),
      sessionMode: activeSessionMode,
      reviewLagDays: activeReviewLagDays,
      plannedMinutes: activePlannedMinutes,
      variant: activeVariant,
      confidence: Number(els['confidence-input'].value),
      scores: currentScores(),
      responses: responses
    };
    saveState();
  }

  function discardDraft() {
    if (!state.draft) return;
    if (!window.confirm('确认放弃这个本地草稿？已完成的历史证据不会受影响。')) return;
    state.draft = null;
    saveState();
    renderDraft();
    toast('草稿已放弃。');
  }

  function fillSessionContent() {
    var task = activeTask;
    var isReview = activeSessionMode === 'review';
    els['session-cluster'].textContent = task.cluster + ' · ' + CLUSTERS[task.cluster].title;
    els['session-mode'].textContent = isReview ? 'DELAYED REVIEW' : (nodeState(task.id).attempts ? 'GUIDED PRACTICE' : 'NEW EVIDENCE');
    els['session-mode'].classList.toggle('review', isReview);
    els['session-title'].textContent = task.title;
    els['session-subtitle'].textContent = isReview ? '延迟复测 · 不展示历史答案 · ' + activeVariant.label : task.goal;
    els['orient-goal'].textContent = task.goal;
    els['orient-output'].textContent = task.output;
    els['orient-time'].textContent = activePlannedMinutes + ' 分钟；今日预算 ' + state.profile.minutes + ' 分钟';
    els['orient-prereqs'].textContent = task.prereqs.length ? task.prereqs.map(function (id) {
      var prereq = taskById(id);
      return prereq ? prereq.title : id;
    }).join('；') : '无硬前置；先做闭卷基线';
    els['orient-mode'].textContent = isReview ? '延迟、零提示、变式迁移；通过后才计入北极星' : '即时检索、构建、迁移；只形成候选证据';
    els['session-guardrail'].textContent = isReview ?
      '不要查看历史证据。先闭卷重建，再处理新变式；只有零提示且 Transfer / Independence ≥ 3 才算无辅助迁移通过。' :
      '先预测，后验证。前 15–25 分钟不给完整答案；同一 Session 内的迁移不会直接计入延迟北极星。';
    els['retrieve-prompt'].textContent = isReview ? task.exit : task.prompt;
    els['construct-brief'].textContent = isReview ? '不用复刻旧答案：' + task.construct : task.construct;
    els['transfer-prompt'].textContent = isReview ? task.transfer + '\n\n本次新变式 · ' + activeVariant.label + '：' + activeVariant.prompt : task.transfer;
    els['rubric-list'].innerHTML = task.rubric.map(function (line) { return '<li>' + escapeHtml(line) + '</li>'; }).join('');
    els['exit-prompt'].textContent = isReview ? '用 90 秒给出最终答案：先结论，再说明新变式改变了什么、如何验证；不要引用历史记录。' : task.exit;
  }

  function setPhase(phase) {
    activePhase = Math.max(0, Math.min(5, phase));
    highestPhase = Math.max(highestPhase, activePhase);
    document.querySelectorAll('[data-phase-panel]').forEach(function (panel) {
      panel.hidden = Number(panel.dataset.phasePanel) !== activePhase;
    });
    document.querySelectorAll('[data-phase]').forEach(function (button) {
      var value = Number(button.dataset.phase);
      button.classList.toggle('active', value === activePhase);
      button.classList.toggle('done', value < activePhase);
      button.disabled = value > highestPhase;
    });
    els['previous-phase'].disabled = activePhase === 0;
    els['session-status'].textContent = '阶段 ' + (activePhase + 1) + ' / 6';
    var labels = ['开始闭卷检索', '进入构建', '进入迁移挑战', '按证据评分', '完成 Exit Ticket', '保存证据'];
    els['next-phase'].textContent = labels[activePhase];
    if (activePhase === 5) updateSessionPreview();
    saveDraft();
  }

  function validatePhase() {
    if (activePhase === 1 && els['retrieve-response'].value.trim().length < 20) {
      toast('先留下至少 20 个字的闭卷判断，再进入构建。');
      return false;
    }
    if (activePhase === 2 && els['construct-response'].value.trim().length < 20) {
      toast('请先留下可检查的实现、测试、图解或决策记录。');
      return false;
    }
    if (activePhase === 3 && els['transfer-response'].value.trim().length < 20) {
      toast('迁移回答太短；至少说明哪些结论保留、哪些改变。');
      return false;
    }
    if (activePhase === 4 && !hasCompleteScores()) {
      toast('五个维度都必须按证据选择等级；系统不会再默认给 3 分。');
      return false;
    }
    if (activePhase === 4 && els['feedback-notes'].value.trim().length < 12) {
      toast('请记录最大的一个误差和最小修复动作。');
      return false;
    }
    if (activePhase === 5 && els['exit-response'].value.trim().length < 20) {
      toast('最后必须关闭帮助，完成至少 20 个字的 exit ticket。');
      return false;
    }
    return true;
  }

  function nextPhase() {
    if (!validatePhase()) return;
    if (activePhase < 5) {
      setPhase(activePhase + 1);
      return;
    }
    completeSession();
  }

  function requestHint() {
    if (!activeTask || hintLevel >= activeTask.hints.length) {
      toast('本题没有更多提示；请缩小问题或完成最小实验。');
      return;
    }
    els['hint-message'].textContent = 'L' + (hintLevel + 1) + ' · ' + activeTask.hints[hintLevel];
    els['hint-message'].hidden = false;
    hintLevel += 1;
    els['hint-status'].textContent = '已使用 L' + hintLevel;
    els['request-hint'].textContent = hintLevel < activeTask.hints.length ? '请求 L' + (hintLevel + 1) + ' 提示' : '提示已用完';
    saveDraft();
  }

  function currentScores() {
    var scores = {};
    document.querySelectorAll('[data-score]').forEach(function (select) {
      if (select.value !== '') scores[select.dataset.score] = Number(select.value);
    });
    return scores;
  }

  function hasCompleteScores() {
    var scores = currentScores();
    return SCORE_DIMENSIONS.every(function (dimension) { return scores[dimension] !== undefined; });
  }

  function scoreAverage(scores) {
    var values = Object.keys(scores).map(function (key) { return Number(scores[key]); });
    return values.length ? values.reduce(function (a, b) { return a + b; }, 0) / values.length : 0;
  }

  function calculatedResult() {
    if (!hasCompleteScores()) return null;
    var scores = currentScores();
    var average = scoreAverage(scores);
    var capped = average;
    if (scores.transfer < 3 || scores.independence < 3) capped = Math.min(capped, 2.9);
    var confidence = Number(els['confidence-input'].value);
    var calibration = Math.abs(confidence / 25 - average);
    var interval = capped < 1.5 ? 1 : (capped < 2.5 ? 3 : (capped < 3.5 ? 7 : 14));
    if (hintLevel >= 2) interval = Math.min(interval, 3);
    if (calibration >= 1.5 && average < 3) interval = Math.min(interval, 3);
    var isDelayedReview = activeSessionMode === 'review';
    var unaidedTransfer = isDelayedReview && hintLevel === 0 && scores.transfer >= 3 && scores.independence >= 3;
    if (isDelayedReview && !unaidedTransfer) interval = Math.min(interval, 3);
    if (unaidedTransfer) {
      var reviewIntervals = [7, 14, 30];
      interval = Math.max(interval, reviewIntervals[Math.min(2, Number(nodeState(activeTask.id).reviews || 0))]);
    }
    return {
      scores: scores,
      average: average,
      mastery: capped,
      confidence: confidence,
      calibration: calibration,
      interval: interval,
      isDelayedReview: isDelayedReview,
      unaidedTransfer: unaidedTransfer
    };
  }

  function updateSessionPreview() {
    var result = calculatedResult();
    if (!result) {
      els['session-preview'].textContent = '请先完成五维锚定评分；空白不会被当作 0，也不会默认给 3。';
      return;
    }
    var gate = result.isDelayedReview ?
      (result.unaidedTransfer ? '计入延迟无辅助迁移通过' : '本次不计入北极星通过') :
      (result.scores.transfer >= 3 && result.scores.independence >= 3 ? '形成候选证据，等待延迟复测' : '尚未通过迁移/独立性门槛');
    els['session-preview'].innerHTML = '<strong>预计 mastery ' + result.mastery.toFixed(1) + '/4</strong> · ' +
      escapeHtml(gate) + ' · 信心校准误差 ' + result.calibration.toFixed(1) + ' · 建议 ' + result.interval + ' 天后复习。';
  }

  function completeSession() {
    var result = calculatedResult();
    if (!result) {
      toast('请先完成五维锚定评分。');
      return;
    }
    var progress = nodeState(activeTask.id);
    var previous = Number(progress.mastery || 0);
    var evidenceWeight = result.isDelayedReview ? 0.75 : 0.65;
    var mastery = progress.attempts ? (previous * (1 - evidenceWeight) + result.mastery * evidenceWeight) : result.mastery;
    mastery = Math.round(mastery * 10) / 10;
    var nextDue = new Date(Date.now() + result.interval * DAY).toISOString();
    progress.mastery = mastery;
    progress.confidence = result.confidence;
    progress.attempts += 1;
    progress.hintLevel = hintLevel;
    progress.evidenceCount += 1;
    progress.lastAt = new Date().toISOString();
    if (result.isDelayedReview) {
      progress.reviews = Number(progress.reviews || 0) + 1;
      progress.lastReviewAt = progress.lastAt;
      if (result.unaidedTransfer) progress.unaidedTransferPasses = Number(progress.unaidedTransferPasses || 0) + 1;
    }
    progress.nextDue = nextDue;
    progress.scores = result.scores;

    state.evidence.unshift({
      id: 'ev-' + Date.now(),
      taskId: activeTask.id,
      cluster: activeTask.cluster,
      at: new Date().toISOString(),
      mastery: mastery,
      scores: result.scores,
      confidence: result.confidence,
      calibration: result.calibration,
      hintLevel: hintLevel,
      sessionMode: activeSessionMode,
      isDelayedReview: result.isDelayedReview,
      reviewLagDays: activeReviewLagDays,
      variant: activeVariant,
      unaidedTransfer: result.unaidedTransfer,
      durationSeconds: Math.round((Date.now() - sessionStartedAt) / 1000),
      retrieve: clipEvidence(els['retrieve-response'].value.trim()),
      construct: clipEvidence(els['construct-response'].value.trim()),
      transfer: clipEvidence(els['transfer-response'].value.trim()),
      notes: clipEvidence(els['feedback-notes'].value.trim()),
      exit: clipEvidence(els['exit-response'].value.trim())
    });
    state.evidence = state.evidence.slice(0, 100);
    state.draft = null;
    state.lastCluster = activeTask.cluster;
    selectedOverride = null;
    saveState();
    closeSession(false);
    render();
    toast((result.unaidedTransfer ? '延迟无辅助迁移已通过；' : '证据已保存；') + result.interval + ' 天后复习。');
  }

  function closeSession(confirmLoss) {
    if (confirmLoss && activeTask) saveDraft();
    stopTimer();
    if (els['session-dialog'].open && typeof els['session-dialog'].close === 'function') {
      els['session-dialog'].close();
    } else {
      els['session-dialog'].removeAttribute('open');
    }
    activeTask = null;
    renderDraft();
    if (confirmLoss) toast('Session 已暂停，草稿自动保存在本机。');
  }

  function startTimer() {
    stopTimer();
    updateTimer();
    timerHandle = window.setInterval(updateTimer, 1000);
  }

  function stopTimer() {
    if (timerHandle) window.clearInterval(timerHandle);
    timerHandle = null;
  }

  function updateTimer() {
    if (!sessionStartedAt) return;
    var seconds = Math.floor((Date.now() - sessionStartedAt) / 1000);
    var minutes = Math.floor(seconds / 60);
    var rest = seconds % 60;
    els['session-timer'].textContent = pad(minutes) + ':' + pad(rest);
  }

  function coachPrompt(task) {
    return [
      '你是一个 Socratic AI 面试教练。目标是提升我的无辅助迁移，而不是替我完成答案。',
      '规则：',
      '1. 一次只问一个高价值问题；先让我预测和作答。',
      '2. 前 15–25 分钟不直接给完整答案。',
      '3. 提示依次为：L1 检查维度；L2 模式/不变量；L3 部分 worked example。',
      '4. 先指出最大的概念误差；区分事实、推断、建议和不确定性。',
      '5. 用反例、边界和 why-not 检查理解。',
      '6. 最后停止帮助，让我完成无辅助 exit ticket，并按 Correctness、Reasoning、Transfer、Communication、Independence 各 0–4 评分。',
      '',
      '练习：' + task.title,
      '证据模式：' + (activeSessionMode === 'review' ? '延迟无辅助复测；不要展示历史答案；零提示通过才计入北极星。' : '即时学习；只形成候选证据，必须等待后续延迟复测。'),
      '目标：' + task.goal,
      '闭卷问题：' + task.prompt,
      '迁移挑战：' + task.transfer + (activeSessionMode === 'review' ? '；新变式：' + activeVariant.label + ' — ' + activeVariant.prompt : ''),
      '请先只复述规则并问第一个澄清问题，不要给答案。'
    ].join('\n');
  }

  function coachContract() {
    return [
      'AI 教练契约：先问后答；前 15–25 分钟不给完整答案；一次处理一个最大误差；',
      '提示按检查维度 → 模式/不变量 → 部分 worked example 分级；',
      '必须用反例和变式检查迁移；最后关闭帮助完成 exit ticket；同一 Session 内的正确不计作延迟北极星；',
      '评分维度为 Correctness、Reasoning、Transfer、Communication、Independence；',
      '不接收客户数据、雇主机密、PII、密钥或未公开项目细节。'
    ].join('\n');
  }

  function copyText(text, successMessage) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast(successMessage); }).catch(function () { fallbackCopy(text, successMessage); });
    } else {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
    var area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      toast(successMessage);
    } catch (error) {
      toast('复制失败，请手动选择文本。');
    }
    area.remove();
  }

  function exportState() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'interview-learning-os-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast('本地学习状态已导出。');
  }

  function importState(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        if (!parsed || !parsed.profile || !parsed.nodes || !Array.isArray(parsed.evidence)) throw new Error('invalid');
        state = Object.assign(defaultState(), parsed);
        state.profile = Object.assign({}, defaultState().profile, parsed.profile);
        state.version = VERSION;
        state.draft = parsed.draft && parsed.draft.taskId ? parsed.draft : null;
        state.evidence = parsed.evidence.map(function (item) {
          return Object.assign({ isDelayedReview: false, unaidedTransfer: false }, item);
        });
        saveState();
        render();
        toast('状态已恢复。');
      } catch (error) {
        toast('导入失败：文件不是有效的 Learning OS 状态。');
      }
    };
    reader.readAsText(file);
  }

  function resetState() {
    if (!window.confirm('确认清空所有本地学习证据和进度？此操作不可撤销，建议先导出。')) return;
    state = defaultState();
    LEGACY_STORAGE_KEYS.forEach(function (key) { localStorage.removeItem(key); });
    selectedOverride = null;
    clusterFilter = null;
    saveState();
    render();
    toast('本地学习状态已清空。');
  }

  function toast(message) {
    els['toast'].textContent = message;
    els['toast'].classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () { els['toast'].classList.remove('show'); }, 2600);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function truncate(value, length) {
    var text = String(value || '');
    return text.length > length ? text.slice(0, length - 1) + '…' : text;
  }

  function clipEvidence(value) {
    return String(value || '').slice(0, 6000);
  }

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
    } catch (error) {
      return value;
    }
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function bindEvents() {
    els['knowledge-search'].addEventListener('input', function () {
      knowledgeState.query = els['knowledge-search'].value;
      renderKnowledge();
    });
    els['knowledge-clear'].addEventListener('click', function () {
      knowledgeState.query = '';
      els['knowledge-search'].value = '';
      renderKnowledge();
      els['knowledge-search'].focus();
    });
    els['knowledge-cluster-list'].addEventListener('click', function (event) {
      var button = event.target.closest('[data-knowledge-cluster]');
      if (!button) return;
      knowledgeState.cluster = button.dataset.knowledgeCluster;
      knowledgeState.documentId = null;
      renderKnowledge();
    });
    els['knowledge-document-grid'].addEventListener('click', function (event) {
      var button = event.target.closest('[data-document-id]');
      if (!button) return;
      knowledgeState.documentId = button.dataset.documentId;
      renderKnowledge();
      document.querySelector('.section-index-head').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    els['knowledge-reset-document'].addEventListener('click', function () {
      knowledgeState.documentId = null;
      renderKnowledge();
    });
    els['knowledge-results'].addEventListener('click', function (event) {
      var taskButton = event.target.closest('[data-knowledge-task-id]');
      if (taskButton) {
        openSession(taskButton.dataset.knowledgeTaskId);
        return;
      }
      var sectionButton = event.target.closest('[data-section-id]');
      if (sectionButton) openKnowledgeSection(sectionButton.dataset.sectionId);
    });
    document.getElementById('close-knowledge-reader').addEventListener('click', function () {
      els['knowledge-dialog'].close();
    });
    document.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.getElementById('library').scrollIntoView({ behavior: 'smooth', block: 'start' });
        els['knowledge-search'].focus();
        els['knowledge-search'].select();
      }
    });

    ['profile-role', 'profile-mode', 'profile-minutes'].forEach(function (id) {
      els[id].addEventListener('change', function () {
        state.profile.role = els['profile-role'].value;
        state.profile.mode = els['profile-mode'].value;
        state.profile.minutes = Number(els['profile-minutes'].value);
        selectedOverride = null;
        saveState();
        render();
      });
    });

    document.getElementById('hero-start').addEventListener('click', function (event) { openSession(event.currentTarget.dataset.taskId); });
    document.getElementById('start-next').addEventListener('click', function (event) { openSession(event.currentTarget.dataset.taskId); });
    document.getElementById('resume-draft').addEventListener('click', function () {
      if (state.draft) openSession(state.draft.taskId, true);
    });
    document.getElementById('discard-draft').addEventListener('click', discardDraft);
    document.getElementById('refresh-recommendation').addEventListener('click', function () {
      selectedOverride = null;
      renderRecommendation();
      renderQueue();
      toast('已根据当前证据重新计算。');
    });
    document.getElementById('choose-alternative').addEventListener('click', function () {
      document.querySelector('.alternatives-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    document.getElementById('jump-queue').addEventListener('click', function () {
      document.getElementById('queue').scrollIntoView({ behavior: 'smooth' });
    });

    els['alternative-list'].addEventListener('click', function (event) {
      var button = event.target.closest('[data-task-id]');
      if (!button) return;
      selectedOverride = button.dataset.taskId;
      renderRecommendation();
      renderQueue();
      toast('已尊重你的改选；推荐理由仍然可见。');
    });

    els['cluster-grid'].addEventListener('click', function (event) {
      var button = event.target.closest('[data-cluster]');
      if (!button) return;
      clusterFilter = clusterFilter === button.dataset.cluster ? null : button.dataset.cluster;
      selectedOverride = null;
      render();
    });

    els['clear-cluster-filter'].addEventListener('click', function () {
      clusterFilter = null;
      selectedOverride = null;
      render();
    });

    els['queue-list'].addEventListener('click', function (event) {
      var button = event.target.closest('[data-task-id]');
      if (button) openSession(button.dataset.taskId);
    });

    document.getElementById('close-session').addEventListener('click', function () { closeSession(true); });
    els['session-dialog'].addEventListener('cancel', function (event) {
      event.preventDefault();
      closeSession(true);
    });
    els['next-phase'].addEventListener('click', nextPhase);
    els['previous-phase'].addEventListener('click', function () { setPhase(activePhase - 1); });
    els['phase-nav'].addEventListener('click', function (event) {
      var button = event.target.closest('[data-phase]');
      if (!button || button.disabled) return;
      setPhase(Number(button.dataset.phase));
    });
    els['request-hint'].addEventListener('click', requestHint);
    els['confidence-input'].addEventListener('input', function () {
      els['confidence-value'].textContent = els['confidence-input'].value;
      saveDraft();
    });
    document.querySelectorAll('[data-score]').forEach(function (select) {
      select.addEventListener('change', function () {
        updateSessionPreview();
        saveDraft();
      });
    });
    ['retrieve-response', 'construct-response', 'transfer-response', 'feedback-notes', 'exit-response'].forEach(function (id) {
      els[id].addEventListener('input', saveDraft);
    });

    document.getElementById('copy-session-coach').addEventListener('click', function () {
      if (activeTask) copyText(coachPrompt(activeTask), '本题 Socratic 教练提示已复制。');
    });
    document.getElementById('copy-coach-contract').addEventListener('click', function () {
      copyText(coachContract(), 'AI 教练契约已复制。');
    });

    document.getElementById('export-state').addEventListener('click', exportState);
    document.getElementById('evidence-export').addEventListener('click', exportState);
    document.getElementById('import-state').addEventListener('click', function () { els['state-file'].click(); });
    document.getElementById('evidence-import').addEventListener('click', function () { els['state-file'].click(); });
    els['state-file'].addEventListener('change', function () {
      if (els['state-file'].files && els['state-file'].files[0]) importState(els['state-file'].files[0]);
      els['state-file'].value = '';
    });
    document.getElementById('reset-state').addEventListener('click', resetState);
    window.addEventListener('beforeunload', saveDraft);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') saveDraft();
    });
  }

  function init() {
    cacheElements();
    TASKS.forEach(function (task) { nodeState(task.id); });
    if (state.draft && !taskById(state.draft.taskId)) state.draft = null;
    saveState();
    bindEvents();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
