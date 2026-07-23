# Vincent Sitzmann：神经场、场景表示与世界模型学习路线

资料入口：[Vincent Sitzmann 主页](https://www.vincentsitzmann.com/)、[MIT Scene Representation Group](https://www.scenerepresentations.org/) 与 [MIT 6.8300 Advances in Computer Vision（Spring 2026）](https://www.scenerepresentations.org/courses/2026/spring/advances-in-cv/)。代表性一手材料包括 [SRN](https://www.vincentsitzmann.com/srns/)、[SIREN](https://www.vincentsitzmann.com/siren/)、[Light Field Networks](https://www.vincentsitzmann.com/lfns/) 和 [Neural Fields Review](https://www.scenerepresentations.org/publications/neural-field-review/)。本路线按 2026-07-24 可访问内容整理。

这组材料最有价值的不是“再看一批论文”，而是建立一条贯通经典几何、连续场表示、可微渲染、视频生成和感知—行动的 CV 主线。对当前目标岗位，它主要深化 V5 深度、V6 光流、V13 视觉质量和 V14 多视图重建，不扩张 90 题主库。

## 它在现有准备体系中的位置

- **Senior CV / Computational Photography**：VSCV-0 至 VSCV-5 为核心，重点是坐标、相机、表示、渲染、指标和失败模式。
- **Multimodal / World Model / Agent**：完成核心后选修 VSCV-6/7，把视觉从“预测中间标签”延伸到序列建模与行动。
- **纯 Edge 岗**：只做表示取舍与部署追问，不要求复现大规模 NeRF 或视频扩散模型。
- **研究岗**：额外阅读论文方法与实验部分，执行“先跑通，再证明”的研究证据协议；项目页演示不能替代消融、数据切分和统计证据。

推荐依赖：`V2 投影/感受野 → V5 深度 → V6 光流 → V14 多视图 → VSCV-1 几何 → VSCV-2 神经场 → VSCV-3/4 可微渲染 → VSCV-5 新视角系统 → VSCV-6/7 世界模型`。

## 来源地图与学习边界

| 材料 | 提炼的知识 | 不应直接推出 |
| --- | --- | --- |
| MIT 6.8300 2026 syllabus | 投影几何、光流、匹配、多视图、神经场、可微渲染、Gaussian splatting、扩散和具身视觉的依赖顺序 | 看过课表或录像就等于掌握；课程尚会更新 |
| SRN（2019） | 连续 3D 场、从 posed 2D observation 学习几何与外观先验、神经渲染 | 所有连续表示都自动可解释、可扩展或优于显式表示 |
| SIREN（2020） | 坐标网络、周期激活、初始化、高频信号与导数监督 | sine activation 在所有任务、预算和数据分布上都最优 |
| Neural Fields Review（2021） | 用表示、架构、forward map、generalization 四轴比较 neural field 方法 | neural field 是单一模型家族或 NeRF 的同义词 |
| Light Field Networks（2021） | 从“空间点查询”改成“有向光线查询”，以较少网络调用换取不同的几何与一致性约束 | 项目页报告的速度倍数能无条件迁移到复杂真实场景或现代实现 |
| Diffusion Forcing（2024）及后续视频工作 | 逐 token 不同噪声水平、因果序列与全序列扩散结合、长序列 rollout 稳定性 | 视频生成已经解决物理理解、策略学习或闭环控制 |
| 2026 “Bitter Lesson for CV” 博文 | 以 perception–action loop 和 world model 重新审视中间表示 | “3D 会过时”是已证实事实；它是有明确范围与反例的研究判断 |

## VSCV-0 · 20 分钟闭卷诊断

先不读论文，用一页纸回答：

1. 像素、相机光线、世界坐标、深度和颜色之间怎样转换？哪些量需要标定？
2. mesh、voxel、point cloud、SDF、radiance field、Gaussian 和 light field 分别存什么、怎样渲染？
3. 为什么只靠 image reconstruction loss 可能得到看似清晰却几何错误的场景？
4. 新视角合成的 train/test split、指标和 hard cases 应怎样设计，才能防止相邻视角泄漏？
5. 一个视频模型生成“合理未来”与一个视觉系统理解物理、支持行动之间还差什么证据？

把“不确定”直接标出来。VSCV-1 至 VSCV-7 只修复这些缺口，不顺序通读所有论文。

## VSCV-1 · 相机、光流与多视图几何

掌握最小闭环：世界点经外参变到相机坐标，再经内参和透视除法落到像素；匹配点通过 epipolar constraint 限制搜索，triangulation 恢复结构，bundle adjustment 联合优化相机与三维点。

必须能解释四个边界：单目尺度歧义；纯旋转或小基线导致三角化退化；动态物体破坏静态场景假设；反光、透明、重复纹理和曝光变化破坏光度/对应假设。学习式方法可以学习先验，但不会使这些可观测性问题自动消失。

**练习**：画出 `pixel → ray → sample/query → render → loss → camera/scene update`，标出每个坐标系、shape、单位、可微路径和不可辨识自由度。然后将 V6 光流、V14 SfM/MVS 分别放回这张图。

## VSCV-2 · Neural Field 与坐标网络

Neural field 可写成连续函数 `fθ(x) → y`：输入可以是空间、时间、方向或条件变量，输出可以是颜色、密度、距离、特征或运动。学习时不能只问“用了什么 MLP”，而要按四轴拆解：

1. **表示**：坐标与输出分别是什么，连续性和局部性从哪里来？
2. **架构/编码**：普通 MLP、positional encoding、周期激活、grid-feature hybrid 各自改变什么频率与容量偏置？
3. **forward map**：直接查询、sphere tracing、volume rendering、rasterization 或光线查询怎样产生 observation？
4. **generalization**：每场景优化、latent code、encoder、hypernetwork、meta-learning 或大规模先验怎样跨实例迁移？

这四轴比“NeRF 类方法”更稳定，因为具体模型会变，而表示、观察算子和泛化机制的选择仍然存在。

### SIREN：高频、导数与初始化

普通 ReLU MLP 往往先拟合低频结构；对细纹理或需要一、二阶导数的任务，表示与优化偏置会成为瓶颈。SIREN 使用 sine activation，并配套初始化，使激活与梯度在深层网络中保持可用；它展示了图像、音频、视频、SDF 及 PDE 解的坐标表示。

面试中不要停在“sine 能表达高频”。还要回答：输入坐标如何归一化；频率参数怎样影响可优化性；为何随机初始化必须配套；训练像素值与训练梯度/Laplacian 有何不同；更强高频拟合何时会同时拟合噪声或产生插值伪影。

## VSCV-3 · 场景表示与可微渲染

SRN 把世界坐标映射为局部场特征，再通过可微 ray marching/rendering 用 posed 2D images 监督场景；关键思想是把 3D 结构放入 image formation，而不是只让 2D decoder 猜新视角。NeRF 式 radiance field 通常查询位置与观察方向，输出密度和颜色，再沿光线积分。

离散 volume rendering 可写为：`C(r) = Σᵢ Tᵢ αᵢ cᵢ`，其中 `αᵢ = 1 - exp(-σᵢ δᵢ)`，`Tᵢ` 是到第 i 个 sample 前仍未终止的累计透射率。必须能从这三个量解释：采样数为何影响速度与 aliasing；密度和颜色为何可能相互补偿；空域跳过、hierarchical sampling 和 occupancy structure 在优化什么。

### 表示选择不是排行榜

| 表示 | 强项 | 主要代价或失败 |
| --- | --- | --- |
| Mesh | 显式表面、成熟渲染与编辑工具链 | 拓扑、重建与非流形/细结构困难 |
| Voxel / feature grid | 局部访问、规则计算、易与卷积结合 | 稠密内存随分辨率快速增长 |
| Point cloud | 采集直接、稀疏、保留观测 | 缺少表面连接，渲染与遮挡处理需额外设计 |
| SDF / occupancy field | 连续表面、几何与法线可由导数获得 | tracing、符号/拓扑、细薄和非封闭结构有挑战 |
| Radiance field | 高质量 view synthesis、自然处理 view-dependent appearance | 多采样开销、几何/外观纠缠、编辑和动态场景困难 |
| Gaussian splatting | 显式 primitives、快速 rasterization | densification、显存、透明排序与几何质量需审计 |
| Light field network | 直接从有向光线到颜色，减少逐点 ray marching | 3D 约束更弱，多视图一致性和外推依赖先验/数据 |

选择时同时报告质量、训练/渲染延迟、显存、可编辑性、跨场景泛化、动态支持和设备约束，不用单个 PSNR 排名作结论。

## VSCV-4 · 坐标网络最小实现实验

用同一张 256×256 图像和同一参数预算训练三个 `coordinate → RGB` baseline：ReLU MLP、ReLU + Fourier/positional features、SIREN。固定采样、optimizer、训练 steps 与随机种子，记录 PSNR、训练时间、频谱误差和图像梯度误差。

至少做四个 slice：平滑区域、细纹理、锐利边界和加入噪声后的区域；再改变坐标归一化、频率上限和采样密度。若无法运行代码，先写伪代码、shape 和实验表，但不能把论文结果当成自己的结果。

**输出**：实现或伪代码、四组对照图、频率/导数误差解释、一个反例和 3 分钟口述。**过关**：能把效果差异路由到表示容量、频率偏置、初始化、优化或采样，而不是只说“激活函数更强”。

## VSCV-5 · 新视角合成系统设计

设计一个从手机多视角视频生成可交互新视角的系统：

1. **输入与标定**：帧选择、rolling shutter、内外参、曝光/白平衡、动态区域与隐私。
2. **表示与 renderer**：为场景规模、设备预算、编辑需求和动态程度选择 field、Gaussian、mesh 或 hybrid，并给 baseline。
3. **训练与验证**：held-out trajectory、跨时间/跨场景 split、pose noise test、几何 proxy、PSNR/SSIM/LPIPS 与人工评审。
4. **失败与降级**：反光、透明、低纹理、运动物体、稀疏视角、外推视角和不确定区域；定义拒绝或回退行为。
5. **部署**：训练时间、首帧时间、FPS、峰值显存/内存、模型大小、缓存、增量更新和版本回滚。

加入两个消融：固定 renderer 更换表示；固定表示改变 pose/采样质量。这样才能区分“表示更好”与“输入或渲染预算更优”。

## VSCV-6 · 从新视角到视频世界模型

Diffusion Forcing 把因果 next-token 结构与全序列 diffusion 结合，让不同 token 处在不同噪声水平，并支持可变长度生成与引导。对 CV 面试更重要的问题不是复述算法名，而是分析长 rollout 的 compounding error、历史条件、随机多未来和可控性。

按五层验证 world model：视觉质量；跨时间一致性；动作/条件服从；物体持久性与物理约束；用生成轨迹改善真实策略或规划的闭环证据。前四层通过仍不等于第五层成立。视频预训练能否稳定转成行动策略仍属于开放问题。

**选修输出**：比较 autoregressive、full-sequence diffusion 与 Diffusion Forcing 的训练条件、并行性、rollout、guidance 和失败；给出一个不能被 FVD 或漂亮视频发现的规划失败。

## VSCV-7 · 批判性命题：3D 会过时吗

Sitzmann 的 2026 博文主张未来视觉将并入 perception–action loop，并预测显式 3D 对训练具身智能的重要性会下降。这是值得面试讨论的研究判断，而不是课程定理。

用范围化结论代替站队：端到端模型可能减少人工规定中间表示，尤其当原始视频和行动数据足够、目标可直接验证时；但 3D 在 CAD/制造接口、安全可解释测量、数据稀缺、仿真、几何约束和现有工具链中仍可能是高价值接口或 inductive bias。区分“模型内部必须显式输出 3D”“训练中使用 3D 约束”和“产品最终需要 3D artifact”三个命题。

**辩论输出**：支持与反对各列三条机制、证据和反例；设计一个比较显式 3D pipeline 与 end-to-end policy 的受控实验，包含分布外环境、数据效率、安全故障和恢复成本。

## 面试追问链

1. Neural field 与 NeRF 有什么关系？为什么不能互换使用？
2. 坐标 MLP 为何出现 spectral bias？positional encoding 与 SIREN 分别怎样改变它？
3. 体渲染中的 `Tᵢ`、`αᵢ` 和 `cᵢ` 各表示什么？梯度可能在哪里消失或混淆？
4. 只有 RGB reconstruction loss 时，为什么 geometry 可能错误但 novel view 看起来不错？
5. NeRF、Gaussian splatting、mesh 和 light field 在移动端产品中的选择维度是什么？
6. 怎样设计不会被相邻帧泄漏的 novel-view test split？
7. 相机 pose 有噪声时，怎样判断问题来自 pose、representation、renderer 还是 optimizer？
8. 一个视频生成模型能长时间生成连贯视频，为什么仍不能证明它可用于机器人规划？
9. “无 3D inductive bias”是优点还是缺点？答案怎样随数据、任务和安全要求改变？
10. 如果只给一周，哪两个最小实验最能证明你真正理解神经场而非看过论文？

## 嵌入六周计划

- **第 2 周 CV**：VSCV-0/1 作为 V5、V6、V14 的追问；完成 VSCV-4 坐标网络实验和 VSCV-5 新视角设计。它们替换当周同等时长的泛读，不额外加时。
- **第 3 周 Edge**：只补表示的延迟、显存、量化、算子和设备测量，不训练大型场景模型。
- **第 4 周系统设计**：将 VSCV-5 改写成 45 分钟系统设计 mock，加入数据、评估、发布和回滚。
- **第 5 周 Multimodal / Agent**：目标 JD 命中 world model、robotics 或 video generation 时才做 VSCV-6/7；否则留在覆盖池。
- **第 6 周**：随机抽一条面试追问链和一个新约束做零提示迁移，不再扩张论文列表。

## 延迟复测与完成定义

- D+1：闭卷画 `camera → ray → field → renderer → image loss`，并解释一个不可辨识问题。
- D+3：从表示表随机抽两种，按质量、速度、内存、编辑、泛化与失败完成比较。
- D+7：零提示完成一次 VSCV-5 设计，并应对 pose 不准、动态主体和移动端预算三个新约束。
- 至少完成一次坐标网络对照和一次系统设计；只有论文阅读、视频观看或复述项目页不计完成。
- 能明确区分一手论文结果、项目页演示、作者预测和自己的实验结论。
- 对“3D 会过时”给出带范围、时间尺度、反例和验证方法的结论，而不是口号。
