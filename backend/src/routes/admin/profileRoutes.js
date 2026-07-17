import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
} from "../../controllers/profileController.js";
import { updateProfileValidator } from "../../validators/profileValidators.js";

const router = express.Router();

router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/profile
 * ------------------------------------------------------------------ */
router.get("/", getProfile);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/profile
 * ------------------------------------------------------------------ */
router.patch("/", updateProfileValidator, updateProfile);

export default router;
