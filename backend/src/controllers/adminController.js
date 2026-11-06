import {
  getVerifiedPayload,
  getCookieOptions,
  getClearCookieOptions,
  COOKIE_NAME,
  changeAdminPassword,
  createAdminToken,
} from "../services/authService.js";
import { validationResult } from "express-validator";
import { incrementTokenVersion } from "../repositories/adminRepository.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import { recordActivity } from "../services/activityLogService.js";
import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";
import passport from "../config/passport.js";
import {
  startAdminPasswordLogin,
  startAdminGoogleLogin,
  verifyAdminOtp,
} from "../services/adminOtpService.js";
import { sendAdminOtpEmail } from "../services/adminLoginEmailService.js";

const OTP_PENDING_COOKIE = "admin_otp_pending";
const OTP_PENDING_COOKIE_MAX_AGE = 10 * 60 * 1000;

function setOtpPendingCookie(res, token) {
  res.cookie(OTP_PENDING_COOKIE, token, {
    ...getCookieOptions(),
    maxAge: OTP_PENDING_COOKIE_MAX_AGE,
    path: "/api/admin/login",
  });
}

function clearOtpPendingCookie(res) {
  res.clearCookie(OTP_PENDING_COOKIE, {
    ...getClearCookieOptions(),
    path: "/api/admin/login",
  });
}

export const loginWithPasswordHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

  const challengeToken = await startAdminPasswordLogin(
    req.body?.email,
    req.body?.password,
    sendAdminOtpEmail,
  );
  setOtpPendingCookie(res, challengeToken);
  return sendSuccess(
    res,
    null,
    "A verification code has been sent to your admin email.",
  );
});

export const verifyAdminOtpHandler = asyncHandler(async (req, res) => {
  const admin = await verifyAdminOtp(
    req.cookies?.[OTP_PENDING_COOKIE],
    req.body?.code,
  );
  clearOtpPendingCookie(res);
  res.cookie(COOKIE_NAME, createAdminToken(admin), getCookieOptions());
  void recordActivity({
    actor: admin,
    action: "login",
    resource: "admin",
    description: `${admin.username} completed sign-in verification`,
    ip: req.ip,
    method: req.method,
    path: req.originalUrl,
  }).catch((err) =>
    logger.error("Failed to persist activity log", { message: err.message }),
  );
  return sendSuccess(res, null, "Login successful");
});

export const startGoogleLogin = (req, res, next) => {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_CALLBACK_URL ||
    (!process.env.ADMIN_EMAIL && process.env.NODE_ENV !== "development")
  ) {
    return res.redirect(
      `${process.env.ALLOWED_ORIGIN}/admin/login?auth=google-unavailable`,
    );
  }
  return passport.authenticate("google", { session: false, state: true })(
    req,
    res,
    next,
  );
};

export const finishGoogleLogin = (req, res, next) => {
  passport.authenticate("google", { session: false }, async (error, admin) => {
    const loginUrl = new URL("/admin/login", process.env.ALLOWED_ORIGIN);
    if (error || !admin) {
      loginUrl.searchParams.set("auth", "google-denied");
      if (error)
        logger.warn("Google admin authentication failed", {
          message: error.message,
        });
      return res.redirect(loginUrl.toString());
    }
    try {
      const challengeToken = await startAdminGoogleLogin(
        admin,
        sendAdminOtpEmail,
      );
      setOtpPendingCookie(res, challengeToken);
      loginUrl.searchParams.set("auth", "otp-required");
      return res.redirect(loginUrl.toString());
    } catch (otpError) {
      logger.error("Could not start Google sign-in verification", {
        message: otpError.message,
      });
      loginUrl.searchParams.set("auth", "otp-failed");
      return res.redirect(loginUrl.toString());
    }
  })(req, res, next);
};

/* ---------------------------------------------------------------
   GET /api/admin/verify
--------------------------------------------------------------- */
export const verifyAdmin = (req, res) => {
  if (!req.admin) return sendSuccess(res, null, "Not authenticated");
  return sendSuccess(res, getVerifiedPayload(req.admin), "Authenticated");
};

/* ---------------------------------------------------------------
   POST /api/admin/logout
--------------------------------------------------------------- */
export const logoutAdmin = asyncHandler(async (req, res) => {
  await incrementTokenVersion(req.admin._id);

  res.clearCookie(COOKIE_NAME, getClearCookieOptions());
  return sendSuccess(res, null, "Logged out successfully");
});

/* ---------------------------------------------------------------
   PATCH /api/admin/password
--------------------------------------------------------------- */
export const changeAdminPasswordHandler = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { currentPassword, newPassword } = req.body;
  const { token, username } = await changeAdminPassword(
    req.admin._id,
    currentPassword,
    newPassword,
  );

  void recordActivity({
    actor: req.admin,
    action: "update",
    resource: "admin",
    description: `${username} changed the admin password`,
    ip: req.ip,
    method: req.method,
    path: req.originalUrl,
  }).catch((err) =>
    logger.error("Failed to persist activity log", { message: err.message }),
  );

  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return sendSuccess(res, null, "Password changed successfully.");
});
