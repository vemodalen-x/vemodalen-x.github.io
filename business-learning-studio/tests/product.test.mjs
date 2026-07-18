import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { releaseFiles, rasterExtensions } from "../scripts/release-files.mjs";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

function loadBrowserGlobal(rel, name) {
  const context = { window: {} };
  vm.runInNewContext(read(rel), context, { filename: rel });
  return JSON.parse(JSON.stringify(context.window[name]));
}

test("public knowledge model is complete and internally aligned", () => {
  const model = loadBrowserGlobal("knowledge/business-learning-model.js", "BUSINESS_LEARNING_MODEL");
  const os = json("knowledge/business-operating-system.json");
  const cards = json("knowledge/business-public-kb.json");
  const bank = json("knowledge/business-learning-item-bank.json");

  assert.equal(model.version, "1.0.0");
  assert.equal(model.competencies.length, 8);
  assert.equal(os.loop.stages.length, 8);
  assert.equal(cards.length, 32);
  assert.equal(bank.items.length, 32);
  assert.deepEqual(bank.modes, ["retrieve", "explain", "diagnose", "apply"]);

  const stageIds = new Set(model.competencies.map((stage) => stage.id));
  const cardIds = cards.map((card) => card.id);
  assert.equal(new Set(cardIds).size, 32);
  assert.deepEqual(new Set(os.cards.map((card) => card.id)), new Set(cardIds));
  assert.deepEqual(new Set(bank.items.map((item) => item.id)), new Set(cardIds));

  for (const card of cards) {
    assert.ok(stageIds.has(card.stage));
    assert.equal(card.source, "原创商业能力模型");
    assert.ok(card.summary.length >= 30);
  }
  for (const item of bank.items) {
    assert.deepEqual(Object.keys(item.challenges), bank.modes);
    assert.equal(item.hints.length, 3);
    assert.equal(item.rubric.length, 3);
    assert.equal(item.misconceptions.length, 3);
    assert.ok(item.expectedElements.length >= 3);
  }
});

test("browser globals and JSON artifacts stay equivalent", () => {
  assert.deepEqual(
    loadBrowserGlobal("knowledge/business-public-kb.js", "BUSINESS_PUBLIC_KB"),
    json("knowledge/business-public-kb.json")
  );
  assert.deepEqual(
    loadBrowserGlobal("knowledge/business-learning-item-bank.js", "BUSINESS_LEARNING_ITEM_BANK"),
    json("knowledge/business-learning-item-bank.json")
  );
  assert.deepEqual(
    loadBrowserGlobal("knowledge/business-operating-system.js", "BUSINESS_KNOWLEDGE_OS"),
    json("knowledge/business-operating-system.json")
  );
});

test("all product entry points are local, secured and connected", () => {
  for (const rel of ["index.html", "knowledge.html", "coach.html"]) {
    const html = read(rel);
    assert.match(html, /Content-Security-Policy/i);
    assert.doesNotMatch(html, /(?:src|href|action)\s*=\s*["']https?:\/\//i);
    assert.match(html, /lucide-1\.23\.0\.min\.js/);
  }

  const index = read("index.html");
  assert.match(index, /BUSINESS_PUBLIC_KB/);
  assert.match(index, /business-learning-item-bank\.js/);
  assert.match(index, /navigator\.serviceWorker\.register/);
  assert.match(index, /requestedStage/);

  const knowledge = read("knowledge.html");
  assert.match(knowledge, /32/);
  assert.match(knowledge, /coach\.html\?stage=/);

  const coach = read("coach.html");
  assert.match(coach, /localStorage/);
  assert.match(coach, /goal/);
  assert.match(coach, /assumption/);
  assert.match(coach, /evidence/);
  assert.match(coach, /experiment/);
  assert.match(coach, /decision/);
});

test("service worker precaches every required runtime dependency", () => {
  const serviceWorker = read("sw.js");
  const runtimeFiles = [
    "index.html", "knowledge.html", "coach.html", "manifest.webmanifest",
    "assets/app-icon.svg", "assets/product.css", "assets/vendor/lucide-1.23.0.min.js",
    "knowledge/business-learning-model.js", "knowledge/business-operating-system.js",
    "knowledge/business-public-kb.js", "knowledge/business-learning-item-bank.js"
  ];
  for (const rel of runtimeFiles) assert.ok(serviceWorker.includes(rel), `missing cache entry: ${rel}`);
});

test("release allowlist is complete and contains no raster captures", () => {
  assert.equal(new Set(releaseFiles).size, releaseFiles.length);
  for (const rel of releaseFiles) {
    assert.ok(fs.existsSync(path.join(root, rel)), `missing release file: ${rel}`);
    assert.ok(!rasterExtensions.has(path.extname(rel).toLowerCase()), `raster file in allowlist: ${rel}`);
  }
});
