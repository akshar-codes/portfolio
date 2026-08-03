import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Backfills the schema additions introduced for the Projects/Categories
 * CMS expansion:
 *   - Project.featured → false when missing
 *   - Project.seo      → { metaTitle: "", metaDescription: "", metaKeywords: [], ogImage: "" } when missing
 *
 * (Category.order is backfilled by scripts/migrateOrder.js instead —
 * kept alongside the other `order` backfills for a single, predictable
 * migration entry point rather than splitting ordering concerns across
 * two scripts.)
 *
 * Idempotent: every field is only $set when genuinely absent from the
 * persisted document, so re-running after a partial or full success is
 * always safe. Mirrors the pattern established by
 * scripts/migrateResumeSchema.js / scripts/migrateSiteSettingsSchema.js.
 *
 * Deploy order: run this (and migrateOrder.js) BEFORE deploying the
 * updated API code. Mongoose does not backfill schema defaults onto
 * already-persisted documents read via `.lean()`, so pre-existing
 * projects would read back `featured: undefined` / `seo: undefined`
 * — silently breaking the admin table's featured badge and the
 * project editor's SEO section — until this migration (or an
 * explicit `.save()`) backfills them.
 */
const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const col = mongoose.connection.db.collection("projects");

    console.log("=".repeat(60));
    console.log("Migration: Project CMS schema expansion (featured, seo)");
    console.log("=".repeat(60));

    const docs = await col
      .find({
        $or: [{ featured: { $exists: false } }, { seo: { $exists: false } }],
      })
      .toArray();

    if (docs.length === 0) {
      console.log(
        "\n✓ All projects already have featured/seo fields — skipping.",
      );
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`\nFound ${docs.length} project(s) to backfill.\n`);

    const ops = docs.map((doc) => {
      const $set = {};
      if (doc.featured === undefined) $set.featured = false;
      if (doc.seo === undefined) {
        $set.seo = {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: [],
          ogImage: "",
        };
      }
      console.log(`  ✎ "${doc.title}" — backfilling: ${Object.keys($set).join(", ")}`);
      return { updateOne: { filter: { _id: doc._id }, update: { $set } } };
    });

    const result = await col.bulkWrite(ops, { ordered: false });

    console.log(`\n✓ Backfilled ${result.modifiedCount} document(s).`);
    console.log(
      "\nNote: utils/cache.js is an in-process, per-instance cache. If " +
        "the API server is currently running, restart it (or wait for " +
        "the 60s TTL) so the new fields are reflected in cached reads.",
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
