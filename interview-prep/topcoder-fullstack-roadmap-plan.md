# Topcoder Fullstack：从路线图到可交付产品的学习路线

> 目标：把一张“大而全”的 Web 技术地图压缩成可验证的全栈交付能力，而不是再收藏一套平行课程。默认用于 Fullstack、Frontend、Backend、AI Product Engineer 岗；通用 ML/CV 岗仅在项目证据薄弱时激活。

## 定位

这条路线服务 K7 软件编码与 K8 系统设计：你要能从一次用户操作追踪到浏览器、网络、API、业务逻辑、数据库和响应，再证明它经过测试、安全审计、监控与可回滚发布。最终产物是一个可答辩的纵向切片，不是课程完成截图。

- **核心价值**：原生 HTML/CSS/JavaScript、浏览器原理、Git、Docker、Node/Express、REST、数据库、React/Next.js 与项目实践被放在同一张图上，适合建立前后端贯通感。
- **默认取舍**：TypeScript 严格模式、关系模型与 PostgreSQL、自动化测试、安全、可访问性、性能、可观测性和 CI/CD 补入核心主线。
- **非默认内容**：Three.js、GSAP、Spline、Dora、WebAssembly、Pyodide、Socket.IO 和云服务只有在岗位或作品目标命中时才激活。
- **时间边界**：8 个核心 Session 约 8–12 小时，capstone 另需 6–12 小时；它替换一次泛化系统设计和多个随机 demo，不叠加到六周预算上。

## 来源快照与证据边界

2026-07-24 审计的 [Topcoder Fullstack Roadmap](https://topcoderfullstack.com/roadmap) 是嵌入式 XMind。页面显示约一年前更新，并以六个月训练营为背景；主干覆盖 HTML/CSS/JavaScript、浏览器、Git/GitHub、Docker、Node/Express、REST/Socket.IO、MongoDB/Firebase、React/Next.js，以及 Three.js/GSAP 等视觉方向。关联的[项目页](https://topcoderfullstack.com/projects)列出 40 多个项目示例。

边界判断：它适合做主题发现与项目灵感，不是版本化技术规范，也不能凭“做过 demo”证明生产能力。框架/API 事实分别回到 [MDN Learn](https://developer.mozilla.org/en-US/docs/Learn_web_development)、[TypeScript 文档](https://www.typescriptlang.org/docs/)、[Node.js Learn](https://nodejs.org/en/learn)、[React Learn](https://react.dev/learn)、[Next.js Docs](https://nextjs.org/docs)、[Express 文档](https://expressjs.com/en/starter/installing.html)与相应版本的官方资料核验。

路线图明显弱化或缺失的生产主题由本路线补齐：[PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)所代表的关系建模、约束与事务，[Playwright](https://playwright.dev/docs/intro)端到端测试，[OWASP Top 10](https://owasp.org/www-project-top-ten/)安全风险，以及 [Docker Get Started](https://docs.docker.com/get-started/)和 [GitHub Actions](https://docs.github.com/en/actions)交付链。MongoDB/Firebase 不是默认答案；应由访问模式、一致性、事务和运维约束决定。

## 去重后的依赖图

```text
FS-0 缺口审计
  ↓
FS-1 浏览器与原生 Web ──→ FS-2 TypeScript + Git 契约
                                 ↓
                         FS-3 Node/Express API
                                 ↓
                         FS-4 数据模型与事务
                                 ↓
                         FS-5 React/Next 边界
                                 ↓
                         FS-6 测试、安全与发布
                                 ↓
                         FS-7 Capstone 答辩
```

已有 AlgoNote/Handbook 继续训练算法与编码沟通；现有 S 模块继续训练 ML 系统设计；Harness Engineering 继续训练 Agent 可读仓库。本路线只负责通用 Web 产品从界面到发布的缺口。

## 8 个核心 Session

### FS-0 · 30 分钟：缺口审计与纵向切片

- 闭卷画出一个现有项目的 Browser → HTTP → API → Service → DB → Response 路径；标出 auth、validation、test、log、deploy 和 rollback。
- 从项目页只选一个能暴露真实缺口的题材；推荐把现有 Learning OS 扩展为“面试证据服务”，不要复制多个 landing page。
- 产物：一张当前图、一张目标图、最多三个本周缺口。没有缺口的主题直接跳过。
- 过关：每个框都有输入/输出、失败模式和 owner；不能只列技术名词。

### FS-1 · 75 分钟：浏览器与原生 Web 契约

- 用语义化 HTML 构建表单与结果区；仅靠键盘可完成主流程，错误提示可被辅助技术读取。
- 用 Flex/Grid 完成响应式布局；解释 cascade、specificity、layout/paint/composite 与性能后果。
- 追踪 event loop、microtask/macrotask、Fetch、HTTP method/status/header/cache/CORS；为慢网、重复提交和取消请求设计状态。
- 产物：无框架页面、事件时序图、网络失败表和一个性能预算。
- 过关：在禁用 JavaScript、慢网、键盘操作和服务端 4xx/5xx 下都有确定行为。

### FS-2 · 60 分钟：TypeScript 与 Git 契约

- 开启 strict；为 domain、API DTO、validated input 和 error 建立不同类型，不用 `any` 掩盖边界。
- 运行时数据必须经 schema validation；类型系统不能代替外部输入检查。
- 用小提交、feature branch、PR 描述和可重复命令保存决策；最小 CI 执行 lint、typecheck 和 test。
- 产物：类型边界图、一条失败的类型/运行时反例、可审阅 PR。
- 过关：能解释编译期与运行时保证的边界，并从失败 CI 定位到最小修复。

### FS-3 · 90 分钟：Node/Express API 与协议语义

- 按 route/controller/service/repository 分离 HTTP、业务规则和存储；不是为了层数，而是让失败与测试边界清晰。
- 设计 REST resource、status code、统一错误体、validation、pagination、timeout、idempotency 和 request ID。
- 只有产品确实需要双向实时状态时才引入 Socket.IO，并定义重连、顺序、去重、背压和在线状态语义。
- 产物：OpenAPI/JSON schema、三条 contract test、错误目录和一条端到端 trace。
- 过关：重复请求、无效输入、依赖超时与部分失败不会产生未定义副作用。

### FS-4 · 90 分钟：关系建模、事务与存储取舍

- 默认用 PostgreSQL：从查询与不变量反推 table、key、constraint、index、transaction、migration 和 isolation。
- 用 `EXPLAIN` 或等价证据验证索引，不凭感觉添加；设计 forward/backward compatible migration 与失败恢复。
- 只有文档形态、水平扩展或实时同步需求明确时，才对照 MongoDB/Firebase；写出放弃关系约束的代价。
- 产物：ERD、DDL/migration、三条关键查询、事务失败测试和 SQL/NoSQL 决策记录。
- 过关：并发写入、重复提交、删除/级联、回滚和迁移中断都有可验证语义。

### FS-5 · 90 分钟：React/Next.js 的状态与渲染边界

- 先区分 local UI state、form state、server state 和 URL state，再决定是否需要状态库；不把 Redux、Zustand 全部列为必修。
- 画 component tree 与 ownership；设计 loading/error/empty/stale/optimistic/retry 状态。
- 使用 Next.js 时明确 server/client component、data fetching、cache/revalidation、auth 与 secret 的边界，不以“全栈框架”跳过协议设计。
- 产物：状态表、渲染边界图、表单/列表实现与网络异常测试。
- 过关：刷新、深链、重复点击、过期数据和服务端失败都不破坏数据一致性或可访问性。

### FS-6 · 120 分钟：测试、安全、可观测性与交付

- 测试金字塔至少包含 domain unit、API+DB integration 和一条 Playwright 关键旅程；测试行为契约，不锁死实现细节。
- 用威胁模型检查认证/授权、注入、XSS/CSRF、SSRF、secret、依赖、上传和日志泄露；高风险操作默认拒绝并保留审计。
- 定义 logs/metrics/traces、SLO、error budget、告警和 dashboard；关联 browser request ID、API span 与 DB query。
- 用 Docker/Compose 固化本地依赖；GitHub Actions 执行门禁；设计 migration 顺序、canary、feature flag、rollback 和 runbook。
- 产物：test matrix、threat model、trace 截图、CI 配置、Docker Compose、release/rollback checklist。
- 过关：能演示 injection/auth bypass、迁移失败、p95 回归中的至少两种，并用证据判断阻断或回滚。

### FS-7 · 2–4 小时：Interview Evidence Hub Capstone

- 做一个小而完整的功能：保存面试证据、按能力簇检索、记录复测结果或生成岗位缺口报告。先完成确定性 CRUD/查询；AI 总结只作可关闭增强。
- 纵向切片必须使用 strict TypeScript、React/Next 或原生前端、Node/Express、PostgreSQL、schema validation、自动化测试和容器化运行。
- 至少提交：架构图、API schema、ERD/migration、关键测试、威胁模型、性能预算、CI、runbook、发布与回滚记录。
- 录制 8 分钟答辩：目标 → baseline → 最难决策 → 一次失败 → 指标证据 → 安全/成本 → 发布/回滚 → 下一步。
- 过关：陌生人按 README 在 15 分钟内跑起；关键旅程可重放；你能回答“为什么不用更复杂方案”。

## 三个岗位选修

### FS-X1 · 视觉/3D 作品集

面向 Creative Developer、3D/CV 或个人 IP 展示：从 Three.js、GSAP、Spline、Dora 只选一种主实现路径。先设 LCP/帧率/内存与 reduced-motion 降级，再做模型加载、相机、光照和滚动动画；视觉效果不能牺牲可访问性与主流程。

### FS-X2 · WebAssembly / Pyodide 浏览器 ML

面向浏览器侧 CV/ML：比较 JavaScript、WebAssembly 与服务端推理的启动、拷贝、线程、SIMD、包体、缓存、隐私和兼容性。用真实 profiler 证明收益；不能用理论 FLOPs 代替端到端测量。

### FS-X3 · 实时与云扩展

面向协作、流式或高并发产品：在已有 REST baseline 上加入 Socket.IO、对象存储、队列/缓存或云部署。明确 delivery semantics、背压、顺序、重连、幂等、容量、成本和区域故障；没有需求证据时不添加组件。

## 嵌入现有六周计划

| 场景 | 激活方式 | 等量替换 |
| --- | --- | --- |
| Fullstack / Frontend / Backend / AI Product Engineer JD | 第 1 周 FS-0/1；第 3–4 周 FS-2/3/4；第 6 周 FS-5/6/7 | 一个泛化系统设计、多个随机 demo 和重复框架阅读 |
| 通用 AI/ML/CV 岗但项目只能讲模型 | 只做 FS-0、FS-3、FS-6 与 capstone 答辩 | 一个项目故事修订与一场重复白板 |
| 3D/CV/浏览器 ML 岗 | 核心路线后任选 FS-X1 或 FS-X2 | 同时长的作品集美化或论文泛读 |
| 不命中上述 JD 且已有生产 Web 证据 | 不激活，只在 mock 暴露缺口时查阅 | 不增加时间 |

每天仍遵循 Retrieve → Construct → Challenge → Reflect。阅读路线图不增加 mastery；只有代码、测试、trace、决策记录和延迟变式复测才算证据。

## 面试追问链

1. 用户重复点击“提交”时，从 UI 到数据库如何防止重复副作用？前端 disabled 为什么不够？
2. TypeScript 已经定义类型，为什么 API 入口仍需运行时 validation？错误应如何返回和观测？
3. 为什么默认 PostgreSQL，而不是路线图中的 MongoDB/Firebase？什么访问模式会让你改变选择？
4. React 的 local、server、URL state 分别由谁拥有？什么时候状态库反而增加一致性风险？
5. 一个请求 p95 从 180 ms 升到 900 ms，怎样用 browser timing、trace 和 query plan 二分定位？
6. migration 在一半实例已升级时失败，如何保持前后版本兼容并安全回滚？
7. 单元、集成和 E2E 各防什么风险？为什么“测试全绿”仍不证明授权正确？
8. 你选择的 3D/Wasm/实时技术解决了哪个可测问题？移除后产品指标会怎样变化？

## 完成定义

- [ ] 闭卷画出 Browser → API → Service → DB → Response，并标出 auth、validation、trace 和 failure。
- [ ] 一个 strict TypeScript 纵向切片可通过单元、集成和 E2E 测试。
- [ ] 数据库具有 constraint、transaction、migration 与并发/重复提交测试。
- [ ] 威胁模型覆盖最重要资产、信任边界、滥用路径与默认拒绝策略。
- [ ] 关键旅程有可访问性检查、性能预算、SLO 与跨层 trace。
- [ ] CI、容器、发布、迁移、回滚和 runbook 可被另一人重放。
- [ ] 8 分钟答辩包含个人决策、弃选、失败、指标和残余风险。
- [ ] D+7 在没有资料和 AI 帮助下完成一次故障注入或约束反转；这才计入可面试证据。
