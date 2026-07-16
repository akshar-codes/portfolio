import mongoose from "mongoose";
import { generateSlug, normalizeName } from "../utils/slug.js";
import logger from "../utils/logger.js";

export async function runMigration() {
  try {
    const db = mongoose.connection.db;
    const projectsCol = db.collection("projects");
    const categoriesCol = db.collection("categories");

    // ── 1. Find projects that still have a string category ──────────
    const legacyProjects = await projectsCol
      .find({ category: { $type: "string" } })
      .toArray();

    if (legacyProjects.length === 0) {
      logger.info("Migration [categories]: nothing to migrate — skipping.");
      return;
    }

    logger.info(
      `Migration [categories]: found ${legacyProjects.length} project(s) with legacy string categories.`,
    );

    // ── 2. Build unique name set and resolve/create Category docs ───
    const uniqueNames = [
      ...new Set(legacyProjects.map((p) => p.category).filter(Boolean)),
    ];

    /** Map<originalName, ObjectId> */
    const categoryMap = new Map();

    for (const rawName of uniqueNames) {
      const name = normalizeName(rawName);
      const slug = generateSlug(name);

      if (!slug) {
        logger.warn(
          `Migration [categories]: skipping blank slug for "${rawName}".`,
        );
        continue;
      }

      // Upsert: find existing or insert new
      let existing = await categoriesCol.findOne({ slug });

      if (!existing) {
        const { insertedId } = await categoriesCol.insertOne({
          name,
          slug,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        existing = { _id: insertedId };
        logger.info(
          `Migration [categories]: created category "${name}" (slug: "${slug}").`,
        );
      } else {
        logger.info(
          `Migration [categories]: reusing existing category "${existing.name}" (slug: "${slug}").`,
        );
      }

      categoryMap.set(rawName, existing._id);
    }

    // ── 3. Update each project document ─────────────────────────────
    let migrated = 0;
    let skipped = 0;

    for (const project of legacyProjects) {
      const categoryId = categoryMap.get(project.category);

      if (!categoryId) {
        logger.warn(
          `Migration [categories]: no category resolved for project ${project._id} (value: "${project.category}") — skipping.`,
        );
        skipped++;
        continue;
      }

      await projectsCol.updateOne(
        { _id: project._id },
        { $set: { category: categoryId } },
      );
      migrated++;
    }

    logger.info(
      `Migration [categories]: complete — ${migrated} migrated, ${skipped} skipped.`,
    );
  } catch (err) {
    logger.error("Migration [categories]: FAILED", {
      message: err.message,
      stack: err.stack,
    });
  }
}
