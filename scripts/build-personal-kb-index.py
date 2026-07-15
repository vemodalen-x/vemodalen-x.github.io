"""Build a browser-readable index for the local personal knowledge base."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # The fallback keeps the indexer usable on a minimal Python install.
    yaml = None


DEFAULT_LEGACY_ROOT = Path(
    r"C:\Users\User\Documents\Codex\2026-06-14\tianyu2fm-https-space-bilibili-com-623448014\outputs\person_knowledge_pc"
)
PREFERRED_EXTENSIONS = {".md", ".txt", ".docx", ".pdf", ".html", ".htm", ".pptx"}
NOISE_PATTERN = re.compile(
    r"(deleted?_duplicates?|desktop\.ini|package-lock|yarn\.lock|setup(error|act)?|"
    r"manifest|cache|debug|trace|crash|telemetry|changelog|license)$",
    re.IGNORECASE,
)


def clean_text(value: Any, limit: int | None = None) -> str:
    text = re.sub(r"\s+", " ", str(value or "")).strip().strip('"')
    if limit and len(text) > limit:
        return text[: limit - 1].rstrip() + "…"
    return text


def stable_id(prefix: str, value: str) -> str:
    digest = hashlib.sha1(value.encode("utf-8", errors="ignore")).hexdigest()[:12]
    return f"{prefix}-{digest}"


def parse_simple_frontmatter(raw: str) -> dict[str, Any]:
    """Parse the scalar and list subset used by this repository without PyYAML."""
    metadata: dict[str, Any] = {}
    current_list = ""
    for line in raw.splitlines():
        list_item = re.match(r"^\s+-\s+(.+?)\s*$", line)
        if current_list and list_item:
            metadata[current_list].append(list_item.group(1).strip().strip('"\''))
            continue
        field = re.match(r"^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$", line)
        if not field:
            current_list = ""
            continue
        key, value = field.group(1), (field.group(2) or "").strip()
        if not value:
            metadata[key] = []
            current_list = key
        else:
            metadata[key] = value.strip('"\'')
            current_list = ""
    return metadata


def parse_markdown(path: Path, root: Path) -> dict[str, Any]:
    raw = path.read_text(encoding="utf-8", errors="replace")
    metadata: dict[str, Any] = {}
    body = raw
    if raw.startswith("---"):
        parts = raw.split("---", 2)
        if len(parts) == 3:
            body = parts[2]
            if yaml:
                try:
                    loaded = yaml.safe_load(parts[1]) or {}
                    if isinstance(loaded, dict):
                        metadata = loaded
                except yaml.YAMLError:
                    metadata = parse_simple_frontmatter(parts[1])
            else:
                metadata = parse_simple_frontmatter(parts[1])

    heading = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    title = clean_text(metadata.get("title") or (heading.group(1) if heading else path.stem), 180)
    raw_tags = metadata.get("tags", [])
    if isinstance(raw_tags, str):
        raw_tags = re.split(r"[,，\s]+", raw_tags)
    tags = [clean_text(tag, 40) for tag in raw_tags if clean_text(tag)]
    category = classify_current(path.name, title, tags)

    plain = re.sub(r"```.*?```", " ", body, flags=re.DOTALL)
    plain = re.sub(r"!\[[^]]*]\([^)]*\)", " ", plain)
    plain = re.sub(r"\[([^]]+)]\([^)]*\)", r"\1", plain)
    plain = re.sub(r"^#{1,6}\s+", "", plain, flags=re.MULTILINE)
    plain = re.sub(r"^[>|*-]+\s*", "", plain, flags=re.MULTILINE)
    plain = clean_text(plain)
    summary = clean_text(metadata.get("summary") or plain, 420)
    source_urls = re.findall(r"https?://[^\s)>]+", raw)
    modified = datetime.fromtimestamp(path.stat().st_mtime).astimezone().isoformat(timespec="seconds")
    relative = path.relative_to(root).as_posix()

    return {
        "id": stable_id("current", relative),
        "title": title,
        "category": category,
        "sourceType": "current",
        "sourceLabel": "精选笔记",
        "tags": tags[:12],
        "summary": summary,
        "searchText": clean_text(f"{title} {' '.join(tags)} {plain}", 6000),
        "modified": clean_text(metadata.get("date") or modified, 40),
        "status": clean_text(metadata.get("status") or "active", 30),
        "notePath": relative,
        "sourcePath": "",
        "sourceUrl": source_urls[0].rstrip(".,;，。") if source_urls else "",
        "valueScore": 90,
        "valueTier": "精选",
        "valueReason": "经过整理的 Markdown 笔记，包含可检索正文",
    }


def classify_current(filename: str, title: str, tags: list[str]) -> str:
    haystack = f"{filename} {title} {' '.join(tags)}".lower()
    rules = [
        ("方法论与决策", (r"\bmao\b", "毛", "方法论", "决策", "复盘")),
        ("商业、职业与项目资料", (r"\bbusiness\b", "商业", "职业", "项目", r"\byitang\b", "一堂")),
        ("AI 与机器学习", (r"\bai\b", r"\brag\b", "模型", "人工智能")),
        ("摄影与视觉创作", (r"\bphoto", "摄影", "视觉")),
        ("个人笔记与知识管理", (r"\bpkm\b", "知识库", "知识管理")),
        ("写作、媒体与内容创作", (r"\bmedia\b", "写作", "内容", "博客")),
    ]
    for category, needles in rules:
        if any(re.search(needle, haystack) if needle.startswith(r"\b") else needle in haystack for needle in needles):
            return category
    return "研究、课程与学习资料"


def legacy_score(row: dict[str, str]) -> tuple[int, str, str]:
    score = 18
    reasons: list[str] = []
    status = row.get("status", "")
    summary = clean_text(row.get("summary"))
    keywords = clean_text(row.get("keywords"))
    category = row.get("category", "")
    extension = row.get("extension", "").lower()
    title = clean_text(row.get("title"))

    if status == "ok":
        score += 16
        reasons.append("正文已提取")
    elif status == "partial_pdf":
        score += 8
        reasons.append("PDF 部分提取")
    else:
        reasons.append("仅元数据")
    if len(summary) >= 120:
        score += 14
    if len(summary) >= 500:
        score += 6
    if keywords:
        score += 9
    if category and category != "待整理与未分类":
        score += 12
        reasons.append("已有分类")
    if extension in PREFERRED_EXTENSIONS:
        score += 12
        reasons.append("文本型来源")
    elif extension in {".csv", ".xlsx", ".xls"}:
        score += 6
        reasons.append("结构化数据")
    if row.get("source_path") and Path(row["source_path"]).exists():
        score += 7
        reasons.append("来源可追溯")
    if NOISE_PATTERN.search(Path(title).stem):
        score -= 28
        reasons.append("疑似系统或过程文件")
    if extension in {".log", ".ini", ".lock", ".tmp"}:
        score -= 18
    score = max(0, min(100, score))
    tier = "精选" if score >= 85 else "可用" if score >= 60 else "待整理"
    return score, tier, "、".join(reasons[:4]) or "等待人工判断"


def load_legacy(root: Path) -> list[dict[str, Any]]:
    catalog = root / "data" / "catalog.csv"
    if not catalog.exists():
        return []
    documents: list[dict[str, Any]] = []
    with catalog.open(encoding="utf-8-sig", newline="", errors="replace") as handle:
        for row in csv.DictReader(handle):
            title = clean_text(row.get("title"), 180) or "未命名资料"
            score, tier, reason = legacy_score(row)
            keywords = [clean_text(item, 40) for item in re.split(r"[、,，;；]+", row.get("keywords", ""))]
            note_path = clean_text(row.get("note_path"))
            absolute_note = str((root / note_path).resolve()) if note_path else ""
            documents.append(
                {
                    "id": stable_id("legacy", f"{row.get('source_path')}|{note_path}"),
                    "title": title,
                    "category": clean_text(row.get("category")) or "待整理与未分类",
                    "sourceType": "legacy",
                    "sourceLabel": "旧库索引",
                    "tags": [item for item in keywords if item][:12],
                    "summary": clean_text(row.get("summary"), 520),
                    "searchText": clean_text(
                        f"{title} {row.get('category', '')} {row.get('keywords', '')} {row.get('summary', '')}",
                        3200,
                    ),
                    "modified": clean_text(row.get("modified"), 40),
                    "status": clean_text(row.get("status"), 30),
                    "notePath": absolute_note,
                    "sourcePath": clean_text(row.get("source_path"), 1000),
                    "sourceUrl": "",
                    "extension": clean_text(row.get("extension"), 20),
                    "valueScore": score,
                    "valueTier": tier,
                    "valueReason": reason,
                }
            )
    return documents


def load_waytoagi(repo_root: Path) -> list[dict[str, Any]]:
    catalog_path = repo_root / "knowledge" / "waytoagi-catalog.json"
    if not catalog_path.exists():
        return []
    try:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []

    documents: list[dict[str, Any]] = []
    for record in catalog.get("records", []):
        title = clean_text(record.get("title"), 180) or "未命名 WaytoAGI 页面"
        category = clean_text(record.get("category"), 100) or "AI 综合资源与导航"
        path = clean_text(record.get("path"), 1200)
        object_type = clean_text(record.get("objectType"), 40)
        score = max(0, min(100, int(record.get("valueScore") or 65)))
        tier = "精选" if score >= 85 else "可用" if score >= 60 else "待整理"
        summary = clean_text(
            f"WaytoAGI 公开目录条目。目录路径：{path or title}；页面类型：{object_type or '未标注'}。"
            "工具、模型、法规和新闻类内容会快速变化，使用前请打开原链接核验。",
            520,
        )
        documents.append(
            {
                "id": clean_text(record.get("id")) or stable_id("waytoagi", str(record.get("url"))),
                "title": title,
                "category": category,
                "sourceType": "waytoagi",
                "sourceLabel": "WaytoAGI 目录",
                "tags": ["WaytoAGI", object_type, *re.split(r"[、， /]+", category)][:12],
                "summary": summary,
                "searchText": clean_text(f"{title} {category} {path} {object_type}", 3200),
                "modified": clean_text(record.get("updated"), 40),
                "status": "source-index",
                "notePath": "notes/waytoagi/00-waytoagi-source-index.md",
                "sourcePath": "",
                "sourceUrl": clean_text(record.get("url"), 1000),
                "valueScore": score,
                "valueTier": tier,
                "valueReason": "公开目录可追溯；已分类但未镜像第三方全文",
            }
        )
    return documents


def load_latent_papers(repo_root: Path) -> list[dict[str, Any]]:
    catalog_path = repo_root / "knowledge" / "latent-space-paper-catalog.json"
    if not catalog_path.exists():
        return []
    try:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []

    source = catalog.get("source", {})
    modified = clean_text(source.get("retrieved"), 40)
    score_by_priority = {"P0": 94, "P1": 86, "P2": 74}
    documents: list[dict[str, Any]] = []
    for record in catalog.get("records", []):
        title = clean_text(record.get("title"), 180) or "未命名 AI 工程阅读"
        section = clean_text(record.get("section"), 80) or "综合"
        priority = clean_text(record.get("priority"), 10) or "P2"
        kind = clean_text(record.get("kind"), 40) or "资料"
        question = clean_text(record.get("question"), 300)
        judgment = clean_text(record.get("summary"), 520)
        output = clean_text(record.get("output"), 300)
        related_urls = record.get("relatedUrls", []) if isinstance(record.get("relatedUrls"), list) else []
        related_text = " ".join(
            f"{clean_text(item.get('title'))} {clean_text(item.get('url'))}"
            for item in related_urls
            if isinstance(item, dict)
        )
        score = score_by_priority.get(priority, 74)
        tier = "精选" if score >= 85 else "可用"
        summary = clean_text(f"研究问题：{question} 核心判断：{judgment} 最低产出：{output}", 900)
        raw_tags = record.get("tags", []) if isinstance(record.get("tags"), list) else []
        tags = [section, priority, kind, *[clean_text(tag, 40) for tag in raw_tags if clean_text(tag)]]
        documents.append(
            {
                "id": clean_text(record.get("id")) or stable_id("research", str(record.get("url"))),
                "title": title,
                "category": f"AI 工程论文 · {section}",
                "sourceType": "research",
                "sourceLabel": "AI 论文目录",
                "tags": tags[:12],
                "summary": summary,
                "searchText": clean_text(
                    f"{title} {section} {priority} {kind} {' '.join(tags)} {question} {judgment} {output} {related_text}",
                    5000,
                ),
                "modified": modified,
                "status": "reading-catalog",
                "notePath": "notes/latent-space/00-2025-ai-engineer-core-reading-catalog.md",
                "sourcePath": clean_text(source.get("title"), 180),
                "sourceUrl": clean_text(record.get("url"), 1000),
                "valueScore": score,
                "valueTier": tier,
                "valueReason": f"{priority} 分级；保留一手链接、个人判断与最低阅读产出",
            }
        )
    return documents


def load_xiaohongshu_sources(repo_root: Path) -> list[dict[str, Any]]:
    catalog_path = repo_root / "knowledge" / "xiaohongshu-zeng-tianzhen-catalog.json"
    if not catalog_path.exists():
        return []
    try:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []

    source = catalog.get("source", {})
    profile = catalog.get("profile", {})
    profile_url = clean_text(source.get("profileUrl"), 1000)
    modified = clean_text(source.get("retrieved"), 40)
    note_path = "notes/xiaohongshu/zeng-tianzhen-ai-career-source.md"
    nickname = clean_text(profile.get("nickname"), 180) or "小红书创作者"
    topics = profile.get("topics", []) if isinstance(profile.get("topics"), list) else []
    profile_summary = clean_text(
        f"公开来源档案：{clean_text(profile.get('bioSummary'))} "
        f"位置：{clean_text(profile.get('location')) or '未标注'}；"
        f"粉丝：{clean_text(profile.get('fansLabel')) or '未标注'}；"
        f"获赞与收藏：{clean_text(profile.get('engagementLabel')) or '未标注'}。"
        f"当前仅导入公开元数据，正文因平台安全限制等待合规补充。",
        760,
    )
    documents: list[dict[str, Any]] = [
        {
            "id": stable_id("xiaohongshu-profile", clean_text(source.get("userId")) or profile_url),
            "title": f"{nickname}：公开主页与内容定位",
            "category": "AI 职业与算法实践",
            "sourceType": "xiaohongshu",
            "sourceLabel": "小红书公开目录",
            "tags": ["小红书", "创作者来源", *[clean_text(topic, 40) for topic in topics if clean_text(topic)]][:12],
            "summary": profile_summary,
            "searchText": clean_text(
                f"{nickname} {clean_text(profile.get('redId'))} {clean_text(profile.get('location'))} "
                f"{' '.join(str(topic) for topic in topics)} {profile_summary}",
                4000,
            ),
            "modified": modified,
            "status": "partial-source",
            "notePath": note_path,
            "sourcePath": "小红书公开主页",
            "sourceUrl": profile_url,
            "valueScore": 82,
            "valueTier": "可用",
            "valueReason": "账号身份和内容定位已核验；正文尚未完整导入",
        }
    ]
    for record in catalog.get("records", []):
        title = clean_text(record.get("title"), 180) or "未命名小红书笔记"
        category = clean_text(record.get("category"), 100) or "小红书待提炼内容"
        summary = clean_text(record.get("summary"), 760)
        tags = record.get("tags", []) if isinstance(record.get("tags"), list) else []
        documents.append(
            {
                "id": clean_text(record.get("id")) or stable_id("xiaohongshu", title),
                "title": title,
                "category": category,
                "sourceType": "xiaohongshu",
                "sourceLabel": "小红书公开目录",
                "tags": ["小红书", "待提炼", *[clean_text(tag, 40) for tag in tags if clean_text(tag)]][:12],
                "summary": summary,
                "searchText": clean_text(
                    f"{title} {category} {' '.join(str(tag) for tag in tags)} {summary}",
                    4000,
                ),
                "modified": modified,
                "status": clean_text(record.get("contentStatus"), 40) or "metadata-only",
                "notePath": note_path,
                "sourcePath": nickname,
                "sourceUrl": clean_text(record.get("url"), 1000) or profile_url,
                "valueScore": 62,
                "valueTier": "可用",
                "valueReason": "标题和互动元数据已核验；正文未取得，不生成方法结论",
            }
        )
    return documents


def load_mitbunny_sources(repo_root: Path) -> list[dict[str, Any]]:
    catalog_path = repo_root / "knowledge" / "mitbunny-x-ai-influencers-2026-02-11.json"
    if not catalog_path.exists():
        return []
    try:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []

    source = catalog.get("source", {})
    category_labels = catalog.get("categories", {})
    modified = clean_text(source.get("dataLastUpdated"), 40) or clean_text(source.get("retrievedAt"), 40)
    note_path = "notes/ai-engineering/08-mitbunny-x-ai-signal-map.md"
    documents: list[dict[str, Any]] = []
    for node in catalog.get("nodes", []):
        name = clean_text(node.get("name"), 180) or clean_text(node.get("handle"), 180)
        handle = clean_text(node.get("handle"), 100)
        group = clean_text(node.get("group"), 60)
        role = clean_text(node.get("role"), 240) or "角色未标注"
        group_label = clean_text(category_labels.get(group), 100) or group
        followers = int(node.get("followers") or 0)
        incoming = int(node.get("incomingConnections") or 0)
        outgoing = int(node.get("outgoingConnections") or 0)
        website = clean_text(node.get("website"), 1000)
        summary = clean_text(
            f"MIT Bunny AI X 账号网络目录候选。快照角色：{role}；分类：{group_label}；"
            f"粉丝数：{followers:,}；图内入边：{incoming}；出边：{outgoing}。"
            "用于发现信息源，不等于内容质量、履历或观点已经核验。",
            760,
        )
        documents.append(
            {
                "id": stable_id("mitbunny", handle or name),
                "title": f"{name} (@{handle})" if handle else name,
                "category": "AI 行业情报与信息源",
                "sourceType": "mitbunny",
                "sourceLabel": "MIT Bunny X 账号目录",
                "tags": [
                    "MIT Bunny",
                    "X 信息源",
                    group_label,
                    role,
                    f"@{handle}" if handle else "",
                ][:12],
                "summary": summary,
                "searchText": clean_text(
                    f"{name} {handle} {group} {group_label} {role} {website} "
                    f"followers {followers} incoming {incoming} outgoing {outgoing} {summary}",
                    4000,
                ),
                "modified": modified,
                "status": "directory-candidate",
                "notePath": note_path,
                "sourcePath": catalog_path.relative_to(repo_root).as_posix(),
                "sourceUrl": clean_text(node.get("xUrl"), 1000),
                "valueScore": 64,
                "valueTier": "可用",
                "valueReason": "完整网络快照中的发现候选；使用前需回到账号和一手材料核验",
            }
        )
    return documents


def load_dwarkesh_sources(repo_root: Path) -> list[dict[str, Any]]:
    catalog_path = repo_root / "knowledge" / "dwarkesh-archive-index.json"
    if not catalog_path.exists():
        return []
    try:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []

    note_path = "notes/dwarkesh-archive-business-research-index-2026-07-14.md"
    synced = clean_text(catalog.get("syncedAt"), 40)
    documents: list[dict[str, Any]] = []
    for post in catalog.get("posts", []):
        title = clean_text(post.get("title"), 200) or clean_text(post.get("slug"), 160)
        subtitle = clean_text(post.get("subtitle"), 520)
        post_type = clean_text(post.get("type"), 40) or "archive"
        post_date = clean_text(post.get("postDate"), 40)
        summary = clean_text(
            f"Dwarkesh 公开归档目录项，类型：{post_type}。{subtitle} "
            "当前只保存公开标题、日期与链接；除综合笔记明确列出的代表内容外，不表示正文或访谈已逐条精读。",
            760,
        )
        documents.append(
            {
                "id": stable_id("dwarkesh", str(post.get("id") or post.get("slug") or title)),
                "title": title,
                "category": "AI 商业研究与访谈",
                "sourceType": "dwarkesh",
                "sourceLabel": "Dwarkesh 公开归档",
                "tags": ["Dwarkesh", "访谈", "研究", post_type],
                "summary": summary,
                "searchText": clean_text(f"{title} {subtitle} {post_type} {post_date}", 4000),
                "modified": post_date or synced,
                "status": "directory-candidate",
                "notePath": note_path,
                "sourcePath": catalog_path.relative_to(repo_root).as_posix(),
                "sourceUrl": clean_text(post.get("url"), 1000),
                "valueScore": 66,
                "valueTier": "可用",
                "valueReason": "公开归档元数据完整；代表内容已综合，其余条目需按问题精读",
            }
        )
    return documents


def build_index(repo_root: Path, legacy_root: Path, output: Path) -> dict[str, Any]:
    notes_root = repo_root / "notes"
    current = [parse_markdown(path, repo_root) for path in sorted(notes_root.rglob("*.md"))]
    legacy = load_legacy(legacy_root)
    waytoagi = load_waytoagi(repo_root)
    research = load_latent_papers(repo_root)
    xiaohongshu = load_xiaohongshu_sources(repo_root)
    mitbunny = load_mitbunny_sources(repo_root)
    dwarkesh = load_dwarkesh_sources(repo_root)
    documents = current + waytoagi + research + xiaohongshu + mitbunny + dwarkesh + legacy
    categories = Counter(doc["category"] for doc in documents)
    tiers = Counter(doc["valueTier"] for doc in documents)
    payload = {
        "schemaVersion": 1,
        "generatedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        "stats": {
            "documents": len(documents),
            "currentNotes": len(current),
            "waytoagiEntries": len(waytoagi),
            "researchEntries": len(research),
            "xiaohongshuEntries": len(xiaohongshu),
            "mitbunnyEntries": len(mitbunny),
            "dwarkeshEntries": len(dwarkesh),
            "legacyEntries": len(legacy),
            "categories": dict(sorted(categories.items(), key=lambda item: (-item[1], item[0]))),
            "tiers": dict(tiers),
        },
        "legacyRoot": str(legacy_root) if legacy else "",
        "documents": documents,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        "window.PERSONAL_KB_INDEX = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--legacy-root", type=Path, default=DEFAULT_LEGACY_ROOT)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    output = args.output or root / "knowledge" / "personal-kb-index.js"
    payload = build_index(root, args.legacy_root, output)
    print(
        f"Built {output} with {payload['stats']['documents']} documents "
        f"({payload['stats']['currentNotes']} current, {payload['stats']['waytoagiEntries']} WaytoAGI, "
        f"{payload['stats']['researchEntries']} research, {payload['stats']['xiaohongshuEntries']} Xiaohongshu, "
        f"{payload['stats']['mitbunnyEntries']} MIT Bunny, "
        f"{payload['stats']['dwarkeshEntries']} Dwarkesh, "
        f"{payload['stats']['legacyEntries']} legacy)."
    )


if __name__ == "__main__":
    main()
