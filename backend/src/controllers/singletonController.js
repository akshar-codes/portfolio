import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  CONTENT_STATUS_DRAFT,
  CONTENT_STATUS_PUBLISHED,
} from "../utils/constants.js";

/**
 * Factory that builds the standard GET (public + admin) / PATCH /
 * publish / unpublish controller set for a singleton CMS resource.
 *
 * `getPublicResource` is mounted on the public route (`/api/<resource>`)
 * and 404s while the resource is in draft status. `getAdminResource` is
 * mounted on the protected admin route and always returns the full
 * document regardless of status, matching the existing About/Profile
 * convention where the admin panel must be able to see and edit content
 * that isn't live yet.
 *
 * @param {object} options
 * @param {{fetchAdmin: Function, fetchPublic: Function, patchSingleton: Function, setStatus: Function}} options.service
 * @param {string} options.resourceName - human-readable name used in response messages
 */
export function createSingletonController({ service, resourceName }) {
  if (!service || typeof service.fetchAdmin !== "function") {
    throw new Error(
      "createSingletonController: a valid service (fetchAdmin/fetchPublic/patchSingleton/setStatus) is required.",
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
    const updated = await service.setStatus(CONTENT_STATUS_PUBLISHED);
    return sendSuccess(res, updated, `${resourceName} published successfully`);
  });

  const unpublishResource = asyncHandler(async (_req, res) => {
    const updated = await service.setStatus(CONTENT_STATUS_DRAFT);
    return sendSuccess(
      res,
      updated,
      `${resourceName} unpublished successfully`,
    );
  });

  return {
    getPublicResource,
    getAdminResource,
    updateResource,
    publishResource,
    unpublishResource,
  };
}

export default createSingletonController;
