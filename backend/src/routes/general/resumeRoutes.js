import express from "express";
import { getResume } from "../../controllers/resumeController.js";

const router = express.Router();

// GET /api/resume
router.get("/", getResume);

export default router;
