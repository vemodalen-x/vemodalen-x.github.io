# AI / CV / AIGC 离线学习知识库

生成日期：2026-07-15

## 打开方式

直接在浏览器打开 `index.html`。页面没有外部脚本、字体或图像依赖，断网时仍可阅读全部本地总结、课程讲次、论文矩阵与来源索引。

## Git 完整性

提交前运行 `python tools/check_offline_kb_git.py`。检查器会确认全部离线文件、生成器输入和页面本地链接均已被 Git 跟踪，同时拒绝外部运行时资源与超过 50 MB 的单文件。第三方视频、音频、完整课程仓库和抓取缓存不进入 Git；页面仅链接原站，离线包保留原创总结、结构化快照、清洗字幕、逐字稿和教学关键帧。

## 内容范围

- 13 个直接来源：MIT MAS.S60 How2AI、Vincent Generative AI Diffusion、Caltech CS 159、Stanford CS25、Stanford CS336、Lil'Log、Transformer Taxonomy、Thinking Machines Connectionism、Labelbox Blog、Andrej Karpathy GitHub、Ostris AI Toolkit、Kaggle 5-Day Gen AI Intensive、AI Agent 架构趋势及演进。
- 27 个 How2AI 课程节点，包含 date、week、topic、subtopics、slides/video 与 readings。
- 9 个 Stanford CS25 V6 讲次及 9 个精选录播入口。
- 19 个 Stanford CS336 讲次、5 个实现作业、17 份本地 lecture 文件、18 场含字幕录播和 251,706 词清洗英文字幕。
- 63 个 Karpathy GitHub 公开仓库快照，其中 54 个非 fork 项目进入统一知识主线。
- 42 个 AI Toolkit README 支持模型条目、25 个自动提取的示例配置和 773 个仓库树节点。
- 5 场 Kaggle GenAI Intensive 直播、04:56:34 总时长、49,160 词去重英文自动逐字稿和 10 张教学关键帧。
- 1 场无页面字幕的 Agent 架构视频，包含 12 个技术章节、9,660 个清洗转写字符和 12 张本地幻灯片关键帧；原视频不进入 Git。
- 99 条课程 reading 记录，按 URL 聚合进 `papers.html`。
- 475 个唯一外部 URL，完整保留在 `catalog.html` 和 `data/source_catalog.json`。
- 475/475 个条目均有技术类别、中文学习定位和阅读优先级，可按七大知识模块离线筛选。
- 全部条目进一步唯一合并到 8 层知识主线：研究方法、数据与表征、架构、基础模型、多模态、生成、Agent、运行时与评测。
- 3 份已有中文长报告的本地副本：How2AI、Diffusion、LLM Reasoning/Agents。

## 离线与版权边界

本库主要保存原创中文学习笔记、课程结构、阅读定位和来源元数据，而不是第三方论文、博客或 Google Drive 文档的全文镜像。Stanford CS336 的公开官方讲义/作业仓库与 YouTube 自动字幕另做了带 commit/来源记录的本地快照；外链在联网时用于追溯原始出处，断网时仍可使用课程地图、源码、课件与清洗字幕。

对不能从课程标题或可见页面可靠判断的论文贡献，索引保持“需回到原文确认”的阅读状态，不补造结论。博客中的具体实验数据或产品指标应被理解为作者在特定设置下的报告，不应直接泛化。

## 数据文件

- `data/how2ai_schedule.json`：课程讲次的结构化副本。
- `data/stanford_cs25_schedule.json`：Stanford CS25 V6 讲次、讲者、摘要、工程价值与资料链接。
- `data/stanford_cs336.json`：Stanford CS336 课程、19 讲、5 个作业、仓库 commit、录播/字幕、六模块技术主线和 8 周计划。
- `stanford_cs336.html` / `cs336_transcripts.html`：CS336 全生命周期学习地图与 18 场可搜索清洗英文字幕。
- `transcripts/stanford_cs336/`：逐讲 Markdown 清洗稿；官方课件、作业仓库和录播通过课程页外链追溯，不复制进 Git。
- `data/karpathy_repositories.json`：Karpathy 仓库快照、学习轨道、状态、优先级与中文学习定位。
- `data/ai_toolkit_repository.json`：AI Toolkit 仓库元数据、支持模型、示例配置、架构文件、学习阶段与证据边界。
- `data/kaggle_genai_course.json`：Kaggle 五日课程元数据、中文综述、章节、配套资料、字幕块和关键帧索引。
- `kaggle_genai.html` / `kaggle_genai_transcripts.html`：课程学习地图与可搜索完整逐字稿。
- `transcripts/kaggle_genai/` / `data/kaggle_genai/subtitles/`：逐讲 Markdown 清洗稿与原始 VTT 自动字幕。
- `data/bilibili_agent_architecture.json`：Agent 架构视频的章节、分层、技术判断、实验、资源、关键帧和分钟级转写。
- `agent_architecture.html` / `agent_architecture_transcript.html`：企业 Agent 架构学习页与可搜索 Whisper 中文稿。
- `transcripts/bilibili_agent_architecture.md` / `data/bilibili_agent/`：Markdown 清洗稿、Whisper VTT 与转写审计数据。
- `data/reading_matrix.csv`：原有阅读矩阵的离线副本。
- `data/source_catalog.json`：全部链接的机器可读索引。
- `data/knowledge_clusters.json`：按统一技术主线合并后的完整知识卡与依赖关系。
- `learning_plan.html`：带本地进度、先修锁、阶段验收、学习证据、主动回忆和间隔复习的交互式学习控制台。
- `learning_design_review.md`：学习体验审查、已完成改进、残余差距与衡量指标。
- `data/learning_sequence.json`：公共主干、三个专业分支、生产汇流、角色路径、验收任务与回忆卡。
