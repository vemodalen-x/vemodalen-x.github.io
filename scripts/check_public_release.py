from __future__ import annotations

import argparse
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path, PurePosixPath


ROOT = Path(__file__).resolve().parents[1]
MAX_PUBLIC_FILE_BYTES = 10 * 1024 * 1024
TEXT_EXTENSIONS = {
    ".css", ".csv", ".html", ".js", ".json", ".md", ".mjs", ".cjs", ".py",
    ".ps1", ".svg", ".txt", ".xml", ".toml", ".yaml", ".yml", ".webmanifest"
}
FORBIDDEN_PREFIXES = (
    "ai_offline_knowledge_base/",
    "assets/yitang-",
    "interview-prep/",
    "knowledge/personal-kb-index.js",
    "knowledge/yitang-",
    "notes/assets/",
    "notes/yitang-",
    "outputs/",
    "tmp/",
    "tools/",
)
FORBIDDEN_FILES = {
    "business-tutor-agent.html",
    "local-knowledge-assistant.html",
    "personal-knowledge-hub.html",
}
CONTENT_PATTERNS = (
    ("absolute Windows user path", re.compile(r"(?i)\b[A-Z]:[\\/](?:Users|Env|Documents|Desktop|Downloads)[\\/][^\r\n`'\"]+")),
    ("absolute Unix user path", re.compile(r"(?<![A-Za-z])/(?:Users|home)/[A-Za-z0-9._-]+/")),
    ("OpenAI-style secret", re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b")),
    ("Google-style secret", re.compile(r"\bAIza[0-9A-Za-z_-]{20,}\b")),
    ("GitHub-style secret", re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b")),
    ("private key material", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
)


@dataclass(frozen=True)
class Finding:
    path: str
    reason: str


def git_output(*arguments: str) -> bytes:
    return subprocess.run(["git", *arguments], cwd=ROOT, check=True, capture_output=True).stdout


def scan_index(staged: bool = False) -> tuple[int, list[Finding]]:
    changed = None
    if staged:
        changed = set(git_output("diff", "--cached", "--name-only", "--diff-filter=ACMRTU", "-z").split(b"\0"))
    findings: list[Finding] = []
    count = 0
    # Read blob IDs from the index, never a possibly different working-tree copy.
    for entry in git_output("ls-files", "--stage", "-z").split(b"\0"):
        if not entry:
            continue
        metadata, raw_path = entry.split(b"\t", 1)
        if changed is not None and raw_path not in changed:
            continue
        mode, blob, stage = metadata.decode("ascii").split()
        relative_path = raw_path.decode("utf-8")
        count += 1
        if stage != "0" or mode not in {"100644", "100755"}:
            findings.append(Finding(relative_path, "unmerged entry, symlink or submodule is not a public file"))
            continue
        findings.extend(scan_file(relative_path, content=git_output("cat-file", "blob", blob)))
    return count, findings


def scan_file(relative_path: str, max_bytes: int = MAX_PUBLIC_FILE_BYTES, *, content: bytes | None = None) -> list[Finding]:
    normalized = relative_path.replace("\\", "/")
    parts = PurePosixPath(normalized).parts
    if not parts or ".." in parts or normalized.startswith("/") or re.match(r"^[A-Za-z]:", normalized):
        return [Finding(relative_path, "path must stay inside the public repository")]
    normalized = PurePosixPath(normalized).as_posix()
    lowered = normalized.lower()
    findings: list[Finding] = []

    if (lowered in FORBIDDEN_FILES or any(lowered.startswith(prefix.lower()) for prefix in FORBIDDEN_PREFIXES)
            or any(part.lower().startswith(".env") and part != ".env.example" for part in parts)
            or Path(normalized).suffix.lower() in {".pem", ".key", ".p12", ".pfx"}):
        findings.append(Finding(normalized, "private or generated path is not allowed in the public release"))
        return findings

    path = ROOT / normalized
    if content is None:
        if not path.is_file() or path.is_symlink() or not path.resolve().is_relative_to(ROOT.resolve()):
            return [Finding(normalized, "missing file or unsafe filesystem target")]
        content = path.read_bytes()
    if len(content) > max_bytes:
        findings.append(Finding(normalized, f"file exceeds {max_bytes // (1024 * 1024)} MB"))
    if path.suffix.lower() not in TEXT_EXTENSIONS and path.name != ".env.example":
        return findings

    text = content.decode("utf-8", errors="replace")
    for label, pattern in CONTENT_PATTERNS:
        if pattern.search(text):
            findings.append(Finding(normalized, label))
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit the Git index contents before publishing GitHub Pages.")
    parser.add_argument("--staged", action="store_true", help="scan only staged additions and modifications")
    args = parser.parse_args()

    count, findings = scan_index(args.staged)
    if findings:
        for finding in findings:
            print(f"FAIL {finding.path}: {finding.reason}")
        return 1
    print(f"Public release audit passed for {count} indexed files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
