import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import { fetchAbout, patchAboutSection } from "../services/aboutService.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ------------------------------------------------------------------ *
 * GET /api/about   (public)
 * GET /api/admin/about  (protected — same handler, different route)
 * ------------------------------------------------------------------ */
export const getAbout = asyncHandler(async (_req, res) => {
  const about = await fetchAbout();
  return sendSuccess(res, about, "About retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/about   (protected)
 * ------------------------------------------------------------------ */
export const updateAboutSection = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { section, value } = req.body;

  const updated = await patchAboutSection(section, value);
  return sendSuccess(
    res,
    updated,
    `About section "${section}" updated successfully`,
  );
});
