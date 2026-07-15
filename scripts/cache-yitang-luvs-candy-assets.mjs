import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const sourcePath = path.resolve('knowledge/yitang-luvs-learning-map-index.json');
const outputPath = path.resolve('knowledge/yitang-luvs-candy-assets.json');
const assetRoot = path.resolve('assets/yitang-luvs/candy');
const concurrency = 4;

const contentTypeExtensions = new Map([
  ['image/avif', 'avif'],
  ['image/gif', 'gif'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/svg+xml', 'svg'],
  ['image/webp', 'webp'],
]);

function extensionFromBytes(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'jpg';
  if (bytes.subarray(0, 6).toString('ascii') === 'GIF87a' || bytes.subarray(0, 6).toString('ascii') === 'GIF89a') return 'gif';
  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (bytes.subarray(4, 12).toString('ascii') === 'ftypavif') return 'avif';
  if (bytes.subarray(0, 256).toString('utf8').includes('<svg')) return 'svg';
  return null;
}

function extensionFromUrl(url) {
  try {
    const extension = path.extname(new URL(url).pathname).slice(1).toLowerCase();
    return ['avif', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp'].includes(extension)
      ? extension.replace('jpeg', 'jpg')
      : null;
  } catch {
    return null;
  }
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
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36',
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
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

async function cacheImage(task) {
  const urlHash = crypto.createHash('sha256').update(task.sourceUrl).digest('hex').slice(0, 10);
  const directory = path.join(assetRoot, String(task.candyId));
  await fs.mkdir(directory, { recursive: true });

  try {
    const { bytes, contentType } = await fetchWithRetry(task.sourceUrl);
    const extension = extensionFromBytes(bytes)
      || contentTypeExtensions.get(contentType)
      || extensionFromUrl(task.sourceUrl)
      || 'bin';
    const filename = `${String(task.imageIndex).padStart(2, '0')}-${urlHash}.${extension}`;
    const absolutePath = path.join(directory, filename);
    await fs.writeFile(absolutePath, bytes);
    return {
      ...task,
      status: 'cached',
      localPath: path.relative(process.cwd(), absolutePath).replaceAll('\\', '/'),
      packagePath: `assets/candy/${task.candyId}/${filename}`,
      contentType: contentType || `image/${extension}`,
      bytes: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    };
  } catch (error) {
    return {
      ...task,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runPool(tasks) {
  const results = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const index = next;
      next += 1;
      results[index] = await cacheImage(tasks[index]);
      const item = results[index];
      console.log(`[${index + 1}/${tasks.length}] ${item.status} candy=${item.candyId} image=${item.imageIndex}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

const source = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
const tasks = source.candies.flatMap((candy) => candy.images.map((image, index) => ({
  candyId: candy.id,
  candyTitle: candy.title,
  imageIndex: index + 1,
  sourceUrl: image.src,
  alt: image.alt || '',
  width: image.width || 0,
  height: image.height || 0,
  role: image.role || 'source-visual',
})));

const assets = await runPool(tasks);
const cached = assets.filter((asset) => asset.status === 'cached');
const failed = assets.filter((asset) => asset.status === 'failed');
const report = {
  sourceLessonUrl: source.sourceLessonUrl,
  builtAt: new Date().toISOString(),
  sourceIndex: path.relative(process.cwd(), sourcePath).replaceAll('\\', '/'),
  expectedImageCount: tasks.length,
  cachedImageCount: cached.length,
  failedImageCount: failed.length,
  totalBytes: cached.reduce((sum, asset) => sum + asset.bytes, 0),
  complete: failed.length === 0 && cached.length === tasks.length,
  assets,
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  outputPath: path.relative(process.cwd(), outputPath),
  expected: report.expectedImageCount,
  cached: report.cachedImageCount,
  failed: report.failedImageCount,
  totalBytes: report.totalBytes,
  complete: report.complete,
}, null, 2));

if (!report.complete) process.exitCode = 1;
