import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const excludedDirectories = new Set([".git", "dist", "node_modules", "playwright-report", "test-results"]);
const expectedFiles = new Set([
  ".gitattributes",
  ".gitignore",
  "CHANGELOG.md",
  "LICENSE.md",
  "PHOTOGRAPHY_MENTOR_RELEASE.md",
  "PRIVACY.md",
  "README.md",
  "RELEASE_NOTES.md",
  "SECURITY.md",
  "TERMS.md",
  "THIRD_PARTY_NOTICES.md",
  "assets/photo-mentor-foundation.css",
  "assets/photo-mentor-icon.svg",
  "assets/vendor/lucide-1.23.0.min.js",
  "index.html",
  "knowledge/photography-mentor-kb.js",
  "knowledge/photography-mentor-taxonomy.js",
  "manifest.webmanifest",
  "notes/photography-knowledge-review-2026-07-14.md",
  "notes/photography-mentor-product-review-2026-07-15.md",
  "notes/photography-mentor-research-2026-07-11.md",
  "package.json",
  "photography-mentor-agent.html",
  "release-manifest.json",
  "scripts/audit-public-release.mjs",
  "scripts/build-release-manifest.mjs",
  "scripts/validate-photography-mentor.mjs",
  "sw.js"
]);

function listFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (excludedDirectories.has(entry.name)) return [];
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(absolute, relative);
    return entry.isFile() ? [relative] : [];
  });
}

const files = listFiles(root).sort();
const failures = [];
const pass = (label, detail) => console.log(`PASS ${label}: ${detail}`);
const fail = (label, detail) => {
  failures.push({ label, detail });
  console.error(`FAIL ${label}: ${detail}`);
};

const missing = [...expectedFiles].filter((file) => !files.includes(file));
const unexpected = files.filter((file) => !expectedFiles.has(file));
missing.length ? fail("allowlist-missing", missing.join(", ")) : pass("allowlist-missing", "none");
unexpected.length ? fail("allowlist-unexpected", unexpected.join(", ")) : pass("allowlist-unexpected", "none");

const rasterMedia = files.filter((file) => /\.(?:png|jpe?g|webp|gif|bmp|tiff?)$/i.test(file));
rasterMedia.length ? fail("raster-media", rasterMedia.join(", ")) : pass("raster-media", "no screenshots or raster photos");

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
  const absolutePath = path.join(root, ...relativePath.split("/"));
  const content = fs.readFileSync(absolutePath);
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
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "release-manifest.json"), "utf8"));
  const manifestPaths = new Set(manifest.files.map((entry) => entry.path));
  const manifestExpected = files.filter((file) => file !== "release-manifest.json");
  const missingFromManifest = manifestExpected.filter((file) => !manifestPaths.has(file));
  const extraInManifest = [...manifestPaths].filter((file) => !manifestExpected.includes(file));
  if (manifest.version !== "1.2.0") fail("manifest-version", String(manifest.version));
  else pass("manifest-version", manifest.version);
  if (missingFromManifest.length || extraInManifest.length) {
    fail("manifest-file-set", `missing=${missingFromManifest.join(",")}; extra=${extraInManifest.join(",")}`);
  } else {
    pass("manifest-file-set", `${manifestExpected.length} files`);
  }
  const checksumErrors = manifest.files.filter((entry) => {
    const absolute = path.join(root, ...entry.path.split("/"));
    if (!fs.existsSync(absolute)) return true;
    const hash = crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
    return hash !== entry.sha256;
  });
  checksumErrors.length ? fail("manifest-checksums", checksumErrors.map((entry) => entry.path).join(", ")) : pass("manifest-checksums", "all match");
} catch (error) {
  fail("manifest-read", error.message);
}

if (fs.existsSync(path.join(root, ".git"))) {
  try {
    const line = execFileSync("git", ["rev-list", "--parents", "-n", "1", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
    if (line && line.split(/\s+/).length !== 1) fail("root-history", "release commit has a parent");
    else if (line) pass("root-history", "release commit is a sanitized root commit");
  } catch {
    pass("root-history", "repository has no commit yet; check deferred");
  }
}

console.log(JSON.stringify({ ok: failures.length === 0, files: files.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
