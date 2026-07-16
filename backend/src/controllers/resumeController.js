import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import { fetchResume, patchResumeSection } from "../services/resumeService.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ------------------------------------------------------------------ *
 * GET /api/admin/resume
 * ------------------------------------------------------------------ */
export const getResume = asyncHandler(async (_req, res) => {
  const resume = await fetchResume();
  return sendSuccess(res, resume, "Resume retrieved successfully");
});

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/resume
 * ------------------------------------------------------------------ */
export const updateResumeSection = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { section, value } = req.body;

  const updated = await patchResumeSection(section, value);
  return sendSuccess(
    res,
    updated,
    `Resume section "${section}" updated successfully`,
  );
});
