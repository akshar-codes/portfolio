import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username must not exceed 50 characters"],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        "Username may only contain letters, numbers, underscores, and hyphens",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],

      minlength: [60, "Expected a bcrypt hash (60 chars)"],
      maxlength: [100, "Password hash too long"],
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

adminSchema.index({ username: 1 }, { unique: true, name: "username_unique" });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
