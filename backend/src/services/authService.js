import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findByUsername,
  findByIdWithPassword,
  updatePasswordAndIncrementTokenVersion,
} from "../repositories/adminRepository.js";
import { ServiceError } from "./ServiceError.js";
import logger from "../utils/logger.js";
import {
  COOKIE_NAME,
  JWT_EXPIRES_IN,
  COOKIE_MAX_AGE_MS,
} from "../constants/index.js";

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

export const changeAdminPassword = async (adminId, currentPassword, newPassword) => {
  const admin = await findByIdWithPassword(adminId);
  if (!admin) {
    throw new ServiceError("Admin account not found.", 404, "AUTH_ADMIN_NOT_FOUND");
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
  if (!isCurrentPasswordValid) {
    throw new ServiceError("Current password is incorrect.", 401, "AUTH_CURRENT_PASSWORD_INVALID");
  }

  if (currentPassword === newPassword) {
    throw new ServiceError("New password must be different from the current password.", 400, "AUTH_PASSWORD_UNCHANGED");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updatedAdmin = await updatePasswordAndIncrementTokenVersion(
    admin._id,
    admin.password,
    passwordHash,
  );
  if (!updatedAdmin) {
    throw new ServiceError("Admin credentials changed. Sign in again and retry.", 409, "AUTH_CREDENTIALS_CHANGED");
  }

  const token = jwt.sign(
    { id: updatedAdmin._id, tokenVersion: updatedAdmin.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  return { token, username: updatedAdmin.username };
};

export const getVerifiedPayload = (admin) => ({
  authenticated: true,
  username: admin.username,
});
