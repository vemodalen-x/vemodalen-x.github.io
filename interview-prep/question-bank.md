# Senior AI Engineer 核心面试题库（90 题）

默认目标：Computer Vision / Edge ML / Computational Photography / Multimodal & Agentic AI。P0 共 68 题，先练 P0。

## 通用答题框架

技术概念题用 `定义 → 机制 → 何时使用 → 权衡/失败模式 → 项目例子`。

项目题用 `背景与约束 → 你的职责 → 关键决策 → 指标与验证 → 失败/复盘 → 结果`。

系统设计题用 `用户与目标 → 约束/SLO → 数据与指标 → 架构 → 深挖 → 失败处理 → 发布与监控 → 成本/迭代`。

---

## R. 简历与项目深挖（10 题）

- **R1 · P0**：用 2 分钟介绍自己。为什么你的主线是“从感知到生产”，而不是一组互不相关的模型项目？
- **R2 · P0**：选一个实时相机构图或人像系统，从输入帧到最终渲染完整画出数据流、线程/设备边界和状态流。
- **R3 · P0**：你在该系统中亲自拥有的部分是什么？哪些由算法、端侧、应用或产品同事负责？
- **R4 · P0**：讲一个离线指标不错、上设备后却失败的案例。根因如何定位，验证链怎样补齐？
- **R5 · P0**：讲一个最难 hard case。你如何把用户主观反馈转化为可复现样例、失败分类和发布门槛？
- **R6 · P0**：从 PyTorch 模型到 TFLite/ONNX/C++/Android，最容易出现哪些数值或语义不一致？你如何逐层排查？
- **R7 · P0**：讲一次模型、渲染、延迟和视觉质量之间的重大权衡。你最终放弃了什么，为什么？
- **R8 · P0**：你怎样证明量化、模型替换或运行时升级没有破坏产品质量？
- **R9 · P0**：你在多模态/Agentic AI 上的生产能力，哪些已有真实证据，哪些仍是成长方向？
- **R10 · P1**：如果加入后 90 天要接手一个陌生 AI 功能，你会如何建立数据、模型、运行时、评估和交付全景？

**本组优秀信号**：明确个人贡献；给出数字或至少指标定义；能解释弃选方案；主动讲失败、检测与回滚；不泄露前雇主机密。

---

## M. ML、统计与训练基础（12 题）

- **M1 · P0**：解释 bias–variance trade-off。训练集、验证集误差分别呈现什么信号，下一步怎么做？
- **M2 · P0**：什么是 data leakage？时间序列、同一用户多样本、图像增强和预处理统计各会怎样泄漏？
- **M3 · P0**：L1、L2、dropout、data augmentation、early stopping 分别在什么条件下有效？
- **M4 · P0**：类别极不平衡时，为什么 accuracy 可能误导？如何在 precision、recall、PR-AUC、ROC-AUC 和业务成本间选择？
- **M5 · P0**：什么是模型校准？排序正确但校准很差会给产品带来什么问题？
- **M6 · P0**：区分 covariate shift、label shift 和 concept drift；各自如何检测和应对？
- **M7 · P0**：SGD、Momentum、Adam 的差异是什么？为什么泛化最好和收敛最快可能不是同一个优化器？
- **M8 · P0**：BatchNorm 在训练和推理阶段有何不同？小 batch、分布变化和模型导出会导致什么问题？
- **M9 · P1**：从最大似然解释线性回归的 MSE 和二分类的交叉熵。
- **M10 · P1**：交叉验证何时适用？何时必须按用户、场景、设备或时间做 group/time split？
- **M11 · P1**：如何判断性能瓶颈来自数据、标签、模型容量、优化过程还是评估集设计？
- **M12 · P1**：设计一次离线实验来判断新模型的提升是否真实、稳定，并且具有产品意义。

**本组优秀信号**：从数据生成过程出发；指标与错误成本关联；知道“随机切分”不是默认正确答案；能设计诊断实验而不只列术语。

---

## V. Computer Vision 与计算摄影（14 题）

- **V1 · P0**：卷积的归纳偏置是什么？CNN 和 ViT 在数据量、分辨率、延迟和部署上的取舍是什么？
- **V2 · P0**：给定 kernel、stride、padding、dilation，计算输出尺寸和多层 receptive field。
- **V3 · P0**：语义分割中如何选择 CE、Dice、Focal、IoU 类损失？类别不平衡和细边界各怎么办？
- **V4 · P0**：人像 matting 与 segmentation 的目标有何不同？alpha、前景颜色、边缘和透明物体如何评估？
- **V5 · P0**：单目深度为何存在尺度/平移歧义？相对深度怎样安全地用于虚化或构图，而不伪装成公制深度？
- **V6 · P0**：光流依赖哪些假设？运动模糊、遮挡、无纹理区域、曝光变化和大位移时为何失败？
- **V7 · P0**：检测与跟踪怎样组合？数据关联、轨迹生命周期、遮挡恢复和抖动抑制怎么做？
- **V8 · P0**：解释 IoU、NMS、Soft-NMS。密集目标或重叠人像场景中标准 NMS 有什么问题？
- **V9 · P0**：为什么逐帧分割效果很好，视频仍可能闪烁？如何定义和改善 temporal consistency？
- **V10 · P0**：设计一个 depth-aware bokeh pipeline。深度噪声、前景泄漏、散景核、边缘 halo 和性能如何处理？
- **V11 · P0**：相机图像链路中的 RAW/RGB/YUV、线性空间/gamma、白平衡和色彩空间差异为何会影响模型与渲染？
- **V12 · P1**：如何构建覆盖发丝、透明物、逆光、运动、低照、肤色和多人的 hard-case 数据集？
- **V13 · P1**：PSNR/SSIM/LPIPS 与人工主观评测各能说明什么？怎样设计成对视觉质量评审？
- **V14 · P1**：如果要从多视角图像和深度传感器重建物体，SfM、MVS、配准和融合分别处于哪一步？

前沿 CV 深挖：使用 [Vincent Sitzmann 路线](vincent-sitzmann-cv-plan.md)的 VSCV-1–5 深化 V5、V6、V13、V14，把相机光线、神经场、SIREN、volume rendering、Gaussian/light field 取舍和 novel-view split 落到两个交互练习；world model 与“3D 会过时吗”仅在 JD 命中时选修，不新增主库题号。

**本组优秀信号**：把模型输出放回相机/视频链路；讨论边界、时序与主观质量；说明坐标系、色彩空间和数值范围；给出 hard-case taxonomy。

---

## E. Edge AI、运行时与工程化（12 题）

- **E1 · P0**：PTQ 与 QAT 的差别是什么？权重/激活、per-tensor/per-channel、对称/非对称量化如何选择？
- **E2 · P0**：量化后精度突然下降，你会按什么顺序排查算子、校准集、动态范围、预后处理和数值误差？
- **E3 · P0**：模型从 PyTorch 导出到 ONNX/TFLite 时，动态 shape、unsupported ops、resize、padding 和 layout 会造成哪些差异？
- **E4 · P0**：如何建立桌面、转换后模型与真实设备三层 parity test？每层比较哪些张量和容差？
- **E5 · P0**：端到端延迟预算怎样拆分到采集、预处理、推理、后处理、GPU 渲染和 UI？平均延迟为何不够？
- **E6 · P0**：什么时候系统受算力限制，什么时候受内存带宽、拷贝或同步限制？如何用 profiling 证明？
- **E7 · P0**：CPU、GPU、NPU 混合 pipeline 中如何减少数据拷贝、格式转换和强制同步？
- **E8 · P0**：实时流中生产者快于消费者怎么办？比较丢帧、背压、队列上限和处理旧帧的后果。
- **E9 · P0**：C++/JNI/Android 边界常见的生命周期、线程安全、内存 ownership 和异常处理问题有哪些？
- **E10 · P1**：设备发热、频率降级和电量限制下，如何定义持续性能而不是冷启动 benchmark？
- **E11 · P1**：模型或运行时上线后如何 canary、回滚、兼容旧配置，并保存可定位问题的版本信息？
- **E12 · P1**：当设备能力不足时，如何设计降级路径：降分辨率、降频、换模型、关功能还是云端 fallback？

**本组优秀信号**：关注端到端而不只报模型 latency；用 trace/profiler 说话；明确 tensor contract；能解释资源预算和安全降级。

---

## S. ML 系统设计与评估（10 题）

- **S1 · P0**：设计一个实时移动端人像虚化功能，从产品目标、数据、模型、渲染到发布监控完整回答。
- **S2 · P0**：设计一个相机构图建议系统。如何避免建议频繁跳变、打扰用户或优化错误目标？
- **S3 · P0**：设计一个多模态视觉质量评估平台，支持多模型/供应商路由、结构化输出、重试、追踪和回归门槛。
- **S4 · P0**：离线指标、在线技术指标、用户体验指标和业务指标分别如何选择？它们冲突时怎么办？
- **S5 · P0**：如何把线上失败样例转化为数据闭环，同时避免反馈偏差、隐私泄漏和重复污染？
- **S6 · P0**：设计模型发布流程：artifact、配置、golden set、shadow/canary、acceptance gate、回滚与审计。
- **S7 · P0**：线上没有即时 ground truth 时，如何监控质量、数据漂移、异常输入和 silent failure？
- **S8 · P1**：为一个日活百万的图片理解功能做粗略容量、存储、吞吐、p95 延迟和成本估算。
- **S9 · P1**：何时选择端上、云端或混合推理？从隐私、延迟、成本、更新速度和可靠性权衡。
- **S10 · P1**：如果资源只够先做 MVP，你会砍掉哪些复杂组件？怎样保留未来演进接口而不过度设计？

**本组优秀信号**：先澄清目标和 SLO；给 baseline；区分 model metric 与 product metric；包含失败、隐私、成本、上线和 ownership。

全栈产品交付延伸：使用 [Topcoder Fullstack 路线](topcoder-fullstack-roadmap-plan.md)的 FS-1/3/4/5 深化 S1、S4 与 C10，把 Browser → API → Service → DB 的契约、幂等、事务和测试落到纵向切片；用 FS-6/7 深化 S6 的安全、可观测性、CI、migration 与回滚。它提供项目证据和变式，不扩张本页 90 题主库。

分布式系统延伸：使用 [Martin Fowler 模式路线](distributed-systems-patterns-plan.md)的 PDS-0/1/2/6 深化 S3、S6、S8，把 WAL、majority quorum、replicated log、follower read、timeout/retry 和 Idempotent Receiver 放进确定性故障实验；用 PDS-3/4/5/7 处理 lease/fencing、clock/version、partition migration 与 2PC 边界。它不扩张 90 题主库，也不把模式目录摘要当算法证明。

---

## G. LLM、Multimodal 与 Agentic AI（14 题）

学习辅助：[The Transformer Architecture: A Visual Guide](https://www.hendrik-erz.de/post/the-transformer-architecture-a-visual-guide-pdf-download)（[单页 PDF](https://www.hendrik-erz.de/storage/app/media/pdf/Transformers_v1.1.pdf)）。先用它建立 encoder–decoder、attention、残差连接和 FFN 的空间图景，再单独补 decoder-only LLM 与推理机制。

后训练与 VLM 实践：使用 [Smol Course 路线](smol-course-plan.md)的 SC-1/2/4 深化 G5/G7/G9，形成 template parity、SFT baseline 和分层评测；LLM/VLM 岗再用 SC-5/6 深化 preference alignment 与 G8。它只增加证据结构和变式，不新增主库题号，也不把 train loss 或 notebook 成功当作答案。

统一多模态架构案例：使用 [SenseNova-U1 路线](sensenova-u1-plan.md)的 SNU1-0/1/2/3 深化 G1/G8，比较典型 VE+projector/LLM、VAE diffusion 与 NEO-unify；用 SNU1-7/8/9/10 深化 G7/G10 的显存、评测和服务取舍。它不新增主库题号；必须区分作者主张、仓库实现、评测协议和自己的复现。

Agent 工程主教材：李博杰《深入理解 AI Agent》中文 PDF v1.2（[配套代码](https://github.com/bojieli/ai-agent-book)）。使用[面试化学习路线](ai-agents-in-depth-plan.md)的 AID-1/2/4/6/7 分别深化 G11-G14；AID-3 对应 G5-G7/G13，AID-5 用真实仓库 trace 补 Coding Agent。它提供练习与证据，不扩张本页 90 题主库。

Agent 实现与项目证据：使用 [Hello-Agents 实践路线](hello-agents-plan.md)的 HA-1/2 深化 G11-G13，把 ReAct、Plan-and-Solve、Reflection 和固定 workflow 放进同一可重放实验；用 HA-6/7 深化 G14，把项目截图替换为 component/trace/end-to-end 评测、失败注入与答辩包。附录社区面试题只检查漏项，不扩张主库题号，也不直接采用参考答案。

Coding Agent / Agent Infra 延伸：使用 [Harness Engineering 路线](harness-engineering-plan.md)的 HE-1/3/6 深化 G11、G13、G14，把 repo map、SPEC、机械约束、行为评测和反馈飞轮落到真实仓库；它同样不扩张 90 题主库。

Harness 听辨：使用[播客实践路线](agent-harness-podcast-plan.md)把 G11–G14 重组为执行、状态、治理三层，并用主张—证据矩阵检查 CLI vs MCP、context vs control、memory 和权限分离；它提供新的回答结构，不新增主库题号。

Prompt 工程延伸：使用[高质量 Prompt 路线](prompt-engineering-method-plan.md)深化 G9、G10、G13、G14。重点不是角色/五段式或固定 temperature，而是任务契约、真源/权限、可验证输出、冻结 eval set、版本与回滚；两项交互练习只增加变式和生产证据，不扩张本页 90 题主库。

- **G1 · P0**：完整走一遍 Transformer block；为什么 attention score 要除以 √dₖ？
- **G2 · P0**：KV cache 保存什么？prefill 与 decode 有何不同？上下文长度、batch 和层数如何影响显存？
- **G3 · P1**：比较 MHA、MQA、GQA；它们怎样权衡质量、KV cache 和吞吐？
- **G4 · P1**：RoPE 如何编码相对位置？长上下文外推为什么困难？
- **G5 · P0**：面对新知识、私有知识或行为/格式改变，何时选 RAG、fine-tuning、long context 或工具调用？
- **G6 · P0**：设计 RAG 的 chunking、embedding、hybrid retrieval、metadata filter、reranking 和 citation 链路。
- **G7 · P0**：如何分别评估 retrieval 与 generation？定义 recall@k、MRR/nDCG、faithfulness、answer relevance 和 abstention。
- **G8 · P0**：典型 VLM 如何连接 vision encoder、projector 与 LLM？dual encoder 与 cross-attention/生成式 VLM 有何不同？
- **G9 · P0**：结构化输出为何仍会失败？schema validation、constrained decoding、repair、retry 和 fallback 怎么组合？
- **G10 · P0**：如何在多个模型/供应商之间路由？需要记录哪些 trace，怎样避免重试放大成本和尾延迟？
- **G11 · P0**：什么时候应该用 deterministic workflow，什么时候需要 agent？单 agent 与 multi-agent 的成本和可靠性差异是什么？
- **G12 · P0**：有副作用的工具调用怎样设计权限、确认、idempotency、timeout、重试、补偿和审计？
- **G13 · P0**：如何防 prompt injection、越权工具调用、PII 泄漏和不可信检索内容？
- **G14 · P0**：如何评估 agent：任务成功、工具选择/参数、轨迹、步数、终止、人工升级和成本分别怎么量化？

**本组优秀信号**：能说清控制面与模型面的边界；评估到 step/trace 层；对副作用默认保守；包含成本、缓存、路由、人工确认和降级。

---

## C. 编码与计算机基础（10 题）

- **C1 · P0**：不用深度学习框架，实现二维卷积并说明 shape、padding、stride、dilation 和复杂度。
- **C2 · P0**：实现 connected components；比较 DFS/BFS 与 union-find，并讨论大图内存。
- **C3 · P0**：实现 IoU 与 NMS；说明数值边界、空输入、坐标约定和复杂度。
- **C4 · P0**：实现 bilinear resize 或 grid sampling；解释半像素坐标和 align-corners 差异。
- **C5 · P0**：用 NumPy 实现 logistic regression 或 k-means，包含稳定性、停止条件和测试。
- **C6 · P0**：实现固定容量的 producer–consumer queue，说明背压、关闭协议和线程安全。
- **C7 · P1**：实现 LRU cache，并讨论并发访问和内存上限。
- **C8 · P1**：给定 tensor shape/stride，解释 contiguous、view/reshape、NHWC/NCHW 和错误索引。
- **C9 · P1**：定位一段 C++/JNI 代码中的 use-after-free、double free、悬挂引用或跨线程生命周期问题。
- **C10 · P1**：为图像/模型 pipeline 写测试：单元、golden、property、性能与设备集成测试各测什么？

**本组优秀信号**：先澄清输入约束；写出可运行的正确 baseline；主动列边界条件和测试；最后再优化；复杂度、内存和数值稳定性都能解释。

---

## B. 行为与 Senior/Leadership（8 题）

- **B1 · P0**：介绍一个你最自豪的项目。你的决定如何改变了技术或产品结果？
- **B2 · P0**：讲一次你与产品、算法、平台或端侧团队意见冲突的经历。如何形成可验证的决策？
- **B3 · P0**：讲一次你犯的错误或漏掉的风险。你如何修复系统和流程，而不只修复单个 bug？
- **B4 · P0**：讲一次需求模糊、时间紧或资源不足的交付。你如何切 scope、管理风险和同步预期？
- **B5 · P0**：讲一次你推动跨团队标准、评估方法、工具或交付流程的经历。
- **B6 · P0**：如何向非技术 stakeholder 解释视觉质量、概率输出或模型不确定性？
- **B7 · P1**：讲一次你停止、推迟或否定某个看似有吸引力的技术方案。
- **B8 · P1**：为什么现在换工作，为什么这个岗位，以及未来两年想建立什么能力？

**本组优秀信号**：STAR 只是骨架；重点是判断力、影响范围、冲突处理、可量化结果和复盘。避免把所有成功都归于自己，也避免把失败推给环境。

---

## 60 分钟基线抽题

首次练习请闭卷完成：

1. R1（2 分钟）
2. R4（6 分钟）
3. M2（4 分钟）
4. V5（4 分钟）
5. E4（5 分钟）
6. G5（5 分钟）
7. C3（15 分钟，只写核心代码与测试）
8. S3（15 分钟，画架构并口述）
9. 最后 4 分钟记录暴露出的知识缺口与表达问题。

## 每题记录模板

```text
题号：
日期：
闭卷评分（0–4）：
90 秒答案：
关键图/公式/伪代码：
真实项目证据：
我遗漏的权衡或失败模式：
下次复习：D+1 / D+3 / D+7 / D+14
```
