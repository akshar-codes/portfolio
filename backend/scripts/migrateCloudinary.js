import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import { v2 as newCloudinary } from "cloudinary"; // isolated reference

import Project from "../models/Project.js";

dotenv.config();

/* ------------------------------------------------------------------ *
 * Guard: require explicit NEW_CLOUD_* vars before doing anything
 * ------------------------------------------------------------------ */
const requiredVars = [
  "NEW_CLOUD_NAME",
  "NEW_CLOUD_API_KEY",
  "NEW_CLOUD_API_SECRET",
];
const missingVars = requiredVars.filter((v) => !process.env[v]?.trim());

if (missingVars.length > 0) {
  console.error(
    `[migrate] FATAL: Missing required environment variables:\n  ${missingVars.join("\n  ")}\n`,
    "Set all NEW_CLOUD_* vars before running this script.",
  );
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Configure the ISOLATED Cloudinary instance.
 *
 * We import { v2 as newCloudinary } above — this is a separate object
 * from the one configured in utils/cloudinary.js.  Configuring it here
 * does NOT affect the application's main Cloudinary client.
 * ------------------------------------------------------------------ */
newCloudinary.config({
  cloud_name: process.env.NEW_CLOUD_NAME,
  api_key: process.env.NEW_CLOUD_API_KEY,
  api_secret: process.env.NEW_CLOUD_API_SECRET,
});

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/**
 * Uploads a Buffer to the new Cloudinary account.
 * @param {Buffer} buffer
 * @param {string} folder
 * @returns {Promise<import("cloudinary").UploadApiResponse>}
 */
function uploadBufferToNew(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = newCloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error)
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
}

/* ------------------------------------------------------------------ *
 * Main migration
 * ------------------------------------------------------------------ */

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[migrate] Connected to MongoDB");

  const projects = await Project.find();
  console.log(`[migrate] Found ${projects.length} project(s) to process\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const project of projects) {
    const label = `"${project.title}" (${project._id})`;

    if (!project.image?.url) {
      console.log(`  ⤷ [skip] ${label} — no image URL`);
      skipped++;
      continue;
    }

    console.log(`  ✎ ${label}`);

    try {
      // Download the current image as a buffer
      const response = await axios.get(project.image.url, {
        responseType: "arraybuffer",
        timeout: 15_000,
      });
      const buffer = Buffer.from(response.data);

      // Upload to the new Cloudinary account
      const uploaded = await uploadBufferToNew(buffer, "portfolio/projects");

      // Update MongoDB with new URL and public_id
      project.image.url = uploaded.secure_url;
      project.image.public_id = uploaded.public_id;
      await project.save();

      console.log(`    ✓ Migrated → ${uploaded.secure_url}`);
      migrated++;
    } catch (err) {
      console.error(`    ✗ Failed: ${err.message}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(
    `Migration complete: ${migrated} migrated, ${skipped} skipped, ${failed} failed.`,
  );
  console.log("=".repeat(60) + "\n");

  await mongoose.connection.close();
  process.exit(failed > 0 ? 1 : 0);
}

migrate().catch((err) => {
  console.error("[migrate] Unhandled error:", err.message);
  process.exit(1);
});
