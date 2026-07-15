import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const port = process.env.CDP_PORT || "9222";
const outputDir = path.resolve("assets/yitang-accessible/protected-browser-captures");

const targets = [
  {
    id: "candy-1713-hamburger-selection",
    pageUrl: "https://yitanger.feishu.cn/minutes/obcn1fk1xp853re87a44s7g4",
    sourceToken: "LekubG9uroLq8uxiXagc7b2fnZY",
    output: "candy-1713-hamburger-selection.png",
  },
  {
    id: "candy-1713-chinese-hamburger-launch",
    pageUrl: "https://yitanger.feishu.cn/minutes/obcn6elrglg6a555l5469599",
    sourceToken: "PHXobzXO8oy6q4x3SV3cvSOPnRh",
    output: "candy-1713-chinese-hamburger-launch.png",
  },
  {
    id: "primary-862-ai-new-paradigm",
    pageUrl: "https://yitanger.feishu.cn/docx/ZBsFdMHkHo7mOGxRlz9c0LPBnah",
    sourceToken: "UIeNb6x6SoBAQdxl3YycfQ1Pn6d",
    output: "primary-862-ai-new-paradigm.png",
  },
];

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", reject);
  });
}

class CDP {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 0;
    this.pending = new Map();
    this.socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (!payload.id || !this.pending.has(payload.id)) return;
      this.pending.get(payload.id)(payload);
      this.pending.delete(payload.id);
    };
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve) => this.pending.set(id, resolve));
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (response.result.exceptionDetails) {
      throw new Error(JSON.stringify(response.result.exceptionDetails));
    }
    return response.result.result.value;
  }

  close() {
    this.socket.close();
  }
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function locateImage(cdp, sourceToken) {
  return cdp.evaluate(`(() => {
    const images = [...document.querySelectorAll('img')];
    const exact = images.find((image) => (image.currentSrc || image.src || '').includes(${JSON.stringify(sourceToken)}));
    const fallback = images
      .filter((image) => image.naturalWidth >= 900 && image.naturalHeight >= 400)
      .sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight))[0];
    const image = exact || fallback;
    if (!image) {
      return {
        ok: false,
        title: document.title,
        bodyPreview: (document.body.innerText || '').slice(0, 800),
        imageCount: images.length,
      };
    }
    image.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = image.getBoundingClientRect();
    return {
      ok: image.naturalWidth > 0 && image.naturalHeight > 0 && rect.width > 0 && rect.height > 0,
      matchedExact: Boolean(exact),
      src: image.currentSrc || image.src || '',
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      rect: {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      },
      title: document.title,
      bodyPreview: (document.body.innerText || '').slice(0, 800),
      imageCount: images.length,
    };
  })()`);
}

async function main() {
  const pages = await getJson(`http://127.0.0.1:${port}/json/list`);
  const page = pages.find((candidate) => candidate.type === "page");
  if (!page) throw new Error(`No browser page found on CDP port ${port}`);

  fs.mkdirSync(outputDir, { recursive: true });
  const cdp = new CDP(page.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const results = [];
  for (const target of targets) {
    await cdp.send("Page.navigate", { url: target.pageUrl });
    await delay(10_000);

    let located = await locateImage(cdp, target.sourceToken);
    if (!located.ok) {
      await delay(8_000);
      located = await locateImage(cdp, target.sourceToken);
    }

    if (!located.ok) {
      results.push({ ...target, status: "not-captured", located });
      continue;
    }

    const screenshot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      fromSurface: true,
      clip: {
        x: Math.max(0, located.rect.x),
        y: Math.max(0, located.rect.y),
        width: Math.max(1, located.rect.width),
        height: Math.max(1, located.rect.height),
        scale: 1,
      },
    });

    if (!screenshot.result?.data) {
      results.push({ ...target, status: "not-captured", located, error: "No screenshot data" });
      continue;
    }

    const outputPath = path.join(outputDir, target.output);
    fs.writeFileSync(outputPath, Buffer.from(screenshot.result.data, "base64"));
    results.push({
      ...target,
      status: "captured",
      localPath: path.relative(process.cwd(), outputPath).replaceAll("\\", "/"),
      bytes: fs.statSync(outputPath).size,
      located,
    });
  }

  const manifestPath = path.join(outputDir, "capture-manifest.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({ capturedAt: new Date().toISOString(), port, results }, null, 2),
    "utf8",
  );
  process.stdout.write(JSON.stringify({ manifestPath, results }, null, 2));
  cdp.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
