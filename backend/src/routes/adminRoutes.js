import express from "express";
import rateLimit from "express-rate-limit";
import {
  loginAdmin,
  verifyAdmin,
  logoutAdmin,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

router.post("/login", loginLimiter, loginAdmin);

router.get("/verify", protect, verifyAdmin);

router.post("/logout", protect, logoutAdmin);

export default router;
