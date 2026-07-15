"""Build a static, self-contained learning knowledge base from the local reports.

The generated pages deliberately summarize and index public material instead of
copying third-party articles or papers.  Every original URL remains available
for follow-up reading when a network connection is present.
"""

from __future__ import annotations

import csv
import html
import json
import re
import shutil
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "ai_offline_knowledge_base"
DATA = OUT / "data"

INPUTS = [
    "report.md",
    "report.html",
    "reading_matrix.csv",
    "schedule.json",
    "study_plan.md",
    "diffusion_technical_report.html",
    "llm_reasoning_transformer_study_guide.html",
]

DIRECT_SOURCES = [
    ("MIT MAS.S60 How2AI Spring 2025 Schedule", "https://mit-mi.github.io/how2ai-course/spring2025/schedule/"),
    ("Vincent 教你学 Generative AI：扩散模型", "https://taohu.me/vincent-genai-course/diffusion.html"),
    ("Caltech CS 159 Spring 2025 Lectures", "https://sites.google.com/view/cs-159-spring2025/lectures"),
    ("Lilian Weng · Lil'Log", "https://lilianweng.github.io/"),
    ("Transformer Taxonomy", "https://kipp.ly/p/transformer-taxonomy"),
    ("Thinking Machines · Connectionism", "https://thinkingmachines.ai/blog/"),
    ("Labelbox Blog", "https://labelbox.com/blog/"),
    ("Stanford CS25: Transformers United V6", "https://web.stanford.edu/class/cs25/"),
    ("Stanford CS336: Language Modeling from Scratch", "https://cs336.stanford.edu/"),
    ("Andrej Karpathy GitHub", "https://github.com/karpathy"),
    ("Ostris AI Toolkit", "https://github.com/ostris/ai-toolkit"),
    ("Kaggle 5-Day Gen AI Intensive", "https://www.youtube.com/playlist?list=PLqFaTIg4myu-b1PlxitQdY0UYIbys-2es"),
    ("AI Agent 架构趋势及演进", "https://www.bilibili.com/video/BV1ADWCzrEXL/"),
]

KARPATHY_SNAPSHOT_DATE = "2026-07-15"
KARPATHY_REPOS_SNAPSHOT = ROOT / "tools" / "data" / "karpathy_repos_snapshot.json"
MICROGPT_GIST_URL = "https://gist.github.com/karpathy/1e8112ad2d25af2436fc4f80b87efeec"
AI_TOOLKIT_REPO_URL = "https://github.com/ostris/ai-toolkit"
AI_TOOLKIT_FAQ_URL = "https://github.com/ostris/ai-toolkit/blob/main/FAQ.md"
AI_TOOLKIT_SNAPSHOT_DATE = "2026-07-15"
AI_TOOLKIT_REPO_SNAPSHOT = ROOT / "tools" / "data" / "ai_toolkit_repo_snapshot.json"
AI_TOOLKIT_TREE_SNAPSHOT = ROOT / "tools" / "data" / "ai_toolkit_tree_snapshot.json"
KAGGLE_GENAI_PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLqFaTIg4myu-b1PlxitQdY0UYIbys-2es"
KAGGLE_GENAI_SNAPSHOT = ROOT / "tools" / "data" / "kaggle_genai_course_snapshot.json"
KAGGLE_GENAI_SOURCE_ROOT = ROOT / "tools" / "data" / "kaggle_genai_source"
KAGGLE_GENAI_FRAME_ROOT = ROOT / "tools" / "data" / "kaggle_genai_frames"
BILIBILI_AGENT_VIDEO_URL = "https://www.bilibili.com/video/BV1ADWCzrEXL/"
BILIBILI_AGENT_SNAPSHOT = ROOT / "tools" / "data" / "bilibili_agent_architecture_snapshot.json"
BILIBILI_AGENT_TRANSCRIPT = ROOT / "tools" / "data" / "bilibili_agent_architecture_transcript.json"
BILIBILI_AGENT_FRAME_ROOT = ROOT / "tools" / "data" / "bilibili_agent_architecture_frames"
CS336_URL = "https://cs336.stanford.edu/"
CS336_PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLoROMvodv4rMqXOcazWaTUHhq-yembLCV"
CS336_SNAPSHOT = ROOT / "tools" / "data" / "stanford_cs336_snapshot.json"

AI_TOOLKIT_SUPPORTED_MODELS = [
    {"category": "图像生成", "name": "FLUX.1-dev", "url": "https://huggingface.co/black-forest-labs/FLUX.1-dev"},
    {"category": "图像生成", "name": "FLUX.2-dev", "url": "https://huggingface.co/black-forest-labs/FLUX.2-dev"},
    {"category": "图像生成", "name": "FLUX.2-klein-base-4B", "url": "https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B"},
    {"category": "图像生成", "name": "FLUX.2-klein-base-9B", "url": "https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B"},
    {"category": "图像生成", "name": "Flex.1-alpha", "url": "https://huggingface.co/ostris/Flex.1-alpha"},
    {"category": "图像生成", "name": "Flex.2-preview", "url": "https://huggingface.co/ostris/Flex.2-preview"},
    {"category": "图像生成", "name": "Chroma1-Base", "url": "https://huggingface.co/lodestones/Chroma1-Base"},
    {"category": "图像生成", "name": "Lumina-Image-2.0", "url": "https://huggingface.co/Alpha-VLLM/Lumina-Image-2.0"},
    {"category": "图像生成", "name": "Qwen-Image", "url": "https://huggingface.co/Qwen/Qwen-Image"},
    {"category": "图像生成", "name": "Qwen-Image-2512", "url": "https://huggingface.co/Qwen/Qwen-Image-2512"},
    {"category": "图像生成", "name": "HiDream-I1-Full", "url": "https://huggingface.co/HiDream-ai/HiDream-I1-Full"},
    {"category": "图像生成", "name": "OmniGen2", "url": "https://huggingface.co/OmniGen2/OmniGen2"},
    {"category": "图像生成", "name": "Z-Image-Turbo", "url": "https://huggingface.co/Tongyi-MAI/Z-Image-Turbo"},
    {"category": "图像生成", "name": "Z-Image", "url": "https://huggingface.co/Tongyi-MAI/Z-Image"},
    {"category": "图像生成", "name": "Z-Image-De-Turbo", "url": "https://huggingface.co/ostris/Z-Image-De-Turbo"},
    {"category": "图像生成", "name": "SDXL", "url": "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0"},
    {"category": "图像生成", "name": "SD 1.5", "url": "https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5"},
    {"category": "图像生成", "name": "ERNIE-Image", "url": "https://huggingface.co/baidu/ERNIE-Image"},
    {"category": "图像生成", "name": "Nucleus-Image", "url": "https://huggingface.co/NucleusAI/Nucleus-Image"},
    {"category": "图像生成", "name": "Boogu Image 0.1", "url": "https://huggingface.co/Boogu/Boogu-Image-0.1-Base"},
    {"category": "图像生成", "name": "HiDream O1 Image", "url": "https://huggingface.co/HiDream-ai/HiDream-O1-Image"},
    {"category": "图像生成", "name": "PRXPixel", "url": "https://huggingface.co/Photoroom/prxpixel-t2i"},
    {"category": "指令编辑", "name": "FLUX.1-Kontext-dev", "url": "https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev"},
    {"category": "指令编辑", "name": "Qwen-Image-Edit", "url": "https://huggingface.co/Qwen/Qwen-Image-Edit"},
    {"category": "指令编辑", "name": "Qwen-Image-Edit-2509", "url": "https://huggingface.co/Qwen/Qwen-Image-Edit-2509"},
    {"category": "指令编辑", "name": "Qwen-Image-Edit-2511", "url": "https://huggingface.co/Qwen/Qwen-Image-Edit-2511"},
    {"category": "指令编辑", "name": "HiDream-E1-1", "url": "https://huggingface.co/HiDream-ai/HiDream-E1-1"},
    {"category": "指令编辑", "name": "Boogu Image Edit", "url": "https://huggingface.co/Boogu/Boogu-Image-0.1-Edit"},
    {"category": "视频生成", "name": "Wan2.1 T2V 1.3B", "url": "https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers"},
    {"category": "视频生成", "name": "Wan2.1 I2V 14B 480P", "url": "https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P-Diffusers"},
    {"category": "视频生成", "name": "Wan2.1 I2V 14B 720P", "url": "https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P-Diffusers"},
    {"category": "视频生成", "name": "Wan2.1 T2V 14B", "url": "https://huggingface.co/Wan-AI/Wan2.1-T2V-14B-Diffusers"},
    {"category": "视频生成", "name": "Wan2.2 T2V A14B", "url": "https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers"},
    {"category": "视频生成", "name": "Wan2.2 I2V A14B", "url": "https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers"},
    {"category": "视频生成", "name": "Wan2.2 TI2V 5B", "url": "https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers"},
    {"category": "视频生成", "name": "LTX-2", "url": "https://huggingface.co/Lightricks/LTX-2"},
    {"category": "视频生成", "name": "LTX-2.3", "url": "https://huggingface.co/Lightricks/LTX-2.3"},
    {"category": "视频生成", "name": "Krea 2", "url": "https://huggingface.co/krea/Krea-2-Raw"},
    {"category": "音频生成", "name": "Ace Step 1.5", "url": "https://huggingface.co/ACE-Step/Ace-Step1.5"},
    {"category": "音频生成", "name": "Ace Step 1.5 XL", "url": "https://huggingface.co/ACE-Step/acestep-v15-xl-base"},
    {"category": "实验支持", "name": "Zeta-Chroma", "url": "https://huggingface.co/lodestones/Zeta-Chroma"},
    {"category": "实验支持", "name": "Ideogram 4 FP8", "url": "https://huggingface.co/ideogram-ai/ideogram-4-fp8"},
]

AI_TOOLKIT_LEARNING_STAGES = [
    {"order": 1, "title": "环境与任务边界", "focus": "先选图像、编辑、视频或音频任务，再核对 Python、GPU、显存与模型许可。", "output": "锁定环境与单卡空跑记录"},
    {"order": 2, "title": "数据、Caption 与 Buckets", "focus": "建立图像/文本配对、trigger、caption dropout、分辨率桶和 held-out 集。", "output": "可审计数据清单与分桶统计"},
    {"order": 3, "title": "模型、精度与量化", "focus": "区分 backbone、text encoder、VAE、dtype、quantize、qtype、low_vram 与 cache。", "output": "显存、速度与质量基线"},
    {"order": 4, "title": "LoRA、LoKr 与层选择", "focus": "比较 rank/alpha、全量微调、LoKr、only_if_contains 与 ignore_if_contains。", "output": "单变量适配策略消融"},
    {"order": 5, "title": "Checkpoint、采样与评测", "focus": "固定 prompt、seed、采样间隔和保留策略，分开测身份、风格、构图与失败率。", "output": "质量—成本—可恢复性报告"},
    {"order": 6, "title": "UI、CLI 与运行安全", "focus": "理解 YAML job 调度、恢复、日志、UI token、云端运行与中断边界。", "output": "可重复运行手册与故障演练"},
]

AI_TOOLKIT_ARCHITECTURE_FILES = [
    {"path": "run.py", "role": "CLI 入口：加载一个或多个 YAML、处理恢复/名称替换、设置运行环境并顺序执行 job。"},
    {"path": "toolkit/job.py", "role": "Job 工厂：根据配置把任务路由到 Train、Extract、Generate、Mod 或 Extension。"},
    {"path": "jobs/TrainJob.py", "role": "训练 Job：组织训练 processes 及其生命周期。"},
    {"path": "jobs/process/BaseSDTrainProcess.py", "role": "核心训练过程：连接模型、数据、优化器、采样、保存与日志。"},
    {"path": "toolkit/config_modules.py", "role": "类型化配置模块：Save、Logging、Sample、Network、Train、Model 与 Dataset 等。"},
    {"path": "toolkit/data_loader.py", "role": "数据加载入口：把数据集配置接入 caption、bucket、cache 和 batch。"},
    {"path": "jobs/ExtensionJob.py", "role": "扩展任务入口：允许内置或外部 extension 注入专用训练/生成流程。"},
]

AI_TOOLKIT_CONFIG_SECTIONS = [
    {"name": "name / process / device", "question": "这是什么 job，在什么设备上跑？", "check": "先做最小 dry run；名称、设备与 process 类型写入实验记录。"},
    {"name": "network", "question": "训练 LoRA、LoKr，还是选择特定层？", "check": "记录 type、linear、linear_alpha、only_if_contains 与 ignore_if_contains。"},
    {"name": "datasets", "question": "样本、caption、trigger、resolution 和 cache 如何进入训练？", "check": "审计同名文本、分桶分布、caption dropout、重复样本与 held-out 泄漏。"},
    {"name": "train", "question": "优化目标、步数、优化器与精度如何组合？", "check": "固定 batch/steps/lr/dtype；flowmatch 等目标必须与模型示例一致。"},
    {"name": "model", "question": "加载哪个 backbone，哪些部件量化或低显存运行？", "check": "分别记录模型名、quantize/qtype、text encoder 精度、low_vram 与 cache。"},
    {"name": "save / sample / logging / meta", "question": "如何保存、观察、恢复并追溯实验？", "check": "固定 prompt/seed，保留关键 checkpoint，并把配置、版本和样本归档。"},
]

PRIORITY_RANK = {"must-read": 0, "recommended": 1, "optional": 2}

CAT_FOUNDATIONS = "AI research foundations"
CAT_DATA = "Data, representation, and generalization"
CAT_MODELS = "Model architectures"
CAT_MULTIMODAL = "Multimodal learning"
CAT_FOUNDATION_MODELS = "Large foundation models"
CAT_GENERATIVE = "Generative models"
CAT_INTERACTION = "Interactive agents and Human-AI interaction"


LILIAN_ANNOTATIONS = {
    "/posts/2022-02-20-active-learning": (CAT_DATA, "主动学习关注如何选择最有信息量的样本进行标注，适合设计有限标注预算下的数据迭代闭环。"),
    "/posts/2023-10-25-adv-attack-llm": (CAT_INTERACTION, "梳理 LLM 对抗攻击与防御面，用于建立 prompt、模型输出和工具调用层的红队威胁模型。"),
    "/posts/2018-06-24-attention": (CAT_MODELS, "从注意力机制及其变体建立 Transformer 的前置直觉，重点理解 query、key、value 与对齐权重。"),
    "/posts/2021-05-31-contrastive": (CAT_DATA, "梳理对比表示学习的目标、正负样本和增强策略，是理解 CLIP 与多模态 alignment 的基础。"),
    "/posts/2021-01-02-controllable-text-generation": (CAT_GENERATIVE, "总结可控文本生成的条件、属性控制和解码思路，用于区分模型能力与推理时控制接口。"),
    "/posts/2022-04-15-data-gen": (CAT_DATA, "讨论数据增强与合成数据生成方法，适合评估数据覆盖、标签噪声和分布偏移。"),
    "/posts/2024-04-12-diffusion-video": (CAT_GENERATIVE, "梳理视频扩散中的时空建模、条件控制与长序列一致性问题，连接图像扩散和视频生成。"),
    "/posts/2020-06-07-exploration-drl": (CAT_INTERACTION, "总结深度强化学习的探索策略，用于理解 Agent 如何在回报稀疏或状态未知时收集有效经验。"),
    "/posts/2024-07-07-hallucination": (CAT_INTERACTION, "聚焦无法由上下文或世界知识支撑的外在幻觉，并整理检测、归因与缓解方向。"),
    "/posts/2018-10-13-flow-models": (CAT_GENERATIVE, "介绍可逆变换、精确似然和 normalizing flow，为 Real NVP、Glow 与后续流式生成方法建立基础。"),
    "/posts/2022-06-09-vlm": (CAT_MULTIMODAL, "梳理视觉语言模型的表示、预训练任务和跨模态接口，适合对照双塔、融合与生成式 VLM。"),
    "/posts/2024-02-05-human-data-quality": (CAT_DATA, "讨论高质量人类数据的采集、筛选与反馈价值，强调数据质量不能只由规模替代。"),
    "/posts/2023-01-10-inference-optimization": (CAT_FOUNDATION_MODELS, "总结大模型推理中的内存、并行、量化和解码效率问题，用于建立 latency、throughput 与显存的成本模型。"),
    "/posts/2023-06-23-agent": (CAT_INTERACTION, "以规划、记忆和工具使用组织 LLM Agent，适合作为构建状态化执行闭环的架构总览。"),
    "/posts/2018-11-30-meta-learning": (CAT_DATA, "介绍 meta-learning 的任务分布与快速适应思想，用于理解模型如何从多任务经验迁移到新任务。"),
    "/posts/2020-10-29-odqa": (CAT_INTERACTION, "拆解开放域问答中的检索、阅读与答案生成链路，是 RAG 和检索型 Agent 的系统前置。"),
    "/posts/2018-04-08-policy-gradient": (CAT_INTERACTION, "梳理策略梯度及其方差、基线和优化问题，是理解 RLHF、PPO 与 Agent 学习的数学基础。"),
    "/posts/2023-03-15-prompt-engineering": (CAT_FOUNDATION_MODELS, "总结提示设计、上下文示例与推理引导方法；实践中应把 prompt 版本、模型版本和评测集共同管理。"),
    "/posts/2021-03-21-lm-toxicity": (CAT_INTERACTION, "讨论语言模型毒性来源、评测与缓解方法，用于建立安全评测和误拒之间的权衡。"),
    "/posts/2024-11-28-reward-hacking": (CAT_INTERACTION, "分析 Agent 利用奖励漏洞而非完成真实目标的现象，强调代理指标、环境与监督器需要共同审计。"),
    "/posts/2018-02-19-rl-overview": (CAT_INTERACTION, "系统介绍强化学习的状态、动作、回报、价值函数和策略，为 Agent 与偏好优化提供基础。"),
    "/posts/2026-06-24-scaling-laws": (CAT_FOUNDATION_MODELS, "审视参数、数据、计算与损失之间的经验幂律，并强调拟合范围、数据质量和外推边界。"),
    "/posts/2019-11-10-self-supervised": (CAT_DATA, "梳理自监督任务如何从未标注数据构造训练信号，是 foundation model 预训练的表示学习基础。"),
    "/posts/2021-12-05-semi-supervised": (CAT_DATA, "总结半监督学习如何结合少量标签和大量未标注数据，并关注伪标签误差与分布假设。"),
    "/posts/2020-04-07-the-transformer-family": (CAT_MODELS, "梳理 Transformer 家族的注意力、位置表示与结构变体，适合建立模型架构演进坐标。"),
    "/posts/2021-09-25-train-large": (CAT_FOUNDATION_MODELS, "介绍数据并行、模型并行、流水线并行和内存优化，用于理解大模型训练的通信与显存约束。"),
    "/posts/2023-01-27-the-transformer-family-v2": (CAT_MODELS, "更新 Transformer 架构谱系，覆盖长上下文、稀疏化、位置编码和训练稳定性等方向。"),
    "/posts/2018-08-12-vae": (CAT_GENERATIVE, "从自编码器进入变分推断、潜变量与 ELBO，为 latent diffusion 的压缩表示建立基础。"),
    "/posts/2021-07-11-diffusion-models": (CAT_GENERATIVE, "解释扩散模型的前向加噪、反向去噪和 score 视角，是进入 DDPM 与 Score-SDE 的教程。"),
    "/posts/2025-05-01-thinking": (CAT_INTERACTION, "总结 test-time compute、Chain-of-Thought、搜索和验证为何可能改善推理，并讨论其适用边界。"),
}


ARXIV_ANNOTATIONS = {
    "1503.03585": (CAT_GENERATIVE, "提出以非平衡热力学启发的扩散过程进行无监督生成建模，是扩散概率模型的早期基础。"),
    "1505.04597": (CAT_MODELS, "U-Net 以对称编码器—解码器和跳跃连接结合语义与空间细节，成为分割与早期扩散骨干的重要基线。"),
    "1505.05770": (CAT_GENERATIVE, "将 normalizing flows 用于增强变分后验的表达能力，说明可逆变换如何改善变分推断。"),
    "2011.13456": (CAT_GENERATIVE, "用连续时间 SDE 统一前向扰动、反向生成与 probability-flow ODE，连接 score 建模和数值采样。"),
    "2112.10752": (CAT_GENERATIVE, "将扩散过程移入自编码器潜空间，以降低高分辨率生成成本，并通过条件接口支持文本到图像。"),
    "2302.00482": (CAT_GENERATIVE, "提出 generalized conditional flow matching，并使用 minibatch optimal transport 改善流路径和训练效率。"),
    "2308.08155": (CAT_INTERACTION, "AutoGen 用可配置、可对话的多 Agent 组件编排 LLM 应用，重点在角色、消息和工具执行的组合。"),
    "2303.01469": (CAT_GENERATIVE, "Consistency Models 学习同一生成轨迹上的一致映射，以支持一步或少步生成并降低扩散采样延迟。"),
    "1807.03039": (CAT_GENERATIVE, "Glow 以可逆 1×1 卷积构造流式生成模型，保留精确似然、可逆推断和并行采样。"),
    "2006.11239": (CAT_GENERATIVE, "DDPM 给出稳定的噪声预测训练与迭代反向采样配方，成为现代图像扩散的基础基线。"),
    "2306.05685": (CAT_INTERACTION, "以 MT-Bench 和 Chatbot Arena 研究 LLM-as-a-Judge，并暴露位置、冗长等评审偏差。"),
    "2408.03314": (CAT_INTERACTION, "研究如何按题目难度和验证能力分配 test-time compute，并比较增加推理预算与扩大模型规模。"),
    "2210.03629": (CAT_INTERACTION, "ReAct 在同一轨迹中交替生成推理与动作，使模型能调用外部环境并根据观察继续决策。"),
    "1605.08803": (CAT_GENERATIVE, "Real NVP 通过可逆耦合变换实现精确密度估计、潜变量推断与高效采样。"),
    "2209.03003": (CAT_GENERATIVE, "Rectified Flow 学习连接两分布的 ODE 传输，并通过重整使路径更直，以减少采样求解步数。"),
    "2406.03816": (CAT_INTERACTION, "ReST-MCTS* 用过程奖励引导树搜索并生成自训练数据，目标是提高中间推理步骤的质量。"),
    "2402.03610": (CAT_INTERACTION, "RAP 为多模态 Agent 检索历史计划与上下文经验，用于改进当前决策和长程任务规划。"),
    "2501.19393": (CAT_INTERACTION, "s1 探索简化的 test-time scaling 配方，通过监督数据和推理预算控制提升数学推理表现。"),
    "2211.03540": (CAT_INTERACTION, "建立 scalable oversight 的经验研究框架，检验较弱监督者如何评估可能更强的模型。"),
    "2203.11171": (CAT_INTERACTION, "Self-Consistency 对多条 Chain-of-Thought 采样结果进行答案聚合，用推理路径多样性替代贪心解码。"),
    "2402.03620": (CAT_INTERACTION, "SELF-DISCOVER 让模型为任务组合适用的推理模块，再按所得结构完成复杂问题。"),
    "2310.06117": (CAT_INTERACTION, "Step-Back Prompting 先抽象出高层概念和原则，再用这些原则指导具体问题求解。"),
    "2302.04761": (CAT_INTERACTION, "Toolformer 让语言模型从自生成候选调用中筛选训练样本，以自监督方式学习何时及如何调用工具。"),
    "2307.16789": (CAT_INTERACTION, "ToolLLM 构建大规模真实 API 指令数据和工具使用评测，用于训练开源模型完成多工具任务。"),
    "2312.09390": (CAT_INTERACTION, "研究用弱模型生成的标签监督更强模型，检验弱监督能否诱导强模型表达其潜在能力。"),
}


ARXIV_TITLES = {
    "1503.03585": "Deep Unsupervised Learning using Nonequilibrium Thermodynamics",
    "1505.04597": "U-Net: Convolutional Networks for Biomedical Image Segmentation",
    "1505.05770": "Variational Inference with Normalizing Flows",
    "2011.13456": "Score-Based Generative Modeling through Stochastic Differential Equations",
    "2112.10752": "High-Resolution Image Synthesis with Latent Diffusion Models",
    "2302.00482": "Improving and Generalizing Flow-Based Generative Models with Minibatch Optimal Transport",
    "2308.08155": "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation",
    "2303.01469": "Consistency Models",
    "1807.03039": "Glow: Generative Flow with Invertible 1x1 Convolutions",
    "2006.11239": "Denoising Diffusion Probabilistic Models",
    "2306.05685": "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena",
    "2408.03314": "Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters",
    "2210.03629": "ReAct: Synergizing Reasoning and Acting in Language Models",
    "1605.08803": "Density Estimation using Real NVP",
    "2209.03003": "Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow",
    "2406.03816": "ReST-MCTS*: LLM Self-Training via Process Reward Guided Tree Search",
    "2402.03610": "RAP: Retrieval-Augmented Planning with Contextual Memory for Multimodal LLM Agents",
    "2501.19393": "s1: Simple Test-Time Scaling",
    "2211.03540": "Measuring Progress on Scalable Oversight for Large Language Models",
    "2203.11171": "Self-Consistency Improves Chain of Thought Reasoning in Language Models",
    "2402.03620": "Self-Discover: Large Language Models Self-Compose Reasoning Structures",
    "2310.06117": "Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models",
    "2302.04761": "Toolformer: Language Models Can Teach Themselves to Use Tools",
    "2307.16789": "ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs",
    "2312.09390": "Weak-to-Strong Generalization: Eliciting Strong Capabilities With Weak Supervision",
}


GOOGLE_MATERIALS = {
    "https://drive.google.com/file/d/1Ax6SFByaqQ8Ikc-fi9aLWc_GfV0U6kQp/view?usp=sharing": (CAT_FOUNDATIONS, "CS 159 Introduction 课件：课程问题域与最小 LLM 操作链路。"),
    "https://colab.research.google.com/drive/138Y2L2JsTKxwZX6hUxIHyCw2xQJrfLFy?usp=sharing": (CAT_FOUNDATIONS, "CS 159 Introduction Notebook：用于运行最小 LLM 调用并熟悉实验环境。"),
    "https://drive.google.com/file/d/1Ofa-_-Qqd9RG070NG0bqN8MmwpYQv5VS/view?usp=share_link": (CAT_MODELS, "CS 159 Transformers and LLMs 课件：模型底座、上下文与推理入口。"),
    "https://docs.google.com/presentation/d/1B9XtA6dK8t_IVYxXuSm1wVl4zSolysnkY-r1fkv5xrE/edit?usp=sharing": (CAT_INTERACTION, "CS 159 Tool Use & Agents 课件：工具调用、状态、反馈与 Agent loop。"),
    "https://colab.research.google.com/drive/1DHFP1HicDlX7x73kagBfAnM0d09Q4ZyD?usp=sharing": (CAT_INTERACTION, "CS 159 Tool Use & Agents Notebook：实践工具 schema、调用与结果回填。"),
    "https://drive.google.com/file/d/1FlounPdUnOgiymznRh67qpp9453Roy_H/view?usp=sharing": (CAT_INTERACTION, "CS 159 Search & Planning 课件：候选生成、搜索、规划与验证。"),
    "https://colab.research.google.com/drive/1DnUrPl8d35Py9erS9ZIk7vMIDCD41Via?usp=sharing": (CAT_INTERACTION, "CS 159 Search & Planning Notebook：实现带外部搜索或规划循环的 Agent。"),
    "https://drive.google.com/file/d/1wvPtUBjbtadHRVs-DKVL_h1bRQr1jtKS/view?usp=sharing": (CAT_INTERACTION, "CS 159 Thinking & Planning 论文报告之一：推理结构、抽象与过程监督。"),
    "https://drive.google.com/file/d/1sqV_yByrV5eIndsy7llmoE_EJHnkXphW/view?usp=sharing": (CAT_INTERACTION, "CS 159 Thinking & Planning 论文报告之二：推理结构、抽象与过程监督。"),
    "https://drive.google.com/file/d/1NQa8MXGMLnlDq8SpAubDQVM1R5h8ikFT/view?usp=drive_link": (CAT_INTERACTION, "CS 159 Thinking & Planning 后续论文报告：用于同主题方法比较与批判性阅读。"),
    "https://drive.google.com/file/d/1t8Fj0xIgZsIlQhO2V6WSkYpehEttZcfy/view?usp=sharing": (CAT_INTERACTION, "CS 159 Search 论文报告之一：搜索策略、外部状态与评估。"),
    "https://drive.google.com/file/d/1-R-sQlnwpEg5NTTaUBMs9OffF9mP-C9c/view?usp=sharing": (CAT_INTERACTION, "CS 159 Search 论文报告之二：搜索策略、外部状态与评估。"),
    "https://drive.google.com/file/d/1UR5QqcjwT0jgOuAHiziQrrxXaL9rm2p4/view?usp=drive_link": (CAT_INTERACTION, "CS 159 Self-Learning Agents 论文报告之一：反思、经验回放与自我改进。"),
    "https://drive.google.com/file/d/1QgGbVSvu76jZiok2jGWcDwPUKntttkZx/view?usp=drive_link": (CAT_INTERACTION, "CS 159 Self-Learning Agents 论文报告之二：反思、经验回放与自我改进。"),
    "https://docs.google.com/presentation/d/1iBwOLBMFqiXAOgFuhUN84gUrCCWmt_M2-JVPfBxVfRk/edit?usp=sharing": (CAT_INTERACTION, "CS 159 Tool-Use 论文报告：工具选择、参数生成与可恢复执行。"),
    "https://docs.google.com/presentation/d/1dOFoghQ_CUUmpeT4Be3HEg2jsDUSjTGRS63Lbxs6MVg/edit?usp=sharing": (CAT_INTERACTION, "CS 159 Scientific Reasoning 论文报告：科学工作流、证据与假设验证。"),
}


TITLE_OVERRIDES = {
    "https://drive.google.com/file/d/1Ax6SFByaqQ8Ikc-fi9aLWc_GfV0U6kQp/view?usp=sharing": "CS 159 Introduction Slides",
    "https://colab.research.google.com/drive/138Y2L2JsTKxwZX6hUxIHyCw2xQJrfLFy?usp=sharing": "CS 159 Introduction Notebook",
    "https://drive.google.com/file/d/1Ofa-_-Qqd9RG070NG0bqN8MmwpYQv5VS/view?usp=share_link": "CS 159 Transformers and LLMs Slides",
    "https://docs.google.com/presentation/d/1B9XtA6dK8t_IVYxXuSm1wVl4zSolysnkY-r1fkv5xrE/edit?usp=sharing": "CS 159 Tool Use & Agents Slides",
    "https://colab.research.google.com/drive/1DHFP1HicDlX7x73kagBfAnM0d09Q4ZyD?usp=sharing": "CS 159 Tool Use & Agents Notebook",
    "https://drive.google.com/file/d/1FlounPdUnOgiymznRh67qpp9453Roy_H/view?usp=sharing": "CS 159 Search & Planning Slides",
    "https://colab.research.google.com/drive/1DnUrPl8d35Py9erS9ZIk7vMIDCD41Via?usp=sharing": "CS 159 Search & Planning Notebook",
    "https://drive.google.com/file/d/1wvPtUBjbtadHRVs-DKVL_h1bRQr1jtKS/view?usp=sharing": "CS 159 Thinking & Planning Presentation 1",
    "https://drive.google.com/file/d/1sqV_yByrV5eIndsy7llmoE_EJHnkXphW/view?usp=sharing": "CS 159 Thinking & Planning Presentation 2",
    "https://drive.google.com/file/d/1NQa8MXGMLnlDq8SpAubDQVM1R5h8ikFT/view?usp=drive_link": "CS 159 Thinking & Planning Follow-up Presentation",
    "https://drive.google.com/file/d/1t8Fj0xIgZsIlQhO2V6WSkYpehEttZcfy/view?usp=sharing": "CS 159 Search Presentation 1",
    "https://drive.google.com/file/d/1-R-sQlnwpEg5NTTaUBMs9OffF9mP-C9c/view?usp=sharing": "CS 159 Search Presentation 2",
    "https://drive.google.com/file/d/1UR5QqcjwT0jgOuAHiziQrrxXaL9rm2p4/view?usp=drive_link": "CS 159 Self-Learning Agents Presentation 1",
    "https://drive.google.com/file/d/1QgGbVSvu76jZiok2jGWcDwPUKntttkZx/view?usp=drive_link": "CS 159 Self-Learning Agents Presentation 2",
    "https://docs.google.com/presentation/d/1iBwOLBMFqiXAOgFuhUN84gUrCCWmt_M2-JVPfBxVfRk/edit?usp=sharing": "CS 159 Tool-Use Presentation",
    "https://docs.google.com/presentation/d/1dOFoghQ_CUUmpeT4Be3HEg2jsDUSjTGRS63Lbxs6MVg/edit?usp=sharing": "CS 159 Scientific Reasoning Presentation",
    "https://github.com/dongzhuoyao/awesome-flow-matching": "Awesome Flow Matching",
    "https://github.com/dongzhuoyao/vincent-genai-course": "Vincent Generative AI Course Repository",
}


TITLE_ANNOTATIONS = {
    "Shortcut Models": (CAT_GENERATIVE, "教程讨论以可变步长或跨时间步映射压缩生成路径的模型方向；具体目标和实现需结合源页确认。", "recommended"),
    "Stable Diffusion": (CAT_GENERATIVE, "教程入口：在 VAE 潜空间执行条件扩散，并用文本编码器和 cross-attention 控制图像生成。", "must-read"),
    "VAE 相关优化": (CAT_GENERATIVE, "教程入口：分析 VAE 编码、潜空间和解码重建如何影响 latent diffusion 的质量与压缩效率。", "recommended"),
    "扩散模型(Diffusion Model) - Vincent教你学 Generative AI": (CAT_GENERATIVE, "扩散专题总入口，覆盖 DDPM、score/SDE、flow matching、采样、潜空间、骨干、guidance 与应用。", "must-read"),
    "源页：Flow Matching": (CAT_GENERATIVE, "Flow Matching 教程入口：通过条件概率路径学习速度场，并以 ODE 将简单分布运输到数据分布。", "must-read"),
    "源页：Guidance": (CAT_GENERATIVE, "Guidance 教程入口：比较 classifier guidance 与 classifier-free guidance 对条件遵循和多样性的影响。", "recommended"),
    "源页：扩散模型的应用": (CAT_GENERATIVE, "扩散应用目录：图像、视频、音频、3D、文本条件生成与图像编辑。", "recommended"),
    "源页：理论基础": (CAT_GENERATIVE, "扩散理论目录：早期概率扩散、DDPM、score matching、Score-SDE、Flow Matching 与随机插值。", "must-read"),
    "源页：采样方法": (CAT_GENERATIVE, "扩散采样目录：从 ODE、DDIM 到 DPM，重点比较 NFE、误差、延迟与生成质量。", "must-read"),
    "源页：骨干网络": (CAT_MODELS, "生成模型骨干目录：比较 U-Net、Transformer/DiT、Mamba 与 Transformer U-Net 的结构和效率。", "recommended"),
    "Defeating Nondeterminism in LLM Inference": (CAT_FOUNDATIONS, "分析批处理和算子实现导致的推理非确定性，并以 batch-invariant kernels 提高实验可复现性。", "must-read"),
    "Interaction Models": (CAT_INTERACTION, "提出时间对齐的微回合交互模型，并将实时交互与异步后台推理/工具任务协同。", "recommended"),
    "LoRA Without Regret": (CAT_FOUNDATION_MODELS, "讨论 LoRA 与全参数微调的公平比较及适用边界，关注 rank、作用层、样本效率和多租户部署。", "must-read"),
    "Modular Manifolds": (CAT_MODELS, "从参数流形和尺度健康理解优化器设计，并以 Stiefel manifold 等约束讨论稳定更新。", "optional"),
    "On-Policy Distillation": (CAT_FOUNDATION_MODELS, "在学生实际生成的轨迹上让教师提供逐 token 稠密反馈，结合 on-policy 覆盖与蒸馏监督。", "must-read"),
    "The Future Worth Building Is Human": (CAT_INTERACTION, "从人类参与、可纠正性和本地知识出发讨论 AI 系统目标，适合作为 Human-AI 产品评测框架。", "optional"),
    "Thinking Machines Lab · Connectionism": (CAT_FOUNDATIONS, "Thinking Machines 技术博客总入口，聚焦后训练、交互模型、优化和可复现推理系统。", "recommended"),
    "EchoChain": (CAT_INTERACTION, "全双工语音推理 benchmark，测试模型在被打断、约束更新和目标变化时能否维护任务状态。", "recommended"),
    "Implicit Intelligence and Agent-as-a-World": (CAT_INTERACTION, "强调 Agent 需要从环境推断用户未明示的约束，并在不确定时澄清或采取保守行动。", "recommended"),
    "Introducing Recursion": (CAT_INTERACTION, "以可执行工作流环境、trajectory 级评测和训练回流组织 specialist Agent 的持续改进闭环。", "recommended"),
    "Labelbox Blog": (CAT_INTERACTION, "Labelbox 技术博客总入口，主题集中于 Agent 环境、强化学习、评测、安全和企业 AI 系统。", "recommended"),
    "Measuring Monitorability Disposition": (CAT_INTERACTION, "评测模型是否主动保持在监督下、选择何种监控者以及是否关闭监控，补充传统行为安全指标。", "recommended"),
    "Meta’s GIM": (CAT_INTERACTION, "介绍 Grounded Integration Measure，以约束、歧义、空间状态和认识论判断的组合测试集成推理。", "recommended"),
    "The AI Safety Illusion": (CAT_INTERACTION, "质疑依赖明显触发词和重复模板的安全数据集，建议用同意图改写和分布外攻击评测真实风险。", "recommended"),
    "Caltech CS 159 Spring 2025 Lectures": (CAT_INTERACTION, "CS 159 讲次总入口，课程围绕 tool use、search/planning、自学习 Agent 与多类推理任务组织。", "must-read"),
    "notebooks & instructions": (CAT_FOUNDATIONS, "CS 159 实践环境与 Notebook 入口，涵盖模型调用、本地模型以及基础 Agent 示例。", "recommended"),
    "project guidelines": (CAT_FOUNDATIONS, "CS 159 项目指南：要求明确研究问题、相关工作假设、baseline、指标、实验与失败反思。", "must-read"),
    "课程 readings & resources": (CAT_INTERACTION, "CS 159 参考资料目录，按 benchmark、推理、搜索、Agent、监督、工具、数学和视觉任务分类。", "must-read"),
    "课程主页": (CAT_INTERACTION, "CS 159 课程定位与交付要求：理解推理任务、构建应用、拆解论文并完成研究项目。", "recommended"),
    "Transformer Taxonomy (the last lit review)": (CAT_MODELS, "2023 年 Transformer 文献坐标，分类整理模型、架构变化、后训练、训练技巧与推理接口；不覆盖完整系统和 alignment。", "must-read"),
    "GitHub": (CAT_GENERATIVE, "Flow Matching 课程/代码资源入口；本地仅确认仓库主题，具体实现、依赖与实验结果需查看仓库。", "optional"),
    "Shortcut": (CAT_GENERATIVE, "Shortcut Models 配套视频，用于理解少步生成与可变推理预算；具体方法以视频和论文为准。", "optional"),
    "VAE": (CAT_GENERATIVE, "VAE 配套视频，复习潜变量、编码/解码和重建质量对 latent diffusion 的影响。", "optional"),
    "DSPy": (CAT_INTERACTION, "DSPy 将 LM 工作流表示为可组合模块并通过优化器改进提示或示例；具体算法与结果需阅读论文。", "recommended"),
    "AlphaGeometry": (CAT_INTERACTION, "AlphaGeometry 将语言模型生成与符号推理结合用于奥林匹克几何问题，体现生成、搜索和验证的组合。", "recommended"),
}


CS25_LECTURES = [
    {
        "date": "2026-04-02",
        "title": "Overview of Transformers",
        "speaker": "CS25 instructors",
        "category": CAT_MODELS,
        "summary": "回顾 ML/NLP 与 Transformer 的历史、工作机制、影响、近期突破和开放挑战，并以小数据语言学习、RAG-aware scaling、渐进扩层、fMRI 表征和幻觉定义展示研究切面。",
        "engineering_value": "建立统一模型卡：tokenization、attention、训练数据、参数知识、检索知识、评测和失败模式。",
        "slides_url": "https://drive.google.com/file/d/153Gu4BIfpnn6jj6WmXlsyD7kv702zcrB/view?usp=sharing",
        "video_url": "https://www.youtube.com/watch?v=bHSDPgZYie0",
        "readings": [
            {"title": "Baby Scale: Investigating Models Trained on Individual Children's Language Input", "url": "https://arxiv.org/abs/2603.29522", "category": CAT_DATA, "note": "在儿童自然语言输入量级上训练模型，研究数据规模、个体数据差异与语言能力涌现。"},
            {"title": "Bringing Up a Bilingual BabyLM: Investigating Multilingual Language Acquisition Using Small-Scale Models", "url": "https://arxiv.org/abs/2603.29552", "category": CAT_DATA, "note": "用小规模语言模型模拟不同双语输入结构，研究多语言学习的数据配置与能力差异。"},
            {"title": "To Memorize or to Retrieve: Scaling Laws for RAG-Considerate Pretraining", "url": "https://arxiv.org/abs/2604.00715", "category": CAT_FOUNDATION_MODELS, "note": "在固定数据预算下研究预训练语料与检索库之间的分配，连接参数记忆、RAG 与 scaling laws。"},
            {"title": "Curriculum-Guided Layer Scaling for Language Model Pretraining", "url": "https://arxiv.org/abs/2506.11389", "category": CAT_FOUNDATION_MODELS, "note": "将数据难度课程与渐进增加网络层数同步，探索更节省计算的语言模型预训练。"},
            {"title": "Interpretable Cross-Network Attention for Resting-State fMRI Representation Learning", "url": "https://arxiv.org/abs/2603.00786", "category": CAT_MULTIMODAL, "note": "以 masked reconstruction 和跨脑网络 attention 学习可解释的静息态 fMRI 表征。"},
            {"title": "A Unified Definition of Hallucination: It's The World Model, Stupid!", "url": "https://arxiv.org/abs/2512.21577", "category": CAT_INTERACTION, "note": "尝试把多种幻觉定义统一为可被用户观察到的不准确内部世界建模；属于概念框架，需结合原文边界阅读。"},
        ],
    },
    {
        "date": "2026-04-09",
        "title": "From Representation Learning to World Modeling through Joint Embedding Predictive Architectures",
        "speaker": "Hazel Nam & Lucas Maes",
        "category": CAT_DATA,
        "summary": "以 Causal-JEPA 和 LeWorldModel 说明世界模型从像素重建转向潜空间预测：前者加入对象级关系偏置，后者强调从原始像素端到端稳定训练的简洁配方。",
        "engineering_value": "比较重建目标与潜空间预测目标，并分别消融结构偏置、规划质量和控制任务效率。",
        "slides_url": "https://drive.google.com/file/d/1bF5Yfzf-FG5iNIAgsXn2DwVD3l3ymvZW/view?usp=drive_fs",
        "video_url": None,
        "readings": [],
    },
    {
        "date": "2026-04-16",
        "title": "On the Tradeoffs of State Space Models and Transformers",
        "speaker": "Albert Gu",
        "category": CAT_MODELS,
        "summary": "比较次二次 State Space Models、现代线性序列模型与 Transformer 的建模和性能特征，强调数据分辨率、tokenization 与应用域会改变架构优劣，并讨论 tokenizer-free H-Nets。",
        "engineering_value": "同一数据、参数预算和硬件上比较质量、吞吐、长序列内存与 tokenizer 成本，避免只比较理论复杂度。",
        "slides_url": None,
        "video_url": "https://www.youtube.com/watch?v=OyimE74UMF8&list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM&index=44",
        "readings": [],
    },
    {
        "date": "2026-04-23",
        "title": "The Ultra-Scale Talk: Scaling Training to Thousands of GPUs",
        "speaker": "Nouamane Tazi",
        "category": CAT_FOUNDATION_MODELS,
        "summary": "从工程角度解释 5D parallelism、MoE 的扩展与稳定性、通信模式、性能调优和大规模训练 benchmark。",
        "engineering_value": "用算力利用率、通信占比、显存峰值、故障恢复和有效 tokens/s 评估分布式训练方案。",
        "slides_url": "https://drive.google.com/file/d/1dxdC76Rk_o6UEd5AqhHjp0rapsxYOR6j/view?usp=sharing",
        "video_url": None,
        "readings": [],
    },
    {
        "date": "2026-04-30",
        "title": "From Next-Token Prediction to Next-Generation Intelligence: The Future of Pretraining",
        "speaker": "Shrimai Prabhumoye",
        "category": CAT_FOUNDATION_MODELS,
        "summary": "讨论数据选择、混合和排序、前置 reasoning-rich data，以及在预训练阶段使用强化学习目标将 Chain-of-Thought 作为探索行为。",
        "engineering_value": "对照随机数据顺序、课程式预训练和 post-training，验证能力来自数据排序还是额外计算/数据。",
        "slides_url": "https://drive.google.com/open?id=1dxdC76Rk_o6UEd5AqhHjp0rapsxYOR6j&usp=drive_fs",
        "video_url": None,
        "readings": [],
    },
    {
        "date": "2026-05-07",
        "title": "Distinct Modes of Generalization from Parameters and Context, and Paths to Bridge the Gap",
        "speaker": "Andrew Lampinen",
        "category": CAT_DATA,
        "summary": "比较知识通过参数更新与上下文输入获得时产生的不同泛化模式，并讨论数据增强、检索和强化学习如何缩小差距。",
        "engineering_value": "为同一知识设计 fine-tuning、in-context 和 retrieval 三种注入方式，测试组合泛化与分布外迁移。",
        "slides_url": "https://drive.google.com/file/d/1-YIOa5Yal4RCjAsV-0tnW_NNDGbY1GTo/view?usp=sharing",
        "video_url": None,
        "readings": [],
    },
    {
        "date": "2026-05-14",
        "title": "Advancing Science and Medicine with Collaborative AI Agents",
        "speaker": "Vivek Natarajan",
        "category": CAT_INTERACTION,
        "summary": "以 AI co-scientist 和 AMIE 为例讨论协作式科学/医疗系统：多 Agent 生成与改进假设，以及辅助临床推理和医生决策。页面中的效果描述属于特定研究设置，不能直接外推到临床部署。",
        "engineering_value": "将模型准确率与实验验证、证据追溯、专家复核、风险分级和 human override 分开评估。",
        "slides_url": None,
        "video_url": None,
        "readings": [],
    },
    {
        "date": "2026-05-21",
        "title": "From Language Models to Native Multimodal Intelligence",
        "speaker": "Victoria Lin",
        "category": CAT_MULTIMODAL,
        "summary": "讨论从语言模型走向原生多模态系统时可迁移的架构/训练原则，以及模态表示、自回归建模、稀疏性、模态专家化和实时多模态的新问题。",
        "engineering_value": "明确共享抽象推理与 modality-aware computation 的边界，并分别测跨模态利用率、延迟和专业化收益。",
        "slides_url": "https://drive.google.com/file/d/10Doblrt3Le_FpbVQoMP0DbuCIO3rtWPW/view?usp=sharing",
        "video_url": None,
        "readings": [],
    },
    {
        "date": "2026-05-28",
        "title": "Serving Transformers: Lessons from the Trenches of Production Inference",
        "speaker": "Charles Frye",
        "category": CAT_FOUNDATION_MODELS,
        "summary": "把 Transformer 从训练推向生产 serving，关注大规模 GPU 推理中的前向计算、批处理、吞吐、延迟和工程故障经验。",
        "engineering_value": "建立 p50/p95 latency、tokens/s、KV cache、batch 组成、冷启动、故障率与单位请求成本的生产基线。",
        "slides_url": "https://drive.google.com/file/d/1mwRSslwZUCph1Au-9tY3ZJPrjXTnbAxm/view?usp=drive_fs",
        "video_url": None,
        "readings": [],
    },
]


CS25_RECORDINGS = [
    {"title": "Stanford CS25 V6: Overview of Transformers", "speaker": "CS25 instructors", "url": "https://www.youtube.com/watch?v=bHSDPgZYie0", "category": CAT_MODELS, "note": "V6 Transformer 总览录播，与 2026-04-02 讲次对应。"},
    {"title": "On the Tradeoffs of State Space Models and Transformers", "speaker": "Albert Gu", "url": "https://www.youtube.com/watch?v=OyimE74UMF8&list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM&index=44", "category": CAT_MODELS, "note": "比较 SSM、线性模型和 Transformer 的架构与性能权衡。"},
    {"title": "Introduction to Transformers", "speaker": "CS25 instructors & Andrej Karpathy", "url": "https://www.youtube.com/watch?v=XfpMkf4rD6E&list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM", "category": CAT_MODELS, "note": "历届课程的 Transformer 基础录播，适合在前沿讲座前补齐模型机制。"},
    {"title": "Intuition on LMs, Shaping the Future of AI", "speaker": "Jason Wei & Hyung Won Chung", "url": "https://www.youtube.com/watch?v=3gb-ZkVRemQ&list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM", "category": CAT_FOUNDATION_MODELS, "note": "从语言模型能力与研究趋势建立直觉；具体主张需结合录播上下文。"},
    {"title": "Stop Worrying and Love the Transformer", "speaker": "Ashish Vaswani", "url": "https://www.youtube.com/watch?v=1GbDTTK3aR4&list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM", "category": CAT_MODELS, "note": "Transformer 设计与发展视角的历届讲座录播。"},
    {"title": "Aligning Open Language Models", "speaker": "Nathan Lambert", "url": "https://www.youtube.com/watch?v=AdLgPmcrXwQ&list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM", "category": CAT_FOUNDATION_MODELS, "note": "开放语言模型 alignment 录播，适合连接 SFT、偏好数据和后训练评测。"},
    {"title": "Retrieval Augmented Language Models", "speaker": "Douwe Kiela", "url": "https://www.youtube.com/watch?v=mE7IDf2SmJg&list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM", "category": CAT_INTERACTION, "note": "RAG 录播，连接参数知识、外部检索、上下文构造和答案评测。"},
    {"title": "Generalist Agents in Open-Ended Worlds", "speaker": "Jim Fan", "url": "https://www.youtube.com/watch?v=wwQ1LQA3RCU&list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM", "category": CAT_INTERACTION, "note": "开放世界通用 Agent 录播，适合关注环境、技能积累和长程执行。"},
    {"title": "Whole-Part Hierarchies in a Neural Network", "speaker": "Geoffrey Hinton", "url": "https://www.youtube.com/watch?v=CYaju6aCMoQ&list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM", "category": CAT_MODELS, "note": "讨论神经网络中的整体—部分层级表示；具体机制和证据需观看录播确认。"},
]


KNOWLEDGE_STAGES = [
    {
        "id": "research",
        "order": 1,
        "title": "研究方法与可复现实验",
        "short_title": "研究方法",
        "question": "如何把一个想法变成可证伪、可复现、可比较的技术结论？",
        "summary": "合并 How2AI 的研究入门、CS 159 的论文/项目方法、训练调试和实验记录。它是后续所有模型知识的操作系统。",
        "dependencies": [],
        "concepts": ["问题定义", "数据版本", "baseline", "指标", "消融", "失败分析", "复现"],
        "engineering_output": "统一实验模板：假设、数据、模型、配置、seed、指标、成本、失败样例和结论边界。",
        "source_synthesis": "How2AI 给研究流程；CS 159 给 Champion/Critic/Pioneer/Entrepreneur 与项目交付；训练 recipe 给调试顺序。",
        "core_titles": ["A Recipe for Training Neural Networks", "project guidelines", "Introduction to AI Research [slides]"],
    },
    {
        "id": "representation",
        "order": 2,
        "title": "数据、表征、泛化与世界模型",
        "short_title": "数据与表征",
        "question": "模型应该从什么数据、目标和结构中学到可迁移的状态表示？",
        "summary": "合并监督/半监督/自监督、对比学习、主动学习、几何归纳偏置、参数与上下文泛化，以及 JEPA 式潜空间预测。",
        "dependencies": ["research"],
        "concepts": ["训练分布", "自监督目标", "对比视图", "不变性/等变性", "迁移", "潜空间预测", "world model"],
        "engineering_output": "数据—目标—表示评测矩阵：线性探测、迁移、OOD、样本效率和规划/控制表现。",
        "source_synthesis": "How2AI 提供 data/structure/generalization；Lil’Log 补自监督与数据方法；CS25 把表征推进到 JEPA 世界模型；CS336 用 tokenizer 与 Common Crawl 数据作业把表征接口落到可测试实现；Kaggle Day 2 将 embedding 几何落到检索、ANN、vector store 与 RAG。",
        "core_titles": ["Representation Learning: A Review and New Perspectives", "Contrastive Representation Learning", "Self-Supervised Learning", "From Representation Learning to World Modeling through Joint Embedding Predictive Architectures"],
    },
    {
        "id": "architecture",
        "order": 3,
        "title": "模型架构与计算结构",
        "short_title": "模型架构",
        "question": "如何把数据结构、序列长度和硬件约束编码进模型？",
        "summary": "合并 CNN/ViT、Transformer、sets/graphs、attention 变体、位置编码、norm/MLP、MoE、SSM 与 tokenizer。",
        "dependencies": ["representation"],
        "concepts": ["attention", "tokenization", "位置编码", "归一化", "MLP", "稀疏/MoE", "SSM", "结构归纳偏置"],
        "engineering_output": "模型卡与公平 benchmark：参数量、激活量、上下文、质量、吞吐、显存、通信和 tokenizer 成本。",
        "source_synthesis": "Transformer Taxonomy 建坐标；Lil’Log 解释机制；How2AI 扩展到视觉、集合和图；CS25 加入 SSM/H-Nets 权衡；CS336 从零实现 decoder-only Transformer，并用 attention alternatives/MoE 与系统成本共同检验架构选择。",
        "core_titles": ["Attention Is All You Need", "Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges", "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale", "Transformer Taxonomy (the last lit review)", "On the Tradeoffs of State Space Models and Transformers"],
    },
    {
        "id": "foundation-models",
        "order": 4,
        "title": "规模化预训练、适配与后训练",
        "short_title": "基础模型",
        "question": "如何把架构扩展成可迁移的 foundation model，并以可控成本适配任务？",
        "summary": "合并 scaling laws、数据配比、分布式训练、指令微调、LoRA、量化、MoE、预训练数据排序和 on-policy distillation。",
        "dependencies": ["architecture", "representation"],
        "concepts": ["compute-optimal scaling", "数据混合/顺序", "分布式并行", "SFT", "LoRA", "量化", "蒸馏", "训练—部署分布"],
        "engineering_output": "训练与适配决策表：数据 token、算力、并行策略、FullFT/LoRA、量化、评测和 serving 预算。",
        "source_synthesis": "How2AI 连接预训练到适配；Taxonomy 给历史配方；CS25 更新规模化训练与预训练目标；CS336 串起 tokenizer、模型、GPU kernel、并行、规模律、数据与 SFT/RLVR；Thinking Machines 补 LoRA 与 on-policy 蒸馏；Kaggle Day 1/4 从模型行为、Prompt 推进到 grounding、PEFT 与领域模型选型。",
        "core_titles": ["Training Compute-Optimal Large Language Models", "LoRA: Low-Rank Adaptation of Large Language Models", "LoRA Without Regret", "On-Policy Distillation", "The Ultra-Scale Talk: Scaling Training to Thousands of GPUs"],
    },
    {
        "id": "multimodal",
        "order": 5,
        "title": "多模态对齐、融合、迁移与原生智能",
        "short_title": "多模态",
        "question": "不同模态在何处建立共同表示、交换信息并迁移能力？",
        "summary": "合并 contrastive alignment、cross-attention、fusion、interaction measurement、cross-modal transfer、multimodal LLM 与 modality-aware experts。",
        "dependencies": ["representation", "architecture", "foundation-models"],
        "concepts": ["alignment", "fusion", "cross-attention", "translation", "transfer", "单模态捷径", "native multimodal", "模态专家"],
        "engineering_output": "多模态消融矩阵：移除/打乱单一模态，测交互增益、对齐、组合泛化、延迟和模态缺失鲁棒性。",
        "source_synthesis": "How2AI 给完整 taxonomy 与课程主线；Lil’Log 补 VLM/contrastive；CS25 更新原生多模态与实时方向；CS336 把多模态 alignment 放在完整 LM 生命周期之后，强调接口、训练策略与反单模态捷径评测。",
        "core_titles": ["Multimodal Machine Learning: A Survey and Taxonomy", "Foundations and Trends in Multimodal Machine Learning: Principles, Challenges, and Open Questions", "Learning Transferable Visual Models From Natural Language Supervision?", "Does my multimodal model learn cross-modal interactions? It’s harder to tell than you might think!", "From Language Models to Native Multimodal Intelligence"],
    },
    {
        "id": "generative",
        "order": 6,
        "title": "生成建模：潜变量、扩散、流与采样",
        "short_title": "生成建模",
        "question": "如何学习从简单分布到数据分布的可控生成路径，并在有限步数内求解？",
        "summary": "合并 VAE、normalizing flow、DDPM、Score-SDE、latent diffusion、DiT、Flow/Rectified Flow、guidance、consistency 与多模态生成。",
        "dependencies": ["representation", "architecture", "multimodal"],
        "concepts": ["latent variable", "score", "SDE/ODE", "velocity field", "VAE", "guidance", "sampler/NFE", "consistency"],
        "engineering_output": "固定 checkpoint 的质量—速度 Pareto：采样器、NFE、延迟、显存、条件遵循、多样性和失败率。",
        "source_synthesis": "Vincent 教程提供扩散纵深；How2AI 放入 foundation model 路线；Lil’Log 连接 VAE/flow/diffusion；论文矩阵补 DiT 与 Flow Matching；AI Toolkit 把理论落到数据、LoRA/LoKr、量化、采样与 checkpoint 实验。",
        "core_titles": ["Denoising Diffusion Probabilistic Models", "Score-Based Generative Modeling through Stochastic Differential Equations", "High-Resolution Image Synthesis with Latent Diffusion Models", "Scalable Diffusion Models with Transformers", "Flow Matching for Generative Modeling", "Consistency Models"],
    },
    {
        "id": "reasoning-agents",
        "order": 7,
        "title": "推理、搜索、工具与 Agent",
        "short_title": "推理与 Agent",
        "question": "如何把一次预测扩展成有状态、可验证、能使用工具的多步决策？",
        "summary": "合并 CoT/test-time compute、self-consistency、search/planning、tool use、memory、multi-agent、自学习 Agent 和科学工作流。",
        "dependencies": ["foundation-models", "multimodal"],
        "concepts": ["Chain-of-Thought", "test-time scaling", "search", "planner", "tool schema", "memory", "verifier", "multi-agent"],
        "engineering_output": "可审计 Agent trace：状态、计划、工具调用、观察、验证、重试、预算、最终产物和失败归因。",
        "source_synthesis": "CS 159 提供任务与项目骨架；Lil’Log 给 Agent 组件；Taxonomy 给 CoT/tool 历史；CS25 补科学协作 Agent；CS336 用 GRPO/RLVR 作业把可验证奖励、on/off-policy 与训练方差落到实现；Kaggle Day 3 用 function calling、SQLite 与 LangGraph 串起状态、工具、重试和日志；阿里云架构分享补 workflow/agentic、单/多 Agent 与 context engineering 的企业选型。",
        "core_titles": ["Why We Think", "ReAct: Synergizing Reasoning and Acting in Language Models", "Self-Consistency Improves Chain of Thought Reasoning in Language Models", "Toolformer: Language Models Can Teach Themselves to Use Tools", "Caltech CS 159 Spring 2025 Lectures"],
    },
    {
        "id": "runtime-evaluation",
        "order": 8,
        "title": "运行时、评测、安全与人类反馈闭环",
        "short_title": "运行时与评测",
        "question": "如何证明模型/Agent 在真实环境中稳定、可监督、可恢复并持续改进？",
        "summary": "合并推理 serving、确定性、环境与 trajectory 评测、LLM judge、偏好反馈、安全、monitorability、实时交互和 human-in-the-loop。",
        "dependencies": ["research", "foundation-models", "reasoning-agents"],
        "concepts": ["serving", "determinism", "environment", "trajectory evaluation", "preference", "safety", "monitorability", "human override"],
        "engineering_output": "生产验收 harness：质量、成本、延迟、权限、副作用、回退、独立审计、人工接管和数据回流。",
        "source_synthesis": "Thinking Machines 解决训练/推理/交互系统；Labelbox 解决环境、评测与反馈数据；How2AI/CS 159 提供 HAI、安全和项目指标；CS336 补 GPU profiling、并行、推理与 benchmark 的统一成本验收；Kaggle Day 5 把部署、CI/CD、可观测性与无唯一真值的 GenAI 评测组织成生产闭环；阿里云架构分享进一步连接 MCP/AI Gateway、消息恢复、OpenTelemetry 与分层评测。",
        "core_titles": ["Defeating Nondeterminism in LLM Inference", "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", "Reward Hacking in RL", "Guidelines for Human-AI Interaction", "Interaction Models", "Introducing Recursion", "Measuring Monitorability Disposition", "Serving Transformers: Lessons from the Trenches of Production Inference"],
    },
]


# Qualitative coverage depth derived from each source's local summary and indexed
# entries. It is intentionally not presented as an exact paper count because one
# paper can be shared by several courses and blogs.
SOURCE_STAGE_MATRIX = [
    {"name": "MIT How2AI", "role": "系统课程骨架", "values": [3, 3, 3, 3, 3, 3, 2, 2]},
    {"name": "Vincent Diffusion", "role": "生成模型纵深", "values": [1, 2, 2, 1, 1, 3, 0, 0]},
    {"name": "Caltech CS 159", "role": "推理与项目", "values": [3, 1, 1, 2, 1, 0, 3, 3]},
    {"name": "Stanford CS25", "role": "前沿研究更新", "values": [1, 3, 3, 3, 3, 1, 2, 2]},
    {"name": "Stanford CS336", "role": "LLM 全生命周期实现", "values": [3, 3, 3, 3, 1, 0, 2, 3]},
    {"name": "Lil'Log", "role": "机制型长文", "values": [2, 3, 3, 3, 3, 3, 3, 3]},
    {"name": "Transformer Taxonomy", "role": "架构历史坐标", "values": [1, 1, 3, 3, 1, 0, 2, 1]},
    {"name": "Thinking Machines", "role": "训练与运行系统", "values": [2, 1, 2, 3, 2, 0, 2, 3]},
    {"name": "Labelbox", "role": "评测反馈闭环", "values": [1, 1, 0, 1, 1, 0, 3, 3]},
    {"name": "Karpathy GitHub", "role": "从原理到系统实现", "values": [3, 3, 3, 3, 2, 2, 3, 2]},
    {"name": "Ostris AI Toolkit", "role": "Diffusion 微调工程", "values": [1, 2, 2, 2, 1, 3, 0, 2]},
    {"name": "Kaggle GenAI Intensive", "role": "LLM 应用工程闭环", "values": [2, 3, 1, 3, 1, 0, 3, 3]},
    {"name": "AI Agent 架构演进", "role": "企业 Agent 运行架构", "values": [1, 1, 2, 2, 0, 0, 3, 3]},
]


KARPATHY_CORE_REPOS = {
    "micrograd": {
        "track": "基础与反向传播",
        "category": CAT_FOUNDATIONS,
        "priority": "must-read",
        "status": "当前基础入口",
        "note": "【代码与 README】以标量计算图实现 reverse-mode autodiff，并在其上构造小型神经网络 API；适合逐步验证 forward、local gradient、topological backward 和参数更新。",
        "output": "不依赖 autograd 重写 Value.backward，并用梯度检查验证一个两层 MLP。",
    },
    "nn-zero-to-hero": {
        "track": "基础与反向传播",
        "category": CAT_FOUNDATIONS,
        "priority": "must-read",
        "status": "课程主线",
        "note": "【课程 README】从 micrograd、字符级语言模型、MLP、激活与梯度、BatchNorm、手写反向传播、WaveNet 一路推进到从零构建 GPT。",
        "output": "完成每讲 notebook 与练习，并保存一次激活、梯度和训练/验证曲线诊断。",
    },
    "makemore": {
        "track": "语言建模与 Tokenization",
        "category": CAT_MODELS,
        "priority": "must-read",
        "status": "教学实现",
        "note": "【仓库与课程上下文】用字符级自回归语言模型逐步比较 bigram、MLP、卷积式层级结构和 Transformer，适合建立训练、采样与 NLL 评测闭环。",
        "output": "在同一数据集上比较 bigram、MLP 与 Transformer，并解释验证损失和采样质量差异。",
    },
    "minbpe": {
        "track": "语言建模与 Tokenization",
        "category": CAT_DATA,
        "priority": "must-read",
        "status": "教学实现",
        "note": "【代码与 README】实现 byte-level BPE 的 vocabulary/merge 训练、encode、decode，并区分基础 tokenizer、regex 预切分与 special tokens。",
        "output": "训练一个领域 tokenizer，报告压缩率、序列长度、特殊 token 与 UTF-8 往返正确性。",
    },
    "minGPT": {
        "track": "Transformer 训练",
        "category": CAT_MODELS,
        "priority": "recommended",
        "status": "历史教学实现",
        "note": "【仓库简介】OpenAI GPT 训练流程的最小 PyTorch 重实现；适合读清模块边界，但当前完整训练实践应继续转向 build-nanogpt 或 nanochat。",
        "output": "画出 embedding、attention、MLP、residual 和 loss 的张量形状与数据流。",
    },
    "build-nanogpt": {
        "track": "Transformer 训练",
        "category": CAT_FOUNDATION_MODELS,
        "priority": "must-read",
        "status": "逐提交复现",
        "note": "【代码与 README】从空文件按清晰 commit 历史复现 GPT-2 124M，覆盖数据、训练循环和评测；该项目明确不包含 chat finetuning。",
        "output": "按提交重建最小 GPT-2，并形成吞吐、显存、loss 与 HellaSwag 评测记录。",
    },
    "nanoGPT": {
        "track": "Transformer 训练",
        "category": CAT_FOUNDATION_MODELS,
        "priority": "recommended",
        "status": "已弃用，历史参考",
        "note": "【README 2025-11 更新】约 300 行训练循环与约 300 行 GPT 定义的中型 GPT 训练仓库；作者已标记其为旧版并建议新项目使用 nanochat。",
        "output": "把它作为简洁训练 baseline 阅读，并写出迁移到 nanochat 时新增的生命周期环节。",
    },
    "nanochat": {
        "track": "完整 LLM 生命周期",
        "category": CAT_FOUNDATION_MODELS,
        "priority": "must-read",
        "status": "当前主线",
        "note": "【代码与 README】单 GPU 节点上的可修改 LLM 实验 harness，覆盖 tokenization、pretraining、finetuning、evaluation 和 inference，并用 depth 统一控制模型复杂度。",
        "output": "跑通 tokenizer→预训练→微调→评测→CLI 推理，记录每阶段输入、产物、成本和失败点。",
    },
    "llama2.c": {
        "track": "LLM 系统与推理",
        "category": CAT_FOUNDATION_MODELS,
        "priority": "must-read",
        "status": "最小推理系统",
        "note": "【代码与 README】在 PyTorch 训练 Llama 2 架构，再用单个纯 C 文件执行推理；重点是最小化地理解权重加载、tokenization、Transformer forward 与采样。",
        "output": "给 run.c 标注内存布局与每层计算，并测不同上下文长度下的延迟与内存。",
    },
    "llm.c": {
        "track": "LLM 系统与推理",
        "category": CAT_FOUNDATION_MODELS,
        "priority": "must-read",
        "status": "训练系统纵深",
        "note": "【代码与 README】用 C/CUDA 复现 GPT-2/GPT-3 系列预训练，并保留并行 PyTorch 参考与约千行 CPU fp32 版本，适合从正确性基线进入 kernel、混合精度和多 GPU。",
        "output": "先对齐 C/PyTorch 数值，再 profile 一个 kernel，报告时间、带宽、显存和误差。",
    },
    "llm-council": {
        "track": "Agent 与应用",
        "category": CAT_INTERACTION,
        "priority": "recommended",
        "status": "实验原型",
        "note": "【代码与 README】并行请求多个 LLM，匿名互评排序，再由 Chairman 合成最终答案；作者明确称其为周末 vibe-coded 原型且不计划维护，不应直接视为生产架构。",
        "output": "用固定问题集比较单模型、投票、互评与主席汇总，并测成本、相关错误与偏置。",
    },
    "autoresearch": {
        "track": "Agent 与自动研究",
        "category": CAT_INTERACTION,
        "priority": "must-read",
        "status": "2026 前沿主线",
        "note": "【代码与 README】Agent 只修改 train.py，在固定 5 分钟预算下训练并以 val_bpb 决定保留或丢弃实验；prepare.py 固定，program.md 由人定义研究组织与约束。默认环境以单张 NVIDIA GPU/H100 为基准，跨硬件结果不可直接比较。",
        "output": "建立可回滚实验循环，保存假设、diff、预算、metric、失败原因和人工审计结论。",
    },
}


KARPATHY_REPO_OVERRIDES = {
    "LLM101n": {
        "track": "课程蓝图与历史参考",
        "category": CAT_FOUNDATION_MODELS,
        "priority": "optional",
        "status": "已归档，课程未发布",
        "note": "【README】该仓库只保存从 bigram、micrograd、Transformer、tokenization、CUDA、SFT/RL 到多模态的课程蓝图；README 明确说明课程尚不存在，仓库已于 2024-08-01 归档。",
    },
    "ng-video-lecture": {
        "track": "Transformer 训练",
        "category": CAT_MODELS,
        "priority": "recommended",
        "status": "视频配套代码",
        "note": "【README】Zero to Hero 的首个 nanoGPT 讲座配套代码，可沿 git log 阅读；README 同时提示视频对初始化覆盖不足，当前代码收敛较慢，需对照 nanoGPT 的初始化实现。",
    },
    "rustbpe": {
        "track": "语言建模与 Tokenization",
        "category": CAT_DATA,
        "priority": "recommended",
        "status": "性能补充",
        "note": "【仓库简介】面向 tiktoken 训练侧的 Rust BPE 实现；适合在 minbpe 正确性基线之后研究 tokenizer 训练的性能工程。",
    },
    "reader3": {
        "track": "Agent 与应用",
        "category": CAT_INTERACTION,
        "priority": "optional",
        "status": "应用原型",
        "note": "【仓库简介】展示如何与 LLM 一起阅读书籍的轻量应用，用于观察上下文切分、阅读状态与人机协作界面；具体流程需查看 README 与代码。",
    },
    "rendergit": {
        "track": "研究工具与知识管理",
        "category": CAT_FOUNDATIONS,
        "priority": "recommended",
        "status": "知识工具",
        "note": "【仓库简介】把 Git 仓库渲染为供人或 LLM 阅读的单个静态 HTML，用于代码语境压缩、离线审阅和可追溯知识输入。",
    },
    "hn-time-capsule": {
        "track": "Agent 与应用",
        "category": CAT_INTERACTION,
        "priority": "optional",
        "status": "分析应用",
        "note": "【仓库简介】使用 LLM 回顾十年前 Hacker News 讨论，适合研究时间切片数据、回溯偏差与基于证据的长文本分析。",
    },
    "lecun1989-repro": {
        "track": "基础与反向传播",
        "category": CAT_FOUNDATIONS,
        "priority": "recommended",
        "status": "论文复现",
        "note": "【仓库简介】复现 LeCun 1989 手写邮编识别工作，用于把早期卷积网络、反向传播和真实任务评测放进可运行基线。",
    },
    "find-birds": {
        "track": "工程工具与实验项目",
        "category": CAT_FOUNDATIONS,
        "priority": "optional",
        "status": "历史工具",
        "note": "【仓库简介】基于社交关系发现值得关注账户的工具，并非计算机视觉项目；仅作为早期数据产品实验参考。",
    },
}


def karpathy_repo_track(repo: dict) -> str:
    if repo.get("fork"):
        return "外部分叉"
    name = str(repo.get("name", "")).lower()
    text = f'{name} {repo.get("description") or ""}'.lower()
    if repo.get("name") in KARPATHY_CORE_REPOS:
        return KARPATHY_CORE_REPOS[repo["name"]]["track"]
    if repo.get("name") in KARPATHY_REPO_OVERRIDES:
        return KARPATHY_REPO_OVERRIDES[repo["name"]]["track"]
    if any(token in text for token in ("normalizing flow", "vqvae", "gumbel", "density estimation")):
        return "生成建模"
    if any(token in text for token in ("image caption", "convnet", "vision", "multimodal", "bird")):
        return "CV 与多模态"
    if any(token in text for token in ("reinforcement", "policy gradient", "q-learning", "agent")):
        return "强化学习与 Agent"
    if any(token in text for token in ("gpt", "llm", "language model", "tokeniz", "transformer", "recurrent")):
        return "语言模型与 Transformer"
    if any(token in text for token in ("arxiv", "paper", "research", "literature", "reader", "rendergit", "publication")):
        return "研究工具与知识管理"
    if any(token in text for token in ("neural", "deep learning", "svm", "forest", "t-sne", "optimization")):
        return "经典机器学习实现"
    return "工程工具与实验项目"


def karpathy_repo_annotation(repo: dict) -> tuple[str, str, str, str, str]:
    name = str(repo.get("name", ""))
    if name in KARPATHY_CORE_REPOS:
        item = KARPATHY_CORE_REPOS[name]
        return item["track"], item["category"], item["priority"], item["note"], item["status"]
    if name in KARPATHY_REPO_OVERRIDES:
        item = KARPATHY_REPO_OVERRIDES[name]
        return item["track"], item["category"], item["priority"], item["note"], item["status"]
    track = karpathy_repo_track(repo)
    if repo.get("fork"):
        category = CAT_FOUNDATIONS
        priority = "optional"
        status = "外部分叉"
        note = "【GitHub 元数据】该条目是 Karpathy 账户下的 fork，不作为其原创学习主线；仅保留用于追溯实验依赖或历史上下文。"
        return track, category, priority, note, status
    category_by_track = {
        "生成建模": CAT_GENERATIVE,
        "CV 与多模态": CAT_MULTIMODAL,
        "强化学习与 Agent": CAT_INTERACTION,
        "语言模型与 Transformer": CAT_MODELS,
        "研究工具与知识管理": CAT_FOUNDATIONS,
        "经典机器学习实现": CAT_MODELS,
        "工程工具与实验项目": CAT_FOUNDATIONS,
    }
    category = category_by_track.get(track, CAT_FOUNDATIONS)
    recommended = {
        "char-rnn", "convnetjs", "neuraltalk", "neuraltalk2", "pytorch-normalizing-flows",
        "arxiv-sanity-lite", "arxiv-sanity-preserver", "lecun1989-repro", "reader3", "rendergit",
        "LLM101n", "recurrentjs", "reinforcejs", "deep-vector-quantization",
    }
    priority = "recommended" if name in recommended else "optional"
    status = "历史参考" if (repo.get("archived") or str(repo.get("pushed_at", ""))[:4] < "2022") else "补充项目"
    description = " ".join(str(repo.get("description") or "未提供仓库简介").split())
    note = f"【GitHub 元数据与题名】{description}。本地将其归入“{track}”；具体实现、依赖和结论需回到 README 与代码确认。"
    return track, category, priority, note, status


def normalized_karpathy_repos(repos: list[dict]) -> list[dict]:
    result = []
    for repo in repos:
        track, category, priority, note, status = karpathy_repo_annotation(repo)
        license_info = repo.get("license") or {}
        result.append(
            {
                "name": repo.get("name", ""),
                "url": repo.get("html_url", ""),
                "description": repo.get("description") or "",
                "language": repo.get("language") or "未标注",
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "created_at": repo.get("created_at"),
                "pushed_at": repo.get("pushed_at"),
                "archived": bool(repo.get("archived")),
                "is_fork": bool(repo.get("fork")),
                "topics": repo.get("topics") or [],
                "license": license_info.get("spdx_id") if isinstance(license_info, dict) else None,
                "track": track,
                "category": category,
                "priority": priority,
                "status": status,
                "notes": note,
            }
        )
    return sorted(result, key=lambda item: (-int(item["stars"]), item["name"].lower()))


def ai_toolkit_config_examples(tree: dict) -> list[dict]:
    examples = []
    for item in tree.get("tree", []):
        path = str(item.get("path", ""))
        if (
            item.get("type") != "blob"
            or not path.startswith("config/examples/")
            or Path(path).suffix.lower() not in {".yml", ".yaml"}
        ):
            continue
        lowered = path.lower()
        if "/modal/" in lowered:
            category = "Modal 云训练"
        elif "train_full_fine_tune" in lowered:
            category = "全量微调"
        elif "train_lora" in lowered:
            category = "LoRA 训练"
        elif "slider" in lowered:
            category = "概念 Slider"
        elif "extract" in lowered:
            category = "权重提取"
        elif "generate" in lowered:
            category = "生成任务"
        elif "mod_lora" in lowered:
            category = "LoRA 权重调整"
        elif "redux" in lowered:
            category = "Adapter / Redux"
        else:
            category = "其他配置"

        filename = Path(path).name
        if path == "config/examples/train_lora_flux_24gb.yaml":
            priority = "must-read"
            note = "README 主线 FLUX LoRA 示例；适合先跑通数据、LoRA、flow matching、采样与 checkpoint 的完整闭环。"
        elif any(token in lowered for token in ("qwen", "wan21", "wan22", "kontext", "edit", "modal", "full_fine_tune")):
            priority = "recommended"
            note = "代表性进阶配置；用于核对该模型或运行方式的显存、量化、cache、采样与数据约束，不能把参数外推到其他模型。"
        else:
            priority = "optional"
            note = "仓库提供的任务配置模板；先理解字段与目标，再按当前硬件和模型 README 调整。"
        if "qwen_image_24gb" in lowered:
            note = "Qwen Image 24GB 示例使用 text embedding cache、量化与 low_vram；这些是该快照配置的取舍，不是所有设备的通用最优值。"
        elif "wan21_1b" in lowered:
            note = "Wan2.1 1.3B 示例按单帧图像文件夹训练；配置注释提示它更偏角色学习而非动作学习，应另设视频时序评测。"
        examples.append(
            {
                "path": path,
                "title": filename,
                "url": f"{AI_TOOLKIT_REPO_URL}/blob/main/{path}",
                "category": category,
                "priority": priority,
                "notes": note,
            }
        )
    return sorted(
        examples,
        key=lambda item: (
            PRIORITY_RANK.get(item["priority"], 99),
            item["category"],
            item["path"],
        ),
    )


RUNTIME_KEYWORDS = (
    "safety",
    "safe ",
    "hallucin",
    "toxicity",
    "adversarial",
    "human-ai",
    "human ai",
    "human preferences",
    "preference optimization",
    "monitor",
    "evaluation",
    "llm-as-a-judge",
    "judge",
    "oversight",
    "weak-to-strong",
    "reward hacking",
    "faulty reward",
    "guidelines for human",
    "interaction models",
    "echochain",
    "recursion",
    "implicit intelligence",
    "serving transformers",
    "inference optimization",
    "nondeterminism",
    "reproduc",
    "jailbreak",
    "artprompt",
    "interactive sketchpad",
    "videowebarena",
    "future worth building",
)


class AnchorCollector(HTMLParser):
    """Collect visible text for absolute anchors without depending on DOM libs."""

    def __init__(self) -> None:
        super().__init__()
        self.items: list[tuple[str, str]] = []
        self.href: str | None = None
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "a":
            value = dict(attrs).get("href")
            if value and value.startswith(("http://", "https://")):
                self.href = value
                self.parts = []

    def handle_data(self, data: str) -> None:
        if self.href:
            self.parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self.href:
            text = " ".join("".join(self.parts).split())
            self.items.append((text, self.href))
            self.href = None
            self.parts = []


def clean_url(value: str) -> str:
    return value.strip().rstrip(".,;:)}]>")


def short_url(value: str, width: int = 62) -> str:
    value = value.replace("https://", "").replace("http://", "")
    return value if len(value) <= width else value[: width - 3] + "..."


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def link(url: str, label: str | None = None, external: bool = True) -> str:
    text = label or short_url(url)
    target = ' target="_blank" rel="noreferrer"' if external else ""
    return f'<a href="{esc(url)}"{target}>{esc(text)}</a>'


def slugify(value: str) -> str:
    result = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return result or "item"


def register(
    records: dict[str, dict],
    url: str,
    title: str,
    origin: str,
    category: str | None = None,
    priority: str | None = None,
    note: str | None = None,
    kind: str | None = None,
) -> None:
    url = clean_url(url)
    if not url.startswith(("https://", "http://")):
        return
    record = records.setdefault(
        url,
        {
            "url": url,
            "title": "",
            "origins": set(),
            "categories": set(),
            "priorities": set(),
            "notes": set(),
            "kinds": set(),
        },
    )
    title = " ".join(title.split())
    if title and (not record["title"] or len(title) > len(record["title"])):
        record["title"] = title
    record["origins"].add(origin)
    if category:
        record["categories"].add(category)
    if priority:
        record["priorities"].add(priority)
    if note:
        record["notes"].add(note)
    if kind:
        record["kinds"].add(kind)


def infer_kind(url: str) -> str:
    host = urlparse(url).netloc.lower()
    if host in {"arxiv.org", "aclanthology.org", "openreview.net"}:
        return "论文/预印本"
    if host.endswith("youtu.be") or host.endswith("youtube.com") or host.endswith("bilibili.com"):
        return "视频"
    if host in {"colab.research.google.com", "drive.google.com"}:
        return "Notebook/课件"
    if host in {"github.com", "gist.github.com"}:
        return "代码/基准"
    if host in {
        "lilianweng.github.io",
        "thinkingmachines.ai",
        "labelbox.com",
        "kipp.ly",
        "karpathy.github.io",
        "taohu.me",
    }:
        return "技术博客/教程"
    if host in {"mit-mi.github.io", "sites.google.com", "web.stanford.edu"}:
        return "课程资料"
    return "外部参考"


def course_material_annotation(title: str, kind: str) -> tuple[str, str, str]:
    topic = re.sub(r"\s*\[(?:slides|video)\]\s*$", "", title, flags=re.IGNORECASE)
    lowered = topic.lower()
    if "foundation 1" in lowered or "data, structure" in lowered:
        category = CAT_DATA
        focus = "数据模态、收集策略、训练目标与泛化"
    elif "foundation 2" in lowered or "practical ai" in lowered:
        category = CAT_FOUNDATIONS
        focus = "PyTorch/Hugging Face 工具链、训练调试与实践流程"
    elif "foundation 3" in lowered or "model architectures" in lowered:
        category = CAT_MODELS
        focus = "序列、空间、集合和图结构上的模型归纳偏置"
    elif "large models 1" in lowered or "large foundation" in lowered:
        category = CAT_FOUNDATION_MODELS
        focus = "预训练数据、自监督、指令微调、LoRA、MoE 与量化"
    elif "large models 2" in lowered or "large multimodal" in lowered:
        category = CAT_MULTIMODAL
        focus = "多模态预训练、LLM 模态适配与统一理解/生成"
    elif "large models 3" in lowered or "modern generative" in lowered:
        category = CAT_GENERATIVE
        focus = "Diffusion、可控生成、Flow Matching 与媒体基础模型"
    elif "multimodal" in lowered:
        category = CAT_MULTIMODAL
        if "fusion" in lowered:
            focus = "跨模态交互、信息分解与融合评测"
        elif "transfer" in lowered:
            focus = "通过融合、对齐和翻译实现跨模态迁移"
        else:
            focus = "异构模态连接、对齐、Transformer 与单模态捷径"
    elif "interaction 1" in lowered or "agents and reasoning" in lowered:
        category = CAT_INTERACTION
        focus = "强化学习、多步推理、偏好反馈与 Agent 决策"
    elif "interaction 2" in lowered or "human ai" in lowered:
        category = CAT_INTERACTION
        focus = "交互媒介、human-in-the-loop、安全与可靠性"
    else:
        category = CAT_FOUNDATIONS
        focus = "课程要求、AI 研究问题、论文读写与实验设计"
    material = "视频" if kind == "视频" else "课件"
    priority = "optional" if material == "视频" else "recommended"
    return category, priority, f"【课程上下文】How2AI《{topic}》{material}，用于学习{focus}。"


def cs336_catalog_category(label: str) -> str:
    if label in {"数据与表征", "预训练数据"}:
        return CAT_DATA
    if label == "模型架构":
        return CAT_MODELS
    if label == "多模态对齐":
        return CAT_MULTIMODAL
    if label in {"后训练与对齐", "后训练与推理"}:
        return CAT_INTERACTION
    if label in {"训练系统", "推理系统", "规模律与实验设计"}:
        return CAT_FOUNDATION_MODELS
    return CAT_FOUNDATIONS


def infer_category(title: str, url: str) -> str:
    text = f"{title} {url}".lower()
    if any(word in text for word in ("diffusion", "flow", "vae", "generative", "shortcut", "guidance", "ddpm", "glow", "nvp")):
        return CAT_GENERATIVE
    if any(word in text for word in ("multimodal", "multi-modal", "vision-language", "visual language", "cross-modal")):
        return CAT_MULTIMODAL
    if any(word in text for word in ("agent", "reason", "search", "planning", "tool", "reward", "safety", "halluc", "oversight", "policy gradient", "reinforcement")):
        return CAT_INTERACTION
    if any(word in text for word in ("scaling", "lora", "large model", "inference", "fine-tun", "foundation model", "many gpu")):
        return CAT_FOUNDATION_MODELS
    if any(word in text for word in ("transformer", "attention", "architecture", "unet", "u-net", "mamba", "manifold")):
        return CAT_MODELS
    if any(word in text for word in ("data", "representation", "generalization", "supervised", "active learning", "meta-learning")):
        return CAT_DATA
    return CAT_FOUNDATIONS


def annotation_for(record: dict) -> tuple[str, str, str]:
    url = record["url"]
    title = record["title"]
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    path = parsed.path.rstrip("/")

    exact_url_annotations = {
        **GOOGLE_MATERIALS,
        "https://github.com/dongzhuoyao/awesome-flow-matching": (CAT_GENERATIVE, "Flow Matching 论文、教程与实现的精选索引，用于继续追踪路径设计、最优传输和求解器资源。"),
        "https://github.com/dongzhuoyao/vincent-genai-course": (CAT_FOUNDATIONS, "Vincent Generative AI 课程代码仓库，用于查看教程源文件、代码实践和内容结构。"),
    }
    if url in exact_url_annotations:
        category, note = exact_url_annotations[url]
        return category, "recommended", f"【课程上下文】{note}"

    if host == "lilianweng.github.io":
        if path in LILIAN_ANNOTATIONS:
            category, note = LILIAN_ANNOTATIONS[path]
            return category, "recommended", f"【源页综述】{note}"
        if path in {"", "/", "/archives"}:
            note = "Lil’Log 技术长文入口，适合按 Transformer、数据、生成模型、Agent、安全与强化学习主题检索。"
            return CAT_FOUNDATIONS, "recommended", f"【来源导航】{note}"

    if host == "arxiv.org":
        paper_id = path.rsplit("/", 1)[-1].removesuffix(".pdf")
        paper_id = re.sub(r"v\d+$", "", paper_id)
        if paper_id in ARXIV_ANNOTATIONS:
            category, note = ARXIV_ANNOTATIONS[paper_id]
            return category, "recommended", f"【论文摘要与课程上下文】{note}"

    if title in TITLE_ANNOTATIONS:
        category, note, priority = TITLE_ANNOTATIONS[title]
        return category, priority, f"【源页综述】{note}"

    if host in {"mit-mi.github.io", "youtu.be"}:
        kind = "视频" if host == "youtu.be" else "课程资料"
        return course_material_annotation(title, kind)

    category = infer_category(title, url)
    kinds = "/".join(sorted(record["kinds"])) or "参考资料"
    note = f"【题名与课程上下文】《{title}》被归入 {category}，材料类型为{kinds}；本地仅确认主题定位，具体方法、数据和结论需查看原文。"
    return category, "optional", note


def collect_records(
    schedule: list[dict],
    reading_rows: list[dict[str, str]],
    karpathy_repos: list[dict],
    ai_toolkit_repo: dict,
    ai_toolkit_tree: dict,
    kaggle_course: dict,
    bilibili_agent: dict,
    cs336_course: dict,
) -> list[dict]:
    records: dict[str, dict] = {}

    for title, url in DIRECT_SOURCES:
        register(records, url, title, "直接来源", kind=infer_kind(url))

    register(
        records,
        "https://github.com/karpathy",
        "Andrej Karpathy GitHub",
        "karpathy_github_snapshot",
        CAT_FOUNDATIONS,
        "must-read",
        "【来源综述】以可运行、可读、从零构建的代码连接反向传播、语言建模、Transformer 训练、C/CUDA 推理、完整 LLM 生命周期与自动研究。",
        "代码/基准",
    )
    for repo in karpathy_repos:
        if repo.get("fork"):
            continue
        track, category, priority, note, _ = karpathy_repo_annotation(repo)
        register(
            records,
            repo.get("html_url", ""),
            f'karpathy/{repo.get("name", "repository")}',
            "karpathy_github_snapshot",
            category,
            priority,
            f"{note} 学习轨道：{track}。",
            "代码/基准",
        )
    register(
        records,
        MICROGPT_GIST_URL,
        "microgpt: dependency-free GPT training and inference",
        "karpathy_github_snapshot",
        CAT_MODELS,
        "must-read",
        "【Pinned Gist】以单个纯 Python、无第三方依赖文件呈现 GPT 训练与推理的完整算法；适合作为 minbpe/micrograd 与完整 PyTorch 训练框架之间的最小桥梁。",
        "代码/基准",
    )

    register(
        records,
        AI_TOOLKIT_REPO_URL,
        "ostris/ai-toolkit",
        "ai_toolkit_snapshot",
        CAT_GENERATIVE,
        "must-read",
        "【代码与 README】面向扩散及 flow-based 图像、编辑、视频和音频模型的统一微调套件；核心学习对象是 YAML job、数据与 buckets、模型/量化、LoRA/LoKr、采样评测、checkpoint 恢复和 UI/CLI 运行边界。",
        "代码/基准",
    )
    register(
        records,
        AI_TOOLKIT_FAQ_URL,
        "ostris/ai-toolkit FAQ",
        "ai_toolkit_snapshot",
        CAT_GENERATIVE,
        "recommended",
        "【仓库 FAQ】用于核对模型显存、训练与故障问题；其中硬件结论只适用于 FAQ 指明的模型与仓库快照。",
        "代码/基准",
    )
    for example in ai_toolkit_config_examples(ai_toolkit_tree):
        register(
            records,
            example["url"],
            f'ai-toolkit: {example["title"]}',
            "ai_toolkit_snapshot",
            CAT_GENERATIVE,
            example["priority"],
            f'【{example["category"]}】{example["notes"]}',
            "代码/基准",
        )
    for path, priority, note in (
        ("notebooks/FLUX_1_dev_LoRA_Training.ipynb", "recommended", "FLUX.1-dev LoRA Notebook 入口；适合在理解 YAML 主线后对照交互式训练流程。"),
        ("notebooks/FLUX_1_schnell_LoRA_Training.ipynb", "optional", "FLUX.1-schnell LoRA Notebook 入口；参数与模型适用性需按当前 README 复核。"),
        ("notebooks/SliderTraining.ipynb", "optional", "Slider 训练 Notebook；用于研究概念方向控制，不能替代常规 LoRA 基线。"),
    ):
        register(
            records,
            f"{AI_TOOLKIT_REPO_URL}/blob/main/{path}",
            f"ai-toolkit: {Path(path).name}",
            "ai_toolkit_snapshot",
            CAT_GENERATIVE,
            priority,
            f"【Notebook】{note}",
            "Notebook/课件",
        )
    for item in AI_TOOLKIT_ARCHITECTURE_FILES:
        register(
            records,
            f'{AI_TOOLKIT_REPO_URL}/blob/main/{item["path"]}',
            f'ai-toolkit architecture: {item["path"]}',
            "ai_toolkit_snapshot",
            CAT_GENERATIVE,
            "recommended",
            f'【架构代码】{item["role"]}',
            "代码/基准",
        )
    register(
        records,
        f"{AI_TOOLKIT_REPO_URL}/tree/main/ui",
        "ai-toolkit Web UI",
        "ai_toolkit_snapshot",
        CAT_GENERATIVE,
        "optional",
        "【运行界面】独立 Web UI 用于配置和启动任务；生产或远程暴露时必须设置认证 token，并把生成配置与 job 日志一并归档。",
        "代码/基准",
    )
    for model in AI_TOOLKIT_SUPPORTED_MODELS:
        register(
            records,
            model["url"],
            model["name"],
            "ai_toolkit_readme_snapshot",
            CAT_GENERATIVE,
            "optional",
            f'【README 支持列表 · {AI_TOOLKIT_SNAPSHOT_DATE}】ai-toolkit 将该模型列入“{model["category"]}”支持范围；具体能力、权重许可、输入格式、显存和训练质量需回到模型卡及当前仓库配置确认。',
            "模型卡/权重",
        )

    register(
        records,
        KAGGLE_GENAI_PLAYLIST_URL,
        "Kaggle 5-Day Gen AI Intensive livestream playlist",
        "kaggle_genai_course_snapshot",
        CAT_FOUNDATION_MODELS,
        "must-read",
        "【课程直播】五天依次覆盖基础模型与 Prompt、Embeddings/RAG、Agents、领域模型和 GenAI MLOps；应与白皮书和 codelab 配套使用。",
        "视频",
    )
    for url, title, category, priority, note in (
        (
            kaggle_course["official_course_overview"],
            "Google / Kaggle 5-Day Gen AI Intensive overview",
            CAT_FOUNDATIONS,
            "recommended",
            "【官方课程说明】解释五天课程的白皮书、Podcast、codelab 与直播组合，以及从 LLM 基础到生产工具的总体范围。",
        ),
        (
            kaggle_course["self_paced_guide"],
            "Kaggle 5-Day Gen AI self-paced guide",
            CAT_FOUNDATIONS,
            "recommended",
            "【官方自学入口】课程精选内容的自定进度学习入口；页面可用性和当前模型 API 需联网复核。",
        ),
    ):
        register(records, url, title, "kaggle_genai_course_snapshot", category, priority, note, infer_kind(url))
    for day in kaggle_course.get("days", []):
        register(
            records,
            day["video_url"],
            f'Kaggle GenAI Day {day["day"]}: {day["topic"]}',
            "kaggle_genai_course_snapshot",
            day["category"],
            "recommended",
            f'【直播与清洗字幕】{day["summary"]} 本地保留英文自动字幕、分钟级文字稿和关键教学帧。',
            "视频",
        )
        for resource in day.get("resources", []):
            register(
                records,
                resource["url"],
                resource["title"],
                "kaggle_genai_course_snapshot",
                day["category"],
                resource["priority"],
                f'【Day {day["day"]} · {resource["kind"]}】与“{day["topic"]}”直播配套；具体方法、版本和实验结论以原资料为准。',
                infer_kind(resource["url"]),
            )

    register(
        records,
        BILIBILI_AGENT_VIDEO_URL,
        bilibili_agent["source"]["title"],
        "bilibili_agent_architecture_snapshot",
        CAT_INTERACTION,
        "must-read",
        "【企业 Agent 架构】连接 workflow/agentic、单/多 Agent、context engineering、MCP/AI Gateway、消息恢复、OpenTelemetry 与持续评测；本地保留 720p 视频、Whisper 转写和关键幻灯片。",
        "视频",
    )
    for resource in bilibili_agent.get("resources", []):
        if resource["url"] == BILIBILI_AGENT_VIDEO_URL:
            continue
        register(
            records,
            resource["url"],
            resource["title"],
            "bilibili_agent_architecture_snapshot",
            CAT_INTERACTION,
            resource["priority"],
            f'【Agent 架构延伸资料 · {resource["kind"]}】用于核对视频涉及组件的当前公开能力；不能反向视为视频发布时已实现的全部规划。',
            infer_kind(resource["url"]),
        )

    register(
        records,
        "https://web.stanford.edu/class/cs25/",
        "Stanford CS25: Transformers United V6",
        "stanford_cs25_schedule",
        CAT_MODELS,
        "must-read",
        "【课程综述】2026 春季公开研讨课，以 9 个前沿讲次连接 Transformer 基础、表示与世界模型、架构替代、大规模训练、预训练、Agent、多模态和生产推理。",
        "课程资料",
    )
    register(
        records,
        "https://web.stanford.edu/class/cs25/logistics/",
        "Stanford CS25 V6 Logistics",
        "stanford_cs25_schedule",
        CAT_FOUNDATIONS,
        "optional",
        "【课程上下文】课程为 1-unit S/NC 研讨课，核心要求是参加每周讲座；公开旁听者可通过直播或录播学习。",
        "课程资料",
    )
    register(
        records,
        "https://web.stanford.edu/class/cs25/recordings/",
        "Stanford CS25 Recordings",
        "stanford_cs25_schedule",
        CAT_MODELS,
        "recommended",
        "【课程导航】当前与历届精选录播入口，覆盖 Transformer、SSM、alignment、RAG、Agent 与层级表示。",
        "课程资料",
    )
    register(
        records,
        "https://www.youtube.com/playlist?list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM",
        "Stanford CS25 All Recordings Playlist",
        "stanford_cs25_schedule",
        CAT_MODELS,
        "recommended",
        "【课程导航】CS25 YouTube 完整播放列表，用于按主题补充当前与历届公开讲座。",
        "视频",
    )
    for lecture in CS25_LECTURES:
        if lecture.get("slides_url"):
            register(
                records,
                lecture["slides_url"],
                f'Stanford CS25 V6: {lecture["title"]} [slides]',
                "stanford_cs25_schedule",
                lecture["category"],
                "recommended",
                f'【课程上下文】{lecture["date"]}《{lecture["title"]}》课件。{lecture["summary"]}',
                infer_kind(lecture["slides_url"]),
            )
        if lecture.get("video_url"):
            register(
                records,
                lecture["video_url"],
                f'Stanford CS25 V6: {lecture["title"]} [video]',
                "stanford_cs25_schedule",
                lecture["category"],
                "recommended",
                f'【课程上下文】{lecture["date"]}《{lecture["title"]}》录播。{lecture["summary"]}',
                "视频",
            )
        for reading in lecture.get("readings", []):
            register(
                records,
                reading["url"],
                reading["title"],
                "stanford_cs25_schedule",
                reading["category"],
                "recommended",
                f'【论文摘要与课程上下文】{reading["note"]}',
                infer_kind(reading["url"]),
            )
    for recording in CS25_RECORDINGS:
        register(
            records,
            recording["url"],
            recording["title"],
            "stanford_cs25_recordings",
            recording["category"],
            "optional",
            f'【课程录播】{recording["speaker"]}：{recording["note"]}',
            "视频",
        )

    register(
        records,
        CS336_URL,
        "Stanford CS336: Language Modeling from Scratch",
        "stanford_cs336_snapshot",
        CAT_FOUNDATION_MODELS,
        "must-read",
        "【课程综述】以五个低脚手架实现作业串起 tokenizer/Transformer、GPU kernel 与并行、scaling law、Common Crawl 数据、SFT/RLVR 和多模态对齐。",
        "课程资料",
    )
    register(
        records,
        CS336_PLAYLIST_URL,
        "Stanford CS336 Spring 2026 YouTube playlist",
        "stanford_cs336_snapshot",
        CAT_FOUNDATION_MODELS,
        "recommended",
        f'【课程录播】当前公开 {cs336_course["coverage"]["public_video_count"]} 场、约 {format_seconds(cs336_course["playlist"]["total_duration_seconds"])}；本地保留自动字幕与分钟级清洗稿。',
        "视频",
    )
    for lecture in cs336_course["lectures"]:
        category = cs336_catalog_category(lecture["category"])
        note = f'【CS336 第 {lecture["number"]} 讲】{lecture["key_question"]} {lecture["role"]}'
        for material in lecture.get("material_links", []):
            register(
                records,
                material["url"],
                f'CS336 L{lecture["number"]}: {lecture["title"]} [material]',
                "stanford_cs336_snapshot",
                category,
                lecture["priority"],
                note,
                infer_kind(material["url"]),
            )
        video = lecture.get("video")
        if video:
            register(
                records,
                video["url"],
                video["title"],
                "stanford_cs336_snapshot",
                category,
                "recommended" if lecture["priority"] == "must-read" else lecture["priority"],
                note + " 本地保留英文自动字幕，技术名词、数字、公式与代码需回到视频核验。",
                "视频",
            )
    for assignment in cs336_course["assignments"]:
        register(
            records,
            assignment["repo_url"],
            f'CS336 Assignment {assignment["number"]}: {assignment["title_zh"]}',
            "stanford_cs336_snapshot",
            CAT_FOUNDATION_MODELS if assignment["number"] <= 4 else CAT_INTERACTION,
            "must-read",
            f'【实现作业】{assignment["engineering_value"]} 验收：{assignment["acceptance"]}',
            "代码/基准",
        )
        for item in assignment.get("official_links", []):
            register(
                records,
                item["url"],
                f'CS336 Assignment {assignment["number"]}: {item["title"]}',
                "stanford_cs336_snapshot",
                CAT_FOUNDATION_MODELS if assignment["number"] <= 4 else CAT_INTERACTION,
                "recommended",
                f'【作业资料】{assignment["title_zh"]}。{assignment["resource_note"]}',
                infer_kind(item["url"]),
            )

    for row in reading_rows:
        register(
            records,
            row["reading_url"],
            row["reading_title"],
            "reading_matrix.csv",
            row.get("category") or None,
            row.get("priority") or None,
            row.get("notes") or None,
            infer_kind(row["reading_url"]),
        )

    for lecture in schedule:
        title = lecture.get("title", "课程讲次")
        for reading in lecture.get("readings", []):
            register(
                records,
                reading.get("url", ""),
                reading.get("title", "阅读资料"),
                "schedule.json",
                kind=infer_kind(reading.get("url", "")),
            )
        for field, label in (("slides_url", "slides"), ("video_url", "video")):
            if lecture.get(field):
                register(
                    records,
                    lecture[field],
                    f"{title} [{label}]",
                    "schedule.json",
                    kind=infer_kind(lecture[field]),
                )

    markdown_pattern = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")
    url_pattern = re.compile(r"https?://[^\s\"'<>`\\)\\]]+")
    for name in INPUTS:
        path = ROOT / name
        text = path.read_text(encoding="utf-8")
        if path.suffix.lower() == ".html":
            collector = AnchorCollector()
            collector.feed(text)
            for title, url in collector.items:
                register(records, url, title, name, kind=infer_kind(url))
        for title, url in markdown_pattern.findall(text):
            register(records, url, title, name, kind=infer_kind(url))
        for url in url_pattern.findall(text):
            register(records, url, short_url(url), name, kind=infer_kind(url))

    final: list[dict] = []
    for record in records.values():
        if not record["title"]:
            record["title"] = short_url(record["url"])
        if record["url"] in TITLE_OVERRIDES:
            record["title"] = TITLE_OVERRIDES[record["url"]]
        elif urlparse(record["url"]).netloc.lower() == "arxiv.org":
            paper_id = urlparse(record["url"]).path.rstrip("/").rsplit("/", 1)[-1].removesuffix(".pdf")
            paper_id = re.sub(r"v\d+$", "", paper_id)
            if paper_id in ARXIV_TITLES:
                record["title"] = ARXIV_TITLES[paper_id]
        if not record["categories"] or not record["notes"] or not record["priorities"]:
            category, priority, note = annotation_for(record)
            if not record["categories"]:
                record["categories"].add(category)
            if not record["priorities"]:
                record["priorities"].add(priority)
            if not record["notes"]:
                record["notes"].add(note)
        priorities = sorted(record["priorities"], key=lambda item: PRIORITY_RANK.get(item, 99))
        final.append(
            {
                "url": record["url"],
                "title": record["title"],
                "domain": urlparse(record["url"]).netloc,
                "origins": sorted(record["origins"]),
                "categories": sorted(record["categories"]),
                "priority": priorities[0] if priorities else "reference",
                "notes": sorted(record["notes"]),
                "kinds": sorted(record["kinds"]),
            }
        )
    return sorted(final, key=lambda item: (item["domain"], item["title"].lower(), item["url"]))


def knowledge_stage_id(record: dict) -> str:
    categories = set(record.get("categories", []))
    text = " ".join(
        [record.get("title", ""), record.get("url", ""), *record.get("notes", [])]
    ).lower()
    runtime_candidate = bool(categories & {CAT_FOUNDATIONS, CAT_FOUNDATION_MODELS, CAT_INTERACTION})
    if runtime_candidate and any(keyword in text for keyword in RUNTIME_KEYWORDS):
        return "runtime-evaluation"
    if CAT_DATA in categories:
        return "representation"
    if CAT_MODELS in categories:
        return "architecture"
    if CAT_FOUNDATION_MODELS in categories:
        return "foundation-models"
    if CAT_MULTIMODAL in categories:
        return "multimodal"
    if CAT_GENERATIVE in categories:
        return "generative"
    if CAT_INTERACTION in categories:
        return "reasoning-agents"
    return "research"


def build_knowledge_clusters(records: list[dict]) -> list[dict]:
    by_stage: dict[str, list[dict]] = defaultdict(list)
    for record in records:
        by_stage[knowledge_stage_id(record)].append(record)
    clusters = []
    for stage in KNOWLEDGE_STAGES:
        members = sorted(
            by_stage[stage["id"]],
            key=lambda item: (PRIORITY_RANK.get(item["priority"], 99), item["title"].lower()),
        )
        clusters.append(
            {
                **stage,
                "item_count": len(members),
                "priority_counts": dict(Counter(item["priority"] for item in members)),
                "members": members,
            }
        )
    return clusters


CSS = """
:root { --ink:#16302c; --muted:#56706a; --paper:#f7faf7; --surface:#ffffff; --line:#d3dfda; --green:#087c69; --teal:#006f82; --coral:#c94e2e; --gold:#996200; --soft-green:#e7f4ee; --soft-coral:#fff0eb; --soft-blue:#eaf4f6; }
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { margin:0; color:var(--ink); background:var(--paper); font-family:"Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif; line-height:1.65; }
a { color:#006d73; text-decoration-thickness:1px; text-underline-offset:3px; }
a:hover { color:#b84428; }
.shell { width:min(1160px, calc(100% - 40px)); margin:0 auto; }
.topbar { background:#113d36; color:#fff; border-bottom:4px solid #d26a35; }
.topbar .shell { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:13px 0; }
.brand { color:#fff; font-weight:700; text-decoration:none; letter-spacing:0; }
.topnav { display:flex; flex-wrap:wrap; gap:14px; }
.topnav a { color:#d7ebe5; text-decoration:none; font-size:14px; }
.hero { background:#e6f2ed; border-bottom:1px solid var(--line); padding:48px 0 42px; }
.eyebrow { margin:0 0 10px; color:#087c69; font-weight:700; font-size:13px; letter-spacing:0; text-transform:uppercase; }
h1,h2,h3,h4 { line-height:1.28; margin:0; color:#123d37; letter-spacing:0; }
h1 { max-width:900px; font-size:40px; }
h2 { font-size:26px; margin-bottom:14px; }
h3 { font-size:18px; margin-bottom:8px; }
h4 { font-size:16px; margin-bottom:6px; }
p { margin:0 0 12px; }
.lead { max-width:900px; color:#38544e; font-size:18px; }
main { padding:30px 0 52px; }
section { margin:0 0 34px; }
.section-head { display:flex; align-items:baseline; justify-content:space-between; gap:16px; margin-bottom:14px; }
.section-head p { color:var(--muted); margin:0; font-size:14px; }
.notice { border-left:4px solid var(--coral); background:var(--soft-coral); padding:14px 16px; }
.notice.info { border-color:var(--teal); background:var(--soft-blue); }
.grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:14px; }
.grid.two { grid-template-columns:repeat(2, minmax(0,1fr)); }
.item { border:1px solid var(--line); border-top:4px solid var(--green); background:var(--surface); padding:17px; border-radius:6px; }
.item.teal { border-top-color:var(--teal); }
.item.coral { border-top-color:var(--coral); }
.item.gold { border-top-color:var(--gold); }
.kicker { color:var(--muted); font-size:13px; font-weight:700; margin-bottom:7px; }
.pill { display:inline-block; margin:0 5px 5px 0; padding:2px 7px; border:1px solid #b7d4c9; border-radius:999px; background:#f3fbf7; color:#285d52; font-size:12px; }
.flow { display:grid; grid-template-columns:repeat(7, minmax(0,1fr)); gap:7px; align-items:stretch; }
.flow.five { grid-template-columns:repeat(5, minmax(0,1fr)); }
.flow.six { grid-template-columns:repeat(6, minmax(0,1fr)); }
.flow.eight { grid-template-columns:repeat(8, minmax(0,1fr)); }
.flow div { position:relative; padding:12px 9px; background:#fff; border:1px solid var(--line); text-align:center; font-size:13px; }
.flow div:not(:last-child)::after { content:"→"; position:absolute; right:-8px; top:50%; z-index:2; transform:translateY(-50%); color:var(--coral); font-size:18px; }
.path-toc { position:sticky; top:0; z-index:20; box-shadow:0 8px 18px rgba(18,61,55,.08); }
.metric-strip { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border:1px solid var(--line); border-left:4px solid var(--teal); background:#fff; margin:0 0 30px; }
.metric { min-height:94px; padding:16px 18px; border-right:1px solid var(--line); }
.metric:last-child { border-right:0; }
.metric strong { display:block; color:#123d37; font-size:28px; line-height:1.1; }
.metric span { display:block; margin-top:7px; color:var(--muted); font-size:13px; }
.stage-map { display:grid; grid-template-columns:repeat(8,minmax(0,1fr)); gap:7px; align-items:stretch; }
.stage-node { position:relative; min-width:0; min-height:112px; padding:13px 8px 11px; border:1px solid var(--line); border-top:5px solid var(--stage-color); border-radius:4px; background:#fff; color:var(--ink); font:inherit; text-align:left; cursor:pointer; transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease; }
.stage-node:hover,.stage-node:focus-visible { border-color:var(--stage-color); outline:0; box-shadow:0 5px 14px rgba(18,61,55,.13); transform:translateY(-2px); }
.stage-node[aria-pressed="true"] { border-color:var(--stage-color); background:var(--stage-soft); box-shadow:inset 0 0 0 1px var(--stage-color); }
.stage-node:not(:last-child)::after { content:"→"; position:absolute; right:-10px; top:46px; z-index:3; width:12px; color:#a1442d; font-weight:700; text-align:center; pointer-events:none; }
.stage-index { display:block; color:var(--stage-color); font-size:12px; font-weight:700; }
.stage-label { display:block; min-height:40px; margin:5px 0 4px; color:#173e37; font-size:14px; font-weight:700; line-height:1.4; }
.stage-count { display:block; color:var(--muted); font-size:12px; }
.stage-inspector { display:grid; grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr); gap:0; margin-top:12px; border:1px solid var(--line); border-left:5px solid var(--stage-color,#256f5b); background:#fff; }
.inspector-main,.inspector-side { padding:19px 21px; }
.inspector-side { border-left:1px solid var(--line); background:#f1f6f3; }
.inspector-kicker { margin:0 0 6px; color:var(--stage-color,#256f5b); font-size:12px; font-weight:700; }
.inspector-question { margin:9px 0; color:#294c45; font-size:16px; font-weight:700; }
.inspector-summary { color:var(--muted); }
.inspector-meta { margin:0 0 10px; color:var(--muted); font-size:13px; }
.inspector-link { display:inline-block; margin-top:3px; font-weight:700; }
.concept-list { display:flex; flex-wrap:wrap; gap:5px; margin-top:12px; }
.concept-chip { padding:3px 8px; border:1px solid color-mix(in srgb,var(--stage-color,#256f5b) 45%,#fff); border-radius:999px; background:#fff; color:#294c45; font-size:12px; }
.viz-grid { display:grid; grid-template-columns:minmax(330px,.72fr) minmax(0,1.28fr); gap:28px; align-items:start; }
.viz-panel { min-width:0; border-top:3px solid #2d7061; padding-top:14px; }
.viz-panel h3 { margin-bottom:4px; }
.viz-caption { color:var(--muted); font-size:13px; }
.bar-chart { display:grid; gap:8px; margin-top:15px; }
.bar-row { display:grid; grid-template-columns:92px minmax(0,1fr) 32px; gap:9px; align-items:center; width:100%; padding:2px 0; border:0; background:transparent; color:var(--ink); font:inherit; text-align:left; cursor:pointer; }
.bar-row:hover .bar-fill,.bar-row:focus-visible .bar-fill { filter:saturate(1.2); }
.bar-row:focus-visible { outline:2px solid var(--teal); outline-offset:3px; }
.bar-row[aria-current="true"] .bar-name { color:var(--stage-color); }
.bar-row[aria-current="true"] .bar-track { box-shadow:0 0 0 2px color-mix(in srgb,var(--stage-color) 45%,#fff); }
.bar-name { overflow:hidden; font-size:13px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }
.bar-track { position:relative; height:14px; overflow:hidden; background:#e5ece8; }
.bar-fill { display:block; height:100%; width:var(--bar-width); background:var(--stage-color); }
.bar-value { color:var(--muted); font-size:13px; text-align:right; }
.heatmap-wrap { overflow-x:auto; margin-top:15px; }
.heatmap { display:grid; grid-template-columns:minmax(148px,1.45fr) repeat(8,minmax(54px,.6fr)); min-width:720px; border-top:1px solid var(--line); border-left:1px solid var(--line); }
.heat-label,.heat-head,.heat-cell { min-height:43px; padding:7px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); }
.heat-head { display:flex; align-items:center; justify-content:center; background:#eef4f1; color:#31554e; font-size:11px; font-weight:700; line-height:1.2; text-align:center; }
.heat-label { display:flex; flex-direction:column; justify-content:center; background:#fff; font-size:12px; font-weight:700; line-height:1.25; }
.heat-label small { margin-top:2px; color:var(--muted); font-weight:400; }
.heat-cell { display:flex; align-items:center; justify-content:center; background:#fff; color:#fff; font-size:12px; font-weight:700; }
.heat-cell.level-0 { color:#9baba6; background:#f5f7f6; }
.heat-cell.level-1 { color:#355d53; background:#dcece5; }
.heat-cell.level-2 { background:#5a9b88; }
.heat-cell.level-3 { background:#185f52; }
.heat-legend { display:flex; flex-wrap:wrap; gap:12px; margin-top:9px; color:var(--muted); font-size:12px; }
.heat-legend span::before { content:""; display:inline-block; width:10px; height:10px; margin-right:5px; border:1px solid #c9d6d1; vertical-align:-1px; background:var(--legend-color); }
.timeline { position:relative; margin:8px 0 0 10px; padding-left:30px; }
.timeline::before { content:""; position:absolute; top:6px; bottom:7px; left:7px; width:2px; background:#b9cbc5; }
.timeline-item { position:relative; display:grid; grid-template-columns:112px minmax(190px,.72fr) minmax(0,1.28fr); gap:18px; padding:0 0 24px; }
.timeline-item:last-child { padding-bottom:0; }
.timeline-marker { position:absolute; top:4px; left:-30px; width:16px; height:16px; border:4px solid #fff; border-radius:50%; background:var(--timeline-color); box-shadow:0 0 0 1px var(--timeline-color); }
.timeline-period { color:var(--timeline-color); font-size:14px; font-weight:700; }
.timeline-question { color:#193f38; font-weight:700; }
.timeline-detail { color:#3f5d56; }
.timeline-target { display:block; margin-top:4px; color:var(--muted); font-size:12px; }
.detail-table-toggle { margin-top:18px; }
.stage-section { scroll-margin-top:86px; padding-top:7px; border-top:1px solid var(--line); }
.repo-status { display:inline-block; padding:2px 7px; border:1px solid #bfd1ca; border-radius:999px; background:#f4f8f6; color:#3f5d56; font-size:11px; white-space:nowrap; }
.repo-status.current { border-color:#84b7a7; background:#e7f4ee; color:#1c5f50; }
.repo-status.caution { border-color:#e0b6a8; background:#fff0eb; color:#8f3f2c; }
.repo-table td:first-child { min-width:190px; }
.repo-table td:nth-child(2) { min-width:150px; }
.repo-table td:nth-child(4) { min-width:290px; }
.static-bars { display:grid; gap:9px; margin-top:13px; }
.static-bar-row { display:grid; grid-template-columns:150px minmax(0,1fr) 34px; gap:10px; align-items:center; }
.static-bar-name { overflow:hidden; color:#294c45; font-size:13px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }
.static-bar-track { height:14px; overflow:hidden; background:#e5ece8; }
.static-bar-fill { display:block; height:100%; width:var(--bar-width); background:var(--bar-color,#2d7061); }
.static-bar-value { color:var(--muted); font-size:13px; text-align:right; }
.repo-callout { border-top:3px solid var(--teal); padding-top:13px; }
.media-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin-top:15px; }
.media-figure { min-width:0; margin:0; border:1px solid var(--line); background:#fff; }
.media-figure img { display:block; width:100%; aspect-ratio:16/9; object-fit:cover; background:#101817; }
.media-figure figcaption { padding:10px 12px; color:#3f5d56; font-size:13px; }
.transcript-block { display:grid; grid-template-columns:72px minmax(0,1fr); gap:13px; padding:11px 0; border-bottom:1px solid var(--line); }
.transcript-block[hidden] { display:none; }
.transcript-time { font-weight:700; white-space:nowrap; }
.transcript-text { margin:0; color:#294c45; }
table { width:100%; border-collapse:collapse; background:#fff; border:1px solid var(--line); }
th,td { padding:10px; border-bottom:1px solid var(--line); vertical-align:top; text-align:left; }
th { background:#e9f3ef; color:#214c43; font-size:14px; }
td { font-size:14px; }
.table-wrap { overflow-x:auto; border-radius:6px; }
ul,ol { margin:8px 0 0; padding-left:21px; }
li { margin:4px 0; }
code { background:#e8f1ee; border-radius:3px; padding:1px 4px; color:#164d43; }
.small { color:var(--muted); font-size:13px; }
.source-list { columns:2; column-gap:32px; }
.source-list li { break-inside:avoid; }
.chapter-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:11px; list-style:none; padding:0; }
.chapter-list a { display:block; height:100%; padding:13px; border:1px solid var(--line); background:#fff; text-decoration:none; border-radius:6px; }
.chapter-list a:hover { border-color:var(--teal); }
.chapter-list strong { display:block; color:#123d37; }
.chapter-list span { color:var(--muted); font-size:13px; }
.filter { width:100%; margin:0 0 12px; padding:11px 12px; border:1px solid #a9c4ba; border-radius:4px; font:inherit; color:var(--ink); }
.filter-grid { display:grid; grid-template-columns:minmax(0,2fr) minmax(220px,1fr); gap:10px; margin-bottom:8px; }
.filter-grid .filter { margin:0; background:#fff; }
.toc { border:1px solid var(--line); background:#fff; padding:13px 16px; border-radius:6px; margin:0 0 24px; }
.toc a { margin-right:13px; font-size:14px; }
details { border:1px solid var(--line); border-radius:6px; background:#fff; margin:10px 0; }
summary { cursor:pointer; padding:12px 14px; color:#174b42; font-weight:700; }
details > div { padding:0 14px 14px; }
.lecture { border-left:4px solid var(--teal); background:#fff; padding:15px 17px; margin:12px 0; }
.lecture h3 { font-size:18px; }
.lecture-meta { color:var(--muted); font-size:13px; margin-bottom:8px; }
.reading-list { margin-top:10px; }
.reading-list li { margin:7px 0; }
.reading-note { color:var(--muted); font-size:13px; }
.catalog-table td:first-child { min-width:220px; }
.catalog-table td:nth-child(2) { min-width:180px; }
footer { border-top:1px solid var(--line); color:var(--muted); padding:20px 0 34px; font-size:13px; }
@media (max-width:1000px) { .stage-map { grid-template-columns:repeat(4,minmax(0,1fr)); } .stage-node:nth-child(4)::after { display:none; } .stage-node:nth-child(n+5)::after { content:"→"; } .stage-node:last-child::after { display:none; } .viz-grid { grid-template-columns:1fr; } }
@media (max-width:850px) { h1 { font-size:32px; } .grid,.grid.two,.filter-grid,.media-grid { grid-template-columns:1fr; } .flow,.flow.five,.flow.six,.flow.eight { grid-template-columns:1fr; } .flow div:not(:last-child)::after { content:"↓"; right:50%; top:auto; bottom:-15px; transform:translateX(50%); } .source-list { columns:1; } .stage-inspector { grid-template-columns:1fr; } .inspector-side { border-top:1px solid var(--line); border-left:0; } .timeline-item { grid-template-columns:95px minmax(0,1fr); gap:12px; } .timeline-detail { grid-column:1 / -1; } }
@media (max-width:600px) { .shell { width:min(calc(100% - 26px), 1160px); } .topbar .shell { align-items:flex-start; flex-direction:column; gap:7px; } .topnav { gap:9px 12px; } .hero { padding:31px 0; } h1 { font-size:26px; } th,td { padding:8px; } .chapter-list { grid-template-columns:1fr; } .section-head { align-items:flex-start; flex-direction:column; gap:2px; } .path-toc { position:static; box-shadow:none; } .metric-strip { grid-template-columns:repeat(2,minmax(0,1fr)); } .metric:nth-child(2) { border-right:0; } .metric:nth-child(-n+2) { border-bottom:1px solid var(--line); } .metric strong { font-size:24px; } .stage-map { grid-template-columns:repeat(2,minmax(0,1fr)); } .stage-node::after { display:none !important; } .timeline-item { grid-template-columns:1fr; gap:4px; } .timeline-detail { grid-column:auto; } .bar-row { grid-template-columns:78px minmax(0,1fr) 29px; } .static-bar-row { grid-template-columns:112px minmax(0,1fr) 28px; } .transcript-block { grid-template-columns:1fr; gap:3px; } }
"""


def page(title: str, subtitle: str, body: str, active: str = "") -> str:
    nav = [
        ("index.html", "首页", "index"),
        ("knowledge_path.html", "知识主线", "path"),
        ("sources.html", "来源综述", "sources"),
        ("how2ai.html", "How2AI 课程", "how2ai"),
        ("stanford_cs25.html", "Stanford CS25", "cs25"),
        ("stanford_cs336.html", "Stanford CS336", "cs336"),
        ("karpathy.html", "Karpathy", "karpathy"),
        ("ai_toolkit.html", "AI Toolkit", "ai_toolkit"),
        ("kaggle_genai.html", "Kaggle GenAI", "kaggle_genai"),
        ("agent_architecture.html", "Agent 架构", "agent_architecture"),
        ("papers.html", "论文矩阵", "papers"),
        ("catalog.html", "全部链接", "catalog"),
    ]
    nav_items = []
    for href, label, key in nav:
        current = ' aria-current="page"' if key == active else ""
        nav_items.append(f'<a href="{href}"{current}>{label}</a>')
    nav_html = "".join(nav_items)
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="AI、CV、AIGC、LLM 推理与 Agent 的离线学习知识库">
<title>{esc(title)} | 离线 AI 学习知识库</title>
<style>{CSS}</style>
</head>
<body>
<header class="topbar"><div class="shell"><a class="brand" href="index.html">AI OFFLINE KB</a><nav class="topnav" aria-label="主导航">{nav_html}</nav></div></header>
<div class="hero"><div class="shell"><p class="eyebrow">OFFLINE LEARNING LIBRARY · {KARPATHY_SNAPSHOT_DATE}</p><h1>{esc(title)}</h1><p class="lead">{esc(subtitle)}</p></div></div>
<main class="shell">{body}</main>
<footer class="shell">本地可读内容基于十三个公开课程、博客、代码与视频来源及已有课程报告整理。外链用于回到原始出处；CS336 官方讲义、作业仓库与自动字幕另保留本地快照。</footer>
</body></html>"""


def priority_label(priority: str) -> str:
    return {
        "must-read": "必读",
        "recommended": "推荐",
        "optional": "选读",
        "reference": "参考",
    }.get(priority, priority)


def find_core_record(records: list[dict], title: str) -> dict | None:
    lowered = title.lower()
    for record in records:
        if record["title"].lower() == lowered:
            return record
    for record in records:
        if lowered in record["title"].lower() or record["title"].lower() in lowered:
            return record
    return None


def build_knowledge_path(records: list[dict]) -> str:
    clusters = build_knowledge_clusters(records)
    stage_names = {stage["id"]: stage["short_title"] for stage in clusters}
    stage_colors = [
        ("#256f5b", "#e7f3ee"),
        ("#00828a", "#e5f4f4"),
        ("#3c6e9e", "#eaf0f7"),
        ("#7662a2", "#f0edf6"),
        ("#a96600", "#fbf1df"),
        ("#bd4d31", "#fbece7"),
        ("#aa3658", "#f8e9ee"),
        ("#4e5f6b", "#ebeff1"),
    ]
    stage_nodes = "".join(
        f'''<button class="stage-node" type="button" data-stage="{stage["id"]}" aria-pressed="{'true' if index == 0 else 'false'}" style="--stage-color:{stage_colors[index][0]};--stage-soft:{stage_colors[index][1]}">
        <span class="stage-index">L{stage["order"]:02d}</span><span class="stage-label">{esc(stage["short_title"])}</span><span class="stage-count">{stage["item_count"]} 个条目</span></button>'''
        for index, stage in enumerate(clusters)
    )
    max_items = max(stage["item_count"] for stage in clusters)
    bar_rows = "".join(
        f'''<button class="bar-row" type="button" data-stage-target="{stage["id"]}" style="--stage-color:{stage_colors[index][0]};--bar-width:{stage["item_count"] / max_items * 100:.1f}%" aria-label="查看{esc(stage["short_title"])}，{stage["item_count"]}个条目">
        <span class="bar-name">{esc(stage["short_title"])}</span><span class="bar-track"><span class="bar-fill"></span></span><span class="bar-value">{stage["item_count"]}</span></button>'''
        for index, stage in enumerate(clusters)
    )
    heat_headers = '<div class="heat-head">来源 / 能力</div>' + "".join(
        f'<div class="heat-head">{esc(stage["short_title"])}</div>' for stage in clusters
    )
    heat_labels = ["无", "辅", "主", "深"]
    heat_rows = []
    for source in SOURCE_STAGE_MATRIX:
        cells = "".join(
            f'<div class="heat-cell level-{value}" title="{esc(source["name"])} × {esc(clusters[index]["short_title"])}：{heat_labels[value]}度覆盖" aria-label="{esc(source["name"])}对{esc(clusters[index]["short_title"])}为{heat_labels[value]}度覆盖">{heat_labels[value]}</div>'
            for index, value in enumerate(source["values"])
        )
        heat_rows.append(
            f'<div class="heat-label">{esc(source["name"])}<small>{esc(source["role"])}</small></div>{cells}'
        )
    timeline_data = [
        ("2012–2016", "如何学习可迁移表征和可计算生成分布？", "Representation Learning、VAE、早期 Diffusion、Normalizing Flow、attention。", "数据与表征、生成建模", stage_colors[1][0]),
        ("2017–2019", "能否用统一序列架构替代任务专用网络？", "Transformer、Deep Sets/GNN、BERT/GPT 式预训练、自监督学习。", "模型架构、基础模型", stage_colors[2][0]),
        ("2020–2022", "规模、数据和模态如何共同扩展能力？", "Scaling laws、ViT/CLIP、Chinchilla、latent diffusion、instruction tuning。", "基础模型、多模态、生成建模", stage_colors[4][0]),
        ("2022–2024", "如何让模型推理、调用工具并更低成本生成？", "CoT/ReAct、RLHF/DPO、multimodal LLM、DiT、Flow Matching、Consistency。", "推理与 Agent、生成建模、后训练", stage_colors[6][0]),
        ("2024–2026", "如何在部署时继续计算、交互、监督并持续改进？", "test-time scaling、on-policy distillation、实时多模态、世界模型、Agent environments、monitorability。", "运行时与评测反馈闭环", stage_colors[7][0]),
    ]
    timeline_html = "".join(
        f'''<article class="timeline-item" style="--timeline-color:{color}"><span class="timeline-marker" aria-hidden="true"></span><div class="timeline-period">{period}</div><div class="timeline-question">{question}</div><div class="timeline-detail">{detail}<span class="timeline-target">落到知识库：{target}</span></div></article>'''
        for period, question, detail, target, color in timeline_data
    )
    first_stage = clusters[0]
    first_dependencies = "、".join(stage_names[item] for item in first_stage["dependencies"]) or "无；这是起点"
    first_concepts = "".join(f'<span class="concept-chip">{esc(item)}</span>' for item in first_stage["concepts"])
    stage_payload = json.dumps(
        [
            {
                "id": stage["id"],
                "order": stage["order"],
                "title": stage["title"],
                "shortTitle": stage["short_title"],
                "count": stage["item_count"],
                "question": stage["question"],
                "summary": stage["summary"],
                "dependencies": "、".join(stage_names[item] for item in stage["dependencies"]) or "无；这是起点",
                "concepts": stage["concepts"],
                "output": stage["engineering_output"],
                "color": stage_colors[index][0],
            }
            for index, stage in enumerate(clusters)
        ],
        ensure_ascii=False,
    ).replace("</", "<\\/")
    stage_sections = []
    for stage in clusters:
        dependencies = "、".join(stage_names[item] for item in stage["dependencies"]) or "无；这是起点"
        concepts = "".join(f'<span class="pill">{esc(item)}</span>' for item in stage["concepts"])
        core_items = []
        seen_urls = set()
        for title in stage["core_titles"]:
            record = find_core_record(stage["members"], title)
            if record and record["url"] not in seen_urls:
                seen_urls.add(record["url"])
                core_items.append(
                    f'<li>{link(record["url"], record["title"])} <span class="pill">{priority_label(record["priority"])}</span><div class="reading-note">{esc(record["notes"][0])}</div></li>'
                )
        member_rows = "".join(
            f'<tr><td>{link(record["url"], record["title"])}</td><td>{priority_label(record["priority"])}</td><td>{esc(" / ".join(record["kinds"]))}</td><td>{esc(record["notes"][0])}</td></tr>'
            for record in stage["members"]
        )
        core_html = (
            f'<h3>主干阅读</h3><ul class="reading-list">{"".join(core_items)}</ul>'
            if core_items
            else ""
        )
        stage_sections.append(
            f'''<section class="stage-section" id="{stage["id"]}"><div class="section-head"><h2>{stage["order"]}. {esc(stage["title"])}</h2><p>{stage["item_count"]} 个知识条目</p></div>
            <p class="lead">{esc(stage["question"])}</p><p>{esc(stage["summary"])}</p>
            <div class="grid two"><article class="item"><h3>前置依赖与核心概念</h3><p><strong>依赖：</strong>{esc(dependencies)}</p><div>{concepts}</div></article><article class="item teal"><h3>工程验收产物</h3><p>{esc(stage["engineering_output"])}</p></article></div>
            <p class="notice info"><strong>同类合并：</strong>{esc(stage["source_synthesis"])}</p>
            {core_html}
            <details><summary>查看本层全部 {stage["item_count"]} 个知识条目</summary><div class="table-wrap"><table><thead><tr><th>资料</th><th>优先级</th><th>类型</th><th>本地学习定位</th></tr></thead><tbody>{member_rows}</tbody></table></div></details></section>'''
        )
    toc_stage_links = "".join(
        f'<a href="#{stage["id"]}">{stage["order"]}. {esc(stage["short_title"])}</a>'
        for stage in clusters
    )
    body = f"""
<div class="toc path-toc"><strong>本页：</strong><a href="#spine">能力地图</a><a href="#coverage">知识分布</a><a href="#evolution">技术演进</a><a href="#distinctions">关键区分</a><a href="#route">统一路线</a>{toc_stage_links}</div>
<section class="notice info"><strong>合并结果：</strong>十三个课程、博客、代码与视频来源中的 <strong>{len(records)}</strong> 个知识条目已全部唯一归入 8 层技术主线。来源继续作为出处保留，但默认学习入口改为能力依赖关系；同一概念不再因出现在多个来源而重复学习。</section>
<div class="metric-strip" aria-label="知识库概览"><div class="metric"><strong>{len(records)}</strong><span>唯一知识条目</span></div><div class="metric"><strong>{len(clusters)}</strong><span>能力阶段</span></div><div class="metric"><strong>{len(DIRECT_SOURCES)}</strong><span>课程与技术来源</span></div><div class="metric"><strong>100%</strong><span>已分类并保留出处</span></div></div>
<section id="spine"><div class="section-head"><h2>统一能力地图</h2><p>点击任一层，查看问题、依赖和工程产物</p></div><div class="stage-map" role="group" aria-label="八层技术能力地图">{stage_nodes}</div>
<div class="stage-inspector" id="stage-inspector" style="--stage-color:{stage_colors[0][0]}" aria-live="polite"><div class="inspector-main"><p class="inspector-kicker" id="inspector-kicker">L{first_stage["order"]:02d} · {first_stage["item_count"]} 个条目</p><h3 id="inspector-title">{esc(first_stage["title"])}</h3><p class="inspector-question" id="inspector-question">{esc(first_stage["question"])}</p><p class="inspector-summary" id="inspector-summary">{esc(first_stage["summary"])}</p><div class="concept-list" id="inspector-concepts">{first_concepts}</div></div><div class="inspector-side"><p class="inspector-meta"><strong>前置依赖</strong><br><span id="inspector-dependencies">{esc(first_dependencies)}</span></p><p class="inspector-meta"><strong>工程验收产物</strong><br><span id="inspector-output">{esc(first_stage["engineering_output"])}</span></p><a class="inspector-link" id="inspector-link" href="#{first_stage["id"]}">进入本层资料 ↓</a></div></div>
<p class="notice">这条主线既是依赖图，也是排错顺序：生产系统失效时，先检查评测与运行时，再沿 Agent、模型能力、架构、表征和数据向前追溯；不要默认问题只能靠换更大的模型解决。</p></section>
<section id="coverage"><div class="section-head"><h2>知识分布与来源覆盖</h2><p>条目数量回答“学多少”，覆盖深度回答“去哪学”</p></div><div class="viz-grid"><div class="viz-panel"><h3>各能力层知识量</h3><p class="viz-caption">共 {len(records)} 个唯一条目；点击条形可同步上方能力说明。</p><div class="bar-chart">{bar_rows}</div></div><div class="viz-panel"><h3>十三个来源 × 八层能力</h3><p class="viz-caption">这是基于本地综述与索引的定性覆盖深度，不是重复论文或仓库的精确计数。</p><div class="heatmap-wrap"><div class="heatmap">{heat_headers}{''.join(heat_rows)}</div></div><div class="heat-legend"><span style="--legend-color:#f5f7f6">无覆盖</span><span style="--legend-color:#dcece5">辅助</span><span style="--legend-color:#5a9b88">主线</span><span style="--legend-color:#185f52">纵深</span></div></div></div></section>
<section id="evolution"><div class="section-head"><h2>技术演进脉络</h2><p>不是模型名单，而是研究问题如何逐层变化</p></div><div class="timeline">{timeline_html}</div><details class="detail-table-toggle"><summary>查看技术演进对照表</summary><div class="table-wrap"><table><thead><tr><th>阶段</th><th>主要问题</th><th>代表转变</th><th>延伸到本知识库</th></tr></thead><tbody>
<tr><td>2012–2016</td><td>如何学习可迁移表征和可计算生成分布？</td><td>Representation Learning、VAE、早期 Diffusion、Normalizing Flow、attention。</td><td>数据与表征、生成建模。</td></tr>
<tr><td>2017–2019</td><td>能否用统一序列架构替代任务专用网络？</td><td>Transformer、Deep Sets/GNN、BERT/GPT 式预训练、自监督学习。</td><td>模型架构、基础模型。</td></tr>
<tr><td>2020–2022</td><td>规模、数据和模态如何共同扩展能力？</td><td>Scaling laws、ViT/CLIP、Chinchilla、latent diffusion、instruction tuning。</td><td>基础模型、多模态、生成建模。</td></tr>
<tr><td>2022–2024</td><td>如何让模型推理、调用工具并更低成本生成？</td><td>CoT/ReAct、RLHF/DPO、multimodal LLM、DiT、Flow Matching、Consistency。</td><td>推理与 Agent、生成建模、后训练。</td></tr>
<tr><td>2024–2026</td><td>如何在部署时继续计算、交互、监督并持续改进？</td><td>test-time scaling、on-policy distillation、实时多模态、世界模型、Agent environments、monitorability。</td><td>运行时与评测反馈闭环。</td></tr>
</tbody></table></div></details></section>
<section id="distinctions"><div class="section-head"><h2>必须保留的概念边界</h2><p>同类合并不等于把相近术语混为一谈。</p></div><div class="table-wrap"><table><thead><tr><th>容易混淆</th><th>应当怎样区分</th><th>实验上怎么测</th></tr></thead><tbody>
<tr><td>Multimodal alignment vs LLM alignment</td><td>前者对齐不同模态的表示或语义；后者让模型行为符合偏好、规范或安全要求。</td><td>分别测跨模态检索/组合泛化与偏好胜率/安全/误拒。</td></tr>
<tr><td>Normalizing Flow vs Flow Matching vs probability-flow ODE</td><td>前者强调可逆变换与精确似然；Flow Matching 学速度场；probability-flow ODE 是 score/SDE 对应的确定性动力学。</td><td>比较训练目标、是否需 Jacobian、路径曲率、NFE 和似然/样本质量。</td></tr>
<tr><td>Representation vs World Model</td><td>表征只需编码任务相关信息；world model 还要支持状态演化、预测、规划或控制。</td><td>除线性探测外，增加未来预测、干预、规划效率和控制回报。</td></tr>
<tr><td>CoT trace vs Faithful reasoning</td><td>可读推理文本可能改善答案，却不保证忠实反映模型内部因果过程。</td><td>做步骤扰动、隐藏信息、过程 verifier 和答案保持性实验。</td></tr>
<tr><td>Model scaling vs Test-time scaling vs System scaling</td><td>分别增加训练时模型/数据、单题推理预算、以及并发 serving/工具/评测基础设施。</td><td>分别画训练 compute、单题 token/搜索预算和端到端成本—质量曲线。</td></tr>
<tr><td>Agent success vs Tool-call success</td><td>工具成功只说明执行接口可用；任务成功还依赖计划、状态、约束、验证和副作用控制。</td><td>保存完整 trajectory，分别给最终结果、中间决策、安全和恢复评分。</td></tr>
</tbody></table></div></section>
<section id="route"><div class="section-head"><h2>10 周统一学习路线</h2><p>只保留一条默认主线，角色差异放到项目选题。</p></div><div class="table-wrap"><table><thead><tr><th>周</th><th>主线</th><th>学习动作</th><th>验收产物</th></tr></thead><tbody>
<tr><td>1</td><td>研究方法</td><td>建立实验模板，复盘一个训练失败案例。</td><td>可复现 baseline 与实验日志。</td></tr>
<tr><td>2</td><td>数据与表征</td><td>比较监督、自监督和对比目标。</td><td>表示质量、迁移和 OOD 对照。</td></tr>
<tr><td>3</td><td>模型架构</td><td>比较 Transformer、CNN/ViT、SSM 或图结构。</td><td>质量—吞吐—显存模型卡。</td></tr>
<tr><td>4</td><td>基础模型</td><td>学习 scaling、预训练数据、LoRA 与量化。</td><td>训练/适配/部署决策表。</td></tr>
<tr><td>5</td><td>多模态</td><td>做 alignment、fusion 和 modality ablation。</td><td>单模态捷径与交互增益报告。</td></tr>
<tr><td>6</td><td>生成建模</td><td>实现 DDPM 或 Flow Matching toy，并替换 sampler。</td><td>NFE—延迟—质量 Pareto。</td></tr>
<tr><td>7</td><td>推理</td><td>比较 direct、CoT、self-consistency 和 search。</td><td>预算—成功率与 verifier 误差。</td></tr>
<tr><td>8</td><td>Agent</td><td>加入工具、状态、重试和失败恢复。</td><td>可审计 trajectory 与故障分类。</td></tr>
<tr><td>9</td><td>运行时与评测</td><td>建立 serving、环境、安全与 human override 指标。</td><td>端到端 evaluation harness。</td></tr>
<tr><td>10</td><td>综合项目</td><td>选择 CV、AIGC 或 AI Engineer 场景贯穿 8 层。</td><td>技术报告、复现实验、成本与失败边界。</td></tr>
</tbody></table></div></section>
{''.join(stage_sections)}
<script>
(() => {{
  const stages = {stage_payload};
  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  const inspector = document.getElementById("stage-inspector");
  const concepts = document.getElementById("inspector-concepts");

  function setStage(id, reveal) {{
    const stage = stageById.get(id);
    if (!stage) return;
    inspector.style.setProperty("--stage-color", stage.color);
    document.getElementById("inspector-kicker").textContent = "L" + String(stage.order).padStart(2, "0") + " · " + stage.count + " 个条目";
    document.getElementById("inspector-title").textContent = stage.title;
    document.getElementById("inspector-question").textContent = stage.question;
    document.getElementById("inspector-summary").textContent = stage.summary;
    document.getElementById("inspector-dependencies").textContent = stage.dependencies;
    document.getElementById("inspector-output").textContent = stage.output;
    document.getElementById("inspector-link").href = "#" + stage.id;
    concepts.replaceChildren(...stage.concepts.map((value) => {{
      const chip = document.createElement("span");
      chip.className = "concept-chip";
      chip.textContent = value;
      return chip;
    }}));
    document.querySelectorAll(".stage-node").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.stage === id)));
    document.querySelectorAll(".bar-row").forEach((button) => button.setAttribute("aria-current", String(button.dataset.stageTarget === id)));
    if (reveal) inspector.scrollIntoView({{ behavior: "smooth", block: "center" }});
  }}

  document.querySelectorAll(".stage-node").forEach((button) => button.addEventListener("click", () => setStage(button.dataset.stage, false)));
  document.querySelectorAll(".bar-row").forEach((button) => button.addEventListener("click", () => setStage(button.dataset.stageTarget, true)));
  setStage(stages[0].id, false);
}})();
</script>
"""
    return page("AI / CV / AIGC 统一知识主线", "将十三个来源和全部知识卡合并为一条从研究方法到生产反馈闭环的可执行技术脉络。", body, "path")


def notes_by_url(reading_rows: list[dict[str, str]]) -> dict[str, list[str]]:
    result: dict[str, list[str]] = defaultdict(list)
    for row in reading_rows:
        if row.get("notes") and row["notes"] not in result[row["reading_url"]]:
            result[row["reading_url"]].append(row["notes"])
    return result


def build_index(records: list[dict]) -> str:
    domain_count = len({record["domain"] for record in records})
    paper_count = sum("论文/预印本" in record["kinds"] for record in records)
    annotated_count = sum(bool(record["notes"] and record["categories"]) for record in records)
    body = f"""
<section class="notice info"><strong>离线使用说明：</strong>本页、课程页、论文矩阵和来源综述均为本地 HTML，无外部脚本、字体或图片依赖。当前知识库索引 <strong>{len(records)}</strong> 个唯一 URL，覆盖 <strong>{domain_count}</strong> 个来源域名；<strong>{annotated_count}/{len(records)}</strong> 项已具有技术类别、中文学习定位和阅读优先级，其中 {paper_count} 项标记为论文/预印本。原网页、视频和论文全文仍需要联网访问。</section>
<section>
  <div class="section-head"><h2>从资料到能力的七个模块</h2><p>按“表征 → 模型 → 生成 → 系统 → 评测”而非按网页来源学习。</p></div>
  <div class="grid">
    <article class="item"><p class="kicker">01 · 研究与表示</p><h3>数据、归纳偏置与泛化</h3><p>理解训练分布、监督信号、结构不变性与表征质量如何共同决定泛化。先读 How2AI 的 data/structure，再用 Karpathy 的训练调试流程落地。</p><span class="pill">representation</span><span class="pill">generalization</span></article>
    <article class="item teal"><p class="kicker">02 · 模型底座</p><h3>Transformer 与 Foundation Models</h3><p>把 attention、位置编码、norm、MLP、tokenizer、KV cache、MoE 和 scaling 当作可拆分的工程变量，而不是一个黑盒“LLM”。</p><span class="pill">architecture</span><span class="pill">scaling</span></article>
    <article class="item coral"><p class="kicker">03 · 多模态</p><h3>Alignment、Fusion 与 Transfer</h3><p>区分模态对齐、跨模态交互、信息融合和任务迁移。模型同时看见图文不代表学到了可验证的跨模态因果关系。</p><span class="pill">VLM</span><span class="pill">multimodal</span></article>
    <article class="item gold"><p class="kicker">04 · AIGC</p><h3>Diffusion、Flow 与少步生成</h3><p>用“路径、参数化、条件、求解器、表示空间”五层理解 DDPM、Score-SDE、Flow Matching、DiT、VAE 与 guidance。</p><span class="pill">diffusion</span><span class="pill">flow matching</span></article>
    <article class="item teal"><p class="kicker">05 · 推理与 Agent</p><h3>Search、Tool Use 与验证</h3><p>让模型在状态、工具、预算、验证器和失败恢复中闭环决策。任务成功率必须和调用成本、trace 质量一并记录。</p><span class="pill">reasoning</span><span class="pill">agents</span></article>
    <article class="item coral"><p class="kicker">06 · 后训练与交互</p><h3>反馈分布、实时协作与复现</h3><p>从 LoRA、on-policy distillation、推理确定性到实时交互模型，关注训练时的轨迹是否覆盖部署时真正会出现的状态。</p><span class="pill">post-training</span><span class="pill">systems</span></article>
    <article class="item"><p class="kicker">07 · 评测与治理</p><h3>环境、轨迹、安全与人类监督</h3><p>把静态 benchmark 升级为含隐藏约束、状态转移、权限、副作用和人工接管的评测环境，再把失败轨迹回流训练。</p><span class="pill">evaluation</span><span class="pill">human-in-the-loop</span></article>
  </div>
</section>
<section>
  <div class="section-head"><h2>一条完整技术主线</h2><p>每一个箭头都对应可测试的系统假设。</p></div>
  <div class="flow"><div>数据与任务<br><small>分布、结构、标注</small></div><div>表征学习<br><small>不变性与特征</small></div><div>Transformer<br><small>规模与上下文</small></div><div>多模态<br><small>对齐、融合、迁移</small></div><div>生成模型<br><small>扩散、流、采样</small></div><div>Agent<br><small>搜索、工具、验证</small></div><div>闭环系统<br><small>评测、反馈、治理</small></div></div>
  <p class="notice">工程上最容易被遗漏的是最后一段：更大模型只会改变能力上限；环境覆盖、评测质量、轨迹数据、回归测试和人工接管决定系统是否能持续可用。</p>
</section>
<section>
  <div class="section-head"><h2>知识库入口</h2><p>先读离线内容，再按需打开外部原文。</p></div>
  <ul class="chapter-list">
    <li><a href="knowledge_path.html"><strong>统一知识主线（建议从这里开始）</strong><span>将全部条目合并为 8 层能力堆栈、技术演进、概念边界和 10 周路线。</span></a></li>
    <li><a href="sources.html"><strong>十三个来源的技术综述</strong><span>明确每个课程、博客、代码和视频来源解决的问题、边界与互补关系。</span></a></li>
    <li><a href="how2ai.html"><strong>MIT How2AI 课程地图</strong><span>按讲次保留子主题、slides/video 与全部课程 readings。</span></a></li>
    <li><a href="stanford_cs25.html"><strong>Stanford CS25 · Transformers United V6</strong><span>9 个 2026 前沿讲次、精选录播、论文和面向工程师的 4 周研讨路线。</span></a></li>
    <li><a href="stanford_cs336.html"><strong>Stanford CS336 · Language Modeling from Scratch</strong><span>19 讲、5 个实现作业、17 份本地课件和 18 场可搜索字幕录播，串起语言模型完整生命周期。</span></a></li>
    <li><a href="karpathy.html"><strong>Karpathy GitHub 学习地图</strong><span>63 个公开仓库快照，从 micrograd、nanochat 和 C/CUDA 推进到 autoresearch。</span></a></li>
    <li><a href="ai_toolkit.html"><strong>Ostris AI Toolkit 训练地图</strong><span>从数据与 buckets、LoRA/LoKr、量化和 flow matching 推进到采样评测、恢复与 UI/CLI 运行。</span></a></li>
    <li><a href="kaggle_genai.html"><strong>Kaggle 5-Day Gen AI Intensive</strong><span>5 场直播串联 Prompt、Embedding/RAG、Agent、领域适配与 GenAI MLOps，含中文综述、时间轴、关键帧和完整英文自动逐字稿。</span></a></li>
    <li><a href="agent_architecture.html"><strong>AI Agent 架构趋势及演进</strong><span>从 workflow/agentic 和 context engineering 推进到 MCP/AI Gateway、状态恢复、OpenTelemetry 与持续评测，含本地 720p 视频、幻灯片和 Whisper 中文稿。</span></a></li>
    <li><a href="how2ai_full_report.html"><strong>How2AI 完整中文报告</strong><span>原有课程报告的离线副本：知识地图、技术主线和学习路径。</span></a></li>
    <li><a href="diffusion_full_guide.html"><strong>Diffusion 专题报告</strong><span>DDPM、Score-SDE、Flow Matching、VAE、DiT、Guidance 与实验。</span></a></li>
    <li><a href="reasoning_full_guide.html"><strong>LLM 推理与 Agent 指南</strong><span>CS 159、Lil’Log、Transformer Taxonomy、Thinking Machines 与 Labelbox。</span></a></li>
    <li><a href="papers.html"><strong>论文与资料矩阵</strong><span>99 条课程阅读记录，按主题、优先级和本地中文注释聚合。</span></a></li>
    <li><a href="catalog.html"><strong>全部链接索引</strong><span>{len(records)} 个唯一链接的来源、类别、阅读状态与原始 URL。</span></a></li>
  </ul>
</section>
<section>
  <div class="section-head"><h2>8 周离线自学节奏</h2><p>每周要求有可检查产出，而非只增加阅读时长。</p></div>
  <div class="table-wrap"><table><thead><tr><th>周</th><th>主题</th><th>离线主读</th><th>必须产出</th></tr></thead><tbody>
  <tr><td>1</td><td>数据、表示与研究方法</td><td>How2AI Week 1–2；论文矩阵中的表征/调试资料。</td><td>数据—目标—指标三列表和一个可复现实验模板。</td></tr>
  <tr><td>2</td><td>Transformer 配方</td><td>Taxonomy 与 Lil’Log 的 attention/Transformer 条目。</td><td>模型卡：attention、位置、norm、MLP、KV cache、tokenizer。</td></tr>
  <tr><td>3</td><td>多模态</td><td>How2AI Week 5–7。</td><td>比较 alignment / fusion / transfer 的实验设计。</td></tr>
  <tr><td>4</td><td>扩散与流</td><td>Diffusion 专题报告；AI Toolkit 的数据与 config 解剖。</td><td>DDPM/Flow Matching toy，或固定 prompt/seed 的最小 LoRA 基线。</td></tr>
  <tr><td>5</td><td>Foundation / Multimodal LLM</td><td>How2AI Week 9–11；Taxonomy。</td><td>为一个任务写清预训练、适配、量化和评测方案。</td></tr>
  <tr><td>6</td><td>推理、搜索和工具</td><td>CS 159 模块与 LLM 推理指南。</td><td>带工具 schema、状态与 verifier 的最小 Agent。</td></tr>
  <tr><td>7</td><td>后训练与运行时</td><td>Thinking Machines 条目；AI Toolkit 的量化、cache、恢复与 UI/CLI 边界。</td><td>FullFT/LoRA、显存优化或不同 sampler 的公平对照实验。</td></tr>
  <tr><td>8</td><td>评测、安全与人机协作</td><td>Labelbox 条目与 How2AI HAI。</td><td>含隐藏约束、失败路径和人工接管的 evaluation harness。</td></tr>
  </tbody></table></div>
</section>
<section class="notice"><strong>使用边界：</strong>“全文离线学习”在这里指课程结构、技术解释、学习任务、阅读定位与来源元数据都可离线查看。知识库不复制论文、视频、Google Drive/Colab 或商业博客的全文；它们仍以原始链接保留，避免版权、访问权限与版本漂移问题。</section>
"""
    return page("AI / CV / AIGC 离线学习知识库", "将 How2AI、Diffusion、LLM Reasoning、Transformer、训练系统与评测闭环组织为可断网复习的本地课程库。", body, "index")


MODULES = [
    ("AI research foundations", "从研究问题、读写论文、实验设计到训练调试，建立可复现的研究工程习惯。", "把假设、数据版本、指标、基线、消融和失败案例写入同一实验记录。"),
    ("Data, representation, and generalization", "学习数据模态、收集策略、训练目标、结构信息和泛化之间的关系。", "数据分布与归纳偏置优先于无差别扩大模型。"),
    ("Model architectures", "按序列、空间、集合、图和对称性选择模型结构。", "把结构假设转换为可验证的归纳偏置，而不是只追逐参数规模。"),
    ("Multimodal learning", "区分 representation、alignment、fusion、translation 与协同学习。", "分别评估单模态捷径、跨模态交互和部署分布外鲁棒性。"),
    ("Large foundation models", "连接预训练数据、自监督、指令微调、对齐、PEFT、量化和 MoE。", "模型适配成本、数据质量与 serving 约束需要共同设计。"),
    ("Generative models", "把 Diffusion、Flow Matching、控制生成和多模态媒体生成看成路径建模与求解问题。", "训练参数化、VAE、guidance 和 sampler 是四个独立调优接口。"),
    ("Interactive agents and Human-AI interaction", "将 RL、多步推理、工具调用、反馈和可靠性放进人与系统的交互闭环。", "生产 Agent 必须可中断、可审计、可回退，并有任务外的安全指标。"),
]


def lecture_role(title: str) -> str:
    lowered = title.lower()
    if "research" in lowered or "practical" in lowered or "introduction" in lowered:
        return "建立研究流程、数据与工具链底座。"
    if "data" in lowered or "generalization" in lowered or "architecture" in lowered:
        return "把数据结构、归纳偏置和模型选择连接起来。"
    if "multimodal" in lowered:
        return "从对齐进入交互、融合和跨模态迁移。"
    if "large models" in lowered or "language models" in lowered:
        return "连接预训练、适配、原生多模态与规模化工程。"
    if "generative" in lowered:
        return "聚焦生成路径、条件控制和采样效率。"
    if "interaction" in lowered or "human" in lowered:
        return "把静态模型转为具备反馈、工具与可靠性约束的交互系统。"
    if "project" in lowered or "no class" in lowered:
        return "为项目设计、汇报或课程节奏预留的节点。"
    return "在整体路线中承担概念连接和论文讨论作用。"


def build_how2ai(schedule: list[dict], reading_rows: list[dict[str, str]]) -> str:
    notes = notes_by_url(reading_rows)
    week_groups: dict[str, list[dict]] = defaultdict(list)
    for lecture in schedule:
        week_groups[lecture.get("week", "未标注周")].append(lecture)
    module_html = "".join(
        f'<article class="item {"teal" if i % 3 == 1 else "coral" if i % 3 == 2 else ""}"><p class="kicker">模块 {i + 1}</p><h3>{esc(name)}</h3><p>{esc(question)}</p><p class="small"><strong>工程价值：</strong>{esc(value)}</p></article>'
        for i, (name, question, value) in enumerate(MODULES)
    )
    schedule_html = []
    for week in sorted(week_groups, key=lambda value: int(re.search(r"\d+", value).group()) if re.search(r"\d+", value) else 99):
        blocks = []
        for lecture in week_groups[week]:
            topic = lecture.get("title") or "未命名讲次"
            subtopics = lecture.get("subtopics") or []
            resources = []
            if lecture.get("slides_url"):
                resources.append(link(lecture["slides_url"], "slides"))
            if lecture.get("video_url"):
                resources.append(link(lecture["video_url"], "video"))
            resource_text = " · ".join(resources) if resources else "slides/video：未公开"
            readings = []
            for item in lecture.get("readings", []):
                title = item.get("title", "阅读资料")
                url = item.get("url", "")
                item_notes = notes.get(url, [])
                note_text = f'<div class="reading-note">{esc(item_notes[0])}</div>' if item_notes else ""
                readings.append(f"<li>{link(url, title)}{note_text}</li>")
            reading_html = f'<ul class="reading-list">{"".join(readings)}</ul>' if readings else '<p class="small">本讲未列出 readings。</p>'
            subtopic_html = "".join(f"<li>{esc(value)}</li>" for value in subtopics)
            blocks.append(
                f'''<article class="lecture"><h3>{esc(lecture.get("date", "日期未标注"))} · {esc(topic)}</h3>
                <p class="lecture-meta">{esc(lecture_role(topic))} · {resource_text}</p>
                {f"<ul>{subtopic_html}</ul>" if subtopic_html else ""}
                <details><summary>查看本讲 readings（{len(readings)} 项）</summary><div>{reading_html}</div></details></article>'''
            )
        schedule_html.append(f'<section id="{slugify(week)}"><div class="section-head"><h2>{esc(week)}</h2><p>{len(week_groups[week])} 个课程节点</p></div>{"".join(blocks)}</section>')
    body = f"""
<div class="toc"><strong>本页：</strong><a href="#map">技术模块</a><a href="#route">学习主线</a><a href="#schedule">完整讲次</a><a href="how2ai_full_report.html">完整报告</a></div>
<section id="map"><div class="section-head"><h2>课程定位与技术模块</h2><p>MAS.S60 How2AI Spring 2025</p></div><p>课程从 AI research、data/representation 和 model architectures 出发，经过多模态学习、foundation models、generative models，最终进入 interactive agents 与 Human-AI interaction。它适合需要把 AI/CV/AIGC 课题放入统一技术地图的工程师或研究者。</p><div class="grid">{module_html}</div></section>
<section id="route"><div class="section-head"><h2>推荐的离线阅读顺序</h2><p>先建立判断框架，再进入具体模型。</p></div><ol><li><strong>数据与表征：</strong>明确什么是数据结构、什么是可学习的归纳偏置、什么才算泛化。</li><li><strong>结构与规模：</strong>在 ViT、Transformer、sets/graphs 之间理解结构选择，并以 Chinchilla/LoRA/MoE 连接到 foundation model 工程。</li><li><strong>多模态：</strong>按 alignment → interaction/fusion → transfer 学习，持续做“是否存在单模态捷径”的反证。</li><li><strong>生成：</strong>从 DDPM/Score-SDE 到 Flow Matching，按训练目标、表示空间和 sampler 分开实验。</li><li><strong>交互：</strong>最后做多步 reasoning、feedback、safety 与人机协作，建立端到端评测闭环。</li></ol><p class="notice info">报告与数据副本：<a href="how2ai_full_report.html">完整技术报告</a>、<a href="data/how2ai_schedule.json">schedule.json</a>、<a href="data/reading_matrix.csv">reading_matrix.csv</a>。这些本地文件无需联网即可打开。</p></section>
<section id="schedule"><div class="section-head"><h2>按周/按讲次资料</h2><p>保留 date、week、topic、subtopics、slides、video 与 readings。</p></div>{"".join(schedule_html)}</section>
"""
    return page("MIT MAS.S60 How2AI 课程地图", "以课程顺序串起 AI 研究方法、表征、结构、多模态、基础模型、生成式模型和人机交互。", body, "how2ai")


def build_cs25() -> str:
    lecture_blocks = []
    for lecture in CS25_LECTURES:
        resources = []
        if lecture.get("slides_url"):
            resources.append(link(lecture["slides_url"], "slides"))
        if lecture.get("video_url"):
            resources.append(link(lecture["video_url"], "video"))
        resources_text = " · ".join(resources) if resources else "slides/video：当前课程页未公开"
        reading_items = "".join(
            f'<li>{link(item["url"], item["title"])}<div class="reading-note">{esc(item["note"])}</div></li>'
            for item in lecture.get("readings", [])
        )
        readings = (
            f'<details><summary>本讲论文（{len(lecture["readings"])} 篇）</summary><div><ul class="reading-list">{reading_items}</ul></div></details>'
            if lecture.get("readings")
            else ""
        )
        lecture_blocks.append(
            f'''<article class="lecture"><h3>{esc(lecture["date"])} · {esc(lecture["title"])}</h3>
            <p class="lecture-meta">Speaker: {esc(lecture["speaker"])} · {esc(lecture["category"])} · {resources_text}</p>
            <p>{esc(lecture["summary"])}</p>
            <p class="small"><strong>工程学习价值：</strong>{esc(lecture["engineering_value"])}</p>{readings}</article>'''
        )
    recording_rows = "".join(
        f'<tr><td>{link(item["url"], item["title"])}</td><td>{esc(item["speaker"])}</td><td>{esc(item["category"])}</td><td>{esc(item["note"])}</td></tr>'
        for item in CS25_RECORDINGS
    )
    body = f"""
<div class="toc"><strong>本页：</strong><a href="#position">课程定位</a><a href="#map">知识聚类</a><a href="#schedule">V6 讲次</a><a href="#recordings">精选录播</a><a href="#path">4 周路线</a></div>
<section id="position"><div class="section-head"><h2>课程定位</h2><p>Stanford CS25 · Transformers United V6 · Spring 2026</p></div><p>CS25 是一门 1-unit、S/NC 的公开前沿研讨课，课程学习活动以每周讲座为主，不以作业、考试或项目建立能力闭环。它最适合放在 How2AI、Transformer Taxonomy 与 LLM 推理指南之后，用于更新研究判断、架构视野和生产问题意识。</p><div class="grid two"><article class="item"><h3>适合谁</h3><p>已掌握 attention、预训练与基本实验方法，希望理解 2026 年 Transformer 研究向世界模型、SSM、原生多模态和规模化系统演进的 AI/CV/AIGC 工程师。</p></article><article class="item coral"><h3>怎样使用</h3><p>每场讲座只提炼一个可检验假设，再连接一篇论文或一个工程实验。讲者或机构报告的性能数字只视为特定设置下的证据，不直接泛化。</p></article></div><p class="notice info">原始入口：{link("https://web.stanford.edu/class/cs25/", "课程主页")} · {link("https://web.stanford.edu/class/cs25/logistics/", "Logistics")} · {link("https://web.stanford.edu/class/cs25/recordings/", "Recordings")} · <a href="data/stanford_cs25_schedule.json">本地结构化 schedule</a></p></section>
<section id="map"><div class="section-head"><h2>知识聚类</h2><p>CS25 的价值是连接模型、训练、应用和系统四个尺度。</p></div><div class="grid">
<article class="item"><p class="kicker">表示与世界模型</p><h3>JEPA、结构偏置与潜空间预测</h3><p>从重建转向预测，并检验对象关系、抽象、规划和控制是否因潜空间目标而改善。</p></article>
<article class="item teal"><p class="kicker">架构</p><h3>Transformer、SSM 与 Tokenization</h3><p>架构复杂度必须和数据分辨率、token 数、硬件吞吐及应用任务共同比较。</p></article>
<article class="item coral"><p class="kicker">训练</p><h3>5D Parallelism、MoE 与 Pretraining</h3><p>把数据顺序、reasoning-rich data、强化目标、通信和稳定性视作同一训练系统。</p></article>
<article class="item gold"><p class="kicker">泛化</p><h3>参数知识、上下文与检索</h3><p>区分训练进权重、放入上下文和从外部库检索产生的泛化模式与成本。</p></article>
<article class="item teal"><p class="kicker">多模态</p><h3>共享推理与模态专家化</h3><p>研究语言模型原则如何迁移到视觉、音频与时间信息，以及何时需要 modality-aware computation。</p></article>
<article class="item"><p class="kicker">部署与协作</p><h3>Science Agents、Human-AI 与 Serving</h3><p>用专家复核、延迟、吞吐、故障恢复和可追溯证据衡量真实系统，而不只看 benchmark。</p></article>
</div></section>
<section id="schedule"><div class="section-head"><h2>V6 完整讲次</h2><p>{len(CS25_LECTURES)} 场公开讲座</p></div><p class="notice">链接核对：课程源页当前为 2026-04-23 与 2026-04-30 两讲提供的 slides URL 指向同一个 Google Drive 文件 ID。本地保留源页链接，但尚不能确认它们是否本应为同一课件。</p>{"".join(lecture_blocks)}</section>
<section id="recordings"><div class="section-head"><h2>精选录播</h2><p>当前 V6 与历届课程的公开入口</p></div><p><a href="https://www.youtube.com/playlist?list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM" target="_blank" rel="noreferrer">All Recordings playlist</a> 包含更多历届讲座；下表保留课程录播页当前列出的精选内容。</p><div class="table-wrap"><table><thead><tr><th>讲座</th><th>讲者</th><th>类别</th><th>离线学习定位</th></tr></thead><tbody>{recording_rows}</tbody></table></div></section>
<section id="path"><div class="section-head"><h2>4 周研讨式学习路线</h2><p>每周两场讲座，一场用于补机制，一场用于做实验。</p></div><div class="table-wrap"><table><thead><tr><th>周</th><th>主线</th><th>讲次</th><th>必须产出</th></tr></thead><tbody>
<tr><td>1</td><td>表示与架构</td><td>Overview、JEPA、SSM vs Transformers</td><td>一张“目标函数 × 结构偏置 × tokenization × 硬件”的架构比较表。</td></tr>
<tr><td>2</td><td>训练与泛化</td><td>Ultra-Scale、Future of Pretraining、Parameters vs Context</td><td>设计 parameter / context / retrieval 三种知识注入实验，并写清训练与 serving 成本。</td></tr>
<tr><td>3</td><td>Agent 与多模态</td><td>Science & Medicine Agents、Native Multimodal Intelligence</td><td>一个含模态输入、工具、专家复核和证据链的协作式 Agent 评测方案。</td></tr>
<tr><td>4</td><td>生产推理</td><td>Serving Transformers，加读 inference optimization 与 determinism</td><td>记录 p50/p95、tokens/s、KV cache、batch、失败率和单位请求成本的服务基线。</td></tr>
</tbody></table></div></section>
<section class="notice"><strong>课程边界：</strong>CS25 的公开页面是讲座描述与资料入口，不等于每个主题的完整教材。离线摘要用于定位问题、连接现有知识模块和设计实验；论文结论、讲者论证与性能数字仍应回到原始论文、slides 或录播确认。</section>
"""
    return page("Stanford CS25: Transformers United V6", "把 2026 年 Transformer 前沿讲座转成可离线复习的研究地图、工程问题和 4 周学习路线。", body, "cs25")


def build_cs336(course: dict) -> str:
    coverage = course["coverage"]
    module_flow = "".join(
        f'<div><strong>{esc(module["title"].split(". ", 1)[-1])}</strong><br><small>L{"/".join(str(number) for number in module["lectures"])}</small></div>'
        for module in course["modules"]
    )
    module_cards = "".join(
        f'''<article class="item"><p class="kicker">{esc(module["title"])}</p><h3>{esc(module["question"])}</h3><p><strong>验收产物：</strong>{esc(module["output"])}</p><p class="small">讲次：{", ".join(f"L{number}" for number in module["lectures"])}</p></article>'''
        for module in course["modules"]
    )
    lecture_rows = []
    for lecture in course["lectures"]:
        resources = []
        resources.extend(link(item["url"], item["title"]) for item in lecture.get("material_links", []))
        if lecture.get("local_material_path"):
            suffix = Path(lecture["local_material_path"]).suffix.upper().lstrip(".")
            resources.append(link("../" + lecture["local_material_path"], f"本地 {suffix}", False))
        if lecture.get("local_interactive_url"):
            resources.append(link("../" + lecture["local_interactive_url"], "本地交互讲义", False))
        video = lecture.get("video")
        if video:
            resources.append(link(video["url"], "录播"))
            resources.append(link(f'cs336_transcripts.html#cs336-transcript-{lecture["number"]}', "清洗字幕", False))
            if video.get("subtitle_local_path"):
                resources.append(link("../" + video["subtitle_local_path"], "原始 VTT", False))
        lecture_rows.append(
            f'''<tr><td><strong>L{lecture["number"]}</strong><br><span class="small">{esc(lecture["date"])}{(" · " + esc(lecture["speaker"])) if lecture.get("speaker") else ""}</span></td><td><strong>{esc(lecture["title"])}</strong><br><span class="pill">{esc(lecture["category"])}</span><br><span class="small">{esc(" · ".join(lecture["subtopics"])) if lecture["subtopics"] else "课程页未说明子主题"}</span></td><td>{esc(lecture["key_question"])}<br><span class="reading-note"><strong>主线作用：</strong>{esc(lecture["role"])}</span></td><td>{" · ".join(resources) if resources else '<span class="small">暂无公开材料</span>'}</td></tr>'''
        )

    assignment_cards = []
    for assignment in course["assignments"]:
        deliverables = "".join(f"<li>{esc(item)}</li>" for item in assignment["deliverables"])
        local_repo_readme = str(Path(assignment["local_handout"]).parent / "README.md").replace("\\", "/")
        local_links = [
            link(assignment["repo_url"], "官方仓库"),
            link("../" + assignment["local_handout"], "本地 handout", False),
            link("../" + local_repo_readme, "本地 README", False),
        ]
        if assignment.get("local_supplement"):
            local_links.append(link("../" + assignment["local_supplement"], "本地 SFT/DPO 安全补充", False))
        assignment_cards.append(
            f'''<article class="item {"teal" if assignment["number"] % 3 == 2 else "coral" if assignment["number"] % 3 == 0 else ""}"><p class="kicker">Assignment {assignment["number"]} · {esc(assignment["release_date"])} → {esc(assignment["due_date"])}</p><h3>{esc(assignment["title_zh"])}</h3><ul>{deliverables}</ul><p><strong>工程价值：</strong>{esc(assignment["engineering_value"])}</p><p><strong>验收：</strong>{esc(assignment["acceptance"])}</p><p class="small">{esc(assignment["resource_note"])}<br>{" · ".join(local_links)}</p></article>'''
        )

    study_rows = "".join(
        f'''<tr><td>{item["week"]}</td><td><strong>{esc(item["theme"])}</strong></td><td>{", ".join(f"L{number}" for number in item["lectures"])}</td><td>{"A" + str(item["assignment"]) if item.get("assignment") else "综合实验"}</td><td>{esc(item["output"])}</td></tr>'''
        for item in course["study_plan"]
    )
    judgments = "".join(
        f'<article class="item"><p class="kicker">判断 {index:02d}</p><p>{esc(item)}</p></article>'
        for index, item in enumerate(course["engineering_judgments"], start=1)
    )
    repo_rows = []
    for repo in course["repositories"]:
        local_entry = "index.html" if repo["name"] == "lectures" else "README.md"
        repo_rows.append(
            f'''<tr><td>{link(repo["url"], repo["name"])}</td><td><code>{esc(repo["commit"][:12])}</code></td><td>{repo["file_count"]}</td><td>{repo["size_bytes"] / (1024 * 1024):.1f} MB</td><td>{link("../" + repo["local_path"] + "/" + local_entry, "离线入口", False)}</td></tr>'''
        )
    limitations = "".join(f"<li>{esc(item)}</li>" for item in course["limitations"])
    body = f"""
<div class="toc path-toc"><strong>本页：</strong><a href="#spine">技术主线</a><a href="#modules">模块</a><a href="#lectures">19 讲</a><a href="#assignments">5 个作业</a><a href="#plan">8 周路线</a><a href="#judgments">工程判断</a><a href="#archive">离线资料</a><a href="cs336_transcripts.html">完整字幕</a></div>
<section class="notice info"><strong>资料状态：</strong>课程网页 schedule 由 DOM 自动解析；17 份官方 lecture 文件、5 个作业仓库、18 场公开录播与英文自动字幕已落盘。课程页列出 19 次课，但当前 playlist 缺少 Daniel Selsam 嘉宾讲座；第 18/19 讲的具体技术主题不从讲者身份臆测。</section>
<div class="metric-strip" aria-label="CS336 离线资料概览"><div class="metric"><strong>{coverage["schedule_lecture_count"]}</strong><span>课程讲次</span></div><div class="metric"><strong>{coverage["assignment_count"]}</strong><span>实现作业</span></div><div class="metric"><strong>{coverage["captioned_video_count"]}</strong><span>含字幕录播</span></div><div class="metric"><strong>{coverage["transcript_word_count"]:,}</strong><span>清洗字幕词数</span></div></div>
<section id="spine"><div class="section-head"><h2>Language Model 全生命周期</h2><p>从正确性、性能、规模到数据与行为塑形</p></div><div class="flow six">{module_flow}</div><p class="notice"><strong>最重要的课程判断：</strong>模型不是单独的网络结构。tokenizer 决定输入单位，硬件/并行决定可训练规模，scaling law 决定预算分配，数据决定学习分布，评测决定证据质量，post-training 决定部署行为。任何优化都必须回到端到端质量、成本与失败模式。</p></section>
<section id="modules"><div class="section-head"><h2>六个技术模块</h2><p>每个模块都有可验收产物</p></div><div class="grid two">{module_cards}</div></section>
<section id="lectures"><div class="section-head"><h2>19 讲技术地图</h2><p>关键问题、主线作用与官方/本地资料</p></div><div class="table-wrap"><table><thead><tr><th>讲次</th><th>主题与子主题</th><th>关键问题与作用</th><th>资料</th></tr></thead><tbody>{''.join(lecture_rows)}</tbody></table></div></section>
<section id="assignments"><div class="section-head"><h2>五个作业就是能力主线</h2><p>完成代码不等于完成学习，必须保留验收证据</p></div><div class="grid two">{''.join(assignment_cards)}</div><p class="notice info"><strong>Honor code：</strong>官方 handout 明确禁止用 coding agent 或 AI autocomplete 实现作业。这里的中文地图用于理解、复盘和设计自学实验；若按课程身份提交，应严格遵守课程政策。</p></section>
<section id="plan"><div class="section-head"><h2>8 周工程化自学路线</h2><p>时间不足时优先 A1 → A2 → A4；A3/A5 可做缩小版</p></div><div class="table-wrap"><table><thead><tr><th>周</th><th>主题</th><th>讲次</th><th>作业</th><th>必须产出</th></tr></thead><tbody>{study_rows}</tbody></table></div></section>
<section id="judgments"><div class="section-head"><h2>面向 Production Model Design 的判断</h2><p>用于设计实验和审查结论</p></div><div class="grid two">{judgments}</div></section>
<section id="archive"><div class="section-head"><h2>官方源码与离线快照</h2><p>commit 用于保证课程更新后仍可追溯</p></div><div class="table-wrap"><table><thead><tr><th>仓库</th><th>Commit</th><th>文件</th><th>体积</th><th>本地</th></tr></thead><tbody>{''.join(repo_rows)}</tbody></table></div><p class="small">{link(course["course"]["url"], "官方课程页")} · {link(course["playlist"]["url"], "YouTube playlist")} · {link("../" + course["course"]["raw_html_local_path"], "课程页 HTML 快照", False)} · <a href="data/stanford_cs336.json">结构化课程数据</a> · <a href="cs336_transcripts.html">可搜索清洗字幕</a></p></section>
<section class="notice"><strong>证据边界：</strong><ul>{limitations}</ul></section>
"""
    return page(
        "Stanford CS336 · Language Modeling from Scratch",
        "从 tokenizer 和 Transformer 正确实现，推进到 GPU kernel、分布式训练、规模律、数据工程、SFT/RLVR 与多模态对齐。",
        body,
        "cs336",
    )


def build_cs336_transcripts(course: dict) -> str:
    lectures = [lecture for lecture in course["lectures"] if lecture.get("video")]
    options = "".join(
        f'<option value="{lecture["number"]}">L{lecture["number"]} · {esc(lecture["title"])}</option>'
        for lecture in lectures
    )
    sections = []
    total_blocks = 0
    for lecture in lectures:
        video = lecture["video"]
        blocks = []
        for block in video["transcript_blocks"]:
            total_blocks += 1
            timestamp_url = video["url"] + "&t=" + str(block["start"]) + "s"
            blocks.append(
                f'<div class="transcript-block" data-lecture="{lecture["number"]}"><div class="transcript-time">{link(timestamp_url, format_seconds(block["start"]))}</div><p class="transcript-text">{esc(block["text"])}</p></div>'
            )
        raw_vtt = (
            link("../" + video["subtitle_local_path"], "原始 VTT", False)
            if video.get("subtitle_local_path")
            else "无本地字幕"
        )
        sections.append(
            f'''<section class="transcript-day" id="cs336-transcript-{lecture["number"]}" data-lecture="{lecture["number"]}"><div class="section-head"><h2>L{lecture["number"]} · {esc(lecture["title"])}</h2><p>{video["transcript_word_count"]:,} words · {len(video["transcript_blocks"])} minute blocks</p></div><p><strong>学习定位：</strong>{esc(lecture["key_question"])}</p><p class="small">{link(video["url"], "YouTube 录播")} · {raw_vtt} · <a href="transcripts/stanford_cs336/lecture_{lecture["number"]:02d}.md">Markdown 清洗稿</a></p>{''.join(blocks)}</section>'''
        )
    body = f"""
<div class="toc"><strong>本页：</strong><a href="stanford_cs336.html">返回课程地图</a>{''.join(f'<a href="#cs336-transcript-{lecture["number"]}">L{lecture["number"]}</a>' for lecture in lectures)}</div>
<section class="notice info"><strong>文字稿状态：</strong>来源为 YouTube English (Original) automatic captions。已消除逐词滚动字幕重复并按分钟合并，共 {course["coverage"]["transcript_word_count"]:,} 词；未重写讲者原意，也不是人工校对稿。人名、技术名词、数字、公式和代码必须回到时间戳或本地课件核验。</section>
<section><div class="section-head"><h2>搜索 24 小时课程录播</h2><p>按关键词与讲次过滤</p></div><div class="filter-grid"><input class="filter" id="cs336-transcript-filter" type="search" placeholder="搜索 tokenizer、FlashAttention、FSDP、scaling、RLVR 等"><select class="filter" id="cs336-transcript-lecture"><option value="">全部讲次</option>{options}</select></div><p class="small" id="cs336-transcript-count">显示 {total_blocks} 个分钟段落。</p></section>
{''.join(sections)}
<script>
const cs336Filter = document.getElementById('cs336-transcript-filter');
const cs336Lecture = document.getElementById('cs336-transcript-lecture');
const cs336Blocks = [...document.querySelectorAll('.transcript-block')];
const cs336Sections = [...document.querySelectorAll('.transcript-day')];
const cs336Count = document.getElementById('cs336-transcript-count');
function filterCs336Transcript() {{
  const query = cs336Filter.value.trim().toLowerCase();
  const lecture = cs336Lecture.value;
  let visible = 0;
  cs336Blocks.forEach((block) => {{
    const match = (!lecture || block.dataset.lecture === lecture) && block.textContent.toLowerCase().includes(query);
    block.hidden = !match;
    if (match) visible += 1;
  }});
  cs336Sections.forEach((section) => {{
    section.hidden = ![...section.querySelectorAll('.transcript-block')].some((block) => !block.hidden);
  }});
  cs336Count.textContent = `显示 ${{visible}} 个分钟段落。`;
}}
cs336Filter.addEventListener('input', filterCs336Transcript);
cs336Lecture.addEventListener('change', filterCs336Transcript);
</script>
"""
    return page(
        "Stanford CS336 · 清洗英文字幕",
        "18 场公开录播的英文自动字幕去重稿，保留分钟级时间戳、讲次筛选与关键词检索。",
        body,
        "cs336",
    )


def build_cs336_transcript_markdown(lecture: dict) -> str:
    video = lecture["video"]
    lines = [
        f'# CS336 Lecture {lecture["number"]}: {lecture["title"]}',
        "",
        f'- Date: {lecture["date"]}',
        f'- Video: {video["url"]}',
        f'- Duration: {video.get("duration_string") or format_seconds(video["duration_seconds"])}',
        '- Caption source: YouTube English (Original) automatic captions',
        f'- Cleaned transcript words: {video["transcript_word_count"]:,}',
        "",
        "## 中文学习定位",
        "",
        lecture["key_question"],
        "",
        lecture["role"],
        "",
        "## Cleaned English Transcript",
        "",
        "> Automatic captions were deduplicated and grouped by minute. Verify names, numbers, formulas, code, and technical claims against the linked video or lecture material.",
        "",
    ]
    for block in video["transcript_blocks"]:
        timestamp_url = video["url"] + "&t=" + str(block["start"]) + "s"
        lines.extend([f'### [{format_seconds(block["start"])}]({timestamp_url})', "", block["text"], ""])
    return "\n".join(lines)


def build_karpathy(repos: list[dict]) -> str:
    normalized = normalized_karpathy_repos(repos)
    owned = [repo for repo in normalized if not repo["is_fork"]]
    fork_count = len(normalized) - len(owned)
    active_count = sum(not repo["archived"] and str(repo.get("pushed_at") or "")[:4] >= "2025" for repo in owned)
    track_counts = Counter(repo["track"] for repo in owned)
    colors = ["#256f5b", "#00828a", "#3c6e9e", "#7662a2", "#a96600", "#bd4d31", "#aa3658", "#4e5f6b"]
    max_track = max(track_counts.values())
    track_bars = "".join(
        f'<div class="static-bar-row"><span class="static-bar-name">{esc(track)}</span><span class="static-bar-track"><span class="static-bar-fill" style="--bar-width:{count / max_track * 100:.1f}%;--bar-color:{colors[index % len(colors)]}"></span></span><span class="static-bar-value">{count}</span></div>'
        for index, (track, count) in enumerate(track_counts.most_common())
    )
    core_order = [
        "micrograd", "nn-zero-to-hero", "makemore", "minbpe", "minGPT", "build-nanogpt",
        "nanoGPT", "nanochat", "llama2.c", "llm.c", "llm-council", "autoresearch",
    ]
    by_name = {repo["name"]: repo for repo in normalized}
    core_rows = []
    for name in core_order:
        repo = by_name.get(name)
        if not repo:
            continue
        core = KARPATHY_CORE_REPOS[name]
        status_class = "caution" if any(word in core["status"] for word in ("弃用", "原型")) else "current" if any(word in core["status"] for word in ("当前", "主线", "课程")) else ""
        core_rows.append(
            f'''<tr><td>{link(repo["url"], name)}<br><span class="repo-status {status_class}">{esc(core["status"])}</span></td><td>{esc(core["track"])}</td><td>{esc(core["note"])}</td><td>{esc(core["output"])}</td></tr>'''
        )
    track_options = "".join(
        f'<option value="{esc(track)}">{esc(track)}（{count}）</option>'
        for track, count in sorted(track_counts.items())
    )
    repo_rows = []
    for repo in normalized:
        flags = []
        if repo["is_fork"]:
            flags.append("fork")
        if repo["archived"]:
            flags.append("archived")
        flag_text = " / ".join(flags) or repo["status"]
        status_class = "caution" if flags or "弃用" in repo["status"] else "current" if "当前" in repo["status"] else ""
        search = " ".join(
            [repo["name"], repo["description"], repo["track"], repo["language"], repo["notes"], flag_text]
        ).lower()
        repo_rows.append(
            f'''<tr data-search="{esc(search)}" data-track="{esc(repo["track"])}" data-owned="{str(not repo["is_fork"]).lower()}"><td>{link(repo["url"], repo["name"])}<br><span class="repo-status {status_class}">{esc(flag_text)}</span></td><td>{esc(repo["track"])}<br><span class="small">{esc(repo["language"])} · ★ {repo["stars"]:,}</span></td><td><span class="pill">{priority_label(repo["priority"])}</span><br><span class="small">最后推送 {esc(str(repo.get("pushed_at") or "未标注")[:10])}</span></td><td>{esc(repo["notes"])}</td></tr>'''
        )
    timeline_html = "".join(
        [
            '<article class="timeline-item" style="--timeline-color:#00828a"><span class="timeline-marker" aria-hidden="true"></span><div class="timeline-period">2014–2016</div><div class="timeline-question">让深度学习机制变得可运行、可观察</div><div class="timeline-detail">convnetjs、char-rnn、neuraltalk/neuraltalk2 把浏览器 CNN、字符级序列模型和图像描述组织为可实验代码。<span class="timeline-target">能力重点：CV、序列建模、多模态原型。</span></div></article>',
            '<article class="timeline-item" style="--timeline-color:#3c6e9e"><span class="timeline-marker" aria-hidden="true"></span><div class="timeline-period">2019–2021</div><div class="timeline-question">从框架使用回到计算图、最小 GPT 与研究工具</div><div class="timeline-detail">micrograd 和 minGPT 用最小实现解释反向传播与 Transformer；arxiv-sanity 系列把研究发现流程也变成工程对象。<span class="timeline-target">能力重点：机制理解、可读 baseline、研究工作流。</span></div></article>',
            '<article class="timeline-item" style="--timeline-color:#a96600"><span class="timeline-marker" aria-hidden="true"></span><div class="timeline-period">2022–2024</div><div class="timeline-question">完整复现语言模型训练与推理栈</div><div class="timeline-detail">Zero to Hero、makemore、nanoGPT、build-nanogpt、minbpe、llama2.c 与 llm.c 连接数据、tokenizer、训练、评测、C 推理和 CUDA 优化。<span class="timeline-target">能力重点：端到端复现与系统拆解。</span></div></article>',
            '<article class="timeline-item" style="--timeline-color:#aa3658"><span class="timeline-marker" aria-hidden="true"></span><div class="timeline-period">2025–2026</div><div class="timeline-question">从模型代码走向完整产品与自动研究闭环</div><div class="timeline-detail">nanochat 覆盖 LLM 全生命周期；llm-council、reader3、rendergit 探索 LLM 工作流；autoresearch 将代码修改、限时训练、指标判断和回滚交给 Agent 循环。<span class="timeline-target">能力重点：评测、成本、可审计 Agent 与研究自动化。</span></div></article>',
        ]
    )
    body = f"""
<div class="toc"><strong>本页：</strong><a href="#path">学习主线</a><a href="#decisions">项目选择</a><a href="#evolution">技术演进</a><a href="#core">核心仓库</a><a href="#plan">6 周计划</a><a href="#catalog">全部仓库</a></div>
<section class="notice info"><strong>快照范围：</strong>基于 {KARPATHY_SNAPSHOT_DATE} 的 GitHub 公开数据，保留 <strong>{len(normalized)}</strong> 个仓库元数据，其中 <strong>{len(owned)}</strong> 个非 fork 项目进入学习聚类，<strong>{fork_count}</strong> 个 fork 只保留为追溯项。页面保存中文学习定位和元数据，不复制仓库源码。</section>
<div class="metric-strip" aria-label="Karpathy GitHub 概览"><div class="metric"><strong>{len(normalized)}</strong><span>公开仓库</span></div><div class="metric"><strong>{len(owned)}</strong><span>非 fork 项目</span></div><div class="metric"><strong>{active_count}</strong><span>2025–2026 有代码推送</span></div><div class="metric"><strong>6</strong><span>默认学习阶段</span></div></div>
<section id="path"><div class="section-head"><h2>从原理到自动研究的六级路径</h2><p>按依赖学习，不按 Star 数排序</p></div><div class="flow six"><div><strong>1</strong><br>Autodiff<br><small>micrograd</small></div><div><strong>2</strong><br>语言建模<br><small>makemore / minbpe</small></div><div><strong>3</strong><br>GPT 复现<br><small>build-nanogpt</small></div><div><strong>4</strong><br>完整生命周期<br><small>nanochat</small></div><div><strong>5</strong><br>C / CUDA 系统<br><small>llama2.c / llm.c</small></div><div><strong>6</strong><br>Agent 研究闭环<br><small>autoresearch</small></div></div><p class="notice">默认主线是 <strong>micrograd → Zero to Hero/makemore → minbpe/build-nanogpt → nanochat → llama2.c/llm.c → autoresearch</strong>。`nanoGPT` 仍适合读简洁训练循环，但其 README 已将新项目指向 `nanochat`。</p></section>
<section id="decisions"><div class="section-head"><h2>先做项目选择，再读代码</h2><p>相邻仓库解决的问题不同</p></div><div class="grid two"><div class="repo-callout"><h3>机制理解</h3><p><strong>micrograd</strong> 解释标量计算图；<strong>microgpt</strong> 压缩完整 GPT 算法；<strong>minGPT</strong> 展示最小 PyTorch 模块。目标是能手推和重写，不是追求训练吞吐。</p></div><div class="repo-callout"><h3>训练复现</h3><p><strong>build-nanogpt</strong> 适合按 commit 复现 GPT-2；<strong>nanochat</strong> 才是当前 tokenization、预训练、微调、评测和推理的完整实验入口。</p></div><div class="repo-callout"><h3>系统纵深</h3><p><strong>llama2.c</strong> 聚焦最小 C 推理；<strong>llm.c</strong> 聚焦 C/CUDA 预训练、数值对齐与性能。先保证 reference correctness，再优化 kernel。</p></div><div class="repo-callout"><h3>Agent 与自动研究</h3><p><strong>llm-council</strong> 是多模型互评原型；<strong>autoresearch</strong> 是受限代码修改、固定预算、单指标筛选与回滚循环。两者都必须补独立评测与人工审计。</p></div></div></section>
<section><div class="section-head"><h2>仓库主题分布</h2><p>只统计 {len(owned)} 个非 fork 项目</p></div><div class="grid two"><div class="viz-panel"><h3>能力轨道</h3><p class="viz-caption">数量说明知识覆盖，不代表学习优先级。</p><div class="static-bars">{track_bars}</div></div><div class="viz-panel"><h3>阅读纪律</h3><ol><li>先运行原始 baseline，并记录版本、硬件、数据与随机种子。</li><li>每次只改一个可解释变量；训练代码、评测代码和数据准备分开审计。</li><li>性能优化先做数值对齐，再报告 wall-clock、tokens/s、显存和质量。</li><li>Agent 自动实验必须保留 diff、失败日志、预算和人工否决入口。</li></ol></div></div></section>
<section id="evolution"><div class="section-head"><h2>代码谱系与技术演进</h2><p>从可视化神经网络到自修改研究循环</p></div><div class="timeline">{timeline_html}</div></section>
<section id="core"><div class="section-head"><h2>核心仓库学习矩阵</h2><p>README 级注释与可验收产物</p></div><div class="table-wrap"><table class="repo-table"><thead><tr><th>仓库</th><th>学习轨道</th><th>应该学什么</th><th>验收产物</th></tr></thead><tbody>{''.join(core_rows)}</tbody></table></div><p class="notice info"><strong>额外最小桥梁：</strong>{link(MICROGPT_GIST_URL, "microgpt pinned gist")} 用单个 dependency-free Python 文件呈现训练和推理完整算法；适合在 minbpe/micrograd 之后、PyTorch GPT 训练之前阅读。</p></section>
<section id="plan"><div class="section-head"><h2>6 周可执行学习计划</h2><p>每周必须留下代码、指标或系统图</p></div><div class="table-wrap"><table><thead><tr><th>周</th><th>主读</th><th>核心任务</th><th>验收标准</th></tr></thead><tbody>
<tr><td>1</td><td>micrograd + Zero to Hero 1</td><td>手写标量计算图、拓扑反传、MLP 与梯度检查。</td><td>与 PyTorch 的 forward/gradient 数值对齐，并解释一次梯度错误。</td></tr>
<tr><td>2</td><td>makemore + Zero to Hero 2–7</td><td>从 bigram 逐步到 MLP、BatchNorm、WaveNet 与 GPT。</td><td>同数据上的 loss/采样对照、激活和梯度诊断。</td></tr>
<tr><td>3</td><td>minbpe + microgpt + build-nanogpt</td><td>实现 tokenizer，按提交重建 GPT-2 数据流和训练循环。</td><td>UTF-8 往返测试、压缩率、模型形状图和最小训练日志。</td></tr>
<tr><td>4</td><td>nanochat</td><td>跑通 tokenization、pretraining、finetuning、evaluation、inference。</td><td>完整 lineage：输入数据、checkpoint、评测、成本和失败样例。</td></tr>
<tr><td>5</td><td>llama2.c → llm.c</td><td>先读 C forward，再做 PyTorch/C/CUDA 对齐和一个性能 profile。</td><td>正确性误差、p50 延迟、tokens/s、显存或带宽报告。</td></tr>
<tr><td>6</td><td>llm-council + autoresearch</td><td>实现受限自动实验循环与多模型交叉评测。</td><td>可回滚 diff、固定预算、独立 verifier、失败分类和人工审计。</td></tr>
</tbody></table></div></section>
<section id="catalog"><div class="section-head"><h2>全部公开仓库索引</h2><p>快照：{KARPATHY_SNAPSHOT_DATE}</p></div><div class="filter-grid"><input class="filter" id="repo-filter" type="search" placeholder="筛选仓库、描述、语言或学习定位"><select class="filter" id="repo-track" aria-label="按学习轨道筛选"><option value="">全部学习轨道（{len(normalized)}）</option>{track_options}<option value="外部分叉">外部分叉（{fork_count}）</option></select></div><label class="small"><input id="owned-only" type="checkbox"> 只显示非 fork 项目</label><p id="repo-count" class="small">显示 {len(normalized)} 项。</p><div class="table-wrap"><table class="repo-table" id="repo-catalog"><thead><tr><th>仓库 / 状态</th><th>轨道 / 技术</th><th>优先级 / 活跃度</th><th>本地学习定位</th></tr></thead><tbody>{''.join(repo_rows)}</tbody></table></div></section>
<section class="notice"><strong>证据与版本边界：</strong>仓库说明以 {KARPATHY_SNAPSHOT_DATE} 可见的 GitHub API、profile 与核心 README 为依据。Stars 和更新时间只反映快照状态；运行要求、成本、性能和项目维护状态可能变化，实际复现前应重新检查对应 README。离线数据：<a href="data/karpathy_repositories.json">karpathy_repositories.json</a>。</section>
<script>
const repoFilter = document.getElementById('repo-filter');
const repoTrack = document.getElementById('repo-track');
const ownedOnly = document.getElementById('owned-only');
const repoRows = [...document.querySelectorAll('#repo-catalog tbody tr')];
const repoCount = document.getElementById('repo-count');
function filterRepos() {{
  const query = repoFilter.value.trim().toLowerCase();
  const track = repoTrack.value;
  let visible = 0;
  repoRows.forEach((row) => {{
    const match = row.dataset.search.includes(query) && (!track || row.dataset.track === track) && (!ownedOnly.checked || row.dataset.owned === 'true');
    row.hidden = !match;
    if (match) visible += 1;
  }});
  repoCount.textContent = `显示 ${{visible}} 项。`;
}}
repoFilter.addEventListener('input', filterRepos);
repoTrack.addEventListener('change', filterRepos);
ownedOnly.addEventListener('change', filterRepos);
</script>
"""
    return page("Karpathy GitHub 学习地图", "从反向传播、语言建模和 GPT 复现，推进到 LLM 全生命周期、C/CUDA 系统与自动研究 Agent。", body, "karpathy")


def build_ai_toolkit(repo: dict, tree: dict) -> str:
    examples = ai_toolkit_config_examples(tree)
    tree_count = len(tree.get("tree", []))
    license_info = repo.get("license") or {}
    license_id = license_info.get("spdx_id", "未标注") if isinstance(license_info, dict) else "未标注"
    model_counts = Counter(item["category"] for item in AI_TOOLKIT_SUPPORTED_MODELS)
    model_options = "".join(
        f'<option value="{esc(category)}">{esc(category)}（{count}）</option>'
        for category, count in model_counts.items()
    )
    model_rows = "".join(
        f'''<tr data-search="{esc(f'{item["name"]} {item["category"]}'.lower())}" data-category="{esc(item["category"])}"><td>{link(item["url"], item["name"])}</td><td>{esc(item["category"])}</td><td>README 支持列表快照；能力、许可、输入格式、显存和训练质量需按模型卡与当前配置复核。</td></tr>'''
        for item in AI_TOOLKIT_SUPPORTED_MODELS
    )
    config_counts = Counter(item["category"] for item in examples)
    config_options = "".join(
        f'<option value="{esc(category)}">{esc(category)}（{count}）</option>'
        for category, count in sorted(config_counts.items())
    )
    config_rows = "".join(
        f'''<tr data-search="{esc(f'{item["path"]} {item["category"]} {item["notes"]}'.lower())}" data-category="{esc(item["category"])}"><td>{link(item["url"], item["path"])}</td><td>{esc(item["category"])}<br><span class="pill">{priority_label(item["priority"])}</span></td><td>{esc(item["notes"])}</td></tr>'''
        for item in examples
    )
    stage_flow = "".join(
        f'<div><strong>{stage["order"]}</strong><br>{esc(stage["title"])}<br><small>{esc(stage["output"])}</small></div>'
        for stage in AI_TOOLKIT_LEARNING_STAGES
    )
    stage_rows = "".join(
        f'<tr><td>{stage["order"]}</td><td>{esc(stage["title"])}</td><td>{esc(stage["focus"])}</td><td>{esc(stage["output"])}</td></tr>'
        for stage in AI_TOOLKIT_LEARNING_STAGES
    )
    architecture_rows = "".join(
        f'<tr><td>{link(AI_TOOLKIT_REPO_URL + "/blob/main/" + item["path"], item["path"])}</td><td>{esc(item["role"])}</td></tr>'
        for item in AI_TOOLKIT_ARCHITECTURE_FILES
    )
    config_section_rows = "".join(
        f'<tr><td><code>{esc(item["name"])}</code></td><td>{esc(item["question"])}</td><td>{esc(item["check"])}</td></tr>'
        for item in AI_TOOLKIT_CONFIG_SECTIONS
    )
    body = f"""
<div class="toc"><strong>本页：</strong><a href="#position">定位</a><a href="#workflow">学习路径</a><a href="#architecture">架构</a><a href="#config">配置解剖</a><a href="#models">模型</a><a href="#examples">示例</a><a href="#plan">4 周计划</a><a href="#boundaries">边界</a></div>
<section id="position" class="notice info"><strong>快照范围：</strong>基于 {AI_TOOLKIT_SNAPSHOT_DATE} 的公开 README、GitHub API 元数据和 main 分支递归树。仓库定位是可用 GUI 或 CLI 运行的 diffusion/flow-based 图像、编辑、视频与音频微调套件；本地保存结构化学习注释和链接，不复制源码或模型权重。</section>
<div class="metric-strip" aria-label="AI Toolkit 概览"><div class="metric"><strong>{len(AI_TOOLKIT_SUPPORTED_MODELS)}</strong><span>README 模型条目</span></div><div class="metric"><strong>{len(examples)}</strong><span>config/examples 配置</span></div><div class="metric"><strong>{tree_count}</strong><span>main 分支树节点</span></div><div class="metric"><strong>{len(AI_TOOLKIT_LEARNING_STAGES)}</strong><span>默认学习阶段</span></div></div>
<section><div class="section-head"><h2>它解决什么问题</h2><p>训练编排层，而不是新生成模型论文</p></div><div class="grid two"><article class="item"><h3>统一实验入口</h3><p>通过 YAML 把模型、数据集、network adapter、训练目标、优化器、采样、保存和日志放入同一 job。工程价值是让不同模型共用可追溯实验骨架。</p></article><article class="item teal"><h3>显存约束下的适配</h3><p>LoRA/LoKr、量化、低显存模式、latent/text embedding cache 和 gradient checkpointing 共同决定“能否跑”，但每个开关都可能改变速度、复现性或质量。</p></article><article class="item coral"><h3>多种生成任务</h3><p>README 快照同时列出 image、instruction/edit、video、audio 和 experimental 模型。任务形态会改变数据配对、采样器、评测维度和算力预算，不能共用一套默认参数。</p></article><article class="item gold"><h3>训练运行面</h3><p>CLI 适合版本化、批量与自动化；Web UI 适合配置和观察任务。两者最终都应落到可归档配置、checkpoint、样本、指标与失败日志。</p></article></div><p class="small">仓库元数据快照：Python · {esc(str(license_id))} · ★ {int(repo.get("stargazers_count", 0)):,} · forks {int(repo.get("forks_count", 0)):,} · 默认分支 {esc(str(repo.get("default_branch", "main")))} · 最后推送 {esc(str(repo.get("pushed_at") or "未标注")[:10])}。GitHub API 的 open issues 计数可能包含 Pull Requests。</p></section>
<section id="workflow"><div class="section-head"><h2>六阶段学习路径</h2><p>先证明数据与基线正确，再做显存和速度优化</p></div><div class="flow six">{stage_flow}</div><div class="table-wrap"><table><thead><tr><th>级</th><th>阶段</th><th>关键动作</th><th>验收产物</th></tr></thead><tbody>{stage_rows}</tbody></table></div></section>
<section id="architecture"><div class="section-head"><h2>从 YAML 到训练循环</h2><p>先沿调用链阅读，再进入具体模型实现</p></div><div class="flow eight"><div>YAML config</div><div><code>run.py</code></div><div><code>get_job</code></div><div>Job</div><div>Process</div><div><code>BaseSDTrainProcess</code></div><div>data / model / optimizer</div><div>sample / save / log</div></div><p class="notice info"><strong>阅读顺序：</strong><code>run.py</code> 解释配置与 job 生命周期；<code>toolkit/job.py</code> 解释任务路由；<code>BaseSDTrainProcess.py</code> 是训练编排核心；再进入配置模块和 dataloader。这样能先建立控制流，再读具体模型和 sampler。</p><div class="table-wrap"><table><thead><tr><th>关键文件</th><th>学习定位</th></tr></thead><tbody>{architecture_rows}</tbody></table></div></section>
<section id="config"><div class="section-head"><h2>配置解剖与决策边界</h2><p>把参数分成任务、数据、适配、训练、模型和观察六组</p></div><div class="table-wrap"><table><thead><tr><th>配置段</th><th>回答的问题</th><th>实验检查</th></tr></thead><tbody>{config_section_rows}</tbody></table></div><h3 style="margin-top:22px">代表性配置不是通用最佳实践</h3><div class="table-wrap"><table><thead><tr><th>示例</th><th>快照中的关键取舍</th><th>学习时必须验证</th></tr></thead><tbody>
<tr><td>{link(f"{AI_TOOLKIT_REPO_URL}/blob/main/config/examples/train_lora_flux_24gb.yaml", "FLUX LoRA 24GB")}</td><td>LoRA linear/alpha 16；flow matching；AdamW 8-bit；bf16；quantized model；512/768/1024 buckets；固定 prompt 与 seed；按 250 steps 保存和采样。</td><td>先核对当前模型版本和显存，再消融 rank、学习率、分辨率与 cache；不要把“24GB”当作所有 FLUX 变体保证。</td></tr>
<tr><td>{link(f"{AI_TOOLKIT_REPO_URL}/blob/main/config/examples/train_lora_qwen_image_24gb.yaml", "Qwen Image LoRA 24GB")}</td><td>配置注释要求在该 24GB 方案中 cache text embeddings；包含 model/text encoder 量化、low_vram 与 flow matching。</td><td>记录量化类型、cache 生成时机、训练吞吐、显存峰值与最终画质；比较关闭量化后的可行基线。</td></tr>
<tr><td>{link(f"{AI_TOOLKIT_REPO_URL}/blob/main/config/examples/train_lora_wan21_1b_24gb.yaml", "Wan2.1 1.3B LoRA 24GB")}</td><td>示例按图像文件夹、单帧方式训练；配置注释认为它更适合角色而非动作，并使用 flow matching、sigmoid timestep 与量化 text encoder。</td><td>角色一致性和动作/时序一致性分开评测；若目标是动作学习，不能用单帧结果替代视频训练证据。</td></tr>
</tbody></table></div><div class="grid two" style="margin-top:14px"><article class="item"><h3>LoRA、FullFT 与 LoKr</h3><p>默认先用 LoRA 建立质量/成本基线。只有 LoRA 在充分 rank、目标层和数据审计后仍饱和，且算力与灾难性遗忘评测齐备，才进入 FullFT。LoKr 和层选择必须与同预算 LoRA 对照。</p></article><article class="item teal"><h3>Cache 与量化</h3><p>cache latents/text embeddings 减少重复前向但会固定部分数据变换；量化和 low_vram 降低显存，却可能改变吞吐与数值误差。每项优化都要保留无优化参考。</p></article><article class="item coral"><h3>层包含与排除</h3><p><code>only_if_contains</code> 定义候选层，<code>ignore_if_contains</code> 负责排除且优先。运行前输出实际可训练参数名单，避免“任务完成但没有训练目标层”。</p></article><article class="item gold"><h3>数据与 Trigger</h3><p>README 约定图片和同名 <code>.txt</code> caption，分辨率通过 buckets 处理且不会上采样；<code>[trigger]</code> 可由 trigger word 替换。必须审计空 caption、重复图、泄漏和错误 trigger。</p></article></div></section>
<section id="models"><div class="section-head"><h2>README 支持模型矩阵</h2><p>{len(AI_TOOLKIT_SUPPORTED_MODELS)} 个条目，按任务而非品牌浏览</p></div><div class="filter-grid"><input class="filter" id="model-filter" type="search" placeholder="筛选模型名或任务"><select class="filter" id="model-category" aria-label="按模型任务筛选"><option value="">全部任务（{len(AI_TOOLKIT_SUPPORTED_MODELS)}）</option>{model_options}</select></div><p id="model-count" class="small">显示 {len(AI_TOOLKIT_SUPPORTED_MODELS)} 项。</p><div class="table-wrap"><table id="model-catalog"><thead><tr><th>模型</th><th>任务组</th><th>证据边界</th></tr></thead><tbody>{model_rows}</tbody></table></div></section>
<section id="examples"><div class="section-head"><h2>示例配置目录</h2><p>从递归仓库树自动提取，不手工维护文件名</p></div><div class="filter-grid"><input class="filter" id="config-filter" type="search" placeholder="筛选文件、模型、显存或说明"><select class="filter" id="config-category" aria-label="按配置类型筛选"><option value="">全部配置（{len(examples)}）</option>{config_options}</select></div><p id="config-count" class="small">显示 {len(examples)} 项。</p><div class="table-wrap"><table id="config-catalog"><thead><tr><th>配置文件</th><th>类型 / 优先级</th><th>学习定位</th></tr></thead><tbody>{config_rows}</tbody></table></div></section>
<section id="plan"><div class="section-head"><h2>4 周可执行学习计划</h2><p>产出必须能复跑、比较和解释</p></div><div class="table-wrap"><table><thead><tr><th>周</th><th>任务</th><th>实验</th><th>验收</th></tr></thead><tbody>
<tr><td>1</td><td>环境、数据与 dry run</td><td>固定一个已支持图像模型；建立 20–50 个样本的小数据集，检查图片/同名 caption、trigger、buckets 和 held-out 集；跑最短 job。</td><td>版本锁、GPU/显存记录、数据审计表、实际训练层清单和首个可恢复 checkpoint。</td></tr>
<tr><td>2</td><td>LoRA 基线</td><td>以 FLUX 24GB 示例的字段结构为参考，但按硬件调整；固定 prompt/seed，比训练前、不同 step 和 held-out 输入。</td><td>配置、日志、checkpoint、样本板、训练时间、峰值显存和失败案例齐全。</td></tr>
<tr><td>3</td><td>适配与显存消融</td><td>一次只改 rank/alpha、目标层、caption dropout、量化、cache 或 low_vram 中一个变量。</td><td>质量—显存—吞吐表；明确哪些收益来自数据、哪些来自适配器、哪些只是运行优化。</td></tr>
<tr><td>4</td><td>扩展任务与运行面</td><td>选择 instruction edit、Wan 视频、Slider 或 Modal/UI 之一；补任务专属评测、恢复测试和权限检查。</td><td>可重复运行手册、评测 harness、故障恢复演练和是否进入更大训练的 go/no-go 结论。</td></tr>
</tbody></table></div><p class="notice"><strong>最小评测协议：</strong>固定版本、数据划分、prompt、seed、推理参数和 checkpoint；同时记录训练 loss、held-out 质量、概念保持、过拟合、失败率、显存峰值、wall-clock 与单样本生成成本。只看训练 loss 或主观挑图不能支持模型设计结论。</p></section>
<section id="boundaries"><div class="section-head"><h2>运行与证据边界</h2><p>哪些是仓库事实，哪些需要本地验证</p></div><div class="grid two"><article class="item"><h3>环境版本会漂移</h3><p>README 快照要求 Python ≥3.10、推荐 3.12，并给出 PyTorch 2.9.1 / CUDA 12.8 wheel 的当前安装组合；这些精确版本会随仓库更新，应以当时 README 与 lockfile 为准。macOS Silicon 支持标为 experimental。</p></article><article class="item teal"><h3>UI 是控制面，不是证据</h3><p>当前 README 要求 Node.js &gt;20，UI 默认位于 <code>localhost:8675</code>；远程暴露时应设置 <code>AI_TOOLKIT_AUTH</code>。job 启动后 UI 不必持续运行，但配置和日志必须归档。</p></article><article class="item coral"><h3>中断与恢复要演练</h3><p>CLI 可运行一个或多个 config，并支持恢复。README 警告在 checkpoint 正在保存时按 Ctrl+C 可能破坏该 checkpoint；测试时应验证上一个 checkpoint 是否可恢复。</p></article><article class="item gold"><h3>“支持”不等于“同质量”</h3><p>42 个名称只是 README 当前支持声明。模型许可、输入约束、训练目标、adapter 兼容性、显存和质量均需分别确认；experimental 项不能直接进入生产。</p></article></div><p class="notice info">原始入口：{link(AI_TOOLKIT_REPO_URL, "GitHub 仓库与 README")} · {link(AI_TOOLKIT_FAQ_URL, "FAQ")} · <a href="data/ai_toolkit_repository.json">本地结构化快照</a></p></section>
<script>
function wireTableFilter(inputId, selectId, tableId, countId) {{
  const input = document.getElementById(inputId);
  const select = document.getElementById(selectId);
  const rows = [...document.querySelectorAll(`#${{tableId}} tbody tr`)];
  const count = document.getElementById(countId);
  function apply() {{
    const query = input.value.trim().toLowerCase();
    const category = select.value;
    let visible = 0;
    rows.forEach((row) => {{
      const match = row.dataset.search.includes(query) && (!category || row.dataset.category === category);
      row.hidden = !match;
      if (match) visible += 1;
    }});
    count.textContent = `显示 ${{visible}} 项。`;
  }}
  input.addEventListener('input', apply);
  select.addEventListener('change', apply);
}}
wireTableFilter('model-filter', 'model-category', 'model-catalog', 'model-count');
wireTableFilter('config-filter', 'config-category', 'config-catalog', 'config-count');
</script>
"""
    return page("Ostris AI Toolkit 训练地图", "把统一扩散微调套件拆成数据、适配器、模型与量化、训练、采样评测和安全运行六个可学习层。", body, "ai_toolkit")


def format_seconds(value: int | float) -> str:
    seconds = int(value)
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}" if hours else f"{minutes:02d}:{seconds:02d}"


def build_kaggle_genai(course: dict) -> str:
    days = course["days"]
    total_words = sum(day["transcript_word_count"] for day in days)
    frame_count = sum(len(day["frames"]) for day in days)
    flow = "".join(
        f'<div><strong>Day {day["day"]}</strong><br>{esc(day["topic"])}<br><small>{esc(day["duration_string"])}</small></div>'
        for day in days
    )
    day_links = "".join(
        f'<a href="#day-{day["day"]}">Day {day["day"]}</a>' for day in days
    )
    day_sections = []
    for day in days:
        chapter_rows = "".join(
            f'<tr><td>{link(day["video_url"] + "&t=" + str(chapter["start"]) + "s", format_seconds(chapter["start"]))}</td><td>{esc(chapter["title"])}</td><td>{esc(chapter["note"])}</td></tr>'
            for chapter in day["learning_chapters"]
        )
        key_points = "".join(f"<li>{esc(item)}</li>" for item in day["key_points"])
        experiments = "".join(f"<li>{esc(item)}</li>" for item in day["experiments"])
        resources = "".join(
            f'<li>{link(item["url"], item["title"])} <span class="pill">{esc(item["kind"])}</span> <span class="pill">{priority_label(item["priority"])}</span></li>'
            for item in day["resources"]
        )
        figures = "".join(
            f'''<figure class="media-figure"><a href="{esc(day["video_url"] + "&t=" + str(frame["time"]) + "s")}" target="_blank" rel="noreferrer"><img src="assets/kaggle_genai/{esc(frame["file"])}" alt="{esc(frame["caption"])}" loading="lazy"></a><figcaption><strong>{format_seconds(frame["time"])}</strong> · {esc(frame["caption"])}</figcaption></figure>'''
            for frame in day["frames"]
        )
        local_video = "../" + day["local_low_resolution_video_path"]
        day_sections.append(
            f'''<section id="day-{day["day"]}"><div class="section-head"><h2>Day {day["day"]} · {esc(day["topic"])}</h2><p>{esc(day["duration_string"])} · 自动字幕 {day["transcript_word_count"]:,} 词</p></div>
            <p class="lead">{esc(day["summary"])}</p>
            <p class="small">{link(day["video_url"], "YouTube 原视频")} · {link(local_video, "本地 360p 视频", False)} · <a href="transcripts/kaggle_genai/day{day["day"]:02d}.md">清洗文字稿</a> · <a href="data/kaggle_genai/subtitles/day{day["day"]:02d}.en-orig.vtt">原始自动字幕</a></p>
            <div class="grid two"><article class="item"><h3>关键技术判断</h3><ul>{key_points}</ul></article><article class="item teal"><h3>可执行实验</h3><ol>{experiments}</ol></article></div>
            <div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>时间</th><th>学习章节</th><th>内容定位</th></tr></thead><tbody>{chapter_rows}</tbody></table></div>
            <div class="media-grid">{figures}</div>
            <details><summary>配套资料（{len(day["resources"])} 项）</summary><div><ul class="reading-list">{resources}</ul></div></details></section>'''
        )
    body = f"""
<div class="toc path-toc"><strong>本页：</strong><a href="#map">五日主线</a><a href="#synthesis">跨日脉络</a>{day_links}<a href="#fallback">无字幕回退</a><a href="kaggle_genai_transcripts.html">完整文字稿</a></div>
<section class="notice info"><strong>资料范围：</strong>基于 Kaggle 2024 年 5-Day Gen AI Intensive 的 5 场公开直播、英文自动字幕、视频描述和官方配套资料整理。直播约 {format_seconds(course["playlist"]["total_duration_seconds"])}；自动字幕已去除 YouTube 滚动重复并按分钟组织，但人名、术语和数字仍可能存在识别错误。</section>
<div class="metric-strip" aria-label="课程离线资料概览"><div class="metric"><strong>{len(days)}</strong><span>课程直播</span></div><div class="metric"><strong>{format_seconds(course["playlist"]["total_duration_seconds"])}</strong><span>总时长</span></div><div class="metric"><strong>{total_words:,}</strong><span>清洗字幕词数</span></div><div class="metric"><strong>{frame_count}</strong><span>教学关键帧</span></div></div>
<section id="map"><div class="section-head"><h2>从模型调用到生产闭环</h2><p>五天不是五个孤立主题，而是应用复杂度逐级增加</p></div><div class="flow five">{flow}</div><p class="notice"><strong>默认路径：</strong>先控制模型行为，再接入外部知识，然后让模型使用工具；只有当 Prompt/RAG 不足时才进入领域适配，最后用评测、部署、监控和反馈保证系统长期可用。</p></section>
<section id="synthesis"><div class="section-head"><h2>跨日技术脉络</h2><p>每一天都为下一天增加一个工程变量</p></div><div class="table-wrap"><table><thead><tr><th>能力跃迁</th><th>新增机制</th><th>新增风险</th><th>工程验收</th></tr></thead><tbody>
<tr><td>模型 → 可控生成</td><td>Prompt、解码参数、chat history、结构化输出。</td><td>不可复现、格式漂移、提示样例过拟合。</td><td>固定模型/参数/评测集，统计 schema 与语义正确率。</td></tr>
<tr><td>参数知识 → 外部知识</td><td>Embedding、ANN、vector store、RAG。</td><td>切分错误、召回遗漏、引用不支持结论。</td><td>分开测 retrieval recall、citation support 和最终答案。</td></tr>
<tr><td>生成文本 → 执行动作</td><td>Function calling、工具、state graph、retry。</td><td>参数错误、越权、副作用和重试放大。</td><td>记录完整 trace、权限、工具错误率和任务成功率。</td></tr>
<tr><td>通用模型 → 领域系统</td><td>Grounding、PEFT、领域数据和专家流程。</td><td>敏感数据、分布漂移、对抗输入和错误自动化。</td><td>与 Prompt/RAG 公平比较，并加入专家验证与红队。</td></tr>
<tr><td>原型 → 生产</td><td>CI/CD、版本、评测、可观测性、反馈回流。</td><td>组件独立变化、无唯一真值、线上质量不可见。</td><td>端到端回归、灰度/回滚、质量—延迟—成本 dashboard。</td></tr>
</tbody></table></div></section>
{''.join(day_sections)}
<section id="fallback"><div class="section-head"><h2>无字幕视频的本地回退流程</h2><p>本播放列表无需回退，但工作流已经验证可用</p></div><div class="flow six"><div>yt-dlp<br><small>下载视频/元数据</small></div><div>ffmpeg<br><small>16 kHz mono WAV</small></div><div>faster-whisper<br><small>本地语音识别</small></div><div>时间戳清洗<br><small>分段与去重复</small></div><div>教学抽帧<br><small>场景与章节筛选</small></div><div>人工复核<br><small>术语、数字、结论</small></div></div><p class="notice info">当前环境已安装 <code>yt-dlp</code>、<code>ffmpeg</code> 和 <code>faster-whisper</code>。若字幕缺失，可先提取 16 kHz 单声道音频再本地转写；必须记录 Whisper 模型、语言、分段参数，并对专有名词、代码、数字和多人重叠语音人工复核。</p><p>完整资料入口：{link(course["playlist"]["url"], "YouTube playlist")} · {link(course["official_course_overview"], "Google 官方课程综述")} · {link(course["self_paced_guide"], "Kaggle self-paced guide")} · <a href="data/kaggle_genai_course.json">结构化课程数据</a></p></section>
"""
    return page("Kaggle 5-Day Gen AI Intensive 学习地图", "从 Prompt、Embeddings/RAG、Agents 和领域适配推进到可评测、可部署、可监控的生成式 AI 系统。", body, "kaggle_genai")


def build_kaggle_transcripts(course: dict) -> str:
    day_options = "".join(
        f'<option value="{day["day"]}">Day {day["day"]} · {esc(day["topic"])}</option>'
        for day in course["days"]
    )
    sections = []
    total_blocks = 0
    for day in course["days"]:
        blocks = []
        for block in day["transcript_blocks"]:
            total_blocks += 1
            timestamp_url = day["video_url"] + "&t=" + str(block["start"]) + "s"
            blocks.append(
                f'<div class="transcript-block" data-day="{day["day"]}"><div class="transcript-time">{link(timestamp_url, format_seconds(block["start"]))}</div><p class="transcript-text">{esc(block["text"])}</p></div>'
            )
        sections.append(
            f'''<section class="transcript-day" id="transcript-day-{day["day"]}" data-day="{day["day"]}"><div class="section-head"><h2>Day {day["day"]} · {esc(day["topic"])}</h2><p>{day["transcript_word_count"]:,} words · {len(day["transcript_blocks"])} minute blocks</p></div><p>{esc(day["summary"])}</p>{''.join(blocks)}</section>'''
        )
    body = f"""
<div class="toc"><strong>本页：</strong><a href="kaggle_genai.html">返回课程地图</a>{''.join(f'<a href="#transcript-day-{day["day"]}">Day {day["day"]}</a>' for day in course["days"])}</div>
<section class="notice info"><strong>文字稿状态：</strong>来源为 YouTube English (Original) automatic captions。已消除逐词滚动字幕造成的重复，并合并成分钟级段落；没有重写讲者原意，也没有把自动字幕当作人工校对稿。技术名称、数字和断句请回到时间戳核对。</section>
<section><div class="section-head"><h2>搜索文字稿</h2><p>可按关键词和讲次过滤</p></div><div class="filter-grid"><input class="filter" id="transcript-filter" type="search" placeholder="搜索 embedding、function calling、evaluation 等"><select class="filter" id="transcript-day"><option value="">全部讲次</option>{day_options}</select></div><p class="small" id="transcript-count">显示 {total_blocks} 个分钟段落。</p></section>
{''.join(sections)}
<script>
const transcriptFilter = document.getElementById('transcript-filter');
const transcriptDay = document.getElementById('transcript-day');
const transcriptBlocks = [...document.querySelectorAll('.transcript-block')];
const transcriptSections = [...document.querySelectorAll('.transcript-day')];
const transcriptCount = document.getElementById('transcript-count');
function filterTranscript() {{
  const query = transcriptFilter.value.trim().toLowerCase();
  const day = transcriptDay.value;
  let visible = 0;
  transcriptBlocks.forEach((block) => {{
    const match = (!day || block.dataset.day === day) && block.textContent.toLowerCase().includes(query);
    block.hidden = !match;
    if (match) visible += 1;
  }});
  transcriptSections.forEach((section) => {{
    section.hidden = ![...section.querySelectorAll('.transcript-block')].some((block) => !block.hidden);
  }});
  transcriptCount.textContent = `显示 ${{visible}} 个分钟段落。`;
}}
transcriptFilter.addEventListener('input', filterTranscript);
transcriptDay.addEventListener('change', filterTranscript);
</script>
"""
    return page("Kaggle GenAI Intensive 清洗文字稿", "五场直播的英文自动字幕去重稿，保留分钟级时间戳、关键词搜索和原视频回链。", body, "kaggle_genai")


def build_kaggle_transcript_markdown(day: dict) -> str:
    lines = [
        f'# Day {day["day"]}: {day["topic"]}',
        "",
        f'- Video: {day["video_url"]}',
        f'- Duration: {day["duration_string"]}',
        f'- Caption source: YouTube English automatic captions (`{day["automatic_caption_language"]}`)',
        f'- Cleaned transcript words: {day["transcript_word_count"]:,}',
        "",
        "## 中文学习定位",
        "",
        day["summary"],
        "",
        "### 关键技术判断",
        "",
        *(f'- {item}' for item in day["key_points"]),
        "",
        "## Cleaned English Transcript",
        "",
        "> Automatic captions were deduplicated and grouped by minute. Verify names, numbers, code, and technical claims against the linked video.",
        "",
    ]
    for block in day["transcript_blocks"]:
        timestamp_url = day["video_url"] + "&t=" + str(block["start"]) + "s"
        lines.extend(
            [
                f'### [{format_seconds(block["start"])}]({timestamp_url})',
                "",
                block["text"],
                "",
            ]
        )
    return "\n".join(lines)


def build_bilibili_agent(agent: dict) -> str:
    source = agent["source"]
    transcript = agent["transcript"]
    chapter_rows = "".join(
        f'<tr><td>{link(source["url"] + "?t=" + str(chapter["start"]), format_seconds(chapter["start"]))}</td><td>{esc(chapter["title"])}</td><td>{esc(chapter["summary"])}</td><td>{esc(chapter["role"])}</td></tr>'
        for chapter in agent["chapters"]
    )
    architecture_rows = "".join(
        f'<tr><td>{esc(layer["layer"])}</td><td>{esc(layer["components"])}</td><td>{esc(layer["responsibility"])}</td></tr>'
        for layer in agent["architecture_layers"]
    )
    figures = "".join(
        f'''<figure class="media-figure"><a href="{esc(source["url"] + "?t=" + str(frame["time"]))}" target="_blank" rel="noreferrer"><img src="assets/bilibili_agent/{esc(frame["file"])}" alt="{esc(frame["caption"])}" loading="lazy"></a><figcaption><strong>{format_seconds(frame["time"])}</strong> · {esc(frame["caption"])}</figcaption></figure>'''
        for frame in agent["frames"]
    )
    judgments = "".join(
        f'<article class="item"><p class="kicker">判断 {index:02d}</p><p>{esc(item)}</p></article>'
        for index, item in enumerate(agent["key_judgments"], start=1)
    )
    experiments = "".join(
        f'<li><strong>实验 {index}：</strong>{esc(item)}</li>'
        for index, item in enumerate(agent["experiments"], start=1)
    )
    limitations = "".join(f"<li>{esc(item)}</li>" for item in agent["limitations"])
    resources = "".join(
        f'<tr><td>{link(item["url"], item["title"])}</td><td>{esc(item["kind"])}</td><td>{priority_label(item["priority"])}</td></tr>'
        for item in agent["resources"]
    )
    local_video = "../" + agent["ingestion"]["local_video_path"]
    body = f"""
<div class="toc path-toc"><strong>本页：</strong><a href="#spine">技术主线</a><a href="#chapters">章节</a><a href="#architecture">架构分层</a><a href="#slides">关键幻灯片</a><a href="#judgments">技术判断</a><a href="#experiments">实验</a><a href="agent_architecture_transcript.html">完整文字稿</a></div>
<section class="notice info"><strong>资料状态：</strong>原页面未提供字幕。本页基于本地下载的 720p 视频、<code>{esc(agent["ingestion"]["transcription_model"])}</code> 长音频转写和 12 张幻灯片交叉整理。机器稿做了产品名术语校正，但人名、数字与断句仍应回到时间戳核验。</section>
<div class="metric-strip" aria-label="视频离线资料概览"><div class="metric"><strong>{source["duration_string"]}</strong><span>视频时长</span></div><div class="metric"><strong>{len(agent["chapters"])}</strong><span>技术章节</span></div><div class="metric"><strong>{transcript["cleaned_character_count"]:,}</strong><span>清洗字符</span></div><div class="metric"><strong>{len(agent["frames"])}</strong><span>教学关键帧</span></div></div>
<section id="spine"><div class="section-head"><h2>从概率模型到可运营的 Agent 系统</h2><p>{esc(agent["knowledge_position"])}</p></div><p class="lead">{esc(agent["summary"])}</p><div class="flow six"><div>控制策略<br><small>workflow / agentic</small></div><div>上下文<br><small>Prompt、RAG、state</small></div><div>Agent Runtime<br><small>单/多 Agent</small></div><div>治理入口<br><small>MCP / AI Gateway</small></div><div>状态恢复<br><small>event / checkpoint</small></div><div>观测评测<br><small>OTel / eval loop</small></div></div><p class="small">{link(source["url"], "Bilibili 原视频")} · {link(local_video, "本地 720p 视频", False)} · <a href="agent_architecture_transcript.html">可搜索中文稿</a> · <a href="transcripts/bilibili_agent_architecture.md">Markdown 稿</a> · <a href="data/bilibili_agent/BV1ADWCzrEXL.whisper-large-v3.vtt">Whisper VTT</a> · <a href="data/bilibili_agent_whisper_raw.json">原始转写 JSON</a></p></section>
<section id="chapters"><div class="section-head"><h2>章节与技术作用</h2><p>时间轴链接回原视频</p></div><div class="table-wrap"><table><thead><tr><th>时间</th><th>章节</th><th>内容结论</th><th>在主线中的作用</th></tr></thead><tbody>{chapter_rows}</tbody></table></div></section>
<section id="architecture"><div class="section-head"><h2>企业 Agent 六层架构</h2><p>按职责分层，而不是按产品名记忆</p></div><div class="table-wrap"><table><thead><tr><th>层</th><th>组件/机制</th><th>责任边界</th></tr></thead><tbody>{architecture_rows}</tbody></table></div><p class="notice">视频最有价值的不是指定一套阿里技术栈，而是把 Agent 业务逻辑与流量、模型/工具接入、配置治理、状态恢复、观测评测拆成独立边界。替换云厂商或框架时，这些责任仍然存在。</p></section>
<section id="slides"><div class="section-head"><h2>关键幻灯片</h2><p>点击画面回到对应视频时间</p></div><div class="media-grid">{figures}</div></section>
<section id="judgments"><div class="section-head"><h2>工程化技术判断</h2><p>区分讲者经验、可验证机制和实现缺口</p></div><div class="grid two">{judgments}</div></section>
<section id="experiments"><div class="section-head"><h2>可执行实验</h2><p>每个实验都要求质量、成本、延迟和失败归因</p></div><ol class="reading-list">{experiments}</ol></section>
<section><div class="section-head"><h2>原始来源与官方延伸</h2><p>延伸仓库用于核对当前能力，不代表视频当时已实现全部规划</p></div><div class="table-wrap"><table><thead><tr><th>资料</th><th>性质</th><th>优先级</th></tr></thead><tbody>{resources}</tbody></table></div></section>
<section class="notice warning"><strong>边界：</strong><ul>{limitations}</ul></section>
"""
    return page(
        "AI Agent 架构趋势及演进",
        "从 workflow/agentic、context engineering 和 MCP 治理，推进到状态恢复、可观测性与持续评测。",
        body,
        "agent_architecture",
    )


def build_bilibili_agent_transcript(agent: dict) -> str:
    source = agent["source"]
    chapter_options = "".join(
        f'<option value="{index}">{index:02d} · {esc(chapter["title"])}</option>'
        for index, chapter in enumerate(agent["chapters"], start=1)
    )
    sections = []
    total_blocks = 0
    for index, chapter in enumerate(agent["chapters"], start=1):
        blocks = []
        for block in agent["transcript"]["blocks"]:
            if not (chapter["start"] <= block["start"] < chapter["end"]):
                continue
            total_blocks += 1
            timestamp_url = source["url"] + "?t=" + str(block["start"])
            blocks.append(
                f'<div class="transcript-block" data-chapter="{index}"><div class="transcript-time">{link(timestamp_url, format_seconds(block["start"]))}</div><p class="transcript-text">{esc(block["text"])}</p></div>'
            )
        if blocks:
            sections.append(
                f'''<section class="transcript-day" data-chapter="{index}" id="agent-transcript-{index}"><div class="section-head"><h2>{index:02d} · {esc(chapter["title"])}</h2><p>{format_seconds(chapter["start"])}–{format_seconds(chapter["end"])}</p></div><p>{esc(chapter["summary"])}</p>{''.join(blocks)}</section>'''
            )
    body = f"""
<div class="toc"><strong>本页：</strong><a href="agent_architecture.html">返回架构地图</a>{''.join(f'<a href="#agent-transcript-{i}">{i:02d}</a>' for i in range(1, len(agent["chapters"]) + 1))}</div>
<section class="notice info"><strong>文字稿状态：</strong>视频页面无字幕；本稿由 <code>{esc(agent["ingestion"]["transcription_model"])}</code> 在本地 16 kHz 单声道音频上生成。已按 5 分钟长音频窗口转写并校正可由幻灯片确认的产品名，不是人工逐字校对稿。</section>
<section><div class="section-head"><h2>搜索文字稿</h2><p>按关键词或章节过滤</p></div><div class="filter-grid"><input class="filter" id="agent-transcript-filter" type="search" placeholder="搜索 context、MCP、RocketMQ、TTFT、评测等"><select class="filter" id="agent-transcript-chapter"><option value="">全部章节</option>{chapter_options}</select></div><p class="small" id="agent-transcript-count">显示 {total_blocks} 个分钟段落。</p></section>
{''.join(sections)}
<script>
const agentFilter = document.getElementById('agent-transcript-filter');
const agentChapter = document.getElementById('agent-transcript-chapter');
const agentBlocks = [...document.querySelectorAll('.transcript-block')];
const agentSections = [...document.querySelectorAll('.transcript-day')];
const agentCount = document.getElementById('agent-transcript-count');
function filterAgentTranscript() {{
  const query = agentFilter.value.trim().toLowerCase();
  const chapter = agentChapter.value;
  let visible = 0;
  agentBlocks.forEach((block) => {{
    const match = (!chapter || block.dataset.chapter === chapter) && block.textContent.toLowerCase().includes(query);
    block.hidden = !match;
    if (match) visible += 1;
  }});
  agentSections.forEach((section) => {{
    section.hidden = ![...section.querySelectorAll('.transcript-block')].some((block) => !block.hidden);
  }});
  agentCount.textContent = `显示 ${{visible}} 个分钟段落。`;
}}
agentFilter.addEventListener('input', filterAgentTranscript);
agentChapter.addEventListener('change', filterAgentTranscript);
</script>
"""
    return page(
        "AI Agent 架构演进 · 清洗中文稿",
        "无原始字幕视频的本地 Whisper large-v3 转写，保留分钟级时间戳、章节定位和关键词检索。",
        body,
        "agent_architecture",
    )


def build_bilibili_agent_markdown(agent: dict) -> str:
    source = agent["source"]
    lines = [
        f'# {source["title"]}',
        "",
        f'- Source: {source["url"]}',
        f'- Uploader: {source["uploader"]}',
        f'- Duration: {source["duration_string"]}',
        f'- Transcription: {agent["ingestion"]["transcription_model"]} / {agent["ingestion"]["transcription_backend"]}',
        "",
        "> 本稿由机器转写并做术语级清洗。人名、数字、产品名和断句请回到视频时间戳核对。",
        "",
        "## 中文技术定位",
        "",
        agent["summary"],
        "",
        "## 章节摘要",
        "",
    ]
    for chapter in agent["chapters"]:
        timestamp_url = source["url"] + "?t=" + str(chapter["start"])
        lines.extend(
            [
                f'### [{format_seconds(chapter["start"])}]({timestamp_url}) {chapter["title"]}',
                "",
                chapter["summary"],
                "",
            ]
        )
    lines.extend(["## 清洗后机器文字稿", ""])
    for block in agent["transcript"]["blocks"]:
        timestamp_url = source["url"] + "?t=" + str(block["start"])
        lines.extend(
            [
                f'### [{format_seconds(block["start"])}]({timestamp_url})',
                "",
                block["text"],
                "",
            ]
        )
    return "\n".join(lines)


def build_sources() -> str:
    body = """
<section class="notice info"><strong>综述范围：</strong>本页复核十三个直接来源的课程结构、公开文章索引、代码仓库或视频，并将已有中文报告中的技术解释转为离线阅读入口。对单篇论文或仓库，只有在课程资料、README、课程字幕/转写或已整理报告中存在明确依据时才给出中文学习注释；其余项保留为可追溯索引。</section>
<section><div class="section-head"><h2>十三个来源各自解决什么问题</h2><p>它们是互补层，不是同一主题的重复书单。</p></div><div class="grid two">
  <article class="item"><h3>MIT MAS.S60 How2AI</h3><p><a href="https://mit-mi.github.io/how2ai-course/spring2025/schedule/" target="_blank" rel="noreferrer">课程 schedule</a> 给出从 AI research 到 Human-AI interaction 的纵向课纲。它的关键价值是把 representation、结构、多模态、foundation models、生成与交互放在一个因果顺序中。</p><p class="small"><strong>离线入口：</strong><a href="how2ai.html">讲次与 readings</a> / <a href="how2ai_full_report.html">完整报告</a></p></article>
  <article class="item teal"><h3>Vincent Generative AI · Diffusion</h3><p><a href="https://taohu.me/vincent-genai-course/diffusion.html" target="_blank" rel="noreferrer">扩散章节</a> 以理论基础、采样、VAE、Stable Diffusion、一致性、骨干、guidance 与跨媒体应用组织内容。学习时不要把“扩散”缩减成加噪/去噪，应把路径、网络预测、条件注入和数值求解器分开。</p><p class="small"><strong>离线入口：</strong><a href="diffusion_full_guide.html">完整专题报告</a></p></article>
  <article class="item coral"><h3>Caltech CS 159</h3><p><a href="https://sites.google.com/view/cs-159-spring2025/lectures" target="_blank" rel="noreferrer">LLMs for Reasoning</a> 将学习目标设置为：理解多类推理任务、用 notebook 构建应用、拆解论文、提出并完成研究项目。其工程核心是把“模型回答”改成有 benchmark、baseline、指标和失败分析的研究交付。</p><p class="small"><strong>离线入口：</strong><a href="reasoning_full_guide.html">推理与 Agent 指南</a></p></article>
  <article class="item"><h3>Stanford CS25 · Transformers United V6</h3><p><a href="https://web.stanford.edu/class/cs25/" target="_blank" rel="noreferrer">2026 前沿研讨课</a> 以 9 场讲座连接 Transformer 基础、JEPA 世界模型、SSM、超大规模训练、预训练与泛化、科学/医疗 Agent、原生多模态和生产推理。它没有作业型能力闭环，适合作为已有基础之上的研究更新层。</p><p class="small"><strong>离线入口：</strong><a href="stanford_cs25.html">完整讲次与 4 周研讨路线</a></p></article>
  <article class="item teal"><h3>Stanford CS336 · Language Modeling from Scratch</h3><p><a href="https://cs336.stanford.edu/" target="_blank" rel="noreferrer">Spring 2026 全栈实现课</a> 用 5 个低脚手架作业连接 BPE/Transformer、GPU profiling/Triton/FSDP、scaling law、Common Crawl 数据和 GRPO/RLVR。它补上知识库中从模型原理到预训练/后训练系统的最强实现闭环。</p><p class="small"><strong>离线入口：</strong><a href="stanford_cs336.html">19 讲与 8 周路线</a> / <a href="cs336_transcripts.html">18 场可搜索英文字幕</a></p></article>
  <article class="item gold"><h3>Lilian Weng · Lil’Log</h3><p><a href="https://lilianweng.github.io/" target="_blank" rel="noreferrer">Lil’Log</a> 是持续更新的技术长文库。它最适合承担机制解释层：Attention/Transformer、inference optimization、prompt/agent、test-time compute、reward hacking、hallucination 与 scaling laws。</p><p class="small"><strong>使用法：</strong>先用 Taxonomy 定位术语，再用相关长文补数学、图示、历史与失败模式。</p></article>
  <article class="item teal"><h3>Transformer Taxonomy</h3><p><a href="https://kipp.ly/p/transformer-taxonomy" target="_blank" rel="noreferrer">2023 文献地图</a> 按 models、architectural changes、post-pre-training、training techniques 和其他能力接口分类。它明确排除了 systems/performance 与 alignment 的系统综述，因此可作为历史坐标，不能替代 2024–2026 的最新实践。</p><p class="small"><strong>工程抓手：</strong>MQA、FlashAttention、MoE、RMSNorm、RoPE、SwiGLU、RLHF/SFT、FIM、tool use 和 sampling 是可拆开比较的变量。</p></article>
  <article class="item coral"><h3>Thinking Machines · Connectionism</h3><p><a href="https://thinkingmachines.ai/blog/" target="_blank" rel="noreferrer">公开技术博客</a> 补上训练与部署之间最容易断裂的部分：on-policy distillation 让监督落在学生实际轨迹上；LoRA 的适用边界；实时 interaction models；batch-invariant 推理带来的可复现性；以及以流形约束理解优化。</p><p class="small"><strong>结论：</strong>trace 成功不等于系统成功，训练分布、运行时、延迟与可复现性必须一起验证。</p></article>
  <article class="item"><h3>Labelbox Blog</h3><p><a href="https://labelbox.com/blog/" target="_blank" rel="noreferrer">评测与反馈基础设施</a> 强调环境、trajectory、细粒度评测和训练回流。Recursion、GIM、EchoChain、implicit intelligence、safety dataset 与 monitorability 的共同点是：真实能力需要在状态、约束和监督关系中评估。</p><p class="small"><strong>结论：</strong>Agent 的优势常来自更好的环境、评测和失败数据，而不是一次性切换更大的基础模型。</p></article>
  <article class="item gold"><h3>Andrej Karpathy GitHub</h3><p><a href="https://github.com/karpathy" target="_blank" rel="noreferrer">公开代码谱系</a> 将原理与系统实现连接起来：micrograd/Zero to Hero 解释反向传播与语言建模，build-nanogpt/nanochat 覆盖 GPT 复现和完整 LLM 生命周期，llama2.c/llm.c 进入 C/CUDA，autoresearch 则把实验修改、限时训练、指标判断与回滚组织成 Agent 闭环。</p><p class="small"><strong>离线入口：</strong><a href="karpathy.html">63 个仓库快照、核心学习矩阵和 6 周路线</a></p></article>
  <article class="item teal"><h3>Ostris AI Toolkit</h3><p><a href="https://github.com/ostris/ai-toolkit" target="_blank" rel="noreferrer">扩散微调套件</a> 把 YAML job、图片与 caption/buckets、LoRA/LoKr、量化与 cache、flow matching、采样、checkpoint 和 Web UI 组织成统一训练运行面。它补上现有 Diffusion 理论报告与真实微调实验之间的工程层。</p><p class="small"><strong>离线入口：</strong><a href="ai_toolkit.html">42 个模型条目、25 个示例配置和 4 周实验路线</a></p></article>
  <article class="item coral"><h3>Kaggle 5-Day Gen AI Intensive</h3><p><a href="https://www.youtube.com/playlist?list=PLqFaTIg4myu-b1PlxitQdY0UYIbys-2es" target="_blank" rel="noreferrer">5 场官方直播</a> 将基础模型与提示、Embedding/RAG、Agent、领域适配和 GenAI MLOps 串成应用工程闭环。它补足知识库中从模型机制走向可部署 LLM 系统的实操层，并通过时间轴、codelab 和完整字幕保留可追溯证据。</p><p class="small"><strong>离线入口：</strong><a href="kaggle_genai.html">中文课程地图与关键帧</a> / <a href="kaggle_genai_transcripts.html">49,160 词可搜索英文逐字稿</a></p></article>
  <article class="item gold"><h3>AI Agent 架构趋势及演进</h3><p><a href="https://www.bilibili.com/video/BV1ADWCzrEXL/" target="_blank" rel="noreferrer">阿里云云原生架构分享</a> 从 workflow/agentic、单/多 Agent 和 context engineering，推进到 Nacos/Higress 的 MCP 治理、RocketMQ 长任务恢复、OpenTelemetry/LoongSuite 可观测性与持续评测。它补上 Agent 从应用代码进入企业运行面的组件边界。</p><p class="small"><strong>离线入口：</strong><a href="agent_architecture.html">12 章技术地图与关键幻灯片</a> / <a href="agent_architecture_transcript.html">Whisper 中文转写</a></p></article>
</div></section>
<section><div class="section-head"><h2>跨来源的五条技术判断</h2><p>用于判断新论文或新产品，而非代替原文阅读。</p></div><div class="grid two">
  <article class="item"><h3>1. 表征学习通向 Foundation Models，但不是线性替换</h3><p>How2AI 的 representation/generalization 说明“什么特征可迁移”；Taxonomy 的模型谱系与 Lil’Log 的 scaling 说明“如何把这个能力规模化”；CS336 再用 tokenizer、训练系统、规模律与 Common Crawl 作业把约束落到实现。基础模型的迁移效果仍受数据混合、tokenizer、目标函数、训练 token、硬件预算与下游适配约束。</p></article>
  <article class="item teal"><h3>2. 多模态的难点是交互证据，不是输入拼接</h3><p>Alignment 可以让两个编码器处于相近语义空间，fusion 才开始建模互补信息，transfer 则测试一种模态的知识能否服务另一种任务。评测要设计反单模态捷径的对照和条件消融。</p></article>
  <article class="item coral"><h3>3. Transformer 到多模态 LLM 依赖接口设计</h3><p>视觉/音频/动作如何 token 化、以何种位置与频率进入 LLM、是否冻结编码器、是否 early fusion，都会改变成本和能力。不要只问“是否支持多模态”，而要问信息在哪一层交互、如何验证其被使用。</p></article>
  <article class="item gold"><h3>4. Diffusion 到 Flow Matching 的工程核心是求解预算</h3><p>DDPM、score、SDE/ODE、flow matching 的共同问题是如何定义从简单分布到数据的路径，并用有限网络调用把局部预测积分成样本。AI Toolkit 再把这条主线落到 model config、LoRA/LoKr、量化/cache、采样和 checkpoint；NFE、延迟、显存、条件遵循和失败率应统一报告。</p></article>
  <article class="item"><h3>5. Static Model 到 Interactive Agent 的跃迁靠闭环</h3><p>CS336 的 RLVR 把可验证奖励、policy optimization 与训练方差放在模型侧；CS 159 提供 reasoning/tool/search 任务；Thinking Machines 强调真实学生轨迹、实时协作与确定性；Labelbox 强调环境、反馈和独立监督；阿里云架构分享补上 MCP/AI Gateway、消息恢复、OpenTelemetry 与持续评测。可靠 Agent 的最小闭环是模型行为、状态、工具、verifier、日志、权限、回退和人类接管。</p></article>
</div></section>
<section><div class="section-head"><h2>把博客文章转成工程检查项</h2><p>公开文章中带有厂商实验或产品指标时，只作为特定设置下的案例。</p></div><div class="table-wrap"><table><thead><tr><th>来源主题</th><th>本地学习要点</th><th>可执行检查</th></tr></thead><tbody>
<tr><td>On-Policy Distillation</td><td>先采样学生实际会走到的轨迹，再使用强教师做稠密评分/蒸馏，缓解 teacher trajectory 与部署状态不一致。</td><td>保存失败轨迹；分开测 teacher judge 一致性、成本与下游收益。</td></tr>
<tr><td>LoRA Without Regret</td><td>小到中等 instruction/reasoning 数据上，适当配置的 LoRA 可与 FullFT 对比；结论不应外推到所有数据规模和分布。</td><td>固定数据、训练 token、评测与 wall-clock，对比 rank、作用层、显存和恢复能力。</td></tr>
<tr><td>Interaction Models / EchoChain</td><td>实时交互需要处理微回合、打断、约束更新和异步后台任务；流畅不等于推理正确。</td><td>同时测首 token 延迟、打断恢复、更新后任务正确率与工具状态同步。</td></tr>
<tr><td>Recursion / GIM</td><td>工作流环境、最终产物、中间决策和执行质量应一并评分；集成推理比单一选择题更接近真实任务。</td><td>定义状态转移、隐藏约束、可观察证据、rubric、held-out 环境与回归集。</td></tr>
<tr><td>Safety / Monitorability</td><td>显式触发词、拒答率或自我报告都不是安全本身；模型还可能偏好宽松监督。</td><td>做同意图改写、跨轮拼接、工具版本红队；使用不可绕过日志与独立审计。</td></tr>
</tbody></table></div></section>
"""
    return page("十三个来源的技术综述", "把课程大纲、教程、博客、代码仓库和视频放入同一工程决策框架，说明各自的贡献、边界和可执行结论。", body, "sources")


def build_papers(reading_rows: list[dict[str, str]]) -> str:
    grouped: dict[str, dict[str, dict[str, object]]] = defaultdict(dict)
    for row in reading_rows:
        category = row.get("category") or "未分类"
        key = row["reading_url"]
        entry = grouped[category].setdefault(
            key,
            {
                "title": row["reading_title"],
                "url": row["reading_url"],
                "priority": row.get("priority") or "reference",
                "notes": [],
                "lectures": [],
            },
        )
        if PRIORITY_RANK.get(row.get("priority", "reference"), 99) < PRIORITY_RANK.get(str(entry["priority"]), 99):
            entry["priority"] = row["priority"]
        if row.get("notes") and row["notes"] not in entry["notes"]:
            entry["notes"].append(row["notes"])
        label = f'{row.get("week", "")} · {row.get("lecture_topic", "")}'.strip(" ·")
        if label and label not in entry["lectures"]:
            entry["lectures"].append(label)

    priority_entries = []
    for category in grouped.values():
        for entry in category.values():
            if entry["priority"] == "must-read":
                priority_entries.append(entry)
    priority_entries.sort(key=lambda item: str(item["title"]).lower())
    must_html = "".join(
        f'<li>{link(str(item["url"]), str(item["title"]))} <span class="pill">必读</span><div class="reading-note">{esc(item["notes"][0]) if item["notes"] else "课程指定重点资料；具体贡献以原文为准。"}</div></li>'
        for item in priority_entries
    )
    category_html = []
    for category in sorted(grouped):
        entries = list(grouped[category].values())
        entries.sort(key=lambda item: (PRIORITY_RANK.get(str(item["priority"]), 99), str(item["title"]).lower()))
        rows = []
        for item in entries:
            notes = "<br>".join(esc(note) for note in item["notes"]) or "课程中保留为阅读参考；具体贡献需回到原文确认。"
            lectures = "；".join(esc(value) for value in item["lectures"])
            rows.append(
                f'<tr><td>{link(str(item["url"]), str(item["title"]))}</td><td><span class="pill">{priority_label(str(item["priority"]))}</span></td><td>{notes}</td><td class="small">{lectures}</td></tr>'
            )
        category_html.append(
            f'<details open><summary>{esc(category)}（{len(entries)} 项）</summary><div class="table-wrap"><table><thead><tr><th>资料</th><th>优先级</th><th>本地学习注释</th><th>课程位置</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div></details>'
        )
    body = f"""
<section class="notice info"><strong>矩阵说明：</strong>这里聚合 <strong>{len(reading_rows)}</strong> 条课程 reading 记录。每一行都保留原链接、主题、优先级和现有中文注释；重复出现在多个讲次的资料已按 URL 合并。注释仅重述课程资料中可支持的定位，不替代论文全文。</section>
<section><div class="section-head"><h2>先读这些必读资料</h2><p>用于搭建可迁移的概念骨架。</p></div><ol class="source-list">{must_html}</ol></section>
<section><div class="section-head"><h2>按技术模块浏览</h2><p>展开一个模块后即可离线查看学习定位与课程位置。</p></div>{"".join(category_html)}</section>
<section class="notice"><strong>精读纪律：</strong>每篇论文至少写出输入/输出、训练信号、核心假设、主要 baseline、评测指标和一个失败模式。若本页标记“需回到原文确认”，不要把题目或博客转述误当成论文结论。</section>
"""
    return page("How2AI 论文与资料矩阵", "将课程 readings 按主题聚合，离线保留优先级、阅读定位和回到原文的链接。", body, "papers")


def build_catalog(records: list[dict]) -> str:
    rows = []
    for record in records:
        categories = " / ".join(record["categories"]) or "未归入课程模块"
        kinds = " / ".join(record["kinds"]) or "外部参考"
        note = record["notes"][0] if record["notes"] else "索引项：未在本地资料中保留完整中文摘要，请按来源和题名决定是否打开原文。"
        origins = ", ".join(record["origins"])
        search = " ".join([record["title"], record["domain"], categories, kinds, note, origins]).lower()
        rows.append(
            f'<tr data-search="{esc(search)}" data-category="{esc(categories)}"><td>{link(record["url"], record["title"])}</td><td>{esc(record["domain"])}<br><span class="small">{esc(kinds)}</span></td><td>{esc(categories)}<br><span class="pill">{priority_label(record["priority"])}</span></td><td>{esc(note)}</td><td class="small">{esc(origins)}</td></tr>'
        )
    domain_counts = Counter(record["domain"] for record in records)
    category_counts = Counter(category for record in records for category in record["categories"])
    top_domains = " · ".join(f"{esc(domain)} ({count})" for domain, count in domain_counts.most_common(8))
    category_options = "".join(
        f'<option value="{esc(category)}">{esc(category)}（{count}）</option>'
        for category, count in sorted(category_counts.items())
    )
    body = f"""
<section class="notice info"><strong>完整性：</strong>本页收录来自已有课程报告、阅读矩阵、schedule 和专题指南的 <strong>{len(records)}</strong> 个唯一 URL；全部条目均有技术类别、中文学习定位和阅读优先级。分类与说明用于离线学习导航，不代表对原网页内容的完整镜像或长期可访问性。</section>
<section><div class="section-head"><h2>离线来源索引</h2><p>{top_domains}</p></div><div class="filter-grid"><input class="filter" id="filter" type="search" placeholder="筛选题名、域名、类型或本地注释"><select class="filter" id="category" aria-label="按技术类别筛选"><option value="">全部技术类别（{len(records)}）</option>{category_options}</select></div><p id="count" class="small">显示 {len(records)} 项。</p><div class="table-wrap"><table class="catalog-table" id="catalog"><thead><tr><th>题名 / 链接</th><th>来源</th><th>课程分类</th><th>本地学习定位</th><th>在何处收录</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div></section>
<section class="notice"><strong>证据边界：</strong>论文说明来自课程注释、论文摘要或已复核的源页综述；课件、视频和 Notebook 使用课程讲次上下文定位。无法可靠确认的方法细节仍会明确提示回到原文，不从题名臆测实验结论。</section>
<script>
const filter = document.getElementById('filter');
const category = document.getElementById('category');
const rows = [...document.querySelectorAll('#catalog tbody tr')];
const count = document.getElementById('count');
function applyFilters() {{
  const query = filter.value.trim().toLowerCase();
  const selected = category.value;
  let visible = 0;
  rows.forEach((row) => {{
    const match = row.dataset.search.includes(query) && (!selected || row.dataset.category.includes(selected));
    row.hidden = !match;
    if (match) visible += 1;
  }});
  count.textContent = `显示 ${{visible}} 项。`;
}}
filter.addEventListener('input', applyFilters);
category.addEventListener('change', applyFilters);
</script>
"""
    return page("全部外部链接索引", "用题名、域名、主题和本地阅读状态检索所有已保留来源；页面本身可离线使用。", body, "catalog")


def read_schedule() -> list[dict]:
    return json.loads((ROOT / "schedule.json").read_text(encoding="utf-8"))


def read_readings() -> list[dict[str, str]]:
    with (ROOT / "reading_matrix.csv").open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def read_karpathy_repos() -> list[dict]:
    if not KARPATHY_REPOS_SNAPSHOT.exists():
        raise FileNotFoundError(
            f"Missing Karpathy GitHub snapshot: {KARPATHY_REPOS_SNAPSHOT}"
        )
    data = json.loads(KARPATHY_REPOS_SNAPSHOT.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Karpathy GitHub snapshot must be a JSON array")
    return data


def read_ai_toolkit_snapshots() -> tuple[dict, dict]:
    for path in (AI_TOOLKIT_REPO_SNAPSHOT, AI_TOOLKIT_TREE_SNAPSHOT):
        if not path.exists():
            raise FileNotFoundError(f"Missing AI Toolkit snapshot: {path}")
    repo = json.loads(AI_TOOLKIT_REPO_SNAPSHOT.read_text(encoding="utf-8"))
    tree = json.loads(AI_TOOLKIT_TREE_SNAPSHOT.read_text(encoding="utf-8"))
    if not isinstance(repo, dict):
        raise ValueError("AI Toolkit repository snapshot must be a JSON object")
    if not isinstance(tree, dict) or not isinstance(tree.get("tree"), list):
        raise ValueError("AI Toolkit tree snapshot must contain a tree array")
    return repo, tree


def read_kaggle_genai_course() -> dict:
    if not KAGGLE_GENAI_SNAPSHOT.exists():
        raise FileNotFoundError(
            f"Missing Kaggle GenAI course snapshot: {KAGGLE_GENAI_SNAPSHOT}"
        )
    course = json.loads(KAGGLE_GENAI_SNAPSHOT.read_text(encoding="utf-8"))
    if not isinstance(course, dict) or not isinstance(course.get("days"), list):
        raise ValueError("Kaggle GenAI course snapshot must contain a days array")
    if len(course["days"]) != 5:
        raise ValueError("Kaggle GenAI course snapshot must contain five course days")
    return course


def read_bilibili_agent_architecture() -> dict:
    if not BILIBILI_AGENT_SNAPSHOT.exists():
        raise FileNotFoundError(
            f"Missing Bilibili Agent architecture snapshot: {BILIBILI_AGENT_SNAPSHOT}"
        )
    agent = json.loads(BILIBILI_AGENT_SNAPSHOT.read_text(encoding="utf-8"))
    if not isinstance(agent, dict) or not isinstance(agent.get("chapters"), list):
        raise ValueError("Bilibili Agent architecture snapshot must contain chapters")
    if not isinstance(agent.get("transcript", {}).get("blocks"), list):
        raise ValueError("Bilibili Agent architecture snapshot must contain transcript blocks")
    return agent


def read_stanford_cs336() -> dict:
    if not CS336_SNAPSHOT.exists():
        raise FileNotFoundError(
            f"Missing {CS336_SNAPSHOT}. Run tools/build_cs336_snapshot.py first."
        )
    snapshot = json.loads(CS336_SNAPSHOT.read_text(encoding="utf-8"))
    coverage = snapshot.get("coverage", {})
    if coverage.get("schedule_lecture_count") != 19:
        raise ValueError("Stanford CS336 snapshot must contain 19 scheduled lectures")
    if coverage.get("assignment_count") != 5:
        raise ValueError("Stanford CS336 snapshot must contain five assignments")
    return snapshot


def normalized_ai_toolkit_snapshot(repo: dict, tree: dict) -> dict:
    license_info = repo.get("license") or {}
    architecture = [
        {
            **item,
            "url": f'{AI_TOOLKIT_REPO_URL}/blob/main/{item["path"]}',
        }
        for item in AI_TOOLKIT_ARCHITECTURE_FILES
    ]
    return {
        "snapshot_date": AI_TOOLKIT_SNAPSHOT_DATE,
        "repository": {
            "name": repo.get("full_name", "ostris/ai-toolkit"),
            "url": repo.get("html_url", AI_TOOLKIT_REPO_URL),
            "description": repo.get("description"),
            "default_branch": repo.get("default_branch"),
            "language": repo.get("language"),
            "license": license_info.get("spdx_id") if isinstance(license_info, dict) else None,
            "stars": repo.get("stargazers_count"),
            "forks": repo.get("forks_count"),
            "open_issues_and_pull_requests": repo.get("open_issues_count"),
            "created_at": repo.get("created_at"),
            "updated_at": repo.get("updated_at"),
            "pushed_at": repo.get("pushed_at"),
        },
        "tree_sha": tree.get("sha"),
        "tree_truncated": bool(tree.get("truncated")),
        "tree_item_count": len(tree.get("tree", [])),
        "supported_model_count": len(AI_TOOLKIT_SUPPORTED_MODELS),
        "supported_models": AI_TOOLKIT_SUPPORTED_MODELS,
        "config_example_count": len(ai_toolkit_config_examples(tree)),
        "config_examples": ai_toolkit_config_examples(tree),
        "learning_stages": AI_TOOLKIT_LEARNING_STAGES,
        "architecture_files": architecture,
        "config_sections": AI_TOOLKIT_CONFIG_SECTIONS,
        "notebooks": [
            {
                "path": path,
                "url": f"{AI_TOOLKIT_REPO_URL}/blob/main/{path}",
            }
            for path in (
                "notebooks/FLUX_1_dev_LoRA_Training.ipynb",
                "notebooks/FLUX_1_schnell_LoRA_Training.ipynb",
                "notebooks/SliderTraining.ipynb",
            )
        ],
        "warnings": [
            "模型支持范围和精确依赖版本来自 2026-07-15 README 快照，后续可能变化。",
            "示例配置中的 24GB、量化、cache、学习率和采样参数只适用于其指明的模型与环境。",
            "GitHub API 的 open_issues_count 可能同时包含 issues 与 pull requests。",
            "训练中断应避开 checkpoint 写入时刻，并验证上一 checkpoint 的可恢复性。",
            "README 中标为 experimental 的平台或模型不应在未验证前进入生产。",
        ],
    }


def build_readme(
    records: list[dict],
    reading_rows: list[dict[str, str]],
    schedule: list[dict],
    karpathy_repos: list[dict],
    ai_toolkit_repo: dict,
    ai_toolkit_tree: dict,
    kaggle_course: dict,
    bilibili_agent: dict,
    cs336_course: dict,
) -> str:
    kaggle_words = sum(day["transcript_word_count"] for day in kaggle_course["days"])
    kaggle_frames = sum(len(day["frames"]) for day in kaggle_course["days"])
    return f"""# AI / CV / AIGC 离线学习知识库

生成日期：{KARPATHY_SNAPSHOT_DATE}

## 打开方式

直接在浏览器打开 `index.html`。页面没有外部脚本、字体或图像依赖，断网时仍可阅读全部本地总结、课程讲次、论文矩阵与来源索引。

## 内容范围

- 13 个直接来源：MIT MAS.S60 How2AI、Vincent Generative AI Diffusion、Caltech CS 159、Stanford CS25、Stanford CS336、Lil'Log、Transformer Taxonomy、Thinking Machines Connectionism、Labelbox Blog、Andrej Karpathy GitHub、Ostris AI Toolkit、Kaggle 5-Day Gen AI Intensive、AI Agent 架构趋势及演进。
- {len(schedule)} 个 How2AI 课程节点，包含 date、week、topic、subtopics、slides/video 与 readings。
- {len(CS25_LECTURES)} 个 Stanford CS25 V6 讲次及 {len(CS25_RECORDINGS)} 个精选录播入口。
- {cs336_course["coverage"]["schedule_lecture_count"]} 个 Stanford CS336 讲次、{cs336_course["coverage"]["assignment_count"]} 个实现作业、{cs336_course["coverage"]["local_lecture_material_count"]} 份本地 lecture 文件、{cs336_course["coverage"]["captioned_video_count"]} 场含字幕录播和 {cs336_course["coverage"]["transcript_word_count"]:,} 词清洗英文字幕。
- {len(karpathy_repos)} 个 Karpathy GitHub 公开仓库快照，其中 {sum(not repo.get("fork") for repo in karpathy_repos)} 个非 fork 项目进入统一知识主线。
- {len(AI_TOOLKIT_SUPPORTED_MODELS)} 个 AI Toolkit README 支持模型条目、{len(ai_toolkit_config_examples(ai_toolkit_tree))} 个自动提取的示例配置和 {len(ai_toolkit_tree.get("tree", []))} 个仓库树节点。
- {len(kaggle_course["days"])} 场 Kaggle GenAI Intensive 直播、{format_seconds(kaggle_course["playlist"]["total_duration_seconds"])} 总时长、{kaggle_words:,} 词去重英文自动逐字稿和 {kaggle_frames} 张教学关键帧。
- 1 场无页面字幕的 Agent 架构视频，包含本地 720p 视频、{len(bilibili_agent["chapters"])} 个技术章节、{bilibili_agent["transcript"]["cleaned_character_count"]:,} 个清洗转写字符和 {len(bilibili_agent["frames"])} 张幻灯片关键帧。
- {len(reading_rows)} 条课程 reading 记录，按 URL 聚合进 `papers.html`。
- {len(records)} 个唯一外部 URL，完整保留在 `catalog.html` 和 `data/source_catalog.json`。
- {len(records)}/{len(records)} 个条目均有技术类别、中文学习定位和阅读优先级，可按七大知识模块离线筛选。
- 全部条目进一步唯一合并到 8 层知识主线：研究方法、数据与表征、架构、基础模型、多模态、生成、Agent、运行时与评测。
- 3 份已有中文长报告的本地副本：How2AI、Diffusion、LLM Reasoning/Agents。

## 离线与版权边界

本库主要保存原创中文学习笔记、课程结构、阅读定位和来源元数据，而不是第三方论文、博客或 Google Drive 文档的全文镜像。Stanford CS336 的公开官方讲义/作业仓库与 YouTube 自动字幕另做了带 commit/来源记录的本地快照；外链在联网时用于追溯原始出处，断网时仍可使用课程地图、源码、课件与清洗字幕。

对不能从课程标题或可见页面可靠判断的论文贡献，索引保持“需回到原文确认”的阅读状态，不补造结论。博客中的具体实验数据或产品指标应被理解为作者在特定设置下的报告，不应直接泛化。

## 数据文件

- `data/how2ai_schedule.json`：课程讲次的结构化副本。
- `data/stanford_cs25_schedule.json`：Stanford CS25 V6 讲次、讲者、摘要、工程价值与资料链接。
- `data/stanford_cs336.json`：Stanford CS336 课程、19 讲、5 个作业、仓库 commit、录播/字幕、六模块技术主线和 8 周计划。
- `stanford_cs336.html` / `cs336_transcripts.html`：CS336 全生命周期学习地图与 18 场可搜索清洗英文字幕。
- `transcripts/stanford_cs336/`：逐讲 Markdown 清洗稿；官方课件、作业仓库和原始 VTT 位于 `../tools/data/stanford_cs336_source/`。
- `data/karpathy_repositories.json`：Karpathy 仓库快照、学习轨道、状态、优先级与中文学习定位。
- `data/ai_toolkit_repository.json`：AI Toolkit 仓库元数据、支持模型、示例配置、架构文件、学习阶段与证据边界。
- `data/kaggle_genai_course.json`：Kaggle 五日课程元数据、中文综述、章节、配套资料、字幕块和关键帧索引。
- `kaggle_genai.html` / `kaggle_genai_transcripts.html`：课程学习地图与可搜索完整逐字稿。
- `transcripts/kaggle_genai/` / `data/kaggle_genai/subtitles/`：逐讲 Markdown 清洗稿与原始 VTT 自动字幕。
- `data/bilibili_agent_architecture.json`：Agent 架构视频的章节、分层、技术判断、实验、资源、关键帧和分钟级转写。
- `agent_architecture.html` / `agent_architecture_transcript.html`：企业 Agent 架构学习页与可搜索 Whisper 中文稿。
- `transcripts/bilibili_agent_architecture.md` / `data/bilibili_agent/`：Markdown 清洗稿、Whisper VTT 与转写审计数据。
- `data/reading_matrix.csv`：原有阅读矩阵的离线副本。
- `data/source_catalog.json`：全部链接的机器可读索引。
- `data/knowledge_clusters.json`：按统一技术主线合并后的完整知识卡与依赖关系。
"""


def main() -> None:
    schedule = read_schedule()
    reading_rows = read_readings()
    karpathy_repos = read_karpathy_repos()
    ai_toolkit_repo, ai_toolkit_tree = read_ai_toolkit_snapshots()
    kaggle_course = read_kaggle_genai_course()
    bilibili_agent = read_bilibili_agent_architecture()
    cs336_course = read_stanford_cs336()
    records = collect_records(
        schedule,
        reading_rows,
        karpathy_repos,
        ai_toolkit_repo,
        ai_toolkit_tree,
        kaggle_course,
        bilibili_agent,
        cs336_course,
    )
    knowledge_clusters = build_knowledge_clusters(records)
    normalized_repos = normalized_karpathy_repos(karpathy_repos)

    OUT.mkdir(exist_ok=True)
    DATA.mkdir(exist_ok=True)
    kaggle_asset_dir = OUT / "assets" / "kaggle_genai"
    kaggle_subtitle_dir = DATA / "kaggle_genai" / "subtitles"
    kaggle_transcript_dir = OUT / "transcripts" / "kaggle_genai"
    cs336_transcript_dir = OUT / "transcripts" / "stanford_cs336"
    bilibili_asset_dir = OUT / "assets" / "bilibili_agent"
    bilibili_data_dir = DATA / "bilibili_agent"
    transcript_dir = OUT / "transcripts"
    kaggle_asset_dir.mkdir(parents=True, exist_ok=True)
    kaggle_subtitle_dir.mkdir(parents=True, exist_ok=True)
    kaggle_transcript_dir.mkdir(parents=True, exist_ok=True)
    cs336_transcript_dir.mkdir(parents=True, exist_ok=True)
    bilibili_asset_dir.mkdir(parents=True, exist_ok=True)
    bilibili_data_dir.mkdir(parents=True, exist_ok=True)
    transcript_dir.mkdir(parents=True, exist_ok=True)
    for stale_asset in bilibili_asset_dir.iterdir():
        if stale_asset.is_file():
            stale_asset.unlink()

    (OUT / "index.html").write_text(build_index(records), encoding="utf-8")
    (OUT / "knowledge_path.html").write_text(build_knowledge_path(records), encoding="utf-8")
    (OUT / "sources.html").write_text(build_sources(), encoding="utf-8")
    (OUT / "how2ai.html").write_text(build_how2ai(schedule, reading_rows), encoding="utf-8")
    (OUT / "stanford_cs25.html").write_text(build_cs25(), encoding="utf-8")
    (OUT / "stanford_cs336.html").write_text(build_cs336(cs336_course), encoding="utf-8")
    (OUT / "cs336_transcripts.html").write_text(
        build_cs336_transcripts(cs336_course), encoding="utf-8"
    )
    (OUT / "karpathy.html").write_text(build_karpathy(karpathy_repos), encoding="utf-8")
    (OUT / "ai_toolkit.html").write_text(
        build_ai_toolkit(ai_toolkit_repo, ai_toolkit_tree), encoding="utf-8"
    )
    (OUT / "kaggle_genai.html").write_text(
        build_kaggle_genai(kaggle_course), encoding="utf-8"
    )
    (OUT / "kaggle_genai_transcripts.html").write_text(
        build_kaggle_transcripts(kaggle_course), encoding="utf-8"
    )
    (OUT / "agent_architecture.html").write_text(
        build_bilibili_agent(bilibili_agent), encoding="utf-8"
    )
    (OUT / "agent_architecture_transcript.html").write_text(
        build_bilibili_agent_transcript(bilibili_agent), encoding="utf-8"
    )
    (OUT / "papers.html").write_text(build_papers(reading_rows), encoding="utf-8")
    (OUT / "catalog.html").write_text(build_catalog(records), encoding="utf-8")
    (OUT / "README.md").write_text(
        build_readme(
            records,
            reading_rows,
            schedule,
            karpathy_repos,
            ai_toolkit_repo,
            ai_toolkit_tree,
            kaggle_course,
            bilibili_agent,
            cs336_course,
        ),
        encoding="utf-8",
    )

    (DATA / "how2ai_schedule.json").write_text(
        json.dumps(schedule, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (DATA / "stanford_cs25_schedule.json").write_text(
        json.dumps(CS25_LECTURES, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (DATA / "stanford_cs336.json").write_text(
        json.dumps(cs336_course, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (DATA / "karpathy_repositories.json").write_text(
        json.dumps(
            {
                "profile_url": "https://github.com/karpathy",
                "snapshot_date": KARPATHY_SNAPSHOT_DATE,
                "repository_count": len(normalized_repos),
                "owned_repository_count": sum(not repo["is_fork"] for repo in normalized_repos),
                "repositories": normalized_repos,
                "extra_resources": [
                    {
                        "title": "microgpt: dependency-free GPT training and inference",
                        "url": MICROGPT_GIST_URL,
                        "priority": "must-read",
                        "track": "语言建模与 Tokenization",
                    }
                ],
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    (DATA / "ai_toolkit_repository.json").write_text(
        json.dumps(
            normalized_ai_toolkit_snapshot(ai_toolkit_repo, ai_toolkit_tree),
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    (DATA / "kaggle_genai_course.json").write_text(
        json.dumps(kaggle_course, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    for day in kaggle_course["days"]:
        transcript_path = kaggle_transcript_dir / f'day{day["day"]:02d}.md'
        transcript_path.write_text(
            build_kaggle_transcript_markdown(day), encoding="utf-8"
        )
        subtitle_source = ROOT / day["raw_vtt_source_path"]
        shutil.copy2(
            subtitle_source,
            kaggle_subtitle_dir / f'day{day["day"]:02d}.en-orig.vtt',
        )
        for frame in day["frames"]:
            shutil.copy2(ROOT / frame["source_path"], kaggle_asset_dir / frame["file"])
    for lecture in cs336_course["lectures"]:
        if lecture.get("video"):
            (cs336_transcript_dir / f'lecture_{lecture["number"]:02d}.md').write_text(
                build_cs336_transcript_markdown(lecture), encoding="utf-8"
            )
    (DATA / "bilibili_agent_architecture.json").write_text(
        json.dumps(bilibili_agent, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (transcript_dir / "bilibili_agent_architecture.md").write_text(
        build_bilibili_agent_markdown(bilibili_agent), encoding="utf-8"
    )
    shutil.copy2(BILIBILI_AGENT_TRANSCRIPT, DATA / "bilibili_agent_whisper_raw.json")
    shutil.copy2(
        ROOT / bilibili_agent["ingestion"]["raw_vtt_path"],
        bilibili_data_dir / "BV1ADWCzrEXL.whisper-large-v3.vtt",
    )
    for frame in bilibili_agent["frames"]:
        shutil.copy2(ROOT / frame["source_path"], bilibili_asset_dir / frame["file"])
    (DATA / "source_catalog.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (DATA / "knowledge_clusters.json").write_text(
        json.dumps(knowledge_clusters, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    shutil.copy2(ROOT / "reading_matrix.csv", DATA / "reading_matrix.csv")

    copies = {
        "report.html": "how2ai_full_report.html",
        "diffusion_technical_report.html": "diffusion_full_guide.html",
        "llm_reasoning_transformer_study_guide.html": "reasoning_full_guide.html",
    }
    for source, destination in copies.items():
        shutil.copy2(ROOT / source, OUT / destination)

    print(
        json.dumps(
            {
                "output": str(OUT),
                "lectures": len(schedule),
                "stanford_cs25_lectures": len(CS25_LECTURES),
                "stanford_cs336_lectures": cs336_course["coverage"]["schedule_lecture_count"],
                "stanford_cs336_assignments": cs336_course["coverage"]["assignment_count"],
                "stanford_cs336_captioned_videos": cs336_course["coverage"]["captioned_video_count"],
                "stanford_cs336_transcript_words": cs336_course["coverage"]["transcript_word_count"],
                "karpathy_repositories": len(karpathy_repos),
                "ai_toolkit_models": len(AI_TOOLKIT_SUPPORTED_MODELS),
                "ai_toolkit_config_examples": len(ai_toolkit_config_examples(ai_toolkit_tree)),
                "kaggle_genai_days": len(kaggle_course["days"]),
                "kaggle_genai_transcript_words": sum(
                    day["transcript_word_count"] for day in kaggle_course["days"]
                ),
                "kaggle_genai_frames": sum(
                    len(day["frames"]) for day in kaggle_course["days"]
                ),
                "bilibili_agent_chapters": len(bilibili_agent["chapters"]),
                "bilibili_agent_transcript_characters": bilibili_agent["transcript"]["cleaned_character_count"],
                "bilibili_agent_frames": len(bilibili_agent["frames"]),
                "reading_rows": len(reading_rows),
                "unique_urls": len(records),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
