(function () {
  "use strict";

  const STORAGE_KEY = "rolefit.dailyJobCockpit.v1";
  const DAY_MS = 86400000;
  const SOURCE_VERIFIED_AT = "2026-08-15";
  const FRESHNESS_DAYS = 7;
  const SKILL_COMMAND = "用 $run-junxian-ai-job-search 安排我今天最高价值的学习、投递和跟进任务";
  const modes = {
    minimum: { label: "保底 20m", learn: 10, ship: 8, close: 2 },
    standard: { label: "标准 75m", learn: 25, ship: 40, close: 10 },
    deep: { label: "深度 120m", learn: 45, ship: 60, close: 15 }
  };

  const roles = [
    { id: "goto", priority: "A1", company: "GoTo Financial", title: "Senior Data Scientist · CV & AI", topic: "用 2 分钟回答：线上总体指标不变但 fraud/risk 场景投诉增加，如何按数据、模型、runtime 与业务成本定位？", minimumTopic: "写下 fraud/risk case 的四步排查标题并口述一次。", ship: "完成 GoTo 定制 CV 的 opening summary 与前三条公司项目 bullet，核对官方岗位仍开放后进入提交。", minimumShip: "打开 GoTo JD，写出一条最匹配的公司项目证据。", close: "在投递表记录 CV 版本、EP/薪资待确认项和 7 天 follow-up 日期。", interview: "multi-role-interview-playbook.html?role=goto#questions", url: "https://sg.linkedin.com/jobs/view/goto-financial-senior-data-scientist-computer-vision-ai-at-goto-group-4436873063" },
    { id: "motional", priority: "A2", company: "Motional", title: "Senior MLE · Perception", topic: "画出 camera/LiDAR 感知数据流，并回答稀有场景挖掘、时序同步和 safety release gate。", minimumTopic: "口述一个 field hard case 如何迁移为自动驾驶 edge-case test。", ship: "将 CV 的实时视觉、量化、C++/设备调试证据对齐 Motional 的 perception 与 safety 关键词，生成提交版。", minimumShip: "写出 Motional 最强匹配和最大缺口各一句。", close: "记录未证明的 sensor fusion 边界和需要补的 nuScenes 小实验。", interview: "multi-role-interview-playbook.html?role=motional#questions", url: "https://sg.linkedin.com/jobs/view/senior-machine-learning-engineer-perception-at-motional-4424876999" },
    { id: "micron", priority: "A3", company: "Micron Technology", title: "Principal / Staff ML/AI · Product Engineering", topic: "口述 MLOps take-home：数据 lineage、训练、评估 gate、registry、canary、drift 与 rollback。", minimumTopic: "画出 train → validate → deploy → monitor → rollback 五个框。", ship: "用训练到量化、导出校验、runtime contract 和 release gate 改写 Micron 定制 CV。", minimumShip: "写出一条“单项目流程如何沉淀成团队标准”的证据。", close: "记录 Principal/Staff scope、预算和 EP 三个 recruiter 问题。", interview: "multi-role-interview-playbook.html?role=micron#questions", url: "https://sg.linkedin.com/jobs/view/principal-staff-ml-ai-engineer-product-engineering-stpg-at-micron-technology-4410838256" },
    { id: "rge", priority: "A4", company: "RGE Digital", title: "Principal Computer Vision Engineer", topic: "准备 Principal 追问：如何建立跨项目的 CV evaluation standard 和技术路线，而非只优化一个模型。", minimumTopic: "写下一个你推动 release standard 的真实例子。", ship: "给岗位发布者写一条短消息，询问 Principal scope、fixed-pay band 与 EP 支持。", minimumShip: "只完成三句 recruiter qualification 草稿。", close: "将回复截止日设为 3 个工作日；无回复再 follow up 一次。", interview: "multi-role-interview-playbook.html?role=rge#questions", url: "https://sg.linkedin.com/jobs/view/senior-computer-vision-engineer-scientist-at-rge-4380072668" },
    { id: "partners", priority: "A5", company: "Partners Group", title: "Forward Deployed Engineer · AI", topic: "画一页 private-markets ACL-first RAG：ingestion、hybrid retrieval、tools、eval、audit 和 human review。", minimumTopic: "口述 build / buy / hybrid 的六个判断维度。", ship: "寻找一位 Partners Group 技术团队或 NUS 弱联系，写一条只问 team scope / EP 的低摩擦消息。", minimumShip: "找到一个相关弱联系并保存名字与共同点，不立即索要内推。", close: "记录金融背景与 enterprise LLM 的经验边界，以及下一份可展示 case artifact。", interview: "multi-role-interview-playbook.html?role=partners#questions", url: "https://sg.linkedin.com/jobs/view/forward-deployed-engineer-ai-engineer-at-partners-group-4433597613" },
    { id: "razer", priority: "B1", company: "Razer", title: "Senior AI Engineer · Applied", topic: "回答 build-vs-partner：能力、数据、延迟、成本、锁定与维护六维决策。", minimumTopic: "写下 build-vs-buy 六个维度。", ship: "先向 recruiter 确认 level、fixed base band 与 EP，再决定是否制作完整定制 CV。", minimumShip: "完成一条薪资与 EP qualification 问句。", close: "若 fixed pay 明显低于 S$150k，将岗位标为 Hold，不继续投入。", interview: "multi-role-interview-playbook.html?role=razer#questions", url: "https://sg.linkedin.com/jobs/view/senior-ai-engineer-applied-at-razer-inc-4414641003" },
    { id: "omnivision", priority: "B2", company: "OMNIVISION", title: "Sr. / Staff Algorithm Engineer · CV", topic: "复习 sensor raw → ISP → CV 的域变化：曝光、AWB、噪声、HDR、color 与 image-quality metrics。", minimumTopic: "用五句话解释 AWB、曝光和噪声如何影响下游 CV。", ship: "询问 Staff level 实际 scope、预算、EP，并准备 camera pipeline 定制 CV。", minimumShip: "写出最匹配的 camera pipeline 公司项目一句话。", close: "将 ISP/color science 缺口加入下一次学习，不把深度模型当成全部答案。", interview: "multi-role-interview-playbook.html?role=omnivision#questions", url: "https://sg.linkedin.com/jobs/view/sr-staff-algorithm-engineer-computer-vision-at-omnivision-4355070531" },
    { id: "sats", priority: "B4", company: "SATS", title: "Senior AI Engineer · Production GenAI & ML", topic: "回答传统 ML + LLM 共用平台的 lineage、eval、canary、observability 和 cost control。", minimumTopic: "画出 prompt / model / data / index 四类版本 lineage。", ship: "询问 6 年门槛是否硬性、云平台 ownership、fixed band 与 EP，再决定投入。", minimumShip: "写出四个 recruiter qualification 问题。", close: "明确 production discipline 是强项，企业 GenAI 年限是 gap。", interview: "multi-role-interview-playbook.html?role=sats#questions", url: "https://sg.linkedin.com/jobs/view/senior-ai-engineer-production-genai-and-ml-systems-at-sats-ltd-4437657732" }
  ];

  const skillGroups = [
    { id: "strong", title: "Strong · 可直接主张", subtitle: "已有公司项目或生产证据", items: [
      ["生产计算机视觉", "检测、分割、抠图、深度、跟踪、图像处理与相机 pipeline。", "主攻 CV / perception / imaging 岗"],
      ["模型到 Runtime", "量化、TFLite/ONNX、C++/Android、GPU pipeline 与设备调试。", "差异化证据"],
      ["评估与可靠性", "hard cases、golden cases、failure taxonomy、release gate。", "可迁移到 ML/Agent eval"],
      ["跨团队生产交付", "产品、runtime、QA、camera、客户团队共同复现与验收。", "Senior/FDE 行为证据"],
      ["Python AI 工程", "PyTorch 训练、评估、数据处理与调试；C++ 为生产补充。", "继续补限时算法" ]
    ]},
    { id: "adjacent", title: "Adjacent · 说明迁移", subtitle: "能力相邻，但不能说成直接年限", items: [
      ["MLOps / ML 平台", "训练到部署纪律强；共享云平台、feature store 与大规模 serving 证据较弱。", "用 Micron case 补全"],
      ["FDE 问题拆解", "能把现场模糊反馈变成可复现问题和交付决策。", "补客户 discovery 结构"],
      ["RAG / Agent Evaluation", "理解 ACL、retrieval、tool contract、trace、fallback 与 eval。", "用 enterprise case 证明"],
      ["技术领导力", "有标准、发布判断和跨团队协调；正式 mentoring 与组织 scope 待确认。", "补真实影响故事"]
    ]},
    { id: "next", title: "Build Next · 每日学习", subtitle: "只补目标岗位马上会用的缺口", items: [
      ["SQL + 统计实验", "GoTo DS 需要 SQL、显著性、校准、A/B test 和 product/risk metrics。", "本周 2 次 25 分钟"],
      ["Cloud / Kubernetes / On-prem", "FDE 与平台岗会追权限、部署、容量、可观测和故障恢复。", "完成受限部署设计"],
      ["Agent 生产与安全", "缺 multi-year production ownership；需要 eval、audit、idempotency case。", "不靠 VEMO 夸大"],
      ["Sensor fusion / Trust domain", "Motional、OKX、Shopee 分别需要 fusion、PAD、calibration 与攻击切片。", "按岗位选择一个补"]
    ]}
  ];

  const methods = [
    { no: "01", title: "计划要具体到动作", copy: "求职计划实验显示，详细 plan-making 能在不增加搜索时间的情况下提升申请数量；所以页面要求今天先选岗位和交付物。", url: "https://www.aeaweb.org/articles?id=10.1257/app.20170566", label: "AEA field experiment" },
    { no: "02", title: "用 if–then 消灭临场决定", copy: "实施意向把“我应该做”改成“触发点出现就开始”，并提供错过后的保底规则，降低启动成本。", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10585941/", label: "Implementation intentions" },
    { no: "03", title: "每天保留一个弱联系动作", copy: "LinkedIn 大规模实验发现适度弱联系对工作流动有帮助；因此联络不是等需要内推时才做。", url: "https://news.mit.edu/2022/weak-ties-linkedin-employment-0915", label: "MIT / Science summary" },
    { no: "04", title: "证据会复利，不做 AI 海投", copy: "优秀开源流程都保留 canonical profile、claim check、实际提交版本与结果回流；每次申请让下一次更快，而不是生成更多空泛材料。", url: "https://github.com/Remotivated/job-hunt-skills", label: "Job Hunt Skills" }
  ];

  const weeklyRhythm = [
    ["周一", "A 岗定制", "完成一个高匹配岗位的 CV / 申请"],
    ["周二", "A 岗 + 弱联系", "投递或准备提交，并写一条具体联络"],
    ["周三", "生产 ML", "平台 / MLOps 岗与系统设计输出"],
    ["周四", "Level 验证", "Principal / Staff scope、薪资和 EP"],
    ["周五", "FDE / Agent", "企业 case + 客户问题拆解"],
    ["周六", "批量收口", "薪资/EP qualification 与 overdue follow-up"],
    ["周日", "复盘预载", "模拟面试、漏斗复盘、写好周一第一步"]
  ];

  const today = new Date();
  const todayKey = localDateKey(today);
  const baseDate = new Date(2026, 7, 16);
  const rotationIndex = Math.max(0, Math.floor((stripTime(today) - stripTime(baseDate)) / DAY_MS)) % roles.length;
  let storageAvailable = true;
  let data = loadData();
  let timerSeconds = 15 * 60;
  let timerHandle = null;
  let toastHandle = null;

  ensureToday();

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function stripTime(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(); }

  function loadData() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed && parsed.days ? parsed : { settings: {}, days: {}, logs: [] };
    } catch (_) {
      storageAvailable = false;
      return { settings: {}, days: {}, logs: [] };
    }
  }

  function ensureToday() {
    data.settings = Object.assign({ anchorTime: "20:30", anchorEvent: "晚饭", anchorPlace: "书桌" }, data.settings || {});
    data.days[todayKey] = Object.assign({ mode: "standard", roleId: roles[rotationIndex].id, tasks: { learn: false, ship: false, close: false } }, data.days[todayKey] || {});
    data.days[todayKey].tasks = Object.assign({ learn: false, ship: false, close: false }, data.days[todayKey].tasks || {});
    data.logs = Array.isArray(data.logs) ? data.logs : [];
    data.roleChecks = data.roleChecks && typeof data.roleChecks === "object" ? data.roleChecks : {};
    saveData();
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      storageAvailable = true;
      return true;
    } catch (_) {
      storageAvailable = false;
      return false;
    }
  }
  function currentDay() { return data.days[todayKey]; }
  function currentRole() { return roles.find(role => role.id === currentDay().roleId) || roles[0]; }
  function currentMode() { return modes[currentDay().mode] || modes.standard; }
  function icon(name) { return `<svg aria-hidden="true"><use href="#icon-${name}"/></svg>`; }
  function escapeHtml(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

  function renderHeader() {
    document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("zh-CN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(today).toUpperCase();
  }

  function renderModes() {
    document.querySelector("#mode-switch").innerHTML = Object.entries(modes).map(([id, mode]) => {
      const active = currentDay().mode === id;
      return `<button type="button" data-mode="${id}" class="${active ? "active" : ""}" aria-pressed="${active}">${mode.label}</button>`;
    }).join("");
  }

  function renderRoleSelector() {
    const selector = document.querySelector("#role-selector");
    selector.innerHTML = roles.map(role => `<option value="${role.id}" ${role.id === currentDay().roleId ? "selected" : ""}>${role.priority} · ${escapeHtml(role.company)} · ${escapeHtml(role.title)}</option>`).join("");
  }

  function roleFreshness() {
    const verifiedAt = data.roleChecks[currentRole().id] || SOURCE_VERIFIED_AT;
    const verifiedTime = new Date(`${verifiedAt}T00:00:00`).getTime();
    const age = Number.isFinite(verifiedTime) ? Math.max(0, Math.floor((stripTime(today) - verifiedTime) / DAY_MS)) : Infinity;
    return { verifiedAt, age, fresh: age <= FRESHNESS_DAYS };
  }

  function renderFreshness() {
    const role = currentRole();
    const freshness = roleFreshness();
    const title = freshness.fresh ? `岗位已于 ${freshness.verifiedAt} 核验` : `岗位资料已 ${freshness.age} 天未核验`;
    const detail = freshness.fresh ? "仍需在正式提交前再次确认 EP 与固定薪资范围。" : "先确认岗位仍开放；若已关闭，立即切换，不继续制作材料。";
    document.querySelector("#freshness-gate").className = `freshness-gate ${freshness.fresh ? "fresh" : "stale"}`;
    document.querySelector("#freshness-gate").innerHTML = `<i class="freshness-dot" aria-hidden="true"></i><div><strong>${title}</strong><span>${detail}</span></div><a href="${escapeHtml(role.url)}" target="_blank" rel="noopener noreferrer">打开岗位页</a><button id="verify-role" type="button">我已核验仍开放</button>`;
  }

  function tasksForDay() {
    const role = currentRole();
    const mode = currentMode();
    const isMinimum = currentDay().mode === "minimum";
    return [
      { id: "learn", label: "LEARN", title: "学会一个马上会被问到的答案", detail: isMinimum ? role.minimumTopic : role.topic, minutes: mode.learn, url: role.interview, link: "打开对应面试题" },
      { id: "ship", label: "SHIP", title: "推进一个真实申请动作", detail: isMinimum ? role.minimumShip : role.ship, minutes: mode.ship, url: role.url, link: "打开岗位页" },
      { id: "close", label: "CLOSE", title: "给明天留下入口", detail: role.close, minutes: mode.close, url: "index.html?tab=status", link: "打开求职追踪" }
    ];
  }

  function renderTasks() {
    document.querySelector("#task-list").innerHTML = tasksForDay().map(task => {
      const done = Boolean(currentDay().tasks[task.id]);
      return `<article class="task-item ${done ? "done" : ""}">
        <label class="task-check"><input type="checkbox" data-task="${task.id}" aria-label="完成：${escapeHtml(task.title)}" ${done ? "checked" : ""}><span>${icon("check")}</span></label>
        <div class="task-copy"><span>${task.label}</span><h3>${task.title}</h3><p>${escapeHtml(task.detail)}</p><a class="task-link" href="${task.url}" ${task.url.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}>${task.link} ${icon("arrow")}</a></div>
        <span class="task-time">${task.minutes} min</span>
      </article>`;
    }).join("");
    updateContractProgress();
  }

  function updateContractProgress() {
    const count = Object.values(currentDay().tasks).filter(Boolean).length;
    document.querySelector("#contract-progress-copy").textContent = `${count} / 3`;
    document.querySelector("#contract-progress-bar").style.width = `${(count / 3) * 100}%`;
    updateMomentum();
  }

  function dayContractComplete(day) { return Boolean(day?.tasks?.learn && day?.tasks?.ship); }

  function weekStart(date) {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = result.getDay() || 7;
    result.setDate(result.getDate() - day + 1);
    return result;
  }

  function currentWeekDates() {
    const start = weekStart(today);
    return Array.from({ length: 7 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  }

  function calculateStreak() {
    let streak = 0;
    let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (!dayContractComplete(data.days[localDateKey(cursor)])) cursor.setDate(cursor.getDate() - 1);
    while (dayContractComplete(data.days[localDateKey(cursor)])) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
    return streak;
  }

  function updateMomentum() {
    const weekKeys = currentWeekDates().map(localDateKey);
    const completed = weekKeys.filter(key => dayContractComplete(data.days[key])).length;
    document.querySelector("#streak-count").textContent = calculateStreak();
    document.querySelector("#week-contracts").textContent = `${completed} / 7 天`;
  }

  function renderIntention() {
    document.querySelector("#anchor-time").value = data.settings.anchorTime;
    document.querySelector("#anchor-event").value = data.settings.anchorEvent;
    document.querySelector("#anchor-place").value = data.settings.anchorPlace;
    document.querySelector("#intention-sentence").textContent = `如果我在 ${data.settings.anchorTime} 完成“${data.settings.anchorEvent}”，那么我就在${data.settings.anchorPlace}打开每日驾驶舱，先做 10 分钟学习任务；如果错过，就在睡前执行 20 分钟保底模式，不把债留到明天。`;
  }

  function renderWeek() {
    const dates = currentWeekDates();
    document.querySelector("#week-grid").innerHTML = dates.map((date, index) => {
      const key = localDateKey(date);
      const complete = dayContractComplete(data.days[key]);
      return `<article class="week-day ${key === todayKey ? "today" : ""} ${complete ? "complete" : ""}"><span>${weeklyRhythm[index][0]} · ${String(date.getDate()).padStart(2, "0")}</span><strong>${weeklyRhythm[index][1]}</strong><p>${weeklyRhythm[index][2]}</p><span class="week-status">${complete ? "已完成合约" : key === todayKey ? "今天" : "待执行"}</span></article>`;
    }).join("");
  }

  function renderSkillMap() {
    document.querySelector("#skill-map").innerHTML = skillGroups.map(group => `<section class="skill-column" data-level="${group.id}"><header><strong>${group.title}</strong><span>${group.subtitle}</span></header>${group.items.map(item => `<div class="skill-row"><strong>${item[0]}</strong><span>${item[1]}</span><small>${item[2]}</small></div>`).join("")}</section>`).join("");
  }

  function renderMethods() {
    document.querySelector("#method-grid").innerHTML = methods.map(method => `<article class="method-card"><span>${method.no}</span><h3>${method.title}</h3><p>${method.copy}</p><a href="${method.url}" target="_blank" rel="noopener noreferrer">${method.label} ${icon("arrow")}</a></article>`).join("");
  }

  function weekLogs() {
    const start = stripTime(weekStart(today));
    const end = start + 7 * DAY_MS;
    return data.logs.filter(log => { const time = new Date(`${log.date}T00:00:00`).getTime(); return time >= start && time < end; });
  }

  function renderLogs() {
    const labels = { application: "已投递", outreach: "已联络", followup: "Follow-up", artifact: "申请材料", mock: "面试练习" };
    const visible = data.logs.slice().reverse().slice(0, 8);
    document.querySelector("#ship-log").innerHTML = visible.length ? visible.map(log => `<div class="log-item"><strong>${labels[log.type] || log.type}</strong><span>${escapeHtml(log.note)} · ${log.date}</span><button type="button" data-delete-log="${log.id}" aria-label="删除 ${escapeHtml(log.date)} 的${escapeHtml(labels[log.type] || log.type)}记录">删除</button></div>`).join("") : `<p class="empty-log">今天还没有记录。完成一份可提交材料、一次联络或一次练习后再添加。</p>`;
    const logs = weekLogs();
    document.querySelector("#metric-applications").textContent = logs.filter(log => log.type === "application").length;
    document.querySelector("#metric-conversations").textContent = logs.filter(log => ["outreach", "followup"].includes(log.type)).length;
    document.querySelector("#metric-practice").textContent = logs.filter(log => log.type === "mock").length;
  }

  function updateTimer() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    document.querySelector("#timer-display").textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function toggleTimer() {
    const button = document.querySelector("#timer-toggle");
    if (timerHandle) {
      clearInterval(timerHandle); timerHandle = null;
      button.innerHTML = `${icon("play")}<span>继续专注</span>`;
      return;
    }
    if (timerSeconds <= 0) {
      timerSeconds = 15 * 60;
      updateTimer();
    }
    timerHandle = setInterval(() => {
      timerSeconds -= 1; updateTimer();
      if (timerSeconds <= 0) {
        clearInterval(timerHandle); timerHandle = null;
        button.innerHTML = `${icon("play")}<span>再来一轮</span>`;
        showToast("15 分钟完成。现在保存一个可见输出。");
      }
    }, 1000);
    button.innerHTML = `${icon("pause")}<span>暂停</span>`;
  }

  function resetTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null; timerSeconds = 15 * 60; updateTimer();
    document.querySelector("#timer-toggle").innerHTML = `${icon("play")}<span>开始专注</span>`;
  }

  function showToast(message, duration = 1800) {
    const toast = document.querySelector("#toast");
    if (toastHandle) clearTimeout(toastHandle);
    toast.textContent = message;
    toast.classList.add("show");
    toastHandle = setTimeout(() => toast.classList.remove("show"), duration);
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_) {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand("copy");
      area.remove();
      return copied;
    }
  }

  function rerenderContract() { renderModes(); renderRoleSelector(); renderFreshness(); renderTasks(); renderWeek(); }

  document.addEventListener("click", event => {
    const modeButton = event.target.closest("[data-mode]");
    if (modeButton) { currentDay().mode = modeButton.dataset.mode; saveData(); rerenderContract(); showToast(`已切换为${modes[currentDay().mode].label}`); return; }
    if (event.target.closest("#verify-role")) {
      data.roleChecks[currentRole().id] = todayKey;
      saveData();
      renderFreshness();
      showToast(`已记录 ${currentRole().company} 岗位今天仍开放。`);
      return;
    }
    if (event.target.closest("#copy-skill-command")) {
      copyText(SKILL_COMMAND).then(copied => showToast(copied ? "个人 Skill 指令已复制。" : `请复制：${SKILL_COMMAND}`, copied ? 1800 : 5000));
      return;
    }
    const deleteButton = event.target.closest("[data-delete-log]");
    if (deleteButton) { data.logs = data.logs.filter(log => log.id !== deleteButton.dataset.deleteLog); saveData(); renderLogs(); return; }
  });

  document.addEventListener("change", event => {
    if (event.target.matches("[data-task]")) {
      currentDay().tasks[event.target.dataset.task] = event.target.checked; saveData(); renderTasks(); renderWeek();
      if (dayContractComplete(currentDay())) showToast("今天的学习 + 推进合约已完成。可以安心停止。");
    }
    if (event.target.matches("#role-selector")) { currentDay().roleId = event.target.value; saveData(); renderFreshness(); renderTasks(); showToast(`今日主攻已切换为 ${currentRole().company}`); }
  });

  ["anchor-time", "anchor-event", "anchor-place"].forEach(id => document.querySelector(`#${id}`).addEventListener("input", event => {
    const map = { "anchor-time": "anchorTime", "anchor-event": "anchorEvent", "anchor-place": "anchorPlace" };
    data.settings[map[id]] = event.target.value; saveData(); renderIntention();
  }));

  document.querySelector("#rescue-mode").addEventListener("click", () => { currentDay().mode = "minimum"; saveData(); rerenderContract(); showToast("已切到 20 分钟保底模式。今天不追债，只完成最小闭环。"); });
  document.querySelector("#timer-toggle").addEventListener("click", toggleTimer);
  document.querySelector("#timer-reset").addEventListener("click", resetTimer);
  document.querySelector("#ship-form").addEventListener("submit", event => {
    event.preventDefault();
    const type = document.querySelector("#ship-type").value;
    const note = document.querySelector("#ship-note").value.trim();
    if (!note) return;
    data.logs.push({ id: `${Date.now()}`, date: todayKey, type, note, roleId: currentRole().id });
    if (["application", "outreach", "followup", "artifact"].includes(type)) currentDay().tasks.ship = true;
    if (type === "mock") currentDay().tasks.learn = true;
    document.querySelector("#ship-note").value = "";
    saveData(); renderLogs(); renderTasks(); renderWeek(); showToast("结果已保存到本地行动日志。");
  });

  renderHeader(); renderModes(); renderRoleSelector(); renderFreshness(); renderTasks(); renderIntention(); renderWeek(); renderSkillMap(); renderMethods(); renderLogs(); updateTimer();
  if (!storageAvailable) showToast("浏览器禁止本地保存；本次进度只会保留到页面关闭。", 5000);
})();
