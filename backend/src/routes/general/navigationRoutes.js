import express from "express";
import { getPublicNavigation } from "../../controllers/navigationController.js";

const router = express.Router();

// GET /api/navigation
router.get("/", getPublicNavigation);

export default router;
