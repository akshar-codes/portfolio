import express from "express";
import { getPublicSiteSettings } from "../../controllers/siteSettingsController.js";

const router = express.Router();

// GET /api/site-settings
router.get("/", getPublicSiteSettings);

export default router;
