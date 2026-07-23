import express from "express";
import { getPublicAbout } from "../../controllers/aboutController.js";

const router = express.Router();

// GET /api/about
router.get("/", getPublicAbout);

export default router;
