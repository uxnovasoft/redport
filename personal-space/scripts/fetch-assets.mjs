// Downloads every static asset from the Figma design into ./assets
// Usage:  node scripts/fetch-assets.mjs        (Node 18+)
//
// NOTE: Figma MCP asset URLs expire after 7 days. If a download fails with
// 403/404, ask your agent to re-run the Figma design-context call (node 4249:1793,
// file CNz1PRNiNBYwlaqBx73PyB) and paste the fresh URLs below.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
const base = "https://www.figma.com/api/mcp/asset/";

const assets = {
  // Backgrounds & imagery
  "hero-bg.png": "efd82b3d-152b-4ae4-bb30-246aa43c7718.png",
  "grain-red.png": "4bab755c-9847-40c2-9266-9e00b63be775.png",
  "shot-makeillust.png": "f3df22f2-f522-4ede-b175-e3d2043d071a.png",
  "shot-chatflow.png": "53c3ae40-db33-4d07-903d-5324a7d2448f.png",
  "avatar-featured.png": "3b86a11a-f326-4f0b-adcc-16b70159402f.png",
  "avatar-card.png": "1ca041f0-6c65-46d9-89db-0a9808bffa54.png",

  // Logo & dot
  "logo.svg": "f90db96e-ba89-48dd-b6de-d3bc22a2e3f3.svg",
  "dot.svg": "8fe9d90c-ec3f-48c8-9c9f-bb214efeaff2.svg",

  // Arrow icons
  "icon-arrow-on-dark.svg": "981fc673-bf7e-46d6-a37b-7ef8e6ba9c61.svg", // 20px, red/dark/outline buttons
  "icon-arrow-on-light.svg": "95834fc8-a936-4441-bc71-290ae98cef43.svg", // 20px, white button
  "icon-arrow-circle.svg": "8b5737c6-1fca-46bc-a617-a37b3afeaa24.svg", // 22px, dark/red circles
  "icon-arrow-circle-on-white.svg": "f5951d8b-8844-4879-a52a-ac442e4d3f63.svg", // 22px, white circle (highlight card)
};

await mkdir(root, { recursive: true });

let failed = 0;
for (const [file, id] of Object.entries(assets)) {
  const res = await fetch(base + id);
  if (!res.ok) {
    console.error(`✗ ${file}  (HTTP ${res.status})`);
    failed++;
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(root, file), buf);
  console.log(`✓ ${file}  ${(buf.length / 1024).toFixed(1)} KB`);
}

if (failed) {
  console.error(`\n${failed} asset(s) failed. The links may have expired (7-day limit).`);
  process.exit(1);
}
console.log("\nAll assets downloaded.");
