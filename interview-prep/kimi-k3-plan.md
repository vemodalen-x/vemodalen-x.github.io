# Kimi K3 架构、技术报告与 Agent 系统面试路线

主入口：[Kimi K3 官方仓库](https://github.com/MoonshotAI/Kimi-K3)、[技术报告](https://arxiv.org/abs/2607.24653)、[张小珺商业访谈录领读视频](https://www.bilibili.com/video/BV1KZ8X6uEPL/)。本路线按 2026-08-29 可访问内容整理；报告、仓库和榜单会更新，面试前应重新核对版本。

视频全长约 2 小时 4 分，截至整理时没有公开字幕或章节标记。因此这里不伪造时间轴或讲者原话：视频用于建立论文谱系和第二解释，架构数字、机制与实验结论以 Moonshot 官方技术报告为真源。

## 0. 先记住一个结论

Kimi K3 不是“把 Transformer 换成线性注意力”，而是一套模型—训练—系统协同设计：

1. **序列信息流**：每个主块使用 3 层 Kimi Delta Attention（KDA）与 1 层 Gated MLA，在固定大小递归状态与全局内容注意力之间取舍。
2. **深度信息流**：Attention Residuals（AttnRes）让当前层选择性读取过去的层/块表示，而不只接收一条压缩后的残差流。
3. **宽度信息流**：Stable LatentMoE 在较窄 latent space 中激活 896 个 routed experts 中的 16 个，并用 Normalization、SiTU-GLU 和 Quantile Balancing 控制数值与负载。
4. **多模态入口**：MoonViT-V2 从头参与 next-token pre-training，经 projector 进入共享 backbone；图像与视频不是事后外挂。
5. **Agent 能力与生产系统**：SFT、分域/分 reasoning-effort RL、多教师 on-policy 蒸馏、白盒 Harness、可验证环境、百万 token rollout、混合缓存和 fleet scheduling 共同决定可用能力。

报告称这套架构、数据和训练配方整体相对 Kimi K2 取得约 2.5 倍 scaling efficiency。这个数字是组合结果，不能在没有消融证据时归因给 KDA、AttnRes 或 LatentMoE 中的任一单项。

## 1. 第一性原理地图：先问信息怎样流动

| 维度 | 约束 | K3 机制 | 必须守住的不变量 | 面试时追问 |
| --- | --- | --- | --- | --- |
| Sequence / P2、P3 | 全注意力 KV 与计算随上下文增长 | 3 KDA + 1 Gated MLA 的 hybrid block | KDA 状态递推正确；MLA 仍能访问全局内容 | 固定状态省了什么，丢了什么？ |
| Depth / P2、P3 | 普通 residual 把全部历史压成单向累积 | Block AttnRes 跨深度选择表示 | 注意力权重与 block 表示一致；pipeline 增量传递 | 它与 token attention 有什么本质差别？ |
| Width / P3、P7 | 大 MoE 权重、通信、负载和 outlier | Stable LatentMoE + Quantile Balancing | top-k dispatch 与 mixture weight 分离；推理 bias 冻结 | 为什么更多专家不必等于更大 active FLOPs？ |
| Modality / P2、P5 | 视觉编码器与语言模型可能接口错位 | MoonViT-V2 + MLP projector + shared backbone | processor、patch、position、token 与训练目标一致 | “原生多模态”具体统一了什么？ |
| Training / P4、P6 | 多领域、多预算专家难合并，长轨迹尾延迟高 | domain/effect RL + MOPD + partial rollout | teacher、采样策略、reward/verifier 和 student 版本可追踪 | 蒸馏为何必须是 on-policy？ |
| Serving / P4、P7 | KDA state 与 MLA KV 生命周期不同，1M 请求成本跨度巨大 | unified paged pool、checkpoint、affinity、admission control | 命中边界上两种缓存必须同时有效；共享快照不可原地修改 | cache hit、故障转移与 SLO 如何共同设计？ |

这张表把专题连接到全库八原语：目标与证据 P1、表征 P2、机制 P3、状态 P4、边界 P5、评估 P6、资源 P7、ownership P8。

## 2. 模型卡：数字只用于约束推理

| 项目 | 报告配置 | 它告诉你什么 |
| --- | --- | --- |
| 总参数 / 每 token active | 2.78T / 104.2B | 存储、训练通信和单 token 计算不是同一个量 |
| 主干深度 | 93 层：69 KDA + 24 Gated MLA | hybrid attention 不是少量试验层 |
| hidden / heads | 7168 / 96 | 先写 shape 再谈 kernel 与并行 |
| routed experts | 896，top-16/token | 稀疏路由、负载、通信和 expert quality 是核心问题 |
| shared experts | 2 | 共享路径与 routed path 同时存在 |
| latent expert dim | 3584 | routed experts 在半宽 latent space 中计算 |
| expert hidden dim | 3072 | 不要用传统 full-width MoE 直接估算 active cost |
| context | 1M tokens | 训练、prefill、decode、cache 和 Agent 环境都必须重新设计 |
| vision encoder | MoonViT-V2，约 401M、27 层 | 视觉入口相对 2.78T 主干很小，但长图/视频会制造不均衡计算 |
| routed expert quantization | weights MXFP4、activations MXFP8 | 低精度边界是训练和部署契约，不是导出后再补的技巧 |

面试估算先区分五个量：总权重、active 参数、训练 activation/optimizer state、prefill 计算、decode cache/带宽。把 2.78T 直接当成每 token 计算量，或把 104B active 当成完整部署内存，都是错误。

## 3. KK3-1：KDA 与 Gated MLA——固定状态和全局检索的混合

### 3.1 KDA 的状态递推

KDA 属于 gated delta-rule linear attention。概念上，当前 token 先按通道衰减旧状态，再用 key/value 和写入强度更新固定大小矩阵状态；query 从状态读取输出。它与 softmax attention 的关键差别不是“有没有 Q/K/V”，而是历史被压进递归状态，不保留所有 token 的独立 K/V。

- **收益**：KDA 层的 decode state 不随 sequence length 线性增长；chunkwise 形式可以在 chunk 内并行、chunk 间递归。
- **代价**：压缩状态不等于任意历史 token 的无损索引；状态更新、并行前缀组合、回滚和 cache checkpoint 更复杂。
- **K3 的补偿**：每 3 个 KDA 层插入 1 个 Gated MLA，让模型周期性获得不受递归压缩限制的全局内容访问，同时以 latent KV 降低全注意力缓存。

### 3.2 有界 decay 为什么是算法—硬件协同

K3 把 log-decay 映射限制在有界区间，报告给出的下界参数为 `g_min = -5`。对 16-token tile，累计 log decay 被限制在 `(-80, 0)`；其倒数仍落在 BF16 可表示范围。这样 diagonal 与 off-diagonal tile 可统一使用 dense Tensor Cores，避免极端 decay 造成的数值和 kernel 特殊路径。

正确的面试解释链是：

`递推公式 → 累积 decay 数值范围 → BF16 表示边界 → tile 计算形式 → kernel 吞吐`。

只说“加 sigmoid 更稳定”不够；也不能把硬件友好的有界参数化误讲成 KDA 理论本身的必然形式。

### 3.3 KDA 与 MLA 的状态表

| 对象 | 随 T 增长 | 可直接定位单个旧 token | speculative decode 回滚 | prefix reuse |
| --- | --- | --- | --- | --- |
| KDA recurrent state | 否，固定大小 | 否，历史已压缩 | 直接复制每个草稿状态很贵；K3 缓存投影并 replay | 需要在候选边界保存状态 checkpoint |
| MLA latent KV | 是 | 是，受 attention/表示能力约束 | 可截断未接受 token 的 cache | 细粒度 hash block 可复用 |

迁移问题：如果只有 KDA，你会期待哪些 needle retrieval、精确复制或回滚问题？如果只有 MLA，百万 token 的 cache、prefill 与 fleet isolation 又会怎样变化？

## 4. KK3-2：Attention Residuals——沿深度做选择性检索

普通 residual stream 把之前所有层的信息逐层累积进一个当前表示。AttnRes 把 embedding、当前 block 和此前 block 的表示当作一组“深度记忆”，每层用 learned pseudo-query 计算权重并选择性聚合。

- **Full AttnRes**：对过去层做选择，层数低于约 100 时算术量可接受，但内存和通信随深度增长。
- **Block AttnRes**：把若干连续层合成一个 block 表示。K3 大致使用 8 个 12-layer block，加上 embedding/当前部分，读取源约为 9 个，而非保存每一层完整表示。
- **与 token attention 的区别**：token attention 在序列位置间路由信息；AttnRes 在网络深度的历史表示间路由信息。二者共享“选择性加权读取”思想，但 axis、缓存、通信和因果含义不同。

系统问题比公式更重要：Block 表示何时生成、跨 pipeline stage 怎样增量发送、何时释放、prefill/decode 分别是计算还是内存瓶颈。报告通过 cache-based pipeline communication、sequence parallelism、side stream overlap 与 kernel fusion 限制额外开销。

## 5. KK3-3：Stable LatentMoE——更宽的专家空间与可预测负载

### 5.1 Latent routed path

每个 token 的 routed path 是：

`full hidden → down projection → top-16 latent experts → weighted aggregate → RMSNorm → up projection`。

另有 2 个 full-width shared experts。把 routed experts 放到 3584 维 latent space，使激活 16/896 个专家在成本上可行；这不等于 896 个 full-width FFN 都参与每个 token。

### 5.2 三层稳定性

1. **Normalized LatentMoE**：在 latent aggregate 上行投影前做 RMSNorm，控制汇合后的尺度。
2. **SiTU-GLU**：对 gate 与 up branch 分别 soft-cap；报告参数 `β1=4`、`β2=25`，形式输出上界为 100。它在原点附近保留 SwiGLU 行为，同时抑制 activation outlier。
3. **Quantile Balancing（QB）**：expert bias 只影响 top-k dispatch，不进入 mixture weights；根据 margin 的目标分位数一次计算下一步 bias，使各 expert 接近目标 token load。训练结束后 bias 在推理时冻结。

### 5.3 为什么 QB 不是“直接平均分配”

路由仍按模型 score 做 top-k，只移动每个 expert 的选择阈值；每个 token 的 mixture weight 仍由原始 score 归一化。这样负载调整不直接改写被选中专家的混合权重和对应梯度语义。

负载平衡有两个不同目标：

- **训练质量**：避免 dead expert 与长期过热 expert，给更多专家足够训练信号。
- **系统效率**：使 rank 的 token shape 可预测，减少 straggler、fragmentation 与 host synchronization。

MoonEP 进一步通过动态 redundant experts 实现 rank 级精确平衡，并把 dispatch/combine 通信与 expert/shared computation 重叠。面试时应把模型路由算法、expert-parallel 计划和 kernel schedule 分成三层。

## 6. KK3-4：原生多模态、预训练与长上下文

### 6.1 原生视觉入口

MoonViT-V2 从头与语言主干一起做 next-token prediction，经轻量 MLP projector 进入共享 embedding space。图像和视频共享视觉参数，采用空间/时间因子化 attention；2×2 pixel shuffle 将视觉 token 减少 4 倍。

报告称在 K3 的规模和配方下，从 SigLIP 初始化会带来更高梯度范数和 spike，而 from-scratch MoonViT-V2 在其报告评测中匹配 baseline。正确表述是“该设置中的经验结果”，不是“预训练 vision encoder 普遍无用”。

### 6.2 预训练与优化

- Per-Head Muon 分别对 Q/K/V head 的更新做正交化，避免大矩阵不同 head 更新尺度失衡。
- 模型从一开始就在 interleaved text/visual next-token data 上训练，不先训练纯文本再对齐视觉。
- context curriculum 从 8K、64K 逐步扩展，cooldown 阶段再到 256K、1M。
- KDA recurrence 与 MLA NoPE 减少直接扩展长上下文时的 position remapping 依赖；训练数据仍需真实长文、清洗、重采样与 scattered-dependency synthesis。
- 报告中的 cosine 优于 WSD 是在两者各自调优后的本项目结果，不是跨模型优化器/调度器定律。

长上下文能力至少包含四件事：可接受 loss/perplexity、长程检索/推理、Agent 多步状态一致性、可部署的 prefill/cache/调度成本。只报 needle score 不等于后面三项成立。

## 7. KK3-5：从 SFT、分域 RL 到多教师 On-Policy 蒸馏

### 7.1 九个教师的坐标

K3 把后训练拆成 3 个 domain 与 3 个 reasoning-effort：

| Domain | low | high | max |
| --- | --- | --- | --- |
| General tasks | 短预算教师 | 深推理教师 | 最大预算教师 |
| General agents | 短轨迹教师 | 深轨迹教师 | 最大预算教师 |
| Coding agents | 短代码教师 | 深代码教师 | 最大预算教师 |

这些 teacher 不是简单投票。Multi-Teacher On-Policy Distillation（MOPD）让 student 按当前策略生成 token，再由目标 domain/effect 的 teacher 对同一 on-policy token 给 dense log-ratio reward。它减少 student 只学习 teacher 离线轨迹、却在自己的状态分布上失效的问题。

报告中 top-k distillation 没有改善其设置；这是负结果边界，不应外推为所有 top-k distillation 都无效。

### 7.2 Partial rollout 与 reasoning effort

- **Partial rollout**：在预定比例暂停长轨迹，把 straggler 带到下一轮继续；stale trajectory 通过 per-token regularization 处理。它优化尾延迟与 GPU 利用率，但引入 policy lag、sandbox 生命周期和 cache retention 问题。
- **Reasoning effort RL**：先估计题目预算，对超预算 token 加惩罚，并退火 multiplier。它是在质量—计算之间学习条件化策略，不是把 UI 中的 low/high/max 简单翻译为固定 token 上限。
- **Agentic GRM**：judge 先形成 rubric，再评分并记录分项，同时控制 verbosity。模型 judge 仍需人工校准、高风险 slice 和确定性 verifier。

### 7.3 白盒 Harness 与可验证环境

报告把 Agent Harness 拆成 tools、system prompts、context、skills、memories、subagents 等可配置模块，并在不同 task group 上采样不同组合，降低只适配一种 Harness 的风险。

Agent Environment Task（AET）至少包含：初始状态、目标、工具 action space、预算和独立 verifier。reward 检查最终环境状态，而不只 judge 最终文字；公开与隐藏 verifier、有限提交次数共同降低 reward hacking。

连接到 FDE 时，重点不是“会调用很多工具”，而是：

- 是否能把客户工作流变成可验证初始状态和目标状态；
- 工具权限、副作用、预算、停止与人工升级是否属于控制面；
- 测试环境能否重放，隐藏检查能否覆盖投机路径；
- 训练时多样 Harness 与生产时具体 Harness 的分布差异怎样监控。

## 8. KK3-6：百万 token RL、沙箱与在线服务

### 8.1 RL 基础设施

1M context 的 Agent rollout 会让 prefix miss 极其昂贵。K3 使用外部 KV cache pool：活跃 decode block 留在 GPU，空闲可复用 prefix 在 GPU eviction 时 write-back 到 CPU DRAM；对应 KDA state 与 MLA KV 一起 offload/prefetch。rollout scheduler 依据 active/queued request 与 KV utilization 自动限流，而不是用固定并发猜完整轨迹长度。

AgentENV 使用 microVM 隔离，并提供 pause/resume、fork、snapshot。其价值不是“虚拟机更高级”，而是让高风险探索、reward judging 无副作用分叉、长轨迹暂停与失败恢复同时可用。报告中的启动、checkpoint、overcommit 和累计 sandbox 数量都是发布方在其 workload 上的测量，不自动等于其他平台的 SLO。

### 8.2 混合 KDA–MLA prefix cache

同一 prefix 只有在候选边界同时存在 MLA KV 和所有 KDA group 的 state checkpoint 时才可复用。K3 将两种 cache 放进同一 paged pool，但分离：

- **physical allocation block**：较粗，用于统一分配、引用计数、驱逐和传输；
- **MLA hash block**：可细到报告示例中的 512 tokens；
- **KDA checkpoint**：只在部分 hash boundary 保存，通常保留 conversation turn 边界。

命中后，KDA cached checkpoint 作为只读快照复制到 request-private running state；新状态写入新 slot。并发调度必须先 pin 所有 cache group 的 hit block，再分配 copy-on-write block；某个 KDA group 的 checkpoint 被驱逐时，同一逻辑 checkpoint 必须整体失效。

这是 P4 状态与 P5 契约的典型面试题：统一内存池不等于统一数据语义，缓存可复用边界由两种状态的交集决定。

### 8.3 speculative decoding、fleet 与 SLO

- KDA decode state 每 token 原地更新；草稿被部分拒绝时，逐位置保存巨大 state 太贵。K3 缓存较小的 projected inputs，在片上 replay 已接受 token，再写回 verified/bonus states。
- cache-aware affinity 把 session 路由到持有 prefix 的 primary cluster，并用 consistent hashing 预分配 secondary；故障切换需重新 prefill，但 re-prefill 压力分散到 fleet。
- budget-based admission control 为短请求和百万 token 请求分配独立资源预算，避免长请求突发拖垮全局 TTFT。

FDE/系统设计追问：客户只看平均延迟时，为什么仍要按 request class 管理 TTFT、prefill tokens、decode tokens、cache hit、queue time、failover re-prefill 和 cost？

## 9. XTML Chat Template：模型接口也是系统架构

K3 的 XTML 使用显式 reserved tokens 表示结构边界，assistant message 分为 `think`、`response`、`tools` channels；并行 tool call 带 index，结果用相同 tool/index 配对，arguments 带类型。

- global options（tool declaration、reasoning effort）放在历史消息前；修改它们通常使历史 KV cache 失效。
- one-shot options（tool choice、response format）放在输入消息后，使单次请求改动不破坏历史 cache。
- conversation 中动态加载的工具通过 input option message 追加，无需重建此前上下文。
- 报告中的 preserved thinking 是 K3 的训练/模板设计，不是所有供应商 API 的通用承诺；应用层不应依赖不可见内部推理作为审计证据。

面试时把 template 看成四类 contract：tokenization、训练 loss mask、stream parser/grammar、cache invalidation。只展示漂亮 tag，而不测试空 channel、并行结果乱序、未知类型和动态工具变更，不算完成。

## 10. 证据审计：哪些话可以说，哪些必须降级

| 主张 | 可说到什么程度 | 必须补的限制/实验 |
| --- | --- | --- |
| K3 支持 1M context | 官方模型/报告配置 | 分任务测长程一致性、cache hit、TTFT、成本和失败分母 |
| KDA 比全注意力高效 | KDA state 固定，报告给出专用 kernel/CP 设计 | 依硬件、batch、sequence、head dims、prefill/decode 分区 benchmark |
| 约 2.5× scaling efficiency | 报告对 K2 的组合结果 | 需要定义 compute/data/metric 和消融；不能单项归因 |
| Quantile Balancing 完美平衡 | 训练 batch 目标负载与 MoonEP rank 计划有明确机制 | expert quality、跨 batch 波动、inference routing 与系统吞吐分开验证 |
| K3 Agent 能力强 | 报告展示多项公开/自建 benchmark | 结果依赖 reasoning effort、temperature、tools、Harness、日期与 judge；部分对比 Harness 不同 |
| 原生多模态更好 | 报告给出统一预训练与本模型结果 | 必须与相同数据/预算的 pretrained-encoder baseline 比较，不普遍外推 |
| microVM 更安全 | 隔离/fidelity 边界强于普通共享 container | 仍需 threat model、网络/secret policy、镜像供应链、资源 DoS 与逃逸监控 |

评测读表固定问六件事：模型版本、reasoning effort、采样参数、工具/Harness、任务日期/污染风险、失败是否计入分母。发布方 in-house benchmark 可以支持其主张，但不等于独立复现；报告也明确 K3 在总体上仍落后于最强 proprietary models。

## 11. 六个 Session：读、画、做、讲

### KK3-0 · 20 分钟来源预检

- 浏览报告摘要、Figure 2、Table 1 和结论。
- 记录视频元数据、时长、说明区论文链；确认没有公开字幕/章节。
- 输出一张三列卡：官方事实 / 视频解释或类比 / 我自己的假设。

### KK3-1 · 55 分钟架构总图

- 阅读报告 §2.1–2.5；沿 sequence/depth/width/modality 四轴重画 Figure 2。
- 给 KDA state、MLA KV、AttnRes block、latent expert 写 shape/生命周期/成本表。
- 闭卷回答：为什么 hybrid，而不是全部 KDA 或全部 MLA？

### KK3-2 · 60 分钟数值与 MoE 故障实验

- 为 16-token chunk 计算有界/无界 log-decay 的 BF16 范围。
- 写 toy top-k router：比较 fixed-step expert bias 与 Quantile Balancing；验证 bias 不进入 mixture weight。
- 注入 overheated expert、dead expert、tie、极小 batch，记录负载与质量 proxy。

### KK3-3 · 50 分钟多模态与长上下文

- 画 image/video → patch → MoonViT-V2 → projector → shared backbone。
- 设计 text-only、image shuffle、OCR、long-video、scattered dependency 五个 slice。
- 比较“1M 可输入”“1M 可检索”“1M Agent 可持续运行”“1M 可经济服务”。

### KK3-4 · 60 分钟 Agent 后训练与 Harness

- 画 SFT → 9 teachers → MOPD → QAT/EAGLE 的 lineage。
- 把一个 FDE 客户工作流形式化为 AET：initial state、goal、tools、budget、public/hidden verifier。
- 设计 fixed model 换 Harness、fixed Harness 换 model、teacher/off-policy 对照。

### KK3-5 · 60 分钟推理与评测答辩

- 画 KDA state + MLA KV 的统一 pool、hash/checkpoint 命中和 copy-on-write。
- 注入 partial draft rejection、checkpoint 缺一组、cluster failover、1M burst。
- 用 10 分钟完成架构—训练—Agent—serving—证据五层答辩，剩余时间接受 why-not 追问。

默认只把 KK3-1、KK3-4、KK3-5 作为桌面端评分节点；KK3-0/2/3 是前置与补缺实验，避免把一篇报告膨胀成六个同时到期任务。

## 12. 三个桌面交互节点的完成标准

### 节点 A · 架构地图

产物：四轴架构图 + KDA/MLA state table + AttnRes/LatentMoE 数据流 + 一个 90 秒答案。

过关：能从 shape、状态递推、信息损失和资源解释 hybrid 设计；能给出全 KDA、全 MLA 和普通 MoE 的反例；不把报告组合收益单项归因。

### 节点 B · Agent 训练系统

产物：SFT/RL/MOPD lineage + AET/verifier/Harness 图 + 两个消融。

过关：分清 model、teacher、Harness、environment、verifier；能解释 on-policy、partial rollout、reasoning effort 和 judge calibration；把客户目标连接到可验证环境状态。

### 节点 C · Serving 与评测审计

产物：混合 cache 状态机 + 四个故障 trace + benchmark evidence card。

过关：能说明 KDA/MLA cache 的不同生命周期、共同命中条件、spec decode replay、affinity/admission control；所有性能与榜单结论都带设置、分母和限制。

## 13. 面试问题池

### 架构与数值

1. 用 90 秒解释 K3 为什么采用 3 KDA + 1 Gated MLA。
2. KDA fixed recurrent state 与 KV cache 的信息、内存和回滚差异是什么？
3. 有界 log-decay 如何从公式影响 BF16 和 Tensor Core kernel？
4. AttnRes 为什么不等于多一个 token-attention layer？Block 版本改变了什么复杂度？
5. LatentMoE 如何让 top-16/896 可行？active 参数应怎样估算？
6. SiTU-GLU、RMSNorm 与 QB 分别在解决数值、表示还是负载问题？
7. QB bias 为什么不能直接进入 mixture weight？ties 或小 batch 会怎样？

### 训练、多模态与 Agent

8. 为什么 from-scratch vision encoder 的结论不能直接推广到别的模型？
9. 从 8K 训练到 1M context，数据、位置、优化、评测和 serving 各要补什么？
10. Per-Head Muon 相比把 QKV 当一个矩阵正交化，试图控制什么？
11. 多教师 on-policy distillation 与离线 teacher trajectory 蒸馏的 distribution mismatch 有何不同？
12. partial rollout 改善了什么，又引入哪些 stale-policy、cache 和 sandbox 问题？
13. 如何证明 reasoning effort 学到质量—预算条件化，而不是只变长或变短？
14. 白盒 Harness 随机化怎样减少 harness overfitting？什么实验能证伪？
15. public/hidden verifier、有限提交与 final-state reward 怎样共同抑制 reward hacking？

### 推理、系统与 FDE

16. 为什么 KDA state 与 MLA KV 可以共用内存池，却不能共用相同缓存语义？
17. prefix lookup 为什么必须取 MLA hash hit 与全部 KDA checkpoint hit 的交集？
18. speculative decode 部分拒绝时，replay projected inputs 为什么比每步保存 state 更划算？
19. cache-aware affinity 的故障域是什么？为什么 secondary 不预复制全部 prefix cache？
20. 如何用 admission control 防止 1M context 请求伤害短请求 TTFT？
21. XTML 中 global option 与 one-shot option 的位置为什么影响 KV cache？
22. 若榜单总分上升但 Harness、tools 或 reasoning effort 不同，怎样做可比性审计？
23. 作为 FDE，你会把 K3 的哪些能力写进客户承诺，哪些只放进受限 pilot 假设？
24. 线上出现高 cache hit 但 p95 退化，你如何按 model/kernel/scheduler/fleet 路由故障？

## 14. 视频领读的正确用法

视频说明区给出了一条很好的论文谱系：RetNet → Gated DeltaNet → Kimi Linear → Gated Attention；Pre-LN/Post-LN → Hyper-Connections → Attention Residuals；LatentMoE → clamped SwiGLU → Muon/outlier → Quantile Balancing；WSD/RNoPE → K1.5 partial rollout → K2.5 reasoning effort/Agentic GRM → on-policy distillation；FLA kernel → DeepSeek 通信—计算重叠。

观看时不要抄完整笔记，只维护四列：

| 视频提出的连接 | K3 报告原文位置 | 前置论文改变了什么 | 我的反例/待验证点 |
| --- | --- | --- | --- |
| KDA 的谱系 | §2.1、§5.1、§5.4.2 | decay、delta rule、gating、kernel | full attention 仍在哪些 slice 更强？ |
| 深度 attention | §2.2 | residual 由固定累积变为选择性读取 | block 压缩会丢什么？ |
| Stable LatentMoE | §2.3、§5.2.1 | latent routing、soft cap、load balance | 平衡是否伤害 expert specialization？ |
| Agent 后训练 | §4.1–4.2、§5.3 | partial rollout、effort、GRM、MOPD | judge 与 verifier 如何被投机？ |
| serving co-design | §5.4 | hybrid cache、kernel、fleet scheduling | 哪些收益只在特定硬件/流量成立？ |

若之后视频发布官方字幕或章节，再补真实时间戳；在此之前按报告章节定位，不用模型猜测。

## 15. 最小复现与作品集升级

不需要下载 2.78T 权重。一个足以面试展示的最小项目包括：

1. NumPy/PyTorch toy KDA：逐 token recurrence 与 chunked 结果做 parity；比较 state memory 与 attention KV。
2. bounded decay test：BF16 下记录 cumulative decay、inverse、NaN/Inf 与误差。
3. toy Block AttnRes：保存 layer/block representations，画权重随输入变化；和普通 residual 做信息检索任务。
4. toy latent MoE：top-k routing、QB、load histogram、dead/overheated expert 故障注入。
5. hybrid cache simulator：MLA hash block、KDA checkpoint、copy-on-write、eviction、partial-draft replay 与 cluster failover。
6. evidence card：固定任务集，分别替换 attention、router、Harness/verifier 或 scheduler；记录成功、trace、资源、失败分母和残余风险。

对 AI Agent / Forward Deployed Engineer，最有价值的不是复现某个 kernel，而是第 5–6 项：把模型状态、工具环境、验证者、缓存/SLO 与客户验收连成可重放系统证据。

## 16. 完成定义

- 能闭卷画出 sequence/depth/width/modality 四轴架构，并给出关键 shape 与状态生命周期。
- 能推导 KDA recurrence 的信息压缩与有界 decay 的数值意义，而非只背缩写。
- 能解释 Stable LatentMoE 的三层稳定性和 QB 的 dispatch/mixture 分离。
- 能把 SFT、九教师 RL、MOPD、AET、Harness、verifier 与 AgentENV 放进同一训练系统图。
- 能设计 KDA/MLA hybrid cache 的命中、并发、回滚、故障转移与 admission control。
- 任一榜单或效率数字都带真源、设置、失败分母、可比性和限制。
- 7 天后无提示完成一个新 hybrid-model/agent-serving 变式，迁移与独立性均达到 3/4。

## 17. 一手延伸阅读

- [Kimi K3 官方仓库与报告 PDF](https://github.com/MoonshotAI/Kimi-K3)
- [Kimi K3 arXiv](https://arxiv.org/abs/2607.24653)
- [Kimi Linear](https://arxiv.org/abs/2510.26692)与[Flash Linear Attention](https://github.com/fla-org/flash-linear-attention)
- [Gated Delta Networks](https://research.nvidia.com/publication/2025-04_gated-delta-networks-improving-mamba2-delta-rule)
- [Attention Residuals](https://arxiv.org/abs/2603.15031)与[Hyper-Connections](https://arxiv.org/abs/2409.19606)
- [LatentMoE](https://arxiv.org/abs/2601.18089)与[Moonlight / Muon](https://arxiv.org/abs/2502.16982)
- [Kimi K1.5](https://arxiv.org/abs/2501.12599)、[Kimi K2.5](https://arxiv.org/abs/2602.02276)与[MiniLLM](https://arxiv.org/abs/2306.08543)
- [AgentENV](https://github.com/kvcache-ai/AgentENV)与[MoonEP](https://github.com/MoonshotAI/MoonEP)
- [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437)
