import express from "express";
import { getSeo } from "../../controllers/seoController.js";

const router = express.Router();

// GET /api/seo
router.get("/", getSeo);

export default router;
