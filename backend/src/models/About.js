import mongoose from "mongoose";
import { CONTENT_STATUSES, DEFAULT_CONTENT_STATUS } from "../utils/constants.js";

/* ------------------------------------------------------------------ *
 * Sub-schemas
 * ------------------------------------------------------------------ */

const paragraphSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Paragraph text is required"],
      trim: true,
      minlength: [10, "Paragraph must be at least 10 characters"],
      maxlength: [1000, "Paragraph must not exceed 1000 characters"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    icon: {
      type: String,
      required: [true, "Icon key is required"],
      trim: true,
      lowercase: true,
      maxlength: [40, "Icon key must not exceed 40 characters"],
      match: [
        /^[a-z0-9_-]+$/,
        "Icon key may only contain lowercase letters, numbers, hyphens, and underscores",
      ],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true },
);

/* ------------------------------------------------------------------ *
 * Root schema — ONE document per portfolio (singleton pattern)
 * ------------------------------------------------------------------ */

const aboutSchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      default: "default",
      immutable: true,
      match: [/^[a-z0-9_-]+$/, "Invalid owner value"],
    },

    status: {
      type: String,
      enum: {
        values: CONTENT_STATUSES,
        message: `status must be one of: ${CONTENT_STATUSES.join(", ")}`,
      },
      default: DEFAULT_CONTENT_STATUS,
    },

    paragraphs: {
      type: [paragraphSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 20,
        message: "Paragraphs list must not exceed 20 entries",
      },
      default: [],
    },

    services: {
      type: [serviceSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 12,
        message: "Services list must not exceed 12 entries",
      },
      default: [],
    },
  },
  { timestamps: true },
);

aboutSchema.index({ owner: 1 }, { unique: true, sparse: true });
aboutSchema.index({ status: 1 });

/* ------------------------------------------------------------------ *
 * Static helper — always returns the singleton, creating it if absent
 * ------------------------------------------------------------------ */
aboutSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ owner: "default" }).lean();
  if (!doc) {
    doc = await this.create({ owner: "default" });
    doc = doc.toObject();
  }
  return doc;
};

export default mongoose.model("About", aboutSchema);
