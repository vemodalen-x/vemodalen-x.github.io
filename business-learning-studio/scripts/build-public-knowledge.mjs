import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();

function loadModel() {
  const context = { window: {} };
  const source = fs.readFileSync(path.join(root, "knowledge", "business-learning-model.js"), "utf8");
  vm.runInNewContext(source, context, { filename: "business-learning-model.js" });
  return context.window.BUSINESS_LEARNING_MODEL;
}

const blueprints = {
  orient: {
    titles: ["目标五要素", "基线与目标差", "约束与非目标", "决策问题"],
    keywords: ["对象", "基线", "目标值", "期限", "约束"],
    diagnose: "团队把‘提升增长’写成季度目标，但没有对象、当前基线、目标值或明确期限。指出为什么它还不能指导决策。",
    misconceptions: [
      ["wish-as-goal", "把愿望当目标", "补上对象、基线、目标值、期限与约束。"],
      ["metric-without-decision", "有指标但没有决策", "说明结果达到或未达到时分别改变什么行动。"],
      ["scope-creep", "没有明确非目标", "写清本轮不解决的对象、功能或渠道。"]
    ]
  },
  map: {
    titles: ["业务系统画布", "价值交换", "阶段关口", "现有替代"],
    keywords: ["用户", "场景", "替代", "收入", "成本"],
    diagnose: "团队用功能列表代替商业模式，并直接讨论规模增长。指出缺失的业务要素和最前置的验证关口。",
    misconceptions: [
      ["feature-is-business", "用功能代替业务", "补齐用户、场景、替代、价值交换和获取路径。"],
      ["gates-as-checklist", "把阶段关口当并列清单", "先验证需求，再进入方案、交换和增长。"],
      ["ignore-alternative", "忽略现有替代", "描述用户今天如何解决、忍受或绕过问题。"]
    ]
  },
  focus: {
    titles: ["关键假设排序", "最强反证", "前置风险", "证据缺口"],
    keywords: ["假设", "前置性", "影响", "证据缺口", "反证"],
    diagnose: "团队同时推进八个高风险假设，因为每一项都很重要。说明怎样只保留一个当前最该验证的假设。",
    misconceptions: [
      ["fear-ranking", "按焦虑程度排序", "同时比较前置性、影响和证据缺口。"],
      ["many-priorities", "保留多个第一优先级", "选择一条错了就会改变当前路线的假设。"],
      ["weak-counterevidence", "反证不足以改变行动", "提前写下会停止、调整或降级投入的事实。"]
    ]
  },
  evidence: {
    titles: ["事实与推断", "证据等级", "更新条件", "来源账本"],
    keywords: ["事实", "推断", "行为", "来源", "更新条件"],
    diagnose: "访谈对象说‘这个功能很好’，团队便把需求标为已验证。区分表达、行为和付费证据的证明力。",
    misconceptions: [
      ["opinion-as-fact", "把观点当事实", "记录可观察行为、来源和发生日期。"],
      ["evidence-overreach", "证据证明范围过大", "只保留实验实际覆盖的人群、场景与结论。"],
      ["no-update-rule", "没有更新条件", "写明什么新事实会降低或提高当前判断。"]
    ]
  },
  experiment: {
    titles: ["最小可证伪实验", "单一主变量", "双向判据", "样本与期限"],
    keywords: ["样本", "动作", "期限", "主变量", "失败判据"],
    diagnose: "团队同时更换价格、渠道和产品文案，结果转化上升。指出为什么无法知道真正起作用的因素。",
    misconceptions: [
      ["many-variables", "一次改变多个主变量", "缩小到一个主变量，其余条件尽量稳定。"],
      ["success-only", "只有成功判据", "预先写出失败阈值和对应停止动作。"],
      ["proxy-mismatch", "代理指标与假设不匹配", "让实验行为尽量接近真实购买或使用。"]
    ]
  },
  decide: {
    titles: ["选择与机会成本", "决策可逆性", "切换阈值", "决策备忘录"],
    keywords: ["选项", "机会成本", "可逆性", "阈值", "承诺"],
    diagnose: "团队因为已经投入三个月而决定继续，但没有比较替代选择。识别沉没成本并重写决策依据。",
    misconceptions: [
      ["sunk-cost", "用沉没成本支持继续", "只比较从现在开始的新增成本与未来收益。"],
      ["no-alternative", "没有真实替代选项", "至少比较继续、调整、停止与加注。"],
      ["threshold-after-result", "结果出现后才改阈值", "在行动前记录切换条件和时间窗口。"]
    ]
  },
  operate: {
    titles: ["负责人和期限", "领先与结果指标", "单位经济", "风险预警"],
    keywords: ["负责人", "截止日", "领先指标", "单位经济", "风险"],
    diagnose: "项目有二十项行动，但没有负责人、截止日、成本或结果指标。把任务清单改成可运行的业务系统。",
    misconceptions: [
      ["activity-as-progress", "把活动量当业务结果", "同时记录领先指标、结果指标和质量指标。"],
      ["owner-unclear", "多人负责等于无人负责", "每个承诺只保留一个最终负责人。"],
      ["growth-without-economics", "增长脱离单位经济", "同步查看获取成本、毛利、留存和交付质量。"]
    ]
  },
  review: {
    titles: ["预期与实际", "归因与替代解释", "规则更新", "下一轮动作"],
    keywords: ["预测", "实际", "偏差", "替代解释", "规则"],
    diagnose: "结果好于预期，团队便认定原判断正确。说明为什么好结果仍可能来自运气、外部变化或错误机制。",
    misconceptions: [
      ["outcome-is-quality", "把好结果等同好判断", "分别评价决策过程和最终结果。"],
      ["single-story", "只保留一个归因故事", "列出至少两个能解释同一结果的替代原因。"],
      ["lesson-without-action", "经验没有改变下一步", "把复盘结论写成触发条件与具体动作。"]
    ]
  }
};

const model = loadModel();
const cards = [];
const knowledge = [];
const items = [];

for (const stage of model.competencies) {
  const blueprint = blueprints[stage.id];
  blueprint.titles.forEach((title, index) => {
    const id = `public-${stage.id}-${String(index + 1).padStart(2, "0")}`;
    const summary = `${title}用于形成“${stage.artifact}”：${stage.outcome}`;
    const mentorUse = `先要求学习者独立完成，再追问依据、边界、反例和下一动作；不要用术语复述代替能力证据。`;
    const questions = [
      stage.retrievalPrompts[index % stage.retrievalPrompts.length],
      `为什么“${title}”会影响“${stage.artifact}”？`,
      `在什么边界下不能直接使用“${title}”？`
    ];
    const misconceptions = blueprint.misconceptions.map(([misconceptionId, label, coaching]) => ({
      id: `${stage.id}-${misconceptionId}`,
      label,
      coaching
    }));
    const signals = [...new Set([...blueprint.keywords, title, stage.name])];
    cards.push({ id, stage: stage.id, title });
    knowledge.push({ id, stage: stage.id, title, summary, mentorUse, questions, source: "原创商业能力模型" });
    items.push({
      id,
      stage: stage.id,
      title,
      challenges: {
        retrieve: questions[0],
        explain: `向不了解该方法的同事解释“${title}”：说清作用机制、适用边界和一个反例。`,
        diagnose: `${blueprint.diagnose}\n请使用“${title}”作为分析视角。`,
        apply: `${stage.transferPrompt}\n说明“${title}”怎样改变你的当前判断。`
      },
      hints: [
        { level: 1, label: "产物", text: `本题最终要形成：${stage.artifact}。` },
        { level: 2, label: "检查", text: `优先检查：${blueprint.keywords.join("、")}。` },
        { level: 3, label: "教练", text: mentorUse }
      ],
      expectedElements: blueprint.keywords,
      rubric: [
        { id: "mechanism", label: "机制与边界", description: "答案解释了为什么、适用边界或反例。", signals: ["因为", "导致", "取决于", "机制", "边界", "反例", "假设", ...signals] },
        { id: "evidence", label: "具体证据", description: "答案出现了真实对象、样本、事实、数字或可追溯来源。", signals: ["用户", "客户", "样本", "访谈", "付款", "数据", "来源", "事实", "记录", "人", "%"] },
        { id: "action", label: "动作与判据", description: "答案给出了下一动作、成功/失败阈值和回看时间。", signals: ["下一步", "如果", "则", "至少", "低于", "高于", "停止", "继续", "调整", "天", "周", "截止", "回看", "判据"] }
      ],
      misconceptions
    });
  });
}

const operatingSystem = {
  version: "1.0.0",
  name: "Business Learning Studio Public Knowledge OS",
  loop: {
    stages: model.competencies.map((stage) => ({
      id: stage.id,
      order: stage.order,
      name: stage.name,
      verb: stage.verb,
      artifact: stage.artifact,
      cardCount: cards.filter((card) => card.stage === stage.id).length
    }))
  },
  cards
};

const itemBank = {
  version: "1.0.0",
  licenseBoundary: "Original generic educational content. No paid-course transcripts, private notes, account data, or third-party screenshots.",
  scoringBoundary: "Signal checks are transparent suggestions, not objective grading. The learner retains the final rubric decision.",
  modes: ["retrieve", "explain", "diagnose", "apply"],
  items
};

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeBrowserGlobal(relativePath, globalName, value) {
  fs.writeFileSync(path.join(root, relativePath), `window.${globalName} = ${JSON.stringify(value, null, 2)};\n`, "utf8");
}

writeJson("knowledge/business-operating-system.json", operatingSystem);
writeBrowserGlobal("knowledge/business-operating-system.js", "BUSINESS_KNOWLEDGE_OS", operatingSystem);
writeJson("knowledge/business-public-kb.json", knowledge);
writeBrowserGlobal("knowledge/business-public-kb.js", "BUSINESS_PUBLIC_KB", knowledge);
writeJson("knowledge/business-learning-item-bank.json", itemBank);
writeBrowserGlobal("knowledge/business-learning-item-bank.js", "BUSINESS_LEARNING_ITEM_BANK", itemBank);

process.stdout.write(`${JSON.stringify({ cards: cards.length, stages: model.competencies.length, items: items.length }, null, 2)}\n`);
