import mongoose from "mongoose";

/* ------------------------------------------------------------------ *
 * Sub-schemas
 * ------------------------------------------------------------------ */

const educationEntrySchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
      minlength: [2, "Institution must be at least 2 characters"],
      maxlength: [200, "Institution must not exceed 200 characters"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
      maxlength: [80, "Duration must not exceed 80 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description must not exceed 1000 characters"],
    },
  },
  { _id: true },
);

const skillCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [80, "Category name must not exceed 80 characters"],
    },
    items: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, "Skill item cannot be empty"],
          maxlength: [100, "Skill item must not exceed 100 characters"],
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 30,
        message: "Skills list must not exceed 30 items",
      },
      default: [],
    },
  },
  { _id: true },
);

/* ------------------------------------------------------------------ *
 * Root schema — ONE document per portfolio (singleton pattern)
 * ------------------------------------------------------------------ */

const resumeSchema = new mongoose.Schema(
  {
    /**
     * Singleton guard — we store exactly one resume document.
     * A sparse unique index on `owner` (always "default") prevents
     * accidental duplicates while allowing future extension if needed.
     */
    owner: {
      type: String,
      default: "default",
      immutable: true,
      match: [/^[a-z0-9_-]+$/, "Invalid owner value"],
    },

    education: {
      type: [educationEntrySchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 20,
        message: "Education list must not exceed 20 entries",
      },
      default: [],
    },

    skills: {
      type: [skillCategorySchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 15,
        message: "Skills must not exceed 15 categories",
      },
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

resumeSchema.index({ owner: 1 }, { unique: true, sparse: true });

/* ------------------------------------------------------------------ *
 * Static helper — always returns the singleton, creating it if absent
 * ------------------------------------------------------------------ */
resumeSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ owner: "default" }).lean();
  if (!doc) {
    doc = await this.create({ owner: "default" });
    doc = doc.toObject();
  }
  return doc;
};

export default mongoose.model("Resume", resumeSchema);
