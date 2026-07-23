import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  fetchAdminAbout,
  fetchPublicAbout,
  patchAboutSection,
  setAboutStatus,
} from "../services/aboutService.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  CONTENT_STATUS_DRAFT,
  CONTENT_STATUS_PUBLISHED,
} from "../utils/constants.js";

/* ------------------------------------------------------------------ *
 * GET /api/about   (public — 404s while draft)
 * ------------------------------------------------------------------ */
export const getPublicAbout = asyncHandler(async (_req, res) => {
  const about = await fetchPublicAbout();
  return sendSuccess(res, about, "About retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * GET /api/admin/about  (protected — any status)
 * ------------------------------------------------------------------ */
export const getAdminAbout = asyncHandler(async (_req, res) => {
  const about = await fetchAdminAbout();
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

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/about/publish  (protected)
 * ------------------------------------------------------------------ */
export const publishAbout = asyncHandler(async (_req, res) => {
  const updated = await setAboutStatus(CONTENT_STATUS_PUBLISHED);
  return sendSuccess(res, updated, "About published successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/about/unpublish  (protected)
 * ------------------------------------------------------------------ */
export const unpublishAbout = asyncHandler(async (_req, res) => {
  const updated = await setAboutStatus(CONTENT_STATUS_DRAFT);
  return sendSuccess(res, updated, "About unpublished successfully");
});
