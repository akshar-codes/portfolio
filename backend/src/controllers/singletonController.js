import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Factory that builds the standard GET (public + admin) / PATCH /
 * publish / unpublish / archive / restore / schedule controller set for
 * a singleton CMS resource.
 *
 * NOTE: this is the ONLY copy of this factory. Several controllers in
 * this codebase previously imported a sibling file named
 * `SingletonController.js` (capitalized) which does not exist — that
 * import only resolved on case-insensitive filesystems (macOS/Windows)
 * and would fail to boot on the case-sensitive `node:22-alpine` Docker
 * target. Those imports have been corrected to point here.
 */
export function createSingletonController({ service, resourceName }) {
  if (!service || typeof service.fetchAdmin !== "function") {
    throw new Error(
      "createSingletonController: a valid service (fetchAdmin/fetchPublic/patchSingleton/publish/unpublish/archive/restore/schedule) is required.",
    );
  }
  if (!resourceName) {
    throw new Error("createSingletonController: resourceName is required.");
  }

  const getPublicResource = asyncHandler(async (_req, res) => {
    const data = await service.fetchPublic();
    return sendSuccess(res, data, `${resourceName} retrieved successfully`);
  });

  const getAdminResource = asyncHandler(async (_req, res) => {
    const data = await service.fetchAdmin();
    return sendSuccess(res, data, `${resourceName} retrieved successfully`);
  });

  const updateResource = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const updated = await service.patchSingleton(req.body);
    return sendSuccess(res, updated, `${resourceName} updated successfully`);
  });

  const publishResource = asyncHandler(async (_req, res) => {
    const updated = await service.publish();
    return sendSuccess(res, updated, `${resourceName} published successfully`);
  });

  const unpublishResource = asyncHandler(async (_req, res) => {
    const updated = await service.unpublish();
    return sendSuccess(
      res,
      updated,
      `${resourceName} unpublished successfully`,
    );
  });

  const archiveResource = asyncHandler(async (_req, res) => {
    const updated = await service.archive();
    return sendSuccess(res, updated, `${resourceName} archived successfully`);
  });

  const restoreResource = asyncHandler(async (_req, res) => {
    const updated = await service.restore();
    return sendSuccess(
      res,
      updated,
      `${resourceName} restored to draft successfully`,
    );
  });

  const scheduleResource = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const updated = await service.schedule(req.body.publishAt);
    return sendSuccess(res, updated, `${resourceName} scheduled successfully`);
  });

  return {
    getPublicResource,
    getAdminResource,
    updateResource,
    publishResource,
    unpublishResource,
    archiveResource,
    restoreResource,
    scheduleResource,
  };
}

export default createSingletonController;
