import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;
const SHUTDOWN_TIMEOUT_MS = 10_000;

function shutdown(server, signal) {
  logger.info(`${signal} received — starting graceful shutdown`);

  const timer = setTimeout(() => {
    logger.error("Shutdown timeout exceeded — forcing exit", {
      timeoutMs: SHUTDOWN_TIMEOUT_MS,
    });
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  timer.unref();

  server.close(async (err) => {
    if (err) {
      logger.error("Error while closing HTTP server", { message: err.message });
      process.exit(1);
    }

    logger.info("HTTP server closed");

    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
    } catch (dbErr) {
      logger.error("Error while closing MongoDB connection", {
        message: dbErr.message,
      });
      process.exit(1);
    }

    logger.info("Graceful shutdown complete");
    process.exit(0);
  });
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info("Server running", {
      port: PORT,
      env: process.env.NODE_ENV ?? "development",
    });
  });

  process.on("SIGTERM", () => shutdown(server, "SIGTERM"));
  process.on("SIGINT", () => shutdown(server, "SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection — shutting down", {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    shutdown(server, "unhandledRejection");
  });
};

start().catch((err) => {
  logger.error("Failed to start server", {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});
