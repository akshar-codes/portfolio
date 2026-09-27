import {
  attemptLogin,
  getVerifiedPayload,
  getCookieOptions,
  getClearCookieOptions,
  COOKIE_NAME,
} from "../services/authService.js";
import { findByUsername, incrementTokenVersion } from "../repositories/adminRepository.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import { recordActivity } from "../services/activityLogService.js";
import logger from "../utils/logger.js";

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
