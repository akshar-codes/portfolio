import express from "express";
import { getPublicSeo } from "../../controllers/seoController.js";

const router = express.Router();

// GET /api/seo
router.get("/", getPublicSeo);

export default router;
