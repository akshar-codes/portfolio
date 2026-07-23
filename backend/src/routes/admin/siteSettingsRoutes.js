import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminSiteSettings,
  updateSiteSettings,
  publishSiteSettings,
  unpublishSiteSettings,
} from "../../controllers/siteSettingsController.js";
import { updateSiteSettingsValidator } from "../../validators/siteSettingsValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/site-settings
 * ------------------------------------------------------------------ */
router.get("/", getAdminSiteSettings);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/site-settings
 * ------------------------------------------------------------------ */
router.patch("/", updateSiteSettingsValidator, updateSiteSettings);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/site-settings/publish | /unpublish
 * ------------------------------------------------------------------ */
router.patch("/publish", publishSiteSettings);
router.patch("/unpublish", unpublishSiteSettings);

export default router;
