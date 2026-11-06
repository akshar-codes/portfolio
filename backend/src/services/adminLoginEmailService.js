import nodemailer from "nodemailer";
import { ServiceError } from "./ServiceError.js";
import logger from "../utils/logger.js";

function otpEmailContent(code) {
  const text = [
    "ADMIN SIGN-IN",
    "",
    "Use this verification code to finish signing in to your portfolio admin dashboard:",
    "",
    code,
    "",
    "This code expires in 10 minutes and can only be used once.",
    "If you did not request this code, you can safely ignore this email.",
  ].join("\n");
  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#172033">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">Your one-time admin sign-in code expires in 10 minutes.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f9;padding:36px 14px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fff;border:1px solid #e6e9f0;border-radius:16px;overflow:hidden">
          <tr><td style="padding:28px 32px;background:#111827;color:#fff">
            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a5b4fc;font-weight:700">Portfolio Admin</div>
            <div style="font-size:24px;line-height:1.3;font-weight:700;margin-top:12px">Your sign-in code</div>
          </td></tr>
          <tr><td style="padding:32px">
            <p style="font-size:15px;line-height:1.6;margin:0 0 22px;color:#475569">Enter this one-time code to finish signing in to your admin dashboard.</p>
            <div style="padding:20px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;text-align:center;font-size:34px;line-height:1.2;letter-spacing:10px;font-weight:700;color:#111827;font-variant-numeric:tabular-nums">${code}</div>
            <p style="font-size:13px;line-height:1.6;margin:18px 0 0;color:#64748b">This code expires in <strong style="color:#334155">10 minutes</strong> and can only be used once.</p>
            <div style="height:1px;background:#e8ebf1;margin:24px 0"></div>
            <p style="font-size:13px;line-height:1.6;margin:0;color:#64748b">If you didn’t request this code, you can safely ignore this email. Never share your code with anyone.</p>
          </td></tr>
          <tr><td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e8ebf1;font-size:11px;line-height:1.5;color:#94a3b8">Automated security message from your portfolio admin dashboard.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
  return { text, html };
}

async function sendWithResend({ apiKey, from, to, code }) {
  const content = otpEmailContent(code);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your portfolio admin sign-in code",
      ...content,
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    const error = new Error(details.message || `Resend returned HTTP ${response.status}`);
    error.code = "RESEND_API_ERROR";
    error.responseCode = response.status;
    throw error;
  }
}

export async function sendAdminOtpEmail({ to, code }) {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (user && pass) {
    const content = otpEmailContent(code);
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      connectionTimeout: 8_000,
      greetingTimeout: 5_000,
      socketTimeout: 8_000,
      auth: { user, pass },
    });
    try {
      await transporter.sendMail({
        from: `Portfolio Admin <${user}>`,
        to,
        subject: "Your portfolio admin sign-in code",
        ...content,
      });
      return;
    } catch (error) {
      logger.error("Admin OTP email delivery failed", {
        provider: "gmail",
        code: error?.code,
        command: error?.command,
        responseCode: error?.responseCode,
        response: typeof error?.response === "string"
          ? error.response.slice(0, 300)
          : undefined,
      });
      throw new ServiceError(
        "Could not send the verification code. Please try again.",
        502,
        "AUTH_OTP_SEND_FAILED",
      );
    }
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.RESEND_FROM_EMAIL?.trim();
  if (resendKey && resendFrom) {
    try {
      await sendWithResend({ apiKey: resendKey, from: resendFrom, to, code });
      return;
    } catch (error) {
      logger.error("Admin OTP email delivery failed", {
        provider: "resend",
        code: error?.code,
        responseCode: error?.responseCode,
        message: error?.message?.slice(0, 300),
      });
      throw new ServiceError(
        "Could not send the verification code. Please try again.",
        502,
        "AUTH_OTP_SEND_FAILED",
      );
    }
  }

  throw new ServiceError(
    "Email login is not configured.",
    503,
    "AUTH_EMAIL_NOT_CONFIGURED",
  );
}
