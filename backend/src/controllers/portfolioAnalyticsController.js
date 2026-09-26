import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { exportPortfolioAnalyticsCsv, getPortfolioAnalytics, recordPortfolioEvent } from "../services/portfolioAnalyticsService.js";

export const trackPortfolioEvent = asyncHandler(async (req, res) => {
  const event = await recordPortfolioEvent(req.body ?? {});
  return sendSuccess(res, { accepted: Boolean(event) }, "Analytics event accepted");
});

export const getPortfolioAnalyticsSummary = asyncHandler(async (req, res) => {
  return sendSuccess(res, await getPortfolioAnalytics(req.query), "Portfolio analytics retrieved");
});

export const exportPortfolioAnalytics = asyncHandler(async (req, res) => {
  const csv = await exportPortfolioAnalyticsCsv(req.query);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="portfolio-analytics.csv"');
  return res.status(200).send(csv);
});
