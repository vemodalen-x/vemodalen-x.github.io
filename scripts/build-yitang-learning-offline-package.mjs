import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputsDir = path.resolve(root, "outputs");
const packageDir = path.resolve(outputsDir, "yitang-learning-offline");

if (!packageDir.startsWith(`${outputsDir}${path.sep}`)) {
  throw new Error(`Refusing to build outside outputs: ${packageDir}`);
}

const noteFiles = [
  "yitang-learning-completeness-2026-07-14.md",
  "yitang-elective-complete-learning-notes.md",
  "yitang-elective-source-index.md",
  "yitang-candy-external-index.md",
  "yitang-299-ai-new-paradigm-notes.md",
  "yitang-G0mU-ai-new-paradigm-candy-notes.md",
  "yitang-fupan-effective-notes.md",
  "yitang-homework-science-decision-2026-07-10.md",
  "yitang-homework-learning-map-2026-07-10.md",
  "yitang-section-1869-life-red-dot-notes.md",
  "yitang-section-1869-life-red-dot-notes.html",
  "yitang-1869-candy-and-red-dot-coach-evaluation.md",
  "yitang-section-1869-homework-draft.md",
  "yitang-luvS-learning-map-notes.html",
  "yitang-luvS-learning-map-candy-notes-2026-07-14.md",
  "yitang-ai-coach-observation-2026-07-10.md",
  "yitang-ai-partner-capability-and-business-map-2026-07-11.md",
  "yitang-casebook-and-smart-lean-2026-07-15.md",
  "yitang-casebook-and-smart-lean-2026-07-15.html",
  "yitang-5wdv-candy-notes-2026-07-15.md",
  "yitang-5wdv-candy-notes-2026-07-15.html",
  "yitang-truman-replay-learning-2026-07-15.md",
  "yitang-truman-replay-learning-2026-07-15.html",
];

const knowledgeFiles = [
  "yitang-learning-completeness.json",
  "yitang-accessible-course-assets.json",
  "yitang-luvs-learning-map-index.json",
  "yitang-luvs-candy-assets.json",
  "yitang-casebook-index.json",
  "yitang-5wdv-visual-index.json",
  "yitang-5wdv-candy-index.json",
  "yitang-truman-replay-index.json",
  "yitang-business-kb.js",
];

function copyFile(relativeSource, relativeDestination = relativeSource) {
  const source = path.resolve(root, relativeSource);
  const destination = path.resolve(packageDir, relativeDestination);
  if (!fs.existsSync(source)) throw new Error(`Missing package source: ${relativeSource}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function copyDirectory(relativeSource, relativeDestination = relativeSource) {
  const source = path.resolve(root, relativeSource);
  const destination = path.resolve(packageDir, relativeDestination);
  if (!fs.existsSync(source)) throw new Error(`Missing package directory: ${relativeSource}`);
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourceEntry = path.join(source, entry.name);
    const destinationEntry = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(
        path.relative(root, sourceEntry),
        path.relative(packageDir, destinationEntry),
      );
    } else if (entry.isFile()) {
      fs.copyFileSync(sourceEntry, destinationEntry);
    }
  }
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

fs.rmSync(packageDir, { recursive: true, force: true });
fs.mkdirSync(packageDir, { recursive: true });

copyFile("yitang-learning-completeness.html", "index.html");
copyFile("yitang-learning-completeness.html", "audit.html");
copyFile("yitang-ai-muse-framework.html");
copyFile("business-tutor-agent.html");
copyFile("assets/styles.css");
copyDirectory("assets/vendor");
copyDirectory("assets/yitang-accessible");
copyDirectory("assets/yitang-luvs");
copyDirectory("notes/assets/yitang-1869");
copyDirectory("notes/assets/yitang-5wdv");
copyDirectory("notes/assets/yitang-5wdv-candy");
copyDirectory("outputs/yitang-luvs-offline");

for (const file of noteFiles) copyFile(`notes/${file}`);
for (const file of knowledgeFiles) copyFile(`knowledge/${file}`);

const kbCardCount = [...fs.readFileSync(path.resolve(root, "knowledge/yitang-business-kb.js"), "utf8").matchAll(/\n\s+id:\s+"/g)].length;

const readme = [
  "一堂当前可见课程统一离线学习包",
  "",
  "打开 index.html 查看课程、Candy、图片与 AI 教练完整性仪表板。",
  `打开 business-tutor-agent.html 使用本地 Business Tutor 与 ${kbCardCount} 张 RAG 卡片。`,
  "outputs/yitang-luvs-offline/index.html 是课程学习地图的独立离线子包。",
  "notes/yitang-casebook-and-smart-lean-2026-07-15.html 是创业复盘案例集与聪明精益图文学习台。",
  "notes/yitang-5wdv-candy-notes-2026-07-15.html 是聪明精益 3 个课后 Candy 的图文数据笔记。",
  "notes/yitang-truman-replay-learning-2026-07-15.html 是 Truman 复盘教练的完整流程、30 分钟体检与质量护栏图文报告。",
  "",
  "范围：已登录账号当前可见的 5 门课程、35 个课内条目。",
  "边界：平台总目录 176 门，其余 171 门不在当前访问范围，未声称已学习。",
  "补充范围：用户指定的 129 案例集与聪明精益主课独立记账，不改写‘我的课程’5门审计口径。",
  "本地内容为原创摘要与证据索引，不包含付费课逐字稿。",
  "",
  "构建日期：2026-07-15",
].join("\r\n");
fs.writeFileSync(path.join(packageDir, "README.txt"), readme, "utf8");

const files = walk(packageDir)
  .map((filePath) => ({
    path: path.relative(packageDir, filePath).replaceAll("\\", "/"),
    bytes: fs.statSync(filePath).size,
    sha256: sha256(filePath),
  }))
  .sort((a, b) => a.path.localeCompare(b.path));

const manifest = {
  builtAt: new Date().toISOString(),
  scope: {
    visibleCourses: 5,
    lessonArtifacts: 35,
    generalCourseImages: 333,
    learningMapCandyImages: 64,
    aiCoachSystems: 4,
    supplementalCasebookCases: 129,
    supplementalCourseImagesIndexed: 234,
    cachedRepresentativeImageEntries: 53,
    supplementalCandyLearned: 3,
    supplementalCandyDocuments: 4,
    supplementalCandySheetTabs: 3,
    supplementalCandyRepresentativeImages: 5,
    ragCards: kbCardCount,
  },
  usageBoundary: "Current authenticated course scope only; no claim for the other 171 catalog courses.",
  fileCount: files.length,
  totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  files,
};

fs.writeFileSync(
  path.join(packageDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

process.stdout.write(
  JSON.stringify(
    {
      packageDir,
      fileCount: manifest.fileCount + 1,
      totalBytes: manifest.totalBytes + fs.statSync(path.join(packageDir, "manifest.json")).size,
    },
    null,
    2,
  ),
);
