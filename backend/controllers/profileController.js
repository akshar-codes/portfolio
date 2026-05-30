import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import { fetchProfile, patchProfile } from "../services/profileService.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ------------------------------------------------------------------ *
 * GET /api/profile          (public)
 * GET /api/admin/profile    (protected — same handler, different route)
 * ------------------------------------------------------------------ */
export const getProfile = asyncHandler(async (_req, res) => {
  const profile = await fetchProfile();
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
