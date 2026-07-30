import { z } from "zod";

export const navItemFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(50, "Label must not exceed 50 characters"),
  path: z
    .string()
    .trim()
    .min(1, "Path is required")
    .max(2048, "Path must not exceed 2048 characters")
    .refine((val) => /^\/|^https?:\/\/.+/.test(val), "Must start with '/' or be a valid URL"),
  isExternal: z.boolean().optional(),
  openInNewTab: z.boolean().optional(),
  visible: z.boolean().optional(),
});

export const navItemFormDefaults = {
  label: "",
  path: "",
  isExternal: false,
  openInNewTab: false,
  visible: true,
};
