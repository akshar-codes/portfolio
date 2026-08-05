import { body, param } from "express-validator";
import { MAX_MEDIA_TAGS, MEDIA_CAPTION_MAX_LENGTH } from "../constants/index.js";

export const mediaIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid media ID"),
];

/**
 * Shared tags validator — accepts a real array (JSON body) or a
 * JSON-stringified array (multipart/form-data), matching the
 * convention AddProject/ManageProjects already use for
 * `technologies`/`features`.
 */
function tagsValidator(value) {
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
}

const folderFieldValidator = () =>
  body("folder")
    .optional({ checkFalsy: true })
    .trim()
    .toLowerCase()
    .isLength({ max: 100 })
    .withMessage("Folder must not exceed 100 characters")
    .matches(/^[a-z0-9/_-]+$/)
    .withMessage(
      "Folder may only contain lowercase letters, numbers, hyphens, underscores, and slashes",
    );

/**
 * Shared body validators for both upload (POST) and replace
 * (PATCH .../replace) requests — both accept the same optional
 * metadata fields alongside the multipart file. File-presence itself
 * is validated in the service layer (mediaService.js), since an
 * uploaded file lives on req.file, not req.body.
 */
export const mediaUploadValidators = [
  folderFieldValidator(),

  body("altText")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Alt text must not exceed 200 characters"),

  body("caption")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: MEDIA_CAPTION_MAX_LENGTH })
    .withMessage(`Caption must not exceed ${MEDIA_CAPTION_MAX_LENGTH} characters`),

  body("tags").optional({ checkFalsy: true }).custom(tagsValidator),
];

/**
 * PATCH /:id (JSON body) — pure metadata update, no file involved.
 * `tags` uses `.optional()` (not checkFalsy) so an explicit `[]`
 * still validates and correctly clears existing tags.
 */
export const updateMediaValidator = [
  body("altText")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Alt text must not exceed 200 characters"),

  body("caption")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: MEDIA_CAPTION_MAX_LENGTH })
    .withMessage(`Caption must not exceed ${MEDIA_CAPTION_MAX_LENGTH} characters`),

  body("tags").optional().custom(tagsValidator),

  folderFieldValidator(),
];

export const bulkIdsValidator = [
  body("ids").isArray({ min: 1 }).withMessage("ids must be a non-empty array"),
  body("ids.*").isMongoId().withMessage("Each id must be a valid MongoDB ObjectId"),
];
