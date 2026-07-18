import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const failures = [];
const checks = [];

function pass(name, detail) {
  checks.push({ name, detail });
}

function fail(name, detail) {
  failures.push({ name, detail });
}

function assert(condition, name, detail) {
  if (condition) pass(name, detail);
  else fail(name, detail);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

const releaseFiles = [
  "photography-mentor-agent.html",
  "assets/photo-mentor-foundation.css",
  "assets/photo-mentor-icon.svg",
  "assets/vendor/lucide-1.23.0.min.js",
  "knowledge/photography-mentor-kb.js",
  "knowledge/photography-mentor-taxonomy.js",
  "manifest.webmanifest",
  "sw.js",
  "notes/photography-mentor-research-2026-07-11.md",
  "notes/photography-knowledge-review-2026-07-14.md",
  "notes/photography-mentor-product-review-2026-07-15.md",
  "scripts/validate-photography-mentor.mjs",
  "scripts/audit-photography-mentor-release.mjs",
  "scripts/build-photography-mentor-release-manifest.mjs",
  "docs/photography-mentor/README.md",
  "docs/photography-mentor/CHANGELOG.md",
  "docs/photography-mentor/LICENSE.md",
  "docs/photography-mentor/PRIVACY.md",
  "docs/photography-mentor/TERMS.md",
  "docs/photography-mentor/SECURITY.md",
  "docs/photography-mentor/THIRD_PARTY_NOTICES.md",
  "docs/photography-mentor/RELEASE_NOTES.md",
  "package.json",
  "docs/photography-mentor/release-manifest.json",
  "PHOTOGRAPHY_MENTOR_RELEASE.md"
];

const missingReleaseFiles = releaseFiles.filter((file) => !exists(file));
assert(
  missingReleaseFiles.length === 0,
  "release-files",
  missingReleaseFiles.length ? `missing: ${missingReleaseFiles.join(", ")}` : `${releaseFiles.length} files present`
);

const html = read("photography-mentor-agent.html");
assert(/<meta name="version" content="1\.2\.0">/.test(html), "release-version", "HTML declares v1.2.0");
assert(/href="docs\/photography-mentor\/PRIVACY\.md"/.test(html) && /href="docs\/photography-mentor\/TERMS\.md"/.test(html), "commercial-policy-links", "namespaced privacy and terms are linked in-app");
assert(/href="index\.html">Portfolio</.test(html), "portfolio-navigation", "main-site return link present");
assert(/<section id="sybj-ingest"[^>]*data-workspace-view="library"(?![^>]*data-workspace-disabled)/.test(html), "sybj-user-import", "user-controlled SYBJ import is enabled");
assert(/Content-Security-Policy/.test(html) && /name="referrer" content="no-referrer"/.test(html), "browser-security-policy", "CSP and referrer policy declared");
assert(/id="export-all-learning-data"/.test(html) && /id="import-learning-data"/.test(html) && /id="clear-all-learning-data"/.test(html), "data-portability-controls", "export, restore and delete controls present");
const localReferences = [...html.matchAll(/<(?:a|link|script)\b[^>]*?\b(?:href|src)="([^"]+)"/gi)]
  .map((match) => match[1])
  .filter((reference) => !/^(?:https?:|mailto:|#|data:|javascript:)/i.test(reference))
  .filter((reference) => !reference.includes("${"))
  .map((reference) => reference.split(/[?#]/, 1)[0])
  .filter(Boolean);
const missingReferences = [...new Set(localReferences)].filter((reference) => !exists(reference));
assert(
  missingReferences.length === 0,
  "html-local-references",
  missingReferences.length ? `missing: ${missingReferences.join(", ")}` : `${new Set(localReferences).size} local references resolve`
);

const externalRuntimeReferences = [
  ...html.matchAll(/<script\b[^>]*?\bsrc="(https?:[^"]+)"/gi),
  ...html.matchAll(/<link\b[^>]*?\brel="stylesheet"[^>]*?\bhref="(https?:[^"]+)"/gi)
].map((match) => match[1]);
assert(
  externalRuntimeReferences.length === 0,
  "offline-runtime",
  externalRuntimeReferences.length ? externalRuntimeReferences.join(", ") : "no CDN scripts or stylesheets"
);

const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
let inlineSyntaxError = null;
for (const script of inlineScripts) {
  try {
    new Function(script);
  } catch (error) {
    inlineSyntaxError = error.message;
    break;
  }
}
assert(!inlineSyntaxError, "inline-javascript", inlineSyntaxError || `${inlineScripts.length} inline script blocks parse`);

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
assert(duplicateIds.length === 0, "dom-id-uniqueness", duplicateIds.length ? duplicateIds.join(", ") : `${ids.length} unique IDs`);

const literalIdLookups = [...html.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map((match) => match[1]);
const missingIds = [...new Set(literalIdLookups.filter((id) => !ids.includes(id)))];
assert(missingIds.length === 0, "dom-id-lookups", missingIds.length ? `missing: ${missingIds.join(", ")}` : `${new Set(literalIdLookups).size} literal lookups resolve`);

const context = { window: {} };
vm.createContext(context);
for (const file of [
  "knowledge/photography-mentor-kb.js",
  "knowledge/photography-mentor-taxonomy.js"
]) {
  try {
    vm.runInContext(read(file), context, { filename: file });
  } catch (error) {
    fail("knowledge-javascript", `${file}: ${error.message}`);
  }
}

const canonical = context.window.PHOTOGRAPHY_MENTOR_KB;
const taxonomy = context.window.PHOTOGRAPHY_MENTOR_TAXONOMY;
assert(Boolean(canonical && taxonomy), "knowledge-globals", "public knowledge globals loaded");

if (canonical && taxonomy) {
  const canonicalIds = canonical.cards.map((card) => card.id);
  const clusterIds = taxonomy.stages.flatMap((stage) => stage.clusters.flatMap((cluster) => cluster.cardIds));
  const clusters = taxonomy.stages.flatMap((stage) => stage.clusters);

  assert(canonical.cards.length === 62, "canonical-card-count", `${canonical.cards.length} cards`);
  assert(taxonomy.stages.length === 7, "taxonomy-stage-count", `${taxonomy.stages.length} stages`);
  assert(clusters.length === 22, "taxonomy-cluster-count", `${clusters.length} clusters`);
  assert(new Set(canonicalIds).size === canonicalIds.length, "canonical-id-uniqueness", `${canonicalIds.length} unique IDs`);
  assert(new Set(clusterIds).size === canonicalIds.length, "taxonomy-canonical-coverage", `${new Set(clusterIds).size}/${canonicalIds.length} unique cards mapped once`);
  assert(clusterIds.every((id) => canonicalIds.includes(id)), "taxonomy-canonical-integrity", "no unknown canonical IDs");
  const sourceIds = new Set(canonical.sources.map((source) => source.id));
  const brokenCanonicalSources = canonical.cards.flatMap((card) => card.sourceIds.filter((id) => !sourceIds.has(id)).map((id) => `${card.id}:${id}`));
  assert(brokenCanonicalSources.length === 0, "canonical-source-integrity", brokenCanonicalSources.join(", ") || `${canonical.sources.length} sources resolve`);
}

let manifest = null;
try {
  manifest = JSON.parse(read("manifest.webmanifest"));
  pass("manifest-json", "valid JSON");
} catch (error) {
  fail("manifest-json", error.message);
}

if (manifest) {
  assert(manifest.start_url === "./photography-mentor-agent.html", "manifest-start-url", manifest.start_url);
  const missingManifestAssets = (manifest.icons || []).map((icon) => icon.src).filter((asset) => !exists(asset));
  assert(missingManifestAssets.length === 0, "manifest-assets", missingManifestAssets.join(", ") || `${manifest.icons.length} icon entry resolves`);
}

const serviceWorker = read("sw.js");
let serviceWorkerSyntaxError = null;
try {
  new Function(serviceWorker);
} catch (error) {
  serviceWorkerSyntaxError = error.message;
}
assert(!serviceWorkerSyntaxError, "service-worker-syntax", serviceWorkerSyntaxError || "service worker parses");

const cachePrefix = serviceWorker.match(/const CACHE_PREFIX = "([^"]+)"/)?.[1] || "";
const cacheVersion = serviceWorker.match(/const CACHE_NAME = `\$\{CACHE_PREFIX\}(v\d+)`/)?.[1] || "";
const cacheName = `${cachePrefix}${cacheVersion}`;
assert(/^photo-mentor-v\d+$/.test(cacheName || ""), "service-worker-version", cacheName || "missing cache name");

let appShell = [];
try {
  const appShellBody = serviceWorker.match(/const APP_SHELL = \[([\s\S]*?)\];/)?.[1] || "";
  appShell = JSON.parse(`[${appShellBody}]`);
  pass("service-worker-shell-parse", `${appShell.length} cache entries`);
} catch (error) {
  fail("service-worker-shell-parse", error.message);
}

const missingShellFiles = appShell.filter((file) => file !== "./" && !exists(file));
assert(missingShellFiles.length === 0, "service-worker-shell-files", missingShellFiles.join(", ") || "all cache entries exist");
const runtimeAssets = [
  "photography-mentor-agent.html",
  "assets/photo-mentor-foundation.css",
  "assets/photo-mentor-icon.svg",
  "assets/vendor/lucide-1.23.0.min.js",
  "knowledge/photography-mentor-kb.js",
  "knowledge/photography-mentor-taxonomy.js",
  "manifest.webmanifest"
];
const uncachedRuntimeAssets = runtimeAssets.filter((file) => !appShell.includes(file));
assert(uncachedRuntimeAssets.length === 0, "offline-shell-coverage", uncachedRuntimeAssets.join(", ") || `${runtimeAssets.length} runtime assets cached`);

const essentialUiIds = [
  "workspace-mode-switch",
  "mentor-session",
  "curriculum-map",
  "taxonomy-map-search",
  "taxonomy-map-filters",
  "taxonomy-inspector",
  "mentor-workbench",
  "photo-lab",
  "knowledge-library",
  "sybj-ingest",
  "data-control-center",
  "learning-track",
  "agent-prompt",
  "source-boundary"
];
const missingEssentialUi = essentialUiIds.filter((id) => !ids.includes(id));
assert(missingEssentialUi.length === 0, "essential-ui-sections", missingEssentialUi.join(", ") || `${essentialUiIds.length} core sections present`);

const summary = {
  ok: failures.length === 0,
  checks: checks.length,
  failures,
  release: {
    version: "1.2.0",
    files: releaseFiles.length,
    canonicalCards: canonical?.cards.length || 0,
    stages: taxonomy?.stages.length || 0,
    clusters: taxonomy?.stages.flatMap((stage) => stage.clusters).length || 0,
    offlineCache: cacheName || null
  }
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
