import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SEED_DATA = {
  paragraphs: [
    {
      text: "I'm a B.Tech Computer Science student at Lovely Professional University focused on Full-Stack MERN development. I build structured, scalable web applications using React.js, Node.js, Express, and MongoDB.",
      order: 0,
    },
    {
      text: "My focus is backend-driven architecture — authentication systems, role-based access control, REST APIs, and clean MVC structure. I prioritize writing maintainable code over building flashy interfaces.",
      order: 1,
    },
    {
      text: "Currently, I'm working on production-style projects including admin CMS systems, trading platform simulations, and AI-integrated web applications to strengthen real-world problem solving and system design skills.",
      order: 2,
    },
  ],
  services: [
    {
      title: "Full-Stack Web Development",
      description:
        "Build scalable MERN applications with clean UI, secure authentication, and structured backend architecture.",
      icon: "web",
      order: 0,
    },
    {
      title: "AI & Machine Learning",
      description:
        "Develop Python-based ML models and integrate them into real-world web applications.",
      icon: "ai",
      order: 1,
    },
    {
      title: "Data Structures & Algorithms",
      description:
        "Solve algorithmic problems in Java with focus on efficiency and optimization.",
      icon: "dsa",
      order: 2,
    },
    {
      title: "Backend & App Development",
      description:
        "Design REST APIs and scalable backend systems with proper database integration.",
      icon: "backend",
      order: 3,
    },
  ],
};

const seed = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    const { default: About } = await import("../models/About.js");

    await connectDB();

    const result = await About.findOneAndUpdate(
      { owner: "default" },
      { $set: SEED_DATA },
      { upsert: true, new: true, runValidators: true },
    );

    console.log("✓ About seeded successfully:", result._id.toString());
    process.exit(0);
  } catch (err) {
    console.error("✗ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
