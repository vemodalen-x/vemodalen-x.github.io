"""Verify that the offline AI knowledge base is complete in Git.

The check deliberately ignores downloadable source media under tools/data and
instead verifies the compact snapshots plus every file used by the generated
offline site.
"""

from __future__ import annotations

import json
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "ai_offline_knowledge_base"
MAX_GIT_FILE_BYTES = 50 * 1024 * 1024

REBUILD_INPUTS = [
    "report.md",
    "report.html",
    "reading_matrix.csv",
    "schedule.json",
    "study_plan.md",
    "diffusion_technical_report.html",
    "llm_reasoning_transformer_study_guide.html",
    "tools/build_offline_kb.py",
    "tools/check_offline_kb_git.py",
    "tools/data/ai_toolkit_repo_snapshot.json",
    "tools/data/ai_toolkit_tree_snapshot.json",
    "tools/data/bilibili_agent_architecture_snapshot.json",
    "tools/data/bilibili_agent_architecture_transcript.json",
    "tools/data/kaggle_genai_course_snapshot.json",
    "tools/data/karpathy_repos_snapshot.json",
    "tools/data/stanford_cs336_snapshot.json",
]


class LocalReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for attribute in ("href", "src"):
            value = values.get(attribute)
            if value:
                self.references.append((attribute, value))


def git_tracked_files() -> set[str]:
    result = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=ROOT,
        check=True,
        capture_output=True,
    )
    return {
        item.decode("utf-8").replace("\\", "/")
        for item in result.stdout.split(b"\0")
        if item
    }


def relative(path: Path) -> str:
    return path.resolve().relative_to(ROOT.resolve()).as_posix()


def main() -> None:
    tracked = git_tracked_files()
    output_files = sorted(path for path in OUT.rglob("*") if path.is_file())
    missing_from_git = [relative(path) for path in output_files if relative(path) not in tracked]
    missing_rebuild_inputs = [item for item in REBUILD_INPUTS if item not in tracked]
    missing_local_targets: list[str] = []
    external_runtime_assets: list[str] = []

    for html_path in sorted(OUT.glob("*.html")):
        parser = LocalReferenceParser()
        parser.feed(html_path.read_text(encoding="utf-8"))
        for attribute, reference in parser.references:
            parsed = urlsplit(reference)
            if parsed.scheme in {"http", "https"}:
                if attribute == "src":
                    external_runtime_assets.append(f"{relative(html_path)} -> {reference}")
                continue
            if parsed.scheme or reference.startswith("#") or not parsed.path:
                continue
            target = (html_path.parent / unquote(parsed.path)).resolve()
            try:
                target_relative = relative(target)
            except ValueError:
                missing_local_targets.append(f"{relative(html_path)} -> {reference} (outside repository)")
                continue
            if not target.exists() or target_relative not in tracked:
                missing_local_targets.append(f"{relative(html_path)} -> {reference}")

    scope = set(REBUILD_INPUTS) | {relative(path) for path in output_files}
    oversized = []
    for item in sorted(scope & tracked):
        path = ROOT / item
        if path.is_file() and path.stat().st_size > MAX_GIT_FILE_BYTES:
            oversized.append({"path": item, "bytes": path.stat().st_size})

    result = {
        "status": "ok"
        if not any(
            (
                missing_from_git,
                missing_rebuild_inputs,
                missing_local_targets,
                external_runtime_assets,
                oversized,
            )
        )
        else "failed",
        "offline_files": len(output_files),
        "offline_bytes": sum(path.stat().st_size for path in output_files),
        "html_pages": len(list(OUT.glob("*.html"))),
        "rebuild_inputs": len(REBUILD_INPUTS),
        "missing_from_git": missing_from_git,
        "missing_rebuild_inputs": missing_rebuild_inputs,
        "missing_or_untracked_local_targets": missing_local_targets,
        "external_runtime_assets": external_runtime_assets,
        "oversized_git_files": oversized,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if result["status"] != "ok":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
