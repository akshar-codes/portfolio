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
      maxlength: [1000, "Description must not exceed 1000 characters"],
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
