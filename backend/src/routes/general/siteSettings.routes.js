import express from "express";
import { getSiteSettings } from "../../controllers/siteSettingsController.js";

const router = express.Router();

// GET /api/site-settings
router.get("/", getSiteSettings);

export default router;
