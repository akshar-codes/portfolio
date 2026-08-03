import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(80, "Category name must not exceed 80 characters"),
});

export const categoryFormDefaults = { name: "" };

/**
 * Edit dialog schema — adds `status` (published/draft), which the
 * backend's PATCH /api/admin/categories/:id already supported but the
 * frontend had no UI for until the edit dialog shipped alongside the
 * reorder feature.
 */
export const categoryEditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(80, "Category name must not exceed 80 characters"),
  status: z.enum(["published", "draft"]),
});

export const categoryEditFormDefaults = { name: "", status: "published" };
