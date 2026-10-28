import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

/**
 * GET /api/health or /health
 * Website Monitor contract: { status, services: { frontend, backend, database } }
 */
router.get("/", async (_req, res) => {
  const startTime = Date.now();
  const frontendUrl =
    process.env.FRONTEND_URL || process.env.ALLOWED_ORIGIN || null;
  const backendUrl =
    process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || null;
  let databaseStatus = "down";

  try {
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const state = mongoose.connection.readyState;
    if (state === 1) {
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      databaseStatus = "up";
    } else if (state === 2) {
      databaseStatus = "degraded";
    }
  } catch {
    databaseStatus = "down";
  }

  const backendStatus = "up";
  const frontendStatus = "up";
  const isHealthy =
    frontendStatus === "up" &&
    backendStatus === "up" &&
    databaseStatus === "up";

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    services: {
      frontend: frontendStatus,
      backend: backendStatus,
      database: databaseStatus,
    },
    urls: {
      frontend: frontendUrl,
      backend: backendUrl,
    },
    details: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  });
});

export default router;
