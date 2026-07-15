import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import {
  sendMessage,
  getMessages,
  deleteMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ------------------------------------------------------------------ *
 * Rate limiter for the PUBLIC contact form only.
 * ------------------------------------------------------------------ */
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: "Too many messages sent. Try again later.",
  },
});

/* ===============================
   Public - Send Message
================================ */
router.post(
  "/",
  contactFormLimiter,
  [
    body("fullname")
      .trim()
      .notEmpty()
      .withMessage("Full name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),

    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message cannot be empty")
      .isLength({ min: 10 })
      .withMessage("Message must be at least 10 characters"),

    body("website").optional().equals("").withMessage("Bot detected"),
  ],
  sendMessage,
);

/* ===============================
   Admin - Get All Messages
================================ */
router.get("/", protect, getMessages);

/* ===============================
   Admin - Delete Message
================================ */
router.delete("/:id", protect, deleteMessage);

export default router;
