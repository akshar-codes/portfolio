import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const SEED_DATA = {
  education: [
    {
      institution: "Lovely Professional University",
      duration: "2025 — 2029 (Pursuing)",
      description:
        "B.Tech in Computer Science and Engineering. Relevant Coursework: Data Structures & Algorithms, Database Systems, Object-Oriented Programming.",
    },
  ],
  skills: [
    {
      category: "Frontend",
      items: [
        "HTML5",
        "CSS3",
        "JavaScript (ES6+)",
        "React.js",
        "Tailwind CSS",
        "Bootstrap",
      ],
    },
    {
      category: "Backend",
      items: [
        "Node.js",
        "Express.js",
        "REST APIs",
        "JWT Authentication",
        "Role-Based Access Control",
      ],
    },
    {
      category: "Database",
      items: ["MongoDB", "MySQL", "Mongoose"],
    },
    {
      category: "Programming",
      items: ["Java", "Data Structures & Algorithms", "OOP"],
    },
    {
      category: "Tools & Deployment",
      items: [
        "Git",
        "GitHub",
        "Hoppscotch",
        "MongoDB Atlas",
        "Vercel",
        "Render",
      ],
    },
  ],
};

const seed = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    const { default: Resume } = await import("../models/Resume.js");

    await connectDB();

    const result = await Resume.findOneAndUpdate(
      { owner: "default" },
      { $set: SEED_DATA },
      { upsert: true, new: true, runValidators: true },
    );

    console.log("✓ Resume seeded successfully:", result._id.toString());
    process.exit(0);
  } catch (err) {
    console.error("✗ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
