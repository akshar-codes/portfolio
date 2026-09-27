import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "public/generated/portfolio.json");
const apiBaseUrl = process.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const snapshotUrl = process.env.PORTFOLIO_SNAPSHOT_URL
  || (apiBaseUrl ? `${apiBaseUrl}/public/build-snapshot` : "");
const token = process.env.PORTFOLIO_SNAPSHOT_TOKEN;

if (!snapshotUrl || !token) {
  if (process.env.VERCEL) throw new Error("PORTFOLIO_SNAPSHOT_URL and PORTFOLIO_SNAPSHOT_TOKEN are required for Vercel builds.");
  console.warn("Skipping portfolio snapshot generation outside Vercel; set snapshot URL and token to build CMS content.");
  process.exit(0);
}

const parsedUrl = new URL(snapshotUrl);
if (parsedUrl.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(parsedUrl.hostname)) {
  throw new Error("PORTFOLIO_SNAPSHOT_URL must use HTTPS outside localhost.");
}

const response = await fetch(parsedUrl, {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok) throw new Error(`Snapshot fetch failed with HTTP ${response.status}.`);

const body = await response.json();
const snapshot = body?.data ?? body;
const requiredFields = ["profile", "about", "resume", "projects", "categories", "navigation", "footer", "siteSettings", "seo"];
if (!snapshot || requiredFields.some((field) => !(field in snapshot))) {
  throw new Error("The backend returned an incomplete portfolio snapshot.");
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(snapshot)}\n`, "utf8");
console.info(`Generated portfolio snapshot (${snapshot.projects.length} projects).`);
