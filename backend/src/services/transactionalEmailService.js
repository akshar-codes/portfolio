import axios from "axios";
import { ServiceError } from "./ServiceError.js";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

/** Send plain-text mail from the site's verified Resend sender. */
export async function sendTransactionalEmail({ to, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    throw new ServiceError(
      "Website email replies are not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
      503,
      "EMAIL_SENDING_NOT_CONFIGURED",
    );
  }

  try {
    const { data } = await axios.post(
      RESEND_EMAILS_URL,
      { from, to: [to], subject, text },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10_000,
      },
    );
    return { id: data.id };
  } catch {
    throw new ServiceError(
      "The email provider could not send the reply. Please try again.",
      502,
      "EMAIL_SEND_FAILED",
    );
  }
}
