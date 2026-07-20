import { body, param } from "express-validator";
import { MAX_MEDIA_TAGS } from "../utils/constants.js";

export const mediaIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid media ID"),
];

/**
 * Shared body validators for both upload (POST) and replace
 * (PATCH .../replace) requests — both accept the same optional
 * metadata fields alongside the multipart file. File-presence itself
 * is validated in the service layer (mediaService.js), since an
 * uploaded file lives on req.file, not req.body.
 */
export const mediaUploadValidators = [
  body("folder")
    .optional({ checkFalsy: true })
    .trim()
    .toLowerCase()
    .isLength({ max: 100 })
    .withMessage("Folder must not exceed 100 characters")
    .matches(/^[a-z0-9/_-]+$/)
    .withMessage(
      "Folder may only contain lowercase letters, numbers, hyphens, underscores, and slashes",
    ),

  body("altText")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Alt text must not exceed 200 characters"),

  // Sent as a JSON-stringified array in multipart/form-data — the same
  // convention AddProject/ManageProjects already use for
  // `technologies`/`features`.
  body("tags")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (Array.isArray(value)) {
        if (value.length > MAX_MEDIA_TAGS) {
          throw new Error(`tags must not exceed ${MAX_MEDIA_TAGS} entries`);
        }
        if (!value.every((t) => typeof t === "string")) {
          throw new Error("Each tag must be a string");
        }
        return true;
      }

      if (typeof value !== "string") {
        throw new Error("tags must be an array or a JSON-encoded array");
      }

      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch {
        throw new Error("tags must be valid JSON");
      }

      if (!Array.isArray(parsed)) {
        throw new Error("tags must be a JSON array of strings");
      }
      if (parsed.length > MAX_MEDIA_TAGS) {
        throw new Error(`tags must not exceed ${MAX_MEDIA_TAGS} entries`);
      }
      if (!parsed.every((t) => typeof t === "string")) {
        throw new Error("Each tag must be a string");
      }
      return true;
    }),
];
