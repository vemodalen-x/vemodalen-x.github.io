import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const inputPath = path.join(root, "knowledge", "local-photography-books-kb.js");
const outputPath = path.join(root, "knowledge", "photography-local-summaries.js");

const clusterMap = {
  "local-01-foundations": ["mentor-learning-system", "exposure-metering-signal", "optics-focus-motion"],
  "local-02-camera-lens-technique": ["exposure-metering-signal", "optics-focus-motion", "light-control"],
  "local-03-composition-light-color": ["light-control", "hierarchy-balance-space", "color-contrast-memory"],
  "local-04-portrait-wedding-children": ["portrait-event-people", "light-control", "editing-ethics-boundary"],
  "local-05-landscape-travel-documentary": ["landscape-night-panorama", "street-documentary-mobile", "intent-frame-control"],
  "local-06-commercial-still-product": ["architecture-commercial-macro", "light-control", "color-proof-export"],
  "local-07-post-workflow": ["global-local-development", "detail-denoise-sharpen", "color-proof-export"],
  "local-08-history-theory-culture": ["intent-frame-control", "style-analysis", "sequence-portfolio"],
  "local-09-magazines-portfolios": ["culling-contact-critique", "style-analysis", "sequence-portfolio"],
  "local-10-computational-imaging": ["sensor-raw-pipeline", "multiframe-hdr-computation", "detail-denoise-sharpen"],
  "local-00-reading-map": ["mentor-learning-system", "culling-contact-critique", "sequence-portfolio"],
  "local-11-imported-notes": ["intent-frame-control", "style-analysis", "mentor-learning-system"]
};

function loadPrivateSummary() {
  if (!fs.existsSync(inputPath)) {
    throw new Error("Private local photography summary index is missing.");
  }
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(inputPath, "utf8"), context, { filename: inputPath });
  const data = context.window.LOCAL_PHOTOGRAPHY_BOOKS_KB;
  if (!data || !Array.isArray(data.cards) || !Array.isArray(data.sources)) {
    throw new Error("Private local photography summary index has an invalid shape.");
  }
  return data;
}

function safeTags(tags = []) {
  return tags.filter((tag) => !/^\d{2}_/.test(String(tag)) && !/[\\/]/.test(String(tag))).slice(0, 10);
}

function buildPublicSummary(privateData) {
  const cards = privateData.cards.map((card) => ({
    id: card.id,
    domain: card.domain,
    title: card.title,
    level: "local-synthesis",
    tags: safeTags(card.tags),
    summary: card.summary,
    mentorUse: card.mentorUse,
    practice: card.practice,
    questions: card.questions || [],
    sourceIds: card.sourceIds || [],
    clusterIds: clusterMap[card.id] || ["mentor-learning-system"],
    collectionStats: {
      items: Number(card.fileCount || 0),
      size: card.totalSize || ""
    },
    provenance: {
      origin: "local-library-synthesis",
      granularity: "topic-level-summary",
      fullTextIncluded: false,
      privateInventoryIncluded: false
    }
  }));

  const cardBySource = new Map();
  cards.forEach((card) => {
    card.sourceIds.forEach((sourceId) => {
      if (!cardBySource.has(sourceId)) cardBySource.set(sourceId, card);
    });
  });

  const sources = privateData.sources.map((source) => {
    const card = cardBySource.get(source.id);
    const count = card?.collectionStats?.items || 0;
    return {
      id: source.id,
      title: source.title.replace("本机摄影资料库", "本机摄影资料总结"),
      url: "#local-books",
      type: "local-library-synthesis",
      notes: `${count ? `${count} 项资料按主题聚合。` : "按主题聚合。"}仅保留总结、练习与评片问题，不包含原文、文件清单或本机位置。`
    };
  });

  return {
    generatedAt: "2026-08-02",
    version: "2026.08.02-sanitized",
    title: "Sanitized Local Photography Library Synthesis",
    language: "zh-CN",
    usageBoundary: "Topic-level summaries only. No local paths, filenames, source archives, credentials, or book text are included.",
    totalFiles: Number(privateData.totalFiles || 0),
    totalSize: privateData.totalSize || "",
    sources,
    cards
  };
}

function assertSanitized(text) {
  const forbidden = [
    /file:\/\//i,
    /[A-Z]:\\/,
    /Users[\\/]/i,
    /"sourceFiles"\s*:/i,
    /"fileName"\s*:/i,
    /Anna.?s Archive/i,
    /"sourceRoot"\s*:/i
  ];
  const hit = forbidden.find((pattern) => pattern.test(text));
  if (hit) throw new Error(`Sanitization failed: output matches ${hit}`);
}

const publicSummary = buildPublicSummary(loadPrivateSummary());
const output = `window.PHOTOGRAPHY_LOCAL_SUMMARIES = ${JSON.stringify(publicSummary, null, 2)};\n`;
assertSanitized(output);
fs.writeFileSync(outputPath, output, "utf8");
console.log(JSON.stringify({
  output: path.relative(root, outputPath),
  cards: publicSummary.cards.length,
  sources: publicSummary.sources.length,
  totalFiles: publicSummary.totalFiles,
  sanitized: true
}, null, 2));
