import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * BREAKING CHANGE — REQUIRED DEPLOY ORDER.
 *
 * Prior to this change, public reads checked `status !== "draft"`,
 * so a document missing the `status` field entirely (i.e. every
 * document created before the publish workflow existed) was treated
 * as publicly visible.
 *
 * The new 5-state workflow (draft/scheduled/published/unpublished/
 * archived) tightens this to a STRICT `status === "published"` check
 * everywhere on the public side (see constants/index.js). A document
 * missing `status` would therefore silently disappear from the public
 * site the moment the new API code deploys.
 *
 * This script must be run BEFORE deploying the new backend code. It:
 *   1. Backfills `status: "published"` on every document across all
 *      9 CMS collections that doesn't already have a status field —
 *      preserving their previously-implicit public visibility.
 *   2. Backfills the new scheduling/workflow timestamp fields
 *      (publishAt, publishedAt, unpublishedAt, archivedAt) to `null`
 *      wherever missing, so the new Mongoose schema's `enum`/type
 *      validation never trips on a `.save()` of a pre-existing
 *      document that predates these fields.
 *
 * Idempotent — every field is only $set when genuinely absent, so
 * re-running after a partial or full success is always safe.
 */
const COLLECTIONS = [
  "siteSettings",
  "navigation",
  "footer",
  "seo",
  "profiles",
  "about",
  "resumes",
  "projects",
  "categories",
];

const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const db = mongoose.connection.db;

    console.log("=".repeat(60));
    console.log("Migration: publishing workflow (draft/scheduled/published/unpublished/archived)");
    console.log("=".repeat(60));

    for (const name of COLLECTIONS) {
      const col = db.collection(name);

      const statusResult = await col.updateMany(
        { status: { $exists: false } },
        { $set: { status: "published" } },
      );

      const timestampResult = await col.updateMany(
        {
          $or: [
            { publishAt: { $exists: false } },
            { publishedAt: { $exists: false } },
            { unpublishedAt: { $exists: false } },
            { archivedAt: { $exists: false } },
          ],
        },
        {
          $set: {
            publishAt: null,
            publishedAt: null,
            unpublishedAt: null,
            archivedAt: null,
          },
        },
      );

      console.log(
        `  ✓ ${name}: ${statusResult.modifiedCount} document(s) backfilled to "published"; ` +
          `${timestampResult.modifiedCount} document(s) given workflow timestamp fields.`,
      );
    }

    console.log("\n✅ Publishing workflow migration completed successfully.");
    console.log(
      "\nNote: utils/cache.js is an in-process, per-instance cache. If " +
        "the API server is currently running, restart it (or wait for " +
        "the 60s TTL) so cached reads reflect the backfilled status.",
    );
    console.log("=".repeat(60) + "\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("\n✗ Migration failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

migrate();
