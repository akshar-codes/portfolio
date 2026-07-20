import mongoose from "mongoose";
import { MAX_MEDIA_TAGS } from "../utils/constants.js";

/* ------------------------------------------------------------------ *
 * Media — centralized media library.
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

    // Logical grouping, independent of the physical Cloudinary path.
    // Mapped to an actual Cloudinary folder via cloudinaryFolder()
    // at upload time (see mediaService.js).
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

    // Scoped to "image" only for now — matches the existing
    // ALLOWED_IMAGE_MIME_TYPES / magic-byte constraints in
    // config/cloudinary.js. Extend both together if video/raw
    // support is ever added.
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
  },
  { timestamps: true },
);

/* ------------------------------------------------------------------ *
 * Indexes
 * ------------------------------------------------------------------ */

// Every Cloudinary asset is registered at most once.
mediaSchema.index({ public_id: 1 }, { unique: true, name: "public_id_unique" });

// Folder-scoped pagination, newest first — matches the default list sort.
mediaSchema.index({ folder: 1, createdAt: -1 });

// Single compound text index — MongoDB allows only one per collection,
// so filename/alt-text/tags all live in the same index for the search
// endpoint (see mediaService.fetchMediaLibrary).
mediaSchema.index(
  { originalName: "text", altText: "text", tags: "text" },
  { name: "media_text_search" },
);

export default mongoose.model("Media", mediaSchema, "media");
