(function () {
  "use strict";

  const index = window.PERSONAL_KB_INDEX || { stats: {}, documents: [] };
  const documents = index.documents || [];
  const coreCards = (window.CORE_METHOD_KB || []).map((card) => ({ ...card, collection: "核心主线" }));
  const methodCards = [
    ...coreCards,
    ...(window.MAO_METHOD_KB || []).map((card) => ({ ...card, collection: "毛选方法论" })),
    ...(window.YITANG_BUSINESS_KB || []).map((card) => ({ ...card, domain: card.domain || "商业方法", collection: "商业决策" })),
    ...(window.LEVELS_INDIE_KB || []).map((card) => ({ ...card, collection: "Levels.io" })),
    ...(window.WAYTOAGI_METHOD_KB || []).map((card) => ({ ...card, collection: "WaytoAGI" })),
    ...(window.LATENT_SPACE_READING_KB || []).map((card) => ({ ...card, collection: "AI 工程论文" })),
    ...(window.AI_ENGINEERING_METHOD_KB || []).map((card) => ({ ...card, collection: "AI 工程实践" }))
  ];
  const reviewStorageKey = "personal-kb-review-v1";
  const reviewSessionStorageKey = "personal-kb-review-session-v1";
  const captureStorageKey = "personal-kb-capture-v1";
  const workflowStorageKey = "personal-kb-workflows-v1";
  const synchronizedKeys = [reviewStorageKey, reviewSessionStorageKey, captureStorageKey, workflowStorageKey];
  const pageSize = 30;
  let visibleCount = pageSize;
  let filteredDocuments = [];
  let reviewState = readJson(reviewStorageKey, {});
  let reviewSettings = normalizeReviewSettings(readJson(reviewSessionStorageKey, {}));
  let reviewQueue = [];
  let reviewSessionTotal = 0;
  let currentReviewCard = null;
  let workflows = readJson(workflowStorageKey, []);
  let workflowEvidence = [];
  let editingWorkflowId = null;
  let previewDocument = null;
  let serverAvailable = false;
  let searchEventTimer = null;
  let lastLoggedQuery = "";
  let selectedCoreMapCardId = coreCards[0]?.id || null;

  const coreMapStages = [
    { id: "direction", order: 1, title: "方向与问题", range: [1, 3], icon: "compass", question: "为什么做，当前真正要解决什么？", outcome: "方向、阶段与主要矛盾对齐。" },
    { id: "evidence", order: 2, title: "调查与证据", range: [4, 7], icon: "scan-search", question: "事实是什么，哪条假设值得验证？", outcome: "建立证据账本和验收标准。" },
    { id: "experiment", order: 3, title: "实验与工程", range: [8, 10], icon: "flask-conical", question: "怎样用最小闭环获得真实结果？", outcome: "跑通任务、工具和权限边界。" },
    { id: "execution", order: 4, title: "执行与决策", range: [11, 12], icon: "circle-check-big", question: "谁负责，何时继续、改变或停止？", outcome: "责任与动态门槛明确。" },
    { id: "growth", order: 5, title: "商业与资产", range: [13, 16], icon: "trending-up", question: "价值如何被购买、理解并持续积累？", outcome: "连接现金、分发、作品与复利资产。" },
    { id: "review", order: 6, title: "复盘与治理", range: [17, 18], icon: "rotate-ccw", question: "结果怎样更新系统，责任由谁承担？", outcome: "方法更新并保留人类责任。" }
  ];

  const coreSourceFamilies = [
    { id: "mao", label: "毛选", needles: ["《"] },
    { id: "yitang", label: "一堂", needles: ["一堂"] },
    { id: "levels", label: "Levels.io", needles: ["Levels.io"] },
    { id: "jeannen", label: "Jeannen", needles: ["Jeannen"] },
    { id: "waytoagi", label: "WaytoAGI", needles: ["WaytoAGI"] },
    { id: "latent", label: "Latent.Space", needles: ["Latent.Space"] },
    { id: "dwarkesh", label: "Dwarkesh", needles: ["Dwarkesh"] },
    { id: "truman", label: "Truman", needles: ["Truman"] }
  ];

  const coreTopicBranches = [
    { icon: "landmark", title: "方法论与决策", meta: "毛选 × 一堂", query: "毛泽东 一堂 方法论 决策", description: "调查、矛盾、阶段、反证和长期取舍。" },
    { icon: "briefcase-business", title: "产品与商业", meta: "64 张专题卡", query: "商业 假设 MVP 付费 分发", description: "需求关口、收费、单位经济、增长和组织资产。" },
    { icon: "bot", title: "AI 学习与工程", meta: "83 项精选入口", query: "AI 提示词 RAG 智能体 私有评测", description: "任务契约、检索、智能体、多模态、微调和治理。" },
    { icon: "messages-square", title: "研究与表达", meta: "访谈 × 内容", query: "Dwarkesh Truman Jeannen 研究 表达", description: "主张溯源、关键分歧、受众、信任和媒体证据。" },
    { icon: "camera", title: "摄影与视觉", meta: "7 阶段 · 22 簇", query: "Photography Mentor 知识整理 Review", source: "current", description: "从意图、捕获与显影走到编辑、作品集和交付。" },
    { icon: "notebook-tabs", title: "个人知识管理", meta: "本地工作流", query: "个人知识库 总地图 知识管理", source: "current", description: "来源、综合、行动、检索、复习和版本维护。" }
  ];

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[character]));
  }

  function safePreviewUrl(value, image = false) {
    try {
      const url = new URL(String(value || "").trim(), window.location.href);
      if (image) {
        if (url.origin !== window.location.origin || !url.pathname.startsWith("/assets/")) return "";
      } else if (!['http:', 'https:'].includes(url.protocol)) {
        return "";
      }
      return url.href;
    } catch (error) {
      return "";
    }
  }

  function appendInlineMarkdown(parent, text) {
    const value = String(text || "");
    const tokenPattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
    let cursor = 0;
    for (const match of value.matchAll(tokenPattern)) {
      if (match.index > cursor) parent.append(document.createTextNode(value.slice(cursor, match.index)));
      const token = match[0];
      if (token.startsWith("`")) {
        const code = document.createElement("code");
        code.textContent = token.slice(1, -1);
        parent.append(code);
      } else if (token.startsWith("**")) {
        const strong = document.createElement("strong");
        strong.textContent = token.slice(2, -2);
        parent.append(strong);
      } else {
        const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        const href = linkMatch ? safePreviewUrl(linkMatch[2]) : "";
        if (linkMatch && href) {
          const link = document.createElement("a");
          link.href = href;
          link.target = "_blank";
          link.rel = "noreferrer";
          link.textContent = linkMatch[1];
          parent.append(link);
        } else {
          parent.append(document.createTextNode(token));
        }
      }
      cursor = match.index + token.length;
    }
    if (cursor < value.length) parent.append(document.createTextNode(value.slice(cursor)));
  }

  function markdownCells(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  }

  function isTableDivider(line) {
    const cells = markdownCells(line);
    return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  }

  function renderPreviewMessage(container, text) {
    container.replaceChildren();
    const message = document.createElement("pre");
    message.className = "pkm-preview-message";
    message.textContent = text;
    container.append(message);
  }

  function renderMarkdownPreview(container, markdown) {
    container.replaceChildren();
    let lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    if (lines[0]?.trim() === "---") {
      const frontmatterEnd = lines.slice(1).findIndex((line) => line.trim() === "---");
      if (frontmatterEnd >= 0) lines = lines.slice(frontmatterEnd + 2);
    }

    let index = 0;
    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }

      const fence = line.match(/^```\s*([^\s]*)/);
      if (fence) {
        const codeLines = [];
        index += 1;
        while (index < lines.length && !lines[index].startsWith("```")) codeLines.push(lines[index++]);
        if (index < lines.length) index += 1;
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        if (fence[1]) code.dataset.language = fence[1];
        code.textContent = codeLines.join("\n");
        pre.append(code);
        container.append(pre);
        continue;
      }

      const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        const source = safePreviewUrl(imageMatch[2], true);
        if (source) {
          const figure = document.createElement("figure");
          const image = document.createElement("img");
          image.src = source;
          image.alt = imageMatch[1] || "笔记图片";
          image.loading = "lazy";
          figure.append(image);
          if (imageMatch[1]) {
            const caption = document.createElement("figcaption");
            caption.textContent = imageMatch[1];
            figure.append(caption);
          }
          container.append(figure);
        }
        index += 1;
        continue;
      }

      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const heading = document.createElement(`h${headingMatch[1].length}`);
        appendInlineMarkdown(heading, headingMatch[2]);
        container.append(heading);
        index += 1;
        continue;
      }

      if (line.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
        const table = document.createElement("table");
        const head = document.createElement("thead");
        const headRow = document.createElement("tr");
        markdownCells(line).forEach((cell) => {
          const th = document.createElement("th");
          appendInlineMarkdown(th, cell);
          headRow.append(th);
        });
        head.append(headRow);
        table.append(head);
        const body = document.createElement("tbody");
        index += 2;
        while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
          const row = document.createElement("tr");
          markdownCells(lines[index]).forEach((cell) => {
            const td = document.createElement("td");
            appendInlineMarkdown(td, cell);
            row.append(td);
          });
          body.append(row);
          index += 1;
        }
        table.append(body);
        container.append(table);
        continue;
      }

      const listMatch = line.match(/^\s*([-*]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const ordered = /\d+\./.test(listMatch[1]);
        const list = document.createElement(ordered ? "ol" : "ul");
        while (index < lines.length) {
          const itemMatch = lines[index].match(/^\s*([-*]|\d+\.)\s+(.+)$/);
          if (!itemMatch || /\d+\./.test(itemMatch[1]) !== ordered) break;
          const item = document.createElement("li");
          appendInlineMarkdown(item, itemMatch[2]);
          list.append(item);
          index += 1;
        }
        container.append(list);
        continue;
      }

      if (line.startsWith("> ")) {
        const quote = document.createElement("blockquote");
        appendInlineMarkdown(quote, line.slice(2));
        container.append(quote);
        index += 1;
        continue;
      }

      const paragraphLines = [line.trim()];
      index += 1;
      while (index < lines.length && lines[index].trim()
        && !/^(#{1,4})\s+/.test(lines[index])
        && !/^```/.test(lines[index])
        && !/^!\[/.test(lines[index].trim())
        && !/^\s*([-*]|\d+\.)\s+/.test(lines[index])
        && !lines[index].startsWith("> ")
        && !(lines[index].includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1]))) {
        paragraphLines.push(lines[index].trim());
        index += 1;
      }
      const paragraph = document.createElement("p");
      appendInlineMarkdown(paragraph, paragraphLines.join(" "));
      container.append(paragraph);
    }
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    if (serverAvailable) {
      apiRequest("/api/state", {
        method: "PUT",
        body: JSON.stringify({ key, value })
      }).catch(() => setStorageStatus(false));
    }
  }

  function removeState(key) {
    localStorage.removeItem(key);
    if (serverAvailable) {
      apiRequest(`/api/state?key=${encodeURIComponent(key)}`, { method: "DELETE" })
        .catch(() => setStorageStatus(false));
    }
  }

  async function apiRequest(path, options = {}) {
    const requestOptions = { ...options, headers: { ...(options.headers || {}) } };
    if (requestOptions.body) requestOptions.headers["Content-Type"] = "application/json";
    const response = await fetch(path, requestOptions);
    const payload = await response.json();
    if (!response.ok || payload.ok === false) throw new Error(payload.error || `HTTP ${response.status}`);
    return payload;
  }

  function setStorageStatus(connected) {
    serverAvailable = connected;
    const status = $("#storage-status");
    if (status) status.textContent = connected ? "SQLite 已连接 · 浏览器离线备份" : "浏览器离线模式 · 启动本地服务可持久化";
  }

  async function hydrateRemoteState() {
    try {
      await apiRequest("/api/health");
      setStorageStatus(true);
      for (const key of synchronizedKeys) {
        const localValue = localStorage.getItem(key);
        const remote = await apiRequest(`/api/state?key=${encodeURIComponent(key)}`);
        if (remote.state) {
          localStorage.setItem(key, JSON.stringify(remote.state.value));
        } else if (localValue) {
          await apiRequest("/api/state", { method: "PUT", body: JSON.stringify({ key, value: JSON.parse(localValue) }) });
        }
      }
    } catch (error) {
      setStorageStatus(false);
    }
  }

  function recordEvent(type, payload = {}) {
    if (!serverAvailable) return;
    apiRequest("/api/event", { method: "POST", body: JSON.stringify({ type, payload }) })
      .catch(() => setStorageStatus(false));
  }

  function toast(message) {
    const element = $("#pkm-toast");
    element.textContent = message;
    element.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => element.classList.remove("show"), 2200);
  }

  async function copyText(text, message = "已复制") {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const helper = document.createElement("textarea");
      helper.value = text;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    toast(message);
  }

  function localDate(date = new Date()) {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  function normalizeReviewSettings(value) {
    const size = ["10", "20", "all"].includes(String(value?.size)) ? String(value.size) : "10";
    return { collection: String(value?.collection || value?.domain || "all"), size };
  }

  function showView(viewName) {
    $$(".pkm-view").forEach((panel) => {
      const active = panel.dataset.viewPanel === viewName;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    $$(".pkm-nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === viewName));
    if (viewName === "library") window.setTimeout(() => $("#library-query").focus(), 50);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initializeNavigation() {
    $$("[data-view]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
    $$("[data-go-view]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.goView)));
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        showView("library");
      }
    });
  }

  function dueCards(collection = "all") {
    const today = localDate();
    return methodCards
      .filter((card) => (collection === "all" || card.collection === collection)
        && (!reviewState[card.id] || reviewState[card.id].due <= today))
      .sort((a, b) => {
        const aState = reviewState[a.id];
        const bState = reviewState[b.id];
        const aDue = aState?.due || "0000-00-00";
        const bDue = bState?.due || "0000-00-00";
        return aDue.localeCompare(bDue) || (a.domain || "方法卡").localeCompare(b.domain || "方法卡", "zh-CN");
      });
  }

  function balanceCardsByCollection(cards) {
    const groups = new Map();
    cards.forEach((card) => {
      const collection = card.collection || "其他方法卡";
      if (!groups.has(collection)) groups.set(collection, []);
      groups.get(collection).push(card);
    });
    const queues = Array.from(groups.values());
    const balanced = [];
    while (queues.some((queue) => queue.length)) {
      queues.forEach((queue) => {
        if (queue.length) balanced.push(queue.shift());
      });
    }
    return balanced;
  }

  function buildReviewSession() {
    let candidates = dueCards(reviewSettings.collection);
    if (reviewSettings.collection === "all") candidates = balanceCardsByCollection(candidates);
    const limit = reviewSettings.size === "all" ? candidates.length : Number(reviewSettings.size);
    return candidates.slice(0, limit);
  }

  function initializeDashboard() {
    const curated = documents.filter((document) => document.valueTier === "精选").length;
    const totalDue = dueCards().length;
    const sessionRemaining = reviewQueue.length;
    $("#header-document-count").textContent = `${documents.length.toLocaleString("zh-CN")} 条`;
    $("#stat-documents").textContent = documents.length.toLocaleString("zh-CN");
    $("#stat-curated").textContent = curated.toLocaleString("zh-CN");
    $("#stat-cards").textContent = methodCards.length.toLocaleString("zh-CN");
    $("#stat-due").textContent = `${sessionRemaining.toLocaleString("zh-CN")} / ${totalDue.toLocaleString("zh-CN")}`;
    $("#stat-due-note").textContent = totalDue ? "本次剩余 / 全部到期" : "今天没有到期卡片";
    $("#nav-due-count").textContent = sessionRemaining;
    const workflowDue = workflows.filter((item) => item.status === "active" && item.reviewDate <= localDate()).length;
    $("#nav-workflow-count").textContent = workflowDue;
    $("#today-date").textContent = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "short" }).format(new Date());

    const sessionCompleted = Math.max(0, reviewSessionTotal - sessionRemaining);
    const progress = reviewSessionTotal ? Math.round((sessionCompleted / reviewSessionTotal) * 100) : totalDue ? 0 : 100;
    $("#review-meter-bar").style.width = `${progress}%`;
    $("#review-meter-copy").textContent = sessionRemaining
      ? `本次 ${reviewSessionTotal} 张，已完成 ${sessionCompleted} 张；全部到期 ${totalDue} 张。`
      : totalDue
        ? `本次复习已完成。仍有 ${totalDue} 张到期卡片，可生成下一组。`
        : "今天的到期卡片已经完成。";

    const categories = Object.entries(index.stats.categories || {}).slice(0, 8);
    const icons = ["bot", "table-2", "code-2", "camera", "notebook-tabs", "briefcase-business", "inbox", "book-open"];
    $("#dashboard-categories").innerHTML = categories.map(([category, count], position) => `
      <button type="button" data-category="${escapeHtml(category)}">
        <span class="pkm-category-icon"><i data-lucide="${icons[position] || "folder"}"></i></span>
        <span><strong>${escapeHtml(category)}</strong><small>${Number(count).toLocaleString("zh-CN")} 条资料</small></span>
        <i data-lucide="arrow-right"></i>
      </button>`).join("");
    $$("[data-category]", $("#dashboard-categories")).forEach((button) => button.addEventListener("click", () => {
      $("#category-filter").value = button.dataset.category;
      $("#tier-filter").value = "all";
      visibleCount = pageSize;
      applyFilters();
      showView("library");
    }));
    renderCoreMap();
  }

  function coreStageForCard(card) {
    return coreMapStages.find((stage) => card.sequence >= stage.range[0] && card.sequence <= stage.range[1]);
  }

  function coreCardReviewed(card) {
    return Number(reviewState[card.id]?.reps || 0) > 0;
  }

  function sourceFamilyCoversCard(family, card) {
    const sources = card.sources || [];
    return sources.some((source) => family.needles.some((needle) => source.includes(needle)));
  }

  function renderCoreMapProgress() {
    const reviewed = coreCards.filter(coreCardReviewed).length;
    const total = coreCards.length;
    if ($("#map-card-count")) $("#map-card-count").textContent = total;
    if ($("#map-stage-count")) $("#map-stage-count").textContent = coreMapStages.length;
    if ($("#map-source-count")) $("#map-source-count").textContent = coreSourceFamilies.length;
    if ($("#map-reviewed-count")) $("#map-reviewed-count").textContent = `${reviewed} / ${total}`;
    if ($("#map-reviewed-bar")) $("#map-reviewed-bar").style.width = `${total ? Math.round((reviewed / total) * 100) : 0}%`;
  }

  function renderCoreMapInspector() {
    const card = coreCards.find((item) => item.id === selectedCoreMapCardId) || coreCards[0];
    if (!card || !$("#core-map-detail-title")) return;
    const stage = coreStageForCard(card);
    $("#core-map-detail-step").textContent = `步骤 ${String(card.sequence).padStart(2, "0")} · ${stage?.title || card.domain}`;
    $("#core-map-detail-title").textContent = card.title;
    $("#core-map-detail-summary").textContent = card.summary;
    $("#core-map-detail-use").textContent = card.mentorUse;
    $("#core-map-detail-questions").innerHTML = (card.questions || []).map((question) => `<li>${escapeHtml(question)}</li>`).join("");
    $("#core-map-detail-sources").innerHTML = (card.sources || []).map((source) => `<span>${escapeHtml(source)}</span>`).join("");
    $("#core-map-detail-merged").textContent = `由 ${(card.mergedFrom || []).length} 张原子方法卡归并，原卡继续保留用于追溯。`;
  }

  function renderCoreSourceMatrix() {
    const matrix = $("#core-source-matrix");
    if (!matrix) return;
    const columnLabels = coreCards.map((card) => `<span title="步骤 ${card.sequence}：${escapeHtml(card.title)}">${card.sequence}</span>`).join("");
    const rows = coreSourceFamilies.map((family) => {
      const covered = coreCards.filter((card) => sourceFamilyCoversCard(family, card));
      const cells = coreCards.map((card) => {
        const active = sourceFamilyCoversCard(family, card);
        if (!active) return `<span class="pkm-source-dot" aria-hidden="true"></span>`;
        const selected = card.id === selectedCoreMapCardId ? " selected" : "";
        return `<button class="pkm-source-dot active${selected}" type="button" data-core-card-id="${escapeHtml(card.id)}" title="${escapeHtml(family.label)} → ${escapeHtml(card.title)}" aria-label="查看步骤 ${card.sequence}：${escapeHtml(card.title)}"></button>`;
      }).join("");
      return `<div class="pkm-source-matrix-row"><strong>${escapeHtml(family.label)}</strong><div>${cells}</div><b>${covered.length}</b></div>`;
    }).join("");
    matrix.innerHTML = `<div class="pkm-source-matrix-head"><span>来源体系</span><div>${columnLabels}</div><span>覆盖</span></div>${rows}`;
  }

  function renderCoreMap() {
    const container = $("#core-map-stages");
    if (!container || !coreCards.length) return;
    if (!coreCards.some((card) => card.id === selectedCoreMapCardId)) selectedCoreMapCardId = coreCards[0].id;
    container.innerHTML = coreMapStages.map((stage) => {
      const cards = coreCards.filter((card) => card.sequence >= stage.range[0] && card.sequence <= stage.range[1]);
      const reviewedCount = cards.filter(coreCardReviewed).length;
      return `<section class="pkm-map-stage stage-${stage.id}">
        <header><span class="pkm-map-stage-icon"><i data-lucide="${stage.icon}"></i></span><div><small>阶段 ${String(stage.order).padStart(2, "0")}</small><h2>${escapeHtml(stage.title)}</h2><p>${escapeHtml(stage.question)}</p></div><b>${reviewedCount} / ${cards.length}</b></header>
        <div class="pkm-map-stage-track"><span class="pkm-map-stage-line" aria-hidden="true"></span><div class="pkm-map-stage-nodes">${cards.map((card) => {
          const reviewed = coreCardReviewed(card);
          const selected = card.id === selectedCoreMapCardId;
          return `<button class="pkm-map-node${reviewed ? " reviewed" : ""}${selected ? " selected" : ""}" type="button" data-core-card-id="${escapeHtml(card.id)}" aria-pressed="${selected}">
            <span>${String(card.sequence).padStart(2, "0")}</span><strong>${escapeHtml(card.title)}</strong><small>${escapeHtml(card.domain)}</small><i data-lucide="${reviewed ? "check-circle-2" : "circle"}"></i>
          </button>`;
        }).join("")}</div></div>
        <footer><i data-lucide="corner-down-right"></i><span>${escapeHtml(stage.outcome)}</span></footer>
      </section>`;
    }).join("");
    renderCoreMapProgress();
    renderCoreMapInspector();
    renderCoreSourceMatrix();
    if (window.lucide) window.lucide.createIcons();
  }

  function selectCoreMapCard(cardId, scrollToDetail = false) {
    if (!coreCards.some((card) => card.id === cardId)) return;
    selectedCoreMapCardId = cardId;
    renderCoreMap();
    if (scrollToDetail && window.matchMedia("(max-width: 900px)").matches) {
      $(".pkm-map-inspector").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openCoreReview() {
    reviewSettings = normalizeReviewSettings({ collection: "核心主线", size: reviewSettings.size });
    saveJson(reviewSessionStorageKey, reviewSettings);
    $("#review-collection-filter").value = "核心主线";
    $("#review-session-size").value = reviewSettings.size;
    refreshReviewQueue();
    showView("review");
  }

  function initializeCoreMap() {
    if (!$("#core-map-stages")) return;
    $("#core-map-stages").addEventListener("click", (event) => {
      const button = event.target.closest("[data-core-card-id]");
      if (button) selectCoreMapCard(button.dataset.coreCardId, true);
    });
    $("#core-source-matrix").addEventListener("click", (event) => {
      const button = event.target.closest("[data-core-card-id]");
      if (button) selectCoreMapCard(button.dataset.coreCardId, true);
    });
    $("#map-review-core").addEventListener("click", openCoreReview);
    $("#map-review-selected").addEventListener("click", openCoreReview);
    $("#core-topic-branches").innerHTML = coreTopicBranches.map((branch) => `<button type="button" data-branch-query="${escapeHtml(branch.query)}" data-branch-source="${escapeHtml(branch.source || "all")}">
      <span><i data-lucide="${branch.icon}"></i></span><div><small>${escapeHtml(branch.meta)}</small><strong>${escapeHtml(branch.title)}</strong><p>${escapeHtml(branch.description)}</p></div><i data-lucide="arrow-up-right"></i>
    </button>`).join("");
    $("#core-topic-branches").addEventListener("click", (event) => {
      const button = event.target.closest("[data-branch-query]");
      if (!button) return;
      $("#library-query").value = button.dataset.branchQuery;
      $("#source-filter").value = button.dataset.branchSource || "all";
      $("#tier-filter").value = "all";
      $("#category-filter").value = "all";
      visibleCount = pageSize;
      applyFilters();
      showView("library");
    });
    renderCoreMap();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().normalize("NFKC");
  }

  function queryTerms(value) {
    return normalize(value).split(/[^\u4e00-\u9fffa-z0-9]+/).filter(Boolean);
  }

  function relevance(document, terms) {
    if (!terms.length) return document.valueScore || 0;
    const title = normalize(document.title);
    const tags = normalize((document.tags || []).join(" "));
    const summary = normalize(document.summary);
    const body = normalize(document.searchText);
    return terms.reduce((score, term) => score
      + (title.includes(term) ? 18 : 0)
      + (tags.includes(term) ? 9 : 0)
      + (summary.includes(term) ? 5 : 0)
      + (body.includes(term) ? 2 : 0), 0) + (document.valueScore || 0) / 20;
  }

  function initializeLibrary() {
    const categorySelect = $("#category-filter");
    Object.keys(index.stats.categories || {}).forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    ["library-query", "category-filter", "source-filter", "tier-filter", "sort-filter"].forEach((id) => {
      const element = $(`#${id}`);
      element.addEventListener(id === "library-query" ? "input" : "change", () => {
        visibleCount = pageSize;
        applyFilters();
      });
    });
    $("#reset-filters").addEventListener("click", () => {
      $("#library-query").value = "";
      $("#category-filter").value = "all";
      $("#source-filter").value = "all";
      $("#tier-filter").value = "all";
      $("#sort-filter").value = "relevance";
      visibleCount = pageSize;
      applyFilters();
    });
    $("#load-more").addEventListener("click", () => {
      visibleCount += pageSize;
      renderDocuments();
    });
    $("#document-list").addEventListener("click", (event) => {
      const copyButton = event.target.closest("[data-copy-path]");
      if (copyButton) copyText(copyButton.dataset.copyPath, "文件路径已复制");
      const previewButton = event.target.closest("[data-preview-id]");
      if (previewButton) showSourcePreview(previewButton.dataset.previewId);
      const evidenceButton = event.target.closest("[data-add-evidence]");
      if (evidenceButton) addWorkflowEvidence(evidenceButton.dataset.addEvidence);
    });
    $$('[data-search-rating]').forEach((button) => button.addEventListener("click", () => {
      const query = $("#library-query").value.trim();
      recordEvent("search_feedback", { query, rating: button.dataset.searchRating, resultCount: filteredDocuments.length });
      $("#search-feedback").hidden = true;
      toast(button.dataset.searchRating === "useful" ? "已记录：找到可用证据" : "已记录：需要改进检索");
      window.setTimeout(loadMetrics, 200);
    }));
    applyFilters();
  }

  function applyFilters() {
    const terms = queryTerms($("#library-query").value);
    const category = $("#category-filter").value;
    const source = $("#source-filter").value;
    const tier = $("#tier-filter").value;
    const sort = $("#sort-filter").value;

    filteredDocuments = documents.filter((document) => {
      if (category !== "all" && document.category !== category) return false;
      if (source !== "all" && document.sourceType !== source) return false;
      if (tier !== "all" && document.valueTier !== tier) return false;
      if (terms.length && !terms.every((term) => normalize(document.searchText).includes(term))) return false;
      document._relevance = relevance(document, terms);
      return true;
    });

    filteredDocuments.sort((a, b) => {
      if (sort === "score") return b.valueScore - a.valueScore || a.title.localeCompare(b.title, "zh-CN");
      if (sort === "newest") return String(b.modified).localeCompare(String(a.modified));
      if (sort === "title") return a.title.localeCompare(b.title, "zh-CN");
      return b._relevance - a._relevance || b.valueScore - a.valueScore;
    });
    const query = $("#library-query").value.trim();
    $("#search-feedback").hidden = !query;
    scheduleSearchEvent(query);
    renderDocuments();
  }

  function scheduleSearchEvent(query) {
    window.clearTimeout(searchEventTimer);
    if (!query || query === lastLoggedQuery) return;
    searchEventTimer = window.setTimeout(() => {
      lastLoggedQuery = query;
      recordEvent("search", {
        query,
        resultCount: filteredDocuments.length,
        category: $("#category-filter").value,
        source: $("#source-filter").value,
        tier: $("#tier-filter").value
      });
    }, 700);
  }

  function renderDocuments() {
    $("#library-result-count").textContent = `${filteredDocuments.length.toLocaleString("zh-CN")} 条结果`;
    const visible = filteredDocuments.slice(0, visibleCount);
    const list = $("#document-list");
    if (!visible.length) {
      list.innerHTML = `<div class="pkm-empty"><i data-lucide="search-x"></i><strong>没有匹配资料</strong><p>减少关键词或重置筛选后再试。</p></div>`;
    } else {
      list.innerHTML = visible.map((document) => {
        const openAction = document.sourceType === "current"
          ? `<button class="icon-button" type="button" data-preview-id="${escapeHtml(document.id)}" aria-label="预览笔记" data-tooltip="预览笔记"><i data-lucide="scan-text"></i></button><a class="icon-button" href="${escapeHtml(document.notePath)}" target="_blank" aria-label="打开笔记" data-tooltip="打开笔记"><i data-lucide="file-text"></i></a>`
          : document.sourceType === "waytoagi" || document.sourceType === "research" || document.sourceType === "xiaohongshu" || document.sourceType === "mitbunny" || document.sourceType === "dwarkesh"
            ? `<button class="icon-button" type="button" data-preview-id="${escapeHtml(document.id)}" aria-label="预览目录信息" data-tooltip="预览目录信息"><i data-lucide="scan-text"></i></button>`
          : `<button class="icon-button" type="button" data-copy-path="${escapeHtml(document.sourcePath || document.notePath)}" aria-label="复制原文件路径" data-tooltip="复制原文件路径"><i data-lucide="copy"></i></button>`;
        const sourceAction = document.sourceUrl
          ? `<a class="icon-button" href="${escapeHtml(document.sourceUrl)}" target="_blank" rel="noreferrer" aria-label="打开来源" data-tooltip="打开来源"><i data-lucide="external-link"></i></a>` : "";
        const tags = (document.tags || []).slice(0, 5).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
        return `<article class="pkm-document-row">
          <div class="pkm-document-main">
            <div class="pkm-document-meta"><span class="pkm-tier ${document.valueTier === "精选" ? "curated" : ""}">${escapeHtml(document.valueTier)} ${document.valueScore}</span><span>${escapeHtml(document.sourceLabel)}</span><span>${escapeHtml(document.category)}</span><span>${escapeHtml(String(document.modified || "").slice(0, 10))}</span></div>
            <h2>${escapeHtml(document.title)}</h2>
            <p>${escapeHtml(document.summary || "该条目只有元数据，建议回到原文件判断价值。")}</p>
            <div class="pkm-document-tags">${tags}</div>
          </div>
          <div class="pkm-document-actions"><button class="icon-button" type="button" data-add-evidence="${escapeHtml(document.id)}" aria-label="加入行动证据" data-tooltip="加入行动证据"><i data-lucide="bookmark-plus"></i></button>${openAction}${sourceAction}</div>
        </article>`;
      }).join("");
    }
    $("#load-more").hidden = visibleCount >= filteredDocuments.length;
    if (window.lucide) window.lucide.createIcons();
  }

  function initializeSourcePreview() {
    $("#close-source-preview").addEventListener("click", () => $("#source-preview").close());
    $("#add-preview-evidence").addEventListener("click", () => {
      if (previewDocument) addWorkflowEvidence(previewDocument.id);
    });
    $("#source-preview").addEventListener("click", (event) => {
      if (event.target === $("#source-preview")) $("#source-preview").close();
    });
  }

  async function showSourcePreview(documentId) {
    const item = documents.find((document) => document.id === documentId);
    if (!item) return;
    previewDocument = item;
    $("#source-preview-title").textContent = item.title;
    $("#source-preview-meta").textContent = `${item.category} · ${item.sourceLabel} · ${item.valueTier} ${item.valueScore}`;
    renderPreviewMessage($("#source-preview-content"), "正在读取来源…");
    const openLink = $("#open-preview-source");
    const destination = item.sourceUrl || (item.sourceType === "current" ? item.notePath : "");
    openLink.hidden = !destination;
    openLink.href = destination || "#";
    $("#source-preview").showModal();
    try {
      if (item.sourceType === "current") {
        let content;
        if (serverAvailable) {
          const response = await apiRequest(`/api/document?path=${encodeURIComponent(item.notePath)}`);
          content = response.content;
        } else {
          const response = await fetch(item.notePath);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          content = await response.text();
        }
        renderMarkdownPreview($("#source-preview-content"), content);
      } else {
        renderPreviewMessage($("#source-preview-content"), `${item.summary || "该资料只有元数据。"}\n\n原文件：${item.sourcePath || "未记录"}\n\n提取笔记：${item.notePath || "未记录"}`);
      }
      recordEvent("source_preview", { documentId: item.id, title: item.title, sourceType: item.sourceType });
    } catch (error) {
      renderPreviewMessage($("#source-preview-content"), `无法读取完整来源。\n\n${item.summary || ""}\n\n${error.message}`);
    }
  }

  function initializeWorkflows() {
    $("#new-workflow").addEventListener("click", resetWorkflowForm);
    $("#find-evidence").addEventListener("click", () => showView("library"));
    $("#save-workflow").addEventListener("click", () => saveWorkflow(false));
    $("#complete-workflow").addEventListener("click", () => saveWorkflow(true));
    $("#delete-workflow").addEventListener("click", deleteCurrentWorkflow);
    $("#workflow-evidence").addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-evidence]");
      if (!button) return;
      workflowEvidence = workflowEvidence.filter((item) => item.id !== button.dataset.removeEvidence);
      renderWorkflowEvidence();
    });
    $("#workflow-list").addEventListener("click", (event) => {
      const button = event.target.closest("[data-edit-workflow]");
      if (button) loadWorkflow(button.dataset.editWorkflow);
    });
    resetWorkflowForm();
    renderWorkflowList();
    loadMetrics();
  }

  function defaultReviewDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return localDate(date);
  }

  function resetWorkflowForm() {
    editingWorkflowId = null;
    workflowEvidence = [];
    $("#workflow-form-title").textContent = "建立新的行动闭环";
    $("#workflow-question").value = "";
    $("#workflow-judgment").value = "";
    $("#workflow-action").value = "";
    $("#workflow-criteria").value = "";
    $("#workflow-review-date").value = defaultReviewDate();
    $("#workflow-status").value = "active";
    $("#workflow-outcome").value = "";
    $("#delete-workflow").hidden = true;
    $("#workflow-save-status").textContent = "本地草稿";
    renderWorkflowEvidence();
  }

  function addWorkflowEvidence(documentId) {
    const item = documents.find((document) => document.id === documentId);
    if (!item) return;
    if (workflowEvidence.some((evidence) => evidence.id === item.id)) {
      toast("这条证据已经加入");
      return;
    }
    if (workflowEvidence.length >= 8) {
      toast("一个闭环最多保留 8 条关键证据");
      return;
    }
    workflowEvidence.push({
      id: item.id,
      title: item.title,
      category: item.category,
      summary: item.summary,
      notePath: item.notePath,
      sourcePath: item.sourcePath,
      sourceUrl: item.sourceUrl
    });
    renderWorkflowEvidence();
    toast("已加入行动证据");
  }

  function renderWorkflowEvidence() {
    const container = $("#workflow-evidence");
    if (!workflowEvidence.length) {
      container.innerHTML = "<p>从全库检索结果中点击“加入证据”。</p>";
      return;
    }
    container.innerHTML = workflowEvidence.map((item) => `<article>
      <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.category)}</span></div>
      <button class="icon-button" type="button" data-remove-evidence="${escapeHtml(item.id)}" aria-label="移除证据"><i data-lucide="x"></i></button>
    </article>`).join("");
    if (window.lucide) window.lucide.createIcons();
  }

  function workflowFormData(completing) {
    return {
      question: $("#workflow-question").value.trim(),
      evidence: workflowEvidence,
      judgment: $("#workflow-judgment").value.trim(),
      action: $("#workflow-action").value.trim(),
      criteria: $("#workflow-criteria").value.trim(),
      reviewDate: $("#workflow-review-date").value,
      status: completing ? "completed" : $("#workflow-status").value,
      outcome: $("#workflow-outcome").value.trim()
    };
  }

  function saveWorkflow(completing) {
    const data = workflowFormData(completing);
    if (!data.question || !data.action || !data.reviewDate) {
      toast("请填写问题、下一步行动和复盘日期");
      return;
    }
    if (!data.evidence.length) {
      toast("请先从知识库加入至少一条证据");
      return;
    }
    if (completing && !data.outcome) {
      toast("记录真实结果后才能完成闭环");
      return;
    }
    const existing = workflows.find((item) => item.id === editingWorkflowId);
    const now = new Date().toISOString();
    const record = {
      ...data,
      id: editingWorkflowId || (crypto.randomUUID ? crypto.randomUUID() : `workflow-${Date.now()}`),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      completedAt: data.status === "completed" ? existing?.completedAt || now : null
    };
    workflows = existing ? workflows.map((item) => item.id === record.id ? record : item) : [record, ...workflows];
    saveJson(workflowStorageKey, workflows);
    recordEvent(data.status === "completed" ? "workflow_completed" : "workflow_saved", {
      workflowId: record.id,
      evidenceCount: record.evidence.length,
      reviewDate: record.reviewDate
    });
    editingWorkflowId = record.id;
    $("#workflow-status").value = record.status;
    $("#workflow-save-status").textContent = data.status === "completed" ? "闭环已完成" : "已保存到 SQLite";
    $("#delete-workflow").hidden = false;
    renderWorkflowList();
    initializeDashboard();
    toast(data.status === "completed" ? "闭环已完成并记录结果" : "行动闭环已保存");
  }

  function loadWorkflow(id) {
    const item = workflows.find((workflow) => workflow.id === id);
    if (!item) return;
    editingWorkflowId = item.id;
    workflowEvidence = [...(item.evidence || [])];
    $("#workflow-form-title").textContent = item.question;
    $("#workflow-question").value = item.question || "";
    $("#workflow-judgment").value = item.judgment || "";
    $("#workflow-action").value = item.action || "";
    $("#workflow-criteria").value = item.criteria || "";
    $("#workflow-review-date").value = item.reviewDate || defaultReviewDate();
    $("#workflow-status").value = item.status || "active";
    $("#workflow-outcome").value = item.outcome || "";
    $("#workflow-save-status").textContent = `更新于 ${String(item.updatedAt || "").slice(0, 10)}`;
    $("#delete-workflow").hidden = false;
    renderWorkflowEvidence();
    showView("workflows");
  }

  function deleteCurrentWorkflow() {
    if (!editingWorkflowId) return resetWorkflowForm();
    if (!window.confirm("删除这个行动闭环？此操作不能撤销。")) return;
    workflows = workflows.filter((item) => item.id !== editingWorkflowId);
    saveJson(workflowStorageKey, workflows);
    recordEvent("workflow_deleted", { workflowId: editingWorkflowId });
    resetWorkflowForm();
    renderWorkflowList();
    initializeDashboard();
    toast("行动闭环已删除");
  }

  function renderWorkflowList() {
    const today = localDate();
    const active = workflows.filter((item) => item.status === "active");
    const due = active.filter((item) => item.reviewDate <= today);
    const completed = workflows.filter((item) => item.status === "completed");
    $("#workflow-active-count").textContent = active.length;
    $("#workflow-due-count").textContent = due.length;
    $("#workflow-completed-count").textContent = completed.length;
    $("#workflow-list-count").textContent = `${workflows.length} 条`;
    const ordered = [...workflows].sort((a, b) => {
      const aDue = a.status === "active" && a.reviewDate <= today ? 1 : 0;
      const bDue = b.status === "active" && b.reviewDate <= today ? 1 : 0;
      return bDue - aDue || String(b.updatedAt).localeCompare(String(a.updatedAt));
    });
    const list = $("#workflow-list");
    if (!ordered.length) {
      list.innerHTML = '<div class="pkm-empty"><i data-lucide="target"></i><strong>还没有行动闭环</strong><p>先检索一条证据，再建立第一个可复盘行动。</p></div>';
    } else {
      list.innerHTML = ordered.map((item) => {
        const isDue = item.status === "active" && item.reviewDate <= today;
        const statusLabel = item.status === "completed" ? "已完成" : item.status === "stopped" ? "已停止" : isDue ? "待复盘" : "进行中";
        return `<article class="pkm-workflow-record ${isDue ? "due" : ""}">
          <div class="pkm-document-meta"><span class="pkm-tier ${item.status === "completed" ? "curated" : ""}">${statusLabel}</span><span>复盘 ${escapeHtml(item.reviewDate)}</span><span>${(item.evidence || []).length} 条证据</span></div>
          <h3>${escapeHtml(item.question)}</h3><p><strong>行动：</strong>${escapeHtml(item.action)}</p>
          ${item.outcome ? `<p><strong>结果：</strong>${escapeHtml(item.outcome)}</p>` : ""}
          <button class="secondary-action" type="button" data-edit-workflow="${escapeHtml(item.id)}"><i data-lucide="square-pen"></i>${isDue ? "立即复盘" : "查看记录"}</button>
        </article>`;
      }).join("");
    }
    if (window.lucide) window.lucide.createIcons();
  }

  async function loadMetrics() {
    if (!serverAvailable) {
      $("#search-success-rate").textContent = "离线";
      return;
    }
    try {
      const metrics = await apiRequest("/api/metrics");
      $("#search-success-rate").textContent = metrics.searchSuccessRate === null ? "待反馈" : `${metrics.searchSuccessRate}%`;
    } catch (error) {
      $("#search-success-rate").textContent = "离线";
    }
  }

  function initializeReview() {
    const collectionFilter = $("#review-collection-filter");
    const collections = Array.from(new Set(methodCards.map((card) => card.collection))).sort((a, b) => a.localeCompare(b, "zh-CN"));
    collections.forEach((collection) => {
      const option = document.createElement("option");
      option.value = collection;
      option.textContent = collection;
      collectionFilter.appendChild(option);
    });
    if (!["all", ...collections].includes(reviewSettings.collection)) reviewSettings.collection = "all";
    collectionFilter.value = reviewSettings.collection;
    $("#review-session-size").value = reviewSettings.size;
    collectionFilter.addEventListener("change", updateReviewSettings);
    $("#review-session-size").addEventListener("change", updateReviewSettings);
    $("#restart-review-session").addEventListener("click", () => {
      refreshReviewQueue();
      toast("已生成新的复习会话");
    });
    refreshReviewQueue();
    $("#reveal-answer").addEventListener("click", revealReviewAnswer);
    $$("[data-rating]").forEach((button) => button.addEventListener("click", () => rateCard(button.dataset.rating)));
    $("#reset-review").addEventListener("click", () => {
      if (!window.confirm("确定清空全部方法卡的复习记录吗？")) return;
      reviewState = {};
      saveJson(reviewStorageKey, reviewState);
      refreshReviewQueue();
      toast("复习进度已重置");
    });
  }

  function updateReviewSettings() {
    reviewSettings = normalizeReviewSettings({
      collection: $("#review-collection-filter").value,
      size: $("#review-session-size").value
    });
    saveJson(reviewSessionStorageKey, reviewSettings);
    refreshReviewQueue();
  }

  function refreshReviewQueue() {
    reviewQueue = buildReviewSession();
    reviewSessionTotal = reviewQueue.length;
    currentReviewCard = reviewQueue[0] || null;
    renderReviewCard();
    initializeDashboard();
  }

  function renderReviewCard() {
    const answer = $("#review-answer");
    answer.hidden = true;
    $("#rating-row").hidden = true;
    $("#reveal-answer").hidden = !currentReviewCard;
    $("#review-remaining").textContent = reviewQueue.length;
    const sessionCompleted = Math.max(0, reviewSessionTotal - reviewQueue.length);
    const filteredDue = dueCards(reviewSettings.collection).length;
    const scopeLabel = reviewSettings.collection === "all" ? "全部专题" : reviewSettings.collection;
    $("#review-queue-note").textContent = `${scopeLabel}到期 ${filteredDue} 张；全库到期 ${dueCards().length} 张。`;
    $("#review-progress").textContent = currentReviewCard ? `已完成 ${sessionCompleted} / ${reviewSessionTotal}` : "本次完成";
    if (!currentReviewCard) {
      $("#review-domain").textContent = "Review complete";
      $("#review-title").textContent = filteredDue ? "本次复习已经完成" : "当前范围没有到期卡片";
      $("#review-question").textContent = filteredDue
        ? "可以重新生成下一组，也可以回到真实任务中应用一张卡片。"
        : "切换领域，或把刚学到的方法用于一个真实问题。";
      return;
    }
    const questions = currentReviewCard.questions || [];
    $("#review-domain").textContent = `${currentReviewCard.collection || "其他方法卡"} · ${currentReviewCard.domain || "方法卡"}`;
    $("#review-title").textContent = currentReviewCard.title;
    $("#review-question").textContent = questions[0] || "请用自己的语言解释这张方法卡，并举一个应用场景。";
    $("#review-summary").textContent = currentReviewCard.summary || "";
    $("#review-use").textContent = currentReviewCard.mentorUse || "把它用于一个正在发生的真实问题。";
    const source = $("#review-source");
    source.href = currentReviewCard.sourceUrl || "#";
    source.hidden = !currentReviewCard.sourceUrl;
  }

  function revealReviewAnswer() {
    if (!currentReviewCard) return;
    $("#review-answer").hidden = false;
    $("#rating-row").hidden = false;
    $("#reveal-answer").hidden = true;
  }

  function rateCard(rating) {
    if (!currentReviewCard) return;
    const previous = reviewState[currentReviewCard.id] || { interval: 0, ease: 2.5, reps: 0 };
    let interval = previous.interval || 0;
    let ease = previous.ease || 2.5;
    let reps = previous.reps || 0;
    if (rating === "again") {
      interval = 1;
      ease = Math.max(1.3, ease - 0.2);
      reps = 0;
    } else if (rating === "hard") {
      interval = Math.max(2, Math.round((interval || 1) * 1.2));
      ease = Math.max(1.3, ease - 0.15);
      reps += 1;
    } else if (rating === "easy") {
      interval = reps === 0 ? 4 : Math.max(4, Math.round((interval || 1) * ease * 1.3));
      ease = Math.min(3.0, ease + 0.15);
      reps += 1;
    } else {
      interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.max(3, Math.round(interval * ease));
      reps += 1;
    }
    const due = new Date();
    due.setDate(due.getDate() + interval);
    reviewState[currentReviewCard.id] = { interval, ease, reps, due: localDate(due), lastReviewed: localDate() };
    saveJson(reviewStorageKey, reviewState);
    reviewQueue.shift();
    currentReviewCard = reviewQueue[0] || null;
    renderReviewCard();
    initializeDashboard();
  }

  function initializeStudyPaths() {
    const paths = [
      { icon: "git-merge", title: "核心主线：从问题到复盘", duration: "18 张核心卡", query: "个人知识库总地图 核心主线", source: "current", tags: ["问题", "证据", "行动闭环"], description: "先掌握全库共同骨架，再按当前问题下钻毛选、商业、AI、研究或创作专题。" },
      { icon: "compass", title: "毛选方法论：从调查到实践", duration: "7 个练习", query: "毛泽东 方法论 调查 实践", tags: ["调查", "主要矛盾", "实践循环"], description: "从事实、矛盾和阶段判断出发，把学习转成最小行动与复盘。" },
      { icon: "flask-conical", title: "科学决策与商业验证", duration: "10 张方法卡", query: "假设 验证 商业 决策", tags: ["关键假设", "MVP", "停止条件"], description: "从问题定义到低成本验证，训练证据驱动的项目判断。" },
      { icon: "rocket", title: "Levels.io：独立产品验证", duration: "9 张方法卡", query: "Levels 独立产品 MVP 分发", tags: ["快速发布", "尽早收费", "分发"], description: "从真实问题到发布、收费、客服和分发，完成一轮低成本独立产品实验。" },
      { icon: "network", title: "WaytoAGI：AI 能力到真实作品", duration: "8 周实践", query: "WaytoAGI AI 学习 提示词 智能体 产品 创作", tags: ["能力地图", "作品驱动", "工具核验"], description: "按基础、提示词、智能体、创作、研究与商业化组织学习，每周用一个可验证作品收束输入。" },
      { icon: "book-open-check", title: "AI 工程论文：从阅读到实验", duration: "50 项 · 12 周", query: "P0", source: "research", tags: ["评测", "检索", "实验"], description: "十个方向各五项，优先打开 P0 阅读，用自己的任务集完成一次可证伪的小实验。" },
      { icon: "radar", title: "AI 情报源：从信号到一手证据", duration: "300 个候选账号", query: "MIT Bunny", source: "mitbunny", tags: ["主题列表", "来源核验", "反证"], description: "把社交网络当发现雷达，按官方、教学、研究、系统和反方分组，只有一手核验后的内容才能进入精选知识。" },
      { icon: "messages-square", title: "深度研究与访谈", duration: "174 项公开归档", query: "Dwarkesh", source: "dwarkesh", tags: ["关键分歧", "预测更新", "说话人"], description: "先从综合稿学习研究方法，再按当前问题打开访谈或文章；目录元数据不等于正文已经精读。" },
      { icon: "bot", title: "AI 学习与作品输出", duration: "精选资料", query: "AI 学习 项目 RAG", tags: ["AI", "项目学习", "作品"], description: "围绕真实作品检索旧资料，建立学习、实践和反馈循环。" },
      { icon: "list-checks", title: "来源补齐队列", duration: "按 A-E 状态推进", query: "全库来源完整性审计", source: "current", tags: ["完整性", "缺口", "优先级"], description: "优先处理用户明确指定但仍是目录、受阻或未入库的来源，完成一项就更新证据与等级。" },
      { icon: "camera", title: "摄影与视觉创作", duration: "7 阶段 · 22 个合并簇", query: "Photography Mentor 知识整理 Review", source: "current", tags: ["摄影", "视觉", "作品集"], description: "从意图、捕获和画面组织走到计算显影、题材实践、编辑表达与长期交付。" },
      { icon: "notebook-tabs", title: "个人知识库维护", duration: "每周 30 分钟", query: "知识库 知识管理 笔记", tags: ["PKM", "渐进摘要", "复习"], description: "清理待整理项，提升高频笔记，并让方法卡持续连接真实任务。" }
    ];
    $("#study-paths").innerHTML = paths.map((path, index) => `<article class="pkm-path-card">
      <div class="pkm-path-top"><span><i data-lucide="${path.icon}"></i></span><small>${escapeHtml(path.duration)}</small></div>
      <h2>${escapeHtml(path.title)}</h2><p>${escapeHtml(path.description)}</p>
      <div>${path.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <button class="secondary-action" type="button" data-path-query="${escapeHtml(path.query)}" data-path-source="${escapeHtml(path.source || "all")}">打开路径 <i data-lucide="arrow-right"></i></button>
    </article>`).join("");
    $$("[data-path-query]").forEach((button) => button.addEventListener("click", () => {
      $("#library-query").value = button.dataset.pathQuery;
      $("#source-filter").value = button.dataset.pathSource || "all";
      $("#tier-filter").value = "all";
      $("#category-filter").value = "all";
      visibleCount = pageSize;
      applyFilters();
      showView("library");
    }));
  }

  function initializeCapture() {
    const fields = ["capture-title", "capture-type", "capture-tags", "capture-source", "capture-body"];
    const saved = readJson(captureStorageKey, {});
    fields.forEach((id) => {
      const element = $(`#${id}`);
      if (saved[id]) element.value = saved[id];
      element.addEventListener("input", saveCapture);
      element.addEventListener("change", saveCapture);
    });
    $("#download-note").addEventListener("click", () => {
      const content = captureMarkdown();
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const slug = ($("#capture-title").value || "new-note").trim().replace(/[\\/:*?"<>|\s]+/g, "-").slice(0, 80);
      link.href = url;
      link.download = `${localDate()}-${slug}.md`;
      link.click();
      URL.revokeObjectURL(url);
      toast("Markdown 已生成");
    });
    $("#copy-note").addEventListener("click", () => copyText(captureMarkdown(), "笔记已复制"));
    $("#clear-note").addEventListener("click", () => {
      fields.forEach((id) => { $(`#${id}`).value = id === "capture-type" ? "source-note" : ""; });
      removeState(captureStorageKey);
      toast("草稿已清空");
    });
  }

  function saveCapture() {
    const data = {};
    ["capture-title", "capture-type", "capture-tags", "capture-source", "capture-body"].forEach((id) => { data[id] = $(`#${id}`).value; });
    saveJson(captureStorageKey, data);
    $("#capture-status").innerHTML = '<i data-lucide="cloud-check"></i>已自动保存';
    if (window.lucide) window.lucide.createIcons();
  }

  function yamlValue(value) {
    return `"${String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }

  function captureMarkdown() {
    const title = $("#capture-title").value.trim() || "未命名笔记";
    const tags = $("#capture-tags").value.split(/[,，]+/).map((tag) => tag.trim()).filter(Boolean);
    const source = $("#capture-source").value.trim();
    const body = $("#capture-body").value.trim() || "## 问题\n\n## 事实与来源\n\n## 我的判断\n\n## 反例与边界\n\n## 下一步行动";
    return `---\ntitle: ${yamlValue(title)}\ndate: ${localDate()}\ntype: ${$("#capture-type").value}\nstatus: inbox\nsource: ${yamlValue(source)}\ntags:\n${tags.map((tag) => `  - ${yamlValue(tag)}`).join("\n") || "  - inbox"}\n---\n\n# ${title}\n\n${body}\n`;
  }

  function initializeMaintenance() {
    $("#rebuild-index").addEventListener("click", async () => {
      if (!serverAvailable) {
        toast("请通过 Windows 启动脚本运行本地服务");
        return;
      }
      const button = $("#rebuild-index");
      button.disabled = true;
      $("#maintenance-status").textContent = "正在重建索引…";
      try {
        const result = await apiRequest("/api/reindex", { method: "POST" });
        $("#maintenance-status").textContent = result.output || "索引已重建";
        toast("索引已重建，正在刷新");
        window.setTimeout(() => window.location.reload(), 700);
      } catch (error) {
        $("#maintenance-status").textContent = error.message;
        toast("索引重建失败");
      } finally {
        button.disabled = false;
      }
    });
    $("#export-backup").addEventListener("click", exportBackup);
    $("#import-backup").addEventListener("click", () => $("#backup-file").click());
    $("#backup-file").addEventListener("change", importBackup);
  }

  function exportBackup() {
    if (serverAvailable) {
      const link = document.createElement("a");
      link.href = "/api/export";
      link.click();
      toast("SQLite 备份已生成");
      return;
    }
    const state = {};
    synchronizedKeys.forEach((key) => {
      const value = readJson(key, null);
      if (value !== null) state[key] = { value, updatedAt: new Date().toISOString() };
    });
    const blob = new Blob([JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), state, events: [] }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `personal-kb-browser-backup-${localDate()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast("浏览器状态备份已生成");
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (!payload.state || typeof payload.state !== "object") throw new Error("备份缺少 state 数据");
      if (serverAvailable) await apiRequest("/api/import", { method: "POST", body: JSON.stringify(payload) });
      Object.entries(payload.state).forEach(([key, item]) => {
        if (!synchronizedKeys.includes(key)) return;
        const value = item && Object.prototype.hasOwnProperty.call(item, "value") ? item.value : item;
        localStorage.setItem(key, JSON.stringify(value));
      });
      $("#maintenance-status").textContent = "备份已恢复";
      toast("备份已恢复，正在刷新");
      window.setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      $("#maintenance-status").textContent = error.message;
      toast("备份恢复失败");
    } finally {
      event.target.value = "";
    }
  }

  async function initialize() {
    await hydrateRemoteState();
    reviewState = readJson(reviewStorageKey, {});
    reviewSettings = normalizeReviewSettings(readJson(reviewSessionStorageKey, {}));
    workflows = readJson(workflowStorageKey, []);
    initializeNavigation();
    initializeLibrary();
    initializeSourcePreview();
    initializeWorkflows();
    initializeReview();
    initializeCoreMap();
    initializeStudyPaths();
    initializeCapture();
    initializeMaintenance();
    if (window.lucide) window.lucide.createIcons();
  }

  initialize().catch((error) => {
    setStorageStatus(false);
    toast(`初始化失败：${error.message}`);
  });
})();
