import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { listContentVersions, restoreContentVersion } from "../services/contentVersionService.js";

export const getVersions = asyncHandler(async (req, res) =>
  sendSuccess(res, await listContentVersions(req.params.resource, req.params.id), "Content versions retrieved"));

export const restoreVersion = asyncHandler(async (req, res) => {
  const result = await restoreContentVersion(req.params.resource, req.params.id, req.params.versionId);
  return sendSuccess(res, result.restored, "Content version restored");
});
