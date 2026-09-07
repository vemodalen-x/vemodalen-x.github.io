# RoleFit 求职作战室

这是一个无构建依赖、可直接打开的求职与面试准备产品原型。它把研究报告里的四个原则转成了界面和交互：

- **Schema-first**：岗位要求、候选人证据、产物和质量检查分层展示。
- **Evidence-first**：所有匹配项都指向候选人证据 ID；缺口不会被润色成经历。
- **Privacy-first**：原型不上传资料，默认不输出年龄、照片、婚姻、住址等无关字段。
- **Eval-first**：简历在关键词、证据、ATS、一页约束和隐私上分别校验。

## 已实现

- 两个真实岗位示例：Sea `Senior AI Engineer` 与 BytePlus `Forward Deployed Engineer`
- 申请进度中心：里程碑、下一场安排、待办与 CV / 面试指南 / 追踪表快捷入口
- 跨岗位申请漏斗：统一状态、最近动态、后续安排与 10 天静默跟进提示
- 按岗位保留实际投递材料快照，并以追加式日志记录面试、反馈、Offer 与结果
- 岗位—证据匹配矩阵、筛选与缺口冲刺
- 工作资格 / 签证独立门槛，以及技术、经验、行为、职业方向四维加权匹配
- 面向岗位重排的一页英文简历预览、复制与浏览器 PDF 导出
- 五天面试计划、进度保存、高概率问题、答题骨架和两分钟计时器
- 社区面经题单转化：来源边界、岗位筛选、P0/P1 优先级、练习验收与独立进度保存
- 代码随想录 Python 路线：30 道精选算法题、18 道 P0、九类筛选、Python 模板、复杂度、边界用例与独立进度保存
- Deep-ML 精选题库：30 道岗位相关 ML coding 题、13 道 P0、八类筛选、中文面试答案、实现验收点与独立进度保存
- Agent 开发二面 48 题：六类筛选、三步答题结构、个性化证据选择、真实性边界与口述进度
- 视觉生成模型专项：FLUX、Diffusion/Flow、RoPE、CFG、LoRA、DMD2、压缩与 Video Model 共 22 题
- 行业求职 Runbook：按面试类型的定向复习 brief、精力护栏与追加式面试后 6 分钟复盘
- 企业 RAG 参考架构：从多模态文档解析到权限过滤、版本溯源、混合检索、证据化回答、离线/在线评测与上线治理的可执行学习页
- 阶段化面试上下文与 CV 表述一致性检查：面试答案以实际投递版本为准
- 官方事实包、信源分层、面试官反问清单
- 质量校验、假设和诚信警告
- 粘贴其他 JD 后在浏览器内运行的启发式关键词分析
- 五阶段薪资谈判工作台：私密参数、准备完整度、价值筹码、压力场景与英文话术
- 响应式桌面/移动端布局与 `localStorage` 进度保存
- 每日求职驾驶舱：20 / 75 / 120 分钟三档，强制同时完成一个学习输出和一个真实推进动作
- 岗位新鲜度门槛：超过 7 天未核验会提示先确认岗位仍开放，核验结果按岗位本地保存
- 个性化 Skill 入口：可一键复制 `$run-junxian-ai-job-search` 的每日执行指令

Sea `J02160995` 已按实际结果归档为“HR Call 后无后续”，不会继续占用每日主攻名额；历史投递版本、准备材料和真实性边界仍保留用于后续岗位复用。

谈薪工作台的方法结构参考 [Ssupercoder/Salary-Negotiation-Skill](https://github.com/Ssupercoder/Salary-Negotiation-Skill)，并按当前 RoleFit 数据结构重新实现；不会自动生成未经核验的市场薪资数字。

申请闭环参考 [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) 的 application archive、outcome journal、stage-specific interview prep 与 eligibility gate 思路；本项目保留为本地静态应用，没有复制其丹麦岗位抓取器或 Claude/LaTeX 运行时。

入口层参考 [CuFlow](https://cuflow.ai/) 的单一 AI 伙伴定位、all-in-one toolkit 和轻量工作流呈现，重新设计为 RoleFit 自己的 Career Flow；仅借鉴信息架构与视觉原则，没有使用其品牌、文案或插画素材。

## 打开方式

直接打开 `index.html` 即可。若浏览器限制本地脚本，可在仓库根目录启动静态服务器：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000/job-search-copilot/`。

日常使用可直接打开 `daily-job-search-cockpit.html`。页面数据只保存在当前浏览器；清理站点数据、切换浏览器或使用无痕窗口会丢失本地进度。

## 回归测试

测试脚本需要 Node.js、Playwright 与本机 Chrome。截图输出到系统临时目录，不写入仓库：

```powershell
node smoke-test.cjs
```

覆盖主追踪表、面试题库、企业 RAG、每日驾驶舱、状态持久化、岗位新鲜度、桌面和移动端布局。桌面快捷方式仅在文件存在时验证，不作为其他机器运行测试的前置条件。

## 原型边界

当前版本是前端产品原型，不会从任意 URL 抓取岗位，也不会调用模型。两个示例数据来自对应官方岗位页，其他岗位需要粘贴 JD，分析结果明确标注为浏览器内启发式结果。

生产版建议按以下流水线替换启发式解析：

1. 输入归一化与敏感字段脱敏
2. JD 与候选人分别使用结构化 schema 解析
3. 官方信源优先的 evidence pack
4. requirements × evidence 对齐矩阵
5. 简历、面试计划、公司摘要并行生成
6. deterministic checks + rubric critic
7. 用户确认后导出，不自动投递
