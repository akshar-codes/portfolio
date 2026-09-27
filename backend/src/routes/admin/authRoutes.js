import express from "express";
import {
  loginAdmin,
  verifyAdmin,
  logoutAdmin,
} from "../../controllers/adminController.js";
import { optionalProtect, protect } from "../../middleware/authMiddleware.js";
import { loginLimiter } from "../../middleware/rateLimiters.js";

const router = express.Router();

router.post("/login", loginLimiter, loginAdmin);

router.get("/verify", optionalProtect, verifyAdmin);

router.post("/logout", protect, logoutAdmin);

export default router;
