import fs from "node:fs/promises";
import path from "node:path";

const lessonId = "luvS64ef293fbe0d";
const lessonUrl = `https://yitang.top/lesson/${lessonId}?tab=candy`;
const outputPath = path.resolve("knowledge/yitang-luvs-learning-map-index.json");

const electiveAudit = JSON.parse(await fs.readFile("tmp/yitang-elective-audit.json", "utf8"));
const sectionAudit = JSON.parse(await fs.readFile("tmp/yitang-elective-sections.json", "utf8"));
const candyAudit = JSON.parse(await fs.readFile("tmp/yitang-candy-docs-audit.json", "utf8"));

const lessonPages = electiveAudit.pages.filter((page) => page.id === lessonId);
const contentPage = lessonPages.find((page) => page.kind === "lesson-content");
const candyPage = lessonPages.find((page) => page.kind === "lesson-candy");
if (!contentPage || !candyPage) throw new Error(`Lesson ${lessonId} was not found in the authenticated audit.`);

const lessonModel = contentPage.lessonModels[0];
const sectionModels = [...contentPage.sectionModels, ...candyPage.sectionModels];
const sectionById = new Map(sectionAudit.sections.map((section) => {
  const match = section.url.match(/\/section\/(\d+)/);
  return [Number(match?.[1]), section];
}));

const candyDocIds = {
  1736: "VsSvdgXRdo4BSIxnlaMc2EMHnlh",
  1740: "J0dTdBbJ4oQhFDxaj7WcRF3LnPh",
  2115: "X8OBdCMB1oaKQOx6UeTcq2gRnTe",
  2114: "F4Mad6AOGojyMHxJJkVcFeuwndh"
};

function classifyImage(image) {
  if (/qlogo\.cn/.test(image.src)) return "comment-avatar";
  if (/home\.png|audio-back\.png/.test(image.src)) return "interface-asset";
  if (image.naturalWidth === 11811 && image.naturalHeight === 4961) return "primary-map";
  return "source-visual";
}

function normalizeImages(images = []) {
  return images.map((image) => ({
    src: image.src,
    alt: image.alt || "",
    width: image.naturalWidth || 0,
    height: image.naturalHeight || 0,
    role: classifyImage(image)
  }));
}

const courseSections = contentPage.sectionModels.map((model) => {
  const section = sectionById.get(model.id);
  return {
    id: model.id,
    title: model.title,
    durationMinutes: model.duration,
    url: `https://yitang.top/lesson/section/${model.id}?tab=content`,
    externalDocs: section?.externalDocs || [],
    sourceDescription: section?.text || "",
    images: normalizeImages(section?.images || [])
      .filter((image) => image.role !== "interface-asset")
  };
});

const candies = candyPage.sectionModels.map((model) => {
  const docId = candyDocIds[model.id];
  const document = candyAudit.docs.find((doc) => doc.url.includes(docId));
  if (!document) throw new Error(`Candy document ${docId} was not found.`);
  return {
    id: model.id,
    title: model.title,
    type: model.category,
    sectionUrl: `https://yitang.top/lesson/section/${model.id}?tab=candy`,
    documentUrl: document.url,
    headings: document.headings,
    textLength: document.textLength,
    imageCount: document.imageCount,
    images: normalizeImages(document.images)
  };
});

const candyImages = candies.flatMap((candy) => candy.images);
const payload = {
  sourceLessonUrl: lessonUrl,
  builtAt: new Date().toISOString(),
  sourceAuditDates: [...new Set(lessonPages.map((page) => page.collectedAt).filter(Boolean))],
  usageBoundary: "Authenticated course metadata and image index. Notes contain original summaries rather than transcripts or full paid materials.",
  lesson: {
    id: lessonId,
    name: lessonModel.name,
    subtitle: lessonModel.subtitle,
    teacher: lessonModel.teacherName,
    coverImage: lessonModel.coverImage,
    lessonStatus: lessonModel.lessonStatus,
    homeworkExists: lessonModel.homeworkExists,
    homeworkCompleted: contentPage.text.includes("恭喜顺利完成作业"),
    candyUnlocked: candyPage.text.includes("课后礼物已解锁"),
    sectionCount: contentPage.sectionModels.length,
    candyCount: candyPage.sectionModels.length
  },
  courseSections,
  candies,
  visualAudit: {
    candyImageNodes: candyImages.length,
    primaryMaps: candyImages.filter((image) => image.role === "primary-map").length,
    commentAvatars: candyImages.filter((image) => image.role === "comment-avatar").length,
    sourceVisuals: candyImages.filter((image) => image.role === "source-visual").length,
    keyVisuals: [
      { role: "course-cover", src: lessonModel.coverImage, boundary: "Navigation metaphor; not course-structure evidence." },
      { role: "course-page-asset", src: "https://cdn.yitang.top/upload/ether-public/yitang/1650961844bfd22532ae0105855361bab25a5172a7e022889e.png", boundary: "Sharing banner; not learning-result evidence." },
      { role: "case-cover", src: "https://cdn.yitang.top/localfile/prod/3f7071b203382d40bde4e6976b64e7f9.png", boundary: "Identifies one Feishu case; the mechanism requires the case content." },
      { role: "work-sample-photo", src: "https://cdn.yitang.top/localfile/prod/5900b7afe0833bbfc1c3817d951aff5e.png", boundary: "Identifies a contributor; not evidence that the method transfers." },
      { role: "primary-map", src: "https://cdn.yitang.top/localfile/prod/b27c5fd5d476cca0715280470c23922e.png", width: 11811, height: 4961, boundary: "Shows the curriculum topology; does not prove learning outcomes." }
    ]
  }
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  outputPath,
  sections: payload.lesson.sectionCount,
  candies: payload.lesson.candyCount,
  candyImageNodes: payload.visualAudit.candyImageNodes,
  homeworkCompleted: payload.lesson.homeworkCompleted,
  candyUnlocked: payload.lesson.candyUnlocked
}, null, 2));
