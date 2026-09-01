import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminFooter,
  updateFooter,
  publishFooter,
  unpublishFooter,
  archiveFooter,
  restoreFooter,
  scheduleFooter,
} from "../../controllers/footerController.js";
import { updateFooterValidator } from "../../validators/footer.validator.js";
import { publishAtValidator } from "../../validators/common.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/footer
 * ------------------------------------------------------------------ */
router.get("/", getAdminFooter);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/footer
 * ------------------------------------------------------------------ */
router.patch("/", updateFooterValidator, updateFooter);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/footer/publish | /unpublish | /archive | /restore
 * PATCH /api/admin/footer/schedule  { publishAt: ISO8601 date }
 * ------------------------------------------------------------------ */
router.patch("/publish", publishFooter);
router.patch("/unpublish", unpublishFooter);
router.patch("/archive", archiveFooter);
router.patch("/restore", restoreFooter);
router.patch("/schedule", publishAtValidator(), scheduleFooter);

export default router;
