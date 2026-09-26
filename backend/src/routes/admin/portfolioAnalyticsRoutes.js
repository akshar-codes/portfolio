import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { exportPortfolioAnalytics, getPortfolioAnalyticsSummary } from "../../controllers/portfolioAnalyticsController.js";

const router = express.Router();
router.use(protect);
router.get("/export.csv", exportPortfolioAnalytics);
router.get("/", getPortfolioAnalyticsSummary);
export default router;
