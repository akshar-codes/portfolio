import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminAbout,
  updateAboutSection,
  publishAbout,
  unpublishAbout,
} from "../../controllers/aboutController.js";
import { updateAboutValidator } from "../../validators/aboutValidators.js";

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
 * PATCH /api/admin/about/publish | /unpublish
 * ------------------------------------------------------------------ */
router.patch("/publish", publishAbout);
router.patch("/unpublish", unpublishAbout);

export default router;
