import express from "express";
import {
  loginAdmin,
  verifyAdmin,
  logoutAdmin,
  changeAdminPasswordHandler,
} from "../../controllers/adminController.js";
import { optionalProtect, protect } from "../../middleware/authMiddleware.js";
import { loginLimiter, passwordChangeLimiter } from "../../middleware/rateLimiters.js";
import { changePasswordValidator } from "../../validators/authValidators.js";

const router = express.Router();

router.post("/login", loginLimiter, loginAdmin);

router.get("/verify", optionalProtect, verifyAdmin);

router.post("/logout", protect, logoutAdmin);

router.patch(
  "/password",
  protect,
  passwordChangeLimiter,
  changePasswordValidator,
  changeAdminPasswordHandler,
);

export default router;
