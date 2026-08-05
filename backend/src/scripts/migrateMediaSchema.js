import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Backfills the schema additions introduced for the full Media Library
 * dashboard (trash/restore workflow + captions):
 *   - Media.caption   → "" when missing
 *   - Media.deletedAt → null when missing
 *
 * Neither backfill is strictly required for correctness — Mongoose
 * applies schema defaults when hydrating documents read via `find()`
 * (non-lean), and MongoDB's `{ deletedAt: null }` filter already
 * matches documents where the field is entirely absent. This script
 * exists purely to make that implicit state explicit and
 * self-describing in the database, mirroring
 * scripts/migrateContentStatus.js's rationale — safe to skip, and
 * safe to re-run.
 */
const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const col = mongoose.connection.db.collection("media");

    console.log("=".repeat(60));
    console.log("Migration: Media Library schema expansion (caption, deletedAt)");
    console.log("=".repeat(60));

    const captionResult = await col.updateMany(
      { caption: { $exists: false } },
      { $set: { caption: "" } },
    );
    console.log(`  ✓ caption backfilled on ${captionResult.modifiedCount} document(s).`);

    const deletedAtResult = await col.updateMany(
      { deletedAt: { $exists: false } },
      { $set: { deletedAt: null } },
    );
    console.log(`  ✓ deletedAt backfilled on ${deletedAtResult.modifiedCount} document(s).`);

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
