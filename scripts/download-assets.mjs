// Downloads all mission card images (25) and terrain layout images (15 pairings x 3)
// from gdmissions.app into assets/, so the app works offline at the venue.
// For layouts only one slug ordering exists per pairing — we try a-vs-b then b-vs-a.
// Also writes assets/manifest.json (used by the service worker to precache everything).
//
// Usage: node scripts/download-assets.mjs

import { MISSION_MATRIX } from "../data.js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const GDM = "https://gdmissions.app/assets/11th";
const ROOT = new URL("..", import.meta.url).pathname;

const slug = (s) => s.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");

const downloaded = [];
const failed = [];

async function fetchImage(url) {
  const res = await fetch(url, { headers: { "User-Agent": "emperors-tarot-asset-fetch" } });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") || "";
  if (!type.startsWith("image/")) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function save(relPath, buf) {
  const abs = path.join(ROOT, relPath);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, buf);
  downloaded.push(relPath);
  console.log("  ✓", relPath, `(${(buf.length / 1024).toFixed(0)} KB)`);
}

const dispos = Object.keys(MISSION_MATRIX);

// --- Mission cards: MISSION_MATRIX[myDispo][oppDispo] -> primary-missions/{dispoSlug}/{missionSlug}.png
console.log("Mission cards:");
for (const myDispo of dispos) {
  for (const oppDispo of dispos) {
    const mission = MISSION_MATRIX[myDispo][oppDispo];
    const rel = `assets/missions/${slug(myDispo)}/${slug(mission)}.png`;
    const url = `${GDM}/primary-missions/${slug(myDispo)}/${slug(mission)}.png`;
    const buf = await fetchImage(url);
    if (buf) await save(rel, buf);
    else {
      failed.push(url);
      console.log("  ✗", url);
    }
  }
}

// --- Terrain layouts: every unordered pairing (incl. mirror matches), 3 layouts each.
console.log("Terrain layouts:");
for (let a = 0; a < dispos.length; a++) {
  for (let b = a; b < dispos.length; b++) {
    const sa = slug(dispos[a]);
    const sb = slug(dispos[b]);
    for (const i of [1, 2, 3]) {
      const candidates =
        a === b
          ? [`${sa}-vs-${sb}-${i}`, `${sa}-mirror-${i}`]
          : [`${sa}-vs-${sb}-${i}`, `${sb}-vs-${sa}-${i}`];
      let ok = false;
      for (const name of candidates) {
        const buf = await fetchImage(`${GDM}/layouts/no-measurements/${name}.png`);
        if (buf) {
          await save(`assets/layouts/${name}.png`, buf);
          ok = true;
          break;
        }
      }
      if (!ok) {
        failed.push(`layouts ${sa}-vs-${sb}-${i} (both orderings)`);
        console.log("  ✗", `${sa}-vs-${sb}-${i} (both orderings failed)`);
      }
    }
  }
}

// --- Precache manifest for the service worker
const manifest = ["index.html", "styles.css", "app.js", "data.js", "vendor/jspdf.umd.min.js", "assets/map-layout.png", ...downloaded];
await writeFile(path.join(ROOT, "assets/manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`\nDone: ${downloaded.length} images downloaded, ${failed.length} failed.`);
if (failed.length) {
  console.log("Failed:");
  for (const f of failed) console.log("  -", f);
  process.exitCode = 1;
}
