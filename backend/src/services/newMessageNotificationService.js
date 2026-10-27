import Profile from "../models/Profile.js";
import logger from "../utils/logger.js";
import { sendTransactionalEmail } from "./transactionalEmailService.js";

const getNotificationEmail = async () => {
  const configured = process.env.MESSAGE_NOTIFICATION_EMAIL?.trim();
  if (configured) return configured;
  const profile = await Profile.findOne({ owner: "default" }).select("email").lean();
  return profile?.email?.trim() || "";
};

async function notifyByEmail(message) {
  const recipient = await getNotificationEmail();
  if (!recipient) {
    logger.warn("New-message email notification skipped: set MESSAGE_NOTIFICATION_EMAIL or a profile email.");
    return;
  }
  if (!process.env.RESEND_API_KEY?.trim() || !process.env.RESEND_FROM_EMAIL?.trim()) {
    logger.warn("New-message email notification skipped: Resend is not configured.");
    return;
  }

  const senderName = String(message.fullname || "Website visitor").replace(/[\r\n]+/g, " ");
  const text = [
    `New message from ${senderName}`,
    `Email: ${message.email}`,
    `Received: ${new Date(message.createdAt).toLocaleString("en-US", { timeZone: "UTC", timeZoneName: "short" })}`,
    "",
    message.message,
  ].join("\n");
  await sendTransactionalEmail({
    to: recipient,
    subject: `New portfolio message from ${senderName}`,
    text,
  });
}

/** Best-effort notifications run after the message has been persisted. */
export function notifyNewMessage(message) {
  void notifyByEmail(message).catch((error) => {
    logger.error("New-message email notification failed", {
      errorName: error.name,
      status: error.response?.status,
    });
  });
}
