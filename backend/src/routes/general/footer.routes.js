import express from "express";
import { getFooter } from "../../controllers/footerController.js";

const router = express.Router();

// GET /api/footer
router.get("/", getFooter);

export default router;
