import nodemailer from "nodemailer";
import { ServiceError } from "./ServiceError.js";

export async function sendAdminOtpEmail({ to, code }) {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) {
    throw new ServiceError(
      "Email login is not configured.",
      503,
      "AUTH_EMAIL_NOT_CONFIGURED",
    );
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  try {
    await transporter.sendMail({
      from: `Portfolio Admin <${user}>`,
      to,
      subject: "Your portfolio admin sign-in code",
      text: `Your sign-in code is ${code}. It expires in 10 minutes. If you did not request it, you can ignore this email.`,
    });
  } catch {
    throw new ServiceError(
      "Could not send the verification code. Please try again.",
      502,
      "AUTH_OTP_SEND_FAILED",
    );
  }
}
