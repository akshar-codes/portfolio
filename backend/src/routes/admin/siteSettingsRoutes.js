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
// NOTE: previously imported from "../../validators/siteSettingsValidators.js",
// which does not exist on disk (the real file is siteSettings.validator.js,
// same ".x.validator.js" convention as footer.validator.js/seo.validator.js/
// navigation.validator.js) — fixed here. The same mismatch exists in
// footerRoutes.js/navigationRoutes.js/seoRoutes.js and should be reconciled
// separately; flagged in docs/architecture.md's existing "Known issue" note.
import { updateSiteSettingsValidator } from "../../validators/siteSettings.validator.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/site-settings
 * ------------------------------------------------------------------ */
router.get("/", getAdminSiteSettings);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/site-settings
 * Accepts any subset of the patchable top-level fields (see
 * PATCHABLE_FIELDS in services/SiteSettingsService.js). Does NOT
 * accept logo/favicon — see the dedicated routes below.
 * ------------------------------------------------------------------ */
router.patch("/", updateSiteSettingsValidator, updateSiteSettings);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/site-settings/publish | /unpublish
 * ------------------------------------------------------------------ */
router.patch("/publish", publishSiteSettings);
router.patch("/unpublish", unpublishSiteSettings);

/* ------------------------------------------------------------------ *
 * Logo — dedicated upload/delete routes (Stage → Save → Destroy; see
 * services/SiteSettingsService.js). Kept out of the generic PATCH
 * above because the Cloudinary public_id must stay tied to whatever
 * asset was actually uploaded — reused `upload` single-file multer
 * instance from config/cloudinary.js (5 MB limit, image-only
 * fileFilter), same as the media library.
 * ------------------------------------------------------------------ */
router.patch("/logo", upload.single("file"), uploadSiteSettingsLogo);
router.delete("/logo", deleteSiteSettingsLogo);

/* ------------------------------------------------------------------ *
 * Favicon — same rationale as logo above.
 * ------------------------------------------------------------------ */
router.patch("/favicon", upload.single("file"), uploadSiteSettingsFavicon);
router.delete("/favicon", deleteSiteSettingsFavicon);

export default router;
