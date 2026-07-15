import fs from "node:fs/promises";
import path from "node:path";

const endpoint = "https://www.dwarkesh.com/api/v1/archive";
const outputPath = path.resolve("knowledge/dwarkesh-archive-index.json");
const pageSize = 50;

async function fetchPage(offset) {
  const url = new URL(endpoint);
  url.searchParams.set("sort", "new");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", String(pageSize));

  const response = await fetch(url, {
    headers: { "user-agent": "BusinessTutorArchiveIndexer/1.0" }
  });
  if (!response.ok) {
    throw new Error(`Archive request failed (${response.status}): ${url}`);
  }
  return response.json();
}

const archive = [];
let offset = 0;
let pageCount = 0;

while (true) {
  const page = await fetchPage(offset);
  if (!Array.isArray(page) || page.length === 0) break;
  archive.push(...page);
  offset += page.length;
  pageCount += 1;
  if (pageCount > 20) throw new Error("Archive pagination exceeded the safety limit.");
}

const posts = [...new Map(archive.map((post) => [post.id, post])).values()]
  .map((post) => ({
    id: post.id,
    postDate: post.post_date,
    title: post.title,
    subtitle: post.subtitle || "",
    slug: post.slug,
    type: post.type,
    url: post.canonical_url || `https://www.dwarkesh.com/p/${post.slug}`,
    coverImage: post.cover_image || ""
  }))
  .sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

const byType = Object.fromEntries(
  Object.entries(Object.groupBy(posts, (post) => post.type || "unknown"))
    .map(([type, items]) => [type, items.length])
    .sort(([a], [b]) => a.localeCompare(b))
);
const byYear = Object.fromEntries(
  Object.entries(Object.groupBy(posts, (post) => post.postDate.slice(0, 4)))
    .map(([year, items]) => [year, items.length])
    .sort(([a], [b]) => b.localeCompare(a))
);

const payload = {
  source: "https://www.dwarkesh.com/archive",
  syncedAt: new Date().toISOString(),
  total: posts.length,
  byType,
  byYear,
  usageBoundary: "Public archive metadata only. Curated RAG cards contain summaries, not transcripts or full articles.",
  posts
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ outputPath, total: posts.length, byType, byYear }, null, 2));
