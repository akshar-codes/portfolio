import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";

/* ------------------------------------------------------------------ *
 * Sub-schema — a single nav-bar link
 * ------------------------------------------------------------------ */

const navItemSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Nav item label is required"],
      trim: true,
      minlength: [1, "Label cannot be empty"],
      maxlength: [50, "Label must not exceed 50 characters"],
    },
    path: {
      type: String,
      required: [true, "Nav item path is required"],
      trim: true,
      maxlength: [2048, "Path must not exceed 2048 characters"],
      match: [
        /^\/|^https?:\/\/.+/,
        "Path must start with '/' or be a valid HTTP/HTTPS URL",
      ],
    },
    isExternal: {
      type: Boolean,
      default: false,
    },
    openInNewTab: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: true,
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
 * Root schema — ONE document, global site navigation
 * ------------------------------------------------------------------ */

const navigationSchema = new mongoose.Schema(
  {
    items: {
      type: [navItemSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 20,
        message: "Navigation must not exceed 20 items",
      },
      default: [],
    },

    ctaEnabled: {
      type: Boolean,
      default: true,
    },

    ctaLabel: {
      type: String,
      trim: true,
      default: "Hire me",
      maxlength: [40, "CTA label must not exceed 40 characters"],
    },

    ctaUrl: {
      type: String,
      trim: true,
      default: "/contact",
      maxlength: [2048, "CTA URL must not exceed 2048 characters"],
      match: [
        /^\/|^https?:\/\/.+/,
        "CTA URL must start with '/' or be a valid HTTP/HTTPS URL",
      ],
    },
  },
  { timestamps: true },
);

navigationSchema.plugin(singletonPlugin);

export default mongoose.model("Navigation", navigationSchema, "navigation");
