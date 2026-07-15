# Photography Mentor Agent v1.0.0

发布日期：2026-07-15

这是一个可独立运行、可离线安装、可由 Git 完整保存的静态 Web 应用版本。它把网络摄影资料、本机摄影书籍摘要和复习训练闭环组织成一套可追溯的 Photography Mentor 学习系统。

## 版本范围

- 62 张网络知识卡：计算摄影、摄影美学、前期拍摄、后期、题材实践、学习方法与来源边界。
- 12 张本机资料摘要卡：由 166 个文件、约 7.6 GB 本机摄影资料先分类总结后生成；仓库只保存摘要、索引和文件名，不复制书籍全文。
- 7 个学习阶段、22 个合并知识节点：每张网络卡只进入一个主节点，每组本机资料只进入一个学习阶段。
- 主动回忆、分层提示、实拍证据、复盘、掌握度和间隔复习组成完整学习 Session。
- Before/After 照片对比提供亮度、对比度、饱和度、清晰度、高光和阴影裁切等可解释指标。照片像素不写入 `localStorage`，只保存文件名、指标和变化量。
- PWA 应用壳、本地图标和本地 Lucide 运行时均进入缓存；首次在线打开后可离线使用核心功能。

## 启动

在仓库根目录运行：

```powershell
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m http.server 8000 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:8000/photography-mentor-agent.html
```

不要直接双击 HTML：PWA、Service Worker 和部分浏览器安全能力需要 HTTP 上下文。

## 发布校验

```powershell
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe scripts/validate-photography-mentor.mjs
```

校验脚本会检查：发布文件、HTML 本地引用、无 CDN 运行时、JavaScript 语法、DOM ID、知识卡数量与来源、7/22/62/12 分类闭合性、Manifest、Service Worker 和离线缓存覆盖。

## 文件清单

- `photography-mentor-agent.html`：完整前端与学习交互逻辑。
- `assets/photo-mentor-foundation.css`：该版本固定的基础界面样式快照。
- `assets/photo-mentor-icon.svg`：PWA 图标。
- `assets/vendor/lucide-1.23.0.min.js`：本地 Lucide 图标运行时，ISC License 已保留在文件头。
- `knowledge/photography-mentor-kb.js`：62 张网络摘要知识卡与 28 个来源索引。
- `knowledge/local-photography-books-kb.js`：12 张本机摄影资料分类摘要卡。
- `knowledge/photography-mentor-taxonomy.js`：7 阶段、22 节点的同类合并知识脉络。
- `notes/photography-mentor-research-2026-07-11.md`：网络研究摘要与来源边界。
- `notes/local-photography-books-summary-2026-07-12.md`：本机摄影资料总结。
- `notes/photography-knowledge-review-2026-07-14.md`：知识合并与覆盖审计。
- `notes/photography-mentor-product-review-2026-07-15.md`：产品、教育交互与投资视角评审。
- `scripts/build_local_photography_kb.py`：本机摄影资料索引和摘要生成脚本。
- `scripts/validate-photography-mentor.mjs`：发布完整性校验。
- `manifest.webmanifest`、`sw.js`：安装和离线运行配置。

## 数据与版权边界

- 网络资料仅保存归纳后的知识卡和来源链接，不抓取或再发布教程全文。
- 本机书籍仅保存分类统计、摘要、索引和文件名；原始书籍仍在用户本机，不进入 Git。
- SYBJ 登录由站点自身处理。当前前端只提供公开教程入口、授权采集说明和微信登录提示，不存储微信凭据或绕过访问控制。
- 用户学习档案保存在当前浏览器，可手动备份和恢复；更换设备时不会自动同步。

## 已知边界

- 这是本地优先的静态版本，没有服务端账号、跨设备同步、多人协作和云端向量检索。
- 照片诊断使用浏览器侧可解释图像统计，不等同于多模态模型的语义理解或审美裁决。
- 网络链接可能随时间变化；知识卡保留检索日期和来源，后续版本应定期做链接与内容更新审计。
