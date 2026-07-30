import mongoose from "mongoose";
import singletonPlugin from "../utils/singletonPlugin.js";
import { NAV_MAX_ITEMS, NAV_MAX_CHILDREN_PER_ITEM } from "../constants/index.js";

const PATH_OR_URL_MATCH = [
  /^\/|^https?:\/\/.+/,
  "Path must start with '/' or be a valid HTTP/HTTPS URL",
];

/* ------------------------------------------------------------------ *
 * Sub-schema — a single nested (dropdown) nav-bar link. Deliberately
 * has NO `children` field of its own: navigation supports exactly two
 * levels (top-level items + one level of dropdown children), which
 * covers every realistic site-nav pattern without the unbounded-depth
 * complexity a true recursive tree would add to ordering, validation,
 * and the drag-and-drop editor.
 * ------------------------------------------------------------------ */
const navChildItemSchema = new mongoose.Schema(
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
      match: PATH_OR_URL_MATCH,
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
 * Sub-schema — a single top-level nav-bar link, optionally expanding
 * into a dropdown of `children`.
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
      match: PATH_OR_URL_MATCH,
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
    children: {
      type: [navChildItemSchema],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.length <= NAV_MAX_CHILDREN_PER_ITEM,
        message: `Each nav item must not exceed ${NAV_MAX_CHILDREN_PER_ITEM} dropdown children`,
      },
      default: [],
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
        validator: (arr) => Array.isArray(arr) && arr.length <= NAV_MAX_ITEMS,
        message: `Navigation must not exceed ${NAV_MAX_ITEMS} items`,
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
      match: PATH_OR_URL_MATCH,
    },
  },
  { timestamps: true },
);

navigationSchema.plugin(singletonPlugin);

export default mongoose.model("Navigation", navigationSchema, "navigation");
