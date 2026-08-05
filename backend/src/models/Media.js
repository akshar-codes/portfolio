import mongoose from "mongoose";
import { MAX_MEDIA_TAGS, MEDIA_CAPTION_MAX_LENGTH } from "../constants/index.js";

/* ------------------------------------------------------------------ *
 * Media — centralized media library.
 *
 * `deletedAt` implements a soft-delete/restore ("Trash") workflow:
 * DELETE /:id sets this timestamp instead of removing the document or
 * touching the underlying Cloudinary asset, so accidental deletes are
 * recoverable. Only the dedicated "permanent delete" endpoints ever
 * destroy the Cloudinary asset and remove the document itself — see
 * services/mediaService.js.
 * ------------------------------------------------------------------ */

const mediaSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
      maxlength: [255, "Original filename must not exceed 255 characters"],
    },

    url: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true,
      maxlength: [2048, "URL must not exceed 2048 characters"],
      match: [/^https?:\/\/.+/, "URL must be a valid HTTP/HTTPS address"],
    },

    public_id: {
      type: String,
      required: [true, "Cloudinary public_id is required"],
      trim: true,
      maxlength: [500, "public_id must not exceed 500 characters"],
    },

    // Stores the owning MediaFolder's `slug` (see models/MediaFolder.js),
    // or the MEDIA_DEFAULT_FOLDER fallback ("general") when unassigned.
    // Kept as a free string (not a populated ref) so existing non-Media-
    // Library upload flows (site settings logo, project thumbnails, ...)
    // that already write arbitrary folder-like paths here continue to
    // work unchanged.
    folder: {
      type: String,
      trim: true,
      lowercase: true,
      default: "general",
      maxlength: [100, "Folder must not exceed 100 characters"],
      match: [
        /^[a-z0-9/_-]+$/,
        "Folder may only contain lowercase letters, numbers, hyphens, underscores, and slashes",
      ],
    },

    format: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: [10, "Format must not exceed 10 characters"],
    },

    mimeType: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "MIME type must not exceed 100 characters"],
    },

    resourceType: {
      type: String,
      enum: {
        values: ["image"],
        message: "resourceType must be 'image'",
      },
      default: "image",
    },

    width: {
      type: Number,
      min: [0, "Width cannot be negative"],
      default: 0,
    },

    height: {
      type: Number,
      min: [0, "Height cannot be negative"],
      default: 0,
    },

    bytes: {
      type: Number,
      required: [true, "File size (bytes) is required"],
      min: [0, "File size cannot be negative"],
    },

    altText: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Alt text must not exceed 200 characters"],
    },

    caption: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        MEDIA_CAPTION_MAX_LENGTH,
        `Caption must not exceed ${MEDIA_CAPTION_MAX_LENGTH} characters`,
      ],
    },

    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: [40, "Tag must not exceed 40 characters"],
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= MAX_MEDIA_TAGS,
        message: `Media must not exceed ${MAX_MEDIA_TAGS} tags`,
      },
      default: [],
    },

    // Soft-delete marker — see file header comment. `null` = active.
    // A missing field (pre-existing documents) is treated as active too,
    // since MongoDB's `{ deletedAt: null }` query matches both explicit
    // null and absent fields — mirrors the CONTENT_STATUS_DRAFT
    // rationale documented in utils/constants.js.
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

/* ------------------------------------------------------------------ *
 * Indexes
 * ------------------------------------------------------------------ */

// Every Cloudinary asset is registered at most once.
mediaSchema.index({ public_id: 1 }, { unique: true, name: "public_id_unique" });

mediaSchema.index({ folder: 1, createdAt: -1 });
mediaSchema.index({ deletedAt: 1, createdAt: -1 });

mediaSchema.index(
  { originalName: "text", altText: "text", caption: "text", tags: "text" },
  { name: "media_text_search" },
);

export default mongoose.model("Media", mediaSchema, "media");
