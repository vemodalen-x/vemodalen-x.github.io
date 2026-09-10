# Photography Mentor 商业素材交付研究

研究日期：2026-09-10

本笔记只保留平台官方页面的可操作摘要，作为商业素材预筛的规则来源。平台规则、账号资格、佣金、可用地区和审核结果都可能变化；应用内的分数不是平台承诺，也不是法律意见。

## 共同的第一性原理

一张照片能否产生商业收入，不是“看起来好不好”一个问题，而是四个约束的交集：

1. **可用性**：尺寸、格式、色彩空间、文件体积和清晰度达到目标渠道的技术门槛。
2. **可检索性**：标题、描述、关键词和分类准确描述画面，不用商标、网址、相机参数或无关热词堆砌。
3. **可授权性**：摄影师拥有版权；可识别人物、物业、艺术品、品牌和店招的使用权被逐项核对。
4. **可交付性**：素材、release、元数据和平台选择被整理成可复核的提交包，最后由摄影师在官方入口完成上传和确认。

因此，Photography Mentor 只在浏览器本地计算文件指标，并要求用户明确勾选人物、品牌、物业和版权核查项。它不会声称能从像素中可靠识别人、商标或版权归属。

## 平台摘要

### Adobe Stock

- 官方照片技术与法律要求：4MP–100MP，JPEG，sRGB，照片文件通常不超过 45MB；应避免水印、时间戳、品牌和商标，画面应清晰、曝光合理。
- 可识别人物通常需要 model release；可识别物业、艺术品或受版权保护的对象可能需要 property release。
- 投稿时需要选择类别、标题、5–50 个关键词，并按需附加 release；关键词应相关，前 10 个尤其重要，标题建议简洁且不包含设备或他人姓名。
- 官方资料：
  - [Technical and legal requirements](https://helpx.adobe.com/stock/contributor/submit-your-content/submit-photos/technical-legal-requirements-photo-submission.html)
  - [Submit photos](https://helpx.adobe.com/stock/contributor/submit-your-content/submit-photos/submit-photos.html)
  - [Titles and keywords](https://helpx.adobe.com/stock/contributor/content-policies-guidelines/metadata/tips-effective-titles-keywords.html)

### Shutterstock

- 官方投稿帮助页要求照片为 JPEG 或 TIFF，至少 4MP，文件小于 50MB，并通过 contributor 账户提交。
- 至少一个分类；关键词需要 7–50 个英文词，标题/描述不能放商标、个人可识别信息、网址、emoji 或垃圾关键词。
- 关键词顺序、准确性和唯一描述会影响检索，但平台最终仍由审核团队决定是否通过。
- 官方资料：
  - [Photo review submission](https://submit.shutterstock.com/help/en/articles/10617495-how-do-i-submit-photos-for-review)
  - [Image technical requirements](https://submit.shutterstock.com/help/en/articles/10617390-what-are-the-technical-requirements-for-images)
  - [Metadata standards](https://submit.shutterstock.com/help/en/articles/10617427-content-publishing-standards-contextual-metadata)
  - [Description and keyword best practices](https://submit.shutterstock.com/help/en/articles/10594702-description-and-keyword-best-practices)

### Alamy

- 官方贡献者页面面向真实摄影、旅行、建筑、编辑和档案内容，允许非独家授权；官方 FAQ 说明可上传高质量 RGB JPEG，真实相机的 Make / Model EXIF 对首次质量审核有帮助。
- 首次测试投稿需要 3 张最佳照片；通过质量审核后，还要为素材添加 caption 和至少 5 个 tags 才会进入在售状态。
- 商业用途中的可识别人物或物业仍可能需要对应 release；AI 生成内容不在其当前接受范围内。
- 官方资料：[Contributor page](https://www.alamy.com/contributor/)、[Contributor help](https://www.alamy.com/help/)、[Image sales guide](https://www.alamy.com/help/contributor-image-sales-guide/)。

### Wirestock

- 官方当前页面仍提供照片审核和授权入口，但官方 2026 年说明已从旧的第三方 stock marketplace 分发模式转向 Paid per sale 项目、创作者匹配和数据授权工作流。
- 这意味着“上传一次，自动同步到所有平台”不能再作为默认产品承诺；用户应在授权前阅读当前项目、合作方、收益和撤回条款。
- 官方资料：[Sell photos](https://wirestock.io/creators/sell-photos-online)、[What is changing](https://wirestock.io/blog/whats-changing-on-wirestock-a-guide-for-creators)、[Terms of use](https://wirestock.io/docs/terms-of-use)。

### 500px Licensing

- 官方 FAQ 和审核规则强调真实相机拍摄、版权和 release；可识别人物、物业、品牌和 IP 风险需要人工处理。
- 官方说明 AI 生成内容不适合该授权路径；AI 编辑如新增视觉元素或改变主体，需要根据当前审核规则谨慎判断。
- 官方资料：[Licensing contributor FAQ](https://support.500px.com/hc/en-us/articles/204728147-500px-Licensing-Contributor-FAQ)、[Content moderation guidelines](https://support.500px.com/hc/en-us/articles/115000374973-Content-Moderation-Guidelines)。

### EyeEm

- 历史官方贡献者页面仍能看到创作者入口和商业授权说明，但截至本研究日没有足够稳定的官方资料证明它仍是新的默认投稿渠道。
- 因此应用将 EyeEm 标成“待确认”，不把它计入推荐交付队列，也不会在用户未核实状态时引导批量上传。
- 核查入口：[EyeEm creator page](https://www.eyeem.com/signup/creator)。

## 产品实现边界

- 本地选择器只读取当前标签页中的文件 Blob；不保存照片像素、不读取第三方 Cookie、不读取账号登录状态，也不发送图片到应用服务器。
- 技术分级只使用文件类型、文件大小、像素尺寸、亮度、对比、清晰度和高光裁切等可解释信号。
- 未确认无人、版权、品牌和物业风险的照片不会被标为“可交付候选”。这不是人像识别，而是强制用户完成核查。
- CSV / JSON 只包含文件名、用户填写的元数据和派生指标，不包含本机绝对路径或照片像素。
- “打开官方投稿入口”只负责打开用户选择的平台页面；登录、上传原图、附加 release、接受当前条款和提交审核仍由用户在官方页面完成。
