import express from "express";
import { getPublicResume } from "../../controllers/resumeController.js";

const router = express.Router();

// GET /api/resume
router.get("/", getPublicResume);

export default router;
