import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Migrates the About singleton onto the redesigned CMS schema:
 *   - paragraphs[] (flat, plain-text)  → biography (single rich-text field)
 *   - services[]                      → unchanged, no migration needed
 *   - timeline / skillsSummary / highlights / personalInfo / images
 *     → newly introduced, defaulted to [] when absent
 *
 * `paragraphs` is intentionally $unset after being folded into
 * `biography` — the field no longer exists on the schema, so leaving
 * it in the database would be dead data.
 *
 * Idempotent: `biography` is only derived once (skipped if it already
 * exists from a prior run), and every new array field is only $set
 * when genuinely absent — safe to re-run at any point.
 *
 * BREAKING CHANGE — deploy order: run this BEFORE deploying the
 * updated API code (same convention as migrateSiteSettingsSchema.js),
 * since the new aboutService.js/aboutValidators.js no longer know how
 * to read or validate `paragraphs`. The admin UI (ManageAbout.jsx) has
 * been rewritten to edit `biography` via a rich-text editor instead of
 * the old paragraph-list UI — redeploy the frontend alongside this.
 */

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function paragraphsToBiography(paragraphs = []) {
  const sorted = [...paragraphs].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  return sorted
    .map((p) => `<p>${escapeHtml((p.text ?? "").trim())}</p>`)
    .filter((html) => html !== "<p></p>")
    .join("");
}

const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const col = mongoose.connection.db.collection("about");

    console.log("=".repeat(60));
    console.log("Migration: About CMS schema redesign (paragraphs → biography)");
    console.log("=".repeat(60));

    const doc = await col.findOne({ owner: "default" });

    if (!doc) {
      console.log(
        "\nNo existing About singleton found — nothing to migrate.",
      );
      console.log(
        "A new document matching the full schema will be created " +
          "automatically on first read/write via getSingleton(), or by " +
          "running scripts/seedAbout.js.",
      );
      await mongoose.connection.close();
      process.exit(0);
    }

    const $set = {};
    const $unset = {};
    const migratedFields = [];

    if (doc.biography === undefined) {
      $set.biography = Array.isArray(doc.paragraphs)
        ? paragraphsToBiography(doc.paragraphs)
        : "";
      migratedFields.push("biography (derived from paragraphs)");

      if (doc.paragraphs !== undefined) {
        $unset.paragraphs = "";
        migratedFields.push("paragraphs (removed — superseded by biography)");
      }
    }

    if (!Array.isArray(doc.skillsSummary)) {
      $set.skillsSummary = [];
      migratedFields.push("skillsSummary");
    }
    if (!Array.isArray(doc.timeline)) {
      $set.timeline = [];
      migratedFields.push("timeline");
    }
    if (!Array.isArray(doc.highlights)) {
      $set.highlights = [];
      migratedFields.push("highlights");
    }
    if (!Array.isArray(doc.personalInfo)) {
      $set.personalInfo = [];
      migratedFields.push("personalInfo");
    }
    if (!Array.isArray(doc.images)) {
      $set.images = [];
      migratedFields.push("images");
    }

    if (migratedFields.length === 0) {
      console.log(
        "\n✓ About document already matches the new schema — skipping.",
      );
      await mongoose.connection.close();
      process.exit(0);
    }

    const update = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    await col.updateOne({ owner: "default" }, update);

    console.log("\n✓ Migration applied. Fields updated:");
    migratedFields.forEach((f) => console.log(`  - ${f}`));

    console.log(
      "\n⚠ Frontend action item: ManageAbout.jsx now edits `biography` " +
        "via a rich-text editor and the admin PATCH contract changed " +
        "from { section, value } to a whole-object subset PATCH " +
        "(matching Resume/Navigation/Footer). Redeploy the frontend " +
        "alongside this migration.",
    );
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
