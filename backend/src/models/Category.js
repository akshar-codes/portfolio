import mongoose from "mongoose";
import { generateSlug } from "../utils/slug.js";
import { CONTENT_STATUSES, DEFAULT_CONTENT_STATUS } from "../utils/constants.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [80, "Category name must not exceed 80 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [120, "Slug must not exceed 120 characters"],
    },

    status: {
      type: String,
      enum: {
        values: CONTENT_STATUSES,
        message: `status must be one of: ${CONTENT_STATUSES.join(", ")}`,
      },
      default: DEFAULT_CONTENT_STATUS,
    },
  },
  { timestamps: true },
);

// Compound indexes
categorySchema.index({ slug: 1 }, { unique: true, name: "slug_unique" });
categorySchema.index({ name: 1 });
categorySchema.index({ status: 1 });

categorySchema.pre("save", async function () {
  if (!this.slug && this.name) {
    this.slug = generateSlug(this.name);
  }
});

export default mongoose.model("Category", categorySchema);
