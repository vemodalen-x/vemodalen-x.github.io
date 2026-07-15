# LeetCode Blind 75 覆盖与补充路线

来源：[LeetCode 题单](https://leetcode.com/problem-list/oizxjoit/)｜[公开分类目录](https://leetcode.com/discuss/post/460599/blind-75-leetcode-questions/)。

## 它在准备体系中的角色

链接对应经典的 Blind 75。它覆盖数组、位运算、DP、图、区间、链表、矩阵、字符串、树/Trie 和堆，是检查 coding interview breadth 的好清单。

但当前已经有 [AlgoNote 32 题核心路线](algo-note-plan.md)，因此不再独立刷完 75 题：

- AlgoNote 负责数据结构、模式讲解和中文题解。
- Blind 75 负责检查是否遗漏经典模式。
- Tech Interview Handbook 的编码协议负责澄清、沟通、实现和测试。
- ML/CV coding 专项继续训练 NMS、bilinear resize、connected components、producer–consumer 等岗位题。

最终路线是 **32 道核心题 + 12 道 Blind 75 缺口题**，不是 107 道相加。

## 与 AlgoNote 32 题的重合审计

### 14 道完全重合

Two Sum、Merge Intervals、Rotate Image、Spiral Matrix、Longest Consecutive Sequence、Search in Rotated Sorted Array、3Sum、Longest Substring Without Repeating Characters、Reverse Linked List、Merge Two Sorted Lists、Valid Parentheses、Binary Tree Level Order Traversal、Number of Islands、Coin Change。

这些题只在一个地方维护复习记录，不因出现在两张表中重复计数。

### 3 组模式已由更广或相邻版本覆盖

- Blind 75 的 Linked List Cycle 与 AlgoNote 的 Linked List Cycle II：后者包含环检测并继续求入口。
- Course Schedule 与 Course Schedule II：后者在环检测基础上还要输出拓扑序。
- Lowest Common Ancestor of BST 与 Binary Tree LCA：通用二叉树版本不利用 BST 有序性；补做时只需口述 BST 的简化方案。

### 已有替代能力

- Top K Frequent Elements：已有 Kth Largest、heap/quickselect 基础，但仍需会 frequency map + heap/bucket 的组合。
- Meeting Rooms/Insert Interval：已有 Merge Intervals，补充端点语义和资源并发即可。
- Connected Components/Graph Valid Tree：已有 Number of Islands 和 Course Schedule II，可迁移 DFS/BFS/并查集/环检测。
- Tree 的基础 DFS/BFS：已有 Level Order 和通用 LCA，但 BST invariant、Trie 和序列化仍是明显缺口。

## P0：12 道高价值缺口题

### A. 数组、二分与位运算

1. [238. Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/)：prefix/suffix product、禁止除法、`O(1)` extra space 的口径。
2. [53. Maximum Subarray](https://leetcode.com/problems/maximum-subarray/)：Kadane、局部状态、全负数和 divide-and-conquer 对比。
3. [153. Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)：二分不变量，与 Search in Rotated Sorted Array 配对。
4. [191. Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/)：`n & (n-1)`、无符号表示和 C++ 位宽意识。
5. [338. Counting Bits](https://leetcode.com/problems/counting-bits/)：bit DP、最低有效位/最高有效位递推。

### B. DP、图与矩阵

6. [300. Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/)：`O(n²)` DP 到 `O(n log n)` tails + binary search；tails 不是实际序列。
7. [139. Word Break](https://leetcode.com/problems/word-break/)：前缀 DP、字典查找、不可达状态和 Trie/搜索替代。
8. [133. Clone Graph](https://leetcode.com/problems/clone-graph/)：旧节点到新节点映射、环、DFS/BFS 和深拷贝语义。
9. [417. Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/)：从边界反向搜索、multi-source reachability、矩阵边界。
10. [73. Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/)：首行首列作为 marker、原地状态污染和非方阵测试。

### C. 树与 Trie

11. [98. Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/)：上下界 invariant、严格不等号、全局而非父子约束。
12. [208. Implement Trie](https://leetcode.com/problems/implement-trie-prefix-tree/)：节点设计、终止标记、字符集/内存权衡和 prefix 语义。

这 12 题补齐现有路线最明显的位运算、经典 DP、图复制、反向可达、BST invariant 和 Trie，不再重复已有模式。

## P1：算法要求较高时再做

### 五道 hard 校准题

- [23. Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)：min-heap 与 divide-and-conquer，复杂度按总节点数和 `k` 表达。
- [76. Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)：满足计数的 sliding window；不要用集合丢失重复字符。
- [124. Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/)：向上返回单支贡献、全局答案允许双支。
- [297. Serialize and Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/)：协议设计、null marker、往返不变量和恶意输入。
- [295. Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/)：two heaps、平衡不变量、溢出和流式更新。

### 五道按公司/JD补充

- [57. Insert Interval](https://leetcode.com/problems/insert-interval/) 与 [435. Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/)：区间插入、贪心端点选择。
- [143. Reorder List](https://leetcode.com/problems/reorder-list/)：找中点、反转后半段、交错合并。
- [212. Word Search II](https://leetcode.com/problems/word-search-ii/)：Trie + backtracking + pruning。
- [269. Alien Dictionary](https://leetcode.com/problems/alien-dictionary/)：字符图、拓扑排序、非法前缀；若题目受 Premium 限制，可根据公开题意自行实现。

## Premium 题的处理

无需为了“完成 Blind 75”购买 Premium。用免费等价练习覆盖模式：

- Graph Valid Tree / Connected Components → Number of Islands、并查集和 Course Schedule II。
- Meeting Rooms I/II → Merge Intervals，再实现“排序端点”或 min-heap 计算并发数。
- Encode and Decode Strings → 自己定义 length-prefix protocol，例如 `len#payload`，并测试空串、分隔符和 Unicode/byte 口径。
- Alien Dictionary → 已有 Course Schedule II 的 topo 基础；按公开题意补字符图和非法前缀。

## 每题训练协议

沿用 [Tech Interview Handbook 固定操作协议](tech-interview-handbook-plan.md#编码面试固定操作协议)：

1. **0–5 分钟**：复述题意，确认输入规模、空值/重复值、是否可修改输入。
2. **5–10 分钟**：给 baseline 和优化方案，说明不变量与复杂度。
3. **10–35 分钟**：实现可运行代码，边写边解释关键状态。
4. **35–45 分钟**：dry run 正常、最小、极端和反例；主动修错。

首练默认 Python。P0 中至少用 C++ 重写 238、153、191、73、98、208，重点检查 signed/unsigned、索引、引用/指针、递归深度和 ownership。

### 求助规则

- Easy/Medium 独立思考 25 分钟，Hard 35 分钟。
- 卡住后先看“模式提示”，不要直接看完整代码。
- 看过题解不算完成；合上题解后必须解释不变量并从空文件重写。
- 48 小时内重做仍失败，记录具体障碍：模式识别、状态定义、实现、边界、复杂度或表达。

## 模式卡而不是单题答案

每做完一道题，只保留一张短卡：

```text
题号 / 模式：
识别信号：
核心状态或不变量：
复杂度：
最小反例：
我最容易写错的两处：
同模式迁移题：
D+1 / D+3 / D+7 结果：
```

例如 LIS 的卡片写“tails[k] 是长度 `k+1` 的递增子序列最小结尾”，而不是背一段 `bisect_left` 代码。

## 与 AI/CV/Edge 的迁移

- Product Except Self → prefix/suffix tensor scan、累计变换和避免除零。
- Maximum Subarray → 连续时间窗中的最佳得分区间、流式状态更新。
- Bit problems → flags、mask、量化整数、像素格式和 C++ 位操作。
- Clone Graph → computational graph、pipeline DAG 和带共享节点结构的深拷贝。
- Pacific Atlantic / Set Matrix Zeroes → mask propagation、图像栅格搜索和原地矩阵状态。
- Trie → tokenizer 前缀、命令路由、字典搜索和内存/字符集权衡。
- Streaming Median → 在线 telemetry、鲁棒统计与有界内存近似方案的起点。

面试迁移时说明生产数据规模、并发、内存布局和异常输入；LeetCode 解法不是完整生产实现。

## 六周嵌入安排

- **默认平衡主干**：以[统一练习脉络](practice-roadmap.md)为准，六周主动完成 238 Product Except Self、133 Clone Graph、208 Trie；其余 P0 保留在覆盖池。
- **Coding-heavy 扩展**：每周从剩余 P0 加 1–2 道，优先 153、191、300、73、98；新增时等量减少阅读，不突破时间上限。
- **第 6 周**：从 AlgoNote 32 + 本页 12 道中随机抽题 mock；若暴露某个缺口，再回到对应 P0，而不是按列表补打卡。

总负担上限：每周三次算法训练、每次 45–60 分钟。Blind 75 不能额外挤占 ML/CV、系统设计和项目深挖时间。

## 过关标准

- 默认六周完成统一脉络的 3 道 Blind 75 主干；若目标公司 coding-heavy，再把长期标准提升为 12 道 P0 中至少 10 道能在 35 分钟内独立完成。
- 14 道重合题随机抽取时，连续三次无需提示完成。
- 每个 Blind 75 大类至少能说出一个核心 invariant 和一道代表题。
- Coding-heavy 扩展时，P0 六道指定题完成 C++ 版本，并通过 sanitizer/边界测试思维审查；默认平衡主干只要求 238、133、208 中至少一题完成 C++。
- 编码四维评分中沟通、问题求解、实现、测试连续三场均达到 3/4。
- 能把至少四个算法模式迁移到真实 AI/CV/Edge 问题，而不只是复述题名。

达到这些标准后不追求 Blind 75 的打卡百分比；拿到具体公司信息后再决定是否做 P1。
