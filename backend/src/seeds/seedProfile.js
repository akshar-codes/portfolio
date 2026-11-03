import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const SEED_DATA = {
  name: "Akshar Gupta",
  title: "Web Developer",
  introduction:
    "I build full-stack web applications with React, Node.js, Express, and MongoDB, with a focus on secure APIs and maintainable backend architecture.",
  email: "akshargupta2006@gmail.com",
  phone: "+91 9258887187",
  location: "Meerut, Uttar Pradesh, India",

  avatar:
    "https://res.cloudinary.com/dkjovbtvz/image/upload/v1780149753/my-avatar_winheg.png",
  socialLinks: [
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/akshar-gupta",
      icon: "linkedin",
      order: 0,
    },
    {
      label: "GitHub",
      url: "https://github.com/gupta-akshar",
      icon: "github",
      order: 1,
    },
  ],

  // Starter content, editable in the admin CMS.
  ctaButtons: [
    {
      label: "View Projects",
      url: "/projects",
      style: "primary",
      openInNewTab: false,
      order: 0,
    },
    {
      label: "Contact Me",
      url: "/contact",
      style: "outline",
      openInNewTab: false,
      order: 1,
    },
  ],
  statistics: [
    {
      value: 3,
      suffix: "+",
      label: "Core Stack Projects",
      icon: "code",
      source: "manual",
      order: 0,
    },
    {
      value: 6,
      suffix: "",
      label: "Technologies in Focus",
      icon: "layers",
      source: "manual",
      order: 1,
    },
  ],
};

const seed = async () => {
  try {
    const { default: connectDB } = await import("../config/db.js");
    const { default: Profile } = await import("../models/Profile.js");

    await connectDB();

    const result = await Profile.findOneAndUpdate(
      { owner: "default" },
      { $set: SEED_DATA },
      { upsert: true, new: true, runValidators: true },
    );

    console.log("✓ Profile seeded successfully:", result._id.toString());
    process.exit(0);
  } catch (err) {
    console.error("✗ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
