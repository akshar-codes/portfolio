import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const status = dbConnected ? "ok" : "degraded";

  res.status(dbConnected ? 200 : 503).json({
    status,
    db: dbConnected ? "connected" : "disconnected",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
