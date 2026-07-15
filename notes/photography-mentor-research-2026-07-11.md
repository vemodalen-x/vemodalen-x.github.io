# 摄影 Mentor Agent 研究摘要

日期：2026-07-11

用途：为 `photography-mentor-agent.html` 和 `knowledge/photography-mentor-kb.js` 提供摘要级 RAG 知识库。本文只记录归纳、索引和方法，不复制原文长段落。

## 资料范围

- Thomas / 色影123 教程体系：覆盖色彩管理、系统性模仿摄影师风格、调色、层次与空间、摄影比赛、构图、光影、后期尺度、风光、星空、人像、手机摄影等。
- Thomas 图虫 2016 总结：覆盖构图的主体与主题、器材与思路、评片、直方图、曝光、降噪、ACR/LR、曲线、锐化、局部滤镜、图层蒙版、星空、自然光人像、照片通透感。
- Stanford / Marc Levoy 数字摄影课程：用于把摄影理解为光学、传感器、曝光、采样、去马赛克、色彩、图像处理和输出的完整管线。
- Google HDR+ 与移动计算摄影资料：用于多帧捕获、对齐、合并、HDR、低光降噪、手机夜景和人像模式的原理。
- Cambridge in Colour：用于曝光、动态范围、白平衡、噪声、色彩管理、锐化和构图的基础知识。
- 视觉设计与 Gestalt 资料：用于视觉层级、平衡、对比、图底关系、接近、相似、连续、闭合等审美语言。
- RAG 最佳实践资料：用于知识块拆分、元数据、来源追踪、检索质量、引用和评估。

## 知识库设计

每个知识块使用同一结构：

- `domain`：`agent`、`computational`、`aesthetics`、`post`、`genre`、`learning`
- `tags`：用于本地检索和主题筛选
- `summary`：摘要级知识，不复制原文
- `mentorUse`：把知识转成对话行为
- `practice`：一次可执行练习
- `questions`：评片或复盘追问
- `sourceIds`：来源索引，前端渲染为链接

这种结构比单纯长文更适合 RAG，因为摄影问题通常不是单点问答，而是“题材 + 意图 + 器材 + 光线 + 前期 + 后期 + 输出”的组合问题。

## Agent 角色边界

摄影 Mentor Agent 应该做：

- 把用户问题分流到拍摄计划、作品评片、后期流程、计算摄影解释、学习路径。
- 先问主体、主题、场景、光线、输出目标，再给参数或后期建议。
- 给出来源可追溯的知识块，而不是空泛审美判断。
- 把建议落到一次练习、一次复盘或一个 7 天训练任务。
- 区分客观事实、用户意图、模型推断和个人偏好。

摄影 Mentor Agent 不应该做：

- 看不到照片时假装看到了照片细节。
- 把三分法、滤镜或固定参数当成万能答案。
- 把个人审美盖章为唯一标准。
- 大段复制教程原文或替代用户购买课程。
- 在纪实、比赛、商业场景里忽略后期合成的真实边界。

## 核心学习路线

1. 会拍：曝光、对焦、光线方向、主体和主题、取景秩序。
2. 会修：RAW 基础校正、白平衡、影调、色彩、局部调整、降噪锐化、导出。
3. 会看：视觉层级、平衡与张力、图底关系、层次、色彩关系、内容冲突。
4. 会表达：专题、风格拆解、个人题材、叙事、评片复盘、输出场景。

## 关键结论

- 构图不是规则优先，而是主体和主题优先；规则只是摆放工具。
- 曝光不是追求唯一正确亮度，而是记录信息与表达情绪的取舍。
- 动态范围、噪声和手机 HDR 都应从信号记录与多帧计算角度理解。
- 白平衡要先能校准，再决定是否保留情绪色。
- 后期的核心不是炫技，而是局部地强化沟通；图层和蒙版让这种强化可编辑、可复盘。
- 层次感来自遮挡、透视、空气感、明暗和清晰度关系，不等于全局加清晰度。
- 调色要有主色调和色相/饱和度/明度层级，不能与前期光线和主题脱节。
- 评片应分事实、意图、效果、改法，最后收敛到下一次可验证动作。

## 主要来源

- https://www.seying123.com/384.html
- https://thomaskksj.tuchong.com/t/13904126/
- https://graphics.stanford.edu/courses/cs178/
- https://sites.google.com/site/marclevoylectures/home
- https://research.google/pubs/burst-photography-for-high-dynamic-range-and-low-light-imaging-on-mobile-cameras/
- https://hdrplusdata.org/
- https://ar5iv.labs.arxiv.org/html/2102.09000
- https://www.cambridgeincolour.com/tutorials.htm
- https://www.cambridgeincolour.com/tutorials/camera-exposure.htm
- https://www.cambridgeincolour.com/tutorials/dynamic-range.htm
- https://www.cambridgeincolour.com/tutorials/white-balance.htm
- https://www.cambridgeincolour.com/tutorials/image-noise.htm
- https://www.nngroup.com/articles/principles-visual-design/
- https://www.interaction-design.org/literature/topics/gestalt-principles
- https://antongorlin.com/blog/photography-composition-definitive-guide/
- https://developers.openai.com/api/docs/guides/retrieval
- https://arxiv.org/abs/2407.01219
