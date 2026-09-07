import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadRuntime() {
  const context = { window: {} };
  vm.createContext(context);
  [
    "knowledge/photography-mentor-kb.js",
    "knowledge/photography-local-summaries.js",
    "knowledge/photography-mentor-taxonomy.js",
    "knowledge/photography-mentor-core.js"
  ].forEach((file) => vm.runInContext(read(file), context, { filename: file }));

  const knowledge = context.window.PHOTOGRAPHY_MENTOR_KB;
  const local = context.window.PHOTOGRAPHY_LOCAL_SUMMARIES;
  knowledge.cards = [...knowledge.cards, ...local.cards];
  knowledge.sources = [...knowledge.sources, ...local.sources];
  const core = context.window.PHOTOGRAPHY_MENTOR_CORE.create({
    knowledge,
    taxonomy: context.window.PHOTOGRAPHY_MENTOR_TAXONOMY
  });
  return { context, knowledge, local, core };
}

test("local photography synthesis is release-safe", () => {
  const { local } = loadRuntime();
  const serialized = JSON.stringify(local);
  assert.equal(local.cards.length, 12);
  assert.equal(local.sources.length, 13);
  assert.equal(local.totalFiles, 166);
  assert.doesNotMatch(serialized, /file:\/\//i);
  assert.doesNotMatch(serialized, /[A-Z]:\\/);
  assert.doesNotMatch(serialized, /Users[\\/]/i);
  assert.doesNotMatch(serialized, /"(?:sourceFiles|fileName|sourceRoot)"\s*:/i);
  assert.doesNotMatch(serialized, /Anna.?s Archive/i);
  assert.ok(local.cards.every((card) => card.provenance?.fullTextIncluded === false));
});

test("Mentor Core merges canonical and local knowledge without duplicates", () => {
  const { core } = loadRuntime();
  assert.equal(core.cards.length, 74);
  assert.equal(core.sources.length, 41);
  assert.equal(new Set(core.cards.map((card) => card.id)).size, 74);
  assert.ok(core.cardsForCluster("multiframe-hdr-computation").some((card) => card.id === "local-10-computational-imaging"));
  assert.ok(core.cardsForCluster("hierarchy-balance-space").some((card) => card.id === "local-03-composition-light-color"));
});

test("advice separates evidence, inference and unknowns", () => {
  const { core } = loadRuntime();
  const plan = core.advise({
    query: "我拍风光时天空经常过曝，暗部噪点很重，想理解 HDR 和 RAW。",
    mode: "compute",
    genre: "风光"
  });
  assert.equal(plan.decision.type, "compute");
  assert.match(plan.decision.confidenceLabel, /有限|中等/);
  assert.ok(plan.decision.confidenceScore > 0 && plan.decision.confidenceScore < 1);
  assert.ok(plan.evidence.facts.some((item) => item.includes("用户任务")));
  assert.ok(plan.evidence.assumptions.some((item) => item.includes("待验证假设")));
  assert.ok(plan.knowledge.length >= 4);
  assert.ok(plan.retrievalQuality.primarySources >= 1);
  assert.ok(plan.retrievalQuality.localSources >= 1);
  assert.equal(plan.retrievalQuality.citationCoverage, 1);
});

test("photo diagnostics raise confidence but remain a hypothesis", () => {
  const { core } = loadRuntime();
  const baseline = core.advise({
    query: "这张照片的天空没有层次，主体偏暗。",
    mode: "critique",
    genre: "风光"
  });
  const plan = core.advise({
    query: "这张照片的天空没有层次，主体偏暗。",
    mode: "critique",
    genre: "风光",
    context: {
      imageAnalysis: {
        brightness: 0.42,
        contrast: 0.51,
        saturation: 0.36,
        sharpness: 0.58,
        clippedHighlights: 0.12,
        clippedShadows: 0.04
      },
      diagnostics: [{ type: "exposure", title: "高光裁切", detail: "高光裁切比例偏高。" }]
    }
  });
  assert.match(plan.decision.confidence, /medium|high/);
  assert.ok(plan.decision.confidenceScore > baseline.decision.confidenceScore);
  assert.match(plan.decision.why, /高光裁切/);
  assert.ok(plan.evidence.facts.some((item) => item.includes("本地像素指标")));
  assert.ok(plan.evidence.assumptions.some((item) => item.includes("不是审美定论")));
});

test("missing image metrics are not fabricated as zero percent evidence", () => {
  const { core } = loadRuntime();
  const plan = core.advise({
    query: "照片主体偏暗，请先检查曝光。",
    mode: "critique",
    context: {
      imageAnalysis: { brightness: 0.31, contrast: null },
      extraFacts: ["EXIF：未读取到常见参数"]
    }
  });
  const metricFact = plan.evidence.facts.find((item) => item.includes("本地像素指标"));
  assert.match(metricFact, /亮度 31%/);
  assert.doesNotMatch(metricFact, /对比 0%|饱和 0%|高光裁切 0%/);
  assert.ok(!plan.evidence.facts.some((item) => item.includes("未读取到常见参数")));
  assert.ok(!plan.decision.confidenceReasons.includes("有附加事实或 EXIF"));
});

test("source balancing prevents local summaries from monopolizing retrieval", () => {
  const { core } = loadRuntime();
  const cards = core.retrieve("用本机书籍和计算摄影资料解释风光 HDR 动态范围", {
    mode: "compute",
    genre: "风光",
    limit: 6
  });
  const localCount = cards.filter((card) => card.sourceKinds.includes("local-synthesis")).length;
  const primaryCount = cards.filter((card) => card.sourceKinds.includes("primary")).length;
  assert.ok(localCount >= 1 && localCount <= 2);
  assert.ok(primaryCount >= 1);
  assert.equal(new Set(cards.map((card) => card.id)).size, cards.length);
});

test("decision markdown implements the first-principles response contract", () => {
  const { core } = loadRuntime();
  const plan = core.advise({ query: "人像肤色偏黄，背景颜色太抢戏。", mode: "post", genre: "人像" });
  assert.equal(plan.decision.type, "color");
  ["任务定义", "证据账本", "第一瓶颈", "知识依据", "单变量动作", "验证标准", "使用边界"].forEach((heading) => {
    assert.match(plan.markdown, new RegExp(heading));
  });
  assert.match(plan.markdown, /成功：/);
  assert.match(plan.markdown, /失败信号：/);
});
