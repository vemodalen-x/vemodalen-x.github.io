const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(
  root,
  "outputs",
  "personal_brand_consolidation_2026_07_14",
  "site-verification"
);

const pages = ["index.html", "work.html", "agentic-systems.html", "resume.html"];
const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    for (const filename of pages) {
      const page = await context.newPage();
      const url = pathToFileURL(path.join(root, filename)).href;
      await page.goto(url, { waitUntil: "load" });
      const metrics = await page.evaluate(() => ({
        title: document.title,
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        bodyWidth: document.body.scrollWidth,
        brokenImages: [...document.images]
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.getAttribute("src")),
        visibleNavLinks: [...document.querySelectorAll(".topnav-links a")]
          .filter((link) => getComputedStyle(link).display !== "none")
          .map((link) => link.textContent.trim()),
      }));
      await page.setViewportSize({
        width: viewport.width,
        height: metrics.documentHeight,
      });
      await page.screenshot({
        path: path.join(outputDir, `${path.parse(filename).name}-${viewportName}.png`),
      });
      results.push({ filename, viewportName, ...metrics });
      await page.close();
    }
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(
    path.join(outputDir, "website-verification.json"),
    `${JSON.stringify(results, null, 2)}\n`,
    "utf8"
  );
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
})();
