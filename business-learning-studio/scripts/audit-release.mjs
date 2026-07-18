import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rasterExtensions } from "./release-files.mjs";

const auditFile = fileURLToPath(import.meta.url);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "dist") return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function relative(root, file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function privateMarkers() {
  return [
    ["named private source", ["yi", "tang"].join("")],
    ["named private source", String.fromCodePoint(0x4e00, 0x5802)],
    ["private document platform", String.fromCodePoint(0x98de, 0x4e66)],
    ["private document platform", ["fei", "shu"].join("")],
    ["private lesson reward", ["can", "dy"].join("")],
    ["local application cache", ["App", "Data"].join("")],
    ["local application cache", ["RW", "Temp"].join("")],
    ["local chat cache", ["xwechat", "_files"].join("")],
    ["local clipboard capture", ["codex", "-clipboard"].join("")],
    ["local chat account", ["wx", "id_"].join("")]
  ];
}

function isText(buffer) {
  return !buffer.includes(0);
}

export function auditTree(root = process.cwd()) {
  const errors = [];
  const files = walk(root);
  const authoredExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".svg", ".webmanifest", ".yml", ".yaml"]);

  for (const file of files) {
    const rel = relative(root, file);
    const extension = path.extname(file).toLowerCase();
    const lowerName = rel.toLowerCase();

    if (rasterExtensions.has(extension)) errors.push(`${rel}: raster image files are not allowed in the public release`);
    if (/screenshot|screen[-_ ]?capture|contact[-_ ]?sheet/.test(lowerName)) errors.push(`${rel}: capture-like filename is not allowed`);
    if (/\.map$/i.test(rel)) errors.push(`${rel}: source maps are not allowed in the public release`);

    const buffer = fs.readFileSync(file);
    if (!isText(buffer)) {
      errors.push(`${rel}: binary files are not allowed`);
      continue;
    }

    const content = buffer.toString("utf8");
    if (content.includes("\uFFFD")) errors.push(`${rel}: contains invalid UTF-8 replacement characters`);

    for (const [label, marker] of privateMarkers()) {
      if (file === auditFile || rel.startsWith("assets/vendor/")) continue;
      if (content.toLocaleLowerCase("en-US").includes(marker.toLocaleLowerCase("en-US"))) {
        errors.push(`${rel}: contains ${label}`);
      }
    }

    if (/[A-Za-z]:[\\/](?:Users|Documents|Desktop|Downloads|ProgramData|Windows)[\\/]/i.test(content)) {
      errors.push(`${rel}: contains a local absolute path`);
    }
    if (/\/(?:Users|home)\/[^/\s]+\//i.test(content) || /file:\/{2,3}/i.test(content)) {
      errors.push(`${rel}: contains a local file URI or home path`);
    }

    if (authoredExtensions.has(extension) && !rel.startsWith("assets/vendor/")) {
      const secretPatterns = [
        /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"']{8,}["']/i,
        new RegExp(["gh", "p_", "[A-Za-z0-9]{30,}"].join("")),
        /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
      ];
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) errors.push(`${rel}: contains a likely credential or private key`);
      }
    }

    if (/\.html?$/i.test(rel)) {
      const externalRuntime = /(?:src|href|action)\s*=\s*["']https?:\/\//i;
      if (externalRuntime.test(content)) errors.push(`${rel}: contains an external runtime URL`);
      const csp = /Content-Security-Policy/i.test(content);
      if (!csp) errors.push(`${rel}: missing Content Security Policy`);
    }
    if (/\.css$/i.test(rel) && /(?:@import\s+|url\(\s*["']?)https?:\/\//i.test(content)) {
      errors.push(`${rel}: contains an external stylesheet or asset URL`);
    }
  }

  if (errors.length) {
    throw new Error(`Release audit failed:\n- ${errors.join("\n- ")}`);
  }

  return { fileCount: files.length, rasterCount: 0, errors: [] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === auditFile) {
  const result = auditTree(process.cwd());
  console.log(`Release audit passed: ${result.fileCount} source files, no raster captures or private markers.`);
}
