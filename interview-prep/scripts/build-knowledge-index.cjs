const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'knowledge-index.js');
const allClusters = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'];

const metadata = {
  'README.md': { kind: '准备包入口', description: '全部学习材料、来源取舍与推荐使用顺序。', clusters: allClusters, order: 1 },
  'practice-roadmap.md': { kind: '统一路线', description: '八个能力簇、依赖关系、六周激活路径与缺口路由。', clusters: allClusters, order: 2 },
  'study-plan.md': { kind: '六周计划', description: '每周目标、每日训练、复习间隔、自测与临场策略。', clusters: allClusters, order: 3 },
  'question-bank.md': { kind: '核心题库', description: '90 道项目、ML、CV、端侧、系统、Agent、编码与行为题。', clusters: allClusters, order: 4 },
  'ml-interviews-book-plan.md': { kind: '面试基础', description: 'Senior 信号、数学、数据、ML workflow、训练与 CV 盲区。', clusters: ['K1', 'K2', 'K3', 'K4', 'K5'], order: 10 },
  'tech-interview-handbook-plan.md': { kind: '面试执行', description: '编码协议、行为故事、自我介绍、JD 映射与模拟复盘。', clusters: ['K1', 'K7'], order: 11 },
  'algo-note-plan.md': { kind: '算法路线', description: '32 道 AI/CV/Edge 岗位核心算法题与双语言训练方法。', clusters: ['K7'], order: 12 },
  'blind-75-plan.md': { kind: '算法补充', description: 'Blind 75 覆盖审计、12 道缺口题与模式迁移。', clusters: ['K7'], order: 13 },
  'deep-ml-plan.md': { kind: 'ML 实现', description: '数值、经典 ML、CV 张量、优化器与 Transformer 实现题。', clusters: ['K2', 'K3', 'K4', 'K5', 'K8'], order: 14 },
  'reflection-summary-plan.md': { kind: '经典追问', description: '数学、数据、经典 ML、归一化与 Attention 深挖链。', clusters: ['K2', 'K3', 'K4', 'K5', 'K8'], order: 15 },
  'tuning-playbook-plan.md': { kind: '训练实验', description: 'Baseline、搜索、方差、故障诊断、checkpoint 与追踪。', clusters: ['K3', 'K4'], order: 16 },
  'key-book-plan.md': { kind: '理论加深', description: 'PAC、复杂度、泛化、稳定性、一致性与收敛。', clusters: ['K2', 'K3', 'K4'], order: 17 },
  'ai-agents-in-depth-plan.md': { kind: 'Agent 主线', description: '运行时 Harness、上下文、工具、Coding Agent、评估与多 Agent。', clusters: ['K8'], order: 18 },
  'harness-engineering-plan.md': { kind: 'Agent 仓库工程', description: 'Repo map、SPEC、机械回压、行为评测与熵管理。', clusters: ['K7', 'K8'], order: 19 },
  'agent-harness-podcast-plan.md': { kind: '播客听辨', description: '用会跑、跑久、跑稳三层框架学习 Harness，并校验强主张。', clusters: ['K8'], order: 20 },
  'learning-experience-v3.md': { kind: '系统说明', description: 'Learning OS V3 的学习科学、状态模型与验证契约。', clusters: ['META'], order: 30 },
  'learning-experience-v2.md': { kind: '历史设计', description: 'V2 设计评审与从静态计划到自适应系统的演进记录。', clusters: ['META'], order: 31 }
};

function cleanInlineMarkdown(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function inferClusters(fileName, heading, fallback) {
  const direct = [...heading.matchAll(/\bK([1-8])\b/gi)].map((match) => `K${match[1]}`);
  if (direct.length) return [...new Set(direct)];
  if (fileName === 'question-bank.md') {
    if (/^[RB]\./.test(heading)) return ['K1'];
    if (/^M\./.test(heading)) return ['K2', 'K3', 'K4'];
    if (/^C\./.test(heading)) return ['K5'];
    if (/^D\./.test(heading)) return ['K3'];
    if (/^E\./.test(heading)) return ['K4', 'K5'];
    if (/^F\./.test(heading)) return ['K6'];
    if (/^S\./.test(heading)) return ['K3', 'K8'];
    if (/^G\./.test(heading)) return ['K8'];
    if (/^A\./.test(heading)) return ['K7'];
  }
  return fallback.slice();
}

function makeSnippet(content) {
  const plain = cleanInlineMarkdown(content)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-|>]\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 180 ? `${plain.slice(0, 177)}…` : plain;
}

function parseDocument(fileName, meta) {
  const source = fs.readFileSync(path.join(root, fileName), 'utf8').replace(/\r\n/g, '\n');
  const lines = source.split('\n');
  const headings = [];
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,4})\s+(.+?)\s*$/);
    if (match) headings.push({ index, level: match[1].length, title: cleanInlineMarkdown(match[2]) });
  });
  if (!headings.length) throw new Error(`${fileName} has no headings.`);

  const title = headings[0].title;
  const stack = [];
  const sections = headings.map((heading, index) => {
    stack.length = heading.level - 1;
    stack[heading.level - 1] = heading.title;
    const breadcrumb = stack.filter(Boolean).slice();
    const end = index + 1 < headings.length ? headings[index + 1].index : lines.length;
    const content = lines.slice(heading.index + 1, end).join('\n').trim();
    const clusters = inferClusters(fileName, heading.title, meta.clusters);
    return {
      id: `${path.basename(fileName, '.md')}--${String(index + 1).padStart(3, '0')}`,
      documentId: path.basename(fileName, '.md'),
      path: fileName,
      title: heading.title,
      breadcrumb,
      level: heading.level,
      clusters,
      content,
      snippet: makeSnippet(content)
    };
  });

  return {
    document: {
      id: path.basename(fileName, '.md'),
      path: fileName,
      title,
      kind: meta.kind,
      description: meta.description,
      clusters: meta.clusters,
      order: meta.order,
      sectionCount: sections.length,
      characterCount: source.replace(/\s/g, '').length
    },
    sections
  };
}

const markdownFiles = fs.readdirSync(root).filter((name) => name.endsWith('.md')).sort();
const unknownFiles = markdownFiles.filter((name) => !metadata[name]);
const missingFiles = Object.keys(metadata).filter((name) => !markdownFiles.includes(name));
if (unknownFiles.length || missingFiles.length) {
  throw new Error(`Knowledge metadata mismatch. Unknown: ${unknownFiles.join(', ') || 'none'}; missing: ${missingFiles.join(', ') || 'none'}.`);
}

const parsed = markdownFiles.map((name) => parseDocument(name, metadata[name]));
const documents = parsed.map((item) => item.document).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'zh-CN'));
const sections = parsed.flatMap((item) => item.sections);
const payload = {
  version: 1,
  sourceCount: documents.length,
  sectionCount: sections.length,
  documents,
  sections
};
const serialized = JSON.stringify(payload).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const banner = '/* Generated by scripts/build-knowledge-index.cjs. Do not edit by hand. */\n';
fs.writeFileSync(outputPath, `${banner}window.INTERVIEW_KNOWLEDGE = ${serialized};\n`, 'utf8');
console.log(JSON.stringify({ output: outputPath, sources: documents.length, sections: sections.length }, null, 2));
