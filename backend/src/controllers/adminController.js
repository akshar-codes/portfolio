import Admin from "../models/Admin.js";
import {
  attemptLogin,
  getVerifiedPayload,
  getCookieOptions,
  getClearCookieOptions,
  COOKIE_NAME,
} from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ---------------------------------------------------------------
   POST /api/admin/login
--------------------------------------------------------------- */
export const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const token = await attemptLogin(username, password);

  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return sendSuccess(res, null, "Login successful");
});

/* ---------------------------------------------------------------
   GET /api/admin/verify
--------------------------------------------------------------- */
export const verifyAdmin = (req, res) => {
  return sendSuccess(res, getVerifiedPayload(req.admin), "Authenticated");
};

/* ---------------------------------------------------------------
   POST /api/admin/logout
--------------------------------------------------------------- */
export const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(req.admin._id, { $inc: { tokenVersion: 1 } });

  res.clearCookie(COOKIE_NAME, getClearCookieOptions());
  return sendSuccess(res, null, "Logged out successfully");
});
