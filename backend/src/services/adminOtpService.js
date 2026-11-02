import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import AdminLoginChallenge from "../models/AdminLoginChallenge.js";
import { findSoleAdmin } from "../repositories/adminRepository.js";
import { ServiceError } from "./ServiceError.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function configuredAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

export async function requestAdminOtp(email, sendEmail) {
  const normalized = String(email ?? "")
    .trim()
    .toLowerCase();
  const adminEmail = configuredAdminEmail();
  if (
    !adminEmail ||
    !process.env.GMAIL_USER ||
    !process.env.GMAIL_APP_PASSWORD
  ) {
    throw new ServiceError(
      "Email login is not configured.",
      503,
      "AUTH_EMAIL_NOT_CONFIGURED",
    );
  }

  // Return the same response for unknown email addresses; never disclose the
  // configured admin address or whether an account exists.
  if (normalized !== adminEmail || !(await findSoleAdmin())) return;

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = await bcrypt.hash(code, 12);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await AdminLoginChallenge.deleteMany({ email: adminEmail });
  await AdminLoginChallenge.create({ email: adminEmail, codeHash, expiresAt });
  try {
    await sendEmail({ to: adminEmail, code, expiresAt });
  } catch (error) {
    await AdminLoginChallenge.deleteMany({ email: adminEmail });
    throw error;
  }
}

export async function verifyAdminOtp(email, submittedCode) {
  const normalized = String(email ?? "")
    .trim()
    .toLowerCase();
  const adminEmail = configuredAdminEmail();
  const challenge =
    normalized === adminEmail && adminEmail
      ? await AdminLoginChallenge.findOne({ email: adminEmail }).sort({
          createdAt: -1,
        })
      : null;
  const code = String(submittedCode ?? "").trim();

  if (
    !challenge ||
    challenge.expiresAt <= new Date() ||
    challenge.attempts >= MAX_ATTEMPTS
  ) {
    throw new ServiceError(
      "Invalid or expired verification code.",
      401,
      "AUTH_OTP_INVALID",
    );
  }
  if (
    !/^\d{6}$/.test(code) ||
    !(await bcrypt.compare(code, challenge.codeHash))
  ) {
    await AdminLoginChallenge.updateOne(
      { _id: challenge._id, attempts: { $lt: MAX_ATTEMPTS } },
      { $inc: { attempts: 1 } },
    );
    throw new ServiceError(
      "Invalid or expired verification code.",
      401,
      "AUTH_OTP_INVALID",
    );
  }

  // Delete atomically so a challenge cannot issue more than one session.
  const consumed = await AdminLoginChallenge.findOneAndDelete({
    _id: challenge._id,
    attempts: { $lt: MAX_ATTEMPTS },
    expiresAt: { $gt: new Date() },
  });
  if (!consumed)
    throw new ServiceError(
      "Invalid or expired verification code.",
      401,
      "AUTH_OTP_INVALID",
    );

  const admin = await findSoleAdmin();
  if (!admin)
    throw new ServiceError(
      "Admin account not found.",
      404,
      "AUTH_ADMIN_NOT_FOUND",
    );
  return admin;
}
