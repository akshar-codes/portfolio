import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Factory that builds the standard GET/PATCH controller pair for a
 * singleton CMS resource.
 *
 * `getResource` is intended to be mounted on BOTH the public route
 * (`/api/<resource>`) and the protected admin route (`/api/admin/<resource>`),
 * matching the existing About/Profile/Resume convention where a single
 * handler serves both — the resource is identical, only the route's
 * auth middleware differs.
 *
 * @param {object} options
 * @param {{fetchSingleton: Function, patchSingleton: Function}} options.service
 * @param {string} options.resourceName - human-readable name used in response messages
 */
export function createSingletonController({ service, resourceName }) {
  if (!service || typeof service.fetchSingleton !== "function") {
    throw new Error(
      "createSingletonController: a valid service (fetchSingleton/patchSingleton) is required.",
    );
  }
  if (!resourceName) {
    throw new Error("createSingletonController: resourceName is required.");
  }

  const getResource = asyncHandler(async (_req, res) => {
    const data = await service.fetchSingleton();
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

  return { getResource, updateResource };
}

export default createSingletonController;
