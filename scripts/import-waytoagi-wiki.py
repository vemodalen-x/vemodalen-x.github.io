"""Import the public WaytoAGI Feishu Wiki catalogue into the local knowledge base.

The importer intentionally stores page metadata and links instead of mirroring full
third-party articles. Curated synthesis notes live beside the generated catalogue.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import sys
import threading
import time
from collections import Counter, deque
from datetime import datetime
from pathlib import Path
from typing import Any

import requests


ROOT_WIKI_TOKEN = "QPe5w5g7UisbEkkow8XcDmOpn8e"
SPACE_ID = "7226178700923011075"
BASE_URL = "https://waytoagi.feishu.cn"
ROOT_URL = f"{BASE_URL}/wiki/{ROOT_WIKI_TOKEN}"
VIRTUAL_ROOT_TOKEN = "FEtdwJUAViQRYYkgGvEcyFMenEb"

OBJECT_TYPES = {
    3: "表格",
    8: "多维表格",
    12: "思维笔记",
    22: "文档",
    23: "目录根节点",
    30: "文件",
}


class FeishuWikiClient:
    def __init__(self, min_interval: float = 0.18) -> None:
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 Chrome/138.0 Safari/537.36"
                ),
                "Accept-Language": "zh-CN,zh;q=0.9",
            }
        )
        self.min_interval = min_interval
        self.last_request = 0.0
        self.rate_lock = threading.Lock()
        self.bootstrap()

    def bootstrap(self) -> None:
        response = self.session.get(ROOT_URL, timeout=45)
        response.raise_for_status()

    def get_json(self, path: str, params: dict[str, str]) -> dict[str, Any]:
        last_error = "unknown error"
        for attempt in range(10):
            with self.rate_lock:
                wait = self.min_interval - (time.monotonic() - self.last_request)
                if wait > 0:
                    time.sleep(wait)
                self.last_request = time.monotonic()
            try:
                response = self.session.get(
                    f"{BASE_URL}{path}",
                    params=params,
                    headers={"Referer": ROOT_URL},
                    timeout=30,
                )
                if response.status_code == 429:
                    last_error = "HTTP 429"
                    time.sleep(min(5.0, 0.8 + attempt * 0.45))
                    continue
                response.raise_for_status()
                payload = response.json()
                if payload.get("code") == 0:
                    return payload
                last_error = f"API {payload.get('code')}: {payload.get('msg')}"
                if payload.get("code") == 5:
                    self.bootstrap()
            except (requests.RequestException, ValueError) as error:
                last_error = str(error)
            time.sleep(min(5.0, 0.7 + attempt * 0.55))
        raise RuntimeError(f"Feishu request failed after retries: {last_error}")

    def initial_tree(self) -> dict[str, Any]:
        payload = self.get_json(
            "/space/api/wiki/v2/tree/get_info/",
            {
                "space_id": SPACE_ID,
                "with_space": "true",
                "with_perm": "true",
                "expand_shortcut": "true",
                "need_shared": "true",
                "exclude_fields": "5",
                "with_deleted": "true",
                "wiki_token": ROOT_WIKI_TOKEN,
            },
        )
        return payload["data"]["tree"]

    def children(self, token: str) -> list[dict[str, Any]]:
        payload = self.get_json(
            "/space/api/wiki/v2/tree/get_node_child/",
            {
                "space_id": SPACE_ID,
                "wiki_token": token,
                "expand_shortcut": "true",
                "exclude_fields": "5",
                "is_pre_heating": "false",
            },
        )
        return payload.get("data", {}).get(token, [])


def iso_timestamp(value: Any) -> str:
    try:
        return datetime.fromtimestamp(int(value)).astimezone().isoformat(timespec="seconds")
    except (TypeError, ValueError, OSError):
        return ""


def classify(title: str, path: str) -> str:
    text = f"{path} {title}".lower()
    rules = [
        (
            "AI 学习、提示词与智能体",
            ("入门", "学习路径", "prompt", "提示词", "agent", "智能体", "ai 编程", "cli", "共学", "训练营"),
        ),
        (
            "AI 视觉、视频与声音创作",
            ("绘画", "图像", "视频", "音乐", "数字人", "语音", "3d", "comfyui", "短剧", "seedance", "seedream"),
        ),
        (
            "AI 研究、论文与数据",
            ("教育", "研究报告", "论文", "数据", "播客", "资讯", "藏经阁", "专栏", "top论文"),
        ),
        (
            "AI 产品、商业与增长",
            ("出海", "融资", "产品案例", "商业化", "解决方案", "招聘", "组队", "企业", "增长", "gtm", "创业"),
        ),
        (
            "AI 工具、工作流与前沿硬件",
            ("工具", "工作流", "硬件", "空间计算", "vr", "机器人", "mcp", "skill"),
        ),
        (
            "AI 动态、法规与治理",
            ("新闻", "动态", "周刊", "法规", "安全", "伦理", "治理"),
        ),
        (
            "WaytoAGI 社区与共创",
            ("社区", "活动", "比赛", "高校", "关于", "致谢", "历史更新", "孵化", "直播", "切磋"),
        ),
    ]
    for category, needles in rules:
        if any(needle in text for needle in needles):
            return category
    return "AI 综合资源与导航"


def build_paths(nodes: dict[str, dict[str, Any]]) -> dict[str, list[str]]:
    cache: dict[str, list[str]] = {}

    def resolve(token: str, active: set[str] | None = None) -> list[str]:
        if token in cache:
            return cache[token]
        active = active or set()
        if token in active:
            return [nodes.get(token, {}).get("title") or token]
        active.add(token)
        node = nodes.get(token, {})
        title = str(node.get("title") or "").strip()
        parent = node.get("parent_wiki_token")
        if not parent or parent == VIRTUAL_ROOT_TOKEN or parent not in nodes:
            result = [title] if title else []
        else:
            result = resolve(parent, active) + ([title] if title else [])
        cache[token] = result
        return result

    for token in nodes:
        resolve(token)
    return cache


def compact_node(token: str, node: dict[str, Any], path_parts: list[str]) -> dict[str, Any]:
    title = str(node.get("title") or "未命名页面").strip()
    path = " / ".join(part for part in path_parts if part)
    detail = node.get("detail_info") or {}
    category = classify(title, path)
    depth = max(0, len(path_parts) - 1)
    score = 86 if depth == 0 else 78 if depth == 1 else 70
    if category == "AI 动态、法规与治理" and any(word in title for word in ("日报", "每日", "新闻", "更新")):
        score = min(score, 64)
    return {
        "id": f"waytoagi-{token}",
        "wikiToken": token,
        "title": title,
        "url": node.get("url") or f"{BASE_URL}/wiki/{token}",
        "category": category,
        "path": path,
        "depth": depth,
        "objectType": OBJECT_TYPES.get(node.get("obj_type"), f"类型 {node.get('obj_type')}"),
        "objectTypeCode": node.get("obj_type"),
        "hasChild": bool(node.get("has_child")),
        "nodeType": node.get("wiki_node_type"),
        "updated": iso_timestamp(detail.get("edit_time")),
        "valueScore": score,
    }


def write_catalog(
    output: Path,
    nodes: dict[str, dict[str, Any]],
    child_map: dict[str, list[str]],
    failures: dict[str, str],
) -> dict[str, Any]:
    paths = build_paths(nodes)
    records = [compact_node(token, node, paths[token]) for token, node in nodes.items() if token != VIRTUAL_ROOT_TOKEN]
    records.sort(key=lambda item: (item["path"], item["title"]))
    categories = Counter(item["category"] for item in records)
    object_types = Counter(item["objectType"] for item in records)
    payload = {
        "schemaVersion": 1,
        "source": {
            "name": "WaytoAGI | 通往 AGI 之路",
            "url": ROOT_URL,
            "spaceId": SPACE_ID,
            "rootWikiToken": ROOT_WIKI_TOKEN,
            "importPolicy": "保存公开目录元数据与来源链接；第三方原文不做整站镜像。",
        },
        "generatedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        "stats": {
            "nodes": len(records),
            "parents": len(child_map),
            "failedParents": len(failures),
            "categories": dict(categories.most_common()),
            "objectTypes": dict(object_types.most_common()),
        },
        "failedParents": failures,
        "records": records,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return payload


def markdown_escape(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ").strip()


def write_source_index(output: Path, catalog: dict[str, Any]) -> None:
    records = catalog["records"]
    grouped: dict[str, list[dict[str, Any]]] = {}
    for record in records:
        grouped.setdefault(record["category"], []).append(record)
    lines = [
        "---",
        "title: WaytoAGI 全量公开目录索引",
        f"date: {datetime.now().astimezone().date().isoformat()}",
        "type: source-index",
        "status: active",
        f"source: {ROOT_URL}",
        "summary: WaytoAGI 飞书 Wiki 的公开页面目录、分类、层级、更新时间与原链接。",
        "tags:",
        "  - WaytoAGI",
        "  - AI学习",
        "  - 来源索引",
        "---",
        "",
        "# WaytoAGI 全量公开目录索引",
        "",
        f"> 本次索引共收录 **{len(records)}** 个公开节点。这里保存目录元数据和可追溯链接，不复制第三方整站原文。详细提炼见同目录的主题笔记。",
        "",
        "## 使用方式",
        "",
        "- 先搜索问题，再沿目录路径判断上下文。",
        "- 对会快速变化的模型、工具、价格和法规，必须打开原链接核验更新时间。",
        "- 将真正解决过个人问题的内容提升为方法卡；不要把收藏数量当成掌握程度。",
        "",
        "## 分类统计",
        "",
        "| 分类 | 节点数 |",
        "|---|---:|",
    ]
    for category, count in catalog["stats"]["categories"].items():
        lines.append(f"| {markdown_escape(category)} | {count} |")
    for category, items in grouped.items():
        lines.extend(
            [
                "",
                f"## {category} ({len(items)})",
                "",
                "| 页面 | 目录路径 | 类型 | 更新日期 |",
                "|---|---|---|---|",
            ]
        )
        for item in items:
            title = markdown_escape(item["title"])
            path = markdown_escape(item["path"])
            updated = str(item["updated"])[:10]
            lines.append(f"| [{title}]({item['url']}) | {path} | {item['objectType']} | {updated} |")
    lines.append("")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines), encoding="utf-8")


def checkpoint_write(
    path: Path,
    nodes: dict[str, dict[str, Any]],
    child_map: dict[str, list[str]],
    fetched: set[str],
    failures: dict[str, str],
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {"nodes": nodes, "childMap": child_map, "fetched": sorted(fetched), "failures": failures},
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )


def crawl(
    client: FeishuWikiClient,
    checkpoint: Path,
    workers: int,
) -> tuple[dict[str, Any], dict[str, list[str]], dict[str, str]]:
    tree = client.initial_tree()
    nodes = dict(tree.get("nodes") or {})
    child_map = {token: list(children) for token, children in (tree.get("child_map") or {}).items()}
    fetched = set(child_map)
    failures: dict[str, str] = {}

    if checkpoint.exists():
        try:
            saved = json.loads(checkpoint.read_text(encoding="utf-8"))
            nodes.update(saved.get("nodes") or {})
            child_map.update(saved.get("childMap") or {})
            fetched.update(saved.get("fetched") or [])
            failures.update(saved.get("failures") or {})
            fetched.difference_update(failures)
        except (OSError, ValueError):
            print("Ignoring unreadable checkpoint.", file=sys.stderr)

    queue = deque(
        token for token, node in nodes.items() if node.get("has_child") and token not in fetched
    )
    queued = set(queue)
    request_count = 0
    print(f"Starting WaytoAGI crawl: {len(nodes)} known nodes, {len(queue)} parents pending.")
    while queue:
        batch = []
        while queue and len(batch) < workers:
            token = queue.popleft()
            queued.discard(token)
            batch.append(token)

        def fetch(token: str) -> tuple[str, list[dict[str, Any]], str]:
            try:
                return token, client.children(token), ""
            except RuntimeError as error:
                return token, [], str(error)

        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
            results = list(executor.map(fetch, batch))
        for token, children, error in results:
            if error:
                failures[token] = error
                fetched.add(token)
                continue
            child_map[token] = []
            failures.pop(token, None)
            for child in children:
                child_token = child.get("wiki_token")
                if not child_token:
                    continue
                child_map[token].append(child_token)
                if child_token not in nodes:
                    nodes[child_token] = child
                if child.get("has_child") and child_token not in fetched and child_token not in queued:
                    queue.append(child_token)
                    queued.add(child_token)
            fetched.add(token)
        request_count += len(batch)
        if request_count % 20 < len(batch) or not queue:
            checkpoint_write(checkpoint, nodes, child_map, fetched, failures)
            print(
                f"  parents={request_count} nodes={len(nodes)} pending={len(queue)} failures={len(failures)}",
                flush=True,
            )
    return nodes, child_map, failures


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    repo_root = Path(__file__).resolve().parents[1]
    parser.add_argument("--output", type=Path, default=repo_root / "knowledge" / "waytoagi-catalog.json")
    parser.add_argument(
        "--source-index",
        type=Path,
        default=repo_root / "notes" / "waytoagi" / "00-waytoagi-source-index.md",
    )
    parser.add_argument(
        "--checkpoint",
        type=Path,
        default=repo_root / "outputs" / "waytoagi-import.checkpoint.json",
    )
    parser.add_argument("--min-interval", type=float, default=0.18)
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()

    client = FeishuWikiClient(min_interval=max(0.05, args.min_interval))
    nodes, child_map, failures = crawl(client, args.checkpoint, max(1, min(8, args.workers)))
    catalog = write_catalog(args.output, nodes, child_map, failures)
    write_source_index(args.source_index, catalog)
    print(
        f"Imported {catalog['stats']['nodes']} public nodes into {args.output}; "
        f"generated source index at {args.source_index}."
    )
    if failures:
        print(f"Warning: {len(failures)} parent nodes failed. Re-run to retry them.", file=sys.stderr)


if __name__ == "__main__":
    main()
