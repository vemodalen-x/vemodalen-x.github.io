(function attachPhotographyMentorCore(global) {
  "use strict";

  const VERSION = "2026.09.07-first-principles";

  const MODE_LABELS = {
    critique: "评片",
    plan: "拍摄计划",
    post: "后期流程",
    compute: "计算摄影",
    learn: "学习路径"
  };

  const MODE_DOMAINS = {
    critique: ["aesthetics", "post", "learning"],
    plan: ["genre", "aesthetics", "computational"],
    post: ["post", "computational", "aesthetics"],
    compute: ["computational", "post", "agent"],
    learn: ["learning", "agent", "aesthetics"]
  };

  const MODE_STAGES = {
    critique: ["intent", "visual", "edit"],
    plan: ["intent", "capture", "genre"],
    post: ["compute", "edit", "deliver"],
    compute: ["capture", "compute", "deliver"],
    learn: ["intent", "edit", "deliver"]
  };

  const STAGE_RULES = {
    intent: ["主题", "意图", "表达", "情绪", "真实", "伦理", "比赛", "纪实", "边界"],
    capture: ["曝光", "测光", "动态范围", "快门", "光圈", "iso", "镜头", "对焦", "景深", "运动", "光线", "白平衡"],
    visual: ["构图", "主体", "层级", "平衡", "空间", "边缘", "色彩", "对比", "视觉", "画面"],
    compute: ["raw", "hdr", "多帧", "计算摄影", "夜景", "降噪", "锐化", "超分", "传感器", "tone mapping", "蒙版"],
    genre: ["风光", "星空", "人像", "婚礼", "活动", "街头", "纪实", "手机", "建筑", "商业", "静物", "微距", "旅行"],
    edit: ["选片", "评片", "后期", "风格", "组照", "作品集", "影调", "调色", "序列", "叙事"],
    deliver: ["目录", "lightroom", "元数据", "版权", "备份", "导出", "打印", "色彩管理", "软打样", "交付", "图库", "stock"]
  };

  const BOTTLENECKS = {
    exposure: {
      label: "曝光与动态范围",
      hypothesis: "画面信息可能在捕获阶段已经被高光裁切、暗部噪声或错误测光压缩。",
      immediate: "先确定必须保留的高光，再拍一张保高光基线；只在同一机位比较曝光补偿、包围曝光或 HDR。",
      criterion: "关键高光保留纹理，主体中间调可读，暗部提亮后没有不可接受的噪声。",
      failure: "整体只是变亮或变暗，但关键高光、主体层次和噪声关系没有改善。",
      stageIds: ["capture", "compute"]
    },
    light: {
      label: "光线与形体",
      hypothesis: "问题更可能来自光线方向、软硬或亮度关系，而不是缺少后期参数。",
      immediate: "保持主体和构图不变，只改变光线方向或拍摄时间，比较正面光、侧光与逆光对形体和情绪的影响。",
      criterion: "主体与背景的亮度关系更清楚，形体有层次，最亮区域服务主题。",
      failure: "增加全局对比后画面更硬，但主体仍没有清晰的光线结构。",
      stageIds: ["capture", "visual"]
    },
    color: {
      label: "色彩层级",
      hypothesis: "白平衡、主色关系或局部饱和度可能在争夺注意力。",
      immediate: "先校正中性参照和肤色，再只保留一个主色关系；逐个关闭局部色彩调整检查必要性。",
      criterion: "主体色稳定，背景不抢戏，冷暖与饱和度变化能够解释而不是只追求更艳。",
      failure: "所有颜色一起增强，画面更鲜艳但视觉重点更分散。",
      stageIds: ["visual", "compute", "edit"]
    },
    sharpness: {
      label: "清晰度与运动控制",
      hypothesis: "主体关键边缘可能受到对焦、快门、机震、降噪或锐化的共同影响。",
      immediate: "同一场景固定构图，分别改变快门或对焦策略，保留原始文件并在最终输出尺寸比较关键边缘。",
      criterion: "主体关键部位清楚，背景细节不过度竞争，没有明显锐化光晕或塑料感。",
      failure: "锐化数值增加，但真实细节没有增加，边缘出现光晕或噪点更突出。",
      stageIds: ["capture", "compute"]
    },
    composition: {
      label: "主体与画面组织",
      hypothesis: "主体意图和视觉重量可能没有对齐，边缘干扰或空间关系正在削弱表达。",
      immediate: "不改变焦段，先移动一步清理四条边，再拍中央、三分与留白三个版本，只比较第一眼落点。",
      criterion: "观众第一眼能找到主体，最亮、最锐、最大或最饱和的位置服务同一意图。",
      failure: "套用了构图规则，但主体、背景和画面边缘仍在争夺注意力。",
      stageIds: ["intent", "visual"]
    },
    compute: {
      label: "计算成像管线",
      hypothesis: "结果可能由多帧合成、HDR tone mapping、降噪或设备端锐化决定，单看一个参数无法解释。",
      immediate: "固定场景，分别拍普通 JPEG、HDR/夜景和 RAW；只比较高光、暗部噪声、运动鬼影和局部对比。",
      criterion: "能够指出每种模式保留和牺牲了什么，并根据场景运动和动态范围选择模式。",
      failure: "只比较整体亮度或观感，没有定位到捕获、合成、映射或输出阶段。",
      stageIds: ["capture", "compute"]
    },
    post: {
      label: "后期动作与表达目的",
      hypothesis: "调整顺序或局部动作可能没有对应明确的画面问题。",
      immediate: "回到基础校正版本，按白平衡、整体影调、主色、局部塑形、细节、输出逐层开启，每层写一句目的。",
      criterion: "每个局部调整都能说明解决了什么，关闭后能够看出具体退化，最终尺寸没有技术瑕疵。",
      failure: "堆叠预设和局部效果后风格更强，但主题、肤色或空间关系变得不稳定。",
      stageIds: ["compute", "edit", "deliver"]
    },
    delivery: {
      label: "输出、版权与交付",
      hypothesis: "最终用途、色彩空间、尺寸、元数据或权利边界可能没有被明确，导致成片无法稳定交付。",
      immediate: "先写下唯一交付目标和平台规范，从高质量母版只导出一个对应版本，并逐项核对尺寸、色彩空间、压缩、元数据和权利状态。",
      criterion: "文件符合目标平台或打印规范，颜色与细节在目标介质可接受，署名、授权和编辑披露完整。",
      failure: "同一文件被直接用于所有平台，出现偏色、尺寸不符、过度压缩、元数据缺失或权利不清。",
      stageIds: ["edit", "deliver"]
    },
    learning: {
      label: "判断力训练",
      hypothesis: "当前瓶颈可能不是知识数量，而是缺少可比较练习、证据记录和间隔复习。",
      immediate: "选择一个能力簇，用一次单变量练习形成 before/after，再写下判断、证据和下一次复习日期。",
      criterion: "能在新场景独立解释取舍，并用照片或参数证据证明，而不是复述术语。",
      failure: "继续收藏教程，但没有作品对照、复盘记录或迁移到新场景的证据。",
      stageIds: ["intent", "edit"]
    },
    intent: {
      label: "创作意图",
      hypothesis: "在选择参数、构图或风格前，尚未明确希望观众先看到什么、感到什么。",
      immediate: "先用一句话写下主体、希望观众的第一感受和输出用途，再决定一个最值得改变的变量。",
      criterion: "拍摄和后期选择都能回到同一句意图，删掉一个元素后主题反而更清楚。",
      failure: "技术上更完整，但无法解释为什么这样拍、这样修或这样选片。",
      stageIds: ["intent", "visual"]
    }
  };

  const BOTTLENECK_SIGNALS = {
    exposure: ["曝光", "测光", "过曝", "欠曝", "高光", "暗部", "动态范围", "直方图", "死白", "死黑"],
    light: ["光线", "自然光", "窗边", "逆光", "侧光", "硬光", "软光", "阴天", "窗光", "闪光", "反光", "布光", "混合光"],
    color: ["色彩", "调色", "白平衡", "色温", "肤色", "饱和", "冷暖", "偏黄", "偏绿", "色偏", "主色"],
    sharpness: ["对焦", "清晰", "锐化", "模糊", "快门", "机震", "拖影", "运动", "虚焦", "防抖"],
    composition: ["构图", "主体", "背景", "边缘", "层次", "空间", "画面乱", "视觉", "机位", "透视", "视差", "垂直线", "遮挡"],
    compute: ["计算摄影", "hdr", "夜景", "多帧", "raw", "降噪", "超分", "传感器", "算法", "鬼影", "tone mapping", "增益图"],
    post: ["后期", "lightroom", "photoshop", "acr", "蒙版", "曲线", "修图", "预设", "图层", "局部调整", "目录"],
    delivery: ["导出", "打印", "软打样", "色彩管理", "色彩空间", "交付", "版权", "授权", "元数据", "署名", "图库", "stock", "比赛规则"],
    learning: ["学习", "课程", "知识", "练习", "计划", "入门", "进阶", "掌握", "复习", "收藏教程", "没有进步"],
    intent: ["主题", "意图", "表达", "情绪", "观众", "用途", "为什么拍", "纪实", "真实", "伦理", "合成", "ai 修改", "移除人物"]
  };

  const MODE_BOTTLENECK_PRIORS = {
    critique: { composition: 2, intent: 1 },
    plan: { intent: 2, light: 1, composition: 1 },
    post: { post: 4, color: 1, delivery: 1 },
    compute: { compute: 5, exposure: 1 },
    learn: { learning: 6 }
  };

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function tokenize(value) {
    const text = normalize(value);
    const terms = new Set(text.match(/[a-z0-9+#]+/g) || []);
    Object.values(STAGE_RULES).flat().forEach((term) => {
      if (text.includes(term)) terms.add(term);
    });
    const chinese = text.replace(/[^\u4e00-\u9fff]/g, "");
    for (let index = 0; index < chinese.length - 1; index += 1) terms.add(chinese.slice(index, index + 2));
    for (let index = 0; index < chinese.length - 2; index += 1) terms.add(chinese.slice(index, index + 3));
    return [...terms].filter((term) => term.length > 1);
  }

  function sourceClass(source = {}) {
    const type = normalize(source.type);
    if (type.includes("local-library-synthesis")) return "local-synthesis";
    if (type.includes("local user") || type.includes("user notes")) return "user-notes";
    if (type.includes("restricted")) return "restricted-index";
    if (/(research|paper|official|specification|dataset|course)/.test(type)) return "primary";
    return "curated";
  }

  function sourceWeight(kind) {
    return ({ primary: 4, curated: 2, "local-synthesis": 1, "user-notes": 0, "restricted-index": 0 })[kind] || 0;
  }

  function cardText(card) {
    return normalize([
      card.title,
      card.domain,
      card.level,
      ...(card.tags || []),
      card.summary,
      card.mentorUse,
      card.practice,
      ...(card.questions || [])
    ].join(" "));
  }

  function routeQuery(query, options, stageById, clusters) {
    const text = normalize([query, options.genre === "auto" ? "" : options.genre].join(" "));
    const scores = Object.fromEntries([...stageById.keys()].map((id) => [id, 0]));
    (MODE_STAGES[options.mode] || []).forEach((id, index) => {
      if (id in scores) scores[id] += 8 - index;
    });
    (options.preferredStageIds || []).forEach((id) => {
      if (id in scores) scores[id] += 3;
    });
    Object.entries(STAGE_RULES).forEach(([stageId, terms]) => {
      terms.forEach((term) => {
        if (text.includes(term)) scores[stageId] = (scores[stageId] || 0) + 7;
      });
    });
    const activeStages = Object.entries(scores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, score]) => ({ id, title: stageById.get(id)?.title || id, score }));
    const tokens = tokenize(text);
    const activeClusters = clusters
      .map((cluster) => {
        const haystack = normalize([cluster.title, cluster.summary, ...(cluster.principles || [])].join(" "));
        const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0) + (activeStages.some((stage) => stage.id === cluster.stageId) ? 2 : 0);
        return { id: cluster.id, title: cluster.title, stageId: cluster.stageId, score };
      })
      .filter((cluster) => cluster.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    return {
      mode: options.mode || "critique",
      modeLabel: MODE_LABELS[options.mode] || "摄影指导",
      tokens,
      activeStages,
      activeClusters
    };
  }

  function missingEvidence(query, mode, context = {}) {
    const text = normalize(query);
    const missing = [];
    if (!/(主题|意图|想表达|情绪|感觉|用途|发布|打印|比赛|商业)/.test(text)) missing.push("希望观众先看到什么，以及最终用途");
    if (!context.imageAnalysis && mode === "critique") missing.push("照片像素或可核对的画面描述");
    if (!/(光|逆光|侧光|晴|阴|雨|夜|日出|日落|窗|室内|室外)/.test(text) && ["critique", "plan"].includes(mode)) missing.push("光线方向、时间与环境条件");
    if (!/(相机|手机|镜头|焦段|raw|jpeg|设备|器材)/i.test(text) && ["plan", "compute"].includes(mode)) missing.push("设备、格式与拍摄模式");
    if (!/(lightroom|photoshop|acr|后期|调色|曲线|蒙版|导出|调整)/i.test(text) && mode === "post") missing.push("当前软件、已做动作与输出尺寸");
    return unique(missing).slice(0, 3);
  }

  function chooseBottleneck(query, mode, context = {}) {
    const diagnostic = [...(context.diagnostics || [])]
      .filter((item) => BOTTLENECKS[item.type])
      .sort((a, b) => Number(b.severity || 0) - Number(a.severity || 0))[0];
    if (diagnostic) {
      return {
        type: diagnostic.type,
        ...BOTTLENECKS[diagnostic.type],
        why: diagnostic.detail || BOTTLENECKS[diagnostic.type].hypothesis,
        matchedSignals: [diagnostic.title || diagnostic.type],
        signalScore: 20 + Number(diagnostic.severity || 0),
        evidenceBasis: "browser-diagnostic"
      };
    }
    const text = normalize(query);
    const priors = MODE_BOTTLENECK_PRIORS[mode] || {};
    const ranked = Object.entries(BOTTLENECK_SIGNALS).map(([type, signals], order) => {
      const matchedSignals = signals.filter((signal) => text.includes(signal));
      const explicitScore = matchedSignals.reduce((total, signal) => total + Math.min(7, Math.max(3, signal.length + 1)), 0);
      return { type, order, matchedSignals, score: explicitScore + Number(priors[type] || 0) };
    }).sort((a, b) => b.score - a.score || b.matchedSignals.length - a.matchedSignals.length || a.order - b.order);
    const fallbackType = mode === "learn" ? "learning" : mode === "compute" ? "compute" : mode === "post" ? "post" : "intent";
    const winner = ranked[0]?.score > 0 ? ranked[0] : { type: fallbackType, matchedSignals: [], score: 0 };
    const bottleneck = BOTTLENECKS[winner.type];
    const signalReason = winner.matchedSignals.length ? `用户描述中的“${winner.matchedSignals.slice(0, 4).join("、")}”首先指向这个瓶颈。` : "当前没有足够的显式问题信号，先从任务目的开始验证。";
    return {
      type: winner.type,
      ...bottleneck,
      why: `${signalReason}${bottleneck.hypothesis}`,
      matchedSignals: winner.matchedSignals,
      signalScore: winner.score,
      evidenceBasis: winner.matchedSignals.length ? "user-description" : "mode-prior",
      alternatives: ranked.slice(1, 3).filter((item) => item.score > 0).map((item) => ({ type: item.type, label: BOTTLENECKS[item.type].label, score: item.score }))
    };
  }

  function formatPercent(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? `${Math.round(number * 100)}%` : null;
  }

  function buildFacts(query, options, context, bottleneck) {
    const facts = [];
    if (query) facts.push(`用户任务：${query}`);
    facts.push(`任务类型：${MODE_LABELS[options.mode] || "摄影指导"}`);
    if (options.genre && options.genre !== "auto") facts.push(`题材：${options.genre}`);
    if (context.profile) facts.push(`学习档案：${context.profile}`);
    if (context.diagnostics?.length) facts.push(`浏览器诊断：${context.diagnostics.map((item) => item.title).join("、")}`);
    (context.extraFacts || [])
      .filter((fact) => fact && !/未读取|未知|不可用/.test(String(fact)))
      .forEach((fact) => facts.push(String(fact)));
    const analysis = context.imageAnalysis;
    if (analysis) {
      const metrics = [
        ["亮度", analysis.brightness],
        ["对比", analysis.contrast],
        ["饱和", analysis.saturation],
        ["清晰", analysis.sharpness],
        ["高光裁切", analysis.clippedHighlights],
        ["暗部裁切", analysis.clippedShadows]
      ].map(([label, value]) => {
        const formatted = formatPercent(value);
        return formatted ? `${label} ${formatted}` : null;
      }).filter(Boolean);
      if (metrics.length) facts.push(`本地像素指标：${metrics.join("；")}`);
    }
    const assumptions = [];
    if (!analysis) assumptions.push("待验证假设：没有像素证据，关于画面的判断只基于文字描述。");
    assumptions.push(`待验证假设：“${bottleneck.label}”是当前第一瓶颈，需要通过单变量练习验证，不是审美定论。`);
    return { facts, assumptions };
  }

  function assessConfidence(query, options, context, unknowns, bottleneck, retrievalQuality) {
    const text = normalize(query);
    const reasons = [];
    let score = 0.2;
    if (context.imageAnalysis) {
      score += 0.25;
      reasons.push("有本地图像像素指标");
    }
    if (context.diagnostics?.some((item) => BOTTLENECKS[item.type])) {
      score += 0.15;
      reasons.push("有可解释的浏览器诊断");
    }
    if (bottleneck.matchedSignals?.length) {
      score += Math.min(0.14, bottleneck.matchedSignals.length * 0.04);
      reasons.push(`任务描述命中 ${bottleneck.matchedSignals.length} 个瓶颈信号`);
    }
    if (/(主题|意图|想表达|情绪|感觉|用途|发布|打印|比赛|商业)/.test(text)) {
      score += 0.08;
      reasons.push("创作意图或用途明确");
    }
    if (/(相机|手机|镜头|焦段|raw|jpeg|设备|器材)/i.test(text)) {
      score += 0.06;
      reasons.push("设备或格式信息明确");
    }
    if (/(光|逆光|侧光|晴|阴|雨|夜|日出|日落|窗|室内|室外)/.test(text)) {
      score += 0.05;
      reasons.push("现场光线或环境明确");
    }
    if ((context.extraFacts || []).filter((fact) => fact && !/未读取|未知|不可用/.test(String(fact))).length) {
      score += 0.04;
      reasons.push("有附加事实或 EXIF");
    }
    if (retrievalQuality.cards >= 4 && retrievalQuality.citationCoverage === 1) {
      score += 0.06;
      reasons.push("知识引用覆盖完整");
    }
    if (retrievalQuality.primarySources >= 1) {
      score += 0.04;
      reasons.push("包含一手或官方来源");
    }
    score -= unknowns.length * 0.07;
    score = Math.max(0.1, Math.min(0.95, score));
    const level = score >= 0.72 ? "high" : score >= 0.48 ? "medium" : "low";
    const missingReason = unknowns.length ? `仍缺 ${unknowns.length} 类关键证据` : "关键输入足以开始验证";
    const label = ({ high: "较高", medium: "中等", low: "有限" })[level];
    return {
      level,
      score,
      reasons,
      label: `${label} · ${Math.round(score * 100)}%：${reasons.slice(0, 2).join("；") || missingReason}${unknowns.length ? `；${missingReason}` : ""}`
    };
  }

  function create({ knowledge = {}, taxonomy = {} } = {}) {
    const sources = unique((knowledge.sources || []).map((source) => source.id)).map((id) => (knowledge.sources || []).find((source) => source.id === id));
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    const cards = unique((knowledge.cards || []).map((card) => card.id)).map((id) => (knowledge.cards || []).find((card) => card.id === id));
    const stages = taxonomy.stages || [];
    const stageById = new Map(stages.map((stage) => [stage.id, stage]));
    const clusters = stages.flatMap((stage) => (stage.clusters || []).map((cluster) => ({ ...cluster, stageId: stage.id, stageTitle: stage.title })));
    const clusterById = new Map(clusters.map((cluster) => [cluster.id, cluster]));
    const cardClusters = new Map();
    clusters.forEach((cluster) => {
      (cluster.cardIds || []).forEach((cardId) => {
        if (!cardClusters.has(cardId)) cardClusters.set(cardId, new Set());
        cardClusters.get(cardId).add(cluster.id);
      });
    });
    cards.forEach((card) => {
      (card.clusterIds || []).forEach((clusterId) => {
        if (!clusterById.has(clusterId)) return;
        if (!cardClusters.has(card.id)) cardClusters.set(card.id, new Set());
        cardClusters.get(card.id).add(clusterId);
      });
    });

    function enrichedCard(card) {
      const clusterIds = [...(cardClusters.get(card.id) || [])];
      const stageIds = unique(clusterIds.map((id) => clusterById.get(id)?.stageId));
      const sourceKinds = unique((card.sourceIds || []).map((id) => sourceClass(sourceById.get(id))));
      return { ...card, clusterIds, stageIds, sourceKinds };
    }

    function scoreCard(card, query, options, route) {
      const text = cardText(card);
      const title = normalize(card.title);
      const tags = (card.tags || []).map(normalize);
      const matchedTokens = [];
      let score = 0;
      route.tokens.forEach((token) => {
        let tokenScore = 0;
        if (title.includes(token)) tokenScore += 9;
        if (tags.some((tag) => tag === token)) tokenScore += 8;
        else if (tags.some((tag) => tag.includes(token))) tokenScore += 4;
        if (text.includes(token)) tokenScore += token.length > 3 ? 4 : 2;
        if (tokenScore) matchedTokens.push(token);
        score += tokenScore;
      });
      const stageIds = card.stageIds || [];
      const matchedStages = route.activeStages.filter((stage) => stageIds.includes(stage.id));
      score += matchedStages.reduce((total, stage) => total + Math.min(12, stage.score), 0);
      if ((MODE_DOMAINS[options.mode] || []).includes(card.domain)) score += 7;
      if (options.domain && options.domain !== "all" && card.domain === options.domain) score += 18;
      if (options.genre && options.genre !== "auto" && text.includes(normalize(options.genre))) score += 10;
      if (/本机|书籍|资料|教材/.test(normalize(query)) && card.sourceKinds.includes("local-synthesis")) score += 18;
      score += Math.max(0, ...(card.sourceKinds || []).map(sourceWeight));
      return {
        ...card,
        score,
        matchedTokens: unique(matchedTokens).slice(0, 5),
        matchedStages: matchedStages.map((stage) => stage.title),
        retrievalReasons: unique([
          matchedTokens.length ? `关键词：${unique(matchedTokens).slice(0, 4).join("、")}` : "",
          matchedStages.length ? `能力阶段：${matchedStages.map((stage) => stage.title).join("、")}` : "",
          (MODE_DOMAINS[options.mode] || []).includes(card.domain) ? `适配${MODE_LABELS[options.mode] || "当前"}任务` : "",
          card.sourceKinds.includes("local-synthesis") ? "本机资料主题总结" : ""
        ])
      };
    }

    function retrieve(query, options = {}) {
      const settings = { limit: 6, mode: "critique", genre: "auto", domain: "all", ...options };
      const route = routeQuery(query, settings, stageById, clusters);
      const candidates = cards
        .filter((card) => settings.domain === "all" || !settings.domain || card.domain === settings.domain)
        .map(enrichedCard)
        .map((card) => scoreCard(card, query, settings, route))
        .filter((card) => card.score > 0 || !normalize(query))
        .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh-CN"));

      const selected = [];
      const selectedIds = new Set();
      const domainCounts = new Map();
      const sourceCounts = new Map();
      const localLimit = settings.localOnly ? settings.limit : Math.max(1, Math.floor(settings.limit / 3));
      while (selected.length < settings.limit && selectedIds.size < candidates.length) {
        const selectedLocal = selected.filter((card) => card.sourceKinds.includes("local-synthesis")).length;
        const next = candidates
          .filter((card) => !selectedIds.has(card.id))
          .filter((card) => !card.sourceKinds.includes("local-synthesis") || selectedLocal < localLimit)
          .map((card) => {
            const domainPenalty = (domainCounts.get(card.domain) || 0) * 3;
            const sourcePenalty = (card.sourceIds || []).reduce((total, id) => total + (sourceCounts.get(id) || 0) * 2, 0);
            return { card, adjusted: card.score - domainPenalty - sourcePenalty };
          })
          .sort((a, b) => b.adjusted - a.adjusted || b.card.score - a.card.score)[0];
        if (!next) break;
        selected.push(next.card);
        selectedIds.add(next.card.id);
        domainCounts.set(next.card.domain, (domainCounts.get(next.card.domain) || 0) + 1);
        (next.card.sourceIds || []).forEach((id) => sourceCounts.set(id, (sourceCounts.get(id) || 0) + 1));
      }

      const localCandidate = candidates.find((card) => card.sourceKinds.includes("local-synthesis") && card.score >= Math.max(8, (candidates[0]?.score || 0) * 0.45));
      if (localCandidate && !selected.some((card) => card.sourceKinds.includes("local-synthesis")) && selected.length >= 3) {
        selected[selected.length - 1] = localCandidate;
      }
      const primaryCandidate = candidates.find((card) => card.sourceKinds.includes("primary") && !selected.some((item) => item.id === card.id) && card.score >= Math.max(8, (candidates[0]?.score || 0) * 0.35));
      if (primaryCandidate && !selected.some((card) => card.sourceKinds.includes("primary")) && selected.length >= 3) {
        const replaceIndex = [...selected].map((card, index) => ({ card, index })).reverse().find(({ card }) => !card.sourceKinds.includes("local-synthesis"))?.index ?? selected.length - 1;
        selected[replaceIndex] = primaryCandidate;
      }
      return selected.slice(0, settings.limit);
    }

    function advise(input = {}) {
      const query = String(input.query || "").trim();
      const options = { mode: input.mode || "critique", genre: input.genre || "auto", domain: input.domain || "all", limit: input.limit || 6 };
      const context = input.context || {};
      const bottleneck = chooseBottleneck(query, options.mode, context);
      const routeOptions = { ...options, preferredStageIds: bottleneck.stageIds };
      const route = routeQuery(query, routeOptions, stageById, clusters);
      const queryWithEvidence = [query, context.diagnostics?.map((item) => `${item.type} ${item.title} ${item.detail}`).join(" "), bottleneck.label].filter(Boolean).join(" ");
      const retrieved = retrieve(queryWithEvidence, routeOptions);
      const unknowns = missingEvidence(query, options.mode, context);
      const evidence = buildFacts(query, options, context, bottleneck);
      const sourceIds = unique(retrieved.flatMap((card) => card.sourceIds || []));
      const sourceSummary = sourceIds.map((id) => sourceById.get(id)).filter(Boolean).map((source) => ({ ...source, kind: sourceClass(source) }));
      const primarySources = sourceSummary.filter((source) => source.kind === "primary").length;
      const localSources = sourceSummary.filter((source) => source.kind === "local-synthesis").length;
      const stageCoverage = unique(retrieved.flatMap((card) => card.stageIds || []));
      const retrievalQuality = {
        cards: retrieved.length,
        sources: sourceSummary.length,
        primarySources,
        localSources,
        stageCoverage,
        citationCoverage: retrieved.length ? retrieved.filter((card) => card.sourceIds?.length).length / retrieved.length : 0
      };
      const confidence = assessConfidence(query, options, context, unknowns, bottleneck, retrievalQuality);
      const practices = unique(retrieved.map((card) => card.practice)).slice(0, 2);
      const questions = unique(retrieved.flatMap((card) => card.questions || [])).slice(0, 4);
      const plan = {
        version: VERSION,
        query,
        mode: options.mode,
        modeLabel: MODE_LABELS[options.mode] || "摄影指导",
        route,
        evidence: { ...evidence, unknowns },
        decision: {
          ...bottleneck,
          confidence: confidence.level,
          confidenceScore: confidence.score,
          confidenceReasons: confidence.reasons,
          confidenceLabel: confidence.label
        },
        knowledge: retrieved,
        actions: {
          immediate: bottleneck.immediate,
          practice: practices.length ? practices : ["完成一次单变量 before/after 练习，并记录取舍。"],
          questions
        },
        verification: {
          success: bottleneck.criterion,
          failure: bottleneck.failure,
          nextEvidence: context.imageAnalysis ? "保留修改前后版本和本地指标，结合创作意图解释变化。" : "补充照片或同场景 before/after，再检查当前假设是否成立。"
        },
        retrievalQuality
      };
      plan.markdown = toMarkdown(plan, sourceById);
      return plan;
    }

    return {
      version: VERSION,
      cards,
      sources,
      clusters,
      sourceById,
      clusterById,
      retrieve,
      advise,
      route(query, options = {}) {
        return routeQuery(query, { mode: "critique", genre: "auto", ...options }, stageById, clusters);
      },
      cardsForCluster(clusterId, limit = 6) {
        return cards.map(enrichedCard).filter((card) => card.clusterIds.includes(clusterId)).slice(0, limit);
      }
    };
  }

  function sourceMarkdown(card, sourceById) {
    return (card.sourceIds || []).map((id) => sourceById.get(id)).filter(Boolean).map((source) => {
      const url = String(source.url || "");
      return /^https?:/i.test(url) ? `[${source.title}](${url})` : `${source.title}（本地总结）`;
    }).join("；");
  }

  function toMarkdown(plan, sourceById) {
    const facts = plan.evidence.facts.map((item) => `- ${item}`).join("\n");
    const assumptions = plan.evidence.assumptions.map((item) => `- ${item.trim()}`).join("\n");
    const unknowns = plan.evidence.unknowns.length ? plan.evidence.unknowns.map((item) => `- ${item}`).join("\n") : "- 当前信息足以开始第一轮验证。";
    const knowledge = plan.knowledge.map((card, index) => {
      const reasons = card.retrievalReasons?.length ? `\n   命中原因：${card.retrievalReasons.join("；")}` : "";
      return `${index + 1}. **${card.title}**：${card.summary}${reasons}\n   来源：${sourceMarkdown(card, sourceById) || "未标注来源"}`;
    }).join("\n");
    const practices = plan.actions.practice.map((item, index) => `${index + 1}. ${item}`).join("\n");
    const questions = plan.actions.questions.length ? plan.actions.questions.map((item, index) => `${index + 1}. ${item}`).join("\n") : "1. 这次改变是否真的服务创作意图？";
    const stages = plan.route.activeStages.map((stage) => stage.title).join(" → ") || "按当前问题动态路由";
    return `# Photography Mentor 决策单

## 1. 任务定义
- 类型：${plan.modeLabel}
- 知识路径：${stages}
- 原则：一次只验证一个主要判断，不把审美偏好伪装成事实。

## 2. 证据账本
已知事实：
${facts}

当前推断：
${assumptions}

仍未知：
${unknowns}

## 3. 第一瓶颈
- **${plan.decision.label}**
- 为什么：${plan.decision.why}
- 置信度：${plan.decision.confidenceLabel}

## 4. 知识依据
${knowledge || "没有检索到足够相关的知识块。请补充更具体的信息。"}

检索审计：${plan.retrievalQuality.cards} 个知识块 / ${plan.retrievalQuality.sources} 个来源 / ${plan.retrievalQuality.primarySources} 个一手或官方来源 / ${plan.retrievalQuality.localSources} 个本机资料总结。

## 5. 单变量动作
1. ${plan.actions.immediate}

延伸练习：
${practices}

## 6. 验证标准
- 成功：${plan.verification.success}
- 失败信号：${plan.verification.failure}
- 下一份证据：${plan.verification.nextEvidence}

## 7. 复盘问题
${questions}

## 使用边界
- 没有照片证据时，所有画面判断都只是待验证假设。
- 本机书籍只使用主题级总结，不包含原文、文件名或本机路径。
- 纪实、比赛、商业交付与个人创作的后期尺度不同，涉及合成或 AI 修改时必须说明。`;
  }

  global.PHOTOGRAPHY_MENTOR_CORE = { VERSION, version: VERSION, create };
})(window);
