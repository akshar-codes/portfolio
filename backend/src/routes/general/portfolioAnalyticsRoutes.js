import express from "express";
import { trackPortfolioEvent } from "../../controllers/portfolioAnalyticsController.js";

const router = express.Router();

router.post("/events", (req, res, next) => {
  const { type, visitorId, sessionId } = req.body ?? {};
  if (typeof type !== "string" || typeof visitorId !== "string" || typeof sessionId !== "string") {
    return res.status(400).json({ success: false, message: "Invalid analytics event." });
  }
  next();
}, trackPortfolioEvent);

export default router;
