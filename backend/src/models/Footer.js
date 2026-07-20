import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";

/* ------------------------------------------------------------------ *
 * Sub-schemas
 * ------------------------------------------------------------------ */

const footerLinkSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Footer link label is required"],
      trim: true,
      minlength: [1, "Label cannot be empty"],
      maxlength: [50, "Label must not exceed 50 characters"],
    },
    url: {
      type: String,
      required: [true, "Footer link URL is required"],
      trim: true,
      maxlength: [2048, "URL must not exceed 2048 characters"],
      match: [
        /^\/|^https?:\/\/.+/,
        "URL must start with '/' or be a valid HTTP/HTTPS URL",
      ],
    },
  },
  { _id: true },
);

const footerColumnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Footer column title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [60, "Title must not exceed 60 characters"],
    },
    links: {
      type: [footerLinkSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 15,
        message: "Each footer column must not exceed 15 links",
      },
      default: [],
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
 * Root schema — ONE document, global site footer
 * ------------------------------------------------------------------ */

const footerSchema = new mongoose.Schema(
  {
    columns: {
      type: [footerColumnSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 6,
        message: "Footer must not exceed 6 columns",
      },
      default: [],
    },

    copyrightText: {
      type: String,
      trim: true,
      // Function default: evaluated per-document (not once at schema
      // load time), so the year is always accurate.
      default: () => `© ${new Date().getFullYear()} All rights reserved.`,
      maxlength: [300, "Copyright text must not exceed 300 characters"],
    },

    showSocialLinks: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

footerSchema.plugin(singletonPlugin);

export default mongoose.model("Footer", footerSchema, "footer");
