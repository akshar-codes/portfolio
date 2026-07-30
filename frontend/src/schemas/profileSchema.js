import { z } from "zod";

/* ── Basic info (hero identity) ───────────────────────────────────── */
export const profileBasicInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must not exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Must be a valid email address")
    .max(254, "Email must not exceed 254 characters"),
  phone: z.string().trim().max(30, "Phone must not exceed 30 characters"),
  location: z
    .string()
    .trim()
    .max(120, "Location must not exceed 120 characters"),
  avatar: z
    .string()
    .trim()
    .max(2048, "Avatar URL must not exceed 2048 characters")
    .refine(
      (val) => val === "" || /^https?:\/\/.+/.test(val),
      "Avatar must be a valid HTTP/HTTPS URL or empty",
    ),
  introduction: z.string().max(20000, "Introduction is too long"),
});

export const profileBasicInfoDefaults = {
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  avatar: "",
  introduction: "",
};

/* ── Social link dialog ───────────────────────────────────────────── */
export const socialLinkFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(50, "Label must not exceed 50 characters"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2048, "URL must not exceed 2048 characters")
    .refine((val) => /^https?:\/\/.+/.test(val), "Must be a valid HTTP/HTTPS URL"),
  icon: z
    .string()
    .trim()
    .min(1, "Icon key is required")
    .max(40, "Icon key must not exceed 40 characters")
    .regex(
      /^[a-z0-9_-]+$/i,
      "Icon key may only contain letters, numbers, hyphens, and underscores",
    ),
});

export const socialLinkFormDefaults = { label: "", url: "", icon: "" };

/* ── CTA button dialog ────────────────────────────────────────────── */
export const ctaButtonFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(40, "Label must not exceed 40 characters"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2048, "URL must not exceed 2048 characters")
    .refine(
      (val) => /^\/|^https?:\/\/.+/.test(val),
      "URL must start with '/' or be a valid HTTP/HTTPS address",
    ),
  style: z.enum(["primary", "secondary", "outline"]),
  openInNewTab: z.boolean(),
});

export const ctaButtonFormDefaults = {
  label: "",
  url: "",
  style: "primary",
  openInNewTab: false,
};

export const CTA_BUTTON_STYLE_OPTIONS = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "outline", label: "Outline" },
];

/* ── Statistic dialog ─────────────────────────────────────────────── */
export const statisticFormSchema = z.object({
  value: z.coerce.number().min(0, "Value cannot be negative"),
  suffix: z.string().trim().max(10, "Suffix must not exceed 10 characters"),
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(60, "Label must not exceed 60 characters"),
  icon: z.string().trim().max(60, "Icon key must not exceed 60 characters"),
});

export const statisticFormDefaults = {
  value: 0,
  suffix: "",
  label: "",
  icon: "",
};
