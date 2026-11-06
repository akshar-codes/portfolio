const REQUIRED = [
  "MONGO_URI",
  "JWT_SECRET",
  "ALLOWED_ORIGIN",
  "CLOUD_NAME",
  "CLOUD_API_KEY",
  "CLOUD_API_SECRET",
];

export default function validateEnv() {
  const problems = [];
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length)
    problems.push(`Missing required variables: ${missing.join(", ")}`);
  const env = process.env.NODE_ENV ?? "development";
  if (!["development", "production", "test"].includes(env))
    problems.push("NODE_ENV must be development, test, or production");
  if (
    process.env.JWT_SECRET &&
    Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32
  )
    problems.push("JWT_SECRET must be at least 32 bytes");
  if (process.env.ALLOWED_ORIGIN) {
    try {
      const origin = new URL(process.env.ALLOWED_ORIGIN);
      if (
        !["http:", "https:"].includes(origin.protocol) ||
        origin.origin !== process.env.ALLOWED_ORIGIN
      )
        problems.push(
          "ALLOWED_ORIGIN must be a bare http(s) origin with no path or trailing slash",
        );
      if (env === "production" && origin.protocol !== "https:")
        problems.push("ALLOWED_ORIGIN must use HTTPS in production");
    } catch {
      problems.push("ALLOWED_ORIGIN must be a valid http(s) origin");
    }
  }
  if (
    process.env.LOG_LEVEL &&
    !["error", "warn", "info", "http", "verbose", "debug", "silly"].includes(
      process.env.LOG_LEVEL,
    )
  )
    problems.push("LOG_LEVEL is not a supported Winston level");
  if (
    Boolean(process.env.RESEND_API_KEY?.trim()) !==
    Boolean(process.env.RESEND_FROM_EMAIL?.trim())
  ) {
    problems.push(
      "RESEND_API_KEY and RESEND_FROM_EMAIL must either both be set or both be empty",
    );
  }
  const googleValues = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
  ].map((key) => Boolean(process.env[key]?.trim()));
  if (googleValues.some(Boolean) && !googleValues.every(Boolean))
    problems.push(
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL must either all be set or all be empty",
    );
  if (
    Boolean(process.env.GMAIL_USER?.trim()) !==
    Boolean(process.env.GMAIL_APP_PASSWORD?.trim())
  )
    problems.push(
      "GMAIL_USER and GMAIL_APP_PASSWORD must either both be set or both be empty",
    );
  const hasGmailSender = Boolean(
    process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim(),
  );
  const hasResendSender = Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
  );
  if (process.env.ADMIN_EMAIL?.trim() && !hasGmailSender && !hasResendSender)
    problems.push(
      "Configure either GMAIL_USER/GMAIL_APP_PASSWORD or RESEND_API_KEY/RESEND_FROM_EMAIL because admin sign-in always requires an email code",
    );
  if (
    (googleValues.every(Boolean) ||
      process.env.GMAIL_USER?.trim() ||
      process.env.ADMIN_EMAIL?.trim()) &&
    !process.env.ADMIN_EMAIL?.trim()
  )
    problems.push(
      "ADMIN_EMAIL is required to enable admin email or Google login",
    );
  if (
    process.env.ADMIN_EMAIL?.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.ADMIN_EMAIL.trim())
  )
    problems.push("ADMIN_EMAIL must be a valid email address");
  if (process.env.GOOGLE_CALLBACK_URL?.trim()) {
    try {
      const callback = new URL(process.env.GOOGLE_CALLBACK_URL);
      if (
        !["http:", "https:"].includes(callback.protocol) ||
        (env === "production" && callback.protocol !== "https:")
      )
        problems.push("GOOGLE_CALLBACK_URL must use HTTPS in production");
    } catch {
      problems.push("GOOGLE_CALLBACK_URL must be a valid URL");
    }
  }
  if (env === "production") {
    for (const key of ["PORTFOLIO_SNAPSHOT_TOKEN", "VERCEL_DEPLOY_HOOK_URL"]) {
      if (!process.env[key]?.trim())
        problems.push(`${key} is required in production`);
    }
    if (
      process.env.PORTFOLIO_SNAPSHOT_TOKEN &&
      Buffer.byteLength(process.env.PORTFOLIO_SNAPSHOT_TOKEN, "utf8") < 32
    )
      problems.push("PORTFOLIO_SNAPSHOT_TOKEN must be at least 32 bytes");
  }
  if (problems.length) {
    console.error(
      `[startup] FATAL: Invalid environment configuration:\n  ${problems.join("\n  ")}`,
    );
    process.exit(1);
  }
}
