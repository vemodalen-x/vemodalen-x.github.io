from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
METADATA = ROOT / "tools" / "data" / "bilibili_BV1ADWCzrEXL_metadata.json"
TRANSCRIPT = ROOT / "tools" / "data" / "bilibili_agent_architecture_transcript.json"
OUTPUT = ROOT / "tools" / "data" / "bilibili_agent_architecture_snapshot.json"
VIDEO_URL = "https://www.bilibili.com/video/BV1ADWCzrEXL/"


CHAPTERS = [
    {
        "start": 0,
        "end": 130,
        "title": "Software 1.0 → 2.0 → 3.0",
        "summary": "编程对象从显式代码、神经网络权重推进到以 Prompt 驱动的大语言模型；AI 原生应用的本质是把概率模型纳入软件控制流。",
        "role": "建立为什么 Agent 架构不能只沿用传统微服务接口与监控的背景。",
        "frame": "t0045.jpg",
    },
    {
        "start": 130,
        "end": 330,
        "title": "AI Agent 核心要素与开发全景",
        "summary": "Agent 由感知、模型决策、工具和长短期记忆组成；外围还需要开发框架、运行时、模型与 MCP 服务、配置/注册、消息系统和可观测性。",
        "role": "把模型能力扩展为可运行、可治理、可诊断的系统全景。",
        "frame": "t0150.jpg",
    },
    {
        "start": 330,
        "end": 450,
        "title": "Workflow 与 Agentic 的混合选择",
        "summary": "固定流程提供确定性，Agentic loop 用模型动态规划下一步；真实系统通常按任务风险、准确性与 GPU 成本组合两者。",
        "role": "给出控制权应留在代码还是交给模型的第一层架构决策。",
        "frame": "t0360.jpg",
    },
    {
        "start": 450,
        "end": 580,
        "title": "单 Agent 与多 Agent",
        "summary": "默认使用更易开发维护的单 Agent；当上下文膨胀、任务很长或需要角色协作时再拆成多 Agent，并以 Deep Research 的 leader-worker 模式举例。",
        "role": "将多 Agent 视为复杂度和上下文隔离手段，而不是默认能力升级。",
        "frame": "t0480.jpg",
    },
    {
        "start": 580,
        "end": 720,
        "title": "Prompt Engineering → Context Engineering",
        "summary": "复杂 Agent 的输入不仅是 Prompt，还包含 RAG 文档、工具结果、状态与记忆；上下文工程负责在有限窗口内选择、排序和复用信息。稳定前缀与变化内容后置有利于 KV Cache。",
        "role": "把提示词优化提升为运行时上下文编译与缓存问题。",
        "frame": "t0600.jpg",
    },
    {
        "start": 720,
        "end": 900,
        "title": "AI 原生应用参考架构",
        "summary": "用户流量经 API Gateway 进入 Agent Runtime，再由 AI Gateway 连接多模型与工具；数据库/向量库、Nacos、消息系统和 OpenTelemetry 分别承担知识、治理、状态与观测职责。",
        "role": "给出数据面、控制面、状态面和观测面的组件边界。",
        "frame": "t0750.jpg",
    },
    {
        "start": 900,
        "end": 1020,
        "title": "Nacos 与 Higress：MCP 注册和 AI Gateway",
        "summary": "Nacos 被用于企业内部 MCP 注册发现、健康检查和 Prompt 管理；Higress 统一代理模型与 MCP 流量，承接认证、限流、缓存和协议适配。",
        "role": "将工具治理和模型接入从 Agent 业务代码中分离。",
        "frame": "t0930.jpg",
    },
    {
        "start": 1020,
        "end": 1150,
        "title": "RocketMQ 与长任务状态恢复",
        "summary": "把长周期 Agent session 的中间输出写入消息流，使消费节点失败后能切换并继续传递结果，避免从头重复昂贵的模型推理。",
        "role": "把 Agent 可靠性从一次性调用提升到可恢复的事件驱动执行。",
        "frame": "t1050.jpg",
    },
    {
        "start": 1150,
        "end": 1310,
        "title": "OpenTelemetry 全链路可观测性",
        "summary": "围绕“用起来、用得省、用得好”采集客户端、网关、Agent、工具、模型和 GPU 的 traces、metrics、logs、输入输出与 token 消耗。",
        "role": "建立性能、成本和质量分析所需的证据链。",
        "frame": "t1200.jpg",
    },
    {
        "start": 1310,
        "end": 1450,
        "title": "TED、TTFT、TPOT 与 Trace",
        "summary": "视频提出用 Token/Error/Duration 补充传统 RED，并用 TTFT、TPOT、KV Cache 命中率区分 prefill 与 decode；单次 trace 关联工作流节点、耗时、token 和模型内部阶段。",
        "role": "把“Agent 很慢/很贵”拆成可定位、可对照的运行指标。",
        "frame": "t1320.jpg",
    },
    {
        "start": 1450,
        "end": 1680,
        "title": "评测作为持续回归测试",
        "summary": "开发早期使用人工和已知答案样例，稳定后引入 LLM-as-a-Judge；上线后持续抽取 traces，并分别评价 planning、工具选择/参数和 RAG 召回质量。",
        "role": "把一次性 Demo 评估改成开发—部署—反馈—迭代闭环。",
        "frame": "t1500.jpg",
    },
    {
        "start": 1680,
        "end": 1790,
        "title": "LoongSuite 与开源项目路线",
        "summary": "LoongSuite 基于 OpenTelemetry 为 Java、Go、Python 和 AI 框架提供探针；结尾串联 Spring AI Alibaba、Higress、Nacos、RocketMQ 与 A2A/评测能力规划。",
        "role": "将参考架构映射到可验证的开源实现，但版本能力需以当前仓库为准。",
        "frame": "t1650.jpg",
    },
]


FRAME_CAPTIONS = {
    "t0045.jpg": "编程范式演进：Software 1.0、2.0 与以 LLM/Prompt 为接口的 3.0。",
    "t0150.jpg": "AI 原生应用开发全景：Agent、Runtime、模型、MCP、网关、消息与可观测性。",
    "t0360.jpg": "Agentic or Workflow：动态规划能力与确定性控制的权衡。",
    "t0480.jpg": "单 Agent 或多 Agent：以任务长度、上下文和协作复杂度决定拆分。",
    "t0600.jpg": "Prompt Engineering 与 Context Engineering 的信息范围差异。",
    "t0750.jpg": "AI 原生应用参考架构：流量、模型、工具、状态与观测路径。",
    "t0930.jpg": "Nacos：企业 MCP Registry 与 Prompt 管理。",
    "t1050.jpg": "RocketMQ：多轮、长耗时 AI 会话的状态管理与恢复。",
    "t1200.jpg": "基于 OpenTelemetry 的 AI 应用可观测性数据链路。",
    "t1320.jpg": "AI 应用关键指标：token、错误、时延及模型推理分解。",
    "t1500.jpg": "基于可观测数据的评估闭环：开发、评测、上线和反馈。",
    "t1650.jpg": "LoongSuite：基于 OpenTelemetry 的多语言可观测采集套件。",
}


REPLACEMENTS = {
    "AI Aging": "AI Agent",
    "AI进度": "AI Agent",
    "云元生": "云原生",
    "可观色性": "可观测性",
    "Andrej Kapasi": "Andrej Karpathy",
    "Andrej Kapathy": "Andrej Karpathy",
    "longsweat": "LoongSuite",
    "long suede": "LoongSuite",
    "LongSuite": "LoongSuite",
    "Narcos": "Nacos",
    "Nikos": "Nacos",
    "Nagos": "Nacos",
    "Higris": "Higress",
    "RAW CAM Q": "RocketMQ",
    "RocamQ": "RocketMQ",
    "RockMQ": "RocketMQ",
    "KV Cash": "KV Cache",
    "KVCash": "KV Cache",
    "OpenTelegram": "OpenTelemetry",
    "open telemetry": "OpenTelemetry",
    "Yager": "Jaeger",
    "SGLAN": "SGLang",
    "RIG": "RAG",
}


def clean_text(value: str) -> str:
    text = value.strip()
    for source, destination in REPLACEMENTS.items():
        text = text.replace(source, destination)
    text = re.sub(r"\s+", "", text)
    return text


def transcript_blocks(segments: list[dict]) -> list[dict]:
    grouped: dict[int, list[str]] = defaultdict(list)
    for segment in segments:
        text = clean_text(segment["text"])
        if not text:
            continue
        minute = int(float(segment["start"]) // 60)
        if not grouped[minute] or grouped[minute][-1] != text:
            grouped[minute].append(text)
    return [
        {
            "start": minute * 60,
            "end": min((minute + 1) * 60, 1789.695),
            "text": "".join(grouped[minute]),
        }
        for minute in sorted(grouped)
    ]


def main() -> None:
    metadata = json.loads(METADATA.read_text(encoding="utf-8-sig"))
    transcript = json.loads(TRANSCRIPT.read_text(encoding="utf-8"))
    blocks = transcript_blocks(transcript["segments"])
    transcript_text = "".join(block["text"] for block in blocks)

    frames = [
        {
            "file": chapter["frame"],
            "time": int(chapter["frame"][1:5]),
            "caption": FRAME_CAPTIONS[chapter["frame"]],
            "source_path": (
                "tools/data/bilibili_agent_architecture_frames/" + chapter["frame"]
            ),
        }
        for chapter in CHAPTERS
    ]

    payload = {
        "snapshot_date": "2026-07-15",
        "source": {
            "video_id": metadata["id"],
            "title": metadata["title"],
            "url": VIDEO_URL,
            "uploader": metadata.get("uploader"),
            "upload_date": metadata.get("upload_date"),
            "duration_seconds": metadata.get("duration"),
            "duration_string": metadata.get("duration_string"),
            "view_count_at_snapshot": metadata.get("view_count"),
        },
        "ingestion": {
            "page_subtitles": None,
            "transcription_required": True,
            "transcription_model": transcript["model"],
            "transcription_backend": transcript["backend"],
            "device": transcript["device"],
            "segment_count": transcript["segment_count"],
            "raw_audio_path": transcript["source"],
            "raw_vtt_path": "tools/data/bilibili_agent_architecture_source/BV1ADWCzrEXL.whisper-large-v3.vtt",
            "local_video_path": "tools/data/bilibili_agent_architecture_source/BV1ADWCzrEXL_720p.mp4",
            "warning": "机器转写已经按长音频模式重跑并做术语级清洗；人名、数字、产品名和断句仍需结合视频时间戳核对。",
        },
        "summary": "这场分享把企业级 AI Agent 视为一套 AI 原生分布式系统：模型与工具只是数据面的一部分，真正决定生产可用性的还有工作流控制、上下文编排、MCP/模型网关、状态恢复、全链路观测和持续评测。",
        "knowledge_position": "位于本知识库“推理与 Agent”到“运行时、评测、安全与反馈闭环”之间，补足 Kaggle Day 3/5 的企业 Java 与云原生架构实现视角。",
        "chapters": CHAPTERS,
        "architecture_layers": [
            {"layer": "交互与流量入口", "components": "Client、API Gateway", "responsibility": "鉴权、路由、流式连接和请求边界。"},
            {"layer": "Agent 控制面", "components": "Workflow/Agentic loop、单/多 Agent、Context Engineering", "responsibility": "计划、状态、上下文选择和执行策略。"},
            {"layer": "模型与工具数据面", "components": "AI Gateway、LLM、MCP Server、数据库/向量库", "responsibility": "统一模型访问、工具调用、知识检索和协议适配。"},
            {"layer": "配置与服务治理", "components": "Nacos、Prompt/MCP Registry", "responsibility": "动态配置、私有工具注册发现、健康与版本治理。"},
            {"layer": "状态与事件", "components": "RocketMQ、session、checkpoint", "responsibility": "长任务中间结果、异步解耦、失败恢复和消费切换。"},
            {"layer": "观测与评测", "components": "OpenTelemetry、LoongSuite、metrics/traces/logs/evaluation", "responsibility": "关联性能、成本、质量、工具轨迹和回归反馈。"},
        ],
        "key_judgments": [
            "Workflow 与 Agentic 不是产品级二选一，而是每个步骤应交给确定性代码还是概率模型的局部决策。高风险写操作应优先保留显式规则、验证和人工确认。",
            "单 Agent 是默认基线；只有当上下文污染、责任边界、并行性或失败隔离的收益超过协调成本时才拆成多 Agent。视频中“多 Agent 提升准确率”属于讲者经验判断，仍需在自己的任务上做等预算对照。",
            "Context Engineering 是运行时信息系统：选择哪些 Prompt、RAG 文档、工具结果、状态和记忆进入窗口，并决定顺序、压缩、缓存与淘汰。",
            "MCP Registry 与 AI/MCP Gateway 解决的是治理，而不是 Agent 推理本身。生产验收还必须覆盖身份、权限、工具版本、schema 兼容、审计和限流。",
            "消息队列可以承载长任务中间事件和恢复，但完整可靠性仍依赖幂等工具调用、顺序语义、checkpoint 一致性、超时与补偿；视频没有展开这些实现边界。",
            "Agent 可观测性需要把请求级 RED 与 token/模型级 TTFT、TPOT、KV Cache，以及任务级成功率和轨迹质量分层，不能用单一平均延迟代表系统状态。",
            "评测应拆到 planning、工具选择与参数、RAG 召回、最终产物和副作用，并把离线黄金集、线上抽样、人工复核和 LLM judge 组织成持续回归。",
        ],
        "experiments": [
            "实现一个混合 Agent：查询和分类走固定 workflow，开放式研究走 agentic loop；比较任务成功率、错误类型、token、P95 延迟和人工接管率。",
            "固定模型与任务，对比单 Agent 和 leader-worker 多 Agent；保持总 token/工具预算相近，记录上下文长度、并行收益、协调错误和最终质量。",
            "做 Context Engineering 缓存实验：固定系统/工具前缀，把动态状态后置，对比 KV Cache 命中、TTFT、成本和回答一致性。",
            "搭建私有 MCP Registry + Gateway 最小系统，验证服务发现、schema 变更、身份认证、按工具授权、限流和审计日志。",
            "用消息队列保存 Agent 事件流，在模型输出、工具调用和客户端消费三个位置注入故障，验证恢复点、重复副作用和补偿策略。",
            "用 OpenTelemetry 给一个 RAG Agent 加 spans：retrieval、rerank、LLM、tool、token、TTFT、TPOT；再从 trace 自动生成性能—成本—质量报告。",
            "建立分层 eval harness，分别评 planning、tool choice/arguments、retrieval relevance/duplication 和 final answer；比较人工评分与 LLM judge 的一致性。",
        ],
        "limitations": [
            "视频是约 30 分钟的架构分享，不包含完整代码、部署参数、容量规划或对照实验。",
            "视频中的成本倍数、多 Agent 收益和架构效果属于讲者在特定实践下的描述，不能直接外推。",
            "结尾的未来规划对应视频发布时点；本地延伸链接用于核对当前开源状态，不能反向视为视频当时已经具备的能力。",
            "Whisper 转写可能把 Nacos、Higress、RocketMQ、LoongSuite、vLLM/SGLang 等专名识别错误；学习页采用画面与上下文校正，原始 VTT 保留审计。",
        ],
        "resources": [
            {"title": "原始 Bilibili 视频", "url": VIDEO_URL, "kind": "视频原文", "priority": "must-read"},
            {"title": "Spring AI Alibaba", "url": "https://github.com/alibaba/spring-ai-alibaba", "kind": "官方延伸仓库", "priority": "recommended"},
            {"title": "Higress AI Gateway", "url": "https://github.com/alibaba/higress", "kind": "官方延伸仓库", "priority": "recommended"},
            {"title": "Nacos", "url": "https://github.com/alibaba/nacos", "kind": "官方延伸仓库", "priority": "recommended"},
            {"title": "Apache RocketMQ", "url": "https://github.com/apache/rocketmq", "kind": "官方延伸仓库", "priority": "optional"},
            {"title": "LoongSuite Python Agent", "url": "https://github.com/alibaba/loongsuite-python-agent", "kind": "官方延伸仓库", "priority": "recommended"},
            {"title": "OpenTelemetry GenAI Semantic Conventions", "url": "https://github.com/open-telemetry/semantic-conventions-genai", "kind": "开放标准", "priority": "recommended"},
        ],
        "frames": frames,
        "transcript": {
            "segment_count": transcript["segment_count"],
            "cleaned_character_count": len(transcript_text),
            "block_count": len(blocks),
            "blocks": blocks,
            "terminology_corrections": REPLACEMENTS,
        },
    }
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(
        json.dumps(
            {
                "output": str(OUTPUT),
                "chapters": len(CHAPTERS),
                "frames": len(frames),
                "transcript_blocks": len(blocks),
                "cleaned_characters": len(transcript_text),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
