import "dotenv/config";
import mongoose from "mongoose";
import Profile from "../models/Profile.js";
import About from "../models/About.js";
import Resume from "../models/Resume.js";
import Category from "../models/Category.js";
import Project from "../models/Project.js";
import Navigation from "../models/Navigation.js";
import Footer from "../models/Footer.js";
import SiteSettings from "../models/SiteSettings.js";
import SEO from "../models/Seo.js";

const publishedAt = new Date();
const publishFields = { status: "published", publishedAt, publishAt: null };

const profile = {
  name: "Akshar Gupta",
  title: "Software Developer",
  introduction:
    "I excel at designing sophisticated machine learning solutions and I am proficient in various programming languages and DSA.",
  email: "akshargupta2006@gmail.com",
  phone: "+91-9258887187",
  location: "Meerut, Uttar Pradesh",
  avatar:
    "https://res.cloudinary.com/dkjovbtvz/image/upload/v1780149753/my-avatar_winheg.png",
  socialLinks: [
    {
      label: "GitHub",
      url: "https://github.com/gupta-akshar",
      icon: "github",
      order: 0,
    },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/akshar-gupta",
      icon: "linkedin",
      order: 1,
    },
    { label: "LeetCode", url: "https://leetcode.com/", icon: "code", order: 2 },
    {
      label: "YouTube",
      url: "https://www.youtube.com/",
      icon: "youtube",
      order: 3,
    },
  ],
  ctaButtons: [
    {
      label: "Download CV",
      url: "/resume",
      style: "outline",
      openInNewTab: false,
      order: 0,
    },
  ],
  statistics: [
    {
      value: 3,
      suffix: "",
      label: "Years of experience",
      icon: "work",
      source: "manual",
      order: 0,
    },
    {
      value: 6,
      suffix: "",
      label: "Technologies mastered",
      icon: "layers",
      source: "manual",
      order: 1,
    },
    {
      value: 135,
      suffix: "",
      label: "Code commits",
      icon: "code",
      source: "manual",
      order: 2,
    },
    {
      value: 400,
      suffix: "",
      label: "DSA questions solved",
      icon: "terminal",
      source: "manual",
      order: 3,
    },
  ],
  ...publishFields,
};

const about = {
  biography:
    "Full-stack development, machine learning, Java development, and video editing.",
  skillsSummary: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
  services: [
    {
      title: "Machine Learning",
      description:
        "Advanced machine learning for insights and innovation. Expertise in predictive analytics and real-time solutions.",
      icon: "brain",
      order: 0,
    },
    {
      title: "Web Development",
      description:
        "Creating dynamic, responsive web design using modern frameworks for a seamless user experience.",
      icon: "web",
      order: 1,
    },
    {
      title: "Java Development",
      description:
        "Developing robust Java applications with expertise in core Java, JDBC and graphical interfaces using Swing.",
      icon: "code",
      order: 2,
    },
    {
      title: "Video Editing",
      description:
        "Transform raw footage into polished, engaging content with expert editing and enhanced visuals.",
      icon: "video",
      order: 3,
    },
  ],
  timeline: [],
  highlights: [],
  personalInfo: [],
  images: [],
  ...publishFields,
};

const resume = {
  hero: {
    greeting: "Hello, I'm",
    headline: "Software Developer",
    summary:
      "Versatile in programming, advanced in algorithm design, and experienced in developing full stack solutions.",
    availabilityStatus: "available",
    ctaLabel: "Download CV",
    ctaEnabled: true,
  },
  aboutMe: {
    summary:
      "Passionate Full Stack Developer with a strong foundation in problem-solving and software engineering.",
  },
  experience: [
    {
      role: "Full Stack Developer Trainee",
      company: "Lovely Professional University",
      location: "Summer Training",
      startDate: "Jun 2026",
      endDate: "Jul 2026",
      current: false,
      description: "Developed full stack web applications using MERN stack",
      order: 0,
    },
  ],
  education: [
    {
      institution: "B.Tech Computer Science and Engineering",
      duration: "2025 - Present",
      description: "Lovely Professional University, Phagwara\nCGPA: 8.33",
      order: 0,
    },
    {
      institution: "Higher Secondary Education",
      duration: "May 2024 - Mar 2025",
      description: "Vardhman Academy, Meerut, Uttar Pradesh",
      order: 1,
    },
    {
      institution: "Secondary Education",
      duration: "April 2022 - Mar 2023",
      description: "Vardhman Academy, Meerut, Uttar Pradesh",
      order: 2,
    },
  ],
  certifications: [
    {
      title: "Full Stack Web Development",
      issuer: "Cisco Networking Academy",
      issueDate: "Aug 2026",
      order: 0,
    },
    {
      title: "React.js & Frontend Development",
      issuer: "Cisco Networking Academy",
      issueDate: "Jun 2026",
      order: 1,
    },
    {
      title: "Node.js & Backend Development",
      issuer: "Coursera",
      issueDate: "Jan 2026",
      order: 2,
    },
    {
      title: "Competitive Programming Mastery",
      issuer: "Solved 900+ algorithmic problems\nTop 15% globally on TryHackMe",
      issueDate: "2026",
      order: 3,
    },
  ],
  skills: [
    {
      category: "Languages",
      items: ["JavaScript", "Java", "Python", "C", "C++", "SQL"],
      order: 0,
    },
    {
      category: "Frontend",
      items: ["React.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Vite"],
      order: 1,
    },
    {
      category: "Backend",
      items: ["Node.js", "Express.js", "REST APIs", "JWT Auth"],
      order: 2,
    },
    {
      category: "Databases & Tools",
      items: ["MongoDB", "MySQL", "PostgreSQL", "Git", "GitHub", "Postman"],
      order: 3,
    },
  ],
  languages: [
    { name: "English", proficiency: "fluent", order: 0 },
    { name: "Hindi", proficiency: "native", order: 1 },
  ],
  interests: [],
  downloads: [],
  ...publishFields,
};

const navigation = {
  items: [
    { label: "Home", path: "/", order: 0 },
    { label: "Services", path: "/services", order: 1 },
    { label: "Resume", path: "/resume", order: 2 },
    { label: "Work", path: "/work", order: 3 },
    { label: "Contact", path: "/contact", order: 4 },
  ],
  ctaEnabled: true,
  ctaLabel: "Hire me",
  ctaUrl: "/contact",
  ...publishFields,
};

const siteSettings = {
  siteName: "Akshar",
  tagline: "Software Developer",
  timezone: "Asia/Kolkata",
  primaryColor: "#00ff88",
  secondaryColor: "#1c1c1e",
  contactEmails: [
    { label: "Email", email: "akshargupta2006@gmail.com", order: 0 },
  ],
  contactPhones: [{ label: "Phone", phone: "+91 9258887187", order: 0 }],
  contactAddress: { city: "Meerut", state: "Uttar Pradesh", country: "India" },
  theme: { mode: "dark" },
  socialLinksEnabled: true,
  maintenanceMode: false,
  ...publishFields,
};

const footer = {
  description: "Software Developer",
  copyrightText: "© Akshar Gupta. All rights reserved.",
  showSocialLinks: true,
  showContactInfo: true,
  columns: [],
  legalLinks: [],
  ...publishFields,
};

const seo = {
  defaultMetaTitle: "Akshar Gupta | Software Developer",
  defaultMetaDescription:
    "Akshar Gupta — Software Developer specializing in full-stack development, machine learning, and problem-solving.",
  defaultKeywords: [
    "Akshar Gupta",
    "Software Developer",
    "Full Stack Developer",
    "Machine Learning",
  ],
  canonicalBaseUrl: "",
  robotsIndex: true,
  robotsFollow: true,
  sitemapEnabled: true,
  ...publishFields,
};

async function upsertSingleton(Model, data) {
  await Model.findOneAndUpdate(
    { owner: "default" },
    { $set: data },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
}

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing.");
  const uri = new URL(process.env.MONGO_URI);
  if (!["127.0.0.1", "localhost"].includes(uri.hostname)) {
    throw new Error(
      "Refusing to seed: MONGO_URI must point to a local MongoDB host.",
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    upsertSingleton(Profile, profile),
    upsertSingleton(About, about),
    upsertSingleton(Resume, resume),
    upsertSingleton(Navigation, navigation),
    upsertSingleton(Footer, footer),
    upsertSingleton(SiteSettings, siteSettings),
    upsertSingleton(SEO, seo),
  ]);

  const category = await Category.findOneAndUpdate(
    { slug: "mern-stack-cron-jobs-react-query" },
    {
      $set: {
        name: "MERN Stack, Cron Jobs, React Query",
        slug: "mern-stack-cron-jobs-react-query",
        order: 0,
        ...publishFields,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  // The source screenshot has no project screenshot image, so a blank image
  // keeps the public Work page's designed placeholder visible.
  const projectData = {
    title: "Website Monitor",
    description:
      "Production-oriented website monitoring platform for automated uptime, response-time, SSL, and domain monitoring with scheduled health checks and real-time incident detection.",
    category: category._id,
    status: "published",
    publishAt: null,
    publishedAt,
    unpublishedAt: null,
    archivedAt: null,
    featured: true,
    image: { url: "", public_id: "" },
    bannerImage: { url: "", public_id: "" },
    technologies: [
      {
        group: "Stack",
        items: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
      },
    ],
    features: ["Cron Jobs", "React Query"],
    gallery: [],
    githubUrl: "https://github.com/gupta-akshar",
    liveUrl: "http://127.0.0.1:5000",
    challenge: "",
    solution: "",
    projectUrl: "",
    order: 0,
  };
  const existingProject = await Project.findOne({ title: "Website Monitor" });
  if (existingProject) {
    await Project.collection.updateOne(
      { _id: existingProject._id },
      { $set: projectData },
    );
  } else {
    // Mongoose's project image schema requires an uploaded image. The
    // screenshot intentionally shows the no-image placeholder, so insert
    // through the collection API to preserve that empty image state.
    await Project.collection.insertOne({
      ...projectData,
      createdAt: publishedAt,
      updatedAt: publishedAt,
    });
  }

  console.log(
    `Seeded and published screenshot portfolio content in ${uri.hostname}/${uri.pathname.slice(1).split("/")[0]}.`,
  );
}

try {
  await seed();
} catch (error) {
  console.error("Screenshot portfolio seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
