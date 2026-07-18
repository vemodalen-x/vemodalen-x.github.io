window.BUSINESS_LEARNING_MODEL = {
  version: "1.0.0",
  scoring: {
    labels: ["未形成", "能复述", "能解释", "能迁移"],
    criteria: [
      "说清了机制、边界或反例，而不只是复述名词",
      "使用了当前项目中的具体对象、事实或数字",
      "给出了下一动作、判据和回看时间"
    ],
    masteryThreshold: 80,
    minimumAttempts: 3,
    intervalsByScore: { "0": 1, "1": 1, "2": 3, "3": 7 },
    highScoreIntervals: [7, 14, 30]
  },
  sessionTypes: [
    { id: "retrieve", name: "回忆", icon: "brain", minutes: 5, description: "先关掉答案，从记忆中提取。" },
    { id: "explain", name: "讲透", icon: "message-circle-question", minutes: 7, description: "解释机制、边界与反例。" },
    { id: "diagnose", name: "诊断", icon: "scan-search", minutes: 8, description: "识别案例中的错误结构并修正。" },
    { id: "apply", name: "迁移", icon: "briefcase-business", minutes: 10, description: "把方法落到当前真实项目。" },
    { id: "review", name: "复习", icon: "refresh-cw", minutes: 5, description: "在遗忘发生前重新提取。" }
  ],
  competencies: [
    {
      id: "orient",
      order: 1,
      name: "定目标",
      verb: "Orient",
      icon: "crosshair",
      color: "#087f72",
      prerequisites: [],
      outcome: "能把模糊愿望改写成有对象、基线、目标值、期限、约束和非目标的决策问题。",
      diagnosticPrompt: "请写出你当前业务问题的对象、基线、目标值、期限，以及这轮明确不做什么。",
      retrievalPrompts: [
        "一个可行动的业务目标至少要回答哪五类信息？",
        "为什么“做一个更好的产品”不是合格的学习或业务目标？",
        "目标、任务和指标三者分别解决什么问题？"
      ],
      transferPrompt: "把当前项目改写成一句可验证目标：为谁，在多长时间内，把哪个基线结果改变到什么程度，同时受什么约束。",
      artifact: "问题定义与成功标准"
    },
    {
      id: "map",
      order: 2,
      name: "画全局",
      verb: "Map",
      icon: "map",
      color: "#2463a5",
      prerequisites: ["orient"],
      outcome: "能用业务画布区分用户、需求、方案、替代、收入、成本、渠道、指标与壁垒，并定位当前关口。",
      diagnosticPrompt: "不看资料，画出你业务最重要的八个要素，并指出现在卡在哪个前置关口。",
      retrievalPrompts: [
        "259 和五步法为什么不是一张并列清单？",
        "需求、方案、商业模式、增长与壁垒之间有什么前后依赖？",
        "业务画布中最容易被产品功能掩盖的三个格子是什么？"
      ],
      transferPrompt: "为当前项目补齐用户、场景需求、现有替代、方案、收入、成本、渠道、核心指标和壁垒，并标记证据为空的格子。",
      artifact: "业务画布与阶段关口"
    },
    {
      id: "focus",
      order: 3,
      name: "抓关键",
      verb: "Focus",
      icon: "scan-search",
      color: "#9b6000",
      prerequisites: ["orient", "map"],
      outcome: "能按前置性、影响和证据缺口筛出单一关键假设，并主动写出最强反证。",
      diagnosticPrompt: "列出当前项目三个高风险假设，再说明为什么其中一个必须最先验证。",
      retrievalPrompts: [
        "关键假设为什么不能只按“最担心”来选？",
        "前置性、影响和证据缺口如何共同决定验证顺序？",
        "什么样的反证足以让你放弃当前假设？"
      ],
      transferPrompt: "从当前项目中只保留一个最前置、影响最大、证据最弱的假设，并写出它的最强反证。",
      artifact: "关键假设与反证"
    },
    {
      id: "evidence",
      order: 4,
      name: "补证据",
      verb: "Evidence",
      icon: "search-check",
      color: "#6655a5",
      prerequisites: ["focus"],
      outcome: "能区分事实、推断、预测和假设，判断证据等级，并写出会改变结论的新事实。",
      diagnosticPrompt: "从你的项目中各写一条事实、推断、预测和待验证假设，并为事实附上来源与日期。",
      retrievalPrompts: [
        "访谈表达、真实行为和付费证据的证明力有什么差异？",
        "为什么必须同时记录来源日期和更新条件？",
        "什么是低配高用与高配低用的验证错误？"
      ],
      transferPrompt: "为当前关键假设建立证据账本：已有事实、来源日期、仍属推断的部分，以及什么新事实会改变判断。",
      artifact: "证据账本与更新条件"
    },
    {
      id: "experiment",
      order: 5,
      name: "做实验",
      verb: "Experiment",
      icon: "flask-conical",
      color: "#b34d45",
      prerequisites: ["focus", "evidence"],
      outcome: "能设计只有一个主变量、包含样本、期限、成本、成功与失败判据的最低成本可证伪实验。",
      diagnosticPrompt: "为一个真实假设写出最小实验，必须包含样本、动作、期限、成本上限和失败判据。",
      retrievalPrompts: [
        "一个实验怎样才算可证伪，而不只是收集好消息？",
        "为什么每轮实验应尽量只改变一个主变量？",
        "访谈、原型、预售和真实交付分别适合验证什么？"
      ],
      transferPrompt: "为当前关键假设设计最低成本实验，只允许一个主变量，并预先写下样本、期限、预算和停止判据。",
      artifact: "实验卡与结果判据"
    },
    {
      id: "decide",
      order: 6,
      name: "定取舍",
      verb: "Decide",
      icon: "git-compare-arrows",
      color: "#2d6f8f",
      prerequisites: ["evidence", "experiment"],
      outcome: "能基于证据比较继续、调整、停止或加注，显式考虑机会成本、可逆性、时间窗口和切换阈值。",
      diagnosticPrompt: "针对当前项目写一个继续与停止的选择，列出机会成本、可逆性和触发切换的阈值。",
      retrievalPrompts: [
        "为什么已有投入不应成为继续投入的充分理由？",
        "可逆决策与不可逆决策应该怎样分配分析时间？",
        "决策备忘录为什么要在结果出现前写切换阈值？"
      ],
      transferPrompt: "写一页决策备忘录：比较继续、调整、停止和加注，给出依据、机会成本、可逆性与切换阈值。",
      artifact: "决策备忘录与承诺"
    },
    {
      id: "operate",
      order: 7,
      name: "跑业务",
      verb: "Operate",
      icon: "activity",
      color: "#3f7b50",
      prerequisites: ["decide"],
      outcome: "能把决策转成负责人、期限、漏斗、单位经济、交付质量与风险指标，并持续记录。",
      diagnosticPrompt: "把一个决定拆成负责人、截止日、领先指标、结果指标、成本和风险预警。",
      retrievalPrompts: [
        "领先指标和结果指标分别在什么时候有用？",
        "为什么增长数据必须和单位经济、交付质量一起看？",
        "行动清单与业务运行系统的根本差异是什么？"
      ],
      transferPrompt: "把当前决定转成行动账本：负责人、截止日、领先指标、结果指标、单位经济和风险预警。",
      artifact: "行动账本与业务指标"
    },
    {
      id: "review",
      order: 8,
      name: "结结果",
      verb: "Review",
      icon: "history",
      color: "#6d5845",
      prerequisites: ["operate"],
      outcome: "能比较预期与实际，区分结果、归因和替代解释，更新规则并安排下一轮动作。",
      diagnosticPrompt: "选择一个已结束行动，分别写出原预测、真实结果、可能归因、替代解释和下一轮规则。",
      retrievalPrompts: [
        "为什么“结果好”不自动等于“判断对”？",
        "复盘时如何避免用结果倒推一个过度确定的故事？",
        "什么信息应该从项目记录升级为可复用规则？"
      ],
      transferPrompt: "对一次真实行动结算：预期、实际、偏差、归因、替代解释、误判以及下一轮规则。",
      artifact: "复盘报告与知识更新"
    }
  ]
};
