import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminAbout,
  updateAboutSection,
  publishAbout,
  unpublishAbout,
  archiveAbout,
  restoreAbout,
  scheduleAbout,
} from "../../controllers/aboutController.js";
import { updateAboutValidator } from "../../validators/aboutValidators.js";
import { publishAtValidator } from "../../validators/common.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/about
 * ------------------------------------------------------------------ */
router.get("/", getAdminAbout);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/about
 * ------------------------------------------------------------------ */
router.patch("/", updateAboutValidator, updateAboutSection);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/about/publish | /unpublish | /archive | /restore
 * PATCH /api/admin/about/schedule  { publishAt: ISO8601 date }
 * ------------------------------------------------------------------ */
router.patch("/publish", publishAbout);
router.patch("/unpublish", unpublishAbout);
router.patch("/archive", archiveAbout);
router.patch("/restore", restoreAbout);
router.patch("/schedule", publishAtValidator(), scheduleAbout);

export default router;
