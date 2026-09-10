import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const engineSource = fs.readFileSync(path.join(root, "knowledge/photography-commercial-engine.js"), "utf8");

function loadEngine() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(engineSource, context, { filename: "knowledge/photography-commercial-engine.js" });
  return context.window.PHOTOGRAPHY_COMMERCIAL_ENGINE;
}

const readyContext = {
  title: "Rainy city street with neon reflections",
  description: "Rainy city street with reflected light and open space for design use.",
  category: "city",
  location: "Singapore",
  keywords: "rain, city, reflection, street, neon, travel, background, design",
  noPeopleConfirmed: true,
  rightsStatus: "owned",
  brandRisk: false,
  propertyRisk: false,
  propertyRelease: false,
  aiEdited: false,
  aiGenerated: false
};

test("commercial engine marks a technically sound rights-cleared photo as a candidate", () => {
  const engine = loadEngine();
  const result = engine.evaluateAsset({
    name: "rainy-city.jpg",
    type: "image/jpeg",
    size: 8 * engine.MB,
    metrics: { width: 6000, height: 4000, brightness: 0.43, contrast: 0.58, sharpness: 0.62, clippedHighlights: 0.02, clippedShadows: 0.04 }
  }, readyContext);
  assert.equal(result.status, "candidate");
  assert.equal(result.megapixels, 24);
  assert.equal(result.platformFit.find((fit) => fit.platformId === "adobe-stock").state, "ready");
  assert.equal(result.platformFit.find((fit) => fit.platformId === "shutterstock").state, "ready");
});

test("commercial engine holds low-resolution and unconfirmed-rights photos", () => {
  const engine = loadEngine();
  const result = engine.evaluateAsset({
    name: "small-snapshot.png",
    type: "image/png",
    size: 900 * 1024,
    metrics: { width: 1600, height: 1067, brightness: 0.61, contrast: 0.31, sharpness: 0.22 }
  }, { ...readyContext, noPeopleConfirmed: false, rightsStatus: "unclear" });
  assert.equal(result.status, "hold");
  assert.ok(result.flags.some((flag) => flag.code === "low-resolution"));
  assert.ok(result.flags.some((flag) => flag.code === "people-unconfirmed"));
  assert.ok(result.flags.some((flag) => flag.code === "rights-unconfirmed"));
});

test("commercial engine builds portable metadata without absolute paths or pixels", () => {
  const engine = loadEngine();
  const assets = [
    { name: "first.jpg", type: "image/jpeg", size: 7 * engine.MB, status: "candidate", score: 91, megapixels: 24, metrics: { width: 6000, height: 4000 } },
    { name: "second.jpg", type: "image/jpeg", size: 6 * engine.MB, status: "review", score: 74, megapixels: 20, metrics: { width: 5000, height: 4000 } }
  ];
  const rows = engine.buildSubmissionRows(assets, readyContext);
  const csv = engine.buildCsv(rows);
  const manifest = engine.buildManifest(assets, readyContext, "2026-09-10T00:00:00.000Z");
  assert.match(csv, /filename,title,description/);
  assert.match(csv, /platformFit/);
  assert.match(csv, /Rainy city street with neon reflections/);
  assert.equal(manifest.files.length, 2);
  assert.equal(manifest.privacy.includesPixels, false);
  assert.equal(manifest.privacy.includesAbsolutePaths, false);
  assert.doesNotMatch(JSON.stringify(manifest), /[A-Z]:\\|\/(?:Users|home)\//i);
  assert.equal(engine.normalizeKeywords("rain, rain，city\nreflection").length, 3);
});

test("EyeEm remains visible as a status check instead of a default route", () => {
  const engine = loadEngine();
  const eyeEm = engine.PLATFORMS.find((platform) => platform.id === "eyeem");
  assert.equal(eyeEm.state, "paused");
  assert.equal(engine.platformFit(eyeEm, { name: "photo.jpg", type: "image/jpeg", size: 5 * engine.MB, metrics: { width: 6000, height: 4000 } }, readyContext).state, "hold");
});
