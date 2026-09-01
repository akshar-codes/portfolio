import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminProfile,
  updateProfile,
  publishProfile,
  unpublishProfile,
  archiveProfile,
  restoreProfile,
  scheduleProfile,
} from "../../controllers/profileController.js";
import { updateProfileValidator } from "../../validators/profileValidators.js";
import { publishAtValidator } from "../../validators/common.js";

const router = express.Router();

router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/profile
 * ------------------------------------------------------------------ */
router.get("/", getAdminProfile);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/profile
 * ------------------------------------------------------------------ */
router.patch("/", updateProfileValidator, updateProfile);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/profile/publish | /unpublish | /archive | /restore
 * PATCH /api/admin/profile/schedule  { publishAt: ISO8601 date }
 * ------------------------------------------------------------------ */
router.patch("/publish", publishProfile);
router.patch("/unpublish", unpublishProfile);
router.patch("/archive", archiveProfile);
router.patch("/restore", restoreProfile);
router.patch("/schedule", publishAtValidator(), scheduleProfile);

export default router;
