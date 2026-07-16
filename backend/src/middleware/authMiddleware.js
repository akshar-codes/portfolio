import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { COOKIE_NAME } from "../services/authService.js"; // single source of truth

function extractToken(req) {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[1].trim().length > 0) {
      return parts[1].trim();
    }
  }

  return null;
}

export const protect = asyncHandler(async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const token = extractToken(req);

  if (!token) {
    throw new AppError("Not authorized — no token provided.", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded?.id) {
    throw new AppError("Not authorized — malformed token payload.", 401);
  }

  const admin = await Admin.findById(decoded.id).select("-password");

  if (!admin) {
    throw new AppError("Not authorized — account not found.", 401);
  }

  if ((decoded.tokenVersion ?? 0) !== (admin.tokenVersion ?? 0)) {
    throw new AppError("Not authorized — session has been invalidated.", 401);
  }

  req.admin = admin;
  next();
});
