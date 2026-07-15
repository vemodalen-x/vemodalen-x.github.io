from __future__ import annotations

import argparse
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MAX_PUBLIC_FILE_BYTES = 10 * 1024 * 1024
TEXT_EXTENSIONS = {
    ".css", ".csv", ".html", ".js", ".json", ".md", ".mjs", ".py", ".ps1", ".svg", ".txt", ".xml"
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
    ("absolute Windows user path", re.compile(r"(?i)\b[A-Z]:\\(?:Users|Env)\\[^\r\n`'\"]+")),
    ("absolute Unix user path", re.compile(r"(?<![A-Za-z])/(?:Users|home)/[A-Za-z0-9._-]+/")),
    ("OpenAI-style secret", re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b")),
    ("Google-style secret", re.compile(r"\bAIza[0-9A-Za-z_-]{20,}\b")),
    ("private key material", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
)


@dataclass(frozen=True)
class Finding:
    path: str
    reason: str


def git_paths(staged: bool) -> list[str]:
    command = ["git", "diff", "--cached", "--name-only", "--diff-filter=ACMR"] if staged else ["git", "ls-files"]
    result = subprocess.run(command, cwd=ROOT, check=True, capture_output=True, text=True, encoding="utf-8")
    return [line.strip().replace("\\", "/") for line in result.stdout.splitlines() if line.strip()]


def scan_file(relative_path: str, max_bytes: int = MAX_PUBLIC_FILE_BYTES) -> list[Finding]:
    normalized = relative_path.replace("\\", "/").lstrip("./")
    lowered = normalized.lower()
    findings: list[Finding] = []

    if normalized in FORBIDDEN_FILES or any(lowered.startswith(prefix.lower()) for prefix in FORBIDDEN_PREFIXES):
        findings.append(Finding(normalized, "private or generated path is not allowed in the public release"))
        return findings

    path = ROOT / normalized
    if not path.exists() or not path.is_file():
        return findings
    if path.stat().st_size > max_bytes:
        findings.append(Finding(normalized, f"file exceeds {max_bytes // (1024 * 1024)} MB"))
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return findings

    text = path.read_text(encoding="utf-8", errors="replace")
    for label, pattern in CONTENT_PATTERNS:
        if pattern.search(text):
            findings.append(Finding(normalized, label))
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit tracked or staged files before publishing GitHub Pages.")
    parser.add_argument("--staged", action="store_true", help="scan only staged additions and modifications")
    args = parser.parse_args()

    paths = git_paths(args.staged)
    findings = [finding for path in paths for finding in scan_file(path)]
    if findings:
        for finding in findings:
            print(f"FAIL {finding.path}: {finding.reason}")
        return 1
    print(f"Public release audit passed for {len(paths)} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
