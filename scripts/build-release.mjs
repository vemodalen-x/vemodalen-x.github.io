import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { auditTree } from "./audit-release.mjs";
import { releaseFiles } from "./release-files.mjs";

const root = process.cwd();
const dist = path.resolve(root, "dist");

if (path.dirname(dist) !== path.resolve(root) || path.basename(dist) !== "dist") {
  throw new Error("Refusing to clean an unexpected build directory.");
}

auditTree(root);
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const rel of releaseFiles) {
  const source = path.resolve(root, rel);
  if (!source.startsWith(`${path.resolve(root)}${path.sep}`) || !fs.existsSync(source)) {
    throw new Error(`Missing or invalid release file: ${rel}`);
  }
  const target = path.resolve(dist, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

const files = releaseFiles.map((rel) => {
  const buffer = fs.readFileSync(path.join(dist, rel));
  return {
    path: rel,
    bytes: buffer.length,
    sha256: crypto.createHash("sha256").update(buffer).digest("hex")
  };
});

const manifest = {
  schemaVersion: 1,
  product: "Business Learning Studio Commercial",
  version: "1.0.0",
  releaseDate: "2026-07-18",
  fileCount: files.length,
  containsRasterImages: false,
  containsPrivateCourseMaterial: false,
  privacyBoundary: "Original generic content and local runtime assets only.",
  files
};

fs.writeFileSync(path.join(dist, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Built dist/: ${files.length} allowlisted files plus release-manifest.json.`);
