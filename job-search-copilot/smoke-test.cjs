const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");
const { chromium } = require("playwright");

const root = __dirname;
const artifactDir = process.env.ROLEFIT_QA_DIR || path.join(os.tmpdir(), "rolefit-qa");
const dailyArtifactDir = artifactDir;
const canonicalCvPath = path.resolve(root, "..", "assets", "junxian-wu-cv.pdf");
const submittedCvPath = path.resolve(root, "..", "output", "pdf", "Junxian_Wu_Applied_AI_FDE_CV_2026.pdf");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};

fs.mkdirSync(artifactDir, { recursive: true });
fs.mkdirSync(dailyArtifactDir, { recursive: true });
assert.ok(fs.existsSync(canonicalCvPath), "Canonical CV link target should exist");
assert.ok(fs.existsSync(submittedCvPath), "Submitted CV archive link target should exist");

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const file = path.resolve(root, requested);
  if (!file.startsWith(path.resolve(root)) || !fs.existsSync(file)) {
    response.writeHead(404);
    return response.end("Not found");
  }
  response.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
});

(async () => {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const runtimeErrors = [];
    page.on("pageerror", error => runtimeErrors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });

    assert.match(await page.title(), /RoleFit/);
    assert.match(await page.locator("#job-hero h2").innerText(), /Senior AI Engineer/);
    assert.strictEqual(await page.locator(".toolkit-grid button").count(), 5);
    assert.ok(await page.locator('[data-panel="status"]').evaluate(node => node.classList.contains("active")));
    assert.match(await page.locator("#tab-status").innerText(), /已结束 · 无后续/);
    assert.match(await page.locator("#tab-status").innerText(), /HR Call 后未进入后续轮次/);
    assert.match(await page.locator(".status-focus-card").innerText(), /归档后只做这几件事/);
    assert.strictEqual(await page.locator(".pipeline-row").count(), 2);
    assert.match(await page.locator('.pipeline-row[data-job="sea"] .pipeline-status').innerText(), /已结束/);
    assert.strictEqual(await page.locator(".linkedin-opportunity-row").count(), 15);
    assert.match(await page.locator(".linkedin-opportunity-board").innerText(), /GoTo Financial/);
    assert.match(await page.locator(".linkedin-opportunity-board").innerText(), /Motional/);
    assert.match(await page.locator(".linkedin-opportunity-board").innerText(), /历史候选池/);
    assert.strictEqual(await page.locator(".opportunity-status.status-recheck").count(), 14);
    assert.match(await page.locator(".pipeline-summary-grid article").nth(1).innerText(), /READY\s*0/);
    assert.strictEqual(await page.locator('.linkedin-opportunity-board a[href="multi-role-interview-playbook.html"]').count(), 1);
    assert.strictEqual(await page.locator('.linkedin-opportunity-board a[href="daily-job-search-cockpit.html"]').count(), 1);
    assert.match(await page.locator(".application-archive-card").innerText(), /Junxian_Wu_Applied_AI_FDE_CV_2026/);
    assert.strictEqual(await page.locator('a[href="enterprise-rag-playbook.html"]').count(), 1);
    await page.locator("#outcome-note").fill("Smoke test: confirmed local append-only journal.");
    await page.locator("#save-outcome-event").click();
    const outcomeDraft = await page.evaluate(() => JSON.parse(localStorage.getItem("rolefit.outcomes.sea")));
    assert.strictEqual(outcomeDraft.at(-1).type, "update");
    await page.screenshot({ path: path.join(artifactDir, "desktop-status.png"), fullPage: true });

    await page.locator('[data-tab="salary"]').first().click();
    assert.match(await page.locator("#tab-salary").innerText(), /Salary Negotiation Skill/);
    assert.match(await page.locator("#tab-salary").innerText(), /P1/);
    await page.locator('[data-salary-field="noticePeriod"]').fill("1 month");
    const salaryDraft = await page.evaluate(() => JSON.parse(localStorage.getItem("rolefit.salary.sea")));
    assert.strictEqual(salaryDraft.noticePeriod, "1 month");
    await page.screenshot({ path: path.join(artifactDir, "desktop-salary.png"), fullPage: true });

    await page.locator('[data-tab="radar"]').first().click();
    assert.ok(await page.locator(".matrix-row").count() >= 8, "Sea matrix should contain the extracted requirements");
    assert.match(await page.locator(".eligibility-gate").innerText(), /签证支持待核实/);
    assert.strictEqual(await page.locator(".dimension-item").count(), 4);
    await page.screenshot({ path: path.join(artifactDir, "desktop-radar.png"), fullPage: true });

    const shortcutPath = "C:\\Users\\User\\Desktop\\求职准备与面试追踪.url";
    if (fs.existsSync(shortcutPath)) {
      const shortcutText = fs.readFileSync(shortcutPath, "utf8");
      const shortcutUrl = shortcutText.match(/^URL=(.+)$/m)?.[1]?.trim();
      assert.ok(shortcutUrl, "Desktop shortcut should contain a URL");
      const shortcutPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await shortcutPage.goto(shortcutUrl, { waitUntil: "domcontentloaded" });
      assert.ok(await shortcutPage.locator('[data-panel="status"]').evaluate(node => node.classList.contains("active")));
      assert.match(await shortcutPage.locator("#tab-status").innerText(), /已结束 · 无后续/);
      await shortcutPage.close();
    }

    const linkedPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await linkedPage.goto(`http://127.0.0.1:${port}/?job=bytedance&tab=company`, { waitUntil: "networkidle" });
    assert.match(await linkedPage.locator("#job-hero h2").innerText(), /Forward Deployed Engineer/);
    assert.ok(await linkedPage.locator('[data-panel="company"]').evaluate(node => node.classList.contains("active")));
    await linkedPage.close();

    await page.locator('[data-job="bytedance"]').first().click();
    assert.match(await page.locator("#job-hero h2").innerText(), /Forward Deployed Engineer/);

    await page.locator('[data-tab="resume"]').first().click();
    assert.match(await page.locator("#resume-paper").innerText(), /Forward Deployed AI Engineer/i);
    await page.screenshot({ path: path.join(artifactDir, "desktop-resume.png"), fullPage: true });

    await page.locator('[data-tab="interview"]').first().click();
    assert.match(await page.locator(".interview-context-card").innerText(), /CONSISTENCY SOURCE/);
    assert.match(await page.locator(".consistency-brief-card").innerText(), /纸面上的每个重点/);
    assert.match(await page.locator("#industry-search-runbook").innerText(), /每场面试当作一门不同的课/);
    assert.strictEqual(await page.locator("#industry-search-runbook .interview-mode-card").count(), 4);
    await page.locator("#debrief-signal").fill("Smoke test: interviewer asked about trace replay and failure boundaries.");
    await page.locator("#debrief-gap").fill("Practice a 90-second retry and idempotency explanation.");
    await page.locator("#debrief-action").fill("Do one reliability mock tomorrow.");
    await page.locator("#save-interview-debrief").click();
    const debriefDraft = await page.evaluate(() => JSON.parse(localStorage.getItem("rolefit.interviewDebriefs.bytedance")));
    assert.strictEqual(debriefDraft.at(-1).gap, "Practice a 90-second retry and idempotency explanation.");
    assert.match(await page.locator("#industry-search-runbook .debrief-history").innerText(), /trace replay/);
    assert.match(await page.locator("#community-question-bank").innerText(), /小红书题单/);
    assert.strictEqual(await page.locator("#community-question-bank .bank-sources a").count(), 2);
    assert.ok(await page.locator("#community-question-bank .community-question").count() >= 10, "Recommended community bank should expose P0 questions");
    const firstQuestionId = await page.locator("[data-community-question]").first().getAttribute("data-community-question");
    await page.locator("[data-community-question]").first().click();
    const communityProgress = await page.evaluate(() => JSON.parse(localStorage.getItem("rolefit.communityQuestions.bytedance")));
    assert.ok(communityProgress.includes(firstQuestionId), "Question practice progress should persist");
    await page.locator('[data-bank-filter="coding"]').click();
    assert.ok(await page.locator("#community-question-bank .community-question").count() >= 10, "Coding filter should show the extended practice bank");
    assert.match(await page.locator("#python-algorithm-bank").innerText(), /Python/);
    assert.strictEqual(await page.locator("#python-algorithm-bank .python-algorithm-question").count(), 18);
    await page.locator("#python-algorithm-bank .python-algorithm-question").first().locator("summary").click();
    assert.match(await page.locator("#python-algorithm-bank .python-algorithm-question").first().innerText(), /Python 解题主线/);
    const firstPythonAlgorithmQuestionId = await page.locator("[data-python-algo-question]").first().getAttribute("data-python-algo-question");
    await page.locator("[data-python-algo-question]").first().click();
    const pythonAlgorithmProgress = await page.evaluate(() => JSON.parse(localStorage.getItem("rolefit.pythonAlgorithmQuestions.bytedance")));
    assert.ok(pythonAlgorithmProgress.includes(firstPythonAlgorithmQuestionId), "Python algorithm practice progress should persist");
    await page.locator('[data-python-algo-filter="all"]').click();
    assert.strictEqual(await page.locator("#python-algorithm-bank .python-algorithm-question").count(), 30);
    assert.match(await page.locator("#deep-ml-bank").innerText(), /Deep-ML/);
    assert.strictEqual(await page.locator("#deep-ml-bank .deep-ml-question").count(), 13);
    await page.locator("#deep-ml-bank .deep-ml-question").first().locator("summary").click();
    assert.match(await page.locator("#deep-ml-bank .deep-ml-question").first().innerText(), /核心答案/);
    await page.locator("#deep-ml-bank").screenshot({ path: path.join(artifactDir, "deep-ml-bank.png") });
    const firstDeepMLQuestionId = await page.locator("[data-deep-ml-question]").first().getAttribute("data-deep-ml-question");
    await page.locator("[data-deep-ml-question]").first().click();
    const deepMLProgress = await page.evaluate(() => JSON.parse(localStorage.getItem("rolefit.deepMLQuestions.bytedance")));
    assert.ok(deepMLProgress.includes(firstDeepMLQuestionId), "Deep-ML practice progress should persist");
    await page.locator('[data-deep-ml-filter="all"]').click();
    assert.strictEqual(await page.locator("#deep-ml-bank .deep-ml-question").count(), 30);
    assert.match(await page.locator("#agent-second-round-bank").innerText(), /Agent 开发二面 48 题/);
    assert.strictEqual(await page.locator("#agent-second-round-bank .agent-round-question").count(), 18);
    await page.locator("#agent-second-round-bank .agent-round-question").first().locator("summary").click();
    assert.match(await page.locator("#agent-second-round-bank .agent-round-question").first().innerText(), /三步答题结构/);
    const firstAgentQuestionId = await page.locator("[data-agent-round-question]").first().getAttribute("data-agent-round-question");
    await page.locator("[data-agent-round-question]").first().click();
    const agentRoundProgress = await page.evaluate(() => JSON.parse(localStorage.getItem("rolefit.agentRoundQuestions.bytedance")));
    assert.ok(agentRoundProgress.includes(firstAgentQuestionId), "Agent round practice progress should persist");
    await page.locator('[data-agent-round-filter="all"]').click();
    assert.strictEqual(await page.locator("#agent-second-round-bank .agent-round-question").count(), 48);
    assert.match(await page.locator("#visual-genai-bank").innerText(), /视觉生成模型专项题库/);
    assert.strictEqual(await page.locator("#visual-genai-bank .visual-genai-question").count(), 15);
    await page.locator("#visual-genai-bank .visual-genai-question").first().locator("summary").click();
    assert.match(await page.locator("#visual-genai-bank .visual-genai-question").first().innerText(), /核心结论/);
    const firstVisualQuestionId = await page.locator("[data-visual-genai-question]").first().getAttribute("data-visual-genai-question");
    await page.locator("[data-visual-genai-question]").first().click();
    const visualProgress = await page.evaluate(() => JSON.parse(localStorage.getItem("rolefit.visualGenAIQuestions.bytedance")));
    assert.ok(visualProgress.includes(firstVisualQuestionId), "Visual GenAI practice progress should persist");
    await page.locator('[data-visual-genai-filter="all"]').click();
    assert.strictEqual(await page.locator("#visual-genai-bank .visual-genai-question").count(), 22);
    await page.screenshot({ path: path.join(artifactDir, "desktop-interview.png"), fullPage: true });
    await page.locator('[data-day="0"]').click();
    assert.ok(await page.locator('[data-day="0"]').evaluate(node => node.classList.contains("done")));

    await page.locator("#open-jd-dialog").click();
    await page.locator("#custom-title").fill("Applied AI Engineer");
    await page.locator("#custom-company").fill("Example AI");
    await page.locator("#custom-jd").fill("We are hiring an Applied AI Engineer to build and deploy production agent systems. The role works with customers and cross-functional stakeholders, integrates APIs, designs evaluation and observability, and ships cloud services using Docker. Experience with RAG, retrieval, Python, machine learning and reliable production deployment is required.");
    await page.locator("#analyze-custom").click();
    await page.locator("#processing-overlay").waitFor({ state: "visible" });
    await page.locator("#processing-overlay").waitFor({ state: "hidden", timeout: 8000 });
    assert.match(await page.locator("#job-hero h2").innerText(), /Applied AI Engineer/);
    assert.match(await page.locator("#job-hero").innerText(), /浏览器本地解析/);

    const seaGuide = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await seaGuide.goto(`http://127.0.0.1:${port}/sea-senior-ai-engineer-interview-guide.html#community-bank`, { waitUntil: "networkidle" });
    assert.match(await seaGuide.locator("#community-bank").innerText(), /LC 3/);
    assert.match(await seaGuide.locator("#community-bank").innerText(), /当前阶段顺序/);
    assert.strictEqual(await seaGuide.locator('#community-bank a[href*="xiaohongshu.com/explore/"]').count(), 2);
    assert.match(await seaGuide.locator("#python-algorithms").innerText(), /Python 现场协议/);
    assert.strictEqual(await seaGuide.locator("#python-algorithms .question-cloud span").count(), 18);
    assert.strictEqual(await seaGuide.locator('#python-algorithms a[href*="youngyangyang04/leetcode-master"]').count(), 1);
    assert.match(await seaGuide.locator("#deep-ml").innerText(), /30 道/);
    assert.strictEqual(await seaGuide.locator('#deep-ml a[href="https://www.deep-ml.com/problems"]').count(), 1);
    assert.strictEqual(await seaGuide.locator("#deep-ml .question-cloud span").count(), 13);
    assert.match(await seaGuide.locator("#agent-round-48").innerText(), /只能作为方案回答/);
    assert.strictEqual(await seaGuide.locator("#agent-round-48 .question-cloud span").count(), 19);
    assert.match(await seaGuide.locator("#visual-genai").innerText(), /FLUX 官方仓库/);
    assert.strictEqual(await seaGuide.locator("#visual-genai .question-cloud span").count(), 12);
    assert.match(await seaGuide.locator("#industry-playbook").innerText(), /立刻记录，不靠回忆/);
    assert.strictEqual(await seaGuide.locator('#industry-playbook a[href*="index.html?job=sea"]').count(), 1);
    assert.match(await seaGuide.locator("#enterprise-rag").innerText(), /ACL-first/);
    assert.strictEqual(await seaGuide.locator('#enterprise-rag a[href="enterprise-rag-playbook.html"]').count(), 1);
    await seaGuide.screenshot({ path: path.join(artifactDir, "sea-guide-community.png"), fullPage: true });
    await seaGuide.close();

    const ragPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const ragErrors = [];
    ragPage.on("pageerror", error => ragErrors.push(error.message));
    await ragPage.goto(`http://127.0.0.1:${port}/enterprise-rag-playbook.html`, { waitUntil: "networkidle" });
    assert.match(await ragPage.title(), /企业 RAG/);
    assert.strictEqual(await ragPage.locator(".flow-step").count(), 7);
    assert.strictEqual(await ragPage.locator("#checklist-items .check").count(), 12);
    await ragPage.locator('#checklist-items input[data-check="acl"]').check();
    const ragChecklist = await ragPage.evaluate(() => JSON.parse(localStorage.getItem("rolefit-enterprise-rag-checklist-v1")));
    assert.strictEqual(ragChecklist.acl, true);
    assert.match(await ragPage.locator("#check-label").innerText(), /1 \/ 12/);
    await ragPage.screenshot({ path: path.join(artifactDir, "enterprise-rag.png"), fullPage: true });
    await ragPage.setViewportSize({ width: 390, height: 844 });
    await ragPage.goto(`http://127.0.0.1:${port}/enterprise-rag-playbook.html#checklist`, { waitUntil: "networkidle" });
    const ragOverflow = await ragPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(ragOverflow <= 4, `Unexpected Enterprise RAG horizontal overflow: ${ragOverflow}px`);
    assert.deepStrictEqual(ragErrors, [], `Enterprise RAG runtime errors: ${ragErrors.join(" | ")}`);
    await ragPage.close();

    const multiRoleGuide = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const multiRoleErrors = [];
    multiRoleGuide.on("pageerror", error => multiRoleErrors.push(error.message));
    await multiRoleGuide.goto(`http://127.0.0.1:${port}/multi-role-interview-playbook.html?role=goto`, { waitUntil: "networkidle" });
    assert.match(await multiRoleGuide.title(), /多岗位面试作战手册/);
    assert.strictEqual(await multiRoleGuide.locator(".role-card").count(), 14);
    assert.strictEqual(await multiRoleGuide.locator(".role-card.highlight").count(), 1);
    assert.match(await multiRoleGuide.locator('[data-role-card="goto"]').innerText(), /fraud.*risk/i);
    assert.match(await multiRoleGuide.locator('[data-role-card="motional"]').innerText(), /safety/i);
    assert.match(await multiRoleGuide.locator('[data-role-card="micron"]').innerText(), /MLOps/i);
    assert.match(await multiRoleGuide.locator('[data-role-card="cohere"]').innerText(), /受限.*安全敏感/);
    assert.strictEqual(await multiRoleGuide.locator("#source-list .source-item").count(), 14);
    await multiRoleGuide.locator('[data-question-track="fde"]').click();
    assert.strictEqual(await multiRoleGuide.locator("#question-list .question-card").count(), 4);
    await multiRoleGuide.locator("#question-list .question-card").first().locator("summary").click();
    await multiRoleGuide.locator("#question-list [data-question-check]").first().check();
    const multiRoleProgress = await multiRoleGuide.evaluate(() => JSON.parse(localStorage.getItem("rolefit.multiRoleInterview.v1")));
    assert.ok(multiRoleProgress.questions.includes("f1"));
    await multiRoleGuide.locator('#role-search').fill("Motional");
    assert.strictEqual(await multiRoleGuide.locator(".role-card").count(), 1);
    await multiRoleGuide.locator('#role-search').fill("");
    await multiRoleGuide.screenshot({ path: path.join(artifactDir, "multi-role-guide-desktop.png"), fullPage: true });
    await multiRoleGuide.setViewportSize({ width: 390, height: 844 });
    await multiRoleGuide.goto(`http://127.0.0.1:${port}/multi-role-interview-playbook.html?role=goto`, { waitUntil: "networkidle" });
    const multiRoleOverflow = await multiRoleGuide.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(multiRoleOverflow <= 1, `Unexpected multi-role guide horizontal overflow: ${multiRoleOverflow}px`);
    assert.strictEqual(await multiRoleGuide.locator(".role-card").count(), 14);
    await multiRoleGuide.screenshot({ path: path.join(artifactDir, "multi-role-guide-mobile.png"), fullPage: true });
    assert.deepStrictEqual(multiRoleErrors, [], `Multi-role guide runtime errors: ${multiRoleErrors.join(" | ")}`);
    await multiRoleGuide.close();

    const dailyPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const dailyErrors = [];
    dailyPage.on("pageerror", error => dailyErrors.push(error.message));
    await dailyPage.goto(`http://127.0.0.1:${port}/daily-job-search-cockpit.html`, { waitUntil: "networkidle" });
    await dailyPage.evaluate(() => localStorage.removeItem("rolefit.dailyJobCockpit.v1"));
    await dailyPage.reload({ waitUntil: "networkidle" });
    assert.match(await dailyPage.title(), /每日 AI 求职驾驶舱/);
    assert.strictEqual(await dailyPage.locator(".task-item").count(), 3);
    assert.strictEqual(await dailyPage.locator("[data-mode]").count(), 3);
    assert.strictEqual(await dailyPage.locator("#skill-map .skill-column").count(), 3);
    assert.strictEqual(await dailyPage.locator("#method-grid .method-card").count(), 4);
    await dailyPage.locator('[data-mode="minimum"]').click();
    await dailyPage.locator("#role-selector").selectOption("motional");
    assert.match(await dailyPage.locator("#freshness-gate").innerText(), /未核验/);
    assert.strictEqual(await dailyPage.locator('#freshness-gate a[rel="noopener noreferrer"]').count(), 1);
    await dailyPage.locator("#verify-role").click();
    assert.ok(await dailyPage.locator("#freshness-gate").evaluate(node => node.classList.contains("fresh")));
    assert.match(await dailyPage.locator("#freshness-gate").innerText(), /岗位已于/);
    assert.match(await dailyPage.locator("#task-list").innerText(), /field hard case.*自动驾驶 edge-case/i);
    const minimumTimes = await dailyPage.locator(".task-time").allTextContents();
    assert.deepStrictEqual(minimumTimes, ["10 min", "8 min", "2 min"]);
    assert.strictEqual(await dailyPage.locator('[data-mode="minimum"]').getAttribute("aria-pressed"), "true");
    await dailyPage.locator('[data-task="learn"]').check();
    await dailyPage.locator('[data-task="ship"]').check();
    assert.strictEqual(await dailyPage.locator("#streak-count").innerText(), "1");
    await dailyPage.locator("#ship-type").selectOption("application");
    await dailyPage.locator("#ship-note").fill("Smoke test: saved one submitted Motional application result.");
    await dailyPage.locator("#ship-form button").click();
    assert.strictEqual(await dailyPage.locator("#metric-applications").innerText(), "1");
    assert.match(await dailyPage.locator("#ship-log").innerText(), /Motional application result/);
    await dailyPage.locator("#timer-toggle").click();
    assert.match(await dailyPage.locator("#timer-toggle").innerText(), /暂停/);
    await dailyPage.locator("#timer-reset").click();
    assert.strictEqual(await dailyPage.locator("#timer-display").innerText(), "15:00");
    await dailyPage.reload({ waitUntil: "networkidle" });
    assert.strictEqual(await dailyPage.locator("#role-selector").inputValue(), "motional");
    assert.ok(await dailyPage.locator('[data-mode="minimum"]').evaluate(node => node.classList.contains("active")));
    assert.ok(await dailyPage.locator('[data-task="learn"]').isChecked());
    assert.ok(await dailyPage.locator('[data-task="ship"]').isChecked());
    assert.ok(await dailyPage.locator("#freshness-gate").evaluate(node => node.classList.contains("fresh")));
    const persistedCockpit = await dailyPage.evaluate(() => JSON.parse(localStorage.getItem("rolefit.dailyJobCockpit.v1")));
    assert.ok(persistedCockpit.roleChecks.motional);
    await dailyPage.locator("#copy-skill-command").click();
    await dailyPage.waitForFunction(() => document.querySelector("#toast")?.textContent);
    assert.match(await dailyPage.locator("#toast").innerText(), /Skill 指令|run-junxian-ai-job-search/);
    await dailyPage.evaluate(() => window.scrollTo(0, 0));
    await dailyPage.screenshot({ path: path.join(dailyArtifactDir, "daily-cockpit-desktop.png"), fullPage: true });
    await dailyPage.setViewportSize({ width: 390, height: 844 });
    await dailyPage.reload({ waitUntil: "networkidle" });
    const dailyOverflow = await dailyPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(dailyOverflow <= 1, `Unexpected daily cockpit horizontal overflow: ${dailyOverflow}px`);
    assert.strictEqual(await dailyPage.locator(".task-item").count(), 3);
    await dailyPage.screenshot({ path: path.join(dailyArtifactDir, "daily-cockpit-mobile.png"), fullPage: true });
    assert.deepStrictEqual(dailyErrors, [], `Daily cockpit runtime errors: ${dailyErrors.join(" | ")}`);
    await dailyPage.close();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://127.0.0.1:${port}/?job=sea&tab=status`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(artifactDir, "mobile-status.png"), fullPage: true });
    let overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `Unexpected status page-level horizontal overflow: ${overflow}px`);
    await page.locator('[data-tab="radar"]').last().click();
    await page.screenshot({ path: path.join(artifactDir, "mobile-radar.png"), fullPage: true });
    overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `Unexpected page-level horizontal overflow: ${overflow}px`);
    await page.locator('[data-tab="interview"]').last().click();
    assert.strictEqual(await page.locator("#industry-search-runbook .interview-mode-card").count(), 4);
    assert.ok(await page.locator("#community-question-bank .community-question").count() >= 10, "Mobile interview view should render the recommended bank");
    assert.strictEqual(await page.locator("#python-algorithm-bank .python-algorithm-question").count(), 18);
    assert.strictEqual(await page.locator("#deep-ml-bank .deep-ml-question").count(), 13);
    assert.strictEqual(await page.locator("#agent-second-round-bank .agent-round-question").count(), 18);
    assert.strictEqual(await page.locator("#visual-genai-bank .visual-genai-question").count(), 15);
    await page.screenshot({ path: path.join(artifactDir, "mobile-interview.png"), fullPage: true });
    overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `Unexpected interview page-level horizontal overflow: ${overflow}px`);
    assert.deepStrictEqual(runtimeErrors, [], `Runtime errors: ${runtimeErrors.join(" | ")}`);
    console.log("RoleFit smoke test passed");
    console.log(path.join(artifactDir, "desktop-status.png"));
    console.log(path.join(artifactDir, "desktop-salary.png"));
    console.log(path.join(artifactDir, "desktop-radar.png"));
    console.log(path.join(artifactDir, "desktop-interview.png"));
    console.log(path.join(artifactDir, "deep-ml-bank.png"));
    console.log(path.join(artifactDir, "sea-guide-community.png"));
    console.log(path.join(artifactDir, "enterprise-rag.png"));
    console.log(path.join(artifactDir, "multi-role-guide-desktop.png"));
    console.log(path.join(artifactDir, "multi-role-guide-mobile.png"));
    console.log(path.join(dailyArtifactDir, "daily-cockpit-desktop.png"));
    console.log(path.join(dailyArtifactDir, "daily-cockpit-mobile.png"));
    console.log(path.join(artifactDir, "mobile-status.png"));
    console.log(path.join(artifactDir, "mobile-radar.png"));
    console.log(path.join(artifactDir, "mobile-interview.png"));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
  server.close();
});
