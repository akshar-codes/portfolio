// models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Full Stack (MERN)",
        "Frontend (React)",
        "Backend / APIs",
        "AI / ML",
      ],
      required: true,
    },

    image: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },

    projectUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Project", projectSchema);
