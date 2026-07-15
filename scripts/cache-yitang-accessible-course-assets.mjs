import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const outputPath = path.resolve('knowledge/yitang-accessible-course-assets.json');
const assetRoot = path.resolve('assets/yitang-accessible/media');
const concurrency = 8;

const typeExtensions = new Map([
  ['image/avif', 'avif'], ['image/gif', 'gif'], ['image/jpeg', 'jpg'], ['image/png', 'png'],
  ['image/svg+xml', 'svg'], ['image/webp', 'webp'],
]);

function extensionFromBytes(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'jpg';
  if (['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))) return 'gif';
  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (bytes.subarray(4, 12).toString('ascii') === 'ftypavif') return 'avif';
  if (bytes.subarray(0, 256).toString('utf8').includes('<svg')) return 'svg';
  return null;
}

function extensionFromUrl(url) {
  try {
    const extension = path.extname(new URL(url).pathname).slice(1).toLowerCase().replace('jpeg', 'jpg');
    return ['avif', 'gif', 'jpg', 'png', 'svg', 'webp'].includes(extension) ? extension : null;
  } catch { return null; }
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch(url, {
        headers: {
          accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) throw new Error('Empty response');
      return { bytes, contentType: response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() || '' };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 900));
    } finally { clearTimeout(timer); }
  }
  throw lastError;
}

function addOccurrence(map, image, source) {
  const sourceUrl = image?.src;
  if (!sourceUrl || sourceUrl.startsWith('data:')) return;
  const current = map.get(sourceUrl) || {
    sourceUrl,
    alt: image.alt || '',
    width: image.width || image.naturalWidth || 0,
    height: image.height || image.naturalHeight || 0,
    occurrences: [],
  };
  current.occurrences.push(source);
  map.set(sourceUrl, current);
}

async function collectTasks() {
  const sections = JSON.parse(await fs.readFile('tmp/yitang-elective-sections.json', 'utf8')).sections || [];
  const candyDocs = JSON.parse(await fs.readFile('tmp/yitang-candy-docs-audit.json', 'utf8')).docs || [];
  const primaryDocs = JSON.parse(await fs.readFile('tmp/yitang-primary-docs-audit.json', 'utf8')).docs || [];
  const map = new Map();

  for (const section of sections) {
    const sectionId = section.url.match(/section\/(\d+)/)?.[1] || '';
    const source = { kind: 'course-section', id: sectionId, title: section.text?.split('\n')[0] || section.title, url: section.url };
    for (const image of [...(section.images || []), ...(section.backgroundImages || [])]) addOccurrence(map, image, source);
  }
  for (const doc of candyDocs) {
    const source = { kind: 'candy-document', id: doc.sectionId, title: doc.title, url: doc.url };
    for (const image of doc.images || []) addOccurrence(map, image, source);
  }
  for (const doc of primaryDocs) {
    const source = { kind: 'primary-document', id: doc.sectionId, title: doc.title, url: doc.url };
    for (const image of doc.images || []) addOccurrence(map, image, source);
  }
  return [...map.values()].map((task, index) => ({ ...task, index: index + 1 }));
}

async function cacheAsset(task) {
  const urlHash = crypto.createHash('sha256').update(task.sourceUrl).digest('hex').slice(0, 12);
  try {
    const { bytes, contentType } = await fetchWithRetry(task.sourceUrl);
    const extension = extensionFromBytes(bytes) || typeExtensions.get(contentType) || extensionFromUrl(task.sourceUrl) || 'bin';
    const filename = `${urlHash}.${extension}`;
    const absolutePath = path.join(assetRoot, filename);
    await fs.writeFile(absolutePath, bytes);
    return {
      ...task,
      status: 'cached',
      localPath: path.relative(process.cwd(), absolutePath).replaceAll('\\', '/'),
      contentType: contentType || `image/${extension}`,
      bytes: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    };
  } catch (error) {
    return { ...task, status: 'failed', error: error instanceof Error ? error.message : String(error) };
  }
}

async function runPool(tasks) {
  const results = new Array(tasks.length);
  let cursor = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await cacheAsset(tasks[index]);
      const item = results[index];
      console.log(`[${index + 1}/${tasks.length}] ${item.status} ${item.sourceUrl}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

await fs.mkdir(assetRoot, { recursive: true });
const tasks = await collectTasks();
const assets = await runPool(tasks);
const cached = assets.filter((asset) => asset.status === 'cached');
const failed = assets.filter((asset) => asset.status === 'failed');
const report = {
  builtAt: new Date().toISOString(),
  expectedUniqueAssets: tasks.length,
  cachedAssets: cached.length,
  failedAssets: failed.length,
  totalBytes: cached.reduce((sum, asset) => sum + asset.bytes, 0),
  complete: failed.length === 0 && cached.length === tasks.length,
  assets,
};
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  outputPath: path.relative(process.cwd(), outputPath),
  expected: report.expectedUniqueAssets,
  cached: report.cachedAssets,
  failed: report.failedAssets,
  totalBytes: report.totalBytes,
  complete: report.complete,
}, null, 2));
if (!report.complete) process.exitCode = 1;
