import express from "express";
import { getAbout } from "../../controllers/aboutController.js";

const router = express.Router();

// GET /api/about
router.get("/", getAbout);

export default router;
