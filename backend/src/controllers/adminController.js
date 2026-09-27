import {
  attemptLogin,
  getVerifiedPayload,
  getCookieOptions,
  getClearCookieOptions,
  COOKIE_NAME,
  changeAdminPassword,
} from "../services/authService.js";
import { validationResult } from "express-validator";
import { findByUsername, incrementTokenVersion } from "../repositories/adminRepository.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import { recordActivity } from "../services/activityLogService.js";
import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";

/* ---------------------------------------------------------------
   POST /api/admin/login
--------------------------------------------------------------- */
export const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  let token;
  try {
    token = await attemptLogin(username, password);
  } catch (error) {
    void recordActivity({ actor: { username: String(username || "Unknown admin") }, action: "login", resource: "admin", description: `${String(username || "Unknown admin").slice(0, 80)} failed login`, ip: req.ip, method: req.method, path: req.originalUrl })
      .catch((err) => logger.error("Failed to persist activity log", { message: err.message }));
    throw error;
  }

  const admin = await findByUsername(username);
  void recordActivity({ actor: admin, action: "login", resource: "admin", description: `${admin?.username ?? username} logged in`, ip: req.ip, method: req.method, path: req.originalUrl })
    .catch((err) => logger.error("Failed to persist activity log", { message: err.message }));

  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return sendSuccess(res, null, "Login successful");
});

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
  }).catch((err) => logger.error("Failed to persist activity log", { message: err.message }));

  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return sendSuccess(res, null, "Password changed successfully.");
});
