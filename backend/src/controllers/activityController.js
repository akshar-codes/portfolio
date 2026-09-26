import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { exportActivity, listActivity } from "../services/activityLogService.js";

export const getActivity = asyncHandler(async (req, res) => sendSuccess(res, await listActivity(req.query), "Activity retrieved"));

export const exportActivityCsv = asyncHandler(async (req, res) => {
  const csv = await exportActivity(req.query);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="activity-log.csv"');
  return res.status(200).send(csv);
});
