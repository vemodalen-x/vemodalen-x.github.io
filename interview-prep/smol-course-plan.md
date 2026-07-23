# Hugging Face Smol Course：小模型后训练与多模态实践路线

课程入口：[Hugging Face Smol Course](https://huggingface.co/smol-course)；当前仓库：[huggingface/smol-course](https://github.com/huggingface/smol-course)。本路线按 2026-07-24 审计的 v2 仓库快照 `32dde01` 整理，并用当前 [TRL SFTTrainer](https://huggingface.co/docs/trl/sft_trainer)、[DPOTrainer](https://huggingface.co/docs/trl/dpo_trainer)、[Transformers Chat Templates](https://huggingface.co/docs/transformers/chat_templating) 与 [PEFT LoRA](https://huggingface.co/docs/peft/package_reference/lora) 文档校验。

目标不是取得证书或把 notebook 全部跑绿，而是能回答并验证：任务为什么需要后训练；数据和 chat template 怎样定义行为；SFT、LoRA、DPO 分别改变什么；评测怎样防止“训练 loss 下降”冒充产品改进；VLM 怎样保持图像、文本和处理器契约一致。

## 它在现有准备体系中的位置

- **K8 / G1–G14**：补足 instruction tuning、preference alignment、LLM/VLM evaluation 和模型发布，不替代 Transformer、RAG 或 Agent Harness 主线。
- **K3/K4**：复用 Tuning Playbook 的 baseline、数据切分、方差、checkpoint 和实验追踪，不重新发明训练实验协议。
- **K5 Multimodal**：VLM 单元连接图像预处理、视觉 hard cases、幻觉和多模态评测，但不替代经典 CV/几何知识。
- **Edge / 小模型岗位**：重点比较 adapter、量化、显存、吞吐、延迟、隐私和任务收益；“模型小”不自动表示能在目标设备训练或部署。

默认只新增三个交互证据：SFT 数据—模板—评测闭环、DPO 偏好对照、VLM 小样本适配。其余课程阅读服务于这三个产物，不另开一套无上限学习计划。

## 当前版本与来源边界

| 当前可见材料 | 审计结论 | 执行规则 |
| --- | --- | --- |
| Hugging Face 组织页 | 仍展示 Evaluation、DPO、RL、VLM、Synthetic Data 的长期 syllabus 和旧发布月份 | 只作课程定位，不据此声称所有单元已发布 |
| v2 GitHub `units/en` | Unit 1 为 Instruction Tuning/SFT，Unit 2 为 DPO，Unit 3 为 VLM，Unit 4 仍是 Coming Soon | 核心只覆盖已经存在的 1–3；RL 与 synthetic data 留空 |
| 仓库 `pyproject.toml` / lock | 要求 Python ≥3.11；lock 包含 `transformers==4.46.3`、`trl==0.12.1` 等旧快照 | 复现课程时锁住整个环境；使用当前 API 时新建环境并按当前文档改代码，不能混装 |
| SmolLM3-3B / SmolVLM2-2.2B | 课程主模型体积比大型模型小，但完整训练仍取决于精度、序列/图像长度、optimizer state、LoRA 和 GPU | 先做资源估算与 smoke test；没有测量就不承诺“本地可跑” |
| Hugging Face Jobs / Hub / leaderboard | 是可选云端执行和共享流程，涉及账号、token、费用与公开 artifact | 默认本地或 dry run；未经明确授权不提交 job、不上传模型/数据、不公开结果 |

课程是持续变化的实践材料。面试答案中的 API、默认值和版本行为回查当前官方文档；算法机制回查原论文；自己的效果结论只来自保存了版本、数据和评测的实验。

## 学习依赖与完成脉络

`Transformer next-token objective → chat template/token contract → dataset/split → pretrained baseline → SFT + LoRA → domain + regression eval → DPO preference data → VLM processor/image contract → package/release`。

每一步必须有前后对照。若没有 frozen baseline、held-out set 和可复现 generation config，后面的 SFT/DPO/VLM checkpoint 只算训练产物，不算能力证据。

## SC-0 · 任务、基线与资源预算

选择一个可在面试中解释的窄任务，例如结构化相机故障分类、CV 实验摘要、工具调用参数生成或图像 hard-case 描述。先写：

1. 输入、输出 schema、拒答边界和五类高风险失败。
2. 训练前 frozen prompts：常规、边界、分布外、不可回答和对抗各至少 10 条。
3. 自动指标、schema/规则 verifier、人工 pairwise rubric、延迟/显存/成本门槛。
4. 数据来源、许可、PII/机密、污染、近重复和 train/eval split owner。
5. 模型、精度、sequence/image length、batch、optimizer/adapter 的粗略内存预算与 smoke-test 上限。

先跑 base/instruct baseline 并保存原始输出。不要根据训练后结果再改测试集；新增 hard case 单独版本化。

## SC-1 · Chat Template 是训练—推理协议

Chat model 仍然是在 token sequence 上做 next-token prediction；`role/content` 需要 template 转成控制 token、turn boundary 和 EOS。不同 instruct model 即使来自同一 base，也可能使用不同控制 token。错误 template、重复 special token、错误 `add_generation_prompt` 或 EOS 不一致都可能显著损害行为。

固定四个 parity test：训练样本用 `add_generation_prompt=False`；推理 prompt 用 `True`；多轮和 tool-call 样本检查 role 顺序；tokenize 前后检查 BOS/EOS/control token 是否重复。保存 template 文本、tokenizer revision 和一个 golden token-ID 序列。

对 SFT 数据另外明确 loss mask：是否训练全部 token、completion only 或 assistant only；system/user token 被错误计入 loss 会改变训练目标。当前 TRL 的 `assistant_only_loss=True` 还依赖 template 能生成 assistant mask，不能只开一个 flag 就假定生效。

## SC-2 · SFT：从示例似然到目标行为

SFT 对目标 token 最小化 token-level negative log-likelihood。它适合学习任务格式、术语、流程和有标准输出的行为，不保证事实更新、安全边界或分布外泛化。

数据审计至少包含：schema 验证；role/turn 合法性；空输出与截断；token 长度分布；来源和许可；近重复；答案正确性；语言/任务/hard-case slice；同一模板或原题跨 split 泄漏。质量差的 10,000 条数据通常不如能解释来源和错误的 500 条数据。

训练协议：先用 16–64 条样本 overfit，证明 template、labels、loss mask 和 update path 正确；再跑短 smoke study；最后才扩数据/steps。比较 instruct baseline、SFT checkpoint 和一个“只改 prompt/RAG”的非训练 baseline，证明后训练确实必要。

### Loss、mask 与训练曲线诊断

检查 `input_ids`、shifted labels、padding `-100`、assistant/completion mask、packing boundary 和 EOS。随机抽一条训练样本，把参与 loss 的 token 高亮出来；若无法解释每个有效 token，先不启动长训练。

Loss 下降只说明目标数据 token 更可预测。同步记录 held-out NLL、任务成功、格式正确、拒答、事实性、通用能力回归、输出长度、重复、延迟和显存。出现 train loss 下降而 domain success 不升时，优先检查指标/数据、mask、template、容量和任务可学性，而不是盲加 epoch。

## SC-3 · LoRA / PEFT 与硬件分层

LoRA 冻结 base weight，并对指定层学习低秩更新；rank `r` 控制适配容量，`alpha` 控制缩放，`target_modules` 决定哪些投影可变。参数更少不等于 activation、KV、input image 或 optimizer 的全部内存消失；QLoRA 还引入量化误差与算子支持边界。

三档执行：

- **无合适 GPU**：完成 template/token/mask 单测、数据审计、公式和训练配置；只把 dry run 标为 dry run。
- **有限 GPU**：用 0.5B–0.6B 级模型或极小数据做 LoRA smoke test，记录峰值显存、tokens/s 和梯度是否正常；不冒充 3B 结果。
- **资源足够且 JD 命中**：再用 SmolLM3-3B 或 SmolVLM2-2.2B 完成正式对照，固定版本、seed、预算和 evaluation set。

保存 adapter 时记录 base model id/revision、processor/tokenizer revision、target modules、rank/alpha、merge 状态与加载测试。merge 后做 logit/output parity；量化或 runtime 转换后再做设备 parity。

## SC-4 · 评测必须先于训练

当前 v2 仓库没有独立、完整的 Evaluation 单元；Unit 1 的 leaderboard/lighteval 和各单元的简短 eval 建议不足以替代目标任务评测。因此本路线把评测提升为 SFT/DPO 前置条件。

测试集分为：frozen domain set；通用能力 regression；不可回答/安全；格式与工具 schema；成本/延迟；人工校准集。生成参数必须固定，随机任务用多 seed 或多 sample；LLM judge 先在人类标注集上测一致性、偏差和分歧 slice。

### 三层评测矩阵

| 层 | 例子 | 防止的误判 |
| --- | --- | --- |
| 数据/目标 | schema、mask、近重复、source split、pair agreement | 训练的是错误目标或测试泄漏 |
| 模型行为 | exact/task success、format、faithfulness、refusal、pairwise、slice | loss/leaderboard 提升掩盖真实失败 |
| 产品系统 | latency、显存、吞吐、成本、安全、fallback、A/B | checkpoint 更好却无法发布 |

采纳门槛必须同时约束目标提升、关键 slice 不退化、通用能力回归、资源预算和安全。只上传 leaderboard 分数不能证明适合自己的任务。

## SC-5 · DPO：优化相对偏好，不是注入真理

DPO 数据包含同一 prompt 下的 `chosen` 与 `rejected`。偏好必须有明确 rubric、独立性、annotator agreement、tie/ambiguous 处理和来源；若 rejected 只是明显低质模板，模型可能学会长度、措辞或格式捷径，而非目标价值。

先验证数据：chosen/rejected 是否共享完全相同 prompt/template；长度和风格是否成为 label proxy；pair 是否来自当前 policy 附近；偏好是否与事实正确、安全和任务成功冲突。保留 SFT checkpoint 与 reference policy，并比较 `SFT only → DPO` 的目标、regression 和 KL/行为变化。

### DPO loss、reference 与 β

令 `Δθ = log πθ(y+|x) - log πθ(y-|x)`，`Δref` 对 reference model 同理，则基本目标可写为 `-log σ(β(Δθ - Δref))`。它鼓励 policy 相对 reference 扩大 chosen/rejected 的 log-probability margin；不保证 chosen 的绝对概率一定上升，实践中也可能主要压低 rejected。

当前 TRL 文档将 `β` 定义为控制偏离 reference 的参数，**更高 β 表示更少偏离**。课程正文中“更高 β = 更强偏好、风险更大”的表格与当前定义相反，不能背诵。实验时固定其他条件做 β sweep，并检查 reward margin、chosen/rejected log-prob、输出长度、目标胜率和通用回归。

## SC-6 · VLM：Processor、视觉 token 与切片评测

VLM 的 chat template 通常属于 processor，message content 是 image/video/text item 列表；processor 再把占位符扩为视觉 token。必须同时锁定 model、processor、template、image resize/crop/normalization、帧采样和 max-length 策略。

VLM SFT 不只是把文本 SFT 加一个 `images` 列。审计：坏图/空图、EXIF 方向、分辨率和长宽比、重复图片、OCR 泄漏、image-text 对齐、视觉 token 被 truncation、collator、冻结/训练 vision encoder/projector/LM 的边界、LoRA target modules。当前 TRL 建议 VLM 默认 `max_length=None`，除非已经证明截断不会删掉 image token。

评测至少按文字密集图、细小目标、空间关系、计数、遮挡、低照/模糊、多人多物、无关图、纯文本和不可回答分 slice；同时测试图像置换、遮挡和文本-only 对照，防止模型只靠语言先验答对。

## SC-7 · 可复现发布与安全边界

最小 artifact：数据卡与 split hash；环境 lock；训练 config；base/model/adapter/tokenizer/processor revision；seed；checkpoint 选择规则；完整评测输出；已知失败；license；安全/隐私审计；推理示例与 rollback。Hub model card 或课程证书只证明提交行为，不自动证明以上内容完整。

发布前做：clean-environment load；adapter/merged parity；template/tokenizer parity；量化/runtime parity；错误 model/adapter 组合应显式失败；PII/训练数据记忆检查；prompt injection、越权 tool format 和不可回答测试。外部上传前确认数据、模型许可与组织政策。

## 面试追问链

1. Base model、instruct model、chat template 和 SFT 数据分别改变什么？
2. 为什么训练与推理 template 不一致可能比学习率错误更隐蔽？
3. `completion_only_loss`、`assistant_only_loss` 和 full-sequence loss 的目标差异是什么？
4. LoRA 省了哪些内存，没省哪些？`r`、`alpha` 与 `target_modules` 怎样选择？
5. Train loss 降低但任务成功率不变，你按什么顺序诊断？
6. 什么情况下 prompt/RAG 比 SFT 更合适？什么情况下 SFT 比 DPO 更合适？
7. 推导 DPO margin，并解释 reference model 与 β 的作用。
8. Preference pair 怎样泄漏长度、风格或 annotator bias？
9. VLM processor 和 tokenizer 有什么不同？图像 token 被截断会发生什么？
10. 如何证明 VLM 真正在使用图像，而不是依赖问题先验？
11. 一个 leaderboard 分数提高，为何仍不足以发布？
12. 怎样把 adapter、template、数据和评测一起版本化并安全回滚？

## 嵌入六周计划

- **第 3 周 Training/Edge**：只理解 LoRA/量化/显存与训练诊断；若目标岗不做 LLM post-training，不启动模型训练。
- **第 4 周 Data/System**：完成 SC-0/4，产出 frozen eval、数据卡、split 和 release gate；这是三个后训练任务的共同前置。
- **第 5 周 LLM/Agent**：核心做 SC-1/2/4 的 SFT—评测闭环；再根据 JD 从 SC-5 DPO 与 SC-6 VLM 中选择一个。它们替换一次重复 Transformer 阅读、一次泛化 Agent 阅读和一次 Codemia 白板，不突破周预算。
- **第 6 周公司定向**：根据 JD 选择 SFT、DPO 或 VLM 中一个做 45 分钟系统设计 mock；不为证书补做无关单元。
- RL 与 synthetic data 单元在当前 v2 尚未发布，不预先占用路线；将来出现时先重新审计版本、内容和与现有任务的重合。

## 延迟复测与完成定义

- D+1：从一条 conversation 手工展开 template/token/loss mask，并指出训练和生成的差异。
- D+3：闭卷画 `data → template/processor → model+adapter → trainer → eval → package`，给出每个边界的版本与失败信号。
- D+7：随机加入“显存减半”“preference label 10% 错误”“图像 token 被截断”之一，零提示修改训练与验收方案。
- 六周默认过关要求一次 SFT smoke/设计，以及 DPO margin/数据实验或 VLM processor/评测实验二选一；只有要声称完成整条课程路线时才要求三者齐全。没有 GPU 时可交付 dry run，但必须明确未产生训练效果证据。
- 能发现课程内容与当前官方 API 的版本差异，尤其是 DPO β、VLM config 和 trainer 参数，不复制过期 snippet。
- 最终证据包含 frozen baseline、数据与 split、环境、曲线、目标与 regression 评测、失败样本、资源测量和发布/回滚，而不只是 loss、模型链接或证书。
