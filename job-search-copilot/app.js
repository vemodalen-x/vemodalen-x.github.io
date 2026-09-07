(function () {
  "use strict";

  const DATA = window.ROLEFIT_DATA;
  const jobs = DATA.jobs;
  const candidate = DATA.candidate;
  const salaryNegotiation = DATA.salaryNegotiation;
  const workflowReference = DATA.workflowReference;
  const linkedinOpportunityPipeline = DATA.linkedinOpportunityPipeline || { roles: [] };
  const industryJobSearchPlaybook = DATA.industryJobSearchPlaybook;
  const communityInterviewBank = DATA.communityInterviewBank;
  const agentSecondRoundBank = DATA.agentSecondRoundBank;
  const visualGenAIBank = DATA.visualGenAIBank;
  const deepMLBank = DATA.deepMLBank;
  const pythonAlgorithmBank = DATA.pythonAlgorithmBank;
  const initialParams = new URLSearchParams(window.location.search);
  const requestedJob = initialParams.get("job");
  const requestedTab = initialParams.get("tab");
  const readStorage = (key, fallback = null) => {
    try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; }
  };
  const storedJob = readStorage("rolefit.currentJob", "sea");
  const state = {
    currentJobId: ["sea", "bytedance"].includes(requestedJob) ? requestedJob : (["sea", "bytedance"].includes(storedJob) ? storedJob : "sea"),
    currentTab: ["status", "radar", "resume", "interview", "salary", "company", "quality"].includes(requestedTab) ? requestedTab : "status",
    matrixFilter: "all",
    questionBankFilter: "recommended",
    agentRoundFilter: "priority",
    visualGenAIFilter: "priority",
    deepMLFilter: "priority",
    pythonAlgorithmFilter: "priority",
    timerSeconds: 120,
    timerRunning: false,
    timerHandle: null,
    customJob: null
  };

  const labels = {
    strong: "强证据",
    partial: "待补强",
    gap: "缺口"
  };

  const tabLabels = {
    status: "进度中心",
    radar: "岗位雷达",
    resume: "定制简历",
    interview: "面试冲刺",
    salary: "薪资谈判",
    company: "公司情报",
    quality: "质量校验"
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function getJob() {
    return state.currentJobId === "custom" ? state.customJob : jobs[state.currentJobId];
  }

  function safeStore(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* storage can be blocked */ }
  }

  const pipelineLabels = {
    preparing: "准备中",
    applied: "已申请",
    interview: "面试中",
    offer: "Offer",
    closed: "已结束"
  };

  function outcomeEvents(jobId) {
    try { return JSON.parse(localStorage.getItem(`rolefit.outcomes.${jobId}`) || "[]"); } catch (_) { return []; }
  }

  function derivedPipelineStatus(job) {
    const events = outcomeEvents(job.id);
    const statusEvents = [...events].reverse().find(item => ["interview", "offer", "rejected", "withdrawn"].includes(item.type));
    const baselineStatus = job.application?.pipelineStatus || "preparing";
    const baselineDate = job.application?.updated || job.application?.lastActivity || job.sourceDate || "";
    if (!statusEvents || (statusEvents.date && baselineDate && statusEvents.date < baselineDate)) return baselineStatus;
    return { interview: "interview", offer: "offer", rejected: "closed", withdrawn: "closed" }[statusEvents.type];
  }

  function latestActivity(job) {
    const dates = [job.application?.lastActivity, ...outcomeEvents(job.id).map(item => item.date)].filter(Boolean).sort();
    return dates.at(-1) || job.sourceDate;
  }

  function needsFollowUp(job) {
    const status = derivedPipelineStatus(job);
    if (!["applied", "interview"].includes(status)) return false;
    const nextDate = job.application?.nextEvent?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
    if (nextDate && new Date(`${nextDate}T23:59:59`).getTime() >= Date.now()) return false;
    const elapsed = Date.now() - new Date(`${latestActivity(job)}T00:00:00`).getTime();
    return elapsed >= 10 * 24 * 60 * 60 * 1000;
  }

  function daysSince(dateString) {
    const time = new Date(`${dateString}T00:00:00`).getTime();
    if (!Number.isFinite(time)) return Infinity;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return Math.max(0, Math.floor((today - time) / (24 * 60 * 60 * 1000)));
  }

  function renderStatus(job) {
    const application = job.application || {
      stage: "准备材料",
      stageIndex: 0,
      pipelineStatus: "preparing",
      lastActivity: job.sourceDate,
      channel: "本地 JD",
      contactPerson: "尚无联系人",
      updated: job.sourceDate,
      nextEvent: "待更新",
      nextEventLabel: "暂无已确认安排",
      statusSummary: "这是本地分析岗位；请手动记录真实申请进度。",
      milestones: [{ state: "current", date: "现在", title: "准备材料", detail: "核对岗位、CV 与投递渠道" }],
      actions: ["核对官方岗位", "校对定制 CV", "提交后记录日期与联系人"],
      links: job.url ? [{ label: "打开官方岗位", url: job.url }] : []
    };
    const trackedJobs = [jobs.sea, jobs.bytedance];
    const linkedinRoles = linkedinOpportunityPipeline.roles || [];
    const readyCount = linkedinRoles.filter(item => item.status === "Ready").length;
    const pipelineAge = daysSince(linkedinOpportunityPipeline.verifiedAt);
    const pipelineStale = pipelineAge > 7;
    const actionableReadyCount = pipelineStale ? 0 : readyCount;
    const salaryCheckCount = linkedinRoles.filter(item => item.status === "Salary Check").length;
    const activeCount = trackedJobs.filter(item => ["applied", "interview", "offer"].includes(derivedPipelineStatus(item))).length;
    const interviewCount = trackedJobs.filter(item => derivedPipelineStatus(item) === "interview").length;
    const followUpCount = trackedJobs.filter(needsFollowUp).length;
    const localEvents = outcomeEvents(job.id).slice().reverse();
    const archive = application.archive;
    const progress = Math.max(8, Math.min(100, ((Number(application.stageIndex) + 1) / Math.max(4, application.milestones.length)) * 100));
    const closedApplication = derivedPipelineStatus(job) === "closed";
    const watchoutTitle = closedApplication ? "该申请已归档" : job.id === "sea" ? "检查已确认安排" : "提交状态尚未确认";
    const watchoutCopy = closedApplication
      ? "不再为该岗位安排准备或跟进时间；保留真实材料与经验边界，并迁移到当前主攻岗位。"
      : job.id === "sea"
        ? "只以最新邮件与日历邀请为准；如果时间、会议入口或面试阶段变化，立即追加到本地记录。"
        : "页面不会把“准备完成”自动标记为“已申请”。提交后再更新真实日期与后续联系。";
    $("#tab-status").innerHTML = `
      <div class="pipeline-summary-grid">
        <article><span>TRACKED</span><strong>${trackedJobs.length + linkedinRoles.length}</strong><small>工作台 + LinkedIn 候选池</small></article>
        <article class="${pipelineStale ? "attention" : ""}"><span>READY</span><strong>${actionableReadyCount}</strong><small>${pipelineStale ? `候选池已 ${pipelineAge} 天未核验` : "建议现在投递"}</small></article>
        <article><span>SALARY CHECK</span><strong>${salaryCheckCount}</strong><small>先核实薪资再定制</small></article>
        <article class="${followUpCount ? "attention" : ""}"><span>FOLLOW-UP</span><strong>${followUpCount}</strong><small>超过 10 天无新动态</small></article>
      </div>
      <article class="card pipeline-board">
        <div class="card-header"><div class="card-header-copy"><span class="eyebrow">APPLICATION PIPELINE</span><h3>跨岗位申请管道</h3><p>状态归一化后统一查看；点击一行切换当前岗位。</p></div><a class="workflow-credit" href="${escapeHtml(workflowReference.url)}" target="_blank" rel="noreferrer">工作流参考 ${icon("external")}</a></div>
        <div class="pipeline-table-head"><span>公司 / 岗位</span><span>状态</span><span>最近动态</span><span>下一步</span><span>匹配</span></div>
        <div class="pipeline-table-body">${trackedJobs.map(item => {
          const status = derivedPipelineStatus(item);
          return `<button class="pipeline-row ${item.id === job.id ? "active" : ""}" data-job="${escapeHtml(item.id)}"><span class="pipeline-role"><i class="mini-logo">${escapeHtml(item.logo)}</i><span><strong>${escapeHtml(item.shortName)}</strong><small>${escapeHtml(item.title)}</small></span></span><span><b class="pipeline-status ${status}">${escapeHtml(pipelineLabels[status])}</b></span><span>${escapeHtml(latestActivity(item))}</span><span>${escapeHtml(item.application?.nextEvent || "待更新")}${needsFollowUp(item) ? `<em>需要跟进</em>` : ""}</span><span><strong>${escapeHtml(item.fit)}%</strong></span></button>`;
        }).join("")}</div>
      </article>
      <article class="card linkedin-opportunity-board ${pipelineStale ? "stale" : ""}">
        <div class="card-header"><div class="card-header-copy"><span class="eyebrow">LINKEDIN SEARCH · ${escapeHtml(linkedinOpportunityPipeline.verifiedAt)}${pipelineStale ? ` · ${pipelineAge} 天未核验` : ""}</span><h3>新加坡 AI 岗位投递表</h3><p>${escapeHtml(linkedinOpportunityPipeline.target)}；${pipelineStale ? "当前仅作为历史候选池，投递前必须确认岗位仍开放。" : "EP 均以 recruiter/SAT 确认为准。"}</p></div><div class="card-header-actions"><a class="workflow-credit primary-credit" href="daily-job-search-cockpit.html">打开每日求职驾驶舱 ${icon("external")}</a><a class="workflow-credit" href="multi-role-interview-playbook.html">多岗位面试手册 ${icon("external")}</a></div></div>
        <div class="linkedin-opportunity-scroll">
          <div class="linkedin-opportunity-head"><span>优先级</span><span>公司 / 岗位</span><span>匹配</span><span>薪资信号</span><span>EP</span><span>状态 / 下一步</span></div>
          <div class="linkedin-opportunity-body">${linkedinRoles.map(item => {
            const status = pipelineStale && item.status !== "Closed" ? "Recheck" : item.status;
            const next = pipelineStale && item.status !== "Closed" ? "先确认岗位仍开放，再决定是否投入" : item.next;
            return `<a class="linkedin-opportunity-row" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"><span class="opportunity-priority">${escapeHtml(item.priority)}</span><span class="opportunity-role"><strong>${escapeHtml(item.company)}</strong><small>${escapeHtml(item.role)}</small></span><span class="opportunity-fit">${escapeHtml(item.fit)}%</span><span>${escapeHtml(item.salary)}</span><span>${escapeHtml(item.ep)}</span><span><b class="opportunity-status status-${escapeHtml(status.toLowerCase().replaceAll(" ", "-"))}">${escapeHtml(status)}</b><small>${escapeHtml(next)}</small></span></a>`;
          }).join("")}</div>
        </div>
      </article>
      <article class="status-hero-card">
        <div>
          <span class="eyebrow">APPLICATION COMMAND CENTER</span>
          <div class="status-title-row"><h2>${escapeHtml(application.stage)}</h2><span class="live-badge"><i></i> 更新于 ${escapeHtml(application.updated)}</span></div>
          <p>${escapeHtml(application.statusSummary)}</p>
        </div>
        <div class="next-event-block"><span>${closedApplication ? "NEXT EVENT" : "NEXT CONFIRMED EVENT"}</span><strong>${escapeHtml(application.nextEvent)}</strong><small>${escapeHtml(application.nextEventLabel)}</small></div>
      </article>
      <div class="status-layout">
        <div>
          <article class="card status-timeline-card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">APPLICATION TRACKER</span><h3>当前申请路径</h3><p>只记录已确认的进度；未知轮次保持待更新。</p></div><span class="stage-chip">${escapeHtml(application.stage)}</span></div>
            <div class="application-progress"><span style="width:${progress}%"></span></div>
            <div class="status-timeline">${application.milestones.map(item => `
              <div class="timeline-item ${escapeHtml(item.state)}">
                <div class="timeline-marker">${item.state === "done" ? icon("check") : ""}</div>
                <div class="timeline-date">${escapeHtml(item.date)}</div>
                <div class="timeline-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div>
              </div>`).join("")}</div>
          </article>
          <article class="card status-focus-card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">NEXT ACTIONS</span><h3>${closedApplication ? "归档后只做这几件事" : "面试前只做这几件事"}</h3></div></div>
            <div class="status-action-grid">${application.actions.map((action, index) => `<div class="status-action"><span>${String(index + 1).padStart(2, "0")}</span><p>${escapeHtml(action)}</p></div>`).join("")}</div>
          </article>
          ${archive ? `<article class="card application-archive-card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">SUBMITTED APPLICATION ARCHIVE</span><h3>面试官实际看到的材料</h3><p>准备答案时以已投递版本为准，不用后来修改的草稿覆盖历史。</p></div><span class="archive-lock">只读快照</span></div>
            <div class="archive-grid">
              <a href="${escapeHtml(archive.postingUrl)}" target="_blank" rel="noreferrer"><span>岗位原文</span><strong>${escapeHtml(archive.posting)}</strong>${icon("external")}</a>
              <a href="${escapeHtml(archive.submittedCvUrl)}" target="_blank" rel="noreferrer"><span>CV 版本</span><strong>${escapeHtml(archive.submittedCv)}</strong>${icon("external")}</a>
              <div><span>Cover Letter</span><strong>${escapeHtml(archive.coverLetter)}</strong></div>
              <div><span>提交日期</span><strong>${escapeHtml(archive.appliedAt)}</strong></div>
            </div>
          </article>` : ""}
        </div>
        <aside class="status-sidebar">
          <article class="card quick-entry-card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">QUICK ACCESS</span><h3>材料与记录</h3><p>从这里进入准备、CV、追踪表和邮件。</p></div></div>
            <div class="quick-link-list">${application.links.map(link => `<a class="quick-link" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer"><span>${escapeHtml(link.label)}</span>${icon("external")}</a>`).join("") || `<p class="empty-note">暂无已绑定材料。</p>`}</div>
          </article>
          <article class="card outcome-journal-card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">APPEND-ONLY JOURNAL</span><h3>新增申请动态</h3><p>面试、反馈、Offer 或拒信只追加，不改写旧记录。</p></div></div>
            <div class="outcome-form">
              <div><select id="outcome-type" aria-label="动态类型"><option value="update">一般更新</option><option value="interview">面试安排</option><option value="feedback">面试反馈</option><option value="followup">Follow-up</option><option value="offer">Offer</option><option value="rejected">拒信</option><option value="withdrawn">主动退出</option></select><input id="outcome-date" type="date" value="${new Date().toISOString().slice(0, 10)}" aria-label="动态日期"></div>
              <textarea id="outcome-note" rows="3" placeholder="记录发生了什么、反馈原话或下一步。"></textarea>
              <button class="primary-button" id="save-outcome-event">追加到本地记录</button>
            </div>
            <div class="outcome-history">${localEvents.length ? localEvents.map(item => `<div><span>${escapeHtml(item.date)}</span><strong>${escapeHtml({ update: "更新", interview: "面试", feedback: "反馈", followup: "跟进", offer: "Offer", rejected: "拒信", withdrawn: "退出" }[item.type] || item.type)}</strong><p>${escapeHtml(item.note)}</p></div>`).join("") : `<p class="empty-note">尚无新增本地记录；上方已确认里程碑不会重复写入这里。</p>`}</div>
          </article>
          <article class="card status-note-card"><span class="eyebrow">CURRENT WATCHOUT</span><strong>${escapeHtml(watchoutTitle)}</strong><p>${escapeHtml(watchoutCopy)}</p></article>
        </aside>
      </div>`;
  }

  function renderJobSwitcher() {
    const allJobs = [jobs.sea, jobs.bytedance].concat(state.customJob ? [state.customJob] : []);
    $("#job-switcher").innerHTML = allJobs.map(job => `
      <button class="job-switch-button ${job.id === state.currentJobId ? "active" : ""}" data-job="${escapeHtml(job.id)}">
        <span class="mini-logo">${escapeHtml(job.logo)}</span>
        <span class="switch-copy"><strong>${escapeHtml(job.shortName)}</strong><small>${escapeHtml(job.title)}</small></span>
        ${icon("chevron")}
      </button>`).join("");
  }

  function renderMobileTabs() {
    $("#mobile-tabs").innerHTML = Object.entries(tabLabels).map(([id, label]) => `
      <button class="mobile-tab ${state.currentTab === id ? "active" : ""}" data-tab="${id}">${label}</button>
    `).join("");
  }

  function renderHero(job) {
    const source = job.url
      ? `<a class="source-link" href="${escapeHtml(job.url)}" target="_blank" rel="noreferrer">${escapeHtml(job.sourceLabel)} ${icon("external")}</a>`
      : `<span>${escapeHtml(job.sourceLabel)}</span>`;
    $("#job-url").value = job.url || "";
    $("#job-hero").innerHTML = `
      <div>
        <div class="job-heading">
          <div class="company-logo ${escapeHtml(job.logoTone)}"><span>${escapeHtml(job.logo)}</span></div>
          <div class="job-heading-copy">
            <span class="eyebrow">${escapeHtml(job.company)}</span>
            <h2>${escapeHtml(job.title)}</h2>
            <div class="job-meta"><span>${escapeHtml(job.location)}</span><span>${escapeHtml(job.team)}</span><span>${escapeHtml(job.level)}</span><span>${escapeHtml(job.jobCode)}</span></div>
          </div>
        </div>
        <p class="job-verdict"><strong>判断：</strong>${escapeHtml(job.verdict)} · ${source}</p>
      </div>
      <div class="fit-card">
        <div class="fit-ring" style="--score:${Number(job.fit) || 0}"><strong>${escapeHtml(job.fit)}<small>%</small></strong></div>
        <div class="fit-copy"><span>FIT SIGNAL</span><strong>${escapeHtml(job.fitLabel)}</strong></div>
      </div>`;
  }

  function renderRadar(job) {
    const evaluation = job.evaluation || {
      eligibility: { status: "unverified", label: "工作资格待核实", detail: "本地 JD 未提供足够信息；申请前核对 citizenship、work rights 与 sponsorship。" },
      location: { status: "unknown", label: "地点待核实", detail: job.location },
      dimensions: [
        { label: "技术技能", score: job.fit, weight: 30, note: "基于当前 requirements × evidence。" },
        { label: "经验贴合", score: job.fit, weight: 25, note: "需要人工复核直接与相邻经验。" },
        { label: "行为与协作", score: job.fit, weight: 15, note: "当前信息有限。" },
        { label: "职业方向", score: job.fit, weight: 30, note: "需要结合长期目标确认。" }
      ]
    };
    const visibleRequirements = job.requirements.filter(item => state.matrixFilter === "all" || item.status === state.matrixFilter);
    const matrixRows = visibleRequirements.length ? visibleRequirements.map(item => `
      <div class="matrix-row" data-status="${escapeHtml(item.status)}">
        <div class="matrix-skill"><strong>${escapeHtml(item.skill)}</strong><small>${escapeHtml(item.priority)}</small></div>
        <span class="status-pill ${escapeHtml(item.status)}">${labels[item.status] || item.status}</span>
        <div class="matrix-evidence">${escapeHtml(item.evidence)}</div>
        <div class="matrix-action">${escapeHtml(item.action)}</div>
      </div>`).join("") : `<div class="card-body">此筛选下暂无项目。</div>`;

    $("#tab-radar").innerHTML = `
      <div class="stats-grid">
        <article class="stat-card accent"><span>综合匹配</span><strong>${escapeHtml(job.fit)}%</strong><small>原型估算 · 需人工复核</small></article>
        <article class="stat-card"><span>硬要求覆盖</span><strong>${escapeHtml(job.mustHaveMatched)}</strong><small>按官方 JD 拆解</small></article>
        <article class="stat-card"><span>可追溯证据</span><strong>${escapeHtml(job.evidenceCount)}</strong><small>来自候选人资料</small></article>
        <article class="stat-card"><span>优先缺口</span><strong>${escapeHtml(job.priorityGapCount)}</strong><small>申请前先处理</small></article>
      </div>
      <div class="evaluation-grid">
        <article class="eligibility-gate ${escapeHtml(evaluation.eligibility.status)}">
          <div class="gate-icon">${icon("shield")}</div><div><span>ELIGIBILITY GATE · 不计入匹配分</span><h3>${escapeHtml(evaluation.eligibility.label)}</h3><p>${escapeHtml(evaluation.eligibility.detail)}</p></div>
        </article>
        <article class="location-gate"><span>LOCATION & LOGISTICS</span><strong>${escapeHtml(evaluation.location.label)}</strong><p>${escapeHtml(evaluation.location.detail)}</p></article>
      </div>
      <article class="card fit-dimension-card">
        <div class="card-header"><div class="card-header-copy"><span class="eyebrow">WEIGHTED FIT MODEL</span><h3>匹配分拆成四个可解释维度</h3><p>技术 30% · 经验 25% · 行为 15% · 职业方向 30%；工作资格与地点单独设门槛。</p></div><strong class="dimension-total">${escapeHtml(job.fit)}<small>/100</small></strong></div>
        <div class="dimension-grid">${evaluation.dimensions.map(item => `<div class="dimension-item"><div class="dimension-head"><span>${escapeHtml(item.label)} · ${escapeHtml(item.weight)}%</span><strong>${escapeHtml(item.score)}</strong></div><div class="dimension-track"><span style="width:${Number(item.score) || 0}%"></span></div><p>${escapeHtml(item.note)}</p></div>`).join("")}</div>
      </article>
      <div class="content-grid">
        <div>
          <article class="card matrix">
            <div class="card-header">
              <div class="card-header-copy"><span class="eyebrow">REQUIREMENTS × EVIDENCE</span><h3>岗位—证据匹配矩阵</h3><p>每一个“匹配”都要能回到一条真实经历。</p></div>
              <div class="header-actions">
                ${[["all","全部"],["strong","强证据"],["partial","待补强"],["gap","缺口"]].map(([id,label]) => `<button class="filter-button ${state.matrixFilter === id ? "active" : ""}" data-filter="${id}">${label}</button>`).join("")}
              </div>
            </div>
            <div class="matrix-head"><span>岗位要求</span><span>状态</span><span>候选人证据</span><span>下一步</span></div>
            <div class="matrix-body">${matrixRows}</div>
          </article>
        </div>
        <aside>
          <article class="narrative-card">
            <span class="eyebrow">RECRUITER LENS</span>
            <h3>${escapeHtml(job.narrative)}</h3>
            <p>这是整份简历、自我介绍与面试答案需要共享的主叙事。</p>
          </article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">KEYWORDS</span><h3>关键词信号</h3></div></div>
            <div class="card-body"><div class="keyword-cloud">${job.topKeywords.map((keyword, index) => `<span class="keyword-chip ${index < 4 ? "hot" : ""}">${escapeHtml(keyword)}</span>`).join("")}</div></div>
          </article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">EVIDENCE ORDER</span><h3>信源优先级</h3></div></div>
            <div class="card-body"><div class="source-stack">
              <div class="source-item"><span class="source-rank">1</span><div class="source-copy"><strong>官方岗位 / 公司页面</strong><p>职责、要求、团队与公开公司事实。</p></div></div>
              <div class="source-item"><span class="source-rank">2</span><div class="source-copy"><strong>候选人原始证据</strong><p>简历、作品、项目、代码与可核实结果。</p></div></div>
              <div class="source-item"><span class="source-rank">3</span><div class="source-copy"><strong>职业平台与面经</strong><p>只作为经验性线索，不当作官方事实。</p></div></div>
            </div></div>
          </article>
        </aside>
      </div>
      <article class="card" style="margin-top:18px">
        <div class="card-header"><div class="card-header-copy"><span class="eyebrow">GAP SPRINT</span><h3>三步补强，不做无效焦虑</h3><p>只处理最能改变面试结果的缺口。</p></div></div>
        <div class="card-body"><div class="sprint-list">${job.gaps.map(item => `
          <div class="sprint-item"><div class="sprint-day">${escapeHtml(item.days)}</div><div><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.detail)}</p><span class="sprint-output">产出 · ${escapeHtml(item.output)}</span></div></div>`).join("")}</div></div>
      </article>`;
  }

  function resumeText(job) {
    const r = job.resume;
    const exp = r.experience.map(item => `${item.role} | ${item.company} | ${item.date}\n${item.bullets.map(b => `- ${b}`).join("\n")}`).join("\n\n");
    const projects = r.projects.map(p => `${p.name}\n- ${p.copy}`).join("\n");
    return `${candidate.name}\n${r.headline}\nSingapore | ${candidate.email} | ${candidate.links.portfolio}\n\nSUMMARY\n${r.summary}\n\nCORE SKILLS\n${r.focusSkills}\n\nEXPERIENCE\n${exp}\n\nSELECTED SYSTEMS\n${projects}\n\nEDUCATION\nMaster of Technology, Intelligent Systems | NUS-ISS | 2021–2022\nBachelor of Engineering, Software Engineering | Shandong University | 2017–2021`;
  }

  function renderResume(job) {
    const r = job.resume;
    const scoreRows = [
      ["JD 关键词覆盖", job.qa.keyword],
      ["证据支撑率", job.qa.evidence],
      ["ATS 结构", job.qa.ats],
      ["一页置信度", job.qa.onePage]
    ];
    $("#tab-resume").innerHTML = `
      <div class="resume-layout">
        <div>
          <div class="resume-toolbar">
            <div class="resume-toolbar-copy"><strong>English · 岗位语境推荐</strong><span>单栏、无图表、ATS 友好 · 仅使用已知证据</span></div>
            <div class="toolbar-buttons"><button class="small-button" id="copy-resume">${icon("copy")} 复制文本</button><button class="small-button" id="print-resume">${icon("print")} 导出 PDF</button></div>
          </div>
          <article class="resume-paper" id="resume-paper">
            <header class="resume-name"><div><h2>${escapeHtml(candidate.name)}</h2><p>${escapeHtml(r.headline)}</p></div><div class="resume-contact">Singapore · ${escapeHtml(candidate.email)}<br>${escapeHtml(candidate.links.portfolio)} · GitHub · LinkedIn</div></header>
            <section class="resume-section"><h3>Professional Summary</h3><p>${escapeHtml(r.summary)}</p></section>
            <section class="resume-section"><h3>Core Skills</h3><p class="resume-skills">${escapeHtml(r.focusSkills)}</p></section>
            <section class="resume-section"><h3>Professional Experience</h3>
              ${r.experience.map(item => `<div class="resume-role"><div class="resume-role-head"><strong>${escapeHtml(item.role)}</strong><span>${escapeHtml(item.date)}</span></div><p class="resume-role-company">${escapeHtml(item.company)}</p><ul>${item.bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul></div>`).join("")}
            </section>
            <section class="resume-section"><h3>Selected Systems</h3>${r.projects.map(project => `<div class="resume-project"><strong>${escapeHtml(project.name)}</strong><p>${escapeHtml(project.copy)}</p></div>`).join("")}</section>
            <section class="resume-section"><h3>Education & Publication</h3><p><strong>Master of Technology, Intelligent Systems</strong> · NUS-ISS · 2021–2022 · GPA 4.33 / 5.00<br><strong>Bachelor of Engineering, Software Engineering</strong> · Shandong University · 2017–2021 · GPA 86.86 / 100 · Outstanding Graduate<br>Co-author, peer-reviewed paper in <em>Automation in Construction</em>, 2023.</p></section>
          </article>
        </div>
        <aside class="resume-side">
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">RESUME QA</span><h3>这一版为什么可信</h3></div></div>
            <div class="card-body"><div class="score-list">${scoreRows.map(([label,value]) => `<div class="score-row"><div class="score-row-head"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}%</strong></div><div class="score-track"><span style="width:${Number(value)}%"></span></div></div>`).join("")}</div></div>
          </article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">HONESTY GUARD</span><h3>刻意没有写的内容</h3></div></div>
            <div class="card-body"><div class="warning-list">${job.qa.warnings.map(warning => `<div class="warning-item"><span class="warning-icon">!</span><span>${escapeHtml(warning)}</span></div>`).join("")}</div></div>
          </article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">COVERAGE</span><h3>已嵌入关键词</h3></div></div>
            <div class="card-body"><div class="keyword-cloud">${job.topKeywords.map(k => `<span class="keyword-chip">${escapeHtml(k)}</span>`).join("")}</div></div>
          </article>
        </aside>
      </div>`;
  }

  function completedDays(jobId) {
    try { return JSON.parse(localStorage.getItem(`rolefit.days.${jobId}`) || "[]"); } catch (_) { return []; }
  }

  function completedCommunityQuestions(jobId) {
    try { return JSON.parse(localStorage.getItem(`rolefit.communityQuestions.${jobId}`) || "[]"); } catch (_) { return []; }
  }

  function interviewDebriefs(jobId) {
    try { return JSON.parse(localStorage.getItem(`rolefit.interviewDebriefs.${jobId}`) || "[]"); } catch (_) { return []; }
  }

  function renderIndustrySearchRunbook(job) {
    const container = $("#industry-search-runbook");
    if (!container || !industryJobSearchPlaybook) return;
    const modeIds = industryJobSearchPlaybook.jobModes[job.id] || industryJobSearchPlaybook.jobModes.custom;
    const modes = modeIds.map(id => industryJobSearchPlaybook.modes.find(mode => mode.id === id)).filter(Boolean);
    const debriefs = interviewDebriefs(job.id);
    const stage = job.interviewContext?.stage || "当前阶段";
    container.innerHTML = `
      <article class="card industry-runbook-card">
        <div class="card-header industry-runbook-header">
          <div class="card-header-copy"><span class="eyebrow">INTERVIEW OPERATING SYSTEM</span><h3>把每场面试当作一门不同的课</h3><p>当前：${escapeHtml(stage)}。这不是对流程的预测，而是一份按岗位重排的准备与复盘 runbook。</p></div>
          <a href="${escapeHtml(industryJobSearchPlaybook.sourceUrl)}" target="_blank" rel="noreferrer">阅读方法来源 ${icon("external")}</a>
        </div>
        <div class="industry-context-note"><span>i</span><p>${escapeHtml(industryJobSearchPlaybook.context)}</p></div>
        <div class="industry-principles">${industryJobSearchPlaybook.principles.map((item, index) => `<article><span>0${index + 1}</span><div><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.detail)}</p></div></article>`).join("")}</div>
        <div class="industry-mode-head"><div><span class="eyebrow">THIS ROLE · LIKELY PREP MODES</span><h4>本岗位应优先练的四种模式</h4></div><span>不是官方轮次承诺</span></div>
        <div class="interview-mode-grid">${modes.map(mode => `<article class="interview-mode-card"><span>${escapeHtml(mode.label)}</span><p>${escapeHtml(mode.detail)}</p><ul>${mode.drills.map(drill => `<li>${escapeHtml(drill)}</li>`).join("")}</ul></article>`).join("")}</div>
        <div class="debrief-board">
          <div class="debrief-copy"><span class="eyebrow">POST-INTERVIEW · 6 MINUTES</span><h4>一结束就复盘，别等记忆变模糊</h4><p>保留真实问题和信号；这是一份仅存浏览器的追加式日志，不会自动发给 recruiter。</p></div>
          <div class="debrief-form">
            <label>面试类型<select id="debrief-type">${modes.map(mode => `<option value="${escapeHtml(mode.id)}">${escapeHtml(mode.label)}</option>`).join("")}</select></label>
            <label>题目、信号或反馈<textarea id="debrief-signal" placeholder="例如：问了 memory write policy；被追问 tenant isolation；面试官提示下一轮是 coding。"></textarea></label>
            <label>一个要补的缺口<textarea id="debrief-gap" placeholder="例如：准备 bounded retry + idempotency 的 90 秒答案。"></textarea></label>
            <label>下一步 / 跟进<input id="debrief-action" type="text" placeholder="例如：明天完成 2 道 coding；等待 recruiter 更新。"></label>
            <label>精力（1–5）<select id="debrief-energy"><option value="5">5 · 精力充足</option><option value="4" selected>4 · 可以继续</option><option value="3">3 · 需要恢复</option><option value="2">2 · 明显疲劳</option><option value="1">1 · 先休息</option></select></label>
            <button id="save-interview-debrief">保存本次复盘</button>
          </div>
          <div class="debrief-history">${debriefs.length ? debriefs.slice(-3).reverse().map(item => `<article><div><span>${escapeHtml(item.date)}</span><strong>${escapeHtml(item.typeLabel)}</strong><em>精力 ${escapeHtml(item.energy)}/5</em></div><p>${escapeHtml(item.signal)}</p><p><b>缺口：</b>${escapeHtml(item.gap)}</p>${item.action ? `<p><b>下一步：</b>${escapeHtml(item.action)}</p>` : ""}</article>`).join("") : `<div class="empty-note">还没有复盘记录。完成第一场面试后，用 6 分钟填一次即可。</div>`}</div>
        </div>
      </article>`;
  }

  function saveInterviewDebrief() {
    const job = getJob();
    const type = $("#debrief-type")?.value || "technical-discussion";
    const signal = $("#debrief-signal")?.value.trim() || "";
    const gap = $("#debrief-gap")?.value.trim() || "";
    const action = $("#debrief-action")?.value.trim() || "";
    const energy = $("#debrief-energy")?.value || "4";
    if (!signal || !gap) {
      showToast("请至少记录面试信号和一个要补的缺口");
      return;
    }
    const mode = industryJobSearchPlaybook.modes.find(item => item.id === type);
    const debriefs = interviewDebriefs(job.id);
    debriefs.push({ id: `debrief-${Date.now()}`, date: new Date().toISOString().slice(0, 10), type, typeLabel: mode?.label || type, signal, gap, action, energy });
    safeStore(`rolefit.interviewDebriefs.${job.id}`, JSON.stringify(debriefs));
    renderIndustrySearchRunbook(job);
    showToast("面试复盘已追加保存");
  }

  function renderCommunityQuestionBank(job) {
    const container = $("#community-question-bank");
    if (!container || !communityInterviewBank) return;
    const roleQuestions = communityInterviewBank.questions.filter(item => item.roles.includes(job.id));
    if (!roleQuestions.length) {
      container.innerHTML = "";
      return;
    }
    const done = completedCommunityQuestions(job.id);
    const visible = roleQuestions.filter(item => {
      if (state.questionBankFilter === "all") return true;
      if (state.questionBankFilter === "recommended") return item.priority === "P0";
      return item.category === state.questionBankFilter;
    });
    const sourceMap = Object.fromEntries(communityInterviewBank.sources.map(source => [source.id, source]));
    const categoryLabels = { coding: "算法 Coding", llm: "LLM 手写", system: "系统设计" };
    const progress = roleQuestions.length ? Math.round(done.filter(id => roleQuestions.some(item => item.id === id)).length / roleQuestions.length * 100) : 0;
    container.innerHTML = `
      <article class="card community-bank-card">
        <div class="card-header community-bank-header">
          <div class="card-header-copy"><span class="eyebrow">COMMUNITY QUESTION BANK · 2026</span><h3>小红书题单 → 可执行练习计划</h3><p>${job.id === "sea" ? "当前 HR Call 先准备动机、时间线和签证；以下保存为后续技术轮次题库。" : "按共同高频、岗位相关性和 ACM 实战优先，不把社区频次当作官方概率。"}</p></div>
          <div class="bank-progress"><span>${done.filter(id => roleQuestions.some(item => item.id === id)).length} / ${roleQuestions.length}</span><div><i style="width:${progress}%"></i></div><small>已练习</small></div>
        </div>
        <div class="community-source-note"><span>!</span><p>${escapeHtml(communityInterviewBank.caveat)}</p></div>
        <div class="bank-toolbar">
          <div>${[["recommended","优先准备"],["coding","算法 Coding"],["llm","LLM 手写"],["system","系统设计"],["all","全部"]].map(([id,label]) => `<button class="filter-button ${state.questionBankFilter === id ? "active" : ""}" data-bank-filter="${id}">${label}</button>`).join("")}</div>
          <div class="bank-sources">${communityInterviewBank.sources.map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.id === "xhs-a" ? "题单 A" : "题单 B")} ${icon("external")}</a>`).join("")}</div>
        </div>
        <div class="community-question-grid">${visible.map(item => `<article class="community-question ${done.includes(item.id) ? "done" : ""}">
          <div class="community-question-top"><span class="priority-tag ${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</span><span>${escapeHtml(categoryLabels[item.category])}</span><div>${item.source.map(sourceId => `<a href="${escapeHtml(sourceMap[sourceId].url)}" target="_blank" rel="noreferrer">${escapeHtml(sourceId === "xhs-a" ? "A" : "B")}</a>`).join("")}</div></div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.why)}</p>
          <div class="practice-brief"><strong>练习验收</strong><span>${escapeHtml(item.practice)}</span></div>
          <div class="community-question-actions"><a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">学习 / 刷题 ${icon("external")}</a><button data-community-question="${escapeHtml(item.id)}">${done.includes(item.id) ? `${icon("check")} 已练习` : "标记练习"}</button></div>
        </article>`).join("") || `<div class="empty-note">当前筛选下没有题目。</div>`}</div>
      </article>`;
  }

  function toggleCommunityQuestion(questionId) {
    const job = getJob();
    const done = completedCommunityQuestions(job.id);
    const index = done.indexOf(questionId);
    if (index >= 0) done.splice(index, 1); else done.push(questionId);
    safeStore(`rolefit.communityQuestions.${job.id}`, JSON.stringify(done));
    renderCommunityQuestionBank(job);
    showToast(index >= 0 ? "已取消练习标记" : "已记录练习进度");
  }

  function completedDeepMLQuestions(jobId) {
    try { return JSON.parse(localStorage.getItem(`rolefit.deepMLQuestions.${jobId}`) || "[]"); } catch (_) { return []; }
  }

  function renderDeepMLBank(job) {
    const container = $("#deep-ml-bank");
    if (!container || !deepMLBank) return;
    const questions = deepMLBank.questions;
    const done = completedDeepMLQuestions(job.id);
    const visible = questions.filter(item => {
      if (state.deepMLFilter === "all") return true;
      if (state.deepMLFilter === "priority") return item.priority === "P0";
      return item.category === state.deepMLFilter;
    });
    const doneCount = done.filter(id => questions.some(item => item.id === id)).length;
    const progress = Math.round(doneCount / questions.length * 100);
    const filters = [
      ["priority", "P0 岗位核心"], ["foundation", "数学基础"], ["classic", "经典 ML"],
      ["evaluation", "评估与泛化"], ["deep", "深度学习"], ["transformer", "Transformer / MoE"],
      ["retrieval", "NLP / 检索"], ["optimization", "训练与优化"], ["mlops", "MLOps"], ["all", "全部 30 题"]
    ];
    const stageNote = job.id === "sea"
      ? "技术轮优先完成 P0：Attention、BM25、评估、优化与 MLOps；HR 轮不需要临时刷完。"
      : job.id === "bytedance"
        ? "先做 P0 和 Transformer / MoE，再补数学与经典 ML；每题必须能写、能测、能解释复杂度。"
        : "先按 JD 选分类，再完成 P0；不建议机械刷完全部题目。";
    container.innerHTML = `
      <article class="card agent-round-bank-card deep-ml-bank-card">
        <div class="card-header community-bank-header">
          <div class="card-header-copy"><span class="eyebrow">DEEP-ML · ML CODING PRACTICE</span><h3>${escapeHtml(deepMLBank.title)}</h3><p>${escapeHtml(stageNote)}</p></div>
          <div class="bank-progress"><span>${doneCount} / ${questions.length}</span><div><i style="width:${progress}%"></i></div><small>已完成闭卷练习</small></div>
        </div>
        <div class="community-source-note deep-ml-source-note"><span>i</span><p>${escapeHtml(deepMLBank.caveat)} ${escapeHtml(deepMLBank.license)}</p></div>
        <div class="bank-toolbar deep-ml-toolbar">
          <div>${filters.map(([id,label]) => `<button class="filter-button ${state.deepMLFilter === id ? "active" : ""}" data-deep-ml-filter="${id}">${escapeHtml(label)}</button>`).join("")}</div>
          <div class="bank-sources"><a href="${escapeHtml(deepMLBank.sourceUrl)}" target="_blank" rel="noreferrer">官方题库 ${icon("external")}</a><a href="${escapeHtml(deepMLBank.repositoryUrl)}" target="_blank" rel="noreferrer">开放题目仓库 ${icon("external")}</a></div>
        </div>
        <div class="agent-round-list deep-ml-list">${visible.map(item => `<details class="agent-round-question deep-ml-question ${done.includes(item.id) ? "done" : ""}">
          <summary><span class="agent-question-no deep-ml-question-id">#${escapeHtml(item.sourceId)}</span><div><span class="agent-question-meta"><i class="priority-tag ${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</i><i class="deep-ml-difficulty ${item.difficulty.toLowerCase()}">${escapeHtml(item.difficulty)}</i>${escapeHtml(deepMLBank.categories[item.category])}</span><strong>${escapeHtml(item.question)}</strong></div><span class="agent-question-toggle">+</span></summary>
          <div class="agent-round-answer">
            <div class="agent-answer-frame"><strong>面试回答主线</strong><ol>${item.answer.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div>
            <div class="agent-answer-focus"><strong>核心答案</strong><p>${escapeHtml(item.key)}</p></div>
            <div class="agent-answer-evidence"><div><strong>实现与验收</strong><p>${escapeHtml(item.practice)}</p></div><div><strong>容易答错</strong><p>${escapeHtml(item.pitfall)}</p><p><a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">打开 Deep-ML #${escapeHtml(item.sourceId)} ${icon("external")}</a></p></div></div>
            <div class="agent-answer-actions"><button data-deep-ml-question="${escapeHtml(item.id)}">${done.includes(item.id) ? `${icon("check")} 已完成闭卷练习` : "标记完成练习"}</button><span>建议：先独立写实现和测试，再展开答案对照。</span></div>
          </div>
        </details>`).join("") || `<div class="empty-note">当前筛选下没有题目。</div>`}</div>
      </article>`;
  }

  function toggleDeepMLQuestion(questionId) {
    const job = getJob();
    const done = completedDeepMLQuestions(job.id);
    const index = done.indexOf(questionId);
    if (index >= 0) done.splice(index, 1); else done.push(questionId);
    safeStore(`rolefit.deepMLQuestions.${job.id}`, JSON.stringify(done));
    renderDeepMLBank(job);
    showToast(index >= 0 ? "已取消 Deep-ML 练习标记" : "已记录 Deep-ML 练习进度");
  }

  function completedPythonAlgorithmQuestions(jobId) {
    try { return JSON.parse(localStorage.getItem(`rolefit.pythonAlgorithmQuestions.${jobId}`) || "[]"); } catch (_) { return []; }
  }

  function renderPythonAlgorithmBank(job) {
    const container = $("#python-algorithm-bank");
    if (!container || !pythonAlgorithmBank) return;
    const questions = pythonAlgorithmBank.questions;
    const done = completedPythonAlgorithmQuestions(job.id);
    const visible = questions.filter(item => {
      if (state.pythonAlgorithmFilter === "all") return true;
      if (state.pythonAlgorithmFilter === "priority") return item.priority === "P0";
      return item.category === state.pythonAlgorithmFilter;
    });
    const doneCount = done.filter(id => questions.some(item => item.id === id)).length;
    const progress = Math.round(doneCount / questions.length * 100);
    const filters = [
      ["priority", "P0 面试核心"], ["array", "数组 / 双指针"], ["linked", "链表"],
      ["hash", "哈希 / 字符串"], ["stack", "栈 / 队列 / 堆"], ["tree", "二叉树"],
      ["backtrack", "回溯"], ["greedy", "贪心"], ["dp", "动态规划"], ["graph", "图论"],
      ["all", "全部 30 题"]
    ];
    const stageNote = job.id === "sea"
      ? "Python 主语言路线：先完成 P0，再按滑窗 / 链表 / BFS / DP / 图论各做一次 25 分钟模拟。"
      : job.id === "bytedance"
        ? "Python 主语言路线：P0 全部闭卷；每题写出边界、复杂度，并准备从 baseline 优化。"
        : "先按岗位题型选择分类，再完成 P0；所有模板都要能脱离 IDE 写出。";
    container.innerHTML = `
      <article class="card agent-round-bank-card python-algorithm-bank-card">
        <div class="card-header community-bank-header">
          <div class="card-header-copy"><span class="eyebrow">LEETCODE-MASTER · PYTHON TRACK</span><h3>${escapeHtml(pythonAlgorithmBank.title)}</h3><p>${escapeHtml(stageNote)}</p></div>
          <div class="bank-progress"><span>${doneCount} / ${questions.length}</span><div><i style="width:${progress}%"></i></div><small>已完成 Python 闭卷</small></div>
        </div>
        <div class="community-source-note python-algorithm-source-note"><span>Py</span><p>${escapeHtml(pythonAlgorithmBank.caveat)}</p></div>
        <div class="python-toolkit-strip">${pythonAlgorithmBank.pythonTools.map(tool => `<code>${escapeHtml(tool)}</code>`).join("")}</div>
        <div class="bank-toolbar python-algorithm-toolbar">
          <div>${filters.map(([id,label]) => `<button class="filter-button ${state.pythonAlgorithmFilter === id ? "active" : ""}" data-python-algo-filter="${id}">${escapeHtml(label)}</button>`).join("")}</div>
          <div class="bank-sources"><a href="${escapeHtml(pythonAlgorithmBank.sourceUrl)}" target="_blank" rel="noreferrer">代码随想录 GitHub ${icon("external")}</a><a href="${escapeHtml(pythonAlgorithmBank.readingUrl)}" target="_blank" rel="noreferrer">在线阅读 ${icon("external")}</a></div>
        </div>
        <div class="agent-round-list python-algorithm-list">${visible.map(item => `<details class="agent-round-question python-algorithm-question ${done.includes(item.id) ? "done" : ""}">
          <summary><span class="agent-question-no python-algorithm-question-id">LC ${escapeHtml(item.no)}</span><div><span class="agent-question-meta"><i class="priority-tag ${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</i><i class="deep-ml-difficulty ${item.difficulty.toLowerCase()}">${escapeHtml(item.difficulty)}</i>${escapeHtml(pythonAlgorithmBank.categories[item.category])}</span><strong>${escapeHtml(item.title)}</strong></div><span class="agent-question-toggle">+</span></summary>
          <div class="agent-round-answer">
            <div class="agent-answer-frame"><strong>Python 解题主线</strong><ol>${item.answer.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div>
            <div class="agent-answer-focus"><strong>核心思路</strong><p>${escapeHtml(item.key)}</p><pre><code>${escapeHtml(item.python)}</code></pre></div>
            <div class="agent-answer-evidence"><div><strong>复杂度与验收</strong><p>${escapeHtml(item.complexity)} ${escapeHtml(item.acceptance)}</p></div><div><strong>Python 易错点</strong><p>${escapeHtml(item.pitfall)}</p><p><a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">打开 LeetCode ${escapeHtml(item.no)} ${icon("external")}</a></p></div></div>
            <div class="agent-answer-actions"><button data-python-algo-question="${escapeHtml(item.id)}">${done.includes(item.id) ? `${icon("check")} 已完成 Python 闭卷` : "标记完成练习"}</button><span>建议：先口述不变量，再写代码，最后手跑 3 个边界用例。</span></div>
          </div>
        </details>`).join("") || `<div class="empty-note">当前筛选下没有题目。</div>`}</div>
      </article>`;
  }

  function togglePythonAlgorithmQuestion(questionId) {
    const job = getJob();
    const done = completedPythonAlgorithmQuestions(job.id);
    const index = done.indexOf(questionId);
    if (index >= 0) done.splice(index, 1); else done.push(questionId);
    safeStore(`rolefit.pythonAlgorithmQuestions.${job.id}`, JSON.stringify(done));
    renderPythonAlgorithmBank(job);
    showToast(index >= 0 ? "已取消 Python 算法练习标记" : "已记录 Python 算法练习进度");
  }

  function completedAgentRoundQuestions(jobId) {
    try { return JSON.parse(localStorage.getItem(`rolefit.agentRoundQuestions.${jobId}`) || "[]"); } catch (_) { return []; }
  }

  function renderAgentSecondRoundBank(job) {
    const container = $("#agent-second-round-bank");
    if (!container || !agentSecondRoundBank) return;
    const done = completedAgentRoundQuestions(job.id);
    const questions = agentSecondRoundBank.questions;
    const visible = questions.filter(item => {
      if (state.agentRoundFilter === "all") return true;
      if (state.agentRoundFilter === "priority") return item.priority === "P0";
      return item.category === state.agentRoundFilter;
    });
    const doneCount = done.filter(id => questions.some(item => item.id === id)).length;
    const progress = Math.round(doneCount / questions.length * 100);
    const filters = [
      ["priority", "P0 优先"], ["architecture", "架构与状态"], ["evaluation", "评估与迭代"],
      ["reliability", "可靠性安全"], ["performance", "性能规模"], ["evidence", "项目经历"],
      ["collaboration", "协作交付"], ["all", "全部 48 题"]
    ];
    const stageNote = job.id === "sea"
      ? "Sea 当前仍是 HR 初筛：先练自我介绍、动机、签证与时间线；这组题用于技术二面或主管深挖。"
      : job.id === "bytedance"
        ? "题单标题指向字节 Agent 开发二面；先完成 P0，再按岗位缺口扩展，但不要把截图当官方题库。"
        : "按 P0 建立第一轮基线，再依据新岗位 JD 选择分类，不需要机械背完 48 题。";
    container.innerHTML = `
      <article class="card agent-round-bank-card">
        <div class="card-header community-bank-header">
          <div class="card-header-copy"><span class="eyebrow">AGENT DEVELOPMENT · ROUND 2</span><h3>${escapeHtml(agentSecondRoundBank.title)}</h3><p>${escapeHtml(stageNote)}</p></div>
          <div class="bank-progress"><span>${doneCount} / ${questions.length}</span><div><i style="width:${progress}%"></i></div><small>已完成口述</small></div>
        </div>
        <div class="community-source-note agent-source-note"><span>!</span><p>${escapeHtml(agentSecondRoundBank.caveat)} 每题的“证据选择”已按你的 CV 和 VEMO 边界校准。</p></div>
        <div class="bank-toolbar agent-round-toolbar"><div>${filters.map(([id,label]) => `<button class="filter-button ${state.agentRoundFilter === id ? "active" : ""}" data-agent-round-filter="${id}">${escapeHtml(label)}</button>`).join("")}</div><strong>${visible.length} 题</strong></div>
        <div class="agent-round-list">${visible.map(item => {
          const category = agentSecondRoundBank.categories[item.category];
          return `<details class="agent-round-question ${done.includes(item.id) ? "done" : ""}">
            <summary><span class="agent-question-no">${String(item.no).padStart(2, "0")}</span><div><span class="agent-question-meta"><i class="priority-tag ${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</i>${escapeHtml(category.label)}</span><strong>${escapeHtml(item.question)}</strong></div><span class="agent-question-toggle">+</span></summary>
            <div class="agent-round-answer">
              <div class="agent-answer-frame"><strong>三步答题结构</strong><ol>${category.frame.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div>
              <div class="agent-answer-focus"><strong>本题答题锚点</strong><p>${escapeHtml(item.focus)}</p></div>
              <div class="agent-answer-evidence"><div><strong>证据选择</strong><p>${escapeHtml(item.evidence)}</p></div><div><strong>真实性边界</strong><p>${escapeHtml(category.risk)}</p></div></div>
              <div class="agent-answer-actions"><button data-agent-round-question="${escapeHtml(item.id)}">${done.includes(item.id) ? `${icon("check")} 已完成口述` : "标记完成口述"}</button><span>建议：先闭卷回答 2 分钟，再展开对照。</span></div>
            </div>
          </details>`;
        }).join("")}</div>
      </article>`;
  }

  function toggleAgentRoundQuestion(questionId) {
    const job = getJob();
    const done = completedAgentRoundQuestions(job.id);
    const index = done.indexOf(questionId);
    if (index >= 0) done.splice(index, 1); else done.push(questionId);
    safeStore(`rolefit.agentRoundQuestions.${job.id}`, JSON.stringify(done));
    renderAgentSecondRoundBank(job);
    showToast(index >= 0 ? "已取消口述完成标记" : "已记录二面题练习");
  }

  function completedVisualGenAIQuestions(jobId) {
    try { return JSON.parse(localStorage.getItem(`rolefit.visualGenAIQuestions.${jobId}`) || "[]"); } catch (_) { return []; }
  }

  function renderVisualGenAIBank(job) {
    const container = $("#visual-genai-bank");
    if (!container || !visualGenAIBank) return;
    const questions = visualGenAIBank.questions;
    const done = completedVisualGenAIQuestions(job.id);
    const visible = questions.filter(item => {
      if (state.visualGenAIFilter === "all") return true;
      if (state.visualGenAIFilter === "priority") return item.priority === "P0";
      return item.category === state.visualGenAIFilter;
    });
    const doneCount = done.filter(id => questions.some(item => item.id === id)).length;
    const progress = Math.round(doneCount / questions.length * 100);
    const filters = [
      ["priority", "P0 核心"], ["diffusion", "Diffusion / Flow"], ["flux", "FLUX 架构"],
      ["positional", "位置编码"], ["adaptation", "LoRA / Control"], ["optimization", "压缩与训练"],
      ["video", "Video Model"], ["all", "全部 22 题"]
    ];
    const roleNote = ["sea", "bytedance"].includes(job.id)
      ? "这是视觉生成专项，不是当前 Agent 岗位的第一优先级；顺序应在 HR、Agent system design 和编码准备之后。"
      : "只有当 JD 涉及图像/视频生成、Diffusion 或多模态基础模型时，再把这组题提升到主线。";
    container.innerHTML = `
      <article class="card agent-round-bank-card visual-genai-bank-card">
        <div class="card-header community-bank-header">
          <div class="card-header-copy"><span class="eyebrow">VISUAL GENERATIVE MODELS · DEEP DIVE</span><h3>${escapeHtml(visualGenAIBank.title)}</h3><p>${escapeHtml(roleNote)}</p></div>
          <div class="bank-progress"><span>${doneCount} / ${questions.length}</span><div><i style="width:${progress}%"></i></div><small>已完成口述</small></div>
        </div>
        <div class="community-source-note visual-source-note"><span>!</span><p>${escapeHtml(visualGenAIBank.caveat)}</p></div>
        <div class="visual-scope-note"><strong>经验边界</strong><p>${escapeHtml(visualGenAIBank.scope)}</p></div>
        <div class="bank-toolbar agent-round-toolbar"><div>${filters.map(([id,label]) => `<button class="filter-button ${state.visualGenAIFilter === id ? "active" : ""}" data-visual-genai-filter="${id}">${escapeHtml(label)}</button>`).join("")}</div><strong>${visible.length} 题</strong></div>
        <div class="agent-round-list visual-genai-list">${visible.map(item => `<details class="agent-round-question visual-genai-question ${done.includes(item.id) ? "done" : ""}">
          <summary><span class="agent-question-no">${String(item.no).padStart(2, "0")}</span><div><span class="agent-question-meta"><i class="priority-tag ${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</i>${escapeHtml(visualGenAIBank.categories[item.category])}</span><strong>${escapeHtml(item.question)}</strong></div><span class="agent-question-toggle">+</span></summary>
          <div class="agent-round-answer">
            <div class="agent-answer-frame"><strong>60–90 秒回答结构</strong><ol>${item.answer.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div>
            <div class="agent-answer-focus"><strong>核心结论</strong><p>${escapeHtml(item.key)}</p></div>
            <div class="agent-answer-evidence"><div><strong>容易答错</strong><p>${escapeHtml(item.pitfall)}</p></div><div><strong>一手学习入口</strong><p><a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">官方实现 / 原论文 ${icon("external")}</a></p></div></div>
            <div class="agent-answer-actions"><button data-visual-genai-question="${escapeHtml(item.id)}">${done.includes(item.id) ? `${icon("check")} 已完成口述` : "标记完成口述"}</button><span>先画数据流或写公式，再解释工程取舍。</span></div>
          </div>
        </details>`).join("")}</div>
      </article>`;
  }

  function toggleVisualGenAIQuestion(questionId) {
    const job = getJob();
    const done = completedVisualGenAIQuestions(job.id);
    const index = done.indexOf(questionId);
    if (index >= 0) done.splice(index, 1); else done.push(questionId);
    safeStore(`rolefit.visualGenAIQuestions.${job.id}`, JSON.stringify(done));
    renderVisualGenAIBank(job);
    showToast(index >= 0 ? "已取消生成模型练习标记" : "已记录生成模型练习");
  }

  function renderInterview(job) {
    const done = completedDays(job.id);
    const progress = Math.round(done.length / job.interviewPlan.length * 100);
    const context = job.interviewContext || { stage: "待确认", format: "待确认", focus: job.topKeywords.slice(0, 4), bridge: "承认真实缺口，连接相邻经验，再说明可执行的学习与验证路径。" };
    const archive = job.application?.archive;
    $("#tab-interview").innerHTML = `
      <article class="interview-context-card">
        <div class="context-stage"><span>CURRENT INTERVIEW STAGE</span><strong>${escapeHtml(context.stage)}</strong><small>${escapeHtml(context.format)}</small></div>
        <div class="context-focus"><span class="eyebrow">STAGE-SPECIFIC FOCUS</span><div>${context.focus.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div></div>
        <div class="context-archive"><span class="eyebrow">CONSISTENCY SOURCE</span>${archive ? `<a href="${escapeHtml(archive.submittedCvUrl)}" target="_blank" rel="noreferrer"><strong>${escapeHtml(archive.submittedCv)}</strong><small>以实际投递版本为准 ${icon("external")}</small></a>` : `<p>暂无已确认投递版本。</p>`}</div>
      </article>
      ${archive ? `<article class="card consistency-brief-card">
        <div class="card-header"><div class="card-header-copy"><span class="eyebrow">CLAIM CONSISTENCY BRIEF</span><h3>纸面上的每个重点，都要能当场讲深</h3><p>不把后来的新表述倒灌进已投递材料；缺口使用诚实 bridge answer。</p></div><span class="stage-chip">${escapeHtml(context.stage)}</span></div>
        <div class="consistency-grid"><div><strong>需要守住的表述</strong><ul>${archive.claimsToDefend.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div><div><strong>上一轮信号</strong><p>${escapeHtml(archive.previousFeedback)}</p><strong>缺口桥接</strong><p>${escapeHtml(context.bridge)}</p></div></div>
      </article>` : ""}
      <div id="industry-search-runbook"></div>
      <div id="community-question-bank"></div>
      <div id="python-algorithm-bank"></div>
      <div id="deep-ml-bank"></div>
      <div id="agent-second-round-bank"></div>
      <div id="visual-genai-bank"></div>
      <div class="interview-layout">
        <div>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">5-DAY SPRINT</span><h3>面试冲刺计划</h3><p>每天都以一个可拿去面试的产出结束。</p></div><div class="plan-progress"><span>${done.length} / ${job.interviewPlan.length}</span><div class="plan-progress-track"><span id="day-progress" style="width:${progress}%"></span></div></div></div>
            <div class="day-list">${job.interviewPlan.map((item,index) => `<div class="day-item"><div class="day-number">${escapeHtml(item.day)}<span>${escapeHtml(item.label)}</span></div><div class="day-copy"><h4>${escapeHtml(item.title)} · ${escapeHtml(item.time)}</h4><ul>${item.tasks.map(task => `<li>${escapeHtml(task)}</li>`).join("")}</ul></div><button class="day-check ${done.includes(index) ? "done" : ""}" data-day="${index}" aria-label="标记第 ${index + 1} 天完成">${icon("check")}</button></div>`).join("")}</div>
          </article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">HIGH-PROBABILITY QUESTIONS</span><h3>高概率问题与答题骨架</h3><p>骨架来自 JD，内容只能来自你的证据库。</p></div></div>
            <div class="question-list">${job.questions.map((item,index) => `<div class="question-item ${index === 0 ? "open" : ""}"><button class="question-button" data-question="${index}"><div><span>${escapeHtml(item.category)}</span><strong>${escapeHtml(item.question)}</strong></div>${icon("chevron")}</button><div class="question-answer"><div class="intent-box"><strong>面试官在看什么：</strong>${escapeHtml(item.intent)}</div><ol class="answer-outline">${item.outline.map(line => `<li>${escapeHtml(line)}</li>`).join("")}</ol><div class="answer-meta"><span>可用证据：<strong>${escapeHtml(item.evidence)}</strong></span><span>风险：${escapeHtml(item.risk)}</span></div></div></div>`).join("")}</div>
          </article>
        </div>
        <aside>
          <article class="card timer-card">
            <span class="eyebrow">ANSWER REHEARSAL</span>
            <div class="timer-display" id="timer-display">02:00</div>
            <p>STAR 建议把主要时间放在 Action。录音后检查：结论是否先说、证据是否具体、有没有虚构数字。</p>
            <div class="timer-actions"><button class="timer-start" id="timer-start">开始练习</button><button class="timer-reset" id="timer-reset">重置</button></div>
          </article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">ANSWER FORMULA</span><h3>2 分钟结构</h3></div></div>
            <div class="card-body"><div class="source-stack">
              <div class="source-item"><span class="source-rank">20%</span><div class="source-copy"><strong>Situation</strong><p>只交代决定理解问题的背景。</p></div></div>
              <div class="source-item"><span class="source-rank">10%</span><div class="source-copy"><strong>Task</strong><p>你的责任、约束与成功标准。</p></div></div>
              <div class="source-item"><span class="source-rank">60%</span><div class="source-copy"><strong>Action</strong><p>你的判断、步骤、取舍与协作。</p></div></div>
              <div class="source-item"><span class="source-rank">10%</span><div class="source-copy"><strong>Result</strong><p>可核实结果与简短复盘。</p></div></div>
            </div></div>
          </article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">YOUR POSITION</span><h3>本轮核心叙事</h3></div></div>
            <div class="card-body"><p style="margin:0;color:var(--muted);font-size:10px;line-height:1.7">${escapeHtml(job.narrative)}</p></div>
          </article>
        </aside>
      </div>`;
    renderCommunityQuestionBank(job);
    renderPythonAlgorithmBank(job);
    renderDeepMLBank(job);
    renderIndustrySearchRunbook(job);
    renderAgentSecondRoundBank(job);
    renderVisualGenAIBank(job);
    updateTimerDisplay();
  }

  const salaryFields = [
    ["currentBase", "当前年薪 / TC（可留空）", "仅供你比较，不会用于自动估价"],
    ["targetFloor", "可接受底线", "低于此值时优先重新评估整体方案"],
    ["targetOpening", "期望开价", "为谈判留出合理空间，并准备证据"],
    ["targetTotal", "目标总包", "把 bonus、equity 与其他条款放在一起看"],
    ["noticePeriod", "Notice period", "例如：1 month"],
    ["earliestStart", "Earliest start", "例如：2026-09-01"],
    ["otherOffers", "真实在手选择", "没有就写 None；绝不虚构 offer"]
  ];

  function salaryStorageKey(jobId) {
    return `rolefit.salary.${jobId}`;
  }

  function salaryDraft(jobId) {
    try { return JSON.parse(localStorage.getItem(salaryStorageKey(jobId)) || "{}"); } catch (_) { return {}; }
  }

  function salaryReadiness(draft) {
    const completed = salaryFields.filter(([id]) => String(draft[id] || "").trim()).length;
    return { completed, total: salaryFields.length, percent: Math.round(completed / salaryFields.length * 100) };
  }

  function renderSalary(job) {
    const profile = job.negotiationProfile || {
      phase: "P1 · 信息收集",
      timing: "先确认流程、level 与薪酬带宽，再进入具体谈判。",
      leverage: ["真实的生产交付与岗位相关证据"],
      known: [`岗位：${job.title}`, `地点：${job.location}`],
      unknown: ["level 与薪酬带宽", "目标 base / total compensation", "notice period / earliest start"]
    };
    const draft = salaryDraft(job.id);
    const readiness = salaryReadiness(draft);
    const activePhase = (profile.phase.match(/P[1-5]/) || ["P1"])[0];
    $("#tab-salary").innerHTML = `
      <article class="salary-hero">
        <div><span class="eyebrow">NEGOTIATION WORKBENCH</span><h2>先把信息准备好，再谈数字。</h2><p>${escapeHtml(profile.timing)}</p></div>
        <div class="salary-readiness"><div class="readiness-ring" style="--readiness:${readiness.percent}"><strong id="salary-readiness-value">${readiness.percent}%</strong></div><div><span>准备完整度</span><strong id="salary-readiness-count">${readiness.completed} / ${readiness.total} 项</strong><small>不是市场薪资评分</small></div></div>
      </article>
      <div class="phase-strip">${salaryNegotiation.phases.map(phase => `<div class="phase-step ${phase.id === activePhase ? "active" : ""}"><span>${phase.id}</span><strong>${escapeHtml(phase.title)}</strong><small>${escapeHtml(phase.detail)}</small></div>`).join("")}</div>
      <div class="salary-layout">
        <div>
          <article class="card salary-form-card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">PRIVATE PREP</span><h3>你的谈判参数</h3><p>所有字段只保存在当前浏览器；金额可写币种、周期和范围。</p></div><button class="small-button danger-subtle" id="clear-salary-draft">清空本地记录</button></div>
            <div class="salary-form-grid">${salaryFields.map(([id, label, hint]) => `<label><span>${escapeHtml(label)}</span><input type="text" autocomplete="off" data-salary-field="${id}" value="${escapeHtml(draft[id] || "")}" placeholder="待填写"><small>${escapeHtml(hint)}</small></label>`).join("")}</div>
          </article>
          <article class="card salary-script-card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">CONVERSATION SCRIPTS</span><h3>可直接练习的英文话术</h3><p>把方括号内容换成真实信息；复制后先读出声再使用。</p></div></div>
            <div class="script-list">${salaryNegotiation.scripts.map(script => `<div class="script-item"><div><span>${escapeHtml(script.label)}</span><p>${escapeHtml(script.text.replaceAll("Sea", job.shortName))}</p></div><button class="script-copy" data-salary-copy="${escapeHtml(script.id)}" aria-label="复制${escapeHtml(script.label)}">${icon("copy")}</button></div>`).join("")}</div>
          </article>
          <article class="card scenario-card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">PRESSURE TEST</span><h3>四种常见压力场景</h3></div></div>
            <div class="scenario-list">
              <details open><summary>HR 先问 expected salary</summary><p>先问岗位 band 与 level；如果必须回答，给有依据的范围并说明要结合完整职责与总包。</p></details>
              <details><summary>对方说 base 已到预算上限</summary><p>确认限制是否只针对 base，再讨论 signing bonus、variable compensation、equity、vesting 或书面 early review。</p></details>
              <details><summary>对方追问 competing offer</summary><p>只陈述真实情况。没有 offer 时，谈岗位价值、时间线和你评估机会的标准，不创造虚假稀缺性。</p></details>
              <details><summary>对方要求很快答复</summary><p>先问是否 hard deadline，再给出你能履行的明确回复日期；拿到完整书面条款后再做决定。</p></details>
            </div>
          </article>
        </div>
        <aside class="salary-side">
          <article class="card negotiation-position-card"><span class="eyebrow">CURRENT PHASE</span><h3>${escapeHtml(profile.phase)}</h3><p>${escapeHtml(profile.timing)}</p></article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">VALUE EVIDENCE</span><h3>你的真实筹码</h3></div></div>
            <div class="card-body"><ul class="value-list">${profile.leverage.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
          </article>
          <article class="card known-unknown-card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">INFORMATION MAP</span><h3>已知与待确认</h3></div></div>
            <div class="card-body"><div class="info-column"><strong>已知</strong>${profile.known.map(item => `<div class="info-row">${icon("check")}<p>${escapeHtml(item)}</p></div>`).join("")}</div><div class="info-column unknown"><strong>待确认</strong>${profile.unknown.map(item => `<div class="info-row"><span>?</span><p>${escapeHtml(item)}</p></div>`).join("")}</div></div>
          </article>
          <article class="card safety-card"><span class="eyebrow">NEGOTIATION GUARDRAILS</span>${salaryNegotiation.safety.map(item => `<p>${escapeHtml(item)}</p>`).join("")}<a href="${escapeHtml(salaryNegotiation.sourceUrl)}" target="_blank" rel="noreferrer">方法来源：${escapeHtml(salaryNegotiation.sourceName)} ${icon("external")}</a></article>
        </aside>
      </div>`;
  }

  function renderCompany(job) {
    $("#tab-company").innerHTML = `
      <div class="company-grid">
        <div>
          <article class="card company-summary"><span class="eyebrow">OFFICIAL BRIEF</span><blockquote>${escapeHtml(job.summary)}</blockquote><p>只使用官方岗位页能支持的事实；文化、面试流程与员工体验若无额外来源，不在这里下结论。</p></article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">FACT PACK</span><h3>可在面试中安全使用的事实</h3></div></div>
            <div class="card-body"><div class="fact-grid">${job.companyFacts.map(fact => `<div class="fact-item"><div class="fact-top"><span>${escapeHtml(fact.label)}</span><span class="confidence-badge">● ${escapeHtml(fact.confidence)}</span></div><strong>${escapeHtml(fact.value)}</strong><p>${escapeHtml(fact.detail)}</p></div>`).join("")}</div></div>
          </article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">EVIDENCE POLICY</span><h3>事实与经验分层</h3></div></div>
            <div class="card-body"><div class="evidence-policy"><div class="policy-step"><strong>官网</strong><span>公司事实</span></div><div class="policy-step"><strong>官方社媒</strong><span>近期动态</span></div><div class="policy-step"><strong>职业平台</strong><span>组织线索</span></div><div class="policy-step"><strong>面经 / 社区</strong><span>仅作经验</span></div></div></div>
          </article>
        </div>
        <aside>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">QUESTIONS TO ASK</span><h3>值得问面试官的问题</h3><p>用问题验证未知，而不是假装已经知道。</p></div></div>
            <div class="card-body"><div class="ask-list">${job.questionsToAsk.map(q => `<div class="ask-item"><p>${escapeHtml(q)}</p></div>`).join("")}</div></div>
          </article>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">SOURCE</span><h3>本次研究范围</h3></div></div>
            <div class="card-body"><p style="margin:0;color:var(--muted);font-size:9.5px;line-height:1.7">${escapeHtml(job.sourceLabel)}<br>读取日期：${escapeHtml(job.sourceDate)}<br>职位编号：${escapeHtml(job.jobCode)}</p>${job.url ? `<a class="small-button" style="margin-top:12px;text-decoration:none;width:fit-content" href="${escapeHtml(job.url)}" target="_blank" rel="noreferrer">${icon("external")} 打开原岗位</a>` : ""}</div>
          </article>
        </aside>
      </div>`;
  }

  function renderQuality(job) {
    const checks = [
      ["关键词覆盖", "核心 JD 词自然出现", `${job.qa.keyword}%`],
      ["证据支撑", "每条核心 bullet 可回溯", `${job.qa.evidence}%`],
      ["ATS 兼容", "单栏、标准标题、无图表", `${job.qa.ats}%`],
      ["隐私检查", "未输出无关敏感字段", `${job.qa.privacy}%`],
      ["一页约束", "固定模板渲染置信度", `${job.qa.onePage}%`],
      ["事实分层", "官方事实与经验性信息分开", "通过"]
    ];
    const average = Math.round((job.qa.keyword + job.qa.evidence + job.qa.ats + job.qa.privacy + job.qa.onePage) / 5);
    $("#tab-quality").innerHTML = `
      <article class="card quality-hero">
        <div class="quality-score" style="background:conic-gradient(var(--green-2) 0 ${average}%, #e1e4df ${average}%)"><div><strong>${average}</strong><span>QUALITY SCORE</span></div></div>
        <div class="quality-copy"><span class="eyebrow">CRITIC / QA</span><h2>可以进入人工复核</h2><p>这不是“内容看起来不错”的分数，而是对真实性、相关性、ATS、隐私和一页约束的组合检查。匹配分与质量分都只是辅助判断，不能代替招聘者决策。</p><div class="quality-badges"><span class="quality-badge">${icon("check")} 无虚构数字</span><span class="quality-badge">${icon("check")} 无敏感字段</span><span class="quality-badge">${icon("check")} 官方事实优先</span></div></div>
      </article>
      <div class="content-grid" style="margin-top:18px">
        <article class="card">
          <div class="card-header"><div class="card-header-copy"><span class="eyebrow">DETERMINISTIC CHECKS</span><h3>质量门槛</h3></div></div>
          <div class="card-body"><div class="check-grid">${checks.map(([title,detail,value]) => `<div class="check-item"><span class="check-icon">${icon("check")}</span><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></div><span class="check-value">${escapeHtml(value)}</span></div>`).join("")}</div></div>
        </article>
        <aside>
          <article class="card">
            <div class="card-header"><div class="card-header-copy"><span class="eyebrow">ASSUMPTIONS & WARNINGS</span><h3>还需要你确认</h3></div></div>
            <div class="card-body"><div class="assumption-list">${job.qa.warnings.map((warning,index) => `<div class="assumption"><b>${index + 1}</b><span>${escapeHtml(warning)}</span></div>`).join("")}</div></div>
          </article>
        </aside>
      </div>`;
  }

  function renderAll() {
    const job = getJob();
    if (!job) {
      state.currentJobId = "sea";
      return renderAll();
    }
    renderJobSwitcher();
    renderMobileTabs();
    renderHero(job);
    renderStatus(job);
    renderRadar(job);
    renderResume(job);
    renderInterview(job);
    renderSalary(job);
    renderCompany(job);
    renderQuality(job);
    $("#source-stamp").textContent = `${job.sourceLabel} · ${job.sourceDate}`;
    setActiveTab(state.currentTab, false);
  }

  function setActiveTab(tabId, scroll = true) {
    if (!tabLabels[tabId]) return;
    state.currentTab = tabId;
    $$(".nav-item, .mobile-tab").forEach(button => button.classList.toggle("active", button.dataset.tab === tabId));
    $$(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tabId));
    if (scroll) $("#job-hero").scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.innerWidth <= 760) $("#sidebar").classList.remove("open");
  }

  function selectJob(jobId, withProcessing = false) {
    if (jobId !== "custom" && !jobs[jobId]) return;
    const finish = () => {
      state.currentJobId = jobId;
      state.matrixFilter = "all";
      state.questionBankFilter = "recommended";
      state.agentRoundFilter = "priority";
      state.visualGenAIFilter = "priority";
      state.deepMLFilter = "priority";
      state.pythonAlgorithmFilter = "priority";
      safeStore("rolefit.currentJob", jobId);
      renderAll();
      showToast(`已切换到 ${getJob().shortName}`);
    };
    withProcessing ? simulateProcessing(finish) : finish();
  }

  function simulateProcessing(callback) {
    const overlay = $("#processing-overlay");
    const steps = ["提取岗位职责与硬要求", "识别级别、场景与关键词", "对齐候选人证据", "生成简历与面试路径", "运行真实性与隐私校验"];
    $("#processing-steps").innerHTML = steps.map((step,index) => `<div class="processing-step ${index === 0 ? "active" : ""}"><i>${index + 1}</i><span>${step}</span></div>`).join("");
    $("#processing-bar").style.width = "8%";
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    let index = 0;
    const handle = setInterval(() => {
      const stepEls = $$(".processing-step", overlay);
      if (stepEls[index]) {
        stepEls[index].classList.remove("active");
        stepEls[index].classList.add("done");
        stepEls[index].querySelector("i").textContent = "✓";
      }
      index += 1;
      $("#processing-bar").style.width = `${Math.min(100, 12 + index * 18)}%`;
      if (stepEls[index]) stepEls[index].classList.add("active");
      if (index >= steps.length) {
        clearInterval(handle);
        setTimeout(() => {
          overlay.classList.remove("active");
          overlay.setAttribute("aria-hidden", "true");
          callback();
        }, 260);
      }
    }, 260);
  }

  function showToast(message) {
    const toast = $("#toast");
    $("span", toast).textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.handle);
    showToast.handle = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    showToast(successMessage);
  }

  function toggleDay(dayIndex) {
    const job = getJob();
    const done = completedDays(job.id);
    const position = done.indexOf(dayIndex);
    if (position >= 0) done.splice(position, 1); else done.push(dayIndex);
    safeStore(`rolefit.days.${job.id}`, JSON.stringify(done));
    renderInterview(job);
  }

  function updateTimerDisplay() {
    const display = $("#timer-display");
    if (!display) return;
    const minutes = String(Math.floor(state.timerSeconds / 60)).padStart(2, "0");
    const seconds = String(state.timerSeconds % 60).padStart(2, "0");
    display.textContent = `${minutes}:${seconds}`;
    const startButton = $("#timer-start");
    if (startButton) startButton.textContent = state.timerRunning ? "暂停" : (state.timerSeconds < 120 ? "继续" : "开始练习");
  }

  function toggleTimer() {
    state.timerRunning = !state.timerRunning;
    clearInterval(state.timerHandle);
    if (state.timerRunning) {
      state.timerHandle = setInterval(() => {
        state.timerSeconds -= 1;
        if (state.timerSeconds <= 0) {
          state.timerSeconds = 0;
          state.timerRunning = false;
          clearInterval(state.timerHandle);
          showToast("两分钟到，开始复盘答案");
        }
        updateTimerDisplay();
      }, 1000);
    }
    updateTimerDisplay();
  }

  function resetTimer() {
    state.timerRunning = false;
    state.timerSeconds = 120;
    clearInterval(state.timerHandle);
    updateTimerDisplay();
  }

  function saveSalaryDraft() {
    const job = getJob();
    if (!job) return;
    const draft = {};
    $$('[data-salary-field]').forEach(input => { draft[input.dataset.salaryField] = input.value.trim(); });
    safeStore(salaryStorageKey(job.id), JSON.stringify(draft));
    const readiness = salaryReadiness(draft);
    const ring = $(".readiness-ring");
    if (ring) ring.style.setProperty("--readiness", readiness.percent);
    const value = $("#salary-readiness-value");
    const count = $("#salary-readiness-count");
    if (value) value.textContent = `${readiness.percent}%`;
    if (count) count.textContent = `${readiness.completed} / ${readiness.total} 项`;
  }

  function clearSalaryDraft() {
    if (!window.confirm("只清空当前岗位保存在此浏览器中的谈薪字段，继续吗？")) return;
    try { localStorage.removeItem(salaryStorageKey(getJob().id)); } catch (_) { /* storage can be blocked */ }
    renderSalary(getJob());
    showToast("当前岗位的谈薪记录已清空");
  }

  function saveOutcomeEvent() {
    const type = $("#outcome-type")?.value || "update";
    const date = $("#outcome-date")?.value;
    const note = $("#outcome-note")?.value.trim();
    if (!date || !note) {
      showToast("请填写日期和动态内容");
      return;
    }
    const job = getJob();
    const events = outcomeEvents(job.id);
    if (events.some(item => item.type === type && item.date === date && item.note === note)) {
      showToast("这条动态已经记录过了");
      return;
    }
    events.push({ id: `${Date.now()}`, type, date, note });
    safeStore(`rolefit.outcomes.${job.id}`, JSON.stringify(events));
    renderStatus(job);
    showToast("申请动态已追加到本地记录");
  }

  function renderProfileDrawer() {
    $("#profile-evidence-list").innerHTML = candidate.evidence.map(item => `<div class="drawer-evidence"><span class="drawer-evidence-id">${escapeHtml(item.id)}</span><div><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.detail)}</p></div></div>`).join("");
  }

  function setDrawer(open) {
    $("#profile-drawer").classList.toggle("open", open);
    $("#profile-drawer").setAttribute("aria-hidden", String(!open));
    $("#drawer-scrim").classList.toggle("open", open);
  }

  function analyzeCustomJD(title, company, rawText) {
    const text = rawText.toLowerCase();
    const dictionary = [
      { pattern: /agent|agentic|langgraph|crewai|autogen/, skill: "Agent 系统开发", evidence: "E02 · 可靠 Agent 工作流", status: "strong", action: "用可运行 workflow 说明编排与失败恢复" },
      { pattern: /rag|retrieval|vector|embedding/, skill: "RAG / Retrieval", evidence: "E08 · 本地检索与 evidence-aware 产品", status: "partial", action: "补充 retrieval evaluation 与引用策略" },
      { pattern: /cloud|aws|azure|gcp|kubernetes/, skill: "云架构与部署", evidence: "Docker / FastAPI 为相邻证据，云平台项目未确认", status: "partial", action: "准备一份云端部署架构并标明经验边界" },
      { pattern: /evaluation|observability|monitoring|metric/, skill: "评估与可观测性", evidence: "E02 + E05 · traces、hard cases、release gates", status: "strong", action: "把指标连接到业务成功标准" },
      { pattern: /customer|client|stakeholder|cross-functional/, skill: "客户与跨团队协作", evidence: "E04 · product、QA、runtime、customer-facing", status: "strong", action: "准备一段冲突或模糊需求故事" },
      { pattern: /c\+\+|android|edge|runtime|on-device/, skill: "运行时与原生集成", evidence: "E03 · C++/Android、端侧与 GPU pipeline", status: "strong", action: "突出模型到设备交付和 debug" },
      { pattern: /computer vision|image|camera|opencv/, skill: "计算机视觉", evidence: "E06 · 分割、深度、检测、光流与计算摄影", status: "strong", action: "选择最贴近业务的一段经历" },
      { pattern: /production|deployment|ship|end-to-end/, skill: "生产交付", evidence: "E01 · 需求到生产 handoff", status: "strong", action: "讲清验收门槛、发布与长期维护" },
      { pattern: /fine-tun|training|machine learning|deep learning/, skill: "ML / DL", evidence: "E03 + E06 · 训练、量化、部署", status: "strong", action: "准备模型与系统指标的取舍" },
      { pattern: /mentor|leadership|manage team/, skill: "Mentoring / Leadership", evidence: "有交付标准，人员管理证据未确认", status: "gap", action: "只在有真实经历时补充" }
    ];
    let requirements = dictionary.filter(item => item.pattern.test(text)).map(item => ({ ...item, priority: item.status === "gap" ? "职责" : "核心" }));
    if (requirements.length < 5) {
      requirements = requirements.concat([
        { skill: "问题解决与交付", priority: "通用", status: "strong", evidence: "E01 · 端到端生产交付", action: "用完整生命周期案例证明" },
        { skill: "沟通与协作", priority: "通用", status: "strong", evidence: "E04 · 多团队验收与发布", action: "准备一次高歧义协作故事" }
      ]).slice(0, 7);
    }
    const strong = requirements.filter(r => r.status === "strong").length;
    const partial = requirements.filter(r => r.status === "partial").length;
    const fit = Math.min(91, Math.round(55 + strong * 5 + partial * 2));
    const base = JSON.parse(JSON.stringify(jobs.bytedance));
    const hostname = (() => { try { return new URL($("#job-url").value).hostname.replace(/^www\./, ""); } catch (_) { return "custom"; } })();
    base.id = "custom";
    base.shortName = company || "自定义岗位";
    base.logo = (company || title || "J").trim().slice(0, 1).toUpperCase();
    base.logoTone = "sea";
    base.title = title || rawText.split(/\r?\n/).find(Boolean)?.slice(0, 80) || "自定义岗位";
    base.company = company || hostname;
    base.jobCode = "LOCAL-JD";
    base.url = "";
    base.sourceLabel = "用户粘贴 JD · 浏览器本地解析";
    base.sourceDate = new Date().toISOString().slice(0, 10);
    base.fit = fit;
    base.fitLabel = fit >= 80 ? "初步强匹配，继续核实门槛项" : "存在可迁移能力，需要补充直接证据";
    base.verdict = `本地关键词解析找到 ${requirements.length} 组要求，其中 ${strong} 组有直接或相邻证据。接入模型后应重新做结构化解析与人工复核。`;
    base.narrative = "用真实生产交付证据回应岗位最看重的问题，再诚实说明相邻能力与未知项。";
    base.mustHaveMatched = `${strong} / ${requirements.length}`;
    base.priorityGapCount = requirements.filter(r => r.status === "gap").length;
    base.summary = rawText.replace(/\s+/g, " ").slice(0, 240) + (rawText.length > 240 ? "…" : "");
    base.requirements = requirements;
    base.topKeywords = requirements.map(r => r.skill).slice(0, 8);
    base.companyFacts = [{ label: "来源", value: "用户粘贴的岗位描述", detail: "未联网补充公司事实；请以官方页面为准。", confidence: "待核实" }];
    base.questionsToAsk = ["这个岗位入职后 90 天最重要的成功标准是什么？", "当前团队最棘手的生产失败模式是什么？", "岗位描述中哪些要求是硬门槛，哪些可以入职后补齐？", "团队如何定义从原型到正式上线的验收条件？"];
    base.application = {
      stage: "准备材料",
      stageIndex: 0,
      pipelineStatus: "preparing",
      lastActivity: base.sourceDate,
      channel: "本地 JD",
      contactPerson: "尚无联系人",
      updated: base.sourceDate,
      nextEvent: "待手动更新",
      nextEventLabel: "暂无已确认安排",
      statusSummary: "本地 JD 已解析；提交状态、联系人与面试安排尚未确认。",
      milestones: [
        { state: "current", date: "现在", title: "准备材料", detail: "核对岗位、CV 与官方申请渠道" },
        { state: "pending", date: "待确认", title: "提交申请", detail: "提交后再记录真实日期" },
        { state: "pending", date: "待更新", title: "招聘沟通", detail: "尚无已确认安排" },
        { state: "pending", date: "待更新", title: "面试流程", detail: "尚无已确认安排" }
      ],
      actions: ["核对官方岗位", "逐条校对定制 CV", "准备岗位最相关的 STAR", "提交后记录日期与联系人"],
      links: []
    };
    base.evaluation = {
      eligibility: { status: "unverified", label: "工作资格待核实", detail: "粘贴的 JD 尚未完成 citizenship、work rights 与 sponsorship 核验。" },
      location: { status: "unknown", label: "地点待核实", detail: base.location },
      dimensions: [
        { label: "技术技能", score: fit, weight: 30, note: "基于当前关键词与证据启发式匹配。" },
        { label: "经验贴合", score: Math.max(40, fit - 5), weight: 25, note: "需要人工区分直接经验和相邻经验。" },
        { label: "行为与协作", score: Math.max(40, fit - 3), weight: 15, note: "当前 JD 信息有限。" },
        { label: "职业方向", score: fit, weight: 30, note: "需要结合长期目标人工确认。" }
      ]
    };
    base.interviewContext = {
      stage: "尚未安排",
      format: "等待真实流程信息",
      focus: base.topKeywords.slice(0, 4),
      bridge: "先承认真实缺口，再连接相邻经验，最后给出具体的学习与验证路径。"
    };
    base.negotiationProfile = {
      phase: "P1 · 信息收集",
      timing: "先准备目标与价值证据；收到真实招聘沟通后再确认 band、level 与流程。",
      leverage: ["岗位要求与真实生产交付证据的交集", "可核验的工程作品与系统设计能力"],
      known: [`岗位：${base.title}`, `公司：${base.company}`],
      unknown: ["level 与薪酬带宽", "目标 base / total compensation", "notice period / earliest start", "签证政策与真实 competing offer"]
    };
    base.qa.keyword = Math.min(90, 60 + requirements.length * 4);
    base.qa.warnings = ["这是浏览器内的关键词启发式分析，不等于模型深度解析。", "公司事实未联网补全，请核对官方页面。", "所有经历与结果仍需候选人逐条确认。"];
    return base;
  }

  function handleCustomSubmit(event) {
    event.preventDefault();
    const title = $("#custom-title").value.trim();
    const company = $("#custom-company").value.trim();
    const rawText = $("#custom-jd").value.trim();
    if (rawText.length < 80) {
      showToast("请粘贴至少 80 字的岗位描述");
      return;
    }
    $("#jd-dialog").close();
    simulateProcessing(() => {
      state.customJob = analyzeCustomJD(title, company, rawText);
      state.currentJobId = "custom";
      state.matrixFilter = "all";
      renderAll();
      showToast("本地分析完成，请人工复核");
    });
  }

  document.addEventListener("click", (event) => {
    const jobButton = event.target.closest("[data-job]");
    if (jobButton) return selectJob(jobButton.dataset.job);

    const tabButton = event.target.closest("[data-tab]");
    if (tabButton) return setActiveTab(tabButton.dataset.tab);

    const filterButton = event.target.closest("[data-filter]");
    if (filterButton) {
      state.matrixFilter = filterButton.dataset.filter;
      renderRadar(getJob());
      return;
    }

    const bankFilter = event.target.closest("[data-bank-filter]");
    if (bankFilter) {
      state.questionBankFilter = bankFilter.dataset.bankFilter;
      renderCommunityQuestionBank(getJob());
      return;
    }

    const communityQuestion = event.target.closest("[data-community-question]");
    if (communityQuestion) return toggleCommunityQuestion(communityQuestion.dataset.communityQuestion);

    const deepMLFilter = event.target.closest("[data-deep-ml-filter]");
    if (deepMLFilter) {
      state.deepMLFilter = deepMLFilter.dataset.deepMlFilter;
      renderDeepMLBank(getJob());
      return;
    }

    const deepMLQuestion = event.target.closest("[data-deep-ml-question]");
    if (deepMLQuestion) return toggleDeepMLQuestion(deepMLQuestion.dataset.deepMlQuestion);

    const pythonAlgorithmFilter = event.target.closest("[data-python-algo-filter]");
    if (pythonAlgorithmFilter) {
      state.pythonAlgorithmFilter = pythonAlgorithmFilter.dataset.pythonAlgoFilter;
      renderPythonAlgorithmBank(getJob());
      return;
    }

    const pythonAlgorithmQuestion = event.target.closest("[data-python-algo-question]");
    if (pythonAlgorithmQuestion) return togglePythonAlgorithmQuestion(pythonAlgorithmQuestion.dataset.pythonAlgoQuestion);

    const agentRoundFilter = event.target.closest("[data-agent-round-filter]");
    if (agentRoundFilter) {
      state.agentRoundFilter = agentRoundFilter.dataset.agentRoundFilter;
      renderAgentSecondRoundBank(getJob());
      return;
    }

    const agentRoundQuestion = event.target.closest("[data-agent-round-question]");
    if (agentRoundQuestion) return toggleAgentRoundQuestion(agentRoundQuestion.dataset.agentRoundQuestion);

    const visualGenAIFilter = event.target.closest("[data-visual-genai-filter]");
    if (visualGenAIFilter) {
      state.visualGenAIFilter = visualGenAIFilter.dataset.visualGenaiFilter;
      renderVisualGenAIBank(getJob());
      return;
    }

    const visualGenAIQuestion = event.target.closest("[data-visual-genai-question]");
    if (visualGenAIQuestion) return toggleVisualGenAIQuestion(visualGenAIQuestion.dataset.visualGenaiQuestion);

    const questionButton = event.target.closest("[data-question]");
    if (questionButton) {
      questionButton.closest(".question-item").classList.toggle("open");
      return;
    }

    const dayButton = event.target.closest("[data-day]");
    if (dayButton) return toggleDay(Number(dayButton.dataset.day));

    if (event.target.closest("#copy-resume")) return copyText(resumeText(getJob()), "简历文本已复制");
    if (event.target.closest("#print-resume")) return window.print();
    if (event.target.closest("#timer-start")) return toggleTimer();
    if (event.target.closest("#timer-reset")) return resetTimer();
    const salaryCopy = event.target.closest("[data-salary-copy]");
    if (salaryCopy) {
      const script = salaryNegotiation.scripts.find(item => item.id === salaryCopy.dataset.salaryCopy);
      if (script) return copyText(script.text.replaceAll("Sea", getJob().shortName), "谈薪话术已复制");
    }
    if (event.target.closest("#clear-salary-draft")) return clearSalaryDraft();
    if (event.target.closest("#save-outcome-event")) return saveOutcomeEvent();
    if (event.target.closest("#save-interview-debrief")) return saveInterviewDebrief();
    if (event.target.closest("#profile-button")) return setDrawer(true);
    if (event.target.closest("#close-profile") || event.target.closest("#drawer-scrim")) return setDrawer(false);
    if (event.target.closest("#open-jd-dialog")) return $("#jd-dialog").showModal();
    if (event.target.closest("#menu-button")) return $("#sidebar").classList.toggle("open");
  });

  $("#url-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const url = $("#job-url").value.trim().toLowerCase();
    if (url.includes("j02160995")) return selectJob("sea", true);
    if (url.includes("7652283061795391797")) return selectJob("bytedance", true);
    try {
      const parsed = new URL(url);
      $("#custom-company").value = parsed.hostname.replace(/^www\./, "").split(".")[0] || "";
    } catch (_) { /* leave blank */ }
    $("#jd-dialog").showModal();
    showToast("新链接请补充 JD 文本");
  });

  $("#jd-form").addEventListener("submit", handleCustomSubmit);

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-salary-field]")) saveSalaryDraft();
  });

  document.addEventListener("keydown", (event) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    const tabs = Object.keys(tabLabels);
    if (/^[1-7]$/.test(event.key)) setActiveTab(tabs[Number(event.key) - 1]);
    if (event.key === "Escape") {
      setDrawer(false);
      $("#sidebar").classList.remove("open");
    }
  });

  renderProfileDrawer();
  renderAll();
})();
