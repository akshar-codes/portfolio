import { z } from "zod";

/** Strips HTML tags for a plain-text length check on rich-text fields. */
function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "").trim();
}

const urlOrEmpty = (label) =>
  z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^https?:\/\/.+/.test(val),
      `${label} must be a valid HTTP/HTTPS URL or empty`,
    );

export const CONTENT_STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const seoSchema = z.object({
  metaTitle: z
    .string()
    .trim()
    .max(70, "Meta title must not exceed 70 characters"),
  metaDescription: z
    .string()
    .trim()
    .max(160, "Meta description must not exceed 160 characters"),
  metaKeywords: z
    .array(
      z.string().trim().max(60, "Each keyword must not exceed 60 characters"),
    )
    .max(20, "Meta keywords must not exceed 20 entries"),
  ogImage: urlOrEmpty("OG image"),
});

const technologyGroupSchema = z.object({
  group: z
    .string()
    .trim()
    .min(1, "Group name is required")
    .max(80, "Group name must not exceed 80 characters"),
  items: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(60, "Technology item must not exceed 60 characters"),
    )
    .max(30, "Each technology group must not exceed 30 items"),
});

export const projectFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title must not exceed 120 characters"),
  description: z
    .string()
    .refine(
      (val) => stripHtml(val).length >= 10,
      "Description must be at least 10 characters",
    )
    .max(5000, "Description must not exceed 5000 characters"),
  category: z.string().trim().min(1, "Category is required"),
  status: z.enum(["published", "draft"]),
  featured: z.boolean(),
  liveUrl: urlOrEmpty("Live URL"),
  githubUrl: urlOrEmpty("GitHub URL"),
  challenge: z.string().max(3000, "Challenge must not exceed 3000 characters"),
  solution: z.string().max(3000, "Solution must not exceed 3000 characters"),
  technologies: z
    .array(technologyGroupSchema)
    .max(10, "Technologies must not exceed 10 groups"),
  features: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(200, "Feature must not exceed 200 characters"),
    )
    .max(20, "Features must not exceed 20 entries"),
  seo: seoSchema,
});

export const projectFormDefaults = {
  title: "",
  description: "",
  category: "",
  status: "published",
  featured: false,
  liveUrl: "",
  githubUrl: "",
  challenge: "",
  solution: "",
  technologies: [],
  features: [],
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    ogImage: "",
  },
};
