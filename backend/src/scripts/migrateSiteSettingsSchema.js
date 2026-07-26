import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Migrates the SiteSettings singleton from its pre-expansion shape onto
 * the new CMS schema:
 *   - logoUrl (string)      → logo    { url, public_id: "" }
 *   - faviconUrl (string)   → favicon { url, public_id: "" }
 *   - contactEmail (string) → contactEmails: [{ label: "General", email, order: 0 }]
 *   - newly introduced sections (announcementBar, contactPhones,
 *     contactAddress, resumeDownload, theme, analytics,
 *     socialLinksEnabled) are defaulted when entirely absent.
 *
 * Idempotent: every field is only $set when genuinely absent from the
 * persisted document, so re-running after a partial or full success is
 * always safe. Mirrors the pattern established by
 * scripts/migrateResumeSchema.js.
 */
const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const col = mongoose.connection.db.collection("siteSettings");

    console.log("=".repeat(60));
    console.log("Migration: Site Settings CMS schema expansion");
    console.log("=".repeat(60));

    const doc = await col.findOne({ owner: "default" });

    if (!doc) {
      console.log(
        "\nNo existing Site Settings singleton found — nothing to migrate.",
      );
      console.log(
        "A new document matching the full schema will be created " +
          "automatically on first read/write via getSingleton().",
      );
      await mongoose.connection.close();
      process.exit(0);
    }

    const $set = {};
    const $unset = {};
    const migratedFields = [];

    /* ── logoUrl (string) → logo {url, public_id} ────────────────── */
    if (!doc.logo && typeof doc.logoUrl === "string") {
      $set.logo = { url: doc.logoUrl, public_id: "" };
      $unset.logoUrl = "";
      migratedFields.push("logo (from logoUrl)");
    } else if (!doc.logo) {
      $set.logo = { url: "", public_id: "" };
      migratedFields.push("logo (default)");
    }

    /* ── faviconUrl (string) → favicon {url, public_id} ──────────── */
    if (!doc.favicon && typeof doc.faviconUrl === "string") {
      $set.favicon = { url: doc.faviconUrl, public_id: "" };
      $unset.faviconUrl = "";
      migratedFields.push("favicon (from faviconUrl)");
    } else if (!doc.favicon) {
      $set.favicon = { url: "", public_id: "" };
      migratedFields.push("favicon (default)");
    }

    /* ── contactEmail (string) → contactEmails[] ─────────────────── */
    if (!Array.isArray(doc.contactEmails)) {
      $set.contactEmails =
        typeof doc.contactEmail === "string" && doc.contactEmail.trim()
          ? [{ label: "General", email: doc.contactEmail.trim(), order: 0 }]
          : [];
      if (doc.contactEmail) $unset.contactEmail = "";
      migratedFields.push("contactEmails (from contactEmail)");
    }

    /* ── New sections — defaulted only when entirely absent ─────── */
    if (!Array.isArray(doc.contactPhones)) {
      $set.contactPhones = [];
      migratedFields.push("contactPhones");
    }
    if (!doc.contactAddress) {
      $set.contactAddress = {};
      migratedFields.push("contactAddress");
    }
    if (!doc.announcementBar) {
      $set.announcementBar = {};
      migratedFields.push("announcementBar");
    }
    if (!doc.resumeDownload) {
      $set.resumeDownload = {};
      migratedFields.push("resumeDownload");
    }
    if (!doc.theme) {
      $set.theme = {};
      migratedFields.push("theme");
    }
    if (!doc.analytics) {
      $set.analytics = {};
      migratedFields.push("analytics");
    }
    if (doc.socialLinksEnabled === undefined) {
      $set.socialLinksEnabled = true;
      migratedFields.push("socialLinksEnabled");
    }

    if (migratedFields.length === 0) {
      console.log(
        "\n✓ Site Settings document already matches the new schema — skipping.",
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
