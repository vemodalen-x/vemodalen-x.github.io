(function () {
  "use strict";

  const STORAGE_KEY = "rolefit.multiRoleInterview.v1";
  const state = {
    track: "all",
    priority: "all",
    search: "",
    questionTrack: "vision",
    progress: loadProgress()
  };

  const tracks = [
    { id: "vision", name: "视觉 / 感知", icon: "◉", cls: "track-vision", summary: "从数据与指标到实时部署、hard cases 和安全边界。", companies: ["GoTo", "Motional", "Razer", "OMNIVISION", "Genesis", "RGE", "OKX", "Shopee"], proof: "分割、抠图、深度、检测、跟踪、量化、C++ / Android" },
    { id: "platform", name: "生产 ML / 平台", icon: "⌁", cls: "track-platform", summary: "训练与服务流水线、漂移、监控、MLOps 和跨团队交付。", companies: ["Micron", "SATS", "Eames"], proof: "训练到部署、验证门槛、设备调试、release handoff" },
    { id: "fde", name: "FDE / Agentic AI", icon: "↗", cls: "track-fde", summary: "模糊需求拆解、企业 RAG / Agent、评估、治理与客户沟通。", companies: ["Partners Group", "Cohere", "PayPal"], proof: "生产可靠性纪律 + agent-assisted 自动化；不夸大 LLM 年限" }
  ];

  const sources = [
    { id: "gojek-glassdoor", grade: "B", title: "Gojek Data Scientist candidate reports", note: "2026 记录含随机森林、编码、PySpark、项目深挖与 fraud/risk case；地点/团队可能不同。", url: "https://www.glassdoor.co.in/Interview/Gojek-Senior-Data-Scientist-Interview-Questions-EI_IE1282114.0%2C5_KO6%2C27.htm" },
    { id: "gojek-gfg", grade: "B", title: "Gojek Data Science interview experience", note: "较旧且为实习岗：SQL、统计、ML/DL 基础、项目 What/How/Why；仅用于题型信号。", url: "https://www.geeksforgeeks.org/interview-experiences/gojek-interview-experience-for-data-science-intern/" },
    { id: "motional-iq", grade: "B", title: "Motional MLE interview guide", note: "聚合型指南；用于感知系统设计、协作式 Python 和安全性主题，不视为官方轮次。", url: "https://www.interviewquery.com/interview-guides/motional-machine-learning-engineer" },
    { id: "micron-direct", grade: "A", title: "Micron MLE · Singapore candidate report", note: "单一样本且为 2021：recruiter、logic test、HM、5 天 MLOps take-home。需按陈旧样本处理。", url: "https://www.jointaro.com/interviews/companies/micron-technology/experiences/machine-learning-engineer-singapore-singapore-august-31-2021-no-offer-negative-a8cffba6" },
    { id: "shopee-nowcoder", grade: "A", title: "Shopee Singapore Algorithm Engineer report", note: "2021 实人验证岗位：项目深挖、Attention、端到端分类流程、算法题、leader 与 HR。较旧但方向高度相邻。", url: "https://www.nowcoder.com/discuss/713266" },
    { id: "shopee-glassdoor", grade: "B", title: "Shopee Singapore algorithm/ML reports", note: "岗位族记录常见两轮技术（coding、resume、system design）加行为轮。", url: "https://www.glassdoor.com.hk/Interview/Shopee-Machine-Learning-Engineer-Interview-Questions-EI_IE1263091.0%2C6_KO7%2C32.htm" },
    { id: "omnivision-glassdoor", grade: "B", title: "OMNIVISION company interview reports", note: "2026 岗位族记录含 HR screen、多人 panel、Python/PyTorch 与工程基础；算法岗细节有限。", url: "https://www.glassdoor.sg/Interview/OmniVision-Technologies-Algorithm-Engineer-Interview-Questions-EI_IE11650.0%2C23_KO24%2C42.htm" },
    { id: "cohere-exponent", grade: "A", title: "Cohere FDE question reports", note: "近期题目集中于客户反馈回流、受限环境部署、最难技术问题与安全要求。", url: "https://www.tryexponent.com/questions?company=cohere&role=forward-deployed-engineer" },
    { id: "cohere-process", grade: "B", title: "Cohere FDE candidate process write-up", note: "候选人叙述 HM、system design/debugging、architecture presentation、VP behavioral 与 HR；非官方。", url: "https://gaijineer.co/cohere-forward-deployed-engineer-interview-process" },
    { id: "paypal-direct", grade: "B", title: "PayPal MLE candidate report", note: "2025 美国 MLE：HR、DSA、manager/ML、system design、final behavioral/technical；并非新加坡 Staff Agentic 同岗。", url: "https://www.jointaro.com/interviews/companies/paypal/experiences/machine-learning-engineer-united-states-april-15-2025-no-offer-negative-45a30727" },
    { id: "razer-official", grade: "C", title: "Razer Senior AI Engineer official JD", note: "官方职责强调 build-vs-buy、evaluation、production constraints 与跨团队影响；用来推断面试主题。", url: "https://razer.wd3.myworkdayjobs.com/en-US/Careers/job/Senior-AI-Engineer--Applied-_JR2026007067" },
    { id: "partners-official", grade: "C", title: "Partners Group FDE official JD", note: "官方职责明确 discovery、RAG/agents、evaluation、ROI、risk、governance 与 production handover。", url: "https://www.partnersgroup.com/careers/open-positions/partners-group/job-details/16499" },
    { id: "paypal-official", grade: "C", title: "PayPal Staff MLE — Agentic Systems JD", note: "官方岗位要求大规模 agentic production、RAG、safety、observability 与 risk management。", url: "https://paypal.wd1.myworkdayjobs.com/en-US/jobs/job/Staff-Machine-Learning-Engineer_R0135002-1" },
    { id: "fdel-2026", grade: "C", title: "2026 FDE loop field guide", note: "通用 FDE 流程资料，用于模糊需求、客户环境与部署案例练习，不替代公司流程。", url: "https://fdeinterviews.com/guide/forward-deployed-engineer-interview-process" }
  ];

  const roles = [
    {
      id: "goto", priority: "A1", company: "GoTo Financial", initials: "GO", title: "Senior Data Scientist · Computer Vision & AI", fit: 93, track: "vision", status: "Ready", evidence: "B", sourceIds: ["gojek-glassdoor", "gojek-gfg"],
      note: "直接命中当前公司/数据科学岗位族：近期记录出现项目深挖、随机森林/编码/PySpark，以及 fraud & risk case；早期记录补充 SQL、统计和指标追问。",
      loop: ["Recruiter", "ML / SQL 基础", "项目深挖", "业务 case", "Culture / team"],
      questions: ["从数据、标注、loss、metrics 到部署，完整讲一个视觉项目", "线上指标下降但离线不变，如何定位 data / model / pipeline drift？", "为欺诈或风险场景设计视觉模型：误拒与漏放如何权衡？", "class imbalance、calibration、A/B test 与业务指标如何连接？"],
      bridge: "主故事用公司视觉项目：先讲现场 hard cases 如何转成数据切片与验收门槛，再讲训练、量化、设备集成和发布闭环。将 Gojek 的风险 case 回答为“先定义成本矩阵，再选 operating point”。",
      watchout: "岗位标题是 Senior Data Scientist，不只考模型；必须补 SQL、统计显著性、实验设计和 product metrics。",
      salary: "目标带宽有重叠 · base 待确认", url: "https://sg.linkedin.com/jobs/view/goto-financial-senior-data-scientist-computer-vision-ai-at-goto-group-4436873063"
    },
    {
      id: "motional", priority: "A2", company: "Motional", initials: "MO", title: "Senior MLE · Perception", fit: 91, track: "vision", status: "Ready", evidence: "B", sourceIds: ["motional-iq"],
      note: "公开资料偏聚合，可靠信号是 Python/ML fundamentals、感知系统设计、实时约束、边缘案例和 safety-first 协作；轮次数不应视为已确认。",
      loop: ["Recruiter", "Collaborative coding", "ML / probability", "Perception design", "Project / behavioral"],
      questions: ["设计相机 / LiDAR 感知流水线，如何做时序同步与 late fusion？", "如何挖掘 petabyte driving logs 中的稀有场景？", "轨迹预测如何表达多模态不确定性并校准？", "模型离线提升但某类 VRU 安全指标下降，是否发布？"],
      bridge: "用实时相机 AI 说明 latency、GPU memory、precision 与 field failure 的权衡；坦诚没有整车 sensor-fusion 量产经历，再用 48 小时小实验补 nuScenes 数据流与 BEV 基础。",
      watchout: "不要把相机单模态经验说成完整自动驾驶 perception stack；重点展示可迁移的实时部署与安全验证纪律。",
      salary: "与目标区间重叠", url: "https://sg.linkedin.com/jobs/view/senior-machine-learning-engineer-perception-at-motional-4424876999"
    },
    {
      id: "micron", priority: "A3", company: "Micron Technology", initials: "MI", title: "Principal / Staff ML/AI Engineer · Product Engineering", fit: 83, track: "platform", status: "Ready", evidence: "A", sourceIds: ["micron-direct"],
      note: "Singapore 同岗单一样本（2021）包含 logic test 与 5 天 MLOps app take-home；样本陈旧，但“自动化端到端 ML 流程”与岗位高度相关。",
      loop: ["Recruiter", "Logic / coding", "Hiring manager", "MLOps take-home", "Panel / stakeholders"],
      questions: ["为晶圆/设备异常检测设计端到端 ML 系统", "50GB 数据无法放入内存，训练与特征处理如何实现？", "模型精度下降 15%，如何区分 data drift、concept drift 与 serving skew？", "如何让训练、评估、审批、部署和回滚每一步自动化且可审计？"],
      bridge: "把现有训练到量化、导出校验、runtime contract、device QA 与 release gate 讲成 MLOps 控制面；再补 manufacturing 数据的时间切分、设备分组泄漏和异常成本。",
      watchout: "Principal/Staff 会追问组织影响和平台复用；需准备一段“如何把单项目流程沉淀成团队标准”的例子。",
      salary: "与目标区间重叠", url: "https://sg.linkedin.com/jobs/view/principal-staff-ml-ai-engineer-product-engineering-stpg-at-micron-technology-4410838256"
    },
    {
      id: "rge", priority: "A4", company: "RGE Digital", initials: "RG", title: "Principal Computer Vision Engineer", fit: 80, track: "vision", status: "Research", evidence: "C", sourceIds: [],
      note: "未找到可信的同岗面经；以下由 Principal 级 CV 职责与通用 senior vision loop 推断。",
      loop: ["Recruiter", "Research deep-dive", "CV system design", "Python / C++", "Leadership"],
      questions: ["选择一个视觉项目，解释从 baseline 到 failure taxonomy 的迭代", "如何设计可跨场景复用的数据与评估平台？", "如何把研究模型落到吞吐、延迟与维护受限的系统？", "如何评审他人的算法方案并形成技术路线？"],
      bridge: "用公司项目而非个人 demo 证明 Principal 级 judgment：你如何定义 acceptance、协调 runtime/QA、阻止不满足门槛的版本进入发布。",
      watchout: "最大风险不是模型能力，而是 Principal scope 证据；准备跨团队影响、技术标准和长期路线故事。",
      salary: "未公开 · 先问", url: "https://sg.linkedin.com/jobs/view/senior-computer-vision-engineer-scientist-at-rge-4380072668"
    },
    {
      id: "partners", priority: "A5", company: "Partners Group", initials: "PG", title: "Forward Deployed Engineer · AI Engineer", fit: 75, track: "fde", status: "Research", evidence: "C", sourceIds: ["partners-official", "fdel-2026"],
      note: "没有公司直接面经；官方 JD 明确会考 AI use-case discovery、buy-vs-build、RAG/agents、evaluation、ROI、risk/governance 与 production handover。",
      loop: ["Recruiter", "Business discovery", "AI case", "System design", "Stakeholder / risk"],
      questions: ["给投资团队设计可信的文档问答与提取系统", "如何用 2 周验证 AI use case，并决定 build、buy 还是 hybrid？", "如何测量 adoption、quality、ROI、cost 与 risk？", "如何处理 ACL、敏感数据、审计和人工复核？"],
      bridge: "把自己定位为 production AI engineer：你擅长把模糊现场问题转成 reproducible cases、evaluation gates 和 handover。Agent 部分用“agent-assisted 自动化训练/测试设计”与企业 RAG case study，不声称企业 LLM 年限。",
      watchout: "金融行业背景与企业 RAG 生产经历是硬缺口；准备一页 private-markets RAG 架构与诚实的迁移路径。",
      salary: "金融机构或可达 · 先问", url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-ai-engineer-at-partners-group-4433597613"
    },
    {
      id: "razer", priority: "B1", company: "Razer", initials: "RZ", title: "Senior AI Engineer · Applied", fit: 89, track: "vision", status: "Salary Check", evidence: "C", sourceIds: ["razer-official"],
      note: "未找到可靠同岗面经；官方 JD 显示重点是 AI 方案探索、build-vs-partner、benchmarking、production latency/reliability/cost 与沟通。",
      loop: ["Recruiter", "Applied AI case", "Evaluation", "Production design", "Cross-functional"],
      questions: ["为游戏/平台用例比较开源、API 与自研模型", "如何设计 benchmark，避免只看单一平均分？", "AI 服务如何在 latency、cost 与体验之间选 operating point？", "新模型效果不稳定时如何灰度、回滚与收集反馈？"],
      bridge: "展示从模型选型、hard-case evaluation 到端侧 runtime 与发布判断的闭环；build-vs-buy 用能力、数据、时延、成本、锁定与维护六维矩阵。",
      watchout: "技术匹配高但公开薪资可能低于目标；先确认 base/level，再投入完整准备。",
      salary: "可能低于目标 · 先问", url: "https://sg.linkedin.com/jobs/view/senior-ai-engineer-applied-at-razer-inc-4414641003"
    },
    {
      id: "omnivision", priority: "B2", company: "OMNIVISION", initials: "OV", title: "Sr. / Staff Algorithm Engineer · Computer Vision", fit: 95, track: "vision", status: "Salary Check", evidence: "B", sourceIds: ["omnivision-glassdoor"],
      note: "公司岗位族报告显示常见 HR screen、多位工程师 panel、项目/基础追问；2026 SWE intern 记录提到 Python/PyTorch。早期 imaging 岗还出现摄影、曝光、白平衡等基础。",
      loop: ["HR screen", "Project deep-dive", "Imaging / CV fundamentals", "Python / C++", "Engineer panel"],
      questions: ["从 sensor raw 到 ISP / CV 模型，数据域变化如何处理？", "白平衡、曝光、噪声、HDR 如何影响检测/增强指标？", "如何将新算法集成进 camera pipeline 或 embedded system？", "用 NumPy / PyTorch 实现高效图像操作并解释内存布局。"],
      bridge: "这是最直接的技术匹配：用 camera pipeline、image quality、模型到 native runtime、量化与设备调试做主线；补齐 sensor/ISP/color science 术语与实验设计。",
      watchout: "Staff 预算与岗位 scope 要先确认；技术面不要只谈深度模型，必须复习成像链路和经典图像处理。",
      salary: "可能低于目标 · 确认 Staff 预算", url: "https://sg.linkedin.com/jobs/view/sr-staff-algorithm-engineer-computer-vision-at-omnivision-4355070531"
    },
    {
      id: "genesis", priority: "B3", company: "Genesis MedTech", initials: "GM", title: "Machine Learning Engineer · Computer Vision", fit: 92, track: "vision", status: "Salary Check", evidence: "C", sourceIds: [],
      note: "未找到可信同岗面经；由 medical CV 与产品化要求推断数据、泛化、可解释性、验证与隐私会是重点。",
      loop: ["Recruiter", "CV project", "Medical ML case", "Coding", "Quality / stakeholders"],
      questions: ["小样本、多中心医疗影像如何切分与验证？", "Dice、IoU、sensitivity、specificity 与临床成本如何选？", "如何检测 domain shift 并设计 human-in-the-loop？", "部署后如何审计数据、版本、性能与失败样本？"],
      bridge: "把 hard-case dataset、golden cases、release gates 和现场 failure handling 映射到医疗验证；明确没有临床产品经验，但熟悉高风险质量闭环。",
      watchout: "title 可能低于当前 seniority，薪资与 EP 都先问；医疗监管经验不可假装。",
      salary: "标题级别偏低 · 先问", url: "https://sg.linkedin.com/jobs/view/machine-learning-engineer-computer-vision-at-genesis-medtech-group-4415996644"
    },
    {
      id: "sats", priority: "B4", company: "SATS", initials: "SA", title: "Senior AI Engineer · Production GenAI & ML Systems", fit: 76, track: "platform", status: "Research", evidence: "C", sourceIds: [],
      note: "未找到可信同岗面经；由 Production GenAI / ML Systems 标题推断会考服务架构、MLOps、observability、RAG/evals 与可靠性。",
      loop: ["Recruiter", "ML system design", "GenAI / RAG", "MLOps / coding", "Behavioral"],
      questions: ["设计同时服务传统 ML 与 LLM 的生产平台", "如何做版本、特征、prompt、retrieval index 与 evaluation lineage？", "线上延迟/成本异常时如何定位与降级？", "如何设计 canary、shadow、rollback 和 on-call runbook？"],
      bridge: "用模型导出、runtime contract、设备 QA、release gate 证明 production discipline；RAG 部分用企业 playbook 方案回答，并区分“做过”与“会如何做”。",
      watchout: "JD 可能要求更长年限及云平台深度；先问 6 年门槛是否硬性。",
      salary: "未公开 · 需确认", url: "https://sg.linkedin.com/jobs/view/senior-ai-engineer-production-genai-and-ml-systems-at-sats-ltd-4437657732"
    },
    {
      id: "eames", priority: "B5", company: "Eames / Financial Institution", initials: "EA", title: "Senior AI Engineer", fit: 80, track: "platform", status: "Research", evidence: "C", sourceIds: [],
      note: "客户公司未披露，无法做公司面经判断；只保留金融 AI 的通用准备，并把客户、team、level、EP、薪资作为 recruiter 必问。",
      loop: ["Recruiter", "Client screen", "AI system design", "Project deep-dive", "Risk / stakeholders"],
      questions: ["客户到底要模型、平台、RAG 产品还是 consulting delivery？", "金融数据权限、审计、PII 与 model risk 如何落地？", "如何从 prototype 进入可支持的 production service？", "如何向非技术 risk/compliance stakeholder 解释 failure boundary？"],
      bridge: "先用问题澄清 role shape；如果偏传统 ML，强调生产 CV/ML；如果偏 GenAI，强调可靠性与 evaluation 迁移，不靠 VEMO demo 撑全部证据。",
      watchout: "公司和 scope 未知时不要投入过多；先完成 15 分钟 recruiter qualification call。",
      salary: "Competitive · 先核实", url: "https://sg.linkedin.com/jobs/view/senior-ai-engineer-at-eames-consulting-4376996361"
    },
    {
      id: "okx", priority: "C1", company: "OKX", initials: "OK", title: "Senior / Staff AI Engineer · Computer Vision", fit: 84, track: "vision", status: "Stretch", evidence: "C", sourceIds: [],
      note: "没有可靠的同岗公开面经；邻近工程岗位出现 OA/算法与项目深挖信号，CV 题型主要由岗位职责推断。",
      loop: ["Recruiter", "OA / coding", "CV project", "Trust system design", "Staff leadership"],
      questions: ["设计 KYC liveness / anti-spoof / deepfake detection 系统", "如何在低 FAR 与低 FRR 之间选阈值并按人群切片？", "攻击快速变化时如何构建数据 flywheel 与 red-team？", "如何让视觉模型满足隐私、延迟、审计与全球合规？"],
      bridge: "将 camera hard cases、实时部署与 failure taxonomy 映射到 identity trust；补 PAD、presentation attack、calibration 与 subgroup metrics。",
      watchout: "Staff scope 与薪资高于目标，且 trust/domain 经验不足；仅内推时投入。",
      salary: "高于目标 · Stretch", url: "https://sg.linkedin.com/jobs/view/senior-staff-ai-engineer-computer-vision-at-okx-4427721103"
    },
    {
      id: "shopee", priority: "C2", company: "Shopee", initials: "SH", title: "Expert Algorithm Engineer · Multimodal AI & Trust", fit: 78, track: "vision", status: "Stretch", evidence: "A", sourceIds: ["shopee-nowcoder", "shopee-glassdoor"],
      note: "Singapore 相邻实人验证算法岗记录很具体：90 分钟技术轮、OCR 项目、Attention、端到端分类方案、算法题、leader 深挖和英文 HR；但记录为 2021，Expert 级会更重 system/leadership。",
      loop: ["Tech 1 · project + coding", "Tech 2 · system / deep-dive", "Leader / expert scope", "HR English"],
      questions: ["从数据准备到训练写出 ID / seller trust 分类流程", "多模态信号如何融合并处理缺失模态？", "如何防止伪造、deepfake 与分布外攻击？", "Python：BFS、coin change、Top-N 数据结构；再追复杂度与测试。"],
      bridge: "主讲公司 OCR/视觉相关项目（若简历确有）或 camera AI pipeline；从 loss、metric、sampling、部署到 hard cases 都能被连续追问。Expert 级再补技术路线与团队影响。",
      watchout: "不要只复习八股；该面经显示面试官会根据提示持续修改你的方案，需练习边说边迭代。",
      salary: "Expert TC 或更高 · Stretch", url: "https://sg.linkedin.com/jobs/view/expert-algorithm-engineer-multimodal-ai-trust-intelligence-marketplace-intelligence-data-at-shopee-4432244049"
    },
    {
      id: "cohere", priority: "C3", company: "Cohere", initials: "CO", title: "Forward Deployed Engineer · Agentic Platform", fit: 69, track: "fde", status: "Stretch", evidence: "A", sourceIds: ["cohere-exponent", "cohere-process"],
      note: "近期 FDE 题目很明确：受限/本地环境部署、严格安全要求、最难技术问题、客户反馈如何进入核心产品；另有候选人流程叙述可作 B 级参考。",
      loop: ["Hiring manager", "System design / debugging", "Architecture presentation", "VP behavioral", "HR"],
      questions: ["讲一次在受限或安全敏感环境部署系统的经历", "客户反馈如何从 one-off workaround 变成核心产品能力？", "企业 agent 平台如何做 tenancy、permissions、tracing 与 evals？", "10× traffic 下什么先坏，如何 isolation、degrade 与 recover？"],
      bridge: "不用 VEMO 冒充生产平台。用真实设备/客户环境中的 runtime debugging、failure isolation、release gates 和跨团队修复证明 FDE 行为；Agent 架构用方案深度补充。",
      watchout: "企业 LLM、Kubernetes/on-prem 与客户安全是明显缺口；投前至少完成可演示的 enterprise RAG case 和 architecture presentation。",
      salary: "未公开 · Stretch", url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-agentic-platform-singapore-at-cohere-4359007810"
    },
    {
      id: "paypal", priority: "C4", company: "PayPal", initials: "PP", title: "Staff MLE · Agentic Systems", fit: 67, track: "fde", status: "Stretch", evidence: "B", sourceIds: ["paypal-direct", "paypal-official"],
      note: "2025 美国 MLE 候选人报告为 HR 后 4 轮：DSA、manager/ML、system design、final behavioral/technical；官方 Staff JD 另明确大规模 agentic、RAG、safety、observability 和 fintech risk。",
      loop: ["Recruiter", "DSA coding", "Manager / ML", "ML system design", "Staff behavioral"],
      questions: ["设计实时风险场景的 agentic decision platform", "multi-step tool use 如何做权限、幂等、超时、补偿与审计？", "如何评估 agent 的 task success、trajectory、grounding 与 risk？", "模型/agent drift 如何监控、回滚并向 risk team 解释？"],
      bridge: "先用生产 ML 系统证明工程与可靠性，再讲 agent-assisted 自动化设计训练/测试流程；明确大规模企业 agent production 不是既有主责。",
      watchout: "Staff + production agentic 是最大 stretch；除非强内推或 recruiter 认可相邻经验，否则暂缓。",
      salary: "未公开 · Stretch", url: "https://sg.linkedin.com/jobs/view/staff-machine-learning-engineer-at-paypal-4375216582"
    }
  ];

  const questions = [
    { id: "v1", track: "vision", title: "设计一个可上线的实时视觉系统", why: "GoTo、Motional、Razer、OMNIVISION、Genesis、RGE", prompt: "从问题定义到线上监控，设计一个实时检测 / 分割 / 跟踪系统。", steps: ["先定用户动作、失败成本、P95 延迟、算力和输入域", "数据版本、切分防泄漏、hard-case slices 与标注 QA", "baseline→模型/损失/阈值→量化/导出/runtime contract", "shadow/canary、分片指标、回滚、failure replay 与反馈闭环"] },
    { id: "v2", track: "vision", title: "离线指标上涨，现场体验下降", why: "所有 production CV 岗", prompt: "模型总体 IoU/accuracy 提升，但现场投诉增加，如何排查？", steps: ["先冻结版本并按设备、场景、时间、相机参数复现", "区分 data drift、pre/post-process、runtime precision 与状态机问题", "看 slice metrics、calibration、latency、visual diff，而非总体均值", "建立最小修复、回归集、release gate 与监控，写 postmortem"] },
    { id: "v3", track: "vision", title: "量化后模型明显退化", why: "Motional、OMNIVISION、Razer", prompt: "FP32 正常，INT8 在设备上退化，如何定位并修复？", steps: ["验证导出前后输入、layout、normalization、operator 与精度一致", "逐层 activation/weight range 比较，找 outlier 和敏感层", "改 calibration set、per-channel、mixed precision 或 QAT", "用设备实测 P50/P95、内存、功耗与 hard cases 决定发布"] },
    { id: "v4", track: "vision", title: "Trust / liveness 的阈值与评估", why: "OKX、Shopee", prompt: "如何评估 liveness / deepfake / seller trust 模型？", steps: ["定义 attack taxonomy、FAR/FRR 成本与用户流程", "按设备、地区、光照、人群、攻击类型做严格切片", "校准分数并基于成本/风险选 operating point", "red-team、OOD、人工复核、申诉、漂移与持续采样"] },
    { id: "v5", track: "vision", title: "Motional 感知系统与稀有场景", why: "Motional", prompt: "如何从海量驾驶日志挖稀有感知失败并加入训练？", steps: ["定义 safety event、近失事件与 uncertainty signal", "用 metadata / embedding / weak detector 分层召回候选", "去重聚类、人工验证、主动学习与场景配额", "offline scenario metrics→simulation→shadow→有限发布"] },
    { id: "p1", track: "platform", title: "端到端 MLOps 平台设计", why: "Micron、SATS、Eames", prompt: "设计训练、评估、审批、部署、监控与回滚全自动的 ML 平台。", steps: ["数据/代码/环境/feature/model lineage 与可复现 run", "CI 单测、数据合同、训练 smoke test、离线 gates", "registry、审批、canary/shadow、不可变 artifact", "漂移/服务 SLO/业务指标、告警、rollback 与 incident review"] },
    { id: "p2", track: "platform", title: "制造异常检测 case", why: "Micron", prompt: "500 台设备、极少故障标签，如何建立异常检测系统？", steps: ["明确提前量、漏报/误报成本、设备层级与操作动作", "时间切分 + 设备分组，避免未来信息/同设备泄漏", "规则/统计 baseline→半监督/自监督→校准阈值", "shadow 告警、工程师反馈、drift 与根因特征回放"] },
    { id: "p3", track: "platform", title: "线上模型突然下降 15%", why: "GoTo、Micron、SATS、PayPal", prompt: "生产模型准确率或业务 KPI 下降，排查顺序是什么？", steps: ["确认监控/label delay/数据 join 是否先坏", "比较 schema、feature distribution、serving parity 与版本变更", "按 slice 定位 data/concept drift 或外部行为变化", "回滚/降级止血，补检测器与重训策略，再复盘"] },
    { id: "p4", track: "platform", title: "Principal / Staff 的组织影响", why: "Micron、RGE、OKX、PayPal", prompt: "如何证明你不只是完成自己的模型，而是提高团队交付质量？", steps: ["选一个反复出现、跨团队且有交付风险的问题", "定义共同契约、golden cases、review gate 或自动检查", "推动产品/runtime/QA adoption，处理异议与迁移成本", "说明复用范围、失败减少/反馈速度等可验证结果；无数字不编造"] },
    { id: "f1", track: "fde", title: "企业 RAG + Agent 系统设计", why: "Partners Group、Cohere、PayPal、SATS", prompt: "为受监管企业设计文档检索与可执行 Agent。", steps: ["任务边界、用户角色、成功指标、必须人工审批动作", "ACL-first ingestion、解析/chunk、hybrid retrieval、rerank 与引用", "planner/executor/tools、schema contract、幂等、超时、补偿", "offline eval、trace replay、P95/cost、red-team、audit 与 rollback"] },
    { id: "f2", track: "fde", title: "Agent 如何评估而不靠感觉", why: "Partners Group、Cohere、PayPal、Razer", prompt: "建立 agentic workflow 的评估体系。", steps: ["任务集：正常、边界、对抗、权限与不可完成场景", "结果：task success、groundedness、业务正确性、人工评分", "轨迹：tool/参数/步骤/恢复/权限；系统：延迟、成本、错误率", "线上采用、人工接管、风险事件；版本对比和发布 gate"] },
    { id: "f3", track: "fde", title: "模糊客户需求的 discovery", why: "Partners Group、Cohere", prompt: "客户说“我们需要一个 AI copilot”，你如何在两周内交付首个价值？", steps: ["追问用户、频次、当前流程、错误成本、数据/权限与决策人", "用 impact×feasibility×risk 排序，选窄任务与可测 KPI", "做 thin slice：真实数据、人工兜底、明确非目标", "每周 demo + failure log；基于证据决定 build/buy/stop/scale"] },
    { id: "f4", track: "fde", title: "受限 / on-prem 环境部署", why: "Cohere、金融机构", prompt: "客户无外网、严格安全、GPU 受限，如何部署与支持？", steps: ["盘点网络、身份、数据驻留、硬件、升级和日志边界", "离线 artifact/SBOM、镜像签名、secrets、最小权限与审计", "容量模型、量化/批处理、健康检查、observability export", "分阶段验收、runbook、rollback、failure bundle 与责任边界"] },
    { id: "b1", track: "behavior", title: "技术方案被反对", why: "全部 senior / staff 岗", prompt: "团队成员不同意你的方案，你怎么处理？", steps: ["先重述共同目标和分歧维度，不把人变成问题", "列假设、风险与可逆性；用小实验或 hard cases 收集证据", "明确决策人、deadline 与记录；不同意也 commit", "复盘结果与方案如何改进，强调团队结果"] },
    { id: "b2", track: "behavior", title: "Deadline 突然提前", why: "全部岗位", prompt: "项目 deadline 提前，如何保证质量？", steps: ["重算 scope/风险/关键路径，明确不可牺牲的安全与验收门槛", "拆 must/should/could；并行可独立工作，冻结非关键变更", "用 daily risk sync、自动回归与清晰 owner 加速", "必要时降级发布/feature flag，而非隐藏质量债务"] },
    { id: "b3", track: "behavior", title: "把客户问题沉淀为产品能力", why: "Cohere、Partners Group、Razer", prompt: "讲一次客户或现场反馈如何推动核心产品改进。", steps: ["具体重复痛点、受影响用户与为何不是单一配置问题", "收集模式、复现与影响证据，区分 symptom 与 product gap", "协调 product/engineering，确定通用 contract 与迁移方案", "验证采用/质量，并说明如何防止再次退化"] }
  ];

  const introductions = [
    { id: "vision", title: "视觉 / 感知版", time: "≈ 60 sec", text: "Hi, I'm Junxian Wu, a Senior AI Engineer based in Singapore. Over the past four years, I’ve worked on production computer vision systems across detection, tracking, segmentation, depth, and image processing. My work covers the full path from problem definition and data design to model training, quantization, C++ or Android integration, device debugging, and release validation. A major strength I bring is turning field failures into reproducible hard cases, measurable evaluation gates, and reliable production fixes while coordinating product, runtime, QA, and customer-facing teams. I’m now looking for a role where I can apply that end-to-end vision and deployment experience to larger-scale, technically demanding perception or imaging products." },
    { id: "platform", title: "生产 ML / 平台版", time: "≈ 60 sec", text: "Hi, I'm Junxian Wu, a Senior AI Engineer in Singapore with close to four years of experience delivering production AI systems. My background started in computer vision, but the most transferable part of my work is the engineering discipline around the model: repeatable training-to-deployment workflows, export and runtime validation, hard-case evaluation, release gates, and cross-functional handover. I’ve worked across PyTorch, quantization, TFLite and ONNX, native C++ and Android pipelines, and device-level debugging. I’m interested in this role because it needs someone who can connect modeling with reliable ML operations and turn one project’s lessons into reusable engineering standards." },
    { id: "fde", title: "FDE / Agentic AI 版", time: "≈ 60 sec", text: "Hi, I'm Junxian Wu, a Senior AI Engineer based in Singapore. My core experience is taking AI features from ambiguous product or field requirements to production delivery, including model development, runtime integration, evaluation gates, failure analysis, and cross-functional handover. I’ve often worked across product, runtime, QA, camera, and customer-facing teams to turn unclear failures into reproducible cases and actionable releases. More recently, I’ve also been using agent-assisted and vibe-coding workflows to automate parts of design, training, evaluation, and testing. I don’t position that as years of enterprise LLM production ownership; what I bring is proven production reliability discipline and a clear approach to applying it to RAG and agent systems in customer environments." }
  ];

  const plan = [
    { day: "DAY 1", title: "统一项目主线", output: "录制视觉 / 平台 / FDE 三版 60 秒介绍；准备 3 分钟公司项目深挖。" },
    { day: "DAY 2", title: "Python + ML 基础", output: "完成 LRU、Top-K、BFS、coin change；闭卷解释 calibration、imbalance、A/B test。" },
    { day: "DAY 3", title: "视觉系统设计", output: "画实时 CV pipeline；口述量化退化、field regression、hard-case mining。" },
    { day: "DAY 4", title: "Motional / Trust 专项", output: "补 sensor fusion、trajectory uncertainty、liveness/PAD 与安全指标。" },
    { day: "DAY 5", title: "MLOps 平台", output: "画 Micron take-home 级训练到回滚架构；准备 drift 与 lineage 答案。" },
    { day: "DAY 6", title: "企业 RAG / Agent", output: "完成 ACL-first RAG + tools + eval + audit 架构；录 10 分钟 presentation。" },
    { day: "DAY 7", title: "全真模拟与反问", output: "45 分钟 mock；按岗位复盘 3 个薄弱答案；准备薪资、EP、scope 反问。" }
  ];

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { questions: [], days: [] }; }
    catch (_) { return { questions: [], days: [] }; }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
    updateProgress();
  }

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  function sourceById(id) { return sources.find(source => source.id === id); }

  function renderTracks() {
    document.querySelector("#track-cards").innerHTML = tracks.map((track, index) => `
      <article class="track-card ${track.cls}" data-index="0${index + 1}">
        <span class="track-icon">${track.icon}</span>
        <h3>${track.name}</h3>
        <p>${track.summary}</p>
        <ul>${track.companies.map(company => `<li>${company}</li>`).join("")}</ul>
        <p><strong>你的证据：</strong>${track.proof}</p>
      </article>`).join("");
  }

  function renderFilters() {
    const items = [{ id: "all", name: "全部 14" }].concat(tracks.map(track => ({ id: track.id, name: track.name })));
    document.querySelector("#track-filters").innerHTML = items.map(item => `<button type="button" data-track="${item.id}" class="${state.track === item.id ? "active" : ""}">${item.name}</button>`).join("");
  }

  function filteredRoles() {
    const needle = state.search.trim().toLowerCase();
    return roles.filter(role => {
      const matchesTrack = state.track === "all" || role.track === state.track;
      const matchesPriority = state.priority === "all" || role.priority.startsWith(state.priority);
      const searchable = [role.company, role.title, role.questions.join(" "), role.note, role.bridge].join(" ").toLowerCase();
      return matchesTrack && matchesPriority && (!needle || searchable.includes(needle));
    });
  }

  function renderRoles() {
    const visible = filteredRoles();
    const focusRole = new URLSearchParams(location.search).get("role");
    document.querySelector("#selected-role-count").textContent = visible.length;
    document.querySelector("#empty-state").hidden = visible.length > 0;
    document.querySelector("#role-grid").innerHTML = visible.map(role => {
      const track = tracks.find(item => item.id === role.track);
      const roleSources = role.sourceIds.map(sourceById).filter(Boolean);
      const prepBrief = `${role.company} — ${role.title}\n\n可能流程：${role.loop.join(" → ")}\n\n必练题：\n${role.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\n个人桥接：${role.bridge}\n\n风险：${role.watchout}`;
      return `<article class="role-card ${focusRole === role.id ? "highlight" : ""}" data-role-card="${role.id}">
        <div class="role-top">
          <span class="company-mark">${role.initials}</span>
          <div class="role-title"><h3>${escapeHtml(role.company)}</h3><p>${escapeHtml(role.title)}</p></div>
          <span class="fit-ring">${role.fit}%</span>
        </div>
        <div class="role-meta">
          <span>${role.priority}</span><span>${track.name}</span><span class="grade">证据 ${role.evidence}</span>
          <span class="${role.status === "Salary Check" ? "salary-check" : ""}">${role.status}</span><span>${escapeHtml(role.salary)}</span>
        </div>
        <p class="evidence-note">${escapeHtml(role.note)}</p>
        <div class="loop"><span>最可能流程 · 待 recruiter 确认</span><div class="loop-line">${role.loop.map((step, index) => `${index ? "<i>→</i>" : ""}<b>${escapeHtml(step)}</b>`).join("")}</div></div>
        <div class="role-block"><span>必须练到能连续追问</span><ul>${role.questions.map(question => `<li>${escapeHtml(question)}</li>`).join("")}</ul></div>
        <div class="role-block"><span>你的回答桥接</span><div class="story-bridge">${escapeHtml(role.bridge)}</div></div>
        <div class="role-block"><span>不要踩的坑</span><div class="watchout">${escapeHtml(role.watchout)}</div></div>
        <div class="role-actions">
          <a href="${role.url}" target="_blank" rel="noreferrer">岗位页 ↗</a>
          ${roleSources.map(source => `<a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">面经 ${source.grade} ↗</a>`).join("")}
          <button class="copy-button" type="button" data-copy="${escapeHtml(prepBrief)}">复制准备 Brief</button>
        </div>
      </article>`;
    }).join("");
    if (focusRole) requestAnimationFrame(() => document.querySelector(`[data-role-card="${CSS.escape(focusRole)}"]`)?.scrollIntoView({ block: "center" }));
  }

  function questionTabLabel(track) {
    return ({ vision: "视觉 / 感知", platform: "生产 ML", fde: "FDE / Agent", behavior: "行为面" })[track];
  }

  function renderQuestionTabs() {
    document.querySelector("#question-tabs").innerHTML = ["vision", "platform", "fde", "behavior"].map(track => `<button type="button" role="tab" aria-selected="${state.questionTrack === track}" data-question-track="${track}" class="${state.questionTrack === track ? "active" : ""}">${questionTabLabel(track)}</button>`).join("");
  }

  function renderQuestions() {
    const visible = questions.filter(question => question.track === state.questionTrack);
    document.querySelector("#question-list").innerHTML = visible.map((question, index) => {
      const checked = state.progress.questions.includes(question.id);
      return `<details class="question-card">
        <summary><span class="question-index">${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(question.title)}</strong><small>${escapeHtml(question.why)}</small></summary>
        <div class="question-body">
          <p>${escapeHtml(question.prompt)}</p>
          <div class="answer-steps">${question.steps.map(step => `<div>${escapeHtml(step)}</div>`).join("")}</div>
          <div class="question-footer"><span>建议：用 2 分钟结构化回答，再接受 5 分钟追问。</span><label class="practice-check"><input type="checkbox" data-question-check="${question.id}" ${checked ? "checked" : ""}> 已完成口述</label></div>
        </div>
      </details>`;
    }).join("");
  }

  function renderIntros() {
    document.querySelector("#intro-cards").innerHTML = introductions.map(intro => `<article class="intro-card"><header><h3>${intro.title}</h3><span>${intro.time}</span></header><p>${escapeHtml(intro.text)}</p><button type="button" data-copy="${escapeHtml(intro.text)}">复制英文介绍</button></article>`).join("");
  }

  function renderPlan() {
    document.querySelector("#plan-grid").innerHTML = plan.map((item, index) => `<article class="plan-day"><span>${item.day}</span><h3>${item.title}</h3><p>${item.output}</p><label><input type="checkbox" data-day-check="${index}" ${state.progress.days.includes(index) ? "checked" : ""}> 当天输出已完成</label></article>`).join("");
  }

  function renderSources() {
    document.querySelector("#source-list").innerHTML = sources.map(source => `<article class="source-item"><span class="source-grade">${source.grade}</span><div><strong>${escapeHtml(source.title)}</strong><small>${escapeHtml(source.note)}</small></div><a href="${source.url}" target="_blank" rel="noreferrer">查看 ↗</a></article>`).join("");
  }

  function updateProgress() {
    const total = questions.length + plan.length;
    const done = state.progress.questions.length + state.progress.days.length;
    const percent = Math.round((done / total) * 100);
    document.querySelector("#completed-count").textContent = done;
    document.querySelector("#progress-percent").textContent = `${percent}%`;
    document.querySelector("#progress-bar").style.width = `${percent}%`;
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch (_) {
      const area = document.createElement("textarea");
      area.value = text; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
    }
    const toast = document.querySelector("#toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1300);
  }

  document.addEventListener("click", event => {
    const trackButton = event.target.closest("[data-track]");
    if (trackButton) { state.track = trackButton.dataset.track; renderFilters(); renderRoles(); return; }
    const questionButton = event.target.closest("[data-question-track]");
    if (questionButton) { state.questionTrack = questionButton.dataset.questionTrack; renderQuestionTabs(); renderQuestions(); return; }
    const copyButton = event.target.closest("[data-copy]");
    if (copyButton) copyText(copyButton.dataset.copy);
  });

  document.addEventListener("change", event => {
    if (event.target.matches("#priority-filter")) { state.priority = event.target.value; renderRoles(); }
    if (event.target.matches("[data-question-check]")) {
      const id = event.target.dataset.questionCheck;
      state.progress.questions = event.target.checked ? [...new Set(state.progress.questions.concat(id))] : state.progress.questions.filter(item => item !== id);
      saveProgress();
    }
    if (event.target.matches("[data-day-check]")) {
      const index = Number(event.target.dataset.dayCheck);
      state.progress.days = event.target.checked ? [...new Set(state.progress.days.concat(index))] : state.progress.days.filter(item => item !== index);
      saveProgress();
    }
  });

  document.querySelector("#role-search").addEventListener("input", event => { state.search = event.target.value; renderRoles(); });
  document.querySelector("#reset-progress").addEventListener("click", () => {
    state.progress = { questions: [], days: [] };
    saveProgress(); renderQuestions(); renderPlan();
  });

  renderTracks(); renderFilters(); renderRoles(); renderQuestionTabs(); renderQuestions(); renderIntros(); renderPlan(); renderSources(); updateProgress();
})();
