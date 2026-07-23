import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminResume,
  updateResume,
  publishResume,
  unpublishResume,
} from "../../controllers/resumeController.js";
import { updateResumeValidator } from "../../validators/resumeValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/resume
 * ------------------------------------------------------------------ */
router.get("/", getAdminResume);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/resume
 * Accepts any subset of: hero, aboutMe, experience, education,
 * certifications, skills, languages, interests, downloads.
 * ------------------------------------------------------------------ */
router.patch("/", updateResumeValidator, updateResume);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/resume/publish | /unpublish
 * ------------------------------------------------------------------ */
router.patch("/publish", publishResume);
router.patch("/unpublish", unpublishResume);

export default router;
