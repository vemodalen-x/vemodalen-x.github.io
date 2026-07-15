import fs from 'node:fs/promises';

const cdpBase = `http://127.0.0.1:${process.env.CDP_PORT || '9222'}`;
const sectionsPath = 'tmp/yitang-elective-sections.json';
const outputPath = 'tmp/yitang-primary-docs-audit.json';
const primarySectionIds = new Set(['862', '1546', '1739', '2113', '2252']);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CDP {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 0;
    this.pending = new Map();
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      this.pending.get(message.id)(message);
      this.pending.delete(message.id);
    };
  }
  async open() {
    await new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
  }
  command(method, params = {}) {
    const id = ++this.nextId;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve) => this.pending.set(id, resolve));
  }
  async evaluate(expression) {
    const response = await this.command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.text);
    return response.result?.result?.value;
  }
  close() { this.socket.close(); }
}

function cleanUrl(url) {
  return String(url || '').replaceAll('&amp;', '&');
}

function pickPrimaryDocs(sections) {
  const docs = [];
  for (const section of sections) {
    const sectionId = section.url.match(/section\/(\d+)/)?.[1];
    if (!primarySectionIds.has(sectionId)) continue;
    for (const rawUrl of section.externalDocs || []) {
      const url = cleanUrl(rawUrl);
      if (!/(?:yitang\.top\/fs-doc\/|yitanger\.feishu\.cn\/(?:docx|docs)\/)/i.test(url)) continue;
      docs.push({ sectionId, sectionUrl: section.url, url });
    }
  }
  return [...new Map(docs.map((doc) => [doc.url, doc])).values()];
}

async function extractDoc(client, item) {
  console.error(`primary doc ${item.sectionId}: ${item.url}`);
  await client.command('Page.navigate', { url: item.url });
  await sleep(3500);
  for (let index = 0; index < 6; index += 1) {
    await client.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await sleep(600);
  }
  await client.evaluate('window.scrollTo(0, 0)');
  await sleep(400);

  const data = await client.evaluate(`(() => {
    const clean = (value) => String(value || '')
      .replace(/\\u00a0/g, ' ')
      .replace(/[ \\t]+/g, ' ')
      .replace(/\\n{3,}/g, '\\n\\n')
      .trim();
    const text = clean(document.body?.innerText || '');
    const images = [...document.images]
      .map((image, index) => ({
        index,
        src: image.currentSrc || image.src,
        alt: clean(image.alt || image.title || image.getAttribute('aria-label')),
        width: image.naturalWidth,
        height: image.naturalHeight,
        visible: image.getBoundingClientRect().width > 8 && image.getBoundingClientRect().height > 8,
      }))
      .filter((image) => image.src && !image.src.startsWith('data:image/svg+xml'));
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,[data-docx-hierarchical-block]')]
      .map((element, index) => ({ index, tag: element.tagName, text: clean(element.innerText).slice(0, 240) }))
      .filter((heading) => heading.text);
    return {
      finalUrl: location.href,
      title: document.title,
      textLength: text.length,
      textSample: text.slice(0, 20000),
      headings: headings.slice(0, 160),
      imageCount: images.length,
      images: images.slice(0, 200),
      collectedAt: new Date().toISOString(),
    };
  })()`);

  const normalizedText = `${data.title || ''}\n${data.textSample || ''}`;
  const blocked = /登录\/注册|扫码登录|无权限|access denied/i.test(normalizedText) && data.textLength < 800;
  return { ...item, ...data, readable: !blocked && data.textLength >= 300 };
}

const sectionAudit = JSON.parse(await fs.readFile(sectionsPath, 'utf8'));
const items = pickPrimaryDocs(sectionAudit.sections || []);
const tabs = await (await fetch(`${cdpBase}/json/list`)).json();
const target = tabs.find((tab) => tab.url?.includes('yitang.top')) || tabs[0];
if (!target) throw new Error(`No CDP target available at ${cdpBase}`);

const client = new CDP(target.webSocketDebuggerUrl);
await client.open();
await client.command('Page.enable');
await client.command('Runtime.enable');

const docs = [];
for (const item of items) docs.push(await extractDoc(client, item));
const report = {
  generatedAt: new Date().toISOString(),
  expectedPrimaryDocs: items.length,
  readablePrimaryDocs: docs.filter((doc) => doc.readable).length,
  docs,
};
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  outputPath,
  expected: report.expectedPrimaryDocs,
  readable: report.readablePrimaryDocs,
  docs: docs.map((doc) => ({ sectionId: doc.sectionId, title: doc.title, textLength: doc.textLength, imageCount: doc.imageCount, readable: doc.readable })),
}, null, 2));

client.close();
setTimeout(() => process.exit(0), 100);
