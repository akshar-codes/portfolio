import express from "express";
import { getPublicProfile } from "../../controllers/profileController.js";

const router = express.Router();

// GET /api/profile
router.get("/", getPublicProfile);

export default router;
