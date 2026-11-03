import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const SEED_DATA = {
  biography:
    "<p>I'm a B.Tech Computer Science student at Lovely Professional University focused on Full-Stack MERN development. I build structured, scalable web applications using React.js, Node.js, Express, and MongoDB.</p>" +
    "<p>My focus is backend-driven architecture — authentication systems, role-based access control, REST APIs, and clean MVC structure. I prioritize writing maintainable code over building flashy interfaces.</p>" +
    "<p>Currently, I'm working on production-style projects including admin CMS systems, trading platform simulations, and AI-integrated web applications to strengthen real-world problem solving and system design skills.</p>",

  skillsSummary: ["React", "Node.js", "Express", "MongoDB", "Python", "Java"],

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

  // Starter content, editable in the admin CMS.
  timeline: [
    {
      title: "B.Tech Computer Science and Engineering",
      subtitle: "Lovely Professional University",
      dateRange: "2025 — 2029",
      description:
        "Studying computer science with a focus on software development, databases, and problem solving.",
      icon: "graduation-cap",
      order: 0,
    },
    {
      title: "Machine Learning Internship",
      subtitle: "IRDE Lab, DRDO · Dehradun",
      dateRange: "Jul 2024 — Aug 2024",
      description:
        "Applied machine learning techniques in a defense research environment.",
      icon: "briefcase",
      order: 1,
    },
    {
      title: "External Relations Officer",
      subtitle: "GEU ACM · Dehradun",
      dateRange: "Apr 2024 — Aug 2024",
      description:
        "Coordinated external partnerships and event outreach for the student ACM chapter.",
      icon: "users",
      order: 2,
    },
  ],
  highlights: [
    { value: "MERN", label: "Full-Stack Development", icon: "code", order: 0 },
    { value: "REST", label: "Backend API Design", icon: "server", order: 1 },
    { value: "ML", label: "Machine Learning", icon: "brain", order: 2 },
  ],
  personalInfo: [
    { label: "Location", value: "Meerut, Uttar Pradesh, India", order: 0 },
    {
      label: "Education",
      value: "B.Tech, Computer Science and Engineering",
      order: 1,
    },
    { label: "Focus", value: "Full-Stack MERN Development", order: 2 },
    { label: "Availability", value: "Open to opportunities", order: 3 },
  ],
  images: [],
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
