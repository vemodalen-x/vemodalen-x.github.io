# 本地个人知识库

## 架构

```text
原始资料 / 旧知识库
        ↓
notes/ 来源档案与专题综合
        ↓
notes/00-personal-knowledge-master-map.md 跨来源总地图
        ↓
knowledge/core-method-kb.js 核心主线
        ↓
knowledge/ 专题方法卡与可重建索引
        ↓
personal-knowledge-hub.html 检索、学习与复习
local-knowledge-assistant.html 方法应用
        ↓
行动、复盘、再次修正方法卡
```

这套结构采用“来源档案层 + 专题综合层 + 核心主线层 + 行动复盘层”。旧知识库可以保留大量来源；18 张核心卡归并跨作者重复原则，专题卡保留领域差异。这样既能追溯，也不会把全部资料塞进每次助手上下文。

## 当前知识库

- `core-method-kb.js`：全库归并后的 18 张核心主线卡，从方向、问题和证据一直走到交付、复盘与治理。
- `personal-knowledge-hub.html → 知识脉络`：六阶段交互地图、节点详情、复习进度、来源合流矩阵和专题下钻入口。
- `personal-knowledge-hub.html → 全库检索 → 预览笔记`：安全渲染 Markdown 标题、表格、代码、链接和 `assets/` 下的本地学习图片。
- `yitang-business-kb.js`：商业判断、关键假设、低成本验证和科学决策。
- `mao-method-kb.js`：调查研究、实践循环、矛盾分析、学习、表达、试点、协作与执行。
- `levels-indie-kb.js`：独立产品的问题发现、快速发布、付费验证、客服、分发、现金流与项目组合。
- `waytoagi-method-kb.js`：从 WaytoAGI 目录提炼的 AI 学习、提示词、智能体、创作、研究、产品与治理方法卡。
- `latent-space-reading-kb.js`：从 Latent.Space AI 工程阅读地图提炼的评测、RAG、智能体、代码、多模态与微调方法卡。
- `ai-engineering-method-kb.js`：从高质量工程仓库和可复现实验中提炼的 AI 工程实践卡；与论文阅读卡分开维护。
- `latent-space-paper-catalog.json`：50 项核心论文、模型与工程文章的结构化目录，含优先级、研究问题、个人判断、一手链接和最低产出。
- `mitbunny-x-ai-influencers-2026-02-11.json`：MIT Bunny 页面公开的 300 个 AI X 账号与 3,042 条关系边快照；只用于发现和网络分析，不证明账号内容或履历。
- `dwarkesh-archive-index.json`：174 条公开归档元数据，现已逐条进入检索；综合稿覆盖代表内容，其余仍需按问题精读。
- `xiaohongshu-zeng-tianzhen-catalog.json`：“曾天真学习笔记”的公开主页和可见笔记元数据；平台限制下不推测未读取正文。
- `photography-mentor-taxonomy.js`：把 62 张摄影网络卡归入七阶段、22 个合并簇，并关联 12 张本机资料摘要卡。
- `photography-mentor-kb.js`、`local-photography-books-kb.js`：摄影原子卡与本机资料索引，继续承担来源追溯和深读入口。
- `waytoagi-catalog.json`：WaytoAGI 公开 Wiki 的可重建目录元数据和原链接，不是第三方原文镜像。
- `personal-kb-index.js`：当前笔记、WaytoAGI 公开目录与旧库目录生成的浏览器索引，不是原始数据副本。
- `../notes/00-personal-knowledge-master-map.md`：全库审计、同类合并关系、18 步核心脉络和全部笔记的角色划分。
- `../notes/00-learning-clusters-and-coverage-review-2026-07-15.md`：把全部来源按八类个人问题组织，并用发现、语义、实践和时效四维列出补齐队列。
- `../notes/00-source-completeness-audit-2026-07-15.md`：逐项说明哪些来源已语义精读、只有结构或目录、受平台限制，或尚未入库。
- `../notes/tianyu2fm-source-audit-2026-07-15.md`：TIANYU2FM 当前公开规模、旧任务误判和全量导入验收标准。
- `../notes/mao-selected-works-methodology.md`：《毛选》方法论 MOC 和应用模板。
- `../notes/levels-io-indie-product-methodology-2026-07-12.md`：Levels.io 独立产品方法论来源笔记与四周实验模板。
- `../notes/pkm-five-round-iteration-2026-07-11.md`：五轮迭代记录。
- `../notes/pkm-open-source-reference-architecture-2026-07-11.md`：高 Star 开源项目对照和本地架构决策。
- `../notes/waytoagi/01-waytoagi-master-synthesis.md`：WaytoAGI 七层能力结构、长期方法、时效边界与使用路线。
- `../notes/waytoagi/08-waytoagi-eight-week-learning-path.md`：每周一个可验证作品的八周学习路径。
- `../notes/latent-space-2025-ai-engineering-reading-list.md`：AI 工程研究地图、三条应用路径、12 周实验计划与使用边界。
- `../notes/latent-space/00-2025-ai-engineer-core-reading-catalog.md`：十个方向、每个方向五项的中文阅读目录与精读模板。
- `../notes/latent-space/01-qlora-efficient-finetuning-study.md`：QLoRA 技术机制、数据与评测边界，以及面向本机 RTX 4090 24GB 的最小实验方案。
- `../notes/ai-engineering/01-llms-from-scratch-learning-path.md`：从文本、注意力和 GPT 结构到预训练、分类与指令微调的分章学习路线。
- `../notes/ai-engineering/02-andrej-karpathy-video-learning-map.md`：Andrej Karpathy 频道 17 个公开视频索引、12 个长课程的依赖顺序、实践产物和七周路线。
- `../notes/ai-engineering/03-video-learning-workflow.md`：字幕优先、无字幕 ASR、关键帧核验、来源账本和入库验收的可复用视频学习流程。
- `../notes/ai-engineering/04-kaiming-he-generative-modeling-talk.md`：以 `p(x|y)` 统一 VAE、GAN、自回归、Diffusion、Flow Matching 和现实任务建模。
- `../notes/ai-engineering/05-stanford-cs25-scaling-and-architecture.md`：下一词预测、任务级缩放曲线、Bitter Lesson 与 Transformer 归纳偏置审计。
- `../notes/ai-engineering/06-openclaw-apps-to-agents-interview.md`：个人 Agent 的统一入口、可迁移记忆、CLI/MCP、产品机会和安全边界。
- `../notes/ai-engineering/07-transformer-taxonomy-2023-study.md`：完整核对 22 个模型、11 类架构、7 类后处理、3 类训练技术和 5 个其他主题，并补充六层模型审计模板。
- `../notes/ai-engineering/08-mitbunny-x-ai-signal-map.md`：完整核对 300 节点与 3,042 条边，把账号榜单转成五类主题信息源、核验门槛和每周学习协议。
- `../notes/yitang-truman-replay-learning-2026-07-15.md`：Truman For复盘营 Partner 的 12 轮实测、状态机、结果回传和产品安全护栏。
- `../notes/xiaohongshu/zeng-tianzhen-ai-career-source.md`：AI 内容算法、AIGC、算法职业和团队管理来源档案，以及后续正文导入标准。
- `../notes/photography-knowledge-review-2026-07-14.md`：摄影专题的同类合并审计与七阶段学习主线。

## 完整性状态

前端“能搜到”只表示某条记录进入索引，不自动表示已经学习。来源按以下状态维护：

- `A 语义精读`：正文或字幕分段读完，有证据、边界、应用和复习。
- `B 结构化学习`：已建立可靠框架，但未运行全部实验或遍历全部条目。
- `C 目录索引`：只有标题、路径、时间和链接，用于发现与追溯。
- `D 受阻来源`：只取得公开简介或少量元数据，不根据标题推断正文。
- `E 未入库`：用户指定过但尚无可靠目录或正文，必须优先补账本。

当前不能声称已经全量学完的主要来源包括 TIANYU2FM、WaytoAGI 全部正文、全机高价值文本、Karpathy 全视频、Latent.Space 其余 49 项、小红书正文、Dwarkesh 其余归档正文和 MIT Bunny 账号历史内容。三段指定视频、QLoRA、《Transformer速查宝典》文章层与 MIT Bunny 页面方法已达到语义级整理；其下游论文、账号或归档条目仍可能只是目录层。毛选、Levels.io、LLMs-from-scratch、Jeannen、Truman 和摄影专题属于结构化学习。详细证据、八类学习集群和补齐顺序见全库来源完整性审计与学习聚类 Review。

## 归并规则

1. 日常判断先调用“核心主线”，领域特殊问题再打开专题卡，引用和核验时回到来源档案。
2. 新资料若只是已有原则的新案例，不新增核心卡，只补充来源、边界或反例。
3. 只有新的决策规则、失败模式、评价指标或执行协议，才新增专题方法卡。
4. WaytoAGI、论文、小红书和旧库的目录项不等于已理解正文；完成阅读和个人验证后才提升到精选层。
5. 每周用行动结果更新卡片，失效结论标注时效或降级，不为保持整洁而删除有效反证。

## Windows 运行

本机已确认：Windows 11、Python 3.10.12、PowerShell 5.1、Git 2.43。

在 PowerShell 中运行：

```powershell
Set-Location 'C:\Users\User\Documents\个人ip和主页'
powershell -ExecutionPolicy Bypass -File .\scripts\start-knowledge-assistant.ps1
```

浏览器会打开：

```text
http://127.0.0.1:8765/personal-knowledge-hub.html
```

启动脚本会先运行 `scripts/build-personal-kb-index.py`，把当前 `notes/` 和旧知识库目录合并成索引，再启动 `scripts/personal_kb_server.py`。服务只绑定 `127.0.0.1`。按 `Ctrl+C` 停止服务，不应用于公网部署。

复习记录、快速草稿、行动闭环和检索反馈保存在：

```text
%LOCALAPPDATA%\PersonalKnowledgeHub\state.sqlite3
```

浏览器仍保留 localStorage 副本；本地服务不可用时会自动降级，不阻塞检索。

只重建索引：

```powershell
python .\scripts\build-personal-kb-index.py
```

## WaytoAGI 增量导入

WaytoAGI 飞书 Wiki 的子目录通过接口逐层加载，并对匿名访问设置频率限制。导入器包含限速、`429` 重试、去重和断点续跑：

2026-07-14 快照：13,842 个唯一公开节点、1,878 个父目录、最深 8 层，失败节点 0。后续重跑会按公开目录的当前状态更新统计。

```powershell
python .\scripts\import-waytoagi-wiki.py
python .\scripts\build-personal-kb-index.py
```

断点保存在 `outputs/waytoagi-import.checkpoint.json`。命令中断后直接重跑即可继续；完整后会生成：

- `knowledge/waytoagi-catalog.json`：每个公开节点的标题、路径、类型、更新时间、分类和原链接。
- `notes/waytoagi/00-waytoagi-source-index.md`：按主题分组的可读全量目录。
- `notes/waytoagi/01-09*.md`：详细主题提炼、八周学习路径和应用模板。

导入策略只保存公开目录元数据。涉及模型能力、工具价格、接口、法规和新闻的条目必须打开原链接核验；第三方全文、图片和附件不会被批量复制进本地库。

## MIT Bunny 与 Dwarkesh 目录更新

MIT Bunny 导入器从公开前端数据更新账号与关系快照，不保存长简介和头像。Dwarkesh 同步器只保存公开归档元数据。更新后重建统一索引：

```powershell
node .\scripts\import-mitbunny-x-map.mjs
node .\scripts\sync-dwarkesh-archive.mjs
python .\scripts\build-personal-kb-index.py
```

两类目录都只用于发现。人物履历、帖子主张、访谈结论和当前职位必须回到一手来源核验后，才能提升为精选笔记。

## 全库搜索

搜索当前笔记、WaytoAGI、Latent.Space、MIT Bunny、Dwarkesh、小红书公开目录和旧知识库：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\search-personal-knowledge.ps1 -Query '主要矛盾'
```

## 录入标准

来源笔记至少包含：

- `title`
- `date`
- `type`
- `status`
- `source` 或来源 URL
- `tags`
- 自己的结论、适用场景、反例、下一步行动

方法卡只有在以下条件满足时才新增：

1. 结论已经用自己的语言表达。
2. 有明确来源。
3. 能回答一个反复出现的问题。
4. 有适用边界或反例。
5. 能生成下一步行动或复盘问题。

## 日常使用

1. 从“知识脉络”定位当前处于方向、证据、实验、执行、商业资产还是复盘治理阶段。
2. 在“总览”写清今天要解决的问题。
3. 在“全库检索”默认先看精选层，最多打开三条相关资料。
4. 到“方法助手”把证据转成最小行动和复盘条件。
5. 在“间隔复习”优先选择“核心主线”，再复习当前项目相关专题；先主动回答，再根据真实回忆难度评分。
6. 用“快速记录”生成 Markdown，整理后放入 `notes/` 并重建索引。

## 行动闭环

“行动闭环”用于证明知识是否真正产生结果：

1. 从检索结果点击“加入行动证据”。
2. 写清问题、当前判断、下一步行动和成功或停止标准。
3. 设置复盘日期，系统标记到期记录。
4. 到期后写下真实结果和反证，才能标记完成。
5. 搜索后用“找到了 / 没有”反馈检索效果，系统计算检索有效率。

## 备份与维护

“系统说明 → 数据与索引”提供：

- 重建索引：重新扫描当前笔记和旧知识库目录。
- 导出备份：导出 SQLite 中的复习、草稿、闭环和最近 5000 条效果事件。
- 恢复备份：恢复状态和效果事件；恢复前应保留一份现有备份。

## 价值评分

旧库条目按正文提取、摘要、关键词、分类、文件类型、来源可追溯性和噪声特征计算分值：

- `精选`：85-100，默认优先展示。
- `可用`：60-84，作为补充资料。
- `待整理`：0-59，可能只有元数据或属于过程文件。

评分用于排序，不替代人工判断。算法位于 `scripts/build-personal-kb-index.py`，可以持续调整后重建。

## 参考实践

- SiYuan：本地优先、块引用、属性查询与闪卡：<https://github.com/siyuan-note/siyuan>
- Logseq：Markdown、知识图谱、属性、日记与复习：<https://github.com/logseq/logseq>
- TriliumNext：层级、全文检索、属性与版本记录：<https://github.com/TriliumNext/Trilium>
- Foam：VS Code + Markdown、Wiki 链接与反向链接：<https://github.com/foambubble/foam>
- Quartz：把 Markdown 转成带搜索和链接的静态知识站：<https://github.com/jackyzha0/quartz>
- PARA 按行动性组织 Projects、Areas、Resources、Archives：<https://fortelabs.com/blog/para/>
- 渐进式摘要逐层提高笔记可发现性：<https://fortelabs.com/blog/progressive-summarization-a-practical-technique-for-designing-discoverable-notes/>
- Obsidian Properties 使用 YAML 保存结构化元数据：<https://obsidian.md/help/properties>
- Obsidian Internal Links 建立笔记网络：<https://obsidian.md/help/links>
- Obsidian Search 支持路径、标签、属性和任务检索：<https://obsidian.md/help/plugins/search>

## 安全边界

- 本地助手不调用外部模型，不上传输入。
- 浏览器草稿和复习进度保存在 localStorage；清理浏览器数据会删除这些状态。
- 不把密码、密钥、证件原件、客户资料、内部代码或私人通信放入方法卡。
- 当前页面没有加入公开职业主页导航；是否发布由仓库所有者另行决定。
