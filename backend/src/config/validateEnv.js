const REQUIRED = [
  "MONGO_URI",
  "JWT_SECRET",
  "ALLOWED_ORIGIN",
  "CLOUD_NAME",
  "CLOUD_API_KEY",
  "CLOUD_API_SECRET",
];

export default function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.error(
      `[startup] FATAL: Missing required environment variables:\n  ${missing.join("\n  ")}`,
    );
    process.exit(1);
  }
}
