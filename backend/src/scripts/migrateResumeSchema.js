import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/* ------------------------------------------------------------------ *
 * Default shapes for newly introduced Resume sections. Applied only
 * when the field is entirely absent from the persisted document, so
 * re-running this script after it has already succeeded is a no-op.
 * ------------------------------------------------------------------ */
const DEFAULT_HERO = {
  greeting: "Hello, I'm",
  headline: "",
  summary: "",
  availabilityStatus: "available",
  ctaLabel: "Download CV",
  ctaEnabled: true,
};

const DEFAULT_ABOUT_ME = { summary: "" };

const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const col = mongoose.connection.db.collection("resumes");

    console.log("=".repeat(60));
    console.log("Migration: Resume CMS schema redesign");
    console.log("=".repeat(60));

    const doc = await col.findOne({ owner: "default" });

    if (!doc) {
      console.log(
        "\nNo existing Resume singleton found — nothing to migrate.",
      );
      console.log(
        "A new document matching the full schema will be created " +
          "automatically on first read/write via getSingleton().",
      );
      await mongoose.connection.close();
      process.exit(0);
    }

    const $set = {};
    const migratedFields = [];

    /* ── New singleton sub-objects ─────────────────────────────────── */
    if (!doc.hero) {
      $set.hero = DEFAULT_HERO;
      migratedFields.push("hero");
    }
    if (!doc.aboutMe) {
      $set.aboutMe = DEFAULT_ABOUT_ME;
      migratedFields.push("aboutMe");
    }

    /* ── New array sections (no legacy data source to backfill from) ── */
    if (!Array.isArray(doc.experience)) {
      $set.experience = [];
      migratedFields.push("experience");
    }
    if (!Array.isArray(doc.certifications)) {
      $set.certifications = [];
      migratedFields.push("certifications");
    }
    if (!Array.isArray(doc.languages)) {
      $set.languages = [];
      migratedFields.push("languages");
    }
    if (!Array.isArray(doc.interests)) {
      $set.interests = [];
      migratedFields.push("interests");
    }
    if (!Array.isArray(doc.downloads)) {
      $set.downloads = [];
      migratedFields.push("downloads");
    }

    /* ── Existing "education" section: backfill `order` if missing ──── */
    const education = Array.isArray(doc.education) ? doc.education : [];
    const educationNeedsOrder = education.some((e) => e.order === undefined);
    if (educationNeedsOrder) {
      $set.education = education.map((e, idx) => ({
        ...e,
        order: e.order ?? idx,
      }));
      migratedFields.push("education (order backfill)");
    }

    if (migratedFields.length === 0) {
      console.log(
        "\n✓ Resume document already matches the new schema — skipping.",
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
