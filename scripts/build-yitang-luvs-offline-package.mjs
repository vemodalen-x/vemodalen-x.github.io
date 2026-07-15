import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packageDir = path.join(root, "outputs", "yitang-luvs-offline");
const packageAssets = path.join(packageDir, "assets");
const packageVendor = path.join(packageAssets, "vendor");
const packageKnowledge = path.join(packageDir, "knowledge");

await Promise.all([
  fs.mkdir(packageAssets, { recursive: true }),
  fs.mkdir(packageVendor, { recursive: true }),
  fs.mkdir(packageKnowledge, { recursive: true })
]);

const sourceNote = await fs.readFile("notes/yitang-luvS-learning-map-notes.html", "utf8");
const offlineNote = sourceNote
  .replaceAll("../assets/yitang-luvs/", "assets/")
  .replace("yitang-luvS-learning-map-candy-notes-2026-07-14.md", "notes.md")
  .replace("../knowledge/yitang-luvs-learning-map-index.json", "source-index.json")
  .replace("../knowledge/yitang-luvs-candy-assets.json", "candy-assets.json")
  .replace("../assets/yitang-luvs/", "assets/")
  .replace(
    '<a href="https://yitang.top/lesson/luvS64ef293fbe0d?tab=candy" target="_blank" rel="noreferrer">打开原课程</a>',
    '<a href="tutor.html">打开商业 Tutor</a>'
  );
await fs.writeFile(path.join(packageDir, "index.html"), offlineNote, "utf8");

const sourceTutor = await fs.readFile("business-tutor-agent.html", "utf8");
const offlineTutor = sourceTutor
  .replaceAll('href="business-tutor-agent.html"', 'href="tutor.html"')
  .replace(
    /<div class="app-header-links">[\s\S]*?<\/div>/,
    '<div class="app-header-links">\n        <a href="index.html">课程笔记</a>\n        <a class="active" href="tutor.html">Tutor</a>\n      </div>'
  )
  .replace('<a href="index.html">返回个人主页</a>', '<a href="index.html">返回课程笔记</a>');
await fs.writeFile(path.join(packageDir, "tutor.html"), offlineTutor, "utf8");

async function copyTree(source, destination) {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) await copyTree(sourcePath, destinationPath);
    else await fs.copyFile(sourcePath, destinationPath);
  }
}

await copyTree("assets/yitang-luvs", packageAssets);

await Promise.all([
  fs.copyFile("assets/styles.css", path.join(packageAssets, "styles.css")),
  fs.copyFile("assets/vendor/lucide-1.23.0.min.js", path.join(packageVendor, "lucide-1.23.0.min.js")),
  fs.copyFile("knowledge/yitang-business-kb.js", path.join(packageKnowledge, "yitang-business-kb.js")),
  fs.copyFile("knowledge/yitang-luvs-learning-map-index.json", path.join(packageDir, "source-index.json")),
  fs.copyFile("knowledge/yitang-luvs-candy-assets.json", path.join(packageDir, "candy-assets.json")),
  fs.copyFile("notes/yitang-luvS-learning-map-candy-notes-2026-07-14.md", path.join(packageDir, "notes.md"))
]);

const readme = `一堂课程学习地图 · 离线学习包

1. 双击 index.html 阅读图文课程笔记。
2. 点击页面右上角“打开商业 Tutor”，或直接打开 tutor.html 使用本地 RAG。
3. 高清大地图、四份 Candy 的 64 张图片、Markdown 笔记和证据索引均已放入本目录。
4. 不需要安装依赖或启动服务器。外部原课程和资料来源链接只有联网时才能打开，但不影响本地学习和 Tutor 运行。
5. Tutor 草稿保存在当前浏览器的 localStorage。更换浏览器或移动目录后，浏览器可能建立新的本地存储空间。

关键文件：
- index.html：离线图文笔记
- tutor.html：离线商业 Tutor
- notes.md：完整 Markdown 笔记
- source-index.json：课程、Candy 与图像元数据
- candy-assets.json：64 张图片的来源、本地路径、大小与 SHA-256 索引
- assets/candy/：按 Candy ID 分类的完整本地图册
- assets/infinite-progress-map.png：11811x4961 高清大地图
- manifest.json：文件大小与 SHA-256 完整性清单
`;
await fs.writeFile(path.join(packageDir, "README.txt"), readme, "utf8");

async function walk(directory, prefix = "") {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path.join(directory, entry.name), relative));
    else if (entry.name !== "manifest.json") files.push(relative);
  }
  return files;
}

const files = (await walk(packageDir)).sort();
const manifestFiles = [];
for (const relative of files) {
  const bytes = await fs.readFile(path.join(packageDir, relative));
  manifestFiles.push({
    path: relative,
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex")
  });
}

const manifest = {
  name: "一堂课程学习地图离线学习包",
  builtAt: new Date().toISOString(),
  offlineReady: true,
  entrypoints: ["index.html", "tutor.html"],
  fileCount: manifestFiles.length,
  totalBytes: manifestFiles.reduce((sum, file) => sum + file.bytes, 0),
  files: manifestFiles
};
await fs.writeFile(path.join(packageDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ packageDir, fileCount: manifest.fileCount, totalBytes: manifest.totalBytes }, null, 2));
