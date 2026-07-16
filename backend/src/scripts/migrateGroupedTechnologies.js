import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/* ── Helpers ─────────────────────────────────────────────────────── */

function isAlreadyGrouped(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null &&
    "group" in value[0]
  );
}

function toGrouped(value) {
  // Already grouped — nothing to do
  if (isAlreadyGrouped(value)) return null;

  // Empty array — leave as-is
  if (Array.isArray(value) && value.length === 0) return null;

  // Flat JS string array: ["React", "Node.js"]
  if (Array.isArray(value)) {
    const items = value.filter((v) => typeof v === "string" && v.trim());
    return items.length ? [{ group: "General", items }] : null;
  }

  // JSON string (from the stringified-array bug): '["React","Node.js"]'
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value.trim());
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return null;
        // Already grouped inside the string
        if (typeof parsed[0] === "object" && "group" in parsed[0]) {
          return parsed;
        }
        // Flat array inside string
        const items = parsed.filter((v) => typeof v === "string" && v.trim());
        return items.length ? [{ group: "General", items }] : null;
      }
    } catch {
      // Unparseable string — wrap it
      return value.trim()
        ? [{ group: "General", items: [value.trim()] }]
        : null;
    }
  }

  return null; // nothing to migrate
}

/* ── Main ────────────────────────────────────────────────────────── */

const migrate = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    const { default: cache } = await import("../utils/cache.js");

    await connectDB();

    const { default: mongoose } = await import("mongoose");
    const col = mongoose.connection.db.collection("projects");

    console.log("=".repeat(60));
    console.log("Migration: technologies → grouped format");
    console.log("=".repeat(60));

    const all = await col.find({}).toArray();
    console.log(`\nTotal projects found: ${all.length}\n`);

    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (const doc of all) {
      const newTech = toGrouped(doc.technologies);

      if (newTech === null) {
        skipped++;
        console.log(`  ⤷ [skip] "${doc.title}" — already grouped or empty`);
        continue;
      }

      console.log(`  ✎ "${doc.title}"`);
      console.log(`    before: ${JSON.stringify(doc.technologies)}`);
      console.log(`    after:  ${JSON.stringify(newTech)}`);

      try {
        await col.updateOne(
          { _id: doc._id },
          { $set: { technologies: newTech } },
        );
        migrated++;
      } catch (err) {
        console.error(`  ✗ Failed [${doc._id}]: ${err.message}`);
        failed++;
      }
    }

    // Bust project cache so API immediately returns the new shape
    cache.delByPrefix("projects:");

    console.log("\n" + "=".repeat(60));
    console.log(
      `Done: ${migrated} migrated, ${skipped} skipped, ${failed} failed.`,
    );
    console.log("=".repeat(60) + "\n");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("\n✗ Migration failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

migrate();
