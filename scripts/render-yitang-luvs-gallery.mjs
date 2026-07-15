import fs from 'node:fs/promises';
import path from 'node:path';

const htmlPath = path.resolve('notes/yitang-luvS-learning-map-notes.html');
const assetIndexPath = path.resolve('knowledge/yitang-luvs-candy-assets.json');

const candyNotes = {
  1736: {
    title: '创业者技能树',
    note: '前 28 张主要是书籍与资料封面；第 29 张是业务模块分隔图，末尾图片来自评论或辅助内容。封面只证明资料池组成。',
    captions: [
      '《穷查理宝典》', '《原则》', '《人性的弱点》', '《金字塔原理》', '《高效能人士的七个习惯》',
      '《不确定世界的理性选择》', '《思考，快与慢》', '《乌合之众》', '《精益创业》', '《从 0 到 1》',
      '《创业维艰》', '《与运气竞争》', '《商业模式新生代》', '《商业的本质》', '《影响力》',
      '《企业生命周期》', '《穿越寒冬》', '《事实》', '《创业者手册》', '《硅谷钢铁侠》',
      '《史蒂夫·乔布斯传》', '《创业 36 条军规》', '《九败一胜》', '《低风险创业》', '《创业就是要细分垄断》',
      '《重新理解创业》', '《价值》', '《智能商业》', '模块二：业务', '评论区头像或辅助图片',
      '评论区占位图片', '评论区辅助图片', '评论区头像', '评论区头像', '评论区头像',
      '评论区头像', '评论区占位图片',
    ],
  },
  1740: {
    title: '马拉松大课五个案例',
    note: '前 6 张是飞书案例封面、客户样本和“找大客户 → 类比客户 → 建模分析客户”的三阶段课件；末 3 张是评论区头像。',
    captions: [
      '飞书案例封面', '先进企业客户样本', '第一阶段：找大客户', '第二阶段：类比已有客户', '第三阶段：建模分析客户',
      '案例分享者照片', '评论区头像', '评论区头像', '评论区头像',
    ],
  },
  2114: {
    title: '地图 PK 优秀作业',
    note: '14 张图包含分享人、课程与案例导航、方法来源、实证研究、关键假设、ABCD 模型，以及组织和个人能力两类天花板。',
    captions: [
      '古董分享人', '从新人入局到十年百店', '古董十年百店决策复盘', '搞砸 5：三个餐饮项目复盘', '知识管理开源',
      '团队成长：四个苦练基本功', '加速成长：四个最佳实践案例', '提前划重点', '从宏观视角理解一堂', '方法论的来源与底层逻辑',
      '实证研究：从真实案例出发', '概率与关键假设：提升成功概率', '关键假设 ABCD 模型', '组织能力与个人能力天花板',
    ],
  },
  2115: {
    title: '无限进步大地图高清版',
    note: '第 1 张是完整高清地图；其余 3 张来自评论区头像，不构成课程内容证据。',
    captions: ['无限进步大地图高清原图', '评论区头像', '评论区头像', '评论区头像'],
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const report = JSON.parse(await fs.readFile(assetIndexPath, 'utf8'));
if (!report.complete || report.cachedImageCount !== report.expectedImageCount) {
  throw new Error(`Candy image cache is incomplete: ${report.cachedImageCount}/${report.expectedImageCount}`);
}

const groups = Object.entries(candyNotes).map(([id, meta]) => {
  const assets = report.assets.filter((asset) => asset.candyId === Number(id));
  const figures = assets.map((asset) => {
    const caption = meta.captions[asset.imageIndex - 1] || `图片 ${asset.imageIndex}`;
    const dimensions = asset.width && asset.height ? `${asset.width}×${asset.height}` : '源页面未提供尺寸';
    const localPath = `../${asset.localPath}`;
    return `
          <figure class="gallery-item">
            <a href="${escapeHtml(localPath)}" title="打开本地原图">
              <img src="${escapeHtml(localPath)}" alt="${escapeHtml(meta.title)}：${escapeHtml(caption)}" loading="lazy">
            </a>
            <figcaption><strong>${String(asset.imageIndex).padStart(2, '0')}. ${escapeHtml(caption)}</strong><span>${dimensions} · ${escapeHtml(asset.contentType)}</span></figcaption>
          </figure>`;
  }).join('');

  return `
      <details class="gallery-group" data-candy-id="${id}">
        <summary><span>${escapeHtml(meta.title)}</span><b>${assets.length} 张</b></summary>
        <p class="gallery-note">${escapeHtml(meta.note)}</p>
        <div class="gallery-grid">${figures}
        </div>
      </details>`;
}).join('');

const gallery = `<!-- CANDY_GALLERY_START -->
      <section id="gallery">
        <h2>完整 Candy 图册</h2>
        <p>四份 Candy 的图片节点已全部缓存到本地，共 ${report.cachedImageCount}/${report.expectedImageCount} 张，失败 0 张。图册默认折叠以便阅读；展开后可逐张查看，点击图片可打开本地原图。</p>
        <div class="callout">图片已离线保存不等于结论已验证。书封、人物照和评论头像只作为来源上下文；课件和结构图可支持“资料中出现了什么”，仍不能单独证明方法有效。</div>${groups}
      </section>
      <!-- CANDY_GALLERY_END -->`;

let html = await fs.readFile(htmlPath, 'utf8');
const pattern = /<!-- CANDY_GALLERY_START -->[\s\S]*?<!-- CANDY_GALLERY_END -->/;
if (!pattern.test(html)) throw new Error('Gallery markers are missing from notes HTML.');
html = html.replace(pattern, gallery);
await fs.writeFile(htmlPath, html, 'utf8');

console.log(JSON.stringify({ htmlPath: path.relative(process.cwd(), htmlPath), groups: Object.keys(candyNotes).length, images: report.cachedImageCount }, null, 2));
