import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import logger from "../utils/logger.js";

export { ServiceError } from "./ServiceError.js";

export const COOKIE_NAME = "admin_token";

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
});

export const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  expires: new Date(0),
});

const DUMMY_HASH =
  "$2b$12$invalidhashforcomparison000000000000000000000000000000000";

export const attemptLogin = async (username, password) => {
  if (!username || !password) {
    throw new ServiceError(
      "Username and password are required",
      400,
      "AUTH_CREDENTIALS_REQUIRED",
    );
  }

  const admin = await Admin.findOne({ username });

  const hashToCompare = admin?.password ?? DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, hashToCompare);

  if (!admin || !isMatch) {
    logger.warn("Failed admin login attempt", { username });
    throw new ServiceError(
      "Invalid credentials",
      401,
      "AUTH_INVALID_CREDENTIALS",
    );
  }

  if (!process.env.JWT_SECRET) {
    throw new ServiceError(
      "Server configuration error",
      500,
      "AUTH_SERVER_CONFIG_ERROR",
    );
  }

  const token = jwt.sign(
    { id: admin._id, tokenVersion: admin.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return token;
};

export const getVerifiedPayload = (admin) => ({
  authenticated: true,
  username: admin.username,
});
