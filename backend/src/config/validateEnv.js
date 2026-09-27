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
  if (missing.length) problems.push(`Missing required variables: ${missing.join(", ")}`);
  const env = process.env.NODE_ENV ?? "development";
  if (!["development", "production", "test"].includes(env)) problems.push("NODE_ENV must be development, test, or production");
  if (process.env.JWT_SECRET && Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32) problems.push("JWT_SECRET must be at least 32 bytes");
  if (process.env.ALLOWED_ORIGIN) {
    try {
      const origin = new URL(process.env.ALLOWED_ORIGIN);
      if (!["http:", "https:"].includes(origin.protocol) || origin.origin !== process.env.ALLOWED_ORIGIN) problems.push("ALLOWED_ORIGIN must be a bare http(s) origin with no path or trailing slash");
      if (env === "production" && origin.protocol !== "https:") problems.push("ALLOWED_ORIGIN must use HTTPS in production");
    } catch {
      problems.push("ALLOWED_ORIGIN must be a valid http(s) origin");
    }
  }
  if (process.env.LOG_LEVEL && !["error", "warn", "info", "http", "verbose", "debug", "silly"].includes(process.env.LOG_LEVEL)) problems.push("LOG_LEVEL is not a supported Winston level");
  if (env === "production") {
    for (const key of ["PORTFOLIO_SNAPSHOT_TOKEN", "VERCEL_DEPLOY_HOOK_URL"]) {
      if (!process.env[key]?.trim()) problems.push(`${key} is required in production`);
    }
    if (process.env.PORTFOLIO_SNAPSHOT_TOKEN && Buffer.byteLength(process.env.PORTFOLIO_SNAPSHOT_TOKEN, "utf8") < 32) problems.push("PORTFOLIO_SNAPSHOT_TOKEN must be at least 32 bytes");
  }
  if (problems.length) {
    console.error(`[startup] FATAL: Invalid environment configuration:\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
}
