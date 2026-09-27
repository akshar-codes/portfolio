import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import asyncHandler from "../../utils/asyncHandler.js";
import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";

const router = express.Router();

router.post("/publish", protect, asyncHandler(async (req, res) => {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hookUrl) throw new AppError("Publishing is not configured.", 503);

  let parsedUrl;
  try {
    parsedUrl = new URL(hookUrl);
  } catch {
    throw new AppError("Publishing is not configured correctly.", 503);
  }
  if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "api.vercel.com" || parsedUrl.username || parsedUrl.password) {
    throw new AppError("Publishing is not configured correctly.", 503);
  }

  let response;
  try {
    response = await fetch(parsedUrl, { method: "POST", redirect: "error", signal: AbortSignal.timeout(10_000) });
  } catch (error) {
    logger.error("Vercel deployment hook request failed", { reqId: req.id, errorName: error.name });
    throw new AppError("Could not start the deployment. Please try again.", 502);
  }
  if (!response.ok) {
    logger.error("Vercel deployment hook rejected the request", { reqId: req.id, status: response.status });
    throw new AppError("Could not start the deployment. Please try again.", 502);
  }

  return res.status(202).json({ success: true, data: { status: "deployment_started" }, message: "Portfolio deployment started." });
}));

export default router;
