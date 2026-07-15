window.PHOTOGRAPHY_MENTOR_TAXONOMY = {
  generatedAt: "2026-07-14",
  version: "2026.07.14-reviewed",
  title: "Photography Mentor Canonical Knowledge Map",
  model: "原子知识卡保留来源与细节；同类卡归并为主知识节点；本机资料作为深读索引挂接到阶段。",
  spine: "意图与边界 -> 捕获输入 -> 画面组织 -> 计算与显影 -> 题材实践 -> 编辑与表达 -> 管理、交付与溯源",
  stats: {
    canonicalCards: 62,
    localReferenceCards: 12,
    mergedClusters: 22,
    stages: 7
  },
  stages: [
    {
      id: "intent",
      order: 1,
      title: "意图与边界",
      question: "为什么拍，允许改变什么？",
      summary: "先确定任务、主题、学习阶段和真实性边界。技术选择只有放回用途、受众与伦理语境才有意义。",
      outcome: "形成一句主题、一个用途说明和一份处理边界。",
      localCardIds: ["local-00-reading-map", "local-08-history-theory-culture"],
      clusters: [
        {
          id: "mentor-learning-system",
          title: "Mentor 方法与学习闭环",
          summary: "摄影学习不是收集参数，而是识别任务、检索依据、执行单变量练习、评片并更新下一轮短板。Agent 负责帮助判断，不替用户做审美盖章。",
          principles: ["先分清评片、拍摄、后期、计算摄影或学习路线", "建议必须能追溯到来源并转成练习", "按会拍、会修、会看、会表达逐级推进"],
          practice: "选择一个真实问题，写成“现象、目标、一个变量、成功标准、复盘问题”五行训练卡。",
          query: "Mentor RAG 学习路径 刻意练习 SYBJ 来源边界",
          cardIds: ["agent-rag-structure", "agent-mentor-boundary", "learning-four-stages", "deliberate-constraint-practice", "sybj-login-boundary", "sybj-public-entry-map"]
        },
        {
          id: "editing-ethics-boundary",
          title: "后期与 AI 使用边界",
          summary: "后期尺度取决于纪实、比赛、商业和个人创作语境。像素优化、局部移除、结构重建和新增内容不是同一级改变，AI 参与程度应按用途记录和披露。",
          principles: ["先读当前项目或比赛规则", "保留原始文件与可回退版本", "可能误导受众的改变要明确披露"],
          practice: "把同一照片的基础调整、移除元素和生成扩图版本并列，分别写出允许用途与披露方式。",
          query: "后期尺度 AI修图 披露 纪实 比赛 商业 真实",
          cardIds: ["post-ethics-scale", "ai-editing-disclosure"]
        }
      ]
    },
    {
      id: "capture",
      order: 2,
      title: "捕获输入",
      question: "怎样记录足够可靠的光学与曝光信息？",
      summary: "先获得清楚、曝光合理且符合运动意图的输入。镜头、机位、对焦、快门和光线共同决定后续上限。",
      outcome: "能区分曝光、对焦、运动、景深和光线造成的失败。",
      localCardIds: ["local-01-foundations", "local-02-camera-lens-technique"],
      clusters: [
        {
          id: "exposure-metering-signal",
          title: "曝光、测光、动态范围与信噪比",
          summary: "光圈、快门和 ISO 是亮度、景深、运动与噪声之间的取舍；测光表只是估算，直方图和高光警告用于确认信息是否被记录。噪声首先是信号不足问题。",
          principles: ["曝光先服务不可妥协的视觉目标", "明暗场景需要主动修正测光偏差", "优先提高有效信号，再决定降噪"],
          practice: "对白墙、黑布和高反差窗口分别做三档曝光，记录直方图、裁切与后期恢复空间。",
          query: "曝光 光圈 快门 ISO 测光 直方图 动态范围 噪点 信噪比",
          cardIds: ["exposure-triangle", "histogram-dynamic-range", "metering-exposure-compensation", "noise-snr-denoise"]
        },
        {
          id: "optics-focus-motion",
          title: "镜头、透视、对焦、景深与运动",
          summary: "焦段改变视角，机位决定透视；对焦模式要匹配主体运动；景深有衍射代价；防抖只能补相机位移，不能冻结主体。",
          principles: ["先选机位和拍摄距离，再选焦段", "把失焦、主体运动和相机抖动分开诊断", "小光圈、快门与 ISO 要共同权衡"],
          practice: "同一主体完成不同机位焦段、三档快门和单次/连续对焦三组对照，统计真正清晰的比例。",
          query: "焦段 透视 对焦 景深 衍射 防抖 主体运动 滚动快门",
          cardIds: ["lens-viewpoint-perspective", "focus-af-tracking", "depth-of-field-diffraction", "motion-stabilization-rolling-shutter"]
        },
        {
          id: "light-control",
          title: "自然光、闪光与白平衡",
          summary: "光线方向塑造形体，光源大小决定软硬，光比决定注意力。闪光要与环境光分开控制；白平衡先建立可信基准，再决定保留何种情绪色。",
          principles: ["先找光，再安排主体与背景", "闪光方向应像一个合理光源", "校正色偏和创造色调是两个步骤"],
          practice: "同一人物用窗边侧光、逆光、无闪光、直闪和跳闪拍摄，统一肤色后比较形体和情绪。",
          query: "自然光 侧光 逆光 硬光 软光 闪光 TTL 环境光 白平衡",
          cardIds: ["light-quality-direction", "flash-ambient-balance", "white-balance-color-intent"]
        }
      ]
    },
    {
      id: "visual",
      order: 3,
      title: "画面组织",
      question: "怎样让观众看见你真正想表达的东西？",
      summary: "构图不是套规则，而是安排主体、视觉层级、空间和色彩，使最强视觉信号服务主题。",
      outcome: "能从主体、边缘、层级、空间和色彩五个维度解释构图。",
      localCardIds: ["local-03-composition-light-color", "local-11-imported-notes"],
      clusters: [
        {
          id: "intent-frame-control",
          title: "主体、主题与画框边缘",
          summary: "先用一句话明确主题，再检查四个边角、主体轮廓和背景干扰。很多构图问题通过移动半步、等待动作或改变拍摄高度解决。",
          principles: ["主体回答拍什么，主题回答为什么拍", "四边扫描与主体轮廓同样重要", "现场移动通常优于事后强裁切"],
          practice: "同一地点拍 20 张，每次按快门前检查主题、四角和主体轮廓，保留三组移动前后对照。",
          query: "主体 主题 构图 边缘 背景 轮廓 减法",
          cardIds: ["intent-subject-theme", "frame-edges-background-control"]
        },
        {
          id: "hierarchy-balance-space",
          title: "视觉层级、平衡与空间",
          summary: "观众会被亮度、清晰度、颜色、尺度和语义吸引，并用接近、相似、连续与图底关系组织画面。平衡不等于对称，空间感来自遮挡、透视和空气层次。",
          principles: ["最亮、最锐、最饱和处应服务主题", "用视觉重量建立平衡或张力", "前中后景必须增加信息而非堆叠装饰"],
          practice: "为 10 张照片标记第一眼、第二眼和离开画面的路径，再重拍其中一张改变视觉重量。",
          query: "视觉层级 视线路径 平衡 张力 Gestalt 图底 层次 空间",
          cardIds: ["visual-hierarchy-path", "balance-tension", "gestalt-separation", "depth-layering"]
        },
        {
          id: "color-contrast-memory",
          title: "色彩层级、对比与记忆点",
          summary: "色彩组织先确定主色、辅助色和强调色，再用冷暖、明度与饱和度建立层次。视觉或内容冲突能产生记忆点，但必须支持主题。",
          principles: ["先统一色彩关系，再局部强调", "饱和度不是越高越有情绪", "对比应带来信息或感受，而不是噱头"],
          practice: "从一组照片提取主色、辅助色和强调色，删除或压低一个不服务主题的高饱和区域。",
          query: "色彩 主色调 冷暖 饱和度 明度 对比 冲突 情绪",
          cardIds: ["color-hierarchy", "contrast-conflict"]
        }
      ]
    },
    {
      id: "compute",
      order: 4,
      title: "计算与显影",
      question: "相机和软件如何把捕获数据变成最终图像？",
      summary: "理解传感器采样、RAW 管线、多帧合成、HDR 显示和局部后期，才能判断问题发生在捕获、算法还是输出。",
      outcome: "能沿捕获、采样、合成、显影、局部调整和输出逐层定位问题。",
      localCardIds: ["local-10-computational-imaging", "local-07-post-workflow"],
      clusters: [
        {
          id: "sensor-raw-pipeline",
          title: "传感器采样与 RAW 图像管线",
          summary: "有效细节由镜头、运动、衍射、传感器采样、色彩滤阵、去马赛克、色彩变换、降噪和锐化共同决定。RAW 是可干预的数据起点，不是直接可看的唯一真相。",
          principles: ["像素数量不等于真实细节", "每一步处理都可能增加信息可见性或制造伪影", "判断前先定位问题所在管线阶段"],
          practice: "对同一 RAW 使用两套不同默认显影，比较颜色、纹理、噪点和锐化，并标注差异来自哪一步。",
          query: "传感器 采样 像素 Bayer 去马赛克 RAW ISP 图像管线",
          cardIds: ["raw-camera-pipeline", "sensor-sampling-resolution"]
        },
        {
          id: "multiframe-hdr-computation",
          title: "多帧、计算 RAW、虚化与 HDR 显示",
          summary: "手机会对齐并合并多帧来扩展动态范围、降低噪声或估计深度。ProRAW 保留计算处理后的调整空间；Ultra HDR 用增益图适配 SDR 与 HDR 显示。",
          principles: ["计算摄影依赖多帧输入质量和运动一致性", "算法虚化与光学景深的失败模式不同", "HDR 捕获、文件格式与 HDR 显示是三层问题"],
          practice: "同一高反差动态场景比较普通、HDR、夜景和 RAW/ProRAW，检查鬼影、边缘、噪点与高光显示。",
          query: "HDR 多帧 夜景 人像虚化 深度 ProRAW Ultra HDR 增益图",
          cardIds: ["burst-hdr-computation", "computational-portrait-depth", "proraw-computational-raw", "ultra-hdr-gain-map"]
        },
        {
          id: "detail-denoise-sharpen",
          title: "AI 降噪、超分辨率与锐化",
          summary: "降噪、超分辨率和锐化都在重新分配纹理与边缘。学习型工具可能推断不存在的细节，因此应在最终尺寸检查伪影，并按用途区分观看优化与证据保真。",
          principles: ["先降噪再决定锐化强度", "统一输出尺寸比较，不只看百分百放大", "纪实与证据用途要保留原始链路"],
          practice: "对一张高 ISO 图做传统与 AI 降噪，再分别锐化，盲测头发、文字、树叶与皮肤纹理。",
          query: "AI降噪 超分辨率 锐化 纹理 边缘 伪影 细节",
          cardIds: ["ai-denoise-upscale-boundary", "sharpening-detail"]
        },
        {
          id: "global-local-development",
          title: "全局校正、局部塑形与通透感",
          summary: "后期先完成镜头、白平衡、曝光和整体影调，再用图层或蒙版解决局部问题。通透感来自合理黑白场、色偏控制、主体清晰和空间层次，不等于提高所有对比。",
          principles: ["每个调整都要对应一个画面问题", "局部处理应服务层级而非暴露工具痕迹", "保留可撤销、可比较的非破坏结构"],
          practice: "只用基础校正、整体影调和三个以内局部蒙版重修一张照片，逐步截图说明每一步目的。",
          query: "后期 全局 局部 图层 蒙版 通透 影调 黑白场",
          cardIds: ["post-global-local", "layers-masks", "clarity-transparency"]
        }
      ]
    },
    {
      id: "genre",
      order: 5,
      title: "题材实践",
      question: "怎样把共同原理迁移到具体场景？",
      summary: "题材不是新的参数表，而是对时机、关系、风险、布光和交付的不同组合。先掌握共同原则，再进入专项。",
      outcome: "选择一个主线题材，完成从计划、拍摄到复盘的小项目。",
      localCardIds: ["local-04-portrait-wedding-children", "local-05-landscape-travel-documentary", "local-06-commercial-still-product"],
      clusters: [
        {
          id: "landscape-night-panorama",
          title: "风光、星空与全景",
          summary: "自然景观依赖天气、时间、机位与动态范围计划；星空增加月相、对焦和堆栈；全景则要求控制近景视差、重叠与跨帧一致性。",
          principles: ["拍摄前完成时间、天气和机位预案", "高反差先优化捕获再考虑合成", "多张技术必须控制移动、接缝与真实性说明"],
          practice: "为一个地点制作日照、天气、机位和失败预案，并完成单张、包围曝光或全景中的一种对照。",
          query: "风光 天气 机位 星空 银河 堆栈 全景 视差 包围曝光",
          cardIds: ["landscape-planning-weather", "astro-night-stack", "panorama-parallax-workflow"]
        },
        {
          id: "portrait-event-people",
          title: "人像、婚礼与活动",
          summary: "人物摄影先找光、背景和关系，再处理姿态与表情。不可重来的活动还需要流程预判、关键人物覆盖、备用设备和现场数据安全。",
          principles: ["肤色、眼神光和人物状态优先", "先保证安全画面，再寻找关系与反应", "关键时刻必须有设备和机位替代方案"],
          practice: "用自然光和跳闪完成同一人物两组照片，再为一次模拟活动写 10 个必拍与 3 个失败预案。",
          query: "人像 自然光 肤色 姿态 婚礼 活动 流程 双机 闪光",
          cardIds: ["portrait-natural-light", "event-wedding-moment-system"]
        },
        {
          id: "street-documentary-mobile",
          title: "街头、纪实与手机摄影",
          summary: "街头摄影在混乱中寻找秩序和关系；纪实还要保证说明、过程和后期不误导。手机计算能力很强，但拍摄纪律仍来自等待、移动和明确主题。",
          principles: ["先观察结构，再等待动作进入", "记录拍摄者介入程度与事实说明", "不要让自动 HDR 替代对光线和背景的判断"],
          practice: "在同一路口停留 30 分钟，用手机只拍一个主题，最终选 3 张并补齐准确说明。",
          query: "城市 街头 纪实 手机 秩序 决定性瞬间 说明 真实性",
          cardIds: ["city-street-order", "documentary-caption-ethics", "mobile-shooting-discipline"]
        },
        {
          id: "architecture-commercial-macro",
          title: "建筑、商业静物与微距",
          summary: "控制型题材强调机位、透视、材质、色准、可重复布光和交付规格。微距进一步放大景深、抖动、衍射和堆栈伪影。",
          principles: ["先确认用途、规格和不可妥协信息", "反光与透视优先在现场解决", "固定流程和布光记录保证系列一致"],
          practice: "选择建筑空间或商品完成主图、结构图和细节图三张，并记录机位、灯位、颜色与输出规格。",
          query: "建筑 室内 垂直线 商业 静物 商品 材质 微距 堆栈",
          cardIds: ["architecture-interior-control", "commercial-still-life-brief", "macro-closeup-control"]
        }
      ]
    },
    {
      id: "edit",
      order: 6,
      title: "编辑与表达",
      question: "怎样从一次拍摄得到成立的单张、组照和作品集？",
      summary: "拍摄完成后，通过分轮选片、接触表、评片、风格拆解和序列编辑，把偶然命中变成可解释的表达。",
      outcome: "完成一组 9-12 张作品、顺序和简短项目陈述。",
      localCardIds: ["local-09-magazines-portfolios", "local-08-history-theory-culture"],
      clusters: [
        {
          id: "culling-contact-critique",
          title: "分轮选片、接触表与评片",
          summary: "选片先排除技术失败，再比较表达，最后看系列贡献。接触表暴露摄影者的决策过程；评片要分事实、意图、效果和改法。",
          principles: ["不同轮次只使用一个筛选标准", "比较相邻帧能看见真正的决定", "反馈最终必须落到一次重拍或重修"],
          practice: "把 100 张缩到 30、12、6 张并输出接触表，为每轮删除写下唯一理由。",
          query: "选片 旗标 星级 接触表 评片 事实 意图 效果 改法",
          cardIds: ["ingest-cull-rating-system", "contact-sheet-review", "critique-framework"]
        },
        {
          id: "style-analysis",
          title: "风格拆解与方法迁移",
          summary: "风格不是滤镜，而是题材、距离、视角、光线、色彩、节奏、后期和长期选择的组合。模仿应拆方法并迁移到自己的主题。",
          principles: ["用多张作品找稳定模式", "区分表面效果与拍摄条件", "练习后必须回到自己的题材与意图"],
          practice: "拆解一位摄影师 20 张作品，形成题材、焦段、机位、光线、色彩、后期和情绪矩阵。",
          query: "风格 模仿 大师作品 拆解 题材 焦段 光线 色彩 后期",
          cardIds: ["style-study"]
        },
        {
          id: "sequence-portfolio",
          title: "组照顺序与作品集一致性",
          summary: "组照通过开场、环境、人物、细节、转折和收束建立节奏。作品集服务明确受众，展示持续判断力，而不是把所有最佳单片堆在一起。",
          principles: ["相邻照片必须推进信息或形成转场", "单张再强也要服从整体语气", "项目陈述解释问题意识，不替画面讲完故事"],
          practice: "从 20 张排出 9 张的三个版本：时间顺序、视觉节奏和主题推进，请陌生观看者复述他们读到的内容。",
          query: "组照 序列 节奏 转场 作品集 一致性 选片 项目陈述",
          cardIds: ["sequence-rhythm-transitions", "portfolio-edit-coherence"]
        }
      ]
    },
    {
      id: "deliver",
      order: 7,
      title: "管理、交付与溯源",
      question: "怎样让作品长期可找、可恢复、可正确显示并可验证来源？",
      summary: "完整工作流以目录、元数据和备份保护资产，以色彩管理和输出版本保证交付，以内容凭证和处理记录提升透明度。",
      outcome: "建立可恢复的影像目录、四种输出预设和一份来源说明。",
      localCardIds: ["local-07-post-workflow", "local-00-reading-map"],
      clusters: [
        {
          id: "catalog-metadata-backup",
          title: "目录、元数据与备份",
          summary: "目录保存文件引用、调整指令和元数据，不等于照片原件。EXIF、IPTC 和 XMP 支持查找、说明与署名；目录、原片和成片必须分别备份并真实演练恢复。",
          principles: ["在管理软件内移动和重命名文件", "元数据应支持查找、理解和权属说明", "备份要跨设备并定期验证恢复"],
          practice: "随机选择一个旧项目，在不依赖工作盘的条件下恢复目录、原片和最终成片，并记录缺口。",
          query: "Lightroom 目录 元数据 EXIF IPTC XMP 关键词 备份 恢复",
          cardIds: ["catalog-nondestructive-workflow", "metadata-keywords-rights", "backup-originals-catalog-exports"]
        },
        {
          id: "color-proof-export",
          title: "色彩管理、软打样与多用途输出",
          summary: "从相机、显示器到打印机，各设备通过色彩空间与配置文件解释颜色。保留高质量母版，再按网页、审片、继续编辑和打印生成不同版本。",
          principles: ["校准显示环境并嵌入正确配置", "打印前用目标纸张配置软打样", "在真实目标设备检查尺寸、颜色和锐化"],
          practice: "为同一张照片输出网页、手机、继续编辑和打印四个版本，记录色彩空间、格式、尺寸和锐化。",
          query: "色彩管理 ICC sRGB Adobe RGB 软打样 打印 母版 导出",
          cardIds: ["color-management-output", "soft-proof-print-output", "master-export-variants"]
        },
        {
          id: "provenance-content-credentials",
          title: "内容凭证与来源验证",
          summary: "C2PA 内容凭证记录可验证的创建和编辑声明，帮助追踪媒体经历了什么，但不能自动证明画面语境或叙事为真。溯源、事实核查和伦理判断必须同时存在。",
          principles: ["保留原始文件和处理记录", "验证凭证签名、链路与缺失环节", "凭证存在不替代事实与语境核查"],
          practice: "用验证工具检查一张带内容凭证的图片，列出凭证能回答和不能回答的问题。",
          query: "C2PA Content Credentials 内容凭证 溯源 签名 编辑历史",
          cardIds: ["content-credentials-provenance"]
        }
      ]
    }
  ]
};
