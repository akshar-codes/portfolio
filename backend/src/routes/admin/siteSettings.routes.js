import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getSiteSettings,
  updateSiteSettings,
} from "../../controllers/siteSettingsController.js";
import { updateSiteSettingsValidator } from "../../validators/siteSettingsValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/site-settings
 * ------------------------------------------------------------------ */
router.get("/", getSiteSettings);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/site-settings
 * ------------------------------------------------------------------ */
router.patch("/", updateSiteSettingsValidator, updateSiteSettings);

export default router;
