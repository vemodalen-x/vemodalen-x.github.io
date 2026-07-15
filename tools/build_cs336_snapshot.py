"""Build a reproducible Stanford CS336 Spring 2026 course snapshot.

The schedule and source links are parsed from the official course page. Chinese
annotations are deliberately kept separate from the structural extraction so a
future page change does not silently alter the interpretation layer.
"""

from __future__ import annotations

import html
import json
import re
import subprocess
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = ROOT / "tools" / "data" / "stanford_cs336_source"
OUTPUT = ROOT / "tools" / "data" / "stanford_cs336_snapshot.json"
COURSE_URL = "https://cs336.stanford.edu/"
PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLoROMvodv4rMqXOcazWaTUHhq-yembLCV"
SNAPSHOT_DATE = "2026-07-15"


LECTURE_ANNOTATIONS = {
    1: {
        "category": "数据与表征",
        "subtopics": ["byte-level BPE", "Unicode 与 bytes", "tokenizer 训练/编码", "最小语言模型生命周期"],
        "key_question": "原始文本如何变成可逆、可压缩、可供语言模型训练的 token 序列？",
        "role": "固定数据到整数序列的接口；后续模型容量、训练成本和 loss 比较都依赖同一 tokenizer 口径。",
        "experiment": "在同一语料上比较 vocab size、压缩率、序列长度、训练吞吐与验证 perplexity。",
        "priority": "must-read",
    },
    2: {
        "category": "研究方法与资源核算",
        "subtopics": ["PyTorch", "einops", "tensor shape", "FLOPs", "显存", "arithmetic intensity"],
        "key_question": "张量形状、计算量、内存流量和算术强度如何共同决定一段模型代码的成本？",
        "role": "建立从公式到硬件预算的共同单位，为 kernel、并行和 scaling law 提供可核验的资源账本。",
        "experiment": "对 attention/MLP 的 forward+backward 记录理论 FLOPs、峰值显存与 profiler 实测时间。",
        "priority": "must-read",
    },
    3: {
        "category": "模型架构",
        "subtopics": ["Transformer block", "RMSNorm", "RoPE", "SwiGLU", "超参数与初始化"],
        "key_question": "现代 decoder-only Transformer 的组件选择和超参数怎样影响稳定性、容量与成本？",
        "role": "把 tokenizer 之后的可训练序列映射成标准架构基线，供系统优化和替代结构做公平比较。",
        "experiment": "固定参数/FLOPs 预算，对 normalization、position encoding、MLP ratio 做小规模消融。",
        "priority": "must-read",
    },
    4: {
        "category": "模型架构",
        "subtopics": ["attention alternatives", "state-space/linear attention 视角", "Mixture of Experts", "稀疏计算"],
        "key_question": "当标准 attention 的序列或参数成本成为瓶颈时，替代结构和 MoE 在改变什么？",
        "role": "从单一 dense Transformer 基线扩展到稀疏参数与不同序列混合机制；比较必须包含质量和系统效率。",
        "experiment": "固定训练 token 与实际 wall-clock，对 dense/MoE 或 attention 替代方案比较 loss、tokens/s、显存和负载均衡。",
        "priority": "recommended",
    },
    5: {
        "category": "训练系统",
        "subtopics": ["GPU/TPU 执行模型", "memory hierarchy", "带宽与计算吞吐", "roofline"],
        "key_question": "语言模型算子为什么会受计算、HBM 带宽、片上存储或通信中的不同瓶颈限制？",
        "role": "把资源核算映射到真实加速器，为 Triton kernel 和分布式并行解释性能上限。",
        "experiment": "为 matmul、normalization、attention 画 roofline 定位，并对照 profiler 的 kernel 时间和带宽。",
        "priority": "must-read",
    },
    6: {
        "category": "训练系统",
        "subtopics": ["GPU kernels", "Triton", "tiling", "fusion", "FlashAttention2"],
        "key_question": "如何通过分块、重计算与融合减少 HBM 往返，而不改变 attention 数值语义？",
        "role": "把硬件模型落实为可测试 kernel；这是从 PyTorch 正确实现走向高吞吐训练的关键跃迁。",
        "experiment": "实现 Triton attention，校验 forward/backward 数值，再比较不同序列长度下速度、显存和数值误差。",
        "priority": "must-read",
    },
    7: {
        "category": "训练系统",
        "subtopics": ["data parallel", "tensor parallel", "pipeline parallel", "通信成本", "activation checkpointing"],
        "key_question": "模型、激活、优化器状态与通信应怎样切分，才能突破单卡内存和吞吐上限？",
        "role": "建立并行策略的成本模型；先理解张量/状态归属，再进入框架实现。",
        "experiment": "对 DDP、梯度累积和 activation checkpointing 记录每卡显存、通信量、吞吐和扩展效率。",
        "priority": "must-read",
    },
    8: {
        "category": "训练系统",
        "subtopics": ["并行策略组合", "optimizer state sharding", "FSDP", "集群扩展效率"],
        "key_question": "多种并行维度如何组合，哪些状态需要复制、分片、通信或重计算？",
        "role": "把单一并行机制扩展为完整训练拓扑，并为作业 2 的 FSDP 实现提供系统设计依据。",
        "experiment": "固定全局 batch 和模型，比较 DDP、state sharding、FSDP 的峰值显存、吞吐与通信占比。",
        "priority": "must-read",
    },
    9: {
        "category": "规模律与实验设计",
        "subtopics": ["scaling laws", "compute-optimal training", "IsoFLOPs", "外推风险"],
        "key_question": "怎样用小规模实验估计固定计算预算下的模型规模与训练 token 配比？",
        "role": "把架构和系统能力转为训练决策；重点是实验设计与不确定性，不是记住一组指数。",
        "experiment": "设计多档 compute bucket 和模型规模，拟合每档最优点并报告外推区间与残差。",
        "priority": "must-read",
    },
    10: {
        "category": "推理系统",
        "subtopics": ["prefill/decode", "KV cache", "batching", "memory-bound decoding", "延迟/吞吐权衡"],
        "key_question": "训练完成的语言模型如何在 prefill、decode、缓存和并发约束下高效服务？",
        "role": "补齐模型生命周期的 serving 侧，并防止只用训练 FLOPs 推断线上成本。",
        "experiment": "在固定模型上扫描 prompt/生成长度与 batch，记录 TTFT、TPOT、tokens/s、显存和单位请求成本。",
        "priority": "must-read",
    },
    11: {
        "category": "规模律与实验设计",
        "subtopics": ["scaling law fitting", "模型/数据规模分配", "训练 API", "预测校准"],
        "key_question": "如何把 scaling law 从概念变成预算受限、可复现、可校准的模型选择程序？",
        "role": "与第 9 讲形成方法到实践的闭环，直接服务作业 3 的受限查询与最终大运行预测。",
        "experiment": "预注册查询预算、拟合族和选择准则，用留出的小规模运行检验外推误差后再预测目标预算。",
        "priority": "must-read",
    },
    12: {
        "category": "评测与研究方法",
        "subtopics": ["language-model evaluation", "benchmark", "contamination", "统计不确定性", "能力/效率联合评测"],
        "key_question": "怎样证明模型改动带来真实、可复现且不依赖数据泄漏的能力提升？",
        "role": "为数据、后训练和系统实验提供统一验收口径；loss、任务指标和服务指标不能互相替代。",
        "experiment": "建立 held-out 评测 harness，报告置信区间、污染检查、按子任务切片和质量-成本 Pareto。",
        "priority": "must-read",
    },
    13: {
        "category": "预训练数据",
        "subtopics": ["数据来源", "公开数据集", "Common Crawl", "许可与溯源", "数据测量"],
        "key_question": "预训练语料从哪里来，怎样描述其覆盖、风险、许可和可追溯性？",
        "role": "从模型中心转向数据中心；后续过滤、混合、规模律和评测都依赖来源清单。",
        "experiment": "为一个小型语料建立 data card：来源、时间、语言、域、许可、重复率、敏感内容和 split 策略。",
        "priority": "must-read",
    },
    14: {
        "category": "预训练数据",
        "subtopics": ["HTML text extraction", "quality/safety filtering", "PII", "deduplication", "data mixing", "synthetic data"],
        "key_question": "如何把原始网页转成可训练数据，并分离过滤、去重、混合和合成数据各自的效果？",
        "role": "把数据来源落实为可审计 pipeline；数据处理决策必须通过下游训练而非过滤器分数单独验收。",
        "experiment": "训练相同小模型，对 raw、filtered、deduped、mixed 数据逐步消融并报告质量、覆盖与安全副作用。",
        "priority": "must-read",
    },
    15: {
        "category": "后训练与对齐",
        "subtopics": ["SFT", "preference data", "reward modeling", "RLHF", "DPO"],
        "key_question": "怎样把 broad base model 转成遵循指令、偏好和安全约束的助手？",
        "role": "从 next-token pretraining 进入目标更窄的行为塑形；数据、目标与评测同时改变。",
        "experiment": "固定 base model 和评测集，对 zero-shot、SFT、DPO 比较任务质量、安全、遗忘和训练成本。",
        "priority": "must-read",
    },
    16: {
        "category": "后训练与推理",
        "subtopics": ["RLVR", "GRPO", "policy gradient", "on/off-policy", "verifiable rewards", "训练方差"],
        "key_question": "没有标准推理轨迹时，如何用可验证奖励直接提高数学/代码等任务准确率？",
        "role": "把 post-training 从模仿数据推进到基于结果奖励的策略优化，同时暴露方差、稳定性和 reward hacking 风险。",
        "experiment": "在同一 base model/GSM8K split 上比较 prompting、RFT、GRPO 变体，并至少运行多 seed 与 KL/长度诊断。",
        "priority": "must-read",
    },
    17: {
        "category": "多模态对齐",
        "subtopics": ["multimodal alignment", "模态 token/interface", "fusion", "transfer", "多模态评测"],
        "key_question": "视觉等模态怎样接入语言模型，并证明模型真正使用了跨模态证据？",
        "role": "把单模态 LM 生命周期扩展到模态接口；重点是对齐、融合位置、训练策略和反捷径评测。",
        "experiment": "比较冻结/微调编码器与不同 fusion 接口，加入遮蔽、冲突模态和单模态 baseline。",
        "priority": "recommended",
    },
    18: {
        "category": "嘉宾讲座",
        "subtopics": [],
        "key_question": "课程页仅给出讲者 Daniel Selsam，具体主题需等待公开讲义或录播确认。",
        "role": "保留课程时间线位置，不从讲者身份臆测技术内容。",
        "experiment": "资料公开后再补：问题定义、核心机制、证据、限制和一个可复现实验。",
        "priority": "optional",
    },
    19: {
        "category": "嘉宾讲座",
        "subtopics": [],
        "key_question": "课程页与录播标题仅标记 Dan Fu 嘉宾讲座，具体技术结论需回到录播核验。",
        "role": "作为开放研究更新，不在缺少课程描述时提前归类。",
        "experiment": "观看录播后写一页 evidence note：问题、方法、实验设置、失败边界与工程迁移条件。",
        "priority": "optional",
    },
}


ASSIGNMENT_ANNOTATIONS = {
    1: {
        "title_zh": "基础：从零构建 Transformer LM",
        "deliverables": ["BPE tokenizer", "Transformer LM", "cross-entropy 与 AdamW", "checkpointable training loop", "TinyStories/OpenWebText 训练与采样"],
        "engineering_value": "把 tokenizer、模型、优化器和训练循环放在同一可测试边界内；是后续四个作业的代码基线。",
        "acceptance": "单元测试通过；encode/decode 可逆；小数据可过拟合；checkpoint 恢复后 loss 连续；报告训练/验证 loss 与采样结果。",
        "resource_note": "可先用 TinyStories、小模型和 CPU/单卡完成正确性，再尝试 OpenWebText。",
        "local_handout": "tools/data/stanford_cs336_source/assignment1-basics/cs336_assignment1_basics.pdf",
    },
    2: {
        "title_zh": "系统：Kernel、Profiling 与并行训练",
        "deliverables": ["benchmark/profiling harness", "activation checkpointing", "Triton FlashAttention2", "DDP", "optimizer state sharding", "FSDP"],
        "engineering_value": "从正确实现进入可测性能与多卡扩展；核心不是调用框架，而是解释时间、显存和通信从哪里来。",
        "acceptance": "数值与 reference 一致；profile 可复现；报告 speedup/peak memory；多卡结果与单卡训练语义一致。",
        "resource_note": "Triton 与多卡部分需要 NVIDIA GPU；没有多卡时仍可完成成本模型、单卡 profile 和小 kernel 验证。",
        "local_handout": "tools/data/stanford_cs336_source/assignment2-systems/cs336_assignment2_systems.pdf",
    },
    3: {
        "title_zh": "规模律：预算约束下预测最优训练配置",
        "deliverables": ["训练 API 查询策略", "IsoFLOPs/候选 scaling law 拟合", "compute-optimal N/D 预测", "可复现方法报告"],
        "engineering_value": "训练前用小规模证据减少昂贵大运行的决策风险；要求显式处理查询预算和外推误差。",
        "acceptance": "保留全部查询配置/结果；比较拟合族；检查残差与留出误差；输出目标预算下超参数和预测 loss。",
        "resource_note": "课程 API 不一定对自学者开放；可用自建小模型运行或公开 scaling 数据替代，但必须标注数据来源。",
        "local_handout": "tools/data/stanford_cs336_source/assignment3-scaling/cs336_assignment3_scaling.pdf",
    },
    4: {
        "title_zh": "数据：把 Common Crawl 变成预训练语料",
        "deliverables": ["WARC/HTML text extraction", "quality/harm/PII filtering", "exact/near deduplication", "处理决策的下游训练对照"],
        "engineering_value": "把数据质量从主观清洗变成有 lineage、单元测试和模型效果消融的工程 pipeline。",
        "acceptance": "每阶段统计保留率与原因；抽样审计；去重泄漏测试；相同训练配置比较不同数据版本。",
        "resource_note": "先对少量 Common Crawl shard 建立完整管线，再扩大；原始网页可能包含有害内容。",
        "local_handout": "tools/data/stanford_cs336_source/assignment4-data/cs336_assignment4_data.pdf",
    },
    5: {
        "title_zh": "对齐与推理 RL：GRPO/RLVR",
        "deliverables": ["zero/few-shot 与 CoT baseline", "GRPO", "policy-gradient/variance/clipping 变体", "on/off-policy 对比", "可选 SFT/DPO 安全补充"],
        "engineering_value": "从 base LM 进入任务导向的 post-training，要求同时观测奖励、真实准确率、KL、长度、方差与稳定性。",
        "acceptance": "先固定 prompting baseline；多 seed 比较算法变体；分开报告 reward 与 GSM8K accuracy；检查 reward hacking 和训练崩溃。",
        "resource_note": "默认实验使用 OLMo-2-0425-1B 与 vLLM；自学可缩小样本/步数，但不要用单次运行下结论。",
        "local_handout": "tools/data/stanford_cs336_source/assignment5-alignment/cs336_spring2026_assignment5_alignment.pdf",
        "local_supplement": "tools/data/stanford_cs336_source/assignment5-alignment/cs336_spring2026_assignment5_supplement_safety_rlhf.pdf",
    },
}


MODULES = [
    {
        "id": "lm-basics",
        "title": "1. Tokenization 与 Transformer 基线",
        "lectures": [1, 2, 3, 4],
        "question": "如何把文本、张量程序和现代 decoder 架构组织成可训练、可比较的语言模型？",
        "output": "一个从零实现、测试通过、能在小语料过拟合并恢复训练的最小 LM。",
    },
    {
        "id": "training-systems",
        "title": "2. 硬件、Kernel 与分布式训练",
        "lectures": [5, 6, 7, 8],
        "question": "如何用硬件成本模型定位瓶颈，并通过 kernel/并行突破单卡速度与内存限制？",
        "output": "profile + roofline + 数值测试 + 单/多卡吞吐和显存对照。",
    },
    {
        "id": "scale-inference",
        "title": "3. Scaling Laws、推理与评测",
        "lectures": [9, 10, 11, 12],
        "question": "训练预算如何分配，模型完成后如何服务，又怎样证明质量提升真实有效？",
        "output": "规模律外推报告和一套质量-延迟-吞吐-成本联合评测 harness。",
    },
    {
        "id": "pretraining-data",
        "title": "4. 预训练数据工程",
        "lectures": [13, 14],
        "question": "怎样从来源清单和原始网页构建可追溯、过滤、去重、混合且可消融的数据集？",
        "output": "带 lineage/data card 的小型 Common Crawl pipeline 及模型训练对照。",
    },
    {
        "id": "post-training",
        "title": "5. SFT、Preference 与 RLVR",
        "lectures": [15, 16],
        "question": "如何把覆盖广泛的 base model 变成可用助手或高精度 reasoning policy？",
        "output": "prompting/SFT/DPO/GRPO 中至少两类方法的公平对照与稳定性诊断。",
    },
    {
        "id": "multimodal-frontier",
        "title": "6. 多模态接口与开放研究",
        "lectures": [17, 18, 19],
        "question": "如何扩展单模态语言模型，并在课程描述不足时保持证据边界？",
        "output": "多模态反捷径实验；嘉宾讲座采用 evidence note，不从标题臆测贡献。",
    },
]


STUDY_PLAN = [
    {"week": 1, "theme": "Tokenizer 与最小 LM", "lectures": [1, 2, 3], "assignment": 1, "output": "BPE + Transformer 前向测试；TinyStories 小样本过拟合；FLOPs/显存账本。"},
    {"week": 2, "theme": "架构与 GPU 成本模型", "lectures": [4, 5, 6], "assignment": 2, "output": "attention/MLP profile；一个 Triton kernel 的正确性与性能报告。"},
    {"week": 3, "theme": "并行训练", "lectures": [7, 8], "assignment": 2, "output": "DDP/checkpointing/state sharding 对照表；记录每卡显存、通信和扩展效率。"},
    {"week": 4, "theme": "规模律", "lectures": [9, 11], "assignment": 3, "output": "小规模 IsoFLOPs 数据、拟合曲线、残差、留出误差与目标预算预测。"},
    {"week": 5, "theme": "推理与评测", "lectures": [10, 12], "assignment": None, "output": "TTFT/TPOT/tokens/s/显存基线；含置信区间和数据污染检查的 eval harness。"},
    {"week": 6, "theme": "预训练数据", "lectures": [13, 14], "assignment": 4, "output": "HTML extraction → filtering → dedup → mixing pipeline 与 data card。"},
    {"week": 7, "theme": "中期/后训练", "lectures": [15, 16], "assignment": 5, "output": "zero/few-shot/CoT baseline；GRPO 或 SFT/DPO 对照；多 seed 稳定性诊断。"},
    {"week": 8, "theme": "多模态与总验收", "lectures": [17, 18, 19], "assignment": None, "output": "多模态反捷径实验设计；把数据、训练、推理、评测和 post-training 串成一页系统设计。"},
]


ENGINEERING_JUDGMENTS = [
    "CS336 的主线不是“再学一次 Transformer”，而是把 tokenizer、模型、硬件、并行、规模决策、数据与后训练置于同一生命周期；任何单点优化都要回到端到端质量和成本。",
    "作业 1/2 是生产模型设计的最高优先级：前者固定正确性边界，后者要求用 profile 和数值测试证明优化。没有这两层，scaling law 与 post-training 的实验数据不可靠。",
    "Scaling law 是预算决策工具，不是自然定律。数据分布、架构、训练 recipe 或硬件变化后，应重做校准并报告外推误差。",
    "数据过滤器的离线分数不能代表最终语料质量。课程把 Common Crawl 处理与小模型训练相连，正确验收是过滤统计、抽样审计、去重泄漏和下游效果四者同时成立。",
    "RLVR 的 reward 上升不等于 reasoning 可靠。至少要跟踪真实准确率、KL、输出长度、熵/方差、多 seed 和错误类型，防止 reward hacking 或格式投机。",
    "多模态 alignment 不是把视觉 embedding 接到 LLM 即完成。必须用遮蔽、冲突输入和单模态 baseline 证明跨模态证据被使用。",
]


def relative(path: Path) -> str:
    return path.resolve().relative_to(ROOT.resolve()).as_posix()


def fetch_course_page() -> tuple[str, BeautifulSoup]:
    response = requests.get(COURSE_URL, timeout=30)
    response.raise_for_status()
    response.encoding = response.apparent_encoding or "utf-8"
    SOURCE_ROOT.mkdir(parents=True, exist_ok=True)
    (SOURCE_ROOT / "course_page.html").write_text(response.text, encoding="utf-8")
    return response.text, BeautifulSoup(response.text, "html.parser")


def find_schedule_table(soup: BeautifulSoup):
    for table in soup.find_all("table"):
        headers = [cell.get_text(" ", strip=True).lower() for cell in table.find_all("th")]
        if "date" in headers and "description" in headers and "course materials" in headers:
            return table
    raise RuntimeError("Could not locate the CS336 schedule table")


def parse_date(value: str) -> str:
    cleaned = re.sub(r"^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+", "", value.strip())
    return datetime.strptime(f"2026 {cleaned}", "%Y %B %d").date().isoformat()


def parse_schedule(soup: BeautifulSoup) -> tuple[list[dict], list[dict]]:
    table = find_schedule_table(soup)
    lectures: list[dict] = []
    calendar: list[dict] = []
    for row in table.find_all("tr"):
        cells = row.find_all(["th", "td"], recursive=False)
        if not cells or cells[0].name == "th":
            continue
        values = [cell.get_text(" ", strip=True) for cell in cells]
        values += [""] * max(0, 5 - len(values))
        number_text, date_text, description, materials_text = values[:4]
        deadline_text = " ".join(value for value in values[4:] if value).strip()
        links_by_cell = [
            [
                {"title": anchor.get_text(" ", strip=True), "url": urljoin(COURSE_URL, anchor.get("href", ""))}
                for anchor in cell.find_all("a")
                if anchor.get("href")
            ]
            for cell in cells
        ]
        date_iso = parse_date(date_text)
        if not number_text.isdigit():
            calendar.append({"date": date_iso, "date_display": date_text, "title": description, "kind": "no-class"})
            continue

        number = int(number_text)
        speaker_match = re.search(r"\[([^\]]+)\]\s*$", description)
        speaker = speaker_match.group(1) if speaker_match else None
        title = re.sub(r"\s*\[[^\]]+\]\s*$", "", description).strip()
        annotation = LECTURE_ANNOTATIONS[number]
        material_links = links_by_cell[3] if len(links_by_cell) > 3 else []
        deadline_links = [item for group in links_by_cell[4:] for item in group]
        lectures.append(
            {
                "number": number,
                "date": date_iso,
                "date_display": date_text,
                "title": title,
                "speaker": speaker,
                "course_materials_text": materials_text or None,
                "material_links": material_links,
                "deadlines": deadline_text or None,
                "deadline_links": deadline_links,
                **annotation,
            }
        )
    if [item["number"] for item in lectures] != list(range(1, 20)):
        raise RuntimeError("Expected numbered lectures 1 through 19")
    return lectures, calendar


def parse_assignment_descriptions(soup: BeautifulSoup) -> dict[int, dict]:
    heading = next((node for node in soup.find_all("h3") if node.get_text(" ", strip=True) == "Assignments"), None)
    if heading is None:
        raise RuntimeError("Could not locate Assignments heading")
    assignment_list = heading.find_next("ul")
    parsed: dict[int, dict] = {}
    for item in assignment_list.find_all("li", recursive=False):
        anchor = item.find("a")
        if not anchor:
            continue
        match = re.search(r"Assignment\s+(\d+)", anchor.get_text(" ", strip=True))
        if not match:
            continue
        number = int(match.group(1))
        nested = item.find("ul")
        bullets = [li.get_text(" ", strip=True) for li in nested.find_all("li", recursive=False)] if nested else []
        parsed[number] = {
            "number": number,
            "official_title": anchor.get_text(" ", strip=True),
            "repo_url": urljoin(COURSE_URL, anchor.get("href", "")),
            "official_scope": bullets,
            **ASSIGNMENT_ANNOTATIONS[number],
        }
    if sorted(parsed) != [1, 2, 3, 4, 5]:
        raise RuntimeError("Expected five assignments")
    return parsed


def repo_metadata() -> list[dict]:
    metadata = []
    for repo in sorted(path for path in SOURCE_ROOT.iterdir() if path.is_dir() and (path.name == "lectures" or path.name.startswith("assignment"))):
        head = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()
        origin = subprocess.check_output(["git", "-C", str(repo), "remote", "get-url", "origin"], text=True).strip()
        files = [path for path in repo.rglob("*") if path.is_file() and ".git" not in path.parts]
        metadata.append(
            {
                "name": repo.name,
                "url": origin,
                "commit": head,
                "local_path": relative(repo),
                "file_count": len(files),
                "size_bytes": sum(path.stat().st_size for path in files),
            }
        )
    return metadata


def timestamp_seconds(value: str) -> float:
    pieces = value.split(":")
    if len(pieces) == 2:
        minutes, seconds = pieces
        return int(minutes) * 60 + float(seconds)
    hours, minutes, seconds = pieces
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def clean_vtt(path: Path) -> tuple[list[dict], int]:
    text = path.read_text(encoding="utf-8")
    blocks = re.split(r"\n\s*\n", text.replace("\r\n", "\n"))
    transcript_words: list[str] = []
    by_minute: dict[int, list[str]] = defaultdict(list)
    for block in blocks:
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        time_index = next((index for index, line in enumerate(lines) if "-->" in line), None)
        if time_index is None:
            continue
        start = timestamp_seconds(lines[time_index].split("-->", 1)[0].strip())
        cue = " ".join(lines[time_index + 1 :])
        cue = re.sub(r"<\d{2}:\d{2}:\d{2}\.\d{3}>", " ", cue)
        cue = re.sub(r"<[^>]+>", " ", cue)
        cue = html.unescape(cue)
        words = re.findall(r"\S+", re.sub(r"\s+", " ", cue).strip())
        if not words:
            continue
        max_overlap = min(len(transcript_words), len(words), 40)
        overlap = 0
        for size in range(max_overlap, 0, -1):
            if [word.lower() for word in transcript_words[-size:]] == [word.lower() for word in words[:size]]:
                overlap = size
                break
        novel = words[overlap:]
        if not novel:
            continue
        transcript_words.extend(novel)
        by_minute[int(start // 60) * 60].extend(novel)
    minute_blocks = [
        {"start": minute, "text": " ".join(words)}
        for minute, words in sorted(by_minute.items())
        if words
    ]
    return minute_blocks, len(transcript_words)


def playlist_metadata() -> tuple[dict, dict[int, dict]]:
    playlist_path = SOURCE_ROOT / "youtube_playlist.json"
    playlist = json.loads(playlist_path.read_text(encoding="utf-8-sig"))
    lecture_videos: dict[int, dict] = {}
    for index, entry in enumerate(playlist.get("entries", []), start=1):
        title = entry.get("title", "")
        match = re.search(r"Lecture\s+(\d+)", title, flags=re.IGNORECASE)
        if match:
            lecture_number = int(match.group(1))
        elif "Dan Fu" in title:
            lecture_number = 19
        else:
            continue
        video_id = entry["id"]
        folder = next(SOURCE_ROOT.glob(f"youtube/{index:02d}_{video_id}"), None)
        vtt = next(folder.glob("*.en-orig.vtt"), None) if folder else None
        transcript_blocks, word_count = clean_vtt(vtt) if vtt else ([], 0)
        lecture_videos[lecture_number] = {
            "playlist_index": index,
            "id": video_id,
            "title": title,
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "duration_seconds": int(entry.get("duration") or 0),
            "duration_string": entry.get("duration_string"),
            "subtitle_language": "English (Original) automatic captions" if vtt else None,
            "subtitle_local_path": relative(vtt) if vtt else None,
            "transcript_word_count": word_count,
            "transcript_blocks": transcript_blocks,
        }
    summary = {
        "url": PLAYLIST_URL,
        "title": playlist.get("title"),
        "video_count": len(playlist.get("entries", [])),
        "total_duration_seconds": sum(int(entry.get("duration") or 0) for entry in playlist.get("entries", [])),
        "local_metadata_path": relative(playlist_path),
    }
    return summary, lecture_videos


def attach_local_materials(lectures: list[dict]) -> None:
    lecture_root = SOURCE_ROOT / "lectures"
    for lecture in lectures:
        number = lecture["number"]
        py_path = lecture_root / f"lecture_{number:02d}.py"
        pdf_path = lecture_root / f"lecture_{number:02d}.pdf"
        source_file = py_path if py_path.exists() else pdf_path if pdf_path.exists() else None
        lecture["local_material_path"] = relative(source_file) if source_file else None
        lecture["local_interactive_url"] = (
            f"{relative(lecture_root / 'index.html')}?trace=lecture_{number:02d}" if py_path.exists() else None
        )


def attach_assignment_links(lectures: list[dict], assignments: dict[int, dict]) -> None:
    for lecture in lectures:
        text = lecture.get("deadlines") or ""
        for number in assignments:
            if f"Assignment {number} out" in text:
                assignments[number]["release_date"] = lecture["date"]
                assignments[number]["official_links"] = lecture["deadline_links"]
            if f"Assignment {number} due" in text:
                assignments[number]["due_date"] = lecture["date"]
    for assignment in assignments.values():
        assignment.setdefault("release_date", None)
        assignment.setdefault("due_date", None)
        assignment.setdefault("official_links", [])


def main() -> None:
    _, soup = fetch_course_page()
    lectures, calendar = parse_schedule(soup)
    assignments = parse_assignment_descriptions(soup)
    attach_assignment_links(lectures, assignments)
    attach_local_materials(lectures)
    playlist, lecture_videos = playlist_metadata()
    for lecture in lectures:
        lecture["video"] = lecture_videos.get(lecture["number"])

    snapshot = {
        "course": {
            "title": "CS336: Language Modeling from Scratch",
            "term": "Spring 2026",
            "url": COURSE_URL,
            "instructors": ["Tatsunori Hashimoto", "Percy Liang"],
            "positioning": "从数据清洗、tokenization、Transformer 实现、GPU kernel/并行训练、规模律与推理评测，一路推进到 SFT/RLVR 和多模态对齐的语言模型全生命周期课程。",
            "audience": "具备 Python、PyTorch、机器学习/概率基础，并愿意完成低脚手架、高实现强度作业的 AI/LLM 工程师与研究者。",
            "snapshot_date": SNAPSHOT_DATE,
            "raw_html_local_path": relative(SOURCE_ROOT / "course_page.html"),
        },
        "playlist": playlist,
        "lectures": lectures,
        "calendar": calendar,
        "assignments": [assignments[number] for number in sorted(assignments)],
        "modules": MODULES,
        "study_plan": STUDY_PLAN,
        "engineering_judgments": ENGINEERING_JUDGMENTS,
        "repositories": repo_metadata(),
        "coverage": {
            "schedule_lecture_count": len(lectures),
            "public_video_count": len(lecture_videos),
            "captioned_video_count": sum(bool(item.get("subtitle_local_path")) for item in lecture_videos.values()),
            "transcript_word_count": sum(item.get("transcript_word_count", 0) for item in lecture_videos.values()),
            "assignment_count": len(assignments),
            "local_lecture_material_count": sum(bool(item.get("local_material_path")) for item in lectures),
        },
        "limitations": [
            "课程页面当前列出 19 次课，但公开 YouTube playlist 只有 18 条；Daniel Selsam 嘉宾讲座没有出现在当前 playlist。",
            "第 18/19 讲的课程页没有给出技术主题；本快照不从讲者身份推断内容，第 19 讲仅保留录播入口与机器字幕。",
            "YouTube 字幕是英文自动字幕，已去除滚动重复并按分钟合并；人名、数字、公式和代码必须回到视频或课件核验。",
            "课程作业明确限制 AI 代理/自动补全实现作业。本地资料用于自学与理解，不应违反课程 honor code。",
            "作业 3 的课程训练 API 与课程 GPU 配额可能不对自学者开放，替代实验必须说明数据/算力差异。",
        ],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        json.dumps(
            {
                "output": str(OUTPUT),
                "lectures": len(lectures),
                "videos": len(lecture_videos),
                "captioned": snapshot["coverage"]["captioned_video_count"],
                "transcript_words": snapshot["coverage"]["transcript_word_count"],
                "assignments": len(assignments),
                "repositories": len(snapshot["repositories"]),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
