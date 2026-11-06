const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

export function hasBrevoEmailConfig() {
  return Boolean(
    process.env.BREVO_API_KEY?.trim() &&
      process.env.BREVO_FROM_EMAIL?.trim(),
  );
}

export async function sendBrevoEmail({ to, subject, text, html }) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const fromEmail = process.env.BREVO_FROM_EMAIL?.trim();
  if (!apiKey || !fromEmail) {
    const error = new Error(
      "Set BREVO_API_KEY and BREVO_FROM_EMAIL to enable email delivery.",
    );
    error.code = "BREVO_NOT_CONFIGURED";
    throw error;
  }

  const body = {
    sender: {
      name: process.env.BREVO_FROM_NAME?.trim() || "Portfolio Admin",
      email: fromEmail,
    },
    to: [{ email: to }],
    subject,
  };
  if (text) body.textContent = text;
  if (html) body.htmlContent = html;

  const response = await fetch(BREVO_EMAIL_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      result.message || `Brevo returned HTTP ${response.status}`,
    );
    error.code = result.code || "BREVO_API_ERROR";
    error.responseCode = response.status;
    throw error;
  }
  return result;
}
