import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { getResume, updateResume } from "../../controllers/resumeController.js";
import { updateResumeValidator } from "../../validators/resumeValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/resume
 * ------------------------------------------------------------------ */
router.get("/", getResume);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/resume
 * Accepts any subset of: hero, aboutMe, experience, education,
 * certifications, skills, languages, interests, downloads.
 * ------------------------------------------------------------------ */
router.patch("/", updateResumeValidator, updateResume);

export default router;
