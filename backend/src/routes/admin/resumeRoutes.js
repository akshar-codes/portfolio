import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getResume,
  updateResumeSection,
} from "../../controllers/resumeController.js";
import { updateResumeValidator } from "../../validators/resumeValidators.js";

const router = express.Router();

router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/resume
 * ------------------------------------------------------------------ */
router.get("/", getResume);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/resume
 * ------------------------------------------------------------------ */
router.patch("/", updateResumeValidator, updateResumeSection);

export default router;
