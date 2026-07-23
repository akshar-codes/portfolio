import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import {
  fetchAdminProfile,
  fetchPublicProfile,
  patchProfile,
  setProfileStatus,
} from "../services/profileService.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  CONTENT_STATUS_DRAFT,
  CONTENT_STATUS_PUBLISHED,
} from "../utils/constants.js";

/* ------------------------------------------------------------------ *
 * GET /api/profile          (public — 404s while draft)
 * ------------------------------------------------------------------ */
export const getPublicProfile = asyncHandler(async (_req, res) => {
  const profile = await fetchPublicProfile();
  return sendSuccess(res, profile, "Profile retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * GET /api/admin/profile    (protected — any status)
 * ------------------------------------------------------------------ */
export const getAdminProfile = asyncHandler(async (_req, res) => {
  const profile = await fetchAdminProfile();
  return sendSuccess(res, profile, "Profile retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/profile  (protected)
 * ------------------------------------------------------------------ */
export const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const updated = await patchProfile(req.body);
  return sendSuccess(res, updated, "Profile updated successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/profile/publish  (protected)
 * ------------------------------------------------------------------ */
export const publishProfile = asyncHandler(async (_req, res) => {
  const updated = await setProfileStatus(CONTENT_STATUS_PUBLISHED);
  return sendSuccess(res, updated, "Profile published successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/profile/unpublish  (protected)
 * ------------------------------------------------------------------ */
export const unpublishProfile = asyncHandler(async (_req, res) => {
  const updated = await setProfileStatus(CONTENT_STATUS_DRAFT);
  return sendSuccess(res, updated, "Profile unpublished successfully");
});
