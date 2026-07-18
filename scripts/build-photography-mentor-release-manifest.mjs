import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputName = "docs/photography-mentor/release-manifest.json";
const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".svg", ".webmanifest"]);
const releaseFiles = [
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
  "knowledge/photography-mentor-kb.js",
  "knowledge/photography-mentor-taxonomy.js",
  "manifest.webmanifest",
  "notes/photography-knowledge-review-2026-07-14.md",
  "notes/photography-mentor-product-review-2026-07-15.md",
  "notes/photography-mentor-research-2026-07-11.md",
  "package.json",
  "photography-mentor-agent.html",
  "scripts/audit-photography-mentor-release.mjs",
  "scripts/build-photography-mentor-release-manifest.mjs",
  "scripts/validate-photography-mentor.mjs",
  "sw.js"
];

const missing = releaseFiles.filter((relativePath) => !fs.existsSync(path.join(root, ...relativePath.split("/"))));
if (missing.length) throw new Error(`Missing release files: ${missing.join(", ")}`);

function contentForHash(relativePath) {
  const content = fs.readFileSync(path.join(root, ...relativePath.split("/")));
  if (!textExtensions.has(path.extname(relativePath).toLowerCase())) return content;
  return Buffer.from(content.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
}

const files = [...releaseFiles].sort().map((relativePath) => {
  const content = contentForHash(relativePath);
  return {
    path: relativePath,
    bytes: content.byteLength,
    sha256: crypto.createHash("sha256").update(content).digest("hex")
  };
});

const manifest = {
  schemaVersion: 1,
  product: "Photography Mentor",
  version: "1.2.0",
  releaseDate: "2026-07-18",
  files
};

fs.writeFileSync(path.join(root, ...outputName.split("/")), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputName} with ${files.length} checksums.`);
