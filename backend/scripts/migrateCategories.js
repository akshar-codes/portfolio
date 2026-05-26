import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    const { runMigration } = await import("../utils/migration.js");

    await connectDB();

    console.log("Starting category migration...");

    await runMigration();

    console.log("Category migration completed successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);

    process.exit(1);
  }
};

migrate();
