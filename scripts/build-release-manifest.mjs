import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputName = "release-manifest.json";
const excludedDirectories = new Set([".git", "dist", "node_modules", "playwright-report", "test-results"]);

function listFiles(directory, prefix = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (excludedDirectories.has(entry.name)) return [];
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(absolute, relative);
    if (!entry.isFile() || relative === outputName) return [];
    return [relative];
  });
}

const files = listFiles(root).sort().map((relativePath) => {
  const content = fs.readFileSync(path.join(root, ...relativePath.split("/")));
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

fs.writeFileSync(path.join(root, outputName), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputName} with ${files.length} checksums.`);
