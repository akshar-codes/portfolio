import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAdminProfile,
  updateProfile,
  publishProfile,
  unpublishProfile,
} from "../../controllers/profileController.js";
import { updateProfileValidator } from "../../validators/profileValidators.js";

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
 * PATCH /api/admin/profile/publish | /unpublish
 * ------------------------------------------------------------------ */
router.patch("/publish", publishProfile);
router.patch("/unpublish", unpublishProfile);

export default router;
