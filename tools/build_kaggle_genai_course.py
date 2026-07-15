"""Normalize the Kaggle 5-Day Gen AI livestream playlist for offline study.

The source videos and automatic captions are acquired with yt-dlp. This script
deduplicates YouTube's rolling VTT captions, groups them into minute-level
transcript blocks, and combines those blocks with a reviewed Chinese learning
guide and selected frames extracted from the videos.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = ROOT / "tools" / "data" / "kaggle_genai_source"
FRAME_ROOT = ROOT / "tools" / "data" / "kaggle_genai_frames"
OUTPUT = ROOT / "tools" / "data" / "kaggle_genai_course_snapshot.json"
PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLqFaTIg4myu-b1PlxitQdY0UYIbys-2es"
SNAPSHOT_DATE = "2026-07-15"

TIME_PATTERN = re.compile(r"(?:(\d+):)?(\d+):(\d+\.\d+)")
TAG_PATTERN = re.compile(r"<[^>]+>")
TOKEN_PATTERN = re.compile(r"[^a-z0-9]+")


DAY_GUIDES = {
    "kpRyiJUUFxY": {
        "day": 1,
        "topic": "基础模型与 Prompt Engineering",
        "category": "Large foundation models",
        "summary": "从生成式基础模型和多模态能力进入 Gemini API，重点解释解码参数、对话历史、结构化输出和 Chain-of-Thought 等提示策略如何改变模型行为。",
        "learning_chapters": [
            {"start": 0, "title": "课程定位与基础模型专家讨论", "note": "讨论多模态生成、模型规模、推理时搜索与生成式 AI 应用。"},
            {"start": 2115, "title": "Prompting codelab", "note": "从单轮生成、chat history 进入 max tokens、temperature 和提示结构。"},
            {"start": 3000, "title": "结构化输出与推理提示", "note": "演示 JSON 输出和 Chain-of-Thought 对需要中间步骤任务的影响。"},
            {"start": 3298, "title": "Pop quiz 与复盘", "note": "检查生成参数、Prompt 技术和基础模型概念。"},
        ],
        "key_points": [
            "LLM 输出来自逐 token 概率分布；temperature、输出长度和采样设置改变确定性、多样性与成本。",
            "多轮接口依赖显式保存的 conversation history；记住用户信息是应用状态设计，不是长期记忆能力证明。",
            "结构化 JSON 输出应按 schema 解析和验证，不能只凭肉眼判断格式正确。",
            "Chain-of-Thought 可帮助需要中间步骤的任务，但仍应以最终答案、步骤一致性和独立 verifier 评测。",
            "Prompt 模板、模型版本、生成参数和评测集必须共同版本化，否则实验不可复现。",
        ],
        "experiments": [
            "固定模型和数据，比较 temperature、max output tokens 与 top-p 对正确率、重复率、延迟和成本的影响。",
            "让模型输出固定 JSON schema，统计解析成功率、字段完整率和语义正确率。",
            "比较 direct answer、few-shot 与 Chain-of-Thought，并加入答案 verifier，避免只看展示样例。",
        ],
        "frames": [
            {"file": "day01_t2250.jpg", "time": 2250, "caption": "Day 1 Prompting codelab：从 Gemini API 的基础生成进入可执行 notebook。"},
            {"file": "day01_t3060.jpg", "time": 3060, "caption": "结构化输出与推理提示示例：把自然语言响应转成可验证程序接口。"},
        ],
        "resources": [
            {"title": "Foundational Large Language Models & Text Generation", "url": "https://www.kaggle.com/whitepaper-foundational-llm-and-text-generation", "kind": "whitepaper", "priority": "must-read"},
            {"title": "Prompt Engineering", "url": "https://www.kaggle.com/whitepaper-prompt-engineering", "kind": "whitepaper", "priority": "must-read"},
            {"title": "Day 1 Prompting codelab", "url": "https://www.kaggle.com/code/markishere/day-1-prompting", "kind": "codelab", "priority": "must-read"},
            {"title": "Foundational LLM summary podcast", "url": "https://youtu.be/mQDlCZZsOyo", "kind": "podcast", "priority": "optional"},
            {"title": "Prompt Engineering summary podcast", "url": "https://youtu.be/F_hJ2Ey4BNc", "kind": "podcast", "priority": "optional"},
        ],
    },
    "86GZC56rQCc": {
        "day": 2,
        "topic": "Embeddings、Vector Stores 与 RAG",
        "category": "Data, representation, and generalization",
        "summary": "把文本映射到可比较的向量空间，并从语义相似度、分类和文档问答推进到 exact/approximate nearest-neighbor search、向量数据库与检索增强生成。",
        "learning_chapters": [
            {"start": 0, "title": "Embeddings 与 codelab 概览", "note": "说明向量表示、相似度和下游分类。"},
            {"start": 324, "title": "Document QA with RAG", "note": "拆解文档切分、embedding、检索、上下文注入和回答生成。"},
            {"start": 713, "title": "Embedding 几何与分类", "note": "用相似度热力图和分类网络观察表示空间。"},
            {"start": 1078, "title": "Vector database 与 ANN", "note": "比较 exact NN 和 approximate NN 的准确率、延迟和规模。"},
            {"start": 2016, "title": "Retrieval 与 decoder embedding", "note": "讨论 encoder/decoder 表示、传统方法和生产检索。"},
            {"start": 2544, "title": "Pop quiz", "note": "复盘 LSH、向量检索与 embedding 基础。"},
        ],
        "key_points": [
            "Embedding 把离散内容映射到连续空间；相似度只在模型、归一化、距离函数和任务定义一致时可比较。",
            "Exact nearest-neighbor search 随向量规模增长成本过高，ANN 用可控召回损失换取数量级的查询加速。",
            "向量数据库的价值不止是存储，还包括索引、过滤、更新、权限、混合检索和与业务数据库的一致性。",
            "RAG 是检索和生成的组合系统；检索召回、chunking、上下文排序与回答忠实度必须分层评测。",
            "Decoder-only LLM 可以被适配为 embedding 模型，但不能默认其表示优于专用 encoder，必须做任务级基准。",
        ],
        "experiments": [
            "建立 100–1000 条小语料，比较 cosine/dot/L2、不同 chunk size 与 top-k 对 retrieval recall 的影响。",
            "构建 RAG 问答，分别测检索命中、引用支持率、无答案拒答和端到端延迟。",
            "用同一 embedding 做相似度、聚类和分类，检查表示是否真的迁移到目标任务。",
        ],
        "frames": [
            {"file": "day02_t330.jpg", "time": 330, "caption": "Document Q&A with RAG codelab：把检索、上下文和生成组织成端到端管线。"},
            {"file": "day02_t630.jpg", "time": 630, "caption": "语义相似度热力图：直观看 embedding 空间中句子间的相对距离。"},
        ],
        "resources": [
            {"title": "Embeddings and Vector Stores/Databases", "url": "https://kaggle.com/whitepaper-embeddings-and-vector-stores", "kind": "whitepaper", "priority": "must-read"},
            {"title": "Document Q&A with RAG", "url": "https://www.kaggle.com/code/markishere/day-2-document-q-a-with-rag", "kind": "codelab", "priority": "must-read"},
            {"title": "Embeddings and similarity scores", "url": "https://www.kaggle.com/code/markishere/day-2-embeddings-and-similarity-scores", "kind": "codelab", "priority": "must-read"},
            {"title": "Classifying embeddings with Keras", "url": "https://www.kaggle.com/code/markishere/day-2-classifying-embeddings-with-keras", "kind": "codelab", "priority": "recommended"},
            {"title": "Attention Is All You Need", "url": "https://arxiv.org/abs/1706.03762", "kind": "paper", "priority": "recommended"},
            {"title": "BERT", "url": "https://arxiv.org/abs/1810.04805", "kind": "paper", "priority": "recommended"},
            {"title": "NV-Embed", "url": "https://arxiv.org/abs/2405.17428", "kind": "paper", "priority": "recommended"},
            {"title": "ScaNN for AlloyDB whitepaper", "url": "https://services.google.com/fh/files/misc/scann_for_alloydb_whitepaper.pdf", "kind": "whitepaper", "priority": "optional"},
        ],
    },
    "HQUtMWoTAD4": {
        "day": 3,
        "topic": "Generative AI Agents",
        "category": "Interactive agents and Human-AI interaction",
        "summary": "从工具类型和函数 schema 出发，演示 Gemini 自动函数调用、数据库 Agent 和 LangGraph 状态图，并把 tool selection、重试、日志和简单系统设计纳入生产讨论。",
        "learning_chapters": [
            {"start": 0, "title": "Agent 架构与工具类型", "note": "区分 extensions、functions 和 data sources，并讨论 targeted learning。"},
            {"start": 446, "title": "Gemini function calling", "note": "把 SQLite 函数暴露为工具，让模型从自然语言生成调用参数。"},
            {"start": 1052, "title": "LangGraph barista Agent", "note": "使用 node、edge、状态和指令构造多轮任务流。"},
            {"start": 1500, "title": "专家 Q&A", "note": "讨论 NotebookLM、tool evaluation、延迟与系统复杂度。"},
            {"start": 3353, "title": "Pop quiz", "note": "复盘工具、编排与 specialized agents。"},
        ],
        "key_points": [
            "工具 schema 必须解释函数用途、参数语义和输出；模型能调用接口不代表参数和副作用正确。",
            "数据库 Agent 的最小闭环是 schema inspection、query generation、execution、observation 和 follow-up context。",
            "LangGraph 用 node/edge 表达控制流，用显式状态支持多轮 order、重试和条件分支。",
            "生产评测应记录 tool selection、参数、返回值、重试、延迟和最终任务成功，不能只评最终文本。",
            "系统复杂度要服从用户结果；缓存或确定性检索能解决的问题，不必强行升级成多 Agent。",
        ],
        "experiments": [
            "为 SQLite 数据库实现只读工具 Agent，加入 schema 白名单、参数验证和超时，并保存完整 trace。",
            "比较单次 function call 与 LangGraph 多步流程的成功率、延迟、成本和恢复能力。",
            "建立 30 条 adversarial tool queries，测试错误表名、空结果、注入和重复副作用。",
        ],
        "frames": [
            {"file": "day03_t720.jpg", "time": 720, "caption": "Function calling codelab：定义数据库函数及参数，供 Gemini 生成结构化工具调用。"},
            {"file": "day03_t1080.jpg", "time": 1080, "caption": "LangGraph Agent notebook：用 graph、state 和节点组织多轮任务。"},
        ],
        "resources": [
            {"title": "Generative AI Agents", "url": "https://www.kaggle.com/whitepaper-agents", "kind": "whitepaper", "priority": "must-read"},
            {"title": "Function calling with the Gemini API", "url": "https://www.kaggle.com/code/markishere/day-3-function-calling-with-the-gemini-api", "kind": "codelab", "priority": "must-read"},
            {"title": "Building an agent with LangGraph", "url": "https://www.kaggle.com/code/markishere/day-3-building-an-agent-with-langgraph/", "kind": "codelab", "priority": "must-read"},
            {"title": "LangGraph", "url": "https://www.langchain.com/langgraph", "kind": "framework", "priority": "recommended"},
            {"title": "Firebase Genkit", "url": "https://firebase.google.com/docs/genkit", "kind": "framework", "priority": "optional"},
            {"title": "Breadboard", "url": "https://github.com/breadboard-ai/breadboard", "kind": "framework", "priority": "optional"},
            {"title": "Retrieval-augmented generation overview", "url": "https://cloud.google.com/use-cases/retrieval-augmented-generation", "kind": "guide", "priority": "recommended"},
        ],
    },
    "odvuLMJWUSU": {
        "day": 4,
        "topic": "Domain-Specific LLMs",
        "category": "Large foundation models",
        "summary": "以医疗与安全模型为案例，对比 search grounding、参数高效微调和通用/领域模型取舍，并讨论敏感数据、对抗输入、可解释性和专家验证。",
        "learning_chapters": [
            {"start": 0, "title": "领域模型、Med-PaLM 与 Sec-PaLM", "note": "说明领域数据、推理框架、责任部署和评测要求。"},
            {"start": 421, "title": "Google Search grounding", "note": "演示来源、citation attribution 和按需动态 grounding。"},
            {"start": 712, "title": "Parameter-efficient fine-tuning", "note": "使用标注数据适配任务，并讨论质量、token 与成本。"},
            {"start": 1044, "title": "领域专家 Q&A", "note": "讨论安全、医疗 benchmark、模型取舍、注入防护和验证负担。"},
            {"start": 3449, "title": "Pop quiz", "note": "复盘领域模型、数据和安全设计。"},
        ],
        "key_points": [
            "Grounding 提供来源和可追溯片段，但 citation 存在不等于推理正确，专家仍需验证引用是否支持结论。",
            "参数高效微调适合稳定格式或专门任务；先与 prompt、RAG 和工具增强做同预算比较。",
            "医疗与安全数据通常稀缺、敏感且分布变化快，数据治理和 access control 是模型设计的一部分。",
            "通用大模型和领域模型应按质量、延迟、成本、隐私和更新频率联合选择。",
            "面对 prompt injection，可通过任务分解、最小权限和结构化中间输出限制攻击影响范围。",
        ],
        "experiments": [
            "同一领域任务比较 prompt-only、grounding/RAG 与 PEFT，统一报告质量、延迟、token、维护成本和失败模式。",
            "对 grounded answer 做 citation entailment 检查：来源存在、片段相关、结论被支持。",
            "设计敏感领域红队集，覆盖越权请求、提示注入、数据外泄和错误自动化行动。",
        ],
        "frames": [
            {"file": "day04_t450.jpg", "time": 450, "caption": "Search grounding codelab：为回答附加检索来源与可追溯引用。"},
            {"file": "day04_t660.jpg", "time": 660, "caption": "Grounding notebook：区分静态 grounding 与按回答需要触发的动态 grounding。"},
        ],
        "resources": [
            {"title": "Solving Domain-Specific Problems Using LLMs", "url": "https://www.kaggle.com/whitepaper-solving-domains-specific-problems-using-llms", "kind": "whitepaper", "priority": "must-read"},
            {"title": "Google Search grounding codelab", "url": "https://www.kaggle.com/code/markishere/day-4-google-search-grounding", "kind": "codelab", "priority": "recommended"},
            {"title": "Fine-tuning a custom model", "url": "https://www.kaggle.com/code/markishere/day-4-fine-tuning-a-custom-model", "kind": "codelab", "priority": "must-read"},
            {"title": "Domain-specific LLM summary podcast", "url": "https://youtu.be/b1a4ZOQ8XdI", "kind": "podcast", "priority": "optional"},
        ],
    },
    "uCFW0i9xrBc": {
        "day": 5,
        "topic": "MLOps for Generative AI",
        "category": "AI research foundations",
        "summary": "从 prototype-to-production 差距出发，把评测、部署、CI/CD、版本化、可观测性、用户反馈和生成式模型特有的无唯一真值问题组织成生产闭环。",
        "learning_chapters": [
            {"start": 0, "title": "GenAI MLOps 白皮书复盘", "note": "覆盖数据、Prompt、模型、RAG、Agent 与应用的版本和评测。"},
            {"start": 555, "title": "Agent Starter Pack demo", "note": "演示模板化基础设施、测试、部署、延迟/吞吐检查和监控。"},
            {"start": 1140, "title": "生产与评测专家 Q&A", "note": "讨论文本/图像评测、managed services、监控、BigQuery 与 Vertex AI。"},
            {"start": 3268, "title": "Pop quiz 与课程收束", "note": "复盘 chaining、MLOps 和生产生命周期。"},
        ],
        "key_points": [
            "GenAI 原型容易，生产难点集中在 deployment、evaluation、customization/security 和 observability。",
            "Starter Pack 把模板、Git 流程、单元/集成测试、容器检查、延迟/吞吐和部署纳入同一流水线。",
            "生成文本或图像通常没有唯一 ground truth，需组合自动指标、rubric judge、side-by-side 和人工评审。",
            "Prompt、检索索引、工具、模型和数据都可能独立变化，必须建立端到端版本和回归矩阵。",
            "线上监控要连接质量、延迟、成本、安全事件和用户反馈，并能把失败样本回流评测与训练。",
        ],
        "experiments": [
            "为一个 RAG/Agent 应用建立 CI：schema/unit test、离线评测、容器构建、延迟门槛和灰度回滚。",
            "对同一生成任务比较 BLEU/ROUGE、embedding 指标、LLM judge 与人工偏好，记录不一致案例。",
            "定义线上 dashboard：p50/p95、token/请求、工具错误率、grounding 支持率、用户反馈和单位成本。",
        ],
        "frames": [
            {"file": "day05_t600.jpg", "time": 600, "caption": "E2E Gen AI App Starter Pack：用模板缩短从原型到生产的基础设施搭建时间。"},
            {"file": "day05_t780.jpg", "time": 780, "caption": "Starter Pack 仓库 walkthrough：把 evaluation、LLM、data、backend 与部署组织成高层架构。"},
        ],
        "resources": [
            {"title": "MLOps for Generative AI", "url": "https://www.kaggle.com/whitepaper-operationalizing-generative-ai-on-vertex-ai-using-mlops", "kind": "whitepaper", "priority": "must-read"},
            {"title": "GoogleCloudPlatform Agent Starter Pack", "url": "https://github.com/GoogleCloudPlatform/agent-starter-pack", "kind": "repository", "priority": "must-read"},
            {"title": "Vertex AI GenAI evaluation service", "url": "https://cloud.google.com/vertex-ai/generative-ai/docs/models/evaluation-overview", "kind": "guide", "priority": "recommended"},
            {"title": "Gecko: Versatile Text-to-Image Benchmark", "url": "https://arxiv.org/abs/2404.16820", "kind": "paper", "priority": "recommended"},
            {"title": "Neptune", "url": "https://github.com/google-deepmind/neptune", "kind": "repository", "priority": "optional"},
            {"title": "MLOps summary podcast", "url": "https://youtu.be/k9S6IhiUUj4", "kind": "podcast", "priority": "optional"},
        ],
    },
}


def parse_timestamp(value: str) -> float:
    match = TIME_PATTERN.fullmatch(value)
    if not match:
        raise ValueError(f"Invalid VTT timestamp: {value}")
    return (
        int(match.group(1) or 0) * 3600
        + int(match.group(2)) * 60
        + float(match.group(3))
    )


def normalized_token(value: str) -> str:
    return TOKEN_PATTERN.sub("", value.lower())


def parse_youtube_vtt(path: Path) -> list[dict]:
    """Parse rolling YouTube captions and append only newly revealed words."""
    lines = path.read_text(encoding="utf-8").splitlines()
    segments: list[dict] = []
    accumulated_words: list[str] = []
    accumulated_normalized: list[str] = []
    index = 0
    while index < len(lines):
        if "-->" not in lines[index]:
            index += 1
            continue
        timing = lines[index].split(" --> ", 1)
        start = parse_timestamp(timing[0])
        end = parse_timestamp(timing[1].split()[0])
        index += 1
        content = []
        while index < len(lines) and lines[index].strip():
            content.append(lines[index].strip())
            index += 1
        raw = html.unescape(TAG_PATTERN.sub(" ", " ".join(content)))
        words = raw.split()
        normalized = [normalized_token(word) for word in words]
        overlap = 0
        for size in range(
            min(60, len(accumulated_words), len(words)), 0, -1
        ):
            if accumulated_normalized[-size:] == normalized[:size]:
                overlap = size
                break
        new_words = words[overlap:]
        if not new_words:
            continue
        accumulated_words.extend(new_words)
        accumulated_normalized.extend(normalized[overlap:])
        segments.append({"start": round(start, 3), "end": round(end, 3), "text": " ".join(new_words)})
    return segments


def group_by_minute(segments: list[dict], duration: int) -> list[dict]:
    grouped: dict[int, list[str]] = {}
    for segment in segments:
        minute = int(segment["start"] // 60)
        grouped.setdefault(minute, []).append(segment["text"])
    return [
        {
            "start": minute * 60,
            "end": min((minute + 1) * 60, duration),
            "text": " ".join(grouped[minute]),
        }
        for minute in sorted(grouped)
        if grouped[minute]
    ]


def relative_to_root(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def build_snapshot() -> dict:
    playlist_info_path = next(SOURCE_ROOT.glob("00_*/*.info.json"))
    playlist_info = json.loads(playlist_info_path.read_text(encoding="utf-8"))
    days = []
    for info_path in sorted(SOURCE_ROOT.glob("[0-9][1-9]_*/*.info.json")):
        info = json.loads(info_path.read_text(encoding="utf-8"))
        video_id = info["id"]
        guide = DAY_GUIDES[video_id]
        vtt_path = info_path.with_name(f"{video_id}.en-orig.vtt")
        video_path = info_path.with_name(f"{video_id}.mp4")
        segments = parse_youtube_vtt(vtt_path)
        duration = int(info["duration"])
        minute_blocks = group_by_minute(segments, duration)
        frames = []
        for frame in guide["frames"]:
            frame_path = FRAME_ROOT / frame["file"]
            if not frame_path.exists():
                raise FileNotFoundError(f"Missing selected frame: {frame_path}")
            frames.append({**frame, "source_path": relative_to_root(frame_path)})
        days.append(
            {
                "day": guide["day"],
                "video_id": video_id,
                "title": info["title"],
                "topic": guide["topic"],
                "category": guide["category"],
                "video_url": info["webpage_url"],
                "duration_seconds": duration,
                "duration_string": info.get("duration_string"),
                "upload_date": info.get("upload_date"),
                "automatic_caption_language": "en-orig",
                "raw_vtt_source_path": relative_to_root(vtt_path),
                "local_low_resolution_video_path": relative_to_root(video_path),
                "transcript_word_count": sum(len(block["text"].split()) for block in minute_blocks),
                "summary": guide["summary"],
                "learning_chapters": guide["learning_chapters"],
                "source_chapters": info.get("chapters") or [],
                "key_points": guide["key_points"],
                "experiments": guide["experiments"],
                "resources": guide["resources"],
                "frames": frames,
                "transcript_blocks": minute_blocks,
            }
        )
    return {
        "snapshot_date": SNAPSHOT_DATE,
        "playlist": {
            "id": playlist_info.get("id"),
            "title": playlist_info.get("title"),
            "url": PLAYLIST_URL,
            "channel": playlist_info.get("channel"),
            "channel_url": playlist_info.get("channel_url"),
            "video_count": len(days),
            "total_duration_seconds": sum(day["duration_seconds"] for day in days),
        },
        "official_course_overview": "https://blog.google/innovation-and-ai/technology/developers-tools/google-kaggle-genai-intensive/",
        "self_paced_guide": "https://www.kaggle.com/learn-guide/5-day-genai",
        "ingestion": {
            "metadata_and_media": "yt-dlp",
            "audio_video_processing": "ffmpeg",
            "caption_source": "YouTube English automatic captions",
            "caption_cleanup": "rolling VTT deduplication followed by minute-level grouping",
            "image_source": "selected frames extracted from downloaded 360p videos",
            "fallback_when_captions_missing": "extract mono 16 kHz audio with ffmpeg, then transcribe locally with faster-whisper; retain model name and confidence limitations",
            "note": "Automatic captions and reviewed summaries can contain recognition or interpretation errors. Verify names, numbers and technical claims against the video and linked primary material.",
        },
        "days": sorted(days, key=lambda item: item["day"]),
    }


def main() -> None:
    snapshot = build_snapshot()
    OUTPUT.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(
        json.dumps(
            {
                "output": str(OUTPUT),
                "days": len(snapshot["days"]),
                "duration_seconds": snapshot["playlist"]["total_duration_seconds"],
                "transcript_words": sum(day["transcript_word_count"] for day in snapshot["days"]),
                "selected_frames": sum(len(day["frames"]) for day in snapshot["days"]),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
