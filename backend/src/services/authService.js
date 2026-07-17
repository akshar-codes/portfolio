import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findByUsername } from "../repositories/adminRepository.js";
import { ServiceError } from "./ServiceError.js";
import logger from "../utils/logger.js";
import {
  COOKIE_NAME,
  JWT_EXPIRES_IN,
  COOKIE_MAX_AGE_MS,
} from "../utils/constants.js";

export { ServiceError };
export { COOKIE_NAME };

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: COOKIE_MAX_AGE_MS,
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

  const admin = await findByUsername(username);

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
    { expiresIn: JWT_EXPIRES_IN },
  );

  return token;
};

export const getVerifiedPayload = (admin) => ({
  authenticated: true,
  username: admin.username,
});
