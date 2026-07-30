import { z } from "zod";

/* ── Service card dialog (existing shape, unchanged) ─────────────── */
export const serviceFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
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
export const serviceFormDefaults = { title: "", description: "", icon: "web" };

/* ── Timeline entry dialog ─────────────────────────────────────────── */
export const timelineFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title must not exceed 120 characters"),
  subtitle: z.string().trim().max(150, "Subtitle must not exceed 150 characters"),
  dateRange: z
    .string()
    .trim()
    .min(1, "Date range is required")
    .max(80, "Date range must not exceed 80 characters"),
  description: z.string().trim().max(1000, "Description must not exceed 1000 characters"),
  icon: z.string().trim().max(60, "Icon key must not exceed 60 characters"),
});
export const timelineFormDefaults = {
  title: "",
  subtitle: "",
  dateRange: "",
  description: "",
  icon: "",
};

/* ── Highlight (stat badge) dialog ─────────────────────────────────── */
export const highlightFormSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, "Value is required")
    .max(20, "Value must not exceed 20 characters"),
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(60, "Label must not exceed 60 characters"),
  icon: z.string().trim().max(60, "Icon key must not exceed 60 characters"),
});
export const highlightFormDefaults = { value: "", label: "", icon: "" };

/* ── Personal info row dialog ──────────────────────────────────────── */
export const personalInfoFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(40, "Label must not exceed 40 characters"),
  value: z
    .string()
    .trim()
    .min(1, "Value is required")
    .max(150, "Value must not exceed 150 characters"),
});
export const personalInfoFormDefaults = { label: "", value: "" };
