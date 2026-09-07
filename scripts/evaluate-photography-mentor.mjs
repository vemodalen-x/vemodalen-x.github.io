import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const context = { window: {} };
vm.createContext(context);

for (const file of [
  "knowledge/photography-mentor-kb.js",
  "knowledge/photography-local-summaries.js",
  "knowledge/photography-mentor-taxonomy.js",
  "knowledge/photography-mentor-core.js"
]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const canonical = context.window.PHOTOGRAPHY_MENTOR_KB;
const local = context.window.PHOTOGRAPHY_LOCAL_SUMMARIES;
const knowledge = {
  cards: [...canonical.cards, ...local.cards],
  sources: [...canonical.sources, ...local.sources]
};
const core = context.window.PHOTOGRAPHY_MENTOR_CORE.create({
  knowledge,
  taxonomy: context.window.PHOTOGRAPHY_MENTOR_TAXONOMY
});
const cases = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/photography-mentor-eval.json"), "utf8"));

const results = cases.map((item) => {
  const plan = core.advise({ query: item.query, mode: item.mode, genre: item.genre, limit: 6 });
  const cardIds = plan.knowledge.map((card) => card.id);
  const hitIds = item.relevantCardIds.filter((id) => cardIds.includes(id));
  const stageIds = plan.route.activeStages.map((stage) => stage.id);
  const localCards = plan.knowledge.filter((card) => card.sourceKinds.includes("local-synthesis")).length;
  return {
    id: item.id,
    bottleneck: plan.decision.type,
    expectedBottleneck: item.expectedBottleneck,
    bottleneckPass: plan.decision.type === item.expectedBottleneck,
    stagePass: stageIds.includes(item.expectedStage),
    expectedStage: item.expectedStage,
    activeStages: stageIds,
    relevantHitPass: hitIds.length > 0,
    hitIds,
    topCards: cardIds,
    citationPass: plan.retrievalQuality.citationCoverage === 1,
    sourceBalancePass: localCards <= 2 && (!item.requirePrimary || plan.retrievalQuality.primarySources >= 1),
    confidenceScore: Number(plan.decision.confidenceScore.toFixed(2))
  };
});

const checks = ["bottleneckPass", "stagePass", "relevantHitPass", "citationPass", "sourceBalancePass"];
const summary = Object.fromEntries(checks.map((check) => [check, results.filter((result) => result[check]).length]));
const failures = results.flatMap((result) => checks.filter((check) => !result[check]).map((check) => `${result.id}:${check}`));

const report = {
  ok: failures.length === 0,
  cases: cases.length,
  summary,
  failures
};
if (process.argv.includes("--verbose")) report.results = results;
console.log(JSON.stringify(report, null, 2));

if (failures.length) process.exitCode = 1;
