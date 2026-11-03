import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomInt } from "node:crypto";
import AdminLoginChallenge from "../models/AdminLoginChallenge.js";
import { findSoleAdmin } from "../repositories/adminRepository.js";
import { ServiceError } from "./ServiceError.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function configuredAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

async function issueAdminOtp(sendEmail) {
  const adminEmail = configuredAdminEmail();
  const admin = await findSoleAdmin();
  if (!adminEmail || !admin) {
    throw new ServiceError(
      "Admin sign-in is unavailable.",
      503,
      "AUTH_LOGIN_UNAVAILABLE",
    );
  }
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new ServiceError(
      "Email login is not configured.",
      503,
      "AUTH_EMAIL_NOT_CONFIGURED",
    );
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const challengeToken = randomBytes(32).toString("base64url");
  const challengeTokenHash = createHash("sha256")
    .update(challengeToken)
    .digest("hex");
  const codeHash = await bcrypt.hash(code, 12);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await AdminLoginChallenge.deleteMany({ email: adminEmail });
  await AdminLoginChallenge.create({
    email: adminEmail,
    challengeTokenHash,
    codeHash,
    expiresAt,
  });
  try {
    await sendEmail({ to: adminEmail, code, expiresAt });
  } catch (error) {
    await AdminLoginChallenge.deleteOne({ challengeTokenHash });
    throw error;
  }
  return challengeToken;
}

export async function startAdminPasswordLogin(email, password, sendEmail) {
  const adminEmail = configuredAdminEmail();
  const normalized = String(email ?? "")
    .trim()
    .toLowerCase();
  const admin = await findSoleAdmin();
  if (
    !admin ||
    !adminEmail ||
    normalized !== adminEmail ||
    !(await bcrypt.compare(String(password ?? ""), admin.password))
  ) {
    throw new ServiceError(
      "Invalid email or password.",
      401,
      "AUTH_INVALID_CREDENTIALS",
    );
  }
  return issueAdminOtp(sendEmail);
}

export async function startAdminGoogleLogin(admin, sendEmail) {
  if (!admin)
    throw new ServiceError(
      "Admin account not found.",
      404,
      "AUTH_ADMIN_NOT_FOUND",
    );
  return issueAdminOtp(sendEmail);
}

export async function verifyAdminOtp(challengeToken, submittedCode) {
  const challengeTokenHash = challengeToken
    ? createHash("sha256").update(String(challengeToken)).digest("hex")
    : "";
  const challenge = challengeTokenHash
    ? await AdminLoginChallenge.findOne({ challengeTokenHash })
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
    challengeTokenHash,
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
