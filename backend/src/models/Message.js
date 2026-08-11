import mongoose from "mongoose";
import { MESSAGE_STATUSES, DEFAULT_MESSAGE_STATUS } from "../constants/index.js";

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

    /* ── Archive workflow ────────────────────────────────────────────
     * Independent of `status` (read/unread) — mirrors an email
     * client's inbox/archive split rather than overloading `status`
     * with a third state. A message can be read AND archived, or
     * unread AND archived; the two dimensions never conflict.
     * ---------------------------------------------------------------- */
    isArchived: {
      type: Boolean,
      default: false,
    },

    /* ── Spam detection support ───────────────────────────────────────
     * Populated by utils/spamDetector.js at submission time — a
     * deterministic, explainable heuristic scorer, not an ML
     * classifier or third-party service — and independently
     * overridable by an admin via PATCH /:id/spam. `spamScore` /
     * `spamReasons` are retained even after an admin overrides
     * `isSpam`, so the original heuristic verdict stays visible and
     * auditable in the Message Details view.
     * ---------------------------------------------------------------- */
    isSpam: {
      type: Boolean,
      default: false,
    },
    spamScore: {
      type: Number,
      default: 0,
      min: [0, "spamScore cannot be negative"],
      max: [100, "spamScore cannot exceed 100"],
    },
    spamReasons: {
      type: [String],
      default: [],
    },

    /* ── Submission metadata ──────────────────────────────────────────
     * Best-effort, captured from the request at submission time (see
     * controllers/messageController.js sendMessage). Never required —
     * IP/UA can legitimately be unavailable behind certain proxies,
     * and that alone is never a reason to reject a genuine message.
     * ---------------------------------------------------------------- */
    ipAddress: {
      type: String,
      trim: true,
      default: "",
      maxlength: [64, "IP address must not exceed 64 characters"],
    },
    userAgent: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "User agent must not exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ isArchived: 1, createdAt: -1 });
messageSchema.index({ isSpam: 1, createdAt: -1 });
messageSchema.index({ ipAddress: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
