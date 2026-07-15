import fs from "node:fs";
import path from "node:path";

const assetIndexPath = path.resolve("knowledge/yitang-accessible-course-assets.json");
const captureManifestPath = path.resolve(
  "assets/yitang-accessible/protected-browser-captures/capture-manifest.json",
);

const index = JSON.parse(fs.readFileSync(assetIndexPath, "utf8"));
const captureManifest = JSON.parse(fs.readFileSync(captureManifestPath, "utf8"));
const capturedByToken = new Map(
  captureManifest.results
    .filter((item) => item.status === "captured")
    .map((item) => [item.sourceToken, item]),
);

for (const asset of index.assets) {
  if (asset.status === "cached") {
    asset.effectiveStatus = "cached";
    continue;
  }

  const match = [...capturedByToken.entries()].find(([token]) => asset.sourceUrl.includes(token));
  if (!match) {
    asset.effectiveStatus = "missing";
    continue;
  }

  const capture = match[1];
  asset.effectiveStatus = "captured-browser";
  asset.browserCapture = {
    localPath: capture.localPath,
    bytes: capture.bytes,
    capturedAt: captureManifest.capturedAt,
    method: "authenticated browser element screenshot",
  };
}

index.browserCapturedAssets = index.assets.filter(
  (asset) => asset.effectiveStatus === "captured-browser",
).length;
index.effectiveCachedAssets = index.assets.filter(
  (asset) => ["cached", "captured-browser"].includes(asset.effectiveStatus),
).length;
index.effectiveMissingAssets = index.expectedUniqueAssets - index.effectiveCachedAssets;
index.effectiveComplete = index.effectiveMissingAssets === 0;
index.reconciledAt = new Date().toISOString();

fs.writeFileSync(assetIndexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
process.stdout.write(
  JSON.stringify(
    {
      expected: index.expectedUniqueAssets,
      directCached: index.cachedAssets,
      browserCaptured: index.browserCapturedAssets,
      effectiveCached: index.effectiveCachedAssets,
      missing: index.effectiveMissingAssets,
      complete: index.effectiveComplete,
    },
    null,
    2,
  ),
);
