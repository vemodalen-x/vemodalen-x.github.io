const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const appUrl = process.env.PHOTOGRAPHY_MENTOR_URL || "http://127.0.0.1:8010/photography-mentor-agent.html";
const screenshotRoot = process.env.PHOTOGRAPHY_MENTOR_QA_OUTPUT;

function screenshotPath(name) {
  return screenshotRoot ? `${screenshotRoot.replace(/\\/g, "/")}/${name}` : null;
}

async function capture(page, name) {
  const path = screenshotPath(name);
  if (path) await page.screenshot({ path });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });

  try {
    await page.goto(appUrl, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector("#header-kb-count")?.textContent.includes("74"));
    const counts = await page.evaluate(() => ({
      header: document.querySelector("#header-kb-count")?.textContent.trim(),
      cards: document.querySelector("#library-count")?.textContent.trim(),
      sources: document.querySelector("#source-count")?.textContent.trim(),
      coreVersion: window.PHOTOGRAPHY_MENTOR_CORE?.version,
      localCards: window.PHOTOGRAPHY_LOCAL_SUMMARIES?.cards?.length,
      contentSecurityPolicy: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content
    }));
    assert.equal(counts.header, "74 cards");
    assert.match(counts.cards, /74/);
    assert.match(counts.sources, /42/);
    assert.equal(counts.localCards, 12);
    assert.equal(counts.coreVersion, "2026.09.07-first-principles");
    assert.match(counts.contentSecurityPolicy, /object-src 'none'/);

    await page.locator('#workspace-mode-switch button[data-workspace-view="map"]').click();
    await page.locator('#taxonomy-view-switch button[data-taxonomy-view="atlas"]').click();
    const graphMerge = await page.evaluate(() => {
      const cluster = window.PHOTOGRAPHY_MENTOR_TAXONOMY.stages
        .flatMap((stage) => stage.clusters)
        .find((item) => item.id === "multiframe-hdr-computation");
      const core = window.PHOTOGRAPHY_MENTOR_CORE.create({
        knowledge: window.PHOTOGRAPHY_MENTOR_KB,
        taxonomy: window.PHOTOGRAPHY_MENTOR_TAXONOMY
      });
      return {
        canonicalCards: cluster.cardIds.length,
        unifiedCards: core.cardsForCluster(cluster.id, 100).length
      };
    });
    assert.ok(graphMerge.unifiedCards > graphMerge.canonicalCards);
    const graphNodeLabel = await page.locator('[data-atlas-cluster="multiframe-hdr-computation"] small').textContent();
    assert.match(graphNodeLabel, new RegExp(`${graphMerge.unifiedCards} 卡`));
    await page.locator('[data-atlas-cluster="multiframe-hdr-computation"]').scrollIntoViewIfNeeded();
    await capture(page, "graph-desktop.png");

    await page.locator('#workspace-mode-switch button[data-workspace-view="library"]').click();
    await page.locator("#local-books").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector("#local-book-count")?.textContent.trim() === "166");
    const local = await page.evaluate(() => {
      const section = document.querySelector("#local-books");
      return {
        visible: getComputedStyle(section).display !== "none" && !section.hidden,
        count: document.querySelector("#local-book-count")?.textContent.trim(),
        size: document.querySelector("#local-book-size")?.textContent.trim(),
        cards: document.querySelectorAll("#local-books-panel .kb-card").length,
        pathLeak: /[A-Z]:\\|file:\/\//i.test(section.textContent)
      };
    });
    assert.equal(local.visible, true);
    assert.equal(local.count, "166");
    assert.equal(local.size, "7.6 GB");
    assert.equal(local.cards, 12);
    assert.equal(local.pathLeak, false);
    await capture(page, "library-desktop.png");

    await page.locator('#workspace-mode-switch button[data-workspace-view="studio"]').click();
    await page.locator('button[data-mode="plan"]').click();
    await page.locator("#question-input").fill("我用手机拍雨天城市，天空和灯牌容易过曝，路面很乱。本轮先解决现场曝光，希望保留高光层次，最终做一组 9 张专题。");
    await page.locator("#generate-advice").click();
    await page.locator('[data-plan-section="review"]').waitFor();
    const output = await page.locator("#agent-output").textContent();
    const outputSections = await page.locator("#agent-output [data-plan-section]").count();
    assert.equal(outputSections, 7);
    for (const section of ["evidence", "bottleneck", "action", "verification"]) {
      assert.equal(await page.locator(`[data-plan-section="${section}"]`).count(), 1, `missing ${section}`);
    }
    assert.match(output, /待验证假设/);
    assert.ok(await page.locator(".mentor-knowledge-sources a").count() > 0);
    assert.match(output, /证据置信度\s+\d+%/);
    assert.equal(await page.locator("#decision-feedback").isVisible(), true);
    await page.locator('[data-decision-outcome="accepted"]').click();
    let feedback = await page.evaluate(() => JSON.parse(localStorage.getItem("photography-mentor-decision-feedback") || "[]"));
    assert.equal(feedback.length, 1);
    assert.equal(feedback[0].outcome, "accepted");
    assert.equal(feedback[0].bottleneck, "exposure");
    await page.locator("#decision-evidence").fill("同机位降低曝光后，灯牌纹理保留，主体中间调仍可读。");
    await page.locator("#verify-decision").click();
    feedback = await page.evaluate(() => JSON.parse(localStorage.getItem("photography-mentor-decision-feedback") || "[]"));
    assert.equal(feedback.length, 1);
    assert.equal(feedback[0].outcome, "verified");
    assert.match(feedback[0].evidence, /灯牌纹理/);
    assert.match(await page.locator("#decision-feedback-status").textContent(), /完成结果验证/);
    await capture(page, "advice-desktop.png");

    await page.locator('#workspace-mode-switch button[data-workspace-view="library"]').click();
    await page.locator("#data-control-center").scrollIntoViewIfNeeded();
    assert.equal(await page.locator("#data-control-center").isVisible(), true);
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#export-all-learning-data").click();
    const download = await downloadPromise;
    const chunks = [];
    for await (const chunk of await download.createReadStream()) chunks.push(chunk);
    const backup = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    assert.equal(backup.version, 4);
    assert.equal(backup.decisionFeedback.length, 1);
    assert.equal(backup.decisionFeedback[0].outcome, "verified");
    assert.equal(Object.prototype.hasOwnProperty.call(backup, "photoPixels"), false);
    await page.locator('#workspace-mode-switch button[data-workspace-view="studio"]').click();
    const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(desktopOverflow <= 1, `desktop overflow ${desktopOverflow}px`);
    await page.locator("#decision-feedback").scrollIntoViewIfNeeded();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#decision-feedback").scrollIntoViewIfNeeded();
    const mobileFeedbackOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(mobileFeedbackOverflow <= 1, `mobile feedback overflow ${mobileFeedbackOverflow}px`);
    await capture(page, "feedback-mobile.png");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector("#header-kb-count")?.textContent.includes("74"));
    const mobileOverflowInitial = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(mobileOverflowInitial <= 1, `mobile initial overflow ${mobileOverflowInitial}px`);
    await page.locator('#workspace-mode-switch button[data-workspace-view="studio"]').click();
    await page.locator("#mentor-workbench").scrollIntoViewIfNeeded();
    const mobileOverflowStudio = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(mobileOverflowStudio <= 1, `mobile studio overflow ${mobileOverflowStudio}px`);
    await capture(page, "studio-mobile.png");

    assert.deepEqual(errors, []);
    console.log(JSON.stringify({
      ok: true,
      counts,
      graphMerge,
      local,
      outputSections,
      desktopOverflow,
      mobileFeedbackOverflow,
      mobileOverflowInitial,
      mobileOverflowStudio,
      errors
    }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
