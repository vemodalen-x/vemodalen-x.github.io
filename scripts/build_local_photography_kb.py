from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path


WORKSPACE = Path(__file__).resolve().parents[1]
PHOTO_ROOT = Path(r"C:\Users\User\Desktop\photograph")
PERSONALKB_ROOT = Path(r"C:\Users\User\Desktop\PersonalKB\01_Knowledge_Domains\Photography")
IMPORTED_NOTES_ROOT = Path(r"C:\Users\User\Desktop\PersonalKB\03_Imported_Notes")

OUTPUT_JS = WORKSPACE / "knowledge" / "local-photography-books-kb.js"
OUTPUT_MD = WORKSPACE / "notes" / f"local-photography-books-summary-{date.today().isoformat()}.md"

DOC_SUFFIXES = {".pdf", ".epub", ".md", ".html", ".txt"}


CATEGORY_PROFILES = {
    "01_入门基础与教材": {
        "id": "local-01-foundations",
        "domain": "learning",
        "title": "本机资料摘要：入门基础与教材",
        "tags": ["本机书籍", "入门", "教材", "曝光", "相机基础", "学习路径"],
        "summary": "这组资料是摄影学习的底座，覆盖相机基本操作、曝光、对焦、镜头常识、拍摄流程、综合教材和自学手册。适合作为查漏补缺和建立共同语言的第一层知识源。",
        "mentorUse": "当用户的问题暴露出曝光、对焦、景深、快门、ISO、文件格式或学习顺序不清时，优先检索这组资料，把建议落到参数取舍和基础练习。",
        "practice": "用一周重建基本功：每天只练一个变量，依次练曝光补偿、景深、运动模糊、对焦模式、测光、高光保护和选片复盘。",
        "questions": ["当前问题是概念不清，还是现场操作不稳定？", "参数服务的是景深、运动、噪声还是动态范围？", "是否需要先做基础练习再追求风格？"],
    },
    "02_相机镜头与拍摄技术": {
        "id": "local-02-camera-lens-technique",
        "domain": "computational",
        "title": "本机资料摘要：相机镜头与拍摄技术",
        "tags": ["本机书籍", "相机", "镜头", "参数", "术语", "实拍技术"],
        "summary": "这组资料偏向器材与现场拍摄技术，包含参数表、术语、镜头选择、实拍私藏技法等内容。它帮助把器材语言翻译成拍摄决策。",
        "mentorUse": "当用户问器材、焦段、镜头、相机设置或现场参数时，先用这组资料建立限制条件，再给出可验证的拍摄方案。",
        "practice": "选一个常用焦段连续拍 30 张，只改变拍摄距离和机位高度，记录透视、背景压缩和主体分离的变化。",
        "questions": ["这个器材选择解决什么画面问题？", "焦段、距离和背景关系是否比光圈更关键？", "参数表能否转化成现场检查清单？"],
    },
    "03_构图用光与色彩": {
        "id": "local-03-composition-light-color",
        "domain": "aesthetics",
        "title": "本机资料摘要：构图用光与色彩",
        "tags": ["本机书籍", "构图", "用光", "色彩", "曝光", "视觉层级"],
        "summary": "这组资料集中在画面组织、光线控制、色彩关系和曝光表达，包含构图学、摄影师视界、理解曝光、用光教程等。它是评片和审美训练的核心资料层。",
        "mentorUse": "当照片技术正确但不好看时，优先检索这组资料，从主体、光线方向、视觉重量、色彩层级和空间关系拆问题。",
        "practice": "同一场景拍三组：只改变构图、只改变光线方向、只改变主色关系。每组只选一张，写明取舍原因。",
        "questions": ["主体是否被光线和构图共同强调？", "画面最亮、最锐、最饱和处是否服务主题？", "色彩是统一情绪，还是制造干扰？"],
    },
    "04_人像婚礼儿童": {
        "id": "local-04-portrait-wedding-children",
        "domain": "genre",
        "title": "本机资料摘要：人像婚礼儿童",
        "tags": ["本机书籍", "人像", "婚礼", "儿童", "摆姿", "肤色", "布光"],
        "summary": "这组资料覆盖人像摆姿、人物沟通、婚礼现场、儿童摄影、自然光与灯光、肤色和人像后期。核心不是只追求虚化，而是让人物状态、光线和背景共同服务气质。",
        "mentorUse": "当用户拍人像、婚礼或儿童时，检索这组资料来处理表情、姿态、眼神光、肤色、背景秩序和交付流程。",
        "practice": "拍一组自然光人像：同一人分别在窗边、阴影边缘、侧逆光和开阔阴影下拍摄，比较眼神光、肤色和背景分离。",
        "questions": ["人物是否比背景更有光、更清楚、更有情绪？", "姿态是否自然解释人物，而不是僵硬摆拍？", "后期是否保留皮肤质感和真实体积？"],
    },
    "05_风光旅行纪实": {
        "id": "local-05-landscape-travel-documentary",
        "domain": "genre",
        "title": "本机资料摘要：风光旅行纪实",
        "tags": ["本机书籍", "风光", "旅行", "纪实", "专题", "天气", "叙事"],
        "summary": "这组资料面向风光、旅行、人文、微距、专题摄影和后期。重点是前期计划、光线窗口、机位经营、环境观察和用图片讲述关系。",
        "mentorUse": "当用户要拍旅行、风光或纪实时，检索这组资料输出拍摄计划：季节、天气、时间窗口、机位、前中后景、备选主题和后期尺度。",
        "practice": "选一个附近地点连续三次拍摄：晴天、阴天、雨后各一次。每次只保留 6 张，比较天气如何改变主题和色彩。",
        "questions": ["这张照片依赖哪一个自然条件？", "有没有前景、中景、远景和光线层次？", "纪实表达中后期是否改变关键事实？"],
    },
    "06_商业静物商品": {
        "id": "local-06-commercial-still-product",
        "domain": "genre",
        "title": "本机资料摘要：商业静物商品",
        "tags": ["本机书籍", "商业摄影", "静物", "商品", "电商", "修图", "布光"],
        "summary": "这组资料覆盖商业摄影、产品摄影、电商商品图、静物布光和商业后期。目标从好看转向可交付：质感、形体、颜色准确、边缘干净和卖点清楚。",
        "mentorUse": "当用户拍产品、静物或商业人像时，检索这组资料，把建议落到布光方案、背景控制、质感塑造、颜色准确和交付规格。",
        "practice": "用一个小产品练三种布光：柔光箱式、侧逆光勾边、顶光质感。每组输出原图、修图版和交付尺寸版。",
        "questions": ["照片是否清楚展示卖点和材质？", "颜色、形状和边缘是否可信？", "后期是增强商品，还是制造不真实期待？"],
    },
    "07_后期修图与工作流": {
        "id": "local-07-post-workflow",
        "domain": "post",
        "title": "本机资料摘要：后期修图与工作流",
        "tags": ["本机书籍", "Lightroom", "Photoshop", "后期", "调色", "工作流", "导出"],
        "summary": "这组资料集中在 Lightroom、Photoshop、影调、调色、局部调整、修片案例和完整后期流程。它适合把修图从滑块尝试变成可复盘的工作流。",
        "mentorUse": "当用户说照片修不出感觉、颜色脏、影调散、皮肤假或导出变色时，优先检索这组资料，用流程诊断而不是堆效果。",
        "practice": "选 5 张 RAW，每张按同一顺序处理：校正、白平衡、整体影调、主色、局部、细节、导出。记录每一步意图。",
        "questions": ["问题发生在全局校正、局部引导、色彩层级还是输出？", "每个局部调整是否有明确目的？", "最终尺寸下噪声、锐化和肤色是否自然？"],
    },
    "08_摄影史理论与视觉文化": {
        "id": "local-08-history-theory-culture",
        "domain": "learning",
        "title": "本机资料摘要：摄影史理论与视觉文化",
        "tags": ["本机书籍", "摄影史", "理论", "视觉文化", "观看方式", "创作观"],
        "summary": "这组资料偏向摄影史、图像理论、观看方式、艺术史和创作观。它不直接给参数，但能训练判断力：为什么这张图值得看，为什么某种表达成立。",
        "mentorUse": "当用户陷入只问参数或滤镜时，检索这组资料把问题拉回观看方式、主题、语境、真实边界和创作方法。",
        "practice": "每周选 5 张经典作品，只写三件事：图像事实、时代/语境、今天可借鉴的创作方法。",
        "questions": ["这张照片的观看方式是什么？", "它依赖技术奇观，还是依赖主题和语境？", "你的作品放在什么语境中被理解？"],
    },
    "09_摄影杂志与作品集": {
        "id": "local-09-magazines-portfolios",
        "domain": "aesthetics",
        "title": "本机资料摘要：摄影杂志与作品集",
        "tags": ["本机资料", "Aperture", "作品集", "大师访谈", "案例", "审美积累"],
        "summary": "这组资料包含摄影杂志、作品集、大师访谈和专题文摘。它适合做审美样本库，用来训练选片、专题结构、视觉语言和长期风格判断。",
        "mentorUse": "当用户需要提升审美、建立参考、做专题或学习大师作品时，检索这组资料，引导用户拆解题材、顺序、光线、色彩和叙事结构。",
        "practice": "从一本杂志或作品集中选 12 张图，按“开场、展开、转折、收束”重新排序，并说明每张图的功能。",
        "questions": ["这组作品靠什么形成统一性？", "单张好看和专题成立之间差了什么？", "哪些视觉策略能转化到你的题材？"],
    },
    "10_计算摄影与影像技术": {
        "id": "local-10-computational-imaging",
        "domain": "computational",
        "title": "本机资料摘要：计算摄影与影像技术",
        "tags": ["本机资料", "计算摄影", "AI", "成像管线", "HDR", "ISP", "多帧"],
        "summary": "这组资料是计算摄影与成像技术课程层资料，包含多讲 lecture、相机内渲染管线、AI 与深度学习在影像中的作用。它解释手机和相机背后的图像管线。",
        "mentorUse": "当用户问 RAW、HDR、夜景、多帧降噪、手机算法、AI 修图或相机直出时，检索这组资料，把问题定位到捕获、ISP、合成、tone mapping 或导出显示。",
        "practice": "同一低光高反差场景，用手机普通/HDR/夜景、相机 JPEG、相机 RAW 各拍一张，比较高光、暗部、噪声、鬼影和局部对比。",
        "questions": ["问题发生在捕获、多帧合成、RAW 解释、局部 tone mapping 还是导出？", "算法是否让画面变平或过度锐化？", "能否用前期曝光和稳定性提升输入质量？"],
    },
}


def file_uri(path: Path) -> str:
    try:
        return path.resolve().as_uri()
    except ValueError:
        return str(path)


def read_text(path: Path) -> str:
    for encoding in ("utf-8", "utf-8-sig", "gb18030"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    return path.read_text(errors="replace")


def format_size(num: int) -> str:
    value = float(num)
    for unit in ("B", "KB", "MB", "GB"):
        if value < 1024 or unit == "GB":
            return f"{value:.1f} {unit}" if unit != "B" else f"{int(value)} B"
        value /= 1024
    return f"{value:.1f} GB"


def clean_title(name: str) -> str:
    stem = Path(name).stem
    stem = re.sub(r"__[0-9a-f]{8}_2$", "", stem, flags=re.I)
    stem = re.sub(r"\s+--\s+[0-9a-f]{24,}.*$", "", stem)
    stem = stem.replace("Anna’s Archive", "").replace("Anna's Archive", "")
    stem = re.sub(r"\s{2,}", " ", stem).strip(" -")
    return stem or name


def list_category_files(category_dir: Path) -> list[dict]:
    files = []
    for path in sorted(category_dir.iterdir(), key=lambda p: p.name.lower()):
        if not path.is_file() or path.suffix.lower() not in DOC_SUFFIXES:
            continue
        files.append(
            {
                "title": clean_title(path.name),
                "fileName": path.name,
                "path": str(path),
                "url": file_uri(path),
                "size": path.stat().st_size,
                "sizeLabel": format_size(path.stat().st_size),
                "format": path.suffix.lower().lstrip("."),
            }
        )
    return files


def index_summary_for(category: str) -> str | None:
    if not PERSONALKB_ROOT.exists():
        return None
    prefix = category.split("_", 1)[0]
    matches = list(PERSONALKB_ROOT.glob(f"Photography_{prefix}*_Index.md"))
    if not matches:
        return None
    text = read_text(matches[0])
    summaries = []
    for line in text.splitlines():
        if not line.startswith("| ") or line.startswith("| 文件") or line.startswith("| ---"):
            continue
        parts = [part.strip() for part in line.strip().strip("|").split("|")]
        if len(parts) >= 2 and parts[1] and parts[1] not in summaries:
            summaries.append(parts[1])
    return "；".join(summaries[:3]) if summaries else None


def build_cards_and_sources() -> tuple[list[dict], list[dict], dict]:
    cards: list[dict] = []
    sources: list[dict] = []
    stats = {
        "totalFiles": 0,
        "totalBytes": 0,
        "categories": [],
    }

    for category_dir in sorted([p for p in PHOTO_ROOT.iterdir() if p.is_dir()], key=lambda p: p.name):
        profile = CATEGORY_PROFILES.get(category_dir.name)
        if not profile:
            continue
        files = list_category_files(category_dir)
        file_count = len(files)
        total_bytes = sum(item["size"] for item in files)
        stats["totalFiles"] += file_count
        stats["totalBytes"] += total_bytes
        stats["categories"].append(
            {
                "name": category_dir.name,
                "count": file_count,
                "bytes": total_bytes,
                "sizeLabel": format_size(total_bytes),
            }
        )
        source_id = profile["id"].replace("local-", "local-source-")
        sources.append(
            {
                "id": source_id,
                "title": f"本机摄影资料库：{category_dir.name}",
                "url": file_uri(category_dir),
                "type": "local photography book folder",
                "notes": f"{file_count} 个资料条目，合计 {format_size(total_bytes)}。摘要来自整理目录、PersonalKB 摄影索引和文件标题，不包含书籍全文。",
            }
        )
        existing_summary = index_summary_for(category_dir.name)
        summary = profile["summary"]
        if existing_summary and existing_summary not in summary:
            summary = f"{summary} 本机索引对这类资料的定位是：{existing_summary}"
        cards.append(
            {
                "id": profile["id"],
                "domain": profile["domain"],
                "title": f"{profile['title']}（{file_count}项）",
                "level": "local-summary",
                "tags": profile["tags"] + [category_dir.name, f"{file_count}项"],
                "summary": summary,
                "mentorUse": profile["mentorUse"],
                "practice": profile["practice"],
                "questions": profile["questions"],
                "sourceIds": [source_id],
                "localCategory": category_dir.name,
                "fileCount": file_count,
                "totalSize": format_size(total_bytes),
                "sourceFiles": files,
            }
        )

    extra_sources = []
    if PERSONALKB_ROOT.exists():
        extra_sources.append(
            {
                "id": "local-source-personalkb-photo-indexes",
                "title": "PersonalKB 摄影资料索引",
                "url": file_uri(PERSONALKB_ROOT),
                "type": "local markdown indexes",
                "notes": "10 个摄影分类索引，用于确认本机资料分类、条目数、阅读顺序和摘要级定位。",
            }
        )
    existing_index = PHOTO_ROOT / "摄影资料索引.html"
    if existing_index.exists():
        extra_sources.append(
            {
                "id": "local-source-photo-master-index",
                "title": "摄影资料索引.html",
                "url": file_uri(existing_index),
                "type": "local HTML index",
                "notes": "整理后的摄影资料总索引，包含 166 个归档资料条目、分类摘要和建议阅读顺序。",
            }
        )
    sources.extend(extra_sources)

    if extra_sources:
        cards.append(
            {
                "id": "local-00-reading-map",
                "domain": "learning",
                "title": "本机摄影资料的学习地图",
                "level": "local-summary",
                "tags": ["本机资料", "阅读顺序", "学习地图", "PersonalKB", "索引"],
                "summary": "本机资料已经整理成 10 个分类：基础教材、相机镜头、构图用光色彩、人像婚礼儿童、风光旅行纪实、商业静物商品、后期工作流、摄影史理论、杂志作品集、计算摄影。适合按“基础基本功、专项题材、后期流程、审美理论、计算摄影扩展”的顺序学习。",
                "mentorUse": "当用户只说想系统学摄影时，先用这张地图判断阶段，不要直接推荐杂志或高级后期。基础薄弱先读教材和构图用光；有题材目标再进入人像、风光或商业；后期混乱再进入工作流。",
                "practice": "从 10 类中只选 2 类作为本月主线：一类解决最大技术短板，一类解决最常拍题材。每周输出 6 张照片和一次复盘。",
                "questions": ["当前短板属于基础、题材、后期、审美还是计算摄影？", "本周要深读哪一类资料，而不是泛泛收藏？", "阅读后是否生成了自己的练习笔记？"],
                "sourceIds": [source["id"] for source in extra_sources],
                "totalFiles": stats["totalFiles"],
                "totalSize": format_size(stats["totalBytes"]),
            }
        )

    return cards, sources, stats


def collect_imported_notes() -> list[dict]:
    if not IMPORTED_NOTES_ROOT.exists():
        return []
    wanted = []
    for path in IMPORTED_NOTES_ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {".md", ".html", ".txt"}:
            continue
        lower = str(path).lower()
        if "摄影" in str(path) or "photo" in lower or "composition" in lower or path.name == "光圈.md":
            wanted.append(
                {
                    "title": clean_title(path.name),
                    "fileName": path.name,
                    "path": str(path),
                    "url": file_uri(path),
                    "sizeLabel": format_size(path.stat().st_size),
                    "format": path.suffix.lower().lstrip("."),
                }
            )
    return sorted(wanted, key=lambda item: item["path"].lower())


def write_js(cards: list[dict], sources: list[dict], stats: dict, notes: list[dict]) -> None:
    if notes:
        sources.append(
            {
                "id": "local-source-imported-photo-notes",
                "title": "PersonalKB 导入摄影笔记",
                "url": file_uri(IMPORTED_NOTES_ROOT),
                "type": "local imported notes",
                "notes": f"{len(notes)} 个摄影相关笔记或索引文件，作为本机资料的补充摘要来源。",
            }
        )
        cards.append(
            {
                "id": "local-11-imported-notes",
                "domain": "aesthetics",
                "title": f"本机资料摘要：导入摄影笔记（{len(notes)}项）",
                "level": "local-summary",
                "tags": ["本机笔记", "摄影", "构图", "光圈", "索引"],
                "summary": "PersonalKB 中还保留了摄影资料索引、光圈笔记和构图总结等导入资料。它们适合做快速复习和本机资料导航。",
                "mentorUse": "当用户需要快速查找本机资料或复习单个概念时，优先用这些笔记作为导航，再回到对应书籍或专题资料深读。",
                "practice": "把一条导入笔记扩写成完整知识卡：定义、适用场景、拍摄步骤、常见错误和一次练习。",
                "questions": ["这条笔记能否追溯到具体资料？", "它解决的是概念、操作还是审美判断？", "是否已经转成一次练习？"],
                "sourceIds": ["local-source-imported-photo-notes"],
                "sourceFiles": notes,
            }
        )

    payload = {
        "generatedAt": date.today().isoformat(),
        "version": date.today().strftime("%Y.%m.%d"),
        "title": "Local Photography Books and Materials Summary KB",
        "language": "zh-CN",
        "sourceRoot": str(PHOTO_ROOT),
        "usageBoundary": "Summary-level local RAG data. It lists and summarizes local books/materials without copying book contents.",
        "totalFiles": stats["totalFiles"],
        "totalSize": format_size(stats["totalBytes"]),
        "sources": sources,
        "cards": cards,
    }
    OUTPUT_JS.parent.mkdir(parents=True, exist_ok=True)
    text = "window.LOCAL_PHOTOGRAPHY_BOOKS_KB = "
    text += json.dumps(payload, ensure_ascii=False, indent=2)
    text += ";\n"
    OUTPUT_JS.write_text(text, encoding="utf-8")


def write_markdown(cards: list[dict], stats: dict, notes: list[dict]) -> None:
    lines = [
        "# 本机摄影书籍与资料摘要",
        "",
        f"- 生成日期：{date.today().isoformat()}",
        f"- 扫描主目录：`{PHOTO_ROOT}`",
        f"- 纳入资料：{stats['totalFiles']} 个文件，合计 {format_size(stats['totalBytes'])}",
        f"- 补充笔记：{len(notes)} 个 PersonalKB 导入笔记或索引",
        "",
        "## 方法与边界",
        "",
        "这份总结使用本机已整理的 `photograph` 资料库、PersonalKB 摄影分类索引和文件标题生成摘要级知识卡。它不复制书籍正文，也不把整本书内容搬进项目；多数 PDF 可能是扫描版，适合先作为 RAG 导航和学习地图。需要逐章深读时，可以再指定某一本书单独提取目录和笔记。",
        "",
        "## 总体学习地图",
        "",
        "建议按五段学习：先用入门教材和相机镜头资料补基本功；再用构图、用光、色彩建立评片语言；随后按人像、风光、商业等题材专项训练；后期资料用于建立 Lightroom/Photoshop 工作流；最后用摄影史、作品集和计算摄影扩展审美与技术理解。",
        "",
    ]

    for card in cards:
        if not card.get("localCategory"):
            continue
        lines.extend(
            [
                f"## {card['title']}",
                "",
                f"- 分类：`{card['localCategory']}`",
                f"- 数量：{card['fileCount']} 项",
                f"- 合计大小：{card['totalSize']}",
                f"- 摘要：{card['summary']}",
                f"- Mentor 用法：{card['mentorUse']}",
                f"- 推荐练习：{card['practice']}",
                "",
                "### 文件清单",
                "",
            ]
        )
        for item in card.get("sourceFiles", []):
            lines.append(f"- `{item['title']}` ({item['format']}, {item['sizeLabel']})")
        lines.append("")

    if notes:
        lines.extend(["## PersonalKB 导入笔记", ""])
        for item in notes:
            lines.append(f"- `{item['title']}` ({item['format']}, {item['sizeLabel']}) - `{item['path']}`")
        lines.append("")

    OUTPUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_MD.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    if not PHOTO_ROOT.exists():
        raise SystemExit(f"Missing photography library: {PHOTO_ROOT}")
    cards, sources, stats = build_cards_and_sources()
    notes = collect_imported_notes()
    write_js(cards, sources, stats, notes)
    write_markdown(cards, stats, notes)
    print(
        json.dumps(
            {
                "js": str(OUTPUT_JS),
                "markdown": str(OUTPUT_MD),
                "cards": len(cards),
                "sources": len(sources),
                "files": stats["totalFiles"],
                "size": format_size(stats["totalBytes"]),
                "notes": len(notes),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
