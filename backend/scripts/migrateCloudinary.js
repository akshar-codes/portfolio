import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

import Project from "../models/Project.js";

dotenv.config();

/* New Cloudinary Account */
cloudinary.config({
  cloud_name: process.env.NEW_CLOUD_NAME,
  api_key: process.env.NEW_CLOUD_API_KEY,
  api_secret: process.env.NEW_CLOUD_API_SECRET,
});

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const projects = await Project.find();

    console.log(`Found ${projects.length} projects`);

    for (const project of projects) {
      try {
        if (!project.image?.url) continue;

        console.log(`Migrating ${project.title}`);

        const response = await axios.get(project.image.url, {
          responseType: "arraybuffer",
        });

        const buffer = Buffer.from(response.data);

        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "portfolio/projects",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );

          stream.end(buffer);
        });

        project.image.url = uploaded.secure_url;
        project.image.public_id = uploaded.public_id;

        await project.save();

        console.log(`✓ Done: ${project.title}`);
      } catch (err) {
        console.error(`✗ Failed: ${project.title}`, err.message);
      }
    }

    console.log("Migration completed");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
