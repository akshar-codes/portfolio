import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  getAbout,
  updateAboutSection,
} from "../../controllers/aboutController.js";
import { updateAboutValidator } from "../../validators/aboutValidators.js";

const router = express.Router();

// Every route in this file requires a valid admin JWT cookie.
router.use(protect);

/* ------------------------------------------------------------------ *
 * GET /api/admin/about
 * ------------------------------------------------------------------ */
router.get("/", getAbout);

/* ------------------------------------------------------------------ *
 * PATCH /api/admin/about
 * ------------------------------------------------------------------ */
router.patch("/", updateAboutValidator, updateAboutSection);

export default router;
