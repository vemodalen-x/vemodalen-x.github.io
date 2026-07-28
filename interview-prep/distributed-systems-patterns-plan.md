# Martin Fowler 分布式系统模式：从目录到故障推理的学习路线

> 目标：不背模式名称，而是能在超时、重试、节点崩溃、网络分区、时钟偏差和并发写入下，说清楚系统要守住的不变量、采用的模式、得到的保证、付出的代价与验证方法。

## 定位

这条路线服务 K8 系统设计，也补强 K7 的状态机与故障测试。默认用于 Backend、Fullstack、Platform、Infra、Data、ML Platform、Agent Infra 岗；纯模型研究岗位只在系统设计失分时激活。

- **主线**：持久化日志 → 复制与共识 → 成员协调 → 时间/版本 → 分区 → 请求语义 → 跨节点原子性。
- **输出**：状态机、时序图、不变量表、故障矩阵、最小模拟器和一次 45 分钟系统设计答辩。
- **时间边界**：8 个核心 Session 约 9–12 小时；替换两次泛化系统白板和分布式术语泛读，不叠加六周总课时。
- **完成证据**：必须注入 crash、partition、delay、duplicate、reorder 或 clock skew；“正常路径能跑”不计完成。

## 来源快照与证据边界

2026-07-28 审计的 [Catalog of Patterns of Distributed Systems](https://martinfowler.com/articles/patterns-of-distributed-systems/)由 Unmesh Joshi 整理，页面日期为 2023-11-23。目录说明这些模式自 2020 年开始发布，2023 年结集成书；网页提供 30 个短摘要，深入内容主要链接到 O’Reilly 书籍章节。

因此本路线把网页当作**模式导航图**，不是完整教材、形式化证明或生产系统规范。Paxos 回查 Lamport 的[原始论文](https://lamport.azurewebsites.net/pubs/lamport-paxos.pdf)；复制状态机练习使用 [Raft 论文](https://raft.github.io/raft.pdf)建立 leader election、log replication 与 safety 的可实现结构；时钟边界参考 [Spanner/TrueTime 论文](https://research.google/pubs/spanner-googles-globally-distributed-database/)，去中心化版本与故障权衡参考 [Dynamo 论文](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)。

目录没有系统覆盖 Raft、线性一致性定义、FLP/失败检测器、fencing token、consistent hashing、anti-entropy、CRDT、Saga/transactional outbox、circuit breaker、load shedding、背压、可观测性与 Jepsen 风格历史验证。它们是相邻缺口，不应错误地声称“学完 30 个模式就学完分布式系统”。

## 30 个模式如何聚成 7 个问题簇

### A · 状态如何在崩溃后恢复

**Write-Ahead Log、Segmented Log、High-Water Mark、Low-Water Mark、Versioned Value。** 先追加持久化记录，再更新派生状态；用 segment 管理大日志，用 high-water 区分已复制/可见边界，用 low-water 决定安全回收范围，用版本值支持历史读取或冲突判断。

追问：`fsync` 在哪里？ack 前后崩溃分别看到什么？high-water 是 replicated、committed 还是 applied？日志截断、快照和恢复怎样保持不变量？

### B · 多副本如何对同一顺序达成一致

**Leader and Followers、Majority Quorum、Paxos、Replicated Log、Follower Reads。** 多数派交集帮助防止两个分区独立决定；共识决定日志中的值与顺序；确定性状态机按同一顺序执行。Follower read 提升吞吐/延迟，却必须明确 staleness、read-your-writes 与线性一致读取的边界。

追问：五节点能容忍多少 crash-stop 故障？旧 leader 恢复后为何不能继续写？“复制到多数派”“committed”“applied”“client 收到响应”是同一时刻吗？

### C · 节点如何发现彼此并协调职责

**Consistent Core、Emergent Leader、Gossip Dissemination、HeartBeat、Lease、State Watch。** Heartbeat 只能产生怀疑，不能证明远端已死；gossip 用概率传播换扩展性；lease 用有界时间租约协调；watch 把轮询改成状态通知；小型 consistent core 可集中保存关键协调状态。

追问：网络慢与节点死如何区分？lease 到期但旧持有者仍在运行怎么办？仅靠 wall clock 能否防 stale writer？通知丢失或 watch 重连后怎样补状态？

### D · 事件如何排序并识别并发更新

**Clock-Bound Wait、Generation Clock、Hybrid Clock、Lamport Clock、Version Vector。** Generation/term 拒绝旧世代操作；Lamport clock表达 happens-before 的可排序信息但不能还原真实时间；hybrid clock结合物理时间与逻辑单调性；version vector识别因果先后与并发分支；clock-bound wait 只有在时钟不确定度有可靠上界时才成立。

追问：总排序、因果偏序和真实时间分别解决什么？两个 vector 不互相支配意味着什么？NTP 跳变、暂停进程或不可信时钟会破坏哪个假设？

### E · 数据如何分布并保持可路由

**Fixed Partitions、Key-Range Partitions。** 固定逻辑分区使扩缩容只改变 partition → node 映射；key range 支持范围查询，但易产生热点和不均衡。两者都需要 placement metadata、迁移协议、双写/读切换边界和故障恢复。

追问：节点数改变为何不应让所有 key 重新取模？partition 数选错有什么长期代价？热点 key、顺序写和大租户怎样处理？迁移中请求去旧节点还是新节点？

### F · 网络不确定时请求如何只产生一次业务效果

**Idempotent Receiver、Request Batch、Request Pipeline、Request Waiting List、Single-Socket Channel、Singular Update Queue。** 超时无法告诉客户端“未执行”还是“响应丢失”；幂等接收端用 client/request identity 与保存的结果吸收重复。单连接/单更新队列可以建立局部顺序，batch/pipeline 改变吞吐与延迟，waiting list 跟踪尚未满足响应条件的请求。

追问：exactly-once 是传输保证还是业务效果？dedupe 记录与副作用怎样原子提交？key 重用、TTL 过期、并发重复、响应缓存和队列重放分别如何处理？

### G · 多资源更新如何保持原子决定

**Two-Phase Commit。** Prepare 阶段让参与者持久化承诺并持锁，Commit/Abort 阶段传播最终决定。它解决原子提交，不等于复制共识；协调者不可用时参与者可能阻塞，恢复依赖稳定日志和协议状态。

追问：participant 在 prepared 后崩溃怎么办？coordinator 在决定后、通知前崩溃怎么办？为什么 2PC 不能自动替代 Saga/outbox，Paxos/Raft 也不能自动替代业务事务？

## 三条判断轴

每个模式都用同一张卡片回答：

| 判断轴 | 必须写清楚 | 常见错误 |
| --- | --- | --- |
| 保证 | safety 不变量、liveness 条件、读写可见性、durability/ordering 范围 | 只说“高可用、强一致” |
| 故障模型 | crash-stop/recovery、消息丢失/重复/乱序、partition、clock uncertainty；是否排除 Byzantine | 把 timeout 当作失败证明 |
| 作用域与代价 | 单请求、单 key、单 shard、复制日志或跨资源事务；延迟、吞吐、存储、恢复与运维成本 | 把局部顺序说成全局顺序 |

没有写出“什么时候不保证”的模式卡不算合格。

## 8 个核心 Session

### PDS-0 · 45 分钟：系统与故障模型基线

- 选择现有 Interview Evidence Hub、任务队列或模型发布控制面，画 client、节点、网络、磁盘和时钟边界。
- 闭卷定义 safety、liveness、durability、availability、linearizability 与 eventual convergence；不会的先暴露，不急着补名词。
- 产物：一张系统图、三条不变量、故障模型和“本系统明确不处理什么”。
- 过关：每个 timeout 都保留“执行成功但响应丢失”的可能，不把 crash 与 partition 混为一谈。

### PDS-1 · 75 分钟：从 WAL 到恢复边界

- 实现 append-only WAL + 内存状态机；启动时 replay。加入 checksum/length，检测 torn/truncated tail。
- 把日志切成 segment；定义 high-water、applied index、low-water 和 snapshot 的不同含义。
- 注入：ack 前崩溃、ack 后状态页未落盘、最后一条记录截断、恢复过程中再次崩溃。
- 产物：恢复状态机、四个 index 的不变量和自动化故障测试。
- 过关：已确认写入不会因派生状态未刷盘而丢失；不能安全删除的日志绝不被 low-water 回收。

### PDS-2 · 120 分钟：多数派、Leader 与复制日志

- 用三或五节点模拟器实现 term/generation、leader、append、majority ack、commitIndex 与 lastApplied；不要求生产级 Paxos/Raft。
- 画出 leader crash、stale leader、follower lag、日志分叉与恢复；明确 quorum intersection 如何守住 safety。
- 比较 leader read、follower read、lease/read-index 类路径的延迟与一致性，禁止只写“读从库”。
- 产物：复制日志 trace、五节点故障表、读取语义决策和一次 8 分钟讲解。
- 过关：少数派不能提交新值；任何 applied 的同一 index 不会出现不同 command；知道 timing 只应影响可用性而非 safety。

### PDS-3 · 75 分钟：Heartbeat、Gossip、Lease 与 Watch

- 设计 membership 状态 `alive → suspect → dead/left`，分别定义证据、超时和恢复；对比中央 registry 与 gossip。
- 为 lease 加 generation/fencing token；旧持有者即使恢复或暂停结束，也不能覆盖新持有者。
- 为 state watch 设计 initial snapshot、revision、断线重连、事件缺口与 resync。
- 产物：成员状态机、lease/fencing 时序图、watch recovery contract。
- 过关：能处理 GC pause、单向 partition、重复通知和 stale writer，而不是靠更长 timeout 掩盖问题。

### PDS-4 · 90 分钟：Lamport、Hybrid 与 Version Vector

- 为一组三节点事件计算 Lamport clock；指出它能表达的 happens-before 和不能证明的并发/真实时间。
- 实现 version-vector compare：before、after、equal、concurrent；为 concurrent 分支定义 merge、保留 siblings 或人工解决。
- 用 clock skew 场景比较 wall-clock timestamp、hybrid clock 与 clock-bound wait；所有物理时间方案都写出不确定度来源。
- 产物：事件图、vector compare 测试、时钟选型表与一个反例。
- 过关：不会用“较大 timestamp 一定更新”覆盖未建立因果关系的写入。

### PDS-5 · 75 分钟：分区、迁移与读语义

- 比较 fixed partitions 与 key-range partitions；为 hash point lookup、range scan、热点和扩容选择方案。
- 设计 `stable → copying → dual/read-old → cutover → cleanup` 迁移状态机，并用 generation 拒绝旧 placement 写入。
- 加入 follower lag、read-your-writes、monotonic read 和 stale cache 约束。
- 产物：partition map、迁移协议、热点/倾斜指标和读一致性矩阵。
- 过关：扩容不触发全量重映射；迁移失败可恢复；调用方知道每种读可能看到多旧的数据。

### PDS-6 · 90 分钟：超时、重试与 Idempotent Receiver

- 实现 `(client_id, request_id)` 唯一键、payload hash、状态与保存响应；dedupe 记录和业务副作用在同一事务中提交。
- 测试并发重复、超时后重试、服务端 commit 后 crash、不同 payload 复用 key、TTL 后重放。
- 比较 batch、pipeline、single-socket 与 singular update queue：分别写明顺序范围、head-of-line blocking、背压和关闭协议。
- 产物：请求状态机、幂等表 schema、对抗测试和 retry budget。
- 过关：承诺“业务效果至多一次/可重放返回”，而不是笼统承诺网络 exactly-once。

### PDS-7 · 90 分钟：2PC、共识与业务工作流边界

- 画 coordinator/participant 的 prepare、prepared、commit/abort 与 recovery；每个持久化点标出锁和可见性。
- 注入 coordinator crash、participant crash、消息重复和永久 partition，记录何时能恢复、何时阻塞。
- 对同一订单/模型发布案例比较单库事务、2PC、Saga/补偿、transactional outbox；后两者是目录外补充，不伪装成原文结论。
- 产物：协议时序图、blocking table、选型 ADR 与回滚/人工修复路径。
- 过关：能用一句话区分 consensus（节点对值/顺序达成一致）与 atomic commit（多个资源作同一提交决定）。

## 三个可复用实验与面试产物

1. **Deterministic cluster simulator**：固定随机种子，调度 crash/restart/drop/delay/duplicate/reorder；输出事件历史和不变量检查。先三节点、内存网络，不先上 Kubernetes。
2. **Idempotent write service**：PostgreSQL 唯一约束 + 状态机 + 保存响应 + 并发/崩溃测试；接入 Topcoder 全栈纵向切片，形成 UI → API → transaction → retry 证据。
3. **45 分钟设计答辩**：设计高可用任务调度或模型发布控制面；必须覆盖数据/分区、复制/读语义、幂等、副作用、故障、SLO、观测、发布与灾难恢复。

每个实验都保留一份 `claim → invariant → injected fault → observation → conclusion` 表。漂亮架构图、正常路径 demo 和单次手工成功都不能替代它。

## 嵌入现有六周计划

| 场景 | 激活路径 | 等量替换 |
| --- | --- | --- |
| Backend / Platform / Infra / Data / ML Platform / Agent Infra | 第 4 周 PDS-0/1/2/6；第 6 周 PDS-3/4/5/7 按失分补 | 两次泛化系统白板、分布式术语泛读 |
| Fullstack / AI Product Engineer | PDS-0/1/6/7，接 Topcoder FS-3/4/6/7 | 一个随机 CRUD demo、一场重复发布设计 |
| 通用 ML/CV | 只在 S6、任务队列、模型发布或 mock 暴露缺口时做 PDS-0/2/6 | 不额外加时 |
| 面试少于三周 | 只做两个交互节点、PDS-6 和一次 45 分钟答辩 | 一场泛化系统 mock |

Paxos 证明、完整 Raft 实现、CRDT 和拜占庭容错默认进入长期学习池，不挤占当前面试主线。

## 面试追问链

1. 客户端超时后重试，如何区分请求未执行与响应丢失？幂等记录在哪里原子提交？
2. 五节点集群为什么多数派是 3？两个不同多数派的交集解决了什么，没有解决什么？
3. leader 已复制到两个 follower 后崩溃；什么时候该条目算 committed，什么时候客户端可以看到？
4. Heartbeat 超时为什么不能证明节点已死？如何防止旧 lease holder 继续写？
5. Lamport clock、hybrid clock、version vector 和 wall-clock timestamp 的保证分别是什么？
6. follower read 如何定义最大陈旧度、read-your-writes、单调读与故障降级？
7. 固定逻辑分区与 key range 怎样影响扩容、范围查询、热点和迁移恢复？
8. WAL、high-water、commitIndex、lastApplied、low-water 各是什么，混淆会导致什么数据错误？
9. 2PC coordinator 在 prepare 后失联，为何参与者可能阻塞？共识能否直接消除业务补偿？
10. 你怎样证明系统在 drop/duplicate/reorder/partition 下仍满足不变量，而不是只靠日志观察？

## 完成定义

- [ ] 能把 30 个模式放入 7 个问题簇，并为任意模式写出保证、故障模型、作用域和代价。
- [ ] 实现 WAL recovery 或复制日志模拟器之一，并通过至少四种确定性故障注入。
- [ ] 实现 Idempotent Receiver，覆盖并发重复、commit 后 crash、payload mismatch 与 TTL 重放。
- [ ] 解释多数派交集、term/generation、commit/applied 边界和 stale leader 拒绝。
- [ ] 用事件图正确区分 Lamport order、version-vector concurrency 与物理时间不确定度。
- [ ] 为 follower read、partition migration 与 2PC 各写一张失败/恢复表。
- [ ] 完成一次 45 分钟系统设计和一份选型 ADR，包含被放弃方案与残余风险。
- [ ] D+7 在无资料/AI 下处理一次新故障组合；只有延迟无辅助迁移才计入“可面试”。
