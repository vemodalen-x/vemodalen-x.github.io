import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const SOURCE_URL = "https://x.mitbunny.ai/";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(repoRoot, "knowledge", "mitbunny-x-ai-influencers-2026-02-11.json");

function extractDataset(bundle) {
  const nodesMarker = 'nodes:[{id:"openai"';
  const markerIndex = bundle.indexOf(nodesMarker);
  if (markerIndex < 1 || bundle[markerIndex - 1] !== "{") {
    throw new Error("Could not locate the MIT Bunny graph dataset in the current bundle.");
  }

  const start = markerIndex - 1;
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = start; index < bundle.length; index += 1) {
    const character = bundle[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}" && --depth === 0) {
      const literal = bundle.slice(start, index + 1);
      return vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 5000 });
    }
  }
  throw new Error("The graph dataset object was not balanced.");
}

function extractUpdatedDate(bundle, datasetStart) {
  const prefix = bundle.slice(Math.max(0, datasetStart - 160), datasetStart);
  const matches = [...prefix.matchAll(/"([A-Z][a-z]+ \d{1,2}, \d{4})"/g)];
  return matches.at(-1)?.[1] || "February 11, 2026";
}

function summarizeGraph(data) {
  const incoming = new Map(data.nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(data.nodes.map((node) => [node.id, 0]));
  const directed = new Set(data.links.map((link) => `${link.source}>${link.target}`));
  for (const link of data.links) {
    incoming.set(link.target, (incoming.get(link.target) || 0) + 1);
    outgoing.set(link.source, (outgoing.get(link.source) || 0) + 1);
  }
  const reciprocalDirectedEdges = data.links.filter((link) => directed.has(`${link.target}>${link.source}`)).length;
  return {
    nodes: data.nodes.length,
    links: data.links.length,
    reciprocalPairs: reciprocalDirectedEdges / 2,
    reciprocity: Number((reciprocalDirectedEdges / data.links.length).toFixed(4)),
    groups: Object.fromEntries(
      ["company", "founder", "researcher", "investor", "media"].map((group) => [
        group,
        data.nodes.filter((node) => node.group === group).length
      ])
    ),
    incoming,
    outgoing
  };
}

async function main() {
  const pageResponse = await fetch(SOURCE_URL);
  if (!pageResponse.ok) throw new Error(`Homepage returned HTTP ${pageResponse.status}.`);
  const html = await pageResponse.text();
  const scriptMatch = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/i);
  if (!scriptMatch) throw new Error("Could not find the Vite module script.");
  const bundleUrl = new URL(scriptMatch[1], SOURCE_URL).href;
  const bundleResponse = await fetch(bundleUrl);
  if (!bundleResponse.ok) throw new Error(`Bundle returned HTTP ${bundleResponse.status}.`);
  const bundle = await bundleResponse.text();
  const data = extractDataset(bundle);
  const datasetStart = bundle.indexOf('nodes:[{id:"openai"') - 1;
  const graph = summarizeGraph(data);

  const payload = {
    schemaVersion: 1,
    source: {
      url: SOURCE_URL,
      bundleUrl,
      title: "AI Influencers on X",
      creatorUrl: "https://mitbunny.ai/",
      dataLastUpdated: extractUpdatedDate(bundle, datasetStart),
      retrievedAt: new Date().toISOString(),
      methodology: {
        seeds: ["OpenAI", "Anthropic", "Google DeepMind", "top researchers"],
        selectionScore: "log10(followers) x seed_connections",
        minimumFollowers: 1000,
        otherRules: ["AI keywords in bio", "blocklist for general media"],
        displayOrder: "followers descending"
      }
    },
    categories: {
      company: "Company / Organization",
      founder: "Founder / Builder",
      researcher: "Researcher / Academia",
      investor: "Investor",
      media: "Media"
    },
    stats: {
      nodes: graph.nodes,
      links: graph.links,
      reciprocalPairs: graph.reciprocalPairs,
      reciprocity: graph.reciprocity,
      groups: graph.groups
    },
    nodes: data.nodes.map((node) => ({
      id: node.id,
      name: node.name,
      handle: node.handle,
      group: node.group,
      role: node.role,
      followers: node.followers,
      following: node.following,
      joinedDate: node.joinedDate,
      location: node.location,
      website: node.website,
      incomingConnections: graph.incoming.get(node.id) || 0,
      outgoingConnections: graph.outgoing.get(node.id) || 0,
      xUrl: `https://x.com/${node.handle}`
    })),
    links: data.links.map((link) => ({ source: link.source, target: link.target }))
  };

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outputPath} with ${payload.stats.nodes} nodes and ${payload.stats.links} links.`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
