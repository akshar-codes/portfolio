import express from "express";
import { getPublicFooter } from "../../controllers/footerController.js";

const router = express.Router();

// GET /api/footer
router.get("/", getPublicFooter);

export default router;
