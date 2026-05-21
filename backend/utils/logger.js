import { createLogger, format, transports } from "winston";

const { combine, timestamp, errors, json, colorize, printf } = format;

/* ------------------------------------------------------------------ *
 * Formats
 * ------------------------------------------------------------------ */

// Compact human-readable format used in development consoles
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const extras = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    return `${timestamp} ${level}: ${stack ?? message}${extras}`;
  }),
);

// Structured JSON format consumed by log aggregators in production
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const isDev = process.env.NODE_ENV !== "production";

/* ------------------------------------------------------------------ *
 * Logger instance
 * ------------------------------------------------------------------ */

const logger = createLogger({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  format: isDev ? devFormat : prodFormat,
  transports: [new transports.Console()],
  // Prevent winston from exiting on handled exceptions
  exitOnError: false,
});

// In production, also persist errors to a rotating file so they survive
// container restarts.  Only loaded when the module is available and we're
// not running in a purely ephemeral environment (e.g. Render free tier).
if (!isDev) {
  try {
    const { default: DailyRotateFile } =
      await import("winston-daily-rotate-file").catch(() => ({
        default: null,
      }));

    if (DailyRotateFile) {
      logger.add(
        new DailyRotateFile({
          filename: "logs/error-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          level: "error",
          maxFiles: "14d",
          zippedArchive: true,
        }),
      );
    }
  } catch {
    // winston-daily-rotate-file not installed — skip file transport silently
  }
}

/* ------------------------------------------------------------------ *
 * Morgan stream
 * morgan writes to stream.write(); we pipe it into winston at the
 * "http" level so all request logs flow through one system.
 * ------------------------------------------------------------------ */

export const morganStream = {
  write: (message) => logger.http(message.trimEnd()),
};

export default logger;
