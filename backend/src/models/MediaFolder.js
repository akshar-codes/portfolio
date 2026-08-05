import mongoose from "mongoose";

/* ------------------------------------------------------------------ *
 * MediaFolder — flat (single-level) organizational folders for the
 * Media Library dashboard. Deliberately NOT a recursive tree — mirrors
 * this codebase's existing preference for bounded nesting (e.g.
 * Navigation.items[].children caps at one level, see
 * NAV_MAX_CHILDREN_PER_ITEM) rather than unbounded depth.
 *
 * Distinct from Media.folder's free-string usage by other upload flows
 * (site settings logo, project thumbnails, ...) — those never create a
 * MediaFolder document, they just write a path-like string. Only
 * folders created through the Media Library dashboard exist here.
 *
 * A "general" slug is treated as the protected default bucket — see
 * services/mediaFolderService.js — new uploads with no folder selected
 * fall back to it (MEDIA_DEFAULT_FOLDER in constants/index.js).
 * ------------------------------------------------------------------ */

const mediaFolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      minlength: [1, "Folder name cannot be empty"],
      maxlength: [60, "Folder name must not exceed 60 characters"],
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [80, "Folder slug must not exceed 80 characters"],
    },

    // Sort position in the folder sidebar. The protected "general"
    // folder is seeded with order -1 so it always sorts first.
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

mediaFolderSchema.index({ slug: 1 }, { unique: true, name: "slug_unique" });
mediaFolderSchema.index({ name: 1 });
mediaFolderSchema.index({ order: 1 });

export default mongoose.model("MediaFolder", mediaFolderSchema, "mediaFolders");
