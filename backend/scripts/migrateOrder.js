import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    await connectDB();

    const mongoose = (await import("mongoose")).default;
    const db = mongoose.connection.db;

    /* ── 1. Projects ────────────────────────────────────────────── */
    console.log("→ Migrating Projects.order…");
    const projects = await db
      .collection("projects")
      .find({ order: { $exists: false } })
      .sort({ createdAt: 1 })
      .toArray();

    if (projects.length === 0) {
      console.log("  ✓ All projects already have an order field — skipped.");
    } else {
      const projectOps = projects.map((p, idx) => ({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { order: idx } },
        },
      }));
      const projectResult = await db
        .collection("projects")
        .bulkWrite(projectOps, { ordered: false });
      console.log(
        `  ✓ Projects migrated: ${projectResult.modifiedCount} documents updated.`,
      );
    }

    /* ── 2. Profile social links ────────────────────────────────── */
    console.log("→ Migrating Profile.socialLinks.order…");
    const profile = await db
      .collection("profiles")
      .findOne({ owner: "default" });

    if (!profile) {
      console.log("  ⚠ No profile document found — skipped.");
    } else {
      const links = profile.socialLinks ?? [];
      const needsMigration = links.some((l) => l.order === undefined);

      if (!needsMigration) {
        console.log(
          "  ✓ All social links already have an order field — skipped.",
        );
      } else {
        const updatedLinks = links.map((l, idx) => ({
          ...l,
          order: l.order ?? idx,
        }));
        await db
          .collection("profiles")
          .updateOne(
            { owner: "default" },
            { $set: { socialLinks: updatedLinks } },
          );
        console.log(
          `  ✓ Social links migrated: ${updatedLinks.length} entries updated.`,
        );
      }
    }

    /* ── 3. Resume skills ───────────────────────────────────────── */
    console.log("→ Migrating Resume.skills.order…");
    const resume = await db.collection("resumes").findOne({ owner: "default" });

    if (!resume) {
      console.log("  ⚠ No resume document found — skipped.");
    } else {
      const skills = resume.skills ?? [];
      const needsMigration = skills.some((s) => s.order === undefined);

      if (!needsMigration) {
        console.log(
          "  ✓ All skill categories already have an order field — skipped.",
        );
      } else {
        const updatedSkills = skills.map((s, idx) => ({
          ...s,
          order: s.order ?? idx,
        }));
        await db
          .collection("resumes")
          .updateOne({ owner: "default" }, { $set: { skills: updatedSkills } });
        console.log(
          `  ✓ Skills migrated: ${updatedSkills.length} categories updated.`,
        );
      }
    }

    console.log("\n✅ Order migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  }
};

migrate();
