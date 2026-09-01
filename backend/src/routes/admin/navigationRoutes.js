import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminNavigation,
  updateNavigation,
  publishNavigation,
  unpublishNavigation,
  archiveNavigation,
  restoreNavigation,
  scheduleNavigation,
} from "../../controllers/navigationController.js";
import { updateNavigationValidator } from "../../validators/navigation.validator.js";
import { publishAtValidator } from "../../validators/common.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/navigation
 * ------------------------------------------------------------------ */
router.get("/", getAdminNavigation);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/navigation
 * ------------------------------------------------------------------ */
router.patch("/", updateNavigationValidator, updateNavigation);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/navigation/publish | /unpublish | /archive | /restore
 * PATCH /api/admin/navigation/schedule  { publishAt: ISO8601 date }
 * ------------------------------------------------------------------ */
router.patch("/publish", publishNavigation);
router.patch("/unpublish", unpublishNavigation);
router.patch("/archive", archiveNavigation);
router.patch("/restore", restoreNavigation);
router.patch("/schedule", publishAtValidator(), scheduleNavigation);

export default router;
