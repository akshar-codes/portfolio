import mongoose from "mongoose";
import { MESSAGE_STATUSES, DEFAULT_MESSAGE_STATUS } from "../utils/constants.js";

const messageSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name must not exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email must not exceed 254 characters"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [2000, "Message must not exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: MESSAGE_STATUSES,
        message: `status must be one of: ${MESSAGE_STATUSES.join(", ")}`,
      },
      default: DEFAULT_MESSAGE_STATUS,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
