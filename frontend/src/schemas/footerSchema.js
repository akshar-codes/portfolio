import { z } from "zod";

export const footerColumnFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(60, "Title must not exceed 60 characters"),
});

export const footerColumnFormDefaults = {
  title: "",
};

export const footerLinkFormSchema = z.object({
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
    .refine((val) => /^\/|^https?:\/\/.+/.test(val), "Must start with '/' or be a valid URL"),
});

export const footerLinkFormDefaults = {
  label: "",
  url: "",
};
