import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = "docs/photography-mentor/release-manifest.json";
const textExtensions = new Set([".cjs", ".css", ".html", ".js", ".json", ".md", ".mjs", ".svg", ".webmanifest"]);
const expectedFiles = new Set([
  "PHOTOGRAPHY_MENTOR_RELEASE.md",
  "assets/photo-mentor-foundation.css",
  "assets/photo-mentor-icon.svg",
  "assets/vendor/lucide-1.23.0.min.js",
  "docs/photography-mentor/CHANGELOG.md",
  "docs/photography-mentor/LICENSE.md",
  "docs/photography-mentor/PRIVACY.md",
  "docs/photography-mentor/README.md",
  "docs/photography-mentor/RELEASE_NOTES.md",
  "docs/photography-mentor/SECURITY.md",
  "docs/photography-mentor/TERMS.md",
  "docs/photography-mentor/THIRD_PARTY_NOTICES.md",
  manifestPath,
  "knowledge/photography-local-summaries.js",
  "knowledge/photography-mentor-core.js",
  "knowledge/photography-commercial-engine.js",
  "knowledge/photography-mentor-kb.js",
  "knowledge/photography-mentor-taxonomy.js",
  "manifest.webmanifest",
  "notes/photography-knowledge-review-2026-07-14.md",
  "notes/photography-mentor-first-principles-integration-2026-08-02.md",
  "notes/photography-mentor-product-review-2026-07-15.md",
  "notes/photography-mentor-commercial-research-2026-09-10.md",
  "notes/photography-mentor-research-2026-07-11.md",
  "package.json",
  "photography-mentor-agent.html",
  "scripts/audit-photography-mentor-release.mjs",
  "scripts/build-photography-local-summaries.mjs",
  "scripts/build-photography-mentor-release-manifest.mjs",
  "scripts/evaluate-photography-mentor.mjs",
  "scripts/validate-photography-mentor.mjs",
  "sw.js",
  "tests/fixtures/photography-mentor-eval.json",
  "tests/photography-mentor-core.test.mjs",
  "tests/photography-mentor-commercial.test.mjs",
  "tests/photography-mentor-e2e.cjs"
]);

const failures = [];
const pass = (label, detail) => console.log(`PASS ${label}: ${detail}`);
const fail = (label, detail) => {
  failures.push({ label, detail });
  console.error(`FAIL ${label}: ${detail}`);
};

function contentForHash(relativePath) {
  const content = fs.readFileSync(path.join(root, ...relativePath.split("/")));
  if (!textExtensions.has(path.extname(relativePath).toLowerCase())) return content;
  return Buffer.from(content.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
}

const files = [...expectedFiles].filter((relativePath) => fs.existsSync(path.join(root, ...relativePath.split("/")))).sort();
const missing = [...expectedFiles].filter((relativePath) => !files.includes(relativePath));
missing.length ? fail("allowlist-missing", missing.join(", ")) : pass("allowlist-missing", "none");

const rasterMedia = files.filter((file) => /\.(?:png|jpe?g|webp|gif|bmp|tiff?)$/i.test(file));
rasterMedia.length ? fail("release-raster-media", rasterMedia.join(", ")) : pass("release-raster-media", "no screenshots or raster photos in the product release set");

const sensitiveNames = files.filter((file) => /(?:screenshot|screen-shot|capture|local-photography-books|personal-document|credential|secret)/i.test(file));
sensitiveNames.length ? fail("sensitive-filenames", sensitiveNames.join(", ")) : pass("sensitive-filenames", "none");

const textPatterns = [
  ["windows-user-path", new RegExp("[A-Za-z]:[\\\\/](?:Users|Documents|Desktop|Downloads)[\\\\/]", "i")],
  ["unix-user-path", new RegExp("/(?:Users|home)/[A-Za-z0-9._-]+/", "i")],
  ["file-url", new RegExp(["file", "://"].join(""), "i")],
  ["private-key", new RegExp(["-----BEGIN", "(?: RSA| OPENSSH| EC)? PRIVATE KEY-----"].join(""), "i")],
  ["github-token", new RegExp(["gh", "[pousr]_[A-Za-z0-9]{20,}"].join(""))],
  ["openai-token", new RegExp(["s", "k-[A-Za-z0-9_-]{20,}"].join(""))],
  ["aws-access-key", new RegExp(["AK", "IA[0-9A-Z]{16}"].join(""))]
];

for (const relativePath of files) {
  const content = fs.readFileSync(path.join(root, ...relativePath.split("/")));
  if (content.includes(0)) continue;
  const text = content.toString("utf8");
  for (const [label, pattern] of textPatterns) {
    if (pattern.test(text)) fail(label, relativePath);
  }
}
if (!failures.some(({ label }) => textPatterns.some(([patternLabel]) => patternLabel === label))) {
  pass("content-leak-scan", "no machine paths, file URLs, private keys or common API tokens");
}

try {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, ...manifestPath.split("/")), "utf8"));
  const manifestPaths = new Set(manifest.files.map((entry) => entry.path));
  const manifestExpected = files.filter((file) => file !== manifestPath);
  const missingFromManifest = manifestExpected.filter((file) => !manifestPaths.has(file));
  const extraInManifest = [...manifestPaths].filter((file) => !manifestExpected.includes(file));
  manifest.version === "1.4.0" ? pass("manifest-version", manifest.version) : fail("manifest-version", String(manifest.version));
  if (missingFromManifest.length || extraInManifest.length) {
    fail("manifest-file-set", `missing=${missingFromManifest.join(",")}; extra=${extraInManifest.join(",")}`);
  } else {
    pass("manifest-file-set", `${manifestExpected.length} files`);
  }
  const checksumErrors = manifest.files.filter((entry) => {
    const absolute = path.join(root, ...entry.path.split("/"));
    if (!fs.existsSync(absolute)) return true;
    const hash = crypto.createHash("sha256").update(contentForHash(entry.path)).digest("hex");
    return hash !== entry.sha256;
  });
  checksumErrors.length ? fail("manifest-checksums", checksumErrors.map((entry) => entry.path).join(", ")) : pass("manifest-checksums", "all match");
} catch (error) {
  fail("manifest-read", error.message);
}

console.log(JSON.stringify({ ok: failures.length === 0, files: files.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
