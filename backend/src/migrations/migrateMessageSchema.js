import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Backfills the schema additions introduced for the expanded Messages
 * management module (archive/restore workflow + spam detection
 * support):
 *   - isArchived  → false when missing
 *   - isSpam      → false when missing
 *   - spamScore   → 0 when missing
 *   - spamReasons → [] when missing
 *   - ipAddress   → "" when missing
 *   - userAgent   → "" when missing
 *
 * Not strictly required for correctness — every query that filters on
 * isArchived/isSpam uses `{ $ne: true }` rather than `{ $eq: false }`
 * (see services/messageService.js fetchAllMessages), so documents
 * missing these fields are already treated as "not archived" / "not
 * spam" and remain fully visible in the default inbox view. This
 * script exists purely to make that implicit state explicit and
 * self-describing in the database — mirrors the rationale in
 * scripts/migrateContentStatus.js and scripts/migrateMediaSchema.js.
 * Safe to skip, and safe to re-run.
 */
const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const col = mongoose.connection.db.collection("messages");

    console.log("=".repeat(60));
    console.log("Migration: Messages schema expansion (archive, spam)");
    console.log("=".repeat(60));

    const [archived, spam, score, reasons, ip, ua] = await Promise.all([
      col.updateMany(
        { isArchived: { $exists: false } },
        { $set: { isArchived: false } },
      ),
      col.updateMany({ isSpam: { $exists: false } }, { $set: { isSpam: false } }),
      col.updateMany({ spamScore: { $exists: false } }, { $set: { spamScore: 0 } }),
      col.updateMany(
        { spamReasons: { $exists: false } },
        { $set: { spamReasons: [] } },
      ),
      col.updateMany({ ipAddress: { $exists: false } }, { $set: { ipAddress: "" } }),
      col.updateMany({ userAgent: { $exists: false } }, { $set: { userAgent: "" } }),
    ]);

    console.log(`  ✓ isArchived backfilled on ${archived.modifiedCount} document(s).`);
    console.log(`  ✓ isSpam backfilled on ${spam.modifiedCount} document(s).`);
    console.log(`  ✓ spamScore backfilled on ${score.modifiedCount} document(s).`);
    console.log(`  ✓ spamReasons backfilled on ${reasons.modifiedCount} document(s).`);
    console.log(`  ✓ ipAddress backfilled on ${ip.modifiedCount} document(s).`);
    console.log(`  ✓ userAgent backfilled on ${ua.modifiedCount} document(s).`);

    console.log(
      "\nNote: the Messages module does not use utils/cache.js (admin " +
        "reads are always live), so no cache invalidation step is needed here.",
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
