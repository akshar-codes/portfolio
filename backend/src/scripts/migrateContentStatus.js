import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Backfills `status: "published"` onto every existing CMS document that
 * predates the draft/publish workflow.
 *
 * This is defensive housekeeping, NOT a required step: every service
 * that gates a public read checks `status === "draft"` rather than
 * `status !== "published"` (see the note on CONTENT_STATUS_DRAFT in
 * utils/constants.js), so documents missing the field entirely are
 * already treated as published. Running this script just makes that
 * implicit state explicit and self-describing in the database — safe
 * to skip, and safe to re-run.
 */
const COLLECTIONS = [
  "profiles",
  "about",
  "resumes",
  "projects",
  "categories",
  "siteSettings",
  "navigation",
  "footer",
  "seo",
];

const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const db = mongoose.connection.db;

    console.log("=".repeat(60));
    console.log("Migration: backfill content status (draft/publish)");
    console.log("=".repeat(60));

    for (const name of COLLECTIONS) {
      const col = db.collection(name);
      const result = await col.updateMany(
        { status: { $exists: false } },
        { $set: { status: "published" } },
      );
      console.log(
        `  ✓ ${name}: ${result.modifiedCount} document(s) backfilled.`,
      );
    }

    console.log("\n✅ Content status migration completed successfully.");
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
