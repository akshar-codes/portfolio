import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const COOKIE_NAME = "admin_token";

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

export const protect = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error("[protect] FATAL: JWT_SECRET is not set");
    return res.status(500).json({ message: "Server configuration error" });
  }

  const token = extractToken(req);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized — no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res
        .status(401)
        .json({ message: "Not authorized — malformed token payload" });
    }

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Not authorized — account not found" });
    }

    req.admin = admin;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Not authorized — token expired" });
    }

    return res.status(401).json({ message: "Not authorized — token invalid" });
  }
};
