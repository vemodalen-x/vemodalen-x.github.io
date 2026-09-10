(function attachPhotographyCommercialEngine(global) {
  "use strict";

  const MB = 1024 * 1024;
  const PLATFORM_URLS = {
    adobeStock: "https://contributor.stock.adobe.com/",
    shutterstock: "https://submit.shutterstock.com/",
    alamy: "https://www.alamy.com/contributor/",
    wirestock: "https://wirestock.io/creators/sell-photos-online",
    fiveHundredPx: "https://support.500px.com/hc/en-us/articles/204728147-500px-Licensing-Contributor-FAQ",
    eyeEm: "https://www.eyeem.com/signup/creator"
  };

  const PLATFORMS = [
    {
      id: "adobe-stock",
      name: "Adobe Stock",
      url: PLATFORM_URLS.adobeStock,
      state: "ready",
      summary: "适合 4MP–100MP 的 JPEG 素材；需要标题、5–50 个关键词和必要的 release。",
      source: "https://helpx.adobe.com/stock/contributor/submit-your-content/submit-photos/technical-legal-requirements-photo-submission.html"
    },
    {
      id: "shutterstock",
      name: "Shutterstock",
      url: PLATFORM_URLS.shutterstock,
      state: "ready",
      summary: "适合 ≥4MP 的 JPEG/TIFF；需要 7–50 个英文关键词和至少一个分类。",
      source: "https://submit.shutterstock.com/help/en/articles/10617495-how-do-i-submit-photos-for-review"
    },
    {
      id: "alamy",
      name: "Alamy",
      url: PLATFORM_URLS.alamy,
      state: "ready",
      summary: "适合真实摄影、旅行、建筑和编辑类素材；首批投稿有质量审核和相机元数据要求。",
      source: "https://www.alamy.com/help/contributor-image-sales-guide/"
    },
    {
      id: "wirestock",
      name: "Wirestock",
      url: PLATFORM_URLS.wirestock,
      state: "review",
      summary: "可作为授权与项目入口，但 2026 年已从旧的多平台分发模式调整为项目/授权工作流，提交前必须看当前条款。",
      source: "https://wirestock.io/blog/whats-changing-on-wirestock-a-guide-for-creators"
    },
    {
      id: "500px",
      name: "500px Licensing",
      url: PLATFORM_URLS.fiveHundredPx,
      state: "review",
      summary: "偏编辑审核和授权分发；需核对 release、品牌/IP 和 AI 编辑限制。",
      source: "https://support.500px.com/hc/en-us/articles/204728147-500px-Licensing-Contributor-FAQ"
    },
    {
      id: "eyeem",
      name: "EyeEm",
      url: PLATFORM_URLS.eyeEm,
      state: "paused",
      summary: "保留为历史平台核查项；当前不默认加入投稿队列，请先确认服务和创作者入口仍可用。",
      source: "https://www.eyeem.com/signup/creator"
    }
  ];

  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, Number.isFinite(Number(value)) ? Number(value) : min));
  }

  function numeric(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function imageExtension(name = "") {
    return String(name).toLowerCase().split(".").pop() || "";
  }

  function isJpeg(asset) {
    return String(asset.type || "").toLowerCase() === "image/jpeg" || ["jpg", "jpeg"].includes(imageExtension(asset.name));
  }

  function isTiff(asset) {
    return String(asset.type || "").toLowerCase().includes("tiff") || ["tif", "tiff"].includes(imageExtension(asset.name));
  }

  function megapixels(asset) {
    const metrics = asset.metrics || asset;
    const supplied = numeric(metrics.megapixels, 0);
    if (supplied > 0) return supplied;
    const width = numeric(metrics.width, 0);
    const height = numeric(metrics.height, 0);
    return width > 0 && height > 0 ? (width * height) / 1000000 : 0;
  }

  function pushFlag(flags, code, label, detail, severity = "review") {
    flags.push({ code, label, detail, severity });
  }

  function baseRightsState(context) {
    const noPeople = Boolean(context.noPeopleConfirmed);
    const rightsStatus = context.rightsStatus || "unclear";
    const brandRisk = Boolean(context.brandRisk);
    const propertyRisk = Boolean(context.propertyRisk);
    const rightsReady = noPeople && ["owned", "permission"].includes(rightsStatus) && !brandRisk && !propertyRisk;
    return { noPeople, rightsStatus, brandRisk, propertyRisk, rightsReady };
  }

  function qualityScore(asset) {
    const metrics = asset.metrics || asset;
    const mp = megapixels(asset);
    const resolution = mp >= 4 ? 1 : clamp(mp / 4);
    const sharpness = clamp(metrics.sharpness, 0.45);
    const brightness = clamp(metrics.brightness, 0.5);
    const exposure = 1 - clamp(Math.abs(brightness - 0.5) * 1.55 + numeric(metrics.clippedHighlights) * 1.2 + numeric(metrics.clippedShadows) * 0.7);
    const contrast = clamp(metrics.contrast, 0.45);
    return Math.round(clamp(resolution * 0.38 + sharpness * 0.26 + exposure * 0.22 + contrast * 0.14) * 100);
  }

  function evaluateAsset(asset, context = {}) {
    const metrics = asset.metrics || asset;
    const flags = [];
    const mp = megapixels(asset);
    const size = numeric(asset.size, 0);
    const rights = baseRightsState(context);
    const score = qualityScore(asset);

    if (asset.loadError) pushFlag(flags, "decode-failed", "浏览器无法读取", "无法从当前浏览器解码该文件，先转成平台支持的 JPEG 或 TIFF。", "hold");
    if (!mp) pushFlag(flags, "missing-dimensions", "尺寸未读取", "无法确认平台最低分辨率，先打开图片并重新分析。", "hold");
    if (mp > 0 && mp < 4) pushFlag(flags, "low-resolution", "低于 4MP", `${mp.toFixed(2)}MP，Adobe Stock 和 Shutterstock 的照片入口通常要求至少 4MP。`, "hold");
    if (size > 45 * MB) pushFlag(flags, "large-file", "文件偏大", `${(size / MB).toFixed(1)}MB，Adobe Stock 的照片上限为 45MB；Shutterstock 也有 50MB 限制。`, "review");
    if (!rights.noPeople) pushFlag(flags, "people-unconfirmed", "未确认无人或有 release", "系统不会替你识别人像；需要人工检查画面，或准备 model release / 改走 editorial。", "hold");
    if (!["owned", "permission"].includes(rights.rightsStatus)) pushFlag(flags, "rights-unconfirmed", "权利状态未确认", "请确认你拥有作品版权，或已经取得可覆盖目标用途的许可。", "hold");
    if (rights.brandRisk) pushFlag(flags, "brand-risk", "可能含商标/品牌", "请裁切、修饰或取得相应许可；不要把平台筛选当作法律判断。", "hold");
    if (rights.propertyRisk) pushFlag(flags, "property-risk", "可能需要 property release", "可识别建筑、艺术品、室内或私人场所可能需要 property release。", "review");
    if (numeric(metrics.sharpness) > 0 && numeric(metrics.sharpness) < 0.18) pushFlag(flags, "soft-focus", "清晰度偏低", "关键主体边缘可能不够锐，放大到 100% 检查后再投稿。", "review");
    if (numeric(metrics.clippedHighlights) > 0.08) pushFlag(flags, "highlight-clipping", "高光裁切", "天空、灯牌或白色物体可能缺少可授权使用所需的细节。", "review");
    if (numeric(metrics.brightness) < 0.12 || numeric(metrics.brightness) > 0.9) pushFlag(flags, "extreme-exposure", "曝光极端", "先确认这是有意的视觉表达，而不是素材质量问题。", "review");
    if (context.aiEdited && context.aiGenerated) pushFlag(flags, "ai-generated", "AI 生成", "不要把生成内容放入需要真实摄影来源的平台队列。", "hold");
    if (context.aiEdited && !context.aiGenerated) pushFlag(flags, "ai-edit-review", "AI 编辑需复核", "不同平台对 AI 编辑和新增视觉元素的规则不同，导出前逐个平台核对。", "review");

    const hasHold = flags.some((flag) => flag.severity === "hold");
    const hasReview = flags.some((flag) => flag.severity === "review");
    const status = hasHold ? "hold" : hasReview ? "review" : "candidate";
    const statusLabel = { candidate: "可交付候选", review: "人工复核", hold: "暂缓提交" }[status];
    return {
      ...asset,
      megapixels: Number(mp.toFixed(2)),
      score,
      flags,
      status,
      statusLabel,
      platformFit: PLATFORMS.map((platform) => platformFit(platform, { ...asset, megapixels: mp }, context))
    };
  }

  function platformFit(platform, asset, context = {}) {
    const flags = [];
    const mp = megapixels(asset);
    const size = numeric(asset.size, 0);
    const keywords = normalizeKeywords(context.keywords);
    const rights = baseRightsState(context);
    const readyRights = rights.rightsReady;
    const add = (code, label, severity = "review") => flags.push({ code, label, severity });

    if (platform.id === "adobe-stock") {
      if (!isJpeg(asset)) add("jpeg-required", "优先导出 JPEG", "hold");
      if (mp < 4 || mp > 100) add("mp-range", "需要 4–100MP", "hold");
      if (size > 45 * MB) add("size-limit", "超过 45MB", "hold");
      if (keywords.length < 5) add("keyword-count", "至少 5 个关键词", "review");
      if (!readyRights) add("rights-review", "人工确认商业权利", "review");
    }
    if (platform.id === "shutterstock") {
      if (!(isJpeg(asset) || isTiff(asset))) add("format", "需要 JPEG 或 TIFF", "hold");
      if (mp < 4) add("mp-minimum", "需要至少 4MP", "hold");
      if (size >= 50 * MB) add("size-limit", "需要小于 50MB", "hold");
      if (keywords.length < 7) add("keyword-count", "至少 7 个关键词", "review");
      if (!readyRights) add("rights-review", "人工确认商业权利", "review");
    }
    if (platform.id === "alamy") {
      if (!isJpeg(asset)) add("format", "建议高质量 RGB JPEG", "review");
      if (keywords.length < 5) add("keyword-count", "至少 5 个 tags", "review");
      if (!readyRights) add("rights-review", "商业用途需复核 release", "review");
    }
    if (platform.id === "wirestock") {
      add("workflow-change", "先阅读当前项目与数据授权条款", "review");
    }
    if (platform.id === "500px") {
      if (context.aiGenerated) add("ai-generated", "不适合该平台的真实摄影授权路径", "hold");
      if (context.aiEdited) add("ai-review", "AI 编辑限制需人工复核", "review");
      if (!readyRights) add("rights-review", "人工确认人物、物业和 IP", "review");
    }
    if (platform.id === "eyeem") add("availability", "不默认推荐，先确认入口可用", "hold");

    const hard = flags.some((flag) => flag.severity === "hold");
    return {
      platformId: platform.id,
      state: hard ? "hold" : flags.length ? "review" : "ready",
      flags,
      label: hard ? "暂不匹配" : flags.length ? "需要复核" : "可尝试"
    };
  }

  function normalizeKeywords(value) {
    const values = Array.isArray(value) ? value : String(value || "").split(/[,，\n]+/);
    const seen = new Set();
    return values.map((item) => String(item).trim()).filter((item) => {
      const key = item.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function buildMetadata(asset, context = {}) {
    const keywords = normalizeKeywords(context.keywords);
    const title = String(context.title || "").trim();
    const description = String(context.description || "").trim();
    return {
      filename: String(asset.name || "untitled"),
      title,
      description,
      keywords,
      category: String(context.category || "").trim(),
      location: String(context.location || "").trim(),
      modelRelease: Boolean(context.noPeopleConfirmed) ? "not-required-if-no-recognizable-people" : "manual-review",
      propertyRelease: Boolean(context.propertyRelease),
      rightsStatus: context.rightsStatus || "unclear",
      aiEdited: Boolean(context.aiEdited),
      notes: (asset.flags || []).map((flag) => flag.label).join("; ")
    };
  }

  function buildSubmissionRows(assets, context = {}) {
    return assets.map((asset) => ({
      ...buildMetadata(asset, context),
      status: asset.status || "review",
      score: numeric(asset.score, 0),
      megapixels: numeric(asset.megapixels || megapixels(asset), 0),
      width: numeric(asset.metrics?.width || asset.width, 0),
      height: numeric(asset.metrics?.height || asset.height, 0),
      bytes: numeric(asset.size, 0),
      platformFit: (asset.platformFit || []).map((fit) => `${fit.platformId}:${fit.state}`).join(" | ")
    }));
  }

  function csvCell(value) {
    const text = Array.isArray(value) ? value.join(", ") : String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function buildCsv(rows) {
    const columns = ["filename", "title", "description", "keywords", "category", "location", "status", "score", "megapixels", "width", "height", "bytes", "platformFit", "modelRelease", "propertyRelease", "rightsStatus", "aiEdited", "notes"];
    return [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))].join("\n");
  }

  function buildManifest(assets, context = {}, exportedAt = new Date().toISOString()) {
    return {
      schemaVersion: 1,
      product: "Photography Mentor commercial delivery kit",
      exportedAt,
      privacy: {
        localOnlyAnalysis: true,
        includesPixels: false,
        includesAbsolutePaths: false,
        note: "This manifest contains filenames and derived metrics only. Review rights and platform terms before uploading."
      },
      context: {
        title: String(context.title || "").trim(),
        description: String(context.description || "").trim(),
        category: String(context.category || "").trim(),
        location: String(context.location || "").trim(),
        keywords: normalizeKeywords(context.keywords),
        noPeopleConfirmed: Boolean(context.noPeopleConfirmed),
        rightsStatus: context.rightsStatus || "unclear",
        brandRisk: Boolean(context.brandRisk),
        propertyRisk: Boolean(context.propertyRisk),
        propertyRelease: Boolean(context.propertyRelease),
        aiEdited: Boolean(context.aiEdited),
        aiGenerated: Boolean(context.aiGenerated)
      },
      files: buildSubmissionRows(assets, context)
    };
  }

  global.PHOTOGRAPHY_COMMERCIAL_ENGINE = Object.freeze({
    MB,
    PLATFORMS,
    PLATFORM_URLS,
    normalizeKeywords,
    megapixels,
    evaluateAsset,
    platformFit,
    buildMetadata,
    buildSubmissionRows,
    buildCsv,
    buildManifest
  });
})(typeof window !== "undefined" ? window : globalThis);
