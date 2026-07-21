import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const SEED_DATA = {
  hero: {
    greeting: "Hello, I'm",
    headline: "Full Stack Developer",
    summary:
      "B.Tech CSE student and full-stack MERN developer, focused on scalable backend architecture and clean, maintainable systems.",
    availabilityStatus: "open_to_offers",
    ctaLabel: "Download CV",
    ctaEnabled: true,
  },

  aboutMe: {
    summary:
      "AI enthusiast and soon-to-be graduate, driven by a passion for problem-solving and innovation in software development. " +
      "I build structured, scalable web applications with React, Node.js, Express, and MongoDB, with a particular focus on " +
      "authentication systems, role-based access control, REST APIs, and clean MVC architecture.",
  },

  experience: [
    {
      role: "SDE Intern",
      company: "99Acres, Info Edge",
      location: "Noida, India",
      startDate: "Jan 2025",
      endDate: "Jun 2025",
      current: false,
      description:
        "Worked on a production-grade real estate search portal — smart search, filtering, and property recommendations.",
      order: 0,
    },
    {
      role: "ML Intern",
      company: "IRDE Lab, DRDO",
      location: "Dehradun, India",
      startDate: "Jul 2024",
      endDate: "Aug 2024",
      current: false,
      description: "Applied machine learning techniques within a defense research environment.",
      order: 1,
    },
    {
      role: "External Relations Officer",
      company: "GEU ACM",
      location: "Dehradun, India",
      startDate: "Apr 2024",
      endDate: "Aug 2024",
      current: false,
      description: "Coordinated external partnerships and event outreach for the student ACM chapter.",
      order: 2,
    },
  ],

  education: [
    {
      institution: "Lovely Professional University",
      duration: "2025 — 2029 (Pursuing)",
      description:
        "B.Tech in Computer Science and Engineering. Relevant Coursework: Data Structures & Algorithms, Database Systems, Object-Oriented Programming.",
      order: 0,
    },
  ],

  certifications: [
    {
      title: "Machine Learning Specialization",
      issuer: "Coursera — Andrew Ng, Stanford",
      issueDate: "2024",
      credentialUrl: "",
      order: 0,
    },
    {
      title: "AWS Cloud Practitioner Essentials",
      issuer: "Amazon Web Services",
      issueDate: "2024",
      credentialUrl: "",
      order: 1,
    },
    {
      title: "Full Stack Web Development",
      issuer: "Udemy — Angela Yu",
      issueDate: "2023",
      credentialUrl: "",
      order: 2,
    },
    {
      title: "Data Structures & Algorithms",
      issuer: "Striver A2Z DSA Course",
      issueDate: "2023",
      credentialUrl: "",
      order: 3,
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
      order: 0,
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
      order: 1,
    },
    {
      category: "Database",
      items: ["MongoDB", "MySQL", "Mongoose"],
      order: 2,
    },
    {
      category: "Programming",
      items: ["Java", "Data Structures & Algorithms", "OOP"],
      order: 3,
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
      order: 4,
    },
  ],

  languages: [
    { name: "English", proficiency: "fluent", order: 0 },
    { name: "Hindi", proficiency: "native", order: 1 },
  ],

  interests: [],

  // Left empty intentionally — no hosted CV file URL exists yet.
  // Add via the admin CMS once a Cloudinary/external URL is available.
  downloads: [],
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
