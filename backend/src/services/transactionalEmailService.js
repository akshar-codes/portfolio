import { ServiceError } from "./ServiceError.js";
import {
  hasBrevoEmailConfig,
  sendBrevoEmail,
} from "./brevoEmailService.js";

/** Send plain-text mail through the configured Brevo sender. */
export async function sendTransactionalEmail({ to, subject, text }) {
  if (!hasBrevoEmailConfig()) {
    throw new ServiceError(
      "Website email is not configured. Set BREVO_API_KEY and BREVO_FROM_EMAIL.",
      503,
      "EMAIL_SENDING_NOT_CONFIGURED",
    );
  }

  try {
    const result = await sendBrevoEmail({ to, subject, text });
    return { id: result.messageId };
  } catch {
    throw new ServiceError(
      "The email provider could not send the reply. Please try again.",
      502,
      "EMAIL_SEND_FAILED",
    );
  }
}
