# AlgoNote 定向算法学习路线（32 题）

来源：[itcharge/AlgoNote](https://github.com/itcharge/AlgoNote)及其[高频 100 题](https://github.com/itcharge/AlgoNote/blob/main/docs/00_preface/00_07_interview_100_list.md)、[高频 200 题](https://github.com/itcharge/AlgoNote/blob/main/docs/00_preface/00_08_interview_200_list.md)和[分类题单](https://github.com/itcharge/AlgoNote/blob/main/docs/00_preface/00_06_categories_list.md)。

## 为什么只选 32 题

你的核心竞争力是 AI/CV/Edge 系统，不是纯算法竞赛。算法准备的目标是稳定通过常见 coding round，并服务于图像、张量、流式处理和运行时问题。因此优先：

- 数组、矩阵、坐标与边界处理。
- 哈希、双指针、滑动窗口、二分和 top-k。
- DFS/BFS、connected components、树与图遍历。
- 队列、堆、链表、LRU 等运行时常见结构。
- 基础回溯与 DP，保证 breadth。

复杂 DP、冷门数学和大量 hard 题暂列低优先级；拿到明确要求后再扩展到 100/200 题单。

## 训练协议

每题都按以下流程：

1. **5 分钟识别模式**：复述输入、输出、约束和边界，不看题解。
2. **20–30 分钟实现**：默认 Python；先写正确 baseline。
3. **5–10 分钟验证**：空输入、单元素、重复值、极值、非方阵/断连图等。
4. **3 分钟口述**：复杂度、核心 invariant、替代方案和失败点。
5. **再练**：D+1 口述，D+3 重写核心，D+7 限时完整实现。

标记 ★ 的 12 题至少选择 8 题再用 C++ 实现，练习 ownership、迭代器/索引安全和内存边界。

## 第 1 组：数组、矩阵与哈希（1–8）

1. [0001. 两数之和](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/two-sum.md)：哈希表与一次遍历。
2. [0283. 移动零](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0200-0299/move-zeroes.md)：原地双指针与写指针 invariant。
3. [0056. 合并区间](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/merge-intervals.md)：排序、区间边界与输出构造。
4. **★** [0048. 旋转图像](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/rotate-image.md)：矩阵坐标变换与原地操作。
5. **★** [0054. 螺旋矩阵](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/spiral-matrix.md)：边界收缩与非方阵测试。
6. **★** [0215. 数组中的第 K 个最大元素](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0200-0299/kth-largest-element-in-an-array.md)：heap 与 quickselect 权衡。
7. [0169. 多数元素](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0100-0199/majority-element.md)：计数、排序与 Boyer–Moore。
8. [0128. 最长连续序列](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0100-0199/longest-consecutive-sequence.md)：哈希集合与避免重复扩展。

## 第 2 组：二分、窗口与字符串（9–16）

9. **★** [0704. 二分查找](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0700-0799/binary-search.md)：统一闭区间/半开区间模板。
10. [0034. 查找第一个和最后一个位置](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/find-first-and-last-position-of-element-in-sorted-array.md)：lower/upper bound。
11. **★** [0033. 搜索旋转排序数组](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/search-in-rotated-sorted-array.md)：局部有序性。
12. **★** [0240. 搜索二维矩阵 II](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0200-0299/search-a-2d-matrix-ii.md)：二维单调性与坐标移动。
13. [0015. 三数之和](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/3sum.md)：排序、双指针与去重。
14. [0003. 无重复字符的最长子串](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/longest-substring-without-repeating-characters.md)：可变滑动窗口。
15. **★** [0239. 滑动窗口最大值](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0200-0299/sliding-window-maximum.md)：单调队列与过期元素。
16. [0415. 字符串相加](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0400-0499/add-strings.md)：手工进位、索引与大数。

## 第 3 组：链表、栈、队列与缓存（17–24）

17. **★** [0206. 反转链表](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0200-0299/reverse-linked-list.md)：指针更新顺序与 ownership 思维。
18. [0021. 合并两个有序链表](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/merge-two-sorted-lists.md)：dummy node 与尾节点处理。
19. [0142. 环形链表 II](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0100-0199/linked-list-cycle-ii.md)：快慢指针和数学解释。
20. [0020. 有效的括号](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/valid-parentheses.md)：栈与非法输入。
21. [0155. 最小栈](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0100-0199/min-stack.md)：辅助栈与重复最小值。
22. [0232. 用栈实现队列](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0200-0299/implement-queue-using-stacks.md)：摊还复杂度。
23. **★** [0146. LRU 缓存](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0100-0199/lru-cache.md)：哈希表 + 双向链表。
24. **★** [0912. 排序数组](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0900-0999/sort-an-array.md)：至少掌握 merge sort，并解释 quicksort/heap sort。

## 第 4 组：树、图、回溯与 DP（25–32）

25. [0102. 二叉树层序遍历](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0100-0199/binary-tree-level-order-traversal.md)：BFS、层边界和队列。
26. [0236. 二叉树最近公共祖先](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0200-0299/lowest-common-ancestor-of-a-binary-tree.md)：递归返回语义。
27. **★** [0200. 岛屿数量](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0200-0299/number-of-islands.md)：矩阵 connected components、DFS/BFS/并查集。
28. [0210. 课程表 II](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0200-0299/course-schedule-ii.md)：拓扑排序与环检测。
29. [0046. 全排列](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/permutations.md)：回溯状态与撤销选择。
30. [0078. 子集](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0001-0099/subsets.md)：回溯/位掩码两种实现。
31. [0322. 零钱兑换](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0300-0399/coin-change.md)：状态定义、转移与不可达值。
32. **★** [0221. 最大正方形](https://github.com/itcharge/AlgoNote/blob/main/docs/solutions/0200-0299/maximal-square.md)：矩阵 DP 与空间压缩。

## 与 AI/CV 面试题库的映射

- C2 connected components → 第 27 题岛屿数量。
- C3 NMS → 第 3、6 题的排序/区间/top-k 思维，但仍需单独实现 IoU/NMS。
- C4 bilinear resize → 第 4、5、12、32 题的矩阵索引和边界能力。
- C6 producer–consumer queue → 第 15、20–23 题提供结构基础，但并发、背压和关闭协议仍需专项练习。
- E8 实时流背压 → 单调队列、普通队列与有界缓存的复杂度意识。

## 过关标准

- 六周默认只执行[统一练习脉络](practice-roadmap.md)选出的 15 道 DSA 主干；32 题全量标准属于长期覆盖或 coding-heavy 公司定向，不与六周主干重复计数。
- 32 题中至少 26 题能在 30 分钟内独立完成。
- 所有题都能解释时间/空间复杂度和至少三个边界测试。
- 12 道 ★ 中至少 8 道完成 C++ 版本。
- 任意抽一个模式，能说出 2–3 道相关题及共同 invariant，而不是只背单题代码。

## Blind 75 覆盖补充

完成核心题后，使用 [Blind 75 覆盖与补充路线](blind-75-plan.md)检查遗漏模式。两张题单不重复计数：Blind 75 中 14 道完全重合题只作为随机复测，实际新增 12 道 P0 缺口题。只有目标公司算法要求较高时才做其中的 hard/P1 题。
