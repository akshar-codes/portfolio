import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [120, "Title must not exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must not exceed 2000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    image: {
      url: {
        type: String,
        required: [true, "Image URL is required"],
        trim: true,
        maxlength: [2048, "Image URL must not exceed 2048 characters"],
        match: [/^https?:\/\/.+/, "Image URL must be a valid HTTP/HTTPS URL"],
      },
      public_id: {
        type: String,
        required: [true, "Image public_id is required"],
        trim: true,
        maxlength: [500, "Image public_id must not exceed 500 characters"],
      },
    },
    // ── Extended detail fields ─────────────────────────────────────
    bannerImage: {
      url: {
        type: String,
        trim: true,
        default: "",
        maxlength: [2048, "Banner image URL must not exceed 2048 characters"],
        match: [
          /^$|^https?:\/\/.+/,
          "Banner image must be a valid URL or empty",
        ],
      },
      public_id: {
        type: String,
        trim: true,
        default: "",
        maxlength: [
          500,
          "Banner image public_id must not exceed 500 characters",
        ],
      },
    },
    technologies: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, "Technology name cannot be empty"],
          maxlength: [60, "Technology name must not exceed 60 characters"],
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 30,
        message: "Technologies list must not exceed 30 entries",
      },
      default: [],
    },
    features: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, "Feature cannot be empty"],
          maxlength: [200, "Feature must not exceed 200 characters"],
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 20,
        message: "Features list must not exceed 20 entries",
      },
      default: [],
    },
    gallery: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
            maxlength: [
              2048,
              "Gallery image URL must not exceed 2048 characters",
            ],
            match: [/^https?:\/\/.+/, "Gallery image must be a valid URL"],
          },
          public_id: {
            type: String,
            required: true,
            trim: true,
            maxlength: [
              500,
              "Gallery image public_id must not exceed 500 characters",
            ],
          },
          order: {
            type: Number,
            default: 0,
          },
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 10,
        message: "Gallery must not exceed 10 images",
      },
      default: [],
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "GitHub URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "GitHub URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    liveUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Live URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Live URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    challenge: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Challenge must not exceed 1000 characters"],
    },
    solution: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Solution must not exceed 1000 characters"],
    },
    // ── Keep legacy projectUrl for backward-compat ─────────────────
    projectUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2048, "Project URL must not exceed 2048 characters"],
      match: [
        /^$|^https?:\/\/.+/,
        "Project URL must be empty or a valid HTTP/HTTPS URL",
      ],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

projectSchema.index({ order: 1 });
projectSchema.index({ category: 1 });

export default mongoose.model("Project", projectSchema);
