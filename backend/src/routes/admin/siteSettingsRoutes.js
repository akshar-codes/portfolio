import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../config/cloudinary.js";
import {
  getAdminSiteSettings,
  updateSiteSettings,
  publishSiteSettings,
  unpublishSiteSettings,
  uploadSiteSettingsLogo,
  deleteSiteSettingsLogo,
  uploadSiteSettingsFavicon,
  deleteSiteSettingsFavicon,
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

/* ------------------------------------------------------------------ *
 * Logo — dedicated upload/delete routes (Stage → Save → Destroy; see
 * ------------------------------------------------------------------ */
router.patch("/logo", upload.single("file"), uploadSiteSettingsLogo);
router.delete("/logo", deleteSiteSettingsLogo);

/* ------------------------------------------------------------------ *
 * Favicon — same rationale as logo above.
 * ------------------------------------------------------------------ */
router.patch("/favicon", upload.single("file"), uploadSiteSettingsFavicon);
router.delete("/favicon", deleteSiteSettingsFavicon);

export default router;
