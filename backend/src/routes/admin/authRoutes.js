import express from "express";
import {
  verifyAdmin,
  logoutAdmin,
  changeAdminPasswordHandler,
  requestAdminOtpHandler,
  verifyAdminOtpHandler,
  startGoogleLogin,
  finishGoogleLogin,
} from "../../controllers/adminController.js";
import { optionalProtect, protect } from "../../middleware/authMiddleware.js";
import {
  passwordChangeLimiter,
  otpRequestLimiter,
  otpVerifyLimiter,
} from "../../middleware/rateLimiters.js";
import { changePasswordValidator } from "../../validators/authValidators.js";

const router = express.Router();

router.post("/login/otp/request", otpRequestLimiter, requestAdminOtpHandler);
router.post("/login/otp/verify", otpVerifyLimiter, verifyAdminOtpHandler);
router.get("/login/google", startGoogleLogin);
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
