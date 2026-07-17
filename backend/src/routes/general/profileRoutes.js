import express from "express";
import { getProfile } from "../../controllers/profileController.js";

const router = express.Router();

// GET /api/profile
router.get("/", getProfile);

export default router;
