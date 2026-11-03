import express from "express";
import {
  verifyAdmin,
  logoutAdmin,
  changeAdminPasswordHandler,
  loginWithPasswordHandler,
  verifyAdminOtpHandler,
  startGoogleLogin,
  finishGoogleLogin,
} from "../../controllers/adminController.js";
import { optionalProtect, protect } from "../../middleware/authMiddleware.js";
import {
  passwordChangeLimiter,
  otpRequestLimiter,
  otpVerifyLimiter,
  loginLimiter,
} from "../../middleware/rateLimiters.js";
import {
  changePasswordValidator,
  passwordLoginValidator,
} from "../../validators/authValidators.js";

const router = express.Router();

router.post(
  "/login/password",
  loginLimiter,
  otpRequestLimiter,
  passwordLoginValidator,
  loginWithPasswordHandler,
);
router.post("/login/otp/verify", otpVerifyLimiter, verifyAdminOtpHandler);
router.get("/login/google", otpRequestLimiter, startGoogleLogin);
router.get("/login/google/callback", finishGoogleLogin);

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
