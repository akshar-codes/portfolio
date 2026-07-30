import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Backfills the schema additions introduced for the full Profile CMS
 * (hero introduction, CTA buttons, statistics strip):
 *   - introduction  → "" when missing
 *   - ctaButtons    → [] when missing
 *   - statistics    → [] when missing
 *
 * The `owner`/`status` fields themselves need NO migration — Profile
 * already stored fields with those exact names/types before this
 * change; moving the model onto `singletonPlugin` only consolidates
 * the declaration, it does not alter the persisted shape.
 *
 * Idempotent: every field is only $set when genuinely absent from the
 * persisted document, so re-running after a partial or full success is
 * always safe. Mirrors the pattern established by
 * scripts/migrateResumeSchema.js / scripts/migrateSiteSettingsSchema.js.
 */
const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const col = mongoose.connection.db.collection("profiles");

    console.log("=".repeat(60));
    console.log("Migration: Profile CMS schema expansion");
    console.log("=".repeat(60));

    const doc = await col.findOne({ owner: "default" });

    if (!doc) {
      console.log(
        "\nNo existing Profile singleton found — nothing to migrate.",
      );
      console.log(
        "A new document matching the full schema will be created " +
          "automatically on first read/write via getSingleton(), or by " +
          "running scripts/seedProfile.js.",
      );
      await mongoose.connection.close();
      process.exit(0);
    }

    const $set = {};
    const migratedFields = [];

    if (doc.introduction === undefined) {
      $set.introduction = "";
      migratedFields.push("introduction");
    }
    if (!Array.isArray(doc.ctaButtons)) {
      $set.ctaButtons = [];
      migratedFields.push("ctaButtons");
    }
    if (!Array.isArray(doc.statistics)) {
      $set.statistics = [];
      migratedFields.push("statistics");
    }

    if (migratedFields.length === 0) {
      console.log(
        "\n✓ Profile document already matches the new schema — skipping.",
      );
      await mongoose.connection.close();
      process.exit(0);
    }

    await col.updateOne({ owner: "default" }, { $set });

    console.log("\n✓ Migration applied. Fields updated:");
    migratedFields.forEach((f) => console.log(`  - ${f}`));

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
