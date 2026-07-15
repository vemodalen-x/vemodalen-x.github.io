---
title: "个人知识库开源参考架构：从高 Star 项目到本地实现"
date: 2026-07-11
type: research-note
status: active
tags:
  - 个人知识库
  - PKM
  - 本地优先
  - 开源软件
  - Windows
---

# 个人知识库开源参考架构

## 结论

个人知识库不应只有“收藏”和“分类”。可长期运行的系统至少包含五个环节：可迁移的来源、结构化元数据、全库检索、知识之间的连接、面向真实任务的复习与应用。

本项目采用纯 Markdown + 可重建 JavaScript 索引 + 本地 HTML 的结构。Markdown 是长期资产，索引是派生物，浏览器是日常操作入口。这样既能在 Windows 上低成本运行，也保留以后迁移到 Obsidian、Logseq、SiYuan、Quartz 或其他工具的余地。

## 高 Star 项目对照

GitHub Stars 为 2026-07-11 通过 GitHub API 读取的快照，会随时间变化。

| 项目 | Stars | 值得借鉴的机制 | 本库采用方式 |
| --- | ---: | --- | --- |
| [SiYuan](https://github.com/siyuan-note/siyuan) | 45,045 | 本地优先、块引用、双向链接、属性查询、闪卡 | 本地运行、结构化字段、方法卡复习 |
| [Logseq](https://github.com/logseq/logseq) | 43,781 | Markdown、属性、知识图谱、日记、卡片复习 | Markdown 来源层、标签检索、每日闭环、四档复习 |
| [TriliumNext](https://github.com/TriliumNext/Trilium) | 36,832 | 层级、全文搜索、属性、关系图、版本记录 | 分类导航、全库摘要检索、Git 版本记录 |
| [Foam](https://github.com/foambubble/foam) | 17,283 | VS Code + Markdown、Wiki 链接、反向链接 | 文件优先、编辑器无关、保留内部链接扩展空间 |
| [Quartz](https://github.com/jackyzha0/quartz) | 12,731 | Markdown 静态站点、搜索、标签、链接与图谱 | 生成浏览器索引和静态 HTML 知识入口 |

## 采用的组织原则

1. **来源与结论分离**：旧库保留广域来源，`notes/` 保存已经转化为自己语言的笔记。
2. **行动优先分类**：参考 [PARA](https://fortelabs.com/blog/para/)，分类服务于当前项目和领域，而不是追求完美目录树。
3. **渐进式提炼**：参考 [Progressive Summarization](https://fortelabs.com/blog/progressive-summarization-a-practical-technique-for-designing-discoverable-notes/)，先保留来源，再逐步形成摘要、方法卡和行动模板。
4. **检索优先于深层目录**：分类用于浏览，搜索、标签和摘要用于快速定位。
5. **主动回忆优先于重复阅读**：方法卡先显示问题，回答后再按回忆难度安排下一次复习。
6. **可重建优先于专有数据库**：`personal-kb-index.js` 可随时由 Python 重建，不是唯一数据副本。

## 本地架构

```text
原始文件 / 网页 / 旧知识库
          ↓
notes/ 来源笔记、MOC、项目复盘
          ↓
knowledge/*.js 方法卡 + 统一索引
          ↓
personal-knowledge-hub.html
检索 / 学习路径 / 间隔复习 / 快速记录
          ↓
真实行动与复盘，再更新笔记
```

## 价值评分

旧库条目按提取状态、摘要长度、关键词、分类质量、文件类型、来源可追溯性和噪声特征计算 0-100 分：

- `精选`：85 分及以上，默认优先展示。
- `可用`：60-84 分，可用于补充检索。
- `待整理`：60 分以下，可能只有元数据或属于过程文件。

评分只用于排序和清理队列，不替代人工判断。当前 `notes/` 中人工整理的 Markdown 默认进入精选层。

## 应用节奏

### 每日

1. 写下一个正在发生的真实问题。
2. 搜索精选层，最多打开三条资料。
3. 选择一到三张方法卡，形成最小行动。
4. 完成到期卡片复习。
5. 记录结果与下一次复盘日期。

### 每周

1. 清理快速记录中的 `inbox` 笔记。
2. 把高频来源提升为自己的来源笔记。
3. 合并重复笔记，补充反例、边界和来源。
4. 查看待整理条目，只处理与当前项目有关的部分。
5. 运行索引构建器并用 Git 备份变更。

## 不采用的部分

- 暂不引入数据库、Docker、Node.js 构建链和云同步，降低本机维护成本。
- 暂不自动生成“知识图谱”。没有高质量链接时，图谱通常只是视觉噪声。
- 暂不把全部 1405 条旧资料转成方法卡。方法卡必须能回答反复出现的问题，并有适用边界。

