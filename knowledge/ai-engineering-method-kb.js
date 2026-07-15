(function () {
  "use strict";

  window.AI_ENGINEERING_METHOD_KB = [
    {
      id: "ai-from-scratch-vertical-slice",
      domain: "AI 工程学习",
      title: "用可运行的纵向切片理解 LLM，而不是背组件名",
      tags: ["LLM", "LLMs-from-scratch", "Transformer", "PyTorch", "从零实现"],
      summary: "把文本、token、移位标签、因果注意力、Transformer block、词表 logits、交叉熵、生成和微调串成一条可执行因果链；每一步都检查形状、信息边界和损失目标。",
      mentorUse: "学习 LLM 时，我会要求每章留下一个可运行产物、一个断言或对照实验、一个仍无法解释的问题；先让最小模型和单 batch 正确工作，再增加现代架构与规模。",
      questions: ["每个张量的形状和语义是什么？", "模型是否通过未来信息或数据泄漏获得虚假低损失？", "修改组件后，哪组固定输入和指标可以证明影响？"],
      source: "rasbt/LLMs-from-scratch",
      sourceUrl: "https://github.com/rasbt/LLMs-from-scratch"
    },
    {
      id: "ai-karpathy-debug-single-batch-first",
      domain: "AI 训练工程",
      title: "训练神经网络先过拟合单 batch，再观察内部统计",
      tags: ["Karpathy", "神经网络调试", "梯度", "单batch"],
      summary: "先确认数据和标签，再让最小模型过拟合一个 batch；同时检查预期初始损失、激活分布、梯度分布和参数更新比例。若最小闭环不成立，扩大数据和模型只会放大不可见错误。",
      mentorUse: "训练不收敛时，我会先关闭增强与复杂正则、固定随机种子、检查单 batch 能否拟合，再逐层比较激活、梯度和 update/data ratio；通过后才恢复完整训练。",
      questions: ["一个 batch 能否被模型拟合？", "初始损失是否接近可推导基线？", "哪一层最先出现饱和、梯度异常或更新失衡？"],
      source: "Andrej Karpathy YouTube: micrograd, makemore, GPT-2 reproduction",
      sourceUrl: "https://www.youtube.com/@AndrejKarpathy/videos"
    },
    {
      id: "ai-karpathy-tokenizer-diagnostic",
      domain: "AI 训练工程",
      title: "把 Tokenizer 当成独立训练的压缩层和故障源",
      tags: ["Karpathy", "Tokenizer", "BPE", "特殊token"],
      summary: "Tokenizer 有自己的训练数据、BPE 合并规则、regex 边界和特殊 token 协议。它决定模型看到的原子单位、序列长度和成本，也会造成拼写、计数、多语言碎片化与提示注入边界问题。",
      mentorUse: "遇到字符串、拼写、数字、中文、代码或成本异常时，我会先检查 encode/decode round-trip、token 数、跨语言压缩率和特殊 token 权限，再判断是否是模型推理问题。",
      questions: ["相同语义在不同语言中需要多少 token？", "encode/decode 是否严格往返？", "用户输入能否被误解析为受信特殊 token？"],
      source: "Let's build the GPT Tokenizer / karpathy/minbpe",
      sourceUrl: "https://www.youtube.com/watch?v=zduSFxRajkE"
    },
    {
      id: "ai-karpathy-llm-capability-layers",
      domain: "AI 系统设计",
      title: "区分参数知识、上下文、推理计算与外部工具",
      tags: ["Karpathy", "LLM系统", "上下文", "工具调用"],
      summary: "模型参数保存训练形成的统计模式，上下文承载当前工作记忆，生成 token 提供串行计算轨迹，工具负责检索、计算与行动。能力失败要定位到对应层，而不是统一换更大模型。",
      mentorUse: "设计助手时，我会把失败分为缺知识、缺上下文、推理链不足、工具不可用或权限失控，并分别用检索、任务契约、推理预算、工具验证和人工确认修复。",
      questions: ["失败来自参数、上下文、推理还是工具？", "增加 token 是否真的改善私有评测，而非只让答案更长？", "工具结果和高风险动作在哪里被校验？"],
      source: "Deep Dive into LLMs like ChatGPT",
      sourceUrl: "https://www.youtube.com/watch?v=7xTGNNLPyMI"
    },
    {
      id: "ai-video-learning-evidence-pipeline",
      domain: "AI 学习工程",
      title: "学习视频时先建时间轴证据，再提炼观点",
      tags: ["视频学习", "Whisper", "关键帧", "来源追溯", "知识库"],
      summary: "先追溯官方来源并检查人工字幕；没有字幕时以本地 ASR 生成时间戳文本，再用覆盖抽帧和场景关键帧核对公式、图表、代码和演示。完整转写只作中间证据，最终笔记分开事实、讲者判断、个人推断、边界和行动。",
      mentorUse: "收到视频后，我会先记录标题、作者、日期、时长和字幕类型；按 5-10 分钟建立内容骨架，抽查专有名词和数字，并只保留补充语义的关键帧。入库前与现有方法卡去重，搜索和来源链接通过后才完成。",
      questions: ["当前文本来自人工字幕、自动字幕还是 ASR？", "哪条结论同时得到原声、画面或一手资料中的两类证据？", "哪些内容只是讲者预测或我的推断？"],
      source: "本机无字幕视频学习流水线实测",
      sourceUrl: "https://www.bilibili.com/video/BV1bm421W7N6/"
    },
    {
      id: "ai-kaiming-conditional-distribution-contract",
      domain: "生成模型",
      title: "先把生成任务写成条件分布，再选择模型",
      tags: ["何恺明", "生成模型", "条件分布", "Diffusion", "FlowMatching"],
      summary: "把任务写成 p(x|y)：y 是条件、约束或较抽象的信息，x 是更具体、可能存在多个合理答案的输出；同时写清数据、表征、分布差异目标、优化器、采样器和评测，再比较 VAE、GAN、自回归、扩散或 Flow Matching。",
      mentorUse: "设计生成产品时，我会先填写条件、输出、多解性、排序标准、数据、目标、采样和失败条件，并建立判别式或确定性基线。若任务是固定小标签且不需要多解，就不为生成式表达承担额外延迟与评测成本。",
      questions: ["y 和 x 分别是什么？", "有效输出有多少种，怎样判断谁更可信？", "一个更简单的判别式或确定性基线是否已经够用？"],
      source: "Kaiming He - Deep Learning Day: Generative Modeling",
      sourceUrl: "https://www.youtube.com/watch?v=2yJSoaGU2i4"
    },
    {
      id: "ai-scaling-curve-inductive-bias-audit",
      domain: "AI 研究方法",
      title: "用缩放曲线审计能力和归纳偏置",
      tags: ["JasonWei", "HyungWonChung", "缩放律", "归纳偏置", "BitterLesson"],
      summary: "总体损失平滑下降时，单项能力仍可能停滞、突变或非单调；任何新方法至少比较多个数据量、模型量或计算量点。结构是在当前预算下的捷径，应登记其假设、收益区间和移除信号，避免今天的优化成为明天的瓶颈。",
      mentorUse: "评估新模块时，我会画小/中/大三个规模点，按任务拆分曲线并寻找竞争子任务；每个专用结构都写明现在为何需要、何时饱和、什么证据支持移除。开放任务还会避免只用唯一参考答案作为目标和评测。",
      questions: ["总体指标是否掩盖了某个子任务的突变或退化？", "当前结构解决的是永久约束还是暂时计算不足？", "扩大规模后，收益继续、饱和还是反转？"],
      source: "Stanford CS25 V4 - Jason Wei & Hyung Won Chung",
      sourceUrl: "https://www.youtube.com/watch?v=3gb-ZkVRemQ"
    },
    {
      id: "ai-openclaw-local-agent-control-plane",
      domain: "AI 产品与治理",
      title: "个人 Agent 的壁垒在记忆、工具完成率和权限控制",
      tags: ["OpenClaw", "个人Agent", "LocalFirst", "Memory", "权限"],
      summary: "个人 Agent 会吸收部分数据录入、提醒和跨应用编排界面，但不会消灭传感器、系统记录、可视化协作和合规控制。产品壁垒不只是模型，而是可迁移记忆、连接可靠性、任务完成率、最小权限、审计、人工确认与回滚。",
      mentorUse: "构建个人助手时，我会先选一个高频、低风险、可验收的端到端任务；记忆用可读文件和索引管理，动作按身份、范围和风险分级。发送、付款、删除、发布和持久配置修改必须人工确认，并持续记录完成率、接管率、严重错误率、留存和成本。",
      questions: ["用户真正需要的是新界面，还是跨系统完成结果？", "哪些数据和动作必须留在本地或受人工审批？", "任务完成率、人工接管率和严重错误率分别是多少？"],
      source: "Y Combinator - OpenClaw Creator: Why 80% Of Apps Will Disappear",
      sourceUrl: "https://www.youtube.com/watch?v=4uzGDAoNOZc"
    },
    {
      id: "ai-transformer-six-layer-design-audit",
      domain: "AI 架构研究",
      title: "比较 Transformer 时按六层拆解，不把模型名当技术解释",
      tags: ["Transformer", "模型架构", "预训练", "后训练", "推理优化", "系统增强"],
      summary: "把模型拆成基础模型、架构、预训练、后训练、推理采样和系统增强六层；分别记录数据、计算、目标、实现、评测与时效。模型名和参数量只是这些选择的打包标签，不能单独解释能力、成本或可靠性。",
      mentorUse: "比较模型或阅读论文时，我会填写六层表，标出每个差异的证据披露程度、收益条件和代价；再用同一组私有任务实测质量、延迟、吞吐、成本和严重错误，避免把架构、训练数据、后训练和工具收益混为一谈。",
      questions: ["当前差异属于六层中的哪一层？", "结论来自论文实验、作者推测还是产品表现？", "在相同任务、硬件和推理预算下，差异是否仍成立？"],
      source: "机器之心 / kipply - Transformer Taxonomy",
      sourceUrl: "https://mp.weixin.qq.com/s/uBv8t2hd0WS4aAqUuAyBhw"
    },
    {
      id: "ai-social-signal-primary-source-gate",
      domain: "AI 研究与信息管理",
      title: "把社交网络当发现雷达，不把影响力当证据",
      tags: ["信息源", "X", "网络信号", "一手来源", "事实核验"],
      summary: "粉丝数、被可信账号关注和网络中心性可以降低发现成本，却不能证明履历、主张或内容质量。社交帖子只进入候选队列；涉及模型能力、论文结论、产品变更和投资判断时，必须回到论文、代码、官方文档、原始数据或当事人完整表述。",
      mentorUse: "建立分主题账号列表后，我会把每条高价值帖子记录为线索，补齐日期、原始链接、主张、证据类型和反证；只有完成一手核验且能改变当前行动的内容，才提升为知识卡或行动证据。每月按命中率、纠错率和行动价值淘汰低信号来源。",
      questions: ["这条内容是线索、解释还是一手证据？", "影响力指标是否掩盖了种子偏差、陈旧资料或利益冲突？", "过去一个月该来源有几次真正改变了判断或行动？"],
      source: "MIT Bunny - AI Influencers on X",
      sourceUrl: "https://x.mitbunny.ai/"
    }
  ];
})();
