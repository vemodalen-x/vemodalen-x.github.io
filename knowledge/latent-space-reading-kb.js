(function () {
  "use strict";

  window.LATENT_SPACE_READING_KB = [
    {
      id: "latent-reading-map-not-canon",
      domain: "AI 工程研究",
      title: "把阅读清单当地图，不当待背诵的权威目录",
      tags: ["论文阅读", "学习系统", "工程判断"],
      summary: "一份阅读清单的价值在于帮助定位问题空间；它不能替代自己的任务、证据和实验。每篇资料都应被改写成可验证的工程判断。",
      mentorUse: "当你说“我要读很多论文”时，我会先问：你要改善哪一个真实任务？然后把阅读收束为主张、证据、边界和最小实验。",
      questions: ["这篇资料解决的具体问题是什么？", "证据在我的任务上仍成立吗？", "半天到两天能完成的验证是什么？"],
      source: "The 2025 AI Engineer Reading List",
      sourceUrl: "https://www.latent.space/p/2025-papers"
    },
    {
      id: "latent-private-evals-over-public-score",
      domain: "AI 工程研究",
      title: "公开基准用于定位，私有评测集决定是否上线",
      tags: ["评测", "LLM", "回归测试"],
      summary: "公开榜单说明能力区间，无法替代真实工作流。建立覆盖正常、边界与不可接受错误的小型私有评测集，才能持续比较模型、提示词和检索方案。",
      mentorUse: "需要选模型或改提示词时，我会要求先定义 20 到 50 条代表任务和评分规则，再讨论主观体验。",
      questions: ["真实用户最在意的三类错误是什么？", "哪些题要求引用来源或明确说不知道？", "这次改动是否造成历史能力回归？"],
      source: "The 2025 AI Engineer Reading List",
      sourceUrl: "https://www.latent.space/p/2025-papers"
    },
    {
      id: "latent-rag-is-information-retrieval",
      domain: "AI 工程研究",
      title: "RAG 首先是信息检索系统",
      tags: ["RAG", "检索", "知识库"],
      summary: "RAG 的可靠性通常由资料清洗、切分、元数据、召回、重排和引用控制。向量、关键词和混合检索各有适用任务，不能只通过更换 embedding 模型解决问题。",
      mentorUse: "知识库答错时，我会先沿着“资料是否存在 -> 是否被召回 -> 上下文是否相关 -> 回答是否忠实”逐段定位，而不是直接换大模型。",
      questions: ["答案所需证据是否在库中？", "关键词、向量还是混合检索最容易命中？", "答案能否附上可核验的来源？"],
      source: "The 2025 AI Engineer Reading List",
      sourceUrl: "https://www.latent.space/p/2025-papers"
    },
    {
      id: "latent-context-contract-and-injection",
      domain: "AI 工程研究",
      title: "写清任务契约，并把外部上下文视为不可信数据",
      tags: ["提示词", "安全", "提示注入"],
      summary: "高质量提示词把输入范围、工具、输出结构、质量标准和失败方式说清楚。网页、文档和检索结果可能包含恶意指令，应被当作数据而非命令。",
      mentorUse: "设计助手时，我会帮助你先写任务契约：允许引用什么、如何引用、证据不足时怎么答、哪些动作必须人工确认。",
      questions: ["哪些指令只能来自可信系统或用户？", "证据不足时系统会怎样停止？", "写入、发送或支付是否需要明确确认？"],
      source: "The 2025 AI Engineer Reading List",
      sourceUrl: "https://www.latent.space/p/2025-papers"
    },
    {
      id: "latent-agents-are-evaluated-workflows",
      domain: "AI 工程研究",
      title: "把智能体视为可观测、可恢复、可评测的工作流",
      tags: ["智能体", "工作流", "工具调用"],
      summary: "智能体由模型、工具、状态、权限和停止条件构成。串行、路由、并行和循环不是默认升级项，只有在端到端评测改善后才值得增加。",
      mentorUse: "当自动化需求出现时，我会建议先做“获取证据 -> 生成草案 -> 人工确认”的确定性三步，再逐步引入自主决策。",
      questions: ["每一步的输入、输出和失败处理是什么？", "状态中断后能否恢复？", "如何记录一次失败以改进下一轮？"],
      source: "The 2025 AI Engineer Reading List",
      sourceUrl: "https://www.latent.space/p/2025-papers"
    },
    {
      id: "latent-codegen-needs-test-and-review",
      domain: "AI 工程研究",
      title: "代码生成之后，测试、审查和回滚才是工程",
      tags: ["代码生成", "测试", "软件工程"],
      summary: "看起来合理的代码可能无法运行、破坏边界或引入安全问题。代码助手应绑定仓库上下文、验收命令、静态检查、差异审查和可回滚提交。",
      mentorUse: "我会把“请生成代码”改写为带验收条件的任务：范围、不可改动项、测试命令、风险说明和最小补丁。",
      questions: ["成功由哪条测试或可见行为证明？", "是否有未覆盖的边界和安全风险？", "出错后如何回滚？"],
      source: "The 2025 AI Engineer Reading List",
      sourceUrl: "https://www.latent.space/p/2025-papers"
    },
    {
      id: "latent-modality-specific-evals",
      domain: "AI 工程研究",
      title: "视觉、语音与生成内容需要专项评测",
      tags: ["多模态", "视觉", "语音", "生成式AI"],
      summary: "多模态体验不能用单一分数概括。视觉要区分识别、定位、OCR 与理解；语音要测延迟、打断和关键字段；生成内容要测可控性、可复现性与素材来源。",
      mentorUse: "面对“模型能看图/能语音/能生图”的说法，我会帮助你把产品需求拆成可量化的子任务与失败样本。",
      questions: ["用户真正依赖的关键字段是什么？", "最糟的误识别是否可被检测？", "输出是否可复现并保留来源记录？"],
      source: "The 2025 AI Engineer Reading List",
      sourceUrl: "https://www.latent.space/p/2025-papers"
    },
    {
      id: "latent-qlora-separate-precision-layers",
      domain: "AI 工程研究",
      title: "QLoRA 把存储精度、计算精度与可训练参数分开",
      tags: ["QLoRA", "NF4", "LoRA", "显存"],
      summary: "QLoRA 用 4-bit NF4 保存冻结的基础权重，计算时反量化到 BF16，并只更新 LoRA 适配器；效率来自三个独立杠杆的组合，不能简化成“直接用 4 位做全参数训练”。",
      mentorUse: "当显存限制使稳定任务无法微调时，我会先比较 Base、Prompt、RAG 与 QLoRA，再用私有评测和峰值显存决定适配器是否值得保留；本机 24GB GPU 应先从 7B/8B 级模型验证。",
      questions: ["存储、计算和更新分别使用什么精度与参数？", "目标是改变行为，还是补充可更新事实？", "私有评测提升是否超过训练、部署和回归成本？"],
      source: "QLoRA: Efficient Finetuning of Quantized LLMs",
      sourceUrl: "https://arxiv.org/abs/2305.14314"
    },
    {
      id: "latent-finetune-last",
      domain: "AI 工程研究",
      title: "微调是最后的杠杆，不是第一反应",
      tags: ["微调", "LoRA", "数据质量"],
      summary: "微调适合稳定、重复且有高质量示例的任务。若问题来自检索、任务定义、工具可靠性或评测缺失，微调只会更昂贵地固化错误。",
      mentorUse: "我会先帮你排查提示词、上下文、检索、工具和模型选择；只有在私有评测显示稳定差距且数据可审计时，才建议小规模微调试验。",
      questions: ["任务是否足够稳定且规模足够大？", "训练样本是否高质量、可追溯、覆盖边界？", "基础模型对照和回滚方案是什么？"],
      source: "The 2025 AI Engineer Reading List",
      sourceUrl: "https://www.latent.space/p/2025-papers"
    },
    {
      id: "latent-read-to-experiment",
      domain: "AI 工程研究",
      title: "每周完成一个可证伪的 AI 工程实验",
      tags: ["实验", "学习路径", "复盘"],
      summary: "将模型、评测、提示词、RAG、智能体、代码、多模态和微调排成十二周路径；每周都交付一个小工件，而不是只新增收藏。",
      mentorUse: "我会把宽泛的学习目标收束成下一周可以验收的工件，例如 30 条评测题、检索对照表、三步工作流或微调决策备忘录。",
      questions: ["本周的最小交付物是什么？", "它会推翻哪一个假设？", "下周将依据什么数据继续或停止？"],
      source: "The 2025 AI Engineer Reading List",
      sourceUrl: "https://www.latent.space/p/2025-papers"
    }
  ];
})();
