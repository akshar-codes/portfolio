import { createLogger, format, transports } from "winston";

const { combine, timestamp, errors, json, colorize, printf } = format;

/* ------------------------------------------------------------------ *
 * Formats
 * ------------------------------------------------------------------ */

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const extras = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    return `${timestamp} ${level}: ${stack ?? message}${extras}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const isDev = process.env.NODE_ENV === "development";

/* ------------------------------------------------------------------ *
 * Logger instance
 * ------------------------------------------------------------------ */

const logger = createLogger({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  format: isDev ? devFormat : prodFormat,
  transports: [new transports.Console()],
  exitOnError: false,
});

if (!isDev) {
  (async () => {
    try {
      const mod = await import("winston-daily-rotate-file").catch(() => null);
      if (mod?.default) {
        logger.add(
          new mod.default({
            filename: "logs/error-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            maxFiles: "14d",
            zippedArchive: true,
          }),
        );
      }
    } catch {
      // winston-daily-rotate-file not available — skip file transport silently
    }
  })();
}

/* ------------------------------------------------------------------ *
 * Morgan stream
 * ------------------------------------------------------------------ */

export const morganStream = {
  write: (message) => logger.http(message.trimEnd()),
};

export default logger;
