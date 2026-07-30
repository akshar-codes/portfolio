import { z } from "zod";

const optionalImageUrl = () =>
  z
    .string()
    .trim()
    .max(2048, "URL must not exceed 2048 characters")
    .refine(
      (val) => val === "" || /^https?:\/\/.+/.test(val),
      "Must be a valid HTTP/HTTPS image URL or empty",
    );

/* ── Hero ──────────────────────────────────────────────────────────── */
export const AVAILABILITY_STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
  { value: "open_to_offers", label: "Open to Offers" },
];

export const heroFormSchema = z.object({
  greeting: z.string().trim().max(60, "Greeting must not exceed 60 characters"),
  headline: z.string().trim().max(100, "Headline must not exceed 100 characters"),
  summary: z.string().max(20000, "Summary is too long"),
  availabilityStatus: z.enum(["available", "unavailable", "open_to_offers"]),
  ctaLabel: z.string().trim().max(40, "CTA label must not exceed 40 characters"),
  ctaEnabled: z.boolean(),
  heroImage: optionalImageUrl(),
});

export const heroFormDefaults = {
  greeting: "Hello, I'm",
  headline: "",
  summary: "",
  availabilityStatus: "available",
  ctaLabel: "Download CV",
  ctaEnabled: true,
  heroImage: "",
};

/* ── About Me ──────────────────────────────────────────────────────── */
export const aboutMeFormSchema = z.object({
  summary: z.string().max(20000, "Summary is too long"),
});
export const aboutMeFormDefaults = { summary: "" };

/* ── Experience dialog ─────────────────────────────────────────────── */
export const experienceFormSchema = z.object({
  role: z.string().trim().min(2, "Role must be at least 2 characters").max(100),
  company: z.string().trim().min(2, "Company must be at least 2 characters").max(150),
  location: z.string().trim().max(120),
  startDate: z.string().trim().min(1, "Start date is required").max(40),
  endDate: z.string().trim().max(40),
  current: z.boolean(),
  description: z.string().max(20000, "Description is too long"),
  companyLogo: optionalImageUrl(),
});
export const experienceFormDefaults = {
  role: "",
  company: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  companyLogo: "",
};

/* ── Education dialog ──────────────────────────────────────────────── */
export const educationFormSchema = z.object({
  institution: z.string().trim().min(2, "Institution must be at least 2 characters").max(200),
  duration: z.string().trim().min(1, "Duration is required").max(80),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
});
export const educationFormDefaults = { institution: "", duration: "", description: "" };

/* ── Certification dialog ──────────────────────────────────────────── */
export const certificationFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(150),
  issuer: z.string().trim().min(2, "Issuer must be at least 2 characters").max(150),
  issueDate: z.string().trim().max(40),
  credentialUrl: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (val) => val === "" || /^https?:\/\/.+/.test(val),
      "Must be a valid HTTP/HTTPS URL or empty",
    ),
  badgeImage: optionalImageUrl(),
});
export const certificationFormDefaults = {
  title: "",
  issuer: "",
  issueDate: "",
  credentialUrl: "",
  badgeImage: "",
};

/* ── Skill group dialog (category name only — items managed via TagInput) ── */
export const skillGroupFormSchema = z.object({
  category: z.string().trim().min(2, "Category name must be at least 2 characters").max(80),
});
export const skillGroupFormDefaults = { category: "" };

/* ── Language dialog ───────────────────────────────────────────────── */
export const LANGUAGE_PROFICIENCY_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "professional", label: "Professional" },
  { value: "fluent", label: "Fluent" },
  { value: "native", label: "Native" },
];

export const languageFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  proficiency: z.enum(["basic", "intermediate", "professional", "fluent", "native"]),
});
export const languageFormDefaults = { name: "", proficiency: "professional" };

/* ── Interest dialog ───────────────────────────────────────────────── */
export const interestFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  icon: z.string().trim().max(60),
});
export const interestFormDefaults = { name: "", icon: "" };

/* ── Download dialog ───────────────────────────────────────────────── */
export const DOWNLOAD_FILE_TYPE_OPTIONS = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "Word Document" },
  { value: "other", label: "Other" },
];

export const downloadFormSchema = z.object({
  label: z.string().trim().min(2, "Label must be at least 2 characters").max(80),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .refine((val) => /^https?:\/\/.+/.test(val), "Must be a valid HTTP/HTTPS URL"),
  fileType: z.enum(["pdf", "docx", "other"]),
});
export const downloadFormDefaults = { label: "", url: "", fileType: "pdf" };
