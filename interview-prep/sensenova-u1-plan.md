# SenseNova-U1：原生统一多模态理解与生成学习路线

主入口：[中文 README](https://github.com/OpenSenseNova/SenseNova-U1/blob/main/README_CN.md)；一手技术材料：[技术报告](https://arxiv.org/abs/2605.12500)、[NEO-unify 文章](https://huggingface.co/blog/sensenova/neo-unify)、[评测目录](https://github.com/OpenSenseNova/SenseNova-U1/tree/main/evaluation)与[推理基础设施](https://github.com/OpenSenseNova/SenseNova-U1/blob/main/docs/inference_infra_CN.md)。本路线按 2026-07-24 审计的仓库快照 `d5c3148` 整理。

目标不是背“原生统一、无 VE/VAE、开源 SoTA”等宣传词，而是能从视觉接口、token/attention、双流参数、联合目标、训练阶段、评测协议和生产运行时解释：它统一了什么、仍然解耦什么、证据支持到哪里，以及怎样在自己的硬件与任务上验证。

## 它在现有准备体系中的位置

- **K5 / G8**：把“vision encoder + projector + LLM”的典型 VLM 追问扩展到 encoder-free、pixel-space、理解—生成统一架构。
- **K8 / G1、G2、G7、G10**：连接多轴 RoPE、混合注意力、评测、推理并行、路由和服务解耦。
- **Smol Course SC-6**：Smol 路线负责通用 VLM processor/template/LoRA 契约；本路线负责一种前沿架构的模型—系统案例，不重复做通用 SFT。
- **Vincent Sitzmann 路线**：两者都讨论视觉表征，但 SenseNova-U1 面向统一理解/生成，神经场路线面向场景几何与新视角；不能相互替代。

默认只新增两个交互证据：NEO-unify/MoT 架构解释，以及多任务评测—解耦推理系统设计。若 JD 不涉及多模态生成、VLM infra 或前沿模型架构，只保留为检索资料，不挤占六周主线。

## 版本、模型与来源边界

| 来源 | 能支持的结论 | 不能直接推出什么 |
| --- | --- | --- |
| README / 项目演示 | 功能范围、公开模型、命令、作者声明与已知限制 | 精选图片不能证明稳定性、分布外能力或产品胜率 |
| arXiv v1 技术报告 | 架构、目标、训练流程、论文实验与消融 | 未经独立复现，不能把作者实验推广到所有任务和硬件 |
| 仓库代码/config | 当前可执行接口、依赖、mask、推理和评测实现 | “代码存在”不等于所有 README 结果已端到端复现 |
| 模型卡与权重 | checkpoint 身份、用途、加载与许可证信息 | 相似名称的 Base/SFT/RL/Infographic/8-step 权重不可混用 |
| 自己的 frozen eval/profile | 对指定 revision、数据、参数和硬件的可复现证据 | 不代表更大总体或未测试的安全边界 |

当前主要家族至少包含 8B-MoT、A3B-MoT、SFT、T2I RL、8-step/LoRA、Interleaved 与 Infographic 专项版本。面试或实验必须写出完整 model id、revision、SFT/RL 身份、分辨率、steps、CFG、seed、dtype/量化和推理后端。

## SNU1-0 · 先做“主张—机制—证据”矩阵

选择四条主张，例如“无需 VE/VAE”“统一理解与生成”“8B 模型”“低显存可运行”。为每条填写：精确定义、代码/论文机制、支持实验、反例、未测条件和自己的最小验证。

特别修正三个容易误读的名字：

1. **Near-lossless 不等于数学无损**：视觉接口仍用两层卷积和总 stride 32 把图像变成 patch token；它强调绕过预训练 VE/VAE 与深解码器，并由任务/重建证据检验信息保留。
2. **Unified 不等于全部权重共享**：理解与生成 token 在同一序列与注意力框架交互，但论文明确描述两条流使用独立 projection、normalization 和 FFN，并按 token type 路由。
3. **8B-MoT 不等于总参数 8B**：仓库参数脚本示例给出约 17.552B 总权重，包括约 8.121B 理解、8.186B 生成和 1.245B shared；bf16 仅权重约 35.105 GB，尚未包含 activation、KV/cache、临时 buffer 与框架开销。

## SNU1-1 · Near-Lossless Visual Interface

输入图像或噪声经 stride 16、stride 2 的卷积与 GELU 形成 32×32 patch token，加二维 sinusoidal position，并由 `<img>` / `</img>` 标记视觉区间；文本继续使用底层语言模型 tokenizer。两者投影到共同 embedding space。

理解侧用线性 vocabulary head 预测文本；生成侧用轻量 MLP head 直接预测 pixel patch，通过 pixel-space flow matching 生成，省去预训练 VE/VAE 与深 diffusion decoder。要比较的不是“模块数量”，而是：信息瓶颈、训练稳定性、重建/语义、计算量、分辨率扩展和数据需求。

最小验证：对自然图、文字密集图、细纹理、人脸/手、分布外图分别记录重建或生成质量；报告 PSNR/SSIM 只能说明像素相似的一部分，还要检查 OCR、身份、结构、感知质量和下游理解。

## SNU1-2 · Native RoPE、MoT 与混合注意力

Native RoPE 将 head 维度分配给时间、高度和宽度三个轴：文本沿时间轴，图像还携带空间坐标。它没有额外参数，但会改变 Q/K 的位置编码和外推行为；需要说明各轴频率、分辨率变化与插值/外推风险。

MoT 的关键是按 token type 路由理解流和生成流参数：clean image/text 进入理解流，noise-conditioned visual token 进入生成流；两者在每层的统一序列和 attention 中发生交互，但 projection/norm/FFN 解耦。因此“共享表示”应由互相条件化与联合训练证明，不能由模型外观推断。

注意力不是普通 causal mask：文本只看前文；同一 image block 内图像 token 双向互看并读取先前上下文；noise token 可看 clean inputs 和自身 image block；clean token 不能读取未来/noise token。画出 block mask，并为 text→noise、noise→clean、clean→noise 各判断允许性与泄漏风险。

## SNU1-3 · 两类目标如何联合

理解侧仍最小化文本 autoregressive cross-entropy；生成侧在原始 pixel patch 空间执行 rectified-flow/flow-matching，以 MSE 拟合 velocity。联合目标可抽象为 `L = λtext LCE + λvision Lflow`，但两项尺度、采样频率和梯度冲突都需要实验校准。

生成还涉及 resolution-adaptive noise scale、timestep/noise conditioning 与 classifier-free guidance。训练时通过丢弃文本或文本+图像条件学习 conditional/image-only/unconditional 分支；推理时 text CFG 与 image-context CFG 分开。论文中的最佳值只属于其数据、checkpoint 和 protocol，不是通用默认值。

诊断联合训练不能只看总 loss：分别记录 CE、flow loss、理解 benchmark、T2I/编辑/交错 slices、梯度范数/相似度、输出长度、分辨率和资源。总 loss 降低可能掩盖某条流退化。

## SNU1-4 · 训练 curriculum 与模型身份

完整技术报告的阶段比 README 摘要更细：

1. Understanding warmup：从 NEO 初始化，先融合 attention 参数，再全模型续训。
2. Generation pre-training：冻结理解分支，逐步加入 T2I、高分辨率、编辑、推理与图文交错数据。
3. Unified mid-training：理解和生成分支联合训练，混合多类数据与两种目标。
4. Unified SFT：在高质量 instruction-following 理解/生成数据上对齐。
5. T2I post-training：Flow-GRPO 等 RL 改善生成目标；不能假设收益自动迁移到编辑或交错生成。
6. CFG / step distillation：形成更少步数的专项 checkpoint；质量、速度和任务范围需单独评测。

讨论任何结果前先问“哪个阶段的 checkpoint”。README 也明确承认当前 RL 未针对编辑、推理与图文交错专项优化，这些能力可能与 SFT 版本接近。

公开训练代码提供五类任务的分布式训练与 checkpoint 转换，但默认 8B 配置是 8×80 GB GPU，A3B 是 16×80 GB；约 680 MB 的公开样本只用于走通任务类型，不能训练可用模型，真实训练数据准备指南仍在 TODO。因而“训练代码已开源”与“论文训练可低成本完整复现”必须分开陈述。

## SNU1-5 · Dense、MoE 与参数/内存核算

8B-MoT 是理解和生成两套约 8B dense stream 加 shared 参数；A3B-MoT 则让理解侧使用 30B MoE、每 token 激活约 3B，同时生成侧仍约 8.2B。active parameters 决定部分计算量，但总权重、通信、expert balance 和 KV/activation 仍影响显存与吞吐。

资源卡必须区分：总参数、每次激活参数、权重 bytes、训练 optimizer/gradient、activation、KV/cache、图像 token 数、flow steps、CFG 倍数和 host↔device 传输。参数量较小或 Q4 不自动等于低延迟。

## SNU1-6 · 推理任务与输入输出契约

四种主要路径分别定义 contract：

- **视觉理解**：image preprocessing、min/max pixels、chat/thinking template、sampling 与 final-answer extraction。
- **T2I**：prompt、width/height、CFG、timestep shift、steps、seed、prompt enhancement 与输出色彩/元数据。
- **图像编辑**：输入 resize、编辑指令、text/image CFG、必须改变与必须保持的区域。
- **图文交错**：文本与图像的停止/切换 token、页/步顺序、角色/风格状态、OOM retry 和部分失败恢复。

每条请求保存 model revision、processor/config、输入 hash、generation config、seed、输出和 trace。prompt enhancement 是另一个模型/规则组件；开启后应同时保存增强前后 prompt，不能把增益全归因于主模型。

## SNU1-7 · 低显存不是免费午餐

仓库提供 full、low、balanced 分层加载和 GGUF 路径。`low` 同步逐层 CPU↔GPU，`balanced` 尝试用预取重叠传输和计算；Q4 GGUF + balanced 在约 16 GB 消费卡上的可行性是仓库建议，不是对所有驱动、分辨率和任务的保证。

验收同时记录 GPU 峰值、host RAM、pinned memory、PCIe/H2D 时间、首 token、每步和端到端延迟、吞吐、输出质量、fallback 与 OOM。量化只覆盖哪些权重、非语言组件是否仍以 bf16 加载，也必须从实际 checkpoint 和 profiler 确认。

三档执行：无合适 GPU 只做 config/mask/评测 dry run；有限资源做小输入和单样本 smoke；资源匹配后再复现固定 benchmark。未经明确授权不下载大型权重、不调用付费 judge、不启动云端任务。

## SNU1-8 · 统一模型，解耦生产运行时

生产方案把 LightLLM 用于理解、文本流和控制，把 LightX2V 用于图像生成，通过 pinned shared memory/传输 kernel 交接生成状态；两侧可独立选择 TP、CFG/SP、GPU 配额和扩缩策略。

Separate 部署隔离故障与扩缩，代价是额外机器/传输；Colocate 节省资源、适合验证或生成密集场景，但争抢 GPU、显存和带宽。设计题必须给 understanding:T2I/edit/interleave 流量比例、SLO、batch/queue、取消、超时、backpressure、状态一致性与降级，再决定部署模式。

这揭示一个重要面试结论：训练/表示上的统一与服务/调度上的解耦并不矛盾。系统边界应跟执行特征和 SLO 走，而不是机械复制模型论文图。

## SNU1-9 · 四层评测，而不是一个平均榜单

| 层 | 核心检查 | 典型误判 |
| --- | --- | --- |
| 理解 | exact/choice、reasoning、OCR、spatial、不可回答、长上下文与 slice | LLM judge 高分掩盖答案抽取、格式或泄漏 |
| 生成 | prompt adherence、结构、OCR/文字、感知质量、多 seed、分辨率与多样性 | 精选图或单 seed 代表稳定能力 |
| 编辑 | edit success、区域/身份/背景 preservation、局部文字与反事实 | 改对目标但破坏无关区域 |
| 交错 | 单步正确、跨页叙事/角色/风格一致、图文对齐、终止与部分失败 | 每张图好看但全局故事不连贯 |

再增加产品层：端到端 latency、峰值/平均成本、OOM/timeout、重试放大、缓存命中、人工返工率、安全与回退。已知限制应成为固定 slices：32K 上下文、人/手细节、密集文字、prompt 敏感和仍属 beta 的交错生成。

## SNU1-10 · Benchmark 复现与 Judge 审计

仓库评测覆盖理解、图像生成和交错生成，但执行完整度并不相同：理解路线用 EvalScope/OpenAI-compatible endpoint，开放题依赖 LLM judge；生成有 OCR/local metric 与 VLM judge 混合；交错路线中部分 scorer 依赖外部仓库，UEG judge wrapper 当前仍需用户补充。

复现记录必须包含 dataset version/license、prompt/preprocessing、分辨率、seed、steps/CFG、checkpoint、失败样本数、`ignore_errors`、cache key、judge model/version/prompt、人工校准和置信区间。缓存或 resume 只能在 config/model/input hash 一致时复用；silent skip 和失败忽略必须进入分母。

LLM/VLM judge 先在人类双标集上测 agreement、位置/长度/风格偏差，并保留分歧样本。不同论文使用不同 judge、分辨率、prompt enhancement 或采样设置时，榜单数字不可直接横比。

## SNU1-11 · 安全、许可证与发布边界

生成/编辑系统要覆盖肖像与身份、版权/商标、敏感内容、误导性信息图、OCR 事实错误、隐写/水印、训练数据记忆和 prompt injection。信息图“文字清晰”不等于内容真实；视觉事实与来源引用需独立 verifier 或人工审核。

仓库代码标为 Apache-2.0，但部署前仍逐项检查模型卡、训练/评测数据、第三方 benchmark、judge 服务、量化权重和生成内容政策；保留 NOTICE/修改声明。不要把仓库许可证自动扩展到所有权重、数据与输出用途。

## 面试追问链

1. 典型 VE+projector+LLM / VAE diffusion pipeline 与 NEO-unify 的边界分别在哪里？
2. 为什么 stride 32 的视觉接口仍可称 near-lossless？你会怎样证伪？
3. “统一”与理解/生成 projection、norm、FFN 解耦是否矛盾？
4. 画出 text、clean image、noise image 的 attention mask；如何防信息泄漏？
5. Native RoPE 如何编码 time/height/width？分辨率外推有什么风险？
6. CE 与 pixel-flow MSE 怎样联合？总 loss 为什么可能误导？
7. 为什么先冻结理解训练生成，再联合训练？还有哪些 curriculum 可选？
8. 8B-MoT 的 8B 到底指什么？active、total、weight memory 和 runtime memory 有何差别？
9. RL 改善 T2I 后，为什么编辑/交错能力可能不升甚至退化？
10. 怎样分别评估理解、生成、编辑和交错，而不被平均榜单掩盖？
11. 模型统一后，生产环境为何还要拆 LightLLM 与 LightX2V？
12. Q4 + CPU offload 降低 VRAM 后，新的瓶颈和质量风险是什么？

## 嵌入六周计划

- **第 2 周 CV**：只用 SNU1-0/1 比较视觉接口、信息瓶颈和细节/文字 slices，不启动大模型。
- **第 3 周 Training/Edge**：用 SNU1-4/5/7 做参数—显存—延迟估算和训练 curriculum 诊断。
- **第 5 周 Multimodal/LLM**：多模态生成、VLM infra 或前沿架构 JD 命中时，完成 SNU1-2/3 与 SNU1-8/9/10 两个 Session；它们替换一个通用 VLM 设计和一个重复系统白板，不叠加时长。
- **第 6 周公司定向**：做一次 45 分钟“统一理解—生成平台”设计 mock；若 JD 不命中，则只在 G8 追问中用 90 秒比较典型 VLM 与 NEO-unify。

## 延迟复测与完成定义

- D+1：闭卷画 `pixels/text → patch/token → MoT → CE or flow → text/pixels`，标出共享与解耦边界。
- D+3：画三类 token 的 attention mask，并解释一个错误 mask 如何造成泄漏或质量下降。
- D+7：随机加入“16 GB GPU”“编辑保持区域失败”“理解流量是生成 20 倍”“judge 偏爱长答案”之一，零提示修改方案。
- 交付一张主张—机制—证据矩阵、一张架构/目标图和一张四层 eval + runtime release card。
- 能明确说出哪些数字来自 README/论文，哪些来自仓库脚本，哪些由自己复现；没有自己的运行就不声称复现性能。
