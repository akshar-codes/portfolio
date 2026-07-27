import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Backfills the schema additions introduced for full Navigation /
 * Footer / SEO CMS management:
 *   - Navigation.items[].children  → [] when missing
 *   - Footer.description           → "" when missing
 *   - Footer.showContactInfo       → true when missing
 *   - Footer.newsletter            → {} when missing
 *   - SEO.defaultKeywords          → [] when missing
 *   - SEO.openGraph                → {} when missing
 *   - SEO.twitterCard              → {} when missing
 *   - SEO.structuredData           → "" when missing
 *   - SEO.bingSiteVerification     → "" when missing
 *
 * Idempotent: every field is only $set when genuinely absent from the
 * persisted document, so re-running after a partial or full success is
 * always safe. Mirrors the pattern established by
 * scripts/migrateSiteSettingsSchema.js and scripts/migrateResumeSchema.js.
 *
 * Deploy order: run this BEFORE deploying the updated API code, same
 * convention as migrateOrder.js — the new validators/services assume
 * these fields exist (even if empty) on any document they read.
 */
const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const db = mongoose.connection.db;

    console.log("=".repeat(60));
    console.log("Migration: Navigation / Footer / SEO schema expansion");
    console.log("=".repeat(60));

    /* ── Navigation ────────────────────────────────────────────────── */
    console.log("\n→ Navigation…");
    const nav = await db.collection("navigation").findOne({ owner: "default" });
    if (!nav) {
      console.log(
        "  ⚠ No Navigation singleton found — will be created on first read/write.",
      );
    } else {
      const items = Array.isArray(nav.items) ? nav.items : [];
      const needsMigration = items.some((item) => !Array.isArray(item.children));
      if (!needsMigration) {
        console.log("  ✓ All items already have a children field — skipped.");
      } else {
        const updatedItems = items.map((item) => ({
          ...item,
          children: Array.isArray(item.children) ? item.children : [],
        }));
        await db
          .collection("navigation")
          .updateOne({ owner: "default" }, { $set: { items: updatedItems } });
        console.log(`  ✓ Backfilled children[] on ${updatedItems.length} item(s).`);
      }
    }

    /* ── Footer ────────────────────────────────────────────────────── */
    console.log("\n→ Footer…");
    const footer = await db.collection("footer").findOne({ owner: "default" });
    if (!footer) {
      console.log(
        "  ⚠ No Footer singleton found — will be created on first read/write.",
      );
    } else {
      const $set = {};
      const migrated = [];

      if (footer.description === undefined) {
        $set.description = "";
        migrated.push("description");
      }
      if (footer.showContactInfo === undefined) {
        $set.showContactInfo = true;
        migrated.push("showContactInfo");
      }
      if (!footer.newsletter) {
        $set.newsletter = {};
        migrated.push("newsletter");
      }

      if (migrated.length === 0) {
        console.log("  ✓ Footer document already matches the new schema — skipped.");
      } else {
        await db.collection("footer").updateOne({ owner: "default" }, { $set });
        console.log(`  ✓ Backfilled: ${migrated.join(", ")}`);
      }
    }

    /* ── SEO ───────────────────────────────────────────────────────── */
    console.log("\n→ SEO…");
    const seo = await db.collection("seo").findOne({ owner: "default" });
    if (!seo) {
      console.log(
        "  ⚠ No SEO singleton found — will be created on first read/write.",
      );
    } else {
      const $set = {};
      const migrated = [];

      if (!Array.isArray(seo.defaultKeywords)) {
        $set.defaultKeywords = [];
        migrated.push("defaultKeywords");
      }
      if (!seo.openGraph) {
        $set.openGraph = {};
        migrated.push("openGraph");
      }
      if (!seo.twitterCard) {
        $set.twitterCard = {};
        migrated.push("twitterCard");
      }
      if (seo.structuredData === undefined) {
        $set.structuredData = "";
        migrated.push("structuredData");
      }
      if (seo.bingSiteVerification === undefined) {
        $set.bingSiteVerification = "";
        migrated.push("bingSiteVerification");
      }

      if (migrated.length === 0) {
        console.log("  ✓ SEO document already matches the new schema — skipped.");
      } else {
        await db.collection("seo").updateOne({ owner: "default" }, { $set });
        console.log(`  ✓ Backfilled: ${migrated.join(", ")}`);
      }
    }

    console.log("\n✅ Migration completed successfully.");
    console.log(
      "\nNote: utils/cache.js is an in-process, per-instance cache. If the " +
        "API server is currently running, restart it (or wait for the 60s " +
        "TTL) so the new fields are reflected in cached reads.",
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
